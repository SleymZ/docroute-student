-- Public profiles (display name, avatar, short bio) and moving stories.
--
-- * public_profiles: one row per account, readable by everyone. It holds only
--   what the person chose to show; the email is never copied here.
-- * success_stories: written by signed-in people about a move made with
--   DocRoute. A new or edited story is "pending" until the operator sets it
--   to "published" in the Supabase dashboard (pre-moderation). Everyone sees
--   published stories; authors also see their own pending/hidden ones.
-- * Storage bucket "avatars": public images, each account may only write
--   inside its own folder "<user id>/".
-- Safe to re-run.

-- ---------------------------------------------------------------- profiles
create table if not exists public.public_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  bio text,
  avatar_path text,
  updated_at timestamptz not null default now()
);

alter table public.public_profiles drop constraint if exists public_profiles_name_check;
alter table public.public_profiles drop constraint if exists public_profiles_bio_check;
alter table public.public_profiles drop constraint if exists public_profiles_avatar_check;

alter table public.public_profiles
  add constraint public_profiles_name_check check (
    char_length(btrim(display_name)) between 2 and 40
    and display_name !~ '[<>@]'
  );
alter table public.public_profiles
  add constraint public_profiles_bio_check check (
    bio is null or char_length(bio) between 1 and 280
  );
-- The avatar must sit in the owner's own folder of the avatars bucket.
alter table public.public_profiles
  add constraint public_profiles_avatar_check check (
    avatar_path is null
    or (
      avatar_path like (user_id::text || '/%')
      and avatar_path ~ '^[0-9a-f-]{36}/avatar-[0-9]{10,16}\.(webp|jpg|png)$'
    )
  );

alter table public.public_profiles enable row level security;

revoke all on table public.public_profiles from public, anon, authenticated;
grant select on table public.public_profiles to anon, authenticated;
grant insert (user_id, display_name, bio, avatar_path) on table public.public_profiles to authenticated;
grant update (display_name, bio, avatar_path, updated_at) on table public.public_profiles to authenticated;
grant delete on table public.public_profiles to authenticated;

drop policy if exists "Profiles are public" on public.public_profiles;
create policy "Profiles are public"
  on public.public_profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Own profile insert" on public.public_profiles;
create policy "Own profile insert"
  on public.public_profiles for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Own profile update" on public.public_profiles;
create policy "Own profile update"
  on public.public_profiles for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Own profile delete" on public.public_profiles;
create policy "Own profile delete"
  on public.public_profiles for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------- stories
create table if not exists public.success_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.public_profiles (user_id) on delete cascade,
  title text not null,
  body text not null,
  purpose text not null,
  from_country_code text not null,
  to_country_code text not null,
  moved_year smallint not null,
  university text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.success_stories drop constraint if exists success_stories_title_check;
alter table public.success_stories drop constraint if exists success_stories_body_check;
alter table public.success_stories drop constraint if exists success_stories_purpose_check;
alter table public.success_stories drop constraint if exists success_stories_countries_check;
alter table public.success_stories drop constraint if exists success_stories_year_check;
alter table public.success_stories drop constraint if exists success_stories_university_check;
alter table public.success_stories drop constraint if exists success_stories_status_check;

alter table public.success_stories
  add constraint success_stories_title_check check (char_length(btrim(title)) between 5 and 100);
alter table public.success_stories
  add constraint success_stories_body_check check (char_length(btrim(body)) between 80 and 4000);
alter table public.success_stories
  add constraint success_stories_purpose_check check (purpose in ('study', 'work', 'family', 'business'));
alter table public.success_stories
  add constraint success_stories_countries_check check (
    from_country_code ~ '^[A-Z]{2}$' and to_country_code ~ '^[A-Z]{2}$'
  );
alter table public.success_stories
  add constraint success_stories_year_check check (moved_year between 2020 and 2035);
alter table public.success_stories
  add constraint success_stories_university_check check (
    university is null or char_length(btrim(university)) between 2 and 120
  );
alter table public.success_stories
  add constraint success_stories_status_check check (status in ('pending', 'published', 'hidden'));

create index if not exists success_stories_published_idx
  on public.success_stories (published_at desc) where status = 'published';
create index if not exists success_stories_user_idx on public.success_stories (user_id);

-- Authors can never publish their own story: every insert starts as pending
-- and every edit by the author sends the story back to moderation. The
-- operator (dashboard, service role) changes status freely.
create or replace function public.success_stories_moderation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      -- at most 5 stories per account, to limit spam
      if (select count(*) from public.success_stories s where s.user_id = new.user_id) >= 5 then
        raise exception 'Story limit reached' using errcode = '23514';
      end if;
      new.status := 'pending';
      new.published_at := null;
      new.created_at := now();
    else
      new.status := 'pending';
      new.published_at := null;
      new.created_at := old.created_at;
      new.user_id := old.user_id;
    end if;
  elsif new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists success_stories_moderation on public.success_stories;
create trigger success_stories_moderation
  before insert or update on public.success_stories
  for each row execute function public.success_stories_moderation();

alter table public.success_stories enable row level security;

revoke all on table public.success_stories from public, anon, authenticated;
grant select on table public.success_stories to anon, authenticated;
grant insert (user_id, title, body, purpose, from_country_code, to_country_code, moved_year, university)
  on table public.success_stories to authenticated;
grant update (title, body, purpose, from_country_code, to_country_code, moved_year, university)
  on table public.success_stories to authenticated;
grant delete on table public.success_stories to authenticated;

drop policy if exists "Published stories are public" on public.success_stories;
create policy "Published stories are public"
  on public.success_stories for select
  to anon, authenticated
  using (status = 'published' or user_id = (select auth.uid()));

drop policy if exists "Own story insert" on public.success_stories;
create policy "Own story insert"
  on public.success_stories for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Own story update" on public.success_stories;
create policy "Own story update"
  on public.success_stories for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Own story delete" on public.success_stories;
create policy "Own story delete"
  on public.success_stories for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ------------------------------------------------------------------ avatars
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatar upload own folder" on storage.objects;
create policy "Avatar upload own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Avatar update own folder" on storage.objects;
create policy "Avatar update own folder"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Avatar delete own folder" on storage.objects;
create policy "Avatar delete own folder"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Owners list their own folder (to remove old files); public reads go
-- through the public bucket URL and need no policy.
drop policy if exists "Avatar list own folder" on storage.objects;
create policy "Avatar list own folder"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- --------------------------------------------------------- account deletion
-- Stories go with the profile (cascade) and the profile with the account.
-- Avatar files are removed by the app through the Storage API before this
-- function is called (Supabase does not allow deleting storage rows in SQL).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
begin
  if current_user_id is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  select lower(btrim(email)) into current_email
  from auth.users
  where id = current_user_id;

  delete from public.success_stories where user_id = current_user_id;
  delete from public.public_profiles where user_id = current_user_id;
  delete from public.route_task_progress where user_id = current_user_id;
  delete from public.saved_universities where user_id = current_user_id;
  delete from public.applicant_profiles where user_id = current_user_id;
  if current_email is not null then
    delete from public.waitlist_signups where email = current_email;
  end if;
  delete from auth.users where id = current_user_id;
end;
$$;

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;

notify pgrst, 'reload schema';
