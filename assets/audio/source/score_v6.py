"""3Shamrocks Studio homepage music, Score v6 "the long jam": Score v5 grown into a song that keeps evolving down the page.

Dave, 10 Nov, on v5: "getting cooler, the vibe is almost there", but the portfolio solo synth is weird / screechy, nothing
evolves after the portfolio, the 16-bar loop turns into a customer-service hold loop. Keep the beginning, go darker,
cooler, more masculine.

What v6 changes (98 BPM, swung 16ths, E dorian, same instruments and mix chain as v5):
  * The opening is untouched: bars 1-16 of every v5 bed (drums, bass, guitar, keys, organ, horns) are the v5 notes,
    re-rendered from score_v5.py with the same seed, level-matched to the v5 files; the intro fill is the v5 file.
  * Every bed is extended with new, non-repeating variation bars, and the beds have DIFFERENT loop lengths
    (drums 32, bass 40, guitar 24, keys 40, organ 24, horns 40 bars): all multiples of the 8-bar progression, so the
    harmony always lines up, but the band as a whole only repeats after hundreds of bars.
    New bars: rotating kick / ghost-note / hi-hat patterns and randomly chosen fills, new bass lines (deeper, octave
    pumps, chromatic walk-ups), new guitar strum patterns and voicings, new Rhodes / clav comping, organ pulses,
    new horn figures (offbeat stabs, a short soli line, swells).
  * The portfolio lead (mel-*) is rewritten: no synth or driven guitar. Low tenor sax call answered by a muted jazz
    guitar, 32 bars of call-and-response, fewer notes, laid back behind the beat, low-passed ~4.5 kHz and de-essed.
    Products keep the same hook with their own warm voice and changed phrase endings (indicator):
    shomer French horn, lickpick wah jazz guitar answered by Rhodes, trashure-hunters baritone sax, chore-royale organ,
    fairent Rhodes, milo vibraphone, concepts (and rk) muted trumpet.
  * New sections for the rest of the page (stems that only play there):
      bdrums  ride-cymbal groove, side-stick then backbeat, low-tom fills       (16 bars)
      bbass   sub-heavy bass on the dark bridge progression                       (24 bars)
      bkeys   dark Rhodes + organ, quartal voicings, E aeolian / phrygian bridge  (32 bars)
              Em11 Fmaj7#11 Em11 Fmaj7#11 | Cmaj9 Am11 F#m7b5 B7#9
      bhorn   low trombone / baritone sax noir melody, muted trumpet answers   (24 bars)
      shout   horn-section shout chorus and stab outro on the main progression  (16 bars)
  Story: hero drums -> +bass -> +guitar -> +keys/organ -> +horns -> portfolio: band + dark lead -> identity: breakdown
  (drums + bass) -> experience: dark bridge (ride, sub bass, Rhodes) -> about: + low horn melody -> forest: no drums,
  back home -> contact: everything + horn shout outro.

Usage:
  python3 score_v6.py stems   -> stems + mix.json in assets/audio/studio/v6/ (env S3_REPO_OUT overrides)
  python3 score_v6.py demo    -> /mnt/user-data/outputs/audio/score-v6-demo.mp3 (run after `stems`)
  python3 score_v6.py all
Requires the v5 files in assets/audio/studio/v5/ (level match + intro fill) and score_v5.py next to this file.
Requires: tinysoundfont, pedalboard, pyloudnorm, soundfile, numpy, scipy, ffmpeg; GeneralUser GS (env S3_SF2)."""
import os, sys, json, shutil, subprocess
import numpy as np
import soundfile as sf
import pedalboard as pb

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.environ.setdefault('S3_OUT', '/dev/shm/s3studio/v6')
import score_v5 as v5                                    # noqa: E402

SR, BPM, BEAT, BAR = v5.SR, v5.BPM, v5.BEAT, v5.BAR
WORK = os.environ['S3_OUT']
V5_DIR = os.path.join(HERE, '..', 'studio', 'v5')
REPO_OUT = os.environ.get('S3_REPO_OUT', os.path.join(HERE, '..', 'studio', 'v6'))
DEMO_DIR = os.environ.get('S3_SKETCH', '/mnt/user-data/outputs/audio')
PAD = 0.5
MAIN = ['drums', 'bass', 'gtr', 'keys', 'organ', 'horns']
BRIDGE = ['bdrums', 'bbass', 'bkeys', 'bhorn']
BEDS = MAIN + BRIDGE + ['shout']
NB = dict(drums=32, bass=40, gtr=24, keys=40, organ=24, horns=40, bdrums=16, bbass=24, bkeys=32, bhorn=24, shout=16, mel=32)
PRODUCTS = v5.PRODUCTS
Q = np.random.default_rng(606)                          # variation choices (v5.R keeps doing the humanising jitter)
bt, chord, ROOT, QUAL, third = v5.bt, v5.chord, v5.ROOT, v5.QUAL, v5.third


def setlen(nbars):
    v5.NBARS = nbars; v5.L = nbars * BAR; v5.LN = int(round(v5.L * SR))


def pick(pool, prev=None):
    """random choice from pool, never the same as prev"""
    while True:
        c = pool[int(Q.integers(len(pool)))]
        if c != prev or len(pool) == 1: return c

# ------------------------------------------------------------------ v5 opening, captured note-for-note


def capture_v5():
    """run the v5 generators in v5's own order with its seed; keep their Parts and sub-oscillator layers"""
    parts, circ = [], []
    real_render, real_add = v5.render, v5.add_circ
    def fake_render(part, cycles=3, length=None, wrap=True):
        parts.append(part); return np.zeros((2, int(round((cycles * v5.L if wrap else length) * SR))), np.float32)
    def fake_add(buf, i0, x): circ.append((int(i0), np.array(x[0], np.float64)))
    v5.render, v5.add_circ = fake_render, fake_add
    v5.R = np.random.default_rng(98); setlen(16)
    out = {}
    try:
        for name, fn in (('drums', v5.p_drums), ('fill', v5.p_fill), ('bass', v5.p_bass), ('gtr', v5.p_gtr), ('keys', v5.p_keys),
                         ('organ', v5.p_organ), ('horns', v5.p_horns)):
            n0, c0 = len(parts), len(circ); fn()
            out[name] = (parts[n0], circ[c0:])
    finally:
        v5.render, v5.add_circ = real_render, real_add
    return out


def sub_layer(adds):
    """sub-oscillator adds (sample index, mono) -> circular mono buffer of the current length"""
    buf = np.zeros((1, v5.LN))
    for i0, x in adds: v5.add_circ(buf, i0, x[None])
    return buf


def kick_list(nbars, pat=None):
    """kick times for the sidechain ducking of a stem of nbars (the 2-bar groove kick; bridge pattern for bridge stems)"""
    pat = pat or v5.KICK_PAT; ks = []
    for b in range(nbars):
        for beat, v in pat[b % 2]: ks.append((bt(b, beat), v))
    return ks

# ------------------------------------------------------------------ drums: 16 new bars


KP = [v5.KICK_PAT,
      {0: [(0, 1.0), (0.75, 0.6), (2.5, 0.9), (3.25, 0.5)], 1: [(0, 1.0), (1.5, 0.55), (2.25, 0.8), (2.75, 0.5)]},
      {0: [(0, 1.0), (1.75, 0.55), (2.5, 0.9)], 1: [(0, 1.0), (0.75, 0.6), (2.25, 0.85), (3.5, 0.6)]},
      {0: [(0, 1.0), (0.5, 0.5), (2.5, 0.85), (2.75, 0.55)], 1: [(0, 1.0), (1.75, 0.6), (2.5, 0.8)]}]
GP = [v5.GHOSTS,
      {0: [(0.75, 30), (1.25, 24), (2.75, 32), (3.25, 26)], 1: [(0.5, 28), (1.75, 34), (2.25, 26), (3.75, 38)]},
      {0: [(0.25, 22), (1.75, 36), (2.5, 24), (3.75, 34)], 1: [(0.75, 30), (1.25, 22), (2.75, 36), (3.5, 26)]}]


def fill(p, b, kind, ks):
    def h(beat, k, v, d=0.2): t = p.n(bt(b, beat), d, 9, k, v, jit=0.003, vj=3); ks.append((t, v / 110)) if k == 36 else None
    if kind == 'build':
        for beat, v in ((3.0, 92), (3.25, 70), (3.5, 96), (3.75, 108)): h(beat, 38, v, 0.15)
    elif kind == 'toms':
        for beat, k, v in ((2.5, 50, 92), (2.75, 48, 86), (3.0, 47, 98), (3.25, 45, 92), (3.5, 43, 104), (3.75, 41, 112)): h(beat, k, v, 0.25)
        h(3.5, 36, 80)
    elif kind == 'syncop':
        for beat, k, v in ((3.0, 38, 104), (3.25, 36, 90), (3.5, 38, 98), (3.75, 38, 112)): h(beat, k, v, 0.15)
    elif kind == 'lift':
        h(3.5, 46, 80, 0.4); h(3.75, 38, 96, 0.12)
    elif kind == 'drop':
        h(3.5, 36, 92); h(3.75, 38, 110, 0.15)
    elif kind == 'ghosts':
        for i, beat in enumerate((2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75)): h(beat, 38, 30 + i * 11, 0.1)


def p_drums():
    cap, _ = CAP['drums']
    setlen(NB['drums'])
    p = v5.Part(); p.prog(9, 0, drums=True); p.ev = list(cap.ev)
    _, adds = CAP['drums']
    ks = []
    kp = gp = hat = None
    for b in range(16, NB['drums']):
        blk = (b // 8) % 4
        if b % 4 == 0: kp = pick(KP[1:], kp); gp = pick(GP[1:] if b < 24 else GP, gp)
        if b % 8 == 0: hat = 'sixteens' if b == 16 else 'eighths'
        lb = b % 4 == 3
        fk = None
        if lb: fk = pick(['lift', 'ghosts', 'syncop'] if b % 8 == 3 else (['toms', 'build', 'drop'] if b != NB['drums'] - 1 else ['toms']))
        for beat, v in kp[b % 2]:
            if lb and fk in ('drop',) and beat >= 2.5: continue
            t = p.n(bt(b, beat), 0.2, 9, 36, int(100 * v + 10), jit=0.002, vj=3); ks.append((t, v))
        for beat in (1, 3):
            if lb and beat == 3 and fk in ('build', 'toms', 'syncop', 'drop'): continue
            p.n(bt(b, beat), 0.25, 9, 38, 112 if blk != 1 else 116, jit=0.003, vj=4, late=0.008)
        for beat, v in gp[b % 2]:
            if lb and beat >= 2.5 and fk != 'lift': continue
            p.n(bt(b, beat), 0.1, 9, 38, v, jit=0.005, vj=5)
        for e in range(16):
            beat = e * 0.25
            if lb and beat >= 2.5 and fk in ('toms', 'build', 'ghosts'): continue
            if hat == 'eighths':
                if e % 2: continue
                if b % 2 == 1 and beat == 3.5: p.n(bt(b, beat), 0.25, 9, 46, 70, jit=0.003); continue
                p.n(bt(b, beat), 0.09, 9, 42, 84 if e % 4 == 0 else 60, jit=0.004, vj=6)
            else:
                if b % 2 == 1 and beat in (1.5, 3.5) and b % 4 == 1: p.n(bt(b, beat), 0.2, 9, 46, 64, jit=0.003); continue
                p.n(bt(b, beat), 0.08, 9, 42, [84, 40, 62, 46][e % 4], jit=0.004, vj=6)
        if b >= 24:                                       # tambourine on 2 and 4 in the last 8 bars
            for beat in (1, 3): p.n(bt(b, beat), 0.2, 9, 54, 58, jit=0.004, vj=6, late=0.006)
        if fk: fill(p, b, fk, ks)
        if b == 16: p.n(bt(b, 0), 1.5, 9, 49, 84, jit=0.0)
        if b == 24: p.n(bt(b, 0), 1.2, 9, 57, 70, jit=0.0)
    kit = v5.render(p)
    sub = np.zeros((1, v5.LN))
    for i0, x in adds: v5.add_circ(sub, i0, x[None])
    for i, (kt, v) in enumerate(ks): v5.add_circ(sub, int(kt * SR), (v5.kick_note(110, 50, 0.16, 0.25, 500 + i) * v)[None])
    return kit, v5.tile3(np.vstack([sub, sub]))

# ------------------------------------------------------------------ bass: 24 new bars


def iv_of(c, name):
    r = {'R': 0, 'O': 12, '5': 7, 'L5': -5, '4': 5, 'b3': 3, '3': third(c), 'b7': 11 if QUAL[c] == 'M' else 10, 'L7': (11 if QUAL[c] == 'M' else 10) - 12,
         '6': 9, '2': 2}
    return r[name]


BP = [  # two-bar bass figures: (beat, interval, beats, vel, slap-pop)
    ([(0.0, 'R', .9, 112, 0), (1.5, 'O', .15, 92, 1), (1.75, 'b7', .2, 82, 0), (2.5, '5', .5, 98, 0), (3.5, '4', .2, 84, 0), (3.75, '3', .2, 88, 0)],
     [(0.0, 'R', .4, 110, 0), (0.75, 'R', .1, 58, 0), (1.0, 'O', .2, 100, 1), (2.0, 'L7', .45, 94, 0), (3.0, 'R', .3, 92, 0)]),
    ([(0.0, 'R', .25, 112, 0), (0.5, 'O', .15, 96, 1), (0.75, 'R', .12, 76, 0), (1.25, 'O', .15, 92, 1), (1.75, 'b7', .25, 88, 0),
      (2.25, '5', .25, 92, 0), (2.75, 'R', .12, 64, 0), (3.0, 'O', .2, 98, 1), (3.5, '5', .2, 86, 0)],
     [(0.0, 'R', .3, 110, 0), (0.5, 'R', .1, 60, 0), (0.75, '5', .2, 90, 0), (1.25, 'b7', .2, 88, 0), (1.75, 'O', .2, 98, 1),
      (2.5, 'R', .2, 92, 0), (2.75, 'L5', .4, 94, 0)]),
    ([(0.0, 'R', .6, 114, 0), (1.0, 'R', .1, 62, 0), (1.25, 'b3', .2, 86, 0), (1.5, '4', .2, 88, 0), (1.75, '5', .3, 92, 0),
      (2.5, 'b7', .2, 90, 0), (2.75, 'O', .2, 100, 1), (3.5, '5', .2, 84, 0)],
     [(0.0, 'R', .45, 110, 0), (0.75, 'O', .15, 96, 1), (1.5, 'R', .1, 60, 0), (1.75, '5', .25, 90, 0), (2.25, 'b7', .25, 88, 0),
      (2.75, '5', .2, 86, 0), (3.0, '4', .2, 84, 0)]),
    ([(0.0, 'R', 1.4, 112, 0), (1.75, 'R', .1, 60, 0), (2.0, 'O', .2, 98, 1), (2.5, 'b7', .2, 88, 0), (2.75, '5', .5, 94, 0)],
     [(0.0, 'R', .3, 110, 0), (0.75, 'R', .1, 58, 0), (1.0, '5', .2, 90, 0), (1.5, 'O', .15, 96, 1), (1.75, 'R', .15, 76, 0),
      (2.5, '3', .2, 88, 0), (3.0, '5', .2, 90, 0)]),
]


def p_bass():
    cap, adds = CAP['bass']
    setlen(NB['bass'])
    p = v5.Part(); p.prog(0, 33); p.prog(1, 36); p.ev = list(cap.ev)
    sub = sub_layer(adds)
    fig = None
    for b in range(16, NB['bass']):
        c, nxt = chord(b), chord(b + 1)
        if b % 2 == 0: fig = pick(BP, fig)
        notes = [(beat, ROOT[c] + iv_of(c, n), d, v, pop) for beat, n, d, v, pop in fig[b % 2]]
        if b % 2 == 1:                                     # chromatic approach into the next chord (or a walk-up every 8 bars)
            nr = ROOT[nxt]
            if b % 8 == 7: notes = [x for x in notes if x[0] < 2.5] + [(2.5, nr - 3, .2, 90, 0), (3.0, nr - 2, .2, 92, 0), (3.5, nr - 1, .2, 96, 0)]
            else:
                appr = nr - 1 if nr - 1 != ROOT[c] else nr + 1
                notes = [x for x in notes if x[0] < 3.5] + [(3.5, appr, .2, 92, 0)]
        for beat, k, d, v, pop in notes:
            while k < 26: k += 12
            t = p.n(bt(b, beat), d * BEAT, 1 if pop else 0, k, v, jit=0.004, vj=4)
            if not pop and v > 70:
                nn = int((d * BEAT + 0.08) * SR); tt = np.arange(nn) / SR
                x = np.sin(2 * np.pi * v5.mtof(k) * tt) * np.minimum(1, tt / 0.004) * np.exp(-np.maximum(0, tt - d * BEAT) / 0.03) * (v / 127)
                v5.add_circ(sub, int(t * SR), x[None])
    up = v5.render(p)
    s = v5.tile3(np.vstack([sub, sub]))
    return up / (np.abs(up).max() + 1e-9) + 0.55 * s / (np.abs(s).max() + 1e-9)

# ------------------------------------------------------------------ guitar: 8 new bars


GPAT = ['x..mx.m.x..mx.mm', '.mx.mmx..mx.mmx.', 'x.m.x.mmx.m.xmm.', 'm.xm.mx.m.xm.m.x', 'x.mmx..mx.m.x..m']
GHI = {'Em9': [67, 71, 74, 78], 'A13': [67, 71, 73, 78], 'Cmaj9': [67, 71, 74, 76], 'B7#9': [63, 69, 74]}


def p_gtr():
    cap, _ = CAP['gtr']
    setlen(NB['gtr'])
    p = v5.Part(); p.prog(0, 28, bank=8); p.prog(1, 28); p.ev = list(cap.ev)
    pat = None
    for b in range(16, NB['gtr']):
        pat = pick(GPAT, pat)
        v = (GHI if b >= 20 else v5.GTR)[chord(b)]
        for e, ch in enumerate(pat):
            if ch == '.': continue
            t0 = bt(b, e * 0.25); up = e % 2 == 1; order = v[::-1] if up else v
            for j, k in enumerate(order):
                if ch == 'x': p.n(t0 + j * 0.006, 0.11 * BEAT, 0, k, (98 if e % 4 == 0 else 88) - j * 3, jit=0.003, vj=6)
                else: p.n(t0 + j * 0.004, 0.035, 1, k - 12 if j == 0 else k, 44, jit=0.003, vj=8)
    return v5.render(p)

# ------------------------------------------------------------------ keys (Rhodes + clav): 24 new bars


RHO2 = {'Em9': [59, 62, 66, 67], 'A13': [61, 66, 67, 71], 'Cmaj9': [55, 59, 62, 64], 'B7#9': [57, 62, 63, 67]}
COMP = [([(0.0, 0.45, 82), (1.75, 0.22, 74), (2.5, 1.1, 80)], [(0.75, 0.6, 78), (2.25, 0.2, 70), (3.5, 0.45, 76)]),
        ([(0.5, 0.3, 80), (1.5, 0.25, 72), (2.75, 0.9, 78)], [(0.0, 0.25, 70), (1.25, 0.5, 78), (3.0, 0.3, 72), (3.75, 0.2, 68)]),
        ([(0.0, 1.4, 76), (2.25, 0.25, 72), (3.0, 0.6, 78)], [(0.75, 0.25, 74), (1.5, 1.0, 78), (3.25, 0.25, 70)])]
CLAV = [(0.25, 0.75, 1.25, 2.0, 2.5, 3.0, 3.75), (0.0, 0.5, 0.75, 1.5, 2.0, 2.75, 3.25), (0.5, 0.75, 1.5, 2.25, 2.5, 3.5),
        (0.25, 1.0, 1.25, 2.0, 2.75, 3.25, 3.5)]


def p_keys():
    cap, _ = CAP['keys']
    setlen(NB['keys'])
    p = v5.Part(); p.prog(0, 4); p.prog(1, 7); p.ev = list(cap.ev)
    comp = clav = None
    for b in range(16, NB['keys']):
        c = chord(b); v = (RHO2 if (b // 8) % 2 == 0 else v5.RHO)[c]
        if b % 2 == 0: comp = pick(COMP, comp)
        for beat, d, vel in comp[b % 2]:
            for j, k in enumerate(v): p.n(bt(b, beat) + j * 0.008, d * BEAT, 0, k, vel - j * 2, jit=0.004)
        if b % 4 == 0: clav = pick(CLAV, clav)
        lo = v[:2]
        if not (24 <= b < 28):                            # the clav sits out 4 bars: space
            for i, beat in enumerate(clav): p.n(bt(b, beat), 0.07, 1, lo[i % 2] + 12, 74 if i % 3 == 0 else 58, jit=0.003, vj=6)
        if b >= 32 and b % 2 == 1:                        # Rhodes pickup lick into the next chord
            nv = v5.RHO[chord(b + 1)]
            for i, (beat, k) in enumerate(((3.0, v[-1]), (3.25, v[-2]), (3.5, nv[-1] - 1 if nv[-1] - 1 not in v else nv[-2]), (3.75, nv[-1]))):
                p.n(bt(b, beat), 0.2, 0, k, 70 + 4 * i, jit=0.004)
    return v5.render(p)

# ------------------------------------------------------------------ organ: 8 new bars


def p_organ():
    cap, _ = CAP['organ']
    setlen(NB['organ'])
    p = v5.Part(); p.prog(0, 16); p.ev = list(cap.ev)
    for b in range(16, NB['organ']):
        v = [k + 12 if i == 0 else k for i, k in enumerate(v5.ORG[chord(b)])]       # first inversion up: a lighter colour
        if b < 20:      # rhythmic "bubble" pulses
            for beat, d in ((0.0, 0.4), (0.75, 0.2), (1.5, 0.4), (2.5, 0.6), (3.25, 0.2)):
                for j, k in enumerate(v): p.n(bt(b, beat) + j * 0.006, d * BEAT, 0, k, 66, jit=0.003, vj=3)
        else:           # long swells, chord per bar
            for j, k in enumerate(v): p.n(bt(b, 0) - 0.02 + j * 0.01, BAR - 0.06, 0, k, 64 + (b % 2) * 6, jit=0.003, vj=3)
    return v5.render(p)

# ------------------------------------------------------------------ horns: 24 new bars


def p_horns():
    cap, _ = CAP['horns']
    setlen(NB['horns'])
    p = v5.Part(); p.prog(0, 61); p.prog(1, 66); p.prog(2, 57); p.ev = list(cap.ev)
    def stab(t, d, c, vel):
        vv = v5.HRN[c]
        for j, k in enumerate(vv): p.n(t, d, 0, k, vel - 4 * j, jit=0.004, vj=4)
        p.n(t + 0.004, d, 1, vv[1], vel - 6, jit=0.003); p.n(t + 0.002, d, 2, vv[0] - 12, vel - 8, jit=0.003)
    SOLI = [(0.5, .2, 64), (0.75, .2, 66), (1.0, .45, 67), (1.5, .2, 69), (1.75, .2, 71), (2.0, .5, 74), (2.75, .25, 71), (3.0, .9, 69)]
    for b in range(16, NB['horns']):
        c = chord(b); blk = b // 8
        if blk == 2:     # offbeat stabs
            if b % 4 == 1: stab(bt(b, 1.5), 0.12, c, 100); stab(bt(b, 1.75), 0.4, c, 108)
            if b % 4 == 3 and b % 8 != 7: stab(bt(b, 2.5), 0.12, c, 98); stab(bt(b, 3.0), 0.14, c, 96); stab(bt(b, 3.5), 0.5, c, 106)
            if b % 8 == 7: stab(bt(b, 0.0), 0.7, c, 112); stab(bt(b, 2.5), 0.14, c, 98); stab(bt(b, 2.75), 0.5, c, 108)
        elif blk == 3:   # a short soli line, tenor + trombone an octave down
            if b in (25, 29):
                for beat, d, k in SOLI:
                    p.n(bt(b, beat), d * BEAT, 1, k - (2 if b == 29 and k in (66,) else 0), 100, jit=0.004, vj=5, late=0.01)
                    p.n(bt(b, beat) + 0.003, d * BEAT, 2, k - 12, 94, jit=0.004, vj=5, late=0.01)
            if b in (27, 31): stab(bt(b, 0.75), 0.14, c, 100); stab(bt(b, 1.5), 0.5, c, 106)
            if b == 30:
                for beat, vel in ((3.0, 92), (3.25, 98), (3.5, 108)): stab(bt(b, beat), 0.16 if beat < 3.5 else 0.5, c, vel)
        else:            # swells and sparse hits
            if b % 8 == 0:
                for j, k in enumerate(v5.HRN[c]): p.n(bt(b, 0.5), 1.6 * BAR, 2 if j == 0 else 1, k - (12 if j == 0 else 0), 80, jit=0.004, vj=4)
            if b % 8 == 3: stab(bt(b, 2.75), 0.6, c, 106)
            if b % 8 == 5: stab(bt(b, 0.75), 0.14, c, 98); stab(bt(b, 1.0), 0.14, c, 92)
            if b % 8 == 6:
                for beat, vel in ((3.0, 92), (3.25, 98), (3.5, 108)): stab(bt(b, beat), 0.16 if beat < 3.5 else 0.5, c, vel)
            if b % 8 == 7: stab(bt(b, 0.0), 0.32, c, 114); stab(bt(b, 1.75), 0.12, c, 100); stab(bt(b, 2.0), 0.6, c, 110)
    return v5.render(p)

# ------------------------------------------------------------------ the dark lead: 32 bars of call and response
# (beat, beats, key, vel, bend_from_semitones, vibrato) ; 'END' = the product indicator note
CALL = {
    0: [(0.75, .25, 59, 82, 0, 0), (1.0, .6, 62, 96, -1, 0), (1.75, .25, 64, 88, 0, 0), (2.0, 1.3, 62, 98, -2, 1)],
    1: [(0.0, .6, 59, 88, 0, 0), (0.75, 1.6, 55, 92, -1, 1)],
    2: [(0.5, .25, 61, 84, 0, 0), (0.75, .25, 64, 88, 0, 0), (1.0, 1.0, 66, 98, -1, 1), (2.5, .5, 64, 86, 0, 0)],
    3: [(0.0, 1.8, 57, 94, -2, 1)],
    4: [(0.75, .25, 59, 82, 0, 0), (1.0, .6, 62, 96, -1, 0), (1.75, .25, 64, 88, 0, 0), (2.0, 1.3, 67, 100, -2, 1)],
    5: [(0.0, .5, 66, 88, 0, 0), (0.5, .5, 64, 86, 0, 0), (1.0, 1.4, 62, 92, 0, 1)],
    6: [(0.5, .25, 64, 84, 0, 0), (0.75, .25, 67, 88, 0, 0), (1.0, 1.2, 71, 100, -2, 1), (2.75, .5, 69, 88, 0, 0)],
    7: [(0.0, .5, 66, 92, 0, 0), (0.5, .5, 63, 88, 0, 0), (1.0, 2.2, 'END', 98, -1, 1)],
}
RESP = {   # muted guitar answers (one octave of the E minor pentatonic + the blue note)
    1: [(2.75, .2, 64, 80), (3.0, .2, 67, 84), (3.25, .15, 69, 78), (3.5, .45, 71, 88)],
    3: [(2.0, .2, 67, 80), (2.25, .2, 66, 76), (2.5, .3, 64, 84), (3.0, .2, 61, 78), (3.25, .5, 64, 86)],
    5: [(2.75, .2, 71, 80), (3.0, .2, 70, 78), (3.25, .2, 69, 80), (3.5, .45, 67, 86)],
    7: [(3.25, .2, 59, 78), (3.5, .2, 62, 80), (3.75, .3, 64, 86)],
}
ENDS = {7: 59, 15: 62, 23: 64, 31: 59}


def lead_bar(b):
    """the call for bar b of 32: pass 0 = hook, 1 = hook with a lower ending, 2 = up a 4th in the middle (bars 16-19), 3 = sparse"""
    pas, k = b // 8, b % 8; ph = [list(x) for x in CALL[k]]
    if pas == 1 and k in (4, 5):                     # second pass answers lower
        ph = [[0.75, .25, 57, 82, 0, 0], [1.0, .6, 59, 94, -1, 0], [1.75, .25, 62, 88, 0, 0], [2.0, 1.3, 64, 98, -2, 1]] if k == 4 else \
             [[0.0, .5, 62, 88, 0, 0], [0.5, .5, 59, 86, 0, 0], [1.0, 1.4, 57, 92, 0, 1]]
    if pas == 2 and k < 4:                           # the bridge-ish climb: same rhythm, a fourth up, held longer
        ph = [[x[0], x[1] * (1.25 if x[1] > 0.5 else 1), x[2] + 5 if isinstance(x[2], int) else x[2], x[3] + 4, x[4], x[5]] for x in ph]
    if pas == 3 and k in (0, 2, 4):                  # last pass: fewer notes, the guitar leads, the call answers
        ph = [x for x in ph if x[1] >= 0.5]
    return [tuple(x) for x in ph]


def resp_bar(b):
    pas, k = b // 8, b % 8
    if pas == 3:   # guitar takes the call role on the even bars
        if k in (0, 2, 4, 6): return [(0.5, .2, 64, 82), (0.75, .2, 67, 84), (1.0, .4, 69, 86), (1.5, .2, 67, 80), (1.75, .5, 64, 84)] if k != 6 else \
                                     [(0.5, .2, 71, 82), (0.75, .2, 69, 80), (1.0, .4, 67, 84), (1.75, .5, 66, 84)]
        return RESP.get(k, [])[:2]
    r = RESP.get(k, [])
    if pas == 1 and k == 5: r = [(2.75, .2, 64, 80), (3.0, .2, 62, 78), (3.25, .2, 59, 80), (3.5, .45, 57, 86)]
    if pas == 2 and k in (1, 3): r = [(beat, d, kk + 5, v) for beat, d, kk, v in r]
    return r


LEADS6 = {  # call voice: (bank, preset, octave shift, response preset)
    'tenor': (0, 66, 0, 26), 'trombone': (0, 57, 0, 26), 'horn': (0, 60, 0, 26), 'wahgtr': (0, 26, 0, 4), 'bari': (0, 67, -12, 26), 'organ': (0, 17, 0, 26),
    'rhodes': (0, 4, 0, 26), 'vibes': (0, 11, 0, 26), 'mute': (0, 59, 0, 26)}
VARIANTS6 = {
    'theme':            dict(t='tenor'),
    'shomer':           dict(t='horn', ends={7: 62, 23: 66}),
    'lickpick':         dict(t='wahgtr', ends={7: 64, 31: 62}),
    'trashure-hunters': dict(t='bari', ends={15: 59}),
    'chore-royale':     dict(t='organ', ends={7: 66, 31: 64}),
    'fairent':          dict(t='rhodes', ends={15: 64}),
    'milo':             dict(t='vibes', ends={7: 67}),
    'concepts':         dict(t='mute', ends={7: 63, 23: 62}),
}


def lead_part(var, which):
    t = LEADS6[var['t']]; ends = dict(ENDS); ends.update(var.get('ends', {}))
    p = v5.Part()
    if which == 'call':
        p.prog(0, t[1], bank=t[0]); octv = t[2]
        for b in range(NB['mel']):
            for beat, d, k, v, bf, vib in lead_bar(b):
                if k == 'END': k = ends[b]
                tt = p.n(bt(b, beat), d * BEAT, 0, k + octv, v, jit=0.006, vj=4, late=0.022)   # laid back
                if bf:
                    for i in range(11): p.bend(tt + i * 0.011, 0, bf * (1 - i / 10) ** 1.5)
                else: p.bend(tt - 0.001, 0, 0.0)
                dd = d * BEAT
                if vib and dd > 0.35:
                    for tv in np.arange(tt + 0.25, tt + dd, 0.012):
                        a = min(1.0, (tv - tt - 0.25) / 0.35) * 0.18; p.bend(tv, 0, a * np.sin(2 * np.pi * 5.0 * (tv - tt)))
                    p.bend(tt + dd + 0.005, 0, 0.0)
    else:
        p.prog(0, t[3])
        for b in range(NB['mel']):
            for beat, d, k, v in resp_bar(b): p.n(bt(b, beat), d * BEAT, 0, k - (12 if t[3] == 26 else 0), v, jit=0.005, vj=5, late=0.016)
    return v5.render(p)


def lead_chain(m, voice, resp=False):
    if voice == 'wahgtr' and not resp: m = v5.autowah(m, lo=380, hi=1500, per_beat=1, dry=0.35)
    shelf = {'tenor': (1700, -6.0), 'mute': (1400, -7.0), 'trombone': (1800, -4.0), 'horn': (1800, -3.0)}.get(voice, (2500, -2.0))
    chain = [pb.HighpassFilter(110 if voice == 'bari' else 140), pb.Compressor(-24, 3.0, 8, 160), pb.Distortion(2.5),
             pb.PeakFilter(250, -1.5, 0.8), pb.PeakFilter(420, 1.5, 0.9), pb.HighShelfFilter(shelf[0], shelf[1], 0.7),
             pb.PeakFilter(3600, -4.0, 1.2), pb.PeakFilter(5500, -5.0, 1.2), pb.LowpassFilter(4500), pb.LowpassFilter(5200)]
    return v5.fx(m, chain)


def p_lead(vname):
    setlen(NB['mel'])
    var = VARIANTS6[vname]
    c = lead_part(var, 'call'); c = c.mean(axis=0, keepdims=True); c = lead_chain(c / (np.abs(c).max() + 1e-9), var['t'])
    r = lead_part(var, 'resp'); r = r.mean(axis=0, keepdims=True); r = lead_chain(r / (np.abs(r).max() + 1e-9), var['t'], True)
    return c + 0.55 * r * np.abs(c).max() / (np.abs(r).max() + 1e-9)

# ------------------------------------------------------------------ the dark bridge (E aeolian / phrygian)


CHB = ['Em11', 'Fmaj7#11', 'Em11', 'Fmaj7#11', 'Cmaj9', 'Am11', 'F#m7b5', 'B7#9']
BROOT = {'Em11': 28, 'Fmaj7#11': 29, 'Cmaj9': 36, 'Am11': 33, 'F#m7b5': 30, 'B7#9': 35}
BV = {'Em11': [55, 57, 62, 66], 'Fmaj7#11': [57, 59, 64, 67], 'Cmaj9': [52, 55, 59, 62], 'Am11': [55, 60, 62, 64],
      'F#m7b5': [54, 57, 60, 64], 'B7#9': [51, 55, 57, 62]}
BKICK = {0: [(0, 1.0), (1.75, 0.5), (2.5, 0.85)], 1: [(0, 1.0), (2.25, 0.7), (3.75, 0.45)]}


def bch(b): return CHB[b % 8]


def p_bdrums():
    setlen(NB['bdrums'])
    p = v5.Part(); p.prog(9, 0, drums=True); ks = []
    for b in range(NB['bdrums']):
        for beat, v in BKICK[b % 2]:
            t = p.n(bt(b, beat), 0.2, 9, 36, int(100 * v + 8), jit=0.002, vj=3); ks.append((t, v))
        for e in range(8):                                   # ride on the swung 8ths, bell on the "and" of 4
            beat = e * 0.5
            p.n(bt(b, beat), 0.4, 9, 53 if (e == 7 and b % 2) else 51, (92 if e % 2 == 0 else 70) - (8 if e == 7 and b % 2 else 0), jit=0.004, vj=6)
        for beat in (1, 3): p.n(bt(b, beat), 0.1, 9, 44, 62, jit=0.003, vj=4)     # pedal hat
        last = b % 8 == 7
        for beat in (1, 3):
            if last and beat == 3: continue
            p.n(bt(b, beat), 0.2, 9, 37 if b < 8 else 38, 96 if b < 8 else 108, jit=0.003, vj=4, late=0.01)
        if b >= 8:
            for beat, v in ((0.75, 26), (2.25, 30), (3.75, 34)) if b % 2 else ((1.75, 32), (2.75, 24)): p.n(bt(b, beat), 0.1, 9, 38, v, jit=0.005)
        if last:
            run = ((3.0, 43, 96), (3.25, 43, 84), (3.5, 41, 104), (3.75, 41, 112)) if b < 8 else \
                  ((2.0, 45, 90), (2.33, 43, 92), (2.67, 43, 96), (3.0, 41, 104), (3.33, 41, 100), (3.67, 41, 112))
            for beat, k, v in run: p.n(bar_t(b, beat), 0.3, 9, k, v, jit=0.003)
        if b == 8: p.n(bt(b, 0), 1.6, 9, 57, 64, jit=0.0)
        if b == 0: p.n(bt(b, 0), 1.6, 9, 49, 70, jit=0.0)
    kit = v5.render(p)
    sub = np.zeros((1, v5.LN))
    for i, (kt, v) in enumerate(ks): v5.add_circ(sub, int(kt * SR), (v5.kick_note(100, 45, 0.2, 0.2, 900 + i) * v)[None])
    return kit, v5.tile3(np.vstack([sub, sub]))


def bar_t(b, beat): return b * BAR + beat * BEAT                  # straight (triplet tom runs ignore the swing)


BBL = [   # bridge bass figures, one bar each: (beat, interval, beats, vel)
    [(0.0, 0, 1.6, 112), (1.75, 0, .15, 64), (2.0, 12, .3, 92), (2.5, 7, 1.0, 98), (3.75, 'appr', .25, 90)],
    [(0.0, 0, .8, 112), (1.0, 7, .4, 90), (1.5, 12, .25, 94), (2.5, 0, .6, 100), (3.25, 10, .25, 86), (3.75, 'appr', .25, 90)],
    [(0.0, 0, 2.6, 114), (3.0, 7, .4, 92), (3.5, 'appr', .4, 94)],
]


def p_bbass():
    setlen(NB['bbass'])
    p = v5.Part(); p.prog(0, 33); sub = np.zeros((1, v5.LN))
    for b in range(NB['bbass']):
        c, nxt = bch(b), bch(b + 1); r = BROOT[c]; fig = BBL[(b // 8 + (b % 2)) % 3]
        for beat, iv, d, v in fig:
            if iv == 'appr': nr = BROOT[nxt]; k = nr - 1 if nr - 1 != r else nr + 1
            else: k = r + (iv if not (c == 'F#m7b5' and iv == 7) else 6)
            while k < 26: k += 12
            t = p.n(bt(b, beat), d * BEAT, 0, k, v, jit=0.004, vj=4)
            nn = int((d * BEAT + 0.1) * SR); tt = np.arange(nn) / SR
            ks = k - 12 if k >= 36 else k                    # sub sits an octave down where it can
            x = np.sin(2 * np.pi * v5.mtof(ks) * tt) * np.minimum(1, tt / 0.006) * np.exp(-np.maximum(0, tt - d * BEAT) / 0.05) * (v / 127)
            v5.add_circ(sub, int(t * SR), x[None])
    up = v5.render(p); s = v5.tile3(np.vstack([sub, sub]))
    return up / (np.abs(up).max() + 1e-9) + 0.8 * s / (np.abs(s).max() + 1e-9)


BCOMP = [[(0.0, 1.8, 74), (2.5, 1.2, 70)], [(0.0, 0.5, 72), (0.75, 1.0, 76), (2.75, 1.0, 70)], [(0.5, 3.2, 72)], [(0.0, 0.3, 70), (1.5, 0.6, 74), (2.25, 1.6, 76)]]


def p_bkeys():
    setlen(NB['bkeys'])
    p = v5.Part(); p.prog(0, 4); p.prog(1, 19)       # Rhodes + church organ (soft pad)
    for b in range(NB['bkeys']):
        c = bch(b); v = BV[c]; pas = b // 8
        if pas == 3: v = [k + 12 if i < 2 else k for i, k in enumerate(v)]            # voicing climbs in the last pass
        for beat, d, vel in BCOMP[(pas + b) % 4]:
            for j, k in enumerate(v): p.n(bt(b, beat) + j * 0.012, d * BEAT, 0, k, vel - j * 3, jit=0.004, vj=4)
        for j, k in enumerate(v[:3]): p.n(bt(b, 0) - 0.03, BAR - 0.05, 1, k - 12, 50 if pas else 58, jit=0.002, vj=2)
    return v5.render(p)


BH = [  # bridge horn melody, 8 bars: (bar, beat, beats, key, vel)
    [(0, 0.5, .5, 59, 86), (0, 1.0, 1.5, 62, 96), (0, 2.75, .25, 64, 84), (0, 3.0, .75, 62, 90), (1, 0.0, 2.5, 60, 96), (1, 3.0, .5, 59, 84),
     (2, 0.5, .25, 57, 82), (2, 0.75, .25, 59, 86), (2, 1.0, 1.5, 55, 94), (2, 3.0, .5, 57, 86), (3, 0.0, 2.0, 53, 92), (3, 2.5, .5, 52, 84),
     (4, 0.0, 1.0, 64, 96), (4, 1.0, .5, 67, 92), (4, 1.5, 1.5, 66, 98), (5, 0.5, .5, 64, 88), (5, 1.0, 2.0, 60, 94),
     (6, 0.0, .5, 57, 88), (6, 0.5, .5, 60, 90), (6, 1.0, 1.0, 64, 96), (6, 2.0, 1.0, 62, 92), (7, 0.0, 1.5, 63, 96), (7, 2.0, 1.8, 62, 92)],
    [(0, 1.0, 2.5, 55, 90), (1, 0.5, .5, 57, 86), (1, 1.0, 2.0, 59, 92), (2, 1.0, 2.5, 62, 94), (3, 0.5, .5, 60, 86), (3, 1.0, 2.0, 59, 92),
     (4, 0.5, 1.0, 59, 90), (4, 1.5, 1.5, 62, 94), (5, 0.5, 2.5, 64, 96), (6, 0.0, 1.0, 60, 90), (6, 1.0, 1.0, 57, 88), (7, 0.0, 3.0, 59, 92)],
    [(0, 0.5, .5, 64, 88), (0, 1.0, 1.0, 67, 96), (0, 2.0, 1.5, 66, 92), (1, 0.0, 2.0, 64, 94), (1, 2.5, .5, 60, 84),
     (2, 0.5, .5, 62, 88), (2, 1.0, 2.0, 59, 94), (3, 0.0, 2.5, 57, 92), (4, 0.0, 1.5, 55, 92), (4, 2.0, 1.0, 59, 90),
     (5, 0.0, 2.0, 60, 94), (6, 0.0, 1.0, 64, 96), (6, 1.0, 1.0, 63, 92), (7, 0.0, 3.5, 62, 96)],
]
BH_ANS = {1: [(3.0, .25, 71, 78), (3.25, .25, 69, 76), (3.5, .5, 67, 82)], 3: [(3.0, .25, 69, 76), (3.25, .25, 67, 76), (3.5, .5, 64, 80)],
          5: [(3.0, .25, 72, 76), (3.25, .25, 71, 76), (3.5, .5, 67, 82)], 7: [(2.0, .25, 66, 78), (2.25, .25, 67, 78), (2.5, 1.2, 66, 84)]}


def p_bhorn():
    setlen(NB['bhorn'])
    p = v5.Part(); p.prog(0, 57); p.prog(1, 67); p.prog(2, 59)    # trombone, baritone sax (octave down), muted trumpet answers
    for pas in range(NB['bhorn'] // 8):
        for bb, beat, d, k, v in BH[pas]:
            b = pas * 8 + bb; t = p.n(bt(b, beat), d * BEAT, 0, k, v, jit=0.006, vj=4, late=0.02)
            p.n(t + 0.004, d * BEAT, 1, k - 12, v - 14, jit=0.0, vj=3)
            if d >= 1.0:
                p.bend(t, 0, -1.0)
                for i in range(1, 9): p.bend(t + i * 0.012, 0, -1.0 * (1 - i / 8) ** 1.5)
        if pas != 1:
            for bb, ans in BH_ANS.items():
                for beat, d, k, v in ans: p.n(bt(pas * 8 + bb, beat), d * BEAT, 2, k - 12 if pas == 2 else k, v, jit=0.005, vj=4, late=0.015)
    m = v5.render(p).mean(axis=0, keepdims=True)
    return lead_chain(m / (np.abs(m).max() + 1e-9), 'trombone')

# ------------------------------------------------------------------ shout chorus / horn stab outro (main progression)


SH = {'Em9': [55, 59, 62, 66, 71], 'A13': [55, 61, 66, 69, 73], 'Cmaj9': [55, 59, 62, 64, 67], 'B7#9': [57, 63, 66, 69, 74]}
SHB = {'Em9': 40, 'A13': 45, 'Cmaj9': 48, 'B7#9': 47}


def p_shout():
    setlen(NB['shout'])
    p = v5.Part(); p.prog(0, 56); p.prog(1, 66); p.prog(2, 57); p.prog(3, 67)
    def hit(b, beat, d, vel, fall=False):
        c = chord(b); v = SH[c]; t = bt(b, beat)
        for j, k in enumerate(v[2:]): p.n(t, d, 0, k, vel - 3 * j, jit=0.003, vj=3)
        p.n(t + 0.003, d, 1, v[1], vel - 4, jit=0.003); p.n(t + 0.002, d, 2, v[0], vel - 4, jit=0.003); p.n(t, d, 3, SHB[c], vel - 2, jit=0.003)
        if fall:
            for ch in (0, 1, 2):
                for i in range(12): p.bend(t + d * 0.55 + i * 0.02, ch, -2.0 * (i / 11) ** 1.6)
                p.bend(t + d + 0.05, ch, 0.0)
    for b in range(NB['shout']):
        k = b % 8
        if k in (1, 5): hit(b, 2.5, 0.14, 104); hit(b, 2.75, 0.5, 112)
        if k == 3:
            for beat in (2.0, 2.25, 2.5): hit(b, beat, 0.12, 98 + int(beat * 4))
            hit(b, 2.75, 0.7, 114)
        if k == 6:
            for beat, vel in ((3.0, 96), (3.25, 102), (3.5, 112)): hit(b, beat, 0.16 if beat < 3.5 else 0.5, vel)
        if k == 7:
            if b < 8: hit(b, 0.0, 0.3, 116); hit(b, 1.75, 0.12, 100); hit(b, 2.0, 0.9, 114, fall=True)
            else:   # the outro stab sequence
                for beat in (0.0, 0.75, 1.5): hit(b, beat, 0.22, 116)
                hit(b, 2.0, 1.4, 118, fall=True)
    return v5.render(p)

# ------------------------------------------------------------------ build, level-match, encode


ROLE = dict(drums='drums', bdrums='drums', bass='bass', bbass='bass', gtr='gtr', keys='keys', bkeys='keys', organ='organ', horns='horns', shout='horns')


def proc(name, x, nbars):
    """v5 processing chains at this stem's length; returns the loop (ch, LN)"""
    setlen(nbars)
    v5.KICKS = kick_list(nbars, BKICK if name in ('bbass', 'bkeys') else None)
    if name == 'bhorn' or name.startswith('mel-'):
        y, _ = v5.process('mel-x', x)
    else:
        y, _ = v5.process(ROLE[name], x)
    return y[:, v5.LN:2 * v5.LN].astype(np.float32)


def dec(path):
    d = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(d, np.float32).reshape(-1, 2).T.astype(np.float64)


def v5_loop(name):
    y = dec(os.path.join(V5_DIR, name + '.ogg')); p = int(PAD * SR); LN16 = int(round(16 * BAR * SR))
    return y[:, p:p + LN16]


def seed(name):
    """every stem gets its own fixed humanising / variation seeds, so any stem can be re-rendered alone"""
    global Q
    h = sum((i + 1) * ord(c) for i, c in enumerate(name))
    v5.R = np.random.default_rng(1000 + h); Q = np.random.default_rng(606 + h)


def cached(name, make):
    """S3_REBUILD=all (default) renders everything; S3_REBUILD=mel,bkeys re-renders those and reuses the rest from WORK"""
    reb = os.environ.get('S3_REBUILD', 'all').split(',')
    f = os.path.join(WORK, '_c_%s.npy' % name)
    if 'all' not in reb and name not in reb and not (name.startswith('mel-') and 'mel' in reb) and os.path.exists(f):
        return np.load(f)
    seed(name); y = make(); np.save(f, y.astype(np.float32)); return y


def build():
    global CAP
    os.makedirs(WORK, exist_ok=True); v5.irs()
    CAP = capture_v5()
    v5_drums = v5_loop('drums'); LN16 = v5_drums.shape[1]
    g0 = 10 ** ((v5.loud(v5_drums) - v5.LUFS['drums']) / 20)          # the v5 files carry a global gain: recover it
    print('  v5 global gain g0 = %.4f' % g0)
    loops, info = {}, {}
    for name, fn in (('drums', None), ('bass', p_bass), ('gtr', p_gtr), ('keys', p_keys), ('organ', p_organ), ('horns', p_horns)):
        y = cached(name, lambda: proc(name, p_drums() if name == 'drums' else np.atleast_2d(fn()), NB[name]))
        ref = v5_loop(name)
        k = 10 ** ((v5.loud(ref) - v5.loud(y[:, :LN16])) / 20)        # bars 1-16 at exactly the v5 file level
        y = y * k
        a, b = y[:, int(2 * SR):LN16 - int(2 * SR)].mean(axis=0), ref[:, int(2 * SR):LN16 - int(2 * SR)].mean(axis=0)
        corr = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-12))
        loops[name] = y; info[name] = dict(bars=NB[name], v5_match_corr=round(corr, 4), level_db=round(20 * np.log10(k), 2))
        print('  %-8s %2d bars  bars 1-16 vs v5: correlation %.4f  LUFS(new bars) %.1f  v5 %.1f' %
              (name, NB[name], corr, v5.loud(y[:, LN16:]), v5.loud(ref)))
    for name, fn in (('bdrums', p_bdrums), ('bbass', p_bbass), ('bkeys', p_bkeys), ('bhorn', p_bhorn), ('shout', p_shout)):
        def make(fn=fn, name=name):
            x = fn(); x = x if isinstance(x, tuple) else np.atleast_2d(x); return proc(name, x, NB[name])
        loops[name] = cached(name, make) * g0; info[name] = dict(bars=NB[name])
        print('  %-8s %2d bars  LUFS %.1f' % (name, NB[name], v5.loud(loops[name])))
    for v in ['theme'] + PRODUCTS:
        loops['mel-' + v] = cached('mel-' + v, lambda v=v: proc('mel-' + v, p_lead(v), NB['mel'])[:1]) * g0
        print('  mel-%-16s LUFS %.1f' % (v, v5.loud(loops['mel-' + v])))
    return loops, info, g0


def at(x, n, off=0):
    """loop x (ch, len) read for n samples from clock sample off"""
    return x[:, (np.arange(n) + off) % x.shape[1]]


def mixdown(st, gains, mel, n, off=0):
    out = np.zeros((2, n))
    for b in BEDS:
        if gains.get(b, 0): out += v5.stereo(at(st[b], n, off)) * gains[b]
    if gains.get('mel', 0): out += v5.stereo(at(st['mel-' + mel], n, off)) * gains['mel']
    return out


V5ZONES = {z['id']: z for z in json.load(open(os.path.join(V5_DIR, 'mix.json')))['zones']}
G = dict(drums=1.0, bass=1.0, gtr=1.0, keys=1.0, organ=1.0, horns=1.0)
STORY = [   # id, where, gains (None = the v5 opening mix, untouched), LUFS target
    ('hero', None, None, None), ('bass', None, None, None), ('guitar', None, None, None), ('keys', None, None, None), ('horns', None, None, None),
    ('work',       dict(sel='#work .devices', at=0.12),         dict(G, mel=1.0), -16.0),
    ('identity',   dict(sel='#identity', at=0.0),               dict(drums=1.0, bass=1.15), -17.6),
    ('experience', dict(sel='#experience', at=0.0),             dict(bdrums=1.0, bbass=1.0, bkeys=1.05), -17.2),
    ('about',      dict(sel='#about', at=0.0),                  dict(bdrums=1.0, bbass=1.0, bkeys=0.9, bhorn=1.05), -16.6),
    ('forest',     dict(sel='#contact', at=0.0),                dict(bass=0.9, gtr=0.55, keys=1.15, organ=1.2), -19.0),
    ('contact',    dict(sel='#contact .contact-inner', at=0.0), dict(G, drums=1.05, horns=0.9, mel=0.75, shout=1.1), -15.8),
]
PAGE = (dict(G, drums=0.85, horns=0.6, mel=1.0), -17.0)


def stems():
    loops, info, g0 = build()
    st = loops
    n = int(round(40 * BAR * SR))                        # zone loudness measured over 40 bars of the polymetric band
    zones_out, cal = [], {}
    for zid, where, gains, target in STORY + [('page', None, PAGE[0], PAGE[1])]:
        if gains is None:
            z = V5ZONES[zid]; mix = {k: z['mix'].get(k, 0.0) for k in BEDS + ['mel']}
            x = mixdown(st, mix, 'theme', n)
            print('  zone %-11s (v5 mix)  LUFS %6.2f TP %6.2f' % (zid, v5.loud(x), v5.tp_db(x)))
            zones_out.append(dict({k: z[k] for k in z if k != 'mix'}, mix=mix)); continue
        mels = ['theme'] + PRODUCTS if zid in ('work', 'page') else ['theme']
        res = []
        for m in mels: x = mixdown(st, gains, m, n); res.append((v5.loud(x), v5.tp_db(x)))
        lu = np.mean([r[0] for r in res]); tp = max(r[1] for r in res)
        mk = 10 ** (min(target - lu, -1.5 - tp) / 20)
        mix = {k: round(gains.get(k, 0.0) * mk, 4) for k in BEDS + ['mel']}
        cal[zid] = mix
        print('  zone %-11s LUFS %6.2f TP %6.2f' % (zid, lu + 20 * np.log10(mk), tp + 20 * np.log10(mk)))
        if where is not None: zones_out.append(dict(id=zid, **where, mix=mix))
    os.makedirs(REPO_OUT, exist_ok=True); p = int(PAD * SR)
    for name, c in st.items():
        f = np.concatenate([c[:, -p:], c, c[:, :p]], axis=1)
        w = os.path.join(WORK, name + '.wav'); sf.write(w, f.T, SR, subtype='FLOAT')
        mono = f.shape[0] == 1
        ob, ab = ('40k', '56k') if mono else (('56k', '96k') if name in ('drums', 'bdrums') else ('48k', '80k'))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'libopus', '-b:a', ob, '-vbr', 'constrained', '-application', 'audio',
                        os.path.join(REPO_OUT, name + '.ogg')], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'aac', '-b:a', ab, '-aac_pns', '0', '-movflags', '+faststart',
                        os.path.join(REPO_OUT, name + '.m4a')], check=True)
    for ext in ('ogg', 'm4a'): shutil.copyfile(os.path.join(V5_DIR, 'fill.' + ext), os.path.join(REPO_OUT, 'fill.' + ext))   # the v5 intro fill
    loopsec = {k: round(v.shape[1] / SR, 4) for k, v in st.items()}
    cfg = {'stems': {'loop': loopsec['drums'], 'loops': loopsec, 'bar': round(BAR, 5), 'pad': PAD, 'beds': BEDS, 'melody': 'mel-theme',
                     'fill': 'fill', 'core': ['drums']},
           'zones': zones_out, 'page': cal['page'], 'info': info,
           'products': {k: {'match': 'work/%s.html' % k, 'file': 'mel-' + k} for k in PRODUCTS}}
    json.dump(cfg, open(os.path.join(REPO_OUT, 'mix.json'), 'w'), indent=1)
    print(json.dumps(cfg['stems']))

# ------------------------------------------------------------------ demo: one scroll down the whole page


def demo():
    cfg = json.load(open(os.path.join(REPO_OUT, 'mix.json')))
    z = {d['id']: d['mix'] for d in cfg['zones']}; z['page'] = cfg['page']
    p = int(PAD * SR); st = {}
    for name in BEDS + ['mel-' + v for v in ['theme'] + PRODUCTS]:
        y, _ = sf.read(os.path.join(WORK, name + '.wav'), always_2d=True); y = y.T
        st[name] = v5.stereo(y[:, p:y.shape[1] - p])
    fy, _ = sf.read(os.path.join(WORK, '_fill.wav'), always_2d=True) if os.path.exists(os.path.join(WORK, '_fill.wav')) else (None, None)
    if fy is None:
        fy = dec(os.path.join(V5_DIR, 'fill.ogg')).T
    fill = v5.stereo(fy.T)
    plan = [(3, 'hero', 'theme'), (3, 'bass', 'theme'), (3, 'guitar', 'theme'), (3, 'keys', 'theme'), (3, 'horns', 'theme'),
            (4, 'work', 'theme'), (2, 'work', 'shomer'), (2, 'work', 'lickpick'), (2, 'work', 'trashure-hunters'), (2, 'work', 'fairent'),
            (5, 'identity', 'theme'), (6, 'experience', 'theme'), (6, 'about', 'theme'), (4, 'forest', 'theme'), (10, 'contact', 'theme')]
    bars = []
    for nbars, zid, mel in plan: bars += [(zid, mel)] * nbars
    nb = len(bars); t0 = BAR; N = int((t0 + nb * BAR + 1.5) * SR)
    def loopseg(x): return x[:, (np.arange(N) - int(t0 * SR)) % x.shape[1]]
    out = np.zeros((2, N)); k = min(N, fill.shape[1]); out[:, :k] += fill[:, :k] * z['hero']['drums']
    def env(fn, lead=0.0, ramp=1.0):
        e = np.zeros(N); cur = 0.0
        for i, (zid, mel) in enumerate(bars):
            v = fn(zid, mel); a = int((t0 + i * BAR - lead) * SR); b = int((t0 + (i + 1) * BAR - lead) * SR); r = np.arange(b - a) / SR
            seg = np.where(r < ramp, cur + (v - cur) * r / ramp, v); e[max(0, a):b] = seg[max(0, -a):]; cur = v
        e[int((t0 + nb * BAR - lead) * SR):] = cur
        return e
    for b in BEDS:
        if any(z[zid].get(b, 0) for zid, _ in bars): out += loopseg(st[b]) * env(lambda zid, mel, b=b: z[zid].get(b, 0))
    for v in ['theme'] + PRODUCTS:
        if any(m == v for _, m in bars):
            out += loopseg(st['mel-' + v]) * env(lambda zid, mel, v=v: z[zid].get('mel', 0) if mel == v else 0.0, lead=0.6, ramp=0.6)
    y = v5.master(out)
    fo = int(3.0 * SR); y[:, -fo:] *= np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
    os.makedirs(DEMO_DIR, exist_ok=True)
    wav = os.path.join(WORK, '_demo.wav'); sf.write(wav, y.T, SR, subtype='FLOAT')
    mp3 = os.path.join(DEMO_DIR, 'score-v6-demo.mp3')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '256k', mp3], check=True)
    v5.report(mp3, 'demo')
    marks, tt = [], t0
    for nbars, zid, mel in plan: marks.append('%5.1fs %s%s' % (tt, zid, '' if mel == 'theme' else ' (' + mel + ')')); tt += nbars * BAR
    print('  timeline: ' + ' | '.join(marks))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if cmd in ('stems', 'all'): stems()
    if cmd in ('demo', 'all'): v5.irs(); demo()
