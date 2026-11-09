// Plus is sold through Whop (owner decision 2026-11-09). Whop is the
// merchant of record: it shows the checkout, takes the money, charges VAT and
// renews or ends the subscription. DocRoute never sees card details. This
// file holds everything the server needs to talk to Whop:
//
//  * whopConfig()          – settings from the environment (Vercel);
//  * verifyWhopWebhook()   – Standard Webhooks signature check;
//  * eventReference()      – which membership or payment an event is about;
//  * plusFromMembership()  – what a Whop membership means for account_plans;
//  * createPlusCheckout(), getMembership(), getPayment(), getPlusPrice().
//
// Webhooks are only a signal: the handler always reads the membership again
// from the API, so duplicate, late or out-of-order events cannot leave a
// wrong plan behind.

import { createHmac, timingSafeEqual } from "node:crypto";

/** Whop API version this code was written against (the SDK 2.7 default). */
export const WHOP_API_VERSION = "2026-10-28";

/** How far the webhook timestamp may be from now (Whop: 5 minutes). */
export const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

/** Extra Plus days after a renewing period ends, so a renewal that is a little
 *  late (card retry, slow webhook) does not lock the route for a moment. */
export const RENEWAL_GRACE_DAYS = 3;

/** If Whop gives no end date for a renewing membership, check again within this. */
export const UNKNOWN_END_DAYS = 40;

/** Metadata key that ties a Whop checkout to a DocRoute account. */
export const USER_METADATA_KEY = "docroute_user_id";

export type WhopEnvironment = "sandbox" | "production";

export type WhopConfig = {
  environment: WhopEnvironment;
  apiBase: string;
  /** whop.com or sandbox.whop.com: where checkout and order pages live. */
  siteBase: string;
  apiKey: string | null;
  /** The Plus variant (Whop calls it a plan in the dashboard), `plan_…`. */
  variantId: string | null;
  webhookSecret: string | null;
  /** PAYMENTS_ENABLED=true and the key and variant are set. */
  checkoutEnabled: boolean;
};

type Env = Record<string, string | undefined>;

export function whopConfig(env: Env = process.env): WhopConfig {
  // Real money only when the owner says so explicitly.
  const environment: WhopEnvironment = env.WHOP_ENVIRONMENT?.trim() === "production" ? "production" : "sandbox";
  const apiKey = env.WHOP_API_KEY?.trim() || null;
  const rawVariant = env.WHOP_PLUS_VARIANT_ID?.trim() || "";
  const variantId = /^plan_[A-Za-z0-9]+$/.test(rawVariant) ? rawVariant : null;
  const webhookSecret = env.WHOP_WEBHOOK_SECRET?.trim() || null;
  const enabled = env.PAYMENTS_ENABLED?.trim() === "true";
  return {
    environment,
    apiBase: environment === "production" ? "https://api.whop.com/api/v1" : "https://sandbox-api.whop.com/api/v1",
    siteBase: environment === "production" ? "https://whop.com" : "https://sandbox.whop.com",
    apiKey,
    variantId,
    webhookSecret,
    checkoutEnabled: enabled && Boolean(apiKey && variantId),
  };
}

/** Where a buyer cancels or changes the subscription on Whop. */
export function ordersUrl(config: Pick<WhopConfig, "siteBase">): string {
  return `${config.siteBase}/@me/settings/orders/`;
}

// ---------------------------------------------------------------- webhooks

export class WebhookSignatureError extends Error {}

type HeaderSource = { get(name: string): string | null } | Record<string, string | undefined>;

function header(headers: HeaderSource, name: string): string | null {
  if (typeof (headers as { get?: unknown }).get === "function") {
    return (headers as { get(name: string): string | null }).get(name);
  }
  const record = headers as Record<string, string | undefined>;
  return record[name] ?? record[name.toLowerCase()] ?? null;
}

/** Signature Whop sends for a body: base64 HMAC-SHA256 over
 *  `{id}.{timestamp}.{body}`, keyed with the literal bytes of the `ws_…`
 *  secret (checked against @whop/sdk 2.7 `unwrapWebhook`). */
export function webhookSignature(secret: string, id: string, timestamp: string, payload: string): string {
  return createHmac("sha256", Buffer.from(secret, "utf8")).update(`${id}.${timestamp}.${payload}`, "utf8").digest("base64");
}

export type WhopEvent = {
  id?: string;
  type: string;
  data: Record<string, unknown>;
};

/** Checks the signature and the timestamp, then returns the parsed event.
 *  Throws WebhookSignatureError when anything is off. */
export function verifyWhopWebhook(
  payload: string,
  headers: HeaderSource,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): WhopEvent {
  if (!secret) throw new WebhookSignatureError("No webhook secret");
  const id = header(headers, "webhook-id");
  const timestamp = header(headers, "webhook-timestamp");
  const signatures = header(headers, "webhook-signature");
  if (!id || !timestamp || !signatures) throw new WebhookSignatureError("Missing signature headers");
  if (!/^\d{1,12}$/.test(timestamp)) throw new WebhookSignatureError("Bad timestamp");
  if (Math.abs(nowSeconds - Number(timestamp)) > WEBHOOK_TOLERANCE_SECONDS) {
    throw new WebhookSignatureError("Timestamp outside tolerance");
  }
  const expected = Buffer.from(webhookSignature(secret, id, timestamp, payload), "utf8");
  const matches = signatures
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("v1,"))
    .some((part) => {
      const given = Buffer.from(part.slice(3), "utf8");
      return given.length === expected.length && timingSafeEqual(given, expected);
    });
  if (!matches) throw new WebhookSignatureError("Signature does not match");

  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new WebhookSignatureError("Body is not JSON");
  }
  const event = parsed as Partial<WhopEvent> | null;
  if (!event || typeof event.type !== "string" || !event.data || typeof event.data !== "object") {
    throw new WebhookSignatureError("Not a Whop event");
  }
  return { id: typeof event.id === "string" ? event.id : id, type: event.type, data: event.data as Record<string, unknown> };
}

const MEMBERSHIP_ID = /^mem_[A-Za-z0-9]{1,64}$/;
const PAYMENT_ID = /^pay_[A-Za-z0-9]{1,64}$/;

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** The membership (or, for refunds and disputes, the payment) an event is
 *  about. Null for events DocRoute does not act on. */
export function eventReference(event: WhopEvent): { membershipId: string } | { paymentId: string } | null {
  const data = event.data;
  if (event.type.startsWith("membership.")) {
    const id = asString(data.id);
    return id && MEMBERSHIP_ID.test(id) ? { membershipId: id } : null;
  }
  if (event.type.startsWith("payment.")) {
    const id = asString(data.membership_id) ?? asString((data.membership as Record<string, unknown> | null)?.id);
    return id && MEMBERSHIP_ID.test(id) ? { membershipId: id } : null;
  }
  if (event.type.startsWith("refund.")) {
    const id = asString(data.payment_id) ?? asString((data.payment as Record<string, unknown> | null)?.id);
    return id && PAYMENT_ID.test(id) ? { paymentId: id } : null;
  }
  if (event.type.startsWith("dispute.")) {
    const id = asString((data.payment as Record<string, unknown> | null)?.id) ?? asString(data.payment_id);
    return id && PAYMENT_ID.test(id) ? { paymentId: id } : null;
  }
  return null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The DocRoute account a checkout was made for, from Whop metadata. */
export function userIdFromMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as Record<string, unknown>)[USER_METADATA_KEY];
  return typeof value === "string" && UUID.test(value) ? value.toLowerCase() : null;
}

// -------------------------------------------------------- membership → plan

export type WhopMembership = {
  id: string;
  status: string;
  cancel_at_period_end?: boolean | null;
  current_period_end?: string | null;
  expires_at?: string | null;
  manage_url?: string | null;
  metadata?: Record<string, unknown> | null;
  updated_at?: string | null;
};

/** Statuses that keep access (Whop: active/trialing grant access, past_due is
 *  the grace period after a failed charge, completed one-time purchases keep
 *  access, canceling runs to the end of the paid period). */
export const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due", "completed", "canceling"]);

export type PlusState = {
  active: boolean;
  /** ISO time Plus ends; null = no end (a one-time purchase without expiry). */
  plusUntil: string | null;
  /** Whop's status, with a renewing membership that will not renew stored
   *  as "canceling" (Whop keeps it "active" with cancel_at_period_end). */
  status: string;
  manageUrl: string | null;
  /** Whop's updated_at, so the database can refuse older snapshots. */
  updatedAt: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

export function plusFromMembership(membership: WhopMembership, now: number = Date.now()): PlusState {
  const rawStatus = String(membership.status ?? "").slice(0, 32);
  const manageUrl =
    typeof membership.manage_url === "string" && membership.manage_url.startsWith("https://") && membership.manage_url.length <= 500
      ? membership.manage_url
      : null;
  const end = parseTime(membership.current_period_end) ?? parseTime(membership.expires_at);
  const recurring = rawStatus === "active" || rawStatus === "trialing" || rawStatus === "past_due";
  const renewing = recurring && !membership.cancel_at_period_end;
  const status = recurring && membership.cancel_at_period_end ? "canceling" : rawStatus;
  const updated = parseTime(membership.updated_at);
  const updatedAt = updated === null ? null : new Date(updated).toISOString();

  if (!ACTIVE_STATUSES.has(status)) {
    return { active: false, plusUntil: null, status, manageUrl, updatedAt };
  }
  if (end === null) {
    // A one-time purchase with no end keeps Plus; anything else is checked
    // again by the next event or after UNKNOWN_END_DAYS at the latest.
    if (status === "completed") return { active: true, plusUntil: null, status, manageUrl, updatedAt };
    return { active: true, plusUntil: new Date(now + UNKNOWN_END_DAYS * DAY_MS).toISOString(), status, manageUrl, updatedAt };
  }
  const until = renewing ? end + RENEWAL_GRACE_DAYS * DAY_MS : end;
  if (until <= now) return { active: false, plusUntil: null, status, manageUrl, updatedAt };
  return { active: true, plusUntil: new Date(until).toISOString(), status, manageUrl, updatedAt };
}

// ------------------------------------------------------------------ the API

export class WhopApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type FetchLike = (input: string, init?: RequestInit & { next?: { revalidate?: number } }) => Promise<Response>;

async function whopRequest<T>(
  config: WhopConfig,
  path: string,
  init: { method?: string; body?: unknown; revalidate?: number; fetcher?: FetchLike } = {},
): Promise<T> {
  if (!config.apiKey) throw new WhopApiError("WHOP_API_KEY is not set", 0);
  const fetcher = init.fetcher ?? (fetch as FetchLike);
  const response = await fetcher(`${config.apiBase}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Api-Version-Date": WHOP_API_VERSION,
      Accept: "application/json",
      ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(4000),
    ...(init.revalidate === undefined ? { cache: "no-store" as const } : { next: { revalidate: init.revalidate } }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new WhopApiError(`Whop ${init.method ?? "GET"} ${path} → ${response.status} ${text.slice(0, 300)}`, response.status);
  }
  return (await response.json()) as T;
}

/** True when a URL Whop gave us really points at Whop's own checkout. */
export function isWhopCheckoutUrl(config: Pick<WhopConfig, "siteBase">, value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.origin === config.siteBase;
  } catch {
    return false;
  }
}

/** A one-off Whop checkout for one DocRoute account. The metadata is copied
 *  by Whop to the payment and the membership, which is how the webhook knows
 *  whose plan to change. */
export async function createPlusCheckout(
  config: WhopConfig,
  options: { userId: string; redirectUrl: string; consentAt: string; termsVersion: string; fetcher?: FetchLike },
): Promise<string> {
  if (!config.variantId) throw new WhopApiError("WHOP_PLUS_VARIANT_ID is not set", 0);
  const result = await whopRequest<{ purchase_url?: string | null }>(config, "/checkout_configurations", {
    method: "POST",
    fetcher: options.fetcher,
    body: {
      variant_id: config.variantId,
      redirect_url: options.redirectUrl,
      metadata: {
        [USER_METADATA_KEY]: options.userId,
        // Record of the consent given on DocRoute before checkout.
        withdrawal_waiver_at: options.consentAt,
        terms_version: options.termsVersion,
      },
    },
  });
  if (!isWhopCheckoutUrl(config, result.purchase_url)) {
    throw new WhopApiError("Whop returned no checkout URL", 502);
  }
  return result.purchase_url;
}

export function getMembership(config: WhopConfig, id: string, fetcher?: FetchLike): Promise<WhopMembership> {
  if (!MEMBERSHIP_ID.test(id)) throw new WhopApiError("Bad membership id", 400);
  return whopRequest<WhopMembership>(config, `/memberships/${id}`, { fetcher });
}

export function getPayment(
  config: WhopConfig,
  id: string,
  fetcher?: FetchLike,
): Promise<{ id: string; membership_id?: string | null; metadata?: Record<string, unknown> | null }> {
  if (!PAYMENT_ID.test(id)) throw new WhopApiError("Bad payment id", 400);
  return whopRequest(config, `/payments/${id}`, { fetcher });
}

/** The Plus price as Whop formats it ("€4.99 / month"), cached for an hour.
 *  Null when payments are off or Whop cannot be reached. */
export async function getPlusPrice(config: WhopConfig, fetcher?: FetchLike): Promise<string | null> {
  if (!config.checkoutEnabled || !config.variantId) return null;
  try {
    const variant = await whopRequest<{ formatted_price?: string | null }>(config, `/variants/${config.variantId}`, {
      revalidate: 3600,
      fetcher,
    });
    const price = typeof variant.formatted_price === "string" ? variant.formatted_price.trim() : "";
    return price && price.length <= 60 ? price : null;
  } catch (error) {
    console.error("Whop price lookup failed", error);
    return null;
  }
}
