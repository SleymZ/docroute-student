import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { verifiedPrograms } from "@/data/verified-programs";
import { pendingProgramGroups } from "@/data/pending-programs";
import { needsAccount } from "@/lib/access";
import {
  daysUntil,
  filterDeadlines,
  openDeadline,
  upcomingFacultyDeadlines,
} from "@/lib/deadline-list";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("days left are whole calendar days", () => {
  assert.equal(daysUntil("2026-11-16", "2027-02-28"), 104);
  assert.equal(daysUntil("2026-11-16", "2027-03-31"), 135);
  assert.equal(daysUntil("2027-03-31", "2027-03-31"), 0);
});

test("the deadlines list shows every verified programme once, soonest first", () => {
  const rows = upcomingFacultyDeadlines(verifiedPrograms, "2026-11-16");
  const listed = rows.flatMap((row) => row.programmes);
  assert.equal(listed.length, verifiedPrograms.length);
  for (let i = 1; i < rows.length; i += 1) assert.ok(rows[i - 1].deadline <= rows[i].deadline);
  for (const row of rows) {
    assert.ok(row.daysLeft >= 0);
    assert.match(row.applicationUrl, /^https:\/\//);
    assert.match(row.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(row.countryCode === "SK" || row.countryCode === "CZ");
  }
});

test("only verified programmes are listed, never coming-soon ones", () => {
  const rows = upcomingFacultyDeadlines(verifiedPrograms, "2026-11-16");
  const verifiedFaculties = new Set(verifiedPrograms.map((p) => `${p.universityId}|${p.faculty}`));
  for (const row of rows) assert.ok(verifiedFaculties.has(`${row.universityId}|${row.faculty}`));
  // The page imports verified programmes only.
  const page = read("src/app/deadlines/page.tsx");
  assert.match(page, /from "@\/data\/verified-programs"/);
  assert.doesNotMatch(page, /pending-programs/);
  assert.ok(pendingProgramGroups.length > 0);
});

test("a closed deadline drops out, or moves to a later round", () => {
  const program = verifiedPrograms[0];
  assert.deepEqual(openDeadline(program, "2026-11-16"), { deadline: program.application.deadline, laterRound: false });
  const withRound = {
    ...program,
    application: { ...program.application, deadline: "2027-03-31", laterRounds: [{ deadline: "2027-06-30", admissionDate: "2027-07-10" }] },
  };
  assert.deepEqual(openDeadline(withRound, "2027-04-01"), { deadline: "2027-06-30", laterRound: true });
  assert.equal(openDeadline(withRound, "2027-07-01"), null);
  assert.equal(upcomingFacultyDeadlines(verifiedPrograms, "2030-01-01").length, 0);
});

test("filters by country and field", () => {
  const rows = upcomingFacultyDeadlines(verifiedPrograms, "2026-11-16");
  const sk = filterDeadlines(rows, "SK", null);
  assert.ok(sk.length > 0 && sk.every((row) => row.countryCode === "SK"));
  const medicine = filterDeadlines(rows, null, "Medicine");
  assert.ok(medicine.length > 0 && medicine.every((row) => row.category === "Medicine"));
});

test("guests can open the deadlines page, it is indexable and linked", () => {
  assert.equal(needsAccount("/deadlines"), false);
  assert.match(read("src/app/sitemap.ts"), /\/deadlines`/);
  assert.match(read("src/app/deadlines/page.tsx"), /canonical: "\/deadlines"/);
  assert.match(read("src/components/SiteFooter.tsx"), /href="\/deadlines"/);
  assert.match(read("src/lib/short-links.ts"), /SHORT_LINK_TARGET = "\/deadlines"/);
});
