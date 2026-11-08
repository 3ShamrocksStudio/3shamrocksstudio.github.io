"""Builds the "Made of the work" photomosaic of Dave for the homepage "20 years" section (rebuilt 8 Nov 2026).
Output: atlas.webp (every tile is a crop of a real piece of Dave's work: current brands, current app screens, and the
best design work from the old 3shamrocks.com Wix site, src/legacy/) + layout.json (tile meta and the desktop/mobile
mosaics: which tile sits where, matched to the colour of that region of Dave's photo).
Rules baked in: no retired branding (old Milo bear, old R&K mascot, old J8NIX/FaiRent mockups, Nature), no tile or piece
of work next to itself, and a hard cap on how often one tile (CAP_TILE) or one piece of work (CAP_PIECE) is reused.
Run from the repo root:  python3 assets/studio/mosaic/build.py"""
import json, os, math, random, heapq, glob
import numpy as np
from PIL import Image, ImageFilter

OUT = 'assets/studio/mosaic'
SLOT, PAD = 76, 3                       # atlas slot and inner padding (keeps mip levels clean)
ATLAS = 2048; GRID = ATLAS // SLOT      # 26 x 26 slots in a power-of-two 2048 atlas, max 676 tiles
CAP_TILE, CAP_PIECE = 10, 24            # max resting placements of one tile / of one piece of work (all its crops)
PRODUCTS = {  # key: (display name, link)
  'sh': ('SH✡MER', 'work/shomer.html'), 'lp': ('LickPick', 'work/lickpick.html'),
  'cr': ('Chore Royale', 'work/chore-royale.html'), 'j8': ('J8NIX', 'work/j8nix.html'),
  'th': ('Trashure Hunters', 'work/trashure-hunters.html'), 'mi': ('Milo', 'work/milo.html'),
  'rk': ('Rookie & King', 'work/rk.html'), 'ez': ('EZRA', 'work/ezra.html'),
  'fr': ('FaiRent', 'work/fairent.html'), 'ap': ('AposHealth', '#experience'), 'vb': ('VIBRANT', '#experience'),
  'st': ('3Shamrocks Studio', '#about'),
}
BV, W, S9, M, H = 'assets/brand-v3/', 'assets/work/', 'assets/studio/s9/', 'assets/studio/marks/', 'assets/studio/home/'
TH, LG, MV = 'th-site/assets/img/', OUT + '/src/legacy/', 'assets/brand-proposals/milo-v2/'
SRC = []  # (product, label, path, mode)   screen: square crops + whole view; logo: contain on dark + light; art: character on dark + light
def A(p, mode, *items):
  for it in items:
    SRC.append((p, it[0], it[1], it[2] if len(it) > 2 else mode))

# --- SH✡MER: app screens, command centre, site, badge, first-aid icons
A('sh', 'screen', ('map', W+'shomer/app-map.webp'), ('around me', W+'shomer/app-around.webp'), ('trusted circles', W+'shomer/app-circles.webp'),
  ('CPR guide', W+'shomer/app-cpr.webp'), ('command dashboard', W+'shomer/command-desktop.webp'), ('command, mobile', W+'shomer/command-mobile.webp'),
  ('website', W+'shomer/site-desktop.webp'), ('website, mobile', W+'shomer/site-mobile.webp'), ('map screen', S9+'sh-map.webp'),
  ('member card', S9+'sh-card.webp'), ('trusted circle', S9+'sh-circle.webp'), ('first-aid steps', S9+'sh-cpr.webp'),
  ('badge', W+'shomer/badge.webp', 'logo'), ('badge', 'assets/studio/logos/shomer.png', 'logo'))
A('sh', 'icon', *[('first-aid icon: ' + n, H + 'sh-guide-%s.webp' % n) for n in ['allergy', 'bleed', 'bone', 'burn', 'call', 'choke', 'cpr', 'heart']])
# --- LickPick
A('lp', 'screen', ('home screen', S9+'lp-home.webp'), ('pick screen', S9+'lp-pick.webp'), ('style screen', S9+'lp-style.webp'),
  ('library', 'lickpick/assets/m_home.jpg'), ('pick a take', 'lickpick/assets/m_pick.jpg'), ('post screen', 'lickpick/assets/m_post.jpg'),
  ('band screen', 'lickpick/assets/m_band.jpg'), ('export screen', 'lickpick/assets/m_export.jpg'), ('landing page', 'lickpick/assets/og.jpg'),
  ('website', W+'lickpick/site-desktop.webp'), ('website, mobile', W+'lickpick/site-mobile.webp'))
A('lp', 'logo', ('app icon', 'lickpick/app/icon-512-v5.png'), ('pick mark', 'lickpick/app/icon-192-v5.png'), ('lockup', 'assets/studio/logos/lickpick-lockup.png'))
# --- Chore Royale
A('cr', 'screen', ('live check', W+'chore-royale/live-check.webp'), ('live duel', W+'chore-royale/live-duel.webp'), ('live grab', W+'chore-royale/live-grab.webp'),
  ('live grid', W+'chore-royale/live-grid.webp'), ('arena screen', S9+'cr-arena.webp'), ('power cards', S9+'cr-cards.webp'), ('chores screen', S9+'cr-chores.webp'),
  ('game, desktop', W+'s16/cr-game-d.webp'), ('game, mobile', W+'s16/cr-game-m.webp'), ('hero', BV+'chore-royale/hero.png'), ('icon set', BV+'chore-royale/icons.png'))
A('cr', 'square', ('crest', W+'chore-royale/crest.jpg'), ('app icon', BV+'chore-royale/app-icon.png'), ('brand card', BV+'chore-royale/brand-card.png'))
A('cr', 'logo', ('logo', BV+'chore-royale/logo-stacked.png'), ('wordmark', BV+'chore-royale/wordmark.png'), ('logo mark', BV+'chore-royale/logo-mark.png'))
# --- Trashure Hunters: current site art (th-site), real screens, plus the best of the old site's character art (src/legacy)
A('th', 'screen', ('map screen', S9+'th-map.webp'), ('hatch screen', S9+'th-hatch.webp'), ('cinematic', S9+'th-cine.webp'),
  ('website', W+'trashure-hunters/site-desktop.webp'), ('website, mobile', W+'trashure-hunters/site-mobile.webp'), ('splash screen', TH+'splash.webp'),
  ('Air map', TH+'map-air.webp'), ('Earth map', TH+'map-earth.webp'), ('Fire map', TH+'map-fire.webp'), ('Water map', TH+'map-water.webp'),
  ('park', TH+'park-bg.webp'), ('character line-up sheet', LG+'th-lineup.webp'), ('brand board', LG+'th-brandboard.webp'), ('app screens', LG+'th-app-screens.webp'))
A('th', 'art', *[(n, TH + f + '.webp') for n, f in [('Blazo', 'blazo'), ('Bloop', 'bloop'), ('Cosmix', 'cosmix'), ('Orbo', 'orbo'), ('Sproutz', 'sproutz'), ('Wispo', 'wispo'),
  ('Cosmic compo', 'compo-cosmic'), ('Fluff compo', 'compo-fluff'), ('Fluid compo', 'compo-fluid'), ('Leaf compo', 'compo-leaf'),
  ('Air egg', 'egg-air'), ('Earth egg', 'egg-earth'), ('Fire egg', 'egg-fire'), ('Space egg', 'egg-space'), ('Water egg', 'egg-water'),
  ('Air Grime', 'gz-air'), ('Earth Grime', 'gz-earth'), ('Fire Grime', 'gz-fire'), ('Space Grime', 'gz-space'), ('King Grime', 'kinggrime'),
  ('asteroid', 'f-asteroid'), ('balloon', 'f-balloon'), ('bubble', 'f-bubble'), ('cloud', 'f-cloud'), ('flame', 'f-flame'), ('jellyfish', 'f-jelly'), ('leaf', 'f-leaf'),
  ('barrel', 'rf-barrel'), ('bottle', 'rf-bottle'), ('charcoal', 'rf-charcoal'), ('debris', 'rf-debris'), ('wrapper', 'rf-wrapper'), ('water gun', 'watergun'),
  ('captured', 'i-captured'), ('Trash-Cam', 'i-trashcam'), ('light cell', 'light-cell')]])
A('th', 'art', ('Cyclops star', LG+'th-star.webp'), ('Trashure Hunters logo', LG+'th-logo-monster.webp'))
A('th', 'dark', *[(l, LG + f + '.webp') for l, f in [ ('Aqua cyclops', 'th-blue'),
  ('Amber cyclops', 'th-amber'), ('Ember cyclops', 'th-orange'), ('Scale cyclops', 'th-scales'), ('Mint cyclops', 'th-ghost'), ('Peach cyclops', 'th-peach'),
  ('Pink cyclops', 'th-pink'), ('Red cyclops', 'th-red'), ('Silver cyclops', 'th-silver'), ('Crowned cyclops', 'th-gold'), ('Teal cyclops', 'th-teal'),
  ('Rainbow cyclops', 'th-rainbow'), ('Litter cyclops', 'th-litter'), ('Lilac cyclops', 'th-lilac'), ('Chrome cyclops', 'th-chrome-green'),
  ('Bubble cyclops', 'th-bubble'), ('Sunny cyclops', 'th-yellow'), ('Water-gun cyclops', 'th-watergun'), ('Ranger cyclops', 'th-ranger')]])
A('th', 'logo', ('logo', TH+'logo.webp'), ('app icon', TH+'th-icon.webp'), ('wordmark', LG+'th-wordmark.webp'), ('Air king', H+'th-king-air.webp', 'art'),
  ('Earth king', H+'th-king-earth.webp', 'art'), ('Fire king', H+'th-king-fire.webp', 'art'), ('Space king', H+'th-king-space.webp', 'art'), ('Water king', H+'th-king-water.webp', 'art'))
# --- J8NIX (current command centre and brand)
A('j8', 'screen', ('command centre', W+'j8nix/cc-overview.webp'), ('project detail', W+'j8nix/cc-detail.webp'), ('prompt forge', W+'j8nix/cc-forge.webp'),
  ('focus view', W+'j8nix/cc-focus.webp'), ('mobile', W+'j8nix/cc-mobile.webp'), ('rail', W+'j8nix/cc-rail.webp'), ('waiting on you', W+'j8nix/cc-waiting.webp'),
  ('forge, output', H+'j8-forge-out.webp'), ('forge, request', H+'j8-forge-req.webp'), ('help', H+'j8-help.webp'), ('brand card', BV+'j8nix/brand-card.png'), ('icon set', BV+'j8nix/icons.png'))
A('j8', 'logo', ('glyph', BV+'j8nix/glyph-peach.png'), ('glyph navy', BV+'j8nix/glyph-navy.png'), ('logo', BV+'j8nix/logo.png'), ('logo on light', BV+'j8nix/logo-on-light.png'),
  ('wordmark', BV+'j8nix/wordmark.png'), ('logo with tagline', 'assets/brand/j8nix-real/logo-tagline.png'))
# --- Milo: only the current brand (pixel polar bear, no sunglasses)
A('mi', 'detail', ('Milo, calm', MV+'character/milo-calm-nochain.png'), ('Milo, breathing', MV+'character/milo-breathe-nochain.png'), ('Milo, proud', MV+'character/milo-proud-nochain.png'))
A('mi', 'square', ('avatar, calm', MV+'character/avatar-calm.png'), ('avatar, breathing', MV+'character/avatar-breathe.png'), ('avatar, proud', MV+'character/avatar-proud.png'),
  ('app icon', MV+'logo/app-icon-1024.png'), ('brand card', MV+'logo/brand-card.png'))
A('mi', 'logo', ('wordmark', MV+'logo/wordmark-pink.png'), ('wordmark on light', MV+'logo/wordmark-pink-deep.png'), ('lockup', MV+'logo/lockup-horizontal-on-dark.png'),
  ('lockup on light', MV+'logo/lockup-horizontal-on-light.png'))
A('mi', 'screen', ('moods', MV+'character/moods-nochain.png'))
# --- Rookie & King (brand-v3/rk and src/rk-board*.webp are kept current by the R&K agent: whatever is there when this runs is what we use)
A('rk', 'square', ('app icon', BV+'rk/app-icon.png'), ('brand card', BV+'rk/brand-card.png'))
A('rk', 'screen', ('the board', OUT+'/src/rk-board-play.webp'), ('hero', BV+'rk/hero.png'), ('icon set', BV+'rk/icons.png'))
A('rk', 'square', ('board close-up', OUT+'/src/rk-board.webp'))
A('rk', 'logo', ('mark', BV+'rk/logo-mark.png'), ('logo', BV+'rk/logo.png'), ('logo on light', BV+'rk/logo-on-light.png'), ('stacked logo', BV+'rk/logo-stacked.png'),
  ('mark, alt', BV+'rk/mark-alt.png'), ('mark, flat', BV+'rk/mark-flat.png'), ('rookie piece', BV+'rk/piece-rookie.png'), ('king piece', BV+'rk/piece-king.png'),
  ('wordmark', BV+'rk/wordmark.png'), ('display wordmark', BV+'rk/wordmark-display.png'))
# --- EZRA
A('ez', 'screen', ('splash screen', S9+'ezra-splash.webp'), ('tasks screen', W+'s16/ez-tasks-v5.webp'), ('hero', BV+'ezra/hero.png'), ('icon set', BV+'ezra/icons.png'))
A('ez', 'square', ('app icon', BV+'ezra/app-icon.png'), ('brand card', BV+'ezra/brand-card.png'))
A('ez', 'logo', ('mark', BV+'ezra/logo-mark.png'), ('logo', BV+'ezra/logo.png'), ('logo on dark', BV+'ezra/logo-on-dark.png'), ('wordmark', 'assets/studio/logos/ezra.png'))
# --- FaiRent (current app screens and brand)
A('fr', 'screen', ('home screen', W+'fairent/app-home.webp'), ('price result', W+'fairent/app-result.webp'), ('message', W+'fairent/app-message.webp'),
  ('data screen', W+'fairent/app-data.webp'), ('compare screen', W+'fairent/app-compare.webp'), ('form screen', W+'fairent/app-form.webp'),
  ('hero', BV+'fairent/hero.png'), ('icon set', BV+'fairent/icons.png'))
A('fr', 'square', ('app icon', BV+'fairent/app-icon.png'), ('brand card', BV+'fairent/brand-card.png'), ('light app icon', BV+'fairent/app-icon-light.png'))
A('fr', 'logo', ('mark', BV+'fairent/logo-mark.png'), ('logo', BV+'fairent/logo.png'), ('logo on dark', BV+'fairent/logo-on-dark.png'))
# --- AposHealth and VIBRANT (HealthTech case work) + the same brands from the old site
A('ap', 'screen', *[('brand work', W+'healthtech/ap-%d.webp' % i) for i in (1, 2, 4, 5, 6)],
  ('companion app', LG+'ap-app.webp'), ('brand system', LG+'ap-brand.webp'), ('website and app', LG+'ap-site.webp'), ('medical icons', LG+'ap-icons.webp'),
  ('foot anatomy', LG+'ap-foot.webp'), ('gait cycle', LG+'ap-gait.webp'), ('logo variations', LG+'ap-marks.webp'), ('print collateral', LG+'ap-docs.webp'))
A('ap', 'logo', ('logo', W+'healthtech/ap-logo.png'), ('logo', LG+'ap-logo.webp'))
A('vb', 'screen', *[('brand work', W+'healthtech/vb-%d.webp' % i) for i in (1, 2, 3, 4, 5, 6)], ('brand book', LG+'vb-brandbook.webp'), ('logo spacing', LG+'vb-spacing.webp'))
A('vb', 'logo', ('logo', W+'healthtech/vb-logo.png'), ('logo', LG+'vb-logo.webp'), ('white logo', M+'vibrant-white.png'))
# --- 3Shamrocks Studio: marks and design work from the old 3shamrocks.com
A('st', 'logo', ('wordmark', LG+'st-wordmark.webp'), ('heart mark', LG+'st-heart.webp', 'art'), ('home icon', LG+'st-home-icon.webp', 'art'),
  ('Media Network mark', 'assets/studio/logos/media-network.png'), ('shamrock mark', 'assets/studio/heart-on-dark.png'))
A('st', 'screen', ('studio site', LG+'st-laptop.webp'), ('shamrock keeper', LG+'st-forest.webp'), ('shamrock grove', LG+'st-mushroom.webp'),
  ("tee: On Slater's Mind", LG+'tee-face.webp'), ("tee: On Slater's Mind", LG+'tee-face-white.webp'), ('tee: galaxy', LG+'tee-galaxy.webp'), ('tee: ocean', LG+'tee-ocean.webp'),
  ('tee: surf', LG+'tee-surf.webp'), ('tee: sunset', LG+'tee-sunset.webp'), ('tee: bloom', LG+'tee-bloom.webp'))
# pieces that are the same artwork under another file: one piece in the exploded grid (layout.json 'g')
SAME = [[W+'shomer/badge.webp', 'assets/studio/logos/shomer.png'], [LG+'ap-logo.webp', W+'healthtech/ap-logo.png'],
        [LG+'vb-logo.webp', W+'healthtech/vb-logo.png', M+'vibrant-white.png'], [LG+'st-heart.webp', 'assets/studio/heart-on-dark.png'], [LG+'ap-brand.webp', W+'healthtech/ap-5.webp'], [LG+'th-wordmark.webp', TH+'logo.webp']]
PIECE = {q: g[0] for g in SAME for q in g}
C = SLOT - 2 * PAD
DARK, LIGHT = (16, 12, 30), (240, 238, 246)

def on_bg(im, col):
  bg = Image.new('RGBA', im.size, col + (255,)); bg.alpha_composite(im); return bg.convert('RGB')

def contain(im, col, f=.86):
  im = im.copy(); im.thumbnail((int(C * f), int(C * f)), Image.LANCZOS)
  bg = Image.new('RGBA', (C, C), col + (255,)); bg.alpha_composite(im, ((C - im.width) // 2, (C - im.height) // 2)); return bg.convert('RGB')

def crops(im, n):
  w, h = im.size; s = min(w, h); out = []
  for k in range(n):
    t = (k + .5) / n
    x = int((w - s) * t) if w > h else 0; y = int((h - s) * t) if h > w else 0
    out.append(im.crop((x, y, x + s, y + s)).resize((C, C), Image.LANCZOS))
  return out

def has_alpha(im): return im.getchannel('A').getextrema()[0] < 250

def tiles_of(path, mode):
  im = Image.open(path).convert('RGBA'); im.thumbnail((1600, 1600), Image.LANCZOS)
  if mode in ('logo', 'art', 'icon'):
    f = .86 if mode == 'logo' else .94
    if has_alpha(im): return [contain(im, DARK, f), contain(im, LIGHT, f)]
    return [contain(im, tuple(im.getpixel((2, 2))[:3]), f)]   # opaque artwork: pad with its own background colour
  if mode == 'dark': return [contain(im, DARK, .94)]
  if mode == 'square': return crops(on_bg(im, DARK), 1)
  if mode == 'detail':  # whole character plus two close-ups (face, popsicle): three distinct tiles of one piece
    rgb = on_bg(im, DARK); w, h = rgb.size
    return [rgb.resize((C, C), Image.LANCZOS)] + [rgb.crop((int(w * a), int(h * b), int(w * c), int(h * d))).resize((C, C), Image.LANCZOS)
                                                  for a, b, c, d in ((.14, .06, .70, .62), (.46, .38, 1., .94))]
  rgb = on_bg(im, DARK); w, h = rgb.size; r = max(w, h) / min(w, h)
  v = crops(rgb, 1 if r < 1.25 else 2 if r < 2 else 3 if r < 3 else 4)
  if r >= 1.25: v.append(contain(im, (22, 18, 38)))
  if mode == 'screen' and float(np.asarray(rgb.resize((32, 32)), dtype=np.float32).mean() / 255) < .3:
    # dark screens get two close-ups (2x zoom on the busiest quarters): the beard and suit need many quiet dark tiles
    s_ = min(w, h) // 2; best = []
    for yy in range(0, h - s_ + 1, max(1, (h - s_) // 3 or 1)):
      for xx in range(0, w - s_ + 1, max(1, (w - s_) // 3 or 1)):
        c = rgb.crop((xx, yy, xx + s_, yy + s_)).resize((C, C), Image.LANCZOS); a_ = np.asarray(c, dtype=np.float32) / 255
        best.append((float(a_.std()) * (1 if a_.mean() < .35 else .3), xx, yy, c))
    best.sort(key=lambda b_: -b_[0]); picked = []
    for sc, xx, yy, c in best:
      if all(abs(xx - px) + abs(yy - py) > s_ * .6 for _, px, py, _ in picked): picked.append((sc, xx, yy, c))
      if len(picked) == 2: break
    v += [c for _, _, _, c in picked]
  return v

def busy(t):  # share of pixels that differ from the tile's own background: whole-logo tiles that are mostly empty are dropped
  a = np.asarray(t, dtype=np.int16); return float((np.abs(a - a[2, 2]).max(2) > 28).mean())

tiles, missing, dropped = [], [], 0
for p, label, path, mode in SRC:
  if not os.path.exists(path): missing.append(path); continue
  vs = tiles_of(path, mode)
  for t in vs:
    if mode in ('logo', 'art', 'icon') and len(vs) > 1 and t is not vs[0] and busy(t) < .16: dropped += 1; continue   # keep the dark view of every piece
    tiles.append((p, label, t, PIECE.get(path, path)))
print('sources', len(SRC) - len(missing), 'missing', missing, 'tiles', len(tiles), 'mostly-empty dropped', dropped)
if len(tiles) > GRID * GRID:  # too many: drop the extra whole-view variants first, from the busiest products
  raise SystemExit('too many tiles %d > %d' % (len(tiles), GRID * GRID))
# near-duplicate tiles (same pixels after the resize) are dropped
seen, uniq = set(), []
for tt in tiles:
  k = np.asarray(tt[2].resize((12, 12), Image.BILINEAR)).tobytes()
  if k in seen: continue
  seen.add(k); uniq.append(tt)
print('after de-dup', len(uniq)); tiles = uniq
from collections import Counter; print(dict(Counter(t[0] for t in tiles)))

atlas = Image.new('RGB', (ATLAS, ATLAS), DARK)
meta = []
for i, (p, label, t, _) in enumerate(tiles):
  x, y = (i % GRID) * SLOT, (i // GRID) * SLOT
  edge = t.resize((SLOT, SLOT), Image.LANCZOS)          # bleed edge pixels into the padding
  atlas.paste(edge, (x, y)); atlas.paste(t, (x + PAD, y + PAD))
  a = np.asarray(t, dtype=np.float32) / 255
  q = a.reshape(2, C // 2, 2, C // 2, 3).mean((1, 3)).reshape(4, 3)
  meta.append({'p': p, 'l': label, 'm': [round(float(c), 3) for c in a.reshape(-1, 3).mean(0)], 'q': q,
               'sd': float((a @ np.array([.299, .587, .114])).std())})
atlas.save(OUT + '/atlas.webp', 'WEBP', quality=80, method=6)
print('atlas kB', os.path.getsize(OUT + '/atlas.webp') // 1024)
pieceid = {}; G = [pieceid.setdefault(t[3], len(pieceid)) for t in tiles]
print('pieces', len(pieceid))

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
Y0 = 410  # lower half (beard, shirt, suit): matched on a levels curve so dark tones separate
def levels(c, lo=.025, hi=.80, gam=1.12):
  return np.clip((c - lo) / (hi - lo), 0, 1) ** gam
match_lo = levels(photo)

def geometry(N, base_cols, min_div):
  S0 = PW / base_cols; rows = math.ceil(PH / S0)
  cells = [(c * S0, r * S0, S0) for r in range(rows) for c in range(base_cols)]
  def score(c):
    x, y, s = c
    if s / 2 < S0 / min_div - 1e-6: return -1
    sl = (slice(int(y), min(PH, int(y + s))), slice(int(x), min(PW, int(x + s))))
    if energy[sl].size == 0: return -1
    return (energy[sl].mean() + 4) * (1 + 5 * face[sl].mean()) * (alpha[sl].mean() + .15) * s * s
  h = [(-score(c), i, c) for i, c in enumerate(cells)]; heapq.heapify(h); out = []; k = len(h)
  while len(h) + len(out) < N and h:
    sc, _, c = heapq.heappop(h)
    if sc >= 0: out.append(c); continue
    x, y, s = c; s2 = s / 2
    for d in [(0, 0), (s2, 0), (0, s2), (s2, s2)]:
      k += 1; n = (x + d[0], y + d[1], s2); heapq.heappush(h, (-score(n), k, n))
  cells = out + [c for _, _, c in h]
  cells = [c for c in cells if c[0] < PW and c[1] < PH]
  out = []
  for x, y, s in cells:
    sl = (slice(int(y), min(PH, int(y + s))), slice(int(x), min(PW, int(x + s))))
    fig, sub = alpha[sl].mean(), lum[sl]
    split = y >= Y0 - 1e-6 and fig > .5 and (s > S0 * .75 or (s > S0 * .375 and face[sl].mean() > .25 and sub.std() > .07))
    if split: out += [(x + dx, y + dy, s / 2) for dy in (0, s / 2) for dx in (0, s / 2) if x + dx < PW and y + dy < PH - .5]
    else: out.append((x, y, s))
  return out

PK = list(PRODUCTS); TP = np.array([PK.index(m['p']) for m in meta]); TG = np.array(G)
TM = np.array([m['m'] for m in meta]); TQ = np.array([m['q'] for m in meta]); TS = np.array([m['sd'] for m in meta])
TMl, TQl = levels(TM), levels(TQ)
TL = TM @ np.array([.299, .587, .114])

def layout(N, base_cols, min_div, seed):
  cells = geometry(N, base_cols, min_div); n = len(cells)
  X = np.array([c[0] for c in cells]); Y = np.array([c[1] for c in cells]); Sz = np.array([c[2] for c in cells])
  eps = Sz.min() * .08
  def sl_of(x, y, s): return (slice(int(y), min(PH, int(round(y + s)))), slice(int(x), min(PW, int(round(x + s)))))
  fcell = np.array([face[sl_of(*c)].mean() + alpha[sl_of(*c)].mean() * .5 for c in cells])
  order = np.argsort(-fcell, kind='stable')   # the face and figure first, so they get the best match; backdrop last
  rnd = random.Random(seed)
  pc = np.zeros(len(PK)); PCAP = .2 * n   # no product takes more than 20% of the cells
  ua = np.zeros(len(meta)); ub = np.zeros(len(meta)); up = np.zeros(len(pieceid)); pused = np.zeros(len(PK))
  A_, B_ = np.full(n, -1), np.full(n, -1); res = [None] * n
  relaxed = 0
  for ci in order:
    x, y, s = cells[ci]; sl = sl_of(x, y, s)
    nb = np.where((X < x + s + eps) & (X + Sz > x - eps) & (Y < y + s + eps) & (Y + Sz > y - eps))[0]
    nb = nb[nb != ci]
    nbt = [t for t in np.concatenate([A_[nb], B_[nb]]) if t >= 0]
    banned = np.zeros(len(meta), bool); banned[nbt] = True
    banned |= np.isin(TG, TG[nbt]) if nbt else False   # the same piece of work never touches itself either
    low = y >= Y0 - 1e-6
    reg = (match_lo if low else photo)[sl]; hh, ww = reg.shape[:2]
    mean = photo[sl].reshape(-1, 3).mean(0); mm = reg.reshape(-1, 3).mean(0)
    q = np.array([reg[:max(1, hh // 2), :max(1, ww // 2)].reshape(-1, 3).mean(0), reg[:max(1, hh // 2), ww // 2:].reshape(-1, 3).mean(0) if ww > 1 else mm,
                  reg[hh // 2:, :max(1, ww // 2)].reshape(-1, 3).mean(0) if hh > 1 else mm, reg[hh // 2:, ww // 2:].reshape(-1, 3).mean(0) if hh > 1 and ww > 1 else mm])
    fig = alpha[sl].mean()
    rn = np.array([rnd.random() for _ in meta])
    if not low:
      d = ((TQ - q) ** 2).sum((1, 2)) + 2 * ((TM - mean) ** 2).sum(1) + .045 * ua + rn * .012
    else:
      dk = 1 - min(1, float(mm @ np.array([.299, .587, .114])) / .45)
      # dark tones: favour quiet tiles (their detail is what turns the beard and suit muddy)
      d = (((TQl - q) ** 2).sum((1, 2)) + 3 * ((TMl - mm) ** 2).sum(1) + (.02 + .5 * dk) * TS ** 2 + .04 * ua + rn * .006)
    if fig < .3:   # backdrop cells show the work in its own colours (dimmed), so spread them across every product
      d = .03 * d + .004 * pused[TP] + .006 * ua + 1.2 * np.maximum(0, TL - .3) ** 2 + rn * .02   # keep the backdrop moody: pale tiles go to the face
    def pick(extra_ban, cnt, cap):
      ok = ~banned & ~extra_ban & (cnt < cap) & (up[TG] < CAP_PIECE) & (pc[TP] < PCAP)
      if not ok.any(): ok = ~banned & ~extra_ban & (cnt < cap) & (up[TG] < CAP_PIECE)   # relax: product share, then piece cap
      if not ok.any(): ok = ~banned & ~extra_ban & (cnt < cap)
      if not ok.any(): return None
      dd = np.where(ok, d, 1e9); return int(np.argmin(dd))
    a = pick(np.zeros(len(meta), bool), ua, CAP_TILE)
    if a is None: a = int(np.argmin(np.where(~banned, d, 1e9))); relaxed += 1
    xb = np.zeros(len(meta), bool); xb[a] = True; xb |= TG == TG[a]
    # the alternate (shown when the tile flips) is a good match too, but a different piece
    top = np.argsort(np.where(~banned & ~xb & (ub < CAP_TILE), d, 1e9))[:3]
    b = int(top[rnd.randrange(len(top))])
    ua[a] += 1; ub[b] += 1; up[TG[a]] += 1; pc[TP[a]] += 1
    if fig < .3: pused[TP[a]] += 1
    A_[ci], B_[ci] = a, b
    res[ci] = [round(x / PW, 5), round(y / PW, 5), round(s / PW, 5), a, b] + [round(float(c), 3) for c in mean] + [round(float(fig), 2)]
  res.sort(key=lambda r: (r[1], r[0]))
  return res, ua, ub, up, relaxed

desk, uad, ubd, upd, rl1 = layout(1400, 22, 4, 7); mob, uam, ubm, upm, rl2 = layout(950, 18, 4, 11)
print('desktop cells', len(desk), 'mobile cells', len(mob), 'relaxed', rl1, rl2)
for nm, ua_, ub_, up_ in (('desktop', uad, ubd, upd), ('mobile', uam, ubm, upm)):
  print(nm, 'tiles at rest', int((ua_ > 0).sum()), 'tiles incl. flips', int(((ua_ + ub_) > 0).sum()), 'max tile use', int(ua_.max()), 'max flip use', int(ub_.max()), 'max piece use', int(up_.max()))
used = set(r[3] for r in desk + mob) | set(r[4] for r in desk + mob)
from collections import Counter; sh = Counter(meta[r[3]]['p'] for r in desk); print('desktop cell share by product', {k: round(v / len(desk), 2) for k, v in sh.items()})
print('unique tiles used', len(used), 'unique pieces used', len(set(G[t] for t in used)))
json.dump({'v': 2, 'atlas': ATLAS, 'aspect': PH / PW, 'slot': SLOT, 'pad': PAD, 'grid': GRID, 'cap': [CAP_TILE, CAP_PIECE],
           'products': {k: {'n': v[0], 'h': v[1]} for k, v in PRODUCTS.items()},
           'tiles': [[m['p'], m['l']] + m['m'] for m in meta], 'g': G,
           'desktop': desk, 'mobile': mob}, open(OUT + '/layout.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print('layout kB', os.path.getsize(OUT + '/layout.json') // 1024)
