import catalog from "@/data/universities.json";
import { pendingProgramGroups } from "@/data/pending-programs";
import { topUniversities } from "@/data/top-universities";
import { verifiedPrograms } from "@/data/verified-programs";

/**
 * University pages worth listing for search engines: those with a verified
 * route, a "coming soon" listing with official rules, or Top 100 admission
 * facts. A catalog-only page (name and website from the imported list) has
 * no facts of its own, so it is left out of the sitemap.
 */
export function indexableUniversityIds(): string[] {
  const known = new Set(catalog.universities.map((university) => university.id));
  const ids = new Set<string>();
  for (const program of verifiedPrograms) ids.add(program.universityId);
  for (const group of pendingProgramGroups) {
    if (group.universityId) ids.add(group.universityId);
  }
  for (const university of topUniversities) {
    if (university.catalogId) ids.add(university.catalogId);
  }
  return [...ids].filter((id) => known.has(id)).sort();
}
