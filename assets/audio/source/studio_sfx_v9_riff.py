"""Score v9: LickPick's hover sound (`p_lickpick` in assets/audio/studio/v2/sfx.*) becomes an electric-guitar RIFF.

Dave, 12 Nov: "lickpick - hover sfx should be 'electric guitar riff' sfx instead of current weird sound." The v5 cue was a fast
high lick (D5-E5-G5 into a bent A5, heavy drive): thin and squeaky on laptop speakers. v9 is a real riff in the low register,
in the site's key: two palm-muted E5 power-chord chugs, G5, then A5 let ring with a little vibrato, 16ths at the site's 98 BPM
feel (sped up a touch to fit the slot). Overdrive guitar, light amp drive, speaker-cabinet curve (no fizz above ~4 kHz).
Original, synthesised from the GeneralUser GS SoundFont like the rest of the score.

Splices into the existing sprite at the p_lickpick slot (1.1421 s; the next cue starts at 1.79 s), so every other cue keeps
its offset. Usage: python3 studio_sfx_v9_riff.py  -> rewrites assets/audio/studio/v2/sfx.ogg + sfx.m4a (ver sc9)."""
import os, sys
import numpy as np
import pedalboard as pb
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import score_v5 as S
import studio_sfx_v5_lick as L

SR = S.SR
LEN = 0.62
PC = {'E': [40, 47, 52], 'G': [43, 50, 55], 'A': [45, 52, 57]}


def riff():
    p = S.Part(); p.prog(0, 29); p.prog(1, 29)
    hits = [(0.000, 0.060, 'E', 96), (0.085, 0.060, 'E', 100), (0.170, 0.120, 'G', 108), (0.300, 0.300, 'A', 112)]
    for t, d, c, v in hits:
        for j, k in enumerate(PC[c]): p.n(t + j * 0.004, d, 0 if j < 2 else 1, k, v - 6 * j, jit=0, vj=0)   # a small strum
    for tt in np.arange(0.40, 0.60, 0.01):           # the ringing A5 gets a gentle vibrato
        for ch in (0, 1): p.bend(tt, ch, 0.12 * np.sin(2 * np.pi * 6.0 * (tt - 0.40)))
    y = S.render(p, wrap=False, length=LEN + 0.2).mean(axis=0, keepdims=True)
    y = y / (np.abs(y).max() + 1e-9)
    y = S.fx(y, [pb.HighpassFilter(80), pb.Gain(3), pb.Distortion(8.0), pb.PeakFilter(120, 2.0, 0.8), pb.PeakFilter(650, 2.0, 0.8),
                 pb.PeakFilter(2800, -5.0, 0.9), pb.LadderFilter(pb.LadderFilter.Mode.LPF24, 4000, 0.0, 1.0), pb.Compressor(-18, 3.0, 3, 80)])
    S.irs()
    y = S.send(y, 0.14, hp=300, lp=4000).mean(axis=0)
    n = int(LEN * SR); y = y[:n].copy(); k = int(0.08 * SR); y[-k:] *= np.cos(np.linspace(0, np.pi / 2, k)) ** 2
    y[:32] *= np.linspace(0, 1, 32)
    return y * 10 ** ((-15.0 - S.tp_db(y[None])) / 20)


if __name__ == '__main__':
    x = riff()
    L.splice(os.path.join(L.DIR, 'sfx.ogg'), x, 'opus')
    L.splice(os.path.join(L.DIR, 'sfx.m4a'), x, 'aac')
    print('p_lickpick cue: [%.4f, %.4f]' % (L.START, len(x) / SR))
