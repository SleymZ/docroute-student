import assert from "node:assert/strict";
import { test } from "node:test";

import {
  addDays,
  addWorkingDays,
  isIsoDate,
  planStudyResidenceDeadlines,
} from "../src/lib/residence/deadlines";

const base = {
  today: "2026-10-23",
  applicationDeadline: "2027-03-31",
  admissionDate: "2027-06-03",
  processingDays: 90,
};

function item(plan: ReturnType<typeof planStudyResidenceDeadlines>, id: string) {
  const found = plan?.items.find((entry) => entry.id === id);
  assert.ok(found, id);
  return found;
}

test("date helpers work in UTC across months, leap years and weekends", () => {
  assert.equal(addDays("2027-09-15", -90), "2027-06-17");
  assert.equal(addDays("2028-03-01", -1), "2028-02-29");
  // Friday + 3 working days = Wednesday.
  assert.equal(addWorkingDays("2027-09-17", 3), "2027-09-22");
  assert.ok(isIsoDate("2027-02-28"));
  assert.ok(!isIsoDate("2027-02-30"));
  assert.ok(!isIsoDate("15.09.2027"));
});

test("an abroad applicant moving in mid-September gets dated steps", () => {
  const plan = planStudyResidenceDeadlines({
    ...base,
    moveDate: "2027-09-15",
    filing: "abroad",
  });
  assert.ok(plan);
  assert.equal(plan.latestFilingDate, "2027-06-17");
  assert.equal(item(plan, "residence-filing").date, "2027-06-17");
  assert.equal(item(plan, "criminal-record").date, "2027-03-19");
  assert.equal(item(plan, "authentication-translation").date, "2027-06-17");
  // Wednesday 15 Sep 2027 + 3 working days = Monday 20 Sep.
  assert.equal(item(plan, "report-arrival").date, "2027-09-20");
  assert.equal(item(plan, "health-insurance").date, undefined);
  assert.equal(item(plan, "medical-report").date, undefined);
  assert.deepEqual(plan.warnings, []);
});

test("admission results after the latest filing date produce a warning", () => {
  const plan = planStudyResidenceDeadlines({
    ...base,
    moveDate: "2027-08-25",
    filing: "abroad",
  });
  assert.ok(plan);
  assert.equal(plan.latestFilingDate, "2027-05-27");
  assert.equal(plan.warnings.length, 1);
  assert.match(plan.warnings[0], /admission letter is needed to file/i);
});

test("a filing date already in the past is flagged as late", () => {
  const plan = planStudyResidenceDeadlines({
    ...base,
    moveDate: "2026-12-01",
    filing: "abroad",
  });
  assert.ok(plan);
  assert.equal(item(plan, "residence-filing").tone, "late");
  assert.ok(plan.warnings.some((warning) => /would have had to be filed/.test(warning)));
});

test("in-country applicants do not get the arrival report step", () => {
  const plan = planStudyResidenceDeadlines({
    ...base,
    moveDate: "2027-09-15",
    filing: "in-country",
  });
  assert.ok(plan);
  assert.ok(!plan.items.some((entry) => entry.id === "report-arrival"));
  assert.match(item(plan, "residence-filing").detail, /status must still be valid/);
});

test("an unclear filing place adds a warning instead of guessing", () => {
  const plan = planStudyResidenceDeadlines({
    ...base,
    moveDate: "2027-09-15",
    filing: "unclear",
  });
  assert.ok(plan?.warnings.some((warning) => /Confirm with the Foreign Police/.test(warning)));
});

test("missing, invalid or past move dates produce no plan", () => {
  for (const moveDate of ["", "2027-13-01", "2026-10-23", "2026-01-01"]) {
    assert.equal(
      planStudyResidenceDeadlines({ ...base, moveDate, filing: "abroad" }),
      null,
      moveDate,
    );
  }
});

test("plan dates are formatted without locale-dependent month names", async () => {
  const { formatPlanDate } = await import("../src/lib/residence/deadlines");
  assert.equal(formatPlanDate("2027-09-20"), "20 Sep 2027");
  assert.equal(formatPlanDate("2027-06-07"), "7 Jun 2027");
});
