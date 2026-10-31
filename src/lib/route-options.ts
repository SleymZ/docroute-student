import {
  findPendingProgramGroups,
  type PendingProgramGroup,
} from "@/data/pending-programs";
import { matchProgram } from "@/lib/match-programs";
import type {
  AdmissionProgram,
  ApplicantProfile,
  ProgramMatch,
} from "@/types/admission";

export type RouteOptions = {
  /** Verified programmes for the profile's field, degree and intake in any
   *  country, each matched against the profile. */
  matches: ProgramMatch[];
  /** "Coming soon" listings for the same field, degree and intake. Their
   *  rules are not approved yet, so they are never matched. */
  pending: PendingProgramGroup[];
};

// Residence statuses that describe the destination country itself. When an
// option sits in another country, they become residence elsewhere in the EU.
const destinationRelative = new Set<ApplicantProfile["currentResidenceStatus"]>([
  "destination-study-residence",
  "destination-residence",
  "destination-permanent-residence",
  "destination-national-visa",
]);

/** The same profile with another destination country. Destination-relative
 *  residence ("study residence in the destination") is translated to
 *  residence in another EU country, so it never claims the new country. */
export function profileForDestination(
  profile: ApplicantProfile,
  countryCode: string,
): ApplicantProfile {
  if (countryCode === profile.destinationCountryCode) return profile;
  return {
    ...profile,
    destinationCountryCode: countryCode,
    currentResidenceStatus: destinationRelative.has(profile.currentResidenceStatus)
      ? "other-eu-residence"
      : profile.currentResidenceStatus,
  };
}

/** A verified match the person can act on: everything except programmes
 *  that are not available for this route at all. */
export function isRouteOption(match: ProgramMatch) {
  return match.status !== "unavailable";
}

/** Everything DocRoute holds for the profile's field, degree and intake,
 *  in the destination country and elsewhere in Europe. Verified programmes
 *  go through the normal matcher; coming-soon listings are only listed. */
export function findRouteOptions(
  profile: ApplicantProfile,
  programs: readonly AdmissionProgram[],
  asOfDate: string,
): RouteOptions {
  const order: Record<ProgramMatch["status"], number> = {
    conditional: 0,
    "more-information": 1,
    "preparation-required": 2,
    unavailable: 3,
  };
  const matches = programs
    .filter(
      (program) =>
        program.category === profile.studyCategory &&
        program.degreeLevel === profile.degreeLevel &&
        program.intake === profile.intake,
    )
    .map((program) =>
      matchProgram(profileForDestination(profile, program.countryCode), program, asOfDate),
    )
    .sort(
      (a, b) =>
        order[a.status] - order[b.status] ||
        a.program.programName.localeCompare(b.program.programName, "en"),
    );

  const pending = findPendingProgramGroups({
    category: profile.studyCategory,
    degreeLevel: profile.degreeLevel,
    intake: profile.intake,
  });

  return { matches, pending };
}
