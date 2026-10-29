import type { AdmissionProgram } from "@/types/admission";

const admissionsPage =
  "https://www.fri.uniza.sk/stranka/podmienky-prijatia";

const admissionsRules =
  "https://www.fri.uniza.sk/storage/articles/1783775345-Zasady_a_pravidla_prijimacieho_konania_na_studium_na_FRI_UNIZA_pre_1._stupen_-_akademicky_rok_2027_2028.pdf";

const applicationUrl =
  "https://vzdelavanie.uniza.sk/prijimacky/index.php";

const sharedProgram = {
  admissionPolicy: "uniza-fri-bachelor-2027",
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
      exemptCountryCodes: ["SK", "CZ"],
      deadline: "2027-06-03",
      note:
        "Only a previously passed Slovak test administered by UNIZA's Institute of Lifelong Learning, at B1 or higher with grade A, B or C, is explicitly recognised by these rules. A school record or an unrelated certificate is not an automatic exemption.",
    },
  },
  documents: [
    {
      id: "graduation-certificate-later",
      title: "Final secondary-school graduation certificate",
      description:
        "If you are graduating this school year, provide your final graduation certificate by enrolment. A waiver does not remove this requirement.",
      appliesWhen: "graduating-this-year" as const,
      due: "enrolment" as const,
      sourceIds: ["fri-rules-2027"],
    },
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
      title: "Identity document for the entrance exam",
      description:
        "Bring an identity document and the graduation certificate to the entrance exam; the certificate can be supplied by enrolment if it is not yet available.",
      appliesWhen: "entrance-exam" as const,
      due: "admission-day" as const,
      sourceIds: ["fri-rules-2027"],
    },
    {
      id: "uniza-language-result",
      title: "UNIZA Slovak language test result",
      description:
        "For foreign applicants other than Czech applicants: pass the UNIZA Slovak test at B1 or higher with grade A, B or C by 3 June 2027. An earlier qualifying UNIZA test is recognised; the test may be taken only once in the admission calendar year.",
      appliesWhen: "foreign-language-test" as const,
      due: "admission-day" as const,
      sourceIds: ["fri-rules-2027"],
    },
  ],
  minimumRequirements: [
    {
      id: "waiver-thresholds",
      title: "Published exam-waiver thresholds",
      description:
        "One qualifying route is enough: external mathematics maturita or SCIO Mathematics percentile 60+, SCIO general aptitude percentile 70+, penultimate-year average at most 1.70, CCNA or higher, or a completed FRI specialist course with an average at most 2.00. Competition routes have specific subject, round and result conditions; a generic participation certificate is not enough.",
      sourceIds: ["fri-rules-2027"],
    },
    {
      id: "exam-ranking",
      title: "Exam admission is capacity-ranked",
      description:
        "The mathematics and logical-thinking test lasts 120 minutes and awards up to 50 points. Admission is ranked by results up to the faculty's capacity; the rules do not promise admission for a fixed minimum score.",
      sourceIds: ["fri-rules-2027"],
    },
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
      checkedAt: "2026-10-19",
    },
    {
      id: "fri-admissions-page",
      title: "Admission requirements",
      publisher:
        "Faculty of Management Science and Informatics, University of Žilina",
      url: admissionsPage,
      checkedAt: "2026-10-19",
    },
  ],
  verifiedAt: "2026-10-19",
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

const mffRules =
  "https://www.mff.cuni.cz/cs/uchazeci/prijimaci-rizeni/prijimaci-rizeni-ke-studiu-bakalarskych-programu/2027-2028";
const mffPrograms =
  "https://www.mff.cuni.cz/cs/uchazeci/bakalarske-studium/programy-bakalarskeho-studia";
const cuniConditions =
  "https://is.cuni.cz/studium/prijimacky/index.php?do=info_fakulta&fak=11320";

// Charles University, Faculty of Mathematics and Physics: Czech-taught
// bachelor's programme Informatika, 2027/28 (checked 2026-10-28). Own
// matching policy: never reuse UNIZA thresholds here, or these for UNIZA.
const charlesMffInformatics: AdmissionProgram = {
  id: "cuni-mff-informatics-bsc-2027",
  admissionPolicy: "cuni-mff-bachelor-2027",
  universityId: "82010c9cd5813db075bc",
  universityHost: "cuni.cz",
  universityName: "Charles University",
  faculty: "Faculty of Mathematics and Physics",
  country: "Czechia",
  countryCode: "CZ",
  city: "Prague",
  category: "Computer Science",
  programName: "Computer Science",
  localProgramName: "Informatika",
  degreeLevel: "bachelor",
  intake: "2027/28",
  durationYears: 3,
  studyMode: "full-time",
  instructionLanguages: [{ code: "cs", name: "Czech" }],
  application: {
    deadline: "2027-03-31",
    admissionDate: "2027-06-07",
    feeLabel: "CZK 1,000",
    applicationUrl: "https://is.cuni.cz/studium/prihlaska/",
  },
  languagePolicy: {
    generalStatement:
      "The programme is taught in Czech. Applicants without a Czech or Slovak maturita must prove sufficient Czech: two years of full-time study at a Czech or Slovak school taught in that language, a Czech B2/C1 exam at ÚJOP UK, or a state language exam or Czech/Slovak exam at B2–C2.",
  },
  documents: [
    {
      id: "mff-e-application",
      title: "Electronic application in the Charles University system",
      description:
        "Submit one electronic application for Informatika by 31 March 2027. Each programme needs its own application.",
      appliesWhen: "always",
      due: "application",
      sourceIds: ["mff-rules-2027"],
    },
    {
      id: "mff-fee",
      title: "Application fee CZK 1,000",
      description:
        "The non-refundable fee is due on the third day after the application deadline.",
      appliesWhen: "always",
      due: "application",
      sourceIds: ["mff-rules-2027", "cuni-conditions-2027"],
    },
    {
      id: "mff-waiver-request",
      title: "Request a waiver of the entrance exam",
      description:
        "After the application is registered, request the waiver in the e-application (Žádosti – Upuštění od přijímací zkoušky) with a digitally signed confirmation or an authorised conversion of the proof. Deadlines: 5 April 2027 (maths average), 30 April 2027 (olympiads, seminars, AP), 23–24 May 2027 (maturita results; the page gives both dates, so use 23 May).",
      appliesWhen: "waiver-claim",
      due: "application",
      sourceIds: ["mff-rules-2027"],
    },
    {
      id: "mff-exam",
      title: "Written entrance exam",
      description:
        "10 tasks in 75 minutes on logical thinking, precise expression and secondary-school mathematics, up to 100 points. At least 40 points means the exam is passed. Regular date 7 June 2027, substitute date 22 June 2027 on request.",
      appliesWhen: "entrance-exam",
      due: "admission-day",
      sourceIds: ["mff-rules-2027"],
    },
    {
      id: "mff-czech-proof",
      title: "Proof of Czech",
      description:
        "Without a Czech or Slovak maturita: send a certified proof of Czech (two years at a Czech or Slovak school, ÚJOP UK B2/C1, or a state or Czech/Slovak exam at B2–C2) by post, preferably by 31 July 2027.",
      appliesWhen: "foreign-language-test",
      due: "enrolment",
      sourceIds: ["mff-rules-2027"],
    },
    {
      id: "mff-maturita",
      title: "Certified copy of the maturita certificate",
      description:
        "Send a certified paper copy to the Study Department. The page gives 31 July 2027 in one section and 30 September 2027 in another (22 October 2027 for an autumn exam or a foreign school), so plan for 31 July. Without it you are not admitted or invited to enrol.",
      appliesWhen: "always",
      due: "enrolment",
      sourceIds: ["mff-rules-2027"],
    },
    {
      id: "mff-foreign-recognition",
      title: "Recognition of foreign secondary education",
      description:
        "Slovak, Polish, Hungarian and Slovenian maturita certificates are automatically equivalent. Other foreign certificates need nostrifikace, an IB or European Baccalaureate diploma, or an assessment by the faculty (free of charge).",
      appliesWhen: "foreign-education",
      due: "enrolment",
      sourceIds: ["mff-rules-2027"],
    },
  ],
  minimumRequirements: [
    {
      id: "mff-admission-rule",
      title: "Everyone who meets the conditions is admitted",
      description:
        "Applicants who pass the entrance exam (at least 40 of 100 points) or receive a waiver, and who prove completed secondary education, are admitted. The page gives no capacity limit.",
      sourceIds: ["mff-rules-2027"],
    },
    {
      id: "mff-waivers",
      title: "Published exam-waiver grounds",
      description:
        "Maturita in 2025/26 or 2026/27 with a maths average of at most 1.5 (Czech, Slovak or European school); listed olympiad results; an MFF correspondence seminar certificate; Czech maturita plus Matematika rozšiřující 68%+; Slovak maturita with 75%+ in the external maths test; AP Calculus or Physics 1/2 with 4 or 5; third place in České hlavičky. Only for applicants who have not studied at MFF before.",
      sourceIds: ["mff-rules-2027"],
    },
    {
      id: "mff-language",
      title: "Czech",
      description:
        "Czech-taught programme. A Czech or Slovak maturita covers the language requirement; otherwise prove Czech at B2 or higher.",
      sourceIds: ["mff-rules-2027"],
    },
    {
      id: "mff-specialisations",
      title: "Six specialisations from year 2",
      description:
        "A shared first year, then a choice of six specialisations (programming and software development, systems programming, databases and web, computer graphics and vision, general computer science, artificial intelligence) by the end of year 2.",
      sourceIds: ["mff-programmes-2027"],
    },
  ],
  sources: [
    {
      id: "mff-rules-2027",
      title: "Admission to bachelor's programmes (2027/2028)",
      publisher: "Faculty of Mathematics and Physics, Charles University",
      url: mffRules,
      checkedAt: "2026-10-28",
    },
    {
      id: "mff-programmes-2027",
      title: "Bachelor's programmes opened for 2027/2028",
      publisher: "Faculty of Mathematics and Physics, Charles University",
      url: mffPrograms,
      checkedAt: "2026-10-28",
    },
    {
      id: "cuni-conditions-2027",
      title: "General and faculty admission conditions (Informatika, 3 years, Czech)",
      publisher: "Charles University information system",
      url: cuniConditions,
      checkedAt: "2026-10-28",
    },
  ],
  verifiedAt: "2026-10-28",
};

const cvutConditions =
  "https://fit.cvut.cz/uchazeci/podminky-pririz/bi-podminky-prijimaci-rizeni-2027.pdf";
const cvutAdmissionPage =
  "https://fit.cvut.cz/cs/uchazeci/prijimaci-rizeni-2/bakalarsky-studijni-program";
const cvutProgrammes = "https://bk.fit.cvut.cz/cz/";

// Czech Technical University in Prague, Faculty of Information Technology:
// Czech-taught bachelor's programme Informatika (B0613A140029), 2027/28
// (checked 2026-10-29). Own matching policy "cvut-fit-bachelor-2027":
// never reuse MFF or UNIZA thresholds here, or these elsewhere.
const cvutFitInformatics: AdmissionProgram = {
  id: "cvut-fit-informatics-bsc-2027",
  admissionPolicy: "cvut-fit-bachelor-2027",
  universityId: "24f0a35fafd60166dbae",
  universityHost: "cvut.cz",
  universityName: "Czech Technical University in Prague",
  faculty: "Faculty of Information Technology (FIT ČVUT)",
  country: "Czechia",
  countryCode: "CZ",
  city: "Prague",
  category: "Computer Science",
  programName: "Informatics",
  localProgramName: "Informatika",
  degreeLevel: "bachelor",
  intake: "2027/28",
  durationYears: 3,
  studyMode: "full-time",
  instructionLanguages: [{ code: "cs", name: "Czech" }],
  application: {
    deadline: "2027-03-31",
    admissionDate: "2027-06-01",
    feeLabel: "CZK 1,050",
    applicationUrl: "https://prihlaska.cvut.cz/",
  },
  languagePolicy: {
    generalStatement:
      "The programme is taught in Czech. Applicants who are not Czech or Slovak citizens and did not graduate from a Czech- or Slovak-language programme must send a certified copy of a Czech exam at B2 or higher, unless they meet the SCIO OSP waiver condition (90th percentile).",
  },
  documents: [
    {
      id: "cvut-e-application",
      title: "Online application at prihlaska.cvut.cz",
      description:
        "Fill in the application for Informatika between 1 January and 31 March 2027. Waiver proof, the maturita certificate and other documents can be uploaded later.",
      appliesWhen: "always",
      due: "application",
      sourceIds: ["cvut-fit-conditions-2027", "cvut-fit-page-2027"],
    },
    {
      id: "cvut-fee",
      title: "Application fee CZK 1,050",
      description:
        "Pay by 31 March 2027 (the payment gateway in the application works). The fee is not refunded.",
      appliesWhen: "always",
      due: "application",
      sourceIds: ["cvut-fit-conditions-2027"],
    },
    {
      id: "cvut-waiver-request",
      title: "Request the exam waiver with proof",
      description:
        "Upload the waiver request and proof to the application by 24 May 2027. Documents sent later are not considered, and the faculty may check them with the issuer.",
      appliesWhen: "waiver-claim",
      due: "application",
      sourceIds: ["cvut-fit-conditions-2027"],
    },
    {
      id: "cvut-exam",
      title: "Written maths test",
      description:
        "1 or 2 June 2027 at FIT, Thákurova 9, Prague 6 (your date is shown in the application): 90 minutes, multiple choice, 0–100 points; bring an ID or passport, no calculators or electronics. If you cannot come, email an excuse to prihlasky@fit.cvut.cz by 7 June 2027 for the make-up date on 9 June 2027.",
      appliesWhen: "entrance-exam",
      due: "admission-day",
      sourceIds: ["cvut-fit-conditions-2027", "cvut-fit-page-2027"],
    },
    {
      id: "cvut-czech-proof",
      title: "Certified copy of a Czech exam at B2 or higher",
      description:
        "Needed if you are not a Czech or Slovak citizen, did not graduate in Czech or Slovak and do not use the SCIO OSP 90th-percentile ground. Send it by the document deadline for your enrolment day (16 June, 30 July or 13 September 2027).",
      appliesWhen: "foreign-language-test",
      due: "enrolment",
      sourceIds: ["cvut-fit-conditions-2027"],
    },
    {
      id: "cvut-maturita",
      title: "Maturita certificate",
      description:
        "Upload a file with an authorised-conversion clause to the application, or bring or post a certified copy to the Study Department, by 16 June, 30 July or 13 September 2027 for enrolment on 22 June, 3 August or 15 September 2027.",
      appliesWhen: "always",
      due: "enrolment",
      sourceIds: ["cvut-fit-conditions-2027", "cvut-fit-page-2027"],
    },
    {
      id: "cvut-foreign-recognition",
      title: "Nostrifikace or ČVUT assessment of your school certificate",
      description:
        "A school outside Czechia and Slovakia needs a certified copy of the nostrifikace, or a ČVUT document recognising the education issued in the admission procedure (procedure and fee on cvut.cz). Same document deadlines as the maturita certificate.",
      appliesWhen: "foreign-education",
      due: "enrolment",
      sourceIds: ["cvut-fit-conditions-2027"],
    },
    {
      id: "cvut-online-enrolment",
      title: "Confirm enrolment online",
      description:
        "After admission, press “On-line zápis do studia” in the application at least one day before your enrolment day. Enrolment is electronic; you do not have to come in person.",
      appliesWhen: "always",
      due: "enrolment",
      sourceIds: ["cvut-fit-conditions-2027"],
    },
  ],
  minimumRequirements: [
    {
      id: "cvut-admission-rule",
      title: "70 points guarantee admission",
      description:
        "At least 70 of 100 points in the maths test means admission. Remaining places go to applicants ranked by test points, so the threshold can be lower; the application shows it. Planned maximum: 1,100 full-time students (actual capacity usually lower).",
      sourceIds: ["cvut-fit-conditions-2027"],
    },
    {
      id: "cvut-waivers",
      title: "Published exam-waiver grounds",
      description:
        "CERMAT Matematika rozšiřující 75%+ (maturita 2025/26 or 2026/27); SCIO Mathematics or OSP at the 90th percentile+ (listed dates, Czech or Slovak version); Mensa IQ 130+; FIKS winner in the last 4 years; national round or regional nomination in the maths, informatics or physics olympiad, SOČ or a comparable contest in the last 3 years. CERMAT, FIKS and competitions count only for a first study at the faculty.",
      sourceIds: ["cvut-fit-conditions-2027"],
    },
    {
      id: "cvut-language",
      title: "Czech",
      description:
        "Czech or Slovak citizens and graduates of Czech- or Slovak-language schools need no proof. Others: Czech B2 certificate, or the SCIO OSP 90th-percentile result.",
      sourceIds: ["cvut-fit-conditions-2027"],
    },
    {
      id: "cvut-school",
      title: "Slovak school = Czech school",
      description:
        "A Slovak maturita is treated like a Czech one (no nostrifikace). Schools elsewhere need nostrifikace or a ČVUT assessment.",
      sourceIds: ["cvut-fit-conditions-2027"],
    },
  ],
  sources: [
    {
      id: "cvut-fit-conditions-2027",
      title: "Conditions for admission to the bachelor programme Informatika, 2027/2028",
      publisher: "Faculty of Information Technology, Czech Technical University in Prague",
      url: cvutConditions,
      checkedAt: "2026-10-29",
    },
    {
      id: "cvut-fit-page-2027",
      title: "Admission procedure 2027: bachelor study programme",
      publisher: "Faculty of Information Technology, Czech Technical University in Prague",
      url: cvutAdmissionPage,
      checkedAt: "2026-10-29",
    },
    {
      id: "cvut-fit-programmes",
      title: "Study programmes (Informatika, bachelor, 3 years)",
      publisher: "Faculty of Information Technology, Czech Technical University in Prague",
      url: cvutProgrammes,
      checkedAt: "2026-10-29",
    },
  ],
  verifiedAt: "2026-10-29",
};

export const verifiedPrograms: readonly AdmissionProgram[] = [
  ...programs.map((program) => ({
    ...sharedProgram,
    ...program,
  })),
  charlesMffInformatics,
  cvutFitInformatics,
];

export type VerifiedProgram = AdmissionProgram;

export function findVerifiedProgram(programId: string | null) {
  if (!programId) {
    return null;
  }

  return (
    verifiedPrograms.find((program) => program.id === programId) ?? null
  );
}
