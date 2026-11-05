import universities from "@/data/universities.json";
import { pendingProgramGroups } from "@/data/pending-programs";
import { topUniversities } from "@/data/top-universities";
import { verifiedPrograms } from "@/data/verified-programs";
import { verifiedStudyResidence } from "@/lib/residence/study-routes";
import type { AdmissionProgram } from "@/types/admission";

// One page per EU country and Switzerland (/countries/xx): what DocRoute has
// for study, work, family and business there, and how deep it goes
// (verified routes or official links only). Built from the same data as the
// routes, so a page can never promise more than the route behind it.


export { countryHref, countryPages, findCountryPage, purposeRoute, type CountryPage, type CountryPurpose, type Coverage } from "@/lib/country-list";
import type { Coverage } from "@/lib/country-list";

const studyResidenceVerified = new Set(["SK", "CZ", ...Object.keys(verifiedStudyResidence)]);

export type CountryStudy = {
  universities: number;
  top100: Array<{ rank: number; name: string; catalogId?: string }>;
  verified: Array<{ category: string; faculty: string; universityName: string; programs: number }>;
  verifiedCategories: string[];
  comingSoon: number;
  residence: Coverage;
};

function groupVerified(programs: readonly AdmissionProgram[]) {
  const map = new Map<string, CountryStudy["verified"][number]>();
  for (const program of programs) {
    const key = `${program.universityId}|${program.faculty}|${program.category}`;
    const existing = map.get(key);
    if (existing) existing.programs += 1;
    else map.set(key, { category: program.category, faculty: program.faculty, universityName: program.universityName, programs: 1 });
  }
  return [...map.values()];
}

export function countryStudy(code: string): CountryStudy {
  const country = code.toUpperCase();
  const programs = verifiedPrograms.filter((program) => program.countryCode === country);
  return {
    universities: (universities as { universities: Array<{ countryCode: string }> }).universities.filter(
      (item) => item.countryCode === country,
    ).length,
    top100: topUniversities
      .filter((item) => item.countryCode === country)
      .map((item) => ({ rank: item.rank, name: item.name, catalogId: (item as { catalogId?: string }).catalogId })),
    verified: groupVerified(programs),
    verifiedCategories: [...new Set(programs.map((program) => program.category))].sort(),
    comingSoon: pendingProgramGroups.filter((group) => group.countryCode === country).length,
    residence: studyResidenceVerified.has(country) ? "verified" : "official-links",
  };
}
