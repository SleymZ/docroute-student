import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { citizenshipStage } from "../src/data/citizenship-notes";
import { russiaBelarusNotes } from "../src/data/russia-belarus";
import { countryPages, countryStudy, purposeRoute } from "../src/lib/countries";
import { passportTrack } from "../src/lib/passport-track";
import { findCountryGuide } from "../src/lib/residence/country-guides";

const root = process.env.REPO_ROOT ?? process.cwd();

test("every EU country and Switzerland has a page", () => {
  assert.equal(countryPages.length, 28);
  for (const code of ["SK", "CZ", "DE", "FR", "MT", "CY", "CH"]) assert.ok(countryPages.some((item) => item.code === code), code);
  assert.ok(!countryPages.some((item) => item.code === "GB"));
});

test("work, family and business routes exist for every country page", () => {
  for (const { code } of countryPages) {
    for (const purpose of ["work", "family", "business"] as const) {
      const route = purposeRoute(code, purpose);
      if (code === "SK" || (code === "CZ" && purpose === "work")) {
        assert.equal(route.coverage, "verified");
        continue;
      }
      const params = new URL(route.href, "https://x").searchParams;
      assert.ok(findCountryGuide(params.get("country"), params.get("purpose")), `${code} ${purpose}`);
      assert.equal(route.coverage, code === "AT" || code === "CZ" ? "verified" : "official-links", `${code} ${purpose}`);
    }
  }
});

test("study summaries come from the same data as the routes", () => {
  const sk = countryStudy("SK");
  assert.ok(sk.universities > 10);
  assert.ok(sk.verified.some((item) => item.faculty.includes("FIIT")));
  assert.equal(sk.residence, "verified");
  assert.equal(countryStudy("DE").residence, "verified");
  assert.equal(countryStudy("FR").residence, "official-links");
  assert.equal(countryStudy("MT").verified.length, 0);
});

test("passport tracks: own, EU free movement, easier, standard and harder", () => {
  assert.equal(passportTrack("SK", "SK", "Slovakia")?.kind, "own");
  assert.equal(passportTrack("FR", "SK", "Slovakia")?.kind, "eu");
  // Switzerland: EU/EFTA citizens still apply for a permit for longer work.
  assert.match(passportTrack("FR", "CH", "Switzerland")!.points[0].text, /apply for a residence permit at your commune/);
  assert.doesNotMatch(JSON.stringify(passportTrack("FR", "CH", "Switzerland")), /without a visa or residence permit/);
  assert.match(JSON.stringify(passportTrack("UA", "PL", "Poland")), /biometric/);
  assert.match(JSON.stringify(passportTrack("US", "IE", "Ireland")), /Ireland's own visa list/);
  assert.equal(passportTrack("US", "DE", "Germany")?.kind, "easier");
  assert.equal(passportTrack("JP", "NL", "Netherlands")?.kind, "easier");
  assert.equal(passportTrack("IN", "DE", "Germany")?.kind, "standard");
  assert.equal(passportTrack("RU", "EE", "Estonia")?.kind, "harder");
  assert.equal(passportTrack("RU", "FR", "France")?.kind, "harder");
  assert.equal(passportTrack("BY", "LT", "Lithuania")?.kind, "harder");
  assert.equal(passportTrack("BY", "FR", "France")?.kind, "standard");
  for (const track of [passportTrack("US", "DE", "Germany"), passportTrack("RU", "PL", "Poland")]) {
    for (const point of track!.points) for (const source of point.sources) assert.match(source.url, /^https:\/\//);
  }
});

test("Russian and Belarusian restrictions reach the routes, from official sources only", () => {
  const notes = russiaBelarusNotes("RU", "EE");
  assert.ok(notes.some((item) => item.id === "ru-ee-no-visas"));
  for (const item of [...notes, ...russiaBelarusNotes("RU", "FI"), ...russiaBelarusNotes("BY", "LT")]) {
    assert.ok(item.sources.length > 0, item.id);
    // No fees or processing times: those figures date from 2022.
    assert.doesNotMatch(item.description, /€|EUR\s?\d/);
  }
  const stage = citizenshipStage("RU", "CZ", "Czechia", "work")!;
  assert.ok(stage.stage.tasks.some((task) => task.id === "ru-cz-biometric-ru"));
  const resident = citizenshipStage("RU", "CZ", "Czechia", "work", { existingResident: true })!;
  assert.ok(!resident.stage.tasks.some((task) => task.id.startsWith("ru-eu-short-stay")));
  assert.equal(russiaBelarusNotes("UA", "EE").length, 0);
});

test("the home map links to country pages and the light list stays light", () => {
  const map = readFileSync(join(root, "src/components/EuropeMap.tsx"), "utf8");
  assert.match(map, /from "@\/lib\/country-list"/);
  assert.doesNotMatch(map, /from "@\/lib\/countries"/);
  const list = readFileSync(join(root, "src/lib/country-list.ts"), "utf8");
  assert.doesNotMatch(list, /universities\.json|verified-programs|pending-programs/);
});
