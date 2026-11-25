/* =====================================================================
   J8NIX 2.0 · 15.0.0 (25 Nov 2026) · "Card file" — slice 1 of backlog d-1125-02.
   A new app layer over the same data engine: window.J8 (j8-data.js) for every read and write, and the 14.1 helpers that
   j13.js exposes on window.j8x (desk, batches, goingOut, sent30, people, score, senderText, whyNow, templates, tplStats).
   Spaces (each with its own colour): Today (glance + one decision at a time), Queue (everything waiting, going out,
   did they answer), Talk (messages with the team), Settings (pause, autopilot per template, language, sound, classic,
   sign out). Decisions: Go (approve) · Hold (later this session) · Stop (not now = kill) · Change (edit, then it goes) ·
   Go all (batch, 3 previews first) · outcomes (Replied / Call / Proposal / Won / Lost) · Done (your step) · Copy & open /
   Mark sent (by hand). Every Go / Stop / Done shows Undo for 6 s. Keys: G = Go · H = Hold · X = Stop · E = Change ·
   1–6 = spaces (15.1). Sound: short soft tones on decisions only (Settings → Sound). Hebrew: Settings → עברית (RTL).
   Old app: /j8/classic/ (14.1 as it was). Research + sources: j8/design/V20-NOTES.md. Revert: git revert of the 15.0 commit.
   15.1.0 (25 Nov 2026) · slice 2 (backlog d-1125-02b): two new spaces, Engines (butter) and Score (sky-cyan). Engines = one row per
   active engine: one number (replies), a status word (N wait for you / Moving / Quiet), tap for now, next and its funnel; parked or
   hidden engines fold under Resting. Score = drafts made in the window and where they are now (j8_funnel via J8.funnel), "X of N"
   until a step has 20, by engine, money booked. Keys 1–6. Revert: git revert of the 15.1 commit.
   15.2.0 (25 Nov 2026) · slice 3 (backlog d-1125-02c): Agents space (rose tab, key 6; Settings is key 7 and a cog under 420 px). One line says
   all fine or who needs a look; one row per routine (j8_routines) with a glyph + word status and a switch where the routine reads it
   (J8.routines.set, at once, Undo); Receipts = real j8_runs of the last 7 days by day, Problems only filter. Revert: git revert of the 15.2 commit.
   15.4.0 (25 Nov 2026) · backlog d-1125-05 "Guide": first open = 3-step guided start (who you are, your goal, your channels; each
   step skippable), then a 4-stop tour you launch yourself; every space has a help line (What / How / When) that folds to "?" once
   used and comes back with a tip where you struggled. Progress in j8_members.prefs.guide; skips + struggles in j8_memory (fact,
   onboarding). Settings → Guide replays it. Revert: git revert of the 15.4 commit.
   ===================================================================== */
(function () {
  'use strict';
  var VER = '15.4.0';
  try { localStorage.setItem('j8x:splash', String(Date.now())); } catch (e) {} /* the 14.x black splash stays off under 2.0 */
  var J = function () { return window.J8 || null; };
  var X = function () { return window.j8x || null; };
  var S = { sp: 'today', pick: {}, held: {}, gone: {}, arm: {}, open: {}, edit: null, editTx: '', talk: '', full: {}, bprev: null, busy: false, rankAt: 0, lintAt: 0, win: (function () { try { return localStorage.getItem('j8:win') === '7d' ? '7d' : '30d'; } catch (e) { return '30d'; } })(), fun: null, funAt: 0, funBusy: false, funErr: false };
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
      soonGo: 'Hold', tplOk: 'Approved', tplWait: 'Waits for your OK', moreN: 'more like these', live: 'Live', offline: 'Offline', saved2: 'Saved copy', newV: 'New: J8NIX 2.0',
      eng: 'Engines', score: 'Score', window: 'Time window', w7d: '7 days', w30d: '30 days', engSub: 'Each engine, one number: replies.', waitFor: 'wait for you', moving: 'Moving', quiet: 'Quiet',
      fromSent: 'from {n} sent', noneSent: '{n} drafted, none sent yet', moreEng: 'more with nothing sent yet', call1: 'call', callN: 'calls', prop1: 'proposal', propN: 'proposals', paidW: 'paid', notCounted: 'Not counted yet', notYet: 'not yet', nowW: 'Now:', nextW: 'Next:', ncWhy: 'Counting starts when J8 drafts a message for this engine.',
      seeWait: 'See what waits', resting: 'Resting', restSub: 'Parked or hidden. Their numbers still count.', cohort30: 'Drafts made in the last 30 days, and where they are now.', cohort7: 'Drafts made in the last 7 days, and where they are now.',
      noPaidYet: 'No calls or money yet', early: 'still early', ladder: 'From draft to paid', rateNote: 'Each step shows how many of the step before. Small numbers stay as "X of N"; a percent shows only when the step before has 20 or more and this step has 5 or more.',
      byEng: 'By engine', general: 'General', money: 'Money', booked: 'Booked so far', goal: 'Goal', updated: 'Counted at',
      s_drafted: 'Drafted', s_approved: 'Approved', s_sent: 'Sent', s_replied: 'Replied', s_calls: 'Call', s_proposals: 'Proposal', s_paid: 'Paid',
      agents: 'Agents', agOn: 'agents on', allFine: 'Nothing failed on its last run.', quietN: '{n} quiet for over a day', quiet1: '1 quiet for over a day', never1: '1 never ran', neverN: '{n} never ran', noRunsYet: 'No active agent has run yet.', allOff: 'All agents are off.', run1: 'run in 24 h', quietW: 'Quiet', lastRan: 'Last ran', offFail: 'last run failed', needLook: 'need a look', needLook1: 'needs a look', runs24: 'runs in 24 h', failed24: 'failed',
      rtns: 'Your agents', rtnSub: 'Each one runs by itself on its schedule. Switch one off and it skips its next runs.', ranW: 'Ran', failedAt: 'Failed', offW: 'Off', noRun: 'No run yet', noRun7: 'No run in 7 days', runningW: 'Running…', nothingW: 'nothing to do',
      always: 'Always on', alwaysWhy: 'This one cannot be switched off here. Pause sending in Settings stops everything.', whatW: 'What it does', whenW: 'When', lastW: 'Last run', isOn: '{n} is on.', isOff: '{n} is off.',
      rcpts: 'What ran', rcptSub: 'Every run in the last 7 days, newest first.', probOnly: 'Problems only', allRuns: 'All', noRcpt: 'No runs in the last 7 days.', noProb: 'No problems in the last 7 days.', todayW: 'Today', yestW: 'Yesterday',
      startedW: 'Started', tookW: 'took', minW: 'min', proof: 'Open proof', showMore: 'Show more', st_ok: 'OK', st_failed: 'Failed', st_nothing: 'Nothing to do', st_run: 'Running', st_off: 'Off', st_none: 'No run', st_late: 'Quiet',
      kDesign: 'Pick a design', pickOne: 'Pick one', seeFull: 'See it full size', goPick: 'Go with {n}', pickFirst: 'Pick one first', noneOf: 'None of these', chose: 'Chosen: {n}.' },
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
      soonGo: 'המתנה', tplOk: 'מאושרת', tplWait: 'מחכה לאישור שלך', moreN: 'עוד כאלה', live: 'מחובר', offline: 'לא מחובר', saved2: 'עותק שמור', newV: 'חדש: J8NIX 2.0',
      eng: 'מנועים', score: 'תוצאות', window: 'טווח זמן', w7d: '7 ימים', w30d: '30 ימים', engSub: 'לכל מנוע מספר אחד: תשובות.', waitFor: 'מחכים לך', moving: 'בתנועה', quiet: 'שקט',
      fromSent: 'מתוך {n} שנשלחו', noneSent: 'טיוטות: {n}, עוד לא נשלח', moreEng: 'עוד מנועים שעוד לא שלחו', call1: 'שיחה', callN: 'שיחות', prop1: 'הצעה', propN: 'הצעות', paidW: 'שולמו', notCounted: 'עוד לא נספר', notYet: 'עוד לא', nowW: 'עכשיו:', nextW: 'הבא:', ncWhy: 'הספירה מתחילה כש-J8 מנסח הודעה למנוע הזה.',
      seeWait: 'מה מחכה', resting: 'במנוחה', restSub: 'מוקפאים או מוסתרים. המספרים שלהם עדיין נספרים.', cohort30: 'טיוטות מ-30 הימים האחרונים, ואיפה הן עכשיו.', cohort7: 'טיוטות מ-7 הימים האחרונים, ואיפה הן עכשיו.',
      noPaidYet: 'עוד אין שיחות או כסף', early: 'עוד מוקדם', ladder: 'מטיוטה לתשלום', rateNote: 'כל שלב מראה כמה מתוך השלב הקודם. מספרים קטנים נשארים כמו שהם (למשל 2 מתוך 23); אחוז מופיע רק כשבשלב הקודם יש 20 ומעלה ובשלב הזה 5 ומעלה.',
      byEng: 'לפי מנוע', general: 'כללי', money: 'כסף', booked: 'נסגר עד עכשיו', goal: 'יעד', updated: 'נספר בשעה',
      s_drafted: 'טיוטות', s_approved: 'אושרו', s_sent: 'נשלחו', s_replied: 'ענו', s_calls: 'שיחה', s_proposals: 'הצעה', s_paid: 'שולם',
      agents: 'סוכנים', agOn: 'סוכנים פועלים', allFine: 'אף סוכן לא נכשל בריצה האחרונה שלו.', quietN: '{n} לא רצו כבר יותר מיממה', quiet1: 'אחד לא רץ כבר יותר מיממה', neverN: '{n} עוד לא רצו', never1: 'אחד עוד לא רץ', noRunsYet: 'אף סוכן פעיל עוד לא רץ.', allOff: 'כל הסוכנים כבויים.', run1: 'ריצה ב-24 שעות', quietW: 'שקט', lastRan: 'רץ לאחרונה', offFail: 'הריצה האחרונה נכשלה', needLook: 'צריכים בדיקה', needLook1: 'צריך בדיקה', runs24: 'ריצות ב-24 שעות', failed24: 'נכשלו',
      rtns: 'הסוכנים שלך', rtnSub: 'כל אחד רץ לבד לפי הלוח שלו. כיבוי סוכן מדלג על הריצות הבאות שלו.', ranW: 'רץ', failedAt: 'נכשל', offW: 'כבוי', noRun: 'עוד לא רץ', noRun7: 'לא רץ 7 ימים', runningW: 'רץ עכשיו…', nothingW: 'לא היה מה לעשות',
      always: 'תמיד פועל', alwaysWhy: 'את הסוכן הזה אי אפשר לכבות כאן. השהיית שליחה בהגדרות עוצרת הכול.', whatW: 'מה הוא עושה', whenW: 'מתי', lastW: 'ריצה אחרונה', isOn: '{n} פועל.', isOff: '{n} כבוי.',
      rcpts: 'מה רץ', rcptSub: 'כל ריצה ב-7 הימים האחרונים, החדשה למעלה.', probOnly: 'רק בעיות', allRuns: 'הכול', noRcpt: 'אין ריצות ב-7 הימים האחרונים.', noProb: 'אין בעיות ב-7 הימים האחרונים.', todayW: 'היום', yestW: 'אתמול',
      startedW: 'התחיל', tookW: 'נמשך', minW: 'דק׳', proof: 'פתח הוכחה', showMore: 'הצג עוד', st_ok: 'תקין', st_failed: 'נכשל', st_nothing: 'לא היה מה לעשות', st_run: 'רץ', st_off: 'כבוי', st_none: 'לא רץ', st_late: 'שקט',
      kDesign: 'בחירת עיצוב', pickOne: 'בחר אחד', seeFull: 'לראות בגודל מלא', goPick: 'בחר ב־{n}', pickFirst: 'קודם בוחרים אחד', noneOf: 'אף אחד מאלה', chose: 'נבחר: {n}.' }
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
    var isD = function (c) { return c.k === 'ap' && c.a && c.a.kind === 'design'; }, pn = function (a) { var v = Number(a.pin != null ? a.pin : a.priority); return isNaN(v) ? 99 : v; };
    L = L.filter(isD).map(function (c) { return { k: 'design', id: c.id, a: c.a }; }).sort(function (a, b) { return pn(a.a) - pn(b.a) || String(a.a.created || '').localeCompare(String(b.a.created || '')); }).concat(L.filter(function (c) { return !isD(c); })); /* 15.3: design choices first */
    var A = L.filter(function (c) { return !S.held[c.id]; });
    return all ? A.concat(L.filter(function (c) { return S.held[c.id]; }).map(function (c) { c.wasHeld = 1; return c; })) : A;
  }
  function cardTitle(c) {
    if (c.k === 'batch') return cut(c.b.label, 70) + ' · ' + c.b.L.length;
    if (c.k === 'tk') return cut(c.t.title || c.t.id, 110);
    return whoOf(c.a);
  }
  function kindChip(c) {
    var m = { rep: ['k-rep', t('kReply')], batch: ['', t('kBatch')], ap: ['', isTpl(c.a) ? t('kTpl') : t('kDraft')], tk: ['k-tk', t('kStep')], hand: ['k-tk', t('kHand')], design: ['k-des', t('kDesign')] }[c.k] || ['', ''];
    return '<span class="kind ' + m[0] + '">' + esc(m[1]) + (c.wasHeld ? ' · ' + esc(t('held')) : '') + '</span>';
  }
  /* 15.3: design choice options: [{key,name,image,link}] from extra.options; one short phrase per option from the body line "<key> · <name> - <phrase>" or "<name> - <phrase>" */
  function fill(s, n) { return String(s).split('{n}').join(n); }
  function dOpts(a) {
    var lines = String(a.body || '').split('\n');
    return (Array.isArray(a.options) ? a.options : []).filter(function (o) { return o && o.key != null && o.name; }).slice(0, 6).map(function (o) {
      var k = String(o.key), nm = String(o.name), ln = lines.filter(function (l) { var x = l.trim(); return (x.indexOf(k) === 0 && /^\s*[\u00b7.)\-:]/.test(x.slice(k.length))) || (x.indexOf(nm) === 0 && /^\s*[\u00b7\-\u2013\u2014:(]/.test(x.slice(nm.length))); })[0] || '';
      var m = /\s[-\u2013\u2014:]\s+(.+)$/.exec(ln);
      return { key: k, name: String(o.name), image: link(o.image), link: link(o.link), say: m ? cut(m[1], 60) : '' };
    });
  }
  function dPick(a) { var k = S.pick[a.id] != null ? S.pick[a.id] : a.chosen != null ? String(a.chosen) : ''; return dOpts(a).some(function (o) { return o.key === k; }) ? k : ''; }
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
    } else if (c.k === 'design') {
      var da = c.a, O = dOpts(da), pk = dPick(da), po = O.filter(function (o) { return o.key === pk; })[0], dk = armed('st-' + da.id);
      if (da.subject && da.subject !== whoOf(da)) h += '<p class="why" dir="auto">' + esc(cut(da.subject, 120)) + '</p>';
      h += '<div class="opts" role="group" aria-label="' + esc(t('pickOne')) + '">' + O.map(function (o, i) {
        var on2 = o.key === pk;
        return '<div class="opt' + (on2 ? ' on' : '') + '"><button type="button" class="ob2" data-x="pick" data-id="' + esc(da.id) + '" data-w="' + esc(o.key) + '" aria-pressed="' + on2 + '">'
          + (o.image ? '<span class="pic"><img src="' + esc(o.image) + '" alt="" loading="' + (i ? 'lazy' : 'eager') + '" decoding="async"></span>' : '')
          + '<span class="on-l"><i class="dot" aria-hidden="true"></i><b dir="auto">' + esc(o.name) + '</b>' + (o.say ? '<small dir="auto">' + esc(o.say) + '</small>' : '') + '</span></button>'
          + (o.link ? '<a class="lnk sm" href="' + esc(o.link) + '" target="_blank" rel="noopener noreferrer">' + esc(t('seeFull')) + '<span class="sr"> · ' + esc(o.name) + '</span></a>' : '') + '</div>'; }).join('') + '</div>';
      h += '<div class="acts dz' + (inList ? ' one' : '') + '"><button type="button" class="b go" data-x="dgo" data-id="' + esc(da.id) + '"' + (po ? '' : ' disabled') + '>' + esc(po ? fill(t('goPick'), po.name) : t('pickFirst')) + (inList || !po ? '' : key('G')) + '</button>' + (hold || '')
        + '<button type="button" class="b stop' + (dk ? ' arm' : '') + '" data-x="stop" data-id="' + esc(da.id) + '">' + esc(dk ? t('tapStop') : t('noneOf')) + (inList ? '' : key('X')) + '</button></div>';
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
    var x = X(), L = deck(true), G = x ? safe(function () { return x.goingOut(); }, []).filter(function (a) { return a.kind !== 'design'; }) : [], O = x ? safe(function () { return x.sent30(); }, []) : [];
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
  /* ---------- 15.1 Engines + Score (backlog d-1125-02b). Numbers come only from public.j8_funnel (J8.funnel), j8_projects,
     j8_approvals and j8_money. Funnel = drafts made in the window and where they are now (a cohort). Small counts read as
     "X of N"; a percent shows only when N ≥ 20 (research: small samples look more certain than they are). ---------- */
  var STG = ['drafted', 'approved', 'sent', 'replied', 'calls', 'proposals', 'paid'];
  function win() { return S.win === '7d' ? '7d' : '30d'; }
  function pullFun() {
    var j = J(); if (!j || !j.funnel || !on() || S.funBusy || Date.now() - S.funAt < 6e4) return;
    S.funBusy = true;
    j.funnel().then(function (R) { S.funBusy = false; S.funAt = Date.now(); if (Array.isArray(R)) { S.fun = R; S.funErr = false; } else S.funErr = !S.fun; soon(); },
      function () { S.funBusy = false; S.funAt = Date.now(); S.funErr = !S.fun; soon(); });
  }
  function fsum(eng, w) {
    var o = { n: 0, value: 0 }; STG.forEach(function (k) { o[k] = 0; });
    (S.fun || []).forEach(function (r) { if (r.window !== (w || win()) || (eng && r.engine !== eng)) return; o.n++; STG.forEach(function (k) { o[k] += Number(r[k]) || 0; }); o.value += Number(r.value_ils) || 0; });
    return o;
  }
  function pidOf(product) { var P = safe(function () { return J().raw('projects'); }, {}) || {}, s = String(product || '').trim(); if (!s) return ''; if (P[s]) return s;
    return Object.keys(P).filter(function (id) { return String(P[id].name || '').trim().toLowerCase() === s.toLowerCase(); })[0] || s; }
  function engOf(c) { var a = c.a || (c.b && c.b.L && c.b.L[0]); return a ? pidOf(a.product) : c.t ? String(c.t.project_id || '') : ''; }
  function waitBy() { var o = {}; deck(true).forEach(function (c) { var e = engOf(c); if (e) o[e] = (o[e] || 0) + 1; }); return o; }
  function sent7By() { var o = {}, from = Date.now() - 7 * 864e5; aps().forEach(function (a) { var ts = pd(a.sent_at); if (a.status === 'sent' && !isTpl(a) && !isNaN(ts) && ts >= from) { var e = pidOf(a.product); o[e] = (o[e] || 0) + 1; } }); return o; }
  function ils(n) { return '₪' + Math.round(Number(n) || 0).toLocaleString('en-US'); }
  function usd(n) { n = Number(n) || 0; return '$' + (n >= 1e6 && n % 1e6 === 0 ? n / 1e6 + 'M' : Math.round(n).toLocaleString('en-US')); }
  function nOf(n, N) { return N >= 20 && n >= 5 ? Math.round(n / N * 100) + '%' : n + '\u00a0' + t('of') + '\u00a0' + N; }
  function winSeg() { return '<span class="seg win" role="group" aria-label="' + esc(t('window')) + '">' + ['7d', '30d'].map(function (w) { return '<button type="button" class="b sm" data-x="win" data-id="' + w + '" aria-pressed="' + (win() === w) + '">' + esc(t('w' + w)) + '</button>'; }).join('') + '</span>'; }
  function ladder(f, compact) {
    var top = Math.max(1, f.drafted);
    return '<ol class="lad' + (compact ? ' sm' : '') + '">' + STG.map(function (k, i) {
      var v = f[k], prev = i ? f[STG[i - 1]] : 0, w = i && v > 0 ? Math.max(1.5, v / top * 100) : 0; /* no bar on Drafted: it is always full */
      var rate = i && prev > 0 ? nOf(v, prev) : '';
      return '<li><span class="st">' + esc(t('s_' + k)) + '</span><b>' + v + '</b><span class="rt">' + esc(rate) + (k === 'paid' && f.value > 0 ? ' · ' + esc(ils(f.value)) : '') + '</span><i style="width:' + w.toFixed(2) + '%"></i></li>'; }).join('') + '</ol>';
  }
  function funState() { if (S.fun) return ''; if (!on() && !aps().length) return failed() ? '<button type="button" class="fail" data-x="retry">' + esc(t('fail')) + '</button>' : '<div class="skel" aria-label="' + esc(t('loading')) + '"></div>';
    return S.funErr ? '<button type="button" class="fail" data-x="funretry">' + esc(t('fail')) + '</button>' : '<div class="skel" aria-label="' + esc(t('loading')) + '"></div>'; }
  function cohortLine() { return t(win() === '7d' ? 'cohort7' : 'cohort30'); }
  function vEng() {
    pullFun();
    var h = '<h1 class="sr">' + esc(t('eng')) + '</h1><div class="hd"><p class="lead">' + esc(t('engSub')) + '</p>' + winSeg() + '</div>', st = funState();
    if (st) return h + st;
    var j = J(), all = safe(function () { return Object.keys(j.raw('projects')).map(function (id) { return Object.assign({ id: id }, j.raw('projects')[id]); }); }, []);
    var ord = function (a, b) { var x = Number(a.order), y = Number(b.order); return (isNaN(x) || a.order == null ? 99 : x) - (isNaN(y) || b.order == null ? 99 : y) || String(a.name).localeCompare(String(b.name)); };
    all = all.filter(function (p) { return p.status !== 'killed' && p.status !== 'done'; }).sort(ord);
    var act = all.filter(function (p) { return !p.hidden && p.status !== 'parked'; }), rest = all.filter(function (p) { return p.hidden || p.status === 'parked'; });
    var WB = waitBy(), S7 = sent7By();
    var row = function (p) {
      var f = fsum(p.id), any = fsum(p.id, '30d').drafted + fsum(p.id, '7d').drafted > 0, wt = WB[p.id] || 0, mv = S7[p.id] || 0, op = S.open['e:' + p.id];
      var stw = wt ? '<span class="stw sw-w">' + wt + ' ' + esc(t('waitFor')) + '</span>' : mv ? '<span class="stw sw-m">' + esc(t('moving')) + '</span>' : '<span class="stw sw-q">' + esc(t('quiet')) + '</span>';
      var ph = any && !f.sent ? t('noneSent').replace('{n}', f.drafted) : any ? t('fromSent').replace('{n}', f.sent) + (f.calls ? ' · ' + f.calls + '\u00a0' + t(f.calls === 1 ? 'call1' : 'callN') : '') + (f.paid ? ' · ' + f.paid + '\u00a0' + t('paidW') : '') : t('notCounted');
      var kpi = any ? '<span class="kpi"><b>' + f.replied + '</b><small>' + esc(t(f.replied === 1 ? 'repW1' : 'repW')) + '</small></span>' : '<span class="kpi nc"><b aria-hidden="true">–</b></span>';
      var bd = '';
      if (op) {
        bd = '<div class="bd eng">' + (p.now ? '<p><b>' + esc(t('nowW')) + '</b> <span dir="auto">' + esc(cut(p.now, 240)) + '</span></p>' : '') + (p.next ? '<p><b>' + esc(t('nextW')) + '</b> <span dir="auto">' + esc(cut(p.next, 240)) + '</span></p>' : '')
          + (any ? '<p class="meta">' + esc(cohortLine()) + '</p>' + ladder(f, true) : '<p class="meta">' + esc(t('ncWhy')) + '</p>')
          + (wt ? '<div class="sub"><button type="button" class="lnk" data-x="sp" data-id="queue">' + esc(t('seeWait')) + ' (' + wt + ')</button></div>' : '') + '</div>';
      }
      return '<details class="row er"' + (op ? ' open' : '') + ' data-k="e:' + esc(p.id) + '"><summary><span class="nt" style="--nc:' + esc(/^#[0-9a-f]{3,8}$/i.test(p.color || '') ? p.color : '#7E86A6') + '" aria-hidden="true"></span><span class="ph"><b dir="auto">' + esc(cut(p.name || p.id, 48)) + '</b><small>' + stw + ' · <span dir="auto">' + esc(ph) + '</span></small></span>' + kpi + chev() + '</summary>' + bd + '</details>';
    };
    h += '<section class="grp"><div class="rows">' + (act.length ? act.map(row).join('') : '<p class="empty">' + esc(t('none')) + '</p>') + '</div></section>';
    if (rest.length) h += '<details class="grp fold"' + (S.open.rest ? ' open' : '') + ' data-k="rest"><summary><h2>' + esc(t('resting')) + ' · ' + rest.length + '</h2>' + chev() + '</summary>' + (S.open.rest ? '<p class="meta">' + esc(t('restSub')) + '</p><div class="rows">' + rest.map(row).join('') + '</div>' : '') + '</details>';
    return h;
  }
  function vScore() {
    pullFun();
    var h = '<h1 class="sr">' + esc(t('score')) + '</h1><div class="hd"><p class="lead">' + esc(cohortLine()) + '</p>' + winSeg() + '</div>', st = funState();
    if (st) return h + st;
    var f = fsum(), j = J(), m = safe(function () { return j.money.summary(); }, null), P = safe(function () { return j.raw('projects'); }, {}) || {};
    var lead = f.paid ? f.paid + ' ' + t('paidW') + ' · ' + ils(f.value) : f.proposals ? f.proposals + '\u00a0' + t(f.proposals === 1 ? 'prop1' : 'propN') : f.calls ? f.calls + '\u00a0' + t(f.calls === 1 ? 'call1' : 'callN') : t('noPaidYet');
    h += '<div class="tick sc"><b>' + f.replied + '</b><span><em>' + esc(t(f.replied === 1 ? 'repW1' : 'repW')) + ' ' + esc(t('fromSent').replace('{n}', f.sent)) + '</em><small>' + esc(lead) + (win() === '7d' ? ' · ' + esc(t('early')) : '') + '</small></span></div>';
    h += '<section class="grp"><h2>' + esc(t('ladder')) + '</h2><div class="panel">' + ladder(f) + '<p class="meta">' + esc(t('rateNote')) + '</p></div></section>';
    var E = {}; (S.fun || []).forEach(function (r) { if (r.window === win()) E[r.engine] = 1; });
    var EL = Object.keys(E).map(function (e) { return { e: e, f: fsum(e) }; }).filter(function (x) { return x.f.drafted > 0; }).sort(function (a, b) { return b.f.sent - a.f.sent || b.f.drafted - a.f.drafted; });
    var erow = function (x) {
      var nm = P[x.e] ? P[x.e].name : x.e === 'p-general' ? t('general') : x.e;
      return '<div class="row"><div class="rh"><span class="ph"><b dir="auto">' + esc(cut(nm, 48)) + '</b><small>' + esc(t('s_drafted')) + ' ' + x.f.drafted + ' · ' + esc(t('s_sent')) + ' ' + x.f.sent + '</small></span><span class="kpi"><b>' + x.f.replied + '</b><small>' + esc(t(x.f.replied === 1 ? 'repW1' : 'repW')) + '</small></span></div></div>'; };
    var ES = EL.filter(function (x) { return x.f.sent > 0; }), EN = EL.filter(function (x) { return !x.f.sent; });
    if (EL.length) h += '<section class="grp"><h2>' + esc(t('byEng')) + '</h2><div class="rows">' + ES.map(erow).join('') + '</div>'
      + (EN.length ? '<details class="fold in2"' + (S.open.ens ? ' open' : '') + ' data-k="ens"><summary><h2>+ ' + EN.length + ' ' + esc(t('moreEng')) + '</h2>' + chev() + '</summary>' + (S.open.ens ? '<div class="rows">' + EN.map(erow).join('') + '</div>' : '') + '</details>' : '') + '</section>';
    if (m) h += '<section class="grp"><h2>' + esc(t('money')) + '</h2><div class="rows"><div class="row"><div class="rh"><span class="ph"><b>' + esc(t('booked')) + '</b><small>' + esc(m.goal_usd ? t('goal') + ' ' + usd(m.goal_usd) + (m.goal_date ? ' · ' + day(String(m.goal_date).slice(0, 10) + 'T12:00:00Z') + ' ' + String(m.goal_date).slice(0, 4) : '') : '') + '</small></span><span class="kpi"><b>' + esc(ils(m.booked_ils) + (m.booked_usd ? ' + ' + usd(m.booked_usd) : '')) + '</b></span></div></div></div></section>';
    return h + '<p class="meta foot">' + esc(t('updated')) + ' ' + esc(hm(S.funAt)) + '</p>';
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
      + row(esc(t('version')), 'J8NIX ' + VER, '') + '</div></section>' + guideSet();
    if (TP.length) h += '<section class="grp"><h2>' + esc(t('autopilot')) + '</h2><div class="rows">' + TP.map(function (a) {
      var m = a.autopilot && APW[a.autopilot] ? a.autopilot : 'ask', st = a.status || 'pending', ok = st === 'approved' || st === 'edited', s = safe(function () { return x.tplStats(a); }, { sent: 0, rep: 0 }), ak = armed('apl-' + a.id);
      return '<div class="row"><div class="rh" style="flex-wrap:wrap"><span class="ph" style="min-width:55%"><b dir="auto">' + esc(cut(tplName(a), 60)) + '</b><small>' + s.sent + ' ' + esc(t('tplLine')) + ' · ' + s.rep + ' ' + esc(t('tplRep')) + ' · ' + esc(ok ? t('tplOk') : t('tplWait')) + '</small></span><span class="seg">'
        + ['ask', 'hold', 'off'].map(function (w) { return '<button type="button" class="b sm' + (w === 'hold' && ak ? ' arm' : '') + '" data-x="apl" data-w="' + w + '" data-id="' + esc(a.id) + '" aria-pressed="' + (m === w) + '">' + esc(w === 'hold' && ak ? t('tapStop') : t(APW[w])) + '</button>'; }).join('') + '</span></div></div>'; }).join('') + '</div></section>';
    return h;
  }

  /* ---------- 15.2 Agents + Receipts (backlog d-1125-02c). Rows come only from public.j8_routines (J8.routines) and public.j8_runs (J8.runs).
     One status per agent, always glyph + word + colour (never colour alone); a switch only where the routine reads it (switchable);
     the switch acts at once with Undo (no confirm). Receipts = real runs of the last 7 days by day. ---------- */
  function nrm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9֐-׿]+/g, ' ').trim().split(' ').filter(Boolean).sort().join(' '); }
  function rtnList() { var j = J(); return safe(function () { return j.routines.list(); }, []) || []; }
  function runT(r) { var v = pd(r.ended || r.started); return isNaN(v) ? NaN : v; }
  function runsAll() { var j = J(); return (safe(function () { return j.runs.list(); }, []) || []).slice().sort(function (a, b) { return (runT(b) || 0) - (runT(a) || 0); }); } /* by parsed time: j8_runs mixes '…Z' and '… +00' text formats */
  function runSt(r) { var s = String(r.status || '').toLowerCase(); return /fail|error/.test(s) ? 'failed' : /nothing|skip/.test(s) ? 'nothing' : r.started && !r.ended && s !== 'ok' ? 'run' : 'ok'; }
  function runsOf(rt) { var k = [nrm(rt.arm), nrm(rt.name), nrm(rt.id)].filter(Boolean); return runsAll().filter(function (r) { return k.indexOf(nrm(r.arm)) > -1; }); }
  function ago(ts) {
    var d = ts - Date.now(), a = Math.abs(d), L = lang() === 'he' ? 'he' : 'en';
    if (a < 6e4) return t('now'); if (a >= 864e5) return day(ts) + ' ' + hm(ts);
    var n = a < 36e5 ? Math.round(a / 6e4) : Math.round(a / 36e5), u = a < 36e5 ? 'minute' : 'hour';
    if (L === 'he') return (d < 0 ? 'לפני ' : 'בעוד ') + (n === 1 ? (u === 'minute' ? 'דקה' : 'שעה') : n === 2 ? (u === 'minute' ? 'שתי דקות' : 'שעתיים') : n + (u === 'minute' ? ' דקות' : ' שעות')); /* ICU adds "(2)" after the Hebrew dual; write the natural words ourselves */
    try { return new Intl.RelativeTimeFormat(L, { numeric: 'auto', style: 'short' }).format(d < 0 ? -n : n, u);
    } catch (e) { return day(ts) + ' ' + hm(ts); }
  }
  function agState(rt) {
    var R = runsOf(rt), last = R[0] || null, lt = last ? runT(last) : NaN, st;
    var lf = !!(last && runSt(last) === 'failed');
    if (rt.enabled === false) st = 'off'; else if (!last) st = 'none'; else { st = runSt(last); if (st !== 'failed' && st !== 'run' && Date.now() - lt > 26 * 36e5) st = Date.now() - lt > 7 * 864e5 ? 'none' : 'late'; } /* quiet: no run for over a day (neutral, not an alarm) */
    var ph = st === 'off' ? t('offW') + (last && !isNaN(lt) ? ' · ' + (lf ? t('offFail') + ' ' : t('lastW').toLowerCase() + ' ') + ago(lt) : '') : st === 'none' ? (last ? t('noRun7') : t('noRun')) : st === 'run' ? t('runningW')
      : st === 'late' ? t('lastRan') + ' ' + ago(lt) : st === 'failed' ? t('failedAt') + ' ' + ago(lt) : t('ranW') + ' ' + ago(lt) + (st === 'nothing' ? ' · ' + t('nothingW') : '');
    return { st: st, ph: ph, last: last, lt: lt, bad: st === 'failed' || (st === 'off' && lf) };
  }
  function glyph(st) { /* a distinct shape per status, so it reads without colour */
    var P = { ok: '<path d="m5 12.5 4.2 4.2L19 7"/>', nothing: '<path d="M6 12h12"/>', failed: '<path d="M7 7l10 10M17 7 7 17"/>', run: '<circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>', off: '<path d="M9 6.5v11M15 6.5v11"/>', none: '<circle cx="12" cy="12" r="6"/>', late: '<path d="M12 7v5l3 2"/>' }[st] || '';
    return '<span class="gl g-' + st + '" aria-hidden="true"><svg viewBox="0 0 24 24">' + P + '</svg></span>';
  }
  function stWord(st) { return t({ ok: 'st_ok', nothing: 'st_nothing', failed: 'st_failed', run: 'st_run', off: 'st_off', none: 'st_none', late: 'st_late' }[st] || 'st_ok'); }
  function dayKey(ts) { try { return new Date(ts).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' }); } catch (e) { return new Date(ts).toISOString().slice(0, 10); } }
  function dayName(ts) { var k = dayKey(ts); return k === dayKey(Date.now()) ? t('todayW') : k === dayKey(Date.now() - 864e5) ? t('yestW') : day(ts); }
  function clean(s) { return String(s || '').replace(/^[\u{1F534}\u{1F7E0}\u{1F7E2}\u{1F7E1}⚪✅❌]\s*/u, ''); }
  function vAgents() {
    var RT = rtnList(), all = runsAll(), now = Date.now(), wk = now - 7 * 864e5;
    var h = '<h1 class="sr">' + esc(t('agents')) + '</h1>';
    if (!RT.length && !all.length) return h + (failed() ? '<button type="button" class="fail" data-x="retry">' + esc(t('fail')) + '</button>' : !on() ? '<div class="skel" aria-label="' + esc(t('loading')) + '"></div>' : '<p class="empty">' + esc(t('none')) + '</p>');
    var A = RT.map(function (r) { return { r: r, s: agState(r) }; }), bad = A.filter(function (x) { return x.s.bad; }), en = A.filter(function (x) { return x.r.enabled !== false && !x.s.bad; }), never = en.filter(function (x) { return !x.s.last; }).length, quiet = en.filter(function (x) { return x.s.last && (x.s.st === 'late' || x.s.st === 'none'); }).length, ranOk = en.length - never - quiet, onN = RT.filter(function (r) { return r.enabled !== false; }).length;
    var d24 = all.filter(function (r) { var v = runT(r); return v >= now - 864e5 && v <= now + 6e4; });
    var sig = bad.length ? bad.length + ' ' + t(bad.length === 1 ? 'needLook1' : 'needLook') + ': ' + bad.map(function (x) { return x.r.name || x.r.id; }).join(', ') : !en.length ? t('allOff') : !ranOk && !quiet && never ? t('noRunsYet')
      : (ranOk ? t('allFine') : '') + ((quiet || never) ? (ranOk ? ' ' : '') + [quiet ? t(quiet === 1 ? 'quiet1' : 'quietN').replace('{n}', quiet) : '', never ? t(never === 1 ? 'never1' : 'neverN').replace('{n}', never) : ''].filter(Boolean).join(', ') + '.' : '');
    var sg = bad.length ? 'failed' : !en.length ? 'off' : quiet || never ? 'late' : 'ok'; /* the tick only when every active agent ran recently and nothing failed */
    h += '<div class="tick ag"><b>' + onN + '</b><span><em>' + esc(t('agOn')) + '</em><small>' + d24.length + ' ' + esc(t(d24.length === 1 ? 'run1' : 'runs24')) + '</small></span></div>';
    h += '<p class="sig' + (bad.length ? ' bad' : '') + '">' + glyph(sg) + '<span dir="auto">' + esc(sig) + '</span></p>' + pulse();
    A = bad.concat(A.filter(function (x) { return !x.s.bad; })); /* what needs a look comes first */
    h += '<section class="grp agl"><h2>' + esc(t('rtns')) + ' · ' + RT.length + '</h2><p class="meta top0">' + esc(t('rtnSub')) + '</p><div class="rows">' + A.map(function (x) {
      var r = x.r, s = x.s, op = S.open['a:' + r.id], nid = 'rn-' + String(r.id).replace(/[^a-z0-9_-]/gi, '');
      var sw = r.switchable ? '<button type="button" class="sw" role="switch" aria-checked="' + (r.enabled !== false) + '" aria-labelledby="' + nid + '" data-x="rsw" data-id="' + esc(r.id) + '"><i aria-hidden="true"></i></button>' : '<span class="fix">' + esc(t('always')) + '</span>';
      var bd = '';
      if (op) {
        var lr = s.last;
        bd = '<div class="bd ag" id="ab-' + nid + '">' + (r.what ? '<p><b>' + esc(t('whatW')) + ':</b> <span dir="auto">' + esc(cut(r.what, 300)) + '</span></p>' : '') + (r.schedule ? '<p><b>' + esc(t('whenW')) + ':</b> <span dir="auto">' + esc(cut(r.schedule, 120)) + '</span></p>' : '')
          + (lr ? '<p><b>' + esc(t('lastW')) + ':</b> ' + esc(stWord(runSt(lr))) + ' · ' + esc(ago(runT(lr))) + (lr.summary ? ' · <span dir="auto">' + esc(cut(clean(lr.summary), 240)) + '</span>' : '') + '</p>' : '')
          + (!r.switchable ? '<p class="meta">' + esc(t('alwaysWhy')) + '</p>' : '') + '</div>';
      }
      return '<div class="row rt' + (r.enabled === false ? ' is-off' : '') + '"><div class="rh"><button type="button" class="rx" data-x="aexp" data-id="' + esc(r.id) + '" aria-expanded="' + !!op + '"' + (op ? ' aria-controls="ab-' + nid + '"' : '') + '>' + glyph(s.st)
        + '<span class="ph"><b dir="auto" id="' + nid + '">' + esc(cut(r.name || r.id, 48)) + '</b><small>' + (s.st !== 'ok' ? '' : '<span class="sr">' + esc(stWord(s.st)) + ': </span>') + '<span dir="auto">' + esc(s.ph) + '</span></small></span>' + chev() + '</button>' + sw + '</div>' + bd + '</div>';
    }).join('') + '</div></section>';
    var W7 = all.filter(function (r) { var v = runT(r); return !isNaN(v) && v >= wk && v <= now + 6e4; }), PB = W7.filter(function (r) { return runSt(r) === 'failed'; });
    var L = S.prob ? PB : W7, n = S.rcN || 30, last = '', body = '', NM = {};
    RT.forEach(function (r) { [r.arm, r.id, r.name].forEach(function (k) { if (nrm(k)) NM[nrm(k)] = r.name || r.id; }); }); /* a run shows its agent's plain name when it has one */
    L.slice(0, n).forEach(function (r) {
      var v = runT(r), dk = dayKey(v), st = runSt(r), op = S.open['r:' + r.id], lk = link(r.link);
      if (dk !== last) { if (last) body += '</div>'; body += '<h3 class="dh">' + esc(dayName(v)) + '</h3><div class="rows">'; last = dk; }
      var bd = '';
      if (op) {
        var s0 = pd(r.started), e0 = pd(r.ended), mins = !isNaN(s0) && !isNaN(e0) && e0 >= s0 ? Math.max(1, Math.round((e0 - s0) / 6e4)) : 0;
        bd = '<div class="bd ag">' + (r.summary ? '<p dir="auto" class="full">' + esc(cut(clean(r.summary), 600)) + '</p>' : '') + '<p class="meta">' + esc(stWord(st)) + (!isNaN(s0) ? ' · ' + esc(t('startedW')) + ' ' + esc(hm(s0)) : '') + (mins ? ' · ' + esc(t('tookW')) + ' ' + mins + ' ' + esc(t('minW')) : '') + '</p>'
          + (lk ? '<div class="sub"><a class="lnk" href="' + esc(lk) + '" target="_blank" rel="noopener noreferrer">' + esc(t('proof')) + '</a></div>' : '') + '</div>';
      }
      body += '<details class="row rc' + (st === 'failed' ? ' is-bad' : '') + '"' + (op ? ' open' : '') + ' data-k="r:' + esc(r.id) + '"><summary>' + glyph(st) + '<span class="ph">' + (clean(r.summary) ? '<span class="sr">' + esc(stWord(st)) + ': </span>' : '') + '<b dir="auto">' + esc(cut(NM[nrm(r.arm)] || r.arm || '—', 40)) + '</b><small dir="auto">' + esc(cut(clean(r.summary) || stWord(st), 110)) + '</small></span><time datetime="' + esc(new Date(v).toISOString()) + '">' + esc(hm(v)) + '</time></summary>' + bd + '</details>';
    });
    if (last) body += '</div>';
    h += '<section class="grp"><div class="hd"><h2 class="h2">' + esc(t('rcpts')) + '</h2><span class="seg win" role="group" aria-label="' + esc(t('rcpts')) + '"><button type="button" class="b sm" data-x="prob" data-id="all" aria-pressed="' + !S.prob + '">' + esc(t('allRuns')) + ' ' + W7.length + '</button><button type="button" class="b sm" data-x="prob" data-id="bad" aria-pressed="' + !!S.prob + '">' + esc(t('probOnly')) + ' ' + PB.length + '</button></span></div>'
      + '<p class="meta top0">' + esc(t('rcptSub')) + '</p>' + (L.length ? body : '<p class="empty">' + esc(t(S.prob ? 'noProb' : 'noRcpt')) + '</p>')
      + (L.length > n ? '<div class="sub"><button type="button" class="lnk" data-x="rmore">' + esc(t('showMore')) + ' (' + (L.length - n) + ')</button></div>' : '') + '</section>';
    return h;
  }

  /* ---------- shell ---------- */
  var SP = [['today', 't-today'], ['queue', 't-queue'], ['eng', 't-eng'], ['score', 't-score'], ['talk', 't-talk'], ['agents', 't-agents'], ['set', 't-set']];
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
      return '<button type="button" class="tab' + (GS.tour > -1 && TOUR[GS.tour] && TOUR[GS.tour].lift.indexOf(s[0]) > -1 ? ' lift' : '') + '" data-x="sp" data-id="' + s[0] + '" style="--tc:var(--' + s[1] + ')"' + (S.sp === s[0] ? ' aria-current="page"' : '') + ' aria-keyshortcuts="' + (i + 1) + '">' + (s[0] === 'set' ? '<span class="tl">' + esc(t(s[0])) + '</span><svg class="cog" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>' : esc(t(s[0])))
        + (s[0] === 'today' && n ? '<em>' + n + '</em><span class="sr"> (' + n + ' ' + esc(t('waiting')) + ')</span>' : '') + '</button>'; }).join('') + '</nav>';
  }
  function busyTyping() { var a = sr && sr.activeElement; return !!(a && /^(TEXTAREA|INPUT)$/.test(a.tagName)); }
  function render(force) {
    if (!W) return;
    if (!force && busyTyping()) { pend = true; return; }
    pend = false;
    var y = window.scrollY;
    W.setAttribute('data-sp', S.sp); W.setAttribute('dir', lang() === 'he' ? 'rtl' : 'ltr'); W.setAttribute('lang', lang());
    if (gReady() && (needStart() || GS.fin)) { /* the guided start replaces the card file until it is finished or skipped */
      W.setAttribute('data-sp', 'start'); if (!GS.start) { GS.start = true; GS.step = 0; idleArm(); }
      C.innerHTML = topBar() + '<main class="folder gsf" id="j2main" tabindex="-1"><div class="in">' + vStart() + '</div></main>'; window.scrollTo(0, y); return;
    }
    var body = S.sp === 'queue' ? vQueue() : S.sp === 'eng' ? vEng() : S.sp === 'score' ? vScore() : S.sp === 'talk' ? vTalk() : S.sp === 'agents' ? vAgents() : S.sp === 'set' ? vSet() : vToday();
    C.innerHTML = topBar() + tabs() + '<main class="folder" id="j2main" tabindex="-1"><div class="in">' + (GS.tour > -1 ? tourSlip() : hintBar(S.sp)) + (S.sp === 'score' ? goalLine() : '') + body + '</div></main>'; /* the toast sits outside C, so a data refresh never wipes an Undo */
    window.scrollTo(0, y);
    if (S.edit) { var ta = sr.getElementById('j2ed'); if (ta && force === 'edit') { ta.focus(); } }
  }
  function soon() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; render(false); }); }
  function go(sp) { S.sp = sp; S.edit = null; render(true); window.scrollTo(0, 0); var m = sr.getElementById('j2main'); if (m) try { m.focus({ preventScroll: true }); } catch (e) {} }
  function say(msg, undo) {
    undoFn = undo || null; var el = sr.getElementById('j2t'); if (!el) return;
    el.setAttribute('dir', lang() === 'he' ? 'rtl' : 'ltr'); el.innerHTML = '<span dir="' + (lang() === 'he' ? 'rtl' : 'ltr') + '">' + esc(msg) + '</span>' + (undo ? '<button type="button" data-x="undo">' + esc(t('undo')) + '</button>' : '');
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
    if (x !== 'sp' && x !== 'rmore' && x !== 'full') rage(el);
    if (gAct(x, el)) return;
    if (x === 'sp') { if (GS.tour > -1) { GS.tour = -1; var gg = gLoad(); if (gg) { gg.tour = 'ended'; gSave(); } } go(id); return; }
    if (x === 'undo') { if (undoFn) { struggle(S.sp, 'undo'); var f = undoFn; undoFn = null; var te = sr.getElementById('j2t'); if (te) te.classList.remove('on'); f(); } return; }
    if (x === 'hold') { leave(id, 'hold', function () { S.held[id] = 1; render(true); say(t('heldT2'), function () { delete S.held[id]; render(true); }); }); return; }
    if (x === 'unhold') { S.held = {}; render(true); return; }
    if (x === 'win') { S.win = id === '7d' ? '7d' : '30d'; try { localStorage.setItem('j8:win', S.win); } catch (e) {} render(true); return; }
    if (x === 'funretry') { S.funAt = 0; S.funErr = false; render(true); return; }
    if (x === 'full') { S.full[id] = 1; render(true); return; }
    if (x === 'aexp') { S.open['a:' + id] = !S.open['a:' + id]; render(true); var bx = sr.querySelector('[data-x="aexp"][data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'); if (bx) bx.focus(); return; }
    if (x === 'prob') { S.prob = id === 'bad'; S.rcN = 30; render(true); return; }
    if (x === 'rmore') { S.rcN = (S.rcN || 30) + 30; render(true); return; }
    if (x === 'pick') { S.pick[id] = el.getAttribute('data-w') || ''; tone('hold'); render(true); var pb = sr.querySelector('[data-x="pick"][data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"][aria-pressed="true"]'); if (pb) pb.focus(); return; }
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
    if (x === 'dgo') {
      var d1 = apById(id); if (!d1 || !j.approvals.choose) return; var dk2 = dPick(d1), dn = (dOpts(d1).filter(function (o) { return o.key === dk2; })[0] || {}).name; if (!dk2) return;
      el.disabled = true;
      leave(id, 'go', function () {
        j.approvals.choose(id, dk2).then(function () { S.gone[id] = 1; delete S.pick[id]; render(true); say(fill(t('chose'), dn), function () { j.approvals.choose(id, null).then(function () { delete S.gone[id]; S.pick[id] = dk2; render(true); say(t('back')); }, fail); }); }, fail);
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
    if (x === 'rsw') {
      var rr = rtnList().filter(function (r) { return String(r.id) === id; })[0]; if (!rr || !rr.switchable || !j.routines) return;
      if (S.swBusy) return; var nv = rr.enabled === false; el.disabled = true; S.swBusy = true; tone(nv ? 'go' : 'stop');
      j.routines.set(id, nv).then(function () { S.swBusy = false; render(true); var b2 = sr.querySelector('[data-x="rsw"][data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'); if (b2) b2.focus();
        say(t(nv ? 'isOn' : 'isOff').replace('{n}', rr.name || id), function () { j.routines.set(id, !nv).then(function () { render(true); say(t(!nv ? 'isOn' : 'isOff').replace('{n}', rr.name || id)); }, fail); }); }, function (e) { S.swBusy = false; fail(e); }); return;
    }
    if (x === 'apl') {
      var aw = el.getAttribute('data-w'), at = apById(id); if (!at || !APW[aw]) return;
      if (aw === 'hold') { var ak = 'apl-' + id; if (!armed(ak)) { arm(ak); return; } delete S.arm[ak]; }
      if (!j.approvals.setAutopilot) return; el.disabled = true;
      j.approvals.setAutopilot(id, aw).then(function () { render(true); say(t('saved')); }, fail); return;
    }
  }

  /* ---------- 15.4 Guide (backlog d-1125-05): a 3-step guided start, a 4-stop tour you launch yourself, a help slip on every space.
     Research + sources: j8/design/V20-NOTES.md (15.4). Progress per user: j8_members.prefs.guide through J8.prefs.set (own row only) with a
     local copy; skips and struggles go to j8_memory (kind fact, tags onboarding) once each, and the next hints adapt to them.
     Caps: at most one hint opens by itself per session, at most 3 times per space, never again after "Hide"; a hint folds to "?" once
     you have used that space. Settings → Guide replays any of it. ---------- */
  var GT = {
    en: { welcome: 'Welcome to J8NIX', wsub: '3 quick questions so J8 works your way. About a minute.', stepOf: 'Step {n} of 3', skipAll: 'Skip setup', skipStep: 'Skip this', next: 'Next', back: 'Back', finish: 'Finish',
      s1: 'Who you are', s2: 'Your goal', s3: 'Your channels', name: 'Your name', role: 'What you do', why1: 'So J8 writes like you and puts your work first.',
      r_founder: 'Founder', r_sales: 'Sales', r_ops: 'Operations', r_mkt: 'Marketing', r_other: 'Other',
      g_replies: 'More replies', g_calls: 'Book calls', g_paid: 'Get paid', g_time: 'Save my time', own: 'In your words (optional)', why2: 'J8 puts what moves this goal first, and Score tracks it.',
      c_email: 'Email', c_li: 'LinkedIn', c_wa: 'WhatsApp', c_ig: 'Instagram', c_phone: 'Phone', why3: 'Pick the ones you use. J8 only says connected when it really is.', setupNeeded: 'Picked · not set up yet', emailOk: 'Connected · sending works', emailBad: 'Connected · sending stopped, see Agents', emailNone: 'No send recorded yet',
      setT: 'You are set.', setP: 'J8 has your answers. Want a quick look around?', tourGo: 'Show me around · 4 stops', startW: 'Start working', askTeam: 'Ask the team to set up {c}',
      askMsg: 'Please set up {c} for J8NIX sending.', yourGoal: 'Your goal', yourCh: 'Channels', skipped: 'Skipped',
      stop: 'Stop {n} of 4', endTour: 'End tour', tourDone: 'Tour done. Tap ? on any space for help.',
      t1h: 'Today', t1: 'The next thing that needs you, one card at a time. Go sends it, Hold moves it back, Stop drops it.',
      t2h: 'Queue', t2: 'Everything waiting, what is going out now, and who answered.',
      t3h: 'Engines and Score', t3: 'Engines: one number per line of work. Score: from draft to paid, with real counts only.',
      t4h: 'Talk, Agents and Settings', t4: 'Talk to J8 and the team, see every agent run, pause anything. This guide lives in Settings.',
      how: 'How it works', hide: 'Hide', help: 'Help', hWhat: 'What', hHow: 'How', hWhen: 'When', tip: 'Tip',
      guide: 'Guide', redo: 'Set up again', redoP: 'Who you are, your goal, your channels.', tourOnly: 'Show me around', tourP: '4 stops, about a minute.', hintsAgain: 'Show hints again', hintsP: 'Brings back every help line you hid.',
      tipsOn: 'Help lines on screens', resetT: 'Hints are back.', notSet: 'Not set yet', goalLine: 'Your goal: {g}', inW: 'in {w}' },
    he: { welcome: 'ברוך הבא ל-\u2060J8NIX', wsub: '3 שאלות קצרות כדי ש-J8 יעבוד בדרך שלך. בערך דקה.', stepOf: 'שלב {n} מתוך 3', skipAll: 'דלג על ההגדרה', skipStep: 'דלג על זה', next: 'הבא', back: 'חזרה', finish: 'סיום',
      s1: 'מי אתה', s2: 'המטרה שלך', s3: 'הערוצים שלך', name: 'השם שלך', role: 'מה אתה עושה', why1: 'כדי ש-J8 יכתוב כמוך וישים את העבודה שלך קודם.',
      r_founder: 'מייסד', r_sales: 'מכירות', r_ops: 'תפעול', r_mkt: 'שיווק', r_other: 'אחר',
      g_replies: 'יותר תשובות', g_calls: 'לקבוע שיחות', g_paid: 'לקבל תשלום', g_time: 'לחסוך לי זמן', own: 'במילים שלך (לא חובה)', why2: 'J8 ישים קודם את מה שמקדם את המטרה, והתוצאות יעקבו אחריה.',
      c_email: 'אימייל', c_li: 'לינקדאין', c_wa: 'וואטסאפ', c_ig: 'אינסטגרם', c_phone: 'טלפון', why3: 'בחר את מה שאתה משתמש בו. J8 יגיד "מחובר" רק כשזה באמת מחובר.', setupNeeded: 'נבחר · עוד לא הוגדר', emailOk: 'מחובר · השליחה עובדת', emailBad: 'מחובר · השליחה נעצרה, ראה סוכנים', emailNone: 'עוד לא נרשמה שליחה',
      setT: 'הכול מוכן.', setP: 'J8 קיבל את התשובות שלך. רוצה סיור קצר?', tourGo: 'תראה לי · 4 עצירות', startW: 'להתחיל לעבוד', askTeam: 'לבקש מהצוות להגדיר: {c}',
      askMsg: 'בבקשה להגדיר את {c} לשליחה מ-J8NIX.', yourGoal: 'המטרה שלך', yourCh: 'ערוצים', skipped: 'דילגת',
      stop: 'עצירה {n} מתוך 4', endTour: 'סיום הסיור', tourDone: 'הסיור הסתיים. הקש ? בכל מסך לעזרה.',
      t1h: 'היום', t1: 'הדבר הבא שמחכה לך, כרטיס אחד בכל פעם. "שלח" שולח, "דחה" מעביר לסוף, "עצור" מוריד.',
      t2h: 'בתור', t2: 'כל מה שמחכה, מה יוצא עכשיו ומי ענה.',
      t3h: 'מנועים ותוצאות', t3: 'מנועים: מספר אחד לכל תחום עבודה. תוצאות: מטיוטה ועד תשלום, רק מספרים אמיתיים.',
      t4h: 'שיחה, סוכנים והגדרות', t4: 'לדבר עם J8 והצוות, לראות כל ריצה של סוכן, להשהות כל דבר. המדריך הזה נמצא בהגדרות.',
      how: 'איך זה עובד', hide: 'הסתר', help: 'עזרה', hWhat: 'מה', hHow: 'איך', hWhen: 'מתי', tip: 'טיפ',
      guide: 'מדריך', redo: 'להגדיר מחדש', redoP: 'מי אתה, המטרה, הערוצים.', tourOnly: 'תראה לי', tourP: '4 עצירות, בערך דקה.', hintsAgain: 'להחזיר את שורות העזרה', hintsP: 'מחזיר כל שורת עזרה שהסתרת.',
      tipsOn: 'שורות עזרה במסכים', resetT: 'שורות העזרה חזרו.', notSet: 'עוד לא הוגדר', goalLine: 'המטרה שלך: {g}', inW: 'ב-{w}' }
  };
  function gt(k) { var L = GT[lang()]; return L[k] != null ? L[k] : GT.en[k] != null ? GT.en[k] : k; }
  /* help slip per space: one phrase, then What / How (≤3 steps) / When, and a tip shown only where you struggled */
  var HELP = {
    en: {
      today: { one: 'The next decision, one card at a time.', what: 'Everything that needs you, money first.', how: ['Read the card.', 'Go sends it, Hold puts it at the back, Stop drops it.', 'Undo shows for 6 seconds at the top.'], when: 'Each morning, and when the Today tab shows a number.', tip: 'Not sure? Tap Hold. Nothing is sent and the card waits in Queue.' },
      queue: { one: 'Everything waiting, going out and answered.', what: 'The full list behind Today.', how: ['Tap a row to open it.', 'Going out: Kill stops a send in time.', 'Did they answer? Mark Replied, Call, Won or Lost.'], when: 'When you want the whole picture or to log a reply.', tip: 'Mark answers here: it teaches J8 what works.' },
      eng: { one: 'One number per engine: replies.', what: 'Each line of work and how it moves.', how: ['The word says the state: waits for you, Moving or Quiet.', 'Tap a row for now, next and its steps.', 'Resting engines are folded at the bottom.'], when: 'Weekly, to see which engine to push.', tip: 'Quiet just means nothing went out in 7 days, not that it broke.' },
      score: { one: 'From draft to paid, real counts only.', what: 'Drafts made in the window and where they are now.', how: ['Pick 7 or 30 days.', 'Each step shows how many of the step before.', 'Money booked is at the bottom.'], when: 'Weekly, to check the goal.', tip: 'Small numbers show as "X of N" on purpose: a percent would look surer than it is.' },
      talk: { one: 'Message J8 and the team.', what: 'One thread with J8 and the team.', how: ['Write what you need in plain words.', 'Send.', 'The answer lands here at the next inbox run.'], when: 'Any time you want something done.', tip: 'One ask per message gets the fastest answer.' },
      agents: { one: 'Every agent, its last run, a switch.', what: 'The agents that work for you and what they did.', how: ['The top line says if anything failed.', 'The switch turns an agent off, with Undo.', 'What ran lists every run of the last 7 days.'], when: 'When something looks stuck.', tip: 'Problems only shows just the failed runs.' },
      set: { one: 'Pause, language, sound, this guide.', what: 'How J8NIX works for you.', how: ['Pause sending stops everything going out.', 'Autopilot decides per saved message.', 'Guide replays the setup, the tour and hints.'], when: 'When you need to stop sending or change a setting.', tip: 'Pause sending is the one big brake. It is always safe.' }
    },
    he: {
      today: { one: 'ההחלטה הבאה, כרטיס אחד בכל פעם.', what: 'כל מה שמחכה לך, כסף קודם.', how: ['קרא את הכרטיס.', '"שלח" שולח, "דחה" מעביר לסוף, "עצור" מוריד.', '"בטל" מופיע למעלה ל-6 שניות.'], when: 'כל בוקר, וכשעל לשונית "היום" יש מספר.', tip: 'לא בטוח? הקש "דחה". שום דבר לא נשלח והכרטיס מחכה בתור.' },
      queue: { one: 'כל מה שמחכה, יוצא וענה.', what: 'הרשימה המלאה שמאחורי "היום".', how: ['הקש על שורה כדי לפתוח.', 'יוצא עכשיו: "בטל" עוצר שליחה בזמן.', 'הם ענו? סמן ענו, שיחה, נסגר או לא רלוונטי.'], when: 'כשרוצים את התמונה המלאה או לרשום תשובה.', tip: 'סמן כאן תשובות: זה מלמד את J8 מה עובד.' },
      eng: { one: 'מספר אחד לכל מנוע: תשובות.', what: 'כל תחום עבודה ואיך הוא מתקדם.', how: ['המילה אומרת את המצב: מחכה לך, בתנועה או שקט.', 'הקש על שורה לראות עכשיו, הבא והשלבים.', 'מנועים במנוחה מקופלים למטה.'], when: 'פעם בשבוע, לבחור איזה מנוע לדחוף.', tip: '"שקט" רק אומר ששום דבר לא יצא 7 ימים, לא שמשהו נשבר.' },
      score: { one: 'מטיוטה ועד תשלום, רק מספרים אמיתיים.', what: 'טיוטות מהטווח ואיפה הן עכשיו.', how: ['בחר 7 או 30 ימים.', 'כל שלב מראה כמה מתוך השלב הקודם.', 'הכסף שנסגר מופיע למטה.'], when: 'פעם בשבוע, לבדוק את המטרה.', tip: 'מספרים קטנים מוצגים "X מתוך N" בכוונה: אחוז היה נראה בטוח יותר ממה שהוא.' },
      talk: { one: 'הודעה ל-J8 ולצוות.', what: 'שרשור אחד עם J8 והצוות.', how: ['כתוב מה צריך במילים פשוטות.', 'שלח.', 'התשובה מגיעה לכאן בריצת התיבה הבאה.'], when: 'בכל פעם שרוצים שמשהו ייעשה.', tip: 'בקשה אחת בכל הודעה מקבלת תשובה הכי מהר.' },
      agents: { one: 'כל סוכן, הריצה האחרונה, מתג.', what: 'הסוכנים שעובדים בשבילך ומה הם עשו.', how: ['השורה העליונה אומרת אם משהו נכשל.', 'המתג מכבה סוכן, עם ביטול.', '"מה רץ" מציג כל ריצה ב-7 הימים האחרונים.'], when: 'כשמשהו נראה תקוע.', tip: '"רק בעיות" מציג רק ריצות שנכשלו.' },
      set: { one: 'השהיה, שפה, צליל, המדריך הזה.', what: 'איך J8NIX עובד בשבילך.', how: ['"השהה שליחה" עוצר כל מה שיוצא.', 'טייס אוטומטי לכל הודעה שמורה.', '"מדריך" מריץ שוב הגדרה, סיור ועזרה.'], when: 'כשצריך לעצור שליחה או לשנות הגדרה.', tip: '"השהה שליחה" הוא הבלם הגדול. זה תמיד בטוח.' }
    }
  };
  function help(sp) { return (HELP[lang()] || HELP.en)[sp] || HELP.en[sp] || HELP.en.today; }
  var ROLES = ['founder', 'sales', 'ops', 'mkt', 'other'], GOALS = ['replies', 'calls', 'paid', 'time'], CHS = ['email', 'li', 'wa', 'ig', 'phone'];
  var TOUR = [{ sp: 'today', lift: ['today'], h: 't1h', p: 't1' }, { sp: 'queue', lift: ['queue'], h: 't2h', p: 't2' }, { sp: 'eng', lift: ['eng', 'score'], h: 't3h', p: 't3' }, { sp: 'agents', lift: ['talk', 'agents', 'set'], h: 't4h', p: 't4' }];
  var SPN = { today: 'today', queue: 'queue', eng: 'eng', score: 'score', talk: 'talk', agents: 'agents', set: 'set' };
  var GS = { g: null, uid: '', saveT: 0, autoShown: false, hintN: {}, step: 0, idleT: 0, idleK: '', tour: -1, start: false, fin: false, taps: [] };
  function uidOf() { var u = safe(function () { return J().auth.user(); }, null); return u && u.id ? String(u.id) : ''; }
  function gKey() { return 'j8:guide:' + GS.uid; }
  function gReady() { return on() && !!safe(function () { return J().orgs.current(); }, null) && !!uidOf(); }
  function gLoad() { /* the server copy wins; the local copy covers offline and a refused save */
    var uid = uidOf(); if (!uid) return null;
    if (GS.g && GS.uid === uid) return GS.g;
    GS.uid = uid; GS.start = false; GS.fin = false; GS.step = 0; GS.tour = -1; var srv = safe(function () { return J().prefs.get().guide; }, null), loc = null;
    try { loc = JSON.parse(localStorage.getItem(gKey()) || 'null'); } catch (e) {}
    var a = srv && typeof srv === 'object' ? srv : null, b = loc && typeof loc === 'object' ? loc : null;
    GS.g = Object.assign({ v: 1, seen: {}, used: {}, off: {}, auto: {}, str: {}, strAt: {}, logged: {}, tips: true }, (a && b ? (String(a.at || '') >= String(b.at || '') ? a : b) : a || b) || {});
    ['seen', 'used', 'off', 'auto', 'str', 'strAt', 'logged'].forEach(function (k) { if (!GS.g[k] || typeof GS.g[k] !== 'object') GS.g[k] = {}; });
    return GS.g;
  }
  function gSave(now) {
    var g = GS.g; if (!g) return; g.at = new Date().toISOString();
    try { localStorage.setItem(gKey(), JSON.stringify(g)); } catch (e) {}
    clearTimeout(GS.saveT);
    var push = function () { var j = J(); if (j && j.prefs && on()) j.prefs.set({ guide: g }).catch(function () {}); };
    if (now) push(); else GS.saveT = setTimeout(push, 1500);
  }
  /* j8_memory, kind fact, tag onboarding: one row per thing learned (logged keys stop repeats) */
  function gLearn(key, text, kind, tags) {
    var g = GS.g, j = J(); if (!g || g.logged[key] || !j || !j.memory || !on()) return;
    g.logged[key] = new Date().toISOString(); gSave();
    j.memory.add({ kind: kind || 'fact', text: 'Onboarding: ' + text, tags: ['onboarding'].concat(tags || []) }).catch(function () { delete g.logged[key]; });
  }
  var SPEN = { today: 'Today', queue: 'Queue', eng: 'Engines', score: 'Score', talk: 'Talk', agents: 'Agents', set: 'Settings' };
  function struggle(sp, why) {
    var g = gLoad(); if (!g || !SPN[sp]) return;
    g.str[sp] = (g.str[sp] || 0) + 1; g.strAt = g.strAt || {}; g.strAt[sp] = Date.now(); delete g.used[sp]; gSave(); /* the help line comes back for this space, with its tip */
    gLearn('str:' + sp + ':' + why, 'needed help on ' + SPEN[sp] + ' (' + ({ hint: 'opened its help twice', undo: 'pressed Undo right after a decision', back: 'went back in the tour', rage: 'tapped the same button 3 times fast', idle: 'paused over 20 s on a setup step' }[why] || why) + ')', 'fact', [sp]);
  }
  function needStart() { var g = gReady() ? gLoad() : null; return !!(g && !g.start); }
  function nameOf() { var g = GS.g, o = safe(function () { return J().orgs.current(); }, null); return (g && g.who && g.who.name) || (o && o.me) || ''; }
  function chipRow(list, pre, cur, multi, x) {
    return '<div class="chips" role="group">' + list.map(function (k) { var p = multi ? (cur || []).indexOf(k) > -1 : cur === k;
      return '<button type="button" class="b sm chip" data-x="' + x + '" data-id="' + k + '" aria-pressed="' + p + '">' + (p ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>' : '') + esc(gt(pre + k)) + '</button>'; }).join('') + '</div>';
  }
  function chState(c) { /* honest states only: email reads the real sender runs; the rest are picked, not connected */
    if (c !== 'email') return gt('setupNeeded');
    var x = X(), sd = x ? safe(function () { return x.sender ? x.sender() : null; }, null) : null;
    return !sd ? gt('emailNone') : sd.ok ? gt('emailOk') : gt('emailBad');
  }
  function vStart() {
    var g = gLoad() || {}, n = GS.step, names = ['s1', 's2', 's3'];
    var h = '<div class="gs"><div class="gsh"><div><h1 id="gsT" tabindex="-1">' + esc(GS.fin ? gt('setT') : gt('welcome')) + '</h1><p class="lead">' + esc(GS.fin ? gt('setP') : gt('wsub')) + '</p></div>'
      + (GS.fin ? '' : '<button type="button" class="lnk" data-x="g-skipall">' + esc(gt('skipAll')) + '</button>') + '</div>';
    if (!GS.fin) h += '<ol class="gsteps" aria-label="' + esc(gt('stepOf').replace('{n}', n + 1)) + '">' + names.map(function (k, i) {
      return '<li' + (i === n ? ' aria-current="step"' : '') + ' class="' + (i < n ? 'pst' : i === n ? 'cur' : '') + '"><i>' + (i + 1) + '</i><span>' + esc(gt(k)) + '</span></li>'; }).join('') + '</ol>';
    h += '<section class="card gcard" aria-labelledby="gsH">';
    if (GS.fin) {
      var who = g.who || {}, goal = g.goal || {}, ch = g.ch || [], need = ch.filter(function (c) { return c !== 'email'; });
      h += '<h2 class="sr" id="gsH">' + esc(gt('setT')) + '</h2><dl class="gsum">'
        + '<div><dt>' + esc(gt('s1')) + '</dt><dd dir="auto">' + esc(who.role ? [nameOf(), gt('r_' + who.role)].filter(Boolean).join(' · ') : (g.skip && g.skip.s1 ? gt('skipped') : nameOf() || gt('notSet'))) + '</dd></div>'
        + '<div><dt>' + esc(gt('yourGoal')) + '</dt><dd dir="auto">' + esc(goal.pick ? gt('g_' + goal.pick) + (goal.own ? ' · ' + goal.own : '') : goal.own || (g.skip && g.skip.s2 ? gt('skipped') : gt('notSet'))) + '</dd></div>'
        + '<div><dt>' + esc(gt('yourCh')) + '</dt><dd>' + (ch.length ? ch.map(function (c) { return '<span class="chl"><b>' + esc(gt('c_' + c)) + '</b> <small>· ' + esc(chState(c)) + '</small></span>'; }).join('') : esc(g.skip && g.skip.s3 ? gt('skipped') : gt('notSet'))) + '</dd></div></dl>'
        + '<div class="tear"></div><div class="acts two"><button type="button" class="b go" data-x="g-tour">' + esc(gt('tourGo')) + '</button><button type="button" class="b" data-x="g-done">' + esc(gt('startW')) + '</button></div>'
        + (need.length ? '<div class="sub"><button type="button" class="lnk" data-x="g-ask">' + esc(gt('askTeam').replace('{c}', need.map(function (c) { return gt('c_' + c); }).join(', '))) + '</button></div>' : '');
    } else {
      h += '<div class="ch"><span class="no">' + esc(gt('stepOf').replace('{n}', n + 1)) + '</span><h2 id="gsH">' + esc(gt(names[n])) + '</h2></div>';
      if (n === 0) h += '<label class="gl2" for="gName">' + esc(gt('name')) + '</label><input id="gName" class="gin" data-g="name" dir="auto" autocomplete="name" maxlength="60" value="' + esc(nameOf()) + '">'
        + '<p class="gl2" id="gRole">' + esc(gt('role')) + '</p>' + chipRow(ROLES, 'r_', (g.who || {}).role, false, 'g-role').replace('role="group"', 'role="group" aria-labelledby="gRole"') + '<p class="meta">' + esc(gt('why1')) + '</p>';
      if (n === 1) h += chipRow(GOALS, 'g_', (g.goal || {}).pick, false, 'g-goal').replace('role="group"', 'role="group" aria-labelledby="gsH"') + '<label class="gl2" for="gOwn">' + esc(gt('own')) + '</label><input id="gOwn" class="gin" data-g="own" dir="auto" maxlength="140" value="' + esc((g.goal || {}).own || '') + '"><p class="meta">' + esc(gt('why2')) + '</p>';
      if (n === 2) { var cs = g.ch || []; h += chipRow(CHS, 'c_', cs, true, 'g-ch').replace('role="group"', 'role="group" aria-labelledby="gsH"') + (cs.length ? '<ul class="chs">' + cs.map(function (c) { return '<li><b>' + esc(gt('c_' + c)) + '</b><span>' + esc(chState(c)) + '</span></li>'; }).join('') + '</ul>' : '') + '<p class="meta">' + esc(gt('why3')) + '</p>'; }
      h += '<div class="tear"></div><div class="acts gact">' + (n ? '<button type="button" class="b" data-x="g-back">' + esc(gt('back')) + '</button>' : '<span></span>')
        + '<button type="button" class="lnk" data-x="g-skip">' + esc(gt('skipStep')) + '</button><button type="button" class="b go" data-x="g-next">' + esc(gt(n === 2 ? 'finish' : 'next')) + '</button></div>';
    }
    return h + '</section></div>';
  }
  function idleArm() { /* a long pause on a setup step is a quiet "not sure" signal: recorded once per step */
    clearTimeout(GS.idleT); var k = 's' + (GS.step + 1);
    if (!GS.start || GS.fin) return;
    GS.idleT = setTimeout(function () { if (GS.start && !GS.fin && !document.hidden && 's' + (GS.step + 1) === k) gLearn('idle:' + k, 'paused over 20 s on the setup step "' + GT.en[k] + '"', 'fact', ['idle']); }, 20000);
  }
  function gField(name, v) { var g = gLoad(); if (!g) return; if (name === 'name') { g.who = g.who || {}; g.who.name = String(v || '').slice(0, 60); } if (name === 'own') { g.goal = g.goal || {}; g.goal.own = String(v || '').slice(0, 140); } idleArm(); }
  function gFinish() {
    var g = gLoad(); if (!g) return; g.start = 'done'; g.startAt = new Date().toISOString(); GS.fin = true; gSave(true);
    var who = g.who || {}, goal = g.goal || {}, ch = g.ch || [];
    if (who.role) gLearn('who:' + who.role + ':' + (who.name || ''), (who.name ? who.name + ' is ' : 'role: ') + SPENR(who.role), 'fact', ['who']);
    if (goal.pick || goal.own) gLearn('goal:' + (goal.pick || '') + ':' + (goal.own || ''), 'goal is ' + [goal.pick ? GT.en['g_' + goal.pick] : '', goal.own || ''].filter(Boolean).join(' — '), 'goal', ['goal']);
    if (ch.length) gLearn('ch:' + ch.join(','), 'uses ' + ch.map(function (c) { return GT.en['c_' + c]; }).join(', ') + (ch.filter(function (c) { return c !== 'email'; }).length ? ' (set up needed: ' + ch.filter(function (c) { return c !== 'email'; }).map(function (c) { return GT.en['c_' + c]; }).join(', ') + ')' : ''), 'fact', ['channels']);
    Object.keys(g.skip || {}).forEach(function (k) { if (g.skip[k]) gLearn('skip:' + k, 'skipped the step "' + GT.en[k] + '"', 'fact', ['skip']); });
  }
  function SPENR(r) { return (GT.en['r_' + r] || r).toLowerCase(); }
  function gStartOver() { var g = gLoad(); if (!g) return; delete g.start; g.skip = {}; GS.step = 0; GS.fin = false; GS.start = true; gSave(); render(true); focusG(); idleArm(); }
  function focusG() { setTimeout(function () { var e = sr.getElementById('gsT') || sr.getElementById('gtH'); if (e) try { e.focus({ preventScroll: true }); } catch (x) {} }, 30); }
  function tourAt(i) {
    GS.tour = i; GS.start = false; GS.fin = false;
    if (i < 0 || i >= TOUR.length) { GS.tour = -1; var g = gLoad(); if (g) { g.tour = i >= TOUR.length ? 'done' : 'ended'; gSave(); } go('today'); say(gt('tourDone')); return; }
    S.sp = TOUR[i].sp; S.edit = null; render(true); window.scrollTo(0, 0); focusG();
    var lv = sr.getElementById('j2live'); if (lv) lv.textContent = gt('stop').replace('{n}', i + 1) + ': ' + gt(TOUR[i].h);
  }
  function tourSlip() {
    var s = TOUR[GS.tour]; if (!s) return '';
    return '<section class="slip" role="dialog" aria-modal="false" aria-labelledby="gtH" aria-describedby="gtP"><div class="ch"><span class="no">' + esc(gt('stop').replace('{n}', GS.tour + 1)) + '</span><h2 id="gtH" tabindex="-1">' + esc(gt(s.h)) + '</h2></div>'
      + '<p id="gtP">' + esc(gt(s.p)) + '</p><div class="dots" aria-hidden="true">' + TOUR.map(function (x, i) { return '<i class="' + (i <= GS.tour ? 'on' : '') + '"></i>'; }).join('') + '</div>'
      + '<div class="acts gact">' + (GS.tour ? '<button type="button" class="b sm" data-x="t-back">' + esc(gt('back')) + '</button>' : '<span></span>') + '<button type="button" class="lnk" data-x="t-end">' + esc(gt('endTour')) + '</button>'
      + '<button type="button" class="b sm go" data-x="t-next">' + esc(gt(GS.tour === TOUR.length - 1 ? 'finish' : 'next')) + '</button></div></section>';
  }
  /* the help line at the top of every space: one phrase + "How it works"; folds to a small "?" once you have used the space */
  function hintBar(sp) {
    var g = gReady() ? gLoad() : null; if (!g || GS.tour > -1) return '';
    var H = help(sp), open = !!S.open['hint:' + sp], tipsOn = g.tips !== false, folded = !tipsOn || g.off[sp] || (g.used[sp] && !g.str[sp]);
    if (!g.seen[sp]) { g.seen[sp] = new Date().toISOString(); gSave(); }
    /* adaptive: where you struggled, the slip opens by itself once a session (max 1 a session, max 3 times a space, never after Hide) */
    if (!open && tipsOn && g.str[sp] && !g.off[sp] && !GS.autoShown && (g.auto[sp] || 0) < 3) { GS.autoShown = true; g.auto[sp] = (g.auto[sp] || 0) + 1; gSave(); open = S.open['hint:' + sp] = true; }
    var tip = g.str[sp] && H.tip ? '<p class="htip"><b>' + esc(gt('tip')) + '</b> ' + esc(H.tip) + '</p>' : '';
    var body = open ? '<div class="hslip" id="hs-' + sp + '"><dl><div><dt>' + esc(gt('hWhat')) + '</dt><dd>' + esc(H.what) + '</dd></div><div><dt>' + esc(gt('hHow')) + '</dt><dd><ol>' + H.how.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></dd></div><div><dt>' + esc(gt('hWhen')) + '</dt><dd>' + esc(H.when) + '</dd></div></dl>' + tip + '</div>' : '';
    if (folded && !open) return '<div class="hint fold1"><button type="button" class="qb" data-x="h-tog" data-id="' + sp + '" aria-expanded="false" aria-controls="hs-' + sp + '"><span aria-hidden="true">?</span><span class="sr">' + esc(gt('help')) + ': ' + esc(H.one) + '</span></button></div>';
    return '<div class="hint' + (open ? ' open' : '') + '"><div class="hrow"><span class="qm" aria-hidden="true">?</span><p>' + esc(H.one) + '</p><button type="button" class="lnk" data-x="h-tog" data-id="' + sp + '" aria-expanded="' + open + '" aria-controls="hs-' + sp + '">' + esc(gt('how')) + '</button>'
      + (folded ? '' : '<button type="button" class="lnk hx" data-x="h-off" data-id="' + sp + '">' + esc(gt('hide')) + '</button>') + '</div>' + body + '</div>';
  }
  function goalLine() { /* Score shows the goal you picked, against the real count for it */
    var g = gReady() ? gLoad() : null; if (!g || !g.goal || !g.goal.pick || g.goal.pick === 'time' || !S.fun) return '';
    var f = fsum(), k = { replies: 'replied', calls: 'calls', paid: 'paid' }[g.goal.pick], n = f[k] || 0;
    return '<p class="goal"><b>' + esc(gt('goalLine').replace('{g}', gt('g_' + g.goal.pick))) + '</b> · ' + esc(t('s_' + k)) + ': ' + n + ' ' + esc(gt('inW').replace('{w}', t(win() === '7d' ? 'w7d' : 'w30d'))) + '</p>';
  }
  function guideSet() { /* Settings → Guide */
    var g = gReady() ? gLoad() : null; if (!g) return '';
    var who = g.who || {}, goal = g.goal || {}, sum = [who.role ? gt('r_' + who.role) : '', goal.pick ? gt('g_' + goal.pick) : goal.own || '', (g.ch || []).map(function (c) { return gt('c_' + c); }).join(', ')].filter(Boolean).join(' · ');
    var row = function (b, s, r) { return '<div class="row"><div class="rh"><span class="ph"><b>' + esc(b) + '</b>' + (s ? '<small dir="auto">' + esc(s) + '</small>' : '') + '</span>' + r + '</div></div>'; };
    return '<section class="grp"><h2>' + esc(gt('guide')) + '</h2><div class="rows">'
      + row(gt('redo'), sum || gt('redoP'), '<button type="button" class="b sm" data-x="g-again">' + esc(gt('redo')) + '</button>')
      + row(gt('tourOnly'), gt('tourP'), '<button type="button" class="b sm" data-x="g-tour">' + esc(gt('tourOnly')) + '</button>')
      + row(gt('tipsOn'), '', '<span class="seg"><button type="button" class="b sm" data-x="g-tips" data-id="on" aria-pressed="' + (g.tips !== false) + '">' + esc(t('on')) + '</button><button type="button" class="b sm" data-x="g-tips" data-id="off" aria-pressed="' + (g.tips === false) + '">' + esc(t('off')) + '</button></span>')
      + row(gt('hintsAgain'), gt('hintsP'), '<button type="button" class="b sm" data-x="g-hints">' + esc(gt('hintsAgain')) + '</button>') + '</div></section>';
  }
  /* guide actions; returns true when it handled x */
  function gAct(x, el) {
    var id = el.getAttribute('data-id') || '', g = gLoad();
    if (!/^(g-|t-|h-)/.test(x)) { if (g && SPN[S.sp] && x !== 'sp' && x !== 'undo' && x !== 'ed-x') { var ch0 = false; if (!g.used[S.sp]) { g.used[S.sp] = new Date().toISOString(); ch0 = true; } if (g.str[S.sp] && !(g.strAt && Date.now() - (g.strAt[S.sp] || 0) < 864e5)) { g.str[S.sp] = 0; ch0 = true; } if (ch0) gSave(); } return false; }
    if (!g) return true;
    idleArm();
    if (x === 'g-role') { g.who = g.who || {}; g.who.role = g.who.role === id ? '' : id; gSave(); render(true); return true; }
    if (x === 'g-goal') { g.goal = g.goal || {}; g.goal.pick = g.goal.pick === id ? '' : id; gSave(); render(true); return true; }
    if (x === 'g-ch') { var c = (g.ch || []).slice(), i = c.indexOf(id); if (i > -1) c.splice(i, 1); else c.push(id); g.ch = CHS.filter(function (k) { return c.indexOf(k) > -1; }); gSave(); render(true); return true; }
    if (x === 'g-next' || x === 'g-skip') {
      var k = 's' + (GS.step + 1); g.skip = g.skip || {};
      var empty = k === 's1' ? !(g.who && g.who.role) : k === 's2' ? !(g.goal && (g.goal.pick || g.goal.own)) : !(g.ch && g.ch.length);
      g.skip[k] = x === 'g-skip' || empty; if (x === 'g-skip') { if (k === 's1') g.who = { name: (g.who || {}).name }; if (k === 's2') g.goal = {}; if (k === 's3') g.ch = []; }
      if (GS.step < 2) { GS.step++; gSave(); render(true); focusG(); } else { gFinish(); render(true); focusG(); }
      return true;
    }
    if (x === 'g-back') { if (GS.step) GS.step--; render(true); focusG(); return true; }
    if (x === 'g-skipall') { g.skip = { s1: !(g.who && g.who.role), s2: !(g.goal && (g.goal.pick || g.goal.own)), s3: !(g.ch && g.ch.length) }; if (!g.skip.s1 && !g.skip.s2 && !g.skip.s3) g.skip = { s1: true, s2: true, s3: true }; g.skipAll = true; gFinish(); gLearn('skipall', 'skipped the guided start', 'fact', ['skip']); GS.fin = false; GS.start = false; render(true); return true; }
    if (x === 'g-done') { GS.fin = false; GS.start = false; clearTimeout(GS.idleT); go('today'); return true; }
    if (x === 'g-tour') { clearTimeout(GS.idleT); if (!g.start) { g.start = 'skipped'; gSave(); } tourAt(0); return true; }
    if (x === 'g-ask') { var need = (g.ch || []).filter(function (c) { return c !== 'email'; }); GS.fin = false; GS.start = false; S.talk = gt('askMsg').replace('{c}', need.map(function (c) { return gt('c_' + c); }).join(', ')); go('talk'); setTimeout(function () { var ta = sr.querySelector('textarea[data-say]'); if (ta) { ta.value = S.talk; ta.focus(); } }, 40); return true; }
    if (x === 'g-again') { gStartOver(); return true; }
    if (x === 'g-tips') { g.tips = id !== 'off'; gSave(); render(true); return true; }
    if (x === 'g-hints') { g.off = {}; g.used = {}; g.auto = {}; g.tips = true; gSave(); render(true); say(gt('resetT')); return true; }
    if (x === 't-next') { tourAt(GS.tour + 1); return true; }
    if (x === 't-back') { if (GS.tour > 0) { struggle(TOUR[GS.tour - 1].sp, 'back'); tourAt(GS.tour - 1); } return true; }
    if (x === 't-end') { tourAt(-1); return true; }
    if (x === 'h-tog') {
      var k2 = 'hint:' + id, was = !!S.open[k2]; S.open[k2] = !was;
      if (!was) { GS.hintN[id] = (GS.hintN[id] || 0) + 1; if (GS.hintN[id] === 2) struggle(id, 'hint'); }
      render(true); var b = sr.querySelector('[data-x="h-tog"][data-id="' + id + '"]'); if (b) b.focus(); return true;
    }
    if (x === 'h-off') { g.off[id] = new Date().toISOString(); S.open['hint:' + id] = false; gSave(); render(true); var q = sr.querySelector('[data-x="h-tog"][data-id="' + id + '"]'); if (q) q.focus(); return true; }
    return true;
  }
  function rage(el) { /* 3 taps on the same button within 1.5 s */
    var now = Date.now(); GS.taps = GS.taps.filter(function (x) { return now - x.t < 1500; }); GS.taps.push({ t: now, el: el });
    if (GS.taps.filter(function (x) { return x.el === el; }).length >= 3) { GS.taps = []; struggle(S.sp, 'rage'); }
  }

  /* ---------- keyboard (registered before j13's handler so 2.0 owns the keys while it is in front) ---------- */
  window.addEventListener('keydown', function (e) {
    if (!document.body.classList.contains('j2')) return;
    e.stopImmediatePropagation();
    var tgt = e.composedPath ? e.composedPath()[0] : e.target, typing = tgt && /^(TEXTAREA|INPUT|SELECT)$/.test(tgt.tagName);
    if (typing) { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { var b = sr.querySelector(tgt.dataset.say ? '[data-x="say"]' : '[data-x="ed-save"]'); if (b) b.click(); } if (e.key === 'Escape' && S.edit) { S.edit = null; render(true); } return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (GS.tour > -1 && e.key === 'Escape') { e.preventDefault(); tourAt(-1); return; }
    if (GS.start || GS.fin) return; /* the guided start owns the screen: no space keys */
    if (/^[1-7]$/.test(e.key)) { if (GS.tour > -1) { GS.tour = -1; var gk = gLoad(); if (gk) { gk.tour = 'ended'; gSave(); } } go(SP[+e.key - 1][0]); e.preventDefault(); return; }
    if (S.sp !== 'today') return;
    var c = sr.querySelector('.deck .card'); if (!c) return;
    var sel = { g: '[data-x="go"],[data-x="dgo"]:not([disabled]),[data-x="batch-go"],[data-x="done"],[data-x="copyopen"]', h: '[data-x="hold"]', x: '[data-x="stop"]', e: '[data-x="ed"]' }[e.key.toLowerCase()];
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
    sr.innerHTML = '<link rel="stylesheet" href="j20w.css?v=' + VER + '"><div class="w" id="j2w"><div id="j2c"></div><div class="toast" id="j2t" role="status" aria-live="polite"></div><div class="sr" id="j2live" aria-live="polite"></div></div>';
    W = sr.getElementById('j2w'); C = sr.getElementById('j2c');
    document.body.appendChild(host);
    sr.addEventListener('click', function (e) { var el = e.target.closest && e.target.closest('[data-x]'); if (!el) { var sm = e.target.closest && e.target.closest('summary'); if (sm) { var d = sm.parentNode, k = d.getAttribute('data-k'); if (k) { e.preventDefault(); S.open[k] = !S.open[k]; render(true); } } return; } e.preventDefault(); act(el.getAttribute('data-x'), el); });
    sr.addEventListener('input', function (e) { var tg = e.target; if (tg.dataset.say) { S.talk = tg.value; tg.style.height = 'auto'; tg.style.height = Math.min(160, tg.scrollHeight) + 'px'; } else if (tg.dataset.ed) S.editTx = tg.value; else if (tg.dataset.g) gField(tg.dataset.g, tg.value); });
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
  window.j2 = { version: VER, state: S, guide: GS, deck: deck, go: go, render: function () { render(true); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
