import sys, json; sys.path.insert(0, '/dev/shm/s3a')
from synth import *
import soundfile as sf

def place(parts, total):
    out = np.zeros(int(total * SR))
    for t0, x in parts:
        i = int(t0 * SR); m = min(len(x), len(out) - i)
        if m > 0: out[i:i + m] += x[:m]
    return out
IR = reverb_ir(1.1, 0.01, 7000, seed=5)
def finish(x, peak_db=-9.0, wet=0.14, max_len=None):
    st = np.vstack([x, x])
    r = np.zeros_like(st)
    for c in range(2): r[c] = signal.fftconvolve(st[c], IR[c])[:st.shape[1]]
    y = (st + r * wet).mean(0)
    y = hp(y, 60)
    if max_len: y = y[:int(max_len * SR)]
    k = int(0.03 * SR); y[-k:] *= np.linspace(1, 0, k) ** 2  # tail fade
    # trim trailing silence
    a = np.abs(y); idx = np.where(a > 10 ** (-60 / 20) * a.max())[0]; y = y[:idx[-1] + 1] if len(idx) else y
    tp = true_peak_db(y[None, :])
    return y * 10 ** ((peak_db - tp) / 20)

def H(n, d, v=0.7, **kw): return horn(hz(n), d, v, **kw)
def GL(n, v=0.5): return glock(hz(n), 0.3, v)

CR = {
  'click':   finish(woodblock(2100, 0.6)[:int(0.05 * SR)], -16, 0.05),
  'reward':  finish(place([(0, GL('C6', .5)), (0.06, GL('E6', .5)), (0.12, GL('G6', .55)), (0.12, cymbal_swell(0.05, 0.2))], 0.45), -10),
  'approve': finish(place([(0, framedrum(110, 0.5, 0.12)), (0.0, H('G4', 0.08, .55)), (0.09, H('C5', 0.22, .65))], 0.42), -10),
  'win':     finish(place([(0, H('C5', .07, .6)), (0.075, H('E5', .07, .6)), (0.15, H('G5', .07, .65)), (0.225, H('C6', .28, .7)),
                           (0.225, H('G5', .28, .4)), (0.225, H('E5', .28, .35)), (0.225, GL('C7', .35)), (0.05, cymbal_swell(0.18, .25))], 0.75), -9),
  'rankup':  finish(place([(i * 0.07, GL(n, .45)) for i, n in enumerate(['C6', 'E6', 'G6', 'C7'])] +
                          [(0.28, H(n, .45, .5, att=.05)) for n in ('C5', 'E5', 'G5')] + [(0.28, pad(hz('C4'), 0.4, 0.6, att=0.05, rel=0.4, fc=2500)[0])], 0.95), -9),
  'crown':   finish(place([(i * 0.045, timpani(hz('G2'), 0.12 + 0.03 * i)) for i in range(12)] +
                          [(0.6, H(n, 1.0, v, att=.12)) for n, v in (('C4', .45), ('G4', .5), ('C5', .55), ('E5', .5), ('G5', .55))] +
                          [(0.6, timpani(hz('C3'), 0.6))] + [(0.75 + i * 0.09, GL(n, .4)) for i, n in enumerate(['C6', 'E6', 'G6', 'C7'])] +
                          [(0.2, cymbal_swell(0.4, 0.3))], 2.1), -8),
  'duel_win':  finish(place([(0, snare(0.4)), (0.025, snare(0.6)), (0.03, H('E5', .07, .6)), (0.11, H('G5', .07, .62)), (0.19, H('C6', .22, .68)), (0.19, GL('G6', .3))], 0.5), -9),
  'duel_lose': finish(place([(0, horn(hz('G4'), .12, .45, bright=.4)), (0.13, horn(hz('F#4'), .12, .42, bright=.35)),
                             (0.26, horn(hz('F4') * np.ones(1), .2, .4, bright=.3))], 0.55), -12),
  'error':   finish(place([(0, pluck(hz('E3'), .1, .6, decay=.12, bright=.4)), (0.09, pluck(hz('C3'), .14, .6, decay=.14, bright=.4))], 0.24), -12, 0.06),
}
def bubble(f0, f1, d=0.04, v=0.5):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 * (f1 / f0) ** (t / d)
    return np.sin(np.cumsum(2 * np.pi * f / SR)) * np.sin(np.pi * t / d) * v * 0.4
def crackle(d=0.3, k=14, v=0.4):
    x = np.zeros(int(d * SR))
    for _ in range(k):
        i = RNG.integers(0, len(x) - 200); x[i:i + 120] += bp(RNG.normal(0, 1, 120), 1500, 6000) * np.exp(-np.arange(120) / 20) * RNG.uniform(.3, 1)
    return x * v
def whoosh(d=0.35, v=0.4):
    n = int(d * SR); t = np.arange(n) / SR; x = RNG.normal(0, 1, n); out = np.zeros(n)
    for s in range(0, n, 512):
        fc = 600 + 3000 * (s / n); seg = bp(x[max(0, s - 2048):s + 512], fc * 0.7, fc * 1.4)[-min(512, n - s):]; out[s:s + len(seg)] = seg
    return out * np.sin(np.pi * t / d) ** 2 * v
TH = {
  'earth':   finish(place([(0, framedrum(80, 0.35, 0.2)), (0, marimba(hz('D4'), .3, .6)), (0.07, marimba(hz('A4'), .3, .55)), (0.14, marimba(hz('D5'), .3, .45))], 0.4), -10),
  'water':   finish(place([(0, bubble(380, 900)), (0.05, bubble(500, 1200)), (0.1, bubble(450, 1100)), (0.12, kalimba(hz('A5'), .3, .55)), (0.19, kalimba(hz('E6'), .3, .4))], 0.42), -10),
  'fire':    finish(place([(0, crackle(0.32, 12, .35)), (0.02, marimba(hz('E4'), .2, .5)), (0.08, marimba(hz('B4'), .2, .5)), (0.14, marimba(hz('E5'), .3, .55))], 0.4), -10),
  'air':     finish(place([(0, whoosh(0.36, .5)), (0.12, flute(hz('D6'), .18, .5)), (0.12, flute(hz('A5'), .18, .3))], 0.45), -10),
  'space':   finish(place([(0, bell(hz('A5'), .4, .45, 0.6)), (0.05, bell(hz('E6') * 1.003, .4, .35, 0.5)), (0.1, bell(hz('B6'), .4, .25, 0.4))], 0.5), -10),
  'reward':  finish(place([(i * 0.06, kalimba(hz(n), .3, .55)) for i, n in enumerate(['D5', 'F5', 'A5', 'D6'])], 0.45), -10),
  'levelup': finish(place([(i * 0.07, marimba(hz(n), .3, .55)) for i, n in enumerate(['D4', 'A4', 'D5', 'F5', 'A5', 'D6'])] +
                          [(0.4, pad(hz(n), 0.35, 0.5, att=0.05, rel=0.4, fc=2000)[0]) for n in ('D4', 'F4', 'A4')] + [(0.42, kalimba(hz('D6'), .3, .4))], 0.95), -9),
  'error':   finish(place([(0, woodblock(400, .6)), (0.09, woodblock(330, .6))], 0.24), -12, 0.06),
}
def thock(f=220, v=0.6):
    return framedrum(f, v, 0.05)[:int(0.15 * SR)] + woodblock(620, v * 0.5)
RK = {
  'move':    finish(place([(0, thock())], 0.16), -12, 0.08),
  'capture': finish(place([(0, thock(200, .7)), (0.03, whoosh(0.12, .25)), (0.08, ep(hz('A3'), .15, .5))], 0.3), -11),
  'check':   finish(place([(0, bell(hz('E6'), .2, .5, 0.5)), (0.11, bell(hz('B5'), .2, .45, 0.5))], 0.36), -10),
  'deal':    finish(place([(i * 0.05, ep(hz(n), .3, .45)) for i, n in enumerate(['A3', 'C4', 'E4', 'G4'])] +
                          [(0.25 + i * 0.05, ep(hz(n), .35, .45)) for i, n in enumerate(['C4', 'E4', 'G4', 'B4', 'D5'])] + [(0.3, bell(hz('E6'), .3, .3, 0.8))], 0.8), -9),
  'lose':    finish(place([(0, ep(hz('E4'), .12, .45)), (0.13, ep(hz('C4'), .12, .42)), (0.26, ep(hz('A3'), .2, .4))], 0.5), -12),
  'rankup':  finish(place([(i * 0.07, bell(hz(n), .3, .4, 0.6)) for i, n in enumerate(['A5', 'C6', 'E6', 'A6'])] +
                          [(0.28, pad(hz(n), 0.35, 0.5, att=0.05, rel=0.4, fc=2200)[0]) for n in ('A3', 'C4', 'E4')], 0.9), -9),
  'error':   finish(place([(0, bass(hz('A2'), 0.09, 0.7, 'sub')), (0, woodblock(300, .3))], 0.18), -12, 0.04),
}
def sprite(name, d, lead=0.1, gap=0.25):
    parts = [np.zeros(int(lead * SR))]; meta = {}; t = lead
    for k, x in d.items():
        meta[k] = [round(t, 4), round(len(x) / SR, 4)]
        parts += [x, np.zeros(int(gap * SR))]; t += len(x) / SR + gap
    y = np.concatenate(parts)
    sf.write(f'/dev/shm/s3a/out/{name}_sfx.wav', y, SR, subtype='FLOAT')
    for k, x in d.items(): sf.write(f'/dev/shm/s3a/out/sfx_{name}_{k}.wav', x, SR, subtype='FLOAT')
    print(name, json.dumps(meta), 'total', round(t, 2))
    return meta
meta = {'cr': sprite('cr', CR), 'th': sprite('th', TH), 'rk': sprite('rk', RK)}
json.dump(meta, open('/dev/shm/s3a/out/sprites.json', 'w'))
