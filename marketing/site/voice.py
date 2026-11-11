"""Voice, timeline and sound for the site screen-recording video.
python3 marketing/site/voice.py <kokoro models dir> en ru hi
English and Hindi: Kokoro (am_michael, hm_omega). Russian: Piper male voice
ru_RU-dmitri-medium (sherpa-onnx GitHub release tts-models,
vits-piper-ru_RU-dmitri-medium.tar.bz2; run with pip piper-tts).
→ out/<lang>/timeline.json, out/<lang>/mix.wav (voice + soft pad + light pulse), mix-nomusic.wav"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
here = os.path.dirname(os.path.abspath(__file__)); models, langs = sys.argv[1], sys.argv[2:]
T = json.load(open(os.path.join(here, "texts.json")))
SR, LEAD, TAIL = 44100, .15, 3.2
trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.07,areverse"
kok = None
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
for lang in langs:
    cfg = T[lang]; out = os.path.join(here, "out", lang); os.makedirs(out, exist_ok=True)
    t, tl = LEAD, []
    for i, (line, gap) in enumerate(cfg["lines"]):
        say = line
        for a, b in cfg["say"].items(): say = say.replace(a, b)
        raw, w = os.path.join(out, f"{i}-raw.wav"), os.path.join(out, f"{i}.wav")
        if cfg["voice"][0] == "piper":
            subprocess.run([sys.executable, "-m", "piper", "-m", cfg["voice"][1], "-f", raw, "--length-scale", "0.93", "--noise-scale", "0.6", "--noise-w-scale", "0.8"], input=say.encode(), check=True, stderr=subprocess.DEVNULL)
        else:
            if kok is None:
                from kokoro_onnx import Kokoro
                pick = lambda *n: next(os.path.join(models, x) for x in n if os.path.exists(os.path.join(models, x)))
                kok = Kokoro(pick("kokoro-v1.0.int8.onnx", "kokoro.onnx"), pick("voices-v1.0.bin", "voices.bin"))
            x, r = kok.create(say, voice=cfg["voice"][1], speed=1.05, lang=cfg["voice"][2]); sf.write(raw, x, r)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", trim, "-ar", str(SR), "-ac", "1", w], check=True)
        d = sf.info(w).duration; tl.append({"line": line, "a": round(t, 2), "b": round(t + d, 2)}); t += d + gap
    total = round(t + TAIL, 2); N = int(total * SR)
    json.dump({"total": total, "lines": tl}, open(os.path.join(out, "timeline.json"), "w"), ensure_ascii=False, indent=1)
    V = np.zeros(N); P = np.zeros(N); K = np.zeros(N)
    def put(buf, s, at, g=1.):
        i = int(at * SR); s = s[: max(0, N - i)] * g; buf[i:i + len(s)] += s
    for i, l in enumerate(tl):
        a, _ = sf.read(os.path.join(out, f"{i}.wav")); put(V, a, l["a"])
    def pad(ms, l, bright):
        x = np.arange(int(l * SR)) / SR; y = sum(2 * ((x * 440 * 2 ** ((m - 69) / 12) * (1 + d) + ph) % 1) - 1 for m in ms for d, ph in ((-.0015, .1), (.0012, .6)))
        return lp(y / (2 * len(ms)), bright) * np.minimum(1, x / .8) * np.minimum(1, (l - x) / .8)
    ch = [[48, 52, 55, 36], [55, 59, 62, 43], [57, 60, 64, 45], [53, 57, 60, 41]]
    for k, at in enumerate(np.arange(0, total, 2.5)): put(P, pad(ch[k % 4], 3.3, 900 + 60 * k), max(0, at - .2), .5)
    def kick():
        x = np.arange(int(.35 * SR)) / SR; f = 45 + 80 * np.exp(-x * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9)
    for b in np.arange(.2, total - 2.5, 60 / 96): put(K, kick(), b, .45)
    fade = np.minimum(1, (total - np.arange(N) / SR) / 1.5)
    for name, bed in (("mix.wav", P * .2 + K * .18), ("mix-nomusic.wav", 0 * P)):
        y = (V + bed) * fade; y = y / (np.abs(y).max() + 1e-9) * .9; tmp = os.path.join(out, "pre.wav"); sf.write(tmp, np.stack([y, y], 1), SR)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", os.path.join(out, name)], check=True)
    print(lang, total, [l["a"] for l in tl])
