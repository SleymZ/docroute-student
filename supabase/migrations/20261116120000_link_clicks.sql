-- Click counter for our own short links (/go/tt-ru, /go/ig-en-03 ...).
-- One row per link code and day with a total. Nothing about the visitor is
-- stored: no IP, no cookie, no time of day. Visitors can only add 1 through
-- count_link_click(); nobody can read or change rows through the API. The
-- owner reads the totals in the Supabase SQL editor. Safe to run more than once.

create table if not exists public.link_clicks (
  code text not null,
  day date not null default ((now() at time zone 'utc')::date),
  clicks integer not null default 0,
  primary key (code, day)
);

alter table public.link_clicks drop constraint if exists link_clicks_code_check;
alter table public.link_clicks drop constraint if exists link_clicks_clicks_check;
-- Same pattern as SHORT_LINK_PATTERN in src/lib/short-links.ts.
alter table public.link_clicks
  add constraint link_clicks_code_check check (
    code ~ '^(tt|ig|yt|tg|rd|fb|th|wa|x|li|qr|mail)-(en|ru|es|zh|hi)(-[0-9]{2})?$'
  );
alter table public.link_clicks
  add constraint link_clicks_clicks_check check (clicks >= 0);

alter table public.link_clicks enable row level security;
revoke all on table public.link_clicks from public, anon, authenticated;

create or replace function public.count_link_click(p_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_code is null
    or p_code !~ '^(tt|ig|yt|tg|rd|fb|th|wa|x|li|qr|mail)-(en|ru|es|zh|hi)(-[0-9]{2})?$' then
    return;
  end if;
  insert into public.link_clicks as lc (code, day, clicks)
  values (p_code, (now() at time zone 'utc')::date, 1)
  on conflict (code, day) do update set clicks = lc.clicks + 1;
end;
$$;

revoke all on function public.count_link_click(text) from public;
grant execute on function public.count_link_click(text) to anon, authenticated;

notify pgrst, 'reload schema';
