import type { RouteSource } from "@/types/route-preview";

// European Commission, EU Immigration Portal: one page per country and
// category ("Family member in Germany", "Self-employed worker in Germany").
// All 27 EU countries have both pages (checked 2026-11-02). Denmark's pages
// only point to its national portal, so Denmark uses nyidanmark.dk instead.

export const PORTAL_CHECKED = "2026-11-02";

export const euPortalCountries: Record<string, { slug: string; name: string }> = {
  AT: { slug: "austria", name: "Austria" },
  BE: { slug: "belgium", name: "Belgium" },
  BG: { slug: "bulgaria", name: "Bulgaria" },
  HR: { slug: "croatia", name: "Croatia" },
  CY: { slug: "cyprus", name: "Cyprus" },
  CZ: { slug: "czechia", name: "Czechia" },
  DK: { slug: "denmark", name: "Denmark" },
  EE: { slug: "estonia", name: "Estonia" },
  FI: { slug: "finland", name: "Finland" },
  FR: { slug: "france", name: "France" },
  DE: { slug: "germany", name: "Germany" },
  GR: { slug: "greece", name: "Greece" },
  HU: { slug: "hungary", name: "Hungary" },
  IE: { slug: "ireland", name: "Ireland" },
  IT: { slug: "italy", name: "Italy" },
  LV: { slug: "latvia", name: "Latvia" },
  LT: { slug: "lithuania", name: "Lithuania" },
  LU: { slug: "luxembourg", name: "Luxembourg" },
  MT: { slug: "malta", name: "Malta" },
  NL: { slug: "netherlands", name: "the Netherlands" },
  PL: { slug: "poland", name: "Poland" },
  PT: { slug: "portugal", name: "Portugal" },
  RO: { slug: "romania", name: "Romania" },
  SK: { slug: "slovakia", name: "Slovakia" },
  SI: { slug: "slovenia", name: "Slovenia" },
  ES: { slug: "spain", name: "Spain" },
  SE: { slug: "sweden", name: "Sweden" },
};

export type PortalCategory = "family-member" | "self-employed-worker";

const categoryTitles: Record<PortalCategory, string> = {
  "family-member": "Family member",
  "self-employed-worker": "Self-employed worker",
};

export function euPortalSource(category: PortalCategory, countryCode: string): RouteSource | null {
  const country = euPortalCountries[countryCode];
  if (!country) return null;
  return {
    id: `eu-portal-${category}-${countryCode.toLowerCase()}`,
    title: `${categoryTitles[category]} in ${country.name}: conditions, procedures and rights`,
    publisher: "European Commission, EU Immigration Portal",
    url: `https://home-affairs.ec.europa.eu/policies/migration-and-asylum/eu-immigration-portal/${category}-${country.slug}_en`,
    checkedAt: PORTAL_CHECKED,
    authority: "official",
  };
}
