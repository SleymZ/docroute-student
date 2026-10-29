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

test("Slovak computing faculties are listed for the exact scope only", () => {
  const exact = findPendingProgramGroups({
    countryCode: "SK",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
  });
  assert.deepEqual(
    exact.map((group) => group.id),
    [
      "uniba-fmfi-computing-bsc-2027",
      "stu-fiit-computing-bsc-2027",
      "tuke-fei-computing-bsc-2027",
    ],
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

test("last year's rules are an earlier intake, sourced and name real programs", () => {
  for (const group of pendingProgramGroups) {
    const previous = group.previousCycle;
    if (!previous) continue;
    const startYear = (intake: string) => Number(intake.slice(0, 4));
    assert.match(previous.intake, /^\d{4}\/\d{2}$/);
    assert.ok(
      startYear(previous.intake) < startYear(group.intake),
      `${group.id}: previous cycle must be earlier than ${group.intake}`,
    );
    assert.ok(previous.facts.length > 0);
    assert.ok(previous.sources.length > 0);
    assert.match(previous.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    for (const source of previous.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, "https:");
      assert.ok(
        url.hostname === group.universityHost ||
          url.hostname.endsWith("." + group.universityHost),
        `${source.url} is not on the university's own domain`,
      );
    }
    const names = new Set(group.programs.map((program) => program.localProgramName));
    for (const item of previous.programRules) {
      assert.ok(names.has(item.localProgramName), `${item.localProgramName} is not in ${group.id}`);
    }
  }
});

test("Comenius FMFI shows its approved 2026/27 rules for orientation", () => {
  const [group] = findPendingProgramGroups({ universityHost: "uniba.sk" });
  assert.equal(group.previousCycle?.intake, "2026/27");
  assert.equal(group.previousCycle?.programRules.length, group.programs.length);
  const informatika = group.previousCycle?.programRules.find(
    (item) => item.localProgramName === "Informatika",
  );
  assert.match(informatika?.rule ?? "", /percentile 60\+/);
});

test("each group carries a known status and unique ids", () => {
  const ids = new Set<string>();
  for (const group of pendingProgramGroups) {
    assert.ok(["rules-awaiting-approval", "rules-not-published"].includes(group.status));
    assert.ok(!ids.has(group.id), `duplicate ${group.id}`);
    ids.add(group.id);
  }
});

test("last year's rules fill all three requirement cards", () => {
  for (const group of pendingProgramGroups) {
    const overview = group.previousCycle?.overview;
    if (!group.previousCycle) continue;
    assert.ok(overview, `${group.id} has no overview`);
    assert.ok(overview.applicationDocuments.length > 0);
    assert.ok(overview.entranceRequirements.length > 0);
    assert.ok(overview.afterAdmission.length > 0);
  }
});
