import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createCzechProfileSearchParams,
  parseCzechProfile,
  selectCzechWorkProcedure,
  type CzechProfile,
} from "../src/lib/czechia-profile";
import { buildCzechiaRoute, planCzechiaDeadlines } from "../src/lib/residence/czechia";

function study(patch: Partial<CzechProfile> = {}): CzechProfile {
  return {
    destinationCountryCode: "CZ",
    purpose: "study",
    citizenshipCountryCode: "UA",
    currentResidenceStatus: "non-eu-passport-no-residence",
    ...patch,
  };
}

function work(patch: Partial<CzechProfile> = {}): CzechProfile {
  return {
    ...study({ purpose: "work" }),
    jobOffer: "yes",
    czechGraduate: "no",
    blueCardConditions: "no",
    ...patch,
  };
}

const ids = (profile: CzechProfile) =>
  buildCzechiaRoute(profile).stages.flatMap((stage) => stage.tasks.map((task) => task.id));

test("Czech profiles survive a URL round trip", () => {
  for (const profile of [study(), work({ blueCardConditions: "unsure" })]) {
    assert.deepEqual(parseCzechProfile(createCzechProfileSearchParams(profile)), profile);
  }
  assert.equal(parseCzechProfile(new URLSearchParams("country=SK&purpose=study")), null);
  assert.equal(parseCzechProfile(new URLSearchParams("country=CZ&purpose=work&citizenship=UA&residenceStatus=other")), null);
});

test("study from abroad uses the long-term residence permit checklist", () => {
  const route = buildCzechiaRoute(study());
  assert.equal(route.procedure, "study");
  assert.equal(route.filing, "abroad");
  assert.equal(route.processingDays, 60);
  const taskIds = ids(study());
  for (const id of ["cz-confirmation-of-studies", "cz-submission-place", "cz-study-funds", "cz-criminal-record", "cz-formal", "cz-insurance", "cz-fee", "cz-register-arrival", "cz-collect-card"]) {
    assert.ok(taskIds.includes(id), id);
  }
  const funds = route.stages.flatMap((stage) => stage.tasks).find((task) => task.id === "cz-study-funds")!;
  assert.match(funds.description, /CZK 78,250 for one semester or CZK 115,810 for a year/);
});

test("a Czech study permit holder gets the extension, not a new application", () => {
  const route = buildCzechiaRoute(study({ currentResidenceStatus: "destination-study-residence" }));
  assert.equal(route.procedure, "study-extension");
  const taskIds = ids(study({ currentResidenceStatus: "destination-study-residence" }));
  assert.ok(taskIds.includes("cz-extension-window"));
  assert.ok(!taskIds.includes("cz-criminal-record"));
  assert.equal(planCzechiaDeadlines(route, "2027-09-01", "2026-10-28"), null);
});

test("EU, Czech, permanent and contradictory profiles skip the permit checklist", () => {
  const eu = buildCzechiaRoute(study({ citizenshipCountryCode: "SK", currentResidenceStatus: "eu-eea-swiss-passport" }));
  assert.equal(eu.procedure, null);
  assert.equal(eu.stages[0].tasks[0].id, "cz-eu-report-stay");
  assert.match(eu.stages[0].tasks[1].description, /CZK 200/);
  assert.equal(buildCzechiaRoute(work({ citizenshipCountryCode: "CZ" })).stages[0].tasks[0].id, "cz-citizen");
  const permanent = buildCzechiaRoute(work({ currentResidenceStatus: "destination-permanent-residence" }));
  assert.equal(permanent.stages[0].tasks[0].status, "information");
  const conflict = buildCzechiaRoute(study({ currentResidenceStatus: "eu-eea-swiss-passport" }));
  assert.equal(conflict.stages[0].tasks[0].id, "residence-status-conflict");
});

test("work procedure: graduates, Blue Card and employee card", () => {
  assert.equal(selectCzechWorkProcedure(work()), "employee-card");
  assert.equal(selectCzechWorkProcedure(work({ blueCardConditions: "yes" })), "blue-card");
  assert.equal(selectCzechWorkProcedure(work({ czechGraduate: "yes", blueCardConditions: "yes" })), "free-access");

  assert.ok(ids(work()).includes("cz-vacancy-number"));
  assert.ok(ids(work()).includes("cz-start-work"));
  const graduate = ids(work({ czechGraduate: "yes" }));
  assert.ok(graduate.includes("cz-free-access-proof"));
  assert.ok(!graduate.includes("cz-vacancy-number"));
  assert.ok(!graduate.includes("cz-start-work"));
  assert.equal(buildCzechiaRoute(work({ blueCardConditions: "yes" })).processingDays, 90);
  assert.ok(ids(work({ blueCardConditions: "unsure" })).includes("cz-blue-card-unsure"));
  const noOffer = buildCzechiaRoute(work({ jobOffer: "no" }));
  assert.equal(noOffer.stages[0].tasks[0].status, "attention");
});

test("the Czech planner dates filing, documents and registration", () => {
  const route = buildCzechiaRoute(study());
  const plan = planCzechiaDeadlines(route, "2027-09-15", "2026-10-28");
  assert.ok(plan);
  assert.equal(plan.latestFilingDate, "2027-07-17");
  const item = (id: string) => plan.items.find((entry) => entry.id === id)!;
  assert.equal(item("documents").date, "2027-01-18");
  assert.equal(item("register-arrival").date, "2027-10-15");
  assert.equal(plan.warnings.length, 0);

  const late = planCzechiaDeadlines(buildCzechiaRoute(work({ blueCardConditions: "yes" })), "2026-12-01", "2026-10-28");
  assert.ok(late && late.warnings.some((warning) => /would have had to apply/.test(warning)));
});

test("every Czech task cites a listed source", () => {
  for (const profile of [
    study(),
    study({ currentResidenceStatus: "destination-residence" }),
    study({ currentResidenceStatus: "destination-study-residence" }),
    study({ citizenshipCountryCode: "DE", currentResidenceStatus: "eu-eea-swiss-passport" }),
    work(),
    work({ czechGraduate: "yes" }),
    work({ blueCardConditions: "yes", currentResidenceStatus: "destination-residence" }),
  ]) {
    const route = buildCzechiaRoute(profile);
    const known = new Set(route.sources.map((source) => source.id));
    for (const task of route.stages.flatMap((stage) => stage.tasks)) {
      for (const id of task.sourceIds) assert.ok(known.has(id), `${task.id}: ${id}`);
    }
  }
});

const skStudent = (patch: Partial<CzechProfile> = {}) =>
  study({
    currentResidenceStatus: "other-eu-residence",
    euPermitPurpose: "study",
    euPermitIssuer: "eu",
    exchangeProgramme: "no",
    ...patch,
  });

test("EU permit answers survive a URL round trip and old links still parse", () => {
  for (const profile of [skStudent(), skStudent({ exchangeProgramme: "unsure" }), study({ currentResidenceStatus: "other-eu-residence", euPermitPurpose: "other", euPermitIssuer: "excluded" })]) {
    assert.deepEqual(parseCzechProfile(createCzechProfileSearchParams(profile)), profile);
  }
  const old = parseCzechProfile(new URLSearchParams("country=CZ&purpose=study&citizenship=UA&residenceStatus=other-eu-residence"));
  assert.ok(old);
  assert.equal(buildCzechiaRoute(old).filing, "unclear");
  // Answers are ignored for other statuses.
  const noise = parseCzechProfile(new URLSearchParams("country=CZ&purpose=study&citizenship=UA&residenceStatus=non-eu-passport-no-residence&euPermit=study&euIssuer=eu"));
  assert.equal(noise?.euPermitPurpose, undefined);
});

test("a Slovak study permit holder files in Czechia with first-application documents", () => {
  const route = buildCzechiaRoute(skStudent());
  assert.equal(route.filing, "in-country");
  assert.equal(route.euStudyHolder, true);
  const tasks = route.stages.flatMap((stage) => stage.tasks);
  const submission = tasks.find((task) => task.id === "cz-submission-place");
  assert.match(submission?.title ?? "", /Ministry of the Interior office in Czechia/);
  assert.match(submission?.description ?? "", /Ireland and Denmark/);
  const list = tasks.map((task) => task.id);
  assert.ok(list.includes("cz-criminal-record"));
  assert.ok(list.includes("cz-eu-holder-stay"));
  assert.ok(list.includes("cz-leave-permit-country"));
  assert.ok(!list.includes("cz-study-mobility"));
  assert.ok(route.sources.some((source) => source.id === "cz-ipc-study-mobility"));

  const plan = planCzechiaDeadlines(route, "2027-09-01", "2026-10-28");
  assert.ok(plan?.items.some((item) => item.id === "documents"));
  assert.ok(plan?.warnings.some((warning) => /90 days in any 180/.test(warning)));
});

test("exchange students see the one-year mobility option", () => {
  assert.ok(ids(skStudent({ exchangeProgramme: "yes" })).includes("cz-study-mobility"));
  assert.ok(ids(skStudent({ exchangeProgramme: "unsure" })).includes("cz-study-mobility"));
});

test("other EU permits go to the embassy", () => {
  for (const profile of [
    skStudent({ euPermitPurpose: "other", exchangeProgramme: undefined }),
    skStudent({ euPermitIssuer: "excluded" }),
  ]) {
    const route = buildCzechiaRoute(profile);
    assert.equal(route.filing, "abroad");
    assert.equal(route.euStudyHolder, false);
    assert.ok(ids(profile).includes("cz-eu-permit-no-exception"));
  }
});
