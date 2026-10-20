import json, sys, glob, numpy as np
import os
L = os.environ.get("LPOUT", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "out"))
M = os.environ.get("LPMEDIA", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "media"))
truth = {t['name']: t for t in json.load(open(M + '/truth.json'))}
rows = []
for f in sorted(glob.glob(L + '/band_raw_*.json')):
    for d in json.load(open(f)): rows.append(d)
seen = {}
for d in rows: seen[d['name']] = d
NOTE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
NIDX = {'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
def scale(k):
    minor = k.endswith('m'); r = NIDX[k.rstrip('m')]
    if minor: return {(r + i) % 12 for i in [0, 2, 3, 5, 7, 8, 10, 11]}  # natural + harmonic leading tone
    return {(r + i) % 12 for i in [0, 2, 4, 5, 7, 9, 11]}
def errs(B, ref, P):
    out = []
    for t in B:
        j = np.argmin(np.abs(ref - t)); out.append(ref[j] - t)
    return np.array(out)
def summarize(name, B, band, P, gaps):
    """B = true beats (in window), band = event times. error per true beat to nearest band event."""
    band = np.array(sorted(band))
    if len(band) < 4 or len(B) < 4: return None
    e = errs(B, band, P); a = np.abs(e)
    med, p95 = np.median(a) * 1000, np.percentile(a, 95) * 1000
    # drift: slope of signed error vs time (ms/min), and last quarter - first quarter
    q = max(1, len(e) // 4); drift = (np.mean(e[-q:]) - np.mean(e[:q])) * 1000
    slope = np.polyfit(B, e, 1)[0] * 1000 * 60
    # lost lock: runs of >=4 consecutive beats with |err| > 50 ms
    ev, run, lostS = 0, 0, 0.0
    for i, x in enumerate(a > 0.05):
        if x: run += 1
        else:
            if run >= 4: ev += 1; lostS += run * P
            run = 0
    if run >= 4: ev += 1; lostS += run * P
    halfphase = float(np.mean(np.abs(a - P / 2) < 0.06))  # share of beats where band sits on the "and"
    return dict(med=round(med, 1), p95=round(p95, 1), drift=round(drift, 1), slope=round(slope, 1), lost=ev, lostS=round(lostS, 1), onAnd=round(halfphase, 2), signedMed=round(float(np.median(e)) * 1000, 1))
table = []
for name, d in seen.items():
    T = truth[name]; r = d.get('r')
    if not r: table.append(dict(name=name, err=d.get('err'))); continue
    tb = np.array(T['beats']); P = 60 / T['bpm0']
    s, e = r['rw']; B = tb[(tb >= max(s, 1.0) + 0.0) & (tb <= e - 0.3)]
    if T['played_from']: B = B[B >= T['played_from'] + 0.5]
    gb = np.array(r['bandBeats'])
    G = summarize(name, B, gb, P, T['gaps'])
    inwin = gb[(gb >= B[0] - P / 2) & (gb <= B[-1] + P / 2)]
    ratio = len(inwin) / len(B)
    # rendered drums: onsets in stem time -> take time (stem t=0 == rw.s); strong hits only
    on = np.array(r['drumOn'] or [[0, 0]])
    strong = on[on[:, 1] >= 0.2 * np.percentile(on[:, 1], 95)][:, 0] + s if len(on) > 1 else np.array([])
    D = None
    if len(strong) > 4:
        sub = []
        for i in range(len(tb) - 1):
            sub += [tb[i], tb[i] + (tb[i+1]-tb[i]) * (2/3 if T['swing'] else 0.5)]
        sub = np.array(sub); hs = strong[(strong >= B[0] - 0.05) & (strong <= B[-1] + 0.05)]
        e8 = np.array([np.min(np.abs(sub - h)) for h in hs]); eb = np.array([np.min(np.abs(B - h)) for h in hs])
        D = dict(n=len(hs), med8=round(float(np.median(e8))*1000,1), p95_8=round(float(np.percentile(e8,95))*1000,1), onBeat=round(float(np.mean(eb < 0.05)),2), off=round(float(np.mean(e8 > 0.05)),2))
    # render offset: drum hits vs the band's own grid (should be ~0)
    roff = None
    if len(strong) > 4 and len(gb):
        x = np.array([gb[np.argmin(np.abs(gb - t))] - t for t in strong]); x = x[np.abs(x) < 0.06]; roff = round(float(np.median(x)) * 1000, 1) if len(x) else None
    tk = r.get('takeKey') or {}
    kname = (NOTE[tk['key']] + ('m' if tk['minor'] else '')) if tk.get('key') is not None else '-'
    chroma = r.get('chroma'); inkey = None
    if chroma and sum(chroma) > 0.5: inkey = round(sum(chroma[i] for i in scale(T['key'])), 2)
    # chord roots/notes from harmony names in the true scale?
    hn = [h for h in r.get('harmony') or [] if h and h not in ('N', 'NC')]
    def root(h):
        h2 = h[:2] if len(h) > 1 and h[1] in '#b' else h[:1]; return NIDX.get({'Db': 'C#', 'D#': 'Eb', 'Gb': 'F#', 'G#': 'Ab', 'A#': 'Bb'}.get(h2, h2))
    hr = [root(h) for h in hn]; hin = round(np.mean([x in scale(T['key']) for x in hr if x is not None]), 2) if hr else None
    rel = lambda k: k
    table.append(dict(name=name, true=f"{T['bpm0']}{'→'+str(round(T['bpm1'],1)) if abs(T['bpm1']-T['bpm0'])>.5 else ''} {T['key']}", app=f"{d.get('appTempo')} {d.get('appKey')}",
                      bandBpm=r.get('bpm'), steady=(r.get('grid') or {}).get('steady'), ratio=round(ratio, 2), style=r.get('style'),
                      parts=''.join(k[0] for k, v in (r.get('parts') or {}).items() if v), takeKey=f"{kname} c{tk.get('conf')}",
                      grid=G, drums=D, renderOff=roff, chordRootsInKey=hin, stemChromaInKey=inkey, av=d.get('av'), scanMs=d.get('scanMs'), renderFullMs=d.get('renderFullMs'),
                      sched=r.get('sched'), nb=len(B), mem=r.get('mem'), errs=len(d['log']['console']) + len(d['log']['pageerr'])))
json.dump(table, open(L + '/band_metrics.json', 'w'), indent=1)
for t in table:
    if 'err' in t: print(t['name'], 'ERR', t['err']); continue
    g, dr = t['grid'] or {}, t['drums'] or {}
    print(f"{t['name']:18s} true {t['true']:14s} app {t['app']:16s} band {t['bandBpm']} x{t['ratio']} st={t['steady']} {t['style']}/{t['parts']} key {t['takeKey']:12s} | GRID med {g.get('med')} p95 {g.get('p95')} drift {g.get('drift')} slope {g.get('slope')}ms/min lost {g.get('lost')}({g.get('lostS')}s) and {g.get('onAnd')} sgn {g.get('signedMed')} | HITS n{dr.get('n')} med8 {dr.get('med8')} p95 {dr.get('p95_8')} onBeat {dr.get('onBeat')} offgrid {dr.get('off')} | roff {t['renderOff']} chordsInKey {t['chordRootsInKey']} chroma {t['stemChromaInKey']} | av {t['av']} | scan {t['scanMs']} render {t['renderFullMs']} sched {t['sched']}")
