import catalog from "@/data/universities.json";
import { DEPENDENT_TERRITORIES, REGION_NAMES } from "@/data/region-names";

export type CountryOption = { code: string; name: string };

// Fixed English names that differ from REGION_NAMES on purpose.
const NAME_OVERRIDES: Readonly<Record<string, string>> = {
  PS: "Palestinian territories",
};

function byName(a: CountryOption, b: CountryOption) {
  if (a.code === "ZZ") return 1;
  if (b.code === "ZZ") return -1;
  return a.name.localeCompare(b.name, "en");
}

// Every country and inhabited territory, plus the catalog countries (their
// names as the catalog spells them). "ZZ" stands for "other country" —
// stateless people, or a place missing from the list.
const allPlaces: CountryOption[] = [
  ...new Map<string, string>([
    ...Object.entries(REGION_NAMES).map(([code, name]) => [code, NAME_OVERRIDES[code] ?? name] as const),
    ...catalog.universities.map((university) => [university.countryCode, university.country] as const),
    ["ZZ", "Other country"],
  ]).entries(),
]
  .map(([code, name]) => ({ code, name }))
  .sort(byName);

/** Places people live, study or move from: every country and inhabited
 *  territory, so any country of residence or education can be chosen. */
export const applicantCountryOptions: readonly CountryOption[] = allPlaces;

/** Citizenships: every country with its own nationality (territories whose
 *  people hold another country's passport are left out). */
export const citizenshipCountryOptions: readonly CountryOption[] = allPlaces.filter(
  (country) => !DEPENDENT_TERRITORIES.has(country.code),
);
