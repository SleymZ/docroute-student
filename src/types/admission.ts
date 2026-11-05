export const cefrLevels = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "native",
] as const;

export type CefrLevel = (typeof cefrLevels)[number];

export type ApplicantLanguage = {
  code: string;
  level: CefrLevel;
  willingToStudyIn: boolean;
  proof: "none" | "school" | "certificate" | "uniza-test";
  certificateName?: string;
};

export type EducationStatus =
  | "completed"
  | "final-year"
  | "earlier-year";

export type GradeScale = "slovak-1-5" | "other";

export const degreeLevels = ["bachelor", "master"] as const;

export type DegreeLevel = (typeof degreeLevels)[number];

export const studyIntakes = [
  "2027/28",
  "2028/29",
  "2029/30",
] as const;

export type StudyIntake = (typeof studyIntakes)[number];

export const currentResidenceStatuses = [
  "eu-eea-swiss-passport",
  "non-eu-passport-no-residence",
  "destination-study-residence",
  "destination-residence",
  "destination-permanent-residence",
  "other-eu-residence",
  "destination-national-visa",
  "visa-free-entry",
  "temporary-protection",
  "other",
] as const;

export type CurrentResidenceStatus =
  (typeof currentResidenceStatuses)[number];

export type WaiverEvidence =
  | "math-matura"
  | "math-matura-60"
  | "scio-math-60"
  | "scio-general-70"
  | "ccna"
  | "fri-course"
  | "olympiad"
  | "regional-olympiad"
  // Charles University MFF 2027/28 waiver grounds.
  | "mff-math-average-1-5"
  | "mff-olympiad"
  | "mff-seminar"
  | "cz-matura-math-plus-68"
  | "sk-matura-math-75"
  | "ap-exam-4-5"
  // ČVUT FIT 2027/28 waiver grounds.
  | "cvut-cermat-math-75"
  | "scio-math-90"
  | "scio-osp-90"
  | "mensa-130"
  | "cvut-fiks"
  | "cvut-national-competition";

export const waiverEvidenceOptions: readonly WaiverEvidence[] = [
  "math-matura", // Legacy profiles: no percentile was collected.
  "math-matura-60",
  "scio-math-60",
  "scio-general-70",
  "ccna",
  "fri-course",
  "olympiad", // Legacy profiles: competition scope was unspecified.
  "regional-olympiad",
  "mff-math-average-1-5",
  "mff-olympiad",
  "mff-seminar",
  "cz-matura-math-plus-68",
  "sk-matura-math-75",
  "ap-exam-4-5",
  "cvut-cermat-math-75",
  "scio-math-90",
  "scio-osp-90",
  "mensa-130",
  "cvut-fiks",
  "cvut-national-competition",
];

export type ApplicantProfile = {
  destinationCountryCode: string;
  studyCategory: string;
  degreeLevel: DegreeLevel;
  intake: StudyIntake;
  citizenshipCountryCode: string;
  educationCountryCode: string;
  currentResidenceStatus: CurrentResidenceStatus;
  educationStatus: EducationStatus;
  gradeScale: GradeScale;
  penultimateYearAverage?: number;
  languages: ApplicantLanguage[];
  waiverEvidence: WaiverEvidence[];
};

export type OfficialSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  checkedAt: string;
};

export type ApplicationDocument = {
  id: string;
  title: string;
  description: string;
  appliesWhen:
    | "always"
    | "foreign-education"
    | "graduated-earlier"
    | "graduating-this-year"
    | "waiver-claim"
    | "entrance-exam"
    | "foreign-language-test";
  due: "application" | "admission-day" | "enrolment";
  sourceIds: string[];
  conditional?: boolean;
  // Overrides the generic "By <deadline>" label when the document has its
  // own deadline (e.g. waiver evidence due after the application deadline).
  dueLabel?: string;
};

export type AdmissionRequirement = {
  id: string;
  title: string;
  description: string;
  sourceIds: string[];
};

// Declarative rules for programmes on the shared "generic-2027" matching
// policy (src/lib/match-programs.ts, matchGeneric). Each field restates what
// the faculty's own 2027/28 documents say; nothing is inferred.
export type GenericAdmissionRules = {
  // Language proof for the teaching language. null when the checked pages do
  // not state one (the match then asks the applicant to confirm it).
  language: {
    code: string;
    name: string;
    minimumLevel: CefrLevel;
    exemptCitizenships: string[];
    exemptSchools: string[];
    proof: string;
    sourceIds: string[];
  } | null;
  languageUnknownNote?: string;
  // Schools whose certificates need no recognition step.
  recognition: { exemptSchools: string[]; text: string; sourceIds: string[] };
  // dueLabel: the entrance step's own dates (the programme's admissionDate
  // is a single key date and may be a results deadline, not an exam).
  entrance: { label: string; text: string; sourceIds: string[]; dueLabel: string };
};

export type AdmissionProgram = {
  id: string;
  admissionPolicy: string;
  universityId: string;
  universityHost: string;
  universityName: string;
  faculty: string;
  country: string;
  countryCode: string;
  city: string;
  category: string;
  programName: string;
  localProgramName: string;
  degreeLevel: DegreeLevel;
  intake: StudyIntake;
  durationYears: number;
  studyMode: "full-time";
  instructionLanguages: Array<{
    code: string;
    name: string;
  }>;
  application: {
    deadline: string;
    admissionDate: string;
    feeEur?: number;
    // Shown when the fee is not in euros (e.g. "CZK 1,000").
    feeLabel?: string;
    // Programme-specific labels for the route's language and waiver tasks.
    languageProofDueLabel?: string;
    waiverEvidenceDueLabel?: string;
    applicationUrl: string;
    // Later verified rounds of the same intake, in date order. Once the main
    // deadline has passed, matching uses the next round still open.
    // documentDueLabels replaces the due labels of round-specific documents.
    laterRounds?: Array<{ deadline: string; admissionDate: string; documentDueLabels?: Record<string, string> }>;
  };
  languagePolicy: {
    generalStatement: string;
    // UNIZA FRI only; other policies describe language rules in checks.
    foreignApplicantTest?: {
      languageCode: "sk";
      minimumLevel: "B1";
      // Countries named by the exemption. The FRI rules say "applicants from
      // the Czech Republic" without saying whether that means citizenship or
      // where the applicant finished school, so the exemption is certain only
      // when both point to one of these countries (see slovakTestRule).
      exemptCountryCodes: string[];
      deadline: string;
      note: string;
    };
  };
  documents: ApplicationDocument[];
  minimumRequirements: AdmissionRequirement[];
  sources: OfficialSource[];
  verifiedAt: string;
  // Long-cycle master's (medicine, law): entered straight from school, so it
  // is matched like a first degree but never labelled a bachelor.
  programType?: "long-cycle";
  genericRules?: GenericAdmissionRules;
};

export type MatchStatus =
  | "conditional"
  | "preparation-required"
  | "more-information"
  | "unavailable";

export type MatchCheck = {
  id: string;
  label: string;
  status: "met" | "action" | "missing" | "unknown";
  detail: string;
  sourceIds: string[];
};

export type ProgramMatch = {
  program: AdmissionProgram;
  status: MatchStatus;
  summary: string;
  checks: MatchCheck[];
  requiredDocuments: ApplicationDocument[];
  nextActions: string[];
  entranceRoute: "waived" | "exam" | "needs-information";
  canBuildRoute: boolean;
  evaluatedOn: string;
};
