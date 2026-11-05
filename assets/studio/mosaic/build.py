"""Builds the "Made of the work" photomosaic of Dave for the homepage "20 years" section.
Output: atlas.webp (every tile is a crop of a real portfolio asset) + layout.json (tile meta and the
desktop/mobile mosaics: which asset sits where, matched to the colour of that region of Dave's photo).
Run from the repo root:  python3 assets/studio/mosaic/build.py [path-to-shomer-app-repo]"""
import json, sys, os, math, random
import numpy as np
from PIL import Image, ImageFilter

SH = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/shomer-app'
OUT = 'assets/studio/mosaic'
SLOT, PAD = 112, 3                      # atlas slot and inner padding (keeps mip levels clean)
ATLAS = 2048; GRID = ATLAS // SLOT        # 18 x 18 slots in a power-of-two 2048 atlas, max 324 tiles
PRODUCTS = {  # key: (display name, link)
  'sh': ('SH✡MER', 'work/shomer.html'), 'lp': ('LickPick', 'work/lickpick.html'),
  'cr': ('Chore Royale', 'work/chore-royale.html'), 'j8': ('J8NIX', 'work/j8nix.html'),
  'th': ('Trashure Hunters', 'work/trashure-hunters.html'), 'mi': ('Milo', 'work/milo.html'),
  'rk': ('Rookie & King', 'work/rk.html'), 'ez': ('EZRA', 'work/ezra.html'),
  'fr': ('FaiRent', 'work/fairent.html'), 'ap': ('AposHealth', '#experience'), 'vb': ('VIBRANT', '#experience'),
}
S9, BV, W, M = 'assets/studio/s9/', 'assets/brand-v3/', 'assets/work/', 'assets/studio/marks/'
SRC = [  # (product, label, path, mode)  mode: screen = several square crops + whole view; logo = contain on dark and light
  ('sh','map screen',S9+'sh-map.webp','screen'),('sh','member card',S9+'sh-card.webp','screen'),
  ('sh','trusted circle',S9+'sh-circle.webp','screen'),('sh','CPR guide',S9+'sh-cpr.webp','screen'),
  ('sh','command dashboard',W+'shomer/command-desktop.webp','screen'),('sh','command, mobile',W+'shomer/command-mobile.webp','screen'),
  ('sh','campaign key visual',W+'shomer/keyvisual.webp','screen'),('sh','campaign scene',W+'shomer/scene-s1.webp','screen'),
  ('sh','campaign scene',W+'shomer/scene-s2.webp','screen'),('sh','campaign scene',W+'shomer/scene-s3.webp','screen'),
  ('sh','website',W+'shomer/site-mobile.webp','screen'),('sh','badge',W+'shomer/badge.webp','logo'),
  ('sh','app icon',SH+'/logo-512.png','square'),('sh','SOS icon',SH+'/sos-icon-96.png','logo'),
  ('sh','report icon',SH+'/report-icon-96.png','logo'),('sh','Nature badge',SH+'/nature-badge.png','logo'),
  ('lp','home screen',S9+'lp-home.webp','screen'),('lp','pick screen',S9+'lp-pick.webp','screen'),
  ('lp','style screen',S9+'lp-style.webp','screen'),('lp','band screen','assets/brand/lickpick/m_band.jpg','screen'),
  ('lp','export screen','assets/brand/lickpick/m_export.jpg','screen'),('lp','website',W+'lickpick/site-mobile.webp','screen'),
  ('lp','app icon','lickpick/app/icon-512-v5.png','logo'),
  ('cr','arena screen',S9+'cr-arena.webp','screen'),('cr','power cards',S9+'cr-cards.webp','screen'),
  ('cr','chores screen',S9+'cr-chores.webp','screen'),('cr','spin screen',W+'chore-royale/scr-spin.jpg','screen'),
  ('cr','clan screen',W+'chore-royale/scr-clan.jpg','screen'),('cr','wheel screen',W+'chore-royale/scr-wheel.jpg','screen'),
  ('cr','crest',W+'chore-royale/crest.jpg','square'),('cr','app icon',BV+'chore-royale/app-icon.png','square'),
  ('cr','logo mark',BV+'chore-royale/logo-mark.png','logo'),('cr','brand card',BV+'chore-royale/brand-card.png','square'),
  ('cr','hero',BV+'chore-royale/hero.png','screen'),('cr','icon set',BV+'chore-royale/icons.png','screen'),
  ('j8','dashboard',S9+'j8-dash.webp','screen'),('j8','project detail',S9+'j8-detail.webp','screen'),
  ('j8','forge screen',S9+'j8-forge.webp','screen'),('j8','glyph',BV+'j8nix/glyph-peach.png','logo'),
  ('j8','glyph',BV+'j8nix/glyph-white.png','logo'),('j8','brand card',BV+'j8nix/brand-card.png','square'),
  ('j8','logo',BV+'j8nix/logo.png','logo'),('j8','icon set',BV+'j8nix/icons.png','screen'),
  ('th','map screen',S9+'th-map.webp','screen'),('th','hatch screen',S9+'th-hatch.webp','screen'),
  ('th','cinematic',S9+'th-cine.webp','screen'),('th','Air character',W+'trashure/air_lvl1.png','logo'),
  ('th','Earth character',W+'trashure/earth_lvl1.png','logo'),('th','Fire character',W+'trashure/fire_lvl1.png','logo'),
  ('th','Water character',W+'trashure/water_lvl1.png','logo'),('th','Space character',W+'trashure/space_lvl1.png','logo'),
  ('th','King Grime',W+'trashure/kingGrime.png','logo'),('th','the team',W+'trashure/hero-group.png','square'),
  ('th','choose your team',W+'trashure/chooseteam.jpg','screen'),('th','splash screen',W+'trashure/splashscreen.png','screen'),
  ('th','app icon',M+'th-icon.webp','square'),('th','website',W+'trashure-hunters/site-mobile.webp','screen'),
  ('mi','moods screen',S9+'milo-moods.webp','screen'),('mi','splash screen',S9+'milo-splash.webp','screen'),
  ('mi','app icon',BV+'milo/app-icon.png','square'),('mi','brand card',BV+'milo/brand-card.png','square'),
  ('mi','expressions',BV+'milo/expressions.png','screen'),('mi','hero',BV+'milo/hero.png','screen'),
  ('rk','duo screen',S9+'rk-duo.webp','screen'),('rk','splash screen',S9+'rk-splash.webp','screen'),
  ('rk','app icon',BV+'rk/app-icon.png','square'),('rk','mascot',BV+'rk/mascot.png','logo'),
  ('rk','brand card',BV+'rk/brand-card.png','square'),('rk','hero',BV+'rk/hero.png','screen'),
  ('ez','splash screen',S9+'ezra-splash.webp','screen'),('ez','tasks screen',S9+'ezra-tasks.webp','screen'),
  ('ez','app icon',BV+'ezra/app-icon.png','square'),('ez','brand card',BV+'ezra/brand-card.png','square'),
  ('ez','hero',BV+'ezra/hero.png','screen'),('ez','icon set',BV+'ezra/icons.png','screen'),
  ('fr','home screen',S9+'fr-hero.webp','screen'),('fr','price result',S9+'fr-result.webp','screen'),
  ('fr','message script',S9+'fr-script.webp','screen'),('fr','data screen',W+'fairent/scr-data.jpg','screen'),
  ('fr','app icon',BV+'fairent/app-icon.png','square'),('fr','brand card',BV+'fairent/brand-card.png','square'),
  ('fr','hero',BV+'fairent/hero.png','screen'),('fr','landing page',W+'s16/fr-land-d.webp','screen'),
  ('ap','brand system',S9+'ap-brand.webp','screen'),('ap','gait cycle',S9+'ap-gait.webp','screen'),
  ('ap','icon set',S9+'ap-icons.webp','screen'),('ap','logo',S9+'ap-logo.webp','screen'),
  ('ap','campaign',W+'aposhealth/screen-4.png','screen'),('ap','campaign',W+'aposhealth/screen-5.png','screen'),
  ('ap','campaign',W+'aposhealth/screen-6.png','screen'),
  ('vb','companion app',S9+'vb-app.webp','screen'),('vb','brand book',S9+'vb-brand.webp','screen'),
  ('vb','icon set',S9+'vb-icons.webp','screen'),('vb','logo',S9+'vb-logo.webp','screen'),
  ('vb','brand book',W+'vibrant/screen-1.png','screen'),('vb','brand book',W+'vibrant/screen-3.png','screen'),
  ('vb','brand book',W+'vibrant/screen-5.png','screen'),
]
C = SLOT - 2 * PAD

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

tiles = []
for p, label, path, mode in SRC:
  im = Image.open(path).convert('RGBA')
  if mode == 'logo':
    v = [contain(im, (16, 12, 30)), contain(im, (240, 238, 246))]
  elif mode == 'square':
    v = crops(on_bg(im, (16, 12, 30)), 1)
  else:
    rgb = on_bg(im, (16, 12, 30)); w, h = rgb.size; r = max(w, h) / min(w, h)
    n = 1 if r < 1.25 else 2 if r < 2 else 3 if r < 3 else 4
    v = crops(rgb, n)
    if r >= 1.25: v.append(contain(im, (22, 18, 38)))
  for t in v: tiles.append((p, label, t))
print('tiles', len(tiles))
assert len(tiles) <= GRID * GRID, len(tiles)

atlas = Image.new('RGB', (ATLAS, ATLAS), (16, 12, 30))
meta = []
for i, (p, label, t) in enumerate(tiles):
  x, y = (i % GRID) * SLOT, (i // GRID) * SLOT
  edge = t.resize((SLOT, SLOT), Image.LANCZOS)          # bleed edge pixels into the padding
  atlas.paste(edge, (x, y)); atlas.paste(t, (x + PAD, y + PAD))
  a = np.asarray(t, dtype=np.float32) / 255
  q = a.reshape(2, C // 2, 2, C // 2, 3).mean((1, 3)).reshape(4, 3)
  meta.append({'p': p, 'l': label, 'm': [round(float(c), 3) for c in a.reshape(-1, 3).mean(0)], 'q': q})
atlas.save(OUT + '/atlas.webp', 'WEBP', quality=84, method=6)
print('atlas kB', os.path.getsize(OUT + '/atlas.webp') // 1024)

# --- target: Dave's real photo (cut-out) over the section's own backdrop gradient ---
cut = Image.open('assets/studio/dave-portrait-cut.webp').convert('RGBA'); PW, PH = cut.size
g = np.linspace(0, 1, PH)[:, None, None]
grad = (np.array([42, 26, 82]) * (1 - g) + np.array([22, 13, 51]) * g) * np.ones((PH, PW, 3))
bg = Image.fromarray(grad.astype(np.uint8)).convert('RGBA'); bg.alpha_composite(cut)
photo = np.asarray(bg.convert('RGB'), dtype=np.float32) / 255
alpha = np.asarray(cut, dtype=np.float32)[..., 3] / 255
lum = photo @ np.array([.299, .587, .114])
gy, gx = np.gradient(np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32))
energy = np.hypot(gx, gy)
yy, xx = np.mgrid[0:PH, 0:PW]
face = np.exp(-(((xx - 400) / 150) ** 2 + ((yy - 300) / 230) ** 2))   # head + beard region of this photo

def layout(N, base_cols, min_div, seed):
  S0 = PW / base_cols; rows = math.ceil(PH / S0)
  cells = [(c * S0, r * S0, S0) for r in range(rows) for c in range(base_cols)]
  def score(c):
    x, y, s = c
    if s / 2 < S0 / min_div - 1e-6: return -1
    sl = (slice(int(y), min(PH, int(y + s))), slice(int(x), min(PW, int(x + s))))
    if energy[sl].size == 0: return -1
    return (energy[sl].mean() + 4) * (1 + 5 * face[sl].mean()) * (alpha[sl].mean() + .15) * s * s
  import heapq
  h = [(-score(c), i, c) for i, c in enumerate(cells)]; heapq.heapify(h); out = []; k = len(h)
  while len(h) + len(out) < N and h:
    sc, _, c = heapq.heappop(h)
    if sc >= 0: out.append(c); continue
    x, y, s = c; s2 = s / 2
    for d in [(0, 0), (s2, 0), (0, s2), (s2, s2)]:
      k += 1; n = (x + d[0], y + d[1], s2); heapq.heappush(h, (-score(n), k, n))
  cells = out + [c for _, _, c in h]
  cells = [c for c in cells if c[0] < PW and c[1] < PH]
  rnd = random.Random(seed); used = np.zeros(len(meta)); res = []
  PK = list(PRODUCTS); TP = np.array([PK.index(m['p']) for m in meta]); pused = np.zeros(len(PK))
  TM = np.array([m['m'] for m in meta]); TQ = np.array([m['q'] for m in meta])
  for x, y, s in sorted(cells, key=lambda c: (c[1], c[0])):
    sl = (slice(int(y), min(PH, int(round(y + s)))), slice(int(x), min(PW, int(round(x + s)))))
    reg = photo[sl]; hh, ww = reg.shape[:2]
    mean = reg.reshape(-1, 3).mean(0)
    q = np.array([reg[:max(1, hh // 2), :max(1, ww // 2)].reshape(-1, 3).mean(0), reg[:max(1, hh // 2), ww // 2:].reshape(-1, 3).mean(0) if ww > 1 else mean,
                  reg[hh // 2:, :max(1, ww // 2)].reshape(-1, 3).mean(0) if hh > 1 else mean, reg[hh // 2:, ww // 2:].reshape(-1, 3).mean(0) if hh > 1 and ww > 1 else mean])
    fig = alpha[sl].mean()
    d = ((TQ - q) ** 2).sum((1, 2)) + 2 * ((TM - mean) ** 2).sum(1) + .02 * used + np.array([rnd.random() for _ in meta]) * .01
    if fig < .3:   # backdrop cells show the work in its own colours (dimmed), so spread them across every product
      d = .03 * d + .01 * pused[TP] + .03 * used
    o = np.argsort(d); a, b = int(o[0]), int(o[1 + rnd.randrange(3)])
    used[a] += 1
    if fig < .3: pused[TP[a]] += 1
    res.append([round(x / PW, 5), round(y / PW, 5), round(s / PW, 5), a, b] + [round(float(c), 3) for c in mean] + [round(float(alpha[sl].mean()), 2)])
  return res

desk = layout(1400, 22, 4, 7); mob = layout(950, 18, 4, 11)
print('desktop', len(desk), 'mobile', len(mob))
json.dump({'v': 1, 'atlas': ATLAS, 'aspect': PH / PW, 'slot': SLOT, 'pad': PAD, 'grid': GRID,
           'products': {k: {'n': v[0], 'h': v[1]} for k, v in PRODUCTS.items()},
           'tiles': [[m['p'], m['l']] + m['m'] for m in meta],
           'desktop': desk, 'mobile': mob}, open(OUT + '/layout.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print('layout kB', os.path.getsize(OUT + '/layout.json') // 1024)
