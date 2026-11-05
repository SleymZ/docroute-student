import assert from "node:assert/strict";
import { test } from "node:test";

import catalog from "../src/data/universities.json";
import {
  topCountryGuides,
  topRankingSource,
  topUniversities,
} from "../src/data/top-universities";
import { resolveTopAdmissions } from "../src/lib/top-universities";

test("the list has ranks 1–100 in order, from the Leiden Open Edition", () => {
  assert.equal(topUniversities.length, 100);
  topUniversities.forEach((university, index) => {
    assert.equal(university.rank, index + 1);
  });
  // The order follows P(top 10%), highest first.
  for (let i = 1; i < topUniversities.length; i += 1) {
    assert.ok(
      topUniversities[i - 1].leiden.topTenPublications >=
        topUniversities[i].leiden.topTenPublications,
      `rank ${i + 1} is out of order`,
    );
  }
  assert.equal(topRankingSource.license, "CC0 1.0");
});

test("the list follows the Leiden Open Edition 2026 (2021–2024)", () => {
  assert.match(topRankingSource.title, /Open Edition 2026$/);
  assert.equal(topRankingSource.period, "2021–2024");
  assert.match(topRankingSource.url, /\/ranking\/2026\/list$/);
  // Spot checks against the published Europe list, P(top 10%), fractional counting.
  const byName = (name: string) => topUniversities.find((item) => item.name === name);
  assert.equal(byName("University College London")?.leiden.topTenPublications, 3458);
  assert.equal(byName("Charles University")?.rank, 99);
  assert.equal(byName("Queen's University Belfast")?.rank, 96);
});

test("every university has at least one official https source with a check date", () => {
  for (const university of topUniversities) {
    const { sources } = resolveTopAdmissions(university);
    assert.ok(sources.length > 0, university.name);
    for (const source of sources) {
      assert.match(source.url, /^https:\/\//, `${university.name}: ${source.url}`);
      assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    }
  }
});

test("country rules carry their own sources", () => {
  for (const [code, guide] of Object.entries(topCountryGuides)) {
    const hasFact = ["apply", "deadline", "school", "language", "tuition"].some(
      (field) => field in guide,
    );
    if (hasFact) assert.ok(guide.sources.length > 0, code);
  }
});

test("a university's own statement wins over the country rule", () => {
  const tum = topUniversities.find((item) => item.name === "Technical University of Munich");
  assert.ok(tum);
  const tuition = resolveTopAdmissions(tum).fields.find((item) => item.field === "tuition");
  assert.equal(tuition?.scope, "university");
  assert.match(tuition!.text, /€2,300 or €3,400/);

  const lmu = topUniversities.find((item) => item.name.startsWith("Ludwig"));
  const school = resolveTopAdmissions(lmu!).fields.find((item) => item.field === "school");
  assert.equal(school?.scope, "country");
});

test("missing fields are listed instead of guessed", () => {
  for (const university of topUniversities) {
    const resolved = resolveTopAdmissions(university);
    assert.equal(resolved.fields.length + resolved.missing.length, 5, university.name);
  }
});

test("catalog links point to existing DocRoute university pages", () => {
  const ids = new Set(catalog.universities.map((item) => item.id));
  for (const university of topUniversities) {
    if (university.catalogId) assert.ok(ids.has(university.catalogId), university.name);
  }
  const linked = topUniversities.filter((item) => item.catalogId).length;
  assert.ok(linked >= 95, `only ${linked} linked`);
});

test("every university has a last day to apply, or says why there is none", () => {
  const confirmedNone = new Set<number>();
  for (const university of topUniversities) {
    const applyBy = university.admissions.applyBy;
    assert.notEqual(applyBy, undefined, `${university.name}: applyBy missing`);
    if (applyBy === null) {
      confirmedNone.add(university.rank);
      const guide = topCountryGuides[university.countryCode];
      assert.ok(university.admissions.deadline || guide?.deadline || university.admissions.apply, `${university.name}: no deadline text either`);
      continue;
    }
    assert.match(applyBy!.date, /^\d{4}-\d{2}-\d{2}$/, university.name);
    assert.ok(!Number.isNaN(Date.parse(applyBy!.date)), university.name);
    assert.ok(["2027/28", "2026/27"].includes(applyBy!.cycle), university.name);
    assert.ok(applyBy!.label.length > 8, university.name);
    // A 2027/28 deadline falls between the 2026 autumn and the 2027 start.
    if (applyBy!.cycle === "2027/28") assert.ok(applyBy!.date >= "2026-10-01" && applyBy!.date <= "2027-09-30", `${university.name}: ${applyBy!.date}`);
    if (applyBy!.cycle === "2026/27") {
      assert.ok(applyBy!.date < "2026-12-31", `${university.name}: ${applyBy!.date}`);
      assert.match(applyBy!.label, /not published yet/, `${university.name}: past cycle must say so`);
    }
  }
  assert.ok(confirmedNone.size <= 6, `too many without a date: ${[...confirmedNone].join(", ")}`);
  assert.equal(topUniversities.find((item) => item.rank === 2)!.admissions.applyBy!.date, "2026-10-15");
});
