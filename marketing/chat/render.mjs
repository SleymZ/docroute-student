// Chat-style video. node marketing/chat/render.mjs en ru hi [--frames t1,t2]
import { createRequire } from "node:module"; import { spawn } from "node:child_process"; import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), repo = path.resolve(here, "../.."), require = createRequire(import.meta.url);
let puppeteer; for (const p of ["puppeteer-core", "/opt/npm-tools/node_modules/puppeteer-core", "/opt/npm-tools/node_modules/puppeteer"]) { try { puppeteer = require(p); break; } catch {} }
const FPS = 30, TEXTS = JSON.parse(fs.readFileSync(path.join(here, "texts.json"), "utf8"));
const src = fs.readFileSync(path.join(repo, "src/components/Logo.tsx"), "utf8"), g = n => src.match(new RegExp(`${n}\\s*=\\s*"([^"]+)"`))[1];
const LOGO = { ring: g("logoRingPath"), europe: g("logoEuropePath"), swoosh: g("logoSwooshPath"), plane: g("logoPlanePath"), planeT: g("logoPlaneTransform") };
const run = (cmd, a, input) => new Promise((res, rej) => { const p = spawn(cmd, a, { stdio: [input ? "pipe" : "ignore", "ignore", "inherit"] }); p.on("exit", c => c === 0 ? res() : rej(new Error(cmd + c))); if (input) input(p.stdin); });
// reading time: a friend's message is "typed" first; everyone gets time to read
function schedule(msgs, lang) {
  const rate = lang === "hi" ? .05 : .045; let t = .5; const out = [];
  msgs.forEach(([who, text], i) => {
    const n = [...text].length, typing = who === "f" ? Math.min(1.1, .45 + n * .012) : 0;
    const start = t; t += typing; out.push({ who, typing: +start.toFixed(2), at: +t.toFixed(2) });
    t += Math.min(2.6, .55 + n * rate) + (i === 0 ? .3 : 0);
  });
  const end = +(t + .3).toFixed(2); return { msgs: out, end, total: +(end + 4.2).toFixed(2) };
}
const fi = process.argv.indexOf("--frames"), stills = fi > 0 ? process.argv[fi + 1].split(",").map(Number) : null;
const langs = process.argv.slice(2).filter((x, i) => !x.startsWith("--") && (fi < 0 || i !== fi - 1));
await Promise.all(langs.map(async lang => {
  const out = path.join(here, "out", lang); fs.mkdirSync(out, { recursive: true });
  const SCH = schedule(TEXTS[lang].msgs, lang); fs.writeFileSync(path.join(out, "schedule.json"), JSON.stringify(SCH));
  const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const page = await b.newPage(); await page.setViewport({ width: 1080, height: 1920 });
  await page.evaluateOnNewDocument(d => Object.assign(window, d), { SCH, LOGO, T: TEXTS[lang], LANG: lang });
  await page.goto("file://" + path.join(here, "page.html"));
  await page.evaluate(async () => { for (const w of ["500", "800", "900"]) await Promise.all([document.fonts.load(`${w} 40px Inter`, "A"), document.fonts.load(`${w} 40px "Noto Sans Devanagari"`, "अ")]); build(); });
  const set = t => page.evaluate(t => setTime(t), t);
  if (stills) { for (const t of stills) { for (let k = 0; k < 20; k++) await set(t); await page.screenshot({ path: path.join(out, `still-${t}.jpg`), type: "jpeg", quality: 85 }); } await b.close(); return; }
  const cuts = [0, SCH.msgs[5].at - .1, SCH.msgs[10].at - .1, SCH.end - .05, SCH.total].map(x => Math.round(x * FPS) / FPS), parts = [];
  for (let s = 0; s < cuts.length - 1; s++) {
    const n = Math.round((cuts[s + 1] - cuts[s]) * FPS), tmp = path.join(out, `s${s}.tmp.mp4`), fin = path.join(out, `s${s}.mp4`);
    await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), tmp], async stdin => {
      for (let f = 0; f < n; f++) { await set(cuts[s] + f / FPS); const buf = await page.screenshot({ type: "jpeg", quality: 92 }); if (!stdin.write(buf)) await new Promise(r => stdin.once("drain", r)); } stdin.end(); });
    fs.renameSync(tmp, fin); parts.push(fin);
  }
  await b.close();
  await run("python3", [path.join(here, "sound.py"), path.join(out, "schedule.json"), path.join(out, "mix.wav"), path.join(out, "sfx.wav")]);
  fs.writeFileSync(path.join(out, "list.txt"), parts.map(p => `file '${p}'`).join("\n"));
  for (const [mix, name] of [["mix.wav", `DocRoute-chat-${lang}.mp4`], ["sfx.wav", `DocRoute-chat-sounds-only-${lang}.mp4`]])
    await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(out, "list.txt"), "-i", path.join(out, mix), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-af", "loudnorm=I=-14:TP=-1.5", "-shortest", "-movflags", "+faststart", path.join(here, "out", name)]);
  console.log("done", lang, SCH.total);
}));
