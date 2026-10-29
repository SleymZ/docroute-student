import assert from "node:assert/strict";
import { test } from "node:test";

import { verifiedPrograms } from "../src/data/verified-programs";
import { buildRoutePreview } from "../src/lib/build-route-preview";
import { matchProgram, matchPrograms } from "../src/lib/match-programs";
import type { ApplicantProfile } from "../src/types/admission";

const program = verifiedPrograms.find((item) => item.id === "cuni-mff-informatics-bsc-2027")!;
const today = "2026-10-28";

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
    languages: [{ code: "cs", level: "B2", willingToStudyIn: true, proof: "none" }],
    waiverEvidence: [],
    ...patch,
  };
}

const check = (p: ApplicantProfile, id: string) =>
  matchProgram(p, program, today).checks.find((item) => item.id === id)!;

test("only Czech programmes match a Czech profile, and never a Slovak one", () => {
  assert.deepEqual(
    matchPrograms(profile(), verifiedPrograms, today).map((item) => item.program.id).sort(),
    ["cuni-mff-informatics-bsc-2027", "cvut-fit-informatics-bsc-2027"],
  );
  assert.ok(
    matchPrograms(profile({ destinationCountryCode: "SK" }), verifiedPrograms, today).every(
      (item) => item.program.countryCode === "SK",
    ),
  );
});

test("a Slovak maturita covers Czech and is automatically equivalent", () => {
  const p = profile();
  assert.equal(check(p, "language").status, "met");
  assert.equal(check(p, "recognition").status, "met");
  const ids = matchProgram(p, program, today).requiredDocuments.map((item) => item.id);
  assert.ok(!ids.includes("mff-czech-proof"));
  assert.ok(!ids.includes("mff-foreign-recognition"));
  assert.ok(ids.includes("mff-exam"));
});

test("a Ukrainian school needs Czech proof and recognition", () => {
  const weak = profile({
    educationCountryCode: "UA",
    gradeScale: "other",
    languages: [{ code: "cs", level: "B1", willingToStudyIn: true, proof: "none" }],
  });
  assert.equal(check(weak, "language").status, "missing");
  assert.equal(check(weak, "recognition").status, "action");
  assert.equal(matchProgram(weak, program, today).status, "preparation-required");
  const ids = matchProgram(weak, program, today).requiredDocuments.map((item) => item.id);
  assert.ok(ids.includes("mff-czech-proof"));
  assert.ok(ids.includes("mff-foreign-recognition"));
});

test("waivers follow the MFF grounds, not the UNIZA ones", () => {
  const sk75 = matchProgram(profile({ waiverEvidence: ["sk-matura-math-75"] }), program, today);
  assert.equal(sk75.entranceRoute, "waived");
  assert.ok(sk75.requiredDocuments.some((item) => item.id === "mff-waiver-request"));
  assert.ok(!sk75.requiredDocuments.some((item) => item.id === "mff-exam"));

  // Earlier graduates: the year cannot be confirmed.
  assert.equal(
    matchProgram(profile({ educationStatus: "completed", waiverEvidence: ["sk-matura-math-75"] }), program, today).entranceRoute,
    "needs-information",
  );
  // A Czech-maturita ground claimed with a Slovak school.
  assert.equal(
    matchProgram(profile({ waiverEvidence: ["cz-matura-math-plus-68"] }), program, today).entranceRoute,
    "needs-information",
  );
  assert.equal(matchProgram(profile({ waiverEvidence: ["mff-olympiad"] }), program, today).entranceRoute, "waived");
  // UNIZA evidence does not waive the MFF exam.
  assert.equal(
    matchProgram(profile({ waiverEvidence: ["math-matura-60", "scio-math-60", "ccna"] }), program, today).entranceRoute,
    "exam",
  );
  assert.match(check(profile(), "entrance-route").detail, /at least 40 of 100 points/);
});

test("the deadline closes the programme after 31 March 2027", () => {
  assert.equal(matchProgram(profile(), program, "2027-04-01").status, "unavailable");
});

test("the route uses the Czech residence stages and Czech sources", () => {
  const p = profile({ currentResidenceStatus: "non-eu-passport-no-residence" });
  const route = buildRoutePreview(p, matchProgram(p, program, today));
  assert.ok(route);
  const ids = route.stages.flatMap((stage) => stage.tasks.map((task) => task.id));
  assert.ok(ids.includes("cz-study-funds"));
  assert.ok(ids.includes("cz-register-arrival"));
  assert.ok(!ids.includes("criminal-record"));
  assert.ok(!route.stages.some((stage) => stage.id === "admission"));
  const known = new Set(route.sources.map((source) => source.id));
  for (const id of ids.length ? route.stages.flatMap((stage) => stage.tasks.flatMap((task) => task.sourceIds)) : []) {
    assert.ok(known.has(id), id);
  }
  assert.ok(!route.sources.some((source) => source.id.startsWith("iom-")));
});
