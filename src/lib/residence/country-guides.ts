import { czechiaResidenceRules, czechiaSources } from "@/data/czechia-residence";
import type { RouteSource, RouteStage, RouteTask } from "@/types/route-preview";

import { buildLinkedGuide, hasLinkedGuide } from "./linked-guides";

// Residence guides for Czechia (family, business), Austria, Germany and
// Switzerland (work, family, business), third-country citizens. Germany and
// Switzerland were added on 2026-11-05 (see their sections). Checked on 2026-10-30 against
// the Czech Ministry of the Interior portal (ipc.gov.cz) and the Austrian
// Federal Government's migration platform (migration.gv.at) plus
// oesterreich.gv.at. These are source-linked checklists, not dated plans:
// the portals publish fees, documents and decision periods, and DocRoute
// adds nothing they do not state. Czech work routes live at /route/czechia.

export const GUIDE_VERSION = "cz-at-guides-2026-10-30";
const checked = "2026-10-30";

export const guideCountries = ["CZ", "AT", "DE", "CH"] as const;
export type GuideCountry = (typeof guideCountries)[number];
export const guidePurposes = ["work", "family", "business"] as const;
export type GuidePurpose = (typeof guidePurposes)[number];

export type GuideVariant = {
  id: string;
  label: string;
  summary: string;
  // Facts shown as a short key-figure list beside the checklist.
  keyFacts: ReadonlyArray<{ label: string; value: string }>;
  stages: RouteStage[];
};

export type CountryGuide = {
  version: string;
  // A verified guide's country is a GuideCountry; linked guides cover the
  // other EU countries and Switzerland.
  country: string;
  // "verified": facts checked by DocRoute; "official-link": steps that only
  // point to the official page (linked-guides.ts).
  coverage?: "verified" | "official-link";
  countryName: string;
  purpose: GuidePurpose;
  title: string;
  intro: string;
  notCovered: string;
  variants: GuideVariant[];
  sources: RouteSource[];
  disclaimer: string;
};

function src(id: string, title: string, publisher: string, url: string, authority: RouteSource["authority"] = "official"): RouteSource {
  return { id, title, publisher, url, checkedAt: checked, authority };
}

const IPC = "Ministry of the Interior of the Czech Republic (ipc.gov.cz)";
const MIG = "Austrian Federal Government, migration.gv.at";

const czSources: RouteSource[] = [
  src(
    "cz-ipc-family-reunification",
    "Long-term residence permit for the purpose of family reunification (updated 15 July 2026)",
    IPC,
    "https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-residence-permits/long-term-residence-permit-for-the-purpose-of-family-reunification/",
  ),
  src(
    "cz-ipc-business-visa",
    "Long-term visa for the purpose of doing business (updated 28 July 2026)",
    IPC,
    "https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-visa/long-term-visa-for-the-purpose-of-doing-business/",
  ),
  src(
    "cz-ipc-business-permit",
    "Long-term residence permit for the purpose of doing business (updated 27 July 2026)",
    IPC,
    "https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-residence-permits/long-term-residence-permit-for-the-purpose-of-doing-business/",
  ),
  ...czechiaSources.filter((source) =>
    ["cz-ipc-funds", "cz-ipc-formal", "cz-ipc-obligations", "cz-ipc-time-limits", "cz-act-326-1999"].includes(source.id),
  ),
];

const atSources: RouteSource[] = [
  src("at-mig-blue-card", "EU Blue Card", MIG, "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/eubluecard/"),
  src(
    "at-mig-very-highly-qualified",
    "Very highly qualified workers",
    MIG,
    "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/very-highly-qualified-workers/",
  ),
  src(
    "at-mig-shortage",
    "Skilled workers in shortage occupations",
    MIG,
    "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/skilled-workers-in-shortage-occupations/",
  ),
  src("at-mig-other-key", "Other key workers", MIG, "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/other-key-workers/"),
  src("at-mig-family", "Family reunification", MIG, "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/family-reunification/"),
  src("at-mig-rwr-plus", "Red-White-Red Card plus", MIG, "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/redwhiteredcardplus/"),
  src(
    "at-mig-self-employed",
    "Self-employed key workers",
    MIG,
    "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/self-employedkeyworkers/",
  ),
  src("at-mig-startup", "Start-up founders", MIG, "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/start-up-founders/"),
  src(
    "at-oegv-registration",
    "Checklist: living in Austria for third-country nationals (updated 13 January 2026)",
    "oesterreich.gv.at",
    "https://www.oesterreich.gv.at/de/themen/bauen_und_wohnen/umzug/2/1/Seite.180663",
  ),
];

function task(id: string, title: string, description: string, sourceIds: string[], status: RouteTask["status"] = "action", dueLabel?: string): RouteTask {
  return { id, title, description, status, sourceIds, ...(dueLabel ? { dueLabel } : {}) };
}

function stage(id: string, number: string, eyebrow: string, title: string, description: string, timing: string, tasks: RouteTask[]): RouteStage {
  return { id, number, eyebrow, title, description, timing, tasks };
}

// ---------------------------------------------------------------- Czechia

const czAfterArrival = (prefix: string, permitSource: string) =>
  stage(
    `${prefix}-after`,
    "03",
    "AFTER APPROVAL",
    "Arrival, card and duties",
    "Steps after the Ministry approves the application.",
    "After approval",
    [
      task(
        `${prefix}-register`,
        "Register with the Ministry of the Interior",
        `If you entered on a long-term visa (D/VR), report your stay at a Ministry of the Interior office within ${czechiaResidenceRules.registerWithVisaDays} days of arrival; without a visa within ${czechiaResidenceRules.registerWithoutVisaDays} days.`,
        ["cz-ipc-obligations"],
      ),
      task(
        `${prefix}-card`,
        "Biometrics and residence card",
        `Give fingerprints and a photo at the Ministry office; the card is collected within ${czechiaResidenceRules.cardCollectionDays} days of biometrics.`,
        ["cz-ipc-obligations", permitSource],
      ),
      task(
        `${prefix}-changes`,
        "Report changes and extend in time",
        `Report a change of address within ${czechiaResidenceRules.addressChangeWorkingDays} working days. An extension can be filed from ${czechiaResidenceRules.extensionEarliestDays} days before the permit expires, and no later than its last day.`,
        ["cz-ipc-obligations"],
      ),
    ],
  );

const czFamily: CountryGuide = {
  version: GUIDE_VERSION,
  country: "CZ",
  countryName: "Czechia",
  purpose: "family",
  title: "Joining family in Czechia",
  intro:
    "Long-term residence permit for family reunification: for a third-country citizen joining a non-EU relative who already lives in Czechia.",
  notCovered:
    "Family members of Czech or other EU citizens (temporary residence for an EU citizen's family member), unmarried partners and the long-term visa for family purposes are not covered yet.",
  variants: [
    {
      id: "non-eu-sponsor",
      label: "My relative is a non-EU resident of Czechia",
      summary:
        "Apply at a Czech embassy (processing up to 270 days). Filing at a Ministry of the Interior office in Czechia (60 days) is only for holders of a Czech long-term visa or long-term residence permit, and for some family of Blue Card, intra-company transfer card or research permit holders coming from another EU state; visa-free visitors file at an embassy. The permit lasts as long as your relative's permit (at least one year) and lets you work without a work permit.",
      keyFacts: [
        { label: "Fee", value: "CZK 2,500 in Czechia (CZK 1,000 under 15); consular fee abroad" },
        { label: "Decision", value: "60 days in Czechia, 270 days via an embassy" },
        { label: "Validity", value: "Same as the sponsor's permit, at least 1 year (2 years if the sponsor has permanent residence)" },
        { label: "Work", value: "Allowed without a separate work permit" },
      ],
      stages: [
        stage(
          "cz-family-eligibility",
          "01",
          "ELIGIBILITY",
          "Check your relative and your family link",
          "The sponsor's status decides whether you can apply now.",
          "Before you plan",
          [
            task(
              "cz-family-sponsor",
              "Your relative meets one of the sponsor conditions",
              "Long-term or permanent residence and more than 15 months in Czechia (spouses: both at least 20); or an employee card and more than 6 months in Czechia; or an EU Blue Card, an intra-company transfer card or a permit for investment; or a research permit (held or applied for); or an application for job-seeking or starting a business. These conditions do not apply to some minors and lone parents over 65.",
              ["cz-ipc-family-reunification"],
            ),
            task(
              "cz-family-relation",
              "You are an eligible family member",
              "Spouse (incl. former registered partners), child under 18 (incl. stepchildren, adopted or in custody), dependent adult child who cannot look after themselves for health reasons, or a lone parent over 65 or unable to care for themselves.",
              ["cz-ipc-family-reunification"],
            ),
          ],
        ),
        stage(
          "cz-family-application",
          "02",
          "APPLICATION",
          "Collect the documents and file",
          "Documents must be originals or certified copies, not older than 180 days, with a Czech translation unless in Czech or Slovak.",
          "Before you file",
          [
            task(
              "cz-family-where",
              "Choose where to file",
              "Without a Czech long-term visa or long-term residence permit (e.g. visa-free or on a Schengen visa): in person at a Czech embassy, which forwards the file to the Ministry (up to 270 days). With a Czech long-term visa or permit: in person at your local Ministry of the Interior office, by the last day of its validity (60 days). Family of a Blue Card or intra-company transfer card holder who lived in another EU state can file in Czechia within 30 or 90 days of entry; some family of research-permit holders too.",
              ["cz-ipc-family-reunification", "cz-ipc-time-limits"],
            ),
            task(
              "cz-family-documents",
              "Core documents",
              "Application form, passport, photo, proof of accommodation, original proof of the family link (marriage or birth certificate), parental consent for under-18s, and a criminal-record extract from your country of citizenship (and other countries where you lived 6+ months in the last 3 years, if asked).",
              ["cz-ipc-family-reunification", "cz-ipc-formal"],
            ),
            task(
              "cz-family-funds",
              "Proof of regular monthly income",
              "The household's regular monthly income must cover the sum of the living-minimum amounts (CZK 5,000 first person, CZK 3,750 each further adult, CZK 2,480–3,490 per child) plus the normative housing cost (from 1 October 2026: CZK 15,680 for one person, CZK 18,990 for two, CZK 21,870 for three) or actual housing costs if higher. A one-off bank balance is not accepted. Example (DocRoute's sum): two adults about CZK 27,740 a month.",
              ["cz-ipc-funds"],
            ),
            task(
              "cz-family-insurance",
              "Comprehensive health insurance",
              "Embassy applicants show it only after approval: cover of at least EUR 400,000 without co-payment (under-18s: travel insurance for the first 90 days).",
              ["cz-ipc-family-reunification"],
            ),
            task(
              "cz-family-fee",
              "Pay the fee",
              "CZK 2,500 (CZK 1,000 under 15) by card at the Ministry office; abroad the consular fee follows the Foreign Ministry's schedule.",
              ["cz-ipc-family-reunification"],
            ),
          ],
        ),
        czAfterArrival("cz-family", "cz-ipc-family-reunification"),
      ],
    },
  ],
  sources: czSources,
  disclaimer:
    "DocRoute is a preparation tool, not legal advice. The Ministry of the Interior decides on residence permits. Recheck each requirement on ipc.gov.cz before filing; the Act on the Residence of Foreign Nationals (326/1999) was not checked section by section.",
};

const czBusiness: CountryGuide = {
  version: GUIDE_VERSION,
  country: "CZ",
  countryName: "Czechia",
  purpose: "business",
  title: "Doing business in Czechia",
  intro:
    "Long-term visa for business (sole trader with a trade licence, or a statutory body/member of a company), then the long-term residence permit for business.",
  notCovered:
    "The permits for job-seeking or starting a business and for investment, and the trade-licence procedure itself, are not covered.",
  variants: [
    {
      id: "visa-then-permit",
      label: "Sole trader or company executive",
      summary:
        "First a long-term visa for business (up to 1 year; consular fee CZK 5,000; 90 days, 120 in complex cases). In Czechia you then apply for the long-term residence permit for business (CZK 2,500, 60 days, up to 2 years).",
      keyFacts: [
        { label: "Funds (visa)", value: "50 × subsistence minimum = CZK 156,500 (portal figure)" },
        { label: "Visa", value: "Up to 1 year; CZK 5,000; 90 (120) days" },
        { label: "Permit", value: "Up to 2 years; CZK 2,500; 60 days" },
        { label: "Register", value: "Trade Licensing Register or Commercial Register entry" },
      ],
      stages: [
        stage(
          "cz-business-register",
          "01",
          "BUSINESS REGISTRATION",
          "Register the business",
          "Both the visa and the permit need proof that you are entered in a register.",
          "Before you file",
          [
            task(
              "cz-business-register-entry",
              "Trade licence or company register entry",
              "Confirmation of registration in the Trade Licensing Register (sole trader), the Commercial Register (company statutory body or member) or the register of a liberal profession.",
              ["cz-ipc-business-visa", "cz-ipc-business-permit"],
            ),
          ],
        ),
        stage(
          "cz-business-visa",
          "02",
          "LONG-TERM VISA",
          "Long-term visa for business",
          "The ipc page gives both in-person filing at an embassy and filing at a Ministry office; confirm where to file before you go.",
          "Before you move",
          [
            task(
              "cz-business-visa-documents",
              "Visa documents",
              "Application form, passport, proof of accommodation, proof of funds, photo, register entry, and a criminal-record extract from your country of citizenship (not under 15). A medical report or further extracts only on request.",
              ["cz-ipc-business-visa", "cz-ipc-formal"],
            ),
            task(
              "cz-business-visa-funds",
              "Proof of funds",
              "For business: 50 times the subsistence minimum, CZK 156,500 (50 × CZK 3,130, as stated by the portal).",
              ["cz-ipc-funds"],
            ),
            task(
              "cz-business-visa-insurance",
              "Insurance before the visa is issued",
              "Travel medical insurance for the first 90 days plus comprehensive insurance for the rest, or comprehensive insurance for the whole stay.",
              ["cz-ipc-business-visa"],
            ),
            task(
              "cz-business-visa-fee",
              "Consular fee and decision",
              "CZK 5,000; decision within 90 days (120 in especially complicated cases). The visa is valid up to 1 year.",
              ["cz-ipc-business-visa"],
            ),
          ],
        ),
        stage(
          "cz-business-permit",
          "03",
          "RESIDENCE PERMIT",
          "Long-term residence permit for business",
          "Filed in person at a Ministry of the Interior office in Czechia while you hold the business visa (or after 5+ years on a long-term permit).",
          "Before the visa expires",
          [
            task(
              "cz-business-permit-documents",
              "Permit documents",
              "Application form, passport, accommodation, photo, proof of total monthly income, register entry or Commercial Register extract, proof of no outstanding debts (company and you, for executives), comprehensive health insurance. Criminal record only on request.",
              ["cz-ipc-business-permit"],
            ),
            task(
              "cz-business-permit-fee",
              "Fee and decision",
              "CZK 2,500; decision within 60 days; the permit is valid up to 2 years.",
              ["cz-ipc-business-permit"],
            ),
          ],
        ),
        czAfterArrival("cz-business", "cz-ipc-business-permit"),
      ],
    },
  ],
  sources: czSources,
  disclaimer:
    "DocRoute is a preparation tool, not legal advice. The Ministry of the Interior decides on residence and the trade office on the trade licence. The ipc pages are inconsistent on where the business visa is filed and give the funds amount on an older subsistence minimum; recheck before filing.",
};

// ---------------------------------------------------------------- Austria

const atFee = "Application fee €218";

const atApplyTask = (prefix: string, sourceId: string, extra = "") =>
  task(
    `${prefix}-where`,
    "Choose where to apply",
    "From abroad: in person at the Austrian embassy or consulate in your country of citizenship or residence (where allowed, your employer can file with the residence authority in Austria). If you are already lawfully in Austria (e.g. visa-free), you can apply to the residence authority there: MA 35 in Vienna, the district administration or city council elsewhere." +
      (extra ? " " + extra : ""),
    [sourceId],
  );

const atAfterArrival = (prefix: string, sourceId: string) =>
  stage(
    `${prefix}-after`,
    "03",
    "AFTER APPROVAL",
    "Entry, card and registration",
    "Steps after the residence authority approves the application.",
    "After approval",
    [
      task(
        `${prefix}-visa-d`,
        "Visa D to enter and collect the card",
        "If you need a visa for Austria, apply for a category D visa after approval, enter and collect the card from the residence authority.",
        [sourceId],
      ),
      task(
        `${prefix}-meldezettel`,
        "Register your address within 3 days",
        "Register your residence with the registration office (Meldebehörde) within three days of moving in.",
        ["at-oegv-registration"],
      ),
    ],
  );

const atWork: CountryGuide = {
  version: GUIDE_VERSION,
  country: "AT",
  countryName: "Austria",
  purpose: "work",
  title: "Working in Austria",
  intro:
    "The EU Blue Card and the Red-White-Red Card for third-country workers. The Public Employment Service (AMS) checks the conditions; the residence authority issues the card.",
  notCovered:
    "Seasonal and tourism workers, intra-corporate transfers, graduates of Austrian universities, researchers and EU citizens (who only register) are not covered.",
  variants: [
    {
      id: "blue-card",
      label: "EU Blue Card (degree + high salary)",
      summary:
        "A university degree of at least 3 years (or 3 years' IT experience), a job offer that matches it and at least €55,678 gross a year (2026). Valid 24 months for that employer.",
      keyFacts: [
        { label: "Salary", value: "At least €55,678 gross a year (2026)" },
        { label: "Fee", value: "€218" },
        { label: "Validity", value: "24 months, specific employer" },
      ],
      stages: [
        stage("at-bc-eligibility", "01", "ELIGIBILITY", "Degree, job offer and salary", "The AMS also checks whether an equally qualified jobseeker is available.", "Before you plan", [
          task(
            "at-bc-degree",
            "Degree of at least three years",
            "A completed university or other tertiary course of at least 3 years; in ICT, 3 years of comparable experience within the last 7 years can replace it.",
            ["at-mig-blue-card"],
          ),
          task("at-bc-salary", "Job offer at €55,678+ a year", "A binding job offer matching your education, paying at least €55,678 gross a year including special payments (2026).", ["at-mig-blue-card"]),
        ]),
        stage("at-bc-application", "02", "APPLICATION", "File with the employer's declaration", "The employer's declaration (Arbeitgebererklärung) goes with the application.", "Before you move", [
          atApplyTask("at-bc", "at-mig-blue-card"),
          task("at-bc-fee", atFee, "Paid when you apply; the card itself may carry further charges.", ["at-mig-blue-card"]),
        ]),
        atAfterArrival("at-bc", "at-mig-blue-card"),
      ],
    },
    {
      id: "very-highly-qualified",
      label: "Red-White-Red Card: very highly qualified (70 points)",
      summary:
        "At least 70 of 100 points (qualifications, experience, languages, age, studies in Austria). Without a job you can get a 6-month job-seeker visa (€195); then the card for a matching job.",
      keyFacts: [
        { label: "Points", value: "70 of 100" },
        { label: "Job-seeker visa", value: "6 months, €195" },
        { label: "Fee", value: "€218; card valid 24 months" },
      ],
      stages: [
        stage("at-vhq-eligibility", "01", "ELIGIBILITY", "Reach 70 points", "Points: special qualifications up to 40, experience up to 20, German/English up to 10, age up to 20 (under 35: 20), studies in Austria up to 10.", "Before you plan", [
          task("at-vhq-points", "Count your points", "Collect proof for each criterion (degree, experience references, language certificates, PhD or awards).", ["at-mig-very-highly-qualified"]),
          task(
            "at-vhq-jobseeker",
            "Job-seeker visa if you have no offer",
            "Category D visa for 6 months (€195) at an Austrian embassy, after the AMS confirms your points. Not needed if you can enter Austria visa-free.",
            ["at-mig-very-highly-qualified"],
          ),
        ]),
        stage("at-vhq-application", "02", "APPLICATION", "Apply for the card with a job", "Once you have a job matching your qualification.", "When you have an offer", [
          atApplyTask("at-vhq", "at-mig-very-highly-qualified"),
          task("at-vhq-fee", atFee, "The card is generally issued for 24 months.", ["at-mig-very-highly-qualified"]),
        ]),
        atAfterArrival("at-vhq", "at-mig-very-highly-qualified"),
      ],
    },
    {
      id: "shortage",
      label: "Red-White-Red Card: shortage occupation (55 points)",
      summary:
        "Completed vocational training in a listed shortage occupation, a binding job offer at the collective-agreement wage or more, and at least 55 of 90 points. Valid 24 months for that employer.",
      keyFacts: [
        { label: "Points", value: "55 of 90 (+5 for English-speaking employers)" },
        { label: "Fee", value: "€218" },
        { label: "Validity", value: "24 months, named employer" },
      ],
      stages: [
        stage("at-short-eligibility", "01", "ELIGIBILITY", "Occupation, offer and points", "Points: training 30, experience up to 20 (double in Austria), languages up to 25 (German B1: 15), age up to 15 (under 30: 15).", "Before you plan", [
          task("at-short-occupation", "Training in a shortage occupation", "Check the current shortage-occupation list (federal and regional) and your completed training.", ["at-mig-shortage"]),
          task("at-short-offer", "Binding job offer at the minimum wage or more", "At least the legal or collective-agreement minimum, plus any customary company overpay.", ["at-mig-shortage"]),
        ]),
        stage("at-short-application", "02", "APPLICATION", "File with evidence for each point", "Certificates, references, language certificates no older than 5 years; a criminal-record extract may be required.", "Before you move", [
          atApplyTask("at-short", "at-mig-shortage"),
          task("at-short-fee", atFee, "The AMS checks points, training and pay before the authority issues the card.", ["at-mig-shortage"]),
        ]),
        atAfterArrival("at-short", "at-mig-shortage"),
      ],
    },
    {
      id: "other-key",
      label: "Red-White-Red Card: other key workers (55 points)",
      summary:
        "At least 55 points, a gross monthly salary of at least €3,465 (2026) and a labour-market test: the AMS checks that no equally qualified registered jobseeker is available.",
      keyFacts: [
        { label: "Salary", value: "At least €3,465 gross a month (2026)" },
        { label: "Points", value: "55" },
        { label: "Fee", value: "€218; 24 months" },
      ],
      stages: [
        stage("at-key-eligibility", "01", "ELIGIBILITY", "Points, salary and labour-market test", "The AMS performs the labour-market test.", "Before you plan", [
          task("at-key-points", "55 points and €3,465 a month", "Collect proof for each points criterion and a job offer paying at least €3,465 gross a month (2026).", ["at-mig-other-key"]),
        ]),
        stage("at-key-application", "02", "APPLICATION", "File with the employer's declaration", "Where you file is the same as for other Red-White-Red Cards.", "Before you move", [
          atApplyTask("at-key", "at-mig-other-key"),
          task("at-key-fee", atFee, "The card is generally issued for 24 months.", ["at-mig-other-key"]),
        ]),
        atAfterArrival("at-key", "at-mig-other-key"),
      ],
    },
  ],
  sources: atSources,
  disclaimer:
    "DocRoute is a preparation tool, not legal advice. The AMS and the residence authority decide. migration.gv.at pages show no update dates; recheck amounts (salary thresholds change every year) before filing.",
};

const atIncomeFact = "Income at least €1,308.39 a month (single), €2,064.12 (couple), +€201.88 per child (2026)";

const atFamily: CountryGuide = {
  version: GUIDE_VERSION,
  country: "AT",
  countryName: "Austria",
  purpose: "family",
  title: "Joining family in Austria",
  intro:
    "Family reunification with a third-country citizen living in Austria: spouses and registered partners (both 21+) and unmarried children under 18.",
  notCovered:
    "Family of Austrian citizens (“Family Member” title), family of EU citizens, other dependants and refugees' families are not covered.",
  variants: [
    {
      id: "rwr-or-blue-card-sponsor",
      label: "Relative holds an RWR Card, Blue Card, RWR Card plus or a settlement permit for self-employed or researchers",
      summary:
        "Red-White-Red Card plus with unrestricted labour-market access. Also for family of holders of a long-term residence title, a residence card or a refugee/subsidiary protection status (those cases have extra rules DocRoute does not cover). No quota for family of RWR Card, Blue Card and researcher sponsors; some are exempt from German A1.",
      keyFacts: [
        { label: "Title", value: "Red-White-Red Card plus" },
        { label: "Quota", value: "None" },
        { label: "Fee", value: "€218" },
        { label: "Income", value: atIncomeFact },
      ],
      stages: [
        stage("at-fam-rwr-eligibility", "01", "ELIGIBILITY", "Family link and general requirements", "Spouses and registered partners must be 21 or older when applying; children under 18 at application.", "Before you plan", [
          task("at-fam-rwr-income", "Regular income at the standard rate", atIncomeFact + ".", ["at-mig-family"]),
          task("at-fam-rwr-housing", "Adequate accommodation and health insurance", "A legal right to housing adequate for the family size, and health insurance covering all risks in Austria (family members are often co-insured).", ["at-mig-family"]),
          task(
            "at-fam-rwr-german",
            "German A1 (check your exemption)",
            "A1 is required at first application, but certain family members of Red-White-Red Card and Blue Card holders, children under 14 and some others are exempt.",
            ["at-mig-family"],
            "attention",
          ),
        ]),
        stage("at-fam-rwr-application", "02", "APPLICATION", "File the first application", "First applications are generally filed at the Austrian embassy or consulate abroad.", "Before you move", [
          task("at-fam-rwr-where", "Apply at the Austrian representation", "Usually abroad; the competent authority in Austria depends on the federal state (MA 35 in Vienna).", ["at-mig-family"]),
          task("at-fam-rwr-fee", atFee, "Bring marriage or birth certificates and the documents for each requirement.", ["at-mig-family", "at-mig-rwr-plus"]),
        ]),
        atAfterArrival("at-fam-rwr", "at-mig-family"),
      ],
    },
    {
      id: "settlement-sponsor",
      label: "Relative holds another settlement permit (e.g. ordinary, dependant or artist)",
      summary:
        "Settlement Permit for family members: subject to the annual quota and the general requirements, with German A1 at first application. If your relative's settlement permit is for self-employment or research, choose the Red-White-Red Card plus option instead.",
      keyFacts: [
        { label: "Title", value: "Settlement Permit (quota)" },
        { label: "German", value: "A1 before the first application" },
        { label: "Fee", value: "€218" },
        { label: "Income", value: atIncomeFact },
      ],
      stages: [
        stage("at-fam-set-eligibility", "01", "ELIGIBILITY", "Quota, German A1 and general requirements", "A quota place must be available.", "Before you plan", [
          task("at-fam-set-german", "German A1 certificate", "A recognised A1 diploma (not older than one year) or Integration Agreement module 1 or 2; children under 14 are exempt.", ["at-mig-family"]),
          task("at-fam-set-income", "Regular income, housing and insurance", atIncomeFact + "; adequate accommodation; health insurance.", ["at-mig-family"]),
        ]),
        stage("at-fam-set-application", "02", "APPLICATION", "File the first application", "Generally at the Austrian representation abroad.", "Before you move", [
          task("at-fam-set-where", "Apply at the Austrian representation", "The authority in Austria depends on the federal state.", ["at-mig-family"]),
          task("at-fam-set-fee", atFee, "Quota availability can delay the decision.", ["at-mig-family"], "attention"),
        ]),
        atAfterArrival("at-fam-set", "at-mig-family"),
      ],
    },
  ],
  sources: atSources,
  disclaimer:
    "DocRoute is a preparation tool, not legal advice. The residence authority decides. Income rates change every year; recheck migration.gv.at before filing.",
};

const atBusiness: CountryGuide = {
  version: GUIDE_VERSION,
  country: "AT",
  countryName: "Austria",
  purpose: "business",
  title: "Doing business in Austria",
  intro: "Red-White-Red Cards for self-employed key workers and for start-up founders. The AMS gives an opinion; the residence authority decides.",
  notCovered: "Ordinary sole traders without a macroeconomic benefit, the trade licence itself and EU citizens are not covered.",
  variants: [
    {
      id: "self-employed",
      label: "Self-employed key worker",
      summary:
        "Self-employment with a macroeconomic benefit beyond the business itself, e.g. at least €100,000 invested, jobs created or secured, new know-how or technology. No points system.",
      keyFacts: [
        { label: "Example", value: "€100,000+ capital transferred, or jobs created" },
        { label: "AMS opinion", value: "Within 3 weeks" },
        { label: "Fee", value: "€218; card 24 months" },
      ],
      stages: [
        stage("at-se-plan", "01", "BUSINESS CASE", "Show the macroeconomic benefit", "The AMS assesses the benefit for Austria.", "Before you plan", [
          task(
            "at-se-documents",
            "Business plan and evidence",
            "Business plan, proof of capital transfer and of job creation or security, qualifications, company agreements or trade authorisations where relevant; German or English, otherwise translated.",
            ["at-mig-self-employed"],
          ),
        ]),
        stage("at-se-application", "02", "APPLICATION", "File the application", "Abroad at the embassy, or in Austria during a lawful stay.", "Before you move", [
          atApplyTask("at-se", "at-mig-self-employed", "Applying in person in Austria lets you stay while the application is pending."),
          task("at-se-fee", atFee, "After 24 months a settlement permit may follow if the requirements are met.", ["at-mig-self-employed"]),
        ]),
        atAfterArrival("at-se", "at-mig-self-employed"),
      ],
    },
    {
      id: "start-up",
      label: "Start-up founder",
      summary:
        "An innovative company with a consistent business plan, your controlling influence, at least €30,000 capital (50%+ equity) and at least 50 of 85 points.",
      keyFacts: [
        { label: "Capital", value: "€30,000+, at least 50% equity" },
        { label: "Points", value: "50 of 85" },
        { label: "Fee", value: "€218; card up to 24 months" },
      ],
      stages: [
        stage("at-su-plan", "01", "BUSINESS CASE", "Innovation, capital and points", "Points come from qualifications, experience, languages and bonuses (extra capital, incubator, age up to 35).", "Before you plan", [
          task("at-su-documents", "Business plan and capital", "Business plan, proof of €30,000+ capital with at least 50% equity, and proof for each points criterion.", ["at-mig-startup"]),
        ]),
        stage("at-su-application", "02", "APPLICATION", "File the application", "Abroad at the embassy, or in Austria during a lawful stay.", "Before you move", [
          atApplyTask("at-su", "at-mig-startup"),
          task("at-su-fee", atFee, "After two years a Red-White-Red Card plus can follow if the requirements are still met.", ["at-mig-startup"]),
        ]),
        atAfterArrival("at-su", "at-mig-startup"),
      ],
    },
  ],
  sources: atSources,
  disclaimer:
    "DocRoute is a preparation tool, not legal advice. The AMS and the residence authority decide; the trade authority decides on trade licences. Recheck migration.gv.at before filing.",
};

// ---------------------------------------------------------------- Germany
// Checked 2026-11-05 against Make it in Germany (Federal Ministry for
// Economic Affairs and Energy, "as of January 2026" fact sheets and pages
// dated 30 Oct / 4 Nov 2026), BAMF and the Federal Foreign Office.

const checkedDeCh = "2026-11-05";

function srcDeCh(id: string, title: string, publisher: string, url: string): RouteSource {
  return { id, title, publisher, url, checkedAt: checkedDeCh, authority: "official" };
}

const MIIG = "Make it in Germany (Federal Ministry for Economic Affairs and Energy)";
const MIIG_PDF = "https://www.make-it-in-germany.com/fileadmin/1_Rebrush_2022/a_Fachkraefte/PDF-Dateien/3_Visum_u_Aufenthalt/Visagrafik_EN/";

const deSources: RouteSource[] = [
  srcDeCh("de-miig-blue-card", "At a glance: EU Blue Card (as of January 2026)", MIIG, `${MIIG_PDF}Visum_Blaue_Karte_EN.pdf`),
  srcDeCh("de-miig-skilled", "At a glance: Visa for skilled workers (as of January 2026)", MIIG, `${MIIG_PDF}Visum_Arbeiten_Fachkraefte_EN.pdf`),
  srcDeCh("de-miig-opportunity", "Job search opportunity card", MIIG, "https://www.make-it-in-germany.com/en/visa-residence/opportunity-card/job-search"),
  srcDeCh(
    "de-miig-family",
    "At a glance: Visa for family reunification joining foreign skilled workers (as of January 2026)",
    MIIG,
    `${MIIG_PDF}Visum_Familiennachzug_EN.pdf`,
  ),
  srcDeCh(
    "de-bamf-family",
    "Family reunification with third-country nationals (updated 7 March 2024)",
    "Federal Office for Migration and Refugees (BAMF)",
    "https://www.bamf.de/DE/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Familie/NachzugZuDrittstaatlern/nachzug-zu-drittstaatlern-node.html",
  ),
  srcDeCh(
    "de-aa-certificates",
    "Which language certificates are accepted in the visa procedure?",
    "Federal Foreign Office (Auswärtiges Amt)",
    "https://www.auswaertiges-amt.de/de/service/fragenkatalog-node/2238204-2238204",
  ),
  srcDeCh("de-miig-self-employment", "Visa for self-employment (updated 4 November 2026)", MIIG, "https://www.make-it-in-germany.com/en/visa-residence/types/other/self-employment"),
  srcDeCh(
    "de-miig-freelance",
    "Visa for freelance business (updated 30 October 2026)",
    MIIG,
    "https://www.make-it-in-germany.com/en/working-in-germany/setting-up-business/visa/freelance",
  ),
  srcDeCh(
    "de-aa-visa-free-apply",
    "Do I need a visa if I want to study/work in Germany?",
    "Federal Foreign Office (Auswärtiges Amt)",
    "https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/02-arbeiten/606704",
  ),
];

const deVisaFreeTask = (prefix: string, work: boolean) =>
  task(
    `${prefix}-visa-free`,
    "Check whether you may apply in Germany instead",
    "Citizens of Australia, Canada, Israel, Japan, New Zealand, South Korea, the United Kingdom and the United States may enter without a visa and apply for the permit in Germany." +
      (work
        ? " Citizens of Andorra, Brazil, El Salvador, Honduras, Monaco and San Marino may do so only if they will not work, so for this route they need the visa first."
        : " Citizens of Andorra, Brazil, El Salvador, Honduras, Monaco and San Marino may do so only if they will not take up employment."),
    ["de-aa-visa-free-apply"],
    "attention",
  );

const deVisaStage = (prefix: string, sourceId: string, documents: string, work = true) =>
  stage(`${prefix}-visa`, "02", "VISA", "National visa from the German mission", "Apply before you travel; waiting and processing times vary by mission.", "Before you move", [
    task(
      `${prefix}-portal`,
      "Apply online and book the embassy appointment",
      "Create an account on the Consular Services Portal and apply online, or contact the German mission if online applications are not offered in your country. Visa fee €75, paid in local currency.",
      [sourceId],
    ),
    task(`${prefix}-documents`, "Prepare the documents and originals", documents + " Bring all originals. Valid health insurance is needed before the visa is issued.", [sourceId]),
    deVisaFreeTask(prefix, work),
  ]);

const deAfterArrival = (prefix: string, sourceId: string, permit: string) =>
  stage(`${prefix}-after`, "03", "AFTER ARRIVAL", "Registration and residence permit", "The entry visa is followed by a residence permit from the local foreigners authority.", "After arrival", [
    task(`${prefix}-register`, "Register your address", "Register your home address at the Residents' Registration Office after you move in.", [sourceId]),
    task(`${prefix}-insurance`, "Take out German health insurance", "Take out new health insurance after you arrive in Germany.", [sourceId]),
    task(
      `${prefix}-permit`,
      "Apply for the residence permit before the visa expires",
      `Book an appointment at the foreigners authority, ask for its document list and apply for the ${permit} before your entry visa runs out. Fees can add up to €100.`,
      [sourceId],
      "attention",
      "Before the entry visa expires",
    ),
  ]);

const deWork: CountryGuide = {
  version: GUIDE_VERSION,
  country: "DE",
  countryName: "Germany",
  purpose: "work",
  title: "Working in Germany",
  intro:
    "The EU Blue Card, the residence permit for skilled workers and the Opportunity Card for job seekers. The German mission issues the entry visa; the local foreigners authority issues the permit.",
  notCovered:
    "Vocational training, recognition partnerships, researchers, intra-corporate transfers, seasonal work, the Western Balkans rule and EU/EEA/Swiss citizens (who only register) are not covered.",
  variants: [
    {
      id: "blue-card",
      label: "EU Blue Card (degree + salary threshold)",
      summary:
        "A recognised university degree and a job matching it, for at least six months, paying at least €50,700 gross a year (2026), or €45,934.20 in bottleneck occupations or within three years of graduating. IT specialists without a degree can qualify with three years of experience.",
      keyFacts: [
        { label: "Salary", value: "At least €50,700 gross a year (2026)" },
        { label: "Lower threshold", value: "€45,934.20: bottleneck jobs, recent graduates, IT without a degree" },
        { label: "Fees", value: "Visa €75; residence permit up to €100" },
      ],
      stages: [
        stage("de-bc-eligibility", "01", "ELIGIBILITY", "Degree, job offer and salary", "Passport, means of support and no reason for expulsion are general conditions for every permit.", "Before you plan", [
          task(
            "de-bc-degree",
            "Recognised or comparable university degree",
            "Your foreign academic qualification must be recognised or comparable; a regulated profession also needs a licence to practise. IT specialists without a degree need at least three years of experience at academic level.",
            ["de-miig-blue-card"],
          ),
          task(
            "de-bc-salary",
            "Job offer of six months or more at the threshold",
            "A concrete job offer or contract for at least six months in a job that matches your qualification, paying at least €50,700 gross a year (2026). €45,934.20 is enough in bottleneck occupations, within three years of graduating, and for IT specialists without a degree.",
            ["de-miig-blue-card"],
          ),
          task(
            "de-bc-ba",
            "Federal Employment Agency approval",
            "The agency's approval is usually obtained during the visa procedure. It is not needed for a Blue Card paying €50,700 or more.",
            ["de-miig-blue-card"],
            "information",
          ),
        ]),
        deVisaStage("de-bc", "de-miig-blue-card", "Employment contract, passport, proof of the recognised degree and, if needed, proof of work experience."),
        deAfterArrival("de-bc", "de-miig-blue-card", "EU Blue Card (§ 18g AufenthG)"),
      ],
    },
    {
      id: "skilled-worker",
      label: "Skilled worker with a recognised qualification",
      summary:
        "A foreign academic or vocational qualification recognised as equivalent or comparable and a concrete offer for qualified work it enables. From age 45: at least €55,770 gross a year (2026) or adequate retirement provision.",
      keyFacts: [
        { label: "Qualification", value: "Recognised academic or vocational" },
        { label: "From age 45", value: "€55,770 gross a year (2026) or a pension" },
        { label: "Fees", value: "Visa €75; residence permit up to €100" },
      ],
      stages: [
        stage("de-sw-eligibility", "01", "ELIGIBILITY", "Recognition and a job offer", "The Federal Employment Agency's approval is usually obtained during the visa procedure.", "Before you plan", [
          task(
            "de-sw-recognition",
            "Get your qualification recognised",
            "Your academic or vocational qualification must be recognised as equivalent or comparable; some jobs also need a licence to practise.",
            ["de-miig-skilled"],
          ),
          task(
            "de-sw-offer",
            "Qualified job offer or contract",
            "A concrete job offer or valid employment contract in Germany for qualified work that your qualification enables you to do, not an auxiliary or unskilled position.",
            ["de-miig-skilled"],
          ),
          task(
            "de-sw-age",
            "From age 45: salary or pension",
            "Applicants aged 45 or older need at least €55,770 gross a year (2026) or proof of adequate retirement provision.",
            ["de-miig-skilled"],
            "information",
          ),
          task(
            "de-sw-fast-track",
            "Ask your employer about the fast-track procedure",
            "The fast-track procedure for skilled workers can speed up entry; your employer starts it.",
            ["de-miig-skilled"],
            "information",
          ),
        ]),
        deVisaStage("de-sw", "de-miig-skilled", "Employment contract, passport and proof of the recognised qualification."),
        deAfterArrival("de-sw", "de-miig-skilled", "residence permit for skilled workers (§§ 18a, 18b AufenthG)"),
      ],
    },
    {
      id: "opportunity-card",
      label: "Opportunity Card (look for a job in Germany)",
      summary:
        "Up to one year to look for work: either with a qualification fully recognised in Germany, or with a qualification recognised where you got it plus at least 6 points and German A1 or English B2. You must show at least €1,091 a month (2026).",
      keyFacts: [
        { label: "Points", value: "6, or none with a fully recognised qualification" },
        { label: "Money", value: "€1,091 net a month in a blocked account (2026)" },
        { label: "Validity", value: "Up to 1 year; part-time work up to 20 h a week" },
      ],
      stages: [
        stage("de-oc-eligibility", "01", "ELIGIBILITY", "Qualify in one of two ways", "For people from outside the EU/EEA and Switzerland.", "Before you plan", [
          task(
            "de-oc-ways",
            "Recognised qualification, or 6 points with A1/B2",
            "Option 1: a foreign vocational (at least two years) or academic qualification fully recognised in Germany, or one obtained in Germany; no points or language certificate. Option 2: a vocational qualification of at least two years or a university degree, recognised by the state where you got it, plus at least 6 points and German A1 or English B2.",
            ["de-miig-opportunity"],
          ),
          task(
            "de-oc-points",
            "Count your points",
            "Partly recognised qualification 4; shortage occupation 1; experience 2 (2 of the last 5 years) or 3 (5 of the last 7); German A2 1, B1 2, B2+ 3, English C1 +1; age up to 35 2, 35–40 1; 6 months' earlier stay in Germany 1; a partner who qualifies 1.",
            ["de-miig-opportunity"],
          ),
          task(
            "de-oc-money",
            "Prove €1,091 a month",
            "A blocked account with at least €1,091 net a month (2026), or a declaration of commitment.",
            ["de-miig-opportunity"],
          ),
        ]),
        stage("de-oc-application", "02", "APPLICATION", "Apply for the card", "Abroad through the Consular Services Portal or your German mission.", "Before you move", [
          task(
            "de-oc-where",
            "Where to apply",
            "From abroad: the Federal Foreign Office's Consular Services Portal or your German mission. Already in Germany with a valid residence title: your local foreigners authority.",
            ["de-miig-opportunity"],
          ),
          deVisaFreeTask("de-oc", true),
        ]),
        stage("de-oc-after", "03", "IN GERMANY", "Search, try out and switch", "The card is valid for up to one year.", "After arrival", [
          task("de-oc-register", "Register your address", "Register your home address at the Residents' Registration Office after you move in.", ["de-miig-skilled"]),
          task(
            "de-oc-work",
            "Part-time work and trial jobs",
            "You may work up to 20 hours a week while you search and do trial work of up to two weeks per employer.",
            ["de-miig-opportunity"],
            "information",
          ),
          task(
            "de-oc-switch",
            "Switch to a work permit when you find a job",
            "Apply to your local foreigners authority for a residence permit for qualified employment, vocational training, recognition or self-employment.",
            ["de-miig-opportunity"],
          ),
        ]),
      ],
    },
  ],
  sources: deSources,
  disclaimer:
    "DocRoute is a preparation tool, not legal advice. The German mission, the Federal Employment Agency and the foreigners authority decide. Salary thresholds change every year; recheck make-it-in-germany.com before filing.",
};

const deFamilyChildren = task(
  "de-fam-children",
  "Children under 18",
  "Unmarried minor children can join. Under 16, or 16+ arriving with or soon after the parents (usually within six months): no further conditions. 16+ arriving later: German C1 or proof of integration, except for children of skilled workers.",
  ["de-bamf-family"],
  "information",
);

const deFamily: CountryGuide = {
  version: GUIDE_VERSION,
  country: "DE",
  countryName: "Germany",
  purpose: "family",
  title: "Joining family in Germany",
  intro: "Spouses, registered partners and minor children joining a third-country citizen who holds a German residence permit.",
  notCovered:
    "Family of German or EU citizens, family of people with protection status, parents and other relatives, and EU long-term residents from another member state are not covered.",
  variants: [
    {
      id: "skilled-sponsor",
      label: "Relative holds an EU Blue Card or a skilled-worker permit",
      summary:
        "Easier rules: the spouse does not need German before entry and no proof of living space is required. The family's livelihood must still be secured.",
      keyFacts: [
        { label: "German before entry", value: "Not required" },
        { label: "Living space", value: "Not required" },
        { label: "Fees", value: "Visa €75; residence permit up to €100" },
      ],
      stages: [
        stage("de-fam-sk-eligibility", "01", "ELIGIBILITY", "Family link and livelihood", "Both spouses must be at least 18.", "Before you plan", [
          task(
            "de-fam-sk-livelihood",
            "Secured livelihood",
            "The family's living costs must be covered. If your relative moves on a Blue Card from another EU country straight into a German Blue Card, existing health insurance is enough instead.",
            ["de-miig-family", "de-bamf-family"],
          ),
          task("de-fam-sk-no-german", "No German or living-space proof needed", "Spouses of skilled workers and Blue Card holders can learn German after arrival, and living space is not checked.", ["de-bamf-family", "de-miig-family"], "information"),
          deFamilyChildren,
        ]),
        deVisaStage("de-fam-sk", "de-miig-family", "Passport and proof of the family relationship (marriage or birth certificate), plus livelihood proof if needed.", false),
        deAfterArrival("de-fam-sk", "de-miig-family", "residence permit for a spouse (§ 30 AufenthG) or child (§ 32 AufenthG)"),
      ],
    },
    {
      id: "other-sponsor",
      label: "Relative holds another German residence permit",
      summary: "The general rules: both spouses 18 or older, basic German before entry, enough living space and a secured livelihood.",
      keyFacts: [
        { label: "German before entry", value: "Basic, simple everyday German" },
        { label: "Living space", value: "Enough for the family" },
        { label: "Fees", value: "Visa €75; residence permit up to €100" },
      ],
      stages: [
        stage("de-fam-gen-eligibility", "01", "ELIGIBILITY", "German, housing and livelihood", "Your relative needs a valid residence title that allows family reunification.", "Before you plan", [
          task(
            "de-fam-gen-german",
            "Basic German certificate",
            "The spouse must be able to communicate in simple everyday German before the visa. Certificates from Goethe-Institut, telc, ÖSD, ECL or the DSD are accepted.",
            ["de-bamf-family", "de-aa-certificates"],
            "attention",
          ),
          task("de-fam-gen-housing", "Enough living space and secured livelihood", "Your relative must show housing big enough for the family and that the family's living costs are covered.", ["de-bamf-family"]),
          task(
            "de-fam-gen-permit-type",
            "Check your relative's permit",
            "Some titles, such as permits for temporary stays, exclude family reunification. The \"legal basis\" field on the residence card shows which rules apply.",
            ["de-bamf-family"],
            "information",
          ),
          { ...deFamilyChildren, id: "de-fam-gen-children" },
        ]),
        deVisaStage("de-fam-gen", "de-miig-family", "Passport, proof of the family relationship, the German certificate and livelihood proof.", false),
        deAfterArrival("de-fam-gen", "de-miig-family", "residence permit for a spouse (§ 30 AufenthG) or child (§ 32 AufenthG)"),
      ],
    },
  ],
  sources: deSources,
  disclaimer:
    "DocRoute is a preparation tool, not legal advice. The German mission and the foreigners authority decide. Recheck make-it-in-germany.com and bamf.de before filing.",
};

const deBusiness: CountryGuide = {
  version: GUIDE_VERSION,
  country: "DE",
  countryName: "Germany",
  purpose: "business",
  title: "Doing business in Germany",
  intro: "Residence permits for self-employment (a business, § 21 AufenthG) and for freelance work in the liberal professions (§ 21(5)).",
  notCovered: "Artists' special rules, researchers' spin-offs, the trade registration itself and EU/EEA/Swiss citizens are not covered.",
  variants: [
    {
      id: "self-employed",
      label: "Self-employed business (Gewerbe)",
      summary:
        "Your business must serve an economic interest or a regional need and be expected to benefit the economy, financed by your own capital or a loan commitment. Over 45: adequate pension provision.",
      keyFacts: [
        { label: "Permit", value: "Up to 3 years at first" },
        { label: "Settlement", value: "Possible after 3 years" },
        { label: "Residence permit", value: "Up to €100" },
      ],
      stages: [
        stage("de-se-case", "01", "BUSINESS CASE", "Interest, effect and financing", "The authorities assess your business concept.", "Before you plan", [
          task(
            "de-se-interest",
            "Economic interest and a positive effect",
            "Show that the business meets an economic interest or a regional demand and is expected to have a positive effect on the economy.",
            ["de-miig-self-employment"],
          ),
          task("de-se-financing", "Financing secured", "Finance the business concept with your own capital or a loan commitment.", ["de-miig-self-employment"]),
          task("de-se-pension", "Over 45: pension provision", "If you are over 45, prove adequate old-age pension provision.", ["de-miig-self-employment"], "information"),
        ]),
        stage("de-se-application", "02", "APPLICATION", "Visa and documents", "The German mission abroad issues the visa.", "Before you move", [
          task(
            "de-se-documents",
            "Application, business plan and insurance",
            "Your business concept with its financing, application form, valid passport and proof of health insurance; references and proof of entrepreneurial experience help. Ask the German mission for its document leaflet first.",
            ["de-miig-freelance", "de-miig-self-employment"],
          ),
          deVisaFreeTask("de-se", true),
        ]),
        stage("de-se-after", "03", "AFTER ARRIVAL", "Permit and later steps", "The local foreigners authority issues the residence permit.", "After arrival", [
          task("de-se-register", "Register your address", "Register your home address at the Residents' Registration Office after you move in.", ["de-miig-skilled"]),
          task(
            "de-se-permit",
            "Residence permit for up to three years",
            "The permit is first issued for up to three years (fee up to €100) and extended if the business succeeds and covers your family's living costs. A settlement permit can follow after three years.",
            ["de-miig-self-employment", "de-miig-freelance"],
          ),
        ]),
      ],
    },
    {
      id: "freelance",
      label: "Freelancer (liberal professions)",
      summary:
        "Freelance work in a liberal profession: show you can finance the business and live from it, and hold any licence the profession needs. Over 45: pension provision.",
      keyFacts: [
        { label: "Permit", value: "Up to 3 years, extendable" },
        { label: "Residence permit", value: "Up to €100" },
        { label: "From age 45", value: "Pension provision" },
      ],
      stages: [
        stage("de-fl-case", "01", "BUSINESS CASE", "Funding, income and licence", "Advisory services can assess whether you qualify.", "Before you plan", [
          task("de-fl-funds", "Funding and a living from it", "Show that you can finance your business and make a living from it.", ["de-miig-freelance", "de-miig-self-employment"]),
          task("de-fl-licence", "Permission to practise", "Hold permission to practise your profession where one is required.", ["de-miig-freelance"]),
          task("de-fl-pension", "Over 45: pension provision", "If you are over 45, provide adequate pension provision.", ["de-miig-freelance"], "information"),
        ]),
        stage("de-fl-application", "02", "APPLICATION", "Visa and documents", "The German mission abroad issues the visa.", "Before you move", [
          task(
            "de-fl-documents",
            "Application, business plan and insurance",
            "Application form, valid passport, business plan and proof of health insurance; researchers and academics add their employment contract, German graduates a copy of their degree.",
            ["de-miig-freelance"],
          ),
          deVisaFreeTask("de-fl", true),
        ]),
        stage("de-fl-after", "03", "AFTER ARRIVAL", "Permit and later steps", "The local foreigners authority issues the residence permit.", "After arrival", [
          task("de-fl-register", "Register your address", "Register your home address at the Residents' Registration Office after you move in.", ["de-miig-skilled"]),
          task(
            "de-fl-permit",
            "Residence permit for up to three years",
            "Fee up to €100; first issued for up to three years and extended if your work supports you and your family.",
            ["de-miig-freelance"],
          ),
        ]),
      ],
    },
  ],
  sources: deSources,
  disclaimer:
    "DocRoute is a preparation tool, not legal advice. The German mission and the foreigners authority decide; chambers and professional bodies decide on licences. Recheck make-it-in-germany.com before filing.",
};

// ------------------------------------------------------------- Switzerland
// Checked 2026-11-05 against the State Secretariat for Migration (SEM,
// pages last modified 5 July 2026 and 22 December 2020) and the federal
// portal ch.ch. Swiss pages state conditions without fixed amounts; DocRoute
// adds none. EU/EFTA citizens follow free movement (passport track).

const SEM = "State Secretariat for Migration SEM";
const CHCH = "Swiss Confederation, ch.ch";

const chSources: RouteSource[] = [
  srcDeCh(
    "ch-sem-admission",
    "Basis for admission to the Swiss employment market (last modification 5 Jul 2026)",
    SEM,
    "https://www.sem.admin.ch/sem/en/home/themen/arbeit/nicht-eu_efta-angehoerige/grundlagen_zur_arbeitsmarktzulassung.html",
  ),
  srcDeCh(
    "ch-sem-procedure",
    "Procedure for non-EU/EFTA work permits (last modification 22 Dec 2020)",
    SEM,
    "https://www.sem.admin.ch/sem/en/home/themen/arbeit/nicht-eu_efta-angehoerige/verfahrensablauf.html",
  ),
  srcDeCh("ch-sem-work-faq", "FAQ: working in Switzerland (last modification 5 Jul 2026)", SEM, "https://www.sem.admin.ch/sem/en/home/themen/arbeit/faq.html"),
  srcDeCh("ch-chch-working", "Working in Switzerland as a foreign national", CHCH, "https://www.ch.ch/en/foreign-nationals-in-switzerland/working-in-switzerland/"),
  srcDeCh(
    "ch-chch-family",
    "Application for family reunification in Switzerland",
    CHCH,
    "https://www.ch.ch/en/foreign-nationals-in-switzerland/living-in-switzerland/family-reunification/",
  ),
];

const chArrival = (prefix: string, selfEmployed: boolean) =>
  stage(`${prefix}-arrival`, "03", "ARRIVAL", "Visa, registration and insurance", "SEM's decision alone does not let you enter Switzerland.", "After approval", [
    task(
      `${prefix}-visa`,
      "Collect the visa if you need one",
      "If your nationality needs a visa, the cantonal authority sends an electronic visa authorisation to the Swiss representation abroad, where you collect the visa.",
      ["ch-sem-procedure", "ch-chch-working"],
    ),
    task(
      `${prefix}-register`,
      "Register with your commune within 14 days",
      `Register with the communal authorities where you live within 14 days of arrival. ${selfEmployed ? "You may start your business" : "You may start work"} only after registration.`,
      ["ch-chch-working", "ch-sem-procedure"],
      "attention",
      "Within 14 days of arrival",
    ),
    task(
      `${prefix}-insurance`,
      "Health and accident insurance",
      selfEmployed
        ? "Private health insurance is compulsory and must be in place within 3 months of arrival."
        : "Private health insurance is compulsory within 3 months of arrival or starting work. Your employer insures you against accidents if you work 8 or more hours a week.",
      ["ch-chch-working"],
    ),
  ]);

const chWork: CountryGuide = {
  version: GUIDE_VERSION,
  country: "CH",
  countryName: "Switzerland",
  purpose: "work",
  title: "Working in Switzerland",
  intro:
    "Work permits for non-EU/EFTA citizens. Admission is limited to qualified workers, capped by annual quotas and open only when no suitable Swiss or EU/EFTA candidate is found. The employer applies; the canton and SEM decide.",
  notCovered:
    "EU/EFTA citizens (free movement, see your passport path), intra-company transfers, internships and young professionals, au pairs, researchers and short-term assignments are not covered.",
  variants: [
    {
      id: "qualified",
      label: "Qualified worker with a job offer",
      summary:
        "A manager, specialist or qualified worker, usually with a university degree and several years of experience. The employer must show no suitable candidate with priority was found, and pay Swiss salary and conditions.",
      keyFacts: [
        { label: "Who", value: "Managers, specialists, qualified workers" },
        { label: "Quota", value: "Annual maximum numbers" },
        { label: "Processing", value: "About 6–8 weeks (SEM)" },
      ],
      stages: [
        stage("ch-wk-eligibility", "01", "ELIGIBILITY", "Qualification, priority and quota", "Admission must serve Switzerland's overall economic interest.", "Before you plan", [
          task(
            "ch-wk-qualification",
            "Degree and several years of experience",
            "Usually a university or university of applied sciences degree plus several years of experience; in some fields special training plus several years of experience is enough.",
            ["ch-sem-admission", "ch-chch-working"],
          ),
          task(
            "ch-wk-priority",
            "No suitable candidate with priority",
            "Your employer must show a real recruitment effort, including registering the job with the regional employment centre (RAV) and advertising through EURES, and that no Swiss, settled or EU/EFTA candidate was suitable.",
            ["ch-sem-admission"],
            "attention",
          ),
          task(
            "ch-wk-conditions",
            "Swiss salary and conditions, free quota",
            "Pay and working conditions must match local and sector norms, and a permit must still be available under the annual quota.",
            ["ch-sem-admission", "ch-sem-work-faq"],
          ),
          task(
            "ch-wk-integration",
            "Integration and accommodation",
            "Language skills, age and professional and social adaptability are considered, and suitable accommodation must be available.",
            ["ch-sem-admission"],
            "information",
          ),
        ]),
        stage("ch-wk-application", "02", "APPLICATION", "The employer applies", "The canton decides first, then SEM gives the final decision.", "Before you move", [
          task(
            "ch-wk-employer",
            "Employer files with the cantonal authority",
            "Your employer applies to the cantonal employment or immigration authority with a contract signed by both of you that applies only if the permit is granted. SEM's decision carries a fee paid by the employer.",
            ["ch-sem-procedure", "ch-sem-admission"],
          ),
          task(
            "ch-wk-documents",
            "Your CV, certificates and references",
            "Provide originals with translations into a Swiss official language or English.",
            ["ch-sem-admission"],
          ),
          task("ch-wk-time", "Allow 6–8 weeks", "SEM's experience: six to eight weeks for full processing, longer in complex cases.", ["ch-sem-work-faq"], "information"),
        ]),
        chArrival("ch-wk", false),
      ],
    },
    {
      id: "swiss-graduate",
      label: "Graduate of a Swiss university",
      summary:
        "After a Swiss degree you have six months to find a job matching your qualification. You can be admitted despite the priority rule if the work is of overriding scientific or economic interest.",
      keyFacts: [
        { label: "Job search", value: "6 months after your course" },
        { label: "Priority rule", value: "Can be waived (overriding interest)" },
        { label: "Processing", value: "About 6–8 weeks (SEM)" },
      ],
      stages: [
        stage("ch-gr-search", "01", "JOB SEARCH", "Six months to find a job", "Counted from the end of your course in Switzerland.", "After graduating", [
          task(
            "ch-gr-six-months",
            "Find a job that matches your degree",
            "Graduates of a Swiss higher education institution have six months after their course to find work matching their qualifications.",
            ["ch-sem-work-faq"],
            "attention",
            "Within 6 months of graduating",
          ),
          task(
            "ch-gr-interest",
            "Overriding scientific or economic interest",
            "Swiss and EU/EFTA workers normally have priority; for Swiss graduates it can be waived when the job is of overriding scientific or economic interest.",
            ["ch-sem-work-faq", "ch-sem-admission"],
          ),
        ]),
        stage("ch-gr-application", "02", "APPLICATION", "The employer applies", "The same cantonal procedure as for other work permits.", "When you have an offer", [
          task(
            "ch-gr-employer",
            "Employer files with the cantonal authority",
            "Your employer applies to the cantonal authority with your contract; salary and working conditions must match Swiss norms.",
            ["ch-sem-procedure", "ch-sem-admission"],
          ),
        ]),
        stage("ch-gr-after", "03", "AFTER APPROVAL", "Start work", "SEM sends its decision to you, your employer and the canton.", "After approval", [
          task("ch-gr-start", "Start only after the permit", "Working without a permit is not allowed; your employer receives the decision.", ["ch-sem-procedure", "ch-chch-working"]),
        ]),
      ],
    },
  ],
  sources: chSources,
  disclaimer:
    "DocRoute is a preparation tool, not legal advice. The cantonal authority and SEM decide; quotas are set every year by the Federal Council. Recheck sem.admin.ch before applying.",
};

const chFamily: CountryGuide = {
  version: GUIDE_VERSION,
  country: "CH",
  countryName: "Switzerland",
  purpose: "family",
  title: "Joining family in Switzerland",
  intro: "A spouse or registered partner and unmarried children under 18 joining a non-EU/EFTA citizen who lives in Switzerland.",
  notCovered:
    "Family of Swiss and EU/EFTA citizens, unmarried partners, parents and grandparents, family of provisionally admitted people (F permit) and of refugees are not covered.",
  variants: [
    {
      id: "third-country-sponsor",
      label: "Relative is a non-EU/EFTA citizen living in Switzerland",
      summary:
        "Housing big enough for the family, no dependence on social assistance and, for a spouse who cannot speak the local language, enrolment in a language course (at least A1 orally). Apply within 5 years, or 1 year for children over 12.",
      keyFacts: [
        { label: "Deadline", value: "5 years; 1 year for children over 12" },
        { label: "Language", value: "Course enrolment, at least A1 orally" },
        { label: "Work", value: "Family members generally may work" },
      ],
      stages: [
        stage("ch-fam-eligibility", "01", "ELIGIBILITY", "Housing, money and language", "Whether reunification is a right or at the authorities' discretion depends on your relative's nationality and permit.", "Before you plan", [
          task(
            "ch-fam-permit",
            "Check your relative's permit",
            "A B permit does not necessarily give a right to family reunification, though it may still be granted. Asylum seekers cannot bring family.",
            ["ch-chch-family"],
            "attention",
          ),
          task(
            "ch-fam-housing-money",
            "Housing and finances",
            "Accommodation large enough for the whole family by Swiss standards, and your relative must not depend on social assistance; self-employed or unemployed sponsors prove enough resources.",
            ["ch-chch-family"],
          ),
          task(
            "ch-fam-language",
            "Language course enrolment",
            "A spouse who cannot communicate in the local national language needs a certificate of enrolment in a language course; the level is at least A1 orally.",
            ["ch-chch-family"],
          ),
          task(
            "ch-fam-deadline",
            "Apply within the deadline",
            "Generally within 5 years; for children over 12, within 1 year.",
            ["ch-chch-family"],
            "information",
          ),
        ]),
        stage("ch-fam-application", "02", "APPLICATION", "Apply to the canton", "The cantonal immigration authority handles family reunification.", "Before you move", [
          task(
            "ch-fam-documents",
            "Documents for each family member",
            "Valid passport or ID, a visa if your nationality needs one, and a certificate from your home country proving the relationship. The marriage or partnership must be recognised in Switzerland.",
            ["ch-chch-family"],
          ),
          task("ch-fam-where", "Contact the cantonal immigration authority", "Your relative's canton of residence tells you how and where to file.", ["ch-chch-family"]),
        ]),
        stage("ch-fam-after", "03", "AFTER ARRIVAL", "Insurance, work and school", "Steps once the family is in Switzerland.", "After arrival", [
          task("ch-fam-insurance", "Health insurance for each person", "Health insurance is compulsory and private: every family member needs their own contract.", ["ch-chch-family"]),
          task(
            "ch-fam-work",
            "Work and school",
            "Family members generally may work; family of L permit holders need a cantonal work permit. Children attend free compulsory school until at least 16.",
            ["ch-chch-family"],
            "information",
          ),
        ]),
      ],
    },
  ],
  sources: chSources,
  disclaimer: "DocRoute is a preparation tool, not legal advice. The cantonal authority decides. Recheck ch.ch before applying.",
};

const chBusiness: CountryGuide = {
  version: GUIDE_VERSION,
  country: "CH",
  countryName: "Switzerland",
  purpose: "business",
  title: "Doing business in Switzerland",
  intro: "Permits for self-employment by non-EU/EFTA citizens: a labour-market review and a lasting positive effect on the Swiss economy. You apply yourself; the canton and SEM decide.",
  notCovered: "EU/EFTA citizens (free movement), cross-border services, company registration itself and investors without their own activity are not covered.",
  variants: [
    {
      id: "self-employed",
      label: "Self-employed business",
      summary:
        "The business must have a lasting positive effect on the economy (overall economic interest), backed by a business plan, and you must meet the personal requirements. Permits count against the annual quota.",
      keyFacts: [
        { label: "Key test", value: "Overall economic interest" },
        { label: "Quota", value: "Annual maximum numbers" },
        { label: "Processing", value: "6–8 weeks, longer for new businesses" },
      ],
      stages: [
        stage("ch-se-case", "01", "BUSINESS CASE", "Show the lasting benefit", "Admission follows a labour-market review (Art. 19 FNIA).", "Before you plan", [
          task(
            "ch-se-interest",
            "Lasting positive effect on the economy",
            "Show that the business will have a lasting positive impact (overall economic interest) and that you meet the personal requirements.",
            ["ch-sem-work-faq", "ch-sem-admission"],
          ),
          task(
            "ch-se-plan",
            "Business plan",
            "Planned activities, market analysis, staff development and recruitment, planned investments, and turnover and profit forecasts.",
            ["ch-sem-work-faq"],
          ),
          task(
            "ch-se-company",
            "Company documents",
            "Organisational ties with other businesses, the articles of association and an extract from the commercial register.",
            ["ch-sem-work-faq"],
          ),
        ]),
        stage("ch-se-application", "02", "APPLICATION", "Apply to the canton yourself", "Self-employed people apply in person through the cantonal authorities.", "Before you move", [
          task(
            "ch-se-where",
            "File with the cantonal authority",
            "Apply to the cantonal immigration and employment market authority; SEM gives the final decision.",
            ["ch-chch-working", "ch-sem-procedure"],
          ),
          task(
            "ch-se-time",
            "Allow extra time",
            "Expect six to eight weeks; first-time business applications can take longer. A permit must be available under the quota.",
            ["ch-sem-work-faq"],
            "information",
          ),
        ]),
        chArrival("ch-se", true),
      ],
    },
  ],
  sources: chSources,
  disclaimer:
    "DocRoute is a preparation tool, not legal advice. The cantonal authority and SEM decide; the commercial register and cantonal offices handle the company itself. Recheck sem.admin.ch before applying.",
};

const guides: CountryGuide[] = [czFamily, czBusiness, atWork, atFamily, atBusiness, deWork, deFamily, deBusiness, chWork, chFamily, chBusiness];

export function findCountryGuide(country: string | null, purpose: string | null): CountryGuide | null {
  const code = (country ?? "").toUpperCase();
  const verified = guides.find((guide) => guide.country === code && guide.purpose === purpose);
  if (verified) return verified;
  return purpose === "family" || purpose === "business" || purpose === "work" ? buildLinkedGuide(code, purpose) : null;
}

export function pickVariant(guide: CountryGuide, variantId: string | null): GuideVariant {
  return guide.variants.find((variant) => variant.id === variantId) ?? guide.variants[0];
}

export function hasCountryGuide(countryCode: string, purpose: string) {
  return (
    guides.some((guide) => guide.country === countryCode && guide.purpose === purpose) ||
    hasLinkedGuide(countryCode, purpose)
  );
}

/** Only DocRoute's verified guides (Czechia, Austria, Germany, Switzerland). */
export const countryGuides: readonly CountryGuide[] = guides;
