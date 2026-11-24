/* =====================================================================
   J8NIX 14.0.0 (24 Nov 2026) · "Results". Today opens with a 7-day scoreboard (Sent · Replies · Calls · Proposals · ₪) and a
   true sender line from j8_runs; drafts are one line (who · why now) with the text on tap; hard lint blocks only; batch
   "Approve all N" with 3 previews; "Going out" (hold countdown + Kill); outcome buttons on sent items (j8_reply_mark);
   a load failure shows "Couldn't load — tap to retry". people() moved here from j11.js (window.j8v19 is no longer needed).
   Revert: git revert of the 14.0 commit.
   J8NIX 13.0.0 (23 Nov 2026) · "Through-line". Apple-grade, logo-derived design (spec: ops/brain/J8NIX-POSITIONING-DESIGN.md §4).
   Replaces 12.0 Pit Wall (retired by Dave 23 Nov). Same real data and the same write functions as 12.0, new screens:
     Now        goal ring (₪ collected since 1 Nov vs ₪100,000 by 31 Dec, pace tick + pace chip), Your one move (top j8_rank
                owner 'dave' row, else newest open sev 'r' task), Needs you (up to 3), Missions (state dot + stage line).
     Missions   every active j8_projects row; Mission = now / next / for you, stage line, your steps, to approve, proof.
     Decisions  ready-to-send + every pending draft and open Dave step, highest value first (Approve · Change · Not now).
     Proof      one continuous timeline: runs ok/failed, sent items with result, payments; week line on top.
     Talk       one thread with J8 (J8.inbox.send to p-general).
   Pause glyph top right on every screen (two taps) = j8_control.paused via J8.control.setPaused.
   All dynamic text is escaped; links are https only. Revert: index-12.0.1.html + sw-12.0.1.js.
   ===================================================================== */
(function () {
  'use strict';
  var VER = '14.0.0';
  var GOAL = 100000, LINE_FROM = '2026-11-19', LINE_TO = '2026-12-31', COUNT_FROM = '2026-11-01';
  var TZ = 'Asia/Jerusalem';
  var J = function () { return window.J8 || null; };
  var S = { v: 'now', mid: null, filter: 'all', proofN: 60, note: {}, noteOpen: {}, sent: {}, arm: {}, talk: '', rank: null, rankAt: 0, done: {}, prevV: null, lint: null, lintAt: 0, bprev: null, goAll: false, ocAll: false, busyB: false };
  var root, sr, view, nav, hud, hudT, hudUndo = null, raf = 0, pending = false, BOOT = Date.now();

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
  function lintPull() {
    var j = J(); if (!on() || !j.lint || Date.now() - S.lintAt < 6e4) return; S.lintAt = Date.now();
    j.lint().then(function (L) { if (L && typeof L === 'object') { S.lint = L; soon(); } }, function () {});
  }
  function lintOf(a) { return (S.lint && a && S.lint[a.id]) || { flags: [], hard: false }; }
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
    if (appLink(u)) return '<button type="button" class="' + cls + '" data-x="nav" data-id="decisions">' + esc(label || 'Do it') + '</button>';
    return '<a class="' + cls + '" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(label || 'Do it') + '</a>';
  }
  function noteBox(key, pid, taskId, apId) {
    var open = S.noteOpen[key], sent = S.sent[key];
    var h = '';
    if (open) h += '<div class="note"><label class="sr" for="jxn-' + esc(key) + '">Note to the team</label><textarea id="jxn-' + esc(key) + '" data-note="' + esc(key) + '" dir="auto" placeholder="Note to the team">' + esc(S.note[key] || '') + '</textarea>'
      + '<div class="bts"><button type="button" class="cap-b main" data-x="note-send" data-k="' + esc(key) + '" data-p="' + esc(pid || 'p-general') + '" data-t="' + esc(taskId || '') + '" data-apid="' + esc(apId || '') + '">Send note</button><button type="button" class="ql" data-x="note" data-k="' + esc(key) + '">Cancel</button></div></div>';
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
    h += '<div class="bts">' + (lk ? doBtn(lk, 'cap-b main', t.link_text && t.link_text.length < 26 ? t.link_text : 'Do it') : '')
      + '<button type="button" class="cap-b' + (armed(k) ? ' arm' : '') + '" data-x="done" data-id="' + esc(t.id) + '">' + (armed(k) ? 'Tap again: done' : 'Done') + '</button>'
      + '<button type="button" class="ql" data-x="note" data-k="' + esc(k) + '">Note</button></div>';
    return h + noteBox(k, t.project_id, t.id, null) + '</article>';
  }
  /* 14.0: one line per draft: "<who> · <why now in ≤8 words>" + subject; text, channel, soft warnings behind the tap */
  function words(x, n) { var w = String(x || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean); return w.length > n ? w.slice(0, n).join(' ').replace(/[,;:·.\-–(]+$/, '') + '…' : w.join(' '); }
  function whoOf(a) { return cut(a.to || a.label || a.subject || a.kind || 'Draft', 56); }
  function whyNow(a) {
    var g = a.gist || a.why_now; if (g) return words(g, 8);
    var c = String(a.context || '').replace(/\s+/g, ' ').trim();
    if (a.kind === 'application') {
      var f = /\bFit (\d+)\s*\/\s*100/i.exec(c), po = /\bposted ([^·]+?)\s*(?:·|$)/i.exec(c);
      var L = [f ? 'Fit ' + f[1] + '/100' : '', po ? 'posted ' + words(po[1], 4) : ''].filter(Boolean).join(' · ');
      if (L) return L;
    }
    if (a.kind === 'template') return 'Saved message: approve once, used many times';
    var src = /\bSource:\s*([^:·]+?)(?::\s*https?:|\s·\s|$)/i.exec(c); /* e.g. "Source: Seed $33M, out of stealth 10 Nov 2026: https://…" */
    if (src && !/^https?/i.test(src[1].trim())) return words(src[1], 8);
    var first = c.split(/\s·\s|\.\s/)[0];
    return first ? words(first, 8) : words(a.batch_label || a.channel || '', 8);
  }
  function draftRow(a, showProj) {
    var j = J(), tx = String(safe(function () { return j.approvals.textOf(a); }, '') || ''), plan = !!(a.no_send || (a.extra && a.extra.no_send)), tpl = a.kind === 'template';
    var who = whoOf(a), why = whyNow(a), w = waitsOn(a), li = lintOf(a);
    var hard = li.flags.filter(function (f) { return /^HARD:/.test(f); }).map(function (f) { return f.replace(/^HARD:\s*/, ''); });
    var soft = li.flags.filter(function (f) { return !/^HARD:/.test(f); }).map(function (f) { return f.replace(/^CHECK:\s*/, ''); });
    var h = '<article class="row poll one" data-ap="' + esc(a.id) + '"><p class="yt" dir="auto">' + (tpl ? '<span class="tag">Saved message</span>' : plan ? '<span class="tag">Plan only</span>' : '') + esc(who) + (why ? '<span class="wn"> · ' + esc(why) + '</span>' : '') + '</p>';
    var sub = a.subject && a.subject !== a.to ? cut(a.subject, 80) : '';
    if (sub || showProj) h += '<p class="yp" dir="auto">' + esc([showProj ? pname(pidOf(a.product)) : '', sub].filter(Boolean).join(' · ')) + '</p>';
    if (li.hard && hard.length) h += '<p class="warn" dir="auto">Blocked: ' + esc(cut(hard.join(' · '), 160)) + '</p>';
    var more = [a.channel ? '<p class="mi-l">Where</p><p dir="auto">' + esc(a.channel) + '</p>' : '',
      a.warn ? '<p class="mi-l">Note</p><p dir="auto">' + esc(a.warn) + '</p>' : '',
      soft.length ? '<p class="mi-l">Check</p><p dir="auto">' + esc(soft.join(' · ')) + '</p>' : '',
      w.length ? '<p class="mi-l">Waits on</p><p dir="auto">' + esc(w.join(' · ')) + '</p>' : '',
      plan ? '<p dir="auto">Plan only: nothing is sent.</p>' : '',
      tx ? '<p class="mi-l">Text</p><p class="full" dir="auto">' + esc(tx) + '</p>' : ''].join('');
    if (more) h += '<details class="more-info"><summary>Read it</summary>' + more + '</details>';
    var hb = li.hard && armed('hb-' + a.id);
    h += '<div class="bts"><button type="button" class="cap-b main' + (hb ? ' arm' : '') + '" data-x="go" data-id="' + esc(a.id) + '">' + (hb ? 'Tap again: send anyway' : plan ? 'Yes, start' : tpl ? 'Yes, use this message' : 'Yes, send it') + '</button>'
      + '<button type="button" class="cap-b" data-x="nogo" data-id="' + esc(a.id) + '">Not now</button>'
      + (plan ? '' : '<button type="button" class="ql" data-x="edit" data-id="' + esc(a.id) + '">Change</button>') + '</div>';
    return h + '</article>';
  }
  function decidedRow(id, how) {
    return '<article class="row dec ' + (how === 'nogo' ? 'nogo' : '') + '"><p class="yt">' + (how === 'go' ? 'Approved' : how === 'done' ? 'Done' : 'Not now') + '</p><p class="yp">Saved. <button type="button" class="ql" data-x="undo">Undo</button></p></article>';
  }

  /* 12.0.1: by-hand drafts Dave approved (Go) and still has to send himself: same list as the 11.8 Home "People to message".
     14.0: people() lives here now (was window.j8v19.people in j11.js: isHand18 + due18, posts left out, oldest OK first). */
  function allAps() { var j = J(); return safe(function () { return j.approvals.list(); }, []); }
  function isHand(a) { if (!a || a.kind === 'template' || a.label === 'Template' || a.source === 'j8nix-app') return false; return /^linkedin/i.test(String(a.channel || '').trim()) || a.label === 'Send by hand'; }
  function handDue(a) { if (a.status === 'approved' || a.status === 'edited') return true; if (a.status === 'queued') { var h = pd(a.hold_until); return !isNaN(h) && h < Date.now(); } return false; }
  function atOr(a, k) { var t = pd(a[k]); if (isNaN(t)) t = pd(a.created); return isNaN(t) ? 9e15 : t; }
  function people() { return allAps().filter(function (a) { return isHand(a) && handDue(a) && a.kind !== 'post'; }).sort(function (a, b) { return atOr(a, 'decided_at') - atOr(b, 'decided_at'); }); }
  function readyList(pid) {
    var L = safe(people, []);
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
    h += '<div class="bts">' + (tx || lk ? '<button type="button" class="cap-b main" data-x="copyopen" data-id="' + esc(a.id) + '">' + (lk ? 'Copy &amp; open' : 'Copy') + '</button>' : '')
      + '<button type="button" class="ql' + (armed(k) ? ' arm' : '') + '" data-x="handsent" data-id="' + esc(a.id) + '">' + (armed(k) ? 'Tap again: sent' : 'Mark sent') + '</button></div>';
    return h + '</article>';
  }

  /* ---------- 13.0 "Through-line" pieces ---------- */
  var DOT = { run: 'J8 working', need: 'needs you', block: 'waiting', done: 'done', quiet: 'no news 24h' };
  function dot(f) { return '<i class="dot d-' + esc(f) + '" aria-hidden="true"></i>'; }
  function ico(n) {
    var P = {
      now: '<circle cx="12" cy="12" r="8.5" stroke-dasharray="49 4.4" transform="rotate(-80 12 12)"/><circle cx="12" cy="12" r="2"/>',
      missions: '<path d="M5 6.5h9M5 12h14M5 17.5h7"/>',
      plan: '<path d="M12 3.5v4M12 16.5v4"/><circle cx="12" cy="12" r="3.2"/><path d="M6 6.5h0M18 17.5h0"/><path d="M5 4.5h4M15 19.5h4"/>',
      decisions: '<path d="M7 12.5l3 3 7-7"/><path d="M20 12a8 8 0 1 1-3.2-6.4"/>',
      proof: '<path d="M7 4v16"/><circle cx="7" cy="7" r="1.6"/><circle cx="7" cy="17" r="1.6"/><path d="M11 7h7M11 17h5"/>',
      talk: '<path d="M5 17.5V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9l-4 3.5z"/>',
      pause: '<path d="M9.5 7v10M14.5 7v10"/>',
      play: '<path d="M9 6.8v10.4l8.2-5.2z"/>',
      gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.3M12 18.2v2.3M3.5 12h2.3M18.2 12h2.3M6 6l1.6 1.6M16.4 16.4L18 18M6 18l1.6-1.6M16.4 7.6L18 6"/>',
      back: '<path d="M14.5 6l-6 6 6 6"/>',
      go: '<path d="M9 6l6 6-6 6"/>'
    };
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>';
  }
  function state(p) { return flag(p); }
  function pauseBtn() {
    if (!ctl() && !on()) return '';
    var p = paused(), k = p ? 'resume' : 'stop', ar = armed(k);
    return '<button type="button" class="glyph' + (p ? ' is-p' : '') + (ar ? ' arm' : '') + '" data-x="' + k + '" aria-label="' + (p ? 'Sending is paused. Tap twice to resume' : 'Sending is on. Tap twice to pause') + '">'
      + ico(p ? 'play' : 'pause') + (ar ? '<span>' + (p ? 'Tap again: resume' : 'Tap again: pause') + '</span>' : '') + '</button>';
  }
  function pausedNote() {
    if (!paused()) return '';
    var c = ctl(), by = c && c.updated ? when(c.updated) : '', ar = armed('resume');
    return '<section class="act paused" aria-labelledby="jx-pz"><p class="lbl" id="jx-pz">' + dot('quiet') + 'Sending is paused' + (by ? ' · since ' + esc(by) : '') + '</p>'
      + '<p class="callout">Nothing goes out until you resume. Approved items wait safely.</p>'
      + '<div class="bts"><button type="button" class="cap-b main' + (ar ? ' arm' : '') + '" data-x="resume">' + (ar ? 'Tap again to resume' : 'Resume sending') + '</button></div></section>';
  }

  /* goal ring: one ring, 12° open gap at the top until the goal is reached (then it closes) */
  function ring(pc) {
    var R = 100, C = 2 * Math.PI * R, gapDeg = pc && pc.got >= GOAL ? 0 : 12, usable = C * (360 - gapDeg) / 360;
    var frac = pc ? Math.max(0, Math.min(1, pc.got / GOAL)) : 0, lineFrac = pc ? Math.max(0, Math.min(1, pc.line / GOAL)) : 0;
    var arc = Math.max(frac > 0 ? 6 : 0, usable * frac), rot = -90 + gapDeg / 2;
    var tickA = (rot + (360 - gapDeg) * lineFrac) * Math.PI / 180, tx = 120 + R * Math.cos(tickA), ty = 120 + R * Math.sin(tickA);
    var h = '<svg class="ring" viewBox="0 0 240 240" role="img" aria-label="' + esc(pc ? ils(pc.got) + ' of ' + ils(GOAL) : 'Goal ring') + '">'
      + '<defs><linearGradient id="jxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5BB6F9"/><stop offset=".5" stop-color="#4075D8"/><stop offset="1" stop-color="#3043BF"/></linearGradient></defs>'
      + '<circle class="trk" cx="120" cy="120" r="' + R + '" stroke-dasharray="' + usable.toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(' + rot + ' 120 120)"/>'
      + (arc ? '<circle class="val" cx="120" cy="120" r="' + R + '" stroke-dasharray="' + arc.toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(' + rot + ' 120 120)" style="--len:' + arc.toFixed(1) + '"/>' : '')
      + (pc && pc.line > 0 && pc.got < GOAL ? '<circle class="tick" cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="4"><title>Today\'s pace: ' + esc(ils(pc.line)) + '</title></circle>' : '')
      + '</svg>';
    return h;
  }
  function paceChip(pc) {
    if (!pc) return '';
    if (pc.got >= GOAL) return '<span class="chip ok">Goal reached</span>';
    if (pc.gap >= 0) return '<span class="chip ok">' + (pc.gap > 0 ? 'Ahead by ' + esc(ils(pc.gap)) : 'On pace') + '</span>';
    return '<span class="chip need">' + esc(ils(-pc.gap)) + ' behind pace</span>';
  }

  /* ---------- screens ---------- */
  /* ---------- 13.1: backward plan (j8_plans) ---------- */
  function plan() {
    var j = J(), L = safe(function () { return j.plans.list(); }, []);
    L = (L || []).filter(function (p) { return p && !/^(done|dropped)$/.test(p.status || ''); });
    return L[0] || null;
  }
  function optsOf(pl) { return pl && Array.isArray(pl.options) ? pl.options : []; }
  function activeOpt(pl) {
    var O = optsOf(pl), k = pl && pl.chosen;
    return O.filter(function (o) { return o && o.key === k; })[0] || O.filter(function (o) { return o && o.recommended; })[0] || null;
  }
  function dDay(s) { var t = pd(s); if (isNaN(t)) return ''; var x = new Date(t); return x.getUTCDate() + ' ' + MON[x.getUTCMonth()] + (x.getUTCFullYear() !== 2026 ? ' ' + x.getUTCFullYear() : ''); }
  function dLeft(s) { var n = daysTo(s); return n == null ? '' : n === 0 ? 'today' : n === 1 ? 'tomorrow' : n < 0 ? (-n) + ' days ago' : n + ' days'; }
  function daysTo(s) { var t = pd(s); if (isNaN(t)) return null; return Math.round((dayNo(String(s).slice(0, 10)) - dayNo(ymdIL(Date.now())))); }
  function eyebrow(t) { return '<p class="eyebrow"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>' + esc(t) + '</p>'; }
  var HONEST = 'J8NIX can\'t promise results. It gives you the plan with the best odds we know, shows the math, and tells you early when it\'s off track.';
  var STATUS = { draft: 'Draft', go: 'On plan', off_track: 'Off track', replanned: 'New plan', done: 'Done' };

  function goalBar(pl, pc) {
    var got = pc ? pc.got : pl ? Number(pl.baseline) || 0 : 0, tgt = pl ? Number(pl.target) || GOAL : GOAL, dl = pl ? pl.deadline : LINE_TO;
    var pct = Math.max(0, Math.min(100, got / tgt * 100)), st = pl ? pl.status : '', dt = daysTo(dl);
    return '<section class="gbar" aria-labelledby="jx-gl">' + eyebrow('Your goal') + '<h2 class="sr" id="jx-gl">Your goal</h2>'
      + '<p class="gnum"><span class="t1 num">' + esc(ils(got)) + '</span><span class="gof">of ' + esc(ils(tgt)) + ' · by ' + esc(dDay(dl)) + '</span></p>'
      + '<span class="gb" aria-hidden="true"><i style="width:' + Math.max(pct, got > 0 ? 1.2 : 0).toFixed(1) + '%"></i></span>'
      + '<p class="gmeta">' + (st ? '<span class="chip ' + (st === 'off_track' ? 'need' : st === 'go' ? 'ok' : '') + '">' + esc(STATUS[st] || st) + '</span>' : '')
      + (dt != null ? '<span>' + esc(dt) + ' days left</span>' : '') + '<span>' + esc(pl ? pl.goal || 'Money collected' : 'Money collected') + '</span></p></section>';
  }

  /* the user's one action, as a numbered "Follow these steps" list; details fold away */
  function stepsOf(text) {
    var s = String(text || '').trim(); if (!s) return [];
    var parts = s.split(/\n+|(?:^|\s)(?=\d+[.)]\s)|\s*(?:→|->)\s*/).map(function (x) { return x.replace(/^\s*\d+[.)]\s*/, '').trim(); }).filter(function (x) { return x.length > 1; });
    return parts.length > 1 ? parts.slice(0, 8) : [];
  }
  function doNow() {
    var r = radio(), h = '<section class="card move" aria-labelledby="jx-m">' + '<p class="lbl" id="jx-m">Do this now</p>';
    if (!r) return h + (failed() ? '<p class="t2">Couldn\'t load. Tap retry at the top.</p>' : '<p class="t2">' + (on() ? 'Nothing needs you right now. J8 is working.' : 'Connecting…') + '</p>') + '</section>';
    var t = r.t, lk = r.kind === 'task' ? link(t.link) : r.kind === 'project' ? link(r.p.you_link) : '';
    var pid = r.kind === 'task' ? t.project_id : r.kind === 'project' ? r.id : pidOf(r.a.product);
    h += '<p class="t2" dir="auto">' + esc(cut(String(r.title || '').replace(/^\s*(TODAY\s*\d*\s*·\s*)/i, ''), 140)) + '</p>';
    var meta = [r.kind === 'task' && t.minutes ? t.minutes + ' min' : '', pid ? pname(pid) : ''].filter(Boolean).join(' · ');
    if (meta) h += '<p class="fn" dir="auto">' + esc(meta) + '</p>';
    var S2 = r.kind === 'task' ? stepsOf(t.action) : [];
    if (S2.length) h += '<p class="lbl sm">Follow these steps</p><ol class="follow">' + S2.map(function (x) { return '<li dir="auto">' + esc(cut(x, 200)) + '</li>'; }).join('') + '</ol>';
    else if (r.kind === 'task' && t.action) h += '<p class="callout" dir="auto">' + esc(cut(t.action, 260)) + '</p>';
    else if (r.kind === 'approval') h += '<p class="callout">A message waits for your OK.</p>';
    h += '<div class="bts">';
    if (r.kind === 'approval') h += '<button type="button" class="cap-b main" data-x="nav" data-id="decisions">Open it</button>';
    else if (lk) h += doBtn(lk, 'cap-b main', t && t.link_text && t.link_text.length < 24 && !/approve|gate|mission|run\b/i.test(t.link_text) ? t.link_text : 'Start');
    else h += '<button type="button" class="cap-b main" data-x="mission" data-id="' + esc(pid || '') + '">Start</button>';
    if (r.kind === 'task') h += '<button type="button" class="cap-b' + (armed('tk-' + r.id) ? ' arm' : '') + '" data-x="done" data-id="' + esc(r.id) + '">' + (armed('tk-' + r.id) ? 'Tap again: done' : 'I did it') + '</button>';
    var key = r.kind === 'task' ? 'tk-' + r.id : r.kind === 'approval' ? 'ap-' + r.id : 'pj-' + r.id;
    h += '</div>';
    if (r.kind === 'task' && t.why) h += '<details class="more-info"><summary>Why this matters</summary><p class="callout" dir="auto">' + esc(t.why) + '</p></details>';
    h += '<div class="bts quiet"><button type="button" class="ql" data-x="note" data-k="' + esc(key) + '">Ask J8 about this</button></div>'
      + noteBox(key, pid, r.kind === 'task' ? r.id : null, r.kind === 'approval' ? r.id : null);
    return h + '</section>';
  }

  function choosePanel(pl) {
    if (!pl || pl.chosen) return '';
    var rec = activeOpt(pl); if (!rec) return '';
    var k = 'pick-' + rec.key, ar = armed(k);
    return '<section class="act" aria-labelledby="jx-ch"><p class="lbl" id="jx-ch">Needs your choice</p>'
      + '<p class="t2" dir="auto">' + esc(pl.verdict || 'Choose the plan to follow.') + '</p>'
      + '<p class="callout">J8 recommends: <b dir="auto">' + esc(rec.label) + '</b>. ' + esc(rec.math || '') + '</p>'
      + '<div class="bts"><button type="button" class="cap-b main' + (ar ? ' arm' : '') + '" data-x="pick" data-id="' + esc(pl.id) + '" data-k="' + esc(rec.key) + '">' + (ar ? 'Tap again to confirm' : 'Go with this plan') + '</button>'
      + '<button type="button" class="cap-b" data-x="nav" data-id="plan">See all options</button></div></section>';
  }

  function nextMilestone(pl) {
    var o = activeOpt(pl); if (!o || !Array.isArray(o.chain) || !o.chain.length) return '';
    var C = o.chain.slice().sort(function (a, b) { return a.n - b.n; }), today = ymdIL(Date.now());
    var nx = C.filter(function (m) { return String(m.date) >= today; })[0] || C[0], fin = C[C.length - 1];
    return '<section class="grp" aria-labelledby="jx-nm"><div class="gh"><h2 class="hd" id="jx-nm">Next stop on your plan</h2><button type="button" class="ql" data-x="nav" data-id="plan">Whole plan</button></div>'
      + '<button type="button" class="stopc" data-x="nav" data-id="plan"><span class="sd"><b>' + esc(dDay(nx.date)) + '</b><small>' + esc(daysTo(nx.date)) + ' days</small></span>'
      + '<span class="lt"><b dir="auto">' + esc(nx.number) + '</b><small dir="auto">' + esc(cut(nx.done, 110)) + '</small></span>' + ico('go') + '</button>'
      + (fin && fin !== nx ? '<p class="fn tight">Leads to: ' + esc(fin.number) + ' by ' + esc(dDay(fin.date)) + (pl.chosen ? '' : ' (proposed)') + '</p>' : '') + '</section>';
  }

  function vNow() {
    rankPull(); lintPull();
    var pl = plan(), pc = pace(), p = il(Date.now()), DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dow = DAYS[new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay()];
    var h = '<h1 class="sr">Today</h1><p class="date">' + esc(dow + ' · ' + p.d + ' ' + MON[p.m - 1]) + '</p>';
    h += scoreboard() + (failed() && !money() ? '' : goalBar(pl, pc)) + choosePanel(pl) + pausedNote() + doNow() + nextMilestone(pl);
    var F = flatDecisions(), r = radio(), topId = r ? r.id : null;
    F = F.filter(function (x) { return x.id !== topId; });
    if (F.length) h += '<section class="grp" aria-labelledby="jx-n"><div class="gh"><h2 class="hd" id="jx-n">Waiting for your OK · ' + F.length + '</h2><button type="button" class="ql" data-x="nav" data-id="decisions">See all</button></div><div class="list">'
      + F.slice(0, 3).map(function (x) { return '<button type="button" class="li" data-x="nav" data-id="decisions">' + dot('need') + '<span class="lt"><b dir="auto">' + esc(cut(x.title, 90)) + '</b><small dir="auto">' + esc(cut(x.sub, 70)) + '</small></span>' + ico('go') + '</button>'; }).join('') + '</div></section>';
    return h + goingOutBox() + outcomesBox();
  }

  function vPlan() {
    var pl = plan(), h = eyebrow('Plan from the finish to today');
    if (!pl) return h + '<h1 class="lt1">Plan</h1><p class="sub">' + (on() ? 'No plan yet. Tell J8 your goal in Talk ("₪X by date") and it builds one from the finish back to today.' : 'Connecting…') + '</p>' + goalsList();
    var o = activeOpt(pl), O = optsOf(pl);
    h += '<h1 class="lt1" dir="auto">' + esc(ils(pl.target)) + ' by ' + esc(dDay(pl.deadline)) + '</h1><p class="sub" dir="auto">' + esc(pl.goal || '') + ' · now ' + esc(ils((pace() || {}).got != null ? pace().got : pl.baseline)) + '</p>';
    h += '<section class="card check"><p class="lbl ' + (pl.status === 'off_track' ? 'need' : '') + '">Reality check</p><p class="body" dir="auto">' + esc(pl.verdict || '') + '</p>'
      + (pl.bottleneck ? '<p class="lbl">What\'s holding us back</p><p class="body" dir="auto">' + esc(pl.bottleneck) + '</p>' : '') + '<p class="fn honest">' + esc(HONEST) + '</p></section>';
    if (!pl.chosen && O.length) {
      h += '<section class="grp"><h2 class="hd">Choose your plan</h2><p class="fn tight">Each option is worked out from the finish back to today.</p><div class="rows">';
      h += O.map(function (x) {
        var k = 'pick-' + x.key, ar = armed(k);
        return '<article class="act opt' + (x.recommended ? ' rec' : '') + '"><p class="lbl">' + (x.recommended ? 'J8 recommends' : x.fits === false ? 'Doesn\'t fit the date' : x.fits ? 'Fits' : 'Needs more info') + '</p>'
          + '<p class="yt" dir="auto">' + esc(x.label) + '</p><p class="why" dir="auto">' + esc(x.math || '') + '</p>'
          + '<div class="bts"><button type="button" class="cap-b' + (x.recommended ? ' main' : '') + (ar ? ' arm' : '') + '" data-x="pick" data-id="' + esc(pl.id) + '" data-k="' + esc(x.key) + '">' + (ar ? 'Tap again to confirm' : 'Choose ' + esc(x.key)) + '</button>'
          + (x.chain && x.chain.length ? '<button type="button" class="ql" data-x="peek" data-id="' + esc(x.key) + '">' + (S.peek === x.key ? 'Hide steps' : 'See its steps') + '</button>' : '') + '</div>'
          + (S.peek === x.key ? chainHtml(x, true) : '') + '</article>';
      }).join('') + '</div></section>';
    }
    if (o && o.chain && o.chain.length) h += '<section class="grp"><h2 class="hd">' + (pl.chosen ? 'Your plan: ' + esc(o.label) : 'Plan ' + esc(o.key) + ' (proposed)') + '</h2><p class="fn tight">Read from the top: the finish. Each stop needs the one under it first. Today is at the bottom.</p>' + chainHtml(o, false) + '</section>';
    var A = Array.isArray(pl.assumptions) ? pl.assumptions : [];
    if (A.length) h += '<details class="grp asm"><summary class="hd">Numbers this plan uses (' + A.length + ')</summary><ul>' + A.map(function (a) {
      var u = link(a.source); return '<li><b dir="auto">' + esc(a.name) + '</b><span dir="auto">' + esc(a.value) + '</span><small>' + esc(a.kind === 'ours' ? 'our data' : a.kind === 'benchmark' ? 'public benchmark' : 'J8 guess, replaced by real results') + (u ? ' · <a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">source</a>' : a.source ? ' · ' + esc(a.source) : '') + '</small></li>';
    }).join('') + '</ul></details>';
    return h + goalsList();
  }
  function chainHtml(o, mini) {
    var C = o.chain.slice().sort(function (a, b) { return b.n - a.n; }), today = ymdIL(Date.now());
    return '<ol class="chain' + (mini ? ' mini' : '') + '">' + C.map(function (m, i) {
      var past = String(m.date) < today, isToday = m.n === 0, u = link(m.src);
      return '<li class="stop' + (isToday ? ' today' : '') + (past ? ' past' : '') + '">' + (i ? '<p class="need-first">to get the stop above, first:</p>' : '')
        + '<div class="stopc"><span class="sd"><b>' + esc(dDay(m.date)) + '</b><small>' + (isToday ? 'start' : esc(dLeft(m.date))) + '</small></span>'
        + '<span class="lt"><b dir="auto">' + esc(m.number) + '</b><small dir="auto">' + esc(m.done) + '</small></span></div>'
        + (mini ? '' : '<details class="more-info"><summary>How</summary>'
          + (m.why ? '<p class="mi-l">Why it\'s needed</p><p dir="auto">' + esc(m.why) + '</p>' : '')
          + (m.method ? '<p class="mi-l">Proven method</p><p dir="auto">' + esc(m.method) + (u ? ' · <a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">source</a>' : '') + '</p>' : '')
          + (m.risk ? '<p class="mi-l">Main risk</p><p dir="auto">' + esc(m.risk) + (m.if_then ? ' ' + esc(m.if_then) : '') + '</p>' : '') + '</details>')
        + '</li>';
    }).join('') + '</ol>';
  }
  function goalsList() {
    var T = tower().filter(function (x) { return x.f !== 'done'; });
    return '<section class="grp" aria-labelledby="jx-gs"><h2 class="hd" id="jx-gs">All projects · ' + T.length + '</h2>'
      + (T.length ? '<div class="list">' + T.map(missionRow).join('') + '</div>' : '<p class="empty">' + (on() ? 'No active projects.' : 'Connecting…') + '</p>') + '</section>';
  }

  function missionRow(x) {
    var p = x.p, st = Number(p.stage) || 0, pct = st ? Math.min(100, Math.round(st / 6 * 100)) : 0;
    return '<button type="button" class="li mi s-' + esc(x.f) + '" data-x="mission" data-id="' + esc(p.id) + '">' + dot(x.f)
      + '<span class="lt"><b dir="auto">' + esc(p.name || p.id) + '</b><small dir="auto">' + esc(cut(p.now || p.next || DOT[x.f], 80)) + '</small>'
      + '<span class="pl" aria-hidden="true"><i style="width:' + pct + '%"></i></span></span>'
      + '<span class="st">' + esc(DOT[x.f]) + '</span></button>';
  }
  function vMissions() {
    var T = tower();
    return '<h1 class="lt1">Missions</h1><p class="sub">' + (T.length ? T.length + ' running. The ones that need you are on top.' : on() ? 'No active missions.' : 'Connecting…') + '</p>'
      + (T.length ? '<div class="list">' + T.map(missionRow).join('') + '</div>' : '');
  }

  function flatDecisions() {
    var L = [];
    readyList(null).forEach(function (a) { L.push({ id: a.id, title: 'Send: ' + (a.to || a.label || 'message'), sub: (a.channel || '') + ' · approved, ready for you to send' }); });
    gateGroups().forEach(function (g) { g.L.forEach(function (x) {
      if (x.k === 'ap') L.push({ id: x.a.id, title: whoOf(x.a), sub: pname(g.p) + ' · ' + (whyNow(x.a) || (x.a.kind === 'template' ? 'template to approve' : 'draft to approve')) });
      else L.push({ id: x.t.id, title: x.t.title || x.t.id, sub: pname(g.p) + ' · your step' + (x.t.minutes ? ' · ' + x.t.minutes + ' min' : '') });
    }); });
    return L;
  }

  function stepLine(p) {
    var st = Math.max(0, Math.min(6, Number(p.stage) || 0)), h = '<ol class="steps" aria-label="Stage ' + st + ' of 6">';
    for (var i = 1; i <= 6; i++) h += '<li class="' + (i < st ? 'dn' : i === st ? 'cur' : '') + '"><i></i></li>';
    return h + '</ol><p class="fn">Stage ' + st + ' of 6</p>';
  }
  function vMission() {
    var p = proj(S.mid);
    if (!p) return '<button type="button" class="back" data-x="nav" data-id="plan">' + ico('back') + 'Plan</button><p class="empty">This mission is not in the data any more.</p>';
    var f = flag(p), mine = daveTasks().filter(function (t) { return t.project_id === p.id; }), team = tasksOpen().filter(function (t) { return t.project_id === p.id && t.owner !== 'dave'; });
    lintPull(); var D = drafts().filter(function (a) { return pidOf(a.product) === p.id; }), R = rankPos();
    var byR = function (a, b) { return (R[a.id] != null ? R[a.id] : 1e6 + (Number(a.rank) || 999)) - (R[b.id] != null ? R[b.id] : 1e6 + (Number(b.rank) || 999)); };
    mine.sort(byR); D.sort(byR);
    var h = '<button type="button" class="back" data-x="nav" data-id="plan">' + ico('back') + 'Plan</button>'
      + '<header class="mhd"><h1 class="t3" dir="auto">' + esc(p.name || p.id) + '</h1><p class="sub">' + dot(f) + esc(DOT[f]) + ' · updated ' + esc(when(p.updated || p.updated_at) || 'unknown') + '</p>' + (p.stage ? stepLine(p) : '') + '</header>';
    var you = String(p.you || '').replace(/^\s*(🔴|🟠|🟢|⚪)\s*/, ''), yl = link(p.you_link);
    h += '<section class="card"><p class="lbl">Now</p><p class="body" dir="auto">' + esc(p.now || 'Not written yet.') + '</p>'
      + '<p class="lbl">Next</p><p class="body" dir="auto">' + esc(p.next || 'Not written yet.') + '</p>'
      + (you ? '<p class="lbl need">For you</p><p class="body" dir="auto">' + esc(you) + '</p>' + (yl ? '<div class="bts">' + doBtn(yl, 'cap-b main', 'Do it') + '</div>' : '') : '')
      + (Array.isArray(p.blocked_by) && p.blocked_by.length ? '<p class="lbl blk">Waits on</p><p class="body" dir="auto">' + esc(p.blocked_by.join(', ')) + '</p>' : '') + '</section>';
    if (mine.length) h += '<section class="grp"><h2 class="hd">Your steps · ' + mine.length + '</h2><div class="rows">' + mine.map(function (t) { return S.dec && S.dec.id === t.id ? decidedRow(t.id, 'done') : taskRow(t, false); }).join('') + '</div></section>';
    var RD = readyList(p.id);
    if (RD.length) h += '<section class="grp"><h2 class="hd">Ready for you to send · ' + RD.length + '</h2><div class="rows">' + RD.map(readyRow).join('') + '</div></section>';
    if (D.length) h += '<section class="grp"><h2 class="hd">To approve · ' + D.length + '</h2><div class="rows">' + D.map(function (a) { return S.dec && S.dec.id === a.id ? decidedRow(a.id, S.dec.how) : draftRow(a, false); }).join('') + '</div></section>';
    if (team.length) h += '<section class="grp"><h2 class="hd">J8 is on · ' + team.length + '</h2><div class="list">' + team.map(function (t) { return '<div class="li">' + dot('run') + '<span class="lt"><b dir="auto">' + esc(t.title || t.id) + '</b><small>' + esc(t.owner || 'team') + '</small></span></div>'; }).join('') + '</div></section>';
    h += '<section class="grp"><h2 class="hd">Proof</h2>' + proofList(proofItems(p.id), 20) + '</section>';
    return h;
  }

  function vDecisions() {
    rankPull(); lintPull();
    var G = gateGroups(), n = gateCount(), RD = readyList(null);
    var h = '<h1 class="lt1">Needs you</h1><p class="sub">' + (n + RD.length ? (n + RD.length) + ' things wait for your OK. Most valuable first. Tap "Read it" for the full text.' : failed() ? 'Couldn\'t load — tap Retry above.' : on() ? 'Nothing waits for you.' : 'Connecting…') + '</p>';
    h += batchBox();
    if (RD.length) h += '<section class="grp"><h2 class="hd">Ready for you to send · ' + RD.length + '</h2><div class="rows">' + RD.map(readyRow).join('') + '</div></section>';
    G.forEach(function (g) {
      h += '<section class="grp"><h2 class="hd" dir="auto">' + esc(pname(g.p)) + ' · ' + g.L.length + '</h2><div class="rows">'
        + g.L.map(function (x) { var id = x.k === 'ap' ? x.a.id : x.t.id; if (S.dec && S.dec.id === id) return decidedRow(id, S.dec.how); return x.k === 'ap' ? draftRow(x.a, false) : taskRow(x.t, false); }).join('') + '</div></section>';
    });
    return h;
  }

  function proofList(L, n) {
    if (!L.length) return '<p class="empty">No proof yet: no finished runs, sent items or payments recorded' + (S.v === 'mission' ? ' for this mission' : '') + '.</p>';
    var out = '<ol class="tl">', lastDay = '';
    L.slice(0, n).forEach(function (e) {
      var d = whenDay(e.t); if (d !== lastDay) { out += '<li class="day"><span>' + esc(ymdIL(e.t) === ymdIL(Date.now()) ? 'Today' : d) + '</span></li>'; lastDay = d; }
      out += '<li class="ev k-' + esc(e.k) + '"><i aria-hidden="true"></i><div><b dir="auto">' + esc(cut(e.x, 220)) + '</b><small dir="auto">' + esc(e.m)
        + (S.v === 'proof' && e.p && e.p.length ? ' · ' + esc(e.p.map(pname).join(', ')) : '')
        + (e.lk ? ' · <a href="' + esc(e.lk) + '" target="_blank" rel="noopener noreferrer">Evidence</a>' : '') + (e.day ? '' : ' · ' + esc(when(e.t).replace(/^.* (\d\d:\d\d)$/, '$1'))) + '</small></div></li>';
    });
    return out + '</ol>';
  }
  function routinesBox() {
    var jj = J(), L = safe(function () { return jj.routines.list(); }, []); if (!L || !L.length) return '';
    var R = runs(), last = {};
    R.forEach(function (r) { var a = String(r.arm || '').toLowerCase(); if (!last[a]) last[a] = r; });
    return '<section class="grp rtn" aria-labelledby="jx-rt"><div class="gh"><h2 class="hd" id="jx-rt">Routines · ' + L.filter(function (r) { return r.enabled; }).length + ' on</h2></div><p class="fn tight">What J8 does for you every day, by itself. The pause button at the top stops all of them.</p><div class="list">'
      + L.map(function (r) {
        var lr = last[String(r.arm || '').toLowerCase()], k = 'rt-' + r.id, ar = armed(k);
        var st = lr ? when(lr.ended || lr.started) + ' · ' + cut(String(lr.summary || lr.status || '').replace(/^[🔴🟠🟢]\s*/u, ''), 90) : 'No run yet';
        return '<div class="li rt"><span class="lt"><b dir="auto">' + esc(r.name) + '</b><small dir="auto">' + esc(r.schedule) + '</small>'
          + '<details class="more-info"><summary>What it does · last run</summary><p dir="auto">' + esc(r.what) + '</p><p dir="auto">Last: ' + esc(st) + '</p></details></span>'
          + (r.switchable ? '<button type="button" class="sw' + (r.enabled ? ' on' : '') + (ar ? ' arm' : '') + '" role="switch" aria-checked="' + (!!r.enabled) + '" data-x="rtn" data-id="' + esc(r.id) + '" aria-label="' + esc(r.name) + '">' + (ar ? (r.enabled ? 'Tap: off' : 'Tap: on') : '<i></i>') + '</button>' : '<span class="st">' + (paused() ? 'paused' : 'always on') + '</span>')
          + '</div>';
      }).join('') + '</div></section>';
  }
  function vProof() {
    var all = proofItems(null), seen = {}, wk = Date.now() - 7 * 864e5;
    var W = all.filter(function (e) { return e.t >= wk; }), wf = W.filter(function (e) { return e.k === 'miss'; }).length, ws = W.filter(function (e) { return e.k === 'sent'; }).length, wl = W.filter(function (e) { return e.lk; }).length;
    all.forEach(function (e) { (e.p || []).forEach(function (p) { if (p && p !== 'p-general') seen[p] = (seen[p] || 0) + 1; }); });
    var chips = [['all', 'All']].concat(Object.keys(seen).sort(function (a, b) { return seen[b] - seen[a]; }).map(function (p) { return [p, pname(p)]; }));
    if (S.filter !== 'all' && !seen[S.filter]) S.filter = 'all';
    var L = S.filter === 'all' ? all : all.filter(function (e) { return (e.p || []).indexOf(S.filter) > -1; });
    return '<h1 class="lt1">What happened</h1><p class="sub">Everything J8 did, sent and got, with evidence. Last 7 days: ' + W.length + ' steps · ' + ws + ' sent · ' + wl + ' with a link · ' + wf + ' failed, shown.</p>'
      + routinesBox() + '<h2 class="hd tl-h">Everything, newest first</h2>' + '<div class="chips" role="group" aria-label="Filter by mission">' + chips.map(function (c) { return '<button type="button" class="chipb" data-x="filter" data-id="' + esc(c[0]) + '" aria-pressed="' + (S.filter === c[0]) + '">' + esc(cut(c[1], 28)) + '</button>'; }).join('') + '</div>'
      + proofList(L, S.proofN) + (L.length > S.proofN ? '<div class="more"><button type="button" class="cap-b" data-x="more">Show more (' + (L.length - S.proofN) + ')</button></div>' : '');
  }

  function vTalk() {
    var L = msgs(40).slice(0, 30).reverse();
    var h = '<h1 class="lt1">Talk</h1><p class="sub">Tell J8 a goal ("₪X by date"), a change or a question. It answers here and updates your plan.</p><ol class="thread">';
    h += L.length ? L.map(function (m) {
      var lines = String(m.reply || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      return '<li><div class="me"><p dir="auto">' + esc(cut(m.text, 400)) + '</p><small>' + esc(when(m.at)) + '</small></div>'
        + (lines.length ? '<div class="j8"><img src="brand/j8nix-mark-8-2026-11-17.svg" alt="J8" width="9" height="20">' + lines.slice(-4).map(function (l) { return '<p dir="auto">' + esc(l) + '</p>'; }).join('') + '</div>'
          : '<p class="wait">' + dot('run') + 'J8 will answer at the next inbox run</p>') + '</li>';
    }).join('') : '<li><p class="wait">' + (on() ? 'No messages yet.' : 'Connecting…') + '</p></li>';
    h += '</ol><div class="composer"><label class="sr" for="jx-say">Message to J8</label><textarea id="jx-say" data-say="1" dir="auto" rows="1" placeholder="Message J8">' + esc(S.talk) + '</textarea>'
      + '<button type="button" class="cap-b main" data-x="say">Send</button></div>';
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
  function gateGroups() {
    var R = rankPos(), G = {};
    function score(id, fallback) { return R[id] != null ? R[id] : 1e6 + (Number(fallback) || 999); }
    drafts().forEach(function (a) { var p = pidOf(a.product) || 'p-general'; (G[p] = G[p] || []).push({ k: 'ap', a: a, s: score(a.id, a.rank) }); });
    daveTasks().forEach(function (t) { var p = t.project_id && (proj(t.project_id) || t.project_id === 'p-general') ? t.project_id : 'p-general'; (G[p] = G[p] || []).push({ k: 'tk', t: t, s: score(t.id, t.sev === 'r' ? 1 : t.sev === 'o' ? 2 : 3) }); });
    return Object.keys(G).map(function (p) { var L = G[p].sort(function (a, b) { return a.s - b.s; }); return { p: p, L: L, s: L[0].s }; }).sort(function (a, b) { return a.s - b.s || b.L.length - a.L.length; });
  }
  function gateCount() { return drafts().length + daveTasks().length; }

  /* ---------- 14.0 "Results": scoreboard, sender line, batches, going out, outcomes, load failure ---------- */
  var SENDER_ARMS = ['mac sender', 'main chat send', 'sender (mac)']; /* 'Sender (Mac)' is the same arm under its older name */
  var REPLY_O = { replied: 1, interview: 1, question: 1, call: 1, won: 1 };
  var OUTW = { replied: 'Replied', call: 'Call', proposal: 'Proposal', won: 'Won', lost: 'Lost' };
  function failed() {
    var j = J(); if (!j) return Date.now() - BOOT > 8000;
    var st = safe(function () { return j.status(); }, {}) || {};
    return !st.connected && st.error === 'offline';
  }
  function failBtn() { return '<button type="button" class="fail" data-x="retry">Couldn\'t load — tap to retry</button>'; }
  function tOf(r) { var a = pd(r.ended), b = pd(r.started); return isNaN(a) ? b : isNaN(b) ? a : Math.max(a, b); }
  function stopWhy(sm) {
    var x = String(sm || '').replace(/^[\s\u{1F534}\u{1F7E0}\u{1F7E2}⚪]+/u, '').trim();
    if (/two chrome|none is (chosen|picked)|pick (this|the) mac'?s chrome/i.test(x)) return { reason: 'Chrome is not picked for Claude', fix: 'pick this Mac\'s Chrome in the Claude extension (1 min)' };
    if (/without (your|the) mac|in the cloud/i.test(x)) return { reason: 'the run started without your Mac', fix: 'keep the Mac on and awake at send time' };
    var m = /\bDo:\s*(.+)$/i.exec(x), fix = m ? m[1] : '';
    var rs = (m ? x.slice(0, m.index) : x).split(/\s·\s/).filter(function (seg) { return !/^(sendable|sent|posts|chrome tasks|failed)\b/i.test(seg.trim()); }).join(' · ');
    rs = rs.split(/\.\s/)[0];
    return { reason: cut(rs || 'the last run failed', 70), fix: cut(fix || 'J8 retries at the next run', 70) };
  }
  function senderInfo() {
    var R = runs().filter(function (r) { return SENDER_ARMS.indexOf(String(r.arm || '').trim().toLowerCase()) > -1; }).map(function (r) { return { r: r, t: tOf(r) }; })
      .filter(function (x) { return !isNaN(x.t); }).sort(function (a, b) { return b.t - a.t; });
    if (!R.length) return null;
    if (R[0].r.status === 'failed') { var w = stopWhy(R[0].r.summary); return { ok: false, t: R[0].t, reason: w.reason, fix: w.fix }; }
    var ok = R.filter(function (x) { return x.r.status === 'ok'; })[0];
    return { ok: true, t: (ok || R[0]).t, sent: !!ok };
  }
  function senderText() {
    if (paused()) return 'Sending is paused';
    var s = senderInfo(); if (!s) return failed() ? 'Sending: not loaded' : 'Sending: no sender run recorded yet';
    return s.ok ? 'Sending works · last ' + (s.sent ? 'send ' : 'check ') + when(s.t) : 'Sending stopped: ' + s.reason + ' · ' + s.fix;
  }
  function senderLine() { var s = senderInfo(), bad = paused() || (s && !s.ok); return '<p class="sline' + (bad ? ' bad' : s ? ' ok' : '') + '" dir="auto">' + dot(bad ? 'block' : s ? 'done' : 'quiet') + '<span>' + esc(senderText()) + '</span></p>'; }
  function outcomeOf(a) { return a.outcome || (a.replied_at ? 'replied' : ''); }
  function inWin(t, from) { return !isNaN(t) && t >= from && t <= Date.now() + 6e4; }
  function score() {
    var from = Date.now() - 7 * 864e5, o = { sent: 0, rep: 0, call: 0, prop: 0 };
    allAps().forEach(function (a) {
      if (a.status !== 'sent' || a.kind === 'template' || a.label === 'Template') return;
      var ts = pd(a.sent_at), tr = pd(a.replied_at), to = pd(a.outcome_at), te = !isNaN(to) ? to : !isNaN(tr) ? tr : ts;
      if (inWin(ts, from)) o.sent++;
      if ((a.replied_at || REPLY_O[a.outcome]) && inWin(!isNaN(tr) ? tr : te, from)) o.rep++;
      if ((a.outcome === 'call' || a.outcome === 'interview') && inWin(te, from)) o.call++;
      if ((a.outcome === 'proposal' && inWin(te, from)) || (a.outcome !== 'proposal' && a.kind === 'proposal' && inWin(ts, from))) o.prop++;
    });
    var m = money(); o.ils = m && isFinite(Number(m.booked_ils)) ? Number(m.booked_ils) : 0;
    return o;
  }
  function scoreboard() {
    var o = score(), none = failed() && !allAps().length, c = function (n, l) { return '<li><b class="num">' + esc(none ? '—' : n) + '</b><small>' + esc(l) + '</small></li>'; };
    return '<section class="score" aria-labelledby="jx-sc"><p class="lbl" id="jx-sc">Last 7 days</p><ol class="sc">'
      + c(o.sent, 'Sent') + c(o.rep, 'Replies') + c(o.call, 'Calls') + c(o.prop, 'Proposals')
      + '<li class="cash"><b class="num">' + esc(none ? '—' : ils(o.ils)) + '</b><small>to date · of ' + esc(ils(GOAL)) + '</small></li></ol>' + senderLine() + '</section>';
  }
  /* batch approve: drafts that share a batch value (not templates, not plan-only, hard-blocked ones left out) */
  function batches() {
    var B = {};
    drafts().forEach(function (a) {
      if (!a.batch || a.kind === 'template' || a.label === 'Template' || a.no_send || (a.extra && a.extra.no_send)) return;
      var b = B[a.batch] = B[a.batch] || { k: a.batch, label: a.batch_label || a.batch, L: [], hard: 0 };
      if (lintOf(a).hard) b.hard++; else b.L.push(a);
    });
    return Object.keys(B).map(function (k) { return B[k]; }).filter(function (b) { return b.L.length >= 2; }).sort(function (a, b) { return b.L.length - a.L.length; });
  }
  function batchBox() {
    var B = batches(); if (!B.length) return '';
    return '<section class="grp" aria-labelledby="jx-bt"><h2 class="hd" id="jx-bt">Approve in one go · ' + B.length + '</h2><p class="fn tight">Same batch, same kind of message. You see 3 first.</p><div class="rows">' + B.map(function (b) {
      var n = b.L.length, open = S.bprev === b.k, j = J();
      var h = '<article class="row one"><p class="yt" dir="auto">' + esc(cut(b.label, 70)) + ' · ' + n + '</p><p class="yp">' + n + ' drafts' + (b.hard ? ' · ' + b.hard + ' blocked, left out' : '') + '</p>';
      if (open) h += b.L.slice(0, 3).map(function (a) { var tx = String(safe(function () { return j.approvals.textOf(a); }, '') || ''); return '<div class="smp"><b dir="auto">' + esc(whoOf(a)) + ' · ' + esc(whyNow(a)) + '</b>' + (tx ? '<p dir="auto">' + esc(cut(tx, 160)) + '</p>' : '') + '</div>'; }).join('')
        + (n > 3 ? '<p class="yp">+ ' + (n - 3) + ' more like these</p>' : '')
        + '<div class="bts"><button type="button" class="cap-b main" data-x="batch-go" data-id="' + esc(b.k) + '"' + (S.busyB ? ' disabled' : '') + '>Yes, approve all ' + n + '</button><button type="button" class="ql" data-x="batch-x">Cancel</button></div>';
      else h += '<div class="bts"><button type="button" class="cap-b main" data-x="batch" data-id="' + esc(b.k) + '">Approve all ' + n + '</button></div>';
      return h + '</article>';
    }).join('') + '</div></section>';
  }
  /* going out: approved / edited / queued, not sent yet (by-hand items already due are in "Ready for you to send") */
  function goingOut() {
    var R = {}; readyList(null).forEach(function (a) { R[a.id] = 1; });
    return allAps().filter(function (a) { return /^(approved|edited|queued)$/.test(a.status || '') && a.kind !== 'template' && a.label !== 'Template' && a.source !== 'j8nix-app' && !R[a.id]; })
      .sort(function (a, b) { /* still in the hold (the undo window) first, soonest end first; then the ones waiting for the sender */
        var n = Date.now(), x = pd(a.hold_until), y = pd(b.hold_until), hx = !isNaN(x) && x > n, hy = !isNaN(y) && y > n;
        return (hy - hx) || (hx && hy ? x - y : 0) || atOr(a, 'decided_at') - atOr(b, 'decided_at'); });
  }
  function left(ms) { var m = Math.max(1, Math.round(ms / 6e4)), h = Math.floor(m / 60); return h ? h + 'h ' + pad(m % 60) + 'm' : m + 'm'; }
  function holdText(a) {
    var h = pd(a.hold_until), now = Date.now();
    if (!isNaN(h) && h > now) return 'Hold: ' + left(h - now) + ' left · then ' + (isHand(a) ? 'you send it' : 'it can go') + ' (' + when(h) + ')';
    return isHand(a) ? 'You send it by hand' : 'Hold over · waits for the sender';
  }
  function goingOutBox() {
    var L = goingOut(); if (!L.length) return '';
    var show = S.goAll ? L : L.slice(0, 3);
    return '<section class="grp" aria-labelledby="jx-go"><div class="gh"><h2 class="hd" id="jx-go">Going out · ' + L.length + '</h2>' + (L.length > 3 ? '<button type="button" class="ql" data-x="go-all">' + (S.goAll ? 'Show less' : 'Show all ' + L.length) + '</button>' : '') + '</div>'
      + '<div class="list">' + show.map(function (a) {
        var k = 'kl-' + a.id, ar = armed(k);
        return '<div class="li oc"><span class="lt"><b dir="auto">' + esc(whoOf(a)) + '</b><small dir="auto">' + esc(holdText(a)) + '</small></span>'
          + '<button type="button" class="ob kill' + (ar ? ' arm' : '') + '" data-x="kill" data-id="' + esc(a.id) + '">' + (ar ? 'Tap again: kill' : 'Kill') + '</button></div>';
      }).join('') + '</div></section>';
  }
  /* outcomes on sent items of the last 30 days (not posts, not templates) */
  function sent30() {
    var from = Date.now() - 30 * 864e5;
    return allAps().filter(function (a) { var t = pd(a.sent_at); return a.status === 'sent' && a.kind !== 'template' && a.kind !== 'post' && a.label !== 'Template' && !isNaN(t) && t >= from; })
      .sort(function (a, b) { return pd(b.sent_at) - pd(a.sent_at); });
  }
  function outcomesBox() {
    var L = sent30(); if (!L.length) return '';
    var show = S.ocAll ? L : L.slice(0, 3);
    return '<section class="grp" aria-labelledby="jx-oc"><div class="gh"><h2 class="hd" id="jx-oc">Did they answer? · ' + L.length + '</h2>' + (L.length > 3 ? '<button type="button" class="ql" data-x="oc-all">' + (S.ocAll ? 'Show less' : 'Show all ' + L.length) + '</button>' : '') + '</div>'
      + '<p class="fn tight">Sent in the last 30 days. Tap what happened: it counts on the scoreboard.</p><div class="list">' + show.map(function (a) {
        var cur = outcomeOf(a);
        return '<div class="li oc"><span class="lt"><b dir="auto">' + esc(whoOf(a)) + '</b><small>Sent ' + esc(whenDay(a.sent_at)) + (cur ? ' · ' + esc(OUTW[cur] || cur) : '') + '</small></span>'
          + '<span class="obs">' + ['replied', 'call', 'proposal', 'won', 'lost'].map(function (w) { return '<button type="button" class="ob" data-x="oc" data-w="' + w + '" data-id="' + esc(a.id) + '" aria-pressed="' + (cur === w) + '">' + OUTW[w] + '</button>'; }).join('') + '</span></div>';
      }).join('') + '</div></section>';
  }

  /* ---------- shell ---------- */
  var NAV = [['now', 'Today'], ['plan', 'Plan'], ['decisions', 'Needs you'], ['proof', 'What happened'], ['talk', 'Talk']];
  function renderNav() {
    var n = gateCount() + readyList(null).length, cur = S.v === 'mission' || S.v === 'missions' ? 'plan' : S.v;
    nav.innerHTML = '<div class="tabs">' + NAV.map(function (x) {
      return '<button type="button" data-x="nav" data-id="' + x[0] + '"' + (cur === x[0] ? ' aria-current="page"' : '') + '>' + ico(x[0]) + '<span>' + x[1] + '</span>'
        + (x[0] === 'decisions' && n ? '<em class="badge">' + n + '</em><span class="sr"> (' + n + ' waiting)</span>' : '') + '</button>';
    }).join('') + '</div>';
  }
  function renderTop() {
    var el = sr.getElementById('jxlive'), pb = sr.getElementById('jxpause'); if (!el) return;
    var st = safe(function () { return J().status(); }, {}), last = runs()[0];
    el.className = 'live' + (st.connected ? '' : ' off');
    el.innerHTML = '<i aria-hidden="true"></i>' + esc(st.connected ? (last ? 'Last run ' + when(last.ended || last.started) : 'Live') : st.cached ? 'Saved copy' : 'Offline');
    if (pb) pb.innerHTML = pauseBtn();
  }
  function busy() { var a = sr && sr.activeElement; return !!(a && /^(TEXTAREA|INPUT)$/.test(a.tagName)); }
  function render(force) {
    if (!root) return;
    if (!force && busy()) { pending = true; return; }
    pending = false;
    var y = window.scrollY, changed = S.prevV !== S.v + '|' + S.mid;
    view.innerHTML = (failed() ? failBtn() : '') + (S.v === 'mission' ? vMission() : S.v === 'missions' || S.v === 'plan' ? vPlan() : S.v === 'decisions' ? vDecisions() : S.v === 'proof' ? vProof() : S.v === 'talk' ? vTalk() : vNow());
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
    var sc = sr.getElementById('jxscrim'), sh = sr.getElementById('jxsheet');
    if (!open) { sc.hidden = true; sh.hidden = true; var g = sr.querySelector('.gear'); if (g) g.focus(); return; }
    var u = safe(function () { return J().auth.user(); }, null), o = safe(function () { return J().orgs.current(); }, null);
    sh.innerHTML = '<div class="grab" aria-hidden="true"></div><h2 id="jxsh" class="t3">Settings</h2><button type="button" class="glyph x" data-x="sheet-x" aria-label="Close settings">✕</button><div class="list">'
      + '<div class="li"><span class="lt"><b>Classic screens</b><small>Lists, flow, control, voice, processes.</small></span><button type="button" class="cap-b" data-x="classic">Open</button></div>'
      + '<div class="li"><span class="lt"><b>Refresh</b><small>Load the latest data now.</small></span><button type="button" class="cap-b" data-x="refresh">Refresh</button></div>'
      + '<div class="li"><span class="lt"><b>Signed in</b><small>' + esc(u ? u.email : 'Not signed in') + (o && o.name ? ' · ' + esc(o.name) : '') + '</small></span><button type="button" class="cap-b" data-x="signout">Sign out</button></div>'
      + '<div class="li"><span class="lt"><b>Version</b><small>J8NIX ' + VER + ' · Results</small></span></div></div>';
    sc.hidden = false; sh.hidden = false; var b = sh.querySelector('[data-x="classic"]'); if (b) b.focus();
  }
  function classic(onC) {
    try { if (onC) sessionStorage.setItem('j8x:classic', '1'); else sessionStorage.removeItem('j8x:classic'); } catch (e) {}
    document.body.classList.toggle('jx-classic', !!onC); sync();
    if (!onC) render(true);
  }
  function isClassic() { try { return sessionStorage.getItem('j8x:classic') === '1'; } catch (e) { return false; } }
  function appShown() { var a = document.getElementById('app'); return !!(a && !a.hidden); }
  function sync() { var want = appShown() && !isClassic(); var was = document.body.classList.contains('jx'); document.body.classList.toggle('jx', want); document.documentElement.classList.toggle('jx', want); document.body.classList.toggle('jx-classic', appShown() && isClassic()); if (want && !was) render(true); }


  /* ---------- actions ---------- */
  function act(x, el) {
    var id = el.getAttribute('data-id') || '', j = J();
    if (x === 'nav') { go(id === 'mission' || id === 'missions' ? 'plan' : id || 'now'); return; }
    if (x === 'mission') { if (id && proj(id)) go('mission', id); else go('decisions'); return; }
    if (x === 'rtn') {
      var rk = 'rt-' + id; if (!armed(rk)) { arm(rk); return; } delete S.arm[rk];
      if (!j || !on() || !j.routines) { say('Not connected. Try again in a moment.'); return; }
      var cur = safe(function () { return j.routines.list().filter(function (r) { return r.id === id; })[0]; }, null); if (!cur) return;
      buzz(); j.routines.set(id, !cur.enabled).then(function () { say(cur.name + (cur.enabled ? ' is off. It stops at its next run.' : ' is on.')); render(true); }, fail);
      return;
    }
    if (x === 'peek') { S.peek = S.peek === id ? null : id; render(true); return; }
    if (x === 'pick') {
      var pk = 'pick-' + el.getAttribute('data-k'); if (!armed(pk)) { arm(pk); return; } delete S.arm[pk];
      if (!j || !on() || !j.plans) { say('Not connected. Try again in a moment.'); return; }
      buzz(); el.disabled = true;
      j.plans.choose(id, el.getAttribute('data-k')).then(function () { say('Plan ' + el.getAttribute('data-k') + ' chosen. J8 now works to it and updates the steps.'); render(true); }, function (e) { el.disabled = false; fail(e); });
      return;
    }
    if (x === 'filter') { S.filter = id; S.proofN = 60; render(true); return; }
    if (x === 'go-all') { S.goAll = !S.goAll; render(true); return; }
    if (x === 'oc-all') { S.ocAll = !S.ocAll; render(true); return; }
    if (x === 'batch') { S.bprev = id; render(true); return; }
    if (x === 'batch-x') { S.bprev = null; render(true); return; }
    if (x === 'retry') {
      if (!j) { location.reload(); return; }
      el.disabled = true; var st0 = safe(function () { return j.status(); }, {}) || {};
      (st0.org ? j.reload() : j.connect()).then(function () { S.rankAt = 0; S.lintAt = 0; say(failed() ? 'Still couldn\'t load. Tap to retry.' : 'Up to date.'); render(true); }, function () { say('Still couldn\'t load. Tap to retry.'); render(true); });
      return;
    }
    if (x === 'more') { S.proofN += 60; render(true); return; }
    if (x === 'note') { var k = el.getAttribute('data-k'); S.noteOpen[k] = !S.noteOpen[k]; render(true); if (S.noteOpen[k]) { var ta = sr.getElementById('jxn-' + k); if (ta) ta.focus(); } return; }
    if (x === 'undo') { if (hudUndo) { var f = hudUndo; hudUndo = null; hud.classList.remove('on'); f(); } return; }
    if (x === 'gear') { sheet(true); return; }
    if (x === 'sheet-x') { sheet(false); return; }
    if (x === 'classic') { sheet(false); classic(true); return; }
    if (x === 'jxback') { classic(false); return; }
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
    if (x === 'batch-go') {
      if (S.busyB) return;
      var bb = batches().filter(function (b) { return b.k === id; })[0]; if (!bb) { S.bprev = null; render(true); return; }
      var ids = bb.L.map(function (a) { return a.id; }), okIds = [], bad = 0; S.busyB = true; buzz(); el.disabled = true; say('Approving ' + ids.length + '…');
      ids.reduce(function (p, aid) { return p.then(function () { return j.approvals.approve(aid).then(function () { okIds.push(aid); }, function () { bad++; }); }); }, Promise.resolve()).then(function () {
        S.busyB = false; S.bprev = null; render(true);
        say('Approved ' + okIds.length + (bad ? ' · ' + bad + ' failed' : '') + '. ' + senderText() + '.', okIds.length ? function () {
          okIds.reduce(function (p, aid) { return p.then(function () { return j.approvals.undo(aid).catch(function () {}); }); }, Promise.resolve()).then(function () { say('Back to waiting.'); render(true); });
        } : null);
      });
      return;
    }
    if (x === 'kill') {
      var kk = 'kl-' + id; if (!armed(kk)) { arm(kk); return; } delete S.arm[kk]; buzz(); el.disabled = true;
      j.approvals.kill(id).then(function () {
        render(true); say('Killed. It will not be sent.', function () { j.approvals.undo(id).then(function () { say('Back to waiting for your OK.'); render(true); }, fail); });
      }, function (e) { el.disabled = false; fail(e); });
      return;
    }
    if (x === 'oc') {
      var ow = el.getAttribute('data-w'), oa = safe(function () { return allAps().filter(function (q) { return String(q.id) === id; })[0]; }, null); if (!oa || !OUTW[ow]) return;
      var oc = outcomeOf(oa); buzz(); el.disabled = true;
      var half = false;
      var op = oc === ow ? j.approvals.reply(id, 'clear') : ow === 'replied' && oa.outcome ? j.approvals.reply(id, 'clear').then(function () { half = true; return j.approvals.reply(id, 'replied'); }) : j.approvals.reply(id, ow);
      op.then(function () { say(oc === ow ? 'Cleared.' : 'Saved: ' + OUTW[ow] + '. It counts on the scoreboard.'); render(true); }, function (e) {
        el.disabled = false; if (half) { say('Old answer cleared, but Replied did not save. Tap Replied again.'); render(true); } else fail(e); });
      return;
    }
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
      if (x === 'go' && lintOf({ id: id }).hard) { var hk2 = 'hb-' + id; if (!armed(hk2)) { arm(hk2); return; } delete S.arm[hk2]; } /* hard-blocked: a second tap confirms */
      buzz(); el.disabled = true;
      (x === 'go' ? j.approvals.approve(id) : j.approvals.kill(id)).then(function () {
        S.dec = { id: id, how: x }; render(true);
        say(x === 'go' ? 'Approved. ' + senderText() + '.' : 'Not now. It will not be sent.', function () { j.approvals.undo(id).then(function () { S.dec = null; say('Back to waiting.'); render(true); }, fail); });
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
      j.control.setPaused(x === 'stop').then(function () { say(x === 'stop' ? 'Sending paused. Nothing goes out.' : 'Sending resumed. ' + senderText() + '.'); render(true); }, function (e) { el.disabled = false; fail(e); });
      return;
    }
    if (x === 'say') {
      var v = String(S.talk || '').trim(); if (!v) { say('Write a message first.'); return; }
      el.disabled = true;
      j.inbox.send('p-general', v).then(function () { S.talk = ''; var a = sr.activeElement; if (a && a.blur) a.blur(); say('Sent. The team answers here.'); render(true); }, function (e) { el.disabled = false; fail(e); });
    }
  }


  /* ---------- splash: the 8 draws itself as one line, light passes through its waist, NIX fades in ---------- */
  function splash() {
    var skip = /[?&]nosplash/.test(location.search), last = 0;
    try { last = Number(localStorage.getItem('j8x:splash')) || 0; } catch (e) {}
    if (!/[?&]splash/.test(location.search) && (skip || isClassic() || Date.now() - last < 12 * 36e5)) return;
    try { localStorage.setItem('j8x:splash', String(Date.now())); } catch (e) {}
    var sp = document.createElement('div'); sp.id = 'jxsplash'; sp.setAttribute('aria-hidden', 'true');
    sp.innerHTML = '<div class="jxs-in"><div class="jxs-mk"></div><img class="jxs-wm" src="brand/j8nix-wordmark-2026-11-17.svg" alt="" width="134" height="47"><p>Goals in. Proof out.</p></div>';
    document.body.appendChild(sp);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, box = sp.querySelector('.jxs-mk');
    function play() { requestAnimationFrame(function () { requestAnimationFrame(function () { sp.classList.add('play'); }); }); setTimeout(function () { sp.classList.add('out'); setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 320); }, reduce ? 500 : 1500); }
    fetch('brand/j8nix-mark-8-2026-11-17.svg').then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (t) {
      if (!/^\s*<svg[\s>]/.test(t) || /<script|on\w+=/i.test(t)) throw new Error('bad svg');
      box.innerHTML = t; var pth = box.querySelector('path'); if (pth) { var L = 0; try { L = pth.getTotalLength(); } catch (e) {} if (L) { pth.style.setProperty('--len', L.toFixed(1)); pth.classList.add('draw'); } }
      play();
    }).catch(function () { box.innerHTML = '<img src="brand/j8nix-mark-8-2026-11-17.svg" alt="" width="32" height="70">'; play(); });
  }

  /* ---------- boot ---------- */
  function boot() {
    root = document.createElement('div'); root.id = 'jx';
    /* a shadow root keeps the classic styles out of 13.0 and 13.0's styles out of the classic app */
    sr = root.attachShadow ? root.attachShadow({ mode: 'open' }) : root;
    sr.innerHTML = '<link rel="stylesheet" href="j13w.css?v=' + VER + '"><div class="jx-in"><header class="top"><img class="wm" src="brand/j8nix-wordmark-2026-11-17.svg" alt="J8NIX" width="64" height="22"><div class="tr"><p class="live" id="jxlive" role="status"></p><span id="jxpause"></span>'
      + '<button type="button" class="glyph gear" data-x="gear" aria-label="Settings" aria-haspopup="dialog">' + ico('gear') + '</button></div></header>'
      + '<main id="jxv" tabindex="-1"></main></div><nav id="jxnav" aria-label="Main"></nav><div id="jxhud" role="status" aria-live="polite"></div>'
      + '<div id="jxscrim" data-x="sheet-x" hidden></div><div id="jxsheet" role="dialog" aria-modal="true" aria-labelledby="jxsh" hidden></div>';
    document.body.appendChild(root);
    var back = document.createElement('button'); back.type = 'button'; back.id = 'jxback'; back.textContent = 'Back to J8NIX'; back.setAttribute('data-x', 'jxback');
    document.body.appendChild(back);
    view = sr.querySelector('#jxv'); nav = sr.querySelector('#jxnav'); hud = sr.querySelector('#jxhud');
    function click(e) { var el = e.target.closest && e.target.closest('[data-x]'); if (!el || !(sr.contains(el) || el === back)) return; e.preventDefault(); e.stopPropagation(); act(el.getAttribute('data-x'), el); }
    sr.addEventListener('click', click); back.addEventListener('click', click);
    sr.addEventListener('input', function (e) { var t = e.target; if (t.dataset.note) S.note[t.dataset.note] = t.value; else if (t.dataset.say) { S.talk = t.value; t.style.height = 'auto'; t.style.height = Math.min(160, t.scrollHeight) + 'px'; } });
    sr.addEventListener('focusout', function () { setTimeout(function () { if (pending && !busy()) render(false); }, 0); });
    window.addEventListener('keydown', function (e) {
      if (!document.body.classList.contains('jx')) return;
      e.stopImmediatePropagation();
      if (e.key === 'Escape') { var sh = sr.getElementById('jxsheet'); if (sh && !sh.hidden) sheet(false); return; }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { var t = e.composedPath ? e.composedPath()[0] : e.target, b = t && t.dataset && t.dataset.say ? sr.querySelector('[data-x="say"]') : t && t.dataset && t.dataset.note ? sr.querySelector('[data-x="note-send"][data-k="' + t.dataset.note + '"]') : null; if (b) b.click(); }
    }, true);
    window.addEventListener('scroll', function () { root.classList.toggle('scrolled', window.scrollY > 8); sr.querySelector('.top').classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });
    var j = J();
    if (j && j.on) ['projects', 'tasks', 'approvals', 'runs', 'money', 'control', 'comments', 'plans', 'routines'].forEach(function (c) { try { j.on(c, soon); } catch (e) {} });
    if (j && j.on) try { j.on('status', function () { S.rankAt = 0; soon(); }); } catch (e) {}
    var a = document.getElementById('app');
    if (a && window.MutationObserver) new MutationObserver(sync).observe(a, { attributes: true, attributeFilter: ['hidden'] });
    sync(); render(true); splash();
    setInterval(function () { if (!document.hidden && document.body.classList.contains('jx')) { renderTop(); rankPull(); if (S.v === 'now' && view && !view.querySelector('details[open]') && goingOut().some(function (a) { return pd(a.hold_until) > Date.now(); })) soon(); } }, 30000);
  }
  window.j8x = { version: VER, render: function () { render(true); }, go: go, state: S, pace: pace, flag: flag, radio: radio, tower: tower, gates: gateGroups, proof: proofItems, decisions: flatDecisions, score: score, sender: senderInfo, senderText: senderText, whyNow: whyNow, batches: batches, goingOut: goingOut, sent30: sent30, people: people, failed: failed, classic: classic, esc: esc, link: link, pd: pd };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
