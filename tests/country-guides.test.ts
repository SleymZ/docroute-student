import assert from "node:assert/strict";
import { test } from "node:test";

import { countryGuides, findCountryGuide, hasCountryGuide, pickVariant } from "../src/lib/residence/country-guides";

const allowedHosts = ["ipc.gov.cz", "migration.gv.at", "oesterreich.gv.at", "zakonyprolidi.cz"];

test("guides exist for CZ family/business and AT work/family/business only", () => {
  assert.deepEqual(
    countryGuides.map((guide) => `${guide.country}-${guide.purpose}`).sort(),
    ["AT-business", "AT-family", "AT-work", "CZ-business", "CZ-family"],
  );
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
