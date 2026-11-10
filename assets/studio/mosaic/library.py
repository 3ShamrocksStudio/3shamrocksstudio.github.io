"""Mosaic v5 asset library (10 Nov 2026). Turns the source list of build.py into a curated library of unique,
high-quality pieces of the studio's work, which both the mosaic tiles (build.py) and the colour-family viewer
(js/mosaic.js) use:
  1. every source is swapped for the largest sharp copy of the same artwork anywhere in the repo (audit.same_art:
     shape hash + aspect + colour grid), SH✡MER Nature and review folders excluded;
  2. copies of one artwork collapse into one piece; the 100 to 200 px icon rasters are replaced by 640 px renders of
     the brand sprites (icons.js);
  3. the quality bar (audit.verdict) drops anything small, blurry, flat, near-black or placeholder;
  4. each piece gets a sharp 640 px webp thumbnail (lib/NNN.webp), a full-size image (the original when it is
     already a light webp / jpg, else lib/NNN-f.webp up to 1800 px), its dominant colour and colour family.
Writes library.json and audit-report.json. Run from the repo root after audit.py:  python3 assets/studio/mosaic/library.py"""
import json, os, sys, colorsys
import numpy as np
import cv2
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from audit import index_repo, same_art, verdict, eff_size, BAR_SHARP, OUT

LIB = OUT + '/lib'
EXCL_DIRS = ('shomer-nature', 'review/', 'assets/studio/mosaic/src/sets/', 'assets/studio/mosaic/lib/', 'assets/brand-proposals/rk', 'th-mvp/assets/assets/egg_placeholder')

src = open(OUT + '/build.py').read(); ns = {}
exec(src[:src.index('\nBRAND_BG = {}')], ns)
SRC = [s for s in ns['SRC'] if not s[2].startswith(OUT + '/src/sets/')]
PRODUCTS = ns['PRODUCTS']

# 640 px icon renders (icons.js)
ICN = OUT + '/src/icons/'
for f in sorted(os.listdir(ICN)):
  p, nm = f.split('-', 1); nm = os.path.splitext(nm)[0]
  nm = nm.split('-', 1)[1] if '-' in nm else nm
  SRC.append((p, 'icon: ' + nm.replace('av-', 'avatar ').replace('-', ' '), ICN + f, 'icon'))

# v5 additions: current, high-resolution work that was not in the mosaic yet (checked by eye, 10 Nov 2026)
TS, SC, VP = 'assets/work/trashure-hunters/screens/', 'shomer-command/assets/shots/', 'assets/work/vibrant/play/'
EXTRA = [('sh', 'command centre: overview', SC + 'dash-overview.webp', 'screen'), ('sh', 'command centre: SOS', SC + 'dash-sos.webp', 'screen'),
         ('sh', 'command centre, mobile', SC + 'step-3.webp', 'screen'), ('sh', 'command centre: alerts', SC + 'step-2.webp', 'screen'),
         ('sh', 'command centre: reports', SC + 'step-4.webp', 'screen'), ('sh', 'command centre: map', SC + 'step-5.webp', 'screen'),
         ('sh', 'map screen', 'shomer-shake-preview/img/app-map.png', 'screen'), ('sh', 'safe route', 'shomer-shake-preview/img/app-route.png', 'screen'),
         ('sh', 'trusted circles', 'shomer-shake-preview/img/app-circles.png', 'screen'),
         ('vb', 'app: learn', VP + 'learn.webp', 'screen'), ('vb', 'app: calendar', VP + 'calendar.webp', 'screen'), ('vb', 'app: report', VP + 'report.webp', 'screen'),
         ('vb', 'app: home', VP + 'home.webp', 'screen'), ('th', 'share card', 'assets/og/og-trashure-hunters-v2.jpg', 'screen'),
         ('th', 'Water king', 'assets/work/trashure-hunters/brand/king-water.webp', 'art'), ('fr', 'logo on green', 'assets/brand-v3/fairent/logo-on-green.webp', 'logo'),
         ('th', 'profile screen', TS + 'play-profile.webp', 'screen')] + \
        [('th', 'onboarding: ' + n, TS + f + '.webp', 'screen') for n, f in [('splash', 'ob-01-splash'), ('the beginning', 'ob-02-beginning'), ('the signal', 'ob-03-signal'),
         ('found one', 'ob-04-found'), ('title', 'ob-05-title'), ('age', 'ob-06-age'), ('choose your Elemonster', 'ob-07-choose'), ('name it', 'ob-08-name'),
         ('reveal', 'ob-09-reveal'), ('map tutorial', 'ob-10-tut-map'), ('camera tutorial', 'ob-11-tut-cam'), ('hunt tutorial', 'ob-12-tut-hunt')]]
SRC += EXTRA

# looked at by eye after the bar: not the studio's current work, or not good as a stand-alone picture
MANUAL_KEEP = {'lickpick/app/icon-512-v5.png'}   # the LickPick app icon: its largest export is 512 px (416 px of art), crisp
MANUAL_DROP = {
  'assets/studio/mosaic/src/rk-board.webp': 'crop of the board, shown whole elsewhere',
}
# v5.2 (Dave, 10 Nov 2026): no LickPick screen with "take" / "takes" text and nothing built from the Wikimedia Commons
# guitarist clips (s9 lp-pick / lp-style / lp-home / lp-home-m, every screen or page showing those video frames)
LP_DROP = ['lickpick/assets/m_home.jpg', 'lickpick/assets/m_pick.jpg', 'lickpick/assets/m_post.jpg', 'lickpick/assets/m_band.jpg',
           'lickpick/assets/m_export.jpg', 'lickpick/assets/og.jpg', 'assets/work/lickpick/site-desktop.webp', 'assets/work/lickpick/site-mobile.webp',
           'assets/studio/screens/lickpick-cut.webp', 'assets/studio/screens/lickpick-pick.webp', 'assets/studio/screens/lickpick-style.webp',
           'assets/studio/screens/lickpick-share.webp', 'assets/studio/screens/lickpick-welcome.webp', 'assets/og/og-lickpick.jpg',
           'assets/studio/s9/lp-pick.webp', 'assets/studio/s9/lp-style.webp', 'assets/studio/s9/lp-home.webp', 'assets/studio/s9/lp-home-m.webp']
MANUAL_DROP.update({q: 'LickPick: "take" text or Wikimedia Commons clip frames' for q in LP_DROP})


def dominant(path, palette=False):
  """dominant colour of the artwork (v5.1, 10 Nov 2026): the most prominent saturated hue, so a small bright accent on a
  big dark / white / grey backdrop does not decide the family, and a dark navy screen is not read as its red button.
  Opaque pixels only. Near-black, near-white, greys and dull dark tones (navy, indigo outlines) never vote: a pixel votes
  when it is tinted (S >= .2, chroma S*V >= .12, V >= .38). When tinted pixels cover less than 12% of the artwork (35%
  when the artwork is mostly dark, e.g. a night-mode screen with a few coloured buttons; not for palette cards), it is a neutral piece:
  'night' (Night / Mono) or 'light'. Otherwise a chroma-weighted hue histogram (10 degree bins, circularly smoothed)
  picks the peak hue (vivid colour outweighs pastel); the colour is the weighted mean of the pixels within +-20 degrees
  of it. Returns (rgb, hue or -1 when neutral, tinted share, mean lightness of the artwork 0..100)."""
  im = Image.open(path).convert('RGBA'); im.thumbnail((200, 200))
  a = np.asarray(im)
  m = a[..., 3] > 160
  if m.sum() < 50: m = np.ones(a.shape[:2], bool)
  px = a[..., :3][m].astype(np.float32) / 255
  hsv = cv2.cvtColor(px.reshape(-1, 1, 3), cv2.COLOR_RGB2HSV).reshape(-1, 3)   # H 0..360, S, V 0..1 for float input
  H, S, V = hsv[:, 0], hsv[:, 1], hsv[:, 2]; C = S * V
  L = float(cv2.cvtColor(px.reshape(-1, 1, 3), cv2.COLOR_RGB2LAB)[..., 0].mean())   # 0..100 for float input
  sat = (S >= .2) & (C >= .12) & (V >= .38)
  share = float(sat.mean()); dark = float((V < .3).mean())
  if share < (.35 if dark >= .4 and not palette else .12):
    rgb = px.mean(0) * 255
    return [int(v) for v in rgb], -1., share, L
  w = C[sat]
  hist = np.bincount((H[sat] // 10).astype(int) % 36, weights=w, minlength=36)
  sm = hist + .5 * np.roll(hist, 1) + .5 * np.roll(hist, -1)
  pk = int(np.argmax(sm)) * 10 + 5
  d = np.abs((H[sat] - pk + 180) % 360 - 180) <= 20
  rgb = (px[sat][d] * w[d, None]).sum(0) / w[d].sum() * 255
  return [int(v) for v in rgb], float(pk), share, L


FAMS = [('red', 'Red'), ('orange', 'Orange'), ('yellow', 'Gold'), ('green', 'Green'), ('teal', 'Teal'), ('blue', 'Blue'),
        ('purple', 'Purple'), ('pink', 'Pink'), ('night', 'Night / Mono'), ('light', 'Light'), ('multi', 'Multi')]
OVR = OUT + '/family-overrides.json'
def curate(assets):
  """v5.2: after the automatic hue pass, the hand-curated family of each piece listed in family-overrides.json (path -> family;
  every family was checked piece by piece on contact sheets, since hue detection alone kept putting e.g. multicolour or
  white-background pieces in a colour family), and no piece in LP_DROP"""
  ovr = json.load(open(OVR))['fam']; names = {f for f, _ in FAMS}
  for a in assets:
    if a['path'] in ovr: assert ovr[a['path']] in names, a['path']; a['fam'] = ovr[a['path']]
  return [a for a in assets if a['path'] not in LP_DROP and not set(a['srcs']) & set(LP_DROP)]
def family(rgb, hue, share, L):
  if hue < 0:
    return 'light' if L > 65 else 'night'
  for lim, f in ((14, 'red'), (40, 'orange'), (68, 'yellow'), (155, 'green'), (195, 'teal'), (248, 'blue'), (292, 'purple'), (340, 'pink'), (361, 'red')):
    if hue < lim: return f


def look(path, s):
  """24x24 grey picture of the artwork (on mid grey), normalised: the dot product of two is their visual similarity"""
  im = Image.open(path).convert('RGBA')
  if s['cut'] and s['box']: im = im.crop(s['box'])
  bg = Image.new('RGBA', im.size, (128, 128, 128, 255)); bg.alpha_composite(im)
  g = np.asarray(bg.convert('L').resize((24, 24), Image.BILINEAR), np.float32).ravel(); g = (g - g.mean()) / (g.std() + 1e-3)
  return g / (np.linalg.norm(g) + 1e-6)


def export(job):
  i, path, s, mode = job
  im = Image.open(path); im.load(); im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
  if s['cut'] and s['box']: im = im.crop(s['box'])
  out = []
  for px, suf in ((640, ''), (320, '-s')):
    t = im.copy(); t.thumbnail((px, px), Image.LANCZOS); q = '%s/%03d%s.webp' % (LIB, i, suf); t.save(q, 'WEBP', quality=82, method=4); out.append(q)
  ext = os.path.splitext(path)[1].lower()
  if ext in ('.webp', '.jpg', '.jpeg') and not s['cut'] and max(s['w'], s['h']) <= 2200 and os.path.getsize(path) < 700 * 1024:
    fp = path
  else:
    f = im.copy(); f.thumbnail((1800, 1800), Image.LANCZOS); fp = '%s/%03d-f.webp' % (LIB, i); f.save(fp, 'WEBP', quality=85, method=4)
  return (out[0], out[1], fp) + tuple(dominant(out[0], mode == 'palette'))


def main():
  IDX = index_repo()
  cands = {p: s for p, s in IDX.items() if not p.startswith(EXCL_DIRS)}
  report = {'bar': {'opaque_short_side_px': 600, 'cutout_long_side_px': 512, 'edge_sharpness_min': BAR_SHARP}, 'before': [], 'after': []}
  # before: the v4 source list as it was (incl. the old 100 to 200 px icon rasters)
  v4 = ns['SRC'] + [(f.split('-')[0], 'icon', OUT + '/src/sets/' + f, 'icon') for f in sorted(os.listdir(OUT + '/src/sets'))]
  seen = set()
  for p, l, path, m in v4:
    if path in seen or path not in IDX: continue
    seen.add(path); s = IDX[path]
    report['before'].append({'path': path, 'p': p, 'label': l, 'px': [s['w'], s['h']], 'art_px': list(eff_size(s)), 'sharp': s['sharp'], 'fails': verdict(s)})
  # same-art groups among the before list (duplicates)
  bl = report['before']
  for i, r in enumerate(bl):
    for j in range(i):
      if same_art(IDX[r['path']], IDX[bl[j]['path']]): r['dup_of'] = bl[j]['path']; break

  # 1. best copy of each source
  pieces = []
  for p, l, path, m in SRC:
    if path not in IDX: continue
    s = IDX[path]; best = path
    for q, t in cands.items():
      if q != best and same_art(s, t) and t['sharp'] >= BAR_SHARP and max(eff_size(t)) > max(eff_size(IDX[best])): best = q
    pieces.append({'p': p, 'l': l, 'src': path, 'path': best, 'mode': m})
  # 2. one piece per artwork (largest copy wins; the first label given is kept)
  uniq, why = [], {}
  for pc in pieces:
    hit = next((u for u in uniq if u['path'] == pc['path'] or same_art(IDX[u['path']], IDX[pc['path']])), None)
    if hit:
      why[pc['src']] = 'duplicate of ' + hit['path']
      if max(eff_size(IDX[pc['path']])) > max(eff_size(IDX[hit['path']])): hit['path'] = pc['path']
      hit.setdefault('also', []).append(pc['src']); continue
    uniq.append(pc)
  # 3. quality bar
  keep = []
  for u in uniq:
    v = verdict(IDX[u['path']])
    if u['path'] in MANUAL_DROP or u['src'] in MANUAL_DROP: v = v + [MANUAL_DROP.get(u['path']) or MANUAL_DROP[u['src']]]
    if u['path'] in MANUAL_KEEP: v = []
    if v: why[u['src']] = '; '.join(v); continue
    keep.append(u)
  # 3b. one colourway of each logo, one capture of each screen: same product and the same picture at 24x24 (also inverted,
  # e.g. a wordmark on light vs on dark) collapses to the largest copy, so a brand's logo shows once, not five times
  F = np.array([look(u['path'], IDX[u['path']]) for u in keep]); S = F @ F.T
  col = [np.array(IDX[u['path']]['cs'], float).reshape(-1, 3).mean(0) for u in keep]
  par = list(range(len(keep)))
  def root(i):
    while par[i] != i: i = par[i]
    return i
  for i in range(len(keep)):
    for j in range(i):
      a, b = keep[i], keep[j]
      if a['p'] != b['p'] or 'icon' in (a['mode'], b['mode']): continue
      sim = float(S[i, j]); cd = float(np.abs(col[i] - col[j]).mean())
      same = abs(sim) > .9 or (a['mode'] in ('logo', 'square') and b['mode'] in ('logo', 'square') and abs(sim) > .7) or \
             (a['mode'] == b['mode'] == 'screen' and sim > .74 and cd < 22)
      if same: par[root(i)] = root(j)
  groups = {}
  for i in range(len(keep)): groups.setdefault(root(i), []).append(i)
  k2 = []
  for g in groups.values():
    g.sort(key=lambda i: -max(eff_size(IDX[keep[i]['path']])))
    w = keep[g[0]]
    for i in g[1:]:
      why[keep[i]['src']] = 'same picture as ' + w['path'] + ' (other colourway / capture)'; w.setdefault('also', []).append(keep[i]['src'])
    k2.append((min(g), w))
  keep = [w for _, w in sorted(k2, key=lambda t: t[0])]
  # brand palettes as colour-swatch cards (the brands' own colours, from brand-v3 palette files or sampled from their marks)
  exec(src[src.index('def palette_of'):src.index('def swatches')], ns)
  os.makedirs(OUT + '/src/palettes', exist_ok=True)
  for p in ns['PAL_SRC']:
    cols = ns['palette_of'](p)[:6]; card = Image.new('RGB', (1200, 900))
    for i, c in enumerate(cols): card.paste(tuple(int(v) for v in c), (i * 1200 // len(cols), 0, (i + 1) * 1200 // len(cols), 900))
    q = OUT + '/src/palettes/%s.png' % p; card.save(q)
    keep.append({'p': p, 'l': 'colour palette', 'src': q, 'path': q, 'mode': 'palette'})
    if q not in IDX: from audit import stats; IDX[q] = stats(q)
  print('sources', len(pieces), 'unique artworks', len(uniq), 'kept', len(keep))

  # 4. export (parallel): 320 / 640 px thumbnails, full size, dominant colour
  os.makedirs(LIB, exist_ok=True)
  for f in os.listdir(LIB): os.remove(os.path.join(LIB, f))
  if '--dry' in sys.argv:
    json.dump({'keep': keep, 'why': why}, open(OUT + '/.dry.json', 'w'), indent=1, ensure_ascii=False); return
  from multiprocessing import Pool
  with Pool(8) as pool: outs = pool.map(export, [(i, u['path'], IDX[u['path']], u['mode']) for i, u in enumerate(keep)])
  assets = []
  for u, (tp, sp, fp, rgb, hue, share, L) in zip(keep, outs):
    s = IDX[u['path']]; bw, bh = eff_size(s)
    assets.append({'p': u['p'], 'l': u['l'], 't': tp, 's': sp, 'f': fp, 'w': bw, 'h': bh,
                   'c': '#%02x%02x%02x' % tuple(rgb), 'fam': family(rgb, hue, share, L), 'cut': bool(s['cut']), 'mode': u['mode'], 'path': u['path'],
                   'srcs': [u['src']] + u.get('also', [])})
    report['after'].append({'path': u['path'], 'p': u['p'], 'label': u['l'], 'art_px': [bw, bh], 'sharp': s['sharp'], 'thumb': tp, 'full': fp,
                            'replaces': [u['src']] + u.get('also', []), 'family': assets[-1]['fam'], 'colour': assets[-1]['c']})
  assets = curate(assets)
  report['dropped'] = why
  from collections import Counter
  print('families', dict(Counter(a['fam'] for a in assets)))
  print('products', dict(Counter(a['p'] for a in assets)))
  json.dump({'v': 5, 'fams': FAMS, 'products': {k: {'n': v[0], 'h': v[1]} for k, v in PRODUCTS.items()}, 'assets': assets},
            open(OUT + '/library.json', 'w'), separators=(',', ':'), ensure_ascii=False)
  json.dump(report, open(OUT + '/audit-report.json', 'w'), indent=1, ensure_ascii=False)
  tot = sum(os.path.getsize(os.path.join(LIB, f)) for f in os.listdir(LIB))
  print('lib MB', round(tot / 1e6, 1), 'files', len(os.listdir(LIB)))


def refam():
  """--refam: recompute only the colour and family (then the hand-curated overrides and drops, curate()) of every piece in library.json from its 640 px thumbnail (no re-export,
  so the piece order, the files and layout.json's tile -> piece links stay as they are)"""
  from collections import Counter
  j = json.load(open(OUT + '/library.json'))
  for a in j['assets']:
    rgb, hue, share, L = dominant(a['t'], a['mode'] == 'palette')
    a['c'] = '#%02x%02x%02x' % tuple(rgb); a['fam'] = family(rgb, hue, share, L)
  keep = curate(j['assets'])
  for a in j['assets']:   # files of dropped pieces go too (the other pieces keep their file names)
    if a not in keep:
      for q in {a['t'], a['s'], a['f']}:
        if q.startswith(LIB + '/') and os.path.exists(q): os.remove(q)
  j['assets'] = keep
  j['fams'] = FAMS
  print('families', dict(Counter(a['fam'] for a in j['assets'])))
  json.dump(j, open(OUT + '/library.json', 'w'), separators=(',', ':'), ensure_ascii=False)


if __name__ == '__main__':
  refam() if '--refam' in sys.argv else main()
