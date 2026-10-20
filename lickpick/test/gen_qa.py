# Independent test takes: Karplus-Strong strummed guitar with known beats + key.
import numpy as np, json, os, sys, subprocess
from scipy.signal import lfilter
SR = 44100
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)
_cache = {}
def ks(midi, dur=2.2):
    k = (midi, round(dur, 2))
    if k in _cache: return _cache[k]
    f = 440 * 2 ** ((midi - 69) / 12); N = int(SR / f)
    n = int(dur * SR); x = np.zeros(n); x[:N] = rng.uniform(-1, 1, N)
    x[:N] = lfilter([0.6], [1, -0.4], x[:N])  # softer pluck
    g = 0.996
    a = np.zeros(N + 2); a[0] = 1; a[N] = -0.5 * g; a[N + 1] = -0.5 * g
    y = lfilter([1], a, x); y /= (np.abs(y).max() + 1e-9)
    _cache[k] = y; return y
NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'Eb': 3, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'Ab': 8, 'G#': 8, 'A': 9, 'Bb': 10, 'A#': 10, 'B': 11}
def chord_midis(name):
    minor = name.endswith('m'); r = NOTE[name.rstrip('m')]
    third = 3 if minor else 4
    root = 40 + ((r - 4) % 12)  # lowest root from E2
    return [root, root + 7, root + 12, root + 12 + third, root + 19, root + 24]
def add(buf, t, sig, gain):
    i = int(round(t * SR))
    if i < 0 or i >= len(buf): return
    j = min(len(buf), i + len(sig)); buf[i:j] += gain * sig[:j - i]
def strum(buf, t, chord, down=True, vel=1.0, ring=0.6, nstr=6, spread=0.012):
    m = chord_midis(chord); m = m if down else m[::-1]; m = m[:nstr]
    for s, mi in enumerate(m):
        sig = ks(mi).copy(); L = int((ring + 0.05) * SR); sig = sig[:L].copy()
        fade = int(0.03 * SR);
        if len(sig) > fade: sig[-fade:] *= np.linspace(1, 0, fade)
        add(buf, t + s * spread * rng.uniform(0.7, 1.3), sig, vel * 0.18 * rng.uniform(0.85, 1.1))
def pluck(buf, t, midi, vel=1, ring=0.4):
    sig = ks(midi)[:int((ring + .05) * SR)].copy(); fade = int(.03 * SR); sig[-fade:] *= np.linspace(1, 0, fade); add(buf, t, sig, vel * .35)
def jit(sd=0.008): return float(np.clip(rng.normal(0, sd), -0.015, 0.015))

def beat_times(bpm_fn, dur, start=0.0):
    # integrate tempo: bpm_fn(t) -> bpm
    B = []; t = start
    while t < dur: B.append(t); t += 60.0 / bpm_fn(t)
    return B

def render(name, dur, bpm_fn, key, prog, style='8ths', start=0.0, gaps=(), swing=False, melody=False, lead_noise=0.0, scale=None):
    buf = np.zeros(int((dur + 2) * SR))
    beats = beat_times(bpm_fn, dur, start)
    played = []
    for bi, b in enumerate(beats):
        if any(g0 <= b < g1 for g0, g1 in gaps): continue
        nb = beats[bi + 1] if bi + 1 < len(beats) else b + 60 / bpm_fn(b)
        P = nb - b; bar = bi // 4; ch = prog[bar % len(prog)]; pos = bi % 4
        off = b + (P * 2 / 3 if swing else P / 2)
        if melody:
            sc = scale; deg = [0, 2, 4, 2, 5, 4, 2, 0, 4, 5, 7, 5, 4, 2, 1, 0]
            m = 57 + NOTE[key.rstrip('m')] % 12 + 12
            mi = m + sc[deg[(bi * 2) % 16] % 7] + (12 if deg[(bi * 2) % 16] >= 7 else 0)
            pluck(buf, b + jit(), mi, 1.0 if pos == 0 else 0.8, P * 0.45)
            if rng.random() < 0.7: mi2 = m + sc[deg[(bi * 2 + 1) % 16] % 7]; pluck(buf, off + jit(), mi2, 0.6, P * 0.4)
            if pos == 0: strum(buf, b + jit(), ch, True, 0.35, P * 1.8, 4)  # light bass+chord at bar start
            played.append(b); continue
        if style == '8ths':     # D . D U . U D U  over a bar of 8ths → per beat: beat 1: D, beat2: D U, beat3: . U, beat4: D U
            pat = [(1, 0), (1, 1), (0, 1), (1, 1)][pos]
        elif style == 'downs':  # all down 8ths (punk/rock)
            pat = (1, 1)
        else: pat = (1, 1)
        acc = 1.0 if pos in (0, 2) else 0.85
        if pat[0]: strum(buf, b + jit(), ch, True, acc, P * (0.5 if pat[1] else 0.95), 6 if style != 'downs' else 3); played.append(b)
        if pat[1]: strum(buf, off + jit(), ch, style == 'downs', 0.55 if style != 'downs' else 0.7, P * 0.45, 4 if style != 'downs' else 3)
    # room noise
    buf += rng.normal(0, 10 ** (-52 / 20), len(buf))
    if lead_noise:
        n = int(lead_noise * SR); buf[:n] += lfilter([1], [1, -0.97], rng.normal(0, 0.004, n))  # rumbly noise intro
    buf = buf[:int(dur * SR)]; buf /= np.abs(buf).max() * 1.12
    wav = os.path.join(OUT, name + '.wav')
    import wave
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32767).astype('<i2').tobytes())
    true_beats = [b for b in beats if b < dur]
    return {'name': name, 'dur': dur, 'key': key, 'beats': [round(x, 5) for x in true_beats], 'gaps': list(gaps), 'played_from': start,
            'bpm0': bpm_fn(start), 'bpm1': bpm_fn(dur - 1), 'swing': swing}

MAJ = [0, 2, 4, 5, 7, 9, 11]
T = []
T.append(render('t1_ballad70', 90, lambda t: 70, 'D', ['D', 'A', 'Bm', 'G']))
T.append(render('t2_shuffle92', 90, lambda t: 92, 'Am', ['Am', 'Dm', 'Am', 'E'], swing=True))
T.append(render('t3_rock128', 75, lambda t: 128, 'Em', ['Em', 'C', 'G', 'D'], style='downs'))
T.append(render('t4_punk160', 75, lambda t: 160, 'G', ['G', 'C', 'D', 'C'], style='downs'))
T.append(render('t5_drift100to105', 125, lambda t: 100 * (1 + 0.05 * min(t, 120) / 120), 'C', ['C', 'G', 'Am', 'F']))
# 110 BPM, 2-bar break starting at bar 20 (beat 80)
b110 = 60 / 110
T.append(render('t6_break110', 80, lambda t: 110, 'F', ['F', 'C', 'Dm', 'Bb'], gaps=[(80 * b110 - 0.01, 88 * b110 - 0.01)]))
T.append(render('t7_silence4_96', 70, lambda t: 96, 'Bb', ['Bb', 'Eb', 'F', 'Gm'], start=4.0, lead_noise=4.0))
T.append(render('t8_melody84', 80, lambda t: 84, 'A', ['A', 'D', 'E', 'A'], melody=True, scale=MAJ))
T.append(render('t9_long6min120', 360, lambda t: 120, 'E', ['E', 'C#m', 'A', 'B']))
json.dump(T, open(os.path.join(OUT, 'truth.json'), 'w'))
print('ok', [t['name'] for t in T])
