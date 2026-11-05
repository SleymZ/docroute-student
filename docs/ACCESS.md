# Access: guest, Free and Plus

Owner decision 2026-11-05. Change only with the owner. Code: `src/lib/access.ts`
(rules), `src/hooks/useAccess.ts` (the visitor's plan in the browser),
`src/proxy.ts` (guest redirect), `src/components/Plus.tsx` (locked features),
page `/plus` (the comparison shown to visitors).

| Feature | Guest (no account) | Free (account) | Plus |
| --- | --- | --- | --- |
| Explore, Top 100, university pages, home map → country universities | yes | yes | yes |
| Stories (read) | yes | yes | yes |
| Build a route (every `/route/*` page, `/explore/profile`) | no — sent to sign-up at once | yes | yes |
| Steps per stage | — | only the key steps are open: the first step of each stage and every "Needs attention" step (`stepAccess`). The others stay in place as locked cards with no text (`LockedStep`), plus "N steps in this stage locked" | all open |
| Own move/start date, deadline planner, dated steps | — | no (a `move=` date in the address is ignored) | yes |
| Email reminders | — | no | yes, **not built yet** (shown as "arrive with the Plus launch") |
| Save to My route (`confirmed_routes`) | — | no (enforced by RLS too) | yes, one per account |
| PDF (print) and PNG of the route | — | no | yes |
| Ticking steps off | — | yes | yes |
| Write a story | — | yes (moderated) | yes |

## How the plan is stored

- Table `account_plans` (migration `20261105120000_account_plans.sql`): one row
  per account; no row means Free. `plan` is `free` or `plus`, `plus_until` is an
  optional end date, `source` is `manual`, `beta` or `payment`.
- People can only read their own row. Nobody can write through the API: the
  owner grants Plus in the Supabase SQL editor. Payment (after the decision on
  16 November and an IČO) will write rows with `source = 'payment'`.
- `public.has_plus()` is used by RLS: inserting or changing a confirmed route
  needs Plus. Routes confirmed before 2026-11-05 can still be opened and removed.

Grant Plus to a beta tester:

```sql
insert into public.account_plans (user_id, plan, source, note)
select id, 'plus', 'beta', 'beta tester'
from auth.users where email = 'tester@example.com'
on conflict (user_id) do update set plan = 'plus', plus_until = null, source = 'beta';
```

Remove it: `update public.account_plans set plan = 'free' where user_id = (select id from auth.users where email = '…');`

## Limits

- Locked steps (decision 2026-11-05): the title, text, date and sources of a
  locked step are never rendered, not even blurred, so a screenshot or the
  page's HTML shows only grey bars. Route builders still run in the browser,
  so the data is in the JavaScript bundle; someone reading the code could
  find it. Real enforcement for the
  checklist needs server-built routes (with the paid route PR).
- Email reminders need a mail provider and a scheduled job; planned with
  the paid route.
