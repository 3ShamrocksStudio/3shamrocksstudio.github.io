# z_drums128: the QA's t3_rock128 guitar with a kick/snare/hat kit mixed in, for the "Already in your take" check (L8).
# usage: python3 gen_drums.py media/qa/t3_rock128.wav media/qa/truth.json media/z_drums128.wav
import numpy as np, wave, json, sys
SR = 44100; src, tj, out = sys.argv[1:4]
w = wave.open(src); x = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(float) / 32768; w.close()
B = [t for t in json.load(open(tj)) if t['name'] == 't3_rock128'][0]['beats']
rng = np.random.default_rng(3); d = np.zeros_like(x)
def put(t, sig, g):
    i = int(t * SR); j = min(len(d), i + len(sig)); d[i:j] += g * sig[:j - i]
n = np.arange(int(0.25 * SR)) / SR
kick = np.sin(2 * np.pi * (50 + 90 * np.exp(-n * 30)) * n) * np.exp(-n * 14)
sn = rng.normal(0, 1, int(0.2 * SR)); k = np.arange(len(sn)) / SR
sn = np.convolve(sn, [1, -0.6], 'same') * np.exp(-k * 22) + 0.5 * np.sin(2 * np.pi * 190 * k) * np.exp(-k * 30)
hh = np.diff(rng.normal(0, 1, int(0.06 * SR) + 1)) * np.exp(-np.arange(int(0.06 * SR)) / SR * 80)
for i, b in enumerate(B):
    P = (B[i + 1] - b) if i + 1 < len(B) else 60 / 128
    if i % 4 in (0, 2): put(b, kick, 0.9)
    if i % 4 in (1, 3): put(b, sn, 0.5)
    put(b, hh, 0.25); put(b + P / 2, hh, 0.18)
y = x + d; y /= np.abs(y).max() * 1.1
with wave.open(out, 'wb') as o: o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((y * 32767).astype('<i2').tobytes())
