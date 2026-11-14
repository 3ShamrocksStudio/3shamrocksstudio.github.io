// Keepers v2 shared builders. Logo geometry copied from lickpick/index.html (#pk, #logo, #i-check).
const LP = (() => {
  const PK = 'M50 97C45 97 41 93 36 86C24 70 6 48 6 30C6 12 24 4 50 4S94 12 94 30C94 48 76 70 64 86C59 93 55 97 50 97Z';
  const TRI = 'M40 30.5v27c0 3 3.2 4.8 5.8 3.2l21.5-13.5c2.4-1.5 2.4-5 0-6.4L45.8 27.3C43.2 25.7 40 27.5 40 30.5Z';
  const C = {stage:'#0B0912',panel:'#15111F',raise:'#1E1830',line:'#332A4A',mute:'#8F83B3',text:'#FFF7F0',dim:'#C9BEDB',ink:'#07060B',volt:'#FFE600',hot:'#FF2E88',cyan:'#2BE7FF',blaze:'#B47CFF'};

  // Affine-transform the (absolute-coordinate) pick path: unit (cx,cy) lands at (tx,ty), scale k, rotate deg.
  function tfPath(d, k, deg, tx, ty, cx = 50, cy = 52) {
    const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    const tok = d.match(/[A-Za-z]|-?\d*\.?\d+/g); let out = [], buf = [];
    for (const t of tok) {
      if (/[A-Za-z]/.test(t)) { out.push(t); continue; }
      buf.push(+t);
      if (buf.length === 2) {
        const x = (buf[0] - cx) * k, y = (buf[1] - cy) * k;
        out.push((x * c - y * s + tx).toFixed(2), (x * s + y * c + ty).toFixed(2)); buf = [];
      }
    }
    return out.join(' ');
  }

  // Full logo as inline SVG (100-unit box), parts addressable for animation.
  function logoSVG(size, id = '') {
    return `<svg ${id ? `id="${id}"` : ''} width="${size}" height="${size}" viewBox="-6 -6 116 116" style="overflow:visible;display:block">
      <g class="lg-hot"><path d="${PK}" fill="${C.hot}" transform="translate(7 5)"/></g>
      <g class="lg-body"><path d="${PK}" fill="${C.volt}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/></g>
      <g class="lg-tri" style="transform-origin:54px 44px"><path d="${TRI}" fill="${C.ink}"/></g>
      <path class="lg-draw" d="${PK}" fill="none" stroke="${C.volt}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" opacity="0"/>
    </svg>`;
  }

  const wordmark = (px, beta = true) => `<div style="display:flex;align-items:flex-start;gap:14px;font-size:${px}px">
      <span class="word">Lick<b>Pick</b><span class="tm">™</span></span>${beta ? `<span class="betatag" style="margin-top:${px * .12}px">Beta</span>` : ''}</div>`;

  const grain = (seed = 3) => `<svg class="grain" width="1120" height="1960"><filter id="gn${seed}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#gn${seed})"/></svg>`;

  // ---------- music data (ep08 SLIDE lick, verified against data.json + theory) ----------
  const OPEN = {6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64};
  const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const noteName = (s, f) => NAMES[(OPEN[s] + f) % 12];
  const SCALE = new Set(['A','C','D','E','G']);
  // order, string, fret, slideTo
  const LICK = [
    {i:1, s:4, f:7}, {i:2, s:3, f:5}, {i:3, s:3, f:7, to:9}, {i:4, s:2, f:8},
    {i:5, s:1, f:8}, {i:6, s:1, f:10}, {i:7, s:2, f:10}];

  // ---------- vertical fretboard (low E left, fret 5 at top) ----------
  function fretboard(o) {
    const {x0 = 300, dx = 116, y0 = 560, cell = 125, active = 3} = o;
    const X = s => x0 + (6 - s) * dx, Y = f => y0 + (f - 5 + .5) * cell;
    const yEnd = y0 + 6 * cell;
    let g = '';
    // neck
    g += `<rect x="${X(6) - 62}" y="${y0 - 26}" width="${5 * dx + 124}" height="${6 * cell + 52}" rx="26" fill="${C.panel}" stroke="${C.line}" stroke-width="3"/>`;
    // box brackets (left)
    const br = (x, f1, f2, label, col, op) => `<g opacity="${op}"><path d="M${x + 16} ${y0 + (f1 - 5) * cell + 10}H${x}V${y0 + (f2 - 4) * cell - 10}H${x + 16}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <text transform="translate(${x - 14} ${(y0 + (f1 - 5) * cell + y0 + (f2 - 4) * cell) / 2}) rotate(-90)" text-anchor="middle" font-family="Archivo" font-weight="800" font-size="24" letter-spacing="3" fill="${col}">${label}</text></g>`;
    g += br(118, 5, 8, 'BOX 1', C.dim, .75) + br(168, 7, 10, 'BOX 2', C.volt, 1);
    // inlays
    for (const f of [5, 7, 9]) g += `<circle cx="${(X(4) + X(3)) / 2}" cy="${Y(f)}" r="11" fill="${C.line}"/>`;
    // fret wires
    for (let k = 0; k <= 6; k++) g += `<rect x="${X(6) - 30}" y="${y0 + k * cell - 2.5}" width="${5 * dx + 60}" height="5" rx="2.5" fill="${k === 0 ? '#4a4066' : '#3b3354'}"/>`;
    // fret numbers
    for (let f = 5; f <= 10; f++) g += `<text x="${X(6) - 92}" y="${Y(f) + 11}" text-anchor="middle" font-family="Archivo" font-weight="800" font-size="32" fill="${[5,7,9].includes(f) ? C.dim : C.mute}">${f}</text>`;
    // strings (thicker low)
    for (let s = 6; s >= 1; s--) g += `<rect x="${X(s) - (1 + s * .55)}" y="${y0 - 20}" width="${2 + s * 1.1}" height="${6 * cell + 40}" rx="1" fill="${C.dim}" opacity="${.55 + (6 - s) * .05}"/>`;
    // string labels
    ['E','A','D','G','B','e'].forEach((l, k) => g += `<text x="${X(6 - k)}" y="${y0 - 48}" text-anchor="middle" font-family="Archivo" font-weight="800" font-size="30" fill="${C.mute}">${l}</text>`);
    // ghost scale dots
    const lickSet = new Set(LICK.map(n => n.s + ':' + n.f).concat(['3:9']));
    for (let s = 6; s >= 1; s--) for (let f = 5; f <= 10; f++) {
      const n = noteName(s, f); if (!SCALE.has(n) || lickSet.has(s + ':' + f)) continue;
      g += `<circle cx="${X(s)}" cy="${Y(f)}" r="29" fill="${C.raise}" stroke="${C.line}" stroke-width="3"/><text x="${X(s)}" y="${Y(f) + 9}" text-anchor="middle" font-family="Archivo" font-weight="800" font-size="25" fill="${C.mute}">${n}</text>`;
    }
    // path
    const pts = []; LICK.forEach(n => { pts.push([X(n.s), Y(n.f)]); if (n.to) pts.push([X(n.s), Y(n.to)]); });
    const doneIdx = active + 1; // points up to slide destination are "played"
    const pl = a => a.map(p => p.join(',')).join(' ');
    g += `<polyline points="${pl(pts.slice(doneIdx - 1))}" fill="none" stroke="${C.mute}" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += `<polyline points="${pl(pts.slice(0, doneIdx))}" fill="none" stroke="${C.hot}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    // slide arrow + destination
    const sl = LICK.find(n => n.to);
    const sx = X(sl.s), ya = Y(sl.f) + 52, yb = Y(sl.to) - 64;
    g += `<line x1="${sx}" y1="${ya}" x2="${sx}" y2="${yb}" stroke="${C.hot}" stroke-width="14" stroke-linecap="round"/><path d="M${sx - 22} ${yb - 6}L${sx} ${yb + 20}L${sx + 22} ${yb - 6}Z" fill="${C.hot}" stroke="${C.hot}" stroke-width="6" stroke-linejoin="round"/>`;
    g += `<g transform="translate(${sx - 112} ${Y(8)}) rotate(-90)"><rect x="-62" y="-22" width="124" height="44" rx="12" fill="${C.hot}" stroke="${C.ink}" stroke-width="3"/><text y="10" text-anchor="middle" font-family="Archivo" font-weight="800" font-size="25" letter-spacing="2" fill="${C.ink}">SLIDE</text></g>`;
    // lick notes
    const dot = (x, y, n, st, root, num) => {
      let s = '';
      const fill = st === 'up' ? C.panel : C.volt, tc = st === 'up' ? C.text : C.ink, sk = st === 'up' ? C.text : C.ink;
      if (st === 'on') s += `<circle cx="${x}" cy="${y}" r="58" fill="none" stroke="${C.hot}" stroke-width="6"/>`;
      if (root) {
        const k = .96;
        s += `<path d="${tfPath(PK, k, -8, x + 6, y + 5)}" fill="${C.hot}"/>`;
        s += `<path d="${tfPath(PK, k, -8, x, y)}" fill="${fill}" stroke="${sk}" stroke-width="4.5" stroke-linejoin="round"/>`;
        s += `<text x="${x}" y="${y + 6}" text-anchor="middle" font-family="Dela Gothic One" font-size="38" fill="${tc}">${n}</text>`;
      } else {
        s += `<circle cx="${x}" cy="${y}" r="46" fill="${fill}" stroke="${sk}" stroke-width="4.5"/><text x="${x}" y="${y + 14}" text-anchor="middle" font-family="Dela Gothic One" font-size="38" fill="${tc}">${n}</text>`;
      }
      if (num) s += `<circle cx="${x + 40}" cy="${y - 40}" r="20" fill="${C.ink}" stroke="${st === 'up' ? C.mute : C.volt}" stroke-width="3"/><text x="${x + 40}" y="${y - 32}" text-anchor="middle" font-family="Archivo" font-weight="800" font-size="23" fill="${st === 'up' ? C.dim : C.volt}">${num}</text>`;
      return s;
    };
    // slide destination E (target of note 3)
    g += `<circle cx="${sx}" cy="${Y(sl.to)}" r="46" fill="${C.volt}" stroke="${C.ink}" stroke-width="4.5"/><text x="${sx}" y="${Y(sl.to) + 14}" text-anchor="middle" font-family="Dela Gothic One" font-size="38" fill="${C.ink}">${noteName(sl.s, sl.to)}</text>`;
    LICK.forEach(n => {
      const st = n.i < active ? 'done' : n.i === active ? 'on' : 'up';
      g += dot(X(n.s), Y(n.f), noteName(n.s, n.f), st, noteName(n.s, n.f) === 'A', n.i);
    });
    return `<svg width="1080" height="1920" style="position:absolute;left:0;top:0;overflow:visible">${g}</svg>`;
  }

  // ---------- TAB strip ----------
  function tab(o) {
    const {x = 120, y = 1388, w = 840, active = 3} = o;
    const lines = ['e','B','G','D','A','E'], gap = 27, left = x + 70, colW = (w - 110) / 7;
    let g = `<rect x="${x}" y="${y}" width="${w}" height="236" rx="26" fill="${C.panel}" stroke="${C.line}" stroke-width="3"/>`;
    g += `<text x="${x + 30}" y="${y + 44}" font-family="Archivo" font-weight="800" font-size="24" letter-spacing="3" fill="${C.mute}">TAB · KEEPER 08</text><text x="${x + w - 30}" y="${y + 44}" text-anchor="end" font-family="Archivo" font-weight="800" font-size="24" letter-spacing="2" fill="${C.mute}">A MINOR PENTATONIC · 96 BPM</text>`;
    const ty = y + 78;
    const ax = left + (active - .5) * colW;
    g += `<rect x="${ax - colW / 2 + 4}" y="${ty - 20}" width="${colW - 8}" height="${gap * 5 + 40}" rx="14" fill="${C.volt}" opacity=".12"/><rect x="${ax - colW / 2 + 4}" y="${ty - 20}" width="${colW - 8}" height="${gap * 5 + 40}" rx="14" fill="none" stroke="${C.volt}" stroke-width="3"/>`;
    lines.forEach((l, k) => {
      g += `<text x="${x + 34}" y="${ty + k * gap + 8}" font-family="Archivo" font-weight="800" font-size="22" fill="${C.mute}">${l}</text>`;
      g += `<line x1="${left}" y1="${ty + k * gap}" x2="${x + w - 30}" y2="${ty + k * gap}" stroke="${C.line}" stroke-width="2.5"/>`;
    });
    LICK.forEach((n, k) => {
      const cx = left + (k + .5) * colW, cy = ty + (n.s - 1) * gap;
      const label = n.to ? `${n.f}/${n.to}` : `${n.f}`;
      const col = n.i < active ? C.text : n.i === active ? C.volt : C.mute;
      const wbg = label.length > 2 ? 64 : 36;
      g += `<rect x="${cx - wbg / 2}" y="${cy - 16}" width="${wbg}" height="32" fill="${n.i === active ? '#2a2614' : C.panel}"/>`;
      g += `<text x="${cx}" y="${cy + 10}" text-anchor="middle" font-family="Archivo" font-weight="800" font-size="30" fill="${col}">${label}</text>`;
    });
    return `<svg width="1080" height="1920" style="position:absolute;left:0;top:0">${g}</svg>`;
  }

  // ---------- waveform from the lick's real note onsets (data.json t / dur) ----------
  const ONSETS = [[0, .3125], [.3125, .3125], [.625, .625], [1.25, .3125], [1.5625, .3125], [1.875, .3125], [2.1875, 1.5625]];
  function waveBars(n = 54, len = 3.8) {
    const out = [];
    for (let k = 0; k < n; k++) {
      const t = k / n * len; let a = .06;
      for (const [o, d] of ONSETS) if (t >= o) a = Math.max(a, Math.exp(-(t - o) * (d > 1 ? .55 : 3.2)) * (d > 1 ? .95 : .85));
      a *= .78 + .22 * Math.abs(Math.sin(k * 2.399)); out.push(Math.max(.08, Math.min(1, a)));
    }
    return out;
  }

  // ---------- outro / brand end card ----------
  function outro(o = {}) {
    const {play = 1, press = 0} = o;
    const bars = waveBars().map((a, k, arr) => {
      const on = k / arr.length < play;
      return `<i style="height:${(a * 100).toFixed(1)}%;background:${on ? C.cyan : '#3a3352'}"></i>`;
    }).join('');
    const pr = press * 6;
    return `
    <div style="position:absolute;left:0;right:0;top:250px;display:flex;flex-direction:column;align-items:center">
      <div style="transform:rotate(-8deg)">${logoSVG(170)}</div>
      <div style="margin-top:26px">${wordmark(104)}</div>
    </div>
    <div style="position:absolute;left:90px;right:90px;top:640px;text-align:center">
      <div style="font:800 76px/1.02 var(--body);letter-spacing:-.015em">Record yourself<br>playing it.</div>
      <div style="font:800 42px/1.2 var(--body);color:var(--volt);margin-top:20px">LickPick picks your best lick.</div>
    </div>
    <div class="panel" style="position:absolute;left:110px;right:110px;top:920px;height:230px;border-color:var(--keepline);padding:28px 32px">
      <div style="display:flex;align-items:center;gap:20px">
        <div style="position:relative;width:62px;height:62px;transform:rotate(-8deg)"><svg width="62" height="62" viewBox="0 0 100 100" style="overflow:visible"><path d="${PK}" fill="${C.volt}" stroke="${C.ink}" stroke-width="5"/><path d="M27 50l15 15 32-34" fill="none" stroke="${C.ink}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div><div style="font:800 34px/1.1 var(--body)">Lick A · slide · 3.8 s</div><div style="font:700 26px/1.3 var(--body);color:var(--dim)"><b style="color:var(--volt)">Best</b> · your Lick A, plus two runners-up</div></div>
      </div>
      <div class="wave" style="display:flex;align-items:center;gap:5px;height:86px;margin-top:16px">${bars}</div>
    </div>
    <div style="position:absolute;left:0;right:0;top:1222px;display:flex;justify-content:center">
      <div class="btn" style="transform:translate(${pr}px,${pr}px) rotate(-2deg);box-shadow:${12 - pr}px ${12 - pr}px 0 var(--hot)">Comment <span style="background:var(--ink);color:var(--volt);padding:6px 16px 10px;border-radius:14px">LICK</span></div>
    </div>
    <div style="position:absolute;left:0;right:0;top:1445px;text-align:center">
      <div style="font:800 34px/1.3 var(--body)">Founding testers get Pro free, for life.</div>
      <div style="display:flex;justify-content:center;gap:16px;margin-top:22px">
        <span class="chip ghost" style="font-size:24px;padding:10px 16px"><span style="width:12px;height:12px;border-radius:50%;background:var(--cyan);margin-right:12px"></span>Closed beta</span>
        <span class="chip ghost" style="font-size:24px;padding:10px 16px">Android + Chrome</span>
      </div>
    </div>
    <div style="position:absolute;left:0;right:0;top:1650px;display:flex;justify-content:center;opacity:.6"><img src="3shamrocks.png" style="height:28px"></div>`;
  }

  return {PK, TRI, C, tfPath, logoSVG, wordmark, grain, fretboard, tab, outro, LICK, noteName, waveBars};
})();
