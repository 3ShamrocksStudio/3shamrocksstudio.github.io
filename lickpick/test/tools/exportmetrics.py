import json, glob, subprocess, numpy as np
import os
L = os.environ.get("LPOUT", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "out"))
M = os.environ.get("LPMEDIA", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "media"))
truth = {t['name']: t for t in json.load(open(M + '/truth.json'))}
for jf in sorted(glob.glob(L + '/export/*.json')):
    m = json.load(open(jf)); name = jf.split('/')[-1].replace('.json', '').replace('_full', '').split('__')[0]; name = next((k for k in truth if name == k or name.startswith(k + '_')), name); T = truth[name]
    sr = 22050
    y = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', m['file'], '-f', 's16le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True).stdout, dtype='<i2').astype(float) / 32768
    probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_name,start_time,duration', '-of', 'csv=p=0', m['file']], capture_output=True, text=True).stdout.strip().replace('\n', ' | ')
    H = int(sr * 0.004); E = np.array([np.sum(y[i:i + H] ** 2) for i in range(0, len(y) - H, H)])
    on = []
    for i in range(3, len(E) - 8):
        prev = E[i - 3:i].mean()
        if E[i] > 5 * prev + 1e-7 and E[i] > 1e-5 and (not on or i * H / sr - on[-1][0] > 0.05): on.append((i * H / sr, E[i:i + 8].max()))
    on = np.array(on); s = m['rw'][0]
    strong = on[on[:, 1] >= 0.2 * np.percentile(on[:, 1], 95)][:, 0] + s
    tb = np.array(T['beats']); B = tb[(tb >= s + 1) & (tb <= m['rw'][1] - 0.5)]
    sub = []
    for i in range(len(tb) - 1): sub += [tb[i], tb[i] + (tb[i + 1] - tb[i]) * (2 / 3 if T['swing'] else 0.5)]
    sub = np.array(sub); hs = strong[(strong >= B[0] - 0.05) & (strong <= B[-1] + 0.05)]
    sg = np.array([sub[np.argmin(np.abs(sub - h))] - h for h in hs])  # signed: + = hit early
    e8 = np.abs(sg); eb = np.array([np.min(np.abs(B - h)) for h in hs])
    # drift: signed error of hits on true beats, first vs last quarter
    onb = np.array([(h, B[np.argmin(np.abs(B - h))] - h) for h in hs if np.min(np.abs(B - h)) < 0.06])
    q = max(1, len(onb) // 4); drift = (onb[-q:, 1].mean() - onb[:q, 1].mean()) * 1000 if len(onb) > 8 else None
    # grid used by the app vs truth
    gb = np.array(m['beats']); ge = np.array([gb[np.argmin(np.abs(gb - t))] - t for t in B])
    print(f"{name:18s} {'full' if 'full' in jf else 'pick'} win {s:.1f}-{m['rw'][1]:.1f} exportMs {m['exportMs']} | {probe} | EXPORTED HITS n{len(hs)} med {np.median(e8)*1000:.1f} p95 {np.percentile(e8,95)*1000:.1f} signedMed {np.median(sg)*1000:.1f}ms onBeat {np.mean(eb<0.05):.2f} drift {drift if drift is None else round(drift,1)} | appGrid med {np.median(np.abs(ge))*1000:.1f}")
