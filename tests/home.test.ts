import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

function sourceFiles(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = `${dir}/${name}`;
    if (statSync(join(root, path)).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

test("the site address opens the entry page, the full site lives at /home", () => {
  const entry = read("src/app/page.tsx");
  assert.match(entry, /<EntryScreen \/>/);
  assert.match(entry, /force-static/);
  assert.match(read("src/app/home/page.tsx"), /<RoutePlanner \/>/);
  assert.match(read("src/app/home/loading.tsx"), /<RouteLoader/);
});

test("the entry page has only the start button and log in, no site navigation", () => {
  const screen = read("src/components/EntryScreen.tsx");
  assert.doesNotMatch(screen, /<Header|AuthNavigation|\/explore|\/stories/);
  assert.match(screen, /Start your journey/);
  assert.match(screen, /Your move to Europe, one route\./);
  const actions = read("src/components/EntryActions.tsx");
  assert.match(actions, /const SITE_PATH = "\/home";/);
  assert.match(actions, /href=\{SITE_PATH\}/);
  assert.match(actions, /\/auth\?mode=login&next=\$\{SITE_PATH\}/);
  // reduced motion opens the site at once
  assert.match(actions, /prefers-reduced-motion: reduce/);
});

test("links to the route builder point to the full site", () => {
  for (const file of sourceFiles("src")) {
    const code = read(file);
    assert.doesNotMatch(code, /href=["{`]+\/#route-builder/, file);
    assert.doesNotMatch(code, /href=\{?[`"]\/\?purpose=/, file);
  }
  assert.match(read("src/components/Header.tsx"), /href="\/home"\s+className=\{styles\.brand\}/);
});

test("the main navigation has no Build route or Residence routes", () => {
  const header = read("src/components/Header.tsx");
  assert.doesNotMatch(header, /label: "Build route"/);
  assert.doesNotMatch(header, /label: "Residence routes"/);
  assert.match(header, /label: "Stories"/);
});

test("the entry map uses the coarse atlas and handles countries across 180°", () => {
  const map = read("src/lib/landing-map.ts");
  assert.match(map, /world-atlas\/countries-110m\.json/);
  assert.match(map, /wraps: west > east/);
  assert.match(map, /lon >= item\.west - 0\.1 \|\| lon <= item\.east \+ 0\.1/);
});
