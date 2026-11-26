import assert from "node:assert/strict";
import { test } from "node:test";

import { recentlyVerified } from "../src/data/recently-verified";
import { findVerifiedProgram } from "../src/data/verified-programs";
import { buildRoutePreview } from "../src/lib/build-route-preview";
import { matchProgram } from "../src/lib/match-programs";
import type { ApplicantProfile } from "../src/types/admission";

const today = "2026-11-26";

function profile(patch: Partial<ApplicantProfile> = {}): ApplicantProfile {
  return {
    destinationCountryCode: "NL",
    studyCategory: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    citizenshipCountryCode: "UA",
    educationCountryCode: "UA",
    currentResidenceStatus: "non-eu-passport-no-residence",
    educationStatus: "final-year",
    gradeScale: "other",
    languages: [{ code: "en", level: "C1", willingToStudyIn: true, proof: "certificate", certificateName: "IELTS" }],
    waiverEvidence: [],
    ...patch,
  };
}

test("TU Delft: a Ukrainian applicant gets a route with the official Dutch residence page", () => {
  const program = findVerifiedProgram("tudelft-cse-bsc-2027")!;
  const match = matchProgram(profile(), program, today);
  assert.equal(match.canBuildRoute, true);
  const route = buildRoutePreview(profile(), match)!;
  const residence = route.stages.find((stage) => stage.id === "residence")!;
  assert.equal(residence.number, "04");
  assert.ok(residence.tasks.some((task) => task.id === "read-official-residence"));
  assert.ok(route.sources.some((source) => source.id === "eu-portal-student-nl"));
  assert.doesNotMatch(JSON.stringify(route.stages), /Slovak/);
});

test("WU BBE: the Austrian student permit route follows admission", () => {
  const program = findVerifiedProgram("wu-bbe-bsc-2027")!;
  const applicant = profile({ destinationCountryCode: "AT", studyCategory: "Economics & Business" });
  const route = buildRoutePreview(applicant, matchProgram(applicant, program, today))!;
  assert.ok(route.stages.some((stage) => stage.id === "residence-at-after"));
  assert.ok(route.sources.some((source) => source.id === "at-oead-student-permit"));
});

test("Constructor University: the German visa route; a later round stays open after 1 February", () => {
  const program = findVerifiedProgram("constructor-cs-bsc-2027")!;
  const applicant = profile({ destinationCountryCode: "DE" });
  const route = buildRoutePreview(applicant, matchProgram(applicant, program, today))!;
  assert.ok(route.sources.some((source) => source.id === "de-miig-study-visa"));
  assert.equal(matchProgram(applicant, program, "2027-03-01").canBuildRoute, true);
});

test("Vienna law asks for German, an EU citizen gets EU rules instead of a permit", () => {
  const program = findVerifiedProgram("univie-law-mag-2027")!;
  const noGerman = matchProgram(profile({ destinationCountryCode: "AT", studyCategory: "Law" }), program, today);
  assert.notEqual(noGerman.checks.find((item) => item.id === "language")!.status, "met");
  const eu = profile({
    destinationCountryCode: "AT",
    studyCategory: "Law",
    citizenshipCountryCode: "SK",
    currentResidenceStatus: "eu-eea-swiss-passport",
    languages: [{ code: "de", level: "C1", willingToStudyIn: true, proof: "certificate" }],
  });
  const route = buildRoutePreview(eu, matchProgram(eu, program, today));
  if (route) assert.ok(!route.sources.some((source) => source.id === "at-oead-student-permit"));
});

test("the newly verified strip leads with the 2026-11-26 programmes", () => {
  assert.ok(recentlyVerified.length >= 3 && recentlyVerified.length <= 5);
  for (const entry of recentlyVerified) assert.ok(findVerifiedProgram(entry.programId), entry.programId);
  assert.equal(recentlyVerified[0].addedOn, "2026-11-26");
});

test("Saarland keeps the English certificate task although no score is stated", () => {
  const program = findVerifiedProgram("saarland-cs-bsc-2027")!;
  const applicant = profile({ destinationCountryCode: "DE", languages: [] });
  const match = matchProgram(applicant, program, today);
  assert.ok(match.requiredDocuments.some((item) => item.id === "saar-english"));
});

test("saved full-path links of promoted listings lead to the verified programme", async () => {
  const { promotedFullPathProgram } = await import("../src/lib/full-path");
  assert.equal(promotedFullPathProgram("tudelft-cse-bsc-2027")?.id, "tudelft-cse-bsc-2027");
  assert.equal(promotedFullPathProgram("utwente-bit-bsc-2027")?.id, "utwente-tcs-bsc-2027");
  assert.equal(promotedFullPathProgram("tue-cse-bsc-2027"), null, "still coming soon");
});
