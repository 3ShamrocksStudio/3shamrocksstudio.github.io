/* J8NIX v4 · installable ops app. Real data only (Supabase, RLS per org). */
(function () {
  'use strict';
  var SB_URL = 'https://otkvebgrdiayjnqrytrn.supabase.co';
  // Public anon key (safe in the browser; every table is locked by row-level security).
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90a3ZlYmdyZGlheWpucXJ5dHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExOTEzMzQsImV4cCI6MjEwNjc2NzMzNH0.-A1KuUXMBx9NMBwUnZx0cS4TwJkjDz86yok5BcEcKsE';
  var FN = SB_URL + '/functions/v1';
  var VER = '4.0.0';
  var STAGES = ['Concept', 'Build', 'Staged', 'Validate', 'Monetize', 'Paying'];
  var ACK = 'Got it — the team picks this up within the hour.';

  var sb = window.supabase.createClient(SB_URL, SB_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'j8nix-v4-auth' }
  });

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var S = { user: null, orgs: [], org: null, role: null, me: '', d: null, aSeg: 'wait', aIdx: 0, editing: false, scope: 'all', openProj: {}, openEarlier: {} };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function linkify(s) {
    return esc(s).replace(/https?:\/\/[^\s<)]+[^\s<).,;:!?'"]/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u.replace(/^https?:\/\/(www\.)?/, '').slice(0, 48) + (u.length > 60 ? '…' : '') + '</a>'; });
  }
  function clip(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; }
  function lines(t) { return String(t || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean); }
  function splitTime(l) { var m = /^(\d{1,2}:\d{2}|\d{1,2} \w{3} \d{1,2}:\d{2})\s*[—·-]\s*(.*)$/.exec(l); return m ? { t: m[1], x: m[2] } : { t: '', x: l }; }
  function hhmm(iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); }
  function dayOf(iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }); }
  function rankOf(r) { var o = { owner: 4, admin: 3, member: 2, viewer: 1 }; return o[r] || 0; }
  function can(r) { return rankOf(S.role) >= rankOf(r); }

  var toastT;
  function toast(txt, undo) {
    var t = $('#toast'); $('#toastTxt').textContent = txt;
    var b = $('#toastUndo'); b.hidden = !undo; b.onclick = function () { t.hidden = true; undo(); };
    t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, undo ? 8000 : 3500);
  }

  /* ---------------- auth ---------------- */
  function show(id) {
    ['auth', 'home', 'approve', 'chat', 'projects'].forEach(function (s) { $('#s-' + s).hidden = s !== id; });
    $('#tabs').hidden = id === 'auth' || id === 'home';
    $('#top').hidden = id === 'auth';
    document.querySelectorAll('#tabs a').forEach(function (a) { a.classList.toggle('on', a.dataset.t === id); });
    if (id !== 'approve') $('#aActions').innerHTML = '';
    window.scrollTo(0, 0);
  }

  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function standalone() { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }

  function authScreen(step) {
    show('auth');
    $('#iosHint').hidden = !(isIOS() && !standalone());
    var paste = step === 'paste';
    $('#fEmail').hidden = paste; $('#fPaste').hidden = !paste;
    if (!paste) $('#email').value = store('j8v4:email') || '';
  }
  function authMsg(t, err) { var m = $('#authMsg'); m.textContent = t || ''; m.classList.toggle('err', !!err); }

  $('#fEmail').addEventListener('submit', async function (e) {
    e.preventDefault();
    var email = $('#email').value.trim().toLowerCase();
    if (!email) return;
    authMsg('Sending…');
    var r = await sb.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname } });
    if (r.error) { authMsg(r.error.message, true); return; }
    store('j8v4:email', email); store('j8v4:sent', String(Date.now()));
    authMsg(''); authScreen('paste');
  });
  $('#againEmail').addEventListener('click', function () { store('j8v4:sent', ''); authMsg(''); authScreen('email'); });

  async function signInFromText(text) {
    text = String(text || '').trim();
    var m = /(https?:\/\/\S+)/.exec(text); var url = m ? m[1] : text;
    var u; try { u = new URL(url); } catch (e) { u = null; }
    var hash = new URLSearchParams(u && u.hash ? u.hash.slice(1) : (text.indexOf('refresh_token=') > -1 ? text.split('#').pop() : ''));
    if (hash.get('refresh_token')) {
      var r1 = await sb.auth.setSession({ access_token: hash.get('access_token') || '', refresh_token: hash.get('refresh_token') });
      if (!r1.error) return true;
      r1 = await sb.auth.refreshSession({ refresh_token: hash.get('refresh_token') });
      return !r1.error;
    }
    var q = u ? u.searchParams : new URLSearchParams('');
    var th = q.get('token_hash') || q.get('token');
    if (!th) return false;
    var types = [q.get('type'), 'magiclink', 'email', 'signup'].filter(function (t, i, a) { return t && a.indexOf(t) === i; });
    for (var i = 0; i < types.length; i++) {
      var r = await sb.auth.verifyOtp({ token_hash: th, type: types[i] });
      if (!r.error) return true;
    }
    return false;
  }
  $('#fPaste').addEventListener('submit', async function (e) {
    e.preventDefault();
    authMsg('Signing in…');
    var ok = await signInFromText($('#pasteLink').value);
    if (!ok) { authMsg('That link didn\'t work. Ask for a new one.', true); return; }
    authMsg(''); $('#pasteLink').value = ''; boot();
  });

  async function fromUrl() {
    var h = location.hash;
    if (h.indexOf('refresh_token=') > -1 || h.indexOf('error=') > -1) {
      var ok = h.indexOf('refresh_token=') > -1 && await signInFromText(location.href);
      history.replaceState(null, '', location.pathname);
      if (!ok) authMsg('That sign-in link has expired. Ask for a new one.', true);
    }
    var q = new URLSearchParams(location.search);
    if (q.get('token_hash')) { await signInFromText(location.href); history.replaceState(null, '', location.pathname); }
  }

  $('#signOut').addEventListener('click', async function () {
    await sb.auth.signOut(); closeSettings(); S.user = null; S.d = null; authScreen('email');
  });

  /* ---------------- data ---------------- */
  async function loadOrgs() {
    try { await sb.rpc('j8_accept_invites'); } catch (e) { /* offline */ }
    var r = await sb.from('j8_members').select('role,display_name,org_id,j8_orgs(id,name,slug)').eq('user_id', S.user.id);
    if (r.error) throw r.error;
    S.orgs = (r.data || []).map(function (m) { return { id: m.org_id, name: m.j8_orgs ? m.j8_orgs.name : 'Business', role: m.role, me: m.display_name }; });
    var pick = store('j8v4:org');
    var o = S.orgs.filter(function (x) { return x.id === pick; })[0] || S.orgs[0] || null;
    setOrg(o);
  }
  function setOrg(o) {
    S.org = o ? o.id : null; S.role = o ? o.role : null;
    S.me = (o && o.me) || (S.user && S.user.email ? S.user.email.split('@')[0] : '');
    S.me = S.me.charAt(0).toUpperCase() + S.me.slice(1);
    if (o) store('j8v4:org', o.id);
    $('#orgName').textContent = o ? o.name : '';
    var snap = o && store('j8v4:snap:' + o.id);
    if (snap) { try { S.d = JSON.parse(snap); } catch (e) { S.d = null; } }
  }

  async function load() {
    if (!S.org) return;
    var org = S.org;
    var q = function (t, cols) { return sb.from(t).select(cols || '*').eq('org_id', org); };
    var res = await Promise.all([
      q('j8_units', 'id,parent_id,kind,name,code,sort').order('sort'),
      q('j8_projects').eq('hidden', false).order('order', { ascending: true, nullsFirst: false }),
      q('j8_approvals').neq('status', 'sent').order('rank', { ascending: true, nullsFirst: false }),
      q('j8_messages', 'id,p,unit_id,text,at,status,reply,author,version,updated_at').order('at', { ascending: true }),
      q('j8_runs', 'id,arm,started,ended,status,summary,link').order('started', { ascending: false }).limit(40),
      q('j8_money'), q('j8_control')
    ]);
    for (var i = 0; i < res.length; i++) if (res[i].error) throw res[i].error;
    S.d = { units: res[0].data, projects: res[1].data, approvals: res[2].data, messages: res[3].data, runs: res[4].data, money: res[5].data[0] || null, control: res[6].data[0] || null, at: Date.now() };
    store('j8v4:snap:' + org, JSON.stringify(S.d));
  }

  async function refresh(quiet) {
    try { await load(); setLive(); } catch (e) { setLive(true); if (!quiet) toast('Offline. Showing the last copy.'); }
    render();
  }
  function setLive(off) {
    var l = $('#live'), c = S.d && S.d.control;
    if (off || !navigator.onLine) { l.hidden = false; l.className = 'live off'; $('#liveTxt').textContent = 'Offline'; return; }
    if (c && c.paused) { l.hidden = false; l.className = 'live off'; $('#liveTxt').textContent = 'Paused'; return; }
    l.hidden = true;
  }

  /* ---------------- derived ---------------- */
  function pending() {
    var a = (S.d && S.d.approvals) || [];
    var t = a.filter(function (x) { return x.status === 'pending' && x.kind === 'template'; });
    var o = a.filter(function (x) { return x.status === 'pending' && x.kind !== 'template'; });
    return t.concat(o);
  }
  function queued() { return ((S.d && S.d.approvals) || []).filter(function (x) { return x.status === 'queued'; }); }
  function decided() {
    return ((S.d && S.d.approvals) || []).filter(function (x) { return ['approved', 'edited', 'killed'].indexOf(x.status) > -1; })
      .sort(function (a, b) { return String(b.decided_at || '').localeCompare(String(a.decided_at || '')); });
  }
  function proj(id) { return ((S.d && S.d.projects) || []).filter(function (p) { return p.id === id; })[0]; }
  function hasMove(p) { return p.you && !/^nothing/i.test(p.you.trim()); }
  function lastSeen() { var v = store('j8v4:seen:' + S.org); if (!v) { v = String(Date.now()); store('j8v4:seen:' + S.org, v); } return Number(v); }
  function unread() {
    var seen = lastSeen();
    return ((S.d && S.d.messages) || []).filter(function (m) {
      var l = lines(m.reply); var last = l[l.length - 1] || '';
      return last && last.indexOf(ACK) < 0 && new Date(m.updated_at).getTime() > seen;
    });
  }
  function verb(a) {
    if (a.kind === 'template') return 'Approve a template once';
    if (a.label === 'Send by hand') return 'Send this by hand';
    return { application: 'OK this application', email: 'OK this email', linkedin: 'OK this message', post: 'OK this post', invoice: 'OK this payment request' }[a.kind] || 'Decide on this';
  }

  /* ---------------- render ---------------- */
  function route() {
    var h = (location.hash || '').replace(/^#/, '');
    var parts = h.split('/');
    if (!S.user) return authScreen(store('j8v4:sent') && Date.now() - Number(store('j8v4:sent')) < 36e5 ? 'paste' : 'email');
    var noOrg = !S.org;
    document.querySelector('.doors').hidden = noOrg; $('#quickAsk').hidden = noOrg;
    if (noOrg) { show('home'); $('#hello').innerHTML = 'No business yet.<small>Ask your workspace owner to invite ' + esc(S.user.email) + '.</small>'; $('#next').hidden = true; return; }
    var v = ['approve', 'chat', 'projects'].indexOf(parts[0]) > -1 ? parts[0] : 'home';
    show(v);
    if (v === 'approve' && parts[1]) { var i = pending().map(function (x) { return x.id; }).indexOf(decodeURIComponent(parts[1])); if (i > -1) { S.aSeg = 'wait'; S.aIdx = i; } }
    if (v === 'chat' && parts[1]) S.scope = decodeURIComponent(parts[1]);
    render();
  }
  function current() { var h = (location.hash || '').replace(/^#/, '').split('/')[0]; return ['approve', 'chat', 'projects'].indexOf(h) > -1 ? h : 'home'; }

  function render() {
    if (!S.user || !S.org || !S.d) return;
    var v = current();
    counts();
    if (v === 'home') renderHome();
    if (v === 'approve') renderApprove();
    if (v === 'chat') renderChat();
    if (v === 'projects') renderProjects();
    setLive();
  }

  function counts() {
    var p = pending().length, u = unread().length, m = (S.d.projects || []).filter(hasMove).length;
    $('#bApprove').textContent = p || ''; $('#bChat').textContent = u || ''; $('#bProjects').textContent = '';
    return { p: p, u: u, m: m };
  }

  function renderHome() {
    var c = counts(), hr = new Date().getHours();
    var g = hr < 5 ? 'Late night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    var paused = S.d.control && S.d.control.paused;
    $('#hello').innerHTML = esc(g + ', ' + S.me + '.') + (paused ? '<small>Sending is paused. Turn it back on in settings.</small>' : '');

    var n = $('#next'); n.hidden = false; n.className = 'next';
    var tpl = pending();
    if (tpl.length) {
      var a = tpl[0], pj = proj(a.product);
      n.innerHTML = '<span class="k"><svg><use href="#i-next"/></svg>Next move · money first</span>' +
        '<h2>' + esc(verb(a)) + '</h2><p dir="auto">' + esc(clip(a.to, 90)) + '</p>' +
        (pj ? '<p class="why">' + esc(pj.name) + '</p>' : '') +
        '<a class="btn blue go" href="#approve/' + encodeURIComponent(a.id) + '">Open it<svg><use href="#i-next"/></svg></a>';
    } else {
      var mv = (S.d.projects || []).filter(hasMove)[0];
      if (mv) {
        var href = mv.you_link || mv.link || '#projects';
        n.innerHTML = '<span class="k"><svg><use href="#i-next"/></svg>Your move</span><h2>' + esc(mv.name) + '</h2><p dir="auto">' + esc(clip(mv.you, 110)) + '</p>' +
          '<a class="btn blue go" href="' + esc(href) + '"' + (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(mv.you_link_text || 'Open') + '<svg><use href="#i-next"/></svg></a>';
      } else {
        n.className = 'next calm';
        n.innerHTML = '<span class="k">Next move</span><h2>Nothing needs you.</h2><p>The team keeps going. Tell J8NIX anything below.</p>';
      }
    }
    $('#nApprove').textContent = c.p;
    var t = pending().filter(function (x) { return x.kind === 'template'; }).length;
    $('#tApprove').textContent = c.p ? (t ? t + ' templates first' : 'Money first') : 'All clear';
    $('#nChat').textContent = c.u || '';
    $('#tChat').textContent = c.u ? (c.u === 1 ? 'new reply' : 'new replies') : 'Talk to the team';
    $('#nProjects').textContent = c.m;
    $('#tProjects').textContent = c.m ? 'need your move' : (S.d.projects || []).length + ' running';
  }

  /* --- approve --- */
  function aList() { return S.aSeg === 'queue' ? queued() : S.aSeg === 'done' ? decided() : pending(); }
  function renderApprove() {
    var segs = [['wait', 'Waiting', pending().length], ['queue', 'Queued', queued().length], ['done', 'Decided', decided().length]];
    $('#aSeg').innerHTML = segs.filter(function (s) { return s[0] === 'wait' || s[2]; }).map(function (s) {
      return '<button data-s="' + s[0] + '" class="' + (S.aSeg === s[0] ? 'on' : '') + '">' + s[1] + ' ' + s[2] + '</button>';
    }).join('');
    var L = aList();
    if (S.aIdx >= L.length) S.aIdx = Math.max(0, L.length - 1);
    var a = L[S.aIdx];
    $('#aPos').innerHTML = L.length ? '<button id="aPrev" aria-label="Previous">‹</button> ' + (S.aIdx + 1) + ' / ' + L.length + ' <button id="aNext" aria-label="Next">›</button>' : '';
    var d = $('#draft'), act = $('#aActions');
    if (!a) {
      d.innerHTML = '<div class="empty"><b>' + (S.aSeg === 'wait' ? 'Nothing waiting.' : 'Empty.') + '</b>New drafts land here and ping your phone.</div>';
      act.innerHTML = ''; return;
    }
    var pj = proj(a.product);
    var hand = a.label === 'Send by hand';
    var kindTxt = a.kind === 'template' ? 'Template · approve once' : hand ? 'Send by hand' : (a.label || a.kind || 'Draft');
    var text = a.status === 'edited' && a.edited_body ? a.edited_body : a.body;
    var long = (text || '').length > 900;
    d.innerHTML =
      '<span class="kind ' + (a.kind === 'template' ? 'k-template' : hand ? 'k-hand' : '') + '">' + esc(kindTxt) + '</span>' +
      '<h2 dir="auto">' + esc(a.to || '') + '</h2>' +
      '<p class="via" dir="auto">' + esc(clip(a.channel, 72)) + (pj ? ' · ' + esc(pj.name) : '') + '</p>' +
      (a.warn ? '<p class="warn" dir="auto"><svg><use href="#i-risk"/></svg><span>' + esc(clip(a.warn, 220)) + '</span></p>' : '') +
      (a.subject ? '<p class="subj" dir="auto">' + esc(a.subject) + '</p>' : '') +
      (S.editing ? '<textarea id="editBox" dir="auto">' + esc(text) + '</textarea>' :
        '<div class="body' + (long ? ' clamp' : '') + '" id="dBody" dir="auto">' + esc(text) + '</div>' + (long ? '<button class="more" id="dMore">Show all</button>' : '')) +
      (a.link ? '<a class="btn open" href="' + esc(a.link) + '" target="_blank" rel="noopener"><svg><use href="#i-link"/></svg>' + esc(a.link_text || 'Open link') + '</a>' : '') +
      (a.result ? '<p class="meta" dir="auto">' + esc(clip(a.result, 160)) + '</p>' : '') +
      (S.aSeg !== 'wait' ? '<p class="meta">Status: ' + esc(a.status) + (a.decided_at ? ' · ' + esc(dayOf(a.decided_at) + ' ' + hhmm(a.decided_at)) : '') + (a.hold_until ? ' · sends after ' + esc(hhmm(a.hold_until)) : '') + '</p>' : '');
    var ro = !can('member');
    if (ro) { act.innerHTML = ''; return; }
    if (S.editing) {
      act.innerHTML = '<button class="kill" data-a="cancel">Cancel</button><button class="edit" data-a="none"></button><button class="send" data-a="saveSend"><svg><use href="#i-send"/></svg>Save &amp; send</button>';
    } else if (S.aSeg === 'queue') {
      act.innerHTML = '<button class="kill" data-a="kill"><svg><use href="#i-kill"/></svg>Kill</button><button class="edit" data-a="hold">Hold for me</button><button class="send gold" data-a="none">Sends after hold</button>';
    } else if (S.aSeg === 'done') {
      act.innerHTML = '<button class="kill" data-a="none"></button><button class="edit" data-a="none"></button><button class="send gold" data-a="back">Back to waiting</button>';
    } else if (a.kind === 'template') {
      act.innerHTML = '<button class="kill" data-a="kill"><svg><use href="#i-kill"/></svg>Kill</button><button class="edit" data-a="none"></button><button class="send gold" data-a="approve"><svg><use href="#i-approve"/></svg>Approve once</button>';
    } else if (hand) {
      act.innerHTML = '<button class="kill" data-a="kill"><svg><use href="#i-kill"/></svg>Kill</button><button class="edit" data-a="copy">Copy</button><button class="send" data-a="sent"><svg><use href="#i-done"/></svg>I sent it</button>';
    } else {
      act.innerHTML = '<button class="kill" data-a="kill"><svg><use href="#i-kill"/></svg>Kill</button><button class="edit" data-a="edit"><svg><use href="#i-edit"/></svg>Edit</button><button class="send" data-a="approve"><svg><use href="#i-send"/></svg>Send</button>';
    }
  }

  async function setApproval(a, patch, msg, undoPatch) {
    var r = await sb.from('j8_approvals').update(patch).eq('org_id', S.org).eq('id', a.id).eq('version', a.version).select('id');
    if (r.error) { toast('Not saved: ' + r.error.message); return false; }
    if (!r.data || !r.data.length) { toast('It changed elsewhere. Reloaded.'); await refresh(true); return false; }
    var cur = Object.assign({}, a, patch, { version: a.version + 1 });
    S.d.approvals = S.d.approvals.map(function (x) { return x.id === a.id ? cur : x; });
    render();
    if (msg) toast(msg, undoPatch ? function () { setApproval(cur, undoPatch, 'Back to waiting'); } : null);
    refresh(true);
    return true;
  }
  function decision(status, extra) {
    return Object.assign({ status: status, decided_at: new Date().toISOString(), decided_by: S.user.id }, extra || {});
  }
  var BACK = { status: 'pending', decided_at: null, decided_by: null };

  $('#s-approve').addEventListener('click', async function (e) {
    var seg = e.target.closest('[data-s]');
    if (seg) { S.aSeg = seg.dataset.s; S.aIdx = 0; S.editing = false; renderApprove(); return; }
    if (e.target.closest('#aPrev')) { move(-1); return; }
    if (e.target.closest('#aNext')) { move(1); return; }
    if (e.target.closest('#dMore')) { $('#dBody').classList.remove('clamp'); e.target.remove(); }
  });
  $('#aActions').addEventListener('click', async function (e) {
    var b = e.target.closest('[data-a]'); if (!b) return;
    var a = aList()[S.aIdx]; if (!a) return;
    var k = b.dataset.a;
    if (k === 'none') return;
    if (k === 'edit') { S.editing = true; renderApprove(); var t = $('#editBox'); if (t) t.focus(); return; }
    if (k === 'cancel') { S.editing = false; renderApprove(); return; }
    if (k === 'copy') {
      try { await navigator.clipboard.writeText(a.status === 'edited' && a.edited_body ? a.edited_body : a.body); toast('Copied. Paste it, send, then tap “I sent it”.'); }
      catch (err) { toast('Copy blocked: press and hold the text.'); }
      return;
    }
    b.disabled = true;
    if (k === 'approve') await setApproval(a, decision('approved'), a.kind === 'template' ? 'Template approved' : 'Approved · the team sends it', BACK);
    if (k === 'kill') await setApproval(a, decision('killed'), 'Killed · never sent', BACK);
    if (k === 'sent') await setApproval(a, decision('sent', { sent_at: new Date().toISOString(), result: 'Sent by hand (J8NIX)' }), 'Marked sent');
    if (k === 'hold') await setApproval(a, { status: 'pending' }, 'Held for your OK');
    if (k === 'back') await setApproval(a, BACK, 'Back to waiting');
    if (k === 'saveSend') {
      var txt = ($('#editBox') || {}).value || '';
      if (!txt.trim()) { b.disabled = false; return; }
      S.editing = false;
      await setApproval(a, decision('edited', { edited_body: txt }), 'Edited & approved', BACK);
    }
  });
  function move(dir) { var L = aList(); if (!L.length) return; S.editing = false; S.aIdx = (S.aIdx + dir + L.length) % L.length; renderApprove(); window.scrollTo(0, 0); }
  (function swipe() {
    var x0 = null, y0 = 0, el = $('#draft');
    el.addEventListener('touchstart', function (e) { if (S.editing) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
    }, { passive: true });
  })();

  /* --- chat --- */
  function scopes() {
    var out = [{ k: 'all', n: 'All' }, { k: 'p-general', n: 'General' }];
    (S.d.units || []).filter(function (u) { return u.kind !== 'business'; }).forEach(function (u) { out.push({ k: 'u:' + u.id, n: u.name, c: 'var(--slate)' }); });
    (S.d.projects || []).forEach(function (p) { out.push({ k: p.id, n: p.name, c: p.color }); });
    return out;
  }
  function inScope(m) {
    var s = S.scope;
    if (s === 'all') return true;
    if (s === 'p-general') return m.p === 'p-general' && !m.unit_id;
    if (s.indexOf('u:') === 0) return m.unit_id === s.slice(2);
    return m.p === s;
  }
  function renderChat() {
    var sc = scopes();
    if (!sc.some(function (x) { return x.k === S.scope; })) S.scope = 'all';
    $('#scope').innerHTML = sc.map(function (x) {
      return '<button data-k="' + esc(x.k) + '" class="' + (x.k === S.scope ? 'on' : '') + '">' + (x.c ? '<i style="--c:' + esc(x.c) + '"></i>' : '') + esc(clip(x.n, 26)) + '</button>';
    }).join('');
    var on = $('#scope .on'); if (on && on.scrollIntoView) on.scrollIntoView({ inline: 'center', block: 'nearest' });
    var msgs = (S.d.messages || []).filter(inScope);
    var html = '', lastDay = '';
    if (!msgs.length) html = '<li class="empty"><b>Talk to J8NIX.</b>Write or dictate. The team answers here.</li>';
    msgs.slice(-60).forEach(function (m) {
      var day = dayOf(m.at); if (day !== lastDay) { html += '<li class="day">' + esc(day) + '</li>'; lastDay = day; }
      var pj = S.scope === 'all' ? (m.p === 'p-general' ? null : proj(m.p)) : null;
      html += '<li class="mine"><span class="pip">You' + (pj ? ' · ' + esc(clip(pj.name, 22)) : '') + ' · ' + esc(hhmm(m.at)) + '</span><span class="st ' + esc(m.status) + '">' + ({ new: 'New', routed: 'On it', done: 'Done' }[m.status] || esc(m.status)) + '</span></li>';
      var L = lines(m.reply);
      if (L.length) {
        var last = splitTime(L[L.length - 1]), ack = last.x.indexOf(ACK) > -1, open = S.openEarlier[m.id];
        html += '<li class="reply"><span class="av"><svg><use href="#i-agent"/></svg></span><div class="bb' + (ack ? ' ack' : '') + '" dir="auto">' +
          (last.t ? '<small>' + esc(last.t) + '</small>' : '') + '<span class="lx' + (open ? '' : ' clamp') + '">' + linkify(last.x) + '</span>' +
          (L.length > 1 || last.x.length > 160 ? '<button class="earlier" data-m="' + esc(m.id) + '">' + (open ? 'Less' : 'More' + (L.length > 1 ? ' · ' + (L.length - 1) + ' earlier' : '')) + '</button>' : '') +
          (open ? '<div class="old">' + L.slice(0, -1).map(linkify).join('<br>') + '</div>' : '') + '</div></li>';
      }
    });
    $('#thread').innerHTML = html;
    store('j8v4:seen:' + S.org, String(Date.now()));
    counts();
    requestAnimationFrame(function () { window.scrollTo(0, document.body.scrollHeight); });
  }
  $('#scope').addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (!b) return; S.scope = b.dataset.k; renderChat(); });
  $('#thread').addEventListener('click', function (e) { var b = e.target.closest('.earlier'); if (!b) return; S.openEarlier[b.dataset.m] = !S.openEarlier[b.dataset.m]; renderChat(); });

  async function sendMsg(text, scope) {
    text = String(text || '').trim(); if (!text) return false;
    if (!can('member')) { toast('Viewers can read only.'); return false; }
    var p = 'p-general', unit = null;
    if (scope && scope !== 'all') { if (scope.indexOf('u:') === 0) unit = scope.slice(2); else p = scope; }
    var id = p + '-' + Date.now();
    var r = await sb.from('j8_messages').insert({ org_id: S.org, id: id, p: p, text: text, unit_id: unit });
    if (r.error) { toast('Not sent: ' + r.error.message); return false; }
    await refresh(true);
    var c = S.d.control;
    if (c && c.brain_enabled) {
      sb.auth.getSession().then(function (s) {
        var tok = s.data.session && s.data.session.access_token; if (!tok) return;
        fetch(FN + '/j8-brain', { method: 'POST', headers: { Authorization: 'Bearer ' + tok, apikey: SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ org_id: S.org, message_id: id }) })
          .then(function () { refresh(true); }).catch(function () {});
      });
    }
    return true;
  }
  $('#composer').addEventListener('submit', async function (e) {
    e.preventDefault(); var t = $('#msgText');
    if (await sendMsg(t.value, S.scope)) { t.value = ''; grow(); }
  });
  $('#msgText').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); $('#composer').requestSubmit(); } });
  function grow() { var t = $('#msgText'); t.style.height = 'auto'; t.style.height = Math.min(140, t.scrollHeight) + 'px'; }
  $('#msgText').addEventListener('input', grow);
  $('#quickAsk').addEventListener('submit', async function (e) {
    e.preventDefault(); var t = $('#quickText');
    if (await sendMsg(t.value, 'p-general')) { t.value = ''; S.scope = 'p-general'; location.hash = '#chat'; }
  });

  // voice dictation (Web Speech API where the browser has it)
  (function voice() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var mic = $('#mic'), lb = $('#lang');
    if (!SR) { mic.hidden = true; lb.hidden = true; return; }
    var lang = store('j8v4:lang') || (/^he/i.test(navigator.language) ? 'he-IL' : 'en-US');
    var paint = function () { lb.textContent = lang === 'he-IL' ? 'עב' : 'EN'; };
    paint();
    lb.addEventListener('click', function () { lang = lang === 'he-IL' ? 'en-US' : 'he-IL'; store('j8v4:lang', lang); paint(); });
    var rec = null;
    mic.addEventListener('click', function () {
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = lang; rec.interimResults = true; rec.continuous = true;
      var base = $('#msgText').value ? $('#msgText').value + ' ' : '';
      rec.onresult = function (ev) { var s = ''; for (var i = 0; i < ev.results.length; i++) s += ev.results[i][0].transcript; $('#msgText').value = base + s; grow(); };
      rec.onend = function () { mic.classList.remove('rec'); rec = null; };
      rec.onerror = function (ev) { toast(ev.error === 'not-allowed' ? 'Allow the microphone to dictate.' : 'Dictation stopped.'); };
      mic.classList.add('rec'); rec.start();
    });
  })();

  /* --- projects --- */
  function renderProjects() {
    var units = (S.d.units || []).filter(function (u) { return u.kind !== 'business'; });
    var P = S.d.projects || [];
    var groups = units.map(function (u) { return { u: u, ps: P.filter(function (p) { return p.unit_id === u.id; }) }; }).filter(function (g) { return g.ps.length; });
    groups.sort(function (a, b) { return (Number(a.ps[0].order) || 99) - (Number(b.ps[0].order) || 99); });
    var other = P.filter(function (p) { return !p.unit_id || !units.some(function (u) { return u.id === p.unit_id; }); });
    if (other.length) groups.push({ u: { id: 'none', name: 'Other' }, ps: other });
    $('#units').innerHTML = groups.map(function (g) {
      var moves = g.ps.filter(hasMove).length;
      return '<section class="unit"><h3>' + esc(g.u.name) + (g.u.code && g.u.code !== g.u.name ? ' <em>' + esc(g.u.code) + '</em>' : '') + (moves ? ' <em>· ' + moves + ' for you</em>' : '') + '</h3>' + g.ps.map(projRow).join('') + '</section>';
    }).join('') || '<div class="empty"><b>No projects yet.</b>The team adds them as work starts.</div>';
  }
  function stageMeter(s) {
    var h = '<span class="stage" aria-label="Stage ' + (s || 0) + ' of 6">';
    for (var i = 1; i <= 6; i++) h += '<i class="' + (s && i < s ? 'on' : s === i ? 'cur' : '') + '"></i>';
    return h + '<b>' + (s ? STAGES[s - 1] : '—') + '</b></span>';
  }
  function btnLink(href, label) {
    if (!href) return '';
    var ext = /^https?:/.test(href);
    return '<a class="btn small" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '><svg><use href="#i-link"/></svg>' + esc(clip(label || 'Open', 40)) + '</a>';
  }
  function projRow(p) {
    var open = S.openProj[p.id], mv = hasMove(p);
    return '<div class="proj' + (p.status === 'parked' ? ' parked' : '') + '" style="--c:' + esc(p.color || '#586475') + '">' +
      '<button data-p="' + esc(p.id) + '" aria-expanded="' + !!open + '"><span class="nm">' + esc(p.name) + (p.status === 'parked' ? ' · parked' : '') + '</span>' + stageMeter(p.stage) +
      '<span class="you' + (mv ? '' : ' none') + '" dir="auto">' + esc(mv ? clip(p.you, 80) : 'Nothing from you') + '</span></button>' +
      (open ? '<div class="open"><dl>' +
        (p.now ? '<dt>Now</dt><dd dir="auto">' + linkify(p.now) + '</dd>' : '') +
        (p.next ? '<dt>Next</dt><dd dir="auto">' + linkify(p.next) + '</dd>' : '') +
        (mv ? '<dt>Your move</dt><dd class="yourmove" dir="auto">' + linkify(p.you) + '</dd>' : '') + '</dl>' +
        '<div class="links">' + (mv && p.you_link ? btnLink(p.you_link, p.you_link_text) : '') + btnLink(p.link, p.link_text) +
        (p.links || []).map(function (l) { return btnLink(l.u, l.t); }).join('') +
        '<a class="btn small" href="#chat/' + encodeURIComponent(p.id) + '"><svg><use href="#i-chat"/></svg>Message the team</a></div></div>' : '') +
      '</div>';
  }
  $('#units').addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (!b) return; S.openProj[b.dataset.p] = !S.openProj[b.dataset.p]; renderProjects(); });

  /* ---------------- settings ---------------- */
  function openSettings() {
    var s = $('#settings'); s.hidden = false;
    $('#orgSel').innerHTML = S.orgs.map(function (o) { return '<option value="' + esc(o.id) + '"' + (o.id === S.org ? ' selected' : '') + '>' + esc(o.name) + '</option>'; }).join('');
    $('#orgRow').hidden = S.orgs.length < 2;
    var c = S.d && S.d.control;
    $('#pauseRow').hidden = !can('admin') || !c;
    $('#pauseSw').setAttribute('aria-checked', String(!!(c && c.paused)));
    $('#brainTxt').textContent = c && c.brain_enabled ? 'On' : 'Off · needs your OK (paid)';
    $('#whoTxt').textContent = (S.user && S.user.email || '') + ' · ' + (S.role || '');
    pushState();
  }
  function closeSettings() { $('#settings').hidden = true; }
  $('#openSettings').addEventListener('click', openSettings);
  $('#closeSettings').addEventListener('click', closeSettings);
  $('#settings').addEventListener('click', function (e) { if (e.target.id === 'settings') closeSettings(); });
  $('#orgSel').addEventListener('change', function (e) { var o = S.orgs.filter(function (x) { return x.id === e.target.value; })[0]; setOrg(o); closeSettings(); refresh(); });
  $('#pauseSw').addEventListener('click', async function () {
    var c = S.d.control; if (!c) return;
    var to = !c.paused;
    var r = await sb.from('j8_control').update({ paused: to, updated: new Date().toISOString(), by: 'J8NIX app · ' + (S.user.email || '') }).eq('org_id', S.org).eq('id', 'main').eq('version', c.version).select('id');
    if (r.error || !r.data || !r.data.length) { toast('Not saved. Try again.'); await refresh(true); openSettings(); return; }
    S.d.control = Object.assign({}, c, { paused: to, version: c.version + 1 });
    openSettings(); setLive(); toast(to ? 'Paused · nothing goes out' : 'Sending back on'); refresh(true);
  });
  $('#goHome').addEventListener('click', function () { location.hash = ''; });

  /* ---------------- push ---------------- */
  function b64ToU8(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); var r = atob(s + '==='.slice((s.length + 3) % 4)); var u = new Uint8Array(r.length); for (var i = 0; i < r.length; i++) u[i] = r.charCodeAt(i); return u; }
  async function pushState() {
    var b = $('#pushBtn');
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      b.disabled = true; b.textContent = isIOS() && !standalone() ? 'Add to Home Screen first' : 'Not on this browser'; return;
    }
    if (Notification.permission === 'denied') { b.disabled = true; b.textContent = 'Blocked in settings'; return; }
    var reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription();
    b.disabled = false; b.textContent = sub ? 'On · test' : 'Turn on';
  }
  $('#pushBtn').addEventListener('click', async function () {
    var b = this; b.disabled = true;
    try {
      var reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription();
      if (!sub) {
        var perm = await Notification.requestPermission();
        if (perm !== 'granted') { toast('Alerts not allowed.'); return pushState(); }
        var k = await sb.rpc('j8_vapid_public');
        if (k.error || !k.data) throw new Error('no key');
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(k.data) });
      }
      var j = sub.toJSON();
      var r = await sb.from('j8_push_subs').upsert({ endpoint: j.endpoint, user_id: S.user.id, p256dh: j.keys.p256dh, auth: j.keys.auth, ua: navigator.userAgent.slice(0, 160) }, { onConflict: 'endpoint' });
      if (r.error) throw r.error;
      reg.showNotification('J8NIX alerts are on', { body: 'New approvals, replies and failed runs land here.', icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', tag: 'j8-test' });
      toast('Alerts on for this phone');
    } catch (err) { toast('Couldn\'t turn on alerts: ' + (err.message || err)); }
    pushState();
  });

  /* ---------------- boot ---------------- */
  async function boot() {
    var s = await sb.auth.getSession();
    S.user = s.data.session ? s.data.session.user : null;
    if (!S.user) { route(); return; }
    try { await loadOrgs(); } catch (e) { var snapOrg = store('j8v4:org'); if (snapOrg) setOrg({ id: snapOrg, name: '', role: 'viewer' }); }
    route();
    await refresh(true);
  }
  sb.auth.onAuthStateChange(function (ev, session) {
    if (ev === 'SIGNED_OUT') { S.user = null; route(); }
    if (ev === 'TOKEN_REFRESHED' && session) S.user = session.user;
  });
  window.addEventListener('hashchange', function () { S.editing = false; route(); });
  window.addEventListener('online', function () { refresh(true); });
  window.addEventListener('offline', function () { setLive(true); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && S.user) refresh(true); });
  setInterval(function () { if (!document.hidden && S.user) refresh(true); }, 30000);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {});
    navigator.serviceWorker.addEventListener('message', function (e) { if (e.data && e.data.type === 'j8-refresh' && S.user) refresh(true); });
  }
  window.J8 = { version: VER };
  fromUrl().then(boot);
})();
