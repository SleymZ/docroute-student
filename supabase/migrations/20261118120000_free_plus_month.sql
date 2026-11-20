-- Free Plus month (owner decision 2026-11-18): until 19 Dec 2026 00:00 CET
-- (the last free day is 18 December) every signed-in account has Plus, so
-- saving to My route works for everyone. Nothing is removed: account_plans
-- and payments stay, and after that moment has_plus() checks the plan
-- again. The same date is FREE_PLUS_UNTIL in src/lib/access.ts.
create or replace function public.has_plus()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and (
      now() < timestamptz '2026-12-19 00:00:00+01'
      or exists (
        select 1
        from public.account_plans p
        where p.user_id = (select auth.uid())
          and p.plan = 'plus'
          and (p.plus_until is null or p.plus_until > now())
      )
    );
$$;

revoke all on function public.has_plus() from public;
revoke all on function public.has_plus() from anon;
grant execute on function public.has_plus() to authenticated;

notify pgrst, 'reload schema';
