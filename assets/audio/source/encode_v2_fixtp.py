import sys, subprocess, re, numpy as np, soundfile as sf
sys.path.insert(0, '/home/claude/3shamrocksstudio.github.io/assets/audio/source')
from synth import master, lufs, true_peak_db, SR
D = '/home/claude/3shamrocksstudio.github.io/assets/audio/studio/v2'
def tp(f):
    o = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'Peak:\s+(-?[\d.]+)', o)[-1]), float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1])
for name in sys.argv[1:]:
    x, _ = sf.read(f'v2/{name}.wav'); x = x.T; h = int(0.5 * SR); loop = x[:, h:-h]
    ceil = -3.0
    for it in range(6):
        y = master(loop, -16.0, ceil)
        sf.write(f'v2/{name}.wav', np.concatenate([y[:, -h:], y, y[:, :h]], axis=1).T, SR, subtype='FLOAT')
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'v2/{name}.wav', '-c:a', 'libopus', '-b:a', '32k', '-vbr', 'off', f'{D}/{name}.ogg'])
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'v2/{name}.wav', '-c:a', 'aac', '-b:a', '40k', f'{D}/{name}.m4a'])
        a, b = tp(f'{D}/{name}.ogg'), tp(f'{D}/{name}.m4a')
        print(name, 'ceil', ceil, 'ogg', a, 'm4a', b, flush=True)
        if max(a[0], b[0]) <= -1.2: break
        ceil -= max(1.0, max(a[0], b[0]) + 1.4)
