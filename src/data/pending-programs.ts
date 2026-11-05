import { europePendingGroups } from "@/data/pending-programs-europe";
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

const centralEuropeGroups: readonly PendingProgramGroup[] = [
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
      "TUM's aptitude assessment is a standing statute, but the dates for winter 2027/28 are not announced yet. DocRoute does not build a personalised route or document checklist; residence for non-EU students is in the full study path.",
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
      "On 29 October 2026 TU Wien listed dates only for winter 2026/27; the 2027 admission dates are not out yet. DocRoute does not build a personalised route; residence for non-EU students is in the full study path.",
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
      "On 29 October 2026 the admission procedure page showed the 2026 dates. DocRoute does not build a personalised route; residence for non-EU students is in the full study path.",
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
      "Taught in English. On 29 October 2026 JKU listed deadlines only for winter 2026/27. DocRoute does not build a personalised route; residence for non-EU students is in the full study path.",
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
      "The joint MedAT site of the Austrian medical universities already gives the expected 2027 dates (marked as not yet confirmed). DocRoute does not build a personalised route; residence for non-EU students is in the full study path.",
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
      "KIT's programme page does not state an intake year; its rules (selection statute, 15 July deadline) are standing and apply each winter term. DocRoute does not build a personalised route; residence for non-EU students is in the full study path.",
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

// Slovakia, Czechia, Austria and Germany first; further European listings
// live in pending-programs-europe.ts.
export const pendingProgramGroups: readonly PendingProgramGroup[] = [
  ...centralEuropeGroups,
  ...europePendingGroups,
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
