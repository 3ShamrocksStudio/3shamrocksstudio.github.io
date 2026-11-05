"""3Shamrocks original audio engine: additive/FM synthesis, mixing and mastering in numpy.
Everything here is generated from math; no samples."""
import numpy as np
from scipy import signal
import pedalboard as pb
import pyloudnorm as pyln

SR = 44100
RNG = np.random.default_rng(7)

NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def midi(n):
    if isinstance(n, (int, float)): return n
    p = NOTE[n[0]]; i = 1
    while i < len(n) and n[i] in '#b':
        p += 1 if n[i] == '#' else -1; i += 1
    return p + 12 * (int(n[i:]) + 1)
def hz(m): return 440.0 * 2 ** ((midi(m) - 69) / 12)

def env(n, a, d, s, r, hold):
    """ADSR: attack a, decay d to level s, held until `hold` seconds, release r. Length n samples."""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = np.clip((t - hold) / max(r, 1e-4), 0, None)
    e = e * np.where(t > hold, np.exp(-rel * 5.0), 1.0)
    return e

def lp_w(fk, fc, order=2):
    return 1.0 / np.sqrt(1.0 + (fk / fc) ** (2 * order))

def additive(f, dur, partials, decays=None, fc=None, n=None, phase_rand=True):
    """partials: list of (ratio, amp). decays: per partial decay time (s) or None. fc: cutoff curve (array) or scalar."""
    n = n or int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for i, (r, a) in enumerate(partials):
        fk = f * r
        if fk > SR * 0.45: continue
        ph = RNG.uniform(0, 2 * np.pi) if phase_rand else 0
        w = a
        if fc is not None: w = a * lp_w(fk, fc)
        x = np.sin(2 * np.pi * fk * t + ph) * w
        if decays is not None: x *= np.exp(-t / decays[i])
        out += x
    return out

def saw_partials(k=40, odd=False):
    return [(h, 1.0 / h) for h in range(1, k + 1) if (not odd or h % 2)]

# ---------------- instruments (return mono arrays) ----------------
def horn(f, dur, vel=0.8, bright=1.0, att=0.06):
    n = int((dur + 0.5) * SR); t = np.arange(n) / SR
    fc = f * (1.5 + 2.6 * bright * vel) * (0.75 + 0.25 * np.exp(-t / 0.25)) + 300
    out = np.zeros(n)
    for det in (-0.004, 0.0, 0.0045):
        vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.25) / 0.3, 0, 1)
        ff = f * (1 + det)
        ph = np.cumsum(2 * np.pi * ff * vib / SR)
        for h in range(1, 24):
            if ff * h > 9000: break
            out += np.sin(h * ph + RNG.uniform(0, 6.28)) / h * lp_w(ff * h, fc, 2)
    e = env(n, att, 0.3, 0.8, 0.18, dur)
    return out * e * vel * 0.33

def woodwind(f, dur, vel=0.7):
    n = int((dur + 0.4) * SR); t = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.0 * t) * np.clip((t - 0.3) / 0.4, 0, 1)
    ph = np.cumsum(2 * np.pi * f * vib / SR)
    out = np.sin(ph) + 0.33 * np.sin(3 * ph) + 0.14 * np.sin(5 * ph) + 0.05 * np.sin(7 * ph) + 0.08 * np.sin(2 * ph)
    br = signal.sosfilt(signal.butter(2, [min(f * 2.5, 8000), min(f * 4, 12000)], 'bandpass', fs=SR, output='sos'), RNG.normal(0, 1, n))
    out = out + br * 0.05
    return out * env(n, 0.07, 0.2, 0.85, 0.12, dur) * vel * 0.3

def flute(f, dur, vel=0.7):
    n = int((dur + 0.5) * SR); t = np.arange(n) / SR
    vib = 1 + 0.005 * np.sin(2 * np.pi * 4.8 * t) * np.clip((t - 0.25) / 0.5, 0, 1)
    ph = np.cumsum(2 * np.pi * f * vib / SR)
    out = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    br = signal.sosfilt(signal.butter(2, [min(f * 1.5, 9000), min(f * 3.5, 15000)], 'bandpass', fs=SR, output='sos'), RNG.normal(0, 1, n))
    out = out + br * (0.06 + 0.12 * np.exp(-t / 0.08))
    return out * env(n, 0.09, 0.3, 0.8, 0.2, dur) * vel * 0.32

def pluck(f, dur, vel=0.7, decay=0.45, bright=1.0):
    """pizzicato / harp-like: harmonic partials, upper ones die faster"""
    n = int((min(dur, decay * 3) + 0.3) * SR)
    parts = [(h, (1.0 / h ** 1.3) * (1 if h < 8 * bright + 2 else 0.3)) for h in range(1, 16)]
    dec = [decay / (1 + 0.6 * (h - 1)) for h in range(1, 16)]
    x = additive(f, 0, parts, dec, n=n)
    a = np.clip(np.arange(n) / (0.003 * SR), 0, 1)
    rel = np.where(np.arange(n) / SR > dur, np.exp(-(np.arange(n) / SR - dur) / 0.05), 1)
    return x * a * rel * vel * 0.4

def marimba(f, dur, vel=0.7):
    n = int(1.6 * SR)
    x = additive(f, 0, [(1, 1.0), (3.93, 0.32), (9.2, 0.1)], [0.55 * (440 / max(f, 200)) ** 0.3, 0.12, 0.04], n=n)
    click = signal.sosfilt(signal.butter(2, [800, 3000], 'bandpass', fs=SR, output='sos'), RNG.normal(0, 1, n)) * np.exp(-np.arange(n) / (0.004 * SR)) * 0.15
    a = np.clip(np.arange(n) / (0.002 * SR), 0, 1)
    return (x * a + click) * vel * 0.45

def kalimba(f, dur, vel=0.6):
    n = int(1.8 * SR)
    x = additive(f, 0, [(1, 1.0), (5.4, 0.18), (2.0, 0.06)], [0.9, 0.06, 0.4], n=n)
    a = np.clip(np.arange(n) / (0.0015 * SR), 0, 1)
    return x * a * vel * 0.4

def bell(f, dur, vel=0.6, decay=1.6):
    n = int((decay * 2.5) * SR)
    x = additive(f, 0, [(1, 1.0), (2.76, 0.4), (5.4, 0.18), (8.93, 0.08), (2.0, 0.15)], [decay, decay * 0.5, decay * 0.25, decay * 0.12, decay * 0.7], n=n)
    a = np.clip(np.arange(n) / (0.001 * SR), 0, 1)
    return x * a * vel * 0.3

def glock(f, dur, vel=0.6):
    return bell(f, dur, vel, decay=1.1)

def ep(f, dur, vel=0.6):
    """FM electric piano"""
    n = int((dur + 1.2) * SR); t = np.arange(n) / SR
    idx = 1.8 * vel * np.exp(-t / 0.35) + 0.25
    mod = np.sin(2 * np.pi * f * t) * idx
    x = np.sin(2 * np.pi * f * t + mod) + 0.12 * np.sin(2 * np.pi * f * 14 * t) * np.exp(-t / 0.02)
    e = env(n, 0.003, 1.2, 0.0, 0.25, dur) * (0.4 + 0.6 * np.exp(-t / 2.5))
    e = np.exp(-t / 1.6) * np.where(t > dur, np.exp(-(t - dur) / 0.12), 1) * np.clip(t / 0.003, 0, 1)
    return x * e * vel * 0.35

def pad(f, dur, vel=0.5, att=0.9, rel=1.4, fc=1800, voices=5):
    """returns stereo (2, n) detuned saw pad"""
    n = int((dur + rel * 1.5) * SR); t = np.arange(n) / SR
    out = np.zeros((2, n))
    for v in range(voices):
        det = (v - (voices - 1) / 2) * 0.0035
        ff = f * (1 + det)
        ph = np.cumsum(2 * np.pi * ff * (1 + 0.0015 * np.sin(2 * np.pi * (0.2 + 0.07 * v) * t)) / SR) + RNG.uniform(0, 6.28)
        x = np.zeros(n)
        for h in range(1, 30):
            if ff * h > 7000: break
            x += np.sin(h * ph) / h * lp_w(ff * h, fc, 2)
        pan = (v / max(voices - 1, 1)) * 2 - 1
        out[0] += x * np.sqrt((1 - pan * 0.7) / 2); out[1] += x * np.sqrt((1 + pan * 0.7) / 2)
    e = np.clip(t / att, 0, 1) ** 1.5 * np.where(t > dur, np.exp(-(t - dur) / (rel / 3)), 1)
    return out * e * vel * 0.12

def bass(f, dur, vel=0.7, kind='round'):
    n = int((dur + 0.3) * SR); t = np.arange(n) / SR
    if kind == 'sub':
        x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) + 0.08 * np.sin(6 * np.pi * f * t)
        e = env(n, 0.012, 0.6, 0.75, 0.12, dur)
    else:  # upright/pizz-ish
        x = additive(f, 0, [(1, 1), (2, 0.45), (3, 0.18), (4, 0.08)], [0.9, 0.5, 0.3, 0.2], n=n)
        e = np.clip(t / 0.006, 0, 1) * np.where(t > dur, np.exp(-(t - dur) / 0.06), 1)
    return x * e * vel * 0.5

def noise(n): return RNG.normal(0, 1, n)
def bp(x, lo, hi, order=2): return signal.sosfilt(signal.butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def hp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, 'highpass', fs=SR, output='sos'), x)
def lp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, 'lowpass', fs=SR, output='sos'), x)

def kick(vel=0.8, soft=True):
    n = int(0.5 * SR); t = np.arange(n) / SR
    f = 45 + 75 * np.exp(-t / 0.04)
    x = np.sin(np.cumsum(2 * np.pi * f / SR)) * np.exp(-t / (0.22 if soft else 0.3))
    x += lp(noise(n), 3000) * np.exp(-t / 0.003) * 0.15
    return x * vel * 0.6

def snare(vel=0.6, brush=False):
    n = int(0.4 * SR); t = np.arange(n) / SR
    if brush:
        x = bp(noise(n), 1500, 7000) * np.exp(-t / 0.09) * np.clip(t / 0.01, 0, 1) * 0.5
    else:
        x = bp(noise(n), 1200, 8000) * np.exp(-t / 0.07) * 0.55 + np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.04) * 0.4
    return x * vel * 0.5

def rim(vel=0.5):
    n = int(0.12 * SR); t = np.arange(n) / SR
    x = bp(noise(n), 1800, 4500) * np.exp(-t / 0.012) * 0.6 + np.sin(2 * np.pi * 1650 * t) * np.exp(-t / 0.015) * 0.4
    return x * vel * 0.4

def woodblock(f=1200, vel=0.5):
    n = int(0.15 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.025) + 0.3 * np.sin(2 * np.pi * f * 2.7 * t) * np.exp(-t / 0.01)
    x += bp(noise(n), f, f * 3) * np.exp(-t / 0.004) * 0.3
    return x * vel * 0.35

def hat(vel=0.4, open_=False):
    n = int((0.3 if open_ else 0.08) * SR); t = np.arange(n) / SR
    return hp(noise(n), 7000, 4) * np.exp(-t / (0.08 if open_ else 0.018)) * vel * 0.3

def shaker(vel=0.35):
    n = int(0.12 * SR); t = np.arange(n) / SR
    e = np.clip(t / 0.02, 0, 1) * np.exp(-t / 0.03)
    return hp(noise(n), 5000, 3) * e * vel * 0.35

def clap(vel=0.5):
    n = int(0.35 * SR); t = np.arange(n) / SR
    e = np.zeros(n)
    for d in (0, 0.011, 0.022): e += np.exp(-np.clip(t - d, 0, None) / 0.006) * (t >= d)
    e += np.exp(-np.clip(t - 0.03, 0, None) / 0.08) * (t >= 0.03) * 0.6
    return bp(noise(n), 900, 5000) * e * vel * 0.35

def timpani(f, vel=0.6):
    n = int(2.2 * SR); t = np.arange(n) / SR
    bend = 1 + 0.02 * np.exp(-t / 0.05)
    ph = np.cumsum(2 * np.pi * f * bend / SR)
    x = np.sin(ph) * np.exp(-t / 0.9) + 0.5 * np.sin(1.5 * ph) * np.exp(-t / 0.5) + 0.3 * np.sin(1.98 * ph) * np.exp(-t / 0.4) + 0.15 * np.sin(2.44 * ph) * np.exp(-t / 0.3)
    x += lp(noise(n), 1500) * np.exp(-t / 0.02) * 0.4
    return x * vel * 0.45

def framedrum(f=95, vel=0.6, decay=0.35):
    n = int(0.8 * SR); t = np.arange(n) / SR
    fr = f * (1 + 0.5 * np.exp(-t / 0.02))
    x = np.sin(np.cumsum(2 * np.pi * fr / SR)) * np.exp(-t / decay) + bp(noise(n), 200, 1500) * np.exp(-t / 0.015) * 0.3
    return x * vel * 0.5

def cymbal_swell(dur=1.0, vel=0.3):
    n = int((dur + 0.6) * SR); t = np.arange(n) / SR
    e = np.clip(t / dur, 0, 1) ** 2 * np.where(t > dur, np.exp(-(t - dur) / 0.25), 1)
    return hp(noise(n), 5000, 2) * e * vel * 0.25

def chirp(f0=2600, f1=4200, dur=0.07, vel=0.3):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 + (f1 - f0) * (t / dur) ** 0.7
    x = np.sin(np.cumsum(2 * np.pi * f / SR)) * np.sin(np.pi * t / dur) ** 2
    return x * vel * 0.25

def bird(vel=0.3):
    out = []
    k = RNG.integers(2, 5)
    base = RNG.uniform(2400, 3600)
    for i in range(k):
        out.append(chirp(base * RNG.uniform(0.9, 1.1), base * RNG.uniform(1.25, 1.6), RNG.uniform(0.05, 0.09), vel))
        out.append(np.zeros(int(RNG.uniform(0.03, 0.07) * SR)))
    return np.concatenate(out)

# ---------------- mixing ----------------
CH = {'maj': [0, 4, 7], 'min': [0, 3, 7], '7': [0, 4, 7, 10], 'm7': [0, 3, 7, 10], 'maj7': [0, 4, 7, 11],
      'm9': [0, 3, 7, 10, 14], 'add9': [0, 4, 7, 14], '6': [0, 4, 7, 9], 'sus4': [0, 5, 7], 'sus2': [0, 2, 7], 'maj9': [0, 4, 7, 11, 14]}
def chord(root, q='maj', inv_oct=4):
    r = midi(root + str(inv_oct)) if isinstance(root, str) else root
    return [r + i for i in CH[q]]

class Mix:
    def __init__(self, length, tail=6.0):
        self.L = length; self.n = int(round(length * SR)); self.N = self.n + int(tail * SR)
        self.bus = {}
    def add(self, bus, x, t0, pan=0.0, gain=1.0, jitter=0.004):
        b = self.bus.setdefault(bus, np.zeros((2, self.N)))
        t0 = t0 + (RNG.uniform(-jitter, jitter) if jitter else 0)
        i0 = int(round(t0 * SR)) % self.n
        if x.ndim == 1:
            l = np.sqrt((1 - pan) / 2); r = np.sqrt((1 + pan) / 2)
            x = np.vstack([x * l * 1.414, x * r * 1.414])
        x = x * gain
        m = min(x.shape[1], self.N - i0)
        b[:, i0:i0 + m] += x[:, :m]
        if x.shape[1] > m:  # wrap past end of buffer
            rest = x[:, m:]; k = min(rest.shape[1], self.N)
            b[:, :k] += rest[:, :k]
    def folded(self, name):
        b = self.bus[name]; y = b[:, :self.n].copy(); tail = b[:, self.n:]
        k = tail.shape[1]
        while k > 0:
            m = min(k, self.n); y[:, :m] += tail[:, :m]; tail = tail[:, m:]; k = tail.shape[1]
        return y

def periodic(fx, x, reps=3):
    """apply a stateful effect chain to a loop so the result is seamless: process [x x x], keep the middle"""
    n = x.shape[1]
    tiled = np.tile(x, (1, reps)).astype(np.float32)
    y = fx(tiled, SR)
    return np.asarray(y[:, n * (reps // 2): n * (reps // 2 + 1)], dtype=np.float64)

def reverb_ir(dur=2.4, predelay=0.02, damp=6000, seed=3):
    r = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    ir = np.zeros((2, n + int(predelay * SR)))
    for c in range(2):
        x = r.normal(0, 1, n) * np.exp(-t * 6.9 / dur)
        # darker over time: blend lowpassed copy
        xl = lp(x, 2500)
        w = np.clip(t / (dur * 0.6), 0, 1)
        x = x * (1 - w) + xl * w
        x = lp(x, damp)
        ir[c, int(predelay * SR):] = x
    # early reflections
    for d, g in ((0.011, 0.5), (0.019, 0.35), (0.027, 0.3), (0.041, 0.22)):
        ir[0, int(d * SR)] += g; ir[1, int((d + 0.003) * SR)] += g
    return ir / np.sqrt((ir ** 2).sum() / 2)

def circ_reverb(x, ir, wet=0.25):
    n = x.shape[1]; out = np.zeros_like(x)
    for c in range(2):
        y = signal.fftconvolve(x[c], ir[c])
        k = y.shape[0]; z = np.zeros(n)
        for s in range(0, k, n):
            seg = y[s:s + n]; z[:len(seg)] += seg
        out[c] = z
    return out * wet

def lufs(x): return pyln.Meter(SR).integrated_loudness(x.T)

def true_peak_db(x):
    up = signal.resample_poly(x, 4, 1, axis=1)
    return 20 * np.log10(np.max(np.abs(up)) + 1e-12)

def limiter_tp(x, ceiling_db=-1.3, periodic_loop=True):
    """lookahead true-peak-ish limiter: gain computed from 4x oversampled peaks, smoothed; run circularly for loops"""
    c = 10 ** (ceiling_db / 20)
    up = np.max(np.abs(signal.resample_poly(x, 4, 1, axis=1)), axis=0)
    pk = up.reshape(-1, 4).max(axis=1)[:x.shape[1]]
    g = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    W = int(0.02 * SR)
    mode = 'wrap' if periodic_loop else 'nearest'
    sm = minimum_filter1d(g, size=2 * W + 1, mode=mode)
    sm = uniform_filter1d(sm, size=W + 1, mode=mode)
    return x * sm

def master(x, target=-16.0, tp=-1.0, loop=True):
    for _ in range(3):
        l = lufs(np.tile(x, (1, 2)) if loop else x)
        x = x * 10 ** ((target - l) / 20)
        x = limiter_tp(x, tp - 0.5, loop)
    return x
