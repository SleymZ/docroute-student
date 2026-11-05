import type { Locale } from "./config";
import { LOCALE_TAGS } from "./config";

// The translation engine. Catalog keys are the English text as written in
// the source, with whitespace collapsed. Text built from a template keeps
// its variable parts as {0}, {1}… and inline elements as <0/>, <1/>…; a
// translation may reorder them. Anything without a translation stays in
// English, so a missing entry never breaks a page.

export type Dictionary = Readonly<Record<string, string>>;

type Pattern = { regex: RegExp; value: string; slots: number };

export type Catalog = {
  locale: Locale;
  exact: ReadonlyMap<string, string>;
  /** Templates grouped by their first word ("" when they start with a slot). */
  patterns: ReadonlyMap<string, readonly Pattern[]>;
  months: ReadonlyMap<string, number>;
  dateTag: string;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SLOT = /\{(\d+)\}|<(\d+)\/>/g;
const HAS_SLOT = /\{\d+\}/;

export function normalise(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function firstWord(text: string) {
  const match = /^[^\s{<]+/.exec(text);
  return match ? match[0].toLowerCase() : "";
}

export function buildCatalog(locale: Locale, dictionary: Dictionary): Catalog {
  const exact = new Map<string, string>();
  const patterns = new Map<string, Pattern[]>();
  for (const [rawKey, value] of Object.entries(dictionary)) {
    if (!value) continue;
    const key = normalise(rawKey);
    exact.set(key, value);
    if (!HAS_SLOT.test(key)) continue;
    let slots = 0;
    let source = "^";
    let last = 0;
    for (const match of key.matchAll(SLOT)) {
      source += escapeRegex(key.slice(last, match.index));
      if (match[1] !== undefined) {
        source += "(.+?)";
        slots += 1;
      } else {
        source += escapeRegex(match[0]);
      }
      last = match.index + match[0].length;
    }
    source += `${escapeRegex(key.slice(last))}$`;
    const bucket = firstWord(key);
    const list = patterns.get(bucket) ?? [];
    list.push({ regex: new RegExp(source, "s"), value, slots });
    patterns.set(bucket, list);
  }
  // Longer templates first: they are more specific.
  for (const list of patterns.values()) list.sort((a, b) => b.regex.source.length - a.regex.source.length);
  return {
    locale,
    exact,
    patterns,
    months: new Map(MONTHS.map((name, index) => [name, index])),
    dateTag: LOCALE_TAGS[locale],
  };
}

const DATE_DMY = /^(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December)( \d{4})?$/;
const DATE_MY = /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/;

function translateDate(catalog: Catalog, text: string): string | null {
  let match = DATE_DMY.exec(text);
  if (match) {
    const day = Number(match[1]);
    const month = catalog.months.get(match[2])!;
    const year = match[3] ? Number(match[3]) : 2000;
    const date = new Date(Date.UTC(year, month, day));
    return new Intl.DateTimeFormat(catalog.dateTag, {
      day: "numeric",
      month: "long",
      ...(match[3] ? { year: "numeric" } : {}),
      timeZone: "UTC",
    }).format(date);
  }
  match = DATE_MY.exec(text);
  if (match) {
    const date = new Date(Date.UTC(Number(match[2]), catalog.months.get(match[1])!, 1));
    return new Intl.DateTimeFormat(catalog.dateTag, { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  }
  return null;
}

function fill(template: string, captures: string[]) {
  return template.replace(/\{(\d+)\}/g, (whole, index: string) => captures[Number(index)] ?? whole);
}

function translateNormalised(catalog: Catalog, text: string, depth: number): string | null {
  const hit = catalog.exact.get(text);
  if (hit !== undefined) return hit;
  const date = translateDate(catalog, text);
  if (date) return date;
  if (depth > 2 || !/[A-Za-z]/.test(text)) return null;
  const candidates = [...(catalog.patterns.get(firstWord(text)) ?? []), ...(catalog.patterns.get("") ?? [])];
  for (const pattern of candidates) {
    const match = pattern.regex.exec(text);
    if (!match) continue;
    const captures = match.slice(1).map((part) => translateNormalised(catalog, part, depth + 1) ?? part);
    return fill(pattern.value, captures);
  }
  return null;
}

/** The translation of one piece of text, or the text itself. */
export function translateText(catalog: Catalog | null | undefined, text: string): string {
  if (!catalog || !text || !/[A-Za-z]/.test(text)) return text;
  const key = normalise(text);
  const result = translateNormalised(catalog, key, 0);
  if (result === null) return text;
  // Keep the spaces around inline text ("Read the " before a link).
  const lead = /^\s/.test(text) ? " " : "";
  const trail = /\s$/.test(text) ? " " : "";
  return `${lead}${result}${trail}`;
}

/** Same, but null when there is no translation (for tests and tools). */
export function lookup(catalog: Catalog, text: string): string | null {
  return translateNormalised(catalog, normalise(text), 0);
}

type Child = unknown;

function isTextual(value: Child): value is string | number {
  return typeof value === "string" || typeof value === "number";
}

function isEmpty(value: Child) {
  return value === null || value === undefined || typeof value === "boolean";
}

/**
 * Translate the children of one JSX element. A sentence split by
 * variables or inline elements ("You have {n} programs at <b>…</b>") is
 * translated as a whole, so word order can change.
 */
export function translateChildren(catalog: Catalog | null | undefined, children: Child): Child {
  if (!catalog) return children;
  if (typeof children === "string") return translateText(catalog, children);
  if (!Array.isArray(children)) return children;

  const items = children.filter((item) => !isEmpty(item));
  if (!items.some((item) => typeof item === "string" && /[A-Za-z]/.test(item))) return children;

  if (items.every(isTextual)) {
    const joined = items.join("");
    const result = translateText(catalog, joined);
    return result === joined ? children : result;
  }

  if (items.some(Array.isArray)) {
    return children.map((item) => (typeof item === "string" ? translateText(catalog, item) : item));
  }

  const elements: Child[] = [];
  let joined = "";
  for (const item of items) {
    if (isTextual(item)) joined += String(item);
    else {
      joined += `<${elements.length}/>`;
      elements.push(item);
    }
  }
  const key = normalise(joined);
  const result = translateNormalised(catalog, key, 0);
  if (result === null) {
    // No sentence-level entry: translate each piece of text on its own.
    return children.map((item) => (typeof item === "string" ? translateText(catalog, item) : item));
  }
  const rebuilt: Child[] = [];
  const lead = /^\s/.test(joined) ? " " : "";
  const trail = /\s$/.test(joined) ? " " : "";
  const parts = `${lead}${result}${trail}`.split(/<(\d+)\/>/);
  parts.forEach((part, index) => {
    if (index % 2 === 0) {
      if (part) rebuilt.push(part);
    } else {
      const element = elements[Number(part)];
      if (element !== undefined) rebuilt.push(element);
    }
  });
  // An entry that drops an element would lose a link: keep the English.
  const used = new Set(parts.filter((_, index) => index % 2 === 1));
  if (used.size !== elements.length) {
    return children.map((item) => (typeof item === "string" ? translateText(catalog, item) : item));
  }
  return rebuilt;
}

/** Attributes of HTML elements that people read. */
export const TRANSLATED_ATTRIBUTES = ["placeholder", "title", "alt", "aria-label", "aria-description", "aria-roledescription"] as const;

/** Elements whose content is code or data, never prose. */
export const UNTRANSLATED_ELEMENTS = new Set(["script", "style", "code", "pre", "kbd", "samp", "textarea"]);
