"""Own synthesized bed for the pulse video: a heartbeat whose tempo and force
follow the intensity curve (segs.json: start, end, bpm, intensity), hits on the
opening words, a low drone and a warm closing chord. No third-party audio.
python3 sound.py out/bed.wav"""
import json, sys, numpy as np
from scipy.io import wavfile
SR, T = 44100, 22.0
segs = json.load(open(__file__.replace("sound.py", "segs.json")))
n = int(SR * T); L = np.zeros(n); R = np.zeros(n)
t = np.arange(n) / SR
def add(sig, at, pan=0.0):
    i = int(at * SR); j = min(n, i + len(sig)); sig = sig[: j - i]
    L[i:j] += sig * (1 - pan); R[i:j] += sig * (1 + pan)
def thump(f0, dur, amp):
    k = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + 1.5 * np.exp(-k * 40))
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-k * 18)
# heartbeat: lub-dub
for a, b, bpm, inten in segs:
    if not bpm: continue
    x = a
    while x < b - 0.05:
        add(thump(55, 0.35, 0.9 * inten + 0.1), x)
        add(thump(48, 0.3, 0.6 * inten + 0.05), x + 0.16)
        x += 60 / bpm
# opening word hits (0.5 s apart) + noise burst
rng = np.random.default_rng(7)
for k in range(5):
    at = 0.02 + k * 0.5
    nz = rng.standard_normal(int(0.25 * SR)) * np.exp(-np.arange(int(0.25 * SR)) / SR * 22)
    add(0.35 * nz, at, 0.2 * (-1) ** k); add(thump(70, 0.4, 0.8), at)
# rapid list hits in the 70% section
for k in range(6):
    at = 6.6 + k * 0.6
    nz = rng.standard_normal(int(0.15 * SR)) * np.exp(-np.arange(int(0.15 * SR)) / SR * 35)
    add(0.22 * nz, at, 0.3 * (-1) ** k)
# drone that follows intensity
inten = np.zeros(n)
for a, b, _, v in segs: inten[int(a * SR): int(b * SR)] = v
inten = np.convolve(inten, np.ones(4410) / 4410, mode="same")
drone = (np.sin(2 * np.pi * 41.2 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t + 0.3) + 0.25 * np.sin(2 * np.pi * 123.6 * t)) * 0.12 * inten
L += drone; R += drone
# warm closing chord (D major add9) from 17.5 s
env = np.clip((t - 17.5) / 1.2, 0, 1) * np.clip((22 - t) / 1.5, 0, 1)
for i, f in enumerate([146.8, 220.0, 293.7, 370.0, 440.0, 659.3]):
    s = np.sin(2 * np.pi * f * t + i) * (0.05 if f < 400 else 0.03) * env * (1 + 0.1 * np.sin(2 * np.pi * 0.3 * t + i))
    L += s * (1 - 0.15 * (i % 2)); R += s * (0.85 + 0.15 * (i % 2))
st = np.stack([L, R], 1); st /= np.abs(st).max() / 0.9
wavfile.write(sys.argv[1], SR, (st * 32767).astype(np.int16))
