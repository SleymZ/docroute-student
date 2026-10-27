import assert from "node:assert/strict";
import { test } from "node:test";

import {
  addDays,
  addWorkingDays,
  isIsoDate,
  planStudyResidenceDeadlines,
  subtractWorkingDays,
} from "../src/lib/residence/deadlines";
import { easterSunday, slovakDaysOff } from "../src/lib/residence/slovak-holidays";

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

test("Slovak public holidays follow Act 241/1993 as in force from 1 November 2025", () => {
  assert.equal(easterSunday(2027), "2027-03-28");
  assert.equal(easterSunday(2026), "2026-04-05");
  const days2027 = slovakDaysOff(2027);
  for (const day of ["2027-01-01", "2027-01-06", "2027-03-26", "2027-03-29", "2027-05-08", "2027-09-15", "2027-12-26"])
    assert.ok(days2027.has(day), day);
  // State holidays that are not days off since the amendments.
  for (const day of ["2027-09-01", "2027-10-28", "2027-11-17", "2027-03-28"])
    assert.ok(!days2027.has(day), day);
  // § 4b: only in 2026, 8 May and 15 September are working days.
  assert.ok(!slovakDaysOff(2026).has("2026-05-08"));
  assert.ok(!slovakDaysOff(2026).has("2026-09-15"));
  assert.equal(slovakDaysOff(2027).size, 13);
});

test("working days skip Slovak public holidays", () => {
  // Arriving Wed 23 Dec 2026: 24, 25, 26 Dec are days off, then the weekend.
  assert.equal(addWorkingDays("2026-12-23", 3), "2026-12-30");
  // Thu 25 Mar 2027 + 3: Good Friday and Easter Monday are skipped.
  assert.equal(addWorkingDays("2027-03-25", 3), "2027-04-01");
  // 1 September is no longer a day off.
  assert.equal(addWorkingDays("2027-08-31", 1), "2027-09-01");
  assert.equal(subtractWorkingDays("2027-01-07", 2), "2027-01-04");
});
