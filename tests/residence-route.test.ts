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

const baseApplicant: ApplicantProfile = {
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
};

function residenceStage(patch: Partial<ApplicantProfile>) {
  const applicant: ApplicantProfile = { ...baseApplicant, ...patch };
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
      assert.ok(stage.tasks.some((task) => task.id === "eu-registration"));
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
  assert.ok(!stage.tasks.some((task) => task.id === "eu-registration"));
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

test("third-country student residence uses the rechecked 2026 details", () => {
  const stage = residenceStage({
    citizenshipCountryCode: "IL",
    currentResidenceStatus: "non-eu-passport-no-residence",
  });
  const task = (id: string) => stage.tasks.find((item) => item.id === id);

  assert.match(task("criminal-record")!.description, /EU member state that shares conviction data/);
  assert.match(task("authentication-translation")!.description, /confirmed by a Slovak embassy or consulate/);
  assert.match(task("post-card-duties")!.description, /medical report no older than 30 days/);
  assert.match(task("student-residence-limits")!.description, /up to 6 years/);
  assert.match(task("student-residence-limits")!.description, /80 hours per month/);
  assert.ok(!stage.tasks.some((item) => item.sourceIds.includes("sk-ministry-foreigners-agenda")));
});

const taskIds = (stage: ReturnType<typeof residenceStage>) =>
  stage.tasks.map((task) => task.id);

test("EU, EEA and Swiss students get the verified registration steps", () => {
  const stage = residenceStage({
    citizenshipCountryCode: "DE",
    currentResidenceStatus: "eu-eea-swiss-passport",
  });
  assert.deepEqual(taskIds(stage), [
    "eu-notice-of-stay",
    "eu-registration",
    "eu-registration-documents",
    "eu-residence-card",
    "eu-after-registration",
  ]);
  const task = (id: string) => stage.tasks.find((item) => item.id === id)!;
  assert.match(task("eu-notice-of-stay").description, /10 working days/);
  assert.match(task("eu-registration").description, /30 days after the first 3 months/);
  assert.match(task("eu-registration").description, /free/);
  assert.match(task("eu-registration-documents").description, /confirmation of study/);
  assert.match(task("eu-residence-card").description, /€10 .*€39/);
  assert.ok(stage.tasks.every((item) => item.sourceIds.includes("iom-eu-citizens")));
});

test("a holder of Slovak residence for study reports the new studies", () => {
  const stage = residenceStage({
    citizenshipCountryCode: "UA",
    currentResidenceStatus: "destination-study-residence",
  });
  assert.equal(usesThirdCountryChecklist(stage), false);
  assert.deepEqual(taskIds(stage).slice(0, 3), [
    "resident-report-school-change",
    "resident-study-gap",
    "resident-renewal",
  ]);
  assert.match(stage.tasks[1].description, /3 working days/);
  assert.match(stage.tasks[2].description, /last day of its validity/);
});

test("other-purpose Slovak residence becomes a change of purpose", () => {
  const stage = residenceStage({
    citizenshipCountryCode: "UA",
    currentResidenceStatus: "destination-residence",
  });
  const ids = taskIds(stage);
  assert.equal(ids[0], "change-of-purpose-check");
  assert.equal(stage.tasks[0].status, "attention");
  assert.ok(ids.includes("residence-form-passport"));
  assert.ok(ids.includes("change-of-purpose-documents"));
  assert.ok(!ids.includes("criminal-record"));
  assert.match(stage.timing, /last day of your current permit/);
});

test("permanent residents get no new residence application", () => {
  const stage = residenceStage({
    citizenshipCountryCode: "UA",
    currentResidenceStatus: "destination-permanent-residence",
  });
  assert.equal(usesThirdCountryChecklist(stage), false);
  assert.equal(stage.tasks[0].id, "permanent-resident-purpose");
  assert.equal(stage.tasks[0].status, "attention");
});

test("every residence task cites a source listed on the route", () => {
  for (const patch of [
    { citizenshipCountryCode: "DE", currentResidenceStatus: "eu-eea-swiss-passport" },
    { citizenshipCountryCode: "UA", currentResidenceStatus: "destination-study-residence" },
    { citizenshipCountryCode: "UA", currentResidenceStatus: "destination-residence" },
    { citizenshipCountryCode: "UA", currentResidenceStatus: "destination-permanent-residence" },
    { citizenshipCountryCode: "UA", currentResidenceStatus: "non-eu-passport-no-residence" },
  ] as const) {
    const applicant = { ...baseApplicant, ...patch };
    const route = buildRoutePreview(applicant, matchProgram(applicant, program, today));
    assert.ok(route);
    const known = new Set(route.sources.map((source) => source.id));
    for (const stage of route.stages) {
      for (const task of stage.tasks) {
        for (const id of task.sourceIds) assert.ok(known.has(id), `${patch.currentResidenceStatus}: ${id}`);
      }
    }
  }
});
