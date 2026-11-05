import assert from "node:assert/strict";
import { test } from "node:test";

import {
  airportTransitVisaRequired,
  apostilleObjections,
  apostilleParties,
  schengenVisaFree,
  schengenVisaRequired,
} from "../src/data/citizenship-lists";
import { citizenshipStage, hasCitizenshipNotes, isExistingResidentStatus } from "../src/data/citizenship-notes";
import { findFullPathGroup, buildFullPath } from "../src/lib/full-path";
import { countryGuides, findCountryGuide, hasCountryGuide } from "../src/lib/residence/country-guides";
import { buildLinkedGuide, linkedGuideCountries } from "../src/lib/residence/linked-guides";

const officialHosts = ["home-affairs.ec.europa.eu", "nyidanmark.dk", "ch.ch", "kmu.admin.ch", "sem.admin.ch"];

test("linked guides cover the other EU countries and Switzerland", () => {
  assert.equal(linkedGuideCountries.length, 25);
  for (const code of ["SK", "CZ", "AT"]) assert.equal(linkedGuideCountries.includes(code), false, code);
  for (const code of ["DE", "NL", "PL", "IT", "IE", "DK", "CH", "SE", "FR", "ES"]) {
    assert.ok(linkedGuideCountries.includes(code), code);
  }
  // Verified guides keep priority; Czech work stays at /route/czechia.
  assert.equal(findCountryGuide("CZ", "family")?.coverage, undefined);
  assert.equal(findCountryGuide("AT", "work")?.coverage, undefined);
  assert.equal(findCountryGuide("de", "family")?.coverage, undefined, "Germany is verified since 2026-11-05");
  assert.equal(findCountryGuide("nl", "family")?.coverage, "official-link");
  assert.equal(hasCountryGuide("DE", "business"), true);
  assert.equal(hasCountryGuide("DE", "work"), true);
  assert.equal(hasCountryGuide("CZ", "work"), false);
  assert.equal(hasCountryGuide("SK", "work"), false, "Slovakia has its own /route/work");
  assert.equal(hasCountryGuide("SK", "family"), false, "Slovakia has its own /route/family");
  assert.equal(countryGuides.length, 11);
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

test("work guides cite the employed-worker page and the Blue Card page", () => {
  for (const code of linkedGuideCountries) {
    const guide = buildLinkedGuide(code, "work");
    if (!guide) throw new Error(`${code}-work missing`);
    const ids = new Set(guide.sources.map((source) => source.id));
    for (const source of guide.sources) {
      const host = new URL(source.url).hostname.replace(/^www\./, "");
      assert.ok(officialHosts.includes(host), `${code}: ${host}`);
    }
    if (code === "DK" || code === "CH") {
      assert.equal(guide.sources.length, 1, code);
    } else {
      assert.match(guide.sources[0].url, /\/eu-immigration-portal\/employed-worker-[a-z]+_en$/);
      assert.match(
        guide.sources[1].url,
        code === "IE" ? /highly-qualified-worker-ireland_en$/ : /\/eu-blue-card\/eu-blue-card-[a-z]+_en$/,
      );
    }
    const taskIds = new Set<string>();
    for (const stage of guide.variants[0].stages) {
      for (const task of stage.tasks) {
        for (const id of task.sourceIds) assert.ok(ids.has(id), `${code}: ${id}`);
        assert.equal(taskIds.has(task.id), false, task.id);
        taskIds.add(task.id);
        assert.doesNotMatch(task.description, /€|\bEUR\b|CHF|\d{2,}/, `${code}: ${task.id}`);
      }
    }
  }
});

function stageFor(...args: Parameters<typeof citizenshipStage>) {
  const result = citizenshipStage(...args);
  if (!result) throw new Error(`no stage for ${args[0]} in ${args[1]}`);
  const ids = new Set(result.sources.map((source) => source.id));
  for (const task of result.stage.tasks) for (const id of task.sourceIds) assert.ok(ids.has(id), id);
  // Ids end with the citizenship ("citizen-visa-in"); compare without it.
  const suffix = `-${String(args[0]).toLowerCase()}`;
  const base = (id: string) => (id.endsWith(suffix) ? id.slice(0, -suffix.length) : id);
  for (const task of result.stage.tasks) assert.ok(task.id.endsWith(suffix), task.id);
  return {
    ...result,
    ids: result.stage.tasks.map((task) => base(task.id)),
    byId: new Map(result.stage.tasks.map((task) => [base(task.id), task])),
  };
}

test("every non-EU passport gets notes; EU passports and own citizens do not", () => {
  assert.equal(hasCitizenshipNotes("in"), true);
  assert.equal(hasCitizenshipNotes("US"), true);
  assert.equal(hasCitizenshipNotes("DE"), false);
  assert.equal(hasCitizenshipNotes("ZZ"), false);
  assert.equal(citizenshipStage("FR", "DE", "Germany", "family"), null);
  assert.equal(citizenshipStage("NO", "DE", "Germany", "family"), null);
});

test("Indian citizens: visa, and no apostille for Germany (Germany objected)", () => {
  const de = stageFor("IN", "DE", "Germany", "family");
  assert.deepEqual(de.ids, ["citizen-visa", "citizen-documents"]);
  assert.equal(de.stage.stripLabel, "For citizens of India");
  assert.ok(de.sources.some((source) => source.id === "eu-reg-2018-1806"));
  assert.match(de.byId.get("citizen-documents")!.title, /does not apply between India and Germany/);

  const nl = stageFor("IN", "NL", "the Netherlands", "family");
  assert.match(nl.byId.get("citizen-documents")!.title, /MEA/);
  assert.match(nl.byId.get("citizen-documents")!.description, /marriage and birth certificates/);
  assert.ok(nl.ids.includes("citizen-tb-nl"));

  const ie = stageFor("IN", "IE", "Ireland", "business");
  assert.ok(ie.sources.some((source) => source.id === "ie-visa-required-nationalities"));
  assert.equal(ie.sources.some((source) => source.id === "eu-reg-2018-1806"), false);

  const ch = stageFor("IN", "CH", "Switzerland", "family");
  assert.ok(ch.sources.some((source) => source.id === "ch-sem-visa-list-i"));
});

test("visa-free passports get relief where an official list grants it", () => {
  const usDe = stageFor("US", "DE", "Germany", "work");
  assert.match(usDe.byId.get("citizen-visa")!.title, /may apply in Germany/);
  assert.ok(usDe.ids.includes("citizen-work-de"));

  // Brazil: § 41 (2) only without employment.
  assert.match(stageFor("BR", "DE", "Germany", "family").byId.get("citizen-visa")!.title, /may apply in Germany/);
  assert.match(stageFor("BR", "DE", "Germany", "work").byId.get("citizen-visa")!.title, /No visa for visits/);

  assert.match(stageFor("CA", "NL", "the Netherlands", "work").byId.get("citizen-visa")!.title, /No provisional residence permit/);
  assert.match(stageFor("RS", "DE", "Germany", "work").byId.get("citizen-work-de")!.title, /Western Balkans/);
  assert.match(stageFor("GE", "FR", "France", "work").byId.get("citizen-visa")!.description, /biometric passports/);
});

test("extra checks: airport transit, legalisation, objections, Ukraine", () => {
  const pk = stageFor("PK", "PL", "Poland", "work");
  assert.ok(pk.ids.includes("citizen-transit"));
  assert.match(pk.byId.get("citizen-documents")!.title, /does not apply between Pakistan and Poland/);
  assert.equal(stageFor("PK", "IE", "Ireland", "work").ids.includes("citizen-transit"), false);

  // Joined, but not yet in force (Thailand: 28 February 2027).
  assert.match(stageFor("TH", "FR", "France", "work", { asOf: "2026-11-03" }).byId.get("citizen-documents")!.title, /legalisation for now/);
  assert.match(stageFor("TH", "FR", "France", "work", { asOf: "2027-03-01" }).byId.get("citizen-documents")!.title, /Apostille your documents/);

  // Not a party to the Apostille Convention.
  assert.match(stageFor("EG", "IT", "Italy", "family").byId.get("citizen-documents")!.title, /legalisation/);

  assert.match(stageFor("UA", "PL", "Poland", "work").byId.get("citizen-protection")!.description, /2026\/1912/);
  assert.match(stageFor("UA", "DK", "Denmark", "family").byId.get("citizen-protection")!.title, /Special Act/);
  assert.match(stageFor("UA", "CH", "Switzerland", "family").byId.get("citizen-protection")!.title, /status S/);
});

test("passport ticks do not carry over to another passport", () => {
  const us = citizenshipStage("US", "DE", "Germany", "work")!.stage.tasks.map((task) => task.id);
  const india = citizenshipStage("IN", "DE", "Germany", "work")!.stage.tasks.map((task) => task.id);
  assert.equal(us.some((id) => india.includes(id)), false);
});

test("the official lists are consistent", () => {
  for (const code of schengenVisaRequired) assert.equal(schengenVisaFree.includes(code), false, code);
  for (const code of airportTransitVisaRequired) assert.ok(schengenVisaRequired.includes(code), code);
  for (const [code, objecting] of Object.entries(apostilleObjections)) {
    assert.ok(apostilleParties.includes(code), code);
    for (const state of objecting) assert.ok(apostilleParties.includes(state), `${code}: ${state}`);
  }
  assert.ok(apostilleObjections.IN.includes("DE"));
  assert.equal(apostilleObjections.IN.includes("NL"), false, "withdrawn in 2008");
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
  assert.deepEqual(resident.stage.tasks.map((task) => task.id), ["citizen-documents-in"]);
  const group = findFullPathGroup("ethz-informatik-bsc-2027")!;
  const path = buildFullPath(group, { citizenshipCountryCode: "IN", currentResidenceStatus: "destination-permanent-residence" });
  const tasks = path.stages.flatMap((stage) => stage.tasks.map((task) => task.id));
  assert.equal(tasks.includes("citizen-visa-in"), false);
  assert.ok(tasks.includes("citizen-documents-in"));
});

test("existing-resident statuses are the destination permits and visas", () => {
  for (const status of ["destination-study-residence", "destination-residence", "destination-permanent-residence", "destination-national-visa"]) {
    assert.equal(isExistingResidentStatus(status), true, status);
  }
  for (const status of ["non-eu-passport-no-residence", "other-eu-residence", "visa-free-entry", null]) {
    assert.equal(isExistingResidentStatus(status), false, String(status));
  }
});
