"""Russian voice, timeline and sound for the Russian-passport video.
python3 marketing/ru-passport/voice.py [piper model.onnx]
Default: Piper neural voice ru-irinia-medium (pip piper-tts; model from the
rhasspy/piper GitHub release v0.0.2, voice-ru-irinia-medium.tar.gz).
Without a model path the old RHVoice aleksandr-hq is used.
→ out/voice/timeline.json, out/mix.wav (voice + hits on the cards + calm pad), out/mix-nomusic.wav"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
here = os.path.dirname(os.path.abspath(__file__)); out = os.path.join(here, "out"); vd = os.path.join(out, "voice"); os.makedirs(vd, exist_ok=True)
LINES = [  # [text, pause after]
    ["С российским паспортом — в Европу?", .45],
    ["Правила меняются постоянно.", .5],
    ["Чехия не принимает заявления на визу и вид на жительство.", .35],
    ["Эстония и Литва не принимают визовые заявления.", .35],
    ["Шенгенские визы — как правило, только однократные.", .35],
    ["А небиометрические паспорта признаёт всё меньше стран.", .9],
    ["И всё это — на десятках сайтов и на разных языках.", .9],
    ["DocRoute собирает это в одном месте.", .5],
    ["Выберите гражданство — и маршрут сразу покажет, что действует для вашего паспорта,", .2],
    ["кто всё ещё может подать, и ссылку на официальный источник.", .6],
    ["Проверьте свою страну, прежде чем подавать документы. Начать можно бесплатно.", 0],
]
SR, LEAD, TAIL = 44100, .2, 2.6
trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse"
t, tl = LEAD, []
for i, (line, gap) in enumerate(LINES):
    raw, w = os.path.join(vd, f"{i}-raw.wav"), os.path.join(vd, f"{i}.wav")
    say = line.replace("DocRoute", "Док Рут")
    if len(sys.argv) > 1:
        subprocess.run([sys.executable, "-m", "piper", "-m", sys.argv[1], "-f", raw, "--length-scale", "0.95"], input=say.encode(), check=True, stderr=subprocess.DEVNULL)
    else:
        subprocess.run(["RHVoice-test", "-p", "aleksandr-hq", "-r", "112", "-o", raw], input=say.encode(), check=True)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", trim, "-ar", str(SR), "-ac", "1", w], check=True)
    d = sf.info(w).duration; tl.append({"line": line, "a": round(t, 2), "b": round(t + d, 2)}); t += d + gap
total = round(t + TAIL, 2); N = int(total * SR)
json.dump({"total": total, "lines": tl, "slams": [.35, .85, 1.35, 1.85]}, open(os.path.join(vd, "timeline.json"), "w"), ensure_ascii=False, indent=1)
rng = np.random.default_rng(3); lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x); hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
V = np.zeros(N); H = np.zeros(N); P = np.zeros(N)
def put(buf, s, at, g=1.):
    i = int(at * SR); s = s[: max(0, N - i)] * g; buf[i:i + len(s)] += s
for i, l in enumerate(tl):
    a, _ = sf.read(os.path.join(vd, f"{i}.wav")); put(V, a, l["a"])
def hit(l=.8):
    x = np.arange(int(l * SR)) / SR; f = 38 + 95 * np.exp(-x * 18)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 4.5) + hp(rng.standard_normal(len(x)), 1500) * np.exp(-x * 40) * .45
for s in (.35, .85, 1.35, 1.85): put(H, hit(), s, .8)
# a low tense pulse under the facts, gone on the "dozens of sites" line
end_tense = tl[6]["a"]
for k, at in enumerate(np.arange(2.3, end_tense - .2, .9)): put(H, lp(hit(.5), 300), at, .25)
# calm pad from the DocRoute line
def pad(ms, l, bright):
    x = np.arange(int(l * SR)) / SR; y = sum(2 * ((x * 440 * 2 ** ((m - 69) / 12) * (1 + d) + ph) % 1) - 1 for m in ms for d, ph in ((-.0015, .1), (.0012, .6)))
    return lp(y / (2 * len(ms)), bright) * np.minimum(1, x / 1.) * np.minimum(1, (l - x) / 1.)
ch = [[48, 52, 55, 36], [55, 59, 62, 43], [57, 60, 64, 45], [53, 57, 60, 41]]
for k, at in enumerate(np.arange(tl[7]["a"] - .4, total, 3.0)): put(P, pad(ch[k % 4], 3.9, 700 + 150 * k), at, .5)
fade = np.minimum(1, (total - np.arange(N) / SR) / 1.5)
for name, bed in (("mix.wav", H * .55 + P * .22), ("mix-nomusic.wav", H * .55)):
    y = (V + bed) * fade; y = y / (np.abs(y).max() + 1e-9) * .9
    tmp = os.path.join(vd, "pre.wav"); sf.write(tmp, np.stack([y, y], 1), SR)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", os.path.join(out, name)], check=True)
for l in tl: print(l["a"], l["b"], l["line"])
print("total", total)
