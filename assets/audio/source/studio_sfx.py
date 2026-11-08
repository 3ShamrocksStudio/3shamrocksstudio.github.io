"""3Shamrocks Studio homepage sound effects: four short, quiet cues, synthesised from scratch (no samples).
explode  : the mosaic portrait scatters into its product grid (rising air + scattered glass notes)
assemble : the tiles fly back into the portrait (falling air + notes converging + a soft lock on E)
swipe    : the mobile device carousel lands on a new product (a tiny airy detent)
click    : a call-to-action button is pressed (two soft electric-piano notes, E then B)
Writes a mono sprite and its cue map to /dev/shm/s3studio/out/."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import *
import soundfile as sf

OUT = '/dev/shm/s3studio/out'
os.makedirs(OUT, exist_ok=True)

def place(parts, total):
    out = np.zeros(int(total * SR))
    for t0, x in parts:
        i = int(t0 * SR); k = min(len(x), len(out) - i)
        if k > 0: out[i:i + k] += x[:k]
    return out
IR = reverb_ir(1.2, 0.012, 7000, seed=9)
def finish(x, peak_db, wet=0.16):
    st = np.vstack([x, x]); r = np.zeros_like(st)
    for c in range(2): r[c] = signal.fftconvolve(st[c], IR[c])[:st.shape[1]]
    y = hp((st + r * wet).mean(0), 90)
    k = int(0.04 * SR); y[-k:] *= np.linspace(1, 0, k) ** 2
    a = np.abs(y); idx = np.where(a > 10 ** (-60 / 20) * a.max())[0]; y = y[:idx[-1] + 1]
    return y * 10 ** ((peak_db - true_peak_db(y[None, :])) / 20)

def air(d, f0, f1, v=0.4):
    """band-passed noise whose centre glides from f0 to f1 (block-wise)"""
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n); out = np.zeros(n); B = 512
    for s in range(0, n, B):
        fc = f0 * (f1 / f0) ** (s / n); lo, hi = max(60, fc * 0.7), min(SR * 0.45, fc * 1.4)
        seg = bp(x[max(0, s - 2048):s + B], lo, hi)[-min(B, n - s):]; out[s:s + len(seg)] = seg
    return out * np.sin(np.pi * t / d) ** 1.5 * v

def glass(n, v): return bell(hz(n), 0.2, v, 0.45)
PENTA = ['E5', 'G5', 'A5', 'B5', 'D6', 'E6', 'G6', 'B6']
r = np.random.default_rng(11)

explode = finish(place([(0, air(0.42, 500, 5200, 0.55))] +
                       [(0.05 + i * 0.045 + r.uniform(0, 0.015), glass(PENTA[j], 0.3 + 0.1 * r.random()))
                        for i, j in enumerate([0, 3, 1, 5, 2, 6, 4, 7])], 0.85), -15)
assemble = finish(place([(0, air(0.4, 4800, 600, 0.5))] +
                        [(0.3 - 0.3 * (1 - i / 7) ** 0.6, glass(PENTA[j], 0.24 + 0.05 * i)) for i, j in enumerate([7, 4, 6, 2, 5, 1, 3, 0])] +
                        [(0.38, framedrum(130, 0.4, 0.06)), (0.38, ep(hz('E4'), 0.35, 0.4)), (0.38, ep(hz('B4'), 0.35, 0.3)), (0.38, ep(hz('E5'), 0.35, 0.22))],
                        1.0), -15)
swipe = finish(place([(0, air(0.09, 1800, 4200, 0.35)), (0.03, woodblock(1900, 0.35)[:int(0.05 * SR)])], 0.14), -22, 0.06)
click = finish(place([(0, ep(hz('E5'), 0.07, 0.5)), (0.065, ep(hz('B5'), 0.16, 0.5))], 0.5), -18, 0.12)
CUES = {'explode': explode, 'assemble': assemble, 'swipe': swipe, 'click': click}

lead, gap = 0.1, 0.25
parts = [np.zeros(int(lead * SR))]; meta = {}; t = lead
for k, x in CUES.items():
    meta[k] = [round(t, 4), round(len(x) / SR, 4)]
    parts += [x, np.zeros(int(gap * SR))]; t += len(x) / SR + gap
    sf.write(f'{OUT}/sfx_studio_{k}.wav', x, SR, subtype='FLOAT')
sf.write(f'{OUT}/studio_sfx.wav', np.concatenate(parts), SR, subtype='FLOAT')
json.dump(meta, open(f'{OUT}/studio_sprite.json', 'w'))
print(json.dumps(meta), 'total', round(t, 2))
