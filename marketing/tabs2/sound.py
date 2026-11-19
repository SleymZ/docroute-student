"""Own synthesized bed for the tabs video: key clicks and tab pops that speed
up with the tab counter, a clock tick, a hard stop and swoosh on "Close them",
then a soft chord. No third-party audio. python3 sound.py out/bed.wav"""
import sys, numpy as np
from scipy.io import wavfile
SR, T = 44100, 13.5; n = int(SR * T); L = np.zeros(n); R = np.zeros(n); t = np.arange(n) / SR
rng = np.random.default_rng(2)
def add(s, at, g=1.0, pan=0.0):
    i = int(at * SR); j = min(n, i + len(s)); s = s[: j - i] * g; L[i:j] += s * (1 - pan); R[i:j] += s * (1 + pan)
def env(d, k): x = np.arange(int(d * SR)) / SR; return x, np.exp(-x * k)
def pop(f): x, e = env(.08, 60); return np.sin(2 * np.pi * f * x * (1 + .5 * np.exp(-x * 50))) * e
def key(): x, e = env(.03, 200); return rng.standard_normal(len(x)) * e * .5
def kick(): x, e = env(.3, 14); return np.sin(2 * np.pi * np.cumsum(48 * (1 + 2.5 * np.exp(-x * 40))) / SR) * e
# tab openings follow the same curve as tabs2.html: count(t) = 1 + 62 * ((t - .8) / 7.2) ** 1.8
import math
prev = 1
for i in range(int(.8 * 1000), 8000, 5):
    x = i / 1000; c = 1 + int(62 * ((x - .8) / 7.2) ** 1.8)
    if c > prev:
        for _ in range(c - prev): add(pop(700 + 12 * c + rng.uniform(-40, 40)), x, .35 + .25 * c / 63, rng.uniform(-.6, .6))
        prev = c
for k in range(int(8 / .11)):
    x = .3 + k * .11 * (1 - .5 * k / 73)
    if x < 8: add(key(), x, .5, rng.uniform(-.4, .4))
# heartbeat-like kick that speeds up
x = .8
while x < 8:
    add(kick(), x, .5 + .4 * x / 8); x += .75 - .45 * x / 8
# silence at 8.0, swoosh + thump on "Close them" collapse
x0 = 8.6; d = np.arange(int(.6 * SR)) / SR
add(rng.standard_normal(len(d)) * np.sin(np.pi * d / .6) ** 2 * .5, x0)
add(kick(), 9.15, 1.0)
env2 = np.clip((t - 9.2) / .5, 0, 1) * np.clip((13.5 - t) / .8, 0, 1)
for i, f in enumerate([196, 246.9, 293.7, 392, 493.9]):
    s = np.sin(2 * np.pi * f * t + i) * .05 * env2; L += s; R += s * .9
st = np.stack([L, R], 1); st /= np.abs(st).max() / .9
wavfile.write(sys.argv[1], SR, (st * 32767).astype(np.int16))
