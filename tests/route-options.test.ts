import assert from "node:assert/strict";
import { test } from "node:test";

import { verifiedPrograms } from "../src/data/verified-programs";
import { findRouteOptions, isRouteOption, profileForDestination } from "../src/lib/route-options";
import type { ApplicantProfile } from "../src/types/admission";

const profile: ApplicantProfile = {
  destinationCountryCode: "SK",
  studyCategory: "Computer Science",
  degreeLevel: "bachelor",
  intake: "2027/28",
  citizenshipCountryCode: "IL",
  educationCountryCode: "SK",
  currentResidenceStatus: "destination-residence",
  educationStatus: "final-year",
  gradeScale: "slovak-1-5",
  languages: [
    { code: "en", level: "B2", willingToStudyIn: true, proof: "school" },
    { code: "sk", level: "B2", willingToStudyIn: true, proof: "school" },
  ],
  waiverEvidence: [],
};

test("route options cover verified programmes in every country for the same field, degree and intake", () => {
  const { matches } = findRouteOptions(profile, verifiedPrograms, "2026-10-31");
  const expected = verifiedPrograms.filter(
    (program) =>
      program.category === profile.studyCategory &&
      program.degreeLevel === profile.degreeLevel &&
      program.intake === profile.intake,
  );
  assert.equal(matches.length, expected.length);
  const countries = new Set(matches.map((match) => match.program.countryCode));
  assert.ok(countries.has("SK"), "destination country included");
  assert.ok(countries.has("CZ"), "other countries included");
  // Sorted: programmes with steps remaining come before preparation routes.
  const ranks = matches.map((match) =>
    ["conditional", "more-information", "preparation-required", "unavailable"].indexOf(match.status),
  );
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
});

test("coming-soon listings are included for the same field, degree and intake, never matched", () => {
  const { pending } = findRouteOptions(profile, verifiedPrograms, "2026-10-31");
  assert.ok(pending.length > 0);
  assert.ok(pending.some((group) => group.countryCode === "SK"), "Slovak coming-soon listings");
  for (const group of pending) {
    assert.equal(group.category, "Computer Science");
    assert.equal(group.intake, "2027/28");
  }
});

test("only programmes that are unavailable for the route are left out of the options", () => {
  const { matches } = findRouteOptions(profile, verifiedPrograms, "2026-10-31");
  for (const match of matches) {
    assert.equal(isRouteOption(match), match.status !== "unavailable");
  }
});

test("another destination never claims residence in that country", () => {
  const sk = { ...profile, currentResidenceStatus: "destination-study-residence" as const };
  const cz = profileForDestination(sk, "CZ");
  assert.equal(cz.destinationCountryCode, "CZ");
  assert.equal(cz.currentResidenceStatus, "other-eu-residence");
  assert.equal(profileForDestination(sk, "SK"), sk);
  // A UK permit is not EU/EEA residence: the route must ask instead.
  const uk = { ...profile, destinationCountryCode: "GB", currentResidenceStatus: "destination-residence" as const };
  assert.equal(profileForDestination(uk, "SK").currentResidenceStatus, "other");
  const visaFree = { ...profile, currentResidenceStatus: "visa-free-entry" as const };
  assert.equal(profileForDestination(visaFree, "CZ").currentResidenceStatus, "other");
  const noPermit = { ...profile, currentResidenceStatus: "non-eu-passport-no-residence" as const };
  assert.equal(profileForDestination(noPermit, "CZ").currentResidenceStatus, "non-eu-passport-no-residence");
});
