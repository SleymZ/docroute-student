// Real screenshots of the local site for the videos (light theme, phone).
// node marketing/notes/capture.mjs [base=http://localhost:3100]
// Run against a local `next build && next start` of the branch with /deadlines.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
let puppeteer;
for (const p of ["puppeteer-core", "/opt/npm-tools/node_modules/puppeteer-core"]) { try { puppeteer = require(p); break; } catch {} }
const here = path.dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] ?? "http://localhost:3100";
const shots = [
  ["deadlines", "/deadlines"],
  ["medicine", "/deadlines?field=medicine"],
  ["cs-sk", "/deadlines?country=sk&field=cs"],
  ["country-sk", "/countries/sk"],
];
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--proxy-server=direct://", "--proxy-bypass-list=*", "--disable-background-networking"] });
for (const lang of ["en", "ru"]) {
  for (const [name, url] of shots) {
    const p = await b.newPage();
    await p.setCookie({ name: "docroute-lang", value: lang, url: base }, { name: "docroute-visited", value: "1", url: base });
    await p.evaluateOnNewDocument(() => localStorage.setItem("docroute-cookie-consent", "necessary"));
    await p.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
    await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p.goto(base + url, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise(r => setTimeout(r, 600));
    await p.screenshot({ path: path.join(here, "shots", `${name}-${lang}.png`), fullPage: true });
    await p.close();
  }
}
await b.close();
console.log("ok");
