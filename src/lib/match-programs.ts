import type {
  AdmissionProgram,
  ApplicantLanguage,
  ApplicantProfile,
  ApplicationDocument,
  CefrLevel,
  MatchCheck,
  ProgramMatch,
} from "@/types/admission";

const levelRank: Record<CefrLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
  native: 7,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function reachesLevel(
  language: ApplicantLanguage | undefined,
  minimum: CefrLevel,
) {
  return Boolean(
    language && levelRank[language.level] >= levelRank[minimum],
  );
}

function findStudyLanguage(
  profile: ApplicantProfile,
  languageCodes: string[],
) {
  return profile.languages.find(
    (language) =>
      languageCodes.includes(language.code) &&
      language.willingToStudyIn,
  );
}

function evaluateWaiver(profile: ApplicantProfile) {
  const evidence = new Set(profile.waiverEvidence);

  if (
    evidence.has("math-matura") ||
    evidence.has("scio-math-60") ||
    evidence.has("scio-general-70") ||
    evidence.has("ccna") ||
    evidence.has("olympiad")
  ) {
    return true;
  }

  if (
    profile.gradeScale === "slovak-1-5" &&
    profile.penultimateYearAverage !== undefined &&
    profile.penultimateYearAverage <= 1.7
  ) {
    return true;
  }

  return Boolean(
    evidence.has("fri-course") &&
      profile.gradeScale === "slovak-1-5" &&
      profile.penultimateYearAverage !== undefined &&
      profile.penultimateYearAverage <= 2,
  );
}

function applicableDocuments(
  program: AdmissionProgram,
  profile: ApplicantProfile,
  entranceRoute: ProgramMatch["entranceRoute"],
) {
  return program.documents.filter((document) => {
    switch (document.appliesWhen) {
      case "always":
        return true;
      case "foreign-education":
        return profile.educationCountryCode !== program.countryCode;
      case "graduated-earlier":
        return profile.educationStatus === "completed";
      case "waiver-claim":
        return entranceRoute === "waived";
      case "entrance-exam":
        return entranceRoute !== "waived";
    }
  });
}

function addDocumentActions(
  documents: ApplicationDocument[],
  actions: string[],
) {
  const applicationDocuments = documents.filter(
    (document) => document.due === "application",
  );

  if (applicationDocuments.length > 0) {
    actions.push(
      `Prepare ${applicationDocuments.length} application document${
        applicationDocuments.length === 1 ? "" : "s"
      } before the deadline.`,
    );
  }

  if (documents.some((document) => document.due === "enrolment")) {
    actions.push(
      "Start the recognition process for your foreign school qualification before enrolment.",
    );
  }
}

export function matchProgram(
  profile: ApplicantProfile,
  program: AdmissionProgram,
): ProgramMatch {
  const checks: MatchCheck[] = [];
  const nextActions: string[] = [];
  const admissionDate = formatDate(program.application.admissionDate);
  const languageDeadline = formatDate(
    program.languagePolicy.foreignApplicantTest.deadline,
  );

  if (profile.educationStatus === "completed") {
    checks.push({
      id: "education",
      label: "Secondary education",
      status: "met",
      detail:
        "You reported completed secondary education. The university will verify the final certificate.",
    });
  } else if (profile.educationStatus === "final-year") {
    checks.push({
      id: "education",
      label: "Secondary education",
      status: "action",
      detail:
        "You can apply during your final year, but must complete secondary education and provide the final certificate by enrolment.",
    });
    nextActions.push(
      "Complete secondary school and provide the graduation certificate by enrolment.",
    );
  } else {
    checks.push({
      id: "education",
      label: "Secondary education",
      status: "missing",
      detail:
        "You are not yet in the final year. Admission remains a future route until secondary education can be completed for this intake.",
    });
    nextActions.push(
      `Confirm that you can complete secondary education before the ${program.intake} enrolment date.`,
    );
  }

  const needsForeignTest =
    !program.languagePolicy.foreignApplicantTest.exemptCitizenshipCountryCodes.includes(
      profile.citizenshipCountryCode,
    );

  if (needsForeignTest) {
    const slovak = findStudyLanguage(profile, ["sk"]);

    if (!reachesLevel(slovak, "B1")) {
      checks.push({
        id: "language",
        label: "Language requirement",
        status: "missing",
        detail:
          "This route requires Slovak at B1 or higher. None of the languages you marked for study currently meets that rule.",
      });
      nextActions.push(
        `Reach Slovak B1 and register for the required language test by ${languageDeadline}.`,
      );
    } else {
      checks.push({
        id: "language",
        label: "Language requirement",
        status: slovak?.proof === "none" ? "action" : "met",
        detail:
          slovak?.proof === "none"
            ? "Your reported Slovak level reaches B1, but proof is still needed. UNIZA requires its test or acceptance of existing evidence."
            : "Your reported Slovak level reaches B1. UNIZA must still confirm the submitted proof or test result.",
      });
      nextActions.push(
        `Book the required Slovak test or ask the university to recognise your existing language proof by ${languageDeadline}.`,
      );
    }
  } else {
    const slovakOrCzech = findStudyLanguage(profile, ["sk", "cs"]);

    if (!reachesLevel(slovakOrCzech, "B1")) {
      checks.push({
        id: "language",
        label: "Language requirement",
        status: "missing",
        detail:
          "The faculty requires written and spoken Slovak or Czech. Add a study-ready Slovak or Czech language to your profile.",
      });
      nextActions.push(
        "Confirm written and spoken Slovak or Czech with the faculty.",
      );
    } else {
      checks.push({
        id: "language",
        label: "Language requirement",
        status: "met",
        detail: `Your reported ${
          slovakOrCzech?.code === "cs" ? "Czech" : "Slovak"
        } level is compatible with the published language rule.`,
      });
    }
  }

  if (profile.educationCountryCode !== program.countryCode) {
    checks.push({
      id: "recognition",
      label: "Foreign education recognition",
      status: "action",
      detail:
        "Because your secondary education is from another country, a Slovak recognition decision is required no later than enrolment.",
    });
  } else {
    checks.push({
      id: "recognition",
      label: "Education recognition",
      status: "met",
      detail:
        "You reported Slovak secondary education, so the foreign-qualification recognition step does not apply.",
    });
  }

  const waiver = evaluateWaiver(profile);
  const entranceRoute: ProgramMatch["entranceRoute"] = waiver
    ? "waived"
    : "exam";

  checks.push({
    id: "entrance-route",
    label: "Entrance route",
    status: waiver ? "met" : "action",
    detail: waiver
      ? "Your profile contains at least one published route to admission without the entrance exam. The faculty will verify the evidence."
      : `No verified waiver condition was found in your profile. You can still apply through the mathematics and logical-thinking entrance exam on ${admissionDate}.`,
  });

  if (!waiver) {
    nextActions.push(
      `Prepare for the 120-minute mathematics and logical-thinking entrance exam on ${admissionDate}.`,
    );
  }

  const requiredDocuments = applicableDocuments(
    program,
    profile,
    entranceRoute,
  );

  addDocumentActions(requiredDocuments, nextActions);

  const hasMissing = checks.some((check) => check.status === "missing");
  const hasActions = checks.some((check) => check.status === "action");

  const status: ProgramMatch["status"] = hasMissing
    ? "preparation-required"
    : hasActions
      ? "conditional"
      : "strong";

  const summary = hasMissing
    ? "The program is relevant, but your current profile does not yet meet every published requirement."
    : hasActions
      ? "The program fits your choices, with required steps still to complete before admission."
      : "Your current profile aligns with the published entry route, subject to university verification.";

  return {
    program,
    status,
    summary,
    checks,
    requiredDocuments,
    nextActions: [...new Set(nextActions)],
    entranceRoute,
  };
}

export function matchPrograms(
  profile: ApplicantProfile,
  programs: readonly AdmissionProgram[],
) {
  return programs
    .filter(
      (program) =>
        program.countryCode === profile.destinationCountryCode &&
        program.category === profile.studyCategory &&
        program.degreeLevel === profile.degreeLevel &&
        program.intake === profile.intake,
    )
    .map((program) => matchProgram(profile, program));
}
