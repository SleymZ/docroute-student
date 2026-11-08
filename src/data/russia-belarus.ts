import { embassyAccessNotes } from "@/data/embassy-access";
import { euVisaMeasureNotes } from "@/data/eu-visa-measures";
import type { RouteSource } from "@/types/route-preview";

// Extra restrictions for citizens of Russia and Belarus (plan item 2),
// read on the official pages on 2026-11-05 (Czech visa ban: 2026-11-08). Only what each page states is
// restated: no fee or processing time, because amounts on these pages date
// from 2022 and have changed for all applicants since. The notes are added
// to every route for these passports (citizenship-notes.ts) and to the
// "Path by passport" block on the country pages.

export const RU_BY_CHECKED = "2026-11-05";

/** Schengen members among the destination pages (the 27 EU members and
 *  Switzerland, without Ireland and Cyprus): EU Schengen visa rules apply. */
export const SCHENGEN: ReadonlySet<string> = new Set([
  "AT", "BE", "BG", "HR", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IT", "LV",
  "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "CH",
]);

function src(id: string, title: string, publisher: string, url: string): RouteSource {
  return { id, title, publisher, url, checkedAt: RU_BY_CHECKED, authority: "official" };
}

export const ruBySources = {
  euSuspension: src(
    "eu-council-ru-visa-facilitation-suspended",
    "Council adopts full suspension of visa facilitation with Russia (9 September 2022)",
    "Council of the European Union",
    "https://www.consilium.europa.eu/en/press/press-releases/2022/09/09/council-adopts-full-suspension-of-visa-facilitation-with-russia/",
  ),
  fi: src("fi-raja-ru-entry", "Restrictions on the entry of Russian citizens", "Finnish Border Guard", "https://raja.fi/en/entry-restrictions"),
  fiPassports: src(
    "fi-um-ru-non-biometric-2026",
    "Finland to refuse non-biometric passports issued by Russia as of 1 June 2026",
    "Ministry for Foreign Affairs of Finland",
    "https://um.fi/current-affairs/-/asset_publisher/gc654PySnjTX/content/suomi-ei-hyvaksy-venajan-myontamia-ei-biometrisia-passeja-1.6.2026-alkaen",
  ),
  ee: src(
    "ee-vm-ru-by-visa-restrictions",
    "Restrictions on accepting visa applications for Russian and Belarusian citizens",
    "Ministry of Foreign Affairs of Estonia",
    "https://vm.ee/en/consular-visa-and-travel-information/visa-information/restrictions-accepting-visa-applications",
  ),
  lv: src(
    "lv-mfa-ru-entry-faq",
    "Frequently asked questions about entry into Latvia by citizens of the Russian Federation (updated 1 September 2025)",
    "Ministry of Foreign Affairs of Latvia",
    "https://www.mfa.gov.lv/en/frequently-asked-questions",
  ),
  lt: src("lt-urm-russia", "Travelling to Lithuania: Russia", "Ministry of Foreign Affairs of Lithuania", "https://keliauk.urm.lt/en/incoming/rusija"),
  ltQuestionnaire: src(
    "lt-migracija-ru-by-questionnaire",
    "Special questionnaire for foreigners wishing to settle in Lithuania (updated 21 June 2023)",
    "Migration Department of Lithuania",
    "https://migracija.lrv.lt/en/news/special-questionnaire-for-foreigners-wishing-to-settle-in-lithuania/",
  ),
  pl: src(
    "pl-sg-ru-entry",
    "Russia: restrictions against Russian citizens (19 July 2024)",
    "Polish Border Guard",
    "https://www.strazgraniczna.pl/pl/cudzoziemcy/obowiazujace-ograniczenia/13494,EN-RUSSIA-RESTRICTIONS-AGAINST-RUSSIAN-CITIZENS.html",
  ),
  czVisaBan: {
    id: "cz-mzv-ru-by-visa-services",
    title: "Visa services for citizens of Russia and Belarus (Government Decree No. 55/2024; updated 9 February 2026)",
    publisher: "Ministry of Foreign Affairs of the Czech Republic",
    url: "https://mzv.gov.cz/jnp/cz/informace_pro_cizince/aktuality/vizove_sluzby_pro_obcany_ruska_a.html",
    checkedAt: "2026-11-08",
    authority: "official",
  },
  czMoscow: {
    id: "cz-mzv-moscow-visa-activity",
    title: "Current visa activity of the consular section (Embassy in Moscow)",
    publisher: "Ministry of Foreign Affairs of the Czech Republic",
    url: "https://mzv.gov.cz/moscow/cz/viza_a_konzularni_informace/aktualni_vizova_cinnost_konzularniho/index.html",
    checkedAt: "2026-11-08",
    authority: "official",
  },
  euMultipleEntry: {
    id: "ec-ru-multiple-entry-2025",
    title: "Commission implementing decision establishing rules on the issuing of multiple-entry visas to Russian nationals (7 November 2025)",
    publisher: "European Commission, Migration and Home Affairs",
    url: "https://home-affairs.ec.europa.eu/commission-implementing-decision-establishing-rules-issuing-multiple-entry-visas-russian-nationals_en",
    checkedAt: "2026-11-08",
    authority: "official",
  },
  euOccupied: {
    id: "eu-dec-2022-2512",
    title: "Decision (EU) 2022/2512 on the non-acceptance of travel documents of the Russian Federation issued in Ukraine and Georgia",
    publisher: "EUR-Lex, European Union",
    url: "https://eur-lex.europa.eu/eli/dec/2022/2512/oj",
    checkedAt: "2026-11-08",
    authority: "official",
  },
  lvPassports: {
    id: "lv-mfa-ru-non-biometric",
    title: "Questions and answers: non-recognition of Russian Federation non-biometric passports in the Republic of Latvia",
    publisher: "Ministry of Foreign Affairs of Latvia",
    url: "https://www.mfa.gov.lv/en/questions-and-answers-non-recognition-russian-federation-non-biometric-passports-republic-latvia",
    checkedAt: "2026-11-08",
    authority: "official",
  },
  euTravelDocs: {
    id: "be-dofi-recognised-travel-documents",
    title: "List of recognised travel documents (links to the European Commission's table)",
    publisher: "Immigration Office of Belgium (DOFI)",
    url: "https://dofi.ibz.be/en/themes/entry/border-control/travel-documents/list-recognised-travel-documents",
    checkedAt: "2026-11-08",
    authority: "official",
  },
  sePassports: {
    id: "se-migrationsverket-ru-non-biometric",
    title: "Russian non-biometric passports will no longer be recognised from 1 October (2026)",
    publisher: "Swedish Migration Agency (Migrationsverket)",
    url: "https://www.migrationsverket.se/en/newsarchive/russiannonbiometricpassportswillnolongerberecognisedfrom1october.5.15b2309e1a04e5ed207d3b.html",
    checkedAt: "2026-11-08",
    authority: "official",
  },
  dkMoscow: {
    id: "dk-um-moscow-visa-applicants",
    title: "Regarding consular and visa services (Embassy of Denmark in Moscow)",
    publisher: "Ministry of Foreign Affairs of Denmark",
    url: "https://um.dk/rusland/en/news/visa-applicants/",
    checkedAt: "2026-11-08",
    authority: "official",
  },
  cz: src(
    "cz-ipc-ru-passports",
    "Changes to the recognition of travel documents issued by the Russian Federation (updated 6 January 2025)",
    "Ministry of the Interior of the Czech Republic (ipc.gov.cz)",
    "https://ipc.gov.cz/en/changes-to-the-recognition-of-travel-documents-issued-by-the-russian-federation/",
  ),
} as const;

/** "blocked": the destination does not accept applications from this
 *  passport, except listed groups; "restricted": possible, with a condition
 *  or a step that solves it; "info": an extra step, not a barrier. */
export type RestrictionSeverity = "blocked" | "restricted" | "info";

export type RestrictionNote = {
  id: string;
  title: string;
  description: string;
  /** Absent = "info". */
  severity?: RestrictionSeverity;
  /** Blocked: who can still apply. Restricted: how to get past it. Only
   *  what the official source states. */
  solution?: string;
  /** Also concerns someone already living in the destination with a
   *  permit or visa (filing there, not at an embassy). Default: no. */
  appliesToResidents?: boolean;
  sources: RouteSource[];
};

/** Restrictions for a Russian or Belarusian passport in one destination,
 *  most important first. Empty for other passports. */
export function russiaBelarusNotes(citizenship: string, destination: string): RestrictionNote[] {
  const code = citizenship.toUpperCase();
  const country = destination.toUpperCase();
  const notes: RestrictionNote[] = [];

  if ((code === "RU" || code === "BY") && country === "CZ") {
    notes.push({
      id: `${code.toLowerCase()}-cz-visa-ban`,
      title:
        code === "RU"
          ? "Czechia does not accept visa or residence applications from Russian citizens"
          : "Czechia does not accept visa or residence applications from Belarusian citizens",
      description:
        "Under Government Decree No. 55/2024, Czech embassies and consulates accept visa and residence applications from citizens of Russia and Belarus only in listed categories, also when you hold a second citizenship. Applications for study, work or business outside those categories are not accepted.",
      severity: "blocked",
      solution:
        code === "RU"
          ? "Family members of EU citizens (short-stay visa), the spouse and children of a foreigner living in Czechia (family reunification), family of asylum holders, holders of a Czech compatriot certificate, Civil Society Program participants, and people whose stay the Czech Foreign Minister certifies as in the Czech interest (for example at proven risk from the regime). Otherwise choose another country."
          : "Belarusian students with a Czech government, Czech Ministry of Education or EU scholarship, family members of EU citizens (short-stay visa), the spouse and children of a foreigner living in Czechia (family reunification), family of asylum holders, holders of a Czech compatriot certificate, Civil Society Program participants, and people whose stay the Czech Foreign Minister certifies as in the Czech interest. Otherwise choose another country.",
      sources: [ruBySources.czVisaBan, ruBySources.czMoscow],
    });
  }

  if (code === "RU") {
    if (country === "EE") {
      notes.push({
        id: "ru-ee-no-visas",
        title: "Estonia does not accept visa applications from Russian citizens",
        description:
          "Estonia accepts no Schengen (C) or national (D) visa applications from Russian citizens, for any purpose. Exceptions: close family of Estonian citizens or long-term residents, family members of EU citizens using free movement, diplomats, transport workers and humanitarian cases. Non-biometric Russian passports are not recognised since 31 March 2025.",
        severity: "blocked",
        solution: "Only the groups listed above can apply. Otherwise choose another country.",
        sources: [ruBySources.ee],
      });
    }
    if (country === "FI") {
      notes.push({
        id: "ru-fi-entry",
        title: "Finland restricts entry of Russian citizens",
        description:
          "Entry is restricted; holders of a residence permit in Finland or another EU/EEA country or Switzerland, or of a long-stay (D) visa, can still arrive. Listed groups (family of Finnish or EU citizens, some workers, short-term students with an invitation) prove their purpose at the border. From 1 June 2026 Finland does not accept non-biometric Russian passports (exceptions for minors and for permits granted before that date).",
        severity: "restricted",
        solution: "Get the Finnish residence permit or a long-stay (D) visa before you travel: holders can still arrive.",
        sources: [ruBySources.fi, ruBySources.fiPassports],
      });
    }
    if (country === "LV") {
      notes.push({
        id: "ru-lv-entry",
        title: "Latvia restricts entry of Russian citizens",
        description:
          "Russian citizens may enter from third countries only in the categories of Cabinet Regulation No 123. Holders of a valid Latvian residence permit may enter; family members of Russians holding Latvian residence permits may not, and a business trip on a Schengen visa is not allowed.",
        severity: "restricted",
        solution: "Get a Latvian residence permit before you travel: holders may enter.",
        sources: [ruBySources.lv],
      });
    }
    if (country === "LT") {
      notes.push({
        id: "ru-lt-visas",
        title: "Lithuania has suspended visa applications from Russian citizens",
        description:
          "Visa applications from Russian citizens are not accepted, except where the Ministry of Foreign Affairs acts as intermediary; ask the nearest Lithuanian mission. Entrants face an additional individual check at the external border.",
        severity: "blocked",
        solution: "Ask the nearest Lithuanian mission whether the Ministry of Foreign Affairs can act as intermediary in your case. Otherwise choose another country.",
        sources: [ruBySources.lt],
      });
    }
    if (country === "PL") {
      notes.push({
        id: "ru-pl-entry",
        title: "Poland restricts entry of Russian citizens",
        description:
          "Since 19 September 2022 Russian citizens may enter Poland only in the categories of § 3(2) of the entry regulation, at every border and from any country. Check the categories with the Border Guard or the consulate before you plan the move.",
        severity: "restricted",
        solution: "Before you plan the move, confirm with the Polish consulate or Border Guard that your purpose is one of the § 3(2) categories.",
        sources: [ruBySources.pl],
      });
    }
    if (country === "CZ") {
      notes.push({
        id: "ru-cz-biometric",
        title: "Czechia accepts only biometric Russian passports",
        description:
          "Since 3 July 2024 Czechia recognises only biometric Russian travel documents (transition periods ended in 2024–2025). Without a biometric passport a residence application cannot be granted; exceptions include children under 15.",
        severity: "restricted",
        solution: "Get a biometric Russian passport before you apply.",
        appliesToResidents: true,
        sources: [ruBySources.cz],
      });
    }
    if (country === "SE") {
      notes.push({
        id: "ru-se-non-biometric",
        title: "Sweden does not recognise non-biometric Russian passports",
        description:
          "Since 1 October 2026 Sweden does not recognise ordinary non-biometric Russian passports: they cannot be used to enter Sweden or to get a visa or residence permit. Until 31 December 2026 they are still accepted with a valid visa or residence permit issued before 1 October 2026 by an EU or Schengen country.",
        severity: "restricted",
        solution: "Apply with a biometric Russian passport (with a chip).",
        appliesToResidents: true,
        sources: [ruBySources.sePassports],
      });
    }
    if (country === "LV") {
      notes.push({
        id: "ru-lv-non-biometric",
        title: "Latvia does not recognise non-biometric Russian passports",
        description:
          "Since 15 July 2025 Latvia does not recognise non-biometric Russian passports. Holders of a valid Latvian residence permit cannot enter Latvia with such a passport either.",
        severity: "restricted",
        solution: "Apply and travel with a biometric Russian passport (with a chip).",
        appliesToResidents: true,
        sources: [ruBySources.lvPassports],
      });
    }
    if (country === "DK") {
      notes.push({
        id: "ru-dk-moscow-closed",
        title: "Denmark's embassy in Moscow takes no visa or residence applications",
        description:
          "The Embassy of Denmark in Moscow does not receive applications for Schengen visas or residence permits to Denmark.",
        severity: "restricted",
        solution: "Apply at a Danish application centre in another country; the Danish Foreign Ministry lists where to apply.",
        sources: [ruBySources.dkMoscow],
      });
    }
    if (SCHENGEN.has(country)) {
      notes.push({
        id: "ru-eu-short-stay",
        title: "Schengen visas for Russians: single entry only and stricter checks",
        description:
          "The EU suspended its visa facilitation agreement with Russia in September 2022. Since 7 November 2025 Russian citizens applying in Russia are issued only single-entry Schengen visas, and every application gets enhanced checks; close family members of EU citizens and of Russians living in the EU are among the exceptions.",
        severity: "restricted",
        solution: "This concerns short-stay (C) visas. Long-stay (D) visas and residence permits follow the destination's own rules: apply for those at its embassy.",
        sources: [ruBySources.euMultipleEntry, ruBySources.euSuspension],
      });
      notes.push({
        id: "ru-eu-occupied-passports",
        title: "Russian passports issued in occupied regions of Ukraine or Georgia are not accepted",
        description:
          "Under Decision (EU) 2022/2512, Schengen countries do not accept Russian travel documents issued in, or to residents of, the Russian-occupied regions of Ukraine (Crimea and Sevastopol, Donetsk, Luhansk, Kherson, Zaporizhzhia) or Abkhazia and South Ossetia, for a visa or to cross the external border.",
        severity: "restricted",
        solution: "Russian passports issued elsewhere are not affected. With an affected passport no Schengen visa can be issued in it.",
        appliesToResidents: true,
        sources: [ruBySources.euOccupied],
      });
      if (!["CZ", "EE", "FI", "LV", "SE"].includes(country)) {
        notes.push({
          id: "ru-eu-non-biometric",
          title: "Non-biometric Russian passports: refused by more and more Schengen countries",
          description:
            "Several Schengen countries no longer recognise non-biometric Russian passports for visas, residence or entry (the Latvian Foreign Ministry names Denmark, Czechia, France, Estonia and Lithuania), and others are following. Each country's position is in the European Commission's table of recognised travel documents.",
          severity: "restricted",
          solution: "Apply with a biometric Russian passport (with a chip).",
          appliesToResidents: true,
          sources: [ruBySources.lvPassports, ruBySources.euTravelDocs],
        });
      }
    }
  }

  if (code === "BY" && country === "EE") {
    notes.push({
      id: "by-ee-visas",
      title: "Estonia: no visas for short-term work or business for Belarusians",
      description:
        "Belarusian citizens are not issued visas for short-term employment, business (including start-ups) or teleworking, and consular services in Minsk are suspended.",
      severity: "restricted",
      solution: "This rule covers short-term work, business and teleworking only. Consular services in Minsk are suspended, so apply at an Estonian mission in another country.",
        sources: [ruBySources.ee],
    });
  }

  if ((code === "RU" || code === "BY") && country === "LT") {
    notes.push({
      id: `${code.toLowerCase()}-lt-questionnaire`,
      title: "Lithuania: special questionnaire with any new permit or national visa",
      description:
        "Russian and Belarusian citizens aged 18+ fill in a special questionnaire when applying for a new temporary residence permit or national visa. Without it the application is not accepted; false answers are grounds to revoke the document.",
      severity: "info",
      sources: [ruBySources.ltQuestionnaire],
    });
  }

  return notes;
}

/** Barriers worth a red warning (blocked or restricted), most serious
 *  first: Russia/Belarus rules and passports whose home country has no
 *  Czech visa service (embassy-access.ts). "Info" notes stay route steps. */
export function passportWarnings(
  citizenship: string,
  destination: string,
  // Already living in the destination with a permit or visa: embassy and
  // entry barriers do not apply, only those marked appliesToResidents.
  options: { existingResident?: boolean } = {},
): RestrictionNote[] {
  const order: Record<RestrictionSeverity, number> = { blocked: 0, restricted: 1, info: 2 };
  return [
    ...russiaBelarusNotes(citizenship, destination),
    ...embassyAccessNotes(citizenship, destination),
    ...euVisaMeasureNotes(citizenship, destination),
  ]
    .filter((item) => item.severity === "blocked" || item.severity === "restricted")
    .filter((item) => !options.existingResident || item.appliesToResidents)
    .sort((a, b) => order[a.severity ?? "info"] - order[b.severity ?? "info"]);
}

/** Countries whose own pages add restrictions for this passport. */
export function restrictedFor(citizenship: string): string[] {
  const code = citizenship.toUpperCase();
  if (code === "RU") return ["CZ", "DK", "EE", "FI", "LT", "LV", "PL", "SE"];
  if (code === "BY") return ["CZ", "EE", "LT"];
  return [];
}
