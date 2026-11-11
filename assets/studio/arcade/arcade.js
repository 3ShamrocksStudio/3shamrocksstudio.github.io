/* 3Shamrocks Studio: How It Works, an isometric 16-bit arcade.
   Every tile, prop and sprite is original pixel art drawn here (or in hero.js) as pixel data:
   limited per-stage ramps, ordered (Bayer) dithering, 2:1 isometric dioramas, integer-scaled canvas. */
(function () {
'use strict';
const D = document, $ = (i) => D.getElementById(i);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv = $('cv'), ctx = cv.getContext('2d');
let S = 3, IW = 480, IH = 300;

/* ---------------- utils ---------------- */
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const eOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const eIn = (t) => { t = clamp(t, 0, 1); return t * t; };
const h2 = (a, b) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hx = (c) => { const n = parseInt(c.slice(1), 16); return (0xff000000 | ((n & 255) << 16) | (n & 0xff00) | (n >>> 16)) >>> 0; };
const R = (a) => a.map(hx);
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x, y) => (B4[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
const M8 = [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];
const B8 = (x, y) => (M8[((y & 7) << 3) | (x & 7)] + 0.5) / 64;
function mk(w, h) { const c = D.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; }

class Buf {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint32Array(w * h); }
  px(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.w + x] = c; }
  at(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0; return this.d[y * this.w + x]; }
  rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.px(i, j, c); }
  poly(P, sh, wantMask) {
    let y0 = 1e9, y1 = -1e9; for (const p of P) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(this.h - 1, Math.ceil(y1));
    const fn = typeof sh === 'function', mask = wantMask ? new Set() : null, n = P.length;
    for (let y = y0; y <= y1; y++) {
      const yc = y + 0.5, xs = [];
      for (let k = 0; k < n; k++) { const a = P[k], b = P[(k + 1) % n]; if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const xa = Math.max(0, Math.ceil(xs[k] - 0.5)), xb = Math.min(this.w - 1, Math.ceil(xs[k + 1] - 0.5) - 1);
        for (let x = xa; x <= xb; x++) { const c = fn ? sh(x, y) : sh; if (c) { this.d[y * this.w + x] = c; if (mask) mask.add(y * this.w + x); } }
      }
    }
    return mask;
  }
  line(x0, y0, x1, y1, c) { x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; for (;;) { this.px(x0, y0, typeof c === 'function' ? c(x0, y0) : c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
  outline(c, w8) {
    const w = this.w, h = this.h, d = this.d, o = new Uint32Array(d);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (d[i]) continue;
      if ((x > 0 && d[i - 1]) || (x < w - 1 && d[i + 1]) || (y > 0 && d[i - w]) || (y < h - 1 && d[i + w]) ||
        (w8 && ((x > 0 && y > 0 && d[i - w - 1]) || (x < w - 1 && y > 0 && d[i - w + 1]) || (x > 0 && y < h - 1 && d[i + w - 1]) || (x < w - 1 && y < h - 1 && d[i + w + 1])))) o[i] = c; }
    this.d = o; return this;
  }
  blit(s, dx, dy) { for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const c = s.d[y * s.w + x]; if (c) this.px(dx + x, dy + y, c); } }
  cv() { const c = mk(this.w, this.h), x = c.getContext('2d'), id = x.createImageData(this.w, this.h); new Uint32Array(id.data.buffer).set(this.d); x.putImageData(id, 0, 0); return c; }
  flipped() { const b = new Buf(this.w, this.h); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) b.d[y * this.w + (this.w - 1 - x)] = this.d[y * this.w + x]; return b; }
}
function fromRows(rows, pal) { const h = rows.length, w = Math.max(...rows.map((r) => r.length)), b = new Buf(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < rows[y].length; x++) { const ch = rows[y][x]; if (ch !== '.' && ch !== ' ' && pal[ch]) b.d[y * w + x] = pal[ch]; } return b; }
function tint(src, col) { const c = mk(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return c; }
const GL = {};
function glow(col, r, pw) { const k = col + '|' + r + '|' + (pw || 2); if (GL[k]) return GL[k]; const s = r * 2 + 1, b = new Buf(s, s), c = hx(col); for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { const d = Math.hypot(x - r, y - r) / r; if (d < 1 && B8(x, y) < Math.pow(1 - d, pw || 2) * 0.95) b.d[y * s + x] = c; } return (GL[k] = b.cv()); }

/* tiny 3x5 pixel font for in-world text */
const F35 = { '0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001001001001','8':'111101111101111','9':'111101111001111','+':'000010111010000','B':'110101110101110','R':'110101110101101','A':'010101111101101','N':'101111111111101','D':'110101101101110','!':'010010010000010','P':'110101110100100','U':'101101101101111','S':'011100010001110','E':'111100110100111','O':'111101101101111','L':'100100100100111','I':'111010010010111','H':'101101111101101','K':'101101110101101','Y':'101101010010010','T':'111010010010010','G':'011100101101011','C':'011100100100011','V':'101101101101010','X':'101101010101101' };
function text35(c, s, x, y, col, sh) { for (let n = 0; n < s.length; n++) { const g = F35[s[n]]; if (!g) continue; for (let k = 0; k < 15; k++) if (g[k] === '1') { if (sh) { c.fillStyle = sh; c.fillRect(x + n * 4 + (k % 3) + 1, y + ((k / 3) | 0) + 1, 1, 1); } c.fillStyle = col; c.fillRect(x + n * 4 + (k % 3), y + ((k / 3) | 0), 1, 1); } } }

/* ---------------- isometric world ---------------- */
class World {
  constructor(b, ox, oy, light) { this.b = b; this.ox = ox; this.oy = oy; this.light = light || { amb: 0, ls: [] }; this.shadows = []; }
  P(i, j, z) { return [this.ox + (i - j) * 16, this.oy + (i + j) * 8 - (z || 0)]; }
  L(w) { const g = this.light; let v = g.amb; for (const l of g.ls) { const di = w[0] - l[0], dj = w[1] - l[1], dz = (w[2] - l[2]) / 16, d = Math.sqrt(di * di + dj * dj + dz * dz); if (d < l[3]) v += l[4] * (1 - d / l[3]); } return v; }
  sh(ramp, base, plane, tex) {
    const self = this;
    return (x, y) => { const w = plane(x, y); let rp = ramp, k = base;
      if (tex) { const t = tex(w, x, y); if (t === false) return 0; if (typeof t === 'number') k += t; else { rp = t[0]; k = t[1]; if (t[2]) return rp[clamp(k, 0, rp.length - 1)]; } }
      k += Math.floor(self.L(w) + bay(x, y)); return rp[clamp(k, 0, rp.length - 1)]; };
  }
  top(z) { const o = this; return (x, y) => { const dx = x + 0.5 - o.ox, dy = y + 0.5 - o.oy + z; return [(dx / 16 + dy / 8) / 2, (dy / 8 - dx / 16) / 2, z]; }; }
  fJ(j) { const o = this; return (x, y) => { const i = (x + 0.5 - o.ox) / 16 + j; return [i, j, o.oy + (i + j) * 8 - (y + 0.5)]; }; }
  fI(i) { const o = this; return (x, y) => { const j = i - (x + 0.5 - o.ox) / 16; return [i, j, o.oy + (i + j) * 8 - (y + 0.5)]; }; }
  box(i, j, z, wi, wj, h, ramp, o) {
    o = o || {}; const P = (a, b, c) => this.P(a, b, c), n = ramp.length;
    const t = o.t != null ? o.t : n - 3, l = o.l != null ? o.l : t - 1, r = o.r != null ? o.r : t - 2;
    if (o.sh !== false && z <= 1 && z + h > 0) this.shadows.push([i, j, wi, wj]);
    if (!o.noL) this.b.poly([P(i, j + wj, z + h), P(i + wi, j + wj, z + h), P(i + wi, j + wj, z), P(i, j + wj, z)], this.sh(o.rl || ramp, l, this.fJ(j + wj), o.texL));
    if (!o.noR) this.b.poly([P(i + wi, j, z + h), P(i + wi, j + wj, z + h), P(i + wi, j + wj, z), P(i + wi, j, z)], this.sh(o.rr || ramp, r, this.fI(i + wi), o.texR));
    if (!o.noT) {
      const pl = this.top(z + h), m = this.b.poly([P(i, j, z + h), P(i + wi, j, z + h), P(i + wi, j + wj, z + h), P(i, j + wj, z + h)], this.sh(o.rt || ramp, t, pl, o.texT), true);
      if (o.hl !== false && m) { const s2 = this.sh(o.rt || ramp, t + 1, pl, o.texT), W = this.b.w; for (const idx of m) if (!m.has(idx + W)) { const c = s2(idx % W, (idx / W) | 0); if (c) this.b.d[idx] = c; } }
    }
  }
  cyl(i, j, z, r, h, ramp, base, o) {
    o = o || {}; const [cx, cy] = this.P(i, j, z), rx = Math.max(2, Math.round(r * 22.6)), ry = rx / 2, b = this.b, n = ramp.length, dir = o.lightRight ? 1 : -1;
    if (o.sh !== false && z <= 1) this.shadows.push([i - r * 0.8, j - r * 0.8, r * 1.6, r * 1.6]);
    for (let x = -rx; x < rx; x++) { const fx = (x + 0.5) / rx, yy = ry * Math.sqrt(1 - fx * fx), sh = dir * fx;
      const yt = Math.round(cy - h - yy), yb = Math.round(cy + yy);
      for (let y = yt; y < yb; y++) { const px = cx + x; let k = base + Math.floor(sh * 1.6 + 0.3 + (o.tex ? o.tex(fx, cy - y, px, y) : 0) + this.L([i, j, z + h / 2]) + bay(px, y)); b.px(px, y, ramp[clamp(k, 0, n - 1)]); }
    }
    for (let x = -rx; x < rx; x++) { const fx = (x + 0.5) / rx, yy = ry * Math.sqrt(1 - fx * fx); for (let y = Math.round(cy - h - yy); y < Math.round(cy - h + yy); y++) { const px = cx + x, k = base + 2 + Math.floor(dir * fx * 0.8 + this.L([i, j, z + h]) * 0.7 + bay(px, y)) - ((y > cy - h + yy - 2) ? 0 : 0); b.px(px, y, ramp[clamp(k, 0, n - 1)]); } }
    if (o.rim !== false) for (let x = -rx; x < rx; x++) { const fx = (x + 0.5) / rx, yy = ry * Math.sqrt(1 - fx * fx); b.px(cx + x, Math.round(cy - h + yy) - 1, ramp[clamp(base + 3, 0, n - 1)]); }
  }
  ao(i, j, x, y, walls) {
    let best = 9;
    for (const s of this.shadows) { const dx = Math.max(s[0] - i, 0, i - (s[0] + s[2])), dy = Math.max(s[1] - j, 0, j - (s[1] + s[3])); const d = Math.hypot(dx, dy); if (d < best) best = d; }
    if (walls) { best = Math.min(best, i, j); }
    if (best <= 0) return -2;
    if (best < 0.28) return bay(x, y) < 1 - best / 0.28 ? -1 : 0;
    return 0;
  }
}
/* paint a pixel image onto an isometric wall face, sheared 2:1 (face j=const: dir 1, face i=const: dir -1) */
function wallPaint(c, img, x0, y0, dir) { for (let x = 0; x < img.w; x++) { const sy = Math.floor((dir > 0 ? x : -x) / 2); for (let y = 0; y < img.h; y++) { const col = img.d[y * img.w + x]; if (col) { c.fillStyle = u2css(col); c.fillRect(x0 + (dir > 0 ? x : -x), y0 + y + sy, 1, 1); } } } }
const CSS = new Map();
function u2css(u) { let s = CSS.get(u); if (!s) { s = 'rgb(' + (u & 255) + ',' + ((u >>> 8) & 255) + ',' + ((u >>> 16) & 255) + ')'; CSS.set(u, s); } return s; }

/* ---------------- shared palettes ---------------- */
const PAL = {
  ink: '#140d1c',
  wood: R(['#1e1019', '#331a24', '#4d2a2c', '#6c3c33', '#8f553d', '#b5714a', '#d8955c', '#f4bd7a']),
  paper: R(['#2e2a44', '#4c4766', '#77729a', '#a7a2c4', '#d4d0e6', '#f3f1fa', '#ffffff']),
  metal: R(['#0e0b13', '#1c1824', '#2d2838', '#433d50', '#5f586e', '#837c94', '#aaa3bb', '#d2cce0']),
  yel: R(['#3a2a06', '#6a4a0a', '#a8780e', '#e0a812', '#ffd23f', '#fff0a0', '#fffbe0']),
  pink: R(['#2a0e2a', '#4a1640', '#74235e', '#a2387c', '#d0559a', '#f07fb6', '#ffb0d4', '#ffe0ee']),
  teal: R(['#06222a', '#0b3440', '#124a5a', '#1a6478', '#238296', '#35a4b6', '#5ec6d2', '#9ae6ea', '#d6fbff']),
  green: R(['#0e2a1c', '#16422a', '#1f5e36', '#2f8040', '#4fa83a', '#8be36a', '#c4f5a0', '#efffe0']),
  violet: R(['#12062a', '#220c48', '#36146e', '#4f1f9c', '#6a2bcb', '#8239ea', '#b07cff', '#d9c4ff', '#f3ecff']),
  red: R(['#2a0610', '#4a0c1c', '#7a1428', '#b0203a', '#e83a52', '#ff6f80', '#ffb0b8']),
  orange: R(['#3a1610', '#5e2416', '#86361e', '#b04e2a', '#d8703c', '#f09a5c', '#ffc890']),
};

/* ---------------- hero (Dave minime) ---------------- */
const HF = {};
(function () {
  const H = window.ARC_HERO; if (!H) return; const pal = {}; for (const k in H.pal) pal[k] = hx(H.pal[k]);
  for (const n in H.f) { const f = H.f[n], b = fromRows(f.r, pal), c = b.cv(), cf = b.flipped().cv();
    HF[n] = { x: f.x, y: f.y, w: b.w, h: b.h, c, cf, t: {} }; }
})();
function heroImg(n, flip, tintCol) { const f = HF[n]; if (!tintCol) return flip ? f.cf : f.c; const k = tintCol + (flip ? 'f' : ''); return f.t[k] || (f.t[k] = tint(flip ? f.cf : f.c, tintCol)); }
function drawHero(c, sx, sy, n, flip, tintCol) { const f = HF[n]; if (!f) return; const x = flip ? sx - f.x - f.w + 1 : sx + f.x; c.drawImage(heroImg(n, flip, tintCol), Math.round(x), Math.round(sy + f.y)); }
const SHADOW = (function () { const w = 21, h = 7, b = new Buf(w, h), col = hx('#000000'); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = Math.hypot((x - 10) / 10.5, (y - 3) / 3.5); if (d < 1 && bay(x, y) < 0.62) b.d[y * w + x] = col; } return b.cv(); })();
function drawShadow(c, sx, sy, k) { k = k == null ? 1 : k; const w = Math.max(6, Math.round(21 * k)); c.globalAlpha = 0.55; c.drawImage(SHADOW, Math.round(sx - w / 2), Math.round(sy - 3), w, 7); c.globalAlpha = 1; }

/* ---------------- small sprites ---------------- */
const SPR = {};
(function () {
  const pal = { o: hx(PAL.ink), W: hx('#ffffff'), y: hx('#ffd23f'), Y: hx('#fff0a0'), r: hx('#ff9a3c'), R: hx('#ff4d6d'), d: hx('#a8203a'), P: hx('#120c18'), c: hx('#837c94'), C: hx('#aaa3bb'), h: hx('#fffbe0'), g: hx('#8be36a'), t: hx('#2fb7c9'), v: hx('#9b59f7'), p: hx('#f07fb6'), k: hx('#4c4766'), s: hx('#f2bf94'), b: hx('#1f1c26') };
  SPR.spark = [fromRows(['....r....', '....y....', '..r.y.r..', '...yWy...', 'ryyWWWyyr', '...yWy...', '..r.y.r..', '....y....', '....r....'], pal).cv(),
    fromRows(['.r.....r.', '..y...y..', '...yWy...', '..yWWWy..', '..WWWWW..', '..yWWWy..', '...yWy...', '..y...y..', '.r.....r.'], pal).cv()];
  SPR.bulb = fromRows([
    '....ooooo....', '..ooYYYYYoo..', '.oYhhYYYYYYo.', '.oYhYYYYYYyo.', 'oYhYYYYYYYYyo', 'oYYYYYYYYYYyo', 'oYYYYyYyYYyyo', '.oYYYyYyYYyo.', '.oyYYYyYYyyo.', '..oyyYyYyyo..', '...oyyyyyo...', '...occccco...', '...oCCCCCo...', '...occccco...', '....oCCCo....', '.....ooo.....'], pal).cv();
  const bug0 = ['..o...o..', '...o.o...', '.oRRRRRo.', 'oRWPRWPRo', 'oRRdRdRRo', 'oRdRRRdRo', '.oRRRRRo.', 'o.o...o.o'];
  const bug1 = ['..o...o..', '...o.o...', '.oRRRRRo.', 'oRWPRWPRo', 'oRRdRdRRo', 'oRdRRRdRo', '.oRRRRRo.', '.o.o.o.o.'];
  SPR.bug = [fromRows(bug0, pal), fromRows(bug1, pal)].map((b) => [b.cv(), b.flipped().cv()]);
  SPR.user = ['p', 'g', 't', 'v', 'y'].map((k) => fromRows(['.oo.', 'osso', 'osso', '.oo.', 'o' + k + k + 'o', k + k + k + k, 'o' + k + k + 'o', '.oo.'], pal).cv());
  SPR.heart = fromRows(['.oo.oo.', 'oppopWo', 'opppppo', 'opppppo', '.opppo.', '..opo..', '...o...'], pal).cv();
  SPR.star = fromRows(['..o..', '.oYo.', 'oYWYo', '.oYo.', '..o..'], pal).cv();
})();

/* procedural sprites: chaos shapes, code cube, phone, rocket, cloud */
function shapeSprite(kind, ramp) {
  const s = 15, b = new Buf(s, s);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const fx = (x + 0.5 - s / 2) / (s / 2), fy = (y + 0.5 - s / 2) / (s / 2); let inside = false;
    if (kind === 0) inside = fx * fx + fy * fy < 0.92;
    else if (kind === 1) inside = fy > -0.92 && fy < 0.8 && Math.abs(fx) < (fy + 0.92) * 0.6;
    else inside = Math.abs(fx) < 0.8 && Math.abs(fy) < 0.8;
    if (inside) { const l = -fx * 0.8 - fy * 1.1; b.d[y * s + x] = ramp[clamp(4 + Math.floor(l * 1.6 + bay(x, y)), 1, ramp.length - 1)]; }
  }
  const W = hx('#ffffff'), K = hx('#120c18'); const ey = kind === 1 ? 8 : 6;
  b.px(4, ey, W); b.px(5, ey, W); b.px(5, ey + 1, K); b.px(4, ey + 1, W); b.px(9, ey, W); b.px(10, ey, W); b.px(9, ey + 1, K); b.px(10, ey + 1, W);
  b.px(3, ey - 2, K); b.px(4, ey - 1, K); b.px(5, ey - 1, K); b.px(11, ey - 2, K); b.px(10, ey - 1, K); b.px(9, ey - 1, K);
  b.px(6, ey + 3, K); b.px(7, ey + 3, K); b.px(8, ey + 3, K);
  return b.outline(hx(PAL.ink)).cv();
}
function cubeSprite(ramp, mark) {
  const b = new Buf(20, 22), w = new World(b, 10, 1, { amb: 0.4, ls: [] });
  w.box(0, 0, 0, 0.55, 0.55, 9, ramp, { t: ramp.length - 2, l: ramp.length - 4, r: ramp.length - 5, sh: false,
    texL: (p, x, y) => { const u = Math.floor((p[0]) * 16), v = Math.floor(9 - p[2]); return (v === 3 && u > 1 && u < 4 + mark) || (v === 5 && u > 2 && u < 7 - mark) ? [PAL.paper, 6, true] : 0; } });
  return b.outline(hx(PAL.ink)).cv();
}
function phoneSprite(on) {
  const b = new Buf(32, 60), w = new World(b, 18, 50, { amb: 0.3, ls: [] });
  w.box(0, 0, 0, 0.75, 0.22, 46, PAL.metal, { t: 5, l: 3, r: 2, sh: false,
    texL: (p, x, y) => { const u = p[0] * 16, v = 46 - p[2];
      if (u < 1.2 || u > 10.6 || v < 2.5 || v > 43) return 0;
      if (!on) return [PAL.metal, 1, true];
      if (v < 10) return [PAL.violet, 5 + (v < 5 ? 1 : 0), true];
      if (v > 37) return (Math.floor(u) % 3 === 1) ? [PAL.teal, 6, true] : [PAL.metal, 1, true];
      if (v > 30 && v < 35) return (u > 2.5 && u < 9.5) ? [PAL.green, 5, true] : [PAL.paper, 6, true];
      const row = Math.floor((v - 10) / 7), rv = (v - 10) % 7; if (rv > 5) return [PAL.paper, 6, true];
      if (u < 4.5) return [[PAL.pink, PAL.yel, PAL.teal][row % 3], 5, true];
      return rv < 2 ? [PAL.paper, 2, true] : (rv < 4 && u < 8 ? [PAL.paper, 3, true] : [PAL.paper, 5, true]); } });
  return b.outline(hx(PAL.ink)).cv();
}
function rocketSprite() {
  const w = 22, h = 58, b = new Buf(w, h), cx = 10.5;
  const body = (y) => y < 16 ? 7.2 * Math.sqrt(1 - Math.pow((16 - y) / 16.5, 2)) : 7.2;
  for (let y = 0; y < 48; y++) { const hw = body(y); for (let x = 0; x < w; x++) { const fx = (x + 0.5 - cx) / hw; if (Math.abs(fx) >= 1) continue;
    const sh = fx * 1.4; let ramp = PAL.paper, k = 4 + Math.floor(sh + bay(x, y)) ;
    if (y < 11) { ramp = PAL.red; k = 4 + Math.floor(sh + bay(x, y)); }
    if (y >= 15 && y < 37 && Math.abs(x + 0.5 - cx) < 5.2) { // phone screen window
      const u = x + 0.5 - cx, v = y - 15; if (Math.abs(u) > 4.6 || v < 1 || v > 21) { ramp = PAL.metal; k = 2; }
      else if (v < 4) { ramp = PAL.violet; k = 6; } else if (v > 17) { ramp = PAL.green; k = 5; } else { const r = (v - 4) % 5; ramp = r === 4 ? PAL.violet : (u < -1 ? [PAL.pink, PAL.yel, PAL.teal][((v - 4) / 5) | 0] : PAL.paper); k = r === 4 ? 2 : 5; }
    }
    if (y === 40 || y === 41) { ramp = PAL.violet; k = 5 + Math.floor(sh * 0.6); }
    b.px(x, y, ramp[clamp(k, 0, ramp.length - 1)]); } }
  for (let y = 36; y < 52; y++) { const s = (y - 36) / 16; for (let side = -1; side <= 1; side += 2) for (let d = 0; d < 4 + s * 5; d++) { const x = Math.round(cx + side * (6.5 + d) - 0.5); if (y < 36 + d * 1.6) continue; b.px(x, y, PAL.red[side > 0 ? 3 : 5]); } }
  for (let y = 48; y < 53; y++) for (let x = 6; x < 15; x++) b.px(x, y, PAL.metal[x < 10 ? 5 : 3]);
  return b.outline(hx(PAL.ink)).cv();
}
function cloudSprite(angry, rampHex) {
  const w = 52, h = 26, b = new Buf(w, h), blobs = [[14, 15, 9], [25, 10, 11], [37, 14, 9], [20, 18, 8], [32, 18, 8], [44, 18, 6], [8, 19, 6]];
  const ramp = R(rampHex || ['#1a1626', '#2a2438', '#3d364e', '#544c68', '#6f6684', '#8d84a2', '#aea6c0']);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let m = -1; for (const c of blobs) { const d = Math.hypot(x - c[0], y - c[1]) / c[2]; if (d < 1) m = Math.max(m, 1 - d); }
    if (m >= 0) { const l = (h - y) / h * 2.2 - (m < 0.15 ? 1 : 0); b.d[y * w + x] = ramp[clamp(2 + Math.floor(l + bay(x, y)), 0, 6)]; } }
  if (angry) { const K = hx('#120c18'), W = hx('#ffffff'), Rr = hx('#ff4d6d');
    [[19, 13], [30, 13]].forEach(([x, y], n) => { b.rect(x, y, 3, 2, W); b.px(x + (n ? 0 : 2), y + 1, K); b.px(x + (n ? 0 : 2), y, Rr); b.line(x - 1, y - 2 + (n ? 1 : 0), x + 3, y - 1 - (n ? 1 : 0) + (n ? 0 : 1) - 1, K); });
    b.rect(22, 19, 7, 1, K); b.px(21, 20, K); b.px(29, 20, K); }
  return b.outline(hx(PAL.ink)).cv();
}
function markBuf() { // the brand mark assembled in stage 2: three leaves + stem
  const w = 26, h = 26, b = new Buf(w, h); const leaves = [[13, 7, PAL.green], [7, 14, PAL.teal], [19, 14, PAL.violet]];
  for (const [cx, cy, rp] of leaves) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy * 1.05) / 6.1; if (d < 1) { const l = (-dx - dy) / 6; b.d[y * w + x] = rp[clamp(5 + Math.floor(l * 1.3 + bay(x, y)) - (d > 0.82 ? 1 : 0), 1, rp.length - 1)]; } }
  for (let k = 0; k < 9; k++) { b.px(13 + (k > 4 ? k - 4 : 0) * 0.6, 14 + k, PAL.yel[4]); b.px(14 + (k > 4 ? k - 4 : 0) * 0.6, 14 + k, PAL.yel[3]); }
  b.rect(12, 12, 3, 3, PAL.yel[5]); b.px(13, 12, PAL.yel[6]);
  return b.outline(hx(PAL.ink));
}

/* ---------------- audio (Web Audio chiptune SFX) ---------------- */
const AU = { on: true, ctx: null, g: null, nb: null };
try { if (localStorage.getItem('arcade-snd') === '0') AU.on = false; } catch (e) { /* storage blocked */ }
function audioStart() { if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); sndDraw(); return; } try { const A = window.AudioContext || window.webkitAudioContext; if (!A) return; AU.ctx = new A(); AU.g = AU.ctx.createGain(); AU.g.gain.value = AU.on ? 0.3 : 0; AU.g.connect(AU.ctx.destination); } catch (e) { AU.ctx = null; } sndDraw(); }
function osc(type, f0, f1, dur, vol, delay) { const c = AU.ctx, t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(AU.g); o.start(t); o.stop(t + dur + 0.03); }
function nz(dur, vol, f, delay, type) { const c = AU.ctx; if (!AU.nb) { const n = c.sampleRate, bf = c.createBuffer(1, n, n), d = bf.getChannelData(0); let v = 0; for (let i = 0; i < n; i++) { if (i % 3 === 0) v = Math.random() * 2 - 1; d[i] = v; } AU.nb = bf; }
  const t = c.currentTime + (delay || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = AU.nb; s.loop = true; fl.type = type || 'lowpass'; fl.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl); fl.connect(g); g.connect(AU.g); s.start(t); s.stop(t + dur + 0.03); }
const SFX = {
  coin() { osc('square', 988, 0, 0.07, 0.16); osc('square', 1319, 0, 0.35, 0.16, 0.07); },
  blip() { osc('square', 660, 0, 0.05, 0.1); },
  card() { [523, 659, 784, 1047].forEach((f, i) => osc('square', f, 0, 0.09, 0.11, i * 0.06)); osc('triangle', 131, 0, 0.4, 0.25); },
  land() { osc('triangle', 170, 45, 0.2, 0.4); nz(0.12, 0.2, 900); },
  step() { nz(0.03, 0.06, 1500); },
  charge() { osc('sawtooth', 160, 1300, 0.85, 0.06); osc('square', 80, 640, 0.85, 0.05); nz(0.85, 0.05, 3000, 0, 'highpass'); },
  hit() { nz(0.2, 0.45, 2600); osc('square', 320, 55, 0.22, 0.25); },
  slash() { nz(0.07, 0.3, 6000, 0, 'highpass'); osc('square', 1800, 300, 0.08, 0.07); },
  ko() { osc('square', 880, 110, 0.7, 0.16); osc('square', 440, 55, 0.7, 0.12); nz(0.6, 0.22, 700); },
  clear() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => osc('square', f, 0, 0.13, 0.12, i * 0.09)); osc('triangle', 131, 0, 0.35, 0.3); osc('triangle', 196, 0, 0.6, 0.3, 0.36); },
  spark() { [1568, 2093, 2637, 3136].forEach((f, i) => osc('triangle', f, 0, 0.14, 0.09, i * 0.05)); },
  power() { osc('square', 220, 880, 0.45, 0.09); osc('triangle', 440, 1760, 0.45, 0.09); },
  pop() { osc('square', 1300, 500, 0.08, 0.09); },
  drop() { osc('square', 520, 160, 0.09, 0.1); },
  count() { osc('square', 440, 0, 0.16, 0.14); },
  go() { osc('square', 880, 0, 0.32, 0.15); osc('square', 1320, 0, 0.32, 0.08); },
  rocket() { nz(2.4, 0.5, 420); osc('sawtooth', 70, 28, 2.2, 0.1); },
  boom() { nz(0.6, 0.45, 1200); osc('triangle', 120, 40, 0.5, 0.35); },
  firework() { nz(0.4, 0.18, 2500, 0, 'bandpass'); },
};
function sfx(n) { if (!AU.on || !AU.ctx) return; try { SFX[n](); } catch (e) { /* ignore */ } }
const sndBtn = $('snd');
function sndDraw() { const v = AU.on && !!AU.ctx; sndBtn.setAttribute('aria-pressed', v ? 'true' : 'false'); sndBtn.setAttribute('aria-label', v ? 'Sound on' : 'Sound off'); sndBtn.title = v ? 'Sound on' : 'Sound off'; }
sndBtn.addEventListener('click', (e) => { e.stopPropagation(); if (!AU.ctx) { AU.on = true; audioStart(); } else { AU.on = !AU.on; AU.g.gain.value = AU.on ? 0.3 : 0; } try { localStorage.setItem('arcade-snd', AU.on ? '1' : '0'); } catch (er) { /* */ } sndDraw(); sfx('blip'); });

/* CRT toggle */
const crtBtn = $('crtBtn');
function crtSet(v) { D.body.classList.toggle('crt', v); crtBtn.setAttribute('aria-pressed', v ? 'true' : 'false'); try { localStorage.setItem('arcade-crt', v ? '1' : '0'); } catch (e) { /* */ } }
try { if (localStorage.getItem('arcade-crt') === '0') crtSet(false); } catch (e) { /* */ }
crtBtn.addEventListener('click', (e) => { e.stopPropagation(); crtSet(!D.body.classList.contains('crt')); sfx('blip'); });

/* ---------------- FX state ---------------- */
let parts = [], pops = [], flashA = 0, flashCol = '#ffffff', shakeA = 0, hitstop = 0, slashes = [];
function burst(x, y, n, cols, sp, g, life) { for (let k = 0; k < n; k++) { const a = Math.random() * Math.PI * 2, v = (0.4 + Math.random()) * (sp || 60); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (g ? 20 : 0), g: g || 0, life: (life || 0.6) * (0.6 + Math.random() * 0.6), t: 0, c: cols[k % cols.length], s: Math.random() < 0.3 ? 2 : 1 }); } }
function dust(x, y, n) { for (let k = 0; k < n; k++) { const side = k % 2 ? 1 : -1; parts.push({ x: x + side * 4, y, vx: side * (20 + Math.random() * 30), vy: -Math.random() * 12, g: 10, life: 0.45, t: 0, c: k % 3 ? '#d4d0e6' : '#a7a2c4', s: 2 }); } }
function scorePop(x, y, txt, col) { pops.push({ x, y, txt, col: col || '#ffd23f', t: 0 }); }
function hitFX(x, y) { flashA = 0.6; flashCol = '#ffffff'; shakeA = 5; hitstop = RM ? 0 : 0.11; burst(x, y, 22, ['#ffffff', '#fff0a0', '#ffd23f', '#ff9a3c'], 110, 0, 0.45); slashes.push({ x, y, t: 0, kind: 'star' }); sfx('hit'); }

/* ---------------- HUD / DOM beats ---------------- */
const fx = $('fx');
function beat(txt, cls, dur, small) { if (RM) return; const d = D.createElement('div'); d.className = 'beat px hot slam ' + (cls || '') + (small ? ' s' : ''); d.dataset.t = txt; d.textContent = txt; fx.appendChild(d); setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 320); }, (dur || 0.9) * 1000); }
function vsBeat(opp) { if (RM) return; const d = D.createElement('div'); d.className = 'vs px'; d.innerHTML = '<span class="a">DAVE</span><b class="hot" data-t="VS">VS</b><span class="b"></span>'; d.querySelector('.b').textContent = opp; fx.appendChild(d); setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 320); }, 520); }
function bandBeat() { if (RM) return; const d = D.createElement('div'); d.className = 'bandbg'; fx.appendChild(d); setTimeout(() => d.remove(), 1300); }
function clearBeats() { fx.innerHTML = ''; $('cutin').classList.remove('on'); }
function cutin(name) { if (RM) return; const c = $('cutin'), m = $('mvNm'); m.dataset.t = name; m.textContent = name; c.classList.remove('on'); void c.offsetWidth; c.classList.add('on'); setTimeout(() => c.classList.remove('on'), 950); }
let score = 0, shownScore = 0;
function addScore(n) { score += n; if (RM) { shownScore = score; $('score').textContent = String(score).padStart(7, '0'); } }
function oppSet(name, hp, instant) { $('oppNm').textContent = name; const b = $('oppBar'), f = b.querySelector('.fill'), d = b.querySelector('.dmg');
  if (instant) { f.style.transition = d.style.transition = 'none'; } f.style.transform = 'scaleX(' + hp + ')'; d.style.transform = 'scaleX(' + hp + ')'; if (instant) { void b.offsetWidth; f.style.transition = d.style.transition = ''; } }
function xpSet(v) { $('xp').style.transform = 'scaleX(' + v + ')'; }
const prompt = $('prompt'), promptTxt = $('promptTxt');
function promptSet(txt) { if (!txt) { prompt.classList.remove('on'); return; } promptTxt.textContent = txt; prompt.classList.add('on'); placePrompt(); }
function placePrompt() { const r = $('dock').getBoundingClientRect(); prompt.style.bottom = (innerHeight - r.top + 14) + 'px'; }
const cap = $('cap');
function capSet(s, show) { $('capK').textContent = 'STAGE ' + (s.n + 1) + ' · ' + s.name; $('capH').textContent = s.head; $('capT').textContent = s.copy; cap.classList.toggle('in', !!show); }
function pipsSet() { const p = $('pips').children; for (let k = 0; k < 4; k++) p[k].className = k < cur ? 'done' : k === cur ? 'cur' : ''; if (cleared[cur]) p[cur].className = 'done cur'; }
const srs = $('srStatus');

/* ---------------- background helpers ---------------- */
function gradFill(b, ramp, y0, y1, x0, x1) { x0 = x0 || 0; x1 = x1 == null ? b.w : x1; const n = ramp.length; for (let y = Math.max(0, y0); y < Math.min(b.h, y1); y++) { const t = (y - y0) / (y1 - y0) * (n - 1); for (let x = x0; x < x1; x++) b.d[y * b.w + x] = ramp[clamp(Math.floor(t + bay(x, y) - 0.5), 0, n - 1)]; } }
function disc(b, cx, cy, r, ramp, base, lx, ly) { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) { const dx = (x + 0.5 - cx) / r, dy = (y + 0.5 - cy) / r, d = dx * dx + dy * dy; if (d < 1) { const l = -(dx * (lx || -0.7) + dy * (ly || -0.7)) * -1; b.px(x, y, ramp[clamp(base + Math.floor(l * 1.5 + bay(x, y)), 0, ramp.length - 1)]); } } }
function skyline(b, y0, col, win, seed, hmin, hmax, wmin) { const r = rng(seed); let x = -2; while (x < b.w) { const w = Math.floor(wmin + r() * 14), h = Math.floor(hmin + r() * (hmax - hmin)); for (let yy = y0 - h; yy < b.h; yy++) for (let xx = x; xx < x + w; xx++) b.px(xx, yy, col); if (r() < 0.35) for (let yy = y0 - h - 5; yy < y0 - h; yy++) b.px(x + (w >> 1), yy, col);
    if (win) for (let yy = y0 - h + 3; yy < b.h - 2; yy += 4) for (let xx = x + 2; xx < x + w - 2; xx += 3) if (r() < 0.22) b.px(xx, yy, win[(r() * win.length) | 0]); x += w + Math.floor(r() * 3); } }

/* ================= STAGES ================= */
const OX = 100, OY = 88, DW = 200, DH = 206;
function base(W, ramp, depth, tex) { // the slab under every diorama
  W.box(0, 0, -depth, 5, 5, depth, ramp, { noT: true, sh: false, l: 3, r: 2, texL: tex, texR: tex });
}
function floor(W, ramp, b0, tex) { W.box(0, 0, -0.01, 5, 5, 0.01, ramp, { noL: true, noR: true, sh: false, t: b0, texT: tex, hl: false }); }

/* ---------- STAGE 1: IDEA ---------- */
const IDEA = {
  n: 0, name: 'IDEA', head: 'CATCH THE SPARK', move: 'SPARK CATCH!', opp: 'STRAY SPARK',
  copy: 'A rough idea becomes a sharp one: who it is for, the problem it solves, and why it wins.',
  hero: [2.35, 3.75], cyL: 104, SD: 3.3,
  build() {
    const P = PAL, glass = R(['#03040f', '#070b22', '#0d1838', '#162a55', '#244276', '#3e6aa6', '#7fa6d8']),
      wall = R(['#0c0920', '#141032', '#1d1746', '#28205a', '#352b6e', '#463a86', '#5e4fa0', '#7e6dbc', '#a594d6']),
      cork = R(['#2c180f', '#45261a', '#633822', '#844c2c', '#a6653a', '#c9854f', '#e8a96a']),
      rug = R(['#1a0b2e', '#2c124a', '#43196a', '#5d248c', '#7a34b8', '#9b59f7', '#c09bff', '#e2d2ff']),
      found = R(['#07050d', '#0f0b1a', '#181227', '#221a36', '#2e2446', '#3b3058']);
    const notes = [[0.75, 1.25, 33, 41, P.yel], [1.45, 1.95, 30, 38, P.pink], [2.25, 2.8, 34, 42, P.teal], [1.05, 1.6, 23, 30, P.teal], [2.0, 2.5, 23, 29, P.yel]];
    const make = (lit) => {
      const b = new Buf(DW, DH), light = lit ? { amb: 0.35, ls: [[0.75, 1.3, 26, 4.6, 3.1], [2.6, 0.2, 31, 2.6, 0.8]] } : { amb: -1.1, ls: [[2.6, 0.1, 31, 3.1, 1.9]] };
      const W = new World(b, OX, OY, light);
      const props = (W) => {
        // desk
        W.box(0.08, 0.55, 0, 0.95, 0.75, 13, P.wood, { t: 4, texR: (p) => { const v = 13 - p[2], u = (p[1] - 0.55) * 16; return (v > 4.5 && v < 5.5) || u < 0.6 || u > 11.3 ? -2 : (v > 2 && v < 3 && u > 4 && u < 7 ? 2 : 0); } });
        W.box(0.08, 2.55, 0, 0.95, 0.2, 13, P.wood, { t: 4 });
        W.box(0.04, 0.5, 13, 1.05, 2.35, 2.5, P.wood, { t: 5 });
        W.box(0.3, 1.55, 15.5, 0.55, 0.42, 1.2, P.paper, { t: 5, l: 3, r: 2 });
        W.cyl(0.55, 2.45, 15.5, 0.09, 5, P.red, 3, { sh: false });
        // lamp
        W.box(0.3, 0.85, 15.5, 0.3, 0.3, 1.5, P.metal, { t: 4 });
        const [ax, ay] = W.P(0.45, 1.0, 17), [bx, by] = W.P(0.5, 1.05, 34), [cx, cy] = W.P(0.72, 1.24, 31);
        W.b.line(ax, ay, bx, by, P.metal[4]); W.b.line(ax + 1, ay, bx + 1, by, P.metal[2]); W.b.line(bx, by, cx, cy, P.metal[4]); W.b.line(bx, by + 1, cx, cy + 1, P.metal[2]);
        W.cyl(0.74, 1.27, 26, 0.17, 5, P.metal, 3, { sh: false });
        // chair
        W.box(1.25, 1.3, 0, 0.55, 0.55, 8, P.violet, { t: 4, l: 3, r: 2 });
        W.box(1.25, 1.3, 8, 0.12, 0.55, 12, P.violet, { t: 4, l: 3, r: 2 });
        // bookshelf on right wall
        W.box(3.55, 0.06, 0, 1.25, 0.45, 26, P.wood, { t: 4, l: 2, r: 1, texL: (p, x, y) => { const v = p[2], u = p[0] * 16; const sh = Math.floor(v / 8.5), dv = v - sh * 8.5; if (dv < 1.4) return 2; const bk = Math.floor(u / 2.2); if ((u % 2.2) < 0.5) return -2; const col = [P.pink, P.teal, P.yel, P.violet, P.green, P.red][(bk * 3 + sh * 5) % 6]; if (dv > 6 + h2(bk, sh) * 2.3) return -3; return [col, 3 + (Math.floor(u * 2) % 2)]; } });
        W.cyl(4.2, 0.3, 26, 0.12, 6, P.orange, 3, { sh: false });
        // bin + paper balls
        W.cyl(0.42, 4.35, 0, 0.2, 9, P.metal, 3, {});
        for (const [i, j] of [[0.75, 4.75], [1.35, 4.45], [3.4, 1.8], [0.4, 3.75], [2.1, 1.0], [4.45, 4.3]]) W.cyl(i, j, 0, 0.07, 2.5, P.paper, 3, { rim: false });
        // stack of sketchbooks
        W.box(3.9, 3.95, 0, 0.55, 0.42, 3, P.teal, { t: 5 }); W.box(3.95, 3.98, 3, 0.5, 0.38, 2.5, P.pink, { t: 5 }); W.box(3.92, 3.92, 5.5, 0.52, 0.42, 2.5, P.paper, { t: 5 });
      };
      // pass 1: footprints only
      const dry = new World(new Buf(1, 1), OX, OY, light); props(dry); W.shadows = dry.shadows;
      // walls
      const wallJ = (p, x, y) => { const i = p[0], z = p[2]; if (z < -0.5) return [found, 3];
        const du = (i - 2.55) * 16, dz = z - 33, r = Math.hypot(du, dz);
        if (r < 9.5) { if (Math.abs(du) < 0.8 || Math.abs(dz) < 0.8) return [P.wood, 3]; if (Math.hypot(du - 3.6, dz - 3.8) < 3.4) return [P.paper, 6, true]; if (Math.hypot(du - 2.2, dz - 4.8) < 3.4 && Math.hypot(du - 3.6, dz - 3.8) >= 3.4) return [glass, 2, true]; if (h2(Math.floor(du + 40), Math.floor(dz + 40)) > 0.94) return [P.paper, 5, true]; return [glass, 2 + (dz > 2 ? 0 : 1)]; }
        if (r < 12) return [P.wood, r < 10.5 ? 2 : 4];
        if (z < 12) { if (z > 10) return [P.wood, 5]; if (z < 1.2) return [P.wood, 1]; return [P.wood, (i * 1.25 % 1) < 0.05 ? 2 : 3]; }
        if (z > 49) return [P.wood, z > 50.5 ? 5 : 3];
        return (Math.floor(i * 8) & 1) ? -1 : (((Math.floor(i * 16) + Math.floor(z / 3)) % 6 === 0 && Math.floor(z) % 6 === 0) ? 1 : 0); };
      const wallI = (p, x, y) => { const j = p[1], z = p[2]; if (z < -0.5) return [found, 2];
        if (j > 0.5 && j < 3.1 && z > 20 && z < 45) { if (j < 0.57 || j > 3.03 || z < 21 || z > 44) return [P.wood, 4];
          for (const n of notes) if (j > n[0] && j < n[1] && z > n[2] && z < n[3]) { const v = n[3] - z, u = (j - n[0]) * 16; if (v < 1.2) return [n[4], 3]; return (Math.floor(v) % 2 === 1 && v > 2 && u > 1.2 && u < 6.5 - (Math.floor(v) % 3)) ? [n[4], 2] : [n[4], 4]; }
          return [cork, 3 + (h2(x, y) > 0.72 ? -1 : 0) + (h2(x + 7, y) > 0.93 ? 1 : 0)]; }
        if (j > 3.55 && j < 4.6 && z > 16 && z < 41) { if (j < 3.62 || j > 4.53 || z < 17 || z > 40) return [P.metal, 2]; const u = (j - 3.62) * 16, v = z - 17; const d = Math.hypot(u - 7.5, v - 14); if (d > 4.8 && d < 6.2 && v > 9) return [P.violet, 5]; if (v < 10 && v > 5 && u > 5.5 && u < 9.5) return [P.violet, v > 7 ? 4 : 3]; return [P.paper, 4]; }
        if (z < 12) { if (z > 10) return [P.wood, 5]; if (z < 1.2) return [P.wood, 1]; return [P.wood, (j * 1.25 % 1) < 0.05 ? 2 : 3]; }
        if (z > 49) return [P.wood, z > 50.5 ? 5 : 3];
        return (Math.floor(j * 8) & 1) ? -1 : 0; };
      W.box(0, -0.3, -16, 5, 0.3, 68, wall, { t: 6, l: 4, r: 2, texL: wallJ, sh: false, texT: () => [P.wood, 4] });
      W.box(-0.3, 0, -16, 0.3, 5, 68, wall, { t: 6, l: 2, r: 3, texR: wallI, sh: false, texT: () => [P.wood, 4] });
      W.box(-0.3, -0.3, -16, 0.3, 0.3, 68, wall, { t: 6, l: 3, r: 2, sh: false, texT: () => [P.wood, 5] });
      base(W, found, 16, (p, x, y) => (p[2] > -3 ? [P.wood, p[2] > -1.2 ? 5 : 3] : (Math.floor(p[2]) === -9 ? -1 : 0)));
      floor(W, P.wood, 4, (p, x, y) => { const i = p[0], j = p[1]; const ao = W.ao(i, j, x, y, true);
        const ri = (i - 2.75) / 1.6, rj = (j - 3.1) / 1.25, rd = ri * ri + rj * rj;
        if (rd < 1) { const brd = rd > 0.7 && rd < 0.82; const pat = ((Math.floor(i * 4 + j * 4)) & 1); return [rug, (brd ? 6 : rd >= 0.82 ? 3 : 3 + pat) + ao]; }
        const pj = Math.floor(j * 2.5), fj = j * 2.5 - pj, off = h2(pj, 7) * 1.7, fi = ((i + off) / 1.7) % 1;
        if (fj < 0.1 || fi < 0.03) return -2 + ao; let d = h2(pj, 3) > 0.5 ? 0 : -1; if (h2(pj, Math.floor((i + off) * 7)) > 0.86) d -= 1; return d + ao; });
      props(W);
      // pins on the cork notes
      for (const n of notes) { const [x, y] = W.P(0, (n[0] + n[1]) / 2, n[3] - 0.5); b.px(x, y, P.red[5]); b.px(x, y + 1, P.red[3]); }
      b.outline(hx(PAL.ink));
      return b;
    };
    this.d0 = make(false); this.d1 = make(true);
    this.W = new World(null, OX, OY);
  },
  bg(b) {
    gradFill(b, R(['#04030c', '#07061a', '#0d0b24', '#141034', '#1c1546', '#251c58', '#30236a']), 0, b.h);
    const r = rng(11); for (let k = 0; k < b.w * b.h / 260; k++) b.px(r() * b.w, r() * b.h * 0.8, r() < 0.2 ? hx('#ffffff') : hx('#7d6dbc'));
    disc(b, b.w * 0.82, b.h * 0.2, 16, R(['#5d5876', '#8a85a6', '#bbb6d2', '#e4e1f0', '#fff6dc']), 2, 0.8, -0.4);
    for (const [dx, dy, rr] of [[-5, -4, 3], [4, 3, 2.5], [-2, 7, 2]]) disc(b, b.w * 0.82 + dx, b.h * 0.2 + dy, rr, R(['#77729a', '#a7a2c4', '#bbb6d2']), 0);
    skyline(b, b.h, hx('#0b0920'), [hx('#ffd36b'), hx('#ffb43c'), hx('#7fa6d8')], 4, b.h * 0.12, b.h * 0.3, 8);
    skyline(b, b.h + 4, hx('#060512'), [hx('#ffd36b')], 9, b.h * 0.05, b.h * 0.16, 10);
  },
  bgDyn(c, t) { const r = rng(5); for (let k = 0; k < 40; k++) { const x = (r() * IW) | 0, y = (r() * IH * 0.6) | 0, ph = r() * 6; if (Math.sin(t * 3 + ph) > 0.6) { c.fillStyle = '#ffffff'; c.fillRect(x, y, 1, 1); c.fillStyle = '#7d6dbc'; c.fillRect(x - 1, y, 1, 1); c.fillRect(x + 1, y, 1, 1); c.fillRect(x, y - 1, 1, 1); c.fillRect(x, y + 1, 1, 1); } } },
  sparkPos(t) { const [cx, cy] = SP(3.3, 2.0, 46), a = t * 2.3; return [cx + Math.sin(a) * 30, cy + Math.sin(a * 2) * 11]; },
  draw(c, st) {
    const u = st.sp == null ? -1 : st.t - st.sp, lit = st.sp == null ? 0 : clamp((u - 2.2) / 0.8, 0, 1);
    drawDior(c, this, lit);
    const LB = SP(0.74, 1.27, 23);
    if (lit > 0) { c.globalCompositeOperation = 'lighter'; const g = glow('#5a3a10', 34, 1.6); c.drawImage(g, LB[0] - 34, LB[1] - 30); c.drawImage(glow('#ffd36b', 5, 1.2), LB[0] - 5, LB[1] - 4); c.globalCompositeOperation = 'source-over';
      const r = rng(3); for (let k = 0; k < 14; k++) { const x = LB[0] - 30 + r() * 70, y = LB[1] - 20 + ((r() * 60 + st.t * (4 + r() * 6)) % 60); if (Math.sin(st.t * 2 + k) > -0.2) { c.fillStyle = k % 3 ? '#ffd36b' : '#fff0a0'; c.fillRect(x | 0, y | 0, 1, 1); } } }
    // hero
    const h = heroPose(this, st), hs = SP(h.i, h.j, 0); drawShadow(c, hs[0], hs[1], 1 - clamp(h.z / 60, 0, 0.6));
    // spark
    let sp = null;
    if (st.t > 1.2) {
      if (u < 0) { const e = eOut((st.t - 1.2) / 0.8), p = this.sparkPos(st.t); sp = [lerp(IW + 10, p[0], e), lerp(-10, p[1], e)]; }
      else if (u < 1.15) { const p = this.sparkPos(st.t), hand = handPos(h); const k = eIn(clamp((u - 0.6) / 0.55, 0, 1)); sp = [lerp(p[0], hand[0], k), lerp(p[1], hand[1], k)]; }
      else if (u < 1.7) sp = handPos(h);
      else if (u < 2.2) { const a = handPos(h), k = clamp((u - 1.7) / 0.5, 0, 1); sp = [lerp(a[0], LB[0], k), lerp(a[1], LB[1], k) - Math.sin(k * Math.PI) * 30]; }
    }
    if (sp) { trail(st, sp, ['#fff0a0', '#ffd23f', '#ff9a3c', '#ff4d6d']); c.globalCompositeOperation = 'lighter'; c.drawImage(glow('#7a5a10', 14, 1.4), sp[0] - 14, sp[1] - 14); c.globalCompositeOperation = 'source-over'; c.drawImage(SPR.spark[((st.t * 12) | 0) % 2], Math.round(sp[0] - 4), Math.round(sp[1] - 4)); }
    else st.trail = [];
    auraFX(c, hs, h, st); drawHero(c, hs[0], hs[1] - h.z, h.f, h.flip, null, h);
    if (u > 2.4) { const k = clamp((u - 2.4) / 0.25, 0, 1), bob = Math.round(Math.sin(st.t * 3) * 1.5); const bx = hs[0] - 6, by = hs[1] - 66 - Math.round((1 - eOut(k)) * -10) + bob;
      c.globalCompositeOperation = 'lighter'; c.drawImage(glow('#6a4a10', 20, 1.5), bx + 6 - 20, by + 7 - 20); c.globalCompositeOperation = 'source-over';
      if (k > 0.2) { for (let a = 0; a < 8; a++) { if (((st.t * 8) | 0) % 2 === a % 2) continue; const an = a * Math.PI / 4, r0 = 11, r1 = 15; c.fillStyle = '#ffd23f'; for (let rr = r0; rr < r1; rr++) c.fillRect(Math.round(bx + 6 + Math.cos(an) * rr), Math.round(by + 7 + Math.sin(an) * rr), 1, 1); } c.drawImage(SPR.bulb, bx, by); } }
  },
  events() { return [
    [1.15, (ff, st) => { const p = handPos(heroPose(this, st)); if (!ff) hitFX(p[0], p[1]); oppHP(0); addScore(1000); if (!ff) scorePop(p[0], p[1] - 10, '+1000'); }],
    [1.35, (ff) => { if (!ff) { beat('K.O.', '', 0.8); sfx('ko'); } }],
    [1.6, (ff, st) => { if (!ff) { const h = SP(this.hero[0], this.hero[1], 0); dust(h[0], h[1], 8); sfx('land'); } }],
    [2.2, (ff) => { if (!ff) { flashA = 0.6; flashCol = '#ffd36b'; sfx('power'); } }],
    [2.45, (ff) => { if (!ff) sfx('spark'); }],
  ]; },
  pose(st, u) { // special-move hero override
    const [i, j] = this.hero;
    if (u < 0.9) return { i, j, z: 0, f: 'crouch' };
    if (u < 1.6) { const k = (u - 0.9) / 0.7; return { i: i + 0.05, j, z: Math.sin(k * Math.PI) * 38, f: 'jump' }; }
    if (u < 1.75) return { i, j, z: 0, f: 'crouch' };
    if (u < 2.5) return { i, j, z: 0, f: (st.t * 3 | 0) % 2 ? 'idle1' : 'idle0' };
    return { i, j, z: 0, f: (st.t * 4 | 0) % 2 ? 'cheer1' : 'cheer' };
  },
};

/* ---------- STAGE 2: DESIGN ---------- */
const DESIGN = {
  n: 1, name: 'DESIGN', head: 'FORGE THE BRAND', move: 'BRAND FORGE!', opp: 'CHAOS PIXELS',
  copy: 'Name, identity and interface designed as one system, so the product looks and feels like something people trust.',
  hero: [1.35, 3.7], cyL: 104, SD: 3.4,
  build() {
    const P = PAL, cream = R(['#3a2238', '#5c3550', '#8a5670', '#b98593', '#e2b8b4', '#f6dcc8', '#fff3e6', '#ffffff']),
      wall = R(['#06222a', '#0b3440', '#124a5a', '#1a6478', '#238296', '#35a4b6', '#5ec6d2', '#9ae6ea']),
      found = R(['#120614', '#1d0b22', '#2a1230', '#3a1a40', '#4b2452']);
    const light = { amb: 0.1, ls: [[0.6, 0.6, 72, 6.5, 2.4], [2.6, 0.2, 30, 2.5, 0.8]] };
    const b = new Buf(DW, DH), W = new World(b, OX, OY, light);
    const props = (W) => {
      // drafting table
      W.box(0.12, 3.35, 0, 0.12, 0.12, 13, P.metal, { t: 5 }); W.box(0.95, 3.35, 0, 0.12, 0.12, 13, P.metal, { t: 5 }); W.box(0.12, 4.55, 0, 0.12, 0.12, 13, P.metal, { t: 5 }); W.box(0.95, 4.55, 0, 0.12, 0.12, 13, P.metal, { t: 5 });
      W.box(0.06, 3.3, 13, 1.06, 1.42, 2, P.wood, { t: 5 });
      W.box(0.25, 3.5, 15, 0.7, 0.9, 0.8, P.paper, { t: 5, texT: (p) => { const u = (p[0] - 0.25) * 16, v = (p[1] - 3.5) * 16; return (Math.abs(u - 5) < 0.6 || Math.abs(v - 7) < 0.6) ? [P.teal, 5] : (Math.hypot(u - 5, v - 7) > 3 && Math.hypot(u - 5, v - 7) < 4 ? [P.pink, 5] : 0); } });
      // paint cans + swatch fan
      W.cyl(0.35, 0.45, 0, 0.16, 7, P.metal, 3, { tex: () => 0 }); W.cyl(0.75, 0.38, 0, 0.16, 7, P.metal, 3, {}); W.cyl(0.45, 0.85, 0, 0.16, 7, P.metal, 3, {});
      // plant
      W.cyl(4.35, 0.6, 0, 0.26, 10, P.orange, 3, {});
      // stools
      W.cyl(1.7, 1.25, 0, 0.18, 10, P.violet, 3, {});
    };
    const dry = new World(new Buf(1, 1), OX, OY, light); props(dry); W.shadows = dry.shadows;
    const sw = [P.violet, P.pink, P.yel, P.green, P.teal, P.red];
    const wallJ = (p, x, y) => { const i = p[0], z = p[2]; if (z < -0.5) return [found, 3];
      if (i > 0.95 && i < 4.05 && z > 13 && z < 49) { if (i < 1.05 || i > 3.95 || z < 14 || z > 48) return [P.wood, i < 1.05 ? 5 : 3]; return [P.paper, 5 + (bay(x, y) > 0.85 ? 0 : 0)]; }
      if (z < 2) return [P.paper, 2]; if (z > 50) return [P.paper, 4];
      return (Math.floor(i * 4) + Math.floor(z / 8)) % 2 ? 0 : -1; };
    const wallI = (p, x, y) => { const j = p[1], z = p[2]; if (z < -0.5) return [found, 2];
      if (j > 0.55 && j < 2.5 && z > 18 && z < 46) { const k = Math.floor((j - 0.55) / 0.325); if ((j - 0.55) % 0.325 < 0.04) return [PAL.metal, 1]; const v = (46 - z) / 28; return [sw[k % 6], clamp(6 - Math.floor(v * 4 + bay(x, y) * 0.5), 1, 7)]; }
      if (j > 2.9 && j < 4.4 && z > 19 && z < 44) { if (j < 2.96 || j > 4.34 || z < 20 || z > 43) return [P.metal, 2]; const u = Math.floor((4.34 - j) * 16), v = Math.floor(43 - z);
        const A = ['00111100', '01100110', '11000011', '11000011', '11111111', '11000011', '11000011', '11000011'], a = ['0111100', '0000110', '0111110', '1100110', '1100110', '0111111'];
        if (v >= 4 && v < 20 && u >= 1 && u < 17) { const gy = (v - 4) >> 1, gx = (u - 1) >> 1; if (A[gy] && A[gy][gx] === '1') return [PAL.violet, 4, true]; }
        if (v >= 8 && v < 20 && u >= 17 && u < 24) { const gy = ((v - 8) >> 1), gx = (u - 17); if (a[gy] && a[gy][gx] === '1') return [PAL.pink, 4, true]; }
        if (v > 21 && v < 23 && u > 1 && u < 19) return [PAL.paper, 2, true];
        return [P.paper, 5]; }
      if (z < 2) return [P.paper, 2]; if (z > 50) return [P.paper, 4];
      return (Math.floor(j * 4) + Math.floor(z / 8)) % 2 ? 0 : -1; };
    W.box(0, -0.3, -16, 5, 0.3, 68, wall, { t: 6, l: 4, r: 2, texL: wallJ, sh: false, texT: () => [P.paper, 5] });
    W.box(-0.3, 0, -16, 0.3, 5, 68, wall, { t: 6, l: 2, r: 3, texR: wallI, sh: false, texT: () => [P.paper, 5] });
    W.box(-0.3, -0.3, -16, 0.3, 0.3, 68, wall, { t: 6, l: 3, r: 2, sh: false, texT: () => [P.paper, 6] });
    base(W, found, 16, (p) => (p[2] > -3 ? [P.pink, p[2] > -1.2 ? 5 : 3] : 0));
    floor(W, cream, 4, (p, x, y) => { const i = p[0], j = p[1], ao = W.ao(i, j, x, y, true); const ck = (Math.floor(i * 2) + Math.floor(j * 2)) & 1;
      const d = Math.hypot(i - 2.9, j - 2.9); const ring = d > 1.25 && d < 1.38;
      if (ring) return [P.violet, 5 + ao];
      return ck ? [P.pink, 4 + ao] : ao; });
    props(W);
    // leaves on the plant
    const [px0, py0] = W.P(4.35, 0.6, 10); const lr = rng(8);
    for (let k = 0; k < 120; k++) { const a = lr() * Math.PI * 2, rr = Math.sqrt(lr()) * 11; const x = Math.round(px0 + Math.cos(a) * rr * 1.1), y = Math.round(py0 - 9 + Math.sin(a) * rr * 0.9 - (1 - rr / 11) * 4); b.px(x, y, P.green[clamp(3 + Math.floor((-Math.cos(a) - Math.sin(a)) * 1.2 + lr() * 1.5), 1, 6)]); }
    // paint can tops colors
    for (const [i, j, rp] of [[0.35, 0.45, P.pink], [0.75, 0.38, P.teal], [0.45, 0.85, P.yel]]) { const [x, y] = W.P(i, j, 7); for (let dx = -2; dx <= 2; dx++) for (let dy = -1; dy <= 0; dy++) b.px(x + dx, y + dy, rp[5]); }
    b.outline(hx(PAL.ink));
    this.d0 = this.d1 = b; this.W = new World(null, OX, OY);
    this.shapes = [shapeSprite(0, P.pink), shapeSprite(1, P.teal), shapeSprite(2, P.yel)];
    this.mark = markBuf();
  },
  bg(b) {
    gradFill(b, R(['#12051e', '#1d0b2b', '#2b1038', '#3b1546', '#4f1b55', '#672365', '#822e72', '#a03c7c']), 0, b.h);
    const cx = b.w * 0.5, cy = b.h * 0.62, r = Math.min(b.w, b.h) * 0.42, sun = R(['#e04a7c', '#f06a7a', '#ff8f70', '#ffb36b', '#ffd36b']);
    for (let y = Math.floor(cy - r); y < cy + r; y++) { const fy = (y - (cy - r)) / (2 * r); if (fy > 0.45 && ((y - Math.floor(cy)) % 7 + 7) % 7 < 1 + fy * 4) continue; for (let x = Math.floor(cx - r); x < cx + r; x++) { if (Math.hypot(x - cx, y - cy) < r) b.px(x, y, sun[clamp(Math.floor((1 - fy) * 4.4 + bay(x, y) - 0.5), 0, 4)]); } }
    const g = hx('#3a1550'); for (let y = Math.floor(b.h * 0.8); y < b.h; y++) for (let x = 0; x < b.w; x++) b.px(x, y, g);
    for (let k = -20; k <= 20; k++) b.line(cx, b.h * 0.8, cx + k * 40, b.h + 10, hx('#8a3a8a'));
    for (let y = b.h * 0.8, s = 2; y < b.h; y += s, s *= 1.5) for (let x = 0; x < b.w; x++) b.px(x, y, hx('#8a3a8a'));
  },
  bgDyn(c, t) { const r = rng(21); for (let k = 0; k < 9; k++) { const sx = r() * IW, sy = r() * IH * 0.7, sp = 3 + r() * 6, kind = k % 3, col = ['#f07fb6', '#5ec6d2', '#ffd23f'][k % 3]; const x = Math.round((sx + t * sp) % (IW + 20) - 10), y = Math.round(sy + Math.sin(t + k) * 4); c.fillStyle = col; c.globalAlpha = 0.35;
    if (kind === 0) { c.fillRect(x - 2, y - 3, 5, 7); c.fillRect(x - 3, y - 2, 7, 5); } else if (kind === 1) { for (let q = 0; q < 6; q++) c.fillRect(x - q / 2, y + q, q + 1, 1); } else c.fillRect(x - 3, y - 3, 6, 6); c.globalAlpha = 1; } },
  shapePos(k, st) { const base = [[3.15, 2.35], [3.7, 3.2], [2.75, 3.15]][k]; const t = st.t, enter = 1.2 + k * 0.22; let z = 0;
    if (t < enter + 0.4) z = 120 * (1 - eIn(clamp((t - enter) / 0.4, 0, 1))); else z = Math.abs(Math.sin((t - enter) * 4.4 + k)) * 9;
    return { i: base[0], j: base[1], z, vis: t > enter }; },
  draw(c, st) {
    drawDior(c, this, 0);
    const u = st.sp == null ? -1 : st.t - st.sp;
    // canvas on wall: mark reveal
    const mx = SP(1.75, 0, 46);
    if (u > 2.05) { const k = clamp((u - 2.05) / 0.7, 0, 1), rows = Math.floor(k * this.mark.h); const part = new Buf(this.mark.w, this.mark.h); part.d.set(this.mark.d.subarray(0, rows * this.mark.w)); wallPaint(c, part, mx[0], mx[1] + 2, 1);
      if (k < 1) { c.fillStyle = '#ffffff'; for (let x = 0; x < this.mark.w; x += 2) c.fillRect(mx[0] + x, mx[1] + 2 + rows + (x >> 1), 2, 1); }
      if (u > 2.8) { const k2 = clamp((u - 2.8) / 0.3, 0, 1), tb = new Buf(26, 7), dk = hx('#2e2a44'), vi = hx('#8239ea'); const w1 = Math.round(22 * k2), w2 = Math.round(14 * k2); tb.rect(2, 0, w1, 2, dk); tb.rect(6, 4, w2, 1, vi); wallPaint(c, tb, mx[0], mx[1] + 30, 1); } }
    else { c.fillStyle = 'rgba(46,42,68,.18)'; for (let x = 0; x < 26; x += 3) for (let y = 0; y < 30; y += 3) c.fillRect(mx[0] + x, mx[1] + 2 + y + (x >> 1), 1, 1); }
    // hero
    const h = heroPose(this, st), hs = SP(h.i, h.j, 0); drawShadow(c, hs[0], hs[1], 1);
    // shapes
    const hitT = [1.0, 1.15, 1.3];
    for (let k = 0; k < 3; k++) { const p = this.shapePos(k, st); if (!p.vis) continue; let s = SP(p.i, p.j, p.z), white = false, gone = false;
      if (u >= hitT[k]) { const q = clamp((u - hitT[k] - 0.15) / 0.65, 0, 1), tgt = [mx[0] + 4 + k * 8, mx[1] + 10 + k * 5]; if (q >= 1) gone = true; s = [lerp(s[0], tgt[0], eIn(q)), lerp(s[1], tgt[1], eIn(q)) - Math.sin(q * Math.PI) * 40]; white = u - hitT[k] < 0.12; }
      if (u > 2.05) gone = true;
      if (gone) continue; const sh = SP(p.i, p.j, 0); if (u < hitT[k]) drawShadow(c, sh[0], sh[1], 0.7);
      const img = white ? tint(this.shapes[k], '#ffffff') : this.shapes[k]; c.drawImage(img, Math.round(s[0] - 7), Math.round(s[1] - 14)); }
    // afterimages during dash
    if (u > 0.9 && u < 1.5) for (let a = 3; a >= 1; a--) { const hp = heroPose(this, Object.assign({}, st, { t: st.t - a * 0.04 })), ps = SP(hp.i, hp.j, 0); c.globalAlpha = 0.18 * (4 - a); drawHero(c, ps[0], ps[1] - hp.z, hp.f, hp.flip, a % 2 ? '#b07cff' : '#2fb7c9'); c.globalAlpha = 1; }
    auraFX(c, hs, h, st); drawHero(c, hs[0], hs[1] - h.z, h.f, h.flip, null, h);
    if (h.f === 'punch') { const hd = handPos(h); c.fillStyle = '#d9c4ff'; c.fillRect(hd[0] + 3, hd[1] - 1, 7, 2); c.fillStyle = '#ffffff'; c.fillRect(hd[0] + 9, hd[1] - 1, 2, 2); }
  },
  events() { return [
    ...[1.0, 1.15, 1.3].map((t, k) => [t, (ff, st) => { const p = this.shapePos(k, st), s = SP(p.i, p.j, p.z); if (!ff) { hitFX(s[0], s[1] - 7); sfx('slash'); slashes.push({ x: s[0], y: s[1] - 7, t: 0, kind: 'arc' }); scorePop(s[0], s[1] - 20, '+500'); } oppHP(1 - (k + 1) / 3); addScore(500); }]),
    [1.5, (ff) => { if (!ff) { beat('K.O.', '', 0.8); sfx('ko'); } }],
    [2.05, (ff) => { if (!ff) { flashA = 0.4; flashCol = '#f07fb6'; sfx('power'); } }],
    [2.8, (ff) => { if (!ff) sfx('spark'); }]]; },
  pose(st, u) { const [i, j] = this.hero;
    if (u < 0.9) return { i, j, z: 0, f: 'crouch' };
    if (u < 1.45) { const k = eOut((u - 0.9) / 0.15); return { i: i + 0.95 * k, j: j - 0.55 * k, z: 0, f: u < 1.42 ? 'punch' : 'idle0' }; }
    if (u < 2.9) return { i: i + 0.95, j: j - 0.55, z: 0, f: (st.t * 3 | 0) % 2 ? 'idle1' : 'idle0' };
    return { i: i + 0.95, j: j - 0.55, z: 0, f: (st.t * 4 | 0) % 2 ? 'cheer1' : 'cheer' }; },
  endPos() { return [this.hero[0] + 0.95, this.hero[1] - 0.55]; },
};

/* ---------- STAGE 3: BUILD ---------- */
const BUILD = {
  n: 2, name: 'BUILD', head: 'BUILD THE REAL THING', move: 'CODE STACK!', opp: 'BUG SWARM',
  copy: 'A working app, not a mockup: real screens, real data, tested on real phones.',
  hero: [1.25, 3.75], cyL: 104, SD: 3.5, spot: [3.05, 2.55],
  build() {
    const P = PAL, steel = R(['#0b0f18', '#141b28', '#1f2a3b', '#2c3a50', '#3d4e68', '#526682', '#6d84a0', '#93a9c2', '#c4d4e4']),
      panel = R(['#05080e', '#0a1019', '#101826', '#172234', '#1f2d44', '#2a3b56', '#384c6a']),
      cyan = R(['#062a33', '#0b4a5a', '#127a8c', '#1aa3c4', '#3ee6ff', '#b6f6ff']);
    const light = { amb: -0.3, ls: [[0.2, 2.4, 28, 3.2, 2.2], [2.6, 2.6, 80, 5.2, 1.8]] };
    const b = new Buf(DW, DH), W = new World(b, OX, OY, light);
    this.leds = [];
    const racks = [[0.35, 1.2], [1.4, 2.25], [2.45, 3.3]];
    const props = (W) => {
      for (const [i0, i1] of racks) W.box(i0, 0.05, 0, i1 - i0, 0.7, 46, steel, { t: 4, l: 2, r: 1, texL: (p, x, y) => { const u = (p[0] - i0) * 16, v = p[2]; if (u < 1 || u > (i1 - i0) * 16 - 1 || v < 2 || v > 44) return 0; const row = Math.floor((v - 2) / 6), dv = (v - 2) % 6; if (dv < 1) return -2; if (dv > 4.4) return -1; return (u > 4 && Math.floor(u) % 2 === 0) ? -2 : 0; } });
      // workbench front-right
      W.box(3.65, 3.3, 10, 1.2, 1.5, 2.5, P.wood, { t: 5 });
      W.box(3.7, 3.35, 0, 0.12, 0.12, 10, steel, { t: 5 }); W.box(4.65, 3.35, 0, 0.12, 0.12, 10, steel, { t: 5 }); W.box(3.7, 4.65, 0, 0.12, 0.12, 10, steel, { t: 5 }); W.box(4.65, 4.65, 0, 0.12, 0.12, 10, steel, { t: 5 });
      W.box(3.85, 3.5, 12.5, 0.55, 0.35, 5, P.red, { t: 4 });
      W.box(4.0, 4.15, 12.5, 0.5, 0.25, 1, P.metal, { t: 5, texT: () => [cyan, 3, true] });
      // crates
      W.box(0.15, 4.0, 0, 0.75, 0.75, 12, P.wood, { t: 4, texL: (p) => (Math.abs(p[2] - 6) < 0.8 ? -2 : 0), texR: (p) => (Math.abs(p[2] - 6) < 0.8 ? -2 : 0) });
      W.box(0.25, 4.1, 12, 0.55, 0.55, 8, P.wood, { t: 5 });
    };
    const dry = new World(new Buf(1, 1), OX, OY, light); props(dry); W.shadows = dry.shadows;
    const wallJ = (p, x, y) => { const i = p[0], z = p[2]; if (z < -0.5) return [panel, 2]; if (Math.abs(z - 52) < 1) return [cyan, 3]; if (z > 47 && z < 50 && (Math.floor(i * 16) % 3 === 0)) return [panel, 0, true]; return (i % 1) < 0.04 || (z % 16) < 0.8 ? -2 : (Math.floor(i * 2 + z / 16) % 2 ? 0 : -1); };
    const wallI = (p, x, y) => { const j = p[1], z = p[2]; if (z < -0.5) return [panel, 1];
      if (j > 1.15 && j < 3.75 && z > 16 && z < 44) { if (j < 1.24 || j > 3.66 || z < 17.5 || z > 42.5) return [P.metal, 3]; return [panel, 0, true]; }
      if (Math.abs(z - 50) < 1.2 || Math.abs(z - 9) < 1) return [cyan, 3]; return (j % 1) < 0.04 || (z % 16) < 0.8 ? -2 : (Math.floor(j * 2 + z / 16) % 2 ? 0 : -1); };
    W.box(0, -0.3, -16, 5, 0.3, 68, panel, { t: 5, l: 4, r: 2, texL: wallJ, sh: false, texT: () => [steel, 5] });
    W.box(-0.3, 0, -16, 0.3, 5, 68, panel, { t: 5, l: 3, r: 3, texR: wallI, sh: false, texT: () => [steel, 5] });
    W.box(-0.3, -0.3, -16, 0.3, 0.3, 68, panel, { t: 5, l: 3, r: 2, sh: false, texT: () => [steel, 6] });
    base(W, panel, 16, (p) => (p[2] > -3 ? [P.yel, p[2] > -1.2 ? 4 : 2] : ((Math.floor(p[2]) === -9) ? [cyan, 2] : 0)));
    floor(W, steel, 3, (p, x, y) => { const i = p[0], j = p[1], ao = W.ao(i, j, x, y, true);
      if (i > 4.7 || j > 4.7) return [((Math.floor((i + j) * 3)) & 1) ? P.yel : P.metal, ((Math.floor((i + j) * 3)) & 1) ? 4 : 1];
      const fi = i % 1, fj = j % 1; if (fi < 0.05 || fj < 0.05) return -2 + ao; if ((fi < 0.12 || fi > 0.88) && (fj < 0.12 || fj > 0.88)) return 2;
      if (Math.floor(i) === 3 && Math.floor(j) === 2) { if (((i * 8) % 1) < 0.35) return -2 + ao; }
      const cab = Math.abs(j - (1.05 + Math.sin(i * 2.2) * 0.25)); if (i < 3.2 && cab < 0.07) return [P.metal, 1]; if (i < 3.2 && cab < 0.1) return [P.metal, 3];
      const cab2 = Math.abs(i - (0.95 + Math.sin(j * 2.6) * 0.2)); if (j > 1.2 && j < 3.9 && cab2 < 0.06) return [cyan, 1];
      return ao + (h2(Math.floor(i), Math.floor(j)) > 0.5 ? 0 : -1); });
    props(W);
    for (const [i0, i1] of racks) for (let row = 0; row < 7; row++) for (let k = 0; k < 2; k++) { const [x, y] = W.P(i0 + 0.1 + k * 0.1, 0.75, 4.5 + row * 6); this.leds.push([x - OX, y - OY, (h2(row, k + i0 * 9) * 4) | 0, h2(row * 3, k) * 6]); }
    b.outline(hx(PAL.ink));
    this.d0 = this.d1 = b; this.W = new World(null, OX, OY);
    const cubes = [P.violet, P.teal, P.green, P.pink, P.yel, P.violet]; this.cubes = cubes.map((r, k) => cubeSprite(r, k % 3));
    this.phone = [phoneSprite(false), phoneSprite(true)];
    this.bugs = [[3.9, 1.8, 0], [2.4, 2.1, 1], [3.4, 3.2, 2], [4.2, 2.7, 3], [2.8, 4.0, 4]];
  },
  bg(b) {
    gradFill(b, R(['#03060c', '#050b14', '#081424', '#0c1d33', '#112843', '#163354']), 0, b.h);
    const vy = b.h * 0.72; for (let k = -24; k <= 24; k++) b.line(b.w / 2, vy, b.w / 2 + k * 30, b.h + 20, hx('#0f3a52'));
    for (let y = vy, s = 2; y < b.h; y += s, s *= 1.45) for (let x = 0; x < b.w; x++) b.px(x, y, hx('#0f3a52'));
    skyline(b, vy + 1, hx('#0a1626'), [hx('#3ee6ff'), hx('#8be36a'), hx('#1aa3c4')], 31, b.h * 0.08, b.h * 0.34, 10);
  },
  bgDyn(c, t) { const r = rng(77), cols = ['#3ee6ff', '#8be36a', '#1aa3c4']; for (let k = 0; k < 22; k++) { const x = Math.floor(r() * IW), sp = 18 + r() * 30, len = 6 + (r() * 10) | 0, y0 = (r() * IH + t * sp) % (IH + 30) - 20; for (let q = 0; q < len; q++) { if (h2(k, q + Math.floor(t * 6)) < 0.35) continue; c.fillStyle = q === len - 1 ? '#d6fbff' : cols[k % 3]; c.globalAlpha = 0.25 + 0.5 * (q / len); c.fillRect(x, Math.floor(y0 + q * 3), 2, 2); } } c.globalAlpha = 1; },
  bugPos(k, st) { const b = this.bugs[k], t = st.t; const enter = 1.2 + k * 0.12; const a = t * 0.9 + b[2] * 1.7;
    let i = b[0] + Math.sin(a) * 0.45, j = b[1] + Math.cos(a * 1.3) * 0.35; if (t < enter + 0.6) { const q = eOut(clamp((t - enter) / 0.6, 0, 1)); i = lerp(5.6, i, q); }
    return { i, j, vis: t > enter, dir: Math.cos(a) > 0 }; },
  draw(c, st) {
    drawDior(c, this, 0);
    const u = st.sp == null ? -1 : st.t - st.sp, O = [OFF[0] + OX - OX, OFF[1]];
    for (const L of this.leds) { const on = Math.sin(st.t * (3 + L[3]) + L[3] * 7) > -0.2; c.fillStyle = on ? ['#8be36a', '#3ee6ff', '#ffd23f', '#ff4d6d'][L[2]] : '#141b28'; c.fillRect(OFF[0] + OX + L[0], OFF[1] + OY + L[1], 2, 1); }
    // code on the wall monitor (sheared on the i=0 face)
    const r = rng(4), lines = 8, scroll = Math.floor(st.t * 4);
    for (let ln = 0; ln < lines; ln++) { const z = 40 - ln * 3, seed = ln + scroll; const ind = (h2(seed, 1) * 4) | 0, len = 6 + ((h2(seed, 2) * 22) | 0), col = ['#3ee6ff', '#8be36a', '#f07fb6', '#ffd23f', '#d6fbff'][(h2(seed, 3) * 5) | 0];
      for (let q = 0; q < len; q++) { const jj = 1.32 + (ind + q) / 16; if (jj > 3.58) break; if (h2(seed, q) < 0.18) continue; const p = SP(0, jj, z); c.fillStyle = col; c.fillRect(Math.round(p[0]), Math.round(p[1]), 1, 1); } }
    c.globalCompositeOperation = 'lighter'; const mg = SP(0, 2.4, 30); c.drawImage(glow('#06303a', 30, 1.5), mg[0] - 30 + 8, mg[1] - 30 + 6); c.globalCompositeOperation = 'source-over';
    // bugs
    const popT = (k) => { const p = this.bugPos(k, { t: st.sp != null ? st.sp + 1.15 : st.t }), h = this.hero; return 1.15 + Math.hypot(p.i - h[0], p.j - h[1]) / 3.8 * 0.5; };
    for (let k = 0; k < this.bugs.length; k++) { if (u >= 0 && u > popT(k)) continue; const p = this.bugPos(k, st); if (!p.vis) continue; const s = SP(p.i, p.j, 0); const fr = SPR.bug[((st.t * 10) | 0) % 2][p.dir ? 0 : 1]; c.drawImage(fr, Math.round(s[0] - 4), Math.round(s[1] - 7)); }
    // shockwave
    if (u > 1.15 && u < 1.75) { const k = (u - 1.15) / 0.5, R0 = k * 3.8 * 22.6, hs0 = SP(this.hero[0], this.hero[1], 0); for (let a = 0; a < 96; a++) { const an = a / 96 * Math.PI * 2, x = hs0[0] + Math.cos(an) * R0, y = hs0[1] + Math.sin(an) * R0 / 2; c.fillStyle = a % 2 ? '#3ee6ff' : '#ffffff'; c.globalAlpha = 1 - k; c.fillRect(Math.round(x), Math.round(y), 2, 1); } c.globalAlpha = 1; }
    // stack -> phone
    const sp = SP(this.spot[0], this.spot[1], 0);
    if (u > 1.85) { if (u < 2.85) { drawShadow(c, sp[0], sp[1], 0.9); for (let k = 0; k < 6; k++) { const t0 = 1.9 + k * 0.13; if (u < t0) continue; const q = clamp((u - t0) / 0.18, 0, 1), z = k * 8 + (1 - eIn(q)) * 140; c.drawImage(this.cubes[k], Math.round(sp[0] - 10 + (k % 2 ? 1 : -1)), Math.round(sp[1] - 21 - z)); } }
      else { const on = clamp((u - 2.95) / 0.35, 0, 1); drawShadow(c, sp[0], sp[1], 0.8); c.drawImage(this.phone[0], sp[0] - 18 + 2, sp[1] - 50 - 6); if (on > 0) { const ph = this.phone[1]; const hh = Math.round(ph.height * on); c.drawImage(ph, 0, 0, ph.width, hh, sp[0] - 16, sp[1] - 56, ph.width, hh); }
        c.globalCompositeOperation = 'lighter'; c.drawImage(glow('#0a3a48', 26, 1.4), sp[0] - 26, sp[1] - 52); c.globalCompositeOperation = 'source-over'; } }
    const h = heroPose(this, st), hs = SP(h.i, h.j, 0); drawShadow(c, hs[0], hs[1], 1 - clamp(h.z / 60, 0, 0.6));
    auraFX(c, hs, h, st); drawHero(c, hs[0], hs[1] - h.z, h.f, h.flip, null, h);
  },
  events() { const ev = [ [1.15, (ff) => { const h = SP(this.hero[0], this.hero[1], 0); if (!ff) { shakeA = 7; flashA = 0.5; dust(h[0], h[1], 12); sfx('boom'); } }]];
    this.bugs.forEach((b, k) => { const p0 = this.bugPos(k, { t: 0 }); ev.push([1.2 + k * 0.09, (ff, st) => { const p = this.bugPos(k, st), s = SP(p.i, p.j, 0); if (!ff) { burst(s[0], s[1] - 4, 12, ['#ff4d6d', '#ffffff', '#ffd23f'], 70, 80, 0.5); scorePop(s[0], s[1] - 14, '+100'); sfx('pop'); } addScore(100); oppHP(1 - (k + 1) / this.bugs.length); }]); });
    ev.push([1.75, (ff) => { if (!ff) { beat('K.O.', '', 0.8); sfx('ko'); } }]);
    for (let k = 0; k < 6; k++) ev.push([1.9 + k * 0.13 + 0.18, (ff) => { if (!ff) { const sp = SP(this.spot[0], this.spot[1], 0); dust(sp[0], sp[1] - k * 8, 3); sfx('drop'); } }]);
    ev.push([2.85, (ff) => { if (!ff) { const sp = SP(this.spot[0], this.spot[1], 0); flashA = 0.7; flashCol = '#3ee6ff'; burst(sp[0], sp[1] - 26, 26, ['#3ee6ff', '#8be36a', '#ffffff', '#b07cff'], 90, 0, 0.6); sfx('power'); } }]);
    return ev; },
  pose(st, u) { const [i, j] = this.hero;
    if (u < 0.9) return { i, j, z: 0, f: 'crouch' };
    if (u < 1.15) { const k = (u - 0.9) / 0.25; return { i, j, z: Math.sin(k * Math.PI * 0.5) * 22 * (1 - eIn(k)) + (1 - k) * 0, f: 'jump' }; }
    if (u < 1.6) return { i, j, z: 0, f: 'punchlow' };
    if (u < 3.0) return { i, j, z: 0, f: (st.t * 3 | 0) % 2 ? 'idle1' : 'idle0' };
    return { i, j, z: 0, f: (st.t * 4 | 0) % 2 ? 'cheer1' : 'cheer' }; },
};

/* ---------- STAGE 4: SHIP ---------- */
const SHIP = {
  n: 3, name: 'SHIP', head: 'LAUNCH TO REAL USERS', move: 'LIFT-OFF!', opp: 'ZERO USERS',
  copy: 'Release, landing page and launch. Then it keeps improving with what real users actually do.',
  hero: [0.95, 3.85], cyL: 112, SD: 3.9, pad: [2.85, 2.3],
  build() {
    const P = PAL, conc = R(['#1f1a2a', '#2f2840', '#433a56', '#5b516e', '#776c88', '#958aa4', '#b5abc0', '#d6cede', '#f2ecf4']),
      bld = R(['#0e0918', '#160f24', '#201634', '#2b1e44', '#382856', '#46336a']),
      steel = R(['#0b0f18', '#141b28', '#1f2a3b', '#2c3a50', '#3d4e68', '#526682', '#6d84a0', '#93a9c2']);
    const light = { amb: 0.15, ls: [[6.5, -1.5, 30, 7.5, 2.0]] };
    const b = new Buf(DW, DH), W = new World(b, OX, OY, light);
    const props = (W) => {
      // fuel tanks
      W.cyl(0.55, 0.55, 0, 0.36, 22, P.paper, 3, { lightRight: true, tex: (fx, v) => (Math.abs(v - 14) < 1.5 ? -2 : 0) });
      W.cyl(1.45, 0.42, 0, 0.3, 17, P.paper, 3, { lightRight: true, tex: (fx, v) => (Math.abs(v - 10) < 1.5 ? -2 : 0) });
      // gantry tower
      const g0 = [3.95, 0.25];
      for (const [a, c2] of [[0, 0], [0.62, 0], [0, 0.62], [0.62, 0.62]]) W.box(g0[0] + a, g0[1] + c2, 0, 0.1, 0.1, 98, steel, { t: 5, l: 4, r: 2, sh: true });
      for (let z = 14; z < 98; z += 20) { W.box(g0[0], g0[1], z, 0.72, 0.72, 2, steel, { t: 5, l: 3, r: 2, sh: false }); }
      for (let z = 4; z < 92; z += 20) { const a = W.P(g0[0] + 0.05, g0[1] + 0.72, z), bb = W.P(g0[0] + 0.67, g0[1] + 0.72, z + 18), c1 = W.P(g0[0] + 0.05, g0[1] + 0.72, z + 18), d1 = W.P(g0[0] + 0.67, g0[1] + 0.72, z);
        W.b.line(a[0], a[1], bb[0], bb[1], steel[4]); W.b.line(c1[0], c1[1], d1[0], d1[1], steel[3]);
        const e = W.P(g0[0] + 0.72, g0[1] + 0.05, z), f = W.P(g0[0] + 0.72, g0[1] + 0.67, z + 18), g = W.P(g0[0] + 0.72, g0[1] + 0.05, z + 18), hh = W.P(g0[0] + 0.72, g0[1] + 0.67, z); W.b.line(e[0], e[1], f[0], f[1], steel[3]); W.b.line(g[0], g[1], hh[0], hh[1], steel[2]); }
      W.box(3.2, 0.45, 58, 0.78, 0.2, 3, steel, { t: 5, sh: false });
      // console with the big red button
      W.box(1.5, 3.05, 0, 0.55, 0.45, 11, P.metal, { t: 5, l: 3, r: 2, texL: (p) => { const u = (p[0] - 1.5) * 16, v = p[2]; return (v > 5 && v < 8 && u > 2 && u < 7) ? [P.yel, 4] : 0; } });
      // crates
      W.box(4.1, 3.9, 0, 0.6, 0.6, 9, P.wood, { t: 4 }); W.box(4.15, 3.95, 9, 0.45, 0.45, 7, P.violet, { t: 5 });
      // landing lights posts
      for (const [i, j] of [[0.25, 4.75], [4.75, 4.75], [4.75, 1.6]]) W.box(i - 0.06, j - 0.06, 0, 0.12, 0.12, 5, P.metal, { t: 4 });
    };
    const dry = new World(new Buf(1, 1), OX, OY, light); props(dry); W.shadows = dry.shadows;
    base(W, bld, 30, (p, x, y) => { const z = -p[2], u = (Math.abs(p[1] - 5) < 0.01 ? p[0] : p[1]); if (z < 3) return [conc, z < 1.3 ? 6 : 4]; if (z < 4.5) return [P.yel, 3];
      const wy = Math.floor((z - 6) / 7), wv = (z - 6) % 7, wu = (u * 4) % 1; if (wv > 1.5 && wv < 5 && wu > 0.25 && wu < 0.75 && z < 28) { const lit = h2(Math.floor(u * 4), wy) > 0.45; return lit ? [P.yel, 4 + (wv < 2.5 ? 1 : 0), true] : [bld, 1, true]; } return 0; });
    floor(W, conc, 4, (p, x, y) => { const i = p[0], j = p[1], ao = W.ao(i, j, x, y, false); const d = Math.hypot((i - this.pad[0]), (j - this.pad[1]));
      if (d < 1.0) { const g = ((i * 6) % 1 < 0.2) || ((j * 6) % 1 < 0.2); return [steel, (g ? 2 : 4) - (d < 0.35 ? 1 : 0)]; }
      if (d < 1.25) { const an = Math.atan2(j - this.pad[1], i - this.pad[0]); return ((Math.floor(an / Math.PI * 8) + 16) & 1) ? [P.yel, 4] : [P.metal, 1]; }
      if (i > 4.82 || j > 4.82) return [P.yel, 3]; if ((i % 1.25) < 0.04 || (j % 1.25) < 0.04) return -2 + ao; return ao + (h2(Math.floor(i / 1.25), Math.floor(j / 1.25)) > 0.5 ? 0 : -1) + (h2(x, y) > 0.93 ? -1 : 0); });
    props(W);
    // big red button + landing lights
    const bt = W.P(1.77, 3.27, 11); this.btn = [bt[0] - OX, bt[1] - OY];
    this.lights = [[0.25, 4.75], [4.75, 4.75], [4.75, 1.6]].map(([i, j]) => { const q = W.P(i, j, 6); return [q[0] - OX, q[1] - OY]; });
    const gt = W.P(4.3, 0.6, 99); this.beacon = [gt[0] - OX, gt[1] - OY];
    b.outline(hx(PAL.ink));
    this.d0 = this.d1 = b; this.W = new World(null, OX, OY);
    this.rocket = rocketSprite(); this.cloud = cloudSprite(true); this.cloudSoft = cloudSprite(false, ['#4a2050', '#6a2a5e', '#8e3a66', '#b8506c', '#dc6e6e', '#f29a7a', '#ffc8a0']);
  },
  bg(b) {
    const sky = R(['#1d1238', '#2b1748', '#3a1a52', '#552360', '#6a2a66', '#8a3468', '#a8436b', '#c8566a', '#e06a5c', '#f08a5c', '#f5a25e', '#ffc879']);
    gradFill(b, sky, 0, Math.floor(b.h * 0.78));
    const sx = b.w * 0.72, sy = b.h * 0.78, sun = R(['#ff9a5c', '#ffb86b', '#ffd38a', '#fff0c0']);
    for (let y = Math.floor(sy - 34); y < sy; y++) for (let x = Math.floor(sx - 34); x < sx + 34; x++) { const d = Math.hypot(x - sx, y - sy); if (d < 34) b.px(x, y, sun[clamp(Math.floor((1 - d / 34) * 4 + bay(x, y) - 0.3), 0, 3)]); }
    const sea = R(['#1a1030', '#24143e', '#34194c', '#4a2058']); gradFill(b, sea, Math.floor(b.h * 0.78), b.h);
    for (let y = Math.floor(b.h * 0.78) + 2; y < b.h; y += 3) { const w = 26 - (y - b.h * 0.78) * 0.2; for (let x = Math.floor(sx - w); x < sx + w; x++) if (h2(x >> 2, y) > 0.35) b.px(x, y, hx('#ffb86b')); }
    skyline(b, Math.floor(b.h * 0.78) + 1, hx('#1a0f2c'), [hx('#ffd36b'), hx('#f07fb6')], 51, 6, b.h * 0.22, 9);
  },
  bgDyn(c, t, st) { const r = rng(9); for (let k = 0; k < 6; k++) { const y = r() * IH * 0.45 + 6, sp = 3 + r() * 5, x = Math.round(((r() * IW) + t * sp) % (IW + 80) - 60); c.drawImage(this.cloudSoft, x, Math.round(y)); }
    for (let k = 0; k < 4; k++) { const x = Math.round((t * (14 + k * 3) + k * 90) % (IW + 40) - 20), y = Math.round(IH * 0.3 + k * 9 + Math.sin(t * 4 + k) * 2), f = ((t * 6 + k) | 0) % 2; c.fillStyle = '#1d1238'; c.fillRect(x - 2, y - f, 2, 1); c.fillRect(x, y, 1, 1); c.fillRect(x + 1, y - f, 2, 1); } },
  rocketZ(u) { return u < 2.15 ? 0 : 230 * Math.pow(u - 2.15, 2) + 30 * (u - 2.15); },
  draw(c, st) {
    drawDior(c, this, 0);
    const u = st.sp == null ? -1 : st.t - st.sp, O = [OFF[0] + OX, OFF[1] + OY];
    // blinking lights
    if (Math.sin(st.t * 5) > 0) { c.fillStyle = '#ff4d6d'; c.fillRect(O[0] + this.beacon[0] - 1, O[1] + this.beacon[1] - 1, 2, 2); c.globalCompositeOperation = 'lighter'; c.drawImage(glow('#5a0a1c', 8, 1.5), O[0] + this.beacon[0] - 8, O[1] + this.beacon[1] - 8); c.globalCompositeOperation = 'source-over'; }
    for (let k = 0; k < this.lights.length; k++) if (((st.t * 3 | 0) + k) % 3 === 0) { c.fillStyle = '#ffd23f'; c.fillRect(O[0] + this.lights[k][0] - 1, O[1] + this.lights[k][1] - 1, 2, 2); }
    const bp = [O[0] + this.btn[0], O[1] + this.btn[1]], pressed = u > 0.98 && u < 1.25;
    c.fillStyle = '#7a1428'; c.fillRect(bp[0] - 3, bp[1] - 1, 6, 3); c.fillStyle = pressed ? '#ffb0b8' : '#e83a52'; c.fillRect(bp[0] - 3, bp[1] - (pressed ? 1 : 3), 6, 3); c.fillStyle = '#ff6f80'; c.fillRect(bp[0] - 2, bp[1] - (pressed ? 1 : 3), 2, 1);
    if (Math.sin(st.t * 6) > 0 && u < 1) { c.globalCompositeOperation = 'lighter'; c.drawImage(glow('#4a0a14', 9, 1.4), bp[0] - 9, bp[1] - 10); c.globalCompositeOperation = 'source-over'; }
    // rocket
    const pd = SP(this.pad[0], this.pad[1], 0), rz = this.rocketZ(Math.max(0, u)), shk = u > 1.1 && u < 2.6 ? ((st.t * 40 | 0) % 2 ? 1 : -1) : 0;
    const smokeN = u > 1.6 ? Math.min(1, (u - 1.6) / 0.6) : 0;
    if (st.cleared) { // lingering contrail
      for (let y = 0; y < pd[1] - 30; y += 2) { const w = 2 + Math.floor((pd[1] - y) / 40); c.fillStyle = y % 4 ? 'rgba(242,236,244,.35)' : 'rgba(214,206,222,.25)'; c.fillRect(pd[0] - w + Math.round(Math.sin(y * 0.05 + st.t) * 2), y, w * 2, 2); } }
    if (rz < IH + 120 && !(st.cleared && u > 4.5)) {
      const rx = pd[0] - 11 + shk, ry = pd[1] - 52 - rz;
      if (u > 1.9) { const fl = 8 + ((st.t * 30) | 0) % 3 * 3 + (u > 2.15 ? 10 : 0); for (let y = 0; y < fl; y++) { const w = Math.max(1, Math.round(4 * (1 - y / fl) + 1)); c.fillStyle = y < 3 ? '#fffbe0' : y < fl * 0.4 ? '#ffd23f' : y < fl * 0.7 ? '#ff9a3c' : '#ff4d6d'; c.fillRect(pd[0] - w + shk, ry + 53 + y, w * 2, 1); }
        c.globalCompositeOperation = 'lighter'; c.drawImage(glow('#6a3a10', 22, 1.4), pd[0] - 22, ry + 50); c.globalCompositeOperation = 'source-over'; }
      if (rz < 4) drawShadow(c, pd[0], pd[1], 0.9);
      c.drawImage(this.rocket, Math.round(rx), Math.round(ry));
    }
    // smoke billows on the pad
    if (smokeN > 0 && !st.cleared) { const r = rng(12); for (let k = 0; k < 22; k++) { const a = r() * Math.PI * 2, d = (0.3 + r() * 1.5) * smokeN * (1 + Math.max(0, u - 2.2) * 0.4), rr = 3 + r() * 6 * smokeN; const x = pd[0] + Math.cos(a) * d * 22, y = pd[1] + Math.sin(a) * d * 11 - rr * 0.6; c.drawImage(glow(k % 3 ? '#d6cede' : '#f2ecf4', Math.max(2, Math.round(rr)), 0.4), Math.round(x - rr), Math.round(y - rr)); } }
    // cloud: ZERO USERS
    if (st.t > 1.2 && !(u > 2.79)) { const e = eOut((st.t - 1.2) / 0.9), cp = SP(this.pad[0] + 0.2, this.pad[1] - 0.2, 108); const x = lerp(IW + 30, cp[0] - 26, e), y = cp[1] + Math.round(Math.sin(st.t * 2) * 2);
      c.drawImage(this.cloud, Math.round(x), Math.round(y));
      if (u < 2.0) { for (let k = 0; k < 10; k++) { const rx = x + 8 + ((k * 37) % 36), ry = y + 24 + ((st.t * 90 + k * 23) % 60); c.fillStyle = '#7fa6d8'; c.fillRect(Math.round(rx), Math.round(ry), 1, 3); } }
      if (Math.sin(st.t * 1.7) > 0.97) { flashA = Math.max(flashA, 0.15); flashCol = '#d9c4ff'; } }
    // hero
    const h = heroPose(this, st), hs = SP(h.i, h.j, 0); drawShadow(c, hs[0], hs[1], 1);
    auraFX(c, hs, h, st); drawHero(c, hs[0], hs[1] - h.z, h.f, h.flip, null, h);
    // users arrive
    if (u > 3.0) { const r = rng(42); const spots = [[0.5, 2.3], [1.9, 4.4], [3.2, 4.3], [4.3, 3.0], [3.9, 1.6], [2.2, 1.0], [0.6, 1.6], [2.6, 3.7], [1.2, 2.4], [4.5, 4.4]];
      spots.forEach(([i, j], k) => { const t0 = 3.0 + k * 0.08; if (u < t0) return; const q = clamp((u - t0) / 0.3, 0, 1), s = SP(i, j, 0), jump = q < 1 ? Math.sin(q * Math.PI) * 14 : Math.abs(Math.sin(st.t * 5 + k)) * 3; c.drawImage(SPR.user[k % 5], s[0] - 2, Math.round(s[1] - 8 - jump));
        if (((st.t * 1.4 + k * 0.37) % 2) < 1) { const hy = ((st.t * 1.4 + k * 0.37) % 1); c.globalAlpha = 1 - hy; c.drawImage(SPR.heart, s[0] - 3, Math.round(s[1] - 18 - hy * 16)); c.globalAlpha = 1; } }); }
  },
  events() { return [
    [1.0, (ff) => { if (!ff) { const bp = [OFF[0] + OX + this.btn[0], OFF[1] + OY + this.btn[1]]; hitFX(bp[0], bp[1] - 2); } addScore(1000); }],
    [1.1, (ff) => { if (!ff) { beat('3', 'cool', 0.3); sfx('count'); } }], [1.45, (ff) => { if (!ff) { beat('2', 'cool', 0.3); sfx('count'); } }], [1.8, (ff) => { if (!ff) { beat('1', 'cool', 0.3); sfx('count'); } }],
    [2.15, (ff) => { if (!ff) { beat('LIFT-OFF!', '', 0.6); sfx('rocket'); shakeA = 6; } }],
    [2.79, (ff) => { const cp = SP(this.pad[0] + 0.2, this.pad[1] - 0.2, 108); if (!ff) { hitFX(cp[0], cp[1] + 12); burst(cp[0], cp[1] + 12, 30, ['#aea6c0', '#8d84a2', '#d6cede'], 90, 30, 0.9); } oppHP(0); addScore(2000); }],
    [2.95, (ff) => { if (!ff) { beat('K.O.', '', 0.8); sfx('ko'); } }],
    [3.05, (ff) => { if (!ff) sfx('spark'); }]]; },
  pose(st, u) { const [i, j] = this.hero;
    if (u < 0.85) return { i, j, z: 0, f: 'crouch' };
    if (u < 1.3) return { i, j, z: 0, f: 'punch' };
    if (u < 3.0) return { i, j, z: 0, f: (st.t * 3 | 0) % 2 ? 'idle1' : 'idle0' };
    return { i, j, z: 0, f: (st.t * 4 | 0) % 2 ? 'cheer1' : 'cheer' }; },
};

const STAGES = [IDEA, DESIGN, BUILD, SHIP];

/* ---------------- shared stage helpers ---------------- */
let OFF = [0, 0];
function SP(i, j, z) { return [OFF[0] + OX + (i - j) * 16, OFF[1] + OY + (i + j) * 8 - (z || 0)]; }
const dissolveC = mk(DW, DH), dissolveX = dissolveC.getContext('2d'), dissolveID = dissolveX.createImageData(DW, DH), dissolve32 = new Uint32Array(dissolveID.data.buffer);
function drawDior(c, s, p) {
  if (!s.c0) { s.c0 = s.d0.cv(); s.c1 = s.d1 === s.d0 ? s.c0 : s.d1.cv(); }
  if (p <= 0) c.drawImage(s.c0, OFF[0], OFF[1]); else if (p >= 1) c.drawImage(s.c1, OFF[0], OFF[1]);
  else { const a = s.d0.d, b = s.d1.d; for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) { const i = y * DW + x; dissolve32[i] = B8(x, y) < p ? b[i] : a[i]; } dissolveX.putImageData(dissolveID, 0, 0); c.drawImage(dissolveC, OFF[0], OFF[1]); }
}
function handPos(h) { const s = SP(h.i, h.j, h.z); if (h.f === 'jump') return [s[0] + 17, s[1] - 37]; if (h.f === 'punch' || h.f === 'punchlow') return [s[0] + 20, s[1] - (h.f === 'punch' ? 28 : 25)]; return [s[0] + 10, s[1] - 18]; }
function trail(st, p, cols) { st.trail = st.trail || []; st.trail.unshift([p[0], p[1]]); if (st.trail.length > 12) st.trail.length = 12; for (let k = 1; k < st.trail.length; k++) { ctx.fillStyle = cols[Math.min(cols.length - 1, (k / 3) | 0)]; const s = k < 4 ? 2 : 1; ctx.fillRect(Math.round(st.trail[k][0]), Math.round(st.trail[k][1]), s, s); } }
function heroPose(s, st) {
  const [i, j] = s.hero, t = st.t;
  if (st.sp != null) { const p = s.pose(st, st.t - st.sp); p.flip = false; if (st.cleared && st.t - st.sp > s.SD + 1.6) { const ep = s.endPos ? s.endPos() : [p.i, p.j]; return { i: ep[0], j: ep[1], z: 0, f: blinkF(t, 'idle'), flip: false }; } return p; }
  if (t < 0.45) return { i: i - 1, j, z: 999, f: 'jump', flip: false };
  if (t < 0.85) { const k = (t - 0.45) / 0.4; return { i: i - 1, j, z: 150 * (1 - eIn(k)), f: 'jump', flip: false }; }
  if (t < 1.0) return { i: i - 1, j, z: 0, f: 'crouch', flip: false };
  if (t < 1.6) { const k = (t - 1.0) / 0.6; return { i: i - 1 + k, j, z: 0, f: ['walk0', 'walk1', 'walk2', 'walk1'][((t * 10) | 0) % 4], flip: false }; }
  return { i, j, z: 0, f: blinkF(t, 'idle'), flip: false };
}
function auraFX(c, hs, h, st) { if (st.sp == null) return; const u = st.t - st.sp; if (u < 0 || u > 0.95) return; const k = Math.min(1, u / 0.3);
  c.globalCompositeOperation = 'lighter'; c.drawImage(glow('#2a1460', 26, 1.3), hs[0] - 26, hs[1] - h.z - 44); c.globalCompositeOperation = 'source-over';
  const cols = ['#8be36a', '#2fb7c9', '#b07cff', '#ffffff']; for (let q = 0; q < 26; q++) { const ph = (st.t * 1.6 + q * 0.137) % 1, x = hs[0] + Math.sin(q * 2.4) * (10 + (q % 4) * 2), y = hs[1] - h.z - ph * 50 * k; c.fillStyle = cols[q % 4]; c.fillRect(Math.round(x), Math.round(y), 1, q % 3 ? 1 : 2); }
  for (let a = 0; a < 40; a++) { const an = a / 40 * Math.PI * 2, rr = 12 + Math.sin(st.t * 20 + a) * 1.5; if ((a + ((st.t * 20) | 0)) % 3) continue; c.fillStyle = '#b07cff'; c.fillRect(Math.round(hs[0] + Math.cos(an) * rr), Math.round(hs[1] + Math.sin(an) * rr / 2), 1, 1); } }
function blinkF(t, base) { if ((t % 3.1) < 0.12) return 'blink'; return ((t * 2.2) | 0) % 2 ? 'idle1' : 'idle0'; }
function oppHP(v) { oppSet(STAGES[cur].opp, v); }

/* ---------------- scene: iso field (title / select / end) ---------------- */
let fieldBuf = null, pedC = null;
function buildField() {
  const b = new Buf(IW, IH); gradFill(b, R(['#020108', '#05030f', '#0a0620', '#110a31', '#1a0f45', '#24135a']), 0, IH);
  const r = rng(2); for (let k = 0; k < IW * IH / 300; k++) b.px(r() * IW, r() * IH * 0.55, r() < 0.25 ? hx('#ffffff') : hx('#5e4fa0'));
  const hy = Math.floor(IH * 0.56), lc = R(['#1d1250', '#2a1a6a', '#3a2490', '#5230c0']);
  for (let y = hy; y < IH; y++) { const t = (y - hy) / (IH - hy); for (let x = 0; x < IW; x++) { const u = (x - IW / 2) / 16 + (y - hy) / 8, v = (y - hy) / 8 - (x - IW / 2) / 16; const fu = ((u % 1) + 1) % 1, fv = ((v % 1) + 1) % 1; if (fu < 0.07 || fv < 0.07) { if (bay(x, y) < 0.35 + t * 0.65) b.px(x, y, lc[clamp(Math.floor(t * 4), 0, 3)]); } } }
  fieldBuf = b.cv();
  const pb = new Buf(120, 80), W = new World(pb, 60, 20, { amb: 0.2, ls: [[0.9, 0.9, 60, 3, 2]] });
  W.box(0, 0, -22, 1.8, 1.8, 22, PAL.violet, { t: 6, l: 4, r: 2, texT: (p) => { const d = Math.hypot(p[0] - 0.9, p[1] - 0.9); return d > 0.62 && d < 0.72 ? [PAL.green, 5, true] : 0; }, texL: (p) => (p[2] > -3 ? 2 : (Math.floor(p[2]) === -12 ? -2 : 0)), texR: (p) => (p[2] > -3 ? 2 : (Math.floor(p[2]) === -12 ? -2 : 0)) });
  pb.outline(hx(PAL.ink)); pedC = pb.cv();
}
function drawField(c, t, heroF, py) {
  c.drawImage(fieldBuf, 0, 0);
  const hy = Math.floor(IH * 0.56);
  const pcx = IW / 2, pcy = Math.round(py) + 2;
  for (let gu = -9; gu <= 9; gu++) for (let gv = -9; gv <= 9; gv++) { const x = pcx + (gu - gv) * 16, y = pcy + (gu + gv) * 8 - 8; if (y < hy || y > IH + 8 || x < -20 || x > IW + 20) continue; const d = Math.hypot(gu, gv); if (d < 1.6) continue;
    const ph = Math.sin(T * 2.4 - d * 0.85); if (ph < 0.55) continue; c.fillStyle = 'rgba(130,57,234,' + ((ph - 0.55) * 1.4 * Math.max(0.25, 1 - d / 10)).toFixed(2) + ')';
    for (let r = 0; r < 16; r++) { const w = r < 8 ? (r + 1) * 4 : (16 - r) * 4; c.fillRect(Math.round(x - w / 2), y + r, w, 1); } }
  if (heroF) { const px = Math.round(IW / 2), pyy = Math.round(py); c.globalCompositeOperation = 'lighter'; c.drawImage(glow('#2a1460', 46, 1.3), px - 46, pyy - 60); c.globalCompositeOperation = 'source-over';
    c.drawImage(pedC, px - 60, pyy - 20 - 14); drawHero(c, px, pyy - 14 + 14, heroF, false); }
}

/* ---------------- game state ---------------- */
let mode = 'title', cur = 0, st = null, coined = false, wipe = null, selT = 0, endT = 0, cleared = [false, false, false, false], T = 0, fw = [];
const T_WAIT = 2.75;
function setMode(m) { mode = m; D.body.dataset.mode = m; if (m !== 'stage') { promptSet(null); clearBeats(); } layoutPlay(); }
function startStage(n, asCleared) {
  cur = n; const s = STAGES[n]; if (!s.d0) s.build(); s.bgC = null;
  st = { t: 0, sp: null, cleared: false, ev: s.events(), evi: 0, intro: [], trail: [] };
  parts = []; pops = []; slashes = []; clearBeats(); promptSet(null);
  $('stNo').textContent = n + 1; oppSet(s.opp, 1, true); capSet(s, false); pipsSet(); xpSet(cleared.filter(Boolean).length / 4);
  srs.textContent = 'Stage ' + (n + 1) + ': ' + s.name + '. ' + s.head + '. ' + s.copy;
  if (asCleared || RM) { st.t = T_WAIT; triggerSpecial(true); finishSpecial(true); }
  else { st.introEv = [[0.05, () => { bandBeat(); beat('STAGE ' + (n + 1), 'vio', 0.75); beat(s.name, 'cool', 0.75, true); sfx('card'); }], [0.86, () => { const h = SP(s.hero[0] - 1, s.hero[1], 0); dust(h[0], h[1], 10); shakeA = 3; sfx('land'); }],
      [0.98, () => vsBeat(s.opp)], [1.2, () => sfx('step')], [1.5, () => sfx('step')], [1.75, () => { beat('READY?', 'vio', 0.55, false); sfx('blip'); }], [2.4, () => { beat('GO!', '', 0.4); sfx('go'); }], [T_WAIT, () => promptSet(matchMedia('(pointer:fine)').matches ? 'CLICK OR PRESS SPACE: SPECIAL MOVE!' : 'TAP FOR THE SPECIAL MOVE!')]];
    st.ii = 0; }
}
function runIntro(ff) { if (!st.introEv) return; while (st.ii < st.introEv.length && st.introEv[st.ii][0] <= st.t) { const e = st.introEv[st.ii++]; if (!ff || e[0] === T_WAIT) e[1](); } }
function triggerSpecial(ff) { if (st.sp != null) return; st.sp = st.t; promptSet(null); if (!ff) { cutin(STAGES[cur].move); sfx('charge'); } }
function runEvents(ff) { if (st.sp == null) return; const u = st.t - st.sp; while (st.evi < st.ev.length && st.ev[st.evi][0] <= u) { const e = st.ev[st.evi++]; try { e[1](ff, st); } catch (er) { /* keep going */ } } }
function finishSpecial(ff) { const s = STAGES[cur]; st.t = st.sp + s.SD; runEvents(true); if (ff) clearBeats(); doClear(ff); }
function doClear(ff) { if (st.cleared) return; st.cleared = true; const was = cleared[cur]; cleared[cur] = true; if (!was) addScore(5000); xpSet(cleared.filter(Boolean).length / 4); pipsSet(); oppHP(0);
  capSet(STAGES[cur], true);
  if (!ff) { beat('STAGE CLEAR', 'cool', 1.4); setTimeout(() => beat(was ? 'REPLAY' : 'BONUS 5000', '', 1.0, true), 350); sfx('clear'); const r = rng(T * 1000 | 0); for (let k = 0; k < 60; k++) parts.push({ x: r() * IW, y: -10 - r() * 40, vx: (r() - 0.5) * 30, vy: 20 + r() * 40, g: 30, life: 2.5, t: 0, c: ['#8be36a', '#2fb7c9', '#9b59f7', '#ffd23f', '#f07fb6'][k % 5], s: 2, conf: true }); }
  setTimeout(() => { if (mode === 'stage' && st && st.cleared) promptSet(cur < 3 ? 'TAP FOR STAGE ' + (cur + 2) : 'TAP TO FINISH'); }, ff ? 0 : 1400);
}
function advance() {
  if (wipe) return;
  if (mode === 'title') { if (!coined) { coined = true; $('cred').textContent = '01'; $('coinTxt').textContent = 'PRESS START'; sfx('coin'); setTimeout(() => { if (mode === 'title') toSelect(); }, RM ? 0 : 650); } else toSelect(); return; }
  if (mode === 'select') { toStage(0); return; }
  if (mode === 'end') return;
  if (mode !== 'stage' || !st) return;
  const s = STAGES[cur];
  if (st.sp == null && st.t < T_WAIT) { st.t = T_WAIT; clearBeats(); runIntro(true); return; }
  if (st.sp == null) { triggerSpecial(false); return; }
  if (!st.cleared) { finishSpecial(true); return; }
  if (cur < 3) toStage(cur + 1); else toEnd();
}
function back() { if (wipe) return; if (mode === 'stage' && cur > 0) toStage(cur - 1, true); else if (mode === 'end') toStage(3, true); }
function toSelect() { D.body.classList.add('go'); doWipe(() => { setMode('select'); selT = 0; sfx('blip'); }); }
function toStage(n, asCleared) { doWipe(() => { setMode('stage'); startStage(n, asCleared || cleared[n] && n < cur); }); }
function toEnd() { doWipe(() => { setMode('end'); endT = 0; fw = []; $('cd').textContent = '9'; sfx('clear'); }); }
function doWipe(mid) { if (RM) { mid(); draw(); return; } wipe = { t: 0, mid, done: false }; }

/* ---------------- loop ---------------- */
let last = performance.now();
function update(dt) {
  T += dt;
  if (wipe) { wipe.t += dt; if (!wipe.done && wipe.t >= 0.32) { wipe.done = true; wipe.mid(); } if (wipe.t >= 0.64) wipe = null; }
  let gdt = dt; if (hitstop > 0) { hitstop -= dt; gdt = 0; }
  if (mode === 'stage' && st) { st.t += gdt; runIntro(false); if (st.sp == null && st.t > T_WAIT + 3.2) triggerSpecial(false); runEvents(false); if (st.sp != null && !st.cleared && st.t - st.sp >= STAGES[cur].SD) doClear(false); }
  if (mode === 'select') { selT += dt; if (selT > 2.6 && !wipe) toStage(0); }
  if (mode === 'end') { endT += dt; const cd = 9 - Math.floor(endT % 10); $('cd').textContent = cd; if (Math.random() < dt * 2.2) firework(); }
  for (const p of parts) { p.t += gdt; p.vy += p.g * gdt; p.x += p.vx * gdt; p.y += p.vy * gdt; } parts = parts.filter((p) => p.t < p.life);
  for (const p of pops) p.t += gdt; pops = pops.filter((p) => p.t < 0.9);
  for (const s of slashes) s.t += gdt; slashes = slashes.filter((s) => s.t < 0.25);
  flashA = Math.max(0, flashA - dt * 3.2); shakeA = Math.max(0, shakeA - dt * 18);
  if (shownScore < score) { shownScore = Math.min(score, shownScore + Math.max(10, Math.ceil((score - shownScore) * dt * 6))); $('score').textContent = String(Math.floor(shownScore)).padStart(7, '0'); }
}
function firework() { const x = IW * (0.15 + Math.random() * 0.7), y = IH * (0.1 + Math.random() * 0.35), cols = [['#8be36a', '#c4f5a0'], ['#2fb7c9', '#9ae6ea'], ['#b07cff', '#d9c4ff'], ['#ffd23f', '#fff0a0'], ['#f07fb6', '#ffb0d4']][(Math.random() * 5) | 0]; burst(x, y, 36, cols.concat(['#ffffff']), 55, 25, 1.2); sfx('firework'); }
function bgFor(s) { if (!s.bgC || s.bgC.width !== IW || s.bgC.height !== IH) { const b = new Buf(IW, IH); s.bg(b); s.bgC = b.cv(); } return s.bgC; }
let playTop = 0, playBot = 0;
function layoutPlay() { const hud = $('hud').getBoundingClientRect(), dock = $('dock').getBoundingClientRect(); playTop = mode === 'stage' ? hud.bottom / S : 0; playBot = mode === 'stage' ? dock.top / S : IH; if (prompt.classList.contains('on')) placePrompt(); }
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  const sx = shakeA > 0.5 ? Math.round((Math.random() - 0.5) * shakeA) : 0, sy = shakeA > 0.5 ? Math.round((Math.random() - 0.5) * shakeA) : 0;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, IW, IH);
  if (mode === 'title' || mode === 'select' || mode === 'end') {
    drawField(ctx, T, mode === 'title' ? blinkF(T) : null, IH * (IW < 260 ? 0.66 : 0.7));
    if (mode === 'title' && IW >= 260) { /* subtle scan sweep */ const y = ((T * 40) % (IH + 40)) - 20; ctx.fillStyle = 'rgba(176,124,255,.06)'; ctx.fillRect(0, Math.round(y), IW, 6); }
  } else if (mode === 'stage' && st) {
    const s = STAGES[cur];
    ctx.drawImage(bgFor(s), 0, 0); s.bgDyn(ctx, T, st);
    const cy = Math.round((playTop + playBot) / 2), avail = playBot - playTop;
    let oy = cy - s.cyL; if (avail < 175) oy = Math.round(playTop + (avail - 175) * 0.5 + 66 - s.cyL + 104 - 66);
    OFF = [Math.round(IW / 2 - OX) + sx, oy + sy];
    ctx.save(); s.draw(ctx, st); ctx.restore();
  }
  // particles
  for (const p of parts) { const a = 1 - p.t / p.life; ctx.globalAlpha = p.conf ? 1 : clamp(a * 1.5, 0, 1); ctx.fillStyle = p.c; const s = p.s; ctx.fillRect(Math.round(p.x), Math.round(p.y), s, p.conf ? (((p.t * 10) | 0) % 2 ? 1 : 2) : s); } ctx.globalAlpha = 1;
  for (const s of slashes) { const k = s.t / 0.25; if (s.kind === 'star') { const L = 6 + k * 14; ctx.fillStyle = k < 0.5 ? '#ffffff' : '#ffd23f'; for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4 + 0.39, ln = a % 2 ? L * 0.55 : L; for (let r = L * 0.3; r < ln; r += 1) ctx.fillRect(Math.round(s.x + Math.cos(an) * r), Math.round(s.y + Math.sin(an) * r), 1, 1); } }
    else { ctx.fillStyle = k < 0.5 ? '#ffffff' : '#5ec6d2'; for (let a = -1.2; a < 1.2; a += 0.05) { const r = 14 + k * 6, w = (1 - Math.abs(a) / 1.2) * 3; for (let q = 0; q < w; q++) ctx.fillRect(Math.round(s.x - 4 + Math.cos(a) * (r - q)), Math.round(s.y + Math.sin(a) * (r - q)), 1, 1); } } }
  for (const p of pops) { const y = p.y - eOut(p.t / 0.9) * 14; if (p.t < 0.7 || ((p.t * 20) | 0) % 2) text35(ctx, p.txt, Math.round(p.x - p.txt.length * 2), Math.round(y), p.col, '#140d1c'); }
  if (flashA > 0.02) { ctx.globalAlpha = flashA; ctx.fillStyle = flashCol; ctx.fillRect(0, 0, IW, IH); ctx.globalAlpha = 1; }
  if (wipe) { const p = wipe.t < 0.32 ? wipe.t / 0.32 : 1 - (wipe.t - 0.32) / 0.32; ctx.fillStyle = '#0a0618'; for (let gy = -1; gy < IH / 8 + 1; gy++) for (let gx = -1; gx < IW / 16 + 1; gx++) { const cx = gx * 16 + (gy % 2 ? 8 : 0), cy = gy * 8, ph = clamp(p * 2.2 - (cx / IW) * 1.0 - (cy / IH) * 0.2, 0, 1), r = Math.round(ph * 9); for (let q = -r; q <= r; q++) { const w = (r - Math.abs(q)) * 2; ctx.fillRect(cx - w, cy + q, w * 2, 1); } } }
}
function loop(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); draw(); requestAnimationFrame(loop); }

/* ---------------- layout ---------------- */
function layout() { const vw = innerWidth, vh = innerHeight; S = clamp(Math.floor(Math.min(vw / 210, vh / 215)), 2, 6); IW = Math.ceil(vw / S); IH = Math.ceil(vh / S); cv.width = IW; cv.height = IH; cv.style.width = IW * S + 'px'; cv.style.height = IH * S + 'px'; ctx.imageSmoothingEnabled = false; buildField(); layoutPlay(); if (RM) draw(); }
addEventListener('resize', layout);

/* ---------------- input ---------------- */
let pdn = null, wheelAcc = 0, wheelLock = 0;
function firstGesture() { if (AU.on) audioStart(); }
D.addEventListener('pointerdown', (e) => { firstGesture(); if (e.target.closest('button,a')) return; pdn = { x: e.clientX, y: e.clientY, t: performance.now() }; });
D.addEventListener('pointerup', (e) => { if (!pdn || e.target.closest('button,a')) { pdn = null; return; } const dy = e.clientY - pdn.y, dx = e.clientX - pdn.x; pdn = null;
  if (Math.abs(dy) > 45 && Math.abs(dy) > Math.abs(dx)) { if (dy < 0) advance(); else back(); } else if (Math.abs(dx) > 60) { if (dx < 0) advance(); else back(); } else advance(); });
D.addEventListener('keydown', (e) => { firstGesture(); const k = e.key; if (e.target.closest && e.target.closest('a,button') && (k === 'Enter' || k === ' ')) return;
  if (k === ' ' || k === 'Enter' || k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown') { e.preventDefault(); advance(); }
  else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); back(); }
  else if (k === 'm' || k === 'M') sndBtn.click(); else if (k === 'c' || k === 'C') crtBtn.click(); });
D.addEventListener('wheel', (e) => { e.preventDefault(); const now = performance.now(); if (now < wheelLock) return; wheelAcc += e.deltaY; if (Math.abs(wheelAcc) > 50) { if (wheelAcc > 0) advance(); else back(); wheelAcc = 0; wheelLock = now + 650; } }, { passive: false });
$('next').addEventListener('click', (e) => { e.stopPropagation(); advance(); });
$('prev').addEventListener('click', (e) => { e.stopPropagation(); back(); });
$('again').addEventListener('click', (e) => { e.stopPropagation(); cleared = [false, false, false, false]; score = 0; shownScore = 0; $('score').textContent = '0000000'; toStage(0); });

/* ---------------- boot ---------------- */
D.fonts && D.fonts.ready && D.fonts.ready.then(() => layoutPlay());
layout(); setMode('title');
if (RM) { draw(); setInterval(() => { /* static frames in reduced motion; redraw only on change */ }, 1e6); const _adv = advance; } else requestAnimationFrame(loop);
// reduced motion: redraw after every interaction
if (RM) { ['pointerup', 'keydown', 'click'].forEach((ev) => D.addEventListener(ev, () => setTimeout(draw, 0))); }
window.__arcade = { go: (n, c) => { setMode('stage'); startStage(n, c); }, adv: advance, state: () => ({ mode, cur, t: st && st.t, sp: st && st.sp, cleared: st && st.cleared }), title: () => setMode('title') };
})();
