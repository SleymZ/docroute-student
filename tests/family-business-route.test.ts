import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { movePurposes } from "../src/data/move-purposes";
import { slovakiaFamilyBusinessRules as rules } from "../src/data/slovakia-family-business";
import { planPurposeResidenceDeadlines } from "../src/lib/residence/deadlines";
import {
  buildSlovakiaBusinessRoute,
  buildSlovakiaFamilyRoute,
  createBusinessProfileSearchParams,
  createFamilyProfileSearchParams,
  parseBusinessProfile,
  parseFamilyProfile,
  type BusinessProfile,
  type FamilyProfile,
} from "../src/lib/residence/slovakia-family-business";
import { waitlistRoutes } from "../src/lib/waitlist";

const family = (patch: Partial<FamilyProfile> = {}): FamilyProfile => ({
  destinationCountryCode: "SK",
  citizenshipCountryCode: "UA",
  currentResidenceStatus: "non-eu-passport-no-residence",
  sponsor: "temporary-residence",
  relation: "spouse",
  bothAdults: "yes",
  ...patch,
});

const business = (patch: Partial<BusinessProfile> = {}): BusinessProfile => ({
  destinationCountryCode: "SK",
  citizenshipCountryCode: "UA",
  currentResidenceStatus: "non-eu-passport-no-residence",
  form: "trade-licence",
  ...patch,
});

const taskIds = (route: { stages: { tasks: { id: string }[] }[] }) =>
  route.stages.flatMap((stage) => stage.tasks.map((task) => task.id));
const text = (route: unknown) => JSON.stringify(route);

test("family and business are available purposes with stored route ids", () => {
  for (const id of ["family", "business"]) {
    assert.equal(movePurposes.find((purpose) => purpose.id === id)?.available, true);
    assert.ok(waitlistRoutes.includes(`${id}-sk` as (typeof waitlistRoutes)[number]));
  }
  const sql = readFileSync(
    join(process.env.REPO_ROOT ?? process.cwd(), "supabase/migrations/20261029120000_family_business_routes.sql"),
    "utf8",
  );
  assert.match(sql, /'family-sk', 'business-sk'/);
  assert.equal((sql.match(/not valid/g) ?? []).length, 2);
});

test("profiles round-trip through the URL and reject incomplete answers", () => {
  const f = family();
  assert.deepEqual(parseFamilyProfile(createFamilyProfileSearchParams(f)), f);
  const child = family({ relation: "child-minor", bothAdults: null });
  assert.deepEqual(parseFamilyProfile(createFamilyProfileSearchParams(child)), child);
  const noAdults = createFamilyProfileSearchParams(f);
  noAdults.delete("adults");
  assert.equal(parseFamilyProfile(noAdults), null);
  const b = business({ form: "company-executive" });
  assert.deepEqual(parseBusinessProfile(createBusinessProfileSearchParams(b)), b);
  assert.equal(parseBusinessProfile(new URLSearchParams("country=SK&citizenship=UA")), null);
  assert.equal(parseFamilyProfile(new URLSearchParams("country=CZ&citizenship=UA&residenceStatus=other&sponsor=blue-card&relation=child-minor")), null);
});

test("a spouse from abroad gets the full family route with the published numbers", () => {
  const route = buildSlovakiaFamilyRoute(family());
  assert.equal(route.applicable, true);
  assert.equal(route.filing, "abroad");
  assert.equal(route.processingDays, 90);
  const ids = taskIds(route);
  for (const id of ["civil-status", "sponsor-residence", "criminal-record", "accommodation", "fees", "residence-submission-place", "post-card-duties"]) {
    assert.ok(ids.includes(id), id);
  }
  assert.ok(!ids.includes("other-parent-consent"));
  assert.match(text(route), /€200/);
  assert.match(text(route), /first 9 months you need a work permit/);
  assert.match(text(route), /24 months/);
});

test("children, Blue Card families and in-country applicants get their own details", () => {
  const child = buildSlovakiaFamilyRoute(family({ relation: "child-minor", bothAdults: null }));
  assert.ok(taskIds(child).includes("other-parent-consent"));
  assert.match(text(child), /not for children under 18/);

  const blueCard = buildSlovakiaFamilyRoute(family({ sponsor: "blue-card" }));
  assert.match(blueCard.headline, /30 if filed together/);
  assert.match(text(blueCard), /work from the day the residence is granted/);

  assert.equal(buildSlovakiaFamilyRoute(family({ currentResidenceStatus: "visa-free-entry" })).filing, "in-country");
});

test("family cases outside the checked guidance never get a dated route", () => {
  for (const patch of [
    { sponsor: "slovak-citizen" as const },
    { sponsor: "eu-citizen" as const },
    { relation: "partner" as const, bothAdults: null },
    { bothAdults: "no" as const },
    { citizenshipCountryCode: "SK" },
    { citizenshipCountryCode: "DE", currentResidenceStatus: "eu-eea-swiss-passport" as const },
    { currentResidenceStatus: "destination-permanent-residence" as const },
  ]) {
    const route = buildSlovakiaFamilyRoute(family(patch));
    assert.equal(route.applicable, false, JSON.stringify(patch));
    assert.equal(route.processingDays, null);
  }
});

test("a first business application is filed at an embassy; a change of purpose in Slovakia", () => {
  const abroad = buildSlovakiaBusinessRoute(business());
  assert.equal(abroad.filing, "abroad");
  assert.match(text(abroad), /you pay €350/);
  // Visa-free or national-visa stays cannot file a first business application in Slovakia.
  assert.equal(buildSlovakiaBusinessRoute(business({ currentResidenceStatus: "visa-free-entry" })).filing, "abroad");
  const change = buildSlovakiaBusinessRoute(business({ currentResidenceStatus: "destination-residence" }));
  assert.equal(change.filing, "in-country");
  assert.match(text(change), /you pay €330/);
});

test("business funds, plan and renewal rules follow the form of business", () => {
  const sole = buildSlovakiaBusinessRoute(business());
  assert.ok(taskIds(sole).includes("trade-licence"));
  assert.ok(taskIds(sole).includes("business-plan"));
  assert.match(text(sole), /5,904\.40/);
  assert.match(text(sole), /2,876\.90/);
  const exec = buildSlovakiaBusinessRoute(business({ form: "company-executive" }));
  assert.ok(taskIds(exec).includes("company-role"));
  assert.match(text(exec), /29,522/);
  assert.match(text(exec), /€340–€11,520/);
  assert.equal(rules.business.validityYears, 3);
});

test("study residence holders are told they may already do business", () => {
  const route = buildSlovakiaBusinessRoute(business({ currentResidenceStatus: "destination-study-residence" }));
  assert.equal(route.applicable, true);
  assert.equal(route.stages[0].tasks[0].id, "study-allows-business");
  assert.equal(route.filing, "in-country");
});

test("permanent residents and EU citizens only need the trade licence or registration", () => {
  const permanent = buildSlovakiaBusinessRoute(business({ currentResidenceStatus: "destination-permanent-residence" }));
  assert.equal(permanent.applicable, false);
  assert.match(text(permanent), /trade licence/i);
  const eu = buildSlovakiaBusinessRoute(business({ citizenshipCountryCode: "PL", currentResidenceStatus: "eu-eea-swiss-passport" }));
  assert.equal(eu.applicable, false);
  assert.ok(taskIds(eu).includes("eu-registration"));
});

test("the planner dates filing 90 days before the move and skips Labour Office steps", () => {
  const plan = planPurposeResidenceDeadlines({
    moveDate: "2027-06-01",
    today: "2026-10-29",
    filing: "abroad",
    processingDays: 90,
    documentMaxAgeDays: 90,
    reportWorkingDays: 3,
  });
  assert.ok(plan);
  assert.equal(plan.latestFilingDate, "2027-03-03");
  const ids = plan.items.map((item) => item.id);
  assert.ok(ids.includes("residence-filing"));
  assert.ok(ids.includes("report-arrival"));
  assert.ok(!ids.includes("labour-office-confirmation"));
  assert.ok(!ids.includes("vacancy-report"));
  assert.equal(plan.warnings.length, 0);
});

test("every task cites a source the route lists", () => {
  for (const route of [
    buildSlovakiaFamilyRoute(family()),
    buildSlovakiaFamilyRoute(family({ relation: "parent-dependent", bothAdults: null })),
    buildSlovakiaBusinessRoute(business()),
    buildSlovakiaBusinessRoute(business({ citizenshipCountryCode: "PL", currentResidenceStatus: "eu-eea-swiss-passport" })),
  ]) {
    const ids = new Set(route.sources.map((source) => source.id));
    for (const stage of route.stages)
      for (const task of stage.tasks)
        for (const id of task.sourceIds) assert.ok(ids.has(id), `${task.id} cites unknown ${id}`);
  }
});

test("the business route never cites the family-reunification page", () => {
  for (const status of ["non-eu-passport-no-residence", "destination-residence"] as const) {
    assert.doesNotMatch(text(buildSlovakiaBusinessRoute(business({ currentResidenceStatus: status })).stages), /iom-family-reunification/);
  }
});
