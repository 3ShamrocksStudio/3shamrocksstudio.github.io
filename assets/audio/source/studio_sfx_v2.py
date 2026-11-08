"""3Shamrocks Studio Score v2 sound effects, synthesised with the score_v2 instruments (no samples).
Product arrival sounds (<= 0.4 s, played when a product is centred / focused in the carousel):
  p_shomer radar ping, p_lickpick guitar-lick stab, p_trashure-hunters treasure-chest coin jingle,
  p_chore-royale arena horn, p_fairent ka-ching receipt, p_concepts sci-fi shimmer
Stingers: coin (achievement toast), levelup (contact reached, once per visit), sparkle (Mini-Dave opens)
Interaction: explode / assemble (portrait mosaic), click (call-to-action buttons)
Writes /dev/shm/s3studio/v2/sfx.wav (+ 0.5 s lead) and sfx.json (cue starts/lengths)."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import score_v2 as S
from score_v2 import (SR, np, signal, sf, hz, noise, bp, hp, lowpass, celesta, glock, musicbox, gtr, brass, hero, bigkick, tom, tamb,
                      crash, framedrum, woodblock, reverb_ir, true_peak_db, _t)

def place(parts, total):
    out = np.zeros(int(total * SR))
    for t0, x in parts:
        i = int(t0 * SR); k = min(len(x), len(out) - i)
        if k > 0: out[i:i + k] += x[:k]
    return out
IR = reverb_ir(1.0, 0.01, 8000, seed=12)
def finish(x, peak_db, wet=0.12, max_len=None):
    st = np.vstack([x, x]); r = np.zeros_like(st)
    for c in range(2): r[c] = signal.fftconvolve(st[c], IR[c])[:st.shape[1]]
    y = hp((st + r * wet).mean(0), 70)
    if max_len: y = y[:int(max_len * SR)]
    k = int(0.03 * SR); y[-k:] *= np.linspace(1, 0, k) ** 2
    a = np.abs(y); idx = np.where(a > 10 ** (-60 / 20) * a.max())[0]; y = y[:idx[-1] + 1]
    return y * 10 ** ((peak_db - true_peak_db(y[None, :])) / 20)
def air(d, f0, f1, v=0.4):
    n = int(d * SR); t = _t(n); x = noise(n); out = np.zeros(n); B = 512
    for s in range(0, n, B):
        fc = f0 * (f1 / f0) ** (s / n); seg = bp(x[max(0, s - 2048):s + B], max(60, fc * 0.7), min(SR * 0.45, fc * 1.4))[-min(B, n - s):]; out[s:s + len(seg)] = seg
    return out * np.sin(np.pi * t / d) ** 1.5 * v
def ping(f, d=0.35, v=0.6):
    n = int(d * SR); t = _t(n); fm = f * (1 + 0.02 * np.exp(-t / 0.01))
    return (np.sin(np.cumsum(2 * np.pi * fm / SR)) + 0.2 * np.sin(np.cumsum(4 * np.pi * fm / SR))) * np.exp(-t / 0.09) * np.clip(t / 0.001, 0, 1) * v
def drive(x, k=2.5): return np.tanh(x * k) / np.tanh(k)
def sweep(f0, f1, d, v=0.4):
    n = int(d * SR); t = _t(n); f = f0 * (f1 / f0) ** (t / d)
    ph = np.cumsum(2 * np.pi * f / SR); x = np.sin(ph + 2.0 * np.sin(ph * 1.5)) * np.sin(np.pi * t / d) ** 2
    return x * v

C = {}
C['p_shomer'] = finish(place([(0, ping(1760, 0.38, 0.6)), (0.0, ping(880, 0.2, 0.25)), (0.13, ping(1760, 0.25, 0.22)), (0, bigkick(0.25)[:int(0.12 * SR)])], 0.4), -15, 0.2, 0.4)
C['p_lickpick'] = finish(drive(place([(0, gtr(hz('A4'), 0.05, 0.8)), (0.045, gtr(hz('C5'), 0.05, 0.8)), (0.09, gtr(hz('D5'), 0.05, 0.85)),
                                     (0.14, gtr(hz('A3'), 0.25, 0.9)), (0.14, gtr(hz('E4'), 0.25, 0.9)), (0.14, gtr(hz('A4'), 0.25, 0.8))], 0.4), 3.0), -15, 0.1, 0.4)
C['p_trashure-hunters'] = finish(place([(0, framedrum(110, 0.5, 0.08))] + [(0.03 + i * 0.045, glock(hz(n), 0.1, 0.6)) for i, n in enumerate(['B5', 'E6', 'G#6', 'B6'])] +
                                       [(0.05, tamb(0.5)), (0.15, tamb(0.4))], 0.4), -15, 0.12, 0.4)
C['p_chore-royale'] = finish(place([(0, brass(hz('C5'), 0.07, 0.8)), (0, brass(hz('G4'), 0.07, 0.6)), (0.09, brass(hz('G5'), 0.24, 0.85)), (0.09, brass(hz('C5'), 0.24, 0.7)),
                                    (0.09, brass(hz('E5'), 0.24, 0.65)), (0.09, hero(hz('C4'), 0.24, 0.5))], 0.4), -15, 0.15, 0.4)
C['p_fairent'] = finish(place([(0, bp(noise(int(0.09 * SR)), 2500, 9000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 70 * _t(int(0.09 * SR))))) * 0.3),
                               (0.09, woodblock(2400, 0.5)[:int(0.04 * SR)]), (0.12, glock(hz('E6'), 0.2, 0.6)), (0.12, glock(hz('B6'), 0.2, 0.45))], 0.4), -15, 0.12, 0.4)
C['p_concepts'] = finish(place([(0, sweep(500, 2400, 0.3, 0.4))] + [(0.06 + i * 0.04, celesta(hz(n), 0.1, 0.45)) for i, n in enumerate(['F#5', 'C#6', 'F#6', 'A#6', 'C#7'])], 0.4), -15, 0.25, 0.4)
C['coin'] = finish(place([(0, hero(hz('B5'), 0.06, 0.6, 1.4)), (0.07, hero(hz('E6'), 0.22, 0.6, 1.4)), (0.07, glock(hz('E7'), 0.2, 0.4))], 0.5), -15, 0.12)
C['levelup'] = finish(place([(i * 0.09, hero(hz(n), 0.08, 0.55)) for i, n in enumerate(['C5', 'E5', 'G5'])] +
                            [(0.27, brass(hz(n), 0.6, 0.6)) for n in ('C4', 'G4', 'C5', 'E5', 'G5')] + [(0.27, hero(hz('C6'), 0.6, 0.55)), (0.27, bigkick(0.5)),
                            (0.27, crash(0.4)[:int(1.0 * SR)])] + [(0.35 + i * 0.05, glock(hz(n), 0.2, 0.35)) for i, n in enumerate(['C6', 'E6', 'G6', 'C7'])], 1.4), -12, 0.2)
C['sparkle'] = finish(place([(i * 0.035, celesta(hz(n), 0.15, 0.4)) for i, n in enumerate(['E6', 'G#6', 'B6', 'E7', 'G#7'])] + [(0, air(0.3, 3000, 9000, 0.15))], 0.6), -17, 0.25)
C['explode'] = finish(place([(0, air(0.4, 400, 6000, 0.6)), (0, tom(90, 0.6))] + [(0.05 + i * 0.04, glock(hz(n), 0.1, 0.35)) for i, n in enumerate(['E6', 'B6', 'G6', 'D7', 'A6', 'E7'])], 0.7), -14)
C['assemble'] = finish(place([(0, air(0.35, 5000, 500, 0.5))] + [(0.3 - 0.3 * (1 - i / 5) ** 0.6, glock(hz(n), 0.1, 0.3)) for i, n in enumerate(['E7', 'B6', 'G6', 'E6', 'B5', 'G5'])] +
                            [(0.34, bigkick(0.5)), (0.34, brass(hz('E4'), 0.25, 0.5)), (0.34, brass(hz('B4'), 0.25, 0.45))], 0.8), -14)
C['click'] = finish(place([(0, hero(hz('E5'), 0.05, 0.5, 1.2)), (0.055, hero(hz('B5'), 0.1, 0.5, 1.2))], 0.3), -18, 0.08)

lead, gap = 0.5, 0.25
parts = [np.zeros(int(lead * SR))]; meta = {}; t = lead
for k, x in C.items():
    meta[k] = [round(t, 4), round(len(x) / SR, 4)]
    parts += [x, np.zeros(int(gap * SR))]; t += len(x) / SR + gap
os.makedirs(S.OUT, exist_ok=True)
sf.write(f'{S.OUT}/sfx.wav', np.concatenate(parts), SR, subtype='FLOAT')
json.dump(meta, open(f'{S.OUT}/sfx.json', 'w'))
print(json.dumps(meta)); print({k: round(len(v) / SR, 3) for k, v in C.items()})
