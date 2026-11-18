import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  browserStorageItems,
  legalInfo,
  legalPages,
} from "../src/data/legal";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  parseCookieConsent,
} from "../src/lib/cookie-consent";
import { THEME_STORAGE_KEY } from "../src/lib/theme";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("every legal page linked from the footer exists", () => {
  for (const page of legalPages) {
    assert.ok(
      existsSync(join(root, "src/app", page.href, "page.tsx")),
      `${page.href} has no page`,
    );
  }
});

test("the footer and cookie notice are on every page", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /<SiteFooter \/>/);
  assert.match(layout, /<CookieNotice \/>/);
});

test("the cookie policy lists every key DocRoute stores in the browser", () => {
  const names = browserStorageItems.map((item) => item.name).join("\n");
  assert.ok(names.includes(THEME_STORAGE_KEY));
  assert.ok(names.includes(COOKIE_CONSENT_STORAGE_KEY));
  assert.ok(names.includes("docroute:saved-universities"));
  assert.ok(names.includes("docroute:route-progress"));
  assert.ok(names.includes("auth-token"));

  // Guest storage namespaces in the code must be the ones listed.
  const keyBuilder = read("src/hooks/usePersistentUserSet.ts");
  assert.match(keyBuilder, /`docroute:\$\{namespace\}:v1:/);
  for (const hook of ["useRouteProgress", "useSavedUniversities"]) {
    const namespace = read(`src/hooks/${hook}.ts`).match(
      /namespace: "([^"]+)"/,
    )?.[1];
    assert.ok(namespace, `${hook} has a namespace`);
    assert.ok(names.includes(`docroute:${namespace}`), namespace);
  }
});

test("no analytics or tracking script is loaded", () => {
  const packageJson = read("package.json");
  for (const tracker of [
    "@vercel/analytics",
    "react-ga",
    "posthog",
    "mixpanel",
    "@sentry",
    "hotjar",
  ]) {
    assert.ok(!packageJson.includes(tracker), `${tracker} needs consent`);
  }
  assert.ok(!read("src/app/layout.tsx").includes("googletagmanager"));
});

test("the beta stays free until terms for payment exist", () => {
  assert.equal(legalInfo.isCommercial, false);
  assert.match(read("src/app/terms/page.tsx"), /not legal advice/);
  assert.match(read("src/app/terms/page.tsx"), /586\/2003/);
});

test("account deletion is limited to the signed-in person", () => {
  const sql = read("supabase/migrations/20261028150000_delete_my_account.sql");
  assert.match(sql, /auth\.uid\(\)/);
  assert.match(sql, /security definer/);
  assert.match(sql, /set search_path = ''/);
  assert.match(sql, /revoke all on function public\.delete_my_account\(\) from anon/);
  assert.match(sql, /grant execute on function public\.delete_my_account\(\) to authenticated/);
});

test("only the two known cookie choices are accepted", () => {
  assert.equal(parseCookieConsent("all"), "all");
  assert.equal(parseCookieConsent("necessary"), "necessary");
  assert.equal(parseCookieConsent("yes"), null);
  assert.equal(parseCookieConsent(null), null);
});

test("the operator stays unnamed while the beta is free", () => {
  assert.equal(legalInfo.isCommercial, false);
  assert.ok(!("operatorName" in legalInfo));
  for (const page of ["terms", "privacy", "cookies"]) {
    assert.ok(!read(`src/app/${page}/page.tsx`).includes("[OWNER"));
  }
});

test("people reach the operator by the private mailbox, not public GitHub issues", async () => {
  const { contact, legalInfo } = await import("../src/data/legal");
  assert.equal(legalInfo.contactEmail, "docroutestu@gmail.com");
  assert.equal(contact.href, "mailto:docroutestu@gmail.com");
  assert.ok(contact.isEmail);
});

test("on phones the cookie banner is one short line with the same facts and equal buttons", () => {
  const notice = readFileSync(join(root, "src/components/CookieNotice.tsx"), "utf8");
  assert.match(notice, /className=\{styles\.short\}[\s\S]*Necessary cookies only; &ldquo;Accept all&rdquo; adds anonymous\s+statistics without cookies\. No ads\./);
  assert.match(notice, /Necessary only[\s\S]*Accept all/);
  const css = readFileSync(join(root, "src/components/CookieNotice.module.css"), "utf8");
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.text \.long \{\s*display: none;/);
});

test("on phones the sign-up form comes before the story panel", () => {
  const css = readFileSync(join(root, "src/components/AuthScreen.module.css"), "utf8");
  assert.match(css, /@media \(max-width: 900px\) \{[\s\S]*?\.authPanel \{\s*order: -1;/);
  assert.match(css, /@media \(max-width: 900px\) \{[\s\S]*?\.mobileBrand \{\s*display: inline-flex;/);
  // The hidden story header held the theme switch and the way back: on phones
  // they move into the bar above the form.
  const screen = readFileSync(join(root, "src/components/AuthScreen.tsx"), "utf8");
  assert.match(screen, /className=\{styles\.mobileBar\}[\s\S]*?Back to homepage[\s\S]*?<ThemeToggle \/>/);
});

test("the 'building a route needs an account' hint is readable on the light sign-up paper in both themes", () => {
  const css = readFileSync(join(root, "src/components/AuthScreen.module.css"), "utf8");
  const hint = css.match(/\.routeHint \{([\s\S]*?)\}/)![1];
  assert.match(hint, /color: var\(--ink\);/);
  assert.doesNotMatch(hint, /#f5f3ee/);
});

test("the short phone cookie text is translated in every site language", async () => {
  const key = "Necessary cookies only; “Accept all” adds anonymous statistics without cookies. No ads. <0/>";
  for (const lang of ["ru", "es", "zh", "hi"]) {
    const catalog = JSON.parse(readFileSync(join(root, `src/i18n/catalogs/${lang}.json`), "utf8"));
    assert.ok(catalog[key], lang);
    assert.ok(catalog["Details"], lang);
  }
});

test("the contact page puts the email first, then Instagram and TikTok", () => {
  const page = read("src/app/contact/page.tsx");
  assert.match(page, /href=\{contact\.href\}/);
  assert.ok(page.indexOf("contact.href") < page.indexOf("socialLinks.map"));
  const legal = read("src/data/legal.ts");
  assert.match(legal, /https:\/\/www\.instagram\.com\/docroute_en\//);
  assert.match(legal, /https:\/\/www\.tiktok\.com\/@docrouteen/);
  assert.match(read("src/components/Header.tsx"), /href: "\/contact"/);
  assert.match(read("src/components/SiteFooter.tsx"), /<Link href="\/contact">Contact<\/Link>/);
  assert.match(read("src/app/sitemap.ts"), /"\/contact"/);
});
