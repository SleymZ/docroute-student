// Renders the DocRoute promo for one or more languages.
// node marketing/promo/render.mjs [en ru es zh hi] [--frames 4.2,13.5]  (stills only)
// Needs: google-chrome, ffmpeg, puppeteer-core (any install), the Devanagari
// font from `npm pack @fontsource/noto-sans-devanagari` in marketing/promo/fonts.
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../..");
const require = createRequire(import.meta.url);
let puppeteer;
for (const p of ["puppeteer-core", "/opt/npm-tools/node_modules/puppeteer-core", "/opt/npm-tools/node_modules/puppeteer"]) {
  try { puppeteer = require(p); break; } catch {}
}
const args = process.argv.slice(2);
const fi = args.indexOf("--frames");
const stills = fi >= 0 ? args[fi + 1].split(",").map(Number) : null;
const langs = args.filter((a, i) => !a.startsWith("--") && (fi < 0 || i !== fi + 1));
const texts = JSON.parse(fs.readFileSync(path.join(here, "texts.json"), "utf8"));
const logoSrc = fs.readFileSync(path.join(repo, "src/components/Logo.tsx"), "utf8");
const grab = name => logoSrc.match(new RegExp(`${name}\\s*=\\s*"([^"]+)"`))[1];
const LOGO = { ring: grab("logoRingPath"), europe: grab("logoEuropePath"), swoosh: grab("logoSwooshPath"), plane: grab("logoPlanePath"), planeT: grab("logoPlaneTransform") };

// the page loads flags/ and fonts/ next to itself
const flags = path.join(here, "flags");
if (!fs.existsSync(flags)) fs.symlinkSync(path.join(repo, "public/flags"), flags);

const FPS = 30;
const SCENES = [[0, 3.5], [3.5, 8.5], [8.5, 11.5], [11.5, 17.5], [17.5, 21], [21, 25]];
const out = path.join(here, "out");
fs.mkdirSync(out, { recursive: true });

// one browser per language: background tabs of a shared browser barely paint
const browsers = [];
async function open(lang) {
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files", "--hide-scrollbars"] });
  browsers.push(browser);
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument((T, L, LANG) => { window.T = T; window.LOGO = L; window.LANG = LANG; }, texts[lang], LOGO, lang);
  await page.goto("file://" + path.join(here, "promo.html"));
  await page.evaluate(async () => { await document.fonts.ready; build(); });
  await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
  return page;
}

function run(cmd, a, input) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, a, { stdio: [input ? "pipe" : "ignore", "ignore", "inherit"] });
    p.on("exit", c => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))));
    if (input) input(p.stdin);
  });
}

async function setT(page, t) {
  await page.evaluate(async t => {
    setTime(t);
    const imgs = [...document.images]; await Promise.all(imgs.map(i => i.decode().catch(() => {})));
  }, t);
}

await Promise.all(langs.map(async lang => {
  const page = await open(lang);
  if (stills) {
    for (const t of stills) { await setT(page, t); await page.screenshot({ path: path.join(out, `still-${lang}-${t}.jpg`), type: "jpeg", quality: 85 }); }
    return;
  }
  const parts = [];
  for (const [si, [a, b]] of SCENES.entries()) {
    const n = Math.round((b - a) * FPS), tmp = path.join(out, `${lang}-s${si}.tmp.mp4`), fin = path.join(out, `${lang}-s${si}.mp4`);
    await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), tmp], async stdin => {
      for (let f = 0; f < n; f++) {
        await setT(page, a + f / FPS);
        const buf = await page.screenshot({ type: "jpeg", quality: 92 });
        if (!stdin.write(buf)) await new Promise(r => stdin.once("drain", r));
      }
      stdin.end();
    });
    fs.renameSync(tmp, fin); parts.push(fin);
  }
  const list = path.join(out, `${lang}-list.txt`);
  fs.writeFileSync(list, parts.map(p => `file '${p}'`).join("\n"));
  const tmp = path.join(out, `DocRoute-promo-${lang}.tmp.mp4`);
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", tmp]);
  fs.renameSync(tmp, path.join(out, `DocRoute-promo-${lang}.mp4`));
  console.log("done", lang);
}));
await Promise.all(browsers.map(b => b.close()));
