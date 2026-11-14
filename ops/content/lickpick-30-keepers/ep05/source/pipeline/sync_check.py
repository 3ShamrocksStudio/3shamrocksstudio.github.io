"""Independent sync check: render ONLY the lick notes (same data.json) with the same synth, detect onsets
from the audio by energy rise, and compare them with the times the dots light up in the picture."""
import sys, json, numpy as np, tinysoundfont as tsf
E = json.load(open(sys.argv[1])); SR = 48000; N = int(E['dur'] * SR)
syn = tsf.Synth(samplerate=SR); sid = syn.sfload(sys.argv[2]); syn.program_select(0, sid, 0, 27)
ev = sorted([(n['t'], 1, n['m']) for n in E['lick']] + [(n['t'] + n['dur'] * .95, 0, n['m']) for n in E['lick']])
out = np.zeros(N); pos = 0
for t, on, k in ev + [(E['dur'], 0, 0)]:
    s = min(N, int(t * SR))
    if s > pos: out[pos:s] = np.frombuffer(syn.generate(s - pos), dtype=np.float32).reshape(-1, 2).mean(1); pos = s
    syn.noteon(0, k, 100) if on else syn.noteoff(0, k)
hop = 240; e = np.array([np.sum(out[i:i + hop] ** 2) for i in range(0, N - hop, hop)]); le = np.log10(e + 1e-9)
from scipy.signal import butter, sosfilt
hp = sosfilt(butter(4, 2000, 'high', fs=SR, output='sos'), out)              # pick attack = high-frequency burst
e = np.array([np.sum(hp[i:i + hop] ** 2) for i in range(0, N - hop, hop)]); le = np.log10(e + 1e-12)
L = 4; d = np.r_[np.zeros(L), le[L:] - le[:-L]]
cand = [i - 1 for i in range(1, len(d) - 1) if d[i] > 0.6 and d[i] >= d[i - 1] and d[i] >= d[i + 1]]
on = []
for i in cand:
    t = (i + 1) * hop / SR
    if not on or t - on[-1] > 0.08: on.append(t)
worst = 0
for n in E['lick']:
    near = min(on, key=lambda x: abs(x - n['t'])); err = (near - n['t']) * 1000; worst = max(worst, abs(err))
print(f"{E['id']}: {len(E['lick'])} lick notes, {len(on)} audio onsets detected, worst audio-vs-dot offset {worst:.0f} ms (1 frame = 33 ms)")
