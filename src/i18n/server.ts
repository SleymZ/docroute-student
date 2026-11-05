import { cookies, headers } from "next/headers";

import es from "./catalogs/es.json";
import hi from "./catalogs/hi.json";
import ru from "./catalogs/ru.json";
import zh from "./catalogs/zh.json";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { serverCatalogStore } from "./server-store";
import { buildCatalog, translateText, type Catalog, type Dictionary } from "./translate";

const dictionaries: Record<Exclude<Locale, "en">, Dictionary> = { ru, es, zh, hi };
const built = new Map<Locale, Catalog>();

export function dictionaryFor(locale: Locale): Dictionary | null {
  return locale === "en" ? null : dictionaries[locale];
}

export function catalogFor(locale: Locale): Catalog | null {
  if (locale === "en") return null;
  let catalog = built.get(locale);
  if (!catalog) {
    catalog = buildCatalog(locale, dictionaries[locale]);
    built.set(locale, catalog);
  }
  return catalog;
}

/** The visitor's language: cookie, then the browser's languages. */
export async function getLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value, headerStore.get("accept-language"));
}

/** Fill the per-request store the JSX runtime reads in server components. */
export async function prepareServerLocale(): Promise<Locale> {
  const locale = await getLocale();
  const store = serverCatalogStore();
  store.catalog = catalogFor(locale);
  store.ready = true;
  return locale;
}

/** Translate text outside JSX on the server (metadata, emails). */
export async function getT() {
  const catalog = catalogFor(await getLocale());
  return (text: string) => translateText(catalog, text);
}
