"""Own synthesized bed for the quiz: soft beat, a clock tick during each
3-second timer, a chime on every reveal. No third-party audio.
python3 sound.py out/bed.wav"""
import sys, numpy as np
from scipy.io import wavfile
SR, T = 44100, 26.0; n = int(SR * T); L = np.zeros(n); R = np.zeros(n); t = np.arange(n) / SR
rng = np.random.default_rng(11)
def add(s, at, g=1.0, pan=0.0):
    i = int(at * SR); j = min(n, i + len(s)); s = s[: j - i] * g; L[i:j] += s * (1 - pan); R[i:j] += s * (1 + pan)
def env(d, k): x = np.arange(int(d * SR)) / SR; return x, np.exp(-x * k)
def kick(): x, e = env(.3, 16); return np.sin(2 * np.pi * np.cumsum(52 * (1 + 2 * np.exp(-x * 45))) / SR) * e
def tick(f): x, e = env(.04, 150); return np.sin(2 * np.pi * f * x) * e
def chime():
    x, e = env(1.4, 3.5); return sum(np.sin(2 * np.pi * f * x) * a for f, a in [(784, .5), (988, .35), (1175, .3), (1568, .15)]) * e
def whoosh():
    x, e = env(.4, 6); return rng.standard_normal(len(x)) * np.sin(np.pi * x / .4) * .3
beat = 60 / 100
b = 0.0
while b < 25.5:
    k = round(b / beat)
    inq = any(s + 1.2 <= b < s + 4.2 for s in (2, 8.5, 15))
    if k % 2 == 0: add(kick(), b, .35 if inq else .6)
    b += beat
for s in (2, 8.5, 15):
    add(whoosh(), s, .8)
    for k in range(6): add(tick(1600 if k % 2 == 0 else 1200), s + 1.2 + k * .5, .5, .3 * (-1) ** k)
    add(chime(), s + 4.2, .7)
add(whoosh(), 21.5, .8); add(chime(), 21.7, .5)
pad = sum(np.sin(2 * np.pi * f * t + f) for f in [130.8, 196, 261.6, 329.6]) * .025
L += pad; R += pad
fade = np.clip(t / .05, 0, 1) * np.clip((T - t) / .6, 0, 1)
st = np.stack([L * fade, R * fade], 1); st /= np.abs(st).max() / .9
wavfile.write(sys.argv[1], SR, (st * 32767).astype(np.int16))
