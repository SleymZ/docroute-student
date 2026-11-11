"""Sound for the chat video: a pop for every received message, a swoosh for
every sent one, soft typing ticks, and a light lo-fi beat (synthesized).
python3 sound.py <schedule.json> <mix.wav> <sfx-only.wav>"""
import json, sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
S = json.load(open(sys.argv[1])); SR = 44100; dur = S["total"]; N = int(dur * SR); rng = np.random.default_rng(9)
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x); hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
FX = np.zeros(N); MU = np.zeros(N)
def put(buf, s, at, g=1.):
    i = int(at * SR)
    if i >= N: return
    s = s[: N - i] * g; buf[i:i + len(s)] += s
def pop():
    t = np.arange(int(.12 * SR)) / SR; f = 900 + 700 * np.exp(-t * 60); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38)
def swoosh():
    t = np.arange(int(.22 * SR)) / SR; n = hp(lp(rng.standard_normal(len(t)), 5000), 800); return n * np.sin(np.pi * t / .22) ** 2 * .6
def tick():
    t = np.arange(int(.02 * SR)) / SR; return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 300) * .25
for m in S["msgs"]:
    if m["who"] == "f":
        for x in np.arange(m["typing"], m["at"] - .05, .16): put(FX, tick(), x + rng.uniform(0, .04), .5)
        put(FX, pop(), m["at"], .8)
    else: put(FX, swoosh(), m["at"] - .05, .9)
put(FX, swoosh(), S["end"], 1.2)
# lo-fi beat: 84 bpm, soft kick/snare, warm chords Fmaj7 Em7 Dm7 Cmaj7
B = 60 / 84; ch = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
def note(m, l, g):
    t = np.arange(int(l * SR)) / SR; f = 440 * 2 ** ((m - 69) / 12)
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 1.2) * np.minimum(1, t / .02) * g
def kick():
    t = np.arange(int(.3 * SR)) / SR; f = 50 + 60 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)
def snare():
    t = np.arange(int(.2 * SR)) / SR; return lp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 22) * .5
for b in range(int(dur / B) + 1):
    t0 = .2 + b * B; bar = b // 4
    if t0 > dur - .5: break
    if b % 4 == 0:
        for k, m in enumerate(ch[bar % 4]): put(MU, note(m, 4 * B, .12), t0 + k * .02)
    put(MU, kick(), t0, .45 if b % 2 == 0 else 0)
    if b % 2 == 1: put(MU, snare(), t0, .35)
    put(MU, hp(rng.standard_normal(int(.03 * SR)), 7000) * np.exp(-np.arange(int(.03 * SR)) / SR * 150) * .12, t0 + B / 2)
MU = lp(MU, 3500)                                            # lo-fi: muffled top
fade = np.minimum(1, np.arange(N) / SR / .5) * np.minimum(1, (dur - np.arange(N) / SR) / 1.2)
for name, y in ((sys.argv[2], FX + MU * .8), (sys.argv[3], FX)):
    y = y * fade; y = y / (np.abs(FX + MU * .8).max() + 1e-9) * .9; sf.write(name, np.stack([y, y], 1), SR)
