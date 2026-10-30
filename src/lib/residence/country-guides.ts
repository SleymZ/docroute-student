import { czechiaResidenceRules, czechiaSources } from "@/data/czechia-residence";
import type { RouteSource, RouteStage, RouteTask } from "@/types/route-preview";

// Residence guides for Czechia (family, business) and Austria (work,
// family, business), third-country citizens. Checked on 2026-10-30 against
// the Czech Ministry of the Interior portal (ipc.gov.cz) and the Austrian
// Federal Government's migration platform (migration.gv.at) plus
// oesterreich.gv.at. These are source-linked checklists, not dated plans:
// the portals publish fees, documents and decision periods, and DocRoute
// adds nothing they do not state. Czech work routes live at /route/czechia.

export const GUIDE_VERSION = "cz-at-guides-2026-10-30";
const checked = "2026-10-30";

export const guideCountries = ["CZ", "AT"] as const;
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
  country: GuideCountry;
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
        "Apply at a Czech embassy (processing up to 270 days) or, if you are already lawfully in Czechia, at a Ministry of the Interior office (60 days). The permit lasts as long as your relative's permit (at least one year) and lets you work without a work permit.",
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
              "From abroad: in person at a Czech embassy, which forwards the file to the Ministry (up to 270 days). In Czechia: in person at your local Ministry of the Interior office if you stay there lawfully (60 days). Family of a Blue Card or intra-company transfer card holder from another EU state can file in Czechia within 30 or 90 days of entry.",
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
      label: "Relative holds a Red-White-Red Card or EU Blue Card",
      summary:
        "Red-White-Red Card plus: no quota and unrestricted labour-market access. Some family members of these card holders are exempt from the German A1 requirement.",
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
      label: "Relative holds a settlement permit",
      summary:
        "Settlement Permit for family members: subject to the annual quota and the general requirements, with German A1 at first application.",
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

const guides: CountryGuide[] = [czFamily, czBusiness, atWork, atFamily, atBusiness];

export function findCountryGuide(country: string | null, purpose: string | null): CountryGuide | null {
  return guides.find((guide) => guide.country === (country ?? "").toUpperCase() && guide.purpose === purpose) ?? null;
}

export function pickVariant(guide: CountryGuide, variantId: string | null): GuideVariant {
  return guide.variants.find((variant) => variant.id === variantId) ?? guide.variants[0];
}

export function hasCountryGuide(countryCode: string, purpose: string) {
  return guides.some((guide) => guide.country === countryCode && guide.purpose === purpose);
}

export const countryGuides: readonly CountryGuide[] = guides;
