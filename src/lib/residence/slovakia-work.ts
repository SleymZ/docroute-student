import { slovakiaResidentSources } from "@/data/slovakia-residents";
import { slovakiaWorkRules } from "@/data/slovakia-work";
import {
  residenceFilingPlace,
  residenceGateStage,
  type ResidenceFiling,
} from "@/lib/residence/slovakia";
import {
  selectWorkRoute,
  type WorkAuthorisationRoute,
  type WorkProfile,
} from "@/lib/work-profile";
import type { RouteSource, RouteStage, RouteTask } from "@/types/route-preview";

// Work route for third-country citizens in Slovakia: job offer → work
// authorisation (single permit, EU Blue Card or Slovak-graduate exemption)
// → residence application → duties after approval. Every period and amount
// comes from slovakiaWorkRules; nothing is borrowed from the study route.

const rules = slovakiaWorkRules;

export const WORK_ROUTE_VERSION = "sk-work-2026-10-23";

export type WorkRoute = {
  version: string;
  profile: WorkProfile;
  // null when the third-country procedure does not apply (Slovak, EU/EEA/
  // Swiss citizen or contradictory profile).
  authorisation: WorkAuthorisationRoute | null;
  filing: ResidenceFiling | null;
  processingDays: number | null;
  stages: RouteStage[];
  sources: RouteSource[];
  disclaimer: string;
};

export const workRouteLabels: Record<WorkAuthorisationRoute, string> = {
  "single-permit": "Single permit",
  "blue-card": "EU Blue Card",
  "slovak-graduate": "Slovak graduate",
};

export function workProcessingDays(profile: WorkProfile) {
  const route = selectWorkRoute(profile);
  if (route === "slovak-graduate") return rules.processingDays.slovakGraduate;
  if (route === "blue-card") return rules.processingDays.blueCard;
  return profile.shortageOccupation === "yes"
    ? rules.processingDays.singlePermitShortage
    : rules.processingDays.singlePermit;
}

const disclaimer =
  "DocRoute is a preparation tool, not legal advice. The residence decision belongs to the Foreign Police; the vacancy confirmation to the Labour Office. IOM guidance used here is not legally binding, so recheck each requirement before filing.";

function jobStage(profile: WorkProfile, route: WorkAuthorisationRoute): RouteStage {
  const offer = profile.jobOffer === "yes";
  const tasks: RouteTask[] = [
    offer
      ? {
          id: "job-offer",
          title:
            route === "slovak-graduate"
              ? "Agree the job with your employer"
              : "Employment contract or written promise of employment",
          description:
            route === "slovak-graduate"
              ? "Work for employment residence is normally done under an employment contract. Agree the position, workplace and start date with your employer."
              : "Your employer attaches a copy of the employment contract or a written promise of employment to the Labour Office request. Make sure the position, workplace and start date are final.",
          status: "action",
          sourceIds: ["iom-single-permit", "iom-employment-residence"],
        }
      : {
          id: "job-offer",
          title: "Find an employer in Slovakia first",
          description:
            "Residence for employment is granted for a specific employer, position and workplace, so every later step starts from a job offer. Residence for job seeking is not covered by DocRoute.",
          status: "attention",
          sourceIds: ["iom-employment-residence"],
        },
    {
      id: "employer-tied",
      title: "The permit is tied to this job",
      description:
        "Changing employer generally needs the Labour Office's prior approval. There is no legal entitlement to the residence, even with a job offer.",
      status: "information",
      sourceIds: ["iom-employment-residence"],
    },
  ];

  return {
    id: "job",
    number: "01",
    eyebrow: "JOB OFFER",
    title: offer ? "Confirm your job offer" : "Find a job offer",
    description: offer
      ? "The employer's paperwork starts the work route, so the job itself has to be settled first."
      : "You told us you do not have a job offer yet. The route below shows what follows once you do.",
    timing: offer ? "Before the employer applies" : "First step",
    tasks,
  };
}

function shortageNotice(profile: WorkProfile): string {
  switch (profile.shortageOccupation) {
    case "yes":
      return `For an occupation on the regional labour-shortage list, where the employer's share of third-country employees is below 45%, the labour market is not examined: the vacancy must be reported no later than the day the confirmation is requested. Otherwise the employer reports it at least ${rules.vacancyReportWorkingDays} working days before.`;
    case "unsure":
      return `Your employer reports the vacancy at least ${rules.vacancyReportWorkingDays} working days before requesting the confirmation. If the job is on the regional labour-shortage list and fewer than 45% of the employer's staff are third-country nationals, reporting by the day of the request is enough; ask your employer which applies.`;
    case "no":
      return `Your employer reports the vacancy to the Labour Office at least ${rules.vacancyReportWorkingDays} working days before requesting the confirmation. It can be done online.`;
  }
}

function authorisationStage(
  profile: WorkProfile,
  route: WorkAuthorisationRoute,
): RouteStage {
  if (route === "slovak-graduate") {
    return {
      id: "authorisation",
      number: "02",
      eyebrow: "WORK AUTHORISATION",
      title: "No work permit or vacancy confirmation",
      description:
        "Graduates of a Slovak secondary school or university can be employed without a work permit or a Labour Office vacancy confirmation.",
      timing: "Before filing",
      tasks: [
        {
          id: "employer-no-permit-confirmation",
          title: "Employer's confirmation that no permit is needed",
          description:
            "Ask your employer for a written confirmation that you will do work that needs neither a work permit nor a vacancy confirmation. It proves the purpose of residence.",
          status: "action",
          sourceIds: ["iom-purpose-documents", "iom-employment-residence"],
        },
        {
          id: "slovak-diploma-copy",
          title: "Notarised copy of your Slovak diploma",
          description:
            "Add a notarised copy of the Slovak school-leaving certificate or university diploma that makes you eligible for this exemption.",
          status: "action",
          sourceIds: ["iom-employment-residence"],
        },
      ],
    };
  }

  if (route === "blue-card") {
    return {
      id: "authorisation",
      number: "02",
      eyebrow: "WORK AUTHORISATION",
      title: "EU Blue Card: Labour Office confirmation",
      description:
        "The Blue Card is for highly qualified work. The Labour Office first confirms that the vacancy can be filled by a highly qualified worker.",
      timing: `File within ${rules.fileWithinDaysOfConfirmation} days of the confirmation`,
      tasks: [
        {
          id: "blue-card-conditions",
          title: "Check the Blue Card conditions with your employer",
          description: `You reported that you meet them: a university degree (or advanced professional skills, for ICT managers and specialists only), a salary of at least ${rules.blueCard.salaryMultiplier} times the Slovak average wage (the average wage itself if you graduated in the last three years) and a contract of at least ${rules.blueCard.minContractMonths} months. The guidance gives no current euro amount, so confirm the threshold with your employer.`,
          status: "action",
          sourceIds: ["iom-blue-card"],
        },
        {
          id: "blue-card-confirmation",
          title: "Employer reports the vacancy and requests confirmation",
          description:
            "The employer reports the vacancy no later than the day it asks the Labour Office for the confirmation. You do not need a separate document proving the purpose of residence.",
          status: "action",
          dueLabel: "Labour Office processing time is not published",
          sourceIds: ["iom-blue-card", "iom-vacancy-reporting", "iom-purpose-documents"],
        },
        {
          id: "confirmation-window",
          title: `File within ${rules.fileWithinDaysOfConfirmation} days of the confirmation`,
          description:
            "The residence application has to be submitted within this period after the Labour Office issues the confirmation.",
          status: "information",
          sourceIds: ["iom-blue-card"],
        },
      ],
    };
  }

  const tasks: RouteTask[] = [
    {
      id: "vacancy-report",
      title: "Employer reports the vacancy",
      description: shortageNotice(profile),
      status: "action",
      sourceIds: ["iom-single-permit", "iom-vacancy-reporting"],
    },
    {
      id: "labour-office-confirmation",
      title: "Employer requests the Labour Office confirmation",
      description:
        "The employer asks the Labour Office for confirmation that the vacancy can be filled, attaching your contract or written promise of employment and, for a regulated profession, the decisions recognising your education and qualifications. The Labour Office sends the confirmation directly to the Foreign Police or embassy.",
      status: "action",
      dueLabel: "Labour Office processing time is not published",
      sourceIds: ["iom-single-permit", "iom-purpose-documents"],
    },
    {
      id: "confirmation-window",
      title: `File within ${rules.fileWithinDaysOfConfirmation} days of the confirmation`,
      description:
        "Your residence application has to be submitted within this period after the confirmation is issued.",
      status: "information",
      sourceIds: ["iom-single-permit"],
    },
  ];

  if (profile.blueCardConditions === "unsure") {
    tasks.push({
      id: "blue-card-alternative",
      title: "You may qualify for an EU Blue Card instead",
      description: `With a university degree, a salary of at least ${rules.blueCard.salaryMultiplier} times the Slovak average wage and a contract of at least ${rules.blueCard.minContractMonths} months, the Blue Card is decided within ${rules.processingDays.blueCard} days and can last up to ${rules.maxYears.blueCard} years. Change your answer if you meet the conditions.`,
      status: "information",
      sourceIds: ["iom-blue-card"],
    });
  }

  return {
    id: "authorisation",
    number: "02",
    eyebrow: "WORK AUTHORISATION",
    title: "Single permit: Labour Office confirmation",
    description:
      "The single permit is residence for employment based on the Labour Office's confirmation that the vacancy can be filled. Your employer handles this part.",
    timing: `File within ${rules.fileWithinDaysOfConfirmation} days of the confirmation`,
    tasks,
  };
}

function submissionTask(filing: ResidenceFiling): RouteTask {
  const sourceIds = ["iom-employment-residence"];
  switch (filing) {
    case "in-country":
      return {
        id: "residence-submission-place",
        title: "File at the Foreign Police in Slovakia",
        description:
          "Your reported status is among those that allow applying in Slovakia. Book the appointment yourself in the Ministry of Interior's online system and attend in person; the status must still be valid on the filing day.",
        status: "action",
        sourceIds,
      };
    case "abroad":
      return {
        id: "residence-submission-place",
        title: "Apply in person at a Slovak embassy",
        description:
          "Apply at the Slovak diplomatic mission in your citizenship country or country of residence. An interview is usually part of the procedure.",
        status: "action",
        sourceIds,
      };
    case "unclear":
      return {
        id: "residence-submission-place",
        title: "Confirm where you are allowed to apply",
        description:
          "Your current status does not map safely to one filing place. Confirm with the Foreign Police or the Slovak embassy before booking.",
        status: "attention",
        sourceIds,
      };
  }
}

function applicationStage(
  profile: WorkProfile,
  route: WorkAuthorisationRoute,
  filing: ResidenceFiling,
  processingDays: number,
): RouteStage {
  const tasks: RouteTask[] = [
    submissionTask(filing),
    {
      id: "residence-form-passport",
      title: "Application form and valid passport",
      description:
        route === "slovak-graduate"
          ? "Fill in the official form in Slovak and bring your valid passport, the employer's confirmation and the diploma copy."
          : "Fill in the official form in Slovak and bring your valid passport. No separate purpose document is needed: the Labour Office confirmation goes to the authority directly.",
      status: "action",
      sourceIds: ["iom-employment-residence", "iom-purpose-documents"],
    },
    {
      id: "criminal-record",
      title: "Criminal-record documents",
      description:
        "A record from your citizenship country and from every country where you lived for more than 90 days in six consecutive months during the last three years.",
      status: "action",
      dueLabel: `No older than ${rules.documentMaxAgeDays} days when filed`,
      sourceIds: ["iom-employment-residence"],
    },
    {
      id: "accommodation",
      title: "Proof of accommodation",
      description: `Accommodation in Slovakia for at least ${rules.accommodationMinMonths} months, or for the whole stay if shorter, for example a notarised tenancy agreement or a hotel or dormitory confirmation. The accepted forms changed with the July 2026 amendment (electronic consent is now possible), so recheck before filing.`,
      status: "action",
      dueLabel: `No older than ${rules.documentMaxAgeDays} days when filed`,
      sourceIds: ["iom-employment-residence", "iom-residence-amendment-2026"],
    },
    {
      id: "authentication-translation",
      title: "Authenticate and translate foreign documents",
      description:
        "Foreign public documents need an apostille or consular legalisation, and an official translation into Slovak (or Czech). A translation made abroad must be confirmed by a Slovak embassy, unless it was made in the Czech Republic. Copies must be notarised.",
      status: "action",
      dueLabel: "Before the appointment",
      sourceIds: ["iom-employment-residence"],
    },
    {
      id: "residence-fees",
      title: "Application fee and residence card",
      description: `The application fee is €${rules.applicationFeeEur}. The residence card costs €${rules.residenceCardFeesEur.standard} (delivery within 30 days) or €${rules.residenceCardFeesEur.expedited} (within 2 working days).`,
      status: "action",
      sourceIds: [route === "blue-card" ? "iom-blue-card" : "iom-employment-residence"],
    },
  ];

  if (route === "single-permit") {
    tasks.push({
      id: "missing-documents",
      title: `Missing documents: ${rules.missingDocumentsDays} days`,
      description: `If something is missing, it must be supplied within ${rules.missingDocumentsDays} days of filing (the Foreign Police can extend this by ${rules.missingDocumentsDays} more days on request); otherwise the procedure stops.`,
      status: "information",
      sourceIds: ["iom-employment-residence", "iom-residence-amendment-2026"],
    });
  }

  if (route !== "slovak-graduate") {
    tasks.push({
      id: "start-work",
      title: "You can start work after filing a complete application",
      description:
        "Once a complete application is submitted, you may start work while the decision is pending.",
      status: "information",
      sourceIds: [route === "blue-card" ? "iom-blue-card" : "iom-employment-residence"],
    });
  }

  return {
    id: "residence-application",
    number: "03",
    eyebrow: "RESIDENCE APPLICATION",
    title: "Apply for temporary residence for employment",
    description:
      route === "slovak-graduate"
        ? "You apply in person with the employer's confirmation; there is no Labour Office step."
        : "You apply in person after the Labour Office confirmation is issued.",
    timing: `Decision within up to ${processingDays} days`,
    tasks,
  };
}

function afterApprovalStage(route: WorkAuthorisationRoute): RouteStage {
  const protection =
    route === "single-permit"
      ? "If the job ends, you must start a new one within 3 months (6 months after more than two years on a confirmation-based permit), or as soon as a new confirmation is issued if the employer applied within that time. The period is 3 months longer if the Foreign Police find exploitative conditions."
      : route === "slovak-graduate"
        ? "If the job ends, the residence cannot be cancelled for that reason within 60 days of the end of employment."
        : "The checked Blue Card guidance does not describe what happens after a job ends; confirm with the Foreign Police.";

  const maxYears =
    route === "single-permit"
      ? `A single permit is granted for up to ${rules.maxYears.singlePermit} years.`
      : route === "blue-card"
        ? `A Blue Card is granted for up to ${rules.maxYears.blueCard} years (if the Labour Office confirmation is shorter, for that period plus 90 days).`
        : `Residence is granted for the expected length of employment, up to ${rules.maxYears.slovakGraduate} years.`;

  return {
    id: "after-approval",
    number: "04",
    eyebrow: "AFTER APPROVAL",
    title: "Arrive, register and keep the permit valid",
    description: maxYears,
    timing: "After the decision",
    tasks: [
      {
        id: "post-card-duties",
        title: "Arrival and card duties",
        description: `Enter Slovakia within ${rules.entryWithinDaysOfApproval} days of approval and report the start of your stay to the Foreign Police within ${rules.reportArrivalWorkingDays} working days. Take out health insurance within ${rules.healthInsuranceWorkingDays} working days of receiving the card, and submit a medical report (no older than ${rules.medicalReportDays} days) within ${rules.medicalReportDays} days of receiving it.`,
        status: "action",
        dueLabel: "Immediately after arrival and card collection",
        sourceIds: [route === "blue-card" ? "iom-blue-card" : "iom-employment-residence"],
      },
      {
        id: "unemployment-rules",
        title: "If you lose or change the job",
        description: `Report the start and end of any unemployment to the Foreign Police within ${rules.unemploymentNoticeWorkingDays} working days. ${protection}`,
        status: "information",
        sourceIds: ["iom-employment-residence", "iom-residence-amendment-2026"],
      },
      {
        id: "stay-conditions",
        title: "Keep living mainly in Slovakia",
        description:
          "Stay in Slovakia for more than half of the residence period in each calendar year, and tell the Foreign Police in writing before a continuous absence of more than 180 days.",
        status: "information",
        sourceIds: ["iom-employment-residence"],
      },
    ],
  };
}

export function buildSlovakiaWorkRoute(profile: WorkProfile): WorkRoute {
  const sources = [...rules.sources, ...slovakiaResidentSources];
  const gate = residenceGateStage(profile, { purpose: "work", stageNumber: "01" });

  if (gate) {
    return {
      version: WORK_ROUTE_VERSION,
      profile,
      authorisation: null,
      filing: null,
      processingDays: null,
      stages: [gate],
      sources,
      disclaimer,
    };
  }

  const route = selectWorkRoute(profile);
  const filing = residenceFilingPlace(profile.currentResidenceStatus);
  const processingDays = workProcessingDays(profile);

  return {
    version: WORK_ROUTE_VERSION,
    profile,
    authorisation: route,
    filing,
    processingDays,
    stages: [
      jobStage(profile, route),
      authorisationStage(profile, route),
      applicationStage(profile, route, filing, processingDays),
      afterApprovalStage(route),
    ],
    sources,
    disclaimer,
  };
}
