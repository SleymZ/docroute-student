import assert from "node:assert/strict";
import { test } from "node:test";

import { slovakiaWorkRules } from "../src/data/slovakia-work";
import {
  planWorkResidenceDeadlines,
  subtractWorkingDays,
} from "../src/lib/residence/deadlines";
import {
  buildSlovakiaWorkRoute,
  workProcessingDays,
} from "../src/lib/residence/slovakia-work";
import {
  createWorkProfileSearchParams,
  getWorkProgressId,
  parseWorkProfile,
  selectWorkRoute,
  type WorkProfile,
} from "../src/lib/work-profile";

function profile(patch: Partial<WorkProfile> = {}): WorkProfile {
  return {
    destinationCountryCode: "SK",
    citizenshipCountryCode: "UA",
    currentResidenceStatus: "non-eu-passport-no-residence",
    jobOffer: "yes",
    slovakGraduate: "no",
    blueCardConditions: "no",
    shortageOccupation: "no",
    ...patch,
  };
}

const allTaskIds = (p: WorkProfile) =>
  buildSlovakiaWorkRoute(p).stages.flatMap((stage) =>
    stage.tasks.map((task) => task.id),
  );

test("work profile survives a URL round trip", () => {
  const original = profile({ blueCardConditions: "unsure", shortageOccupation: "yes" });
  assert.deepEqual(
    parseWorkProfile(createWorkProfileSearchParams(original)),
    original,
  );
});

test("incomplete or foreign-destination answers are rejected", () => {
  const params = createWorkProfileSearchParams(profile());
  params.delete("offer");
  assert.equal(parseWorkProfile(params), null);

  const czech = createWorkProfileSearchParams(profile());
  czech.set("country", "CZ");
  assert.equal(parseWorkProfile(czech), null);

  const bad = createWorkProfileSearchParams(profile());
  bad.set("blueCard", "maybe");
  assert.equal(parseWorkProfile(bad), null);
});

test("route selection: graduate beats Blue Card beats single permit", () => {
  assert.equal(selectWorkRoute(profile()), "single-permit");
  assert.equal(selectWorkRoute(profile({ blueCardConditions: "unsure" })), "single-permit");
  assert.equal(selectWorkRoute(profile({ blueCardConditions: "yes" })), "blue-card");
  assert.equal(
    selectWorkRoute(profile({ blueCardConditions: "yes", slovakGraduate: "yes" })),
    "slovak-graduate",
  );
});

test("processing periods follow the published maximums", () => {
  assert.equal(workProcessingDays(profile()), 60);
  assert.equal(workProcessingDays(profile({ shortageOccupation: "unsure" })), 60);
  assert.equal(workProcessingDays(profile({ shortageOccupation: "yes" })), 30);
  assert.equal(workProcessingDays(profile({ blueCardConditions: "yes" })), 30);
  assert.equal(workProcessingDays(profile({ slovakGraduate: "yes" })), 90);
});

test("single permit route has the employer steps and no purpose document", () => {
  const ids = allTaskIds(profile());
  for (const id of [
    "job-offer",
    "vacancy-report",
    "labour-office-confirmation",
    "confirmation-window",
    "residence-submission-place",
    "criminal-record",
    "accommodation",
    "residence-fees",
    "missing-documents",
    "post-card-duties",
    "unemployment-rules",
  ]) {
    assert.ok(ids.includes(id), id);
  }
  assert.ok(!ids.includes("employer-no-permit-confirmation"));
  assert.ok(!ids.includes("blue-card-alternative"));
});

test("an unsure Blue Card answer adds the alternative, not the Blue Card route", () => {
  const ids = allTaskIds(profile({ blueCardConditions: "unsure" }));
  assert.ok(ids.includes("blue-card-alternative"));
  assert.ok(ids.includes("vacancy-report"));
});

test("Slovak graduates skip the Labour Office", () => {
  const ids = allTaskIds(profile({ slovakGraduate: "yes" }));
  assert.ok(ids.includes("employer-no-permit-confirmation"));
  assert.ok(ids.includes("slovak-diploma-copy"));
  assert.ok(!ids.includes("vacancy-report"));
  assert.ok(!ids.includes("labour-office-confirmation"));
  assert.ok(!ids.includes("start-work"));
});

test("no job offer is flagged, not hidden", () => {
  const job = buildSlovakiaWorkRoute(profile({ jobOffer: "no" })).stages[0];
  assert.equal(job.tasks[0].status, "attention");
});

test("task ids are unique and every source id exists", () => {
  const sourceIds = new Set(slovakiaWorkRules.sources.map((source) => source.id));
  for (const p of [
    profile(),
    profile({ blueCardConditions: "yes" }),
    profile({ slovakGraduate: "yes" }),
    profile({ blueCardConditions: "unsure", currentResidenceStatus: "other" }),
  ]) {
    const route = buildSlovakiaWorkRoute(p);
    const ids = route.stages.flatMap((stage) => stage.tasks.map((task) => task.id));
    assert.equal(new Set(ids).size, ids.length);
    for (const task of route.stages.flatMap((stage) => stage.tasks)) {
      for (const id of task.sourceIds) assert.ok(sourceIds.has(id), `${task.id}: ${id}`);
    }
  }
});

test("Slovak, EU and contradictory profiles get no third-country checklist", () => {
  for (const p of [
    profile({ citizenshipCountryCode: "SK", currentResidenceStatus: "eu-eea-swiss-passport" }),
    profile({ citizenshipCountryCode: "DE", currentResidenceStatus: "eu-eea-swiss-passport" }),
    profile({ citizenshipCountryCode: "UA", currentResidenceStatus: "eu-eea-swiss-passport" }),
  ]) {
    const route = buildSlovakiaWorkRoute(p);
    assert.equal(route.authorisation, null);
    assert.equal(route.stages.length, 1);
    assert.ok(!route.stages[0].tasks.some((task) => task.id === "criminal-record"));
  }
  const slovak = buildSlovakiaWorkRoute(
    profile({ citizenshipCountryCode: "SK", currentResidenceStatus: "eu-eea-swiss-passport" }),
  );
  assert.match(slovak.stages[0].description, /work in Slovakia/);
  const eu = buildSlovakiaWorkRoute(
    profile({ citizenshipCountryCode: "DE", currentResidenceStatus: "eu-eea-swiss-passport" }),
  );
  const documents = eu.stages[0].tasks.find((task) => task.id === "eu-registration-documents");
  assert.match(documents!.description, /employment contract/);
  const known = new Set(eu.sources.map((source) => source.id));
  assert.ok(eu.stages[0].tasks.every((task) => task.sourceIds.every((id) => known.has(id))));
});

test("permanent residents are not sent through a work permit", () => {
  const route = buildSlovakiaWorkRoute(
    profile({ currentResidenceStatus: "destination-permanent-residence" }),
  );
  assert.equal(route.authorisation, null);
  assert.equal(route.stages[0].tasks[0].id, "permanent-resident-purpose");
  assert.equal(route.stages[0].tasks[0].status, "information");
});

test("progress namespace changes with answers that change the checklist", () => {
  assert.notEqual(
    getWorkProgressId(profile()),
    getWorkProgressId(profile({ blueCardConditions: "yes" })),
  );
  assert.equal(
    getWorkProgressId(profile({ blueCardConditions: "unsure" })),
    getWorkProgressId(profile({ blueCardConditions: "no" })),
  );
});

test("subtracting working days skips weekends", () => {
  // Monday 2027-03-01 minus 1 working day is Friday 2027-02-26.
  assert.equal(subtractWorkingDays("2027-03-01", 1), "2027-02-26");
  assert.equal(subtractWorkingDays("2027-03-05", 20), "2027-02-05");
});

const planBase = {
  today: "2026-10-23",
  filing: "abroad" as const,
  route: "single-permit" as const,
  processingDays: 60,
  hasJobOffer: true,
  shortageOccupation: "no" as const,
  vacancyReportWorkingDays: slovakiaWorkRules.vacancyReportWorkingDays,
  fileWithinDaysOfConfirmation: slovakiaWorkRules.fileWithinDaysOfConfirmation,
  documentMaxAgeDays: slovakiaWorkRules.documentMaxAgeDays,
  reportWorkingDays: slovakiaWorkRules.reportArrivalWorkingDays,
};

test("single-permit plan counts back from the start date", () => {
  const plan = planWorkResidenceDeadlines({ ...planBase, moveDate: "2027-05-03" });
  assert.ok(plan);
  assert.equal(plan.latestFilingDate, "2027-03-04");
  const byId = new Map(plan.items.map((item) => [item.id, item]));
  assert.equal(byId.get("vacancy-report")?.date, "2027-02-04");
  assert.equal(byId.get("criminal-record")?.date, "2026-12-04");
  assert.equal(byId.get("report-arrival")?.date, "2027-05-06");
  assert.deepEqual(plan.warnings, []);
});

test("shortage occupations and graduates have no 20-day vacancy step", () => {
  const shortage = planWorkResidenceDeadlines({
    ...planBase,
    moveDate: "2027-05-03",
    shortageOccupation: "yes",
    processingDays: 30,
  });
  assert.ok(shortage && !shortage.items.some((item) => item.id === "vacancy-report"));

  const graduate = planWorkResidenceDeadlines({
    ...planBase,
    moveDate: "2027-05-03",
    route: "slovak-graduate",
    processingDays: 90,
  });
  assert.ok(graduate);
  assert.ok(!graduate.items.some((item) => item.id === "labour-office-confirmation"));
});

test("plan warns about a late start, no job offer and unclear filing", () => {
  const plan = planWorkResidenceDeadlines({
    ...planBase,
    moveDate: "2026-11-15",
    hasJobOffer: false,
    filing: "unclear",
  });
  assert.ok(plan);
  assert.equal(plan.warnings.length, 3);
  assert.equal(
    planWorkResidenceDeadlines({ ...planBase, moveDate: "2026-10-23" }),
    null,
  );
});
