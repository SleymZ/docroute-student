import { isLocale, type Locale } from "@/i18n/config";

/**
 * Short links for our own posts and profiles: /go/<channel>-<language>[-<nn>],
 * for example /go/tt-ru (TikTok bio, Russian) or /go/ig-en-03 (Instagram,
 * English, video 03). Opening one counts a click for that code and day
 * (no IP, no cookie, nothing about the person) and forwards to the page
 * with utm_* tags.
 */
export const SHORT_LINK_CHANNELS = {
  tt: "tiktok",
  ig: "instagram",
  yt: "youtube",
  tg: "telegram",
  rd: "reddit",
  fb: "facebook",
  th: "threads",
  wa: "whatsapp",
  x: "x",
  li: "linkedin",
  qr: "qr",
  mail: "email",
} as const;

export type ShortLinkChannel = keyof typeof SHORT_LINK_CHANNELS;

/** Where every short link lands. */
export const SHORT_LINK_TARGET = "/deadlines";

// Keep in step with the check in supabase/migrations/20261116120000_link_clicks.sql.
export const SHORT_LINK_PATTERN = /^(tt|ig|yt|tg|rd|fb|th|wa|x|li|qr|mail)-(en|ru|es|zh|hi)(-[0-9]{2})?$/;

export type ShortLink = {
  code: string;
  channel: ShortLinkChannel;
  locale: Locale;
  video: string | null;
};

export function parseShortLink(raw: string): ShortLink | null {
  const code = raw.toLowerCase();
  const match = SHORT_LINK_PATTERN.exec(code);
  if (!match) return null;
  const locale = match[2];
  if (!isLocale(locale)) return null;
  return {
    code,
    channel: match[1] as ShortLinkChannel,
    locale,
    video: match[3] ? match[3].slice(1) : null,
  };
}

/** The address a short link forwards to, with its campaign tags. */
export function shortLinkDestination(link: ShortLink, target = SHORT_LINK_TARGET) {
  const params = new URLSearchParams({
    utm_source: SHORT_LINK_CHANNELS[link.channel],
    utm_medium: link.channel === "qr" ? "print" : link.channel === "mail" ? "email" : "social",
    utm_campaign: link.locale,
  });
  if (link.video) params.set("utm_content", `v${link.video}`);
  return `${target}?${params.toString()}`;
}

// Link-preview fetchers (Telegram, WhatsApp, Facebook/Instagram, X, Slack,
// Discord, search engines) open the address too; they are not people.
const PREVIEW_BOTS =
  /bot|crawl|spider|preview|facebookexternalhit|meta-externalagent|whatsapp|telegram|slack|discord|embedly|skype|vkshare|bytespider|headless/i;

export function isPreviewFetch(userAgent: string | null, method: string) {
  if (method !== "GET") return true;
  if (!userAgent) return true;
  return PREVIEW_BOTS.test(userAgent);
}
