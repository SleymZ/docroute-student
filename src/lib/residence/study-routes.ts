import type { RouteSource, RouteStage, RouteTask } from "@/types/route-preview";

// Source-checked student residence routes for non-EU students (plan item 1,
// 2026-11-05), used by the full study path in place of the official-link
// step. Only facts the cited official page states are used: where a page
// gives no amount, fee or deadline, none is shown. EU/EEA/Swiss citizens,
// citizens of the country and people already living there keep the
// existing steps in full-path.ts.

export const STUDY_ROUTES_CHECKED = "2026-11-05";

function src(id: string, title: string, publisher: string, url: string): RouteSource {
  return { id, title, publisher, url, checkedAt: STUDY_ROUTES_CHECKED, authority: "official" };
}

function task(
  id: string,
  title: string,
  description: string,
  sourceIds: string[],
  status: RouteTask["status"] = "action",
  dueLabel?: string,
): RouteTask {
  return { id, title, description, status, sourceIds, ...(dueLabel ? { dueLabel } : {}) };
}

export type StudyResidenceRoute = {
  countryCode: string;
  permitName: string;
  sources: RouteSource[];
  stages: RouteStage[];
};

// ----------------------------------------------------------------- Austria

const atSources = [
  src(
    "at-oead-student-permit",
    "Residence permit – Student (as of 2026)",
    "OeAD (Austria's Agency for Education and Internationalisation)",
    "https://oead.at/en/to-austria/entry-and-residence/residence-permit-student-no-mobility-programme",
  ),
  src(
    "at-mig-temporary-students",
    "Temporary residence: Students",
    "Austrian Federal Government, migration.gv.at",
    "https://www.migration.gv.at/en/types-of-immigration/temporary-residence/",
  ),
  src(
    "at-oegv-registration",
    "Checklist: living in Austria for third-country nationals (updated 13 January 2026)",
    "oesterreich.gv.at",
    "https://www.oesterreich.gv.at/de/themen/bauen_und_wohnen/umzug/2/1/Seite.180663",
  ),
];

const austria: StudyResidenceRoute = {
  countryCode: "AT",
  permitName: "Residence permit “Students”",
  sources: atSources,
  stages: [
    {
      id: "residence-at-permit",
      number: "05",
      eyebrow: "RESIDENCE PERMIT",
      title: "Residence permit “Students”",
      description:
        "For regular or extraordinary studies at a university, university of applied sciences or private university (courses of at least 40 ECTS that are not only language learning).",
      timing: "Right after admission",
      tasks: [
        task(
          "at-study-where",
          "File the first application",
          "First applications go to the Austrian embassy or consulate abroad. If you entered Austria lawfully (for example visa-free), you may apply in Austria during that lawful stay: MA 35 in Vienna, the district administration or city government elsewhere.",
          ["at-mig-temporary-students"],
        ),
        task(
          "at-study-money",
          "Prove money for living costs",
          "Students under 24: €722.58 a month; from 24: €1,308.39 a month (2026), shown for 12 months ahead in an account in your name that can be used from Austria. Rent above €386.43 a month needs extra money on top, and so does health insurance (student self-insurance €78.84 a month). A liability declaration by another person is allowed.",
          ["at-mig-temporary-students", "at-oead-student-permit"],
        ),
        task(
          "at-study-insurance",
          "Health insurance valid in Austria",
          "Insurance that covers all risks and pays out in Austria. No proof of accommodation is required for this permit.",
          ["at-mig-temporary-students"],
        ),
        task(
          "at-study-documents",
          "Documents in original and copy",
          "Valid passport, a recent photo, admission letter, proof of insurance and money. The authority may ask for a criminal-record extract (preferably not older than 3 months) and translations.",
          ["at-mig-temporary-students"],
        ),
        task(
          "at-study-fee",
          "Application fee €218",
          "Paid in full when you apply; not refunded if the application is refused or withdrawn.",
          ["at-oead-student-permit"],
        ),
      ],
    },
    {
      id: "residence-at-after",
      number: "06",
      eyebrow: "AFTER ARRIVAL",
      title: "Registration, work and extension",
      description: "Duties once you live in Austria.",
      timing: "After arrival",
      tasks: [
        task(
          "at-study-meldezettel",
          "Register your address within 3 days",
          "Register with the registration office (Meldebehörde) within three days of moving in.",
          ["at-oegv-registration"],
          "action",
          "Within 3 days of moving in",
        ),
        task(
          "at-study-work",
          "Work only with an AMS employment permit",
          "Students need an employment permit from the AMS for any job, also marginal employment; up to 20 hours a week without a labour-market test.",
          ["at-mig-temporary-students"],
          "information",
        ),
        task(
          "at-study-extend",
          "Extend with proof of study success",
          "Apply before the permit expires, at the earliest three months before; the old permit stays valid while the decision is pending. An extension needs evidence of successful study progress, so keep your transcripts.",
          ["at-mig-temporary-students", "at-oead-student-permit"],
          "action",
          "In the last 3 months before expiry",
        ),
      ],
    },
  ],
};

// ----------------------------------------------------------------- Germany

const deSources = [
  src(
    "de-miig-study-visa",
    "At a glance: Visa for studying (as of January 2026)",
    "Make it in Germany (Federal Ministry for Economic Affairs and Energy)",
    "https://www.make-it-in-germany.com/fileadmin/1_Rebrush_2022/a_Fachkraefte/PDF-Dateien/3_Visum_u_Aufenthalt/Visagrafik_EN/Visum_Studieren_EN.pdf",
  ),
  src(
    "de-aa-funding",
    "How can I prove that my studies are financed?",
    "Federal Foreign Office (Auswärtiges Amt)",
    "https://www.auswaertiges-amt.de/de/service/fragenkatalog-node/08-finanzierung-606220",
  ),
  src(
    "de-aa-blocked-account",
    "Opening a blocked account (Sperrkonto) for students",
    "Federal Foreign Office (Auswärtiges Amt)",
    "https://www.auswaertiges-amt.de/de/service/visa-und-aufenthalt/nationale-visa/visa-schule-studium-sprachkurs/sperrkonto",
  ),
  src(
    "de-aa-visa-free-apply",
    "Do I need a visa if I want to study/work in Germany?",
    "Federal Foreign Office (Auswärtiges Amt)",
    "https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/02-arbeiten/606704",
  ),
];

// Nationalities that may enter Germany without a visa and apply for the
// permit after arrival (Auswärtiges Amt FAQ, checked 2026-11-05). For the
// second group only when they do not intend to take up employment.
export const germanyApplyAfterEntry = new Set(["AU", "CA", "GB", "IL", "JP", "NZ", "KR", "US"]);
export const germanyApplyAfterEntryNoWork = new Set(["AD", "BR", "SV", "HN", "MC", "SM"]);

const germany: StudyResidenceRoute = {
  countryCode: "DE",
  permitName: "Visa and residence permit for studying (§ 16b AufenthG)",
  sources: deSources,
  stages: [
    {
      id: "residence-de-visa",
      number: "05",
      eyebrow: "VISA",
      title: "National visa for studying",
      description: "Apply at the German mission abroad before you travel.",
      timing: "Right after admission",
      tasks: [
        task(
          "de-study-apply",
          "Apply online and book the embassy appointment",
          "Apply through the Consular Services Portal (or as your German mission says if online applications are not offered) and book an appointment; waiting times can be long. Bring all originals. Visa fee €75, paid in local currency.",
          ["de-miig-study-visa"],
        ),
        task(
          "de-study-money",
          "Prove your money: €11,904 a year (2026)",
          "A blocked account with at least €11,904 (as of 2026), a scholarship, a declaration of commitment (§§ 66–68 AufenthG), a bank guarantee or your parents' income and assets. A blocked account usually runs for one year and pays out a fixed amount each month.",
          ["de-miig-study-visa", "de-aa-funding", "de-aa-blocked-account"],
        ),
        task(
          "de-study-documents",
          "Admission, school certificate and insurance",
          "Proof of admission (or a preparatory course), your school-leaving certificate with university entrance qualification (a recognised degree for a master's), language proof if required, and valid health insurance before the visa is issued.",
          ["de-miig-study-visa"],
        ),
      ],
    },
    {
      id: "residence-de-after",
      number: "06",
      eyebrow: "AFTER ARRIVAL",
      title: "Registration and residence permit",
      description: "The visa is followed by a residence permit from the local foreigners authority.",
      timing: "After arrival",
      tasks: [
        task(
          "de-study-register",
          "Register your address",
          "Register your home address at the Residents' Registration Office after you move in.",
          ["de-miig-study-visa"],
        ),
        task(
          "de-study-insurance",
          "Take out German health insurance",
          "Get German health insurance after you arrive.",
          ["de-miig-study-visa"],
        ),
        task(
          "de-study-permit",
          "Apply for the residence permit before the visa expires",
          "Book an appointment at the foreigners authority, ask it for its document list and apply for the residence permit for studying (§ 16b AufenthG) before your entry visa runs out. Fees can add up to €100.",
          ["de-miig-study-visa"],
          "attention",
          "Before the entry visa expires",
        ),
      ],
    },
  ],
};

// ------------------------------------------------------------------ Poland

const plSources = [
  src("pl-nawa-visa", "Visa & application", "Study in Poland (NAWA, Polish National Agency for Academic Exchange)", "https://study.gov.pl/visa-application"),
  src(
    "pl-poznan-full-time-studies",
    "Temporary residence permit: full-time studies",
    "Wielkopolska Voivode Office in Poznań",
    "https://migrant.poznan.uw.gov.pl/en/procedury/full-time-studies",
  ),
];

const poland: StudyResidenceRoute = {
  countryCode: "PL",
  permitName: "National D visa, then a temporary residence permit for studies",
  sources: plSources,
  stages: [
    {
      id: "residence-pl-visa",
      number: "05",
      eyebrow: "VISA OR VISA-FREE ENTRY",
      title: "National D visa for studies",
      description:
        "A long-stay D visa from a Polish consulate, valid for at most one year. Some nationalities can enter visa-free for up to 90 days in any 180 days instead.",
      timing: "Right after admission",
      tasks: [
        task(
          "pl-study-visa-apply",
          "Book the consulate appointment",
          "Apply at a Polish consulate or embassy consular section, usually after registering on e-konsulat. Requirements differ by consulate, so follow its own list. Review can take up to 15 days, sometimes longer.",
          ["pl-nawa-visa"],
        ),
        task(
          "pl-study-visa-free",
          "If you can enter visa-free",
          "Visa-exempt nationals may stay up to 90 days in any 180 days. The residence permit must be filed during a legal stay; ask the Office for Foreigners or the voivode office whether you can apply after visa-free entry before deciding to skip the visa.",
          ["pl-nawa-visa"],
          "attention",
        ),
        task(
          "pl-study-visa-documents",
          "Visa documents",
          "Application form, passport, biometric photo, health insurance, proof of sufficient funds and documents showing the purpose of your stay (your admission).",
          ["pl-nawa-visa"],
        ),
      ],
    },
    {
      id: "residence-pl-permit",
      number: "06",
      eyebrow: "RESIDENCE PERMIT",
      title: "Temporary residence permit for studies",
      description: "Needed when your stay lasts longer than the visa allows. The voivode (provincial office) decides.",
      timing: "Before the visa expires",
      tasks: [
        task(
          "pl-study-mos",
          "Apply online in MOS before your legal stay ends",
          "Applications are filed online in the MOS portal, no later than the last day of your legal stay; filed in time, you may stay while the case runs. Your university must first complete and sign its online annex, so ask it early.",
          ["pl-nawa-visa", "pl-poznan-full-time-studies"],
          "attention",
          "No later than the last day of legal stay",
        ),
        task(
          "pl-study-fees",
          "Pay the stamp duty and card fee",
          "Stamp duty PLN 340; the residence card PLN 100 (PLN 50 for eligible students). Pay into the office's bank account and attach the proof; MOS does not take payments.",
          ["pl-nawa-visa"],
        ),
        task(
          "pl-study-proofs",
          "Proofs for a first-year student",
          "The university's certificate on the current form, proof of tuition payment or exemption, health insurance covering treatment in Poland, and enough money for 15 months after rent plus a return ticket and study costs. The voivode office lists the amounts.",
          ["pl-poznan-full-time-studies"],
        ),
        task(
          "pl-study-fingerprints",
          "Give fingerprints in person",
          "Attend the office in person for fingerprints, a signature specimen and your original passport.",
          ["pl-nawa-visa", "pl-poznan-full-time-studies"],
        ),
      ],
    },
    {
      id: "residence-pl-after",
      number: "07",
      eyebrow: "AFTER THE DECISION",
      title: "Card, work and duties",
      description: "A first permit for a first-year student is usually granted for 15 months.",
      timing: "After the decision",
      tasks: [
        task(
          "pl-study-work",
          "Work while studying",
          "With the permit you can work without a work permit, but full-time work can raise doubts about your study purpose.",
          ["pl-poznan-full-time-studies"],
          "information",
        ),
        task(
          "pl-study-notify",
          "Report the end of your studies within 15 working days",
          "If the reason for the permit ends, for example you leave or change university, notify the voivode who issued it within 15 working days.",
          ["pl-poznan-full-time-studies"],
        ),
        task(
          "pl-study-renew",
          "Later permits",
          "Later permits can cover the remaining studies plus three months, up to three years.",
          ["pl-nawa-visa", "pl-poznan-full-time-studies"],
          "information",
        ),
      ],
    },
  ],
};

function germanyVisaFreeStage(noWork: boolean): RouteStage {
  return {
    id: "residence-de-visa",
    number: "05",
    eyebrow: "ENTRY",
    title: "Enter without a visa, apply in Germany",
    description: noWork
      ? "Your nationality may apply for the permit after arriving, but only if you do not intend to take up employment; otherwise apply for a visa first."
      : "Your nationality may enter without a visa and apply for the permit after arriving.",
    timing: "Right after admission",
    tasks: [
      task(
        "de-study-visa-free",
        "Enter visa-free and apply after arrival",
        "Citizens of your country may apply for the necessary permit in Germany instead of getting a visa first. Confirm the study procedure with the foreigners authority where you will live.",
        ["de-aa-visa-free-apply"],
        noWork ? "attention" : "action",
      ),
      ...germany.stages[0].tasks.filter((item) => item.id !== "de-study-apply"),
    ],
  };
}

/** The route for a citizenship: Germany drops the visa step for the
 *  nationalities that may apply after entry. */
export function studyResidenceFor(countryCode: string, citizenship: string): StudyResidenceRoute | null {
  const route = verifiedStudyResidence[countryCode];
  if (!route) return null;
  if (countryCode === "DE" && (germanyApplyAfterEntry.has(citizenship) || germanyApplyAfterEntryNoWork.has(citizenship))) {
    const noWork = germanyApplyAfterEntryNoWork.has(citizenship);
    return {
      ...route,
      stages: [
        germanyVisaFreeStage(noWork),
        ...route.stages.slice(1).map((stage) => ({
          ...stage,
          tasks: stage.tasks.map((item) =>
            item.id === "de-study-permit"
              ? { ...item, title: "Apply for the residence permit", dueLabel: undefined, description: "Book an appointment at the foreigners authority, ask it for its document list and apply for the residence permit for studying (§ 16b AufenthG). Fees can add up to €100." }
              : item,
          ),
        })),
      ],
    };
  }
  return route;
}

export const verifiedStudyResidence: Readonly<Record<string, StudyResidenceRoute>> = {
  AT: austria,
  DE: germany,
  PL: poland,
};
