import assert from "node:assert/strict";
import { test } from "node:test";

import { findVerifiedProgram, verifiedPrograms } from "../src/data/verified-programs";
import { buildRoutePreview } from "../src/lib/build-route-preview";
import { matchProgram } from "../src/lib/match-programs";
import { formatProgramDegree } from "../src/lib/profile-options";
import type { ApplicantProfile } from "../src/types/admission";

const today = "2026-11-05";

function profile(patch: Partial<ApplicantProfile> = {}): ApplicantProfile {
  return {
    destinationCountryCode: "SK",
    studyCategory: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    citizenshipCountryCode: "UA",
    educationCountryCode: "UA",
    currentResidenceStatus: "non-eu-passport-no-residence",
    educationStatus: "final-year",
    gradeScale: "other",
    languages: [{ code: "sk", level: "B2", willingToStudyIn: true, proof: "certificate" }],
    waiverEvidence: [],
    ...patch,
  };
}

const generic = verifiedPrograms.filter((program) => program.admissionPolicy === "generic-2027");

test("14 programmes at 8 faculties verified on 2026-11-05 use the shared policy with their own dates", () => {
  assert.equal(generic.length, 14);
  assert.equal(new Set(generic.map((program) => program.faculty + program.universityId)).size, 8);
  for (const program of generic) {
    assert.ok(program.genericRules, program.id);
    assert.equal(program.intake, "2027/28");
    assert.ok(program.application.deadline > today, `${program.id}: deadline must be ahead`);
    assert.ok(program.application.admissionDate >= program.application.deadline || program.application.admissionDate > today, program.id);
    assert.ok(["SK", "CZ"].includes(program.countryCode), "residence routes exist only for SK and CZ");
    for (const source of program.sources) assert.match(source.checkedAt, /^2026-1[01]-\d{2}$/);
  }
});

test("FIIT: a Ukrainian school needs Slovak B2 and recognition; a Slovak school does not", () => {
  const fiit = findVerifiedProgram("stu-fiit-informatika-bsc-2027")!;
  const foreign = matchProgram(profile(), fiit, today);
  assert.equal(foreign.canBuildRoute, true);
  assert.equal(foreign.checks.find((item) => item.id === "language")!.status, "action");
  const ids = foreign.requiredDocuments.map((item) => item.id);
  assert.ok(ids.includes("fiit-slovak-b2") && ids.includes("fiit-foreign-school") && ids.includes("fiit-maturita-2027"));
  assert.ok(buildRoutePreview(profile(), foreign));

  const noSlovak = matchProgram(profile({ languages: [{ code: "sk", level: "A2", willingToStudyIn: true, proof: "none" }] }), fiit, today);
  assert.equal(noSlovak.checks.find((item) => item.id === "language")!.status, "missing");
  assert.equal(noSlovak.status, "preparation-required");

  const local = matchProgram(profile({ educationCountryCode: "SK", citizenshipCountryCode: "SK" }), fiit, today);
  const localIds = local.requiredDocuments.map((item) => item.id);
  assert.equal(local.checks.find((item) => item.id === "recognition")!.status, "met");
  assert.ok(!localIds.includes("fiit-slovak-b2") && !localIds.includes("fiit-foreign-school"));
});

test("a page without a language rule asks the applicant to confirm it", () => {
  const fi = findVerifiedProgram("muni-fi-informatika-bsc-2027")!;
  const result = matchProgram(
    profile({ destinationCountryCode: "CZ", languages: [{ code: "cs", level: "B2", willingToStudyIn: true, proof: "none" }] }),
    fi,
    today,
  );
  assert.equal(result.checks.find((item) => item.id === "language")!.status, "unknown");
  assert.equal(result.status, "more-information");
});

test("JLF: Czech citizens need no Slovak proof; medicine and law are long-cycle, never 'bachelor'", () => {
  const jlf = findVerifiedProgram("uniba-jlf-medicine-2027-sk")!;
  const czech = matchProgram(
    profile({ studyCategory: "Medicine", citizenshipCountryCode: "CZ", educationCountryCode: "CZ", languages: [{ code: "sk", level: "B1", willingToStudyIn: true, proof: "none" }] }),
    jlf,
    today,
  );
  assert.equal(czech.checks.find((item) => item.id === "language")!.status, "met");
  assert.equal(formatProgramDegree(jlf), "Long-cycle master's (6 years)");
  assert.equal(formatProgramDegree(findVerifiedProgram("cuni-prf-law-mgr-2027")!), "Long-cycle master's (5 years)");
  assert.equal(formatProgramDegree(findVerifiedProgram("vut-fit-it-bsc-2027")!), "Bachelor's");
});

test("past deadlines close the generic route like any other", () => {
  const fi = findVerifiedProgram("muni-fi-informatika-bsc-2027")!;
  const late = matchProgram(profile({ destinationCountryCode: "CZ" }), fi, "2027-03-01");
  assert.equal(late.canBuildRoute, false);
});
