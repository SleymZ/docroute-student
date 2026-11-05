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
  assert.match(screen, /Start your <span className=\{styles\.accent\}>journey<\/span>/);
  // purpose tiles and facts are information, not more ways into the site
  assert.equal((screen.match(/<Link\b/g) ?? []).length, 1, "only the logo links");
  assert.match(read("src/components/EntryActions.tsx"), /Start your journey/);
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

test("the logo replaces the old route icon everywhere the brand is shown", () => {
  for (const file of [
    "src/components/Header.tsx",
    "src/components/EntryScreen.tsx",
    "src/components/AuthScreen.tsx",
    "src/components/UpdatePasswordScreen.tsx",
  ]) {
    assert.match(read(file), /<LogoMark /, file);
  }
  const logo = read("src/components/Logo.tsx");
  assert.match(logo, /export const BRAND_COLOR = "var\(--coral\)";/);
  // globe, Europe, plane and route from the style board, in site colours
  for (const part of ["logoRingPath", "logoEuropePath", "logoPlanePath", "logoSwooshPath"]) {
    assert.match(logo, new RegExp(`export const ${part}`), part);
  }
  assert.match(logo, /Doc<span style=\{\{ color: BRAND_COLOR \}\}>Route<\/span>/);
  const icon = read("src/app/icon.svg");
  assert.ok(icon.includes("#D4502F") && icon.includes("#FF795F"), "favicon in both corals");
  assert.ok(!/#FF7A00|#FF9F4D/i.test(icon), "no style-board orange in the favicon");
  const loader = read("src/components/RouteLoader.tsx");
  assert.match(loader, /logoEuropePath/);
  assert.match(loader, /logoPlanePath/);
});

test("the entry page opens only on the first visit and never for signed-in people", async () => {
  const proxy = read("src/proxy.ts");
  assert.match(proxy, /request\.nextUrl\.pathname === "\/"/);
  assert.match(proxy, /url\.pathname = "\/home"/);
  assert.match(proxy, /cookies\.includes\(VISITED_COOKIE\) \|\| hasAuthCookie\(cookies\)/);
  assert.match(proxy, /response\.cookies\.set\(VISITED_COOKIE/);
  const { hasAuthCookie, VISITED_COOKIE } = await import("../src/lib/visited");
  assert.equal(hasAuthCookie(["sb-abc-auth-token"]), true);
  assert.equal(hasAuthCookie(["sb-abc-auth-token.0", "sb-abc-auth-token.1"]), true);
  assert.equal(hasAuthCookie(["sb-abc-auth-token-code-verifier"]), false);
  assert.equal(hasAuthCookie([VISITED_COOKIE]), false);
  const { browserStorageItems } = await import("../src/data/legal");
  assert.ok(browserStorageItems.some((item) => item.name === VISITED_COOKIE));
});

test("the entry map highlights the same countries as the home map", () => {
  assert.match(read("src/lib/landing-map.ts"), /highlightedCountryIds\.has\(id\)/);
  assert.match(read("src/lib/europe-map.ts"), /from "@\/data\/highlighted-countries"/);
});

test("the destination is asked after 'Other country' and never hidden when it differs from the default", () => {
  const planner = read("src/components/RoutePlanner.tsx");
  assert.match(planner, /const defaultDestination = "Slovakia";/);
  assert.match(planner, /showDestination=\{documentCountry === "Other country" \|\| destination !== defaultDestination\}/);
  assert.match(planner, /setMapDestination\(defaultDestination\)/);
  assert.match(read("src/components/RouteForm.tsx"), /\{showDestination && \(/);
});
