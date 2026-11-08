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
      assert.equal(route.coverage, ["AT", "CZ", "DE", "CH"].includes(code) ? "verified" : "official-links", `${code} ${purpose}`);
    }
  }
});

test("study summaries come from the same data as the routes", () => {
  const sk = countryStudy("SK");
  assert.ok(sk.universities > 10);
  assert.ok(sk.verified.some((item) => item.faculty.includes("FIIT")));
  assert.equal(sk.residence, "verified");
  assert.equal(countryStudy("DE").residence, "verified");
  assert.equal(countryStudy("CH").residence, "verified");
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

test("the route form offers every country page with a flag code; the map keeps its five", async () => {
  const { plannerDestinationOptions, plannerDestinationCodes, destinationOptions } = await import("../src/data/demo-destinations");
  assert.equal(plannerDestinationOptions.length, 28);
  assert.deepEqual(plannerDestinationOptions.slice(0, 3), ["Slovakia", "Czechia", "Austria"]);
  for (const name of plannerDestinationOptions) assert.match(plannerDestinationCodes[name] ?? "", /^[A-Z]{2}$/, name);
  assert.deepEqual([...destinationOptions], ["Slovakia", "Czechia", "Austria", "Romania", "Bulgaria"]);
  const planner = readFileSync(join(root, "src/components/RoutePlanner.tsx"), "utf8");
  assert.match(planner, /destination=\{mapDestination\}/);
});

test("Chinese passports get the China-specific steps of each verified country, from official sources only", () => {
  const ids = (country: string, name: string, purpose: "study" | "work" | "family" | "business") =>
    citizenshipStage("CN", country, name, purpose, { asOf: "2026-11-05" })!.stage.tasks.map((task) => task.id);
  assert.ok(ids("DE", "Germany", "study").includes("cn-de-aps-cn"));
  assert.ok(!ids("DE", "Germany", "work").includes("cn-de-aps-cn"));
  assert.ok(ids("AT", "Austria", "study").includes("cn-at-aps-cn"));
  assert.ok(ids("CH", "Switzerland", "study").includes("cn-ch-student-visa-cn"));
  assert.ok(ids("CZ", "Czechia", "family").includes("cn-cz-appointment-cn"));
  assert.ok(ids("SK", "Slovakia", "work").includes("cn-sk-employment-visa-cn"));
  // Visa required (EU Annex I) and the China-specific apostille note.
  const de = citizenshipStage("CN", "DE", "Germany", "study", { asOf: "2026-11-05" })!;
  assert.ok(de.stage.tasks.some((task) => task.id === "citizen-visa-cn"));
  assert.match(de.stage.tasks.find((task) => task.id === "citizen-documents-cn")!.title, /MFA/);
  for (const source of de.sources) assert.equal(source.authority, "official");
  // Already living there: the China-side steps are left out.
  const resident = citizenshipStage("CN", "DE", "Germany", "study", { existingResident: true, asOf: "2026-11-05" })!;
  // ...except the nationality law, which matters for naturalising later.
  assert.deepEqual(
    resident.stage.tasks.filter((task) => task.id.startsWith("cn-")).map((task) => task.id),
    ["cn-dual-nationality-cn"],
  );
  assert.ok(ids("CZ", "Czechia", "work").includes("cn-cz-appointment-work-cn"));
  // The country page shows them too; Hong Kong passports are not China's.
  const track = passportTrack("CN", "AT", "Austria")!;
  assert.ok(track.points.some((point) => point.text.startsWith("APS verification")));
  assert.ok(!(passportTrack("HK", "AT", "Austria")?.points ?? []).some((point) => point.text.includes("APS")));
  // Czech page keeps both the study/family and the employee-card guidance.
  const cz = passportTrack("CN", "CZ", "Czechia")!;
  assert.ok(cz.points.some((point) => point.text.includes("Student Facilitation Program")));
  assert.ok(cz.points.some((point) => point.text.includes("employee card")));
  assert.ok(track.points.some((point) => point.text.startsWith("China does not recognise dual nationality")));
  // No processing times in passport notes.
  for (const point of track.points) assert.doesNotMatch(point.text, /\d+\s?(–\d+\s?)?(days|weeks)\b(?! of)/);
});

test("every citizenship code has a fixed English name (no Intl in client lists)", async () => {
  const lists = await import("../src/data/citizenship-lists");
  const { REGION_NAMES } = await import("../src/data/region-names");
  for (const value of Object.values(lists)) {
    if (!Array.isArray(value)) continue;
    for (const code of value) if (typeof code === "string" && /^[A-Z]{2}$/.test(code)) assert.ok(REGION_NAMES[code], code);
  }
  for (const file of ["src/data/applicant-countries.ts", "src/data/citizenship-notes.ts"]) {
    assert.doesNotMatch(readFileSync(join(root, file), "utf8"), /Intl\.DisplayNames/, file);
  }
});

test("any country can be chosen: residence and education lists hold every country, citizenship every nationality", async () => {
  const { applicantCountryOptions, citizenshipCountryOptions } = await import("../src/data/applicant-countries");
  const { DEPENDENT_TERRITORIES, REGION_NAMES } = await import("../src/data/region-names");
  const places = new Set(applicantCountryOptions.map((country) => country.code));
  const citizenships = new Set(citizenshipCountryOptions.map((country) => country.code));
  for (const code of Object.keys(REGION_NAMES)) assert.ok(places.has(code), code);
  assert.ok(places.size >= 240, String(places.size));
  for (const code of ["RU", "BY", "IN", "CN", "IL", "UA", "KE", "PE", "XK", "PS", "HK", "TW", "ZZ"]) {
    assert.ok(citizenships.has(code), code);
  }
  for (const code of DEPENDENT_TERRITORIES) {
    assert.ok(places.has(code), code);
    assert.ok(!citizenships.has(code), code);
  }
  assert.equal(applicantCountryOptions.at(-1)?.code, "ZZ");
  assert.equal(new Set(applicantCountryOptions.map((country) => country.name)).size, applicantCountryOptions.length);
});

test("every country name is translated in every site language", async () => {
  const { applicantCountryOptions } = await import("../src/data/applicant-countries");
  for (const locale of ["ru", "es", "zh", "hi"]) {
    const catalog = JSON.parse(readFileSync(join(root, `src/i18n/catalogs/${locale}.json`), "utf8"));
    const missing = applicantCountryOptions.map((country) => country.name).filter((name) => !catalog[name]);
    assert.deepEqual(missing, [], locale);
  }
});

test("a territory is never read as a citizenship, from the form or the address", async () => {
  const { citizenshipFromUrl, isCitizenshipCode } = await import("../src/data/region-names");
  const { parseWorkProfile } = await import("../src/lib/work-profile");
  assert.ok(isCitizenshipCode("RU") && isCitizenshipCode("ZZ") && isCitizenshipCode("XK"));
  assert.ok(!isCitizenshipCode("GF") && !isCitizenshipCode("PR") && !isCitizenshipCode("XX"));
  assert.equal(citizenshipFromUrl("gf"), "");
  assert.equal(citizenshipFromUrl("by"), "BY");
  const work = (citizenship: string) =>
    parseWorkProfile(new URLSearchParams({ country: "SK", citizenship, residenceStatus: "non-eu-passport-no-residence", offer: "yes", skGraduate: "no", blueCard: "no", shortage: "no" }));
  assert.ok(work("IL"));
  assert.equal(work("GF"), null);
  const planner = readFileSync(join(root, "src/components/RoutePlanner.tsx"), "utf8");
  assert.doesNotMatch(planner, /const citizenship = knownCountry\(/);
});

test("red passport warnings: Czechia blocks Russian and Belarusian applications, every warning has an official source and is translated", async () => {
  const { passportWarnings, restrictedFor } = await import("../src/data/russia-belarus");
  for (const code of ["RU", "BY"]) {
    const [first] = passportWarnings(code, "CZ");
    assert.equal(first?.severity, "blocked", code);
    assert.match(first.title, /Czechia does not accept visa or residence applications/);
    assert.ok(first.solution, code);
    assert.ok(restrictedFor(code).includes("CZ"), code);
  }
  assert.match(passportWarnings("BY", "CZ")[0].solution ?? "", /Belarusian students/);
  // Already living in Czechia: no embassy barrier, the biometric passport rule stays.
  assert.deepEqual(passportWarnings("RU", "CZ", { existingResident: true }).map((item) => item.id), ["ru-cz-biometric"]);
  assert.deepEqual(passportWarnings("BY", "CZ", { existingResident: true }), []);
  assert.deepEqual(passportWarnings("RU", "EE", { existingResident: true }), []);
  assert.deepEqual(passportWarnings("RU", "SK"), []);
  assert.deepEqual(passportWarnings("IN", "CZ"), []);
  assert.ok(passportWarnings("RU", "EE").some((item) => item.severity === "blocked"));
  assert.ok(!passportWarnings("RU", "FI").some((item) => item.severity === "info"));
  const catalogs = ["ru", "es", "zh", "hi"].map((locale) => JSON.parse(readFileSync(join(root, `src/i18n/catalogs/${locale}.json`), "utf8")));
  for (const code of ["RU", "BY"]) {
    for (const country of ["CZ", "EE", "FI", "LV", "LT", "PL"]) {
      for (const item of passportWarnings(code, country)) {
        assert.ok(item.sources.length && item.sources.every((source) => source.authority === "official"), item.id);
        for (const text of [item.title, item.description, item.solution].filter(Boolean) as string[]) {
          for (const catalog of catalogs) assert.ok(catalog[text], text.slice(0, 60));
        }
      }
    }
  }
  for (const screen of ["CzechiaRouteScreen", "CountryGuideScreen", "FullPathScreen", "RoutePreviewScreen", "ApplicantProfileForm", "PassportTrackBlock"]) {
    assert.match(readFileSync(join(root, `src/components/${screen}.tsx`), "utf8"), /<PassportWarning /, screen);
  }
});

test("war and crisis passports: where to file Czech applications, from the ministry's district list", async () => {
  const { passportWarnings } = await import("../src/data/russia-belarus");
  const { czechEmbassyAbroad } = await import("../src/data/embassy-access");
  const { citizenshipStage } = await import("../src/data/citizenship-notes");
  const [af] = passportWarnings("AF", "CZ");
  assert.equal(af?.severity, "restricted");
  assert.match(af.title, /Islamabad, Pakistan/);
  assert.match(af.solution ?? "", /outside the Schengen area for at least 2 years/);
  assert.match(af.solution ?? "", /Dresden/);
  assert.match(passportWarnings("SY", "CZ")[0].title, /Beirut, Lebanon/);
  assert.match(passportWarnings("SD", "CZ")[0].title, /Cairo, Egypt/);
  assert.deepEqual(passportWarnings("AF", "SK"), []);
  assert.deepEqual(passportWarnings("VE", "CZ"), []); // may apply at any Czech embassy
  assert.deepEqual(passportWarnings("AF", "CZ", { existingResident: true }), []);
  assert.ok(citizenshipStage("AF", "CZ", "Czechia", "work")?.stage.tasks.some((task) => task.id.startsWith("af-cz-embassy-abroad")));
  const catalogs = ["ru", "es", "zh", "hi"].map((locale) => JSON.parse(readFileSync(join(root, `src/i18n/catalogs/${locale}.json`), "utf8")));
  for (const embassy of Object.values(czechEmbassyAbroad)) for (const catalog of catalogs) assert.ok(catalog[embassy], embassy);
});
test("every route says whose passport it is built for", () => {
  for (const screen of ["PurposeRouteScreen", "WorkRouteScreen", "CzechiaRouteScreen", "CountryGuideScreen", "FullPathScreen", "RoutePreviewScreen"]) {
    assert.match(readFileSync(join(root, `src/components/${screen}.tsx`), "utf8"), /<PassportBadge citizenship=/, screen);
  }
  for (const locale of ["ru", "es", "zh", "hi"]) {
    const catalog = JSON.parse(readFileSync(join(root, `src/i18n/catalogs/${locale}.json`), "utf8"));
    assert.ok(catalog["Route for citizens of {0}"]?.includes("{0}"), locale);
  }
});
