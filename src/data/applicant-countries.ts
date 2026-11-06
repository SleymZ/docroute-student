import catalog from "@/data/universities.json";
import { apostilleParties, schengenVisaFree, schengenVisaRequired } from "@/data/citizenship-lists";
import { regionName } from "@/data/region-names";

// Countries offered for citizenship and education: every catalog country
// plus common origin countries. "ZZ" stands for any other country.
const applicantCountries = [
  ["IL", "Israel"],
  ["IN", "India"],
  ["US", "United States"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["AE", "United Arab Emirates"],
  ["KZ", "Kazakhstan"],
  ["UZ", "Uzbekistan"],
  ["CN", "China"],
  ["JP", "Japan"],
  ["KR", "South Korea"],
  ["PK", "Pakistan"],
  ["BD", "Bangladesh"],
  ["NP", "Nepal"],
  ["LK", "Sri Lanka"],
  ["EG", "Egypt"],
  ["MA", "Morocco"],
  ["NG", "Nigeria"],
  ["ZA", "South Africa"],
  ["BR", "Brazil"],
  ["MX", "Mexico"],
  ["ZZ", "Other country"],
] as const;

export const applicantCountryOptions = [
  ...new Map([
    ...catalog.universities.map(
      (university) =>
        [university.countryCode, university.country] as const,
    ),
    ...applicantCountries,
  ]).entries(),
]
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

const listedCodes = new Set(applicantCountryOptions.map((option) => option.code));

/** Citizenships for passport notes: the applicant countries plus every
 *  country on the EU visa lists or in the Apostille Convention, so any
 *  passport can be chosen. */
export const citizenshipCountryOptions = [
  ...applicantCountryOptions,
  ...[...new Set([...schengenVisaRequired, ...schengenVisaFree, ...apostilleParties])]
    .filter((code) => !listedCodes.has(code))
    .map((code) => ({ code, name: code === "PS" ? "Palestinian territories" : regionName(code) })),
].sort((a, b) => (a.code === "ZZ" ? 1 : b.code === "ZZ" ? -1 : a.name.localeCompare(b.name, "en")));
