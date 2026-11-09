// Russian-passport video. python3 marketing/ru-passport/voice.py first, then:
// node marketing/ru-passport/render.mjs [--frames t1,t2]
import { createRequire } from "node:module"; import { spawn } from "node:child_process"; import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), repo = path.resolve(here, "../.."), require = createRequire(import.meta.url);
let puppeteer; for (const p of ["puppeteer-core", "/opt/npm-tools/node_modules/puppeteer-core", "/opt/npm-tools/node_modules/puppeteer"]) { try { puppeteer = require(p); break; } catch {} }
const VT = JSON.parse(fs.readFileSync(path.join(here, "out/voice/timeline.json"), "utf8")), FPS = 30, out = path.join(here, "out");
const src = fs.readFileSync(path.join(repo, "src/components/Logo.tsx"), "utf8"), g = n => src.match(new RegExp(`${n}\\s*=\\s*"([^"]+)"`))[1];
const LOGO = { ring: g("logoRingPath"), europe: g("logoEuropePath"), swoosh: g("logoSwooshPath"), plane: g("logoPlanePath"), planeT: g("logoPlaneTransform") };
const flags = path.join(here, "flags"); if (!fs.existsSync(flags)) fs.symlinkSync(path.join(repo, "public/flags"), flags);
const run = (cmd, a, input) => new Promise((res, rej) => { const p = spawn(cmd, a, { stdio: [input ? "pipe" : "ignore", "ignore", "inherit"] }); p.on("exit", c => c === 0 ? res() : rej(new Error(cmd + c))); if (input) input(p.stdin); });
const fi = process.argv.indexOf("--frames"), stills = fi > 0 ? process.argv[fi + 1].split(",").map(Number) : null;
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files"] });
const page = await b.newPage(); await page.setViewport({ width: 1080, height: 1920 });
await page.evaluateOnNewDocument(d => Object.assign(window, d), { TL: VT.lines, SLAMS: VT.slams, LOGO });
await page.goto("file://" + path.join(here, "page.html"));
await page.evaluate(async () => { await document.fonts.load("800 40px Inter", "A"); build(); await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
const set = t => page.evaluate(t => setTime(t), t);
if (stills) { for (const t of stills) { await set(t); await page.screenshot({ path: path.join(out, `still-${t}.jpg`), type: "jpeg", quality: 85 }); } await b.close(); process.exit(0); }
const L = VT.lines, cuts = [0, L[6].a - .15, L[7].a - .15, L[10].a - .2, VT.total].map(x => Math.round(x * FPS) / FPS), parts = [];
for (let s = 0; s < cuts.length - 1; s++) {
  const n = Math.round((cuts[s + 1] - cuts[s]) * FPS), tmp = path.join(out, `s${s}.tmp.mp4`), fin = path.join(out, `s${s}.mp4`);
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), tmp], async stdin => {
    for (let f = 0; f < n; f++) { await set(cuts[s] + f / FPS); const buf = await page.screenshot({ type: "jpeg", quality: 92 }); if (!stdin.write(buf)) await new Promise(r => stdin.once("drain", r)); } stdin.end(); });
  fs.renameSync(tmp, fin); parts.push(fin);
}
await b.close();
fs.writeFileSync(path.join(out, "list.txt"), parts.map(p => `file '${p}'`).join("\n"));
for (const [mix, name] of [["mix.wav", "DocRoute-ru-passport.mp4"], ["mix-nomusic.wav", "DocRoute-ru-passport-nomusic.mp4"]])
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(out, "list.txt"), "-i", path.join(out, mix), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", path.join(out, name)]);
console.log("done");
