import type { AdmissionProgram, ApplicationDocument, GenericAdmissionRules, OfficialSource } from "@/types/admission";

// Medicine, law and economics programmes verified on 2026-11-05 from each
// faculty's own 2027/28 admission pages (owner's goal: ten verified
// programmes per field in the highlighted countries). Only Slovak and Czech
// programmes: the post-admission residence route exists for those two.
// Everything below restates the faculty's page; where a page does not state
// something (a Czech proof, a place count, a fee), the programme says so.

const CHECKED = "2026-11-05";

type Shared = Omit<
  AdmissionProgram,
  "id" | "programName" | "localProgramName" | "admissionPolicy" | "intake" | "studyMode" | "verifiedAt"
>;

type Item = { id: string; programName: string; localProgramName: string; patch?: Partial<AdmissionProgram> };

function programs(shared: Shared, items: Item[]): AdmissionProgram[] {
  return items.map((item) => ({
    ...shared,
    id: item.id,
    programName: item.programName,
    localProgramName: item.localProgramName,
    admissionPolicy: "generic-2027",
    intake: "2027/28",
    studyMode: "full-time",
    verifiedAt: CHECKED,
    ...item.patch,
  }));
}

function source(id: string, title: string, publisher: string, url: string): OfficialSource {
  return { id, title, publisher, url, checkedAt: CHECKED };
}

function doc(
  id: string,
  title: string,
  description: string,
  appliesWhen: ApplicationDocument["appliesWhen"],
  due: ApplicationDocument["due"],
  sourceIds: string[],
  dueLabel?: string,
): ApplicationDocument {
  return { id, title, description, appliesWhen, due, sourceIds, ...(dueLabel ? { dueLabel } : {}) };
}

const czech = [{ code: "cs", name: "Czech" }];
const slovak = [{ code: "sk", name: "Slovak" }];

// =============================================================== MEDICINE

// ------------------------------------------------- LF MU (Brno, Czech)

const muniLfSources = [
  source("muni-lf-conditions-2027", "Admission conditions for academic year 2027/2028", "Faculty of Medicine, Masaryk University", "https://www.med.muni.cz/chci-studovat/podminky-prijimaciho-rizeni"),
];

const muniLfRules: GenericAdmissionRules = {
  language: null,
  languageUnknownNote:
    "The faculty's 2027/28 conditions do not state a Czech proof for applicants from abroad. The programme and the entrance tests are in Czech; ask the faculty.",
  recognition: {
    exemptSchools: ["CZ"],
    text: "With a school certificate from abroad, upload the official Czech recognition (nostrifikace) in the e-application by the deadline in your admission proposal; without it you are not admitted.",
    sourceIds: ["muni-lf-conditions-2027"],
  },
  entrance: {
    label: "Written specialised tests",
    dueLabel: "9 or 10 June 2027 (your choice; no make-up date)",
    text: "Written tests from biology, chemistry, physics and somatology (the combination for each programme is in the conditions' Table 3): 40 questions in 50 minutes each, one point per correct answer, no negative marking. Ranked by total points. Choose 9 or 10 June 2027 in the e-application; there is no make-up date. Applying to both General Medicine and Dentistry, you sit the test once.",
    sourceIds: ["muni-lf-conditions-2027"],
  },
};

const muniLf = programs(
  {
    universityId: "1def63b3ac858b190c04",
    universityHost: "muni.cz",
    universityName: "Masaryk University",
    faculty: "Faculty of Medicine (LF MU)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Brno",
    category: "Medicine",
    degreeLevel: "bachelor",
    programType: "long-cycle",
    durationYears: 6,
    instructionLanguages: czech,
    application: {
      deadline: "2027-02-28",
      admissionDate: "2027-06-09",
      feeLabel: "CZK 900 per e-application (not refunded)",
      applicationUrl: "https://is.muni.cz/prihlaska/",
      waiverEvidenceDueLabel: "Bonus and excellent-grades requests by 28 February 2027",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. The 2027/28 conditions do not state a Czech proof for applicants from abroad.",
    },
    documents: [
      doc("muni-lf-application", "E-application and CZK 900 fee by 28 February 2027", "One programme per e-application at is.muni.cz/prihlaska, 1 November 2026 – 28 February 2027. Pay CZK 900 by card, transfer or QR code by 28 February 2027; it is not refunded.", "always", "application", ["muni-lf-conditions-2027"]),
      doc("muni-lf-exam", "Written entrance tests", "Choose 9 or 10 June 2027 in the e-application; no make-up date. Requests for exam adjustments go in the e-application by 28 February 2027.", "entrance-exam", "admission-day", ["muni-lf-conditions-2027"], "9 or 10 June 2027"),
      doc("muni-lf-maturita", "Maturita certificate", "Upload a certified conversion of the paper certificate or a qualified e-signed original. You must pass the maturita before enrolment.", "always", "enrolment", ["muni-lf-conditions-2027"]),
      doc("muni-lf-recognition", "Czech recognition of a school certificate from abroad", "Upload the official nostrifikace by the deadline in your admission proposal.", "foreign-education", "enrolment", ["muni-lf-conditions-2027"], "By the date in your admission proposal"),
    ],
    minimumRequirements: [
      { id: "muni-lf-ranking", title: "Ranking by test points", description: "Applicants are ranked by their total test points; everyone tied at the cut-off is admitted. The planned places are in the conditions' Table 1 (not restated in the text). Further rounds may follow if places stay empty.", sourceIds: ["muni-lf-conditions-2027"] },
    ],
    sources: muniLfSources,
    genericRules: muniLfRules,
  },
  [
    { id: "muni-lf-medicine-mudr-2027", programName: "General Medicine", localProgramName: "Všeobecné lékařství" },
    {
      id: "muni-lf-dentistry-mddr-2027",
      programName: "Dentistry",
      localProgramName: "Zubní lékařství",
      patch: { durationYears: 5 },
    },
  ],
);

// The two programmes share every document; General Medicine adds the exam
// waiver routes, Dentistry only bonus points.
{
  const shared = muniLf[1].documents;
  muniLf[0].documents = [
    ...shared,
    doc("muni-lf-bonus-waiver", "Bonus points or admission without the exam", "Claim bonuses in the e-application by 28 February 2027 (C1+ certificate in English, German, French or Spanish; competition and exam bonuses only with a Czech or Slovak school; within 2 years of the maturita). 10+ bonus points waive the exam. Grade route: final-year students of a Czech school with an average of 1.100 or better and biology, chemistry and physics no worse than 2; tick the request by 28 February 2027.", "waiver-claim", "application", ["muni-lf-conditions-2027"], "By 28 February 2027"),
  ];
  muniLf[0].minimumRequirements = [
    ...muniLf[0].minimumRequirements,
    { id: "muni-lf-grade-route", title: "Admission without the exam (General Medicine only)", description: "At most 30% of the capacity (130 enrolled students) through the excellent-grades route; applicants not admitted that way sit the exam with 3 bonus points.", sourceIds: ["muni-lf-conditions-2027"] },
  ];
  muniLf[1].documents = [
    ...shared,
    doc("muni-lf-bonus", "Bonus points", "Claim bonuses in the e-application by 28 February 2027 (C1+ language certificates; competition and exam bonuses only with a Czech or Slovak school). The exam waiver and the excellent-grades route are for General Medicine only.", "waiver-claim", "application", ["muni-lf-conditions-2027"], "By 28 February 2027"),
  ];
}

// ---------------------------------- LF UK in Hradec Králové (Czech)

const lfhkSources = [
  source("lfhk-admission-2027", "Admission procedure (2027 intake)", "Faculty of Medicine in Hradec Králové, Charles University", "https://www.lfhk.cuni.cz/LFHK-296.html"),
  source("lfhk-sis-2027", "Faculty of Medicine in Hradec Králové: admission information", "Charles University (Student Information System)", "https://is.cuni.cz/studium/prijimacky/index.php?do=info_fakulta&fak=11150"),
];

const lfhk = programs(
  {
    universityId: "82010c9cd5813db075bc",
    universityHost: "cuni.cz",
    universityName: "Charles University",
    faculty: "Faculty of Medicine in Hradec Králové",
    country: "Czechia",
    countryCode: "CZ",
    city: "Hradec Králové",
    category: "Medicine",
    degreeLevel: "bachelor",
    programType: "long-cycle",
    durationYears: 6,
    instructionLanguages: czech,
    application: {
      deadline: "2027-02-28",
      admissionDate: "2027-06-16",
      feeLabel: "CZK 1,000",
      applicationUrl: "https://is.cuni.cz/studium/prijimacky/",
      languageProofDueLabel: "A condition of admission",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. Applicants without a maturita in Czech or Slovak show a Czech C1 certificate.",
    },
    documents: [
      doc("lfhk-application", "E-application and CZK 1,000 fee by 28 February 2027", "Apply electronically and pay CZK 1,000 by the last day of the application period (ČSOB 198592792/0300, variable symbol = e-application number, specific symbol 83001).", "always", "application", ["lfhk-admission-2027"]),
      doc("lfhk-exam", "Written entrance test", "One written test on 16 June 2027 for everyone; invitations at least 20 days before.", "entrance-exam", "admission-day", ["lfhk-admission-2027"], "16 June 2027"),
      doc("lfhk-czech-c1", "Czech certificate at C1", "Without a maturita in Czech or Slovak: a Czech C1 certificate from a provider the faculty lists (compulsory schooling with Czech as a subject exempts you).", "foreign-language-test", "enrolment", ["lfhk-admission-2027"]),
      doc("lfhk-recognition", "Proof of secondary education from abroad", "Nostrifikace, an EB or IB diploma, or the faculty's assessment (CZK 1,050). Send the documents by post to the faculty (Zborovská 2207, 500 03 Hradec Králové).", "foreign-education", "enrolment", ["lfhk-admission-2027", "lfhk-sis-2027"]),
      doc("lfhk-enrolment", "Enrolment documents", "Medical certificate of fitness for study (decree 271/2012) and proof of hepatitis B vaccination (or that it has started).", "always", "enrolment", ["lfhk-admission-2027"]),
    ],
    minimumRequirements: [
      { id: "lfhk-ranking", title: "Ranking by test points", description: "Each subject is ranked, and the four rankings are added up. Places 1–340 are admitted to General Medicine and 1–45 to Dentistry; ties with the last place get the same result. No exam waivers or bonus points are mentioned.", sourceIds: ["lfhk-admission-2027"] },
    ],
    sources: lfhkSources,
    genericRules: {
      language: {
        code: "cs",
        name: "Czech",
        minimumLevel: "C1",
        exemptCitizenships: [],
        exemptSchools: ["CZ", "SK"],
        proof: "Without a maturita in Czech or Slovak, show a Czech C1 certificate from a provider the faculty lists. Compulsory schooling with Czech as a subject also exempts you: tell the faculty.",
        sourceIds: ["lfhk-admission-2027"],
      },
      recognition: {
        exemptSchools: ["CZ", "SK", "PL", "HU", "SI"],
        text: "A Slovak, Polish, Hungarian or Slovenian maturita counts automatically; an EB or IB diploma is accepted. Others: nostrifikace, or the faculty's assessment for CZK 1,050. Post the documents to the faculty.",
        sourceIds: ["lfhk-admission-2027", "lfhk-sis-2027"],
      },
      entrance: {
        label: "Written test: biology, somatology, physics, chemistry",
        dueLabel: "16 June 2027",
        text: "One test on 16 June 2027, the same for General Medicine and Dentistry: 20 questions per subject, 120 minutes, +1 for a correct answer and −0.25 for a wrong one (80 points at most).",
        sourceIds: ["lfhk-admission-2027", "lfhk-sis-2027"],
      },
    },
  },
  [
    { id: "lfhk-medicine-mudr-2027", programName: "General Medicine", localProgramName: "Všeobecné lékařství" },
    { id: "lfhk-dentistry-mddr-2027", programName: "Dentistry", localProgramName: "Zubní lékařství", patch: { durationYears: 5 } },
  ],
);

// ------------------------------------------------- LF UP (Olomouc, Czech)

const upolLfSources = [
  source("upol-lf-board-2027", "Official notice board: admission for academic year 2027/2028", "Faculty of Medicine and Dentistry, Palacký University Olomouc", "https://www.lf.upol.cz/uredni-deska/"),
];

const upolLf = programs(
  {
    universityId: "c1127a53d31998aee60b",
    universityHost: "upol.cz",
    universityName: "Palacký University Olomouc",
    faculty: "Faculty of Medicine and Dentistry",
    country: "Czechia",
    countryCode: "CZ",
    city: "Olomouc",
    category: "Medicine",
    degreeLevel: "bachelor",
    programType: "long-cycle",
    durationYears: 6,
    instructionLanguages: czech,
    application: {
      deadline: "2027-03-15",
      admissionDate: "2027-06-08",
      feeLabel: "CZK 790 per programme (paid by card in the e-application; not refunded)",
      applicationUrl: "https://prihlaska.upol.cz/",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. The 2027/28 announcement does not state a Czech proof for applicants from abroad.",
    },
    documents: [
      doc("upol-lf-application", "E-application and CZK 790 fee by 15 March 2027", "1 November 2026 – 15 March 2027; only complete applications are registered. One application and fee per programme.", "always", "application", ["upol-lf-board-2027"]),
      doc("upol-lf-exam", "Written test", "8 June 2027; the invitation appears in the e-application ('Písemnosti') from the week of 10 May 2027. No other date.", "entrance-exam", "admission-day", ["upol-lf-board-2027"], "8 June 2027"),
      doc("upol-lf-recognition", "Recognition of a school certificate from abroad", "A certificate from abroad needs recognition in the Czech Republic before enrolment.", "foreign-education", "enrolment", ["upol-lf-board-2027"]),
      doc("upol-lf-enrolment", "Enrolment documents", "Certified copy of the maturita certificate, the health form confirmed by a GP, two passport photos and proof of hepatitis B vaccination.", "always", "enrolment", ["upol-lf-board-2027"]),
    ],
    minimumRequirements: [
      { id: "upol-lf-test", title: "Written test", description: "The announcement describes the test but gives no pass mark or place count. Appeals within 15 days of notification; the procedure is expected to close in early September 2027.", sourceIds: ["upol-lf-board-2027"] },
    ],
    sources: upolLfSources,
    genericRules: {
      language: null,
      languageUnknownNote:
        "The faculty's 2027/28 announcement does not state a Czech proof for applicants from abroad. The programme and the test are in Czech; ask the faculty.",
      recognition: {
        exemptSchools: ["CZ"],
        text: "A school certificate from abroad must be recognised in the Czech Republic (the university's recognition page explains how).",
        sourceIds: ["upol-lf-board-2027"],
      },
      entrance: {
        label: "Written test: physics, chemistry and biology",
        dueLabel: "8 June 2027 (no other date)",
        text: "One written test on 8 June 2027, identical for General Medicine and Dentistry (applying to both, you sit it once); no alternative date.",
        sourceIds: ["upol-lf-board-2027"],
      },
    },
  },
  [
    { id: "upol-lf-medicine-mudr-2027", programName: "General Medicine", localProgramName: "Všeobecné lékařství" },
    { id: "upol-lf-dentistry-mddr-2027", programName: "Dentistry", localProgramName: "Zubní lékařství", patch: { durationYears: 5 } },
  ],
);

// ==================================================================== LAW

// ------------------------------------------------- PF UP (Olomouc, Czech)

const upolPfSources = [
  source("upol-pf-board-2027", "Official notice board: admission conditions for academic year 2027/2028", "Faculty of Law, Palacký University Olomouc", "https://www.pf.upol.cz/o-fakulte/uredni-deska/"),
  source("upol-pf-mgr-2027", "Master's study: admission information", "Faculty of Law, Palacký University Olomouc", "https://www.pf.upol.cz/studujte-u-nas/magisterske-studium/"),
  source("upol-pf-bc-2027", "Bachelor's study: admission information", "Faculty of Law, Palacký University Olomouc", "https://www.pf.upol.cz/studujte-u-nas/bakalarske-studium/"),
];

function upolPfRules(pageId: string, cutOff: string): GenericAdmissionRules {
  return {
    language: null,
    languageUnknownNote:
      "The faculty's 2027/28 pages do not state a Czech proof for applicants from abroad. The programme and the SCIO tests are in Czech; ask the faculty.",
    recognition: {
      exemptSchools: ["CZ", "SK"],
      text: "A school certificate from abroad goes through Palacký University's assessment of foreign education (Slovak certificates are outside it). Upload an authorised conversion of your maturita certificate by 15 June 2027.",
      sourceIds: [pageId],
    },
    entrance: {
      label: "SCIO NSZ: OSP and Basic Social Sciences",
      dueLabel: "December 2026 – May 2027; free mini test 22 May 2027",
      text: `Take OSP and ZSV (100 points each) between December 2026 and May 2027; the best result counts, and you must let SCIO send it to the faculty. Ranked by percentile up to the planned intake (2026/27: the last admitted applicant had ${cutOff}). Free OSP+ZSV mini test on 22 May 2027 (vouchers from 5 April). Results by 18 June 2027.`,
      sourceIds: [pageId, "upol-pf-board-2027"],
    },
  };
}

function upolPfDocuments(pageId: string): ApplicationDocument[] {
  return [
    doc("upol-pf-application", "E-application and CZK 790 fee by 15 March 2027", "Apply electronically from 1 November 2026 to 15 March 2027; the application counts only once the CZK 790 fee is paid (not refunded).", "always", "application", [pageId]),
    doc("upol-pf-scio", "SCIO NSZ results and consent", "Take the SCIO tests between December 2026 and May 2027 and consent to SCIO sending the results; without consent the application is rejected.", "entrance-exam", "admission-day", [pageId], "December 2026 – May 2027"),
    doc("upol-pf-maturita", "Authorised conversion of the maturita certificate", "Upload an authorised conversion (with the conversion clause) in the e-application; plain scans are not accepted.", "always", "enrolment", [pageId], "By 15 June 2027"),
    doc("upol-pf-recognition", "Assessment of a school certificate from abroad", "Apply for Palacký University's assessment of foreign secondary education in good time before 15 June 2027.", "foreign-education", "enrolment", [pageId]),
  ];
}

const upolPfShared = {
  universityId: "c1127a53d31998aee60b",
  universityHost: "upol.cz",
  universityName: "Palacký University Olomouc",
  faculty: "Faculty of Law",
  country: "Czechia",
  countryCode: "CZ",
  city: "Olomouc",
  category: "Law",
  degreeLevel: "bachelor" as const,
  instructionLanguages: czech,
  application: {
    deadline: "2027-03-15",
    admissionDate: "2027-06-18",
    feeLabel: "CZK 790 (not refunded)",
    applicationUrl: "https://prihlaska.upol.cz/",
  },
  languagePolicy: {
    generalStatement: "Taught in Czech. The 2027/28 pages do not state a Czech proof for applicants from abroad.",
  },
  minimumRequirements: [
    { id: "upol-pf-results", title: "Results and decisions", description: "Results in the e-application by 18 June 2027, 16:00; decisions by 23 June 2027. Appeals within 15 days; the appeal procedure ends in September 2027. Enrolment into the first year is by correspondence.", sourceIds: ["upol-pf-board-2027", "upol-pf-mgr-2027", "upol-pf-bc-2027"] },
  ],
  sources: upolPfSources,
};

const upolPf: AdmissionProgram[] = [
  ...programs(
    {
      ...upolPfShared,
      programType: "long-cycle",
      durationYears: 5,
      documents: upolPfDocuments("upol-pf-mgr-2027"),
      genericRules: upolPfRules("upol-pf-mgr-2027", "147 points"),
    },
    [{ id: "upol-pf-law-mgr-2027", programName: "Law and Legal Science", localProgramName: "Právo a právní věda" }],
  ),
  ...programs(
    {
      ...upolPfShared,
      durationYears: 3,
      documents: upolPfDocuments("upol-pf-bc-2027"),
      genericRules: upolPfRules("upol-pf-bc-2027", "110.4 points"),
    },
    [{ id: "upol-pf-public-administration-law-bc-2027", programName: "Law in Public Administration", localProgramName: "Právo ve veřejné správě" }],
  ),
];

// ------------------------------------------------- FPR ZČU (Plzeň, Czech)

const zcuFprSources = [
  source("zcu-fpr-admission-2027", "Information for applicants: admission 2027–2028", "Faculty of Law, University of West Bohemia", "https://www.fpr.zcu.cz/cs/Admission/applying-to-uwb.html"),
];

const zcuFpr = programs(
  {
    universityId: "9c2e0cfbb37290fedac1",
    universityHost: "zcu.cz",
    universityName: "University of West Bohemia",
    faculty: "Faculty of Law",
    country: "Czechia",
    countryCode: "CZ",
    city: "Plzeň",
    category: "Law",
    degreeLevel: "bachelor",
    programType: "long-cycle",
    durationYears: 5,
    instructionLanguages: czech,
    application: {
      deadline: "2027-04-30",
      admissionDate: "2027-07-01",
      feeLabel: "CZK 750",
      applicationUrl: "https://www.fpr.zcu.cz/cs/Admission/applying-to-uwb.html",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. The faculty does not consider language certificates, and its 2027/28 page states no Czech proof.",
    },
    documents: [
      doc("zcu-fpr-application", "E-application and CZK 750 fee by 30 April 2027", "Electronic applications from 1 November 2026 until 30 April 2027, 23:59; one application per programme. Pay CZK 750 by transfer or at Komerční banka by 30 April 2027 (variable symbol 3275000127).", "always", "application", ["zcu-fpr-admission-2027"]),
      doc("zcu-fpr-scio", "SCIO NSZ: OSP and ZSV", "Take both between December 2026 and May 2027 (the best result counts) and consent to SCIO sending the results to the faculty.", "entrance-exam", "admission-day", ["zcu-fpr-admission-2027"], "December 2026 – May 2027"),
      doc("zcu-fpr-certificate", "Secondary school certificate", "Upload it to the ZČU system by 16 June 2027.", "always", "enrolment", ["zcu-fpr-admission-2027"], "By 16 June 2027"),
      doc("zcu-fpr-recognition", "Nostrifikace, EB or IB", "With secondary education from abroad, upload a certified conversion of the nostrifikace certificate or proof of the European or International Baccalaureate by 16 June 2027.", "foreign-education", "enrolment", ["zcu-fpr-admission-2027"], "By 16 June 2027"),
    ],
    minimumRequirements: [
      { id: "zcu-fpr-decision", title: "SCIO results only", description: "The faculty runs no own exam and does not consider school grades or language certificates. It decides by 1 July 2027 and publishes the decision on its website until 15 July 2027. The page states no place count.", sourceIds: ["zcu-fpr-admission-2027"] },
    ],
    sources: zcuFprSources,
    genericRules: {
      language: null,
      languageUnknownNote:
        "The faculty's 2027/28 page states no Czech proof (it does not consider language certificates). The programme and the SCIO tests are in Czech; ask the faculty.",
      recognition: {
        exemptSchools: ["CZ"],
        text: "With secondary education from abroad, upload a certified conversion of the nostrifikace certificate or proof of the EB or IB by 16 June 2027.",
        sourceIds: ["zcu-fpr-admission-2027"],
      },
      entrance: {
        label: "SCIO NSZ: OSP and Basic Social Sciences",
        dueLabel: "December 2026 – May 2027; decision by 1 July 2027",
        text: "Take OSP and ZSV between December 2026 and May 2027; only the best result counts. Register at scio.cz/nsz and consent to SCIO sending your results to the faculty.",
        sourceIds: ["zcu-fpr-admission-2027"],
      },
    },
  },
  [{ id: "zcu-fpr-law-mgr-2027", programName: "Law and Legal Science", localProgramName: "Právo a právní věda" }],
);

// ===================================================== ECONOMICS & BUSINESS

// ------------------------------------------------- FP VUT (Brno, Czech)

const vutFpSources = [
  source("vut-fp-admission-2027", "Admissions: bachelor study (2027/2028)", "Faculty of Business and Management, Brno University of Technology", "https://www.fp.vut.cz/cs/pro-uchazece/prijimacky"),
];

const vutFp = programs(
  {
    universityId: "4b1db26791c5d27c91ac",
    universityHost: "vutbr.cz",
    universityName: "Brno University of Technology",
    faculty: "Faculty of Business and Management (FP VUT)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Brno",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: czech,
    application: {
      deadline: "2027-03-31",
      admissionDate: "2027-05-21",
      feeLabel: "CZK 700 (EUR 28 when paying from abroad)",
      applicationUrl: "https://www.fp.vut.cz/cs/pro-uchazece/prijimacky",
      waiverEvidenceDueLabel: "By 31 March 2027 (attachments until 15 April)",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. Applicants from abroad prove Czech at B2 or higher; this does not apply to Slovak applicants.",
    },
    documents: [
      doc("vut-fp-application", "E-application and fee by 31 March 2027", "1 November 2026 – 31 March 2027; CZK 700 (EUR 28 from abroad). The faculty also links a decision extending the bachelor deadline (Rozhodnutí 3/2026): check it before relying on 31 March.", "always", "application", ["vut-fp-admission-2027"]),
      doc("vut-fp-exam", "Written test of study prerequisites", "21 or 22 May 2027 (your choice in the e-application); invitation by email at least 14 days before.", "entrance-exam", "admission-day", ["vut-fp-admission-2027"], "21 or 22 May 2027"),
      doc("vut-fp-waiver", "Evidence for admission without the exam", "SCIO OSP or SCIO Mathematics at the 50th percentile (attach the certificate yourself; SCIO does not send it), a top-three Business Point placing in 2026/27, or 50% in the faculty's maths course. In the e-application by 31 March 2027, attachments until 15 April 2027 (or by post).", "waiver-claim", "application", ["vut-fp-admission-2027"], "By 31 March 2027 (attachments 15 April)"),
      doc("vut-fp-czech", "Proof of Czech at B2", "Czech at B2 or higher (not for Slovak applicants).", "foreign-language-test", "enrolment", ["vut-fp-admission-2027"]),
      doc("vut-fp-recognition", "Recognition of a school certificate from abroad", "Nostrifikace, or a positive assessment during the faculty's admission procedure (not for applicants from Slovakia).", "foreign-education", "enrolment", ["vut-fp-admission-2027"]),
    ],
    minimumRequirements: [
      { id: "vut-fp-threshold", title: "30 of 100 points", description: "25 questions in 45 minutes: +4 for a correct answer, 0 for none, −1 for a wrong one. At least 30 points. Exemption notices by 7 May 2027; results on 1 June 2027; enrolment in June and July 2027.", sourceIds: ["vut-fp-admission-2027"] },
    ],
    sources: vutFpSources,
    genericRules: {
      language: {
        code: "cs",
        name: "Czech",
        minimumLevel: "B2",
        exemptCitizenships: ["CZ", "SK"],
        exemptSchools: ["CZ", "SK"],
        proof: "Prove Czech at B2 or higher (the faculty's PDF for foreign applicants lists the details).",
        sourceIds: ["vut-fp-admission-2027"],
      },
      recognition: {
        exemptSchools: ["CZ", "SK"],
        text: "Have the maturita recognised (nostrifikace) or positively assessed in the faculty's admission procedure; not needed for Slovakia.",
        sourceIds: ["vut-fp-admission-2027"],
      },
      entrance: {
        label: "Written test, or SCIO 50th percentile",
        dueLabel: "21 or 22 May 2027; results 1 June",
        text: "Written test of study prerequisites on 21 or 22 May 2027 (at least 30 of 100 points), or admission without it: SCIO OSP (5 December 2026 – 20 March 2027) or SCIO Mathematics (30 January – 20 March 2027) at the 50th percentile, a top-three Business Point placing, or the faculty's maths course. Evidence by 31 March 2027.",
        sourceIds: ["vut-fp-admission-2027"],
      },
    },
  },
  [{ id: "vut-fp-economics-management-bc-2027", programName: "Economics and Management", localProgramName: "Ekonomika a management" }],
);

// ------------------------------------------------- FPH VŠE (Prague, Czech)

const vseFphSources = [
  source("vse-fph-bc-2027", "Bachelor study: entrance exams and admission", "Faculty of Business Administration, Prague University of Economics and Business", "https://fph.vse.cz/uchazeci/bakalarske-studium/prijimaci-zkousky/"),
  source("vse-fmv-bc-2027", "Admission to bachelor study (2027/2028)", "Faculty of International Relations, Prague University of Economics and Business", "https://fmv.vse.cz/bakalarske-studium/prijimaci-rizeni/"),
];

const vseFph = programs(
  {
    universityId: "aa8f2e91b2d0d7cc779d",
    universityHost: "vse.cz",
    universityName: "Prague University of Economics and Business",
    faculty: "Faculty of Business Administration (FPH VŠE)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Prague",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: czech,
    application: {
      deadline: "2027-04-30",
      admissionDate: "2027-06-10",
      feeLabel: "Paid with the VŠE e-application (FPH's page does not restate it; VŠE's FMV lists CZK 1,050 for 2027/28)",
      applicationUrl: "https://fph.vse.cz/uchazeci/bakalarske-studium/prijimaci-zkousky/",
      waiverEvidenceDueLabel: "By 30 April 2027",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. Without a secondary school in Czechia or Slovakia, pass the faculty's paid Czech entrance test with at least 60%.",
    },
    documents: [
      doc("vse-fph-application", "E-application by 30 April 2027", "Apply for Podniková ekonomika a management by 30 April 2027 and pay the VŠE application fee.", "always", "application", ["vse-fph-bc-2027", "vse-fmv-bc-2027"]),
      doc("vse-fph-exam", "Faculty tests: mathematics and one foreign language", "On 10 or 11 June 2027; you cannot choose the date. Language: British English, French, German or Spanish.", "entrance-exam", "admission-day", ["vse-fph-bc-2027"], "10 or 11 June 2027"),
      doc("vse-fph-waiver", "Evidence for admission without the exam", "Czech or Slovak school with a 2027 maturita in Czech/Slovak, maths and English: signed grade sheet by 30 April 2027 (at most 50% of places this way). Or 75% in each part of one FPH 'nanečisto' test, or competitions (apply in InSIS by 30 April 2027).", "waiver-claim", "application", ["vse-fph-bc-2027"], "By 30 April 2027"),
      doc("vse-fph-czech-test", "Czech entrance test (at least 60%)", "Without a secondary school in Czechia or Slovakia: register separately for the paid Czech test; certificates cannot replace it, and it is retaken each cycle.", "foreign-education", "admission-day", ["vse-fph-bc-2027"]),
      doc("vse-fph-recognition", "Diploma from abroad and nostrifikace", "Certified copy of the diploma, certified translation into Czech or English, confirmation that it allows bachelor's study, and nostrifikace; file the assessment through the faculty and pay its fee.", "foreign-education", "enrolment", ["vse-fph-bc-2027"]),
      doc("vse-fph-enrolment", "E-návratka and maturita certificate", "Admitted without the exam: confirm the e-návratka by 8 June 2027. Everyone: maturita certificate by 23 June 2027.", "always", "enrolment", ["vse-fph-bc-2027"], "By 23 June 2027"),
    ],
    minimumRequirements: [
      { id: "vse-fph-results", title: "Results and appeals", description: "The page gives no results date or place count. Rejected applicants can appeal in InSIS within 15 days.", sourceIds: ["vse-fph-bc-2027"] },
    ],
    sources: vseFphSources,
    genericRules: {
      language: null,
      languageUnknownNote:
        "No CEFR level is set: without a secondary school in Czechia or Slovakia you must pass the faculty's paid Czech entrance test with at least 60% (certificates do not replace it).",
      recognition: {
        exemptSchools: ["CZ", "SK"],
        text: "Send a certified copy and translation of the diploma, confirmation that it allows bachelor's study, and nostrifikace; the faculty starts the assessment only after its fee is paid.",
        sourceIds: ["vse-fph-bc-2027"],
      },
      entrance: {
        label: "Faculty tests: mathematics and one foreign language",
        dueLabel: "10 or 11 June 2027 (date assigned)",
        text: "Maths and one language (British English, French, German or Spanish) on 10 or 11 June 2027. Without the exam: Czech/Slovak school grades with a 2027 maturita (max 50% of places), 75% in a 'nanečisto' test, or competitions; evidence by 30 April 2027.",
        sourceIds: ["vse-fph-bc-2027"],
      },
    },
  },
  [{ id: "vse-fph-business-economics-bc-2027", programName: "Business Economics and Management", localProgramName: "Podniková ekonomika a management" }],
);

// ------------------------------------------------- FMV VŠE (Prague, Czech)

const vseFmv = programs(
  {
    universityId: "aa8f2e91b2d0d7cc779d",
    universityHost: "vse.cz",
    universityName: "Prague University of Economics and Business",
    faculty: "Faculty of International Relations (FMV VŠE)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Prague",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: czech,
    application: {
      deadline: "2027-04-30",
      admissionDate: "2027-06-09",
      feeLabel: "CZK 1,050",
      applicationUrl: "https://fmv.vse.cz/bakalarske-studium/prijimaci-rizeni/",
      waiverEvidenceDueLabel: "By 30 April 2027",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. Without a Czech or Slovak maturita, pass the faculty's Czech test for foreigners (7 June 2027).",
    },
    documents: [
      doc("vse-fmv-application", "E-application and CZK 1,050 fee by 30 April 2027", "1 December 2026 – 30 April 2027; up to three programmes in a fixed order of preference.", "always", "application", ["vse-fmv-bc-2027"]),
      doc("vse-fmv-exam", "Faculty tests: mathematics and two languages", "9 June 2027: maths (60 min) and two languages (35 min each), up to 1,000 points per test.", "entrance-exam", "admission-day", ["vse-fmv-bc-2027"], "9 June 2027"),
      doc("vse-fmv-waiver", "Evidence for admission without the exam", "School grades in maths and two languages (thresholds set each year), 60% in each of three 'nanečisto' practice tests (6 March – 24 April 2027), 45 credits from the zero year, or national competitions. Matematika rozšiřující can replace maths; a B2+ certificate can replace a language. Upload by 30 April 2027.", "waiver-claim", "application", ["vse-fmv-bc-2027"], "By 30 April 2027"),
      doc("vse-fmv-czech-test", "Czech test for foreigners", "Without a Czech or Slovak maturita: the faculty's Czech test on 7 June 2027.", "foreign-education", "admission-day", ["vse-fmv-bc-2027"], "7 June 2027"),
      doc("vse-fmv-recognition", "Assessment of education from abroad", "Through VŠE's assessment procedure; formal nostrifikace only if the faculty doubts the level or content.", "foreign-education", "enrolment", ["vse-fmv-bc-2027"]),
      doc("vse-fmv-enrolment", "E-návratka", "Admitted without the exam: by 4 June 2027; after the exam: by 21 June 2027. Missing it means losing the right to enrol.", "always", "enrolment", ["vse-fmv-bc-2027"], "4 or 21 June 2027"),
    ],
    minimumRequirements: [
      { id: "vse-fmv-thresholds", title: "Pass marks set after the exam", description: "The dean sets the thresholds, usually the day after the exams; results appear in the e-application and the decision in InSIS. Appeals within 15 days. The page states no place counts.", sourceIds: ["vse-fmv-bc-2027"] },
    ],
    sources: [vseFphSources[1]],
    genericRules: {
      language: null,
      languageUnknownNote:
        "No CEFR level is set: without a Czech or Slovak maturita you must pass the faculty's Czech test for foreigners on 7 June 2027.",
      recognition: {
        exemptSchools: ["CZ", "SK"],
        text: "Education from abroad is assessed through VŠE's procedure; formal nostrifikace is needed only if the faculty doubts its level or content.",
        sourceIds: ["vse-fmv-bc-2027"],
      },
      entrance: {
        label: "Faculty tests: mathematics and two languages",
        dueLabel: "9 June 2027 (Czech test for foreigners 7 June)",
        text: "Maths and two languages (English plus French, German, Russian or Spanish) on 9 June 2027, or admission without the exam (grades, practice tests, competitions; evidence by 30 April 2027).",
        sourceIds: ["vse-fmv-bc-2027"],
      },
    },
  },
  [
    { id: "vse-fmv-international-trade-bc-2027", programName: "International Trade", localProgramName: "Mezinárodní obchod" },
    { id: "vse-fmv-tourism-hospitality-bc-2027", programName: "Tourism and Hospitality Management", localProgramName: "Turismus a hospitality management" },
  ],
);

// ---------------------------------------------- FPEDAS UNIZA (Žilina, Slovak)

const fpedasSources = [
  source("fpedas-bc-2027", "Bachelor study 2027/2028: information leaflet", "Faculty of Operation and Economics of Transport and Communications, University of Žilina", "https://fpedas.uniza.sk/images/prijimacie_konanie/FPEDAS_BC_2027_2028_infoletak.pdf"),
];

function fpedasEntrance(rule: string): GenericAdmissionRules["entrance"] {
  return {
    label: "Faculty test, or admission without it",
    dueLabel: "1–2 June 2027 (date cannot be changed)",
    text: `Without the test: a Slovak or Czech language maturita with a penultimate-year average of ${rule}; top placings in Objav PEDAS, the INESS Economics Olympiad, Mladý účtovník or the obchodné akadémie competition; or a Slovak or Czech maturita and the NPS general test at the 50th percentile. Otherwise the test on 1–2 June 2027: general knowledge, mathematics and one language (English, Spanish, German, French or Russian).`,
    sourceIds: ["fpedas-bc-2027"],
  };
}

const fpedas = programs(
  {
    universityId: "b8b5a2e3a15148e5b4a1",
    universityHost: "uniza.sk",
    universityName: "University of Žilina",
    faculty: "Faculty of Operation and Economics of Transport and Communications (FPEDAS)",
    country: "Slovakia",
    countryCode: "SK",
    city: "Žilina",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: slovak,
    application: {
      deadline: "2027-03-31",
      admissionDate: "2027-06-01",
      feeLabel: "€40 for EU citizens, €50 for others (bank transfer only)",
      applicationUrl: "https://vzdelavanie.uniza.sk/prijimacky/index.php",
      languageProofDueLabel: "Before enrolment",
      waiverEvidenceDueLabel: "With the application by 31 March 2027",
    },
    languagePolicy: {
      generalStatement: "Taught in Slovak. Applicants from abroad (except the Czech Republic) pass the UNIZA Slovak test at B1 before enrolment.",
    },
    documents: [
      doc("fpedas-application", "E-application, fee and attachments by 31 March 2027", "Signed application (confirmed by your school if you sit the maturita this year), CV, proof of the fee (variable symbol 10131, specific symbol = e-application number), penultimate-year report, and the maturita certificate if obtained earlier.", "always", "application", ["fpedas-bc-2027"]),
      doc("fpedas-exam", "Faculty entrance test", "1–2 June 2027 for those not admitted without it; the date cannot be changed.", "entrance-exam", "admission-day", ["fpedas-bc-2027"], "1–2 June 2027"),
      doc("fpedas-waiver", "Evidence for admission without the test", "Report average, competition diploma or NPS result, uploaded with the application.", "waiver-claim", "application", ["fpedas-bc-2027"], "By 31 March 2027"),
      doc("fpedas-slovak-b1", "UNIZA Slovak test at B1", "Passing it is a condition for enrolment; a B1 test from the last 5 years counts. Dates on the UNIZA lifelong-learning institute (ÚCV) website.", "foreign-language-test", "enrolment", ["fpedas-bc-2027"]),
      doc("fpedas-recognition", "Recognition of a school certificate from abroad", "A Slovak recognition decision, or a recognition stamp (uznávacia doložka) with an extract from the document register, with the application or at enrolment at the latest.", "foreign-education", "enrolment", ["fpedas-bc-2027"]),
    ],
    minimumRequirements: [],
    sources: fpedasSources,
    genericRules: {
      language: {
        code: "sk",
        name: "Slovak",
        minimumLevel: "B1",
        exemptCitizenships: ["SK", "CZ"],
        exemptSchools: ["SK", "CZ"],
        proof: "Pass the UNIZA Slovak test at B1 (run by ÚCV UNIZA) before enrolment; a B1 test passed in the last 5 years counts.",
        sourceIds: ["fpedas-bc-2027"],
      },
      recognition: {
        exemptSchools: ["SK"],
        text: "With the application or at enrolment at the latest: a Slovak recognition decision, or a recognition stamp (uznávacia doložka) with an extract from the document register.",
        sourceIds: ["fpedas-bc-2027"],
      },
      entrance: fpedasEntrance("1.50 (gymnázium) or 1.20 (other schools)"),
    },
  },
  [
    {
      id: "uniza-fpedas-business-economics-bc-2027",
      programName: "Business Economics and Management",
      localProgramName: "Ekonomika a manažment podniku",
      patch: {
        minimumRequirements: [{ id: "fpedas-places-emp", title: "140 places", description: "Without the test with a penultimate-year average of 1.50 (gymnázium) or 1.20 (other schools). Second round (deadline 31 July 2027) only if places remain.", sourceIds: ["fpedas-bc-2027"] }],
      },
    },
    {
      id: "uniza-fpedas-financial-management-bc-2027",
      programName: "Financial Management",
      localProgramName: "Finančný manažment",
      patch: {
        minimumRequirements: [{ id: "fpedas-places-fm", title: "75 places", description: "Without the test with a penultimate-year average of 1.60 (gymnázium) or 1.50 (other schools). Second round (deadline 31 July 2027) only if places remain.", sourceIds: ["fpedas-bc-2027"] }],
      },
    },
    {
      id: "uniza-fpedas-e-commerce-bc-2027",
      programName: "E-commerce and Management",
      localProgramName: "Elektronický obchod a manažment",
      patch: {
        minimumRequirements: [{ id: "fpedas-places-eom", title: "80 places", description: "Without the test with a penultimate-year average of 1.60 (gymnázium) or 1.50 (other schools). Second round (deadline 31 July 2027) only if places remain.", sourceIds: ["fpedas-bc-2027"] }],
      },
    },
  ],
);
for (const program of fpedas) {
  const average = program.id.includes("business-economics") ? "1.50 (gymnázium) or 1.20 (other schools)" : "1.60 (gymnázium) or 1.50 (other schools)";
  program.genericRules = { ...program.genericRules!, entrance: fpedasEntrance(average) };
}

// ------------------------------------------------- FaME UTB (Zlín, Czech)

const fameSources = [
  source("utb-fame-bc-2027", "Bachelor admission (academic year 2027/2028)", "Faculty of Management and Economics, Tomas Bata University in Zlín", "https://fame.utb.cz/studium/prijimaci-rizeni/bakalarske-studium/"),
  source("utb-fame-programmes", "Bachelor programmes", "Faculty of Management and Economics, Tomas Bata University in Zlín", "https://fame.utb.cz/studium/moznosti-studia/bakalarske-programy/"),
];

const fame = programs(
  {
    universityId: "c1b0b2b9bcdabffe5c22",
    universityHost: "utb.cz",
    universityName: "Tomas Bata University in Zlín",
    faculty: "Faculty of Management and Economics (FaME)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Zlín",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: czech,
    application: {
      deadline: "2027-03-31",
      admissionDate: "2027-05-31",
      feeLabel: "CZK 520 (not refunded)",
      applicationUrl: "https://www.eprihlaska.utb.cz/",
    },
    languagePolicy: {
      generalStatement: "Full-time programme. The faculty's 2027/28 admission page does not state a Czech proof for applicants from abroad.",
    },
    documents: [
      doc("fame-application", "E-application and CZK 520 fee by 31 March 2027", "First round 1 November 2026 – 31 March 2027 (second round 1 May – 15 July 2027 unless the dean cancels it for a filled programme). Pay by transfer (2–3 working days) or card.", "always", "application", ["utb-fame-bc-2027"]),
      doc("fame-nsz", "SCIO National Comparative Exam (or Slovak NPS)", "Sit it at least once; registration and payment with SCIO are separate from the faculty application.", "entrance-exam", "admission-day", ["utb-fame-bc-2027"], "SCIO dates before your round's deadline"),
      doc("fame-exemption", "Evidence for an exemption", "Mensa IQ 119+, national-round olympiads or top 10 in a regional Economics Olympiad (dean's directive SD/07/2026, Art. 4(5)).", "waiver-claim", "application", ["utb-fame-bc-2027"]),
      doc("fame-certificate", "Proof of completed secondary education", "Upload it by 15 June 2027 (first round).", "always", "enrolment", ["utb-fame-bc-2027"], "By 15 June 2027"),
    ],
    minimumRequirements: [
      { id: "fame-dates", title: "Committee, decision and enrolment", description: "Committee results by 31 May 2027; decisions by 30 June 2027; enrolment in the e-application 1–11 July 2027. The planned intake is published by the end of March 2027.", sourceIds: ["utb-fame-bc-2027"] },
    ],
    sources: fameSources,
    genericRules: {
      language: null,
      languageUnknownNote:
        "The faculty's 2027/28 admission page does not state a Czech proof for applicants from abroad. Ask the faculty before applying.",
      recognition: {
        exemptSchools: ["CZ"],
        text: "The faculty's 2027/28 page does not describe the recognition of a school certificate from abroad; you upload proof of completed secondary education by 15 June 2027. Ask the faculty which recognition it accepts.",
        sourceIds: ["utb-fame-bc-2027"],
      },
      entrance: {
        label: "SCIO National Comparative Exam (or NPS)",
        dueLabel: "Before 31 March 2027 (first round); results by 31 May",
        text: "All applicants sit the SCIO NSZ (or the Slovak NPS) at least once, registering and paying SCIO separately. Exemptions: Mensa IQ 119+, national-round olympiads, top 10 in a regional Economics Olympiad. Committee results by 31 May 2027.",
        sourceIds: ["utb-fame-bc-2027"],
      },
    },
  },
  [
    { id: "utb-fame-economics-management-bc-2027", programName: "Economics and Management (Business Economics and Management)", localProgramName: "Ekonomika a management: Ekonomika a management podniku" },
    { id: "utb-fame-finance-fintech-bc-2027", programName: "Finance and Financial Technologies", localProgramName: "Finance a finanční technologie" },
    { id: "utb-fame-accounting-tax-bc-2027", programName: "Accounting and Taxes", localProgramName: "Účetnictví a daně" },
  ],
);

export const verifiedFieldPrograms: readonly AdmissionProgram[] = [
  ...muniLf,
  ...lfhk,
  ...upolLf,
  ...upolPf,
  ...zcuFpr,
  ...vutFp,
  ...vseFph,
  ...vseFmv,
  ...fpedas,
  ...fame,
];
