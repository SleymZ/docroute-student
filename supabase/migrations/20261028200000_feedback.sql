-- Feedback form ("How useful was this?"). Like the waitlist: visitors may
-- only ADD a row; nobody can read, change or delete rows through the API.
-- The operator reads feedback in the Supabase dashboard. Safe to re-run.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  route text,
  rating smallint,
  message text,
  created_at timestamptz not null default now()
);

alter table public.feedback drop constraint if exists feedback_page_check;
alter table public.feedback drop constraint if exists feedback_route_check;
alter table public.feedback drop constraint if exists feedback_rating_check;
alter table public.feedback drop constraint if exists feedback_message_check;
alter table public.feedback drop constraint if exists feedback_not_empty_check;

update public.feedback set message = nullif(btrim(message), '') where message is not null;

alter table public.feedback
  add constraint feedback_page_check check (
    char_length(page) between 1 and 200 and page like '/%' and position('?' in page) = 0
  ) not valid;
alter table public.feedback
  add constraint feedback_route_check check (
    route is null or route in ('study-sk', 'study-cz', 'work-sk', 'work-cz')
  ) not valid;
alter table public.feedback
  add constraint feedback_rating_check check (rating is null or rating between 1 and 5) not valid;
alter table public.feedback
  add constraint feedback_message_check check (
    message is null or char_length(message) between 1 and 2000
  ) not valid;
alter table public.feedback
  add constraint feedback_not_empty_check check (rating is not null or message is not null) not valid;

alter table public.feedback enable row level security;

revoke all on table public.feedback from public, anon, authenticated;
grant insert (page, route, rating, message) on table public.feedback to anon, authenticated;

drop policy if exists "Anyone can send feedback" on public.feedback;
create policy "Anyone can send feedback"
  on public.feedback
  for insert
  to anon, authenticated
  with check (true);
