// Real screenshots of the site for the button video (dark theme, mobile 390×693 at 2.77×).
// Build and start the site locally on :3123 first (see README), then: node marketing/button/capture.mjs
import { createRequire } from "node:module"; const require = createRequire(import.meta.url);
import fs from "node:fs";
const p = require("/opt/npm-tools/node_modules/puppeteer");
const D = 2.77, out = new URL("./shots", import.meta.url).pathname; fs.mkdirSync(out, { recursive: true });
const b = await p.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
const pg = await b.newPage(); await pg.setViewport({ width: 390, height: 693, deviceScaleFactor: D });
await pg.setCookie({ name: "docroute-visited", value: "1", domain: "localhost", path: "/" });
const wait = ms => new Promise(r => setTimeout(r, ms));
const rect = (sel, abs = false) => pg.evaluate((sel, abs, D) => { const e = typeof sel === "string" ? document.querySelector(sel) : null; if (!e) return null; const r = e.getBoundingClientRect(); const oy = abs ? scrollY : 0; return [r.x * D, (r.y + oy) * D, r.width * D, r.height * D].map(Math.round); }, sel, abs, D);
const rectXP = (fn, abs = true) => pg.evaluate((src, abs, D) => { const e = eval(src); if (!e) return null; const r = e.getBoundingClientRect(); const oy = abs ? scrollY : 0; return [r.x * D, (r.y + oy) * D, r.width * D, r.height * D].map(Math.round); }, fn, abs, D);
const R = {};
await pg.goto("http://localhost:3123/home", { waitUntil: "networkidle0" });
await pg.evaluate(() => [...document.querySelectorAll("button")].find(x => x.textContent.trim().startsWith("Necessary only"))?.click()); await wait(300);
await pg.evaluate(() => document.querySelector('button[aria-label="Switch to dark theme"]')?.click()); await wait(500);
await pg.evaluate(() => [...document.querySelectorAll(".route-form [role=radio]")].find(b => b.textContent.trim() === "Work").click()); await wait(300);
await pg.evaluate(() => [...document.querySelectorAll(".route-form button")].find(b => (b.getAttribute("aria-label")||"").startsWith("Documents issued in")).click()); await wait(300);
await (await pg.$("input[type=search], input[placeholder*='Search' i]")).type("India"); await wait(300);
await pg.evaluate(() => [...document.querySelectorAll("button")].find(x => x.textContent.trim().startsWith("India")).click()); await wait(500);
await pg.evaluate(() => { document.querySelector(".route-form").scrollIntoView({ block: "start" }); window.scrollBy(0, -30); }); await wait(350);
await pg.screenshot({ path: `${out}/form.png` });
R.form = { purpose: await rect(".route-form [role=radiogroup]"), docs: await rectXP(`[...document.querySelectorAll(".route-form button")].find(b => (b.getAttribute("aria-label")||"").startsWith("Documents issued in"))`, false), dest: await rectXP(`document.querySelectorAll(".route-form [role=combobox]")[0]`, false), button: await rect(".route-button") };
// the questions page with answers
await pg.goto("http://localhost:3123/route/work?country=SK&citizenship=IN", { waitUntil: "networkidle0" }); await wait(400);
await pg.select("select", "non-eu-passport-no-residence");
for (const [n, v] of [["offer", "yes"], ["skGraduate", "no"], ["blueCard", "no"], ["shortage", "unsure"]]) await pg.evaluate((n, v) => document.querySelector(`input[name=${n}][value=${v}]`).click(), n, v);
await wait(400); await pg.evaluate(() => scrollTo(0, 0)); await wait(200);
await pg.screenshot({ path: `${out}/questions.png`, fullPage: true });
R.q = { offer: await rectXP(`document.querySelector("input[name=offer]").closest("fieldset") || document.querySelector("input[name=offer]").parentElement.parentElement`), submit: await rect("form button[type=submit]", true), h: await pg.evaluate(() => document.documentElement.scrollHeight * 2.77) };
const sub = await pg.$("form button[type=submit]"); await sub.click(); await wait(2500);
await pg.evaluate(() => scrollTo(0, 0)); await wait(300);
await pg.screenshot({ path: `${out}/route.png`, fullPage: true });
const byText = (tag, txt) => `[...document.querySelectorAll("${tag}")].find(e => e.textContent.includes(${JSON.stringify(txt)}))`;
R.route = {
  summary: await rectXP(byText("h1", "Working in Slovakia") + ".parentElement"),
  badge: await rectXP(`(() => { let e = [...document.querySelectorAll("*")].find(e => e.children.length === 0 && e.textContent.trim().startsWith("Route for citizens of India")); for (let i = 0; i < 3 && e.parentElement; i++) { e = e.parentElement; if (e.getBoundingClientRect().width > 300) break; } return e; })()`),
  stages: await rectXP(`[...document.querySelectorAll("ol,ul,nav")].find(e => e.textContent.includes("For citizens of India") && e.textContent.includes("After approval"))`),
  passport: await rectXP(byText("h2", "What applies to a passport of India")),
  visa: await rectXP(byText("h3", "need a visa") + ".closest('li, article, div')"),
  visaLink: await rectXP(byText("a", "Regulation (EU) 2018/1806")),
  job: await rectXP(byText("h2", "Confirm your job offer")),
  labour: await rectXP(byText("h2", "Labour Office confirmation")),
  embassy: await rectXP(byText("h2", "Apply for temporary residence")),
  arrive: await rectXP(byText("h2", "Arrive, register")),
  sources: await rectXP(byText("h2", "Sources")),
  sourcesEnd: await rectXP(byText("a", "Apostille Convention")),
  h: await pg.evaluate(() => document.documentElement.scrollHeight * 2.77),
};
fs.writeFileSync(`${out}/rects.json`, JSON.stringify(R, null, 1)); console.log(JSON.stringify(R));
await b.close();
