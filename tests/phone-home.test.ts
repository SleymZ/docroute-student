import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("the phone home map is three small static masks in the same crop", () => {
  for (const file of ["phone-europe", "phone-listed", "phone-route"]) {
    const svg = read(`public/map/${file}.svg`);
    assert.match(svg, /viewBox="130 60 640 520"/, file);
    assert.ok(svg.length < 120_000, `${file} ${svg.length}`);
  }
  assert.match(read("src/components/home/PhoneHero.tsx"), /viewBox="130 60 640 520"/);
  // The map is not inlined into the page HTML.
  assert.doesNotMatch(read("src/components/home/PhoneHero.tsx"), /europe-map-paths/);
});

test("/home shows the phone hero and the country match teaser", () => {
  const page = read("src/app/home/page.tsx");
  assert.match(page, /<PhoneHero /);
  assert.match(page, /phone-hero-on/);
  assert.match(read("src/components/home/HomeSections.tsx"), /<PhoneMatchTeaser \/>/);
  assert.match(read("src/components/home/PhoneMatchTeaser.tsx"), /href="\/account\/match"/);
});
