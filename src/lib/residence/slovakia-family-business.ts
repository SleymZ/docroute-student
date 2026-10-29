import { slovakiaFamilyBusinessRules as rules } from "@/data/slovakia-family-business";
import { slovakiaResidentSources } from "@/data/slovakia-residents";
import {
  findResidenceStatusConflict,
  isEuEeaSwissCitizen,
  normalizeCurrentResidenceStatus,
} from "@/lib/profile-options";
import type { ResidenceFiling } from "@/lib/residence/slovakia";
import type { CurrentResidenceStatus } from "@/types/admission";
import type { RouteSource, RouteStage, RouteTask } from "@/types/route-preview";

export const FAMILY_ROUTE_VERSION = "sk-family-2026-10-29";
export const BUSINESS_ROUTE_VERSION = "sk-business-2026-10-29";

// Who the applicant joins in Slovakia. Slovak and EU citizens' family
// members use other procedures that DocRoute has not verified.
export const familySponsors = [
  "temporary-residence",
  "permanent-residence",
  "blue-card",
  "slovak-citizen",
  "eu-citizen",
] as const;
export type FamilySponsor = (typeof familySponsors)[number];

export const familyRelations = [
  "spouse",
  "child-minor",
  "child-adult-dependent",
  "parent-dependent",
  "partner",
] as const;
export type FamilyRelation = (typeof familyRelations)[number];

export const businessForms = ["trade-licence", "company-executive"] as const;
export type BusinessForm = (typeof businessForms)[number];

export type FamilyProfile = {
  destinationCountryCode: "SK";
  citizenshipCountryCode: string;
  currentResidenceStatus: CurrentResidenceStatus;
  sponsor: FamilySponsor;
  relation: FamilyRelation;
  // Spouses only: both are at least 18.
  bothAdults: "yes" | "no" | null;
};

export type BusinessProfile = {
  destinationCountryCode: "SK";
  citizenshipCountryCode: string;
  currentResidenceStatus: CurrentResidenceStatus;
  form: BusinessForm;
};

export type PurposeRoute<P> = {
  version: string;
  profile: P;
  // false when the temporary-residence procedure does not apply or is not
  // verified for these answers; then there is nothing to date.
  applicable: boolean;
  filing: ResidenceFiling | null;
  processingDays: number | null;
  headline: string;
  stages: RouteStage[];
  sources: RouteSource[];
  disclaimer: string;
};

export const familySponsorLabels: Record<FamilySponsor, string> = {
  "temporary-residence": "A non-EU citizen with Slovak temporary residence",
  "permanent-residence": "A non-EU citizen with Slovak permanent residence",
  "blue-card": "An EU Blue Card holder in Slovakia",
  "slovak-citizen": "A Slovak citizen",
  "eu-citizen": "An EU, EEA or Swiss citizen living in Slovakia",
};

export const familyRelationLabels: Record<FamilyRelation, string> = {
  spouse: "Husband or wife",
  "child-minor": "Unmarried child under 18",
  "child-adult-dependent": "Unmarried adult child who cannot look after themselves for health reasons",
  "parent-dependent": "Parent who depends on their care",
  partner: "Unmarried partner",
};

export const businessFormLabels: Record<BusinessForm, string> = {
  "trade-licence": "Sole trader with a trade licence (živnosť)",
  "company-executive": "Executive of a company (konateľ)",
};

const familyDisclaimer =
  "DocRoute is a preparation tool, not legal advice. There is no legal entitlement to family-reunification residence; the Foreign Police decide. IOM guidance used here is not legally binding, so recheck each requirement before filing.";
const businessDisclaimer =
  "DocRoute is a preparation tool, not legal advice. The Foreign Police decide on residence and the trade office on the trade licence. IOM guidance used here is not legally binding, and the business articles themselves could not be opened, so recheck each requirement before filing.";

const pick = <T extends string>(options: readonly T[], value: string | null): T | null =>
  options.includes(value as T) ? (value as T) : null;

function baseParams(params: URLSearchParams) {
  if ((params.get("country") ?? "SK").toUpperCase() !== "SK") return null;
  const citizenship = (params.get("citizenship") ?? "").toUpperCase();
  const status = normalizeCurrentResidenceStatus(params.get("residenceStatus"));
  if (!/^[A-Z]{2}$/.test(citizenship) || !status) return null;
  return { citizenship, status };
}

export function parseFamilyProfile(params: URLSearchParams): FamilyProfile | null {
  const base = baseParams(params);
  const sponsor = pick(familySponsors, params.get("sponsor"));
  const relation = pick(familyRelations, params.get("relation"));
  if (!base || !sponsor || !relation) return null;
  const adults = pick(["yes", "no"] as const, params.get("adults"));
  if (relation === "spouse" && !adults) return null;
  return {
    destinationCountryCode: "SK",
    citizenshipCountryCode: base.citizenship,
    currentResidenceStatus: base.status,
    sponsor,
    relation,
    bothAdults: relation === "spouse" ? adults : null,
  };
}

export function createFamilyProfileSearchParams(profile: FamilyProfile) {
  const params = new URLSearchParams({
    country: "SK",
    citizenship: profile.citizenshipCountryCode,
    residenceStatus: profile.currentResidenceStatus,
    sponsor: profile.sponsor,
    relation: profile.relation,
  });
  if (profile.relation === "spouse" && profile.bothAdults) params.set("adults", profile.bothAdults);
  return params;
}

export function parseBusinessProfile(params: URLSearchParams): BusinessProfile | null {
  const base = baseParams(params);
  const form = pick(businessForms, params.get("form"));
  if (!base || !form) return null;
  return {
    destinationCountryCode: "SK",
    citizenshipCountryCode: base.citizenship,
    currentResidenceStatus: base.status,
    form,
  };
}

export function createBusinessProfileSearchParams(profile: BusinessProfile) {
  return new URLSearchParams({
    country: "SK",
    citizenship: profile.citizenshipCountryCode,
    residenceStatus: profile.currentResidenceStatus,
    form: profile.form,
  });
}

export function getFamilyProgressId(profile: FamilyProfile) {
  return [profile.citizenshipCountryCode, profile.currentResidenceStatus, profile.sponsor, profile.relation].join("|");
}

export function getBusinessProgressId(profile: BusinessProfile) {
  return [profile.citizenshipCountryCode, profile.currentResidenceStatus, profile.form].join("|");
}

const allSources = [...rules.sources, ...slovakiaResidentSources];

function infoStage(id: string, eyebrow: string, title: string, description: string, tasks: RouteTask[]): RouteStage {
  return { id, number: "01", eyebrow, title, description, timing: "Before you plan", tasks };
}

// Cases shared by both purposes where the third-country temporary
// residence does not apply. Returns null when it does.
function sharedGate(
  profile: { citizenshipCountryCode: string; currentResidenceStatus: CurrentResidenceStatus },
  purpose: "family" | "business",
): RouteStage | null {
  if (profile.citizenshipCountryCode === "SK") {
    return infoStage("status", "STATUS", "No foreign residence permit needed", "You reported Slovak citizenship.", [
      {
        id: "slovak-citizen",
        title: "Residence permit not required",
        description:
          purpose === "business"
            ? "As a Slovak citizen you only need the trade licence or the company registration itself."
            : "As a Slovak citizen you do not need a residence permit to live in Slovakia.",
        status: "not-applicable",
        sourceIds: [],
      },
    ]);
  }
  const conflict = findResidenceStatusConflict(profile.citizenshipCountryCode, profile.currentResidenceStatus);
  if (conflict) {
    return infoStage("status", "STATUS", "Check your answers", conflict, [
      { id: "status-conflict", title: "Citizenship and status disagree", description: conflict, status: "attention", sourceIds: [] },
    ]);
  }
  if (isEuEeaSwissCitizen(profile.citizenshipCountryCode)) {
    return infoStage(
      "status",
      "EU REGISTRATION",
      "EU, EEA and Swiss citizens register instead",
      "Union citizens do not apply for temporary residence. They report their stay and register their residence.",
      [
        {
          id: "eu-registration",
          title: "Report your stay and register",
          description:
            "Report the stay within 10 working days of entry (unless your accommodation provider does), and register residence within 30 days after the first 3 months; registration is free and the card is optional.",
          status: "action",
          sourceIds: ["iom-eu-citizens"],
        },
      ],
    );
  }
  if (profile.currentResidenceStatus === "destination-permanent-residence") {
    return infoStage(
      "status",
      "PERMANENT RESIDENCE",
      "You already have residence that covers this",
      purpose === "business"
        ? "Permanent residents are treated like Slovak individuals for business."
        : "With permanent or long-term residence you do not need a family-reunification permit for yourself.",
      [
        {
          id: "permanent-resident",
          title: purpose === "business" ? "Get the trade licence only" : "No new residence application",
          description:
            purpose === "business"
              ? "You can trade from the day you notify the trade office (or a later date you state), or act as a company's statutory body, without a business residence permit."
              : "Keep your current residence valid. Family members who join you apply for their own family-reunification residence.",
          status: purpose === "business" ? "action" : "information",
          sourceIds: purpose === "business" ? ["iom-business-by-residence", "iom-trade-licence-basics"] : ["iom-permanent-residence"],
        },
      ],
    );
  }
  return null;
}

function documentsTasks(feeLine: string, extra: RouteTask[], feeSource: string, purposeSource: string): RouteTask[] {
  return [
    {
      id: "application-form",
      title: "Official application form and valid passport",
      description: "Fill in the official Ministry of the Interior form in Slovak and bring your valid passport. You must submit in person.",
      status: "action",
      sourceIds: ["iom-temporary-residence-application"],
    },
    ...extra,
    {
      id: "criminal-record",
      title: "Criminal-record extracts",
      description:
        "From your country of citizenship and every country where you stayed more than 90 days in 6 consecutive months during the last 3 years. Not needed under 14. No older than 90 days when you file.",
      status: "action",
      dueLabel: "No older than 90 days at filing",
      sourceIds: ["iom-temporary-residence-application", purposeSource],
    },
    {
      id: "accommodation",
      title: `Proof of accommodation for at least ${rules.accommodationMinMonths} months`,
      description:
        "A notarised owner affidavit (signed by all owners), the provider's electronic consent, a notarised lease naming you as tenant, or a hotel or dormitory confirmation. Covers 6 months or the whole stay if shorter.",
      status: "action",
      dueLabel: "No older than 90 days at filing",
      sourceIds: ["iom-temporary-residence-application", purposeSource],
    },
    {
      id: "authentication-translation",
      title: "Apostille and official translation",
      description:
        "Foreign official documents need an apostille or consular legalisation, and a translation into Slovak by a sworn translator (or into Czech). A translation made abroad must be confirmed by a Slovak embassy, except one made in Czechia. Bring notarised copies and keep your originals.",
      status: "action",
      sourceIds: [purposeSource, "iom-temporary-residence-application"],
    },
    {
      id: "fees",
      title: "Administrative fee and residence card",
      description: `${feeLine} The residence card costs €${rules.residenceCardFeesEur.standard} (within 30 days) or €${rules.residenceCardFeesEur.expedited} (within 2 working days).`,
      status: "action",
      sourceIds: [feeSource],
    },
  ];
}

function filingTask(filing: ResidenceFiling, businessFirstApplication: boolean): RouteTask {
  const purposeSource = businessFirstApplication ? "iom-business-by-residence" : "iom-family-reunification";
  const description =
    filing === "in-country"
      ? "Book an appointment online and apply in person at the Foreign Police department in Slovakia."
      : filing === "abroad"
        ? businessFirstApplication
          ? "A first business application cannot be filed in Slovakia: apply in person at the Slovak embassy for your citizenship or country of residence. Only a change of purpose from an existing Slovak temporary residence is filed at the Foreign Police."
          : "Apply in person at the Slovak embassy accredited for your citizenship or your country of residence."
        : "Your status does not map to one filing place. Confirm with the Foreign Police or the embassy where you may apply.";
  return {
    id: "residence-submission-place",
    title:
      filing === "in-country"
        ? "File at the Foreign Police in Slovakia"
        : filing === "abroad"
          ? "File at the Slovak embassy"
          : "Confirm where to file",
    description,
    status: filing === "unclear" ? "attention" : "action",
    sourceIds: ["iom-temporary-residence-application", purposeSource],
  };
}

function afterApprovalTasks(insuranceProof: boolean, sourceId: string): RouteTask[] {
  return [
    {
      id: "post-card-duties",
      title: "Arrival and card duties",
      description: `Enter Slovakia within ${rules.entryWithinDaysOfApproval} days of approval and report the start of your stay to the Foreign Police within ${rules.reportArrivalWorkingDays} working days. Take out health insurance within ${rules.healthInsuranceWorkingDays} working days of receiving the card${insuranceProof ? ` and hand in proof within ${rules.healthInsuranceProofDays} days` : ""}, and submit a medical report (no older than ${rules.medicalReportDays} days) within ${rules.medicalReportDays} days of receiving the card.`,
      status: "action",
      dueLabel: "Immediately after arrival and card collection",
      sourceIds: [sourceId, "iom-temporary-residence-application"],
    },
    {
      id: "stay-conditions",
      title: "Keep living mainly in Slovakia",
      description:
        "Stay in Slovakia for more than half of the residence period in each calendar year, and tell the Foreign Police in writing before a continuous absence of more than 180 days.",
      status: "information",
      sourceIds: [sourceId],
    },
  ];
}

function familyFiling(status: CurrentResidenceStatus): ResidenceFiling {
  switch (status) {
    case "destination-study-residence":
    case "destination-residence":
    case "other-eu-residence":
    case "destination-national-visa":
    case "visa-free-entry":
    case "temporary-protection":
      return "in-country";
    case "non-eu-passport-no-residence":
      return "abroad";
    default:
      return "unclear";
  }
}

export function buildSlovakiaFamilyRoute(profile: FamilyProfile): PurposeRoute<FamilyProfile> {
  const base = { version: FAMILY_ROUTE_VERSION, profile, sources: allSources, disclaimer: familyDisclaimer };
  const notCovered = (headline: string, stage: RouteStage): PurposeRoute<FamilyProfile> => ({
    ...base,
    applicable: false,
    filing: null,
    processingDays: null,
    headline,
    stages: [stage],
  });

  const gate = sharedGate(profile, "family");
  if (gate) return notCovered(gate.title + ".", gate);

  if (profile.sponsor === "slovak-citizen" || profile.sponsor === "eu-citizen") {
    return notCovered(
      "Family of Slovak and EU citizens: not verified yet.",
      infoStage(
        "eligibility",
        "ELIGIBILITY",
        "This family route is for relatives of non-EU residents",
        "The checked guidance grants family-reunification residence to relatives of people with Slovak temporary or permanent residence. Family members of Slovak or EU citizens use different procedures, which DocRoute has not verified.",
        [
          {
            id: "other-procedure",
            title: "Ask the Foreign Police which procedure applies",
            description:
              "Family members of EU citizens and of Slovak citizens have their own residence rules. Confirm the procedure and documents with the Foreign Police or IOM before preparing anything.",
            status: "attention",
            sourceIds: ["iom-family-reunification", "iom-eu-citizens"],
          },
        ],
      ),
    );
  }

  if (profile.relation === "partner") {
    return notCovered(
      "Unmarried partners are not in the checked guidance.",
      infoStage(
        "eligibility",
        "ELIGIBILITY",
        "Unmarried partners are not listed",
        "The checked guidance lists spouses, unmarried children and dependent parents. It does not mention unmarried partners.",
        [
          {
            id: "partner-not-listed",
            title: "Confirm before applying",
            description:
              "Ask the Foreign Police or IOM whether another residence purpose (work, study, business) fits you instead.",
            status: "attention",
            sourceIds: ["iom-family-reunification"],
          },
        ],
      ),
    );
  }

  if (profile.relation === "spouse" && profile.bothAdults === "no") {
    return notCovered(
      "Spouses must both be at least 18.",
      infoStage("eligibility", "ELIGIBILITY", "Both spouses must be at least 18", "A spouse qualifies only if both spouses have reached 18.", [
        {
          id: "spouse-age",
          title: "Not possible yet",
          description: "Family-reunification residence for a spouse requires both spouses to be at least 18.",
          status: "attention",
          sourceIds: ["iom-family-reunification"],
        },
      ]),
    );
  }

  const filing = familyFiling(profile.currentResidenceStatus);
  const processingDays = rules.processingDays;
  const minor = profile.relation === "child-minor";
  const relationDocs: RouteTask[] = [
    {
      id: "civil-status",
      title:
        profile.relation === "spouse"
          ? "Marriage certificate"
          : profile.relation === "parent-dependent"
            ? "Birth certificate of your child, proof you are single and dependent"
            : "Birth certificate and proof of status",
      description:
        profile.relation === "spouse"
          ? "The civil status document proving the marriage. It is exempt from the 90-day age limit, but still needs an apostille and translation."
          : profile.relation === "child-minor"
            ? "The child's birth certificate and an affidavit of the legal representative that the child is single."
            : profile.relation === "child-adult-dependent"
              ? "The birth certificate, proof the child is single, and a medical report showing they cannot look after themselves because of long-term poor health."
              : "Your child's birth certificate, a document showing you are single (e.g. a spouse's death certificate) and proof of dependence (e.g. a medical certificate), and that you have no suitable family support in your country.",
      status: "action",
      sourceIds: ["iom-family-reunification", "iom-purpose-documents-2026"],
    },
    {
      id: "sponsor-residence",
      title: "Proof of the family member's residence in Slovakia",
      description:
        "A copy of the residence card of the person you join. Your residence is granted for the validity of theirs, up to 5 years.",
      status: "action",
      sourceIds: ["iom-purpose-documents-2026", "iom-family-reunification"],
    },
  ];
  if (minor) {
    relationDocs.push({
      id: "other-parent-consent",
      title: "Consent of the other parent",
      description:
        "Written, notarised consent of the parent who does not have custody but has the right of contact. A parent (legal representative) submits the child's application.",
      status: "action",
      sourceIds: ["iom-family-reunification"],
    });
  }

  const workRights =
    profile.sponsor === "blue-card"
      ? "As a family member of a Blue Card holder you may work from the day the residence is granted."
      : `For the first ${rules.family.workPermitMonths} months you need a work permit to be employed; after that you can work like an EU citizen.`;

  return {
    ...base,
    applicable: true,
    filing,
    processingDays,
    headline: `Family-reunification residence, decided within ${processingDays} days${profile.sponsor === "blue-card" ? " (30 if filed together with the Blue Card)" : ""}.`,
    stages: [
      {
        id: "eligibility",
        number: "01",
        eyebrow: "ELIGIBILITY",
        title: "Check the family link",
        description:
          "Family-reunification residence is for relatives of a person with Slovak temporary or permanent residence. There is no legal entitlement to it.",
        timing: "Before collecting documents",
        tasks: [
          {
            id: "relation-check",
            title: familyRelationLabels[profile.relation],
            description:
              profile.relation === "spouse"
                ? "You qualify as a spouse because both of you are at least 18."
                : profile.relation === "child-minor"
                  ? "Unmarried children under 18 of the sponsor or the sponsor's spouse qualify."
                  : profile.relation === "child-adult-dependent"
                    ? "Unmarried adult children qualify only if long-term poor health means they cannot look after themselves."
                    : "Parents of the sponsor or the sponsor's spouse qualify if they depend on their care and have no suitable family support in their country.",
            status: profile.relation === "spouse" || minor ? "ready" : "attention",
            sourceIds: ["iom-family-reunification"],
          },
        ],
      },
      {
        id: "documents",
        number: "02",
        eyebrow: "DOCUMENTS",
        title: "Prepare the application documents",
        description: `Every document must be submitted, or the application is not accepted. Documents must be no older than ${rules.documentMaxAgeDays} days (except civil status documents).`,
        timing: "1–3 months before filing",
        tasks: documentsTasks(
          `The fee is €${rules.family.feeEur}${minor ? ", but not for children under 18" : ""}.`,
          relationDocs,
          "iom-family-reunification",
          "iom-family-reunification",
        ),
      },
      {
        id: "residence-application",
        number: "03",
        eyebrow: "APPLICATION",
        title: "File the family-reunification application",
        description: `The Foreign Police decide within ${processingDays} days.`,
        timing: "At least 90 days before you need the permit",
        tasks: [filingTask(filing, false)],
      },
      {
        id: "after-approval",
        number: "04",
        eyebrow: "AFTER APPROVAL",
        title: "Arrive, register and keep the permit valid",
        description: `Granted for the validity of your family member's residence, up to ${rules.family.maxYears} years, and renewable.`,
        timing: "After the decision",
        tasks: [
          ...afterApprovalTasks(true, "iom-family-reunification"),
          {
            id: "work-study-business",
            title: "Work, study and business",
            description: `${workRights} You may study and run a business without further permits, but you cannot switch to business residence until ${rules.family.noBusinessChangeMonths} months after the grant.`,
            status: "information",
            sourceIds: ["iom-family-work-rights", "iom-family-reunification"],
          },
          {
            id: "renewal",
            title: "Renew before it ends",
            description:
              "Apply to renew (or to change purpose or type) no later than the last day of your current residence.",
            status: "information",
            sourceIds: ["iom-family-reunification"],
          },
        ],
      },
    ],
  };
}

// A first business application is filed at an embassy; only a change of
// purpose from Slovak temporary residence is filed in Slovakia.
function businessFiling(status: CurrentResidenceStatus): ResidenceFiling {
  if (status === "destination-study-residence" || status === "destination-residence") return "in-country";
  if (status === "other") return "unclear";
  return "abroad";
}

export function buildSlovakiaBusinessRoute(profile: BusinessProfile): PurposeRoute<BusinessProfile> {
  const base = { version: BUSINESS_ROUTE_VERSION, profile, sources: allSources, disclaimer: businessDisclaimer };
  const gate = sharedGate(profile, "business");
  if (gate) {
    return { ...base, applicable: false, filing: null, processingDays: null, headline: gate.title + ".", stages: [gate] };
  }

  const b = rules.business;
  const soleTrader = profile.form === "trade-licence";
  const filing = businessFiling(profile.currentResidenceStatus);
  const studyHolder = profile.currentResidenceStatus === "destination-study-residence";
  const fee = filing === "in-country" ? b.feeEurPolice : b.feeEurEmbassy;

  const setupTasks: RouteTask[] = [
    soleTrader
      ? {
          id: "trade-licence",
          title: "Get the trade licence (živnostenské oprávnenie)",
          description:
            "Notify the trade office of your trade. The licence is valid across Slovakia; without residence that allows business you may start trading only from the day temporary residence is granted (or a later date you state).",
          status: "action",
          sourceIds: ["iom-trade-licence-basics", "iom-business-by-residence"],
        }
      : {
          id: "company-role",
          title: "Company registered with you as executive (konateľ)",
          description:
            "The residence is for the statutory body of a commercial company. Documents confirming the authorisation to do business are exempt from the 90-day age limit.",
          status: "action",
          sourceIds: ["iom-business-by-residence", "iom-purpose-documents-2026"],
        },
    {
      id: "business-plan",
      title: "Business plan with proof it is feasible",
      description:
        "Use the Ministry of Economy template (or its innovative start-up template) and attach documents showing the business is feasible and sustainable.",
      status: "action",
      sourceIds: ["iom-purpose-documents-2026"],
    },
  ];
  if (studyHolder) {
    setupTasks.unshift({
      id: "study-allows-business",
      title: "Your study residence already allows business",
      description:
        "With temporary residence for study you may run a business during the granted residence without a separate business permit. You need business residence only when study ends or you want business as your main purpose.",
      status: "information",
      sourceIds: ["iom-business-by-residence"],
    });
  }

  const fundsTask: RouteTask = {
    id: "financial-means",
    title: "Proof of financial means",
    description: `Personal funds of at least the subsistence minimum for each month of stay (€${b.subsistenceMinimumEur.toFixed(2)} a month; €${b.personalFundsOverOneYearEur.toLocaleString("en-GB", { minimumFractionDigits: 2 })} for more than a year), and on the business account ${soleTrader ? `€${b.soleTraderAccountEur.toLocaleString("en-GB", { minimumFractionDigits: 2 })} (20× the minimum) for a sole trader` : `€${b.executiveAccountEur.toLocaleString("en-GB")} (100× the minimum) for a company executive`}.`,
    status: "action",
    sourceIds: ["iom-temporary-residence-application"],
  };

  return {
    ...base,
    applicable: true,
    filing,
    processingDays: rules.processingDays,
    headline: `${businessFormLabels[profile.form]}: temporary residence for business, decided within ${rules.processingDays} days.`,
    stages: [
      {
        id: "setup",
        number: "01",
        eyebrow: "BUSINESS",
        title: soleTrader ? "Set up the trade" : "Set up the company role",
        description: `Business residence is granted for ${b.validityYears} years to a sole trader or a company executive.`,
        timing: "Before collecting residence documents",
        tasks: setupTasks,
      },
      {
        id: "documents",
        number: "02",
        eyebrow: "DOCUMENTS",
        title: "Prepare the application documents",
        description: `Documents must be no older than ${rules.documentMaxAgeDays} days when you file.`,
        timing: "1–3 months before filing",
        tasks: documentsTasks(
          `The fee is €${b.feeEurEmbassy} at an embassy or €${b.feeEurPolice} at the Foreign Police (you pay €${fee}).`,
          [fundsTask],
          "iom-temporary-residence-application",
          "iom-temporary-residence-application",
        ),
      },
      {
        id: "residence-application",
        number: "03",
        eyebrow: "APPLICATION",
        title: "File the business residence application",
        description: `Decided within ${rules.processingDays} days.`,
        timing: "At least 90 days before you need the permit",
        tasks: [filingTask(filing, true)],
      },
      {
        id: "after-approval",
        number: "04",
        eyebrow: "AFTER APPROVAL",
        title: "Arrive, register and keep the business compliant",
        description: `Granted for ${b.validityYears} years. You may also study without further permits.`,
        timing: "After the decision",
        tasks: [
          ...afterApprovalTasks(true, "iom-temporary-residence-application"),
          {
            id: "no-debts",
            title: "No tax, customs, social or health-insurance debts",
            description:
              "From 15 July 2026 the police may cancel business residence when these authorities report debts (arising from that date), and a renewal is refused if you have debts on the filing day.",
            status: "information",
            sourceIds: ["iom-amendment-2026-overview"],
          },
          {
            id: "renewal-income",
            title: "Renewal needs real business results",
            description: soleTrader
              ? `To renew, prove taxable business income above a threshold in the last tax period. IOM reads it as about half the non-taxable part: about €${b.soleTraderRenewalIncomeEur.toLocaleString("en-GB", { minimumFractionDigits: 2 })} for 2025 (IOM's reading, not an official figure).`
              : `To renew, prove the company paid tax at the required level; the minimum corporate tax is €${b.executiveMinimumTaxEur.min}–€${b.executiveMinimumTaxEur.max.toLocaleString("en-GB")} depending on its income.`,
            status: "information",
            sourceIds: ["iom-amendment-2026-overview"],
          },
        ],
      },
    ],
  };
}
