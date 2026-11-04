-- Photos, comments and likes for moving stories.
--
-- * story_photos: up to 4 photos per story, uploaded by its author into the
--   private bucket "story-photos" as "<user id>/<story id>/photo-<ms>.webp".
--   A photo is shown only where its story is visible (published, own, or to
--   a moderator), so photos are reviewed together with the story: adding or
--   removing a photo sends the author's story back to "pending".
-- * story_comments: signed-in people with a public profile comment on
--   published stories. Every comment starts as "pending" and appears after a
--   moderator publishes it (moderate_comment). Authors and moderators may
--   delete comments; nobody edits them.
-- * story_likes: one like per account and published story. Who liked what is
--   private; story_engagement() returns only the counts.
-- * Everything is removed with the story or the account (foreign keys with
--   cascade). Storage files are removed by the app first, as for avatars.
-- Safe to re-run.

-- ------------------------------------------------------------------ photos
create table if not exists public.story_photos (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.success_stories (id) on delete cascade,
  user_id uuid not null references public.public_profiles (user_id) on delete cascade,
  path text not null unique,
  created_at timestamptz not null default now()
);

alter table public.story_photos drop constraint if exists story_photos_path_check;
alter table public.story_photos
  add constraint story_photos_path_check check (
    path like (user_id::text || '/' || story_id::text || '/%')
    and path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/photo-[0-9]{10,16}\.(webp|jpg)$'
  );

create index if not exists story_photos_story_idx on public.story_photos (story_id, created_at);
create index if not exists story_photos_user_idx on public.story_photos (user_id);

-- At most 4 photos per story. The story row is locked first, so two uploads
-- sent at the same moment wait for each other.
create or replace function public.story_photos_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform 1 from public.success_stories s where s.id = new.story_id for update;
  if (select count(*) from public.story_photos p where p.story_id = new.story_id) >= 4 then
    raise exception 'Photo limit reached' using errcode = '23514';
  end if;
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists story_photos_limit on public.story_photos;
create trigger story_photos_limit
  before insert on public.story_photos
  for each row execute function public.story_photos_limit();

-- When the author adds or removes a photo, the story goes back to review
-- and gets a new updated_at, also when it is already pending: a moderator
-- who loaded the older version cannot publish it (moderate_story compares
-- updated_at). Runs as the function owner because authors cannot write the
-- status column; a moderator removing a photo from someone else's story does
-- not unpublish it.
create or replace function public.story_photos_back_to_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  photo public.story_photos;
begin
  if tg_op = 'DELETE' then
    photo := old;
  else
    photo := new;
  end if;
  if (select auth.uid()) is not null and photo.user_id = (select auth.uid()) then
    update public.success_stories
    set status = 'pending',
        published_at = null,
        updated_at = now()
    where id = photo.story_id;
  end if;
  return null;
end;
$$;

revoke all on function public.story_photos_back_to_review() from public, anon, authenticated;

drop trigger if exists story_photos_back_to_review on public.story_photos;
create trigger story_photos_back_to_review
  after insert or delete on public.story_photos
  for each row execute function public.story_photos_back_to_review();

alter table public.story_photos enable row level security;

revoke all on table public.story_photos from public, anon, authenticated;
grant select on table public.story_photos to anon, authenticated;
grant insert (story_id, user_id, path) on table public.story_photos to authenticated;
grant delete on table public.story_photos to authenticated;

-- Visible exactly where the story is visible (the stories table's own RLS
-- applies inside the subquery).
drop policy if exists "Photos follow their story" on public.story_photos;
create policy "Photos follow their story"
  on public.story_photos for select
  to anon, authenticated
  using (exists (select 1 from public.success_stories s where s.id = story_id));

drop policy if exists "Own photo insert" on public.story_photos;
create policy "Own photo insert"
  on public.story_photos for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.success_stories s
      where s.id = story_id and s.user_id = (select auth.uid())
    )
  );

drop policy if exists "Own or moderated photo delete" on public.story_photos;
create policy "Own or moderated photo delete"
  on public.story_photos for delete
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_story_moderator()));

-- ---------------------------------------------------------------- comments
create table if not exists public.story_comments (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.success_stories (id) on delete cascade,
  user_id uuid not null references public.public_profiles (user_id) on delete cascade,
  body text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.story_comments drop constraint if exists story_comments_body_check;
alter table public.story_comments drop constraint if exists story_comments_status_check;
alter table public.story_comments
  add constraint story_comments_body_check check (char_length(btrim(body)) between 2 and 1000);
alter table public.story_comments
  add constraint story_comments_status_check check (status in ('pending', 'published', 'hidden'));

create index if not exists story_comments_story_idx
  on public.story_comments (story_id, created_at) where status = 'published';
create index if not exists story_comments_status_idx on public.story_comments (status, created_at);
create index if not exists story_comments_user_idx on public.story_comments (user_id);

-- Every comment written through the API starts as pending, and one account
-- can have at most 10 comments waiting for review (spam limit).
create or replace function public.story_comments_moderation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    perform 1 from public.public_profiles p where p.user_id = new.user_id for update;
    if (
      select count(*) from public.story_comments c
      where c.user_id = new.user_id and c.status = 'pending'
    ) >= 10 then
      raise exception 'Comment limit reached' using errcode = '23514';
    end if;
    new.status := 'pending';
    new.published_at := null;
    new.created_at := now();
  elsif new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists story_comments_moderation on public.story_comments;
create trigger story_comments_moderation
  before insert on public.story_comments
  for each row execute function public.story_comments_moderation();

alter table public.story_comments enable row level security;

revoke all on table public.story_comments from public, anon, authenticated;
grant select on table public.story_comments to anon, authenticated;
grant insert (story_id, user_id, body) on table public.story_comments to authenticated;
grant delete on table public.story_comments to authenticated;

drop policy if exists "Published comments are public" on public.story_comments;
create policy "Published comments are public"
  on public.story_comments for select
  to anon, authenticated
  using (
    (status = 'published' and exists (select 1 from public.success_stories s where s.id = story_id))
    or user_id = (select auth.uid())
  );

drop policy if exists "Moderators see all comments" on public.story_comments;
create policy "Moderators see all comments"
  on public.story_comments for select
  to authenticated
  using ((select public.is_story_moderator()));

drop policy if exists "Comment on published stories" on public.story_comments;
create policy "Comment on published stories"
  on public.story_comments for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.success_stories s
      where s.id = story_id and s.status = 'published'
    )
  );

drop policy if exists "Own or moderated comment delete" on public.story_comments;
create policy "Own or moderated comment delete"
  on public.story_comments for delete
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_story_moderator()));

create or replace function public.moderate_comment(p_comment_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_story_moderator() then
    raise exception 'Not a story moderator' using errcode = '42501';
  end if;
  if p_status not in ('pending', 'published', 'hidden') then
    raise exception 'Unknown status' using errcode = '22023';
  end if;

  update public.story_comments
  set status = p_status,
      published_at = case when p_status = 'published' then coalesce(published_at, now()) end
  where id = p_comment_id;

  if not found then
    raise exception 'Comment not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.moderate_comment(uuid, text) from public, anon;
grant execute on function public.moderate_comment(uuid, text) to authenticated;

-- ------------------------------------------------------------------- likes
create table if not exists public.story_likes (
  story_id uuid not null references public.success_stories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

create index if not exists story_likes_user_idx on public.story_likes (user_id);

alter table public.story_likes enable row level security;

revoke all on table public.story_likes from public, anon, authenticated;
grant select, delete on table public.story_likes to authenticated;
grant insert (story_id, user_id) on table public.story_likes to authenticated;

drop policy if exists "Own likes" on public.story_likes;
create policy "Own likes"
  on public.story_likes for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Like published stories" on public.story_likes;
create policy "Like published stories"
  on public.story_likes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.success_stories s
      where s.id = story_id and s.status = 'published'
    )
  );

drop policy if exists "Own like delete" on public.story_likes;
create policy "Own like delete"
  on public.story_likes for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Like and published-comment counts for up to 100 published stories.
create or replace function public.story_engagement(p_story_ids uuid[])
returns table (story_id uuid, likes bigint, comments bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.id,
    (select count(*) from public.story_likes l where l.story_id = s.id),
    (select count(*) from public.story_comments c where c.story_id = s.id and c.status = 'published')
  from public.success_stories s
  where s.id = any (p_story_ids)
    and s.status = 'published'
    and cardinality(p_story_ids) <= 100;
$$;

revoke all on function public.story_engagement(uuid[]) from public;
grant execute on function public.story_engagement(uuid[]) to anon, authenticated;

-- ------------------------------------------------------- photo file storage
-- Private bucket: files are read through short-lived signed URLs, which the
-- select policy allows only for photos whose story the reader may see.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('story-photos', 'story-photos', false, 2097152, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- A path that is already registered as a photo can never be uploaded again,
-- so a reviewed photo cannot be swapped for other bytes (delete the file,
-- re-upload under the same name). New photos always get a new path. There is
-- no update policy, so files are never overwritten in place either.
drop policy if exists "Story photo upload own folder" on storage.objects;
create policy "Story photo upload own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'story-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (select 1 from public.story_photos p where p.path = name)
  );

drop policy if exists "Story photo read" on storage.objects;
create policy "Story photo read"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'story-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (select 1 from public.story_photos p where p.path = name)
    )
  );

drop policy if exists "Story photo delete own or moderated" on storage.objects;
create policy "Story photo delete own or moderated"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'story-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_story_moderator())
    )
  );

notify pgrst, 'reload schema';
