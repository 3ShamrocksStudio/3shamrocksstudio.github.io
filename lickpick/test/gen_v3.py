# LickPick round-3 test takes: an independent generator (NOT the QA Karplus-Strong guitar). Modal-synthesis guitar, additive
# piano, drawbar organ, FM e-piano, plucked bass and a synthesised kit; random voicings (inversions, 7ths, spreads), human
# timing (per-note jitter + slow wander), a phone-ish mic chain (EQ, room, noise, soft clip), then Opus in WebM.
# Families: straight 8ths, swung 8ths, reggae one-drop (skank on the "and"s, empty downbeat), reggae 2&4, waltz 3/4
# (oom-pah-pah and arpeggio), 6/8 compound, tempo changes (step and ramp), jazz ii-V-I comping with walking bass,
# pop with secondary dominants, 16th funk, piano ballad, bossa, punk.
# usage: python3 gen_v3.py OUTDIR SPLIT N_PER_FAMILY   (SPLIT tune|dev|test|final: disjoint seeds; tune/dev for development, test/final only for reporting)
import sys, os, json, numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
OUT, SPLIT, NPF = sys.argv[1], sys.argv[2], int(sys.argv[3]); os.makedirs(OUT, exist_ok=True)
SR = 32000
NOTE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
IV = {'maj': [0, 4, 7], 'min': [0, 3, 7], '7': [0, 4, 7, 10], 'maj7': [0, 4, 7, 11], 'm7': [0, 3, 7, 10], 'dim': [0, 3, 6], 'm7b5': [0, 3, 6, 10], '5': [0, 7]}
P_MAJ = [[(0, 'maj'), (7, 'maj'), (9, 'min'), (5, 'maj')], [(0, 'maj'), (5, 'maj'), (7, 'maj'), (5, 'maj')], [(2, 'min'), (7, 'maj'), (0, 'maj'), (9, 'maj')],
         [(2, 'm7'), (7, '7'), (0, 'maj7'), (9, '7')], [(0, 'maj'), (9, '7'), (2, 'min'), (7, '7')], [(0, 'maj'), (4, '7'), (9, 'min'), (5, 'maj')],
         [(0, 'maj7'), (9, 'm7'), (2, 'm7'), (7, '7')], [(0, 'maj'), (2, '7'), (5, 'maj'), (0, 'maj')], [(5, 'maj'), (7, 'maj'), (4, 'min'), (9, 'min')],
         [(9, 'min'), (5, 'maj'), (0, 'maj'), (7, 'maj')], [(0, 'maj'), (10, 'maj'), (5, 'maj'), (0, 'maj')], [(2, 'm7'), (7, '7'), (0, 'maj7'), (0, 'maj7')],
         [(0, 'maj'), (0, '7'), (5, 'maj'), (5, 'min')], [(4, 'm7'), (9, '7'), (2, 'm7'), (7, '7')], [(0, 'maj'), (5, 'maj'), (0, 'maj'), (7, 'maj')],
         [(0, 'maj'), (4, 'min'), (5, 'maj'), (7, '7')], [(0, 'maj'), (2, 'min'), (4, 'min'), (5, 'maj')]]
P_MIN = [[(0, 'min'), (5, 'min'), (7, 'min'), (0, 'min')], [(0, 'min'), (8, 'maj'), (3, 'maj'), (10, 'maj')], [(0, 'min'), (5, 'min'), (7, '7'), (0, 'min')],
         [(2, 'm7b5'), (7, '7'), (0, 'm7'), (0, 'm7')], [(0, 'min'), (10, 'maj'), (8, 'maj'), (7, '7')], [(0, 'min'), (7, 'min'), (8, 'maj'), (5, 'min')],
         [(0, 'm7'), (5, 'm7'), (10, '7'), (3, 'maj7')], [(0, 'min'), (3, 'maj'), (10, 'maj'), (5, 'min')]]
SEED0 = {'tune': 7100, 'test': 93500, 'dev': 51200, 'final': 260700}[SPLIT]

def lp(x, f, o=2): return sosfilt(butter(o, min(f, SR * 0.45), 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, min(b, SR * 0.45)], 'band', fs=SR, output='sos'), x)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

class Synth:
    def __init__(s, rng): s.rng = rng; s.cache = {}
    def env(s, n, atk, rel_at, rel):
        e = np.ones(n); a = max(1, int(atk * SR)); e[:a] = np.linspace(0, 1, a)
        r0 = int(rel_at * SR)
        if r0 < n: rl = max(1, int(rel * SR)); m = min(n - r0, rl); e[r0:r0 + m] *= np.linspace(1, 0, m); e[r0 + m:] = 0
        return e
    def gtr(s, m, gate, bright):
        key = ('g', m, round(gate, 2), round(bright, 1))
        if key in s.cache: return s.cache[key]
        n = int((gate + 0.08) * SR); t = np.arange(n) / SR; f0 = hz(m); y = np.zeros(n); B = 6e-5; r = np.random.default_rng(m * 7 + 3)
        for k in range(1, 16):
            fk = k * f0 * np.sqrt(1 + B * k * k)
            if fk > SR * 0.42: break
            a = (bright ** (k - 1)) / k ** 0.8 * r.uniform(0.5, 1.2) * abs(np.sin(np.pi * k * 0.23)) ** 0.7
            y += a * np.exp(-t / (1.6 / (1 + 0.45 * k))) * np.sin(2 * np.pi * fk * t + r.uniform(0, 6.28))
        y *= s.env(n, 0.0015, gate, 0.06)
        pick = bp(r.normal(0, 1, min(n, int(0.006 * SR))), 1500, 6000) * 0.15; y[:len(pick)] += pick
        s.cache[key] = y; return y
    def piano(s, m, gate):
        key = ('p', m, round(gate, 2))
        if key in s.cache: return s.cache[key]
        n = int((gate + 0.25) * SR); t = np.arange(n) / SR; f0 = hz(m); y = np.zeros(n); B = 2e-4 * (1 + (m - 40) / 40); r = np.random.default_rng(m * 13 + 1)
        for k in range(1, 12):
            fk = k * f0 * np.sqrt(1 + B * k * k)
            if fk > SR * 0.42: break
            a = 1 / k ** 1.1 * r.uniform(0.6, 1.1)
            y += a * (0.7 * np.exp(-t / (0.35 / (1 + 0.2 * k))) + 0.3 * np.exp(-t / (3.0 / (1 + 0.3 * k)))) * np.sin(2 * np.pi * fk * t)
        y *= s.env(n, 0.002, gate, 0.2)
        ham = lp(r.normal(0, 1, int(0.004 * SR)), 3000) * 0.2; y[:len(ham)] += ham
        s.cache[key] = y; return y
    def organ(s, m, gate, bars=(1, .8, .5, .35, .2, .15)):
        key = ('o', m, round(gate, 3))
        if key in s.cache: return s.cache[key]
        n = int((gate + 0.03) * SR); t = np.arange(n) / SR; f0 = hz(m); y = np.zeros(n)
        for h, a in zip([1, 2, 3, 4, 6, 8], bars):
            if h * f0 < SR * 0.42: y += a * np.sin(2 * np.pi * h * f0 * t)
        y *= s.env(n, 0.004, gate, 0.02); y[:int(0.002 * SR)] += np.random.default_rng(m).normal(0, 0.3, int(0.002 * SR))
        s.cache[key] = y; return y
    def epiano(s, m, gate):
        key = ('e', m, round(gate, 2))
        if key in s.cache: return s.cache[key]
        n = int((gate + 0.15) * SR); t = np.arange(n) / SR; f0 = hz(m)
        I = 2.2 * np.exp(-t / 0.25); y = np.sin(2 * np.pi * f0 * t + I * np.sin(2 * np.pi * f0 * t)) * np.exp(-t / 1.4)
        y += 0.15 * np.sin(2 * np.pi * 14 * f0 * t) * np.exp(-t / 0.03)
        y *= s.env(n, 0.002, gate, 0.12); s.cache[key] = y; return y
    def bass(s, m, gate):
        key = ('b', m, round(gate, 2))
        if key in s.cache: return s.cache[key]
        n = int((gate + 0.05) * SR); t = np.arange(n) / SR; f0 = hz(m); y = np.zeros(n)
        for k in range(1, 8): y += (1 / k ** 1.6) * np.exp(-t / (0.9 / (1 + 0.5 * k))) * np.sin(2 * np.pi * k * f0 * t)
        y *= s.env(n, 0.003, gate, 0.04); s.cache[key] = y; return y
    def drum(s, kind):
        if kind in s.cache: return s.cache[kind]
        r = np.random.default_rng(len(kind) * 17)
        if kind == 'kick': n = int(0.35 * SR); t = np.arange(n) / SR; f = 45 + 80 * np.exp(-t / 0.03); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
        elif kind == 'snare': n = int(0.25 * SR); t = np.arange(n) / SR; y = 0.6 * bp(r.normal(0, 1, n), 1200, 8000) * np.exp(-t / 0.07) + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
        elif kind == 'hat': n = int(0.06 * SR); t = np.arange(n) / SR; y = 0.35 * hp(r.normal(0, 1, n), 7000, 4) * np.exp(-t / 0.015)
        elif kind == 'rim': n = int(0.06 * SR); t = np.arange(n) / SR; y = 0.6 * (np.sin(2 * np.pi * 1700 * t) + 0.5 * bp(r.normal(0, 1, n), 2000, 5000)) * np.exp(-t / 0.012)
        s.cache[kind] = y; return y

def voicing(rng, root, q, inst, inv=False):
    iv = IV[q]; pcs = [(root + i) % 12 for i in iv]
    bass_pc = pcs[1] if inv and len(pcs) > 2 else pcs[0]
    if inst == 'gtr':
        b = 40 + ((bass_pc - 4) % 12)
        if b > 49: b -= 12
        out = [b]; cur = b
        while len(out) < rng.integers(4, 7):
            cand = [cur + d for d in range(3, 9) if (cur + d) % 12 in pcs]; cur = cand[0] if cand else cur + 5; out.append(cur)
        return out
    lo = 36 + ((bass_pc - 0) % 12)
    if lo > 45: lo -= 12
    top0 = 60 + rng.integers(0, 7); rh = []
    for p in pcs:
        m = top0 + ((p - top0) % 12); rh.append(m)
    rh = sorted(rh)
    if rng.random() < 0.4 and len(rh) >= 3: rh = rh[1:] + [rh[0] + 12]
    return [lo] + ([lo + 7] if rng.random() < 0.5 and q not in ('dim', 'm7b5') else []) + rh

def tempo_beats(rng, dur, kind, bpm, bpm2=None, change_at=None, wander=True):
    """beat times: steady, a step change at a bar line, or a ramp. Slow human wander (±8 ms) on top."""
    B = []; t = rng.uniform(0.25, 1.2); i = 0
    while t < dur:
        if kind == 'step' and t >= change_at: p = 60 / bpm2
        elif kind == 'ramp': f = min(1, max(0, (t - change_at[0]) / (change_at[1] - change_at[0]))); p = 60 / (bpm + (bpm2 - bpm) * f)
        else: p = 60 / bpm
        B.append(t); t += p; i += 1
    B = np.array(B)
    if wander:
        w = np.convolve(rng.normal(0, 1, len(B) + 20), np.ones(10) / 10, 'same')[10:10 + len(B)]; w = w / (np.abs(w).max() + 1e-9) * rng.uniform(0.002, 0.009); B = B + w
    return B

def make(fam, idx):
    rng = np.random.default_rng(SEED0 + idx * 101 + sum(map(ord, fam)) * 7)
    S = Synth(rng); minor = rng.random() < 0.3 and fam not in ('reggae8', 'reggae24')
    tonic = int(rng.integers(0, 12)); prog = (P_MIN if minor else P_MAJ)[rng.integers(0, len(P_MIN if minor else P_MAJ))]
    if fam == 'jazz': prog = [[(2, 'm7'), (7, '7'), (0, 'maj7'), (9, '7')], [(2, 'm7'), (7, '7'), (0, 'maj7'), (0, 'maj7')], [(4, 'm7'), (9, '7'), (2, 'm7'), (7, '7')], [(0, 'maj7'), (9, '7'), (2, 'm7'), (7, '7')], [(2, 'm7b5'), (7, '7'), (0, 'm7'), (0, 'm7')]][rng.integers(0, 5)]; minor = prog[0][1] == 'm7b5'
    if fam == 'secdom': prog = [[(2, 'min'), (7, 'maj'), (0, 'maj'), (9, 'maj')], [(0, 'maj'), (9, '7'), (2, 'min'), (7, '7')], [(0, 'maj'), (4, '7'), (9, 'min'), (5, 'maj')], [(0, 'maj'), (2, '7'), (5, 'maj'), (0, 'maj')], [(0, 'maj'), (2, '7'), (7, '7'), (0, 'maj')], [(9, 'min'), (2, '7'), (7, 'maj'), (0, 'maj')]][rng.integers(0, 6)]; minor = False
    meter, swing, compound = 4, False, False
    dur = float(rng.uniform(32, 48)); kind = 'steady'; bpm2 = None; ch_at = None
    if fam == 'straight': bpm = rng.uniform(80, 170)
    elif fam == 'swing': bpm = rng.uniform(88, 160); swing = True
    elif fam == 'reggae8': bpm = rng.uniform(120, 165)
    elif fam == 'reggae24': bpm = rng.uniform(66, 86)
    elif fam == 'waltz': bpm = rng.uniform(95, 195); meter = 3
    elif fam == 'waltzarp': bpm = rng.uniform(80, 150); meter = 3
    elif fam == 'six8': bpm = rng.uniform(46, 76); meter = 2; compound = True
    elif fam == 'step':
        a, b = [(90, 120), (120, 90), (100, 136), (138, 104), (80, 104), (112, 84), (96, 128)][rng.integers(0, 7)]; j = rng.uniform(0.97, 1.03); bpm, bpm2 = a * j, b * j; kind = 'step'; dur = float(rng.uniform(46, 60))
    elif fam == 'ramp': bpm = rng.uniform(85, 120); bpm2 = bpm * rng.choice([0.85, 1.15, 1.2]); kind = 'ramp'; dur = float(rng.uniform(44, 56))
    elif fam == 'jazz': bpm = rng.uniform(110, 200); swing = True
    elif fam == 'secdom': bpm = rng.uniform(75, 150)
    elif fam == 'funk': bpm = rng.uniform(86, 116)
    elif fam == 'ballad': bpm = rng.uniform(58, 82)
    elif fam == 'bossa': bpm = rng.uniform(118, 150)
    elif fam == 'punk': bpm = rng.uniform(168, 200)
    if kind == 'step':
        bar = meter * 60 / bpm; ch_at = (int(dur * rng.uniform(0.4, 0.55) / bar)) * bar + 0.6
    if kind == 'ramp': ch_at = (dur * 0.3, dur * 0.7)
    beats = tempo_beats(rng, dur, kind, bpm, bpm2, ch_at)
    # instruments
    harm = {'reggae8': 'organ', 'reggae24': 'gtr', 'jazz': rng.choice(['piano', 'epiano', 'gtr']), 'ballad': rng.choice(['piano', 'epiano']), 'funk': 'gtr', 'punk': 'gtr', 'waltzarp': rng.choice(['piano', 'gtr'])}.get(fam, rng.choice(['gtr', 'gtr', 'piano', 'epiano', 'organ']))
    with_bass = fam in ('reggae8', 'reggae24', 'jazz') or rng.random() < 0.45
    with_drums = fam in ('reggae8',) and rng.random() < 0.6 or (fam not in ('ballad', 'waltzarp', 'reggae24', 'jazz') and rng.random() < 0.3)
    bright = rng.uniform(0.55, 0.85); sd = rng.uniform(0.003, 0.011)
    buf = np.zeros(int((dur + 3) * SR))
    def add(t, y, g):
        i = int(max(0, t) * SR); n = min(len(y), len(buf) - i)
        if n > 0: buf[i:i + n] += g * y[:n]
    jit = lambda: rng.normal(0, sd)
    def note(inst, m, t, gate, g):
        y = {'gtr': lambda: S.gtr(m, gate, bright), 'piano': lambda: S.piano(m, gate), 'organ': lambda: S.organ(m, gate), 'epiano': lambda: S.epiano(m, gate), 'bass': lambda: S.bass(m, gate)}[inst]()
        add(t, y, g)
    def chord(inst, ns, t, gate, g, down=True, spread=None):
        sp = spread if spread is not None else (rng.uniform(0.006, 0.018) if inst == 'gtr' else rng.uniform(0, 0.006))
        order = ns if down else ns[::-1]
        for k, m in enumerate(order): note(inst, m, t + k * sp, gate, g * (0.9 if k else 1) / np.sqrt(len(ns)))
    nb = len(beats); P = np.median(np.diff(beats))
    bt = lambda i, f=0.0: beats[i] + f * ((beats[i + 1] if i + 1 < nb else beats[i] + P) - beats[i])
    bpb = meter                      # beats per bar (6/8: 2 dotted-quarter beats)
    cpb = 1 if fam in ('waltz', 'waltzarp', 'six8', 'ballad') else rng.choice([1, 1, 2]) if fam not in ('jazz',) else rng.choice([1, 2])
    if fam == 'punk' or fam == 'reggae8': cpb = 1
    def chord_at(i):
        bar, pos = divmod(i, bpb); k = bar * cpb + (pos * cpb) // bpb; return prog[k % len(prog)]
    inv_bars = set(rng.choice(200, 30, replace=False))
    def vo(i, inst):
        d, q = chord_at(i); return voicing(rng, (tonic + d) % 12, q, inst, (i // bpb) in inv_bars and fam not in ('jazz',))
    def broot(i): d, q = chord_at(i); r = (tonic + d) % 12; m = 28 + ((r - 4) % 12); return m + 12 if m < 33 else m
    def bfifth(i): d, q = chord_at(i); return broot(i) + (6 if q in ('dim', 'm7b5') else 7)
    for i in range(nb - 1):
        pos = i % bpb; P_i = bt(i + 1) - bt(i); acc = 1.0 if pos == 0 else 0.85
        if fam in ('straight', 'secdom', 'step', 'ramp'):
            pat = rng.choice(4) if rng.random() < 0.1 else [0, 1, 2, 1][pos % 4]
            if pat != 2: chord(harm, vo(i, harm), bt(i) + jit(), P_i * (0.45 if pat == 1 else 0.9), acc)
            if pat >= 1: chord(harm, vo(i, harm)[-4:], bt(i, 0.5) + jit(), P_i * 0.45, 0.55, down=False)
            if with_bass: note('bass', broot(i), bt(i) + jit(), P_i * 0.9, 0.8)
        elif fam == 'swing':
            chord(harm, vo(i, harm), bt(i) + jit(), P_i * 0.6, acc)
            if pos % 2 == 1 or rng.random() < 0.6: chord(harm, vo(i, harm)[-3:], bt(i, 2 / 3) + jit(), P_i * 0.3, 0.6, down=False)
            if with_bass: note('bass', broot(i) if pos % 2 == 0 else bfifth(i), bt(i) + jit(), P_i * 0.6, 0.8); note('bass', broot(i), bt(i, 2 / 3) + jit(), P_i * 0.3, 0.45)
        elif fam == 'reggae8':   # skank on every "and" (high, short, loud); bass on the beats but never on beat 1 (one drop)
            v = [m + 12 for m in vo(i, 'organ')[1:]][:4]
            chord('organ', v, bt(i, 0.5) + jit(), P_i * 0.22, 1.0, spread=0.0)
            if pos != 0: note('bass', broot(i) + (7 if pos == 3 else 0), bt(i) + jit(), P_i * 0.7, 1.1)
            if pos == 2 and rng.random() < 0.5: note('bass', broot(i) + 12, bt(i, 0.75) + jit(), P_i * 0.2, 0.6)
            if with_drums and pos == 2: add(bt(i) + jit(), S.drum('kick'), 0.9); add(bt(i) + jit(), S.drum('rim'), 0.5)
            if with_drums: add(bt(i, 0.5) + jit(), S.drum('hat'), 0.35)
        elif fam == 'reggae24':  # half-time counting: skank on 2 and 4 (beats), bass on 1 (sometimes dropped) and 3
            if pos in (1, 3): chord('gtr', [m + 12 for m in vo(i, 'gtr')[2:]], bt(i) + jit(), P_i * 0.25, 1.0, spread=0.004)
            if pos == 2 or (pos == 0 and rng.random() < 0.4): note('bass', broot(i), bt(i) + jit(), P_i * 0.9, 1.1)
            if pos == 2: note('bass', bfifth(i), bt(i, 0.5) + jit(), P_i * 0.4, 0.7)
        elif fam == 'waltz':     # oom-pah-pah
            if pos == 0: note('bass' if with_bass else harm, broot(i) + (0 if with_bass else 12), bt(i) + jit(), P_i * 0.9, 1.0); chord(harm, vo(i, harm)[1:], bt(i) + jit(), P_i * 0.8, 0.6)
            else: chord(harm, vo(i, harm)[1:], bt(i) + jit(), P_i * 0.5, 0.55 if pos == 1 else 0.5)
        elif fam == 'waltzarp':  # bass note on 1, broken chord in 8ths
            vv = vo(i, harm)
            if pos == 0: note(harm, vv[0], bt(i) + jit(), P_i * 2.8, 1.0)
            for k in range(2):
                if pos == 0 and k == 0: continue
                note(harm, vv[1 + (pos * 2 + k) % (len(vv) - 1)], bt(i, k * 0.5) + jit(), P_i * 1.2, 0.6)
        elif fam == 'six8':      # 2 dotted-quarter beats, 3 eighths each: bass on 1 (and 4), chord eighths
            vv = vo(i, harm)
            note('bass' if with_bass else harm, broot(i) + (0 if with_bass else 12), bt(i) + jit(), P_i * 0.95, 1.0 if pos == 0 else 0.8)
            for k in range(3):
                note(harm, vv[1 + (k + pos * 3) % (len(vv) - 1)], bt(i, k / 3) + jit(), P_i * 0.45, 0.6 if k == 0 else 0.42)
        elif fam == 'jazz':      # swing comping (Charleston: 1 and the "and" of 2) + walking bass on every beat
            v = vo(i, harm)[1:]
            if pos == 0: chord(harm, v, bt(i) + jit(), P_i * 1.0, 0.8, spread=0.003)
            if pos == 1: chord(harm, v, bt(i, 2 / 3) + jit(), P_i * 0.5, 0.7, spread=0.003)
            if pos == 3 and rng.random() < 0.4: chord(harm, v, bt(i, 2 / 3) + jit(), P_i * 0.4, 0.5, spread=0.003)
            d, q = chord_at(i); r = broot(i); walk = [r, r + IV[q][1], r + 7, (broot(i + 1) if i + 1 < nb else r) + rng.choice([-1, 1])][pos]
            note('bass', walk, bt(i) + jit(), P_i * 0.85, 0.95)
            if with_drums or True: add(bt(i) + jit(), S.drum('hat') * 0.6, 0.3 if pos % 2 else 0.2)
        elif fam == 'funk':      # 16ths, accents on the beat, muted scratches between
            v = vo(i, 'gtr')[2:]
            for k in range(4):
                g = [1.0, 0.25, 0.55, 0.3][k] * (1 if rng.random() < 0.85 else 0.2)
                chord('gtr', [m + 12 for m in v], bt(i, k / 4) + jit() * 0.6, P_i * 0.12, g * acc, down=k % 2 == 0, spread=0.003)
            if with_bass: note('bass', broot(i), bt(i) + jit(), P_i * 0.4, 0.9); (pos % 2 == 1) and note('bass', broot(i) + 12, bt(i, 0.75) + jit(), P_i * 0.2, 0.6)
        elif fam == 'ballad':    # piano: low root on 1, block chord, broken chord in 8ths
            vv = vo(i, harm)
            if pos == 0: note(harm, vv[0], bt(i) + jit(), P_i * 3.6, 0.9); chord(harm, vv[1:], bt(i) + jit(), P_i * 1.8, 0.55)
            else: note(harm, vv[1 + (pos + 1) % (len(vv) - 1)], bt(i) + jit(), P_i * 1.0, 0.45)
            note(harm, vv[-1 - pos % 2], bt(i, 0.5) + jit(), P_i * 0.5, 0.3)
        elif fam == 'bossa':     # bass on 1 and 3 (+ the dotted pickup), partido-alto chord stabs
            if pos % 2 == 0: note('bass', broot(i), bt(i) + jit(), P_i * 1.4, 0.9)
            else: note('bass', bfifth(i), bt(i, 0.5) + jit(), P_i * 0.45, 0.6)
            for f, on in [(0, pos in (0, 3)), (0.5, pos in (1, 2)), (0.75, pos == 3)]:
                if on: chord(harm, vo(i, harm)[1:], bt(i, f) + jit(), P_i * 0.4, 0.6, spread=0.004)
        elif fam == 'punk':
            v = vo(i, 'gtr')[:3]
            for k in range(2): chord('gtr', v, bt(i, 0.5 * k) + jit() * 0.5, P_i * 0.45, (1.0 if pos % 2 == 0 else 0.85) if k == 0 else 0.75, spread=0.004)
            if with_bass: note('bass', broot(i), bt(i) + jit(), P_i * 0.45, 0.9); note('bass', broot(i), bt(i, 0.5) + jit(), P_i * 0.45, 0.7)
        if with_drums and fam not in ('reggae8', 'jazz'):
            if meter == 3: add(bt(i) + jit(), S.drum('kick' if pos == 0 else 'hat'), 0.8 if pos == 0 else 0.5)
            elif compound: add(bt(i) + jit(), S.drum('kick' if pos == 0 else 'snare'), 0.8)
            else:
                add(bt(i) + jit(), S.drum('kick' if pos % 2 == 0 else 'snare'), 0.8); add(bt(i, 0.5) + jit(), S.drum('hat'), 0.4)
    # mic: EQ, room, noise, level, soft clip
    y = buf[:int(dur * SR)]
    y = hp(y, rng.uniform(70, 180)); y = lp(y, rng.uniform(6000, 12000))
    irn = int(rng.uniform(0.25, 0.9) * SR); ir = rng.normal(0, 1, irn) * np.exp(-np.arange(irn) / SR / rng.uniform(0.08, 0.3)); ir[0] = 0
    wet = rng.uniform(0.04, 0.25); y = y + wet * fftconvolve(y, ir)[:len(y)] / (np.sqrt((ir ** 2).sum()) * 3)
    y = y / (np.abs(y).max() + 1e-9) * rng.uniform(0.5, 0.95)
    y = np.tanh(y * rng.uniform(1.0, 1.6)) / np.tanh(rng.uniform(1.0, 1.6))
    y += rng.normal(0, 10 ** (rng.uniform(-58, -40) / 20), len(y))
    name = f"{SPLIT[:2]}_{fam}_{idx:02d}"
    import wave
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32000).astype(np.int16).tobytes())
    down = [k for k in range(nb) if k % bpb == 0]
    sec = [[0.0, round(float(bpm), 2)]] + ([[round(float(ch_at), 2), round(float(bpm2), 2)]] if kind == 'step' else [])
    key = NOTE[tonic] + ('m' if minor else '')
    return dict(name=name, fam=fam, split=SPLIT, dur=round(dur, 3), key=key, beats=[round(float(b), 4) for b in beats if b < dur], down=down, meter='6/8' if compound else str(meter),
                bpm0=round(float(bpm), 2), bpm1=round(float(bpm2 if bpm2 else bpm), 2), kind=kind, change=ch_at if kind != 'steady' else None, sections=sec, swing=swing,
                harm=str(harm), bass=bool(with_bass), drums=bool(with_drums), prog=[[NOTE[(tonic + d) % 12], q] for d, q in prog], gaps=[], played_from=0.0)
FAMS = ['straight', 'swing', 'reggae8', 'reggae24', 'waltz', 'waltzarp', 'six8', 'step', 'ramp', 'jazz', 'secdom', 'funk', 'ballad', 'bossa', 'punk']
truth = []
for fam in FAMS:
    for i in range(NPF): truth.append(make(fam, i)); print(truth[-1]['name'], truth[-1]['key'], truth[-1]['bpm0'], truth[-1]['meter'], flush=True)
json.dump(truth, open(os.path.join(OUT, 'truth.json'), 'w'))
