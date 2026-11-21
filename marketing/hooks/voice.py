"""Voice-over for the hooks series (en, hi): one line per scene, the scene
timeline (each scene lasts as long as its line) and one voice track per
video, with no music (music is added in the app).
python3 marketing/hooks/voice.py [ids...]
Kokoro (pip kokoro-onnx; kokoro-onnx GitHub release model-files-v1.0):
English am_michael, Hindi hm_omega. Path: KOKORO_DIR (default /tmp/tts)."""
import json, os, subprocess, sys
import numpy as np, soundfile as sf

here = os.path.dirname(os.path.abspath(__file__))
KOKORO_DIR = os.environ.get("KOKORO_DIR", "/tmp/tts")
SR, GAP, PRE, HOLD = 44100, 0.22, 0.05, 1.8
scripts = json.load(open(os.path.join(here, "scripts.json")))
ids = [k for k in scripts if not sys.argv[1:] or any(k.startswith(p) for p in sys.argv[1:])]
out = os.path.join(here, "out"); tmp = os.path.join(out, "voice"); os.makedirs(tmp, exist_ok=True)
tl_path = os.path.join(out, "timeline.json")
timeline = json.load(open(tl_path)) if os.path.exists(tl_path) else {}
quiet = dict(stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
kok = None

VOICES = {"en": ("am_michael", "en-us", 1.1), "hi": ("hm_omega", "hi", 1.05)}

def synth(lang, text, raw):
    global kok
    if kok is None:
        from kokoro_onnx import Kokoro
        kok = Kokoro(os.path.join(KOKORO_DIR, "kokoro-v1.0.int8.onnx"), os.path.join(KOKORO_DIR, "voices-v1.0.bin"))
    voice, code, speed = VOICES[lang]
    samples, sr = kok.create(text, voice=voice, speed=speed, lang=code)
    sf.write(raw, samples, sr)

TRIM = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,highpass=f=70,loudnorm=I=-16:TP=-1.5"
for vid in ids:
    timeline.setdefault(vid, {})
    for lang in ("en", "hi"):
        scenes, clips, t, track = scripts[vid][lang]["scenes"], [], PRE, []
        for i, s in enumerate(scenes):
            raw, wav = os.path.join(tmp, f"{vid}-{lang}-{i}-raw.wav"), os.path.join(tmp, f"{vid}-{lang}-{i}.wav")
            synth(lang, s["say"], raw)
            subprocess.run(["ffmpeg", "-y", "-i", raw, "-af", TRIM, "-ar", str(SR), "-ac", "1", wav], **quiet)
            y, _ = sf.read(wav); dur = len(y) / SR
            at = t; t += dur
            until = t + (HOLD if i == len(scenes) - 1 else GAP)
            clips.append({"at": round(at if i else 0, 3), "speechAt": round(at, 3), "speech": round(dur, 3), "until": round(until, 3)})
            track.append((at, y)); t = until
        total = t
        mix = np.zeros(int(total * SR) + 1)
        for at, y in track: i = int(at * SR); mix[i:i + len(y)] += y
        sf.write(os.path.join(out, f"{vid}-{lang}-voice.wav"), mix, SR)
        timeline[vid][lang] = {"total": round(total, 3), "scenes": clips}
        print(vid, lang, round(total, 1), "s")
json.dump(timeline, open(tl_path, "w"), indent=1)
