const localUrl = "http://localhost:3000";

/** The production address (bought 2026-11-17). docroute-student.vercel.app
 *  still answers and should redirect here in the Vercel domain settings. */
export const PRODUCTION_URL = "https://docroute.app";

function normalizeUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return normalizeUrl(configuredUrl).replace(/\/$/, "");
  }

  // On Vercel (production and previews) canonical links, the sitemap and
  // link previews always name the real domain, never a *.vercel.app copy.
  return process.env.VERCEL ? PRODUCTION_URL : localUrl;
}
