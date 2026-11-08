"""Voice-over for the story video: one WAV per line plus timings.json.
python3 tts.py <models dir> <lang...>
Russian: RHVoice (apt: rhvoice rhvoice-russian), male voice aleksandr-hq.
Others: Kokoro (pip: kokoro-onnx; model files from the kokoro-onnx GitHub
release model-files-v1.0: kokoro-v1.0.int8.onnx, voices-v1.0.bin)."""
import json, os, subprocess, sys
import soundfile as sf
here = os.path.dirname(os.path.abspath(__file__))
models, langs = sys.argv[1], sys.argv[2:]
T = json.load(open(os.path.join(here, "texts.json")))
KOKORO = {"en": ("am_michael", "en-us", 1.0), "es": ("em_alex", "es", 1.0), "hi": ("hm_omega", "hi", 1.0), "zh": ("zm_yunxi", "cmn", 1.0)}
out = os.path.join(here, "out", "voice"); os.makedirs(out, exist_ok=True)
kok = None
timings = {}
tf = os.path.join(out, "timings.json")
if os.path.exists(tf): timings = json.load(open(tf))
for lang in langs:
    durs = []
    for i, line in enumerate(T[lang]["lines"]):
        say = line
        for k, v in T[lang]["say"].items(): say = say.replace(k, v)
        wav = os.path.join(out, f"{lang}-{i}.wav")
        if lang == "ru":
            subprocess.run(["RHVoice-test", "-p", "aleksandr-hq", "-r", "100", "-o", wav], input=say.encode(), check=True)
        else:
            if kok is None:
                from kokoro_onnx import Kokoro
                kok = Kokoro(os.path.join(models, "kokoro.onnx"), os.path.join(models, "voices.bin"))
            voice, code, speed = KOKORO[lang]
            samples, sr = kok.create(say, voice=voice, speed=speed, lang=code)
            sf.write(wav, samples, sr)
        info = sf.info(wav); durs.append(round(info.frames / info.samplerate, 3))
    timings[lang] = durs
    print(lang, durs, round(sum(durs), 1))
json.dump(timings, open(tf, "w"), indent=1)
