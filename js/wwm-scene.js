/* 3Shamrocks Studio · work-with-me "Find your fit": an isometric pixel-art studio that builds itself from the client's answers.
   Every tile, prop and light is original pixel art drawn here in code (2:1 isometric, ordered dithering, integer-scaled canvas).
   The only image is Dave's own minime art (assets/studio/minime/*), composed into poses and pixelated at load.
   API: WWMScene.mount(canvas, introCanvas) · WWMScene.set(state, changedKey) · WWMScene.thumb(kind, id, accent) -> canvas */
(function () {
'use strict';
var W = 288, H = 216, N = 7, WH = 64;
var Z = { ox: 144, oy: 72 };
var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- colour ---------- */
var CC = {};
function C(h, k) {
  k = k || 0; var key = h + '|' + k; if (CC[key] !== undefined) return CC[key];
  var n = parseInt(h.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (k > 0) { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; } else if (k < 0) { r *= 1 + k; g *= 1 + k; b *= 1 + k; }
  r = Math.round(r); g = Math.round(g); b = Math.round(b);
  return (CC[key] = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0);
}
var B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function bay(x, y) { return (B4[((y & 3) << 2) | (x & 3)] + 0.5) / 16; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

/* ---------- frame buffer ---------- */
function FB(w, h) { this.w = w; this.h = h; this.d = new Uint32Array(w * h); }
FB.prototype.px = function (x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.w + x] = c; };
FB.prototype.rect = function (x, y, w, h, c) { for (var j = Math.floor(y); j < y + h; j++) for (var i = Math.floor(x); i < x + w; i++) this.px(i, j, c); };
FB.prototype.poly = function (P, c) {
  var y0 = 1e9, y1 = -1e9, n = P.length, k;
  for (k = 0; k < n; k++) { if (P[k][1] < y0) y0 = P[k][1]; if (P[k][1] > y1) y1 = P[k][1]; }
  y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(this.h - 1, Math.ceil(y1));
  var fn = typeof c === 'function';
  for (var y = y0; y <= y1; y++) {
    var yc = y + 0.5, xs = [];
    for (k = 0; k < n; k++) { var a = P[k], b = P[(k + 1) % n]; if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
    xs.sort(function (p, q) { return p - q; });
    for (k = 0; k + 1 < xs.length; k += 2) {
      var xa = Math.max(0, Math.ceil(xs[k] - 0.5)), xb = Math.min(this.w - 1, Math.ceil(xs[k + 1] - 0.5) - 1);
      for (var x = xa; x <= xb; x++) { var col = fn ? c(x, y) : c; if (col) this.d[y * this.w + x] = col; }
    }
  }
};
FB.prototype.line = function (x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
  for (var g = 0; g < 400; g++) { this.px(x0, y0, c); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
};
FB.prototype.disc = function (cx, cy, r, c) { for (var y = Math.floor(cy - r); y <= cy + r; y++) for (var x = Math.floor(cx - r); x <= cx + r; x++) { var dx = x + 0.5 - cx, dy = y + 0.5 - cy; if (dx * dx + dy * dy <= r * r) this.px(x, y, c); } };
/* soft light as ordered dither: the pixel-art way to draw a glow */
FB.prototype.glow = function (cx, cy, rx, ry, c, amt) {
  for (var y = Math.floor(cy - ry); y <= cy + ry; y++) for (var x = Math.floor(cx - rx); x <= cx + rx; x++) {
    var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = Math.sqrt(dx * dx + dy * dy); if (d >= 1) continue;
    if (bay(x & 255, y & 255) < (1 - d) * amt) this.px(x, y, c);
  }
};
FB.prototype.blit = function (s, x, y) { x = Math.round(x); y = Math.round(y); for (var j = 0; j < s.h; j++) for (var i = 0; i < s.w; i++) { var c = s.d[j * s.w + i]; if (c) this.px(x + i, y + j, c); } };
FB.prototype.tint = function (mr, mg, mb) {
  var d = this.d; for (var k = 0; k < d.length; k++) { var c = d[k]; if (!c) continue;
    var r = Math.min(255, (c & 255) * mr), g = Math.min(255, ((c >> 8) & 255) * mg), b = Math.min(255, ((c >> 16) & 255) * mb);
    d[k] = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0; }
};

/* ---------- isometric world ---------- */
var G = { oi: 0, oj: 0, oz: 0 };
function P(i, j, z) { i += G.oi; j += G.oj; return [Z.ox + (i - j) * 16, Z.oy + (i + j) * 8 - ((z || 0) + G.oz)]; }
function box(f, i, j, z, w, d, h, col) {
  var t0 = P(i, j, z + h), t1 = P(i + w, j, z + h), t2 = P(i + w, j + d, z + h), t3 = P(i, j + d, z + h);
  if (h > 0) {
    f.poly([t3, t2, P(i + w, j + d, z), P(i, j + d, z)], C(col));
    f.poly([t1, t2, P(i + w, j + d, z), P(i + w, j, z)], C(col, -0.3));
  }
  f.poly([t0, t1, t2, t3], C(col, 0.2));
  var hi = C(col, 0.42);
  f.line(t3[0], t3[1], t2[0], t2[1], hi); f.line(t1[0], t1[1], t2[0], t2[1], hi);
  if (h > 2) { var b = P(i + w, j + d, z); f.line(t2[0], t2[1] + 1, b[0], b[1] - 1, C(col, 0.12)); }
}
function faceJ(f, j, i0, i1, z0, z1, col) { f.poly([P(i0, j, z1), P(i1, j, z1), P(i1, j, z0), P(i0, j, z0)], col); }
function faceI(f, i, j0, j1, z0, z1, col) { f.poly([P(i, j0, z1), P(i, j1, z1), P(i, j1, z0), P(i, j0, z0)], col); }
/* pixel bitmaps on a wall: x steps 1 px, y drops half a px per x (2:1) */
function wallArt(f, x0, y0, s, rows, pal) {
  for (var v = 0; v < rows.length; v++) for (var u = 0; u < rows[v].length; u++) { var ch = rows[v][u]; if (ch === '.' || !pal[ch]) continue; f.px(x0 + s * u, y0 + Math.floor(u / 2) + v, pal[ch]); }
}
/* tiny 3x5 font for in-world signs */
var F35 = { O: '111101101101111', P: '111101111100100', E: '111100110100111', N: '101111111111101', '?': '111001011000010', M: '101111111101101', T: '111010010010010', W: '101101111111101', F: '111100110100100', S: '111100111001111' };
/* dir: +1 on faces that drop to the right (+j faces, right wall), -1 on faces that rise to the right (+i faces, left wall), 0 flat */
function sign(f, x0, y0, dir, txt, col) {
  for (var n = 0; n < txt.length; n++) { var g = F35[txt[n]]; if (!g) continue;
    for (var k = 0; k < 15; k++) if (g[k] === '1') { var u = n * 4 + (k % 3); f.px(x0 + u, y0 + dir * Math.floor(u / 2) + Math.floor(k / 3), col); } }
}

/* ---------- themes (answer 1: who is building) ---------- */
var TH = {
  none:    { fa: '#120c28', fb: '#0f0a22', grid: '#3b2a7a', edge: '#0b0718', wl: null },
  founder: { fa: '#2c1e5e', fb: '#261952', grid: '#3d2a80', edge: '#170f36', wl: '#2a1b56', wr: '#1f1443', trim: '#9b59f7', acc: '#9b59f7' },
  biz:     { fa: '#6e4c30', fb: '#62432a', grid: '#4f3520', edge: '#3a2716', wl: '#1d4f5c', wr: '#163e49', trim: '#f0a030', acc: '#f0a030', plank: 1 },
  pl:      { fa: '#24364f', fb: '#1e2e45', grid: '#30496a', edge: '#121c2b', wl: '#2b3a50', wr: '#212e41', trim: '#2fb7c9', acc: '#2fb7c9' },
  idea:    { fa: '#34383f', fb: '#2e3238', grid: '#454a52', edge: '#1c1f24', wl: '#2a2e36', wr: '#22252c', trim: '#8be36a', acc: '#8be36a' }
};
var SKY = {
  none: ['#2a1d55', '#3a2870'], asap: ['#1f1a33', '#3b2f55'], m12: ['#5fb6ff', '#c4ecff'], qtr: ['#6a2be0', '#ff9a3c'], long: ['#05051a', '#151545']
};

/* ---------- state ---------- */
var S = { role: null, stage: null, need: null, when: null, budget: null, result: null };
var A = { floor: -1e9, prevTheme: 'none', stage: -1e9, need: -1e9, budget: -1e9, when: -1e9, result: -1e9, hop: -1e9 };
var parts = [], mm = null, introOn = false, introDone = RM;
function acc() { return (TH[S.role] || TH.founder).acc; }

/* ---------- props: answer 2 (where it stands) on the left plot, answer 3 (what it needs) on the right plot ---------- */
var PROPS = {
  /* founder */
  raised: function (f, t, ph) {
    if (ph) { if (!RM && Math.floor(t / 260) % 5 === 0) { var s = P(1.0, 0.9, 20); f.px(s[0], s[1] - 2, C('#ffffff')); f.px(s[0] - 1, s[1] - 1, C('#fff2a8')); f.px(s[0] + 1, s[1] - 1, C('#fff2a8')); } return; }
    for (var k = 0; k < 4; k++) box(f, 1.7, 0.15, k * 3, 0.32, 0.32, 2, '#e8b923');
    box(f, 0.3, 0.5, 0, 1.3, 0.9, 12, '#8a5a2b');
    box(f, 0.3, 0.5, 12, 1.3, 0.9, 5, '#6e4520');
    box(f, 0.84, 0.46, 0, 0.22, 0.98, 17.5, '#ffd23f');
    for (k = 0; k < 3; k++) box(f, 0.1 + k * 0.05, 1.55, k * 3, 0.32, 0.32, 2, '#ffd23f');
  },
  v1: function (f, t, ph) {
    if (ph) return;
    var post = '#c8c8dc';
    box(f, 0.2, 0.2, 0, 0.12, 0.12, 42, post);
    box(f, 1.68, 0.2, 0, 0.12, 0.12, 42, post); box(f, 0.2, 1.68, 0, 0.12, 0.12, 42, post);
    box(f, 0.5, 0.5, 0, 1.0, 1.0, 16, acc());
    box(f, 0.5, 0.5, 16, 1.0, 0.5, 8, acc()); box(f, 0.5, 1.0, 16, 0.5, 0.5, 8, acc());
    box(f, 0.2, 0.2, 40, 1.6, 0.12, 2, post); box(f, 0.2, 0.2, 40, 0.12, 1.6, 2, post);
    box(f, 1.68, 1.68, 0, 0.12, 0.12, 42, post);
    box(f, 0.2, 1.68, 40, 1.6, 0.12, 2, post); box(f, 1.68, 0.2, 40, 0.12, 1.6, 2, post);
    var a = P(1.74, 1.74, 2), b = P(1.74, 1.74, 14); for (var y = 0; y < 12; y += 2) f.px(a[0] - 1, a[1] - y, C('#ffd23f'));
  },
  users: function (f, t, ph) {
    if (ph) return;
    var ppl = [[0.2, 0.3, '#ff4d6d'], [1.1, 0.15, '#2fb7c9'], [0.55, 1.0, '#8be36a'], [1.45, 0.85, '#f0a030'], [0.95, 1.5, '#b07cff']];
    for (var k = 0; k < ppl.length; k++) { var p = ppl[k], z = RM ? 0 : (Math.floor(t / 280 + k) % 2);
      box(f, p[0], p[1], z, 0.3, 0.3, 9, p[2]); box(f, p[0] + 0.04, p[1] + 0.04, 9 + z, 0.22, 0.22, 5, '#f0c39c'); box(f, p[0] + 0.04, p[1] + 0.04, 14 + z, 0.22, 0.22, 1, '#3a2418'); }
  },
  grow: function (f, t, ph) {
    if (ph) { var s = P(1.5, 0.6, 34 + (RM ? 0 : Math.floor(t / 300) % 3)); f.glow(s[0], s[1] - 3, 6, 5, C('#8be36a'), 0.7); return; }
    box(f, 0.15, 0.15, 0, 1.7, 1.7, 2, '#2a2a44');
    box(f, 0.3, 1.2, 2, 0.42, 0.42, 10, '#2fb7c9'); box(f, 0.8, 0.8, 2, 0.42, 0.42, 20, '#9b59f7'); box(f, 1.3, 0.4, 2, 0.42, 0.42, 32, '#8be36a');
  },
  /* business owner */
  'new': function (f, t, ph) {
    if (ph) return;
    box(f, 0.6, 0.6, 0, 0.8, 0.8, 10, '#c0623a'); box(f, 0.68, 0.68, 10, 0.64, 0.64, 1, '#4a2f1f');
    var g = RM ? 1 : 0.85 + 0.15 * Math.sin(t / 700), b = P(1.0, 1.0, 11), hgt = Math.round(16 * g), gr = C('#3dcc6e'), gd = C('#2a9a50');
    for (var y = 0; y < hgt; y++) f.px(b[0], b[1] - y, gd);
    f.disc(b[0] - 4, b[1] - hgt + 3, 3.2, gr); f.disc(b[0] + 4, b[1] - hgt + 1, 3.6, gr); f.disc(b[0], b[1] - hgt - 2, 2.6, C('#8be36a'));
  },
  dated: function (f, t, ph) {
    if (ph) { var s = P(0.95, 1.5, 12); if (Math.floor(t / 900) % 4 !== 0 || RM) f.glow(s[0], s[1], 7, 5, C('#6fae86'), 0.35); return; }
    box(f, 0.5, 0.55, 0, 0.9, 0.9, 4, '#a89c80');
    box(f, 0.3, 0.4, 4, 1.3, 1.1, 20, '#cbbf9f');
    faceJ(f, 1.5, 0.48, 1.42, 8, 21, C('#2d4a3a'));
    for (var z = 9; z < 21; z += 2) { var a = P(0.5, 1.5, z), b = P(1.4, 1.5, z); f.line(a[0], a[1], b[0], b[1], C('#365744')); }
    var c0 = P(0.3, 0.4, 24); f.line(c0[0], c0[1], c0[0] - 7, c0[1] + 9, C('#d8d8e0')); f.line(c0[0], c0[1], c0[0] + 9, c0[1] + 4, C('#d8d8e0')); f.line(c0[0] - 4, c0[1] + 5, c0[0] + 5, c0[1] + 2, C('#b8b8c4'));
  },
  bgrow: function (f, t, ph) {
    if (ph) return;
    var c = ['#b07a45', '#a56f3d', '#b98450', '#c08a55'], tape = '#e6d3a0';
    function cb(i, j, z, s, h, k) { box(f, i, j, z, s, s, h, c[k]); var a = P(i + s / 2, j, z + h), b = P(i + s / 2, j + s, z + h); f.line(a[0], a[1], b[0], b[1], C(tape)); }
    cb(0.2, 0.2, 0, 0.8, 12, 0); cb(1.05, 0.3, 0, 0.8, 12, 1); cb(0.3, 1.05, 0, 0.8, 12, 2);
    cb(0.4, 0.4, 12, 0.8, 12, 3); cb(1.1, 0.5, 12, 0.6, 10, 0);
    var w = RM ? 0 : (Math.floor(t / 500) % 2) * 0.04; cb(0.75 + w, 0.55, 24, 0.7, 10, 1);
  },
  /* product lead */
  nolead: function (f, t, ph) {
    if (ph) { var s = P(1.0, 1.0, 46 + (RM ? 0 : Math.round(Math.sin(t / 380) * 2))); f.glow(s[0], s[1] + 2, 8, 8, C('#ffffff'), 0.25); sign(f, s[0] - 1, s[1], 0, '?', C('#ffffff')); return; }
    box(f, 0.55, 0.55, 0, 0.8, 0.8, 2, '#2a2a3a'); box(f, 0.9, 0.9, 2, 0.12, 0.12, 9, '#6a6f88');
    box(f, 0.55, 0.55, 11, 0.85, 0.85, 3, '#3d4a66');
    box(f, 0.55, 0.55, 14, 0.14, 0.85, 17, '#33405a');
  },
  messy: function (f, t, ph) {
    if (ph) return;
    box(f, 1.0, 0.1, 0, 0.5, 0.9, 6, '#2fb7c9'); box(f, 0.1, 0.3, 0, 0.6, 0.6, 10, '#ff4d6d'); box(f, 0.25, 0.35, 10, 0.4, 0.4, 7, '#8be36a');
    box(f, 1.15, 1.0, 0, 0.6, 0.6, 20, '#9b59f7'); box(f, 0.4, 1.1, 0, 0.9, 0.5, 14, '#f0a030');
  },
  leak: function (f, t, ph) {
    var j0 = P(0.42, 1.05, 21);
    if (ph) { var pd = P(0.42, 1.05, 0); f.glow(pd[0], pd[1] + 1, 9, 4, C('#2fb7c9'), 0.8);
      if (!RM) for (var k = 0; k < 3; k++) { var y = (t / 18 + k * 7) % 20; f.px(j0[0], j0[1] + 2 + y, C('#7fe3f0')); }
      else f.px(j0[0], j0[1] + 6, C('#7fe3f0')); return; }
    box(f, 0.3, 0.3, 0, 0.18, 0.18, 22, '#5a5f78'); box(f, 0.3, 1.6, 0, 0.18, 0.18, 22, '#5a5f78');
    box(f, 0.25, 0.0, 22, 0.32, 2.0, 6, '#8a8fa8'); box(f, 0.2, 0.9, 20, 0.42, 0.32, 10, '#6a6f88');
    f.px(j0[0] + 1, j0[1] - 3, C('#1a1a24')); f.px(j0[0] + 2, j0[1] - 4, C('#1a1a24'));
  },
  /* idea */
  head: function (f, t, ph) {
    var bob = RM ? 0 : Math.round(Math.sin(t / 420) * 2), c = P(1.0, 1.0, 40 + bob), w = C('#ecebf6'), s = C('#c9c7dc');
    if (ph) { f.glow(c[0], c[1], 9, 9, C('#ffe066'), 0.55); f.disc(c[0], c[1], 3.2, C('#ffd23f')); f.rect(c[0] - 1, c[1] + 3, 3, 2, C('#9a9ab0')); return; }
    f.disc(c[0] - 8, c[1] + 2, 6, s); f.disc(c[0] + 8, c[1] + 2, 6, s); f.disc(c[0], c[1] - 3, 8, s); f.disc(c[0], c[1] + 4, 7, s);
    f.disc(c[0] - 8, c[1] + 1, 5, w); f.disc(c[0] + 8, c[1] + 1, 5, w); f.disc(c[0], c[1] - 4, 7, w); f.disc(c[0], c[1] + 3, 6, w);
    var b = P(1.2, 1.4, 22 + bob); f.disc(b[0], b[1], 2.5, w); var b2 = P(1.35, 1.6, 14 + bob); f.disc(b2[0], b2[1], 1.6, w);
  },
  sketch: function (f, t, ph) {
    if (ph) return;
    var leg = C('#8a5a2b'), a, b;
    a = P(0.7, 0.7, 0); b = P(0.95, 0.95, 32); f.line(a[0], a[1], b[0], b[1], C('#6e4520'));
    box(f, 0.45, 1.2, 10, 1.1, 0.1, 2, '#6e4520');
    faceJ(f, 1.25, 0.5, 1.5, 12, 36, C('#3a2a1c')); faceJ(f, 1.26, 0.55, 1.45, 13, 35, C('#f6f4ff'));
    var pts = [[0.65, 20], [0.8, 27], [0.95, 22], [1.1, 30], [1.3, 24]];
    for (var k = 0; k + 1 < pts.length; k++) { a = P(pts[k][0], 1.27, pts[k][1]); b = P(pts[k + 1][0], 1.27, pts[k + 1][1]); f.line(a[0], a[1], b[0], b[1], C('#8239ea')); }
    a = P(0.7, 1.27, 16); b = P(1.35, 1.27, 16); f.line(a[0], a[1], b[0], b[1], C('#b8b4cc'));
    a = P(0.55, 1.4, 0); b = P(0.8, 1.3, 13); f.line(a[0], a[1], b[0], b[1], leg); a = P(1.45, 1.4, 0); b = P(1.3, 1.3, 13); f.line(a[0], a[1], b[0], b[1], leg);
  },
  proto: function (f, t, ph) {
    if (ph) return;
    box(f, 0.55, 0.9, 0, 1.0, 0.22, 38, '#efe9dc');
    faceJ(f, 1.12, 0.63, 1.47, 4, 34, C('#ffffff'));
    var g = C('#b9b3a6'); for (var z = 28; z > 6; z -= 6) { var a = P(0.7, 1.12, z), b = P(1.4, 1.12, z); f.line(a[0], a[1], b[0], b[1], g); a = P(0.7, 1.12, z - 3); b = P(1.1, 1.12, z - 3); f.line(a[0], a[1], b[0], b[1], g); }
    var n = P(0.95, 1.12, 32), n2 = P(1.15, 1.12, 32); f.line(n[0], n[1], n2[0], n2[1], C('#8a8578'));
  },
  /* needs (right plot) */
  brand: function (f, t, ph) {
    var cx = P(1.0, 1.12, 31);
    if (ph) { var on = RM || Math.floor(t / 140) % 23 !== 0;
      if (on) { f.glow(cx[0], cx[1], 20, 12, C(acc()), 0.45);
        f.disc(cx[0] - 7, cx[1] + 3, 2.6, C('#8be36a')); f.disc(cx[0], cx[1], 2.6, C('#2fb7c9')); f.disc(cx[0] + 7, cx[1] - 3, 2.6, C('#b07cff'));
        for (var k = -10; k <= 10; k++) f.px(cx[0] + k, cx[1] - 6 - Math.floor((k + 10) / 2) + 5, C('#ffffff')); }
      return; }
    box(f, 0.35, 0.95, 0, 0.14, 0.14, 18, '#3a3a55'); box(f, 1.5, 0.95, 0, 0.14, 0.14, 18, '#3a3a55');
    box(f, 0.15, 0.85, 18, 1.7, 0.26, 26, '#1a1035');
    faceJ(f, 1.11, 0.25, 1.75, 20, 42, C('#120a2a'));
  },
  flow: function (f, t, ph) {
    if (ph) { var e = P(2.0, 1.0, 14); if (!RM && Math.floor(t / 400) % 2) f.glow(e[0], e[1], 6, 6, C('#8be36a'), 0.7); return; }
    box(f, 0.1, 0.65, 0, 0.12, 0.12, 8, '#2a2c40'); box(f, 1.8, 0.65, 0, 0.12, 0.12, 8, '#2a2c40');
    box(f, 0.0, 0.6, 8, 2.0, 0.8, 4, '#3a3d55');
    var off = RM ? 0 : (t / 1400) % 0.4;
    for (var s = 0; s < 2.0; s += 0.4) { var x = s + off; if (x > 2) continue; var a = P(x, 0.62, 12), b = P(x, 1.38, 12); f.line(a[0], a[1], b[0], b[1], C('#262840')); }
    var bo = RM ? 0 : (t / 2400) % 1;
    for (var k = 0; k < 2; k++) { var p = ((bo + k * 0.5) % 1) * 1.6; box(f, p, 0.8, 12, 0.36, 0.4, 7, acc()); }
  },
  all: function (f, t, ph) {
    var lift = (S.result === 'launch' && !RM) ? Math.min(60, Math.max(0, (t - A.result - 600) / 30)) : 0;
    if (ph) { var b = P(1.0, 1.0, 4 + lift);
      if (lift > 0 || !RM) { var fl = lift > 0 ? 10 : 3 + Math.floor(t / 90) % 2;
        for (var y = 0; y < fl; y++) for (var x = -2; x <= 2; x++) if (bay(x + 9, y + Math.floor(t / 60)) < 1 - y / fl) f.px(b[0] + x, b[1] + 1 + y, y < fl / 3 ? C('#fff2a8') : y < fl * 0.7 ? C('#ffb03c') : C('#ff4d6d')); }
      return; }
    box(f, 0.2, 0.2, 0, 1.6, 1.6, 4, '#4a4d66');
    for (var k = 0; k < 4; k++) { var a = P(0.2 + k * 0.4, 1.8, 2), c = P(0.4 + k * 0.4, 1.8, 2); f.line(a[0], a[1], c[0], c[1], C('#ffd23f')); }
    var L = lift;
    box(f, 0.5, 0.5, 4 + L, 0.25, 0.25, 9, acc());
    box(f, 1.25, 0.5, 4 + L, 0.25, 0.25, 9, acc()); box(f, 0.5, 1.25, 4 + L, 0.25, 0.25, 9, acc());
    box(f, 0.7, 0.7, 4 + L, 0.6, 0.6, 30, '#e8e8f4');
    box(f, 0.68, 0.68, 24 + L, 0.64, 0.64, 4, acc());
    box(f, 0.8, 0.8, 34 + L, 0.4, 0.4, 6, '#e8e8f4'); box(f, 0.9, 0.9, 40 + L, 0.2, 0.2, 4, '#ff4d6d');
    var w = P(1.0, 1.3, 17 + L); f.disc(w[0], w[1], 2.3, C('#1a2a55')); f.px(w[0] - 1, w[1] - 1, C('#7fd0ff'));
    box(f, 1.25, 1.25, 4 + L, 0.25, 0.25, 9, acc());
  },
  sys: function (f, t, ph) {
    if (ph) { if (!RM) { var k = Math.floor(t / 180) % 9, i = k % 3, j = Math.floor(k / 3), s = P(0.25 + i * 0.55 + 0.22, 0.25 + j * 0.55 + 0.22, 12); f.glow(s[0], s[1], 5, 3, C('#ffffff'), 0.5); } return; }
    box(f, 0.1, 0.1, 0, 1.8, 1.8, 3, '#2a2a44');
    for (var d = 0; d <= 4; d++) for (var i2 = 0; i2 < 3; i2++) { var j2 = d - i2; if (j2 < 0 || j2 > 2) continue; box(f, 0.25 + i2 * 0.55, 0.25 + j2 * 0.55, 3, 0.45, 0.45, 8, acc()); }
    for (d = 0; d <= 2; d++) for (i2 = 0; i2 < 2; i2++) { j2 = d - i2; if (j2 < 0 || j2 > 1) continue; box(f, 0.52 + i2 * 0.55, 0.52 + j2 * 0.55, 11, 0.45, 0.45, 8, acc()); }
  },
  lead: function (f, t, ph) {
    if (ph) { var c = P(0.62, 0.75, 24); f.glow(c[0], c[1], 9, 7, C(acc()), 0.35);
      var day = RM ? 2 : Math.floor(t / 600) % 5;
      for (var k = 0; k < 5; k++) { var a = P(0.62, 0.52 + k * 0.11, 22), b = P(0.62, 0.52 + k * 0.11, k === day ? 28 : 25); f.line(a[0], a[1], b[0], b[1], k === day ? C('#ffffff') : C(acc(), 0.2)); } return; }
    var leg = '#4a3220';
    box(f, 0.25, 0.35, 0, 0.12, 0.12, 14, leg); box(f, 1.65, 0.35, 0, 0.12, 0.12, 14, leg); box(f, 0.25, 1.1, 0, 0.12, 0.12, 14, leg); box(f, 1.65, 1.1, 0, 0.12, 0.12, 14, leg);
    box(f, 0.2, 0.3, 14, 1.65, 0.95, 3, '#6b4a2f');
    box(f, 0.45, 0.62, 17, 0.25, 0.25, 3, '#22222e');
    box(f, 0.5, 0.42, 20, 0.1, 0.7, 12, '#1a1a2a');
    faceI(f, 0.61, 0.46, 1.08, 21, 31, C('#0e0e1c'));
    box(f, 1.4, 0.9, 17, 0.18, 0.18, 5, '#e8e8f4');
    box(f, 1.0, 1.45, 0, 0.12, 0.12, 8, '#444'); box(f, 0.8, 1.3, 8, 0.6, 0.6, 3, '#3d4a66'); box(f, 1.35, 1.3, 11, 0.12, 0.6, 12, '#33405a');
  },
  app: function (f, t, ph) {
    if (ph) {
      var bg = C('#ffffff'), a1 = C(acc()), soft = C('#d9d4ee');
      faceJ(f, 1.06, 0.68, 1.52, 5, 44, C('#f4f2fb'));
      faceJ(f, 1.06, 0.68, 1.52, 38, 44, a1);
      var off = RM ? 0 : (t / 90) % 8;
      for (var z = 34 - off; z > 6; z -= 8) { if (z > 35) continue; faceJ(f, 1.06, 0.74, 1.46, Math.max(6, z - 5), Math.min(36, z), soft); }
      var g = P(1.1, 1.06, 24); f.glow(g[0], g[1], 18, 26, C(acc(), 0.3), 0.22);
      if (!RM && Math.floor(t / 1200) % 3 === 1) { var n = P(1.55, 1.06, 50); f.rect(n[0] - 4, n[1] - 3, 9, 5, bg); f.px(n[0] - 2, n[1] - 1, a1); f.px(n[0], n[1] - 1, a1); f.px(n[0] + 2, n[1] - 1, a1); }
      return; }
    box(f, 0.45, 0.7, 0, 1.2, 0.5, 2, '#2a2a3a');
    box(f, 0.6, 0.8, 2, 1.0, 0.26, 46, '#121222');
  }
};
var STAGE_KEYS = ['raised', 'v1', 'users', 'grow', 'new', 'dated', 'bgrow', 'nolead', 'messy', 'leak', 'head', 'sketch', 'proto'];

/* ---------- room ---------- */
function themeAt(i, j, t) {
  var k = S.role || 'none';
  if (t - A.floor < (i + j) * 45 + 140 && !RM) return TH[A.prevTheme] || TH.none;
  return TH[k];
}
function drawFloor(f, t) {
  var T = TH[S.role || 'none'];
  G.oi = G.oj = G.oz = 0;
  box(f, 0, 0, -7, N, N, 7, T.edge || '#0b0718');
  for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
    var th = themeAt(i, j, t), dt = t - A.floor - (i + j) * 45, z = (!RM && dt > 0 && dt < 140) ? Math.round(Math.sin(dt / 140 * Math.PI) * 4) : 0;
    var c = C((i + j) % 2 ? th.fa : th.fb);
    f.poly([P(i, j, z), P(i + 1, j, z), P(i + 1, j + 1, z), P(i, j + 1, z)], c);
    if (th.plank) { var a = P(i, j + 0.5, z), b = P(i + 1, j + 0.5, z); f.line(a[0], a[1], b[0], b[1], C(th.fa, -0.18)); }
  }
  var T2 = TH[S.role || 'none'], gc = C(T2.grid);
  for (var k = 0; k <= N; k++) { var p = P(k, 0), q = P(k, N); f.line(p[0], p[1], q[0], q[1], gc); p = P(0, k); q = P(N, k); f.line(p[0], p[1], q[0], q[1], gc); }
}
function drawWalls(f, t) {
  var T = TH[S.role || 'none'];
  G.oi = G.oj = G.oz = 0;
  if (!T.wl) {
    var c = C('#3b2a7a');
    for (var z = 0; z < WH; z += 4) { var a = P(0, 0, z); f.px(a[0], a[1], c); a = P(0, N, z); f.px(a[0], a[1], c); a = P(N, 0, z); f.px(a[0], a[1], c); }
    for (var s = 0; s <= N * 16; s += 4) { a = P(0, s / 16, WH); f.px(a[0], a[1], c); a = P(s / 16, 0, WH); f.px(a[0], a[1], c); }
    return;
  }
  faceI(f, 0, 0, N, 0, WH, C(T.wl)); faceJ(f, 0, 0, N, 0, WH, C(T.wr));
  faceI(f, 0, 0, N, 0, 4, C(T.wl, -0.35)); faceJ(f, 0, 0, N, 0, 4, C(T.wr, -0.35));
  var tc = C(T.trim), e = P(0, 0, WH), l = P(0, N, WH), r = P(N, 0, WH);
  f.line(e[0], e[1], l[0], l[1], tc); f.line(e[0], e[1], r[0], r[1], tc); f.line(e[0], e[1], e[0], P(0, 0, 0)[1], C(T.wl, -0.4));
  /* window on the right wall: the sky is answer 4 (when) */
  var sk = SKY[S.when || 'none'], i0 = 1.4, i1 = 3.4, z0 = 24, z1 = 52, top = C(sk[0]), bot = C(sk[1]);
  var flash = S.when === 'asap' && !RM && (Math.floor(t / 100) % 37 === 0);
  f.poly([P(i0, 0, z1), P(i1, 0, z1), P(i1, 0, z0), P(i0, 0, z0)], function (x, y) {
    var i = (x + 0.5 - Z.ox) / 16, zz = Z.oy + i * 8 - (y + 0.5), v = (zz - z0) / (z1 - z0);
    if (flash) return C('#e8e4ff');
    var cc = bay(x, y) < v ? top : bot;
    if (S.when === 'm12' || S.when === 'qtr') { var du = i - 2.7, dz = zz - (S.when === 'qtr' ? 30 : 42); if (du * du * 256 + dz * dz < (S.when === 'qtr' ? 40 : 22)) return C('#fff2a8'); if (S.when === 'm12' && ((i > 1.7 && i < 2.3 && zz > 33 && zz < 36) || (i > 1.9 && i < 2.2 && zz >= 36 && zz < 38))) return C('#ffffff'); }
    if (S.when === 'long') { var mu = i - 2.8, mz = zz - 44; if (mu * mu * 256 + mz * mz < 16 && !(mu * mu * 256 + (mz - 2) * (mz - 2) < 10 && mu > -0.05)) return C('#f6f4d8'); if ((Math.floor(x * 7 + y * 13) % 29) === 0) return C('#ffffff'); }
    if (S.when === 'asap' && Math.floor(t / 100) % 37 < 2 && !RM) { var lx = i - 2.2; if (Math.abs(lx * 16 - Math.sin(zz / 3) * 2) < 0.8) return C('#fff2a8'); }
    return cc;
  });
  var fr = C(T.trim, -0.2);
  var p0 = P(i0, 0, z1), p1 = P(i1, 0, z1), p2 = P(i1, 0, z0), p3 = P(i0, 0, z0), m0 = P((i0 + i1) / 2, 0, z1), m1 = P((i0 + i1) / 2, 0, z0);
  f.line(p0[0], p0[1], p1[0], p1[1], fr); f.line(p3[0], p3[1], p2[0], p2[1], fr); f.line(p0[0], p0[1], p3[0], p3[1], fr); f.line(p1[0], p1[1], p2[0], p2[1], fr); f.line(m0[0], m0[1], m1[0], m1[1], fr);
  var sill = P(i0, 0, z0 - 1), sill2 = P(i1, 0, z0 - 1); f.line(sill[0], sill[1] + 1, sill2[0], sill2[1] + 1, C(T.trim));
  /* left wall: one object that says who's building */
  var L = function (j, z) { return P(0, j, z); };
  if (S.role === 'founder') {
    var pp = L(4.6, 54); f.poly([L(2.6, 54), L(4.6, 54), L(4.6, 22), L(2.6, 22)], C('#140a30'));
    wallArt(f, pp[0] + 26, pp[1] - 9 + 4, -1, ['.....ww.....', '....wwww....', '....wbbw....', '....wbbw....', '....wwww....', '...pwwwwp...', '..ppwwwwpp..', '..p.wwww.p..', '.....oo.....', '....oyyo....', '.....yy.....', '.....o......'], { w: C('#e8e8f4'), b: C('#2fb7c9'), p: C('#9b59f7'), o: C('#ff9a3c'), y: C('#ffd23f') });
    var q0 = L(2.6, 54), q1 = L(4.6, 54), q2 = L(4.6, 22), q3 = L(2.6, 22); f.line(q0[0], q0[1], q1[0], q1[1], tc); f.line(q3[0], q3[1], q2[0], q2[1], tc); f.line(q0[0], q0[1], q3[0], q3[1], tc); f.line(q1[0], q1[1], q2[0], q2[1], tc);
  } else if (S.role === 'biz') {
    for (var k = 0; k < 14; k++) { var j = k * 0.5; f.poly([L(j, 62), L(j + 0.5, 62), L(j + 0.5, 54), L(j, 54)], C(k % 2 ? '#f6f4ff' : T.trim)); }
    var sp = L(4.4, 44); f.poly([L(2.8, 44), L(4.4, 44), L(4.4, 34), L(2.8, 34)], C('#140a1c'));
    sign(f, L(4.15, 41)[0], L(4.15, 41)[1], -1, 'OPEN', C('#ff4d6d'));
  } else if (S.role === 'pl') {
    f.poly([L(2.2, 52), L(5.0, 52), L(5.0, 28), L(2.2, 28)], C('#e8eaf2'));
    f.poly([L(2.3, 51), L(4.9, 51), L(4.9, 29), L(2.3, 29)], C('#f6f7fb'));
    var notes = [[2.6, 46, '#ffd23f'], [3.2, 46, '#8be36a'], [3.8, 44, '#ff9ab0'], [2.7, 38, '#7fd0ff'], [3.5, 37, '#ffd23f'], [4.3, 40, '#b07cff']];
    for (k = 0; k < notes.length; k++) { var n = notes[k]; f.poly([L(n[0], n[1]), L(n[0] + 0.35, n[1]), L(n[0] + 0.35, n[1] - 5), L(n[0], n[1] - 5)], C(n[2])); }
    var a1 = L(2.6, 33), a2 = L(4.6, 33); f.line(a1[0], a1[1], a2[0], a2[1], C('#2fb7c9'));
  } else if (S.role === 'idea') {
    f.poly([L(2.2, 52), L(4.8, 52), L(4.8, 28), L(2.2, 28)], C('#7a5a3a'));
    for (var hj = 2.35; hj < 4.75; hj += 0.25) for (var hz = 30; hz < 51; hz += 4) { var hp = L(hj, hz); f.px(hp[0], hp[1], C('#5a4028')); }
    var tl = L(3.0, 48); wallArt(f, tl[0], tl[1], -1, ['.gg.', 'g..g', '.gg.', '.g..', '.g..', '.g..', '.g..'], { g: C('#c8c8dc') });
    tl = L(3.9, 48); wallArt(f, tl[0], tl[1], -1, ['ggg', '.g.', '.g.', '.r.', '.r.', '.r.'], { g: C('#c8c8dc'), r: C('#ff4d6d') });
  }
}
function drawBulb(f, t) {
  if (S.role !== 'idea') return;
  var x = 112, y = 30 + (RM ? 0 : Math.round(Math.sin(t / 900))); for (var k = 0; k < y - 3; k++) f.px(x, k, C('#555a66'));
  f.glow(x, y + 2, 16, 12, C('#ffe066'), 0.32); f.disc(x, y + 2, 2.6, C('#fff2a8')); f.rect(x - 1, y - 2, 3, 2, C('#8a8fa8'));
}
function drawBeacon(f, t) {
  if (S.when !== 'asap') return;
  var b = P(6.0, 0, 58), on = RM || Math.floor(t / 250) % 2 === 0;
  f.rect(b[0] - 2, b[1] + 1, 5, 2, C('#444a5a'));
  if (on) { f.glow(b[0], b[1] - 1, 12, 9, C('#ff4d6d'), 0.6); } f.disc(b[0] + 0.5, b[1] - 0.5, 2.2, C(on ? '#ff6b85' : '#7a1f30'));
}

/* answer 5 (budget) shapes the floor */
function ringTiles() { var r = []; for (var i = 0; i < N; i++) r.push([i, 0]); for (var j = 1; j < N; j++) r.push([N - 1, j]); for (i = N - 2; i >= 0; i--) r.push([i, N - 1]); for (j = N - 2; j > 0; j--) r.push([0, j]); return r; }
var RING = ringTiles();
function drawBudgetFloor(f, t) {
  G.oi = G.oj = G.oz = 0;
  var dt = t - A.budget, a = C(acc());
  if (S.budget === 'small') { var c = P(4.6, 4.6, 0); f.glow(c[0], c[1], 28, 14, C('#fff2a8', -0.1), 0.45); }
  if (S.budget === 'monthly') { var head = RM ? 0 : Math.floor(t / 110) % RING.length;
    for (var k = 0; k < 6; k++) { var tl = RING[(head - k + RING.length) % RING.length], cc = k === 0 ? C('#ffffff') : C(acc(), 0.3 - k * 0.12);
      f.poly([P(tl[0] + 0.12, tl[1] + 0.12), P(tl[0] + 0.88, tl[1] + 0.12), P(tl[0] + 0.88, tl[1] + 0.88), P(tl[0] + 0.12, tl[1] + 0.88)], cc); } }
  if (S.budget === 'proj') { var lp = C(acc(), 0.15); for (var i = 0; i < N; i++) { var p = P(i + 0.5, N - 0.08), q = P(N - 0.08, i + 0.5); f.px(p[0], p[1], lp); f.px(q[0], q[1], lp); } }
  return dt;
}
function budgetItems(t) {
  var L = [];
  if (S.budget === 'small') L.push({ d: 10.1, fn: function (f) { box(f, 5.7, 4.2, 0, 0.5, 0.5, 6, acc()); } });
  if (S.budget === 'proj') {
    for (var k = 0; k < N; k++) (function (k) {
      L.push({ d: N + k + 0.5, fn: function (f) { box(f, N - 0.12, k + 0.44, 0, 0.12, 0.12, 9, '#c8a878'); box(f, N - 0.1, k, 6, 0.06, 1, 1.5, '#a88858'); } });
      if (k < N - 1) L.push({ d: N + k + 0.6, fn: function (f) { box(f, k + 0.44, N - 0.12, 0, 0.12, 0.12, 9, '#c8a878'); box(f, k, N - 0.1, 6, 1, 0.06, 1.5, '#a88858'); } });
    })(k);
    L.push({ d: 6.95, fn: function (f) { box(f, 6.5, 0.3, 0, 0.1, 0.1, 44, '#e8e8f4'); }, em: function (f, t2) {
      var top = P(6.55, 0.35, 44), w = RM ? 0 : Math.floor(t2 / 160) % 3;
      for (var y = 0; y < 8; y++) for (var x = 0; x < 14 - y * 0.8; x++) f.px(top[0] + 1 + x, top[1] + y + Math.floor(Math.sin((x + w * 2) / 3) * 1.2), (x + y) % 5 ? C(acc()) : C(acc(), 0.3)); } });
  }
  if (S.budget === 'unsure') [[1.2, 4.4], [4.4, 1.2]].forEach(function (p, n) {
    L.push({ d: 30, fn: function (f, t2) { var z = 62 + (RM ? 0 : Math.round(Math.sin(t2 / 400 + n * 2) * 2)); box(f, p[0], p[1], z, 0.7, 0.7, 11, '#f0a030');
      var a = P(p[0] + 0.35, p[1] + 0.7, z + 8); sign(f, a[0] - 4, a[1] - 1, 1, '?', C('#fff7e0')); var b = P(p[0] + 0.7, p[1] + 0.35, z + 8); sign(f, b[0] + 2, b[1] - 1, -1, '?', C('#ffe2a8')); } });
  });
  return L;
}

/* ---------- minime: Dave's art, composed into poses and pixelated ---------- */
var IMG = {}, POSE = {}, MW = 0, MH = 96, CW = 725, CH = 1009, CXO = 140;
function loadImg(src) { return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = src; }); }
function compose(al, ar) {
  var c = document.createElement('canvas'); c.width = CW; c.height = CH; var x = c.getContext('2d');
  function arm(img, px, py, lx, ly, a) { x.save(); x.translate(CXO + px, py); x.rotate(a); x.drawImage(img, -lx, -ly); x.restore(); }
  if (al > 1 || ar > 1) { /* raised arms sit behind the shoulders */
    if (al) arm(IMG.al, 52, 557, 52, 12, al); if (ar) arm(IMG.ar, 398, 557, 47, 12, ar);
    x.drawImage(IMG.base, CXO, 0);
    if (!al) arm(IMG.al, 52, 557, 52, 12, 0); if (!ar) arm(IMG.ar, 398, 557, 47, 12, 0);
  } else { x.drawImage(IMG.base, CXO, 0); arm(IMG.al, 52, 557, 52, 12, al); arm(IMG.ar, 398, 557, 47, 12, ar); }
  return c;
}
function pixelate(src, w, h) {
  var cur = src;
  while (cur.width / 2 > w) { var n = document.createElement('canvas'); n.width = Math.ceil(cur.width / 2); n.height = Math.ceil(cur.height / 2); var nx = n.getContext('2d'); nx.imageSmoothingQuality = 'high'; nx.drawImage(cur, 0, 0, n.width, n.height); cur = n; }
  var o = document.createElement('canvas'); o.width = w; o.height = h; var ox = o.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(cur, 0, 0, w, h);
  var id = ox.getImageData(0, 0, w, h), d = id.data, b = new FB(w, h), out = C('#0c0820');
  for (var k = 0, p = 0; k < d.length; k += 4, p++) { if (d[k + 3] < 120) continue;
    var r = Math.min(255, Math.round(d[k] * 1.08 / 12) * 12), g = Math.min(255, Math.round(d[k + 1] * 1.08 / 12) * 12), bl = Math.min(255, Math.round(d[k + 2] * 1.1 / 12) * 12);
    b.d[p] = (0xff000000 | (bl << 16) | (g << 8) | r) >>> 0; }
  var o2 = new Uint32Array(b.d);
  for (var y = 0; y < h; y++) for (var x2 = 0; x2 < w; x2++) { var i = y * w + x2; if (b.d[i]) continue;
    if ((x2 > 0 && b.d[i - 1]) || (x2 < w - 1 && b.d[i + 1]) || (y > 0 && b.d[i - w]) || (y < h - 1 && b.d[i + w])) o2[i] = out; }
  b.d = o2; return b;
}
function buildMinime() {
  var base = document.querySelector('script[src*="wwm-scene"]'), root = base ? base.src.replace(/js\/wwm-scene\.js.*$/, '') : '';
  return Promise.all([loadImg(root + 'assets/studio/minime/base.webp'), loadImg(root + 'assets/studio/minime/arm-l.webp'), loadImg(root + 'assets/studio/minime/arm-r.webp')]).then(function (r) {
    IMG.base = r[0]; IMG.al = r[1]; IMG.ar = r[2];
    MW = Math.round(CW * MH / CH);
    var d = Math.PI / 180;
    POSE.idleHi = compose(0, 0);
    POSE.idle = pixelate(POSE.idleHi, MW, MH);
    POSE.cheer = pixelate(compose(150 * d, -150 * d), MW, MH);
    POSE.waveA = pixelate(compose(0, -140 * d), MW, MH);
    POSE.waveB = pixelate(compose(0, -168 * d), MW, MH);
    mm = true;
  });
}
var MX = 144, MY = 146;
function drawMinime(f, t) {
  if (!mm || introOn) return;
  var pose = POSE.idle, dy = 0, hopT = t - A.hop;
  if (!RM && hopT < 700) { var p = hopT / 700; dy = -Math.round(Math.sin(p * Math.PI) * 12); pose = POSE.cheer; }
  else if (S.result && t - A.result < 3200 && !RM) pose = Math.floor((t - A.result) / 220) % 2 ? POSE.waveA : POSE.waveB;
  else if (S.result) pose = POSE.waveA;
  else if (!RM && Math.floor(t / 600) % 2) dy = 1;
  if (S.result && RM) pose = POSE.cheer;
  var sx = Math.round(MX - MW / 2), sy = MY - MH + dy;
  /* shadow */
  f.glow(MX, MY + 1, 16, 5, C('#000000'), 0.75);
  f.blit(pose, sx, sy);
}

/* ---------- particles ---------- */
var parts2 = [];
function burst(x, y, n, cols, up) { if (RM) return; for (var k = 0; k < n; k++) { var a = Math.random() * Math.PI * 2, s = 0.4 + Math.random() * (up ? 2.2 : 1.1); parts2.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * (up ? 1 : 0.5) - (up ? 1.6 : 0.4), l: 0, L: 30 + Math.random() * 30, c: C(cols[k % cols.length]) }); } }
function drawParts(f) { parts2 = parts2.filter(function (p) { p.l++; if (p.l > p.L) return false; p.x += p.vx; p.y += p.vy; p.vy += 0.06; f.px(p.x, p.y, p.c); return true; }); }

/* ---------- result gem ---------- */
var PKC = { lead: '#8be36a', sprint: '#2fb7c9', launch: '#b07cff', system: '#9b59f7' };
function drawGem(f, t) {
  if (!S.result) return;
  var p = RM ? 1 : Math.min(1, (t - A.result) / 600), y = Math.round(36 - (1 - p) * 40 + (RM ? 0 : Math.sin(t / 400) * 2)), x = MX, c = PKC[S.result] || '#b07cff';
  f.glow(x, y, 20, 18, C(c), 0.5);
  var r = 8, sp = RM ? 1 : Math.abs(Math.cos(t / 500)), wv = Math.max(2, Math.round(r * sp));
  f.poly([[x, y - r - 3], [x + wv, y - 2], [x, y + r + 2], [x - wv, y - 2]], C(c));
  f.poly([[x, y - r - 3], [x + wv, y - 2], [x, y - 2]], C(c, 0.45)); f.poly([[x, y - 2], [x - wv, y - 2], [x, y + r + 2]], C(c, -0.3));
  f.px(x - 1, y - r, C('#ffffff'));
}

/* ---------- frame ---------- */
var cv, cx, fb, img, last = 0, raf = 0, visible = true;
function bg(f, t) {
  var a = C('#0d0822'), b = C('#05040c');
  for (var y = 0; y < H; y++) { var v = y / H; for (var x = 0; x < W; x++) f.d[y * W + x] = bay(x, y) < v ? b : a; }
  if (!RM) for (var k = 0; k < 18; k++) { var sx = (k * 53 + Math.floor(t / 90 / (1 + k % 3))) % W, sy = (k * 97) % 70 + 2; if ((k + Math.floor(t / 400)) % 4) f.px(sx, sy, C('#3a2a6e')); }
}
function slotDrop(key) { var t0 = A[key], p = (performance.now() - t0) / 650; if (RM || p >= 1) return 0; if (p < 0) return 80; var e = 1 - p; return Math.round(Math.abs(Math.cos(p * Math.PI * 1.5)) * e * e * 70); }
var landed = { stage: true, need: true };
function render(t) {
  var f = fb; bg(f, t);
  drawWalls(f, t); drawFloor(f, t); drawBudgetFloor(f, t);
  /* drawables, back to front */
  var L = budgetItems(t);
  if (S.stage && PROPS[S.stage]) L.push({ d: 4.4 + 1.6, slot: 'stage', o: [0.6, 3.8], fn: PROPS[S.stage] });
  if (S.need && PROPS[S.need]) L.push({ d: 4.4 + 1.6, slot: 'need', o: [3.8, 0.6], fn: PROPS[S.need] });
  L.push({ d: 9.2, me: 1 });
  L.sort(function (a, b) { return a.d - b.d; });
  var i;
  for (i = 0; i < L.length; i++) { var it = L[i];
    if (it.me) { G.oi = G.oj = G.oz = 0; drawMinime(f, t); continue; }
    if (it.o) { G.oi = it.o[0]; G.oj = it.o[1]; G.oz = slotDrop(it.slot); if (G.oz === 0 && !landed[it.slot]) { landed[it.slot] = true; var c = P(1, 1, 0); burst(c[0], c[1], 22, ['#d9c4ff', '#ffffff', acc()]); } }
    else { G.oi = G.oj = G.oz = 0; }
    it.fn(f, t, 0);
  }
  G.oi = G.oj = G.oz = 0;
  /* light: answer 4 */
  if (S.when === 'qtr') f.tint(1.04, 0.86, 0.8);
  else if (S.when === 'long') f.tint(0.62, 0.68, 0.98);
  else if (S.when === 'asap') { var pu = RM ? 0 : (Math.floor(t / 250) % 2); f.tint(1 + 0.12 * pu, 0.9, 0.92); }
  else if (S.when === 'm12') f.tint(1.08, 1.08, 1.06);
  /* emissive layer */
  drawBulb(f, t); drawBeacon(f, t);
  for (i = 0; i < L.length; i++) { it = L[i]; if (it.me) continue;
    if (it.o) { G.oi = it.o[0]; G.oj = it.o[1]; G.oz = slotDrop(it.slot); it.fn(f, t, 1); }
    else if (it.em) { G.oi = G.oj = G.oz = 0; it.em(f, t); } }
  G.oi = G.oj = G.oz = 0;
  if (!S.role) { var pad = P(4.6, 4.6, 0); f.glow(pad[0], pad[1], 26, 12, C('#8239ea'), 0.55); }
  drawGem(f, t); drawParts(f);
  if (S.result && !RM && t - A.result < 2600 && Math.random() < 0.5) burst(Math.random() * W, -2, 2, ['#8be36a', '#2fb7c9', '#b07cff', '#ffd23f', '#ffffff'], false);
  new Uint32Array(img.data.buffer).set(f.d); cx.putImageData(img, 0, 0);
}
function loop(t) { raf = 0; if (!visible) return; if (t - last >= 50) { last = t; render(t); } raf = requestAnimationFrame(loop); }
function kick() { if (RM) { render(performance.now()); return; } if (!raf && visible) raf = requestAnimationFrame(loop); }

/* ---------- intro: the hi-res minime turns into pixels ---------- */
function intro(ov) {
  if (RM || !ov || !POSE.idleHi) { introDone = true; return; }
  introOn = true; ov.hidden = false;
  var sx = (MX - MW / 2) / W, sy = (MY - MH) / H;
  ov.style.left = (sx * 100) + '%'; ov.style.top = (sy * 100) + '%'; ov.style.width = (MW / W * 100) + '%'; ov.style.height = (MH / H * 100) + '%';
  var r = ov.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); ov.width = Math.max(1, Math.round(r.width * dpr)); ov.height = Math.max(1, Math.round(r.height * dpr));
  var o = ov.getContext('2d'), steps = [0, 0, 0, 0, 0, 300, 200, 140, 100, 80, MW], k = 0;
  var tmp = document.createElement('canvas');
  (function step() {
    var w = steps[k]; o.clearRect(0, 0, ov.width, ov.height);
    if (!w) { o.imageSmoothingEnabled = true; o.drawImage(POSE.idleHi, 0, 0, ov.width, ov.height); }
    else { tmp.width = w; tmp.height = Math.round(w * CH / CW); var tx = tmp.getContext('2d'); tx.imageSmoothingQuality = 'high'; tx.drawImage(POSE.idleHi, 0, 0, tmp.width, tmp.height); o.imageSmoothingEnabled = false; o.drawImage(tmp, 0, 0, ov.width, ov.height); }
    k++;
    if (k < steps.length) setTimeout(step, k < 6 ? 180 : 120);
    else setTimeout(function () { introOn = false; introDone = true; ov.hidden = true; burst(MX, MY - 50, 26, ['#8be36a', '#2fb7c9', '#b07cff', '#ffffff'], true); A.hop = performance.now(); kick(); }, 140);
  })();
}

/* ---------- public ---------- */
function set(st, changed) {
  var now = performance.now();
  if (changed === 'role' || (st.role || null) !== S.role) { A.prevTheme = S.role || 'none'; A.floor = now; }
  if (changed === 'stage' && st.stage) { A.stage = now; landed.stage = false; }
  if (changed === 'need' && st.need) { A.need = now; landed.need = false; }
  if (changed === 'budget') A.budget = now;
  if (changed === 'when') A.when = now;
  if (st.result && !S.result) A.result = now;
  if (changed && changed !== 'back') A.hop = now;
  for (var k in S) S[k] = st[k] || null;
  if (changed === 'back') { landed.stage = landed.need = true; A.stage = A.need = -1e9; }
  kick();
}
function mount(canvas, ov) {
  cv = canvas; cv.width = W; cv.height = H; cx = cv.getContext('2d'); fb = new FB(W, H); img = cx.createImageData(W, H);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting && !document.hidden; kick(); }).observe(cv);
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; kick(); });
  render(performance.now());
  buildMinime().then(function () { if (!RM) intro(ov); kick(); }, function () { kick(); });
  kick();
}
/* small pixel icons for answer buttons and package headings, drawn by the same engine */
function thumb(kind, id, accent) {
  var f = new FB(120, 110), save = { ox: Z.ox, oy: Z.oy }, sv = {}, k;
  for (k in S) sv[k] = S[k];
  Z.ox = 60; Z.oy = 40; G.oi = G.oj = G.oz = 0;
  S.role = accent || 'founder'; S.result = null;
  var t = 1000;
  if (kind === 'prop') { G.oi = 0; G.oj = 0; PROPS[id](f, t, 0); PROPS[id](f, t, 1); }
  else if (kind === 'role') {
    var T = TH[id];
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) f.poly([P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], C((i + j) % 2 ? T.fa : T.fb));
    faceI(f, 0, 0, 3, 0, 30, C(T.wl)); faceJ(f, 0, 0, 3, 0, 30, C(T.wr));
    var e = P(0, 0, 30), l = P(0, 3, 30), r = P(3, 0, 30); f.line(e[0], e[1], l[0], l[1], C(T.trim)); f.line(e[0], e[1], r[0], r[1], C(T.trim));
    box(f, 1.1, 1.1, 0, 0.8, 0.8, 10, T.acc);
  } else if (kind === 'when') {
    S.when = id; var sk = SKY[id];
    f.poly([P(0, 0, 40), P(2.2, 0, 40), P(2.2, 0, 0), P(0, 0, 0)], function (x, y) {
      var i2 = (x + 0.5 - Z.ox) / 16, zz = Z.oy + i2 * 8 - (y + 0.5), v = zz / 40;
      if (id === 'm12') { var du = i2 - 1.4, dz = zz - 28; if (du * du * 256 + dz * dz < 60) return C('#fff2a8'); }
      if (id === 'qtr') { du = i2 - 1.1; dz = zz - 8; if (du * du * 256 + dz * dz < 90) return C('#fff2a8'); }
      if (id === 'long') { du = i2 - 1.3; dz = zz - 26; if (du * du * 256 + dz * dz < 50 && !(du * du * 256 + (dz - 3) * (dz - 3) < 36 && du > 0)) return C('#f6f4d8'); if ((Math.floor(x * 7 + y * 13) % 23) === 0) return C('#ffffff'); }
      if (id === 'asap') { if (Math.abs((i2 - 1.1) * 16 - Math.sin(zz / 4) * 4) < 1.4 && zz > 6 && zz < 36) return C('#fff2a8'); }
      return bay(x, y) < v ? C(sk[0]) : C(sk[1]);
    });
    var fr = C('#d9c4ff'), a0 = P(0, 0, 40), a1 = P(2.2, 0, 40), a2 = P(2.2, 0, 0), a3 = P(0, 0, 0);
    f.line(a0[0], a0[1], a1[0], a1[1], fr); f.line(a3[0], a3[1], a2[0], a2[1], fr); f.line(a0[0], a0[1], a3[0], a3[1], fr); f.line(a1[0], a1[1], a2[0], a2[1], fr);
  } else if (kind === 'budget') {
    var tc = TH[S.role] || TH.founder;
    for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) f.poly([P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], C((i + j) % 2 ? '#2c1e5e' : '#261952'));
    if (id === 'small') { var c = P(1.5, 1.5); f.glow(c[0], c[1], 18, 9, C('#fff2a8'), 0.6); box(f, 1.2, 1.2, 0, 0.6, 0.6, 8, tc.acc); }
    if (id === 'proj') { for (k = 0; k < 3; k++) { box(f, 2.88, k + 0.44, 0, 0.12, 0.12, 9, '#c8a878'); box(f, k + 0.44, 2.88, 0, 0.12, 0.12, 9, '#c8a878'); box(f, 2.9, k, 6, 0.06, 1, 1.5, '#a88858'); box(f, k, 2.9, 6, 1, 0.06, 1.5, '#a88858'); }
      box(f, 2.5, 0.3, 0, 0.1, 0.1, 30, '#e8e8f4'); var tp = P(2.55, 0.35, 30); for (var y = 0; y < 7; y++) for (var x = 0; x < 12 - y; x++) f.px(tp[0] + 1 + x, tp[1] + y, C(tc.acc)); }
    if (id === 'monthly') { var rg = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]]; for (k = 0; k < rg.length; k++) { var q = rg[k]; f.poly([P(q[0] + 0.12, q[1] + 0.12), P(q[0] + 0.88, q[1] + 0.12), P(q[0] + 0.88, q[1] + 0.88), P(q[0] + 0.12, q[1] + 0.88)], k === 0 ? C('#ffffff') : C(tc.acc, 0.3 - k * 0.06)); } }
    if (id === 'unsure') { box(f, 1.0, 1.0, 14, 1.0, 1.0, 16, '#f0a030'); var aa = P(1.5, 2.0, 26); sign(f, aa[0] - 5, aa[1] - 2, 1, '?', C('#fff7e0')); var bb = P(2.0, 1.5, 26); sign(f, bb[0] + 2, bb[1] - 2, -1, '?', C('#ffe2a8')); }
  }
  Z.ox = save.ox; Z.oy = save.oy; for (k in sv) S[k] = sv[k]; G.oi = G.oj = G.oz = 0;
  /* crop to content */
  var x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (y = 0; y < f.h; y++) for (x = 0; x < f.w; x++) if (f.d[y * f.w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  var cvs = document.createElement('canvas');
  if (x1 < 0) { cvs.width = cvs.height = 1; return cvs; }
  var w = x1 - x0 + 1, h = y1 - y0 + 1, sz = Math.max(w, h); cvs.width = sz; cvs.height = sz;
  var cc = cvs.getContext('2d'), id2 = cc.createImageData(sz, sz), dd = new Uint32Array(id2.data.buffer), ox2 = Math.floor((sz - w) / 2), oy2 = Math.floor((sz - h) / 2);
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) dd[(y + oy2) * sz + x + ox2] = f.d[(y + y0) * f.w + x + x0];
  cc.putImageData(id2, 0, 0); return cvs;
}
window.WWMScene = { mount: mount, set: set, thumb: thumb, W: W, H: H };
})();
