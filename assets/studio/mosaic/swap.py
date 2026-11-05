"""Second atlas for the "Made of the work" mosaic: current pieces that replace retired ones in the magnifier, the tag
label and the exploded grid only. The portrait at rest keeps sampling atlas.webp, so its pixels (the face included)
never change. Output: atlas2.webp + keys added to layout.json:
  r: {old tile index: new tile index}   tiles2: [[product, label, r, g, b], ...]   g2: piece id per new tile
Run from the repo root after build.py:  python3 assets/studio/mosaic/swap.py
R&K board: src/rk-board*.webp are Playwright captures of the real board on work/rk.html (5 Nov 2026)."""
import json, os
import numpy as np
from PIL import Image

OUT = 'assets/studio/mosaic'
SLOT, PAD, ATLAS = 112, 3, 1024; GRID = ATLAS // SLOT; C = SLOT - 2 * PAD
J, F, B, S = 'assets/work/j8nix/', 'assets/work/fairent/', 'assets/brand-v3/rk/', OUT + '/src/'
# old tiles (product, label) -> new sources (label, path, mode), in order
SWAP = [
  ('j8', ('dashboard', 'project detail', 'forge screen'),
   [('command centre', J + 'cc-overview.webp', 'screen'), ('project detail', J + 'cc-detail.webp', 'screen'),
    ('prompt forge', J + 'cc-forge.webp', 'screen')]),
  ('fr', ('home screen', 'price result', 'message script', 'data screen'),
   [('home screen', F + 'app-home.webp', 'screen'), ('price result', F + 'app-result.webp', 'screen'),
    ('message', F + 'app-message.webp', 'screen'), ('data screen', F + 'app-data.webp', 'screen')]),
  ('rk', None,  # every R&K tile: the v4/v5 mascot and pre-v6 screens are retired
   [('the board', S + 'rk-board-play.webp', 'screen'), ('board close-up', S + 'rk-board.webp', 'square'),
    ('hero', B + 'hero.png', 'screen'), ('brand card', B + 'brand-card.png', 'square'),
    ('app icon', B + 'app-icon.png', 'square'), ('logo', B + 'logo.png', 'dark'), ('logo', B + 'logo-on-light.png', 'light'), ('icon set', B + 'icons.png', 'screen')]),
]

def on_bg(im, col):
  bg = Image.new('RGBA', im.size, col + (255,)); bg.alpha_composite(im); return bg.convert('RGB')

def contain(im, col):
  im = im.copy(); im.thumbnail((int(C * .86), int(C * .86)), Image.LANCZOS)
  bg = Image.new('RGBA', (C, C), col + (255,)); bg.alpha_composite(im, ((C - im.width) // 2, (C - im.height) // 2)); return bg.convert('RGB')

def crops(im, n):
  w, h = im.size; s = min(w, h); out = []
  for k in range(n):
    t = (k + .5) / n
    x = int((w - s) * t) if w > h else 0; y = int((h - s) * t) if h > w else 0
    out.append(im.crop((x, y, x + s, y + s)).resize((C, C), Image.LANCZOS))
  return out

def tiles_of(path, mode):  # same rules as build.py
  im = Image.open(path).convert('RGBA')
  if mode == 'logo': return [contain(im, (16, 12, 30)), contain(im, (240, 238, 246))]
  if mode == 'dark': return [contain(im, (16, 12, 30))]
  if mode == 'light': return [contain(im, (240, 238, 246))]
  if mode == 'square': return crops(on_bg(im, (16, 12, 30)), 1)
  rgb = on_bg(im, (16, 12, 30)); w, h = rgb.size; r = max(w, h) / min(w, h)
  v = crops(rgb, 1 if r < 1.25 else 2 if r < 2 else 3 if r < 3 else 4)
  if r >= 1.25: v.append(contain(im, (22, 18, 38)))
  return v

L = json.load(open(OUT + '/layout.json')); T = L['tiles']
new, g2, r = [], [], {}
for p, labels, srcs in SWAP:
  old = [i for i, t in enumerate(T) if t[0] == p and (labels is None or t[1] in labels)]
  pt = []
  for si, (label, path, mode) in enumerate(srcs):
    for t in tiles_of(path, mode): pt.append((p, label, t, p + label))  # one piece per label
  base = len(new); new += pt
  for k, i in enumerate(old): r[str(i)] = base + k % len(pt)
assert len(new) <= GRID * GRID, len(new)

atlas = Image.new('RGB', (ATLAS, ATLAS), (16, 12, 30)); meta = []; ids = {}
for i, (p, label, t, piece) in enumerate(new):
  x, y = (i % GRID) * SLOT, (i // GRID) * SLOT
  atlas.paste(t.resize((SLOT, SLOT), Image.LANCZOS), (x, y)); atlas.paste(t, (x + PAD, y + PAD))
  m = (np.asarray(t, dtype=np.float32) / 255).reshape(-1, 3).mean(0)
  meta.append([p, label] + [round(float(c), 3) for c in m]); g2.append(ids.setdefault(piece, len(ids)))
atlas.save(OUT + '/atlas2.webp', 'WEBP', quality=84, method=6)
L.update({'atlas2': ATLAS, 'grid2': GRID, 'r': r, 'tiles2': meta, 'g2': g2})
json.dump(L, open(OUT + '/layout.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print('new tiles', len(new), 'swapped', len(r), 'atlas2 kB', os.path.getsize(OUT + '/atlas2.webp') // 1024)
