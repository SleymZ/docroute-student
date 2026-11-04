import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("the home page opens with the start screen and the slogan", () => {
  const page = read("src/app/page.tsx");
  assert.ok(page.indexOf("<StartJourney />") < page.indexOf("<RoutePlanner />"));
  const intro = read("src/components/StartJourney.tsx");
  assert.match(intro, /Start your journey/);
  assert.match(intro, /Your move to Europe, <span>one route\.<\/span>/);
  assert.match(intro, /href="#route-builder"/);
  // one h1 on the page: the route builder's title is now an h2
  assert.match(intro, /<h1 /);
  assert.doesNotMatch(read("src/components/RoutePlanner.tsx"), /<h1>/);
});

test("the main navigation no longer has Build route or Residence routes", () => {
  const header = read("src/components/Header.tsx");
  assert.doesNotMatch(header, /label: "Build route"/);
  assert.doesNotMatch(header, /label: "Residence routes"/);
  assert.match(header, /label: "Stories"/);
});
