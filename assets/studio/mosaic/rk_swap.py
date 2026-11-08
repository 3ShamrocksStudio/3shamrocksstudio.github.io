"""R&K-only refresh of the "Made of the work" mosaic (8 Nov 2026, brand v7.1).
The portrait at rest samples atlas.webp, so the face is never touched: this script only writes atlas2.webp and adds the
swap keys to layout.json (r, tiles2, g2, atlas2, grid2). mosaic.js then shows the current R&K pieces in the magnifier,
the tag and the exploded grid. Tile rules are build.py's own (same SRC entries, same tiles_of / busy / de-dup).
Run from the repo root after build.py:  python3 assets/studio/mosaic/rk_swap.py"""
import json, os
import numpy as np
from PIL import Image

OUT = 'assets/studio/mosaic'
src = open(OUT + '/build.py').read()
exec(src[:src.index('tiles, missing, dropped = [], [], 0')])   # constants, SRC, tiles_of, busy, PIECE (no rebuild)

new = []
for p, label, path, mode in SRC:
  if p != 'rk' or not os.path.exists(path): continue
  vs = tiles_of(path, mode)
  for t in vs:
    if mode in ('logo', 'art', 'icon') and len(vs) > 1 and t is not vs[0] and busy(t) < .16: continue
    new.append((label, t, PIECE.get(path, path)))
seen, uniq = set(), []
for tt in new:
  k = np.asarray(tt[1].resize((12, 12), Image.BILINEAR)).tobytes()
  if k not in seen: seen.add(k); uniq.append(tt)
new = uniq

L = json.load(open(OUT + '/layout.json'))
old = [i for i, t in enumerate(L['tiles']) if t[0] == 'rk']
G2 = 1
while G2 * G2 < len(new): G2 += 1
A2 = 1 << (G2 * SLOT - 1).bit_length()
G2 = A2 // SLOT
atlas = Image.new('RGB', (A2, A2), DARK); meta, g2, ids = [], [], {}
for i, (label, t, piece) in enumerate(new):
  x, y = (i % G2) * SLOT, (i // G2) * SLOT
  atlas.paste(t.resize((SLOT, SLOT), Image.LANCZOS), (x, y)); atlas.paste(t, (x + PAD, y + PAD))
  m = (np.asarray(t, dtype=np.float32) / 255).reshape(-1, 3).mean(0)
  meta.append(['rk', label] + [round(float(c), 3) for c in m]); g2.append(ids.setdefault(piece, len(ids)))
atlas.save(OUT + '/atlas2.webp', 'WEBP', quality=84, method=6)
# each old R&K tile shows a new tile with the same label when there is one, otherwise the next one in turn
by = {}
for j, mm in enumerate(meta): by.setdefault(mm[1], []).append(j)
r, k = {}, 0
for i in old:
  lab = L['tiles'][i][1]
  if lab in by: lst = by[lab]; r[str(i)] = lst[len([1 for q in r.values() if q in lst]) % len(lst)]
  else: r[str(i)] = k % len(new); k += 1
L.update({'atlas2': A2, 'grid2': G2, 'r': r, 'tiles2': meta, 'g2': g2})
json.dump(L, open(OUT + '/layout.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print('R&K tiles: old', len(old), 'new', len(new), 'atlas2', A2, 'px,', os.path.getsize(OUT + '/atlas2.webp') // 1024, 'kB')
