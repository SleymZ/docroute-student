// Renders the founder-story video with voice-over.
// python3 tts.py <models> <langs>  first (voice + timings), then:
// node marketing/story/render.mjs [en ru es zh hi] [--frames t1,t2]
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), repo = path.resolve(here, "../..");
const require = createRequire(import.meta.url);
let puppeteer; for (const p of ["puppeteer-core", "/opt/npm-tools/node_modules/puppeteer-core", "/opt/npm-tools/node_modules/puppeteer"]) { try { puppeteer = require(p); break; } catch {} }
const args = process.argv.slice(2), fi = args.indexOf("--frames");
const stills = fi >= 0 ? args[fi + 1].split(",").map(Number) : null;
const langs = args.filter((a, i) => !a.startsWith("--") && (fi < 0 || i !== fi + 1));
const T = JSON.parse(fs.readFileSync(path.join(here, "texts.json"), "utf8"));
const P = JSON.parse(fs.readFileSync(path.join(here, "../promo/texts.json"), "utf8"));
const MAP = JSON.parse(fs.readFileSync(path.join(here, "map.json"), "utf8"));
const voice = path.join(here, "out/voice"), timings = JSON.parse(fs.readFileSync(path.join(voice, "timings.json"), "utf8"));
const logoSrc = fs.readFileSync(path.join(repo, "src/components/Logo.tsx"), "utf8");
const grab = n => logoSrc.match(new RegExp(`${n}\\s*=\\s*"([^"]+)"`))[1];
const LOGO = { ring: grab("logoRingPath"), europe: grab("logoEuropePath"), swoosh: grab("logoSwooshPath"), plane: grab("logoPlanePath"), planeT: grab("logoPlaneTransform") };
const FPS = 30, LEAD = 0.5, GAPS = [0.5, 0.45, 0.8, 0.8, 0.5, 0.5, 0.55], TAIL = 3.0;
function timeline(lang) { let t = LEAD; return timings[lang].map((d, i) => { const l = { a: +t.toFixed(3), b: +(t + d).toFixed(3) }; t += d + (GAPS[i] ?? 0); return l; }); }
const out = path.join(here, "out"); fs.mkdirSync(out, { recursive: true });
const run = (cmd, a, input) => new Promise((res, rej) => { const p = spawn(cmd, a, { stdio: [input ? "pipe" : "ignore", "ignore", "inherit"] }); p.on("exit", c => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`)))); if (input) input(p.stdin); });
const browsers = [];
await Promise.all(langs.map(async lang => {
  const TL = timeline(lang), total = Math.ceil((TL[7].b + TAIL) * FPS) / FPS;
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files", "--hide-scrollbars"] }); browsers.push(browser);
  const page = await browser.newPage(); await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument((d) => Object.assign(window, d), { T: T[lang], P: P[lang], MAP, LOGO, TL, LANG: lang });
  await page.goto("file://" + path.join(here, "story.html"));
  await page.evaluate(async () => {
    // load every face before measuring, or headlines are laid out with a fallback font
    for (const w of ["500", "700", "800"]) await Promise.all([document.fonts.load(`${w} 40px "Noto Sans Devanagari"`, "अ"), document.fonts.load(`${w} 40px "Noto Sans CJK SC"`, "中"), document.fonts.load(`${w} 40px Inter`, "A")]);
    await document.fonts.ready; build();
  });
  if (stills) { for (const t of stills) { await page.evaluate(t => setTime(t), t); await page.screenshot({ path: path.join(out, `still-${lang}-${t}.jpg`), type: "jpeg", quality: 85 }); } return; }
  // scenes: one file per spoken line (the last one runs to the end)
  const cuts = [0, ...TL.slice(1).map(l => Math.round((l.a - 0.25) * FPS) / FPS), total];
  const parts = [];
  for (let s = 0; s < cuts.length - 1; s++) {
    const a = cuts[s], n = Math.round((cuts[s + 1] - a) * FPS), tmp = path.join(out, `${lang}-s${s}.tmp.mp4`), fin = path.join(out, `${lang}-s${s}.mp4`);
    await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), tmp], async stdin => {
      for (let f = 0; f < n; f++) { await page.evaluate(t => setTime(t), a + f / FPS); const buf = await page.screenshot({ type: "jpeg", quality: 92 }); if (!stdin.write(buf)) await new Promise(r => stdin.once("drain", r)); }
      stdin.end();
    });
    fs.renameSync(tmp, fin); parts.push(fin);
  }
  const list = path.join(out, `${lang}-list.txt`); fs.writeFileSync(list, parts.map(p => `file '${p}'`).join("\n"));
  // audio: lines placed on the timeline, a quiet pad under them, loudness for social apps
  const pad = path.join(out, `${lang}-pad.wav`); await run("python3", [path.join(here, "pad.py"), String(total), pad]);
  const inputs = TL.flatMap((_, i) => ["-i", path.join(voice, `${lang}-${i}.wav`)]);
  const fc = TL.map((l, i) => `[${i}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${Math.round(l.a * 1000)}|${Math.round(l.a * 1000)}[v${i}]`).join(";") +
    `;${TL.map((_, i) => `[v${i}]`).join("")}amix=inputs=${TL.length}:normalize=0[vo];[${TL.length}:a]volume=0.16[pd];[vo][pd]amix=inputs=2:normalize=0:duration=longest,atrim=0:${total},loudnorm=I=-15:TP=-1.5:LRA=11[a]`;
  const audio = path.join(out, `${lang}-mix.m4a`);
  await run("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-i", pad, "-filter_complex", fc, "-map", "[a]", "-ar", "44100", "-c:a", "aac", "-b:a", "160k", audio]);
  const tmp = path.join(out, `DocRoute-story-${lang}.tmp.mp4`);
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy", "-shortest", "-movflags", "+faststart", tmp]);
  fs.renameSync(tmp, path.join(out, `DocRoute-story-${lang}.mp4`)); console.log("done", lang, total.toFixed(1) + "s");
}));
await Promise.all(browsers.map(b => b.close()));
