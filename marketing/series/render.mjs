// Renders the growth series: node marketing/series/render.mjs [ids…] [--langs en,ru] [--frames 2,9]
// ids are keys of scripts.json (prefix is enough: 01 03); default all.
// Needs google-chrome, ffmpeg, puppeteer-core, python3 with numpy + soundfile.
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
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const langs = (opt("--langs") ?? "en,ru").split(",");
const stills = opt("--frames")?.split(",").map(Number) ?? null;
const ids = args.filter((a, i) => !a.startsWith("--") && !["--langs", "--frames"].includes(args[i - 1]));
const scripts = JSON.parse(fs.readFileSync(path.join(here, "scripts.json"), "utf8"));
const chosen = Object.keys(scripts).filter(id => !ids.length || ids.some(p => id.startsWith(p)));
const logoSrc = fs.readFileSync(path.join(repo, "src/components/Logo.tsx"), "utf8");
const grab = name => logoSrc.match(new RegExp(`${name}\\s*=\\s*"([^"]+)"`))[1];
const LOGO = { ring: grab("logoRingPath"), europe: grab("logoEuropePath"), swoosh: grab("logoSwooshPath"), plane: grab("logoPlanePath"), planeT: grab("logoPlaneTransform") };
const FPS = 30;
const out = path.join(here, "out");
fs.mkdirSync(out, { recursive: true });

function run(cmd, a, input) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, a, { stdio: [input ? "pipe" : "ignore", "ignore", "inherit"] });
    p.on("exit", c => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))));
    if (input) input(p.stdin);
  });
}

// One browser per language: background tabs of a shared browser barely paint.
const launch = () => puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files", "--hide-scrollbars", "--disable-background-networking", "--disable-component-update", "--no-first-run", "--disable-sync"] });
const browsers = await Promise.all(langs.map(() => launch()));
for (const id of chosen) {
  const { dur } = scripts[id];
  const music = path.join(out, `beat-${dur}.wav`);
  if (!stills && !fs.existsSync(music)) await run("python3", [path.join(here, "../teen/beat.py"), String(dur), music]);
  await Promise.all(langs.map(async (lang, li) => {
    const page = await browsers[li].newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument((V, L) => { window.V = V; window.LOGO = L; }, scripts[id][lang], LOGO);
    await page.goto("file://" + path.join(here, "series.html"));
    // Inter is the system font here; only wait for fonts to settle.
    await page.evaluate(async () => { await document.fonts.ready; build(); });
    const frame = async t => { await page.evaluate(t => setTime(t), t); return page.screenshot({ type: "jpeg", quality: 92 }); };
    if (stills) {
      for (const t of stills) fs.writeFileSync(path.join(out, `still-${id}-${lang}-${t}.jpg`), await frame(t));
      await page.close();
      return;
    }
    const video = path.join(out, `${id}-${lang}.video.mp4`);
    await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-r", String(FPS), video], async stdin => {
      const n = Math.round(dur * FPS);
      for (let f = 0; f < n; f++) {
        const buf = await frame(f / FPS);
        if (!stdin.write(buf)) await new Promise(r => stdin.once("drain", r));
      }
      stdin.end();
    });
    const final = path.join(out, `DocRoute-${id}-${lang}.mp4`);
    await run("ffmpeg", ["-y", "-loglevel", "error", "-i", video, "-i", music, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
      "-c:a", "aac", "-b:a", "160k", "-af", "loudnorm=I=-14:TP=-1.5", "-shortest", "-movflags", "+faststart", final]);
    fs.unlinkSync(video);
    await page.close();
    console.log("done", id, lang);
  }));
}
await Promise.all(browsers.map(b => b.close()));
