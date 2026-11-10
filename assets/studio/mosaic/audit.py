"""Mosaic v5 asset audit (10 Nov 2026). Indexes every raster image in the repo once (size, cut-out bounds, perceptual
hash, sharpness, darkness / flatness), then audits the sources build.py lists: for each one it finds the sharpest,
largest copy of the same artwork anywhere in the repo, flags duplicates (same perceptual hash), near-blank / near-black
/ placeholder images and anything below the quality bar. Writes audit.json (machine) and prints a summary.
Run from the repo root:  python3 assets/studio/mosaic/audit.py"""
import json, os, sys
import numpy as np
import cv2
from PIL import Image

OUT = 'assets/studio/mosaic'
CACHE = OUT + '/.index-cache-v3.json'
SKIP_DIRS = ('./.git', './node_modules', './assets/studio/mosaic/lib', './.claude')
EXT = ('.png', '.jpg', '.jpeg', '.webp')

# quality bar (grid cells show at ~240 CSS px, 2x screens: ~480 device px; the viewer shows them up to ~1000 px)
BAR_OPAQUE_SHORT = 600   # screens, boards, photos: shorter side
BAR_CUT_LONG = 512       # cut-outs (logos, characters, icons): longer side of the trimmed artwork
BAR_SHARP = .09          # edge steepness (see stats): below this the file is an upscale or blurry


def phash(gray):
  g = cv2.resize(gray, (32, 32), interpolation=cv2.INTER_AREA).astype(np.float32)
  d = cv2.dct(g)[:8, :8].ravel()[1:]
  return ''.join('1' if v > np.median(d) else '0' for v in d)


def stats(path):
  im = Image.open(path); im.load()
  w, h = im.size
  rgba = im.convert('RGBA')
  a = np.asarray(rgba.getchannel('A'))
  cut = bool(a.min() < 250)
  box = None
  if cut:
    b = Image.fromarray((a > 24).astype(np.uint8) * 255).getbbox()
    box = list(b) if b else None
  # composite on mid grey so cut-outs hash by their shape, not by an arbitrary background
  bg = Image.new('RGBA', rgba.size, (128, 128, 128, 255)); bg.alpha_composite(rgba)
  rgb = np.asarray(bg.convert('RGB'))
  if box: rgb = rgb[box[1]:box[3], box[0]:box[2]]
  gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY) if rgb.size else np.zeros((8, 8), np.uint8)
  # sharpness: steepness of the strongest edges (99th percentile one-pixel step). Crisp art and screens: 0.3 to 0.9;
  # upscaled or blurred files spread every edge over several pixels: under 0.1
  g = gray.astype(np.float32) / 255
  st_ = np.concatenate([np.abs(np.diff(g, axis=1)).ravel(), np.abs(np.diff(g, axis=0)).ravel()]) if min(g.shape) >= 2 else np.zeros(1)
  st_ = st_[st_ > .02]
  sharp = float(np.percentile(st_, 99)) if st_.size >= 50 else 0.
  lum = g
  opaque = (np.asarray(rgba.getchannel('A')) > 128)
  if box: opaque = opaque[box[1]:box[3], box[0]:box[2]]
  m = opaque if opaque.any() else np.ones_like(lum, bool)
  cs = [int(v) for v in cv2.resize(rgb, (4, 4), interpolation=cv2.INTER_AREA).ravel()] if rgb.size else [0] * 48   # 4x4 colour signature
  return {'w': w, 'h': h, 'cut': cut, 'box': box, 'ph': phash(gray), 'cs': cs, 'sharp': round(sharp, 4),
          'mean': round(float(lum[m].mean()), 3), 'std': round(float(lum[m].std()), 3), 'kb': os.path.getsize(path) // 1024}


def index_repo():
  cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
  out = {}
  for root, dirs, files in os.walk('.'):
    if root.startswith(SKIP_DIRS): dirs[:] = []; continue
    for f in files:
      if not f.lower().endswith(EXT): continue
      p = os.path.join(root, f)[2:]
      st = os.stat(p); key = '%s|%d|%d' % (p, st.st_size, int(st.st_mtime))
      if key in cache: out[p] = cache[key]; continue
      try: out[p] = stats(p)
      except Exception as e: print('skip', p, e, file=sys.stderr); continue
      cache[key] = out[p]
  json.dump(cache, open(CACHE, 'w'))
  return out


def ham(a, b): return sum(x != y for x, y in zip(a, b))


def same_art(s, t):
  """the same artwork in another file or size: shape hash within 6 bits, same aspect, same colours (4x4 grid)"""
  if ham(s['ph'], t['ph']) > 6: return False
  (aw, ah), (bw, bh) = eff_size(s), eff_size(t)
  if abs((aw / max(1, ah)) / (bw / max(1, bh)) - 1) > .05: return False
  return float(np.abs(np.array(s['cs'], float) - np.array(t['cs'], float)).mean()) < 14


def eff_size(s):
  if s['cut'] and s['box']: bw, bh = s['box'][2] - s['box'][0], s['box'][3] - s['box'][1]
  else: bw, bh = s['w'], s['h']
  return bw, bh


def verdict(s):
  bw, bh = eff_size(s)
  why = []
  if not s['cut'] and s['std'] < .035: why.append('flat / placeholder')   # one-colour cut-out logos are fine
  if not s['cut'] and s['mean'] < .07 and s['std'] < .08: why.append('near-black')
  if s['cut']:
    if max(bw, bh) < BAR_CUT_LONG: why.append('cut-out < %d px' % BAR_CUT_LONG)
  else:
    if max(bw, bh) / max(1, min(bw, bh)) >= 1.8:   # tall phone screens and wide banners: they show by their long side
      if max(bw, bh) < 1080 or min(bw, bh) < 500: why.append('long side < 1080 px or short side < 500 px')
    elif min(bw, bh) < BAR_OPAQUE_SHORT: why.append('short side < %d px' % BAR_OPAQUE_SHORT)
  if s['sharp'] < BAR_SHARP: why.append('blurry / upscaled')
  return why


if __name__ == '__main__':
  IDX = index_repo()
  print('indexed', len(IDX))
  json.dump(IDX, open(OUT + '/.index.json', 'w'))
