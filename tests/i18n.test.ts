import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { LOCALES, localeFromAcceptLanguage, resolveLocale } from "../src/i18n/config";
import { buildCatalog, lookup, translateChildren, translateText } from "../src/i18n/translate";

const root = process.env.REPO_ROOT ?? process.cwd();

test("language: cookie first, then the browser's languages, else English", () => {
  assert.equal(localeFromAcceptLanguage("ru-RU,ru;q=0.9,en;q=0.8"), "ru");
  assert.equal(localeFromAcceptLanguage("de-DE,es;q=0.7,en;q=0.5"), "es");
  assert.equal(localeFromAcceptLanguage("zh-CN"), "zh");
  assert.equal(localeFromAcceptLanguage("hi-IN,en;q=0.9"), "hi");
  assert.equal(localeFromAcceptLanguage("fr-FR"), "en");
  assert.equal(localeFromAcceptLanguage(null), "en");
  assert.equal(resolveLocale("zh", "ru"), "zh");
  assert.equal(resolveLocale("xx", "ru"), "ru");
});

test("templates translate as a whole, with their parts translated too", () => {
  const catalog = buildCatalog("ru", {
    Countries: "Страны",
    Slovakia: "Словакия",
    "Universities in {0}": "Университеты: {0}",
    "{0} of {1} steps done": "Выполнено шагов: {0} из {1}",
    "Read the <0/> first.": "Сначала прочитайте <0/>.",
  });
  assert.equal(translateText(catalog, "Countries"), "Страны");
  assert.equal(translateText(catalog, "  Countries "), " Страны ");
  assert.equal(translateText(catalog, "Universities in Slovakia"), "Университеты: Словакия");
  assert.equal(translateText(catalog, "3 of 10 steps done"), "Выполнено шагов: 3 из 10");
  assert.equal(translateText(catalog, "Not in the catalog"), "Not in the catalog");
  assert.equal(translateText(null, "Countries"), "Countries");
  // English dates follow the language.
  assert.equal(lookup(catalog, "15 March 2027"), "15 марта 2027 г.");
  // A sentence around an inline element keeps the element.
  const link = { type: "a" };
  assert.deepEqual(translateChildren(catalog, ["Read the ", link, " first."]), ["Сначала прочитайте ", link, "."]);
  // Text and variables are joined before lookup.
  assert.equal(translateChildren(catalog, [3, " of ", 10, " steps done"]), "Выполнено шагов: 3 из 10");
});

test("catalogs keep every variable and element of the English text", () => {
  const slot = /\{\d+\}|<\d+\/>/g;
  for (const locale of LOCALES.filter((code) => code !== "en")) {
    const catalog = JSON.parse(readFileSync(join(root, "src/i18n/catalogs", `${locale}.json`), "utf8")) as Record<string, string>;
    for (const [key, value] of Object.entries(catalog)) {
      assert.deepEqual((value.match(slot) ?? []).sort(), (key.match(slot) ?? []).sort(), `${locale}: ${key}`);
    }
  }
});

test("the brand name and the account-deletion word are never translated", () => {
  for (const locale of LOCALES.filter((code) => code !== "en")) {
    const catalog = JSON.parse(readFileSync(join(root, "src/i18n/catalogs", `${locale}.json`), "utf8")) as Record<string, string>;
    for (const key of ["Doc", "Route", "DocRoute", "DELETE"]) assert.equal(catalog[key], undefined, `${locale}: ${key}`);
  }
});

test("joined sentences translate run by run, never half-way", () => {
  const catalog = buildCatalog("ru", {
    "Citizens of {0} need a visa to enter {1}": "Гражданам страны «{0}» нужна виза для въезда: {1}",
    "{0} is on the EU list (Annex I). Do not travel visa-free.": "{0} — в списке ЕС (Приложение I). Не въезжайте без визы.",
    China: "Китай",
    Germany: "Германия",
  });
  // Title + description, each a catalog entry: both translated.
  assert.equal(
    translateText(catalog, "Citizens of China need a visa to enter Germany. China is on the EU list (Annex I). Do not travel visa-free."),
    "Гражданам страны «Китай» нужна виза для въезда: Германия. Китай — в списке ЕС (Приложение I). Не въезжайте без визы.",
  );
  // A sentence without a translation: the whole text stays English, and the
  // title template does not swallow it as a variable.
  const english = "Citizens of China need a visa to enter Germany. Something not in the catalog.";
  assert.equal(translateText(catalog, english), english);
  const zh = buildCatalog("zh", { "Citizens of {0} need a visa to enter {1}": "{0}公民入境{1}需要签证", "Apply early.": "请尽早申请。" });
  assert.equal(translateText(zh, "Citizens of China need a visa to enter Germany. Apply early."), "China公民入境Germany需要签证。请尽早申请。");
});

test("a template variable is a name, number or date, not an English phrase", () => {
  const catalog = buildCatalog("ru", { "Before {0}": "До {0}", "Programmes at {0}": "Программы: {0}" });
  assert.equal(translateText(catalog, "Before 1 September 2027"), "До 1 сентября 2027 г.");
  assert.equal(translateText(catalog, "Before the entry visa expires"), "Before the entry visa expires");
  assert.equal(translateText(catalog, "Programmes at Faculty of Arts and Letters of the University"), "Программы: Faculty of Arts and Letters of the University");
});
