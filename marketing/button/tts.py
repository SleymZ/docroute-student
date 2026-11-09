"""English voice for the button video (Kokoro am_michael).
python3 marketing/button/tts.py <kokoro models dir>  → out/voice/en-<n>.wav + timings.json"""
import json, os, subprocess, sys
import soundfile as sf
from kokoro_onnx import Kokoro
here = os.path.dirname(os.path.abspath(__file__)); models = sys.argv[1]
pick = lambda *n: next(os.path.join(models, x) for x in n if os.path.exists(os.path.join(models, x)))
k = Kokoro(pick("kokoro-v1.0.int8.onnx", "kokoro.onnx"), pick("voices-v1.0.bin", "voices.bin"))
d = json.load(open(os.path.join(here, "texts.json"))); out = os.path.join(here, "out", "voice"); os.makedirs(out, exist_ok=True)
durs = []
for i, line in enumerate(d["lines"]):
    x, sr = k.create(line.replace("…", ""), voice="am_michael", speed=1.07, lang="en-us")
    raw, wav = os.path.join(out, f"{i}-raw.wav"), os.path.join(out, f"en-{i}.wav"); sf.write(raw, x, sr)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse", "-ar", "44100", "-ac", "1", wav], check=True)
    durs.append(round(sf.info(wav).duration, 3))
json.dump(durs, open(os.path.join(out, "timings.json"), "w")); print(durs)
