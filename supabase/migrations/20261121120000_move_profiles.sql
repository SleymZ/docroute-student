-- Move profile: the answers of the country match quiz (/account/match), one
-- row per account. The site works out the three suggested EU countries from
-- these answers each time the page opens, so only the answers are kept.
-- `purpose` repeats answers.purpose so the owner can count purposes in SQL.
-- Only the owner of the row can read or change it. Account deletion removes
-- it through the foreign key (on delete cascade).

create table if not exists public.move_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  purpose text not null,
  answers jsonb not null,
  answers_version smallint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint move_profiles_purpose
    check (purpose in ('study', 'work', 'family', 'business')),
  constraint move_profiles_answers_object
    check (jsonb_typeof(answers) = 'object'),
  constraint move_profiles_answers_purpose
    check (answers ->> 'purpose' = purpose),
  constraint move_profiles_answers_size
    check (octet_length(answers::text) <= 8000),
  constraint move_profiles_answers_version
    check (answers_version between 1 and 100)
);

alter table public.move_profiles enable row level security;

revoke all on table public.move_profiles from anon;
revoke all on table public.move_profiles from authenticated;
grant select, delete on table public.move_profiles to authenticated;
grant insert (user_id, purpose, answers, answers_version)
  on table public.move_profiles to authenticated;
grant update (user_id, purpose, answers, answers_version)
  on table public.move_profiles to authenticated;

drop policy if exists "Users can read their move profile" on public.move_profiles;
create policy "Users can read their move profile"
  on public.move_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their move profile" on public.move_profiles;
create policy "Users can create their move profile"
  on public.move_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can change their move profile" on public.move_profiles;
create policy "Users can change their move profile"
  on public.move_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their move profile" on public.move_profiles;
create policy "Users can remove their move profile"
  on public.move_profiles for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Dates are set by the database, not by the browser.
create or replace function public.move_profiles_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists move_profiles_touch on public.move_profiles;
create trigger move_profiles_touch
  before update on public.move_profiles
  for each row execute function public.move_profiles_touch();

notify pgrst, 'reload schema';
