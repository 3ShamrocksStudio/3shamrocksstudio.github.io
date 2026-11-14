/* J8NIX PWA shell: sign-in, install, alerts, business switch. The screens (app.js) read data only through window.J8. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  function msg(t, err) { var m = $('#amsg'); m.textContent = t || ''; m.classList.toggle('err', !!err); }
  function note(t) { if (window.toast) window.toast(t); else msg(t); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  function authView(paste) {
    $('#app').hidden = true; $('#auth').hidden = false;
    $('#fEmail').hidden = !!paste; $('#fPaste').hidden = !paste;
    $('#iosHint').hidden = !(ios && !standalone);
    $('#email').value = store('j8v4:email') || '';
  }
  function readyView() {
    var st = J8.status(), o = J8.orgs.current(), bar = $('#status');
    $('#auth').hidden = true; $('#app').hidden = false; msg('');
    if (!o) { bar.hidden = false; bar.textContent = 'No business yet. Ask your workspace owner to invite ' + (st.user ? st.user.email : 'you') + '.'; }
    var orgs = J8.orgs.list();
    $('#orgRow').hidden = orgs.length < 2;
    $('#orgSel').innerHTML = orgs.map(function (x) { return '<option value="' + x.id + '"' + (o && x.id === o.id ? ' selected' : '') + '>' + String(x.name).replace(/</g, '&lt;') + '</option>'; }).join('');
    $('#who').textContent = (st.user ? st.user.email : '') + (st.role ? ' · ' + st.role : '');
    pushLabel();
    if (window.renderAll) window.renderAll();
  }
  async function pushLabel() {
    var b = $('#pushBtn');
    if (!J8.push.supported()) { b.disabled = true; b.textContent = ios && !standalone ? 'Add to Home Screen first' : 'Not on this browser'; return; }
    if (Notification.permission === 'denied') { b.disabled = true; b.textContent = 'Blocked in settings'; return; }
    b.disabled = false; b.textContent = (await J8.push.enabled()) ? 'On' : 'Turn on';
  }

  $('#fEmail').addEventListener('submit', function (e) {
    e.preventDefault(); msg('Sending…');
    J8.auth.sendLink($('#email').value).then(function () { store('j8v4:sent', String(Date.now())); msg(''); authView(true); })
      .catch(function (er) { msg(er.message || 'Could not send. Try again.', true); });
  });
  $('#again').addEventListener('click', function () { store('j8v4:sent', ''); msg(''); authView(false); });
  $('#fPaste').addEventListener('submit', function (e) {
    e.preventDefault(); msg('Signing in…');
    var code = $('#code').value.replace(/\D/g, ''), link = $('#pasteLink').value.trim();
    var go = code.length >= 6 ? J8.auth.verifyCode(store('j8v4:email'), code) : link ? J8.auth.signInWithLink(link) : Promise.reject({ code: 'empty' });
    go.then(function () { $('#pasteLink').value = ''; $('#code').value = ''; msg(''); readyView(); })
      .catch(function (er) { msg(er.code === 'empty' ? 'Type the code from the email.' : 'That didn\'t work. Check the code, or ask for a new email.', true); });
  });
  $('#signOut').addEventListener('click', function () { J8.auth.signOut().then(function () { authView(false); }); });
  $('#orgSel').addEventListener('change', function (e) { J8.orgs.use(e.target.value).then(readyView); });
  $('#pushBtn').addEventListener('click', function () {
    var b = this; b.disabled = true;
    J8.push.enable().then(function () {
      navigator.serviceWorker.ready.then(function (r) { r.showNotification('J8NIX alerts are on', { body: 'Team replies, finished work and drafts to OK land here.', icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', tag: 'j8-test' }); });
      note('Alerts on for this phone.');
    }).catch(function (er) { note('Couldn\'t turn on alerts (' + er.code + ').'); }).then(pushLabel);
  });
  J8.on('status', function (st) { if (st.error === 'signed_out' && !st.user) authView(false); });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {});

  (async function boot() {
    var h = location.hash;
    /* v6: a returning phone shows its last copy at once; connect() below refreshes it or falls back to sign-in */
    if (!/[?&]token_hash=/.test(location.search) && h.indexOf('refresh_token=') < 0 && J8.warm && J8.warm()) { $('#auth').hidden = true; $('#app').hidden = false; }
    if (/[?&]token_hash=/.test(location.search)) { try { await J8.auth.signInWithLink(location.href); } catch (e) { msg('That sign-in link has expired. Ask for a new one.', true); } history.replaceState(null, '', location.pathname); }
    if (h.indexOf('refresh_token=') > -1) { try { await J8.auth.signInWithLink(location.href); } catch (e) { msg('That sign-in link has expired. Ask for a new one.', true); } history.replaceState(null, '', location.pathname); }
    var ok = await J8.connect();
    if (J8.status().user) return readyView();
    var sent = Number(store('j8v4:sent') || 0);
    authView(sent && Date.now() - sent < 36e5);
    if (!ok && J8.status().error === 'no_org') readyView();
  })();
})();
