import assert from "node:assert/strict";
import { test } from "node:test";

import { topFieldRequirements } from "../src/data/top-field-requirements";
import { topUniversities } from "../src/data/top-universities";
import { topAdmissionRequirements } from "../src/data/top-admission-requirements";

const fieldKeys = ["computer-science", "mathematics", "medicine", "law", "economics"];

// example.ac.uk keeps three labels; example.de or kit.edu keeps two.
function registrableDomain(name: string) {
  const labels = name.split(".");
  const keep = /\.(ac|co|org)\.uk$/.test(name) ? 3 : 2;
  return labels.slice(-keep).join(".");
}

// A university's other official domains (its listed website → also accepted).
const domainAliases: Record<string, string[]> = {
  "bham.ac.uk": ["birmingham.ac.uk"],
  "fau.de": ["fau.eu"],
};

function sameSite(itemHost: string, universityHost: string) {
  const item = registrableDomain(itemHost);
  const university = registrableDomain(universityHost);
  return item === university || (domainAliases[university] ?? []).includes(item);
}

test("field requirements belong to Top 100 universities and use known fields", () => {
  for (const [rank, fields] of Object.entries(topFieldRequirements)) {
    const university = topUniversities.find((item) => item.rank === Number(rank));
    assert.ok(university, `rank ${rank} is not in the Top 100`);
    for (const key of Object.keys(fields)) {
      assert.ok(fieldKeys.includes(key), `rank ${rank}: unknown field ${key}`);
    }
  }
});

test("every field entry is sourced from the university's own site or explains its absence", () => {
  for (const [rank, fields] of Object.entries(topFieldRequirements)) {
    const university = topUniversities.find((item) => item.rank === Number(rank))!;
    const host = new URL(university.website).hostname.replace(/^www\./, "");
    for (const [key, item] of Object.entries(fields)) {
      assert.match(item.checkedAt, /^\d{4}-\d{2}-\d{2}$/, `rank ${rank} ${key}: checkedAt`);
      if (item.url) {
        const url = new URL(item.url);
        assert.equal(url.protocol, "https:", `rank ${rank} ${key}: https`);
        assert.ok(item.requirements, `rank ${rank} ${key}: requirements text`);
        assert.ok(item.programme, `rank ${rank} ${key}: programme name`);
        // Compare registrable domains (study.ed.ac.uk → ed.ac.uk,
        // sle.kit.edu → kit.edu); Birmingham's site is birmingham.ac.uk.
        const itemHost = url.hostname;
        assert.ok(sameSite(itemHost, host), `rank ${rank} ${key}: ${itemHost} is not ${host}`);
      } else {
        assert.ok(item.note, `rank ${rank} ${key}: an entry without a link needs a note`);
      }
    }
  }
});

test("German Top 100 universities all have field requirements for the five fields", () => {
  const german = topUniversities.filter((item) => item.countryCode === "DE");
  assert.equal(german.length, 17);
  for (const university of german) {
    const fields = topFieldRequirements[university.rank];
    assert.ok(fields, `${university.name}: no field requirements`);
    for (const key of fieldKeys) {
      assert.ok(fields[key as keyof typeof fields], `${university.name}: missing ${key}`);
    }
  }
});

test("university-wide admission requirements cover the UK and German Top 100 and cite the university's site", () => {
  const covered = topUniversities.filter((item) => ["DE", "GB"].includes(item.countryCode));
  assert.equal(covered.length, 37);
  for (const university of covered) {
    const item = topAdmissionRequirements[university.rank];
    assert.ok(item, `${university.name}: no admission requirements`);
    for (const list of [item.applicationDocuments, item.entranceRequirements, item.afterAdmission]) {
      assert.ok(list.length > 0, `${university.name}: empty list`);
      for (const line of list) assert.ok(line.trim().length > 10, `${university.name}: short line`);
    }
    assert.ok(item.sources.length > 0, `${university.name}: no sources`);
    const host = new URL(university.website).hostname.replace(/^www\./, "");
    for (const source of item.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, "https:");
      assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(sameSite(url.hostname, host), `${university.name}: ${url.hostname} is not ${host}`);
    }
  }
  for (const rank of Object.keys(topAdmissionRequirements)) {
    assert.ok(topUniversities.some((item) => item.rank === Number(rank)), `rank ${rank} not in Top 100`);
  }
});
