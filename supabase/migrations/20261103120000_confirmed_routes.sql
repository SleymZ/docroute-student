-- One confirmed route per account ("My route").
-- The person presses "Confirm this route" on a route page; the page address
-- (path + answers, never personal data beyond those answers) is stored so
-- /my-route can reopen it later. Only the owner can read or change the row.
-- Account deletion removes it through the foreign key (on delete cascade).

create table if not exists public.confirmed_routes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  route_path text not null,
  route_key text,
  title text not null,
  purpose text not null,
  country_code text not null,
  step_ids text[] not null default '{}',
  confirmed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint confirmed_routes_path_format
    check (
      char_length(route_path) between 8 and 2000
      and route_path like '/route/%'
      and position('//' in route_path) = 0
      and position(E'\\' in route_path) = 0
      and route_path !~ '[[:space:]]'
    ),
  constraint confirmed_routes_key_length
    check (route_key is null or char_length(route_key) between 1 and 240),
  constraint confirmed_routes_title_length
    check (char_length(title) between 1 and 160),
  constraint confirmed_routes_purpose
    check (purpose in ('study', 'work', 'family', 'business')),
  constraint confirmed_routes_country
    check (country_code ~ '^[A-Z]{2}$'),
  constraint confirmed_routes_step_ids
    check (
      coalesce(array_length(step_ids, 1), 0) <= 500
      and char_length(array_to_string(step_ids, ',')) <= 40000
    )
);

alter table public.confirmed_routes enable row level security;

revoke all on table public.confirmed_routes from anon;
revoke all on table public.confirmed_routes from authenticated;
grant select, delete on table public.confirmed_routes to authenticated;
grant insert (user_id, route_path, route_key, title, purpose, country_code, step_ids)
  on table public.confirmed_routes to authenticated;
grant update (user_id, route_path, route_key, title, purpose, country_code, step_ids)
  on table public.confirmed_routes to authenticated;

drop policy if exists "Users can read their confirmed route" on public.confirmed_routes;
create policy "Users can read their confirmed route"
  on public.confirmed_routes for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can confirm a route" on public.confirmed_routes;
create policy "Users can confirm a route"
  on public.confirmed_routes for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can change their confirmed route" on public.confirmed_routes;
create policy "Users can change their confirmed route"
  on public.confirmed_routes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their confirmed route" on public.confirmed_routes;
create policy "Users can remove their confirmed route"
  on public.confirmed_routes for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Dates are set by the database, not by the browser: confirmed_at changes
-- only when a different route replaces the confirmed one (other answers in
-- the address), not when the same route is saved again with a new move date
-- or a new checklist version (progress key).
create or replace function public.confirmed_routes_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if regexp_replace(regexp_replace(new.route_path, '([?&])move=[^&]*&?', '\1'), '[?&]$', '')
        is distinct from
        regexp_replace(regexp_replace(old.route_path, '([?&])move=[^&]*&?', '\1'), '[?&]$', '') then
    new.confirmed_at := now();
  else
    new.confirmed_at := old.confirmed_at;
  end if;
  return new;
end;
$$;

drop trigger if exists confirmed_routes_touch on public.confirmed_routes;
create trigger confirmed_routes_touch
  before update on public.confirmed_routes
  for each row execute function public.confirmed_routes_touch();

notify pgrst, 'reload schema';
