/* 3Shamrocks Studio: "20 years" hologram portrait.
   A three.js point cloud + depth mesh built from Dave's real photo (assets/studio/dave-portrait-cut.webp)
   and a depth map estimated from that same photo (assets/studio/holo/dave-depth.png, Depth Anything V2 small).
   The face is never redrawn: every particle and texel takes its brightness from the original pixels.
   Interaction: leans toward the cursor / drag / tilt, explodes and reassembles on hover, morphs into the real
   brand heart (assets/studio/heart-on-dark.png) on click or tap, assembles from scattered particles on scroll-in.
   Fallback: if WebGL is missing, three.js fails to load, or prefers-reduced-motion is set, nothing changes and
   the existing static photo + backdrop stay as they are. */
(function () {
  'use strict';
  var vis = document.getElementById('about-visual');
  if (!vis) return;
  var img = vis.querySelector('img');
  if (!img) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  (function () { try { var c = document.createElement('canvas'); if (!(c.getContext('webgl2') || c.getContext('webgl'))) throw 0; } catch (e) { vis = null; } })();
  if (!vis) return;

  var THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var PHOTO = img.currentSrc || img.src;
  var DEPTH = 'assets/studio/holo/dave-depth.png';
  var HEART = 'assets/studio/heart-on-dark.png';
  var MOBILE = matchMedia('(pointer:coarse)').matches || Math.min(screen.width, screen.height) < 700;
  var N = MOBILE ? 16000 : 42000;
  var SEG = MOBILE ? [70, 96] : [130, 178];
  var ASPECT = 1098 / 800, HP = ASPECT, DZ = 0.34;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (window.THREE) return res();
      var s = document.createElement('script'); s.src = src; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = function () { window.THREE ? res() : rej(); }; s.onerror = rej; document.head.appendChild(s);
    });
  }
  function loadImg(src) {
    return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = src; });
  }
  function pixels(im, w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0, w, h);
    return g.getImageData(0, 0, w, h).data;
  }

  var started = false;
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting || started) return;
    started = true; io.disconnect();
    Promise.all([loadScript(THREE_SRC), loadImg(PHOTO), loadImg(DEPTH), loadImg(HEART)])
      .then(function (r) { build(r[1], r[2], r[3]); })
      .catch(function () { /* keep the static version */ });
  }, { rootMargin: '700px 0px' });
  io.observe(vis);

  /* brand palette ramp: deep violet shadows -> violet -> teal mids -> green -> pale mint highlights */
  var RAMP = 'vec3 ramp(float l){' +
    'vec3 c0=vec3(.10,.04,.24),c1=vec3(.51,.22,.92),c2=vec3(.18,.72,.79),c3=vec3(.55,.89,.42),c4=vec3(.78,1.,.84);' +
    'if(l<.3)return mix(c0,c1,l/.3);if(l<.55)return mix(c1,c2,(l-.3)/.25);if(l<.8)return mix(c2,c3,(l-.55)/.25);return mix(c3,c4,(l-.8)/.2);}';

  function build(photo, depthImg, heartImg) {
    var T = window.THREE;
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' }); }
    catch (e) { return; }
    var cv = renderer.domElement;
    cv.className = 'holo-gl'; cv.setAttribute('aria-hidden', 'true');
    renderer.setClearColor(0x000000, 0);

    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(32, 800 / 1098, 0.1, 20);
    var VIEW_H = 1.46, CAMZ = (VIEW_H / 2) / Math.tan(16 * Math.PI / 180);
    cam.position.set(0, 0, CAMZ);

    var rig = new T.Group(); scene.add(rig);
    var holo = new T.Group(); holo.scale.setScalar(0.9); holo.position.y = 0.07; rig.add(holo);
    var pivot = new T.Vector3(0, 0.3, 0.12);

    /* ---- source data ---- */
    var PW = 400, PH = 549, DW = 378, DH = 518;
    var pp = pixels(photo, PW, PH), dp = pixels(depthImg, DW, DH);
    function depthAt(u, v) {
      var x = Math.min(DW - 1, Math.max(0, Math.round(u * (DW - 1)))), y = Math.min(DH - 1, Math.max(0, Math.round(v * (DH - 1))));
      return dp[(y * DW + x) * 4] / 255;
    }
    function lumAt(i) { return (0.299 * pp[i] + 0.587 * pp[i + 1] + 0.114 * pp[i + 2]) / 255; }

    /* ---- particles: weighted toward the face so the likeness carries ---- */
    var cand = [], wsum = 0;
    for (var y = 0; y < PH; y++) for (var x = 0; x < PW; x++) {
      var i = (y * PW + x) * 4; if (pp[i + 3] < 140) continue;
      var u = x / PW, v = y / PH, w = 1;
      if (v < 0.58 && Math.abs(u - 0.43) < 0.24) w = 3.2; /* head + beard */
      var wr = w; w *= 0.35 + lumAt(i); cand.push(x, y, w, wr); wsum += w;
    }
    var hp = pixels(heartImg, 183, 133), hearts = [];
    for (var hy = 0; hy < 133; hy++) for (var hx = 0; hx < 183; hx++) {
      var k = (hy * 183 + hx) * 4; if (hp[k + 3] < 200) continue;
      var hl = (hp[k] + hp[k + 1] + hp[k + 2]) / 765; if (hl < 0.22) continue; /* skip the dark outline */
      hearts.push(hx / 183, hy / 133, hp[k] / 255, hp[k + 1] / 255, hp[k + 2] / 255);
    }
    var HN = hearts.length / 5;

    var pos = new Float32Array(N * 3), sca = new Float32Array(N * 3), hrt = new Float32Array(N * 3),
      col = new Float32Array(N * 3), hcol = new Float32Array(N * 3), rnd = new Float32Array(N * 4);
    /* cumulative weights for sampling */
    var C = cand.length / 4, cum = new Float32Array(C), acc = 0;
    for (var c = 0; c < C; c++) { acc += cand[c * 4 + 2]; cum[c] = acc; }
    function pick() { var r = Math.random() * acc, lo = 0, hi = C - 1; while (lo < hi) { var m = (lo + hi) >> 1; if (cum[m] < r) lo = m + 1; else hi = m; } return lo; }
    for (var n = 0; n < N; n++) {
      var ci = pick(), px = cand[ci * 4] + Math.random(), py = cand[ci * 4 + 1] + Math.random();
      var pu = px / PW, pv = py / PH, pi = ((py | 0) * PW + (px | 0)) * 4;
      var L = lumAt(pi);
      pos[n * 3] = pu - 0.5; pos[n * 3 + 1] = (0.5 - pv) * HP; pos[n * 3 + 2] = depthAt(pu, pv) * DZ + (Math.random() - 0.5) * 0.004;
      col[n * 3] = L; col[n * 3 + 1] = pp[pi + 3] / 255; col[n * 3 + 2] = 0.62 / (cand[ci * 4 + 3] * (0.35 + lumAt(((cand[ci * 4 + 1]) * PW + cand[ci * 4]) * 4))); /* density compensation: even brightness, true tonal range */
      /* scattered start: a wide shell around the bust */
      var th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1), R = 1.4 + Math.random() * 2.2;
      sca[n * 3] = Math.sin(ph) * Math.cos(th) * R; sca[n * 3 + 1] = Math.cos(ph) * R * 0.8; sca[n * 3 + 2] = Math.sin(ph) * Math.sin(th) * R * 0.6;
      /* the real brand heart, sampled pixel by pixel */
      var h = ((Math.random() * HN) | 0) * 5, hu = hearts[h] + (Math.random() - 0.5) / 183, hv = hearts[h + 1] + (Math.random() - 0.5) / 133;
      var hw = 0.98, hx2 = (hu - 0.5) * hw, hy2 = (0.5 - hv) * hw * (133 / 183);
      hrt[n * 3] = hx2; hrt[n * 3 + 1] = hy2 + 0.12; hrt[n * 3 + 2] = 0.16 + 0.1 * (1 - Math.min(1, (hx2 * hx2 + hy2 * hy2) * 6)) + (Math.random() - 0.5) * 0.02;
      hcol[n * 3] = hearts[h + 2]; hcol[n * 3 + 1] = hearts[h + 3]; hcol[n * 3 + 2] = hearts[h + 4];
      rnd[n * 4] = Math.random(); rnd[n * 4 + 1] = 0.6 + Math.random() * 0.8; rnd[n * 4 + 2] = Math.random(); rnd[n * 4 + 3] = Math.random();
    }
    var pg = new T.BufferGeometry();
    pg.setAttribute('position', new T.BufferAttribute(pos, 3));
    pg.setAttribute('aScatter', new T.BufferAttribute(sca, 3));
    pg.setAttribute('aHeart', new T.BufferAttribute(hrt, 3));
    pg.setAttribute('aCol', new T.BufferAttribute(col, 3));
    pg.setAttribute('aHeartCol', new T.BufferAttribute(hcol, 3));
    pg.setAttribute('aRnd', new T.BufferAttribute(rnd, 4));
    pg.boundingSphere = new T.Sphere(new T.Vector3(), 10);

    var U = {
      uTime: { value: 0 }, uAssemble: { value: 0 }, uExplode: { value: 0 }, uMorph: { value: 0 }, uGlitch: { value: 0 },
      uPR: { value: 1 }, uSize: { value: 4 }, uPtr: { value: new T.Vector3(0, 0, 0) }, uSweep: { value: 0 }, uFlick: { value: 1 }
    };
    var pmat = new T.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, depthTest: false, blending: T.CustomBlending, blendSrc: T.OneFactor, blendDst: T.OneFactor, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.OneFactor,
      vertexShader: [
        'attribute vec3 aScatter,aHeart,aCol,aHeartCol;attribute vec4 aRnd;',
        'uniform float uTime,uAssemble,uExplode,uMorph,uGlitch,uPR,uSize,uSweep;uniform vec3 uPtr;',
        'varying vec3 vCol;varying float vA;', RAMP,
        'float eio(float t){return t<.5?4.*t*t*t:1.-pow(-2.*t+2.,3.)/2.;}',
        'float h1(float n){return fract(sin(n)*43758.5453);}',
        'void main(){',
        ' float a=eio(clamp(uAssemble*1.7-aRnd.x*.7,0.,1.));',
        ' vec3 home=position;',
        ' vec3 sc=aScatter;float sw=(1.-a)*2.2;float cs=cos(sw),sn=sin(sw);sc.xz=mat2(cs,-sn,sn,cs)*sc.xz;',
        ' vec3 p=mix(sc,home,a);',
        ' float m=eio(clamp(uMorph*1.6-aRnd.x*.6,0.,1.));',
        ' p=mix(p,aHeart,m);',
        ' vec3 dir=normalize(home-vec3(0.,.25,-.25)+(aRnd.wzy-.5)*.5);',
        ' float e=uExplode*(.55+aRnd.w*1.3);',
        ' float ang=e*2.4*(aRnd.z-.5);float ec=cos(ang),es=sin(ang);',
        ' vec3 ex=dir*e*.9;ex.xz=mat2(ec,-es,es,ec)*ex.xz;p+=ex;',
        ' p.z+=sin(uTime*1.6+aRnd.z*6.283+home.y*9.)*.006*a;',
        ' vec2 d=p.xy-uPtr.xy;float dl=dot(d,d);float pk=uPtr.z*(1.-m)*exp(-dl*90.);p.xy+=normalize(d+1e-5)*pk*.07;p.z+=pk*.08;',
        ' float sl=floor(p.y*46.+floor(uTime*18.));',
        ' p.x+=uGlitch*(h1(sl*17.3)-.5)*.09*step(.72,h1(sl*3.7));',
        ' vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;',
        ' gl_PointSize=uSize*aRnd.y*uPR*(1.+e*.8+m*.35)/-mv.z;',
        ' float L=clamp((aCol.x-.06)*1.35,0.,1.);L=pow(L,.85);',
        ' vec3 hc=ramp(L);',
        ' float sweep=exp(-pow((home.y-uSweep)*18.,2.));',
        ' vCol=mix((hc*(.3+L*.8)+sweep*vec3(.5,1.,.8)*.5)*aCol.z,aHeartCol*.62,m);',
        ' vA=aCol.y*mix(1.,.8,clamp(e,0.,1.))*(.35+.65*a);',
        '}'].join('\n'),
      fragmentShader: [
        'varying vec3 vCol;varying float vA;uniform float uFlick;',
        'void main(){vec2 c=gl_PointCoord-.5;float d=dot(c,c);if(d>.25)discard;float s=1.-d*4.;s*=s;',
        ' gl_FragColor=vec4(vCol*s*vA*uFlick*.62,1.);}'].join('\n')
    });
    var points = new T.Points(pg, pmat); points.frustumCulled = false;

    /* ---- depth mesh carrying the actual photo, rendered as a hologram ---- */
    var mg = new T.PlaneGeometry(1, HP, SEG[0], SEG[1]);
    var mp = mg.attributes.position, muv = mg.attributes.uv;
    for (var vi = 0; vi < mp.count; vi++) mp.setZ(vi, depthAt(muv.getX(vi), 1 - muv.getY(vi)) * DZ);
    mg.computeVertexNormals();
    var tex = new T.Texture(photo); tex.minFilter = T.LinearFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
    var MU = { uTex: { value: tex }, uTime: U.uTime, uGlitch: U.uGlitch, uOpacity: { value: 0 }, uSweep: U.uSweep, uFlick: U.uFlick };
    var mmat = new T.ShaderMaterial({
      uniforms: MU, transparent: true, depthWrite: false, depthTest: false,
      vertexShader: [
        'varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying float vY;',
        'void main(){vUv=uv;vY=position.y;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}'].join('\n'),
      fragmentShader: [
        'uniform sampler2D uTex;uniform float uTime,uGlitch,uOpacity,uSweep,uFlick;',
        'varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying float vY;', RAMP,
        'float h1(float n){return fract(sin(n)*43758.5453);}',
        'float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}',
        'void main(){vec2 uv=vUv;',
        ' float sl=floor(uv.y*70.+floor(uTime*20.));uv.x+=uGlitch*(h1(sl*9.1)-.5)*.07*step(.7,h1(sl*2.3));',
        ' float ca=.0035+uGlitch*.014;',
        ' vec4 t=texture2D(uTex,uv);if(t.a<.02)discard;',
        ' float l=lum(t.rgb),lr=lum(texture2D(uTex,uv+vec2(ca,0.)).rgb),lb=lum(texture2D(uTex,uv-vec2(ca,0.)).rgb);',
        ' float L=pow(clamp((l-.05)*1.4,0.,1.),.85);',
        ' vec3 c=ramp(L)*(.25+L*.7);',
        ' c.r+=(lr-l)*1.6;c.b+=(lb-l)*1.6;c.g+=(lr-lb)*.3;',
        ' float fr=pow(1.-clamp(abs(dot(normalize(vN),normalize(vV))),0.,1.),2.2);',
        ' c+=vec3(.25,.85,.9)*fr*.9;',
        ' float scan=.78+.22*sin(gl_FragCoord.y*2.1-uTime*5.);',
        ' float sweep=exp(-pow((vY-uSweep)*16.,2.));c+=vec3(.45,1.,.75)*sweep*.35;',
        ' float a=t.a*uOpacity*scan*uFlick*smoothstep(.0,.16,vUv.y);',
        ' a*=1.-uGlitch*.25*step(.5,h1(floor(uTime*30.)));',
        ' gl_FragColor=vec4(c,a);}'].join('\n')
    });
    var mesh = new T.Mesh(mg, mmat); mesh.frustumCulled = false;
    holo.add(mesh); holo.add(points);
    mesh.renderOrder = 1; points.renderOrder = 2;

    /* ---- projector base and light cone ---- */
    var base = new T.Group(); base.position.set(0, -0.665, 0.12); base.rotation.x = -1.3; rig.add(base);
    var ringCols = [0x8be36a, 0x2fb7c9, 0x8239ea, 0x2fb7c9];
    var rings = [];
    [[0.30, 0.312], [0.24, 0.246], [0.17, 0.2], [0.36, 0.364]].forEach(function (r, ix) {
      var rg = new T.RingGeometry(r[0], r[1], 96, 1, 0, ix === 2 ? Math.PI * 1.35 : Math.PI * 2);
      var rm = new T.Mesh(rg, new T.MeshBasicMaterial({ color: ringCols[ix], transparent: true, opacity: ix === 3 ? 0.35 : 0.8, blending: T.CustomBlending, blendSrc: T.SrcAlphaFactor, blendDst: T.OneFactor, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.OneFactor, depthWrite: false, depthTest: false, side: T.DoubleSide }));
      rm.renderOrder = 0; base.add(rm); rings.push(rm);
    });
    var tickG = new T.BufferGeometry(), tk = [];
    for (var ti = 0; ti < 60; ti++) { var ta = ti / 60 * 6.283, r0 = ti % 5 ? 0.33 : 0.322; tk.push(Math.cos(ta) * r0, Math.sin(ta) * r0, 0, Math.cos(ta) * 0.345, Math.sin(ta) * 0.345, 0); }
    tickG.setAttribute('position', new T.Float32BufferAttribute(tk, 3));
    var ticks = new T.LineSegments(tickG, new T.LineBasicMaterial({ color: 0x8be36a, transparent: true, opacity: 0.5, blending: T.CustomBlending, blendSrc: T.SrcAlphaFactor, blendDst: T.OneFactor, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.OneFactor, depthTest: false }));
    base.add(ticks);
    var glow = new T.Mesh(new T.CircleGeometry(0.2, 48), new T.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, blending: T.CustomBlending, blendSrc: T.OneFactor, blendDst: T.OneFactor, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.OneFactor,
      vertexShader: 'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec2 vU;void main(){float d=length(vU-.5)*2.;float a=pow(1.-clamp(d,0.,1.),2.);gl_FragColor=vec4(vec3(.35,.95,.85)*a*.9,1.);}'
    }));
    base.add(glow);
    var CU = { uTime: U.uTime, uOp: { value: 0 } };
    var cone = new T.Mesh(new T.CylinderGeometry(0.62, 0.17, 1.08, 64, 1, true), new T.ShaderMaterial({
      uniforms: CU, transparent: true, depthWrite: false, depthTest: false, blending: T.CustomBlending, blendSrc: T.OneFactor, blendDst: T.OneFactor, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.OneFactor, side: T.DoubleSide,
      vertexShader: 'varying vec2 vU;varying vec3 vN;varying vec3 vV;void main(){vU=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
      fragmentShader: 'uniform float uTime,uOp;varying vec2 vU;varying vec3 vN;varying vec3 vV;void main(){float e=1.-abs(dot(vN,vV));float f=pow(1.-vU.y,1.6);float s=.75+.25*sin(vU.x*60.+uTime*1.5);vec3 c=mix(vec3(.18,.72,.79),vec3(.55,.89,.42),1.-vU.y);gl_FragColor=vec4(c*f*(.05+e*.16)*s*uOp,1.);}'
    }));
    cone.position.set(0, -0.665 + 0.54, 0.12); cone.renderOrder = 0; rig.add(cone);
    /* rising motes in the beam */
    var DN = MOBILE ? 90 : 180, dpos = new Float32Array(DN * 3), dr = new Float32Array(DN);
    for (var di = 0; di < DN; di++) { dr[di] = Math.random(); dpos[di * 3] = (Math.random() - 0.5); dpos[di * 3 + 2] = (Math.random() - 0.5); }
    var dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(dpos, 3)); dg.setAttribute('aR', new T.BufferAttribute(dr, 1));
    var dust = new T.Points(dg, new T.ShaderMaterial({
      uniforms: { uTime: U.uTime, uPR: U.uPR, uOp: CU.uOp }, transparent: true, depthWrite: false, depthTest: false, blending: T.CustomBlending, blendSrc: T.OneFactor, blendDst: T.OneFactor, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.OneFactor,
      vertexShader: 'attribute float aR;uniform float uTime,uPR;varying float vA;void main(){float t=fract(aR*7.3+uTime*(.05+aR*.06));float rad=.17+t*.42;vec3 p=vec3(position.x*rad*1.6,-.665+t*1.05,.12+position.z*rad*1.6);vA=sin(t*3.1416)*(.4+aR*.6);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(2.+aR*3.)*uPR*2.5/-mv.z;}',
      fragmentShader: 'uniform float uOp;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float d=dot(c,c);if(d>.25)discard;gl_FragColor=vec4(vec3(.6,1.,.8)*(1.-d*4.)*vA*uOp,1.);}'
    }));
    dust.frustumCulled = false; rig.add(dust);

    /* ---- mount ---- */
    var st = document.createElement('style');
    st.textContent = '.about-visual .holo-gl{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:2;touch-action:pan-y;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
      '.about-visual.holo-ready>img{opacity:0;transition:opacity .9s ease}' +
      '.about-visual.holo-ready::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(120% 80% at 50% 40%,rgba(8,4,22,.15),rgba(8,4,22,.55))}';
    document.head.appendChild(st);
    vis.classList.add('holo-ready');
    vis.appendChild(cv);
    var cw = 0, ch = 0, dpr = 1, maxDpr = MOBILE ? 1.5 : 1.75, quality = 1;
    function size() {
      var r = vis.getBoundingClientRect(); cw = Math.max(1, r.width); ch = Math.max(1, r.height);
      dpr = Math.min(maxDpr, window.devicePixelRatio || 1) * quality;
      renderer.setPixelRatio(dpr); renderer.setSize(cw, ch, false);
      cam.aspect = cw / ch; cam.updateProjectionMatrix();
      var cnt = Math.min(N, pg.drawRange.count), spacingPx = ch / VIEW_H * Math.sqrt(0.62 * HP * 0.81 / cnt);
      U.uSize.value = spacingPx * 1.45 * CAMZ; U.uPR.value = dpr;
    }
    size();
    new ResizeObserver(size).observe(vis);

    /* ---- input ---- */
    var tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, drag = null, dragX = 0, tiltOn = false;
    var ptrLocal = new T.Vector3(), ptrStr = 0, ptrTgt = 0, ndc = new T.Vector2(), ray = new T.Raycaster(), plane = new T.Plane(), hit = new T.Vector3();
    function setPtr(e) {
      var r = cv.getBoundingClientRect();
      ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1));
      ray.setFromCamera(ndc, cam);
      plane.setFromNormalAndCoplanarPoint(new T.Vector3(0, 0, 1).applyQuaternion(holo.getWorldQuaternion(new T.Quaternion())), holo.localToWorld(new T.Vector3(0, 0, 0.15)));
      if (ray.ray.intersectPlane(plane, hit)) { ptrLocal.copy(holo.worldToLocal(hit.clone())); }
    }
    addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = vis.getBoundingClientRect();
      tgt.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth * 0.45)));
      tgt.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.35)) / (innerHeight * 0.5)));
      var inside = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
      ptrTgt = inside ? 1 : 0; if (inside) setPtr(e);
    }, { passive: true });
    addEventListener('deviceorientation', function (e) {
      if (e.gamma == null || drag) return; tiltOn = true;
      tgt.x = Math.max(-1, Math.min(1, e.gamma / 28)); tgt.y = Math.max(-1, Math.min(1, (e.beta - 50) / 30));
    }, { passive: true });
    cv.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, y: e.clientY, sx: tgt.x, moved: false, type: e.pointerType };
      if (e.pointerType !== 'mouse') { setPtr(e); ptrTgt = 1; }
    });
    cv.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerType === 'mouse') return;
      var dx = e.clientX - drag.x; if (Math.abs(dx) > 8) drag.moved = true;
      tgt.x = Math.max(-1, Math.min(1, drag.sx + dx / (cw * 0.5))); setPtr(e);
    });
    function endDrag(e) {
      if (!drag) return; var d = drag; drag = null;
      if (d.type !== 'mouse') { ptrTgt = 0; if (!tiltOn) tgt.y = 0; }
      if (e.type === 'pointerup' && !d.moved) heart();
    }
    cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
    var lastBurst = -1e9;
    vis.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') burst(); });

    /* ---- timeline ---- */
    var now = 0, anims = [], assembleAt = -1, sweepAt = 1.2, glitchAt = 4, glitchEnd = 0;
    function burst() {
      if (assembleAt < 0 || now - assembleAt < 2.6 || now - lastBurst < 4.5 || U.uMorph.value > 0.01) return;
      lastBurst = now; anims.push({ k: 'burst', t: now }); glitchEnd = now + 0.22;
    }
    function heart() {
      if (assembleAt < 0 || now - assembleAt < 2.6 || anims.some(function (a) { return a.k === 'heart'; })) return;
      anims.push({ k: 'heart', t: now }); glitchEnd = now + 0.18;
    }
    function eo(t) { return 1 - Math.pow(1 - t, 3); }
    function eio(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    var vio = new IntersectionObserver(function (es) {
      var e = es[0]; visible = e.isIntersecting;
      if (visible && assembleAt < 0 && e.intersectionRatio > 0.25) assembleAt = now;
      if (visible) kick();
    }, { threshold: [0, 0.25, 0.5] });
    var visible = false, raf = 0, last = 0, fpsAcc = 0, fpsN = 0, tuned = false;
    vio.observe(vis);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    function kick() { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    var dbg = window.__holo = { fps: 0, n: N };
    function frame(ms) {
      raf = 0;
      if (!visible || document.hidden) return;
      var dt = Math.min(0.1, (ms - last) / 1000); last = ms; now += dt;
      /* adaptive quality: if the device can't hold ~50fps once assembled, thin the cloud and the pixel ratio */
      if (assembleAt >= 0 && now - assembleAt > 2.8 && !tuned) {
        fpsAcc += dt; fpsN++;
        if (fpsN === 90) {
          var fps = fpsN / fpsAcc; dbg.fps = Math.round(fps);
          if (fps < 48) { pg.setDrawRange(0, Math.max(9000, Math.floor(N * 0.6))); quality = 0.8; size(); dbg.n = pg.drawRange.count; }
          tuned = true;
        }
      }
      U.uTime.value = now;
      var asm = assembleAt < 0 ? 0 : Math.min(1, (now - assembleAt) / 2.6);
      U.uAssemble.value = asm;
      var ex = 0, mo = 0;
      anims = anims.filter(function (a) {
        var t = now - a.t;
        if (a.k === 'burst') { if (t > 2.2) return false; ex = Math.max(ex, t < 0.35 ? eo(t / 0.35) : 1 - eio(Math.min(1, (t - 0.55) / 1.6))); if (t < 0.55 && t >= 0.35) ex = Math.max(ex, 1); }
        if (a.k === 'heart') { if (t > 3.6) return false; mo = Math.max(mo, t < 1.1 ? t / 1.1 : t < 2.3 ? 1 : 1 - (t - 2.3) / 1.3); }
        return true;
      });
      U.uExplode.value = ex; U.uMorph.value = mo;
      MU.uOpacity.value = 0.78 * Math.pow(Math.max(0, (asm - 0.55) / 0.45), 1.5) * (1 - Math.min(1, ex * 1.6)) * (1 - Math.min(1, mo * 1.8));
      CU.uOp.value = Math.min(1, now * 0.8) * (1 + ex * 0.6 + mo * 0.4);
      /* scan sweep and glitch bursts */
      if (now > sweepAt) sweepAt = now + 5 + Math.random() * 3;
      var sp = 1 - (sweepAt - now) / 1.4; U.uSweep.value = sp >= 0 && sp <= 1 ? 0.75 - sp * 1.6 : 9;
      if (now > glitchAt) { glitchEnd = now + 0.09 + Math.random() * 0.16; glitchAt = now + 3 + Math.random() * 4.5; }
      U.uGlitch.value = now < glitchEnd ? 1 : 0;
      U.uFlick.value = 0.94 + 0.06 * Math.sin(now * 37) * Math.sin(now * 11.3) - (now < glitchEnd ? 0.12 : 0);
      /* lean toward the pointer */
      cur.x += (tgt.x - cur.x) * Math.min(1, dt * 4); cur.y += (tgt.y - cur.y) * Math.min(1, dt * 4);
      var idle = Math.sin(now * 0.35) * 0.06;
      holo.position.set(0, 0.07, 0);
      holo.rotation.set(cur.y * 0.22, cur.x * 0.55 + idle * (1 - Math.min(1, Math.abs(cur.x) * 3)), 0);
      holo.position.sub(pivot.clone().applyEuler(holo.rotation).multiplyScalar(0.9)).add(pivot.clone().multiplyScalar(0.9));
      rig.position.x = cur.x * 0.02;
      ptrStr += (ptrTgt - ptrStr) * Math.min(1, dt * 6); U.uPtr.value.set(ptrLocal.x, ptrLocal.y, ptrStr * asm);
      rings[0].rotation.z = now * 0.25; rings[1].rotation.z = -now * 0.4; rings[2].rotation.z = now * 0.9; ticks.rotation.z = -now * 0.08;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    }
    kick();
  }
})();
