import assert from "node:assert/strict";
import { test } from "node:test";

import {
  findPendingProgramGroups,
  pendingProgramGroups,
} from "../src/data/pending-programs";
import catalog from "../src/data/universities.json";
import { findVerifiedProgram, verifiedPrograms } from "../src/data/verified-programs";
import { matchPrograms } from "../src/lib/match-programs";
import type { ApplicantProfile } from "../src/types/admission";

const profile: ApplicantProfile = {
  destinationCountryCode: "SK",
  studyCategory: "Computer Science",
  degreeLevel: "bachelor",
  intake: "2027/28",
  citizenshipCountryCode: "UA",
  educationCountryCode: "UA",
  currentResidenceStatus: "non-eu-passport-no-residence",
  educationStatus: "final-year",
  gradeScale: "other",
  languages: [
    { code: "sk", level: "B2", willingToStudyIn: true, proof: "none" },
  ],
  waiverEvidence: [],
};

function host(website: string) {
  return new URL(website).hostname.replace(/^www\./, "");
}

test("each pending group points at an existing catalog institution", () => {
  for (const group of pendingProgramGroups) {
    const university = catalog.universities.find(
      (item) => item.id === group.universityId,
    );
    if (!university) {
      assert.fail(`${group.id} has no catalog entry`);
    }
    assert.equal(host(university.website), group.universityHost);
    assert.equal(university.countryCode, group.countryCode);
  }
});

test("a pending group never duplicates a verified program scope", () => {
  for (const group of pendingProgramGroups) {
    assert.equal(
      verifiedPrograms.some(
        (program) =>
          program.universityId === group.universityId &&
          program.category === group.category &&
          program.degreeLevel === group.degreeLevel &&
          program.intake === group.intake,
      ),
      false,
      `${group.id} is already verified; remove the pending entry`,
    );
  }
});

test("pending programs never produce a match, route or checklist", () => {
  const matches = matchPrograms(profile, verifiedPrograms, "2026-10-23");
  assert.ok(matches.length > 0);
  for (const group of pendingProgramGroups) {
    assert.equal(
      matches.some((match) => match.program.universityId === group.universityId),
      false,
    );
    assert.equal(findVerifiedProgram(group.id), null);
  }
});

test("pending groups cite official sources with a check date", () => {
  for (const group of pendingProgramGroups) {
    assert.ok(group.programs.length > 0);
    assert.ok(group.sources.length > 0);
    for (const source of group.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, "https:");
      assert.ok(
        url.hostname === group.universityHost ||
          url.hostname.endsWith("." + group.universityHost),
        `${source.url} is not on the university's own domain`,
      );
      assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    }
  }
});

test("Comenius computing programs are listed for the exact scope only", () => {
  const exact = findPendingProgramGroups({
    countryCode: "SK",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
  });
  assert.deepEqual(
    exact.map((group) => group.id),
    ["uniba-fmfi-computing-bsc-2027"],
  );
  assert.deepEqual(
    findPendingProgramGroups({
      countryCode: "SK",
      category: "Computer Science",
      intake: "2028/29",
    }),
    [],
  );
  assert.deepEqual(
    findPendingProgramGroups({ countryCode: "SK", category: "Medicine" }),
    [],
  );
});
