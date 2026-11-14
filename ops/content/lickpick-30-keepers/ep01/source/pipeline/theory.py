"""30 Keepers - single source of truth for every note on screen and in the audio.
Maps (string, fret) -> note in standard tuning EADGBE, asserts every diagram, and writes
epNN/data.js (for the HTML) + epNN/data.json (for the audio mix).
Strings are numbered like guitarists do: 1 = high e (top line on screen), 6 = low E.
Run: python3 theory.py <outdir>   -> prints a verification log; any wrong note aborts.
"""
import json, os, sys

OPEN = {6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64}          # MIDI: E2 A2 D3 G3 B3 E4
PC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
NAME2PC = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6,
           'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
LOG = []

def midi(s, f):
    assert s in OPEN and 0 <= f <= 22, (s, f)
    return OPEN[s] + f

def pc(s, f):
    return midi(s, f) % 12

def octave_name(m, spell):
    return spell[m % 12] + str(m // 12 - 1)

def check(cond, msg):
    LOG.append(('PASS ' if cond else 'FAIL ') + msg)
    if not cond:
        print('\n'.join(LOG)); raise SystemExit('THEORY CHECK FAILED: ' + msg)

# independent self-test of the fret map against known landmarks (from any fret chart)
for s, f, want in [(6, 0, 'E2'), (6, 5, 'A2'), (5, 0, 'A2'), (4, 7, 'A3'), (3, 2, 'A3'), (1, 5, 'A4'),
                   (2, 1, 'C4'), (3, 5, 'C4'), (6, 12, 'E3'), (5, 7, 'E3'), (2, 10, 'A4'), (4, 0, 'D3'),
                   (3, 0, 'G3'), (2, 0, 'B3'), (1, 0, 'E4'), (6, 8, 'C3'), (1, 8, 'C5')]:
    got = octave_name(midi(s, f), PC_SHARP)
    check(got == want, f'fret map landmark string {s} fret {f} = {got} (chart says {want})')

def scale_pcs(root, intervals):
    r = NAME2PC[root]; return {(r + i) % 12 for i in intervals}

MINOR_PENT = [0, 3, 5, 7, 10]
BLUES = [0, 3, 5, 6, 7, 10]
MAJOR_PENT = [0, 2, 4, 7, 9]

def box(lo_shape):
    """the classic minor-pentatonic box shape, as (string, fret) offsets from its lowest fret"""
    shape = {6: (0, 3), 5: (0, 2), 4: (0, 2), 3: (0, 2), 2: (0, 3), 1: (0, 3)}
    out = []
    for s in (6, 5, 4, 3, 2, 1):
        for d in shape[s]:
            out.append((s, lo_shape + d))
    return out  # ascending pitch order

def timeline(beats, bpm, swing=False):
    bt = 60.0 / bpm
    out = []
    for b in beats:
        whole = int(b); frac = b - whole
        if swing and abs(frac - 0.5) < 1e-6: frac = 2 / 3      # shuffle: offbeat 8th lands on the 3rd triplet
        out.append(round((whole + frac) * bt, 4))
    return out

def build(ep):
    spell = ep['spell']                      # pc -> name used on screen
    pcs = scale_pcs(ep['root'], ep['intervals'])
    check(set(spell) == pcs, f"{ep['id']}: spelling table covers exactly the scale {sorted(spell.values())}")
    for k, v in spell.items():
        check(NAME2PC[v] == k, f"{ep['id']}: name {v} is pitch class {k}")
    dots = []
    for (s, f) in ep['dots']:
        p = pc(s, f)
        check(p in pcs, f"{ep['id']}: dot string {s} fret {f} = {octave_name(midi(s, f), PC_SHARP)} is in {ep['root']} {ep['scale_name']}")
        dots.append({'s': s, 'f': f, 'm': midi(s, f), 'n': spell[p], 'root': p == NAME2PC[ep['root']],
                     'extra': (s, f) in ep.get('extra', [])})
    # the diagram shows every scale tone inside the box window, no gaps, no strays
    lo, hi = ep['box']
    for s in range(1, 7):
        for f in range(lo, hi + 1):
            inside = pc(s, f) in pcs
            shown = (s, f) in ep['dots']
            check(inside == shown, f"{ep['id']}: string {s} fret {f} {'is' if inside else 'is not'} a scale tone and is {'shown' if shown else 'not shown'}")
    # chips = the scale, spelled the same, root first
    chips = [c['n'] for c in ep['chips']]
    check({NAME2PC[c] for c in chips} == pcs and len(chips) == len(pcs), f"{ep['id']}: note chips {chips} = the scale")
    check(chips[0] == ep['root'] and ep['chips'][0]['role'] == 'ROOT', f"{ep['id']}: first chip is the root {ep['root']}")
    # roots claim in the caption
    roots = sorted({d['s'] for d in dots if d['root']}, reverse=True)
    check(roots == ep['root_strings'], f"{ep['id']}: roots ({ep['root']}) sit on strings {roots}, caption says {ep['root_strings']}")
    frets = [d['f'] for d in dots]
    check((min(frets), max(frets)) == (lo, hi), f"{ep['id']}: diagram spans frets {min(frets)}-{max(frets)}, caption says {lo}-{hi}")
    # scale run (audio + pop-in) must ascend in pitch
    run = [d for d in dots if not d['extra']] if ep.get('run_without_extra') else dots
    ms = [d['m'] for d in run]
    check(ms == sorted(ms) and len(set(ms)) == len(ms), f"{ep['id']}: scale run ascends strictly ({' '.join(octave_name(m, PC_SHARP) for m in ms)})")
    t_run = timeline([ep['run_start'] + i * ep['run_step'] for i in range(len(run))], ep['bpm'])
    run_ev = [dict(d, t=t) for d, t in zip(run, t_run)]
    # extra notes (blue notes) drop in on their own beats
    extra_ev = []
    for (s, f), b in zip(ep.get('extra', []), ep.get('extra_beats', [])):
        d = next(x for x in dots if (x['s'], x['f']) == (s, f))
        extra_ev.append(dict(d, t=timeline([b], ep['bpm'])[0]))
    # the lick: every note must be a dot on the diagram, and it must end on the root
    lick = []
    lt = timeline([n[2] for n in ep['lick']], ep['bpm'], ep.get('swing', False))
    for i, ((s, f, b, dur), t) in enumerate(zip(ep['lick'], lt)):
        check((s, f) in ep['dots'], f"{ep['id']}: lick note {i + 1} string {s} fret {f} = {octave_name(midi(s, f), PC_SHARP)} is on the diagram")
        lick.append({'i': i + 1, 's': s, 'f': f, 'm': midi(s, f), 'n': spell[pc(s, f)], 't': t,
                     'dur': round(dur * 60 / ep['bpm'], 4), 'root': pc(s, f) == NAME2PC[ep['root']]})
    check(lick[-1]['root'], f"{ep['id']}: lick ends on the root {ep['root']} (string {lick[-1]['s']} fret {lick[-1]['f']})")
    LOG.append(f"INFO {ep['id']}: lick = " + ' '.join(f"{l['n']}(s{l['s']}f{l['f']})" for l in lick))
    for k, v in ep.get('claims', {}).items():
        check(v(dots, lick), f"{ep['id']}: {k}")
    pre_run = []
    if ep.get('slide'):   # before the slide the same shape sits 3 frets higher and spells A minor pentatonic
        sl = ep['slide']; shift = sl['from_lo'] - sl['to_lo']
        mpcs = scale_pcs('A', MINOR_PENT); mspell = {9: 'A', 0: 'C', 2: 'D', 4: 'E', 7: 'G'}
        for d in dots:
            p = pc(d['s'], d['f'] + shift)
            check(p in mpcs, f"{ep['id']}: before the slide, string {d['s']} fret {d['f'] + shift} = {octave_name(midi(d['s'], d['f'] + shift), PC_SHARP)} is in A minor pentatonic")
            d['pre_n'] = mspell[p]; d['pre_root'] = p == 9
        check(sorted({d['s'] for d in dots if d['pre_root']}, reverse=True) == [6, 4, 1], f"{ep['id']}: before the slide, A sits on strings 6, 4, 1")
        pm = [midi(d['s'], d['f'] + shift) for d in dots]
        check(pm == sorted(pm), f"{ep['id']}: the A minor intro run ascends ({' '.join(octave_name(m, PC_SHARP) for m in pm)})")
        pt = timeline([ep['phases']['box'] + 0.5 + i * 0.25 for i in range(len(dots))], ep['bpm'])
        pre_run = [{'s': d['s'], 'f': d['f'] + shift, 'm': m, 'n': d['pre_n'], 't': t} for d, m, t in zip(dots, pm, pt)]
        check(pre_run[-1]['t'] < ep['phases']['slide'] * 60 / ep['bpm'], f"{ep['id']}: the whole minor box is shown and heard before the slide starts")
    bt = 60 / ep['bpm']
    # ---- harmony under the lesson: one timeline the audio plays from ----
    g = dict(ep['groove'])
    if 'timeline' not in g:
        g['timeline'] = [(bar * 4,) + tuple(g['chords'][bar % len(g['chords'])]) for bar in range(int(ep['dur'] / bt / 4) + 2)]
    tl = g['timeline']
    def chord_at(beat):
        c = tl[0]
        for x in tl:
            if x[0] <= beat + 1e-9: c = x
        return c
    for lab, b in (('lick', ep['lick'][-1][2]), ('end-card replay', ep['phases']['replay'] + ep['lick'][-1][2] - ep['lick'][0][2])):
        c = chord_at(b)
        check(c[3] % 12 == 9 and any(k % 12 == 9 for k in c[2]), f"{ep['id']}: the {lab}'s final A lands over an A chord ({c[1]} at beat {b})")
    if ep.get('slide'):
        minor_ok = all(0 in {k % 12 for k in chord_at(b)[2]} and 1 not in {k % 12 for k in chord_at(b)[2]}
                       for b in [ep['phases']['box'] + 0.5 + i * 0.25 for i in range(len(dots))] + [0])
        check(minor_ok, f"{ep['id']}: the backing is A minor (C, no C#) under the whole minor intro")
        check(chord_at(ep['phases']['slide'])[1] == 'A' and chord_at(ep['phases']['slide'] - 0.01)[1] == 'Am',
              f"{ep['id']}: the backing switches Am -> A exactly at the slide (beat {ep['phases']['slide']})")
        maj_ok = all(1 in {k % 12 for k in chord_at(r['t'] / bt)[2]} or chord_at(r['t'] / bt)[1] != 'Am' for r in run_ev)
        check(maj_ok, f"{ep['id']}: no A minor chord under the A major run")
    rep_end = ep['phases']['replay'] * bt + (lick[-1]['t'] - lick[0]['t']) + lick[-1]['dur']
    check(rep_end <= ep['dur'] - 0.7, f"{ep['id']}: the end-card replay finishes at {rep_end:.2f} s, before the {ep['dur']} s file fades out")
    ep['groove'] = g
    phases = {k: round(v * bt, 4) for k, v in ep['phases'].items()}
    data = {k: ep[k] for k in ('id', 'num', 'word', 'hook', 'window', 'box', 'caption', 'payoff', 'next', 'bpm', 'root',
                               'scale_name', 'chips', 'kicker', 'swing') if k in ep}
    data.update(pre_run=pre_run if ep.get('slide') else [], dots=dots, run=run_ev, extra=extra_ev, lick=lick, phases=phases, beat=bt, dur=ep['dur'],
                slide=ep.get('slide'), groove=ep['groove'])
    return data

EPS = []
# ---------- KEEPER 01 · HOME ----------
EPS.append(dict(
    id='ep01', num='01', word='HOME', hook='Every lick you know\nstarts in this box.',
    root='A', intervals=MINOR_PENT, scale_name='minor pentatonic', spell={9: 'A', 0: 'C', 2: 'D', 4: 'E', 7: 'G'},
    dots=box(5), box=(5, 8), window=(3, 10), root_strings=[6, 4, 1],
    chips=[{'n': 'A', 'role': 'ROOT'}, {'n': 'C'}, {'n': 'D'}, {'n': 'E'}, {'n': 'G'}],
    caption='A minor pentatonic · frets 5 to 8 · A on strings 6, 4 and 1',
    kicker='Now play this', bpm=96,
    run_start=4, run_step=0.5,
    lick=[(1, 8, 15, .5), (1, 5, 15.5, .5), (2, 8, 16, .5), (2, 5, 16.5, .5), (3, 7, 17, .5), (3, 5, 17.5, .5), (4, 7, 18, 2.5)],
    payoff='Land on A.\nIt sounds finished.', next='Tomorrow · BLUE: one note that makes it the blues',
    phases=dict(board=1.5, box=3, chips=10, caption=12.2, kicker=13.4, stamp=19.2, payoff=19.6, wipe=23, end=24, replay=25),
    dur=21.0, groove=dict(style='straight', chords=[('Am7', [57, 60, 64, 67], 45), ('Am7', [57, 60, 64, 67], 45), ('Dm7', [57, 60, 62, 65], 50), ('Am7', [57, 60, 64, 67], 45)]),
    claims={'lick descends one string at a time, high e to D string': lambda d, l: [x['s'] for x in l] == [1, 1, 2, 2, 3, 3, 4]},
))
# ---------- KEEPER 02 · BLUE ----------
EPS.append(dict(
    id='ep02', num='02', word='BLUE', hook='Add one note.\nInstant blues.',
    root='A', intervals=BLUES, scale_name='blues scale', spell={9: 'A', 0: 'C', 2: 'D', 3: 'Eb', 4: 'E', 7: 'G'},
    dots=sorted(box(5) + [(5, 6), (3, 8)], key=lambda x: midi(*x)), extra=[(5, 6), (3, 8)], extra_beats=[7, 8.5],
    run_without_extra=True, box=(5, 8), window=(3, 10), root_strings=[6, 4, 1],
    chips=[{'n': 'A', 'role': 'ROOT'}, {'n': 'C'}, {'n': 'D'}, {'n': 'Eb', 'role': 'BLUE'}, {'n': 'E'}, {'n': 'G'}],
    caption='Eb sits between D and E · A string fret 6 · G string fret 8',
    kicker='Hear it bite', bpm=88, swing=True,
    run_start=3, run_step=0.25,
    lick=[(5, 5, 13, .5), (5, 6, 13.5, .5), (5, 7, 14, .5), (4, 5, 14.5, .5), (4, 7, 15, .5), (3, 5, 15.5, .5),
          (3, 7, 16, .5), (3, 8, 16.5, .5), (3, 7, 17, .5), (3, 5, 17.5, .5), (4, 7, 18, 2.5)],
    payoff='D, Eb, E.\nThat squeeze is the blues.', next='Tomorrow · FLIP: the same box, but happy',
    phases=dict(board=1.5, box=2.6, chips=10, caption=12, kicker=12.2, stamp=19.4, payoff=19.8, wipe=22.4, end=23.4, replay=24.5),
    dur=22.6, groove=dict(style='shuffle', chords=[('A7', [57, 61, 64, 67], 45), ('A7', [57, 61, 64, 67], 45), ('D7', [57, 60, 62, 66], 50), ('A7', [57, 61, 64, 67], 45)]),
    claims={'both blue notes are Eb (b5 of A)': lambda d, l: all(x['n'] == 'Eb' for x in d if x['extra']) and sum(x['extra'] for x in d) == 2,
            'lick plays D-Eb-E chromatic on the A string': lambda d, l: [x['n'] for x in l[:3]] == ['D', 'Eb', 'E'] and all(x['s'] == 5 for x in l[:3])},
))
# ---------- KEEPER 03 · FLIP ----------
EPS.append(dict(
    id='ep03', num='03', word='FLIP', hook='Same shape.\n3 frets down. Major.',
    root='A', intervals=MAJOR_PENT, scale_name='major pentatonic', spell={9: 'A', 11: 'B', 1: 'C#', 4: 'E', 6: 'F#'},
    dots=box(2), box=(2, 5), window=(1, 9), root_strings=[6, 3, 1],
    chips=[{'n': 'A', 'role': 'ROOT'}, {'n': 'B'}, {'n': 'C#'}, {'n': 'E'}, {'n': 'F#'}],
    caption='A major pentatonic · frets 2 to 5 · A on strings 6, 3 and 1',
    kicker='Land on A', bpm=100,
    run_start=8.5, run_step=0.5,
    lick=[(1, 5, 18, .5), (1, 2, 18.5, .5), (2, 5, 19, .5), (2, 2, 19.5, .5), (3, 4, 20, .5), (3, 2, 20.5, 2.5)],
    payoff='Same shape.\nNow it smiles.', next='Tomorrow · BEND: fix your flat bends',
    slide=dict(from_lo=5, to_lo=2),
    phases=dict(board=1.2, box=2, slide=6.25, slide_end=7.75, chips=14.5, caption=16.3, kicker=16.6, stamp=22.2, payoff=22.6, wipe=26, end=27, replay=28),
    dur=21.0, groove=dict(style='bright', timeline=[(0, 'Am', [57, 60, 64, 69], 45), (6.25, 'A', [57, 61, 64, 69], 45), (12, 'D/A', [57, 62, 66, 69], 45),
                                               (16, 'E', [56, 59, 64, 68], 40), (20, 'A', [57, 61, 64, 69], 45), (24, 'D/A', [57, 62, 66, 69], 45),
                                               (26, 'E', [56, 59, 64, 68], 40), (28, 'A', [57, 61, 64, 69], 45)]),
    claims={'the major box is the minor box shape moved exactly 3 frets down': lambda d, l: sorted((x['s'], x['f'] + 3) for x in d) == sorted(box(5)),
            'A major pentatonic shares its notes with F# minor pentatonic (relative minor)': lambda d, l: {x['n'] for x in d} == {'A', 'B', 'C#', 'E', 'F#'} and scale_pcs('F#', MINOR_PENT) == scale_pcs('A', MAJOR_PENT)},
))

if __name__ == '__main__':
    outdir = sys.argv[1]
    for ep in EPS:
        data = build(ep)
        d = os.path.join(outdir, ep['id']); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'data.js'), 'w').write('window.EP=' + json.dumps(data) + ';\n')
        json.dump(data, open(os.path.join(d, 'data.json'), 'w'), indent=1)
    print('\n'.join(LOG))
    print(f"\nALL {sum(l.startswith('PASS') for l in LOG)} CHECKS PASSED, 0 FAILED")
