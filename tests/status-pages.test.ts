import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (file: string) => readFileSync(join(root, file), "utf8");

test("unknown addresses get a DocRoute 404 page with the header and ways back", () => {
  const page = read("src/app/not-found.tsx");
  assert.match(page, /StatusPage/);
  assert.match(page, /title: "Page not found"/);
  const frame = read("src/components/StatusPage.tsx");
  assert.match(frame, /<Header \/>/);
  for (const href of ["/home", "/explore", "/countries"]) assert.match(frame, new RegExp(`href="${href}"`));
});

test("a crash inside a page shows the error page with Try again, not a blank screen", () => {
  const page = read("src/app/error.tsx");
  assert.match(page, /^"use client";/);
  assert.match(page, /retry\(\)/);
  assert.match(page, /StatusPage/);
});

test("the new screens are translated in every site language", () => {
  for (const lang of ["ru", "es", "zh", "hi"]) {
    const catalog = JSON.parse(read(`src/i18n/catalogs/${lang}.json`));
    for (const key of ["Page not found", "Something went wrong", "Home page", "Where to go next"]) {
      assert.ok(catalog[key], `${lang}: ${key}`);
    }
  }
});
