import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { applicantCountryOptions, citizenshipCountryOptions } from "@/data/applicant-countries";
import { plannerDestinationCodes } from "@/data/demo-destinations";
import catalog from "@/data/universities.json";
import { countryPages } from "@/lib/country-list";
import { flagSrc } from "@/lib/flags";

const root = process.env.REPO_ROOT ?? process.cwd();

function sourceFiles(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) sourceFiles(path, files);
    else if (/\.(ts|tsx|css)$/.test(name)) files.push(path);
  }
  return files;
}

test("flags are served by the site, never by a third-party flag host", () => {
  for (const file of sourceFiles(join(root, "src"))) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /flagcdn\.com/, file);
  }
  assert.equal(flagSrc("SK"), "/flags/sk.svg");
});

test("every country the site can show has a flag file", () => {
  const codes = new Set<string>([
    ...[...applicantCountryOptions, ...citizenshipCountryOptions].map((country) => country.code),
    ...catalog.universities.map((university: { countryCode: string }) => university.countryCode),
    ...Object.values(plannerDestinationCodes),
    ...countryPages.map((country) => country.code),
  ]);
  codes.delete("ZZ"); // "Other country" shows a globe icon
  const missing = [...codes].filter((code) => !existsSync(join(root, "public", flagSrc(code))));
  assert.deepEqual(missing, []);
  assert.ok(existsSync(join(root, "public/flags/LICENSE.txt")));
});
