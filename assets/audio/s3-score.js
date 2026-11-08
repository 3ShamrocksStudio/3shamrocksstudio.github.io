/* 3Shamrocks Studio adaptive score player (homepage stems + product-page loops), with one header toggle.
   Rules: sound is OFF by default; the choice is remembered across studio pages (localStorage, try/catch);
   no AudioContext and no audio download until the sound is on AND the user has made a gesture on this page load;
   music fades in and out; stems crossfade with equal power when the section in view changes (debounced);
   everything is suspended while the tab is hidden; motion-linked SFX stay silent under prefers-reduced-motion.
   Only the current section's / page's audio is fetched, then the next likely one. */
(function (W) {
  'use strict';
  var D = W.document, KEY = 's3_studio_sound';
  var RM = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lsGet() { try { return W.localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function lsSet(v) { try { W.localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) { /* not remembered */ } }
  var EXT = (function () { try { var a = D.createElement('audio'); return a.canPlayType && a.canPlayType('audio/ogg; codecs="opus"') ? 'ogg' : 'm4a'; } catch (e) { return 'm4a'; } })();

  function start(o) {
    var btn = D.getElementById(o.toggle || 'snd');
    var on = lsGet(), gestured = false, ctx = null, master = null, mBus = null, sBus = null;
    var LS = 0.5, L = o.loop, XF = o.xfade || 2.0, MG = o.musicGain || 0.4, SG = o.sfxGain || 0.6;
    var stems = o.stems, names = Object.keys(stems), sections = o.sections || [{ id: 'page', mix: { theme: 1 } }];
    var bufs = {}, loading = {}, srcs = {}, gains = {}, fade = {}, t0 = -1, playing = false, cur = 0, pend = -1, deb = 0;
    var sprite = null, spriteP = null, lastAt = {}, voices = 0, xfN = 0;
    W.__s3score = { active: function () { return sections[cur] && sections[cur].id; }, stems: function () { var r = {}; names.forEach(function (n) { r[n] = gains[n] ? +level(n).toFixed(3) : 0; }); return r; }, ctx: function () { return ctx ? ctx.state : 'none'; }, switches: function () { return xfN; }, loaded: function () { return Object.keys(bufs); } };

    function ensure() {
      if (!gestured || !on) return null;
      try {
        if (!ctx) {
          var AC = W.AudioContext || W.webkitAudioContext; if (!AC) return null;
          ctx = new AC(); master = ctx.createGain(); master.connect(ctx.destination);
          mBus = ctx.createGain(); mBus.gain.value = 0; mBus.connect(master);
          sBus = ctx.createGain(); sBus.gain.value = SG; sBus.connect(master);
          var b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0);
        }
        if (ctx.state === 'suspended' && !D.hidden) ctx.resume();
      } catch (e) { return null; }
      return ctx;
    }
    function fetchBuf(url) {
      function get(ext) { return fetch(url + '.' + ext).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(function (ab) { return new Promise(function (ok, no) { ctx.decodeAudioData(ab, ok, no); }); }); }
      return get(EXT).catch(function (e) { if (EXT === 'ogg') { EXT = 'm4a'; return get('m4a'); } throw e; });
    }
    /* ---- stems ---- */
    function target(n, i) { var m = sections[i].mix; return (m[n] || 0) * (sections[i].makeup || 1); }
    function need(i) { return names.filter(function (n) { return target(n, i) > 0; }); }
    function load(n) {
      if (bufs[n] || loading[n] || !ctx) return loading[n];
      loading[n] = fetchBuf(o.base + stems[n]).then(function (b) { bufs[n] = b; if (playing) play(n); return b; }).catch(function () { loading[n] = null; });
      return loading[n];
    }
    function preload() { /* current section first, then the next one down the page */
      var now = need(cur); now.forEach(load);
      Promise.all(now.map(function (n) { return loading[n]; })).then(function () { if (sections[cur + 1]) need(cur + 1).forEach(load); });
    }
    function gainNode(n) {
      if (!gains[n]) { gains[n] = ctx.createGain(); gains[n].gain.value = target(n, cur); gains[n].connect(mBus); fade[n] = { a: target(n, cur), b: target(n, cur), t: 0, d: 0 }; }
      return gains[n];
    }
    function level(n) { var f = fade[n]; if (!f || !ctx) return 0; var x = f.d ? Math.min(1, Math.max(0, (ctx.currentTime - f.t) / f.d)) : 1; return curve(f.a, f.b, x); }
    function curve(a, b, x) { /* equal power */
      if (a === 0) return b * Math.sin(x * Math.PI / 2);
      if (b === 0) return a * Math.cos(x * Math.PI / 2);
      return Math.sqrt(a * a * (1 - x) + b * b * x);
    }
    function play(n) {
      if (srcs[n] || !bufs[n] || !ctx) return;
      var g = gainNode(n), s = ctx.createBufferSource(), when = ctx.currentTime + 0.06;
      s.buffer = bufs[n]; s.loop = true; s.loopStart = LS; s.loopEnd = LS + L; s.connect(g);
      if (t0 < 0) t0 = when;
      var off = (((when - t0) % L) + L) % L;
      s.start(when, LS + off); srcs[n] = s;
    }
    function startMusic() {
      if (!ensure() || playing) return;
      playing = true; t0 = -1; names.forEach(function (n) { if (bufs[n]) play(n); });
      var t = ctx.currentTime; mBus.gain.cancelScheduledValues(0); mBus.gain.setValueAtTime(mBus.gain.value, t); mBus.gain.linearRampToValueAtTime(MG, t + 1.8);
      preload(); if (o.sfx) loadSprite();
    }
    function stopMusic() {
      if (!ctx || !playing) return;
      playing = false; var t = ctx.currentTime, old = srcs; srcs = {};
      mBus.gain.cancelScheduledValues(0); mBus.gain.setValueAtTime(mBus.gain.value, t); mBus.gain.linearRampToValueAtTime(0, t + 0.6);
      Object.keys(old).forEach(function (n) { try { old[n].stop(t + 0.65); } catch (e) { /* stopped */ } });
      setTimeout(function () { if (!playing && ctx && ctx.state === 'running') ctx.suspend(); }, 800);
    }
    function crossfade(i) {
      if (i === cur) return; cur = i; xfN++;
      if (!ctx) return;
      preload();
      var t = ctx.currentTime + 0.02;
      names.forEach(function (n) {
        if (!gains[n]) { if (target(n, i) > 0) gainNode(n); else return; }
        var a = level(n), b = target(n, i), g = gains[n].gain;
        if (Math.abs(a - b) < 1e-4) return;
        var N = 48, c = new Float32Array(N);
        for (var k = 0; k < N; k++) c[k] = curve(a, b, k / (N - 1));
        g.cancelScheduledValues(0); g.setValueAtTime(a, t - 0.01);
        try { g.setValueCurveAtTime(c, t, XF); } catch (e) { g.linearRampToValueAtTime(b, t + XF); }
        fade[n] = { a: a, b: b, t: t, d: XF };
      });
    }
    /* section in view: the one crossing the middle of the viewport, debounced so fast scrolling never thrashes */
    if (o.sections && W.IntersectionObserver) {
      var els = sections.map(function (s) { return D.querySelector(s.sel); });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var i = els.indexOf(e.target); if (i >= 0) pend = i; } });
        clearTimeout(deb); deb = setTimeout(function () { if (pend >= 0) crossfade(pend); }, o.debounce || 800);
      }, { rootMargin: '-50% 0px -50% 0px' });
      els.forEach(function (el) { if (el) io.observe(el); });
      /* while the page is still moving, keep waiting: the switch happens once scrolling settles (timer reset only) */
      W.addEventListener('scroll', function () { if (pend < 0) return; clearTimeout(deb); deb = setTimeout(function () { crossfade(pend); }, o.debounce || 800); }, { passive: true });
      /* starting section without waiting for a scroll */
      var mid = W.innerHeight / 2;
      els.forEach(function (el, i) { if (!el) return; var r = el.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) cur = i; });
    }
    /* ---- SFX ---- */
    function loadSprite() {
      if (spriteP || !ctx) return spriteP;
      spriteP = fetchBuf(o.sfx.url).then(function (b) {
        var d = b.getChannelData(0), lim = Math.min(d.length, Math.floor(((o.sfx.lead || 0.1) + 0.2) * b.sampleRate)), i = 0;
        while (i < lim && Math.abs(d[i]) < 0.002) i++;
        var dt = i / b.sampleRate - (o.sfx.lead || 0.1); sprite = { b: b, shift: Math.abs(dt) < 0.1 ? dt : 0 }; return b;
      }).catch(function () { spriteP = null; });
      return spriteP;
    }
    function sfx(n) {
      var cues = o.sfx && o.sfx.cues; if (!on || !cues || !cues[n] || !ensure()) return;
      if (RM && o.sfx.motion && o.sfx.motion[n]) return;
      var now = performance.now(); if (lastAt[n] && now - lastAt[n] < 150) return;
      if (!sprite) { loadSprite(); return; }
      if (voices >= 2) return; lastAt[n] = now;
      var c = cues[n], s = ctx.createBufferSource(); s.buffer = sprite.b; s.connect(sBus); voices++;
      s.onended = function () { voices = Math.max(0, voices - 1); };
      s.start(0, Math.max(0, c[0] + sprite.shift), c[1]);
      if (playing) { var t = ctx.currentTime, g = mBus.gain; g.cancelScheduledValues(0); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(MG * 0.5, t + 0.04); g.setValueAtTime(MG * 0.5, t + c[1]); g.linearRampToValueAtTime(MG, t + c[1] + 0.35); }
    }
    /* ---- gesture, toggle, visibility ---- */
    function gesture() { if (gestured) return; gestured = true; if (on) startMusic(); }
    ['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (ev) { W.addEventListener(ev, gesture, { capture: true, passive: true }); });
    function draw() {
      if (!btn) return;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Sound on' : 'Sound off'); btn.title = on ? 'Sound on' : 'Sound off';
    }
    if (btn) btn.addEventListener('click', function () { on = !on; lsSet(on); draw(); gestured = true; if (on) startMusic(); else stopMusic(); });
    D.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      try { if (D.hidden) ctx.suspend(); else if (on && playing) ctx.resume(); } catch (e) { /* ignore */ }
    });
    D.addEventListener('s3:sfx', function (e) { sfx(e.detail); });
    draw();
    return { play: sfx, on: function () { return on; } };
  }
  W.S3Score = { start: start };
})(window);
