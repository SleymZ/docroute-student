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
