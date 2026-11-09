-- Plus bought through Whop (owner decision 2026-11-09). Whop is the merchant
-- of record: it takes the money, charges VAT and renews the subscription.
-- DocRoute only mirrors the state of the Whop membership into
-- account_plans. The webhook (/api/webhooks/whop) reads the membership from
-- the Whop API and calls apply_whop_membership() with the server's secret
-- key; browsers can still only read their own row.

alter table public.account_plans
  add column if not exists whop_membership_id text,
  add column if not exists whop_status text,
  add column if not exists whop_manage_url text,
  add column if not exists whop_synced_at timestamptz;

alter table public.account_plans
  drop constraint if exists account_plans_whop_membership_format;
alter table public.account_plans
  add constraint account_plans_whop_membership_format
  check (whop_membership_id is null or whop_membership_id ~ '^mem_[A-Za-z0-9]{1,64}$');

alter table public.account_plans
  drop constraint if exists account_plans_whop_status_length;
alter table public.account_plans
  add constraint account_plans_whop_status_length
  check (whop_status is null or char_length(whop_status) <= 32);

alter table public.account_plans
  drop constraint if exists account_plans_whop_manage_url;
alter table public.account_plans
  add constraint account_plans_whop_manage_url
  check (whop_manage_url is null or (whop_manage_url like 'https://%' and char_length(whop_manage_url) <= 500));

-- One Whop membership belongs to one DocRoute account.
create unique index if not exists account_plans_whop_membership_key
  on public.account_plans (whop_membership_id)
  where whop_membership_id is not null;

-- Applies the current state of one Whop membership to one account.
-- Rules:
--  * active membership  -> plan plus, source payment, plus_until = end of the
--    paid period (+ grace, worked out by the caller; null = no end);
--  * inactive membership -> plan free, plus_until = now();
--  * Plus given by the owner (source manual/beta) is never shortened: the
--    membership is only recorded next to it;
--  * an inactive old membership never switches off a different membership
--    that is still active on the same account.
-- Returns what happened, for the webhook log.
create or replace function public.apply_whop_membership(
  p_user_id uuid,
  p_membership_id text,
  p_status text,
  p_active boolean,
  p_plus_until timestamptz,
  p_manage_url text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.account_plans%rowtype;
  owner_grant_active boolean;
begin
  if p_user_id is null or p_membership_id is null or p_active is null then
    raise exception 'Missing user, membership or state' using errcode = '22004';
  end if;

  if not exists (select 1 from auth.users u where u.id = p_user_id) then
    return 'no-account';
  end if;

  select * into existing
  from public.account_plans p
  where p.user_id = p_user_id
  for update;

  if found then
    owner_grant_active := existing.source in ('manual', 'beta')
      and existing.plan = 'plus'
      and (existing.plus_until is null or existing.plus_until > now());

    if owner_grant_active
       and (not p_active
            or existing.plus_until is null
            or (p_plus_until is not null and existing.plus_until >= p_plus_until)) then
      update public.account_plans
      set whop_membership_id = p_membership_id,
          whop_status = p_status,
          whop_manage_url = p_manage_url,
          whop_synced_at = now()
      where user_id = p_user_id;
      return 'kept-owner-grant';
    end if;

    if not p_active
       and existing.source = 'payment'
       and existing.whop_membership_id is not null
       and existing.whop_membership_id <> p_membership_id
       and existing.plan = 'plus'
       and (existing.plus_until is null or existing.plus_until > now()) then
      return 'kept-other-membership';
    end if;
  end if;

  insert into public.account_plans as p (
    user_id, plan, plus_until, source, note,
    whop_membership_id, whop_status, whop_manage_url, whop_synced_at
  )
  values (
    p_user_id,
    case when p_active then 'plus' else 'free' end,
    case when p_active then p_plus_until else now() end,
    'payment',
    'Whop',
    p_membership_id, p_status, p_manage_url, now()
  )
  on conflict (user_id) do update
  set plan = excluded.plan,
      plus_until = excluded.plus_until,
      source = 'payment',
      note = 'Whop',
      whop_membership_id = excluded.whop_membership_id,
      whop_status = excluded.whop_status,
      whop_manage_url = excluded.whop_manage_url,
      whop_synced_at = excluded.whop_synced_at;

  return case when p_active then 'plus' else 'free' end;
end;
$$;

revoke all on function public.apply_whop_membership(uuid, text, text, boolean, timestamptz, text) from public;
revoke all on function public.apply_whop_membership(uuid, text, text, boolean, timestamptz, text) from anon;
revoke all on function public.apply_whop_membership(uuid, text, text, boolean, timestamptz, text) from authenticated;
grant execute on function public.apply_whop_membership(uuid, text, text, boolean, timestamptz, text) to service_role;
