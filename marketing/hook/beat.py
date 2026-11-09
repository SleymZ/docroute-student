"""Upbeat 120 bpm track synthesized from scratch (no samples, no third-party
music), matched to the scene timeline in teen.html.
python3 beat.py <seconds> <out.wav> <drop> <reveal> <cuts,comma,separated>
Light (kick + hats) until <drop>, full from there; a riser into <reveal>;
a soft whoosh on every cut."""
import sys, numpy as np, soundfile as sf
dur, out = float(sys.argv[1]), sys.argv[2]
DROP, REVEAL = float(sys.argv[3]), float(sys.argv[4])
CUTS = [float(x) for x in sys.argv[5].split(",") if x]
sr = 44100; n = int(dur * sr); y = np.zeros((n, 2)); B = 0.5  # one beat
def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * sr); j = min(n, i + len(sig))
    if i >= n or j <= i: return
    s = sig[: j - i] * gain
    y[i:j, 0] += s * (1 - max(0, pan)); y[i:j, 1] += s * (1 + min(0, pan))
def env(length, a=0.002, d=0.2):
    t = np.arange(int(length * sr)) / sr; return np.minimum(1, t / a) * np.exp(-t / d)
def kick():
    t = np.arange(int(.35 * sr)) / sr; f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-t * 9)
rng = np.random.default_rng(7)
def hat(l=.05): return rng.standard_normal(int(l * sr)) * env(l, .001, l / 4) * np.r_[0, np.diff(np.ones(int(l * sr)))] + np.diff(np.r_[0, rng.standard_normal(int(l * sr))]) * env(l, .001, l / 4) * .5
def snare():
    l = .22; t = np.arange(int(l * sr)) / sr
    return (np.diff(np.r_[0, rng.standard_normal(len(t))]) * .5 + np.sin(2 * np.pi * 190 * t) * .6) * np.exp(-t * 18)
def saw(f, l, d=.25):
    t = np.arange(int(l * sr)) / sr; s = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 9))
    return s * env(l, .004, d)
# C – G – Am – F, one chord per bar (4 beats)
roots = [65.41, 98.0, 110.0, 87.31]
chords = [[261.63, 329.63, 392.0], [246.94, 293.66, 392.0], [261.63, 329.63, 440.0], [261.63, 349.23, 440.0]]
for b in range(int(dur / B) + 1):
    t0 = b * B; bar = b // 4; ch = bar % 4
    if t0 >= dur - 1.0: break
    full = t0 >= DROP
    add(kick(), t0, .95)
    add(hat(), t0 + B / 2, .22, .3)
    if full: add(hat(.03), t0 + B / 4, .12, -.3); add(hat(.03), t0 + 3 * B / 4, .12, -.3)
    if b % 2 == 1: add(snare(), t0, .55 if full else .4)
    add(saw(roots[ch], .45, .18), t0 + B / 2, .22 if full else .14)          # offbeat bass
    if full or b % 4 in (0, 2):
        for k, f in enumerate(chords[ch]): add(saw(f, .3, .09), t0 + B / 2, .05, (k - 1) * .4)  # stab
# riser into the drop at 9.0 (7.0–8.0) and a whoosh on each scene change
l = 1.0; t = np.arange(int(l * sr)) / sr; noise = rng.standard_normal(len(t))
add(np.diff(np.r_[0, noise]) * (t / l) ** 2 * .35, REVEAL - 1.0)
for at in CUTS:
    w = .3; tw = np.arange(int(w * sr)) / sr; add(np.diff(np.r_[0, rng.standard_normal(len(tw))]) * np.sin(np.pi * tw / w) ** 2 * .18, at - .15)
# end: last chord rings out
for f in chords[0]: add(saw(f, 1.6, .5), dur - 1.0, .07)
add(kick(), dur - 1.0, 1.0)
y /= np.abs(y).max() + 1e-9; y *= .85
fade = np.clip((dur - np.arange(n) / sr) / .4, 0, 1)[:, None]
sf.write(out, y * fade, sr)
