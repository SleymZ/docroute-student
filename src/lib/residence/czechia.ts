import { czechiaResidenceRules as rules, czechiaSources } from "@/data/czechia-residence";
import {
  czechWorkLabels,
  selectCzechWorkProcedure,
  type CzechProfile,
  type CzechWorkProcedure,
} from "@/lib/czechia-profile";
import { findResidenceStatusConflict, isEuEeaSwissCitizen } from "@/lib/profile-options";
import { addDays, formatPlanDate, type DeadlineItem, type DeadlineTone } from "@/lib/residence/deadlines";
import type { ResidenceFiling } from "@/lib/residence/slovakia";
import type { CurrentResidenceStatus } from "@/types/admission";
import type { RouteSource, RouteStage, RouteTask } from "@/types/route-preview";

// Czech residence routes for study (long-term residence permit for study)
// and work (employee card or EU Blue Card) for third-country citizens, plus
// EU registration and current-resident cases. Admission to a Czech
// university is not verified: the route only says which document the
// residence application needs from the school.

// Thousands separators by hand, so server and browser render the same.
function czk(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const CZECH_ROUTE_VERSION = "cz-2026-10-28";

export type CzechRoute = {
  version: string;
  profile: CzechProfile;
  // null when the third-country procedure does not apply.
  procedure: CzechWorkProcedure | "study" | "study-extension" | null;
  filing: ResidenceFiling | null;
  processingDays: number | null;
  stages: RouteStage[];
  sources: RouteSource[];
  disclaimer: string;
};

const disclaimer =
  "DocRoute is a preparation tool, not legal advice. The residence decision belongs to the Czech Ministry of the Interior. Czech university admission is not verified by DocRoute; check it on the university's own pages. Recheck each requirement before filing.";

export function czechFilingPlace(
  status: CurrentResidenceStatus,
): ResidenceFiling {
  switch (status) {
    case "non-eu-passport-no-residence":
      return "abroad";
    case "destination-study-residence":
    case "destination-residence":
    case "destination-national-visa":
      return "in-country";
    default:
      return "unclear";
  }
}

const formal: RouteTask = {
  id: "cz-formal",
  title: "Originals, Czech translations and apostille",
  description: `Bring originals or certified copies no older than ${rules.documentMaxAgeDays} days (passport, civil-status documents and photo excepted). Documents not in Czech or Slovak need a certified Czech translation; foreign official documents need an apostille or superlegalisation.`,
  status: "action",
  dueLabel: `No older than ${rules.documentMaxAgeDays} days when filed`,
  sourceIds: ["cz-ipc-formal", "cz-mzv-study"],
};

const formPassportPhoto: RouteTask = {
  id: "cz-form-passport",
  title: "Application form, passport and photo",
  description:
    "Fill in the form legibly in block capitals and Latin characters (in Czech when filing in Czechia), and bring a valid passport and one photo.",
  status: "action",
  sourceIds: ["cz-ipc-study-permit"],
};

const accommodation: RouteTask = {
  id: "cz-accommodation",
  title: "Proof of accommodation",
  description: "Bring proof of where you will live in Czechia, for example a dormitory confirmation or a rental agreement.",
  status: "action",
  sourceIds: ["cz-ipc-study-permit"],
};

function submissionTask(filing: ResidenceFiling, purpose: "study" | "work"): RouteTask {
  const sourceIds = purpose === "study" ? ["cz-mzv-study", "cz-ipc-study-permit"] : ["cz-ipc-employee-card"];
  switch (filing) {
    case "abroad":
      return {
        id: "cz-submission-place",
        title: "Apply in person at the Czech embassy",
        description:
          purpose === "study"
            ? "Book an appointment with the Czech embassy or consulate responsible for you; most schedule by e-mail or phone. Ask your university whether you can use the Student Facilitation programme (Režim Student)."
            : "Book an appointment with the Czech embassy or consulate responsible for you and apply in person.",
        status: "action",
        sourceIds,
      };
    case "in-country":
      return {
        id: "cz-submission-place",
        title: "Apply in person at a Ministry of the Interior office",
        description:
          "A new permit or a change of purpose is filed in person at a Ministry of the Interior office in Czechia, usually with an appointment. File while your current visa or permit is still valid.",
        status: "action",
        sourceIds,
      };
    case "unclear":
      return {
        id: "cz-submission-place",
        title: "Confirm where you are allowed to apply",
        description:
          purpose === "study"
            ? "Your status does not map safely to one filing place. Holders of a long-term study permit or visa from another EU country (except Ireland and Denmark) may apply in Czechia; otherwise confirm with the Ministry of the Interior or the embassy before booking."
            : "Your status does not map safely to one filing place. Confirm with the Ministry of the Interior or the Czech embassy before booking.",
        status: "attention",
        sourceIds,
      };
  }
}

function afterArrivalTasks(filing: ResidenceFiling): RouteTask[] {
  const registration: RouteTask =
    filing === "in-country"
      ? {
          id: "cz-register-arrival",
          title: "Book biometrics after a positive assessment",
          description:
            "After the Ministry assesses the application positively, book the biometric appointment by phone; the date is binding. Bring your passport.",
          status: "action",
          dueLabel: "After the positive assessment",
          sourceIds: ["cz-ipc-study-permit"],
        }
      : {
          id: "cz-register-arrival",
          title: "Register at the Ministry of the Interior after arrival",
          description: `With a D/VR visa, register at a Ministry of the Interior office within ${rules.registerWithVisaDays} days of arrival; biometrics are taken there. If you entered without a visa (biometric passport), register within ${rules.registerWithoutVisaDays} days.`,
          status: "action",
          dueLabel: `Within ${rules.registerWithVisaDays} days of arrival`,
          sourceIds: ["cz-ipc-study-permit", "cz-ipc-employee-card"],
        };

  return [
    registration,
    {
      id: "cz-collect-card",
      title: "Collect the residence card",
      description: `Collect the biometric residence card within ${rules.cardCollectionDays} days of having your biometric data taken.`,
      status: "action",
      dueLabel: `Within ${rules.cardCollectionDays} days of biometrics`,
      sourceIds: ["cz-ipc-study-permit"],
    },
  ];
}

const duties: RouteTask = {
  id: "cz-duties",
  title: "Report changes and renew in time",
  description: `Report a change of address within ${rules.addressChangeWorkingDays} working days and a change of name, civil status or passport data within ${rules.dataChangeWorkingDays} working days, at a Ministry of the Interior office. Apply for an extension from ${rules.extensionEarliestDays} days before expiry and no later than the last day of validity.`,
  status: "information",
  sourceIds: ["cz-ipc-obligations", "cz-ipc-study-permit"],
};

// ---------------------------------------------------------------- gates

function notApplicableStage(purpose: "study" | "work"): RouteStage {
  return {
    id: "residence",
    number: "01",
    eyebrow: "ARRIVAL STATUS",
    title: "No foreign residence permit route",
    description:
      purpose === "work"
        ? "You reported Czech citizenship, so you can work in Czechia without a residence permit."
        : "You reported Czech citizenship, so no student residence permit is needed.",
    timing: "Not applicable",
    tasks: [
      {
        id: "cz-citizen",
        title: "Residence permit not required",
        description: "Continue directly with your university or employer.",
        status: "not-applicable",
        sourceIds: [],
      },
    ],
  };
}

function conflictStage(message: string): RouteStage {
  return {
    id: "residence",
    number: "01",
    eyebrow: "RESIDENCE STATUS",
    title: "Check your citizenship and current status",
    description:
      "Your answers contain a citizenship and residence status that contradict each other, so DocRoute does not choose a residence route for you.",
    timing: "Update your answers",
    tasks: [
      {
        id: "residence-status-conflict",
        title: "Citizenship and residence status do not match",
        description: message,
        status: "attention",
        sourceIds: [],
      },
    ],
  };
}

function euStage(purpose: "study" | "work"): RouteStage {
  return {
    id: "residence",
    number: "01",
    eyebrow: "EU / EEA / SWISS REGISTRATION",
    title: "Register your stay as an EU, EEA or Swiss citizen",
    description:
      purpose === "work"
        ? "You do not need a residence permit or work permit: EU citizens have free access to the Czech labour market. You only report your stay."
        : "You do not need a residence permit. You report your stay and may ask for an optional registration certificate.",
    timing: `Report within ${rules.eu.registerWithinDays} days of entry`,
    tasks: [
      {
        id: "cz-eu-report-stay",
        title: "Report your stay to the Foreign Police",
        description: `If you will stay more than 30 days, report your arrival to the Foreign Police within ${rules.eu.registerWithinDays} days of entering, unless your accommodation provider (for example a hotel or hostel) reports it for you.`,
        status: "action",
        dueLabel: `Within ${rules.eu.registerWithinDays} days of entry`,
        sourceIds: ["cz-ipc-eu-obligations"],
      },
      {
        id: "cz-eu-certificate",
        title: "Optional registration certificate",
        description: `The registration certificate is not required for your stay. If you want one, apply at a Ministry of the Interior office (not from abroad) with the form, passport, proof of accommodation, a photo${purpose === "study" ? " and health insurance (required when studies are the purpose)" : ""}. The fee is CZK ${rules.eu.certificateFeeCzk}; it is valid ${rules.eu.certificateValidityYears} years.`,
        status: "information",
        sourceIds: ["cz-ipc-eu-certificate"],
      },
      {
        id: "cz-eu-address",
        title: "Report a change of address",
        description: `Report a new address within ${rules.eu.addressChangeWorkingDays} working days if you will live there for more than 180 days.`,
        status: "information",
        sourceIds: ["cz-ipc-eu-obligations"],
      },
    ],
  };
}

function permanentStage(purpose: "study" | "work"): RouteStage {
  return {
    id: "residence",
    number: "01",
    eyebrow: "RESIDENCE STATUS",
    title: "You already hold permanent residence",
    description:
      "Permanent residents have free access to the Czech labour market, so no new residence application is listed for you.",
    timing: "No new residence application listed",
    tasks: [
      purpose === "work"
        ? {
            id: "cz-permanent-purpose",
            title: "No employee card needed for the job",
            description:
              "With free access you only need your valid residence permit; no separate work authorisation is required for a specific job.",
            status: "information",
            sourceIds: ["cz-ipc-free-access"],
          }
        : {
            id: "cz-permanent-purpose",
            title: "Confirm with the university that no student permit is needed",
            description:
              "The checked guidance covers work but does not mention study separately, so ask the university's international office to confirm. Keep your residence card valid.",
            status: "attention",
            sourceIds: ["cz-ipc-free-access"],
          },
      {
        id: "cz-duties",
        title: "Report changes",
        description: `Report a change of address within ${rules.addressChangeWorkingDays} working days and a change of name, civil status or passport data within ${rules.dataChangeWorkingDays} working days.`,
        status: "information",
        sourceIds: ["cz-ipc-obligations"],
      },
    ],
  };
}

function gateStage(profile: CzechProfile): RouteStage | null {
  if (profile.citizenshipCountryCode === "CZ") return notApplicableStage(profile.purpose);
  const conflict = findResidenceStatusConflict(
    profile.citizenshipCountryCode,
    profile.currentResidenceStatus,
  );
  if (conflict) return conflictStage(conflict);
  if (isEuEeaSwissCitizen(profile.citizenshipCountryCode)) return euStage(profile.purpose);
  if (profile.currentResidenceStatus === "destination-permanent-residence") {
    return permanentStage(profile.purpose);
  }
  return null;
}

// ---------------------------------------------------------------- study

function studyStages(filing: ResidenceFiling, extension: boolean): RouteStage[] {
  const s = rules.study;
  const admission: RouteStage = {
    id: "admission",
    number: "01",
    eyebrow: "ADMISSION",
    title: "Get admitted and obtain the confirmation of studies",
    description:
      "The residence application needs the school's original confirmation of studies or enrolment. DocRoute has not verified Czech university programmes yet.",
    timing: "Before the residence application",
    tasks: [
      {
        id: "cz-confirmation-of-studies",
        title: "Original confirmation of studies",
        description:
          "Ask your Czech university or school for the original confirmation of studies or enrolment once you are admitted. Check admission rules and deadlines on the university's own pages.",
        status: "action",
        dueLabel: "After admission",
        sourceIds: ["cz-ipc-study-permit"],
      },
    ],
  };

  if (extension) {
    return [
      admission,
      {
        id: "residence-application",
        number: "02",
        eyebrow: "STUDENT RESIDENCE",
        title: "Extend your residence permit for study",
        description:
          "You already hold a Czech long-term residence permit for study. For the new studies you apply for an extension with the new confirmation of studies.",
        timing: `From ${rules.extensionEarliestDays} days before expiry · decided within 60 days`,
        tasks: [
          {
            id: "cz-extension-window",
            title: "File the extension in time",
            description: `Apply at the earliest ${rules.extensionEarliestDays} days before your permit expires and no later than its last day, in person, by post, by data box or by e-mail with a recognised electronic signature. Your stay stays legal while the application is decided; an extension for the same purpose is decided within 60 days.`,
            status: "action",
            dueLabel: "By the last day of validity",
            sourceIds: ["cz-ipc-study-permit", "cz-ipc-time-limits"],
          },
          {
            id: "cz-extension-school-change",
            title: "Ask whether the change of school must be reported",
            description:
              "The checked guidance says to keep to the purpose of your stay but does not say how a change of university is reported. Ask the Ministry of the Interior office before your current studies end.",
            status: "attention",
            sourceIds: ["cz-ipc-study-permit"],
          },
          {
            id: "cz-study-funds",
            title: "Proof of funds and comprehensive health insurance",
            description: `Extension documents largely repeat the first application: confirmation of studies, accommodation, funds (CZK ${czk(s.fundsYearCzk)} for a year as published) and comprehensive medical insurance.`,
            status: "action",
            sourceIds: ["cz-ipc-study-permit", "cz-ipc-funds"],
          },
          duties,
        ],
      },
    ];
  }

  const residenceTasks: RouteTask[] = [
    submissionTask(filing, "study"),
    formPassportPhoto,
    {
      id: "cz-study-funds",
      title: "Proof of funds",
      description: `15 times the subsistence minimum plus twice the subsistence minimum for each further month: CZK ${czk(s.fundsSemesterCzk)} for one semester or CZK ${czk(s.fundsYearCzk)} for a year, based on the CZK ${czk(s.subsistenceMinimumCzk)} subsistence minimum the portal publishes (half for applicants under 18). A bank statement in your name, an international payment card, a sponsor's or school's commitment or a scholarship can be used.`,
      status: "action",
      sourceIds: ["cz-ipc-funds"],
    },
    accommodation,
  ];
  if (filing !== "in-country") {
    residenceTasks.push({
      id: "cz-criminal-record",
      title: "Criminal-record document",
      description:
        "A criminal-record document from your citizenship country (not needed under 15). On request also from every country where you lived for six months in total during the last three years.",
      status: "action",
      dueLabel: `No older than ${rules.documentMaxAgeDays} days when filed`,
      sourceIds: ["cz-ipc-study-permit"],
    });
  }
  residenceTasks.push(
    formal,
    {
      id: "cz-insurance",
      title: "Health insurance",
      description:
        filing === "in-country"
          ? "Comprehensive medical insurance is part of the application."
          : "Before the visa is placed in your passport, show travel medical insurance for the first 90 days plus comprehensive insurance for the rest of the stay, or comprehensive insurance for the whole stay.",
      status: "action",
      sourceIds: ["cz-ipc-study-permit"],
    },
    {
      id: "cz-fee",
      title: `Fee CZK ${czk(s.feeCzk)}`,
      description:
        filing === "in-country"
          ? `Pay the CZK ${czk(s.feeCzk)} administrative fee by card or bank transfer at the Ministry office.`
          : `Pay the CZK ${czk(s.feeCzk)} consular fee at the embassy (some citizenships are exempt).`,
      status: "action",
      sourceIds: ["cz-ipc-study-permit"],
    },
  );

  return [
    admission,
    {
      id: "residence-application",
      number: "02",
      eyebrow: "STUDENT RESIDENCE",
      title: "Apply for a long-term residence permit for study",
      description:
        "For a stay longer than 90 days. A long-term visa for study exists too, but it is valid for at most one year; the permit is the usual choice for a full degree.",
      timing: `After the confirmation of studies · decided within ${s.processingDays} days`,
      tasks: residenceTasks,
    },
    {
      id: "after-arrival",
      number: "03",
      eyebrow: "AFTER APPROVAL",
      title: filing === "in-country" ? "Biometrics and residence card" : "Arrive, register and collect the card",
      description:
        filing === "in-country"
          ? "After a positive assessment you give biometrics and collect the card."
          : "After a positive assessment you collect a D/VR visa at the embassy (not needed if you can enter visa-free with a biometric passport), then register in Czechia.",
      timing: "After the decision",
      tasks: [
        ...afterArrivalTasks(filing),
        {
          id: "cz-student-work",
          title: "Work while studying",
          description:
            "Students in accredited university programmes have free access to the labour market, so you can work without an extra permit.",
          status: "information",
          sourceIds: ["cz-ipc-study-permit", "cz-ipc-free-access"],
        },
        duties,
      ],
    },
  ];
}

// ---------------------------------------------------------------- work

function workStages(
  profile: CzechProfile,
  procedure: CzechWorkProcedure,
  filing: ResidenceFiling,
  processingDays: number,
): RouteStage[] {
  const w = rules.work;
  const blueCard = procedure === "blue-card";
  const cardSource = blueCard ? "cz-ipc-blue-card" : "cz-ipc-employee-card";

  const jobTasks: RouteTask[] = [
    profile.jobOffer === "yes"
      ? {
          id: "cz-work-contract",
          title: "Work contract",
          description: blueCard
            ? "A work contract (or a preliminary contract) for a highly qualified job."
            : "A work contract, an agreement on performing work, or a preliminary contract.",
          status: "action",
          sourceIds: [cardSource],
        }
      : {
          id: "cz-work-contract",
          title: "Find an employer first",
          description:
            "The application is based on a specific job, so you need an employer and a contract (a preliminary contract is accepted) before you apply.",
          status: "attention",
          sourceIds: [cardSource],
        },
  ];

  if (procedure === "free-access") {
    jobTasks.push({
      id: "cz-free-access-proof",
      title: "Proof of free access to the labour market",
      description:
        "Graduates of Czech secondary schools, higher vocational schools, conservatories and universities have free access. Bring your Czech diploma; no vacancy number is needed.",
      status: "action",
      sourceIds: ["cz-ipc-free-access", "cz-ipc-employee-card"],
    });
  } else {
    jobTasks.push({
      id: "cz-vacancy-number",
      title: "Vacancy number from the Central Database of Vacancies",
      description: blueCard
        ? "Your employer registers the job in the database for Blue Card holders and gives you its number for the form."
        : "The job must be in the Central Database of Vacancies as open to employee card holders. Write its number on the form or bring a printout.",
      status: "action",
      sourceIds: [cardSource],
    });
  }

  if (blueCard) {
    jobTasks.push({
      id: "cz-blue-card-conditions",
      title: "Check the Blue Card conditions",
      description: `University or higher vocational education of at least three years (or higher professional skills) and a salary of at least ${w.blueCardSalaryMultiplier}× the average gross salary; the portal gives no CZK amount, so confirm it with your employer. The portal names both six months and one year as the minimum contract length; confirm it before applying.`,
      status: "attention",
      sourceIds: ["cz-ipc-blue-card"],
    });
  } else if (profile.blueCardConditions === "unsure") {
    jobTasks.push({
      id: "cz-blue-card-unsure",
      title: "You may qualify for an EU Blue Card",
      description: `With a university degree and a salary of at least ${w.blueCardSalaryMultiplier}× the average gross salary, ask your employer whether a Blue Card fits better.`,
      status: "information",
      sourceIds: ["cz-ipc-blue-card"],
    });
  }

  const fee =
    filing === "in-country"
      ? `an administrative fee of CZK ${czk(w.inCountryFeeCzk)}`
      : `a consular fee of CZK ${czk(w.consularFeeCzk)}`;

  const applicationTasks: RouteTask[] = [
    submissionTask(filing, "work"),
    {
      id: "cz-form-passport",
      title: "Application form, passport and photo",
      description: "Bring the completed form, a valid passport, one photo and proof of accommodation.",
      status: "action",
      sourceIds: [cardSource],
    },
  ];
  if (filing !== "in-country") {
    applicationTasks.push({
      id: "cz-criminal-record",
      title: "Criminal-record document",
      description:
        "A criminal-record document from your citizenship country. A medical report and records from other countries can be requested.",
      status: "action",
      dueLabel: `No older than ${rules.documentMaxAgeDays} days when filed`,
      sourceIds: [cardSource],
    });
  }
  applicationTasks.push(
    {
      id: "cz-qualification",
      title: blueCard ? "Certificate of qualifications" : "Qualification certificate if required",
      description: blueCard
        ? "Your diploma (or the employer's confirmation where allowed), plus documents for regulated professions if they apply."
        : "A diploma or certificate only if the employer, the job or the law requires it.",
      status: blueCard ? "action" : "information",
      sourceIds: [cardSource],
    },
    formal,
    {
      id: "cz-fee",
      title: "Pay the fee",
      description: `Pay ${fee} when you apply.`,
      status: "action",
      sourceIds: [cardSource],
    },
  );

  const afterTasks: RouteTask[] = [
    ...afterArrivalTasks(filing).map((task) => ({ ...task, sourceIds: [cardSource] })),
  ];
  if (procedure !== "free-access") {
    afterTasks.push({
      id: "cz-start-work",
      title: "Start work after the confirmation",
      description:
        "You may start work once the Confirmation of Compliance is issued. Keep medical insurance from entry until the employment starts.",
      status: "action",
      sourceIds: [cardSource],
    });
  }

  return [
    {
      id: "job",
      number: "01",
      eyebrow: "JOB OFFER",
      title: "Secure the job",
      description: "The residence application is tied to a specific job.",
      timing: profile.jobOffer === "yes" ? "Now" : "Before applying",
      tasks: jobTasks,
    },
    {
      id: "residence-application",
      number: "02",
      eyebrow: "RESIDENCE APPLICATION",
      title: blueCard ? "Apply for the EU Blue Card" : "Apply for the employee card",
      description: blueCard
        ? `Processing takes up to ${w.blueCardProcessingDays} days.`
        : `Processing takes up to ${w.employeeCardProcessingDays} days, or ${w.employeeCardComplexProcessingDays} days in complex cases or when the Labour Office gives a binding opinion.`,
      timing: `Decided within ${processingDays} days`,
      tasks: applicationTasks,
    },
    {
      id: "after-arrival",
      number: "03",
      eyebrow: "AFTER APPROVAL",
      title: "Register, give biometrics and start work",
      description: "After a positive assessment you collect a D/VR visa (if you need one), register in Czechia and collect the card.",
      timing: "After the decision",
      tasks: afterTasks,
    },
    {
      id: "duties",
      number: "04",
      eyebrow: "DUTIES",
      title: "Keep your status valid",
      description: "Duties while you work in Czechia.",
      timing: "While employed",
      tasks: [
        {
          id: "cz-employment-changes",
          title: blueCard ? "Report the end or change of employment" : "Report a change of employment",
          description: blueCard
            ? `Tell the Ministry of the Interior within ${w.endOfEmploymentReportWorkingDays} working days if your employment ends, and report a change of employer or position. A Blue Card is valid 3 months longer than the contract, for at most ${w.blueCardMaxYears} years.`
            : `Report a change of employment to the Ministry of the Interior. The employee card is valid for the contract term, for at most ${w.employeeCardMaxYears} years at a time; you may keep working in the same job while an extension is decided.`,
          status: "information",
          sourceIds: [cardSource, "cz-ipc-free-access"],
        },
        { ...duties, sourceIds: ["cz-ipc-obligations", cardSource] },
      ],
    },
  ];
}

// ---------------------------------------------------------------- route

export function buildCzechiaRoute(profile: CzechProfile): CzechRoute {
  const gate = gateStage(profile);
  if (gate) {
    return {
      version: CZECH_ROUTE_VERSION,
      profile,
      procedure: null,
      filing: null,
      processingDays: null,
      stages: [gate],
      sources: czechiaSources,
      disclaimer,
    };
  }

  const filing = czechFilingPlace(profile.currentResidenceStatus);

  if (profile.purpose === "study") {
    const extension = profile.currentResidenceStatus === "destination-study-residence";
    return {
      version: CZECH_ROUTE_VERSION,
      profile,
      procedure: extension ? "study-extension" : "study",
      filing,
      processingDays: rules.study.processingDays,
      stages: studyStages(filing, extension),
      sources: czechiaSources,
      disclaimer,
    };
  }

  const procedure = selectCzechWorkProcedure(profile);
  const processingDays =
    procedure === "blue-card"
      ? rules.work.blueCardProcessingDays
      : rules.work.employeeCardComplexProcessingDays;

  return {
    version: CZECH_ROUTE_VERSION,
    profile,
    procedure,
    filing,
    processingDays,
    stages: workStages(profile, procedure, filing, processingDays),
    sources: czechiaSources,
    disclaimer,
  };
}

export function czechProcedureLabel(route: CzechRoute) {
  switch (route.procedure) {
    case null:
      return null;
    case "study":
      return "Long-term residence permit for study";
    case "study-extension":
      return "Extension of your residence permit for study";
    default:
      return czechWorkLabels[route.procedure];
  }
}

// ---------------------------------------------------------------- planner

function toneFor(date: string, today: string, soonDays = 30): DeadlineTone {
  if (date < today) return "late";
  if (date <= addDays(today, soonDays)) return "soon";
  return "ok";
}

export type CzechDeadlinePlan = {
  moveDate: string;
  latestFilingDate: string;
  items: DeadlineItem[];
  warnings: string[];
};

// The move date is the day you need to be living (or working) in Czechia.
// Uses the maximum legal processing period; all periods are calendar days.
export function planCzechiaDeadlines(
  route: CzechRoute,
  moveDate: string,
  today: string,
): CzechDeadlinePlan | null {
  if (!route.filing || !route.processingDays || route.procedure === "study-extension") {
    return null;
  }
  if (moveDate <= today) return null;

  const latestFilingDate = addDays(moveDate, -route.processingDays);
  const documentsFrom = addDays(latestFilingDate, -rules.documentMaxAgeDays);
  const warnings: string[] = [];

  if (latestFilingDate < today) {
    warnings.push(
      `To have a decision by ${formatPlanDate(moveDate)}, you would have had to apply by ${formatPlanDate(latestFilingDate)}. The Ministry may decide sooner, but up to ${route.processingDays} days is allowed; consider a later date.`,
    );
  }
  if (route.filing === "unclear") {
    warnings.push(
      "Your status does not map to one filing place. Confirm where you may apply before relying on these dates.",
    );
  }
  if (route.filing === "in-country") {
    warnings.push("File while your current visa or permit is still valid, even if that is earlier than the date below.");
  }

  const items: DeadlineItem[] = [];
  if (route.filing !== "in-country") {
    items.push({
      id: "documents",
      taskId: "cz-criminal-record",
      title: "Request the criminal record and other documents",
      date: documentsFrom,
      dateLabel: `${formatPlanDate(documentsFrom)} – ${formatPlanDate(latestFilingDate)}`,
      detail: `Documents must be no older than ${rules.documentMaxAgeDays} days when you apply.`,
      tone: toneFor(latestFilingDate, today),
    });
  }
  items.push({
    id: "residence-filing",
    taskId: "cz-submission-place",
    title: route.filing === "abroad" ? "Apply at the Czech embassy" : "Apply for the residence permit",
    date: latestFilingDate,
    dateLabel: `By ${formatPlanDate(latestFilingDate)}`,
    detail: `The decision can take up to ${route.processingDays} days.`,
    tone: toneFor(latestFilingDate, today),
  });
  if (route.filing !== "in-country") {
    const registerBy = addDays(moveDate, rules.registerWithVisaDays);
    items.push({
      id: "register-arrival",
      taskId: "cz-register-arrival",
      title: "Register at the Ministry of the Interior",
      date: registerBy,
      dateLabel: `By ${formatPlanDate(registerBy)}`,
      detail: `Within ${rules.registerWithVisaDays} days of arriving with a D/VR visa (${rules.registerWithoutVisaDays} days without a visa).`,
      tone: "info",
    });
  }
  items.push({
    id: "collect-card",
    title: "Collect the residence card",
    dateLabel: `${rules.cardCollectionDays} days after biometrics`,
    detail: "Counts from the day your biometric data is taken.",
    tone: "info",
  });

  return { moveDate, latestFilingDate, items, warnings };
}
