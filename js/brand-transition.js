/* 3Shamrocks Studio: brand transitions between the portfolio and each product page (Dave, 10 Nov).
   Leaving: a click on a product link plays a short full-screen moment in that product's own colours, logo and motif, then navigates.
   Arriving: the product page opens covered by the same moment and reveals itself in the same motif.
   Plain left click only; ctrl/cmd/shift/alt, middle click, keyboard (Enter) and reduced motion navigate normally.
   Load it as a plain <script> in <head> (not deferred), so an arriving page is covered before its first paint. */
(function () {
  'use strict';
  var D = document, W = window, H = D.documentElement;
  var ROOT = (function () { try { return new URL('../', D.currentScript.src).href; } catch (e) { return '/'; } })();
  var KEY = 's3-bt', ID = 's3bt';
  var rm = function () { return !!(W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches); };

  /* one entry per product: cover colour, logo, logo width, leave length (navigate after), arrive length (overlay removed after) */
  var B = {
    'shomer':           { bg: '#0A1628', logo: 'assets/studio/logos/shomer.png', lw: 'min(34vmin,230px)', lv: 760, ar: 820 },
    'lickpick':         { bg: '#FF2E88', logo: 'assets/studio/logos/lickpick.png', lw: 'min(28vmin,190px)', lv: 720, ar: 760 },
    'trashure-hunters': { bg: '#16163A', logo: 'assets/work/trashure-hunters/brand/logo-th26.webp', lw: 'min(40vmin,280px)', lv: 760, ar: 820 },
    'chore-royale':     { bg: '#1A0B3B', logo: 'assets/brand-v3/chore-royale/logo-stacked-600.webp', lw: 'min(42vmin,290px)', lv: 800, ar: 1500 },
    'fairent':          { bg: '#53D805', logo: 'assets/brand-v3/fairent/logo-on-green.webp', lw: 'min(38vmin,260px)', lv: 700, ar: 760 },
    'milo':             { bg: '#1A023B', logo: 'assets/work/milo/milo-v2-calm-face.webp?v=nc1', lw: 'min(34vmin,230px)', lv: 860, ar: 900 },
    'rk':               { bg: '#06133F', logo: 'assets/brand-v3/rk/logo-stacked.png?v=rk72', lw: 'min(30vmin,210px)', lv: 760, ar: 920 },
    'concepts':         { bg: '#1a023c', logo: '', lw: '0', lv: 760, ar: 920 },
    'healthtech':       { bg: '#F5F9FC', logo: 'assets/work/healthtech/vb-logo.png', lw: 'min(48vmin,300px)', lv: 760, ar: 820 }
  };
  var ALIAS = { 'shomer-nature': 'shomer', 'chore-wars': 'chore-royale' };

  var CSS = [
    '#s3bt{position:fixed;inset:0;z-index:2147483000;overflow:hidden;pointer-events:none;visibility:visible;contain:strict;-webkit-tap-highlight-color:transparent}',
    '#s3bt.lv{pointer-events:auto;cursor:progress}',
    '#s3bt *{animation-fill-mode:both;box-sizing:border-box}',
    '#s3bt .b{position:absolute;inset:0;background:var(--bg)}',
    '#s3bt .c{position:absolute;inset:0;display:grid;place-items:center;z-index:5}',
    '#s3bt .c img{display:block;width:var(--lw);height:auto;max-height:62vh;object-fit:contain;filter:drop-shadow(0 18px 30px rgba(0,0,0,.35))}',
    'html.s3bt-pre body{visibility:hidden}',
    /* SH✡MER: navy wipe with a gold edge, the badge stamps in, radar rings */
    '.bt-shomer .b{background:radial-gradient(120% 80% at 50% 40%,#243460,#0A1628 60%,#060F1E)}',
    '.bt-shomer .e{position:absolute;top:0;bottom:0;left:0;width:6px;z-index:4;background:linear-gradient(#F5C840,#C09020);box-shadow:0 0 24px 6px rgba(224,168,40,.55)}',
    '.bt-shomer .r{position:absolute;left:50%;top:50%;z-index:3;width:44vmin;height:44vmin;margin:-22vmin 0 0 -22vmin;border-radius:50%;border:2px solid #E0A828;opacity:0}',
    '.lv.bt-shomer .b{animation:btWipeIn .42s cubic-bezier(.7,0,.25,1)}',
    '.lv.bt-shomer .e{animation:btEdgeIn .42s cubic-bezier(.7,0,.25,1)}',
    '.lv.bt-shomer .c img{animation:btStamp .32s cubic-bezier(.3,.6,.3,1.2) .3s}',
    '.lv.bt-shomer .r{animation:btRing .6s ease-out .5s}.lv.bt-shomer .r+.r{animation-delay:.62s}',
    '.ar.bt-shomer .r{animation:btRing .6s ease-out}.ar.bt-shomer .r+.r{animation-delay:.12s}',
    '.ar.bt-shomer .c img{animation:btBadgeOut .34s ease-in .1s}',
    '.ar.bt-shomer .b{animation:btWipeOut .5s cubic-bezier(.7,0,.25,1) .3s}',
    '.ar.bt-shomer .e{animation:btEdgeOut .5s cubic-bezier(.7,0,.25,1) .3s}',
    '@keyframes btWipeIn{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}',
    '@keyframes btEdgeIn{from{transform:translateX(0)}to{transform:translateX(calc(100vw + 10px));opacity:0}}',
    '@keyframes btWipeOut{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(0 0 0 100%)}}',
    '@keyframes btEdgeOut{from{transform:translateX(-10px);opacity:1}to{transform:translateX(100vw)}}',
    '@keyframes btStamp{0%{opacity:0;transform:scale(2.4) rotate(-14deg)}70%{opacity:1;transform:scale(.93) rotate(2deg)}100%{opacity:1;transform:none}}',
    '@keyframes btBadgeOut{to{opacity:0;transform:scale(.8)}}',
    '@keyframes btRing{0%{opacity:0;transform:scale(.35)}8%{opacity:.95}100%{opacity:0;transform:scale(3.2)}}',
    /* LickPick: pink sweep, the yellow pick flicks across, a plucked string wave */
    '.bt-lickpick .b{background:radial-gradient(100% 70% at 50% 45%,#ff5aa2,#FF2E88 55%,#d81670)}',
    '.bt-lickpick .s{position:absolute;left:0;right:0;top:50%;height:120px;margin-top:-60px;z-index:4;overflow:visible}',
    '.bt-lickpick .s path{fill:none;stroke:#FFE600;stroke-width:4;stroke-linecap:round;vector-effect:non-scaling-stroke}',
    '.bt-lickpick .s path+path{stroke:#07060B;stroke-width:2;opacity:.35}',
    '.bt-lickpick .s g{transform-origin:50% 50%;transform-box:fill-box}',
    '.bt-lickpick .c{z-index:5}',
    '.lv.bt-lickpick .b{animation:btSweepIn .4s cubic-bezier(.6,0,.2,1)}',
    '.lv.bt-lickpick .c img{animation:btFlickIn .44s cubic-bezier(.2,.9,.25,1.25) .12s}',
    '.lv.bt-lickpick .s g{animation:btPluck .62s linear .3s}',
    '.ar.bt-lickpick .s g{animation:btPluck .62s linear}',
    '.ar.bt-lickpick .c img{animation:btFlickOut .4s cubic-bezier(.6,0,.8,.4) .12s}',
    '.ar.bt-lickpick .b{animation:btSweepOut .46s cubic-bezier(.6,0,.2,1) .26s}',
    '.ar.bt-lickpick .s{animation:btFade .3s ease .42s reverse}',
    '@keyframes btSweepIn{from{clip-path:polygon(0 0,0 0,-30% 100%,0 100%)}to{clip-path:polygon(0 0,130% 0,100% 100%,0 100%)}}',
    '@keyframes btSweepOut{from{clip-path:polygon(0 0,130% 0,130% 100%,-30% 100%)}to{clip-path:polygon(130% 0,130% 0,130% 100%,100% 100%)}}',
    '@keyframes btFlickIn{0%{opacity:0;transform:translateX(-75vw) rotate(-70deg)}100%{opacity:1;transform:none}}',
    '@keyframes btFlickOut{to{opacity:0;transform:translateX(75vw) rotate(60deg)}}',
    '@keyframes btPluck{0%{transform:scaleY(0)}12%{transform:scaleY(1)}28%{transform:scaleY(-.75)}44%{transform:scaleY(.5)}60%{transform:scaleY(-.3)}78%{transform:scaleY(.14)}100%{transform:scaleY(0)}}',
    '@keyframes btFade{from{opacity:0}to{opacity:1}}',
    /* Trashure-Hunters: a purple and orange portal swirls open, the stacked logo pops */
    '.bt-trashure-hunters .p{position:absolute;left:50%;top:50%;z-index:1;width:230vmax;height:230vmax;margin:-115vmax 0 0 -115vmax;border-radius:50%;background:conic-gradient(from 0deg,#5b2ad6,#FF6C00,#2a1278,#A78BFA,#FF6C00,#5b2ad6,#16163A,#5b2ad6)}',
    '.bt-trashure-hunters .b{z-index:2;background:radial-gradient(120% 80% at 50% 40%,#2e2e7a,#16163A 55%,#0A0A2E)}',
    '.lv.bt-trashure-hunters .p{animation:btPortalIn .5s cubic-bezier(.5,0,.3,1)}',
    '.lv.bt-trashure-hunters .b{animation:btIrisIn .4s cubic-bezier(.5,0,.3,1) .26s}',
    '.lv.bt-trashure-hunters .c img{animation:btPop .36s cubic-bezier(.3,1.6,.5,1) .4s}',
    '.ar.bt-trashure-hunters .c img{animation:btPopOut .3s cubic-bezier(.5,0,.8,.4)}',
    '.ar.bt-trashure-hunters .b{animation:btIrisOut .4s cubic-bezier(.6,0,.6,1) .06s}',
    '.ar.bt-trashure-hunters .p{animation:btPortalOut .5s cubic-bezier(.5,0,.7,1) .14s}',
    '@keyframes btPortalIn{from{transform:scale(0) rotate(-260deg)}to{transform:none}}',
    '@keyframes btPortalOut{from{transform:none}to{transform:scale(0) rotate(300deg)}}',
    '@keyframes btIrisIn{from{clip-path:circle(0% at 50% 50%)}to{clip-path:circle(75% at 50% 50%)}}',
    '@keyframes btIrisOut{from{clip-path:circle(75% at 50% 50%)}to{clip-path:circle(0% at 50% 50%)}}',
    '@keyframes btPop{0%{opacity:0;transform:scale(0) rotate(-10deg)}100%{opacity:1;transform:none}}',
    '@keyframes btPopOut{30%{transform:scale(1.12)}100%{opacity:0;transform:scale(0) rotate(12deg)}}',
    /* Chore Royale: the court drops in, the crowned logo lands, confetti in the palette */
    '.bt-chore-royale .b{background:radial-gradient(110% 80% at 50% 38%,#5B23C8,#3A1590 50%,#1A0B3B);border-bottom:6px solid #22E0C0}',
    '.bt-chore-royale .f{position:absolute;inset:0;z-index:6}',
    '.bt-chore-royale .f i{position:absolute;top:-6vh;width:10px;height:16px;border-radius:2px;background:var(--k);animation:btConf var(--t) cubic-bezier(.3,.2,.6,1) var(--w) both}',
    '.lv.bt-chore-royale .b{animation:btDrop .44s cubic-bezier(.3,1.35,.5,1)}',
    '.lv.bt-chore-royale .c img{animation:btCrown .46s cubic-bezier(.3,1.5,.5,1) .3s}',
    '.ar.bt-chore-royale .c img{animation:btCrownUp .32s ease-in}',
    '.ar.bt-chore-royale .b{animation:btLift .5s cubic-bezier(.6,0,.4,1) .2s}',
    '@keyframes btDrop{from{transform:translateY(-102%)}to{transform:none}}',
    '@keyframes btLift{from{transform:none}to{transform:translateY(-104%)}}',
    '@keyframes btCrown{0%{opacity:0;transform:translateY(-65vh) rotate(-8deg)}100%{opacity:1;transform:none}}',
    '@keyframes btCrownUp{to{opacity:0;transform:translateY(-14vh) scale(.9)}}',
    '@keyframes btConf{from{transform:translate3d(0,0,0) rotate(0)}to{transform:translate3d(var(--x),116vh,0) rotate(var(--r))}}',
    /* FaiRent: two green panels slide together (the mirrored R), the logo opens from the seam */
    '.bt-fairent .b{display:none}',
    '.bt-fairent .h{position:absolute;top:0;bottom:0;width:50.5%;background:#53D805}',
    '.bt-fairent .h.l{left:0;background:linear-gradient(90deg,#4cc805,#53D805)}',
    '.bt-fairent .h.r{right:0;background:linear-gradient(90deg,#53D805,#5fe010);box-shadow:-3px 0 0 #6550FF}',
    '.bt-fairent .c img{filter:none}',
    '.lv.bt-fairent .h.l{animation:btFromL .4s cubic-bezier(.65,0,.2,1)}',
    '.lv.bt-fairent .h.r{animation:btFromR .4s cubic-bezier(.65,0,.2,1)}',
    '.lv.bt-fairent .c img{animation:btSeam .32s cubic-bezier(.4,0,.2,1) .34s}',
    '.ar.bt-fairent .c img{animation:btSeam .28s cubic-bezier(.6,0,.6,1) reverse}',
    '.ar.bt-fairent .h.l{animation:btFromL .46s cubic-bezier(.65,0,.35,1) .22s reverse}',
    '.ar.bt-fairent .h.r{animation:btFromR .46s cubic-bezier(.65,0,.35,1) .22s reverse}',
    '@keyframes btFromL{from{transform:translateX(-101%)}to{transform:none}}',
    '@keyframes btFromR{from{transform:translateX(101%)}to{transform:none}}',
    '@keyframes btSeam{from{opacity:0;clip-path:inset(0 50% 0 50%)}to{opacity:1;clip-path:inset(0 0 0 0)}}',
    /* Milo: neon bubbles (violet, hot pink, ice cyan, magenta) bloom on night purple, like a breath */
    '.bt-milo .b{display:none}',
    '.bt-milo .u{position:absolute;left:var(--x);top:var(--y);width:var(--s);height:var(--s);margin:calc(var(--s)/-2) 0 0 calc(var(--s)/-2);border-radius:50%;background:var(--k)}',
    '.bt-milo .u.z{--x:50%;--y:50%;--s:260vmax;--k:radial-gradient(closest-side,#3a0f72,#2a0a55 30%,#1A023B 60%)}',
    '.bt-milo .c img{border-radius:50%;box-shadow:0 0 0 3px #1CBCF5,0 0 0 10px rgba(244,42,146,.25);filter:drop-shadow(0 14px 22px rgba(229,39,200,.35))}',
    '.lv.bt-milo .u{animation:btBloom .56s cubic-bezier(.35,0,.25,1) var(--w)}',
    '.lv.bt-milo .u.z{animation:btBloom .5s cubic-bezier(.4,0,.2,1) .3s}',
    '.lv.bt-milo .c img{animation:btBreath .4s ease-out .46s}',
    '.ar.bt-milo .c img{animation:btBreath .34s ease-in reverse}',
    '.ar.bt-milo .u.z{animation:btBloomOut .56s cubic-bezier(.5,0,.6,1) .2s}',
    '.ar.bt-milo .u:not(.z){animation:btFloat .7s ease-in var(--w)}',
    '@keyframes btBloom{0%{opacity:0;transform:scale(0)}60%{opacity:1}100%{opacity:1;transform:scale(1)}}',
    '@keyframes btBloomOut{0%{transform:scale(1);opacity:1}100%{transform:scale(0);opacity:.6}}',
    '@keyframes btFloat{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:translateY(-30vh) scale(.2)}}',
    '@keyframes btBreath{0%{opacity:0;transform:scale(.82)}100%{opacity:1;transform:none}}',
    /* Rookie & King, Concept Lab: the board flips in square by square, the rook-king mark rises */
    '.bt-rk .b,.bt-concepts .b{display:none}',
    '.bt-rk .g,.bt-concepts .g{position:absolute;inset:0;display:grid;grid-template-columns:repeat(var(--cols),1fr);grid-auto-rows:calc(100vw / var(--cols))}',
    '.bt-rk .g i{background:#0B1D55}.bt-rk .g i.d{background:#12286B}',
    '.bt-concepts .g i{background:#1a023c}.bt-concepts .g i.d{background:#3b1d8f}',
    '.bt-concepts .t{position:absolute;left:-10%;right:-10%;top:50%;z-index:5;padding:14px 0;transform:translateY(-50%) rotate(-8deg);text-align:center;font:800 clamp(22px,5vw,44px)/1 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:linear-gradient(90deg,#F0359A,#8b2fd6)}',
    '.lv .g i{animation:btSquare .26s cubic-bezier(.3,.6,.3,1) var(--w)}',
    '.ar .g i{animation:btSquare .26s cubic-bezier(.6,0,.7,.4) calc(.18s + var(--w)) reverse}',
    '.lv.bt-rk .c img{animation:btRise .34s cubic-bezier(.2,.8,.2,1) .4s}',
    '.ar.bt-rk .c img{animation:btRise .26s ease-in reverse}',
    '.lv.bt-concepts .t{animation:btFade .3s ease .36s}.ar.bt-concepts .t{animation:btFade .24s ease reverse}',
    '@keyframes btSquare{from{transform:perspective(400px) rotateY(90deg) scale(.6);opacity:0}to{transform:none;opacity:1}}',
    '@keyframes btRise{from{opacity:0;transform:translateY(30px) scale(.9)}to{opacity:1;transform:none}}',
    /* HealthTech (12 Nov, Dave): light ground, the VIBRANT capsule from its pack with its own vibration arcs; it buzzes, the arcs pulse out */
    '.bt-healthtech .b{background:radial-gradient(70% 55% at 50% 42%,#E3F2FC,#F5F9FC 62%,#fff)}',
    '.bt-healthtech .c{padding-top:min(30vmin,210px)}',
    '#s3bt.bt-healthtech .c img{filter:none}',
    '.bt-healthtech .v{position:absolute;left:50%;top:calc(50% - min(9vmin,62px));width:min(62vmin,400px);height:auto;z-index:6;overflow:visible;transform:translate(-50%,-50%) rotate(-16deg);color:#4A9EDD}',
    '.bt-healthtech .v g,.bt-healthtech .v path{transform-box:view-box}',
    '.bt-healthtech .v .p,.bt-healthtech .v .q{transform-origin:210px 120px}',
    '.bt-healthtech .v .a{opacity:var(--o)}',
    '.lv.bt-healthtech .b{animation:btRiseIn .42s cubic-bezier(.65,0,.25,1)}',
    '.lv.bt-healthtech .v .p{animation:btCapIn .32s cubic-bezier(.3,1.45,.5,1) .2s}',
    '.lv.bt-healthtech .v .q{animation:btBuzz .07s linear .46s 4}',
    '.lv.bt-healthtech .v .a{animation:btArcIn .42s ease-out calc(.4s + var(--d))}',
    '.lv.bt-healthtech .c img{animation:btRise .3s ease-out .4s}',
    '.ar.bt-healthtech .v .q{animation:btBuzz .07s linear 5}',
    '.ar.bt-healthtech .v .a{animation:btArcOut .46s ease-in var(--d)}',
    '.ar.bt-healthtech .v .p{animation:btCapOut .3s ease-in .3s}',
    '.ar.bt-healthtech .c img{animation:btLogoOut .3s ease-in .34s}',
    '.ar.bt-healthtech .b{animation:btRiseOut .48s cubic-bezier(.65,0,.35,1) .3s}',
    '@keyframes btCapIn{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:none}}',
    '@keyframes btCapOut{to{opacity:0;transform:scale(.85)}}',
    '@keyframes btLogoOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(14px) scale(.96)}}',
    '@keyframes btBuzz{0%,100%{transform:none}25%{transform:translate(-7px,3px) rotate(-1.6deg)}75%{transform:translate(7px,-3px) rotate(1.6deg)}}',
    '@keyframes btArcIn{0%{opacity:0;transform:scale(.82)}55%{opacity:1;transform:scale(1.07)}100%{opacity:var(--o);transform:none}}',
    '@keyframes btArcOut{0%{opacity:var(--o);transform:none}40%{opacity:1;transform:scale(1.08)}100%{opacity:0;transform:scale(1.2)}}',
    '@keyframes btRiseIn{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0 0 0 0)}}',
    '@keyframes btRiseOut{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(0 0 100% 0)}}'
  ].join('\n');

  function css() {
    if (D.getElementById(ID + '-css')) return;
    var st = D.createElement('style'); st.id = ID + '-css'; st.textContent = CSS;
    (D.head || H).appendChild(st);
  }

  function slugOf(u) {
    var m = /\/work\/([a-z0-9-]+)\.html$/.exec(u.pathname);
    if (!m) return null;
    var k = ALIAS[m[1]] || m[1];
    return B[k] ? k : null;
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* the overlay: base cover, the brand's motif pieces, its logo */
  function build(k, mode) {
    var b = B[k], el = D.createElement('div'), h = '';
    el.id = ID; el.className = mode + ' bt-' + k; el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--bg', b.bg); el.style.setProperty('--lw', b.lw);
    if (k === 'trashure-hunters') h += '<i class="p"></i>';
    if (k === 'fairent') h += '<i class="h l"></i><i class="h r"></i>';
    if (k === 'milo') {
      [['30%', '38%', '46vmin', '#6C31B5', 0], ['70%', '60%', '54vmin', '#F42A92', .06], ['58%', '26%', '34vmin', '#1CBCF5', .12], ['38%', '72%', '40vmin', '#E527C8', .16]].forEach(function (u) {
        h += '<i class="u" style="--x:' + u[0] + ';--y:' + u[1] + ';--s:' + u[2] + ';--k:' + u[3] + ';--w:' + u[4] + 's"></i>';
      });
      h += '<i class="u z"></i>';
    }
    h += '<i class="b"></i>';
    if (k === 'shomer') h += '<i class="e"></i><i class="r"></i><i class="r"></i>';
    if (k === 'lickpick') h += '<svg class="s" viewBox="0 0 1000 120" preserveAspectRatio="none"><g><path d="M0 60 Q125 0 250 60 T500 60 T750 60 T1000 60"/><path d="M0 60 Q125 120 250 60 T500 60 T750 60 T1000 60"/></g></svg>';
    if (k === 'healthtech') h += '<svg class="v" viewBox="0 0 420 240"><defs><linearGradient id="s3btvb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".38" stop-color="#F3F4F5"/><stop offset=".78" stop-color="#C6CACE"/><stop offset="1" stop-color="#A4A9AE"/></linearGradient><linearGradient id="s3btvh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#52ADE5"/><stop offset="1" stop-color="#4590D6"/></linearGradient></defs><g fill="none" stroke="currentColor" stroke-linecap="round"><path class="a" style="transform-origin:162px 120px;--o:0.95;--d:0.00s" d="M114.0 181.5A78 78 0 0 1 114.0 58.5" stroke-width="6"/><path class="a" style="transform-origin:258px 120px;--o:0.95;--d:0.00s" d="M306.0 58.5A78 78 0 0 1 306.0 181.5" stroke-width="6"/><path class="a" style="transform-origin:162px 120px;--o:0.62;--d:0.08s" d="M98.6 201.2A103 103 0 0 1 98.6 38.8" stroke-width="4.6"/><path class="a" style="transform-origin:258px 120px;--o:0.62;--d:0.08s" d="M321.4 38.8A103 103 0 0 1 321.4 201.2" stroke-width="4.6"/><path class="a" style="transform-origin:162px 120px;--o:0.34;--d:0.16s" d="M82.0 222.4A130 130 0 0 1 82.0 17.6" stroke-width="3.4"/><path class="a" style="transform-origin:258px 120px;--o:0.34;--d:0.16s" d="M338.0 17.6A130 130 0 0 1 338.0 222.4" stroke-width="3.4"/></g><g class="p"><g class="q"><rect x="113" y="71" width="194" height="98" rx="49" fill="url(#s3btvh)"/><rect x="113" y="71" width="194" height="98" rx="49" fill="none" stroke="#fff" stroke-width="7" pathLength="100" stroke-dasharray="54 3 9 3 31" stroke-linecap="round"/><rect x="135" y="93" width="150" height="54" rx="27" fill="url(#s3btvb)"/><path d="M213 94.5v51" stroke="#B5BABF" stroke-width="1.2" opacity=".7"/><rect x="150" y="99" width="118" height="10" rx="5" fill="#fff" opacity=".85"/></g></g></svg>';
    if (k === 'rk' || k === 'concepts') {
      var cols = W.innerWidth > W.innerHeight ? 10 : 6, rows = Math.ceil(W.innerHeight / (W.innerWidth / cols)) + 1, g = '';
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) g += '<i class="' + ((r + c) % 2 ? 'd' : '') + '" style="--w:' + ((r + c) * 0.022).toFixed(3) + 's"></i>';
      h += '<div class="g" style="--cols:' + cols + '">' + g + '</div>';
      if (k === 'concepts') h += '<i class="t">Concept Lab</i>';
    }
    if (b.logo) h += '<div class="c"><img alt="" decoding="sync" src="' + ROOT + b.logo + '"></div>';
    if (k === 'chore-royale') {
      var cs = ['#F5B92E', '#FFE38A', '#22E0C0', '#8B4DFF', '#FFFFFF'], f = '';
      for (var i = 0; i < 26; i++) f += '<i style="left:' + rnd(2, 98).toFixed(1) + '%;--k:' + cs[i % cs.length] + ';--t:' + rnd(.9, 1.35).toFixed(2) + 's;--w:' + (mode === 'lv' ? rnd(.26, .5) : rnd(0, .25)).toFixed(2) + 's;--x:' + rnd(-12, 12).toFixed(1) + 'vw;--r:' + rnd(-540, 540).toFixed(0) + 'deg"></i>';
      h += '<div class="f">' + f + '</div>';
    }
    el.innerHTML = h;
    return el;
  }

  function clear() { var o = D.getElementById(ID); if (o) o.remove(); H.classList.remove('s3bt-pre'); }

  /* ---- arriving: cover first, then reveal in the same motif ---- */
  var arr = null;
  try {
    var s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    sessionStorage.removeItem(KEY);
    if (s && B[s.k] && s.p === location.pathname && Date.now() - s.t < 8000 && !rm()) arr = s.k;
  } catch (e) {}
  if (arr) {
    css();
    var pre = D.createElement('style'); pre.textContent = 'html.s3bt-pre{background:' + B[arr].bg + '!important}';
    (D.head || H).appendChild(pre);
    H.classList.add('s3bt-pre');
    var safety = setTimeout(clear, 4000);
    var show = function () {
      var el = build(arr, 'ar');
      D.body.appendChild(el);
      H.classList.remove('s3bt-pre');
      clearTimeout(safety);
      setTimeout(function () { if (el.parentNode) el.remove(); }, B[arr].ar + 80);
    };
    if (D.body && D.readyState !== 'loading') show(); else D.addEventListener('DOMContentLoaded', show);
  }

  /* ---- leaving: plain left click on a product page link ---- */
  function leave(k, href) {
    css(); clear();
    var el = build(k, 'lv');
    D.body.appendChild(el);
    try { sessionStorage.setItem(KEY, JSON.stringify({ k: k, p: new URL(href).pathname, t: Date.now() })); } catch (e) {}
    setTimeout(function () { location.href = href; }, B[k].lv);
    setTimeout(function () { if (el.parentNode) el.remove(); }, 9000);
  }

  /* window, bubble phase: runs after the page's own handlers, so a tap that only switches a device on (preventDefault) is left alone */
  W.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.detail === 0 || rm()) return;
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var u; try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (u.origin !== location.origin || u.pathname === location.pathname) return;
    var k = slugOf(u); if (!k || D.getElementById(ID)) return;
    e.preventDefault();
    leave(k, u.href);
  });

  /* back/forward cache: never come back to a covered page */
  W.addEventListener('pageshow', function (e) { if (e.persisted) clear(); });

  /* warm the logo cache when a product link is hovered or touched, so the leaving overlay has its logo at once */
  var warmed = {};
  function warm(e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var u; try { u = new URL(a.href, location.href); } catch (err) { return; }
    var k = slugOf(u); if (!k || warmed[k] || !B[k].logo) return;
    warmed[k] = 1; var i = new Image(); i.src = ROOT + B[k].logo;
  }
  D.addEventListener('pointerover', warm, { passive: true });
  D.addEventListener('touchstart', warm, { passive: true });
})();
