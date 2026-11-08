"""3Shamrocks Studio adaptive score: the "Three Leaf Drive" theme family.
All original and synthesised from scratch with synth.py (oscillators, envelopes, noise). No samples.

Family DNA shared by every piece: the three-leaf bell motif (root, third, fifth: one note per shamrock leaf,
rhythm 1/8 1/8 dotted-half), the same synth palette (detuned saw pads, plucked arps, bell, FM keys, saw bass),
and minor-ninth / major-seventh colour harmony.

  python3 studio_family.py home            -> 5 homepage stems (bed, arp, pulse, keys, lead), 16 bars, 100 BPM, E minor
  python3 studio_family.py <page> [...]    -> one loop per product page (see VARIANTS)
  python3 studio_family.py all
Writes WAV (loop + its first second again) to /dev/shm/s3studio/fam/ and prints LUFS / true peak."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import *
import soundfile as sf

OUT = '/dev/shm/s3studio/fam'
os.makedirs(OUT, exist_ok=True)

# ---------------- instruments local to the family ----------------
def sawbass(f, dur, vel=0.7, cut=700):
    n = int((dur + 0.12) * SR); t = np.arange(n) / SR
    fc = cut * (0.35 + 0.65 * np.exp(-t / 0.07)) + 2.2 * f
    x = np.zeros(n); ph = 2 * np.pi * f * t
    for h in range(1, 60):
        if f * h > 5000: break
        x += np.sin(h * ph) / h * lp_w(f * h, fc, 2)
    x = x * 0.7 + np.sin(ph) * 0.55
    e = np.clip(t / 0.004, 0, 1) * np.where(t > dur, np.exp(-(t - dur) / 0.03), 1) * (0.75 + 0.25 * np.exp(-t / 0.12))
    return x * e * vel * 0.5

def lead(f, dur, vel=0.6): return horn(f, dur, vel, bright=0.55, att=0.035)
def softlead(f, dur, vel=0.6): return horn(f, dur, vel, bright=0.3, att=0.08)

def gated_snare(vel=0.6):
    n = int(0.42 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.035) * 0.5
    nz = bp(noise(n), 900, 9000) * (np.exp(-t / 0.05) * 0.6 + 0.28 * (t < 0.24) * np.exp(-t / 0.4))
    g = np.where(t < 0.24, 1, np.exp(-(t - 0.24) / 0.015))
    return (body + nz) * g * vel * 0.5

def soft_bell(f, d, v): return bell(f, d, v, 1.8)
def music_box(f, d, v):
    x = bell(f, d, v, 1.2); return lp(x, 5000)

def parse(s):
    out = []; b = 0.0
    for tok in s.split():
        nn, d = tok.split(':'); d = float(d)
        out.append((b, d, None if nn == 'r' else nn)); b += d
    return out

# ---------------- song builder ----------------
class Song:
    def __init__(self, bpm, prog):
        self.BEAT = 60 / bpm; self.BAR = 4 * self.BEAT; self.prog = prog; self.bars = len(prog)
        self.m = Mix(self.bars * self.BAR); self.kicks = []
    def T(self, bar, beat=0.0): return (bar - 1) * self.BAR + beat * self.BEAT
    def tones(self, bar, top='F#3'):
        r, q = self.prog[bar - 1]; r3 = midi(r + '3'); r3 = r3 - 12 if r3 > midi(top) else r3
        return chord(r3 + 12, q)
    def broot(self, bar, lo='D#1'):
        r, _ = self.prog[bar - 1]; b = midi(r + '1'); return b + 12 if b < midi(lo) else b
    def each(self): return range(1, self.bars + 1)
    # layers
    def pads(self, bus='pad', vel=0.5, fc=1300, att=0.7, n=4, bars=None):
        for b in (bars or self.each()):
            for nn in self.tones(b)[:n]: self.m.add(bus, pad(hz(nn), self.BAR, vel, att=att, rel=1.3, fc=fc), self.T(b))
    def sub(self, bus='bass', vel=0.55, bars=None):
        for b in (bars or self.each()): self.m.add(bus, bass(hz(self.broot(b)), self.BAR * 0.96, vel, 'sub'), self.T(b))
    def pulse(self, bus='bass', vel=0.6, cut=750, octave=True, bars=None):
        for b in (bars or self.each()):
            br = self.broot(b)
            for k in range(8):
                f = hz(br + (12 if (octave and k % 2) else 0))
                self.m.add(bus, sawbass(f, self.BEAT * 0.42, vel if k % 2 == 0 else vel * 0.78, cut), self.T(b, k * 0.5), jitter=0)
    def arp(self, bus='arp', step=0.25, vel=0.3, bright=0.45, inst=None, up=12, pat=(0, 1, 2, 3, 4, 3, 2, 1), decay=0.18, bars=None, pan=0.35):
        for b in (bars or self.each()):
            tn = self.tones(b); ext = tn + [x + 12 for x in tn]; k = 0; beat = 0.0
            while beat < 4 - 1e-6:
                nn = ext[min(pat[k % len(pat)], len(ext) - 1)] + up
                v = vel * (1.0 if k % 4 == 0 else 0.78) * RNG.uniform(0.94, 1.04)
                x = inst(hz(nn), self.BEAT * step * 0.9, v) if inst else pluck(hz(nn), self.BEAT * step * 0.9, v, decay=decay, bright=bright)
                self.m.add(bus, x, self.T(b, beat), pan=(-pan if k % 2 else pan)); k += 1; beat += step
    def keys(self, bus='keys', vel=0.35, beats=((0, 1.8), (2, 1.8)), n=4, bars=None, inst=None):
        for b in (bars or self.each()):
            for bt, d in beats:
                for nn in self.tones(b)[1:1 + n]: self.m.add(bus, (inst or ep)(hz(nn), d * self.BEAT, vel), self.T(b, bt), pan=0.1)
    def kick(self, beats=(0, 2), vel=0.6, soft=False, bus='kick', bars=None):
        for b in (bars or self.each()):
            for bt in beats: self.m.add(bus, kick(vel, soft=soft), self.T(b, bt), jitter=0); self.kicks.append(self.T(b, bt))
    def hats(self, step=0.5, vel=0.3, bus='hat', bars=None, fn=None):
        for b in (bars or self.each()):
            k = 0; bt = 0.0
            while bt < 4 - 1e-6:
                v = vel if (bt % 1) == 0.5 else vel * 0.6
                self.m.add(bus, (fn or hat)(v), self.T(b, bt), pan=0.25); bt += step; k += 1
    def hit(self, fn, beats, bus, bars=None, pan=0.0):
        for b in (bars or self.each()):
            for bt in beats: self.m.add(bus, fn(), self.T(b, bt), pan=pan)
    def line(self, lines, bar0, inst, bus, vel, pan=0.0):
        for i, ln in enumerate(lines):
            for (b, d, nn) in parse(ln):
                if nn is None: continue
                self.m.add(bus, inst(hz(nn), d * self.BEAT * 0.92, vel * RNG.uniform(0.94, 1.04)), self.T(bar0 + i, b), pan=pan)
    def motif(self, notes, bars, bus='bell', vel=0.35, inst=soft_bell, pan=0.2):
        a, b, c = notes
        for bar in bars: self.line([f'{a}:.5 {b}:.5 {c}:3'], bar, inst, bus, vel, pan)

CH = {
    'pad': lambda: pb.Pedalboard([pb.HighpassFilter(140), pb.LowpassFilter(4000), pb.Chorus(0.25, 0.25, 8, 0.15, 0.45), pb.Gain(-5)]),
    'bass': lambda: pb.Pedalboard([pb.HighpassFilter(32), pb.LowpassFilter(2200), pb.Compressor(-20, 3, 5, 80), pb.Gain(-2)]),
    'arp': lambda beat: pb.Pedalboard([pb.HighpassFilter(300), pb.LowpassFilter(6000), pb.Delay(beat * 0.75, 0.32, 0.22), pb.Gain(-8)]),
    'kick': lambda: pb.Pedalboard([pb.LowpassFilter(4000), pb.Gain(-3)]),
    'snare': lambda: pb.Pedalboard([pb.HighpassFilter(180), pb.Gain(-9)]),
    'hat': lambda: pb.Pedalboard([pb.HighpassFilter(6000), pb.Gain(-13)]),
    'perc': lambda: pb.Pedalboard([pb.HighpassFilter(150), pb.Gain(-8)]),
    'lead': lambda beat: pb.Pedalboard([pb.HighpassFilter(200), pb.LowpassFilter(5500), pb.Compressor(-18, 2, 10, 120), pb.Chorus(0.4, 0.2, 7, 0.1, 0.3),
                                        pb.Delay(beat * 0.75, 0.25, 0.16), pb.Gain(-4)]),
    'keys': lambda: pb.Pedalboard([pb.HighpassFilter(150), pb.Compressor(-16, 2, 10, 120), pb.Chorus(0.6, 0.15, 7, 0.1, 0.3), pb.Gain(-3)]),
    'bell': lambda beat: pb.Pedalboard([pb.HighpassFilter(500), pb.Delay(beat * 0.5, 0.25, 0.18), pb.Gain(-6)]),
}
SENDS = {'pad': 0.3, 'arp': 0.18, 'snare': 0.35, 'lead': 0.28, 'bell': 0.45, 'keys': 0.25, 'perc': 0.2}
def chain(name, beat):
    f = CH[name]
    try: return f(beat)
    except TypeError: return f()

def process(song, buses, ir, duck=True, rv_wet=0.8):
    """per-bus chains + this group's own reverb send (reverb is linear, so groups sum to the full mix)"""
    m = song.m; dry = np.zeros((2, m.n)); send = np.zeros((2, m.n))
    dc = duck_curve(m.n, song.kicks) if (duck and song.kicks) else None
    for name in buses:
        if name not in m.bus: continue
        y = periodic(chain(name, song.BEAT), m.folded(name))
        if dc is not None and name in ('pad', 'bass', 'arp', 'keys'): y = y * dc
        dry += y; send += y * SENDS.get(name, 0)
    rv = circ_reverb(send, ir, rv_wet)
    rv = periodic(pb.Pedalboard([pb.HighpassFilter(280), pb.LowpassFilter(7500)]), rv)
    return dry + rv

def duck_curve(n, times, depth=0.4, rel=0.16):
    d = np.ones(n); k = np.arange(int(rel * 5 * SR)) / SR; shape = 1 - depth * np.exp(-k / rel) * np.clip(k / 0.005, 0, 1)
    for t0 in times:
        i = int(round(t0 * SR)) % n; seg = shape[:n - i]; d[i:i + len(seg)] = np.minimum(d[i:i + len(seg)], seg)
        if len(seg) < len(shape): r = shape[len(seg):]; d[:len(r)] = np.minimum(d[:len(r)], r)
    return d

def write(name, mix):
    sf.write(f'{OUT}/{name}.wav', np.concatenate([mix, mix[:, :SR]], axis=1).T, SR, subtype='FLOAT')

def finish_variant(name, song, ir, glue=True):
    mix = process(song, list(song.m.bus.keys()), ir)
    if glue: mix = periodic(pb.Pedalboard([pb.LowShelfFilter(70, 0.5), pb.HighShelfFilter(11000, -0.5), pb.Compressor(-15, 2, 25, 220)]), mix)
    mix = master(mix, -16.0, -1.0)
    write(name, mix)
    info = {'len': round(mix.shape[1] / SR, 3), 'lufs': round(lufs(np.tile(mix, (1, 2))), 2), 'tp': round(true_peak_db(mix), 2), 'bpm': round(60 / song.BEAT), 'bars': song.bars}
    print(name, info); return info

# ---------------- homepage: one theme, five stems ----------------
P = [('E', 'm9'), ('C', 'maj7'), ('G', 'add9'), ('D', '6'), ('E', 'm9'), ('C', 'maj7'), ('G', 'add9'), ('D', 'sus4')]
Q = [('A', 'm9'), ('C', 'maj7'), ('E', 'm9'), ('D', '6'), ('A', 'm9'), ('C', 'maj7'), ('B', 'sus4'), ('B', '7')]
STEMS = {'bed': ['pad', 'bass', 'bell'], 'arp': ['arp'], 'pulse': ['kick', 'hat'], 'keys': ['keys'], 'lead': ['lead', 'snare']}
# pulse stem also carries the saw bass: it is put on its own bus 'pbass' and processed with the bass chain
CH['pbass'] = CH['bass']
STEMS['pulse'] = ['pbass', 'kick', 'hat']
# section mixes (stem gains before loudness makeup), in page order: energy builds toward the contact CTA
SECTIONS = {
    'hero':       {'bed': 1, 'arp': 0.7},
    'work':       {'bed': 1, 'arp': 1, 'pulse': 1},
    'identity':   {'bed': 1, 'arp': 0.8, 'pulse': 1, 'keys': 0.8},
    'experience': {'bed': 1, 'arp': 0.45, 'pulse': 0.55, 'keys': 1},
    'about':      {'bed': 1, 'arp': 1, 'pulse': 1, 'keys': 0.7, 'lead': 0.5},
    'contact':    {'bed': 1, 'arp': 1, 'pulse': 1, 'keys': 0.8, 'lead': 1},
}
def home():
    s = Song(100, P + Q)
    s.pads(vel=0.5, fc=1300); s.sub(vel=0.5)
    s.motif(('E5', 'G5', 'B5'), [1, 5], vel=0.36); s.motif(('E6', 'G6', 'C7'), [10], vel=0.22); s.motif(('E6', 'G6', 'B6'), [11], vel=0.22)
    s.arp(vel=0.3, bright=0.5)
    s.pulse(bus='pbass', vel=0.6, cut=800); s.kick((0, 2), 0.62)
    for b in (4, 8, 12, 16): s.kick((3.5,), 0.4, bars=[b])
    s.hats(0.5, 0.32)
    s.keys(vel=0.3, beats=((0, 1.4), (1.5, 0.9), (2.5, 1.4)))
    melP = ['E5:.5 G5:.5 B5:2 A5:1', 'G5:1.5 E5:.5 G5:1 B5:1', 'D6:2 B5:1 A5:1', 'F#5:3 r:1',
            'E5:.5 G5:.5 B5:2 E6:1', 'D6:1.5 B5:.5 G5:1 E5:1', 'D6:2 B5:1 G5:1', 'A5:2 G5:1 A5:1']
    melQ = ['A4:.5 C5:.5 E5:2 D5:1', 'E5:1.5 G5:.5 E5:1 D5:1', 'B4:3 r:1', 'A4:.5 B4:.5 D5:1 F#5:2',
            'A4:.5 C5:.5 E5:2 G5:1', 'G5:1.5 E5:.5 C5:1 B4:1', 'A4:1 B4:1 E5:2', 'D#5:2 F#5:1 B4:1']
    s.line(melP + melQ, 1, lead, 'lead', 0.48, 0.0)
    s.hit(lambda: gated_snare(0.56), (1, 3), 'snare')
    ir = reverb_ir(2.6, 0.025, 7000, seed=33)
    st = {k: process(s, v, ir, duck=False) for k, v in STEMS.items()}
    full = sum(st.values())
    g = 10 ** ((-16.0 - lufs(np.tile(full, (1, 2)))) / 20)
    st = {k: v * g for k, v in st.items()}
    # loudness makeup per section, held under -1.5 dBTP so the encoded result stays below -1
    make = {}
    for sec, mixg in SECTIONS.items():
        y = sum(st[k] * v for k, v in mixg.items())
        mk = 10 ** ((-16.0 - lufs(np.tile(y, (1, 2)))) / 20)
        tp = true_peak_db(y * mk)
        if tp > -1.5: mk *= 10 ** ((-1.5 - tp) / 20)
        z = y * mk
        make[sec] = {'makeup': round(mk, 4), 'lufs': round(lufs(np.tile(z, (1, 2))), 2), 'tp': round(true_peak_db(z), 2)}
    # store each stem with a fixed headroom; the player multiplies it back (meta 'scale')
    scale = {}
    for k, v in st.items():
        pk = true_peak_db(v); sc = 10 ** ((-3.0 - pk) / 20) if pk > -3.0 else 1.0
        scale[k] = round(1 / sc, 5); write(f'home-{k}', v * sc)
    meta = {'loop': round(s.m.n / SR, 4), 'bpm': 100, 'bars': 16, 'stems': list(STEMS), 'scale': scale, 'sections': SECTIONS, 'mix': make}
    json.dump(meta, open(f'{OUT}/home.json', 'w'), indent=1); print(json.dumps(meta))

# ---------------- product pages: one short loop each, same DNA ----------------
def v_shomer():   # calm and assured: D major, 84 BPM, spacious
    s = Song(84, [('D', 'maj7'), ('B', 'm9'), ('G', 'maj7'), ('A', 'sus4')] * 3)
    s.pads(vel=0.55, fc=1200); s.sub(vel=0.5); s.arp(step=0.5, vel=0.26, bright=0.3, decay=0.3)
    s.motif(('D5', 'F#5', 'A5'), [1, 7], vel=0.36); s.kick((0,), 0.4, soft=True); s.hats(1.0, 0.18, fn=shaker)
    return s
def v_lickpick():  # music energy: A minor, 116 BPM, four on the floor
    s = Song(116, [('A', 'm9'), ('F', 'maj7'), ('C', 'add9'), ('G', '6')] * 4)
    s.pads(vel=0.35, fc=1800); s.pulse(vel=0.62, cut=1100); s.arp(vel=0.3, bright=0.75)
    s.kick((0, 1, 2, 3), 0.62); s.hit(lambda: clap(0.5), (1, 3), 'snare'); s.hats(0.25, 0.3)
    s.motif(('A5', 'C6', 'E6'), [1, 9], vel=0.3)
    lead_l = ['A5:.5 C6:.5 E6:1.5 D6:.5 C6:1', 'A5:1 G5:.5 A5:.5 C6:2', 'E6:.5 D6:.5 C6:1 D6:1 E6:1', 'D6:3 r:1']
    s.line(lead_l, 5, lead, 'lead', 0.42); s.line(lead_l, 13, lead, 'lead', 0.45)
    return s
def v_trashure(): # adventure: D minor, 104 BPM, marimba arp, frame-drum toms, flute
    s = Song(104, [('D', 'm9'), ('B', 'maj7'), ('F', 'add9'), ('C', '6')] * 4)
    s.prog = [(('Bb' if r == 'B' else r), q) for r, q in s.prog]
    s.pads(vel=0.4, fc=1500); s.sub(vel=0.5)
    s.arp(step=0.5, vel=0.42, inst=marimba, up=12, pat=(0, 2, 1, 3, 2, 4, 3, 1))
    s.hit(lambda: framedrum(95, 0.55, 0.3), (0, 1.5, 2, 3.5), 'perc'); s.hit(lambda: framedrum(140, 0.35, 0.18), (2.75,), 'perc', pan=0.3)
    s.hats(0.5, 0.22, fn=shaker); s.motif(('D5', 'F5', 'A5'), [1, 9], vel=0.34)
    fl = ['D5:.5 F5:.5 A5:2 G5:1', 'F5:1.5 D5:.5 F5:1 G5:1', 'A5:2 C6:1 A5:1', 'G5:3 r:1']
    s.line(fl, 5, flute, 'lead', 0.5, -0.1); s.line(fl, 13, flute, 'lead', 0.5, -0.1)
    return s
def v_chore():    # playful arena: C major, 112 BPM, pizzicato bounce, woodblock, fanfare
    s = Song(112, [('C', 'maj'), ('A', 'm7'), ('F', 'add9'), ('G', 'sus4')] * 4)
    s.prog[-1] = ('G', '7')
    s.pads(vel=0.3, fc=1600); s.sub(vel=0.45)
    s.arp(step=0.5, vel=0.42, bright=0.9, decay=0.14, pat=(0, 2, 1, 2, 3, 2, 1, 2), up=0)
    s.kick((0, 2), 0.55); s.hit(lambda: clap(0.45), (1, 3), 'snare'); s.hit(lambda: woodblock(1300, 0.4), (0.5, 2.5), 'perc', pan=0.4)
    s.motif(('C5', 'E5', 'G5'), [1, 9], vel=0.3, inst=lambda f, d, v: glock(f, d, v))
    fan = ['C5:.5 E5:.5 G5:2 E5:1', 'A5:1 G5:1 E5:2', 'F5:.5 A5:.5 C6:2 A5:1', 'G5:2 B4:1 D5:1']
    s.line(fan, 5, lambda f, d, v: horn(f, d, v, bright=0.8), 'lead', 0.45); s.line(fan, 13, lambda f, d, v: horn(f, d, v, bright=0.8), 'lead', 0.48)
    return s
def v_fairent():  # clean and trustworthy: F major, 92 BPM, electric piano, light arp
    s = Song(92, [('F', 'maj7'), ('D', 'm9'), ('B', 'maj7'), ('C', '6')] * 3)
    s.prog = [(('Bb' if r == 'B' else r), q) for r, q in s.prog]
    s.pads(vel=0.4, fc=1500); s.sub(vel=0.5); s.keys(vel=0.34, beats=((0, 1.5), (1.5, 1), (2.5, 1.4)))
    s.arp(step=0.5, vel=0.22, bright=0.4); s.kick((0, 2), 0.45, soft=True); s.hit(lambda: rim(0.4), (1, 3), 'perc')
    s.hats(0.5, 0.2); s.motif(('F5', 'A5', 'C6'), [1, 7], vel=0.32)
    return s
def v_j8nix():    # dark tech: F minor, 96 BPM, low pulse, ticking hats, dark arp
    s = Song(96, [('F', 'm9'), ('C#', 'maj7'), ('A#', 'm9'), ('C', 'sus4')] * 3)
    s.prog = [({'C#': 'Db', 'A#': 'Bb'}.get(r, r), q) for r, q in s.prog]
    s.pads(vel=0.45, fc=900); s.pulse(vel=0.6, cut=420, octave=False); s.arp(vel=0.26, bright=0.25, up=0, pat=(0, 3, 1, 4, 2, 3, 1, 4))
    s.kick((0, 2.5), 0.6); s.hats(0.25, 0.26); s.hit(lambda: rim(0.35), (3,), 'perc', pan=-0.3)
    s.motif(('F4', 'Ab4', 'C5'), [1, 7], vel=0.36)
    return s
def v_health():   # warm and clinical: G major, 88 BPM, warm keys, heartbeat kick
    s = Song(88, [('G', 'maj7'), ('E', 'm9'), ('C', 'maj7'), ('D', '6')] * 3)
    s.pads(vel=0.45, fc=1400); s.sub(vel=0.5); s.keys(vel=0.32, beats=((0, 1.8), (2, 1.8)))
    s.arp(step=0.5, vel=0.2, bright=0.35, decay=0.25); s.kick((0, 0.35), 0.38, soft=True); s.hats(1.0, 0.16, fn=shaker)
    s.motif(('G5', 'B5', 'D6'), [1, 7], vel=0.32)
    return s
def v_ezra():     # soft concept placeholder: E minor, 80 BPM, pads and bells
    s = Song(80, [('E', 'm9'), ('C', 'maj7'), ('G', 'add9'), ('D', '6')] * 2 + [('A', 'm9'), ('B', 'sus4')])
    s.pads(vel=0.55, fc=1100); s.sub(vel=0.45); s.arp(step=1.0, vel=0.22, bright=0.25, decay=0.5)
    s.motif(('E5', 'G5', 'B5'), [1, 5, 9], vel=0.32)
    return s
def v_milo():     # gentle and kid-safe: C major, 76 BPM, music box and kalimba, no drums, nothing sharp
    s = Song(76, [('C', 'maj7'), ('A', 'm7'), ('F', 'maj7'), ('G', '6')] * 2 + [('F', 'maj7'), ('G', 'sus4')])
    s.pads(vel=0.5, fc=900, att=1.0); s.sub(vel=0.35)
    s.arp(step=1.0, vel=0.3, inst=kalimba, up=0, pat=(0, 2, 1, 3))
    s.motif(('C5', 'E5', 'G5'), [1, 5, 9], vel=0.28, inst=music_box)
    return s
def v_rk():       # soft concept placeholder: A minor, 92 BPM, keys and a quiet chess-clock tick
    s = Song(92, [('A', 'm9'), ('F', 'maj7'), ('C', 'add9'), ('E', 'sus4')] * 3)
    s.pads(vel=0.5, fc=1200); s.sub(vel=0.45); s.keys(vel=0.28, beats=((0, 1.8), (2.5, 1.2)))
    s.hit(lambda: woodblock(1500, 0.3), (0, 2), 'perc', pan=0.4); s.hit(lambda: woodblock(1150, 0.3), (1, 3), 'perc', pan=-0.4)
    s.motif(('A5', 'C6', 'E6'), [1, 7], vel=0.3)
    return s
VARIANTS = {'shomer': v_shomer, 'lickpick': v_lickpick, 'trashure-hunters': v_trashure, 'chore-royale': v_chore, 'fairent': v_fairent,
            'j8nix': v_j8nix, 'healthtech': v_health, 'ezra': v_ezra, 'milo': v_milo, 'rk': v_rk}

if __name__ == '__main__':
    args = sys.argv[1:] or ['all']
    if args == ['all']: args = ['home'] + list(VARIANTS)
    for a in args:
        if a == 'home': home(); continue
        s = VARIANTS[a]()
        info = finish_variant(a, s, reverb_ir(2.4, 0.02, 7000, seed=41), glue=a != 'milo')
        json.dump(info, open(f'{OUT}/{a}.json', 'w'))
