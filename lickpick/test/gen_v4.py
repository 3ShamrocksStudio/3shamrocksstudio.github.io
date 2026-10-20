# LickPick round-4 test takes: a new generator (new seeds, new timbres, new styles) for the beat-confidence gate, free-time
# sections, slow compound meters, chord-follow and attack latency. Builds on gen_v3's mic chain and modal guitar, adds:
# timbres  nylon, ukulele, distorted guitar (drive + cab, palm-muted), piano / organ / pad with slow attacks (per take),
#          a vocal-like lead (formant voice, vibrato, 30-90 ms swell), string pad stabs
# styles   rock, pop (clear), reggae one-drop, reggae 2&4, ska, cumbia, funk with ghost strums, afrobeat, bossa, samba,
#          12/8 blues shuffle, 6/8 ballad (slow dotted quarter), waltz, disco, punk, metal palm-muted, rubato intro (+ fermata),
#          odd bars (an inserted 2/4 or a dropped beat)
# truth    beats (the counted beat; dotted quarter in 6/8 and 12/8), downbeat indices (odd bars included), meter, free
#          stretches, chords per beat (pitch classes), harmony timbre + its attack (ms)
# usage: python3 gen_v4.py OUTDIR SPLIT N_PER_FAMILY   (SPLIT tune4|test4: disjoint seeds; test4 is for reporting only)
import sys, os, json, wave, numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
OUT, SPLIT, NPF = sys.argv[1], sys.argv[2], int(sys.argv[3]); os.makedirs(OUT, exist_ok=True)
ONLY = sys.argv[4].split(',') if len(sys.argv) > 4 else None
SR = 32000
NOTE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
IV = {'maj': [0, 4, 7], 'min': [0, 3, 7], '7': [0, 4, 7, 10], 'maj7': [0, 4, 7, 11], 'm7': [0, 3, 7, 10], 'dim': [0, 3, 6], 'm7b5': [0, 3, 6, 10], '5': [0, 7], 'sus4': [0, 5, 7], '6': [0, 4, 7, 9]}
P_MAJ = [[(0, 'maj'), (7, 'maj'), (9, 'min'), (5, 'maj')], [(0, 'maj'), (5, 'maj'), (7, 'maj'), (5, 'maj')], [(2, 'min'), (7, 'maj'), (0, 'maj'), (0, 'maj')],
         [(0, 'maj'), (9, 'min'), (5, 'maj'), (7, 'maj')], [(0, 'maj'), (4, 'min'), (5, 'maj'), (7, '7')], [(5, 'maj'), (0, 'maj'), (7, 'maj'), (9, 'min')],
         [(0, 'maj7'), (2, 'm7'), (5, 'maj7'), (7, '7')], [(0, 'maj'), (10, 'maj'), (5, 'maj'), (0, 'maj')], [(0, 'maj'), (2, '7'), (5, 'maj'), (7, 'maj')],
         [(9, 'min'), (7, 'maj'), (5, 'maj'), (7, 'maj')], [(0, 'maj'), (5, 'maj'), (9, 'min'), (7, 'sus4')]]
P_MIN = [[(0, 'min'), (8, 'maj'), (3, 'maj'), (10, 'maj')], [(0, 'min'), (5, 'min'), (7, '7'), (0, 'min')], [(0, 'min'), (10, 'maj'), (8, 'maj'), (7, 'maj')],
         [(0, 'm7'), (5, 'm7'), (10, '7'), (3, 'maj7')], [(0, 'min'), (3, 'maj'), (5, 'min'), (7, 'min')], [(0, 'min'), (8, 'maj'), (5, 'min'), (7, '7')]]
SEED0 = {'tune4': 314100, 'test4': 777300}[SPLIT]
lp = lambda x, f, o=2: sosfilt(butter(o, min(f, SR * 0.45), 'low', fs=SR, output='sos'), x)
hp = lambda x, f, o=2: sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
bp = lambda x, a, b, o=2: sosfilt(butter(o, [a, min(b, SR * 0.45)], 'band', fs=SR, output='sos'), x)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def env(n, atk, rel_at, rel, curve=1.0):
    e = np.ones(n); a = max(1, int(atk * SR)); e[:a] = np.linspace(0, 1, a) ** curve
    r0 = int(rel_at * SR)
    if r0 < n: rl = max(1, int(rel * SR)); m = min(n - r0, rl); e[r0:r0 + m] *= np.linspace(1, 0, m); e[r0 + m:] = 0
    return e

class Synth:
    def __init__(s, rng, atk): s.rng = rng; s.cache = {}; s.atk = atk     # atk: this take's attack (s) for piano / organ / pad / voice
    def _c(s, key, f):
        if key not in s.cache: s.cache[key] = f()
        return s.cache[key]
    def pluck(s, m, gate, bright, decay=1.6, atk=0.0015, pick=0.15, pickband=(1500, 6000), nh=16, B=6e-5):
        def f():
            n = int((gate + 0.08) * SR); t = np.arange(n) / SR; f0 = hz(m); y = np.zeros(n); r = np.random.default_rng(m * 7 + 3)
            for k in range(1, nh):
                fk = k * f0 * np.sqrt(1 + B * k * k)
                if fk > SR * 0.42: break
                a = (bright ** (k - 1)) / k ** 0.8 * r.uniform(0.5, 1.2) * abs(np.sin(np.pi * k * 0.23)) ** 0.7
                y += a * np.exp(-t / (decay / (1 + 0.45 * k))) * np.sin(2 * np.pi * fk * t + r.uniform(0, 6.28))
            y *= env(n, atk, gate, 0.06)
            pk = bp(r.normal(0, 1, min(n, int(0.006 * SR))), *pickband) * pick; y[:len(pk)] += pk
            return y
        return s._c(('p', m, round(gate, 2), round(bright, 2), decay, atk, pick), f)
    def gtr(s, m, gate, bright): return s.pluck(m, gate, bright)
    def nylon(s, m, gate, bright): return s.pluck(m, gate, bright * 0.6, decay=2.2, atk=0.004, pick=0.05, pickband=(600, 2500), nh=12)
    def uke(s, m, gate, bright): return s.pluck(m, gate, min(0.8, bright + 0.1), decay=0.55, atk=0.0012, pick=0.12, pickband=(2000, 7000), nh=10)
    def piano(s, m, gate):
        def f():
            n = int((gate + 0.25) * SR); t = np.arange(n) / SR; f0 = hz(m); y = np.zeros(n); B = 2e-4 * (1 + (m - 40) / 40); r = np.random.default_rng(m * 13 + 1)
            for k in range(1, 12):
                fk = k * f0 * np.sqrt(1 + B * k * k)
                if fk > SR * 0.42: break
                y += 1 / k ** 1.1 * r.uniform(0.6, 1.1) * (0.7 * np.exp(-t / (0.35 / (1 + 0.2 * k))) + 0.3 * np.exp(-t / (3.0 / (1 + 0.3 * k)))) * np.sin(2 * np.pi * fk * t)
            y *= env(n, s.atk, gate, 0.2, 1.5)
            ham = lp(r.normal(0, 1, int(0.004 * SR)), 3000) * 0.12; y[int(s.atk * SR * 0.5):int(s.atk * SR * 0.5) + len(ham)] += ham[:max(0, n - int(s.atk * SR * 0.5))]
            return y
        return s._c(('pi', m, round(gate, 2)), f)
    def organ(s, m, gate):
        def f():
            n = int((gate + 0.03) * SR); t = np.arange(n) / SR; f0 = hz(m); y = np.zeros(n)
            for h, a in zip([1, 2, 3, 4, 6, 8], (1, .8, .5, .35, .2, .15)):
                if h * f0 < SR * 0.42: y += a * np.sin(2 * np.pi * h * f0 * t)
            return y * env(n, s.atk, gate, 0.02)
        return s._c(('o', m, round(gate, 3)), f)
    def epiano(s, m, gate):
        def f():
            n = int((gate + 0.15) * SR); t = np.arange(n) / SR; f0 = hz(m); I = 2.2 * np.exp(-t / 0.25)
            y = np.sin(2 * np.pi * f0 * t + I * np.sin(2 * np.pi * f0 * t)) * np.exp(-t / 1.4) + 0.15 * np.sin(2 * np.pi * 14 * f0 * t) * np.exp(-t / 0.03)
            return y * env(n, max(0.002, s.atk * 0.6), gate, 0.12)
        return s._c(('e', m, round(gate, 2)), f)
    def pad(s, m, gate, atk=None):
        a0 = atk if atk is not None else max(0.04, s.atk * 4)
        def f():
            n = int((gate + 0.3) * SR); t = np.arange(n) / SR; f0 = hz(m); y = np.zeros(n); r = np.random.default_rng(m * 5 + 11)
            vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * t + r.uniform(0, 6))
            for k in range(1, 10):
                if k * f0 > SR * 0.4: break
                y += (1 / k) * np.sin(2 * np.pi * k * f0 * np.cumsum(vib) / SR + r.uniform(0, 6)) * (0.85 ** k)
            return lp(y, 5000) * env(n, a0, gate, 0.25, 1.4)
        return s._c(('pad', m, round(gate, 2), round(a0, 3)), f)
    def voice(s, m, gate, atk):
        def f():
            n = int((gate + 0.12) * SR); t = np.arange(n) / SR; f0 = hz(m); r = np.random.default_rng(m * 3 + 5)
            vib = 1 + (0.017 * np.clip((t - 0.15) / 0.2, 0, 1)) * np.sin(2 * np.pi * 5.5 * t)
            ph = 2 * np.pi * f0 * np.cumsum(vib) / SR; y = np.zeros(n)
            F1, F2 = r.choice([(700, 1200), (400, 2000), (550, 900), (300, 2300)])
            for k in range(1, 14):
                fk = k * f0
                if fk > SR * 0.4: break
                g = 1 / k * (np.exp(-((fk - F1) / 180) ** 2) * 3 + np.exp(-((fk - F2) / 260) ** 2) * 2 + 0.25)
                y += g * np.sin(k * ph)
            y += 0.01 * r.normal(0, 1, n)
            return y * env(n, atk, gate, 0.08, 1.3) / 3
        return s._c(('v', m, round(gate, 2), round(atk, 3)), f)
    def bass(s, m, gate):
        def f():
            n = int((gate + 0.05) * SR); t = np.arange(n) / SR; f0 = hz(m); y = np.zeros(n)
            for k in range(1, 8): y += (1 / k ** 1.6) * np.exp(-t / (0.9 / (1 + 0.5 * k))) * np.sin(2 * np.pi * k * f0 * t)
            return y * env(n, 0.003, gate, 0.04)
        return s._c(('b', m, round(gate, 2)), f)
    def drum(s, kind):
        def f():
            r = np.random.default_rng(len(kind) * 17 + 1)
            if kind == 'kick': n = int(0.35 * SR); t = np.arange(n) / SR; fq = 45 + 80 * np.exp(-t / 0.03); return np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-t / 0.12)
            if kind == 'snare': n = int(0.25 * SR); t = np.arange(n) / SR; return 0.6 * bp(r.normal(0, 1, n), 1200, 8000) * np.exp(-t / 0.07) + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
            if kind == 'hat': n = int(0.06 * SR); t = np.arange(n) / SR; return 0.35 * hp(r.normal(0, 1, n), 7000, 4) * np.exp(-t / 0.015)
            if kind == 'open': n = int(0.3 * SR); t = np.arange(n) / SR; return 0.3 * hp(r.normal(0, 1, n), 6000, 4) * np.exp(-t / 0.12)
            if kind == 'rim': n = int(0.06 * SR); t = np.arange(n) / SR; return 0.6 * (np.sin(2 * np.pi * 1700 * t) + 0.5 * bp(r.normal(0, 1, n), 2000, 5000)) * np.exp(-t / 0.012)
            if kind == 'shaker': n = int(0.07 * SR); t = np.arange(n) / SR; return 0.25 * bp(r.normal(0, 1, n), 4000, 11000) * np.sin(np.pi * t / t[-1]) ** 2
            if kind == 'guiro': n = int(0.09 * SR); t = np.arange(n) / SR; return 0.3 * bp(r.normal(0, 1, n), 2500, 7000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 70 * t))) * np.exp(-t / 0.05)
            if kind == 'surdo': n = int(0.5 * SR); t = np.arange(n) / SR; fq = 60 + 25 * np.exp(-t / 0.04); return np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-t / 0.25)
            if kind == 'tamb': n = int(0.05 * SR); t = np.arange(n) / SR; return 0.5 * (np.sin(2 * np.pi * 1300 * t) + 0.4 * bp(r.normal(0, 1, n), 3000, 8000)) * np.exp(-t / 0.01)
            if kind == 'bell': n = int(0.2 * SR); t = np.arange(n) / SR; return 0.35 * (np.sign(np.sin(2 * np.pi * 810 * t)) + np.sign(np.sin(2 * np.pi * 545 * t))) * np.exp(-t / 0.05)
        return s._c(('d', kind), f)

def voicing(rng, root, q, inst, inv=False):
    iv = IV[q]; pcs = [(root + i) % 12 for i in iv]
    bass_pc = pcs[1] if inv and len(pcs) > 2 else pcs[0]
    if inst in ('gtr', 'nylon', 'distgtr'):
        b = 40 + ((bass_pc - 4) % 12)
        if b > 49: b -= 12
        out = [b]; cur = b
        while len(out) < rng.integers(4, 7):
            cand = [cur + d for d in range(3, 9) if (cur + d) % 12 in pcs]; cur = cand[0] if cand else cur + 5; out.append(cur)
        return out
    if inst == 'uke':
        return sorted(60 + ((p - 0) % 12) for p in pcs)[:4] if len(pcs) >= 3 else [60 + pcs[0] % 12, 60 + pcs[1] % 12, 72 + pcs[0] % 12]
    lo = 36 + (bass_pc % 12)
    if lo > 45: lo -= 12
    top0 = 58 + int(rng.integers(0, 8)); rh = sorted(top0 + ((p - top0) % 12) for p in pcs)
    if rng.random() < 0.4 and len(rh) >= 3: rh = rh[1:] + [rh[0] + 12]
    return [lo] + ([lo + 7] if rng.random() < 0.5 and q not in ('dim', 'm7b5') else []) + rh

def mkbeats(rng, t0, dur, bpm, wander=True):
    B = []; t = t0
    while t < dur: B.append(t); t += 60 / bpm
    B = np.array(B)
    if wander and len(B):
        w = np.convolve(rng.normal(0, 1, len(B) + 20), np.ones(10) / 10, 'same')[10:10 + len(B)]; B = B + w / (np.abs(w).max() + 1e-9) * rng.uniform(0.002, 0.009)
    return B

FAMS = ['rock', 'pop', 'reggae', 'reggae24', 'ska', 'cumbia', 'funk', 'afrobeat', 'bossa', 'samba', 'blues128', 'ballad68', 'waltz', 'disco', 'punk', 'metal', 'rubato', 'oddbar']
CLEAR = {'rock', 'pop', 'disco', 'punk', 'metal', 'oddbar'}

def make(fam, idx):
    rng = np.random.default_rng(SEED0 + idx * 131 + sum(map(ord, fam)) * 11)
    # harmony timbre and its attack
    pool = {'rock': ['gtr', 'distgtr', 'gtr', 'piano'], 'pop': ['piano', 'gtr', 'nylon', 'uke', 'epiano', 'organ'], 'reggae': ['organ', 'gtr', 'piano'], 'reggae24': ['gtr', 'organ', 'nylon'],
            'ska': ['gtr', 'organ', 'piano'], 'cumbia': ['organ', 'piano', 'gtr'], 'funk': ['gtr', 'distgtr', 'epiano'], 'afrobeat': ['gtr', 'organ'], 'bossa': ['nylon', 'piano', 'epiano'],
            'samba': ['uke', 'nylon', 'gtr'], 'blues128': ['piano', 'gtr', 'organ', 'distgtr'], 'ballad68': ['piano', 'nylon', 'pad', 'epiano'], 'waltz': ['piano', 'gtr', 'organ', 'uke'],
            'disco': ['piano', 'pad', 'gtr'], 'punk': ['distgtr'], 'metal': ['distgtr'], 'rubato': ['piano', 'nylon', 'gtr', 'pad'], 'oddbar': ['gtr', 'piano', 'distgtr', 'uke']}[fam]
    harm = str(rng.choice(pool))
    slow = rng.random() < 0.5
    atk = {'piano': rng.uniform(0.012, 0.03) if slow else rng.uniform(0.002, 0.008), 'organ': rng.uniform(0.02, 0.045) if slow else rng.uniform(0.004, 0.012), 'epiano': rng.uniform(0.004, 0.02),
           'pad': rng.uniform(0.02, 0.06)}.get(harm, 0.002)
    S = Synth(rng, atk); minor = rng.random() < 0.3 and fam not in ('reggae', 'blues128')
    tonic = int(rng.integers(0, 12)); P = P_MIN if minor else P_MAJ; prog = P[rng.integers(0, len(P))]
    meter, compound, bpb = 4, False, 4
    lo_hi = {'rock': (90, 150), 'pop': (76, 128), 'reggae': (120, 165), 'reggae24': (66, 86), 'ska': (150, 190), 'cumbia': (84, 108), 'funk': (88, 114), 'afrobeat': (100, 124),
             'bossa': (118, 148), 'samba': (92, 116), 'blues128': (48, 70), 'ballad68': (40, 62), 'waltz': (96, 190), 'disco': (112, 128), 'punk': (168, 205), 'metal': (100, 160),
             'rubato': (70, 120), 'oddbar': (84, 140)}[fam]
    bpm = float(rng.uniform(*lo_hi)); dur = float(rng.uniform(34, 46))
    if fam == 'blues128': compound = True; prog = [(0, '7')] * 4 + [(5, '7')] * 2 + [(0, '7')] * 2 + [(7, '7'), (5, '7'), (0, '7'), (7, '7')]
    if fam == 'ballad68': compound = True; meter = 2; bpb = 2
    if fam == 'waltz': meter = 3; bpb = 3
    if fam == 'afrobeat': prog = [(0, 'm7'), (0, 'm7'), (5, 'm7'), (5, 'm7')] if rng.random() < 0.6 else [(0, 'm7'), (10, 'maj'), (0, 'm7'), (10, 'maj')]; minor = True
    if fam == 'funk' and rng.random() < 0.5: prog = [(0, '7'), (0, '7'), (5, '7'), (0, '7')]
    if fam == 'reggae': minor = False
    # timeline: free stretches (rubato intro, a fermata), steady beats, odd bars
    free = []; t_start = float(rng.uniform(0.3, 1.0))
    if fam == 'rubato': t_start = float(rng.uniform(7, 13)); free.append([0.0, t_start])
    beats = list(mkbeats(rng, t_start, dur, bpm))
    if fam == 'rubato' and rng.random() < 0.4:   # a fermata: the music stops on a held chord for 2.5-4 s, then goes on
        k = len(beats) // 2 // bpb * bpb; hold = float(rng.uniform(2.5, 4)); tf = beats[k]
        beats = beats[:k + 1] + [b + hold for b in beats[k + 1:] if b + hold < dur]; free.append([round(tf + 0.05, 3), round(tf + hold + 60 / bpm - 0.05, 3)])
    beats = np.array(beats); nb = len(beats)
    # bars: downbeat indices; odd bars insert a 2-beat bar (or drop to a 3-beat bar) once or twice
    down = []; i = 0; bar_n = []
    odd_at = set()
    if fam == 'oddbar': nbar = nb // 4; odd_at = set(int(x) for x in rng.choice(np.arange(3, max(4, nbar - 2)), size=int(rng.integers(1, 3)), replace=False))
    odd_len = int(rng.choice([2, 2, 3]))
    while i < nb:
        L = odd_len if len(down) in odd_at else bpb; down.append(i); bar_n.append(L); i += L
    cpb = 1 if fam in ('waltz', 'ballad68', 'blues128', 'punk', 'reggae', 'ska', 'oddbar', 'samba') else int(rng.choice([1, 1, 2]))
    beat_bar = np.zeros(nb, int); beat_pos = np.zeros(nb, int)
    for bi, (d0, L) in enumerate(zip(down, bar_n)):
        for j in range(L):
            if d0 + j < nb: beat_bar[d0 + j] = bi; beat_pos[d0 + j] = j
    def chord_at(i):
        bi, pos = beat_bar[i], beat_pos[i]; L = bar_n[bi]; k = bi * cpb + (pos * cpb) // L; return prog[k % len(prog)]
    def chord_t(t):   # free stretches: one chord per ~2 s
        return prog[int(t / 2.2) % len(prog)]
    inv_bars = set(rng.choice(300, 40, replace=False))
    def vo(i, inst, ch=None):
        d, q = ch or chord_at(i); return voicing(rng, (tonic + d) % 12, q, 'gtr' if inst == 'distgtr' else inst, (beat_bar[i] if ch is None else 0) in inv_bars and q not in ('7', 'm7'))
    def broot_dq(d): r = (tonic + d) % 12; m = 28 + ((r - 4) % 12); return m + 12 if m < 33 else m
    def broot(i): return broot_dq(chord_at(i)[0])
    def bfifth(i): d, q = chord_at(i); return broot(i) + (6 if q in ('dim', 'm7b5') else 7)
    with_bass = fam in ('reggae', 'reggae24', 'ska', 'cumbia', 'afrobeat', 'samba', 'disco', 'funk') or rng.random() < 0.5
    with_drums = fam == 'disco' or (fam in ('reggae', 'rock', 'punk', 'metal', 'afrobeat', 'blues128', 'ska', 'oddbar', 'pop') and rng.random() < 0.45) or (fam in ('samba', 'cumbia') and rng.random() < 0.7)
    with_mel = fam in ('pop', 'reggae24', 'cumbia', 'ballad68', 'bossa', 'rubato', 'waltz') and rng.random() < 0.35
    bright = rng.uniform(0.55, 0.85); sd = rng.uniform(0.003, 0.011)
    buf = np.zeros(int((dur + 4) * SR)); dist_buf = np.zeros_like(buf)
    def add(t, y, g, tgt=None):
        b_ = buf if tgt is None else tgt; i0 = int(max(0, t) * SR); n = min(len(y), len(b_) - i0)
        if n > 0: b_[i0:i0 + n] += g * y[:n]
    jit = lambda: rng.normal(0, sd)
    def note(inst, m, t, gate, g):
        if inst == 'distgtr':
            y = S.pluck(m, gate, 0.85, decay=3.0); add(t, y, g, dist_buf); return
        y = {'gtr': lambda: S.gtr(m, gate, bright), 'nylon': lambda: S.nylon(m, gate, bright), 'uke': lambda: S.uke(m, gate, bright), 'piano': lambda: S.piano(m, gate),
             'organ': lambda: S.organ(m, gate), 'epiano': lambda: S.epiano(m, gate), 'pad': lambda: S.pad(m, gate), 'bass': lambda: S.bass(m, gate)}[inst]()
        add(t, y, g)
    def chord(inst, ns, t, gate, g, down=True, spread=None):
        sp = spread if spread is not None else (rng.uniform(0.006, 0.018) if inst in ('gtr', 'nylon', 'uke', 'distgtr') else rng.uniform(0, 0.006))
        if inst == 'distgtr': ns = ns[:3]
        order = ns if down else ns[::-1]
        for k, m in enumerate(order): note(inst, m, t + k * sp, gate, g * (0.9 if k else 1) / np.sqrt(len(ns)))
    def mute(t, g):   # a ghost strum: muted strings, a short noisy click
        add(t, bp(rng.normal(0, 1, int(0.025 * SR)), 300, 3000) * np.exp(-np.arange(int(0.025 * SR)) / SR / 0.006), g * 0.5, dist_buf if harm == 'distgtr' else None)
    P_ = np.median(np.diff(beats)) if nb > 1 else 60 / bpm
    bt = lambda i, f=0.0: beats[i] + f * ((beats[i + 1] if i + 1 < nb else beats[i] + P_) - beats[i])
    H = harm
    # ---- free stretches: rolled chords at irregular times, arpeggio notes in free time
    for (f0, f1) in free:
        t = f0 + 0.2
        while t < f1 - 0.3:
            ch = chord_t(t); v = vo(0, H if H != 'distgtr' else 'gtr', ch)
            chord(H if H != 'distgtr' else 'gtr', v, t, rng.uniform(1.0, 2.5), 0.8, spread=rng.uniform(0.03, 0.09))
            k = 0; tt = t + rng.uniform(0.3, 0.7)
            while tt < min(f1 - 0.2, t + 2.5) and rng.random() < 0.8:
                note(H if H not in ('distgtr', 'pad') else 'piano', v[1 + k % (len(v) - 1)] + 12 * (k // (len(v) - 1) % 2), tt, 0.8, 0.45); k += 1; tt += rng.uniform(0.15, 0.6)
            t += rng.uniform(1.2, 3.0)
    # ---- the steady part
    in_free = lambda t: any(a - 0.02 <= t <= b for a, b in free)
    for i in range(nb - 1):
        if in_free(bt(i)): continue
        pos = beat_pos[i]; P_i = bt(i + 1) - bt(i); acc = 1.0 if pos == 0 else 0.85; L = bar_n[beat_bar[i]]
        if fam in ('rock', 'oddbar') and H == 'distgtr' or fam == 'punk':
            v = vo(i, 'distgtr')[:3]
            for k in range(2): chord('distgtr', v, bt(i, 0.5 * k) + jit() * 0.5, P_i * 0.45, (1.0 if pos == 0 else 0.85) if k == 0 else 0.7, spread=0.004)
            if with_bass: note('bass', broot(i), bt(i) + jit(), P_i * 0.45, 0.9); note('bass', broot(i), bt(i, 0.5) + jit(), P_i * 0.45, 0.7)
        elif fam in ('rock', 'oddbar', 'pop'):
            pat = int(rng.integers(0, 3))
            style = idx % 3
            if style == 0:   # quarter strums
                chord(H, vo(i, H), bt(i) + jit(), P_i * 0.9, acc)
            elif style == 1:   # D - DU - UDU over two beats
                if pos % 2 == 0: chord(H, vo(i, H), bt(i) + jit(), P_i * 0.9, acc)
                else: chord(H, vo(i, H), bt(i) + jit(), P_i * 0.45, 0.8); chord(H, vo(i, H)[-4:], bt(i, 0.5) + jit(), P_i * 0.45, 0.55, down=False)
                if pos % 2 == 0 and rng.random() < 0.6: chord(H, vo(i, H)[-4:], bt(i, 0.5) + jit(), P_i * 0.4, 0.5, down=False)
            else:   # 8ths, accent on the beat
                chord(H, vo(i, H), bt(i) + jit(), P_i * 0.45, acc); chord(H, vo(i, H)[-4:], bt(i, 0.5) + jit(), P_i * 0.45, 0.5, down=False)

            if with_bass: note('bass', broot(i), bt(i) + jit(), P_i * 0.9, 0.8)
        elif fam == 'reggae':   # one drop: skank on every "and", bass never on beat 1
            v = [m + 12 for m in vo(i, 'organ')[1:]][:4]
            chord(H if H != 'piano' else 'piano', v, bt(i, 0.5) + jit(), P_i * 0.22, 1.0, spread=0.0 if H == 'organ' else 0.004)
            if pos != 0: note('bass', broot(i) + (7 if pos == 3 else 0), bt(i) + jit(), P_i * 0.7, 1.1)
            if pos == 2 and rng.random() < 0.5: note('bass', broot(i) + 12, bt(i, 0.75) + jit(), P_i * 0.2, 0.6)
            if with_drums and pos == 2: add(bt(i) + jit(), S.drum('kick'), 0.9); add(bt(i) + jit(), S.drum('rim'), 0.5)
            if with_drums: add(bt(i, 0.5) + jit(), S.drum('hat'), 0.35)
        elif fam == 'reggae24':
            if pos in (1, 3): chord(H, [m + 12 for m in vo(i, H)[2:]], bt(i) + jit(), P_i * 0.25, 1.0, spread=0.004)
            if pos == 2 or (pos == 0 and rng.random() < 0.4): note('bass', broot(i), bt(i) + jit(), P_i * 0.9, 1.1)
            if pos == 2: note('bass', bfifth(i), bt(i, 0.5) + jit(), P_i * 0.4, 0.7)
        elif fam == 'ska':   # upstroke on every "and", walking bass on the beats
            chord(H, [m + 12 for m in vo(i, H)[1:]][:4], bt(i, 0.5) + jit(), P_i * 0.2, 1.0, down=False, spread=0.003)
            d, q = chord_at(i); r = broot(i); note('bass', [r, r + IV[q][1], r + 7, r + 12][pos % 4], bt(i) + jit(), P_i * 0.8, 0.9)
            if with_drums: add(bt(i) + jit(), S.drum('snare' if pos % 2 else 'kick'), 0.6); add(bt(i, 0.5) + jit(), S.drum('hat'), 0.35)
        elif fam == 'cumbia':   # bass 1 and 3 (+ the fifth on the "and" of 2), stabs on every "and", guiro long-short
            if pos % 2 == 0: note('bass', broot(i), bt(i) + jit(), P_i * 0.9, 1.0)
            elif rng.random() < 0.6: note('bass', bfifth(i), bt(i, 0.5) + jit(), P_i * 0.4, 0.7)
            chord(H, vo(i, H)[1:], bt(i, 0.5) + jit(), P_i * 0.3, 0.9, spread=0.003)
            if with_drums: add(bt(i) + jit(), S.drum('guiro'), 0.4); add(bt(i, 0.5) + jit(), S.drum('guiro'), 0.6); (pos % 2 == 1) and add(bt(i) + jit(), S.drum('snare'), 0.3)
        elif fam == 'funk':   # 16ths: ghost scratches everywhere, chord hits on syncopations, the one stays strong
            v = [m + 12 for m in vo(i, 'gtr')[2:]]
            hits = {0: [0] if pos == 0 else [], 1: [], 2: [], 3: []}
            for k in range(4):
                stp = pos * 4 + k
                if (stp in (0, 3, 6, 10, 13) and idx % 2 == 0) or (stp in (0, 2, 7, 9, 14) and idx % 2 == 1): chord(H, v, bt(i, k / 4) + jit() * 0.6, P_i * 0.18, 0.95 * (1 if stp else 1.1), spread=0.003)
                else: mute(bt(i, k / 4) + jit() * 0.5, rng.uniform(0.3, 0.6))
            if with_bass:
                if pos == 0: note('bass', broot(i), bt(i) + jit(), P_i * 0.4, 1.0)
                if pos in (1, 3): note('bass', broot(i) + 12, bt(i, 0.75) + jit(), P_i * 0.2, 0.8)
                if pos == 2: note('bass', bfifth(i), bt(i, 0.5) + jit(), P_i * 0.3, 0.8)

        elif fam == 'afrobeat':   # interlocking: muted single notes on the 16th offbeats, chord stabs on the "and"s of 2 and 4
            v = vo(i, 'gtr'); hi = v[-1] + 12
            for k in (1, 3): note(H if H != 'organ' else 'gtr', hi if k == 1 else v[-2] + 12, bt(i, k / 4) + jit() * 0.5, P_i * 0.12, 0.5)
            if pos in (1, 3): chord(H, v[2:], bt(i, 0.5) + jit(), P_i * 0.2, 0.9, spread=0.003)
            if pos == 0: note('bass', broot(i), bt(i) + jit(), P_i * 0.4, 1.0)
            if pos in (0, 2): note('bass', broot(i) + (12 if pos == 2 else 7), bt(i, 0.75) + jit(), P_i * 0.25, 0.8)
            if pos == 3: note('bass', bfifth(i), bt(i, 0.5) + jit(), P_i * 0.25, 0.8)
            for k in range(4): add(bt(i, k / 4) + jit() * 0.5, S.drum('shaker'), 0.25 if k else 0.35)
            if with_drums: (pos == 0) and add(bt(i), S.drum('kick'), 0.8); add(bt(i, 0.5) + jit(), S.drum('open'), 0.3)
        elif fam == 'bossa':
            if pos % 2 == 0: note('bass', broot(i), bt(i) + jit(), P_i * 1.4, 0.9)
            else: note('bass', bfifth(i), bt(i, 0.5) + jit(), P_i * 0.45, 0.6)
            for f, on in [(0, pos in (0, 3)), (0.5, pos in (1, 2)), (0.75, pos == 3)]:
                if on: chord(H, vo(i, H)[1:], bt(i, f) + jit(), P_i * 0.4, 0.6, spread=0.004)
        elif fam == 'samba':   # surdo strong on 2 and 4, cavaco 16ths with syncopated accents, tamborim
            add(bt(i) + jit(), S.drum('surdo'), 0.9 if pos % 2 else 0.35)
            if pos % 2: note('bass', broot(i), bt(i) + jit(), P_i * 0.8, 0.9)
            v = vo(i, H)[-4:]
            for k in range(4):
                stp = (pos % 2) * 4 + k; accd = stp in (0, 3, 6) if idx % 2 == 0 else stp in (2, 5, 7)
                chord(H, v, bt(i, k / 4) + jit() * 0.5, P_i * 0.15, 0.9 if accd else 0.3, down=k % 2 == 0, spread=0.002)
            if with_drums: [add(bt(i, k / 4) + jit() * 0.5, S.drum('tamb'), 0.3) for k in (0, 2, 3) if (pos + k) % 2 == 0]
        elif fam == 'blues128':   # shuffle: each beat in three; bass boogie long-short, comping on the beat + the 3rd triplet
            v = vo(i, H); r = broot(i)
            note('bass', [r, r + 4, r + 7, r + 9][pos % 4], bt(i) + jit(), P_i * 0.6, 0.9); note('bass', [r, r + 4, r + 7, r + 9][pos % 4], bt(i, 2 / 3) + jit(), P_i * 0.3, 0.55)
            chord(H, v[1:], bt(i) + jit(), P_i * 0.55, 0.75 * acc); chord(H, v[-3:], bt(i, 2 / 3) + jit(), P_i * 0.3, 0.5, down=False)
            if with_drums: add(bt(i) + jit(), S.drum('kick' if pos % 2 == 0 else 'snare'), 0.7); [add(bt(i, k / 3) + jit() * 0.5, S.drum('hat'), 0.3) for k in (0, 2)]
        elif fam == 'ballad68':   # 2 dotted-quarter beats a bar, arpeggio eighths, bass on 1 (sometimes 4)
            vv = vo(i, H)
            if pos == 0 or rng.random() < 0.5: note('bass' if with_bass else (H if H != 'pad' else 'piano'), broot(i) + (0 if with_bass else 12), bt(i) + jit(), P_i * 1.8, 0.95 if pos == 0 else 0.7)
            if H == 'pad': chord('pad', vv[1:], bt(i) + jit(), P_i * 0.95, 0.5) if pos == 0 else None; [note('piano', vv[1 + (k + pos * 3) % (len(vv) - 1)] + 12, bt(i, k / 3) + jit(), P_i * 0.45, 0.35) for k in range(3)]
            else: [note(H, vv[1 + (k + pos * 3) % (len(vv) - 1)], bt(i, k / 3) + jit(), P_i * 0.5, 0.6 if k == 0 else 0.42) for k in range(3)]
        elif fam == 'waltz':
            if idx % 3 == 2:   # arpeggio
                vv = vo(i, H)
                if pos == 0: note(H, vv[0], bt(i) + jit(), P_i * 2.8, 1.0)
                for k in range(2):
                    if not (pos == 0 and k == 0): note(H, vv[1 + (pos * 2 + k) % (len(vv) - 1)], bt(i, k * 0.5) + jit(), P_i * 1.2, 0.6)
            elif pos == 0: note('bass' if with_bass else H, broot(i) + (0 if with_bass else 12), bt(i) + jit(), P_i * 0.9, 1.0); chord(H, vo(i, H)[1:], bt(i) + jit(), P_i * 0.8, 0.6)
            else: chord(H, vo(i, H)[1:], bt(i) + jit(), P_i * 0.5, 0.55 if pos == 1 else 0.5)
        elif fam == 'disco':   # four on the floor, open hat on the "and", octave bass 8ths, stabs (strings or piano)
            add(bt(i) + jit() * 0.3, S.drum('kick'), 0.9); add(bt(i, 0.5) + jit() * 0.3, S.drum('open'), 0.4)
            if pos % 2: add(bt(i) + jit() * 0.3, S.drum('snare'), 0.6)
            note('bass', broot(i), bt(i) + jit(), P_i * 0.4, 0.9); note('bass', broot(i) + 12, bt(i, 0.5) + jit(), P_i * 0.4, 0.75)
            if H == 'pad': chord('pad', vo(i, 'pad')[1:], bt(i, 0.5 if idx % 2 else 0) + jit(), P_i * 0.4, 0.8)
            else: chord(H, vo(i, H)[1:], bt(i, 0.5 if idx % 2 else 0) + jit(), P_i * 0.35, 0.8, spread=0.003)
        elif fam == 'metal':   # palm-muted 16th chugs (or gallops) on the low root, power-chord accents
            r = broot(i) + 12; gal = idx % 2 == 1
            for k, f in enumerate([0, 0.5, 0.75] if gal else [0, 0.25, 0.5, 0.75]):
                if k == 0 and (pos == 0 or rng.random() < 0.3): chord('distgtr', [r, r + 7, r + 12], bt(i, f) + jit() * 0.4, P_i * 0.45, 1.0, spread=0.003)
                else: add(bt(i, f) + jit() * 0.4, lp(S.pluck(r, 0.07, 0.6, decay=0.3), 1800), 0.9, dist_buf)
            if with_bass: note('bass', broot(i), bt(i) + jit(), P_i * 0.45, 0.9); note('bass', broot(i), bt(i, 0.5) + jit(), P_i * 0.45, 0.8)
        elif fam == 'rubato':   # after the free intro: a steady pop / ballad feel
            if idx % 2 == 0: chord(H if H != 'distgtr' else 'gtr', vo(i, H), bt(i) + jit(), P_i * 0.9, acc)
            else:
                vv = vo(i, H); note(H if H != 'pad' else 'piano', vv[0] + (12 if pos else 0), bt(i) + jit(), P_i * 0.9, 0.8); note(H if H != 'pad' else 'piano', vv[-1 - pos % 2], bt(i, 0.5) + jit(), P_i * 0.5, 0.45)
            if with_bass and pos % 2 == 0: note('bass', broot(i), bt(i) + jit(), P_i * 1.8, 0.8)
        if with_drums and fam in ('rock', 'pop', 'punk', 'metal', 'oddbar', 'rubato'):
            if fam == 'metal' and idx % 2 == 0: [add(bt(i, k / 4) + jit() * 0.3, S.drum('kick'), 0.6) for k in range(4)]
            else: add(bt(i) + jit(), S.drum('kick' if pos % 2 == 0 else 'snare'), 0.8)
            if fam == 'metal': (pos % 2) and add(bt(i) + jit(), S.drum('snare'), 0.8)
            add(bt(i, 0.5) + jit(), S.drum('hat'), 0.4); add(bt(i) + jit(), S.drum('hat'), 0.3)
        if with_drums and fam == 'waltz': add(bt(i) + jit(), S.drum('kick' if pos == 0 else 'hat'), 0.8 if pos == 0 else 0.5)
        if with_drums and fam == 'ballad68': add(bt(i) + jit(), S.drum('kick' if pos == 0 else 'snare'), 0.6)
    # the vocal-like lead: chord tones, quarter / eighth rhythm with syncopation, 30-90 ms swell
    if with_mel:
        vatk = float(rng.uniform(0.03, 0.09)); i = 0; prevm = 67
        while i < nb - 1:
            if in_free(bt(i)): i += 1; continue
            d, q = chord_at(i); pcs = [(tonic + d + x) % 12 for x in IV[q]]
            cands = [m for m in range(60, 79) if m % 12 in pcs]; m = min(cands, key=lambda x: abs(x - prevm) + rng.uniform(0, 4)); prevm = m
            f = 0.5 if rng.random() < 0.25 else 0.0; L = int(rng.choice([1, 1, 2]))
            gate = (bt(min(nb - 1, i + L)) - bt(i, f)) * 0.95
            if gate > 0.1: add(bt(i, f) + jit(), S.voice(m, gate, vatk), 0.55)
            i += L
    y = buf[:int(dur * SR)]
    if np.abs(dist_buf).max() > 0:   # drive + cab on the distorted guitar bus
        dg = dist_buf[:int(dur * SR)]; dg = hp(dg, 90); k = rng.uniform(6, 18); dg = np.tanh(k * dg / (np.abs(dg).max() + 1e-9)) ; dg = lp(lp(dg, rng.uniform(3200, 5000)), 6000) * 0.6
        y = y / (np.abs(y).max() + 1e-9) * 0.5 + dg if np.abs(y).max() > 0 else dg
    y = hp(y, rng.uniform(70, 180)); y = lp(y, rng.uniform(6000, 12000))
    irn = int(rng.uniform(0.25, 0.9) * SR); ir = rng.normal(0, 1, irn) * np.exp(-np.arange(irn) / SR / rng.uniform(0.08, 0.3)); ir[0] = 0
    wet = rng.uniform(0.04, 0.25); y = y + wet * fftconvolve(y, ir)[:len(y)] / (np.sqrt((ir ** 2).sum()) * 3)
    y = y / (np.abs(y).max() + 1e-9) * rng.uniform(0.5, 0.95)
    dr = rng.uniform(1.0, 1.6); y = np.tanh(y * dr) / np.tanh(dr)
    y += rng.normal(0, 10 ** (rng.uniform(-58, -40) / 20), len(y))
    name = f"{SPLIT}_{fam}_{idx:02d}"
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32000).astype(np.int16).tobytes())
    ch = [[(tonic + chord_at(i)[0]) % 12, sorted((tonic + chord_at(i)[0] + x) % 12 for x in IV[chord_at(i)[1]])] for i in range(nb)]
    fch = []
    for f0, f1 in free:
        t = f0
        while t < f1: d, q = chord_t(t + 0.25); fch.append([round(t, 3), round(min(f1, (int(t / 2.2) + 1) * 2.2), 3), (tonic + d) % 12, sorted((tonic + d + x) % 12 for x in IV[q])]); t = (int(t / 2.2) + 1) * 2.2
    key = NOTE[tonic] + ('m' if minor else '')
    keep = beats < dur
    return dict(name=name, fam=fam, split=SPLIT, dur=round(dur, 3), key=key, beats=[round(float(b), 4) for b in beats[keep]], down=[d for d in down if d < keep.sum()],
                meter='6/8' if fam == 'ballad68' else '12/8' if fam == 'blues128' else str(meter), compound=compound, bpm0=round(bpm, 2), bpm1=round(bpm, 2), kind='steady',
                change=None, swing=fam == 'blues128', harm=harm, atk_ms=round(atk * 1000, 1), mel=bool(with_mel), bass=bool(with_bass), drums=bool(with_drums), clear=fam in CLEAR,
                free=free, odd=[int(down[b]) for b in sorted(odd_at) if b < len(down)], chords=[c for c, k in zip(ch, keep) if k], fchords=fch, gaps=[], played_from=round(t_start, 3) if not free else 0.0)
truth = []
for fam in FAMS:
    if ONLY and fam not in ONLY: continue
    for i in range(NPF):
        truth.append(make(fam, i)); T = truth[-1]; print(T['name'], T['key'], T['bpm0'], T['meter'], T['harm'], T['atk_ms'], flush=True)
json.dump(truth, open(os.path.join(OUT, 'truth.json' if not ONLY else 'truth_part.json'), 'w'))
