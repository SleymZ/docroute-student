import { doc, programs, source, vutFp } from "@/data/verified-programs-fields";
import type { AdmissionProgram } from "@/types/admission";

// Second batch verified on 2026-11-05 (owner: "5 more business, 5 more
// medicine, 10 more law, 1–2 computer science"). Same rules as the first
// batch: Slovak and Czech programmes only, each restated from the faculty's
// own 2027/28 page. Law reached +2 only: no other full-time Czech or Slovak
// law programme had published 2027/28 rules (see docs/STATUS.md).

const english = [{ code: "en", name: "English" }];
const czech = [{ code: "cs", name: "Czech" }];

// ==================================================================== LAW

// ------------------------------------------------ PraF UPJŠ (Košice, Slovak)

const upjsPfSources = [
  source("upjs-pf-bc-2027", "Study with us: bachelor admission 2027/2028", "Faculty of Law, Pavol Jozef Šafárik University in Košice", "https://www.upjs.sk/pravnicka-fakulta/studuj-u-nas/"),
  source("upjs-pf-application", "AiO application: deadlines and fees", "Faculty of Law, Pavol Jozef Šafárik University in Košice", "https://www.upjs.sk/pravnicka-fakulta/all-in-one/aio-prihlaska/"),
];

const upjsPf = programs(
  {
    universityId: "a164a13a9b47c46b5b67",
    universityHost: "upjs.sk",
    universityName: "Pavol Jozef Šafárik University in Košice",
    faculty: "Faculty of Law (PraF UPJŠ)",
    country: "Slovakia",
    countryCode: "SK",
    city: "Košice",
    category: "Law",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: [{ code: "sk", name: "Slovak" }],
    application: {
      deadline: "2027-03-31",
      admissionDate: "2027-06-10",
      feeLabel: "€30 online (€50 on a paper form)",
      applicationUrl: "https://www.upjs.sk/pravnicka-fakulta/all-in-one/aio-prihlaska/",
      languageProofDueLabel: "Before enrolment",
      waiverEvidenceDueLabel: "With the application",
    },
    languagePolicy: {
      generalStatement: "Taught in Slovak. Without a Slovak maturita, pass a Slovak exam at B2 (ECL).",
    },
    documents: [
      doc("upjs-pf-application", "Application and fee by 31 March 2027", "Electronic application with attachments uploaded (€30) or a signed paper form (€50), by bank transfer with your name in the payment message.", "always", "application", ["upjs-pf-application"]),
      doc("upjs-pf-exam", "Written entrance test", "10 June 2027: secondary-school history, basics of law including the Slovak Constitution, general political and social overview, logical thinking.", "entrance-exam", "admission-day", ["upjs-pf-bc-2027"], "10 June 2027"),
      doc("upjs-pf-waiver", "School reports for admission without the exam", "An average up to 1.50 in the three years before the maturita year: certified copies of the reports, or the grades entered in the e-application from EduPage.", "waiver-claim", "application", ["upjs-pf-bc-2027"]),
      doc("upjs-pf-maturita", "Certified copy of the maturita certificate", "Due by the entrance exam day at the latest.", "always", "admission-day", ["upjs-pf-bc-2027"], "By 10 June 2027"),
      doc("upjs-pf-slovak", "Slovak exam at B2 (ECL)", "Without a Slovak maturita.", "foreign-language-test", "enrolment", ["upjs-pf-bc-2027"]),
      doc("upjs-pf-recognition", "Recognition of a school certificate from abroad", "EU, Ukraine, Russia and China: equivalence statement (doložka rovnocennosti) with a notarised copy of the diploma and a certified Slovak translation. Other countries: nostrification at the regional school office in Košice.", "foreign-education", "enrolment", ["upjs-pf-bc-2027"]),
    ],
    minimumRequirements: [
      { id: "upjs-pf-limits", title: "Places and deadline", description: "The faculty page states no place count. Full-time bachelor applications close on 31 March 2027 (external study 31 May 2027).", sourceIds: ["upjs-pf-bc-2027", "upjs-pf-application"] },
    ],
    sources: upjsPfSources,
    genericRules: {
      language: {
        code: "sk",
        name: "Slovak",
        minimumLevel: "B2",
        exemptCitizenships: [],
        exemptSchools: ["SK"],
        proof: "Without a Slovak maturita, pass a Slovak exam at B2 through ECL.",
        sourceIds: ["upjs-pf-bc-2027"],
      },
      recognition: {
        exemptSchools: ["SK"],
        text: "EU, Ukraine, Russia and China: equivalence statement with a notarised copy of the diploma and a certified Slovak translation. Other countries: nostrification at the regional school office in Košice.",
        sourceIds: ["upjs-pf-bc-2027"],
      },
      entrance: {
        label: "Written test, or average up to 1.50",
        dueLabel: "10 June 2027",
        text: "Written test on 10 June 2027 (history, basics of law and the Constitution, social overview, logical thinking). Without it: an average up to 1.50 in the three years before the maturita year.",
        sourceIds: ["upjs-pf-bc-2027"],
      },
    },
  },
  [
    { id: "upjs-pf-law-bc-2027", programName: "Law", localProgramName: "Právo" },
    {
      id: "upjs-pf-law-trilingual-bc-2027",
      programName: "Law (in Slovak, English and French)",
      localProgramName: "Právo (v slovenskom, anglickom a francúzskom jazyku)",
      patch: {
        durationYears: 4,
        instructionLanguages: [{ code: "sk", name: "Slovak" }, { code: "en", name: "English" }, { code: "fr", name: "French" }],
        languagePolicy: {
          generalStatement: "Taught in Slovak, English and French; command of all three languages is required. Without a Slovak maturita, pass a Slovak exam at B2 (ECL).",
        },
      },
    },
  ],
);
{
  const trilingual = upjsPf[1];
  trilingual.documents = [
    ...trilingual.documents.map((item) =>
      item.id === "upjs-pf-waiver"
        ? { ...item, description: "An average up to 1.50 in the three years before the maturita year, plus an English certificate at B2 or higher or a French certificate at B1 or higher." }
        : item.id === "upjs-pf-exam"
          ? { ...item, description: "10 June 2027: the same test plus English and French." }
          : item,
    ),
  ];
  trilingual.genericRules = {
    ...trilingual.genericRules!,
    entrance: {
      label: "Written test with English and French, or average up to 1.50",
      dueLabel: "10 June 2027",
      text: "Written test on 10 June 2027 including English and French. Without it: an average up to 1.50 plus an English certificate at B2+ or a French certificate at B1+.",
      sourceIds: ["upjs-pf-bc-2027"],
    },
  };
}

// =============================================================== MEDICINE

// ---------------------------------- JLF UK (Martin), General Medicine in English

const jlfEnSources = [
  source("jlf-en-application-2027", "Application process (General Medicine in English)", "Jessenius Faculty of Medicine in Martin, Comenius University", "https://www.jfmed.uniba.sk/en/study/applicants/application-process/"),
];

const jlfEn = programs(
  {
    universityId: "79e938c73e40ae20dfe7",
    universityHost: "uniba.sk",
    universityName: "Comenius University Bratislava",
    faculty: "Jessenius Faculty of Medicine in Martin (JLF UK), English programme",
    country: "Slovakia",
    countryCode: "SK",
    city: "Martin",
    category: "Medicine",
    degreeLevel: "bachelor",
    programType: "long-cycle",
    durationYears: 6,
    instructionLanguages: english,
    application: {
      deadline: "2027-02-28",
      admissionDate: "2027-03-20",
      feeEur: 70,
      applicationUrl: "https://www.jfmed.uniba.sk/en/study/applicants/application-process/",
      // The August and September rounds are only for applicants who need no
      // national visa or residence permit, so they are not used for matching.
      laterRounds: [{ deadline: "2027-06-13", admissionDate: "2027-06-26" }],
      waiverEvidenceDueLabel: "IB certificate with the application",
    },
    languagePolicy: {
      generalStatement: "Taught in English. The faculty page states no English certificate requirement.",
    },
    documents: [
      doc("jlf-en-registration", "Registration and €70 fee", "Passport scan and proof of the €70 payment. Windows for 2027/28: 1 December 2026 – 28 February 2027 (exam 20 March), 1 March – 13 June (26 June), 14 June – 24 July (6 August), 1–31 August 2027 (2 September; only if you need no national visa or residence permit).", "always", "application", ["jlf-en-application-2027"], "By 28 February 2027 for the March exam"),
      doc("jlf-en-exam", "Entrance exam: biology and chemistry", "Pass both to the required standard; you may register more than once. The page lists the March, June and August exams as online but also says testing is in person: confirm with the admission office.", "entrance-exam", "admission-day", ["jlf-en-application-2027"], "20 March, 26 June, 6 August or 2 September 2027"),
      doc("jlf-en-ib", "IB Diploma bonus", "A certified IB Diploma certificate: 38/45 points or more gives 30 bonus points, 30/45 or more gives 20.", "waiver-claim", "application", ["jlf-en-application-2027"]),
      doc("jlf-en-certificate", "Secondary school certificate and fitness certificate", "Certificate of completed secondary education (EQF level 4; may follow later if you are still at school) and a Certificate of Fitness from your doctor. Admitted students also send proof of hepatitis B vaccination.", "always", "enrolment", ["jlf-en-application-2027"]),
      doc("jlf-en-recognition", "Recognition of the school certificate", "If your qualification is in the official recognition database, post the downloaded statement with a verified copy of your certificate; otherwise follow the recognition request procedure on the faculty page.", "foreign-education", "enrolment", ["jlf-en-application-2027"]),
    ],
    minimumRequirements: [
      { id: "jlf-en-places", title: "Up to 150 admitted; tuition €11,500", description: "At most 150 applicants are admitted. Tuition €11,500 a year, paid before the semester starts in mid-September 2027. Admission committee at the end of March, June and August 2027; results in about seven working days, written decision within 30 days. The page mixes regulations of several years (last modified 15 November 2024): confirm the details with the admission office.", sourceIds: ["jlf-en-application-2027"] },
    ],
    sources: jlfEnSources,
    genericRules: {
      language: null,
      languageUnknownNote: "The faculty page states no English certificate requirement for the English programme; the exam and studies are in English.",
      recognition: {
        exemptSchools: ["SK"],
        text: "Check the official recognition database: if your qualification is approved automatically, post the statement with a verified copy of your certificate; otherwise file the recognition request described on the faculty page.",
        sourceIds: ["jlf-en-application-2027"],
      },
      entrance: {
        label: "Entrance exam: biology and chemistry",
        dueLabel: "20 March, 26 June, 6 August or 2 September 2027",
        text: "Biology and chemistry, both passed to the required standard. Exam dates 20 March, 26 June, 6 August and 2 September 2027 (the last two for applicants who need no national visa). IB holders get up to 30 bonus points.",
        sourceIds: ["jlf-en-application-2027"],
      },
    },
  },
  [{ id: "uniba-jlf-medicine-en-2027", programName: "General Medicine (English)", localProgramName: "General Medicine" }],
);

// ---------------------- LF UK Bratislava, General Medicine and Dentistry in English

const fmedEnSources = [
  source("fmed-en-admission-2027", "Admission process (English programmes, 2027/2028)", "Faculty of Medicine, Comenius University Bratislava", "https://www.fmed.uniba.sk/en/study/for-applicants/admission-process/"),
];

const fmedEn = programs(
  {
    universityId: "79e938c73e40ae20dfe7",
    universityHost: "uniba.sk",
    universityName: "Comenius University Bratislava",
    faculty: "Faculty of Medicine (LF UK Bratislava), English programmes",
    country: "Slovakia",
    countryCode: "SK",
    city: "Bratislava",
    category: "Medicine",
    degreeLevel: "bachelor",
    programType: "long-cycle",
    durationYears: 6,
    instructionLanguages: english,
    application: {
      deadline: "2027-02-21",
      admissionDate: "2027-03-15",
      feeEur: 85,
      applicationUrl: "https://www.fmed.uniba.sk/en/study/for-applicants/admission-process/",
      laterRounds: [{ deadline: "2027-07-25", admissionDate: "2027-08-16" }],
      waiverEvidenceDueLabel: "IB route 19 November – 31 December 2026",
    },
    languagePolicy: {
      generalStatement: "Taught in English. No English language certificate is required.",
    },
    documents: [
      doc("fmed-en-application", "Online application, documents and €85 fee", "March round: register 1 January – 21 February 2027 and upload your passport (ID card for EU citizens), the school diploma (or a school letter) and proof of the €85 fee by 21 February. August round: 17 March – 25 July 2027. One application per programme; the fee is paid per programme.", "always", "application", ["fmed-en-admission-2027"], "By 21 February 2027 (March round)"),
      doc("fmed-en-exam", "Entrance exam", "March round online; August round online or in Bratislava. Non-EU applicants should choose March because of visa times. Results within 30 days.", "entrance-exam", "admission-day", ["fmed-en-admission-2027"]),
      doc("fmed-en-ib", "Exam-free admission with the IB Diploma", "Apply 19 November – 31 December 2026 with at least 33 IB points (predicted grades accepted); the official IBO transcript is due by 31 July 2027. IB diplomas from outside Slovakia must be nostrified.", "waiver-claim", "application", ["fmed-en-admission-2027"], "19 November – 31 December 2026"),
      doc("fmed-en-after-admission", "Documents after admission", "By enrolment day: notarised birth certificate with a Slovak translation, medical fitness certificate (faculty form) and proof of hepatitis B vaccination.", "always", "enrolment", ["fmed-en-admission-2027"]),
      doc("fmed-en-recognition", "Recognition statement or nostrification", "By enrolment day: a recognition statement with a notarised, Slovak-translated diploma (EU, Switzerland, Norway, Liechtenstein, UK, Ukraine, Russia and China, school in the online registry), otherwise nostrification at the regional school office.", "foreign-education", "enrolment", ["fmed-en-admission-2027"]),
    ],
    minimumRequirements: [],
    sources: fmedEnSources,
    genericRules: {
      language: null,
      languageUnknownNote: "No English language proficiency certificate is required (faculty page); the exam and studies are in English.",
      recognition: {
        exemptSchools: ["SK"],
        text: "EU, Switzerland, Norway, Liechtenstein, UK, Ukraine, Russia and China (school in the online registry): a recognition statement plus a notarised, Slovak-translated diploma. Others, and IB diplomas from outside Slovakia: nostrification at the regional school office, by enrolment day.",
        sourceIds: ["fmed-en-admission-2027"],
      },
      entrance: {
        label: "Entrance exam (March or August)",
        dueLabel: "15 March 2027 online (August: 16 August)",
        text: "March round online on 15 March 2027 (register by 21 February); August round on 16 August 2027, online or in Bratislava (register 17 March – 25 July). Exam-free with the IB Diploma (33+ points, Biology and Chemistry HL 6+). Results within 30 days; enrolment in September 2027.",
        sourceIds: ["fmed-en-admission-2027"],
      },
    },
  },
  [
    {
      id: "uniba-lf-medicine-en-2027",
      programName: "General Medicine (English)",
      localProgramName: "General Medicine",
      patch: {
        minimumRequirements: [{ id: "fmed-en-gm", title: "About 240 places; tuition €13,500", description: "About 240 places. Tuition €13,500 a year (the same each year of the standard 6 years), paid in full or in instalments by enrolment.", sourceIds: ["fmed-en-admission-2027"] }],
      },
    },
    {
      id: "uniba-lf-dentistry-en-2027",
      programName: "Dentistry (English)",
      localProgramName: "Dentistry",
      patch: {
        durationYears: 5,
        application: {
          deadline: "2027-02-21",
          admissionDate: "2027-03-16",
          feeEur: 85,
          applicationUrl: "https://www.fmed.uniba.sk/en/study/for-applicants/admission-process/",
          laterRounds: [{ deadline: "2027-07-25", admissionDate: "2027-08-17" }],
          waiverEvidenceDueLabel: "IB route 19 November – 31 December 2026",
        },
        minimumRequirements: [{ id: "fmed-en-den", title: "About 50 places; tuition €15,900", description: "About 50 places. Tuition €15,900 a year (the same each year of the standard 5 years). IB route: grade 6 in at least three HL subjects from Biology, Chemistry, Physics, Mathematics, Psychology and Digital Society.", sourceIds: ["fmed-en-admission-2027"] }],
      },
    },
  ],
);
fmedEn[1].genericRules = {
  ...fmedEn[1].genericRules!,
  entrance: {
    label: "Entrance exam (March or August)",
    dueLabel: "16 March 2027 online (August: 17 August)",
    text: "March round online on 16 March 2027 (register by 21 February); August round on 17 August 2027, online or in Bratislava (register 17 March – 25 July). Exam-free with the IB Diploma (33+ points, grade 6 in three listed HL subjects). Results within 30 days; enrolment in September 2027.",
    sourceIds: ["fmed-en-admission-2027"],
  },
};

// ------------------------- LF UK Plzeň, General Medicine and Dentistry in English

const lfpEnSources = [
  source("lfp-en-admission-2027", "All you need to know to apply (2027/2028)", "Faculty of Medicine in Pilsen, Charles University", "https://lfp.cuni.cz/en/faculty-of-medicine-in-pilsen/admission-procedure/"),
];

const lfpEn = programs(
  {
    universityId: "82010c9cd5813db075bc",
    universityHost: "cuni.cz",
    universityName: "Charles University",
    faculty: "Faculty of Medicine in Pilsen, English programmes",
    country: "Czechia",
    countryCode: "CZ",
    city: "Plzeň",
    category: "Medicine",
    degreeLevel: "bachelor",
    programType: "long-cycle",
    durationYears: 6,
    instructionLanguages: english,
    application: {
      deadline: "2027-04-30",
      admissionDate: "2027-05-26",
      feeLabel: "CZK 990 (paid in CZK only)",
      applicationUrl: "https://lfp.cuni.cz/en/faculty-of-medicine-in-pilsen/admission-procedure/",
    },
    languagePolicy: {
      generalStatement: "Taught in English. The faculty page states no English certificate requirement.",
    },
    documents: [
      doc("lfp-en-application", "Application and CZK 990 fee by 30 April 2027", "1 November 2026 – 30 April 2027; later applications are not accepted.", "always", "application", ["lfp-en-admission-2027"]),
      doc("lfp-en-exam", "Written test: chemistry, biology, physics", "In Pilsen on 26 May 2027 (alternative 28 June 2027); exams abroad run by agencies May–August (dates to be announced). You are notified at least 15 days before.", "entrance-exam", "admission-day", ["lfp-en-admission-2027"], "26 May 2027 (alternative 28 June)"),
      doc("lfp-en-diploma", "Certified hard copy of your diploma", "By post or in person to the admission office by 31 August 2027 (not by email); legalisation or apostille in the issuing country; official Czech or English translation if not in Czech, English or Slovak.", "always", "enrolment", ["lfp-en-admission-2027"], "By 31 August 2027"),
      doc("lfp-en-recognition", "Assessment of foreign secondary education", "Requested separately for CZK 1,050.", "foreign-education", "enrolment", ["lfp-en-admission-2027"]),
    ],
    minimumRequirements: [],
    sources: lfpEnSources,
    genericRules: {
      language: null,
      languageUnknownNote: "The faculty page states no English certificate requirement for the English programmes; the test and studies are in English.",
      recognition: {
        exemptSchools: ["CZ"],
        text: "Foreign secondary education is assessed for CZK 1,050. Send a certified hard copy of the diploma (legalised or apostilled in the issuing country, translated if needed) by 31 August 2027.",
        sourceIds: ["lfp-en-admission-2027"],
      },
      entrance: {
        label: "Written test: chemistry, biology, physics",
        dueLabel: "26 May 2027 (alternative 28 June)",
        text: "20 questions per subject, one point each, no negative marking. In Pilsen on 26 May 2027 or 28 June 2027 (register by 30 April); agency exams abroad May–August. Admission letter after your documents are legalised and all criteria are met; enrolment in July and September 2027.",
        sourceIds: ["lfp-en-admission-2027"],
      },
    },
  },
  [
    {
      id: "lfp-medicine-en-2027",
      programName: "General Medicine (English)",
      localProgramName: "General Medicine",
      patch: { minimumRequirements: [{ id: "lfp-en-gm", title: "Tuition CZK 390,000", description: "Tuition CZK 390,000 a year, paid in full before enrolment. The page states no place count. Non-Schengen applicants need a one-year student visa before the academic year.", sourceIds: ["lfp-en-admission-2027"] }] },
    },
    {
      id: "lfp-dentistry-en-2027",
      programName: "Dentistry (English)",
      localProgramName: "Dentistry",
      patch: {
        durationYears: 5,
        minimumRequirements: [{ id: "lfp-en-den", title: "Tuition CZK 410,000", description: "Tuition CZK 410,000 a year, paid in full before enrolment. The page states no place count. Non-Schengen applicants need a one-year student visa before the academic year.", sourceIds: ["lfp-en-admission-2027"] }],
      },
    },
  ],
);

// ===================================================== ECONOMICS & BUSINESS

// --------------------------------------- PEF ČZU (Prague), English programmes

const czuSources = [
  source("czu-pef-en-2027", "Dean's directive 16/2026: admission to English-taught bachelor programmes, 2027/2028", "Faculty of Economics and Management, Czech University of Life Sciences Prague", "https://www.pef.czu.cz/dl/112854"),
];

const czuPef = programs(
  {
    universityId: "9dfc6d761c3593418be7",
    universityHost: "czu.cz",
    universityName: "Czech University of Life Sciences Prague",
    faculty: "Faculty of Economics and Management (PEF ČZU), English programmes",
    country: "Czechia",
    countryCode: "CZ",
    city: "Prague",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: english,
    application: {
      deadline: "2027-03-31",
      admissionDate: "2027-04-24",
      feeLabel: "CZK 850 or €35 per application (card, not refunded)",
      applicationUrl: "https://is.czu.cz/prihlaska/",
    },
    languagePolicy: {
      generalStatement: "Taught in English. The directive states no English certificate requirement.",
    },
    documents: [
      doc("czu-pef-application", "E-application with documents and fee", "Five stages; the last runs 6 – 31 March 2027. Earlier stages: until 29 October 2026, 15 January, 5 February and 5 March 2027. Only complete, paid, error-free applications are evaluated.", "always", "application", ["czu-pef-en-2027"], "By 31 March 2027 (last stage)"),
      doc("czu-pef-gap", "SCIO General Academic Prerequisites (GAP) test", "Register by the stage's date (last stage: 16 April for the test on 24 April 2027). Official GAP results from 2023–2026 can be uploaded; the better result counts.", "entrance-exam", "admission-day", ["czu-pef-en-2027"], "Last stage: test 24 April 2027"),
      doc("czu-pef-recognition", "Nostrified certificate or assessment", "Educated abroad: a nostrified school-leaving certificate, or a request for assessment in the admission procedure (Rector's directive 2/2021). Without it you cannot be enrolled.", "foreign-education", "enrolment", ["czu-pef-en-2027"]),
      doc("czu-pef-enrolment", "Maturita certificate and tuition", "Present the certificate at enrolment (June–July 2027, alternative date in September) and pay the tuition before enrolment.", "always", "enrolment", ["czu-pef-en-2027"]),
    ],
    minimumRequirements: [],
    sources: czuSources,
    genericRules: {
      language: null,
      languageUnknownNote: "The faculty's directive states no English certificate requirement; the GAP test and studies are in English.",
      recognition: {
        exemptSchools: ["CZ"],
        text: "A nostrified school-leaving certificate, or a request to assess your foreign secondary education during admission (Rector's directive 2/2021).",
        sourceIds: ["czu-pef-en-2027"],
      },
      entrance: {
        label: "SCIO GAP test (0–100 points)",
        dueLabel: "Stage tests 5 November 2026 – 24 April 2027",
        text: "Ranked by GAP score; the committee sets the threshold. Tests 5 November 2026, 30 January, 20 February, 20 March and 24 April 2027; results by 20 November 2026, 13 February, 15 March, 12 April and 14 May 2027. The programme opens only with enough students.",
        sourceIds: ["czu-pef-en-2027"],
      },
    },
  },
  [
    {
      id: "czu-pef-business-administration-en-2027",
      programName: "Business Administration",
      localProgramName: "Business Administration",
      patch: { minimumRequirements: [{ id: "czu-ba-tuition", title: "Tuition", description: "CZK 12,500 a year for EU citizens, CZK 65,000 for non-EU citizens. No place count stated.", sourceIds: ["czu-pef-en-2027"] }] },
    },
    {
      id: "czu-pef-economics-management-en-2027",
      programName: "Economics and Management",
      localProgramName: "Economics and Management",
      patch: { minimumRequirements: [{ id: "czu-em-tuition", title: "Tuition", description: "CZK 12,500 a year for EU citizens, CZK 50,000 for non-EU citizens. No place count stated.", sourceIds: ["czu-pef-en-2027"] }] },
    },
  ],
);

// ------------------------------------------------ FES UPCE (Pardubice, Czech)

const upceSources = [
  source("upce-fes-bc-2027", "Admission 2027/2028: guide for applicants", "Faculty of Economics and Administration, University of Pardubice", "https://fes.upce.cz/fes/pro-uchazece/info-prij-riz.html"),
];

const upceTest = {
  label: "Test of critical and creative thinking",
  dueLabel: "9 or 16 April, or 10–11 June 2027",
  text: "20 questions in 40 minutes; at least 20 of 100 points. Choose 9 April, 16 April or 10–11 June 2027 in the e-application (visible once the fee is paid). Bonus points: maths maturita or Maths+ (50), English B2+ certificate (50).",
  sourceIds: ["upce-fes-bc-2027"],
};

const upceFes = programs(
  {
    universityId: "2bfd32a30f1f5791a827",
    universityHost: "upce.cz",
    universityName: "University of Pardubice",
    faculty: "Faculty of Economics and Administration (FES UPCE)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Pardubice",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: czech,
    application: {
      deadline: "2027-03-31",
      admissionDate: "2027-04-09",
      feeLabel: "CZK 650 (not refunded)",
      applicationUrl: "https://fes.upce.cz/fes/pro-uchazece/info-prij-riz.html",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. The 2027/28 guide states no Czech proof (a separate guide for foreign applicants exists).",
    },
    documents: [
      doc("upce-fes-application", "E-application and CZK 650 fee by 31 March 2027", "eprihlaska.upce.cz, 1 November 2026 – 31 March 2027; variable symbol 4920, constant 308, specific = applicant number. No limit on applications.", "always", "application", ["upce-fes-bc-2027"]),
      doc("upce-fes-exam", "Entrance test", "Choose a date in the e-application.", "entrance-exam", "admission-day", ["upce-fes-bc-2027"]),
      doc("upce-fes-documents", "Maturita and bonus documents", "Upload proof of a passed maturita and authorised conversions of the certificate and bonus documents (not needed for documents already e-signed) by 12 June 2027.", "always", "enrolment", ["upce-fes-bc-2027"], "By 12 June 2027"),
      doc("upce-fes-recognition", "Recognition of education from abroad", "Use the faculty's recognition form for foreign education in the admission procedure.", "foreign-education", "enrolment", ["upce-fes-bc-2027"]),
    ],
    minimumRequirements: [
      { id: "upce-fes-dates", title: "Decision and enrolment", description: "The dean's decision arrives in the e-application; freed places go to the next applicants in rank order. Online enrolment 25–28 June 2027. No place counts on the page.", sourceIds: ["upce-fes-bc-2027"] },
    ],
    sources: upceSources,
    genericRules: {
      language: null,
      languageUnknownNote: "The faculty's 2027/28 guide states no Czech proof for applicants from abroad (a separate PDF guide covers them). Ask the faculty.",
      recognition: {
        exemptSchools: ["CZ"],
        text: "Foreign qualifications go through the faculty's recognition form for foreign education in the admission procedure.",
        sourceIds: ["upce-fes-bc-2027"],
      },
      entrance: upceTest,
    },
  },
  [
    { id: "upce-fes-economics-management-bc-2027", programName: "Economics and Management", localProgramName: "Ekonomika a management" },
    { id: "upce-fes-digital-business-bc-2027", programName: "Digital Business", localProgramName: "Digitální podnikání" },
    {
      id: "upce-fes-finance-bc-2027",
      programName: "Finance",
      localProgramName: "Finance",
      patch: {
        application: {
          deadline: "2027-03-31",
          admissionDate: "2027-05-31",
          feeLabel: "CZK 650 (not refunded)",
          applicationUrl: "https://fes.upce.cz/fes/pro-uchazece/info-prij-riz.html",
        },
      },
    },
  ],
);
upceFes[2].genericRules = {
  ...upceFes[2].genericRules!,
  entrance: {
    label: "SCIO OSP or Mathematics, 20th percentile",
    dueLabel: "SCIO tests 1 December 2026 – 31 May 2027",
    text: "Take SCIO OSP or Mathematics between 1 December 2026 and 31 May 2027 (at least the 20th percentile) and consent to SCIO sharing the results with the university. Bonus points: maths maturita or Maths+ (50), English B2+ certificate (50).",
    sourceIds: ["upce-fes-bc-2027"],
  },
};
upceFes[2].documents = upceFes[2].documents.map((item) =>
  item.id === "upce-fes-exam"
    ? { ...item, title: "SCIO OSP or Mathematics", description: "Between 1 December 2026 and 31 May 2027, with consent to share the results.", dueLabel: "By 31 May 2027" }
    : item,
);

// ======================================================= COMPUTER SCIENCE

// ------------------------------------------------- FIS VŠE (Prague, Czech)

const fisSources = [
  source("vse-fis-bc-2027", "Bachelor admission (2027/2028)", "Faculty of Informatics and Statistics, Prague University of Economics and Business", "https://fis.vse.cz/bakalarske-studium/prijimaci-rizeni/"),
];

const fis = programs(
  {
    universityId: "aa8f2e91b2d0d7cc779d",
    universityHost: "vse.cz",
    universityName: "Prague University of Economics and Business",
    faculty: "Faculty of Informatics and Statistics (FIS VŠE)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Prague",
    category: "Computer Science",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: czech,
    application: {
      deadline: "2027-04-30",
      admissionDate: "2027-05-22",
      feeLabel: "CZK 1,050 (credited by 30 April 2027; not refunded)",
      applicationUrl: "https://fis.vse.cz/bakalarske-studium/prijimaci-rizeni/",
      waiverEvidenceDueLabel: "30 April, 31 May or 6 June 2027 by route",
    },
    languagePolicy: {
      generalStatement: "Taught in Czech. The admission page refers foreign applicants to a separate page and states no Czech proof.",
    },
    documents: [
      doc("vse-fis-application", "One VŠE application and CZK 1,050 fee", "From 1 December 2026 at prihlasky.vse.cz: a main programme and up to two alternatives in a binding order; the fee must be credited by 30 April 2027.", "always", "application", ["vse-fis-bc-2027"], "Fee credited by 30 April 2027"),
      doc("vse-fis-scio", "SCIO OSP/VŠP with consent for FIS", "Any sittings December 2026 – May 2027 (best result counts); consent in your SCIO profile to send results to FIS. Free mini test on 22 May 2027 with a SCIO voucher.", "entrance-exam", "admission-day", ["vse-fis-bc-2027"], "December 2026 – May 2027"),
      doc("vse-fis-waiver", "Evidence for admission without the exam", "Maths and English averages of 1.75 or better on the last seven report cards (by 30 April 2027), Matematika rozšiřující at 50%+ (by 6 June 2027) or national competitions (by 31 May 2027). Aplikovaná informatika must be your first choice.", "waiver-claim", "application", ["vse-fis-bc-2027"]),
      doc("vse-fis-recognition", "Recognition of education from abroad", "A recognition under § 48 of the Higher Education Act, or VŠE's own assessment (paid; start it with the faculty well before enrolment).", "foreign-education", "enrolment", ["vse-fis-bc-2027"]),
      doc("vse-fis-enrolment", "Online enrolment and maturita", "Admitted with the exam: 17–22 June 2027 (without the exam from 13 May; the page gives 9 and 19 June as end dates). Digitally signed copy of the maturita certificate by the enrolment deadline.", "always", "enrolment", ["vse-fis-bc-2027"], "17–22 June 2027"),
    ],
    minimumRequirements: [
      { id: "vse-fis-ranking", title: "SCIO score: verbal 0.3, analytical 0.7", description: "Older results than December 2026 are not accepted. The page states no place count or results date.", sourceIds: ["vse-fis-bc-2027"] },
    ],
    sources: fisSources,
    genericRules: {
      language: null,
      languageUnknownNote: "The FIS admission page states no Czech proof for applicants from abroad (it links a separate page for foreigners). Ask the faculty.",
      recognition: {
        exemptSchools: ["CZ", "SK"],
        text: "Foreign qualifications count through § 48 of the Higher Education Act or VŠE's paid assessment, started with the faculty well before enrolment.",
        sourceIds: ["vse-fis-bc-2027"],
      },
      entrance: {
        label: "SCIO OSP/VŠP (verbal 0.3, analytical 0.7)",
        dueLabel: "December 2026 – May 2027; free mini test 22 May",
        text: "Your best SCIO OSP/VŠP result from December 2026 to May 2027 counts (verbal × 0.3 + analytical × 0.7); FIS accepts only results sent by SCIO with your consent. Waivers: school averages, Matematika rozšiřující or competitions.",
        sourceIds: ["vse-fis-bc-2027"],
      },
    },
  },
  [{ id: "vse-fis-applied-informatics-bc-2027", programName: "Applied Informatics", localProgramName: "Aplikovaná informatika" }],
);

// ------------------------------- FP VUT Manažerská informatika (Brno, Czech)

const vutFpBase = vutFp[0];
const vutFpInformatics: AdmissionProgram = {
  ...vutFpBase,
  id: "vut-fp-management-informatics-bc-2027",
  programName: "Management Informatics",
  localProgramName: "Manažerská informatika",
  category: "Computer Science",
  application: { ...vutFpBase.application, admissionDate: "2027-05-22" },
  documents: vutFpBase.documents.map((item) =>
    item.id === "vut-fp-exam" ? { ...item, description: "22 May 2027; invitation by email at least 14 days before.", dueLabel: "22 May 2027" } : item,
  ),
  genericRules: {
    ...vutFpBase.genericRules!,
    entrance: {
      ...vutFpBase.genericRules!.entrance,
      dueLabel: "22 May 2027; results 1 June",
      text: "Written test of study prerequisites on 22 May 2027 (at least 30 of 100 points), or admission without it: SCIO OSP (5 December 2026 – 20 March 2027) or SCIO Mathematics (30 January – 20 March 2027) at the 50th percentile, a top-three Business Point placing, or the faculty's maths course. Evidence by 31 March 2027.",
    },
  },
};

export const verifiedFieldProgramsSecond: readonly AdmissionProgram[] = [
  ...upjsPf,
  ...jlfEn,
  ...fmedEn,
  ...lfpEn,
  ...czuPef,
  ...upceFes,
  ...fis,
  vutFpInformatics,
];
