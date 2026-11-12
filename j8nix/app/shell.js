/* J8NIX v4 shell: sign-in, install, alerts. All data goes through window.J8 (j8-data.js). */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  function msg(t, err) { var m = $('#msg'); m.textContent = t || ''; m.classList.toggle('err', !!err); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  function authView(paste) {
    $('#vReady').hidden = true; $('#vAuth').hidden = false;
    $('#fEmail').hidden = !!paste; $('#fPaste').hidden = !paste;
    $('#iosHint').hidden = !(ios && !standalone);
    $('#email').value = store('j8v4:email') || '';
  }
  function readyView() {
    var st = J8.status(), o = J8.orgs.current();
    $('#vAuth').hidden = true; $('#vReady').hidden = false;
    if (!o) { $('#hello').textContent = 'No business yet.'; $('#facts').innerHTML = ''; msg('Ask your workspace owner to invite ' + (st.user ? st.user.email : 'you') + '.'); return; }
    $('#hello').textContent = o.name;
    var f = [[J8.approvals.pending().length, 'waiting for your OK'], [J8.projects.list().length, 'projects'], [J8.inbox.list().length, 'messages with the team']];
    $('#facts').innerHTML = f.map(function (x) { return '<li><b>' + x[0] + '</b><span>' + x[1] + '</span></li>'; }).join('');
    var orgs = J8.orgs.list();
    $('#orgRow').hidden = orgs.length < 2;
    $('#orgSel').innerHTML = orgs.map(function (x) { return '<option value="' + x.id + '"' + (x.id === o.id ? ' selected' : '') + '>' + x.name.replace(/</g, '&lt;') + '</option>'; }).join('');
    $('#who').textContent = (st.user ? st.user.email : '') + ' · ' + (st.role || '');
    msg(st.connected ? '' : 'Offline. Showing the last copy.');
    pushLabel();
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
    J8.auth.signInWithLink($('#pasteLink').value).then(function () { $('#pasteLink').value = ''; msg(''); readyView(); })
      .catch(function () { msg('That link didn\'t work. Ask for a new one.', true); });
  });
  $('#signOut').addEventListener('click', function () { J8.auth.signOut().then(function () { authView(false); }); });
  $('#orgSel').addEventListener('change', function (e) { J8.orgs.use(e.target.value).then(readyView); });
  $('#pushBtn').addEventListener('click', function () {
    var b = this; b.disabled = true;
    J8.push.enable().then(function () {
      navigator.serviceWorker.ready.then(function (r) { r.showNotification('J8NIX alerts are on', { body: 'Approvals, replies and failed runs land here.', icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', tag: 'j8-test' }); });
      msg('Alerts on for this phone.');
    }).catch(function (er) { msg('Couldn\'t turn on alerts (' + er.code + ').', true); }).then(pushLabel);
  });
  ['approvals', 'projects', 'comments', 'status'].forEach(function (c) { J8.on(c, function () { if (!$('#vReady').hidden) readyView(); }); });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {});

  (async function boot() {
    var h = location.hash;
    if (h.indexOf('refresh_token=') > -1) { try { await J8.auth.signInWithLink(location.href); } catch (e) { msg('That sign-in link has expired. Ask for a new one.', true); } history.replaceState(null, '', location.pathname); }
    var ok = await J8.connect();
    if (J8.status().user) return readyView();
    var sent = Number(store('j8v4:sent') || 0);
    authView(sent && Date.now() - sent < 36e5);
    if (!ok && J8.status().error === 'no_org') readyView();
  })();
})();
