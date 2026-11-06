// JSX runtime for the whole site (tsconfig "jsxImportSource": "@/i18n").
// It wraps React's own runtime and translates every piece of text a
// component renders, plus the readable attributes of HTML elements, into
// the visitor's language. Nothing in the components has to change; text
// without a translation stays in English.

import * as React from "react";
import { Fragment, jsx as reactJsx, jsxs as reactJsxs } from "react/jsx-runtime";

import { CatalogContext, currentClientCatalog, Tr, TrElement } from "./client";
import { serverCatalogStore } from "./server-store";
import {
  TRANSLATED_ATTRIBUTES,
  UNTRANSLATED_ELEMENTS,
  translateChildren,
  translateText,
  type Catalog,
} from "./translate";

export { Fragment };
export type { JSX } from "react/jsx-runtime";

type Props = Record<string, unknown> | null | undefined;

// Server components run with React's "react-server" build, which has no
// useContext; client components (in the browser and during SSR) have it.
const reactAny = React as unknown as Record<string, unknown>;
const useContextHook = reactAny["use" + "Context"] as ((context: unknown) => unknown) | undefined;
const isServerLayer = typeof useContextHook !== "function";

function hasText(value: unknown): boolean {
  if (typeof value === "string") return /[A-Za-z]/.test(value);
  return Array.isArray(value) && value.some((item) => typeof item === "string" && /[A-Za-z]/.test(item));
}

function clientCatalog(): Catalog | null {
  if (typeof window !== "undefined") return currentClientCatalog();
  try {
    return (useContextHook!(CatalogContext) as Catalog | null) ?? null;
  } catch {
    return null;
  }
}

/** Translated props, or a replacement element (server components whose
 *  language is not known yet hand the text to a client component). */
export function transform(type: unknown, props: Props): { props: Props; element?: unknown } {
  if (!props || typeof props !== "object") return { props };
  const intrinsic = typeof type === "string";
  if (intrinsic && (UNTRANSLATED_ELEMENTS.has(type as string) || props.translate === "no")) return { props };

  const children = props.children;
  const translateKids = hasText(children);
  // Readable attributes, also on components (next/link passes aria-label
  // through to its <a>, rendered by React's own runtime).
  const attrs: string[] = TRANSLATED_ATTRIBUTES.filter((name) => typeof props[name] === "string" && /[A-Za-z]/.test(props[name] as string));
  if (!translateKids && !attrs.length) return { props };

  let catalog: Catalog | null;
  if (isServerLayer) {
    const store = serverCatalogStore();
    if (!store.ready) {
      // The root layout and the page render in parallel, so the page may
      // not know the language yet: the client translates instead.
      // Client navigation reuses the layout, so the language stays unknown
      // for the whole page render. Text inside components (next/link) is
      // handed to the client too: their own runtime does not translate it.
      if (intrinsic && attrs.length) return { props, element: reactJsx(TrElement, { as: type as string, props }) };
      if (translateKids) return { props: { ...props, children: reactJsx(Tr, { parts: children }) } };
      return { props };
    }
    catalog = store.catalog;
  } else {
    catalog = clientCatalog();
  }
  if (!catalog) return { props };

  const next: Record<string, unknown> = { ...props };
  if (translateKids) next.children = translateChildren(catalog, children);
  for (const name of attrs) next[name] = translateText(catalog, props[name] as string);
  return { props: next };
}

function withKey(element: unknown, key: React.Key | undefined) {
  if (key === undefined || key === null) return element;
  const { as, props } = (element as { props: { as: string; props: Props } }).props;
  return reactJsx(TrElement, { as, props }, key);
}

export function jsx(type: React.ElementType, props: Props, key?: React.Key) {
  const result = transform(type, props);
  if (result.element) return withKey(result.element, key);
  return Array.isArray(result.props?.children) && result.props !== props
    ? reactJsxs(type, result.props, key)
    : reactJsx(type, result.props, key);
}

export function jsxs(type: React.ElementType, props: Props, key?: React.Key) {
  const result = transform(type, props);
  if (result.element) return withKey(result.element, key);
  // Children replaced by one element (Tr) are no longer a static array.
  return Array.isArray(result.props?.children) || result.props === props
    ? reactJsxs(type, result.props, key)
    : reactJsx(type, result.props, key);
}
