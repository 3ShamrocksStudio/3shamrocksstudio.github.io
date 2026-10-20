# Ground truth for the real-recording sets (beats, downbeats, meter, key, style), with a fixed tune/test split.
#   GuitarSet (Xi et al. 2018, CC BY 4.0) comping takes: beats, meter, key.            players 00-02 tune, 03-05 test
#   Ballroom (ISMIR 2004 tempo contest audio; beats/downbeats: CPJKU BallroomAnnotations, Krebs et al. 2013): beats,
#     meter (Waltz / Viennese waltz in 3), dance style. No key.                          sorted index even tune, odd test
#   GTZAN (Tzanetakis 2002; beats: Marchand & Peeters "gtzan_tempo_beat"; keys: Kraft/Lerch "gtzan_key"):
#     beats, meter, key (where labelled), genre.                                          track index even tune, odd test
# usage: python3 real_truth.py DATASET_DIR GUITARSET_ANN_DIR > truth_real.json
import json, glob, os, sys
D, GSA = sys.argv[1], sys.argv[2]
NOTE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
PC = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11}
out = []
def beats_file(path):
    B, P = [], []
    for ln in open(path):
        x = ln.split()
        if len(x) >= 2: B.append(float(x[0])); P.append(int(float(x[1])))
        elif len(x) == 1: B.append(float(x[0])); P.append(0)
    return B, P
for f in sorted(glob.glob(os.path.join(GSA, '*_comp.jams'))):
    d = json.load(open(f)); A = {}
    for a in d['annotations']: A.setdefault(a['namespace'], a)
    bp = A['beat_position']['data']; B = [x['time'] for x in bp]; P = [x['value']['position'] for x in bp]
    r, m = A['key_mode']['data'][0]['value'].split(':'); base = os.path.basename(f)[:-10]
    out.append(dict(name='gs_' + base, set='guitarset', raw=f'raw_gs/{base}_comp_mic.json', beats=B, down=[i for i, p in enumerate(P) if p == 1], meter=str(bp[0]['value']['num_beats']),
                    key=NOTE[PC[r]] + ('m' if m.startswith('min') else ''), style=base.split('_')[1].rstrip('0123456789-').split('-')[0], split='tune' if int(base[:2]) <= 2 else 'test'))
br = sorted(glob.glob(os.path.join(D, 'ballroom/BallroomData/*/*.wav')))
br = [x for x in br if not os.path.basename(x).startswith('._') and '/nada/' not in x and 'allBallroom' not in x]
for i, w in enumerate(br):
    base = os.path.basename(w)[:-4]; a = os.path.join(D, 'BallroomAnnotations', base + '.beats')
    if not os.path.exists(a): continue
    B, P = beats_file(a)
    out.append(dict(name='br_' + base, set='ballroom', raw=f'raw_br/{base}.json', beats=B, down=[k for k, p in enumerate(P) if p == 1], meter=str(max(P)), key=None,
                    style=os.path.basename(os.path.dirname(w)), split='tune' if i % 2 == 0 else 'test'))
KEYS = ['A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab']
for w in sorted(glob.glob(os.path.join(D, 'gtzan/genres/*/*.wav'))):
    base = os.path.basename(w)[:-4]
    if base.startswith('._'): continue
    g, n = base.split('.')[0], int(base.split('.')[1]); a = os.path.join(D, 'gtzan_tempo_beat/beats', f'gtzan_{g}_{n:05d}.beats')
    if not os.path.exists(a): continue
    B, P = beats_file(a); kf = os.path.join(D, 'gtzan_key/gtzan_key/genres', g, f'{base}.lerch.txt'); key = None
    if os.path.exists(kf):
        k = int(open(kf).read().split()[0])
        if 0 <= k <= 23: key = KEYS[k % 12] + ('m' if k >= 12 else '')
    out.append(dict(name='gt_' + base, set='gtzan', raw=f'raw_gt/{base}.json', beats=B, down=[k for k, p in enumerate(P) if p == 1], meter=str(max(P)) if max(P) else None, key=key,
                    style=g, split='tune' if n % 2 == 0 else 'test'))
json.dump(out, sys.stdout)
