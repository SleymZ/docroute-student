import { slovakiaResidenceRules } from "@/data/slovakia-residence";
import { buildSlovakiaResidenceStage } from "@/lib/residence/slovakia";
import type {
  ApplicantProfile,
  MatchCheck,
  ProgramMatch,
} from "@/types/admission";
import type {
  RoutePreview,
  RouteStage,
  RouteTask,
} from "@/types/route-preview";
import { matchesStudyChoice, slovakTestRule } from "@/lib/match-programs";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function admissionTaskStatus(
  status: MatchCheck["status"],
) {
  if (status === "met") {
    return "ready" as const;
  }

  if (status === "missing" || status === "unknown") {
    return "attention" as const;
  }

  return "action" as const;
}

export function buildRoutePreview(
  profile: ApplicantProfile,
  match: ProgramMatch,
): RoutePreview | null {
  if (!match.canBuildRoute || !matchesStudyChoice(profile, match.program)) return null;
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
    (document) => document.due === "enrolment",
  );
  // The UNIZA test result is already covered by the language task below.
  const admissionDocuments = match.requiredDocuments.filter(
    (document) =>
      document.due === "admission-day" &&
      document.appliesWhen !== "foreign-language-test",
  );
  const studyLanguageCheck = match.checks.find((check) => check.id === "study-language");

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
        description: document.conditional ? `Only if this entrance route is confirmed: ${document.description}` : document.description,
        status: document.conditional ? "attention" : "action",
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
        ...(studyLanguageCheck ? [{
          id: "route-study-language",
          title: studyLanguageCheck.label,
          description: studyLanguageCheck.detail,
          status: admissionTaskStatus(studyLanguageCheck.status),
          sourceIds: studyLanguageCheck.sourceIds,
        } satisfies RouteTask] : []),
        ...(languageCheck
          ? [
              {
                id: "route-language",
                title: languageCheck.label,
                description: languageCheck.detail,
                status: admissionTaskStatus(languageCheck.status),
                dueLabel: slovakTestRule(program, profile) === "exempt"
                  ? "Confirm before enrolment" : `Complete by ${languageDeadline}`,
                sourceIds: languageCheck.sourceIds,
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
                    : match.entranceRoute === "needs-information"
                      ? "Clarify waiver evidence; prepare an exam fallback"
                      : "Take the mathematics and logical-thinking exam",
                description: entranceCheck.detail,
                status: admissionTaskStatus(entranceCheck.status),
                dueLabel:
                  match.entranceRoute === "waived"
                    ? "Evidence with application"
                    : match.entranceRoute === "needs-information"
                      ? "Clarify before application; exam fallback on " + admissionDate
                      : admissionDate,
                sourceIds: programSourceIds,
              } satisfies RouteTask,
            ]
          : []),
        ...admissionDocuments.map((document) => ({
          id: `admission-${document.id}`,
          title: document.title,
          description: document.conditional ? `Only if this entrance route is confirmed: ${document.description}` : document.description,
          status: document.conditional ? "attention" as const : "action" as const,
          dueLabel: `By ${admissionDate}`,
          sourceIds: document.sourceIds,
        })),
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
        ...(recognitionCheck && !laterDocuments.some((document) => document.appliesWhen === "foreign-education")
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
          description: document.conditional ? `Only if this entrance route is confirmed: ${document.description}` : document.description,
          status: "action" as const,
          dueLabel: "By enrolment",
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
    buildSlovakiaResidenceStage(profile),
  ];

  return {
    version: `route-${program.intake}-${slovakiaResidenceRules.effectiveFrom}-admissions-${program.verifiedAt}-v2`,
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
