import type { AdmissionProgram, ApplicationDocument, OfficialSource } from "@/types/admission";

// Helpers for the Dutch, Austrian and German programmes verified on
// 2026-11-26 (owner: "check all those countries and verify them in one
// merge"). Each fact restates the university's own page; where a page gives
// rules for an earlier year (a fee table, a language page), the text says so.

export const CHECKED_2026_11_26 = "2026-11-26";

type Shared = Omit<
  AdmissionProgram,
  "id" | "programName" | "localProgramName" | "admissionPolicy" | "intake" | "studyMode" | "verifiedAt"
>;

export function europePrograms(
  shared: Shared,
  items: Array<{ id: string; programName: string; localProgramName: string; patch?: Partial<AdmissionProgram> }>,
): AdmissionProgram[] {
  return items.map((item) => ({
    ...shared,
    id: item.id,
    programName: item.programName,
    localProgramName: item.localProgramName,
    admissionPolicy: "generic-2027",
    intake: "2027/28",
    studyMode: "full-time",
    verifiedAt: CHECKED_2026_11_26,
    ...item.patch,
  }));
}

export function europeSource(id: string, title: string, publisher: string, url: string): OfficialSource {
  return { id, title, publisher, url, checkedAt: CHECKED_2026_11_26 };
}

export function europeDoc(
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

export const englishTaught = [{ code: "en", name: "English" }];

// Countries whose English-taught schools the Dutch pages name as exempt
// from an English test (each programme lists the ones its own page names).
export const englishSchoolCountries = ["US", "GB", "IE", "AU", "NZ", "CA"];
