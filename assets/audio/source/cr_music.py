import sys; sys.path.insert(0, '/dev/shm/s3a')
from score import *
import soundfile as sf
BPM = 100; BEAT = 60 / BPM; BAR = 4 * BEAT; BARS = 30
m = Mix(BARS * BAR)
def T(bar, beat=0.0): return (bar - 1) * BAR + beat * BEAT

# chord plan (bar -> list of (beat, root, quality, beats))
F, Bb, C, Dm, Gm = ('F', 'maj'), ('Bb', 'maj'), ('C', 'maj'), ('D', 'min'), ('G', 'min')
C7 = ('C', '7')
A_ = [[F], [F], [Bb], [C], [F], [Dm], [Gm, C], [F]]
B_ = [[F], [F], [Gm], [C], [F], [C7], [F, C7], [F]]
C_ = [[Dm], [Bb], [F], [C], [Dm], [Bb, C]]
D_ = [[F], [F], [Gm], [C], [Gm], [C], [F, C7], [F, C7]]
plan = A_ + B_ + C_ + D_
assert len(plan) == BARS
def chords_of(bar):
    cs = plan[bar - 1]; L = 4 / len(cs)
    return [(i * L, L, r, q) for i, (r, q) in enumerate(cs)]
sec = lambda b: 'A' if b <= 8 else 'B' if b <= 16 else 'C' if b <= 22 else 'D'

for bar in range(1, BARS + 1):
    s = sec(bar)
    for (b0, L, r, q) in chords_of(bar):
        root = midi(r + '2'); 
        if root < midi('E2'): root += 12
        tones = chord(midi(r + '4') if midi(r + '4') <= midi('Bb4') else midi(r + '3'), q)
        # bass: pizz upright, root + fifth (march), whole notes in C
        if s == 'C':
            m.add('bass', bass(hz(root), L * BEAT * 0.9, 0.55), T(bar, b0))
        else:
            for k in range(int(L // 2) or 1):
                bt = b0 + k * 2
                m.add('bass', bass(hz(root if k % 2 == 0 or L < 4 else root + 7), BEAT * 0.8, 0.62), T(bar, bt))
                if L >= 4 and k == 0: m.add('bass', bass(hz(root + 7 - 12 if root + 7 > midi('C3') else root + 7), BEAT * 0.8, 0.5), T(bar, bt + 2))
        # pizz strings off-beat chords (oom-pah), sparse in C
        if s != 'C':
            for bt in np.arange(b0 + 1, b0 + L, 2):
                for j, nn in enumerate(tones[:3]):
                    m.add('pizz', pluck(hz(nn), 0.25, 0.42 + 0.05 * (bt % 4 == 1), decay=0.3), T(bar, bt) + j * 0.006, pan=-0.35 + 0.35 * j)
        else:
            for j, nn in enumerate(tones[:3]):
                m.add('pizz', pluck(hz(nn + 12), 0.4, 0.3, decay=0.6), T(bar, b0) + j * 0.03, pan=-0.3 + 0.3 * j)
        # string pad bed in B, C, D
        if s in 'BCD':
            for nn in tones[:3]:
                m.add('pad', pad(hz(nn), L * BEAT, 0.5 if s != 'C' else 0.65, att=0.6, rel=1.2, fc=1400), T(bar, b0))

# rim / brush march (A, B, D), gentle
for bar in range(1, BARS + 1):
    s = sec(bar)
    if s == 'C': continue
    for bt in (1, 3):
        m.add('drums', rim(0.45), T(bar, bt), pan=0.15)
    for bt in (0, 2):
        m.add('drums', snare(0.22, brush=True), T(bar, bt), pan=-0.1)
    if bar % 4 == 0:  # little ruff into next phrase
        for k, bt in enumerate((3.5, 3.625, 3.75, 3.875)):
            m.add('drums', snare(0.12 + 0.03 * k), T(bar, bt), pan=0.1)
    if s in 'BD' and bar in (9, 13, 23, 27):
        m.add('timp', timpani(hz('F2'), 0.55), T(bar))
    if bar in (16, 30):
        m.add('timp', timpani(hz('C3'), 0.4), T(bar, 2)); m.add('timp', timpani(hz('C3'), 0.45), T(bar, 3))

# glock answers in A (even bars) and sprinkles in C
gl = {2: 'A5:.5 C6:.5 F6:1', 4: 'G5:.5 C6:.5 E6:1', 6: 'F5:.5 A5:.5 D6:1', 8: 'C6:.5 A5:.5 F5:1'}
for bar, s_ in gl.items():
    notes, _ = parse(s_)
    for (b, d, n) in notes: m.add('glock', glock(hz(n), d * BEAT, 0.42), T(bar, 2 + b), pan=0.3)
for bar, s_ in {18: 'D6:1 F6:1', 20: 'E6:1 G6:1', 22: 'F6:1 A6:1'}.items():
    notes, _ = parse(s_)
    for (b, d, n) in notes: m.add('glock', glock(hz(n), d * BEAT, 0.3), T(bar, 2 + b), pan=0.35)

# main theme (horns) - B (9-16) and D (23-30)
theme_B = ['F4:.5 A4:.5 C5:1.5 D5:.5 C5:1', 'Bb4:1 A4:.5 G4:.5 A4:2', 'D5:.5 C5:.5 Bb4:1 G4:1 Bb4:1', 'A4:.75 G4:.25 F4:1 G4:2',
           'F4:.5 A4:.5 C5:1.5 D5:.5 F5:1', 'E5:.75 D5:.25 C5:1 D5:1 Bb4:1', 'A4:1 C5:.5 Bb4:.5 G4:1 E4:1', 'F4:3 r:1']
theme_D = theme_B[:4] + ['D5:.5 C5:.5 Bb4:1 D5:1 F5:1', 'E5:.75 D5:.25 C5:1 G4:2', 'A4:1 C5:.5 Bb4:.5 G4:1 E4:1', 'F4:2 G4:1 E4:1']
def play_line(lines, bar0, inst, bus, vel, pan=0.0, octave=0, dbl=None):
    for i, ln in enumerate(lines):
        notes, _ = parse(ln)
        for (b, d, n) in notes:
            if n is None: continue
            v = vel * (1.08 if b == 0 else 1.0) * RNG.uniform(0.92, 1.05)
            m.add(bus, inst(hz(n + octave), d * BEAT * 0.95, v), T(bar0 + i, b), pan=pan)
            if dbl: m.add(dbl[0], dbl[1](hz(n + octave + dbl[2]), d * BEAT, dbl[3]), T(bar0 + i, b), pan=dbl[4])
play_line(theme_B, 9, horn, 'horn', 0.62, pan=-0.12)
play_line(theme_D, 23, horn, 'horn', 0.66, pan=-0.12, dbl=('glock', glock, 12, 0.18, 0.3))
# second horn harmony a third/sixth below in D, soft
for bar in range(23, 31):
    for (b0, L, r, q) in chords_of(bar):
        tones = chord(midi(r + '3'), q)
        m.add('horn2', horn(hz(tones[1] if tones[1] >= midi('A3') else tones[1] + 12), L * BEAT * 0.9, 0.35, bright=0.6, att=0.12), T(bar, b0), pan=0.25)

# clarinet line in C (17-22)
cl = ['A4:1.5 F4:.5 D4:1 F4:1', 'G4:1 F4:.5 D4:.5 F4:2', 'C5:1.5 A4:.5 F4:1 A4:1', 'G4:2 E4:1 G4:1', 'A4:1 D5:1 C5:.5 A4:.5 F4:1', 'G4:1.5 A4:.5 Bb4:1 C5:1']
play_line(cl, 17, woodwind, 'wood', 0.6, pan=0.1)
# bassoon-ish counterline in A (low woodwind), very soft
bsn = ['F3:2 A3:2', 'C4:2 A3:2', 'Bb3:2 D4:2', 'C4:2 E3:2', 'F3:2 A3:2', 'D3:2 F3:2', 'G3:2 C3:2', 'F3:4']
play_line(bsn, 1, woodwind, 'wood', 0.33, pan=0.2)

chains = {
    'bass': pb.Pedalboard([pb.HighpassFilter(40), pb.LowpassFilter(2500), pb.Compressor(-18, 3, 10, 120), pb.Gain(-1)]),
    'pizz': pb.Pedalboard([pb.HighpassFilter(180), pb.PeakFilter(3000, 2, 1), pb.Gain(-3)]),
    'pad': pb.Pedalboard([pb.HighpassFilter(150), pb.LowpassFilter(5000), pb.Gain(-7)]),
    'drums': pb.Pedalboard([pb.HighpassFilter(150), pb.Compressor(-20, 3, 2, 80), pb.Gain(-5)]),
    'timp': pb.Pedalboard([pb.HighpassFilter(45), pb.Gain(-4)]),
    'glock': pb.Pedalboard([pb.HighpassFilter(500), pb.Gain(-6)]),
    'horn': pb.Pedalboard([pb.HighpassFilter(120), pb.PeakFilter(400, -2, 0.8), pb.LowpassFilter(6000), pb.Compressor(-16, 2.5, 15, 150), pb.Gain(0)]),
    'horn2': pb.Pedalboard([pb.HighpassFilter(120), pb.LowpassFilter(4000), pb.Gain(-4)]),
    'wood': pb.Pedalboard([pb.HighpassFilter(120), pb.LowpassFilter(7000), pb.Gain(-1)]),
}
sends = {'pizz': 0.18, 'pad': 0.35, 'drums': 0.12, 'timp': 0.25, 'glock': 0.4, 'horn': 0.3, 'horn2': 0.35, 'wood': 0.3, 'bass': 0.04}
ir = reverb_ir(2.6, 0.025, 7000)
mix = render_buses(m, chains, sends, ir, 0.9, pb.Pedalboard([pb.HighpassFilter(250), pb.LowpassFilter(8000)]))
mix = periodic(pb.Pedalboard([pb.LowShelfFilter(120, 0.5), pb.HighShelfFilter(9000, 1.0), pb.Compressor(-14, 1.8, 30, 250)]), mix)
mix = master(mix, -16.0, -1.0)
sf.write('/dev/shm/s3a/out/cr_theme.wav', mix.T, SR, subtype='FLOAT')
print('len', mix.shape[1] / SR, 'lufs', lufs(np.tile(mix, (1, 2))), 'tp', true_peak_db(mix))
