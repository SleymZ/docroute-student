import assert from "node:assert/strict";
import { test } from "node:test";

import { verifiedPrograms } from "../src/data/verified-programs";
import { buildRoutePreview } from "../src/lib/build-route-preview";
import { matchProgram } from "../src/lib/match-programs";
import {
  findResidenceStatusConflict,
  isEuEeaSwissCitizen,
} from "../src/lib/profile-options";
import type { ApplicantProfile } from "../src/types/admission";

const program = verifiedPrograms[0];
const today = "2026-10-19";

function residenceStage(patch: Partial<ApplicantProfile>) {
  const applicant: ApplicantProfile = {
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
      { code: "sk", level: "B1", willingToStudyIn: true, proof: "uniza-test" },
    ],
    waiverEvidence: [],
    ...patch,
  };
  const route = buildRoutePreview(
    applicant,
    matchProgram(applicant, program, today),
  );
  assert.ok(route);
  return route.stages.find((stage) => stage.id === "residence")!;
}

const thirdCountryTaskIds = ["criminal-record", "residence-form-passport"];

function usesThirdCountryChecklist(stage: ReturnType<typeof residenceStage>) {
  return thirdCountryTaskIds.some((id) =>
    stage.tasks.some((task) => task.id === id),
  );
}

for (const code of ["NO", "IS", "LI", "CH", "DE", "GR"]) {
  test(`${code} citizens never receive the third-country residence checklist`, () => {
    assert.ok(isEuEeaSwissCitizen(code));
    for (const status of [
      "eu-eea-swiss-passport",
      "destination-residence",
      "other",
    ] as const) {
      const stage = residenceStage({
        citizenshipCountryCode: code,
        currentResidenceStatus: status,
      });
      assert.equal(usesThirdCountryChecklist(stage), false, status);
      assert.ok(stage.tasks.some((task) => task.id === "eu-route-pending"));
    }
  });
}

test("Slovak citizens keep the not-applicable residence stage", () => {
  const stage = residenceStage({
    citizenshipCountryCode: "SK",
    currentResidenceStatus: "eu-eea-swiss-passport",
  });
  assert.equal(stage.tasks[0].id, "slovak-citizen-residence");
});

test("an EU passport status does not turn a third-country citizen into an EU citizen", () => {
  const stage = residenceStage({
    citizenshipCountryCode: "UA",
    currentResidenceStatus: "eu-eea-swiss-passport",
  });
  assert.equal(usesThirdCountryChecklist(stage), false);
  assert.ok(!stage.tasks.some((task) => task.id === "eu-route-pending"));
  assert.equal(stage.tasks[0].id, "residence-status-conflict");
  assert.equal(stage.tasks[0].status, "attention");
});

test("an EU citizen reporting a non-EU passport is asked to clarify", () => {
  const stage = residenceStage({
    citizenshipCountryCode: "PL",
    currentResidenceStatus: "non-eu-passport-no-residence",
  });
  assert.equal(stage.tasks[0].id, "residence-status-conflict");
});

test("third-country citizens without contradictions keep their checklist", () => {
  for (const status of [
    "non-eu-passport-no-residence",
    "destination-residence",
    "other-eu-residence",
    "destination-national-visa",
    "visa-free-entry",
    "temporary-protection",
    "other",
  ] as const) {
    const stage = residenceStage({
      citizenshipCountryCode: "IL",
      currentResidenceStatus: status,
    });
    assert.ok(usesThirdCountryChecklist(stage), status);
  }
});

test("only clear contradictions are reported", () => {
  assert.equal(findResidenceStatusConflict("ZZ", "eu-eea-swiss-passport"), null);
  assert.equal(findResidenceStatusConflict("", "eu-eea-swiss-passport"), null);
  assert.equal(findResidenceStatusConflict("CZ", "destination-residence"), null);
  assert.equal(findResidenceStatusConflict("IN", "other-eu-residence"), null);
  assert.ok(findResidenceStatusConflict("IN", "eu-eea-swiss-passport"));
  assert.ok(findResidenceStatusConflict("CH", "non-eu-passport-no-residence"));
});
