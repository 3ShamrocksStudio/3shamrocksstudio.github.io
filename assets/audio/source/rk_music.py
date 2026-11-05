import sys; sys.path.insert(0, '/dev/shm/s3a')
from score import *
import soundfile as sf
BPM = 120; BEAT = 60 / BPM; BAR = 4 * BEAT; BARS = 36
m = Mix(BARS * BAR)
def T(bar, beat=0.0): return (bar - 1) * BAR + beat * BEAT
cyc1 = [('A', 'm9'), ('F', 'maj7'), ('C', 'add9'), ('G', '6')]
cyc2 = [('D', 'm9'), ('F', 'maj7'), ('A', 'm9'), ('E', 'sus4')]
plan = (cyc1 + cyc2) * 4 + cyc1
plan[35] = ('E', '7')  # last bar resolves back to Am
plan = plan[:BARS]
sec = lambda b: 'I' if b <= 4 else 'A' if b <= 12 else 'B' if b <= 20 else 'C' if b <= 28 else 'D'
for bar in range(1, BARS + 1):
    r, q = plan[bar - 1]; s = sec(bar)
    r3 = midi(r + '3'); r3 = r3 - 12 if r3 > midi('E3') else r3
    tones = chord(r3 + 12, q)
    for nn in tones[:4]:
        m.add('pad', pad(hz(nn), BAR, 0.85 if s == 'I' else 0.5 if s == 'C' else 0.4, att=0.8, rel=1.2, fc=1000 if s != 'C' else 1500), T(bar))
    br = midi(r + '1'); br = br + 12 if br < midi('E1') else br
    if True:
        if s in 'IC':
            m.add('bass', bass(hz(br), BAR * 0.95, 0.5, 'sub'), T(bar))
        else:
            for bt, d, v in ((0, 1.4, 0.62), (1.5, 0.4, 0.4), (2, 1.4, 0.55), (3.5, 0.4, 0.42)):
                m.add('bass', bass(hz(br), d * BEAT, v, 'sub'), T(bar, bt))
    # arp pluck 8ths (A, B, D) — brightness drifts with bar for movement
    if s in 'ABD' or (s == 'C' and bar >= 25):
        seq = [tones[i % len(tones)] + (12 if i >= len(tones) else 0) for i in (0, 2, 1, 3, 2, 4, 3, 2)]
        bright = 0.35 + 0.35 * (0.5 + 0.5 * np.sin(bar / 6.0))
        for k, nn in enumerate(seq):
            m.add('arp', pluck(hz(nn), 0.2, (0.42 if k % 2 == 0 else 0.3) * RNG.uniform(0.9, 1.05), decay=0.22, bright=bright), T(bar, k * 0.5), pan=(-0.45 if k % 2 else 0.45))
    # drums
    if s in 'ABD':
        m.add('kick', kick(0.6), T(bar, 0)); m.add('kick', kick(0.45), T(bar, 2))
        if s == 'A' and bar % 4 == 0: m.add('kick', kick(0.3), T(bar, 3.5))
    if s in 'BD':
        m.add('clap', clap(0.45), T(bar, 1), pan=0.05); m.add('clap', clap(0.45), T(bar, 3), pan=-0.05)
        for k in range(8):
            m.add('hat', hat(0.32 if k % 2 else 0.2), T(bar, k * 0.5), pan=0.3)
    # chess-clock tick: very soft, intro and breakdown only
    if s in 'IC':
        for k in range(4):
            m.add('tick', woodblock(1500 if k % 2 == 0 else 1150, 0.28 if s == 'C' else 0.4), T(bar, k), pan=0.5 if k % 2 == 0 else -0.5)
# EP melody B (13-20)
mel = ['E5:1.5 C5:.5 B4:1 A4:1', 'C5:1.5 A4:.5 G4:1 E4:1', 'G4:.5 A4:.5 C5:1 D5:1.5 E5:.5', 'D5:3 r:1',
       'F5:1.5 E5:.5 D5:1 A4:1', 'C5:1.5 A4:.5 E5:1 C5:1', 'B4:1 C5:.5 D5:.5 E5:2', 'E5:.5 D5:.5 B4:1 G#4:2']
def line(lines, bar0, inst, bus, vel, pan=0.0):
    for i, ln in enumerate(lines):
        notes, _ = parse(ln)
        for (b, d, nn) in notes:
            if nn is None: continue
            m.add(bus, inst(hz(nn), d * BEAT * 0.95, vel * RNG.uniform(0.92, 1.05)), T(bar0 + i, b), pan=pan)
line(mel, 13, ep, 'ep', 0.6, -0.1)
# bells in C (21-28): two-note motifs
bl = ['B5:1 E5:3', 'G5:1 C5:3', 'D6:1 G5:3', 'A5:1 D5:3', 'E5:1 A5:3', 'E5:1 C5:3', 'B5:1 E5:3', 'G#5:1 B5:3']
line(bl, 21, lambda f, d, v: bell(f, d, v, 2.0), 'bell', 0.42, 0.25)
# D (29-36): EP chord stabs on 1 and 2.5, melody echo in bells
for bar in range(29, 37):
    r, q = plan[bar - 1]; r3 = midi(r + '3'); r3 = r3 - 12 if r3 > midi('E3') else r3
    for bt in (0, 2.5):
        for nn in chord(r3 + 12, q)[1:4]:
            m.add('ep', ep(hz(nn), 0.35, 0.3), T(bar, bt), pan=0.15)
line(['E6:1.5 C6:.5 B5:1 A5:1', 'r:4', 'G5:.5 A5:.5 C6:1 D6:2', 'r:4', 'F6:1.5 E6:.5 D6:1 A5:1', 'r:4', 'B5:1 C6:.5 D6:.5 E6:2', 'r:4'], 29,
     lambda f, d, v: bell(f, d, v, 1.4), 'bell', 0.28, 0.3)
chains = {
    'pad': pb.Pedalboard([pb.HighpassFilter(150), pb.LowpassFilter(3500), pb.Chorus(0.3, 0.2, 7, 0.1, 0.4), pb.Gain(-6)]),
    'bass': pb.Pedalboard([pb.HighpassFilter(30), pb.LowpassFilter(400), pb.Compressor(-18, 3, 10, 100), pb.Gain(-1)]),
    'arp': pb.Pedalboard([pb.HighpassFilter(250), pb.LowpassFilter(4500), pb.Delay(0.375, 0.25, 0.18), pb.Gain(-6)]),
    'kick': pb.Pedalboard([pb.LowpassFilter(3000), pb.Gain(-4)]),
    'clap': pb.Pedalboard([pb.HighpassFilter(300), pb.Gain(-9)]),
    'hat': pb.Pedalboard([pb.Gain(-11)]),
    'tick': pb.Pedalboard([pb.HighpassFilter(600), pb.Gain(-9)]),
    'ep': pb.Pedalboard([pb.HighpassFilter(150), pb.Compressor(-16, 2, 10, 120), pb.Chorus(0.6, 0.15, 7, 0.1, 0.3), pb.Gain(-1)]),
    'bell': pb.Pedalboard([pb.HighpassFilter(400), pb.Delay(0.5, 0.2, 0.15), pb.Gain(-5)]),
}
sends = {'pad': 0.3, 'arp': 0.15, 'clap': 0.2, 'tick': 0.25, 'ep': 0.3, 'bell': 0.45, 'hat': 0.05}
mix = render_buses(m, chains, sends, reverb_ir(2.8, 0.03, 7500, seed=21), 0.85, pb.Pedalboard([pb.HighpassFilter(300), pb.LowpassFilter(8000)]))
mix = periodic(pb.Pedalboard([pb.LowShelfFilter(80, 0.5), pb.HighShelfFilter(10000, 0.8), pb.Compressor(-14, 2, 25, 200)]), mix)
mix = master(mix, -16.0, -1.0)
sf.write('/dev/shm/s3a/out/rk_theme.wav', mix.T, SR, subtype='FLOAT')
print('len', mix.shape[1] / SR, 'lufs', lufs(np.tile(mix, (1, 2))), 'tp', true_peak_db(mix))
