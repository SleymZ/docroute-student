import { euPortalCountries } from "@/data/eu-immigration-portal";

// The countries with a page at /countries/xx: all 27 EU members and
// Switzerland. Kept free of heavy data so the home map can import it.

export type CountryPage = { code: string; name: string };

export const countryPages: readonly CountryPage[] = [
  ...Object.entries(euPortalCountries).map(([code, value]) => ({
    code,
    name: value.name.replace(/^the /, ""),
  })),
  { code: "CH", name: "Switzerland" },
].sort((a, b) => a.name.localeCompare(b.name, "en"));

export function findCountryPage(code: string): CountryPage | null {
  return countryPages.find((item) => item.code === code.toUpperCase()) ?? null;
}

export function countryHref(code: string) {
  return `/countries/${code.toLowerCase()}`;
}

export type CountryPurpose = "work" | "family" | "business";
export type Coverage = "verified" | "official-links";

// Countries with DocRoute-verified work/family/business guides
// (src/lib/residence/country-guides.ts; a test keeps the two in step).
export const verifiedGuideCountries: ReadonlySet<string> = new Set(["AT", "CZ", "DE", "CH"]);

/** The route for a purpose in a country, with its depth. */
export function purposeRoute(code: string, purpose: CountryPurpose): { href: string; coverage: Coverage } {
  const country = code.toUpperCase();
  if (country === "SK") return { href: `/route/${purpose}?country=SK`, coverage: "verified" };
  if (country === "CZ" && purpose === "work") return { href: "/route/czechia?country=CZ&purpose=work", coverage: "verified" };
  const verifiedGuide = verifiedGuideCountries.has(country);
  return {
    href: `/route/guide?${new URLSearchParams({ country, purpose }).toString()}`,
    coverage: verifiedGuide ? "verified" : "official-links",
  };
}

