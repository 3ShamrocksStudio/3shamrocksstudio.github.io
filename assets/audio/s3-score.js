/* 3Shamrocks Studio score player: game-world zones, product themes, stingers, one header toggle.
   - Score v3 (homepage, `stems` in the config): ONE song as sample-aligned stems on a single AudioContext clock. Every stem
     loops the same window and starts at an offset computed from one shared start time, so they never drift. Zones change
     the MIX (gain ramps that begin on the next bar); a product in focus swaps the melody stem with a fade that starts ~0.6 s before the next bar line
     while the bed keeps grooving. Product melody stems are fetched and decoded only once the portfolio is reached.
   - Score v2 (product pages, one file per zone): unchanged behaviour below.
   - Sound is ON by default unless the visitor turned it off before (remembered across studio pages, try/catch).
   - Browsers block audible autoplay: one AudioContext is created on load (only when sound is on) and resume() is
     attempted; if the browser says no, music starts on the first pointerdown / keydown / touchend anywhere.
     A one-time hint near the toggle says so. Sound off = no AudioContext, no downloads, nothing plays.
   - Zones follow the section crossing the middle of the viewport (debounced until scrolling settles) and change on the
     next bar with a ~2 s equal-power crossfade; the new zone enters at its phrase start.
   - In the products section, the product in focus (centred on mobile, hovered/focused on desktop) brings in its own
     theme with a ~1 s crossfade and its own short arrival sound; leaving the section returns to the zone music.
   - Only the audio in use is fetched, then the next likely one. Suspended while the tab is hidden.
   - Motion-linked sound effects stay silent under prefers-reduced-motion. */
(function (W) {
  'use strict';
  var D = W.document, KEY = 's3_studio_sound', HINT = 's3_snd_hint', LS = 0.5;
  var RM = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lsGet(k) { try { return W.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { W.localStorage.setItem(k, v); } catch (e) { /* not remembered */ } }
  function ssGet(k) { try { return W.sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { W.sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  var EXT = (function () { try { var a = D.createElement('audio'); return a.canPlayType && a.canPlayType('audio/ogg; codecs="opus"') ? 'ogg' : 'm4a'; } catch (e) { return 'm4a'; } })();

  function start(o) {
    var btn = D.getElementById(o.toggle || 'snd');
    var on = lsGet(KEY) !== '0', ctx = null, master = null, mBus = null, sBus = null, playing = false;
    var MG = o.musicGain || 0.45, SG = o.sfxGain || 0.6, XF = o.xfade || 2.0, PXF = o.pxfade || 1.0, MLEAD = o.mlead === undefined ? 0.6 : o.mlead;
    var zones = o.zones, zi = 0, prod = null, desired = null, tracks = {}, bufs = {}, loading = {}, cur = null, switches = 0;
    var sprites = [], cueMap = {}, lastAt = {}, voices = 0, hintEl = null;
    var products = o.products || null;
    var ST = o.stems || null, stems = {}, t0 = null, melCur = null, starting = false, focused = null;
    W.__s3score = { active: function () { return cur; }, zone: function () { return zones[zi] && zones[zi].id; }, ctx: function () { return ctx ? ctx.state : 'none'; },
                    loaded: function () { return Object.keys(bufs); }, switches: function () { return switches; }, playing: function () { return playing; }, on: function () { return on; } };
    if (ST) {
      W.__s3score.melody = function () { return melCur; };
      W.__s3score.t0 = function () { return t0; };
      W.__s3score.time = function () { return ctx ? ctx.currentTime : 0; };
      W.__s3score.stems = function () {
        var r = {}; Object.keys(stems).forEach(function (k) { var x = stems[k]; r[k] = { playing: !!x.s, gain: x.g ? Math.round(x.g.gain.value * 1000) / 1000 : 0, target: x.tg }; }); return r;
      };
    }

    function meta(name) { if (products && products.map[name]) return products.map[name]; for (var i = 0; i < zones.length; i++) if (zones[i].id === name) return zones[i]; return null; }
    function ensure() {
      if (!on) return null;
      try {
        if (!ctx) {
          var AC = W.AudioContext || W.webkitAudioContext; if (!AC) return null;
          ctx = new AC(); master = ctx.createGain(); master.connect(ctx.destination);
          mBus = ctx.createGain(); mBus.gain.value = 0; mBus.connect(master);
          sBus = ctx.createGain(); sBus.gain.value = SG; sBus.connect(master);
          ctx.onstatechange = function () { if (ctx.state === 'running' && on && !playing && !D.hidden) begin(); };
        }
      } catch (e) { return null; }
      return ctx;
    }
    function resume() {
      if (!ensure() || D.hidden) return;
      try {
        if (ctx.state !== 'running') { var p = ctx.resume(); if (p && p.then) p.then(function () { if (ctx.state === 'running') begin(); }, function () {}); }
        else begin();
      } catch (e) { /* ignore */ }
    }
    function fetchBuf(url) {
      function get(ext) { return fetch(url + '.' + ext + (o.ver ? '?v=' + o.ver : '')).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(function (ab) { return new Promise(function (ok, no) { ctx.decodeAudioData(ab, ok, no); }); }); }
      return get(EXT).catch(function (e) { if (EXT === 'ogg') { EXT = 'm4a'; return get('m4a'); } throw e; });
    }
    function load(name) {
      if (o.music === false) return null; /* music paused: no downloads */
      var m = meta(name); if (!m || !ensure()) return null;
      if (bufs[name]) return Promise.resolve(bufs[name]);
      if (!loading[name]) loading[name] = fetchBuf(o.base + m.file).then(function (b) { bufs[name] = b; return b; }).catch(function () { loading[name] = null; });
      return loading[name];
    }
    /* ---------- music ---------- */
    function target() { return (prod && products && zones[zi] && zones[zi].id === products.zone) ? prod : zones[zi].id; }
    function begin() {
      if (playing || !on || !ctx || ctx.state !== 'running') return;
      playing = true; lsSet(HINT, '1'); hint(false);
      var t = ctx.currentTime; mBus.gain.cancelScheduledValues(0); mBus.gain.setValueAtTime(0, t); mBus.gain.linearRampToValueAtTime(MG, t + 1.5);
      loadSprites(); go(true);
    }
    function go(first) {
      if (!playing) return;
      if (ST) return goStems(first);
      var name = target(); desired = name;
      if (cur === name && tracks[name]) return;
      var p = load(name); if (!p) return;
      p.then(function (b) {
        if (!b || desired !== name || !playing) return;
        if (cur === name && tracks[name]) return;
        var m = meta(name), now = ctx.currentTime, isProd = products && products.map[name], xf = first ? 0.05 : (isProd || (cur && products && products.map[cur]) ? PXF : XF);
        var tb = now + 0.06;
        var c = cur && tracks[cur];
        if (c && !first) { /* align the change to the next bar (next beat for product focus) of what is playing */
          var grid = isProd || (products && products.map[cur]) ? c.bar / 4 : c.bar;
          var k = Math.ceil((now + 0.06 - c.t0) / grid); tb = c.t0 + k * grid;
          if (tb - now > grid + 0.1) tb = now + 0.06;
        }
        Object.keys(tracks).forEach(function (n) { fadeOut(n, tb, xf); });
        var g = ctx.createGain(), s = ctx.createBufferSource();
        s.buffer = b; s.loop = true; s.loopStart = LS; s.loopEnd = LS + m.loop; s.connect(g); g.connect(mBus);
        var N = 32, curve = new Float32Array(N); for (var i = 0; i < N; i++) curve[i] = Math.sin(i / (N - 1) * Math.PI / 2);
        g.gain.setValueAtTime(0, 0); try { g.gain.setValueCurveAtTime(curve, tb, xf); } catch (e) { g.gain.linearRampToValueAtTime(1, tb + xf); }
        s.start(tb, LS); tracks[name] = { s: s, g: g, t0: tb, bar: m.bar }; cur = name; switches++;
        prefetch();
      });
    }
    function fadeOut(n, tb, xf) {
      var tr = tracks[n]; if (!tr || tr.dying) return; tr.dying = true; delete tracks[n];
      var g = tr.g.gain, v = g.value, N = 32, c = new Float32Array(N);
      for (var i = 0; i < N; i++) c[i] = v * Math.cos(i / (N - 1) * Math.PI / 2);
      try { g.cancelScheduledValues(0); g.setValueAtTime(v, Math.max(ctx.currentTime, tb - 0.01)); g.setValueCurveAtTime(c, tb, xf); } catch (e) { g.linearRampToValueAtTime(0, tb + xf); }
      try { tr.s.stop(tb + xf + 0.05); } catch (e) { /* stopped */ }
    }
    function prefetch() { /* the next likely one: the zone below, then the one above */
      [zi + 1, zi - 1].forEach(function (i) { if (zones[i] && zones[i].sel) load(zones[i].id); });
      if (products && zones[zi] && zones[zi].id === products.zone) { /* in the products section the product themes are next: one at a time */
        Object.keys(products.map).reduce(function (p, k) { return p.then(function () { return load(k); }); }, Promise.resolve());
      }
    }
    /* ---------- v3: one song as sample-aligned stems ---------- */
    function fileOf(k) { if (k.indexOf('mel:') !== 0) return k; var p = k.slice(4); return p === 'theme' ? ST.melody : products.map[p].file; }
    function loadStem(k) { /* o.music === false: music paused (no stem downloads), sound effects still play */
      if (o.music === false || !ensure()) return Promise.resolve(null);
      if (bufs[k]) return Promise.resolve(bufs[k]);
      if (!loading[k]) loading[k] = fetchBuf(o.base + fileOf(k)).then(function (b) { bufs[k] = b; return b; }).catch(function () { loading[k] = null; return null; });
      return loading[k];
    }
    function stemOf(k) {
      var x = stems[k];
      if (!x) { x = stems[k] = { g: ctx.createGain(), s: null, tg: 0 }; x.g.gain.value = 0; x.g.connect(mBus); }
      return x;
    }
    function nextBar(now) { var k = Math.ceil((now + 0.05 - t0) / ST.bar); return t0 + k * ST.bar; }
    function melAt(now) { return nextBar(now + MLEAD) - MLEAD; } /* a melody swap starts its fade MLEAD s before the bar line */
    function startStem(k, when) { /* offset into the loop = where the shared clock is at `when` */
      var x = stemOf(k); if (x.s || !bufs[k]) return;
      var s = ctx.createBufferSource(); s.buffer = bufs[k]; s.loop = true; s.loopStart = ST.pad; s.loopEnd = ST.pad + ST.loop;
      var off = ST.pad + (((when - t0) % ST.loop) + ST.loop) % ST.loop;
      s.connect(x.g); s.start(when, off); x.s = s;
    }
    function ramp(x, tb, xf, v) {
      var g = x.g.gain, now = ctx.currentTime, v0 = g.value;
      try { g.cancelScheduledValues(now); g.setValueAtTime(v0, now); if (tb > now) g.setValueAtTime(v0, tb); g.linearRampToValueAtTime(v, Math.max(tb, now) + xf); }
      catch (e) { g.value = v; }
    }
    function wantStems() {
      var z = zones[zi], mix = z.mix || {}, inP = products && z.id === products.zone;
      var mk = 'mel:' + (inP && prod ? prod : 'theme'), want = {};
      ST.beds.forEach(function (b) { want[b] = mix[b] || 0; });
      Object.keys(stems).forEach(function (k) { if (k.indexOf('mel:') === 0) want[k] = 0; });
      want[mk] = mix.mel || 0;
      return { want: want, mel: mk, name: inP && prod ? prod : z.id };
    }
    function goStems(first) {
      var w = wantStems(), keys = Object.keys(w.want), melSwap = melCur !== null && w.mel !== melCur;
      if (melSwap && t0 !== null && !bufs[w.mel] && bufs[melCur]) { /* keep the current melody until the new one is decoded */
        var lv = w.want[w.mel]; w.want[w.mel] = 0; w.want[melCur] = lv;
        loadStem(w.mel).then(function (b) { if (b && playing) go(); });
        w.mel = melCur; melSwap = false;
      }
      cur = w.name; desired = w.name; melCur = w.mel; switches++;
      if (t0 === null) { /* first start: the core stems start together on one clock, the rest join on the following bars */
        if (starting) return; starting = true;
        var need = (ST.core || ['keys', 'bass', 'drums']).filter(function (k) { return w.want[k] > 0; });
        if (!need.length) need = keys.filter(function (k) { return w.want[k] > 0; });
        Promise.all(need.map(loadStem)).then(function () {
          starting = false; if (!playing) return;
          var ww = wantStems(); t0 = ctx.currentTime + 0.08;
          Object.keys(ww.want).forEach(function (k) { var x = stemOf(k); x.tg = ww.want[k]; if (x.tg > 0 && bufs[k]) { startStem(k, t0); ramp(x, t0, 0.05, x.tg); } });
          cur = ww.name; melCur = ww.mel; prefetchStems();
          goStems(false); /* anything that changed (or failed) while loading */
        });
        return;
      }
      keys.forEach(function (k) {
        var x = stemOf(k), v = w.want[k], isMel = k.indexOf('mel:') === 0, swap = isMel && melSwap, xf = swap ? PXF : XF;
        if (x.tg === v && (x.s || v === 0)) return;
        x.tg = v;
        if (x.s) { ramp(x, swap ? melAt(ctx.currentTime) : nextBar(ctx.currentTime), xf, v); return; }
        if (v > 0) loadStem(k).then(function (b) { /* not running yet: join on the next bar (a melody: just before it), aligned to the shared clock */
          if (!b || !playing || t0 === null || x.s || x.tg <= 0) return;
          var tb = isMel ? melAt(ctx.currentTime) : nextBar(ctx.currentTime); startStem(k, tb); ramp(x, tb, isMel ? PXF : Math.min(XF, 1.0), x.tg);
        });
      });
      prefetchStems();
    }
    function prefetchStems() { /* then the rest of the bed, then (in the portfolio) the product melodies, one at a time */
      var q = ST.beds.slice();
      if (products && zones[zi] && zones[zi].id === products.zone) Object.keys(products.map).forEach(function (k) { q.push('mel:' + k); });
      q.reduce(function (p, k) { return p.then(function () { return playing ? loadStem(k) : null; }); }, Promise.resolve());
    }
    function stopAll() {
      if (!ctx) return; playing = false; var t = ctx.currentTime;
      Object.keys(stems).forEach(function (k) {
        var x = stems[k]; if (x.s) { try { x.s.stop(t + 0.65); } catch (e) { /* ignore */ } x.s = null; }
        x.tg = 0; try { x.g.gain.cancelScheduledValues(0); x.g.gain.setValueAtTime(x.g.gain.value, t); x.g.gain.setValueAtTime(0, t + 0.66); } catch (e) { /* ignore */ }
      });
      t0 = null; melCur = null; starting = false;
      mBus.gain.cancelScheduledValues(0); mBus.gain.setValueAtTime(mBus.gain.value, t); mBus.gain.linearRampToValueAtTime(0, t + 0.6);
      Object.keys(tracks).forEach(function (n) { try { tracks[n].s.stop(t + 0.65); } catch (e) { /* ignore */ } delete tracks[n]; });
      cur = null; setTimeout(function () { if (!playing && ctx && ctx.state === 'running') ctx.suspend(); }, 800);
    }
    /* ---------- zones in view ---------- */
    if (zones.length > 1 && W.IntersectionObserver) {
      var els = zones.map(function (z) { return z.sel ? D.querySelector(z.sel) : null; }), hit = {}, deb = 0;
      function pick() { var best = -1; els.forEach(function (el, i) { if (hit[i]) best = i; }); return best; }
      function settle() { clearTimeout(deb); deb = setTimeout(function () { var i = pick(); if (i >= 0 && i !== zi) { zi = i; if (!(products && zones[i].id === products.zone)) prod = null; else if (!prod && focused) prod = focused(); arrive(); go(); } }, o.debounce || 600); }
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var i = els.indexOf(e.target); if (i >= 0) hit[i] = e.isIntersecting; }); settle(); }, { rootMargin: '-50% 0px -50% 0px' });
      els.forEach(function (el) { if (el) io.observe(el); });
      W.addEventListener('scroll', function () { if (deb) settle(); }, { passive: true });
      var mid = W.innerHeight / 2;
      els.forEach(function (el, i) { if (!el) return; var r = el.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) zi = i; });
    }
    function arrive() { /* "level complete" once per visit when the CTA is reached */
      var z = zones[zi]; if (o.complete && z && z.id === o.complete && !ssGet('s3_lvl')) { ssSet('s3_lvl', '1'); sfx('levelup'); }
    }
    /* ---------- products: focus brings in the product's theme and arrival sound ---------- */
    if (products) {
      var devs = [].slice.call(D.querySelectorAll(products.sel)), pdeb = 0;
      function keyOf(d) { var h = d.getAttribute('href') || d.dataset.href || ''; for (var k in products.map) if (h.indexOf(products.map[k].match) >= 0) return k; return null; }
      focused = function () { /* a card already in focus when the section is reached (mobile carousel) */ for (var i = 0; i < devs.length; i++) if (devs[i].classList.contains('on')) return keyOf(devs[i]); return null; };
      var mo = new MutationObserver(function (ms) {
        ms.forEach(function (m) {
          var d = m.target, k = keyOf(d), isOn = d.classList.contains('on'), was = (m.oldValue || '').split(/\s+/).indexOf('on') >= 0;
          if (!k || isOn === was) return;
          if (isOn) { if (!(RM)) sfx('p_' + k); clearTimeout(pdeb); pdeb = setTimeout(function () { if (zones[zi] && zones[zi].id === products.zone) { prod = k; go(); } }, 200); }
          else { clearTimeout(pdeb); pdeb = setTimeout(function () { if (!devs.some(function (x) { return x.classList.contains('on'); }) && !W.matchMedia('(max-width:700px)').matches) { prod = null; go(); } }, 700); }
        });
      });
      devs.forEach(function (d) { mo.observe(d, { attributes: true, attributeFilter: ['class'], attributeOldValue: true }); });
    }
    /* ---------- sound effects ---------- */
    (o.sfx || []).forEach(function (sp, i) { Object.keys(sp.cues).forEach(function (c) { cueMap[c] = i; }); });
    function loadSprites() {
      (o.sfx || []).forEach(function (sp, i) {
        if (sprites[i] || !ctx) return;
        sprites[i] = { p: fetchBuf(sp.url).then(function (b) { sprites[i].b = b; return b; }).catch(function () { sprites[i] = null; }) };
      });
    }
    function sfx(n) {
      var i = cueMap[n]; if (i === undefined || !on || !playing || !ctx) return;
      var sp = o.sfx[i]; if (RM && sp.motion && sp.motion[n]) return;
      var now = performance.now(); if (lastAt[n] && now - lastAt[n] < 300) return;
      if (!sprites[i] || !sprites[i].b || voices >= 2) return;
      lastAt[n] = now; var c = sp.cues[n], s = ctx.createBufferSource(); s.buffer = sprites[i].b; s.connect(sBus); voices++;
      s.onended = function () { voices = Math.max(0, voices - 1); };
      s.start(0, c[0], c[1]);
      var t = ctx.currentTime, g = mBus.gain; g.cancelScheduledValues(0); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(MG * 0.6, t + 0.04);
      g.setValueAtTime(MG * 0.6, t + c[1]); g.linearRampToValueAtTime(MG, t + c[1] + 0.4);
    }
    D.addEventListener('s3:sfx', function (e) { sfx(e.detail); });
    if (o.stingers && W.MutationObserver) { /* achievement toast and Mini-Dave panel (js/guide.js) */
      var seen = new WeakSet();
      new MutationObserver(function (ms) {
        ms.forEach(function (m) {
          var el = m.target; if (!el.classList) return;
          o.stingers.forEach(function (st) {
            if (el.matches && el.matches(st.sel)) { var inNow = el.classList.contains('in'); if (inNow && !seen.has(el)) { seen.add(el); sfx(st.cue); } else if (!inNow) seen.delete(el); }
          });
        });
      }).observe(D.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    /* ---------- toggle, hint, gestures, visibility ---------- */
    function draw() { if (!btn) return; btn.setAttribute('aria-pressed', on ? 'true' : 'false'); btn.setAttribute('aria-label', on ? 'Sound on' : 'Sound off'); btn.title = on ? 'Sound on' : 'Sound off'; }
    function hint(show) {
      if (!btn) return;
      if (show) {
        if (hintEl || lsGet(HINT)) return;
        hintEl = D.createElement('span'); hintEl.className = 'snd-hint'; hintEl.setAttribute('aria-hidden', 'true'); hintEl.textContent = 'Tap anywhere for sound ♪';
        btn.appendChild(hintEl); setTimeout(function () { if (hintEl) hintEl.classList.add('in'); }, 900);
      } else if (hintEl) { var h = hintEl; hintEl = null; h.classList.remove('in'); setTimeout(function () { if (h.parentNode) h.parentNode.removeChild(h); }, 500); }
    }
    if (btn) btn.addEventListener('click', function () {
      on = !on; lsSet(KEY, on ? '1' : '0'); draw();
      if (on) resume(); else { hint(false); stopAll(); }
    });
    function gesture() { if (on && !playing) resume(); }
    ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { W.addEventListener(ev, gesture, { capture: true, passive: true }); });
    D.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      try { if (D.hidden) ctx.suspend(); else if (on && playing) ctx.resume(); } catch (e) { /* ignore */ }
    });
    draw();
    if (on) { /* try now: some browsers allow it; otherwise the first tap starts it */
      ensure(); if (ctx) { if (ST) { var w0 = wantStems(); Object.keys(w0.want).forEach(function (k) { if (w0.want[k] > 0) loadStem(k); }); } else load(zones[zi].id); resume(); setTimeout(function () { if (!playing && on) hint(true); }, 400); }
    }
    return { play: sfx, on: function () { return on; } };
  }
  W.S3Score = { start: start };
})(window);
