import { englishTaught, europeDoc as doc, europePrograms as programs, europeSource as source } from "@/data/verified-europe-helpers";
import type { AdmissionProgram } from "@/types/admission";

// German programmes verified on 2026-11-26: those whose pages name the 2027
// intake. Germany's student visa is a DocRoute-checked route
// (study-routes.ts). Still "coming soon": TU Munich and KIT informatics and
// Charité medicine, whose pages give the winter deadline (15 July) without
// a year and do not name the German level.

const germany = ["DE"];

// ---------------------------------------------------- Saarland University

const saarSources = [
  source("saar-cs-programme", "Computer Science (BSc, English-taught)", "Saarland University", "https://www.uni-saarland.de/en/study/programmes/bachelor/computer-science.html"),
  source("saar-cs-faq", "Computer Science bachelor: FAQ (2027 intake)", "Saarland Informatics Campus, Saarland University", "https://saarland-informatics-campus.de/en/computerscience-course/faq/"),
];

const saarland = programs(
  {
    universityId: "1950f4e7cb5488edd9a0",
    universityHost: "uni-saarland.de",
    universityName: "Saarland University",
    faculty: "Saarland Informatics Campus",
    country: "Germany",
    countryCode: "DE",
    city: "Saarbrücken",
    category: "Computer Science",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: englishTaught,
    application: {
      deadline: "2027-07-15",
      admissionDate: "2027-07-15",
      feeLabel: "No application fee stated; no tuition, semester fee only",
      applicationUrl: "https://saarland-informatics-campus.de/en/computerscience-course/faq/",
      languageProofDueLabel: "With the application",
    },
    languagePolicy: {
      generalStatement: "Taught in English; no German needed. English proof (IELTS Academic, TOEFL iBT or Essential, Cambridge, PTE Academic) unless you are a native speaker; the page states no minimum score and recommends B2 (advanced).",
    },
    documents: [
      doc("saar-apply", "Online application form (no uni-assist)", "Apply only through applications.saarland-informatics-campus.de. Early review deadlines 15 January and 15 April 2027; final deadline 15 July 2027.", "always", "application", ["saar-cs-faq"], "Early 15 January / 15 April; final 15 July 2027"),
      doc("saar-hzb", "University entrance qualification", "Your school-leaving certificate; it must give direct access to German universities (anabin: “Direkter Zugang (für alle Fächer)”). Digital copies are enough; sworn translations unless in English, German or French.", "always", "application", ["saar-cs-faq"]),
      doc("saar-track", "Olympiad or aptitude-track evidence", "Olympiad certificates, or an aptitude test (for example SAT, ACT or TestAS) taken within the last two years plus a video interview.", "entrance-exam", "application", ["saar-cs-faq"]),
      doc("saar-english", "English test result", "IELTS Academic, TOEFL iBT or Essential, Cambridge or PTE Academic, unless you are a native speaker (no minimum score is stated).", "foreign-language-test", "application", ["saar-cs-faq"]),
    ],
    minimumRequirements: [
      { id: "saar-restricted", title: "Admission-restricted, winter start only", description: "Applications open from December via the SIC portal; optional early review on 15 January and 15 April, regular deadline 15 July.", sourceIds: ["saar-cs-programme", "saar-cs-faq"] },
      { id: "saar-direct-access", title: "Direct access needed", description: "Qualifications that only lead to a Studienkolleg cannot enter this English degree.", sourceIds: ["saar-cs-faq"] },
      { id: "saar-fees", title: "No tuition", description: "No tuition fee; a semester fee applies (amount on the university's fee page).", sourceIds: ["saar-cs-programme"] },
    ],
    sources: saarSources,
    genericRules: {
      // The FAQ requires a certificate but names no minimum score; the
      // programme page recommends B2 (advanced), so the route asks for one.
      language: {
        code: "en",
        name: "English",
        minimumLevel: "B2",
        exemptCitizenships: [],
        exemptSchools: [],
        proof: "An IELTS Academic, TOEFL iBT or Essential, Cambridge or PTE Academic certificate unless you are a native speaker. No minimum score is stated; the programme page recommends B2 (advanced).",
        sourceIds: ["saar-cs-faq", "saar-cs-programme"],
      },
      recognition: {
        exemptSchools: germany,
        text: "Your certificate must give direct access to German universities (anabin “Direkter Zugang (für alle Fächer)”); Studienkolleg-level qualifications do not qualify.",
        sourceIds: ["saar-cs-faq"],
      },
      entrance: {
        label: "Olympiad or aptitude track (test plus video interview)",
        dueLabel: "With the application (early 15 January / 15 April, final 15 July 2027)",
        text: "Show olympiad results, or an aptitude test (SAT, ACT or TestAS within two years) and a video interview.",
        sourceIds: ["saar-cs-faq"],
      },
    },
  },
  [{ id: "saarland-cs-bsc-2027", programName: "Computer Science (English)", localProgramName: "Computer Science" }],
);

// ----------------------------------------------- Constructor University

const constructorSources = [
  source("constructor-undergraduate-2027", "Application information: undergraduate (Fall 2027)", "Constructor University Bremen", "https://constructor.university/admission-aid/application-information-undergraduate"),
  source("constructor-costs-2027", "2027 bachelor cost of attendance (fact sheet)", "Constructor University Bremen", "https://constructor.university/sites/default/files/2026-10/2027_CU_Fact_Sheet_Bachelor_Cost_of_Attendance.pdf"),
];

const constructorCs = programs(
  {
    universityId: "1d050eaf6a5faeb98936",
    universityHost: "jacobs-university.de",
    universityName: "Constructor University",
    faculty: "School of Computer Science and Engineering",
    country: "Germany",
    countryCode: "DE",
    city: "Bremen",
    category: "Computer Science",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: englishTaught,
    application: {
      deadline: "2027-02-01",
      admissionDate: "2027-02-01",
      feeLabel: "No application fee listed",
      applicationUrl: "https://constructor.university/admission-aid/application-information-undergraduate",
      languageProofDueLabel: "With the application",
      laterRounds: [{ deadline: "2027-07-31", admissionDate: "2027-07-31" }],
    },
    languagePolicy: {
      generalStatement: "Private university, taught in English. IELTS 6.5, TOEFL iBT 90 (4.5 on the new scale), Duolingo 110, PTE Academic 58 or MET 58.",
    },
    documents: [
      doc("constructor-apply", "Online application", "Early Action 1 October 2026 – 1 February 2027; Rolling Admissions (visa and no-visa applicants) 2 February – 31 July 2027. Decisions usually in 2–4 weeks.", "always", "application", ["constructor-undergraduate-2027"]),
      doc("constructor-file", "Passport, transcripts, CV and motivation statement", "Proof of identity (a passport for non-EU citizens), transcripts or report cards, a CV as one PDF and a motivation statement; a recommendation letter is optional.", "always", "application", ["constructor-undergraduate-2027"]),
      doc("constructor-english", "English test result", "IELTS 6.5, TOEFL iBT 90 (4.5 on the new scale), Duolingo 110, PTE Academic 58 or MET 58. Waivers may apply to native speakers, six or more years of English-taught schooling, or SAT Reading and Writing 600+.", "foreign-language-test", "application", ["constructor-undergraduate-2027"]),
      doc("constructor-sat", "SAT or ACT, if your diploma needs it", "Not needed for admission, but may be required for enrolment if your diploma does not give direct admission to a German university.", "foreign-education", "enrolment", ["constructor-undergraduate-2027"]),
    ],
    minimumRequirements: [
      { id: "constructor-rounds", title: "Rolling admission in two windows", description: "Early Action closes 1 February 2027; Rolling Admissions run 2 February – 31 July 2027. The earlier you apply, the earlier you hear.", sourceIds: ["constructor-undergraduate-2027"] },
      { id: "constructor-costs", title: "Tuition 2027: €11,925 a semester", description: "Same for EU and non-EU students. One-time enrolment fee €940 for non-EU students, university fee €95 a semester; rooms from €1,890 and the meal plan €2,625 a semester.", sourceIds: ["constructor-costs-2027"] },
    ],
    sources: constructorSources,
    genericRules: {
      language: {
        code: "en",
        name: "English",
        minimumLevel: "B2",
        exemptCitizenships: [],
        exemptSchools: [],
        proof: "IELTS 6.5, TOEFL iBT 90 (4.5 new scale), Duolingo 110, PTE Academic 58 or MET 58; waivers for native speakers, six years of English-taught school or SAT Reading and Writing 600+.",
        sourceIds: ["constructor-undergraduate-2027"],
      },
      recognition: {
        exemptSchools: germany,
        text: "If your diploma does not give direct admission to a German university, SAT or ACT results may be required for enrolment.",
        sourceIds: ["constructor-undergraduate-2027"],
      },
      entrance: {
        label: "File review (no entrance exam)",
        dueLabel: "Decision usually 2–4 weeks after you apply",
        text: "Constructor reviews your file on a rolling basis; SAT and ACT are not required for admission.",
        sourceIds: ["constructor-undergraduate-2027"],
      },
    },
  },
  [{ id: "constructor-cs-bsc-2027", programName: "Computer Science (English)", localProgramName: "Computer Science" }],
);

// -------------------------------------------------------- Frankfurt School

const fsSources = [
  source("fs-bba-2027", "Bachelor in Business Administration (BSc), start 1 September 2027", "Frankfurt School of Finance & Management", "https://www.frankfurt-school.de/en/home/programmes/bachelor/bachelor-in-business-administration"),
];

const frankfurtSchool = programs(
  {
    universityId: "dc52281b3f84c35e587a",
    universityHost: "frankfurt-school.de",
    universityName: "Frankfurt School of Finance & Management",
    faculty: "Bachelor in Business Administration",
    country: "Germany",
    countryCode: "DE",
    city: "Frankfurt am Main",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    durationYears: 3.5,
    instructionLanguages: englishTaught,
    application: {
      deadline: "2027-06-30",
      admissionDate: "2027-06-30",
      feeEur: 100,
      applicationUrl: "https://www.frankfurt-school.de/en/home/programmes/bachelor/bachelor-in-business-administration",
      languageProofDueLabel: "Tested at the Assessment Centre",
    },
    languagePolicy: {
      generalStatement: "Private business school. Start in English or German; every course is in English from the 4th semester. No English certificate up front: English is tested at the Assessment Centre.",
    },
    documents: [
      doc("fs-apply", "Online application and €100 fee", "Apply online with your school diploma (your last two upper-secondary reports are enough at first), CV, passport or ID and an optional motivation letter (up to 500 words). The €100 fee is paid before processing. Rolling admission until 30 June 2027.", "always", "application", ["fs-bba-2027"]),
      doc("fs-ac", "Online Assessment Centre", "Quantitative, figural and verbal reasoning tests, graph and table analysis, an English assessment and a structured interview. Dates: 20 January, 17 February and 17 March 2027 (more to follow); apply at least two weeks before your date.", "entrance-exam", "admission-day", ["fs-bba-2027"], "20 January, 17 February or 17 March 2027"),
      doc("fs-diploma", "Recognised school-leaving certificate", "A recognised school-leaving certificate such as the Abitur or IB Diploma, by enrolment.", "always", "enrolment", ["fs-bba-2027"]),
    ],
    minimumRequirements: [
      { id: "fs-fees", title: "Tuition €8,600 a semester", description: "Seven full-time semesters (210 ECTS), the 5th abroad with an internship. €100 application fee and €600 enrolment fee.", sourceIds: ["fs-bba-2027"] },
    ],
    sources: fsSources,
    genericRules: {
      language: {
        code: "en",
        name: "English",
        minimumLevel: "B2",
        exemptCitizenships: [],
        exemptSchools: [],
        proof: "No certificate needed: English is assessed at the Assessment Centre.",
        sourceIds: ["fs-bba-2027"],
        assessedByUniversity: true,
      },
      recognition: {
        exemptSchools: germany,
        text: "A recognised school-leaving certificate (for example Abitur, IB Diploma, US High School Diploma, A-levels).",
        sourceIds: ["fs-bba-2027"],
      },
      entrance: {
        label: "Online Assessment Centre with interview",
        dueLabel: "20 January, 17 February or 17 March 2027 (more to follow)",
        text: "Reasoning tests, an English assessment and a structured interview; apply at least two weeks before your date.",
        sourceIds: ["fs-bba-2027"],
      },
    },
  },
  [{ id: "fs-bba-bsc-2027", programName: "Business Administration (BSc)", localProgramName: "Bachelor in Business Administration" }],
);

export const verifiedGermanyPrograms: readonly AdmissionProgram[] = [...saarland, ...constructorCs, ...frankfurtSchool];
