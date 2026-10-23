import { slovakiaResidenceRules } from "@/data/slovakia-residence";
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
// Study is the only verified purpose. Work, family or business are added
// here as new purpose definitions once their official rules are checked.

export type ResidenceFiling = "abroad" | "in-country" | "unclear";

const rules = slovakiaResidenceRules;

export function residenceFilingPlace(
  status: CurrentResidenceStatus,
): ResidenceFiling {
  switch (status) {
    case "destination-residence":
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

// Cases that do not use the third-country procedure, or where the profile
// is contradictory. Returns null when the third-country route applies.
function gateStage(profile: ApplicantProfile): RouteStage | null {
  if (profile.citizenshipCountryCode === "SK") {
    return {
      id: "residence",
      number: "04",
      eyebrow: "ARRIVAL STATUS",
      title: "No foreign residence permit route",
      description:
        "You reported Slovak citizenship, so the third-country student residence route does not apply.",
      timing: "Not applicable",
      tasks: [
        {
          id: "slovak-citizen-residence",
          title: "Student residence permit not required",
          description:
            "Continue with university enrolment and the ordinary arrival checklist.",
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
      number: "04",
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
    return {
      id: "residence",
      number: "04",
      eyebrow: "EU / EEA / SWISS MOBILITY",
      title: "EU, EEA or Swiss citizen registration route",
      description:
        "The third-country temporary residence procedure does not apply. The EU, EEA and Swiss registration route has not yet been verified in this first data release.",
      timing: "Verification pending",
      tasks: [
        {
          id: "eu-route-pending",
          title: "Current rules still need source verification",
          description:
            "DocRoute will not reuse the non-EU checklist for an EU, EEA or Swiss citizen. Until this route is verified, confirm registration duties with the Slovak authorities.",
          status: "attention",
          sourceIds: ["sk-act-404-2011"],
        },
      ],
    };
  }

  return null;
}

// True when the third-country temporary residence procedure applies.
export function usesThirdCountryResidence(profile: ApplicantProfile) {
  return gateStage(profile) === null;
}

export function buildSlovakiaResidenceStage(
  profile: ApplicantProfile,
  purpose: ResidencePurpose = studyPurpose,
): RouteStage {
  const gate = gateStage(profile);
  if (gate) return gate;

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
