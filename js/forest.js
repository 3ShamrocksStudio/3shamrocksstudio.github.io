/* 3Shamrocks homepage, contact section: the River of Three as a living scene.
   One WebGL quad warps the painted forest with hand-made masks (assets/studio/forest/forest-mask.png:
   R = water, G = shamrock leaves (R+G together = the two waterfalls), B = moss and canopy).
   Fireflies drift on curl noise, follow the pointer, scatter on tap; a tap on the water sends a ripple.
   Canvas2D fallback: fireflies plus a CSS shimmer on the water. Reduced motion: the still image only. */
(function () {
  'use strict';
  var sec = document.getElementById('contact'), bg = sec && sec.querySelector('.ct-bg'), img = bg && bg.querySelector('img');
  if (!bg || !img) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { bg.classList.add('fr-still'); return; }

  var MASK = 'assets/studio/forest/forest-mask.png?v=f1';
  var IW = 3, IH = 2;                       /* image aspect, 3:2 */
  var ANCHOR = [0.341, 0.578];              /* where the stem leaves the mound */
  var dpr = 1, W = 0, H = 0, map = [0, 0, 1, 1], t0 = performance.now(), T = 0, last = 0;
  var par = [0, 0], parT = [0, 0], hov = 0, hovT = 0, ripples = [], flies = [], sparks = [];
  var ptr = { x: 0, y: 0, on: false, at: 0, down: null };
  var running = false, visible = false, ready = false, raf = 0, maskData = null, mW = 0, mH = 0;
  var stats = { n: 0, cpu: 0, gap: 0, mode: '' };

  var cv = document.createElement('canvas'); cv.className = 'fr-gl'; cv.setAttribute('aria-hidden', 'true');
  bg.appendChild(cv);
  var gl = null;
  try { gl = cv.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' }); } catch (e) { gl = null; }
  var g2 = null;
  function use2D() {
    if (gl) { var c2 = document.createElement('canvas'); c2.className = 'fr-gl'; c2.setAttribute('aria-hidden', 'true'); bg.replaceChild(c2, cv); cv = c2; gl = null; }
    g2 = cv.getContext('2d'); bg.classList.add('fr-2d'); var w = document.createElement('i'); w.className = 'fr-water'; bg.appendChild(w); stats.mode = '2d';
  }
  stats.mode = 'webgl'; if (!gl) use2D();

  /* ---------- layout: replicate object-fit:cover + object-position + scale(--fk) ---------- */
  function cssNum(n, d) { var v = parseFloat(getComputedStyle(bg).getPropertyValue(n)); return isNaN(v) ? d : v; }
  function layout() {
    var r = bg.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height; if (!W || !H) return;
    var cw = Math.round(W * dpr), ch = Math.round(H * dpr); if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
    var fx = cssNum('--fx', 30) / 100, fy = cssNum('--fy', 50) / 100, k = cssNum('--fk', 1.05);
    var s = Math.max(W / IW, H / IH), dw = IW * s, dh = IH * s, ox = (W - dw) * fx, oy = (H - dh) * fy;
    /* then scaled by k about the box centre */
    map = [(ox - W / 2) * k + W / 2, (oy - H / 2) * k + H / 2, dw * k, dh * k];
    var n = W < 600 ? 34 : 54; while (flies.length < n) flies.push(fly()); flies.length = n;
  }
  function toUV(x, y) { return [(x - map[0]) / map[2], (y - map[1]) / map[3]]; }
  function maskAt(u, v) {
    if (!maskData || u < 0 || v < 0 || u >= 1 || v >= 1) return [0, 0, 0];
    var i = ((v * mH | 0) * mW + (u * mW | 0)) * 4; return [maskData[i] / 255, maskData[i + 1] / 255, maskData[i + 2] / 255];
  }

  /* ---------- fireflies ---------- */
  function fly() {
    var z = 0.35 + Math.random() * 0.65;
    return { x: Math.random() * (W || 400), y: (0.12 + Math.random() * 0.8) * (H || 400), z: z, vx: 0, vy: 0,
             ph: Math.random() * 6.28, sp: 0.8 + Math.random() * 1.6, f: 0, hue: Math.random() };
  }
  function psi(x, y, t) { return Math.sin(1.7 * x + 0.31 * t) * Math.cos(1.3 * y - 0.23 * t) + 0.5 * Math.sin(2.9 * y + 2.1 * x + 0.47 * t) + 0.35 * Math.cos(3.7 * x - 1.1 * y - 0.19 * t); }
  function step(dt) {
    var e = 0.01, sc = 3 / Math.max(W, H) * 2, active = ptr.on && T - ptr.at < 2.2;
    for (var i = 0; i < flies.length; i++) {
      var f = flies[i], X = f.x * sc, Y = f.y * sc;
      /* curl of the stream function: divergence-free drift */
      var cx = (psi(X, Y + e, T) - psi(X, Y - e, T)) / (2 * e), cy = -(psi(X + e, Y, T) - psi(X - e, Y, T)) / (2 * e);
      var tx = cx * 22 * f.z, ty = cy * 16 * f.z - 3;
      if (active) {
        var dx = ptr.x - f.x, dy = ptr.y - f.y, d = Math.sqrt(dx * dx + dy * dy) + 1, R = Math.max(220, W * 0.22);
        if (d < R) { var a = 1 - d / R; tx += (dx / d) * 120 * a - (dy / d) * 150 * a; ty += (dy / d) * 120 * a + (dx / d) * 150 * a; if (d < 40) { tx -= dx * 2; ty -= dy * 2; } }
      }
      var k = Math.min(1, dt * 2.2); f.vx += (tx - f.vx) * k; f.vy += (ty - f.vy) * k;
      f.x += f.vx * dt; f.y += f.vy * dt; f.f = Math.max(0, f.f - dt * 1.6);
      /* soft walls: drift back inside the scene */
      var m = 20; if (f.x < -m) f.x = W + m; else if (f.x > W + m) f.x = -m;
      if (f.y < H * 0.08) f.vy += 40 * dt * 10; else if (f.y > H * 0.94) f.vy -= 40 * dt * 10;
    }
    for (var j = sparks.length - 1; j >= 0; j--) { var s = sparks[j]; s.l -= dt; if (s.l <= 0) { sparks.splice(j, 1); continue; } s.vx *= 0.95; s.vy = s.vy * 0.95 + 30 * dt; s.x += s.vx * dt; s.y += s.vy * dt; }
  }
  function burst(x, y) {
    for (var i = 0; i < flies.length; i++) {
      var f = flies[i], dx = f.x - x, dy = f.y - y, d = Math.sqrt(dx * dx + dy * dy) + 1;
      if (d < 280) { var a = (1 - d / 280) * 520; f.vx += dx / d * a; f.vy += dy / d * a; f.f = 1; }
    }
    for (var k = 0; k < 22; k++) { var an = Math.random() * 6.28, v = 60 + Math.random() * 260; sparks.push({ x: x, y: y, vx: Math.cos(an) * v, vy: Math.sin(an) * v, l: 0.6 + Math.random() * 0.5, L: 1.1, z: 0.6 + Math.random() * 0.4 }); }
  }
  function sfx(n) { try { document.dispatchEvent(new CustomEvent('s3:sfx', { detail: n })); } catch (e) { /* no sound */ } }

  /* ---------- input ---------- */
  function local(e) { var r = bg.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  sec.addEventListener('pointermove', function (e) {
    var p = local(e); ptr.x = p[0]; ptr.y = p[1]; ptr.on = p[1] >= 0 && p[1] <= H; ptr.at = T;
    parT[0] = Math.max(-1, Math.min(1, p[0] / W * 2 - 1)); parT[1] = Math.max(-1, Math.min(1, p[1] / H * 2 - 1));
    var uv = toUV(p[0], p[1]), m = maskAt(uv[0], uv[1]); hovT = (m[1] > 0.3 && m[0] < 0.3) ? 1 : 0;
  }, { passive: true });
  sec.addEventListener('pointerleave', function () { ptr.on = false; hovT = 0; parT[0] = parT[1] = 0; }, { passive: true });
  sec.addEventListener('pointerdown', function (e) { var p = local(e); ptr.down = [p[0], p[1], T]; ptr.x = p[0]; ptr.y = p[1]; ptr.on = true; ptr.at = T; }, { passive: true });
  sec.addEventListener('pointerup', function (e) {
    var d = ptr.down; ptr.down = null; if (!d || !ready || (e.target.closest && e.target.closest('a,button'))) return;
    var p = local(e); if (Math.abs(p[0] - d[0]) + Math.abs(p[1] - d[1]) > 14 || p[1] < 0 || p[1] > H) return;
    if (e.pointerType !== 'mouse') hovT = 0;
    burst(p[0], p[1]); sfx('click');
    var uv = toUV(p[0], p[1]), m = maskAt(uv[0], uv[1]);
    if (m[0] > 0.3) { ripples.unshift([uv[0], uv[1], T]); ripples.length = Math.min(ripples.length, 4); setTimeout(function () { sfx('swipe'); }, 160); }
    if (m[1] > 0.3 && m[0] < 0.3) { hov = 1.6; }
  }, { passive: true });

  /* ---------- WebGL ---------- */
  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform sampler2D uI,uM;uniform vec2 uR;uniform vec4 uMap;uniform float uT,uH;uniform vec2 uP,uA;uniform vec4 uRp[4];',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}',
    'float fb(vec2 p){return n(p)*.6+n(p*2.07+3.1)*.3+n(p*4.13+7.7)*.1;}',
    'void main(){',
    ' vec2 px=vec2(gl_FragCoord.x,uR.y-gl_FragCoord.y);',
    ' vec2 uv=(px-uMap.xy)/uMap.zw;',
    /* depth for parallax: far forest at the centre-top, near ground at the bottom and the sides */
    ' float dep=smoothstep(.42,1.,uv.y)*.85+(1.-smoothstep(0.,.3,min(uv.x,1.-uv.x)))*.3;',
    ' vec3 m0=texture2D(uM,uv).rgb;dep=max(dep,m0.g*(1.-m0.r)*.45);',
    ' uv+=uP*(dep-.3)*vec2(.016,.012);',
    ' vec3 m=texture2D(uM,uv).rgb;',
    ' float wat=m.r,fall=min(m.r,m.g)*1.6,leaf=clamp(m.g-m.r*2.,0.,1.),fol=m.b,t=uT;',
    /* shamrock: sway and breathe around the stem, flutter more under the pointer */
    ' vec2 q=(uv-uA)*vec2(1.5,1.);float L=length(q);',
    ' float th=sin(t*.85)*.016+sin(t*1.9+1.)*.006+uH*sin(t*7.+q.x*18.)*.02;',
    ' float br=1.+sin(t*1.25)*.01+uH*.012;',
    ' float c=cos(th),s=sin(th);vec2 qr=vec2(c*q.x+s*q.y,-s*q.x+c*q.y)/br;',
    ' qr+=vec2(sin(t*2.3+q.y*16.),cos(t*2.+q.x*13.))*.0024*(1.+uH*2.5)*smoothstep(.02,.25,L);',
    ' uv=mix(uv,uA+qr/vec2(1.5,1.),leaf);',
    /* moss and canopy: a slow breeze */
    ' uv+=fol*vec2(sin(t*1.1+uv.y*9.+uv.x*6.)*.0016,cos(t*.9+uv.x*7.)*.0008);',
    /* water: flow toward the viewer and left, the falls straight down and faster */
    ' float a1=.5,a2=.5,rh=0.;vec2 wd=vec2(0.);',
    ' if(wat>.004){',
    ' vec2 F=normalize(mix(vec2(-.45,1.),vec2(0.,1.),clamp(fall,0.,1.)));',
    ' float sp=.035+clamp(fall,0.,1.)*.22;',
    ' vec2 wq=uv*vec2(34.,52.);vec2 fl=F*t*sp*vec2(34.,52.);',
    ' a1=fb(wq-fl);a2=fb(wq*1.7+vec2(5.2,1.3)-fl*1.6);',
    ' wd=(vec2(a1,a2)-.5)*.0065*wat;',
    /* ripples from taps */
    ' for(int i=0;i<4;i++){vec4 r=uRp[i];if(r.w<=0.)continue;vec2 d=(uv-r.xy)*vec2(1.5,1.);float dl=length(d)+1e-4,ag=r.z,ring=ag*.11;',
    '  float w=exp(-pow((dl-ring)*24.,2.))*exp(-ag*1.1)*r.w;wd+=d/dl*sin((dl-ring)*120.)*w*.009;rh+=w*max(0.,sin((dl-ring)*120.+1.2));}',
    ' uv+=wd*smoothstep(.05,.5,wat);}',
    ' vec3 col=texture2D(uI,uv).rgb;',
    ' float lum=dot(col,vec3(.3,.59,.11));',
    /* caustic shimmer and foam */
    ' if(wat>.004){float cs=pow(1.-abs(sin((a1+a2)*6.+t*.4)),6.);',
    ' col+=vec3(.55,.78,1.)*cs*wat*(.12+lum*.9)*.9;',
    ' if(fall>.01){float fo=n(vec2(uv.x*170.,uv.y*22.-t*3.2))*n(vec2(uv.x*90.,uv.y*14.-t*2.1));',
    ' col+=vec3(.8,.92,1.)*smoothstep(.25,.6,fo)*clamp(fall,0.,1.)*(.18+lum*.6);}',
    ' col+=vec3(.6,.85,1.)*rh*(.25+lum)*.9*smoothstep(.05,.5,wat);}',
    /* the painted firefly orbs twinkle; the light breathes */
    ' float orb=smoothstep(.55,.85,lum)*(1.-wat)*(1.-leaf)*step(col.b,col.r);',
    ' col+=col*orb*(n(uv*28.+t*.35)-.35)*1.1;',
    ' col*=.965+.035*sin(t*.6)+.012*n(vec2(t*1.7,0.));',
    /* the shamrock glows when you come close */
    ' if(uv.x>.08&&uv.x<.6&&uv.y>.2&&uv.y<.74){float hl=0.;for(int i=0;i<6;i++){float an=float(i)*1.047+t*.2;hl+=texture2D(uM,uv+vec2(cos(an),sin(an))*.028).g;}hl=hl/6.;',
    ' float halo=clamp(hl-leaf*.7,0.,1.)*(1.-wat);',
    ' col+=vec3(.55,1.,.5)*halo*(.06+uH*.32)+col*leaf*uH*.22;}',
    ' gl_FragColor=vec4(col,1.);',
    '}'].join('\n');
  var VSP = 'attribute vec4 a;uniform vec2 uR;varying float va;varying float vh;void main(){vec2 c=a.xy/uR*2.-1.;gl_Position=vec4(c.x,-c.y,0.,1.);gl_PointSize=a.z;va=fract(a.w);vh=floor(a.w)/1000.;}';
  var FSP = 'precision mediump float;varying float va;varying float vh;void main(){float d=length(gl_PointCoord-.5)*2.;float g=exp(-d*d*5.)*.55+exp(-d*d*40.);vec3 c=mix(vec3(1.,.93,.55),vec3(.75,1.,.55),vh);gl_FragColor=vec4(c*g*va,1.);}';

  var P1, P2, U1 = {}, U2 = {}, quad, pbuf, parr, texI, texM;
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function prog(v, f, names, U) { var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); names.forEach(function (n) { U[n] = gl.getUniformLocation(p, n); }); return p; }
  function tex(src) { var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
  function setupGL(mimg) {
    P1 = prog(VS, FS, ['uI', 'uM', 'uR', 'uMap', 'uT', 'uH', 'uP', 'uA', 'uRp'], U1);
    P2 = prog(VSP, FSP, ['uR'], U2);
    quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    pbuf = gl.createBuffer(); parr = new Float32Array(4 * 120);
    texI = tex(img); texM = tex(mimg);
  }
  function drawGL() {
    gl.viewport(0, 0, cv.width, cv.height); gl.disable(gl.BLEND);
    gl.useProgram(P1); gl.bindBuffer(gl.ARRAY_BUFFER, quad); var l1 = gl.getAttribLocation(P1, 'p'); gl.enableVertexAttribArray(l1); gl.vertexAttribPointer(l1, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texI); gl.uniform1i(U1.uI, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texM); gl.uniform1i(U1.uM, 1);
    gl.uniform2f(U1.uR, cv.width, cv.height); gl.uniform4f(U1.uMap, map[0] * dpr, map[1] * dpr, map[2] * dpr, map[3] * dpr);
    gl.uniform1f(U1.uT, T % 3600); gl.uniform1f(U1.uH, hov); gl.uniform2f(U1.uP, par[0], par[1]); gl.uniform2f(U1.uA, ANCHOR[0], ANCHOR[1]);
    var rp = new Float32Array(16); for (var i = 0; i < 4; i++) { var r = ripples[i]; if (r && T - r[2] < 3.5) { rp[i * 4] = r[0]; rp[i * 4 + 1] = r[1]; rp[i * 4 + 2] = T - r[2]; rp[i * 4 + 3] = 1; } }
    gl.uniform4fv(U1.uRp, rp);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    /* fireflies, additive */
    var k = 0;
    function put(x, y, size, a, hue) { if (k >= 120) return; parr[k * 4] = x * dpr; parr[k * 4 + 1] = y * dpr; parr[k * 4 + 2] = size * dpr; parr[k * 4 + 3] = Math.floor(hue * 999) + Math.min(0.999, Math.max(0, a)); k++; }
    eachFly(put);
    gl.useProgram(P2); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf); gl.bufferData(gl.ARRAY_BUFFER, parr.subarray(0, k * 4), gl.DYNAMIC_DRAW);
    var l2 = gl.getAttribLocation(P2, 'a'); gl.enableVertexAttribArray(l2); gl.vertexAttribPointer(l2, 4, gl.FLOAT, false, 0, 0);
    gl.uniform2f(U2.uR, cv.width, cv.height); gl.drawArrays(gl.POINTS, 0, k);
  }
  function eachFly(put) {
    for (var i = 0; i < flies.length; i++) {
      var f = flies[i], tw = 0.5 + 0.5 * Math.sin(T * f.sp + f.ph), a = (0.18 + 0.82 * tw * tw) * (0.45 + 0.55 * f.z) + f.f * 0.6;
      put(f.x + par[0] * (f.z - 0.4) * 30, f.y + par[1] * (f.z - 0.4) * 22, (10 + 20 * f.z) * (1 + f.f * 0.5), a, f.hue);
    }
    for (var j = 0; j < sparks.length; j++) { var s = sparks[j]; put(s.x, s.y, 18 * s.z, Math.min(1, 1.4 * s.l / s.L), 0.6); }
  }

  /* ---------- Canvas2D fallback ---------- */
  var spr = null;
  function draw2D() {
    if (!spr) { spr = document.createElement('canvas'); spr.width = spr.height = 64; var c = spr.getContext('2d'), gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,248,190,1)'); gr.addColorStop(0.18, 'rgba(240,238,134,.75)'); gr.addColorStop(0.5, 'rgba(190,240,120,.18)'); gr.addColorStop(1, 'rgba(190,240,120,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); }
    g2.setTransform(1, 0, 0, 1, 0, 0); g2.clearRect(0, 0, cv.width, cv.height); g2.globalCompositeOperation = 'lighter';
    eachFly(function (x, y, size, a) { g2.globalAlpha = Math.min(1, a); var s = size * dpr * 1.2; g2.drawImage(spr, x * dpr - s / 2, y * dpr - s / 2, s, s); });
    g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over';
  }

  /* ---------- loop, only while the section is on screen ---------- */
  function frame(now) {
    raf = 0; if (!running) return;
    var c0 = performance.now(), dt = Math.min(0.05, (now - (last || now)) / 1000);
    if (last) { stats.gap += now - last; } last = now; T = (now - t0) / 1000;
    par[0] += (parT[0] - par[0]) * 0.05; par[1] += (parT[1] - par[1]) * 0.05;
    hov += (hovT - hov) * (hov > 1 ? 0.04 : 0.07);
    step(dt);
    if (gl) drawGL(); else draw2D();
    stats.cpu += performance.now() - c0; stats.n++;
    raf = requestAnimationFrame(frame);
  }
  function update() {
    var go = visible && ready && !document.hidden;
    if (go && !running) { running = true; last = 0; layout(); raf = requestAnimationFrame(frame); }
    else if (!go && running) { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  }
  new IntersectionObserver(function (es) { visible = es[es.length - 1].isIntersecting; update(); }, { rootMargin: '120px 0px' }).observe(bg);
  document.addEventListener('visibilitychange', update);
  if (window.ResizeObserver) new ResizeObserver(function () { layout(); if (!running && ready && gl) drawGL(); }).observe(bg); else addEventListener('resize', layout);
  if (gl) cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); ready = false; update(); });

  /* ---------- boot: needs the scene image and the mask ---------- */
  function boot() {
    var m = new Image(); m.decoding = 'async';
    m.onload = function () {
      try {
        var c = document.createElement('canvas'); mW = c.width = 188; mH = c.height = 125; var x = c.getContext('2d'); x.drawImage(m, 0, 0, mW, mH); maskData = x.getImageData(0, 0, mW, mH).data;
      } catch (e) { maskData = null; }
      try { if (gl) setupGL(m); } catch (e) { use2D(); }
      layout(); ready = true; bg.classList.add('fr-on'); update();
    };
    m.src = MASK;
  }
  function whenImg() { if (img.complete && img.naturalWidth) boot(); else img.addEventListener('load', boot, { once: true }); }
  /* start loading once the section is near, so the homepage's first paint stays light */
  var near = new IntersectionObserver(function (es) { if (es[es.length - 1].isIntersecting) { near.disconnect(); if (img.loading === 'lazy') img.loading = 'eager'; whenImg(); } }, { rootMargin: '600px 0px' });
  near.observe(bg);

  window.__forest = { at: function (u, v) { var r = bg.getBoundingClientRect(); return [r.left + map[0] + u * map[2], r.top + map[1] + v * map[3]]; }, stats: function () { return { mode: stats.mode, frames: stats.n, cpuMs: stats.n ? +(stats.cpu / stats.n).toFixed(2) : 0, frameMs: stats.n > 1 ? +(stats.gap / (stats.n - 1)).toFixed(2) : 0, running: running }; } };
})();
