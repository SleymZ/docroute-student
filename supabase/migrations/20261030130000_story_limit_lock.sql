-- Review fix for 20261030120000: two story submissions sent at the same
-- moment could both count four rows and exceed the limit of five. The
-- trigger now locks the author's profile row first, so inserts by the same
-- account wait for each other. Safe to re-run.

create or replace function public.success_stories_moderation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      -- at most 5 stories per account, to limit spam; the row lock
      -- serialises concurrent inserts for the same account
      perform 1 from public.public_profiles p where p.user_id = new.user_id for update;
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

notify pgrst, 'reload schema';
