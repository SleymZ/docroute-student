import type { AdmissionProgram } from "@/types/admission";

/** One faculty's application deadline for the intake, with its programmes. */
export type FacultyDeadline = {
  key: string;
  deadline: string;
  daysLeft: number;
  laterRound: boolean;
  universityId: string;
  universityName: string;
  faculty: string;
  countryCode: string;
  city: string;
  category: string;
  programmes: string[];
  languages: string[];
  fee: string | null;
  applicationUrl: string;
  checkedAt: string;
  /** The university page opened on this faculty's first programme, so the
   *  visitor lands on the programme of the card, not on another field. */
  universityHref: string;
  /** Building the route for this field, degree and intake (guests are sent
   *  to sign-up first and come back here). */
  routeHref: string;
};

export function programmeHref(program: AdmissionProgram) {
  return `/universities/${encodeURIComponent(program.universityId)}?${new URLSearchParams({ programId: program.id }).toString()}`;
}

/** Same address as "Build my route" on the university page. */
export function programmeRouteHref(program: AdmissionProgram) {
  return `/route/profile?${new URLSearchParams({
    country: program.countryCode,
    program: program.category,
    degree: program.degreeLevel,
    intake: program.intake,
  }).toString()}`;
}

const DAY = 86_400_000;

export function daysUntil(today: string, date: string) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY);
}

/** The round still open on `today`: the main deadline, else a later round. */
export function openDeadline(program: AdmissionProgram, today: string) {
  if (program.application.deadline >= today) return { deadline: program.application.deadline, laterRound: false };
  const later = program.application.laterRounds?.find((round) => round.deadline >= today);
  return later ? { deadline: later.deadline, laterRound: true } : null;
}

export function feeText(program: AdmissionProgram) {
  if (program.application.feeLabel) return program.application.feeLabel;
  if (typeof program.application.feeEur === "number") return `€${program.application.feeEur}`;
  return null;
}

/**
 * Verified programmes grouped by faculty and deadline, soonest first.
 * Programmes whose every round has closed are left out.
 */
export function upcomingFacultyDeadlines(programs: readonly AdmissionProgram[], today: string): FacultyDeadline[] {
  const groups = new Map<string, FacultyDeadline>();
  for (const program of programs) {
    const open = openDeadline(program, today);
    if (!open) continue;
    const fee = feeText(program);
    // The field is part of the key: a faculty can teach programmes of two
    // fields (FP VUT: Economics and Management Informatics), and each field
    // filter must keep its own programmes.
    const key = [program.universityId, program.faculty, program.category, open.deadline, fee ?? ""].join("|");
    const group = groups.get(key);
    const languages = program.instructionLanguages.map((language) => language.name);
    if (group) {
      group.programmes.push(program.programName);
      for (const language of languages) if (!group.languages.includes(language)) group.languages.push(language);
      if (program.verifiedAt > group.checkedAt) group.checkedAt = program.verifiedAt;
      continue;
    }
    groups.set(key, {
      key,
      deadline: open.deadline,
      daysLeft: daysUntil(today, open.deadline),
      laterRound: open.laterRound,
      universityId: program.universityId,
      universityName: program.universityName,
      faculty: program.faculty,
      countryCode: program.countryCode,
      city: program.city,
      category: program.category,
      programmes: [program.programName],
      languages,
      fee,
      applicationUrl: program.application.applicationUrl,
      checkedAt: program.verifiedAt,
      universityHref: programmeHref(program),
      routeHref: programmeRouteHref(program),
    });
  }
  return [...groups.values()].sort(
    (a, b) =>
      a.deadline.localeCompare(b.deadline) ||
      a.countryCode.localeCompare(b.countryCode) ||
      a.universityName.localeCompare(b.universityName) ||
      a.faculty.localeCompare(b.faculty),
  );
}

export const DEADLINE_COUNTRIES = ["SK", "CZ"] as const;
export const DEADLINE_FIELDS = ["Computer Science", "Medicine", "Law", "Economics & Business"] as const;

export function filterDeadlines(rows: FacultyDeadline[], country: string | null, field: string | null) {
  return rows.filter(
    (row) => (!country || row.countryCode === country) && (!field || row.category === field),
  );
}

/** "February 2027" style month heading key: YYYY-MM. */
export function monthKey(date: string) {
  return date.slice(0, 7);
}
