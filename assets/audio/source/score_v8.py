"""3Shamrocks Studio homepage music, Score v8 "better soloists": Score v7 with only the lead / solo voices re-rendered.

Dave, 12 Nov: "I liked it better when it was upbeat and more fun ... the build up as user scroll ... all you had to do is
improve the solo instruments while considering everything else I asked you for!" Earlier: no trumpet ("that noise is so
annoying"), funky, fun, upbeat but not too fast, not screechy.

Everything that makes the groove stays exactly as v7: 98 BPM, the same notes, the same loop lengths, the same file names,
the same zone mix (mix.json is not touched) and the rhythm stems (drums, bass, gtr, keys, organ, bdrums, bbass, bkeys)
are not re-rendered. v8 re-renders the 14 lead / solo stems only:
  horns, shout, bhorn, bgtr, mel-theme, mel-shomer, mel-lickpick, mel-trashure-hunters, mel-chore-royale, mel-fairent,
  mel-milo, mel-concepts
What changes (the notes are v7's; only how they are played and how they sound):
  * no distortion on any sax / keys voice (v7 ran every lead through a drive stage: the buzz); the old 2.5-4.5 kHz brick-wall
    low-passes (the boxy, nasal "through a wall" sound, worst on the alto) are replaced by a de-nasal cut (~1.1 kHz), a
    de-harsh cut (~2.9 kHz) and a gentle 6 kHz roll-off: warmer and more open, still nothing screechy on top.
  * the saxes breathe: every note has an expression (CC11) shape - long notes swell in and relax, short pickups are lighter,
    a soft amplitude vibrato rides with the pitch vibrato; legato phrases overlap instead of re-tonguing every note.
  * pitch: delayed, natural vibrato (4.8-5.6 Hz, depth and rate vary per note, slight speed-up), soft scoops into accented
    notes (60-110 ms, never the fast trumpet-style rip), an occasional fall-off at a phrase end.
  * keyboard leads (Rhodes, vibes) no longer get pitch bends (a bent vibraphone sounds synthetic); organ gets a volume-pedal
    swell and a rotary chorus; guitars keep their bends with less drive and a speaker-cabinet curve instead of fizz.
  * levels: every new stem is matched to the loudness of the v7 file it replaces (leads 1 dB under), so zone levels stay put.
No GM program 56-63 (trumpet .. brass section) anywhere.

Usage: python3 score_v8.py stems    (writes the changed .ogg/.m4a into assets/audio/studio/v6/; env S3_REPO_OUT overrides)
Requires score_v7.py / score_v5.py next to this file, the v5 files (assets/audio/studio/v5/), GeneralUser GS (env S3_SF2)."""
import os, sys, subprocess
import numpy as np
import soundfile as sf
import pedalboard as pb

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.environ.setdefault('S3_OUT', '/dev/shm/s3studio/v8')
import score_v7 as v7                                    # noqa: E402
v5 = v7.v5
import tinysoundfont as tsf                              # noqa: E402

SR, BEAT, BAR, bt, chord = v5.SR, v5.BEAT, v5.BAR, v5.bt, v5.chord
WORK = os.environ['S3_OUT']
REPO_OUT = os.environ.get('S3_REPO_OUT', os.path.join(HERE, '..', 'studio', 'v6'))
OLD_DIR = os.environ.get('S3_OLD', REPO_OUT)               # the v7 files the new stems are level-matched to
PAD = 0.5
NB = v7.NB
PRODUCTS = v5.PRODUCTS
LEADS = ['horns', 'shout', 'bhorn', 'bgtr'] + ['mel-' + v for v in ['theme'] + PRODUCTS]
TRIM = {'horns': -0.5, 'shout': 0.0, 'bhorn': -1.0, 'bgtr': -0.5}     # dB vs the v7 file; every mel-* is -1.0
FAM = {'tenor': 'sax', 'alto': 'sax', 'bari': 'sax', 'wahgtr': 'gtr', 'blues': 'gtr', 'organ': 'organ', 'rhodes': 'keys', 'vibes': 'keys'}

# ------------------------------------------------------------------ rendering with controller (CC) events


class Part(v5.Part):
    def cc(self, t, ch, num, val): self.ev.append((max(0.0, t), 3, ch, int(num), int(np.clip(round(val), 0, 127))))


ORDER = {0: 0, 1: 1, 3: 2, 2: 3}       # at one sample: note-off, bend, controller, note-on


def render(part, cycles=3):
    s = tsf.Synth(samplerate=SR, gain=-3); sfid = s.sfload(v5.SF)
    for ch, (bank, preset, drums) in part.progs.items():
        s.program_select(ch, sfid, bank, preset, is_drums=False); s.pitchbend_range(ch, 2.0); s.control_change(ch, 11, 127)
    ev = []
    for c in range(cycles):
        for (t, kind, ch, k, v) in part.ev: ev.append((int((c * v5.L + (t % v5.L)) * SR), kind, ch, k, v))
    ev.sort(key=lambda e: (e[0], ORDER[e[1]]))
    total = int(round(cycles * v5.L * SR)); out = np.zeros((total, 2), np.float32); pos = 0
    for (smp, kind, ch, k, v) in ev:
        smp = min(smp, total)
        if smp > pos: out[pos:smp] = np.frombuffer(s.generate(smp - pos), dtype=np.float32).reshape(-1, 2); pos = smp
        if kind == 2: s.noteon(ch, k, v)
        elif kind == 1: s.pitchbend(ch, k)
        elif kind == 3: s.control_change(ch, k, v)
        else: s.noteoff(ch, k)
    if pos < total: out[pos:] = np.frombuffer(s.generate(total - pos), dtype=np.float32).reshape(-1, 2)
    return out.T.copy()


def db2cc(db): return 127.0 * 10 ** (db / 60.0)          # TinySoundFont: CC11 gain = 60*log10(cc/127) dB (measured)

# ------------------------------------------------------------------ the expressive player


def express(p, chans, notes, fam, R):
    """notes: dicts t (s), d (s), k, v, bf (scoop/bend from, semitones), vib; chans: [(ch, key offset, vel offset)].
    Plays a monophonic line with phrasing: legato, expression swells, scoops, vibrato, fall-offs (by instrument family)."""
    notes = sorted(notes, key=lambda n: n['t'])
    for n in notes:
        n['t'] = max(0.0, n['t'] + R.uniform(-0.006, 0.006)); n['v'] = int(np.clip(n['v'] + R.integers(-4, 5), 30, 104 if fam == 'sax' else 118))
    N = len(notes)
    for i, n in enumerate(notes):
        prev_end = notes[i - 1]['t'] + notes[i - 1]['d'] if i else -9.0
        nxt = notes[i + 1]['t'] if i + 1 < N else 9e9
        n['start'] = n['t'] - prev_end > 0.35                     # phrase start
        n['end'] = nxt - (n['t'] + n['d']) > 0.55                 # phrase end
        if n['start'] and n['d'] < 0.3 and not n['end']: n['v'] -= 6       # pickups are lighter
        n['off'] = n['t'] + n['d']
        if fam in ('sax', 'organ') and 0 < nxt - n['off'] < 0.09: n['off'] = nxt + 0.014     # slur into the next note
    for n in notes:
        for ch, ko, vo in chans: p.ev.append((n['t'], 2, ch, n['k'] + ko, int(np.clip(n['v'] + vo, 1, 127)))); p.ev.append((n['off'], 0, ch, n['k'] + ko, 0))
    for n in notes:
        t0, d = n['t'], n['d']; ts = np.arange(t0, t0 + d, 0.015); bend = np.zeros(len(ts)); gdb = np.zeros(len(ts)); r = ts - t0
        fall = False
        if fam == 'sax':
            if n['bf'] or (n['start'] and d > 0.4):           # a soft scoop, never a rip
                depth = max(-1.1, (n['bf'] or -0.5) * 0.55); span = R.uniform(0.06, 0.11)
                bend += np.where(r < span, depth * (1 - r / span) ** 2, 0.0)
            fall = n['end'] and d >= 0.55 and R.random() < 0.3
        elif fam == 'gtr' and n['bf']:                         # guitar bend up to the note
            span = 0.17 if n['bf'] <= -2 else 0.07
            bend += np.where(r < span, n['bf'] * (1 - np.clip(r / span, 0, 1)) ** 1.3, 0.0)
        if fam in ('sax', 'gtr', 'organ') and d > 0.45 and (n['vib'] or d > 0.7):
            on = min(0.28, 0.35 * d) if fam != 'gtr' else 0.12; ramp = 0.3
            depth = {'sax': R.uniform(0.13, 0.2), 'gtr': 0.26, 'organ': 0.07}[fam]
            rate = R.uniform(4.8, 5.4) if fam != 'gtr' else 5.5
            a = np.clip((r - on) / ramp, 0, 1)
            ph = 2 * np.pi * (rate * r + 0.4 * r * r / max(d, 0.5))          # the vibrato speeds up a little
            vib = a * depth * np.sin(ph)
            bend += vib - (a * depth * 0.25 if fam == 'sax' else 0)            # sax vibrato sits a hair under the pitch (lip)
            if fam in ('sax', 'organ'): gdb += a * 0.9 * np.sin(ph - 0.6)      # amplitude rides with it
        if fam in ('sax', 'organ'):
            lo = -4.5 if n['start'] else -2.5
            if d > 0.35:                                       # swell in, bloom, relax
                pk = 0.32 * d
                gdb += np.where(r < pk, lo * np.clip(1 - r / pk, 0, 1) ** 1.6, -2.2 * np.clip((r - pk) / max(d - pk, 1e-3), 0, 1) ** 1.5)
            else:
                gdb += 0.0 if n['v'] >= 92 else -1.5
        if fall:
            fl = min(0.2, 0.3 * d); x = np.clip((r - (d - fl)) / fl, 0, 1)
            bend += -1.8 * x ** 1.7; gdb += -9.0 * x ** 1.3
        for ch, ko, vo in chans:
            for tv, bv, gv in zip(ts, bend, gdb):
                if fam != 'keys': p.bend(tv, ch, float(np.clip(bv, -2, 2)))
                if fam in ('sax', 'organ'): p.cc(tv, ch, 11, db2cc(gv + (vo * 0.0)))
            if fam != 'keys': p.bend(t0 + d + 0.004, ch, 0.0)
    return notes

# ------------------------------------------------------------------ tone (no drive on saxes / keys, no brick walls)


def fxc(x, chain): return v5.fx(np.atleast_2d(x), chain)


def sax_lead(m, voice):
    bari = voice == 'bari'
    ch = [pb.HighpassFilter(70 if bari else 100), pb.Compressor(-24, 2.5, 12, 180),
          pb.PeakFilter(180 if bari else 230, -1.0, 0.8), pb.LowShelfFilter(320 if bari else 420, 2.5, 0.7),   # body
          pb.PeakFilter(1150, -3.0, 1.1),                      # nasal
          pb.PeakFilter(2900, -6.0, 0.9), pb.PeakFilter(4300, -5.0, 1.1),     # harsh / reed fizz
          pb.HighShelfFilter(3500, -4.0, 0.7), pb.LadderFilter(pb.LadderFilter.Mode.LPF12, 5500, 0.0, 1.0)]
    if voice == 'alto': ch += [pb.HighShelfFilter(2600, -2.5, 0.7)]
    return fxc(m, ch)


def sax_section(x):
    return fxc(x, [pb.HighpassFilter(90), pb.PeakFilter(350, 1.2, 0.8), pb.PeakFilter(1100, -2.0, 1.0), pb.PeakFilter(2800, -5.0, 1.0),
                   pb.HighShelfFilter(3500, -4.0, 0.7), pb.LadderFilter(pb.LadderFilter.Mode.LPF24, 5000, 0.0, 1.0)])


def gtr_tone(m, neck=False):
    """amp + cabinet: light drive, speaker curve (bump 120 Hz, dip 2.8 kHz, roll-off above 5 kHz), no fizz"""
    drive = 2.5 if neck else 4.5
    shelf = (500, -8.0) if neck else (2600, -2.0)
    return fxc(m, [pb.HighpassFilter(90), pb.Compressor(-24, 3.0, 6, 150), pb.Gain(2.0), pb.Distortion(drive),
                   pb.PeakFilter(120, 1.0, 0.8), pb.PeakFilter(700, 1.5, 0.8), pb.PeakFilter(2800, -4.5, 1.0),
                   pb.HighShelfFilter(shelf[0], shelf[1], 0.7), pb.LadderFilter(pb.LadderFilter.Mode.LPF24, 4800, 0.0, 1.0)])


def clean_gtr(m):   # muted jazz-guitar answers: clean, round
    return fxc(m, [pb.HighpassFilter(110), pb.Compressor(-24, 3.0, 4, 120), pb.PeakFilter(250, -1.0, 0.8), pb.PeakFilter(2800, -3.0, 1.0),
                   pb.HighShelfFilter(3500, -3.0, 0.7), pb.LadderFilter(pb.LadderFilter.Mode.LPF12, 5500, 0.0, 1.0)])


def keys_lead(m, voice):
    if voice == 'organ':
        m = fxc(m, [pb.HighpassFilter(120), pb.Distortion(1.5), pb.PeakFilter(2500, -3.0, 1.0), pb.LadderFilter(pb.LadderFilter.Mode.LPF12, 4500, 0.0, 1.0)])
        return v5.chorus(m, 5.8, 1.6, 4.0, 0.45).mean(axis=0, keepdims=True)
    return fxc(m, [pb.HighpassFilter(120), pb.Compressor(-22, 2.0, 10, 200), pb.PeakFilter(300, -1.0, 0.8), pb.PeakFilter(3000, -2.5, 1.0),
                   pb.HighShelfFilter(5000, -3.0, 0.7), pb.LadderFilter(pb.LadderFilter.Mode.LPF12, 6500, 0.0, 1.0)])


def lead_tone(m, voice):
    f = FAM[voice]
    if f == 'sax': return sax_lead(m, voice)
    if f == 'gtr':
        if voice == 'wahgtr': m = v5.autowah(m, lo=380, hi=1500, per_beat=1, dry=0.35)
        return gtr_tone(m, neck=voice == 'blues')
    return keys_lead(m, voice)


def norm(x): return x / (np.abs(x).max() + 1e-9)

# ------------------------------------------------------------------ the product / theme lead (mel-*)


def p_lead(vname):
    v7.setlen(NB['mel'])
    var = v7.VARIANTS6[vname]; voice = var['t']; t = v7.LEADS6[voice]; f = FAM[voice]
    ends = dict(v7.ENDS); ends.update(var.get('ends', {}))
    p = Part(); p.prog(0, t[1], bank=t[0]); octv = t[2]
    vadj = {'alto': -8, 'tenor': -4, 'bari': -2}.get(voice, 0)
    notes = []
    for b in range(NB['mel']):
        for beat, d, k, v, bf, vib in v7.lead_bar(b):
            if k == 'END': k = ends[b]
            notes.append(dict(t=bt(b, beat) + 0.022, d=d * BEAT, k=k + octv, v=v + vadj, bf=bf, vib=vib))     # laid back
    express(p, [(0, 0, 0)], notes, f, v5.R)
    c = render(p).mean(axis=0, keepdims=True); c = lead_tone(norm(c), voice)
    q = Part(); q.prog(0, t[3]); rsh = t[4] if len(t) > 4 else (-12 if t[3] == 26 else 0)
    for b in range(NB['mel']):
        for beat, d, k, v in v7.resp_bar(b): q.n(bt(b, beat), d * BEAT, 0, k + rsh, v - 4, jit=0.005, vj=6, late=0.016)
    r = render(q).mean(axis=0, keepdims=True); r = clean_gtr(norm(r))
    return c + 0.5 * r * np.abs(c).max() / (np.abs(r).max() + 1e-9)

# ------------------------------------------------------------------ bridge sax melody (bhorn) and blues guitar (bgtr)


def p_bhorn():
    v7.setlen(NB['bhorn'])
    p = Part(); p.prog(0, 66); p.prog(1, 67)            # tenor melody, baritone an octave down, breathing together
    notes = []
    for pas in range(NB['bhorn'] // 8):
        for bb, beat, d, k, v in v7.BH[pas]:
            notes.append(dict(t=bt(pas * 8 + bb, beat) + 0.02, d=d * BEAT, k=k, v=v - 10, bf=-1.0 if d >= 1.0 else 0, vib=d >= 1.0))
    express(p, [(0, 0, 0), (1, -12, -12)], notes, 'sax', v5.R)
    m = render(p).mean(axis=0, keepdims=True)
    return sax_lead(norm(m), 'tenor')


def p_bgtr():
    """v7's blues guitar answers (same licks, same places) through the new amp/cabinet"""
    v7.setlen(NB['bgtr'])
    p = v5.Part(); p.prog(0, v7.BLUES_PROG)
    busy = v7.bh_notes(); prev = None
    for b in range(NB['bgtr']):
        pas, k = b // 8, b % 8
        if k % 2 == 0 and k != 6: continue
        if pas == 1 and k in (1, 5): continue
        wins = [w for w in v7.free_windows(busy, b) if w[1] >= 1.0]
        if not wins: continue
        st, ln = wins[-1]
        pool = [i for i, l in enumerate(v7.LICKS) if v7.lick_len(l) <= ln + 0.25]
        if not pool: continue
        i = v7.pick(pool, prev); prev = i
        lk = v7.LICKS[i]; off = max(st, min(st + 0.25, 4.0 - v7.lick_len(lk)))
        sh = -12 if (pas == 1 and min(x[2] for x in lk) >= 64) else 0
        v7.blues_notes(p, 0, bt(b, off), lk, 88 if k == 7 else 82, v7.bch(b), shift=sh)
    m = v5.render(p).mean(axis=0, keepdims=True)
    return gtr_tone(norm(m))

# ------------------------------------------------------------------ sax section: stabs (horns) and shout


def p_horns():
    """v7's horn part note for note (bars 1-16 = the v5 stabs), the swells on their own channels with a breath swell"""
    cap, _ = v7.CAP['horns']
    v7.setlen(NB['horns'])
    p = Part(); p.ev = list(cap.ev)
    def stab(t, d, c, vel):
        vv = v5.HRN[c]
        for j, k in enumerate(vv): p.n(t, d, 0, k, vel - 4 * j, jit=0.004, vj=4)
        p.n(t + 0.004, d, 1, vv[1], vel - 6, jit=0.003); p.n(t + 0.002, d, 2, vv[0] - 12, vel - 8, jit=0.003)
    SOLI = [(0.5, .2, 64), (0.75, .2, 66), (1.0, .45, 67), (1.5, .2, 69), (1.75, .2, 71), (2.0, .5, 74), (2.75, .25, 71), (3.0, .9, 69)]
    swells, soli = [], []
    for b in range(16, NB['horns']):
        c = chord(b); blk = b // 8
        if blk == 2:
            if b % 4 == 1: stab(bt(b, 1.5), 0.12, c, 100); stab(bt(b, 1.75), 0.4, c, 108)
            if b % 4 == 3 and b % 8 != 7: stab(bt(b, 2.5), 0.12, c, 98); stab(bt(b, 3.0), 0.14, c, 96); stab(bt(b, 3.5), 0.5, c, 106)
            if b % 8 == 7: stab(bt(b, 0.0), 0.7, c, 112); stab(bt(b, 2.5), 0.14, c, 98); stab(bt(b, 2.75), 0.5, c, 108)
        elif blk == 3:
            if b in (25, 29):
                for beat, d, k in SOLI:
                    soli.append(dict(t=bt(b, beat) + 0.01, d=d * BEAT, k=k - (2 if b == 29 and k == 66 else 0), v=96, bf=-1.0 if d >= 0.45 else 0, vib=d >= 0.9))
            if b in (27, 31): stab(bt(b, 0.75), 0.14, c, 100); stab(bt(b, 1.5), 0.5, c, 106)
            if b == 30:
                for beat, vel in ((3.0, 92), (3.25, 98), (3.5, 108)): stab(bt(b, beat), 0.16 if beat < 3.5 else 0.5, c, vel)
        else:
            if b % 8 == 0: swells.append((bt(b, 0.5), c))
            if b % 8 == 3: stab(bt(b, 2.75), 0.6, c, 106)
            if b % 8 == 5: stab(bt(b, 0.75), 0.14, c, 98); stab(bt(b, 1.0), 0.14, c, 92)
            if b % 8 == 6:
                for beat, vel in ((3.0, 92), (3.25, 98), (3.5, 108)): stab(bt(b, beat), 0.16 if beat < 3.5 else 0.5, c, vel)
            if b % 8 == 7: stab(bt(b, 0.0), 0.32, c, 114); stab(bt(b, 1.75), 0.12, c, 100); stab(bt(b, 2.0), 0.6, c, 110)
    v7.saxify(p)                                         # ch0 tenor, ch1 tenor, ch2 baritone, ch3 alto (top voice)
    p.prog(4, 66); p.prog(5, 67); p.prog(6, 66)          # swell voices + the soli line on their own channels
    for t0, c in swells:
        d = 1.6 * BAR
        for j, k in enumerate(v5.HRN[c]):
            ch = 5 if j == 0 else 4
            p.n(t0, d, ch, k - (12 if j == 0 else 0), 74, jit=0.004, vj=4)
        ts = np.arange(t0, t0 + d, 0.03); r = (ts - t0) / d
        for tv, x in zip(ts, r):                         # breathe in, bloom at 40 %, ease off
            g = -9.0 * (1 - x / 0.4) ** 1.5 if x < 0.4 else -3.5 * ((x - 0.4) / 0.6) ** 1.4
            for ch in (4, 5): p.cc(tv, ch, 11, db2cc(g))
    express(p, [(6, 0, 0)], soli, 'sax', v5.R)
    p.prog(7, 67)
    for n in soli: p.n(n['t'] + 0.003, n['d'], 7, n['k'] - 12, n['v'] - 8, jit=0.002, vj=3)
    return sax_section(render(p))


SHOUT_FILLS = v7.SHOUT_FILLS


def p_shout():
    v7.setlen(NB['shout'])
    p = Part(); p.prog(0, 66); p.prog(1, 65); p.prog(2, 67); p.prog(3, 67)
    def hit(b, beat, d, vel, fall=False):
        c = chord(b); v = v7.SH[c][:4]; t = bt(b, beat); vel -= v7.SAX_SOFT
        for j, k in enumerate(v[1:3]): p.n(t, d, 0, k, vel - 3 * j, jit=0.003, vj=3)
        p.n(t + 0.003, d, 1, v[3], vel - 6, jit=0.003); p.n(t + 0.002, d, 2, v[0], vel - 4, jit=0.003); p.n(t, d, 3, v7.SHB[c], vel - 2, jit=0.003)
        if d >= 0.6:                                   # long hits swell a touch, then the fall (slower, softer than v7)
            ts = np.arange(t, t + d, 0.02)
            for tv in ts:
                x = (tv - t) / d
                g = -3.0 * (1 - x / 0.3) if x < 0.3 else (-7.0 * ((x - 0.6) / 0.4) ** 1.3 if fall and x > 0.6 else 0.0)
                for ch in (0, 1, 2, 3): p.cc(tv, ch, 11, db2cc(g))
            for ch in (0, 1, 2, 3): p.cc(t + d + 0.01, ch, 11, 127)
        if fall:
            for ch in (0, 1, 2):
                for i in range(16): p.bend(t + d * 0.6 + i * 0.022, ch, -1.6 * (i / 15) ** 1.8)
                p.bend(t + d + 0.05, ch, 0.0)
    for b in range(NB['shout']):
        k = b % 8
        if k in (1, 5): hit(b, 2.5, 0.14, 102); hit(b, 2.75, 0.5, 108)
        if k == 3:
            for beat in (2.0, 2.25, 2.5): hit(b, beat, 0.12, 96 + int(beat * 4))
            hit(b, 2.75, 0.7, 110)
        if k == 6:
            for beat, vel in ((3.0, 94), (3.25, 100), (3.5, 108)): hit(b, beat, 0.16 if beat < 3.5 else 0.5, vel)
        if k == 7:
            if b < 8: hit(b, 0.0, 0.3, 112); hit(b, 1.75, 0.12, 98); hit(b, 2.0, 0.9, 110, fall=True)
            else:
                for beat in (0.0, 0.75, 1.5): hit(b, beat, 0.22, 112)
                hit(b, 2.0, 1.4, 114, fall=True)
    sax = sax_section(render(p))
    g = v5.Part(); g.prog(0, v7.BLUES_PROG)
    for b, (beat, i) in SHOUT_FILLS.items(): v7.blues_notes(g, 0, bt(b, beat), v7.LICKS[i], 86, chord(b))
    gm = gtr_tone(v5.render(g).mean(axis=0, keepdims=True))
    gm = np.vstack([0.8 * gm[0], 1.0 * gm[0]])
    return norm(sax) + 0.5 * norm(gm)

# ------------------------------------------------------------------ processing, level match, encode


class _NoDrive:   # the v5 'horns' bed chain without its drive stage (everything else in it unchanged)
    def __getattr__(self, a): return getattr(pb, a)
    @staticmethod
    def Distortion(db=0.0): return pb.Gain(0.0)


def proc(name, x, nbars):
    v7.setlen(nbars)
    v5.KICKS = v7.kick_list(nbars)
    if name in ('horns', 'shout'):
        real = v5.pb; v5.pb = _NoDrive()
        try: y, _ = v5.process('horns', x)
        finally: v5.pb = real
    else:
        y, _ = v5.process('mel-x', x)
    y = v5.fx(y, [pb.LadderFilter(pb.LadderFilter.Mode.LPF24, 5500, 0.0, 1.0)])     # reverb tails: soft top, no fizz
    return y[:, v5.LN:2 * v5.LN].astype(np.float32)


def old_loop(name):
    y = v7.dec(os.path.join(OLD_DIR, name + '.ogg')); p = int(PAD * SR)
    return y[:, p:y.shape[1] - p]


def make(name):
    v7.seed(name)
    if name.startswith('mel-'): return proc(name, p_lead(name[4:]), NB['mel'])[:1]
    fn = dict(horns=p_horns, shout=p_shout, bhorn=p_bhorn, bgtr=p_bgtr)[name]
    return proc(name, np.atleast_2d(fn()), NB[name])


def stems(only=None):
    os.makedirs(WORK, exist_ok=True); v5.irs()
    v7.CAP = v7.capture_v5()
    p = int(PAD * SR); rep = []
    for name in (only or LEADS):
        old = old_loop(name)
        y = make(name).astype(np.float64)
        n_old = old.shape[1]
        assert abs(y.shape[1] - n_old) <= 2, (name, y.shape, old.shape)
        if y.shape[1] != n_old: y = y[:, :n_old] if y.shape[1] > n_old else np.pad(y, ((0, 0), (0, n_old - y.shape[1])), mode='wrap')
        if y.shape[0] != old.shape[0]: y = y[:1] if old.shape[0] == 1 else np.vstack([y[0], y[0]])
        trim = TRIM.get(name, -1.0)
        k = 10 ** ((v5.loud(v5.stereo(old)) - v5.loud(v5.stereo(y)) + trim) / 20); y = y * k
        tp = v5.tp_db(y)
        if tp > -1.5: y = y * 10 ** ((-1.5 - tp) / 20)
        rep.append((name, v5.loud(v5.stereo(old)), v5.loud(v5.stereo(y)), v5.tp_db(old), v5.tp_db(y), y.shape[1] / SR))
        print('  %-22s old %6.2f LUFS  new %6.2f LUFS  TP old %5.1f new %5.1f  loop %.4f s' % (name, *rep[-1][1:]), flush=True)
        f = np.concatenate([y[:, -p:], y, y[:, :p]], axis=1)
        w = os.path.join(WORK, name + '.wav'); sf.write(w, f.T, SR, subtype='FLOAT')
        mono = f.shape[0] == 1
        ob, ab = ('40k', '56k') if mono else ('48k', '80k')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'libopus', '-b:a', ob, '-vbr', 'constrained', '-application', 'audio',
                        os.path.join(REPO_OUT, name + '.ogg')], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'aac', '-b:a', ab, '-aac_pns', '0', '-movflags', '+faststart',
                        os.path.join(REPO_OUT, name + '.m4a')], check=True)
    return rep


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'stems'
    if cmd == 'stems': stems(sys.argv[2].split(',') if len(sys.argv) > 2 else None)
