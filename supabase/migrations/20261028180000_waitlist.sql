-- Waitlist for the full route ("I want the full route").
-- Visitors (signed in or not) may only ADD a row. Nobody can read, change
-- or delete rows through the API: there is no select/update/delete policy
-- and no such grant. The operator reads the list in the Supabase dashboard,
-- which bypasses RLS. Safe to run more than once.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  route text not null,
  consent_version text not null,
  consented_at timestamptz not null default now()
);

-- Old constraints first (if an earlier version exists), then add.
alter table public.waitlist_signups drop constraint if exists waitlist_signups_email_check;
alter table public.waitlist_signups drop constraint if exists waitlist_signups_route_check;
alter table public.waitlist_signups drop constraint if exists waitlist_signups_consent_version_check;
alter table public.waitlist_signups drop constraint if exists waitlist_signups_email_route_key;

update public.waitlist_signups set email = lower(btrim(email)) where email <> lower(btrim(email));

alter table public.waitlist_signups
  add constraint waitlist_signups_email_check check (
    char_length(email) <= 254
    and email = lower(btrim(email))
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) not valid;
alter table public.waitlist_signups
  add constraint waitlist_signups_route_check check (
    route in ('study-sk', 'study-cz', 'work-sk', 'work-cz')
  ) not valid;
alter table public.waitlist_signups
  add constraint waitlist_signups_consent_version_check check (
    consent_version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  ) not valid;
-- One row per email and route; a repeat signup is reported as success.
alter table public.waitlist_signups
  add constraint waitlist_signups_email_route_key unique (email, route);

alter table public.waitlist_signups enable row level security;

revoke all on table public.waitlist_signups from public, anon, authenticated;
grant insert (email, route, consent_version) on table public.waitlist_signups to anon, authenticated;

drop policy if exists "Anyone can join the waitlist" on public.waitlist_signups;
create policy "Anyone can join the waitlist"
  on public.waitlist_signups
  for insert
  to anon, authenticated
  with check (true);

-- Withdrawing consent (GDPR Art. 7(3)): anyone can remove an email from
-- the list. It never says whether the email was listed.
drop function if exists public.leave_waitlist(text);

create function public.leave_waitlist(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.waitlist_signups
  where email = lower(btrim(coalesce(p_email, '')));
end;
$$;

revoke all on function public.leave_waitlist(text) from public;
grant execute on function public.leave_waitlist(text) to anon, authenticated;

-- Deleting an account also removes waitlist rows with the account's email.
-- Full definition, so this also works if 20261028150000 was not run yet.
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
