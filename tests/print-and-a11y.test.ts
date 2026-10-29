import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("every route page can be saved as PDF with a source note", () => {
  for (const screen of ["RoutePreviewScreen", "WorkRouteScreen", "CzechiaRouteScreen"]) {
    const source = read(`src/components/${screen}.tsx`);
    assert.match(source, /<SaveRoutePdf /, screen);
    assert.match(source, /<PrintNote asOfDate=\{asOfDate\} \/>/, screen);
  }
});

test("printing hides site chrome and uses the light theme", () => {
  const css = read("src/app/globals.css");
  const print = css.slice(css.lastIndexOf("@media print"));
  assert.match(print, /color-scheme: light/);
  assert.match(print, /\[data-print-hide\]/);
  assert.match(read("src/components/Header.tsx"), /data-print-hide/);
  assert.match(read("src/components/WaitlistCta.tsx"), /data-print-hide/);
  assert.match(read("src/components/SiteFooter.module.css"), /@media print/);
  assert.match(read("src/components/CookieNotice.module.css"), /@media print/);
});

test("the university image role does not contain the credit links", () => {
  const source = read("src/components/UniversityImage.tsx");
  const roleAt = source.indexOf('role="img"');
  const creditAt = source.indexOf("{shouldShowCredit");
  assert.ok(roleAt > 0 && creditAt > roleAt);
  // The element with role="img" closes before the credit block starts.
  const between = source.slice(roleAt, creditAt);
  const opens = (between.match(/<div\b(?![^>]*\/>)/g) ?? []).length;
  const closes = (between.match(/<\/div>/g) ?? []).length;
  assert.ok(closes > opens, "credit is outside the image element");
});
