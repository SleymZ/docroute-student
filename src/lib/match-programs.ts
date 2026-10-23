import type {
  AdmissionProgram,
  ApplicantLanguage,
  ApplicantProfile,
  CefrLevel,
  MatchCheck,
  MatchStatus,
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

export const matchStatusLabels: Record<MatchStatus, string> = {
  strong: "Profile aligned",
  conditional: "Steps remaining",
  "preparation-required": "Preparation needed",
  "more-information": "Needs clarification",
  unavailable: "Not available for this route",
};

const statusRank: Record<MatchStatus, number> = {
  strong: 0,
  conditional: 1,
  "more-information": 2,
  "preparation-required": 3,
  unavailable: 4,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value + "T00:00:00Z"));
}

export function matchesStudyChoice(
  profile: ApplicantProfile,
  program: AdmissionProgram,
) {
  return (
    program.countryCode === profile.destinationCountryCode &&
    program.category === profile.studyCategory &&
    program.degreeLevel === profile.degreeLevel &&
    program.intake === profile.intake
  );
}

function reachesLevel(
  language: ApplicantLanguage | undefined,
  minimum: CefrLevel,
) {
  return Boolean(language && levelRank[language.level] >= levelRank[minimum]);
}

function bestLanguage(profile: ApplicantProfile, codes: string[]) {
  return profile.languages
    .filter((language) => codes.includes(language.code))
    .sort((a, b) => levelRank[b.level] - levelRank[a.level])[0];
}

// This policy belongs to one faculty and intake. Never reuse its thresholds
// for an unrelated faculty, degree or academic year.
function evaluateFriWaiver(
  profile: ApplicantProfile,
): ProgramMatch["entranceRoute"] {
  const evidence = new Set(profile.waiverEvidence);
  if (
    evidence.has("math-matura-60") ||
    evidence.has("scio-math-60") ||
    evidence.has("scio-general-70") ||
    evidence.has("ccna") ||
    evidence.has("regional-olympiad")
  ) {
    return "waived";
  }

  const average = profile.penultimateYearAverage;
  const usableAverage =
    profile.gradeScale === "slovak-1-5" &&
    average !== undefined &&
    Number.isFinite(average) &&
    average >= 1 &&
    average <= 5;
  const gradeWaiver =
    usableAverage &&
    (average <= 1.7 || (evidence.has("fri-course") && average <= 2));

  if (gradeWaiver && profile.educationCountryCode === "SK") return "waived";
  if (
    gradeWaiver ||
    evidence.has("math-matura") ||
    evidence.has("olympiad") ||
    (evidence.has("fri-course") && !usableAverage)
  ) {
    return "needs-information";
  }
  return "exam";
}

export function matchProgram(
  profile: ApplicantProfile,
  program: AdmissionProgram,
  asOfDate: string,
): ProgramMatch {
  const checks: MatchCheck[] = [];
  const nextActions: string[] = [];
  const sourceIds = program.sources.map((source) => source.id);

  function check(
    id: string,
    label: string,
    status: MatchCheck["status"],
    detail: string,
  ) {
    checks.push({ id, label, status, detail, sourceIds });
  }

  function unavailable(
    summary: string,
    status: MatchStatus = "unavailable",
  ): ProgramMatch {
    return {
      program,
      status,
      summary,
      checks,
      requiredDocuments: [],
      nextActions: [summary],
      entranceRoute: "needs-information",
      canBuildRoute: false,
      evaluatedOn: asOfDate,
    };
  }

  if (!matchesStudyChoice(profile, program)) {
    check(
      "study-choice",
      "Study choices",
      "missing",
      "This program does not match the destination, subject, degree and intake in your profile.",
    );
    return unavailable(
      "Select a program for your exact study choices or update your profile. Requirements from another intake are not reused.",
    );
  }

  const validDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value + "T00:00:00Z")) &&
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value;
  if (!validDate(asOfDate) || !validDate(program.application.deadline)) {
    check(
      "deadline",
      "Application deadline",
      "unknown",
      "The deadline cannot be safely evaluated.",
    );
    return unavailable(
      "Confirm the current application dates with the faculty.",
      "more-information",
    );
  }
  if (asOfDate > program.application.deadline) {
    check(
      "deadline",
      "Application deadline",
      "missing",
      "The published deadline was " +
        formatDate(program.application.deadline) +
        ". No later round has been verified.",
    );
    return unavailable(
      "The verified application deadline has passed. Check an officially announced later round or another intake.",
    );
  }

  check(
    "deadline",
    "Application deadline",
    "met",
    "The published deadline is " +
      formatDate(program.application.deadline) +
      ". Check the official portal for application opening and submission instructions.",
  );

  if (
    program.admissionPolicy !== "uniza-fri-bachelor-2027" ||
    program.countryCode !== "SK" ||
    program.degreeLevel !== "bachelor" ||
    program.intake !== "2027/28"
  ) {
    check(
      "policy",
      "Program-specific admission rules",
      "unknown",
      "This program has no implemented and verified matching policy.",
    );
    return unavailable(
      "The program needs its own verified rules before a personalised route can be built.",
      "more-information",
    );
  }

  const admissionDate = formatDate(program.application.admissionDate);
  const languageTest = program.languagePolicy.foreignApplicantTest;
  const languageDeadline = formatDate(languageTest.deadline);

  if (profile.educationStatus === "completed") {
    check(
      "education",
      "Secondary education",
      "met",
      "You report completed secondary education. The faculty must verify the graduation certificate and its equivalence.",
    );
  } else if (profile.educationStatus === "final-year") {
    check(
      "education",
      "Secondary education",
      "action",
      "You can apply while finishing secondary school, but must provide the final graduation certificate no later than enrolment, including on a waiver route.",
    );
    nextActions.push(
      "Complete secondary education and provide the final certificate by enrolment.",
    );
  } else {
    check(
      "education",
      "Secondary education",
      "missing",
      "Your profile does not establish that you can finish secondary school for this intake. Confirm your graduation date before applying.",
    );
    nextActions.push(
      "Confirm that you can finish secondary school for the " +
        program.intake +
        " intake.",
    );
  }

  // Keep language knowledge separate from willingness to study in a language.
  const studyLanguage = program.instructionLanguages.find((instruction) =>
    profile.languages.some(
      (language) =>
        language.code === instruction.code && language.willingToStudyIn,
    ),
  );
  check(
    "study-language",
    "Teaching-language preference",
    studyLanguage ? "met" : "missing",
    studyLanguage
      ? "You are willing to study in " + studyLanguage.name + "."
      : "This verified program is taught in " +
          program.instructionLanguages.map((item) => item.name).join(", ") +
          ". None of those languages is marked as a language you would study in.",
  );
  if (!studyLanguage)
    nextActions.push(
      "Review the teaching language and your study-language preferences; other known languages do not replace it.",
    );

  const needsForeignTest = !languageTest.exemptCitizenshipCountryCodes.includes(
    profile.citizenshipCountryCode,
  );
  const language = bestLanguage(
    profile,
    needsForeignTest ? ["sk"] : ["sk", "cs"],
  );
  if (needsForeignTest) {
    const enoughLevel = reachesLevel(language, languageTest.minimumLevel);
    const qualifyingTest = enoughLevel && language?.proof === "uniza-test";
    check(
      "language",
      "Slovak level and required UNIZA test",
      !enoughLevel ? "missing" : qualifyingTest ? "met" : "action",
      !enoughLevel
        ? "You have not reported Slovak " +
            languageTest.minimumLevel +
            " or higher. English and other languages cannot substitute for this rule."
        : qualifyingTest
          ? "You report a qualifying UNIZA Slovak test at B1 or higher, with grade A, B or C. The faculty must verify the result."
          : "Your reported Slovak reaches B1, but a school record or unrelated certificate does not automatically replace the required UNIZA test. An earlier qualifying UNIZA test is explicitly recognised.",
    );
    if (!qualifyingTest)
      nextActions.push(
        "Pass the UNIZA Slovak test at B1 or higher with grade A, B or C by " +
          languageDeadline +
          "; only one attempt is allowed in the admission calendar year.",
      );
  } else {
    // No numerical CEFR minimum is published for the Slovak/Czech exemption.
    check(
      "language",
      "Written and spoken Slovak or Czech",
      language ? "action" : "missing",
      language
        ? "The rules exempt Slovak and Czech applicants from this foreign-applicant test. Confirm that your written and spoken Slovak or Czech is sufficient; the rule does not specify a CEFR threshold for this route."
        : "Written and spoken Slovak or Czech is required. Add your actual language knowledge and confirm proficiency with the faculty.",
    );
    nextActions.push(
      "Confirm written and spoken Slovak or Czech proficiency with the faculty.",
    );
  }

  const foreignEducation = profile.educationCountryCode !== program.countryCode;
  check(
    "recognition",
    "Foreign education recognition",
    foreignEducation ? "action" : "met",
    foreignEducation
      ? "Your secondary education is from outside Slovakia. A Slovak recognition decision is required by enrolment; the exact procedure depends on your qualification."
      : "You report Slovak secondary education. Foreign-qualification recognition does not apply.",
  );

  const entranceRoute = evaluateFriWaiver(profile);
  check(
    "entrance-route",
    "Entrance-exam route",
    entranceRoute === "needs-information" ? "unknown" : "action",
    entranceRoute === "waived"
      ? "Your self-reported evidence suggests a published waiver route. Submit it with the application; the faculty must check the exact school, qualification and result before confirming admission without an exam."
      : entranceRoute === "needs-information"
        ? "The saved evidence is not specific enough to confirm a waiver. A mathematics exam without percentile, unspecified competition, or unconfirmed foreign grade scale is not sufficient. Update the evidence; prepare for the exam until the faculty confirms otherwise."
        : "No qualifying waiver is established. The fallback is the 120-minute mathematics and logical-thinking exam on " +
          admissionDate +
          ", ranked up to capacity. No guaranteed minimum passing score is published.",
  );
  nextActions.push(
    entranceRoute === "waived"
      ? "Upload the qualifying waiver evidence and obtain the faculty's confirmation."
      : entranceRoute === "needs-information"
        ? "Clarify your waiver evidence with the faculty before the application deadline; keep the exam route as a fallback."
        : "Prepare for the entrance exam on " + admissionDate + ".",
  );

  const requiredDocuments = program.documents
    .flatMap((document) => {
      let applies = false;
      let conditional = false;
      switch (document.appliesWhen) {
        case "always":
          applies = true;
          break;
        case "foreign-education":
          applies = foreignEducation;
          break;
        case "graduated-earlier":
          applies = profile.educationStatus === "completed";
          break;
        case "graduating-this-year":
          applies = profile.educationStatus !== "completed";
          break;
        case "foreign-language-test":
          applies = needsForeignTest;
          break;
        case "waiver-claim":
          applies = entranceRoute !== "exam";
          conditional = entranceRoute === "needs-information";
          break;
        case "entrance-exam":
          applies = entranceRoute !== "waived";
          conditional = entranceRoute === "needs-information";
          break;
      }
      return applies ? [{ ...document, conditional }] : [];
    })
    .sort((a, b) => {
      const order = { application: 0, "admission-day": 1, enrolment: 2 };
      return order[a.due] - order[b.due];
    });

  if (foreignEducation)
    nextActions.push(
      "Start recognition of your foreign qualification in time for enrolment.",
    );
  nextActions.push(
    "Prepare the applicable documents and submit them with the application fee before the faculty deadline.",
  );

  const status: MatchStatus = checks.some((item) => item.status === "missing")
    ? "preparation-required"
    : checks.some((item) => item.status === "unknown")
      ? "more-information"
      : checks.some((item) => item.status === "action")
        ? "conditional"
        : "strong";
  const summary =
    status === "preparation-required"
      ? "This program matches your study choices, but your current education or language profile has unmet conditions. It is a preparation option, not a confirmed fit."
      : status === "more-information"
        ? "This program matches your study choices, but some evidence is incomplete. Clarify the highlighted conditions before relying on the route."
        : "This program matches your study choices. Complete the listed document, language and entrance steps; admission remains the faculty's decision.";

  return {
    program,
    status,
    summary,
    checks,
    requiredDocuments,
    nextActions: [...new Set(nextActions)],
    entranceRoute,
    canBuildRoute: true,
    evaluatedOn: asOfDate,
  };
}

export function matchPrograms(
  profile: ApplicantProfile,
  programs: readonly AdmissionProgram[],
  asOfDate: string,
) {
  return programs
    .filter((program) => matchesStudyChoice(profile, program))
    .map((program) => matchProgram(profile, program, asOfDate))
    .sort(
      (a, b) =>
        statusRank[a.status] - statusRank[b.status] ||
        a.program.programName.localeCompare(b.program.programName, "en"),
    );
}
