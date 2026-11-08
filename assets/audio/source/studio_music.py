"""3Shamrocks Studio homepage theme: "Three Leaf Drive".
Original synthwave / game-menu loop, 100 BPM, E minor, 32 bars (76.8 s), seamless.
Everything is synthesised here and in synth.py (oscillators, envelopes, noise). No samples.
Signature: the "three leaves" motif E-G-B (one note per shamrock leaf) opens the loop and returns in the last section.
Run: python3 studio_music.py  (writes WAV to /dev/shm/s3studio/out/, then see encode notes in README.md)"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import *
import soundfile as sf

OUT = '/dev/shm/s3studio/out'
os.makedirs(OUT, exist_ok=True)
BPM = 100; BEAT = 60 / BPM; BAR = 4 * BEAT; BARS = 32
m = Mix(BARS * BAR)
def T(bar, beat=0.0): return (bar - 1) * BAR + beat * BEAT

# ---------- instruments local to this track ----------
def sawbass(f, dur, vel=0.7, cut=700):
    """synthwave bass: saw through a plucky lowpass, plus a sine sub"""
    n = int((dur + 0.12) * SR); t = np.arange(n) / SR
    fc = cut * (0.35 + 0.65 * np.exp(-t / 0.07)) + 2.2 * f
    x = np.zeros(n); ph = 2 * np.pi * f * t
    for h in range(1, 60):
        if f * h > 5000: break
        x += np.sin(h * ph) / h * lp_w(f * h, fc, 2)
    x = x * 0.7 + np.sin(ph) * 0.55
    e = np.clip(t / 0.004, 0, 1) * np.where(t > dur, np.exp(-(t - dur) / 0.03), 1) * (0.75 + 0.25 * np.exp(-t / 0.12))
    return x * e * vel * 0.5

def lead(f, dur, vel=0.6):
    """warm poly-synth lead: two detuned saws, soft attack, delayed vibrato (synth.horn voice, darker)"""
    return horn(f, dur, vel, bright=0.55, att=0.035)

def gated_snare(vel=0.6):
    """80s-style snare: tone + noise with a short dense room that is cut off (gated)"""
    n = int(0.42 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.035) * 0.5
    nz = bp(noise(n), 900, 9000) * (np.exp(-t / 0.05) * 0.6 + 0.28 * (t < 0.24) * np.exp(-t / 0.4))
    g = np.where(t < 0.24, 1, np.exp(-(t - 0.24) / 0.015))
    return (body + nz) * g * vel * 0.5

# ---------- harmony ----------
P = [('E', 'm9'), ('C', 'maj7'), ('G', 'add9'), ('D', '6'), ('E', 'm9'), ('C', 'maj7'), ('G', 'add9'), ('D', 'sus4')]
Q = [('A', 'm9'), ('C', 'maj7'), ('E', 'm9'), ('D', '6'), ('A', 'm9'), ('C', 'maj7'), ('B', 'sus4'), ('B', '7')]
Dsec = [('E', 'm9'), ('C', 'maj7'), ('G', 'add9'), ('D', '6'), ('E', 'm9'), ('C', 'maj7'), ('A', 'm9'), ('B', '7')]
plan = P[:4] + P + Q + P[:4] + Dsec
assert len(plan) == BARS
def sec(b): return 'I' if b <= 4 else 'A' if b <= 12 else 'B' if b <= 20 else 'C' if b <= 24 else 'D'

kicks = []
for bar in range(1, BARS + 1):
    r, q = plan[bar - 1]; s = sec(bar)
    r3 = midi(r + '3'); r3 = r3 - 12 if r3 > midi('F#3') else r3
    tones = chord(r3 + 12, q)
    # pad: always there, carries the intro and breakdown
    pv = {'I': 0.75, 'A': 0.45, 'B': 0.42, 'C': 0.7, 'D': 0.45}[s]
    for nn in tones[:4]:
        m.add('pad', pad(hz(nn), BAR, pv, att=0.7, rel=1.3, fc=1100 if s in 'IC' else 1500), T(bar))
    # bass: long sub in intro/breakdown, octave-pulse 8ths elsewhere
    br = midi(r + '1'); br = br + 12 if br < midi('D#1') else br
    if s in 'IC':
        m.add('bass', bass(hz(br), BAR * 0.96, 0.55, 'sub'), T(bar))
    else:
        for k in range(8):
            f = hz(br + (12 if k % 2 else 0))
            m.add('bass', sawbass(f, BEAT * 0.42, 0.62 if k % 2 == 0 else 0.48, 650 if s == 'A' else 850), T(bar, k * 0.5), jitter=0)
    # arp: 16ths over two octaves; filtered in the intro, opens up later
    if s != 'C' or bar >= 23:
        pat = [0, 1, 2, 3, 4, 3, 2, 1] * 2
        ext = tones + [x + 12 for x in tones]
        bright = {'I': 0.25, 'A': 0.45, 'B': 0.55, 'C': 0.35, 'D': 0.65}[s]
        av = 0.24 if s in 'IC' else 0.3
        for k, ix in enumerate(pat):
            nn = ext[min(ix, len(ext) - 1)] + 12
            m.add('arp', pluck(hz(nn), BEAT * 0.22, av * (1.0 if k % 4 == 0 else 0.78) * RNG.uniform(0.94, 1.04), decay=0.18, bright=bright),
                  T(bar, k * 0.25), pan=(-0.35 if k % 2 else 0.35))
    # drums
    if s in 'ABD':
        for bt in (0, 2):
            m.add('kick', kick(0.62, soft=False), T(bar, bt), jitter=0); kicks.append(T(bar, bt))
        if bar % 4 == 0: m.add('kick', kick(0.4, soft=False), T(bar, 3.5), jitter=0); kicks.append(T(bar, 3.5))
        for k in range(8 if s != 'D' else 16):
            step = 0.5 if s != 'D' else 0.25
            m.add('hat', hat(0.34 if (k * step) % 1 == 0.5 else 0.2), T(bar, k * step), pan=0.25)
    if s in 'BD':
        m.add('snare', gated_snare(0.55), T(bar, 1)); m.add('snare', gated_snare(0.58), T(bar, 3))
    if s == 'C' and bar >= 23:
        m.add('kick', kick(0.45, soft=True), T(bar, 0), jitter=0); kicks.append(T(bar, 0))
# risers into B and D
m.add('fx', cymbal_swell(BAR * 1.0, 0.5), T(12)); m.add('fx', cymbal_swell(BAR * 2.0, 0.55), T(23))

def parse(s):
    out = []; b = 0.0
    for tok in s.split():
        nn, d = tok.split(':'); d = float(d)
        out.append((b, d, None if nn == 'r' else nn)); b += d
    return out
def line(lines, bar0, inst, bus, vel, pan=0.0):
    for i, ln in enumerate(lines):
        for (b, d, nn) in parse(ln):
            if nn is None: continue
            m.add(bus, inst(hz(nn), d * BEAT * 0.92, vel * RNG.uniform(0.94, 1.04)), T(bar0 + i, b), pan=pan)

# three-leaf motif in bells: bar 1 and 3 of the intro, then the breakdown
leaf = lambda f, d, v: bell(f, d, v, 1.8)
line(['E5:.5 G5:.5 B5:3', 'r:4', 'E5:.5 G5:.5 C6:3', 'r:4'], 1, leaf, 'bell', 0.4, 0.2)
line(['E6:.5 G6:.5 B6:3', 'E6:.5 G6:.5 C7:3', 'D6:.5 G6:.5 B6:3', 'D6:.5 F#6:.5 A6:3'], 21, leaf, 'bell', 0.3, -0.2)
# B melody (13-20) over Q
melB = ['A4:.5 C5:.5 E5:2 D5:1', 'E5:1.5 G5:.5 E5:1 D5:1', 'B4:3 r:1', 'A4:.5 B4:.5 D5:1 F#5:2',
        'A4:.5 C5:.5 E5:2 G5:1', 'G5:1.5 E5:.5 C5:1 B4:1', 'A4:1 B4:1 E5:2', 'D#5:2 F#5:1 B4:1']
line(melB, 13, lead, 'lead', 0.5, -0.05)
# D melody (25-32): opens on the three-leaf motif, an octave up, doubled by a quiet bell
melD = ['E5:.5 G5:.5 B5:2 A5:1', 'G5:1.5 E5:.5 G5:1 B5:1', 'D6:2 B5:1 A5:1', 'F#5:3 r:1',
        'E5:.5 G5:.5 B5:2 E6:1', 'D6:1.5 B5:.5 G5:1 E5:1', 'C6:2 B5:1 A5:1', 'B5:2 D#5:2']
line(melD, 25, lead, 'lead', 0.5, 0.05)
line(melD, 25, lambda f, d, v: bell(f, d, v, 1.0), 'bell', 0.14, 0.3)

# ---------- mix ----------
def duck_curve(n, times, depth=0.45, rel=0.16):
    d = np.ones(n); L = n
    k = np.arange(int(rel * 5 * SR)) / SR; shape = 1 - depth * np.exp(-k / rel) * np.clip(k / 0.005, 0, 1)
    for t0 in times:
        i = int(round(t0 * SR)) % L
        seg = shape[:L - i]; d[i:i + len(seg)] = np.minimum(d[i:i + len(seg)], seg)
        if len(seg) < len(shape): r = shape[len(seg):]; d[:len(r)] = np.minimum(d[:len(r)], r)
    return d
chains = {
    'pad': pb.Pedalboard([pb.HighpassFilter(140), pb.LowpassFilter(4000), pb.Chorus(0.25, 0.25, 8, 0.15, 0.45), pb.Gain(-5)]),
    'bass': pb.Pedalboard([pb.HighpassFilter(32), pb.LowpassFilter(2200), pb.Compressor(-20, 3, 5, 80), pb.Gain(-2)]),
    'arp': pb.Pedalboard([pb.HighpassFilter(300), pb.LowpassFilter(6000), pb.Delay(BEAT * 0.75, 0.32, 0.22), pb.Gain(-8)]),
    'kick': pb.Pedalboard([pb.LowpassFilter(4000), pb.Gain(-3)]),
    'snare': pb.Pedalboard([pb.HighpassFilter(180), pb.Gain(-9)]),
    'hat': pb.Pedalboard([pb.HighpassFilter(6000), pb.Gain(-13)]),
    'lead': pb.Pedalboard([pb.HighpassFilter(200), pb.LowpassFilter(5500), pb.Compressor(-18, 2, 10, 120), pb.Chorus(0.4, 0.2, 7, 0.1, 0.3),
                           pb.Delay(BEAT * 0.75, 0.25, 0.16), pb.Gain(-4)]),
    'bell': pb.Pedalboard([pb.HighpassFilter(500), pb.Delay(BEAT * 0.5, 0.25, 0.18), pb.Gain(-6)]),
    'fx': pb.Pedalboard([pb.HighpassFilter(3000), pb.Gain(-12)]),
}
sends = {'pad': 0.3, 'arp': 0.18, 'snare': 0.35, 'lead': 0.28, 'bell': 0.45, 'fx': 0.3}
duck = duck_curve(m.n, kicks)
dry = np.zeros((2, m.n)); send = np.zeros((2, m.n))
for name, b in m.bus.items():
    y = m.folded(name)
    if name in chains: y = periodic(chains[name], y)
    if name in ('pad', 'bass', 'arp'): y = y * duck
    dry += y; send += y * sends.get(name, 0)
rv = circ_reverb(send, reverb_ir(2.6, 0.025, 7000, seed=33), 0.8)
rv = periodic(pb.Pedalboard([pb.HighpassFilter(280), pb.LowpassFilter(7500)]), rv)
mix = dry + rv
mix = periodic(pb.Pedalboard([pb.LowShelfFilter(70, 0.6), pb.HighShelfFilter(11000, -0.5), pb.Compressor(-15, 2, 25, 220)]), mix)
mix = master(mix, -16.0, -1.0)
sf.write(f'{OUT}/studio_theme_loop.wav', mix.T, SR, subtype='FLOAT')
# delivery file: loop + its first second again, so the player's loop window [0.5 s, 0.5 s + loop] is seamless despite codec padding
sf.write(f'{OUT}/studio_theme.wav', np.concatenate([mix, mix[:, :SR]], axis=1).T, SR, subtype='FLOAT')
print('len', mix.shape[1] / SR, 'lufs', round(lufs(np.tile(mix, (1, 2))), 2), 'tp', round(true_peak_db(mix), 2))
