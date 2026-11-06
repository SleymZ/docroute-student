"use client";

// The language on the client: the root layout hands the dictionary of the
// visitor's language to LocaleProvider once per page load. The JSX runtime
// (jsx-runtime.ts) reads it to translate every piece of text a component
// renders. Plain createElement here, because this file is itself compiled
// with that runtime.

import { Fragment, createContext, createElement, useCallback, useContext, useMemo, type ReactNode } from "react";

import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_MAX_AGE, type Locale } from "./config";
import { TRANSLATED_ATTRIBUTES, UNTRANSLATED_ELEMENTS, buildCatalog, translateChildren, translateText, type Catalog, type Dictionary } from "./translate";

export const CatalogContext = createContext<Catalog | null>(null);
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

// In the browser there is one language per page load, so the runtime can
// read it from here even for JSX made outside a render (event handlers).
let browserCatalog: Catalog | null = null;
let browserLocale: Locale = DEFAULT_LOCALE;

export function currentClientCatalog(): Catalog | null {
  return browserCatalog;
}

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary | null;
  children?: ReactNode;
}) {
  const catalog = useMemo(() => (dictionary ? buildCatalog(locale, dictionary) : null), [locale, dictionary]);
  if (typeof window !== "undefined") {
    browserCatalog = catalog;
    browserLocale = locale;
  }
  return createElement(
    LocaleContext.Provider,
    { value: locale },
    createElement(CatalogContext.Provider, { value: catalog }, children),
  );
}

/** Text handed over by a server component, translated on the client. */
export function Tr({ parts }: { parts: unknown }) {
  const catalog = useContext(CatalogContext);
  const result = translateChildren(catalog, parts);
  if (!Array.isArray(result)) return result as ReactNode;
  // Empty strings render no text on the server but an empty text node in
  // the browser, which breaks hydration (React error 418): leave them out.
  return createElement(Fragment, null, ...result.filter((item) => item !== "")) as ReactNode;
}

/** An HTML element from a server component whose readable attributes
 *  need the visitor's language: rendered here with them translated. */
export function TrElement({ as, props }: { as: string; props: Record<string, unknown> }) {
  const catalog = useContext(CatalogContext);
  if (!catalog) return createElement(as, props);
  const next: Record<string, unknown> = { ...props };
  for (const name of TRANSLATED_ATTRIBUTES) {
    if (typeof next[name] === "string") next[name] = translateText(catalog, next[name] as string);
  }
  const kids =
    next.children === undefined || UNTRANSLATED_ELEMENTS.has(as) ? next.children : translateChildren(catalog, next.children);
  delete next.children;
  return Array.isArray(kids) ? createElement(as, next, ...kids) : createElement(as, next, kids as ReactNode);
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Translate a string outside JSX (alerts, document titles, labels in code). */
export function useT() {
  const catalog = useContext(CatalogContext);
  // Stable per language, so it can sit in useMemo dependencies.
  return useCallback((text: string) => translateText(catalog, text), [catalog]);
}

/** For code outside React (confirm dialogs, alerts). */
export function t(text: string) {
  return translateText(browserCatalog, text);
}

export function currentLocale(): Locale {
  return browserLocale;
}

export function setLocaleCookie(locale: Locale) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_MAX_AGE}; SameSite=Lax${secure}`;
}
