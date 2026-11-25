/* =====================================================================
   J8NIX 2.0 · 15.0.0 (25 Nov 2026) · "Card file" — slice 1 of backlog d-1125-02.
   A new app layer over the same data engine: window.J8 (j8-data.js) for every read and write, and the 14.1 helpers that
   j13.js exposes on window.j8x (desk, batches, goingOut, sent30, people, score, senderText, whyNow, templates, tplStats).
   Spaces (each with its own colour): Today (glance + one decision at a time), Queue (everything waiting, going out,
   did they answer), Talk (messages with the team), Settings (pause, autopilot per template, language, sound, classic,
   sign out). Decisions: Go (approve) · Hold (later this session) · Stop (not now = kill) · Change (edit, then it goes) ·
   Go all (batch, 3 previews first) · outcomes (Replied / Call / Proposal / Won / Lost) · Done (your step) · Copy & open /
   Mark sent (by hand). Every Go / Stop / Done shows Undo for 6 s. Keys: G = Go · H = Hold · X = Stop · E = Change ·
   1–4 = spaces. Sound: short soft tones on decisions only (Settings → Sound). Hebrew: Settings → עברית (RTL).
   Old app: /j8/classic/ (14.1 as it was). Research + sources: j8/design/V20-NOTES.md. Revert: git revert of the 15.0 commit.
   ===================================================================== */
(function () {
  'use strict';
  var VER = '15.0.0';
  try { localStorage.setItem('j8x:splash', String(Date.now())); } catch (e) {} /* the 14.x black splash stays off under 2.0 */
  var J = function () { return window.J8 || null; };
  var X = function () { return window.j8x || null; };
  var S = { sp: 'today', held: {}, gone: {}, arm: {}, open: {}, edit: null, editTx: '', talk: '', full: {}, bprev: null, busy: false, rankAt: 0, lintAt: 0 };
  var host, sr, W, C, undoFn = null, toastT = 0, raf = 0, pend = false;

  /* ---------- words (EN / HE) ---------- */
  var T = {
    en: { today: 'Today', queue: 'Queue', talk: 'Talk', set: 'Settings', waiting: 'Waiting for you', sent7: 'Sent · 7 days', rep7: 'Replies · 7 days',
      pulse: 'Agent runs · last 24 h', now: 'now', h24: '24 h ago', deck: 'One at a time', of: 'of', go: 'Go', hold: 'Hold', sentW: 'sent', repW: 'replies', repW1: 'reply', d7: 'last 7 days', leftOut: 'blocked, left out', resumed: 'Sending is on.', heldT2: 'Held for later.', tplLine: 'sent', tplRep: 'replies', sending: 'Sending', okW: 'ok', failedW: 'failed', stop: 'Stop', tapStop: 'Tap again', change: 'Change',
      save: 'Save and send', cancel: 'Cancel', readAll: 'Read all', goAll: 'Go all', seeAll: 'See 3 first', done: 'Done', copyOpen: 'Copy & open', copy: 'Copy', markSent: 'Mark sent',
      open: 'Open', kReply: 'Replied', kDraft: 'To approve', kBatch: 'Same message, many people', kStep: 'Your step', kHand: 'Send by hand', kTpl: 'Saved message', people: 'people', once: 'approve once, all go',
      clearT: 'Clear deck.', clearP: 'Nothing waits for you. J8 keeps working.', held: 'held for later', heldBack: 'Bring back held', loading: 'Loading…', fail: 'Couldn\'t load. Tap to retry',
      goneOut: 'Going out', answer: 'Did they answer?', waitingQ: 'Waiting for you', kill: 'Kill', tapKill: 'Tap again: kill', none: 'Nothing here.',
      talkSub: 'Ask J8 or the team. Answers land here.', talkPh: 'Message J8', send: 'Send', noMsg: 'No messages yet.', waitAns: 'J8 answers at the next inbox run',
      pause: 'Pause sending', resume: 'Resume sending', paused: 'Sending is paused. Nothing goes out.', autopilot: 'Autopilot per saved message', ask: 'Ask me', auto: 'Auto after 6 h', off: 'Off',
      lang: 'Language', sound: 'Sound', on: 'On', classic: 'Old J8NIX (14.1)', classicP: 'Plan, proof, missions and every older screen.', refresh: 'Refresh', signout: 'Sign out', version: 'Version',
      upNext: 'Up next', approved: 'Approved.', stopped: 'Stopped. It will not be sent.', undo: 'Undo', back: 'Back to waiting.',
      saved: 'Saved', doneT: 'Done. Nice.', notConn: 'Not connected. Try again in a moment.', couldnt: 'Could not save. Nothing changed.', copied: 'Copied. Paste and send.',
      sentBy: 'Marked sent.', approvedN: 'Approved', blocked: 'Blocked by the checker:', hardAgain: 'Tap again: send anyway', why: 'Why now', where: 'Where', sentOn: 'Sent',
      soonGo: 'Hold', tplOk: 'Approved', tplWait: 'Waits for your OK', moreN: 'more like these', live: 'Live', offline: 'Offline', saved2: 'Saved copy', newV: 'New: J8NIX 2.0' },
    he: { today: 'היום', queue: 'בתור', talk: 'שיחה', set: 'הגדרות', waiting: 'מחכים לך', sent7: 'נשלחו · 7 ימים', rep7: 'תשובות · 7 ימים',
      pulse: 'ריצות סוכנים · 24 שעות', now: 'עכשיו', h24: 'לפני 24 שעות', deck: 'אחד בכל פעם', of: 'מתוך', go: 'שלח', hold: 'דחה', sentW: 'נשלחו', repW: 'תשובות', repW1: 'תשובה', d7: '7 ימים אחרונים', leftOut: 'נחסמו ולא נכללו', resumed: 'השליחה פועלת.', heldT2: 'נדחה לאחר כך.', tplLine: 'נשלחו', tplRep: 'תשובות', sending: 'שליחה', okW: 'תקינות', failedW: 'נכשלו', stop: 'עצור', tapStop: 'הקש שוב', change: 'שנה',
      save: 'שמור ושלח', cancel: 'ביטול', readAll: 'קרא הכול', goAll: 'שלח הכול', seeAll: 'הצג 3 קודם', done: 'בוצע', copyOpen: 'העתק ופתח', copy: 'העתק', markSent: 'סמן כנשלח',
      open: 'פתח', kReply: 'ענו לך', kDraft: 'לאישור', kBatch: 'אותה הודעה, הרבה אנשים', kStep: 'הצעד שלך', kHand: 'לשלוח ידנית', kTpl: 'הודעה שמורה', people: 'אנשים', once: 'אישור אחד, כולם יוצאים',
      clearT: 'הכול נקי.', clearP: 'שום דבר לא מחכה לך. J8 ממשיך לעבוד.', held: 'נדחו לאחר כך', heldBack: 'החזר את מה שנדחה', loading: 'טוען…', fail: 'הטעינה נכשלה. הקש לנסות שוב',
      goneOut: 'יוצא עכשיו', answer: 'הם ענו?', waitingQ: 'מחכים לך', kill: 'בטל', tapKill: 'הקש שוב: בטל', none: 'אין כאן כלום.',
      talkSub: 'שאל את J8 או את הצוות. התשובות מגיעות לכאן.', talkPh: 'הודעה ל-J8', send: 'שלח', noMsg: 'אין עדיין הודעות.', waitAns: 'J8 עונה בריצת התיבה הבאה',
      pause: 'השהה שליחה', resume: 'חדש שליחה', paused: 'השליחה מושהית. שום דבר לא יוצא.', autopilot: 'טייס אוטומטי לכל הודעה שמורה', ask: 'שאל אותי', auto: 'אוטומטי אחרי 6 שעות', off: 'כבוי',
      lang: 'שפה', sound: 'צליל', on: 'פועל', classic: 'J8NIX הישן (14.1)', classicP: 'תוכנית, הוכחות, משימות וכל המסכים הישנים.', refresh: 'רענן', signout: 'התנתק', version: 'גרסה',
      upNext: 'הבא בתור', approved: 'אושר.', stopped: 'נעצר. זה לא יישלח.', undo: 'בטל', back: 'חזר להמתנה.',
      saved: 'נשמר', doneT: 'בוצע. יפה.', notConn: 'אין חיבור. נסה שוב עוד רגע.', couldnt: 'לא נשמר. שום דבר לא השתנה.', copied: 'הועתק. הדבק ושלח.',
      sentBy: 'סומן כנשלח.', approvedN: 'אושרו', blocked: 'נחסם בבדיקה:', hardAgain: 'הקש שוב: שלח בכל זאת', why: 'למה עכשיו', where: 'איפה', sentOn: 'נשלח',
      soonGo: 'המתנה', tplOk: 'מאושרת', tplWait: 'מחכה לאישור שלך', moreN: 'עוד כאלה', live: 'מחובר', offline: 'לא מחובר', saved2: 'עותק שמור', newV: 'חדש: J8NIX 2.0' }
  };
  function lang() { try { return JSON.parse(localStorage.getItem('j8-lang')) === 'he' ? 'he' : 'en'; } catch (e) { return 'en'; } }
  function t(k) { var L = T[lang()]; return L[k] != null ? L[k] : T.en[k] != null ? T.en[k] : k; }
  var OUTW = { en: { replied: 'Replied', call: 'Call', proposal: 'Proposal', won: 'Won', lost: 'Lost' }, he: { replied: 'ענו', call: 'שיחה', proposal: 'הצעה', won: 'נסגר', lost: 'לא רלוונטי' } };
  function ow(k) { return OUTW[lang()][k] || OUTW.en[k] || k; }

  /* ---------- helpers ---------- */
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"'`]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]; }); }
  function link(u) { u = String(u || '').trim(); return /^https:\/\/[^\s"'<>`\\]+$/i.test(u) ? u : ''; }
  function cut(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; }
  function safe(f, d) { try { var v = f(); return v == null ? d : v; } catch (e) { return d; } }
  function pd(s) { var x = X(); if (x && x.pd) return x.pd(s); var v = Date.parse(s); return v; }
  function on() { var j = J(); return !!(j && safe(function () { return j.status().connected; }, false)); }
  function failed() { var x = X(); return !!(x && safe(function () { return x.failed(); }, false)); }
  function hm(ts) { var d = new Date(ts); if (isNaN(d)) return ''; try { return d.toLocaleTimeString(lang() === 'he' ? 'he-IL' : 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' }); } catch (e) { return d.toTimeString().slice(0, 5); } }
  function day(ts) { var d = new Date(ts); if (isNaN(d)) return ''; try { return d.toLocaleDateString(lang() === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Jerusalem' }); } catch (e) { return ''; } }
  function armed(k) { var a = S.arm[k]; return a && Date.now() - a < 5000; }
  function arm(k) { S.arm[k] = Date.now(); render(); setTimeout(function () { if (S.arm[k] && Date.now() - S.arm[k] >= 5000) { delete S.arm[k]; render(); } }, 5100); }
  function aps() { var j = J(); return safe(function () { return j.approvals.list(); }, []); }
  function apById(id) { return aps().filter(function (a) { return String(a.id) === String(id); })[0] || null; }
  function textOf(a) { var j = J(); return String(safe(function () { return j.approvals.textOf(a); }, '') || ''); }
  function whoOf(a) { return cut(a.to || a.label || a.subject || a.kind || 'Draft', 60); }
  function whyNow(a) { var x = X(); return x ? safe(function () { return x.whyNow(a); }, '') : ''; }
  function lintOf(a) { var L = X() && X().state && X().state.lint; return (L && a && L[a.id]) || { flags: [], hard: false }; }
  function outcomeOf(a) { return a.outcome || (a.replied_at ? 'replied' : ''); }
  function isTpl(a) { return a && (a.kind === 'template' || a.label === 'Template'); }
  function pull() { /* rank + lint feed j13's shared state (window.j8x.state), so desk() and batches() see them */
    var j = J(), x = X(); if (!j || !x || !on()) return;
    if (j.rank && Date.now() - S.rankAt > 6e4) { S.rankAt = Date.now(); j.rank().then(function (R) { if (Array.isArray(R)) { x.state.rank = R; soon(); } }, function () {}); }
    if (j.lint && Date.now() - S.lintAt > 6e4) { S.lintAt = Date.now(); j.lint().then(function (L) { if (L && typeof L === 'object') { x.state.lint = L; soon(); } }, function () {}); }
  }

  /* ---------- sound + touch feedback (decisions only; Settings → Sound) ---------- */
  var AC = null;
  function soundOn() { try { return localStorage.getItem('j8:sound') !== 'off'; } catch (e) { return true; } }
  function tone(kind) {
    try { if (navigator.vibrate) navigator.vibrate(kind === 'stop' ? [6, 40, 6] : 8); } catch (e) {}
    if (!soundOn()) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
      var n = AC.currentTime, F = { go: [740, 988], hold: [523, 523], stop: [440, 330], done: [659, 880] }[kind] || [600, 600];
      var o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(F[0], n); o.frequency.exponentialRampToValueAtTime(F[1], n + 0.08);
      g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(0.06, n + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, n + (kind === 'hold' ? 0.06 : 0.14));
      o.connect(g); g.connect(AC.destination); o.start(n); o.stop(n + 0.16);
    } catch (e) {}
  }

  /* ---------- the deck: every decision waiting for Dave, money-first (j13 desk order), held ones last ---------- */
  function deck(all) {
    var x = X(); if (!x) return [];
    var D = safe(function () { return x.desk(); }, null); if (!D) return [];
    var L = D.top.concat(D.rest).concat((D.ready || []).map(function (a) { return { k: 'hand', id: 'h:' + a.id, a: a }; })).concat((D.steps || []).map(function (tk) { return { k: 'tk', id: tk.id, t: tk }; }));
    L = L.filter(function (c) { return !S.gone[c.id]; });
    var A = L.filter(function (c) { return !S.held[c.id]; });
    return all ? A.concat(L.filter(function (c) { return S.held[c.id]; }).map(function (c) { c.wasHeld = 1; return c; })) : A;
  }
  function cardTitle(c) {
    if (c.k === 'batch') return cut(c.b.label, 70) + ' · ' + c.b.L.length;
    if (c.k === 'tk') return cut(c.t.title || c.t.id, 110);
    return whoOf(c.a);
  }
  function kindChip(c) {
    var m = { rep: ['k-rep', t('kReply')], batch: ['', t('kBatch')], ap: ['', isTpl(c.a) ? t('kTpl') : t('kDraft')], tk: ['k-tk', t('kStep')], hand: ['k-tk', t('kHand')] }[c.k] || ['', ''];
    return '<span class="kind ' + m[0] + '">' + esc(m[1]) + (c.wasHeld ? ' · ' + esc(t('held')) : '') + '</span>';
  }
  function key(k) { return '<kbd aria-hidden="true">' + k + '</kbd>'; }
  function cardHtml(c, inList, total) {
    var h = cardBody(c, inList, total);
    if (!inList && total) h = h.replace('<div class="ch">', '<div class="ch"><span class="no" aria-label="1 ' + esc(t('of')) + ' ' + total + '">1/' + total + '</span>');
    if (!inList) h = h.replace('<div class="acts', '<div class="tear" aria-hidden="true"></div><div class="acts'); /* the ticket's tear line sits above the decision */
    return h;
  }
  function cardBody(c, inList, total) {
    var h = '<article class="card" data-card="' + esc(c.id) + '">' + (inList ? '' : '<div class="ch">' + kindChip(c) + '</div><h3 dir="auto">' + esc(cardTitle(c)) + '</h3>');
    var hold = inList ? '' : '<button type="button" class="b" data-x="hold" data-id="' + esc(c.id) + '">' + esc(t('hold')) + key('H') + '</button>';
    if (c.k === 'rep') {
      var a = c.a, cur = outcomeOf(a);
      h += '<p class="why">' + esc(t('sentOn')) + ' ' + esc(day(pd(a.sent_at))) + ' · ' + esc(ow(cur || 'replied')) + '</p>';
      h += '<div class="acts four">' + ['call', 'proposal', 'won', 'lost'].map(function (w) { return '<button type="button" class="b sm" data-x="oc" data-w="' + w + '" data-id="' + esc(a.id) + '" aria-pressed="' + (cur === w) + '">' + esc(ow(w)) + '</button>'; }).join('') + '</div>';
      if (!inList) h += '<div class="sub"><button type="button" class="lnk" data-x="hold" data-id="' + esc(c.id) + '">' + esc(t('hold')) + '</button></div>';
    } else if (c.k === 'batch') {
      var b = c.b, n = b.L.length, op = S.bprev === b.k;
      h += '<p class="why">' + n + ' ' + esc(t('people')) + ' · ' + esc(t('once')) + (b.hard ? ' · ' + b.hard + ' ' + esc(t('leftOut')) : '') + '</p>';
      b.L.slice(0, 3).forEach(function (x) { h += '<div class="prev"><b dir="auto">' + esc(whoOf(x)) + '</b><p dir="auto">' + esc(cut(op ? textOf(x) : whyNow(x), op ? 220 : 80)) + '</p></div>'; });
      if (n > 3) h += '<p class="meta">+ ' + (n - 3) + ' ' + esc(t('moreN')) + '</p>';
      h += '<div class="acts two"><button type="button" class="b go" data-x="batch-go" data-id="' + esc(b.k) + '"' + (S.busy ? ' disabled' : '') + '>' + esc(t('goAll')) + ' ' + n + (inList ? '' : key('G')) + '</button>' + (hold || '<span></span>') + '</div>';
      if (!op) h += '<div class="sub"><button type="button" class="lnk" data-x="bprev" data-id="' + esc(b.k) + '">' + esc(t('readAll')) + '</button></div>';
    } else if (c.k === 'ap') {
      var ap = c.a, tx = textOf(ap), li = lintOf(ap), plan = !!(ap.no_send || (ap.extra && ap.extra.no_send));
      var why = whyNow(ap), sub = ap.subject && ap.subject !== ap.to ? cut(ap.subject, 90) : '';
      h += '<p class="why" dir="auto">' + esc([why, sub].filter(Boolean).join(' · ')) + '</p>';
      if (ap.channel) h += '<p class="meta" dir="auto">' + esc(t('where')) + ': ' + esc(cut(ap.channel, 60)) + '</p>';
      var hard = (li.flags || []).filter(function (f) { return /^HARD:/.test(f); }).map(function (f) { return f.replace(/^HARD:\s*/, ''); });
      if (li.hard && hard.length) h += '<p class="warn" dir="auto">' + esc(t('blocked')) + ' ' + esc(cut(hard.join(' · '), 160)) + '</p>';
      if (S.edit === ap.id) {
        h += '<label class="sr" for="j2ed">' + esc(t('change')) + '</label><textarea class="ed" id="j2ed" data-ed="1" dir="auto">' + esc(S.editTx) + '</textarea>'
          + '<div class="acts two"><button type="button" class="b go" data-x="ed-save" data-id="' + esc(ap.id) + '">' + esc(t('save')) + '</button><button type="button" class="b" data-x="ed-x">' + esc(t('cancel')) + '</button></div>';
      } else {
        if (tx) h += '<div class="txt' + (S.full[ap.id] ? ' all' : '') + '" dir="auto">' + esc(tx) + '</div>' + (tx.length > 320 && !S.full[ap.id] ? '<button type="button" class="more" data-x="full" data-id="' + esc(ap.id) + '">' + esc(t('readAll')) + '</button>' : '');
        var hb = li.hard && armed('hb-' + ap.id), sk = armed('st-' + ap.id);
        h += '<div class="acts"><button type="button" class="b go' + (hb ? ' arm' : '') + '" data-x="go" data-id="' + esc(ap.id) + '">' + esc(hb ? t('hardAgain') : t('go')) + (inList ? '' : key('G')) + '</button>'
          + (hold || '') + '<button type="button" class="b stop' + (sk ? ' arm' : '') + '" data-x="stop" data-id="' + esc(ap.id) + '">' + esc(sk ? t('tapStop') : t('stop')) + (inList ? '' : key('X')) + '</button></div>';
        if (!plan && !isTpl(ap)) h += '<div class="sub"><button type="button" class="lnk" data-x="ed" data-id="' + esc(ap.id) + '">' + esc(t('change')) + '</button></div>';
      }
    } else if (c.k === 'hand') {
      var ha = c.a, htx = textOf(ha), hl = link(ha.link), hk = armed('hs-' + ha.id);
      if (ha.channel) h += '<p class="why" dir="auto">' + esc(cut(ha.channel, 60)) + '</p>';
      if (htx) h += '<div class="txt" dir="auto">' + esc(htx) + '</div>';
      h += '<div class="acts"><button type="button" class="b go" data-x="copyopen" data-id="' + esc(ha.id) + '">' + esc(hl ? t('copyOpen') : t('copy')) + '</button>' + (hold || '')
        + '<button type="button" class="b' + (hk ? ' arm' : '') + '" data-x="handsent" data-id="' + esc(ha.id) + '">' + esc(hk ? t('tapStop') : t('markSent')) + '</button></div>';
    } else if (c.k === 'tk') {
      var tk = c.t, tl = link(tk.link), dk = armed('tk-' + tk.id);
      if (tk.why) h += '<p class="why" dir="auto">' + esc(cut(tk.why, 220)) + '</p>';
      if (tk.action) h += '<div class="txt" dir="auto">' + esc(tk.action) + '</div>';
      h += '<div class="acts"><button type="button" class="b go' + (dk ? ' arm' : '') + '" data-x="done" data-id="' + esc(tk.id) + '">' + esc(dk ? t('tapStop') : t('done')) + (inList ? '' : key('G')) + '</button>' + (hold || '')
        + (tl ? '<a class="b" href="' + esc(tl) + '" target="_blank" rel="noopener noreferrer">' + esc(tk.link_text && tk.link_text.length < 18 ? tk.link_text : t('open')) + '</a>' : '<span></span>') + '</div>';
    }
    return h + '</article>';
  }

  /* ---------- spaces ---------- */
  function glance() {
    var x = X(), sc = x ? safe(function () { return x.score(); }, null) : null, L = deck().length, none = !on() && !aps().length;
    var se = sc ? sc.sent : 0, re = sc ? sc.rep : 0;
    return '<div class="tick"><b>' + esc(none ? '—' : L) + '</b><span><em>' + esc(t('waiting')) + '</em><small>' + esc(none ? t('loading') : se + ' ' + t('sentW') + ' · ' + re + ' ' + (re === 1 ? t('repW1') : t('repW')) + ' · ' + t('d7')) + '</small></span></div>' + pulse();
  }
  function pulse() {
    var j = J(), now = Date.now(), from = now - 864e5, R = safe(function () { return j.runs.list(); }, []), ok = 0, bad = 0;
    var ticks = R.map(function (r) { var tt = pd(r.ended || r.started); if (isNaN(tt) || tt < from || tt > now + 6e4) return ''; if (r.status === 'failed') bad++; else if (r.status === 'ok') ok++;
      var p = Math.max(0, Math.min(100, (tt - from) / 864e5 * 100));
      return '<i class="' + (r.status === 'failed' ? 'f' : r.status === 'ok' ? '' : 'n') + '" style="inset-inline-start:' + p.toFixed(2) + '%"></i>'; }).join('');
    var lbl = t('pulse') + ': ' + ok + ' ' + t('okW') + ', ' + bad + ' ' + t('failedW');
    return '<div class="pulse" role="img" aria-label="' + esc(lbl) + '">' + ticks + '</div><div class="pl"><span>' + esc(t('h24')) + '</span><span>' + esc(ok + ' ' + t('okW') + (bad ? ' · ' + bad + ' ' + t('failedW') : '')) + '</span><span>' + esc(t('now')) + '</span></div>';
  }
  function vToday() {
    pull();
    var L = deck(), h = '<h1 class="sr">' + esc(t('today')) + '</h1>' + glance();
    var first = L[0];
    h += '<div class="twin"><div><h2 class="sr">' + esc(t('deck')) + '</h2>';
    if (!first) {
      if (!on() && !aps().length) h += failed() ? '<button type="button" class="fail" data-x="retry">' + esc(t('fail')) + '</button>' : '<div class="skel" aria-label="' + esc(t('loading')) + '"></div>';
      else h += '<div class="clear"><img class="eight" src="brand/j8nix-mark-8-2026-11-17.svg" alt=""><p class="big">' + esc(t('clearT')) + '</p><p>' + esc(t('clearP')) + '</p>'
        + (Object.keys(S.held).length ? '<div class="sub" style="justify-content:center"><button type="button" class="lnk" data-x="unhold">' + esc(t('heldBack')) + ' (' + Object.keys(S.held).length + ')</button></div>' : '') + '</div>';
    } else h += '<div class="deck">' + (L.length > 2 ? '<div class="ghost g2"></div>' : '') + (L.length > 1 ? '<div class="ghost g1"></div>' : '') + cardHtml(first, false, L.length) + '</div>';
    h += '</div><aside class="next" aria-label="' + esc(t('upNext')) + '"><div class="deckh"><h2>' + esc(t('upNext')) + '</h2></div><div class="rows">'
      + L.slice(1, 8).map(function (c) { return '<div class="row"><div class="rh"><span class="ph"><b dir="auto">' + esc(cardTitle(c)) + '</b><small>' + kindChip(c).replace(/<[^>]+>/g, '') + '</small></span></div></div>'; }).join('') + '</div></aside></div>';
    return h;
  }
  function chev() { return '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>'; }
  function vQueue() {
    pull();
    var x = X(), L = deck(true), G = x ? safe(function () { return x.goingOut(); }, []) : [], O = x ? safe(function () { return x.sent30(); }, []) : [];
    var h = '<h1 class="sr">' + esc(t('queue')) + '</h1>';
    if (failed()) h += '<button type="button" class="fail" data-x="retry">' + esc(t('fail')) + '</button>';
    h += '<section class="grp"><h2>' + esc(t('waitingQ')) + ' · ' + L.length + '</h2>' + (L.length ? '<div class="rows">' + L.map(function (c) {
      return '<details class="row"' + (S.open[c.id] ? ' open' : '') + ' data-k="' + esc(c.id) + '"><summary><span class="ph"><b dir="auto">' + esc(cardTitle(c)) + '</b><small>' + kindChip(c).replace(/<[^>]+>/g, '') + '</small></span>' + chev() + '</summary>'
        + (S.open[c.id] ? '<div class="bd">' + cardHtml(c, true) + '</div>' : '') + '</details>'; }).join('') + '</div>' : '<p class="empty">' + esc(on() ? t('none') : t('loading')) + '</p>') + '</section>';
    if (G.length) h += '<section class="grp"><h2>' + esc(t('goneOut')) + ' · ' + G.length + '</h2><div class="rows">' + G.slice(0, 30).map(function (a) {
      var k = 'kl-' + a.id, ar = armed(k), hu = pd(a.hold_until), left = !isNaN(hu) && hu > Date.now() ? ' · ' + t('soonGo') + ' ' + hm(hu) : '';
      return '<div class="row"><div class="rh"><span class="ph"><b dir="auto">' + esc(whoOf(a)) + '</b><small dir="auto">' + esc((a.channel || '') + left) + '</small></span><button type="button" class="b sm stop' + (ar ? ' arm' : '') + '" data-x="kill" data-id="' + esc(a.id) + '">' + esc(ar ? t('tapKill') : t('kill')) + '</button></div></div>'; }).join('') + '</div></section>';
    if (O.length) h += '<section class="grp"><h2>' + esc(t('answer')) + ' · ' + O.length + '</h2><div class="rows">' + O.slice(0, 20).map(function (a) {
      var cur = outcomeOf(a);
      return '<div class="row"><div class="rh" style="flex-wrap:wrap"><span class="ph" style="min-width:60%"><b dir="auto">' + esc(whoOf(a)) + '</b><small>' + esc(t('sentOn')) + ' ' + esc(day(pd(a.sent_at))) + (cur ? ' · ' + esc(ow(cur)) : '') + '</small></span><span class="seg oc">'
        + ['replied', 'call', 'proposal', 'won', 'lost'].map(function (w) { return '<button type="button" class="b sm" data-x="oc" data-w="' + w + '" data-id="' + esc(a.id) + '" aria-pressed="' + (cur === w) + '">' + esc(ow(w)) + '</button>'; }).join('') + '</span></div></div>'; }).join('') + '</div></section>';
    return h;
  }
  function vTalk() {
    var j = J(), M = safe(function () { return j.inbox.list(30); }, []).slice().reverse();
    var h = '<h1 class="sr">' + esc(t('talk')) + '</h1><p class="lead">' + esc(t('talkSub')) + '</p><div class="rows">';
    h += M.length ? M.map(function (m) { var re = String(m.reply || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean).slice(-4).join('\n');
      return '<div class="msg"><p class="me" dir="auto">' + esc(cut(m.text || '', 600)) + '</p>' + (re ? '<p class="re" dir="auto">' + esc(cut(re, 800)) + '</p>' : '<small>' + esc(t('waitAns')) + '</small>') + '<small>' + esc(day(pd(m.at)) + ' ' + hm(pd(m.at))) + '</small></div>'; }).join('')
      : '<p class="empty">' + esc(on() ? t('noMsg') : t('loading')) + '</p>';
    return h + '</div><div class="comp"><label class="sr" for="j2say">' + esc(t('talkPh')) + '</label><textarea id="j2say" data-say="1" dir="auto" rows="1" placeholder="' + esc(t('talkPh')) + '">' + esc(S.talk) + '</textarea><button type="button" class="b go" data-x="say">' + esc(t('send')) + '</button></div>';
  }
  var APW = { ask: 'ask', hold: 'auto', off: 'off' };
  function tplName(a) { if (a.label && a.label !== 'Template') return a.label; var m = /^tpl-t\d+-(.+)$/i.exec(String(a.id || '')), s = m ? m[1].replace(/-/g, ' ') : (a.subject || a.id || 'Template'); return s.charAt(0).toUpperCase() + s.slice(1); }
  function vSet() {
    var j = J(), x = X(), p = safe(function () { return j.control.paused(); }, false), u = safe(function () { return j.auth.user(); }, null), o = safe(function () { return j.orgs.current(); }, null);
    var TP = x ? safe(function () { return x.templates(); }, []) : [], pk = armed(p ? 'resume' : 'pause');
    var row = function (title, small, right) { return '<div class="row"><div class="rh"><span class="ph"><b>' + title + '</b>' + (small ? '<small>' + small + '</small>' : '') + '</span>' + right + '</div></div>'; };
    var h = '<h1 class="sr">' + esc(t('set')) + '</h1><section class="grp first"><div class="rows">'
      + row(esc(p ? t('paused') : t('sending')), esc(x ? safe(function () { return x.senderText(); }, '') : ''), '<button type="button" class="b sm' + (pk ? ' arm' : p ? ' go' : '') + '" data-x="' + (p ? 'resume' : 'pause') + '">' + esc(pk ? t('tapStop') : p ? t('resume') : t('pause')) + '</button>')
      + row(esc(t('lang')), '', '<span class="seg"><button type="button" class="b sm" data-x="lang" data-id="en" aria-pressed="' + (lang() === 'en') + '" lang="en">English</button><button type="button" class="b sm" data-x="lang" data-id="he" aria-pressed="' + (lang() === 'he') + '" lang="he">עברית</button></span>')
      + row(esc(t('sound')), '', '<span class="seg"><button type="button" class="b sm" data-x="snd" data-id="on" aria-pressed="' + soundOn() + '">' + esc(t('on')) + '</button><button type="button" class="b sm" data-x="snd" data-id="off" aria-pressed="' + !soundOn() + '">' + esc(t('off')) + '</button></span>')
      + row(esc(t('classic')), esc(t('classicP')), '<a class="b sm" href="classic/">' + esc(t('open')) + '</a>')
      + row(esc(t('refresh')), '', '<button type="button" class="b sm" data-x="refresh">' + esc(t('refresh')) + '</button>')
      + row(esc(t('signout')), esc((u ? u.email : '') + (o && o.name ? ' · ' + o.name : '')), '<button type="button" class="b sm" data-x="signout">' + esc(t('signout')) + '</button>')
      + row(esc(t('version')), 'J8NIX ' + VER, '') + '</div></section>';
    if (TP.length) h += '<section class="grp"><h2>' + esc(t('autopilot')) + '</h2><div class="rows">' + TP.map(function (a) {
      var m = a.autopilot && APW[a.autopilot] ? a.autopilot : 'ask', st = a.status || 'pending', ok = st === 'approved' || st === 'edited', s = safe(function () { return x.tplStats(a); }, { sent: 0, rep: 0 }), ak = armed('apl-' + a.id);
      return '<div class="row"><div class="rh" style="flex-wrap:wrap"><span class="ph" style="min-width:55%"><b dir="auto">' + esc(cut(tplName(a), 60)) + '</b><small>' + s.sent + ' ' + esc(t('tplLine')) + ' · ' + s.rep + ' ' + esc(t('tplRep')) + ' · ' + esc(ok ? t('tplOk') : t('tplWait')) + '</small></span><span class="seg">'
        + ['ask', 'hold', 'off'].map(function (w) { return '<button type="button" class="b sm' + (w === 'hold' && ak ? ' arm' : '') + '" data-x="apl" data-w="' + w + '" data-id="' + esc(a.id) + '" aria-pressed="' + (m === w) + '">' + esc(w === 'hold' && ak ? t('tapStop') : t(APW[w])) + '</button>'; }).join('') + '</span></div></div>'; }).join('') + '</div></section>';
    return h;
  }

  /* ---------- shell ---------- */
  var SP = [['today', 't-today'], ['queue', 't-queue'], ['talk', 't-talk'], ['set', 't-set']];
  function topBar() {
    var j = J(), x = X(), st = safe(function () { return j.status(); }, {}), p = safe(function () { return j.control.paused(); }, false);
    var s = x ? safe(function () { return x.sender ? x.sender() : null; }, null) : null, bad = p || (s && s.ok === false);
    var txt = !st.connected ? (st.cached ? t('saved2') : t('offline')) : p ? t('paused').split('.')[0] : bad ? cut(safe(function () { return x.senderText(); }, ''), 40) : t('live');
    return '<header class="top"><span class="lock" aria-label="J8NIX 2.0"><span class="tile"><img src="brand/j8nix-mark-8-2026-11-17.svg" alt=""></span><b>J8NIX</b><sup>2.0</sup></span><span class="sp"></span>'
      + '<span class="pill' + (bad ? ' bad' : !st.connected ? ' off' : '') + '" role="status"><i aria-hidden="true"></i>' + esc(txt) + '</span></header>';
  }
  function tabs() { /* index-card tabs: each space is a coloured card in a file; the open one joins the folder below */
    var n = deck().length;
    return '<nav class="tabs" aria-label="Spaces">' + SP.map(function (s, i) {
      return '<button type="button" class="tab" data-x="sp" data-id="' + s[0] + '" style="--tc:var(--' + s[1] + ')"' + (S.sp === s[0] ? ' aria-current="page"' : '') + ' aria-keyshortcuts="' + (i + 1) + '">' + esc(t(s[0]))
        + (s[0] === 'today' && n ? '<em>' + n + '</em><span class="sr"> (' + n + ' ' + esc(t('waiting')) + ')</span>' : '') + '</button>'; }).join('') + '</nav>';
  }
  function busyTyping() { var a = sr && sr.activeElement; return !!(a && /^(TEXTAREA|INPUT)$/.test(a.tagName)); }
  function render(force) {
    if (!W) return;
    if (!force && busyTyping()) { pend = true; return; }
    pend = false;
    var y = window.scrollY;
    W.setAttribute('data-sp', S.sp); W.setAttribute('dir', lang() === 'he' ? 'rtl' : 'ltr'); W.setAttribute('lang', lang());
    var body = S.sp === 'queue' ? vQueue() : S.sp === 'talk' ? vTalk() : S.sp === 'set' ? vSet() : vToday();
    C.innerHTML = topBar() + tabs() + '<main class="folder" id="j2main" tabindex="-1"><div class="in">' + body + '</div></main>'; /* the toast sits outside C, so a data refresh never wipes an Undo */
    window.scrollTo(0, y);
    if (S.edit) { var ta = sr.getElementById('j2ed'); if (ta && force === 'edit') { ta.focus(); } }
  }
  function soon() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; render(false); }); }
  function go(sp) { S.sp = sp; S.edit = null; render(true); window.scrollTo(0, 0); var m = sr.getElementById('j2main'); if (m) try { m.focus({ preventScroll: true }); } catch (e) {} }
  function say(msg, undo) {
    undoFn = undo || null; var el = sr.getElementById('j2t'); if (!el) return;
    el.setAttribute('dir', lang() === 'he' ? 'rtl' : 'ltr'); el.innerHTML = '<span dir="auto">' + esc(msg) + '</span>' + (undo ? '<button type="button" data-x="undo">' + esc(t('undo')) + '</button>' : '');
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { var e2 = sr.getElementById('j2t'); if (e2) e2.classList.remove('on'); undoFn = null; }, 6000);
  }
  function fail(e) { render(true); say(t('couldnt') + (e && (e.message || e.code) ? ' (' + cut(e.message || e.code, 60) + ')' : '')); }
  /* the top card leaves in the direction of the decision, then the deck re-renders */
  function leave(id, how, then) {
    var el = sr.querySelector('[data-card="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
    tone(how);
    if (el && S.sp === 'today') { el.classList.add('x-' + how); setTimeout(then, 190); } else then();
  }

  /* ---------- actions ---------- */
  function act(x, el) {
    var id = el.getAttribute('data-id') || '', j = J(), X8 = X();
    if (x === 'sp') { go(id); return; }
    if (x === 'undo') { if (undoFn) { var f = undoFn; undoFn = null; var te = sr.getElementById('j2t'); if (te) te.classList.remove('on'); f(); } return; }
    if (x === 'hold') { leave(id, 'hold', function () { S.held[id] = 1; render(true); say(t('heldT2'), function () { delete S.held[id]; render(true); }); }); return; }
    if (x === 'unhold') { S.held = {}; render(true); return; }
    if (x === 'full') { S.full[id] = 1; render(true); return; }
    if (x === 'bprev') { S.bprev = id; render(true); return; }
    if (x === 'ed') { var ea = apById(id); S.edit = id; S.editTx = ea ? textOf(ea) : ''; render('edit'); return; }
    if (x === 'ed-x') { S.edit = null; render(true); return; }
    if (x === 'lang') { try { localStorage.setItem('j8-lang', JSON.stringify(id === 'he' ? 'he' : 'en')); } catch (e) {} document.documentElement.lang = id === 'he' ? 'he' : 'en'; document.documentElement.dir = id === 'he' ? 'rtl' : 'ltr'; var tl = sr.getElementById('j2t'); if (tl) tl.classList.remove('on'); undoFn = null; render(true); return; }
    if (x === 'snd') { try { localStorage.setItem('j8:sound', id === 'off' ? 'off' : 'on'); } catch (e) {} render(true); if (id === 'on') tone('go'); return; }
    if (x === 'retry') { if (!j) { location.reload(); return; } var st0 = safe(function () { return j.status(); }, {}) || {}; (st0.org ? j.reload() : j.connect()).then(function () { render(true); }, function () { render(true); }); return; }
    if (x === 'refresh') { if (j && j.reload) j.reload().then(function () { say(t('saved')); render(true); }, function () { say(t('offline')); }); S.rankAt = 0; S.lintAt = 0; return; }
    if (x === 'signout') { if (j) j.auth.signOut().catch(function () {}); return; }
    if (x === 'copyopen') {
      var ra = apById(id); if (!ra) return; var rt = textOf(ra), rl = link(ra.link);
      if (rt) { try { navigator.clipboard.writeText(rt).catch(function () {}); } catch (e) {} }
      if (rl) { try { window.open(rl, '_blank', 'noopener,noreferrer'); } catch (e) {} }
      tone('go'); say(rt ? t('copied') : t('open')); return;
    }
    if (!j || !on()) { say(t('notConn')); return; }
    if (x === 'say') {
      var v = String(S.talk || '').trim(); if (!v) return; el.disabled = true;
      j.inbox.send('p-general', v).then(function () { S.talk = ''; var a = sr.activeElement; if (a && a.blur) a.blur(); tone('go'); render(true); say(t('saved')); }, function (e) { el.disabled = false; fail(e); }); return;
    }
    if (x === 'go') {
      var a1 = apById(id); if (!a1) return;
      if (lintOf(a1).hard) { var hk = 'hb-' + id; if (!armed(hk)) { arm(hk); return; } delete S.arm[hk]; }
      el.disabled = true;
      leave(id, 'go', function () {
        j.approvals.approve(id).then(function () { S.gone[id] = 1; render(true); say(t('approved') + ' ' + safe(function () { return X8.senderText(); }, ''), function () { j.approvals.undo(id).then(function () { delete S.gone[id]; render(true); say(t('back')); }, fail); }); }, fail);
      }); return;
    }
    if (x === 'stop' || x === 'kill') {
      var sk = (x === 'stop' ? 'st-' : 'kl-') + id; if (!armed(sk)) { arm(sk); return; } delete S.arm[sk]; el.disabled = true;
      leave(id, 'stop', function () {
        j.approvals.kill(id).then(function () { S.gone[id] = 1; render(true); say(t('stopped'), function () { j.approvals.undo(id).then(function () { delete S.gone[id]; render(true); say(t('back')); }, fail); }); }, fail);
      }); return;
    }
    if (x === 'ed-save') {
      var tx = String(S.editTx || '').trim(); if (!tx) return;
      var ea2 = apById(id); if (ea2 && lintOf(ea2).hard) { var ek = 'hb-' + id; if (!armed(ek)) { S.arm[ek] = Date.now(); el.textContent = t('hardAgain'); el.classList.add('arm'); return; } delete S.arm[ek]; }
      el.disabled = true;
      j.approvals.edit(id, tx).then(function () { S.edit = null; S.gone[id] = 1; tone('go'); render(true); say(t('approved'), function () { j.approvals.undo(id).then(function () { delete S.gone[id]; render(true); say(t('back')); }, fail); }); }, function (e) { el.disabled = false; fail(e); }); return;
    }
    if (x === 'batch-go') {
      if (S.busy) return; var bb = safe(function () { return X8.batches().filter(function (b) { return b.k === id; })[0]; }, null); if (!bb) return;
      var ids = bb.L.map(function (a) { return a.id; }), okIds = [], bad = 0; S.busy = true; el.disabled = true;
      leave('b:' + id, 'go', function () {
        ids.reduce(function (p, aid) { return p.then(function () { return j.approvals.approve(aid).then(function () { okIds.push(aid); }, function () { bad++; }); }); }, Promise.resolve()).then(function () {
          S.busy = false; S.bprev = null; render(true);
          say(t('approvedN') + ' ' + okIds.length + (bad ? ' · ' + bad + ' ' + t('failedW') : ''), okIds.length ? function () { okIds.reduce(function (p, aid) { return p.then(function () { return j.approvals.undo(aid).catch(function () {}); }); }, Promise.resolve()).then(function () { render(true); say(t('back')); }); } : null);
        });
      }); return;
    }
    if (x === 'oc') {
      var w = el.getAttribute('data-w'), oa = apById(id); if (!oa || !OUTW.en[w]) return; var cur = outcomeOf(oa); el.disabled = true; tone('done');
      var op = cur === w ? j.approvals.reply(id, 'clear') : w === 'replied' && oa.outcome ? j.approvals.reply(id, 'clear').then(function () { return j.approvals.reply(id, 'replied'); }) : j.approvals.reply(id, w);
      op.then(function () { render(true); say(t('saved') + ': ' + ow(w)); }, function (e) { el.disabled = false; fail(e); }); return;
    }
    if (x === 'handsent') {
      var hs = 'hs-' + id; if (!armed(hs)) { arm(hs); return; } delete S.arm[hs]; el.disabled = true;
      leave('h:' + id, 'go', function () { j.approvals.handSent(id).then(function () { render(true); say(t('sentBy')); }, fail); }); return;
    }
    if (x === 'done') {
      var dk = 'tk-' + id; if (!armed(dk)) { arm(dk); return; } delete S.arm[dk]; el.disabled = true;
      leave(id, 'done', function () { j.tasks.done(id).then(function () { S.gone[id] = 1; render(true); say(t('doneT'), function () { j.tasks.undo(id).then(function () { delete S.gone[id]; render(true); say(t('back')); }, fail); }); }, fail); }); return;
    }
    if (x === 'pause' || x === 'resume') {
      if (!armed(x)) { arm(x); return; } delete S.arm[x]; el.disabled = true;
      j.control.setPaused(x === 'pause').then(function () { tone(x === 'pause' ? 'stop' : 'go'); render(true); say(x === 'pause' ? t('paused') : t('resumed')); }, fail); return;
    }
    if (x === 'apl') {
      var aw = el.getAttribute('data-w'), at = apById(id); if (!at || !APW[aw]) return;
      if (aw === 'hold') { var ak = 'apl-' + id; if (!armed(ak)) { arm(ak); return; } delete S.arm[ak]; }
      if (!j.approvals.setAutopilot) return; el.disabled = true;
      j.approvals.setAutopilot(id, aw).then(function () { render(true); say(t('saved')); }, fail); return;
    }
  }

  /* ---------- keyboard (registered before j13's handler so 2.0 owns the keys while it is in front) ---------- */
  window.addEventListener('keydown', function (e) {
    if (!document.body.classList.contains('j2')) return;
    e.stopImmediatePropagation();
    var tgt = e.composedPath ? e.composedPath()[0] : e.target, typing = tgt && /^(TEXTAREA|INPUT|SELECT)$/.test(tgt.tagName);
    if (typing) { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { var b = sr.querySelector(tgt.dataset.say ? '[data-x="say"]' : '[data-x="ed-save"]'); if (b) b.click(); } if (e.key === 'Escape' && S.edit) { S.edit = null; render(true); } return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[1-4]$/.test(e.key)) { go(SP[+e.key - 1][0]); e.preventDefault(); return; }
    if (S.sp !== 'today') return;
    var c = sr.querySelector('.deck .card'); if (!c) return;
    var sel = { g: '[data-x="go"],[data-x="batch-go"],[data-x="done"],[data-x="copyopen"]', h: '[data-x="hold"]', x: '[data-x="stop"]', e: '[data-x="ed"]' }[e.key.toLowerCase()];
    if (!sel) return; var btn = c.querySelector(sel); if (btn) { e.preventDefault(); btn.click(); }
  }, true);

  /* ---------- swipe: a left swipe on the top card = Hold (the only gesture; buttons stay visible) ---------- */
  function swipe() {
    var sx = 0, sy = 0, card = null;
    sr.addEventListener('pointerdown', function (e) { card = e.target.closest && e.target.closest('.deck .card'); if (!card || e.target.closest('button,a,textarea,.txt')) { card = null; return; } sx = e.clientX; sy = e.clientY; });
    sr.addEventListener('pointerup', function (e) {
      if (!card) return; var dx = e.clientX - sx, dy = Math.abs(e.clientY - sy), rtl = lang() === 'he';
      if (Math.abs(dx) > 80 && dy < 50 && (rtl ? dx > 0 : dx < 0)) { var b = card.querySelector('[data-x="hold"]'); if (b) b.click(); }
      card = null;
    });
  }

  /* ---------- who is in front ---------- */
  function appShown() { var a = document.getElementById('app'); return !!(a && !a.hidden); }
  function sync() {
    var want = appShown(), was = document.body.classList.contains('j2');
    document.body.classList.toggle('j2', want); document.documentElement.classList.toggle('j2', want);
    if (want) { document.body.classList.remove('jx'); document.documentElement.classList.remove('jx'); }
    if (want && !was) render(true);
  }
  function boot() {
    host = document.createElement('div'); host.id = 'j2';
    sr = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    sr.innerHTML = '<link rel="stylesheet" href="j20w.css?v=' + VER + '"><div class="w" id="j2w"><div id="j2c"></div><div class="toast" id="j2t" role="status" aria-live="polite"></div></div>';
    W = sr.getElementById('j2w'); C = sr.getElementById('j2c');
    document.body.appendChild(host);
    sr.addEventListener('click', function (e) { var el = e.target.closest && e.target.closest('[data-x]'); if (!el) { var sm = e.target.closest && e.target.closest('summary'); if (sm) { var d = sm.parentNode, k = d.getAttribute('data-k'); if (k) { e.preventDefault(); S.open[k] = !S.open[k]; render(true); } } return; } e.preventDefault(); act(el.getAttribute('data-x'), el); });
    sr.addEventListener('input', function (e) { var tg = e.target; if (tg.dataset.say) { S.talk = tg.value; tg.style.height = 'auto'; tg.style.height = Math.min(160, tg.scrollHeight) + 'px'; } else if (tg.dataset.ed) S.editTx = tg.value; });
    sr.addEventListener('focusout', function () { setTimeout(function () { if (pend && !busyTyping()) render(false); }, 0); });
    swipe();
    var j = J();
    if (j && j.on) ['projects', 'tasks', 'approvals', 'runs', 'money', 'control', 'comments', 'routines', 'status'].forEach(function (c) { try { j.on(c, soon); } catch (e) {} });
    var a = document.getElementById('app');
    if (window.MutationObserver) {
      if (a) new MutationObserver(sync).observe(a, { attributes: true, attributeFilter: ['hidden'] });
      new MutationObserver(function () { if (document.body.classList.contains('j2') && document.body.classList.contains('jx')) { document.body.classList.remove('jx'); document.documentElement.classList.remove('jx'); } }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    sync(); render(true);
    setInterval(function () { if (!document.hidden && document.body.classList.contains('j2') && !busyTyping() && !sr.querySelector('.toast.on')) render(false); }, 60000);
  }
  window.j2 = { version: VER, state: S, deck: deck, go: go, render: function () { render(true); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
