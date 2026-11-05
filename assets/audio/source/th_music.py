import sys; sys.path.insert(0, '/dev/shm/s3a')
from score import *
import soundfile as sf
BPM = 90; BEAT = 60 / BPM; BAR = 4 * BEAT; BARS = 27
m = Mix(BARS * BAR)
def T(bar, beat=0.0): return (bar - 1) * BAR + beat * BEAT
Dm, C, Bb, G, F, A, Asus = ('D', 'min'), ('C', 'maj'), ('Bb', 'maj'), ('G', 'maj'), ('F', 'maj'), ('A', 'maj'), ('A', 'sus4')
plan = [Dm, C, Bb, C, Dm, C, Bb, A,          # A 1-8
        Dm, C, Bb, C, F, C, G, Dm,           # B 9-16
        Bb, F, C, G, A,                      # C 17-21 breakdown
        Dm, C, Bb, C, G, A]                  # D 22-27
assert len(plan) == BARS
sec = lambda b: 'A' if b <= 8 else 'B' if b <= 16 else 'C' if b <= 21 else 'D'
for bar in range(1, BARS + 1):
    r, q = plan[bar - 1]; s = sec(bar)
    r4 = midi(r + '3'); r4 = r4 + 12 if r4 < midi('G3') else r4
    tones = chord(r4, q)
    # pad (always, softer in A)
    for nn in tones:
        m.add('pad', pad(hz(nn), BAR, 0.45 if s == 'A' else 0.55, att=1.2, rel=1.6, fc=1200), T(bar))
    m.add('pad', pad(hz(r4 - 12), BAR, 0.35, att=1.0, rel=1.4, fc=600, voices=3), T(bar))
    # bass: beat 1 and syncopated 3.5 (not in C)
    br = midi(r + '2'); br = br + 12 if br < midi('E2') else br
    if s == 'C':
        m.add('bass', bass(hz(br), BAR * 0.95, 0.45, 'sub'), T(bar))
    else:
        m.add('bass', bass(hz(br), BEAT * 2.2, 0.58), T(bar)); m.add('bass', bass(hz(br + 7 if br + 7 < midi('C3') else br - 5), BEAT * 0.4, 0.42), T(bar, 2.5))
        m.add('bass', bass(hz(br), BEAT * 1.0, 0.48), T(bar, 3))
    # marimba ostinato: root 5th 9th 5th 3rd 5th 9th 5th (8ths). A: from bar 3; D: plus kalimba sparkle
    if s in 'ABD' and not (s == 'A' and bar < 3):
        third = tones[1] - r4
        pat = [0, 7, 14, 7, 12 + third, 7, 14, 19] if bar % 2 else [0, 7, 12, 7, 12 + third, 7, 14, 7]
        for k, iv in enumerate(pat):
            v = (0.5 if k % 4 == 0 else 0.34) * RNG.uniform(0.9, 1.08)
            m.add('mar', marimba(hz(r4 + iv - 12 + 12), 0.3, v), T(bar, k * 0.5), pan=-0.35 + 0.1 * (k % 3))
    if s in 'CD':
        arp = [0, 7, 12, 16 if q == 'maj' else 15, 19, 24]
        for k in range(0, 8 if s == 'C' else 4):
            if s == 'C' and k % 2: continue
            m.add('kal', kalimba(hz(r4 + 12 + arp[k % len(arp)]), 0.5, 0.33 * RNG.uniform(0.85, 1.1)), T(bar, k * (0.5 if s == 'C' else 1) + (0 if s == 'C' else 0.5)), pan=0.4)
# percussion: frame drums + shaker in A(5+), B, D
for bar in range(1, BARS + 1):
    s = sec(bar)
    if s == 'C' or (s == 'A' and bar < 5): continue
    m.add('perc', framedrum(88, 0.55), T(bar, 0), pan=-0.1)
    m.add('perc', framedrum(88, 0.32), T(bar, 1.5), pan=-0.1)
    m.add('perc', framedrum(88, 0.42), T(bar, 2), pan=-0.1)
    m.add('perc', framedrum(170, 0.28, 0.15), T(bar, 3), pan=0.25)
    m.add('perc', framedrum(170, 0.18, 0.12), T(bar, 3.5), pan=0.25)
    for k in range(8):
        m.add('shk', shaker(0.3 if k % 2 == 0 else 0.42), T(bar, k * 0.5 + 0.02), pan=0.45)
    if bar in (9, 13, 22, 26):
        m.add('perc', framedrum(55, 0.6, 0.8), T(bar), pan=0)
# wind bed (whole loop, slow swells) - periodic LFO
n = m.n; t = np.arange(n) / SR
w = bp(RNG.normal(0, 1, n + SR), 300, 1400)[SR:]
lfo = 0.5 + 0.5 * np.sin(2 * np.pi * t / (m.L / 3)) * np.sin(2 * np.pi * t / (m.L / 5) + 1)
m.bus['wind'] = np.zeros((2, m.N)); m.bus['wind'][0, :n] = w * lfo * 0.05; m.bus['wind'][1, :n] = np.roll(w, 3000) * lfo[::-1] * 0.05
# birds, sparse
for tb in (3.2, 7.6, 18.4, 19.9, 24.3, 26.6):
    m.add('birds', bird(0.35), T(int(tb), (tb % 1) * 4), pan=RNG.uniform(-0.7, 0.7))
def line(lines, bar0, inst, bus, vel, pan=0.0):
    for i, ln in enumerate(lines):
        notes, _ = parse(ln)
        for (b, d, nn) in notes:
            if nn is None: continue
            m.add(bus, inst(hz(nn), d * BEAT * 0.95, vel * (1.06 if b == 0 else 1) * RNG.uniform(0.92, 1.05)), T(bar0 + i, b), pan=pan)
fl_B = ['D5:1 F5:.5 E5:.5 D5:1 A4:1', 'C5:.5 D5:.5 E5:1 G5:1.5 E5:.5', 'F5:1.5 D5:.5 Bb4:1 D5:1', 'E5:2 r:1 C5:.5 D5:.5',
        'F5:1 A5:1 G5:.5 F5:.5 E5:1', 'D5:.5 E5:.5 C5:1 G4:2', 'B4:1 D5:.5 E5:.5 G5:1 F5:.5 E5:.5', 'D5:3 r:1']
fl_C = ['D5:2 F5:2', 'C5:4', 'E5:2 G5:2', 'D5:2 B4:2', 'C#5:4']
fl_D = ['A5:1 F5:.5 G5:.5 A5:1 D5:1', 'G5:1 E5:.5 F5:.5 G5:1 C5:1', 'F5:1.5 D5:.5 Bb4:1 D5:1', 'E5:2 G5:1 E5:1', 'D5:1 B4:1 G4:.5 A4:.5 B4:1', 'A4:3 r:1']
line(fl_B, 9, flute, 'flute', 0.62, 0.05); line(fl_C, 17, flute, 'flute', 0.45, 0.05); line(fl_D, 22, flute, 'flute', 0.6, 0.05)
# low woodwind counter in D
line(['F4:2 E4:2', 'E4:2 G4:2', 'D4:4', 'C4:2 E4:2', 'B3:2 D4:2', 'C#4:4'], 22, woodwind, 'wood', 0.3, -0.3)
chains = {
    'pad': pb.Pedalboard([pb.HighpassFilter(120), pb.LowpassFilter(4000), pb.Gain(-6)]),
    'bass': pb.Pedalboard([pb.HighpassFilter(35), pb.LowpassFilter(1800), pb.Compressor(-18, 3, 10, 120), pb.Gain(0)]),
    'mar': pb.Pedalboard([pb.HighpassFilter(150), pb.PeakFilter(2500, -2, 1), pb.Gain(-3)]),
    'kal': pb.Pedalboard([pb.HighpassFilter(300), pb.Gain(-5)]),
    'perc': pb.Pedalboard([pb.HighpassFilter(40), pb.Compressor(-18, 3, 3, 100), pb.Gain(-3)]),
    'shk': pb.Pedalboard([pb.HighpassFilter(4000), pb.Gain(-10)]),
    'wind': pb.Pedalboard([pb.Gain(-4)]),
    'birds': pb.Pedalboard([pb.HighpassFilter(1500), pb.Gain(-8)]),
    'flute': pb.Pedalboard([pb.HighpassFilter(200), pb.Compressor(-16, 2, 20, 150), pb.Gain(0)]),
    'wood': pb.Pedalboard([pb.HighpassFilter(120), pb.Gain(-2)]),
}
sends = {'pad': 0.3, 'mar': 0.22, 'kal': 0.45, 'perc': 0.12, 'shk': 0.1, 'birds': 0.6, 'flute': 0.38, 'wood': 0.3, 'bass': 0.03}
mix = render_buses(m, chains, sends, reverb_ir(3.2, 0.03, 6500, seed=11), 0.85, pb.Pedalboard([pb.HighpassFilter(250), pb.LowpassFilter(7500)]))
mix = periodic(pb.Pedalboard([pb.LowShelfFilter(100, 0.5), pb.HighShelfFilter(9000, 0.5), pb.Compressor(-14, 1.8, 30, 250)]), mix)
mix = master(mix, -16.0, -1.0)
sf.write('/dev/shm/s3a/out/th_theme.wav', mix.T, SR, subtype='FLOAT')
print('len', mix.shape[1] / SR, 'lufs', lufs(np.tile(mix, (1, 2))), 'tp', true_peak_db(mix))
