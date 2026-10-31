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

// EU and EEA member states (residence there counts as "another EU / EEA
// country"). Switzerland and the UK are not in this list.
const euEea = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO",
]);

// Residence statuses that describe the destination country itself.
const destinationPermits = new Set<ApplicantProfile["currentResidenceStatus"]>([
  "destination-study-residence",
  "destination-residence",
  "destination-permanent-residence",
  "destination-national-visa",
]);

/** The same profile with another destination country. A permit or visa for
 *  the old destination becomes "residence in another EU / EEA country" when
 *  that destination is in the EU/EEA, otherwise "another status / not sure"
 *  so the route asks for clarification. A visa-free stay is tied to the old
 *  destination as well and also becomes "not sure". */
export function profileForDestination(
  profile: ApplicantProfile,
  countryCode: string,
): ApplicantProfile {
  if (countryCode === profile.destinationCountryCode) return profile;
  const status = profile.currentResidenceStatus;
  let translated = status;
  if (destinationPermits.has(status)) {
    translated = euEea.has(profile.destinationCountryCode) ? "other-eu-residence" : "other";
  } else if (status === "visa-free-entry") {
    translated = "other";
  }
  return { ...profile, destinationCountryCode: countryCode, currentResidenceStatus: translated };
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
