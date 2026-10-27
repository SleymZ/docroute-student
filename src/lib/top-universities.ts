import { topCountryGuides } from "@/data/top-universities";
import type {
  TopAdmissionField,
  TopSource,
  TopUniversity,
} from "@/types/top-universities";

export const topAdmissionFields: { field: TopAdmissionField; label: string }[] = [
  { field: "apply", label: "How to apply" },
  { field: "deadline", label: "Deadline" },
  { field: "school", label: "School certificate" },
  { field: "language", label: "Language" },
  { field: "tuition", label: "Tuition (non-EU)" },
];

export type ResolvedTopField = {
  field: TopAdmissionField;
  label: string;
  text: string;
  // "university": stated on this university's own page.
  // "country": the national or general rule for the country.
  scope: "university" | "country";
};

// A university statement wins; otherwise the country's general rule is shown
// and labelled as such. Fields with neither are left out, never guessed.
export function resolveTopAdmissions(university: TopUniversity) {
  const guide = topCountryGuides[university.countryCode];
  const fields: ResolvedTopField[] = [];

  for (const { field, label } of topAdmissionFields) {
    const own = university.admissions[field];
    const general = guide?.[field];
    if (own) fields.push({ field, label, text: own, scope: "university" });
    else if (general) fields.push({ field, label, text: general, scope: "country" });
  }

  const usesCountry = fields.some((item) => item.scope === "country");
  const sources: TopSource[] = [...university.admissions.sources];
  if (usesCountry && guide) {
    for (const source of guide.sources) {
      if (!sources.some((item) => item.url === source.url)) sources.push(source);
    }
  }

  const missing = topAdmissionFields
    .filter(({ field }) => !fields.some((item) => item.field === field))
    .map(({ label }) => label);

  return {
    fields,
    sources,
    missing,
    intake: university.admissions.intake ?? (usesCountry ? guide?.intake : undefined),
    notes: university.admissions.notes,
  };
}
