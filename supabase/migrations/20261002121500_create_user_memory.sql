create table if not exists public.saved_universities (
  user_id uuid not null references auth.users(id) on delete cascade,
  university_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, university_id),
  constraint saved_universities_id_length
    check (char_length(university_id) between 1 and 120)
);

create table if not exists public.route_task_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  route_key text not null,
  task_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, route_key, task_id),
  constraint route_task_progress_route_key_length
    check (char_length(route_key) between 1 and 240),
  constraint route_task_progress_task_id_length
    check (char_length(task_id) between 1 and 160)
);

alter table public.saved_universities enable row level security;
alter table public.route_task_progress enable row level security;

revoke all on table public.saved_universities from anon;
revoke all on table public.route_task_progress from anon;

grant select, insert, delete on table public.saved_universities to authenticated;
grant select, insert, delete on table public.route_task_progress to authenticated;

drop policy if exists "Users can read their saved universities"
  on public.saved_universities;
create policy "Users can read their saved universities"
  on public.saved_universities
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can save universities"
  on public.saved_universities;
create policy "Users can save universities"
  on public.saved_universities
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their saved universities"
  on public.saved_universities;
create policy "Users can remove their saved universities"
  on public.saved_universities
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their route progress"
  on public.route_task_progress;
create policy "Users can read their route progress"
  on public.route_task_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can complete route tasks"
  on public.route_task_progress;
create policy "Users can complete route tasks"
  on public.route_task_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can reopen route tasks"
  on public.route_task_progress;
create policy "Users can reopen route tasks"
  on public.route_task_progress
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
