"""3Shamrocks Studio homepage music, Score v5 "the jam": instrumental funk / neo-soul band that grows with the scroll.

Brief (Dave, 9 + 10 Nov, after v4 "boring"): funky, soul, FLAVOUR, upbeat but not too fast, masculine cool jam, rhythmic
beat + harmonic melody, story-telling: it begins with a beat and every scroll adds an instrument. Portfolio = the same
groove, a slight melodic change per product as the indicator.

  98 BPM, swung 16ths, E dorian vamp, 16 bars (two 8-bar cycles):  Em9 Em9 | A13 A13 | Em9 Em9 | Cmaj9 B7#9
  stems (all sample-aligned, same length, seamless):
    drums  tight dry kit (GS Standard) + punch kick layer, ghost notes, 16th hats, bar-8/16 fills
    bass   finger bass with slap octave pops and ghosts + sine sub, kick-keyed
    gtr    chicken-scratch funk guitar (GS "Funk Guitar" + muted scratches) through a tempo-synced auto-wah
    keys   Tine Rhodes comping + Clavinet 16ths
    organ  tonewheel organ pad with rotary-style chorus
    horns  brass section + tenor sax + trombone stabs, lifts into bars 7 and 15
    mel-*  the hook: a soulful lead (driven clean guitar for the theme); each product = same hook, own timbre + one
           changed phrase-ending note
    fill   one-bar drum fill played once when the music starts (not looped)
  Story (scroll depth, cumulative): hero drums -> +bass -> +guitar -> +keys/organ -> +horns -> portfolio full band + lead
  -> (identity / experience / about: full band) -> forest breakdown (no drums/horns) -> contact: full band "victory".

Mix: pedalboard bus compression, saturation, synthetic plate, kick sidechain; stems are crest-capped so any zone sum keeps
true-peak headroom in the browser (no master limiter there). Demo master: -16 LUFS, TP <= -1 dBTP.

Usage:
  python3 score_v5.py stems   -> stems + mix.json in assets/audio/studio/v5/ (env S3_REPO_OUT overrides)
  python3 score_v5.py demo    -> /mnt/user-data/outputs/audio/score-v5-demo.mp3 (needs the stems' WAVs: run after `stems`)
  python3 score_v5.py all     -> both
Requires: tinysoundfont, pedalboard, pyloudnorm, soundfile, numpy, scipy, ffmpeg; GeneralUser GS (env S3_SF2)."""
import os, sys, json, subprocess
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
import pedalboard as pb
import tinysoundfont as tsf
from scipy import signal
from scipy.ndimage import minimum_filter1d, uniform_filter1d

SF = os.environ.get('S3_SF2', '/home/claude/mrbumpy409/generaluser-gs/GeneralUser-GS.sf2')
WORK = os.environ.get('S3_OUT', '/dev/shm/s3studio/v5')
HERE = os.path.dirname(os.path.abspath(__file__))
REPO_OUT = os.environ.get('S3_REPO_OUT', os.path.join(HERE, '..', 'studio', 'v5'))
DEMO_DIR = os.environ.get('S3_SKETCH', '/mnt/user-data/outputs/audio')
SR = 44100
BPM = 98.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
NBARS = 16
L = NBARS * BAR
LN = int(round(L * SR))
PAD = 0.5
SWING = 0.045          # beats: the 2nd and 4th 16th of every beat land late (swung 16ths)
PRODUCTS = ['shomer', 'lickpick', 'trashure-hunters', 'chore-royale', 'fairent', 'milo', 'concepts']
BEDS = ['drums', 'bass', 'gtr', 'keys', 'organ', 'horns']
R = np.random.default_rng(98)
meter = pyln.Meter(SR)
KICKS = []


def mtof(k): return 440.0 * 2 ** ((k - 69) / 12.0)


def bt(bar, beat):
    """bar/beat -> seconds, swung 16ths (x.25 / x.75 pushed late)"""
    fr = beat % 0.5
    if abs(fr - 0.25) < 1e-6: beat += SWING
    return bar * BAR + beat * BEAT

# ------------------------------------------------------------------ harmony
CH = ['Em9', 'Em9', 'A13', 'A13', 'Em9', 'Em9', 'Cmaj9', 'B7#9']
def chord(bar): return CH[bar % 8]
ROOT = {'Em9': 28, 'A13': 33, 'Cmaj9': 36, 'B7#9': 35}                  # bass (E1 A1 C2 B1)
QUAL = {'Em9': 'm', 'A13': 'd', 'Cmaj9': 'M', 'B7#9': 'd'}
GTR = {'Em9': [62, 66, 67, 71], 'A13': [61, 66, 67, 71], 'Cmaj9': [64, 67, 71, 74], 'B7#9': [63, 69, 74]}
RHO = {'Em9': [55, 62, 66, 71], 'A13': [55, 61, 66, 71], 'Cmaj9': [52, 59, 62, 67], 'B7#9': [51, 57, 62, 66]}
ORG = {'Em9': [52, 59, 62, 67], 'A13': [55, 61, 64, 66], 'Cmaj9': [52, 55, 59, 64], 'B7#9': [51, 57, 62, 66]}
HRN = {'Em9': [59, 62, 67], 'A13': [61, 66, 67], 'Cmaj9': [59, 64, 67], 'B7#9': [57, 62, 63]}
def third(c): return 3 if QUAL[c] == 'm' else 4

# ------------------------------------------------------------------ soundfont rendering


class Part:
    def __init__(self):
        self.ev, self.progs = [], {}

    def prog(self, ch, preset, bank=0, drums=False): self.progs[ch] = (bank, preset, drums)

    def n(self, t, d, ch, key, vel, jit=0.004, vj=5, late=0.0):
        t += late + (R.uniform(-jit, jit) if jit else 0.0)
        vel = int(np.clip(vel + (R.integers(-vj, vj + 1) if vj else 0), 1, 127))
        t = max(0.0, t); d = max(0.02, d)
        self.ev.append((t, 2, ch, int(key), vel)); self.ev.append((t + d, 0, ch, int(key), 0))
        return t

    def bend(self, t, ch, semis):   # pitch bend (range 2 semitones), value in semitones
        self.ev.append((max(0.0, t), 1, ch, int(np.clip(8192 + semis / 2.0 * 8191, 0, 16383)), 0))


def render(part, cycles=3, length=None, wrap=True):
    """render the part `cycles` times (events wrap at L) -> (2, cycles*LN); with wrap=False a one-shot of `length` s"""
    s = tsf.Synth(samplerate=SR, gain=-3)
    sfid = s.sfload(SF)
    for ch, (bank, preset, drums) in part.progs.items():
        s.program_select(ch, sfid, 128 if drums else bank, preset, is_drums=drums)
        if not drums: s.pitchbend_range(ch, 2.0)
    ev = []
    span = L if wrap else length
    for c in range(cycles if wrap else 1):
        for (t, kind, ch, k, v) in part.ev:
            tt = (t % L) if wrap else t
            ev.append((int((c * span + tt) * SR), kind, ch, k, v))
    ev.sort(key=lambda e: (e[0], e[1]))
    total = int(round((cycles * L if wrap else length) * SR))
    out = np.zeros((total, 2), np.float32); pos = 0
    for (smp, kind, ch, k, v) in ev:
        smp = min(smp, total)
        if smp > pos:
            out[pos:smp] = np.frombuffer(s.generate(smp - pos), dtype=np.float32).reshape(-1, 2); pos = smp
        if kind == 2: s.noteon(ch, k, v)
        elif kind == 1: s.pitchbend(ch, k)
        else: s.noteoff(ch, k)
    if pos < total: out[pos:] = np.frombuffer(s.generate(total - pos), dtype=np.float32).reshape(-1, 2)
    return out.T.copy()

# ------------------------------------------------------------------ dsp helpers (loop-safe)


def add_circ(buf, i0, x):
    i0 %= LN; n = x.shape[-1]
    while n > 0:
        k = min(n, LN - i0); buf[..., i0:i0 + k] += x[..., :k]; x = x[..., k:]; n -= k; i0 = 0


def tile3(buf): return np.tile(buf, (1, 3)) if buf.ndim == 2 else np.tile(buf, 3)


def fx(x, chain): return pb.Pedalboard(chain)(np.atleast_2d(x).astype(np.float32), SR)


def lrate(r): return max(1, round(r * L)) / L


def kick_note(f0, f1, decay, click=0.0, seed=0):
    n = int((decay * 6) * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.035)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay) * (1 - np.exp(-t / 0.001))
    if click:
        c = np.random.default_rng(seed).standard_normal(n) * np.exp(-t / 0.0025)
        x += click * signal.sosfilt(signal.butter(2, 3000, 'lowpass', fs=SR, output='sos'), c)
    return x


def duck_env(depth, rel=0.16, n=None):
    env = np.ones(LN); t = np.arange(int(0.6 * SR)) / SR
    shape = 1 - depth * np.where(t < 0.006, t / 0.006, np.exp(-(t - 0.006) / rel))
    for kt, v in KICKS:
        idx = (int(kt * SR) + np.arange(len(shape))) % LN
        env[idx] = np.minimum(env[idx], 1 - (1 - shape) * v)
    return tile3(env)


def chorus(x, rate, depth_ms, centre_ms, mix):
    x = np.atleast_2d(x); x = x if x.shape[0] == 2 else np.vstack([x, x])
    n = x.shape[-1]; t = np.arange(n) / SR; f = lrate(rate); idx = np.arange(n); out = []
    for c in range(2):
        d = (centre_ms + depth_ms * np.sin(2 * np.pi * f * t + c * np.pi / 2)) / 1000 * SR
        out.append((1 - mix) * x[c] + mix * np.interp(idx - d, idx, x[c]))
    return np.vstack(out)


def plate_ir(path, secs=1.8, decay=1.1, pre=0.012, bright=5200, seed=11):
    if os.path.exists(path): return path
    rg = np.random.default_rng(seed); n = int(secs * SR); t = np.arange(n) / SR
    ir = np.zeros((n, 2), np.float32)
    for c in range(2):
        x = rg.standard_normal(n) * np.exp(-t * 6.9 / decay)
        x = signal.sosfilt(signal.butter(2, bright, 'lowpass', fs=SR, output='sos'), x)
        x = signal.sosfilt(signal.butter(1, 220, 'highpass', fs=SR, output='sos'), x)
        x[: int(pre * SR)] = 0; ir[:, c] = x
    ir /= np.sqrt((ir ** 2).sum(axis=0)).max()
    sf.write(path, ir, SR, subtype='FLOAT'); return path


def send(x, wet, hp=250, lp=5000, ir=None):
    return x + wet * fx(x, [pb.HighpassFilter(hp), pb.LowpassFilter(lp), pb.Convolution(ir or IR_PLATE, mix=1.0)])


def autowah(x, lo=420, hi=2100, K=9, per_beat=2, phase=0.12, q=0.55, dry=0.25):
    """tempo-synced wah: K fixed band-passes, the sweep position (heel->toe per 8th) picks/blends between them"""
    x = np.atleast_2d(x).astype(np.float32); n = x.shape[-1]; t = np.arange(n) / SR
    pos = (t / BEAT * per_beat - phase) % 1.0
    p = np.where(pos < 0.35, pos / 0.35, 1 - (pos - 0.35) / 0.65) ** 1.3          # quick up, slow down
    fcs = lo * (hi / lo) ** (np.arange(K) / (K - 1)); fi = p * (K - 1); i0 = np.clip(np.floor(fi).astype(int), 0, K - 2); w = fi - i0
    out = np.zeros_like(x)
    for k, fc in enumerate(fcs):
        sos = signal.butter(2, [fc * (1 - q / 2), fc * (1 + q / 2)], 'bandpass', fs=SR, output='sos')
        y = signal.sosfilt(sos, x, axis=-1).astype(np.float32)
        wk = np.where(i0 == k, 1 - w, 0.0) + np.where(i0 == k - 1, w, 0.0)
        out += y * wk.astype(np.float32)
    return out * 2.2 + dry * x


def limit(x, ceil_db, look=0.006):
    c = 10 ** (ceil_db / 20); w = int(look * SR)
    a = np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max(axis=0).reshape(-1, 4).max(axis=1)[:x.shape[-1]]
    need = np.minimum(1.0, c / np.maximum(a, 1e-9))
    g = uniform_filter1d(minimum_filter1d(need, 4 * w + 1), 2 * w + 1)
    return x * g


def loud(x): x = np.atleast_2d(x); return meter.integrated_loudness(x.T)


def tp_db(x): return 20 * np.log10(np.abs(signal.resample_poly(np.atleast_2d(x), 4, 1, axis=-1)).max() + 1e-12)

# ------------------------------------------------------------------ parts


KICK_PAT = {0: [(0, 1.0), (0.75, 0.62), (2.5, 0.9)], 1: [(0, 1.0), (1.75, 0.6), (2.25, 0.8), (3.5, 0.55)]}
GHOSTS = {0: [(0.5, 26), (1.75, 34), (2.25, 24), (3.75, 36)], 1: [(0.25, 22), (0.75, 30), (2.75, 34), (3.25, 26)]}


def drum_bar(p, b, t_off=0.0, fills=True):
    """one bar of the groove into Part p (ch 9 kit); returns [(kick time, vel)]"""
    ks = []
    pat = KICK_PAT[b % 2]
    for beat, v in pat:
        t = t_off + bt(b, beat); p.n(t, 0.2, 9, 36, int(100 * v + 10), jit=0.002, vj=3); ks.append((t, v))
    last = fills and b % 8 == 7
    for beat in (1, 3):
        if last and beat == 3: continue
        p.n(t_off + bt(b, beat), 0.25, 9, 38, 112, jit=0.003, vj=4, late=0.008)          # laid-back backbeat
    for beat, v in GHOSTS[b % 2]:
        if last and beat >= 2.5: continue
        p.n(t_off + bt(b, beat), 0.1, 9, 38, v, jit=0.005, vj=5)
    for e in range(16):
        beat = e * 0.25
        if b % 2 == 1 and beat == 3.5: p.n(t_off + bt(b, beat), 0.2, 9, 46, 66, jit=0.003); continue   # open hat, choked next 16th
        acc = [86, 42, 64, 46][e % 4]
        p.n(t_off + bt(b, beat), 0.08, 9, 42, acc, jit=0.004, vj=6)
    if last:
        if b % 16 == 15:   # tom run into the top
            for beat, k, v in ((2.5, 48, 96), (2.75, 48, 84), (3.0, 45, 100), (3.25, 45, 88), (3.5, 43, 104), (3.75, 41, 110)):
                p.n(t_off + bt(b, beat), 0.25, 9, k, v, jit=0.003)
            ks.append((t_off + bt(b, 3.5), 0.6))
        else:              # snare build
            for beat, v in ((3.0, 92), (3.25, 70), (3.5, 96), (3.75, 108)): p.n(t_off + bt(b, beat), 0.15, 9, 38, v, jit=0.003)
    if b == 0: p.n(t_off + bt(b, 0), 1.5, 9, 49, 86, jit=0.0)       # crash on the top of the loop
    if b == 8: p.n(t_off + bt(b, 0), 1.2, 9, 57, 62, jit=0.0)
    return ks


def p_drums():
    p = Part(); p.prog(9, 0, drums=True)
    KICKS.clear()
    for b in range(NBARS): KICKS.extend(drum_bar(p, b))
    KICKS.sort()
    kit = render(p)
    sub = np.zeros((1, LN))
    for i, (kt, v) in enumerate(KICKS): add_circ(sub, int(kt * SR), (kick_note(110, 50, 0.16, 0.25, i) * v)[None])
    sub = tile3(np.vstack([sub, sub]))
    return kit, sub


def p_fill():
    """one bar before the groove: ghosted snare roll -> tom run -> lands on the loop's crash"""
    p = Part(); p.prog(9, 0, drums=True)
    seq = [(0.0, 38, 96), (0.0, 36, 100), (0.5, 38, 46), (0.75, 38, 64), (1.0, 38, 104), (1.25, 38, 40), (1.5, 50, 96), (1.75, 50, 84),
           (2.0, 48, 102), (2.25, 48, 88), (2.5, 45, 106), (2.75, 45, 92), (3.0, 38, 110), (3.0, 36, 96), (3.25, 38, 82), (3.5, 41, 112),
           (3.5, 36, 90), (3.75, 38, 118)]
    for e in range(0, 12):
        if e % 2 == 0: p.n(bt(0, e * 0.25), 0.08, 9, 42, 70 if e % 4 == 0 else 50, jit=0.003)
    ks = []
    for beat, k, v in seq:
        t = p.n(bt(0, beat), 0.25, 9, k, v, jit=0.003, vj=3)
        if k == 36: ks.append((t, v / 110))
    kit = render(p, wrap=False, length=BAR + 1.2)
    sub = np.zeros((1, kit.shape[-1]))
    for i, (kt, v) in enumerate(ks):
        x = kick_note(110, 50, 0.16, 0.25, i) * v; i0 = int(kt * SR); sub[0, i0:i0 + len(x)] += x[:sub.shape[-1] - i0]
    return kit, np.vstack([sub, sub])


def bass_bar(c, b, nxt):
    r, m3 = ROOT[c], third(c)
    if b % 2 == 0:
        pat = [(0.0, 0, .55, 112, 0), (0.75, 0, .12, 62, 0), (1.0, 12, .22, 104, 1), (1.5, 10, .2, 84, 0), (1.75, 12, .14, 90, 1),
               (2.5, m3, .22, 94, 0), (2.75, 5, .22, 90, 0), (3.0, 7, .45, 98, 0), (3.5, 10, .16, 80, 0), (3.75, 12, .15, 96, 1)]
    else:
        pat = [(0.0, 0, .35, 110, 0), (0.5, 0, .08, 58, 0), (0.75, 12, .22, 102, 1), (1.25, 0, .2, 90, 0), (1.75, 10, .2, 86, 0),
               (2.0, 12, .16, 100, 1), (2.5, 7, .22, 88, 0), (2.75, 10, .2, 90, 0), (3.25, m3 if m3 == 3 else 7, .2, 86, 0)]
        nr = ROOT[nxt]; appr = nr - 1 if nr - 1 != r else nr + 1
        pat.append((3.5, appr - r if appr - r > -6 else appr - r + 12, .2, 92, 0))
    return [(beat, r + iv, d, v, pop) for beat, iv, d, v, pop in pat]


def p_bass():
    p = Part(); p.prog(0, 33); p.prog(1, 36)
    sub = np.zeros((1, LN))
    for b in range(NBARS):
        c = chord(b)
        for beat, k, d, v, pop in bass_bar(c, b, chord(b + 1)):
            t = p.n(bt(b, beat), d * BEAT, 1 if pop else 0, k, v, jit=0.004, vj=4)
            if not pop and v > 70:
                nn = int((d * BEAT + 0.08) * SR); tt = np.arange(nn) / SR
                x = np.sin(2 * np.pi * mtof(k) * tt) * np.minimum(1, tt / 0.004) * np.exp(-np.maximum(0, tt - d * BEAT) / 0.03) * (v / 127)
                add_circ(sub, int(t * SR), x[None])
    up = render(p)
    s = tile3(np.vstack([sub, sub]))
    return up / (np.abs(up).max() + 1e-9) + 0.55 * s / (np.abs(s).max() + 1e-9)


GTR_PAT = ['x.mx.mx.mmx.mx.m', 'mmx.mx.xmm.xmx.x']


def p_gtr():
    p = Part(); p.prog(0, 28, bank=8); p.prog(1, 28)
    for b in range(NBARS):
        v = GTR[chord(b)]; pat = GTR_PAT[b % 2]
        for e, ch in enumerate(pat):
            if ch == '.': continue
            t0 = bt(b, e * 0.25); up = e % 2 == 1   # upstrokes: high strings first
            order = v[::-1] if up else v
            for j, k in enumerate(order):
                if ch == 'x': p.n(t0 + j * 0.006, 0.11 * BEAT, 0, k, (100 if e % 4 == 0 else 90) - j * 3, jit=0.003, vj=6)
                else: p.n(t0 + j * 0.004, 0.035, 1, k - 12 if j == 0 else k, 44, jit=0.003, vj=8)
    return render(p)


def p_keys():
    p = Part(); p.prog(0, 4); p.prog(1, 7)
    for b in range(NBARS):
        v = RHO[chord(b)]
        hits = [(0.0, 0.45, 82), (1.75, 0.22, 74), (2.5, 1.1, 80)] if b % 2 == 0 else [(0.75, 0.6, 78), (2.25, 0.2, 70), (3.5, 0.45, 76)]
        for beat, d, vel in hits:
            for j, k in enumerate(v): p.n(bt(b, beat) + j * 0.008, d * BEAT, 0, k, vel - j * 2, jit=0.004)
        lo = v[:2]
        for i, beat in enumerate((0.0, 0.5, 0.75, 1.5, 2.0, 2.75, 3.25) if b % 2 else (0.25, 0.75, 1.25, 2.0, 2.5, 3.0, 3.75)):
            p.n(bt(b, beat), 0.07, 1, lo[i % 2] + 12, 74 if i % 3 == 0 else 58, jit=0.003, vj=6)
    return render(p)


def p_organ():
    p = Part(); p.prog(0, 16)
    for b in range(0, NBARS):
        if b % 2 == 0 or chord(b) != chord(b - 1):
            dur = (2 if b + 1 < NBARS and chord(b + 1) == chord(b) else 1) * BAR - 0.06
            for j, k in enumerate(ORG[chord(b)]): p.n(bt(b, 0) - 0.02 + j * 0.01, dur, 0, k, 70, jit=0.003, vj=3)
    return render(p)


def p_horns():
    p = Part(); p.prog(0, 61); p.prog(1, 66); p.prog(2, 57)
    def stab(t, d, c, vel):
        vv = HRN[c]
        for j, k in enumerate(vv): p.n(t, d, 0, k, vel - 4 * j, jit=0.004, vj=4)
        p.n(t + 0.004, d, 1, vv[1], vel - 6, jit=0.003); p.n(t + 0.002, d, 2, vv[0] - 12, vel - 8, jit=0.003)
    for b in range(NBARS):
        c = chord(b)
        if b % 4 == 1: stab(bt(b, 2.5), 0.12, c, 104); stab(bt(b, 2.75), 0.45, c, 112)
        if b % 4 == 3 and b % 8 != 7: stab(bt(b, 0.75), 0.14, c, 100); stab(bt(b, 1.5), 0.14, c, 96)
        if b % 8 == 6:   # lift into the turnaround
            for beat, vel in ((3.0, 92), (3.25, 98), (3.5, 108)): stab(bt(b, beat), 0.16 if beat < 3.5 else 0.5, c, vel)
        if b % 8 == 7:
            stab(bt(b, 0.0), 0.32, c, 114); stab(bt(b, 1.75), 0.12, c, 100); stab(bt(b, 2.0), 0.6, c, 110)
    return render(p)

# ------------------------------------------------------------------ the hook (lead)
# (beat, beats, key, vel, bend_from_semitones, vibrato)
H = [[(0.5, .2, 71, 92, 0, 0), (0.75, .2, 74, 96, 0, 0), (1.0, 1.1, 76, 108, -2, 1), (2.5, .2, 74, 90, 0, 0), (2.75, .2, 76, 96, 0, 0),
      (3.0, .45, 79, 104, 0, 0), (3.5, 1.9, 76, 100, -1, 1)],
     [(2.5, .2, 74, 88, 0, 0), (2.75, .2, 71, 90, 0, 0), (3.0, .7, 69, 96, 0, 1), (3.75, .22, 67, 84, 0, 0)]]
RSP = [[(0.5, .2, 73, 92, 0, 0), (0.75, .2, 76, 96, 0, 0), (1.0, 1.1, 78, 108, -2, 1), (2.5, .2, 76, 90, 0, 0), (2.75, .2, 78, 94, 0, 0),
        (3.0, .45, 81, 104, 0, 0), (3.5, 1.4, 79, 98, 0, 1)],
       [(2.0, .25, 78, 90, 0, 0), (2.25, .25, 76, 90, 0, 0), (2.5, .45, 73, 94, 0, 0), (3.0, .9, 71, 96, -1, 1)]]
TURN = [[(0.5, .2, 79, 96, 0, 0), (0.75, .2, 81, 100, 0, 0), (1.0, .9, 83, 110, -2, 1), (2.0, .25, 81, 92, 0, 0), (2.25, .25, 79, 92, 0, 0),
         (2.5, .45, 76, 96, 0, 0), (3.0, .9, 71, 100, 0, 1)],
        [(0.5, .2, 75, 92, 0, 0), (0.75, .2, 78, 96, 0, 0), (1.0, .45, 81, 104, 0, 0), (1.5, .45, 78, 96, 0, 0), (2.0, 1.6, 'END', 106, -1, 1)]]
FORM = [H, RSP, H, TURN]           # 8 bars, played twice (bars 0-7, 8-15)
THEME_END = {7: 78, 15: 74}

LEADS = {   # timbre: (kind, bank, preset, octave)
    'gtr': ('gs', 0, 27, 0), 'od': ('gs', 0, 29, 0), 'jazz': ('gs', 0, 26, 0), 'sax': ('gs', 0, 66, -12), 'organ': ('gs', 0, 18, 0),
    'rhodes': ('gs', 0, 4, 0), 'synth': ('gs', 8, 81, 0)}
VARIANTS = {
    'theme':            dict(t='gtr'),
    'shomer':           dict(t='synth', ends={7: 79, 15: 76}),
    'lickpick':         dict(t='od', ends={7: 81, 15: 83}),
    'trashure-hunters': dict(t='sax', ends={7: 76}),
    'chore-royale':     dict(t='organ', ends={15: 79}),
    'fairent':          dict(t='rhodes', ends={7: 75}),
    'milo':             dict(t='jazz', dbl=('jazz', -12), ends={15: 71}),
    'concepts':         dict(t='gtr', dbl=('synth', -12), ends={7: 83, 15: 78}),
}


def lead_notes(var):
    ends = dict(THEME_END); ends.update(var.get('ends', {})); out = []
    for b in range(NBARS):
        ph = FORM[(b % 8) // 2][b % 2]
        for beat, d, k, v, bf, vib in ph:
            if k == 'END': k = ends[b]
            out.append((bt(b, beat), d * BEAT, k, v, bf, vib))
    return out


def lead_part(timbre, notes, shift=0):
    kind, bank, preset, octv = LEADS[timbre]
    p = Part(); p.prog(0, preset, bank=bank)
    for t, d, k, v, bf, vib in notes:
        t = p.n(t, d, 0, k + octv + shift, v, jit=0.005, vj=4, late=0.006)
        if bf:   # scoop/bend into the note
            steps = 10
            for i in range(steps + 1): p.bend(t + i * 0.009, 0, bf * (1 - i / steps) ** 1.5)
        else: p.bend(t - 0.001, 0, 0.0)
        if vib and d > 0.3:
            for i, tt in enumerate(np.arange(t + 0.22, t + d, 0.012)):
                a = min(1.0, (tt - t - 0.22) / 0.3) * 0.22
                p.bend(tt, 0, a * np.sin(2 * np.pi * 5.4 * (tt - t)))
            p.bend(t + d + 0.005, 0, 0.0)
    return render(p)


def p_lead(vname):
    var = VARIANTS[vname]; notes = lead_notes(var)
    y = lead_part(var['t'], notes); y = y / (np.abs(y).max() + 1e-9)
    y = lead_fx(var['t'], y.mean(axis=0, keepdims=True))
    if var.get('dbl'):
        tb, sh = var['dbl']; z = lead_fx(tb, lead_part(tb, notes, sh).mean(axis=0, keepdims=True))
        y = y + 0.55 * z * np.abs(y).max() / (np.abs(z).max() + 1e-9)
    return y


def lead_fx(t, m):
    if t in ('gtr', 'od', 'jazz'):
        drive = {'gtr': 14.0, 'od': 8.0, 'jazz': 10.0}[t]
        m = fx(m, [pb.HighpassFilter(160), pb.Gain(4), pb.Distortion(drive), pb.LowpassFilter(3800), pb.PeakFilter(900, 2.0, 0.8),
                   pb.PeakFilter(2600, -3.0, 1.0), pb.Compressor(-20, 3.0, 8, 160)])
    elif t == 'synth':
        m = fx(m, [pb.HighpassFilter(160), pb.LadderFilter(pb.LadderFilter.Mode.LPF24, 2200, 0.2, 1.4), pb.Compressor(-22, 2.5, 10, 150)])
    else:
        m = fx(m, [pb.HighpassFilter(150), pb.Distortion(4.0), pb.PeakFilter(2900, -5.0, 0.9), pb.LowpassFilter(3600), pb.Compressor(-22, 2.5, 10, 150)])
    return m

# ------------------------------------------------------------------ processing / levels
LUFS = {'drums': -19.0, 'bass': -20.0, 'gtr': -25.5, 'keys': -24.5, 'organ': -29.0, 'horns': -24.5, 'mel': -21.5}
CREST = {'drums': 13.0, 'bass': 10.5, 'gtr': 12.0, 'keys': 13.0, 'organ': 12.0, 'horns': 12.0, 'mel': 11.0}


def drums_chain(kit, sub):
    kit = fx(kit, [pb.HighpassFilter(38), pb.PeakFilter(60, 2.5, 0.9), pb.PeakFilter(420, -3.0, 1.0), pb.PeakFilter(2800, 1.5, 1.0),
                   pb.HighShelfFilter(6500, -4.5, 0.7), pb.LowpassFilter(11000)])
    x = kit + 0.55 * sub
    par = fx(x, [pb.Compressor(-30, 8.0, 2, 90), pb.Distortion(6.0), pb.LowpassFilter(6000)])     # parallel smash
    x = fx(x, [pb.Compressor(-18, 3.0, 6, 110)]) + 0.35 * par
    x = send(x, 0.10, hp=400, lp=5000, ir=IR_ROOM)
    return fx(x, [pb.Distortion(2.0), pb.HighShelfFilter(7000, -2.0, 0.7)])


def process(name, x):
    if name == 'drums':
        x = drums_chain(*x)
    elif name == 'bass':
        x = fx(x, [pb.HighpassFilter(32), pb.Compressor(-24, 4.0, 4, 120), pb.Distortion(5.0), pb.PeakFilter(120, 1.5, 0.8),
                   pb.PeakFilter(350, -2.5, 1.0), pb.PeakFilter(1100, 2.0, 1.0), pb.LowpassFilter(3200)])
        m = x.mean(axis=0, keepdims=True); x = np.vstack([m, m]) * duck_env(0.3)
    elif name == 'gtr':
        x = autowah(x.mean(axis=0, keepdims=True))
        x = fx(x, [pb.HighpassFilter(220), pb.Compressor(-22, 3.0, 4, 90), pb.Distortion(3.0), pb.LowpassFilter(4500), pb.HighShelfFilter(3500, -2.0)])
        m = x[0]; d = np.roll(m, int(0.013 * SR))
        x = np.vstack([0.55 * m + 0.25 * d, 0.95 * m + 0.1 * d])       # sits right, short-delay width to the left
        x = send(x, 0.18, hp=400, lp=4500) * duck_env(0.15)
    elif name == 'keys':
        x = fx(x, [pb.HighpassFilter(120), pb.PeakFilter(280, -2.5, 0.9), pb.Compressor(-24, 2.5, 10, 160), pb.Distortion(4.0), pb.LowpassFilter(5000)])
        tt = np.arange(x.shape[-1]) / SR; f = lrate(BPM / 60 * 1.5)          # stereo tremolo, dotted-8th rate
        x = np.vstack([x[0] * (1 - 0.18 * (1 + np.sin(2 * np.pi * f * tt))) * 1.15, x[1] * (1 - 0.18 * (1 - np.sin(2 * np.pi * f * tt))) * 1.15])
        x = np.vstack([x[0] * 1.0, x[1] * 0.72])                            # leans left (guitar leans right)
        x = send(x, 0.22, hp=300, lp=4500) * duck_env(0.22)
    elif name == 'organ':
        x = fx(x, [pb.HighpassFilter(140), pb.Distortion(5.0), pb.LowpassFilter(3200)])
        x = chorus(x, 5.6, 1.8, 4.0, 0.5)                                    # rotary-ish
        x = send(x, 0.35, hp=300, lp=3500) * duck_env(0.4, 0.22)
    elif name == 'horns':
        x = fx(x, [pb.HighpassFilter(140), pb.PeakFilter(300, -2.0, 0.9), pb.Compressor(-22, 3.0, 3, 100), pb.Distortion(3.0),
                   pb.LowpassFilter(5500), pb.HighShelfFilter(4000, -3.0)])
        x = send(x, 0.3, hp=350, lp=4500)
    else:   # lead: mono, delay + plate
        m = np.atleast_2d(x).mean(axis=0, keepdims=True)
        d = fx(m, [pb.Delay(BEAT * 0.75, 0.32, 1.0), pb.LowpassFilter(2600), pb.HighpassFilter(400)])
        m = m + 0.22 * d
        x = m + 0.28 * fx(m, [pb.HighpassFilter(350), pb.LowpassFilter(4200), pb.Convolution(IR_PLATE, mix=1.0)]).mean(axis=0, keepdims=True)
    role = 'mel' if name.startswith('mel-') else name
    tgt = LUFS[role]
    g1 = 10 ** ((tgt - loud(x[:, LN:2 * LN])) / 20); x = x * g1
    x = limit(x, tgt + CREST[role])
    g2 = 10 ** ((tgt - loud(x[:, LN:2 * LN])) / 20)
    return x * g2, (g1, g2, tgt + CREST[role])


def stereo(x): return np.vstack([x, x]) if x.shape[0] == 1 else x

# ------------------------------------------------------------------ story (zones) and stems
G_ALL = dict(drums=1.0, bass=1.0, gtr=1.0, keys=1.0, organ=1.0, horns=1.0)
STORY = [   # id, where (engine: scroll = fraction of viewport scrolled; sel/at = that point of the element crossing mid-screen), gains, LUFS
    ('hero',       dict(scroll=0),                                   dict(drums=1.0), -19.5),
    ('bass',       dict(sel='.hero', at=0.4, scroll=0.12),           dict(drums=1.0, bass=1.0), -18.5),
    ('guitar',     dict(sel='.hero', at=0.75, scroll=0.3),           dict(drums=1.0, bass=1.0, gtr=1.0), -18.0),
    ('keys',       dict(sel='#work', at=0.0),                        dict(drums=1.0, bass=1.0, gtr=1.0, keys=1.0, organ=1.0), -17.3),
    ('horns',      dict(sel='#work .stage-head', at=1.0),            dict(G_ALL), -16.8),
    ('work',       dict(sel='#work .devices', at=0.12),              dict(G_ALL, mel=1.0), -16.0),
    ('identity',   dict(sel='#identity', at=0.0),                    dict(G_ALL, horns=0.8, mel=0.55), -16.5),
    ('experience', dict(sel='#experience', at=0.0),                  dict(G_ALL, horns=0.7, mel=0.45), -16.6),
    ('about',      dict(sel='#about', at=0.0),                       dict(G_ALL, horns=0.9, mel=0.75), -16.3),
    ('forest',     dict(sel='#contact', at=0.0),                     dict(bass=0.9, gtr=0.55, keys=1.15, organ=1.2), -19.0),
    ('contact',    dict(sel='#contact .contact-inner', at=0.0),      dict(G_ALL, drums=1.05, horns=1.2, mel=1.0), -16.0),
]
PAGE = (dict(G_ALL, drums=0.85, horns=0.6, mel=1.0), -17.0)          # product pages: one zone, their own lead


def build():
    """render + process every stem; returns ({name: loop (ch, LN)}, fill (2, n))"""
    os.makedirs(WORK, exist_ok=True)
    loops = {}
    kit, sub = p_drums()
    y, (g1, g2, ceil) = process('drums', (kit, sub)); loops['drums'] = y[:, LN:2 * LN]
    fk, fs = p_fill()
    fill = limit(drums_chain_once(fk, fs) * g1, ceil) * g2
    print('  %-22s LUFS %6.1f' % ('drums', loud(loops['drums'])))
    for name, fn in (('bass', p_bass), ('gtr', p_gtr), ('keys', p_keys), ('organ', p_organ), ('horns', p_horns)):
        y, _ = process(name, np.atleast_2d(fn())); loops[name] = y[:, LN:2 * LN]
        print('  %-22s LUFS %6.1f' % (name, loud(loops[name])))
    for v in ['theme'] + PRODUCTS:
        y, _ = process('mel-' + v, p_lead(v)); loops['mel-' + v] = y[:, LN:2 * LN]
        print('  %-22s LUFS %6.1f' % ('mel-' + v, loud(loops['mel-' + v])))
    return {k: v.astype(np.float32) for k, v in loops.items()}, fill.astype(np.float32)


def drums_chain_once(kit, sub):
    """same drum chain for the one-shot fill (room send without wrap)"""
    return drums_chain(kit, sub)


def mixdown(st, gains, mel):
    return sum(st[b] * gains.get(b, 0) for b in BEDS) + st['mel-' + mel] * gains.get('mel', 0)


def stems():
    irs()
    loops, fill = build()
    st = {k: stereo(v) for k, v in loops.items()}
    full = STORY[-1][2]
    g0 = 10 ** ((-16.0 - loud(mixdown(st, full, 'theme'))) / 20)
    zones_out = []; cal = {}
    for zid, where, gains, target in STORY + [('page', None, PAGE[0], PAGE[1])]:
        mels = ['theme'] + PRODUCTS if zid in ('work', 'page') else ['theme']
        res = [(loud(mixdown(st, gains, m) * g0), tp_db(mixdown(st, gains, m) * g0)) for m in mels]
        lu = np.mean([r[0] for r in res]); tp = max(r[1] for r in res)
        mk = 10 ** (min(target - lu, -1.5 - tp) / 20)
        mix = {k: round(gains.get(k, 0.0) * mk, 4) for k in BEDS + ['mel']}
        cal[zid] = mix
        print('  zone %-11s LUFS %6.2f TP %6.2f' % (zid, lu + 20 * np.log10(mk), tp + 20 * np.log10(mk)))
        if where is not None: zones_out.append(dict(id=zid, **where, mix=mix))
    os.makedirs(REPO_OUT, exist_ok=True); p = int(PAD * SR)
    files = dict(loops); files['fill'] = fill
    for name, c in files.items():
        f = (c if name == 'fill' else np.concatenate([c[:, -p:], c, c[:, :p]], axis=1)) * g0
        if name.startswith('mel-'): f = f[:1]
        w = os.path.join(WORK, name + '.wav'); sf.write(w, f.T, SR, subtype='FLOAT')
        ob, ab = ('48k', '64k') if name.startswith('mel-') else ('64k', '112k')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'libopus', '-b:a', ob, '-vbr', 'constrained', '-application', 'audio',
                        os.path.join(REPO_OUT, name + '.ogg')], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'aac', '-b:a', ab, '-aac_pns', '0', '-movflags', '+faststart',
                        os.path.join(REPO_OUT, name + '.m4a')], check=True)
    cfg = {'stems': {'loop': round(L, 4), 'bar': round(BAR, 5), 'pad': PAD, 'beds': BEDS, 'melody': 'mel-theme', 'fill': 'fill', 'core': ['drums']},
           'zones': zones_out, 'page': cal['page'],
           'products': {k: {'match': 'work/%s.html' % k, 'file': 'mel-' + k} for k in PRODUCTS}}
    json.dump(cfg, open(os.path.join(REPO_OUT, 'mix.json'), 'w'), indent=1)
    json.dump({'g0': g0}, open(os.path.join(WORK, '_g0.json'), 'w'))
    print(json.dumps(cfg))

# ------------------------------------------------------------------ demo: walk the page


def demo():
    cfg = json.load(open(os.path.join(REPO_OUT, 'mix.json')))
    z = {d['id']: d['mix'] for d in cfg['zones']}
    st = {}
    for name in BEDS + ['mel-' + v for v in ['theme'] + PRODUCTS] + ['fill']:
        y, _ = sf.read(os.path.join(WORK, name + '.wav'), always_2d=True); y = y.T
        st[name] = stereo(y if name == 'fill' else y[:, int(PAD * SR):int(PAD * SR) + LN])
    # (bars, zone, melody)
    plan = [(2, 'hero', 'theme'), (2, 'bass', 'theme'), (2, 'guitar', 'theme'), (2, 'keys', 'theme'), (2, 'horns', 'theme'),
            (2, 'work', 'theme'), (2, 'work', 'shomer'), (2, 'work', 'lickpick'), (2, 'work', 'trashure-hunters'), (2, 'work', 'milo'),
            (4, 'forest', 'theme'), (6, 'contact', 'theme')]
    nb = sum(p[0] for p in plan); t0 = BAR; T = t0 + nb * BAR + 1.5; N = int(T * SR); t = np.arange(N) / SR
    def loopseg(x):
        idx = (np.arange(N) - int(t0 * SR)) % LN; return x[:, idx]
    out = np.zeros((2, N))
    f = st['fill']; k = min(N, f.shape[1]); out[:, :k] += f[:, :k] * z['hero']['drums']
    bars = []
    for nbars, zid, mel in plan: bars += [(zid, mel)] * nbars
    def env(fn):   # per-bar target -> 1 s linear ramp from each bar line (engine behaviour)
        e = np.zeros(N); cur = 0.0
        for i, (zid, mel) in enumerate(bars):
            v = fn(zid, mel); a = int((t0 + i * BAR) * SR); b = int((t0 + (i + 1) * BAR) * SR)
            r = np.arange(b - a) / SR; e[a:b] = np.where(r < 1.0, cur + (v - cur) * r, v); cur = v
        e[int((t0 + nb * BAR) * SR):] = cur
        return e
    for b in BEDS:
        out += loopseg(st[b]) * env(lambda zid, mel, b=b: z[zid].get(b, 0))
    for v in ['theme'] + PRODUCTS:
        if not any(m == v for _, m in bars): continue
        e = np.zeros(N); cur = 0.0
        for i, (zid, mel) in enumerate(bars):   # melody swaps: 0.6 s fade ending on the bar line
            tgt = z[zid].get('mel', 0) if mel == v else 0.0
            a = int((t0 + i * BAR - 0.6) * SR); bb = int((t0 + (i + 1) * BAR - 0.6) * SR); r = np.arange(bb - a) / SR
            e[max(0, a):bb] = np.where(r < 0.6, cur + (tgt - cur) * r / 0.6, tgt)[max(0, -a):]; cur = tgt
        e[int((t0 + nb * BAR - 0.6) * SR):] = cur
        out += loopseg(st['mel-' + v]) * e
    y = master(out)
    fo = int(3.0 * SR); y[:, -fo:] *= np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
    os.makedirs(DEMO_DIR, exist_ok=True)
    wav = os.path.join(WORK, '_demo.wav'); sf.write(wav, y.T, SR, subtype='FLOAT')
    mp3 = os.path.join(DEMO_DIR, 'score-v5-demo.mp3')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '256k', mp3], check=True)
    report(mp3, 'demo')
    # full band loop alone (the contact mix), for the loudness spec
    full = master(sum(stereo(st[b]) * z['contact'].get(b, 0) for b in BEDS) + st['mel-theme'] * z['contact']['mel'])
    w2 = os.path.join(WORK, '_full.wav'); sf.write(w2, full.T, SR, subtype='FLOAT'); report(w2, 'full band loop (mastered)')
    raw = sum(stereo(st[b]) * z['contact'].get(b, 0) for b in BEDS) + st['mel-theme'] * z['contact']['mel']
    w3 = os.path.join(WORK, '_raw.wav'); sf.write(w3, raw.T, SR, subtype='FLOAT'); report(w3, 'full band as summed on site (x1)')


def master(y):
    y = fx(y, [pb.HighpassFilter(30), pb.Compressor(-18, 2.0, 25, 200), pb.HighShelfFilter(8000, -1.5), pb.LowpassFilter(15000)])
    y = y * 10 ** ((-18.5 - loud(y)) / 20); y = np.tanh(y * 1.4) / 1.4
    drive = -16.0 - loud(y)
    for _ in range(6):
        out = limit(y * 10 ** (drive / 20), -1.6)
        drive += -16.0 - loud(out)
    return out


def report(path, label):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    summ = r[r.rfind('Summary:'):]
    I = float(summ.split('I:')[1].split('LUFS')[0]); TP = float(summ.split('Peak:')[1].split('dBFS')[0])
    d = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True)
    y = np.frombuffer(d.stdout, np.float32).reshape(-1, 2).T; m = y.mean(axis=0)
    P = np.abs(np.fft.rfft(m)) ** 2; f = np.fft.rfftfreq(len(m), 1 / SR)
    hi = P[f > 4000].sum() / P.sum() * 100
    print('  %-34s %.1f s  I %.1f LUFS  TP %.1f dBTP  >4kHz %.2f%%' % (label, y.shape[1] / SR, I, TP, hi))


IR_PLATE = IR_ROOM = None


def irs():
    global IR_PLATE, IR_ROOM
    os.makedirs(WORK, exist_ok=True)
    IR_PLATE = plate_ir(os.path.join(WORK, '_plate.wav'))
    IR_ROOM = plate_ir(os.path.join(WORK, '_room.wav'), secs=0.7, decay=0.35, pre=0.004, bright=6000, seed=5)


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if cmd in ('stems', 'all'): stems()
    if cmd in ('demo', 'all'): irs(); demo()
