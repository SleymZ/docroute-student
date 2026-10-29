import type { DegreeLevel, OfficialSource, StudyIntake } from "@/types/admission";

// Programs whose admission rules for the intake are announced but not yet
// published in final, approved form. They are listed so people can see what
// is coming, but they never produce a match, checklist or route. Never put
// numbers from a draft into the group itself: a pending entry becomes an
// AdmissionProgram only after the approved rules for exactly this intake are
// checked.
//
// `previousCycle` is the one exception, kept apart on purpose: the approved
// rules of the previous intake, shown only as reference ("last year's
// rules, for orientation") with their own sources. The matcher never reads
// them, and the page always says they are not the rules for `intake`.
export type PreviousCycleRules = {
  // The intake the rules were approved for, e.g. "2026/27". Must be earlier
  // than the group's intake (a test checks it).
  intake: string;
  approvedNote: string;
  facts: ReadonlyArray<{ label: string; value: string }>;
  programRules: ReadonlyArray<{ localProgramName: string; rule: string }>;
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
  degreeLevel: DegreeLevel;
  intake: StudyIntake;
  // "rules-awaiting-approval": a draft for the intake exists;
  // "rules-not-published": nothing for the intake is published yet.
  status: "rules-awaiting-approval" | "rules-not-published";
  statusNote: string;
  programs: ReadonlyArray<{
    programName: string;
    localProgramName: string;
  }>;
  sources: OfficialSource[];
  checkedAt: string;
  previousCycle?: PreviousCycleRules;
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
    previousCycle: {
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
    previousCycle: {
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
    previousCycle: {
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
];

export function pendingStatusLabel(status: PendingProgramGroup["status"]) {
  return status === "rules-not-published"
    ? "Rules not published yet"
    : "Rules awaiting approval";
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
        group.degreeLevel === filter.degreeLevel) &&
      (filter.intake === undefined || group.intake === filter.intake),
  );
}
