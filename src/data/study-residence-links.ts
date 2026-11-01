import type { RouteSource } from "@/types/route-preview";

// Official pages for the residence part of the full study path in countries
// where DocRoute has not verified the student residence procedure itself
// (everything except Slovakia and Czechia). They are links to check, not
// verified steps: the full path never states a fee, deadline or document
// list for these countries. All checked 2026-11-01.

const checked = "2026-11-01";

// EU Immigration Portal (European Commission) "Student in <country>" pages.
// Every EU country has one; Denmark's only points to its national portal,
// so Denmark uses that portal directly.
const portalSlugs: Record<string, string> = {
  AT: "austria",
  BE: "belgium",
  BG: "bulgaria",
  CY: "cyprus",
  DE: "germany",
  EE: "estonia",
  ES: "spain",
  FI: "finland",
  FR: "france",
  GR: "greece",
  HR: "croatia",
  HU: "hungary",
  IE: "ireland",
  IT: "italy",
  LT: "lithuania",
  LU: "luxembourg",
  LV: "latvia",
  MT: "malta",
  NL: "netherlands",
  PL: "poland",
  PT: "portugal",
  RO: "romania",
  SE: "sweden",
  SI: "slovenia",
};

const portalNames: Record<string, string> = { NL: "the Netherlands" };

function portalSource(countryCode: string, countryName: string): RouteSource {
  const slug = portalSlugs[countryCode];
  const name = portalNames[countryCode] ?? countryName;
  return {
    id: `eu-portal-student-${countryCode.toLowerCase()}`,
    title: `Student in ${name}: conditions, procedures and rights`,
    publisher: "European Commission, EU Immigration Portal",
    url: `https://home-affairs.ec.europa.eu/policies/migration-and-asylum/eu-immigration-portal/student-${slug}_en`,
    checkedAt: checked,
    authority: "official",
  };
}

const denmarkSource: RouteSource = {
  id: "dk-nyidanmark-higher-education",
  title: "Higher educational programmes: residence permit for study",
  publisher: "Danish Agency for International Recruitment and Integration (New to Denmark)",
  url: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Study/Higher-Education",
  checkedAt: checked,
  authority: "official",
};

// Swiss federal portal: covers both EU/EFTA and non-EU/EFTA students.
export const switzerlandStudySource: RouteSource = {
  id: "ch-living-without-gainful-employment",
  title: "Living as a foreign national in Switzerland without work (students)",
  publisher: "Swiss Confederation, ch.ch",
  url: "https://www.ch.ch/en/foreign-nationals-in-switzerland/entry-and-stay-in-switzerland/living-in-switzerland-without-gainful-employment/",
  checkedAt: checked,
  authority: "official",
};

// EU citizens studying in another EU country (Your Europe, last checked by
// the Commission on 30 Sep 2026): enrolment, enough resources, comprehensive
// health insurance; registration may be required after 3 months.
export const euStudentResidenceSource: RouteSource = {
  id: "eu-youreurope-student-residence",
  title: "Students abroad in the EU: residence right",
  publisher: "European Union, Your Europe",
  url: "https://europa.eu/youreurope/citizens/residence/residence-rights/students/index_en.htm",
  checkedAt: checked,
  authority: "official",
};

/** The official page a non-EU student should read for this country, or null
 *  when DocRoute has none (Slovakia and Czechia use verified routes). */
export function thirdCountryStudySource(
  countryCode: string,
  countryName: string,
): RouteSource | null {
  if (countryCode === "CH") return switzerlandStudySource;
  if (countryCode === "DK") return denmarkSource;
  if (portalSlugs[countryCode]) return portalSource(countryCode, countryName);
  return null;
}

export const studyResidenceLinkCountries = [
  ...Object.keys(portalSlugs),
  "DK",
  "CH",
].sort();
