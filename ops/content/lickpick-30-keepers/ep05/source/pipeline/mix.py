"""30 Keepers audio: plays the exact notes from data.json (the same file the picture reads), so every dot
that lights up is the note you hear. Guitar + a light original groove, GeneralUser GS v2.0.3 via tinysoundfont.
python3 mix.py <ep>/data.json <out.wav> <path/to/GeneralUser.sf2>
"""
import sys, json, os
import numpy as np, soundfile as sf, pyloudnorm as pyln, tinysoundfont as tsf
from pedalboard import Pedalboard, Reverb, Compressor, Limiter, HighpassFilter, LowpassFilter, Chorus, Distortion, Delay
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import SR, tick, whoosh, sub_hit, place, pop, rng

E = json.load(open(sys.argv[1])); OUT = sys.argv[2]; SF2 = sys.argv[3]
B = E['beat']; DUR = E['dur']; N = int(DUR * SR); P = E['phases']
g = E['groove']; style = g['style']; swing = style == 'shuffle'
r = np.random.default_rng(11)

def render(events, programs, bends=(), pb_range=None):
    syn = tsf.Synth(samplerate=SR, gain=-3); sid = syn.sfload(SF2)
    for ch, (bank, prog) in programs.items():
        syn.program_select(ch, sid, bank, prog, is_drums=(bank == 128))
        if pb_range and 4 <= ch <= 8: syn.pitchbend_range(ch, pb_range)
    evs = []
    for t, ch, k, v, d in events:
        if t >= DUR: continue
        evs.append((max(0, t), 1, ch, k, int(np.clip(v, 1, 127)))); evs.append((min(DUR, t + d), 0, ch, k, 0))
    for t, ch, val in bends:       # pitch-wheel moves (order 0.5: after note-offs, before note-ons at the same instant)
        if t < DUR: evs.append((max(0, t), .5, ch, val, 0))
    evs.sort(key=lambda e: (e[0], e[1]))
    out = np.zeros((N, 2), np.float32); pos = 0
    for t, on, ch, k, v in evs + [(DUR, 0, 0, 0, 0)]:
        s = min(N, int(t * SR))
        if s > pos: out[pos:s] = np.frombuffer(syn.generate(s - pos), dtype=np.float32).reshape(-1, 2); pos = s
        if on == .5: syn.pitchbend(ch, int(k))
        elif on: syn.noteon(ch, k, v)
        else:
            try: syn.noteoff(ch, k)
            except Exception: pass
    return out.astype(np.float64)

def sw(beat):  # beat position -> seconds, with shuffle on off-beat 8ths
    w = int(np.floor(beat + 1e-9)); f = beat - w
    if swing and abs(f - .5) < 1e-6: f = 2 / 3
    return (w + f) * B

# ---------------- guitar: the lesson notes, exactly as on screen ----------------
gt = []
for k in (45, 52, 57): gt.append((0.0, 0, k, 108, 1.3 * B))                 # hook stab: A5 power chord (s6f5, s5f7, s4f7)
for n in E.get('pre_run', []): gt.append((n['t'], 0, n['m'], 78 + r.integers(-6, 6), B * .5))
gap = E['run'][1]['t'] - E['run'][0]['t']
for n in E['run']: gt.append((n['t'], 0, n['m'], 82 + r.integers(-6, 6), gap * 1.6))
for n in E['extra']: gt.append((n['t'], 0, n['m'], 112, B * 1.2))
for h in E.get('hits', []):
    if h['play']: gt.append((h['t'], 0, h['m'], 96, B * .95))
# bends: each on its own channel (pitch range 4 semitones, so a whole step = wheel 12288 exactly) and never reset
BR = 4.0; pbs = []; bend_ch = 4
def bend_curve(b):   # same curve as reel.html bendP(): sin ease up over 'up' seconds, then hold
    out = [(b['t'] - .001, bend_ch, 8192)]
    for x in np.arange(0, 1.0001, .004 / b['up']):
        x = min(1.0, x); out.append((b['t'] + x * b['up'], bend_ch, int(round(8192 + 8192 * b['semis'] / BR * np.sin(np.pi / 2 * x)))))
    return out
bend_list = [b for b in E.get('bends', []) if b['kind'] != 'lick']
for rep in (0.0, P['replay'] - E['lick'][0]['t']):
    for n in E['lick']:
        vel = (108 if n['i'] == 1 else 100) + r.integers(-5, 5) - (10 if rep else 0)
        if 'bend' in n:
            bend_list.append({'t': n['t'] + rep, 'up': n['up'], 'hold': n['t'] + rep + n['dur'] * .95, 'semis': n['bend'], 'm': n['m'], 'v': vel})
            continue
        gt.append((n['t'] + rep, 0, n['m'], vel, n['dur'] * .95))
gprog = {0: (0, E.get('gprog', 29 if swing else 27))}   # overdrive guitar for the blues, clean guitar otherwise (or per episode)
for b in bend_list:
    gprog[bend_ch] = gprog[0]
    gt.append((b['t'], bend_ch, b['m'], b.get('v', 104), b['hold'] - b['t'])); pbs += bend_curve(b); bend_ch += 1
assert bend_ch <= 9, 'too many bend channels'
gtr = render(gt, gprog, pbs, pb_range=BR)
if os.environ.get('GTRSTEM'): sf.write(os.environ['GTRSTEM'], gtr, SR, subtype='PCM_24')   # dry guitar, for bend_check.py
fx_chain = [HighpassFilter(90), Chorus(rate_hz=.6, depth=.12, mix=.18)]
if swing: fx_chain = [HighpassFilter(90), LowpassFilter(5200)]
fx_chain += [Delay(delay_seconds=B * .75, feedback=.18, mix=.10), Reverb(room_size=.35, damping=.5, wet_level=.14, dry_level=.9, width=.6)]
gtr = Pedalboard(fx_chain)(gtr.T.astype(np.float32), SR).T.astype(np.float64)

# ---------------- band: a light original groove under it ----------------
bd = []
nbeats = int(DUR / B) + 1
TL = g['timeline']                          # [(beat, name, voicing, root)], checked in theory.py
def chord_at(beat):
    c = TL[0]
    for x in TL:
        if x[0] <= beat + 1e-9: c = x
    return c
# pad: one sustained chord per harmony segment
for i, (cb, name, voic, root) in enumerate(TL):
    ce = TL[i + 1][0] if i + 1 < len(TL) else DUR / B
    for k in voic[:3]: bd.append((cb * B, 3, k, 34, (ce - cb) * B))
    if abs(cb - round(cb / 4) * 4) > 1e-6:   # a change off the bar line gets its own keys hit + bass root
        for k in voic: bd.append((cb * B, 2, k, 52, B * 1.4))
        bd.append((cb * B, 1, root - 12 if root > 47 else root, 86, B * .7))
for bar in range(nbeats // 4 + 1):
    b0 = bar * 4
    if b0 * B >= DUR: break
    # keys: soft electric-piano comp
    for k in chord_at(b0)[2]: bd.append((sw(b0), 2, k, 50, B * 1.6))
    for k in chord_at(b0 + 2.5)[2]: bd.append((sw(b0 + 2.5), 2, k, 40, B * .4))
    def R(bb):
        rt = chord_at(b0 + bb)[3]; return rt - 12 if rt > 47 else rt
    # bass
    if style == 'shuffle':
        walk = [0, 4, 7, 9, 10, 9, 7, 4]
        for i, iv in enumerate(walk): bd.append((sw(b0 + i * .5), 1, R(i * .5) + iv, 84 if i % 2 == 0 else 70, B * .42))
    elif style == 'bright':
        for i, iv in enumerate([0, 7, 12, 7]): bd.append((sw(b0 + i), 1, R(i) + iv, 82, B * .85))
    else:
        for bb, iv, v in [(0, 0, 90), (1.5, 0, 66), (2, 7, 78), (3, 10, 70), (3.5, 12, 60)]: bd.append((sw(b0 + bb), 1, R(bb) + iv, v, B * .45))
    # drums
    for beat in range(4):
        tb = b0 + beat
        if beat in (0, 2): bd.append((sw(tb), 9, 36, 92, .2))
        if beat in (1, 3): bd.append((sw(tb), 9, 38 if style != 'bright' else 37, 64 if style != 'bright' else 74, .2))
        bd.append((sw(tb), 9, 42, 50, .1)); bd.append((sw(tb + .5), 9, 42, 34, .1))
        if style == 'bright': bd.append((sw(tb + .5), 9, 54, 42, .1))
    bd.append((sw(b0 + 2.5), 9, 36, 60, .2))
# crash on the end card, a short snare pickup into the wipe
bd.append((P['end'], 9, 49, 84, 1.5))
for i in range(4): bd.append((P['wipe'] - B + i * B / 4, 9, 38, 50 + 10 * i, .1))
bprog = {1: (0, 33), 2: (0, 4), 3: (0, 89), 9: (128, 0)}
band = render(bd, bprog)
band = Pedalboard([HighpassFilter(35), Reverb(room_size=.3, wet_level=.08, dry_level=1, width=.8)])(band.T.astype(np.float32), SR).T.astype(np.float64)
t = np.arange(N) / SR
# band sits under the guitar; it ducks a touch while the lick plays so the lesson notes stay in front
duck = np.ones(N)
l0, l1 = E['lick'][0]['t'] - .1, E['lick'][-1]['t'] + E['lick'][-1]['dur']
duck -= .25 * np.clip((t - l0) / .2, 0, 1) * np.clip((l1 - t) / .3, 0, 1)
band *= duck[:, None] * (0.6 + 0.4 * np.clip(t / (P['board'] + .5), 0, 1))[:, None]

# ---------------- sound design (light) ----------------
fx = np.zeros((N, 2))
place(fx, sub_hit(50, 1.2, .5), 0.0)
for i in range(len(E['chips'])): place(fx, tick(2600 + 140 * i, g=.10), P['chips'] + i * B / 2)
place(fx, pop(.30), P['stamp']); place(fx, sub_hit(45, 1.0, .35), P['stamp'])
place(fx, whoosh(.75, .22), P['wipe'] - .15, (1, .85))
if E.get('slide'): place(fx, whoosh(P['slide_end'] - P['slide'] + .2, .18, up=False), P['slide'] - .1, (.85, 1))

mix = 1.0 * gtr + 0.36 * band + 0.45 * fx
if os.environ.get("STEMS"):
    mm = pyln.Meter(SR)
    for nm, x in (("gtr", gtr), ("band", 0.36 * band), ("fx", 0.45 * fx)): print(nm, "LUFS %.1f" % mm.integrated_loudness(x), "peak %.1f" % (20 * np.log10(np.abs(x).max() + 1e-9)))
mix = Pedalboard([HighpassFilter(28), Compressor(threshold_db=-16, ratio=2, attack_ms=10, release_ms=150)])(mix.T.astype(np.float32), SR).T.astype(np.float64)
mix *= np.clip((DUR - t) / 0.6, 0, 1)[:, None] * np.clip(t / 0.004, 0, 1)[:, None]
m = pyln.Meter(SR)
from scipy.ndimage import minimum_filter1d
def peak_limit(x, ceil_db=-3.0, look=0.004, rel=0.08):
    """transparent lookahead peak limiter, no make-up gain: gain never lets |x| exceed the ceiling"""
    c = 10 ** (ceil_db / 20); a = np.abs(x).max(1) + 1e-12
    gmin = np.minimum(1, c / a); la = int(look * SR)
    gmin = minimum_filter1d(gmin, size=2 * la + 1, mode='nearest')        # look ahead + hold
    out = np.empty_like(gmin); gcur = 1.0; k = np.exp(-1 / (rel * SR))
    for i in range(len(gmin)):                                             # instant attack, smooth release
        gcur = gmin[i] if gmin[i] < gcur else gmin[i] + (gcur - gmin[i]) * k
        out[i] = gcur
    return x * out[:, None]
for _ in range(4):
    L = m.integrated_loudness(mix); mix *= 10 ** ((-14 - L) / 20); mix = peak_limit(mix)
sf.write(OUT, mix, SR, subtype='PCM_24')
print(os.path.basename(OUT), 'LUFS %.2f' % m.integrated_loudness(mix), 'sample peak %.2f dBFS' % (20 * np.log10(np.abs(mix).max())))
