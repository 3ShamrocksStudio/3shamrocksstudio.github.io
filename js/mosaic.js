/* 3Shamrocks Studio: "Made of the work" portrait for the "20 years" section.
   Dave's real photo rebuilt as a living photomosaic of his real work: every tile is a crop of a real portfolio
   asset (assets/studio/mosaic/atlas.webp, built offline by assets/studio/mosaic/build.py), matched and tinted to
   the colour of that region of the photo. The photo itself is never redrawn: tiles sample its real pixels.
   Motion: tiles fly in and settle on scroll-in, then occasional tiles flip to another asset.
   Interaction: a magnifier lens enlarges the tiles under the cursor or finger; click or tap names the tile and
   links to its product page; "Explode" (or double-tap) sorts every tile into a grid by product, then back.
   Nothing loads or touches WebGL until the section is near the viewport. Without JS or WebGL: the plain photo. */
(function () {
  'use strict';
  var vis = document.getElementById('about-visual');
  if (!vis || !window.IntersectionObserver) return;
  var img = vis.querySelector('img');
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOVER = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var BASE = 'assets/studio/mosaic/';
  var ORDER = ['sh', 'lp', 'cr', 'th', 'j8', 'mi', 'rk', 'ez', 'fr', 'ap', 'vb', 'st'];
  var NF = 24; /* floats per tile */

  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return;
    io.disconnect(); init();
  }, { rootMargin: '400px 0px' });
  io.observe(vis);

  function loadImg(src) {
    return new Promise(function (res, rej) { var i = new Image(); i.decoding = 'async'; i.onload = function () { res(i); }; i.onerror = rej; i.src = src; });
  }

  function init() {
    var cv = document.createElement('canvas');
    cv.className = 'mz-cv'; cv.setAttribute('aria-hidden', 'true');
    var gl = null;
    try { gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false }); } catch (e) {}
    var inst = gl && gl.getExtension('ANGLE_instanced_arrays');
    if (!gl || !inst) return;
    Promise.all([fetch(BASE + 'layout.json?v=s23').then(function (r) { if (!r.ok) throw 0; return r.json(); }),
                 loadImg(BASE + 'atlas.webp?v=s23'), img.complete && img.naturalWidth ? img : loadImg(img.currentSrc || img.src),
                 Promise.resolve(null)])  /* no second atlas: every tile is current (rebuilt 8 Nov 2026) */
      .then(function (r) { build(cv, gl, inst, r[0], r[1], r[2], r[3]); })
      .catch(function () { /* keep the plain photo */ });
  }

  function build(cv, gl, X, L, atlasImg, photoImg, atlas2Img) {
    var MOBILE = vis.clientWidth < 520 || matchMedia('(pointer:coarse)').matches;
    var src = MOBILE ? L.mobile : L.desktop, N = src.length, ASP = L.aspect;
    var TL = L.tiles, SL = L.slot / L.atlas, PD = L.pad / L.atlas, G = L.grid;
    /* swaps: retired pieces show their current replacement (atlas2) in the magnifier, the tag and the exploded grid only;
       the portrait at rest keeps sampling atlas.webp, so its pixels never change */
    var R = atlas2Img && L.r ? L.r : {}, T2 = L.tiles2 || [], SL2 = L.slot / (L.atlas2 || 1), PD2 = L.pad / (L.atlas2 || 1), G2 = L.grid2 || 1;
    function rep(a) { var r = R[a]; return r == null ? -1 : r; }

    /* photo texture: the real cut-out photo over the section's own backdrop gradient (as the static version shows it) */
    var pc = document.createElement('canvas'); pc.width = photoImg.naturalWidth; pc.height = photoImg.naturalHeight;
    var pg = pc.getContext('2d'), gr = pg.createLinearGradient(0, 0, 0, pc.height);
    gr.addColorStop(0, '#2a1a52'); gr.addColorStop(1, '#160d33'); pg.fillStyle = gr; pg.fillRect(0, 0, pc.width, pc.height);
    pg.drawImage(photoImg, 0, 0);

    var VS = [
      'precision highp float;',
      'attribute vec2 c;attribute vec3 tg,fr,gd;attribute float dl;attribute vec2 uv;attribute vec3 mn,cc;attribute float al,fl,id;attribute vec3 u2;',
      'uniform vec2 res;uniform float W,t,ex,sel,asp,sc,mag,pass,sy;uniform vec4 lens;',
      'varying vec2 vUv,vPh,vC,vP,vUv2;varying vec3 vMn,vCc;varying float vAl,vPx,vRaw,vOp,vSel,vSw;',
      'void main(){',
      ' float p=clamp((t-dl)/1.15,0.,1.);float e=1.-pow(1.-p,4.);',
      ' vec2 ct=(tg.xy+tg.z*.5)*W;float s=tg.z*W;',
      ' vec2 cf=ct+fr.xy*W;float rot=fr.z*(1.-e);',
      ' vec2 cen=mix(cf,ct,e);s*=mix(.25,1.,e);',
      ' float k=clamp(ex*1.7-fract(fr.z*7.13)*.7,0.,1.);k=k*k*(3.-2.*k);',
      ' cen=mix(cen,(gd.xy+gd.z*.5)*W-vec2(0.,sy),k);s=mix(s,gd.z*W,k);',
      ' float raw=k;',
      ' if(pass>.5){cen=lens.xy+(cen-lens.xy)*mag;s*=mag;raw=.86;}',
      ' float f=clamp((t-fl)/.55,0.,1.);float sx=max(abs(cos(f*3.14159)),.04);',
      ' float q=pass>.5&&pass<1.5?s+1.:max(s-sc,1.);vec2 o=(c-.5)*vec2(q*sx,q);float cs=cos(rot),sn=sin(rot);o=vec2(o.x*cs-o.y*sn,o.x*sn+o.y*cs);',
      ' vec2 P=cen+o;vP=P;gl_Position=vec4(P.x/res.x*2.-1.,1.-P.y/res.y*2.,0.,1.);',
      ' vUv=uv+c*'+(SL - 2 * PD).toFixed(6)+';vPh=(tg.xy+c*tg.z)/vec2(1.,asp);vC=c;vMn=mn;vCc=cc;vAl=al;vPx=q;vRaw=raw;',
      ' vOp=smoothstep(0.,.3,p)*(1.-k*step(gd.z,0.));vSel=step(abs(id-sel),.5);',
      ' vUv2=u2.xy+c*'+(SL2 - 2 * PD2).toFixed(6)+';vSw=u2.z*max(step(.5,pass),step(.5,k));}'
    ].join('\n');
    var FS = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif',
      'uniform sampler2D at,ph,at2;uniform float K,dpr,pass,cut;uniform vec4 lens;',
      'varying vec2 vUv,vPh,vC,vP,vUv2;varying vec3 vMn,vCc;varying float vAl,vPx,vRaw,vOp,vSel,vSw;',
      'void main(){',
      ' float lo=1.;if(pass>.5){float r=length(vP-lens.xy);if(r>lens.z)discard;lo=clamp((lens.z-r)*dpr,0.,1.)*lens.w;',
      '  if(pass<1.5){gl_FragColor=vec4(.03,.02,.06,1.)*lo;return;}}',
      ' vec3 t=texture2D(at,vUv).rgb,t2=texture2D(at2,vUv2).rgb;if(vSw>.5)t=t2;vec3 P=texture2D(ph,vPh).rgb;',
      ' vec3 tint=clamp(vCc+(t-vMn)*.55,0.,1.);vec3 fig=mix(tint,P,K);',
      ' vec3 bg=t*.3+P*.25;float w=clamp((vAl-.15)/.6,0.,1.);',
      ' vec3 col=mix(mix(bg,fig,w),t,vRaw);',
      ' vec2 q=abs(vC-.5)*vPx;float rr=min(2.5,vPx*.22);float d=length(max(q-(vPx*.5-rr),0.))-rr;',
      ' float a=clamp(.5-d*dpr,0.,1.)*vOp*lo;if(pass<.5)a*=1.-vRaw*smoothstep(cut-12.,cut,vP.y);',
      ' float edge=step(vPx*.5-1.5,max(q.x,q.y))*vSel;col=mix(col,vec3(1.),edge);',
      ' gl_FragColor=vec4(col*a,a);}'
    ].join('\n');
    function sh(type, s) { var o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var pr = gl.createProgram();
    try { gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); } catch (e) { return; }
    gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    var U = {}; ['res', 'W', 't', 'ex', 'sel', 'asp', 'sc', 'mag', 'pass', 'lens', 'at', 'ph', 'at2', 'K', 'dpr', 'sy', 'cut'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });

    function tex(im, mip) {
      var tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (mip) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      return tx;
    }
    gl.activeTexture(gl.TEXTURE0); tex(atlasImg, true); gl.uniform1i(U.at, 0);
    gl.activeTexture(gl.TEXTURE1); tex(pc, false); gl.uniform1i(U.ph, 1);
    gl.activeTexture(gl.TEXTURE2); tex(atlas2Img || pc, !!atlas2Img); gl.uniform1i(U.at2, 2);

    /* per-tile data */
    var D = new Float32Array(N * NF), cur = new Int32Array(N), alt = new Int32Array(N);
    var ex0 = 0.38, ey0 = 0.3; /* cascade origin: between the eyes, in width units */
    var maxd = 0;
    src.forEach(function (s) { var d = Math.hypot(s[0] + s[2] / 2 - ex0, s[1] + s[2] / 2 - ey0); if (d > maxd) maxd = d; });
    function rnd(i, k) { var x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
    function setTile(i, a) {
      var o = i * NF, m = TL[a];
      D[o + 10] = (a % G) * SL + PD; D[o + 11] = Math.floor(a / G) * SL + PD;
      D[o + 12] = m[2]; D[o + 13] = m[3]; D[o + 14] = m[4];
      var r = rep(a); D[o + 23] = r < 0 ? 0 : 1;
      if (r >= 0) { D[o + 21] = (r % G2) * SL2 + PD2; D[o + 22] = Math.floor(r / G2) * SL2 + PD2; }
    }
    src.forEach(function (s, i) {
      var o = i * NF, ang = rnd(i, 1) * 6.283, rr = .55 + rnd(i, 2) * .9;
      D[o] = s[0]; D[o + 1] = s[1]; D[o + 2] = s[2];
      D[o + 3] = Math.cos(ang) * rr; D[o + 4] = Math.sin(ang) * rr * 1.2; D[o + 5] = (rnd(i, 3) - .5) * 5;
      var d = Math.hypot(s[0] + s[2] / 2 - ex0, s[1] + s[2] / 2 - ey0) / maxd;
      D[o + 9] = .15 + d * 1.5 + rnd(i, 4) * .35;
      D[o + 15] = s[5]; D[o + 16] = s[6]; D[o + 17] = s[7]; D[o + 18] = s[8]; D[o + 19] = -99; D[o + 20] = i;
      cur[i] = s[3]; alt[i] = s[4]; setTile(i, s[3]);
    });

    /* explode grid: per product, a labelled sample of up to 24 different pieces of its work, 8 to a row so each one
       reads; the band scrolls inside the frame, the other tiles fade out where they stand. L.g maps each atlas tile to
       its piece (all crops of one asset, and assets that show the same artwork), so no piece shows twice */
    var PER = 24, COLS = 8, GPAD = .04, LBL = .052, RES = 58; /* RES: px kept clear for the Reassemble button */
    var labels = [], gridH = 1;
    function gridLayout() {
      var groups = {}, seen = {}, PG = L.g || []; ORDER.forEach(function (k) { groups[k] = []; });
      for (var i = 0; i < N; i++) {
        var o = i * NF, a = cur[i], r = rep(a), g = groups[(r < 0 ? TL[a] : T2[r])[0]];
        D[o + 6] = D[o] + D[o + 2] / 2; D[o + 7] = D[o + 1] + D[o + 2] / 2; D[o + 8] = 0;
        var pk = r >= 0 ? 'n' + L.g2[r] : PG[a] != null ? PG[a] : 'a' + a;
        if (g && g.length < PER && !seen[pk]) { seen[pk] = 1; g.push(i); }
      }
      var ts = (1 - GPAD * 2) / COLS, gap = ts * .06, y = GPAD;
      labels = [];
      ORDER.forEach(function (k) {
        var g = groups[k]; if (!g.length) return;
        labels.push([k, GPAD + gap / 2, y]); y += LBL;
        g.forEach(function (i, j) {
          var o = i * NF; D[o + 6] = GPAD + (j % COLS) * ts + gap / 2; D[o + 7] = y + Math.floor(j / COLS) * ts + gap / 2; D[o + 8] = ts - gap;
        });
        y += Math.ceil(g.length / COLS) * ts + ts * .25;
      });
      gridH = y;
    }
    function finishFlips() {
      flips.forEach(function (f) { var j = f[0], b = alt[j]; alt[j] = cur[j]; cur[j] = b; setTile(j, b); D[j * NF + 19] = -99; });
      flips.length = 0;
    }
    var flips = [];
    gridLayout();

    var cb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, cb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
    var lc = gl.getAttribLocation(pr, 'c'); gl.enableVertexAttribArray(lc); gl.vertexAttribPointer(lc, 2, gl.FLOAT, false, 0, 0);
    var ib = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ib); gl.bufferData(gl.ARRAY_BUFFER, D, gl.DYNAMIC_DRAW);
    [['tg', 3, 0], ['fr', 3, 3], ['gd', 3, 6], ['dl', 1, 9], ['uv', 2, 10], ['mn', 3, 12], ['cc', 3, 15], ['al', 1, 18], ['fl', 1, 19], ['id', 1, 20], ['u2', 3, 21]]
      .forEach(function (a) {
        var l = gl.getAttribLocation(pr, a[0]); if (l < 0) return;
        gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, a[1], gl.FLOAT, false, NF * 4, a[2] * 4); X.vertexAttribDivisorANGLE(l, 1);
      });
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(U.asp, ASP); gl.uniform1f(U.K, MOBILE ? .5 : .42);

    /* chrome: lens ring, tag, explode button, hint, product labels for the grid */
    function el(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; }
    var ring = el('div', 'mz-lens'), tag = el('a', 'mz-tag'), btn = el('button', 'mz-btn', 'Explode'), hint = el('div', 'mz-hint', HOVER ? 'Made of the work · hover to look closer' : 'Made of the work · tap a tile');
    var lbox = el('div', 'mz-labels'), lin = el('div', 'mz-lin'), scr = el('div', 'mz-scroll'), spc = el('div', 'mz-spc');
    lbox.appendChild(lin); scr.appendChild(spc);
    btn.type = 'button'; btn.setAttribute('aria-pressed', 'false'); ring.setAttribute('aria-hidden', 'true'); lbox.setAttribute('aria-hidden', 'true');
    vis.appendChild(cv); vis.appendChild(scr); vis.appendChild(lbox); vis.appendChild(ring); vis.appendChild(tag); vis.appendChild(hint); vis.appendChild(btn);

    var w = 0, h = 0, dpr = 1;
    function size() {
      w = vis.clientWidth; h = vis.clientHeight; dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      spc.style.height = Math.max(h, Math.ceil(gridH * w + RES)) + 'px';
      lin.innerHTML = labels.map(function (l) {
        return '<span style="left:' + (l[1] * w).toFixed(1) + 'px;top:' + (l[2] * w).toFixed(1) + 'px">' + esc(L.products[l[0]].n) + '</span>';
      }).join('');
      kick();
    }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

    /* state */
    var T0 = performance.now() / 1000, now = 0, prev = 0, visible = true, raf = 0, explode = 0, exT = 0, exFrom = 0, exStart = 0, selId = -1;
    var lens = { x: 0, y: 0, a: 0, ta: 0, m: 3, tm: 3 }, lastFlip = 0, sy = 0;
    if (RM) T0 -= 10;
    var INTRO = 3.4;
    vis.classList.add('mz-on');
    if (RM) vis.classList.add('mz-done'); else setTimeout(function () { vis.classList.add('mz-done'); }, 1400);

    function frame() {
      raf = 0; now = performance.now() / 1000 - T0;
      var dt = Math.min(.25, Math.max(0, now - prev)); prev = now;
      var busy = now < INTRO;
      /* explode and lens transitions run on time, not frame count */
      if (explode !== exT) { busy = true; explode = RM ? exT : exT > exFrom ? Math.min(exT, exFrom + (now - exStart) / 1.3) : Math.max(exT, exFrom - (now - exStart) / 1.3); }
      if (lens.a !== lens.ta) { busy = true; lens.a = RM ? lens.ta : lens.ta > lens.a ? Math.min(1, lens.a + dt / .16) : Math.max(0, lens.a - dt / .16); }
      if (Math.abs(lens.tm - lens.m) > .01) { busy = true; lens.m += (lens.tm - lens.m) * (RM ? 1 : 1 - Math.exp(-dt * 12)); }
      /* idle shimmer: an occasional tile flips over to show another piece of work */
      if (!RM && now > INTRO && exT === 0 && now - lastFlip > (MOBILE ? .32 : .16)) {
        lastFlip = now; var i = Math.floor(Math.random() * N);
        if (i !== selId) { D[i * NF + 19] = now; flips.push([i, now]); upd(i); }
      }
      for (var k = flips.length - 1; k >= 0; k--) {
        if (now - flips[k][1] > .275) { var j = flips[k][0], b = alt[j]; alt[j] = cur[j]; cur[j] = b; setTile(j, b); upd(j); flips.splice(k, 1); }
      }
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.res, w, h); gl.uniform1f(U.W, w); gl.uniform1f(U.t, now); gl.uniform1f(U.ex, explode);
      gl.uniform1f(U.sel, selId); gl.uniform1f(U.sc, w > 420 ? 1.2 : .9); gl.uniform1f(U.dpr, dpr);
      gl.uniform1f(U.sy, sy); gl.uniform1f(U.cut, h - RES);
      gl.uniform4f(U.lens, lens.x, lens.y, lensR(), lens.a); gl.uniform1f(U.mag, lens.m);
      gl.uniform1f(U.pass, 0); X.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, N);
      if (lens.a > 0) { gl.uniform1f(U.pass, 1); X.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, N); gl.uniform1f(U.pass, 2); X.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, N); }
      if (visible && (busy || !RM)) raf = requestAnimationFrame(frame);
    }
    function lensR() { return Math.min(w, h) * (MOBILE ? .25 : .19); }
    function upd(i) { gl.bufferSubData(gl.ARRAY_BUFFER, i * NF * 4, D.subarray(i * NF, i * NF + NF)); }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) kick();
      else if (exT) { exT = 0; setExplode(false); }
    }).observe(vis);
    new ResizeObserver(size).observe(vis);
    size();

    /* interaction */
    function local(e) { var r = vis.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function pick(p) {
      var ex = exT > .5, best = -1;
      for (var i = 0; i < N; i++) {
        var o = i * NF, x = (ex ? D[o + 6] : D[o]) * w, y = (ex ? D[o + 7] * w - sy : D[o + 1] * w), s = (ex ? D[o + 8] : D[o + 2]) * w;
        if (ex && (s <= 0 || p.y > h - RES)) continue;
        if (p.x >= x && p.x < x + s && p.y >= y && p.y < y + s) { best = i; break; }
      }
      return best;
    }
    function showTag(i, p) {
      if (i < 0) return hideTag();
      selId = i; var r = rep(cur[i]), m = r < 0 ? TL[cur[i]] : T2[r], pr = L.products[m[0]];
      tag.href = pr.h; tag.innerHTML = '<b>' + esc(pr.n) + '</b><span> · ' + esc(m[1]) + '</span><i aria-hidden="true">&rarr;</i>';
      tag.setAttribute('aria-label', pr.n + ', ' + m[1] + '. Open the project');
      tag.classList.add('on');
      var tw = tag.offsetWidth, th = tag.offsetHeight;
      var off = lens.ta ? lensR() + 10 : 22;
      var x = Math.max(8, Math.min(w - tw - 8, p.x - tw / 2)), y = p.y + off + th > h - 8 ? p.y - th - off : p.y + off;
      tag.style.transform = 'translate(' + x.toFixed(1) + 'px,' + Math.max(8, y).toFixed(1) + 'px)';
      kick();
    }
    function hideTag() { selId = -1; tag.classList.remove('on'); kick(); }
    function moveLens(p) {
      lens.x = p.x; lens.y = p.y; lens.ta = exT ? 0 : 1;
      var R = lensR(), i = pick(p);
      /* zoom so the tile under the lens shows at about half the lens size: small face tiles get more zoom */
      if (i >= 0) lens.tm = Math.max(2.4, Math.min(9, R * .5 / (D[i * NF + 2] * w)));
      if (!lens.a) lens.m = lens.tm;
      ring.style.width = ring.style.height = (R * 2).toFixed(1) + 'px';
      ring.style.transform = 'translate(' + (p.x - R).toFixed(1) + 'px,' + (p.y - R).toFixed(1) + 'px)';
      ring.classList.toggle('on', !exT);
      vis.classList.add('mz-used');
      kick();
    }
    function dropLens() { lens.ta = 0; ring.classList.remove('on'); kick(); }

    var lensTimer = 0, lastTap = 0, down = null;
    function listen(type, fn) { cv.addEventListener(type, fn); scr.addEventListener(type, fn); }
    listen('pointermove', function (e) {
      if (e.pointerType === 'mouse') { moveLens(local(e)); return; }
      if (down && e.pointerId === down.id) { var p = local(e); if (Math.hypot(p.x - down.x, p.y - down.y) > 6) { down.moved = true; moveLens(p); } }
    });
    listen('pointerleave', function (e) { if (e.pointerType === 'mouse') dropLens(); });
    listen('pointerdown', function (e) { var p = local(e); down = { id: e.pointerId, x: p.x, y: p.y, moved: false }; });
    listen('pointercancel', function () { down = null; });
    listen('pointerup', function (e) {
      var p = local(e), touch = e.pointerType !== 'mouse', moved = down && down.moved; down = null;
      if (touch) {
        var t = performance.now();
        if (t - lastTap < 320) { lastTap = 0; hideTag(); dropLens(); toggle(); return; }
        lastTap = t;
        if (!exT) { moveLens(p); clearTimeout(lensTimer); lensTimer = setTimeout(dropLens, 2600); }
      }
      if (!moved) showTag(pick(p), p);
    });
    listen('dblclick', function (e) { e.preventDefault(); hideTag(); toggle(); });
    var lastToggle = 0;
    function toggle() { var t = performance.now(); if (t - lastToggle < 500) return; lastToggle = t; setExplode(!exT); }
    document.addEventListener('pointerdown', function (e) { if (!vis.contains(e.target)) hideTag(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTag(); });

    scr.addEventListener('scroll', function () {
      sy = scr.scrollTop; lin.style.transform = 'translateY(' + (-sy).toFixed(1) + 'px)'; hideTag();
    }, { passive: true });
    function setExplode(on) {
      if (on) { finishFlips(); gridLayout(); scr.scrollTop = 0; sy = 0; lin.style.transform = ''; size(); }
      exFrom = explode; exStart = performance.now() / 1000 - T0;
      exT = on ? 1 : 0; vis.classList.toggle('mz-ex', on); vis.classList.add('mz-used');
      btn.textContent = on ? 'Reassemble' : 'Explode'; btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) dropLens();
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, D);
      kick();
    }
    btn.addEventListener('click', function () { hideTag(); setExplode(!exT); });
  }
})();
