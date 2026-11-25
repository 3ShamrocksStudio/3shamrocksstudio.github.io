/* =====================================================================
   J8NIX 15.0.0 (25 Nov 2026) · J8NIX 2.0 "Dispatch", slice 1. A new app on the same data engine (window.J8, j8-data.js);
   none of the older layers (app.js, j11.js, shell.js, j13.js) load. Direction + research: j8/design/V15-DIRECTION.md.
     Today      navy desk band (one sentence + 3 real numbers), Do this first (one item, open), Waiting for you (3),
                Your steps, Ready for you to send, While you were away (failed runs in 24 h).
     Approvals  waiting drafts (same-batch drafts as one row: Go all after 3 previews), Going out (Stop), Did they answer?
     Talk       one thread with J8 (J8.inbox.send to p-general).
     Settings   sending pause, template autopilot, language (English / Hebrew RTL), phone alerts, classic app, sign out.
   Verbs: Go (approve) · Hold (comes back tomorrow 08:00: j8_later row 'tk-<task>' / 'b-one-<draft>', the app's item keys) · Stop (kill) · Change.
   Routine actions use Undo (6 s), never "Are you sure?". All dynamic text is escaped; links are https only.
   The classic 14.1 app stays at /j8/classic/. Revert: git revert of the 15.0.0 commit.
   ===================================================================== */
(function () {
  'use strict';
  var VER = '15.0.0', TZ = 'Asia/Jerusalem';
  var J = function () { return window.J8 || null; };
  var S = { v: 'today', open: '__first__', rank: null, rankAt: 0, lint: null, lintAt: 0, arm: {}, talk: '', ask: {}, askOpen: null, editing: null, edit: {},
    goAll: false, ocAll: false, stepsAll: false, unbatch: {}, toast: null, busy: false, gone: {}, si: { step: 'email', email: '', msg: '', err: false, paste: false }, signedOut: false, boot: Date.now() };
  var root, raf = 0, deferred = false, toastT = 0;

  /* ---------- words (English / Hebrew) ---------- */
  var HE = {
    'Today': 'היום', 'Approvals': 'אישורים', 'Talk': 'שיחה', 'Settings': 'הגדרות',
    'Waiting for you': 'מחכים לך', 'Agents ran · 24 h': 'הרצות סוכנים · 24 ש׳', 'Sent · 7 days': 'נשלחו · 7 ימים', 'Replies · 7 days': 'תשובות · 7 ימים',
    'Going out': 'יוצאים', 'Ready for you': 'מוכנים לך', 'Do this first': 'קודם את זה', 'Your steps': 'הצעדים שלך',
    'Ready for you to send': 'מוכנים לשליחה שלך', 'While you were away': 'בזמן שלא היית', 'Did they answer?': 'ענו לך?',
    'Go': 'שלח', 'Hold': 'אחר כך', 'Stop': 'עצור', 'Change': 'שנה', 'Done': 'בוצע', 'Undo': 'בטל', 'Open': 'פתח',
    'Nothing waits for you.': 'שום דבר לא מחכה לך.', 'Board clear. J8 will ping you when something needs you.': 'הלוח נקי. J8 יקרא לך כשמשהו יצטרך אותך.',
    'Sign in': 'כניסה', 'Email me a code': 'שלח לי קוד במייל', 'Sign out': 'יציאה', 'Language': 'שפה', 'Sending': 'שליחה',
    'Pause sending': 'עצור שליחה', 'Resume sending': 'חדש שליחה', 'Templates': 'תבניות', 'Phone alerts': 'התראות בטלפון',
    'Classic J8NIX': 'J8NIX הקלאסי', 'Account': 'חשבון', 'Send': 'שלח', 'Message to J8': 'הודעה ל-J8', 'All approvals': 'כל האישורים',
    'Show all': 'הצג הכל', 'Show less': 'הצג פחות', 'Couldn\u2019t load. Retry': 'לא נטען. נסה שוב', 'Paused \u2014 nothing goes out.': 'מושהה \u2014 שום דבר לא יוצא.',
    'Resume': 'חדש', 'Talk to J8': 'דבר עם J8', 'It answers here and updates your plan.': 'הוא עונה כאן ומעדכן את התוכנית.',
    'Ask J8 about this': 'שאל את J8 על זה', 'Copy & open': 'העתק ופתח', 'Copy': 'העתק', 'Mark sent': 'סמן כנשלח', 'Cancel': 'ביטול',
    'Save and go': 'שמור ושלח', 'Urgent': 'דחוף', 'Your step': 'הצעד שלך', 'min': 'דק׳', 'Same kind of message': 'אותו סוג הודעה', 'Go all': 'שלח הכל',
    'Where': 'איפה', 'Why': 'למה', 'Note': 'הערה', 'Check': 'לבדוק', 'Plan only': 'תוכנית בלבד', 'Saved': 'נשמר', 'Replied': 'ענו', 'Call': 'שיחה', 'Proposal': 'הצעה', 'Won': 'נסגר', 'Lost': 'לא נסגר',
    'Held. It comes back tomorrow at 08:00.': 'נדחה. חוזר מחר ב-08:00.', 'Approved. It goes out after its hold.': 'אושר. יוצא אחרי ההמתנה.', 'Stopped. It will not be sent.': 'נעצר. לא יישלח.',
    'Changed and approved.': 'שונה ואושר.', 'Done.': 'בוצע.', 'Back to waiting.': 'חזר להמתנה.', 'Next': 'הבאים', 'One by one': 'אחד אחד', 'Failed': 'נכשל', 'Sent': 'נשלח', 'drafts': 'טיוטות', 'steps': 'צעדים',
    'Make it shorter, or ask why': 'קצר את זה, או שאל למה', 'Tap what happened. It counts in Replies.': 'סמן מה קרה. זה נספר בתשובות.', 'All agents ran fine': 'כל הסוכנים רצו תקין',
    'runs in 24 h': 'הרצות ב-24 ש׳', 'stopped': 'נעצרו', 'Ask me': 'שאל אותי', 'Auto after 6 h': 'אוטומטי אחרי 6 ש׳', 'Off': 'כבוי',
    'This account has no business in J8NIX yet. Ask the owner for an invite.': 'לחשבון הזה אין עסק ב-J8NIX עדיין. בקש הזמנה מהבעלים.', 'Do it for me': 'תעשה בשבילי', 'Waiting': 'מחכים', 'Running': 'פועל', 'Stopped': 'נעצר', 'Paused': 'מושהה'
  };
  function lang() { return document.documentElement.lang === 'he' ? 'he' : 'en'; }
  function T(s) { return lang() === 'he' && HE[s] ? HE[s] : s; }

  /* ---------- helpers ---------- */
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"'`]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]; }); }
  function link(u) { u = String(u || '').trim(); return /^https:\/\/[^\s"'<>`\\]+$/i.test(u) ? u : ''; }
  function cut(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '\u2026' : s; }
  function words(x, n) { var w = String(x || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean); return w.length > n ? w.slice(0, n).join(' ').replace(/[,;:·.\-–(]+$/, '') + '\u2026' : w.join(' '); }
  function pd(s) {
    if (!s) return NaN; if (typeof s === 'number') return s;
    var x = String(s).trim();
    if (/^\d{4}-\d\d-\d\d$/.test(x)) return Date.parse(x + 'T12:00:00Z');
    x = x.replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1').replace(/(T[\d:.]+[+-]\d\d)$/, '$1:00');
    return Date.parse(x);
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function il(t) {
    try {
      var p = {}; new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date(t)).forEach(function (x) { p[x.type] = x.value; });
      return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, mi: +p.minute };
    } catch (e) { var d = new Date(t); return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), h: d.getHours(), mi: d.getMinutes() }; }
  }
  function ymd(t) { var p = il(t); return p.y + '-' + pad(p.m) + '-' + pad(p.d); }
  function when(s) {
    var t = pd(s); if (isNaN(t)) return ''; var p = il(t), hm = pad(p.h) + ':' + pad(p.mi);
    if (ymd(t) === ymd(Date.now())) return hm;
    if (ymd(t) === ymd(Date.now() - 864e5)) return (lang() === 'he' ? 'אתמול ' : 'yesterday ') + hm;
    return p.d + ' ' + MON[p.m - 1] + ' ' + hm;
  }
  function ago(s) { var t = pd(s); if (isNaN(t)) return ''; var m = Math.round((Date.now() - t) / 6e4); if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; var h = Math.round(m / 60); return h < 48 ? h + ' h ago' : Math.round(h / 24) + ' days ago'; }
  function tomorrow8() { /* tomorrow 08:00 Israel time, as an ISO string */
    var p = il(Date.now() + 864e5), guess = Date.UTC(p.y, p.m - 1, p.d, 8, 0); var q = il(guess), off = (q.h - 8) * 36e5 + q.mi * 6e4;
    return new Date(guess - off).toISOString();
  }
  function safe(f, d) { try { var v = f(); return v == null ? d : v; } catch (e) { return d; } }
  function on() { var j = J(); return !!(j && safe(function () { return j.status().connected; }, false)); }
  function failed() { var j = J(); if (!j) return Date.now() - S.boot > 8000; var st = safe(function () { return j.status(); }, {}) || {}; return !st.connected && st.error === 'offline'; }
  function raw(c) { var j = J(); return safe(function () { return j.raw(c); }, {}) || {}; }
  function buzz() { try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) { /* no haptics */ } }
  function armed(k) { var a = S.arm[k]; return a && Date.now() - a < 5000; }
  function arm(k) { S.arm[k] = Date.now(); render(true); setTimeout(function () { if (S.arm[k] && Date.now() - S.arm[k] >= 5000) { delete S.arm[k]; render(); } }, 5100); }

  /* ---------- data ---------- */
  function allAps() { var j = J(); return safe(function () { return j.approvals.list(); }, []); }
  function held() { /* items Dave put on Hold in this app that have not come back yet */
    var j = J(), o = {}, n = Date.now();
    safe(function () { return j.later.list(); }, []).forEach(function (l) {
      if (!/^(tk-|b-one-)/.test(String(l.id)) || l.status !== 'later') return;
      var t = pd(l.come_back_at); if (!isNaN(t) && t <= n) return;
      (l.item_ids || []).forEach(function (i) { o[i] = l.id; });
    });
    return o;
  }
  function isTpl(a) { return a && (a.kind === 'template' || a.label === 'Template'); }
  function drafts() { var j = J(), H = held(); return safe(function () { return j.approvals.pending(); }, []).filter(function (a) { return !H[a.id] && !S.gone[a.id]; }); }
  function steps() { var j = J(), H = held(); return safe(function () { return j.tasks.open(); }, []).filter(function (t) { return t.owner === 'dave' && !H[t.id] && !S.gone[t.id]; }); }
  function runs() { var j = J(); return safe(function () { return j.runs.list(); }, []); }
  function paused() { var j = J(); return safe(function () { return j.control.paused(); }, false); }
  function pname(pid) { var j = J(), p = pid ? safe(function () { return j.projects.get(pid); }, null) : null; return p ? p.name : pid === 'p-general' ? 'Studio' : ''; }
  function pidOf(product) { var p = String(product || ''); if (/^p-/.test(p)) return p; var m = safe(function () { return J().projects.list(); }, []).filter(function (x) { return x.name === p; })[0]; return m ? m.id : ''; }
  function rankPull() { var j = J(); if (!on() || !j.rank || Date.now() - S.rankAt < 6e4) return; S.rankAt = Date.now(); j.rank().then(function (R) { if (Array.isArray(R)) { S.rank = R; render(); } }, function () {}); }
  function lintPull() { var j = J(); if (!on() || !j.lint || Date.now() - S.lintAt < 6e4) return; S.lintAt = Date.now(); j.lint().then(function (L) { if (L && typeof L === 'object') { S.lint = L; render(); } }, function () {}); }
  function lintOf(a) { return (S.lint && a && S.lint[a.id]) || { flags: [], hard: false }; }
  function rankPos() { var o = {}; (S.rank || []).forEach(function (r) { if (r && r.id != null && o[r.id] == null) o[r.id] = Number(r.pos) || 0; }); return o; }
  var SEV = { r: 0, o: 1, g: 2 };
  function waiting() { /* drafts + Dave's steps, J8's rank first, then urgent steps, then the drafts' own order */
    var R = rankPos(), L = drafts().map(function (a) { return { k: 'ap', id: a.id, a: a }; }).concat(steps().map(function (t) { return { k: 'tk', id: t.id, t: t }; }));
    return L.map(function (x, i) { x.i = i; return x; }).sort(function (x, y) {
      var a = R[x.id] != null ? R[x.id] : 1e6, b = R[y.id] != null ? R[y.id] : 1e6; if (a !== b) return a - b;
      var sa = x.k === 'tk' ? (SEV[x.t.sev] != null ? SEV[x.t.sev] : 3) : 1.5, sb = y.k === 'tk' ? (SEV[y.t.sev] != null ? SEV[y.t.sev] : 3) : 1.5;
      return sa - sb || x.i - y.i;
    });
  }
  function whoOf(a) { return cut(a.to || a.label || a.subject || a.kind || 'Draft', 64); }
  function whyNow(a) {
    var g = a.gist || a.why_now; if (g) return words(g, 9);
    var c = String(a.context || '').replace(/\s+/g, ' ').trim();
    if (a.kind === 'application') { var f = /\bFit (\d+)\s*\/\s*100/i.exec(c); if (f) return 'Fit ' + f[1] + '/100'; }
    if (isTpl(a)) return 'Saved message · approve once';
    var src = /\bSource:\s*([^:·]+?)(?::\s*https?:|\s·\s|$)/i.exec(c); if (src && !/^https?/i.test(src[1].trim())) return words(src[1], 9);
    var first = c.split(/\s·\s|\.\s/)[0]; return first ? words(first, 9) : words(a.batch_label || '', 9);
  }
  function textOf(a) { var j = J(); return String(safe(function () { return j.approvals.textOf(a); }, '') || ''); }
  function planOnly(a) { return !!(a.no_send || (a.extra && a.extra.no_send)); }
  function isHand(a) { if (!a || isTpl(a) || a.source === 'j8nix-app') return false; return /^linkedin/i.test(String(a.channel || '').trim()) || a.label === 'Send by hand'; }
  function handDue(a) { if (a.status === 'approved' || a.status === 'edited') return true; if (a.status === 'queued') { var h = pd(a.hold_until); return !isNaN(h) && h < Date.now(); } return false; }
  function atOr(a, k) { var t = pd(a[k]); if (isNaN(t)) t = pd(a.created); return isNaN(t) ? 9e15 : t; }
  function ready() { return allAps().filter(function (a) { return isHand(a) && handDue(a) && a.kind !== 'post' && !S.gone[a.id]; }).sort(function (a, b) { return atOr(a, 'decided_at') - atOr(b, 'decided_at'); }); }
  function goingOut() {
    var R = {}; ready().forEach(function (a) { R[a.id] = 1; });
    return allAps().filter(function (a) { return /^(approved|edited|queued)$/.test(a.status || '') && !isTpl(a) && a.source !== 'j8nix-app' && !R[a.id] && !S.gone[a.id]; })
      .sort(function (a, b) { var n = Date.now(), x = pd(a.hold_until), y = pd(b.hold_until), hx = !isNaN(x) && x > n, hy = !isNaN(y) && y > n; return (hy - hx) || (hx && hy ? x - y : 0) || atOr(a, 'decided_at') - atOr(b, 'decided_at'); });
  }
  function left(ms) { var m = Math.max(1, Math.round(ms / 6e4)), h = Math.floor(m / 60); return h ? h + 'h ' + pad(m % 60) + 'm' : m + 'm'; }
  function holdText(a) {
    var h = pd(a.hold_until), n = Date.now();
    if (!isNaN(h) && h > n) return 'Leaves in ' + left(h - n) + ' (' + when(h) + ')';
    if (a.stage === 'tool_blocked') return 'Needs your hand: the form blocks J8';
    if (a.stage === 'filled_awaiting_code') return 'Filled in · waits for your code';
    return isHand(a) ? 'You send it by hand' : 'Waits for the next send run';
  }
  var REPLY_O = { replied: 1, interview: 1, question: 1, call: 1, won: 1 };
  function inWin(t, from) { return !isNaN(t) && t >= from && t <= Date.now() + 6e4; }
  function score() {
    var from = Date.now() - 7 * 864e5, o = { sent: 0, rep: 0 };
    allAps().forEach(function (a) {
      if (a.status !== 'sent' || isTpl(a)) return;
      var ts = pd(a.sent_at), tr = pd(a.replied_at), to = pd(a.outcome_at), te = !isNaN(to) ? to : !isNaN(tr) ? tr : ts;
      if (inWin(ts, from)) o.sent++;
      if ((a.replied_at || REPLY_O[a.outcome]) && inWin(!isNaN(tr) ? tr : te, from)) o.rep++;
    });
    return o;
  }
  function batches() {
    var B = {};
    drafts().forEach(function (a) {
      if (!a.batch || isTpl(a) || planOnly(a)) return;
      var b = B[a.batch] = B[a.batch] || { k: a.batch, label: a.batch_label || a.batch, L: [], hard: 0 };
      if (lintOf(a).hard) b.hard++; else b.L.push(a);
    });
    return Object.keys(B).map(function (k) { return B[k]; }).filter(function (b) { return b.L.length >= 2; }).sort(function (a, b) { return b.L.length - a.L.length; });
  }
  function sent30() {
    var from = Date.now() - 30 * 864e5;
    return allAps().filter(function (a) { var t = pd(a.sent_at); return a.status === 'sent' && !isTpl(a) && a.kind !== 'post' && !isNaN(t) && t >= from; }).sort(function (a, b) { return pd(b.sent_at) - pd(a.sent_at); });
  }
  function tOf(r) { var a = pd(r.ended), b = pd(r.started); return isNaN(a) ? b : isNaN(b) ? a : Math.max(a, b); }
  function plain(s) { return String(s || '').replace(/^[\s\u{1F534}\u{1F7E0}\u{1F7E2}\u{1F680}\u{1F3AF}\u{1F527}\u{1F3A8}⚪✅❌⚠️]+/u, '').replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim(); }
  function runs24() { var from = Date.now() - 864e5; return runs().filter(function (r) { var t = tOf(r); return !isNaN(t) && t >= from; }); }
  function failedArms() { /* the latest run of each arm in 24 h, when it failed (a failed sender shows once, in the strip) */
    var sx = sender(), skipS = sx && !sx.ok && !paused();
    var by = {}; runs24().sort(function (a, b) { return tOf(b) - tOf(a); }).forEach(function (r) { if (r.arm && !by[r.arm]) by[r.arm] = r; });
    return Object.keys(by).map(function (k) { return by[k]; }).filter(function (r) { return r.status === 'failed' && !(skipS && SENDER.indexOf(String(r.arm || '').trim().toLowerCase()) > -1); });
  }
  var SENDER = ['mac sender', 'main chat send', 'sender (mac)'];
  function sender() {
    var R = runs().filter(function (r) { return SENDER.indexOf(String(r.arm || '').trim().toLowerCase()) > -1; }).map(function (r) { return { r: r, t: tOf(r) }; }).filter(function (x) { return !isNaN(x.t); }).sort(function (a, b) { return b.t - a.t; });
    if (!R.length) return null;
    return { ok: R[0].r.status !== 'failed', t: R[0].t, why: R[0].r.status === 'failed' ? cut(plain(R[0].r.summary), 90) : '' };
  }
  function stepsOf(text) {
    var s = String(text || '').trim(); if (!s) return [];
    var parts = s.split(/\n+|(?:^|\s)(?=\d+[.)]\s)|\s*(?:→|->)\s*/).map(function (x) { return x.replace(/^\s*\d+[.)]\s*/, '').trim(); }).filter(function (x) { return x.length > 1; });
    return parts.length > 1 ? parts.slice(0, 8) : [];
  }
  function tplName(a) {
    if (a.label && a.label !== 'Template') return a.label;
    var to = String(a.to || ''); if (to) return cut(to.replace(/^T\d+\s*·\s*/, ''), 60);
    var m = /^tpl-t\d+-(.+)$/i.exec(String(a.id || '')), s = m ? m[1].replace(/-/g, ' ') : (a.subject || a.id || 'Template');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ---------- pieces ---------- */
  var ICO = {
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    approvals: '<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',
    talk: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    chev: '<path d="m9 6 6 6-6 6"/>', pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
    play: '<path d="M7 5v14l11-7z"/>', ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    wait: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', stop: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>', done: '<path d="M20 6 9 17l-5-5"/>', run: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'
  };
  function ico(n, c) { return '<svg class="i' + (c ? ' ' + c : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICO[n] || '') + '</svg>'; }
  var STW = { wait: 'Waiting', run: 'Running', stop: 'Stopped', done: 'Done', held: 'Held' }, STUB = { wait: 'wait', run: 'run', stop: 'stop', done: 'done' };
  function chip(tone, word) { return '<span class="chip c-' + tone + '">' + ico(tone === 'held' ? 'wait' : tone) + '<span>' + esc(T(word || STW[tone])) + '</span></span>'; }
  function btn(x, label, id, cls, extra) { return '<button type="button" class="b' + (cls ? ' ' + cls : '') + '" data-x="' + x + '"' + (id != null ? ' data-id="' + esc(id) + '"' : '') + (extra || '') + '>' + label + '</button>'; }
  function head(id, h, sub, n) { return '<div class="gh"><h2 id="' + id + '">' + esc(h) + (n != null ? ' <span class="cnt">' + esc(n) + '</span>' : '') + '</h2>' + (sub || '') + '</div>'; }
  /* a ticket: a stub on the start edge (status icon in its colour) torn off along a perforation, one phrase, tap to open */
  function ticket(o) {
    var open = S.open === o.key || (o.first && S.open === '__first__'), rid = 'tk-' + o.key.replace(/[^\w-]/g, '_');
    return '<article class="tkt n-' + o.tone + (open ? ' open' : '') + (o.first ? ' first' : '') + '" data-key="' + esc(o.key) + '">'
      + '<button type="button" class="th" data-x="open" data-id="' + esc(o.key) + '" aria-expanded="' + open + '" aria-controls="' + rid + '">'
      + '<span class="stub" aria-hidden="true">' + ico(STUB[o.tone] || 'done') + '</span><span class="sr">' + esc(T(STW[o.tone] || 'Done')) + ': </span><span class="tt"><b dir="auto">' + esc(o.title) + '</b>' + (o.meta ? '<small dir="auto">' + esc(o.meta) + '</small>' : '') + '</span>'
      + (o.right || '') + ico('chev', 'cv') + '</button>'
      + '<div class="tb" id="' + rid + '"' + (open ? '' : ' hidden') + '>' + (open ? o.body() : '') + '</div></article>';
  }
  function kv(k, v) { return v ? '<div class="kv"><span>' + esc(T(k)) + '</span><p dir="auto">' + esc(v) + '</p></div>' : ''; }
  function askBox(key, pid, taskId, apId) {
    if (S.askOpen !== key) return '<div class="acts quiet">' + btn('askopen', esc(T('Ask J8 about this')), key, 'q') + '</div>';
    return '<div class="ask"><label class="sr" for="ask-' + esc(key) + '">' + esc(T('Ask J8 about this')) + '</label><textarea id="ask-' + esc(key) + '" data-ask="' + esc(key) + '" rows="2" dir="auto" placeholder="' + esc(T('Make it shorter, or ask why')) + '">' + esc(S.ask[key] || '') + '</textarea>'
      + '<div class="acts">' + btn('asksend', esc(T('Send')), key, 'p', ' data-p="' + esc(pid || 'p-general') + '" data-t="' + esc(taskId || '') + '" data-a="' + esc(apId || '') + '"') + btn('askclose', esc(T('Cancel')), key, 'q') + '</div></div>';
  }

  /* ---------- tickets by kind ---------- */
  function draftTicket(a, first) {
    var tpl = isTpl(a), plan = planOnly(a), li = lintOf(a), proj = pname(pidOf(a.product));
    return ticket({ key: 'ap:' + a.id, tone: li.hard ? 'stop' : 'wait', first: first, title: whoOf(a), meta: [whyNow(a), proj].filter(Boolean).join(' · '),
      right: plan ? '<span class="tag">' + esc(T('Plan only')) + '</span>' : '',
      body: function () {
        var tx = textOf(a), hard = li.flags.filter(function (f) { return /^HARD:/.test(f); }).map(function (f) { return f.replace(/^HARD:\s*/, ''); });
        var soft = li.flags.filter(function (f) { return !/^HARD:/.test(f); }).map(function (f) { return f.replace(/^CHECK:\s*/, ''); });
        var h = '';
        if (hard.length) h += '<p class="warn" dir="auto">' + ico('stop') + 'Blocked: ' + esc(cut(hard.join(' · '), 180)) + '</p>';
        h += kv('Where', cut(a.channel, 160)) + kv('Why', cut(a.context, 260)) + kv('Note', a.stage_note || a.warn) + kv('Check', soft.join(' · '));
        if (plan) h += '<p class="fn">Plan only: nothing is sent.</p>';
        if (S.editing === a.id) {
          h += '<label class="sr" for="ed-' + esc(a.id) + '">Change the text</label><textarea class="edit" id="ed-' + esc(a.id) + '" data-edit="' + esc(a.id) + '" rows="8" dir="auto">' + esc(S.edit[a.id] != null ? S.edit[a.id] : tx) + '</textarea>'
            + '<div class="acts">' + btn('editsave', esc(T('Save and go')), a.id, 'p') + btn('editx', esc(T('Cancel')), a.id, 'q') + '</div>';
          return h;
        }
        if (tx) h += '<div class="msg" dir="auto" tabindex="0" aria-label="The text that goes out">' + esc(tx) + '</div>';
        var hk = 'hb-' + a.id, hb = li.hard && armed(hk);
        h += '<div class="acts">' + btn('go', hb ? 'Tap again: send anyway' : esc(plan ? 'Start' : tpl ? 'Use this message' : T('Go')), a.id, 'p' + (hb ? ' armed' : ''))
          + btn('hold', esc(T('Hold')), 'ap:' + a.id) + btn('stop', esc(T('Stop')), a.id, 's') + (plan ? '' : btn('edit', esc(T('Change')), a.id, 'q')) + '</div>';
        return h + askBox('ap:' + a.id, pidOf(a.product) || 'p-general', null, a.id);
      } });
  }
  function stepTicket(t, first) {
    var proj = pname(t.project_id);
    return ticket({ key: 'tk:' + t.id, tone: t.sev === 'r' ? 'stop' : 'wait', first: first, title: cut(String(t.title || t.id).replace(/^\s*TODAY\s*\d*\s*·\s*/i, ''), 110),
      meta: [T('Your step'), t.minutes ? t.minutes + ' ' + T('min') : '', proj].filter(Boolean).join(' · '),
      right: t.sev === 'r' ? '<span class="tag t-stop">' + esc(T('Urgent')) + '</span>' : '',
      body: function () {
        var lk = link(t.link), st = stepsOf(t.action), h = '';
        if (t.why) h += '<p class="why" dir="auto">' + esc(cut(t.why, 260)) + '</p>';
        if (st.length) h += '<ol class="steps" dir="auto">' + st.map(function (x) { return '<li>' + esc(cut(x, 220)) + '</li>'; }).join('') + '</ol>';
        else if (t.action) h += '<p class="why" dir="auto">' + esc(cut(t.action, 320)) + '</p>';
        var k = 'dn-' + t.id;
        h += '<div class="acts">' + (lk ? '<a class="b p" href="' + esc(lk) + '" target="_blank" rel="noopener noreferrer">' + esc(t.link_text && t.link_text.length < 26 ? t.link_text : T('Open')) + ico('ext') + '</a>' : '')
          + (t.mode === 'tap' && !t.tapped_at ? btn('tap', esc(T('Do it for me')), t.id, lk ? '' : 'p') : '')
          + btn('done', armed(k) ? 'Tap again: done' : esc(T('Done')), t.id, armed(k) ? 'armed' : '') + btn('hold', esc(T('Hold')), 'tk:' + t.id) + '</div>';
        if (t.tapped_at) h += '<p class="fn">J8 is on it since ' + esc(when(t.tapped_at)) + '.</p>';
        return h + askBox('tk:' + t.id, t.project_id || 'p-general', t.id, null);
      } });
  }
  function itemTicket(x, first) { return x.k === 'ap' ? draftTicket(x.a, first) : stepTicket(x.t, first); }
  function readyTicket(a) {
    return ticket({ key: 'rd:' + a.id, tone: 'wait', title: cut(a.to || a.label || a.subject || 'Message', 90), meta: cut(a.channel || 'Send by hand', 70),
      body: function () {
        var tx = textOf(a), lk = link(a.link), k = 'hs-' + a.id;
        return (tx ? '<div class="msg" dir="auto" tabindex="0">' + esc(tx) + '</div>' : '')
          + '<div class="acts">' + (tx || lk ? btn('copyopen', esc(lk ? T('Copy & open') : T('Copy')), a.id, 'p') : '')
          + btn('handsent', armed(k) ? 'Tap again: sent' : esc(T('Mark sent')), a.id, armed(k) ? 'armed' : '') + '</div>';
      } });
  }
  function outTicket(a) {
    return ticket({ key: 'go:' + a.id, tone: 'run', title: whoOf(a), meta: holdText(a),
      body: function () {
        var tx = textOf(a), k = 'kl-' + a.id;
        return kv('Where', cut(a.channel, 160)) + kv('Note', a.stage_note) + (tx ? '<div class="msg" dir="auto" tabindex="0">' + esc(tx) + '</div>' : '')
          + '<div class="acts">' + btn('kill', armed(k) ? 'Tap again: stop it' : esc(T('Stop')), a.id, 's' + (armed(k) ? ' armed' : '')) + '</div>';
      } });
  }
  var OUTW = { replied: 'Replied', call: 'Call', proposal: 'Proposal', won: 'Won', lost: 'Lost' };
  function outcomeTicket(a) {
    var cur = a.outcome || (a.replied_at ? 'replied' : '');
    return ticket({ key: 'oc:' + a.id, tone: 'done', title: whoOf(a), meta: T('Sent') + ' ' + when(a.sent_at) + (cur ? ' · ' + T(OUTW[cur] || cur) : ''),
      body: function () {
        return '<p class="fn">' + esc(T('Tap what happened. It counts in Replies.')) + '</p><div class="seg" role="group" aria-label="What happened">' + ['replied', 'call', 'proposal', 'won', 'lost'].map(function (w) {
          return '<button type="button" data-x="oc" data-w="' + w + '" data-id="' + esc(a.id) + '" aria-pressed="' + (cur === w) + '">' + esc(T(OUTW[w])) + '</button>'; }).join('') + '</div>';
      } });
  }
  function batchTicket(b) {
    var n = b.L.length;
    return ticket({ key: 'bt:' + b.k, tone: 'wait', title: cut(b.label, 80), meta: n + ' ' + T('drafts') + ' · ' + T('Same kind of message') + (b.hard ? ' · ' + b.hard + ' blocked, left out' : ''),
      body: function () {
        return b.L.slice(0, 3).map(function (a) { var tx = textOf(a); return '<div class="smp"><b dir="auto">' + esc(whoOf(a)) + '</b>' + (tx ? '<p dir="auto">' + esc(cut(tx, 180)) + '</p>' : '') + '</div>'; }).join('')
          + (n > 3 ? '<p class="fn">+ ' + (n - 3) + ' more like these</p>' : '')
          + '<div class="acts">' + btn('batchgo', esc(T('Go all')) + ' ' + n, b.k, 'p', S.busy ? ' disabled' : '') + btn('unbatch', esc(T('One by one')), b.k, '') + '</div>';
      } });
  }

  /* ---------- the desk band ---------- */
  function lockup() { return '<span class="lock"><img src="brand/j8nix-mark-8-2026-11-17.svg" alt="" width="11" height="24"><span class="wm">J8NIX</span></span>'; }
  var NAV = [['today', 'Today'], ['approvals', 'Approvals'], ['talk', 'Talk'], ['settings', 'Settings']];
  function navLinks(cls) {
    var wn = drafts().length;
    return NAV.map(function (n) {
      var cur = S.v === n[0];
      return '<a class="' + cls + (cur ? ' on' : '') + '" href="#' + n[0] + '"' + (cur ? ' aria-current="page"' : '') + '>' + ico(n[0]) + '<span>' + esc(T(n[1])) + '</span>'
        + (n[0] === 'approvals' && wn ? '<em class="bd" aria-label="' + wn + ' waiting">' + wn + '</em>' : '') + '</a>';
    }).join('');
  }
  function band() {
    var loading = !on() && !allAps().length, h = '<header class="band"><div class="bt">' + lockup() + '<nav class="tabs" aria-label="J8NIX">' + navLinks('tab') + '</nav>';
    h += '<button type="button" class="pz' + (paused() ? ' is' : '') + '" data-x="pause">' + ico(paused() ? 'play' : 'pause') + '<span>' + esc(paused() ? T('Resume sending') : T('Pause sending')) + '</span></button></div><div class="bb">';
    if (S.v === 'today') {
      var nd = drafts().length, ns = steps().length, w = nd + ns, sc = score();
      h += '<h1 class="say" dir="auto">' + (loading ? '&nbsp;' : esc(w ? sayN(w) : T('Nothing waits for you.'))) + '</h1>'
        + '<p class="bs" dir="auto">' + (loading ? '&nbsp;' : esc(w ? [nd ? nd + ' ' + T('drafts') : '', ns ? ns + ' ' + T('steps') : ''].filter(Boolean).join(' · ') + '  ·  ' : '') + weekLine(sc)) + '</p>';
    } else if (S.v === 'approvals') {
      var dn = drafts().length, go = goingOut().length, rd = ready().length;
      h += '<h1 class="say" dir="auto">' + (loading ? '&nbsp;' : esc(dn ? (lang() === 'he' ? dn + ' טיוטות מחכות לאישור שלך.' : dn === 1 ? '1 draft waits for your OK.' : dn + ' drafts wait for your OK.') : T('Board clear. J8 will ping you when something needs you.'))) + '</h1>'
        + '<p class="bs" dir="auto">' + (loading ? '&nbsp;' : esc([go ? go + ' ' + (lang() === 'he' ? 'יוצאים' : 'going out') : '', rd ? rd + ' ' + (lang() === 'he' ? 'מוכנים לשליחה שלך' : 'for you to send') : '', weekLine(score())].filter(Boolean).join('  ·  '))) + '</p>';
    } else if (S.v === 'talk') h += '<h1 class="say">' + esc(T('Talk to J8')) + '</h1><p class="bs">' + esc(T('It answers here and updates your plan.')) + '</p>';
    else h += '<h1 class="say">' + esc(T('Settings')) + '</h1><p class="bs" dir="auto">J8NIX ' + VER + '</p>';
    return h + '</div></header>';
  }
  function weekLine(sc) { return lang() === 'he' ? 'השבוע: ' + sc.sent + ' נשלחו, ' + sc.rep + ' תשובות' : 'This week: ' + sc.sent + ' sent, ' + sc.rep + (sc.rep === 1 ? ' reply' : ' replies'); }
  function sayN(n) { return lang() === 'he' ? n + ' מחכים לך.' : n === 1 ? '1 thing waits for you.' : n + ' things wait for you.'; }
  function strip() {
    if (paused()) return '<div class="strip s-wait" role="status">' + ico('pause') + '<span>' + esc(T('Paused \u2014 nothing goes out.')) + '</span>' + btn('resume', esc(T('Resume')), null, 'q') + '</div>';
    if (failed()) return '<div class="strip s-stop" role="status">' + ico('stop') + '<span>Offline. Showing your last copy.</span>' + btn('retry', 'Retry', null, 'q') + '</div>';
    var s = on() ? sender() : null;
    if (s && !s.ok) return '<div class="strip s-stop" role="status">' + ico('stop') + '<span dir="auto">Sending stopped ' + esc(when(s.t)) + ': ' + esc(s.why || 'the last run failed') + '</span></div>';
    return '';
  }

  /* ---------- screens ---------- */
  function noOrg() { return safe(function () { return J().status().error === 'no_org'; }, false); }
  function skeleton() { if (noOrg()) return '<p class="empty">' + esc(T('This account has no business in J8NIX yet. Ask the owner for an invite.')) + '</p>'; return '<div class="skel" aria-hidden="true"><i></i><i></i><i></i></div><p class="sr" role="status">Loading</p>'; }
  function vToday() {
    if (!on() && !allAps().length) return failed() ? '<p class="empty">' + btn('retry', esc(T('Couldn\u2019t load. Retry')), null, 'p') + '</p>' : skeleton();
    var W = waiting(), h = '<div class="cola">';
    if (W.length) {
      h += '<section aria-labelledby="g-first">' + head('g-first', T('Do this first')) + '<div class="tkts">' + itemTicket(W[0], true) + '</div></section>';
      var nx = W.slice(1, 4);
      if (nx.length) h += '<section aria-labelledby="g-next">' + head('g-next', T('Next'), W.length > 4 ? '<a class="ql" href="#approvals">' + esc(T('All approvals')) + '</a>' : '') + '<div class="tkts">' + nx.map(function (x) { return itemTicket(x); }).join('') + '</div></section>';
      var shown = {}; W.slice(0, 4).forEach(function (x) { shown[x.id] = 1; });
      var ST = W.filter(function (x) { return x.k === 'tk' && !shown[x.id]; });
      if (ST.length) h += '<section aria-labelledby="g-steps">' + head('g-steps', T('Your steps'), ST.length > 3 ? btn('stepsall', esc(S.stepsAll ? T('Show less') : T('Show all')), null, 'ql') : '', ST.length) + '<div class="tkts">' + (S.stepsAll ? ST : ST.slice(0, 3)).map(function (x) { return itemTicket(x); }).join('') + '</div></section>';
    } else {
      h += '<section class="clear"><p class="ct">' + ico('done') + esc(T('Board clear. J8 will ping you when something needs you.')) + '</p><a class="ql" href="#approvals">See what went out</a></section>';
    }
    h += '</div><div class="colb">';
    var R = ready();
    if (R.length) h += '<section aria-labelledby="g-ready">' + head('g-ready', T('Ready for you to send'), '', R.length) + '<div class="tkts">' + R.slice(0, 3).map(readyTicket).join('') + '</div>' + (R.length > 3 ? '<a class="ql more" href="#approvals">' + esc(T('Show all')) + ' ' + R.length + '</a>' : '') + '</section>';
    h += away();
    return h + '</div>';
  }
  function away() {
    var F = failedArms(), n = runs24().length;
    var h = '<section aria-labelledby="g-away">' + head('g-away', T('While you were away')) + '<div class="tkts">';
    if (F.length) h += F.slice(0, 4).map(function (r) {
      return ticket({ key: 'rn:' + (r.id || r.arm), tone: 'stop', title: r.arm, meta: T('Failed') + ' ' + when(r.ended || r.started),
        body: function () { return '<p class="why" dir="auto">' + esc(cut(plain(r.summary), 400)) + '</p><p class="fn">J8 retries at its next run. Ask if you want it sooner.</p>' + askBox('rn:' + (r.id || r.arm), 'p-general', null, null); } });
    }).join('');
    h += '<div class="line n-done"><span class="stub" aria-hidden="true">' + ico('done') + '</span><span dir="auto">' + esc(!n ? 'No agent runs in 24 h' : F.length ? n + ' ' + T('runs in 24 h') + ' · ' + F.length + ' ' + T('stopped') : T('All agents ran fine') + ' · ' + n + ' ' + T('runs in 24 h')) + '</span></div>';
    return h + '</div></section>';
  }
  function vApprovals() {
    if (!on() && !allAps().length) return failed() ? '<p class="empty">' + btn('retry', esc(T('Couldn\u2019t load. Retry')), null, 'p') + '</p>' : skeleton();
    var B = batches().filter(function (b) { return !S.unbatch[b.k]; }), inB = {}, h = '';
    B.forEach(function (b) { b.L.forEach(function (a) { inB[a.id] = 1; }); });
    var R = rankPos(), single = drafts().filter(function (a) { return !inB[a.id]; }).sort(function (a, b) { var x = R[a.id] != null ? R[a.id] : 1e6, y = R[b.id] != null ? R[b.id] : 1e6; return x - y; });
    var nW = drafts().length;
    h += '<section aria-labelledby="g-w">' + head('g-w', T('Waiting for you')) + '<div class="tkts">';
    h += nW ? B.map(batchTicket).join('') + single.map(function (a) { return draftTicket(a); }).join('') : '<div class="line n-done"><span class="stub" aria-hidden="true">' + ico('done') + '</span><span>' + esc(T('Board clear. J8 will ping you when something needs you.')) + '</span></div>';
    h += '</div></section>';
    var Rd = ready(); if (Rd.length) h += '<section aria-labelledby="g-r">' + head('g-r', T('Ready for you to send'), '', Rd.length) + '<div class="tkts">' + Rd.map(readyTicket).join('') + '</div></section>';
    var G = goingOut();
    if (G.length) h += '<section aria-labelledby="g-o">' + head('g-o', T('Going out'), G.length > 4 ? btn('goall', esc(S.goAll ? T('Show less') : T('Show all')), null, 'ql') : '', G.length) + '<div class="tkts">' + (S.goAll ? G : G.slice(0, 4)).map(outTicket).join('') + '</div></section>';
    var O = sent30();
    if (O.length) h += '<section aria-labelledby="g-a">' + head('g-a', T('Did they answer?'), O.length > 4 ? btn('ocall', esc(S.ocAll ? T('Show less') : T('Show all')), null, 'ql') : '', O.length) + '<div class="tkts">' + (S.ocAll ? O : O.slice(0, 4)).map(outcomeTicket).join('') + '</div></section>';
    return h;
  }
  function vTalk() {
    var j = J(), L = safe(function () { return j.inbox.list(40); }, []).slice(0, 30).reverse();
    var h = '<ol class="thread">';
    h += L.length ? L.map(function (m) {
      var lines = String(m.reply || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      return '<li><div class="me"><p dir="auto">' + esc(cut(m.text, 600)) + '</p><small>' + esc(when(m.at)) + (m.p && m.p !== 'p-general' && pname(m.p) ? ' · ' + esc(pname(m.p)) : '') + '</small></div>'
        + (lines.length ? '<div class="j8"><span class="who"><img src="brand/j8nix-mark-8-2026-11-17.svg" alt="" width="7" height="15">J8</span>' + lines.slice(-5).map(function (l) { return '<p dir="auto">' + esc(plain(l)) + '</p>'; }).join('') + '</div>'
          : '<p class="pend">' + ico('wait') + 'J8 answers at the next inbox run</p>') + '</li>';
    }).join('') : '<li class="pend">' + (noOrg() ? esc(T('This account has no business in J8NIX yet. Ask the owner for an invite.')) : on() ? 'No messages yet. Tell J8 a goal, a change or a question.' : 'Connecting\u2026') + '</li>';
    h += '</ol><div class="composer"><label class="sr" for="say">' + esc(T('Message to J8')) + '</label><textarea id="say" data-say="1" dir="auto" rows="2" placeholder="' + esc(T('Message to J8')) + '">' + esc(S.talk) + '</textarea>'
      + btn('say', esc(T('Send')), null, 'p') + '</div>';
    return h;
  }
  var APW = { ask: 'Ask me', hold: 'Auto after 6 h', off: 'Off' };
  function vSettings() {
    var j = J(), h = '';
    var pz = paused(), pk = 'pz', sx = on() ? sender() : null, bad = !pz && sx && !sx.ok;
    h += '<section aria-labelledby="g-s">' + head('g-s', T('Sending')) + '<div class="set"><div class="sr1"><span>' + chip(pz ? 'held' : bad ? 'stop' : 'run', pz ? 'Paused' : bad ? 'Stopped' : 'Running') + '<small dir="auto">' + esc(pz ? 'Nothing goes out until you resume.' : bad ? 'Last send run failed ' + when(sx.t) + '. J8 retries at the next run.' : 'Approved items go out after their hold.') + '</small></span>'
      + btn(pz ? 'resume' : 'pausego', pz ? esc(T('Resume sending')) : armed(pk) ? 'Tap again: pause' : esc(T('Pause sending')), null, pz ? 'p' : (armed(pk) ? 's armed' : 's')) + '</div></div></section>';
    var TP = allAps().filter(function (a) { return a.kind === 'template' && a.status !== 'killed'; });
    if (TP.length) h += '<section aria-labelledby="g-t">' + head('g-t', T('Templates'), '', TP.length) + '<p class="fn">How much J8 may do with each saved message.</p><div class="set">' + TP.map(function (a) {
      var m = APW[a.autopilot] ? a.autopilot : 'ask';
      return '<div class="sr1 col"><span><b dir="auto">' + esc(tplName(a)) + '</b><small>' + esc(a.status === 'pending' || !a.status ? 'Not approved yet' : 'Approved') + '</small></span><div class="seg" role="group" aria-label="Autopilot for ' + esc(tplName(a)) + '">'
        + ['ask', 'hold', 'off'].map(function (k) { var ar = k === 'hold' && armed('au-' + a.id); return '<button type="button" data-x="ap" data-w="' + k + '" data-id="' + esc(a.id) + '" aria-pressed="' + (m === k) + '"' + (ar ? ' class="armed"' : '') + '>' + (ar ? 'Tap again: auto' : esc(T(APW[k]))) + '</button>'; }).join('') + '</div></div>';
    }).join('') + '</div></section>';
    var he = lang() === 'he';
    h += '<section aria-labelledby="g-l">' + head('g-l', T('Language')) + '<div class="set"><div class="sr1"><div class="seg" role="group" aria-label="' + esc(T('Language')) + '">'
      + '<button type="button" data-x="lang" data-w="en" aria-pressed="' + !he + '" lang="en">English</button><button type="button" data-x="lang" data-w="he" aria-pressed="' + he + '" lang="he">עברית</button></div></div></div></section>';
    if (safe(function () { return j.push.supported(); }, false)) h += '<section aria-labelledby="g-p">' + head('g-p', T('Phone alerts')) + '<div class="set"><div class="sr1"><span><small>Titles only, at most 3 a day, quiet at night and on Shabbat.</small></span>' + btn('push', 'Turn on', null, '') + '</div></div></section>';
    h += '<section aria-labelledby="g-c">' + head('g-c', T('Classic J8NIX')) + '<div class="set"><div class="sr1"><span><small>Every older screen (plans, missions, memory, routines) while J8NIX 2.0 grows.</small></span><a class="b" href="classic/">' + esc(T('Open')) + '</a></div></div></section>';
    h += '<section aria-labelledby="g-ac">' + head('g-ac', T('Account')) + '<div class="set"><div class="sr1"><span><b dir="auto">' + esc(safe(function () { return j.status().user.email; }, '') || '') + '</b><small dir="auto">' + esc(safe(function () { return j.orgs.current().name; }, '') || '') + '</small></span>' + btn('signout', esc(T('Sign out')), null, '') + '</div></div></section>';
    return h + endorse();
  }
  function endorse() { return '<p class="endorse"><span class="dots3" aria-hidden="true"><i></i><i></i><i></i></span>J8NIX ' + VER + ' · by 3Shamrocks</p>'; }
  function vSignIn() {
    var s = S.si, h = '<div class="j2 out"><header class="band"><div class="bt">' + lockup() + '</div><div class="bb"><h1 class="say">' + esc(T('Sign in')) + '</h1><p class="bs">Your agents draft the work. You say go.</p></div></header><main class="board narrow" id="main" tabindex="-1">';
    if (s.step === 'email') h += '<form class="si" data-f="email" novalidate><label for="si-e">Email</label><input id="si-e" type="email" autocomplete="email" inputmode="email" dir="ltr" value="' + esc(s.email) + '" required>'
      + '<button type="submit" class="b p wide">' + esc(T('Email me a code')) + '</button></form>';
    else h += '<form class="si" data-f="code" novalidate><p class="fn">We sent a code to <b dir="ltr">' + esc(s.email) + '</b>.</p><label for="si-c">Code from the email</label><input id="si-c" inputmode="numeric" autocomplete="one-time-code" dir="ltr" maxlength="10">'
      + '<button type="submit" class="b p wide">' + esc(T('Sign in')) + '</button><div class="acts">' + btn('si-back', 'Use another email', null, 'q') + btn('si-paste', 'Paste the link instead', null, 'q') + '</div></form>';
    if (s.paste) h += '<form class="si" data-f="link" novalidate><label for="si-l">Sign-in link from the email</label><textarea id="si-l" rows="3" dir="ltr"></textarea><button type="submit" class="b wide">Sign in with the link</button></form>';
    if (s.msg) h += '<p class="simsg' + (s.err ? ' err' : '') + '" role="' + (s.err ? 'alert' : 'status') + '">' + esc(s.msg) + '</p>';
    return h + '<p class="fn">Private tool. Only invited members get in. Nothing here is public.</p>' + endorse() + '</main></div>';
  }

  /* ---------- render ---------- */
  function typing() { var a = document.activeElement; return a && root && root.contains(a) && /^(TEXTAREA|INPUT)$/.test(a.tagName); }
  function render(force) {
    if (!root) return;
    if (!force && typing()) { deferred = true; return; }
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () { raf = 0; paint(); });
  }
  function paint() {
    deferred = false;
    var fid = document.activeElement && root.contains(document.activeElement) ? document.activeElement.id || (document.activeElement.getAttribute('data-x') + '|' + (document.activeElement.getAttribute('data-id') || '')) : null;
    var sy = window.scrollY;
    if (S.signedOut) { root.innerHTML = vSignIn(); return; }
    rankPull(); lintPull();
    var body = S.v === 'approvals' ? vApprovals() : S.v === 'talk' ? vTalk() : S.v === 'settings' ? vSettings() : vToday();
    root.innerHTML = '<div class="j2 v-' + S.v + '">' + '<a class="skip" href="#main">Skip to content</a>' + band() + strip() + '<main class="board" id="main" tabindex="-1">' + body + '</main>'
      + '<nav class="dock" aria-label="J8NIX">' + navLinks('dk') + '</nav>' + toastHtml() + '</div>';
    window.scrollTo(0, sy);
    if (fid) {
      var el = document.getElementById(fid);
      if (!el && fid.indexOf('|') > 0) { var p = fid.split('|'); el = root.querySelector('[data-x="' + p[0] + '"]' + (p[1] ? '[data-id="' + cssq(p[1]) + '"]' : '')); }
      if (el) try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
  }
  function cssq(s) { return String(s).replace(/["\\]/g, '\\$&'); }
  function toastHtml() {
    var t = S.toast; if (!t) return '<div class="toast" role="status" aria-live="polite"></div>';
    return '<div class="toast show' + (t.err ? ' err' : '') + '" role="status" aria-live="polite"><span dir="auto">' + esc(t.text) + '</span>' + (t.undo ? btn('undo', esc(T('Undo')), null, 'u') : '') + '</div>';
  }
  function say(text, undo, err) {
    clearTimeout(toastT); S.toast = { text: text, undo: undo || null, err: !!err }; render(true);
    toastT = setTimeout(function () { S.toast = null; render(); }, undo ? 6000 : 3500);
  }
  function fail(e) { say(e && e.code === 'conflict' ? 'Someone changed it just now. Showing the new version.' : e && e.code === 'offline' ? 'Offline. Nothing changed.' : 'Didn\u2019t save. Nothing changed. Try again.', null, true); }
  /* a cleared ticket slides out, then the board closes the gap */
  function clearOut(key, ids, then) {
    var el = root.querySelector('[data-key="' + cssq(key) + '"]');
    (ids || []).forEach(function (i) { S.gone[i] = 1; });
    if (S.open === key || S.open === '__first__') S.open = '__first__';
    var go = function () { render(true); if (then) then(); };
    if (el && !matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('out'); setTimeout(go, 150); } else go();
  }
  function back(ids) { (ids || []).forEach(function (i) { delete S.gone[i]; }); }

  /* ---------- actions ---------- */
  function act(el) {
    var x = el.getAttribute('data-x'), id = el.getAttribute('data-id'), j = J(); if (!x) return;
    if (x === 'open') { var was = el.getAttribute('aria-expanded') === 'true'; S.open = was ? null : id; S.editing = null; render(true); if (!was) setTimeout(function () { var t = root.querySelector('[data-key="' + cssq(id) + '"] .tb'); if (t && t.scrollIntoView) t.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }, 40); return; }
    if (x === 'retry') { if (j) j.reload().then(function () { render(true); }, function () { say('Still offline.', null, true); }); return; }
    if (!j) return;
    if (x === 'go') {
      var li = lintOf({ id: id }); if (li.hard) { var hk = 'hb-' + id; if (!armed(hk)) { arm(hk); return; } delete S.arm[hk]; }
      buzz(); clearOut('ap:' + id, [id]);
      j.approvals.approve(id).then(function () { back([id]); say(T('Approved. It goes out after its hold.'), function () { return j.approvals.undo(id).then(function () { back([id]); say(T('Back to waiting.')); }, fail); }); }, function (e) { back([id]); render(true); fail(e); });
      return;
    }
    if (x === 'stop') {
      buzz(); clearOut('ap:' + id, [id]);
      j.approvals.kill(id).then(function () { back([id]); say(T('Stopped. It will not be sent.'), function () { return j.approvals.undo(id).then(function () { back([id]); say(T('Back to waiting.')); }, fail); }); }, function (e) { back([id]); render(true); fail(e); });
      return;
    }
    if (x === 'hold') {
      var kind = id.slice(0, 2), iid = id.slice(3), lid = (kind === 'ap' ? 'b-one-' : 'tk-') + iid, ttl = kind === 'ap' ? whoOf(raw('approvals')[iid] || {}) : String((raw('tasks')[iid] || {}).title || iid);
      clearOut(id, [iid]);
      j.later.set(lid, { kind: kind === 'ap' ? 'draft' : 'task', item_ids: [iid], title: cut(ttl, 140), status: 'later', come_back_at: tomorrow8() }).then(function () {
        back([iid]); say(T('Held. It comes back tomorrow at 08:00.'), function () { return j.later.set(lid, { status: 'open' }).then(function () { say(T('Back to waiting.')); }, fail); });
      }, function (e) { back([iid]); render(true); fail(e); });
      return;
    }
    if (x === 'edit') { S.editing = id; S.edit[id] = textOf(raw('approvals')[id] || {}); render(true); setTimeout(function () { var t = document.getElementById('ed-' + id); if (t) t.focus(); }, 30); return; }
    if (x === 'editx') { S.editing = null; delete S.edit[id]; render(true); return; }
    if (x === 'editsave') {
      var tx = String(S.edit[id] || '').trim(); if (!tx) { say('The text is empty. Nothing changed.', null, true); return; }
      S.editing = null; clearOut('ap:' + id, [id]);
      j.approvals.edit(id, tx).then(function () { back([id]); delete S.edit[id]; say(T('Changed and approved.'), function () { return j.approvals.undo(id).then(function () { back([id]); say(T('Back to waiting.')); }, fail); }); }, function (e) { back([id]); S.editing = id; render(true); fail(e); });
      return;
    }
    if (x === 'done') {
      var dk = 'dn-' + id; if (!armed(dk)) { arm(dk); return; } delete S.arm[dk];
      buzz(); clearOut('tk:' + id, [id]);
      j.tasks.done(id).then(function () { back([id]); say(T('Done.'), function () { return j.tasks.undo(id).then(function () { back([id]); say('Back on your list.'); }, fail); }); }, function (e) { back([id]); render(true); fail(e); });
      return;
    }
    if (x === 'tap') { el.disabled = true; j.tasks.tap(id).then(function () { say('J8 is on it. It shows here when done.'); }, function (e) { el.disabled = false; fail(e); }); return; }
    if (x === 'batchgo') {
      var b = batches().filter(function (z) { return z.k === id; })[0]; if (!b || S.busy) return;
      var ids = b.L.map(function (a) { return a.id; }); S.busy = true; clearOut('bt:' + id, ids);
      var ok = [];
      ids.reduce(function (p, i) { return p.then(function () { return j.approvals.approve(i).then(function () { ok.push(i); }, function () {}); }); }, Promise.resolve()).then(function () {
        S.busy = false; back(ids);
        if (!ok.length) { render(true); fail({}); return; }
        say(ok.length + ' approved' + (ok.length < ids.length ? ', ' + (ids.length - ok.length) + ' not saved' : '') + '.', function () {
          return ok.reduce(function (p, i) { return p.then(function () { return j.approvals.undo(i).catch(function () {}); }); }, Promise.resolve()).then(function () { back(ok); say(T('Back to waiting.')); });
        });
      });
      return;
    }
    if (x === 'kill') {
      var kk = 'kl-' + id; if (!armed(kk)) { arm(kk); return; } delete S.arm[kk];
      clearOut('go:' + id, [id]); j.approvals.kill(id).then(function () { back([id]); say(T('Stopped. It will not be sent.')); }, function (e) { back([id]); render(true); fail(e); });
      return;
    }
    if (x === 'copyopen') {
      var a = raw('approvals')[id] || {}, lk = link(a.link), t2 = textOf(a);
      if (t2) copyText(t2); if (lk) window.open(lk, '_blank', 'noopener'); say(lk ? 'Copied. Paste it there, then tap Mark sent.' : 'Copied. Send it, then tap Mark sent.'); return;
    }
    if (x === 'handsent') {
      var hs = 'hs-' + id; if (!armed(hs)) { arm(hs); return; } delete S.arm[hs];
      clearOut('rd:' + id, [id]); j.approvals.handSent(id).then(function () { back([id]); say('Marked sent.'); }, function (e) { back([id]); render(true); fail(e); });
      return;
    }
    if (x === 'oc') { var w = el.getAttribute('data-w'), ra = raw('approvals')[id] || {}, cur = ra.outcome || (ra.replied_at ? 'replied' : ''); j.approvals.reply(id, cur === w ? 'clear' : w).then(function () { say(cur === w ? 'Cleared.' : T('Saved') + ': ' + T(OUTW[w]) + '.'); }, fail); return; }
    if (x === 'stepsall') { S.stepsAll = !S.stepsAll; render(true); return; }
    if (x === 'unbatch') { S.unbatch[id] = true; S.open = null; render(true); return; }
    if (x === 'goall') { S.goAll = !S.goAll; render(true); return; }
    if (x === 'ocall') { S.ocAll = !S.ocAll; render(true); return; }
    if (x === 'askopen') { S.askOpen = id; render(true); setTimeout(function () { var t = document.getElementById('ask-' + id); if (t) t.focus(); }, 30); return; }
    if (x === 'askclose') { S.askOpen = null; render(true); return; }
    if (x === 'asksend') {
      var q = String(S.ask[id] || '').trim(); if (!q) return; el.disabled = true;
      j.inbox.send(el.getAttribute('data-p') || 'p-general', q, el.getAttribute('data-t') || null, el.getAttribute('data-a') || null).then(function () { S.ask[id] = ''; S.askOpen = null; say('Sent to J8. The answer shows in Talk.'); }, function (e) { el.disabled = false; fail(e); });
      return;
    }
    if (x === 'say') {
      var v = String(S.talk || '').trim(); if (!v) return; el.disabled = true;
      j.inbox.send('p-general', v).then(function () { S.talk = ''; if (document.activeElement) document.activeElement.blur(); say('Sent. J8 answers here.'); }, function (e) { el.disabled = false; fail(e); });
      return;
    }
    if (x === 'pause') { if (paused()) { x = 'resume'; } else { if (S.v !== 'settings') location.hash = '#settings'; arm('pz'); return; } }
    if (x === 'pausego') { if (!armed('pz')) { arm('pz'); return; } delete S.arm.pz; j.control.setPaused(true).then(function () { say('Sending paused. Nothing goes out.'); }, fail); return; }
    if (x === 'resume') { j.control.setPaused(false).then(function () { say('Sending resumed.'); }, fail); return; }
    if (x === 'ap') {
      var mode = el.getAttribute('data-w'), tp = raw('approvals')[id] || {};
      if (mode === 'hold') { if (tp.status === 'pending' || !tp.status) { say('Approve this template first. Auto starts after that.', null, true); return; } var ak = 'au-' + id; if (!armed(ak)) { arm(ak); return; } delete S.arm[ak]; }
      j.approvals.setAutopilot(id, mode).then(function () { say('Saved: ' + APW[mode] + '.'); }, fail); return; }
    if (x === 'lang') { setLang(el.getAttribute('data-w')); return; }
    if (x === 'push') { el.disabled = true; j.push.enable().then(function () { say('Alerts on for this phone.'); }, function (e) { el.disabled = false; say('Couldn\u2019t turn on alerts (' + (e && e.code || 'error') + ').', null, true); }); return; }
    if (x === 'signout') { j.auth.signOut().then(function () { S.signedOut = true; render(true); }); return; }
    if (x === 'undo') { var u = S.toast && S.toast.undo; if (u) { S.toast = null; clearTimeout(toastT); render(true); Promise.resolve(u()).catch(fail); } return; }
    if (x === 'si-back') { S.si = { step: 'email', email: S.si.email, msg: '', err: false, paste: false }; render(true); return; }
    if (x === 'si-paste') { S.si.paste = true; render(true); return; }
  }
  function copyText(tx) {
    var ok = false;
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(tx).catch(function () { copyOld(tx); }); ok = true; } } catch (e) { /* fall back */ }
    if (!ok) copyOld(tx);
  }
  function copyOld(tx) { try { var t = document.createElement('textarea'); t.value = tx; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); } catch (e) { /* ignore */ } }
  function setLang(l) {
    var he = l === 'he', d = document.documentElement; d.lang = he ? 'he' : 'en'; d.dir = he ? 'rtl' : 'ltr';
    try { localStorage.setItem('j8-lang', JSON.stringify(he ? 'he' : 'en')); } catch (e) { /* ignore */ }
    render(true);
  }
  function signIn(form) {
    var f = form.getAttribute('data-f'), j = J(); if (!j) return;
    var b = form.querySelector('button[type=submit]'); if (b) b.disabled = true;
    if (f === 'email') {
      var e = String(form.querySelector('input').value || '').trim().toLowerCase(); S.si.email = e;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { S.si.msg = 'Type your email address, like name@company.com.'; S.si.err = true; render(true); return; }
      j.auth.sendLink(e).then(function () { S.si = { step: 'code', email: e, msg: '', err: false, paste: false }; try { localStorage.setItem('j8v4:sent', String(Date.now())); } catch (x) { /* ignore */ } render(true); setTimeout(function () { var c = document.getElementById('si-c'); if (c) c.focus(); }, 30); },
        function (er) { S.si.msg = 'Couldn\u2019t send the email' + (er && er.message ? ': ' + er.message : '') + '. Try again in a minute.'; S.si.err = true; render(true); });
      return;
    }
    var p = f === 'code' ? j.auth.verifyCode(S.si.email, form.querySelector('input').value) : j.auth.signInWithLink(form.querySelector('textarea').value);
    p.then(function (ok) { if (ok === false && !safe(function () { return j.status().user; }, null)) throw { code: 'bad' }; S.signedOut = false; S.si = { step: 'email', email: S.si.email, msg: '', err: false }; render(true); })
      .catch(function () { S.si.msg = f === 'code' ? 'That code didn\u2019t work. Check the newest email and type it again.' : 'That link didn\u2019t work. Ask for a new email.'; S.si.err = true; render(true); });
  }

  /* ---------- wiring ---------- */
  function route() { var h = String(location.hash || '').replace(/^#\/?/, ''); var v = /^(today|approvals|talk|settings)$/.test(h) ? h : 'today'; if (v !== S.v) { S.v = v; S.open = v === 'today' ? '__first__' : null; S.editing = null; window.scrollTo(0, 0); } render(true); }
  function start() {
    root = document.getElementById('j20'); if (!root) return;
    root.addEventListener('click', function (e) { var el = e.target.closest('[data-x]'); if (el && root.contains(el) && !el.disabled) { e.preventDefault(); act(el); } });
    root.addEventListener('input', function (e) { var t = e.target; if (t.hasAttribute('data-say')) S.talk = t.value; else if (t.hasAttribute('data-edit')) S.edit[t.getAttribute('data-edit')] = t.value; else if (t.hasAttribute('data-ask')) S.ask[t.getAttribute('data-ask')] = t.value; });
    root.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && e.target.hasAttribute && e.target.hasAttribute('data-say')) { var b = root.querySelector('[data-x="say"]'); if (b) act(b); } });
    root.addEventListener('focusout', function () { setTimeout(function () { if (deferred && !typing()) render(); }, 0); });
    root.addEventListener('submit', function (e) { var f = e.target.closest('form.si'); if (f) { e.preventDefault(); signIn(f); } });
    window.addEventListener('hashchange', route);
    var j = J(); if (!j) { root.innerHTML = '<p class="empty">J8NIX could not start. Reload the page.</p>'; return; }
    (j.COLLECTIONS || []).forEach(function (c) { try { j.on(c, function () { render(); }); } catch (e) { /* unknown collection */ } });
    try { j.on('status', function (st) { if (st && st.error === 'signed_out' && !st.user) { S.signedOut = true; } render(); }); } catch (e) { /* ignore */ }
    setInterval(function () { render(); }, 60000);
    route();
    boot();
  }
  async function boot() {
    var j = J(), h = location.hash;
    var link1 = /[?&]token_hash=/.test(location.search) || h.indexOf('refresh_token=') > -1;
    if (!link1 && j.warm && j.warm()) render(true);
    if (link1) { try { await j.auth.signInWithLink(location.href); } catch (e) { S.si.msg = 'That sign-in link has expired. Ask for a new one.'; S.si.err = true; } history.replaceState(null, '', location.pathname); }
    var ok = false; try { ok = await j.connect(); } catch (e) { ok = false; }
    S.signedOut = !safe(function () { return j.status().user; }, null);
    if (S.signedOut) { var sent = Number(safe(function () { return localStorage.getItem('j8v4:sent'); }, 0) || 0), em = safe(function () { return localStorage.getItem('j8v4:email'); }, '') || ''; if (sent && Date.now() - sent < 36e5 && em) S.si = { step: 'code', email: em, msg: S.si.msg, err: S.si.err }; }
    render(true);
    void ok;
  }
  /* the installed app updates itself: check when it comes to the front; reload once when a new version takes over (not while typing) */
  if ('serviceWorker' in navigator && !window.J20_NO_SW) {
    var hadSW = !!navigator.serviceWorker.controller, swDone = false;
    navigator.serviceWorker.register('sw.js', { scope: './' }).then(function (reg) {
      var chk = function () { if (document.visibilityState === 'visible') { reg.update().catch(function () {}); try { if (navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ type: 'j8-opened' }); } catch (e) { /* ignore */ } } };
      document.addEventListener('visibilitychange', chk); setInterval(chk, 30 * 60 * 1000); chk();
    }).catch(function () {});
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (!hadSW || swDone) return; swDone = true; if (!typing()) location.reload(); });
  }
  window.J20 = { VER: VER, _S: S, _render: render };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
