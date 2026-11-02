import type { RouteSource, RouteStage, RouteTask } from "@/types/route-preview";

// What changes for a particular passport, added as its own stage to the
// residence guides and the full study path. Only facts from official
// sources; India first (owner decision 2026-11-02), other citizenships
// later. Checked 2026-11-02.

const checked = "2026-11-02";

const sources = {
  euVisaList: {
    id: "eu-reg-2018-1806",
    title: "Regulation (EU) 2018/1806: list of countries whose nationals need a visa (Annex I, consolidated 30 Dec 2025)",
    publisher: "EUR-Lex, European Union",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230",
    checkedAt: checked,
    authority: "official",
  },
  irelandVisaList: {
    id: "ie-visa-required-nationalities",
    title: "List of visa required and non-visa required nationalities (updated 12 May 2025)",
    publisher: "Government of Ireland",
    url: "https://assets.ireland.ie/documents/List_of_Visa_Required_Non_Visa_Required_Nationalities_-_May_2025.pdf",
    checkedAt: checked,
    authority: "official",
  },
  irelandVisaOffices: {
    id: "ie-visa-offices",
    title: "Visa offices (updated 22 May 2026)",
    publisher: "Immigration Service Delivery, Ireland",
    url: "https://www.irishimmigration.ie/visa-offices/",
    checkedAt: checked,
    authority: "official",
  },
  swissVisaList: {
    id: "ch-sem-visa-list-i",
    title: "ID and visa provisions by nationality, letter I (version of 3 April 2026)",
    publisher: "State Secretariat for Migration SEM",
    url: "https://www.sem.admin.ch/sem/en/home/publiservice/weisungen-kreisschreiben/visa/liste1_staatsangehoerigkeit/i.html",
    checkedAt: checked,
    authority: "official",
  },
  meaApostille: {
    id: "in-mea-apostille",
    title: "Attestation / Apostille",
    publisher: "Ministry of External Affairs, Government of India",
    url: "https://www.mea.gov.in/apostille-menu",
    checkedAt: checked,
    authority: "official",
  },
} satisfies Record<string, RouteSource>;

export const citizenshipNoteSources: readonly RouteSource[] = Object.values(sources);

export const citizenshipNoteCountries = ["IN"] as const;

export type NotePurpose = "study" | "work" | "family" | "business";

export function hasCitizenshipNotes(citizenship: string | null | undefined) {
  return (citizenshipNoteCountries as readonly string[]).includes((citizenship ?? "").toUpperCase());
}

function indiaVisaTask(countryCode: string, countryName: string): { task: RouteTask; sources: RouteSource[] } {
  if (countryCode === "IE") {
    return {
      task: {
        id: "in-visa",
        title: "Indian citizens need an Irish visa",
        description:
          "India is on Ireland's list of visa-required nationalities. Applications from India are handled by the Irish visa office in New Delhi. Ireland is not in Schengen, so a Schengen visa does not cover it.",
        status: "attention",
        sourceIds: [sources.irelandVisaList.id, sources.irelandVisaOffices.id],
      },
      sources: [sources.irelandVisaList, sources.irelandVisaOffices],
    };
  }
  if (countryCode === "CH") {
    return {
      task: {
        id: "in-visa",
        title: "Indian citizens need a Swiss visa, also for long stays",
        description:
          "Switzerland's visa list marks India as visa-required both for stays up to 90 days and for longer stays. Apply through the Swiss representation responsible for India before you travel.",
        status: "attention",
        sourceIds: [sources.swissVisaList.id],
      },
      sources: [sources.swissVisaList],
    };
  }
  return {
    task: {
      id: "in-visa",
      title: `Indian citizens need a visa to enter ${countryName}`,
      description:
        "India is on the EU list of countries whose nationals need a visa (Annex I). Do not travel on a visa-free basis: get the visa or residence permit the official page describes before you go, at the embassy or consulate responsible for India.",
      status: "attention",
      sourceIds: [sources.euVisaList.id],
    },
    sources: [sources.euVisaList],
  };
}

function apostilleTask(purpose: NotePurpose): RouteTask {
  const documents =
    purpose === "family"
      ? "marriage and birth certificates"
      : purpose === "study"
        ? "school certificates and birth certificate"
        : "personal and educational documents (for business papers, ask the authority)";
  return {
    id: "in-apostille",
    title: "Apostille Indian documents through the MEA",
    description: `If the authority asks for legalised Indian documents (${documents}), India uses the MEA apostille (India joined the Hague Apostille Convention in 2005). The document must first be authenticated by the state government, union territory or chamber of commerce, and is then submitted through one of the MEA's outsourced agencies, not to the MEA directly. Plan time for this before you apply.`,
    status: "action",
    sourceIds: [sources.meaApostille.id],
  };
}

/** An extra stage for this passport, or null when DocRoute has no notes
 *  for it. EU/EEA/Swiss destinations only. */
export function citizenshipStage(
  citizenship: string | null | undefined,
  countryCode: string,
  countryName: string,
  purpose: NotePurpose,
): { stage: RouteStage; sources: RouteSource[] } | null {
  if ((citizenship ?? "").toUpperCase() !== "IN") return null;
  const visa = indiaVisaTask(countryCode, countryName);
  return {
    stage: {
      id: "citizenship-in",
      number: "00",
      eyebrow: "FOR INDIAN CITIZENS",
      title: "What applies to an Indian passport",
      description: "Checked for Indian citizens. Do these early: visas and apostilles take time.",
      timing: "Before you apply",
      tasks: [visa.task, apostilleTask(purpose)],
    },
    sources: [...visa.sources, sources.meaApostille],
  };
}
