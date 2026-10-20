# Adds GuitarSet's chords to a truth file as chords_t [[t0, t1, root, [pitch classes]], ...] for eval4's chord-tone accuracy:
# WHICH=0 the instructed chords (lead sheet, first JAMS 'chord' annotation), WHICH=1 the performed ones (what was played,
# Harte syntax with added and omitted degrees).  usage: [WHICH=0|1] python3 gs_chords.py ANN_DIR truth_in.json > truth_out.json
import json, os, sys, re
PC = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11, 'Fb': 4, 'E#': 5, 'B#': 0}
Q = {'maj': [0, 4, 7], 'min': [0, 3, 7], '7': [0, 4, 7, 10], 'maj7': [0, 4, 7, 11], 'min7': [0, 3, 7, 10], 'hdim7': [0, 3, 6, 10], 'dim': [0, 3, 6], 'dim7': [0, 3, 6, 9],
     'aug': [0, 4, 8], 'sus2': [0, 2, 7], 'sus4': [0, 5, 7], 'maj6': [0, 4, 7, 9], 'min6': [0, 3, 7, 9], '9': [0, 4, 7, 10, 2], 'maj9': [0, 4, 7, 11, 2], 'min9': [0, 3, 7, 10, 2], '': [0, 4, 7], 'minmaj7': [0, 3, 7, 11]}
DEG = {'1': 0, 'b2': 1, '2': 2, '#2': 3, 'b3': 3, '3': 4, '4': 5, '#4': 6, 'b5': 6, '5': 7, '#5': 8, 'b6': 8, '6': 9, 'bb7': 9, 'b7': 10, '7': 11, 'b9': 1, '9': 2, '#9': 3, '11': 5, '#11': 6, 'b13': 8, '13': 9}
WHICH = int(os.environ.get('WHICH', '0'))
def pcs_of(val):
    r, q = (val.split(':') + ['maj'])[:2]; q = q.split('/')[0]; add = re.findall(r'\((.*)\)', q); base = re.sub(r'\(.*\)', '', q)
    if r not in PC or base not in Q: return None, None
    iv = set(Q[base])
    for d in (add[0].split(',') if add else []):
        d = d.strip()
        if d.startswith('*'): iv.discard(DEG.get(d[1:], -1))
        elif d in DEG: iv.add(DEG[d])
    return PC[r], sorted({(PC[r] + i) % 12 for i in iv})
ann, T = sys.argv[1], json.load(open(sys.argv[2]))
for t in T:
    f = os.path.join(ann, t['name'][3:] + '_comp.jams') if t['name'].startswith('gs_') else None
    if not f or not os.path.exists(f): continue
    d = json.load(open(f)); ch = [a for a in d['annotations'] if a['namespace'] == 'chord'][WHICH]['data']; out = []
    for x in ch:
        r, p = pcs_of(x['value'])
        if r is None: continue
        out.append([round(x['time'], 3), round(x['time'] + x['duration'], 3), r, p])
    t['chords_t'] = out
json.dump(T, sys.stdout)
