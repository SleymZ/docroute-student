/**
 * Visit statistics (Vercel Web Analytics), loaded only after "Accept all".
 * Cookieless; page addresses are sent without the query string, because
 * route answers (citizenship, residence status, dates) live there.
 */
export const ANALYTICS_SCRIPT_SRC = "/_vercel/insights/script.js";

type AnalyticsEvent = { url: string; [key: string]: unknown };

/** Removes the query string and fragment from an absolute or relative URL. */
export function stripQuery(url: string) {
  return url.split(/[?#]/)[0];
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
  return { ...event, url: stripQuery(event.url) };
}
