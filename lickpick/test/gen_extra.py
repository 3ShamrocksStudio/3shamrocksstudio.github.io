# Extra regression takes (own cases): meters, extreme tempi, swing 140, minor keys, power chords, finger-picking.
# Reuses the QA generator's Karplus-Strong guitar (gen_qa.py, functions only) with its own seed.
# usage: python3 gen_extra.py gen_qa.py OUTDIR [x|y|z]
import sys, os, json, numpy as np, wave
QA = sys.argv[1]; OUT = sys.argv[2]; MODE0 = sys.argv[3] if len(sys.argv) > 3 else 'x'; os.makedirs(OUT, exist_ok=True)
src = open(QA).read(); src = src[:src.index("MAJ = [0, 2, 4")]
g = {'__name__': 'gen'}; sys.argv = [QA, OUT]; exec(src, g)
g['rng'] = np.random.default_rng(1234); SR = g['SR']; NOTE = g['NOTE']
strum, pluck, jit, chord_midis, lfilter = g['strum'], g['pluck'], g['jit'], g['chord_midis'], g['lfilter']
def power_midis(name):
    r = NOTE[name.rstrip('5')]; root = 40 + ((r - 4) % 12); return [root, root + 7, root + 12]
def render(name, dur, bpm, key, prog, meter=4, kind='8ths', swing=False, sub=2, start=0.0, cpb=1):
    rng = g['rng']; buf = np.zeros(int((dur + 2) * SR)); P = 60 / bpm
    beats = list(np.arange(start, dur, P))
    for bi, b in enumerate(beats):
        bar, pos = bi // meter, bi % meter; ch = prog[(bar * cpb + (pos * cpb) // meter) % len(prog)]
        if kind == 'waltz':      # oom-pah-pah: bass+full strum on 1, light upper strums on 2,3
            if pos == 0: strum(buf, b + jit(), ch, True, 1.0, P * 0.95, 6)
            else: strum(buf, b + jit(), ch, True, 0.5, P * 0.6, 3)
        elif kind == '68':       # beat = dotted quarter, 3 eighths: strong, weak, weak
            for k in range(3):
                t = b + k * P / 3 + jit(0.006)
                if k == 0: strum(buf, t, ch, True, 1.0 if pos == 0 else 0.8, P * 0.33, 6)
                else: strum(buf, t, ch, k == 1, 0.45, P * 0.3, 4)
        elif kind == '16ths':    # D . D U . U D U in 16ths (pop strum at a slow tempo)
            for k, (on, dn, v) in enumerate([(1, 1, 1.0), (0, 0, 0), (1, 1, 0.5), (1, 0, 0.45)] if pos % 2 == 0 else [(1, 1, 0.85), (1, 0, 0.45), (1, 1, 0.55), (1, 0, 0.45)]):
                if on: strum(buf, b + k * P / 4 + jit(0.004), ch, bool(dn), v, P * 0.24, 6 if k == 0 else 4)
        elif kind == 'downs':    # all-down 8ths, 3 strings (punk)
            for k in range(2): strum(buf, b + k * P / 2 + jit(0.005), ch, True, (1.0 if pos in (0, 2) else 0.85) if k == 0 else 0.7, P * 0.45, 3)
        elif kind == 'quarters':
            strum(buf, b + jit(0.005), ch, True, 1.0 if pos == 0 else 0.85, P * 0.8, 4)
        elif kind == 'power':    # palm-muted-ish 8ths on power chords, accent on beats
            pm = power_midis(ch)
            for k in range(2):
                t = b + k * P / 2 + jit(0.005)
                for s, mi in enumerate(pm):
                    sig = g['ks'](mi)[:int(P * 0.42 * SR)].copy(); fd = int(.02 * SR); sig[-fd:] *= np.linspace(1, 0, fd)
                    g['add'](buf, t + s * 0.004, sig, (0.32 if k == 0 else 0.2) * rng.uniform(0.9, 1.05))
        elif kind == 'arp':      # finger-picked: bass on the beat, then upper chord tones as 8ths (p-i-m-a)
            m = chord_midis(ch); order = [0, 3, 4, 3] if pos % 2 == 0 else [1, 3, 5, 4]
            for k in range(2):
                t = b + k * P / 2 + (P / 6 if (swing and k) else 0) + jit(0.006)
                idx = order[(pos * 2 + k) % 4] if k else (0 if pos % 2 == 0 else 1)
                pluck(buf, t, m[idx], 1.0 if k == 0 else 0.7, P * 1.2)
        else:                    # '8ths' D DU .U DU pattern (as the QA takes)
            pat = [(1, 0), (1, 1), (0, 1), (1, 1)][pos % 4]; off = b + (P * 2 / 3 if swing else P / 2); acc = 1.0 if pos in (0, 2) else 0.85
            if pat[0]: strum(buf, b + jit(), ch, True, acc, P * (0.5 if pat[1] else 0.95), 6)
            if pat[1]: strum(buf, off + jit(), ch, False, 0.55, P * 0.45, 4)
    buf += rng.normal(0, 10 ** (-52 / 20), len(buf)); buf = buf[:int(dur * SR)]; buf /= np.abs(buf).max() * 1.12
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32767).astype('<i2').tobytes())
    return {'name': name, 'dur': dur, 'key': key, 'beats': [round(float(x), 5) for x in beats if x < dur], 'gaps': [], 'played_from': start,
            'bpm0': bpm, 'bpm1': bpm, 'swing': swing or kind == '68', 'meter': 6 if kind == '68' else meter, 'kind': kind}
MODE = MODE0
T = []
if MODE == 'x':
    T.append(render('x1_waltz90', 70, 90, 'G', ['G', 'C', 'D', 'G'], meter=3, kind='waltz'))
    T.append(render('x2_68_60', 75, 60, 'Dm', ['Dm', 'Bb', 'C', 'Dm'], meter=2, kind='68'))
    T.append(render('x3_swing140', 70, 140, 'E', ['E', 'A', 'E', 'B'], swing=True))
    T.append(render('x4_slow60', 80, 60, 'C', ['C', 'Am', 'F', 'G']))
    T.append(render('x5_fast180', 60, 180, 'A', ['A', 'D', 'E', 'D'], kind='quarters'))
    T.append(render('x6_minor100', 70, 100, 'Bm', ['Bm', 'G', 'D', 'A']))
    T.append(render('x7_minor76', 75, 76, 'Dm', ['Dm', 'Gm', 'A', 'Dm']))
    T.append(render('x8_power120', 65, 120, 'Em', ['E5', 'G5', 'A5', 'C5'], kind='power'))
    T.append(render('x9_arp76', 75, 76, 'C', ['C', 'Am', 'F', 'G'], kind='arp'))
    T.append(render('x10_arp92m', 70, 92, 'Am', ['Am', 'Dm', 'E', 'Am'], kind='arp'))
elif MODE == 'y':
    g['rng'] = np.random.default_rng(99)
    T.append(render('y1_16ths72', 70, 72, 'G', ['G', 'D', 'Em', 'C'], kind='16ths'))
    T.append(render('y2_2chords96', 70, 96, 'D', ['D', 'G', 'A', 'D', 'Bm', 'G', 'A', 'A'], cpb=2))
    T.append(render('y3_shuffle120m', 70, 120, 'Gm', ['Gm', 'Cm', 'Gm', 'D'], swing=True))
    T.append(render('y4_arp3_108', 70, 108, 'F', ['F', 'Bb', 'C', 'F'], meter=3, kind='arp'))
    T.append(render('y5_rock2ch140', 65, 140, 'Am', ['Am', 'F', 'C', 'G'], kind='8ths', cpb=2))
if MODE == 'z':   # training-only augmentation: every pattern at varied tempi/keys/seeds
    T = []; R = np.random.default_rng(2024)
    KEYS = [('C', ['C', 'G', 'Am', 'F']), ('G', ['G', 'Em', 'C', 'D']), ('D', ['D', 'Bm', 'G', 'A']), ('A', ['A', 'E', 'F#m', 'D']), ('E', ['E', 'B', 'C#m', 'A']), ('F', ['F', 'Dm', 'Bb', 'C']),
            ('Am', ['Am', 'F', 'C', 'G']), ('Em', ['Em', 'C', 'G', 'D']), ('Dm', ['Dm', 'Bb', 'F', 'C']), ('Bm', ['Bm', 'G', 'D', 'A']), ('Gm', ['Gm', 'Eb', 'Bb', 'F'])]
    SPEC = [('8ths', 4, False, (60, 140)), ('8ths', 4, True, (80, 150)), ('quarters', 4, False, (110, 185)), ('arp', 4, False, (60, 120)), ('16ths', 4, False, (60, 95)),
            ('waltz', 3, False, (80, 160)), ('68', 2, False, (45, 75)), ('power', 4, False, (90, 170)), ('downs', 4, False, (110, 180)), ('arp', 3, False, (70, 130))]
    i = 0
    for rep in range(4):
        for kind, meter, sw, (lo, hi) in SPEC:
            bpm = float(np.round(R.uniform(lo, hi))); key, prog = KEYS[R.integers(len(KEYS))]
            if kind == 'power': prog = [c.rstrip('m') + '5' for c in prog]
            g['rng'] = np.random.default_rng(500 + i)
            T.append(render(f'z{i:02d}_{kind}{meter}{"s" if sw else ""}_{int(bpm)}', 45, bpm, key, prog, meter=meter, kind=kind, swing=sw, cpb=int(R.integers(1, 3)) if kind in ('8ths', 'downs') else 1)); i += 1
json.dump(T, open(os.path.join(OUT, 'truth.json'), 'w'))
print('ok', [t['name'] for t in T])
