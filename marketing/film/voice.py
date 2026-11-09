"""Voiceover for the DocRoute short film (Kokoro am_michael, calm pace).
python3 marketing/film/voice.py <kokoro models dir>
→ out/voice/timeline.json (start/end of every line), out/DocRoute-film-voiceover.wav
(−16 LUFS, 48 kHz) and .mp3. Pauses after each line are in voice.json."""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here = os.path.dirname(os.path.abspath(__file__)); models = sys.argv[1]
pick = lambda *n: next(os.path.join(models, x) for x in n if os.path.exists(os.path.join(models, x)))
k = Kokoro(pick("kokoro-v1.0.int8.onnx", "kokoro.onnx"), pick("voices-v1.0.bin", "voices.bin"))
d = json.load(open(os.path.join(here, "voice.json"))); out = os.path.join(here, "out"); vd = os.path.join(out, "voice"); os.makedirs(vd, exist_ok=True)
sr, t, tl = 44100, d["lead"], []
trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse"
for i, (line, gap) in enumerate(d["lines"]):
    x, r = k.create(line.replace("DocRoute", "Doc Root"), voice=d["voice"], speed=d["speed"], lang="en-us")
    raw, w = os.path.join(vd, f"{i}-raw.wav"), os.path.join(vd, f"{i}.wav"); sf.write(raw, x, r)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", trim, "-ar", str(sr), "-ac", "1", w], check=True)
    dur = sf.info(w).duration; tl.append({"line": line, "a": round(t, 2), "b": round(t + dur, 2)}); t += dur + gap
total = round(t + d["tail"], 2)
json.dump({"total": total, "lines": tl}, open(os.path.join(vd, "timeline.json"), "w"), indent=1)
y = np.zeros(int(total * sr))
for i, l in enumerate(tl):
    a, _ = sf.read(os.path.join(vd, f"{i}.wav")); s = int(l["a"] * sr); y[s:s + len(a)] += a[: len(y) - s]
mix = os.path.join(vd, "mix.wav"); sf.write(mix, np.stack([y, y], 1) / np.abs(y).max() * .9, sr)
wav = os.path.join(out, "DocRoute-film-voiceover.wav")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", mix, "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "48000", wav], check=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-c:a", "libmp3lame", "-b:a", "192k", wav[:-4] + ".mp3"], check=True)
print(total, "s")
