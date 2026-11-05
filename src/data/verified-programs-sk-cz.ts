import type { AdmissionProgram, ApplicationDocument, GenericAdmissionRules, OfficialSource } from "@/types/admission";

// Slovak and Czech programmes verified on 2026-11-05 from each faculty's own
// 2027/28 admission pages (plan item 4). They use the shared "generic-2027"
// matching policy: the rules below restate the faculty's documents; where a
// page does not state something (a fee amount, a language proof), the
// programme says so instead of guessing.

const CHECKED = "2026-11-05";

type Shared = Omit<
  AdmissionProgram,
  "id" | "programName" | "localProgramName" | "admissionPolicy" | "intake" | "studyMode" | "verifiedAt"
>;

function programs(shared: Shared, items: Array<{ id: string; programName: string; localProgramName: string; patch?: Partial<AdmissionProgram> }>): AdmissionProgram[] {
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

function source(id: string, title: string, publisher: string, url: string, checkedAt = CHECKED): OfficialSource {
  return { id, title, publisher, url, checkedAt };
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

const czSk = ["CZ", "SK"];

// ------------------------------------------------- VUT FIT (Brno, Czech)

const vutSources = [
  source("vut-fit-application-2027", "Application: bachelor study in Czech (2027/2028)", "Faculty of Information Technology, Brno University of Technology", "https://www.fit.vut.cz/applicants/application/.en"),
  source("vut-but-admission-fee", "Admission procedure (application fee)", "Brno University of Technology", "https://www.vut.cz/studuj/proc-na-vut/prijimaci-rizeni", "2026-10-30"),
];

const vutRules: GenericAdmissionRules = {
  language: {
    code: "cs",
    name: "Czech",
    minimumLevel: "B2",
    exemptCitizenships: czSk,
    exemptSchools: czSk,
    proof:
      "Prove Czech with a SCIO OSP, VŠP or Czech test in Czech or Slovak at the 68th percentile or higher, or a Czech exam or course at B2+ from a BUT language department.",
    sourceIds: ["vut-fit-application-2027"],
  },
  recognition: {
    exemptSchools: ["CZ", "SK", "PL", "DE"],
    text: "Certificates from countries with an agreement (for example Slovakia, Poland, Germany) count automatically. Others: send a certified diploma, transcript and study plan with hours, translated into Czech; FIT recognises it.",
    sourceIds: ["vut-fit-application-2027"],
  },
  entrance: {
    label: "SCIO test at the 75th percentile",
    text: "No faculty exam: admission by the SCIO National Comparative Exams (OSP or Mathematics) at the 75th percentile or higher; the dean may lower it. One free test on 24 April 2027 if you applied and paid on time (make-up 22 May 2027 for serious reasons). Or preferential admission (for example IQ 90th percentile, maths exam 80th percentile, Mathematics+ 60th, olympiads, SOČ, Kangaroo, Beaver, FIT's maths course) claimed by 31 March 2027 (31 May if results are pending).",
    sourceIds: ["vut-fit-application-2027"],
    dueLabel: "Free SCIO test 24 April 2027 (make-up 22 May)",
  },
};

const vutFit = programs(
  {
    universityId: "4b1db26791c5d27c91ac",
    universityHost: "vutbr.cz",
    universityName: "Brno University of Technology",
    faculty: "Faculty of Information Technology (FIT VUT)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Brno",
    category: "Computer Science",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: [{ code: "cs", name: "Czech" }],
    application: {
      deadline: "2027-03-31",
      admissionDate: "2027-04-24",
      feeLabel: "CZK 700 (EUR 28 from abroad)",
      applicationUrl: "https://www.fit.vut.cz/applicants/application/.en",
      languageProofDueLabel: "Before enrolment (June, July or September 2027)",
      waiverEvidenceDueLabel: "By 31 March 2027 (31 May if results are pending)",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. Czech and Slovak citizens and Czech or Slovak maturita holders meet the language condition; others prove Czech (SCIO 68th percentile in Czech or Slovak, or B2 at BUT).",
    },
    documents: [
      doc("vut-application", "E-application and fee by 31 March 2027", "File the e-application and pay CZK 700 (EUR 28 when paying from abroad).", "always", "application", ["vut-fit-application-2027", "vut-but-admission-fee"]),
      doc("vut-scio-consent", "SCIO result and consent", "Take OSP or Mathematics (free date 24 April 2027) and allow SCIO to send your result to FIT.", "entrance-exam", "admission-day", ["vut-fit-application-2027"], "Test on 24 April 2027 (make-up 22 May)"),
      doc("vut-preferential", "Preferential-admission evidence", "Claim it in the e-application and add the proof by 31 March 2027, or by 31 May if the result is still pending.", "waiver-claim", "application", ["vut-fit-application-2027"], "By 31 March 2027 (31 May if pending)"),
      doc("vut-czech", "Proof of Czech", "SCIO OSP, VŠP or Czech test in Czech or Slovak at the 68th percentile+, or a B2+ Czech exam or course at BUT.", "foreign-language-test", "enrolment", ["vut-fit-application-2027"]),
      doc("vut-recognition", "Documents for recognition", "Certified high-school diploma, transcript and study plan with hours, translated into Czech.", "foreign-education", "enrolment", ["vut-fit-application-2027"]),
    ],
    minimumRequirements: [
      { id: "vut-threshold", title: "SCIO 75th percentile", description: "OSP or Mathematics at the 75th percentile or higher; the dean can lower it within five working days after the registration deadline.", sourceIds: ["vut-fit-application-2027"] },
      { id: "vut-enrolment", title: "Enrolment and start", description: "Electronic enrolment in June, July or September 2027; matriculation 17 September, semester from 20 September 2027.", sourceIds: ["vut-fit-application-2027"] },
    ],
    sources: vutSources,
    genericRules: vutRules,
  },
  [{ id: "vut-fit-it-bsc-2027", programName: "Information Technology", localProgramName: "Informační technologie" }],
);

// ---------------------------------------------- STU FIIT (Bratislava, Slovak)

const fiitSources = [
  source("fiit-bachelor-sk-2027", "Bachelor admission, Slovak-taught Informatika (2027/2028)", "Faculty of Informatics and Information Technologies, Slovak University of Technology in Bratislava", "https://www.fiit.stuba.sk/sk/uchadzaci/ako-zacat-studovat/prijimanie-na-studium/prijimacie-konanie-na-bakalarske-studium/prijimacie-konanie-bakalarske-studium-v-slovenskom-jazyku"),
];

const fiit = programs(
  {
    universityId: "15a8dcb69537dff74395",
    universityHost: "stuba.sk",
    universityName: "Slovak University of Technology in Bratislava",
    faculty: "Faculty of Informatics and Information Technologies (FIIT)",
    country: "Slovakia",
    countryCode: "SK",
    city: "Bratislava",
    category: "Computer Science",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: [{ code: "sk", name: "Slovak" }],
    application: {
      deadline: "2027-03-31",
      admissionDate: "2027-04-16",
      feeEur: 30,
      applicationUrl: "https://www.fiit.stuba.sk/sk/uchadzaci/ako-zacat-studovat/prijimanie-na-studium/prijimacie-konanie-na-bakalarske-studium/prijimacie-konanie-bakalarske-studium-v-slovenskom-jazyku",
      languageProofDueLabel: "By enrolment day",
      waiverEvidenceDueLabel: "Upload by 31 March 2027",
    },
    languagePolicy: {
      generalStatement: "Taught in Slovak. With a school certificate from outside Slovakia and Czechia, prove Slovak at B2 or higher with a certificate from the STU language centre (ICV STU).",
    },
    documents: [
      doc("fiit-application", "E-application and €30 fee", "Second round: 1 December 2026, 10:00 – 31 March 2027, 23:59. Pay €30 with the variable symbol from the e-application.", "always", "application", ["fiit-bachelor-sk-2027"]),
      doc("fiit-competitions", "Competition results", "Upload competition diplomas to AIS by the application deadline.", "waiver-claim", "application", ["fiit-bachelor-sk-2027"], "By 31 March 2027"),
      doc("fiit-maturita-2027", "Certified copy of the maturita certificate", "Graduating in 2027: post it in May, right after you receive it.", "graduating-this-year", "enrolment", ["fiit-bachelor-sk-2027"], "In May 2027"),
      doc("fiit-maturita-earlier", "Certified copy of the maturita certificate", "Graduated earlier: post it by the application deadline.", "graduated-earlier", "application", ["fiit-bachelor-sk-2027"]),
      doc("fiit-foreign-school", "Translation and recognition of a school certificate from abroad", "Originals by enrolment day: notarised Slovak translation of the certificate and a recognition decision or a doložka (Act 422/2015). Ukrainian certificates also need the EDBO extract uploaded by 31 July 2027.", "foreign-education", "enrolment", ["fiit-bachelor-sk-2027"]),
      doc("fiit-slovak-b2", "Slovak B2 from ICV STU", "Certificate of Slovak at B2 or higher from the STU language centre, by enrolment day.", "foreign-language-test", "enrolment", ["fiit-bachelor-sk-2027"]),
    ],
    minimumRequirements: [
      { id: "fiit-points", title: "70 points from one route", description: "At least one of: external maturita maths at the 70th percentile or higher, competition diploma worth 70 points, or 70 points in the faculty exam (22 January or 16 April 2027). The best result counts, competition points are added; meeting it guarantees admission, others are ranked.", sourceIds: ["fiit-bachelor-sk-2027"] },
      { id: "fiit-dates", title: "Decision", description: "Admissions committee on 10 May 2027; results in UIS within a week; written decisions in the second half of May 2027.", sourceIds: ["fiit-bachelor-sk-2027"] },
    ],
    sources: fiitSources,
    genericRules: {
      language: {
        code: "sk",
        name: "Slovak",
        minimumLevel: "B2",
        exemptCitizenships: [],
        exemptSchools: czSk,
        proof: "Send a certificate of Slovak at B2 or higher issued by the STU language centre (ICV STU) by enrolment day.",
        sourceIds: ["fiit-bachelor-sk-2027"],
      },
      recognition: {
        exemptSchools: czSk,
        text: "By enrolment day: notarised Slovak translation of the certificate and a recognition decision or a doložka on the level of education (Act 422/2015).",
        sourceIds: ["fiit-bachelor-sk-2027"],
      },
      entrance: {
        label: "70 points: maturita maths, competition or faculty exam",
        text: "Meet one route: maturita maths at the 70th percentile, a 70-point competition diploma, or 70 points in the faculty exam on 22 January or 16 April 2027 (optional if you qualify another way). Committee on 10 May 2027.",
        sourceIds: ["fiit-bachelor-sk-2027"],
        dueLabel: "Faculty exam 22 January or 16 April 2027 (optional); committee 10 May",
      },
    },
  },
  [{ id: "stu-fiit-informatika-bsc-2027", programName: "Computer Science", localProgramName: "Informatika" }],
);

// ------------------------------------------------- MUNI FI (Brno, Czech)

const muniSources = [
  source("muni-fi-bachelor-2027", "Admission to bachelor programmes 2027/2028", "Faculty of Informatics, Masaryk University", "https://www.fi.muni.cz/admission/info-bachelor.html.cs"),
  source("muni-fees", "Admission fees (2026/2027 table)", "Masaryk University", "https://www.muni.cz/o-univerzite/uredni-deska/poplatky-za-prijimaci-rizeni"),
  source("muni-recognition", "Verifying the admission condition (foreign secondary education)", "Masaryk University", "https://www.muni.cz/uchazeci/bakalarske-a-magisterske-studium/overovani-podminky-prijeti-ke-studiu"),
];

const muniRecognition = {
  exemptSchools: ["CZ", "SK", "HU", "DE", "PL", "SI"],
  text: "Schools in Slovakia, Hungary, Germany, Poland and Slovenia count under the equivalence agreements; the European Baccalaureate and IB Diploma are accepted. Otherwise choose verification by the faculty (may be charged, valid only for this admission round) or nostrifikace at a Czech regional office.",
  sourceIds: ["muni-recognition"],
};

const muniFi = programs(
  {
    universityId: "1def63b3ac858b190c04",
    universityHost: "muni.cz",
    universityName: "Masaryk University",
    faculty: "Faculty of Informatics (FI MU)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Brno",
    category: "Computer Science",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: [{ code: "cs", name: "Czech" }],
    application: {
      deadline: "2027-02-28",
      admissionDate: "2027-04-25",
      feeLabel: "Shown in the e-application (FI: CZK 900 in 2026/27)",
      applicationUrl: "https://is.muni.cz/prihlaska",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. The faculty's 2027/28 page does not state a separate Czech proof for applicants from abroad; the entrance test includes reasoning in English.",
    },
    documents: [
      doc("muni-fi-application", "E-application", "Apply at is.muni.cz/prihlaska between 1 November 2026 and 28 February 2027.", "always", "application", ["muni-fi-bachelor-2027"]),
      doc("muni-fi-tsp", "Register and pay for the TSP", "Book a date in the e-application at least 14 days ahead: first attempt 29 November 2026 – 14 February 2027, second 15 February – 25 April 2027. One test counts for every MU application.", "entrance-exam", "admission-day", ["muni-fi-bachelor-2027"], "At least 14 days before your test date"),
      doc("muni-fi-waiver", "Request to waive the entrance exam", "Single-major study only: request the exemption in the e-application.", "waiver-claim", "application", ["muni-fi-bachelor-2027"]),
      doc("muni-fi-recognition", "Recognition of a school certificate from abroad", "Faculty verification or nostrifikace (see the MU page).", "foreign-education", "enrolment", ["muni-recognition"]),
    ],
    minimumRequirements: [
      { id: "muni-fi-tsp-rule", title: "TSP: top 30% in numerical-analytical thinking", description: "Pass: your numerical-analytical subtest is in the top 30% across MU. Ranking uses all three subtests (numerical-analytical, reasoning in English, critical thinking) equally; the better of two attempts counts.", sourceIds: ["muni-fi-bachelor-2027"] },
      { id: "muni-fi-places", title: "Planned places", description: "Informatika 350 (single major), Programování a vývoj aplikací 150, Kyberbezpečnost 150, Bioinformatika 30.", sourceIds: ["muni-fi-bachelor-2027"] },
    ],
    sources: muniSources,
    genericRules: {
      language: null,
      languageUnknownNote: "FI's 2027/28 page and MU's recognition page do not state a Czech proof for applicants from abroad. The programme is taught in Czech; ask the faculty which proof it expects.",
      recognition: muniRecognition,
      entrance: {
        label: "MU study-aptitude test (TSP)",
        dueLabel: "Between 29 November 2026 and 25 April 2027",
        text: "Take the TSP (29 November 2026 – 14 February 2027, or 15 February – 25 April 2027); your numerical-analytical result must be in MU's top 30%. Single-major applicants may request an exemption instead.",
        sourceIds: ["muni-fi-bachelor-2027"],
      },
    },
  },
  [
    { id: "muni-fi-informatika-bsc-2027", programName: "Informatics", localProgramName: "Informatika" },
    { id: "muni-fi-pva-bsc-2027", programName: "Programming and Application Development", localProgramName: "Programování a vývoj aplikací" },
    { id: "muni-fi-kyber-bsc-2027", programName: "Cybersecurity", localProgramName: "Kyberbezpečnost" },
    { id: "muni-fi-bioinfo-bsc-2027", programName: "Bioinformatics", localProgramName: "Bioinformatika" },
  ],
);

// --------------------------------------------- FMFI UK (Bratislava, Slovak)

const fmfiSources = [
  source("fmfi-conditions-2027", "Conditions for admission to bachelor programmes 2027/2028 (approved by the Academic Senate on 19 October 2026)", "Faculty of Mathematics, Physics and Informatics, Comenius University Bratislava", "https://fmph.uniba.sk/fileadmin/fmfi/studium/prijimacky/Podmienky_na_prijatie_na_bc-spoj_studium_27_28.pdf"),
  source("fmfi-admission-page", "Admission procedure", "Faculty of Mathematics, Physics and Informatics, Comenius University Bratislava", "https://fmph.uniba.sk/studium/prijimacie-konanie/"),
];

function fmfiEntrance(rule: string): GenericAdmissionRules["entrance"] {
  return {
    label: "Grades or maths percentile (no faculty exam)",
    dueLabel: "Send results by 30 April 2027",
    text: `${rule} Send results to the faculty by 30 April 2027. Olympiad, SOČ and listed competition solvers are admitted without these conditions. School outside the EU: admission by SCIO or SAT maths percentile.`,
    sourceIds: ["fmfi-conditions-2027"],
  };
}

const fmfiShared: Shared = {
  universityId: "79e938c73e40ae20dfe7",
  universityHost: "uniba.sk",
  universityName: "Comenius University Bratislava",
  faculty: "Faculty of Mathematics, Physics and Informatics",
  country: "Slovakia",
  countryCode: "SK",
  city: "Bratislava",
  category: "Computer Science",
  degreeLevel: "bachelor",
  durationYears: 3,
  instructionLanguages: [{ code: "sk", name: "Slovak" }],
  application: {
    deadline: "2027-03-31",
    admissionDate: "2027-04-30",
    feeLabel: "Set by Comenius University for 2027/28 (one fee for up to three programmes)",
    applicationUrl: "https://fmph.uniba.sk/studium/prijimacie-konanie/",
    languageProofDueLabel: "By enrolment day",
    waiverEvidenceDueLabel: "By 30 April 2027",
  },
  languagePolicy: {
    generalStatement: "Taught in Slovak at B1 or higher. Without a Slovak or Czech maturita, hold a B1 certificate; with an English SAT or maths test, prove Slovak by enrolment day.",
  },
  documents: [
    doc("fmfi-application", "Application with up to three programmes", "Apply by 31 March 2027, listing up to three programmes in priority order; one fee, not refunded after the deadline.", "always", "application", ["fmfi-conditions-2027"]),
    doc("fmfi-results", "School results and maths percentile", "Send your grades (school years 2023/24–2026/27) and maths test result (external maturita, Czech didactic test, in-person SCIO, or SAT maths) by 30 April 2027; later results are not considered.", "always", "application", ["fmfi-conditions-2027"], "By 30 April 2027"),
    doc("fmfi-competitions", "Competition results", "Olympiad, SOČ, iBobor, Zenit, KMS or KSP results that admit you without other conditions.", "waiver-claim", "application", ["fmfi-conditions-2027"], "By 30 April 2027"),
    doc("fmfi-slovak", "Proof of Slovak", "B1 certificate, the faculty's intensive Slovak course, a year of schooling in Slovak, or another method approved on request; by enrolment day.", "foreign-language-test", "enrolment", ["fmfi-conditions-2027"]),
  ],
  minimumRequirements: [
    { id: "fmfi-ranking", title: "Ranking and thresholds", description: "The committee sets a maths percentile threshold per programme and ranks by percentile within your priorities. Guaranteed thresholds lapse if more than 1.5× the planned number qualify.", sourceIds: ["fmfi-conditions-2027"] },
  ],
  sources: fmfiSources,
  genericRules: {
    language: {
      code: "sk",
      name: "Slovak",
      minimumLevel: "B1",
      exemptCitizenships: [],
      exemptSchools: czSk,
      proof: "Prove Slovak at B1 or higher by enrolment day (certificate, the faculty's intensive course, a year of schooling in Slovak or another approved method).",
      sourceIds: ["fmfi-conditions-2027"],
    },
    recognition: {
      exemptSchools: czSk,
      text: "The conditions do not describe recognition of school certificates from abroad; applicants who did not finish school in the EU are admitted by SCIO or SAT maths percentile. Ask the faculty which recognition document it needs at enrolment.",
      sourceIds: ["fmfi-conditions-2027"],
    },
    entrance: fmfiEntrance(""),
  },
};

const fmfi = programs(fmfiShared, [
  { id: "uniba-fmfi-inf-bsc-2027", programName: "Computer Science", localProgramName: "Informatika", patch: { genericRules: { ...fmfiShared.genericRules!, entrance: fmfiEntrance("One condition is enough: grade 1 in one profile subject in each assessed year, or a maths percentile of 60 (conversion variant INF/k: grade 1 or 2, or 50). Planned: 100.") } } },
  { id: "uniba-fmfi-ain-bsc-2027", programName: "Applied Informatics", localProgramName: "Aplikovaná informatika", patch: { genericRules: { ...fmfiShared.genericRules!, entrance: fmfiEntrance("One condition is enough: grade 1 in all profile subjects, an internal maturita part in one, or a maths percentile of 50. Planned: 200.") } } },
  { id: "uniba-fmfi-dav-bsc-2027", programName: "Data Science", localProgramName: "Dátová veda", patch: { genericRules: { ...fmfiShared.genericRules!, entrance: fmfiEntrance("One condition is enough: grade 1 in one profile subject, or a maths percentile of 80 (DAV/k: grade 1 or 2, or 50). Planned: 30.") } } },
  { id: "uniba-fmfi-bin-bsc-2027", programName: "Bioinformatics", localProgramName: "Bioinformatika", patch: { genericRules: { ...fmfiShared.genericRules!, entrance: fmfiEntrance("One condition is enough: grade 1 in one profile subject, or a maths percentile of 70 (BIN/k: grade 1 or 2, or 40). Planned: 15, run with the Faculty of Natural Sciences.") } } },
]);

// ------------------------------------------- JLF UK (Martin, Slovak, medicine)

const jlfSources = [
  source("jlf-admission-2027", "Admission to General Medicine and Dentistry, 2027/2028 (internal regulation 21/2026)", "Jessenius Faculty of Medicine in Martin, Comenius University", "https://www.jfmed.uniba.sk/studium/uchadzaci/doktorske-studium-mudr-mddr/"),
];

const jlf = programs(
  {
    universityId: "79e938c73e40ae20dfe7",
    universityHost: "uniba.sk",
    universityName: "Comenius University Bratislava",
    faculty: "Jessenius Faculty of Medicine in Martin (JLF UK)",
    country: "Slovakia",
    countryCode: "SK",
    city: "Martin",
    category: "Medicine",
    degreeLevel: "bachelor",
    programType: "long-cycle",
    durationYears: 6,
    instructionLanguages: [{ code: "sk", name: "Slovak" }],
    application: {
      deadline: "2027-02-28",
      admissionDate: "2027-03-20",
      feeEur: 70,
      applicationUrl: "https://www.jfmed.uniba.sk/studium/uchadzaci/doktorske-studium-mudr-mddr/",
      languageProofDueLabel: "By enrolment day",
      waiverEvidenceDueLabel: "Bonus evidence by 15 May 2027",
    },
    languagePolicy: {
      generalStatement: "Taught in Slovak. Applicants who are not Slovak or Czech citizens and hold no Slovak compatriot certificate prove Slovak at B2 or higher.",
    },
    documents: [
      doc("jlf-application", "Application, €70 fee and health-fitness form", "UK e-prihláška or the central CEP portal, 1 December 2026 – 28 February 2027, with the fee and health-fitness attachments; late documents are not considered.", "always", "application", ["jlf-admission-2027"]),
      doc("jlf-nps", "National Comparative Exam (NPS)", "In person on 20 March, 24 April or 22 May 2027 (your choice; registration usually closes 16 days before; no make-up). Instructions by email by 10 March 2027.", "entrance-exam", "admission-day", ["jlf-admission-2027"], "20 March, 24 April or 22 May 2027"),
      doc("jlf-bonus", "Bonus-point evidence", "Send evidence of eligible activities by 15 May 2027; bonus points are published by 31 May.", "waiver-claim", "admission-day", ["jlf-admission-2027"], "By 15 May 2027"),
      doc("jlf-recognition", "Recognition decision for a school abroad", "Certified copy (or certified electronic conversion) of the recognition decision from a Slovak regional school office.", "foreign-education", "enrolment", ["jlf-admission-2027"]),
      doc("jlf-slovak", "Slovak at B2", "Proof of Slovak at B2 (CEFR) or higher; it may be delivered by enrolment day (regulation 21/2026, Art. 9(16)).", "foreign-language-test", "enrolment", ["jlf-admission-2027"], "By enrolment day"),
      doc("jlf-diploma", "Certified school-leaving certificate", "Post it only after a conditional admission decision.", "always", "enrolment", ["jlf-admission-2027"]),
    ],
    minimumRequirements: [
      { id: "jlf-ranking", title: "Ranking by NPS plus bonus", description: "Admission follows your total (NPS score plus bonus points) within the planned 150 places; no minimum score is published. Final results by 15 June 2027.", sourceIds: ["jlf-admission-2027"] },
    ],
    sources: jlfSources,
    genericRules: {
      language: {
        code: "sk",
        name: "Slovak",
        minimumLevel: "B2",
        exemptCitizenships: czSk,
        exemptSchools: [],
        proof: "Prove Slovak at B2 or higher by enrolment day (a Slovak compatriot certificate also exempts you).",
        sourceIds: ["jlf-admission-2027"],
      },
      recognition: {
        exemptSchools: ["SK"],
        text: "Submit a certified copy of the recognition decision (or a certified electronic conversion) issued by a Slovak regional school office.",
        sourceIds: ["jlf-admission-2027"],
      },
      entrance: {
        label: "National Comparative Exam (NPS)",
        dueLabel: "20 March, 24 April or 22 May 2027",
        text: "Sit the NPS in person on 20 March, 24 April or 22 May 2027. Your NPS score plus bonus points decides your place among 150; results by 15 June 2027.",
        sourceIds: ["jlf-admission-2027"],
      },
    },
  },
  [{ id: "uniba-jlf-medicine-2027-sk", programName: "General Medicine", localProgramName: "Všeobecné lekárstvo" }],
);

// ------------------------------------------------ PrF UK (Prague, Czech, law)

const cuniPrfSources = [
  source("cuni-prf-conditions-2027", "Conditions for admission 2027/2028: Právo a právní věda", "Faculty of Law, Charles University", "https://prf.cuni.cz/magisterske-studium-mgr/podminky-pro-prijeti-ke-studiu-20272028"),
];

const cuniPrf = programs(
  {
    universityId: "82010c9cd5813db075bc",
    universityHost: "cuni.cz",
    universityName: "Charles University",
    faculty: "Faculty of Law",
    country: "Czechia",
    countryCode: "CZ",
    city: "Prague",
    category: "Law",
    degreeLevel: "bachelor",
    programType: "long-cycle",
    durationYears: 5,
    instructionLanguages: [{ code: "cs", name: "Czech" }],
    application: {
      deadline: "2027-03-31",
      admissionDate: "2027-06-15",
      feeLabel: "Shown in the Student Information System; due by the 3rd day after the deadline",
      applicationUrl: "https://is.cuni.cz/studium/prijimacky/",
      waiverEvidenceDueLabel: "Bonus certificates ideally by 7 June 2027",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. The faculty's 2027/28 conditions do not state a separate Czech proof for applicants from abroad.",
    },
    documents: [
      doc("cuni-prf-application", "E-application in SIS by 31 March 2027", "Apply electronically; pay the fee by the 3rd day after the deadline or the application counts as withdrawn (not refunded).", "always", "application", ["cuni-prf-conditions-2027"]),
      doc("cuni-prf-nsz", "SCIO NSZ: OSP and Basic Social Sciences", "Take both between December 2026 and May 2027 (in person or online); the best result counts and SCIO sends it to the faculty.", "entrance-exam", "admission-day", ["cuni-prf-conditions-2027"], "December 2026 – May 2027"),
      doc("cuni-prf-bonus", "Bonus certificates (up to 15 points)", "C1+ language certificate (English, German, French, Spanish), national SOČ round or national olympiad round: 5 points each, uploaded in SIS ideally by 7 June 2027.", "waiver-claim", "admission-day", ["cuni-prf-conditions-2027"], "Ideally by 7 June 2027"),
      doc("cuni-prf-maturita", "Maturita certificate", "Upload a certified electronic conversion in SIS by 18 June 2027 for the main enrolment on 21–24 June.", "always", "enrolment", ["cuni-prf-conditions-2027"], "By 18 June 2027"),
      doc("cuni-prf-recognition", "Recognition of a school certificate from abroad", "Nostrifikace, EB/IB diploma, or individual assessment by the faculty for CZK 1,050 with documents by 1 September 2027; conditions verified by 30 September (22 October in some cases).", "foreign-education", "enrolment", ["cuni-prf-conditions-2027"], "By 1 September 2027"),
    ],
    minimumRequirements: [
      { id: "cuni-prf-score", title: "Weighted SCIO percentiles", description: "Score = OSP percentile × 1.25 + ZSV percentile × 0.75 (+ bonus). About 750 places; the dean sets the minimum. Results in SIS on 16 June 2027.", sourceIds: ["cuni-prf-conditions-2027"] },
    ],
    sources: cuniPrfSources,
    genericRules: {
      language: null,
      languageUnknownNote: "The faculty's 2027/28 conditions do not state a Czech proof for applicants from abroad. The programme and the SCIO tests are in Czech; ask the faculty.",
      recognition: {
        exemptSchools: ["CZ", "SK", "PL", "HU", "SI"],
        text: "Send nostrifikace, an EB or IB diploma, or ask the faculty to assess your certificate (CZK 1,050, documents by 1 September 2027).",
        sourceIds: ["cuni-prf-conditions-2027"],
      },
      entrance: {
        label: "SCIO NSZ: OSP and Basic Social Sciences",
        dueLabel: "December 2026 – May 2027; results 16 June 2027",
        text: "Take OSP and ZSV between December 2026 and May 2027; weighted percentiles decide among about 750 places. Results on 16 June 2027.",
        sourceIds: ["cuni-prf-conditions-2027"],
      },
    },
  },
  [{ id: "cuni-prf-law-mgr-2027", programName: "Law and Legal Science", localProgramName: "Právo a právní věda" }],
);

// ------------------------------------------------- PrF MU (Brno, Czech, law)

const muniLawSources = [
  source("muni-law-info-2027", "Admission information 2027/2028: Právo a právní věda", "Faculty of Law, Masaryk University", "https://www.law.muni.cz/dokumenty/66888"),
  source("muni-recognition", "Verifying the admission condition (foreign secondary education)", "Masaryk University", "https://www.muni.cz/uchazeci/bakalarske-a-magisterske-studium/overovani-podminky-prijeti-ke-studiu"),
];

const muniLaw = programs(
  {
    universityId: "1def63b3ac858b190c04",
    universityHost: "muni.cz",
    universityName: "Masaryk University",
    faculty: "Faculty of Law",
    country: "Czechia",
    countryCode: "CZ",
    city: "Brno",
    category: "Law",
    degreeLevel: "bachelor",
    programType: "long-cycle",
    durationYears: 5,
    instructionLanguages: [{ code: "cs", name: "Czech" }],
    application: {
      deadline: "2027-02-28",
      admissionDate: "2027-04-25",
      feeLabel: "CZK 800",
      applicationUrl: "https://is.muni.cz/prihlaska",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. The 2027/28 admission information does not state a Czech proof for applicants from abroad.",
    },
    documents: [
      doc("muni-law-application", "E-application and CZK 800 fee", "Apply at is.muni.cz/prihlaska from 1 November 2026 until 28 February 2027, 24:00; one application per programme.", "always", "application", ["muni-law-info-2027"]),
      doc("muni-law-tsp", "MU study-aptitude test (TSP)", "First window 29 November 2026 – 14 February 2027, second 15 February – 25 April 2027; the better attempt counts. The maturita result is not used.", "entrance-exam", "admission-day", ["muni-law-info-2027"], "By 25 April 2027"),
      doc("muni-law-waiver", "Request to waive the TSP", "Dean's waiver for achievements (Moot Court, SOČ, olympiad, Debate League) or SCIO OSP and ZSV both at the 90th percentile, taken 1 November 2026 – 31 March 2027 (at most 200 admitted this way).", "waiver-claim", "application", ["muni-law-info-2027"]),
      doc("muni-law-recognition", "Recognition of a school certificate from abroad", "Faculty verification or nostrifikace (see the MU page).", "foreign-education", "enrolment", ["muni-recognition"]),
    ],
    minimumRequirements: [
      { id: "muni-law-tsp-weights", title: "TSP weights and places", description: "Numerical-analytical 40%, reasoning in English 20%, critical thinking 40%. About 575 places; last year the last admitted applicant had the 70.01 percentile (not a guarantee). Enrolment 21–23 June 2027.", sourceIds: ["muni-law-info-2027"] },
    ],
    sources: muniLawSources,
    genericRules: {
      language: null,
      languageUnknownNote: "The faculty's 2027/28 information does not state a Czech proof for applicants from abroad; detailed conditions were due by the end of October 2026. Ask the faculty.",
      recognition: { ...muniRecognition },
      entrance: {
        label: "MU study-aptitude test (TSP)",
        dueLabel: "Between 29 November 2026 and 25 April 2027",
        text: "Take the TSP by 25 April 2027 (two windows, the better attempt counts), or request a waiver. About 575 places.",
        sourceIds: ["muni-law-info-2027"],
      },
    },
  },
  [{ id: "muni-law-mgr-2027", programName: "Law and Legal Science", localProgramName: "Právo a právní věda" }],
);

// ---------------------------------------- 1. LF UK (Prague, Czech, medicine)

const lf1Sources = [
  source("lf1-conditions-2027", "Admission conditions 2027/2028", "First Faculty of Medicine, Charles University", "https://www.lf1.cuni.cz/podminky-prijimaciho-rizeni-na-1-lf"),
  source("lf1-dates-2027", "Admission dates 2027/2028", "First Faculty of Medicine, Charles University", "https://www.lf1.cuni.cz/terminy-prijimaciho-rizeni"),
];

const lf1 = programs(
  {
    universityId: "82010c9cd5813db075bc",
    universityHost: "cuni.cz",
    universityName: "Charles University",
    faculty: "First Faculty of Medicine",
    country: "Czechia",
    countryCode: "CZ",
    city: "Prague",
    category: "Medicine",
    degreeLevel: "bachelor",
    programType: "long-cycle",
    durationYears: 6,
    instructionLanguages: [{ code: "cs", name: "Czech" }],
    application: {
      deadline: "2027-02-28",
      admissionDate: "2027-06-17",
      feeLabel: "Shown in the Student Information System",
      applicationUrl: "https://is.cuni.cz/studium/prijimacky/",
      languageProofDueLabel: "At enrolment",
      waiverEvidenceDueLabel: "Waiver or bonus request by 24 May 2027",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech; the written test is in Czech. The faculty asks for a Czech certificate at C1, handed in at enrolment.",
    },
    documents: [
      doc("lf1-application", "E-application in SIS", "1 December 2026 – 28 February 2027; no attachments with the application.", "always", "application", ["lf1-conditions-2027", "lf1-dates-2027"]),
      doc("lf1-exam", "Written entrance test in Czech", "17 June 2027 (replacement 23 June); invitations 20 days before. Ask for the replacement date 7 days before the regular one.", "entrance-exam", "admission-day", ["lf1-dates-2027"], "17 June 2027"),
      doc("lf1-waiver", "Waiver or bonus request", "Ask to waive the entrance exam or for bonus points by 24 May 2027 (separate faculty pages list the grounds).", "waiver-claim", "application", ["lf1-conditions-2027"], "By 24 May 2027"),
      doc("lf1-nostrification", "Nostrifikace of a school certificate from abroad", "Apply for recognition of your secondary education by 30 June 2027, or for the faculty's fee-based assessment.", "foreign-education", "enrolment", ["lf1-conditions-2027"], "Apply by 30 June 2027"),
      doc("lf1-czech-c1", "Czech certificate at C1", "Handed in at enrolment; other language certificates are not considered.", "foreign-language-test", "enrolment", ["lf1-conditions-2027"]),
      doc("lf1-enrolment", "Enrolment documents", "School-leaving certificate, medical fitness assessment and proof of hepatitis B vaccination, at enrolment.", "always", "enrolment", ["lf1-conditions-2027"]),
    ],
    minimumRequirements: [
      { id: "lf1-test", title: "Written test in Czech", description: "All invited applicants may sit it on 17 June 2027 (replacement 23 June). The score rules are set in the programme conditions in SIS; the faculty page does not restate a minimum.", sourceIds: ["lf1-conditions-2027", "lf1-dates-2027"] },
    ],
    sources: lf1Sources,
    genericRules: {
      language: {
        code: "cs",
        name: "Czech",
        minimumLevel: "C1",
        exemptCitizenships: [],
        exemptSchools: ["CZ"],
        proof: "Hand in a Czech certificate at C1 at enrolment. The faculty does not list exemptions; a Czech maturita is assumed to cover it only if you finished school in Czechia, so ask the faculty if unsure.",
        sourceIds: ["lf1-conditions-2027"],
      },
      recognition: {
        exemptSchools: ["CZ"],
        text: "Any foreign school (whatever your nationality): apply for nostrifikace by 30 June 2027, or for the faculty's fee-based assessment.",
        sourceIds: ["lf1-conditions-2027"],
      },
      entrance: {
        label: "Written entrance test in Czech",
        dueLabel: "17 June 2027 (replacement 23 June)",
        text: "Sit the written test in Czech on 17 June 2027 (replacement 23 June). Waiver and bonus requests by 24 May 2027.",
        sourceIds: ["lf1-dates-2027", "lf1-conditions-2027"],
      },
    },
  },
  [{ id: "cuni-lf1-medicine-mudr-2027", programName: "General Medicine", localProgramName: "Všeobecné lékařství" }],
);

export const verifiedSkCzPrograms: readonly AdmissionProgram[] = [
  ...vutFit,
  ...fiit,
  ...muniFi,
  ...fmfi,
  ...jlf,
  ...cuniPrf,
  ...muniLaw,
  ...lf1,
];
