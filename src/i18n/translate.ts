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

// A sentence boundary inside a text: ". " (or "?", "!") before a capital
// letter, a digit or an opening quote or bracket.
const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[A-Z0-9"“(])/;
const MAX_SENTENCES = 8;

// Small words that occur inside names ("Faculty of Arts and Letters",
// "Universität für Bodenkultur", "Univerzita Pavla Jozefa Šafárika v
// Košiciach").
const NAME_WORDS = new Set([
  "of", "the", "and", "in", "at", "for", "de", "del", "la", "le", "di", "da", "do", "du", "von", "van", "der", "den",
  "für", "und", "an", "am", "im", "zu", "y", "e", "i", "a", "v", "vo", "na", "nad", "pod", "u", "ve", "z", "ze", "w",
  "et", "per", "des", "les",
]);

/** Untranslated text that is a phrase or sentence rather than a name,
 *  number, date or address: a sentence break, a first word in lowercase
 *  ("for the EU Blue Card") or any lowercase word that is not a name word
 *  ("the entry visa expires"). Web and e-mail addresses do not count. */
function looksLikeProse(part: string) {
  if (SENTENCE_BREAK.test(part)) return true;
  const tokens = part.split(/\s+/).filter((token) => token && !/[./@]\p{L}/u.test(token));
  return tokens.some((raw, index) => {
    const word = raw.replace(/^[^\p{L}]+|[^\p{L}'’]+$/gu, "");
    if (!word || !/^\p{Ll}/u.test(word)) return false;
    return index === 0 || !NAME_WORDS.has(word);
  });
}

function matchTemplate(catalog: Catalog, text: string, depth: number): string | null {
  const candidates = [...(catalog.patterns.get(firstWord(text)) ?? []), ...(catalog.patterns.get("") ?? [])];
  for (const pattern of candidates) {
    const match = pattern.regex.exec(text);
    if (!match) continue;
    const parts = match.slice(1);
    const translated = parts.map((part) => translateNormalised(catalog, part, depth + 1));
    // A variable holds a name, a number or a short phrase. If it swallowed
    // whole English sentences that have no translation, this template is
    // the wrong one ("Citizens of {0} need a visa to enter {1}" must not
    // take the description that follows the title as {1}).
    if (parts.some((part, index) => translated[index] === null && looksLikeProse(part))) continue;
    return fill(pattern.value, parts.map((part, index) => translated[index] ?? part));
  }
  return null;
}

function translateNormalised(catalog: Catalog, text: string, depth: number): string | null {
  const hit = catalog.exact.get(text);
  if (hit !== undefined) return hit;
  const date = translateDate(catalog, text);
  if (date) return date;
  if (depth > 2 || !/[A-Za-z]/.test(text)) return null;
  return matchTemplate(catalog, text, depth) ?? (depth === 0 ? translateSentences(catalog, text) : null);
}

const FULL_STOP: Partial<Record<Locale, string>> = { zh: "。", hi: "।" };

/** One sentence: as it is, or without its final full stop (titles are
 *  kept without one and joined to the next sentence with ". "). */
function translateSentence(catalog: Catalog, text: string): string | null {
  const hit = catalog.exact.get(text);
  if (hit !== undefined) return hit;
  // Without the full stop first, so a template's last variable does not
  // end up holding "Germany." instead of "Germany".
  if (text.endsWith(".")) {
    const bare = translateNormalised(catalog, text.slice(0, -1), 1);
    if (bare !== null) return /[.!?。।]$/.test(bare) ? bare : `${bare}${FULL_STOP[catalog.locale] ?? "."}`;
  }
  return translateNormalised(catalog, text, 1);
}

/**
 * Text joined from several catalog entries ("Title. Description…"): split
 * it into runs of whole sentences that each have a translation. Every
 * sentence must be covered, otherwise the text stays in English rather
 * than mixing languages.
 */
function translateSentences(catalog: Catalog, text: string): string | null {
  const sentences = text.split(SENTENCE_BREAK);
  if (sentences.length < 2 || sentences.length > MAX_SENTENCES) return null;
  const separator = catalog.locale === "zh" ? "" : " ";
  // best[i]: translation of sentences 0..i-1, using as few runs as possible.
  const best: Array<string | null> = [""];
  for (let end = 1; end <= sentences.length; end += 1) {
    best[end] = null;
    for (let start = 0; start < end; start += 1) {
      const before = best[start];
      if (before === null || (start === 0 && end === sentences.length)) continue;
      const run = translateSentence(catalog, sentences.slice(start, end).join(" "));
      if (run === null) continue;
      best[end] = start === 0 ? run : `${before}${separator}${run}`;
      break;
    }
  }
  return best[sentences.length];
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
