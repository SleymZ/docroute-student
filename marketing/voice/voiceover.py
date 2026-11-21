"""Adds a voice-over to an already rendered video (promo or teen).
python3 marketing/voice/voiceover.py <promo|teen> <kokoro models dir> <lang...>
Reads marketing/<video>/voice.json: "slots" = [start, end] seconds of each
scene, one line per slot per language. Each line is spoken from its slot's
start; a line longer than its slot is sped up (at most 1.3×) and reported
if it still does not fit. Output: marketing/<video>/out/DocRoute-<name>-voice-<lang>.mp4
(video stream copied, new audio). Voices as in marketing/story/tts.py."""
import json, os, subprocess, sys
import soundfile as sf

here = os.path.dirname(os.path.abspath(__file__))
video, models, langs = sys.argv[1], sys.argv[2], sys.argv[3:]
base = os.path.join(here, "..", video)
cfg = json.load(open(os.path.join(base, "voice.json")))
name = {"promo": "promo", "teen": "unis"}[video]
KOKORO = {"en": ("am_michael", "en-us"), "es": ("em_alex", "es"), "hi": ("hm_omega", "hi"), "zh": ("zm_yunxi", "cmn")}
# how the engines should read the brand and abbreviations
SAY = {
    "en": {"DocRoute": "Doc Root", "PDFs": "P D Fs"},
    "ru": {"DocRoute": "Док Рут", "PDF": "пэдээф", "Топ-100": "Топ-сто"},
    "es": {"DocRoute": "Dok Rut", "PDF": "pe de efe"},
    "zh": {"DocRoute": "DocRoute"},
    "hi": {"DocRoute": "डॉक रूट", "PDF": "पीडीएफ़", "2,600": "छब्बीस सौ"},
}
out = os.path.join(base, "out"); tmp = os.path.join(out, "voice"); os.makedirs(tmp, exist_ok=True)
run = lambda *a: subprocess.run(list(a), check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
kok = None
for lang in langs:
    lines, slots, wavs = cfg[lang], cfg["slots"], []
    for i, (line, (a, b)) in enumerate(zip(lines, slots)):
        say = line
        for k, v in SAY[lang].items(): say = say.replace(k, v)
        raw, wav = os.path.join(tmp, f"{lang}-{i}-raw.wav"), os.path.join(tmp, f"{lang}-{i}.wav")
        if lang == "ru":
            subprocess.run(["RHVoice-test", "-p", "aleksandr-hq", "-r", "115", "-o", raw], input=say.encode(), check=True)
        else:
            if kok is None:
                from kokoro_onnx import Kokoro
                pick = lambda *names: next(os.path.join(models, n) for n in names if os.path.exists(os.path.join(models, n)))
                kok = Kokoro(pick("kokoro-v1.0.int8.onnx", "kokoro.onnx"), pick("voices-v1.0.bin", "voices.bin"))
            voice, code = KOKORO[lang]
            samples, sr = kok.create(say, voice=voice, speed=1.05, lang=code)
            sf.write(raw, samples, sr)
        trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse"
        run("ffmpeg", "-y", "-i", raw, "-af", trim, "-ar", "44100", "-ac", "1", wav)
        dur, slot = sf.info(wav).duration, b - a
        if dur > slot:
            tempo = min(dur / slot, 1.3)
            run("ffmpeg", "-y", "-i", wav, "-af", f"atempo={tempo:.3f}", os.path.join(tmp, "t.wav"))
            os.replace(os.path.join(tmp, "t.wav"), wav); dur = sf.info(wav).duration
            if dur > slot + 0.05: print(f"  {video} {lang} line {i + 1} is {dur - slot:.2f}s longer than its scene")
        wavs.append((wav, a))
    src = os.path.join(out, f"DocRoute-{name}-{lang}.mp4")
    total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], capture_output=True, text=True).stdout)
    inputs = ["-i", src]
    if video == "promo":  # the promo has a silent track: a quiet pad goes under the voice
        pad = os.path.join(tmp, "pad.wav")
        if not os.path.exists(pad): run("python3", os.path.join(here, "..", "story", "pad.py"), str(total), pad)
        inputs += ["-i", pad]; bed = "[1:a]volume=0.16[bed]"
    else:                 # the teen video keeps its beat, lowered under the voice
        bed = "[0:a]volume=0.42[bed]"
        inputs += ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"]
    for w, _ in wavs: inputs += ["-i", w]
    fc = bed + ";" + ";".join(f"[{i + 2}:a]aformat=channel_layouts=stereo,adelay={int(a * 1000)}|{int(a * 1000)}[v{i}]" for i, (_, a) in enumerate(wavs))
    fc += ";" + "".join(f"[v{i}]" for i in range(len(wavs))) + f"amix=inputs={len(wavs)}:normalize=0[vo];[bed][vo]amix=inputs=2:normalize=0:duration=first,atrim=0:{total},loudnorm=I=-14:TP=-1.5:LRA=11[a]"
    dst = os.path.join(out, f"DocRoute-{name}-voice-{lang}.mp4"); part = dst[:-4] + ".tmp.mp4"
    run("ffmpeg", "-y", *inputs, "-filter_complex", fc, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", part)
    os.replace(part, dst)
    print("done", video, lang)
