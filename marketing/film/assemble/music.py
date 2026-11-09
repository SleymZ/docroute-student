"""Original score for the DocRoute short film (synthesized; no samples, no third-party music).
python3 music.py <seconds> <out.wav>
96 bpm, a downbeat on 40.1 s (the end card). Am – F – C – G.
A 0–10.1 lonely piano · B 10.1–15.1 arpeggios + pulse · C 15.1–25.1 full lift (summit)
D 25.1–30.1 piano alone ("here's what I realized") · E 30.1–37.6 rebuild · riser 37.6–40.1
G 40.1– warm chord and a soft beat, the last chord rings out."""
import sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

dur, out = float(sys.argv[1]), sys.argv[2]
# optional third argument: JSON {"end": hit time, "b": .., "c": .., "d": .., "e": ..} section starts (another language)
import json as _json
P = _json.loads(sys.argv[3]) if len(sys.argv) > 3 else {"end": 40.1, "b": 10.1, "c": 15.1, "d": 25.1, "e": 30.1}
SR = 44100; N = int(dur * SR); rng = np.random.default_rng(11)
BEAT = 60 / 96; BAR = 4 * BEAT; END = P["end"]; T0 = END - np.floor(END / BAR) * BAR   # bars land on the end card
snap = lambda x: T0 + round((x - T0) / BAR) * BAR
SB, SC, SD, SE = snap(P["b"]), snap(P["c"]), snap(P["d"]), snap(P["e"]); SR_, SG, SZ = END - BAR, END, END + 2 * BAR
L = np.zeros((N, 2)); DRY = np.zeros((N, 2))                  # L goes to the reverb, DRY does not

def put(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig, i = sig[-i:], 0
    s = sig[: N - i] * gain
    buf[i:i + len(s), 0] += s * np.sqrt(.5 * (1 - pan)); buf[i:i + len(s), 1] += s * np.sqrt(.5 * (1 + pan))

def lp(x, f, order=2): return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

def piano(m, length=3.0, vel=.6):
    f = mtof(m); t = np.arange(int(length * SR)) / SR; y = np.zeros_like(t)
    for k in range(1, 10):
        fk = f * k * np.sqrt(1 + .00035 * k * k)
        if fk > 12000: break
        y += np.sin(2 * np.pi * fk * t + rng.uniform(0, 6)) * (1 / k ** 1.25) * np.exp(-t * (.9 + .55 * k) * (f / 260) ** .35)
    ham = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 60) * .15
    env = np.minimum(1, t / .004) * np.minimum(1, (length - t) / .25)
    return (y + ham) * env * vel * (.75 + .25 * vel)

def pad(ms, length, bright=1200, att=1.2):
    t = np.arange(int(length * SR)) / SR; y = np.zeros_like(t)
    for m in ms:
        for det in (-.11, 0, .09):
            f = mtof(m) * 2 ** (det / 12); ph = rng.uniform(0, 1)
            y += 2 * ((t * f + ph) % 1) - 1
    y = lp(y, bright, 2) / (len(ms) * 3)
    env = np.minimum(1, t / att) * np.minimum(1, (length - t) / 1.2)
    return y * env

def bass(m, length):
    t = np.arange(int(length * SR)) / SR; f = mtof(m)
    y = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t)
    return lp(y, 600) * np.minimum(1, t / .01) * np.exp(-t * 1.6) * np.minimum(1, (length - t) / .05)

def kick():
    t = np.arange(int(.45 * SR)) / SR; f = 42 + 95 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + lp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 150) * .2
def clap():
    t = np.arange(int(.3 * SR)) / SR; n = bp(rng.standard_normal(len(t)), 900, 4000)
    env = sum(np.exp(-np.maximum(0, t - d) * 40) * (t >= d) for d in (0, .012, .024)) / 3
    return n * env * 1.4
def shaker():
    t = np.arange(int(.08 * SR)) / SR; return hp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 60) * np.minimum(1, t / .01)
def bell(m, length=2.5):
    t = np.arange(int(length * SR)) / SR; f = mtof(m)
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3)) * np.exp(-t * 1.4) * np.minimum(1, t / .005)

CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G (A3…)
ROOT = [45, 41, 48, 43]
MELODY = [76, 74, 72, 71, 72, 67, 69, 72]                          # a simple hopeful line (E5 D5 C5 B4 …)

nbars = int(np.ceil((dur - T0) / BAR)) + 1
for b in range(-1, nbars):
    t = T0 + b * BAR; ch = CH[b % 4]; root = ROOT[b % 4]
    if t + BAR < 0 or t >= dur - .3: continue
    sec = "A" if t < SB else "B" if t < SC else "C" if t < SD else "D" if t < SE else "E" if t < SR_ else "R" if t < SG else "G"
    if t >= SZ: sec = "Z"
    # piano
    if sec in "AD":
        q = .45 if sec == "A" else .6
        put(L, piano(ch[0] + 12, 4, .5), t, q, -.2); put(L, piano(ch[1] + 12, 4, .38), t + BEAT * 1.5, q, .1); put(L, piano(ch[2] + 12, 4, .42), t + BEAT * 3, q, .25)
        put(L, piano(root, 4, .45), t, q * .7)
    elif sec in "BE":
        for i in range(8):
            m = (ch + [ch[0] + 12])[[0, 1, 2, 3, 2, 1, 2, 3][i]] + 12
            put(L, piano(m, 1.6, .32 + .08 * (i % 2 == 0)), t + i * BEAT / 2, .8, -.3 + .6 * (i % 4) / 3)
        put(L, piano(root, 3, .45), t, .7)
    elif sec in "CG":
        for k, m in enumerate(ch): put(L, piano(m + 12, 2.4, .5), t, .55, -.3 + .3 * k); put(L, piano(m + 12, 2.4, .38), t + 2 * BEAT, .5, -.3 + .3 * k)
        for i in range(8):
            m = (ch + [ch[0] + 12])[[0, 2, 1, 3, 0, 2, 1, 3][i]] + 24
            put(L, piano(m, 1.0, .25), t + i * BEAT / 2, .45, .4 - .8 * (i % 2))
        put(L, bell(MELODY[(2 * b) % 8]), t, .14, .2); put(L, bell(MELODY[(2 * b + 1) % 8]), t + 2 * BEAT, .12, -.2)
    elif sec == "R":
        put(L, piano(ch[0] + 12, 2.5, .4), t, .7)
    elif sec == "Z":
        pass
    # pads
    if sec != "Z":
        bright = {"A": 700, "D": 800, "B": 1100, "E": 1300, "C": 2400, "R": 1800, "G": 2200}[sec]
        gain = {"A": .05, "D": .07, "B": .12, "E": .15, "C": .30, "R": .26, "G": .24}[sec]
        put(L, pad([m + 12 for m in ch] + [ch[0]], BAR + 1.2, bright, .9 if sec != "A" else 1.6), t - .2, gain)
    # rhythm
    if sec == "B":
        put(DRY, kick(), t, .35)
    if sec in "EC G" and sec != " ":
        lvl = {"E": .5, "C": 1.0, "G": .6}.get(sec, 0)
        if lvl:
            for i in range(4): put(DRY, kick(), t + i * BEAT, lvl)
            if sec in "CG":
                for i in (1, 3): put(L, clap(), t + i * BEAT, .22 * lvl)
                for i in range(16): put(DRY, shaker(), t + i * BEAT / 4, .05 + .03 * (i % 2 == 0), .5 - (i % 3) * .5)
            for i in range(4): put(DRY, bass(root, BEAT * .9), t + i * BEAT + (BEAT / 2 if sec == "C" else 0), .28 * lvl)

# riser into the end card and the hit on 40.1
r = np.arange(int(2.5 * SR)) / SR; noise = rng.standard_normal(len(r))
sweep = np.concatenate([bp(noise[i:i + 2205], 300 + 6000 * (i / len(r)) ** 2, 800 + 9000 * (i / len(r)) ** 2) for i in range(0, len(r), 2205)])[: len(r)]
put(L, sweep * (r / 2.5) ** 2.5, END - BAR, 1.1)
for i in range(8): put(DRY, kick(), END - BAR + i * BEAT / 2 * (1 - i / 16), .12 + .05 * i)   # a building pulse into the hit
boom = np.sin(2 * np.pi * np.cumsum(38 + 40 * np.exp(-np.arange(int(2 * SR)) / SR * 6)) / SR) * np.exp(-np.arange(int(2 * SR)) / SR * 1.8)
put(DRY, boom, END, .6)
for k, m in enumerate([57, 60, 64, 69, 72]): put(L, piano(m, 9, .55), SZ, .55, -.4 + .2 * k)     # the last chord rings out
put(L, pad([57, 60, 64, 69], 7, 1500, 1.0), SZ, .16)

# reverb: a 3 s decaying noise tail, wider on the right
ir_t = np.arange(int(3.0 * SR)) / SR
ir = np.stack([lp(rng.standard_normal(len(ir_t)), 7000) * np.exp(-ir_t * 2.1) for _ in range(2)], 1); ir[:1500] *= np.linspace(0, 1, 1500)[:, None]
wet = np.stack([fftconvolve(L[:, c], ir[:, c])[:N] for c in range(2)], 1)
mix = L * .75 + wet / np.abs(wet).max() * np.abs(L).max() * .55 + DRY
mix = hp(mix.T, 30).T
mix *= np.minimum(1, np.arange(N) / SR / .6)[:, None] * np.minimum(1, (dur - np.arange(N) / SR) / 1.5)[:, None]
mix /= np.abs(mix).max() + 1e-9; mix *= .9
sf.write(out, mix, SR)
