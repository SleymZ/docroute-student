import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.env.REPO_ROOT ?? process.cwd();

function dataText(): string {
  const parts: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith(".ts")) parts.push(readFileSync(path, "utf8"));
    }
  };
  walk(join(root, "src/data"));
  walk(join(root, "src/lib"));
  return parts.join("\n");
}

// Addresses the link check (scripts/check-links.mjs) found returning 404
// on 2026-11-08. Keep them out so they cannot come back by copy and paste.
const deadLinks = [
  "oesterreich.gv.at/de/themen/bauen_und_wohnen/umzug/2/1/Seite.180663",
  "BMBWF.gv.at/dam/jcr:2413c9f0-dbd0-466d-a7ce-7af765f16be1",
  "zulassung/non-eueea-with-little-german/",
  "informatik-bachelor-mit-aufnahmeverfahren/?L=0",
  "cs.uni-koeln.de/studium-lehre/studieninteressierte/bsc-informatik",
  "aubg.edu/apply/deadlines",
  "baag.uoa.gr/admissions/",
  "piani-di-studio-2026-27/curriculum-informatica-e-intelligenza-artificiale.html",
];

test("official links that went dead are replaced", () => {
  const text = dataText();
  for (const link of deadLinks) assert.ok(!text.includes(link), link);
});

test("AUBG deadlines follow the university's fall 2027 page", async () => {
  const { europePendingGroups } = await import("@/data/pending-programs-europe");
  const aubg = (europePendingGroups as readonly { universityHost: string; referenceRules?: { facts: { label: string; value: string }[] } }[]).find(
    (group) => group.universityHost === "aubg.bg",
  );
  assert.ok(aubg?.referenceRules);
  const deadline = aubg.referenceRules.facts.find((fact) => fact.label === "Application deadline")?.value ?? "";
  for (const date of ["15 January", "15 March", "15 May"]) assert.match(deadline, new RegExp(date));
});
