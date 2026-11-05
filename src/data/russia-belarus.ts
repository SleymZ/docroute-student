import type { RouteSource } from "@/types/route-preview";

// Extra restrictions for citizens of Russia and Belarus (plan item 2),
// read on the official pages on 2026-11-05. Only what each page states is
// restated: no fee or processing time, because amounts on these pages date
// from 2022 and have changed for all applicants since. The notes are added
// to every route for these passports (citizenship-notes.ts) and to the
// "Path by passport" block on the country pages.

export const RU_BY_CHECKED = "2026-11-05";

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
  cz: src(
    "cz-ipc-ru-passports",
    "Changes to the recognition of travel documents issued by the Russian Federation (updated 6 January 2025)",
    "Ministry of the Interior of the Czech Republic (ipc.gov.cz)",
    "https://ipc.gov.cz/en/changes-to-the-recognition-of-travel-documents-issued-by-the-russian-federation/",
  ),
} as const;

export type RestrictionNote = {
  id: string;
  title: string;
  description: string;
  sources: RouteSource[];
};

/** Restrictions for a Russian or Belarusian passport in one destination,
 *  most important first. Empty for other passports. */
export function russiaBelarusNotes(citizenship: string, destination: string): RestrictionNote[] {
  const code = citizenship.toUpperCase();
  const country = destination.toUpperCase();
  const notes: RestrictionNote[] = [];

  if (code === "RU") {
    if (country === "EE") {
      notes.push({
        id: "ru-ee-no-visas",
        title: "Estonia does not accept visa applications from Russian citizens",
        description:
          "Estonia accepts no Schengen (C) or national (D) visa applications from Russian citizens, for any purpose. Exceptions: close family of Estonian citizens or long-term residents, family members of EU citizens using free movement, diplomats, transport workers and humanitarian cases. Non-biometric Russian passports are not recognised since 31 March 2025.",
        sources: [ruBySources.ee],
      });
    }
    if (country === "FI") {
      notes.push({
        id: "ru-fi-entry",
        title: "Finland restricts entry of Russian citizens",
        description:
          "Entry is restricted; holders of a residence permit in Finland or another EU/EEA country or Switzerland, or of a long-stay (D) visa, can still arrive. Listed groups (family of Finnish or EU citizens, some workers, short-term students with an invitation) prove their purpose at the border. From 1 June 2026 Finland does not accept non-biometric Russian passports (exceptions for minors and for permits granted before that date).",
        sources: [ruBySources.fi, ruBySources.fiPassports],
      });
    }
    if (country === "LV") {
      notes.push({
        id: "ru-lv-entry",
        title: "Latvia restricts entry of Russian citizens",
        description:
          "Russian citizens may enter from third countries only in the categories of Cabinet Regulation No 123. Holders of a valid Latvian residence permit may enter; family members of Russians holding Latvian residence permits may not, and a business trip on a Schengen visa is not allowed.",
        sources: [ruBySources.lv],
      });
    }
    if (country === "LT") {
      notes.push({
        id: "ru-lt-visas",
        title: "Lithuania has suspended visa applications from Russian citizens",
        description:
          "Visa applications from Russian citizens are not accepted, except where the Ministry of Foreign Affairs acts as intermediary; ask the nearest Lithuanian mission. Entrants face an additional individual check at the external border.",
        sources: [ruBySources.lt],
      });
    }
    if (country === "PL") {
      notes.push({
        id: "ru-pl-entry",
        title: "Poland restricts entry of Russian citizens",
        description:
          "Since 19 September 2022 Russian citizens may enter Poland only in the categories of § 3(2) of the entry regulation, at every border and from any country. Check the categories with the Border Guard or the consulate before you plan the move.",
        sources: [ruBySources.pl],
      });
    }
    if (country === "CZ") {
      notes.push({
        id: "ru-cz-biometric",
        title: "Czechia accepts only biometric Russian passports",
        description:
          "Since 3 July 2024 Czechia recognises only biometric Russian travel documents (transition periods ended in 2024–2025). Without a biometric passport a residence application cannot be granted; exceptions include children under 15.",
        sources: [ruBySources.cz],
      });
    }
    notes.push({
      id: "ru-eu-short-stay",
      title: "Short-stay visas: no visa facilitation for Russia",
      description:
        "The EU fully suspended its visa facilitation agreement with Russia in September 2022: Schengen short-stay visas take longer, need extra supporting documents and multiple-entry visas are issued more strictly. Long-stay visas and residence permits follow each country's rules.",
      sources: [ruBySources.euSuspension],
    });
  }

  if (code === "BY" && country === "EE") {
    notes.push({
      id: "by-ee-visas",
      title: "Estonia: no visas for short-term work or business for Belarusians",
      description:
        "Belarusian citizens are not issued visas for short-term employment, business (including start-ups) or teleworking, and consular services in Minsk are suspended.",
      sources: [ruBySources.ee],
    });
  }

  if ((code === "RU" || code === "BY") && country === "LT") {
    notes.push({
      id: `${code.toLowerCase()}-lt-questionnaire`,
      title: "Lithuania: special questionnaire with any new permit or national visa",
      description:
        "Russian and Belarusian citizens aged 18+ fill in a special questionnaire when applying for a new temporary residence permit or national visa. Without it the application is not accepted; false answers are grounds to revoke the document.",
      sources: [ruBySources.ltQuestionnaire],
    });
  }

  return notes;
}

/** Countries whose own pages add restrictions for this passport. */
export function restrictedFor(citizenship: string): string[] {
  const code = citizenship.toUpperCase();
  if (code === "RU") return ["CZ", "EE", "FI", "LT", "LV", "PL"];
  if (code === "BY") return ["EE", "LT"];
  return [];
}
