import type { DegreeLevel, OfficialSource, StudyIntake } from "@/types/admission";

// Programs whose admission rules for the intake are announced but not yet
// published in final, approved form. They are listed so people can see what
// is coming, but they never produce a match, checklist or route. Never put
// numbers from a draft into the group itself: a pending entry becomes an
// AdmissionProgram only after the approved rules for exactly this intake are
// checked.
//
// `referenceRules` is the one exception, kept apart on purpose: approved,
// published rules shown only as reference with their own sources. Usually
// they belong to the previous intake ("last year's rules, for orientation");
// when the faculty has already published the rules for `intake` but DocRoute
// has not built a verified route from them yet, they belong to `intake`
// itself ("published rules, reference"). The matcher never reads them.
export type ReferenceRules = {
  // The intake the rules were approved for, e.g. "2026/27". Never later
  // than the group's intake (a test checks it).
  intake: string;
  approvedNote: string;
  facts: ReadonlyArray<{ label: string; value: string }>;
  programRules: ReadonlyArray<{ localProgramName: string; rule: string }>;
  // Fills the three requirement cards on the university page (application
  // documents, entrance requirements, after admission) with the same
  // "last year, for orientation" label.
  overview: {
    applicationDocuments: readonly string[];
    entranceRequirements: readonly string[];
    afterAdmission: readonly string[];
  };
  sources: OfficialSource[];
  checkedAt: string;
};

export type PendingProgramGroup = {
  id: string;
  universityId: string;
  universityHost: string;
  universityName: string;
  faculty: string;
  country: string;
  countryCode: string;
  city: string;
  category: string;
  // "long-cycle": medicine and dentistry (MUDr./MDDr.) or Czech law (Mgr.),
  // combined first and second cycle entered straight from secondary school
  // like a bachelor's.
  degreeLevel: DegreeLevel | "long-cycle";
  intake: StudyIntake;
  // "rules-awaiting-approval": a draft for the intake exists;
  // "rules-not-published": nothing for the intake is published yet;
  // "rules-published": the intake's rules are out (summarised in
  // referenceRules) but not yet turned into a verified route.
  status: "rules-awaiting-approval" | "rules-not-published" | "rules-published";
  statusNote: string;
  programs: ReadonlyArray<{
    programName: string;
    localProgramName: string;
  }>;
  sources: OfficialSource[];
  checkedAt: string;
  referenceRules?: ReferenceRules;
};

export const pendingProgramGroups: readonly PendingProgramGroup[] = [
  {
    id: "uniba-fmfi-computing-bsc-2027",
    universityId: "79e938c73e40ae20dfe7",
    universityHost: "uniba.sk",
    universityName: "Comenius University Bratislava",
    faculty: "Faculty of Mathematics, Physics and Informatics",
    country: "Slovakia",
    countryCode: "SK",
    city: "Bratislava",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-awaiting-approval",
    statusNote:
      "The faculty's admission conditions for 2027/28 were submitted to its Academic Senate on 19 October 2026 as a draft. On 29 October 2026 the faculty's bachelor admission page still described 2026/27, so DocRoute does not build a personalised route or document checklist for these programs yet.",
    programs: [
      {
        programName: "Computer Science",
        localProgramName: "Informatika",
      },
      {
        programName: "Applied Informatics",
        localProgramName: "Aplikovaná informatika",
      },
      {
        programName: "Data Science",
        localProgramName: "Dátová veda",
      },
      {
        programName: "Bioinformatics",
        localProgramName: "Bioinformatika",
      },
    ],
    sources: [
      {
        id: "fmfi-senate-2026-10-19",
        title:
          "Academic Senate session of 19 October 2026: draft admission conditions for bachelor study, 2027/2028",
        publisher:
          "Faculty of Mathematics, Physics and Informatics, Comenius University Bratislava",
        url: "https://fmph.uniba.sk/o-fakulte/akademicky-senat/prehlad-zasadnuti-as/zasadnutie-as-dna-19102026/",
        checkedAt: "2026-10-23",
      },
      {
        id: "fmfi-bachelor-admission",
        title: "Bachelor study: admission (page still describes 2026/27)",
        publisher:
          "Faculty of Mathematics, Physics and Informatics, Comenius University Bratislava",
        url: "https://fmph.uniba.sk/studium/prijimacie-konanie/bakalarske-studium/",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote:
        "Approved by the faculty's Academic Senate on 1 December 2025 for 2026/27 entry.",
      facts: [
        {
          label: "Application deadline",
          value:
            "31 March 2026 (the faculty later extended it to 12 April 2026). Study results had to reach the faculty by 30 April 2026. A second round in July–August could be opened by the dean.",
        },
        {
          label: "Application",
          value:
            "Up to three programs in one application, in order of priority. Fee €15 for an electronic application, €33 on paper.",
        },
        {
          label: "No entrance exam",
          value:
            "Admission by one of: olympiad or competition results (e.g. regional or national olympiad round, programming or maths correspondence seminar with at least 65%), school grades in a profile subject (maths or informatics), or a maths percentile. Applicants who meet none of these were ranked by their best maths percentile (0 without a test).",
        },
        {
          label: "Maths percentile",
          value:
            "From the external part of the Slovak maturita, the Czech maturita maths test, or a SCIO maths test (other test providers only on request). Results from school years 2022/23 to 2025/26 counted.",
        },
        {
          label: "School outside the EU",
          value:
            "Admission was based on the SCIO maths test percentile, with the same thresholds as below.",
        },
        {
          label: "Language",
          value:
            "Programs are taught in Slovak; the requirement is Slovak at least B1. Without a Slovak or Czech maturita a B1 certificate was recommended.",
        },
        {
          label: "School certificate from abroad",
          value:
            "Outside Slovakia and Czechia: an official translation plus the recognition stamp (uznávacia doložka) or a nostrification decision from the regional school office, on paper.",
        },
      ],
      programRules: [
        {
          localProgramName: "Informatika",
          rule: "Grade 1 in one profile subject in every year, or maths percentile 60+. Planned intake 100 (with the 4-year variant, which had a lower threshold).",
        },
        {
          localProgramName: "Aplikovaná informatika",
          rule: "Grade 1 in all profile subjects in every year, or the internal maturita part in one profile subject, or maths percentile 50+. Planned intake 200.",
        },
        {
          localProgramName: "Dátová veda",
          rule: "Grade 1 in one profile subject in every year, or maths percentile 80+. Planned intake 30 (with the 4-year variant).",
        },
        {
          localProgramName: "Bioinformatika",
          rule: "Grade 1 in one profile subject in every year, or maths percentile 70+. Planned intake 15 (with the 4-year variant).",
        },
      ],
      overview: {
        applicationDocuments: [
          "Application for up to three programs (electronic €15, paper €33), by 31 March 2026 (extended to 12 April).",
          "Report cards, maturita or test results and olympiad diplomas: upload by 31 March or deliver by 30 April 2026.",
          "School outside Slovakia/Czechia: official translation plus recognition stamp or nostrification decision, on paper.",
        ],
        entranceRequirements: [
          "No entrance exam: olympiads, grade 1 in a profile subject in every year, or a maths percentile (Computer Science 60+, Applied Informatics 50+, Data Science 80+, Bioinformatics 70+).",
          "School outside the EU: SCIO maths percentile with the same thresholds.",
          "Slovak at least B1 (a B1 certificate recommended without a Slovak or Czech maturita).",
        ],
        afterAdmission: [
          "Decision by post, usually in June.",
          "Electronic enrolment form in AIS2 by 6 July 2026, photo for the student card, card fee (ISIC €26, other card €13).",
          "Dormitory request 20–31 July 2026.",
        ],
      },
      sources: [
        {
          id: "fmfi-conditions-2026-27",
          title:
            "Admission conditions for bachelor study programs in 2026/2027 (approved 1 December 2025)",
          publisher:
            "Faculty of Mathematics, Physics and Informatics, Comenius University Bratislava",
          url: "https://fmph.uniba.sk/datove-objekty/kriteria-pre-prijimacie-konanie-bakalarske-studium/",
          checkedAt: "2026-10-29",
        },
        {
          id: "fmfi-bachelor-admission-2026-27",
          title: "Bachelor study: admission, deadlines, fee and documents (2026/27)",
          publisher:
            "Faculty of Mathematics, Physics and Informatics, Comenius University Bratislava",
          url: "https://fmph.uniba.sk/studium/prijimacie-konanie/bakalarske-studium/",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "stu-fiit-computing-bsc-2027",
    universityId: "15a8dcb69537dff74395",
    universityHost: "stuba.sk",
    universityName: "Slovak University of Technology in Bratislava",
    faculty: "Faculty of Informatics and Information Technologies (FIIT)",
    country: "Slovakia",
    countryCode: "SK",
    city: "Bratislava",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "STU opened its 2027/28 admission pages (e-application in the university information system), but on 29 October 2026 the latest FIIT bachelor conditions found were for 2026/27. DocRoute does not build a personalised route or document checklist until the 2027/28 conditions are published and checked.",
    programs: [{ programName: "Computer Science", localProgramName: "Informatika" }],
    sources: [
      {
        id: "stu-conditions-2027-28",
        title: "STU admission conditions for 2027/2028 (university-wide; faculty rules differ)",
        publisher: "Slovak University of Technology in Bratislava",
        url: "https://www.stuba.sk/sk/uchadzaci/ako-zacat-studovat/podmienky-prijatia-na-akademicky-rok-2027-2028.html?page_id=187",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote:
        "FIIT internal regulation No. 4/2025, dated 18 November 2025 and signed by the dean and the chair of the faculty's Academic Senate, for 2026/27 entry.",
      facts: [
        {
          label: "Application deadline",
          value:
            "Electronic application by the date set by the dean; paper applications posted by 31 March 2026. The fee amount is not in the conditions.",
        },
        {
          label: "Points",
          value:
            "The better of two maths results counts: the percentile in the external part of the maturita in mathematics, or the percentile in the faculty's entrance exam. Olympiads and competitions add points (up to 90). Without a maturita maths result or competition diplomas, only the entrance exam counts.",
        },
        {
          label: "Early exam for third-year pupils",
          value:
            "FIIT let pupils in the penultimate school year take its entrance exam (maths and informatics) on 23 January 2026; passing guaranteed a place for 2027/28 entry, subject to the maturita certificate. In October 2026 the faculty announced it again; check its site for dates.",
        },
        {
          label: "Language",
          value:
            "Without a Slovak or Czech maturita: Slovak B2, assessed by the STU language centre (ICV STU); otherwise admission is conditional.",
        },
        {
          label: "School certificate from abroad",
          value:
            "A decision recognising the foreign school certificate under Act No. 422/2015.",
        },
      ],
      programRules: [
        {
          localProgramName: "Informatika",
          rule: "3-year study: admitted automatically with 70+ points, rejected below 50; in between the admissions committee ranks applicants. 4-year study: 50+ admitted, below 35 rejected. The dean could lower these thresholds. An English-taught Informatics bachelor also exists (fee-paying; not covered here).",
        },
      ],
      overview: {
        applicationDocuments: [
          "Electronic application in the STU information system (paper posted by 31 March 2026); admission fee (amount not in the conditions).",
          "Certified copy of the maturita certificate and external maturita results in maths and Slovak or Czech, if taken; olympiad diplomas optional.",
          "Without a Slovak or Czech maturita: Slovak B2 assessment from the STU language centre. School abroad: recognition decision.",
        ],
        entranceRequirements: [
          "Points = the better of the external maturita maths percentile or the faculty's exam percentile, plus competition points (up to 90).",
          "3-year study: 70+ admitted, below 50 rejected; 4-year study: 50+ admitted, below 35 rejected; in between the committee ranks.",
        ],
        afterAdmission: [
          "Admission can be conditional until the maturita or Slovak B2 is proven.",
          "A review of the dean's decision can be requested within 8 days of delivery.",
          "Enrolment steps are not in the conditions: check the faculty's site.",
        ],
      },
      sources: [
        {
          id: "fiit-conditions-2026-27",
          title: "Further admission conditions for FIIT bachelor programmes, 2026/2027 (regulation 4/2025, 18 Nov 2025)",
          publisher: "Faculty of Informatics and Information Technologies, Slovak University of Technology in Bratislava",
          url: "https://www.fiit.stuba.sk/dokumenty/docs//Studium/Prijimacky/bak/dalsie-podmienky-prij-bak_2025-11-18.pdf",
          checkedAt: "2026-10-29",
        },
        {
          id: "fiit-early-exam-2026",
          title: "Press release: FIIT entrance exam for third-year secondary pupils (7 January 2026)",
          publisher: "Faculty of Informatics and Information Technologies, Slovak University of Technology in Bratislava",
          url: "https://www.fiit.stuba.sk/tlacova-sprava-07012026.html?page_id=6879",
          checkedAt: "2026-10-29",
        },
        {
          id: "fiit-bachelor-programmes",
          title: "FIIT bachelor programmes",
          publisher: "Faculty of Informatics and Information Technologies, Slovak University of Technology in Bratislava",
          url: "https://www.fiit.stuba.sk/studijne-programy/bakalarske-studium.html?page_id=1674",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "tuke-fei-computing-bsc-2027",
    universityId: "f8784f653112b816607d",
    universityHost: "tuke.sk",
    universityName: "Technical University of Košice",
    faculty: "Faculty of Electrical Engineering and Informatics (FEI)",
    country: "Slovakia",
    countryCode: "SK",
    city: "Košice",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "On 29 October 2026 the latest FEI bachelor conditions found were for 2026/27. DocRoute does not build a personalised route or document checklist until the 2027/28 conditions are published and checked.",
    programs: [
      { programName: "Computer Science", localProgramName: "Informatika" },
      { programName: "Cybersecurity", localProgramName: "Kyberbezpečnosť" },
      { programName: "Computer Networks", localProgramName: "Počítačové siete" },
      { programName: "Computer Modelling", localProgramName: "Počítačové modelovanie" },
      { programName: "Artificial Intelligence", localProgramName: "Umelá inteligencia" },
    ],
    sources: [
      {
        id: "tuke-fei-conditions-2026-27-status",
        title: "FEI general admission conditions for bachelor study (latest found: 2026/2027)",
        publisher: "Faculty of Electrical Engineering and Informatics, Technical University of Košice",
        url: "https://api.prod.tuke.sk/smb/medias/2026/01/1-Podmienky-prijatia-Bc-fei-2026-2027.pdf?workSpaceId=2",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote:
        "FEI general admission conditions for bachelor study in 2026/27 (published January 2026; the approval date is not shown in the document).",
      facts: [
        {
          label: "Application deadline",
          value:
            "30 April 2026, electronic application only. Fee €20 by bank transfer. The admissions committee met by 15 June 2026.",
        },
        {
          label: "No entrance exam",
          value:
            "Applicants were ranked by points: grade average up to 60 (average 1 = 60, 4 = 0), olympiads at regional level or higher 60 each and other competitions 20 each, school type up to 30 (grammar school or electrical/IT technical school 30). Points were deducted for earlier unfinished bachelor study.",
        },
        {
          label: "Language",
          value:
            "Slovak at least A1: a Slovak or Czech maturita, a certificate from a Slovak language school or university, or TUKE's free online Slovak course (180 hours) with a final test of at least 51% (certificate by 7 June 2026). Without A1 the applicant is not admitted.",
        },
        {
          label: "School certificate from abroad",
          value:
            "Outside the EU: apostille, sworn Slovak translation and recognition of the certificate (details on TUKE's recognition page).",
        },
      ],
      programRules: [
        { localProgramName: "Informatika", rule: "3 years, planned intake 180." },
        { localProgramName: "Kyberbezpečnosť", rule: "3 years, planned intake 70." },
        { localProgramName: "Počítačové siete", rule: "3 years, planned intake 120." },
        { localProgramName: "Počítačové modelovanie", rule: "3 years, planned intake 20." },
        {
          localProgramName: "Umelá inteligencia",
          rule: "3 years, planned intake 140; in 2026/27 it was still being prepared for accreditation.",
        },
      ],
      overview: {
        applicationDocuments: [
          "Electronic application only, by 30 April 2026; fee €20 by bank transfer.",
          "School outside the EU: apostille, sworn Slovak translation and recognition of the certificate.",
          "Proof of Slovak at least A1 (maturita, language school or TUKE online course), certificate by 7 June 2026.",
        ],
        entranceRequirements: [
          "No entrance exam: ranking by points for grade average (up to 60), olympiads and competitions, and school type (up to 30).",
          "Admissions committee by 15 June 2026; the dean decides.",
        ],
        afterAdmission: [
          "Enrolment dates and the enrolment fee are in a separate faculty document (not checked); the fee is not refunded if you do not enrol.",
        ],
      },
      sources: [
        {
          id: "tuke-fei-conditions-2026-27",
          title: "General admission conditions for bachelor study at FEI TUKE, 2026/2027",
          publisher: "Faculty of Electrical Engineering and Informatics, Technical University of Košice",
          url: "https://api.prod.tuke.sk/smb/medias/2026/01/1-Podmienky-prijatia-Bc-fei-2026-2027.pdf?workSpaceId=2",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "uniba-lf-medicine-2027",
    universityId: "79e938c73e40ae20dfe7",
    universityHost: "uniba.sk",
    universityName: "Comenius University Bratislava",
    faculty: "Faculty of Medicine (LF UK)",
    country: "Slovakia",
    countryCode: "SK",
    city: "Bratislava",
    category: "Medicine",
    degreeLevel: "long-cycle",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "On 29 October 2026 the faculty's admission page still described 2026/27. DocRoute does not build a personalised route or document checklist until the 2027/28 conditions are published and checked. The English-taught programmes have separate rules, not covered here.",
    programs: [
      { programName: "General Medicine", localProgramName: "Všeobecné lekárstvo" },
      { programName: "Dentistry", localProgramName: "Zubné lekárstvo" },
    ],
    sources: [
      {
        id: "lf-uk-admission-page",
        title: "Admission procedure (page still describes 2026/27)",
        publisher: "Faculty of Medicine, Comenius University Bratislava",
        url: "https://www.fmed.uniba.sk/studium/pre-uchadzacov/prijimacie-konanie/",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote:
        "Internal regulation 30/2025, approved by the faculty's Academic Senate on 21 October 2025 and amended on 27 November 2025, for the Slovak-taught programmes in 2026/27.",
      facts: [
        {
          label: "Application deadline",
          value:
            "1 December 2025 – 28 February 2026, electronic application at eprihlaska.uniba.sk. Fee €99 per programme (includes one aptitude test). A doctor's confirmation of fitness for study goes with the application.",
        },
        {
          label: "Entrance exam",
          value:
            "Two parts run by SCIO: a natural sciences test (biology and chemistry, 200 questions, 3 hours, 84% of the score) on 9 May 2026 for General Medicine (10 May for Dentistry), and a general study aptitude test (VŠP, 16%) taken on one of several dates from December to April (the Czech OSP also counts). No physics. No minimum score: applicants are ranked within the planned intake.",
        },
        {
          label: "Bonus points",
          value:
            "Only the highest one counts: olympiad or SOČ regional top 3 +25, national top 10 +30, international round +40; English C1/C2 certificate or bilingual English school +25.",
        },
        {
          label: "Without the exam (General Medicine)",
          value:
            "Final-year pupils at a Slovak school with biology and chemistry for at least two years, only grades 1–2 in every year and an average of 1.100 or better (request by 28 February). At most 30% of the places; those not admitted this way take the exam with 50 bonus points.",
        },
        {
          label: "School certificate from abroad",
          value: "A nostrification decision by the enrolment day.",
        },
      ],
      programRules: [
        { localProgramName: "Všeobecné lekárstvo", rule: "6 years (MUDr.), planned intake up to 375." },
        { localProgramName: "Zubné lekárstvo", rule: "5 years (MDDr.), planned intake up to 32. Exam always required." },
      ],
      overview: {
        applicationDocuments: [
          "Electronic application 1 Dec 2025 – 28 Feb 2026; fee €99 per programme.",
          "Doctor's confirmation of fitness for study (health, hearing, vision) with the application.",
          "Bonus documents posted by 15 April 2026; request for admission without exam by 28 February 2026.",
        ],
        entranceRequirements: [
          "SCIO natural sciences test (biology, chemistry) on 9 May 2026 plus a general aptitude test (VŠP); ranking within the planned intake.",
          "General Medicine without the exam for top Slovak pupils (all grades 1–2, average 1.100 or better).",
        ],
        afterAdmission: [
          "Written decision within 30 days; appeal within 8 days.",
          "By enrolment: hepatitis B vaccination, notarised copies of the maturita and birth certificates, nostrification decision if the school was abroad, photo.",
        ],
      },
      sources: [
        {
          id: "lf-uk-conditions-2026-27",
          title: "Further admission conditions, Slovak-taught programmes, 2026/2027 (consolidated with amendment 1)",
          publisher: "Faculty of Medicine, Comenius University Bratislava",
          url: "https://www.fmed.uniba.sk/fileadmin/lf/o_fakulte/dokumenty/vnutrofakultne_predpisy/VP_dekana_2025/VP_35_2025_-_Uplne_znenie_VP_30_2025_-_Dalsie_podmienky_prijatia_-_SJ_-_v_zneni_D1.pdf",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "uniba-jlf-medicine-2027",
    universityId: "79e938c73e40ae20dfe7",
    universityHost: "uniba.sk",
    universityName: "Comenius University Bratislava",
    faculty: "Jessenius Faculty of Medicine in Martin (JLF UK)",
    country: "Slovakia",
    countryCode: "SK",
    city: "Martin",
    category: "Medicine",
    degreeLevel: "long-cycle",
    intake: "2027/28",
    status: "rules-published",
    statusNote:
      "The faculty published its 2027/28 admission conditions (internal regulation 21/2026). They are summarised below for reference; DocRoute has not built a personalised route or document checklist from them yet.",
    programs: [
      { programName: "General Medicine", localProgramName: "Všeobecné lekárstvo" },
      { programName: "General Medicine (English-taught)", localProgramName: "General Medicine" },
      { programName: "Dentistry", localProgramName: "Zubné lekárstvo" },
    ],
    sources: [
      {
        id: "jlf-admission-page",
        title: "Doctoral-degree study (MUDr., MDDr.): applicants",
        publisher: "JFaculty of Medicine, Comenius University Bratislava",
        url: "https://www.jfmed.uniba.sk/studium/uchadzaci/doktorske-studium-mudr-mddr/",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2027/28",
      approvedNote:
        "Internal regulation 21/2026, issued by the dean on 29 September 2026 after discussion in the Academic Senate the same day, for 2027/28 entry.",
      facts: [
        {
          label: "Application deadline",
          value:
            "Slovak programmes: 1 December 2026 – 28 February 2027 (electronic in AIS2 or paper). Fee €70 for General Medicine, €100 for Dentistry (one €100 fee if you apply for both, with Dentistry first). Doctor's confirmation of fitness for study and proof of payment by the same date.",
        },
        {
          label: "Entrance exam (Slovak programmes)",
          value:
            "National comparative exam (NPS): biology and chemistry (80%) plus a general study aptitude test (20%), in person on 20 March, 24 April or 22 May 2027 (your choice; no make-up date). Up to 100 points, plus up to 8 bonus points (olympiad/SOČ top 3: national 5, regional 3; C1 language certificate 3). Ranking within the planned intake, no minimum score.",
        },
        {
          label: "Dentistry manual skills exam",
          value:
            "Carving a plaster model in 180 minutes, 19–23 April 2027 at the faculty, up to 50 points.",
        },
        {
          label: "English-taught General Medicine",
          value:
            "Four rounds (exams 20 March, 26 June, 6 August, 2 September 2027; applications from 1 December 2026). Online or in-person test in biology and chemistry (80 questions, 80 minutes), IB diploma bonus. Fee €70 per round. Tuition is not stated in the regulation.",
        },
        {
          label: "Language",
          value:
            "Slovak programmes: Slovak B2 certificate by enrolment for applicants without Slovak or Czech citizenship (or a Slovak compatriot certificate).",
        },
        {
          label: "School certificate from abroad",
          value:
            "Proof of equivalence or nostrification, sent with a certified maturita copy after the conditional admission decision.",
        },
      ],
      programRules: [
        { localProgramName: "Všeobecné lekárstvo", rule: "6 years (MUDr.), planned intake 150." },
        { localProgramName: "General Medicine", rule: "6 years (MUDr.), planned intake 150; separate cut-off per round." },
        { localProgramName: "Zubné lekárstvo", rule: "5 years (MDDr.), planned intake 12; NPS plus manual skills exam." },
      ],
      overview: {
        applicationDocuments: [
          "Application 1 Dec 2026 – 28 Feb 2027; fee €70 (General Medicine) or €100 (Dentistry).",
          "Doctor's confirmation of fitness for study and proof of payment with the application.",
          "Bonus documents by 15 May 2027; maturita copy and recognition after the conditional decision.",
        ],
        entranceRequirements: [
          "NPS (biology, chemistry, aptitude test) on 20 March, 24 April or 22 May 2027; Dentistry also a manual skills exam.",
          "Slovak B2 for applicants without Slovak or Czech citizenship.",
          "English-taught programme: online/in-person biology and chemistry test in one of four rounds.",
        ],
        afterAdmission: [
          "Final results by 15 June 2027; written decision within 30 days.",
          "Review of a rejection can be requested within 8 days.",
        ],
      },
      sources: [
        {
          id: "jlf-conditions-2027-28",
          title: "Further admission conditions for 2027/2028 (internal regulation 21/2026)",
          publisher: "JFaculty of Medicine, Comenius University Bratislava",
          url: "https://www.jfmed.uniba.sk/fileadmin/jlf/Dekanat/Sekretariat/Legislativa/Rok_2026/VP_2026_21_Dalsie_podmienky_na_studium_na_AR_27-28.pdf",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "upjs-lf-medicine-2027",
    universityId: "a164a13a9b47c46b5b67",
    universityHost: "upjs.sk",
    universityName: "Pavol Jozef Šafárik University in Košice",
    faculty: "Faculty of Medicine (UPJŠ LF)",
    country: "Slovakia",
    countryCode: "SK",
    city: "Košice",
    category: "Medicine",
    degreeLevel: "long-cycle",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "On 29 October 2026 the faculty's admission page (last edited 30 June 2026) listed only the 2026/27 conditions. DocRoute does not build a personalised route or document checklist until the 2027/28 conditions are published and checked.",
    programs: [
      { programName: "General Medicine", localProgramName: "Všeobecné lekárstvo" },
      { programName: "Dentistry", localProgramName: "Zubné lekárstvo" },
      { programName: "General Medicine (English-taught)", localProgramName: "General Medicine" },
      { programName: "Dentistry (English-taught)", localProgramName: "Dental Medicine" },
    ],
    sources: [
      {
        id: "upjs-lf-admission-page",
        title: "Admission procedure (page lists 2026/27 conditions)",
        publisher: "Faculty of Medicine, Pavol Jozef Šafárik University in Košice",
        url: "https://www.upjs.sk/lekarska-fakulta/informacie-pre-zaujemcov-o-studium/prijimacie-konanie/",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote:
        "Conditions LEK005771/2025-101423, approved by the faculty's Academic Senate on 17 December 2025, for 2026/27 entry.",
      facts: [
        {
          label: "Application deadline",
          value:
            "Slovak programmes: by 28 February 2026; fee €30 electronic, €50 on paper (separate application and fee per programme). Health certificate no older than 3 months with the application.",
        },
        {
          label: "Entrance exam (Slovak programmes)",
          value:
            "Written test in biology (100 questions) and chemistry (100 questions), up to 800 points, 150 minutes. General Medicine: 24–26 April or 8–12 June 2026 (the better result counts), make-up 16 June. Dentistry: 8–12 June 2026. Ranking within the planned intake; the conditions say 730 points for General Medicine leads to admission.",
        },
        {
          label: "English-taught programmes",
          value:
            "Application at least two weeks before the exam (17 June or 12 August 2026 for applicants without an agency agreement), posted on paper with a medical certificate and passport copy. Written test; ranking within the planned intake. Fee and tuition are not stated in the conditions.",
        },
        {
          label: "School certificate from abroad",
          value:
            "A recognition decision from the regional school office by enrolment (not needed for Czech certificates or those recognised automatically on uznavanie.minedu.sk).",
        },
      ],
      programRules: [
        { localProgramName: "Všeobecné lekárstvo", rule: "6 years (MUDr.), planned intake 265." },
        { localProgramName: "Zubné lekárstvo", rule: "5 years (MDDr.), planned intake 40." },
        { localProgramName: "General Medicine", rule: "6 years (MUDr.), planned intake 210." },
        { localProgramName: "Dental Medicine", rule: "5 years (MDDr.), planned intake 40." },
      ],
      overview: {
        applicationDocuments: [
          "Slovak programmes by 28 February 2026; €30 electronic / €50 paper per programme.",
          "Health certificate (max. 3 months old), proof of payment, certified maturita copy if you already have it.",
          "English-taught: paper application with medical certificate and passport copy, at least two weeks before the exam.",
        ],
        entranceRequirements: [
          "Biology and chemistry test, 800 points; General Medicine April or June 2026, Dentistry June 2026.",
          "Ranking within the planned intake.",
        ],
        afterAdmission: [
          "Results on the faculty website on the exam day; written decision within 30 days.",
          "Recognition decision for a school certificate from abroad by enrolment.",
        ],
      },
      sources: [
        {
          id: "upjs-lf-conditions-2026-27",
          title: "Admission conditions, combined first and second cycle, 2026/2027",
          publisher: "Faculty of Medicine, Pavol Jozef Šafárik University in Košice",
          url: "https://www.upjs.sk/app/uploads/sites/9/2025/12/Podmienky-prijatia-26-27-spojeny-I.-a-II.-stupen-studia.pdf",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "tum-informatics-bsc-2027",
    universityId: "b47771b9fcc7936d7a9b",
    universityHost: "tum.de",
    universityName: "Technical University of Munich",
    faculty: "TUM School of Computation, Information and Technology",
    country: "Germany",
    countryCode: "DE",
    city: "Munich",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "TUM's aptitude assessment is a standing statute, but the dates for winter 2027/28 are not announced yet. DocRoute does not build a personalised route or document checklist, and German residence rules are not covered yet.",
    programs: [{ programName: "Informatics", localProgramName: "Informatik" }],
    sources: [
      {
        id: "tum-informatics-programme",
        title: "Informatics, Bachelor of Science: programme page",
        publisher: "Technical University of Munich",
        url: "https://www.tum.de/en/studies/degree-programs/detail/informatics-bachelor-of-science-bsc",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote:
        "Aptitude assessment statute for the Informatics bachelor (as amended on 3 September 2024) and the faculty's overview; the 2026 cycle had its second-stage test on 21 August 2026.",
      facts: [
        {
          label: "Application period",
          value:
            "Winter semester: 15 May – 15 July, online. Start in October; 6 semesters.",
        },
        {
          label: "Language",
          value:
            "Taught in German: international applicants need a German certificate from TUM's list; very good English is also expected.",
        },
        {
          label: "Aptitude assessment, stage 1",
          value:
            "Documents only, up to 100 points: 65% overall school-leaving grade, 35% subject grades (mathematics ×3, best science ×2, German, English), up to 6 bonus points (relevant training, olympiad awards). 84+ admitted directly, 73–83 invited to stage 2, 72 or less rejected. Missing subject grades for the last four half-years mean stage 2 even with 84+.",
        },
        {
          label: "Aptitude assessment, stage 2",
          value:
            "A 90-minute written test in Garching (August/September, about half in English): mathematics and logical thinking. Final score 50% school grade + 50% test; 70+ admitted.",
        },
        {
          label: "Fees",
          value:
            "Semester fee €97. Non-EU/EEA students starting now pay €2,000 or €3,000 per semester depending on the programme; TUM has announced €2,300 or €3,400 from winter 2027/28. EU/EEA citizens pay no tuition.",
        },
        {
          label: "School certificate from abroad",
          value:
            "Depending on the certificate, a uni-assist preliminary review may be needed; some certificates do not give direct access (Studienkolleg).",
        },
      ],
      programRules: [
        {
          localProgramName: "Informatik",
          rule: "No numerus clausus; admission through the two-stage aptitude assessment.",
        },
      ],
      overview: {
        applicationDocuments: [
          "Online application 15 May – 15 July for the winter semester.",
          "School-leaving certificate, CV, ID or passport; a uni-assist preliminary review for some foreign certificates.",
          "German language certificate from TUM's list.",
        ],
        entranceRequirements: [
          "Stage 1 from grades (overall 65%, maths/science/German/English 35%): 84+ direct admission, 73–83 written test, 72 or less rejected.",
          "Stage 2: 90-minute maths and logic test in August/September; 70+ admitted.",
        ],
        afterAdmission: [
          "Enrolment and semester fee €97; non-EU/EEA students also pay tuition (from €2,300 per semester from winter 2027/28).",
          "German residence rules are not covered by DocRoute yet.",
        ],
      },
      sources: [
        {
          id: "tum-informatics-efv-overview",
          title: "Aptitude assessment, Bachelor Informatik: overview with examples",
          publisher: "TUM School of Computation, Information and Technology",
          url: "https://www.cit.tum.de/fileadmin/w00byx/cit/Studium/Studiengaenge/Bachelor_Informatik/UEbersicht_EFV_BSc_Informatik_inkl._Berechnungsbeispiel_SoSe25.pdf",
          checkedAt: "2026-10-29",
        },
        {
          id: "tum-informatics-cit-page",
          title: "Bachelor Informatik: application period, aptitude assessment and documents",
          publisher: "TUM School of Computation, Information and Technology",
          url: "https://www.cit.tum.de/cit/studium/studiengaenge/bachelor-informatik/",
          checkedAt: "2026-10-29",
        },
        {
          id: "tum-tuition",
          title: "Tuition fees for students from non-EU countries",
          publisher: "Technical University of Munich",
          url: "https://www.tum.de/en/studies/fees/tuition",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "vut-fit-computing-bsc-2027",
    universityId: "4b1db26791c5d27c91ac",
    universityHost: "vutbr.cz",
    universityName: "Brno University of Technology",
    faculty: "Faculty of Information Technology (FIT VUT)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Brno",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-published",
    statusNote:
      "The faculty published its bachelor admission rules for 2027/28. They are summarised below for reference; DocRoute has not built a personalised route or document checklist from them yet. The English-taught programme has separate rules, not covered here.",
    programs: [{ programName: "Information Technology", localProgramName: "Informační technologie" }],
    sources: [
      {
        id: "vut-fit-application-2027",
        title: "Application: bachelor study in Czech (2027/2028)",
        publisher: "Faculty of Information Technology, Brno University of Technology",
        url: "https://www.fit.vut.cz/applicants/application/.en",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2027/28",
      approvedNote:
        "Rules and conditions for admission to the bachelor programme for 2027/2028 (faculty directive 2/2026), as summarised on the faculty's application page; the approval date was not checked.",
      facts: [
        {
          label: "Application deadline",
          value:
            "File and pay by 31 March 2027 (the fee is not stated on the page). Claims for preferential admission by 31 March, or by 31 May if results are still pending.",
        },
        {
          label: "No faculty exam",
          value:
            "Admission by the SCIO National Comparative Exams (OSP, maths or VŠP) with at least the 75th percentile; the dean may lower it. One free SCIO test on 24 April 2027 for those who applied and paid on time (make-up 22 May, OSP or VŠP only).",
        },
        {
          label: "Preferential admission",
          value:
            "Without SCIO, e.g. IQ test 90th percentile+, a maths exam percentile 80+ (Mathematics+ 60+), olympiad success (maths, physics, informatics, logic), top 3 in the regional SOČ round, Kangaroo or Beaver, or the faculty's preparatory maths course; further conditions apply.",
        },
        {
          label: "Language",
          value:
            "Basic Czech: Czech or Slovak citizenship, a Czech or Slovak maturita, a SCIO test in Czech or Slovak with 68th percentile+, or a Czech B2 exam or course at BUT.",
        },
        {
          label: "School certificate from abroad",
          value:
            "Automatically equivalent for countries with an agreement (e.g. Slovakia, Poland, Germany); otherwise the faculty recognises it from a certified, translated diploma, transcript and study plan.",
        },
      ],
      programRules: [
        {
          localProgramName: "Informační technologie",
          rule: "3-year bachelor in Czech; admission by SCIO percentile or a preferential condition.",
        },
      ],
      overview: {
        applicationDocuments: [
          "Application filed and paid by 31 March 2027.",
          "Proof for preferential admission by 31 March (31 May if pending).",
          "Outside Slovakia/Poland/Germany etc.: translated diploma, transcript and study plan for recognition.",
        ],
        entranceRequirements: [
          "SCIO OSP, maths or VŠP at the 75th percentile or higher (free test 24 April 2027).",
          "Or preferential admission (IQ, maths percentile, olympiads, SOČ, preparatory course).",
          "Basic Czech (Slovak citizens and Slovak maturita holders meet it).",
        ],
        afterAdmission: [
          "Enrolment details are not on the application page: check the faculty's site.",
        ],
      },
      sources: [
        {
          id: "vut-fit-application-page-2027",
          title: "Application, admission criteria, language and recognition (2027/2028)",
          publisher: "Faculty of Information Technology, Brno University of Technology",
          url: "https://www.fit.vut.cz/applicants/application/.en",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "muni-fi-computing-bsc-2027",
    universityId: "1def63b3ac858b190c04",
    universityHost: "muni.cz",
    universityName: "Masaryk University",
    faculty: "Faculty of Informatics (FI MU)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Brno",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-published",
    statusNote:
      "The faculty published its bachelor admission information for 2027/28. It is summarised below for reference; DocRoute has not built a personalised route or document checklist from it yet.",
    programs: [
      { programName: "Informatics", localProgramName: "Informatika" },
      { programName: "Programming and Application Development", localProgramName: "Programování a vývoj aplikací" },
      { programName: "Cybersecurity", localProgramName: "Kyberbezpečnost" },
      { programName: "Bioinformatics", localProgramName: "Bioinformatika" },
    ],
    sources: [
      {
        id: "muni-fi-bachelor-2027",
        title: "Bachelor admission information (2027/2028)",
        publisher: "Faculty of Informatics, Masaryk University",
        url: "https://www.fi.muni.cz/admission/info-bachelor.html.cs",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2027/28",
      approvedNote:
        "Approved by the Academic Senate of the Faculty of Informatics on 24 June 2026, for 2027/28 entry.",
      facts: [
        {
          label: "Application deadline",
          value:
            "1 November 2026 – 28 February 2027, a separate e-application and fee per programme (amount not stated on the faculty page).",
        },
        {
          label: "Entrance test (TSP)",
          value:
            "Masaryk University's study aptitude test: numerical-analytical thinking, reasoning in English and critical thinking. The numerical-analytical part must be in the top 30% at the university; ranking by all three parts. Two attempts possible: 29 November 2026 – 14 February 2027 (Brno) and 15 February – 25 April 2027 (also Bratislava and Žilina); book at least 14 days ahead and by 28 February.",
        },
        {
          label: "Waiver (Informatika only)",
          value:
            "Request by 28 February 2027: SCIO NSZ overall percentile 80+, IQ 130+ with a school average of 1.5 or better, or results in olympiads and competitions, SAT, AP, SOČ, CyberGame Slovakia and others (from 2025 onwards).",
        },
        {
          label: "Language and certificates",
          value:
            "Czech language and recognition rules are not on the faculty page: see the university's pages for Slovak applicants and for graduates of foreign schools.",
        },
      ],
      programRules: [
        { localProgramName: "Informatika", rule: "Planned intake 350 (single major); exam waiver possible." },
        { localProgramName: "Programování a vývoj aplikací", rule: "Planned intake 150; TSP required." },
        { localProgramName: "Kyberbezpečnost", rule: "Planned intake 150; TSP required." },
        { localProgramName: "Bioinformatika", rule: "Planned intake 30; TSP required." },
      ],
      overview: {
        applicationDocuments: [
          "E-application 1 Nov 2026 – 28 Feb 2027, one per programme.",
          "Waiver request with proof by 28 February 2027 (Informatika).",
          "TSP date booked and application paid at least 14 days before the test.",
        ],
        entranceRequirements: [
          "TSP: numerical-analytical part in the top 30%, ranking by all three parts.",
          "Informatika: waiver with SCIO 80th percentile+, IQ 130+ (average ≤1.5) or competition results.",
        ],
        afterAdmission: [
          "Language and recognition steps: check the university's pages for Slovak and foreign applicants.",
        ],
      },
      sources: [
        {
          id: "muni-fi-bachelor-info-2027",
          title: "Bachelor admission information: programmes, TSP, dates (2027/2028)",
          publisher: "Faculty of Informatics, Masaryk University",
          url: "https://www.fi.muni.cz/admission/info-bachelor.html.cs",
          checkedAt: "2026-10-29",
        },
        {
          id: "muni-fi-faq-2027",
          title: "Admission FAQ: entrance exam waiver",
          publisher: "Faculty of Informatics, Masaryk University",
          url: "https://www.fi.muni.cz/admission/faq.html.cs",
          checkedAt: "2026-10-29",
        },
        {
          id: "muni-tsp-dates",
          title: "Admissions: TSP dates and booking",
          publisher: "Masaryk University",
          url: "https://www.muni.cz/uchazeci/bakalarske-a-magisterske-studium/prijimacky",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "tuwien-informatics-bsc-2027",
    universityId: "4d666144f4e39ea3f3ae",
    universityHost: "tuwien.ac.at",
    universityName: "TU Wien",
    faculty: "Faculty of Informatics",
    country: "Austria",
    countryCode: "AT",
    city: "Vienna",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "On 29 October 2026 TU Wien listed dates only for winter 2026/27; the 2027 admission dates are not out yet. DocRoute does not build a personalised route, and Austrian residence rules are not covered yet.",
    programs: [{ programName: "Informatics", localProgramName: "Informatik" }],
    sources: [
      {
        id: "tuwien-academic-calendar",
        title: "Academic calendar: admission deadlines (lists 2026/27)",
        publisher: "TU Wien",
        url: "https://www.tuwien.at/en/studies/admission/academic-calendar",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote:
        "TU Wien's admission pages for winter semester 2026/27 (news of 27 February 2026).",
      facts: [
        {
          label: "Admission procedure",
          value:
            "Two stages for Informatics, Computer Engineering and Business Informatics: pre-registration in TISS with an online self-assessment and fee payment from 1 April to 4 May 2026, then an on-site ranking test in Vienna on 13 July 2026 (once a year, no alternative date). 670 places in the Informatics bachelor.",
        },
        {
          label: "Application deadlines",
          value:
            "Non-EU/EEA applicants: complete application 16 January – 15 July 2026, no late applications. EU/EEA applicants without an equivalent certificate: early February – end of July 2026.",
        },
        {
          label: "Language",
          value:
            "Taught in German: A2 when applying and C1 for admission for non-native speakers; at least B2 recommended because the test is in German.",
        },
        {
          label: "Tuition",
          value:
            "Non-EU nationals €726.72 per semester from the first semester, plus the students' union (ÖH) fee; EU/EEA citizens pay no tuition for the standard duration plus two semesters (ÖH fee only). Ukrainian citizens are exempt.",
        },
      ],
      programRules: [
        { localProgramName: "Informatik", rule: "670 places; ranking test only once a year." },
      ],
      overview: {
        applicationDocuments: [
          "Pre-registration in TISS, self-assessment and fee by 4 May 2026.",
          "Non-EU/EEA: full application 16 Jan – 15 Jul 2026.",
          "German: A2 to apply, C1 for admission.",
        ],
        entranceRequirements: [
          "On-site ranking test in German on 13 July 2026; 670 places.",
        ],
        afterAdmission: [
          "Enrolment with the admission letter by 31 October 2026.",
          "Tuition €726.72 per semester for non-EU nationals, plus ÖH fee.",
        ],
      },
      sources: [
        {
          id: "tuwien-entrance-exam",
          title: "Entrance exam for bachelor's programmes (2026/27)",
          publisher: "TU Wien",
          url: "https://www.tuwien.at/en/studies/admission/bachelors-programmes/entrance-exam",
          checkedAt: "2026-10-29",
        },
        {
          id: "tuwien-cs-procedure-2026",
          title: "News: selection procedure for computer science, 27 February 2026",
          publisher: "TU Wien",
          url: "https://www.tuwien.at/en/tu-wien/news/news/schon-gehoert-wichtige-aenderungen-beim-aufnahmeverfahren-fuer-informatik-architektur-und-raumplanung",
          checkedAt: "2026-10-29",
        },
        {
          id: "tuwien-calendar-2026",
          title: "Academic calendar: deadlines for winter semester 2026/27",
          publisher: "TU Wien",
          url: "https://www.tuwien.at/en/studies/admission/academic-calendar",
          checkedAt: "2026-10-29",
        },
        {
          id: "tuwien-tuition",
          title: "Tuition fee",
          publisher: "TU Wien",
          url: "https://www.tuwien.at/en/studies/admission/students-union-fee-and-tuition-fee/tuition-fee",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "univie-informatics-bsc-2027",
    universityId: "32ffe57248ac6dc925b6",
    universityHost: "univie.ac.at",
    universityName: "University of Vienna",
    faculty: "Faculty of Computer Science",
    country: "Austria",
    countryCode: "AT",
    city: "Vienna",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "On 29 October 2026 the admission procedure page showed the 2026 dates. DocRoute does not build a personalised route, and Austrian residence rules are not covered yet.",
    programs: [{ programName: "Computer Science", localProgramName: "Informatik" }],
    sources: [
      {
        id: "univie-informatik-procedure",
        title: "Informatik (bachelor): admission procedure",
        publisher: "University of Vienna",
        url: "https://aufnahmeverfahren.univie.ac.at/informatik",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote: "The University of Vienna's admission procedure page with the 2026 dates.",
      facts: [
        {
          label: "Admission procedure",
          value:
            "Registration 2 March – 4 May 2026, fee €50. Written test on 13 July 2026 in Vienna (2 hours, in German with some parts in English, no substitute date). 415 places shared with Business Informatics. Once a year.",
        },
        {
          label: "Language",
          value: "German is required for admission (details on the university's German-skills page).",
        },
        {
          label: "Help",
          value: "Free test literature, sample tasks and an online self-assessment on the procedure page.",
        },
      ],
      programRules: [
        { localProgramName: "Informatik", rule: "415 places together with Wirtschaftsinformatik." },
      ],
      overview: {
        applicationDocuments: [
          "Registration for the admission procedure 2 March – 4 May 2026; fee €50.",
          "Application for admission with your school certificate (separate pages for EU/EEA and non-EU certificates).",
        ],
        entranceRequirements: [
          "Written test 13 July 2026 (German, partly English); 415 places.",
          "German skills required.",
        ],
        afterAdmission: [
          "Admission and enrolment steps follow the test result; check the university's admission pages.",
        ],
      },
      sources: [
        {
          id: "univie-informatik-procedure-2026",
          title: "Informatik (bachelor): admission procedure, 2026 dates",
          publisher: "University of Vienna",
          url: "https://aufnahmeverfahren.univie.ac.at/informatik",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "jku-ai-bsc-2027",
    universityId: "aea8edad9af8fb5ed389",
    universityHost: "jku.at",
    universityName: "Johannes Kepler University Linz",
    faculty: "Faculty of Engineering and Natural Sciences",
    country: "Austria",
    countryCode: "AT",
    city: "Linz",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "Taught in English. On 29 October 2026 JKU listed deadlines only for winter 2026/27. DocRoute does not build a personalised route, and Austrian residence rules are not covered yet.",
    programs: [{ programName: "Artificial Intelligence (English-taught)", localProgramName: "Artificial Intelligence" }],
    sources: [
      {
        id: "jku-dates-deadlines",
        title: "Dates & deadlines (lists winter 2026/27)",
        publisher: "Johannes Kepler University Linz",
        url: "https://www.jku.at/en/degree-programs/students/dates-deadlines/",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote: "JKU's programme page and dates for winter semester 2026/27.",
      facts: [
        {
          label: "Programme",
          value: "Bachelor of Science in Artificial Intelligence, 6 semesters, taught in English.",
        },
        {
          label: "Requirements",
          value:
            "A higher education entrance qualification (e.g. Matura) and English at B2. The programme page mentions no entrance exam or place limit.",
        },
        {
          label: "Admission period",
          value:
            "General period 8 July – 5 September 2026 (in special cases until 31 October). Special deadlines may apply depending on your school certificate: check with the Admissions Office.",
        },
        {
          label: "Fees",
          value: "Tuition (where it applies) and the students' union fee; amounts are not on the programme page.",
        },
      ],
      programRules: [
        { localProgramName: "Artificial Intelligence", rule: "English-taught; no entrance exam mentioned." },
      ],
      overview: {
        applicationDocuments: [
          "Online application at JKU; general admission period 8 Jul – 5 Sep 2026.",
          "School-leaving certificate and English B2 proof.",
        ],
        entranceRequirements: [
          "No entrance exam or place limit mentioned on the programme page.",
        ],
        afterAdmission: [
          "Pay tuition (if it applies) and the students' union fee; ask the Admissions Office about special deadlines for foreign certificates.",
        ],
      },
      sources: [
        {
          id: "jku-ai-programme",
          title: "Artificial Intelligence, bachelor's degree",
          publisher: "Johannes Kepler University Linz",
          url: "https://www.jku.at/en/degree-programs/types-of-degree-programs/bachelors-and-diploma-degree-programs/ba-artificial-intelligence/",
          checkedAt: "2026-10-29",
        },
        {
          id: "jku-dates-2026",
          title: "Dates & deadlines, winter semester 2026/27",
          publisher: "Johannes Kepler University Linz",
          url: "https://www.jku.at/en/degree-programs/students/dates-deadlines/",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "meduniwien-medicine-2027",
    universityId: "2ceeb8990f9f62b3f25e",
    universityHost: "meduniwien.at",
    universityName: "Medical University of Vienna",
    faculty: "Human Medicine and Dentistry (MedAT)",
    country: "Austria",
    countryCode: "AT",
    city: "Vienna",
    category: "Medicine",
    degreeLevel: "long-cycle",
    intake: "2027/28",
    status: "rules-published",
    statusNote:
      "The joint MedAT site of the Austrian medical universities already gives the expected 2027 dates (marked as not yet confirmed). DocRoute does not build a personalised route, and Austrian residence rules are not covered yet.",
    programs: [
      { programName: "Human Medicine", localProgramName: "Humanmedizin" },
      { programName: "Dentistry", localProgramName: "Zahnmedizin" },
    ],
    sources: [
      {
        id: "medat-basics",
        title: "MedAT basic information (expected 2027 dates)",
        publisher: "Austrian medical universities (MedAT)",
        url: "https://www.medizinstudieren.at/allgemeine-informationen/basic-infos-der-medat/",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2027/28",
      approvedNote:
        "MedAT information for 2027 on the medical universities' joint site; the dates are given as expected, not confirmed.",
      facts: [
        {
          label: "Registration",
          value:
            "Online, about 1–31 March 2027, with the test fee paid in the same window. You choose the university (Vienna, Innsbruck, Graz or Linz for human medicine) when you register.",
        },
        {
          label: "Test",
          value:
            "MedAT on about 9 July 2027 at all locations at once, once a year and only in German. Results in calendar week 32. School grades do not count; the Matura is shown only after a place is offered.",
        },
        {
          label: "Who can apply",
          value:
            "Holders of a school-leaving certificate, or pupils in their final school year at registration. The test can be repeated in later years; a result counts only for that university and year.",
        },
        {
          label: "After a place is offered (Vienna)",
          value:
            "Reserve the place in the MedAT account, then complete admission in person at the Studies and Examinations Department; winter semester only, by 5 September.",
        },
      ],
      programRules: [
        { localProgramName: "Humanmedizin", rule: "Places by MedAT ranking at the chosen university." },
        { localProgramName: "Zahnmedizin", rule: "Places by MedAT ranking (Vienna, Innsbruck, Graz)." },
      ],
      overview: {
        applicationDocuments: [
          "MedAT online registration and fee, about 1–31 March 2027.",
          "Choose the university at registration.",
        ],
        entranceRequirements: [
          "MedAT in German, about 9 July 2027; school grades do not count.",
        ],
        afterAdmission: [
          "Reserve the place, then admission in person in Vienna by 5 September; show the Matura.",
        ],
      },
      sources: [
        {
          id: "medat-basics-2027",
          title: "MedAT basic information: registration, test day, who can apply",
          publisher: "Austrian medical universities (MedAT)",
          url: "https://www.medizinstudieren.at/allgemeine-informationen/basic-infos-der-medat/",
          checkedAt: "2026-10-29",
        },
        {
          id: "meduniwien-admission-process",
          title: "Admission process for the medicine and dentistry degree programmes",
          publisher: "Medical University of Vienna",
          url: "https://www.meduniwien.ac.at/web/en/studies-further-education/application-admission/medicine-and-dentistry-degree/admission-process/",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "kit-informatics-bsc-2027",
    universityId: "072d650b38a6cb762286",
    universityHost: "kit.edu",
    universityName: "Karlsruhe Institute of Technology",
    faculty: "KIT Department of Informatics",
    country: "Germany",
    countryCode: "DE",
    city: "Karlsruhe",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "KIT's programme page does not state an intake year; its rules (selection statute, 15 July deadline) are standing and apply each winter term. DocRoute does not build a personalised route, and German residence rules are not covered yet.",
    programs: [{ programName: "Informatics", localProgramName: "Informatik" }],
    sources: [
      {
        id: "kit-informatics-programme",
        title: "Informatics, Bachelor of Science: study programme page",
        publisher: "Karlsruhe Institute of Technology",
        url: "https://www.sle.kit.edu/english/vorstudium/bachelor-informatics.php",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote: "KIT's programme page and tuition rules as published for the 2026/27 cycle.",
      facts: [
        {
          label: "Application deadline",
          value: "15 July for the winter term (first semester only in winter), for EU and non-EU applicants.",
        },
        {
          label: "Selection",
          value:
            "About 434–443 places: 10% by waiting time, 90% by selection. For German-equivalent certificates: overall grade (×2) and grades in maths, informatics and the best science subject, plus up to 5 points for vocational training or other achievements. Non-EU applicants are ranked on their entrance qualification (school grades, university results and/or the Feststellungsprüfung).",
        },
        {
          label: "Language",
          value: "Taught in German: C1 (e.g. DSH-2, TestDaF 4 in all parts, Goethe C1); B1 may be accepted provisionally if C1 follows by the end of enrolment.",
        },
        {
          label: "Tuition",
          value:
            "Non-EU students €1,500 per semester (Baden-Württemberg); EU/EEA citizens and those with a German Abitur are exempt. Semester fees apply to everyone.",
        },
      ],
      programRules: [
        { localProgramName: "Informatik", rule: "Restricted admission; selection by grades, 15 July deadline." },
      ],
      overview: {
        applicationDocuments: [
          "Application by 15 July for the winter term.",
          "School-leaving certificate with grades; German C1 proof (B1 provisionally).",
        ],
        entranceRequirements: [
          "Selection by overall grade and maths/informatics/science grades (+ other achievements); 10% by waiting time.",
        ],
        afterAdmission: [
          "Non-EU students pay €1,500 tuition per semester plus semester fees.",
          "German residence rules are not covered by DocRoute yet.",
        ],
      },
      sources: [
        {
          id: "kit-informatics-programme-2026",
          title: "Informatics, Bachelor of Science: admission, selection, language",
          publisher: "Karlsruhe Institute of Technology",
          url: "https://www.sle.kit.edu/english/vorstudium/bachelor-informatics.php",
          checkedAt: "2026-10-29",
        },
        {
          id: "kit-tuition",
          title: "Tuition fees for international students",
          publisher: "Karlsruhe Institute of Technology",
          url: "https://www.intl.kit.edu/istudies/12606.php",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  // Law and economics (PR #27, checked 2026-10-29). Czech law is a
  // five-year long-cycle master's entered from secondary school.
  {
    id: "uniba-praf-law-bsc-2027",
    universityId: "79e938c73e40ae20dfe7",
    universityHost: "uniba.sk",
    universityName: "Comenius University Bratislava",
    faculty: "Faculty of Law",
    country: "Slovakia",
    countryCode: "SK",
    city: "Bratislava",
    category: "Law",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "On 29 October 2026 the faculty's bachelor admission page still showed the 2026/27 conditions only. DocRoute does not build a personalised route or document checklist until the 2027/28 conditions are published.",
    programs: [{ programName: "Law", localProgramName: "Právo" }],
    sources: [
      {
        id: "praf-uk-bachelor-page",
        title: "Bachelor's study: admission",
        publisher: "Faculty of Law, Comenius University Bratislava",
        url: "https://www.flaw.uniba.sk/studium/uchadzac-prijimacie-konanie/bakalarske-studium/",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote:
        "Admission conditions for the bachelor programme Právo (full-time bPRV17, external bPRVx25), academic year 2026/2027. The document gives no approval date.",
      facts: [
        {
          label: "Application deadline",
          value:
            "Full-time, no exam: 15 June 2026 (round I), 7 August 2026 (round II). Full-time with exam: 30 April 2026 (round I), 7 August (round II). Electronic application, fee €70 (non-refundable).",
        },
        {
          label: "Who takes the exam",
          value:
            "No exam if you have Slovak or Czech, a maturita in history and civics (or equivalent content) and a foreign-language maturita at B2 or higher. Otherwise a written test in civics (basics of law, philosophy, economics) and history; at least 60% needed.",
        },
        {
          label: "Planned intake",
          value: "600 full-time (free for the standard 3 years), 200 external (about €1,499 a year).",
        },
        {
          label: "Language",
          value:
            "Slovak (or Czech good enough to study in Slovak), plus English, German or French at B2.",
        },
        {
          label: "School certificate from abroad",
          value:
            "Recognition note (doložka) on the foreign certificate with certified copies and translations, or a decision on equivalence.",
        },
      ],
      programRules: [
        {
          localProgramName: "Právo",
          rule: "Bachelor's, 3 years, Slovak. Followed by a 2-year master's for the Mgr. degree.",
        },
      ],
      overview: {
        applicationDocuments: [
          "Electronic application and €70 fee by 30 April (with exam) or 15 June 2026 (no exam).",
          "Certified copy of the maturita certificate (by 15 June 2026 if you take the exam).",
        ],
        entranceRequirements: [
          "No exam with Slovak/Czech, history and civics maturita and a B2 foreign-language maturita.",
          "Otherwise civics and history test, 60% minimum.",
          "English, German or French at B2.",
        ],
        afterAdmission: [
          "Foreign certificate: recognition note or equivalence decision.",
          "Full-time study free for the standard length; external about €1,499 a year.",
        ],
      },
      sources: [
        {
          id: "praf-uk-conditions-2026-27",
          title: "Admission conditions, bachelor Právo, 2026/2027",
          publisher: "Faculty of Law, Comenius University Bratislava",
          url: "https://www.flaw.uniba.sk/fileadmin/praf/Studium/uchadzac/2026-2027/PK_bPRV17_bPRVx25_2026_2027.pdf",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "cuni-prf-law-2027",
    universityId: "82010c9cd5813db075bc",
    universityHost: "cuni.cz",
    universityName: "Charles University",
    faculty: "Faculty of Law",
    country: "Czechia",
    countryCode: "CZ",
    city: "Prague",
    category: "Law",
    degreeLevel: "long-cycle",
    intake: "2027/28",
    status: "rules-published",
    statusNote:
      "The faculty published its admission conditions for 2027/28. They are summarised below for reference; DocRoute has not built a personalised route or document checklist from them yet. Czech residence steps are on the Czechia route.",
    programs: [{ programName: "Law and Legal Science", localProgramName: "Právo a právní věda" }],
    sources: [
      {
        id: "prf-uk-conditions-page-2027",
        title: "Conditions for admission 2027/2028",
        publisher: "Faculty of Law, Charles University",
        url: "https://prf.cuni.cz/magisterske-studium-mgr/podminky-pro-prijeti-ke-studiu-20272028",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2027/28",
      approvedNote:
        "Conditions for admission to the master's programme Právo a právní věda for 2027/2028, approved by the faculty's Academic Senate (the page gives no date).",
      facts: [
        {
          label: "Application deadline",
          value:
            "31 March 2027. The fee is due on the third day after the deadline (the page does not state the amount); unpaid applications are withdrawn.",
        },
        {
          label: "Entrance exam",
          value:
            "SCIO National Comparative Exams: OSP (general aptitude) and ZSV (social sciences), in person or online, December 2026 – May 2027; the best result counts. Score = OSP percentile × 1.25 + ZSV percentile × 0.75, plus up to 15 bonus points (C1+ language certificate, national SOČ, national olympiad; 5 each).",
        },
        {
          label: "Admission",
          value:
            "Planned intake 750 (plus ties); the dean sets the minimum score and may lower it if fewer than 94% enrol. Results 16 June 2027, enrolment 21–24 June 2027.",
        },
        {
          label: "Waiver",
          value: "Only for applicants who already studied part of this programme with an average of 1.50 or better (request by 31 March 2027).",
        },
        {
          label: "School certificate from abroad",
          value:
            "Slovak, Polish, Hungarian and Slovenian certificates are recognised automatically; others need nostrifikace, IB/EB or a faculty assessment (CZK 1,050), by 1 September 2027.",
        },
      ],
      programRules: [
        {
          localProgramName: "Právo a právní věda",
          rule: "Five-year master's (Mgr.) taught in Czech, entered straight from secondary school.",
        },
      ],
      overview: {
        applicationDocuments: [
          "Electronic application by 31 March 2027; fee due 3 days later.",
          "Language certificates for bonus points by 1 June 2027.",
          "Maturita certificate uploaded by 18 June 2027 for June enrolment.",
        ],
        entranceRequirements: [
          "SCIO OSP and ZSV, December 2026 – May 2027.",
          "Score OSP × 1.25 + ZSV × 0.75 + up to 15 bonus points.",
          "About 750 admitted; threshold set by the dean.",
        ],
        afterAdmission: [
          "Enrolment 21–24 June 2027 (substitute 6 September).",
          "Recognition of a foreign certificate by 1 September 2027 (Slovak maturita automatic).",
        ],
      },
      sources: [
        {
          id: "prf-uk-conditions-2027-28",
          title: "Conditions for admission 2027/2028 (Právo a právní věda)",
          publisher: "Faculty of Law, Charles University",
          url: "https://prf.cuni.cz/magisterske-studium-mgr/podminky-pro-prijeti-ke-studiu-20272028",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "muni-law-2027",
    universityId: "1def63b3ac858b190c04",
    universityHost: "muni.cz",
    universityName: "Masaryk University",
    faculty: "Faculty of Law",
    country: "Czechia",
    countryCode: "CZ",
    city: "Brno",
    category: "Law",
    degreeLevel: "long-cycle",
    intake: "2027/28",
    status: "rules-published",
    statusNote:
      "The faculty published its 2027/28 admission information. It is summarised below for reference; DocRoute has not built a personalised route or document checklist from it yet. Rules for foreign school certificates were not checked.",
    programs: [{ programName: "Law and Legal Science", localProgramName: "Právo a právní věda" }],
    sources: [
      {
        id: "muni-law-admission-page",
        title: "Admission procedure (master's)",
        publisher: "Faculty of Law, Masaryk University",
        url: "https://www.law.muni.cz/content/cs/chci-studovat/magisterske-studium/prijimaci-rizeni/",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2027/28",
      approvedNote:
        "Admission information for Právo a právní věda, academic year 2027/2028, published by the faculty. The full conditions PDF could not be opened by DocRoute's tools.",
      facts: [
        {
          label: "Application deadline",
          value:
            "Electronic application 1 November 2026 – 28 February 2027. Fee per programme: CZK 800 in the information leaflet, CZK 850 on the faculty's admission page (check before paying).",
        },
        {
          label: "Entrance exam",
          value:
            "MU Test of Study Potential (TSP), up to two attempts (29 Nov 2026 – 14 Feb 2027 and 15 Feb – 25 Apr 2027), better result counts. Weighted percentiles: numerical-analytical 40%, reasoning in English 20%, critical thinking 40%. Maturita results are not considered.",
        },
        {
          label: "Admission",
          value: "Expected intake 575. Last year the last admitted applicant had a weighted percentile of about 70.",
        },
        {
          label: "Waiver",
          value:
            "The dean may waive the TSP, e.g. for SCIO OSP and ZSV both at the 90th percentile (tests 1 Nov 2026 – 31 Mar 2027, up to 200 applicants) or listed competition results.",
        },
        {
          label: "Enrolment",
          value: "Full-time enrolment 21–23 June 2027.",
        },
      ],
      programRules: [
        {
          localProgramName: "Právo a právní věda",
          rule: "Five-year master's (Mgr.) taught in Czech, entered straight from secondary school.",
        },
      ],
      overview: {
        applicationDocuments: [
          "Electronic application by 28 February 2027; fee CZK 800–850 (sources differ).",
          "Waiver request with SCIO or competition proof, if eligible.",
        ],
        entranceRequirements: [
          "MU TSP: up to two attempts, 29 Nov 2026 – 25 Apr 2027.",
          "Expected intake 575; last year's cut-off about the 70th percentile.",
        ],
        afterAdmission: [
          "Enrolment 21–23 June 2027.",
          "Foreign certificates: see the faculty's guidance (not checked by DocRoute).",
        ],
      },
      sources: [
        {
          id: "muni-law-leaflet-2027-28",
          title: "Information on admission to the Faculty of Law, 2027/2028",
          publisher: "Faculty of Law, Masaryk University",
          url: "https://www.law.muni.cz/dokumenty/66888",
          checkedAt: "2026-10-29",
        },
        {
          id: "muni-law-admission-page-2027",
          title: "Admission procedure: TSP, fee and waivers",
          publisher: "Faculty of Law, Masaryk University",
          url: "https://www.law.muni.cz/content/cs/chci-studovat/magisterske-studium/prijimaci-rizeni/",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "euba-economics-bsc-2027",
    universityId: "c5f6d6f7307d1b892cb5",
    universityHost: "euba.sk",
    universityName: "Bratislava University of Economics and Business",
    faculty: "University-wide framework (faculties set further conditions)",
    country: "Slovakia",
    countryCode: "SK",
    city: "Bratislava",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "On 29 October 2026 the university's 2027/28 page gave only the English-programme exam date (23 March 2027); the bachelor application dates and conditions were still “to be announced”. DocRoute shows the approved 2026/27 framework for orientation.",
    programs: [
      { programName: "Slovak-taught bachelor's programmes", localProgramName: "Bakalárske študijné programy" },
      { programName: "English-taught bachelor's programmes", localProgramName: "English-taught programmes" },
    ],
    sources: [
      {
        id: "euba-general-2027",
        title: "General information on the admission procedure (2027/2028)",
        publisher: "Bratislava University of Economics and Business",
        url: "https://euba.sk/en/applicant/admission-procedure/general-information",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote:
        "EUBA regulation B/2/2025, framework admission conditions for 2026/2027, approved by the Academic Senate on 16 May 2025.",
      facts: [
        {
          label: "Application deadline",
          value:
            "Slovak-taught: 15 November 2025 – 30 April 2026, fee €40 (€60 for Economics and Law). English-taught: until 28 February 2026, fee €90. Electronic only, one application and fee per faculty.",
        },
        {
          label: "Entrance exam",
          value:
            "Written tests: general study aptitude and one foreign language, 100 points each (some programmes add a subject). Slovak programmes 15–19 June 2026, English 24 March 2026, no make-up date. School grades are not considered; the dean sets the minimum.",
        },
        {
          label: "Exam waiver",
          value:
            "National round of listed olympiads/competitions (2022/23–2025/26), or SCIO NPS aptitude and foreign-language tests at the 60th percentile+ each (by 1 May 2026; 15 March for English programmes).",
        },
        {
          label: "Language",
          value:
            "Foreign applicants (except Czech) take the exam in Slovak and must show a Slovak certificate or completed accredited Slovak course by enrolment.",
        },
        {
          label: "School certificate from abroad",
          value: "Recognised documents plus confirmation from the ministry's recognition centre (except Czech applicants).",
        },
      ],
      programRules: [
        {
          localProgramName: "Bakalárske študijné programy",
          rule: "Faculties (National Economy, Commerce, Business Management, Economic Informatics, Applied Languages, Business Economics in Košice, International Relations) add their own conditions.",
        },
        {
          localProgramName: "English-taught programmes",
          rule: "2027/28 list: Applied Economy, Finance, Banking and Investment, Business Economics and Management, and others; admission procedure 23 March 2027. Tuition not checked.",
        },
      ],
      overview: {
        applicationDocuments: [
          "Electronic application and fee (€40–€90) by 30 April 2026 (Slovak) or 28 February 2026 (English).",
          "Certified maturita copy on the exam day or by enrolment.",
        ],
        entranceRequirements: [
          "Aptitude + foreign-language test, 15–19 June 2026 (English programmes 24 March).",
          "Waiver: national olympiad round or SCIO 60th percentile+ in both tests.",
          "Exam in Slovak for foreigners except Czech applicants.",
        ],
        afterAdmission: [
          "Slovak certificate or accredited course by enrolment.",
          "Recognised foreign documents with the ministry centre's confirmation.",
          "Enrolment in person.",
        ],
      },
      sources: [
        {
          id: "euba-framework-2026-27",
          title: "Framework admission conditions, academic year 2026/2027 (B/2/2025)",
          publisher: "Bratislava University of Economics and Business",
          url: "https://www.euba.sk/www_write/files/SK/docs/vnutorne-predpisy/2025/2025_b_2_2025_ramcove_podmienky_prijatia_na_studium_na_ak._rok_2026_2027.pdf",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "vse-nf-economics-bsc-2027",
    universityId: "aa8f2e91b2d0d7cc779d",
    universityHost: "vse.cz",
    universityName: "Prague University of Economics and Business",
    faculty: "Faculty of Economics (NF VŠE)",
    country: "Czechia",
    countryCode: "CZ",
    city: "Prague",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "On 29 October 2026 the faculty's bachelor admission page described entry in 2026/27 (updated 9 May 2026). DocRoute shows those rules for orientation until the 2027/28 rules are out.",
    programs: [
      { programName: "Economics", localProgramName: "Ekonomie" },
      { programName: "National Economy", localProgramName: "Národní hospodářství" },
      { programName: "Public Administration and Regional Development", localProgramName: "Veřejná správa a regionální rozvoj" },
    ],
    sources: [
      {
        id: "nf-vse-admission-page",
        title: "Bachelor's admission: detailed information for applicants",
        publisher: "Faculty of Economics, Prague University of Economics and Business",
        url: "https://nf.vse.cz/homepage/zajemci-o-studium/bakalarske-studium/prijimaci-rizeni-podrobne-informace-pro-uchazece/",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote: "Admission rules for bachelor entry from the 2026/2027 winter semester, as published on the faculty page (updated 9 May 2026).",
      facts: [
        {
          label: "Application deadline",
          value: "One electronic application by 31 May 2026; fee CZK 990 (non-refundable) by the same date.",
        },
        {
          label: "Entrance exam",
          value:
            "SCIO OSP or VŠP result from the last three years (1 June 2023 – 31 May 2026), best counts; verbal × 0.3 + analytical × 0.7, up to 100 points, +10 for a B2+ foreign-language certificate. Share results with NF VŠE in your SCIO profile.",
        },
        {
          label: "Admission without exam",
          value:
            "Average of 1.50 or better in all compulsory subjects (last year-end and current half-year reports), top 10 in the dean's competition, or a high national SOČ/olympiad placing.",
        },
        {
          label: "Thresholds 2026/27",
          value: "Ekonomie 75 points; Národní hospodářství and Veřejná správa a regionální rozvoj 60 points.",
        },
        {
          label: "Language and certificates",
          value:
            "No separate Czech test: the SCIO test is enough. Foreign certificates: VŠE internal recognition or nostrifikace by enrolment.",
        },
      ],
      programRules: [
        { localProgramName: "Ekonomie", rule: "Threshold 75 points in 2026/27." },
        { localProgramName: "Národní hospodářství", rule: "Threshold 60 points in 2026/27." },
        { localProgramName: "Veřejná správa a regionální rozvoj", rule: "Threshold 60 points in 2026/27." },
      ],
      overview: {
        applicationDocuments: [
          "One electronic application and CZK 990 fee by 31 May 2026.",
          "B2+ language certificate (digitally converted) for bonus points.",
        ],
        entranceRequirements: [
          "SCIO OSP/VŠP: verbal 30%, analytical 70%, up to 100 points.",
          "Or admission without exam: average 1.50 or better, competitions.",
          "No separate Czech test.",
        ],
        afterAdmission: [
          "Foreign certificate: VŠE recognition or nostrifikace by enrolment.",
          "Slovak applicants upload the full ASICE container.",
        ],
      },
      sources: [
        {
          id: "nf-vse-rules-2026-27",
          title: "Bachelor's admission rules from the winter semester 2026/2027",
          publisher: "Faculty of Economics, Prague University of Economics and Business",
          url: "https://nf.vse.cz/homepage/zajemci-o-studium/bakalarske-studium/prijimaci-rizeni-podrobne-informace-pro-uchazece/",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  // Czech medicine (PR #27, checked 2026-10-29).
  {
    id: "cuni-lf1-medicine-2027",
    universityId: "82010c9cd5813db075bc",
    universityHost: "cuni.cz",
    universityName: "Charles University",
    faculty: "First Faculty of Medicine",
    country: "Czechia",
    countryCode: "CZ",
    city: "Prague",
    category: "Medicine",
    degreeLevel: "long-cycle",
    intake: "2027/28",
    status: "rules-published",
    statusNote:
      "The faculty published its 2027/28 admission conditions and dates. They are summarised below for reference; the test format, bonus and waiver details were not all on the checked pages, so DocRoute has not built a route yet.",
    programs: [
      { programName: "General Medicine", localProgramName: "Všeobecné lékařství" },
      { programName: "Dentistry", localProgramName: "Zubní lékařství" },
    ],
    sources: [
      {
        id: "lf1-conditions-2027",
        title: "Admission conditions at the First Faculty of Medicine (2027/2028)",
        publisher: "First Faculty of Medicine, Charles University",
        url: "https://www.lf1.cuni.cz/podminky-prijimaciho-rizeni-na-1-lf",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2027/28",
      approvedNote: "Admission conditions for 2027/2028, valid 1 October 2026 – 30 September 2027, as published by the faculty.",
      facts: [
        {
          label: "Application deadline",
          value: "Electronic, 1 December 2026 – 28 February 2027, no attachments. Fee CZK 1,000 per application, due by the third day after the deadline.",
        },
        {
          label: "Entrance exam",
          value:
            "Written test in physics, chemistry and biology, in Czech, on 17 June 2027 (substitute date 23 June 2027 on request). Invitations about 20 days before.",
        },
        {
          label: "Waiver and bonus points",
          value: "Exam waiver and bonus points (school maths results, olympiads, SOČ, selected international olympiads) by request until 24 May 2027.",
        },
        {
          label: "Language",
          value: "Certified Czech C1 certificate at enrolment for applicants who finished school abroad; other language certificates do not count.",
        },
        {
          label: "School certificate from abroad",
          value: "Nostrifikace, or a faculty assessment (CZK 1,050) requested by 30 June 2027.",
        },
      ],
      programRules: [
        { localProgramName: "Všeobecné lékařství", rule: "Six-year MUDr., Czech-taught." },
        { localProgramName: "Zubní lékařství", rule: "Five-year MDDr., same exam date." },
      ],
      overview: {
        applicationDocuments: [
          "Electronic application 1 Dec 2026 – 28 Feb 2027; fee CZK 1,000.",
          "Waiver or bonus request by 24 May 2027.",
        ],
        entranceRequirements: [
          "Physics, chemistry and biology test in Czech, 17 June 2027.",
          "Substitute date 23 June 2027 on request.",
        ],
        afterAdmission: [
          "At enrolment: maturita, nostrifikace if needed, Czech C1, medical certificate, hepatitis B vaccination.",
        ],
      },
      sources: [
        {
          id: "lf1-conditions-2027-28",
          title: "Admission conditions 2027/2028",
          publisher: "First Faculty of Medicine, Charles University",
          url: "https://www.lf1.cuni.cz/podminky-prijimaciho-rizeni-na-1-lf",
          checkedAt: "2026-10-29",
        },
        {
          id: "lf1-dates-2027-28",
          title: "Admission dates 2027/2028",
          publisher: "First Faculty of Medicine, Charles University",
          url: "https://www.lf1.cuni.cz/terminy-prijimaciho-rizeni",
          checkedAt: "2026-10-29",
        },
        {
          id: "lf1-cuni-is-2027",
          title: "First Faculty of Medicine: application fee and general conditions",
          publisher: "Charles University information system",
          url: "https://is.cuni.cz/studium/prijimacky/index.php?do=info_fakulta&fak=11110",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
  {
    id: "muni-lf-medicine-2027",
    universityId: "1def63b3ac858b190c04",
    universityHost: "muni.cz",
    universityName: "Masaryk University",
    faculty: "Faculty of Medicine",
    country: "Czechia",
    countryCode: "CZ",
    city: "Brno",
    category: "Medicine",
    degreeLevel: "long-cycle",
    intake: "2027/28",
    status: "rules-not-published",
    statusNote:
      "On 29 October 2026 the faculty's admission page described the 2026 cycle; MU applications for 2027/28 open on 1 November 2026. DocRoute shows the 2026/27 handbook for orientation.",
    programs: [
      { programName: "General Medicine", localProgramName: "Všeobecné lékařství" },
      { programName: "Dentistry", localProgramName: "Zubní lékařství" },
    ],
    sources: [
      {
        id: "muni-lf-admission-page",
        title: "Admission procedure",
        publisher: "Faculty of Medicine, Masaryk University",
        url: "https://www.med.muni.cz/chci-studovat/prijimaci-rizeni",
        checkedAt: "2026-10-29",
      },
    ],
    checkedAt: "2026-10-29",
    referenceRules: {
      intake: "2026/27",
      approvedNote: "Faculty handbook “Studuj na LF MU” for 2026/2027.",
      facts: [
        {
          label: "Application deadline",
          value: "Electronic, 1 November 2025 – 28 February 2026; fee CZK 900 per application.",
        },
        {
          label: "Entrance exam",
          value:
            "11 or 12 June 2026: biology, chemistry and physics, 40 multiple-choice questions each in 50 minutes, 1 point per correct answer, no penalty. No substitute dates.",
        },
        {
          label: "Planned intake",
          value: "About 430 places in General Medicine (3,671 applications the year before).",
        },
        {
          label: "Without exam",
          value:
            "General Medicine only: excellent school grades (paper request with certified reports by 28 February) or bonus-based admission (SOČ, competitions, language certificates).",
        },
        {
          label: "School certificate from abroad",
          value: "Nostrifikace for a maturita from outside Slovakia; the admission decision is issued only after the converted certificate is uploaded.",
        },
      ],
      programRules: [
        { localProgramName: "Všeobecné lékařství", rule: "Six-year MUDr.; waiver and bonus routes exist." },
        { localProgramName: "Zubní lékařství", rule: "Five-year MDDr.; bonus points, no waiver." },
      ],
      overview: {
        applicationDocuments: [
          "Electronic application 1 Nov – 28 Feb; fee CZK 900.",
          "Waiver or bonus request on paper with certified copies.",
        ],
        entranceRequirements: [
          "Biology, chemistry, physics: 3 × 40 questions, 11–12 June 2026.",
          "About 430 places in General Medicine.",
        ],
        afterAdmission: [
          "Distance enrolment by 30 June 2026 (by 9 June if admitted without exam).",
          "Nostrifikace unless the school is Czech or Slovak.",
        ],
      },
      sources: [
        {
          id: "muni-lf-handbook-2026-27",
          title: "Studuj na LF MU, 2026/2027",
          publisher: "Faculty of Medicine, Masaryk University",
          url: "https://www.med.muni.cz/do/med/web_lf_mu/uchazeci/spolecne_dokumenty_bc_mgr_nmgr/prirucka_Studuj_na_LF_MU/Prirucka_Studuj_na_LF_MU_-_2026_2027.pdf",
          checkedAt: "2026-10-29",
        },
      ],
      checkedAt: "2026-10-29",
    },
  },
];

export function pendingStatusLabel(status: PendingProgramGroup["status"]) {
  if (status === "rules-not-published") return "Rules not published yet";
  if (status === "rules-published") return "Rules published, route not built yet";
  return "Rules awaiting approval";
}

export function formatPendingDegree(
  level: PendingProgramGroup["degreeLevel"],
  category?: string,
) {
  if (level === "long-cycle") {
    return category === "Medicine" ? "Long-cycle master's (MUDr./MDDr.)" : "Long-cycle master's (Mgr.)";
  }
  return level === "bachelor" ? "Bachelor's" : "Master's";
}

// Rules shown for the group's own intake are "published"; earlier ones are
// "last year's" rules.
export function isCurrentReference(group: PendingProgramGroup) {
  return group.referenceRules?.intake === group.intake;
}

export function findPendingProgramGroups(filter: {
  universityId?: string;
  universityHost?: string;
  countryCode?: string;
  category?: string;
  degreeLevel?: DegreeLevel;
  intake?: StudyIntake;
}) {
  return pendingProgramGroups.filter(
    (group) =>
      (filter.universityId === undefined ||
        group.universityId === filter.universityId) &&
      (filter.universityHost === undefined ||
        group.universityHost === filter.universityHost) &&
      (filter.countryCode === undefined ||
        group.countryCode === filter.countryCode) &&
      (filter.category === undefined || group.category === filter.category) &&
      (filter.degreeLevel === undefined ||
        group.degreeLevel === filter.degreeLevel ||
        // Medicine is entered from secondary school, like a bachelor's.
        (filter.degreeLevel === "bachelor" && group.degreeLevel === "long-cycle")) &&
      (filter.intake === undefined || group.intake === filter.intake),
  );
}
