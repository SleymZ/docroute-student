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
  status: "rules-awaiting-approval";
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
];

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
