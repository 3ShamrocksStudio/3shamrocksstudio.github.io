/* SH✡MER Command · buyer funnel (staging) — shared config, prices, analytics + A/B harness.
   Nothing here loads a third-party script or sends data until an ID / mode is filled in below. */
(function (W, D) {
  'use strict';

  /* ═══ 1. PAYMENT — the one plug-in point (Morning / Green Invoice) ═══════════════════════════
     mode 'placeholder' : no payment yet — shows "התשלום יופעל בקרוב", sends nothing.
     mode 'link'        : Morning payment link per plan (paste the 4 links). Fastest; access is matched by payer email.
     mode 'api'         : POST the order to our Supabase function, which creates a Morning payment form
                          (/payments/form) with a notify URL and returns {url}. Most reliable for automatic access. */
  var PAY = { mode: 'placeholder', links: { pilot: '', s: '', m: '', l: '' }, endpoint: '' };

  /* ═══ 2. ANALYTICS — empty = off. ga4: existing SH✡MER GA4 id (G-…) · clarity: Microsoft Clarity project id ═══ */
  var ANALYTICS = { ga4: '', clarity: '' };

  /* ═══ 3. A/B — off until traffic allows (see PLAN.md). Arm 0 is always the default. ═══ */
  var AB = { enabled: false, tests: { hero_cta: ['demo', 'pilot'] } };

  /* ═══ Prices (PRICING.md, before VAT) ═══ */
  var VAT = 0.18; /* Israel VAT 18% since 1 Jan 2025 */
  var PLANS = {
    pilot: { key: 'pilot', name: 'פיילוט "קהילה שומרת"', short: 'פיילוט · 90 יום', price: 2500, period: 'ל־90 יום', residents: 'כל גודל עד 10,000 תושבים',
      note: 'מקוזז מהשנה הראשונה אם ממשיכים. ללא התחייבות להמשך.' },
    s: { key: 's', name: 'רישיון שנתי · עד 1,000 תושבים', short: 'עד 1,000 תושבים', price: 9900, period: 'לשנה', residents: 'עד 1,000 תושבים',
      note: 'שילמתם פיילוט? ה־₪2,500 מקוזזים.' },
    m: { key: 'm', name: 'רישיון שנתי · 1,000–5,000 תושבים', short: '1,000–5,000 תושבים', price: 18000, period: 'לשנה', residents: '1,000–5,000 תושבים',
      note: 'שילמתם פיילוט? ה־₪2,500 מקוזזים.' },
    l: { key: 'l', name: 'רישיון שנתי · 5,000–10,000 תושבים', short: '5,000–10,000 תושבים', price: 25000, period: 'לשנה', residents: '5,000–10,000 תושבים',
      note: 'שילמתם פיילוט? ה־₪2,500 מקוזזים.' }
  };
  var COUNCIL = { perResident: 2, min: 40000 };
  var CONTACT = 'dave@3shamrocks.com';

  function ils(n) { return '₪' + Math.round(n).toLocaleString('en-US'); }
  function withVat(n) { var v = Math.round(n * VAT); return { net: n, vat: v, total: n + v }; }
  function councilPrice(residents) { return Math.max(COUNCIL.min, Math.round((+residents || 0) * COUNCIL.perResident)); }

  /* ═══ storage (per-viewer convenience only; never required) ═══ */
  function sget(k) { try { return W.localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { W.localStorage.setItem(k, v); } catch (e) {} }

  /* ═══ analytics ═══ */
  var debug = /[?&]debug=1/.test(W.location.search);
  var buffer = [];
  function loadScript(src) { var s = D.createElement('script'); s.async = true; s.src = src; D.head.appendChild(s); }
  if (ANALYTICS.ga4) {
    W.dataLayer = W.dataLayer || [];
    W.gtag = function () { W.dataLayer.push(arguments); };
    W.gtag('js', new Date());
    W.gtag('config', ANALYTICS.ga4, { anonymize_ip: true });
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ANALYTICS.ga4));
  }
  if (ANALYTICS.clarity) {
    W.clarity = W.clarity || function () { (W.clarity.q = W.clarity.q || []).push(arguments); };
    loadScript('https://www.clarity.ms/tag/' + encodeURIComponent(ANALYTICS.clarity));
  }
  /* funnel events: view_landing · click_demo · demo_step · demo_complete · view_plans · select_plan ·
     checkout_step · pay_click · quote_created · partner_apply · contact_click · ab_exposure */
  function track(name, props) {
    props = props || {};
    var ev = { e: name, p: props, t: Date.now(), page: W.location.pathname };
    buffer.push(ev);
    if (debug) try { console.debug('[SC track]', name, props); } catch (e) {}
    try { if (W.gtag && ANALYTICS.ga4) W.gtag('event', name, props); } catch (e) {}
    try { if (W.clarity && ANALYTICS.clarity) W.clarity('event', name); } catch (e) {}
  }

  /* ═══ A/B: sticky assignment, arm 0 when disabled ═══ */
  function variant(test) {
    var arms = AB.tests[test]; if (!arms) return null;
    if (!AB.enabled) return arms[0];
    var key = 'sc_ab_' + test, v = sget(key);
    if (arms.indexOf(v) < 0) { v = arms[Math.floor(Math.random() * arms.length)]; sset(key, v); }
    track('ab_exposure', { test: test, arm: v });
    try { if (W.clarity && ANALYTICS.clarity) W.clarity('set', 'ab_' + test, v); } catch (e) {}
    return v;
  }
  /* elements: data-ab="test" data-ab-arm="armName" → only the assigned arm stays visible */
  function applyAB() {
    var els = D.querySelectorAll('[data-ab]'), seen = {};
    for (var i = 0; i < els.length; i++) {
      var t = els[i].getAttribute('data-ab');
      if (!(t in seen)) seen[t] = variant(t);
      if (els[i].getAttribute('data-ab-arm') !== seen[t]) els[i].hidden = true;
    }
  }

  /* click tracking: data-track="event" data-track-x="value" */
  D.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'), { x: el.getAttribute('data-track-x') || '' });
  });

  /* ═══ payment hand-off (checkout calls this) ═══ */
  function startPayment(order) {
    track('pay_click', { plan: order.plan, mode: PAY.mode });
    if (PAY.mode === 'link' && PAY.links[order.plan]) {
      W.location.href = PAY.links[order.plan];
      return Promise.resolve('redirect');
    }
    if (PAY.mode === 'api' && PAY.endpoint) {
      return fetch(PAY.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) })
        .then(function (r) { if (!r.ok) throw new Error('checkout ' + r.status); return r.json(); })
        .then(function (j) { if (j && j.url) { W.location.href = j.url; return 'redirect'; } throw new Error('no url'); });
    }
    return Promise.resolve('placeholder');
  }

  function toast(msg) {
    var t = D.getElementById('sc-toast');
    if (!t) { t = D.createElement('div'); t.id = 'sc-toast'; t.className = 'toast'; t.setAttribute('role', 'status'); D.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2400);
  }
  function copy(text) {
    var done = function () { toast('הועתק'); };
    try { if (navigator.clipboard && W.isSecureContext) return navigator.clipboard.writeText(text).then(done, fallback); } catch (e) {}
    fallback();
    function fallback() { var ta = D.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; D.body.appendChild(ta); ta.select(); try { D.execCommand('copy'); done(); } catch (e) {} ta.remove(); }
  }
  function mailto(subject, body) {
    return 'mailto:' + CONTACT + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  W.SC = { PAY: PAY, PLANS: PLANS, COUNCIL: COUNCIL, VAT: VAT, CONTACT: CONTACT, ils: ils, withVat: withVat,
    councilPrice: councilPrice, track: track, variant: variant, startPayment: startPayment, toast: toast,
    copy: copy, mailto: mailto, sget: sget, sset: sset, _buffer: buffer };

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', applyAB); else applyAB();
})(window, document);
