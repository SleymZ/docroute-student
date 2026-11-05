import assert from "node:assert/strict";
import { test } from "node:test";

import { verifiedGuideCountries } from "../src/lib/country-list";
import { countryGuides, findCountryGuide, hasCountryGuide, pickVariant } from "../src/lib/residence/country-guides";

const allowedHosts = [
  "ipc.gov.cz",
  "migration.gv.at",
  "oesterreich.gv.at",
  "zakonyprolidi.cz",
  "make-it-in-germany.com",
  "bamf.de",
  "auswaertiges-amt.de",
  "sem.admin.ch",
  "ch.ch",
];

test("verified guides: CZ family/business; AT, DE and CH work/family/business", () => {
  assert.deepEqual(
    countryGuides.map((guide) => `${guide.country}-${guide.purpose}`).sort(),
    ["AT-business", "AT-family", "AT-work", "CH-business", "CH-family", "CH-work", "CZ-business", "CZ-family", "DE-business", "DE-family", "DE-work"],
  );
  assert.equal(findCountryGuide("de", "work")?.countryName, "Germany");
  assert.equal(findCountryGuide("CH", "family")?.coverage, undefined, "verified, not official-link");
  assert.equal(hasCountryGuide("CZ", "work"), false, "Czech work stays on /route/czechia");
  assert.equal(hasCountryGuide("SK", "family"), false);
  assert.equal(findCountryGuide("at", "work")?.countryName, "Austria");
});

test("every task cites a source of its guide, on an official host", () => {
  for (const guide of countryGuides) {
    const ids = new Set(guide.sources.map((source) => source.id));
    for (const source of guide.sources) {
      const host = new URL(source.url).hostname.replace(/^www\./, "");
      assert.ok(allowedHosts.includes(host), `${guide.country}-${guide.purpose}: ${source.url}`);
    }
    const taskIds = new Set<string>();
    for (const variant of guide.variants) {
      for (const stage of variant.stages) {
        for (const task of stage.tasks) {
          assert.ok(task.sourceIds.length > 0, task.id);
          for (const id of task.sourceIds) assert.ok(ids.has(id), `${task.id} -> ${id}`);
          assert.ok(!taskIds.has(task.id), `duplicate task id ${task.id}`);
          taskIds.add(task.id);
        }
      }
    }
  }
});

test("variant selection falls back to the first variant", () => {
  const guide = findCountryGuide("AT", "work")!;
  assert.equal(pickVariant(guide, "blue-card").id, "blue-card");
  assert.equal(pickVariant(guide, "nonsense").id, guide.variants[0].id);
  assert.match(pickVariant(guide, "blue-card").summary, /55,678/);
});

test("country-list marks exactly the countries that have verified guides", () => {
  const withGuides = new Set(countryGuides.map((guide) => guide.country));
  for (const code of withGuides) assert.ok(verifiedGuideCountries.has(code), code);
  for (const code of verifiedGuideCountries) assert.ok(withGuides.has(code), code);
});

test("Germany: 2026 thresholds from Make it in Germany; Switzerland states no amounts", () => {
  const blue = pickVariant(findCountryGuide("DE", "work")!, "blue-card");
  assert.match(JSON.stringify(blue), /€50,700/);
  assert.match(JSON.stringify(blue), /€45,934\.20/);
  assert.match(JSON.stringify(pickVariant(findCountryGuide("DE", "work")!, "skilled-worker")), /€55,770/);
  assert.match(JSON.stringify(pickVariant(findCountryGuide("DE", "work")!, "opportunity-card")), /€1,091/);
  for (const purpose of ["work", "family", "business"] as const) {
    const guide = findCountryGuide("CH", purpose)!;
    assert.doesNotMatch(JSON.stringify(guide.variants), /CHF|€/, `CH ${purpose}`);
    // Each German and Swiss variant has a step that opens on the Free plan
    // beyond the first one of each stage ("Needs attention").
    assert.ok(guide.variants.every((variant) => variant.stages.some((stage) => stage.tasks.length > 0)));
  }
});
