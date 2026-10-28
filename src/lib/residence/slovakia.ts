import { slovakiaResidenceRules } from "@/data/slovakia-residence";
import {
  slovakiaEuRegistrationRules as euRules,
  slovakiaResidentRules as residentRules,
} from "@/data/slovakia-residents";
import {
  findResidenceStatusConflict,
  isEuEeaSwissCitizen,
} from "@/lib/profile-options";
import type {
  ApplicantProfile,
  CurrentResidenceStatus,
} from "@/types/admission";
import type { RouteStage, RouteTask } from "@/types/route-preview";

// Slovak temporary residence is built from two parts:
// - steps shared by every purpose (where to file, passport, criminal
//   records, apostille and translation, card fee, duties after approval);
// - a purpose definition (proof of purpose and purpose-specific notices).
// Study is the purpose defined here (work has its own builder). Family or business are added
// here as new purpose definitions once their official rules are checked.

export type ResidenceFiling = "abroad" | "in-country" | "unclear";

const rules = slovakiaResidenceRules;

export function residenceFilingPlace(
  status: CurrentResidenceStatus,
): ResidenceFiling {
  switch (status) {
    case "destination-study-residence":
    case "destination-residence":
    case "destination-permanent-residence":
    case "other-eu-residence":
    case "destination-national-visa":
    case "visa-free-entry":
    case "temporary-protection":
      return "in-country";
    case "non-eu-passport-no-residence":
      return "abroad";
    // Third-country citizens only reach this point; an EU, EEA or Swiss
    // passport status for them is a contradiction handled earlier.
    case "eu-eea-swiss-passport":
    case "other":
      return "unclear";
  }
}

type ResidencePurpose = {
  eyebrow: string;
  title: string;
  description: string;
  proofTask: RouteTask;
  noticesBeforeFees: RouteTask[];
  noticesAfter: RouteTask[];
};

export const studyPurpose: ResidencePurpose = {
  eyebrow: "STUDENT RESIDENCE",
  title: "Apply for temporary residence for study",
  description:
    "This stage begins only after the university issues an admission document that proves the purpose of residence.",
  proofTask: {
    id: "residence-purpose",
    title: "University admission document",
    description:
      "Use the university's confirmation of admission as proof of the purpose of residence.",
    status: "action",
    dueLabel: "Available only after admission",
    sourceIds: ["iom-study-residence"],
  },
  noticesBeforeFees: [
    {
      id: "university-accommodation-exemption",
      title: "Accommodation evidence: current student exemption",
      description:
        "Current guidance lists university-study applicants among those who do not submit accommodation confirmation with this application. Recheck immediately before filing because residence rules can change.",
      status: "information",
      sourceIds: ["iom-study-residence-application"],
    },
  ],
  noticesAfter: [
    {
      id: "student-residence-limits",
      title: "Length of residence and work while studying",
      description: `Residence for study can be granted for the expected length of studies, up to ${rules.maxInitialYears} years at first. University students may work up to ${rules.universityStudentWorkHoursPerMonth} hours per month without changing the purpose of residence.`,
      status: "information",
      sourceIds: ["iom-study-residence"],
    },
  ],
};

function submissionTask(filing: ResidenceFiling): RouteTask {
  const sourceIds = ["iom-study-residence-application"];

  switch (filing) {
    case "in-country":
      return {
        id: "residence-submission-place",
        title: "Prepare to file at the Foreign Police in Slovakia",
        description:
          "Your reported status is among the situations that may allow an in-country application. The Foreign Police must confirm that the status is valid on the submission date.",
        status: "action",
        dueLabel: "After receiving the admission letter",
        sourceIds,
      };
    case "abroad":
      return {
        id: "residence-submission-place",
        title: "Plan an in-person embassy application",
        description:
          "The usual route is the Slovak diplomatic mission accredited for your citizenship country or country of residence. An interview is part of the preliminary assessment.",
        status: "action",
        dueLabel: "After receiving the admission letter",
        sourceIds,
      };
    case "unclear":
      return {
        id: "residence-submission-place",
        title: "Confirm where you are allowed to apply",
        description:
          "Your current immigration status does not map safely to one published submission route. Confirm it with the Foreign Police or the Slovak embassy before booking.",
        status: "attention",
        sourceIds,
      };
  }
}

const commonSources = ["sk-act-404-2011", "iom-study-residence-application"];

const sharedSteps = {
  formAndPassport: {
    id: "residence-form-passport",
    title: "Application form and valid passport",
    description:
      "Prepare the official temporary-residence form and your valid travel document for the in-person application.",
    status: "action",
    sourceIds: commonSources,
  },
  criminalRecord: {
    id: "criminal-record",
    title: "Criminal-record documents",
    description:
      "Prepare a record from your citizenship country and from every country where you lived for more than 90 days during six consecutive months in the last three years. A record is not needed from an EU member state that shares conviction data with Slovakia.",
    status: "action",
    dueLabel: "No older than 90 days when filed",
    sourceIds: ["iom-study-residence-application", "iom-study-residence"],
  },
  authenticationTranslation: {
    id: "authentication-translation",
    title: "Authenticate and translate foreign documents",
    description:
      "Foreign official documents need an apostille, or consular superlegalisation where neither the Apostille Convention nor a legal-assistance treaty applies. Add an official Slovak or Czech translation; a translation made abroad must be confirmed by a Slovak embassy or consulate (not needed for translations made in the Czech Republic).",
    status: "action",
    dueLabel: "Before the residence appointment",
    sourceIds: ["iom-study-residence-application"],
  },
  cardFee: {
    id: "residence-card-fee",
    title: "Choose residence-card delivery speed",
    description: `Current guidance lists €${rules.residenceCardFeesEur.standard} for delivery within 30 days or €${rules.residenceCardFeesEur.expedited} within two business days. No separate application fee is listed for study.`,
    status: "action",
    sourceIds: ["iom-study-residence-application"],
  },
  afterApproval: {
    id: "post-card-duties",
    title: "Complete post-approval duties",
    description:
      "If applying abroad, enter Slovakia within 180 days of approval and report the start of residence to the Foreign Police within 3 working days of arrival. Take out health insurance within 3 working days of collecting the card (students do not have to submit the proof). Within 30 days of collecting the card, submit a medical report no older than 30 days; students are not exempt.",
    status: "action",
    dueLabel: "Immediately after approval and card collection",
    sourceIds: ["iom-study-residence-application"],
  },
} satisfies Record<string, RouteTask>;

export type ResidenceGateProfile = Pick<
  ApplicantProfile,
  "citizenshipCountryCode" | "currentResidenceStatus"
>;

type GateOptions = {
  purpose: "study" | "work";
  stageNumber: string;
};

// Cases that do not use the third-country procedure, or where the profile
// is contradictory. Returns null when the third-country route applies.
export function residenceGateStage(
  profile: ResidenceGateProfile,
  { purpose, stageNumber }: GateOptions = { purpose: "study", stageNumber: "04" },
): RouteStage | null {
  if (profile.citizenshipCountryCode === "SK") {
    return {
      id: "residence",
      number: stageNumber,
      eyebrow: "ARRIVAL STATUS",
      title: "No foreign residence permit route",
      description:
        purpose === "work"
          ? "You reported Slovak citizenship, so you can work in Slovakia without a residence permit for employment."
          : "You reported Slovak citizenship, so the third-country student residence route does not apply.",
      timing: "Not applicable",
      tasks: [
        {
          id: "slovak-citizen-residence",
          title:
            purpose === "work"
              ? "Work residence permit not required"
              : "Student residence permit not required",
          description:
            purpose === "work"
              ? "Agree the employment directly with your employer."
              : "Continue with university enrolment and the ordinary arrival checklist.",
          status: "not-applicable",
          sourceIds: [],
        },
      ],
    };
  }

  const statusConflict = findResidenceStatusConflict(
    profile.citizenshipCountryCode,
    profile.currentResidenceStatus,
  );

  if (statusConflict) {
    return {
      id: "residence",
      number: stageNumber,
      eyebrow: "RESIDENCE STATUS",
      title: "Check your citizenship and current status",
      description:
        "Your profile contains a citizenship and residence status that contradict each other, so DocRoute does not choose a residence route for you.",
      timing: "Update your profile",
      tasks: [
        {
          id: "residence-status-conflict",
          title: "Citizenship and residence status do not match",
          description: statusConflict,
          status: "attention",
          sourceIds: [],
        },
      ],
    };
  }

  if (isEuEeaSwissCitizen(profile.citizenshipCountryCode)) {
    return euRegistrationStage(purpose, stageNumber);
  }

  if (profile.currentResidenceStatus === "destination-permanent-residence") {
    return permanentResidentStage(purpose, stageNumber);
  }

  if (
    purpose === "study" &&
    profile.currentResidenceStatus === "destination-study-residence"
  ) {
    return currentStudentStage(stageNumber);
  }

  return null;
}

// EU, EEA and Swiss citizens register their residence; they never get the
// third-country checklist.
function euRegistrationStage(
  purpose: GateOptions["purpose"],
  stageNumber: string,
): RouteStage {
  const sourceIds = ["iom-eu-citizens"];
  const purposeDocument =
    purpose === "work"
      ? "your employment contract"
      : "the university's confirmation of study";

  return {
    id: "residence",
    number: stageNumber,
    eyebrow: "EU / EEA / SWISS REGISTRATION",
    title: "Register your residence as an EU, EEA or Swiss citizen",
    description:
      "You do not need a residence permit. You report where you stay and, for a stay longer than three months, register your residence with the Foreign Police.",
    timing: `Report within ${euRules.noticeOfStayWorkingDays} working days of entry · register within ${euRules.registrationAfterMonths} months + ${euRules.registrationWithinDays} days`,
    tasks: [
      {
        id: "eu-notice-of-stay",
        title: "Report the start and place of your stay",
        description: `Within ${euRules.noticeOfStayWorkingDays} working days of entering Slovakia, report where you stay on the Notice of Stay form, unless your accommodation provider (for example a dormitory or hotel) reports it for you.`,
        status: "action",
        dueLabel: `Within ${euRules.noticeOfStayWorkingDays} working days of entry`,
        sourceIds,
      },
      {
        id: "eu-registration",
        title: "Register your residence at the Foreign Police",
        description: `If you stay longer than three months, register in person at any Foreign Police department within ${euRules.registrationWithinDays} days after the first ${euRules.registrationAfterMonths} months from entry. Book an appointment. Registration is free; you receive a confirmation of residence registration.`,
        status: "action",
        dueLabel: `Within ${euRules.registrationWithinDays} days after ${euRules.registrationAfterMonths} months from entry`,
        sourceIds,
      },
      {
        id: "eu-registration-documents",
        title: "Documents for registration",
        description: `Bring a valid ID card or passport and ${purposeDocument} as proof of the reason for your stay. Proof of sufficient funds and health insurance is the alternative when you have no school, employment or business document (the subsistence minimum is €${euRules.subsistenceMinimumEur} from July 2026).`,
        status: "action",
        dueLabel: "At the registration appointment",
        sourceIds,
      },
      {
        id: "eu-residence-card",
        title: "Optional residence card",
        description: `You may also apply for a residence card valid for ${euRules.residenceCardValidityYears} years: €${euRules.residenceCardFeesEur.standard} for delivery within 30 days or €${euRules.residenceCardFeesEur.expedited} within two business days. Proof of accommodation can be a notarised owner affidavit, electronic consent, a notarised tenancy agreement or a confirmation from a hotel or dormitory.`,
        status: "information",
        sourceIds,
      },
      {
        id: "eu-after-registration",
        title: "Duties after registration",
        description: `Report a change of name, marital status, nationality or document data, and a lost or damaged document, within ${euRules.changeReportWorkingDays} working days. Tell the authorities in writing when you end your residence. After ${euRules.permanentResidenceAfterYears} years of uninterrupted legal residence you can get permanent residence.`,
        status: "information",
        sourceIds,
      },
    ],
  };
}

function permanentResidentStage(
  purpose: GateOptions["purpose"],
  stageNumber: string,
): RouteStage {
  const sourceIds = ["iom-permanent-residence"];

  return {
    id: "residence",
    number: stageNumber,
    eyebrow: "RESIDENCE STATUS",
    title: "You already hold permanent residence",
    description:
      "Guidance says permanent and long-term residents have the same rights and duties as Slovak citizens in most areas of life, including employment. No new residence application is listed for you.",
    timing: "No new residence application listed",
    tasks: [
      purpose === "work"
        ? {
            id: "permanent-resident-purpose",
            title: "Work residence permit not listed for you",
            description:
              "Employment is named among the rights of permanent residents. Agree the employment directly with your employer and keep your residence card valid.",
            status: "information",
            sourceIds,
          }
        : {
            id: "permanent-resident-purpose",
            title: "Confirm with the university that no student permit is needed",
            description:
              "The guidance does not mention study separately, so ask the university's international office to confirm that your permanent residence is enough. Keep your residence card valid.",
            status: "attention",
            sourceIds,
          },
      {
        id: "resident-address-change",
        title: "Report a change of address",
        description: `If you move for your studies or job, report the new address to the Foreign Police within ${residentRules.addressChangeReportWorkingDays} working days.`,
        status: "information",
        sourceIds: ["iom-reporting-duties"],
      },
    ],
  };
}

// The person already holds Slovak temporary residence for study and starts
// new studies: no first application, but the change must be reported.
function currentStudentStage(stageNumber: string): RouteStage {
  return {
    id: "residence",
    number: stageNumber,
    eyebrow: "STUDENT RESIDENCE",
    title: "Keep your residence for study valid for the new studies",
    description:
      "You already hold temporary residence for study, so you do not apply for a first permit. Tell the Foreign Police about the new university and keep the permit valid while you study.",
    timing: "After admission · before your permit expires",
    tasks: [
      {
        id: "resident-report-school-change",
        title: "Report the new university or programme",
        description:
          "Guidance says a move to another programme or university in Slovakia usually has to be reported to the Foreign Police. No deadline is published, so ask when you report, and bring the university's admission document.",
        status: "action",
        dueLabel: "After receiving the admission letter",
        sourceIds: ["iom-study-residence"],
      },
      {
        id: "resident-study-gap",
        title: "Check the gap between your current and new studies",
        description: `If your current studies end before the new ones start, the purpose of your residence may end. The Foreign Police must be told within ${residentRules.purposeEndReportWorkingDays} working days when the purpose ends. Ask them how a gap affects your permit before your current studies end.`,
        status: "attention",
        sourceIds: ["iom-reporting-duties", "iom-study-residence"],
      },
      {
        id: "resident-renewal",
        title: "Renew before the permit expires",
        description:
          "If your permit ends before the new studies do, file the renewal at the Foreign Police no later than the last day of its validity. Renewal for study requires that you continue studying in Slovakia.",
        status: "action",
        dueLabel: "By the last day of validity",
        sourceIds: ["iom-study-residence"],
      },
      ...studyPurpose.noticesAfter,
    ],
  };
}

// True when the third-country temporary residence procedure applies.
export function usesThirdCountryResidence(profile: ResidenceGateProfile) {
  return residenceGateStage(profile) === null;
}

// A third-country citizen with Slovak temporary residence for another
// purpose (work, family...) applies for a change of purpose to study.
export function isChangeOfPurpose(profile: ResidenceGateProfile) {
  return (
    profile.currentResidenceStatus === "destination-residence" &&
    usesThirdCountryResidence(profile)
  );
}

function changeOfPurposeStage(purpose: ResidencePurpose): RouteStage {
  const sourceIds = ["iom-change-of-purpose"];

  return {
    id: "residence",
    number: "04",
    eyebrow: purpose.eyebrow,
    title: "Change the purpose of your residence to study",
    description:
      "Your temporary residence was granted for another purpose, and a permit allows only what its purpose covers. A change of purpose is a new application for temporary residence for study.",
    timing: `File by the last day of your current permit · decision within up to ${rules.processingTimeDays} days`,
    tasks: [
      {
        id: "change-of-purpose-check",
        title: "Ask whether your current purpose already allows study",
        description:
          "The guidance does not say which other purposes allow university study. Ask the Foreign Police before you apply; if a change is needed, follow the steps below.",
        status: "attention",
        sourceIds,
      },
      {
        id: "residence-submission-place",
        title: "File the change of purpose at the Foreign Police",
        description:
          "File no later than the last day of your current permit. While the new application is decided, your stay is authorised in Slovakia only.",
        status: "action",
        dueLabel: "After admission, before your permit expires",
        sourceIds,
      },
      sharedSteps.formAndPassport,
      purpose.proofTask,
      {
        id: "change-of-purpose-documents",
        title: "Documents you do not submit again",
        description:
          "You do not submit a criminal-record certificate if you already gave one with your previous application, and the medical report is not required with this application.",
        status: "information",
        sourceIds,
      },
      sharedSteps.authenticationTranslation,
      ...purpose.noticesBeforeFees,
      sharedSteps.cardFee,
      {
        id: "post-card-duties",
        title: "Take out health insurance after approval",
        description: `Take out health insurance within ${residentRules.healthInsuranceWorkingDays} working days of collecting the new residence card.`,
        status: "action",
        dueLabel: "After card collection",
        sourceIds: ["iom-reporting-duties"],
      },
      ...purpose.noticesAfter,
    ],
  };
}

export function buildSlovakiaResidenceStage(
  profile: ApplicantProfile,
  purpose: ResidencePurpose = studyPurpose,
): RouteStage {
  const gate = residenceGateStage(profile);
  if (gate) return gate;

  if (isChangeOfPurpose(profile)) return changeOfPurposeStage(purpose);

  return {
    id: "residence",
    number: "04",
    eyebrow: purpose.eyebrow,
    title: purpose.title,
    description: purpose.description,
    timing: `Start after admission · decision within up to ${rules.processingTimeDays} days`,
    tasks: [
      submissionTask(residenceFilingPlace(profile.currentResidenceStatus)),
      sharedSteps.formAndPassport,
      purpose.proofTask,
      sharedSteps.criminalRecord,
      sharedSteps.authenticationTranslation,
      ...purpose.noticesBeforeFees,
      sharedSteps.cardFee,
      sharedSteps.afterApproval,
      ...purpose.noticesAfter,
    ],
  };
}
