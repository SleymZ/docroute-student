/**
 * Visit statistics (Vercel Web Analytics), loaded only after "Accept all".
 * Cookieless; page addresses are sent without the query string, because
 * route answers (citizenship, residence status, dates) live there. The only
 * exception is campaign tags (utm_*) on links we publish ourselves, so the
 * statistics can say which post or channel a visit came from.
 */
export const ANALYTICS_SCRIPT_SRC = "/_vercel/insights/script.js";

type AnalyticsEvent = { url: string; [key: string]: unknown };

/** Campaign tags kept in statistics; everything else after "?" is dropped. */
export const CAMPAIGN_TAGS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

// Tags we write look like "tiktok_ru" or "2026-11_deadlines": short, plain
// characters. Anything else (an e-mail address, free text) is dropped.
const SAFE_TAG = /^[A-Za-z0-9._-]{1,64}$/;

/** Removes the query string and fragment from an absolute or relative URL. */
export function stripQuery(url: string) {
  return url.split(/[?#]/)[0];
}

/** Keeps only safe campaign tags from the query string; drops the fragment. */
export function keepCampaignTags(url: string) {
  const [beforeHash] = url.split("#");
  const queryStart = beforeHash.indexOf("?");
  if (queryStart < 0) return beforeHash;
  const base = beforeHash.slice(0, queryStart);
  const params = new URLSearchParams(beforeHash.slice(queryStart + 1));
  const kept = new URLSearchParams();
  for (const tag of CAMPAIGN_TAGS) {
    const value = params.get(tag);
    if (value && SAFE_TAG.test(value)) kept.set(tag, value);
  }
  const query = kept.toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Applied to every event before it leaves the browser. Returns null (drop)
 * when consent is no longer given.
 */
export function prepareAnalyticsEvent(
  event: AnalyticsEvent,
  consented: boolean,
): AnalyticsEvent | null {
  if (!consented) return null;
  return { ...event, url: keepCampaignTags(event.url) };
}
