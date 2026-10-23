import catalog from "@/data/universities.json";

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
