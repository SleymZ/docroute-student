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
    assert.ok(["SK", "CZ", "NL", "AT", "DE"].includes(row.countryCode), row.countryCode);
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
  // Short links land on the entry screen (owner decision 2026-11-20), which links here.
  assert.match(read("src/lib/short-links.ts"), /SHORT_LINK_TARGET = "\/"/);
  assert.match(read("src/components/EntryScreen.tsx"), /href="\/deadlines"/);
});

test("a faculty with programmes in two fields keeps each under its own field filter", () => {
  const rows = upcomingFacultyDeadlines(verifiedPrograms, "2026-11-16");
  for (const field of ["Computer Science", "Medicine", "Law", "Economics & Business"]) {
    const listed = filterDeadlines(rows, null, field).flatMap((row) => row.programmes).length;
    assert.equal(listed, verifiedPrograms.filter((p) => p.category === field).length, field);
  }
  const cs = filterDeadlines(rows, null, "Computer Science").flatMap((row) => row.programmes);
  assert.ok(cs.includes("Management Informatics"));
});

test("each deadline card opens its own programme and offers the route for it", () => {
  const rows = upcomingFacultyDeadlines(verifiedPrograms, "2026-11-16");
  for (const row of rows) {
    const href = new URL(row.universityHref, "https://docroute.app");
    assert.equal(href.pathname, `/universities/${row.universityId}`);
    const program = verifiedPrograms.find((p) => p.id === href.searchParams.get("programId"));
    assert.ok(program, row.universityHref);
    assert.equal(program.universityId, row.universityId);
    assert.equal(program.faculty, row.faculty);
    const route = new URL(row.routeHref, "https://docroute.app");
    assert.equal(route.pathname, "/route/profile");
    assert.equal(route.searchParams.get("country"), row.countryCode);
    assert.equal(route.searchParams.get("program"), row.category);
    assert.ok(needsAccount(route.pathname), "guests are asked to sign up first");
  }
  // Comenius medicine (the first card in November) must open medicine, not computer science.
  const medicine = rows.find((row) => row.faculty.startsWith("Faculty of Medicine (LF UK Bratislava)"));
  assert.ok(medicine?.universityHref.includes("programId=uniba-lf-"), medicine?.universityHref);
});

test("the deadlines page names and filters the five verified countries", () => {
  const page = read("src/app/deadlines/page.tsx");
  for (const code of ["SK", "CZ", "NL", "AT", "DE"]) assert.match(page, new RegExp(`${code}: "`));
});
