// Site languages (owner decision 2026-11-05): English is the source text;
// Russian, Spanish, Chinese (simplified) and Hindi are translations of it.
// The language lives in a cookie, so addresses stay the same; without the
// cookie the browser's language decides.

export const LOCALES = ["en", "ru", "es", "zh", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "docroute-lang";
export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

/** Name of each language in itself, for the switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  es: "Español",
  zh: "中文",
  hi: "हिन्दी",
};

/** Value for <html lang> and for Intl formatting. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en",
  ru: "ru",
  es: "es",
  zh: "zh-Hans",
  hi: "hi",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** The best site language for an Accept-Language header, or English. */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const wanted = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return { tag: tag.trim(), q: q ? Number(q.trim().slice(2)) || 0 : 1, index };
    })
    .filter((item) => item.tag && item.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { tag } of wanted) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

/** Cookie value first, then the browser's languages. */
export function resolveLocale(cookie: string | null | undefined, acceptLanguage: string | null | undefined): Locale {
  return isLocale(cookie) ? cookie : localeFromAcceptLanguage(acceptLanguage);
}
