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
  // Rendered per request since the site has languages (2026-11-05): the
  // cookie or the browser decides the language of the first visit too.
  assert.doesNotMatch(entry, /force-static/);
  const home = read("src/app/home/page.tsx");
  assert.match(home, /<RoutePlanner\s+initialDocumentCountry=\{initialDocumentCountry\}/);
  // The numbers strip stands under the map on wide screens (2026-11-18).
  assert.match(home, /mapFooter=\{<HomeProof placement="hero" today=\{getAdmissionDate\(\)\} \/>\}/);
  assert.match(read("src/app/home/loading.tsx"), /<RouteLoader/);
});

test("the entry page: next deadline, start button, deadlines, purpose links and log in", () => {
  const screen = read("src/components/EntryScreen.tsx");
  // Owner decision 2026-11-17: free redesign of the content; still no site
  // navigation, logo and map unchanged.
  assert.doesNotMatch(screen, /<Header|AuthNavigation|\/explore|\/stories/);
  assert.match(screen, /upcomingFacultyDeadlines\(verifiedPrograms, getAdmissionDate\(\)\)/);
  assert.match(screen, /<EnterButton \/>/);
  assert.match(screen, /href="\/deadlines"/);
  assert.match(screen, /href=\{`\/home\?purpose=\$\{purpose\}#route-builder`\}/);
  assert.match(screen, /className=\{styles\.map\}/);
  assert.match(screen, /<LogoMark size=\{56\}/);
  assert.match(read("src/components/EntryActions.tsx"), /Start your journey/);
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
  assert.match(logo, /Doc<span style=\{\{ color: BRAND_COLOR \}\} translate="no">Route<\/span>/);
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

test("a sign-in code that lands on the bare domain finishes the sign-in", () => {
  const proxy = read("src/proxy.ts");
  assert.match(proxy, /\(pathname === "\/" \|\| pathname === "\/home"\) && searchParams\.has\("code"\)/);
  assert.match(proxy, /url\.pathname = "\/auth\/callback"/);
  // Before the first-visit redirect, so the code is not lost on the way to /home.
  assert.ok(proxy.indexOf('url.pathname = "/auth/callback"') < proxy.indexOf('url.pathname = "/home"'));
});

test("home says who it is for and offers the deadlines without an account", () => {
  const planner = read("src/components/RoutePlanner.tsx");
  assert.match(planner, /Applying to a university in Slovakia, Czechia, the Netherlands,\s+Austria or Germany from outside the EU\?/);
  assert.match(planner, /<Link href="\/deadlines" className="hero-deadlines-link">/);
});

test("Documents issued in starts from the visitor's country, never a fixed one", () => {
  const planner = read("src/components/RoutePlanner.tsx");
  assert.doesNotMatch(planner, /useState\("IL"\)/);
  assert.match(planner, /useState\(initialDocumentCountry\)/);
  const home = read("src/app/home/page.tsx");
  assert.match(home, /x-vercel-ip-country/);
  // Only a code from the picker's own list is used.
  assert.match(home, /applicantCountryOptions\.some\(\(option\) => option\.code === code\)/);
});

test("the new home text is translated in every site language", () => {
  const keys = [
    "Applying to a university in Slovakia, Czechia, the Netherlands, Austria or Germany from outside the EU? See which documents you need and the deadline for each one, from the application to the residence permit. Every rule links to its official source. Free.",
    "See every verified 2027/28 application deadline, no account needed →",
  ];
  for (const lang of ["ru", "es", "zh", "hi"]) {
    const catalog = JSON.parse(read(`src/i18n/catalogs/${lang}.json`));
    for (const key of keys) assert.ok(catalog[key], `${lang}: ${key.slice(0, 30)}`);
  }
});

test("home shows the soonest verified deadlines and facts from the residence data", () => {
  const page = read("src/app/home/page.tsx");
  assert.match(page, /<HomeSections today=\{getAdmissionDate\(\)\} locale=\{locale\} \/>/);
  const sections = read("src/components/home/HomeSections.tsx");
  assert.match(sections, /upcomingFacultyDeadlines\(verifiedPrograms, today\)/);
  assert.match(sections, /slovakiaResidenceRules\.processingTimeDays/);
  assert.match(sections, /czechiaResidenceRules\.study\.processingDays/);
  assert.match(sections, /href="#route-builder"/);
  for (const locale of ["ru", "es", "zh", "hi"]) {
    const catalog = JSON.parse(read(`src/i18n/catalogs/${locale}.json`));
    for (const key of ["Applications that close soonest", "Four stages, in the order they happen", "Start with the deadline you cannot miss"]) {
      assert.ok(catalog[key], `${locale}: ${key}`);
    }
  }
});
