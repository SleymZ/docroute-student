// Country match: three EU countries for one person, from their answers in
// the profile quiz (/account/match). Server only: it reads the verified
// routes and programmes.
//
// 1. Easiest to move to: what DocRoute knows from official sources about
//    this passport and purpose — free movement for EU citizens, the
//    passport notes (passport-track.ts), the checked routes and programmes,
//    a job offer or a family member already in the country, a language the
//    person speaks, a permit where they already live.
// 2. Fits how you want to live: the person's own preferences (city or
//    quiet, winters, summers, budget, working hours, languages, people
//    around, safety, jobs) compared with official Eurostat statistics
//    (src/data/country-lifestyle.ts). Never with opinions about the people
//    of a country.
// 3. Best all-round: both together, a third country.
//
// Only the 27 EU members are suggested. The scores only order countries;
// the page shows the facts behind each pick, never a score.

import {
  countryLifestyle,
  euCountryCodes,
  lifestyleSources,
  officialLanguages,
  type EuCountryCode,
  type LifestyleIndicator,
} from "@/data/country-lifestyle";
import { temporaryProtectionNote } from "@/data/citizenship-notes";
import { blueCardCountries } from "@/data/eu-immigration-portal";
import { russiaBelarusNotes, type RestrictionNote } from "@/data/russia-belarus";
import { verifiedPrograms } from "@/data/verified-programs";
import {
  MATCH_VERSION,
  type MatchAnswers,
  type MatchField,
  type MatchPurpose,
} from "@/lib/country-match-answers";
import { countryHref, findCountryPage, purposeRoute, type Coverage } from "@/lib/country-list";
import { passportTrack, type TrackKind } from "@/lib/passport-track";
import { verifiedStudyResidence } from "@/lib/residence/study-routes";
import type { RouteSource } from "@/types/route-preview";

export const isEuCountry = (code: string | null | undefined): code is EuCountryCode =>
  Boolean(code) && (euCountryCodes as readonly string[]).includes(code as string);

export function countryName(code: string) {
  return findCountryPage(code)?.name ?? code;
}

// ------------------------------------------------------------- lifestyle

type Preference = { indicator: LifestyleIndicator; weight: number; direction: 1 | -1 };

/** What the person wants from a country, from their lifestyle answers. */
export function lifestylePreferences(answers: MatchAnswers): Preference[] {
  const l = answers.lifestyle;
  const out: Preference[] = [];
  const add = (indicator: LifestyleIndicator, weight: number, direction: 1 | -1) => {
    const same = out.find((pref) => pref.indicator === indicator && pref.direction === direction);
    if (same) same.weight += weight;
    else out.push({ indicator, weight, direction });
  };
  if (l.city === "busy") add("cities", 1.5, 1);
  if (l.city === "quiet") add("cities", 1.5, -1);
  if (l.winter === "love") add("cold", 1.5, 1);
  if (l.winter === "mild") add("cold", 1.5, -1);
  if (l.summer === "hot") add("heat", 1.5, 1);
  if (l.summer === "cool") add("heat", 1.5, -1);
  if (l.budget === "tight") add("prices", 2, -1);
  if (l.budget === "average") add("prices", 1, -1);
  if (l.rhythm === "free-time") add("hours", 1.5, -1);
  if (l.rhythm === "ambitious") add("vacancies", 1, 1);
  if (l.language === "foreign-ok") add("foreignLanguages", 2, 1);
  if (l.language === "learn") add("foreignLanguages", 0.5, 1);
  if (l.people === "international") add("nonEuResidents", 1.5, 1);
  if (l.people === "locals") add("nonEuResidents", 1, -1);
  if (l.safety === "very") add("crime", 1.5, -1);
  if (l.safety === "somewhat") add("crime", 0.5, -1);
  if (l.jobs === "top") {
    add("vacancies", 1.5, 1);
    add("unemployment", 1, -1);
  }
  if (l.jobs === "matters") {
    add("vacancies", 0.75, 1);
    add("unemployment", 0.5, -1);
  }
  // A small tie-break everyone shares: how satisfied people there are.
  add("lifeSatisfaction", 0.5, 1);
  return out;
}

const ranges = Object.fromEntries(
  (Object.keys(lifestyleSources) as LifestyleIndicator[]).map((indicator) => {
    const values = euCountryCodes
      .map((code) => countryLifestyle[code][indicator])
      .filter((value): value is number => value !== null);
    return [indicator, { min: Math.min(...values), max: Math.max(...values) }];
  }),
) as Record<LifestyleIndicator, { min: number; max: number }>;

/** 0 = the lowest of the 27, 1 = the highest; 0.5 when not published. */
function normalised(code: EuCountryCode, indicator: LifestyleIndicator) {
  const value = countryLifestyle[code][indicator];
  if (value === null) return 0.5;
  const { min, max } = ranges[indicator];
  return max === min ? 0.5 : (value - min) / (max - min);
}

/** 1 = the best of the 27 in the direction the person prefers. */
export function preferenceRank(code: EuCountryCode, indicator: LifestyleIndicator, direction: 1 | -1) {
  const value = countryLifestyle[code][indicator];
  if (value === null) return null;
  const better = euCountryCodes.filter((other) => {
    const v = countryLifestyle[other][indicator];
    return v !== null && (direction === 1 ? v > value : v < value);
  }).length;
  return better + 1;
}

/** An official language of the country the person speaks well. */
export function spokenOfficialLanguage(answers: MatchAnswers, code: EuCountryCode): string | null {
  const spoken = answers.languages.filter((item) => item.level !== "basic").map((item) => item.code);
  return officialLanguages[code].find((language) => spoken.includes(language)) ?? null;
}

export function lifestyleScore(answers: MatchAnswers, code: EuCountryCode) {
  const prefs = lifestylePreferences(answers);
  const total = prefs.reduce((sum, pref) => sum + pref.weight, 0);
  let score = 0;
  for (const pref of prefs) {
    const n = normalised(code, pref.indicator);
    score += pref.weight * (pref.direction === 1 ? n : 1 - n);
  }
  let value = total ? score / total : 0.5;
  // Speaking the language makes everyday life easier wherever it is spoken.
  if (spokenOfficialLanguage(answers, code)) value += 0.08;
  return value;
}

// ------------------------------------------------------------------ ease

/** Factors that make the move harder: shown as a warning, not a reason. */
export function isWarning(factor: EaseFactor) {
  return (factor.kind === "passport" && factor.track === "harder") || factor.kind === "family-exception";
}

export type EaseFactor =
  | { kind: "free-movement" }
  | { kind: "passport"; track: "easier" | "harder"; title: string }
  | { kind: "family-exception"; title: string }
  | { kind: "verified-route"; purpose: Exclude<MatchPurpose, "study"> }
  | { kind: "verified-programmes"; count: number; field: MatchField; english: boolean }
  | { kind: "study-residence" }
  | { kind: "job-offer" }
  | { kind: "blue-card" }
  | { kind: "family-there" }
  | { kind: "speaks-language"; language: string }
  | { kind: "lives-there" };

/** Countries where DocRoute checked the student residence permit. */
export const studyResidenceCountries: ReadonlySet<string> = new Set(["SK", "CZ", ...Object.keys(verifiedStudyResidence)]);

function targetDegree(answers: MatchAnswers) {
  return answers.education === "secondary" ? "bachelor" : "master";
}

function matchingProgrammes(answers: MatchAnswers, code: string) {
  if (!answers.study) return [];
  const field = answers.study.field;
  const level = targetDegree(answers);
  return verifiedPrograms.filter(
    (program) =>
      program.countryCode === code &&
      program.degreeLevel === level &&
      (field === "other" || program.category === field),
  );
}

/** "blocked" notes: the country has stopped visas for this passport
 *  (russia-belarus.ts); the notes list who can still apply. */
export function blockedFor(citizenship: string, code: string): RestrictionNote[] {
  return russiaBelarusNotes(citizenship, code).filter((note) => note.severity === "blocked");
}

const trackBase: Record<TrackKind, number> = { own: 0, eu: 0.8, easier: 0.6, standard: 0.45, harder: 0.25 };

export function easeOfMove(answers: MatchAnswers, code: EuCountryCode) {
  const track = passportTrack(answers.citizenship, code, countryName(code));
  const kind: TrackKind = track?.kind ?? "standard";
  const free = kind === "eu";
  const factors: EaseFactor[] = [];
  let score = trackBase[kind];

  const blocked = blockedFor(answers.citizenship, code);
  if (free) factors.push({ kind: "free-movement" });
  else if (track && (kind === "easier" || (kind === "harder" && !blocked.length))) {
    factors.push({ kind: "passport", track: kind, title: track.title });
  }

  if (blocked.length) {
    // Kept only for family: the blocked notes name family members among
    // those who can still apply.
    score = 0.1;
    factors.push({ kind: "family-exception", title: blocked[0].title });
  }

  if (answers.purpose === "study") {
    const programmes = matchingProgrammes(answers, code);
    if (programmes.length) {
      const english = programmes.filter((program) => program.instructionLanguages.some((language) => language.code === "en"));
      const wantsEnglish = Boolean(answers.study?.english);
      const counted = wantsEnglish && english.length ? english.length : programmes.length;
      // More checked programmes, more choice: a small step per programme.
      score += 0.15 + Math.min(5, counted) * 0.01;
      if (wantsEnglish && english.length) score += 0.1;
      factors.push({
        kind: "verified-programmes",
        count: counted,
        field: answers.study?.field ?? "other",
        english: wantsEnglish && english.length > 0,
      });
    }
    if (!free && studyResidenceCountries.has(code)) {
      score += 0.08;
      factors.push({ kind: "study-residence" });
    }
  } else if (purposeRoute(code, answers.purpose).coverage === "verified") {
    score += free ? 0.05 : 0.12;
    factors.push({ kind: "verified-route", purpose: answers.purpose });
  }

  if (answers.work?.offerCountry === code) {
    score += 0.35;
    factors.unshift({ kind: "job-offer" });
  }
  if (answers.purpose === "work") {
    if (!free && answers.education !== "secondary" && blueCardCountries.has(code)) {
      score += 0.04;
      factors.push({ kind: "blue-card" });
    }
    score += 0.05 * normalised(code, "vacancies");
  }
  if (answers.family?.sponsorCountry === code) {
    score += 0.5;
    factors.unshift({ kind: "family-there" });
  }

  const language = spokenOfficialLanguage(answers, code);
  if (language) {
    score += 0.1;
    factors.push({ kind: "speaks-language", language });
  }
  if (answers.livesIn === code && answers.residentWhereLives && !free) {
    score += 0.1;
    factors.unshift({ kind: "lives-there" });
  }

  // Only for ordering: the page never shows a score.
  return { score: Math.max(0, score), track: kind, factors };
}

// --------------------------------------------------------------- results

export type MatchRole = "easiest" | "lifestyle" | "overall";

export type LifestyleReason = {
  indicator: LifestyleIndicator;
  value: number;
  rank: number;
  direction: 1 | -1;
  source: RouteSource & { year: string };
};

export type CountryPick = {
  role: MatchRole;
  code: EuCountryCode;
  name: string;
  track: TrackKind;
  easeFactors: EaseFactor[];
  lifestyleReasons: LifestyleReason[];
  /** The next step: a checked route, the programmes, or the country page
   *  with its official links. */
  route: { href: string; coverage: Coverage };
  countryHref: string;
};

export type MatchNote = { title: string; description: string; sources: RouteSource[] };

export type MatchResult = {
  version: typeof MATCH_VERSION;
  purpose: MatchPurpose;
  picks: CountryPick[];
  /** Countries left out because they stopped visas for this passport. */
  excluded: Array<{ code: string; name: string; title: string; sources: RouteSource[] }>;
  /** Family purpose without a family member in an EU country. */
  familyOutsideEu: boolean;
  /** The person's own EU country, never suggested. */
  ownCountry: string | null;
  notes: MatchNote[];
};

/** A statistic is shown as a reason only up to this place among the 27. */
export const REASON_MAX_RANK = 9;

function lifestyleReasons(answers: MatchAnswers, code: EuCountryCode, limit: number): LifestyleReason[] {
  return lifestylePreferences(answers)
    .filter((pref) => pref.indicator !== "lifeSatisfaction")
    .map((pref) => {
      const n = normalised(code, pref.indicator);
      const fit = pref.direction === 1 ? n : 1 - n;
      return { pref, contribution: pref.weight * fit };
    })
    .map((item) => ({ ...item, rank: preferenceRank(code, item.pref.indicator, item.pref.direction) }))
    // A reason only where the country really stands out for this wish: in
    // the best third of the 27.
    .filter((item): item is typeof item & { rank: number } => item.rank !== null && item.rank <= REASON_MAX_RANK)
    .sort((a, b) => b.contribution - a.contribution || a.rank - b.rank || a.pref.indicator.localeCompare(b.pref.indicator))
    .slice(0, limit)
    .map(({ pref, rank }) => ({
      indicator: pref.indicator,
      value: countryLifestyle[code][pref.indicator] as number,
      rank,
      direction: pref.direction,
      source: lifestyleSources[pref.indicator],
    }));
}

function routeFor(answers: MatchAnswers, code: string): { href: string; coverage: Coverage } {
  if (answers.purpose !== "study") return purposeRoute(code, answers.purpose);
  if (matchingProgrammes(answers, code).length) {
    const field = answers.study?.field;
    const query = new URLSearchParams({ country: code, ...(field && field !== "other" ? { program: field } : {}) });
    return { href: `/explore/universities?${query}`, coverage: "verified" };
  }
  return { href: countryHref(code), coverage: studyResidenceCountries.has(code) ? "verified" : "official-links" };
}

export function computeCountryMatch(answers: MatchAnswers): MatchResult {
  const excluded: MatchResult["excluded"] = [];
  const candidates = euCountryCodes.filter((code) => {
    if (code === answers.citizenship) return false;
    const blocked = blockedFor(answers.citizenship, code);
    if (blocked.length && answers.family?.sponsorCountry !== code) {
      excluded.push({ code, name: countryName(code), title: blocked[0].title, sources: blocked[0].sources });
      return false;
    }
    return true;
  });

  const scored = candidates.map((code) => {
    const ease = easeOfMove(answers, code);
    const lifestyle = lifestyleScore(answers, code);
    return { code, ease, lifestyle, overall: 0.5 * ease.score + 0.5 * lifestyle };
  });

  const byEase = [...scored].sort((a, b) => b.ease.score - a.ease.score || b.lifestyle - a.lifestyle || a.code.localeCompare(b.code));
  const byLifestyle = [...scored].sort((a, b) => b.lifestyle - a.lifestyle || b.ease.score - a.ease.score || a.code.localeCompare(b.code));
  const byOverall = [...scored].sort((a, b) => b.overall - a.overall || b.ease.score - a.ease.score || a.code.localeCompare(b.code));

  const chosen: Array<{ role: MatchRole; item: (typeof scored)[number] }> = [];
  const take = (role: MatchRole, list: typeof scored) => {
    const item = list.find((entry) => !chosen.some((picked) => picked.item.code === entry.code));
    if (item) chosen.push({ role, item });
  };
  take("easiest", byEase);
  take("lifestyle", byLifestyle);
  take("overall", byOverall);

  const picks: CountryPick[] = chosen.map(({ role, item }) => ({
    role,
    code: item.code,
    name: countryName(item.code),
    track: item.ease.track,
    easeFactors: item.ease.factors.slice(0, role === "lifestyle" ? 2 : 4),
    lifestyleReasons: lifestyleReasons(answers, item.code, role === "easiest" ? 2 : 3),
    route: routeFor(answers, item.code),
    countryHref: countryHref(item.code),
  }));

  const notes: MatchNote[] = [];
  if (answers.citizenship === "UA") notes.push(temporaryProtectionNote(""));

  return {
    version: MATCH_VERSION,
    purpose: answers.purpose,
    picks,
    excluded,
    familyOutsideEu: answers.purpose === "family" && !isEuCountry(answers.family?.sponsorCountry ?? null),
    ownCountry: isEuCountry(answers.citizenship) ? answers.citizenship : null,
    notes,
  };
}
