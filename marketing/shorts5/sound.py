"""Own synthesized bed for the Shorts checklist: soft 96 bpm beat, warm pad,
a pop on every number and a click on every tick. No third-party audio.
python3 sound.py out/bed.wav"""
import sys, numpy as np
from scipy.io import wavfile
SR, T = 44100, 27.0
n = int(SR * T); L = np.zeros(n); R = np.zeros(n); t = np.arange(n) / SR
rng = np.random.default_rng(3)
def add(s, at, g=1.0, pan=0.0):
    i = int(at * SR); j = min(n, i + len(s)); s = s[: j - i] * g
    L[i:j] += s * (1 - pan); R[i:j] += s * (1 + pan)
def env(d, k): x = np.arange(int(d * SR)) / SR; return x, np.exp(-x * k)
def kick(): x, e = env(.3, 16); return np.sin(2 * np.pi * np.cumsum(50 * (1 + 2 * np.exp(-x * 45))) / SR) * e
def hat(): x, e = env(.06, 70); return rng.standard_normal(len(x)) * e * .25
def pop(f): x, e = env(.25, 14); return np.sin(2 * np.pi * f * x) * e * .5 + np.sin(2 * np.pi * 2 * f * x) * e * .15
def click(): x, e = env(.05, 120); return (np.sin(2 * np.pi * 2400 * x) + .4 * rng.standard_normal(len(x))) * e * .4
beat = 60 / 96
b = 0.0
while b < 26.4:
    k = round(b / beat)
    if k % 4 in (0, 2) or k % 8 == 7: add(kick(), b, .55)
    add(hat(), b + beat / 2, .9, .3)
    b += beat
chords = [[220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.7, 392], [164.8, 207.7, 246.9, 329.6]]
for ci in range(8):
    a = ci * 4 * beat
    seg = (t >= a) & (t < a + 4 * beat + .2)
    for f in chords[ci % 4]:
        s = np.sin(2 * np.pi * f * t + f) * .035 * (1 + .2 * np.sin(2 * np.pi * .5 * t))
        L[seg] += s[seg]; R[seg] += s[seg] * .9
H, IL = 2.4, 4.0
add(pop(523), 0.0, 1.2)
for i in range(5):
    add(pop(392 + 44 * i), H + i * IL, .9); add(click(), H + i * IL + 3.1, 1.0, .2)
for i in range(5): add(click(), H + 5 * IL + .2 + i * .22, .7, -.2)
fade = np.clip((27 - t) / .5, 0, 1) * np.clip(t / .03, 0, 1)
st = np.stack([L * fade, R * fade], 1); st /= np.abs(st).max() / .9
wavfile.write(sys.argv[1], SR, (st * 32767).astype(np.int16))
