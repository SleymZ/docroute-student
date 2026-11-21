// Labels of the country match answers, shared by the quiz (browser) and the
// result and account pages (server). English; the site translates them.

import type {
  BusinessKind,
  EducationLevel,
  LanguageLevel,
  Lifestyle,
  MatchField,
  MatchPurpose,
  SponsorStatus,
} from "@/lib/country-match-answers";

export type Option<T extends string> = { value: T; label: string };

export const purposeChoices: ReadonlyArray<Option<MatchPurpose> & { text: string }> = [
  { value: "study", label: "Study", text: "A bachelor's or master's degree" },
  { value: "work", label: "Work", text: "A job, with or without an offer yet" },
  { value: "family", label: "Family", text: "Join a family member who lives in the EU" },
  { value: "business", label: "Business", text: "Your own company, freelancing or a startup" },
];

export const educationChoices: ReadonlyArray<Option<EducationLevel>> = [
  { value: "secondary", label: "Secondary school" },
  { value: "bachelor", label: "Bachelor's degree" },
  { value: "master", label: "Master's degree or higher" },
];

export const levelChoices: ReadonlyArray<Option<LanguageLevel>> = [
  { value: "basic", label: "Basic" },
  { value: "good", label: "Good" },
  { value: "fluent", label: "Fluent or native" },
];

export const fieldChoices: ReadonlyArray<Option<MatchField>> = [
  { value: "Computer Science", label: "Computer Science" },
  { value: "Medicine", label: "Medicine" },
  { value: "Law", label: "Law" },
  { value: "Economics & Business", label: "Economics & Business" },
  { value: "other", label: "Something else" },
];

export const sponsorChoices: ReadonlyArray<Option<SponsorStatus>> = [
  { value: "citizen", label: "A citizen of that country" },
  { value: "eu-citizen", label: "A citizen of another EU country" },
  { value: "resident", label: "A non-EU citizen with a residence permit" },
  { value: "unsure", label: "Not sure" },
];

export const businessChoices: ReadonlyArray<Option<BusinessKind>> = [
  { value: "company", label: "Start a company" },
  { value: "self-employed", label: "Work as self-employed or freelancer" },
  { value: "startup", label: "Start an innovative startup" },
  { value: "unsure", label: "Not sure yet" },
];

export const lifestyleQuestions: ReadonlyArray<{
  key: keyof Lifestyle;
  legend: string;
  /** Short name for the summary of answers. */
  short: string;
  options: ReadonlyArray<Option<string>>;
}> = [
  {
    key: "city",
    legend: "Where do you feel at home?",
    short: "Places",
    options: [
      { value: "busy", label: "Big, busy cities" },
      { value: "both", label: "A bit of both" },
      { value: "quiet", label: "Smaller, quieter places" },
    ],
  },
  {
    key: "winter",
    legend: "Winters",
    short: "Winters",
    options: [
      { value: "love", label: "I like real winters" },
      { value: "ok", label: "I don't mind" },
      { value: "mild", label: "As mild as possible" },
    ],
  },
  {
    key: "summer",
    legend: "Summers",
    short: "Summers",
    options: [
      { value: "hot", label: "The hotter, the better" },
      { value: "ok", label: "I don't mind" },
      { value: "cool", label: "I prefer cool summers" },
    ],
  },
  {
    key: "budget",
    legend: "Your budget for everyday life",
    short: "Budget",
    options: [
      { value: "tight", label: "Tight: every euro counts" },
      { value: "average", label: "Average" },
      { value: "comfortable", label: "Comfortable" },
    ],
  },
  {
    key: "rhythm",
    legend: "Work and life rhythm",
    short: "Rhythm",
    options: [
      { value: "free-time", label: "More free time" },
      { value: "balanced", label: "Balanced" },
      { value: "ambitious", label: "Career first" },
    ],
  },
  {
    key: "language",
    legend: "Language in daily life",
    short: "Language",
    options: [
      { value: "foreign-ok", label: "I want to manage without the local language" },
      { value: "learn", label: "I'm ready to learn the local language" },
      { value: "either", label: "Either is fine" },
    ],
  },
  {
    key: "people",
    legend: "People around you",
    short: "People",
    options: [
      { value: "international", label: "Very international" },
      { value: "mix", label: "A mix" },
      { value: "locals", label: "Mostly locals" },
    ],
  },
  {
    key: "safety",
    legend: "A very safe neighbourhood",
    short: "Safety",
    options: [
      { value: "very", label: "Top priority" },
      { value: "somewhat", label: "Important" },
      { value: "less", label: "Not a deciding factor" },
    ],
  },
  {
    key: "jobs",
    legend: "A strong job market",
    short: "Jobs",
    options: [
      { value: "top", label: "Top priority" },
      { value: "matters", label: "It matters" },
      { value: "no", label: "Not important" },
    ],
  },
];

export const roleLabels: Record<"easiest" | "lifestyle" | "overall", string> = {
  easiest: "Easiest to move to",
  lifestyle: "Fits how you want to live",
  overall: "Best all-round",
};

export function labelOf<T extends string>(options: ReadonlyArray<Option<T>>, value: T | null | undefined) {
  return options.find((option) => option.value === value)?.label ?? "";
}
