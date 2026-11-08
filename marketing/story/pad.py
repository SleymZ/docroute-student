"""Soft synthesized background pad (no samples, no third-party music).
python3 pad.py <seconds> <out.wav>"""
import sys, numpy as np, soundfile as sf
dur, out = float(sys.argv[1]), sys.argv[2]
sr = 44100; n = int(dur * sr); t = np.arange(n) / sr
# A minor – F – C – G, one chord per 4 s, soft sine voices with slow vibrato
chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 261.63, 329.63], [196.0, 246.94, 293.66]]
y = np.zeros(n)
seg = 4.0
for k in range(int(np.ceil(dur / seg)) + 1):
    a = k * seg - 0.8; b = a + seg + 1.6
    i0, i1 = max(0, int(a * sr)), min(n, int(b * sr))
    if i0 >= i1: continue
    tt = t[i0:i1]; env = np.sin(np.pi * np.clip((tt - a) / (b - a), 0, 1)) ** 2
    for f in chords[k % 4]:
        for det in (-0.6, 0.6):
            y[i0:i1] += env * np.sin(2 * np.pi * (f + det) * tt + 0.3 * np.sin(2 * np.pi * 0.2 * tt)) * 0.06
        y[i0:i1] += env * np.sin(2 * np.pi * f / 2 * tt) * 0.04
fade = np.clip(t / 2.0, 0, 1) * np.clip((dur - t) / 2.5, 0, 1)
y *= fade; y /= max(1e-9, np.abs(y).max()); y *= 0.5
sf.write(out, np.stack([y, y], 1), sr)
