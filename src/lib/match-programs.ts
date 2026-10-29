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
  conditional: "Steps remaining",
  "preparation-required": "Preparation needed",
  "more-information": "Needs clarification",
  unavailable: "Not available for this route",
};

const statusRank: Record<MatchStatus, number> = {
  conditional: 0,
  "more-information": 1,
  "preparation-required": 2,
  unavailable: 3,
};


export type SlovakTestRule = "exempt" | "required" | "unclear";

// FRI rules (2027/28, admission conditions, point 11) require the UNIZA Slovak
// test from foreign applicants "except applicants from the Czech Republic",
// and point 2 describes a foreign applicant as one who finished secondary
// school abroad. Citizenship is not mentioned, so when citizenship and school
// country disagree the faculty has to confirm.
export function slovakTestRule(
  program: AdmissionProgram,
  profile: Pick<ApplicantProfile, "citizenshipCountryCode" | "educationCountryCode">,
): SlovakTestRule {
  const exempt = program.languagePolicy.foreignApplicantTest?.exemptCountryCodes;
  if (!exempt) return "exempt";
  const byCitizenship = exempt.includes(profile.citizenshipCountryCode);
  const byEducation = exempt.includes(profile.educationCountryCode);
  if (byCitizenship && byEducation) return "exempt";
  if (!byCitizenship && !byEducation) return "required";
  return "unclear";
}

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

// Charles University MFF, bachelor's programmes 2027/28 (checked
// 2026-10-28). Own thresholds and documents; never reuse them elsewhere.
const mffAutoEquivalentSchools = new Set(["SK", "PL", "HU", "SI"]);
const mffMaturitaSchools = new Set(["CZ", "SK"]);

function matchCharlesMff(
  profile: ApplicantProfile,
  program: AdmissionProgram,
  checks: MatchCheck[],
  nextActions: string[],
  sourceIds: string[],
  admissionDate: string,
): Pick<ProgramMatch, "requiredDocuments" | "entranceRoute"> {
  const check = (
    id: string,
    label: string,
    status: MatchCheck["status"],
    detail: string,
  ) => checks.push({ id, label, status, detail, sourceIds });
  const school = profile.educationCountryCode;
  const czechOrSlovakSchool = mffMaturitaSchools.has(school);

  // Language: a Czech or Slovak maturita covers it; otherwise proof of Czech.
  const czech = bestLanguage(profile, ["cs"]);
  const needsCzechProof = !czechOrSlovakSchool;
  if (!needsCzechProof) {
    check(
      "language",
      "Czech: covered by a Czech or Slovak maturita",
      "met",
      "With a Czech or Slovak maturita no separate proof of Czech is needed. The programme is taught in Czech.",
    );
  } else {
    const enough = reachesLevel(czech, "B2");
    check(
      "language",
      "Proof of Czech at B2 or higher",
      enough ? "action" : "missing",
      enough
        ? "Send a certified proof of Czech by post, preferably by 31 July 2027: two years of full-time study at a Czech or Slovak school taught in that language, a Czech B2/C1 exam at ÚJOP UK, or a state or Czech/Slovak language exam at B2–C2."
        : "You have not reported Czech at B2 or higher. Without a Czech or Slovak maturita, prove Czech (two years at a Czech or Slovak school, ÚJOP UK B2/C1, or a state or Czech/Slovak exam at B2–C2), preferably by 31 July 2027.",
    );
    nextActions.push("Prove Czech at B2 or higher, preferably by 31 July 2027.");
  }

  // Recognition of secondary education.
  const autoEquivalent = mffAutoEquivalentSchools.has(school);
  const foreignEducation = school !== "CZ" && !autoEquivalent;
  check(
    "recognition",
    "Secondary education recognition",
    foreignEducation ? "action" : "met",
    school === "CZ"
      ? "You report Czech secondary education; no recognition is needed."
      : autoEquivalent
        ? "Maturita certificates from Slovakia, Poland, Hungary and Slovenia are automatically equivalent in Czechia; no recognition procedure is needed."
        : "Your certificate needs nostrifikace, an IB or European Baccalaureate diploma, or an assessment by the faculty (free of charge) before enrolment.",
  );
  if (foreignEducation) {
    nextActions.push("Arrange recognition of your secondary education before enrolment.");
  }

  // Exam waivers. Maturita-based grounds need a maturita in 2025/26 or
  // 2026/27; a "completed" profile does not say which year.
  const evidence = new Set(profile.waiverEvidence);
  const recentMaturita = profile.educationStatus === "final-year";
  const maturitaGround = (country: "CZ" | "SK" | "CZSK", claimed: boolean) => {
    if (!claimed) return null;
    const schoolMatches = country === "CZSK" ? czechOrSlovakSchool : school === country;
    return schoolMatches && recentMaturita ? "waived" : "needs-information";
  };
  const groundResults = [
    maturitaGround("SK", evidence.has("sk-matura-math-75")),
    maturitaGround("CZ", evidence.has("cz-matura-math-plus-68")),
    maturitaGround("CZSK", evidence.has("mff-math-average-1-5")),
    evidence.has("mff-olympiad") || evidence.has("mff-seminar") || evidence.has("ap-exam-4-5")
      ? "waived"
      : null,
  ];
  const entranceRoute: ProgramMatch["entranceRoute"] = groundResults.includes("waived")
    ? "waived"
    : groundResults.includes("needs-information")
      ? "needs-information"
      : "exam";

  check(
    "entrance-route",
    "Entrance-exam route",
    entranceRoute === "needs-information" ? "unknown" : "action",
    entranceRoute === "waived"
      ? "Your self-reported evidence matches a published waiver ground. Request the waiver in the e-application by its deadline; the faculty decides from April 2027."
      : entranceRoute === "needs-information"
        ? "The maturita-based waivers apply only to a maturita taken in 2025/26 or 2026/27 at the matching school (the maths-average ground also accepts European schools). Your profile does not confirm this, so ask the faculty and prepare for the exam."
        : "No waiver ground is established. Take the written exam on " +
          admissionDate +
          " (substitute date 22 June 2027 on request): 10 tasks in 75 minutes, at least 40 of 100 points passes.",
  );
  nextActions.push(
    entranceRoute === "waived"
      ? "Request the exam waiver in the e-application with signed proof by its deadline."
      : entranceRoute === "needs-information"
        ? "Confirm with the faculty that your maturita qualifies for a waiver; keep the exam on " + admissionDate + " as a fallback."
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
        case "foreign-language-test":
          applies = needsCzechProof;
          break;
        case "waiver-claim":
          applies = entranceRoute !== "exam";
          conditional = entranceRoute === "needs-information";
          break;
        case "entrance-exam":
          applies = entranceRoute !== "waived";
          conditional = entranceRoute === "needs-information";
          break;
        default:
          applies = false;
      }
      return applies ? [{ ...document, conditional }] : [];
    })
    .sort((a, b) => {
      const order = { application: 0, "admission-day": 1, enrolment: 2 };
      return order[a.due] - order[b.due];
    });

  nextActions.push(
    "Submit the e-application by " +
      formatDate(program.application.deadline) +
      " and pay the fee on time.",
  );
  return { requiredDocuments, entranceRoute };
}

// ČVUT FIT Informatika, 2027/28 (conditions PDF, checked 2026-10-29). Own
// grounds and documents; never reuse them for MFF or UNIZA, or theirs here.
const cvutCzechOrSlovak = new Set(["CZ", "SK"]);
const cvutSpecialConditionCitizens = new Set(["RU", "BY"]);

function matchCvutFit(
  profile: ApplicantProfile,
  program: AdmissionProgram,
  checks: MatchCheck[],
  nextActions: string[],
  sourceIds: string[],
): Pick<ProgramMatch, "requiredDocuments" | "entranceRoute"> {
  const check = (
    id: string,
    label: string,
    status: MatchCheck["status"],
    detail: string,
  ) => checks.push({ id, label, status, detail, sourceIds });
  const school = profile.educationCountryCode;
  const evidence = new Set(profile.waiverEvidence);
  const czechOrSlovakSchool = cvutCzechOrSlovak.has(school);
  const czechOrSlovakCitizen = cvutCzechOrSlovak.has(profile.citizenshipCountryCode);
  const osp90 = evidence.has("scio-osp-90");

  if (cvutSpecialConditionCitizens.has(profile.citizenshipCountryCode)) {
    check(
      "citizenship-rules",
      "Special conditions for Russian and Belarusian citizens",
      "action",
      "ČVUT applies extra admission and study conditions to citizens of Russia and Belarus (ČVUT information page and the FIT dean's decision). Read them before applying.",
    );
    nextActions.push("Read ČVUT's special conditions for Russian and Belarusian citizens.");
  }

  // Language: citizens or Czech/Slovak-language graduates are exempt; the
  // OSP 90th-percentile ground also covers it. A school in Czechia or
  // Slovakia is taken as Czech- or Slovak-language education.
  const needsCzechProof = !czechOrSlovakCitizen && !czechOrSlovakSchool && !osp90;
  if (!needsCzechProof) {
    check(
      "language",
      "Czech: no separate proof needed",
      "met",
      czechOrSlovakCitizen
        ? "Czech and Slovak citizens do not prove Czech. The programme is taught in Czech."
        : czechOrSlovakSchool
          ? "Graduates of a Czech- or Slovak-language school do not prove Czech (if your school taught in another language, ask the faculty). The programme is taught in Czech."
          : "You report a SCIO OSP result at the 90th percentile or higher, which the conditions accept instead of the Czech certificate. Upload it by 24 May 2027.",
    );
  } else {
    const enough = reachesLevel(bestLanguage(profile, ["cs"]), "B2");
    check(
      "language",
      "Certified Czech exam at B2 or higher",
      enough ? "action" : "missing",
      enough
        ? "Send a certified copy of your Czech exam certificate (B2 or higher) by the document deadline for your enrolment day."
        : "You have not reported Czech at B2. Without Czech or Slovak citizenship or schooling, you need a Czech exam certificate at B2 or higher, or the SCIO OSP result at the 90th percentile.",
    );
    nextActions.push("Get a Czech exam certificate at B2 or higher before the June–September document deadlines.");
  }

  const foreignEducation = !czechOrSlovakSchool;
  check(
    "recognition",
    "Secondary education recognition",
    foreignEducation ? "action" : "met",
    school === "SK"
      ? "A Slovak maturita is treated like a Czech one; send a certified copy, no nostrifikace."
      : school === "CZ"
        ? "You report Czech secondary education; send a certified copy of the maturita certificate."
        : "Your certificate needs nostrifikace or a ČVUT assessment issued in the admission procedure before your enrolment day.",
  );
  if (foreignEducation) {
    nextActions.push("Arrange nostrifikace or a ČVUT assessment of your school certificate.");
  }

  // CERMAT counts only for a Czech maturita in 2025/26 or 2026/27; a
  // "completed" profile does not say which year.
  const cermat = evidence.has("cvut-cermat-math-75")
    ? school === "CZ" && profile.educationStatus === "final-year"
      ? "waived"
      : "needs-information"
    : null;
  const other = (["scio-math-90", "scio-osp-90", "mensa-130", "cvut-fiks", "cvut-national-competition"] as const)
    .some((item) => evidence.has(item))
    ? "waived"
    : null;
  const entranceRoute: ProgramMatch["entranceRoute"] =
    cermat === "waived" || other === "waived"
      ? "waived"
      : cermat === "needs-information"
        ? "needs-information"
        : "exam";

  check(
    "entrance-route",
    "Entrance-exam route",
    entranceRoute === "needs-information" ? "unknown" : "action",
    entranceRoute === "waived"
      ? "Your self-reported result matches a published waiver ground. Upload the request and proof by 24 May 2027; later documents are not considered. CERMAT, FIKS and competition grounds count only if you have not studied at FIT before."
      : entranceRoute === "needs-information"
        ? "The CERMAT ground needs a Czech maturita with Matematika rozšiřující 75%+ in 2025/26 or 2026/27. Your profile does not confirm this, so ask the faculty and prepare for the test."
        : "No waiver ground is established. Take the maths test on 1 or 2 June 2027: 70 of 100 points guarantees admission, and the faculty may lower the threshold. Slovak maturita results are not a waiver ground here; a SCIO test by 24 April 2027 is.",
  );
  nextActions.push(
    entranceRoute === "waived"
      ? "Upload the waiver request and proof by 24 May 2027."
      : entranceRoute === "needs-information"
        ? "Confirm the CERMAT waiver with the faculty; keep the 1–2 June 2027 test as a fallback."
        : "Prepare for the maths test on 1–2 June 2027 (or take SCIO Mathematics/OSP by 24 April 2027 for a waiver).",
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
        case "foreign-language-test":
          applies = needsCzechProof;
          break;
        case "waiver-claim":
          applies = entranceRoute !== "exam";
          conditional = entranceRoute === "needs-information";
          break;
        case "entrance-exam":
          applies = entranceRoute !== "waived";
          conditional = entranceRoute === "needs-information";
          break;
        default:
          applies = false;
      }
      return applies ? [{ ...document, conditional }] : [];
    })
    .sort((a, b) => {
      const order = { application: 0, "admission-day": 1, enrolment: 2 };
      return order[a.due] - order[b.due];
    });

  nextActions.push(
    "Submit the online application and pay CZK 1,050 by " +
      formatDate(program.application.deadline) +
      ".",
  );
  return { requiredDocuments, entranceRoute };
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

  const mffPolicy =
    program.admissionPolicy === "cuni-mff-bachelor-2027" &&
    program.countryCode === "CZ" &&
    program.degreeLevel === "bachelor" &&
    program.intake === "2027/28";
  const cvutPolicy =
    program.admissionPolicy === "cvut-fit-bachelor-2027" &&
    program.countryCode === "CZ" &&
    program.degreeLevel === "bachelor" &&
    program.intake === "2027/28";
  const languageTest = program.languagePolicy.foreignApplicantTest;
  if (
    !mffPolicy &&
    !cvutPolicy &&
    (program.admissionPolicy !== "uniza-fri-bachelor-2027" ||
      program.countryCode !== "SK" ||
      program.degreeLevel !== "bachelor" ||
      program.intake !== "2027/28" ||
      !languageTest)
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

  if (mffPolicy) {
    return finishMatch(
      matchCharlesMff(profile, program, checks, nextActions, sourceIds, admissionDate),
    );
  }
  if (cvutPolicy) {
    return finishMatch(
      matchCvutFit(profile, program, checks, nextActions, sourceIds),
    );
  }
  if (!languageTest) return unavailable("Missing language policy.", "more-information");
  const languageDeadline = formatDate(languageTest.deadline);

  const testRule = slovakTestRule(program, profile);
  const needsForeignTest = testRule !== "exempt";
  const language = bestLanguage(
    profile,
    testRule === "required" ? ["sk"] : ["sk", "cs"],
  );
  if (testRule === "required") {
    const enoughLevel = reachesLevel(language, languageTest.minimumLevel);
    const qualifyingTest = enoughLevel && language?.proof === "uniza-test";
    check(
      "language",
      "Slovak level and required UNIZA test",
      !enoughLevel ? "missing" : qualifyingTest ? "met" : "action",
      !enoughLevel
        ? "You have not reported Slovak " +
            languageTest.minimumLevel +
            " or higher. English and other languages cannot substitute for this rule. Pass the UNIZA Slovak test at B1 or higher with grade A, B or C by " +
            languageDeadline +
            "."
        : qualifyingTest
          ? "You report a qualifying UNIZA Slovak test at B1 or higher, with grade A, B or C. Bring the result; the faculty must verify it."
          : "Your reported Slovak reaches B1, but a school record or unrelated certificate does not replace the required UNIZA test. Pass it at B1 or higher with grade A, B or C by " +
            languageDeadline +
            "; an earlier qualifying UNIZA test is recognised.",
    );
    if (!qualifyingTest)
      nextActions.push(
        "Pass the UNIZA Slovak test at B1 or higher with grade A, B or C by " +
          languageDeadline +
          "; only one attempt is allowed in the admission calendar year.",
      );
  } else if (testRule === "unclear") {
    check(
      "language",
      "Slovak test exemption: ask the faculty",
      language ? "unknown" : "missing",
      (language
        ? ""
        : "Written and spoken Slovak or Czech is required, and your profile lists neither. ") +
        "The rules exempt applicants from the Czech Republic (and Slovak applicants) from the UNIZA Slovak test, but do not say whether this depends on citizenship or on where you finished school. Your citizenship and school country differ, so ask the faculty in writing. Until it confirms, plan to pass the UNIZA Slovak test at B1 or higher with grade A, B or C by " +
        languageDeadline +
        ".",
    );
    nextActions.push(
      "Ask the faculty in writing whether the Slovak test exemption applies to you; until it confirms, plan the UNIZA Slovak test by " +
        languageDeadline +
        ".",
    );
  } else {
    // No numerical CEFR minimum is published for the Slovak/Czech exemption.
    check(
      "language",
      "Written and spoken Slovak or Czech",
      language ? "action" : "missing",
      language
        ? "Your citizenship and school are both Slovak or Czech, so the foreign-applicant Slovak test does not apply. Confirm that your written and spoken Slovak or Czech is sufficient; the rules give no CEFR threshold."
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
          conditional = testRule === "unclear";
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

  return finishMatch({ requiredDocuments, entranceRoute });

  function finishMatch(result: {
    requiredDocuments: ProgramMatch["requiredDocuments"];
    entranceRoute: ProgramMatch["entranceRoute"];
  }): ProgramMatch {
    const { requiredDocuments, entranceRoute } = result;
    const status: MatchStatus = checks.some((item) => item.status === "missing")
      ? "preparation-required"
      : checks.some((item) => item.status === "unknown")
        ? "more-information"
        : // Best possible status: admission always keeps a faculty step
          // (exam or waiver confirmation), so DocRoute never says "aligned".
          "conditional";
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
