"""3Shamrocks Studio homepage music, Score v4: two direction sketches (pick one, then render the full stem set).

Brief (Dave, 9 Nov, after rejecting v3 "sounds like the Shire"): masculine, relaxing, cool vibes, chill tones, matching the
bold, dark game-world site. Portfolio = the same track, only a slight melodic change per product as an indicator.

  A  "Late-night chillhop"   88 BPM, A minor (Am9 Dm9 Fmaj9 E7sus4b9), swung boom-bap (soft synth kick, brush + side stick,
                              quiet shaker), Tine Rhodes with tape wow/flutter and saturation, upright bass + sine sub,
                              vinyl crackle, kick-keyed breathing. Hook: jazz guitar, 3 notes (5 - b7 - 1).
  B  "Dark night drive"      92 BPM, E minor (Em9 Cmaj9 Am9 Bm7), warm filtered detuned-saw pads, pulsing sine/saw sub,
                              soft synth kick + electronic snare with a short gated plate kept low, quiet 8th hats,
                              slow saw-pluck arpeggio low in the mix, night-air texture. Hook: same 3 notes on a mellow
                              filtered saw/square lead with glide.

Never in this score: flute, whistle, harp, fiddle, ocarina, celesta, choir, horns, Celtic/fantasy colour, major-key
cheer, chiptune, bright leads, 1/16 hats.

Every part is 16 bars and loops seamlessly (rendered 3x, the middle cycle is kept). Product melody stems = the same hook
with a timbre swap and/or one changed note.

Usage:
  python3 score_v4.py sketch A|B|both     -> /mnt/user-data/outputs/audio/score-v4-A-chillhop.mp3 / -B-nightdrive.mp3
  python3 score_v4.py stems A|B           -> full stem set + mix.json in assets/audio/studio/v4/ (env S3_REPO_OUT overrides)
Requires: tinysoundfont, pedalboard, pyloudnorm, soundfile, numpy, scipy, ffmpeg; SF2 path in SF (env S3_SF2)."""
import os, sys, json, subprocess
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
import pedalboard as pb
import tinysoundfont as tsf
from scipy import signal

SF = os.environ.get('S3_SF2', '/home/claude/mrbumpy409/generaluser-gs/GeneralUser-GS.sf2')
WORK = os.environ.get('S3_OUT', '/dev/shm/s3studio/v4')
HERE = os.path.dirname(os.path.abspath(__file__))
REPO_OUT = os.environ.get('S3_REPO_OUT', os.path.join(HERE, '..', 'studio', 'v4'))
SKETCH_DIR = os.environ.get('S3_SKETCH', '/mnt/user-data/outputs/audio')
SR = 44100
NBARS = 16
PAD = 0.5
PRODUCTS = ['shomer', 'lickpick', 'trashure-hunters', 'chore-royale', 'fairent', 'concepts']
meter = pyln.Meter(SR)


def mtof(k): return 440.0 * 2 ** ((k - 69) / 12.0)

# ------------------------------------------------------------------ directions
DIRS = {
    'A': dict(
        name='chillhop', bpm=88.0, swing=0.08, key='A minor',
        chords=['Am9', 'Dm9', 'Fmaj9', 'E7sus4b9'],
        voic={'Am9': [55, 59, 60, 64], 'Dm9': [53, 57, 60, 64], 'Fmaj9': [52, 55, 57, 60], 'E7sus4b9': [50, 53, 57, 62]},
        root={'Am9': 33, 'Dm9': 38, 'Fmaj9': 41, 'E7sus4b9': 40},
        fifth={'Am9': 40, 'Dm9': 45, 'Fmaj9': 48, 'E7sus4b9': 47},
        # hook on every even bar: bar%4==0 over the i chord, bar%8==2 / bar%8==6 over the VI chord
        hook={'i': [64, 67, 69], 'vi2': [64, 67, 72], 'vi6': [64, 67, 71]},
        hook_rhythm=[(0.0, 0.42, 80), (0.58, 0.38, 72), (1.0, 1.55, 88)],
        variants={
            'theme':            dict(timbre='jazzgtr'),
            'shomer':           dict(timbre='synth'),                                   # timbre swap, same notes
            'lickpick':         dict(timbre='jazzgtr', ends={'i': 71, 'vi2': 74, 'vi6': 72}),   # last note one step up
            'trashure-hunters': dict(timbre='eplead'),
            'chore-royale':     dict(timbre='mutedgtr', ends={'i': 72}),
            'fairent':          dict(timbre='fretless'),
            'concepts':         dict(timbre='jazzgtr', double=('synth', -12), ends={'vi6': 76}),
        },
        lufs={'drums': -20.0, 'perc': -29.0, 'bass': -21.0, 'keys': -21.5, 'texture': -36.0, 'mel': -23.0},
        beds=['drums', 'perc', 'bass', 'keys', 'texture'],
        zones=[
            ('hero',       '.hero',                   dict(drums=1.0, perc=1.0, bass=1.0, keys=1.0, texture=1.0, mel=1.0), -16.0),
            ('work',       '#work',                   dict(drums=1.0, perc=1.0, bass=1.0, keys=0.9, texture=0.8, mel=1.05), -16.0),
            ('identity',   '#identity',               dict(drums=0.7, perc=0.7, bass=0.95, keys=1.0, texture=1.0, mel=0.9), -17.0),
            ('experience', '#experience',             dict(drums=0.55, perc=0.5, bass=0.9, keys=1.0, texture=1.1, mel=0.9), -17.5),
            ('about',      '#about',                  dict(drums=0.8, perc=0.8, bass=0.95, keys=1.0, texture=1.0, mel=0.9), -17.0),
            ('forest',     '#contact',                dict(drums=0.0, perc=0.0, bass=0.6, keys=0.9, texture=1.3, mel=0.7), -19.0),
            ('contact',    '#contact .contact-inner', dict(drums=1.0, perc=1.0, bass=1.0, keys=1.0, texture=1.0, mel=1.0), -16.0),
        ]),
    'B': dict(
        name='nightdrive', bpm=92.0, swing=0.0, key='E minor',
        chords=['Em9', 'Cmaj9', 'Am9', 'Bm7'],
        voic={'Em9': [52, 55, 59, 62, 66], 'Cmaj9': [48, 55, 59, 62, 64], 'Am9': [45, 52, 55, 59, 60], 'Bm7': [47, 54, 57, 62]},
        root={'Em9': 40, 'Cmaj9': 36, 'Am9': 33, 'Bm7': 35},
        arp={'Em9': [52, 55, 59, 62], 'Cmaj9': [48, 55, 59, 64], 'Am9': [45, 52, 55, 60], 'Bm7': [47, 50, 54, 57]},
        hook={'i': [71, 74, 76], 'vi2': [71, 74, 79], 'vi6': [71, 74, 78]},
        hook_rhythm=[(0.0, 0.45, 80), (0.5, 0.45, 74), (1.0, 1.75, 88)],
        variants={
            'theme':            dict(timbre='synth'),
            'shomer':           dict(timbre='cleangtr'),                                # timbre swap, same notes
            'lickpick':         dict(timbre='synth', ends={'i': 78, 'vi2': 81, 'vi6': 79}),     # last note one step up
            'trashure-hunters': dict(timbre='eplead'),
            'chore-royale':     dict(timbre='synth', ends={'i': 79}),
            'fairent':          dict(timbre='fretless'),
            'concepts':         dict(timbre='synth', double=('cleangtr', -12), ends={'vi6': 76}),
        },
        lufs={'drums': -20.0, 'bass': -20.5, 'keys': -22.0, 'pulse': -27.5, 'texture': -35.0, 'mel': -23.0},
        beds=['drums', 'bass', 'keys', 'pulse', 'texture'],
        zones=[
            ('hero',       '.hero',                   dict(drums=1.0, bass=1.0, keys=1.0, pulse=1.0, texture=1.0, mel=1.0), -16.0),
            ('work',       '#work',                   dict(drums=1.0, bass=1.0, keys=0.9, pulse=1.1, texture=0.8, mel=1.05), -16.0),
            ('identity',   '#identity',               dict(drums=0.7, bass=0.95, keys=1.0, pulse=0.7, texture=1.0, mel=0.9), -17.0),
            ('experience', '#experience',             dict(drums=0.5, bass=0.9, keys=1.05, pulse=0.5, texture=1.1, mel=0.9), -17.5),
            ('about',      '#about',                  dict(drums=0.8, bass=0.95, keys=1.0, pulse=0.8, texture=1.0, mel=0.9), -17.0),
            ('forest',     '#contact',                dict(drums=0.0, bass=0.6, keys=1.0, pulse=0.0, texture=1.3, mel=0.7), -19.0),
            ('contact',    '#contact .contact-inner', dict(drums=1.0, bass=1.0, keys=1.0, pulse=1.0, texture=1.0, mel=1.0), -16.0),
        ]),
}


def setup(d):
    global DK, D, BPM, BEAT, BAR, L, LN, KICKS, R, OUT
    DK = d; D = DIRS[d]; BPM = D['bpm']; BEAT = 60.0 / BPM; BAR = 4 * BEAT; L = NBARS * BAR; LN = int(round(L * SR))
    KICKS = []; R = np.random.default_rng(4 if d == 'A' else 9)
    OUT = os.path.join(WORK, d); os.makedirs(OUT, exist_ok=True)


def bt(bar, beat):
    """bar/beat -> seconds, with swing on the off-8ths (x.5 -> x.5 + swing)"""
    fr = beat % 1.0
    if abs(fr - 0.5) < 1e-6: beat += D['swing']
    return bar * BAR + beat * BEAT


def chord(bar): return D['chords'][bar % 4]


def hook_kind(bar):
    if bar % 2: return None
    return 'i' if bar % 4 == 0 else ('vi2' if bar % 8 == 2 else 'vi6')

# ------------------------------------------------------------------ soundfont rendering (3 identical cycles)


class Part:
    def __init__(self):
        self.notes, self.progs = [], {}

    def prog(self, ch, preset, bank=0, drums=False): self.progs[ch] = (bank, preset, drums)

    def n(self, t, d, ch, key, vel, jit=0.005, vj=5):
        t += R.uniform(-jit, jit) if jit else 0.0
        vel = int(np.clip(vel + (R.integers(-vj, vj + 1) if vj else 0), 1, 127))
        self.notes.append((max(0.0, t) % L, max(0.03, d), ch, int(key), vel))


def render(part):
    s = tsf.Synth(samplerate=SR, gain=-3)
    sfid = s.sfload(SF)
    for ch, (bank, preset, drums) in part.progs.items():
        s.program_select(ch, sfid, 128 if drums else bank, preset, is_drums=drums)
    ev = []
    for c in range(3):
        for (t, d, ch, k, v) in part.notes:
            ev.append((int((c * L + t) * SR), 2, ch, k, v)); ev.append((int((c * L + t + d) * SR), 0, ch, k, 0))
    ev.sort(key=lambda e: (e[0], e[1]))
    total = 3 * LN
    out = np.zeros((total, 2), np.float32); pos = 0
    for (smp, kind, ch, k, v) in ev:
        smp = min(smp, total)
        if smp > pos:
            out[pos:smp] = np.frombuffer(s.generate(smp - pos), dtype=np.float32).reshape(-1, 2); pos = smp
        if kind == 2: s.noteon(ch, k, v)
        else: s.noteoff(ch, k)
    if pos < total: out[pos:] = np.frombuffer(s.generate(total - pos), dtype=np.float32).reshape(-1, 2)
    return out.T.copy()

# ------------------------------------------------------------------ own synthesis (circular buffer = seamless loop)


def add_circ(buf, i0, x):
    """add x (ch, n) into circular buf (ch, LN) at sample i0"""
    i0 %= LN; n = x.shape[-1]
    while n > 0:
        k = min(n, LN - i0)
        buf[..., i0:i0 + k] += x[..., :k]
        x = x[..., k:]; n -= k; i0 = 0


def tile3(buf): return np.tile(buf, (1, 3)) if buf.ndim == 2 else np.tile(buf, 3)


def saw(ph, dt):
    p = ph % 1.0; y = 2 * p - 1
    m = p < dt; x = p[m] / dt[m]; y[m] -= x + x - x * x - 1
    m = p > 1 - dt; x = (p[m] - 1) / dt[m]; y[m] -= x * x + x + x + 1
    return y


def env_adsr(n, gate, a, d, s, r):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    g = gate
    if g < n:
        eg = e[min(g, n - 1)]
        e[g:] = eg * np.exp(-(t[g:] - t[g]) / max(r, 1e-4))
    return e


def osc_note(freq, dur, a, d, s, r, kind='saw', detune=(0.0,), glide_from=None, vib=0.0, seed=0):
    n = int((dur + r * 5) * SR); gate = int(dur * SR)
    t = np.arange(n) / SR
    f = np.full(n, freq)
    if glide_from: f = freq + (glide_from - freq) * np.exp(-t / 0.04)
    if vib: f = f * (1 + (2 ** (vib / 1200) - 1) * np.clip((t - 0.22) / 0.45, 0, 1) * np.sin(2 * np.pi * 4.6 * t))
    rg = np.random.default_rng(seed)
    y = np.zeros(n)
    for dc in detune:
        ff = f * 2 ** (dc / 1200); dt = ff / SR; ph = np.cumsum(dt) + rg.random()
        if kind == 'saw': y += saw(ph, dt)
        elif kind == 'square': y += 0.5 * (saw(ph, dt) - saw(ph + 0.5, dt))
        elif kind == 'mellow': y += 0.6 * saw(ph, dt) + 0.4 * 0.5 * (saw(ph, dt) - saw(ph + 0.5, dt))
        else: y += np.sin(2 * np.pi * ph)
    return y / len(detune) * env_adsr(n, gate, a, d, s, r)


def kick_note(f0, f1, decay, click=0.0, seed=0):
    n = int((decay * 6) * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.04)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay) * (1 - np.exp(-t / 0.0015))
    if click:
        c = np.random.default_rng(seed).standard_normal(n) * np.exp(-t / 0.003)
        x += click * signal.sosfilt(signal.butter(2, 2500, 'lowpass', fs=SR, output='sos'), c)
    return x


def synth_kicks(f0, f1, decay, click, vel_of):
    buf = np.zeros((1, LN))
    for i, kt in enumerate(KICKS):
        add_circ(buf, int(kt * SR), (kick_note(f0, f1, decay, click, i) * vel_of(i))[None])
    return tile3(np.vstack([buf, buf]))


def duck_env(depth, rel=0.18):
    env = np.ones(LN)
    t = np.arange(int(0.7 * SR)) / SR
    shape = 1 - depth * np.where(t < 0.008, t / 0.008, np.exp(-(t - 0.008) / rel))
    for kt in KICKS:
        i = int(kt * SR)
        idx = (i + np.arange(len(shape))) % LN
        env[idx] = np.minimum(env[idx], shape)
    return tile3(env)


def wow(x, wow_pct=0.18, flut_pct=0.04):
    """tape wow + flutter as a modulated delay; rates are whole cycles per loop, so the loop stays seamless"""
    n = x.shape[-1]; t = np.arange(n) / SR
    fw = max(1, round(0.5 * L)) / L; ff = max(1, round(5.3 * L)) / L
    dly = 0.004 * SR + (wow_pct / 100) / (2 * np.pi * fw) * SR * np.sin(2 * np.pi * fw * t) \
        + (flut_pct / 100) / (2 * np.pi * ff) * SR * np.sin(2 * np.pi * ff * t + 1.3)
    idx = np.arange(n) - dly
    return np.vstack([np.interp(idx, np.arange(n), c) for c in np.atleast_2d(x)])


def chorus(x, rate, depth_ms, centre_ms, mix):
    """stereo chorus as a modulated delay whose LFO makes whole cycles per loop (pedalboard's Chorus does not loop)"""
    n = x.shape[-1]; t = np.arange(n) / SR; f = lrate(rate); idx = np.arange(n); out = []
    for c, ch in enumerate(np.atleast_2d(x) if x.shape[0] == 2 else np.vstack([x, x])):
        d = (centre_ms + depth_ms * np.sin(2 * np.pi * f * t + c * np.pi / 2)) / 1000 * SR
        out.append((1 - mix) * ch + mix * np.interp(idx - d, idx, ch))
    return np.vstack(out)


def hall_ir(path, secs=2.6, decay=1.3, pre=0.02, bright=4500, seed=7):
    if os.path.exists(path): return path
    rg = np.random.default_rng(seed); n = int(secs * SR); t = np.arange(n) / SR
    ir = np.zeros((n, 2), np.float32)
    for c in range(2):
        x = rg.standard_normal(n) * np.exp(-t * 6.9 / decay)
        lo = signal.sosfilt(signal.butter(1, 800, 'lowpass', fs=SR, output='sos'), x)
        hi = signal.sosfilt(signal.butter(2, bright, 'lowpass', fs=SR, output='sos'), x)
        w = np.exp(-t / (decay * 0.3)); y = hi * w + lo * (1 - w) * 1.6
        y[: int(pre * SR)] = 0
        for dd, g in ((0.012, 0.45), (0.019, 0.3), (0.026, 0.25)): y[int((dd + c * 0.004) * SR)] += g
        ir[:, c] = y
    ir /= np.sqrt((ir ** 2).sum(axis=0)).max()
    sf.write(path, ir, SR, subtype='FLOAT'); return path


def lrate(r): return max(1, round(r * L)) / L   # LFO rates in whole cycles per loop keep the loop seamless


def fx(x, chain): return pb.Pedalboard(chain)(np.atleast_2d(x).astype(np.float32), SR)


def send(x, ir, wet, hp=250, lp=5000):
    return x + wet * fx(x, [pb.HighpassFilter(hp), pb.LowpassFilter(lp), pb.Convolution(ir, mix=1.0)])

# ------------------------------------------------------------------ A: late-night chillhop parts


def a_drums():
    p = Part(); p.prog(9, 40, drums=True); p.prog(10, 0, drums=True)
    KICKS.clear(); kv = []
    for b in range(NBARS):
        ks = [(0, 1.0), (1.5, 0.62), (2.5, 0.85)] if b % 2 == 0 else [(0, 1.0), (2.0, 0.55), (2.5, 0.8)]
        if b % 4 == 3: ks.append((3.5, 0.5))
        for beat, v in ks: KICKS.append(bt(b, beat)); kv.append(v)
        for beat in (1, 3):
            p.n(bt(b, beat), 0.2, 9, 38, 76); p.n(bt(b, beat) + 0.004, 0.2, 10, 37, 46)
        if b % 2: p.n(bt(b, 3.5), 0.15, 9, 38, 26)
        if b == NBARS - 1: p.n(bt(b, 3.75), 0.15, 9, 38, 30)
    order = np.argsort(KICKS); ks_sorted = [KICKS[i] for i in order]; kv = [kv[i] for i in order]
    KICKS[:] = ks_sorted
    k = synth_kicks(100, 56, 0.28, 0.15, lambda i: kv[i])
    sn = render(p)
    sn = fx(sn, [pb.HighpassFilter(180), pb.HighShelfFilter(4500, -5.0, 0.7), pb.LowpassFilter(7500)])
    return {'drums': k * 1.15 + sn * 0.55}


def a_perc():
    p = Part(); p.prog(9, 0, drums=True)
    for b in range(NBARS):
        for e in range(8):
            beat = e * 0.5; off = e % 2 == 1
            p.n(bt(b, beat), 0.1, 9, 82, 38 if off else 20, jit=0.008)
    return {'perc': render(p)}


def a_bass():
    p = Part(); p.prog(0, 32)
    sub = np.zeros((1, LN))
    for b in range(NBARS):
        c = chord(b); nxt = chord(b + 1); r = D['root'][c]
        notes = [(0.0, 1.7, r, 96), (2.5, 0.9, D['fifth'][c] if b % 2 == 0 else r + 12, 78)]
        if b % 2: notes.append((3.5, 0.45, D['root'][nxt] - 1 if D['root'][nxt] - 1 != r else D['root'][nxt] + 2, 66))
        for beat, d, k, v in notes:
            t = bt(b, beat); p.n(t, d * BEAT, 0, k, v)
            add_circ(sub, int(t * SR), (osc_note(mtof(k), d * BEAT, 0.008, 0.5, 0.55, 0.06, kind='sine') * v / 127)[None])
    up = render(p)
    s = tile3(np.vstack([sub, sub]))
    return {'bass': up / (np.abs(up).max() + 1e-9) * 0.9 + s / (np.abs(s).max() + 1e-9) * 0.75}


def a_keys():
    p = Part(); p.prog(0, 4)
    for b in range(NBARS):
        v = D['voic'][chord(b)]
        hits = [(0.0, 3.85, 74)] if b % 2 == 0 else [(0.0, 2.3, 70), (2.5, 1.35, 58)]
        for beat, d, vel in hits:
            for j, k in enumerate(v):
                p.n(bt(b, beat) + j * 0.014, d * BEAT, 0, k, vel - j * 2, jit=0.004)
    return {'keys': render(p)}


def a_texture():
    rg = np.random.default_rng(21)
    buf = np.zeros((2, LN))
    hiss = rg.standard_normal((2, LN)) * 0.02
    hiss = signal.sosfiltfilt(signal.butter(2, [300, 3500], 'bandpass', fs=SR, output='sos'), hiss, axis=-1)
    buf += hiss
    nev = int(L * 5)
    for _ in range(nev):
        i = rg.integers(0, LN); n = rg.integers(30, 160); t = np.arange(n) / SR
        c = rg.standard_normal(n) * np.exp(-t / (n / SR / 4)) * rg.exponential(0.25)
        pan = rg.random()
        add_circ(buf, i, np.vstack([c * (1 - pan * 0.6), c * (0.4 + pan * 0.6)]))
    for _ in range(int(L * 0.25)):   # a few soft pops
        i = rg.integers(0, LN); n = 400; t = np.arange(n) / SR
        c = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.002) * 0.6
        add_circ(buf, i, np.vstack([c, c]))
    return {'texture': tile3(buf)}


def gs_line(preset, notes, octave=0):
    p = Part(); p.prog(0, preset)
    for t, d, k, v in notes: p.n(t, d, 0, k + octave, v, jit=0.004, vj=3)
    return render(p)


def synth_line(notes, octave=0, cutoff=1500):
    buf = np.zeros((1, LN)); prev = None
    for i, (t, d, k, v) in enumerate(sorted(notes)):
        k += octave
        g = mtof(prev[1]) if prev and t - prev[0] < 0.25 else None
        x = osc_note(mtof(k), d, 0.03, 0.4, 0.75, 0.32, kind='mellow', detune=(-5.0, 4.0), glide_from=g, vib=10.0, seed=i)
        add_circ(buf, int(t * SR), (x * v / 127)[None]); prev = (t + d, k)
    y = tile3(buf)
    return fx(y, [pb.LadderFilter(pb.LadderFilter.Mode.LPF24, cutoff, 0.12, 1.0)])


TIMBRE = {'jazzgtr': ('gs', 26, 0), 'mutedgtr': ('gs', 28, 0), 'cleangtr': ('gs', 27, 0), 'eplead': ('gs', 4, 0),
          'fretless': ('gs', 35, -12), 'synth': ('synth', None, 0)}


def mel_notes(var):
    ends = var.get('ends', {}); out = []
    for b in range(NBARS):
        hk = hook_kind(b)
        if not hk: continue
        ks = list(D['hook'][hk])
        if hk in ends: ks[2] = ends[hk]
        for (beat, d, v), k in zip(D['hook_rhythm'], ks):
            out.append((bt(b, beat), d * BEAT, k, v))
    return out


def voice(timbre, notes, shift=0):
    kind, preset, octv = TIMBRE[timbre]
    if kind == 'gs':
        y = gs_line(preset, notes, octv + shift)
        if timbre == 'fretless': y = y * 1.0
        return y
    return synth_line(notes, shift, 1250 if DK == 'A' else 1700)


def p_melody(vname):
    var = D['variants'][vname]; notes = mel_notes(var)
    y = voice(var['timbre'], notes)
    y = y / (np.abs(y).max() + 1e-9)
    if var.get('double'):
        tb, sh = var['double']; z = voice(tb, notes, sh); y = y + 0.5 * z / (np.abs(z).max() + 1e-9)
    return {'mel-' + vname: y}

# ------------------------------------------------------------------ B: dark night-drive parts


def b_drums():
    KICKS.clear(); kv = []
    p = Part(); p.prog(9, 24, drums=True); h = Part(); h.prog(9, 25, drums=True)
    for b in range(NBARS):
        ks = [(0, 1.0), (2.0, 0.9)] + ([(2.5, 0.55)] if b % 2 else [])
        if b % 4 == 3: ks.append((3.5, 0.5))
        for beat, v in ks: KICKS.append(bt(b, beat)); kv.append(v)
        for beat in (1, 3): p.n(bt(b, beat), 0.2, 9, 38, 80)
        for e in range(8):
            h.n(bt(b, e * 0.5), 0.08, 9, 42, 50 if e % 2 else 32, jit=0.004)
        if b % 4 == 3: h.n(bt(b, 3.5), 0.3, 9, 46, 34)
    order = np.argsort(KICKS); KICKS[:] = [KICKS[i] for i in order]; kv = [kv[i] for i in order]
    k = synth_kicks(120, 54, 0.32, 0.25, lambda i: kv[i])
    sn = render(p)
    sn = fx(sn, [pb.HighpassFilter(150), pb.PeakFilter(200, 2.0, 1.0), pb.HighShelfFilter(4000, -5.0, 0.7), pb.LowpassFilter(7000)])
    wet = fx(sn, [pb.Convolution(IR_PLATE, mix=1.0), pb.LowpassFilter(5000)])
    gate = np.zeros(LN)   # gated plate: open for 0.22 s after each snare, then shut fast
    for b in range(NBARS):
        for beat in (1, 3):
            i = int(bt(b, beat) * SR); n = int(0.3 * SR); t = np.arange(n) / SR
            g = np.where(t < 0.22, 1.0, np.exp(-(t - 0.22) / 0.015))
            idx = (i + np.arange(n)) % LN; gate[idx] = np.maximum(gate[idx], g)
    sn = sn + 0.55 * wet * tile3(gate)
    hh = fx(render(h), [pb.HighpassFilter(600), pb.LowpassFilter(9000), pb.HighShelfFilter(5000, -3.0, 0.7)])
    # soft synthetic air on the off-8ths (filtered noise tick), so the hats read without getting bright
    rg = np.random.default_rng(5); air = np.zeros((2, LN)); n = int(0.06 * SR); tt = np.arange(n) / SR
    for b in range(NBARS):
        for e in range(1, 8, 2):
            z = rg.standard_normal((2, n)) * np.exp(-tt / 0.018)
            add_circ(air, int(bt(b, e * 0.5) * SR), z * (0.22 if e != 7 else 0.17))
    air = fx(tile3(air), [pb.HighpassFilter(5000), pb.LowpassFilter(10000), pb.HighShelfFilter(8000, -4.0, 0.7)])
    hh = hh + air
    return {'drums': k * 1.2 + sn * 0.55 + hh * 2.4}


def b_bass():
    buf = np.zeros((1, LN))
    for b in range(NBARS):
        r = D['root'][chord(b)]
        for e in range(8):
            v = 1.0 if e % 2 == 0 else 0.72
            if b % 4 == 3 and e == 7: r2 = D['root'][chord(b + 1)] + (12 if D['root'][chord(b + 1)] < 33 else 0)
            else: r2 = r
            x = osc_note(mtof(r2), 0.44 * BEAT, 0.006, 0.18, 0.6, 0.05, kind='sine', seed=e)
            x2 = osc_note(mtof(r2), 0.44 * BEAT, 0.006, 0.12, 0.35, 0.05, kind='saw', detune=(0.0,), seed=e)
            add_circ(buf, int(bt(b, e * 0.5) * SR), ((x + 0.18 * x2) * v)[None])
    y = tile3(np.vstack([buf, buf]))
    return {'bass': y}


def b_keys():
    buf = np.zeros((2, LN))
    for b in range(NBARS):
        t = bt(b, 0) - 0.03
        for j, k in enumerate(D['voic'][chord(b)]):
            for vi, dc in enumerate((-11.0, -4.0, 3.0, 9.0)):
                x = osc_note(mtof(k), BAR - 0.05, 0.45, 1.2, 0.8, 0.9, kind='saw', detune=(dc,), seed=b * 31 + j * 5 + vi)
                pan = 0.5 + (0.32 if vi % 2 else -0.32)
                add_circ(buf, int(t * SR), np.vstack([x * (1 - pan), x * pan]) * 0.6)
    y = tile3(buf)
    lo = fx(y, [pb.LadderFilter(pb.LadderFilter.Mode.LPF24, 900, 0.15, 1.0)])
    hi = fx(y, [pb.LadderFilter(pb.LadderFilter.Mode.LPF24, 2200, 0.15, 1.0)])
    tt = np.arange(y.shape[-1]) / SR; lfo = 0.5 - 0.5 * np.cos(2 * np.pi * tt / (4 * BAR))   # filter breathes once per 4 bars
    return {'keys': lo * (1 - lfo) + hi * lfo}


def b_pulse():
    buf = np.zeros((2, LN))
    pat = [0, 1, 2, 3, 2, 1, 2, 3]
    for b in range(NBARS):
        a = D['arp'][chord(b)]
        for e in range(8):
            k = a[pat[e]]
            x = osc_note(mtof(k), 0.3 * BEAT, 0.004, 0.16, 0.0, 0.12, kind='saw', detune=(-4.0, 4.0), seed=b * 8 + e)
            pan = 0.35 if e % 2 else 0.65
            add_circ(buf, int(bt(b, e * 0.5) * SR), np.vstack([x * (1 - pan), x * pan]) * (0.9 if e % 4 == 0 else 0.7))
    return {'pulse': tile3(buf)}


def b_texture():
    rg = np.random.default_rng(33)
    n = rg.standard_normal((2, LN))
    n = signal.sosfiltfilt(signal.butter(2, [250, 1100], 'bandpass', fs=SR, output='sos'), n, axis=-1)
    tt = np.arange(LN) / SR
    lfo = 0.55 + 0.45 * np.sin(2 * np.pi * tt / (8 * BAR))
    return {'texture': tile3(n * lfo)}

# ------------------------------------------------------------------ processing


def process(name, x):
    n = x.shape[-1]; A = DK == 'A'
    if name == 'drums':
        x = fx(x, [pb.HighpassFilter(42), pb.LowShelfFilter(85, 0.5), pb.PeakFilter(380, -2.0, 0.9), pb.HighShelfFilter(6000, -3.0),
                   pb.Compressor(-20, 2.5, 10, 140)])
        x = send(x, IR_ROOM, 0.12 if A else 0.08, hp=350, lp=5000)
        if A: x = fx(x, [pb.Distortion(4.0)])
    elif name == 'perc':
        x = fx(x, [pb.HighpassFilter(500), pb.LowpassFilter(6500), pb.HighShelfFilter(4000, -5.0)])
        x = send(x, IR_ROOM, 0.25, hp=500, lp=5000) * duck_env(0.25)
    elif name == 'bass':
        if A: x = fx(x, [pb.HighpassFilter(45), pb.LowShelfFilter(70, -1.0), pb.PeakFilter(250, -2.0, 1.0), pb.LowpassFilter(1600), pb.Compressor(-22, 3.5, 10, 160)])
        else: x = fx(x, [pb.HighpassFilter(42), pb.Distortion(6.0), pb.LowpassFilter(700), pb.Compressor(-22, 3.0, 8, 120)])
        m = x.mean(axis=0, keepdims=True); x = np.vstack([m, m]) * duck_env(0.28 if A else 0.45)
    elif name == 'keys':
        if A:
            x = fx(x, [pb.HighpassFilter(110), pb.PeakFilter(300, -2.0, 0.8), pb.PeakFilter(2500, -2.5, 0.8), pb.LowpassFilter(5000),
                       pb.Distortion(5.0), pb.Compressor(-24, 2.0, 25, 220)])
            x = chorus(x, 0.6, 1.2, 7.0, 0.3)
            x = wow(x)
            x = send(x, IR, 0.3, hp=250, lp=4500) * duck_env(0.32)
        else:
            x = chorus(fx(x, [pb.HighpassFilter(90), pb.PeakFilter(280, -2.0, 0.8), pb.Compressor(-24, 2.0, 40, 300)]), 0.3, 2.0, 8.0, 0.35)
            x = send(x, IR, 0.45, hp=250, lp=4000) * duck_env(0.3, 0.25)
    elif name == 'pulse':
        x = fx(x, [pb.HighpassFilter(160), pb.LadderFilter(pb.LadderFilter.Mode.LPF24, 1700, 0.1, 1.0)])
        d = fx(x, [pb.Delay(BEAT * 0.75, 0.3, 1.0), pb.LowpassFilter(2200)])
        x = send(x + 0.3 * d, IR, 0.4, hp=250, lp=3500) * duck_env(0.25)
    elif name == 'texture':
        x = fx(x, [pb.HighpassFilter(250), pb.LowpassFilter(4500 if A else 2500)])
    else:   # melody: mono, warm, sits under the bed
        m = x.mean(axis=0, keepdims=True)
        m = fx(m, [pb.HighpassFilter(180), pb.PeakFilter(2800, -3.5, 0.8), pb.LowpassFilter(3600 if A else 3800), pb.HighShelfFilter(3000, -3.0),
                   pb.Compressor(-24, 2.5, 12, 180)])
        if A: m = wow(m, 0.15, 0.03)
        d = fx(m, [pb.Delay(BEAT * 0.75, 0.3, 1.0), pb.LowpassFilter(2600), pb.HighpassFilter(350)])
        m = m + 0.2 * d
        x = m + 0.3 * fx(m, [pb.HighpassFilter(300), pb.LowpassFilter(4000), pb.Convolution(IR, mix=1.0)]).mean(axis=0, keepdims=True)
    role = 'mel' if name.startswith('mel-') else name
    tgt = D['lufs'][role]
    x = x * 10 ** ((tgt - loud(x[:, LN:2 * LN])) / 20)
    # cap each stem's crest so any zone sum keeps true-peak headroom without a master limiter on the site, then re-level
    x = limit(x, tgt + CREST.get(role, 14.0))
    return x * 10 ** ((tgt - loud(x[:, LN:2 * LN])) / 20)


CREST = {'drums': 14.0, 'bass': 11.0, 'mel': 11.0, 'texture': 16.0}


def loud(x): return meter.integrated_loudness(np.atleast_2d(x).T if np.atleast_2d(x).shape[0] <= 2 else x)


def tp_db(x): return 20 * np.log10(np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max() + 1e-12)


def parts_for(names):
    fns = ({'drums': a_drums, 'perc': a_perc, 'bass': a_bass, 'keys': a_keys, 'texture': a_texture} if DK == 'A' else
           {'drums': b_drums, 'bass': b_bass, 'keys': b_keys, 'pulse': b_pulse, 'texture': b_texture})
    out = {}
    out.update(fns['drums']())   # first: defines KICKS for the ducking of everything else
    for nm in D['beds']:
        if nm != 'drums': out.update(fns[nm]())
    for v in names: out.update(p_melody(v))
    return out


def build(mels):
    """render + process every bed and the given melody variants; returns {name: one seamless loop (ch, LN)}"""
    loops = {}
    for name, x in parts_for(mels).items():
        y = process(name, np.atleast_2d(x))
        loops[name] = y[:, LN:2 * LN].astype(np.float32)
        print('  %-22s LUFS %6.1f' % (name, loud(loops[name])))
    return loops


def master(y):
    y = fx(y, [pb.Compressor(-20, 1.8, 30, 250), pb.HighpassFilter(35), pb.LowShelfFilter(60, -1.5), pb.HighShelfFilter(7000, -2.0), pb.LowpassFilter(14000)])
    y = y * 10 ** ((-19.0 - loud(y)) / 20); y = np.tanh(y * 1.6) / 1.6   # gentle tape-style glue
    # own look-ahead limiter (pedalboard's Limiter adds make-up gain); search the drive so the result reads -16 LUFS
    drive = -16.0 - loud(y)
    for _ in range(5):
        out = limit(y * 10 ** (drive / 20), -2.0)
        drive += -16.0 - loud(out)
    return out


def limit(x, ceil_db, look=0.008):
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    c = 10 ** (ceil_db / 20); w = int(look * SR)
    a = np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max(axis=0).reshape(-1, 4).max(axis=1)[:x.shape[-1]]   # true-peak-ish
    need = np.minimum(1.0, c / np.maximum(a, 1e-9))
    g = uniform_filter1d(minimum_filter1d(need, 4 * w + 1), 2 * w + 1)   # min over 2w each side, then a 2w box: never above `need`
    return x * g


def stereo(x): return np.vstack([x, x]) if x.shape[0] == 1 else x


def sketch(d):
    setup(d)
    show = ['theme', 'shomer', 'lickpick']
    print('direction', d, D['name'], BPM, 'BPM', D['key'])
    loops = build(show)
    st = {k: stereo(v) for k, v in loops.items()}
    N = LN; t = np.arange(N) / SR
    bed = sum(st[b] for b in D['beds'])
    # melody: theme bars 0-7, shomer bars 8-11, lickpick bars 12-15; each swap is a 0.6 s equal-power fade ending on the bar
    def win(b0, b1):
        a, z = b0 * BAR, b1 * BAR; xf = 0.6
        up = np.clip((t - (a - xf)) / xf, 0, 1) if b0 > 0 else np.ones(N)
        dn = np.clip(((z - xf) - t) / xf + 1, 0, 1) if b1 < NBARS else np.ones(N)
        return np.sin(up * np.pi / 2) * np.cos((1 - dn) * np.pi / 2)
    mel = st['mel-theme'] * win(0, 8) + st['mel-shomer'] * win(8, 12) + st['mel-lickpick'] * win(12, 16)
    y = bed + mel
    y = master(y)
    fi = int(1.0 * SR); fo = int(3.0 * SR)
    y[:, :fi] *= np.sin(np.linspace(0, np.pi / 2, fi)) ** 2
    y[:, -fo:] *= np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
    os.makedirs(SKETCH_DIR, exist_ok=True)
    wav = os.path.join(OUT, '_sketch.wav'); sf.write(wav, y.T, SR, subtype='FLOAT')
    mp3 = os.path.join(SKETCH_DIR, 'score-v4-%s-%s.mp3' % (d, D['name']))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '256k', mp3], check=True)
    report(mp3, bed, loops)
    return mp3


def report(mp3, bed, loops):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', mp3, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    summ = r[r.rfind('Summary:'):]
    I = float(summ.split('I:')[1].split('LUFS')[0]); TP = float(summ.split('Peak:')[1].split('dBFS')[0])
    y = decode(mp3); m = y.mean(axis=0)
    P = np.abs(np.fft.rfft(m)) ** 2; f = np.fft.rfftfreq(len(m), 1 / SR)
    hi = P[f > 4000].sum() / P.sum() * 100; core = P[(f >= 60) & (f <= 2000)].sum() / P.sum() * 100
    sub = P[f < 60].sum() / P.sum() * 100
    clip = int((np.abs(y) >= 0.999).sum())
    bm = bed.mean(axis=0); seam = abs(bm[-1] - bm[0]); step = np.percentile(np.abs(np.diff(bm)), 99.9)   # seam vs the bed's own 99.9th-pct sample step
    print('  %s  %.1f s  I %.1f LUFS  TP %.1f dBTP  >4kHz %.2f%%  60Hz-2kHz %.1f%%  <60Hz %.1f%%  clipped %d  loop seam %.5f (99.9%% step %.5f)'
          % (os.path.basename(mp3), y.shape[1] / SR, I, TP, hi, core, sub, clip, seam, step))


def decode(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2).T


def stems(d):
    """full stem set for the chosen direction, same engine config shape as v3 (loop, bar, pad, beds, melody + zones + products)"""
    setup(d)
    loops = build(list(D['variants'].keys()))
    st = {k: stereo(v) for k, v in loops.items()}
    def mix(g, mel): return sum(st[b] * g.get(b, 0) for b in D['beds']) + st['mel-' + mel] * g.get('mel', 0)
    g0 = 10 ** ((-16.0 - loud(mix(D['zones'][0][2], 'theme'))) / 20)
    zones_out = []
    for zid, sel, gains, target in D['zones']:
        mels = ['theme'] + PRODUCTS if zid == 'work' else ['theme']
        res = [(loud(mix(gains, m) * g0), tp_db(mix(gains, m) * g0)) for m in mels]
        lu = np.mean([r[0] for r in res]); tp = max(r[1] for r in res)
        mk = 10 ** (min(target - lu, -1.5 - tp) / 20)
        zones_out.append({'id': zid, 'sel': sel, 'mix': {k: round(v * mk, 4) for k, v in gains.items()}})
        print('  zone %-11s LUFS %6.2f TP %6.2f' % (zid, lu + 20 * np.log10(mk), tp + 20 * np.log10(mk)))
    os.makedirs(REPO_OUT, exist_ok=True); p = int(PAD * SR)
    for name, c in loops.items():
        f = np.concatenate([c[:, -p:], c, c[:, :p]], axis=1) * g0
        if name.startswith('mel-'): f = f[:1]
        w = os.path.join(OUT, name + '.wav'); sf.write(w, f.T, SR, subtype='FLOAT')
        ob, ab = ('40k', '64k') if name.startswith('mel-') else ('64k', '112k')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'libopus', '-b:a', ob, '-vbr', 'constrained', '-application', 'audio',
                        os.path.join(REPO_OUT, name + '.ogg')], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'aac', '-b:a', ab, '-aac_pns', '0', '-movflags', '+faststart',
                        os.path.join(REPO_OUT, name + '.m4a')], check=True)
        if not os.environ.get('S3_KEEP_WAV'): os.remove(w)
    cfg = {'stems': {'loop': round(L, 4), 'bar': round(BAR, 4), 'pad': PAD, 'beds': D['beds'], 'melody': 'mel-theme'},
           'zones': zones_out,
           'products': {k: {'match': 'work/%s.html' % k, 'file': 'mel-' + k} for k in PRODUCTS}}
    json.dump(cfg, open(os.path.join(REPO_OUT, 'mix.json'), 'w'), indent=1)
    print(json.dumps(cfg))


IR = IR_ROOM = IR_PLATE = None


def irs():
    global IR, IR_ROOM, IR_PLATE
    os.makedirs(WORK, exist_ok=True)
    IR = hall_ir(os.path.join(WORK, '_hall.wav'))
    IR_ROOM = hall_ir(os.path.join(WORK, '_room.wav'), secs=0.9, decay=0.45, pre=0.006, bright=5000, seed=5)
    IR_PLATE = hall_ir(os.path.join(WORK, '_plate.wav'), secs=1.4, decay=0.7, pre=0.008, bright=6000, seed=11)


if __name__ == '__main__':
    irs()
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'sketch'
    which = (sys.argv[2] if len(sys.argv) > 2 else 'both').upper()
    ds = ['A', 'B'] if which == 'BOTH' else [which]
    for d in ds:
        if cmd == 'stems': stems(d)
        else: sketch(d)
