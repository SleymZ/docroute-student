import type { AdmissionProgram } from "@/types/admission";

const admissionsPage =
  "https://www.fri.uniza.sk/stranka/podmienky-prijatia";

const admissionsRules =
  "https://www.fri.uniza.sk/storage/articles/1783775345-Zasady_a_pravidla_prijimacieho_konania_na_studium_na_FRI_UNIZA_pre_1._stupen_-_akademicky_rok_2027_2028.pdf";

const applicationUrl =
  "https://vzdelavanie.uniza.sk/prijimacky/index.php";

const sharedProgram = {
  universityId: "b8b5a2e3a15148e5b4a1",
  universityHost: "uniza.sk",
  universityName: "University of Žilina",
  faculty: "Faculty of Management Science and Informatics",
  country: "Slovakia",
  countryCode: "SK",
  city: "Žilina",
  category: "Computer Science",
  degreeLevel: "bachelor" as const,
  intake: "2027/28" as const,
  durationYears: 3,
  studyMode: "full-time" as const,
  instructionLanguages: [
    {
      code: "sk",
      name: "Slovak",
    },
  ],
  application: {
    deadline: "2027-03-31",
    admissionDate: "2027-06-03",
    feeEur: 20,
    applicationUrl,
  },
  languagePolicy: {
    generalStatement:
      "Applicants need written and spoken Slovak or Czech. Foreign applicants, except applicants from the Czech Republic, must pass the UNIZA Slovak language test at B1 or higher.",
    foreignApplicantTest: {
      languageCode: "sk" as const,
      minimumLevel: "B1" as const,
      exemptCitizenshipCountryCodes: ["SK", "CZ"],
      deadline: "2027-06-03",
      note:
        "The university may recognise an already completed Slovak language test; final acceptance must be confirmed by UNIZA.",
    },
  },
  documents: [
    {
      id: "signed-application",
      title: "Signed electronic application",
      description:
        "Complete the electronic application, sign it, and upload the scanned or photographed copy in the application system.",
      appliesWhen: "always" as const,
      due: "application" as const,
      sourceIds: ["fri-admissions-page"],
    },
    {
      id: "fee-proof",
      title: "Proof of the €20 application fee",
      description:
        "Attach confirmation that the faculty application fee has been paid.",
      appliesWhen: "always" as const,
      due: "application" as const,
      sourceIds: ["fri-rules-2027"],
    },
    {
      id: "penultimate-report",
      title: "Penultimate-year school report",
      description:
        "Attach the end-of-year report from the year before your final secondary-school year.",
      appliesWhen: "always" as const,
      due: "application" as const,
      sourceIds: ["fri-rules-2027"],
    },
    {
      id: "graduation-certificate",
      title: "Secondary-school graduation certificate",
      description:
        "Required with the application if you graduated before the current school year; otherwise it must be presented by enrolment.",
      appliesWhen: "graduated-earlier" as const,
      due: "application" as const,
      sourceIds: ["fri-rules-2027"],
    },
    {
      id: "recognition-decision",
      title: "Recognition of foreign secondary education",
      description:
        "Applicants educated outside Slovakia must obtain a Slovak decision recognising their secondary-school qualification, no later than enrolment.",
      appliesWhen: "foreign-education" as const,
      due: "enrolment" as const,
      sourceIds: ["fri-rules-2027"],
    },
    {
      id: "waiver-evidence",
      title: "Evidence for entrance-exam waiver",
      description:
        "Attach the certificate, result, school report, or competition evidence used to claim admission without the entrance exam.",
      appliesWhen: "waiver-claim" as const,
      due: "application" as const,
      sourceIds: ["fri-rules-2027"],
    },
    {
      id: "exam-identity-and-certificate",
      title: "ID and graduation certificate for the entrance exam",
      description:
        "Bring an identity document and the graduation certificate to the entrance exam; the certificate can be supplied by enrolment if it is not yet available.",
      appliesWhen: "entrance-exam" as const,
      due: "admission-day" as const,
      sourceIds: ["fri-rules-2027"],
    },
  ],
  minimumRequirements: [
    {
      id: "secondary-education",
      title: "Completed secondary education",
      description:
        "A complete general or vocational secondary education equivalent to the Slovak maturita is required.",
      sourceIds: ["fri-rules-2027"],
    },
    {
      id: "language",
      title: "Slovak or Czech proficiency",
      description:
        "Written and spoken Slovak or Czech is required. Most foreign applicants must additionally pass the UNIZA Slovak B1 test by 3 June 2027.",
      sourceIds: ["fri-rules-2027"],
    },
    {
      id: "admission-route",
      title: "Waiver evidence or entrance exam",
      description:
        "Applicants who do not meet a published waiver condition take a 120-minute mathematics and logical-thinking test.",
      sourceIds: ["fri-rules-2027"],
    },
    {
      id: "computer-literacy",
      title: "Basic computer literacy",
      description:
        "Basic computer literacy is expected at enrolment.",
      sourceIds: ["fri-rules-2027"],
    },
  ],
  sources: [
    {
      id: "fri-rules-2027",
      title:
        "Admission rules for first-cycle study, academic year 2027/2028",
      publisher:
        "Faculty of Management Science and Informatics, University of Žilina",
      url: admissionsRules,
      checkedAt: "2026-09-27",
    },
    {
      id: "fri-admissions-page",
      title: "Admission requirements",
      publisher:
        "Faculty of Management Science and Informatics, University of Žilina",
      url: admissionsPage,
      checkedAt: "2026-09-27",
    },
  ],
  verifiedAt: "2026-09-27",
};

const programs = [
  {
    id: "uniza-fri-informatics-bsc-2027",
    programName: "Informatics",
    localProgramName: "Informatika",
  },
  {
    id: "uniza-fri-informatics-management-bsc-2027",
    programName: "Informatics and Management",
    localProgramName: "Informatika a riadenie",
  },
  {
    id: "uniza-fri-network-technologies-bsc-2027",
    programName: "Information and Network Technologies",
    localProgramName: "Informačné a sieťové technológie",
  },
  {
    id: "uniza-fri-computer-engineering-bsc-2027",
    programName: "Computer Engineering",
    localProgramName: "Počítačové inžinierstvo",
  },
] as const;

export const verifiedPrograms: readonly AdmissionProgram[] = programs.map(
  (program) => ({
    ...sharedProgram,
    ...program,
  }),
);

export type VerifiedProgram = AdmissionProgram;

export function findVerifiedProgram(programId: string | null) {
  if (!programId) {
    return null;
  }

  return (
    verifiedPrograms.find((program) => program.id === programId) ?? null
  );
}