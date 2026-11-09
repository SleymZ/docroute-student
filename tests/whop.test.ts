import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  createPlusCheckout,
  eventReference,
  getPlusPrice,
  isWhopCheckoutUrl,
  plusFromMembership,
  RENEWAL_GRACE_DAYS,
  userIdFromMetadata,
  verifyWhopWebhook,
  WebhookSignatureError,
  webhookSignature,
  whopConfig,
  WHOP_API_VERSION,
} from "@/lib/whop";
import { syncWhopEvent, type ApplyPlan } from "@/lib/whop-sync";

const root = process.env.REPO_ROOT ?? process.cwd();
const SECRET = "ws_test_secret_123";
const USER = "0b8c6a1e-3f2d-4c5b-9a7e-1d2c3b4a5f60";
const NOW = Date.parse("2026-11-09T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

function signed(body: string, at = Math.floor(NOW / 1000), id = "msg_1") {
  return {
    headers: { "webhook-id": id, "webhook-timestamp": String(at), "webhook-signature": `v1,${webhookSignature(SECRET, id, String(at), body)}` },
    at,
  };
}

test("config: sandbox unless production is named, checkout only with the switch, key and variant", () => {
  const off = whopConfig({ WHOP_API_KEY: "k", WHOP_PLUS_VARIANT_ID: "plan_abc" });
  assert.equal(off.environment, "sandbox");
  assert.equal(off.apiBase, "https://sandbox-api.whop.com/api/v1");
  assert.equal(off.checkoutEnabled, false);
  const on = whopConfig({ PAYMENTS_ENABLED: "true", WHOP_API_KEY: "k", WHOP_PLUS_VARIANT_ID: "plan_abc", WHOP_ENVIRONMENT: "production" });
  assert.equal(on.checkoutEnabled, true);
  assert.equal(on.apiBase, "https://api.whop.com/api/v1");
  assert.equal(on.siteBase, "https://whop.com");
  assert.equal(whopConfig({ PAYMENTS_ENABLED: "true", WHOP_API_KEY: "k", WHOP_PLUS_VARIANT_ID: "prod_x" }).checkoutEnabled, false);
});

test("webhook signature: the literal ws_ secret is the HMAC key, as in @whop/sdk", () => {
  // Reference value computed independently: HMAC-SHA256(key = UTF-8 of the
  // whole secret, "msg_1.1786381404.{}"), base64.
  const body = "{}";
  const ref = webhookSignature(SECRET, "msg_1", "1786381404", body);
  assert.match(ref, /^[A-Za-z0-9+/]+=*$/);
  const event = JSON.stringify({ id: "msg_1", type: "membership.activated", data: { id: "mem_A1" } });
  const { headers, at } = signed(event);
  const parsed = verifyWhopWebhook(event, headers, SECRET, at);
  assert.equal(parsed.type, "membership.activated");
  // Several signatures in the header (secret rotation): any one may match.
  const multi = { ...headers, "webhook-signature": `v1,AAAA ${headers["webhook-signature"]}` };
  assert.equal(verifyWhopWebhook(event, multi, SECRET, at).type, "membership.activated");
});

test("webhook signature: forged, changed, stale and unsigned requests are refused", () => {
  const event = JSON.stringify({ type: "membership.activated", data: { id: "mem_A1" } });
  const { headers, at } = signed(event);
  assert.throws(() => verifyWhopWebhook(event, headers, "ws_other", at), WebhookSignatureError);
  assert.throws(() => verifyWhopWebhook(event.replace("A1", "B2"), headers, SECRET, at), WebhookSignatureError);
  assert.throws(() => verifyWhopWebhook(event, headers, SECRET, at + 301), WebhookSignatureError);
  assert.throws(() => verifyWhopWebhook(event, { "webhook-id": "msg_1" }, SECRET, at), WebhookSignatureError);
  const v2 = { ...headers, "webhook-signature": headers["webhook-signature"].replace("v1,", "v2,") };
  assert.throws(() => verifyWhopWebhook(event, v2, SECRET, at), WebhookSignatureError);
  assert.throws(() => verifyWhopWebhook(event, headers, "", at), WebhookSignatureError);
});

test("events point at a membership or, for refunds and disputes, a payment", () => {
  assert.deepEqual(eventReference({ type: "membership.deactivated", data: { id: "mem_X1" } }), { membershipId: "mem_X1" });
  assert.deepEqual(eventReference({ type: "payment.succeeded", data: { id: "pay_1", membership_id: "mem_X1" } }), { membershipId: "mem_X1" });
  assert.deepEqual(eventReference({ type: "refund.created", data: { payment_id: "pay_9" } }), { paymentId: "pay_9" });
  assert.deepEqual(eventReference({ type: "dispute.created", data: { payment: { id: "pay_9" } } }), { paymentId: "pay_9" });
  assert.equal(eventReference({ type: "payment.succeeded", data: { membership_id: null } }), null);
  assert.equal(eventReference({ type: "membership.activated", data: { id: "../../x" } }), null);
  assert.equal(eventReference({ type: "entry.created", data: { id: "mem_X1" } }), null);
});

test("account id comes only from a well-formed metadata value", () => {
  assert.equal(userIdFromMetadata({ docroute_user_id: USER }), USER);
  assert.equal(userIdFromMetadata({ docroute_user_id: USER.toUpperCase() }), USER);
  assert.equal(userIdFromMetadata({ docroute_user_id: "1 or 1=1" }), null);
  assert.equal(userIdFromMetadata(null), null);
});

test("membership → Plus: renewing gets grace, canceling ends on time, ended ones are Free", () => {
  const end = new Date(NOW + 30 * DAY).toISOString();
  const active = plusFromMembership({ id: "mem_1", status: "active", current_period_end: end }, NOW);
  assert.equal(active.active, true);
  assert.equal(active.plusUntil, new Date(NOW + (30 + RENEWAL_GRACE_DAYS) * DAY).toISOString());

  const canceling = plusFromMembership({ id: "mem_1", status: "active", cancel_at_period_end: true, current_period_end: end }, NOW);
  assert.equal(canceling.plusUntil, end);
  assert.equal(plusFromMembership({ id: "mem_1", status: "canceling", current_period_end: end }, NOW).plusUntil, end);

  for (const status of ["canceled", "expired", "unresolved", "drafted", ""]) {
    assert.equal(plusFromMembership({ id: "mem_1", status, current_period_end: end }, NOW).active, false, status);
  }
  // Paid period already over and no renewal: Free.
  const past = new Date(NOW - 5 * DAY).toISOString();
  assert.equal(plusFromMembership({ id: "mem_1", status: "canceling", current_period_end: past }, NOW).active, false);
  // One-time purchase with no end keeps Plus with no end date.
  assert.deepEqual(plusFromMembership({ id: "mem_1", status: "completed" }, NOW).plusUntil, null);
  // Renewing without a date: rechecked within 40 days, never forever.
  assert.ok(plusFromMembership({ id: "mem_1", status: "active" }, NOW).plusUntil);
  // Only https manage links are kept.
  assert.equal(plusFromMembership({ id: "mem_1", status: "active", manage_url: "javascript:alert(1)" }, NOW).manageUrl, null);
});

function fakeWhop(responses: Record<string, unknown>) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetcher = async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    const key = Object.keys(responses).find((path) => url.endsWith(path));
    if (!key) return new Response("not found", { status: 404 });
    return new Response(JSON.stringify(responses[key]), { status: 200, headers: { "content-type": "application/json" } });
  };
  return { calls, fetcher };
}

const config = whopConfig({ PAYMENTS_ENABLED: "true", WHOP_API_KEY: "apik", WHOP_PLUS_VARIANT_ID: "plan_plus1" });

test("checkout: one Whop link per account with the account in metadata", async () => {
  const { calls, fetcher } = fakeWhop({
    "/checkout_configurations": { purchase_url: "https://sandbox.whop.com/checkout/plan_plus1/?session=ch_1" },
  });
  const url = await createPlusCheckout(config, {
    userId: USER,
    redirectUrl: "https://docroute.example/plus/thanks",
    consentAt: "2026-11-09T12:00:00.000Z",
    termsVersion: "2026-11-09",
    fetcher,
  });
  assert.equal(url, "https://sandbox.whop.com/checkout/plan_plus1/?session=ch_1");
  const body = JSON.parse(String(calls[0].init?.body));
  assert.equal(body.variant_id, "plan_plus1");
  assert.equal(body.metadata.docroute_user_id, USER);
  assert.equal(body.metadata.withdrawal_waiver_at, "2026-11-09T12:00:00.000Z");
  const headers = calls[0].init?.headers as Record<string, string>;
  assert.equal(headers.Authorization, "Bearer apik");
  assert.equal(headers["Api-Version-Date"], WHOP_API_VERSION);

  // A link that is not Whop's own checkout is never handed to the browser.
  const evil = fakeWhop({ "/checkout_configurations": { purchase_url: "https://evil.example/checkout" } });
  await assert.rejects(
    createPlusCheckout(config, { userId: USER, redirectUrl: "x", consentAt: "x", termsVersion: "x", fetcher: evil.fetcher }),
  );
  assert.equal(isWhopCheckoutUrl(config, "https://whop.com/checkout"), false, "sandbox config accepts only sandbox");
});

test("price: Whop's formatted price, or nothing when payments are off or Whop fails", async () => {
  const { fetcher } = fakeWhop({ "/variants/plan_plus1": { formatted_price: "€4.99 / month" } });
  assert.equal(await getPlusPrice(config, fetcher), "€4.99 / month");
  assert.equal(await getPlusPrice(whopConfig({}), fetcher), null);
  const broken = fakeWhop({});
  const original = console.error;
  console.error = () => {};
  try {
    assert.equal(await getPlusPrice(config, broken.fetcher), null);
  } finally {
    console.error = original;
  }
});

function recorder() {
  const applied: Parameters<ApplyPlan>[0][] = [];
  const apply: ApplyPlan = async (args) => {
    applied.push(args);
    return { data: args.p_active ? "plus" : "free", error: null };
  };
  return { applied, apply };
}

test("sync: the membership is always read again from Whop, then written", async () => {
  const end = new Date(NOW + 30 * DAY).toISOString();
  const { fetcher, calls } = fakeWhop({
    "/memberships/mem_A1": { id: "mem_A1", status: "active", current_period_end: end, metadata: { docroute_user_id: USER } },
  });
  const { applied, apply } = recorder();
  // The event body says "canceled", but Whop now says active: the API wins.
  const result = await syncWhopEvent(config, { type: "membership.deactivated", data: { id: "mem_A1", status: "canceled" } }, apply, { fetcher, now: NOW });
  assert.equal(result.outcome, "applied");
  assert.equal(calls.length, 1);
  assert.equal(applied[0].p_user_id, USER);
  assert.equal(applied[0].p_active, true);
});

test("sync: refunds go payment → membership; memberships without a DocRoute account are ignored", async () => {
  const { fetcher } = fakeWhop({
    "/payments/pay_9": { id: "pay_9", membership_id: "mem_B2" },
    "/memberships/mem_B2": { id: "mem_B2", status: "canceled", metadata: { docroute_user_id: USER } },
    "/memberships/mem_C3": { id: "mem_C3", status: "active", metadata: {} },
  });
  const { applied, apply } = recorder();
  const refund = await syncWhopEvent(config, { type: "refund.created", data: { payment_id: "pay_9" } }, apply, { fetcher, now: NOW });
  assert.equal(refund.outcome, "applied");
  assert.equal(applied[0].p_active, false);
  const stranger = await syncWhopEvent(config, { type: "membership.activated", data: { id: "mem_C3" } }, apply, { fetcher, now: NOW });
  assert.equal(stranger.outcome, "ignored");
  assert.equal(applied.length, 1);
});

test("sync: Whop or database failures throw, so Whop retries", async () => {
  const down = fakeWhop({});
  const { apply } = recorder();
  await assert.rejects(syncWhopEvent(config, { type: "membership.activated", data: { id: "mem_A1" } }, apply, { fetcher: down.fetcher }));
  const { fetcher } = fakeWhop({ "/memberships/mem_A1": { id: "mem_A1", status: "active", metadata: { docroute_user_id: USER } } });
  const failing: ApplyPlan = async () => ({ data: null, error: { message: "boom" } });
  await assert.rejects(syncWhopEvent(config, { type: "membership.activated", data: { id: "mem_A1" } }, failing, { fetcher }));
});

test("migration: only the server's secret key may write a plan from Whop", () => {
  const sql = fs.readFileSync(path.join(root, "supabase/migrations/20261109120000_whop_payments.sql"), "utf8");
  assert.match(sql, /security definer/);
  assert.match(sql, /set search_path = ''/);
  assert.match(sql, /from authenticated;/);
  assert.match(sql, /from anon;/);
  assert.match(sql, /to service_role;/);
  assert.doesNotMatch(sql, /to authenticated/);
  assert.match(sql, /kept-owner-grant/);
});

test("secrets never get a public name and the webhook skips the session proxy", () => {
  const files = ["src/lib/whop.ts", "src/lib/supabase/admin.ts", "src/app/api/billing/checkout/route.ts", "src/app/api/webhooks/whop/route.ts"];
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    assert.doesNotMatch(source, /NEXT_PUBLIC_(WHOP|SUPABASE_SECRET|SUPABASE_SERVICE)/, file);
  }
  const proxy = fs.readFileSync(path.join(root, "src/proxy.ts"), "utf8");
  assert.match(proxy, /api\/webhooks/);
});
