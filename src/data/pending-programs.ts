import type { DegreeLevel, OfficialSource, StudyIntake } from "@/types/admission";

// Programs whose admission rules for the intake are announced but not yet
// published in final, approved form. They are listed so people can see what
// is coming, but they never produce a match, checklist or route. Do not copy
// numbers (thresholds, dates, fees) from a draft or from another year here:
// a pending entry becomes an AdmissionProgram only after the approved rules
// for exactly this intake are checked.
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
      "The faculty's admission conditions for 2027/28 were submitted to its Academic Senate on 19 October 2026 as a draft. The approved version has not been published yet, so DocRoute does not build a personalised route or document checklist for these programs.",
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
        id: "fmfi-applications",
        title: "Bachelor applications and admission conditions",
        publisher:
          "Faculty of Mathematics, Physics and Informatics, Comenius University Bratislava",
        url: "https://fmph.uniba.sk/prihlasky/",
        checkedAt: "2026-10-23",
      },
    ],
    checkedAt: "2026-10-23",
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
