"""J8NIX out of the "Made of the work" mosaic (8 Nov 2026): its screens show the studio's internal to-dos.
Same mechanism as rk_swap.py: the portrait at rest keeps sampling atlas.webp, so the face never changes. Each J8NIX tile
gets a replacement (the closest-colour tile of another current product, copied from atlas.webp into atlas2.webp), which
is what the magnifier, the tag and the exploded grid show. J8NIX's link is dropped from layout.json.
Run from the repo root after rk_swap.py:  python3 assets/studio/mosaic/j8_swap.py"""
import json, os
import numpy as np
from PIL import Image

OUT = 'assets/studio/mosaic'
L = json.load(open(OUT + '/layout.json'))
SLOT, ATL, G, G2o = L['slot'], L['atlas'], L['grid'], L['grid2']
A1 = Image.open(OUT + '/atlas.webp').convert('RGB'); A2o = Image.open(OUT + '/atlas2.webp').convert('RGB')
T = L['tiles']; j8 = [i for i, t in enumerate(T) if t[0] == 'j8']
assert j8 and not any(str(i) in L['r'] for i in j8), 'already swapped'
used = set(r[3] for r in L['desktop'] + L['mobile']) | set(r[4] for r in L['desktop'] + L['mobile'])
usedp = set(L['g'][i] for i in used)
cand = [i for i, t in enumerate(T) if t[0] not in ('j8', 'rk')]
fresh = [i for i in cand if L['g'][i] not in usedp] or cand          # pieces not already in the portrait: no repeats in the grid
M = np.array([t[2:5] for t in T], dtype=float)
n0 = len(L['tiles2']); cnt, pick = {}, {}
for i in j8:
  pool = [c for c in fresh if cnt.get(c, 0) < 2] or [c for c in cand if cnt.get(c, 0) < 2]
  c = min(pool, key=lambda c: ((M[c] - M[i]) ** 2).sum()); cnt[c] = cnt.get(c, 0) + 1; pick[i] = c
newt = sorted(set(pick.values())); tot = n0 + len(newt)
G2 = 1
while G2 * G2 < tot: G2 += 1
A2 = 1 << (G2 * SLOT - 1).bit_length(); G2 = A2 // SLOT
atlas = Image.new('RGB', (A2, A2), (16, 12, 30))
for k in range(n0):   # existing R&K slots keep their positions' order
  sx, sy = (k % G2o) * SLOT, (k // G2o) * SLOT; atlas.paste(A2o.crop((sx, sy, sx + SLOT, sy + SLOT)), ((k % G2) * SLOT, (k // G2) * SLOT))
base = max(L['g2']) + 1; gid = {}; slot = {}
for k, c in enumerate(newt):
  j = n0 + k; sx, sy = (c % G) * SLOT, (c // G) * SLOT
  atlas.paste(A1.crop((sx, sy, sx + SLOT, sy + SLOT)), ((j % G2) * SLOT, (j // G2) * SLOT))
  L['tiles2'].append(list(T[c])); L['g2'].append(base + gid.setdefault(L['g'][c], len(gid))); slot[c] = j
for i in j8: L['r'][str(i)] = slot[pick[i]]
L['atlas2'], L['grid2'] = A2, G2
L['products']['j8']['h'] = '#work'
atlas.save(OUT + '/atlas2.webp', 'WEBP', quality=84, method=6)
json.dump(L, open(OUT + '/layout.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print('J8NIX tiles', len(j8), 'replacements', len(newt), 'atlas2', A2, 'px', os.path.getsize(OUT + '/atlas2.webp') // 1024, 'kB')
