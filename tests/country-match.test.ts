import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { lifestyleQuestions } from "../src/components/match/labels";
import {
  countryLifestyle,
  euCountryCodes,
  lifestyleSources,
  officialLanguages,
} from "../src/data/country-lifestyle";
import {
  lifestyleKeys,
  lifestyleOptions,
  matchLanguages,
  parseMatchAnswers,
  type MatchAnswers,
} from "../src/lib/country-match-answers";
import { computeCountryMatch, easeOfMove, lifestyleScore } from "../src/lib/country-match";
import { verifiedPrograms } from "../src/data/verified-programs";
import { countryPages } from "../src/lib/country-list";
import { isEuEeaSwiss } from "../src/lib/passport-track";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const neutral = {
  city: "both",
  winter: "ok",
  summer: "ok",
  budget: "comfortable",
  rhythm: "balanced",
  language: "either",
  people: "mix",
  safety: "less",
  jobs: "no",
} as const;

function answers(overrides: Record<string, unknown>): MatchAnswers {
  const parsed = parseMatchAnswers({
    purpose: "work",
    citizenship: "IN",
    education: "bachelor",
    languages: [{ code: "en", level: "fluent" }],
    work: { offerCountry: null },
    lifestyle: neutral,
    ...overrides,
  });
  assert.ok(parsed, JSON.stringify(overrides));
  return parsed;
}

test("the statistics cover all 27 EU countries and nothing else", () => {
  assert.equal(euCountryCodes.length, 27);
  assert.deepEqual(
    [...euCountryCodes].sort(),
    countryPages.map((country) => country.code).filter((code) => code !== "CH").sort(),
  );
  for (const code of euCountryCodes) {
    assert.ok(isEuEeaSwiss(code), code);
    assert.ok(officialLanguages[code].length > 0, code);
    for (const indicator of Object.keys(lifestyleSources) as Array<keyof typeof lifestyleSources>) {
      const value = countryLifestyle[code][indicator];
      // Eurostat publishes no job vacancy rate for Denmark.
      if (code === "DK" && indicator === "vacancies") assert.equal(value, null);
      else assert.equal(typeof value, "number", `${code} ${indicator}`);
    }
  }
  for (const source of Object.values(lifestyleSources)) {
    assert.match(source.url, /^https:\/\/ec\.europa\.eu\/eurostat\/databrowser\/view\/[a-z0-9_]+\/default\/table\?lang=en$/);
    assert.equal(source.authority, "official");
  }
  // Every official language can be chosen in the quiz.
  for (const languages of Object.values(officialLanguages)) {
    for (const code of languages) assert.ok(matchLanguages.some((language) => language.code === code), code);
  }
});

test("the quiz labels cover every lifestyle answer", () => {
  assert.deepEqual(lifestyleQuestions.map((question) => question.key), lifestyleKeys);
  for (const question of lifestyleQuestions) {
    assert.deepEqual(question.options.map((option) => option.value), [...lifestyleOptions[question.key]], question.key);
  }
});

test("answers from the database are checked before use", () => {
  assert.equal(parseMatchAnswers(null), null);
  assert.equal(parseMatchAnswers({ purpose: "tourism", citizenship: "IN", education: "bachelor", lifestyle: neutral }), null);
  assert.equal(parseMatchAnswers({ purpose: "work", citizenship: "QQ", education: "bachelor", lifestyle: neutral }), null);
  assert.equal(parseMatchAnswers({ purpose: "work", citizenship: "IN", education: "bachelor", lifestyle: { ...neutral, city: "x" } }), null);
  const parsed = answers({
    citizenship: "in",
    livesIn: "IN",
    residentWhereLives: true,
    languages: [{ code: "en", level: "fluent" }, { code: "en", level: "basic" }, { code: "xx", level: "good" }, { code: "de", level: "great" }],
    study: { field: "Medicine", english: true },
    family: { sponsorCountry: "AT", sponsorStatus: "citizen" },
  });
  assert.equal(parsed.citizenship, "IN");
  assert.deepEqual(parsed.languages, [{ code: "en", level: "fluent" }]);
  // A permit only counts where the person is not a citizen.
  assert.equal(parsed.residentWhereLives, false);
  // Only the section of the chosen purpose is kept.
  assert.equal(parsed.study, null);
  assert.equal(parsed.family, null);
  assert.deepEqual(parsed.work, { offerCountry: null });
});

test("three different EU countries, in the order easiest, lifestyle, all-round", () => {
  for (const citizenship of ["IN", "UA", "US", "DE", "RU", "NG"]) {
    for (const purpose of ["study", "work", "family", "business"] as const) {
      const result = computeCountryMatch(
        answers({ citizenship, purpose, study: { field: "other", english: true }, family: { sponsorCountry: null, sponsorStatus: "unsure" }, business: { kind: "company" } }),
      );
      assert.deepEqual(result.picks.map((pick) => pick.role), ["easiest", "lifestyle", "overall"], `${citizenship} ${purpose}`);
      assert.equal(new Set(result.picks.map((pick) => pick.code)).size, 3);
      for (const pick of result.picks) {
        assert.ok((euCountryCodes as readonly string[]).includes(pick.code), pick.code);
        assert.notEqual(pick.code, citizenship);
        assert.ok(pick.route.href.startsWith("/"), pick.route.href);
        assert.equal(pick.countryHref, `/countries/${pick.code.toLowerCase()}`);
        for (const reason of pick.lifestyleReasons) {
          // Only statistics where the country is in the best third.
          assert.ok(reason.rank >= 1 && reason.rank <= 9);
          assert.match(reason.source.url, /eurostat/);
        }
      }
    }
  }
});

test("an EU citizen is never sent to their own country and moves freely", () => {
  const result = computeCountryMatch(answers({ citizenship: "IT", languages: [{ code: "it", level: "fluent" }] }));
  assert.equal(result.ownCountry, "IT");
  assert.ok(!result.picks.some((pick) => pick.code === "IT"));
  assert.equal(result.picks[0].track, "eu");
  assert.equal(result.picks[0].easeFactors[0].kind, "free-movement");
});

test("countries that stopped visas for the passport are left out, with the reason", () => {
  const result = computeCountryMatch(answers({ citizenship: "RU", languages: [{ code: "ru", level: "fluent" }] }));
  const excluded = result.excluded.map((item) => item.code).sort();
  assert.deepEqual(excluded, ["CZ", "EE", "LT"]);
  for (const item of result.excluded) {
    assert.ok(item.title.length > 10);
    assert.ok(item.sources.length > 0);
  }
  assert.ok(!result.picks.some((pick) => excluded.includes(pick.code)));
});

test("family: the country where the family member lives comes first, even with restrictions", () => {
  const plain = computeCountryMatch(answers({ purpose: "family", family: { sponsorCountry: "PT", sponsorStatus: "citizen" } }));
  assert.equal(plain.picks[0].code, "PT");
  assert.equal(plain.picks[0].easeFactors[0].kind, "family-there");
  assert.equal(plain.familyOutsideEu, false);

  // Czechia accepts family reunification from Russian citizens.
  const russian = computeCountryMatch(
    answers({ citizenship: "RU", purpose: "family", family: { sponsorCountry: "CZ", sponsorStatus: "resident" } }),
  );
  assert.equal(russian.picks[0].code, "CZ");
  assert.ok(russian.picks[0].easeFactors.some((factor) => factor.kind === "family-exception"));
  assert.ok(!russian.excluded.some((item) => item.code === "CZ"));

  // Only where the official exceptions name the family member's status.
  const lithuania = computeCountryMatch(
    answers({ citizenship: "RU", purpose: "family", family: { sponsorCountry: "LT", sponsorStatus: "resident" } }),
  );
  assert.ok(lithuania.excluded.some((item) => item.code === "LT"));
  assert.ok(!lithuania.picks.some((pick) => pick.code === "LT"));
  const estonia = (sponsorStatus: string) =>
    computeCountryMatch(answers({ citizenship: "RU", purpose: "family", family: { sponsorCountry: "EE", sponsorStatus } }));
  assert.equal(estonia("citizen").picks[0].code, "EE");
  assert.ok(estonia("resident").excluded.some((item) => item.code === "EE"));
  assert.ok(estonia("unsure").excluded.some((item) => item.code === "EE"));

  const outside = computeCountryMatch(answers({ purpose: "family", family: { sponsorCountry: null, sponsorStatus: "unsure" } }));
  assert.equal(outside.familyOutsideEu, true);
});

test("work: a job offer decides the easiest country; the Blue Card is not counted in Denmark or Ireland", () => {
  const result = computeCountryMatch(answers({ work: { offerCountry: "NL" } }));
  assert.equal(result.picks[0].code, "NL");
  assert.equal(result.picks[0].easeFactors[0].kind, "job-offer");
  const kinds = (code: "DK" | "IE" | "AT") => easeOfMove(answers({}), code).factors.map((factor) => factor.kind);
  assert.ok(!kinds("DK").includes("blue-card"));
  assert.ok(!kinds("IE").includes("blue-card"));
  assert.ok(kinds("AT").includes("blue-card"));
  // Without a degree the Blue Card is not mentioned.
  assert.ok(!easeOfMove(answers({ education: "secondary" }), "AT").factors.some((factor) => factor.kind === "blue-card"));
});

test("study: checked programmes count only for the next degree and the chosen field", () => {
  const bachelor = computeCountryMatch(
    answers({ purpose: "study", education: "secondary", study: { field: "Medicine", english: true } }),
  );
  const first = bachelor.picks[0];
  assert.ok(["SK", "CZ"].includes(first.code), first.code);
  const programmes = first.easeFactors.find((factor) => factor.kind === "verified-programmes");
  assert.ok(programmes && programmes.kind === "verified-programmes" && programmes.english && programmes.count > 0);
  assert.equal(first.route.href, `/explore/universities?country=${first.code}&program=Medicine`);

  // An EU citizen: the country with the most checked programmes in English comes first.
  const italian = computeCountryMatch(
    answers({ citizenship: "IT", purpose: "study", education: "secondary", study: { field: "Medicine", english: true } }),
  );
  const englishMedicine = (code: string) =>
    verifiedPrograms.filter(
      (program) =>
        program.countryCode === code &&
        program.category === "Medicine" &&
        program.instructionLanguages.some((language) => language.code === "en"),
    ).length;
  const leader = ["SK", "CZ"].sort((a, b) => englishMedicine(b) - englishMedicine(a))[0];
  if (englishMedicine("SK") !== englishMedicine("CZ")) assert.equal(italian.picks[0].code, leader);

  // "Something else" is not matched with programmes of other fields.
  const other = computeCountryMatch(answers({ purpose: "study", education: "secondary", study: { field: "other", english: true } }));
  for (const pick of other.picks) {
    assert.ok(!pick.easeFactors.some((factor) => factor.kind === "verified-programmes"), pick.code);
    assert.ok(!pick.route.href.startsWith("/explore/"), pick.route.href);
  }

  const master = computeCountryMatch(answers({ purpose: "study", education: "bachelor", study: { field: "Medicine", english: true } }));
  for (const pick of master.picks) {
    assert.ok(!pick.easeFactors.some((factor) => factor.kind === "verified-programmes"), pick.code);
  }
});

test("lifestyle: the pick follows the person's answers and Eurostat, not the passport", () => {
  const warmAndCheap = answers({ lifestyle: { ...neutral, winter: "mild", summer: "hot", budget: "tight" } });
  const result = computeCountryMatch(warmAndCheap);
  const pick = result.picks[1];
  const others = euCountryCodes.filter((code) => code !== result.picks[0].code);
  const best = Math.max(...others.map((code) => lifestyleScore(warmAndCheap, code)));
  assert.equal(lifestyleScore(warmAndCheap, pick.code), best);
  assert.ok(countryLifestyle[pick.code].prices! < 100, pick.code);
  assert.ok(countryLifestyle[pick.code].cold! < 2500, pick.code);
  assert.ok(pick.lifestyleReasons.length > 0);

  const coldAndQuiet = answers({ lifestyle: { ...neutral, winter: "love", summer: "cool", city: "quiet" } });
  const nordic = computeCountryMatch(coldAndQuiet).picks[1];
  assert.ok(countryLifestyle[nordic.code].cold! > 3000, nordic.code);
});

test("speaking an official language makes a country easier", () => {
  const withGerman = easeOfMove(answers({ languages: [{ code: "de", level: "good" }] }), "AT");
  const without = easeOfMove(answers({ languages: [{ code: "de", level: "basic" }] }), "AT");
  assert.ok(withGerman.score > without.score);
  assert.ok(withGerman.factors.some((factor) => factor.kind === "speaks-language"));
});

test("Ukrainian citizens see the EU temporary protection note", () => {
  const result = computeCountryMatch(answers({ citizenship: "UA", languages: [{ code: "uk", level: "fluent" }] }));
  assert.equal(result.notes.length, 1);
  assert.match(result.notes[0].sources[0].url, /eur-lex\.europa\.eu/);
});

test("the quiz in the browser does not load the country data", () => {
  const quiz = read("src/components/match/CountryMatchQuiz.tsx");
  assert.match(quiz, /^"use client";/);
  assert.doesNotMatch(quiz, /@\/lib\/country-match"|verified-programs|country-lifestyle|russia-belarus/);
});

test("move profiles: one row per account, only for its owner, removed with the account", () => {
  const sql = read("supabase/migrations/20261121120000_move_profiles.sql");
  assert.match(sql, /user_id uuid primary key references auth\.users\(id\) on delete cascade/);
  assert.match(sql, /enable row level security/);
  assert.equal((sql.match(/\(select auth\.uid\(\)\) = user_id/g) ?? []).length, 5);
  assert.match(sql, /revoke all on table public\.move_profiles from anon;/);
  assert.match(sql, /check \(purpose in \('study', 'work', 'family', 'business'\)\)/);
  assert.match(sql.trim(), /notify pgrst, 'reload schema';$/);

  const exportCode = read("src/components/AccountDataControls.tsx");
  assert.match(exportCode, /from\("move_profiles"\)/);
  const privacy = read("src/app/privacy/page.tsx");
  assert.match(privacy, /Move profile \(country match\)/);
  assert.match(read("docs/ACCESS.md"), /\/account\/match/);
});
