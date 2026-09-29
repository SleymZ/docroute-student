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
  proof: "none" | "school" | "certificate";
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
  "destination-residence",
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
  | "scio-math-60"
  | "scio-general-70"
  | "ccna"
  | "fri-course"
  | "olympiad";

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
    | "waiver-claim"
    | "entrance-exam";
  due: "application" | "admission-day" | "enrolment";
  sourceIds: string[];
};

export type AdmissionRequirement = {
  id: string;
  title: string;
  description: string;
  sourceIds: string[];
};

export type AdmissionProgram = {
  id: string;
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
    feeEur: number;
    applicationUrl: string;
  };
  languagePolicy: {
    generalStatement: string;
    foreignApplicantTest: {
      languageCode: "sk";
      minimumLevel: "B1";
      exemptCitizenshipCountryCodes: string[];
      deadline: string;
      note: string;
    };
  };
  documents: ApplicationDocument[];
  minimumRequirements: AdmissionRequirement[];
  sources: OfficialSource[];
  verifiedAt: string;
};

export type MatchStatus =
  | "strong"
  | "conditional"
  | "preparation-required"
  | "more-information";

export type MatchCheck = {
  id: string;
  label: string;
  status: "met" | "action" | "missing";
  detail: string;
};

export type ProgramMatch = {
  program: AdmissionProgram;
  status: MatchStatus;
  summary: string;
  checks: MatchCheck[];
  requiredDocuments: ApplicationDocument[];
  nextActions: string[];
  entranceRoute: "waived" | "exam" | "needs-information";
};
