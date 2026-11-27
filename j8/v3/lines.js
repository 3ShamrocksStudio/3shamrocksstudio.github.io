/* =====================================================================
   J8NIX Lines · 3.0 preview (27 Nov 2026) · design note: ../design/V30-LINES.md
   One idea: every project is a line on one map. The AI workers move each line forward; your decisions are the gates
   where a line waits. Home = all lines on one time map (today marked). Tap a line = that project's own space: its
   process as stations, what waits at its gate (Go / Change / Stop, Undo), and its own timeline (ahead, today, earlier).
   Data: window.J8 (../j8-data.js), the same engine, sign-in and writes as /j8/. Real rows only; nothing is invented.
   Colour = project identity only (9 line colours); status = glyph + word in ink, never colour alone.
   Revert: delete j8/v3/ (the live app at /j8/ does not load anything from here).
   ===================================================================== */
(function () {
  'use strict';
  var VER = '3.0.3';
  var LINE = ['#2357D9', '#C05600', '#7C3AED', '#0B7FA8', '#A86F00', '#C42C78', '#56627A', '#138A72', '#8A5A2E'];
  var TX = {
    en: {
      preview: 'Preview of the new J8NIX. Real data, same sign-in.', openLive: 'Open today’s J8NIX',
      jump: 'Projects', jumpPh: 'Go to a project…', lang: 'עברית',
      gatesN: '{n} things wait for you', gates1: '1 thing waits for you', gates0: 'Nothing waits for you',
      inN: 'in {n} projects', in1: 'in 1 project', briefSub: 'Last 7 days: {s} sent, {r} replied. {l} lines running.',
      allMoving: 'Every line is moving on its own.',
      brand: 'Lines', hidden: 'Hidden', evRunF1: '1 failed', waits: 'Waits for you', moving: 'Moving', quiet: 'Quiet', late: 'Late', done: 'Done', parked: 'Parked', waiting: 'Waiting on others',
      resting: 'Resting lines', today: 'Today', d14: '2 weeks ago', ahead: 'ahead',
      kSent: 'went out', kRep: 'reply', kNo: 'no thanks', kDone: 'step done', kDue: 'step ahead', kLate: 'late', kGate: 'waits for you',
      laneSr: '{name}. {st}. {s} sent and {r} replies in 2 weeks.', next: 'Next', nextOn: 'next: {x}, {d}',
      allLines: 'All lines', prev: 'Previous project', nextP: 'Next project',
      process: 'How this line runs', st_found: 'Drafted', st_you: 'Your turn', st_go: 'Going out', st_sent: 'Sent', st_rep: 'Replied', st_deal: 'Deal',
      sub_found: '30 days', sub_you: 'now', sub_go: 'now', sub_sent: '30 days', sub_rep: '30 days', sub_deal: 'open',
      procNote: 'Tap a station to see what is in it.',
      gate: 'At the gate', gateSub: 'The line waits here for your decision.', gateNone: 'Nothing waits for you on this line.',
      list_found: 'Drafted in the last 30 days', list_go: 'Approved, going out', list_sent: 'Sent in the last 30 days', list_rep: 'Replied in the last 30 days', list_deal: 'Open deals', listNone: 'Nothing here right now.',
      go: 'Go', change: 'Change', stop: 'Stop', stopAgain: 'Tap again to stop', doneB: 'Done', doneAgain: 'Tap again: done', save: 'Save and go', cancel: 'Cancel', open: 'Open',
      goT: 'Approved. It goes out on the next run.', hardAgain: 'The checker flagged this. Tap again to send', noOrg: 'No team found for this account.', checker: 'Checker: {x}', chooseLive: 'Pick an option in J8NIX', stopT: 'Stopped. It will not be sent.', doneT: 'Done.', editT: 'Changed and approved.', undo: 'Undo', backT: 'Back to waiting.', fail: 'Couldn’t save. Try again.',
      yourStep: 'Your step', draftTo: 'to {x}', viaX: 'via {x}',
      line: 'This line over time', aheadH: 'Ahead', earlier: 'Earlier', showEarlier: 'Show earlier days',
      evSentN: '{n} went out', evSent1: '1 went out', evRepN: '{n} replied', evRep1: '1 replied', evNoN: '{n} said no thanks', evNo1: '1 said no thanks',
      evDone: 'Done: {x}', evDue: 'Due: {x}', evLate: 'Late: {x}', evMs: 'Milestone: {x}', evRunN: 'Workers ran {n} times', evRun1: 'Workers ran once', evRunF: '{n} failed',
      todayNow: 'Now: {x}', nothingDay: 'Nothing happened.', quietDays: 'Quiet {n} days',
      workers: 'Workers on this line', workersSub: 'Last 7 days.', noWorkers: 'No worker run on this line in the last 7 days.', ranN: 'ran {n} times', ran1: 'ran once', lastOk: 'last: OK', lastNothing: 'last: nothing to do', lastFail: 'last: failed', ago: '{x} ago',
      signedOut: 'Sign in first', signedOutP: 'This preview uses the same sign-in as J8NIX. Sign in there once, then come back to this page.', signIn: 'Sign in on J8NIX',
      loading: 'Loading your lines', offline: 'Showing the last saved data. Not connected right now.', updated: 'Updated {x}',
      noLines: 'No active projects yet.', h: 'h', m: 'min', d: 'd'
    },
    he: {
      preview: 'תצוגה מקדימה של J8NIX החדש. נתונים אמיתיים, אותה כניסה.', openLive: 'לפתוח את J8NIX של היום',
      jump: 'פרויקטים', jumpPh: 'לעבור לפרויקט…', lang: 'English',
      gatesN: '{n} דברים מחכים לך', gates1: 'דבר אחד מחכה לך', gates0: 'שום דבר לא מחכה לך',
      inN: 'ב‑{n} פרויקטים', in1: 'בפרויקט אחד', briefSub: '7 \u05d4\u05d9\u05de\u05d9\u05dd \u05d4\u05d0\u05d7\u05e8\u05d5\u05e0\u05d9\u05dd: {s} \u05e0\u05e9\u05dc\u05d7\u05d5, {r} \u05e2\u05e0\u05d5. {l} \u05e7\u05d5\u05d5\u05d9\u05dd \u05e4\u05e2\u05d9\u05dc\u05d9\u05dd.',
      allMoving: 'כל הקווים זזים לבד.',
      brand: 'קווים', hidden: 'מוסתר', evRunF1: 'אחת נכשלה', waits: 'מחכה לך', moving: 'בתנועה', quiet: 'שקט', late: 'באיחור', done: 'הושלם', parked: 'בהקפאה', waiting: 'מחכה לאחרים',
      resting: 'קווים שנחים', today: 'היום', d14: 'לפני שבועיים', ahead: 'לפנינו',
      kSent: 'נשלח', kRep: 'תשובה', kNo: 'לא תודה', kDone: 'צעד שבוצע', kDue: 'צעד לפנינו', kLate: 'באיחור', kGate: 'מחכה לך',
      laneSr: '{name}. {st}. {s} נשלחו ו‑{r} תשובות בשבועיים.', next: 'הבא', nextOn: 'הבא: {x}, {d}',
      allLines: 'כל הקווים', prev: 'הפרויקט הקודם', nextP: 'הפרויקט הבא',
      process: 'איך הקו הזה רץ', st_found: 'נכתבו', st_you: 'התור שלך', st_go: 'יוצאים', st_sent: 'נשלחו', st_rep: 'ענו', st_deal: 'עסקה',
      sub_found: '30 יום', sub_you: 'עכשיו', sub_go: 'עכשיו', sub_sent: '30 יום', sub_rep: '30 יום', sub_deal: 'פתוחות',
      procNote: 'הקש על תחנה כדי לראות מה יש בה.',
      gate: 'בשער', gateSub: 'הקו מחכה כאן להחלטה שלך.', gateNone: 'שום דבר לא מחכה לך בקו הזה.',
      list_found: 'נכתבו ב‑30 הימים האחרונים', list_go: 'אושרו, יוצאים', list_sent: 'נשלחו ב‑30 הימים האחרונים', list_rep: 'ענו ב‑30 הימים האחרונים', list_deal: 'עסקאות פתוחות', listNone: 'אין כאן כלום כרגע.',
      go: 'לשלוח', change: 'לשנות', stop: 'עצור', stopAgain: 'הקש שוב כדי לעצור', doneB: 'בוצע', doneAgain: 'הקש שוב: בוצע', save: 'לשמור ולשלוח', cancel: 'ביטול', open: 'לפתוח',
      hardAgain: 'הבודק סימן בעיה. הקש שוב כדי לשלוח', checker: 'הבודק: {x}', chooseLive: 'לבחור אפשרות ב‑J8NIX', noOrg: 'לא נמצא ארגון לחשבון הזה.', goT: 'אושר. זה יוצא בריצה הבאה.', stopT: 'נעצר. זה לא יישלח.', doneT: 'בוצע.', editT: 'שונה ואושר.', undo: 'בטל', backT: 'חזר להמתנה.', fail: 'השמירה נכשלה. נסה שוב.',
      yourStep: 'הצעד שלך', draftTo: 'אל {x}', viaX: 'דרך {x}',
      line: 'הקו הזה לאורך זמן', aheadH: 'לפנינו', earlier: 'קודם', showEarlier: 'להראות ימים קודמים',
      evSentN: '{n} יצאו', evSent1: 'אחד יצא', evRepN: '{n} ענו', evRep1: 'אחד ענה', evNoN: '{n} אמרו לא תודה', evNo1: 'אחד אמר לא תודה',
      evDone: 'בוצע: {x}', evDue: 'מועד: {x}', evLate: 'באיחור: {x}', evMs: 'אבן דרך: {x}', evRunN: 'העובדים רצו {n} פעמים', evRun1: 'העובדים רצו פעם אחת', evRunF: '{n} נכשלו',
      todayNow: 'עכשיו: {x}', nothingDay: 'לא קרה כלום.', quietDays: 'שקט {n} ימים',
      workers: 'העובדים בקו הזה', workersSub: '7 הימים האחרונים.', noWorkers: 'אין ריצות עובדים בקו הזה ב‑7 הימים האחרונים.', ranN: 'רץ {n} פעמים', ran1: 'רץ פעם אחת', lastOk: 'אחרון: תקין', lastNothing: 'אחרון: אין מה לעשות', lastFail: 'אחרון: נכשל', ago: 'לפני {x}',
      signedOut: 'קודם צריך להיכנס', signedOutP: 'התצוגה המקדימה משתמשת באותה כניסה כמו J8NIX. היכנס שם פעם אחת וחזור לכאן.', signIn: 'להיכנס ב‑J8NIX',
      loading: 'טוען את הקווים', offline: 'מוצגים הנתונים האחרונים שנשמרו. אין חיבור כרגע.', updated: 'עודכן {x}',
      noLines: 'עדיין אין פרויקטים פעילים.', h: 'ש׳', m: 'דק׳', d: 'ימים'
    }
  };
  var S = { lang: 'en', view: 'home', pid: null, open: {}, arm: {}, edit: null, edTx: '', sta: null, more: 14, jump: false, jq: '', jsel: 0, conn: 'wait', at: 0 };
  try { S.lang = JSON.parse(localStorage.getItem('j8-lang')) === 'he' ? 'he' : 'en'; } catch (e) { /* default */ }
  var R = document.getElementById('app'), toastEl = document.getElementById('toast'), undoFn = null, toastT = 0;

  /* ---------- helpers ---------- */
  function t(k, o) { var s = (TX[S.lang] && TX[S.lang][k]) || TX.en[k] || k; if (o) Object.keys(o).forEach(function (x) { s = s.split('{' + x + '}').join(o[x]); }); return s; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clean(s) { return String(s || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim(); }
  function bdi(s) { return '<bdi>' + esc(s) + '</bdi>'; }
  function tl(k, x, o) { return esc(t(k, Object.assign({ x: '\u0001' }, o || {}))).replace('\u0001', bdi(x)); }
  function cut(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/[\s,;:.]+$/, '') + '…' : s; }
  function first(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); var m = /^(.+?[.!?])(\s|$)/.exec(s); return cut(m && m[1].length > 24 ? m[1] : s, n); }
  function pd(v) { if (v == null || v === '') return NaN; return Date.parse(String(v).replace(' ', 'T').replace(/\+00$/, 'Z')); }
  var DKF = (function () { try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }); } catch (e) { return null; } })();
  function dk(ms) { if (isNaN(ms)) return ''; return DKF ? DKF.format(new Date(ms)) : new Date(ms).toISOString().slice(0, 10); }
  function dkOf(v) { var s = String(v == null ? '' : v).trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; return dk(pd(s)); }
  function kTs(k) { return Date.parse(k + 'T12:00:00Z'); }
  function kAdd(k, n) { return new Date(kTs(k) + n * 864e5).toISOString().slice(0, 10); }
  function kDiff(a, b) { return Math.round((kTs(a) - kTs(b)) / 864e5); }
  function loc() { return S.lang === 'he' ? 'he-IL' : 'en-GB'; }
  function dLab(k, o) { try { return new Date(kTs(k)).toLocaleDateString(loc(), Object.assign({ timeZone: 'UTC' }, o || { day: 'numeric', month: 'short' })); } catch (e) { return k; } }
  function dLong(k) { return dLab(k, { weekday: 'short', day: 'numeric', month: 'short' }); }
  function agoTx(ms) { var m = Math.max(0, Math.round((Date.now() - ms) / 6e4)); return m < 60 ? m + ' ' + t('m') : m < 2880 ? Math.round(m / 60) + ' ' + t('h') : Math.round(m / 1440) + ' ' + t('d'); }
  function J() { return window.J8; }
  function raw(c) { try { return J().raw(c) || {}; } catch (e) { return {}; } }
  function rows(c) { var o = raw(c); return Object.keys(o).map(function (id) { return Object.assign({ id: id }, o[id]); }); }
  function cvg() { return '<svg class="cv" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }

  /* ---------- the model: projects, their lines, their gates ---------- */
  var PROJ = {}, NAME = {};
  function isTpl(a) { return a.kind === 'template' || a.label === 'Template'; }
  function pidOf(product) { var s = String(product || '').trim(); if (!s) return ''; if (PROJ[s]) return s; return NAME[s.toLowerCase()] || s; }
  function ord(a, b) { var x = Number(a.order), y = Number(b.order); return (isNaN(x) || a.order == null ? 99 : x) - (isNaN(y) || b.order == null ? 99 : y) || String(a.name).localeCompare(String(b.name)); }
  function model() {
    var P = rows('projects'); PROJ = {}; NAME = {};
    P.forEach(function (p) { PROJ[p.id] = p; NAME[String(p.name || '').trim().toLowerCase()] = p.id; });
    var act = P.filter(function (p) { return p.hidden !== true && ['parked', 'killed', 'done'].indexOf(p.status) < 0; }).sort(ord);
    var rest = P.filter(function (p) { return act.indexOf(p) < 0 && p.status !== 'killed'; }).sort(ord);
    var M = {}, now = Date.now(), k0 = dk(now), d7 = now - 7 * 864e5, d30 = now - 30 * 864e5;
    act.concat(rest).forEach(function (p, i) {
      M[p.id] = { p: p, c: i < act.length ? LINE[i % LINE.length] : '#8A93A8', act: i < act.length, wait: [], go: [], found: [], sent: [], rep: [], deal: [], days: {}, steps: [], runs: [], s7: 0, r7: 0, s14: 0, r14: 0, late: 0, next: null, last: 0 };
    });
    var day = function (m, k) { return m.days[k] || (m.days[k] = { s: 0, r: 0, no: 0, ev: [], run: 0, fail: 0 }); };
    rows('approvals').forEach(function (a) {
      if (isTpl(a)) return; var m = M[pidOf(a.product)]; if (!m) return;
      var st = a.status || 'pending', ct = pd(a.created), sa = pd(a.sent_at), ra = pd(a.replied_at);
      if (st === 'pending' && a.source !== 'j8nix-app') m.wait.push({ k: 'ap', a: a, at: ct });
      if (st === 'approved' || st === 'edited' || st === 'queued') m.go.push(a);
      if (!isNaN(ct) && ct >= d30) m.found.push(a);
      if (st === 'sent' && !isNaN(sa)) { var c = day(m, dk(sa)); c.s++; if (sa >= d30) m.sent.push(a); if (sa >= d7) m.s7++; if (sa >= now - 14 * 864e5) m.s14++; m.last = Math.max(m.last, sa); }
      if (!isNaN(ra) && ra <= now + 6e4) { var c2 = day(m, dk(ra)); if (a.outcome === 'rejection') c2.no++; else { c2.r++; if (ra >= d7) m.r7++; if (ra >= now - 14 * 864e5) m.r14++; } if (ra >= d30) m.rep.push(a); m.last = Math.max(m.last, ra); }
    });
    rows('tasks').forEach(function (tk) {
      var m = M[tk.project_id]; if (!m || tk.status === 'dropped') return;
      var dn = pd(tk.done_at), done = tk.status === 'done', due = dkOf(tk.due);
      if (done) { var k = !isNaN(dn) ? dk(dn) : due; if (k) day(m, k).ev.push({ k: 'done', x: tk.title }); return; }
      if (String(tk.owner || '').toLowerCase() === 'dave') m.wait.push({ k: 'tk', tk: tk, at: pd(tk.created_at) || 0 });
      if (due) { var it = { k: due < k0 ? 'late' : 'due', x: tk.title, d: due, own: tk.owner }; m.steps.push(it); if (due < k0) m.late++; }
    });
    Object.keys(M).forEach(function (id) {
      var m = M[id], p = m.p, mk = dkOf(p.milestone_at);
      if (mk && String(p.milestone || '').trim()) { m.steps.push({ k: mk < k0 ? 'late' : 'ms', x: p.milestone, d: mk }); if (mk < k0) m.late++; }
      m.steps.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
      m.next = m.steps.filter(function (s) { return s.d >= k0; })[0] || null;
      m.steps.forEach(function (s) { if (s.d >= k0) day(m, s.d).ev.push({ k: s.k, x: s.x }); else if (s.k === 'late') day(m, s.d).ev.push({ k: 'late', x: s.x }); });
      m.wait.sort(function (a, b) { return (a.k === 'tk') - (b.k === 'tk') || (a.at || 0) - (b.at || 0); });
    });
    rows('deals').forEach(function (d) { var m = M[pidOf(d.product)]; if (m && d.stage !== 'lost' && d.stage !== 'won') m.deal.push(d); });
    rows('runs').forEach(function (r) {
      var ids = [r.project].concat(r.projects || []).filter(Boolean), ts = pd(r.ended || r.started); if (isNaN(ts) || ts < now - 30 * 864e5) return;
      ids.filter(function (x, i) { return ids.indexOf(x) === i; }).forEach(function (pid) { var m = M[pid]; if (!m) return; m.runs.push(r); var c = day(m, dk(ts)); c.run++; if (r.status === 'failed') c.fail++; });
    });
    Object.keys(M).forEach(function (id) { var m = M[id]; m.st = status(m); });
    return { act: act.map(function (p) { return M[p.id]; }), rest: rest.map(function (p) { return M[p.id]; }), M: M, k0: k0 };
  }
  function status(m) {
    var p = m.p;
    if (!m.act) return p.status === 'done' ? { k: 'done', g: '✓' } : p.status === 'parked' || p.status === 'killed' ? { k: 'parked', g: '‖' } : p.status === 'waiting' ? { k: 'waiting', g: '○' } : { k: 'hidden', g: '‖' };
    if (m.wait.length) return { k: 'waits', g: '■', n: m.wait.length };
    if (m.late) return { k: 'late', g: '▲' };
    if (p.status === 'waiting') return { k: 'waiting', g: '○' };
    var recent = m.last > Date.now() - 7 * 864e5 || m.runs.some(function (r) { return pd(r.ended || r.started) > Date.now() - 2 * 864e5 && r.status === 'ok'; });
    return recent ? { k: 'moving', g: '▶' } : { k: 'quiet', g: '○' };
  }
  function stHtml(st) { return '<span class="st' + (st.k === 'late' ? ' late' : '') + '"><span class="g" aria-hidden="true">' + (S.lang === 'he' && st.g === '▶' ? '◀' : st.g) + '</span>' + esc(t(st.k)) + '</span>'; }
  var MD = null;
  function md() { return MD || (MD = model()); }

  /* ---------- home: the map ---------- */
  function homeOrder(A) { return A.slice().sort(function (a, b) { return (b.wait.length > 0) - (a.wait.length > 0) || (b.st.k === 'late') - (a.st.k === 'late') || ord(a.p, b.p); }); }
  function wide() { return (window.innerWidth || 375) >= 900; }
  function span() { return wide() ? { back: 21, fwd: 7 } : { back: 14, fwd: 7 }; }
  function pos(k, k0, sp) { var tot = sp.back + sp.fwd; return ((kDiff(k, k0) + sp.back) / tot * 100); }
  function ruler(k0, sp) {
    var h = '', step = wide() ? 7 : 7;
    for (var d = -sp.back; d <= sp.fwd; d += step) { var k = kAdd(k0, d), x = pos(k, k0, sp); if (d === 0 || d === sp.fwd) continue; h += '<span' + (d === -sp.back ? ' class="e0"' : '') + ' style="inset-inline-start:' + x.toFixed(2) + '%" aria-hidden="true">' + esc(dLab(k)) + '</span>'; }
    h += '<span class="now" style="inset-inline-start:' + pos(k0, k0, sp).toFixed(2) + '%">' + esc(t('today')) + '</span>';
    return '<div class="ruler" aria-hidden="true"><div></div><div class="rt">' + h + '</div></div>';
  }
  function track(m, k0, sp) {
    var start = kAdd(k0, -sp.back), end = kAdd(k0, sp.fwd), keys = Object.keys(m.days).filter(function (k) { return k >= start && k <= end; }).sort();
    var past = keys.filter(function (k) { return k <= k0; }), fut = keys.filter(function (k) { return k > k0; });
    var any = Object.keys(m.days).some(function (k) { var c = m.days[k]; return k < start && (c.s || c.r || c.no || c.ev.length); });
    var a = past.length ? (any ? start : past[0]) : (any ? start : k0), h = '';
    var x0 = pos(a, k0, sp), xt = pos(k0, k0, sp);
    if (!past.length && !any) h += '<i class="ln none" style="inset-inline-start:0;width:' + xt.toFixed(2) + '%"></i>';
    else if (xt > x0) h += '<i class="ln' + (m.st.k === 'quiet' || !m.act ? ' dim' : '') + '" style="inset-inline-start:' + x0.toFixed(2) + '%;width:' + (xt - x0).toFixed(2) + '%"></i>';
    var fe = fut.length ? fut[fut.length - 1] : (m.next ? end : null);
    if (fe) { var xe = Math.min(100, pos(fe, k0, sp)); h += '<i class="ln fut" style="inset-inline-start:' + xt.toFixed(2) + '%;width:' + (xe - xt).toFixed(2) + '%"></i>'; }
    keys.forEach(function (k) {
      var c = m.days[k], x = pos(k, k0, sp).toFixed(2), st = 'inset-inline-start:' + x + '%';
      if (c.s) h += '<i class="mk s' + (c.s >= 6 ? ' n3' : c.s >= 3 ? ' n2' : '') + '" style="' + st + '"></i>';
      if (c.r) h += '<i class="mk r" style="' + st + '"></i>'; else if (c.no) h += '<i class="mk no" style="' + st + '"></i>';
      var late = c.ev.some(function (e) { return e.k === 'late'; }), due = c.ev.some(function (e) { return e.k === 'due' || e.k === 'ms'; }), dn = c.ev.some(function (e) { return e.k === 'done'; });
      if (late) h += '<i class="mk lt" style="' + st + '"></i>';
      if (due && k > k0) h += '<i class="mk d due" style="' + st + '"></i>'; else if (dn) h += '<i class="mk d" style="' + st + '"></i>';
    });
    if (m.wait.length) h += '<i class="mk gate" style="inset-inline-start:' + xt.toFixed(2) + '%">' + m.wait.length + '</i>';
    return h;
  }
  function vHome() {
    var D = md(), k0 = D.k0, sp = span(), W = 0, WP = 0, s7 = 0, r7 = 0;
    D.act.forEach(function (m) { W += m.wait.length; if (m.wait.length) WP++; s7 += m.s7; r7 += m.r7; });
    var lead = W === 0 ? esc(t('gates0')) : (W === 1 ? esc(t('gates1')) : esc(t('gatesN', { n: '§' })).replace('§', '<b>' + W + '</b>')) + ' ' + esc(WP === 1 ? t('in1') : t('inN', { n: WP }));
    var h = '<section class="brief enter"><h1>' + lead + '</h1><p>' + esc(t('briefSub', { s: s7, r: r7, l: D.act.length })) + (W === 0 ? ' ' + esc(t('allMoving')) : '') + '</p></section>';
    if (!D.act.length) return h + '<p class="empty">' + esc(t('noLines')) + '</p>';
    var L = homeOrder(D.act);
    h += '<div class="map" role="list" aria-label="' + esc(t('allLines')) + '">' + ruler(k0, sp) + '<div class="lanes">';
    var xt = pos(k0, k0, sp);
    L.forEach(function (m) {
      var p = m.p, nx = m.next ? t('nextOn', { x: cut(m.next.x, 44), d: dLab(m.next.d) }) : '';
      var ph = m.wait.length ? cut(m.wait[0].k === 'ap' ? apLine(m.wait[0].a).b : m.wait[0].tk.title, 60) : (nx || first(p.now, 70));
      var sr = t('laneSr', { name: p.name, st: t(m.st.k) + (m.wait.length ? ' ' + m.wait.length : ''), s: m.s14, r: m.r14 }) + (nx ? ' ' + nx + '.' : '');
      h += '<div class="lane" role="listitem" style="--lc:' + m.c + '"><button type="button" data-x="p" data-id="' + esc(p.id) + '" aria-label="' + esc(sr) + '">'
        + '<span class="lbl"><b><span class="chip" aria-hidden="true"></span><bdi class="nm">' + esc(cut(p.name, 40)) + '</bdi>' + stHtml(m.st) + '</b><small dir="auto">' + esc(ph) + '</small></span>'
        + '<span class="trk" aria-hidden="true"><i class="today" style="inset-inline-start:' + xt.toFixed(2) + '%"></i>' + track(m, k0, sp) + '</span></button></div>';
    });
    h += '</div></div>';
    h += '<div class="key" aria-hidden="true"><span><i class="mk s" style="--lc:#56627A"></i>' + esc(t('kSent')) + '</span><span><i class="mk r"></i>' + esc(t('kRep')) + '</span><span><i class="mk no"></i>' + esc(t('kNo')) + '</span><span><i class="mk d"></i>' + esc(t('kDone')) + '</span><span><i class="mk d due"></i>' + esc(t('kDue')) + '</span><span><i class="mk lt"></i>' + esc(t('kLate')) + '</span><span><i class="mk gate">2</i>' + esc(t('kGate')) + '</span></div>';
    if (D.rest.length) {
      h += '<details class="rest"' + (S.open.rest ? ' open' : '') + ' data-k="rest"><summary>' + cvg() + esc(t('resting')) + ' · ' + D.rest.length + '</summary><div class="rlist">'
        + D.rest.map(function (m) { return '<button type="button" data-x="p" data-id="' + esc(m.p.id) + '" style="--lc:' + m.c + '"><i class="chip" aria-hidden="true"></i><span><b>' + bdi(cut(m.p.name, 48)) + ' · ' + esc(t(m.st.k)) + '</b><small dir="auto">' + esc(first(m.p.now, 80)) + '</small></span></button>'; }).join('') + '</div></details>';
    }
    return h;
  }

  /* ---------- a project's own space ---------- */
  function seq(m) { var D = md(); if (m && !m.act) return D.rest; if (m) return homeOrder(D.act); return homeOrder(D.act).concat(D.rest); }
  function apLine(a) { var lb = String(a.label || a.subject || '').trim(); if (lb && a.to && lb.length < 28 && lb.indexOf(a.to) < 0) lb += ' \u00b7 ' + cut(a.to, 50); return { b: lb || (a.to ? cut(a.to, 60) : '') || a.id, s: a.channel && !/^https?:/.test(a.channel) ? cut(a.channel, 60) : '' }; }
  function textOf(a) { return a && a.edited_body ? a.edited_body : (a && a.body) || ''; }
  function itemAp(a, mode) {
    var k = 'a:' + a.id, op = S.open[k], L = apLine(a), body = '';
    if (op) {
      if (S.edit === a.id) body = '<div class="bd"><label class="sr" for="ed">' + esc(t('change')) + '</label><textarea id="ed" dir="auto">' + esc(S.edTx) + '</textarea><div class="acts" style="margin-top:8px"><button type="button" class="b go" data-x="esave" data-id="' + esc(a.id) + '">' + esc(t('save')) + '</button><button type="button" class="b" data-x="ecancel">' + esc(t('cancel')) + '</button></div></div>';
      else {
        var tx = textOf(a);
        body = '<div class="bd">' + (a.subject && a.subject !== L.b ? '<p class="meta" dir="auto">' + esc(a.subject) + '</p>' : '') + (tx ? '<div class="msg" dir="auto">' + esc(tx) + '</div>' : '') + (a.channel ? '<p class="meta">' + tl('viaX', cut(a.channel, 120)) + '</p>' : '');
        var lf = (S.lint || {})[a.id]; if (mode === 'wait' && lf && lf.flags && lf.flags.length) body += '<p class="meta lt">' + tl('checker', lf.flags.map(function (f) { return typeof f === 'string' ? f : (f && (f.msg || f.code)) || ''; }).filter(Boolean).join(', ')) + '</p>';
        if (mode === 'wait' && a.kind === 'design') body += '<div class="acts"><a class="b go" href="../">' + esc(t('chooseLive')) + '</a></div>';
        else if (mode === 'wait') body += '<div class="acts"><button type="button" class="b go' + (S.arm['h' + a.id] ? ' arm' : '') + '" data-x="go" data-id="' + esc(a.id) + '">' + esc(S.arm['h' + a.id] ? t('hardAgain') : t('go')) + '</button>' + (tx ? '<button type="button" class="b" data-x="edit" data-id="' + esc(a.id) + '">' + esc(t('change')) + '</button>' : '') + '<button type="button" class="b stop' + (S.arm['s' + a.id] ? ' arm' : '') + '" data-x="stop" data-id="' + esc(a.id) + '">' + esc(S.arm['s' + a.id] ? t('stopAgain') : t('stop')) + '</button></div>';
        else if (mode === 'go') body += '<div class="acts"><button type="button" class="b stop' + (S.arm['s' + a.id] ? ' arm' : '') + '" data-x="stop" data-id="' + esc(a.id) + '">' + esc(S.arm['s' + a.id] ? t('stopAgain') : t('stop')) + '</button></div>';
        body += '</div>';
      }
    }
    return '<li class="it" data-open="' + (op ? 1 : 0) + '"><button type="button" class="rx" data-x="tog" data-id="' + esc(k) + '" aria-expanded="' + !!op + '"><span class="g' + (mode === 'wait' ? '' : ' mv') + '" aria-hidden="true"></span><span class="tx"><b dir="auto">' + esc(op ? L.b : cut(L.b, 70)) + '</b>' + (L.s ? '<small dir="auto">' + esc(L.s) + '</small>' : '') + '</span>' + cvg() + '</button>' + body + '</li>';
  }
  function itemTk(tk) {
    var k = 't:' + tk.id, op = S.open[k], arm = S.arm['d' + tk.id];
    var body = op ? '<div class="bd">' + (tk.action ? '<p class="meta" dir="auto">' + esc(tk.action) + '</p>' : '') + (tk.due ? '<p class="meta">' + esc(t('evDue', { x: dLong(dkOf(tk.due)) })) + '</p>' : '') + '<div class="acts"><button type="button" class="b go' + (arm ? ' arm' : '') + '" data-x="done" data-id="' + esc(tk.id) + '">' + esc(arm ? t('doneAgain') : t('doneB')) + '</button>' + (tk.link ? '<a class="b" href="' + esc(tk.link) + '" target="_blank" rel="noopener">' + esc(t('open')) + '</a>' : '') + '</div></div>' : '';
    return '<li class="it" data-open="' + (op ? 1 : 0) + '"><button type="button" class="rx" data-x="tog" data-id="' + esc(k) + '" aria-expanded="' + !!op + '"><span class="g tk" aria-hidden="true"></span><span class="tx"><b dir="auto">' + esc(op ? tk.title : cut(tk.title, 70)) + '</b><small>' + esc(t('yourStep')) + (tk.due ? ' · ' + esc(dLab(dkOf(tk.due))) : '') + '</small></span>' + cvg() + '</button>' + body + '</li>';
  }
  function stations(m) {
    var S6 = [['found', m.found.length], ['you', m.wait.length], ['go', m.go.length], ['sent', m.sent.length], ['rep', m.rep.filter(function (a) { return a.outcome !== 'rejection'; }).length], ['deal', m.deal.length]];
    return '<section class="proc" aria-labelledby="proch"><h2 id="proch">' + esc(t('process')) + '</h2><ol class="stns">' + S6.map(function (x) {
      var on = S.sta === x[0], cls = x[0] === 'you' && x[1] ? 'dot you' : x[1] ? 'dot' : 'dot zero';
      return '<li><button type="button" data-x="sta" data-id="' + x[0] + '" aria-pressed="' + on + '"><span class="' + cls + '">' + x[1] + '</span><em>' + esc(t('st_' + x[0])) + '</em><small>' + esc(t('sub_' + x[0])) + '</small></button></li>';
    }).join('') + '</ol><p class="pnote">' + esc(t('procNote')) + '</p></section>';
  }
  function staList(m) {
    var k = S.sta; if (!k || k === 'you') return '';
    var L = k === 'found' ? m.found : k === 'go' ? m.go : k === 'sent' ? m.sent : k === 'rep' ? m.rep : [];
    var h = '<section class="sec"><h2>' + esc(t('list_' + k)) + ' · ' + (k === 'deal' ? m.deal.length : L.length) + '</h2>';
    if (k === 'deal') return h + (m.deal.length ? '<ul class="items">' + m.deal.map(function (d) { return '<li class="it"><div class="rx" style="display:flex;gap:10px;padding:12px 14px"><span class="g mv" aria-hidden="true"></span><span class="tx"><b dir="auto">' + esc(cut(d.next_step || d.id, 90)) + '</b><small>' + esc(d.stage || '') + (d.next_due_at ? ' · ' + esc(dLab(dkOf(d.next_due_at))) : '') + '</small></span></div></li>'; }).join('') + '</ul>' : '<p class="empty">' + esc(t('listNone')) + '</p>') + '</section>';
    var srt = L.slice().sort(function (a, b) { return (pd(b.sent_at || b.replied_at || b.created) || 0) - (pd(a.sent_at || a.replied_at || a.created) || 0); });
    var lim = S.open['lim:' + k] ? 500 : 12;
    h += srt.length ? '<ul class="items">' + srt.slice(0, lim).map(function (a) { return itemAp(a, k === 'go' ? 'go' : 'ro'); }).join('') + '</ul>' + (srt.length > lim ? '<button type="button" class="more" data-x="lim" data-id="' + k + '">+ ' + (srt.length - lim) + '</button>' : '') : '<p class="empty">' + esc(t('listNone')) + '</p>';
    return h + '</section>';
  }
  function evLines(c) {
    var E = [], f = function (k1, kn, n) { return n === 1 ? t(k1) : t(kn, { n: n }); };
    if (c.s) E.push('<p class="ev"><span class="gl" aria-hidden="true">○</span>' + esc(f('evSent1', 'evSentN', c.s)) + '</p>');
    if (c.r) E.push('<p class="ev"><span class="gl" aria-hidden="true">●</span>' + esc(f('evRep1', 'evRepN', c.r)) + '</p>');
    if (c.no) E.push('<p class="ev"><span class="gl" aria-hidden="true">×</span>' + esc(f('evNo1', 'evNoN', c.no)) + '</p>');
    c.ev.forEach(function (e) { E.push('<p class="ev' + (e.k === 'late' ? ' lt' : '') + '"><span class="gl" aria-hidden="true">' + (e.k === 'done' ? '◆' : e.k === 'late' ? '▲' : '◇') + '</span>' + tl(e.k === 'done' ? 'evDone' : e.k === 'late' ? 'evLate' : e.k === 'ms' ? 'evMs' : 'evDue', cut(e.x, 64)) + '</p>'); });
    if (c.fail) E.push('<p class="ev"><span class="gl" aria-hidden="true">•</span>' + esc(f('evRun1', 'evRunN', c.run)) + (c.fail ? ' · ' + esc(c.fail === 1 ? t('evRunF1') : t('evRunF', { n: c.fail })) : '') + '</p>');
    return E.join('');
  }
  function busy(c) { return c && (c.s || c.r || c.no || c.ev.length || c.fail); }
  function vline(m, k0) {
    var keys = Object.keys(m.days).filter(function (k) { return busy(m.days[k]); }).sort(), fut = keys.filter(function (k) { return k > k0; }), past = keys.filter(function (k) { return k < k0; }).reverse();
    var h = '<section class="sec" aria-labelledby="vlh"><h2 id="vlh">' + esc(t('line')) + '</h2><ol class="vl">';
    fut.slice().reverse().forEach(function (k) { var c = m.days[k], late = c.ev.some(function (e) { return e.k === 'late'; }); h += '<li class="fut' + (late ? ' late' : '') + '"><i class="nd" aria-hidden="true"></i><b class="d">' + esc(dLong(k)) + '</b>' + evLines(c) + '</li>'; });
    var ct = m.days[k0];
    h += '<li class="tdy"><i class="nd" aria-hidden="true"></i><b class="d">' + esc(t('today')) + ' · ' + esc(dLong(k0)) + '</b>' + (m.p.now ? '<p class="ev">' + tl('todayNow', first(m.p.now, 160)) + '</p>' : '') + (busy(ct) ? evLines(ct) : '') + '</li>';
    var shown = past.filter(function (k) { return kDiff(k0, k) <= S.more; }), prev = k0;
    shown.forEach(function (k) { var gap = kDiff(prev, k) - 1; if (gap >= 3) h += '<li><p class="quiet">' + esc(t('quietDays', { n: gap })) + '</p></li>'; h += '<li><i class="nd" aria-hidden="true"></i><b class="d">' + esc(dLong(k)) + '</b>' + evLines(m.days[k]) + '</li>'; prev = k; });
    h += '</ol>';
    if (past.length > shown.length) h += '<button type="button" class="more" data-x="earlier">' + esc(t('showEarlier')) + '</button>';
    return h + '</section>';
  }
  function workers(m) {
    var from = Date.now() - 7 * 864e5, by = {};
    m.runs.forEach(function (r) { var ts = pd(r.ended || r.started); if (ts < from) return; var nm = String(r.arm || '?').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim(), a = nm.toLowerCase(), o = by[a] || (by[a] = { n: 0, last: null, lt: 0, nm: nm.charAt(0).toUpperCase() + nm.slice(1) }); o.n++; if (ts > o.lt) { o.lt = ts; o.last = r; } });
    var A = Object.keys(by).sort(function (a, b) { return by[b].lt - by[a].lt; });
    var h = '<section class="sec"><h2>' + esc(t('workers')) + '</h2><p class="sub">' + esc(t('workersSub')) + '</p>';
    if (!A.length) return h + '<p class="empty">' + esc(t('noWorkers')) + '</p></section>';
    return h + '<ul class="items">' + A.map(function (a) { var o = by[a], st = o.last.status, k = 'w:' + m.p.id + ':' + a, op = S.open[k];
      return '<li class="it" data-open="' + (op ? 1 : 0) + '"><button type="button" class="rx" data-x="tog" data-id="' + esc(k) + '" aria-expanded="' + !!op + '"><span class="g ' + (st === 'failed' ? 'bad' : 'mv') + '" aria-hidden="true"></span><span class="tx"><b>' + bdi(o.nm) + '</b><small>' + esc(st === 'failed' ? t('lastFail') : st === 'nothing' ? t('lastNothing') : t('lastOk')) + ' \u00b7 ' + esc(t('ago', { x: agoTx(o.lt) })) + ' \u00b7 ' + esc(o.n === 1 ? t('ran1') : t('ranN', { n: o.n })) + '</small></span>' + cvg() + '</button>'
        + (op && o.last.summary ? '<div class="bd"><p class="meta" dir="auto">' + esc(cut(clean(o.last.summary), 400)) + '</p></div>' : '') + '</li>'; }).join('') + '</ul></section>';
  }
  function vProj() {
    var D = md(), m = D.M[S.pid]; if (!m) { S.view = 'home'; return vHome(); }
    var Q = seq(m), i = Q.indexOf(m), pv = Q[(i - 1 + Q.length) % Q.length], nx = Q[(i + 1) % Q.length], p = m.p;
    var arr = function (dir) { var l = (dir < 0) !== (S.lang === 'he') ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'; return '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="' + l + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; };
    var h = '<div class="pj enter" style="--lc:' + m.c + '"><nav class="pnav" aria-label="' + esc(t('allLines')) + '"><button type="button" class="back" data-x="home">' + arr(-1) + esc(t('allLines')) + '</button><span class="sp"></span>'
      + '<button type="button" class="tb" data-x="p" data-id="' + esc(pv.p.id) + '" aria-label="' + esc(t('prev') + ': ' + pv.p.name) + '" style="--lc:' + pv.c + '">' + arr(-1) + '<i class="chip" aria-hidden="true"></i><span class="pn" dir="auto">' + esc(pv.p.name) + '</span></button><button type="button" class="tb" data-x="p" data-id="' + esc(nx.p.id) + '" aria-label="' + esc(t('nextP') + ': ' + nx.p.name) + '" style="--lc:' + nx.c + '"><i class="chip" aria-hidden="true"></i><span class="pn" dir="auto">' + esc(nx.p.name) + '</span>' + arr(1) + '</button></nav>';
    h += '<header class="hero"><h1>' + bdi(p.name) + '</h1>' + stHtml(m.st) + (p.now ? '<p dir="auto">' + esc(first(p.now, 220)) + '</p>' : '') + (p.next ? '<p><b>' + esc(t('next')) + ':</b> ' + bdi(first(p.next, 200)) + '</p>' : '') + '</header>';
    var narrow = (window.innerWidth || 375) < 980;
    var gs = '<section class="sec gatesec" aria-labelledby="gth"><h2 id="gth">' + esc(t('gate')) + (m.wait.length ? ' · ' + m.wait.length : '') + '</h2>' + (m.wait.length ? '<p class="sub">' + esc(t('gateSub')) + '</p><ul class="items">' + m.wait.map(function (w) { return w.k === 'ap' ? itemAp(w.a, 'wait') : itemTk(w.tk); }).join('') + '</ul>' : '<p class="empty">' + esc(t('gateNone')) + '</p>') + '</section>';
    h += narrow ? gs + stations(m) + '<div class="cols"><div class="side">' + staList(m) : stations(m) + '<div class="cols"><div class="side">' + gs + staList(m);
    h += '</div><div>' + vline(m, D.k0) + workers(m) + '</div></div></div>';
    return h;
  }

  /* ---------- shell ---------- */
  function topBar() {
    return '<div class="top"><a class="mark" href="#/" data-x="home"><i aria-hidden="true">8</i>J8NIX <small>' + esc(t('brand')) + '</small></a><span class="sp"></span>'
      + '<button type="button" class="tb" data-x="jump" aria-haspopup="dialog">' + esc(t('jump')) + ' <kbd>/</kbd></button>'
      + '<button type="button" class="tb" data-x="lang" lang="' + (S.lang === 'he' ? 'en' : 'he') + '">' + esc(t('lang')) + '</button></div>';
  }
  function jumpSheet() {
    if (!S.jump) return '';
    var q = S.jq.trim().toLowerCase(), L = seq().filter(function (m) { return !q || String(m.p.name).toLowerCase().indexOf(q) > -1; });
    S.jsel = Math.max(0, Math.min(S.jsel, L.length - 1));
    return '<div class="jump" data-x="jclose" role="dialog" aria-modal="true" aria-label="' + esc(t('jump')) + '"><div class="pane"><input id="jq" type="search" autocomplete="off" placeholder="' + esc(t('jumpPh')) + '" value="' + esc(S.jq) + '" aria-controls="jl" dir="auto"><ul id="jl" role="listbox">'
      + L.map(function (m, i) { return '<li><button type="button" role="option" data-x="p" data-id="' + esc(m.p.id) + '" aria-selected="' + (i === S.jsel) + '" style="--lc:' + m.c + '"><i class="chip" aria-hidden="true"></i><span dir="auto">' + esc(m.p.name) + '</span><small>' + esc(t(m.st.k)) + (m.wait.length ? ' ' + m.wait.length : '') + '</small></button></li>'; }).join('') + '</ul></div></div>';
  }
  function render(keepScroll) {
    var y = window.scrollY, st = J() ? J().status() : {}, body;
    document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === 'he' ? 'rtl' : 'ltr';
    document.getElementById('pvt').textContent = t('preview'); var ol = document.getElementById('pvl'); ol.textContent = t('openLive');
    var hasData = Object.keys(raw('projects')).length > 0;
    if (!hasData && st.error === 'signed_out') body = '<div class="gate-in"><h1>' + esc(t('signedOut')) + '</h1><p>' + esc(t('signedOutP')) + '</p><a class="b go" href="../">' + esc(t('signIn')) + '</a></div>';
    else if (!hasData && (st.error || S.cerr)) body = '<div class="gate-in"><h1>' + esc(t(st.error === 'no_org' ? 'noOrg' : 'offline')) + '</h1><a class="b" href="../">' + esc(t('openLive')) + '</a></div>';
    else if (!hasData) body = '<div class="skel" role="status" aria-label="' + esc(t('loading')) + '"></div>';
    else body = (S.view === 'proj' ? vProj() : vHome()) + '<p class="foot">' + esc(st.connected ? t('updated', { x: new Date(S.at || Date.now()).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' }) }) : t('offline')) + ' · J8NIX ' + esc(t('brand')) + ' ' + VER + '</p>';
    var fe = document.activeElement, fk = fe && fe.getAttribute && (fe.getAttribute('data-x') + '|' + (fe.getAttribute('data-id') || ''));
    R.innerHTML = '<div class="wrap">' + topBar() + '<main id="main" tabindex="-1">' + body + '</main></div>' + jumpSheet();
    if (keepScroll) window.scrollTo(0, y);
    if (S.jump) { var ji = document.getElementById('jq'); if (ji) { ji.focus(); var v = ji.value; ji.value = ''; ji.value = v; } }
    else if (S.edit) { var ta = document.getElementById('ed'); if (ta && document.activeElement !== ta) ta.focus(); }
    else if (fk && fk !== 'null|') { var p = fk.split('|'), el = R.querySelector('[data-x="' + p[0] + '"]' + (p[1] ? '[data-id="' + (window.CSS && CSS.escape ? CSS.escape(p[1]) : p[1]) + '"]' : '')); if (el) try { el.focus({ preventScroll: true }); } catch (e) {} }
  }
  var raf = 0;
  function soon() { MD = null; if (raf) return; raf = requestAnimationFrame(function () { raf = 0; if (!S.edit) render(true); }); }
  function say(msg, undo) {
    undoFn = undo || null; toastEl.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button type="button" id="tundo">' + esc(t('undo')) + '</button>' : '');
    toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); undoFn = null; }, 6000);
  }
  function fail() { say(t('fail')); MD = null; render(true); }
  function go(view, pid, push) {
    S.view = view; S.pid = pid || null; S.sta = view === 'proj' ? (md().M[pid] && md().M[pid].wait.length ? null : S.sta) : null; S.edit = null; S.more = 14; S.jump = false;
    if (push !== false) { var hs = view === 'proj' ? '#/p/' + encodeURIComponent(pid) : '#/'; if (location.hash !== hs) history.pushState(null, '', hs); }
    render(false); window.scrollTo(0, 0); var mm = document.getElementById('main'); if (mm) try { mm.focus({ preventScroll: true }); } catch (e) {}
  }
  function route() { var m = /^#\/p\/(.+)$/.exec(location.hash || ''); if (m) go('proj', decodeURIComponent(m[1]), false); else go('home', null, false); }
  function apById(id) { var a = raw('approvals')[id]; return a ? Object.assign({ id: id }, a) : null; }

  /* ---------- actions (same engine and guards as /j8/) ---------- */
  function act(x, id, el) {
    var j = J();
    if (x === 'home') { go('home'); return; }
    if (x === 'p') { go('proj', id); return; }
    if (x === 'lang') { S.lang = S.lang === 'he' ? 'en' : 'he'; try { localStorage.setItem('j8-lang', JSON.stringify(S.lang)); } catch (e) {} MD = null; render(true); return; }
    if (x === 'jump') { S.jump = true; S.jq = ''; S.jsel = 0; render(true); return; }
    if (x === 'jclose') { S.jump = false; render(true); return; }
    if (x === 'tog') { S.open[id] = !S.open[id]; if (!S.open[id] && S.edit && id === 'a:' + S.edit) S.edit = null; render(true); return; }
    if (x === 'sta') { S.sta = S.sta === id ? null : id; render(true); return; }
    if (x === 'lim') { S.open['lim:' + id] = 1; render(true); return; }
    if (x === 'earlier') { S.more += 30; render(true); return; }
    if (x === 'go') { var lf = (S.lint || {})[id]; if (lf && lf.hard && !S.arm['h' + id]) { S.arm['h' + id] = 1; render(true); setTimeout(function () { if (S.arm['h' + id]) { delete S.arm['h' + id]; render(true); } }, 5000); return; } delete S.arm['h' + id]; el.disabled = true; j.approvals.approve(id).then(function () { delete S.open['a:' + id]; say(t('goT'), function () { j.approvals.undo(id).then(function () { say(t('backT')); }, fail); }); }, fail); return; }
    if (x === 'stop') {
      if (!S.arm['s' + id]) { S.arm['s' + id] = 1; render(true); setTimeout(function () { if (S.arm['s' + id]) { delete S.arm['s' + id]; render(true); } }, 4000); return; }
      delete S.arm['s' + id]; el.disabled = true;
      j.approvals.kill(id).then(function () { delete S.open['a:' + id]; say(t('stopT'), function () { j.approvals.undo(id).then(function () { say(t('backT')); }, fail); }); }, fail); return;
    }
    if (x === 'edit') { var a = apById(id); S.edit = id; S.edTx = textOf(a); render(true); return; }
    if (x === 'ecancel') { S.edit = null; render(true); return; }
    if (x === 'esave') { var ta = document.getElementById('ed'), tx = ta ? ta.value.trim() : ''; if (!tx) return; el.disabled = true; j.approvals.edit(id, tx).then(function () { S.edit = null; delete S.open['a:' + id]; say(t('editT'), function () { j.approvals.undo(id).then(function () { say(t('backT')); }, fail); }); }, function () { el.disabled = false; fail(); }); return; }
    if (x === 'done') {
      if (!S.arm['d' + id]) { S.arm['d' + id] = 1; render(true); setTimeout(function () { if (S.arm['d' + id]) { delete S.arm['d' + id]; render(true); } }, 4000); return; }
      delete S.arm['d' + id]; el.disabled = true;
      j.tasks.done(id).then(function () { delete S.open['t:' + id]; say(t('doneT'), function () { j.tasks.undo(id).then(function () { say(t('backT')); }, fail); }); }, fail); return;
    }
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#tundo')) { var u = undoFn; undoFn = null; toastEl.classList.remove('on'); if (u) u(); return; }
    var el = e.target.closest && e.target.closest('[data-x]'); if (!el || !R.contains(el)) return;
    if (el.getAttribute('data-x') === 'jclose' && e.target !== el) return;
    if (el.tagName === 'A' && el.getAttribute('data-x') === 'home') e.preventDefault();
    if (el.tagName === 'SUMMARY') return;
    act(el.getAttribute('data-x'), el.getAttribute('data-id'), el);
  });
  document.addEventListener('toggle', function (e) { var d = e.target; if (d && d.matches && d.matches('details[data-k]')) S.open[d.getAttribute('data-k')] = d.open; }, true);
  document.addEventListener('input', function (e) { if (e.target.id === 'jq') { S.jq = e.target.value; S.jsel = 0; render(true); } else if (e.target.id === 'ed') S.edTx = e.target.value; });
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'input' || tag === 'textarea';
    if (S.jump) {
      var opts = R.querySelectorAll('.jump [role="option"]');
      if (e.key === 'Escape') { e.preventDefault(); S.jump = false; render(true); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); S.jsel = Math.max(0, Math.min(opts.length - 1, S.jsel + (e.key === 'ArrowDown' ? 1 : -1))); render(true); }
      else if (e.key === 'Enter' && opts[S.jsel]) { e.preventDefault(); go('proj', opts[S.jsel].getAttribute('data-id')); }
      return;
    }
    if (typing) { if (e.key === 'Escape' && S.edit) { S.edit = null; render(true); } return; }
    if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); act('jump'); return; }
    if (S.view === 'proj' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var Q = seq(md().M[S.pid]), i = Q.indexOf(md().M[S.pid]), fwd = S.lang === 'he' ? 'ArrowLeft' : 'ArrowRight', bk = S.lang === 'he' ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === 'Escape') { go('home'); return; }
      if ((e.key === fwd || e.key === bk) && i > -1) { e.preventDefault(); go('proj', Q[(i + (e.key === fwd ? 1 : -1) + Q.length) % Q.length].p.id); }
    }
  });
  /* swipe between projects (a shortcut only; the arrows are always on screen) */
  var sx = null;
  document.addEventListener('touchstart', function (e) { if (S.view !== 'proj' || S.edit || e.touches.length !== 1) { sx = null; return; } sx = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!sx || S.view !== 'proj') return; var c = e.changedTouches[0], dx = c.clientX - sx.x, dy = c.clientY - sx.y; sx = null;
    if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
    var Q = seq(md().M[S.pid]), i = Q.indexOf(md().M[S.pid]); if (i < 0) return; var dir = (dx < 0) !== (S.lang === 'he') ? 1 : -1;
    go('proj', Q[(i + dir + Q.length) % Q.length].p.id);
  }, { passive: true });
  window.addEventListener('popstate', route);
  var rz = 0; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (!S.edit) render(true); }, 150); });

  /* ---------- boot: paint the saved copy first, then the live data ---------- */
  function boot() {
    var j = J(); if (!j) { R.innerHTML = '<div class="wrap"><p class="empty">J8NIX data engine missing.</p></div>'; return; }
    ['projects', 'approvals', 'tasks', 'runs', 'deals'].forEach(function (c) { try { j.on(c, function () { S.at = Date.now(); soon(); }); } catch (e) {} });
    try { j.on('status', function () { soon(); }); } catch (e) {}
    try { if (j.warm) j.warm(); } catch (e) {}
    route();
    var lint = function () { if (!j.lint) return; Promise.resolve(j.lint()).then(function (o) { if (o) { S.lint = o; soon(); } }, function () {}); };
    setInterval(lint, 6e4);
    Promise.resolve(j.connect()).then(function () { S.at = Date.now(); lint(); soon(); }, function () { S.cerr = 1; soon(); });
  }
  boot();
})();
