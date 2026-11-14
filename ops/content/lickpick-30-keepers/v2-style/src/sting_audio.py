"""Keepers v2 sting: all sound synthesised here (no samples). python3 sting_audio.py out.wav [gain_db]
Riser -> soft impact + Karplus-Strong A-minor strum -> shimmer -> whoosh into the pick iris -> landing dyad -> button click.
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, lfilter, fftconvolve, resample_poly
from scipy.io import wavfile

SR = 48000
DUR = 6.5
rng = np.random.default_rng(8)
N = int(DUR * SR)
mix = np.zeros((N, 2))


def t_(d): return np.arange(int(d * SR)) / SR


def place(x, at, pan=0.0, g=1.0):
    """x mono or (n,2); equal-power pan -1..1"""
    if x.ndim == 1:
        a = (pan + 1) * np.pi / 4
        x = np.stack([x * np.cos(a), x * np.sin(a)], 1)
    s = int(at * SR); e = min(N, s + len(x))
    mix[s:e] += g * x[:e - s]


def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, fc, order=2): return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, order=2): return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


def sweep_noise(d, f0, f1, q=1.0, curve=2.0):
    """band-passed noise whose centre glides f0->f1; filter state carried across blocks (no clicks)"""
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); blk = 128; zi = np.zeros((1, 2))
    for i in range(0, n, blk):
        k = (i / n) ** curve; fc = f0 * (f1 / f0) ** k
        sos = butter(1, [max(40, fc / (1 + q)), min(20000, fc * (1 + q))], 'band', fs=SR, output='sos')
        out[i:i + blk], zi = sosfilt(sos, x[i:i + blk], zi=zi)
    return out


def ks(freq, d=3.0, bright=0.55, decay=0.996):
    """Karplus-Strong plucked string at 96k, returned at 48k."""
    fs = 96000; n = int(d * fs); L = fs / freq; Li = int(L)
    exc = rng.standard_normal(Li)
    exc = lfilter([bright], [1, -(1 - bright)], exc)            # pick brightness
    exc -= exc.mean()
    x = np.zeros(n); x[:Li] = exc
    a = np.zeros(Li + 2); a[0] = 1; a[Li] = -decay * .5; a[Li + 1] = -decay * .5
    y = lfilter([1], a, x)
    y = resample_poly(y, 1, 2)
    y *= np.exp(-np.arange(len(y)) / SR * 0.9)
    return y / (np.abs(y).max() + 1e-9)


def body(x):  # light guitar-body colour
    return x + 0.35 * bp(x, 90, 140, 1) + 0.25 * bp(x, 180, 260, 1)


# ---------- 1. riser 0.00 -> 1.32 (noise sweep + rising detuned tone), stops just before the hit
d = 1.32; t = t_(d); env = (t / d) ** 2.4
nz = sweep_noise(d, 400, 7000, q=.6, curve=1.6)
nz = nz / np.abs(nz).max()
f = 110 * 2 ** (t / d * 1.0)                                   # A2 -> A3
ph = 2 * np.pi * np.cumsum(f) / SR
tone = (np.sin(ph) + .5 * np.sin(2 * ph * 1.003) + .25 * np.sin(3 * ph * .998))
tone = lp(tone, 2500)
riser_l = env * (0.55 * nz + 0.22 * tone)
riser_r = env * (0.55 * np.roll(nz, 37) + 0.22 * tone)
fade = np.ones(len(t)); fade[-int(.03 * SR):] = np.linspace(1, 0, int(.03 * SR))
place(np.stack([riser_l * fade, riser_r * fade], 1), 0.0, g=0.55)

# ---------- 2. impact at 1.35: sub thump + soft noise body + A-minor strum (A2 E3 A3 C4 E4)
def thump(f0=58, d=1.1, g=1.0):
    t = t_(d); f = f0 * (1 + 1.6 * np.exp(-t * 28))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.0)
    x[:int(.004 * SR)] *= np.linspace(0, 1, int(.004 * SR))
    return g * x

def softhit(d=0.5):
    t = t_(d); x = lp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 14)
    return x / np.abs(x).max()

T_HIT = 1.35
place(thump(), T_HIT, g=0.75)
place(softhit(), T_HIT, g=0.22)
strum = [110.0, 164.81, 220.0, 261.63, 329.63]
for i, fr in enumerate(strum):
    place(body(ks(fr, 3.2, bright=.45)), T_HIT + .012 + i * .014, pan=-.35 + i * .17, g=0.20)

# ---------- 3. shimmer on the wordmark (very quiet bell partials, A5/E6)
for i, fr in enumerate([880.0, 1318.5, 1760.0]):
    t = t_(1.6); x = np.sin(2 * np.pi * fr * t) * np.exp(-t * 3.2) * (1 - np.exp(-t * 60))
    place(x, 1.58 + i * .09, pan=(-.4, .4, 0)[i], g=0.035)
# Beta tag tick
t = t_(.06); place(hp(np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 90), 900), 2.15, pan=.35, g=.08)

# ---------- 4. pad bed A minor (A2 E3 C4 G4) for glue, 1.35 -> end
d = DUR - T_HIT; t = t_(d)
pad = np.zeros(len(t))
for fr in [110.0, 164.81, 261.63, 392.0]:
    for det in (-0.004, 0.004):
        pad += np.sin(2 * np.pi * fr * (1 + det) * t + rng.uniform(0, 6.28))
pad = lp(pad, 1400)
penv = (1 - np.exp(-t * 3)) * np.clip(1 - (t - (d - .5)) / .5, 0, 1)
duck = 1 - 0.55 * np.exp(-((t + T_HIT - 4.2) / .25) ** 2)   # dip under the landing
place(np.stack([pad * penv * duck, np.roll(pad, 211) * penv * duck], 1), T_HIT, g=0.045)

# ---------- 5. whoosh into the iris, peak ~3.95, panned L->R
d = 0.95; t = t_(d)
w = sweep_noise(d, 300, 5500, q=.7, curve=1.0)
w = w / np.abs(w).max()
we = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2.2
we = we * np.where(t / d > .62, np.exp(-((t / d - .62) * 6) ** 2), 1)
pan_t = np.linspace(-.7, .7, len(t)); a = (pan_t + 1) * np.pi / 4
place(np.stack([w * we * np.cos(a), w * we * np.sin(a)], 1), 3.32, g=0.42)

# ---------- 6. landing at 4.2: softer thump + A3/E4 dyad
place(thump(70, .7), 4.2, g=.42)
place(softhit(.3), 4.2, g=.1)
place(body(ks(220.0, 2.0, bright=.4)), 4.21, pan=-.2, g=.16)
place(body(ks(329.63, 2.0, bright=.4)), 4.225, pan=.2, g=.14)

# ---------- 7. button press click at 4.78
t = t_(.05); c = np.sin(2 * np.pi * 1500 * t) * np.exp(-t * 120) + .4 * hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 300)
place(c, 4.78, pan=.1, g=.12)
place(thump(120, .15), 4.78, g=.08)

# ---------- reverb (synthetic stereo IR, 1.6 s)
ir_t = t_(1.6)
ir = np.stack([lp(rng.standard_normal(len(ir_t)), 6000) * np.exp(-ir_t * 4.3) for _ in range(2)], 1)
ir[:int(.012 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(0))
wet = np.stack([fftconvolve(hp(mix[:, k], 200), ir[:, k])[:N] for k in range(2)], 1)
out = mix + 0.30 * wet

# gentle master: high-pass rumble, final fade
out = np.stack([hp(out[:, k], 28) for k in range(2)], 1)
fo = int(.35 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
fi = int(.01 * SR); out[:fi] *= np.linspace(0, 1, fi)[:, None]

gain_db = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
out *= 10 ** (gain_db / 20)

# soft lookahead limiter on 4x-oversampled peak estimate, ceiling -1.5 dBTP
ceil = 10 ** (-1.5 / 20)
up = np.stack([resample_poly(out[:, k], 4, 1) for k in range(2)], 1)
pk = np.abs(up).max(1).reshape(-1, 4).max(1)[:N]
g = np.minimum(1, ceil / np.maximum(pk, 1e-9))
la = int(.005 * SR)
# min over lookahead window then smooth release
from scipy.ndimage import minimum_filter1d
g = minimum_filter1d(g, 2 * la + 1)
rel = np.exp(-1 / (.08 * SR)); sm = np.empty_like(g); cur = 1.0
for i in range(len(g)):
    cur = g[i] if g[i] < cur else rel * cur + (1 - rel) * g[i]
    sm[i] = cur
out *= sm[:, None]
print('limiter max reduction dB', round(20 * np.log10(sm.min()), 2))
wavfile.write(sys.argv[1], SR, (np.clip(out, -1, 1) * 32767).astype(np.int16))
