import assert from "node:assert/strict";
import { test } from "node:test";

import { findPendingProgramGroups } from "../src/data/pending-programs";
import { verifiedPrograms } from "../src/data/verified-programs";
import { buildRoutePreview } from "../src/lib/build-route-preview";
import { matchProgram, matchPrograms } from "../src/lib/match-programs";
import type { ApplicantProfile } from "../src/types/admission";

const program = verifiedPrograms.find((item) => item.id === "cvut-fit-informatics-bsc-2027")!;
const today = "2026-10-29";

function profile(patch: Partial<ApplicantProfile> = {}): ApplicantProfile {
  return {
    destinationCountryCode: "CZ",
    studyCategory: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    citizenshipCountryCode: "UA",
    educationCountryCode: "SK",
    currentResidenceStatus: "other-eu-residence",
    educationStatus: "final-year",
    gradeScale: "slovak-1-5",
    languages: [{ code: "cs", level: "B1", willingToStudyIn: true, proof: "none" }],
    waiverEvidence: [],
    ...patch,
  };
}

const run = (p: ApplicantProfile) => matchProgram(p, program, today);
const check = (p: ApplicantProfile, id: string) => run(p).checks.find((item) => item.id === id)!;
const docs = (p: ApplicantProfile) => run(p).requiredDocuments.map((item) => item.id);

test("ČVUT FIT is verified with its own policy and no longer pending", () => {
  assert.ok(program);
  assert.equal(program.admissionPolicy, "cvut-fit-bachelor-2027");
  assert.equal(program.application.deadline, "2027-03-31");
  assert.equal(program.application.feeLabel, "CZK 1,050");
  assert.ok(program.sources.every((source) => new URL(source.url).hostname.endsWith("cvut.cz")));
  assert.ok(
    !findPendingProgramGroups({ countryCode: "CZ", category: "Computer Science" }).some(
      (group) => group.universityId === program.universityId,
    ),
  );
  const ids = matchPrograms(profile(), verifiedPrograms, today).map((item) => item.program.id);
  assert.deepEqual(ids.sort(), ["cuni-mff-informatics-bsc-2027", "cvut-fit-informatics-bsc-2027"]);
});

test("a Slovak school covers Czech and needs no nostrifikace", () => {
  const p = profile();
  assert.equal(check(p, "language").status, "met");
  assert.equal(check(p, "recognition").status, "met");
  assert.ok(!docs(p).includes("cvut-czech-proof"));
  assert.ok(!docs(p).includes("cvut-foreign-recognition"));
  assert.ok(docs(p).includes("cvut-exam"));
  assert.equal(run(p).entranceRoute, "exam");
  assert.equal(run(p).canBuildRoute, true);
});

test("a Ukrainian school needs Czech B2 and recognition, unless OSP 90 covers Czech", () => {
  const ua = profile({ educationCountryCode: "UA", gradeScale: "other" });
  assert.equal(check(ua, "language").status, "missing");
  assert.equal(check(ua, "recognition").status, "action");
  assert.equal(run(ua).status, "preparation-required");
  assert.ok(docs(ua).includes("cvut-czech-proof"));
  assert.ok(docs(ua).includes("cvut-foreign-recognition"));

  const osp = profile({ educationCountryCode: "UA", gradeScale: "other", waiverEvidence: ["scio-osp-90"] });
  assert.equal(check(osp, "language").status, "met");
  assert.equal(run(osp).entranceRoute, "waived");
  assert.ok(!docs(osp).includes("cvut-czech-proof"));
  assert.ok(docs(osp).includes("cvut-foreign-recognition"));

  // A Slovak citizen with a foreign school: no Czech proof, still recognition.
  const skCitizen = profile({ citizenshipCountryCode: "SK", educationCountryCode: "UA" });
  assert.equal(check(skCitizen, "language").status, "met");
  assert.equal(check(skCitizen, "recognition").status, "action");
});

test("waivers follow the ČVUT grounds, not the MFF or UNIZA ones", () => {
  for (const ground of ["scio-math-90", "mensa-130", "cvut-fiks", "cvut-national-competition"] as const) {
    const p = profile({ waiverEvidence: [ground] });
    assert.equal(run(p).entranceRoute, "waived", ground);
    assert.ok(docs(p).includes("cvut-waiver-request"));
    assert.ok(!docs(p).includes("cvut-exam"));
  }
  // MFF's Slovak 75% maturita ground and UNIZA's SCIO 60 do not waive ČVUT's test.
  for (const ground of ["sk-matura-math-75", "scio-math-60", "math-matura-60", "mff-olympiad"] as const) {
    assert.equal(run(profile({ waiverEvidence: [ground] })).entranceRoute, "exam", ground);
  }
  // CERMAT needs a Czech maturita in 2025/26 or 2026/27.
  assert.equal(
    run(profile({ educationCountryCode: "CZ", waiverEvidence: ["cvut-cermat-math-75"] })).entranceRoute,
    "waived",
  );
  assert.equal(run(profile({ waiverEvidence: ["cvut-cermat-math-75"] })).entranceRoute, "needs-information");
  assert.equal(
    run(profile({ educationCountryCode: "CZ", educationStatus: "completed", waiverEvidence: ["cvut-cermat-math-75"] }))
      .entranceRoute,
    "needs-information",
  );
});

test("Russian and Belarusian citizens are told about special conditions", () => {
  assert.equal(check(profile({ citizenshipCountryCode: "RU" }), "citizenship-rules").status, "action");
  assert.equal(check(profile(), "citizenship-rules"), undefined);
});

test("the ČVUT route uses its own dates and the Czech residence stage", () => {
  const match = run(profile());
  assert.ok(match.nextActions.some((action) => action.includes("1–2 June 2027")));
  assert.ok(match.nextActions.some((action) => action.includes("31 March 2027")));
  const route = buildRoutePreview(profile(), match);
  assert.ok(route);
  const text = JSON.stringify(route);
  assert.ok(!text.includes("UNIZA"));
  assert.ok(!text.includes("MFF"));
});

test("the policy never applies to another country, degree or intake", () => {
  const moved = { ...program, intake: "2028/29" as const };
  assert.equal(matchProgram(profile({ intake: "2028/29" }), moved, today).canBuildRoute, false);
  assert.equal(
    matchProgram(profile(), { ...program, countryCode: "SK" }, today).canBuildRoute,
    false,
  );
});
