import { createRequire } from "node:module"; const require = createRequire(import.meta.url);
import fs from "node:fs";
const p = require("/opt/npm-tools/node_modules/puppeteer");
const lang = process.argv[2], out = new URL(`./shots/${lang}`, import.meta.url).pathname; fs.mkdirSync(out, { recursive: true });
const D = 2.77, wait = ms => new Promise(r => setTimeout(r, ms));
const b = await p.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
const pg = await b.newPage(); await pg.setViewport({ width: 390, height: 693, deviceScaleFactor: D });
for (const [n, v] of [["docroute-visited", "1"], ["docroute-lang", lang]]) await pg.setCookie({ name: n, value: v, domain: "localhost", path: "/" });
const R = {};
const shot = async (name, full = true) => { await wait(400); await pg.screenshot({ path: `${out}/${name}.png`, fullPage: full }); R[name] = { url: pg.url(), h: await pg.evaluate(() => document.documentElement.scrollHeight * 2.77) }; };
const rect = js => pg.evaluate((js, D) => { const e = eval(js); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x * D, (r.y + scrollY) * D, r.width * D, r.height * D].map(Math.round); }, js, D);
await pg.goto("http://localhost:3123/home", { waitUntil: "networkidle0" });
await pg.evaluate(() => [...document.querySelectorAll("button")].find(x => /^(Necessary only|Только необходимые|केवल ज़रूरी|सिर्फ़ ज़रूरी)/.test(x.textContent.trim()))?.click());
await pg.evaluate(() => document.querySelector('button[aria-label*="dark" i], button[aria-label*="тём" i], button[aria-label*="डार्क" i]')?.click()); await wait(500);
console.log("cookie banner left:", await pg.evaluate(() => [...document.querySelectorAll("button")].filter(x => x.offsetParent && /necessary|необходим|ज़रूरी/i.test(x.textContent)).length));
await pg.evaluate(() => scrollTo(0, 0)); await shot("home");
// fill the form: purpose study (first radio), documents India, destination Slovakia
await pg.evaluate(() => document.querySelectorAll(".route-form [role=radio]")[0].click()); await wait(300);
await pg.evaluate(() => [...document.querySelectorAll(".route-form button")].find(b => b.getAttribute("aria-haspopup") || /Documents issued|Документы выданы|दस्तावेज़/.test(b.getAttribute("aria-label") || "")).click()); await wait(400);
const inp = await pg.$("input[type=search], input[placeholder]"); if (inp) { await inp.type(lang === "ru" ? "Инд" : lang === "hi" ? "भारत" : "India", { delay: 40 }); await wait(400); }
await pg.evaluate(lang => { const want = lang === "ru" ? "Индия" : lang === "hi" ? "भारत" : "India"; [...document.querySelectorAll("button,[role=option]")].find(x => x.textContent.trim().startsWith(want))?.click(); }, lang); await wait(500);
await pg.evaluate(() => { document.querySelector(".route-form").scrollIntoView({ block: "start" }); scrollBy(0, -30); }); await wait(300);
await pg.screenshot({ path: `${out}/form.png` });
R.form = { purpose: await rect(`document.querySelector(".route-form [role=radiogroup]")`), button: await rect(`document.querySelector(".route-button")`), scroll: await pg.evaluate(() => scrollY * 2.77) };
await Promise.all([pg.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {}), pg.click(".route-button")]); await wait(1200);
await pg.evaluate(() => scrollTo(0, 0)); await shot("after-button"); R.profRects = { h1: await rect(`document.querySelector("h1")`) };
// Top 100
await pg.goto("http://localhost:3123/explore/top", { waitUntil: "networkidle0" }); await wait(500); await shot("top");
R.topRects = { h1: await rect(`document.querySelector("h1")`), first: await rect(`[...document.querySelectorAll("a[href*='/universities/']")][0].closest("li,article,div")`), list: await rect(`[...document.querySelectorAll("a[href*='/universities/']")][2].closest("li,article,div")`) };
const uni = await pg.evaluate(() => [...document.querySelectorAll("a[href^='/u/'], a[href*='/universities/']")].map(a => a.getAttribute("href"))[0]);
console.log("uni", uni);
if (uni) { await pg.goto("http://localhost:3123" + uni, { waitUntil: "networkidle0" }); await wait(500); await shot("university"); R.uniRects = { h1: await rect(`document.querySelector("h1")`) }; }
// a built route
await pg.goto("http://localhost:3123/route/work?country=SK&citizenship=IN&residenceStatus=non-eu-passport-no-residence&offer=yes&skGraduate=no&blueCard=no&shortage=unsure", { waitUntil: "networkidle0" }); await wait(800);
await pg.evaluate(() => scrollTo(0, 0)); await shot("route");
R.routeRects = { h1: await rect(`document.querySelector("h1")`), badge: await rect(`(() => { let e = document.querySelector("img[src*='/flags/in']"); while (e && e.getBoundingClientRect().width < 320) e = e.parentElement; return e; })()`), stages: await rect(`[...document.querySelectorAll("ol,ul")].find(e => e.children.length >= 4 && e.getBoundingClientRect().width > 300 && e.textContent.includes("0 "))`) };
fs.writeFileSync(`${out}/rects.json`, JSON.stringify(R, null, 1)); console.log(JSON.stringify(R));
await b.close();
