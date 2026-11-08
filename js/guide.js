/* 3Shamrocks Studio: Mini-Dave scripted guide, exploration achievements, sticky mobile "Let's talk" bar.
   Scripted only (no AI, not Dave). Nothing blocks the page: no scrim, no modal, no focus trap.
   Product pages load this file too; there it only records that the page was opened. */
(function () {
  'use strict';
  var W = window, D = document;
  /* the six homepage work tiles; EZRA, Milo and R&K pages all count as the one Concept Lab */
  var PRODUCTS = ['shomer', 'lickpick', 'trashure-hunters', 'chore-royale', 'fairent', 'concepts'];
  var ALIAS = { ezra: 'concepts', milo: 'concepts', rk: 'concepts' };
  var KEY_XP = 's3.xp', KEY_ACH = 's3.ach', KEY_OFF = 's3.guide.off', KEY_SEEN = 's3.guide.seen';
  var MAIL = 'mailto:dave@3shamrocks.com?subject=New%20project';

  function get(st, k) { try { return W[st].getItem(k); } catch (e) { return null; } }
  function set(st, k, v) { try { W[st].setItem(k, v); } catch (e) { /* not remembered */ } }
  function json(k, d) { try { return JSON.parse(get('localStorage', k)) || d; } catch (e) { return d; } }
  function slugOf(href) {
    var m = /(?:^|\/)work\/([a-z0-9-]+)\.html/.exec(href || '');
    var s = m && (ALIAS[m[1]] || m[1]);
    return s && PRODUCTS.indexOf(s) > -1 ? s : null;
  }
  function record(slug) {
    if (!slug) return;
    var xp = json(KEY_XP, {});
    if (!xp[slug]) { xp[slug] = Date.now(); set('localStorage', KEY_XP, JSON.stringify(xp)); }
  }

  /* product page: record the open and stop */
  var here = slugOf(location.pathname);
  if (here || /\/work\//.test(location.pathname)) { record(here); return; }
  if (!D.querySelector('.hero')) return;

  var RM = W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function sfx(n) { D.dispatchEvent(new CustomEvent('s3:sfx', { detail: n })); }
  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var mobile = W.matchMedia('(max-width:700px)');

  /* opens from the homepage count too (cards, devices, footer) */
  D.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('a[href],[data-href]');
    if (t) record(slugOf(t.getAttribute('href') || t.getAttribute('data-href')));
  }, true);

  /* ---------- achievements: real counts from this visitor's own opens, at most 3 ever ---------- */
  var TIERS = [[1, 'First Look'], [3, 'Explorer'], [6, 'Completionist']];
  var live = el('div', 'gd-live'); live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
  D.body.appendChild(live);
  function achievements() {
    var xp = json(KEY_XP, {}), n = 0, seen = json(KEY_ACH, []), hit = null;
    PRODUCTS.forEach(function (p) { if (xp[p]) n++; });
    TIERS.forEach(function (t) { if (n >= t[0] && seen.indexOf(t[1]) < 0) { hit = t; seen.push(t[1]); } });
    if (!hit) return;
    set('localStorage', KEY_ACH, JSON.stringify(seen));
    var toast = el('div', 'gd-toast',
      '<span class="gd-toast-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3a5 5 0 0 1-10 0V4Zm-3 1h3v2a3 3 0 0 1-3-2Zm16 0h-3v2a3 3 0 0 0 3-2ZM10 13h4l-.5 3h2v3h-7v-3h2Z"/></svg></span>' +
      '<span class="gd-toast-tx"><small>Achievement unlocked</small><b>' + hit[1] + '</b><em>' + n + ' of ' + PRODUCTS.length + ' work pages opened</em>' +
      '<i class="gd-toast-bar" aria-hidden="true"><i style="width:' + Math.round(n / PRODUCTS.length * 100) + '%"></i></i></span>');
    live.appendChild(toast);
    requestAnimationFrame(function () { requestAnimationFrame(function () { toast.classList.add('in'); }); });
    sfx('assemble');
    setTimeout(function () { toast.classList.remove('in'); setTimeout(function () { toast.remove(); }, 400); }, 4000);
  }
  setTimeout(achievements, 1200);

  /* ---------- sticky mobile CTA ---------- */
  var bar = el('div', 'gd-bar', '<span>Got something worth building?</span><a class="gd-bar-cta" href="' + MAIL + '">Let\'s talk</a>');
  bar.setAttribute('aria-hidden', 'true'); bar.querySelector('a').tabIndex = -1;
  D.body.appendChild(bar);
  var heroOut = false, endIn = false, panelOpen = false, raf = 0;
  function barUpdate() {
    raf = 0;
    var show = mobile.matches && heroOut && !endIn && !panelOpen;
    if (show) {
      var dots = D.querySelector('.car-dots'), r = dots && dots.getBoundingClientRect();
      if (r && r.height && r.bottom > innerHeight - 84 && r.top < innerHeight) show = false;
    }
    if (show !== bar.classList.contains('on')) {
      bar.classList.toggle('on', show); bar.setAttribute('aria-hidden', show ? 'false' : 'true');
      bar.querySelector('a').tabIndex = show ? 0 : -1;
      D.documentElement.classList.toggle('gd-bar-on', show);
    }
  }
  function q() { if (!raf) raf = requestAnimationFrame(barUpdate); }
  if ('IntersectionObserver' in W) {
    new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; q(); }).observe(D.querySelector('.hero'));
    var ends = [D.getElementById('contact'), D.querySelector('footer')].filter(Boolean), vis = new Set();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) vis.add(x.target); else vis.delete(x.target); });
      endIn = vis.size > 0; q();
    }, { rootMargin: '0px 0px 120px 0px' });
    ends.forEach(function (x) { io.observe(x); });
  }
  addEventListener('scroll', q, { passive: true }); addEventListener('resize', q);

  /* ---------- Mini-Dave scripted guide ---------- */
  var SCRIPT = {
    start: { say: 'Hey, I\'m Mini-Dave, Dave\'s scripted sidekick (not Dave). What brings you here?',
      opts: [['I need a product designer', 'designer'], ['Show me games', 'games'], ['Show me health/safety work', 'health'], ['Just looking', 'look']] },
    designer: { say: 'Good call. Dave takes an idea from rough sketch to a working product. Find your fit in a minute, or just tell him what you\'re building.',
      go: [['Find your fit \u00b7 60 sec', 'work-with-me.html', 1], ['Let\'s talk', MAIL]] },
    games: { say: 'Pick your quest. These ones are real and built in the studio.',
      go: [['Trashure-Hunters', 'work/trashure-hunters.html'], ['Chore Royale', 'work/chore-royale.html'], ['Rookie & King', 'work/rk.html', 0, 1]] },
    health: { say: 'Dave spent 10+ years in HealthTech. Start here, then the safety app.',
      go: [['HealthTech work', 'work/healthtech.html'], ['SH✡MER safety app', 'work/shomer.html']] },
    look: { say: 'Wander freely. Every product page you open counts toward a badge.',
      go: [['Browse the work', '#work'], ['See the brands', '#identity']] }
  };
  /* once the homepage has its Concept Lab tile, concept links point at work/concepts.html */
  function useLab() { SCRIPT.games.go.forEach(function (g) { if (g[3]) { g[0] = 'Concept Lab: Rookie & King'; g[1] = 'work/concepts.html'; } }); }
  var dismissed = get('localStorage', KEY_OFF) === '1';
  if (dismissed || get('sessionStorage', KEY_SEEN) === '1') return;

  var AV = '<span class="gd-av" aria-hidden="true"></span>';
  var bub = el('div', 'gd-bub',
    '<button type="button" class="gd-open" aria-expanded="false" aria-controls="gd-panel">' + AV +
    '<span class="gd-bub-tx"><b>Need a guide?</b><small>Mini-Dave · scripted guide</small></span></button>' +
    '<button type="button" class="gd-x gd-bub-x" aria-label="Dismiss Mini-Dave guide"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2 2 10"/></svg></button>');
  var panel = el('section', 'gd-panel',
    '<header class="gd-head">' + AV + '<span class="gd-name"><b>Mini-Dave</b><small> · scripted guide</small></span>' +
    '<button type="button" class="gd-x gd-close" aria-label="Close guide (Esc)"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2 2 10"/></svg></button></header>' +
    '<p class="gd-say" aria-live="polite"></p><div class="gd-opts"></div>');
  panel.id = 'gd-panel'; panel.setAttribute('aria-label', 'Mini-Dave, scripted guide'); panel.hidden = true;
  var openBtn = bub.querySelector('.gd-open'), say = panel.querySelector('.gd-say'), opts = panel.querySelector('.gd-opts');

  function words(s) {
    say.textContent = '';
    s.split(' ').forEach(function (w, i) {
      var sp = el('span'); sp.textContent = w + ' '; if (!RM) sp.style.animationDelay = (i * 32) + 'ms'; say.appendChild(sp);
    });
  }
  function step(id) {
    var s = SCRIPT[id]; words(s.say); opts.textContent = '';
    if (s.opts) s.opts.forEach(function (o, i) {
      var b = el('button', 'gd-opt'); b.type = 'button';
      b.innerHTML = '<kbd aria-hidden="true">' + (i + 1) + '</kbd><span></span>'; b.lastChild.textContent = o[0];
      b.addEventListener('click', function () { sfx('click'); step(o[1]); });
      opts.appendChild(b);
    });
    else {
      s.go.forEach(function (g) {
        var a = el('a', 'gd-opt gd-go' + (g[2] ? ' gd-pri' : '')); a.href = g[1];
        a.innerHTML = '<span></span><i aria-hidden="true">→</i>'; a.firstChild.textContent = g[0];
        a.addEventListener('click', function (e) {
          sfx('click');
          if (g[1].charAt(0) === '#') {
            var t = D.querySelector(g[1]); if (!t) return; e.preventDefault(); close(false);
            scrollTo({ top: t.getBoundingClientRect().top + scrollY - 64, behavior: RM ? 'auto' : 'smooth' });
          }
        });
        opts.appendChild(a);
      });
      var back = el('button', 'gd-back', '← Back'); back.type = 'button';
      back.addEventListener('click', function () { step('start'); opts.querySelector('.gd-opt').focus(); });
      opts.appendChild(back);
    }
  }
  function open() {
    if (panelOpen) return; panelOpen = true; q();
    step('start'); panel.hidden = false; bub.classList.add('gd-hide');
    openBtn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { panel.classList.add('in'); });
    sfx('swipe');
    setTimeout(function () { var f = opts.querySelector('.gd-opt'); if (f) f.focus({ preventScroll: true }); }, RM ? 0 : 60);
  }
  function close(refocus) {
    if (!panelOpen) return; panelOpen = false; q();
    panel.classList.remove('in'); openBtn.setAttribute('aria-expanded', 'false'); bub.classList.remove('gd-hide');
    setTimeout(function () { if (!panelOpen) panel.hidden = true; }, RM ? 0 : 260);
    if (refocus !== false) openBtn.focus({ preventScroll: true });
  }
  function dismiss() {
    set('localStorage', KEY_OFF, '1'); bub.classList.remove('in'); close(false);
    setTimeout(function () { bub.remove(); panel.remove(); }, 300);
  }
  openBtn.addEventListener('click', function () { sfx('click'); open(); });
  bub.querySelector('.gd-bub-x').addEventListener('click', function () { sfx('click'); dismiss(); });
  panel.querySelector('.gd-close').addEventListener('click', function () { sfx('click'); close(); });
  D.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panelOpen && !e.defaultPrevented) { e.preventDefault(); close(); }
    else if (panelOpen && /^[1-4]$/.test(e.key) && panel.contains(D.activeElement)) {
      var b = opts.querySelectorAll('.gd-opt')[+e.key - 1]; if (b) b.click();
    }
  });

  /* step aside while the contact forest is on screen, so the bubble never covers its text */
  var ctSec = D.getElementById('contact');
  if (ctSec && 'IntersectionObserver' in W) new IntersectionObserver(function (es) { bub.classList.toggle('gd-away', es[0].isIntersecting); }, { rootMargin: '0px 0px -20% 0px' }).observe(ctSec);
  var shown = false, timer = 0;
  function reveal() {
    if (shown) return; shown = true; clearTimeout(timer); removeEventListener('scroll', depth);
    set('sessionStorage', KEY_SEEN, '1');
    D.body.appendChild(bub); D.body.appendChild(panel);
    if (D.querySelector('[href$="work/concepts.html"],[data-href$="work/concepts.html"]')) useLab();
    requestAnimationFrame(function () { requestAnimationFrame(function () { bub.classList.add('in'); }); });
    sfx('assemble');
  }
  function depth() {
    var h = D.documentElement.scrollHeight - innerHeight;
    if (h > 0 && scrollY / h >= 0.55) reveal();
  }
  addEventListener('scroll', depth, { passive: true });
  timer = setTimeout(reveal, 25000);
  W.__s3guide = { reveal: reveal };
})();
