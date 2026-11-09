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
  add column if not exists whop_synced_at timestamptz,
  -- Whop's updated_at of the snapshot last applied: older snapshots are refused.
  add column if not exists whop_updated_at timestamptz,
  -- A time-limited Plus given by the owner that a payment currently covers;
  -- it comes back if the payment ends first.
  add column if not exists owner_grant_source text,
  add column if not exists owner_grant_until timestamptz;

alter table public.account_plans
  drop constraint if exists account_plans_owner_grant;
alter table public.account_plans
  add constraint account_plans_owner_grant
  check (owner_grant_source is null or owner_grant_source in ('manual', 'beta'));

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
--  * Plus given by the owner (source manual/beta) is never shortened: while
--    it lasts longer, the membership is only recorded next to it; when a
--    payment lasts longer, the owner grant is kept in owner_grant_* and comes
--    back if the payment ends first;
--  * a snapshot older than the one already applied (p_updated_at) is refused,
--    so overlapping webhooks cannot bring back an old state;
--  * an inactive old membership never switches off a different membership
--    that is still active on the same account.
-- Returns what happened, for the webhook log.
drop function if exists public.apply_whop_membership(uuid, text, text, boolean, timestamptz, text);

create or replace function public.apply_whop_membership(
  p_user_id uuid,
  p_membership_id text,
  p_status text,
  p_active boolean,
  p_plus_until timestamptz,
  p_manage_url text,
  p_updated_at timestamptz
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.account_plans%rowtype;
  grant_source text;
  grant_until timestamptz;
  grant_forever boolean := false;
  changed integer;
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
    if existing.whop_membership_id = p_membership_id
       and existing.whop_updated_at is not null
       and p_updated_at is not null
       and p_updated_at < existing.whop_updated_at then
      return 'stale';
    end if;

    -- The owner's grant: the current plan, or one a payment is covering.
    if existing.source in ('manual', 'beta') and existing.plan = 'plus'
       and (existing.plus_until is null or existing.plus_until > now()) then
      grant_source := existing.source;
      grant_until := existing.plus_until;
      grant_forever := existing.plus_until is null;
    elsif existing.owner_grant_source is not null and existing.owner_grant_until > now() then
      grant_source := existing.owner_grant_source;
      grant_until := existing.owner_grant_until;
    end if;

    if not p_active
       and existing.source = 'payment'
       and existing.whop_membership_id is not null
       and existing.whop_membership_id <> p_membership_id
       and existing.plan = 'plus'
       and (existing.plus_until is null or existing.plus_until > now()) then
      return 'kept-other-membership';
    end if;

    -- The owner's grant lasts at least as long: it is the plan.
    if grant_source is not null
       and (not p_active or grant_forever or (p_plus_until is not null and grant_until >= p_plus_until)) then
      update public.account_plans
      set plan = 'plus',
          plus_until = grant_until,
          source = grant_source,
          owner_grant_source = null,
          owner_grant_until = null,
          whop_membership_id = p_membership_id,
          whop_status = p_status,
          whop_manage_url = p_manage_url,
          whop_updated_at = p_updated_at,
          whop_synced_at = now()
      where user_id = p_user_id;
      return 'kept-owner-grant';
    end if;
  end if;

  insert into public.account_plans as p (
    user_id, plan, plus_until, source, note,
    whop_membership_id, whop_status, whop_manage_url, whop_updated_at, whop_synced_at,
    owner_grant_source, owner_grant_until
  )
  values (
    p_user_id,
    case when p_active then 'plus' else 'free' end,
    case when p_active then p_plus_until else now() end,
    'payment',
    'Whop',
    p_membership_id, p_status, p_manage_url, p_updated_at, now(),
    grant_source, grant_until
  )
  on conflict (user_id) do update
  set plan = excluded.plan,
      plus_until = excluded.plus_until,
      source = 'payment',
      note = 'Whop',
      whop_membership_id = excluded.whop_membership_id,
      whop_status = excluded.whop_status,
      whop_manage_url = excluded.whop_manage_url,
      whop_updated_at = excluded.whop_updated_at,
      whop_synced_at = excluded.whop_synced_at,
      owner_grant_source = excluded.owner_grant_source,
      owner_grant_until = excluded.owner_grant_until
  -- A row created by a parallel first webhook is not overwritten by an older snapshot.
  where p.whop_membership_id is distinct from excluded.whop_membership_id
     or p.whop_updated_at is null
     or excluded.whop_updated_at is null
     or p.whop_updated_at <= excluded.whop_updated_at;

  get diagnostics changed = row_count;
  if changed = 0 then
    return 'stale';
  end if;
  return case when p_active then 'plus' else 'free' end;
end;
$$;

revoke all on function public.apply_whop_membership(uuid, text, text, boolean, timestamptz, text, timestamptz) from public;
revoke all on function public.apply_whop_membership(uuid, text, text, boolean, timestamptz, text, timestamptz) from anon;
revoke all on function public.apply_whop_membership(uuid, text, text, boolean, timestamptz, text, timestamptz) from authenticated;
grant execute on function public.apply_whop_membership(uuid, text, text, boolean, timestamptz, text, timestamptz) to service_role;
