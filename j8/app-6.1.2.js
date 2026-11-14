/* J8NIX PWA screens 6.0.0 (14 Nov 2026): v5.2.0 + the lead layer: dependencies (blocked_by), unlocks, one ranked queue
   ("Do this first" → next 3 → the rest by unit → project), a unit → project → task List and a flow strip on Stats.
   Plan, formula and revert: ops/brain/J8NIX-V6-PLAN.md. Revert copy of 5.2.0: app-5.2.0.js.
   J8NIX PWA screens 5.0.0 (5.3.0 adds Control in the settings sheet): the approved v8 UI (Chat · Next · List · Stats), ported from the claude.ai artifact.
   Live data only, through window.J8 (j8-data.js, Supabase). No static copies of tasks or projects: empty data shows an empty state. */
var T=[],P=[];
/* ===== J8NIX UI v7 (12 Nov): Chat · Next · List · Stats. Reads and writes only through window.J8 (above) and control/main.
   The chat script below uses the globals marked [chat]. ===== */
var S={},CMT={},AP={},PR={},RUNS={},MONEY={},CTRL=null,TK={},UN={};
var connected=false,batchSel=null,showDec=false,selAp=null,hlAp=null,editing=null,view='chat',lcat='all',openRow={},seatAsk=0,wdb=null,nextIdx=0,lmode=null; /* [chat]: connected,batchSel,showDec,selAp,hlAp */
var KIND={application:['Application','i-clients'],email:['Email','i-inbox'],linkedin:['LinkedIn note','i-link'],post:['Post','i-note'],invoice:['Payment request','i-money'],template:['Template','i-loop'],other:['Message','i-chat']};
var STW={pending:'Waiting',approved:'Approved',edited:'Edited, approved',killed:'Killed',sent:'Sent'};
var DEPT={CRO:'Revenue',CFO:'Finance',CDO:'Design',CPO:'Product',CMO:'Marketing',CTO:'Tech',COO:'Ops',Grants:'Grants'};
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MQ=window.matchMedia?window.matchMedia('(max-width:999px)'):{matches:true};
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ic(id,cls){return '<svg class="ico'+(cls?' '+cls:'')+'" aria-hidden="true"><use href="#i-'+id+'"/></svg>';}
function isNum(x){return typeof x==='number'&&isFinite(x);}
function usd(n){if(!isNum(n))return '—';if(Math.abs(n)>=1e6)return '$'+String(+(n/1e6).toFixed(2))+'M';if(Math.abs(n)>=1e4)return '$'+String(+(n/1e3).toFixed(1))+'k';return '$'+Math.round(n).toLocaleString('en-US');}
function ils(n){return isNum(n)?'₪'+Math.round(n).toLocaleString('en-US'):'';}
function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function fdate(s){var t=new Date(String(s).slice(0,10)+'T12:00:00');return isNaN(t)?'':t.getDate()+' '+MON[t.getMonth()]+(t.getFullYear()!==new Date().getFullYear()?' '+t.getFullYear():'');}
function ago(iso){if(!iso)return '';var t=new Date(iso);if(isNaN(t))return '';var m=Math.round((Date.now()-t)/6e4);if(m<1)return 'just now';if(m<60)return m+' min ago';var h=Math.round(m/60);if(h<36)return h+' h ago';return Math.round(h/24)+' days ago';}
function hhmm(iso){var t=new Date(iso);if(isNaN(t))return '';if(ymd(t)===ymd(new Date()))return t.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});return t.getDate()+' '+MON[t.getMonth()];}
function cut(s,n){s=String(s==null?'':s).replace(/\s+/g,' ').trim();if(s.length<=n)return s;var c=s.slice(0,n-1),i=c.lastIndexOf(' ');return (i>n*0.6?c.slice(0,i):c).replace(/[\s,;:—-]+$/,'')+'…';}
function ls(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v));}catch(_){return null;}}
function tag(txt,cls){return '<span class="tag '+cls+'">'+esc(txt)+'</span>';}
/* ===== severity (5.1, ops/brain/J8NIX-COMMS.md): 🔴 needs you now · 🟠 needs you today · 🟢 FYI, read from the line start ===== */
var SEV={r:['🔴','Needs you now'],o:['🟠','Needs you today'],g:['🟢','FYI · done']},SEVO={r:0,o:1,g:2};
function sevOf(s){var m=String(s||'').match(/^\s*(?:\d{1,2}:\d\d(?:\s*\([^)]*\))?\s*[—-]\s*)?(🔴|🟠|🟢)/u);return m?{'🔴':'r','🟠':'o','🟢':'g'}[m[1]]:null;}
function sevStrip(s){return String(s==null?'':s).replace(/^\s*(?:🔴|🟠|🟢)\s*[:·—-]?\s*/u,'');}
function sevLegacy(s){return /NEEDS YOUR EYES|WHAT YOU DO/i.test(String(s||''))?'o':null;} /* old untagged lines */
function sevRank(v){return v in SEVO?SEVO[v]:1;}
function sevChip(v){return v&&SEV[v]?'<span class="sv sv-'+v+'"><i class="sd sd-'+v+'" aria-hidden="true"></i>'+esc(SEV[v][1])+'</span>':'';}
/* ===== 5.2 product colours: [main, second] from each product's own brand file (ds/*.md); missing ids fall back to j8_projects.color ===== */
/* 6.1: every colour cited from its brand file (/mnt/user-data/outputs/ds/*.md, assets/brand-v3/j8nix/BRAND.md, a11y/index.html :root).
   Studio-run projects (site, services, payments, grants/CSR, LinkedIn, HealthTech page, the accessibility checker) wear the studio brand.
   No brand file → no entry (falls back to j8_projects.color). Badges: real PNG logos, resized only (j8/brand/). */
var PCOL={'p-shomer':['#E0A828','#0C1B3A'],'p-ios':['#E0A828','#0C1B3A'],'p-tnufa':['#E0A828','#0C1B3A'],'p-command':['#FC9918','#0C1B3A'],'p-nature':['#2F8540','#4FA85C'],
 'p-lickpick':['#FFE600','#FF2E88'],'p-site':['#8239EA','#3DCC6E'],'p-services':['#8239EA','#3DCC6E'],'p-payments':['#8239EA','#3DCC6E'],'p-csr':['#8239EA','#3DCC6E'],
 'p-linkedin':['#8239EA','#3DCC6E'],'p-healthtech':['#8239EA','#3DCC6E'],'p-a11y':['#8239EA','#B07CFF'],
 'p-th':['#FF6C00','#0A0A2E'],'p-chore':['#6A21C4','#F59E0B'],'p-fairent':['#6550FF','#53D805'],'p-j8nix':['#F2C194','#586475'],'p-general':['#9AA6BF','#9AA6BF']};
var PBADGE={'p-shomer':'shomer','p-ios':'shomer','p-tnufa':'shomer','p-command':'shomer','p-nature':'nature','p-lickpick':'lickpick','p-th':'th','p-chore':'chore','p-milo':'milo','p-ig':'media','p-j8nix':'j8nix',
 'p-site':'studio','p-services':'studio','p-payments':'studio','p-csr':'studio','p-linkedin':'studio','p-healthtech':'studio','p-a11y':'studio'};
function lum(h){var m=String(h).replace('#','');if(m.length!==6)return .5;return [0,2,4].map(function(i){var c=parseInt(m.substr(i,2),16)/255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);}).reduce(function(s,c,i){return s+c*[.2126,.7152,.0722][i];},0);}
/* 6.1: a stripe must show on its background: when the brand's first colour is too faint for this theme, its second colour leads */
function pcol(id){var c=pcolRaw(id);if(!c)return null;var dk=document.documentElement.dataset.theme==='dark'||(document.documentElement.dataset.theme==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme:dark)').matches);
 if(!dk&&lum(c[0])>.6&&c[1]&&lum(c[1])<=.6)return [c[1],c[0]];if(dk&&lum(c[0])<.04&&c[1]&&lum(c[1])>=.04)return [c[1],c[0]];return c;}
function pcolRaw(id){if(!id)return null;if(PCOL[id])return PCOL[id];var c=(PR[id]||{}).color;return /^#[0-9a-f]{3,8}$/i.test(String(c||''))?[c,c]:null;}
function pm(id){var b=id&&PBADGE[id];if(b)return '<img class="pb" src="brand/'+b+'.png" alt="" width="18" height="18" loading="lazy" decoding="async">';var c=pcol(id);return c?'<i class="pm" style="--pc:'+c[0]+';--pc2:'+c[1]+'" aria-hidden="true"></i>':'';}
function pcStyle(id){var c=pcol(id);return c?';--pc:'+c[0]:'';}
var SEVC={r:'var(--r)',o:'var(--o)',g:'var(--ok)'};
/* timestamps arrive as ISO, ISO+offset or Postgres text ("2026-11-14 07:56:07.3+00") */
function pd(s){if(!s)return NaN;var t=new Date(String(s).trim().replace(' ','T').replace(/([+-]\d\d)$/,'$1:00'));return t.getTime();}
var tt=null,undoFn=null;
function toast(msg,undo){$('toastMsg').textContent=msg;var u=$('undo');u.hidden=!undo;undoFn=undo||null;$('toast').classList.add('on');clearTimeout(tt);tt=setTimeout(function(){$('toast').classList.remove('on');undoFn=null;},undo?8000:4000);}
function scrollToEl(id,block){var moved=false,box0=$(id)&&$(id).closest('.v'),stop=function(){moved=true;};
 if(box0){box0.addEventListener('touchstart',stop,{once:true,passive:true});box0.addEventListener('wheel',stop,{once:true,passive:true});}
 var fit=function(smooth){if(moved)return;var e=$(id);if(!e)return;var box=e.closest('.v');
  if(box&&box.id==='v-list'&&(block||'start')==='start'){var bar=box.querySelector('.cats'),bh=bar?bar.getBoundingClientRect().height:0;box.style.setProperty('--catsH',bh+'px');
   var y=Math.max(0,e.getBoundingClientRect().top-box.getBoundingClientRect().top+box.scrollTop-bh-10);if(Math.abs(y-box.scrollTop)>2)box.scrollTo({top:y,behavior:smooth?'smooth':'auto'});return;}
  e.scrollIntoView({behavior:smooth?'smooth':'auto',block:block||'start'});};
 setTimeout(function(){fit(!matchMedia('(prefers-reduced-motion:reduce)').matches);},40);
 [700,1200].forEach(function(ms){setTimeout(function(){fit(false);},ms);}); /* the list can re-render while it scrolls: land exactly, unless Dave has scrolled himself */}
/* ===== to-do (var T, ticks in db "todo") [chat]: openItems, dayStats (kept from v6) ===== */
var GOF={};T.forEach(function(g){g.items.forEach(function(i){GOF[i.id]=g;});});
function all(){var a=[];T.forEach(function(g){g.items.forEach(function(i){a.push(i);});});return a;}
function isDone(i){return !!(S[i.id]&&S[i.id].done);}
function gdate(g){if(!g)return null;var m=String(g.g).match(/\b(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/);if(!m)return null;var y=new Date().getFullYear(),mo=MON.indexOf(m[2]);var d=new Date(y,mo,+m[1],12);if(d-new Date()>200*864e5)d.setFullYear(y-1);return d;}
function openItems(w){return all().filter(function(i){return !isDone(i)&&i.w===w;}).sort(function(a,b){var da=gdate(GOF[a.id]),db=gdate(GOF[b.id]);return (db?db.getTime():0)-(da?da.getTime():0);});}
function doneItems(){return all().filter(isDone).sort(function(a,b){return String((S[b.id]||{}).at||'').localeCompare(String((S[a.id]||{}).at||''));});}
function dayStats(){var t=ymd(new Date()),it=[];T.forEach(function(g){var d=gdate(g);if(d&&ymd(d)===t)it=it.concat(g.items);});var done=it.filter(isDone).length;return {total:it.length,done:done,left:it.length-done};}

/* ===== projects + approvals [chat]: projList, pname, youReal, apPending, AP ===== */
function projList(){var L=J8.projects.list();if(L.length)return L;return P.filter(function(p){return p.st>=0;}).map(function(p,n){return {id:p.id,name:p.n,color:p.c,stage:p.st+1,now:p.now,next:p.nx,you:p.you,link:p.link,link_text:p.lt,order:50+n};});}
function pname(id){var p=PR[id];if(p&&p.name)return p.name;for(var i=0;i<P.length;i++)if(P[i].id===id)return P[i].n;return id==='p-general'?'Anything else':(id||'Note');}
function youRaw(p){var y=sevStrip(String(p.you||'').trim()).trim();return y&&!/^nothing/i.test(y)?y:'';}
function youReal(p){var y=youRaw(p);return y&&!stale(p,y)?y:'';} /* a move that points at an empty Approve is out of date, so it does not count */
function apPending(){return J8.approvals.pending();}
function dept(p){return DEPT[p.owner]||'Other';}
/* a "your move" that points at Approve is out of date when nothing for that project (or no template) is waiting there */
function stale(p,y){ /* a move that sends Dave to Approve is out of date when nothing of that kind, for that project, waits there */
 if(!/(^|\s)(Approve tab|Open Approve|Approve →|Approve ->|in Approve →)|^Approve\b/i.test(y))return false;
 var pend=apPending(),mine=pend.filter(function(a){return a.product===p.id;});
 if(/template/i.test(y))return !pend.some(function(a){return a.kind==='template';});
 if(!mine.length)return true;
 var K=[[/whatsapp/i,function(a){return /whatsapp/i.test(String(a.channel||'')+' '+String(a.label||''));}],[/\bemails?\b/i,function(a){return a.kind==='email';}],[/\bposts?\b/i,function(a){return a.kind==='post';}],[/application/i,function(a){return a.kind==='application';}],[/linkedin note|connect note/i,function(a){return a.kind==='linkedin';}]];
 var hit=K.filter(function(k){return k[0].test(y);});
 if(hit.length&&!mine.some(function(a){return hit.some(function(k){return k[1](a);});}))return true;
 var q=y.match(/["“]([^"”]{3,60})["”]/);if(q&&!mine.some(function(a){return String(a.batch_label||'').toLowerCase().indexOf(q[1].toLowerCase())>-1;}))return true;
 return false;}
function moves(){return projList().map(function(p){return {p:p,y:youReal(p)};}).filter(function(x){return x.y;});}
/* a step written as a menu path (A → B → C (D): do this) shows the action first; the full path stays in the project */
function headline(y){var m=String(y).match(/^(.*→[^:]*):\s*(.+)$/);if(!m)return y;var t=m[2];return t.charAt(0).toUpperCase()+t.slice(1);}
function stageName(s){return isNum(s)&&s>=1&&s<=6?J8.projects.STAGES[s-1]:'';}
function linkBtn(u,t,cls){if(!u)return '';if(u.charAt(0)==='#'){var j=u.slice(1);return '<button class="'+(cls||'go')+'" data-jump="'+esc(j)+'">'+esc(t||'Open')+'</button>';}
 return '<a class="'+(cls||'go')+'" href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(t||'Open')+(cls&&cls!=='go'?'':ic('link'))+'</a>';}


/* ===== derived data: one source for Chat, Next, List and Stats ===== */
var GR=[['money','Money','#9A5B00'],['approve','Approve','#1F5BFF'],['projects','Projects','#3A4766'],['team','Team','#5B3FD0'],['later','Later','#5F6B88']]; /* 5.2: all AA as text on white */
var GC={};GR.forEach(function(g){GC[g[0]]=g;});
var ST={wait:'Waiting on you',prog:'In progress',done:'Done',stuck:'Stuck',park:'Parked',kill:'Killed'};
var NOUN={application:'applications',email:'emails',linkedin:'LinkedIn notes',post:'posts',invoice:'invoices',template:'templates',other:'drafts'};
function shortWhat(y){var t=headline(y),m=t.match(/^(.+?[^.\s])(\.\s|;\s| — )/);if(m)t=m[1];t=t.replace(/\s*\([^)]*\)\s*\.?$/,'').replace(/\.$/,'');return cut(t,90);}
function cap1(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1);}
function apWho(a){return cut(a.to||a.subject||a.id,60);}
function apKind(a){return (KIND[a.kind]||KIND.other)[0];}
function isMoneyProj(p){return p&&(p.owner==='CFO'||(isNum(p.stage)&&p.stage>=5));}
function pill(s){return '<span class="pill s-'+s+'">'+esc(ST[s])+'</span>';}
function eight(cls){return '<svg class="e8 '+(cls||'')+'" aria-hidden="true"><use href="#eight"/></svg>';}
function owner(o){return o==='dave'?'<i class="ow dv" title="You">DM</i>':'<i class="ow tm" title="'+esc(o||'Team')+'">'+eight()+'</i>';}
/* a real due date only where the data names one ("Slot: Sun 15 Nov", "Send Mon 16 Nov"); never invented */
function dueOf(a){var m=String((a&&a.warn)||'').match(/\b(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat) (\d{1,2}) (Nov|Dec|Jan|Feb|Mar|Apr)\b/);if(!m)return null;var y=new Date().getFullYear(),d=new Date(y,MON.indexOf(m[2]),+m[1],12);if(d-new Date()<-200*864e5)d.setFullYear(y+1);return d;}
function dshort(d){return d?d.getDate()+' '+MON[d.getMonth()]:'';}
function batches(){var by={},L=[];apPending().forEach(function(a){var b=a.batch||'other';if(!by[b]){by[b]={id:b,label:a.batch_label||'Other drafts',items:[]};L.push(by[b]);}by[b].items.push(a);});return L;}
function nounOf(items){var c={};items.forEach(function(a){c[a.kind]=(c[a.kind]||0)+1;});var k=Object.keys(c).sort(function(x,y){return c[y]-c[x];});var n=k.length===1?(NOUN[k[0]]||'drafts'):'drafts';return items.length===1?n.replace(/s$/,''):n;}
/* 5.1.1: one row per action Dave must take; reasons in plain words, never team-internal ones */
var ACTS=[['cv',/CV access/i,'Allow CV access on the Mac'],['li-hand',/LinkedIn (Easy )?Apply|send (it |them |these )?by hand/i,'LinkedIn: you send these by hand'],['gofractional',/GoFractional/i,'GoFractional: sign up there to apply'],['mail',/sending not connected|studio (e-?mail|mailbox)/i,'Studio email sending isn’t connected yet']];
function actKey(t){t=String(t||'');for(var i=0;i<ACTS.length;i++)if(ACTS[i][1].test(t))return ACTS[i][0];return null;}
function plainWhy(t){var k=actKey(t);if(k)for(var i=0;i<ACTS.length;i++)if(ACTS[i][0]===k)return ACTS[i][2];
 return cap1(String(t||'').replace(/\bno arms? sends?\b[^,;.]*/gi,'the team can’t send it').replace(/\b(the |an? )?arms?\b/gi,'the team').trim());}
function held(){var by={},L=[];J8.approvals.list().forEach(function(a){if(a.status!=='approved'&&a.status!=='edited')return;var r=String(a.result||'');if(!/^Waiting/i.test(r))return;if(daveTaskBlocks(a.id))return; /* 6.0: the Dave task is the one action */
  var dave=/needs Dave/i.test(r),m=r.match(/\(([^)]*)\)/),why=(m&&dave?m[1]:r.replace(/^Waiting:\s*/i,'').replace(/\s*\(\d\d:\d\d\)\s*$/,'')).split(/;|, so | \(/)[0].trim(),ak=actKey(why),label=plainWhy(why);
  var k=(dave?'d:':'t:')+(ak||label.toLowerCase());if(!by[k]){by[k]={key:'held-'+k.replace(/[^a-z0-9]+/gi,'-').slice(0,48),dave:dave,why:label,act:ak,items:[]};L.push(by[k]);}by[k].items.push(a);});
 return L.sort(function(x,y){return (y.dave?1:0)-(x.dave?1:0)||y.items.length-x.items.length;});}
function isAsk(x){if(x.status==='done')return false;var v=sevOf(J8.inbox.lastReply(x));if(v)return v!=='g'; /* a tagged last line decides */
 return x.status==='routed'&&/NEEDS YOUR EYES|WHAT YOU DO|\?|Forward it|reply '|paste its/i.test(String(x.reply||''));}
/* 6.0.1: a row shows only the action ("Do: …"), never a raw link; the full line stays behind tap-to-expand */
function askShort(s){s=String(s||'');var m=s.match(/\bDo:\s*(.+)$/i),t=m?m[1]:s;t=t.replace(/\s*[—–-]\s*https?:\/\/\S+/g,'').replace(/https?:\/\/\S+/g,'').replace(/\s*\([^()]*\bmin\b[^()]*\)/gi,'').replace(/[\s.;:—–-]+$/,'');return cap1(cut(t||s.replace(/https?:\/\/\S+/g,''),90));}
function lastClean(x){return sevStrip(J8.inbox.lastReply(x).replace(/^\s*\d{1,2}:\d\d(?:\s*\([^)]*\))?\s*[—-]\s*/,''));}
function askLine(x){var r=String(x.reply||''),m=r.match(/(NEEDS YOUR EYES|WHAT YOU DO)\s*:\s*([^\n]+)/);if(m&&!sevOf(J8.inbox.lastReply(x)))return m[2];return lastClean(x);}
function whyMove(p){var n=String(p.next||'').trim(),m=n.match(/^(Concept|Build|Staged|Validate|Monetize|Paying)\s*:\s*(.+)$/i);
 if(m)return 'Moves '+p.name+' to '+m[1]+': '+m[2].replace(/\.$/,'');return n?cut(n,110):'Keeps '+p.name+' moving.';}
/* the one product a row is about (for its colour marker), or null */
function rowPid(i){if(i.task)return i.task.project_id||null;if(i.p)return i.p.id;if(i.c)return i.c.p;if(i.ap)return i.ap.product;var L=i.batch?i.batch.items:i.held?i.held.items:null;if(!L||!L.length)return null;var p=L[0].product;return L.every(function(a){return a.product===p;})?p:null;}
function oldTasks(){return openItems('today').concat(openItems('week'),openItems('later'));}
var ORD={wait:0,stuck:1,prog:2,park:3,done:4};

/* ===== 6.0 lead engine: one graph over tasks, drafts and projects; unlocks; one ranked queue.
   Same rules as public.j8_unlocks / public.j8_rank in the database (ops/brain/J8NIX-DATA.md):
   open = task open · draft pending/approved/edited/queued · project not done/killed. A closed blocker stops blocking.
   unlocks(X) = distinct open items reachable from X along "X blocks Y" (transitive, cycle-safe, X excluded).
   Order: actionable first → unlocks → money → deadline → age. ===== */
var G=null,SNV=0,NQ=null;
function dt(s){var t=pd(s);return isNaN(t)?null:new Date(t);}
function tasksAll(){return J8.tasks?J8.tasks.list():[];}
function isOpenAp(a){var s=a.status||'pending';return s==='pending'||s==='approved'||s==='edited'||s==='queued';}
function graph(){if(G&&G.a===AP&&G.p===PR&&G.k===TK&&G.u===UN)return G;
 var it={},out={},un={};
 J8.units.list().forEach(function(u){un[u.id]=u;});
 tasksAll().forEach(function(t){it[t.id]={k:'task',o:t,open:!t.status||t.status==='open',bb:t.blocked_by||[]};});
 J8.approvals.list().forEach(function(a){if(!it[a.id])it[a.id]={k:'approval',o:a,open:isOpenAp(a),bb:a.blocked_by||[]};});
 J8.projects.list().forEach(function(p){if(!it[p.id])it[p.id]={k:'project',o:p,open:['done','killed'].indexOf(p.status)<0,bb:p.blocked_by||[]};});
 Object.keys(it).forEach(function(id){var x=it[id];if(!x.open)return;x.bb.forEach(function(b){if(b!==id&&it[b]&&it[b].open){var o=out[b]=out[b]||[];if(o.indexOf(id)<0)o.push(id);}});});
 G={a:AP,p:PR,k:TK,u:UN,it:it,out:out,un:un,memo:{}};return G;}
function reach(id){var g=graph();if(g.memo[id])return g.memo[id];var seen={},st=[id],r=[];
 while(st.length){var n=st.pop();(g.out[n]||[]).forEach(function(d){if(d!==id&&!seen[d]){seen[d]=1;r.push(d);st.push(d);}});}
 return (g.memo[id]=r);}
function openBlk(id){var g=graph(),x=g.it[id];if(!x)return [];return x.bb.filter(function(b){return b!==id&&g.it[b]&&g.it[b].open;});}
function unlocksOf(ids){var own={},u={},L=[];ids.forEach(function(i){own[i]=1;});ids.forEach(function(i){reach(i).forEach(function(d){if(!own[d]&&!u[d]){u[d]=1;L.push(d);}});});return L;}
function daveTaskBlocks(id){var g=graph();return openBlk(id).some(function(b){var x=g.it[b];return x.k==='task'&&x.o.owner==='dave';});}
function pobj(id){return id&&PR[id]?Object.assign({id:id},PR[id]):null;}
function unitOf(p){return p?graph().un[p.unit_id]||null:null;}
function moneyP(p){if(!p)return false;var u=unitOf(p),c=u?u.code:p.owner;return (isNum(p.stage)&&p.stage>=4)||c==='CRO'||c==='CFO';}
function coveredYou(p){return tasksAll().some(function(t){var c=t.covers_you||(t.extra&&t.extra.covers_you);return (!t.status||t.status==='open')&&c&&c.p===p.id&&c.you&&String(p.you||'').indexOf(c.you)===0;});}
/* what waits, in plain words: "17 emails · 1 application · SH✡MER Command" */
function itemNames(ids,max){var g=graph(),kinds={},order=[],other=[];max=max||3;
 ids.forEach(function(id){var x=g.it[id];if(!x)return;if(x.k==='approval'){var n=NOUN[x.o.kind]||'drafts';if(!kinds[n]){kinds[n]=0;order.push(n);}kinds[n]++;}else other.push(x.k==='project'?x.o.name:x.o.title);});
 var P=order.map(function(n){return kinds[n]+' '+(kinds[n]===1?n.replace(/s$/,''):n);}).concat(other);
 return P.slice(0,max).join(' · ')+(P.length>max?' · and more':'');}
function minsOf(i){if(i.task&&isNum(i.task.minutes))return i.task.minutes;var m=String(i.full||'').match(/\((?:[^()]*?,\s*)?(\d{1,3})\s*min\b/);return m?+m[1]:null;}
function lead1(i,now,ed){now=now||Date.now();ed=ed||eod().getTime();var ids=i.ids||[],pid=rowPid(i),p=pobj(pid);
 i.ul=unlocksOf(ids);
 i.wo=(i.batch||i.ap||i.held||!ids.length)?[]:ids.map(openBlk).reduce(function(a,b){return a.concat(b.filter(function(x){return a.indexOf(x)<0;}));},[]);
 i.pp=p;i.money=i.g==='money'||moneyP(p)||!!(i.batch&&i.batch.items.some(function(a){return a.kind==='invoice';}));
 i.dl=i.sev==='r'?now:i.due?i.due.getTime():i.sev==='o'?ed:Infinity; /* 6.0.1: one clock per pass, so equal 🔴 items fall to age, as in j8_rank */
 i.age=i.since&&!isNaN(i.since)?i.since.getTime():Infinity;i.mins=minsOf(i);return i;}
function rankCmp(a,b){return (a.wo.length?1:0)-(b.wo.length?1:0)||b.ul.length-a.ul.length||(b.money?1:0)-(a.money?1:0)||(a.dl-b.dl)||(a.age-b.age)||sevRank(a.sev)-sevRank(b.sev);}
/* the mentor line: why this one now, in one line */
function mentor(i){var n=i.ul.length;
 if(i.wo.length)return 'First: '+itemNames(i.wo,2)+(n?' (then it frees '+n+')':'')+'.';
 if(n)return itemNames(i.ul)+(n===1?' waits':' wait')+' on this.';
 if(i.money&&i.pp){var nx=isNum(i.pp.stage)&&i.pp.stage<6?J8.projects.STAGES[i.pp.stage]:'';return 'Closest to money: '+i.pp.name+(nx?' moves toward '+nx:'')+'.';}
 if(i.due)return 'Due '+dshort(i.due)+'.';
 if(i.age!==Infinity){var d=Math.floor((Date.now()-i.age)/864e5);if(d>=1)return 'Waiting '+d+(d===1?' day.':' days.');}
 return '';}

/* every row of the board, one shape: {key,g,st,title,sub,own,due,ids,...} */
function rows(){var R=[],ida=function(L){return L.map(function(a){return a.id;});};
 apPending().filter(function(a){return a.kind==='invoice';}).forEach(function(a){R.push({key:'ap-'+a.id,g:'money',st:'wait',sev:'o',title:'Send '+apWho(a),sub:pname(a.product)+' · payment request',own:'dave',due:dueOf(a),ap:a,ids:[a.id]});});
 tasksAll().forEach(function(t){if(t.status==='done')return;var p=pobj(t.project_id),dv=t.owner==='dave',bl=openBlk(t.id).length>0,tm=DEPT[t.owner]||t.owner||'Team';
  R.push({key:'tk-'+t.id,g:dv?(moneyP(p)?'money':'projects'):'team',st:dv?'wait':bl?'stuck':'prog',sev:dv?(t.sev==='r'?'r':'o'):null,title:t.title,sub:(p?p.name:'Studio')+(dv?'':' · '+tm),full:t.action||'',own:dv?'dave':tm,task:t,ids:[t.id],since:dt(t.created_at),due:dt(t.due)});});
 projList().filter(function(p){return p.id!=='p-general';}).forEach(function(p){var y=coveredYou(p)?'':youReal(p),pk=p.status==='parked',g=pk?'later':isMoneyProj(p)&&y?'money':'projects';
  R.push({key:'mv-'+p.id,g:g,st:pk?'park':y?'wait':'prog',sev:y?sevOf(p.you)||'o':null,title:y?shortWhat(y):p.name,sub:y?p.name+(stageName(p.stage)?' · '+stageName(p.stage):''):cut(shortWhat(p.now||''),70)||stageName(p.stage),full:y,own:y?'dave':dept(p),why:whyMove(p),p:p,move:!!y,ids:[p.id],since:dt(p.updated)});});
 batches().forEach(function(b){if(b.items.length===1&&b.items[0].kind==='invoice')return;var ds=b.items.map(dueOf).filter(Boolean).sort(function(x,y){return x-y;});
  R.push({key:'b-'+b.id,g:'approve',st:'wait',sev:ds[0]&&ds[0]<=eod()?'r':'o',since:b.items.map(function(a){return dt(a.created);}).filter(Boolean).sort(function(x,y){return x-y;})[0]||null,title:b.items.length+' '+nounOf(b.items)+' to send',sub:b.label,own:'dave',due:ds[0]||null,batch:b,ids:ida(b.items)});});
 held().forEach(function(h){var n=h.items.length+' '+nounOf(h.items);R.push({key:h.key,g:'team',st:h.dave?'wait':'stuck',sev:h.dave?'o':null,title:h.dave?cut(h.why,70)+' ('+n+')':n.replace(/^(\d+) /,'$1 approved ')+' held',sub:h.dave?'Approved; '+(h.items.length===1?'it goes':'they go')+' out once you do this':cut(h.why,70),own:h.dave?'dave':'Team',held:h,ids:ida(h.items)});});
 J8.inbox.list().forEach(function(x){var a=isAsk(x),st=a?'wait':x.status==='done'?'done':'prog';
  R.push({key:'c-'+x.p+'-'+String(x.at),ids:[],g:'team',st:st,sev:a?sevOf(J8.inbox.lastReply(x))||'o':null,full:a?askLine(x):'',title:a?askShort(askLine(x)):pname(x.p)+(st==='done'?' · done':' · with the team'),sub:a?pname(x.p)+' team asks':cut(lastClean(x),80),own:a?'dave':dept(PR[x.p]||{}),c:x,ask:a,at:x.at,since:x.at?new Date(x.at):null});});
 var ot=oldTasks();if(ot.length)R.push({key:'old',g:'later',st:'park',title:ot.length+' older to-do items',sub:'From 3–11 Nov. Tick what is done.',own:'dave',tasks:ot});
 return R.sort(function(a,b){return GR.map(function(g){return g[0];}).indexOf(a.g)-GR.map(function(g){return g[0];}).indexOf(b.g)||ORD[a.st]-ORD[b.st];});}

/* ===== Next: today's plan, one card at a time ===== */
function snoozed(k){var z=ls('j8-snooze')||{};return z[k]&&z[k]>Date.now();}
function snooze(k,h){var z=ls('j8-snooze')||{};z[k]=Date.now()+h*36e5;ls('j8-snooze',z);SNV++;}
function queue(){return needs();} /* 5.1.1: Next and "Needs you" share one list and one order */
function eod(){var d=new Date();d.setHours(23,59,59,999);return d;}
function today(){return queue().slice(0,5);}
function nextOf(i){
 if(i.task){var t=i.task;return {what:t.title,why:t.why||'',u:t.link||'',t:t.link_text||'Open it',jump:null};}
 if(i.p){var p=i.p,u=p.you_link||p.link,t=p.you_link?(p.you_link_text||'Open it'):(p.link_text||'Open it');return {what:i.title,why:i.why,u:u,t:t};}
 if(i.batch)return {what:'Decide '+i.title.replace(/ to send$/,''),why:'They go out only after your Send. '+i.batch.label+'.',jump:'list-'+i.key,t:'Open the '+i.batch.items.length};
 if(i.held)return {what:i.title,why:i.sub+'.',jump:'list-'+i.key,t:'See what waits'};
 if(i.c)return {what:i.title,why:'The team waits for your answer on '+pname(i.c.p)+'.',jump:'list-'+i.key,t:'Answer the team'};
 if(i.ap)return {what:i.title,why:'Money in: '+(i.ap.warn?cut(i.ap.warn,90):'payment request ready.'),jump:'list-'+i.key,t:'Open it'};
 return {what:i.title,why:i.sub||''};}
function actBtn(n,cls){if(n.u){if(n.u.charAt(0)==='#')return '<button class="'+cls+'" data-jump="'+esc(n.u.slice(1))+'">'+esc(n.t)+'</button>';return '<a class="'+cls+'" href="'+esc(n.u)+'" target="_blank" rel="noopener">'+esc(n.t)+'</a>';}
 return '<button class="'+cls+'" data-jump="'+esc(n.jump||'list')+'">'+esc(n.t||'Open it')+'</button>';}
function plan(fresh,peek){var td=ymd(new Date()),p=ls('j8-plan'),Q=queue();if(fresh||!p||p.d!==td||!p.k||!p.k.length){p={d:td,k:Q.slice(0,5).map(function(x){return x.key;}),l:{}};if(!peek)ls('j8-plan',p);}
 var by={};rows().forEach(function(r){by[r.key]=r;});var inQ={};Q.forEach(function(q){inQ[q.key]=1;});
 return {p:p,L:p.k.map(function(k){return {key:k,row:by[k],open:!!inQ[k],later:!!(p.l&&p.l[k])};}),Q:Q};}
/* 6.0 the lead: ONE "Do this first" card (action, link, minutes, unlocks N + why), then the next 3, then the rest by unit → project */
function canDone(i){return !i.batch&&!i.ap;}
function leadCard(i,full){var n=nextOf(i),pid=rowPid(i),why=mentor(i),how=i.task?String(i.task.action||''):(i.full&&shortWhat(i.full)!==String(i.full).trim()?i.full:''),go=n.u||n.jump;
 var prim=go||!canDone(i)?actBtn(n,'pri'):'<button class="pri" data-ndone="'+esc(i.key)+'">'+ic('done')+'Done</button>';
 return '<article class="df'+(full?' full':'')+'" aria-label="Do this first"'+(pcol(pid)?' style="--pc:'+pcol(pid)[0]+'"':'')+'>'
  +'<div class="df-top"><span class="df-k">'+eight()+'Do this first</span><span class="df-r">'+(i.ul.length?'<b class="ul">◆ unlocks '+i.ul.length+'</b>':'')+(i.mins?'<span class="mn">~'+i.mins+' min</span>':'')+'</span></div>'
  +'<h2 dir="auto">'+(full?esc(cap1(n.what)):'<button class="dft" data-go="next">'+esc(cap1(n.what))+'</button>')+'</h2>'+(why?'<p class="why" dir="auto">'+esc(why)+'</p>':'')
  +(how?'<p class="how1'+(full?'':' clamp')+'" dir="auto">'+esc(how)+'</p>':'')
  +(full&&n.why&&!i.task&&n.why!==why?'<p class="ctx" dir="auto">'+esc(n.why)+'</p>':'')
  +'<div class="df-meta">'+sevChip(i.sev)+'<span class="pj" dir="auto">'+pm(pid)+esc(i.sub||'')+'</span></div>'
  +'<div class="df-act">'+prim+'<span class="sec2">'+(canDone(i)&&go?'<button data-ndone="'+esc(i.key)+'">'+ic('done')+'Done</button>':'')+'<button data-nlater="'+esc(i.key)+'">Later</button></span></div>'+(full&&i.task?taskBox(i.task):'')+'</article>';}
/* 6.0.1 a comment box on every task (Dave, 14 Nov 18:17): the message carries task_id; the database routes it to the task's
   project and unit; under the box only the team's latest reply shows (one line, tap for all). Dave's own text is never listed back. */
function taskBox(t){if(!t)return '';var x=J8.inbox.forTask?J8.inbox.forTask(t.id)[0]:null,k='tr-'+t.id,o=openRow[k],h='<form class="ans tc" data-ans="'+esc(t.project_id||'p-general')+'" data-task="'+esc(t.id)+'"><textarea rows="1" dir="auto" placeholder="Comment on this task" aria-label="Comment on: '+esc(t.title)+'"></textarea><button type="submit" aria-label="Send the comment">'+ic('send')+'</button></form>';
 if(x){var R=String(x.reply||'').split('\n').filter(function(l){return l.trim();}),last=R.length?lastClean(x):'';
  if(last)h+='<button class="trp'+(o?' open':'')+'" data-open="'+esc(k)+'" aria-expanded="'+(o?'true':'false')+'"><span class="trl" dir="auto">'+sevChip(sevOf(J8.inbox.lastReply(x)))+esc(last)+'</span></button>'
   +(o?'<div class="trx" dir="auto">'+R.map(function(l){return esc(sevStrip(l.replace(/^\s*\d{1,2}:\d\d(?:\s*\([^)]*\))?\s*[—-]\s*/,'')));}).join('<br>')+'</div>':'');}
 return h;}
function lxBody(i){var n=nextOf(i),w=mentor(i),how=i.task?String(i.task.action||''):String(i.full||''),go=n.u||n.jump;
 return (w?'<p class="why" dir="auto">'+esc(w)+'</p>':'')+(how&&how!==n.what?'<p dir="auto">'+esc(how)+'</p>':'')
  +'<div class="acts">'+(go||!canDone(i)?actBtn(n,'s'):'')+(canDone(i)?'<button data-ndone="'+esc(i.key)+'">Done</button>':'')+'<button data-nlater="'+esc(i.key)+'">Later</button>'+(i.mins?'<span class="mn">~'+i.mins+' min</span>':'')+'</div>'+(i.task?taskBox(i.task):'');}
function leadRow(i,no){var nx=nextOf(i),k='ld-'+i.key,o=openRow[k],v=SEV[i.sev]?i.sev:'o';
 return '<li class="lr'+(o?' open':'')+(NEWK[i.key]?' nw':'')+'"><button class="ni" data-open="'+esc(k)+'" aria-expanded="'+(o?'true':'false')+'"><span class="no">'+no+'</span><span class="e" role="img" aria-label="'+esc(SEV[v][1])+'"><i class="sd sd-'+v+'"></i></span><span class="t" dir="auto">'+esc(cap1(nx.what))+(i.sub?' <small>· '+pm(rowPid(i))+esc(i.sub)+'</small>':'')+'</span>'+(i.ul.length?'<b class="ulb" aria-label="unlocks '+i.ul.length+'">◆'+i.ul.length+'</b>':'')+'</button>'
  +(o?'<div class="lx">'+lxBody(i)+'</div>':'')+'</li>';}
function unitsSorted(){return J8.units.departments().slice().sort(function(a,b){return (a.sort||0)-(b.sort||0);});}
function restTree(L,start){var by={},keys=[];
 L.forEach(function(i,k){i._n=start+k;var pid=rowPid(i),p=pobj(pid),u=unitOf(p),uk=u?u.id:'_';
  if(!by[uk]){by[uk]={u:u,P:{},order:[]};}var pk=pid||'_';if(!by[uk].P[pk]){by[uk].P[pk]={name:p?p.name:'Studio',pid:pid,L:[]};by[uk].order.push(pk);}by[uk].P[pk].L.push(i);});
 unitsSorted().forEach(function(u){if(by[u.id])keys.push(u.id);});if(by._)keys.push('_');
 return keys.map(function(k){var g=by[k],ok='lu-'+k,o=openRow[ok],n=0;g.order.forEach(function(pk){n+=g.P[pk].L.length;});
  return '<section class="lu'+(o?' open':'')+'"><button class="luh" data-open="'+esc(ok)+'" aria-expanded="'+(o?'true':'false')+'"><b>'+esc(g.u?g.u.name:'Studio')+'</b><span>'+n+' wait on you</span><svg class="ico chev" aria-hidden="true"><use href="#i-more"/></svg></button>'
   +(o?g.order.map(function(pk){var P=g.P[pk];return '<div class="lp"><p class="lpn" dir="auto">'+pm(P.pid)+esc(P.name)+'</p><ul class="nd lead">'+P.L.map(function(i){return leadRow(i,i._n);}).join('')+'</ul></div>';}).join(''):'')+'</section>';}).join('');}
function renderNext(){var el=$('v-next');if(!el)return;if(document.activeElement&&el.contains(document.activeElement)&&document.activeElement.tagName==='TEXTAREA')return;
 if(!connected){el.innerHTML='<div class="empty"><b>Loading your next move…</b><p>Signing in and loading your live data.</p></div>';return;}
 var N=needs();
 if(!N.length){el.innerHTML='<div class="nx-wrap"><div class="empty">'+eight('big')+'<b>Nothing waits on you.</b><p>Ask J8NIX what to push next.</p><button class="pri" data-go="chat">Open the chat</button></div></div>';return;}
 var ul=N.filter(function(i){return i.ul.length;}).length,h='<div class="nx-wrap"><p class="lsum">'+N.length+' wait on you. '+(ul?'Start with what unlocks the most.':'Start with what is closest to money.')+'</p>'+leadCard(N[0],true);
 if(N.length>1)h+='<h3 class="lh">Then</h3><ul class="nd lead">'+N.slice(1,4).map(function(i,k){return leadRow(i,k+2);}).join('')+'</ul>';
 if(N.length>4)h+='<h3 class="lh">Everything else <span>'+(N.length-4)+'</span></h3>'+restTree(N.slice(4),5);
 el.innerHTML=h+'</div>';}
function markDone(k){var i=rows().filter(function(x){return x.key===k;})[0];
 if(i&&i.task){var id=i.task.id,n=(graph().out[id]||[]).filter(function(d){return openBlk(d).filter(function(b){return b!==id;}).length===0;}).length; /* 6.0.1: only items with no other open blocker */if(!J8.status().connected){toast('Not connected. Try again in a moment.');return;}
  J8.tasks.done(id).then(function(){toast(n?'Done. '+n+(n===1?' item is':' items are')+' free to go.':'Done. It stays under Done in the List.',function(){J8.tasks.undo(id).then(function(){toast('Back on your list.');},function(){toast('Couldn’t undo. Try again.');});});},
   function(e){toast(e&&e.code==='conflict'?'It changed meanwhile. Try again.':'Couldn’t save ('+(e&&e.code||'error')+'). Try again.');});renderAll();return;}
 snooze(k,24);
 if(i&&(i.p||i.held||i.c)&&J8.status().connected){var pid=i.p?i.p.id:i.c?i.c.p:(i.held.items[0]||{}).product||'p-general';
  J8.inbox.send(pid,'Done: '+(i.full||i.title)).then(function(){toast('Marked done. The team is told.');},function(){toast('Marked done here. Couldn’t tell the team.');});}
 else toast('Marked done.');renderAll();}

/* ===== Chat: a messenger; decisions are interactive message cards ===== */
function pvText(t,n){var L=String(t||'').split('\n').map(function(x){return x.replace(/\s+/g,' ').trim();}).filter(Boolean),o=[],c=0;for(var k=0;k<L.length&&c<(n||160);k++){var x=L[k].slice(0,(n||160)-c);if(x.length<L[k].length)x+='…';o.push(x);c+=x.length;}return o.join('\n');}
function tm(iso){var t=iso?new Date(iso):new Date();return isNaN(t)?'':(ymd(t)===ymd(new Date())?t.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):t.getDate()+' '+MON[t.getMonth()]);}
function apCard(a,pre){var id=a.id,ed=editing===id,o=openRow[(pre||'cb')+id],txt=J8.approvals.textOf(a);
 return '<div class="msg in card'+(pcol(a.product)?' brand':'')+'" id="'+(pre||'cb')+'-'+esc(id)+'"'+(pcol(a.product)?' style="--pc:'+pcol(a.product)[0]+'"':'')+'><div class="c-top">'+pill('wait')+pm(a.product)+'<span dir="auto">'+esc(apKind(a))+' · '+esc(pname(a.product))+'</span></div>'
  +'<button class="c-main" data-open="'+(pre||'cb')+esc(id)+'"><b dir="auto">'+esc(apWho(a))+'</b>'
  +(ed?'':'<span class="pv'+(o?' full':'')+'" dir="auto">'+esc(o?txt:pvText(txt,150))+'</span>')+'</button>'
  +(ed?'<textarea class="aed" id="ed-'+esc(id)+'" dir="auto" aria-label="Edit the text">'+esc(txt)+'</textarea>':'')
  +(o&&a.warn?'<p class="warn" dir="auto">'+esc(cut(a.warn,220))+'</p>':'')+(o&&a.link?'<a class="lnk" href="'+esc(a.link)+'" target="_blank" rel="noopener">'+esc(a.link_text||'Open the link')+'</a>':'')
  +'<time>'+esc(tm(a.created))+'</time>'
  +'<div class="btns'+(ed?'':' b4')+'">'+(ed?'<button class="s" data-apsave="'+esc(id)+'">Save and send</button><button data-apcancel="'+esc(id)+'">Cancel</button>'
    :'<button class="s" data-apsend="'+esc(id)+'">'+ic('send')+'Send</button><button data-apedit="'+esc(id)+'">'+ic('edit')+'Edit</button><button data-apkill="'+esc(id)+'">'+ic('kill')+'Kill</button><button data-apnote="'+esc(id)+'" aria-expanded="'+(openRow['apn'+id]?'true':'false')+'">'+ic('chat')+'Comment</button>')+'</div>'
  +(!ed&&openRow['apn'+id]?apNoteBox(a):'')+apReply(a)+'</div>';}
/* 6.1 a note on a draft (Dave, 14 Nov 18:48): goes to the team tagged with the draft; the draft's status is untouched,
   unless Dave picks Approve + note or Kill + note. Under the card: the team's latest reply, one line, tap for all. */
function apNoteBox(a){return '<form class="ans apn" data-ans="'+esc(a.product||'p-general')+'" data-ap="'+esc(a.id)+'"><textarea rows="1" dir="auto" placeholder="Note to the team (the draft stays as it is)" aria-label="Note on the draft to '+esc(apWho(a))+'"></textarea><button type="submit" aria-label="Send the note">'+ic('send')+'</button></form>'
 +'<div class="apn-act"><button data-apnd="send" data-id="'+esc(a.id)+'">Approve + note</button><button data-apnd="kill" data-id="'+esc(a.id)+'">Kill + note</button></div>';}
function apReply(a){var x=J8.inbox.forApproval?J8.inbox.forApproval(a.id)[0]:null;if(!x)return '';var R=String(x.reply||'').split('\n').filter(function(l){return l.trim();});if(!R.length)return '';var k='apr-'+a.id,o=openRow[k];
 return '<button class="trp'+(o?' open':'')+'" data-open="'+esc(k)+'" aria-expanded="'+(o?'true':'false')+'"><span class="trl" dir="auto">'+sevChip(sevOf(J8.inbox.lastReply(x)))+esc(lastClean(x))+'</span></button>'
  +(o?'<div class="trx" dir="auto">'+R.map(function(l){return esc(sevStrip(l.replace(/^\s*\d{1,2}:\d\d(?:\s*\([^)]*\))?\s*[—-]\s*/,'')));}).join('<br>')+'</div>':'');}
function renderBrief(){var el=$('brief');if(!el)return;if(document.activeElement&&el.contains(document.activeElement)&&document.activeElement.tagName==='TEXTAREA')return;
 if(!connected){el.innerHTML='<div class="msg in"><p>Loading your board…</p></div>';return;}
 var pend=apPending(),top=pend.slice(0,3),Q=queue(),mv=Q.filter(function(i){return !i.batch;})[0],now=tm(),h='';
 h+='<div class="msg in"><p dir="auto">'+(pend.length?(pend.length===1?'One draft waits for your Send.':pend.length+' drafts wait for your Send. The top '+top.length+':'):'Nothing waits for your Send.')+'</p><time>'+now+'</time></div>';
 h+=top.map(function(a){return apCard(a,'cb');}).join('');
 if(pend.length>top.length)h+='<div class="msg in card slim"><p>'+(pend.length-top.length)+' more drafts are in your list.</p><time>'+now+'</time><div class="btns"><button class="s" data-jump="list-approve">Open the list</button></div></div>';
 if(mv){var n=nextOf(mv);h+='<div class="msg in card"><div class="c-top">'+pill('wait')+pm(rowPid(mv))+'<span>Your move · '+esc(mv.p?mv.p.name:GC[mv.g][1])+'</span></div><div class="c-main"><b dir="auto">'+esc(n.what)+'</b><span class="pv" dir="auto">'+esc(cut(n.why,120))+'</span></div><time>'+now+'</time><div class="btns"><button class="s" data-go="next">Do it</button><button data-blater="'+esc(mv.key)+'">Later</button></div></div>';}
 el.innerHTML=h;}
function renderApprovals(){renderBrief();if(view==='list')renderList();} /* [chat] */

/* ===== 5.1 pinned top of Chat: "since you last looked" + everything that needs Dave, most urgent first ===== */
var pinAll=false;
function seenAt(){var v=ls('j8-seen');return isNum(v)?v:null;}
var SEEN=seenAt(); /* the moment Dave last left the app; stored on this phone only */
function markSeen(){ls('j8-seen',Date.now());}
document.addEventListener('visibilitychange',function(){if(document.hidden)markSeen();else{SEEN=seenAt();soon();}});
window.addEventListener('pagehide',markSeen);
var ACK=/Got it — the team picks this up within the hour\.?\s*$/;
function sinceCounts(b){var c={ok:0,bad:0,dr:0,rp:0};
 J8.runs.list().forEach(function(r){if(!(pd(r.ended)>b))return;if(r.status==='failed')c.bad++;else if(r.status&&['nothing','running','started'].indexOf(r.status)<0)c.ok++;});
 J8.approvals.list().forEach(function(a){if(pd(a.created)>b)c.dr++;});
 J8.inbox.list().forEach(function(x){var L=replyTimes(x);if(L===null){var l=J8.inbox.lastReply(x);if(pd(x.updated_at)>b&&l&&!ACK.test(l))c.rp++;return;}
  L.forEach(function(t){if(t>b)c.rp++;});});
 return c;}
/* reply lines carry Israel time "HH:MM — " (sometimes "HH:MM (13 Nov) — "): date each line from the message day, rolling to the next day when the clock goes back. null = no line could be dated. */
var ILF=window.Intl?new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}):null;
function ilParts(ms){var o={};ILF.formatToParts(new Date(ms)).forEach(function(p){o[p.type]=+p.value;});return o;}
function ilMs(y,mo,d,h,mi){var g=Date.UTC(y,mo,d,h,mi),q=ilParts(g),off=Date.UTC(q.year,q.month-1,q.day,q.hour,q.minute)-g;return g-off;}
function replyTimes(x){if(!ILF)return null;var t0=pd(x.at);if(isNaN(t0))return null;var p=ilParts(t0),y=p.year,mo=p.month-1,d=p.day,prev=p.hour*60+p.minute,out=[],any=false;
 String(x.reply||'').split('\n').forEach(function(l){var m=l.match(/^\s*(\d{1,2}):(\d\d)(?:\s*\((\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\))?\s*[—-]\s*(.*)$/);if(!m)return;any=true;
  var mins=+m[1]*60+(+m[2]);if(m[3]){d=+m[3];mo=MON.indexOf(m[4]);}else if(mins<prev){var nd=new Date(Date.UTC(y,mo,d+1));y=nd.getUTCFullYear();mo=nd.getUTCMonth();d=nd.getUTCDate();}
  prev=mins;if(!ACK.test(l))out.push(ilMs(y,mo,d,+m[1],+m[2]));});
 return any?out:null;}
function sinceLine(){var b=SEEN,lbl;if(!isNum(b)){b=Date.now()-864e5;lbl='In the last 24 h';}else lbl='Since you last looked ('+hhmm(new Date(b).toISOString())+')';
 var c=sinceCounts(b),P=[],pl=function(n,one,many){return n+' '+(n===1?one:many);};
 if(c.ok)P.push(pl(c.ok,'run done','runs done'));if(c.bad)P.push(c.bad+' failed');if(c.dr)P.push(pl(c.dr,'new draft','new drafts'));if(c.rp)P.push(pl(c.rp,'reply','replies'));
 return lbl+': '+(P.length?P.join(' · '):'nothing new')+'.';}
/* order: severity, then money, team questions, drafts, held sends, project moves. A project move that repeats a listed draft batch or held send is left out. */
function dupMove(i,R){if(!i.p||!i.move)return false;var y=youRaw(i.p),ak=actKey(y);
 if(ak&&R.some(function(h){return h.held&&h.held.dave&&h.held.act===ak;}))return true;
 if(/\bApprove\b/.test(y)&&!/\(2\)/.test(y)&&R.some(function(b){return b.batch&&b.batch.items.some(function(a){return a.product===i.p.id;});}))return true;
 return false;}
/* 6.0: Dave's queue, ranked by the lead formula (unlocks → money → deadline → age); memoised per data change */
function needs(){var mk=[AP,PR,TK,UN,CMT,S,SNV,Math.floor(Date.now()/6e4)];if(NQ&&NQ.k.every(function(x,j){return x===mk[j];}))return NQ.v.slice();
 var o={money:0,team:1,approve:2,projects:4},w=function(i){return i.held?3:o[i.g];},R=rows().filter(function(i){return i.st==='wait'&&o[i.g]!=null&&!snoozed(i.key);});
 var now=Date.now(),ed=eod().getTime();R=R.filter(function(i){return !dupMove(i,R);}).map(function(i){return lead1(i,now,ed);}).sort(function(a,b){return rankCmp(a,b)||w(a)-w(b);});
 NQ={k:mk,v:R};return R.slice();}
function ndHref(i){var u=i.p&&i.p.you_link||'';return /^https?:\/\//.test(u)&&!/3shamrocks\.com\/j8\/?(#.*)?$/.test(u)?u:null;}
function ndItem(i){var v=SEV[i.sev]?i.sev:'o',u=ndHref(i),inner='<span class="e" role="img" aria-label="'+esc(SEV[v][1])+'"><i class="sd sd-'+v+'"></i></span><span class="t" dir="auto">'+esc(cap1(i.title))+(i.sub?' <small>· '+pm(rowPid(i))+esc(i.sub)+'</small>':'')+'</span>';
 return '<li'+(NEWK[i.key]?' class="nw"':'')+'>'+(u?'<a class="ni" href="'+esc(u)+'" target="_blank" rel="noopener">'+inner+ic('link')+'</a>':'<button class="ni" data-jump="list-'+esc(i.key)+'">'+inner+'</button>')+'</li>';}
/* 5.2 motion that informs: a new Needs-you item flashes once; the count bumps when it changes. Nothing on the first paint. */
var NEEDK=null,NEWK={},NEEDN=null;
function bump(el){if(!el)return;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
function renderPin(){var el=$('j8Pin');if(!el)return;if(!connected){el.hidden=true;return;}el.hidden=false;
 var N=needs(),h='<p class="since" id="j8Since">'+esc(sinceLine())+'</p>';
 var K={};N.forEach(function(i){K[i.key]=1;});NEWK={};if(NEEDK)N.forEach(function(i){if(!NEEDK[i.key])NEWK[i.key]=1;});NEEDK=K;
 if(!N.length)h+='<p class="nd-0">Nothing needs you right now.</p>';
 else{h+=leadCard(N[0],false);
  if(N.length>1&&MQ.matches)h+='<button class="thn" data-go="next"><b>Then</b><span class="t" dir="auto">2 · '+esc(cap1(nextOf(N[1]).what))+'</span><em id="ndN">+'+(N.length-1)+'</em>'+ic('more')+'</button>'; /* 6.0.1: phones keep the chat in view */
  else if(N.length>1)h+='<div class="nd-h"><b>Then</b><span class="nc" id="ndN">'+N.length+' in order</span><button data-go="next">'+(N.length>4?'All '+N.length:'Open Next')+'</button></div><ul class="nd lead">'+N.slice(1,4).map(function(i,k){return leadRow(i,k+2);}).join('')+'</ul>';}
 el.innerHTML=h;
 if(NEEDN!==null&&NEEDN!==N.length)bump($('ndN'));NEEDN=N.length;}

/* ===== List: a board, one coloured group per category ===== */
function rowHTML(i){var o=openRow[i.key],g=GC[i.g];
 var h='<div class="brow'+(o?' open':'')+'" id="'+esc(i.batch?'approvals-'+i.batch.id:'r-'+i.key)+'" style="--gc:'+g[2]+pcStyle(rowPid(i))+'">'
  +'<button class="bmain" data-open="'+esc(i.key)+'" aria-expanded="'+(o?'true':'false')+'">'+pill(i.st)+'<span class="bt"><b dir="auto">'+esc(i.title)+'</b><span dir="auto">'+pm(rowPid(i))+esc(i.sub||'')+'</span></span>'+owner(i.own)+'<span class="bd'+(i.due?'':' sn')+'">'+(i.due?dshort(i.due):i.since?dshort(i.since):'')+'</span></button>';
 if(o){h+='<div class="bx">';
  if(i.p){var p=i.p,u=p.you_link||p.link;h+=(i.full?'<p dir="auto">'+esc(i.full)+'</p>':'<p dir="auto">'+esc(p.now||'')+'</p>')+'<p class="why">'+esc(i.why)+'</p><div class="acts">'
    +(u?(u.charAt(0)==='#'?'<button class="s" data-jump="'+esc(u.slice(1))+'">'+esc(p.you_link_text||'Open it')+'</button>':'<a class="s" href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(p.you_link?(p.you_link_text||'Open it'):(p.link_text||'Open it'))+'</a>'):'')
    +(i.move?'<button data-ndone="'+esc(i.key)+'">Done</button><button data-nlater="'+esc(i.key)+'">Later</button>':'')+'</div>';}
  if(i.task){var tk=i.task,bl=openBlk(tk.id);h+=(tk.action?'<p dir="auto">'+esc(tk.action)+'</p>':'')+(bl.length?'<p class="why" dir="auto">Waits on: '+esc(itemNames(bl,2))+'</p>':'')+'<div class="acts">'+(tk.link?linkBtn(tk.link,tk.link_text||'Open it','s'):'')+(tk.owner==='dave'?'<button data-ndone="'+esc(i.key)+'">Done</button><button data-nlater="'+esc(i.key)+'">Later</button>':'')+'</div>'+taskBox(tk);}
  if(i.batch)h+=i.batch.items.map(function(a){return apCard(a,'ap');}).join('');
  if(i.ap)h+=apCard(i.ap,'ap');
  if(i.held)h+='<p dir="auto">'+esc(i.held.why)+'</p><ul class="who">'+i.held.items.map(function(a){return '<li dir="auto">'+esc(apWho(a))+'</li>';}).join('')+'</ul>';
  if(i.c)h+='<p class="team" dir="auto">'+esc(cut(J8.inbox.lastReply(i.c),600))+'</p>'+(i.c.status!=='done'?'<form class="ans" data-ans="'+esc(i.c.p)+'"><textarea rows="1" dir="auto" placeholder="Answer the team" aria-label="Answer the team"></textarea><button type="submit" aria-label="Send to the team">'+ic('send')+'</button></form>':'');
  if(i.tasks)h+=i.tasks.slice(0,60).map(function(t){return '<div class="task"><button class="tk" data-ck="'+esc(t.id)+'" aria-label="Tick">'+ic('done')+'</button><span dir="auto">'+esc(cut(t.t,110))+'</span></div>';}).join('');
  h+='</div>';}
 return h+'</div>';}
function gbar(g,L){var c={};if(g==='approve'){var A=J8.approvals.list();c.wait=A.filter(function(a){return !a.status||a.status==='pending';}).length;c.prog=A.filter(function(a){return a.status==='approved'||a.status==='edited';}).length;c.done=A.filter(function(a){return a.status==='sent';}).length;c.kill=A.filter(function(a){return a.status==='killed';}).length;}
 else L.forEach(function(i){var n=i.tasks?i.tasks.length:1;c[i.st]=(c[i.st]||0)+n;});
 var tot=0;Object.keys(c).forEach(function(k){tot+=c[k];});if(!tot)return '';
 return '<div class="gbar" aria-label="Status mix">'+['wait','stuck','prog','done','park','kill'].filter(function(k){return c[k];}).map(function(k){return '<i class="s-'+k+'" style="flex:'+c[k]+'" title="'+esc(ST[k]+': '+c[k])+'"></i>';}).join('')+'</div>'
  +(g!=='approve'?'':'<p class="gcap">'+['wait','stuck','prog','done','park','kill'].filter(function(k){return c[k];}).map(function(k){return c[k]+' '+ST[k].toLowerCase();}).join(' · ')+' (all drafts)</p>');}
/* ===== 6.0 List by unit: units → projects → tasks; stage → next stage, owner, real done/total, links, Done, comment box ===== */
function curLmode(){return lmode||ls('j8-lmode')||'unit';}
function taskLine(t){var bl=openBlk(t.id),dv=t.owner==='dave',tm=DEPT[t.owner]||t.owner||'Team',xk='tx-'+t.id,xo=openRow[xk];
 return '<div class="task'+(dv?'':' tm')+(bl.length?' bl':'')+'">'+(dv?'<button class="tk" data-tdone="'+esc(t.id)+'" aria-label="Mark done: '+esc(t.title)+'">'+ic('done')+'</button>':'<i class="tmd" aria-hidden="true"></i>')
  +'<span class="tw"><button class="tt" data-open="'+esc(xk)+'" aria-expanded="'+(xo?'true':'false')+'" dir="auto">'+esc(t.title)+'<small>'+(dv?'You':esc(tm))+(isNum(t.minutes)&&dv?' · ~'+t.minutes+' min':'')+(bl.length?' · waits on: '+esc(itemNames(bl,2)):'')+'</small></button>'
  +(xo?(t.action?'<p class="ta" dir="auto">'+esc(t.action)+'</p>':'')+(t.link?linkBtn(t.link,t.link_text||'Open','lk2'):'')+taskBox(t):'')+'</span></div>';}
function doneLine(t){var xk='tx-'+t.id,xo=openRow[xk];return '<div class="task done"><button class="tk on" data-tundo="'+esc(t.id)+'" aria-label="Untick: '+esc(t.title)+'">'+ic('done')+'</button><span class="tw"><button class="tt" data-open="'+esc(xk)+'" aria-expanded="'+(xo?'true':'false')+'" dir="auto">'+esc(t.title)+'<small>Done '+esc(t.done_at?fdate(t.done_at):'')+(t.unlocked_on_done?' · unlocked '+t.unlocked_on_done:'')+'</small></button>'+(xo?taskBox(t):'')+'</span></div>';}
function projRow(p,mine){var k='pj-'+p.id,o=openRow[k],T=tasksAll().filter(function(t){return t.project_id===p.id;}),A=J8.approvals.list().filter(function(a){return a.product===p.id&&a.status!=='killed';});
 var tot=T.length+A.length,dn=T.filter(function(t){return t.status==='done';}).length+A.filter(function(a){return a.status==='sent';}).length,pct=tot?Math.round(dn/tot*100):0;
 var sn=stageName(p.stage),nx=isNum(p.stage)&&p.stage<6?J8.projects.STAGES[p.stage]:'',pk=p.status==='parked',own=mine.length?'dave':dept(p);
 var h='<div class="brow pj'+(o?' open':'')+'" id="pj-'+esc(p.id)+'" style="--gc:#3A4766'+pcStyle(p.id)+'"><button class="pmain" data-open="'+esc(k)+'" aria-expanded="'+(o?'true':'false')+'">'
  +'<span class="bt"><b dir="auto">'+pm(p.id)+' '+esc(p.name)+'</b><span>'+(pk?'Parked · ':'')+(sn?esc(sn)+(nx?' → '+esc(nx):''):'No stage yet')+(mine.length?' · <em class="wy">'+mine.length+' wait on you</em>':'')+'</span></span>'+owner(own)
  +'<span class="pgw"><span class="pg" role="img" aria-label="'+(tot?dn+' of '+tot+' done':'Nothing counted yet')+'"><i style="width:'+pct+'%"></i></span><span class="pgt">'+(tot?dn+' of '+tot+' done':'Nothing counted yet')+'</span></span></button>';
 if(o){var team=T.filter(function(t){return t.status!=='done'&&t.owner!=='dave';}),D=T.filter(function(t){return t.status==='done';}).sort(function(a,b){return String(b.done_at||'').localeCompare(String(a.done_at||''));}),
   pend=A.filter(function(a){return !a.status||a.status==='pending';}),bk=pend.length?'list-b-'+(pend[0].batch||'other'):'',wo=openBlk(p.id);
  h+='<div class="bx"><p class="nxs" dir="auto"><b>Next stage</b>'+esc(whyMove(p))+'</p>'+(wo.length?'<p class="why" dir="auto">Waits on: '+esc(itemNames(wo,3))+'</p>':'')+(p.now?'<p class="why" dir="auto">'+esc(cut(p.now,240))+'</p>':'');
  if(mine.length)h+='<p class="sub">Yours, in order</p><ul class="nd lead">'+mine.map(function(x){return leadRow(x.i,x.n);}).join('')+'</ul>';
  if(team.length)h+='<p class="sub">The team</p>'+team.map(taskLine).join('');
  var links=(p.link?linkBtn(p.link,p.link_text||'Open the project','lk2'):'')+(p.you_link&&p.you_link!==p.link&&!/3shamrocks\.com\/j8\/?(#.*)?$/.test(p.you_link)?linkBtn(p.you_link,p.you_link_text||'Open your step','lk2'):'')+(bk?'<button class="lk2" data-jump="'+esc(bk)+'">'+pend.length+(pend.length===1?' draft waits':' drafts wait')+' for your Send</button>':'');
  if(links)h+='<div class="lks">'+links+'</div>';
  if(D.length){var dk='dn-'+p.id;h+='<button class="gmore" data-open="'+esc(dk)+'" aria-expanded="'+(openRow[dk]?'true':'false')+'">Done ('+D.length+')</button>'+(openRow[dk]?D.map(doneLine).join(''):'');}
  h+='<form class="ans" data-ans="'+esc(p.id)+'"><textarea rows="1" dir="auto" placeholder="Comment to the team" aria-label="Comment to the team about '+esc(p.name)+'"></textarea><button type="submit" aria-label="Send the comment">'+ic('send')+'</button></form></div>';}
 return h+'</div>';}
function treeHTML(){var N=needs(),pos={};N.forEach(function(i,k){var pid=rowPid(i);if(pid)(pos[pid]=pos[pid]||[]).push({i:i,n:k+1});});
 var U=unitsSorted(),P=projList().filter(function(p){return p.id!=='p-general';}),first=function(p){return pos[p.id]?pos[p.id][0].n:1e4;},h='';
 U.map(function(u){return {u:u,L:P.filter(function(p){return p.unit_id===u.id;})};}).concat([{u:null,L:P.filter(function(p){return !U.some(function(u){return u.id===p.unit_id;});})}]).forEach(function(g){if(!g.L.length)return;
  var w=0;g.L.forEach(function(p){w+=(pos[p.id]||[]).length;});g.L.sort(function(a,b){return first(a)-first(b);});
  h+='<section class="grp un"><div class="gh"><h2>'+esc(g.u?g.u.name:'Other')+'</h2><span>'+(w?w+' wait on you':g.L.length+(g.L.length===1?' project':' projects'))+'</span></div><div class="gtbl">'+g.L.map(function(p){return projRow(p,pos[p.id]||[]);}).join('')+'</div></section>';});
 return h||'<div class="empty"><b>No projects yet.</b></div>';}
function lmodeBar(){var m=curLmode();return '<div class="lmode" role="tablist" aria-label="Group the list">'+[['unit','By unit'],['type','By type']].map(function(x){return '<button role="tab" aria-selected="'+(m===x[0])+'" class="'+(m===x[0]?'on':'')+'" data-lmode="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div>';}
function renderList(){var el=$('v-list');if(!el)return;if(document.activeElement&&el.contains(document.activeElement)&&document.activeElement.tagName==='TEXTAREA')return;
 if(!connected){el.innerHTML='<div class="empty"><b>Loading your board…</b></div>';return;}
 if(curLmode()==='unit'){el.innerHTML=lmodeBar()+treeHTML();return;}
 var R=rows(),h=lmodeBar()+'<div class="cats" role="tablist">'+[['all','All']].concat(GR).map(function(c){var k=c[0];return '<button role="tab" aria-selected="'+(lcat===k)+'" class="'+(lcat===k?'on':'')+'" data-cat="'+k+'"'+(c[2]?' style="--gc:'+c[2]+'"':'')+'>'+c[1]+'</button>';}).join('')+'</div>';
 GR.forEach(function(g){if(lcat!=='all'&&lcat!==g[0])return;var L=R.filter(function(i){return i.g===g[0];});if(!L.length)return;var w=L.filter(function(i){return i.st==='wait';}).length,col=openRow['g-'+g[0]];
  if(g[0]==='team'&&lcat==='all'&&!col)L=L.filter(function(i){return i.st!=='done';});
  h+='<section class="grp" style="--gc:'+g[2]+'"'+(g[0]==='approve'?' id="approvals"':'')+'><div class="gh"><h2>'+g[1]+'</h2><span>'+(w?w+' waiting on you':L.length+' items')+'</span></div>'
   +gbar(g[0],R.filter(function(i){return i.g===g[0];}))+'<div class="gtbl">'+L.map(rowHTML).join('')+'</div>'
   +(g[0]==='team'&&lcat==='all'&&!col&&R.some(function(i){return i.g==='team'&&i.st==='done';})?'<button class="gmore" data-open="g-team">Show done</button>':'')+'</section>';});
 el.innerHTML=h;}

/* ===== Stats: a report, real numbers only ===== */
var MS=[['M1','2026-11-21',25000],['M2','2026-12-21',90000],['M3','2027-01-21',200000],['M4','2027-02-21',380000],['M5','2027-03-21',640000],['M6','2027-04-21',1000000]]; /* the plan in ops/brain/BRAIN.md; M1 and M6 also in money/summary */
var START='2026-10-21';
function funnel(){var t=String((PR['p-services']||{}).now||''),r=t.match(/(\d+)\s+repl/i),c=t.match(/(\d+)\s+calls?/i);return {replies:r?+r[1]:null,calls:c?+c[1]:null};}
function testers(){var m=String((PR['p-shomer']||{}).now||'').match(/(\d+)\s+of\s+12\s+testers/i);return m?+m[1]:null;}
function firstAt(L,f){return L.map(function(a){return a[f];}).filter(Boolean).sort()[0]||null;}
function achievements(){var A=J8.approvals.list(),dec=A.filter(function(a){return a.status&&a.status!=='pending';}),ok=dec.filter(function(a){return a.status==='approved'||a.status==='edited'||a.status==='sent';}),sent=A.filter(function(a){return a.status==='sent';});
 var m=J8.money.summary()||{},f=funnel(),t=testers(),P=projList(),dn=Object.keys(S).filter(function(k){return S[k]&&S[k].done;}).length,mx=0;P.forEach(function(p){if(isNum(p.stage)&&p.stage>mx)mx=p.stage;});
 var apps=ok.filter(function(a){return a.kind==='application';}),tpl=ok.filter(function(a){return a.kind==='template';});
 return [
  {n:'First decision',on:dec.length>0,at:firstAt(dec,'decided_at'),v:dec.length+' decided',lock:'Send or Kill one draft.'},
  {n:'Template on',on:tpl.length>0,at:firstAt(tpl,'decided_at'),v:tpl.length+' on',lock:'Approve one template.'},
  {n:'Application approved',on:apps.length>0,at:firstAt(apps,'decided_at'),v:apps.length+' approved',lock:'Approve one application.'},
  {n:'100 tasks done',on:dn>=100,v:dn+' ticked',lock:dn+' of 100'},
  {n:'In Monetize',on:mx>=5,v:'a project at stage '+mx,lock:'A project reaches stage 5.'},
  {n:'First reply',on:f.replies>0,v:f.replies!=null?f.replies+' replies':'',lock:f.replies===null?'No count yet':'0 so far'},
  {n:'First sent',on:sent.length>0,at:firstAt(sent,'sent_at'),v:sent.length+' sent',lock:ok.length+' approved, 0 out'},
  {n:'Application sent',on:sent.some(function(a){return a.kind==='application';}),lock:apps.length+' waiting to go'},
  {n:'Call booked',on:f.calls>0,lock:f.calls===null?'No count yet':f.calls+' calls'},
  {n:'12 SH✡MER testers',on:t!==null&&t>=12,lock:t!==null?t+' of 12':'No count yet'},
  {n:'First ₪ in',on:(m.booked_ils||0)>0||(m.booked_usd||0)>0,lock:(ils(m.booked_ils||0)||'₪0')+' so far'},
  {n:'Paid pilot',on:P.some(function(p){return (p.id==='p-command'||p.id==='p-shomer')&&p.stage>=6;}),lock:'A council signs'},
  {n:'M1 reached',on:isNum(m.booked_usd)&&isNum(m.m1_usd)&&m.booked_usd>=m.m1_usd,lock:usd(m.booked_usd||0)+' of '+usd(m.m1_usd||25000)}
 ];}
function donut(parts,label,center){var tot=parts.reduce(function(s,p){return s+p.v;},0),R=40,C=2*Math.PI*R,o=0,segs='',nz=parts.filter(function(q){return q.v;}).length;
 parts.forEach(function(p){if(!p.v)return;var L=C*p.v/tot,g=nz>1?2:0;segs+='<circle r="'+R+'" cx="56" cy="56" fill="none" stroke="'+p.c+'" stroke-width="18" stroke-dasharray="'+Math.max(0,L-g)+' '+(C-Math.max(0,L-g))+'" stroke-dashoffset="'+(-o)+'" transform="rotate(-90 56 56)"><title>'+esc(p.k+': '+p.v)+'</title></circle>';o+=L;});
 return '<svg class="dn" viewBox="0 0 112 112" role="img" aria-label="'+esc(label)+'">'+segs+'<text x="56" y="62" text-anchor="middle" class="pt">'+(center!=null?center:tot)+'</text></svg>'
  +'<ul class="lg">'+parts.filter(function(p){return p.v||p.keep;}).map(function(p){return '<li><i style="background:'+p.c+'"></i><span>'+esc(p.k)+'</span><b>'+p.v+'</b></li>';}).join('')+'</ul>';}
function activity(){var days=[],by={},S3=[['Drafts made','#A9BCFF'],['Your decisions','#FFB03A'],['Team runs','#1F5BFF']];
 for(var k=6;k>=0;k--){var d=new Date(Date.now()-k*864e5);days.push(ymd(d));by[ymd(d)]=[0,0,0];}
 var add=function(iso,j){if(!iso)return;var t=new Date(iso);if(isNaN(t))return;var key=ymd(t);if(by[key])by[key][j]++;};
 J8.approvals.list().forEach(function(a){add(a.created,0);add(a.decided_at,1);});J8.runs.list().forEach(function(r){add(r.ended||r.started,2);});
 var mx=1;days.forEach(function(d){var s=by[d][0]+by[d][1]+by[d][2];if(s>mx)mx=s;});
 var bars=days.map(function(d){var v=by[d],s=v[0]+v[1]+v[2],t=new Date(d+'T12:00:00');
  return '<div class="col" title="'+esc(fdate(d)+': '+v[0]+' drafts, '+v[1]+' decisions, '+v[2]+' runs')+'"><b>'+(s||'')+'</b><div class="stk">'+v.map(function(n,j){return n?'<i style="height:'+(n/mx*100)+'%;background:'+S3[j][1]+'"></i>':'';}).reverse().join('')+'</div><span>'+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][t.getDay()]+'</span></div>';}).join('');
 return '<div class="act">'+bars+'</div><ul class="lg row">'+S3.map(function(s){return '<li><i style="background:'+s[1]+'"></i><span>'+s[0]+'</span></li>';}).join('')+'</ul>';}
/* ===== 6.0 "How the flow improved": this week vs last, from real timestamps only.
   Cleared by you = drafts you decided (decided_at; the team never sets it) + your tasks done (done_at).
   Median wait = created → your decision / done. Blockers removed = items named in some blocked_by that closed in the
   window; blocked_by exists from V6 on, so earlier windows say "collecting data". ===== */
var V6='2026-11-14T15:00:00Z';
function median(L){if(!L.length)return null;L=L.slice().sort(function(a,b){return a-b;});var m=L.length>>1;return L.length%2?L[m]:(L[m-1]+L[m])/2;}
function closedAt(id){var x=graph().it[id];if(!x||x.open)return NaN;var o=x.o;if(x.k==='task')return pd(o.done_at);if(x.k==='approval')return pd(o.status==='sent'?o.sent_at:o.decided_at);return pd(o.updated);}
function flowWin(a,b){var c=0,hrs=[],bl={},rm=0;
 J8.approvals.list().forEach(function(x){(x.blocked_by||[]).forEach(function(k){bl[k]=1;});if(!x.status||x.status==='pending'||x.status==='queued')return;var t=pd(x.decided_at);if(!(t>=a&&t<b))return;c++;var s0=pd(x.created);if(!isNaN(s0)&&t>=s0)hrs.push((t-s0)/36e5);});
 tasksAll().forEach(function(x){(x.blocked_by||[]).forEach(function(k){bl[k]=1;});if(x.status!=='done'||x.owner!=='dave')return;var t=pd(x.done_at);if(!(t>=a&&t<b))return;c++;var s0=pd(x.created_at);if(!isNaN(s0)&&t>=s0)hrs.push((t-s0)/36e5);});
 J8.projects.list().forEach(function(x){(x.blocked_by||[]).forEach(function(k){bl[k]=1;});});
 Object.keys(bl).forEach(function(k){var t=closedAt(k);if(t>=a&&t<b)rm++;});
 return {n:c,med:median(hrs),rm:rm,track:b>pd(V6)};}
function hrsTxt(h){return h==null?null:h*60<1?'under 1 min':h<1?Math.round(h*60)+' min':h<48?(h<10?h.toFixed(1).replace(/\.0$/,''):Math.round(h))+' h':Math.round(h/24)+' days';}
function flowHTML(){var now=Date.now(),W=7*864e5,T=flowWin(now-W,now),L=flowWin(now-2*W,now-W),cd='collecting data';
 var tile=function(lbl,v,lv,note){return '<div class="fv"><span>'+lbl+'</span><b>'+(v==null?'<em>'+cd+'</em>':esc(v))+'</b><small>'+(lv==null?'last week: '+cd:'last week '+esc(lv))+(note?' · '+note:'')+'</small></div>';};
 return '<section class="st flow"><h2>How the flow improved <span>last 7 days vs the 7 before</span></h2><div class="fl">'
  +tile('Cleared by you',String(T.n),String(L.n))
  +tile('Median wait',hrsTxt(T.med),hrsTxt(L.med))
  +tile('Blockers removed',T.track?String(T.rm):null,L.track?String(L.rm):null,'from 14 Nov')
  +'</div><p class="src">Drafts: made → your decision. Your tasks: made → done. Counted live from the board.</p></section>';}
function renderNumbers(){var el=$('v-stats');if(!el)return;if(!connected){el.innerHTML='<div class="empty"><b>Loading your numbers…</b></div>';return;}
 var m=J8.money.summary()||{},b=isNum(m.booked_usd)?m.booked_usd:0,d1=J8.money.daysTo(m.m1_date),Ap=J8.approvals.list(),cnt=function(f){return Ap.filter(f).length;},
  wt=cnt(function(a){return !a.status||a.status==='pending';}),ap=cnt(function(a){return a.status==='approved'||a.status==='edited';}),sn=cnt(function(a){return a.status==='sent';}),kl=cnt(function(a){return a.status==='killed';});
 var h=flowHTML()+'<div class="kpis"><div class="kpi gold"><span>Booked</span><b>'+usd(b)+'</b><small>of '+usd(m.m1_usd||25000)+' for M1</small></div>'
  +'<div class="kpi" style="--kc:var(--cyan)"><span>Days to M1</span><b>'+(d1!==null?Math.max(0,d1):'—')+'</b><small>'+esc(fdate(m.m1_date||'2026-11-21'))+'</small></div>'
  +'<div class="kpi" style="--kc:var(--o)"><span>Waiting on you</span><b>'+wt+'</b><small>drafts</small></div>'
  +'<div class="kpi" style="--kc:var(--ok)"><span>Sent</span><b>'+sn+'</b><small>'+ap+' approved, not out yet</small></div></div>';
 var t0=new Date(START+'T12:00:00').getTime(),t1=new Date(MS[5][1]+'T12:00:00').getTime(),x=function(d){return Math.max(0,Math.min(100,(new Date(d+'T12:00:00').getTime()-t0)/(t1-t0)*100));},tn=Math.max(0,Math.min(100,(Date.now()-t0)/(t1-t0)*100)),nx=MS.filter(function(s){return b<s[2];})[0];
 h+='<section class="st"><h2>Milestones</h2><div class="tl"><div class="tr"><i style="width:'+tn+'%"></i></div><s class="today" style="left:'+tn+'%"><em>Today</em></s>'
  +MS.map(function(s){return '<div class="ms'+(b>=s[2]?' r':'')+(nx&&nx[0]===s[0]?' nx':'')+'" style="left:'+x(s[1])+'%">'+eight()+'<b>'+s[0]+'</b><span>'+usd(s[2])+'</span><span>'+fdate(s[1]).replace(' 2027','')+'</span></div>';}).join('')+'</div></section>';
 var P=projList().filter(function(p){return p.id!=='p-general';}),SC=['#C9D6FF','#8FA8FF','#5B7FFF','#1F5BFF','#FFB03A','#C2410C'],stg=J8.projects.STAGES.map(function(s,i){return {k:s,v:P.filter(function(p){return p.stage===i+1;}).length,c:SC[i]};});
 var ns=P.filter(function(p){return !isNum(p.stage);}).length;if(ns)stg.push({k:'No stage',v:ns,c:'#E1E7F2'});
 h+='<div class="pair"><section class="st"><h2>Projects by stage</h2>'+donut(stg,'Projects by stage')+'</section>'
  +'<section class="st"><h2>Drafts</h2>'+donut([{k:'Waiting',v:wt,c:'#F06400',keep:1},{k:'Approved',v:ap,c:'#1F5BFF',keep:1},{k:'Sent',v:sn,c:'#12A26A',keep:1},{k:'Killed',v:kl,c:'#D9E1F0',keep:1}],'Drafts by status')+'</section></div>';
 h+='<section class="st"><h2>Activity, last 7 days</h2>'+activity()+'</section>';
 var A=achievements(),on=A.filter(function(a){return a.on;}).length;
 h+='<section class="st"><h2>Achievements <span>'+on+' of '+A.length+'</span></h2><div class="badges">'+A.sort(function(p,q){return (q.on?1:0)-(p.on?1:0);}).map(function(a){
   return '<div class="bdg '+(a.on?'on':'lk')+'"><i>'+eight()+(a.on?'':'<svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="6" y="11" width="12" height="9"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>')+'</i><b>'+esc(a.n)+'</b><span>'+esc(a.on?(a.at?fdate(a.at):a.v||'Unlocked'):a.lock)+'</span></div>';}).join('')+'</div></section>';
 h+='<p class="src">Money from your money summary'+(m.updated?' ('+esc(hhmm(m.updated))+')':'')+'. Milestone targets from the studio plan. Everything else counted live from the board.</p>';
 el.innerHTML=flowBar()+'<div class="fbody">'+h+'</div>';}

/* ===== 6.1 FLOW (Dave, 14 Nov 18:48): the studio at a glance. Map · Timeline · Insights · Teams · Numbers (the old Stats).
   Real data only: projects (stage, next, milestone), tasks (due), drafts (due_at), j8_schedule (crons, next/last run),
   j8_runs, money summary, public.j8_rank. A number without a source shows "collecting data". ===== */
var FT=[['map','Map'],['time','Timeline'],['ins','Insights'],['team','Teams'],['numbers','Numbers']],FSTG=['Idea','Build','Beta','Validate','Launch','Paying'];
var FF=(function(){var f=ls('j8-ff')||{};return {u:f.u||'all',o:f.o||'all',b:!!f.b};})(),TDAY=null,RANK=null,RANKT=0;
var CD='collecting data',DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function flowTab(){var t=ls('j8-ftab');return FT.some(function(f){return f[0]===t;})?t:'map';}
function saveFF(){ls('j8-ff',FF);}
function flowBar(){var t=flowTab(),h='<div class="ftabs" role="tablist" aria-label="Flow views">'+FT.map(function(f){return '<button role="tab" aria-selected="'+(t===f[0])+'" class="'+(t===f[0]?'on':'')+'" data-ftab="'+f[0]+'">'+f[1]+'</button>';}).join('')+'</div>';
 if(t==='map'||t==='time'||t==='ins')h+='<div class="ffil"><select class="fsel" data-fu aria-label="Filter by unit"><option value="all">All units</option>'+unitsSorted().map(function(u){return '<option value="'+esc(u.id)+'"'+(FF.u===u.id?' selected':'')+'>'+esc(u.name)+'</option>';}).join('')+'</select>'
  +'<div class="fo" role="group" aria-label="Who holds it">'+[['all','All'],['me','Me'],['team','Team'],['ext','Outside']].map(function(o){return '<button aria-pressed="'+(FF.o===o[0])+'" data-fo="'+o[0]+'">'+o[1]+'</button>';}).join('')+'</div>'
  +'<button class="fb" aria-pressed="'+FF.b+'" data-fb="1">Only blocked</button></div>';
 return h;}
/* who holds a project's next step: Dave if anything waits on him there, outside if its milestone says so, else the team */
function mineBy(){var m={};needs().forEach(function(i){var p=rowPid(i);if(p)(m[p]=m[p]||[]).push(i);});return m;}
function holderOf(p,M){if(p.milestone_by==='external')return 'ext';if((M[p.id]||[]).length||p.milestone_by==='dave')return 'me';return 'team';}
function holderChip(h,p){if(h==='me')return '<i class="ow dv" title="You">DM</i>';if(h==='ext')return '<i class="hx" title="Outside the studio">Ext</i>';var u=unitOf(p);return '<i class="hx tm" title="'+esc(u?u.name:'Team')+'">'+esc(u&&u.code?u.code:'Team')+'</i>';}
function projBlocked(p){if(openBlk(p.id).length)return true;var g=graph();return Object.keys(g.it).some(function(id){var x=g.it[id];if(!x.open)return false;var pid=x.k==='task'?x.o.project_id:x.k==='approval'?x.o.product:null;return pid===p.id&&openBlk(id).length>0;});}
function passP(p,M){if(FF.u!=='all'&&p.unit_id!==FF.u)return false;if(FF.o!=='all'&&holderOf(p,M)!==FF.o)return false;if(FF.b&&!projBlocked(p))return false;return true;}
/* dates as written (stored in Israel time): "Sun 15 Nov 10:00" */
function dday(s){return String(s||'').slice(0,10);}
function dtime(s){var m=String(s||'').match(/T(\d\d:\d\d)/);return m?m[1]:'';}
function dlabel(s){if(!s)return '';var d=new Date(dday(s)+'T12:00:00');if(isNaN(d))return '';return DOW[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()]+(dtime(s)?' '+dtime(s):'');}
function apDue(a){return a.due_at||'';}
/* the next dated step of a project: its milestone, else its earliest open dated task or draft */
function msOf(p){var today=ymd(new Date());if(p.milestone)return {t:p.milestone,at:p.milestone_at||'',src:p.milestone_src||''};
 var c=[];tasksAll().forEach(function(t){if(t.project_id===p.id&&(!t.status||t.status==='open')&&t.due&&dday(t.due)>=today)c.push({t:t.title,at:t.due,src:'task'});});
 J8.approvals.list().forEach(function(a){if(a.product===p.id&&isOpenAp(a)&&apDue(a)&&dday(apDue(a))>=today)c.push({t:apKind(a)+' · '+apWho(a),at:apDue(a),src:'draft slot'});});
 c.sort(function(x,y){return String(x.at).localeCompare(String(y.at));});return c[0]||null;}
function stageOf(p){return isNum(p.stage)&&p.stage>=1&&p.stage<=6?p.stage:0;}
function laneHTML(p,M){var s=stageOf(p),h=holderOf(p,M),k='fl-'+p.id,o=openRow[k],ms=msOf(p),bl=openBlk(p.id),mine=(M[p.id]||[]).length;
 var seg=FSTG.map(function(n,i){return '<i class="'+(i+1<s?'d':i+1===s?'c':'')+'"></i>';}).join('');
 var x='<div class="lane'+(o?' open':'')+(p.status==='parked'?' pk':'')+'"'+(pcol(p.id)?' style="--pc:'+pcol(p.id)[0]+'"':'')+'><button class="lmain" data-open="'+esc(k)+'" aria-expanded="'+(o?'true':'false')+'">'
  +'<span class="ln" dir="auto">'+pm(p.id)+esc(p.name)+(p.status==='parked'?' <small>· parked</small>':'')+'</span>'+holderChip(h,p)
  +'<span class="lsg" role="img" aria-label="'+(s?'Stage '+s+' of 6: '+FSTG[s-1]:'No stage yet')+'">'+seg+'</span><span class="lst">'+(s?FSTG[s-1]:'No stage')+'</span>'
  +'<span class="lms">'+(ms?'Next: <bdi dir="auto">'+esc(cut(ms.t,64))+'</bdi>'+(ms.at?' · <b>'+esc(dlabel(ms.at))+'</b>':''):'<em>No dated milestone yet</em>')+'</span></button>';
 if(o){x+='<div class="lx2"><p class="nxs" dir="auto"><b>'+(s?'Stage '+s+' of 6 · '+FSTG[s-1]+(s<6?' → '+FSTG[s]:''):'No stage yet')+'</b>'+esc(whyMove(p))+'</p>'
   +(ms&&ms.src?'<p class="why">Date from: '+esc(ms.src)+'</p>':'')+(bl.length?'<p class="why" dir="auto">Waits on: '+esc(itemNames(bl,3))+'</p>':'')
   +(mine?'<p class="why">'+mine+(mine===1?' item waits':' items wait')+' on you here.</p>':'')
   +'<div class="acts"><button class="s" data-jump="'+esc(p.id)+'">Open the project</button>'+(mine?'<button data-go="next">Do mine</button>':'')+'</div></div>';}
 return x+'</div>';}
function isDoneP(p){return p&&p.status==='done';}
function mapHTML(){var M=mineBy(),A=projList().filter(function(p){return p.id!=='p-general';}),P=A.filter(function(p){return !isDoneP(p);}),D=A.filter(function(p){return isDoneP(p)&&passP(p,M);}),U=unitsSorted(),h='',n=0;
 U.map(function(u){return {u:u,L:P.filter(function(p){return p.unit_id===u.id;})};}).concat([{u:null,L:P.filter(function(p){return !U.some(function(u){return u.id===p.unit_id;});})}]).forEach(function(g){
  var L=g.L.filter(function(p){return passP(p,M);}).sort(function(a,b){return (a.status==='parked'?1:0)-(b.status==='parked'?1:0)||stageOf(b)-stageOf(a);});if(!L.length)return;n+=L.length;
  h+='<section class="mapu"><h3>'+esc(g.u?g.u.name:'Other')+' <span>'+L.length+'</span></h3>'+L.map(function(p){return laneHTML(p,M);}).join('')+'</section>';});
 if(D.length)h+='<details class="mapu mapdone"'+(ctlOpen.mapdone?' open':'')+' data-k="mapdone"><summary><h3>Done <span>'+D.length+'</span></h3></summary>'+D.map(function(p){return laneHTML(p,M);}).join('')+'</details>';
 return n||D.length?'<p class="fhint">Every project as one lane: its stage, its next dated step and who holds it. Tap a lane.</p>'+h:'<div class="empty"><b>No project matches these filters.</b></div>';}
/* ---- timeline: next 28 days (local = Israel), from real dated rows and the team schedule ---- */
function cronSet(f,max){if(f==='*')return null;var o=[];String(f).split(',').forEach(function(p){var r=p.match(/^(\d+)-(\d+)$/);if(r){for(var i=+r[1];i<=+r[2];i++)o.push(i);}else if(/^\d+$/.test(p))o.push(+p);});return o;}
function cronDay(c,d){var tz=/CRON_TZ=Asia\/Jerusalem/.test(c),f=String(c).replace(/^CRON_TZ=\S+\s+/,'').trim().split(/\s+/);if(f.length<5)return null;
 var mi=cronSet(f[0]),hr=cronSet(f[1]),dom=cronSet(f[2]),mo=cronSet(f[3]),dw=cronSet(f[4]);
 if(!hr)return {hourly:true,ok:(!dw||dw.indexOf(d.getDay())>-1)};
 if(dom&&dom.indexOf(d.getDate())<0)return {t:[]};if(mo&&mo.indexOf(d.getMonth()+1)<0)return {t:[]};if(dw&&dw.indexOf(d.getDay())<0)return {t:[]};
 var T=[];hr.forEach(function(h){(mi||[0]).forEach(function(m){if(tz){T.push(String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'));}
  else{var u=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),h,m));T.push(String(u.getHours()).padStart(2,'0')+':'+String(u.getMinutes()).padStart(2,'0'));}});});
 return {t:T.sort()};}
function ilToMs(y,m,d,h,mi){var g=Date.UTC(y,m-1,d,h,mi),p=ilParts(g);return g-(Date.UTC(p.year,p.month-1,p.day,p.hour%24,p.minute)-g);}
function nextRun(s){var nx=pd(s&&s.next_run_at),now=Date.now();if(!isNaN(nx)&&nx>now)return nx;var c=String(s&&s.cron||'');if(!c)return NaN;
 var tz=/CRON_TZ=Asia\/Jerusalem/.test(c),f=c.replace(/^CRON_TZ=\S+\s+/,'').trim().split(/\s+/);if(f.length<5||(tz&&!ILF))return NaN;
 var mi=cronSet(f[0])||[0],hr=cronSet(f[1]),dom=cronSet(f[2]),mo=cronSet(f[3]),dw=cronSet(f[4]),H=hr||[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],best=Infinity;
 for(var k=0;k<9&&best===Infinity;k++){var t=now+k*864e5,y,m,d;if(tz){var q=ilParts(t);y=q.year;m=q.month;d=q.day;}else{var u=new Date(t);y=u.getUTCFullYear();m=u.getUTCMonth()+1;d=u.getUTCDate();}
  var wd=new Date(Date.UTC(y,m-1,d)).getUTCDay();if((dom&&dom.indexOf(d)<0)||(mo&&mo.indexOf(m)<0)||(dw&&dw.indexOf(wd)<0&&!(wd===0&&dw.indexOf(7)>-1)))continue;
  H.forEach(function(h){mi.forEach(function(x){var v=tz?ilToMs(y,m,d,h,x):Date.UTC(y,m-1,d,h,x);if(v>now&&v<best)best=v;});});}
 return best===Infinity?NaN:best;}
function ilDT(ms){if(isNaN(ms))return '';if(!ILF){var l=new Date(ms);return DOW[l.getDay()]+' '+l.getDate()+' '+MON[l.getMonth()]+' '+String(l.getHours()).padStart(2,'0')+':'+String(l.getMinutes()).padStart(2,'0');}
 var p=ilParts(ms);return DOW[new Date(Date.UTC(p.year,p.month-1,p.day)).getUTCDay()]+' '+p.day+' '+MON[p.month-1]+' '+ilHM(ms);}
function schedList(){return J8.schedule&&J8.schedule.list?J8.schedule.list().filter(function(s){return s.enabled!==false&&s.want_enabled!==false&&s.cron;}):[];}
function events(){var E=[],M=mineBy(),push=function(e){var p=pobj(e.pid);if(FF.u!=='all'&&!(p&&p.unit_id===FF.u))return;if(FF.o!=='all'&&e.who!==FF.o)return;if(FF.b&&!(e.id&&openBlk(e.id).length))return;E.push(e);};
 projList().forEach(function(p){if(p.milestone&&p.milestone_at)push({day:dday(p.milestone_at),time:dtime(p.milestone_at),k:'ms',who:holderOf(p,M),title:p.milestone,sub:p.name,pid:p.id,id:p.id,jump:p.id});});
 tasksAll().forEach(function(t){if((!t.status||t.status==='open')&&t.due)push({day:dday(t.due),time:dtime(t.due),k:t.owner==='dave'?'you':'team',who:t.owner==='dave'?'me':'team',title:t.title,sub:pname(t.project_id),pid:t.project_id,id:t.id,jump:'list-tk-'+t.id});});
 J8.approvals.list().forEach(function(a){if(!isOpenAp(a)||!apDue(a))return;var mine=(a.status||'pending')==='pending'||/by hand/i.test(String(a.label||'')+' '+String(a.channel||''))||/linkedin/i.test(String(a.channel||''));
  push({day:dday(apDue(a)),time:dtime(apDue(a)),k:mine?'you':'team',who:mine?'me':'team',title:apKind(a)+' · '+apWho(a),sub:(a.status==='pending'||!a.status?'waits for your Send':mine?'you post it by hand':'the team sends it')+' · '+pname(a.product),pid:a.product,id:a.id,jump:'list-b-'+(a.batch||'other')});});
 var m=J8.money.summary()||{};if(m.m1_date&&FF.o!=='ext'&&FF.u==='all'&&!FF.b)E.push({day:dday(m.m1_date),time:'',k:'ms',who:'me',title:'M1: '+usd(m.m1_usd||25000)+' booked',sub:'studio plan · money summary',jump:'stats'});
 return E;}
function runsOn(d){if(FF.o==='me'||FF.o==='ext'||FF.b||FF.u!=='all')return [];var R=[];schedList().forEach(function(s){var c=cronDay(s.cron,d);if(!c)return;if(c.hourly){if(c.ok)R.push({time:'',name:s.name,when:s.when_text||'every hour',hourly:true});return;}c.t.forEach(function(t){R.push({time:t,name:s.name,when:s.when_text||''});});});return R;}
function timeHTML(){var today=new Date();today.setHours(12,0,0,0);var td=ymd(today),E=events(),by={},days=[];E.forEach(function(e){(by[e.day]=by[e.day]||[]).push(e);});
 if(!TDAY)TDAY=td;for(var k=0;k<28;k++){var d=new Date(today.getTime()+k*864e5);days.push(d);}
 var over=E.filter(function(e){return e.day<td;}),h='<p class="fhint">Next 4 weeks. Real dates only: milestones, your steps, draft slots and the team’s runs. Tap a day.</p><div class="tstrip" role="group" aria-label="Next 4 weeks">';
 days.forEach(function(d){var key=ymd(d),L=by[key]||[],ms=L.filter(function(e){return e.k==='ms';}).length,yo=L.filter(function(e){return e.k==='you';}).length,te=L.filter(function(e){return e.k==='team';}).length,rn=runsOn(d).length;
  h+='<button class="tday'+(key===td?' td':'')+(key===TDAY?' sel':'')+'" data-tday="'+key+'" aria-pressed="'+(key===TDAY)+'" aria-label="'+esc(DOW[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()]+': '+L.length+' dated items, '+rn+' team runs')+'"><span class="tw">'+DOW[d.getDay()].slice(0,2)+'</span><b>'+d.getDate()+'</b><span class="tdots">'+(ms?'<i class="ms"></i>':'')+(yo?'<i class="yo"></i>':'')+(te?'<i class="te"></i>':'')+'</span><small>'+(L.length?L.length:'')+'</small></button>';});
 h+='</div>';
 var sd=new Date(TDAY+'T12:00:00'),L=(by[TDAY]||[]).slice().sort(function(a,b){return (a.time||'99').localeCompare(b.time||'99');}),RN=runsOn(sd);
 h+='<section class="agenda"><h3>'+esc(DOW[sd.getDay()]+' '+sd.getDate()+' '+MON[sd.getMonth()])+(TDAY===td?' · today':'')+'</h3>';
 if(!L.length&&!RN.length)h+='<p class="nd-0">Nothing dated on this day.</p>';
 h+=L.map(function(e){return '<button class="ag ag-'+e.k+'" data-jump="'+esc(e.jump)+'"><span class="at">'+esc(e.time||'—')+'</span><span class="aw" dir="auto"><b>'+esc(cut(e.title,80))+'</b><small>'+esc(cut(e.sub||'',70))+'</small></span><span class="ah">'+(e.who==='me'?'You':e.who==='ext'?'Outside':'Team')+'</span></button>';}).join('');
 if(RN.length)h+='<details class="runs"><summary>'+RN.length+(RN.length===1?' team run':' team runs')+'</summary>'+RN.map(function(r){return '<p><span class="at">'+esc(r.time||'hourly')+'</span>'+esc(r.name)+(r.hourly?' · '+esc(r.when):'')+'</p>';}).join('')+'</details>';
 h+='</section>';
 if(over.length)h+='<section class="agenda over"><h3>Slot passed, still open <span>'+over.length+'</span></h3>'+over.sort(function(a,b){return a.day.localeCompare(b.day);}).slice(0,8).map(function(e){return '<button class="ag ag-'+e.k+'" data-jump="'+esc(e.jump)+'"><span class="at">'+esc(dlabel(e.day).replace(/^\w+ /,''))+'</span><span class="aw" dir="auto"><b>'+esc(cut(e.title,80))+'</b><small>'+esc(cut(e.sub||'',70))+'</small></span><span class="ah">'+(e.who==='me'?'You':'Team')+'</span></button>';}).join('')+(over.length>8?'<p class="fhint">and '+(over.length-8)+' more in the List.</p>':'')+'</section>';
 return h;}
/* ---- insights: one sentence each, tap through ---- */
function lastMove(p){var t=pd(p.updated);if(isNaN(t))t=-Infinity;J8.runs.list().forEach(function(r){if((r.projects||[]).indexOf(p.id)>-1||r.project===p.id){var e=pd(r.ended||r.started);if(e>t)t=e;}});
 J8.inbox.list().forEach(function(x){if(x.p===p.id){var e=pd(x.updated_at);if(e>t)t=e;}});return t;}
function firstAt(L){var m=Infinity;L.forEach(function(v){if(v<m)m=v;});return m;}
function weekCounts(a,b){var runs=0,sent=0;J8.runs.list().forEach(function(r){var e=pd(r.ended);if(e>=a&&e<b&&r.status==='ok')runs++;});J8.approvals.list().forEach(function(x){var e=pd(x.sent_at);if(x.status==='sent'&&e>=a&&e<b)sent++;});return {runs:runs,sent:sent,dave:flowWin(a,b).n};}
function insRow(lbl,txt,go,jump){return '<li><button class="insb"'+(jump?' data-jump="'+esc(jump)+'"':' data-go="'+esc(go||'next')+'"')+'><span class="il">'+esc(lbl)+'</span><span class="it" dir="auto">'+txt+'</span>'+ic('more')+'</button></li>';}
function insHTML(){var M=mineBy(),N=needs().filter(function(i){var p=pobj(rowPid(i));if(FF.u!=='all'&&!(p&&p.unit_id===FF.u))return false;if(FF.o==='team'||FF.o==='ext')return false;if(FF.b&&!i.wo.length&&!i.ul.length)return false;return true;}),h='<ul class="ins">';
 /* 1 waiting on whom (database ranking when it answered, else the same rules here) */
 var R=RANK&&Date.now()-RANKT<12e4?RANK:null,top=N[0];
 h+=insRow('Waiting on you',N.length?N.length+' items. First: '+esc(cut(nextOf(top).what,60))+(top.ul.length?' (frees '+top.ul.length+')':'')+'.':'nothing right now.','next');
 if(R){var tm={},ex=0;R.forEach(function(r){if(r.owner==='dave')return;var p=pobj(r.kind==='project'?r.id:null);var key=r.owner==='team'?'Sending (team)':(DEPT[r.owner]||r.owner||'Team');tm[key]=(tm[key]||0)+1;});
  var keys=Object.keys(tm).sort(function(a,b){return tm[b]-tm[a];});
  h+=insRow('Waiting on the team',keys.length?keys.slice(0,3).map(function(k){return esc(k)+' '+tm[k];}).join(' · ')+' open (database ranking).':'nothing open.','list');}
 else h+=insRow('Waiting on the team',CD+' (ranking loads when online).','list');
 var ext=projList().filter(function(p){return p.milestone_by==='external'&&!isDoneP(p);});
 h+=insRow('Waiting outside',ext.length?ext.map(function(p){return esc(p.name)+': '+esc(cut(p.milestone,50));}).join(' · ')+'.':'nothing marked as outside.',null,ext[0]?ext[0].id:'list');
 /* 2 stuck longest */
 var old=N.filter(function(i){return i.age!==Infinity;}).sort(function(a,b){return a.age-b.age;})[0];
 h+=insRow('Oldest wait',old?'“'+esc(cut(nextOf(old).what,60))+'” · '+Math.max(0,Math.floor((Date.now()-old.age)/864e5))+' days.':CD+'.',null,old?'list-'+old.key:'next');
 /* 3 no movement in 7 days (projects not parked) */
 var wk=Date.now()-7*864e5,P=projList().filter(function(p){return p.id!=='p-general'&&p.status!=='parked'&&!isDoneP(p)&&(FF.u==='all'||p.unit_id===FF.u);}),still=[],unk=0;
 P.forEach(function(p){var t=lastMove(p);if(t===-Infinity)unk++;else if(t<wk)still.push(p);});
 h+=insRow('No movement 7 days',still.length?still.map(function(p){return esc(p.name);}).join(', ')+'.':'every active project moved this week'+(unk?' ('+unk+' with no record yet)':'')+'.',null,still[0]?still[0].id:'list');
 /* 4 throughput: this week vs last; a week before the first record says collecting data */
 var now=Date.now(),W=7*864e5,a=weekCounts(now-W,now),b=weekCounts(now-2*W,now-W),f0=firstAt(J8.runs.list().map(function(r){return pd(r.started||r.ended);}).filter(function(v){return !isNaN(v);})),lastOk=f0<=now-2*W;
 h+=insRow('This week',esc('you cleared '+a.dave+' · team runs '+a.runs+' · sent '+a.sent)+'. Last week: '+(lastOk?esc(b.dave+' · '+b.runs+' · '+b.sent):CD)+'.','stats');
 /* 5 money path */
 var m=J8.money.summary()||{},mp=projList().filter(function(p){return p.id!=='p-general'&&p.status!=='parked'&&!isDoneP(p)&&moneyP(p)&&isNum(p.stage);}).sort(function(x,y){return y.stage-x.stage;});
 h+=insRow('Money',(isNum(m.booked_usd)?usd(m.booked_usd)+' booked (money summary)':'booked: '+CD)+'. '+(mp[0]?'Closest to first $: '+esc(mp[0].name)+' ('+FSTG[mp[0].stage-1]+'), next: '+esc(cut(String(mp[0].next||'').replace(/^(\w+):\s*/,''),70))+'.':'No project on the revenue path yet.'),null,mp[0]?mp[0].id:'stats');
 if(mp.length>1)h+=insRow('Also on the money path',mp.slice(1,4).map(function(p){return esc(p.name)+' ('+FSTG[p.stage-1]+')';}).join(' · ')+'.',null,'list');
 h+='</ul><p class="src">Every line is counted live from the board, the schedule and the team’s run log.</p>';
 if(!R&&J8.rank&&connected){J8.rank().then(function(v){if(v){RANK=v;RANKT=Date.now();if(view==='stats'&&flowTab()==='ins')renderStats();}});}
 return h;}
/* ---- teams: the schedule (real crons) + pods that run inside the shifts ---- */
function noUrl(s){return String(s==null?'':s).replace(/\s*(?:[—–-]\s*)?(?:check:?\s*)?(?:https?:\/\/|www\.)\S*[^\s.,;:)]/gi,'').replace(/\s{2,}/g,' ').replace(/[\s:—–-]+$/,'').trim();}
function linkTxt(s){var out='',i=0,re=/(?:https?:\/\/)\S+/gi,m;s=String(s==null?'':s);while((m=re.exec(s))){var u=m[0].replace(/[.,;:)]+$/,'');out+=esc(s.slice(i,m.index))+'<a href="'+esc(u)+'" target="_blank" rel="noopener">open link</a>';i=m.index+u.length;}return out+esc(s.slice(i));}
function armKey(s){return String(s||'').toLowerCase().replace(/^3s\s+/,'').replace(/\s*\([^)]*\)\s*/g,' ').replace(/\s+/g,' ').trim();}
function teamHTML(){var S=J8.schedule&&J8.schedule.list?J8.schedule.list():[],R=J8.runs.list(),last={},h='<p class="fhint">Each team: what it did last, how it went, and when it runs next.</p>';
 R.forEach(function(r){var k=armKey(r.arm);if(!last[k])last[k]=r;});
 var used={},row=function(name,r,next,when,on,locked){var st=r?r.status:null,dot=st==='ok'?'g':st==='failed'?'o':st==='running'||st==='started'?'b':'n',k='tm-'+armKey(name),o=openRow[k];
  var units={};if(r)(r.projects||[]).concat(r.project?[r.project]:[]).forEach(function(pid){var u=unitOf(pobj(pid));if(u)units[u.code||u.name]=1;});
  return '<div class="team'+(o?' open':'')+(on===false?' off':'')+'"><button class="tmain" data-open="'+esc(k)+'" aria-expanded="'+(o?'true':'false')+'"><i class="sd sd-'+dot+'" aria-hidden="true"></i><span class="tn">'+esc(name)+'</span><span class="tnx">'+(on===false?'off':next?'next '+esc(next):esc(when||''))+'</span>'
   +'<span class="tsum" dir="auto">'+(r?esc(cut(noUrl(sevStrip(String(r.summary||''))),90))||esc(st||''):'<em>No run recorded yet</em>')+'</span></button>'
   +(o?'<div class="lx2">'+(r?'<p class="why">Last run: '+esc(st||'—')+' · '+esc(ago(r.ended||r.started))+(Object.keys(units).length?' · '+esc(Object.keys(units).join(', ')):'')+'</p><p dir="auto">'+linkTxt(sevStrip(String(r.summary||'')))+'</p>':'')+(when?'<p class="why">Runs: '+esc(when)+(locked?' (always on)':'')+'</p>':'')+'</div>':'')+'</div>';};
 h+='<section class="mapu"><h3>On the schedule <span>'+S.length+'</span></h3>'+S.map(function(s){var k=armKey(s.name);used[k]=1;return row(s.name,last[k],ilDT(nextRun(s)),s.when_text,s.enabled!==false&&s.want_enabled!==false,s.locked);}).join('')+'</section>';
 var pods=Object.keys(last).filter(function(k){return !used[k]&&pd(last[k].ended||last[k].started)>Date.now()-14*864e5;});
 if(pods.length)h+='<section class="mapu"><h3>Pods (run inside the shifts) <span>'+pods.length+'</span></h3>'+pods.map(function(k){return row(last[k].arm,last[k],'','not on the schedule list',true,false);}).join('')+'</section>';
 if(!S.length&&!pods.length)h+='<p class="nd-0">No team schedule or runs yet: '+CD+'.</p>';
 return h;}
function renderStats(){var el=$('v-stats');if(!el)return;if(document.activeElement&&el.contains(document.activeElement)&&document.activeElement.tagName==='SELECT')return;if(!connected){el.innerHTML='<div class="empty"><b>Loading the flow…</b></div>';return;}
 var t=flowTab();if(t==='numbers'){renderNumbers();return;}
 el.innerHTML=flowBar()+'<div class="fbody">'+(t==='map'?mapHTML():t==='time'?timeHTML():t==='ins'?insHTML():teamHTML())+'</div>';}

/* ===== header band: one title per screen, real subtitle ===== */
function renderHead(){var t={chat:'J8NIX',next:'Next',list:'List',stats:'Flow'}[view],s='';
 if(view==='chat')s='your business manager';
 else if(!connected)s='loading…';
 else if(view==='next'){var nq=needs();s=nq.length?nq.length+' wait on you · #1 first':'nothing waits on you';}
 else if(view==='list'){var nw=needs().length;s=(curLmode()==='unit'?'by unit · ':'by type · ')+nw+' wait on you';}
 else {var m=J8.money.summary()||{},d=J8.money.daysTo(m.m1_date);s=usd(m.booked_usd||0)+' of '+usd(m.m1_usd||25000)+(d!==null?' · '+Math.max(0,d)+' days to M1':'');}
 $('hdT').textContent=t;$('hdS').textContent=s;}

/* ===== settings sheet ===== */
/* 6.1 theme: light by default; dark or auto only when Dave picks it (stored on this phone) */
function theme(){var t=ls('j8-theme');return t==='dark'||t==='auto'?t:'light';}
function setTheme(t){ls('j8-theme',t);document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='dark'?'#2B3F57':'#F7D3B0';renderTheme();if(typeof renderAll==='function')renderAll();}
function renderTheme(){var e=$('themeSeg');if(!e)return;var t=theme();[].forEach.call(e.querySelectorAll('[data-theme-set]'),function(b){b.setAttribute('aria-pressed',b.dataset.themeSet===t?'true':'false');});}
function openSheet(){$('sheet').hidden=false;$('scrim').hidden=false;$('gear').setAttribute('aria-expanded','true');}
function closeSheet(){var s=$('sheet');if(s&&!s.hidden){s.hidden=true;$('scrim').hidden=true;$('gear').setAttribute('aria-expanded','false');if(ctlOn)ctlShow(false);if(location.hash==='#control')history.replaceState(null,'',location.pathname+location.search);}}
function renderSeat(){var b=$('seat');if(!b)return;var p=CTRL&&CTRL.paused,ask=seatAsk>Date.now();
 b.classList.toggle('off',!!p);b.textContent=p?(ask?'Tap again to resume':'Resume sending'):'Pause sending';
 $('seatTxt').textContent=!CTRL?'Not loaded yet.':p?'Paused. Nothing goes out.':'On. Approved drafts go out on the next run.';
 $('connTxt').textContent=connected?(J8.status().connected?'Connected. Updates live.':'Offline. Showing the last copy.'):'Connecting…';
 var c=$('seatC');if(c){c.className=b.className;c.textContent=b.textContent;c.disabled=!J8.orgs.can('admin');}var ct=$('seatCTxt');if(ct)ct.textContent=$('seatTxt').textContent;}
function seatTap(){if(!CTRL){toast('Not connected yet. Try again in a moment.');return;}var p=CTRL&&CTRL.paused;
 if(!p){J8.control.setPaused(true).then(function(){toast('Sending paused. The team sends nothing until you resume.');},function(e){toast('Couldn’t pause ('+(e&&e.code||'error')+'). Try again.');});return;}
 if(seatAsk>Date.now()){seatAsk=0;J8.control.setPaused(false).then(function(){toast('Sending resumed.');},function(e){toast('Couldn’t resume ('+(e&&e.code||'error')+').');});}
 else{seatAsk=Date.now()+5000;renderSeat();setTimeout(renderSeat,5100);}}

/* ===== 5.3 Control: run the team from the phone. Lives in the settings sheet; #control opens it. Admins change, everyone else reads. ===== */
var J8V='6.1.2',ctlOn=false,ctlAsk=null,ctlOpen={};
var COVERS={'job-application':'Job applications','li-connect':'LinkedIn connect notes','followup-1':'First follow-up','followup-2':'Second follow-up','tester-post':'Tester sign-up post'};
var LOCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="6" y="11" width="12" height="9"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>';
function ilHM(ms){var p=ilParts(ms);return String(p.hour).padStart(2,'0')+':'+String(p.minute).padStart(2,'0');}
function ilDay(ms){var p=ilParts(ms);return p.year*1e4+p.month*100+p.day;}
function ilWhen(iso){var t=pd(iso);if(isNaN(t)||!ILF)return '';var d=ilDay(t);if(d===ilDay(Date.now()))return 'today '+ilHM(t);if(d===ilDay(Date.now()+864e5))return 'tomorrow '+ilHM(t);
 var p=ilParts(t);return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(Date.UTC(p.year,p.month-1,p.day)).getUTCDay()]+' '+p.day+' '+MON[p.month-1]+' '+ilHM(t);}
function sw(on,cx,label,dis,extra){return '<button type="button" class="sw" role="switch" aria-checked="'+(on?'true':'false')+'" aria-label="'+esc(label)+'" data-cx="'+cx+'" data-fk="'+esc(cx+(extra||''))+'"'+(extra?' data-id="'+esc(extra)+'"':'')+(dis?' disabled':'')+'></button>';}
function runPend(s){var a=pd(s.run_now_at),d=pd(s.run_now_done_at);return !isNaN(a)&&(isNaN(d)||a>d)?a:null;}
/* 6.1.2: Control reads the last run from the run log (j8_runs), the same way Teams does; the schedule row's own
   last_run_at is only a snapshot and is used when the log has nothing newer. */
function lastRunOf(s){var k=armKey(s.name),r=null;J8.runs.list().forEach(function(x){if(armKey(x.arm)!==k)return;var t=pd(x.ended||x.started);if(!isNaN(t)&&(!r||t>r.t))r={t:t,st:x.status==='started'?'running':x.status};});
 var t0=pd(s.last_run_at);if(!isNaN(t0)&&(!r||t0>r.t))r={t:t0,st:s.last_status};return r;}
function schRow(s,ro){var lr=lastRunOf(s),st=(lr&&lr.st)||'none',dot={ok:'g',failed:'o',running:'b'}[st]||'n',word={ok:'worked',failed:'failed',running:'running now'}[st]||'',on=s.want_enabled!=null?!!s.want_enabled:!!s.enabled,rp=runPend(s),p='';
 if(s.want_enabled!=null&&!!s.want_enabled!==!!s.enabled)p='<span class="cx-p">'+(s.want_enabled?'Turning on… (within the hour)':'Pausing… (within the hour)')+'</span>';
 var last=lr?'Last run '+ago(new Date(lr.t).toISOString())+(word?' · '+word:''):'Not run yet',nr=nextRun(s),nx=s.enabled&&!isNaN(nr)?'Next '+ilWhen(new Date(nr).toISOString()):s.enabled?'':'Off';
 return '<div class="sh-row cx-s"><div><b dir="auto">'+esc(s.name||'Team task')+'</b><span dir="auto">'+esc(s.when_text||'')+'</span>'
  +'<span class="cx-m"><i class="sd sd-'+dot+'" aria-hidden="true"></i><span>'+esc(last)+(nx?' · '+esc(nx):'')+'</span></span>'+p
  +(s.note?'<small dir="auto">'+esc(s.note)+'</small>':'')
  +(rp?'<span class="cx-p">Run requested '+esc(ilHM(rp))+' · starts within the hour</span>':s.locked||ro?'':'<button type="button" class="cx-b" data-cx="run" data-id="'+esc(s.id)+'" data-fk="run'+esc(s.id)+'" aria-label="Run '+esc(s.name||'this')+' now">Run now</button>')+'</div>'
  +(s.locked?'<span class="cx-lk" title="Always on">'+LOCK+sw(true,'sch',(s.name||'Team task')+' (always on)',true,s.id)+'</span>':sw(on,'sch',s.name||'Team task',ro,s.id))+'</div>';}
function tplRow(a,ro){var st=a.status||'pending',cls={approved:'done',edited:'done',killed:'kill',sent:'done'}[st]||'wait',pr=PR[a.product]&&PR[a.product].name,k='t'+a.id,body=J8.approvals.textOf(a);
 return '<div class="cx-t"><div class="cx-tt"><span class="pill s-'+cls+'">'+esc(STW[st]||'Waiting')+'</span><b dir="auto">'+esc(COVERS[a.covers]||(a.covers?cap1(String(a.covers).replace(/[-_]+/g,' ')):'Template'))+'</b>'+(pr?'<small dir="auto">'+pm(a.product)+esc(pr)+'</small>':'')+'</div>'
  +(body?'<details data-k="'+esc(k)+'"'+(ctlOpen[k]?' open':'')+'><summary>Show the text</summary><p class="cx-body" dir="auto">'+esc(body)+'</p></details>':'')
  +(ro?'':'<div class="acts">'+(st!=='approved'&&st!=='edited'?'<button type="button" class="s" data-cx="tok" data-id="'+esc(a.id)+'" data-fk="tok'+esc(a.id)+'">'+ic('done')+'Approve</button>':'')+(st!=='killed'?'<button type="button" data-cx="tkill" data-id="'+esc(a.id)+'" data-fk="tkill'+esc(a.id)+'">'+ic('kill')+'Kill</button>':''))+(ro?'<div class="acts">':'')
  +'<button type="button" data-tnote="'+esc(a.id)+'" data-fk="tn'+esc(a.id)+'" aria-expanded="'+(ctlOpen['tn'+a.id]?'true':'false')+'">'+ic('chat')+'Comment</button></div>'
  +(ctlOpen['tn'+a.id]?'<form class="ans apn" data-ans="'+esc(a.product||'p-general')+'" data-ap="'+esc(a.id)+'"><textarea rows="1" dir="auto" placeholder="Note on this template" aria-label="Note on this template"></textarea><button type="submit" aria-label="Send the note">'+ic('send')+'</button></form>':'')+apReply(a)+'</div>';}
function askBox(k){var t={email:['Turn on email sending?','Approved emails start going out from dave@3shamrocks.com on my next run.'],brain:['Turn on live AI answers?','I answer your chat at once, and each answer costs paid AI.']}[k];
 return '<div class="cx-ask" role="group" aria-label="'+esc(t[0])+'"><p>'+esc(t[0])+'</p><span>'+esc(t[1])+'</span><div><button type="button" class="seat" data-cx="yes" data-fk="yes">Yes, turn on</button><button type="button" class="txtb" data-cx="no" data-fk="no">Cancel</button></div></div>';}
function renderCtl(){var el=$('ctlBody');if(!el||!ctlOn)return;if(document.activeElement&&el.contains(document.activeElement)&&document.activeElement.tagName==='TEXTAREA')return;var c=J8.control.get(),ro=!J8.orgs.can('admin'),h='',ae=document.activeElement,fk=ae&&ae.dataset?ae.dataset.fk:null,iv=$('ooIn')?$('ooIn').value:'',inF=ae&&ae.id==='ooIn';
 if(ro)h+='<p class="cx-ro" role="note">You can see everything here; only an admin of this business can change it.</p>';
 /* 1 sending */
 h+='<section class="cx-g" aria-labelledby="cxg1"><h3 id="cxg1">Sending</h3><p class="cx-d">What I may send, and the switch that stops everything.</p>'
  +'<div class="sh-row"><div><b>Sending by the AI team</b><span id="seatCTxt">'+esc($('seatTxt').textContent)+'</span></div><button class="seat" id="seatC" data-fk="seatC">Pause sending</button></div>'
  +'<div class="sh-row"><div><b id="cxEm">Email sending</b><span>Studio email goes out only from dave@3shamrocks.com. Turn on once Chrome’s Gmail on the Mac shows that address.</span></div>'+sw(c&&c.email_from_ok,'email','Email sending',ro||!c)+'</div>'
  +(ctlAsk==='email'?askBox('email'):'')
  +'<div class="sh-row"><div><b>Live AI answers</b><span>Uses paid AI per answer.</span></div>'+sw(c&&c.brain_enabled,'brain','Live AI answers',ro||!c)+'</div>'
  +(ctlAsk==='brain'?askBox('brain'):'')+'</section>';
 /* 2 daily limits */
 var caps=(c&&c.caps)||{},cap=function(k,t,sub){var n=isNum(+caps[k])&&caps[k]!=null?+caps[k]:0;
  return '<div class="sh-row"><div><b id="cap-'+k+'">'+esc(t)+'</b><span>'+esc(sub)+'</span></div><div class="stp" role="group" aria-labelledby="cap-'+k+'">'
   +'<button type="button" data-cx="cap" data-key="'+k+'" data-d="-1" data-fk="capm'+k+'" aria-label="One fewer '+esc(t.toLowerCase())+'"'+(ro||!c||n<=0?' disabled':'')+'>−</button><output aria-live="polite">'+n+'</output>'
   +'<button type="button" data-cx="cap" data-key="'+k+'" data-d="1" data-fk="capp'+k+'" aria-label="One more '+esc(t.toLowerCase())+'"'+(ro||!c||n>=50?' disabled':'')+'>+</button></div></div>';};
 h+='<section class="cx-g" aria-labelledby="cxg2"><h3 id="cxg2">Daily limits</h3><p class="cx-d">The most I do in one day (0 to 50 each).</p>'
  +cap('email','Email','Emails a day. None go out while email sending is off.')+cap('li_connect','LinkedIn connects','New people a day.')+cap('li_followup','LinkedIn follow-ups','Follow-ups a day.')
  +'<p class="cx-d cx-n">LinkedIn is always sent by you by hand; this only limits how many I put on your list.</p></section>';
 /* 3 schedule */
 var S3=J8.schedule.list();
 h+='<section class="cx-g" aria-labelledby="cxg3"><h3 id="cxg3">Team schedule</h3><p class="cx-d">When I work (Israel time). A pause or a “Run now” takes effect within the hour.</p>'
  +(S3.length?S3.map(function(s){return schRow(s,ro);}).join(''):'<p class="cx-d cx-n">Not loaded yet.</p>')+'</section>';
 /* 4 templates */
 var TP=J8.approvals.templates();
 h+='<section class="cx-g" aria-labelledby="cxg4"><h3 id="cxg4">Templates</h3><p class="cx-d">I write drafts only from approved templates. Killed ones I don’t use.</p>'
  +(TP.length?TP.map(function(a){return tplRow(a,ro);}).join(''):'<p class="cx-d cx-n">No templates yet.</p>')+'</section>';
 /* 5 do-not-contact */
 var OO=J8.optout.list();
 h+='<section class="cx-g" aria-labelledby="cxg5"><h3 id="cxg5">Do-not-contact list</h3><p class="cx-d">I never write to these addresses. '+(OO.length===1?'1 address.':OO.length+' addresses.')+'</p>'
  +(OO.length?'<details class="cx-l" data-k="oo"'+(ctlOpen.oo?' open':'')+'><summary>Show the '+(OO.length===1?'address':OO.length+' addresses')+'</summary><ul>'+OO.map(function(o){return '<li dir="auto">'+esc(o.email||o.id)+'</li>';}).join('')+'</ul></details>':'')
  +(ro?'':'<form class="cx-f" id="ooF" novalidate><label for="ooIn">Add an address</label><div><input id="ooIn" type="email" inputmode="email" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="name@company.com" aria-describedby="ooErr"><button class="seat" type="submit">Add</button></div><p class="cx-e" id="ooErr" role="status"></p></form>')+'</section>';
 /* 6 app */
 var u=J8.status().user;
 h+='<section class="cx-g" aria-labelledby="cxg6"><h3 id="cxg6">App</h3>'
  +'<div class="sh-row"><div><b>Android app</b><span>J8NIX as an app on your phone.</span></div><a class="seat" href="app/" target="_blank" rel="noopener">Get the Android app</a></div>'
  +'<div class="sh-row"><div><b>Version</b><span>'+esc(J8V)+'</span></div></div>'
  +'<div class="sh-row"><div><b>Signed in</b><span class="cx-who">'+esc(u?u.email:'Not signed in')+'</span></div>'+(u?'<button type="button" class="txtb" data-cx="signout" data-fk="signout">Sign out</button>':'')+'</div></section>';
 el.innerHTML=h;renderSeat();
 if($('ooIn'))$('ooIn').value=iv;
 if(inF&&$('ooIn')){$('ooIn').focus();}else if(fk){var f=el.querySelector('[data-fk="'+(window.CSS&&CSS.escape?CSS.escape(fk):fk)+'"]');if(f&&!f.disabled)f.focus();}}
function ctlShow(on){ctlOn=on;ctlAsk=null;var s=$('sheet');s.classList.toggle('ctl',on);s.setAttribute('aria-label',on?'Control':'Settings');if(on){renderCtl();s.scrollTop=0;var t=$('ctlT');if(t)t.focus();}}
function openCtl(){if($('sheet').hidden){renderSeat();openSheet();}ctlShow(true);}
function ctlErr(e){toast(e&&e.code==='denied'?'Couldn’t save: this account isn’t allowed to change that yet.':e&&e.code==='conflict'?'Something changed at the same time. Try again.':'Couldn’t save ('+(e&&e.code||'error')+'). Try again.');renderCtl();}
function ctlAct(t){var k=t.dataset.cx,id=t.dataset.id,c=J8.control.get();
 if(k==='open'){openCtl();return;}
 if(k==='back'){ctlShow(false);var b=$('ctlBtn');if(b)b.focus();return;}
 if(k==='signout'){$('signOut').click();return;}
 if(!J8.orgs.can('admin')){toast('Only an admin of this business can change this.');return;}
 if(k==='email'||k==='brain'){if(!c)return;var cur=k==='email'?c.email_from_ok:c.brain_enabled;
  if(cur){(k==='email'?J8.control.setEmail(false):J8.control.setBrain(false)).then(function(){toast(k==='email'?'Email sending off. I send no email.':'Live AI answers off.');renderCtl();},ctlErr);}
  else{ctlAsk=k;renderCtl();var y=$('ctlBody').querySelector('[data-cx="yes"]');if(y)y.focus();}return;}
 if(k==='no'){var w=ctlAsk;ctlAsk=null;renderCtl();var sb=$('ctlBody').querySelector('[data-fk="'+w+'"]');if(sb)sb.focus();return;}
 if(k==='yes'){var a=ctlAsk;ctlAsk=null;(a==='email'?J8.control.setEmail(true):J8.control.setBrain(true)).then(function(){toast(a==='email'?'Email sending on. Approved emails go out on my next run.':'Live AI answers on.');renderCtl();},ctlErr);renderCtl();var f=$('ctlBody').querySelector('[data-fk="'+a+'"]');if(f)f.focus();return;}
 if(k==='cap'){if(!c)return;var n=(+((c.caps||{})[t.dataset.key])||0)+(+t.dataset.d);if(n<0||n>50)return;J8.control.setCap(t.dataset.key,n).then(renderCtl,ctlErr);renderCtl();return;}
 if(k==='sch'){var s=J8.schedule.get(id);if(!s||s.locked)return;var on=!(s.want_enabled!=null?s.want_enabled:s.enabled);
  J8.schedule.setEnabled(id,on).then(function(){toast(on?'Asked: '+s.name+' turns on within the hour.':'Asked: '+s.name+' pauses within the hour.');},ctlErr);renderCtl();return;}
 if(k==='run'){var r=J8.schedule.get(id);J8.schedule.runNow(id).then(function(){toast('Asked: '+(r?r.name:'it')+' starts within the hour.');},ctlErr);renderCtl();return;}
 if(k==='tok'||k==='tkill'){(k==='tok'?J8.approvals.approve(id):J8.approvals.kill(id)).then(function(){toast(k==='tok'?'Template approved. I write drafts from it.':'Template killed. I stop using it.',function(){J8.approvals.undo(id).then(function(){toast('Back to waiting.');});});renderCtl();},ctlErr);return;}}
document.addEventListener('toggle',function(e){var d=e.target;if(d&&d.dataset&&d.dataset.k)ctlOpen[d.dataset.k]=d.open;},true);
document.addEventListener('submit',function(e){if(!e.target||e.target.id!=='ooF')return;e.preventDefault();var i=$('ooIn'),m=$('ooErr'),v=String(i.value||'').trim().toLowerCase();
 if(!J8.optout.valid(v)){m.textContent='That doesn’t look like an email address.';i.setAttribute('aria-invalid','true');i.focus();return;}
 if(J8.optout.has(v)){m.textContent='Already on the list.';i.focus();return;}
 m.textContent='';i.removeAttribute('aria-invalid');i.value='';
 J8.optout.add(v).then(function(){toast(v+' is on the do-not-contact list. I never write to it.');renderCtl();},function(er){i.value=v;ctlErr(er);});renderCtl();});

/* ===== decisions ===== */
function decide(id,how,noted){var run=function(){var p=how==='send'?J8.approvals.approve(id):J8.approvals.kill(id);
  p.then(function(){editing=null;toast(how==='send'?(noted?'Approved. Held until the team applies your note.':'Approved. It goes out on the team’s next run.'):(noted?'Killed. Nothing goes out; the team reads your note.':'Killed. Nothing goes out.'),function(){J8.approvals.undo(id).then(function(){toast('Back to waiting.');renderAll();});});renderAll();},
   function(e){toast(e&&e.code==='not_connected'?'Not connected. Try again in a moment.':'Couldn’t save ('+(e&&e.code||'error')+'). Try again.');renderAll();});};
 var r=document.querySelectorAll('[id$="-'+(window.CSS&&CSS.escape?CSS.escape(id):id)+'"].card');
 if(r.length&&!matchMedia('(prefers-reduced-motion:reduce)').matches){[].forEach.call(r,function(x){x.classList.add(how==='send'?'go':'gone');});setTimeout(run,260);}else run();}

/* ===== views ===== */
var VIEWS={chat:'chat',next:'v-next',list:'v-list',stats:'v-stats'};
function go(v,opt){if(!VIEWS[v])v='chat';view=v;document.body.dataset.view=v;ls('j8-view',v);
 [].forEach.call(document.querySelectorAll('.dock [data-go],.dnav [data-go]'),function(b){b.classList.toggle('on',b.dataset.go===v);});
 closeSheet();renderHead();renderView(v);var e=$(VIEWS[v]);if(e&&!(opt&&opt.keep)&&v!=='chat')e.scrollTop=0;if(v==='chat')setTimeout(chatBottom,30);}
function chatBottom(){var s=$('chScroll');if(s)s.scrollTop=s.scrollHeight;}
function setZone(z){if(z==='sign'){lcat='approve';if(selAp){var a=AP[selAp];if(a){openRow['b-'+(a.batch||'other')]=1;openRow['ap'+selAp]=1;}}}go(z==='sign'||z==='proj'||z==='inbox'?'list':z==='health'?'stats':z==='chat'?'chat':z,{keep:true});} /* [chat] */
function renderView(v){if(v==='chat')renderBrief();if(v==='next')renderNext();if(v==='list')renderList();if(v==='stats')renderStats();}
var booted=false;
function renderAll(){var q=connected?needs().length:0;['nN','dN'].forEach(function(k){var e=$(k);if(e){var was=e.textContent;e.textContent=q?q:'';e.hidden=!q;if(q&&was&&was!==String(q))bump(e);}});renderSeat();renderHead();renderPin();renderBrief();renderView(view);
 if(connected&&!booted&&view==='chat'){booted=true;setTimeout(chatBottom,60);}}
var rq=null;function soon(){if(rq)return;rq=setTimeout(function(){rq=null;renderAll();},30);}

function jump(t){
 if(!t)return;if(/^(approvals|approve|list-approve|tasks|today|week)$/.test(t)||(t.indexOf('list-')===0&&t.indexOf('list-tk-')<0))lmode='type';if(t==='control'){openCtl();return;}if(t==='chat'&&window.J8C){J8C.show();return;}
 if(t.indexOf('ap-')===0&&window.J8C){J8C.openAp(t.slice(3));return;}
 if(t==='approvals'||t==='approve'||t==='list-approve'){lcat='approve';go('list');return;}
 if(t.indexOf('list-tk-')===0){go('next');return;}
 if(t.indexOf('list-')===0){var k=t.slice(5),i=rows().filter(function(x){return x.key===k;})[0];lcat=i?i.g:'all';if(i)openRow[k]=1;go('list');scrollToEl(i&&i.batch?'approvals-'+i.batch.id:'r-'+k,'start');return;}
 if(t==='messages'||t==='chat'){go('chat');return;}
 if(t==='list'||t==='projects'||t==='proj'||t==='inbox'){lcat='all';go('list');return;}
 if(t==='tasks'||t==='today'||t==='week'){lcat='later';openRow.old=1;go('list');return;}
 if(t==='next'){go('next');return;}
 if(t==='stats'||t==='money'||t==='health'||t==='team'){go('stats');return;}
 if(t.indexOf('p-')===0&&PR[t]){lmode='unit';openRow['pj-'+t]=1;go('list');scrollToEl('pj-'+t,'start');return;}
 if(t.indexOf('p-')===0){var k2='mv-'+t,i2=rows().filter(function(x){return x.key===k2;})[0];lcat=i2?i2.g:'projects';if(i2)openRow[k2]=1;go('list');if(i2)scrollToEl('r-'+k2,'start');}
}
function fromHash(){var h=(location.hash||'').slice(1);if(h)jump(h);}
window.addEventListener('hashchange',fromHash);

document.addEventListener('click',function(e){
 var t=e.target.closest('a');if(t)return;
 t=e.target.closest('#gear');if(t){if($('sheet').hidden){renderSeat();openSheet();}else closeSheet();return;}
 t=e.target.closest('#scrim');if(t){closeSheet();return;}
 t=e.target.closest('[data-cx]');if(t){if(!t.disabled)ctlAct(t);return;}
 t=e.target.closest('[data-go]');if(t){go(t.dataset.go);return;}
 t=e.target.closest('[data-jump]');if(t){jump(t.dataset.jump);return;}
 t=e.target.closest('[data-cat]');if(t){lcat=t.dataset.cat;renderList();$('v-list').scrollTop=0;return;}
 t=e.target.closest('[data-pin]');if(t){pinAll=!pinAll;renderPin();return;}
 t=e.target.closest('[data-open]');if(t){var k=t.dataset.open;openRow[k]=!openRow[k];renderView(view);if(view==='chat')renderPin();return;}
 t=e.target.closest('[data-tnote]');if(t){var tn=t.dataset.tnote;ctlOpen['tn'+tn]=!ctlOpen['tn'+tn];renderCtl();setTimeout(function(){var f=document.querySelector('#ctlBody form.apn[data-ap="'+(window.CSS&&CSS.escape?CSS.escape(tn):tn)+'"] textarea');if(f)f.focus();},30);return;}
 t=e.target.closest('[data-apnote]');if(t){var an=t.dataset.apnote;openRow['apn'+an]=!openRow['apn'+an];renderView(view);setTimeout(function(){var f=document.querySelector('form.apn[data-ap="'+(window.CSS&&CSS.escape?CSS.escape(an):an)+'"] textarea');if(f)f.focus();},40);return;}
 t=e.target.closest('[data-apnd]');if(t){var aid=t.dataset.id,how=t.dataset.apnd,cd=t.closest('.card'),ta=cd&&cd.querySelector('form.apn textarea'),nv=String(ta&&ta.value||'').trim(),a0=AP[aid]||{};
  if(!nv){toast('Write the note first.');if(ta)ta.focus();return;}if(!J8.status().connected){toast('Not connected. Try again in a moment.');return;}
  J8.inbox.send(a0.product||'p-general',(how==='send'?'Approved, with a note: ':'Killed, with a note: ')+nv,null,aid).then(function(){ta.value='';openRow['apn'+aid]=0;decide(aid,how,true);},function(er){toast('Couldn’t send the note ('+(er&&er.code||'error')+'). Nothing changed.');});return;}
 t=e.target.closest('[data-ftab]');if(t){ls('j8-ftab',t.dataset.ftab);renderStats();$('v-stats').scrollTop=0;return;}
 t=e.target.closest('[data-fo]');if(t){FF.o=t.dataset.fo;saveFF();renderStats();return;}
 t=e.target.closest('[data-fb]');if(t){FF.b=!FF.b;saveFF();renderStats();return;}
 t=e.target.closest('[data-tday]');if(t){TDAY=t.dataset.tday;renderStats();var sel=document.querySelector('.tday.sel');if(sel&&sel.scrollIntoView)sel.scrollIntoView({block:'nearest',inline:'nearest'});return;}
 t=e.target.closest('[data-lmode]');if(t){lmode=t.dataset.lmode;ls('j8-lmode',lmode);renderList();renderHead();$('v-list').scrollTop=0;return;}
 t=e.target.closest('[data-tdone]');if(t){markDone('tk-'+t.dataset.tdone);return;}
 t=e.target.closest('[data-tundo]');if(t){var ud=t.dataset.tundo;J8.tasks.undo(ud).then(function(){toast('Back on your list.');},function(er){toast('Couldn’t save ('+(er&&er.code||'error')+'). Try again.');});return;}
 t=e.target.closest('[data-ndone]');if(t){markDone(t.dataset.ndone);return;}
 t=e.target.closest('[data-plan]');if(t){plan(true);renderAll();return;}
 t=e.target.closest('[data-nlater]');if(t){var pl=ls('j8-plan');if(pl&&pl.k&&pl.k.indexOf(t.dataset.nlater)>-1){pl.l=pl.l||{};pl.l[t.dataset.nlater]=1;ls('j8-plan',pl);}snooze(t.dataset.nlater,3);toast('Later: back in 3 hours.');renderAll();return;}
 t=e.target.closest('[data-blater]');if(t){snooze(t.dataset.blater,3);toast('Later: back in 3 hours.');renderAll();return;}
 t=e.target.closest('[data-ck]');if(t){var id=t.dataset.ck;S[id]=Object.assign({},S[id]||{},{done:true});renderList();
  J8.todo.tick(id).then(function(){toast('Ticked. It stays under Done.',function(){J8.todo.untick(id);});},function(er){toast(er&&er.code==='not_connected'?'Not connected: the tick stays on this screen only.':'Couldn’t save. Try again.');});return;}
 t=e.target.closest('[data-apsend]');if(t){decide(t.dataset.apsend,'send');return;}
 t=e.target.closest('[data-apkill]');if(t){decide(t.dataset.apkill,'kill');return;}
 t=e.target.closest('[data-apedit]');if(t){editing=t.dataset.apedit;renderView(view);var ta=$('ed-'+editing);if(ta)ta.focus();return;}
 t=e.target.closest('[data-apcancel]');if(t){editing=null;if(document.activeElement)document.activeElement.blur();renderView(view);return;}
 t=e.target.closest('[data-apsave]');if(t){var sid=t.dataset.apsave,v=String(($('ed-'+sid)||{}).value||'').trim();if(!v){toast('The text is empty. Write it or Kill it.');return;}
  if(document.activeElement)document.activeElement.blur();J8.approvals.edit(sid,v).then(function(){editing=null;toast('Your text is approved. It goes out on the team’s next run.',function(){J8.approvals.undo(sid);});renderAll();},function(er){toast('Couldn’t save ('+(er&&er.code||'error')+').');});return;}
 t=e.target.closest('#seat,#seatC');if(t){seatTap();return;}
 t=e.target.closest('[data-theme-set]');if(t){setTheme(t.dataset.themeSet);return;}
 t=e.target.closest('#undo');if(t){if(undoFn)undoFn();$('toast').classList.remove('on');return;}
});
document.addEventListener('submit',function(e){var f=e.target;if(!f.dataset||!f.dataset.ans)return;e.preventDefault();var ta=f.querySelector('textarea'),v=String(ta.value||'').trim();if(!v)return;
 if(!J8.status().connected){toast('Not connected. Try again in a moment.');return;}
 J8.inbox.send(f.dataset.ans,v,f.dataset.task||null,f.dataset.ap||null).then(function(){ta.value='';ta.blur();toast('Sent to the team.');},function(er){toast('Couldn’t send ('+(er&&er.code||'error')+'). Try again.');});});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet();});
document.addEventListener('change',function(e){var t=e.target;if(t&&t.matches&&t.matches('[data-fu]')){FF.u=t.value;saveFF();renderStats();}});
if(MQ.addEventListener)MQ.addEventListener('change',soon);
/* messenger: newest at the bottom; follow the conversation as it grows */
new MutationObserver(function(){if(view==='chat')chatBottom();}).observe($('j8cLog'),{childList:true,subtree:true,characterData:true});

/* ===== boot (PWA): shell.js signs in and connects; the screens follow J8's status ===== */
(function(){document.documentElement.dataset.theme=theme();renderTheme();var v=ls('j8-view');go(v&&VIEWS[v]?v:'chat');renderAll();})();
(function(){
 J8.on('status',function(st){var s=$('status');
  if(st.connected&&!connected){connected=true;s.hidden=true;setTimeout(fromHash,300);}
  else if(st.cached&&!st.connected&&!connected&&J8.projects.list().length){connected=true;} /* 6.0: paint the phone's last copy at once */
  else if(st.connected)s.hidden=true;
  else if(st.error==='offline'){if(J8.projects.list().length)connected=true;s.hidden=false;s.textContent='Offline. Showing the last copy.';}
  else if(st.error==='signed_out'){connected=false;booted=false;}
  soon();});
 J8.on('comments',function(d){CMT=d;soon();});
 J8.on('approvals',function(d){AP=d;soon();});
 J8.on('projects',function(d){PR=d;soon();});
 J8.on('runs',function(d){RUNS=d;soon();});
 J8.on('money',function(d){MONEY=d;soon();});
 J8.on('todo',function(d){S=Object.assign({},d);soon();});
 J8.on('tasks',function(d){TK=d;soon();});
 J8.on('units',function(d){UN=d;soon();});
 J8.on('schedule',function(){if(view==='stats')soon();});
 J8.on('control',function(d){CTRL=d&&d.main?d.main:null;renderSeat();renderCtl();});
 J8.on('schedule',function(){renderCtl();});J8.on('optout',function(){renderCtl();});J8.on('approvals',function(){renderCtl();});J8.on('status',function(){renderCtl();});
})();

/* ===== J8NIX chat (PWA, 13 Nov): Dave writes to the studio team through J8.inbox.
   Every message is a row in j8_messages; the database adds an instant first line ("Got it…"),
   the team adds reply lines, and status moves new → routed → done. All of it updates live.
   Live AI answers stay off until control.brain_enabled (Dave's paid OK): no fake typing. ===== */
var J8C=(function(){
 var QUICK=['What is the one move that brings money fastest?','What is waiting on me right now?','Which teams failed or went quiet?','One line on every project'];
 var MAX=60,lastOld='',lastNew='',sending=false;
 var SW={new:'Sent',routed:'With the team',done:'Done'};
 function g(id){return document.getElementById(id);}
 function dayKey(iso){var t=iso?new Date(iso):new Date();return isNaN(t)?'':ymd(t);}
 function dayLabel(k){var t=new Date(k+'T12:00:00'),y=new Date(Date.now()-864e5);if(k===ymd(new Date()))return 'Today';if(k===ymd(y))return 'Yesterday';return t.getDate()+' '+MON[t.getMonth()]+(t.getFullYear()!==new Date().getFullYear()?' '+t.getFullYear():'');}
 function hm(iso){var t=iso?new Date(iso):new Date();return isNaN(t)?'':t.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});}
 /* reply lines look like "17:53 — text"; each line is one bubble from the team */
 function lines(r){return String(r||'').split('\n').filter(function(l){return l.trim();}).map(function(l){var m=l.match(/^\s*(\d{1,2}:\d\d)(?:\s*\(([^)]{1,20})\))?\s*[—-]\s*([\s\S]*)$/);return m?{t:m[1]+(m[2]?' · '+m[2]:''),x:m[3]}:{t:'',x:l.trim()};});}
 function md(s){var h=esc(s);
  h=h.replace(/\[([^\]\n]{1,120})\]\((#[A-Za-z0-9_\-]+|https?:\/\/[^\s)]+)\)/g,function(_,t,u){return u.charAt(0)==='#'?'<button type="button" class="lk" data-jump="'+u.slice(1)+'">'+t+'</button>':'<a class="lk ext" href="'+u+'" target="_blank" rel="noopener">'+t+'</a>';});
  h=h.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g,function(_,p,u){return p+'<a class="lk ext" href="'+u+'" target="_blank" rel="noopener">'+cut(u.replace(/^https?:\/\//,''),48)+'</a>';});
  return h.replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>');}
 function msgHTML(x){var st=SW[x.status]?x.status:'new',about=x.p&&x.p!=='p-general'?'<span class="ab" dir="auto">'+pm(x.p)+esc(pname(x.p))+'</span>':'';
  var h='<div class="cm u" id="m-'+esc(x.id)+'">'+about+'<p dir="auto">'+esc(x.text)+'</p><time>'+esc(hm(x.at))+' · <b class="cst cst-'+st+'">'+SW[st]+'</b></time></div>';
  lines(x.reply).forEach(function(l){var v=sevOf(l.x)||sevLegacy(l.x);h+='<div class="cm a'+(v?' lv-'+v:'')+'">'+sevChip(v)+'<div class="tx" dir="auto">'+md(sevStrip(l.x))+'</div>'+(l.t?'<time>'+esc(l.t)+'</time>':'')+'</div>';});
  return h;}
 function render(){
  var oldEl=g('j8cOld'),log=g('j8cLog');if(!log||!oldEl)return;
  var L=connected?J8.inbox.list(MAX).slice().reverse():[],td=ymd(new Date()),o='',n='',day='';
  L.forEach(function(x){var k=dayKey(x.at);if(k===td){n+=msgHTML(x);return;}if(k!==day){day=k;o+='<div class="daychip"><span>'+esc(dayLabel(k))+'</span></div>';}o+=msgHTML(x);});
  if(o!==lastOld){oldEl.innerHTML=o;lastOld=o;}
  if(n!==lastNew){log.innerHTML=n;lastNew=n;}
  var s=g('j8cStrip');if(s)s.hidden=!connected||L.length>0;
 }
 function meta(){
  var st=g('j8cState'),c=J8.control.get();
  if(st){if(!c){st.className='ch-st';st.textContent='Sending —';}else if(c.paused){st.className='ch-st off';st.textContent='Sending paused';}else{st.className='ch-st on';st.textContent='Sending on';}}
  var nt=g('j8cNote');if(nt)nt.textContent=J8.control.brainEnabled()?'J8NIX answers here in a moment.':'The team answers here, usually within the hour. You get an alert when they reply.';
  var strip=g('j8cStrip');if(strip&&!strip.dataset.done){strip.innerHTML=QUICK.map(function(x){return '<button type="button" class="ch-q" data-cq="'+esc(x)+'">'+esc(x)+'</button>';}).join('');strip.dataset.done='1';}
 }
 function openAp(id){var a=AP[id];if(!a)return;batchSel=a.batch||'other';showDec=!!(a.status&&a.status!=='pending');selAp=id;hlAp=id;setZone('sign');renderApprovals();scrollToEl('ap-'+id,'center');}
 function show(){go('chat');setTimeout(function(){var i=g('j8cIn');if(i)i.focus();},80);}
 function send(){
  var i=g('j8cIn'),v=String(i.value||'').trim();if(!v||sending)return;
  if(!J8.status().connected){toast('Not connected. Your text stays in the box.');return;}
  sending=true;g('j8cGo').disabled=true;i.value='';i.style.height='';
  J8.inbox.send('p-general',v).then(function(){sending=false;g('j8cGo').disabled=false;render();chatBottom();},
   function(e){sending=false;g('j8cGo').disabled=false;i.value=v;toast('Couldn’t send ('+(e&&e.code||'error')+'). Try again.');});
 }
 g('j8cForm').addEventListener('submit',function(e){e.preventDefault();send();});
 g('j8cIn').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&!MQ.matches){e.preventDefault();send();}});
 g('j8cIn').addEventListener('input',function(e){var t=e.target;t.style.height='auto';t.style.height=Math.min(150,t.scrollHeight)+'px';});
 document.addEventListener('click',function(e){var t=e.target.closest('[data-cq]');if(!t)return;var i=g('j8cIn');i.value=t.dataset.cq;i.dispatchEvent(new Event('input'));i.focus();});
 J8.on('comments',function(){render();});
 J8.on('control',function(){meta();});
 J8.on('status',function(){render();meta();});
 meta();render();
 return {show:show,openAp:openAp,render:render,meta:meta};
})();
