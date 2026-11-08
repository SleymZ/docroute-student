import type { RestrictionNote } from "@/data/russia-belarus";
import type { RouteSource } from "@/types/route-preview";

// Passports of countries in war or crisis where Czechia has no visa service
// of its own: the Czech Foreign Ministry's list of territorial districts
// assigns their visa and residence applications to an embassy in another
// country. Read on 2026-11-08. Only what the two official pages state: the
// competent embassy, and that a long-stay or residence application may also
// be filed where the applicant holds long-term or permanent residence after
// at least 2 years, and that inside the Schengen area all Czech visa
// services are at the visa centre in Dresden. No fees or processing times. Venezuela is left out: its
// citizens may apply at any Czech embassy.

export const EMBASSY_ACCESS_CHECKED = "2026-11-08";

const czDistricts: RouteSource = {
  id: "cz-mzv-territorial-districts",
  title: "Territorial districts of Czech embassies for visa and residence applications",
  publisher: "Ministry of Foreign Affairs of the Czech Republic",
  url: "https://mzv.gov.cz/jnp/cz/informace_pro_cizince/kde_podat_zadost_o_vizum/uzemni_obvody_zastupitelskych_uradu.html",
  checkedAt: EMBASSY_ACCESS_CHECKED,
  authority: "official",
};

const czLocalCompetence: RouteSource = {
  id: "cz-mzv-local-competence",
  title: "Where to apply: local consular competence (long-stay visas and residence)",
  publisher: "Ministry of Foreign Affairs of the Czech Republic",
  url: "https://mzv.gov.cz/jnp/cz/informace_pro_cizince/pobytova_opravneni_k_pobytu_nad_90_dnu/mistni_prislusnost_zu_v_rizeni_o_vizum_a/index.html",
  checkedAt: EMBASSY_ACCESS_CHECKED,
  authority: "official",
};

const czWhereToApply: RouteSource = {
  id: "cz-mzv-where-to-apply",
  title: "Where to apply for a visa (Schengen area: visa centre at the Consulate General in Dresden)",
  publisher: "Ministry of Foreign Affairs of the Czech Republic",
  url: "https://mzv.gov.cz/jnp/cz/informace_pro_cizince/kde_podat_zadost_o_vizum/index.html",
  checkedAt: EMBASSY_ACCESS_CHECKED,
  authority: "official",
};

/** Citizenship → the Czech embassy (city, country) that takes its visa and
 *  residence applications, from the ministry's district list. */
export const czechEmbassyAbroad: Readonly<Record<string, string>> = {
  AF: "Islamabad, Pakistan",
  SY: "Beirut, Lebanon",
  YE: "Cairo, Egypt, or Riyadh, Saudi Arabia",
  SD: "Cairo, Egypt",
  SS: "Addis Ababa, Ethiopia",
  SO: "Addis Ababa, Ethiopia",
  LY: "Tunis, Tunisia",
  PS: "Cairo, Egypt (Gaza Strip) or Amman, Jordan (West Bank)",
  ER: "Cairo, Egypt",
  HT: "Havana, Cuba",
  MM: "Bangkok, Thailand",
  ML: "Dakar, Senegal",
  BF: "Accra, Ghana",
  NE: "Abuja, Nigeria",
  CF: "Abuja, Nigeria",
  KP: "Beijing, China",
};

/** "Restricted" note: no Czech visa service in the home country, and where
 *  to apply instead. Empty for other passports or destinations. */
export function embassyAccessNotes(citizenship: string, destination: string): RestrictionNote[] {
  const code = citizenship.toUpperCase();
  const embassy = czechEmbassyAbroad[code];
  if (destination.toUpperCase() !== "CZ" || !embassy) return [];
  return [
    {
      id: `${code.toLowerCase()}-cz-embassy-abroad`,
      title: `No Czech visa service in your country: apply in ${embassy}`,
      description: `Czech visa and residence applications from citizens of this country are handled by the Czech embassy in ${embassy}. You need to travel there and stay there legally for the appointment and the decision.`,
      severity: "restricted",
      solution: `Book an appointment at the Czech embassy in ${embassy}. If you have held long-term or permanent residence in another country outside the Schengen area for at least 2 years, you can apply for a long-stay visa or residence at the Czech office competent for that country instead. If you live in a Schengen country, Czech visa services there are provided only by the visa centre at the Czech Consulate General in Dresden.`,
      sources: [czDistricts, czLocalCompetence, czWhereToApply],
    },
  ];
}
