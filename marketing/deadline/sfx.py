"""Sound bed for the deadline video (synthesized, no samples).
python3 sfx.py <seconds> <bed.wav> <sfx-only.wav>
0–3.1: a clock ticking faster, a heavy hit on every number (0, 0.9, 1.6) and a
bigger one on "missed" (2.3) → 3.1: sudden silence (the drop) → from 3.6 a soft
pad that warms up; sfx-only.wav keeps the opening and leaves the rest silent."""
import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
dur, bed_out, sfx_out = float(sys.argv[1]), sys.argv[2], sys.argv[3]
SR = 44100; N = int(dur * SR); rng = np.random.default_rng(5)
A = np.zeros(N); P = np.zeros(N)
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
def put(buf, s, at, g=1.0):
    i = int(at * SR); s = s[: max(0, N - i)] * g; buf[i:i + len(s)] += s
def hit(big=False):
    l = 1.6 if big else .9; t = np.arange(int(l * SR)) / SR
    f = 38 + (120 if big else 90) * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (2.2 if big else 4.5))
    crack = hp(rng.standard_normal(len(t)), 1500) * np.exp(-t * (25 if big else 40)) * .5
    return body + crack
def tick(f=2600):
    t = np.arange(int(.03 * SR)) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t * 180) + hp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 300) * .3
# ticking: 4 per second, faster each number, stops at the "missed" hit
t = 0.0; i = 0
while t < 2.3:
    rate = 4 if t < .9 else 6 if t < 1.6 else 9
    put(A, tick(2600 if i % 2 else 2100), t, .35); t += 1 / rate; i += 1
for h in (0.0, 0.9, 1.6): put(A, hit(), h, .9)
put(A, hit(True), 2.3, 1.2)
# a low alarm drone under "missed", cut at 3.1
tt = np.arange(int(.8 * SR)) / SR
drone = (np.sin(2 * np.pi * 55 * tt) + .4 * np.sin(2 * np.pi * 82.5 * tt)) * np.minimum(1, tt / .05) * .35
put(A, lp(drone, 400), 2.3)
A[int(3.1 * SR):] = 0                       # the drop: dead silence
# the calm pad (A minor → F → C → G), from 3.6, slowly brighter
def pad(ms, l, bright):
    t = np.arange(int(l * SR)) / SR; y = sum(2 * ((t * 440 * 2 ** ((m - 69) / 12) * (1 + d) + ph) % 1) - 1 for m in ms for d, ph in ((-.0015, .1), (.0012, .6)))
    return lp(y / (2 * len(ms)), bright) * np.minimum(1, t / 1.0) * np.minimum(1, (l - t) / 1.0)
ch = [[57, 60, 64, 45], [53, 57, 60, 41], [48, 52, 55, 36], [55, 59, 62, 43]]
for k, at in enumerate(np.arange(3.6, dur, 3.0)):
    put(P, pad(ch[k % 4], 3.9, 600 + 220 * k), at - .3, .5)
fade = np.minimum(1, (dur - np.arange(N) / SR) / 1.5)
for name, y in ((bed_out, A + P), (sfx_out, A)):
    y = y * fade; y = y / (np.abs(A + P).max() + 1e-9) * .9
    sf.write(name, np.stack([y, y], 1), SR)
