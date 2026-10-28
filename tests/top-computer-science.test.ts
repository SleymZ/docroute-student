import assert from "node:assert/strict";
import { test } from "node:test";

import { topComputerScience } from "../src/data/top-computer-science";
import { topUniversities } from "../src/data/top-universities";

// The university's own domain, allowing a few known alternative domains.
const aliases: Record<string, string[]> = { "bham.ac.uk": ["birmingham.ac.uk"] };

test("every Top 100 university has a sourced computer science entry", () => {
  for (const university of topUniversities) {
    const entry = topComputerScience[university.rank];
    assert.ok(entry, `rank ${university.rank}`);
    assert.match(entry.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    if (!entry.url) {
      assert.ok(entry.note, `rank ${university.rank} needs a note when nothing was found`);
      continue;
    }
    assert.ok(entry.name);
    const host = new URL(entry.url).hostname;
    const base = new URL(university.website).hostname.replace(/^www\./, "");
    const allowed = [base, ...(aliases[base] ?? [])];
    assert.ok(
      allowed.some((domain) => host === domain || host.endsWith(`.${domain}`)),
      `${university.name}: ${host} is not on ${allowed.join(", ")}`,
    );
  }
});

test("UK and Irish programmes are marked as taught in English", () => {
  for (const university of topUniversities.filter((item) => ["GB", "IE"].includes(item.countryCode))) {
    const entry = topComputerScience[university.rank];
    if (entry.url) assert.equal(entry.language, "English", university.name);
  }
});
