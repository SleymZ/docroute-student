// DocRoute short film kit: end card (navy + orange route across Europe) and
// an animatic with the voiceover. Voice first: python3 marketing/film/voice.py <kokoro models>
// node marketing/film/render.mjs   → out/DocRoute-film-endcard.mp4 (no logo, room for it),
//   out/DocRoute-film-endcard-logo.mp4, out/DocRoute-film-animatic.mp4
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), repo = path.resolve(here, "../..");
const require = createRequire(import.meta.url);
let puppeteer; for (const p of ["puppeteer-core", "/opt/npm-tools/node_modules/puppeteer-core", "/opt/npm-tools/node_modules/puppeteer"]) { try { puppeteer = require(p); break; } catch {} }
const MAP = JSON.parse(fs.readFileSync(path.join(here, "endmap.json"), "utf8"));
const SHOTS = JSON.parse(fs.readFileSync(path.join(here, "shots.json"), "utf8"));
const VT = JSON.parse(fs.readFileSync(path.join(here, "out/voice/timeline.json"), "utf8"));
const logoSrc = fs.readFileSync(path.join(repo, "src/components/Logo.tsx"), "utf8");
const grab = n => logoSrc.match(new RegExp(`${n}\\s*=\\s*"([^"]+)"`))[1];
const LOGO = { ring: grab("logoRingPath"), europe: grab("logoEuropePath"), swoosh: grab("logoSwooshPath"), plane: grab("logoPlanePath"), planeT: grab("logoPlaneTransform") };
const FPS = 30, END_AT = SHOTS[SHOTS.length - 1].b, out = path.join(here, "out");
const run = (cmd, a, input) => new Promise((res, rej) => { const p = spawn(cmd, a, { stdio: [input ? "pipe" : "ignore", "ignore", "inherit"] }); p.on("exit", c => (c === 0 ? res() : rej(new Error(`${cmd} ${c}`)))); if (input) input(p.stdin); });
async function film(mode, seconds, file, from = 0) {
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const page = await browser.newPage(); await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument(d => Object.assign(window, d), { MAP, LOGO, MODE: mode, SHOTS, VO: VT.lines, END_AT });
  await page.goto("file://" + path.join(here, "endcard.html"));
  await page.evaluate(async () => { await document.fonts.load("800 40px Inter", "A"); build(); });
  const n = Math.round(seconds * FPS), tmp = file.replace(/\.mp4$/, ".tmp.mp4");
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p", "-r", String(FPS), tmp], async stdin => {
    for (let f = 0; f < n; f++) { await page.evaluate(t => setTime(t), from + f / FPS); const buf = await page.screenshot({ type: "jpeg", quality: 94 }); if (!stdin.write(buf)) await new Promise(r => stdin.once("drain", r)); }
    stdin.end();
  });
  await browser.close(); fs.renameSync(tmp, file);
}
const endLen = +(VT.total - END_AT).toFixed(2);
await Promise.all([
  film("end", endLen, path.join(out, "DocRoute-film-endcard.mp4")),
  film("endlogo", endLen, path.join(out, "DocRoute-film-endcard-logo.mp4")),
  film("animatic", VT.total, path.join(out, "animatic-silent.mp4")),
]);
const voice = path.join(out, "DocRoute-film-voiceover.wav");
await run("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(out, "animatic-silent.mp4"), "-i", voice, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", path.join(out, "DocRoute-film-animatic.mp4")]);
console.log("end card", endLen, "s; animatic", VT.total, "s");
