"""Own synthesized bed for the departure-board video: a clack for every
split-flap tile as it settles (same timing as biz.html), a soft chime per
board and a low pad. No third-party audio. python3 sound.py out/bed.wav"""
import json, sys, numpy as np
from scipy.io import wavfile
B = json.load(open(__file__.replace("sound.py", "board.json")))
SR, T = 44100, B["total"]; n = int(SR * T); L = np.zeros(n); R = np.zeros(n); t = np.arange(n) / SR
rng = np.random.default_rng(5)
def add(s, at, g, pan=0.0):
    i = int(at * SR); j = min(n, i + len(s)); s = s[: j - i] * g; L[i:j] += s * (1 - pan); R[i:j] += s * (1 + pan)
def clack():
    x = np.arange(int(.035 * SR)) / SR
    return (rng.standard_normal(len(x)) * .6 + np.sin(2 * np.pi * (1800 + rng.uniform(-300, 300)) * x)) * np.exp(-x * 160)
def chime(f):
    x = np.arange(int(1.2 * SR)) / SR
    return (np.sin(2 * np.pi * f * x) + .5 * np.sin(2 * np.pi * 1.5 * f * x)) * np.exp(-x * 4) * .5
for si, sc in enumerate(B["scenes"]):
    st = 0 if si == 0 else B["hook"] + (si - 1) * B["step"]
    rows = ([sc["tag"]] if sc.get("tag") else []) + sc["rows"]
    add(chime(660 if si else 523), st + .05, .5)
    for r, row in enumerate(rows):
        for c in range(B["cols"]):
            at = st + .15 + r * .12 + c * .035
            for k in range(3): add(clack(), at + k * .045, .18, (c / B["cols"] - .5) * .8)
            add(clack(), at + .38, .45 if c < len(row) else .2, (c / B["cols"] - .5) * .8)
add(chime(784), B["end"] + .1, .6)
for r, row in enumerate(["NOW BOARDING", "DOCROUTE"]):
    for c in range(B["cols"]):
        at = B["end"] + .15 + r * .12 + c * .035
        for k in range(3): add(clack(), at + k * .045, .18, (c / B["cols"] - .5) * .8)
        add(clack(), at + .38, .45 if c < len(row) else .2, (c / B["cols"] - .5) * .8)
pad = sum(np.sin(2 * np.pi * f * t + f) for f in [98, 147, 196, 247]) * .03 * np.clip(t / 1.5, 0, 1) * np.clip((T - t) / 1.5, 0, 1)
L += pad; R += pad
s = np.stack([L, R], 1); s /= np.abs(s).max() / .9
wavfile.write(sys.argv[1], SR, (s * 32767).astype(np.int16))
