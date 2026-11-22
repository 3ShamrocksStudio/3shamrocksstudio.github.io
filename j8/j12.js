/* =====================================================================
   J8NIX 12.0.0 (22 Nov 2026) · Pit Wall. Dave's pick in the main chat: direction 3 "Pit Wall" (race engineer)
   from /j8/v2-preview/3/ + the Go / No-go gate pattern from direction 1. Spec: ops/brain/J8NIX-V2-RESEARCH.md.
   The new primary app. Real data only, through window.J8 (j8-data.js) and the signed-in member's own session:
     Home    gap to pace (j8_money summary payments vs a straight line to ₪100,000 by 31 Dec 2026), J8's one radio call
             (top owner 'dave' row of public.j8_rank, else the newest open sev 'r' task: Do it + Note), the timing tower
             of missions (active j8_projects with race flags), the stop switch (j8_control.paused via J8.control.setPaused).
     Mission now / next / you, open steps (Do it · Note · Done), pending drafts as Go / No-go, proof feed.
     Gates   every pending draft + every open Dave step, highest money first, grouped by mission.
     Proof   j8_runs ok/failed, sent items with result, payments. Filter by mission.
     Talk    one thread with J8 (J8.inbox.send to p-general, as the classic chat) with the team's reply lines.
   Every write is a function the classic app already uses: J8.approvals.approve / kill / undo, J8.tasks.done / undo,
   J8.inbox.send (note), J8.control.setPaused. Edit opens the classic draft editor. The classic app stays in the page
   (#app), reachable from Settings → Classic. All dynamic text is escaped; links are https only.
   Revert: index-11.8.1.html + sw-11.8.1.js (this file and j12.css are then unused).
   12.0.1: "Ready for you to send" in Gates and each Mission: approved/edited by-hand drafts not yet sent (the 11.8 Home
   "People to message" list, window.j8v19.people). One "Copy & open" (copy edited_body else body, open the https link in the
   same tap) and a quiet two-tap "Mark sent" (J8.approvals.handSent → public.j8_hand_sent). Hidden when empty.
   ===================================================================== */
(function () {
  'use strict';
  var VER = '12.0.1';
  var GOAL = 100000, LINE_FROM = '2026-11-19', LINE_TO = '2026-12-31', COUNT_FROM = '2026-11-01';
  var TZ = 'Asia/Jerusalem';
  var J = function () { return window.J8 || null; };
  var S = { v: 'home', mid: null, filter: 'all', proofN: 60, note: {}, noteOpen: {}, sent: {}, arm: {}, talk: '', rank: null, rankAt: 0, done: {}, prevV: null };
  var root, sr, view, nav, hud, hudT, hudUndo = null, raf = 0, pending = false;

  /* ---------- helpers ---------- */
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"'`]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]; }); }
  function link(u) { u = String(u || '').trim(); return /^https:\/\/[^\s"'<>`\\]+$/i.test(u) ? u : ''; }
  function cut(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; }
  function pd(s) {
    if (!s) return NaN; if (typeof s === 'number') return s;
    var x = String(s).trim();
    if (/^\d{4}-\d\d-\d\d$/.test(x)) return Date.parse(x + 'T12:00:00Z');
    x = x.replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1').replace(/(T[\d:.]+[+-]\d\d)$/, '$1:00');
    return Date.parse(x);
  }
  function ils(n) { n = Math.round(Number(n) || 0); return (n < 0 ? '−' : '') + '₪' + Math.abs(n).toLocaleString('en-US'); }
  function ilsS(n) { n = Math.round(Number(n) || 0); return (n > 0 ? '+' : n < 0 ? '−' : '') + '₪' + Math.abs(n).toLocaleString('en-US'); }
  var fmtParts = (function () { try { return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); } catch (e) { return null; } })();
  function il(t) { /* Israel wall time parts */
    var d = new Date(t); if (isNaN(d)) return null;
    if (!fmtParts) return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), h: d.getHours(), mi: d.getMinutes() };
    var o = {}; fmtParts.formatToParts(d).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute };
  }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function pad(n) { return String(n).padStart(2, '0'); }
  function ymdIL(t) { var p = il(t); return p ? p.y + '-' + pad(p.m) + '-' + pad(p.d) : ''; }
  function when(s) { var t = pd(s); if (isNaN(t)) return ''; var p = il(t), today = ymdIL(Date.now()), hm = pad(p.h) + ':' + pad(p.mi);
    return ymdIL(t) === today ? hm : p.d + ' ' + MON[p.m - 1] + ' ' + hm; }
  function whenBr(t, dayOnly) { if (dayOnly) return esc(whenDay(t)); var w = when(t), m = /^(\d+ \w+) (\d\d:\d\d)$/.exec(w); return m ? esc(m[1]) + '<br>' + esc(m[2]) : esc(w); }
  function whenDay(s) { var t = pd(s); if (isNaN(t)) return ''; var p = il(t); return p.d + ' ' + MON[p.m - 1]; }
  function dayNo(ymd) { var a = String(ymd).split('-'); return Date.UTC(+a[0], +a[1] - 1, +a[2]) / 864e5; }
  function on() { var j = J(); return !!(j && j.status && j.status().connected); }
  function safe(f, d) { try { var v = f(); return v == null ? d : v; } catch (e) { return d; } }
  function raw(c) { var j = J(); return safe(function () { return j.raw(c); }, {}) || {}; }
  function buzz() { try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) { /* no haptics */ } }

  /* ---------- data (all read through J8) ---------- */
  function projects() {
    var j = J(); return safe(function () { return j.projects.list(); }, []).filter(function (p) {
      return !p.hidden && !/^(archived|frozen|dropped|killed|hidden|paused)$/i.test(String(p.status || 'active'));
    });
  }
  function proj(id) { var j = J(); return id ? safe(function () { return j.projects.get(id); }, null) : null; }
  function pidOf(product) { /* drafts name their project by id, sometimes by name */
    var P = raw('projects'), s = String(product || '').trim(); if (!s) return null;
    if (P[s]) return s; var k = Object.keys(P).filter(function (id) { return String(P[id].name || '').trim().toLowerCase() === s.toLowerCase(); })[0];
    return k || null;
  }
  function pname(pid) { var p = proj(pid); return p ? p.name : pid === 'p-general' ? 'Studio' : (pid || 'Studio'); }
  function tasksOpen() { var j = J(); return safe(function () { return j.tasks.open(); }, []); }
  function daveTasks() { return tasksOpen().filter(function (t) { return t.owner === 'dave'; }); }
  function drafts() { var j = J(); return safe(function () { return j.approvals.pending(); }, []); }
  function money() { var j = J(); return safe(function () { return j.money.summary(); }, null); }
  function runs() { var j = J(); return safe(function () { return j.runs.list(); }, []); }
  function paused() { var j = J(); return safe(function () { return j.control.paused(); }, false); }
  function ctl() { var j = J(); return safe(function () { return j.control.get(); }, null); }
  function msgs(n) { var j = J(); return safe(function () { return j.inbox.list(n); }, []); }
  function openTaskIds() { var o = {}; tasksOpen().forEach(function (t) { o[t.id] = t; }); return o; }
  function waitsOn(item) { /* open blockers that are open tasks (titles shown) */
    var O = openTaskIds(); return (item.blocked_by || []).filter(function (b) { return O[b]; }).map(function (b) { return O[b].title || b; });
  }
  function rankPull() {
    var j = J(); if (!on() || !j.rank || Date.now() - S.rankAt < 6e4) return; S.rankAt = Date.now();
    j.rank().then(function (R) { if (Array.isArray(R)) { S.rank = R; soon(); } }, function () {});
  }
  function rankPos() { var o = {}; (S.rank || []).forEach(function (r) { if (r && r.id != null && o[r.id] == null) o[r.id] = Number(r.pos) || 0; }); return o; }

  /* the money line: payments dated from 1 Nov 2026 (in November = "this month") vs a straight line from 19 Nov (₪0) to 31 Dec (₪100,000) */
  function pace() {
    var m = money(); if (!m) return null;
    var P = Array.isArray(m.payments) ? m.payments : [], today = ymdIL(Date.now()), got = 0, n = 0;
    P.forEach(function (p) { if (!p || typeof p !== 'object') return; var a = Number(p.ils), d = String(p.date || '').slice(0, 10);
      if (isFinite(a) && /^\d{4}-\d\d-\d\d$/.test(d) && d >= COUNT_FROM && d <= today) { got += a; n++; } });
    var span = dayNo(LINE_TO) - dayNo(LINE_FROM), el = Math.max(0, Math.min(span, dayNo(today) - dayNo(LINE_FROM)));
    var line = Math.round(GOAL * el / span), left = Math.max(1, dayNo(LINE_TO) - dayNo(today));
    return { got: got, n: n, line: line, gap: got - line, day: el + 1, span: span + 1, perDay: Math.max(0, Math.round((GOAL - got) / left)), at: m.updated || m.updated_at || '', thisMonth: today.slice(0, 7) === COUNT_FROM.slice(0, 7) };
  }

  /* race flag of a mission */
  function flag(p) {
    var st = String(p.status || '').toLowerCase();
    if (/^(done|complete|completed|finished)$/.test(st)) return 'done';
    if (st === 'blocked' || (Array.isArray(p.blocked_by) && p.blocked_by.length)) return 'block';
    if (/^\s*(🔴|🟠)/.test(String(p.you || '')) || daveTasks().some(function (t) { return t.project_id === p.id; })) return 'need';
    var u = pd(p.updated || p.updated_at); if (!isNaN(u) && Date.now() - u < 864e5) return 'run';
    return 'quiet';
  }
  var WORD = { run: 'Green · running', need: 'Yellow · needs you', block: 'Red · blocked', done: 'Chequered · done', quiet: 'No update 24h' };
  var ORDER = { need: 0, block: 1, run: 2, quiet: 3, done: 4 };
  function tower() {
    var R = rankPos();
    function best(p) { var b = 1e9; if (R[p.id] != null) b = R[p.id]; daveTasks().forEach(function (t) { if (t.project_id === p.id && R[t.id] != null && R[t.id] < b) b = R[t.id]; }); return b; }
    return projects().map(function (p) { return { p: p, f: flag(p), b: best(p) }; }).sort(function (a, b) {
      return ORDER[a.f] - ORDER[b.f] || a.b - b.b || (Number(b.p.stage) || 0) - (Number(a.p.stage) || 0) || String(a.p.name).localeCompare(String(b.p.name));
    });
  }

  /* J8's one radio call */
  function radio() {
    var T = raw('tasks'), A = raw('approvals');
    var R = (S.rank || []).filter(function (r) { return r && r.owner === 'dave'; }).sort(function (a, b) { return (a.pos || 0) - (b.pos || 0); });
    for (var i = 0; i < R.length; i++) {
      var r = R[i];
      if (r.kind === 'task') { var t = T[r.id]; if (t && (!t.status || t.status === 'open') && !S.done[r.id]) return { kind: 'task', id: r.id, t: Object.assign({ id: r.id }, t), title: t.title || r.title, money: r.money }; }
      else if (r.kind === 'approval') { var a = A[r.id]; if (a && (!a.status || a.status === 'pending') && a.source !== 'j8nix-app') return { kind: 'approval', id: r.id, a: Object.assign({ id: r.id }, a), title: r.title || a.label || a.to, money: r.money }; }
      else if (r.kind === 'project') { var p = proj(r.id); if (p) return { kind: 'project', id: r.id, p: p, title: r.title || p.you, money: r.money }; }
    }
    var red = daveTasks().filter(function (t) { return t.sev === 'r' && !S.done[t.id]; }).sort(function (a, b) { return String(b.created_at || b.created || b.updated_at || '').localeCompare(String(a.created_at || a.created || a.updated_at || '')); })[0];
    return red ? { kind: 'task', id: red.id, t: red, title: red.title } : null;
  }

  /* ---------- small renderers ---------- */
  function fl(f) { return '<span class="fl fl-' + esc(f) + '" aria-hidden="true"></span>'; }
  function fw(f) { return '<span class="fw fw-' + esc(f) + '">' + esc(WORD[f] || f) + '</span>'; }
  function appLink(u) { return /^https:\/\/(3shamrocks\.com|3shamrocksstudio\.github\.io)\/j8\/?(#|$)/i.test(u); }
  function doBtn(u, cls, label) {
    u = link(u); if (!u) return '';
    if (appLink(u)) return '<button type="button" class="bt ' + cls + '" data-x="nav" data-id="gates">' + esc(label || 'Do it') + '</button>';
    return '<a class="bt ' + cls + '" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(label || 'Do it') + '</a>';
  }
  function noteBox(key, pid, taskId, apId) {
    var open = S.noteOpen[key], sent = S.sent[key];
    var h = '';
    if (open) h += '<div class="note"><label class="sr" for="pwn-' + esc(key) + '">Note to the team</label><textarea id="pwn-' + esc(key) + '" data-note="' + esc(key) + '" dir="auto" placeholder="Note to the team">' + esc(S.note[key] || '') + '</textarea>'
      + '<div class="bts"><button type="button" class="bt main sm2" data-x="note-send" data-k="' + esc(key) + '" data-p="' + esc(pid || 'p-general') + '" data-t="' + esc(taskId || '') + '" data-apid="' + esc(apId || '') + '">Send note</button><button type="button" class="ql" data-x="note" data-k="' + esc(key) + '">Cancel</button></div></div>';
    var last = taskId ? lastReplyFor('task', taskId) : apId ? lastReplyFor('ap', apId) : '';
    if (last) h += '<p class="sentl" dir="auto">' + esc(last) + '</p>'; else if (sent) h += '<p class="sentl">Sent to the team</p>';
    return h;
  }
  function lastReplyFor(kind, id) {
    var j = J(); var L = safe(function () { return kind === 'task' ? j.inbox.forTask(id) : j.inbox.forApproval(id); }, []);
    for (var i = 0; i < L.length; i++) { var r = safe(function () { return j.inbox.lastReply(L[i]); }, ''); if (r) return 'Team: ' + cut(r, 160); }
    return '';
  }
  function armed(k) { var a = S.arm[k]; return a && Date.now() - a < 5000; }

  function taskRow(t, showProj) {
    var k = 'tk-' + t.id, w = waitsOn(t), lk = link(t.link);
    var h = '<article class="row task"><div class="yh"><p class="yt" dir="auto">' + esc(t.title || t.id) + '</p>' + (t.minutes ? '<span class="mono sm">' + esc(t.minutes) + ' min</span>' : '') + '</div>';
    h += '<p class="yp">' + (showProj ? esc(pname(t.project_id)) + ' · ' : '') + 'Your step' + (t.sev === 'r' ? ' · urgent' : '') + '</p>';
    if (t.why) h += '<p class="why" dir="auto">' + esc(cut(t.why, 220)) + '</p>';
    if (t.action) h += '<details><summary dir="auto">' + esc(cut(t.action, 110)) + '<b>How</b></summary><p class="full" dir="auto">' + esc(t.action) + '</p></details>';
    if (w.length) h += '<p class="warn" dir="auto">Waits on: ' + esc(cut(w.join(' · '), 160)) + '</p>';
    h += '<div class="bts">' + (lk ? doBtn(lk, 'main', t.link_text && t.link_text.length < 26 ? t.link_text : 'Do it') : '')
      + '<button type="button" class="bt' + (armed(k) ? ' arm' : '') + '" data-x="done" data-id="' + esc(t.id) + '">' + (armed(k) ? 'Tap again: done' : 'Done') + '</button>'
      + '<button type="button" class="ql" data-x="note" data-k="' + esc(k) + '">Note</button></div>';
    return h + noteBox(k, t.project_id, t.id, null) + '</article>';
  }
  function draftRow(a, showProj) {
    var j = J(), tx = String(safe(function () { return j.approvals.textOf(a); }, '') || ''), plan = !!(a.no_send || (a.extra && a.extra.no_send)), tpl = a.kind === 'template';
    var who = a.label && a.label !== 'Template' ? a.label : '', head = a.to || a.subject || who || a.kind || 'Draft';
    var w = waitsOn(a);
    var h = '<article class="row poll" data-ap="' + esc(a.id) + '"><div class="yh"><p class="yt" dir="auto">' + (tpl ? '<span class="tag">Template</span>' : plan ? '<span class="tag">Plan</span>' : '') + esc(cut(head, 90)) + '</p></div>';
    var meta = [showProj ? pname(pidOf(a.product)) : '', a.channel, a.subject && a.subject !== head ? a.subject : '', who && who !== head ? who : ''].filter(Boolean).map(function (x) { return cut(x, 60); }).join(' · ');
    if (meta) h += '<p class="yp" dir="auto">' + esc(meta) + '</p>';
    if (tx) h += '<details><summary dir="auto">' + esc(cut(tx, 140)) + (tx.replace(/\s+/g, ' ').trim().length > 140 || /\n/.test(tx) ? '<b>Read all</b>' : '') + '</summary><p class="full" dir="auto">' + esc(tx) + '</p></details>';
    if (a.warn) h += '<p class="warn" dir="auto">' + esc(cut(a.warn, 200)) + '</p>';
    if (plan) h += '<p class="yp">Plan only: nothing is sent.</p>';
    if (w.length) h += '<p class="warn" dir="auto">Waits on: ' + esc(cut(w.join(' · '), 160)) + '</p>';
    h += '<div class="bts"><button type="button" class="bt go" data-x="go" data-id="' + esc(a.id) + '">' + (plan ? 'Go · OK to start' : 'Go') + '</button>'
      + '<button type="button" class="bt nogo" data-x="nogo" data-id="' + esc(a.id) + '">No-go</button>'
      + (plan ? '' : '<button type="button" class="ql" data-x="edit" data-id="' + esc(a.id) + '">Edit</button>') + '</div>';
    return h + '</article>';
  }
  function decidedRow(id, how) {
    return '<article class="row dec ' + (how === 'nogo' ? 'nogo' : '') + '"><p class="yt">' + (how === 'go' ? 'Go' : how === 'done' ? 'Done' : 'No-go') + '</p><p class="yp">Saved. <button type="button" class="ql" data-x="undo">Undo</button></p></article>';
  }

  /* 12.0.1: by-hand drafts Dave approved (Go) and still has to send himself: same list as the 11.8 Home "People to message" */
  function readyList(pid) {
    var L = safe(function () { return window.j8v19.people(); }, []);
    if (!Array.isArray(L)) return [];
    return pid ? L.filter(function (a) { return pidOf(a.product) === pid; }) : L;
  }
  function copyText(tx) {
    var ok = false;
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(tx).catch(function () { copyOld(tx); }); ok = true; } } catch (e) {}
    if (!ok) copyOld(tx);
  }
  function copyOld(tx) {
    try { var t = document.createElement('textarea'); t.value = tx; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); } catch (e) {}
  }
  function readyRow(a) {
    var j = J(), tx = String(safe(function () { return j.approvals.textOf(a); }, '') || ''), lk = link(a.link), k = 'hs-' + a.id;
    var head = a.to || a.label || a.subject || 'Message', f = tx.split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean), first = f[0] || '';
    var h = '<article class="row poll" data-ready="' + esc(a.id) + '"><div class="yh"><p class="yt" dir="auto">' + esc(cut(head, 90)) + '</p></div>';
    if (a.channel) h += '<p class="yp" dir="auto">' + esc(cut(a.channel, 60)) + '</p>';
    if (tx) h += f.length > 1 || first.length > 140 ? '<details><summary dir="auto">' + esc(cut(first, 140)) + '<b>Read all</b></summary><p class="full" dir="auto">' + esc(tx) + '</p></details>' : '<p class="why" dir="auto">' + esc(first) + '</p>';
    h += '<div class="bts">' + (tx || lk ? '<button type="button" class="bt main" data-x="copyopen" data-id="' + esc(a.id) + '">' + (lk ? 'Copy &amp; open' : 'Copy') + '</button>' : '')
      + '<button type="button" class="ql' + (armed(k) ? ' arm' : '') + '" data-x="handsent" data-id="' + esc(a.id) + '">' + (armed(k) ? 'Tap again: sent' : 'Mark sent') + '</button></div>';
    return h + '</article>';
  }

  function stopBox() {
    var p = paused(), c = ctl(), k = p ? 'resume' : 'stop', ar = armed(k);
    var by = c && c.updated ? when(c.updated) : '';
    if (!c && !on()) return '';
    if (p) return '<section class="rf on" aria-labelledby="pw-rf"><p class="st" id="pw-rf">Red flag: sending stopped</p><p class="xs">Nothing goes out until you resume' + (by ? ' · stopped ' + esc(by) : '') + '.</p>'
      + '<button type="button" class="bt grnf' + (ar ? ' arm' : '') + '" data-x="resume">' + (ar ? 'Tap again to resume sending' : 'Green flag: resume') + '</button></section>';
    return '<section class="rf" aria-labelledby="pw-rf"><p class="st" id="pw-rf">Green flag: sending on</p><p class="xs">The team sends approved items on schedule. Stop it all here.</p>'
      + '<button type="button" class="bt redf' + (ar ? ' arm' : '') + '" data-x="stop">' + (ar ? 'Tap again to stop sending' : 'Red flag: stop sending') + '</button></section>';
  }

  /* ---------- screens ---------- */
  function vHome() {
    rankPull();
    var pc = pace(), h = '<div class="home"><section class="delta" aria-labelledby="pw-d"><h1 class="k" id="pw-d">Gap to pace · straight-line pace</h1>';
    if (pc) {
      h += '<p class="dl"><span class="dnum' + (pc.gap >= 0 ? ' ahead' : '') + '">' + esc(ilsS(pc.gap)) + '</span></p>'
        + '<p class="m1">' + esc(ils(pc.got)) + ' collected ' + (pc.thisMonth ? 'this month' : 'since 1 Nov') + ' · straight-line pace ' + esc(ils(pc.line)) + ' today</p>'
        + '<p class="m2">Line: ₪0 on 19 Nov to ' + esc(ils(GOAL)) + ' on 31 Dec · day ' + esc(pc.day) + ' of ' + esc(pc.span) + ' · ' + esc(ils(pc.perDay)) + '/day from here' + (pc.at ? ' · money updated ' + esc(whenDay(pc.at)) : '') + '</p>';
    } else h += '<p class="empty">' + (on() ? 'No money figures yet.' : 'Connecting… the money line shows once live data loads.') + '</p>';
    h += '</section>';
    var r = radio();
    h += '<section class="radio" aria-labelledby="pw-r"><h2 class="cap" id="pw-r">J8 · radio</h2>';
    if (r) {
      var t = r.t, lk = r.kind === 'task' ? link(t.link) : r.kind === 'project' ? link(r.p.you_link) : '';
      var pid = r.kind === 'task' ? t.project_id : r.kind === 'project' ? r.id : pidOf(r.a.product);
      var meta = [pid ? pname(pid) : '', r.kind === 'task' && t.minutes ? t.minutes + ' min' : '', r.money ? 'money' : ''].filter(Boolean).join(' · ');
      h += (meta ? '<p class="meta">' + esc(meta) + '</p>' : '') + '<p class="call" dir="auto">“' + esc(cut(r.title, 140)) + '”</p>';
      if (r.kind === 'task' && t.why) h += '<p class="why" dir="auto">' + esc(cut(t.why, 200)) + '</p>';
      else if (r.kind === 'approval') h += '<p class="why">A draft waits for your Go or No-go.</p>';
      h += '<div class="bts">';
      if (r.kind === 'approval') h += '<button type="button" class="bt main big" data-x="nav" data-id="gates">Do it</button>';
      else if (lk) h += doBtn(lk, 'main big', 'Do it');
      else h += '<button type="button" class="bt main big" data-x="mission" data-id="' + esc(pid || '') + '">Do it</button>';
      var key = r.kind === 'task' ? 'tk-' + r.id : r.kind === 'approval' ? 'ap-' + r.id : 'pj-' + r.id;
      h += '<button type="button" class="ql" data-x="note" data-k="' + esc(key) + '">Note</button></div>'
        + noteBox(key, pid, r.kind === 'task' ? r.id : null, r.kind === 'approval' ? r.id : null);
    } else h += '<p class="call">' + (on() ? '“Nothing for you right now.”' : '“Connecting…”') + '</p>';
    h += '</section>';
    var T = tower();
    h += '<section class="tower" aria-labelledby="pw-t"><h2 class="cap" id="pw-t">Timing tower · missions</h2>';
    h += T.length ? T.map(function (x, i) {
      var p = x.p, sub = [p.stage ? 'Stage ' + p.stage : '', cut(p.now || p.next || '', 80)].filter(Boolean).join(' · ');
      return '<button type="button" class="tr s-' + esc(x.f) + '" data-x="mission" data-id="' + esc(p.id) + '"><span class="pos">P' + (i + 1) + '</span>' + fl(x.f)
        + '<span class="tn"><b dir="auto">' + esc(p.name || p.id) + '</b><small dir="auto">' + esc(sub) + '</small></span>' + fw(x.f) + '</button>';
    }).join('') : '<p class="empty">' + (on() ? 'No active missions.' : 'Connecting…') + '</p>';
    h += '</section>' + stopBox() + '</div>';
    return h;
  }

  function proofItems(pid) {
    var L = [];
    runs().forEach(function (r) {
      if (r.status !== 'ok' && r.status !== 'failed') return;
      var ps = Array.isArray(r.projects) ? r.projects : r.project ? [r.project] : [];
      if (pid && ps.indexOf(pid) < 0) return;
      L.push({ t: pd(r.ended || r.started), k: r.status === 'failed' ? 'miss' : 'run', x: r.summary || (r.arm + ' ' + r.status), m: (r.arm || 'Run') + (r.status === 'failed' ? ' · failed' : ''), p: ps, lk: link(r.link) });
    });
    var j = J(); safe(function () { return j.approvals.list(); }, []).forEach(function (a) {
      if (a.status !== 'sent' || a.kind === 'template') return; var p = pidOf(a.product);
      if (pid && p !== pid) return;
      var res = String(a.result || ''), lk = link(res);
      L.push({ t: pd(a.sent_at), k: 'sent', x: 'Sent: ' + (a.to || a.label || a.channel || a.id) + (a.channel ? ' · ' + a.channel : ''), m: lk ? 'result: link' : res ? 'result: ' + cut(res, 80) : 'result: not recorded', p: p ? [p] : [], lk: lk });
    });
    if (!pid) { var m = money(); (m && Array.isArray(m.payments) ? m.payments : []).forEach(function (p) {
      if (!p || !isFinite(Number(p.ils))) return; L.push({ t: pd(p.date), k: 'cash', x: ils(p.ils) + ' received' + (p.source ? ' · ' + p.source : ''), m: 'Payment' + (p.logged_by ? ' · ' + p.logged_by : ''), p: [], day: true });
    }); }
    return L.filter(function (e) { return !isNaN(e.t); }).sort(function (a, b) { return b.t - a.t; });
  }
  function proofList(L, n) {
    if (!L.length) return '<p class="empty">No proof yet: no finished runs, sent items or payments recorded' + (S.v === 'mission' ? ' for this mission' : '') + '.</p>';
    return '<ol class="lapc">' + L.slice(0, n).map(function (e) {
      return '<li class="k-' + esc(e.k) + '"><span class="tn"><b dir="auto">' + esc(cut(e.x, 220)) + '</b><small dir="auto">' + esc(e.m) + (S.v === 'proof' && e.p && e.p.length ? ' · ' + esc(e.p.map(pname).join(', ')) : '')
        + (e.lk ? ' · <a href="' + esc(e.lk) + '" target="_blank" rel="noopener noreferrer">open</a>' : '') + '</small></span><time class="mono">' + whenBr(e.t, e.day) + '</time></li>';
    }).join('') + '</ol>';
  }

  function vMission() {
    var p = proj(S.mid);
    if (!p) return '<button type="button" class="back" data-x="nav" data-id="home">‹ Home</button><p class="empty">This mission is not in the data any more.</p>';
    var f = flag(p), mine = daveTasks().filter(function (t) { return t.project_id === p.id; }), team = tasksOpen().filter(function (t) { return t.project_id === p.id && t.owner !== 'dave'; });
    var D = drafts().filter(function (a) { return pidOf(a.product) === p.id; }), R = rankPos();
    var byR = function (a, b) { return (R[a.id] != null ? R[a.id] : 1e6 + (Number(a.rank) || 999)) - (R[b.id] != null ? R[b.id] : 1e6 + (Number(b.rank) || 999)); };
    mine.sort(byR); D.sort(byR);
    var h = '<button type="button" class="back" data-x="nav" data-id="home">‹ Home</button><header class="mhd">' + fl(f) + '<div><p class="mono sm">' + esc(p.stage ? 'Stage ' + p.stage + ' of 6' : 'Mission') + '</p><h1 class="ttl" dir="auto">' + esc(p.name || p.id) + '</h1>' + fw(f) + '</div></header>';
    var you = String(p.you || ''), yl = link(p.you_link);
    h += '<ul class="lines"><li><span>NOW</span><p dir="auto">' + esc(p.now || 'Not written yet.') + '</p></li><li><span>NEXT</span><p dir="auto">' + esc(p.next || 'Not written yet.') + '</p></li>'
      + '<li class="' + (/^\s*(🔴|🟠)/.test(you) ? 'you' : '') + '"><span>YOU</span><div><p dir="auto">' + esc(you || 'Nothing for you.') + '</p>' + (yl ? '<div class="bts">' + doBtn(yl, 'main sm2', 'Do it') + '</div>' : '') + '</div></li>'
      + (Array.isArray(p.blocked_by) && p.blocked_by.length ? '<li><span>WAITS</span><p dir="auto">' + esc(p.blocked_by.join(', ')) + '</p></li>' : '')
      + '<li><span>UPD</span><p class="mono sm">' + esc(when(p.updated || p.updated_at) || 'unknown') + (p.by ? ' · ' + esc(cut(p.by, 60)) : '') + '</p></li></ul>';
    h += '<div class="cols"><section><h2 class="cap">Your steps · ' + mine.length + '</h2>' + (mine.length ? '<div class="rows">' + mine.map(function (t) { return S.dec && S.dec.id === t.id ? decidedRow(t.id, 'done') : taskRow(t, false); }).join('') + '</div>' : '<p class="empty">No open steps for you here.</p>');
    if (team.length) h += '<h2 class="cap">Team steps · ' + team.length + '</h2><ul class="team">' + team.map(function (t) { return '<li><span>' + esc(t.owner || 'team') + '</span><b dir="auto">' + esc(t.title || t.id) + '</b></li>'; }).join('') + '</ul>';
    var RD = readyList(p.id);
    if (RD.length) h += '<h2 class="cap">Ready for you to send · ' + RD.length + '</h2><div class="rows">' + RD.map(readyRow).join('') + '</div>';
    h += '<h2 class="cap">Gates · Go / No-go · ' + D.length + '</h2>' + (D.length ? '<div class="rows">' + D.map(function (a) { return draftRow(a, false); }).join('') + '</div>' : '<p class="empty">No drafts wait for you here.</p>') + '</section>';
    h += '<section><h2 class="cap">Proof</h2>' + proofList(proofItems(p.id), 20) + '</section></div>';
    return h;
  }

  function gateGroups() {
    var R = rankPos(), G = {};
    function score(id, fallback) { return R[id] != null ? R[id] : 1e6 + (Number(fallback) || 999); }
    drafts().forEach(function (a) { var p = pidOf(a.product) || 'p-general'; (G[p] = G[p] || []).push({ k: 'ap', a: a, s: score(a.id, a.rank) }); });
    daveTasks().forEach(function (t) { var p = t.project_id && (proj(t.project_id) || t.project_id === 'p-general') ? t.project_id : 'p-general'; (G[p] = G[p] || []).push({ k: 'tk', t: t, s: score(t.id, t.sev === 'r' ? 1 : t.sev === 'o' ? 2 : 3) }); });
    return Object.keys(G).map(function (p) { var L = G[p].sort(function (a, b) { return a.s - b.s; }); return { p: p, L: L, s: L[0].s }; }).sort(function (a, b) { return a.s - b.s || b.L.length - a.L.length; });
  }
  function gateCount() { return drafts().length + daveTasks().length; }
  function vGates() {
    rankPull();
    var G = gateGroups(), n = gateCount();
    var h = '<h1 class="ttl">Gates</h1><p class="sub">' + (n ? n + ' waiting for you · highest money first · grouped by mission.' : on() ? 'Nothing waits for you. Clear track.' : 'Connecting…') + '</p>';
    var RD = readyList(null);
    if (RD.length) h += '<section class="grp ready"><h2>' + fl('need') + '<span>Ready for you to send</span><span class="n">' + RD.length + '</span></h2><div class="rows two">' + RD.map(readyRow).join('') + '</div></section>';
    G.forEach(function (g) {
      var p = proj(g.p), f = p ? flag(p) : 'quiet';
      h += '<section class="grp"><h2>' + fl(f) + '<span dir="auto">' + esc(pname(g.p)) + '</span><span class="n">' + g.L.length + '</span></h2><div class="rows two">'
        + g.L.map(function (x) { var id = x.k === 'ap' ? x.a.id : x.t.id; if (S.dec && S.dec.id === id) return decidedRow(id, S.dec.how); return x.k === 'ap' ? draftRow(x.a, false) : taskRow(x.t, false); }).join('') + '</div></section>';
    });
    return h;
  }

  function vProof() {
    var all = proofItems(null), seen = {};
    all.forEach(function (e) { (e.p || []).forEach(function (p) { if (p && p !== 'p-general') seen[p] = (seen[p] || 0) + 1; }); });
    var chips = [['all', 'All']].concat(Object.keys(seen).sort(function (a, b) { return seen[b] - seen[a]; }).map(function (p) { return [p, pname(p)]; }));
    if (S.filter !== 'all' && !seen[S.filter]) S.filter = 'all';
    var L = S.filter === 'all' ? all : all.filter(function (e) { return (e.p || []).indexOf(S.filter) > -1; });
    return '<h1 class="ttl">Proof</h1><p class="sub">What ran, what went out (with its result), what came in. Newest first.</p>'
      + '<div class="bts filt" role="group" aria-label="Filter by mission">' + chips.map(function (c) { return '<button type="button" class="bt sm2" data-x="filter" data-id="' + esc(c[0]) + '" aria-pressed="' + (S.filter === c[0]) + '">' + esc(cut(c[1], 28)) + '</button>'; }).join('') + '</div>'
      + proofList(L, S.proofN) + (L.length > S.proofN ? '<div class="more"><button type="button" class="bt sm2" data-x="more">Show more (' + (L.length - S.proofN) + ')</button></div>' : '');
  }

  function vTalk() {
    var L = msgs(40).slice(0, 30).reverse();
    var h = '<h1 class="ttl">Talk</h1><p class="sub">One line to J8 and the team. Answers land here, usually at the next inbox run.</p><ol class="thread">';
    h += L.length ? L.map(function (m) {
      var lines = String(m.reply || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      return '<li><p class="me" dir="auto"><b>You · ' + esc(when(m.at)) + '</b>' + esc(cut(m.text, 120)) + '</p>'
        + (lines.length ? lines.slice(-3).map(function (l) { return '<p class="rl" dir="auto">' + esc(l) + '</p>'; }).join('') : '<p class="wait">Waiting for the team</p>') + '</li>';
    }).join('') : '<li><p class="wait">' + (on() ? 'No messages yet.' : 'Connecting…') + '</p></li>';
    h += '</ol><div class="say"><label class="cap" for="pw-say">Talk to J8</label><textarea id="pw-say" data-say="1" dir="auto" rows="2" placeholder="Ask, steer or tell J8 something">' + esc(S.talk) + '</textarea>'
      + '<button type="button" class="bt main" data-x="say">Send</button></div>';
    return h;
  }

  /* ---------- shell ---------- */
  var NAV = [['home', 'Home'], ['gates', 'Gates'], ['proof', 'Proof'], ['talk', 'Talk']];
  function renderNav() {
    var n = gateCount(), cur = S.v === 'mission' ? 'home' : S.v;
    nav.innerHTML = '<img class="rwm" src="brand/j8nix-mark-8-2026-11-17.svg" alt="" width="21" height="46">' + NAV.map(function (x) {
      return '<button type="button" data-x="nav" data-id="' + x[0] + '"' + (cur === x[0] ? ' aria-current="page"' : '') + '>' + x[1] + (x[0] === 'gates' && n ? '<em class="badge">' + n + '</em><span class="sr"> (' + n + ' waiting)</span>' : '') + '</button>';
    }).join('');
  }
  function renderTop() {
    var el = sr.getElementById('pwlive'); if (!el) return;
    var st = safe(function () { return J().status(); }, {}), last = runs()[0];
    var txt = st.connected ? 'Live' + (last ? ' · last run ' + when(last.ended || last.started) : '') : st.cached ? 'Saved copy · reconnecting' : 'Offline';
    el.className = 'live' + (st.connected ? '' : ' off'); el.innerHTML = '<i aria-hidden="true"></i>' + esc(txt);
  }
  function busy() { var a = sr && sr.activeElement; return !!(a && /^(TEXTAREA|INPUT)$/.test(a.tagName)); }
  function render(force) {
    if (!root) return;
    if (!force && busy()) { pending = true; return; }
    pending = false;
    var y = window.scrollY, changed = S.prevV !== S.v + '|' + S.mid;
    view.innerHTML = S.v === 'mission' ? vMission() : S.v === 'gates' ? vGates() : S.v === 'proof' ? vProof() : S.v === 'talk' ? vTalk() : vHome();
    renderNav(); renderTop();
    if (changed) { view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter'); window.scrollTo(0, 0); S.prevV = S.v + '|' + S.mid; }
    else window.scrollTo(0, y);
  }
  function soon() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; render(false); }); }
  function go(v, mid) { S.v = v; S.mid = mid || null; S.dec = null; render(true); var h = view.querySelector('h1'); if (h) { h.tabIndex = -1; try { h.focus({ preventScroll: true }); } catch (e) {} } }

  function say(msg, undo) {
    hudUndo = undo || null;
    hud.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button type="button" data-x="undo">Undo</button>' : '');
    hud.classList.remove('on'); void hud.offsetWidth; hud.classList.add('on');
    clearTimeout(hudT); hudT = setTimeout(function () { hud.classList.remove('on'); hudUndo = null; }, 6000);
  }
  function fail(x) { say('Could not save: ' + (x && (x.message || x.code) || 'error') + '. Nothing changed.'); render(true); }
  function arm(k) { S.arm[k] = Date.now(); render(true); setTimeout(function () { if (S.arm[k] && Date.now() - S.arm[k] >= 5000) { delete S.arm[k]; render(false); } }, 5100); }

  /* ---------- settings sheet + classic ---------- */
  function sheet(open) {
    var sc = sr.getElementById('pwscrim'), sh = sr.getElementById('pwsheet');
    if (!open) { sc.hidden = true; sh.hidden = true; var g = sr.querySelector('.gear'); if (g) g.focus(); return; }
    var u = safe(function () { return J().auth.user(); }, null), o = safe(function () { return J().orgs.current(); }, null);
    sh.innerHTML = '<h2 id="pwsh">Settings</h2><button type="button" class="bt sm2 x" data-x="sheet-x" aria-label="Close settings">✕</button>'
      + '<div class="srow"><div><b>Classic</b><span>The previous J8NIX screens: lists, flow, control, voice, processes.</span></div><button type="button" class="bt main sm2" data-x="classic">Classic</button></div>'
      + '<div class="srow"><div><b>Refresh</b><span>Load the latest data now.</span></div><button type="button" class="bt sm2" data-x="refresh">Refresh</button></div>'
      + '<div class="srow"><div><b>Signed in</b><span>' + esc(u ? u.email : 'Not signed in') + (o && o.name ? ' · ' + esc(o.name) : '') + '</span></div><button type="button" class="bt sm2" data-x="signout">Sign out</button></div>'
      + '<div class="srow"><div><b>Version</b><span class="mono">J8NIX ' + VER + ' · Pit Wall</span></div></div>';
    sc.hidden = false; sh.hidden = false; var b = sh.querySelector('[data-x="classic"]'); if (b) b.focus();
  }
  function classic(onC) {
    try { if (onC) sessionStorage.setItem('j8pw:classic', '1'); else sessionStorage.removeItem('j8pw:classic'); } catch (e) {}
    document.body.classList.toggle('pw-classic', !!onC); sync();
    if (!onC) render(true);
  }
  function isClassic() { try { return sessionStorage.getItem('j8pw:classic') === '1'; } catch (e) { return false; } }
  function appShown() { var a = document.getElementById('app'); return !!(a && !a.hidden); }
  function sync() { var want = appShown() && !isClassic(); var was = document.body.classList.contains('pw'); document.body.classList.toggle('pw', want); document.documentElement.classList.toggle('pw', want); document.body.classList.toggle('pw-classic', appShown() && isClassic()); if (want && !was) render(true); }

  /* ---------- actions ---------- */
  function act(x, el) {
    var id = el.getAttribute('data-id') || '', j = J();
    if (x === 'nav') { go(id === 'mission' ? 'home' : id || 'home'); return; }
    if (x === 'mission') { if (id && proj(id)) go('mission', id); else go('gates'); return; }
    if (x === 'filter') { S.filter = id; S.proofN = 60; render(true); return; }
    if (x === 'more') { S.proofN += 60; render(true); return; }
    if (x === 'note') { var k = el.getAttribute('data-k'); S.noteOpen[k] = !S.noteOpen[k]; render(true); if (S.noteOpen[k]) { var ta = sr.getElementById('pwn-' + k); if (ta) ta.focus(); } return; }
    if (x === 'undo') { if (hudUndo) { var f = hudUndo; hudUndo = null; hud.classList.remove('on'); f(); } return; }
    if (x === 'gear') { sheet(true); return; }
    if (x === 'sheet-x') { sheet(false); return; }
    if (x === 'classic') { sheet(false); classic(true); return; }
    if (x === 'pitwall') { classic(false); return; }
    if (x === 'refresh') { if (j && j.reload) j.reload().then(function () { say('Up to date.'); }, function () { say('Offline. Showing the saved copy.'); }); S.rankAt = 0; rankPull(); return; }
    if (x === 'signout') { sheet(false); if (j) j.auth.signOut().catch(function () {}); return; }
    if (x === 'copyopen') {
      var ra = safe(function () { return readyList(null).filter(function (q) { return String(q.id) === id; })[0]; }, null); if (!ra) return;
      var rt = String(safe(function () { return j.approvals.textOf(ra); }, '') || ''), rl = link(ra.link);
      if (rt) copyText(rt);
      if (rl) { try { window.open(rl, '_blank', 'noopener,noreferrer'); } catch (e) {} }
      buzz(); say(rt ? 'Copied — paste and send' : 'Opened'); return;
    }
    if (!j || !on()) { say('Not connected. Try again in a moment.'); return; }
    if (x === 'handsent') {
      var hk = 'hs-' + id; if (!armed(hk)) { arm(hk); return; } delete S.arm[hk]; buzz(); el.disabled = true;
      j.approvals.handSent(id).then(function () { say('Marked sent.'); render(true); }, function (e) { el.disabled = false; fail(e); });
      return;
    }
    if (x === 'note-send') {
      var key = el.getAttribute('data-k'), t = String(S.note[key] || '').trim(); if (!t) { say('Write the note first.'); return; }
      el.disabled = true;
      j.inbox.send(el.getAttribute('data-p') || 'p-general', t, el.getAttribute('data-t') || null, el.getAttribute('data-apid') || null).then(function () {
        S.note[key] = ''; S.noteOpen[key] = false; S.sent[key] = 1; var a = sr.activeElement; if (a && a.blur) a.blur(); say('Note sent to the team.'); render(true);
      }, function (e) { el.disabled = false; fail(e); });
      return;
    }
    if (x === 'go' || x === 'nogo') {
      buzz(); el.disabled = true;
      (x === 'go' ? j.approvals.approve(id) : j.approvals.kill(id)).then(function () {
        S.dec = { id: id, how: x }; render(true);
        say(x === 'go' ? 'Go. It goes out on the next send.' : 'No-go. It will not be sent.', function () { j.approvals.undo(id).then(function () { S.dec = null; say('Back to waiting.'); render(true); }, fail); });
      }, function (e) { el.disabled = false; fail(e); });
      return;
    }
    if (x === 'edit') { S.edit = id; classic(true); try { location.hash = '#/d/ap:' + String(id).replace(/\s/g, ''); } catch (e) {} setTimeout(function () { var b = document.querySelector('#main [data-a="dedit"]'); if (b) b.click(); }, 350); return; }
    if (x === 'done') {
      var dk = 'tk-' + id; if (!armed(dk)) { arm(dk); return; } delete S.arm[dk]; buzz(); el.disabled = true;
      j.tasks.done(id).then(function () {
        S.done[id] = 1; S.dec = { id: id, how: 'done' }; render(true);
        say('Done. Nice.', function () { j.tasks.undo(id).then(function () { delete S.done[id]; S.dec = null; say('Back on your list.'); render(true); }, fail); });
      }, function (e) { el.disabled = false; fail(e); });
      return;
    }
    if (x === 'stop' || x === 'resume') {
      if (!armed(x)) { arm(x); return; } delete S.arm[x]; buzz(); el.disabled = true;
      j.control.setPaused(x === 'stop').then(function () { say(x === 'stop' ? 'Red flag: sending stopped. Nothing goes out.' : 'Green flag: sending resumed.'); render(true); }, function (e) { el.disabled = false; fail(e); });
      return;
    }
    if (x === 'say') {
      var v = String(S.talk || '').trim(); if (!v) { say('Write a message first.'); return; }
      el.disabled = true;
      j.inbox.send('p-general', v).then(function () { S.talk = ''; var a = sr.activeElement; if (a && a.blur) a.blur(); say('Sent. The team answers here.'); render(true); }, function (e) { el.disabled = false; fail(e); });
    }
  }

  /* ---------- splash ---------- */
  function splash() {
    var skip = /[?&]nosplash/.test(location.search), last = 0;
    try { last = Number(localStorage.getItem('j8pw:splash')) || 0; } catch (e) {}
    if (skip || isClassic() || Date.now() - last < 6e5) return;
    try { localStorage.setItem('j8pw:splash', String(Date.now())); } catch (e) {}
    var sp = document.createElement('div'); sp.id = 'pwsplash'; sp.setAttribute('aria-hidden', 'true');
    sp.innerHTML = '<div class="pws-in"><div class="pws-lights"><i></i><i></i><i></i><i></i><i></i></div><img class="pws-mk" src="brand/j8nix-mark-8-2026-11-17.svg" alt="" width="32" height="70"><img class="pws-wm" src="brand/j8nix-wordmark-2026-11-17.svg" alt="" width="80" height="28"><p>Pit wall · lights out</p><div class="pws-chq"></div></div>';
    document.body.appendChild(sp);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(function () { sp.classList.add('play'); });
    setTimeout(function () { sp.classList.add('out'); setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 200); }, reduce ? 500 : 1600);
  }

  /* ---------- boot ---------- */
  function boot() {
    root = document.createElement('div'); root.id = 'pw';
    /* a shadow root keeps the classic styles out of Pit Wall and Pit Wall's styles out of the classic app */
    sr = root.attachShadow ? root.attachShadow({ mode: 'open' }) : root;
    sr.innerHTML = '<link rel="stylesheet" href="j12w.css?v=' + VER + '"><div class="pw-in"><header class="pw-top"><img src="brand/j8nix-wordmark-2026-11-17.svg" alt="J8NIX" width="63" height="22"><div class="pw-tr"><p class="live" id="pwlive" role="status"></p>'
      + '<button type="button" class="gear" data-x="gear" aria-label="Settings" aria-haspopup="dialog"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button></div></header>'
      + '<main id="pwv" tabindex="-1"></main></div><nav id="pwnav" aria-label="Main"></nav><div id="pwhud" role="status" aria-live="polite"></div>'
      + '<div id="pwscrim" data-x="sheet-x" hidden></div><div id="pwsheet" role="dialog" aria-modal="true" aria-labelledby="pwsh" hidden></div>';
    document.body.appendChild(root);
    var back = document.createElement('button'); back.type = 'button'; back.id = 'pwclassic'; back.textContent = 'Pit Wall'; back.setAttribute('data-x', 'pitwall');
    document.body.appendChild(back);
    view = sr.querySelector('#pwv'); nav = sr.querySelector('#pwnav'); hud = sr.querySelector('#pwhud');
    function click(e) { var el = e.target.closest && e.target.closest('[data-x]'); if (!el || !(sr.contains(el) || el === back)) return; e.preventDefault(); e.stopPropagation(); act(el.getAttribute('data-x'), el); }
    sr.addEventListener('click', click); back.addEventListener('click', click);
    sr.addEventListener('input', function (e) { var t = e.target; if (t.dataset.note) S.note[t.dataset.note] = t.value; else if (t.dataset.say) S.talk = t.value; });
    sr.addEventListener('focusout', function () { setTimeout(function () { if (pending && !busy()) render(false); }, 0); });
    /* while Pit Wall is in front, the classic app's keyboard shortcuts stay quiet (they would open its hidden sheets) */
    window.addEventListener('keydown', function (e) {
      if (!document.body.classList.contains('pw')) return;
      e.stopImmediatePropagation();
      if (e.key === 'Escape') { var sh = sr.getElementById('pwsheet'); if (sh && !sh.hidden) sheet(false); return; }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { var t = e.composedPath ? e.composedPath()[0] : e.target, b = t && t.dataset && t.dataset.say ? sr.querySelector('[data-x="say"]') : t && t.dataset && t.dataset.note ? sr.querySelector('[data-x="note-send"][data-k="' + CSS.escape(t.dataset.note) + '"]') : null; if (b) { e.preventDefault(); b.click(); } }
    }, true);
    var j = J();
    if (j && j.on) ['projects', 'tasks', 'approvals', 'runs', 'money', 'control', 'comments'].forEach(function (c) { try { j.on(c, soon); } catch (e) {} });
    if (j && j.on) try { j.on('status', function () { S.rankAt = 0; soon(); }); } catch (e) {}
    var a = document.getElementById('app');
    if (a && window.MutationObserver) new MutationObserver(sync).observe(a, { attributes: true, attributeFilter: ['hidden'] });
    sync(); render(true); splash();
    setInterval(function () { if (!document.hidden && document.body.classList.contains('pw')) { renderTop(); rankPull(); } }, 30000);
  }
  window.j8pw = { version: VER, render: function () { render(true); }, go: go, state: S, pace: pace, flag: flag, radio: radio, tower: tower, gates: gateGroups, proof: proofItems, classic: classic, esc: esc, link: link, pd: pd };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
