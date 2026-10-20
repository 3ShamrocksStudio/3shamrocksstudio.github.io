# Builds truth_gs.json (beats, tempo, key) for GuitarSet's 180 comping takes from its JAMS annotations.
# GuitarSet (Xi et al. 2018, CC BY 4.0): https://zenodo.org/records/3371780 -> annotation.zip + audio_mono-mic.zip
# usage: python3 gs_truth.py ANNOTATION_DIR > truth_gs.json ; then RAWDIR=rawgs node dumpraw.mjs AUDIO_DIR/*_comp_mic.wav
import json, glob, os, sys
NOTE = {'C': 'C', 'C#': 'C#', 'Db': 'C#', 'D': 'D', 'D#': 'Eb', 'Eb': 'Eb', 'E': 'E', 'F': 'F', 'F#': 'F#', 'Gb': 'F#', 'G': 'G', 'G#': 'Ab', 'Ab': 'Ab', 'A': 'A', 'A#': 'Bb', 'Bb': 'Bb', 'B': 'B', 'Cb': 'B'}
out = []
for f in sorted(glob.glob(os.path.join(sys.argv[1], '*_comp.jams'))):
    d = json.load(open(f)); A = {}
    for a in d['annotations']: A.setdefault(a['namespace'], a)
    beats = [x['time'] for x in A['beat_position']['data']]; tempo = A['tempo']['data'][0]['value']
    r, m = A['key_mode']['data'][0]['value'].split(':')
    out.append({'name': 'gs_' + os.path.basename(f)[:-10], 'dur': A['tempo']['data'][0]['duration'], 'key': NOTE[r] + ('m' if m.startswith('min') else ''), 'beats': beats,
                'gaps': [], 'played_from': 0.0, 'bpm0': tempo, 'bpm1': tempo, 'swing': 'Jazz' in f})
json.dump(out, sys.stdout)
