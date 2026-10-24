import assert from "node:assert/strict";
import { test } from "node:test";

import {
  THEME_STORAGE_KEY,
  oppositeTheme,
  readStoredTheme,
  resolveTheme,
  themeInitScript,
} from "../src/lib/theme";

function storage(value: string | null) {
  return { getItem: (key: string) => (key === THEME_STORAGE_KEY ? value : null) };
}

test("without a stored choice the theme follows the system", () => {
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(null, false), "light");
});

test("a stored choice wins over the system setting", () => {
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});

test("only valid stored values are used", () => {
  assert.equal(readStoredTheme(storage("light")), "light");
  assert.equal(readStoredTheme(storage("dark")), "dark");
  assert.equal(readStoredTheme(storage("blue")), null);
  assert.equal(readStoredTheme(storage(null)), null);
  assert.equal(
    readStoredTheme({
      getItem: () => {
        throw new Error("blocked");
      },
    }),
    null,
  );
});

test("toggle switches to the other theme", () => {
  assert.equal(oppositeTheme("dark"), "light");
  assert.equal(oppositeTheme("light"), "dark");
});

test("init script sets data-theme only for a stored choice", () => {
  const run = (stored: string | null) => {
    const root = { dataset: {} as Record<string, string> };
    const sandbox = {
      localStorage: storage(stored),
      document: { documentElement: root },
    };
    new Function("localStorage", "document", themeInitScript)(
      sandbox.localStorage,
      sandbox.document,
    );
    return root.dataset.theme;
  };

  assert.equal(run("light"), "light");
  assert.equal(run("dark"), "dark");
  assert.equal(run(null), undefined);
  assert.equal(run("purple"), undefined);
});
