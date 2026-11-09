# Payments: Plus through Whop

Owner decision 2026-11-09: Plus is sold through Whop. Whop is the merchant of
record for the payment (it charges the card, collects and pays EU/UK VAT with
the "Whop collects and remits tax" option, sends the receipt and renews the
subscription). DocRoute provides Plus itself and never sees card details.

## How it works

1. `/plus` (signed in, Free) shows the price from Whop, one consent box
   (Plus starts at once; the 14-day withdrawal right ends when it starts)
   and **Continue to payment**.
2. `POST /api/billing/checkout` checks the session and the consent, refuses
   an account that already has Plus, and creates a Whop checkout
   configuration for `WHOP_PLUS_VARIANT_ID` with metadata
   `docroute_user_id`, `withdrawal_waiver_at`, `terms_version`. Whop copies
   the metadata to the payment and the membership. The browser goes to
   Whop's checkout (only a `whop.com` / `sandbox.whop.com` URL is accepted).
3. After paying, Whop sends the buyer to `/plus/thanks`, which polls the plan
   for up to 90 s.
4. `POST /api/webhooks/whop` verifies the Standard Webhooks signature
   (HMAC-SHA256 keyed with the literal `ws_…` secret, 5-minute window; checked
   against `@whop/sdk` 2.7), then **reads the membership again from the Whop
   API** (so duplicate, late or out-of-order events cannot leave a wrong
   plan), finds the account in its metadata and calls
   `apply_whop_membership()` with the Supabase secret key. Refund and dispute
   events go payment → membership. Errors answer 5xx so Whop retries (~3
   days).
5. `apply_whop_membership()` (migration `20261109120000_whop_payments.sql`,
   callable only by `service_role`): active → `plan = plus`, `source =
   payment`, `plus_until` = end of the paid period (+3 days grace for a
   renewing membership, exact end when cancelling); inactive → Free from now.
   Plus given by the owner (manual/beta) is never shortened; an old inactive
   membership never switches off a different active one.
6. Account page: "Plan: Plus · renews automatically · Manage or cancel on
   Whop" (Whop orders page, or the membership's own manage link).

Refunds are made by the owner in the Whop dashboard. A refund alone may leave
the membership active; to end Plus, also cancel the membership there.

## Environment (Vercel → Settings → Environment Variables)

| Name | Value | Where |
| --- | --- | --- |
| `WHOP_ENVIRONMENT` | `sandbox` (test, default) or `production` | Preview: sandbox; Production: production at launch |
| `WHOP_API_KEY` | Account API key (Whop → Developer) | both, from the matching Whop environment |
| `WHOP_PLUS_VARIANT_ID` | `plan_…` of the Plus price | both |
| `WHOP_WEBHOOK_SECRET` | `ws_…` exactly as shown | both |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → secret key (`sb_secret_…`) | both |
| `PAYMENTS_ENABLED` | `true` shows the button and the Plus terms | Preview first; Production only at launch |

Sandbox and production share nothing (accounts, keys, products, webhooks):
set everything up twice. Webhook URL: `https://<site>/api/webhooks/whop`,
events `membership.activated`, `membership.deactivated`, `membership.updated`,
`membership.cancel_at_period_end_changed`, `payment.succeeded`,
`payment.failed`, `refund.created`, `dispute.created`. Whop does not accept
localhost URLs. Vercel Preview URLs sit behind Vercel login (Deployment
Protection): for a sandbox test on Preview, turn on "Protection Bypass for
Automation" in Vercel and add `?x-vercel-protection-bypass=<secret>` to the
webhook URL in Whop.

## Before real money (PAYMENTS_ENABLED on Production)

Not code; owner and lawyer:

- Trade licence (živnosť, IČO) and income tax; Whop's VAT handling covers
  VAT only.
- Seller identity on the site (name or business name, IČO, address; Act
  22/2004 § 4), then `legalInfo.isCommercial = true` and the test updated.
- Lawyer review of the Plus terms (`/terms#plus`), the consent wording and
  the refund promise when Plus stops.
- Vercel Pro (Hobby is non-commercial only).
- Locked Free steps are still in the public JavaScript (docs/ACCESS.md,
  "Limits"); paid content needs server-built routes.
- Email reminders are shown as "coming soon" and are not part of what is
  sold until they exist.
