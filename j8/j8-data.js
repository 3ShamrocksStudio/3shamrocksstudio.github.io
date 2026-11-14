/* =====================================================================
   J8NIX DATA API v2 · Supabase backend (same interface as the artifact's window.J8 v1)
   Any J8NIX UI can run on either backend unchanged:
     await J8.connect();                         // true when signed in, a business is picked and data loaded
     J8.on('approvals', function(docs){ ... });  // docs = {id: data}; fires on every change (realtime)
     J8.approvals.pending();  J8.approvals.approve(id);  J8.inbox.send('p-shomer','text');
   v1 collections: todo · comments · approvals · projects · runs · money
   v2 adds:        control · units · orgs (multi-business) · auth · push
   5.3 adds:       schedule (team schedule; Dave's pause/run requests) · optout (do-not-contact list)
   v6 adds:        tasks (j8_tasks: Dave's and the team's steps, blocked_by) · warm() (paint from the phone's copy at once)
   Writes are optimistic and return Promises; on failure they reject with {code}.
   Needs vendor/supabase.js loaded first. Shapes: ops/brain/ARMS-CONTRACT.md.
   ===================================================================== */
var J8 = (function () {
  'use strict';
  var SB_URL = 'https://otkvebgrdiayjnqrytrn.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90a3ZlYmdyZGlheWpucXJ5dHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExOTEzMzQsImV4cCI6MjEwNjc2NzMzNH0.-A1KuUXMBx9NMBwUnZx0cS4TwJkjDz86yok5BcEcKsE'; // public anon key; RLS guards every row
  var COLS = ['todo', 'comments', 'approvals', 'projects', 'runs', 'money', 'control', 'units', 'schedule', 'optout', 'tasks'];
  var TABLE = { todo: 'j8_todo', comments: 'j8_messages', approvals: 'j8_approvals', projects: 'j8_projects', runs: 'j8_runs', money: 'j8_money', control: 'j8_control', units: 'j8_units', schedule: 'j8_schedule', optout: 'j8_optout', tasks: 'j8_tasks' };
  /* v6 speed: sent/killed drafts load without their bodies (the biggest part of the data); open drafts load in full */
  var OPEN_AP = 'status.is.null,status.in.(pending,approved,edited,queued),kind.eq.template'; /* templates load in full: Control shows their text */
  var LIGHT_AP = 'org_id,id,kind,label,to,channel,product,created,status,template_id,decided_at,decided_by,sent_at,result,rank,batch,batch_label,blocked_by,version,updated_at';
  var TODO_COLS = 'org_id,id,done,back,at,version,updated_at';
  var DROP = ['org_id', 'extra']; // updated_at stays on docs: the app's "since you last looked" line reads it
  var sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'j8nix-v4-auth' } });
  var data = {}, ver = {}, subs = { status: [], orgs: [], auth: [] }, state = { connected: false, error: null, org: null, role: null, user: null };
  var orgs = [], channel = null, poll = null;
  COLS.forEach(function (c) { data[c] = {}; ver[c] = {}; subs[c] = []; });

  function now() { return new Date().toISOString(); }
  function clone(o) { return Object.assign({}, o); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function emit(c) { (subs[c] || []).forEach(function (f) { try { f(c === 'orgs' ? orgs.slice() : data[c], c); } catch (e) { console.error(e); } }); }
  function status(s) { Object.assign(state, s); (subs.status || []).forEach(function (f) { try { f(clone(state)); } catch (e) { console.error(e); } }); }
  function rej(code, extra) { return Promise.reject(Object.assign({ code: code }, extra || {})); }
  function list(c) { return Object.keys(data[c]).map(function (id) { return Object.assign({ id: id }, data[c][id]); }); }
  function toDoc(row) { var d = {}; Object.keys(row).forEach(function (k) { if (DROP.indexOf(k) < 0 && k !== 'id' && k !== 'version') d[k] = row[k]; }); if (row.extra) Object.keys(row.extra).forEach(function (k) { if (!(k in d)) d[k] = row.extra[k]; }); return d; }

  /* ---------- load + realtime ---------- */
  async function loadCol(c) {
    if (!state.org) return;
    var rows;
    if (c === 'approvals') {
      var q = await Promise.all([sb.from(TABLE[c]).select('*').eq('org_id', state.org).or(OPEN_AP), sb.from(TABLE[c]).select(LIGHT_AP).eq('org_id', state.org).in('status', ['sent', 'killed']).or('kind.is.null,kind.neq.template')]);
      if (q[0].error) throw q[0].error; if (q[1].error) throw q[1].error;
      rows = (q[0].data || []).concat(q[1].data || []);
    } else {
      var r = await sb.from(TABLE[c]).select(c === 'todo' ? TODO_COLS : '*').eq('org_id', state.org);
      if (r.error) { if (c === 'tasks') { data[c] = {}; emit(c); return; } throw r.error; } /* tasks: a backend without j8_tasks still works */
      rows = r.data || [];
    }
    var o = {}, v = {};
    rows.forEach(function (row) { o[row.id] = toDoc(row); v[row.id] = row.version; });
    data[c] = o; ver[c] = v;
    cache(); emit(c);
  }
  function cache() { if (state.org) store('j8v4:cache:' + state.org, JSON.stringify(data)); }
  function fromCache(org) {
    try { var d = JSON.parse(store('j8v4:cache:' + org) || 'null'); if (d) COLS.forEach(function (c) { data[c] = d[c] || {}; emit(c); }); } catch (e) { /* ignore */ }
  }
  async function loadAll() { await Promise.all(COLS.map(loadCol)); status({ connected: true, error: null }); }
  var pendingReload = {};
  function reloadSoon(c) { clearTimeout(pendingReload[c]); pendingReload[c] = setTimeout(function () { loadCol(c).catch(function () {}); }, 250); }
  function listen() {
    if (channel) { sb.removeChannel(channel); channel = null; }
    channel = sb.channel('j8-' + state.org);
    COLS.forEach(function (c) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: TABLE[c], filter: 'org_id=eq.' + state.org }, function () { reloadSoon(c); });
    });
    channel.subscribe();
    clearInterval(poll);
    poll = setInterval(function () { if (!document.hidden) loadAll().catch(function () { status({ connected: false, error: 'offline' }); }); }, 60000);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && state.org) loadAll().catch(function () {}); });
  window.addEventListener('online', function () { if (state.org) loadAll().catch(function () {}); });
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', function (e) { if (e.data && e.data.type === 'j8-refresh' && state.org) loadAll().catch(function () {}); });

  /* ---------- auth ---------- */
  async function signInFromText(text) {
    text = String(text || '').trim();
    var m = /(https?:\/\/\S+)/.exec(text), url = m ? m[1] : text, u = null;
    try { u = new URL(url); } catch (e) { u = null; }
    var hash = new URLSearchParams(u && u.hash ? u.hash.slice(1) : (text.indexOf('refresh_token=') > -1 ? text.split('#').pop() : ''));
    if (hash.get('refresh_token')) {
      var r1 = await sb.auth.setSession({ access_token: hash.get('access_token') || '', refresh_token: hash.get('refresh_token') });
      if (r1.error) r1 = await sb.auth.refreshSession({ refresh_token: hash.get('refresh_token') });
      return !r1.error;
    }
    var q = u ? u.searchParams : new URLSearchParams('');
    var th = q.get('token_hash') || q.get('token');
    if (!th) return false;
    var types = [q.get('type'), 'magiclink', 'email', 'signup'].filter(function (t, i, a) { return t && a.indexOf(t) === i; });
    for (var i = 0; i < types.length; i++) { var r = await sb.auth.verifyOtp({ token_hash: th, type: types[i] }); if (!r.error) return true; }
    return false;
  }
  var auth = {
    user: function () { return state.user; },
    /* emails a sign-in link; the email's link can be pasted into signInWithLink (works inside an installed iPhone app) */
    sendLink: async function (email) {
      email = String(email || '').trim().toLowerCase(); if (!email) return rej('empty');
      var r = await sb.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname } });
      if (r.error) return rej('send_failed', { message: r.error.message });
      store('j8v4:email', email); return true;
    },
    /* accepts the email link itself, or the address of the page the link opened */
    /* the email's one-time code (6–8 digits), typed in the app: works inside an installed iPhone app */
    verifyCode: async function (email, code) {
      email = String(email || store('j8v4:email') || '').trim().toLowerCase();
      code = String(code || '').replace(/\D/g, '');
      if (!email || code.length < 6) return rej('bad_code');
      var r = await sb.auth.verifyOtp({ email: email, token: code, type: 'email' });
      if (r.error) return rej('bad_code', { message: r.error.message });
      connecting = null; return connect();
    },
    signInWithLink: async function (text) { var ok = await signInFromText(text); if (!ok) return rej('bad_link'); connecting = null; return connect(); },
    signOut: async function () { await sb.auth.signOut(); state.user = null; state.org = null; status({ connected: false, error: 'signed_out' }); (subs.auth || []).forEach(function (f) { f(null); }); }
  };
  sb.auth.onAuthStateChange(function (ev, s) {
    state.user = s ? { id: s.user.id, email: s.user.email } : null;
    if (ev === 'SIGNED_OUT') (subs.auth || []).forEach(function (f) { f(null); });
  });

  /* ---------- connect / orgs ---------- */
  var connecting = null;
  function connect() {
    if (connecting) return connecting;
    connecting = (async function () {
      var s = (await sb.auth.getSession()).data.session;
      if (!s) { status({ connected: false, error: 'signed_out' }); connecting = null; return false; }
      state.user = { id: s.user.id, email: s.user.email };
      (subs.auth || []).forEach(function (f) { f(clone(state.user)); });
      try {
        await sb.rpc('j8_accept_invites');
        var r = await sb.from('j8_members').select('role,display_name,org_id,j8_orgs(id,name,slug)').eq('user_id', s.user.id);
        if (r.error) throw r.error;
        orgs = (r.data || []).map(function (m) { return { id: m.org_id, name: m.j8_orgs ? m.j8_orgs.name : '', slug: m.j8_orgs ? m.j8_orgs.slug : '', role: m.role, me: m.display_name }; });
        store('j8v4:orgs', JSON.stringify(orgs));
      } catch (e) {
        try { orgs = JSON.parse(store('j8v4:orgs') || '[]'); } catch (x) { orgs = []; }
      }
      emit('orgs');
      if (!orgs.length) { status({ connected: false, error: 'no_org' }); return false; }
      var pick = store('j8v4:org'), o = orgs.filter(function (x) { return x.id === pick; })[0] || orgs[0];
      return useOrg(o.id);
    })();
    return connecting;
  }
  async function useOrg(id) {
    var o = orgs.filter(function (x) { return x.id === id; })[0]; if (!o) return false;
    state.org = o.id; state.role = o.role; store('j8v4:org', o.id);
    COLS.forEach(function (c) { data[c] = {}; ver[c] = {}; });
    fromCache(o.id);
    try { await loadAll(); listen(); return true; }
    catch (e) { status({ connected: false, error: 'offline' }); return Object.keys(data.projects).length > 0; }
  }

  /* ---------- writes (optimistic, version-checked) ---------- */
  async function update(c, id, patch) {
    var before = data[c][id]; if (!before) return rej('not_found');
    data[c] = clone(data[c]); data[c][id] = Object.assign({}, before, patch); emit(c);
    var r = await sb.from(TABLE[c]).update(patch).eq('org_id', state.org).eq('id', id).eq('version', ver[c][id]).select('id,version');
    if (r.error || !r.data || !r.data.length) {
      data[c] = clone(data[c]); data[c][id] = before; emit(c); loadCol(c).catch(function () {});
      return rej(r.error ? 'denied' : 'conflict', r.error ? { message: r.error.message } : {});
    }
    ver[c][id] = r.data[0].version; cache(); return true;
  }
  async function insert(c, id, doc) {
    data[c] = clone(data[c]); data[c][id] = clone(doc); emit(c);
    var row = Object.assign({ org_id: state.org, id: id }, doc);
    var r = await sb.from(TABLE[c]).insert(row).select('*');
    if (r.error) { data[c] = clone(data[c]); delete data[c][id]; emit(c); return rej('denied', { message: r.error.message }); }
    data[c] = clone(data[c]); data[c][id] = toDoc(r.data[0]); ver[c][id] = r.data[0].version; emit(c); cache(); return true;
  }
  function decide(patch) { return Object.assign({ decided_at: now(), decided_by: state.user && state.user.id }, patch); }
  function byRank(a, b) { return (typeof a.rank === 'number' ? a.rank : 999) - (typeof b.rank === 'number' ? b.rank : 999) || String(a.created || '').localeCompare(String(b.created || '')); }
  function num(x) { return x == null || x === '' ? null : Number(x); }
  function byLine() { return 'J8NIX app · ' + (state.user ? state.user.email : ''); }
  var capQ = Promise.resolve();

  var api = {
    COLLECTIONS: COLS.slice(),
    backend: 'supabase',
    connect: connect,
    on: function (c, fn) {
      if (!subs[c]) throw new Error('unknown collection ' + c);
      subs[c].push(fn);
      return function () { subs[c] = subs[c].filter(function (f) { return f !== fn; }); };
    },
    status: function () { return clone(state); },
    raw: function (c) { return data[c]; },
    reload: function () { return loadAll(); },
    auth: auth,
    /* v6: with a saved session and a saved copy, show the last copy at once (before any network); connect() refreshes it */
    warm: function () {
      var org = store('j8v4:org'); if (!org || !store('j8nix-v4-auth') || !store('j8v4:cache:' + org)) return false;
      fromCache(org); if (!Object.keys(data.projects).length) return false;
      status({ cached: true }); return true;
    },

    orgs: {
      list: function () { return orgs.slice(); },
      current: function () { return orgs.filter(function (o) { return o.id === state.org; })[0] || null; },
      use: function (id) { connecting = Promise.resolve(true); return useOrg(id); },
      can: function (role) { var r = { owner: 4, admin: 3, member: 2, viewer: 1 }; return (r[state.role] || 0) >= (r[role] || 0); }
    },
    units: {
      list: function () { return list('units').sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); }); },
      departments: function () { return api.units.list().filter(function (u) { return u.kind !== 'business'; }); },
      projects: function (unitId) { return api.projects.list().filter(function (p) { return p.unit_id === unitId; }); }
    },

    todo: {
      get: function (id) { return data.todo[id] || null; },
      isDone: function (id) { return !!(data.todo[id] && data.todo[id].done); },
      tick: function (id) { return data.todo[id] ? update('todo', id, { done: true, at: now() }) : insert('todo', id, { done: true, at: now() }); },
      untick: function (id) { return data.todo[id] ? update('todo', id, { done: false, back: true, at: now() }) : insert('todo', id, { done: false, back: true, at: now() }); },
      note: function (id, text) { return data.todo[id] ? update('todo', id, { note: String(text), at: now() }) : insert('todo', id, { note: String(text), at: now() }); }
    },

    inbox: {
      /* scope: a project id ('p-…'), 'p-general', or {unit: unitId}. The database adds an instant acknowledgement line. */
      /* 6.0.1: taskId tags the message to one task; the database routes it to that task's project and unit */
      send: function (project, text, taskId) {
        var t = String(text || '').trim(); if (!t) return rej('empty');
        var unit = project && typeof project === 'object' ? project.unit : null;
        var p = typeof project === 'string' && project ? project : 'p-general';
        var id = p + '-' + Date.now(), doc = { p: p, text: t };
        if (unit) doc.unit_id = unit;
        if (taskId) { doc.task_id = String(taskId); var pr = data.projects[p]; if (!unit && pr && pr.unit_id) doc.unit_id = pr.unit_id; }
        return insert('comments', id, doc).then(function () {
          var c = data.control.main;
          if (c && c.brain_enabled) api._brain(id).catch(function () {});
          return id;
        });
      },
      list: function (limit) { return list('comments').sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); }).slice(0, limit || 1e9); },
      forProject: function (p) { return api.inbox.list().filter(function (x) { return x.p === p; }); },
      forTask: function (t) { return api.inbox.list().filter(function (x) { return x.task_id === t; }); },
      forUnit: function (u) { return api.inbox.list().filter(function (x) { return x.unit_id === u; }); },
      lastReply: function (x) { var r = String(x && x.reply || '').trim().split('\n').filter(function (l) { return l.trim(); }); return r[r.length - 1] || ''; }
    },

    approvals: {
      list: function () { return list('approvals').sort(byRank); },
      pending: function () { return api.approvals.list().filter(function (a) { return !a.status || a.status === 'pending'; }); },
      decided: function () { return api.approvals.list().filter(function (a) { return a.status && a.status !== 'pending'; }); },
      templates: function () { return api.approvals.list().filter(function (a) { return a.kind === 'template'; }); },
      queued: function () { return api.approvals.list().filter(function (a) { return a.status === 'queued'; }); },
      textOf: function (a) { return a && a.edited_body != null && a.edited_body !== '' ? a.edited_body : (a && a.body) || ''; },
      approve: function (id) { var a = data.approvals[id] || {}, ed = a.edited_body != null && a.edited_body !== ''; return update('approvals', id, decide({ status: ed ? 'edited' : 'approved' })); },
      edit: function (id, text) { var t = String(text || '').trim(); if (!t) return rej('empty'); return update('approvals', id, decide({ edited_body: t, status: 'edited' })); },
      kill: function (id) { return update('approvals', id, decide({ status: 'killed' })); },
      undo: function (id) { if ((data.approvals[id] || {}).status === 'sent') return rej('already_sent'); return update('approvals', id, { status: 'pending', decided_at: null, decided_by: null }); },
      /* only for label 'Send by hand' items (LinkedIn): Dave sent it himself */
      markSent: function (id) { return update('approvals', id, decide({ status: 'sent', sent_at: now(), result: 'Sent by hand (J8NIX)' })); }
    },

    projects: {
      STAGES: ['Concept', 'Build', 'Staged', 'Validate', 'Monetize', 'Paying'],
      list: function () {
        return list('projects').filter(function (p) { return !p.hidden; }).sort(function (a, b) {
          var x = num(a.order), y = num(b.order); return (x == null ? 99 : x) - (y == null ? 99 : y) || String(a.name).localeCompare(String(b.name));
        });
      },
      get: function (id) { return data.projects[id] ? Object.assign({ id: id }, data.projects[id]) : null; }
    },

    tasks: {
      list: function () { return list('tasks').filter(function (t) { return t.status !== 'dropped'; }); },
      get: function (id) { return data.tasks[id] ? Object.assign({ id: id }, data.tasks[id]) : null; },
      open: function () { return api.tasks.list().filter(function (t) { return !t.status || t.status === 'open'; }); },
      /* Dave ticks a task: the database stamps done_at and how many items it unlocked; undo reopens it */
      done: function (id) { return update('tasks', id, { status: 'done' }).then(function (ok) { loadCol('tasks').catch(function () {}); return ok; }); },
      undo: function (id) { return update('tasks', id, { status: 'open' }).then(function (ok) { loadCol('tasks').catch(function () {}); return ok; }); }
    },

    runs: {
      list: function () { return list('runs').sort(function (a, b) { return String(b.ended || b.started || '').localeCompare(String(a.ended || a.started || '')); }); },
      lastByArm: function () { var by = {}; api.runs.list().forEach(function (r) { if (r.arm && !by[r.arm]) by[r.arm] = r; }); return by; },
      forProject: function (p) { return api.runs.list().filter(function (r) { return r.project === p || (r.projects || []).indexOf(p) > -1; }); },
      health: function (r, staleHours) {
        if (!r) return 'none'; if (r.status === 'failed') return 'failed'; if (r.status === 'nothing') return 'nothing';
        var t = new Date(r.ended || r.started); return (Date.now() - t) / 36e5 > (staleHours || 48) ? 'stale' : 'ok';
      }
    },

    money: {
      summary: function () { var m = data.money.summary; if (!m) return null; var o = clone(m); ['booked_usd', 'booked_ils', 'm1_usd', 'goal_usd', 'pipeline', 'spend_usd', 'spend_ils'].forEach(function (k) { if (o[k] != null) o[k] = Number(o[k]); }); return o; },
      daysTo: function (d) { if (!d) return null; var t = new Date(String(d).slice(0, 10) + 'T23:59:59'); return isNaN(t) ? null : Math.ceil((t - new Date()) / 864e5); }
    },

    control: {
      get: function () { return data.control.main || null; },
      paused: function () { return !!(data.control.main && data.control.main.paused); },
      setPaused: function (on) { return update('control', 'main', { paused: !!on, updated: now(), by: 'J8NIX app · ' + (state.user ? state.user.email : '') }); },
      brainEnabled: function () { return !!(data.control.main && data.control.main.brain_enabled); },
      /* 5.3: the writes below touch only by, updated and the one field named */
      setEmail: function (on) { return update('control', 'main', { email_from_ok: !!on, updated: now(), by: byLine() }); },
      setBrain: function (on) { return update('control', 'main', { brain_enabled: !!on, updated: now(), by: byLine() }); },
      CAP_KEYS: ['email', 'li_connect', 'li_followup'],
      /* daily limit, a whole number 0–50, merged into caps; taps run one after another so the version check never trips on itself */
      setCap: function (key, n) {
        if (api.control.CAP_KEYS.indexOf(key) < 0) return rej('bad_key');
        n = Number(n); if (!isFinite(n) || n !== Math.floor(n) || n < 0 || n > 50) return rej('bad_value');
        var job = capQ.then(function () {
          var c = data.control.main; if (!c) return rej('not_found');
          return update('control', 'main', { caps: Object.assign({}, c.caps || {}, (function (o) { o[key] = n; return o; })({})), updated: now(), by: byLine() });
        });
        capQ = job.catch(function () {}); return job;
      }
    },

    /* 5.3 team schedule. The app writes only want_enabled / run_now_at (+ updated, by): the column grant allows nothing else.
       The team's hourly run carries the request out, so enabled and run_now_done_at catch up within about an hour. */
    schedule: {
      list: function () { return list('schedule').filter(function (s) { return !s.hidden; }).sort(function (a, b) { return (num(a.sort) == null ? 999 : num(a.sort)) - (num(b.sort) == null ? 999 : num(b.sort)) || String(a.name).localeCompare(String(b.name)); }); },
      get: function (id) { return data.schedule[id] ? Object.assign({ id: id }, data.schedule[id]) : null; },
      setEnabled: function (id, on) { var s = data.schedule[id]; if (!s) return rej('not_found'); if (s.locked) return rej('locked'); return update('schedule', id, { want_enabled: !!on, updated: now(), by: byLine() }); },
      runNow: function (id) { var s = data.schedule[id]; if (!s) return rej('not_found'); if (s.locked) return rej('locked'); return update('schedule', id, { run_now_at: now(), updated: now(), by: byLine() }); }
    },

    /* 5.3 do-not-contact list: one row per address, id = the address in lower case */
    optout: {
      list: function () { return list('optout').sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); }); },
      has: function (email) { return !!data.optout[String(email || '').trim().toLowerCase()]; },
      valid: function (email) { return /^[^\s@<>",;]+@[^\s@<>",;]+\.[a-z]{2,}$/i.test(String(email || '').trim()); },
      add: function (email) {
        var e = String(email || '').trim().toLowerCase();
        if (!api.optout.valid(e)) return rej('bad_email');
        if (data.optout[e]) return rej('exists');
        return insert('optout', e, { email: e, at: now(), source: 'J8NIX app', by: state.user ? state.user.email : null });
      }
    },

    push: {
      supported: function () { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; },
      enabled: async function () { if (!api.push.supported()) return false; var reg = await navigator.serviceWorker.ready; return !!(await reg.pushManager.getSubscription()); },
      enable: async function () {
        if (!api.push.supported()) return rej('unsupported');
        var reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription();
        if (!sub) {
          if ((await Notification.requestPermission()) !== 'granted') return rej('denied');
          var k = await sb.rpc('j8_vapid_public'); if (k.error || !k.data) return rej('no_key');
          var s = k.data.replace(/-/g, '+').replace(/_/g, '/'), raw = atob(s + '==='.slice((s.length + 3) % 4)), key = new Uint8Array(raw.length);
          for (var i = 0; i < raw.length; i++) key[i] = raw.charCodeAt(i);
          sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
        }
        var j = sub.toJSON();
        var r = await sb.from('j8_push_subs').upsert({ endpoint: j.endpoint, user_id: state.user.id, p256dh: j.keys.p256dh, auth: j.keys.auth, ua: navigator.userAgent.slice(0, 160) }, { onConflict: 'endpoint' });
        if (r.error) return rej('denied', { message: r.error.message });
        return true;
      }
    },

    /* Live AI answer: only when control.brain_enabled (Dave's paid OK) — otherwise {code:'unavailable'}.
       The question is stored as a chat message either way, so the arms answer it in the thread. */
    askAvailable: async function () { return api.control.brainEnabled(); },
    ask: async function (question, opts) {
      opts = opts || {};
      var id = await api.inbox.send(opts.project || 'p-general', question);
      if (!api.control.brainEnabled()) throw { code: 'unavailable', messageId: id };
      var res = await api._brain(id);
      if (!res || !res.reply) throw { code: 'unavailable', messageId: id };
      if (opts.onText) opts.onText(res.reply);
      return { text: res.reply, messageId: id };
    },
    _brain: async function (messageId) {
      var s = (await sb.auth.getSession()).data.session; if (!s) throw { code: 'signed_out' };
      var r = await fetch(SB_URL + '/functions/v1/j8-brain', { method: 'POST', headers: { Authorization: 'Bearer ' + s.access_token, apikey: SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ org_id: state.org, message_id: messageId }) });
      var j = await r.json().catch(function () { return {}; }); loadCol('comments').catch(function () {}); return j;
    },
    context: function (extra) {
      var m = api.money.summary() || {}, L = ['TODAY: ' + now().slice(0, 10)];
      L.push('MONEY: ' + JSON.stringify(m));
      L.push('PROJECTS (name | stage/6 | now | next | Dave\'s move):');
      api.projects.list().forEach(function (p) { L.push('- ' + p.name + ' | ' + (p.stage || '-') + ' | ' + (p.now || '') + ' | ' + (p.next || '') + ' | ' + (p.you || '')); });
      var ap = api.approvals.list(); L.push('APPROVALS (' + ap.length + '):');
      ap.forEach(function (a) { L.push('- [' + (a.status || 'pending') + '] ' + (a.kind || '') + ' to ' + (a.to || '') + ' (' + (a.product || '') + ')' + (a.result ? ' result: ' + a.result : '')); });
      var by = api.runs.lastByArm(), arms = Object.keys(by); L.push('ARMS last run:');
      arms.forEach(function (k) { var r = by[k]; L.push('- ' + k + ': ' + (r.status || '') + ' at ' + (r.ended || r.started) + ' · ' + String(r.summary || '').slice(0, 200)); });
      if (!arms.length) L.push('- none reported yet');
      L.push('INBOX (latest replies):'); api.inbox.list(8).forEach(function (x) { L.push('- ' + x.p + ' [' + (x.status || 'new') + '] ' + api.inbox.lastReply(x).slice(0, 240)); });
      if (extra) L.push(extra);
      return L.join('\n');
    }
  };
  return api;
})();
window.J8 = J8;
