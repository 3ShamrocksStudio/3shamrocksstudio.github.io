"""3Shamrocks Studio Score v3: "Three Leaves" - one studio theme, played as sample-aligned stems.

One song for the whole homepage: 100 BPM, D dorian (Celtic minor with the bright B natural), 16 bars = 38.4 s.
Zones change the MIX of the same song (which bed stems are up), never the song. In the portfolio each product swaps in
its own melody stem: the same theme with a slight variation (lead timbre, one ornament, one changed note).

Sound: sampled instruments from the GeneralUser GS SoundFont (free licence, S. Christian Collins), rendered offline with
tinysoundfont, then mixed and mastered with pedalboard (EQ, compression, kick-keyed ducking, convolution hall, limiter).

Bed stems (stereo): drums, bass, keys (pads, slow strings, piano), pulse (3-3-2 staccato strings + strummed guitar),
texture (harp arpeggios, celesta "three leaves" echoes, halo pad), lift (horns, brass, choir, timpani, high strings).
Melody stems (mono): mel-theme + one per product.

  python3 score_v3.py            -> render, master, encode everything to OUT, print loudness + zone mix JSON
  python3 score_v3.py demo       -> 70 s listening demo (needs the stems from the step above)
Requires: tinysoundfont, pedalboard, pyloudnorm, soundfile, numpy, scipy, ffmpeg; SF2 path in SF (env S3_SF2)."""
import os, sys, json, subprocess
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
import pedalboard as pb
import tinysoundfont as tsf
from scipy import signal

SF = os.environ.get('S3_SF2', '/home/claude/mrbumpy409/generaluser-gs/GeneralUser-GS.sf2')
OUT = os.environ.get('S3_OUT', '/dev/shm/s3studio/v3')
REPO_OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'studio', 'v3')
os.makedirs(OUT, exist_ok=True)
SR = 44100
BPM = 100.0
BEAT = 60.0 / BPM            # 0.6 s
BAR = 4 * BEAT               # 2.4 s
NBARS = 16
L = NBARS * BAR              # 38.4 s
LN = int(round(L * SR))      # 1,693,440 samples
PAD = 0.5                    # file = last PAD s of loop + loop + first PAD s; the player loops PAD .. PAD + L
R = np.random.default_rng(3)

# ------------------------------------------------------------------ harmony (D dorian)
CH = ['Dm', 'C', 'G', 'Dm', 'Dm', 'C', 'G', 'A', 'F', 'C', 'G', 'Dm', 'Bb', 'C', 'G', 'A']
ROOT = {'Dm': 38, 'C': 36, 'G': 31, 'A': 33, 'Asus': 33, 'F': 41, 'Bb': 34}            # bass roots (D2, C2, G1 ...)
PAD_V = {'Dm': [50, 57, 62, 64, 65], 'C': [48, 55, 64, 67], 'G': [55, 59, 62, 67], 'A': [57, 61, 64, 69],
         'Asus': [57, 62, 64, 69], 'F': [53, 60, 65, 69], 'Bb': [53, 58, 62, 65]}
GTR_V = {'Dm': [50, 57, 62, 65], 'C': [48, 52, 55, 60, 64], 'G': [43, 47, 50, 55, 59], 'A': [45, 52, 57, 61, 64],
         'Asus': [45, 52, 57, 62, 64], 'F': [41, 48, 53, 57, 60], 'Bb': [46, 53, 58, 62]}
TONES = {'Dm': [2, 5, 9], 'C': [0, 4, 7], 'G': [7, 11, 2], 'A': [9, 1, 4], 'Asus': [9, 2, 4], 'F': [5, 9, 0], 'Bb': [10, 2, 5]}
FIFTH = {'Dm': 45, 'C': 43, 'G': 38, 'A': 40, 'Asus': 40, 'F': 48, 'Bb': 41}


def chord_at(bar, half):
    c = CH[bar]
    return 'Asus' if (c == 'A' and half == 0) else c


def tones_in(c, lo, hi):
    return [m for m in range(lo, hi + 1) if m % 12 in TONES[c]]

# ------------------------------------------------------------------ the theme (eighth notes per bar)
# Bar 1 is the signature: three rising "leaves" D-E-F, then the winning leap to A (the resolution).
THEME = [
    [(74, 1), (76, 1), (77, 2), (81, 3), (79, 1)],
    [(76, 2), (72, 1), (74, 1), (76, 2), (79, 2)],
    [(74, 2), (71, 1), (74, 1), (79, 3), (81, 1)],
    [(77, 2), (76, 1), (74, 1), (69, 4)],
    [(74, 1), (76, 1), (77, 2), (81, 3), (84, 1)],
    [(79, 3), (76, 1), (72, 2), (76, 2)],
    [(74, 2), (71, 1), (74, 1), (79, 2), (77, 1), (76, 1)],
    [(76, 3), (74, 1), (73, 2), (69, 2)],
    [(77, 1), (79, 1), (81, 2), (84, 3), (81, 1)],
    [(79, 3), (76, 1), (72, 2), (79, 2)],
    [(79, 1), (81, 1), (83, 2), (86, 3), (83, 1)],
    [(81, 4), (77, 2), (74, 2)],
    [(74, 1), (77, 1), (82, 2), (81, 3), (77, 1)],
    [(79, 2), (76, 1), (79, 1), (84, 4)],
    [(83, 2), (81, 1), (79, 1), (74, 2), (79, 2)],
    [(81, 3), (79, 1), (76, 2), (73, 2)],
]


def theme_notes(changes=None):
    """-> list of [start_eighth, dur_eighth, midi, bar, idx] for 16 bars; changes: {(bar, idx): midi}"""
    out = []
    for b, bar in enumerate(THEME):
        p = 0.0
        for i, (m, d) in enumerate(bar):
            if changes and (b, i) in changes: m = changes[(b, i)]
            out.append([b * 8 + p, float(d), m, b, i])
            p += d
    return out


def last_idx(b): return len(THEME[b]) - 1

# Each product variation: lead timbre, transpose, ornament style, the changed note(s).
#   theme            flute (+ soft harp doubling), Celtic cuts on the leap notes
#   shomer           French horns an octave down, legato, no ornaments; bar 4 resolves up to D instead of falling to A
#   lickpick         clean electric guitar an octave down, a hammer-on into each leap; final note hangs on E
#   trashure-hunters ocarina, trills on the long leap notes; bar 12 climbs to A instead of settling on D
#   chore-royale     pizzicato strings + a touch of glockenspiel, dotted "regal" leaves; final note lifts to high C#
#   fairent          vibraphone, plain and even; bar 8 lands on E (an open question) instead of A
#   concepts         fiddle with cuts and rolls; bar 4 ends on F instead of A
VARIANTS = {
    'theme':            dict(prog=[(73, 0, 92)], double=[(46, -12, 50)], orn='cut', orn_bars={0, 4, 8, 10}, changes={}),
    'shomer':           dict(prog=[(60, -12, 96)], orn=None, legato=1.0, changes={(3, last_idx(3)): 74}),
    'lickpick':         dict(prog=[(27, -12, 98)], eq=[pb.LowpassFilter(4200), pb.PeakFilter(2600, -3.0, 0.8)], orn='hammer', orn_bars={0, 4, 8, 12}, staccato=0.85, changes={(15, last_idx(15)): 76}),
    'trashure-hunters': dict(prog=[(79, 0, 90)], orn='trill', orn_bars={0, 4, 8, 10}, changes={(11, last_idx(11)): 81}),
    'chore-royale':     dict(prog=[(45, 0, 104)], double=[(9, 0, 26)], double_bars={0, 4, 8, 10, 12}, orn='dotted', orn_bars={0, 4, 8, 12},
                             staccato=0.55, changes={(15, last_idx(15)): 85}),
    'fairent':          dict(prog=[(11, 0, 96)], orn=None, changes={(7, last_idx(7)): 76}),
    'concepts':         dict(prog=[(110, 0, 84)], eq=[pb.PeakFilter(2900, -7.0, 0.6), pb.LowpassFilter(4500), pb.PeakFilter(700, 1.5, 0.8)], orn='cut', orn_bars={0, 1, 3, 4, 8, 10, 11, 13}, roll_bars={3, 11},
                             changes={(3, last_idx(3)): 77}),
}

# ------------------------------------------------------------------ rendering
E8 = BEAT / 2


class Part:
    def __init__(self):
        self.notes = []   # (t_sec, dur_sec, chan, key, vel)
        self.ccs = []     # (t_sec, chan, cc, val)
        self.progs = {}   # chan -> (bank, preset, drums)

    def prog(self, ch, preset, bank=0, drums=False): self.progs[ch] = (bank, preset, drums)

    def n(self, t, d, ch, key, vel, jit=0.006, vj=6):
        t += R.uniform(-jit, jit) if jit else 0.0
        vel = int(np.clip(vel + (R.integers(-vj, vj + 1) if vj else 0), 1, 127))
        self.notes.append((max(0.0, t) % L, max(0.03, d), ch, int(key), vel))

    def cc(self, t, ch, c, v): self.ccs.append((t % L, ch, c, int(np.clip(v, 0, 127))))


def render(part, cycles=3, tail=6.0):
    """Render the part looping `cycles` times; identical events each cycle so the middle cycle is a seamless loop."""
    s = tsf.Synth(samplerate=SR, gain=-3)
    sfid = s.sfload(SF)
    for ch, (bank, preset, drums) in part.progs.items():
        s.program_select(ch, sfid, 128 if drums else bank, preset, is_drums=drums)
    ev = []
    for c in range(cycles):
        off = c * L
        for (t, d, ch, k, v) in part.notes:
            ev.append((int((off + t) * SR), 2, ch, k, v))
            ev.append((int((off + t + d) * SR), 0, ch, k, 0))
        for (t, ch, cc, v) in part.ccs:
            ev.append((int((off + t) * SR), 1, ch, cc, v))
    ev.sort(key=lambda e: (e[0], e[1]))
    total = int((cycles * L + tail) * SR)
    out = np.zeros((total, 2), np.float32)
    pos = 0
    for (smp, kind, ch, k, v) in ev:
        smp = min(smp, total)
        if smp > pos:
            out[pos:smp] = np.frombuffer(s.generate(smp - pos), dtype=np.float32).reshape(-1, 2)
            pos = smp
        if kind == 2: s.noteon(ch, k, v)
        elif kind == 0: s.noteoff(ch, k)
        else: s.control_change(ch, k, v)
    if pos < total:
        out[pos:] = np.frombuffer(s.generate(total - pos), dtype=np.float32).reshape(-1, 2)
    return out.T.copy()   # (2, n)


def hall_ir(path, secs=2.6, decay=1.15, pre=0.018, bright=5500, seed=7):
    """Synthetic stereo hall: decorrelated noise, exponential decay, darkening tail, early reflections."""
    if os.path.exists(path): return path
    rg = np.random.default_rng(seed)
    n = int(secs * SR); t = np.arange(n) / SR
    ir = np.zeros((n, 2), np.float32)
    for c in range(2):
        x = rg.standard_normal(n) * np.exp(-t * 6.9 / decay)
        lo = signal.sosfilt(signal.butter(1, 900, 'lowpass', fs=SR, output='sos'), x)
        hi = signal.sosfilt(signal.butter(2, bright, 'lowpass', fs=SR, output='sos'), x)
        mixw = np.exp(-t / (decay * 0.35))
        y = hi * mixw + lo * (1 - mixw) * 1.6
        y[: int(pre * SR)] = 0
        for d, g in ((0.011, 0.5), (0.017, 0.35), (0.023, 0.3), (0.031, 0.22)):
            y[int((d + c * 0.0037) * SR)] += g
        ir[:, c] = y
    ir /= np.sqrt((ir ** 2).sum(axis=0)).max()
    sf.write(path, ir, SR, subtype='FLOAT')
    return path


IR = hall_ir(os.path.join(OUT, '_hall.wav'))
IR_PLATE = hall_ir(os.path.join(OUT, '_plate.wav'), secs=1.6, decay=0.75, pre=0.008, bright=7500, seed=11)


def fx(x, chain):
    return pb.Pedalboard(chain)(x.astype(np.float32), SR)


def send(x, ir, wet, hp=250, lp=None):
    """parallel reverb send (100% wet convolution, filtered) mixed in at `wet`"""
    chain = [pb.HighpassFilter(hp)]
    if lp: chain.append(pb.LowpassFilter(lp))
    chain.append(pb.Convolution(ir, mix=1.0))
    w = fx(x, chain)
    return x + w * wet


def duck_env(n_total, depth, rel=0.16, cycles=3):
    """kick-keyed ducking envelope (same kick times as the drum part) for pads/strums"""
    env = np.ones(n_total, np.float32)
    t = np.arange(int(0.6 * SR)) / SR
    shape = 1 - depth * np.where(t < 0.006, t / 0.006, np.exp(-(t - 0.006) / rel))
    for c in range(cycles):
        for kt in KICKS:
            i = int((c * L + kt) * SR)
            j = min(n_total, i + len(shape))
            env[i:j] = np.minimum(env[i:j], shape[: j - i])
    return env

# ------------------------------------------------------------------ parts
KICKS = []


def p_drums():
    p = Part(); p.prog(9, 8, drums=True)       # GM "Room" kit: warm, punchy, not gated
    S16 = BEAT / 4
    for b in range(NBARS):
        t0 = b * BAR
        kicks = [0, 6, 8] + ([11] if b % 2 else [])
        fill8 = b in (7,)
        fill16 = b == 15
        if fill16: kicks = [0, 6, 8]
        for k in kicks:
            p.n(t0 + k * S16, 0.2, 9, 36, 112 if k in (0, 8) else 96, jit=0.003, vj=4)
            if b == 0 or True:
                pass
        for k in kicks:
            KICKS.append(t0 + k * S16)
        # backbeat: snare + a soft clap layer, laid back by ~8 ms
        for k in (4, 12):
            if fill16 and k == 12: continue
            p.n(t0 + k * S16 + 0.008, 0.2, 9, 38, 92, jit=0.004)
            p.n(t0 + k * S16 + 0.012, 0.2, 9, 39, 44, jit=0.004)
            p.n(t0 + k * S16 + 0.006, 0.2, 9, 54, 34, jit=0.004)   # tambourine, quiet
        for k in (7, 15):
            if R.random() < 0.6 and not (fill8 and k == 15) and not fill16:
                p.n(t0 + k * S16 + 0.01, 0.1, 9, 38, 24, vj=4)      # ghost notes
        # shaker on 8ths, offbeats lifted; a couple of soft 16th ghosts. No hi-hat wash.
        for k in range(0, 16, 2):
            p.n(t0 + k * S16, 0.1, 9, 82, 46 if k % 4 else 32, jit=0.005, vj=5)
        for k in (3, 11):
            p.n(t0 + k * S16, 0.1, 9, 82, 20, vj=3)
        if b in (0, 8):
            p.n(t0, 1.5, 9, 49, 64 if b == 0 else 56)
        if fill8:
            for k, tom in zip((12, 13, 14, 15), (50, 48, 47, 45)):
                p.n(t0 + k * S16, 0.2, 9, tom, 64 + (k - 12) * 6)
        if fill16:
            for k in (8, 10):
                p.n(t0 + k * S16 + 0.006, 0.2, 9, 38, 72 + k)
            for k, tom in zip((12, 13, 14, 15), (48, 47, 45, 41)):
                p.n(t0 + k * S16, 0.2, 9, tom, 74 + (k - 12) * 8)
            p.n(t0 + 14 * S16, 0.2, 9, 36, 100)
    return p


def p_bass():
    p = Part(); p.prog(0, 33)   # finger bass
    pat = [(0, 1.4, 'R', 108), (1.5, 0.45, 'R', 80), (2, 0.9, 'R', 92), (3, 0.9, 'R', 84),
           (4, 1.4, 'R', 104), (5.5, 0.45, 'R', 78), (6, 0.9, '5', 90), (7, 0.9, 'O', 86)]
    for b in range(NBARS):
        for (e, d, w, v) in pat:
            c = chord_at(b, 0 if e < 4 else 1)
            r = ROOT[c]
            k = r if w == 'R' else (FIFTH[c] if w == '5' else r + 12)
            if b in (7, 15) and e >= 6:   # walk back home: E -> C# leading into D
                k = 40 if e == 6 else 37
            p.n(b * BAR + e * E8, d * E8, 0, k, v, jit=0.004, vj=5)
    return p


def p_keys():
    p = Part(); p.prog(0, 89); p.prog(1, 49); p.prog(2, 0)
    for b in range(NBARS):
        for h in (0, 1):
            c = chord_at(b, h)
            if h == 1 and CH[b] != 'A': continue
            t = b * BAR + h * 2 * BEAT
            d = (2 * BEAT if CH[b] == 'A' else BAR) + 0.05
            for k in PAD_V[c]:
                p.n(t, d, 0, k, 58, jit=0.0, vj=3)
            for k in PAD_V[c][-2:]:
                p.n(t + 0.02, d, 1, k + 12, 50, jit=0.0, vj=3)
        # soft piano: chord on 1 and the "and" of 2 (follows the kick)
        for (e, v) in ((0, 52), (3, 40)):
            c = chord_at(b, 0)
            for i, k in enumerate(PAD_V[c][1:]):
                p.n(b * BAR + e * E8 + i * 0.006, 1.6 * E8, 2, k, v, jit=0.003, vj=4)
    return p


def p_pulse():
    p = Part(); p.prog(0, 48); p.prog(1, 25)
    # staccato strings ostinato, 3-3-2 accents (the drive)
    shape = ['R', 'R', '5', 'R', 'O', 'R', '5', 'R']
    for b in range(NBARS):
        for e in range(8):
            c = chord_at(b, 0 if e < 4 else 1)
            r = ROOT[c] + 12
            if r < 45: r += 12
            k = {'R': r, '5': r + 7, 'O': r + 12}[shape[e]]
            v = 88 if e in (0, 3, 6) else 56
            p.n(b * BAR + e * E8, 0.32 * E8, 0, k, v, jit=0.004, vj=5)
        # strummed steel guitar: downstrokes on the 3-3-2 accents, light upstrokes between
        for (e, down, v, dur) in ((0, 1, 70, 1.8), (2, 0, 42, 0.9), (3, 1, 64, 1.8), (5, 0, 40, 0.9), (6, 1, 62, 1.0), (7, 0, 44, 0.9)):
            c = chord_at(b, 0 if e < 4 else 1)
            v_ = GTR_V[c] if down else GTR_V[c][-3:][::-1]
            for i, k in enumerate(v_):
                p.n(b * BAR + e * E8 + i * (0.011 if down else 0.008), dur * E8, 1, k, v - i * 2, jit=0.003, vj=4)
    return p


def p_texture():
    p = Part(); p.prog(0, 46); p.prog(1, 8); p.prog(2, 94)
    for b in range(NBARS):
        for e in range(8):
            c = chord_at(b, 0 if e < 4 else 1)
            pool = tones_in(c, 50, 81)
            seq = pool[: 6] + pool[4:2:-1] if len(pool) >= 6 else pool
            k = seq[e % len(seq)]
            p.n(b * BAR + e * E8, 2.5 * E8, 0, k, 58 if e % 4 == 0 else 46, jit=0.007, vj=6)
        c0 = chord_at(b, 0)
        for k in [m + 12 for m in PAD_V[c0][-2:]]:
            p.n(b * BAR, BAR + 0.05, 2, k, 38, jit=0.0, vj=2)
        if b in (3, 11):      # celesta echo of the three leaves
            for i, k in enumerate((86, 88, 89, 93)):
                p.n(b * BAR + (4 + i) * E8, 1.5 * E8, 1, k, 44 - i * 2)
        if b in (7, 15):
            for i, k in enumerate((81, 85, 88, 93)):
                p.n(b * BAR + (4 + i) * E8, 1.5 * E8, 1, k, 42 - i * 2)
    return p


COUNTER = [77, 76, 74, 77, 81, 79, 79, 76, 81, 79, 79, 77, 82, 79, 79, 76]


def p_lift():
    p = Part(); p.prog(0, 60); p.prog(1, 61); p.prog(2, 52); p.prog(3, 47); p.prog(4, 49)
    for b in range(NBARS):
        t = b * BAR
        c = chord_at(b, 0)
        hv = [k for k in PAD_V[c][:4]]
        for k in hv:
            p.n(t, BAR + 0.05, 0, k - 12 if k > 60 else k, 72, jit=0.0, vj=3)
        for i in range(8):     # horn swell across each bar
            p.cc(t + i * BAR / 8, 0, 11, 70 + i * 6)
        for k in PAD_V[c][1:]:
            p.n(t + 0.01, BAR + 0.05, 2, k + 12, 50 if b < 8 else 62, jit=0.0, vj=3)
        p.n(t, BAR + 0.05, 4, COUNTER[b], 64, jit=0.0, vj=3)
        p.n(t, BAR + 0.05, 4, COUNTER[b] - 12, 52, jit=0.0, vj=3)
        if b >= 8:              # brass hits on the 3-3-2 of the B section
            for (e, v) in ((0, 84), (3, 70), (6, 74)):
                for k in GTR_V[chord_at(b, 0 if e < 4 else 1)][-3:]:
                    p.n(t + e * E8, 1.2 * E8, 1, k + (12 if k < 55 else 0), v)
        if b % 4 == 0:
            p.n(t, 1.0, 3, 38 if CH[b] != 'F' else 41, 96)
        if b == 7:
            p.n(t + 6 * E8, 0.6, 3, 33, 90)
    for i in range(8):         # timpani roll into the top of the loop
        p.n(15 * BAR + 3 * BEAT + i * BEAT / 8, 0.1, 3, 33, 50 + i * 8, jit=0.0, vj=3)
    return p


def p_melody(name):
    v = VARIANTS[name]
    p = Part()
    for i, (prog, tr, vel) in enumerate(v['prog'] + v.get('double', [])):
        p.prog(i, prog)
    notes = theme_notes(v.get('changes'))
    legato = v.get('legato', 0.94)
    stac = v.get('staccato', None)
    orn, ob = v.get('orn'), v.get('orn_bars', set())
    rolls = v.get('roll_bars', set())
    dbars = v.get('double_bars', None)
    for idx, (st, du, m, b, i) in enumerate(notes):
        long_note = du >= 2
        # phrase shaping: lift into the leap, relax on the cadences
        shape = 1.0 + (0.06 if du >= 3 else 0) - (0.08 if i == len(THEME[b]) - 1 and du >= 2 else 0)
        segs = [(st, du, m, 1.0)]
        if orn == 'cut' and b in ob and du >= 2:
            g = 0.18
            segs = [(st, g, m + (2 if (m + 2) % 12 in (0, 2, 4, 5, 7, 9, 11) else 1), 0.7), (st + g, du - g, m, 1.0)]
        elif orn == 'hammer' and b in ob and i == 2:
            segs = [(st, du / 2, m, 1.0), (st + du / 2, du / 2, m + 2, 0.85)]
        elif orn == 'trill' and b in ob and du >= 3:
            n = 6
            segs = [(st + j * (1.5 / n), 1.5 / n, m + (2 if j % 2 else 0), 0.85) for j in range(n)] + [(st + 1.5, du - 1.5, m, 0.95)]
        elif orn == 'dotted' and b in ob and i in (0, 1):
            segs = [(st, 1.5, m, 1.05)] if i == 0 else [(st + 0.5, 0.5, m, 0.85)]
        if b in rolls and i == len(THEME[b]) - 1:
            g = 0.25
            segs = [(st, g, m + 2, 0.7), (st + g, g, m, 0.8), (st + 2 * g, g, m - 1 if (m - 1) % 12 in (1, 11, 4) else m - 2, 0.7), (st + 3 * g, du - 3 * g, m, 1.0)]
        for (s0, d0, k, vm) in segs:
            dur = d0 * (stac if stac else legato)
            for ch, (prog, tr, vel) in enumerate(v['prog'] + v.get('double', [])):
                if ch >= len(v['prog']) and dbars is not None and b not in dbars: continue
                p.n(s0 * E8, dur * E8, ch, k + tr, vel * vm * shape, jit=0.008, vj=5)
    return p

# ------------------------------------------------------------------ processing per stem
LUFS_ROLE = {'drums': -19.5, 'bass': -21.0, 'keys': -22.5, 'pulse': -24.0, 'texture': -24.5, 'lift': -21.5, 'mel': -23.0}
CREST = {'drums': 15.0, 'bass': 12.0, 'mel': 13.0, 'lift': 14.0}
meter = pyln.Meter(SR)


def loud(x):
    return meter.integrated_loudness(x.T if x.ndim == 2 else x)


def to_role(x, role):
    g = 10 ** ((LUFS_ROLE[role] - loud(x[:, LN:2 * LN] if x.ndim == 2 else x[LN:2 * LN])) / 20)
    return x * g


def process(name, x):
    n = x.shape[1]
    if name == 'drums':
        x = fx(x, [pb.HighpassFilter(30), pb.LowShelfFilter(80, 2.5), pb.PeakFilter(420, -2.5, 0.9), pb.PeakFilter(3200, -2.0, 0.8),
                   pb.HighShelfFilter(9000, -2.0), pb.Compressor(-20, 3.0, 8, 120)])
        x = send(x, IR_PLATE, 0.16, hp=400, lp=8000)
    elif name == 'bass':
        x = fx(x, [pb.HighpassFilter(32), pb.LowShelfFilter(90, 2.0), pb.PeakFilter(250, -2.0, 1.0), pb.LowpassFilter(3800),
                   pb.Compressor(-22, 4.0, 10, 140)])
        m = x.mean(axis=0, keepdims=True); x = np.vstack([m, m]) * duck_env(n, 0.15)
    elif name == 'keys':
        x = fx(x, [pb.HighpassFilter(120), pb.PeakFilter(350, -2.5, 0.8), pb.PeakFilter(3000, -3.0, 0.7), pb.HighShelfFilter(7000, -3.0),
                   pb.Compressor(-24, 2.0, 30, 250), pb.Chorus(0.25, 0.15, 7.0, 0.0, 0.25)])
        x = send(x, IR, 0.45, hp=250, lp=7000) * duck_env(n, 0.32)
    elif name == 'pulse':
        x = fx(x, [pb.HighpassFilter(140), pb.PeakFilter(2800, -3.5, 0.8), pb.HighShelfFilter(6500, -3.5), pb.Compressor(-22, 2.5, 10, 160)])
        x = send(x, IR, 0.3, hp=300, lp=6500) * duck_env(n, 0.2)
    elif name == 'texture':
        x = fx(x, [pb.HighpassFilter(160), pb.PeakFilter(3500, -3.0, 0.8), pb.HighShelfFilter(8000, -3.0), pb.Compressor(-24, 2.0, 15, 200)])
        x = send(x, IR, 0.6, hp=300, lp=8000) * duck_env(n, 0.12)
    elif name == 'lift':
        x = fx(x, [pb.HighpassFilter(45), pb.PeakFilter(3000, -3.0, 0.7), pb.HighShelfFilter(7500, -3.0), pb.Compressor(-22, 2.5, 25, 220)])
        x = send(x, IR, 0.5, hp=200, lp=7000)
    else:   # melody: mono, warm, under the bed
        m = x.mean(axis=0, keepdims=True)
        m = fx(m, VARIANTS[name[4:]].get('eq', []) + [pb.HighpassFilter(220), pb.PeakFilter(3400, -4.5, 0.8), pb.HighShelfFilter(7000, -4.0), pb.PeakFilter(1200, -1.0, 1.0),
                   pb.Compressor(-24, 2.5, 12, 180)])
        d = fx(m, [pb.Delay(BEAT * 0.75, 0.25, 1.0), pb.LowpassFilter(3500), pb.HighpassFilter(400)])
        m = m + 0.14 * d
        x = send(m, IR_PLATE, 0.28, hp=350, lp=6500)   # mono plate keeps the stem mono
    role = name if name in LUFS_ROLE else 'mel'
    x = to_role(x, role)
    # cap each stem's crest (peaks no more than CREST dB above its loudness) so the summed zones keep true-peak headroom
    # (pedalboard's Limiter adds make-up gain, so re-level to the role afterwards)
    thr = LUFS_ROLE[role] + CREST.get(role, 14.0)
    return to_role(fx(x, [pb.Limiter(thr, 80)]), role)


def loop_of(x):
    """middle cycle of the 3-cycle render = one seamless loop, then wrap pads for the player"""
    c = x[:, LN:2 * LN]
    p = int(PAD * SR)
    return np.concatenate([c[:, -p:], c, c[:, :p]], axis=1), c

# ------------------------------------------------------------------ zone mixes (same song, different mix)
BEDS = ['drums', 'bass', 'keys', 'pulse', 'texture', 'lift']
ZONES = [
    ('hero',       '.hero',                   dict(drums=0.95, bass=1.0, keys=1.0, pulse=0.7, texture=0.3, lift=0.0, mel=1.0), -16.0),
    ('work',       '#work',                   dict(drums=1.0, bass=1.0, keys=0.8, pulse=1.0, texture=0.0, lift=0.0, mel=1.0), -16.0),
    ('identity',   '#identity',               dict(drums=0.55, bass=0.9, keys=1.0, pulse=0.45, texture=0.5, lift=0.0, mel=0.85), -17.0),
    ('experience', '#experience',             dict(drums=0.4, bass=0.85, keys=1.0, pulse=0.0, texture=0.7, lift=0.0, mel=0.85), -17.5),
    ('about',      '#about',                  dict(drums=0.65, bass=0.9, keys=0.9, pulse=0.75, texture=0.25, lift=0.0, mel=0.85), -17.0),
    ('forest',     '#contact',                dict(drums=0.0, bass=0.45, keys=0.55, pulse=0.0, texture=1.0, lift=0.0, mel=0.6), -19.0),
    ('contact',    '#contact .contact-inner', dict(drums=1.0, bass=1.0, keys=1.0, pulse=0.85, texture=0.35, lift=1.0, mel=1.0), -15.5),
]
PRODUCTS = ['shomer', 'lickpick', 'trashure-hunters', 'chore-royale', 'fairent', 'concepts']
TP_CEIL = -1.5
MEAS_OFFSET = 0.6   # pyloudnorm reads these loops ~0.6 LU hotter than ffmpeg ebur128; targets are ffmpeg's numbers


def tp_db(x):
    up = signal.resample_poly(x, 4, 1, axis=-1)
    return 20 * np.log10(np.abs(up).max() + 1e-12)


def mix(stems, gains, mel='theme'):
    y = 0
    for b in BEDS:
        if gains.get(b, 0) > 0: y = y + stems[b] * gains[b]
    if gains.get('mel', 0) > 0: y = y + stems['mel-' + mel] * gains['mel']
    return y


def build():
    parts = {'drums': p_drums(), 'bass': p_bass(), 'keys': p_keys(), 'pulse': p_pulse(), 'texture': p_texture(), 'lift': p_lift()}
    for v in VARIANTS: parts['mel-' + v] = p_melody(v)
    loops = {}
    for name, part in parts.items():
        x = process(name, render(part))
        f, c = loop_of(x)
        if name.startswith('mel-'):
            f = f[:1]; c = c[:1]
        loops[name] = c
        np.save(os.path.join(OUT, name + '.npy'), f.astype(np.float32))
        print('rendered', name, 'LUFS %.1f' % loud(c if c.shape[0] == 2 else c[0]))
    # stereo views for mixing
    st = {k: (np.vstack([v, v]) if v.shape[0] == 1 else v) for k, v in loops.items()}
    # one global trim so the hero mix sits at -16 LUFS, then per-zone makeup within the true-peak ceiling
    g0 = 10 ** ((-16.0 - loud(mix(st, ZONES[0][2]))) / 20)
    zones_out, report = [], []
    for zid, sel, gains, target in ZONES:
        worst = []
        for mel in (['theme'] + PRODUCTS if zid == 'work' else ['theme']):
            y = mix(st, gains, mel) * g0
            worst.append((loud(y), tp_db(y)))
        lu = np.mean([w[0] for w in worst]); tp = max(w[1] for w in worst)
        mk_db = min(target + MEAS_OFFSET - lu, TP_CEIL - tp)
        mk = 10 ** (mk_db / 20)
        zg = {k: round(v * mk, 4) for k, v in gains.items()}
        zones_out.append({'id': zid, 'sel': sel, 'mix': zg})
        report.append((zid, round(lu + mk_db, 2), round(tp + mk_db, 2)))
    # bake g0 into the stems themselves
    for name in loops:
        f = np.load(os.path.join(OUT, name + '.npy')) * g0
        np.save(os.path.join(OUT, name + '.npy'), f)
        sf.write(os.path.join(OUT, name + '.wav'), f.T, SR, subtype='FLOAT')
    cfg = {'loop': round(L, 4), 'bar': round(BAR, 4), 'pad': PAD, 'beds': BEDS, 'zones': zones_out}
    json.dump(cfg, open(os.path.join(OUT, 'mix.json'), 'w'), indent=1)
    for r in report: print('zone %-11s LUFS %6.2f  TP %6.2f dBTP' % r)
    print(json.dumps(cfg))


def encode():
    os.makedirs(REPO_OUT, exist_ok=True)
    for name in BEDS + ['mel-' + v for v in VARIANTS]:
        w = os.path.join(OUT, name + '.wav')
        mono = name.startswith('mel-')
        ob, ab = ('40k', '64k') if mono else ('64k', '112k')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'libopus', '-b:a', ob, '-vbr', 'constrained', '-application', 'audio',
                        os.path.join(REPO_OUT, name + '.ogg')], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'aac', '-b:a', ab, '-movflags', '+faststart',
                        os.path.join(REPO_OUT, name + '.m4a')], check=True)


def decode(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2).T


def demo(path='/mnt/user-data/outputs/audio/score-v3-demo.mp3', ext='ogg'):
    """hero -> work (shomer, lickpick, trashure-hunters) -> forest -> contact, with the player's bar-grid gain ramps"""
    cfg = json.load(open(os.path.join(OUT, 'mix.json')))
    zm = {z['id']: z['mix'] for z in cfg['zones']}
    p = int(PAD * SR)
    st = {}
    for name in BEDS + ['mel-theme', 'mel-shomer', 'mel-lickpick', 'mel-trashure-hunters']:
        d = decode(os.path.join(REPO_OUT, name + '.' + ext))[:, p:p + LN]
        st[name] = d
    steps = [(0, 'hero', None), (5, 'work', 'shomer'), (9, 'work', 'lickpick'), (13, 'work', 'trashure-hunters'),
             (17, 'forest', None), (22, 'contact', None)]
    nb = 29
    N = int(nb * BAR * SR)
    names = list(st.keys())
    gain = {n: np.zeros(N, np.float32) for n in names}
    cur = {n: 0.0 for n in names}
    for si, (bar, zid, prod) in enumerate(steps):
        nxt = steps[si + 1][0] if si + 1 < len(steps) else nb
        i0, i1 = int(bar * BAR * SR), int(nxt * BAR * SR)
        mixg = zm[zid]
        for n in names:
            if n.startswith('mel-'):
                tgt = mixg['mel'] if n == 'mel-' + (prod or 'theme') else 0.0
                xf = 1.0 if (prod or (si > 0 and steps[si - 1][2])) else 2.0
            else:
                tgt = mixg.get(n, 0.0); xf = 2.0
            if si == 0: cur[n] = tgt
            r = np.arange(i1 - i0) / SR
            gain[n][i0:i1] = cur[n] + (tgt - cur[n]) * np.clip(r / xf, 0, 1)
            cur[n] = tgt
    y = np.zeros((2, N), np.float32)
    for n in names:
        reps = int(np.ceil(N / LN))
        y += np.tile(st[n], reps)[:, :N] * gain[n]
    fade = int(3.0 * SR)
    y[:, -fade:] *= np.cos(np.linspace(0, np.pi / 2, fade)) ** 2
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = os.path.join(OUT, '_demo.wav')
    sf.write(tmp, y.T, SR, subtype='FLOAT')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '192k', path], check=True)
    print('demo', path, '%.1f s' % (N / SR))


if __name__ == '__main__':
    a = sys.argv[1:] or ['all']
    if 'demo' in a: demo()
    elif 'encode' in a: encode()
    else:
        build(); encode()
