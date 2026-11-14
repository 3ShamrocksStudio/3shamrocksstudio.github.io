"""Measure the pitch of every bend in the rendered dry guitar stem (mix.py with GTRSTEM=...) and compare it with the
note the picture claims: flat bend must be clearly flat, in-tune bends must hit the ghost target within 10 cents.
python3 bend_check.py <ep>/data.json <gtr-stem.wav>"""
import sys, json, numpy as np, soundfile as sf
E = json.load(open(sys.argv[1])); x, SR = sf.read(sys.argv[2]); x = x.mean(1)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
bends = [b for b in E.get('bends', []) if b['kind'] != 'lick']
rep = E['phases']['replay'] - E['lick'][0]['t']
for n in E['lick']:
    if 'bend' in n:
        for off, kind in ((0, 'lick'), (rep, 'replay')):
            bends.append({'t': n['t'] + off, 'up': n['up'], 'hold': n['t'] + off + n['dur'] * .95, 'semis': n['bend'], 'm': n['m'], 'kind': ('slide-' if n.get('slide') else '') + kind})
def f0(t0, t1, lo, hi):
    a, z = int(t0 * SR), int(t1 * SR)
    seg = x[a:z] * np.hanning(z - a); F = np.abs(np.fft.rfft(seg, 1 << 20)); f = np.fft.rfftfreq(1 << 20, 1 / SR)
    k = np.argmax(F * ((f > lo) & (f < hi))); y0, y1, y2 = np.log(F[k - 1:k + 2] + 1e-12)
    return f[k] + (y0 - y2) / (2 * (y0 - 2 * y1 + y2)) * (f[1] - f[0])
# reference: the fretted unison of the ghost target (B string fret 5), as the same instrument plays it in this file
# slides (ep08) have no ghost: the reference is the same pitch fretted in the lesson run (E4: B string fret 5 / G string fret 9)
g = E['ghost'] if 'ghost' in E else next({'m': b['m'] + b['semis'], 'n': next(d['n'] for d in E['dots'] if d['m'] == b['m'] + b['semis'])} for b in bends)
refhit = next(h for h in E.get('hits', []) + E['run'] if h.get('play', True) and h['m'] == g['m'])
ref = f0(refhit['t'] + .1, refhit['t'] + .55, hz(g['m']) * .95, hz(g['m']) * 1.05)
print(f"{E['id']} reference fretted {g['n']} (string {refhit['s']} fret {refhit['f']}): {ref:.1f} Hz ({1200 * np.log2(ref / hz(g['m'])):+.1f} cents vs A440 - the sample's own tuning)")
bad = 0
for b in bends:
    fk = f0(b['t'] + b['up'] + .05, b['hold'] - .05, hz(b['m']) * 0.9, hz(b['m'] + 3) * 1.03)   # search D..F, wider than any answer
    cents = 1200 * np.log2(fk / ref)
    ok = (cents < -35) if b['kind'] == 'flat' else (abs(cents) < 10)
    bad += not ok
    print(f"{E['id']} {b['kind']:6s} bend at {b['t']:.2f}s: {fk:.1f} Hz = {cents:+.0f} cents vs the fretted {g['n']}  {'PASS' if ok else 'FAIL'} ({'must be >35 c flat' if b['kind'] == 'flat' else 'must be within 10 c'})")
print(f"{E['id']}: {len(bends)} bends, {bad} failed"); sys.exit(1 if bad else 0)
