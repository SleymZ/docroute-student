-- Account plans: Free (default, no row) and Plus (see docs/ACCESS.md).
-- There is no payment yet: the owner grants Plus by SQL (beta testers) until
-- the paid route ships. People can read their own plan and nothing else;
-- only the owner (SQL editor / service role) can write rows.
-- Account deletion removes the row through the foreign key (on delete cascade).

create table if not exists public.account_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  plus_until timestamptz,
  source text not null default 'manual',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_plans_plan check (plan in ('free', 'plus')),
  constraint account_plans_source check (source in ('manual', 'beta', 'payment')),
  constraint account_plans_note_length check (note is null or char_length(note) <= 200)
);

alter table public.account_plans enable row level security;

revoke all on table public.account_plans from anon;
revoke all on table public.account_plans from authenticated;
grant select on table public.account_plans to authenticated;

drop policy if exists "Users can read their plan" on public.account_plans;
create policy "Users can read their plan"
  on public.account_plans for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.account_plans_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists account_plans_touch on public.account_plans;
create trigger account_plans_touch
  before update on public.account_plans
  for each row execute function public.account_plans_touch();

-- True when the signed-in person has an active Plus plan. Used by RLS below;
-- security definer so it works for any caller, and it only ever looks at
-- the caller's own row.
create or replace function public.has_plus()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.account_plans p
    where p.user_id = (select auth.uid())
      and p.plan = 'plus'
      and (p.plus_until is null or p.plus_until > now())
  );
$$;

revoke all on function public.has_plus() from public;
revoke all on function public.has_plus() from anon;
grant execute on function public.has_plus() to authenticated;

-- Saving a route to "My route" is a Plus feature. People who confirmed a
-- route before this change can still read and remove it.
drop policy if exists "Users can confirm a route" on public.confirmed_routes;
create policy "Users can confirm a route"
  on public.confirmed_routes for insert to authenticated
  with check ((select auth.uid()) = user_id and (select public.has_plus()));

drop policy if exists "Users can change their confirmed route" on public.confirmed_routes;
create policy "Users can change their confirmed route"
  on public.confirmed_routes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and (select public.has_plus()));
