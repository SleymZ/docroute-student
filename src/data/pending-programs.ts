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
  // "long-cycle": medicine and dentistry (combined first and second cycle,
  // MUDr./MDDr.), entered straight from secondary school like a bachelor's.
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
];

export function pendingStatusLabel(status: PendingProgramGroup["status"]) {
  if (status === "rules-not-published") return "Rules not published yet";
  if (status === "rules-published") return "Rules published, route not built yet";
  return "Rules awaiting approval";
}

export function formatPendingDegree(level: PendingProgramGroup["degreeLevel"]) {
  if (level === "long-cycle") return "Long-cycle master's (MUDr./MDDr.)";
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
