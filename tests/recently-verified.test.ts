import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { recentlyVerified } from "@/data/recently-verified";
import { verifiedPrograms } from "@/data/verified-programs";
import { recentlyVerifiedCards } from "@/lib/recently-verified";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("the newly verified strip lists 3–5 real verified programmes, newest first", () => {
  assert.ok(recentlyVerified.length >= 3 && recentlyVerified.length <= 5);
  const ids = new Set(verifiedPrograms.map((program) => program.id));
  for (const entry of recentlyVerified) assert.ok(ids.has(entry.programId), entry.programId);
  const dates = recentlyVerified.map((entry) => entry.addedOn);
  assert.deepEqual([...dates].sort().reverse(), dates);
  assert.equal(new Set(recentlyVerified.map((entry) => entry.programId)).size, recentlyVerified.length);
});

test("each card opens its programme and shows the round still open", () => {
  const cards = recentlyVerifiedCards("2026-11-24");
  assert.equal(cards.length, recentlyVerified.length);
  const bratislava = cards.find((card) => card.id === "uniba-lf-medicine-en-2027")!;
  assert.equal(bratislava.deadline, "2027-02-21");
  assert.equal(bratislava.english, true);
  assert.match(bratislava.href, /^\/universities\/.+\?programId=uniba-lf-medicine-en-2027$/);
  // After the main deadline the later round is shown; after every round, none.
  assert.equal(recentlyVerifiedCards("2027-03-01").find((card) => card.id === bratislava.id)!.deadline, "2027-07-25");
  assert.equal(recentlyVerifiedCards("2027-12-01").find((card) => card.id === bratislava.id)!.deadline, null);
});

test("the strip is on the entry page and on /home", () => {
  assert.match(read("src/components/EntryScreen.tsx"), /<VerifiedTicker /);
  assert.match(read("src/app/home/page.tsx"), /<VerifiedTicker /);
});
