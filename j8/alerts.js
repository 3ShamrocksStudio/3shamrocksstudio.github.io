/* J8NIX 11.5.0 alert rules (Dave, 18 Nov 10:59). Shared by the app (window.J8A) and the service worker (self.J8A).
   Pure functions, no DOM, no network. Phone pushes: at most 3 a day (Israel day), bundled into one notification,
   quiet 22:00–08:00 and on Shabbat (Fri 16:00 – Sat 19:00, Israel time), titles only, a seen alert never comes back. */
(function (G) {
  var TZ = 'Asia/Jerusalem', CAP = 3, W = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], F = null;
  function il(ms) {
    if (!F) F = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    var o = {}; F.formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; });
    return { day: o.year + '-' + o.month + '-' + o.day, wd: W.indexOf(o.weekday), h: +o.hour % 24, m: +o.minute };
  }
  /* '' = phone may ring; 'night' = 22:00–08:00; 'shabbat' = Fri 16:00 – Sat 19:00 */
  function quiet(ms) {
    var t = il(ms), mins = t.h * 60 + t.m;
    if ((t.wd === 5 && mins >= 16 * 60) || (t.wd === 6 && mins < 19 * 60)) return 'shabbat';
    if (t.h >= 22 || t.h < 8) return 'night';
    return '';
  }
  /* the first minute (on a 15-minute step) when the phone may ring again */
  function quietEnd(ms) { if (!quiet(ms)) return ms; var x = ms - (ms % 9e5) + 9e5; for (var k = 0; k < 200 && quiet(x); k++) x += 9e5; return x; }
  /* lock-screen text: the title only, never a message body, a person or an address */
  function titleOnly(s) {
    s = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\S+@\S+\.\S+/g, '').replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
    if (s.length > 60) s = s.slice(0, 59).replace(/[\s,;:·—-]+$/, '') + '…';
    return s || 'J8NIX';
  }
  function fresh(st, ms) {
    st = st && typeof st === 'object' ? st : {};
    var d = il(ms).day;
    if (st.day !== d) { st.day = d; st.loud = 0; }
    st.loud = +st.loud || 0; st.held = +st.held || 0; st.seen = Array.isArray(st.seen) ? st.seen : [];
    return st;
  }
  function bundle(n, he) { return he ? 'J8NIX · ' + n + ' עדכונים מחכים' : 'J8NIX · ' + n + (n === 1 ? ' update waits' : ' updates wait'); }
  /* one push in: decide how it shows. Returns {mode:'loud'|'quiet'|'cap'|'seen', title, silent, st} */
  function decide(st, item, ms) {
    st = fresh(st, ms); item = item || {};
    var key = String(item.key || item.tag || '') + '|' + titleOnly(item.title), seen = st.seen.indexOf(key) > -1, q = quiet(ms), mode;
    mode = seen ? 'seen' : q ? 'quiet' : st.loud >= CAP ? 'cap' : 'loud';
    if (!seen) { st.seen.push(key); if (st.seen.length > 300) st.seen = st.seen.slice(-300); }
    if (mode === 'loud') { st.loud++; st.held = 0; }
    else if (mode !== 'seen') st.held++;
    var title = mode === 'loud' ? titleOnly(item.title) : bundle(Math.max(1, st.held), item.he);
    return { mode: mode, title: title, silent: mode !== 'loud', quiet: q, st: st };
  }
  /* the app was opened: everything bundled so far counts as seen */
  function opened(st, ms) { st = fresh(st, ms); st.held = 0; return st; }
  G.J8A = { CAP: CAP, il: il, quiet: quiet, quietEnd: quietEnd, titleOnly: titleOnly, decide: decide, opened: opened, fresh: fresh };
})(typeof self !== 'undefined' ? self : this);
