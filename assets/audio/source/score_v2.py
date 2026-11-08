"""3Shamrocks Studio Score v2: "The Three Leaf Theme" in game-world zones.
Everything is synthesised from scratch in numpy/scipy (+ pedalboard effects). No samples.

One memorable theme (8 bars, its first bar climbs root-third-fifth: one note per shamrock leaf) recurs in every zone,
re-orchestrated each time, with a countermelody, a bass line, voiced chord progressions (borrowed chords, a different key
per zone) and a humanised percussion groove. Each zone is 16 bars: A = the theme, B = a development that sequences the
motif over a new progression and runs back into A.

  python3 score_v2.py home            -> 7 homepage zones
  python3 score_v2.py pages           -> 10 product-page zones
  python3 score_v2.py <zone> [...]    -> selected zones
  python3 score_v2.py demo            -> 60 s walk through the homepage zones (needs the zone renders)
Output: /dev/shm/s3studio/v2/<zone>.wav = last 0.5 s of the loop + loop + first 0.5 s (player loops 0.5 .. 0.5+L)."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import (SR, midi, hz, lp_w, additive, noise, bp, hp, lp, kick, snare, hat, shaker, clap, rim, woodblock, framedrum,
                   marimba, Mix, periodic, reverb_ir, circ_reverb, lufs, true_peak_db, master)
import numpy as np
from scipy import signal
import pedalboard as pb
import soundfile as sf

OUT = '/dev/shm/s3studio/v2'
os.makedirs(OUT, exist_ok=True)
R = np.random.default_rng(2026)

# =====================================================================================
# instruments (mono numpy arrays unless noted)
# =====================================================================================
def _t(n): return np.arange(n) / SR
def polyblep_saw(f, n, vib=None, ph0=0.0):
    """band-limited saw (PolyBLEP). f scalar, vib: optional per-sample pitch multiplier"""
    inc = (f * (vib if vib is not None else 1.0)) / SR * np.ones(n)
    ph = (ph0 + np.cumsum(inc)) % 1.0
    y = 2 * ph - 1
    dt = inc
    m1 = ph < dt; x1 = ph[m1] / dt[m1]; y[m1] -= x1 + x1 - x1 * x1 - 1
    m2 = ph > 1 - dt; x2 = (ph[m2] - 1) / dt[m2]; y[m2] -= x2 * x2 + x2 + x2 + 1
    return y
def adsr(n, a, d, s, r, hold):
    t = _t(n)
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    return e * np.where(t > hold, np.exp(-(t - hold) / max(r, 1e-4)), 1.0)
def lowpass(x, fc, order=2): return signal.sosfilt(signal.butter(order, min(fc, SR * 0.45), 'lowpass', fs=SR, output='sos'), x)

def celesta(f, dur, vel=0.6):
    """FM celesta: struck bar (1:1 FM, decaying index) + a short 4x 'tink' + slight chorus"""
    n = int(2.6 * SR); t = _t(n)
    I = 1.4 * np.exp(-t / 0.18) + 0.15
    x = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * t)) * np.exp(-t / 1.1)
    x += 0.5 * np.sin(2 * np.pi * f * 1.0018 * t) * np.exp(-t / 0.9)
    x += 0.22 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t / 0.05)
    return x * np.clip(t / 0.0015, 0, 1) * vel * 0.32

def glock(f, dur, vel=0.6):
    n = int(2.4 * SR); t = _t(n)
    I = 2.0 * np.exp(-t / 0.05)
    x = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t / 1.0)
    x += 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.35) + 0.15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.12)
    return x * np.clip(t / 0.0008, 0, 1) * vel * 0.26

def musicbox(f, dur, vel=0.6):
    """tuned steel tine: fundamental + inharmonic 5.4x partial, soft FM shimmer, a little comb"""
    n = int(2.0 * SR); t = _t(n)
    x = np.sin(2 * np.pi * f * t + 0.5 * np.exp(-t / 0.1) * np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t / 0.75)
    x += 0.3 * np.sin(2 * np.pi * f * 5.43 * t) * np.exp(-t / 0.09) + 0.1 * np.sin(2 * np.pi * f * 3.02 * t) * np.exp(-t / 0.3)
    return lowpass(x * np.clip(t / 0.001, 0, 1), 9000) * vel * 0.3

_KS = {}
def ks(f, vel=0.6, bright=0.6, rho=0.996, length=2.0, damp=1.0):
    """Karplus-Strong string, tuned exactly by resampling. Cached per pitch/colour, scaled by velocity."""
    key = (round(f, 2), round(bright, 2), round(rho, 4), round(length, 2), round(damp, 2))
    if key not in _KS:
        N = max(4, int(SR / f - 0.5)); fa = SR / (N + 0.5)
        n = int(length * SR * f / fa) + 10
        exc = R.uniform(-1, 1, N)
        exc = lowpass(exc, 600 + 9000 * bright, 1) if bright < 0.98 else exc
        x = np.zeros(n); x[:N] = exc
        a = np.zeros(N + 2); a[0] = 1; a[N] = -rho * 0.5; a[N + 1] = -rho * 0.5
        y = signal.lfilter([1.0], a, x)
        m = int(length * SR); src = np.arange(m) * (f / fa)
        y = np.interp(src, np.arange(n), y)
        if damp < 1.0: y = lowpass(y, 1200 + 6000 * damp, 1)
        y = y / (np.max(np.abs(y[:int(0.05 * SR)])) + 1e-9)
        _KS[key] = y
    return _KS[key] * vel
def harp(f, dur, vel=0.6): return ks(f, vel * 0.5, bright=0.55, rho=0.997, length=2.4) * np.clip(_t(int(2.4 * SR)) / 0.002, 0, 1)
def pizz(f, dur, vel=0.6):
    y = ks(f, vel * 0.55, bright=0.4, rho=0.985, length=0.7, damp=0.5)
    return y * np.exp(-_t(len(y)) / 0.25)
def gtr(f, dur, vel=0.6):  # bright pluck for LickPick
    y = ks(f, vel * 0.5, bright=0.9, rho=0.993, length=1.2)
    t = _t(len(y)); return y * np.where(t > dur, np.exp(-(t - dur) / 0.08), 1)

def flute(f, dur, vel=0.6):
    """filtered saw + breath noise + chiff + delayed vibrato"""
    n = int((dur + 0.35) * SR); t = _t(n)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t + R.uniform(0, 6)) * np.clip((t - 0.22) / 0.3, 0, 1)
    x = lowpass(polyblep_saw(f, n, vib), f * 2.3, 2) * 0.9 + np.sin(np.cumsum(2 * np.pi * f * vib / SR)) * 0.6
    br = bp(noise(n), min(f * 1.6, 8000), min(f * 4.5, 16000)) * 0.07
    chiff = bp(noise(n), min(f * 2.5, 9000), min(f * 6, 17000)) * np.exp(-t / 0.035) * 0.25
    e = adsr(n, 0.045, 0.3, 0.85, 0.09, dur)
    return (x + br + chiff * vel) * e * vel * 0.3

def brass(f, dur, vel=0.6):
    """soft brass stab: three detuned saws, filter opens with the attack (dark/bright blend)"""
    n = int((dur + 0.3) * SR); t = _t(n)
    s = sum(polyblep_saw(f * (1 + d), n, ph0=R.uniform()) for d in (-0.004, 0, 0.0045)) / 3
    dark = lowpass(s, f * 1.5 + 200, 2); bright = lowpass(s, f * 6 + 800, 2)
    fe = np.clip(t / 0.07, 0, 1) * (0.55 + 0.45 * np.exp(-np.clip(t - 0.07, 0, None) / 0.25))
    x = dark * (1 - fe) + bright * fe
    return x * adsr(n, 0.03, 0.25, 0.75, 0.1, dur) * vel * 0.4

def strings(f, dur, vel=0.5, att=0.35, rel=0.6, fc=2600):
    """warm detuned string ensemble pad: stereo (2, n)"""
    n = int((dur + rel * 2) * SR); t = _t(n); out = np.zeros((2, n))
    for v, det in enumerate((-0.007, -0.004, -0.0015, 0.0015, 0.004, 0.007)):
        vib = 1 + 0.0025 * np.sin(2 * np.pi * (4.6 + 0.3 * v) * t + R.uniform(0, 6))
        x = polyblep_saw(f * (1 + det), n, vib, R.uniform())
        pan = -0.8 + 1.6 * v / 5
        out[0] += x * np.sqrt((1 - pan) / 2); out[1] += x * np.sqrt((1 + pan) / 2)
    out = signal.sosfilt(signal.butter(2, min(fc, f * 8), 'lowpass', fs=SR, output='sos'), out, axis=1)
    e = np.clip(t / att, 0, 1) ** 1.5 * np.where(t > dur, np.exp(-(t - dur) / (rel / 2.5)), 1)
    return out * e * vel * 0.09

def hero(f, dur, vel=0.6, bright=1.0):
    """heroic synth lead: two detuned saws + a square-ish octave-down layer, filter that opens on the attack, delayed vibrato"""
    n = int((dur + 0.3) * SR); t = _t(n)
    vib = 1 + 0.005 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.2) / 0.25, 0, 1)
    s = (polyblep_saw(f * 0.997, n, vib, R.uniform()) + polyblep_saw(f * 1.003, n, vib, R.uniform())) * 0.5
    sub = np.sign(np.sin(np.cumsum(2 * np.pi * f * 0.5 * vib / SR))) * 0.25
    dark = lowpass(s + sub, f * 2.0 + 300, 2); br = lowpass(s + sub, (f * 6 + 1500) * bright, 2)
    fe = np.clip(t / 0.03, 0, 1) * (0.5 + 0.5 * np.exp(-np.clip(t - 0.03, 0, None) / 0.2))
    return (dark * (1 - fe) + br * fe) * adsr(n, 0.012, 0.3, 0.85, 0.07, dur) * vel * 0.42
def herosoft(f, dur, vel=0.6): return hero(f, dur, vel, bright=0.45)
def sawbass(f, dur, vel=0.7):
    """driving bass: saw through a plucky lowpass over a sine sub"""
    n = int((dur + 0.1) * SR); t = _t(n)
    s = polyblep_saw(f, n)
    dark = lowpass(s, f * 2 + 120, 2); br = lowpass(s, f * 10 + 600, 2); fe = np.exp(-t / 0.06)
    x = (dark * (1 - fe) + br * fe) * 0.8 + np.sin(2 * np.pi * f * t) * 0.6
    return x * adsr(n, 0.004, 0.2, 0.8, 0.03, dur) * vel * 0.5
def bigkick(vel=0.8):
    n = int(0.55 * SR); t = _t(n)
    f = 48 + 110 * np.exp(-t / 0.035)
    x = np.sin(np.cumsum(2 * np.pi * f / SR)) * np.exp(-t / 0.3) + bp(noise(n), 1500, 6000) * np.exp(-t / 0.004) * 0.35
    return np.tanh(x * 1.6) * vel * 0.6
def bigsnare(vel=0.6):
    n = int(0.45 * SR); t = _t(n)
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.04) * 0.55 + np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.02) * 0.25
    nz = bp(noise(n), 1000, 9500) * (np.exp(-t / 0.06) * 0.7 + 0.3 * (t < 0.22) * np.exp(-t / 0.35))
    g = np.where(t < 0.22, 1, np.exp(-(t - 0.22) / 0.015))
    return mixsum((body + nz) * g * vel * 0.5, clap(vel * 0.6))
def roundbass(f, dur, vel=0.7):
    n = int((dur + 0.15) * SR); t = _t(n)
    x = np.sin(2 * np.pi * f * t) + 0.28 * np.sin(4 * np.pi * f * t) + 0.25 * lowpass(polyblep_saw(f, n), 420, 2)
    return x * adsr(n, 0.006, 0.25, 0.7, 0.05, dur) * vel * 0.5
def marimba2(f, dur, vel=0.6): return marimba(f, dur, vel)
def kalimba(f, dur, vel=0.6):
    n = int(1.8 * SR); t = _t(n)
    x = additive(f, 0, [(1, 1.0), (5.4, 0.16), (2.0, 0.05)], [0.9, 0.06, 0.4], n=n)
    return lowpass(x * np.clip(t / 0.003, 0, 1), 6000) * vel * 0.4

# percussion extras
def mixsum(a, b):
    n = max(len(a), len(b)); return np.pad(a, (0, n - len(a))) + np.pad(b, (0, n - len(b)))
def tamb(vel=0.4):
    n = int(0.25 * SR); t = _t(n)
    j = bp(noise(n), 5500, 12000) * (np.exp(-t / 0.05) + 0.4 * np.exp(-np.clip(t - 0.02, 0, None) / 0.06) * (t > 0.02))
    return j * vel * 0.25
def crash(vel=0.4):
    n = int(2.2 * SR); t = _t(n)
    return hp(noise(n), 4000, 2) * np.exp(-t / 0.7) * np.clip(t / 0.002, 0, 1) * vel * 0.22
def tom(f=120, vel=0.6): return framedrum(f, vel, 0.25)
def brush(vel=0.4): return snare(vel, brush=True)

INST = {'hero': hero, 'herosoft': herosoft, 'saw': sawbass, 'celesta': celesta, 'glock': glock, 'musicbox': musicbox, 'harp': harp, 'pizz': pizz, 'gtr': gtr, 'flute': flute,
        'brass': brass, 'marimba': marimba2, 'kalimba': kalimba, 'bass': roundbass}

# =====================================================================================
# harmony
# =====================================================================================
MODES = {'major': [0, 2, 4, 5, 7, 9, 11], 'minor': [0, 2, 3, 5, 7, 8, 10], 'dorian': [0, 2, 3, 5, 7, 9, 10],
         'lydian': [0, 2, 4, 6, 7, 9, 11], 'mixo': [0, 2, 4, 5, 7, 9, 10]}
QUAL = {'maj': [0, 4, 7], 'min': [0, 3, 7], 'dim': [0, 3, 6], 'maj7': [0, 4, 7, 11], 'm7': [0, 3, 7, 10], '7': [0, 4, 7, 10],
        'sus4': [0, 5, 7], 'add9': [0, 4, 7, 14], 'madd9': [0, 3, 7, 14], '6': [0, 4, 7, 9], '7sus': [0, 5, 7, 10]}
class Key:
    def __init__(self, tonic, mode):
        self.t = midi(tonic + '4') if isinstance(tonic, str) else tonic; self.m = MODES[mode]
    def deg(self, d):
        """scale degree (1 = tonic at octave 4; 8 = an octave up; may be <= 0)"""
        k = d - 1; return self.t + 12 * (k // 7) + self.m[k % 7]
# chord symbol -> (root semitone offset from tonic, quality). Lowercase = minor; b = borrowed/flat.
RN = {'I': (0, 'maj'), 'ii': (2, 'min'), 'iii': (4, 'min'), 'IV': (5, 'maj'), 'iv': (5, 'min'), 'V': (7, 'maj'), 'V7': (7, '7'),
      'V7sus': (7, '7sus'), 'vi': (9, 'min'), 'bVI': (8, 'maj'), 'bVII': (10, 'maj'), 'bIII': (3, 'maj'), 'II': (2, 'maj'),
      'i': (0, 'min'), 'III': (3, 'maj'), 'VI': (8, 'maj'), 'VII': (10, 'maj'), 'v': (7, 'min'), 'Imaj7': (0, 'maj7'),
      'IVmaj7': (5, 'maj7'), 'vi7': (9, 'm7'), 'ii7': (2, 'm7'), 'iii7': (4, 'm7'), 'i9': (0, 'madd9'), 'Iadd9': (0, 'add9'),
      'Isus': (0, 'sus4'), 'VI7': (8, 'maj7'), 'III7': (3, 'maj7'), 'iv7': (5, 'm7'), 'bVImaj7': (8, 'maj7'), 'IV6': (5, '6')}
def chord_pcs(key, sym):
    off, q = RN[sym]; root = key.t + off
    return root, [root + i for i in QUAL[q]]

# progressions: one or two chords per bar
PROG = {
 'major': {'A': [['I'], ['V'], ['IV'], ['vi', 'V'], ['I'], ['iii'], ['IV', 'iv'], ['I']],
           'B': [['IV'], ['V'], ['iii', 'vi'], ['ii', 'V'], ['IV'], ['bVII'], ['ii', 'V'], ['V7sus', 'V7']]},
 'lush':  {'A': [['Imaj7'], ['V'], ['IVmaj7'], ['vi7', 'V'], ['Iadd9'], ['iii7'], ['IVmaj7', 'iv7'], ['Iadd9']],
           'B': [['IVmaj7'], ['V'], ['iii7', 'vi7'], ['ii7', 'V'], ['bVImaj7'], ['bVII'], ['ii7', 'V'], ['V7sus', 'V7']]},
 'minor': {'A': [['i'], ['VII'], ['iv'], ['VI', 'V'], ['i'], ['III'], ['iv', 'VI'], ['i']],
           'B': [['iv'], ['VII'], ['III', 'VI'], ['iv', 'V'], ['VI'], ['VII'], ['iv', 'V'], ['V']]},
}
# the theme: (scale degree, beats); None = rest. Bar 1 climbs root-third-fifth (the three leaves).
THEME = [[(5, .5), (8, .5), (10, .5), (12, 1.5), (11, .5), (10, .5)],
         [(9, 1), (10, .5), (8, 1.5), (None, 1)],
         [(6, .5), (8, .5), (11, .5), (13, 1.5), (12, .5), (11, .5)],
         [(10, .75), (9, .25), (8, .5), (9, .5), (5, 2)],
         [(5, .5), (8, .5), (10, .5), (12, 1.5), (11, .5), (10, .5)],
         [(9, 1), (10, .5), (12, 1.5), (None, 1)],
         [(13, .5), (12, .5), (11, .5), (10, .5), (9, .5), (11, .5), (10, .5), (9, .5)],
         [(8, 3), (None, 1)]]

def dev_line(key, prog_b):
    """B section lead: the motif sequenced on each chord root (odd bars), answering figure (even bars), run-up at the end"""
    out = []
    for i, bar in enumerate(prog_b):
        off = RN[bar[0]][0]
        r = 1 + min(range(7), key=lambda k: abs(key.m[k] - off))  # nearest diatonic degree of the chord root
        r += 7
        if i == 7: out.append([(r - 7 + k, .5) for k in range(8)]); continue
        if i % 2 == 0: out.append([(r - 3, .5), (r, .5), (r + 2, .5), (r + 4, 1.5), (r + 3, .5), (r + 2, .5)])
        else: out.append([(r + 1, 1), (r + 2, .5), (r, 1.5), (None, 1)])
    return out

def ornament(lines, style):
    """re-orchestration helpers: 'bounce' = staccato 8ths, 'grace' = grace-note pickups, 'aug' = legato (longer notes)"""
    if style == 'bounce':
        new = []
        for bar in lines:
            nb = []
            for d, b in bar:
                if d is not None and b >= 1.5: nb += [(d, .5), (None, .25), (d, .25), (d, b - 1)]
                else: nb.append((d, b))
            new.append(nb)
        return new
    if style == 'grace':
        new = []
        for bar in lines:
            nb = []
            for d, b in bar:
                if d is not None and b >= 1 and R.random() < 0.6: nb += [(d + 1, .125), (d, b - .125)]
                else: nb.append((d, b))
            new.append(nb)
        return new
    return lines

# =====================================================================================
# zone renderer
# =====================================================================================
class Zone:
    def __init__(self, z):
        self.z = z; self.key = Key(z['key'], z['mode']); self.bpm = z['bpm']; self.B = 60 / self.bpm; self.BAR = 4 * self.B
        pr = PROG[z.get('prog', 'major' if z['mode'] in ('major', 'lydian', 'mixo') else 'minor')]
        self.prog = pr['A'] + pr['B']; self.bars = 16
        self.m = Mix(self.bars * self.BAR, tail=6.0); self.kicks = []; self.sw = z.get('swing', 0.5)
    def T(self, bar, beat):
        b = beat
        frac = b % 1
        if abs(frac - 0.5) < 1e-6: b = b - 0.5 + self.sw   # swung offbeat
        return (bar - 1) * self.BAR + b * self.B
    def hum(self, t, amt=0.008): return t + R.normal(0, amt / 2)
    def chords(self, bar):
        syms = self.prog[bar - 1]; L = 4 / len(syms)
        return [(i * L, L, s) for i, s in enumerate(syms)]
    def voicing(self, pcs, center):
        best = None
        for inv in range(len(pcs)):
            v = sorted([p + 12 * ((center - p + 6) // 12) for p in pcs])
            v = [x for x in v]
            sc = abs(np.mean(v) - center)
            if best is None or sc < best[0]: best = (sc, v)
            pcs = pcs[1:] + [pcs[0] + 12]
        return best[1]
    # ---- layers ----
    def lead(self, inst, vel=0.6, octave=0, bus='lead', style=None, sections='AB', pan=0.0, dbl=None, dbl_oct=12, dbl_vel=0.3):
        A = ornament(THEME, style); Bl = ornament(dev_line(self.key, PROG[self.z.get('prog', 'major' if self.z['mode'] in ('major', 'lydian', 'mixo') else 'minor')]['B']), style)
        bars = (A if 'A' in sections else [[(None, 4)]] * 8) + (Bl if 'B' in sections else [[(None, 4)]] * 8)
        for i, bar in enumerate(bars):
            b = 0.0
            for d, dur in bar:
                if d is not None:
                    mm = self.key.deg(d) + octave; v = vel * R.uniform(0.88, 1.05) * (1.08 if b == 0 else 1)
                    t = self.hum(self.T(i + 1, b))
                    self.m.add(bus, INST[inst](hz(mm), dur * self.B * 0.95, v), t, pan=pan, jitter=0)
                    if dbl: self.m.add(bus + '2', INST[dbl](hz(mm + dbl_oct), dur * self.B, v * dbl_vel / vel), t, pan=-pan * 0.5 + 0.2, jitter=0)
                b += dur
    def counter(self, inst, vel=0.4, step=2, octave=0, bus='counter', bars=range(1, 17), pan=-0.3):
        prev = self.key.t + 4 + octave
        for bar in bars:
            for cb, L, sym in self.chords(bar):
                _, pcs = chord_pcs(self.key, sym)
                k = 0.0
                while k < L - 1e-6:
                    cands = [p + 12 * o for p in pcs for o in (-2, -1, 0, 1)]
                    cands = [c for c in cands if self.key.t - 7 + octave <= c <= self.key.t + 9 + octave]
                    nxt = min(cands, key=lambda c: (abs(c - prev) == 0, abs(c - prev)))
                    prev = nxt
                    self.m.add(bus, INST[inst](hz(nxt), step * self.B * 0.9, vel * R.uniform(0.85, 1.05)), self.hum(self.T(bar, cb + k)), pan=pan, jitter=0)
                    k += step
    def pad(self, vel=0.5, center=None, fc=2600, att=0.35, bus='pad'):
        c = center or (self.key.t + 2)
        for bar in range(1, 17):
            for cb, L, sym in self.chords(bar):
                _, pcs = chord_pcs(self.key, sym); v = self.voicing(pcs[:4], c)
                for nn in v: self.m.add(bus, strings(hz(nn), L * self.B, vel, att=att, fc=fc), self.T(bar, cb), jitter=0)
    def arp(self, inst, step=0.25, vel=0.35, pattern=(0, 1, 2, 3, 2, 1), octave=12, bus='arp', bars=range(1, 17), pan=0.4):
        for bar in bars:
            for cb, L, sym in self.chords(bar):
                _, pcs = chord_pcs(self.key, sym); v = self.voicing(pcs, self.key.t + 4 + octave)
                ext = v + [x + 12 for x in v]; k = 0; b = 0.0
                while b < L - 1e-6:
                    nn = ext[pattern[k % len(pattern)] % len(ext)]
                    acc = 1.0 if (cb + b) % 1 == 0 else 0.8
                    self.m.add(bus, INST[inst](hz(nn), step * self.B, vel * acc * R.uniform(0.85, 1.05)), self.hum(self.T(bar, cb + b), 0.005),
                               pan=(pan if k % 2 else -pan), jitter=0)
                    k += 1; b += step
    def bass(self, pattern='oompah', vel=0.6, inst='bass', bus='bass'):
        for bar in range(1, 17):
            ch = self.chords(bar)
            for ci, (cb, L, sym) in enumerate(ch):
                root, pcs = chord_pcs(self.key, sym); r = root - 24
                while r < midi('E1'): r += 12
                while r > midi('D#2'): r -= 12
                fifth = r + 7
                nxt_root = chord_pcs(self.key, (ch[ci + 1][2] if ci + 1 < len(ch) else self.prog[bar % 16][0]))[0]
                if pattern == 'oompah':
                    hits = [(0, 1, r, 1.0), (L / 2, 1, fifth if L >= 4 else r, 0.8)] + ([(L - 0.5, .5, r + 12, 0.6)] if L >= 4 else [])
                elif pattern == 'walk':
                    tones = [r, r + (pcs[1] - pcs[0]), fifth]
                    nr = nxt_root - 24
                    while nr < r - 6: nr += 12
                    while nr > r + 6: nr -= 12
                    tones.append(nr - 1 if nr > r else nr + 1)
                    hits = [(i * L / 4, L / 4, tones[i], 0.9 if i == 0 else 0.75) for i in range(4)] if L >= 4 else [(0, 1, r, 0.9), (1, 1, fifth, 0.75)]
                elif pattern == 'drive':
                    hits = [(i * 0.5, .42, r if i % 4 != 3 else (fifth if i < 4 else r + 12), 1.0 if i % 2 == 0 else 0.8) for i in range(int(L * 2))]
                elif pattern == 'octave8':
                    hits = [(i * 0.5, .45, r + (12 if i % 2 else 0), 0.9 if i % 2 == 0 else 0.7) for i in range(int(L * 2))]
                elif pattern == 'synco':
                    hits = [(0, .7, r, 1.0), (0.75, .5, r, 0.7), (1.5, .5, fifth, 0.8)] + ([(2.5, .5, r + 12, 0.75), (3.5, .5, fifth, 0.7)] if L >= 4 else [])
                else:  # sustain
                    hits = [(0, L * 0.95, r, 0.9)]
                for b, d, nn, a in hits:
                    self.m.add(bus, INST[inst](hz(nn), d * self.B, vel * a * R.uniform(0.92, 1.04)), self.hum(self.T(bar, cb + b), 0.004), jitter=0)
    def drums(self, kind, vel=1.0):
        for bar in range(1, 17):
            end = bar in (8, 16)
            if kind in ('bounce', 'select', 'fanfare', 'groove', 'adventure', 'funk', 'rock', 'epic'):
                kb = {'bounce': (0, 2, 2.5), 'select': (0, 1, 2, 3), 'fanfare': (0, 2), 'groove': (0, 1.75, 2.5), 'adventure': (0, 0.75, 2, 2.75),
                      'funk': (0, 0.75, 2.5, 3.25), 'rock': (0, 1.5, 2, 2.75), 'epic': (0, 0.75)}[kind]
                for b in kb:
                    self.m.add('kick', bigkick(0.75 * vel * R.uniform(0.9, 1.05)), self.hum(self.T(bar, b), 0.003), jitter=0); self.kicks.append(self.T(bar, b))
                for b in ((2,) if kind == 'epic' else (1, 3)):
                    if kind == 'adventure': self.m.add('perc', tom(150 if b == 1 else 110, 0.6 * vel), self.hum(self.T(bar, b)), pan=0.2 if b == 1 else -0.2, jitter=0)
                    self.m.add('snare', bigsnare((0.55 if kind != 'adventure' else 0.35) * vel * R.uniform(0.92, 1.05)), self.hum(self.T(bar, b), 0.004), jitter=0)
                if kind == 'epic':
                    for b, f in ((3, 130), (3.5, 105), (3.75, 90)): self.m.add('perc', tom(f, 0.6 * vel), self.hum(self.T(bar, b)), pan=0.25 if f > 100 else -0.25, jitter=0)
                step = 0.25 if kind in ('select', 'funk') else 0.5
                k = 0.0
                while k < 4 - 1e-6:
                    v = (0.34 if (k % 1) == 0.5 else 0.22) * vel * R.uniform(0.8, 1.1)
                    fn = shaker if kind in ('bounce', 'groove', 'adventure') else hat
                    self.m.add('hat', fn(v), self.hum(self.T(bar, k), 0.004), pan=0.3, jitter=0); k += step
                if kind in ('bounce', 'fanfare', 'groove'): self.m.add('perc', tamb(0.35 * vel), self.hum(self.T(bar, 3.5)), pan=-0.35, jitter=0)
                if end:
                    for i in range(8): self.m.add('snare', snare((0.12 + 0.05 * i) * vel), self.T(bar, 2 + i * 0.25), jitter=0)
            elif kind == 'brush':
                self.m.add('kick', kick(0.38 * vel, soft=True), self.T(bar, 0), jitter=0); self.kicks.append(self.T(bar, 0))
                for b in (1, 3): self.m.add('snare', brush(0.35 * vel), self.hum(self.T(bar, b)), jitter=0)
                for b in (0.5, 1.5, 2.5, 3.5): self.m.add('hat', shaker(0.18 * vel), self.hum(self.T(bar, b)), pan=0.3, jitter=0)
            elif kind == 'tick':
                for b in range(4): self.m.add('perc', woodblock(1500 if b % 2 == 0 else 1150, 0.35 * vel), self.hum(self.T(bar, b), 0.003), pan=0.4 if b % 2 == 0 else -0.4, jitter=0)
                self.m.add('kick', kick(0.4 * vel, soft=True), self.T(bar, 0), jitter=0); self.kicks.append(self.T(bar, 0))
                for b in (1.5, 3.5): self.m.add('hat', shaker(0.2 * vel), self.hum(self.T(bar, b)), jitter=0)
            elif kind == 'chimes':
                if bar % 4 == 1: self.m.add('perc', tamb(0.15 * vel), self.T(bar, 0), jitter=0)
        if kind in ('fanfare', 'select', 'bounce', 'rock', 'epic', 'adventure', 'funk'):
            for b0 in (1, 9): self.m.add('crash', crash(0.45 * vel), self.T(b0, 0), jitter=0)
    def stabs(self, bars=(8, 16), vel=0.5):
        for bar in bars:
            for cb, L, sym in self.chords(bar)[-1:]:
                _, pcs = chord_pcs(self.key, sym); v = self.voicing(pcs[:4], self.key.t + 7)
                for b, d in ((cb, 0.4), (cb + 0.75, 0.4), (cb + 1.5, 1.2)) if L >= 2 else ((cb, 0.4),):
                    for nn in v: self.m.add('brass', brass(hz(nn), d * self.B, vel * R.uniform(0.9, 1.0)), self.T(bar, b), pan=0.1, jitter=0)
                    self.m.add('brass', hero(hz(v[0] - 12), d * self.B, vel * 0.8), self.T(bar, b), jitter=0)

# ---- mix ----
def chains(beat):
    return {
        'lead': pb.Pedalboard([pb.HighpassFilter(220), pb.Compressor(-18, 2.5, 8, 120), pb.Delay(beat * 0.75, 0.28, 0.14), pb.Gain(-1)]),
        'lead2': pb.Pedalboard([pb.HighpassFilter(500), pb.Delay(beat * 0.5, 0.25, 0.12), pb.Gain(-6)]),
        'counter': pb.Pedalboard([pb.HighpassFilter(160), pb.Gain(-5)]),
        'pad': pb.Pedalboard([pb.HighpassFilter(140), pb.Chorus(0.3, 0.2, 7, 0.1, 0.25), pb.Gain(-4)]),
        'arp': pb.Pedalboard([pb.HighpassFilter(280), pb.Delay(beat * 0.75, 0.3, 0.16), pb.Gain(-7)]),
        'bass': pb.Pedalboard([pb.HighpassFilter(35), pb.LowpassFilter(3000), pb.Compressor(-20, 3, 5, 90), pb.Gain(-1)]),
        'kick': pb.Pedalboard([pb.LowpassFilter(5000), pb.Gain(-4)]),
        'snare': pb.Pedalboard([pb.HighpassFilter(150), pb.Gain(-9)]),
        'hat': pb.Pedalboard([pb.HighpassFilter(4500), pb.Gain(-12)]),
        'perc': pb.Pedalboard([pb.HighpassFilter(120), pb.Gain(-9)]),
        'crash': pb.Pedalboard([pb.Gain(-14)]),
        'brass': pb.Pedalboard([pb.HighpassFilter(150), pb.Compressor(-16, 2, 10, 120), pb.Gain(-5)]),
    }
# mix roles: loudness of each part relative to the others (before mastering to -16 LUFS)
ROLE = {'lead': -20, 'lead2': -26, 'counter': -26, 'pad': -26, 'arp': -26, 'bass': -21.5, 'kick': -21.5, 'snare': -24.5, 'hat': -31,
        'perc': -28, 'crash': -32, 'brass': -22.5}
SENDS = {'lead': 0.22, 'lead2': 0.35, 'counter': 0.25, 'pad': 0.3, 'arp': 0.32, 'snare': 0.25, 'perc': 0.25, 'brass': 0.3, 'crash': 0.2}

def duck_curve(n, times, depth=0.35, rel=0.18):
    d = np.ones(n); k = _t(int(rel * 5 * SR)); shape = 1 - depth * np.exp(-k / rel) * np.clip(k / 0.006, 0, 1)
    for t0 in times:
        i = int(round(t0 * SR)) % n; seg = shape[:n - i]; d[i:i + len(seg)] = np.minimum(d[i:i + len(seg)], seg)
        if len(seg) < len(shape): r = shape[len(seg):]; d[:len(r)] = np.minimum(d[:len(r)], r)
    return d

def render(name, zf):
    z = zf(); Zn = z.pop('_z')
    m = Zn.m; ch = chains(Zn.B)
    dc = duck_curve(m.n, Zn.kicks) if Zn.kicks else None
    dry = np.zeros((2, m.n)); send = np.zeros((2, m.n)); lvl = z.get('levels', {})
    for name_b in m.bus:
        y = m.folded(name_b)
        if name_b in ch: y = periodic(ch[name_b], y)
        lb = lufs(np.tile(y, (1, 2)))
        if np.isfinite(lb): y = y * 10 ** ((ROLE.get(name_b, -28) - lb) / 20)  # balance each part to its role
        y = y * 10 ** (lvl.get(name_b, 0) / 20)
        if dc is not None and name_b in ('pad', 'arp', 'counter'): y = y * dc
        dry += y; send += y * SENDS.get(name_b, 0)
        if os.environ.get('S3DBG'): print('   bus', name_b, round(float(lufs(np.tile(y, (1, 2)))), 1), flush=True)
    ir = reverb_ir(z.get('verb', 2.4), 0.025, 7500, seed=sum(map(ord, name)))
    rv = periodic(pb.Pedalboard([pb.HighpassFilter(250), pb.LowpassFilter(8000)]), circ_reverb(send, ir, z.get('wet', 0.9)))
    mix = dry + rv
    glue = [pb.LowShelfFilter(80, 0.5), pb.HighShelfFilter(10000, 0.8 if not z.get('soft') else -2.0), pb.Compressor(-16, 2, 20, 200)]
    if z.get('soft'): glue.insert(0, pb.LowpassFilter(7000))
    mix = periodic(pb.Pedalboard(glue), mix)
    mix = master(mix, -16.0, -1.0)
    h = int(0.5 * SR)
    sf.write(f'{OUT}/{name}.wav', np.concatenate([mix[:, -h:], mix, mix[:, :h]], axis=1).T, SR, subtype='FLOAT')
    info = {'loop': round(m.n / SR, 4), 'bpm': Zn.bpm, 'bar': round(Zn.BAR, 6), 'key': z['key'] + ' ' + z['mode'],
            'lufs': round(float(lufs(np.tile(mix, (1, 2)))), 2), 'tp': round(float(true_peak_db(mix)), 2)}
    json.dump(info, open(f'{OUT}/{name}.json', 'w')); print(name, info, flush=True)

# =====================================================================================
# zones: the homepage worlds, then each product page
# =====================================================================================
def zone(**k):
    Zn = Zone(k); k['_z'] = Zn; return k, Zn
def Z_hero():      # overworld: bold, adventurous, inviting
    k, z = zone(key='D', mode='major', bpm=124)
    z.lead('hero', 0.62, dbl='brass', dbl_oct=0, dbl_vel=0.22); z.counter('gtr', 0.4, step=1); z.pad(0.4)
    z.arp('harp', 0.5, 0.28, (0, 1, 2, 3), bars=range(9, 17)); z.bass('drive', 0.66, inst='saw'); z.drums('rock'); z.stabs((4, 8, 12, 16), 0.5); return k
def Z_about():     # mosaic: curious, with swagger
    k, z = zone(key='A', mode='minor', bpm=108, swing=0.57)
    z.lead('marimba', 0.62, octave=12, style='grace', dbl='gtr', dbl_oct=0, dbl_vel=0.3); z.counter('pizz', 0.5, step=1)
    z.pad(0.32, fc=1800); z.bass('synco', 0.62, inst='saw'); z.drums('funk', 0.9); z.stabs((8, 16), 0.42); return k
def Z_work():      # products carousel: level select
    k, z = zone(key='G', mode='major', bpm=132)
    z.lead('hero', 0.58, dbl='brass', dbl_oct=0, dbl_vel=0.2); z.arp('marimba', 0.25, 0.3, (0, 1, 2, 3, 4, 3, 2, 1)); z.counter('pizz', 0.42, step=2)
    z.pad(0.32); z.bass('drive', 0.62, inst='saw'); z.drums('select'); z.stabs((4, 8, 12, 16), 0.45); return k
def Z_identity():  # brand showcase: creative, playful, punchy
    k, z = zone(key='Bb', mode='major', bpm=116, swing=0.56)
    z.lead('gtr', 0.62, style='bounce', dbl='brass', dbl_oct=0, dbl_vel=0.2); z.counter('marimba', 0.5, step=1)
    z.pad(0.3, fc=2000); z.bass('synco', 0.66, inst='saw'); z.drums('funk'); z.stabs((4, 8, 12, 16), 0.48); return k
def Z_experience():  # HealthTech: warm and gentle, still confident
    k, z = zone(key='Eb', mode='major', bpm=92, prog='lush')
    z.lead('herosoft', 0.55); z.arp('harp', 0.5, 0.3, (0, 1, 2, 3, 2, 1)); z.pad(0.5, fc=2000, att=0.6)
    z.counter('celesta', 0.25, step=2, octave=12, bars=range(9, 17)); z.bass('walk', 0.55); z.drums('groove', 0.8); return k
def Z_forest():    # enchanted forest: magical celesta + harp water arpeggios, with a heroic edge
    k, z = zone(key='Ab', mode='major', bpm=96, prog='lush')
    z.lead('celesta', 0.6, octave=12, dbl='herosoft', dbl_oct=-12, dbl_vel=0.25); z.arp('harp', 1 / 3, 0.3, (0, 1, 2, 3, 4, 5, 4, 3, 2), octave=12)
    z.pad(0.45, fc=1700, att=0.8); z.bass('sustain', 0.5); z.drums('epic', 0.75); z.stabs((8, 16), 0.4)
    k['verb'] = 3.4; k['wet'] = 1.0; k['levels'] = {'arp': 3, 'pad': 1, 'lead': -1}; return k
def Z_contact():   # level complete: triumphant lift
    k, z = zone(key='E', mode='major', bpm=128)
    z.lead('hero', 0.6, dbl='brass', dbl_oct=0, dbl_vel=0.3); z.counter('glock', 0.3, step=1, octave=12); z.pad(0.45, fc=3000)
    z.arp('harp', 0.25, 0.25, (0, 1, 2, 3)); z.bass('drive', 0.66, inst='saw'); z.drums('rock'); z.stabs((2, 4, 6, 8, 10, 12, 14, 16), 0.5); return k
HOME = {'hero': Z_hero, 'about': Z_about, 'work': Z_work, 'identity': Z_identity, 'experience': Z_experience, 'forest': Z_forest, 'contact': Z_contact}

def P_shomer():    # calm, assured, guardian
    k, z = zone(key='D', mode='major', bpm=92, prog='lush')
    z.lead('herosoft', 0.55); z.arp('harp', 0.5, 0.28, (0, 1, 2, 3)); z.pad(0.5, fc=1900, att=0.6); z.bass('walk', 0.55); z.drums('groove', 0.8); return k
def P_lickpick():  # music energy
    k, z = zone(key='A', mode='minor', bpm=124, swing=0.55)
    z.lead('gtr', 0.62, style='bounce', dbl='hero', dbl_oct=0, dbl_vel=0.2); z.arp('gtr', 0.25, 0.22, (0, 2, 1, 3), octave=0); z.pad(0.28)
    z.bass('synco', 0.66, inst='saw'); z.drums('funk'); z.stabs((4, 8, 12, 16), 0.45); return k
def P_trashure():  # adventure
    k, z = zone(key='D', mode='minor', bpm=112, swing=0.54)
    z.lead('hero', 0.58, dbl='marimba', dbl_oct=12, dbl_vel=0.3); z.arp('marimba', 0.5, 0.32, (0, 2, 1, 3)); z.pad(0.32)
    z.bass('drive', 0.6, inst='saw'); z.drums('adventure'); z.stabs((8, 16), 0.45); return k
def P_chore():     # playful arena
    k, z = zone(key='C', mode='major', bpm=128)
    z.lead('brass', 0.55, dbl='glock', dbl_vel=0.22); z.counter('pizz', 0.55, step=1); z.pad(0.3)
    z.bass('oompah', 0.66, inst='saw'); z.drums('rock'); z.stabs((4, 8, 12, 16), 0.5); return k
def P_fairent():   # clean, trustworthy
    k, z = zone(key='F', mode='major', bpm=100, prog='lush')
    z.lead('celesta', 0.55, octave=12, dbl='herosoft', dbl_oct=-12, dbl_vel=0.2); z.arp('harp', 0.5, 0.26, (0, 1, 2, 3)); z.pad(0.4, fc=2200)
    z.bass('walk', 0.55); z.drums('groove', 0.8); return k
def P_j8nix():     # dark tech
    k, z = zone(key='F', mode='minor', bpm=104)
    z.lead('herosoft', 0.55); z.arp('pizz', 0.25, 0.3, (0, 2, 1, 3), octave=0); z.pad(0.45, fc=1100); z.bass('octave8', 0.62, inst='saw'); z.drums('select', 0.8); return k
def P_health():    # warm, clinical
    k, z = zone(key='G', mode='major', bpm=92, prog='lush')
    z.lead('herosoft', 0.5); z.arp('celesta', 0.5, 0.22, (0, 2, 1, 3), octave=12); z.pad(0.5, fc=2000, att=0.5); z.bass('walk', 0.5); z.drums('brush', 0.85); return k
def P_ezra():      # soft concept
    k, z = zone(key='E', mode='minor', bpm=88)
    z.lead('harp', 0.55, octave=12); z.arp('celesta', 1.0, 0.2, (0, 1, 2), octave=12); z.pad(0.5, fc=1500, att=0.8); z.bass('sustain', 0.45); z.drums('brush', 0.6); return k
def P_milo():      # gentle, kid-safe: music box and kalimba, no drums, nothing sharp
    k, z = zone(key='C', mode='major', bpm=78, prog='lush')
    z.lead('musicbox', 0.45, octave=12); z.arp('kalimba', 1.0, 0.3, (0, 1, 2, 1), octave=0); z.pad(0.45, fc=1200, att=1.0); z.bass('sustain', 0.35)
    k['soft'] = True; return k
def P_rk():        # soft concept, a quiet chess-clock tick
    k, z = zone(key='A', mode='minor', bpm=96)
    z.lead('marimba', 0.55, octave=12); z.counter('pizz', 0.4, step=2); z.pad(0.42, fc=1500); z.bass('sustain', 0.5); z.drums('tick', 0.7); return k
def P_concepts():  # Concept Lab: sci-fi shimmer over a driving pulse
    k, z = zone(key='B', mode='minor', bpm=108)
    z.lead('musicbox', 0.55, octave=12, dbl='herosoft', dbl_oct=-12, dbl_vel=0.3); z.arp('celesta', 0.25, 0.22, (0, 2, 1, 3, 4, 2), octave=12)
    z.pad(0.45, fc=1600); z.bass('octave8', 0.6, inst='saw'); z.drums('select', 0.8); return k
PAGES = {'shomer': P_shomer, 'lickpick': P_lickpick, 'trashure-hunters': P_trashure, 'chore-royale': P_chore, 'fairent': P_fairent,
         'j8nix': P_j8nix, 'healthtech': P_health, 'ezra': P_ezra, 'milo': P_milo, 'rk': P_rk, 'concepts': P_concepts}

DEMO = [('hero', 8, 2), ('work', 5, 2), ('shomer', 4, 1), ('lickpick', 4, 1), ('trashure-hunters', 4, 1), ('identity', 6, 1),
        ('experience', 6, 2), ('about', 6, 2), ('forest', 8, 2), ('contact', 9, 2)]
def demo(plan=DEMO):
    """walk through the homepage as a visitor: zones (2 s crossfades) and three carousel products (1 s crossfades);
    each part enters at its phrase start, equal-power fades"""
    total = sum(p[1] for p in plan); n = int(total * SR); out = np.zeros((2, n + int(3 * SR))); h = int(0.5 * SR); t = 0.0
    for i, (nm, secs, xf) in enumerate(plan):
        x, _ = sf.read(f'{OUT}/{nm}.wav'); x = x.T[:, h:-h]
        nxf = plan[i + 1][2] if i + 1 < len(plan) else 2
        L = int((secs + nxf) * SR); y = np.tile(x, (1, 3))[:, :L].copy()
        if i > 0: k = int(xf * SR); y[:, :k] *= np.sin(np.linspace(0, 1, k) * np.pi / 2)
        k = int(nxf * SR); y[:, -k:] *= np.cos(np.linspace(0, 1, k) * np.pi / 2)
        t0 = int(t * SR); out[:, t0:t0 + L] += y; t += secs
    out = out[:, :n]
    k = int(1.5 * SR); out[:, -k:] *= np.linspace(1, 0, k)
    out *= 10 ** ((-16.0 - lufs(out)) / 20); pk = true_peak_db(out)
    if pk > -1.2: out *= 10 ** ((-1.2 - pk) / 20)
    sf.write(f'{OUT}/demo.wav', out.T, SR, subtype='FLOAT'); print('demo', round(out.shape[1] / SR, 2), 's', round(float(lufs(out)), 2), 'LUFS', round(float(true_peak_db(out)), 2), 'dBTP')

if __name__ == '__main__':
    args = sys.argv[1:] or ['home']
    todo = []
    for a in args:
        if a == 'home': todo += list(HOME)
        elif a == 'pages': todo += list(PAGES)
        elif a == 'demo': todo.append('demo')
        else: todo.append(a)
    for a in todo:
        if a == 'demo': demo(); continue
        R = np.random.default_rng(sum(map(ord, a)))
        globals()['R'] = R
        render(a, {**HOME, **PAGES}[a])
