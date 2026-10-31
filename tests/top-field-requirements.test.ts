import assert from "node:assert/strict";
import { test } from "node:test";

import { topFieldRequirements } from "../src/data/top-field-requirements";
import { topUniversities } from "../src/data/top-universities";

const fieldKeys = ["computer-science", "mathematics", "medicine", "law", "economics"];

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
        // Compare registrable domains (e.g. study.ed.ac.uk → ed.ac.uk).
        // Birmingham's site is birmingham.ac.uk; its listed website is bham.ac.uk.
        const base = (name: string) => name.split(".").slice(-3).join(".");
        const itemHost = url.hostname;
        const sameSite =
          base(itemHost) === base(host) ||
          (host === "bham.ac.uk" && base(itemHost) === "birmingham.ac.uk");
        assert.ok(sameSite, `rank ${rank} ${key}: ${itemHost} is not ${host}`);
      } else {
        assert.ok(item.note, `rank ${rank} ${key}: an entry without a link needs a note`);
      }
    }
  }
});
