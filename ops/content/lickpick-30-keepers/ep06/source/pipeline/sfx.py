import numpy as np
from scipy.signal import butter, sosfilt
SR = 48000
rng = np.random.default_rng(7)

def env(n, a, r):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    nr = int(r * SR); e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e

def tick(f=2400, d=0.035, g=0.25):
    n = int(d * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 120) + 0.4 * rng.standard_normal(n) * np.exp(-t * 400)
    return g * x

def whoosh(d=0.5, g=0.35, up=True):
    n = int(d * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); out = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        k = i / n; fc = (300 + 5000 * (k if up else 1 - k) ** 1.5)
        sos = butter(2, [max(80, fc * .6), min(20000, fc * 1.6)], 'band', fs=SR, output='sos')
        out[i:i + blk] = sosfilt(sos, x[i:i + blk])
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return g * out * e / (np.abs(out).max() + 1e-9)

def pop(g=0.4):
    d = 0.18; n = int(d * SR); t = np.arange(n) / SR
    f = 900 * np.exp(-t * 18) + 220
    ph = 2 * np.pi * np.cumsum(f) / SR
    return g * np.sin(ph) * np.exp(-t * 22)

def blip(g=0.22):
    out = []
    for f in (880, 1320):
        n = int(0.09 * SR); t = np.arange(n) / SR
        out.append(np.sin(2 * np.pi * f * t) * np.exp(-t * 30) + 0.3 * np.sin(4 * np.pi * f * t) * np.exp(-t * 50))
    return g * np.concatenate(out)

def sparkle(g=0.12, notes=(2637, 3136, 3951, 5274)):
    out = np.zeros(int(1.2 * SR))
    for i, f in enumerate(notes):
        n = int(0.6 * SR); t = np.arange(n) / SR; s = int(i * 0.07 * SR)
        out[s:s + n] += np.sin(2 * np.pi * f * t) * np.exp(-t * 7)
    return g * out

def sub_hit(f=55, d=1.2, g=0.6):
    n = int(d * SR); t = np.arange(n) / SR
    ff = f * (1 + 1.5 * np.exp(-t * 30))
    return g * np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 3.2)

def place(buf, x, at, stereo=(1, 1)):
    s = int(at * SR)
    if s < 0: x = x[-s:]; s = 0
    e = min(len(buf), s + len(x))
    buf[s:e, 0] += x[:e - s] * stereo[0]; buf[s:e, 1] += x[:e - s] * stereo[1]
