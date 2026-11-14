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
    for s in (range(1, 7) if ep.get('full_box', True) else ()):
        for f in range(lo, hi + 1):
            inside = pc(s, f) in pcs
            shown = (s, f) in ep['dots']
            check(inside == shown, f"{ep['id']}: string {s} fret {f} {'is' if inside else 'is not'} a scale tone and is {'shown' if shown else 'not shown'}")
    # chips = the scale, spelled the same, root first
    chips = [c['n'] for c in ep['chips']]
    check({NAME2PC[c] for c in chips} == pcs and (len(chips) == len(pcs) or ep.get('chips_any')), f"{ep['id']}: note chips {chips} = the scale")
    check(chips[0] == ep['root'] and ep['chips'][0]['role'] == 'ROOT', f"{ep['id']}: first chip is the root {ep['root']}")
    # roots claim in the caption
    roots = sorted({d['s'] for d in dots if d['root']}, reverse=True)
    check(roots == ep['root_strings'], f"{ep['id']}: roots ({ep['root']}) sit on strings {roots}, caption says {ep['root_strings']}")
    frets = [d['f'] for d in dots]
    check((min(frets), max(frets)) == (lo, hi), f"{ep['id']}: diagram spans frets {min(frets)}-{max(frets)}, caption says {lo}-{hi}")
    # scale run (audio + pop-in) must ascend in pitch
    if 'run_notes' in ep:     # explicit lesson order (e.g. octave shapes): every dot once, pitch never falls
        run = []; grp = []
        for (s, f, b, *g) in ep['run_notes']:
            grp.append(g[0] if g else 0)
            check((s, f) in ep['dots'], f"{ep['id']}: lesson note string {s} fret {f} is on the diagram")
            run.append(next(x for x in dots if (x['s'], x['f']) == (s, f)))
        check(sorted((d['s'], d['f']) for d in run) == sorted(ep['dots']), f"{ep['id']}: the lesson pops every dot exactly once")
        for gi in sorted(set(grp)):
            ms = [d['m'] for d, k in zip(run, grp) if k == gi]
            check(ms == sorted(ms), f"{ep['id']}: lesson notes{f' (group {gi + 1})' if len(set(grp)) > 1 else ''} never fall in pitch ({' '.join(octave_name(m, PC_SHARP) for m in ms)})")
        t_run = timeline([n[2] for n in ep['run_notes']], ep['bpm'])
    else:
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
    for i, (note, t) in enumerate(zip(ep['lick'], lt)):
        (s, f, b, dur), opt = note[:4], (note[4] if len(note) > 4 else {})
        check((s, f) in ep['dots'], f"{ep['id']}: lick note {i + 1} string {s} fret {f} = {octave_name(midi(s, f), PC_SHARP)} is on the diagram")
        lick.append({'i': i + 1, 's': s, 'f': f, 'm': midi(s, f), 'n': spell[pc(s, f)], 't': t,
                     'dur': round(dur * 60 / ep['bpm'], 4), 'root': pc(s, f) == NAME2PC[ep['root']]})
        if 'bend' in opt:
            tm = midi(s, f) + opt['bend']
            check(opt['bend'] == int(opt['bend']) and tm % 12 in pcs, f"{ep['id']}: lick note {i + 1} bends {opt['bend']} semitones from {spell[pc(s, f)]} up to {octave_name(tm, PC_SHARP)}, a scale tone")
            lick[-1].update(bend=opt['bend'], up=round(opt['up'] * 60 / ep['bpm'], 4), bend_m=tm, bend_n=spell[tm % 12])
        if 'slide' in opt:     # slide up the same string to another box dot (ep08); audio = pitch wheel, fret by fret
            n = opt['slide']; tf = f + n
            check(n == int(n) and n > 0 and (s, tf) in ep['dots'], f"{ep['id']}: lick note {i + 1} slides string {s} fret {f} ({spell[pc(s, f)]}) up {n} frets to fret {tf} = {octave_name(midi(s, tf), PC_SHARP)}, a dot on the diagram")
            lick[-1].update(bend=n, up=round(opt['up'] * 60 / ep['bpm'], 4), bend_m=midi(s, tf), bend_n=spell[pc(s, tf)], slide=True)
        if 'ph' in opt: lick[-1]['ph'] = opt['ph']
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
    extra_out = lesson_layers(ep, dots, lick, pcs, spell)
    ep['groove'] = g
    phases = {k: round(v * bt, 4) for k, v in ep['phases'].items()}
    data = {k: ep[k] for k in ('id', 'num', 'word', 'hook', 'window', 'box', 'caption', 'payoff', 'next', 'bpm', 'root',
                               'scale_name', 'chips', 'kicker', 'swing') if k in ep}
    data.update(pre_run=pre_run if ep.get('slide') else [], dots=dots, run=run_ev, extra=extra_ev, lick=lick, phases=phases, beat=bt, dur=ep['dur'],
                slide=ep.get('slide'), groove=ep['groove'])
    data.update(extra_out)
    return data

def lesson_layers(ep, dots, lick, pcs, spell):
    """ghost target, bends, hits, links, status labels, shapes, marks (eps 4+). Every one is checked here."""
    out = {}; T = lambda b: round(b * 60 / ep['bpm'], 4); sp = lambda m: octave_name(m, PC_SHARP)
    key = lambda s, f: (s, f) in ep['dots'] or (s, f) == ep.get('ghost')
    if 'ghost' in ep:
        s, f = ep['ghost']; m = midi(s, f)
        check(m % 12 in pcs and (s, f) not in ep['dots'], f"{ep['id']}: ghost target string {s} fret {f} = {sp(m)} is a scale tone, drawn as a ghost (not a box dot)")
        out['ghost'] = {'s': s, 'f': f, 'm': m, 'n': spell[m % 12], 't': T(ep['ghost_at'])}
    if 'bends' in ep or any(l.get('slide') for l in lick):
        out['bends'] = []
        for (s, f, b, up, hold, semis, kind) in ep.get('bends', []):
            check((s, f) in ep['dots'], f"{ep['id']}: {'slide' if kind == 'slide' else 'bend'} starts on a box dot (string {s} fret {f} = {spell[pc(s, f)]})")
            tm = midi(s, f) + semis
            if kind == 'slide':
                check(semis == int(semis) and (s, f + int(semis)) in ep['dots'] and tm % 12 in pcs, f"{ep['id']}: the slide runs string {s} fret {f} -> fret {f + int(semis)} = {sp(tm)}, {int(semis)} frets = {int(semis)} semitones, onto a dot on the diagram")
            elif kind == 'good':
                check(tm == out['ghost']['m'], f"{ep['id']}: the in-tune bend reaches {sp(midi(s, f) + 2)} = the ghost target {out['ghost']['n']} exactly ({semis} semitones)")
            else:
                check(semis != int(semis) and abs(semis - 2) * 100 >= 40, f"{ep['id']}: the flat bend stops {abs(semis - 2) * 100:.0f} cents under the target (not a scale tone)")
            out['bends'].append({'s': s, 'f': f, 't': T(b), 'up': T(up), 'hold': T(hold), 'semis': semis, 'kind': kind, 'm': midi(s, f)})
            if kind == 'slide': out['bends'][-1]['slide'] = True
        for l in lick:
            if l.get('slide'):
                out['bends'].append({'s': l['s'], 'f': l['f'], 't': l['t'], 'up': l['up'], 'hold': round(l['t'] + l['dur'], 4), 'semis': l['bend'], 'kind': 'lick', 'm': l['m'], 'slide': True})
            elif 'bend' in l:
                check(l['bend_m'] == out['ghost']['m'], f"{ep['id']}: the lick's bend lands on the ghost target {out['ghost']['n']} ({sp(l['bend_m'])})")
                out['bends'].append({'s': l['s'], 'f': l['f'], 't': l['t'], 'up': l['up'], 'hold': round(l['t'] + l['dur'], 4), 'semis': l['bend'], 'kind': 'lick', 'm': l['m']})
    if 'hits' in ep:
        out['hits'] = []
        for (s, f, b, play, col) in ep['hits']:
            check(key(s, f), f"{ep['id']}: highlighted note string {s} fret {f} = {sp(midi(s, f))} is on the diagram")
            out['hits'].append({'s': s, 'f': f, 't': T(b), 'm': midi(s, f), 'n': spell[pc(s, f)], 'play': play, 'col': col})
    if 'links' in ep:
        out['links'] = []
        for (a, z, b, b_end, kind) in ep['links']:
            check(key(*a) and key(*z), f"{ep['id']}: link {a} -> {z} joins two drawn notes")
            want = {'unison': 0, 'octave': 12}[kind]
            check(midi(*z) - midi(*a) == want, f"{ep['id']}: link string {a[0]} fret {a[1]} ({sp(midi(*a))}) -> string {z[0]} fret {z[1]} ({sp(midi(*z))}) is a {kind}")
            out['links'].append({'a': a, 'z': z, 't': T(b), 't_end': T(b_end), 'kind': kind})
    if 'shapes' in ep:
        out['shapes'] = []
        for (lo, hi, s_top, s_bot, label, b) in ep['shapes']:
            inside = [(s, f) for (s, f) in ep['dots'] if lo <= f <= hi and s_top <= s <= s_bot]
            check(len(inside) == 2 and abs(midi(*inside[0]) - midi(*inside[1])) == 12, f"{ep['id']}: shape frets {lo}-{hi}, strings {s_bot}-{s_top} holds exactly one octave pair {inside}")
            check(not any(w in label.lower().split() for w in ('take', 'takes', 'launched', 'live')), f"{ep['id']}: shape label '{label}' follows the wording rules")
            out['shapes'].append({'lo': lo, 'hi': hi, 'st': s_top, 'sb': s_bot, 'label': label, 't': T(b)})
    if 'boxes' in ep:   # several box outlines on one board (ep07/08): each must be a full pentatonic box, 2 notes per string
        out['boxes'] = []
        for (lo, hi, label, b, col) in ep['boxes']:
            inside = [(s, f) for (s, f) in ep['dots'] if lo <= f <= hi]
            full = all((pc(s, f) in pcs) == ((s, f) in ep['dots']) for s in range(1, 7) for f in range(lo, hi + 1))
            check(full and all(sum(1 for x in inside if x[0] == s) == 2 for s in range(1, 7)) and {f for _, f in inside} >= {lo, hi},
                  f"{ep['id']}: box '{label}' frets {lo}-{hi} holds every scale tone in its frets, 2 per string ({len(inside)} notes)")
            check(not any(w in label.lower().split() for w in ('take', 'takes', 'launched', 'live')) and col in ('volt', 'dim'), f"{ep['id']}: box label '{label}' follows the wording rules")
            out['boxes'].append({'lo': lo, 'hi': hi, 'label': label, 't': T(b), 'col': col})
    if 'marks' in ep:
        out['marks'] = []
        for ((s, f), b, kind) in ep['marks']:
            check((s, f) in ep['dots'], f"{ep['id']}: marked note string {s} fret {f} is a dot")
            out['marks'].append({'s': s, 'f': f, 't': T(b), 'kind': kind})
    if 'status' in ep:
        out['status'] = [{'t': T(a), 't_end': T(z), 'text': txt, 'col': col} for (a, z, txt, col) in ep['status']]
        for st in out['status']:
            check(not any(w in st['text'].lower().split() for w in ('take', 'takes', 'launched', 'live')), f"{ep['id']}: label '{st['text']}' follows the wording rules")
    if ep.get('all_badges'):
        rep = {}
        for l in lick: rep.setdefault((l['s'], l['f']), []).append(l['i'])
        check(all(len(v) <= 2 for v in rep.values()), f"{ep['id']}: no dot is played more than twice, so 2 badges show every lick number {sorted(rep.values())}")
    for k in ('stamp_xy', 'card_sub', 'gprog', 'all_badges'):
        if k in ep: out[k] = ep[k]
    return out

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

AM7, DM7 = [57, 60, 64, 67], [57, 60, 62, 65]
# ---------- KEEPER 04 · BEND ----------
def _ph(l, k): return [x for x in l if x.get('ph') == k]
EPS.append(dict(
    id='ep04', num='04', word='BEND', hook="Your bends are flat.\nHere's the fix.",
    root='A', intervals=MINOR_PENT, scale_name='minor pentatonic', spell={9: 'A', 0: 'C', 2: 'D', 4: 'E', 7: 'G'},
    dots=box(5), box=(5, 8), window=(3, 10), root_strings=[6, 4, 1],
    chips=[{'n': 'A', 'role': 'ROOT'}, {'n': 'C'}, {'n': 'D', 'role': 'BEND', 'label': 'BEND'}, {'n': 'E', 'role': 'BLUE', 'label': 'TARGET'}, {'n': 'G'}],
    caption='Whole-step bend · G string fret 7 (D) up to E\nCheck it: the same E as B string, fret 5',
    kicker='Now play this', bpm=90,
    run_start=3, run_step=0.25,
    ghost=(3, 9), ghost_at=6.5,
    hits=[(2, 5, 7, True, 'cyan')],
    links=[((2, 5), (3, 9), 7, 11.75, 'unison')],
    bends=[(3, 7, 8, .5, 9.5, 1.5, 'flat'), (3, 7, 10, .5, 11.5, 2, 'good')],
    status=[(6.5, 7, 'BEND TARGET: E', 'cyan'), (7, 7.9, 'SAME E AS B STRING, FRET 5', 'cyan'),
            (8.3, 9.8, 'TOO FLAT', 'red'), (10.3, 11.8, 'IN TUNE', 'volt'), (16.6, 18.4, 'D BENT UP TO E', 'cyan')],
    lick=[(2, 8, 16, .5), (3, 7, 16.5, 1, {'bend': 2, 'up': .35}), (2, 5, 17.5, .5), (3, 7, 18, .5), (3, 5, 18.5, .5), (4, 7, 19, 2.5)],
    payoff="Bend to a note\nthat's in the box.", next='Tomorrow · ASK: licks are sentences',
    phases=dict(board=1.5, box=2.6, chips=12, caption=13.5, kicker=14.5, stamp=21.6, payoff=22, wipe=25, end=26, replay=27),
    dur=22.4, gprog=29, all_badges=True, card_sub='<b>Best</b> · clean and confident, flubs cut',
    groove=dict(style='straight', timeline=[(0, 'Am7', AM7, 45), (12, 'Dm7', DM7, 50), (16, 'Am7', AM7, 45), (20, 'Dm7', DM7, 50), (24, 'Am7', AM7, 45)]),
    claims={'the bend target E (G string fret 9) is the same pitch as B string fret 5, inside the box': lambda d, l: midi(3, 9) == midi(2, 5) and (2, 5) in box(5),
            'the bent note is D (G string fret 7), a whole step (2 frets) under E': lambda d, l: [x for x in l if 'bend' in x][0]['n'] == 'D' and midi(3, 9) - midi(3, 7) == 2,
            'the lick comes down E, D, C and lands on A': lambda d, l: [x['n'] for x in l[2:]] == ['E', 'D', 'C', 'A']},
))
# ---------- KEEPER 05 · ASK ----------
EPS.append(dict(
    id='ep05', num='05', word='ASK', hook='Licks are sentences.\nAsk, then answer.',
    root='A', intervals=MINOR_PENT, scale_name='minor pentatonic', spell={9: 'A', 0: 'C', 2: 'D', 4: 'E', 7: 'G'},
    dots=box(5), box=(5, 8), window=(3, 10), root_strings=[6, 4, 1],
    chips=[{'n': 'A', 'role': 'ROOT', 'label': 'ANSWER'}, {'n': 'C'}, {'n': 'D'}, {'n': 'E', 'role': 'BLUE', 'label': 'QUESTION'}, {'n': 'G'}],
    caption='Question ends on E · answer ends on A\nA minor pentatonic · frets 5 to 8',
    kicker='Now play this', bpm=100,
    run_start=3, run_step=0.25,
    hits=[(2, 5, 7, True, 'cyan'), (5, 7, 7, True, 'cyan'), (4, 7, 9, True, 'volt'), (1, 5, 9, True, 'volt'), (6, 5, 9, False, 'volt')],
    marks=[((2, 5), 7, 'q'), ((5, 7), 7, 'q')],
    status=[(7, 8.8, 'A QUESTION ENDS ON E', 'cyan'), (9, 10.8, 'AN ANSWER ENDS ON A', 'volt'),
            (16, 19.8, 'QUESTION', 'cyan'), (20, 24, 'ANSWER', 'volt')],
    lick=[(4, 5, 16, .5, {'ph': 0}), (4, 7, 16.5, .5, {'ph': 0}), (3, 5, 17, .5, {'ph': 0}), (3, 7, 17.5, .5, {'ph': 0}), (2, 5, 18, 2, {'ph': 0}),
          (2, 8, 20, .5, {'ph': 1}), (2, 5, 20.5, .5, {'ph': 1}), (3, 7, 21, .5, {'ph': 1}), (3, 5, 21.5, .5, {'ph': 1}), (4, 7, 22, 2, {'ph': 1})],
    payoff='Question on E.\nAnswer on A.', next='Tomorrow · TWIN: find any A in 2 seconds',
    phases=dict(board=1.5, box=2.6, chips=11, caption=13, kicker=14.4, stamp=24.2, payoff=24.6, wipe=27, end=28, replay=29),
    dur=22.9, gprog=27, card_sub='<b>Best</b> · a complete phrase, bar to bar',
    groove=dict(style='straight', timeline=[(0, 'Am7', AM7, 45), (16, 'Dm7', DM7, 50), (20, 'Am7', AM7, 45), (29, 'Dm7', DM7, 50), (33, 'Am7', AM7, 45)]),
    claims={'the question is one bar (beats 16-20), starts on the bar line and ends on E': lambda d, l: _ph(l, 0)[0]['t'] == timeline([16], 100)[0] and _ph(l, 0)[-1]['n'] == 'E' and _ph(l, 0)[-1]['t'] + _ph(l, 0)[-1]['dur'] <= timeline([20], 100)[0] + 1e-9,
            'the answer is the next bar (beats 20-24), starts on the bar line and ends on A': lambda d, l: _ph(l, 1)[0]['t'] == timeline([20], 100)[0] and _ph(l, 1)[-1]['n'] == 'A' and _ph(l, 1)[-1]['t'] + _ph(l, 1)[-1]['dur'] <= timeline([24], 100)[0] + 1e-9,
            'the question rises (ends higher than it starts), the answer falls': lambda d, l: _ph(l, 0)[-1]['m'] > _ph(l, 0)[0]['m'] and _ph(l, 1)[-1]['m'] < _ph(l, 1)[0]['m'],
            'every lick note is tagged question or answer': lambda d, l: all(x.get('ph') in (0, 1) for x in l),
            'E sits on strings 5 and 2 inside the box (the cyan question notes)': lambda d, l: sorted((x['s'], x['f']) for x in d if x['n'] == 'E') == [(2, 5), (5, 7)]},
))
# ---------- KEEPER 06 · TWIN ----------
EPS.append(dict(
    id='ep06', num='06', word='TWIN', hook='Find any A\nin 2 seconds.',
    root='A', intervals=[0], scale_name='octaves', spell={9: 'A'},
    dots=[(6, 5), (4, 7), (5, 12), (3, 14)], box=(5, 14), window=(4, 15), root_strings=[6, 5, 4, 3], full_box=False, chips_any=True,
    run_notes=[(6, 5, 3), (4, 7, 4), (5, 12, 7), (3, 14, 8)],
    chips=[{'n': 'A', 'role': 'ROOT', 'label': 'LOW'}, {'n': 'A', 'role': 'ROOT', 'label': 'MID'}, {'n': 'A', 'role': 'ROOT', 'label': 'MID'}, {'n': 'A', 'role': 'ROOT', 'label': 'HIGH'}],
    caption='Octave: two frets over, two strings toward the floor\nString 6 fret 5 to string 4 fret 7 · string 5 fret 12 to string 3 fret 14',
    kicker='Now play this', bpm=96,
    shapes=[(5, 7, 4, 6, 'ONE OCTAVE UP', 2.6), (12, 14, 3, 5, 'SAME SHAPE, NEXT A', 6.5)],
    links=[((6, 5), (4, 7), 4, 13.6, 'octave'), ((5, 12), (3, 14), 8, 13.6, 'octave')],
    hits=[(6, 5, 5, True, 'volt'), (4, 7, 5, True, 'volt'), (5, 12, 9, True, 'volt'), (3, 14, 9, True, 'volt')],
    lick=[(6, 5, 15, .5), (4, 7, 15.5, 1), (5, 12, 16.5, .5), (3, 14, 17, 2.5)],
    payoff='Two frets over,\ntwo strings down.', next='Tomorrow · NEXT: your box has a neighbour',
    phases=dict(board=1.5, box=2.6, chips=10.5, caption=12, kicker=13.4, stamp=19.6, payoff=20, wipe=23, end=24, replay=25),
    dur=19.2, gprog=29, stamp_xy=[790, 572],
    groove=dict(style='straight', timeline=[(0, 'Am7', AM7, 45), (8, 'Dm7', DM7, 50), (12, 'Am7', AM7, 45), (20, 'Dm7', DM7, 50), (24, 'Am7', AM7, 45)]),
    claims={'every dot is an A': lambda d, l: all(x['n'] == 'A' for x in d),
            'each shape: 2 strings higher, 2 frets up = exactly one octave': lambda d, l: all(midi(s - 2, f + 2) - midi(s, f) == 12 for s, f in [(6, 5), (5, 12)]),
            'shape 1 top (string 4 fret 7) and shape 2 bottom (string 5 fret 12) are the same A3': lambda d, l: midi(4, 7) == midi(5, 12) == 57,
            'chips LOW / MID / MID / HIGH match A2, A3, A3, A4 in lesson order': lambda d, l: [midi(4, 7) - 12, midi(4, 7), midi(5, 12), midi(5, 12) + 12] == [45, 57, 57, 69] and [midi(6, 5), midi(3, 14)] == [45, 69],
            'every A on strings 6-3 between frets 4 and 15 is shown (none missing)': lambda d, l: sorted((s, f) for s in (3, 4, 5, 6) for f in range(4, 16) if pc(s, f) == 9) == sorted((x['s'], x['f']) for x in d),
            'caption.txt note: from the G string the shape stretches to 3 frets (G f14 -> e f17, D f7 -> B f10)': lambda d, l: midi(1, 17) - midi(3, 14) == 12 and midi(2, 10) - midi(4, 7) == 12,
            'caption.txt: the 2-fret shape holds from the low E and A strings; from the D and G strings it takes 3 frets': lambda d, l: all(midi(s - 2, f + 2) - midi(s, f) == 12 for s in (6, 5) for f in range(0, 15)) and all(midi(s - 2, f + 3) - midi(s, f) == 12 for s in (4, 3) for f in range(0, 15)),
            'lick: A2, A3, the same A3 on another string, A4': lambda d, l: [x['m'] for x in l] == [45, 57, 57, 69]},
))

# ---------- KEEPER 07 · NEXT ----------
BOX1 = box(5)                                                     # the HOME box, frets 5-8 (ep01)
BOX2 = [(6, 8), (6, 10), (5, 7), (5, 10), (4, 7), (4, 10), (3, 7), (3, 9), (2, 8), (2, 10), (1, 8), (1, 10)]   # box 2, frets 7-10
BOTH = sorted(set(BOX1 + BOX2), key=lambda x: (midi(*x), -x[0]))
SHARED = [x for x in BOX2 if x in BOX1]                           # frets 7-8: box 1's right edge = box 2's left edge
NEW2 = [x for x in BOX2 if x not in BOX1]
_in = lambda l, bx: all((x['s'], x['f']) in bx for x in l)
_ascend = lambda xs: sorted(xs, key=lambda x: midi(*x))
EPS.append(dict(
    id='ep07', num='07', word='NEXT', hook='Your box has\na neighbour.',
    root='A', intervals=MINOR_PENT, scale_name='minor pentatonic', spell={9: 'A', 0: 'C', 2: 'D', 4: 'E', 7: 'G'},
    dots=BOTH, box=(5, 10), window=(4, 11), root_strings=[6, 4, 2, 1],
    run_notes=[(s, f, 3 + i * .25, 0) for i, (s, f) in enumerate(_ascend(BOX1))] + [(s, f, 7 + i * .5, 1) for i, (s, f) in enumerate(_ascend(NEW2))],
    boxes=[(5, 8, 'BOX 1 · HOME', 2.6, 'dim'), (7, 10, 'BOX 2', 6.5, 'volt')],
    hits=[(s, f, 10.5 + i * .25, True, 'cyan') for i, (s, f) in enumerate(_ascend(SHARED))],
    marks=[((s, f), 10.5 + i * .25, 'shared') for i, (s, f) in enumerate(_ascend(SHARED))],
    status=[(10.3, 12.3, '6 NOTES IN BOTH BOXES', 'volt')],
    chips=[{'n': 'A', 'role': 'ROOT'}, {'n': 'C'}, {'n': 'D'}, {'n': 'E'}, {'n': 'G'}],
    caption='Box 2 · frets 7 to 10 · A on strings 4 and 2\nFrets 7 and 8 are shared with box 1',
    kicker='Now play this', bpm=96,
    lick=[(1, 10, 17, .5), (1, 8, 17.5, .5), (2, 10, 18, .5), (2, 8, 18.5, .5), (3, 9, 19, .5), (3, 7, 19.5, .5), (4, 10, 20, .5), (4, 7, 20.5, 2.5)],
    payoff='Two boxes,\none scale.', next='Tomorrow · SLIDE: stop getting stuck in one box',
    phases=dict(board=1.5, box=2.6, chips=12.5, caption=14.7, kicker=15.4, stamp=21.7, payoff=22.1, wipe=25.3, end=26.3, replay=27.5),
    dur=22.0, gprog=27, stamp_xy=[600, 566],
    groove=dict(style='straight', timeline=[(0, 'Am7', AM7, 45), (12, 'Dm7', DM7, 50), (16, 'Am7', AM7, 45), (24, 'Dm7', DM7, 50), (28, 'Am7', AM7, 45)]),
    claims={'box 1 on this board is exactly the HOME box (ep01 shape, frets 5-8)': lambda d, l: sorted((x['s'], x['f']) for x in d if x['f'] <= 8) == sorted(BOX1),
            'box 2 = frets 7-10: E string 8/10, A 7/10, D 7/10, G 7/9, B 8/10, e 8/10, all A minor pentatonic': lambda d, l: sorted((x['s'], x['f']) for x in d if x['f'] >= 7) == sorted(BOX2) and {x['n'] for x in d if x['f'] >= 7} == {'A', 'C', 'D', 'E', 'G'},
            'the boxes share exactly 6 notes, one per string, all on frets 7-8 (the cyan notes)': lambda d, l: len(SHARED) == 6 and sorted(s for s, _ in SHARED) == [1, 2, 3, 4, 5, 6] and all(f in (7, 8) for _, f in SHARED),
            'caption: in box 2, A sits on strings 4 and 2 (D string fret 7, B string fret 10)': lambda d, l: sorted((s, f) for s, f in BOX2 if pc(s, f) == 9) == [(2, 10), (4, 7)],
            'the box-2 run pops only the 6 notes box 1 does not have (frets 9-10)': lambda d, l: all(f in (9, 10) for _, f in NEW2) and len(NEW2) == 6,
            'the lick stays inside box 2, two notes per string, high e down to the D string': lambda d, l: _in(l, BOX2) and [x['s'] for x in l] == [1, 1, 2, 2, 3, 3, 4, 4],
            'the lick falls one scale step at a time (D C A G E D C A)': lambda d, l: [x['n'] for x in l] == ['D', 'C', 'A', 'G', 'E', 'D', 'C', 'A'] and all(a['m'] > b['m'] for a, b in zip(l, l[1:])),
            'the lick lands on D string fret 7: the same A3 the HOME lick (ep01) lands on': lambda d, l: (l[-1]['s'], l[-1]['f'], l[-1]['m']) == (4, 7, 57)},
))
# ---------- KEEPER 08 · SLIDE ----------
EPS.append(dict(
    id='ep08', num='08', word='SLIDE', hook='Stop getting stuck\nin one box.',
    root='A', intervals=MINOR_PENT, scale_name='minor pentatonic', spell={9: 'A', 0: 'C', 2: 'D', 4: 'E', 7: 'G'},
    dots=BOTH, box=(5, 10), window=(4, 11), root_strings=[6, 4, 2, 1],
    run_notes=[(s, f, 3 + i * .25, 0) for i, (s, f) in enumerate(_ascend(BOX1))] + [(s, f, 6.5 + i * .25, 1) for i, (s, f) in enumerate(_ascend(NEW2))],
    boxes=[(5, 8, 'BOX 1', 2.6, 'dim'), (7, 10, 'BOX 2', 6.1, 'volt')],
    bends=[(3, 7, 9, .4, 10.6, 2, 'slide')],
    hits=[(3, 9, 9.4, False, 'hot'), (3, 9, 18.35, False, 'hot')],
    status=[(8.8, 10.9, 'SLIDE: G STRING, FRET 7 TO 9', 'volt'), (11, 12.3, 'BOX 1 INTO BOX 2', 'volt'), (18, 19.6, 'D SLIDES UP TO E', 'volt')],
    chips=[{'n': 'A', 'role': 'ROOT'}, {'n': 'C'}, {'n': 'D', 'role': 'SLIDE', 'label': 'FROM'}, {'n': 'E', 'role': 'BLUE', 'label': 'TO'}, {'n': 'G'}],
    caption='G string · slide fret 7 to 9 · D up to E\nBox 1 into box 2 · land on A, B string fret 10',
    kicker='Now play this', bpm=96,
    lick=[(4, 7, 17, .5), (3, 5, 17.5, .5), (3, 7, 18, 1, {'slide': 2, 'up': .35}), (2, 8, 19, .5), (1, 8, 19.5, .5), (1, 10, 20, .5), (2, 10, 20.5, 2.5)],
    payoff='The slide\nis the bridge.', next='Tomorrow · LOOP: the 3-note lick every rock solo uses',
    phases=dict(board=1.5, box=2.6, chips=12.5, caption=14.4, kicker=15.4, stamp=21.7, payoff=22.1, wipe=25.3, end=26.3, replay=27.5),
    dur=22.0, gprog=27, stamp_xy=[700, 566], card_sub='<b>Best</b> · your Lick A, plus two runners-up',
    groove=dict(style='straight', timeline=[(0, 'Am7', AM7, 45), (12, 'Dm7', DM7, 50), (16, 'Am7', AM7, 45), (24, 'Dm7', DM7, 50), (28, 'Am7', AM7, 45)]),
    claims={'the slide is on the G string, fret 7 (D) to fret 9 (E): 2 frets = a whole step': lambda d, l: [(x['s'], x['f'], x['n'], x['bend_n'], x['bend_m'] - x['m']) for x in l if x.get('slide')] == [(3, 7, 'D', 'E', 2)],
            'G string fret 7 is in both boxes; fret 9 is only in box 2, so the slide crosses into box 2': lambda d, l: (3, 7) in BOX1 and (3, 7) in BOX2 and (3, 9) in BOX2 and (3, 9) not in BOX1,
            'every lick note before the slide is in box 1 (and the G string fret 5 C is box 1 only)': lambda d, l: _in(l[:2], BOX1) and (3, 5) not in BOX2 and (l[1]['s'], l[1]['f']) == (3, 5),
            'every lick note after the slide is in box 2, and it ends on box-2-only notes (e fret 10, B fret 10)': lambda d, l: _in(l[3:], BOX2) and all(x not in BOX1 for x in [(1, 10), (2, 10)]) and [(x['s'], x['f']) for x in l[-2:]] == [(1, 10), (2, 10)],
            'the lick starts on A3 (D string fret 7) and lands on A4 (B string fret 10), an octave higher': lambda d, l: (l[0]['n'], l[0]['m'], l[-1]['n'], l[-1]['m']) == ('A', 57, 'A', 69),
            'the flash on G string fret 9 in the lick is timed to the moment the slide arrives (within 1 ms)': lambda d, l: abs(l[2]['t'] + l[2]['up'] - timeline([18.35], 96)[0]) < .001,
            'chips: D (slide from) and E (slide to) are the notes the slide joins': lambda d, l: midi(3, 7) % 12 == NAME2PC['D'] and midi(3, 9) % 12 == NAME2PC['E']},
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
