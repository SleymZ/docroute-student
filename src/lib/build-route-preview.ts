import {
  euCountryCodes,
  slovakiaResidenceRules,
} from "@/data/slovakia-residence";
import type {
  ApplicantProfile,
  ProgramMatch,
} from "@/types/admission";
import type {
  RoutePreview,
  RouteStage,
  RouteTask,
} from "@/types/route-preview";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function admissionTaskStatus(
  status: "met" | "action" | "missing",
) {
  if (status === "met") {
    return "ready" as const;
  }

  if (status === "missing") {
    return "attention" as const;
  }

  return "action" as const;
}

function getSubmissionTask(profile: ApplicantProfile): RouteTask {
  const sourceIds = ["iom-study-residence-application"];

  switch (profile.currentResidenceStatus) {
    case "destination-residence":
    case "other-eu-residence":
    case "destination-national-visa":
    case "visa-free-entry":
    case "temporary-protection":
      return {
        id: "residence-submission-place",
        title: "Prepare to file at the Foreign Police in Slovakia",
        description:
          "Your reported status is among the situations that may allow an in-country application. The Foreign Police must confirm that the status is valid on the submission date.",
        status: "action",
        dueLabel: "After receiving the admission letter",
        sourceIds,
      };

    case "non-eu-passport-no-residence":
      return {
        id: "residence-submission-place",
        title: "Plan an in-person embassy application",
        description:
          "The usual route is the Slovak diplomatic mission accredited for your citizenship country or country of residence. An interview is part of the preliminary assessment.",
        status: "action",
        dueLabel: "After receiving the admission letter",
        sourceIds,
      };

    case "eu-eea-swiss-passport":
      return {
        id: "residence-submission-place",
        title: "Use the EU / EEA mobility route",
        description:
          "You reported an EU, EEA or Swiss passport. A third-country student residence application should not be reused for your route; confirm the local registration duties instead.",
        status: "information",
        sourceIds,
      };

    case "other":
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

function buildResidenceStage(profile: ApplicantProfile): RouteStage {
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

  if (
    profile.currentResidenceStatus === "eu-eea-swiss-passport" ||
    euCountryCodes.has(profile.citizenshipCountryCode)
  ) {
    return {
      id: "residence",
      number: "04",
      eyebrow: "EU MOBILITY",
      title: "EU citizen registration route",
      description:
        "The third-country temporary residence procedure does not apply. The EU registration route has not yet been verified in this first data release.",
      timing: "Verification pending",
      tasks: [
        {
          id: "eu-route-pending",
          title: "Current rules still need source verification",
          description:
            "DocRoute will not reuse the non-EU checklist for an EU citizen. Until the EU route is verified, confirm registration duties with the Slovak authorities.",
          status: "attention",
          sourceIds: ["sk-ministry-foreigners-agenda"],
        },
      ],
    };
  }

  const commonSources = [
    "sk-ministry-foreigners-agenda",
    "iom-study-residence-application",
  ];

  return {
    id: "residence",
    number: "04",
    eyebrow: "STUDENT RESIDENCE",
    title: "Apply for temporary residence for study",
    description:
      "This stage begins only after the university issues an admission document that proves the purpose of residence.",
    timing: "Start after admission · decision within up to 90 days",
    tasks: [
      getSubmissionTask(profile),
      {
        id: "residence-form-passport",
        title: "Application form and valid passport",
        description:
          "Prepare the official temporary-residence form and your valid travel document for the in-person application.",
        status: "action",
        sourceIds: commonSources,
      },
      {
        id: "residence-purpose",
        title: "University admission document",
        description:
          "Use the university admission letter or confirmation as proof of the purpose of residence.",
        status: "action",
        dueLabel: "Available only after admission",
        sourceIds: commonSources,
      },
      {
        id: "criminal-record",
        title: "Criminal-record documents",
        description:
          "Prepare a record from the citizenship country and, where applicable, countries where you lived for more than 90 days during six consecutive months in the previous three years. Country-specific exceptions must be checked.",
        status: "action",
        dueLabel: "Generally no older than 90 days",
        sourceIds: ["iom-study-residence-application"],
      },
      {
        id: "authentication-translation",
        title: "Authenticate and translate foreign documents",
        description:
          "Foreign official documents generally need an apostille or superlegalisation and an official Slovak or Czech translation, unless a treaty exception applies.",
        status: "action",
        dueLabel: "Before the residence appointment",
        sourceIds: ["iom-study-residence-application"],
      },
      {
        id: "university-accommodation-exemption",
        title: "Accommodation evidence: current student exemption",
        description:
          "Current guidance lists university-study applicants among those who do not submit accommodation confirmation with this application. Recheck immediately before filing because residence rules can change.",
        status: "information",
        sourceIds: ["iom-study-residence-application"],
      },
      {
        id: "residence-card-fee",
        title: "Choose residence-card delivery speed",
        description: `Current guidance lists €${slovakiaResidenceRules.residenceCardFeesEur.standard} for issuance within 30 days or €${slovakiaResidenceRules.residenceCardFeesEur.expedited} within two business days.`,
        status: "action",
        sourceIds: ["iom-study-residence-application"],
      },
      {
        id: "post-card-duties",
        title: "Complete post-approval duties",
        description:
          "If applying abroad, enter Slovakia within 180 days of approval. Report the beginning of residence within three working days and check the medical-report and insurance duties that apply to your exact student status.",
        status: "action",
        dueLabel: "Immediately after approval and card collection",
        sourceIds: ["iom-study-residence-application"],
      },
    ],
  };
}

export function buildRoutePreview(
  profile: ApplicantProfile,
  match: ProgramMatch,
): RoutePreview {
  const program = match.program;
  const applicationDeadline = formatDate(program.application.deadline);
  const admissionDate = formatDate(program.application.admissionDate);
  const languageDeadline = formatDate(
    program.languagePolicy.foreignApplicantTest.deadline,
  );
  const verifiedAt = formatDate(program.verifiedAt);
  const programSourceIds = program.sources.map((source) => source.id);
  const applicationDocuments = match.requiredDocuments.filter(
    (document) => document.due === "application",
  );
  const laterDocuments = match.requiredDocuments.filter(
    (document) => document.due !== "application",
  );

  const languageCheck = match.checks.find(
    (check) => check.id === "language",
  );
  const recognitionCheck = match.checks.find(
    (check) => check.id === "recognition",
  );
  const entranceCheck = match.checks.find(
    (check) => check.id === "entrance-route",
  );

  const stages: RouteStage[] = [
    {
      id: "university-application",
      number: "01",
      eyebrow: "UNIVERSITY APPLICATION",
      title: `Submit the ${program.programName} application`,
      description:
        "Prepare only the documents that apply to your profile and submit the electronic application before the faculty deadline.",
      timing: `Deadline · ${applicationDeadline}`,
      tasks: applicationDocuments.map((document) => ({
        id: document.id,
        title: document.title,
        description: document.description,
        status: "action",
        dueLabel: `By ${applicationDeadline}`,
        sourceIds: document.sourceIds,
      })),
    },
    {
      id: "admission-conditions",
      number: "02",
      eyebrow: "ADMISSION CONDITIONS",
      title: "Complete language and entrance requirements",
      description:
        "This stage changes directly with the languages and evidence in your applicant profile.",
      timing: `Admission day · ${admissionDate}`,
      tasks: [
        ...(languageCheck
          ? [
              {
                id: "route-language",
                title: languageCheck.label,
                description: languageCheck.detail,
                status: admissionTaskStatus(languageCheck.status),
                dueLabel: `Complete by ${languageDeadline}`,
                sourceIds: programSourceIds,
              } satisfies RouteTask,
            ]
          : []),
        ...(entranceCheck
          ? [
              {
                id: "route-entrance",
                title:
                  match.entranceRoute === "waived"
                    ? "Submit entrance-exam waiver evidence"
                    : "Take the mathematics and logical-thinking exam",
                description: entranceCheck.detail,
                status: admissionTaskStatus(entranceCheck.status),
                dueLabel:
                  match.entranceRoute === "waived"
                    ? "Evidence with application"
                    : admissionDate,
                sourceIds: programSourceIds,
              } satisfies RouteTask,
            ]
          : []),
      ],
    },
    {
      id: "admission-enrolment",
      number: "03",
      eyebrow: "ADMISSION → ENROLMENT",
      title: "Turn the admission decision into enrolment",
      description:
        "Finish qualification recognition and provide documents that can legally be supplied after the application.",
      timing: "After the admission decision",
      tasks: [
        ...(recognitionCheck
          ? [
              {
                id: "route-recognition",
                title: recognitionCheck.label,
                description: recognitionCheck.detail,
                status: admissionTaskStatus(recognitionCheck.status),
                dueLabel: "No later than enrolment",
                sourceIds: programSourceIds,
              } satisfies RouteTask,
            ]
          : []),
        ...laterDocuments.map((document) => ({
          id: `later-${document.id}`,
          title: document.title,
          description: document.description,
          status: "action" as const,
          dueLabel:
            document.due === "admission-day"
              ? `On ${admissionDate}`
              : "By enrolment",
          sourceIds: document.sourceIds,
        })),
        {
          id: "admission-letter",
          title: "Receive and keep the official admission document",
          description:
            "This document closes the university stage and becomes the proof of purpose for a third-country student residence application.",
          status: "information",
          sourceIds: [
            ...programSourceIds,
            "iom-study-residence-application",
          ],
        },
      ],
    },
    buildResidenceStage(profile),
  ];

  return {
    version: `route-${program.intake}-${slovakiaResidenceRules.effectiveFrom}`,
    generatedFor: profile,
    match,
    stages,
    sources: [
      ...program.sources.map((source) => ({
        ...source,
        authority: "official" as const,
      })),
      ...slovakiaResidenceRules.sources,
    ],
    disclaimer:
      `This is a preparation route based on the profile you entered and university sources checked on ${verifiedAt}. It is not an admission decision or legally binding immigration advice. Recheck every open task before submission.`,
  };
}
