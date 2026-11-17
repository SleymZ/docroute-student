// Real site screens for the hooks series: tall phone-width screenshots,
// one per page and language. Needs the site on BASE (default a local
// `next start` on :3100) and google-chrome with puppeteer-core.
// node marketing/hooks/capture.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let puppeteer;
for (const p of ["puppeteer-core", "/opt/npm-tools/node_modules/puppeteer-core"]) { try { puppeteer = require(p); break; } catch {} }
const BASE = process.env.BASE ?? "http://localhost:3100";
const pages = {
  entry: "/",
  deadlines: "/deadlines",
  home: "/home",
  work: "/route/work?citizenship=IN&residenceStatus=non-eu-passport-no-residence&offer=yes&skGraduate=no&blueCard=yes&shortage=no",
  india: "/route/guide?country=CZ&purpose=family&citizenship=IN",
};
// Boxes the videos zoom into, found by English text; the same element path
// is reused for the other language, since the pages share their structure.
const targets = {
  entry: { purposes: ["Single permit and EU Blue Card in Slovakia", "ul"] },
  deadlines: { stats: ["first deadline", "dl,div:has(> div)"], card: ["Comenius University Bratislava", "li,article"] },
  home: { soonest: ["Applications that close soonest", "section"] },
  work: { hero: ["Working in Slovakia", "header,section,div"], visa: ["need a visa to enter Slovakia", "li,article"], stages: ["Work authorisation", "ol"] },
  india: { visa: ["need a visa to enter Czechia", "li,article"], title: ["Joining family in Czechia", "header,section,div"] },
};
const marks = {};
const paths = {};
fs.mkdirSync(path.join(here, "shots"), { recursive: true });
const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox", "--hide-scrollbars", "--disable-background-networking"] });
for (const lang of ["en", "hi"]) {
  for (const [name, url] of Object.entries(pages)) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2, isMobile: true });
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
    await page.evaluateOnNewDocument(() => localStorage.setItem("docroute-cookie-consent", "necessary"));
    await page.setCookie({ name: "docroute-lang", value: lang, url: BASE });
    await page.goto(BASE + url, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 3500));
    await page.screenshot({ path: path.join(here, "shots", `${name}-${lang}.png`), fullPage: true });
    for (const [key, [text, closest]] of Object.entries(targets[name] ?? {})) {
      const id = `${name}-${key}`;
      const found = await page.evaluate(({ text, closest, known }) => {
        const pathOf = (el) => { const parts = []; while (el && el !== document.body) { const p = el.parentElement; parts.unshift(`${el.tagName}:${[...p.children].indexOf(el)}`); el = p; } return parts.join(">"); };
        const byPath = (pth) => { let el = document.body; for (const part of pth.split(">")) { const [, i] = part.split(":"); el = el?.children[Number(i)]; } return el; };
        let el = known ? byPath(known) : null;
        if (!el) {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let node; while ((node = walker.nextNode())) { if (node.textContent.includes(text)) { el = node.parentElement; break; } }
          if (el) el = el.closest(closest) ?? el;
        }
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { path: pathOf(el), box: [r.left + scrollX, r.top + scrollY, r.width, r.height].map((v) => Math.round(v * 2)) };
      }, { text, closest, known: paths[id] ?? null });
      if (!found) { console.warn("missing", id, lang); continue; }
      paths[id] ??= found.path;
      (marks[`${name}-${lang}`] ??= {})[key] = found.box;
    }
    console.log(name, lang);
    await ctx.close();
  }
}
fs.writeFileSync(path.join(here, "shots", "marks.json"), JSON.stringify(marks, null, 1));
await browser.close();
