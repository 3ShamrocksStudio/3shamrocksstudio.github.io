"""Score v5: LickPick's product sound (`p_lickpick` in assets/audio/studio/v2/sfx.*) becomes an ELECTRIC GUITAR lick (Dave, 10 Nov:
"not a mandolin / troubadour sound"). E minor pentatonic run D5-E5-G5 into a bent A5 with vibrato, GS Clean Guitar through
overdrive + cab low-pass + short plate, ~0.55 s, -15 dBTP like the other cues.

Splices the lick into the existing sprite at the p_lickpick slot (1.1421 s; the next cue starts at 1.79 s), so every other cue
keeps its offset (product pages hard-code them). Each container is re-encoded from its own decode.
Usage: python3 studio_sfx_v5_lick.py  -> rewrites assets/audio/studio/v2/sfx.ogg + sfx.m4a, prints the new cue."""
import os, sys, subprocess
import numpy as np
import pedalboard as pb
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import score_v5 as S

SR = S.SR
DIR = os.path.join(S.HERE, '..', 'studio', 'v2')
START, NEXT = 1.1421, 1.79


def lick():
    p = S.Part(); p.prog(0, 27)
    seq = [(0.000, 0.07, 74, 104, 0), (0.065, 0.07, 76, 108, 0), (0.130, 0.08, 79, 112, 0), (0.205, 0.33, 81, 118, -2)]
    for t, d, k, v, bf in seq:
        p.n(t, d, 0, k, v, jit=0, vj=0)
        if bf:
            for i in range(9): p.bend(t + i * 0.008, 0, bf * (1 - i / 8) ** 1.4)
            for tt in np.arange(t + 0.1, t + d, 0.01): p.bend(tt, 0, 0.3 * np.sin(2 * np.pi * 6.5 * (tt - t - 0.1)))
        else: p.bend(t - 0.001, 0, 0.0)
    y = S.render(p, wrap=False, length=0.75).mean(axis=0, keepdims=True)
    y = y / (np.abs(y).max() + 1e-9)
    y = S.fx(y, [pb.HighpassFilter(180), pb.Gain(6), pb.Distortion(16.0), pb.LowpassFilter(4200), pb.PeakFilter(1000, 2.5, 0.8),
                 pb.PeakFilter(2700, -3.0, 1.0), pb.Compressor(-18, 3.0, 3, 80)])
    S.irs()
    y = S.send(y, 0.18, hp=400, lp=4500).mean(axis=0)
    n = int(0.6 * SR); y = y[:n]; k = int(0.06 * SR); y[-k:] *= np.cos(np.linspace(0, np.pi / 2, k)) ** 2
    return y * 10 ** ((-15.0 - S.tp_db(y[None])) / 20)


def splice(path, x, codec):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    y = np.frombuffer(r.stdout, np.float32).copy()
    a, b = int(START * SR), int((NEXT - 0.02) * SR)
    y[a:b] = 0.0; y[a:a + len(x)] = x
    raw = path + '.raw'; y.astype(np.float32).tofile(raw)
    out = path + '.new' + os.path.splitext(path)[1]
    enc = (['-c:a', 'libopus', '-b:a', '64k', '-vbr', 'constrained', '-application', 'audio'] if codec == 'opus' else
           ['-c:a', 'aac', '-b:a', '64k', '-aac_pns', '0', '-movflags', '+faststart'])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', raw] + enc + [out], check=True)
    os.replace(out, path); os.remove(raw)


if __name__ == '__main__':
    x = lick()
    splice(os.path.join(DIR, 'sfx.ogg'), x, 'opus')
    splice(os.path.join(DIR, 'sfx.m4a'), x, 'aac')
    print('p_lickpick cue: [%.4f, %.4f]' % (START, len(x) / SR))
