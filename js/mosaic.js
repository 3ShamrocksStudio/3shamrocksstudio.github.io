/* 3Shamrocks Studio: "Made of the work" portrait for the "20 years" section (v5, 10 Nov 2026).
   Dave's real photo rebuilt as a living photomosaic of his real work: every tile is a complete real portfolio piece
   (assets/studio/mosaic/atlas.webp, built offline by library.py + build.py), matched and tinted to the colour of that
   region of the photo. The photo itself is never redrawn or altered: tiles only sample its real pixels.
   Interaction:
     - click / tap the portrait: smooth zoom in toward the face; the tiles turn into crisp, readable pieces of work
     - zoomed in: click / tap a tile opens its colour family (library.json: every piece sharing its dominant colour,
       shown large and sharp, with a full-size viewer); drag to look around
     - double-click / double-tap, or the effect button: Tornado, Spectrum, Big bang, Ripple in turn. Each one swirls,
       sorts or blasts the tiles and settles them back into Dave's portrait, in a new arrangement of the work
     - Reset: back to the first view and the original arrangement. Esc closes / resets.
   prefers-reduced-motion: no swirl or flight, changes are instant. Nothing loads until the section is near the
   viewport; without JS or WebGL the plain photo stays. */
(function () {
  'use strict';
  var vis = document.getElementById('about-visual');
  if (!vis || !window.IntersectionObserver) return;
  var img = vis.querySelector('img');
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOVER = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var BASE = 'assets/studio/mosaic/', VER = 'm9';
  var NF = 21; /* floats per tile */
  var EFFECTS = [['tornado', 'Tornado'], ['spectrum', 'Spectrum'], ['bigbang', 'Big bang'], ['ripple', 'Ripple']];

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
    Promise.all([fetch(BASE + 'layout.json?v=' + VER).then(function (r) { if (!r.ok) throw 0; return r.json(); }),
                 loadImg(BASE + 'atlas.webp?v=' + VER), img.complete && img.naturalWidth ? img : loadImg(img.currentSrc || img.src)])
      .then(function (r) { build(cv, gl, inst, r[0], r[1], r[2]); })
      .catch(function () { /* keep the plain photo */ });
  }

  /* time, in seconds; ?mzspeed=0.1 slows every animation down for frame-by-frame QA screenshots */
  var SPEED = Math.min(1, Math.max(.01, +(/[?&]mzspeed=([\d.]+)/.exec(location.search) || [0, 1])[1] || 1));
  function clk() { return performance.now() / 1000 * SPEED; }
  function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  function build(cv, gl, X, L, atlasImg, photoImg) {
    var MOBILE = vis.clientWidth < 520 || matchMedia('(pointer:coarse)').matches;
    var src = MOBILE ? L.mobile : L.desktop, N = src.length, ASP = L.aspect;
    var TL = L.tiles, G = L.cols;
    function uvs(a) { return [a[2] / a[0], a[2] / a[1], a[3] / a[0], a[3] / a[1]]; } /* slot w/h, pad w/h in uv units */
    var ULO = uvs(L.lo), UHI = uvs(L.hi), hiP = null;

    /* photo texture: the real cut-out photo over the section's own backdrop gradient (as the static version shows it) */
    var pc = document.createElement('canvas'); pc.width = photoImg.naturalWidth; pc.height = photoImg.naturalHeight;
    var pg = pc.getContext('2d'), gr = pg.createLinearGradient(0, 0, 0, pc.height);
    gr.addColorStop(0, '#2a1a52'); gr.addColorStop(1, '#160d33'); pg.fillStyle = gr; pg.fillRect(0, 0, pc.width, pc.height);
    pg.drawImage(photoImg, 0, 0);

    var VS = [
      'precision highp float;',
      'attribute vec2 c;attribute vec3 tg,fr,gd;attribute float dl;attribute vec2 uv;attribute vec3 mn,cc;attribute float al,fl,id;',
      'uniform vec2 res,fp;uniform float W,t,ex,sel,asp,sc,mag,pass,hr,tw,tt,bb,wv;uniform vec4 lens,ulo,uhi,cam;',
      'varying vec2 vUv,vPh,vC,vP,vUv2;varying vec3 vMn,vCc;varying float vAl,vPx,vRaw,vOp,vSel,vSw,vDep;',
      'void main(){',
      ' float p=clamp((t-dl)/1.15,0.,1.);float e=1.-pow(1.-p,4.);',
      ' vec2 ct=(tg.xy+tg.z*.5)*W;float s=tg.z*W;',
      ' vec2 cf=ct+fr.xy*W;float rot=fr.z*(1.-e);',
      ' vec2 cen=mix(cf,ct,e);s*=mix(.25,1.,e);',
      ' float r1=fract(sin(id*12.9898)*43758.5453),r2=fract(sin(id*78.233+1.3)*24634.6345);',
      /* spectrum: every tile flies to its place in a colour-sorted grid */
      ' float k=clamp(ex*1.7-r1*.7,0.,1.);k=k*k*(3.-2.*k);',
      ' cen=mix(cen,(gd.xy+gd.z*.5)*W,k);s=mix(s,gd.z*W,k);float raw=k;vDep=1.;',
      /* tornado: tiles are drawn into a funnel (wide at the top) and spin round it, near tiles big and bright */
      ' if(tw>0.){float a=clamp(tw*1.3-r1*.3,0.,1.);a=a*a*(3.-2.*a);float yy=clamp(cen.y/res.y,0.,1.);',
      '  float R=res.x*(.06+.4*(1.-yy))*(.55+.45*r2);float th=r2*6.2832+tt*(1.5+2.6*(1.-yy));float dep=cos(th)*.5+.5;',
      '  vec2 tc=vec2(res.x*.5+R*sin(th)+sin(tt*1.3+yy*4.)*res.x*.05*(1.-yy),cen.y-res.y*.05*sin(tt*2.+r1*6.28));',
      '  cen=mix(cen,tc,a);s*=mix(1.,.45+.5*dep,a);rot+=a*th*.35;vDep=mix(1.,.4+.6*dep,a);}',
      /* big bang: blasted out from the face, then pulled back */
      ' if(bb>0.){vec2 d=cen-fp;float l=length(d)+1.;cen+=d/l*(res.x*(.3+r1*.9))*bb+vec2((r2-.5)*res.x*.4*bb,res.y*.2*bb*bb*(r1-.3));',
      '  rot+=(r2-.5)*10.*bb;s*=1.+.6*bb*r2;}',
      ' float f=clamp((t-fl)/.55,0.,1.);float sx=max(abs(cos(f*3.14159)),.04);s*=1.+wv*.5*sin(f*3.14159);',
      /* camera: zoom by cam.z toward the focus point cam.xy, which moves to the frame centre */
      ' float z=1.+cam.w*(cam.z-1.);cen=(cen-cam.xy)*z+mix(cam.xy,res*.5,cam.w);s*=z;',
      ' if(pass>.5){cen=lens.xy+(cen-lens.xy)*mag;s*=mag;raw=.86;}',
      ' float q=pass>.5&&pass<1.5?s+1.:max(s-sc*(1.+cam.w*1.6),1.);vec2 o=(c-.5)*vec2(q*sx,q);float cs=cos(rot),sn=sin(rot);o=vec2(o.x*cs-o.y*sn,o.x*sn+o.y*cs);',
      ' vec2 P=cen+o;vP=P;gl_Position=vec4(P.x/res.x*2.-1.,1.-P.y/res.y*2.,0.,1.);',
      ' vUv=uv*ulo.xy+ulo.zw+c*(ulo.xy-2.*ulo.zw);vPh=(tg.xy+c*tg.z)/vec2(1.,asp);vC=c;vMn=mn;vCc=cc;vAl=al;vPx=q;vRaw=raw;',
      ' vOp=smoothstep(0.,.3,p);vSel=step(abs(id-sel),.5);',
      ' vUv2=uv*uhi.xy+uhi.zw+c*(uhi.xy-2.*uhi.zw);vSw=hr*max(max(step(.5,pass),step(.001,k)),step(.02,cam.w));}'
    ].join('\n');
    var FS = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif',
      'uniform sampler2D at,ph,at2;uniform float K,dpr,pass,rw;uniform vec4 lens;',
      'varying vec2 vUv,vPh,vC,vP,vUv2;varying vec3 vMn,vCc;varying float vAl,vPx,vRaw,vOp,vSel,vSw,vDep;',
      'void main(){',
      ' float lo=1.;if(pass>.5){float r=length(vP-lens.xy);if(r>lens.z)discard;lo=clamp((lens.z-r)*dpr,0.,1.)*lens.w;',
      '  if(pass<1.5){gl_FragColor=vec4(.03,.02,.06,1.)*lo;return;}}',
      ' vec3 t=texture2D(at,vUv).rgb,t2=texture2D(at2,vUv2).rgb;if(vSw>.5)t=t2;vec3 P=texture2D(ph,vPh).rgb;',
      ' vec3 tint=clamp(vCc+(t-vMn)*.55,0.,1.);vec3 fig=mix(tint,P,K);',
      ' vec3 bg=t*.3+P*.25;float w=clamp((vAl-.15)/.6,0.,1.);',
      ' vec3 col=mix(mix(bg,fig,w),t,max(vRaw,rw))*vDep;',
      ' vec2 q=abs(vC-.5)*vPx;float rr=min(2.5+rw*4.,vPx*.22);float d=length(max(q-(vPx*.5-rr),0.))-rr;',
      ' float a=clamp(.5-d*dpr,0.,1.)*vOp*lo;',
      ' float edge=step(vPx*.5-1.5,max(q.x,q.y))*vSel;col=mix(col,vec3(1.),edge);',
      ' gl_FragColor=vec4(col*a,a);}'
    ].join('\n');
    function sh(type, s) { var o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var pr = gl.createProgram();
    try { gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); } catch (e) { return; }
    gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    var U = {}; ['res', 'fp', 'W', 't', 'ex', 'sel', 'asp', 'sc', 'mag', 'pass', 'lens', 'at', 'ph', 'at2', 'K', 'dpr', 'hr', 'ulo', 'uhi', 'cam', 'tw', 'tt', 'bb', 'wv', 'rw']
      .forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });

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
    gl.activeTexture(gl.TEXTURE2); tex(pc, false); gl.uniform1i(U.at2, 2); /* placeholder until atlas-hi.webp loads */
    gl.uniform4fv(U.ulo, ULO); gl.uniform4fv(U.uhi, UHI); gl.uniform1f(U.hr, 0);
    function loadHi() {
      if (hiP || gl.getParameter(gl.MAX_TEXTURE_SIZE) < Math.max(L.hi[0], L.hi[1])) return;
      hiP = loadImg(BASE + 'atlas-hi.webp?v=' + VER).then(function (im) {
        gl.activeTexture(gl.TEXTURE2); tex(im, false); gl.uniform1f(U.hr, 1); kick();   /* not a power of two: no mipmaps in WebGL 1 */
      }).catch(function () { /* the small atlas stays */ });
    }

    /* per-tile data */
    var D = new Float32Array(N * NF), cur = new Int32Array(N), alt = new Int32Array(N), org = new Int32Array(N), orgAlt = new Int32Array(N);
    var ex0 = 0.38, ey0 = 0.3; /* cascade origin: between the eyes, in width units */
    var maxd = 0;
    src.forEach(function (s) { var d = Math.hypot(s[0] + s[2] / 2 - ex0, s[1] + s[2] / 2 - ey0); if (d > maxd) maxd = d; });
    function rnd(i, k) { var x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
    function setTile(i, a) {
      var o = i * NF, m = TL[a];
      D[o + 10] = a % G; D[o + 11] = Math.floor(a / G); /* slot column and row: the shader turns them into uvs per atlas */
      D[o + 12] = m[2]; D[o + 13] = m[3]; D[o + 14] = m[4];
    }
    src.forEach(function (s, i) {
      var o = i * NF, ang = rnd(i, 1) * 6.283, rr = .55 + rnd(i, 2) * .9;
      D[o] = s[0]; D[o + 1] = s[1]; D[o + 2] = s[2];
      D[o + 3] = Math.cos(ang) * rr; D[o + 4] = Math.sin(ang) * rr * 1.2; D[o + 5] = (rnd(i, 3) - .5) * 5;
      D[o + 6] = s[0]; D[o + 7] = s[1]; D[o + 8] = s[2];
      var d = Math.hypot(s[0] + s[2] / 2 - ex0, s[1] + s[2] / 2 - ey0) / maxd;
      D[o + 9] = .15 + d * 1.5 + rnd(i, 4) * .35;
      D[o + 15] = s[5]; D[o + 16] = s[6]; D[o + 17] = s[7]; D[o + 18] = s[8]; D[o + 19] = -99; D[o + 20] = i;
      cur[i] = org[i] = s[3]; alt[i] = orgAlt[i] = s[4]; setTile(i, s[3]);
    });
    var changed = false; /* arrangement differs from the original */

    /* spectrum: every tile's place in a grid sorted by the colour of the work it shows (hue left to right, light to dark
       down each column; greys and near-blacks at the end) */
    function spectrumLayout() {
      var idx = [], hs = [];
      for (var i = 0; i < N; i++) {
        var m = TL[cur[i]], r = m[2], g = m[3], b = m[4], mx = Math.max(r, g, b), mn = Math.min(r, g, b), c = mx - mn, h = 0;
        if (c > .0001) h = mx === r ? ((g - b) / c + 6) % 6 : mx === g ? (b - r) / c + 2 : (r - g) / c + 4;
        var lum = .299 * r + .587 * g + .114 * b, sat = mx > 0 ? c / mx : 0;
        hs.push([sat < .18 || mx < .12 ? 7 + (1 - lum) : h, lum]); idx.push(i);
      }
      idx.sort(function (a, b) { return hs[a][0] - hs[b][0]; });
      var cols = Math.max(4, Math.ceil(Math.sqrt(N / ASP))), rows;
      for (;;) { rows = Math.ceil(N / cols); if (rows / cols <= ASP * .96) break; cols++; }
      var ts = 1 / cols, oy = (ASP - rows * ts) / 2, gap = ts * .08;
      for (var c0 = 0; c0 < cols; c0++) {
        var col = idx.slice(c0 * rows, (c0 + 1) * rows).sort(function (a, b) { return hs[b][1] - hs[a][1]; });
        col.forEach(function (i, r) { var o = i * NF; D[o + 6] = c0 * ts + gap / 2; D[o + 7] = oy + r * ts + gap / 2; D[o + 8] = ts - gap; });
      }
    }

    var cb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, cb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
    var lc = gl.getAttribLocation(pr, 'c'); gl.enableVertexAttribArray(lc); gl.vertexAttribPointer(lc, 2, gl.FLOAT, false, 0, 0);
    var ib = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ib); gl.bufferData(gl.ARRAY_BUFFER, D, gl.DYNAMIC_DRAW);
    [['tg', 3, 0], ['fr', 3, 3], ['gd', 3, 6], ['dl', 1, 9], ['uv', 2, 10], ['mn', 3, 12], ['cc', 3, 15], ['al', 1, 18], ['fl', 1, 19], ['id', 1, 20]]
      .forEach(function (a) {
        var l = gl.getAttribLocation(pr, a[0]); if (l < 0) return;
        gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, a[1], gl.FLOAT, false, NF * 4, a[2] * 4); X.vertexAttribDivisorANGLE(l, 1);
      });
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(U.asp, ASP); gl.uniform1f(U.K, MOBILE ? .5 : .42);
    function uploadAll() { gl.bufferSubData(gl.ARRAY_BUFFER, 0, D); }

    /* chrome: lens ring, hint, effect / colours / reset buttons */
    function el(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; }
    var ring = el('div', 'mz-lens'), hint = el('div', 'mz-hint'), bar = el('div', 'mz-bar');
    var bFx = el('button', 'mz-btn mz-fx'), bCol = el('button', 'mz-btn', '<i class="mz-sw" aria-hidden="true"></i>Colours'), bRst = el('button', 'mz-btn mz-rst', 'Reset');
    [bFx, bCol, bRst].forEach(function (b) { b.type = 'button'; bar.appendChild(b); });
    ring.setAttribute('aria-hidden', 'true'); hint.setAttribute('aria-live', 'polite');
    bCol.setAttribute('aria-label', 'Browse the work by colour');
    vis.appendChild(cv); vis.appendChild(ring); vis.appendChild(hint); vis.appendChild(bar);

    var w = 0, h = 0, dpr = 1;
    function size() {
      w = vis.clientWidth; h = vis.clientHeight; dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      if (!cam.ts) { cam.fx = cam.tfx = face().x; cam.fy = cam.tfy = face().y; }
      kick();
    }

    /* state */
    var T0 = clk(), now = 0, prev = 0, visible = true, raf = 0, selId = -1;
    var lens = { x: 0, y: 0, a: 0, ta: 0, m: 3, tm: 3 }, lastFlip = 0;
    var cam = { s: 0, ts: 0, fx: 0, fy: 0, tfx: 0, tfy: 0, Z: MOBILE ? 2.3 : 2.5 };
    var fx = { name: null, t0: 0, swapped: false, i: 0 };
    var flips = [];
    if (RM) T0 -= 10;
    var INTRO = 3.4;
    function face() { return { x: w * .47, y: w * .37 }; } /* between the eyes and the beard of this photo */
    vis.classList.add('mz-on');
    if (RM) vis.classList.add('mz-done'); else setTimeout(function () { vis.classList.add('mz-done'); }, 1400 / SPEED);

    function setHint() {
      var t;
      if (fx.name) t = EFFECTS[fx.i][1] + '…';
      else if (cam.ts) t = HOVER ? 'Click a tile to open its colour family · drag to look around' : 'Tap a tile for its colour family · drag to look around';
      else t = HOVER ? 'Click me to zoom in · double-click for a surprise' : 'Tap me to zoom in · double-tap for a surprise';
      hint.textContent = t;
      bFx.innerHTML = '<span aria-hidden="true">✦</span> ' + EFFECTS[effIdx][1];
      bFx.setAttribute('aria-label', 'Play the ' + EFFECTS[effIdx][1] + ' effect');
      bRst.hidden = !(cam.ts || changed);
      vis.classList.toggle('mz-z', !!cam.ts);
      vis.setAttribute('data-mz', fx.name || (cam.ts ? 'zoom' : 'rest'));
    }
    var effIdx = 0;

    function frame() {
      raf = 0; now = clk() - T0;
      var dt = Math.min(.25, Math.max(0, now - prev)); prev = now;
      var busy = now < INTRO, tw = 0, tt = 0, bb = 0, ex = 0, wv = 0;
      /* camera */
      if (Math.abs(cam.ts - cam.s) > .001 || Math.abs(cam.tfx - cam.fx) > .2 || Math.abs(cam.tfy - cam.fy) > .2) {
        busy = true; var kk = RM ? 1 : 1 - Math.exp(-dt * 4.2), kf = RM ? 1 : 1 - Math.exp(-dt * 9);
        cam.s += (cam.ts - cam.s) * kk; cam.fx += (cam.tfx - cam.fx) * kf; cam.fy += (cam.tfy - cam.fy) * kf;
        if (Math.abs(cam.ts - cam.s) < .002) cam.s = cam.ts;
      }
      if (lens.a !== lens.ta) { busy = true; lens.a = RM ? lens.ta : lens.ta > lens.a ? Math.min(1, lens.a + dt / .16) : Math.max(0, lens.a - dt / .16); }
      if (Math.abs(lens.tm - lens.m) > .01) { busy = true; lens.m += (lens.tm - lens.m) * (RM ? 1 : 1 - Math.exp(-dt * 12)); }
      /* the current effect */
      if (fx.name) {
        busy = true; var u = now - fx.t0, dur = { tornado: 3.4, spectrum: 3.6, bigbang: 2.2, ripple: 2.4 }[fx.name];
        if (fx.name === 'tornado') { tw = ease(u / .9) * (1 - ease((u - 2.3) / 1.1)); tt = u; if (u > 1.6) swapAll(); }
        else if (fx.name === 'spectrum') { ex = Math.min(1, u / 1.1) * (1 - Math.max(0, Math.min(1, (u - 2.3) / 1.3))); if (u > 1.7) swapAll(); }
        else if (fx.name === 'bigbang') { bb = u < .42 ? 1 - Math.pow(1 - u / .42, 3) : Math.max(0, 1 - ease((u - .42) / 1.5)) - .05 * Math.sin(Math.max(0, u - 1.6) * 9) * Math.max(0, 1 - (u - 1.6) * 2); if (u > .42) swapAll(); }
        else wv = 1;
        if (u > dur) endEffect();
      } else if (!RM && now > INTRO && now - lastFlip > (MOBILE ? .32 : .16)) {
        /* idle shimmer: an occasional tile flips over to show another piece of work */
        lastFlip = now; var i = Math.floor(Math.random() * N);
        if (i !== selId) { D[i * NF + 19] = now; flips.push([i, now]); upd(i); }
      }
      for (var k = flips.length - 1; k >= 0; k--) {
        if (now - flips[k][1] > .275) { var j = flips[k][0], b = alt[j]; alt[j] = cur[j]; cur[j] = b; setTile(j, b); upd(j); flips.splice(k, 1); }
        else busy = true;
      }
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.res, w, h); gl.uniform1f(U.W, w); gl.uniform1f(U.t, now); gl.uniform1f(U.ex, ex);
      gl.uniform1f(U.tw, tw); gl.uniform1f(U.tt, tt); gl.uniform1f(U.bb, Math.max(-.1, bb)); gl.uniform1f(U.wv, wv);
      var F = face(); gl.uniform2f(U.fp, F.x, F.y);
      gl.uniform4f(U.cam, cam.fx, cam.fy, cam.Z, cam.s); gl.uniform1f(U.rw, cam.s * .34);
      gl.uniform1f(U.sel, selId); gl.uniform1f(U.sc, w > 420 ? 1.2 : .9); gl.uniform1f(U.dpr, dpr);
      gl.uniform4f(U.lens, lens.x, lens.y, lensR(), lens.a); gl.uniform1f(U.mag, lens.m);
      gl.uniform1f(U.pass, 0); X.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, N);
      if (lens.a > 0) { gl.uniform1f(U.pass, 1); X.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, N); gl.uniform1f(U.pass, 2); X.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, N); }
      if (visible && (busy || !RM)) raf = requestAnimationFrame(frame);
    }
    function lensR() { return Math.min(w, h) * (MOBILE ? .25 : .19); }
    function upd(i) { gl.bufferSubData(gl.ARRAY_BUFFER, i * NF * 4, D.subarray(i * NF, i * NF + NF)); }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }).observe(vis);
    new ResizeObserver(size).observe(vis);
    size(); setHint();

    /* effects: each one ends with the tiles settled back into the portrait, showing the other half of the work */
    function finishFlips() {
      flips.forEach(function (f) { var j = f[0], b = alt[j]; alt[j] = cur[j]; cur[j] = b; setTile(j, b); D[j * NF + 19] = -99; });
      flips.length = 0;
    }
    function swapAll() {
      if (fx.swapped) return; fx.swapped = true;
      for (var i = 0; i < N; i++) { var b = alt[i]; alt[i] = cur[i]; cur[i] = b; setTile(i, b); }
      uploadAll(); changed = true;
    }
    function ripple(to) { /* a wave of flips out from the face; to: optional target tiles (reset) */
      var F = face(), md = 0, ds = [];
      for (var i = 0; i < N; i++) { var o = i * NF, d = Math.hypot((D[o] + D[o + 2] / 2) * w - F.x, (D[o + 1] + D[o + 2] / 2) * w - F.y); ds.push(d); if (d > md) md = d; }
      for (i = 0; i < N; i++) {
        if (to) { if (cur[i] === to[i]) continue; alt[i] = to[i]; }
        var st = now + ds[i] / md * 1.3 + rnd(i, 9) * .12; D[i * NF + 19] = st; flips.push([i, st]);
      }
      uploadAll();
    }
    function playEffect() {
      if (fx.name) return;
      dropLens(); finishFlips(); loadHi();
      fx.i = effIdx; fx.name = EFFECTS[effIdx][0]; fx.t0 = clk() - T0; fx.swapped = false;
      effIdx = (effIdx + 1) % EFFECTS.length;
      setZoom(false);
      if (RM) { swapAll(); fx.name = null; setHint(); uploadAll(); kick(); return; }
      if (fx.name === 'spectrum') { spectrumLayout(); uploadAll(); }
      if (fx.name === 'ripple') { now = fx.t0; ripple(); changed = true; }
      cue('explode'); setHint(); kick();
    }
    function endEffect() {
      if (fx.name === 'ripple') finishFlips();
      fx.name = null; uploadAll(); cue('assemble'); setHint();
    }
    function reset() {
      if (fx.name) return;
      setZoom(false); dropLens();
      if (changed) {
        finishFlips();
        if (RM) { for (var i = 0; i < N; i++) { cur[i] = org[i]; alt[i] = orgAlt[i]; setTile(i, org[i]); } uploadAll(); }
        else { now = clk() - T0; ripple(org); setTimeout(function () { finishFlips(); for (var i = 0; i < N; i++) alt[i] = orgAlt[i]; }, 1700 / SPEED); }
        changed = false;
      }
      setHint(); kick();
    }
    function setZoom(on, p) {
      cam.ts = on ? 1 : 0;
      var F = face();
      if (on) { loadHi(); dropLens(); cam.tfx = p ? p.x : F.x; cam.tfy = p ? p.y : F.y; }
      else { cam.tfx = F.x; cam.tfy = F.y; selId = -1; }
      setHint(); kick();
    }
    /* user-initiated only: the homepage sound layer (js/studio-sound.js) decides whether to play it */
    function cue(n) { try { document.dispatchEvent(new CustomEvent('s3:sfx', { detail: n })); } catch (e) { /* no sound */ } }

    /* interaction */
    function local(e) { var r = vis.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function toFrame(p) { /* screen point to the portrait's own (unzoomed) coordinates */
      var z = 1 + cam.s * (cam.Z - 1), ax = cam.fx + (w / 2 - cam.fx) * cam.s, ay = cam.fy + (h / 2 - cam.fy) * cam.s;
      return { x: (p.x - ax) / z + cam.fx, y: (p.y - ay) / z + cam.fy };
    }
    function pick(p) {
      var q = toFrame(p);
      for (var i = 0; i < N; i++) {
        var o = i * NF, x = D[o] * w, y = D[o + 1] * w, s = D[o + 2] * w;
        if (q.x >= x && q.x < x + s && q.y >= y && q.y < y + s) return i;
      }
      return -1;
    }
    function moveLens(p) {
      if (cam.ts || fx.name) return dropLens();
      loadHi(); lens.x = p.x; lens.y = p.y; lens.ta = 1;
      var R = lensR(), i = pick(p);
      if (i >= 0) lens.tm = Math.max(2.4, Math.min(9, R * .5 / (D[i * NF + 2] * w)));
      if (!lens.a) lens.m = lens.tm;
      ring.style.width = ring.style.height = (R * 2).toFixed(1) + 'px';
      ring.style.transform = 'translate(' + (p.x - R).toFixed(1) + 'px,' + (p.y - R).toFixed(1) + 'px)';
      ring.classList.add('on');
      kick();
    }
    function dropLens() { lens.ta = 0; ring.classList.remove('on'); kick(); }

    var down = null, tapT = 0, lastTap = null;
    cv.addEventListener('pointerdown', function (e) {
      loadHi(); var p = local(e);
      down = { id: e.pointerId, x: p.x, y: p.y, fx: cam.tfx, fy: cam.tfy, moved: false };
      if (cam.ts) try { cv.setPointerCapture(e.pointerId); } catch (er) { /* fine */ }
    });
    cv.addEventListener('pointermove', function (e) {
      var p = local(e);
      if (down && e.pointerId === down.id) {
        if (Math.hypot(p.x - down.x, p.y - down.y) > 7) down.moved = true;
        if (down.moved && cam.ts && !fx.name) { /* drag to look around the zoomed portrait */
          var z = cam.Z;
          cam.tfx = Math.max(0, Math.min(w, down.fx - (p.x - down.x) / z)); cam.tfy = Math.max(0, Math.min(h, down.fy - (p.y - down.y) / z));
          kick(); return;
        }
      }
      if (e.pointerType === 'mouse' && !down) moveLens(p);
    });
    cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') dropLens(); });
    cv.addEventListener('pointercancel', function () { down = null; });
    cv.addEventListener('pointerup', function (e) {
      var p = local(e), moved = down && down.moved; down = null;
      if (moved || fx.name) return;
      var t = performance.now();
      if (lastTap && t - lastTap.t < 330 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 40) {   /* double tap / click: the next effect */
        clearTimeout(tapT); lastTap = null; playEffect(); return;
      }
      lastTap = { t: t, x: p.x, y: p.y };
      clearTimeout(tapT);
      tapT = setTimeout(function () { single(p); }, 280);
    });
    cv.addEventListener('dblclick', function (e) { e.preventDefault(); });
    function single(p) {
      if (fx.name) return;
      if (!cam.ts) { setZoom(true); cue('click'); return; }
      var i = pick(p); if (i < 0) return;
      selId = i; kick();
      openFamily(TL[cur[i]][5]);
    }
    bFx.addEventListener('click', function () { playEffect(); });
    bRst.addEventListener('click', reset);
    bCol.addEventListener('click', function () { var i = pick(face()); openFamily(TL[cur[Math.max(0, i)]][5]); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !fam.open && (cam.ts || changed)) reset(); });

    /* ---------- colour families: every piece of work that shares the clicked tile's dominant colour ---------- */
    var fam = { open: false, lib: null, list: [], i: -1, root: null, last: null };
    function getLib() {
      if (fam.lib) return Promise.resolve(fam.lib);
      return fetch(BASE + (L.lib || 'library.json') + '?v=' + VER).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { fam.lib = j; return j; });
    }
    function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
    function cdist(a, b) { var x = hex(a), y = hex(b), r = (x[0] + y[0]) / 2; return Math.sqrt((2 + r / 256) * Math.pow(x[0] - y[0], 2) + 4 * Math.pow(x[1] - y[1], 2) + (2 + (255 - r) / 256) * Math.pow(x[2] - y[2], 2)); }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
    function openFamily(aid) {
      getLib().then(function (lib) { showFamily(lib, aid); cue('sparkle'); }).catch(function () { /* no viewer */ });
    }
    function famUI() {
      if (fam.root) return fam.root;
      var r = el('div', 'mzf');
      r.setAttribute('role', 'dialog'); r.setAttribute('aria-modal', 'true'); r.setAttribute('aria-labelledby', 'mzf-t'); r.hidden = true;
      r.innerHTML = '<div class="mzf-top"><i class="mzf-dot" aria-hidden="true"></i><div class="mzf-h"><b id="mzf-t"></b><span class="mzf-n"></span></div>' +
        '<div class="mzf-fams" role="group" aria-label="Other colour families"></div><button class="mzf-x" type="button" aria-label="Close">&times;</button></div>' +
        '<div class="mzf-grid"></div>' +
        '<div class="mzf-view" hidden><div class="mzf-stage"><img class="mzf-big" alt="" decoding="async"></div>' +
        '<div class="mzf-cap"><span class="mzf-ct"></span><a class="mzf-go"></a><span class="mzf-k"></span></div>' +
        '<button class="mzf-a mzf-p" type="button" aria-label="Previous">&lsaquo;</button><button class="mzf-a mzf-nx" type="button" aria-label="Next">&rsaquo;</button>' +
        '<button class="mzf-x mzf-vx" type="button" aria-label="Back to the colour family">&times;</button></div>';
      document.body.appendChild(r);
      r.querySelector('.mzf-top .mzf-x').addEventListener('click', closeFamily);
      r.querySelector('.mzf-vx').addEventListener('click', closeView);
      r.querySelector('.mzf-p').addEventListener('click', function () { view(fam.i - 1); });
      r.querySelector('.mzf-nx').addEventListener('click', function () { view(fam.i + 1); });
      r.querySelector('.mzf-grid').addEventListener('click', function (e) { var b = e.target.closest('.mzf-c'); if (b) view(+b.dataset.k); });
      r.querySelector('.mzf-fams').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) showFamily(fam.lib, +b.dataset.a); });
      r.querySelector('.mzf-stage').addEventListener('click', function (e) { if (e.target === e.currentTarget) closeView(); });
      var sx = null;
      var stage = r.querySelector('.mzf-view');
      stage.addEventListener('pointerdown', function (e) { sx = e.clientX; });
      stage.addEventListener('pointerup', function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 50) view(fam.i + (e.clientX < sx ? 1 : -1)); sx = null; });
      document.addEventListener('keydown', function (e) {
        if (!fam.open) return;
        if (e.key === 'Escape') { e.preventDefault(); if (fam.i >= 0) closeView(); else closeFamily(); }
        else if (fam.i >= 0 && e.key === 'ArrowRight') view(fam.i + 1);
        else if (fam.i >= 0 && e.key === 'ArrowLeft') view(fam.i - 1);
      });
      return (fam.root = r);
    }
    function showFamily(lib, aid) {
      var A = lib.assets, base = A[aid] || A[0], names = {};
      lib.fams.forEach(function (f) { names[f[0]] = f[1]; });
      var list = A.map(function (a, i) { return i; }).filter(function (i) { return A[i].fam === base.fam && i !== aid; });
      list.sort(function (a, b) { return cdist(A[a].c, base.c) - cdist(A[b].c, base.c); });
      list.unshift(A.indexOf(base));   /* only the family itself: no top-up from other families (it put green and navy pieces in Red) */
      fam.list = list; fam.i = -1;
      var r = famUI();
      r.style.setProperty('--fc', base.c);
      r.querySelector('#mzf-t').textContent = (names[base.fam] || 'Colour') + ' family';
      r.querySelector('.mzf-n').textContent = list.length + ' pieces of work';
      /* the other families, each as a dot of its own most typical colour */
      var fams = lib.fams.filter(function (f) { return f[0] !== base.fam && A.some(function (a) { return a.fam === f[0]; }); });
      r.querySelector('.mzf-fams').innerHTML = fams.map(function (f) {
        var m = A.map(function (a, i) { return i; }).filter(function (i) { return A[i].fam === f[0]; });
        var rep = m[Math.floor(m.length / 2)];
        m.sort(function (a, b) { return hex(A[a].c).reduce(function (s, v) { return s + v; }, 0) - hex(A[b].c).reduce(function (s, v) { return s + v; }, 0); });
        rep = m[Math.floor(m.length / 2)];
        return '<button type="button" data-a="' + rep + '" style="--c:' + A[rep].c + '" aria-label="' + esc(f[1]) + ' family" title="' + esc(f[1]) + '"></button>';
      }).join('');
      r.querySelector('.mzf-grid').innerHTML = list.map(function (i, k) {
        var a = A[i], pn = (lib.products[a.p] || {}).n || '';
        return '<button class="mzf-c' + (a.cut ? ' cut' : '') + '" type="button" data-k="' + k + '" style="--c:' + a.c + '">' +
          '<img src="' + esc(a.s) + '" srcset="' + esc(a.s) + ' 320w, ' + esc(a.t) + ' 640w" sizes="(max-width:600px) 46vw, 240px" alt="' + esc(pn + ', ' + a.l) + '" loading="lazy" decoding="async">' +
          '<span><b>' + esc(pn) + '</b> ' + esc(a.l) + '</span></button>';
      }).join('');
      r.querySelector('.mzf-grid').scrollTop = 0;
      r.querySelector('.mzf-view').hidden = true;
      if (!fam.open) {
        fam.last = document.activeElement; fam.open = true; r.hidden = false;
        document.documentElement.classList.add('mzf-lock');
        requestAnimationFrame(function () { r.classList.add('on'); });
      }
      r.querySelector('.mzf-top .mzf-x').focus({ preventScroll: true });
    }
    function view(k) {
      var r = fam.root, A = fam.lib.assets, n = fam.list.length;
      k = (k + n) % n; fam.i = k;
      var a = A[fam.list[k]], pr = fam.lib.products[a.p] || { n: '', h: '#' };
      var big = r.querySelector('.mzf-big');
      big.classList.remove('in'); big.src = a.t; /* the sharp thumbnail first, then the full-size image */
      var full = new Image(); full.decoding = 'async';
      full.onload = function () { if (fam.i === k) big.src = a.f; }; full.src = a.f;
      big.alt = pr.n + ', ' + a.l;
      requestAnimationFrame(function () { big.classList.add('in'); });
      r.querySelector('.mzf-view').classList.toggle('cut', !!a.cut);
      r.querySelector('.mzf-ct').innerHTML = '<b>' + esc(pr.n) + '</b> ' + esc(a.l);
      var go = r.querySelector('.mzf-go'); go.href = pr.h; go.textContent = 'Open the project →';
      go.hidden = !pr.h || pr.h === '#about';
      r.querySelector('.mzf-k').textContent = (k + 1) + ' / ' + n;
      var v = r.querySelector('.mzf-view'); if (v.hidden) { v.hidden = false; r.querySelector('.mzf-vx').focus({ preventScroll: true }); }
      /* warm the neighbours */
      [k + 1, k - 1].forEach(function (j) { var b = A[fam.list[(j + n) % n]]; var im = new Image(); im.src = b.t; });
    }
    function closeView() {
      var r = fam.root; r.querySelector('.mzf-view').hidden = true;
      var c = r.querySelector('.mzf-c[data-k="' + fam.i + '"]'); fam.i = -1;
      if (c) c.focus({ preventScroll: true });
    }
    function closeFamily() {
      var r = fam.root; if (!r) return;
      fam.open = false; fam.i = -1; r.classList.remove('on');
      document.documentElement.classList.remove('mzf-lock');
      setTimeout(function () { if (!fam.open) r.hidden = true; }, 220);
      selId = -1; kick();
      if (fam.last && fam.last.focus) try { fam.last.focus({ preventScroll: true }); } catch (e) { /* fine */ }
    }
  }
})();
