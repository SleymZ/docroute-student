import assert from "node:assert/strict";
import { test } from "node:test";

import { citizenshipStage, hasCitizenshipNotes } from "../src/data/citizenship-notes";
import { findFullPathGroup, buildFullPath } from "../src/lib/full-path";
import { countryGuides, findCountryGuide, hasCountryGuide } from "../src/lib/residence/country-guides";
import { buildLinkedGuide, linkedGuideCountries } from "../src/lib/residence/linked-guides";

const officialHosts = ["home-affairs.ec.europa.eu", "nyidanmark.dk", "ch.ch", "kmu.admin.ch"];

test("linked guides cover the other EU countries and Switzerland", () => {
  assert.equal(linkedGuideCountries.length, 25);
  for (const code of ["SK", "CZ", "AT"]) assert.equal(linkedGuideCountries.includes(code), false, code);
  for (const code of ["DE", "NL", "PL", "IT", "IE", "DK", "CH", "SE", "FR", "ES"]) {
    assert.ok(linkedGuideCountries.includes(code), code);
  }
  // Verified guides keep priority; work is not linked.
  assert.equal(findCountryGuide("CZ", "family")?.coverage, undefined);
  assert.equal(findCountryGuide("de", "family")?.coverage, "official-link");
  assert.equal(hasCountryGuide("DE", "business"), true);
  assert.equal(hasCountryGuide("DE", "work"), false);
  assert.equal(hasCountryGuide("SK", "family"), false, "Slovakia has its own /route/family");
  assert.equal(countryGuides.length, 5);
});

test("every linked guide cites one official page and nothing else", () => {
  for (const code of linkedGuideCountries) {
    for (const purpose of ["family", "business"] as const) {
      const guide = buildLinkedGuide(code, purpose);
      if (!guide) throw new Error(`${code}-${purpose} missing`);
      assert.equal(guide.sources.length, 1);
      const host = new URL(guide.sources[0].url).hostname.replace(/^www\./, "");
      assert.ok(officialHosts.includes(host), `${code}-${purpose}: ${host}`);
      if (host === "home-affairs.ec.europa.eu") {
        const slug = purpose === "family" ? "family-member" : "self-employed-worker";
        assert.match(guide.sources[0].url, new RegExp(`/eu-immigration-portal/${slug}-[a-z]+_en$`));
      }
      const ids = new Set<string>();
      for (const stage of guide.variants[0].stages) {
        for (const task of stage.tasks) {
          assert.deepEqual(task.sourceIds, [guide.sources[0].id]);
          assert.equal(ids.has(task.id), false, task.id);
          ids.add(task.id);
          // No figures: linked guides never state fees, thresholds or dates.
          assert.doesNotMatch(task.description, /€|\bEUR\b|\d{2,}/, `${code}: ${task.id}`);
        }
      }
    }
  }
});

test("Indian citizens get a visa and apostille stage", () => {
  assert.equal(hasCitizenshipNotes("in"), true);
  assert.equal(citizenshipStage("UA", "DE", "Germany", "family"), null);

  const de = citizenshipStage("IN", "DE", "Germany", "family")!;
  assert.deepEqual(de.stage.tasks.map((task) => task.id), ["in-visa", "in-apostille"]);
  assert.ok(de.sources.some((source) => source.id === "eu-reg-2018-1806"));
  assert.match(de.stage.tasks[1].description, /marriage and birth certificates/);

  const ie = citizenshipStage("IN", "IE", "Ireland", "business")!;
  assert.ok(ie.sources.some((source) => source.id === "ie-visa-required-nationalities"));
  assert.equal(ie.sources.some((source) => source.id === "eu-reg-2018-1806"), false);

  const ch = citizenshipStage("IN", "CH", "Switzerland", "family")!;
  assert.ok(ch.sources.some((source) => source.id === "ch-sem-visa-list-i"));

  for (const stage of [de, ie, ch]) {
    const ids = new Set(stage.sources.map((source) => source.id));
    for (const task of stage.stage.tasks) for (const id of task.sourceIds) assert.ok(ids.has(id), id);
  }
});

test("the full study path adds the Indian stage before residence", () => {
  const group = findFullPathGroup("tudelft-cse-bsc-2027")!;
  const path = buildFullPath(group, { citizenshipCountryCode: "IN", currentResidenceStatus: "non-eu-passport-no-residence" });
  const ids = path.stages.map((stage) => stage.id);
  assert.ok(ids.indexOf("citizenship-in") >= 0 && ids.indexOf("citizenship-in") < ids.indexOf("residence"));
  assert.ok(path.sources.some((source) => source.id === "in-mea-apostille"));
});

test("existing residents get no entry-visa step", () => {
  const resident = citizenshipStage("IN", "CH", "Switzerland", "study", { existingResident: true })!;
  assert.deepEqual(resident.stage.tasks.map((task) => task.id), ["in-apostille"]);
  const group = findFullPathGroup("ethz-informatik-bsc-2027")!;
  const path = buildFullPath(group, { citizenshipCountryCode: "IN", currentResidenceStatus: "destination-permanent-residence" });
  const tasks = path.stages.flatMap((stage) => stage.tasks.map((task) => task.id));
  assert.equal(tasks.includes("in-visa"), false);
  assert.ok(tasks.includes("in-apostille"));
});
