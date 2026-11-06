import type { RouteSource, RouteStage, RouteTask } from "@/types/route-preview";

import {
  CITIZENSHIP_LISTS_CHECKED,
  airportTransitVisaRequired,
  apostilleEntryIntoForce,
  apostilleObjections,
  apostilleParties,
  biometricPassportOnly,
  germanyAnyEmployment,
  germanyVisaFreeLongStay,
  germanyVisaFreeLongStayNoWork,
  germanyWesternBalkans,
  netherlandsMvvExempt,
  schengenVisaFree,
  schengenVisaRequired,
} from "./citizenship-lists";
import { chinaDocumentsNote, chinaNationalityNote, chinaNotes, chinaSources } from "./china-notes";
import { ruBySources, russiaBelarusNotes } from "./russia-belarus";

// What changes for a particular passport, added as its own stage to the
// residence guides, the Slovak routes and the full study path. Every
// citizenship outside the EU/EEA/Switzerland gets the general notes (entry
// visa, airport transit, apostille or legalisation) from the official lists
// in citizenship-lists.ts; some get extra notes where an official source
// grants relief or adds a check (China, India, Ukraine, Germany's and the
// Netherlands' nationality lists). No fee, threshold or deadline is stated.

const checked = "2026-11-02";
const listsChecked = CITIZENSHIP_LISTS_CHECKED;

const sources = {
  euVisaList: {
    id: "eu-reg-2018-1806",
    title: "Regulation (EU) 2018/1806: visa list (Annex I) and visa-free list (Annex II), consolidated 30 Dec 2025",
    publisher: "EUR-Lex, European Union",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230",
    checkedAt: listsChecked,
    authority: "official",
  },
  visaCodeTransit: {
    id: "eu-visa-code-annex-iv",
    title: "Regulation (EC) No 810/2009 (Visa Code), Annex IV: airport transit visa (consolidated 28 Jun 2024)",
    publisher: "EUR-Lex, European Union",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02009R0810-20240628",
    checkedAt: listsChecked,
    authority: "official",
  },
  hcchStatus: {
    id: "hcch-apostille-status",
    title: "Apostille Convention: status table and notifications (last update 30 Jun 2026)",
    publisher: "Hague Conference on Private International Law (HCCH)",
    url: "https://www.hcch.net/en/instruments/conventions/status-table/?cid=41",
    checkedAt: listsChecked,
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
  swissVisaLists: {
    id: "ch-sem-visa-lists",
    title: "Overview of ID and visa provisions according to nationality (Annex CH-1, List 1)",
    publisher: "State Secretariat for Migration SEM",
    url: "https://www.sem.admin.ch/sem/en/home/publiservice/weisungen-kreisschreiben/visa/liste1_staatsangehoerigkeit.html",
    checkedAt: listsChecked,
    authority: "official",
  },
  swissVisaListI: {
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
  germanyAufenthV41: {
    id: "de-aufenthv-41",
    title: "§ 41 Residence Ordinance (AufenthV): privileges for nationals of certain states",
    publisher: "Federal Ministry of Justice, gesetze-im-internet.de",
    url: "https://www.gesetze-im-internet.de/aufenthv/__41.html",
    checkedAt: listsChecked,
    authority: "official",
  },
  germanyBeschV26: {
    id: "de-beschv-26",
    title: "§ 26 Employment Ordinance (BeschV): employment of nationals of certain states",
    publisher: "Federal Ministry of Justice, gesetze-im-internet.de",
    url: "https://www.gesetze-im-internet.de/beschv_2013/__26.html",
    checkedAt: listsChecked,
    authority: "official",
  },
  netherlandsMvv: {
    id: "nl-ind-mvv-exemptions",
    title: "MVV exemptions (last update 6 May 2026)",
    publisher: "Immigration and Naturalisation Service (IND)",
    url: "https://ind.nl/en/mvv-exemptions",
    checkedAt: listsChecked,
    authority: "official",
  },
  netherlandsRequirements: {
    id: "nl-ind-general-requirements",
    title: "Requirements that apply to everyone, including the TB test and its exemptions (last update 20 March 2026)",
    publisher: "Immigration and Naturalisation Service (IND)",
    url: "https://ind.nl/en/requirements-that-apply-to-everyone",
    checkedAt: listsChecked,
    authority: "official",
  },
  euTemporaryProtection: {
    id: "eu-tp-2026-1912",
    title: "Council Implementing Decision (EU) 2026/1912 extending temporary protection for people displaced from Ukraine",
    publisher: "EUR-Lex, European Union",
    url: "https://eur-lex.europa.eu/eli/dec_impl/2026/1912/2026-08-04",
    checkedAt: listsChecked,
    authority: "official",
  },
  denmarkUkraine: {
    id: "dk-ukraine-special-act",
    title: "Extension of residence permit under the Ukraine Special Act (29 Oct 2026)",
    publisher: "Danish Immigration Service (New to Denmark)",
    url: "https://www.nyidanmark.dk/en-GB/News-Front-Page/2026/10/Extension-of-residence-permit-under-the-Ukraine-Special-Act",
    checkedAt: listsChecked,
    authority: "official",
  },
  swissStatusS: {
    id: "ch-sem-status-s",
    title: "Questions and answers for refugees from Ukraine: protection status S",
    publisher: "State Secretariat for Migration SEM",
    url: "https://www.sem.admin.ch/sem/en/home/sem/aktuell/ukraine-krieg.html",
    checkedAt: listsChecked,
    authority: "official",
  },
} satisfies Record<string, RouteSource>;

export const citizenshipNoteSources: readonly RouteSource[] = [...Object.values(sources), ...Object.values(ruBySources), ...Object.values(chinaSources)];

/** Citizenships with notes beyond the general ones. Every citizenship
 *  outside the EU/EEA/Switzerland gets the general notes. */
export const citizenshipNoteCountries = ["CN", "IN", "UA"] as const;

export type NotePurpose = "study" | "work" | "family" | "business";

// EU, EEA and Swiss citizens move under free-movement rules, not these notes.
const euEeaSwiss = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
  "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "CH",
]);

// Statuses that mean the person already lives in the destination with a
// permit or national visa: entry-visa steps do not apply to them.
const existingResidentStatuses = new Set([
  "destination-study-residence",
  "destination-residence",
  "destination-permanent-residence",
  "destination-national-visa",
]);

export function isExistingResidentStatus(status: string | null | undefined) {
  return existingResidentStatuses.has(status ?? "");
}

/** Whether a passport gets notes: any valid citizenship outside the
 *  EU/EEA/Switzerland ("ZZ" is "other country"). */
export function hasCitizenshipNotes(citizenship: string | null | undefined) {
  const code = (citizenship ?? "").toUpperCase();
  return /^[A-Z]{2}$/.test(code) && code !== "ZZ" && !euEeaSwiss.has(code);
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const withArticle = /^(United |Netherlands|Philippines|Bahamas|Gambia|Marshall Islands|Solomon Islands|Comoros|Maldives|Seychelles|Central African|Dominican Republic|Czech)/;

/** English country name for sentences ("the United States", "India"). */
export function citizenshipName(code: string) {
  if (code === "PS") return "the Palestinian territories";
  const name = regionNames.of(code) ?? code;
  return withArticle.test(name) ? `the ${name}` : name;
}

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

type Note = { task: RouteTask; sources: RouteSource[] };

function note(
  id: string,
  title: string,
  description: string,
  status: RouteTask["status"],
  noteSources: RouteSource[],
): Note {
  return { task: { id, title, description, status, sourceIds: noteSources.map((source) => source.id) }, sources: noteSources };
}

// Entry visa for the move. Ireland has its own list; Switzerland applies
// the EU list for short stays and its own list for longer stays; the other
// destinations apply Regulation (EU) 2018/1806.
function entryNote(code: string, name: string, countryCode: string, countryName: string, purpose: NotePurpose): Note | null {
  if (countryCode === "IE") {
    if (code === "IN") {
      return note(
        "citizen-visa",
        "Indian citizens need an Irish visa",
        "India is on Ireland's list of visa-required nationalities. Applications from India are handled by the Irish visa office in New Delhi. Ireland is not in Schengen, so a Schengen visa does not cover it.",
        "attention",
        [sources.irelandVisaList, sources.irelandVisaOffices],
      );
    }
    return note(
      "citizen-visa",
      "Check Ireland's own visa list",
      `Ireland is not in Schengen and keeps its own list of visa-required nationalities. Find ${name} on it before you plan travel; a Schengen visa does not cover Ireland.`,
      "attention",
      [sources.irelandVisaList],
    );
  }

  const required = schengenVisaRequired.includes(code);
  const free = schengenVisaFree.includes(code);
  const biometric = biometricPassportOnly.includes(code)
    ? " The exemption applies only to biometric passports (footnote to Annex II)."
    : "";

  if (countryCode === "CH") {
    if (code === "IN") {
      return note(
        "citizen-visa",
        "Indian citizens need a Swiss visa, also for long stays",
        "Switzerland's visa list marks India as visa-required both for short stays and for longer stays. Apply through the Swiss representation responsible for India before you travel.",
        "attention",
        [sources.swissVisaListI],
      );
    }
    return note(
      "citizen-visa",
      required ? `Citizens of ${name} need a visa for Switzerland` : "Check whether you need a Swiss visa for a long stay",
      required
        ? `${capital(name)} is on the EU visa list, which Switzerland applies to short stays. For a longer stay, SEM's list by nationality shows the visa you need; apply at the Swiss representation before you travel.`
        : `${free ? `${capital(name)} is on the EU visa-free list for short stays.${biometric} ` : ""}For stays longer than a visit, SEM's list by nationality says whether you need a national visa before you travel.`,
      required ? "attention" : "action",
      [sources.swissVisaLists, sources.euVisaList],
    );
  }

  if (required) {
    return note(
      "citizen-visa",
      `Citizens of ${name} need a visa to enter ${countryName}`,
      `${capital(name)} is on the EU list of countries whose nationals need a visa (Annex I). Do not travel on a visa-free basis: get the visa or residence permit the official page describes before you go, at the embassy or consulate responsible for your country.`,
      "attention",
      [sources.euVisaList],
    );
  }

  if (!free) return null;

  // Visa-free for visits; moving still needs a national visa or permit.
  // Some destinations let these nationals apply after entering.
  if (countryCode === "DE") {
    const any = germanyVisaFreeLongStay.includes(code);
    const noWork = germanyVisaFreeLongStayNoWork.includes(code);
    if (any || (noWork && (purpose === "study" || purpose === "family"))) {
      return note(
        "citizen-visa",
        `Citizens of ${name} may apply in Germany`,
        `Under § 41 AufenthV, citizens of ${name} may enter Germany without a visa also for a longer stay and apply for the residence permit at the foreigners authority there${noWork ? ", as long as they do not take up employment (except the activities the rule allows)" : ""}. Apply within the period the rule sets after entry. This does not apply to the ICT Card.`,
        "attention",
        [sources.germanyAufenthV41, sources.euVisaList],
      );
    }
  }

  if (countryCode === "NL" && netherlandsMvvExempt.includes(code)) {
    return note(
      "citizen-visa",
      "No provisional residence permit (MVV) needed",
      `The IND lists ${name} among the nationalities that need no MVV. You apply for the residence permit directly; the IND still checks the other requirements.`,
      "action",
      [sources.netherlandsMvv, sources.euVisaList],
    );
  }

  return note(
    "citizen-visa",
    "No visa for visits, but moving needs a permit",
    `${capital(name)} is on the EU visa-free list (Annex II) for short stays.${biometric} Moving to ${countryName} still needs the national visa or residence permit; the official page says whether you may apply after entering or must apply at the embassy first.`,
    "action",
    [sources.euVisaList],
  );
}

function transitNote(code: string, countryCode: string): Note | null {
  if (countryCode === "IE" || !airportTransitVisaRequired.includes(code)) return null;
  return note(
    "citizen-transit",
    "Changing planes in a Schengen airport may need an airport transit visa",
    "Your nationality is on the EU list of nationals who need an airport transit visa (Visa Code, Annex IV), unless you already hold a visa or residence permit that exempts you. Prefer a direct flight or check the rule before booking a connection.",
    "attention",
    [sources.visaCodeTransit],
  );
}

function documentsLabel(purpose: NotePurpose) {
  return purpose === "family"
    ? "marriage and birth certificates"
    : purpose === "study"
      ? "school certificates and birth certificate"
      : purpose === "work"
        ? "diplomas, certificates and the criminal record extract"
        : "personal and educational documents (for business papers, ask the authority)";
}

function formatIsoDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

function documentsNote(
  code: string,
  name: string,
  countryCode: string,
  countryName: string,
  purpose: NotePurpose,
  asOf: string,
): Note {
  const documents = documentsLabel(purpose);
  const inForceFrom = apostilleEntryIntoForce[code];
  if (inForceFrom && asOf < inForceFrom) {
    return note(
      "citizen-documents",
      "Documents still need legalisation for now",
      `${capital(name)} has joined the Apostille Convention, but it enters into force for ${name} only on ${formatIsoDate(inForceFrom)}. Until then ${documents} have to be legalised in your country and then by an embassy or consulate of ${countryName}; ask the authority in ${countryName} which procedure it accepts.`,
      "attention",
      [sources.hcchStatus],
    );
  }
  if (!apostilleParties.includes(code)) {
    return note(
      "citizen-documents",
      "Documents need legalisation, not an apostille",
      `${capital(name)} is not a party to the Apostille Convention, so ${documents} cannot be apostilled. They usually have to be legalised in your country and then by an embassy or consulate of ${countryName}; ask the authority in ${countryName} which documents and which procedure it accepts.`,
      "attention",
      [sources.hcchStatus],
    );
  }
  if (apostilleObjections[code]?.includes(countryCode)) {
    return note(
      "citizen-documents",
      `The apostille does not apply between ${name} and ${countryName}`,
      `${capital(countryName)} objected to the accession of ${name} to the Apostille Convention, so an apostille is not accepted there. Ask the authority in ${countryName}, or its embassy, how ${documents} from ${name} are legalised or verified.`,
      "attention",
      [sources.hcchStatus],
    );
  }
  if (code === "CN") {
    const item = chinaDocumentsNote(documents);
    return note(item.id, item.title, item.description, "action", item.sources);
  }
  if (code === "IN") {
    return note(
      "citizen-documents",
      "Apostille Indian documents through the MEA",
      `If the authority asks for legalised Indian documents (${documents}), India uses the MEA apostille (India joined the Hague Apostille Convention in 2005). The document must first be authenticated by the state government, union territory or chamber of commerce, and is then submitted through one of the MEA's outsourced agencies, not to the MEA directly. Plan time for this before you apply.`,
      "action",
      [sources.meaApostille, sources.hcchStatus],
    );
  }
  return note(
    "citizen-documents",
    "Apostille your documents in your country",
    `${capital(name)} and ${countryName} both apply the Apostille Convention, so ${documents} can be apostilled by the authority your country designated instead of being legalised. Translations may still be needed; plan time before you apply.`,
    "action",
    [sources.hcchStatus],
  );
}

function ukraineNote(countryCode: string): Note {
  if (countryCode === "DK") {
    return note(
      "citizen-protection",
      "Denmark has its own Ukraine Special Act",
      "Denmark grants residence to people displaced from Ukraine under its own Special Act; existing permits can be extended if the conditions are still met. Check New to Denmark before choosing another permit.",
      "information",
      [sources.denmarkUkraine],
    );
  }
  if (countryCode === "CH") {
    return note(
      "citizen-protection",
      "Switzerland has protection status S",
      "Switzerland grants protection status S to people from Ukraine under its own rules, which have changed over time. SEM's questions and answers explain who is eligible and how status S relates to other permits.",
      "information",
      [sources.swissStatusS],
    );
  }
  return note(
    "citizen-protection",
    "Temporary protection may apply to you",
    "The EU's temporary protection for people displaced from Ukraine has been extended for another year by Implementing Decision (EU) 2026/1912. New grants require proof that military obligations in Ukraine are met, where applicable. It is a separate status from the route below; ask the authority which suits you.",
    "information",
    [sources.euTemporaryProtection],
  );
}

function germanyWorkNote(code: string, name: string): Note | null {
  if (germanyWesternBalkans.includes(code)) {
    return note(
      "citizen-work-de",
      "Western Balkans regulation",
      `Citizens of ${name} can get approval for any employment in Germany under § 26 (2) BeschV, within an annual cap. The first application must be filed at the German mission in your home country.`,
      "information",
      [sources.germanyBeschV26],
    );
  }
  if (germanyAnyEmployment.includes(code)) {
    return note(
      "citizen-work-de",
      "Approval for any employment",
      `For citizens of ${name}, the Federal Employment Agency can approve any employment under § 26 (1) BeschV, after a priority check, wherever the employer is based.`,
      "information",
      [sources.germanyBeschV26],
    );
  }
  return null;
}

function netherlandsTbNote(): Note {
  return note(
    "citizen-tb-nl",
    "TB test after arrival, unless your nationality is exempt",
    "The IND requires a tuberculosis test after you arrive in the Netherlands. Nationalities on the IND's exemption list, and some other groups, do not need it; check the list on the IND page.",
    "attention",
    [sources.netherlandsRequirements],
  );
}

/** An extra stage for this passport, or null for EU/EEA/Swiss citizens, an
 *  unknown citizenship or a citizen of the destination itself. */
export function citizenshipStage(
  citizenship: string | null | undefined,
  countryCode: string,
  countryName: string,
  purpose: NotePurpose,
  // Already living in the country with a permit or visa: entry-visa steps
  // do not apply; document notes still do.
  // asOf: today (YYYY-MM-DD), for conventions that enter into force later.
  options: { existingResident?: boolean; asOf?: string } = {},
): { stage: RouteStage; sources: RouteSource[] } | null {
  const code = (citizenship ?? "").toUpperCase();
  const asOf = options.asOf ?? new Date().toISOString().slice(0, 10);
  const destination = countryCode.toUpperCase();
  if (!hasCitizenshipNotes(code) || code === destination) return null;
  const name = citizenshipName(code);

  const notes: Array<Note | null> = [];
  if (!options.existingResident) {
    notes.push(entryNote(code, name, destination, countryName, purpose), transitNote(code, destination));
  }
  notes.push(documentsNote(code, name, destination, countryName, purpose, asOf));
  if (code === "UA") notes.push(ukraineNote(destination));
  // Russia and Belarus: restrictions stated by the destination's own pages
  // and the EU (russia-belarus.ts). Short-stay visa rules do not concern
  // someone who already lives in the country.
  for (const item of russiaBelarusNotes(code, destination)) {
    if (options.existingResident && item.id === "ru-eu-short-stay") continue;
    notes.push(note(item.id, item.title, item.description, "attention", item.sources));
  }
  // China: APS, appointments and documents asked for by the destination's
  // missions in China (china-notes.ts). They concern applying from China,
  // so someone already living in the country does not get them.
  if (code === "CN" && !options.existingResident) {
    for (const item of chinaNotes(destination, purpose)) notes.push(note(item.id, item.title, item.description, "attention", item.sources));
  }
  if (code === "CN") {
    const item = chinaNationalityNote();
    notes.push(note(item.id, item.title, item.description, "information", item.sources));
  }
  if (destination === "DE" && purpose === "work") notes.push(germanyWorkNote(code, name));
  if (destination === "NL" && !options.existingResident) notes.push(netherlandsTbNote());

  const present = notes.filter((item): item is Note => item !== null);
  const stageSources = [...new Map(present.flatMap((item) => item.sources).map((source) => [source.id, source])).values()];
  const label = `For citizens of ${name}`;

  return {
    stage: {
      id: `citizenship-${code.toLowerCase()}`,
      number: "00",
      eyebrow: label.toUpperCase(),
      stripLabel: label,
      title: `What applies to a passport of ${name}`,
      description: options.existingResident
        ? `Checked against official lists for ${name}. You already live in the country, so entry-visa steps are left out.`
        : `Checked against official lists for ${name}. Do these early: visas and document legalisation take time.`,
      timing: "Before you apply",
      // Task ids carry the citizenship: guides keep one progress key for
      // every passport, so ticks must not carry over to another passport.
      tasks: present.map((item) => ({ ...item.task, id: `${item.task.id}-${code.toLowerCase()}` })),
    },
    sources: stageSources,
  };
}
