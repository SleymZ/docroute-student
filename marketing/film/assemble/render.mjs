import { createRequire } from "node:module"; import { spawn } from "node:child_process"; import fs from "node:fs"; import path from "node:path";
const require = createRequire(import.meta.url); const p = require("/opt/npm-tools/node_modules/puppeteer");
const here = "/home/claude/edit", FPS = 30;
const VT = JSON.parse(fs.readFileSync(here + "/vt.json")); const END = 40.1, TOTAL = VT.total;
const MAP = JSON.parse(fs.readFileSync(here + "/endmap.json"));
const s = fs.readFileSync("/home/claude/docroute-student/src/components/Logo.tsx", "utf8"); const g = n => s.match(new RegExp(n + '\\s*=\\s*"([^"]+)"'))[1];
const LOGO = { ring: g("logoRingPath"), europe: g("logoEuropePath"), swoosh: g("logoSwooshPath"), plane: g("logoPlanePath"), planeT: g("logoPlaneTransform") };
const run = (cmd, a, input) => new Promise((res, rej) => { const q = spawn(cmd, a, { stdio: [input ? "pipe" : "ignore", "ignore", "inherit"] }); q.on("exit", c => c === 0 ? res() : rej(new Error(cmd + c))); if (input) input(q.stdin); });
async function rec(page, from, seconds, file) {
  const n = Math.round(seconds * FPS), tmp = file.replace(/\.mp4$/, ".tmp.mp4");
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(FPS), tmp], async stdin => {
    for (let f = 0; f < n; f++) { await page.evaluate(t => setTime(t), from + f / FPS); const b = await page.screenshot({ type: "jpeg", quality: 93 }); if (!stdin.write(b)) await new Promise(r => stdin.once("drain", r)); }
    stdin.end(); });
  fs.renameSync(tmp, file);
}
const stills = process.argv[2] === "--frames" ? process.argv[3].split(",").map(Number) : null;
async function version(subs) {
  const b = await p.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const film = await b.newPage(); await film.setViewport({ width: 1080, height: 1920 });
  await film.evaluateOnNewDocument(d => Object.assign(window, d), { TL: VT.lines, SUBS: subs });
  await film.goto("file://" + here + "/film.html"); await film.evaluate(async () => { await document.fonts.load("700 40px Inter", "A"); build(); await Promise.all([...document.images].map(i => i.decode())); });
  const b2 = await p.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const end = await b2.newPage(); await end.setViewport({ width: 1080, height: 1920 });
  const caps = subs ? VT.lines.filter(l => l.a >= END).map(l => ({ ...l, a: l.a - END, b: l.b - END })) : [];
  await end.evaluateOnNewDocument(d => Object.assign(window, d), { MAP, LOGO, MODE: "endlogo", CAPS: caps });
  await end.goto("file://" + here + "/endcard.html"); await end.evaluate(async () => { await document.fonts.load("800 40px Inter", "A"); build(); });
  const tag = subs ? "subs" : "clean";
  if (stills) { for (const t of stills) { const pg = t < END ? film : end; await pg.evaluate(t => setTime(t), t < END ? t : t - END); await pg.screenshot({ path: `${here}/still-${tag}-${t}.jpg`, type: "jpeg", quality: 85 }); } await b.close(); await b2.close(); return; }
  await rec(film, 0, END, `${here}/part1-${tag}.mp4`); await rec(end, 0, +(TOTAL - END).toFixed(3), `${here}/part2-${tag}.mp4`);
  await b.close(); await b2.close();
  fs.writeFileSync(`${here}/list-${tag}.txt`, `file '${here}/part1-${tag}.mp4'\nfile '${here}/part2-${tag}.mp4'\n`);
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${here}/list-${tag}.txt`, "-i", `${here}/mix.wav`, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", `${here}/DocRoute-film-${tag}.mp4`]);
}
await Promise.all([version(true), version(false)]);
console.log("ok");
