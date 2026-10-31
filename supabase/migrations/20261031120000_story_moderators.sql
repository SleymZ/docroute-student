-- Story moderators: chosen accounts review stories on the site
-- (/stories/review) instead of the Supabase dashboard.
--
-- * story_moderators: one row per moderator account. No one can read or
--   change it through the API; the owner adds rows in the SQL editor:
--     insert into public.story_moderators (user_id)
--     select id from auth.users where lower(email) = '<email>'
--     on conflict do nothing;
-- * is_story_moderator(): true for a signed-in moderator, false otherwise.
-- * Moderators see every story (pending, published, hidden), may delete any
--   story (spam) and change its status through moderate_story().
-- * Authors still see, edit and delete only their own stories; an edit sends
--   the story back to "pending" (trigger from 20261030130000).
-- Safe to re-run.

create table if not exists public.story_moderators (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

alter table public.story_moderators enable row level security;
revoke all on table public.story_moderators from public, anon, authenticated;

create or replace function public.is_story_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.story_moderators m where m.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_story_moderator() from public;
grant execute on function public.is_story_moderator() to anon, authenticated;

drop policy if exists "Moderators see all stories" on public.success_stories;
create policy "Moderators see all stories"
  on public.success_stories for select
  to authenticated
  using ((select public.is_story_moderator()));

drop policy if exists "Moderators delete stories" on public.success_stories;
create policy "Moderators delete stories"
  on public.success_stories for delete
  to authenticated
  using ((select public.is_story_moderator()));

-- Publishing or hiding runs as the function owner, so the moderation trigger
-- does not reset the status to "pending".
create or replace function public.moderate_story(p_story_id uuid, p_status text)
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

  update public.success_stories
  set status = p_status,
      published_at = case when p_status = 'published' then coalesce(published_at, now()) end
  where id = p_story_id;

  if not found then
    raise exception 'Story not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.moderate_story(uuid, text) from public;
revoke all on function public.moderate_story(uuid, text) from anon;
grant execute on function public.moderate_story(uuid, text) to authenticated;

notify pgrst, 'reload schema';
