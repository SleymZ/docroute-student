import { createRequire } from "node:module"; const require = createRequire(import.meta.url); import fs from "node:fs";
const p = require("/opt/npm-tools/node_modules/puppeteer");
const b = await p.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
for (const lang of process.argv.slice(2)) {
  const pg = await b.newPage(); await pg.setViewport({ width: 390, height: 693, deviceScaleFactor: 2.77 });
  for (const [n, v] of [["docroute-visited", "1"], ["docroute-lang", lang]]) await pg.setCookie({ name: n, value: v, domain: "localhost", path: "/" });
  await pg.goto("http://localhost:3123/explore/top", { waitUntil: "networkidle0" });
  const r = await pg.evaluate(() => { const D = 2.77, R = e => { const q = e.getBoundingClientRect(); return [q.x * D, (q.y + scrollY) * D, q.width * D, q.height * D].map(Math.round); };
    const row = name => { let e = [...document.querySelectorAll("*")].find(x => x.children.length === 0 && x.textContent.trim() === name); while (e && e.getBoundingClientRect().width < 320) e = e.parentElement; return R(e); };
    return { ucl: row("University College London"), oxford: row("University of Oxford"), cambridge: row("University of Cambridge") }; });
  const f = new URL(`./shots/${lang}/rects.json`, import.meta.url).pathname, R = JSON.parse(fs.readFileSync(f)); R.topRects.rows = r; fs.writeFileSync(f, JSON.stringify(R, null, 1)); console.log(lang, JSON.stringify(r), JSON.stringify(R.routeRects), JSON.stringify(R.profRects));
}
await b.close();
