// Answers of the country match quiz (/account/match): the types, the
// choices and the check that turns untrusted JSON (the saved row) into
// answers. Light on purpose, so the quiz in the browser can import it; the
// scoring with the country data lives in country-match.ts (server only).

import { isCitizenshipCode } from "@/data/region-names";

export const MATCH_VERSION = 1;

export const matchPurposes = ["study", "work", "family", "business"] as const;
export type MatchPurpose = (typeof matchPurposes)[number];

export const matchFields = ["Computer Science", "Medicine", "Law", "Economics & Business", "other"] as const;
export type MatchField = (typeof matchFields)[number];

export const languageLevels = ["basic", "good", "fluent"] as const;
export type LanguageLevel = (typeof languageLevels)[number];

export const educationLevels = ["secondary", "bachelor", "master"] as const;
export type EducationLevel = (typeof educationLevels)[number];

export const sponsorStatuses = ["citizen", "eu-citizen", "resident", "unsure"] as const;
export type SponsorStatus = (typeof sponsorStatuses)[number];

export const businessKinds = ["company", "self-employed", "startup", "unsure"] as const;
export type BusinessKind = (typeof businessKinds)[number];

export type Lifestyle = {
  city: "busy" | "both" | "quiet";
  winter: "love" | "ok" | "mild";
  summer: "hot" | "ok" | "cool";
  budget: "tight" | "average" | "comfortable";
  rhythm: "free-time" | "balanced" | "ambitious";
  language: "foreign-ok" | "learn" | "either";
  people: "international" | "mix" | "locals";
  safety: "very" | "somewhat" | "less";
  jobs: "top" | "matters" | "no";
};

export const lifestyleOptions: { readonly [K in keyof Lifestyle]: readonly Lifestyle[K][] } = {
  city: ["busy", "both", "quiet"],
  winter: ["love", "ok", "mild"],
  summer: ["hot", "ok", "cool"],
  budget: ["tight", "average", "comfortable"],
  rhythm: ["free-time", "balanced", "ambitious"],
  language: ["foreign-ok", "learn", "either"],
  people: ["international", "mix", "locals"],
  safety: ["very", "somewhat", "less"],
  jobs: ["top", "matters", "no"],
};

export const lifestyleKeys = Object.keys(lifestyleOptions) as Array<keyof Lifestyle>;

export type MatchAnswers = {
  version: typeof MATCH_VERSION;
  purpose: MatchPurpose;
  citizenship: string;
  /** Country the person lives in now; null when not given. */
  livesIn: string | null;
  /** Holds a residence permit or long-stay visa where they live. */
  residentWhereLives: boolean;
  education: EducationLevel;
  languages: Array<{ code: string; level: LanguageLevel }>;
  study: { field: MatchField; english: boolean } | null;
  work: { offerCountry: string | null } | null;
  family: { sponsorCountry: string | null; sponsorStatus: SponsorStatus } | null;
  business: { kind: BusinessKind } | null;
  lifestyle: Lifestyle;
};

/** Languages offered in the quiz: every official EU language plus the
 *  languages most applicants speak, as ISO 639-1 codes. */
export const matchLanguages: ReadonlyArray<{ code: string; name: string }> = [
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "cs", name: "Czech" },
  { code: "sk", name: "Slovak" },
  { code: "hu", name: "Hungarian" },
  { code: "ro", name: "Romanian" },
  { code: "bg", name: "Bulgarian" },
  { code: "hr", name: "Croatian" },
  { code: "sl", name: "Slovenian" },
  { code: "el", name: "Greek" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "et", name: "Estonian" },
  { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" },
  { code: "mt", name: "Maltese" },
  { code: "ga", name: "Irish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ru", name: "Russian" },
  { code: "tr", name: "Turkish" },
  { code: "ar", name: "Arabic" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "zh", name: "Chinese" },
];

export function languageName(code: string) {
  return matchLanguages.find((language) => language.code === code)?.name ?? code;
}

/** Size limit for the saved answers (the database checks it too). */
export const MAX_LANGUAGES = 12;

function pick<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function countryCode(value: unknown): string | null {
  const code = typeof value === "string" ? value.toUpperCase() : "";
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

/** Answers from untrusted JSON (the saved row or the form), or null. */
export function parseMatchAnswers(input: unknown): MatchAnswers | null {
  const raw = record(input);
  if (!raw) return null;
  const purpose = pick(raw.purpose, matchPurposes);
  const citizenship = countryCode(raw.citizenship);
  const education = pick(raw.education, educationLevels);
  if (!purpose || !citizenship || !isCitizenshipCode(citizenship) || !education) return null;

  const lifestyleRaw = record(raw.lifestyle);
  if (!lifestyleRaw) return null;
  const lifestyle: Partial<Record<keyof Lifestyle, string>> = {};
  for (const key of lifestyleKeys) {
    const value = pick(lifestyleRaw[key], lifestyleOptions[key] as readonly string[]);
    if (!value) return null;
    lifestyle[key] = value;
  }

  const languages: MatchAnswers["languages"] = [];
  if (Array.isArray(raw.languages)) {
    for (const item of raw.languages) {
      const row = record(item);
      const code =
        row && typeof row.code === "string" && matchLanguages.some((language) => language.code === row.code)
          ? row.code
          : null;
      const level = row ? pick(row.level, languageLevels) : null;
      if (!code || !level || languages.some((language) => language.code === code)) continue;
      languages.push({ code, level });
      if (languages.length === MAX_LANGUAGES) break;
    }
  }

  const livesIn = countryCode(raw.livesIn);
  const studyRaw = record(raw.study);
  const workRaw = record(raw.work);
  const familyRaw = record(raw.family);
  const businessRaw = record(raw.business);

  return {
    version: MATCH_VERSION,
    purpose,
    citizenship,
    livesIn,
    residentWhereLives: Boolean(livesIn) && livesIn !== citizenship && raw.residentWhereLives === true,
    education,
    languages,
    study:
      purpose === "study"
        ? { field: pick(studyRaw?.field, matchFields) ?? "other", english: studyRaw?.english === true }
        : null,
    work: purpose === "work" ? { offerCountry: countryCode(workRaw?.offerCountry) } : null,
    family:
      purpose === "family"
        ? {
            sponsorCountry: countryCode(familyRaw?.sponsorCountry),
            sponsorStatus: pick(familyRaw?.sponsorStatus, sponsorStatuses) ?? "unsure",
          }
        : null,
    business: purpose === "business" ? { kind: pick(businessRaw?.kind, businessKinds) ?? "unsure" } : null,
    lifestyle: lifestyle as Lifestyle,
  };
}

/** CEFR level from the study profile, as a quiz level. */
export function levelFromCefr(level: string): LanguageLevel {
  if (level === "C1" || level === "C2" || level === "native") return "fluent";
  if (level === "B1" || level === "B2") return "good";
  return "basic";
}
