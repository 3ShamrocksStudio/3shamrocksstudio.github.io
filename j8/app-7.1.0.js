/* J8NIX PWA screens 7.1.0 (14 Nov 2026): the v7.1 design (Today / Studio / Flow / Talk) on live data.
   Data engine below is 6.1.2's, unchanged except itemNames() now joins with commas (no "·" in the UI).
   Plan, screen → code → data map and revert: ops/brain/J8NIX-V6-PLAN.md §7.1. Revert copy of 6.1.2: app-6.1.2.js + index-6.1.2.html.
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
 return P.slice(0,max).join(', ')+(P.length>max?', and more':'');}
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
function pvText(t,n){var L=String(t||'').split('\n').map(function(x){return x.replace(/\s+/g,' ').trim();}).filter(Boolean),o=[],c=0;for(var k=0;k<L.length&&c<(n||160);k++){var x=L[k].slice(0,(n||160)-c);if(x.length<L[k].length)x+='…';o.push(x);c+=x.length;}return o.join('\n');}
function tm(iso){var t=iso?new Date(iso):new Date();return isNaN(t)?'':(ymd(t)===ymd(new Date())?t.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):t.getDate()+' '+MON[t.getMonth()]);}
function apReply(a){var x=J8.inbox.forApproval?J8.inbox.forApproval(a.id)[0]:null;if(!x)return '';var R=String(x.reply||'').split('\n').filter(function(l){return l.trim();});if(!R.length)return '';var k='apr-'+a.id,o=openRow[k];
 return '<button class="trp'+(o?' open':'')+'" data-open="'+esc(k)+'" aria-expanded="'+(o?'true':'false')+'"><span class="trl" dir="auto">'+sevChip(sevOf(J8.inbox.lastReply(x)))+esc(lastClean(x))+'</span></button>'
  +(o?'<div class="trx" dir="auto">'+R.map(function(l){return esc(sevStrip(l.replace(/^\s*\d{1,2}:\d\d(?:\s*\([^)]*\))?\s*[—-]\s*/,'')));}).join('<br>')+'</div>':'');}
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
 return lbl+': '+(P.length?P.join(', '):'nothing new')+'.';}
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
var NEEDK=null,NEWK={},NEEDN=null;
function bump(el){if(!el)return;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
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
 J8.approvals.list().forEach(function(a){if(a.product===p.id&&isOpenAp(a)&&apDue(a)&&dday(apDue(a))>=today)c.push({t:apKind(a)+': '+apWho(a),at:apDue(a),src:'draft slot'});});
 c.sort(function(x,y){return String(x.at).localeCompare(String(y.at));});return c[0]||null;}
function stageOf(p){return isNum(p.stage)&&p.stage>=1&&p.stage<=6?p.stage:0;}
function isDoneP(p){return p&&p.status==='done';}
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
  push({day:dday(apDue(a)),time:dtime(apDue(a)),k:mine?'you':'team',who:mine?'me':'team',title:apKind(a)+': '+apWho(a),sub:(a.status==='pending'||!a.status?'waits for your Send':mine?'you post it by hand':'the team sends it')+', '+pname(a.product),pid:a.product,id:a.id,jump:'list-b-'+(a.batch||'other')});});
 var m=J8.money.summary()||{};if(m.m1_date&&FF.o!=='ext'&&FF.u==='all'&&!FF.b)E.push({day:dday(m.m1_date),time:'',k:'ms',who:'me',title:'M1: '+usd(m.m1_usd||25000)+' booked',sub:'studio plan, money summary',jump:'stats'});
 return E;}
function runsOn(d){if(FF.o==='me'||FF.o==='ext'||FF.b||FF.u!=='all')return [];var R=[];schedList().forEach(function(s){var c=cronDay(s.cron,d);if(!c)return;if(c.hourly){if(c.ok)R.push({time:'',name:s.name,when:s.when_text||'every hour',hourly:true});return;}c.t.forEach(function(t){R.push({time:t,name:s.name,when:s.when_text||''});});});return R;}
function lastMove(p){var t=pd(p.updated);if(isNaN(t))t=-Infinity;J8.runs.list().forEach(function(r){if((r.projects||[]).indexOf(p.id)>-1||r.project===p.id){var e=pd(r.ended||r.started);if(e>t)t=e;}});
 J8.inbox.list().forEach(function(x){if(x.p===p.id){var e=pd(x.updated_at);if(e>t)t=e;}});return t;}
function weekCounts(a,b){var runs=0,sent=0;J8.runs.list().forEach(function(r){var e=pd(r.ended);if(e>=a&&e<b&&r.status==='ok')runs++;});J8.approvals.list().forEach(function(x){var e=pd(x.sent_at);if(x.status==='sent'&&e>=a&&e<b)sent++;});return {runs:runs,sent:sent,dave:flowWin(a,b).n};}
function noUrl(s){return String(s==null?'':s).replace(/\s*(?:[—–-]\s*)?(?:check:?\s*)?(?:https?:\/\/|www\.)\S*[^\s.,;:)]/gi,'').replace(/\s{2,}/g,' ').replace(/[\s:—–-]+$/,'').trim();}
function linkTxt(s){var out='',i=0,re=/(?:https?:\/\/)\S+/gi,m;s=String(s==null?'':s);while((m=re.exec(s))){var u=m[0].replace(/[.,;:)]+$/,'');out+=esc(s.slice(i,m.index))+'<a href="'+esc(u)+'" target="_blank" rel="noopener">open link</a>';i=m.index+u.length;}return out+esc(s.slice(i));}
function armKey(s){return String(s||'').toLowerCase().replace(/^3s\s+/,'').replace(/\s*\([^)]*\)\s*/g,' ').replace(/\s+/g,' ').trim();}
function theme(){var t=ls('j8-theme');return t==='dark'||t==='auto'?t:'light';}
function setTheme(t){ls('j8-theme',t);document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='dark'?'#11283C':'#FFFFFF';renderTheme();if(typeof renderAll==='function')renderAll();}
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

var ctlOn=false,ctlAsk=null,ctlOpen={};
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
function unitsSorted(){return J8.units.departments().slice().sort(function(a,b){return (a.sort||0)-(b.sort||0);});}
function firstNum(L){var m=Infinity;L.forEach(function(v){if(v<m)m=v;});return m;}
/* =====================================================================================================================
   J8NIX 7.1.0 (14 Nov 2026): the v7.1 design on live data. Four places, one job each, one hue each:
   Today (amber = you) · Studio (blue = places) · Flow (teal = progress) · Talk (orchid = people). Red = alarm only.
   Every screen answers 4 questions in one brief: where you are, what you see, what is needed (amber), what you get (teal).
   The data logic above is unchanged from 6.1.2 (rows, unlocks, needs, mentor, notes with routing, Control).
   Plan + screen → code → data map: ops/brain/J8NIX-V6-PLAN.md §7.1. Revert: index-6.1.2.html (one line in the plan).
   ===================================================================================================================== */
var J8V='7.1.0';
/* ---------- words (EN / HE). Content stays in its own language with dir=auto; numbers in <bdi>. ---------- */
var LANG=(function(){var l=ls('j8-lang');return l==='he'?'he':'en';})();
var TX={en:{
 today:'Today',studio:'Studio',flow:'Flow',talk:'Talk',settings:'Settings',back:'Back',youAreIn:'You are in',
 needs:'Needs you',gets:'You get',first:'Do this first',then:'Then',planned:'Planned for later',everything:'Everything else',doneToday:'Done today',
 do:'Do',comment:'Comment',later:'Later',notNeeded:'Not needed',send:'Send',edit:'Edit',kill:'Kill',undo:'Undo',where:'Where',how:'How',after:'After',
 markDone:'Mark done',notYet:'Not yet',save:'Save and send',cancel:'Cancel',close:'Close',now:'Now',gotIt:'Got it',actions:'Actions',
 dayTitle:'Your day, {d}',todayWhat:'Your steps, in the order that frees the most work.',nSteps:'{n} steps',oneStep:'1 step',aboutMin:', about {n} min',
 nThings:'{n} things',oneThing:'1 thing',moveAfterGold:'move after the gold card alone.',goldMoney:'the gold card is the step closest to money.',goldGain:'one clear step at a time, in the best order.',
 nOfDone:'{a} of {b} done today',loading:'Loading…',loadingDay:'Loading your day…',nothingNow:'nothing right now.',teamKeeps:'the team keeps {n} things moving.',
 allClear:'All clear',allClearP:'Everything that needed you is done. New steps appear here, and your phone tells you.',seeFlow:'See how the studio is moving',
 noConn:'No connection',noConnP:'You see the list from {t}. What you tap now is sent when you are back online.',tryAgain:'Try again',savedCopy:'Saved copy from {t}:',
 coach:'New here? Amber means you. Do the gold card first.',
 wTask:'Waits',wNow:'Now',wToday:'Today',wWeek:'This week',min:'{n} min',hereJ8:'Here, in J8NIX',whereCtl:'J8NIX Settings, then Control',whereTalk:'Talk, in J8NIX',
 howBatch:'Read each one, then tap Send, Edit or Kill.',afterSwitch:'This closes by itself when {s} is on in Control.',afterOut:'Come back and tap Mark done.',
 readN:'read the {n}',readOne:'read it',answerTeam:'answer the team',openIt:'open it',forYou:'{n} for you',teamHasIt:'Team has it',furthest:'Furthest: {s}',
 openedGo:'Opened. When it is done, come back and tap Mark done.',openedSelf:'Opened. It closes by itself when the switch is on.',
 doneFree:'Done. {n} things can move.',doneFree1:'Done. 1 thing can move.',doneNo:'Done.',nextTop:'Next is now at the top.',allClearT:'All clear for now.',
 doneTold:'Marked done. The team is told.',doneHere:'Marked done here. The team could not be told yet.',backOnList:'Back on your list.',
 laterQ:'When should this come back?',laterNote:'It waits under "Planned for later" on Today, then comes back by itself.',
 tonight:'Tonight',in3h:'In 3 hours',tomorrow:'Tomorrow morning',nextWeek:'Next week',laterT:'Planned for {w}. It waits under Planned for later.',
 comesBack:'Comes back: {w}',noT:'Marked not needed. It is under Done, at the bottom.',noBatchQ:'Kill all {n}?',noBatchP:'None of these {n} will be sent. Undo stays in the message and under Done today.',
 killAll:'Kill all {n}',killedAll:'Killed {n}. Nothing goes out. They are under Done today.',
 couldNot:'Couldn’t save ({e}). Try again.',notConn:'Not connected. Try again in a moment.',localOnly:'Saved on this phone only. Try again when online.',
 sDept:'{n} departments, {m} projects',sDept1:'1 department, {m} projects',sWhat:'Every department and its projects, in one place.',sNeed:'{n} departments have steps for you. {d} has the most.',sNeed1:'1 department has steps for you: {d}.',sNeed0:'nothing. The team has every next step.',
 sGain:'see where each project stands and who holds its next step.',startHere:'Start here',stepsMin:'{n} steps for you, about {m} min.',steps1:'1 step for you.',inclFirst:'It includes your first step on Today.',open:'Open {x}',
 departments:'Departments',noProjects:'No projects yet: {x}.',other:'Other',
 dWhat:'{n} projects, the one that needs you most first.',dWhat1:'1 project.',dNeed:'{n} steps, about {m} min.',dGain:'move these projects toward paying users.',
 nowStage:'Now {s}',nextYou:'Next: you',nextTeam:'Next: team',nextOut:'Next: outside',stageOf:'stage {a} of 6',noStage:'No stage yet',
 pWhat:'Now at {s}, stage {a} of 6.',pNeed0:'nothing. The team has the next step.',pGain:'it reaches {s} after: {x}',pGainP:'it keeps moving.',yourNext:'Your next step',alsoYours:'Also yours',
 teamOn:'The team is on it',approvedWait:'Approved, not sent yet',drafts:'Drafts for you',doneHere2:'Done here',links:'Links',commentOn:'Comment on {x}',commentLead:'Ideas or changes. The {t} team answers here and in Talk.',
 ready:'ready {d}',waitsOn:'waits on {x}',writeC:'Write a comment',yourComment:'Your comment',
 draftN:'{k} {i} of {n}',draftWhat:'To {x}. Read it, then choose.',draftNeed:'read it, then Send, Edit or Kill.',draftGain:'it goes out on the team’s next run after your Send.',draftGainOff:'Send keeps it ready; it goes out once email sending is on.',
 emailOff:'Email sending is off, so Send keeps it ready until you turn sending on in Control.',waitsBlock:'It waits on: {x}. Send keeps it ready; it goes out after that.',
 to:'To',channel:'Channel',project:'Project',teamNote:'Note from the team',emailActions:'Draft actions',
 allDecided:'All {n} decided',adNeed:'nothing more here.',adGain:'{a} approved, {k} killed. Approved ones go out on the team’s next run.',nextForYou:'Next for you',goToday:'Go to it on Today',
 approvedNext:'Approved. {x} is next.',approvedLast:'Approved. It is under Done on Today.',killedNext:'Killed. It will not be sent. {x} is next.',killedLast:'Killed. It will not be sent. It is under Done on Today.',
 savedApproved:'Saved and approved. It goes out on the team’s next run.',emptyText:'The text is empty. Write it or Kill it.',backWaiting:'Back to waiting.',
 fTitle:'Milestone 1 in {n} days',fTitleNo:'How the studio moves',fWhat:'How the studio is moving toward it.',fNeed:'1 step is holding up {n} things.',fNeed0:'nothing is stuck on you.',fGain:'money, blockers and progress in one look.',
 stuck:'What is stuck',stuckP:'{n} things wait on this.',takesMin:'It takes {n} minutes.',doItNow:'Do it now',money:'Money',booked:'{a} of {b} booked',bookedNo:'Booked: collecting data',
 m1due:'Milestone 1 is due {d}.',closest:'Closest to money: {p}.',thisWeek:'This week',clearedYou:'{n} cleared by you',weekP:'The team finished {r} runs and sent {s}. Last week: {l}.',
 everyProject:'Every project',everyLead:'Furthest along first. Tap one to open it.',doneProjects:'Done',comingUp:'Coming up',slotPassed:'Slot passed, still open',nothingDated:'Nothing dated in the next two weeks.',
 teamNow:'The team right now',working:'Working',on:'On',off:'Off',problem:'Problem',waiting:'Waiting',noRun:'No run recorded yet',nextRun:'next {t}',numbers:'Numbers and milestones',
 you:'You',team:'Team',outside:'Outside',
 tTitle:'{n} questions for you',tTitle1:'1 question for you',tTitle0:'All answered',tWhat:'You and the team: questions, answers and updates.',tNeed:'{n} from the team. Answer in a line.',tNeed0:'nothing. All questions are answered.',tGain:'the team keeps working while you answer in a line.',
 asks:'{t} asks',answerPh:'Answer the team',openLink:'Open the link',moreQ:'More questions',answers:'Answers to your comments',answered:'Answered',tAnswered:'{t} answered, {h}',
 updates:'Updates',msgTeam:'Message the team',talkHint:'To ask about one item, open it and tap Comment.',yourMsg:'Your message, {h}',yourNote:'Your note, {h}',
 sent:'Sent',withTeam:'With the team',doneW:'Done',comments:'Comments',sentTo:'Sent to {t}, {h}. The answer comes here and in Talk.',answeredBy:'Answered by {t}, {h}',
 threadLead:'Ask a question or give a change. The {t} team answers here and in Talk, usually within the hour.',sentToT:'Sent to {t}. The answer comes here and in Talk.',
 apNote:'Approve + note',kNote:'Kill + note',writeNote:'Write the note first.',
 textSize:'Text size',std:'Standard',large:'Large',xl:'Largest',language:'Language',help:'Help',showTip:'Show the tip again',theme:'Theme'
},he:{
 today:'היום',studio:'הסטודיו',flow:'זרימה',talk:'שיחה',settings:'הגדרות',back:'חזרה',youAreIn:'את/ה נמצא/ת ב',
 needs:'מחכה לך',gets:'מה תקבל',first:'קודם כל את זה',then:'אחר כך',planned:'נדחה למועד אחר',everything:'כל השאר',doneToday:'בוצע היום',
 do:'לבצע',comment:'הערה',later:'אחר כך',notNeeded:'לא צריך',send:'לשלוח',edit:'לערוך',kill:'לבטל',undo:'ביטול',where:'איפה',how:'איך',after:'אחרי',
 markDone:'סמן כבוצע',notYet:'עוד לא',save:'לשמור ולשלוח',cancel:'ביטול',close:'סגירה',now:'עכשיו',gotIt:'הבנתי',actions:'פעולות',
 dayTitle:'היום שלך, {d}',todayWhat:'הצעדים שלך, לפי הסדר שמשחרר הכי הרבה עבודה.',nSteps:'{n} צעדים',oneStep:'צעד אחד',aboutMin:', בערך {n} דק׳',
 nThings:'{n} דברים',oneThing:'דבר אחד',moveAfterGold:'זזים אחרי הכרטיס הזהוב לבדו.',goldMoney:'הכרטיס הזהוב הוא הצעד הקרוב ביותר לכסף.',goldGain:'צעד ברור אחד בכל פעם, בסדר הנכון.',
 nOfDone:'{a} מתוך {b} בוצעו היום',loading:'טוען…',loadingDay:'טוען את היום שלך…',nothingNow:'כלום כרגע.',teamKeeps:'הצוות ממשיך להזיז {n} דברים.',
 allClear:'הכול נקי',allClearP:'כל מה שחיכה לך בוצע. צעדים חדשים יופיעו כאן, והטלפון יודיע לך.',seeFlow:'לראות איך הסטודיו זז',
 noConn:'אין חיבור',noConnP:'זו הרשימה מ-{t}. מה שתלחץ עכשיו יישלח כשיחזור החיבור.',tryAgain:'לנסות שוב',savedCopy:'עותק שמור מ-{t}:',
 coach:'חדש כאן? כתום = את/ה. קודם הכרטיס הזהוב.',
 wTask:'ממתין',wNow:'עכשיו',wToday:'היום',wWeek:'השבוע',min:'{n} דק׳',hereJ8:'כאן, ב-J8NIX',whereCtl:'הגדרות J8NIX, ואז Control',whereTalk:'שיחה, ב-J8NIX',
 howBatch:'לקרוא כל אחד, ואז לשלוח, לערוך או לבטל.',afterSwitch:'זה נסגר לבד כש-{s} מופעל ב-Control.',afterOut:'לחזור ולסמן כבוצע.',
 readN:'לקרוא את {n}',readOne:'לקרוא',answerTeam:'לענות לצוות',openIt:'לפתוח',forYou:'{n} בשבילך',teamHasIt:'אצל הצוות',furthest:'הכי רחוק: {s}',
 openedGo:'נפתח. כשזה בוצע, לחזור ולסמן כבוצע.',openedSelf:'נפתח. זה נסגר לבד כשהמתג מופעל.',
 doneFree:'בוצע. {n} דברים יכולים לזוז.',doneFree1:'בוצע. דבר אחד יכול לזוז.',doneNo:'בוצע.',nextTop:'הבא עכשיו למעלה.',allClearT:'הכול נקי כרגע.',
 doneTold:'סומן כבוצע. הצוות עודכן.',doneHere:'סומן כאן. עוד לא הצלחנו לעדכן את הצוות.',backOnList:'חזר לרשימה שלך.',
 laterQ:'מתי להחזיר את זה?',laterNote:'זה מחכה תחת "נדחה למועד אחר" בהיום, ואז חוזר לבד.',
 tonight:'הערב',in3h:'בעוד 3 שעות',tomorrow:'מחר בבוקר',nextWeek:'בשבוע הבא',laterT:'נדחה ל{w}. זה מחכה תחת נדחה למועד אחר.',
 comesBack:'חוזר: {w}',noT:'סומן כלא צריך. זה תחת בוצע, למטה.',noBatchQ:'לבטל את כל ה-{n}?',noBatchP:'אף אחד מה-{n} לא יישלח. אפשר לבטל מההודעה ומתחת לבוצע היום.',
 killAll:'לבטל את כל ה-{n}',killedAll:'בוטלו {n}. שום דבר לא יוצא. הם תחת בוצע היום.',
 couldNot:'לא נשמר ({e}). לנסות שוב.',notConn:'אין חיבור. לנסות שוב בעוד רגע.',localOnly:'נשמר רק בטלפון הזה. לנסות שוב כשיש חיבור.',
 sDept:'{n} מחלקות, {m} פרויקטים',sDept1:'מחלקה אחת, {m} פרויקטים',sWhat:'כל מחלקה והפרויקטים שלה, במקום אחד.',sNeed:'ב-{n} מחלקות יש צעדים בשבילך. הכי הרבה ב{d}.',sNeed1:'במחלקה אחת יש צעדים בשבילך: {d}.',sNeed0:'כלום. הצוות מחזיק כל צעד הבא.',
 sGain:'לראות איפה כל פרויקט עומד ומי מחזיק את הצעד הבא.',startHere:'להתחיל כאן',stepsMin:'{n} צעדים בשבילך, בערך {m} דק׳.',steps1:'צעד אחד בשבילך.',inclFirst:'כולל הצעד הראשון שלך בהיום.',open:'לפתוח את {x}',
 departments:'מחלקות',noProjects:'עוד אין פרויקטים: {x}.',other:'אחר',
 dWhat:'{n} פרויקטים, זה שהכי צריך אותך קודם.',dWhat1:'פרויקט אחד.',dNeed:'{n} צעדים, בערך {m} דק׳.',dGain:'לקדם את הפרויקטים לעבר משתמשים משלמים.',
 nowStage:'עכשיו {s}',nextYou:'הבא: את/ה',nextTeam:'הבא: הצוות',nextOut:'הבא: מבחוץ',stageOf:'שלב {a} מתוך 6',noStage:'עוד בלי שלב',
 pWhat:'עכשיו ב{s}, שלב {a} מתוך 6.',pNeed0:'כלום. הצוות מחזיק את הצעד הבא.',pGain:'הוא מגיע ל{s} כש: {x}',pGainP:'הוא ממשיך לזוז.',yourNext:'הצעד הבא שלך',alsoYours:'גם שלך',
 teamOn:'הצוות עובד על זה',approvedWait:'אושר, עוד לא נשלח',drafts:'טיוטות בשבילך',doneHere2:'בוצע כאן',links:'קישורים',commentOn:'הערה על {x}',commentLead:'רעיונות או שינויים. צוות {t} עונה כאן ובשיחה.',
 ready:'מוכן {d}',waitsOn:'מחכה ל: {x}',writeC:'לכתוב הערה',yourComment:'ההערה שלך',
 draftN:'{k} {i} מתוך {n}',draftWhat:'אל {x}. לקרוא, ואז לבחור.',draftNeed:'לקרוא, ואז לשלוח, לערוך או לבטל.',draftGain:'זה יוצא בריצה הבאה של הצוות אחרי השליחה שלך.',draftGainOff:'שליחה שומרת את זה מוכן; זה יוצא כשמפעילים שליחת מייל.',
 emailOff:'שליחת מייל כבויה, אז שליחה שומרת את זה מוכן עד שמפעילים אותה ב-Control.',waitsBlock:'זה מחכה ל: {x}. שליחה שומרת את זה מוכן; זה יוצא אחרי זה.',
 to:'אל',channel:'ערוץ',project:'פרויקט',teamNote:'הערה מהצוות',emailActions:'פעולות על הטיוטה',
 allDecided:'כל ה-{n} הוחלטו',adNeed:'אין עוד כלום כאן.',adGain:'{a} אושרו, {k} בוטלו. המאושרים יוצאים בריצה הבאה של הצוות.',nextForYou:'הבא בשבילך',goToday:'ללכת לזה בהיום',
 approvedNext:'אושר. הבא: {x}.',approvedLast:'אושר. זה תחת בוצע בהיום.',killedNext:'בוטל. לא יישלח. הבא: {x}.',killedLast:'בוטל. לא יישלח. זה תחת בוצע בהיום.',
 savedApproved:'נשמר ואושר. יוצא בריצה הבאה של הצוות.',emptyText:'הטקסט ריק. לכתוב או לבטל.',backWaiting:'חזר להמתנה.',
 fTitle:'אבן דרך 1 בעוד {n} ימים',fTitleNo:'איך הסטודיו זז',fWhat:'איך הסטודיו מתקדם אליה.',fNeed:'צעד אחד מעכב {n} דברים.',fNeed0:'שום דבר לא תקוע אצלך.',fGain:'כסף, חסימות והתקדמות במבט אחד.',
 stuck:'מה תקוע',stuckP:'{n} דברים מחכים לזה.',takesMin:'זה לוקח {n} דקות.',doItNow:'לעשות עכשיו',money:'כסף',booked:'{a} מתוך {b} נסגרו',bookedNo:'נסגר: אוספים נתונים',
 m1due:'אבן דרך 1 ב-{d}.',closest:'הקרוב ביותר לכסף: {p}.',thisWeek:'השבוע',clearedYou:'{n} נסגרו על ידך',weekP:'הצוות סיים {r} ריצות ושלח {s}. בשבוע שעבר: {l}.',
 everyProject:'כל הפרויקטים',everyLead:'המתקדמים ביותר קודם. לחיצה פותחת.',doneProjects:'בוצעו',comingUp:'בקרוב',slotPassed:'המועד עבר, עדיין פתוח',nothingDated:'אין מועדים בשבועיים הקרובים.',
 teamNow:'הצוות עכשיו',working:'עובד',on:'פעיל',off:'כבוי',problem:'בעיה',waiting:'מחכה',noRun:'עוד אין ריצה',nextRun:'הבא {t}',numbers:'מספרים ואבני דרך',
 you:'את/ה',team:'צוות',outside:'מבחוץ',
 tTitle:'{n} שאלות בשבילך',tTitle1:'שאלה אחת בשבילך',tTitle0:'הכול נענה',tWhat:'את/ה והצוות: שאלות, תשובות ועדכונים.',tNeed:'{n} מהצוות. לענות בשורה.',tNeed0:'כלום. כל השאלות נענו.',tGain:'הצוות ממשיך לעבוד בזמן שאת/ה עונה בשורה.',
 asks:'{t} שואל',answerPh:'לענות לצוות',openLink:'לפתוח את הקישור',moreQ:'עוד שאלות',answers:'תשובות להערות שלך',answered:'נענה',tAnswered:'{t} ענה, {h}',
 updates:'עדכונים',msgTeam:'הודעה לצוות',talkHint:'כדי לשאול על פריט אחד, לפתוח אותו וללחוץ הערה.',yourMsg:'ההודעה שלך, {h}',yourNote:'ההערה שלך, {h}',
 sent:'נשלח',withTeam:'אצל הצוות',doneW:'בוצע',comments:'הערות',sentTo:'נשלח ל{t}, {h}. התשובה תגיע לכאן ולשיחה.',answeredBy:'{t} ענה, {h}',
 threadLead:'לשאול שאלה או לבקש שינוי. צוות {t} עונה כאן ובשיחה, בדרך כלל תוך שעה.',sentToT:'נשלח ל{t}. התשובה תגיע לכאן ולשיחה.',
 apNote:'לאשר + הערה',kNote:'לבטל + הערה',writeNote:'קודם לכתוב את ההערה.',
 textSize:'גודל טקסט',std:'רגיל',large:'גדול',xl:'הכי גדול',language:'שפה',help:'עזרה',showTip:'להציג שוב את הטיפ',theme:'ערכת צבע'
}};
function t(k,o){var s=(TX[LANG]&&TX[LANG][k])||TX.en[k]||k;if(o)s=s.replace(/\{(\w+)\}/g,function(_,n){return o[n]!=null?o[n]:'';});return s;}
function th(k,o){var e={};if(o)Object.keys(o).forEach(function(x){e[x]=esc(o[x]);});return t(k,e);} /* t() with every value escaped */
var DOWH=['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];
function dayStr(d){d=d||new Date();return LANG==='he'?'יום '+DOWH[d.getDay()]+' '+d.getDate()+'.'+(d.getMonth()+1):DOW[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()];}
function hm2(ms){var d=new Date(ms);return isNaN(d)?'':String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function whenStr(ms){var d=new Date(ms);if(isNaN(d))return '';var td=ymd(new Date()),tm1=ymd(new Date(Date.now()+864e5)),k=ymd(d);
 if(k===td)return (LANG==='he'?'היום ':'today ')+hm2(ms);if(k===tm1)return (LANG==='he'?'מחר ':'tomorrow ')+hm2(ms);return dayStr(d)+' '+hm2(ms);}

/* ---------- icons, tiles, small parts ---------- */
var TBG={shomer:'#0C1B3A',nature:'#EEF6EE',lickpick:'#15111F',th:'#0A0A2E',chore:'#F6F1FF',milo:'#CFE3EA',media:'#F4F7FB',j8nix:'#586475',studio:'#F3EAFE'};
function tile(pid,cls){var b=pid&&PBADGE[pid];cls='tile'+(cls?' '+cls:'');
 if(b)return '<span class="'+cls+'" style="background:'+TBG[b]+'"><img src="brand/'+b+'.png" alt="" width="64" height="64" loading="lazy" decoding="async"></span>';
 var c=pcolRaw(pid);if(!c||pid==='p-general')return '<span class="'+cls+' plain">'+ic('studio')+'</span>';
 return '<span class="'+cls+'" style="background:'+c[0]+';color:'+(lum(c[0])<.3?'#fff':'#0D1C2B')+'">'+ic('studio')+'</span>';}
function g8(){return '<svg class="g8" aria-hidden="true"><use href="#eight"/></svg>';}
function chip(cls,icon,txt){return '<span class="chip'+(cls?' '+cls:'')+'">'+ic(icon)+'<span>'+txt+'</span></span>';}
function prog(a,b,label){var pc=b?Math.round(100*a/b):0;return '<div class="prog" role="img" aria-label="'+esc(label)+'"><span class="bar"><i style="width:'+Math.max(pc,3)+'%"></i></span><bdi>'+esc(label).replace(/^(\d+)/,'<b>$1</b>')+'</bdi></div>';}
function crumbs(L){return '<nav class="crumbs" aria-label="'+esc(t('youAreIn'))+'">'+L.map(function(x){return '<button data-a="crumb" data-id="'+esc(x[0])+'">'+esc(x[1])+'</button>'+ic('fwd','flip sep');}).join('')+'</nav>';}
function brief(o){return '<section class="brief" aria-labelledby="pageH">'+(o.crumbs||'')+'<h2 id="pageH" tabindex="-1" dir="auto">'+o.title+'</h2>'+(o.what?'<p class="what" dir="auto">'+o.what+'</p>':'')
 +'<div class="bl need">'+ic('you')+'<p><b>'+t('needs')+':</b> <bdi>'+o.need+'</bdi></p></div><div class="bl gain">'+ic('key')+'<p><b>'+t('gets')+':</b> <bdi>'+o.gain+'</bdi></p></div>'+(o.prog||'')+'</section>';}
function stateBox(k,icon,h,p,btn,act){return '<section class="state"><div class="big st-'+k+'">'+ic(icon)+'</div><h2>'+esc(h)+'</h2><p>'+esc(p)+'</p>'+(btn?'<button class="btn go" data-a="'+act+'">'+esc(btn)+'</button>':'')+'</section>';}
function k1(n){return '<b class="k">'+n+'</b>';}
function stepsTxt(n){return n===1?t('oneStep'):t('nSteps',{n:n});}
function thingsTxt(n){return n===1?t('oneThing'):t('nThings',{n:n});}
function sumMins(L){return L.reduce(function(s,i){return s+(isNum(i.mins)?i.mins:0);},0);}
function deptName(u){return u?u.name:t('other');}
function pDept(pid){var u=unitOf(pobj(pid));return u?u.name:t('team');}
function stg(s){return FSTG[s-1]||'';}

/* ---------- state ---------- */
var UI={v:'today',dept:null,proj:null,batch:null,dids:[],stack:[],doing:{},open:{},ask:null,editing:false,doneOpen:false,gsheet:null,syncedAt:null};
var LATER={};
var PLACE={today:'today',studio:'studio',dept:'studio',proj:'studio',draft:'studio',flow:'flow',talk:'talk'};
function rowByKey(k){return rows().filter(function(x){return x.key===k;})[0]||null;}
function fpOf(i){if(!i)return null;if(i.p&&i.move)return cut(youRaw(i.p),300);if(i.held)return i.title;return null;}
function kindOf(i){return !i?'item':i.task?'task':i.batch?'batch':i.ap?'draft':i.held?'held':i.c?'ask':i.p?'move':'item';}
function deferOf(i){var r=LATER[i.key];if(!r||r.status==='open')return null;if(r.fp&&fpOf(i)!==r.fp)return null;if(r.status==='not_needed')return r;var u=pd(r.come_back_at);return isNaN(u)||u>Date.now()?r:null;}
function deferItem(k,st,until,i){i=i||rowByKey(k);var patch={status:st,come_back_at:until?new Date(until).toISOString():null,item_ids:(i&&i.ids||[]).slice(0,60),kind:kindOf(i),title:i?cut(cap1((nextOf(i)||{}).what||i.title),200):null,fp:fpOf(i)};
 if(!J8.later)return Promise.reject({code:'unavailable'});return J8.later.set(k,patch);}
function teamOf(i){var pid=rowPid(i);return pid?pDept(pid):t('team');}

/* ---------- Today: the queue (needs) minus what Dave put off ---------- */
function myQueue(){return needs().filter(function(i){return !deferOf(i);});}
function plannedRows(){var now=Date.now();return Object.keys(LATER).map(function(k){var r=Object.assign({id:k},LATER[k]);return r;}).filter(function(r){var u=pd(r.come_back_at);if(r.status!=='later'||!(u>now))return false;var i=rowByKey(r.id);return !i||!r.fp||fpOf(i)===r.fp;}).sort(function(a,b){return pd(a.come_back_at)-pd(b.come_back_at);});}
function isToday(ms){return !isNaN(ms)&&ymd(new Date(ms))===ymd(new Date());}
/* Done today: tasks done today, drafts decided today (grouped by batch), and Later rows marked done / not needed today */
function doneToday(){var me=(J8.status().user||{}).id,D=[];
 tasksAll().forEach(function(x){
  if(x.status==='done'&&x.owner==='dave'&&isToday(pd(x.done_at)))D.push({k:'tk-'+x.id,type:'task',id:x.id,title:x.title,pid:x.project_id,word:t('doneW'),at:pd(x.done_at),freed:x.unlocked_on_done});});
 var by={};J8.approvals.list().forEach(function(a){if(a.kind==='template'||!a.status||a.status==='pending'||a.status==='queued')return;var at=pd(a.decided_at);if(!isToday(at)||(me&&a.decided_by&&a.decided_by!==me))return;
  var b=a.batch||'other',g=by[b]=by[b]||{k:'dr-'+b,type:'drafts',ids:[],ok:0,kill:0,sent:0,title:a.batch_label||(LANG==='he'?'טיוטות':'Drafts'),pid:a.product,at:0};g.ids.push(a.id);if(a.status==='killed')g.kill++;else g.ok++;if(a.status==='sent')g.sent++;if(at>g.at)g.at=at;if(g.pid!==a.product)g.pid=null;});
 Object.keys(by).forEach(function(b){var g=by[b];g.word=(g.ok?g.ok+' '+(LANG==='he'?'אושרו':'approved'):'')+(g.ok&&g.kill?', ':'')+(g.kill?g.kill+' '+(LANG==='he'?'בוטלו':'killed'):'');D.push(g);});
 Object.keys(LATER).forEach(function(k){var r=LATER[k];if((r.status!=='done'&&r.status!=='not_needed')||r.kind==='batch')return;var at=pd(r.updated_at||r.at);if(!isToday(at))return;
  var i=rowByKey(k);D.push({k:'lt-'+k,type:'later',id:k,title:r.title||(i&&i.title)||k,pid:i?rowPid(i):null,word:r.status==='done'?t('doneW'):t('notNeeded'),at:at});});
 return D.sort(function(a,b){return b.at-a.at;});}

/* ---------- the action bar (same 4 actions, same order, everywhere) ---------- */
function selfJ8(u){var m=String(u||'').match(/^https?:\/\/(?:www\.)?3shamrocks(?:studio\.github\.io|\.com)\/j8\/?(?:#(.*))?$/);return m?(m[1]||'today'):null;}
function doTarget(i){var u=i.task?i.task.link:i.p?(i.p.you_link||''):'';
 if(i.batch){var n=i.batch.items.length;return {draft:i.batch.id,icon:'mail',label:n===1?t('readOne'):t('readN',{n:n+' '+nounOf(i.batch.items)})};}
 if(i.ap)return {draft:'ap:'+i.ap.id,icon:'mail',label:t('readOne')};
 if(i.c)return {talk:1,icon:'comment',label:t('answerTeam')};
 if(u&&u.charAt(0)==='#')return {jump:u.slice(1),icon:'do',label:i.task&&i.task.link_text||t('openIt')};
 var sj=selfJ8(u);if(sj)return {jump:sj,icon:'do',label:i.task&&i.task.link_text||(i.p&&i.p.you_link_text)||t('openIt')};
 if(/^https?:\/\//.test(u))return {href:u,icon:'do',label:(i.task?i.task.link_text:(i.p&&i.p.you_link_text))||t('openIt')};
 return {done:1};}
function dwOf(tk){var x=tk&&(tk.done_when||(tk.extra&&tk.extra.done_when));return x&&x.control?x.control:null;}
function dwName(k){return k==='email_from_ok'?(LANG==='he'?'שליחת מייל':'Email sending'):k==='brain_enabled'?(LANG==='he'?'תשובות AI חיות':'Live AI answers'):k;}
function abar(i){var k=esc(i.key),dw=dwOf(i.task);
 if(UI.doing[i.key])return '<div class="abar two" role="group" aria-label="'+esc(t('actions'))+'">'+(dw?'<p class="held">'+ic('lock')+'<span>'+th('afterSwitch',{s:dwName(dw)})+'</span></p>':'<button class="do" data-a="done" data-k="'+k+'">'+ic('check')+'<span>'+t('markDone')+'</span></button>')+'<button data-a="notyet" data-k="'+k+'">'+ic('back','flip')+'<span>'+t('notYet')+'</span></button></div>';
 var g=doTarget(i),lab=g.done?t('markDone'):t('do')+': '+esc(g.label),inner=ic(g.done?'check':g.icon,g.done?'':'flip')+'<span dir="auto">'+lab+'</span>';
 var prim=g.href?'<a class="do" href="'+esc(g.href)+'" target="_blank" rel="noopener" data-a="do" data-k="'+k+'">'+inner+'</a>':'<button class="do" data-a="'+(g.done?'done':'do')+'" data-k="'+k+'">'+inner+'</button>';
 return '<div class="abar" role="group" aria-label="'+esc(t('actions'))+'">'+prim+'<button class="cm" data-a="comment" data-k="'+k+'">'+ic('comment')+'<span>'+t('comment')+'</span></button><button data-a="later" data-k="'+k+'">'+ic('later')+'<span>'+t('later')+'</span></button><button data-a="no" data-k="'+k+'">'+ic('no')+'<span>'+t('notNeeded')+'</span></button></div>';}
function urgChip(i){if(i.wo&&i.wo.length)return chip('',"lock",t('wTask'));if(i.sev==='r')return chip('now','now',t('wNow'));if(i.sev==='o'||i.sev==null)return chip('you','today',t('wToday'));return chip('','cal',t('wWeek'));}
function minsChip(i){return isNum(i.mins)?chip('plain','time',t('min',{n:i.mins})):'';}
function whyLine(i){var w=mentor(i);return w?'<p class="why">'+ic('key')+'<span dir="auto">'+esc(w)+'</span></p>':'';}
function whereOf(i){var g=doTarget(i);if(g.draft||g.done&&(i.held||i.batch))return t('hereJ8');if(g.talk)return t('whereTalk');if(g.jump==='control')return t('whereCtl');if(g.jump)return t('hereJ8');
 if(g.href){var h='';try{h=new URL(g.href).hostname.replace(/^www\./,'');}catch(e){}return g.label+(h?' ('+h+')':'');}return '';}
function howOf(i){if(i.task)return String(i.task.action||'');if(i.batch)return t('howBatch');if(i.held)return i.held.why+': '+i.held.items.map(apWho).join(', ');if(i.c)return askLine(i.c);if(i.p)return sevStrip(String(i.full||'').trim());if(i.ap)return i.ap.warn||'';return '';}
function facts(i){var w=whereOf(i),h=howOf(i),dw=dwOf(i.task),a=dw?th('afterSwitch',{s:dwName(dw)}):(doTarget(i).href?t('afterOut'):'');
 if(!w&&!h)return '';return '<dl class="facts">'+(w?'<div class="fact"><dt>'+t('where')+'</dt><dd dir="auto">'+esc(w)+'</dd></div>':'')+(h&&h!==cap1(nextOf(i).what)?'<div class="fact"><dt>'+t('how')+'</dt><dd dir="auto">'+esc(h)+'</dd></div>':'')+(a?'<div class="fact"><dt>'+t('after')+'</dt><dd>'+a+'</dd></div>':'')+'</dl>';}
function itemBody(i){return whyLine(i)+'<div class="chips">'+urgChip(i)+minsChip(i)+(i.ul.length?chip('gain','key',(LANG==='he'?'משחרר ':'Frees ')+i.ul.length):'')+'</div>'+facts(i)+abar(i);}
function goldCard(i){var n=nextOf(i),pid=rowPid(i),p=pobj(pid);
 return '<section class="first" aria-labelledby="fH"><div class="in"><span class="ftag">'+g8()+t('first')+'</span><h3 id="fH" dir="auto">'+esc(cap1(n.what))+'</h3>'+whyLine(i)
  +'<div class="chips">'+urgChip(i)+minsChip(i)+(pid?'<span class="chip plain">'+tile(pid,'sm')+'<bdi>'+esc(p?p.name:pname(pid))+'</bdi></span>':'')+'</div>'+facts(i)+abar(i)+'</div></section>';}
function rowItem(i){var o=UI.open[i.key],n=nextOf(i),pid=rowPid(i),p=pobj(pid);
 return '<div class="row'+(o?' open':'')+'" id="r-'+esc(i.key)+'"><button class="rbtn" aria-expanded="'+(o?'true':'false')+'" data-a="row" data-k="'+esc(i.key)+'">'+tile(pid)+'<span class="rt"><b dir="auto">'+esc(cap1(n.what))+'</b><span class="sub" dir="auto">'+esc(p?p.name:(i.sub||pname(pid)))+(isNum(i.mins)?', '+t('min',{n:i.mins}):'')+'</span><span class="chips">'+urgChip(i)+(i.ul.length?chip('gain','key',(LANG==='he'?'משחרר ':'Frees ')+i.ul.length):'')+'</span></span>'+ic('down','chev')+'</button>'
  +(o?'<div class="rmore">'+itemBody(i)+'</div>':'')+'</div>';}
function doneBlock(D,isOpen,label,undoable){if(!D.length)return '';
 return '<details class="grp done" data-k="doneOpen"'+(isOpen?' open':'')+'><summary>'+ic('check')+'<span>'+(label||t('doneToday'))+'</span><span class="n">'+D.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+D.map(function(x){
  return '<div class="drow">'+tile(x.pid)+'<span class="rt"><b dir="auto" class="strike">'+esc(x.title)+'</b><span class="sub">'+esc(x.word)+(x.at?', '+hm2(x.at):'')+(x.freed?'. '+(LANG==='he'?'שחרר ':'Freed ')+x.freed:'')+'</span></span>'
   +(undoable===false||(x.type==='drafts'&&x.sent===x.ids.length)?'':'<button class="undo" data-a="undo" data-k="'+esc(x.k)+'">'+ic('undo')+'<span>'+t('undo')+'</span></button>')+'</div>';}).join('')+'</div></details>';}
function plannedBlock(){var L=plannedRows();if(!L.length)return '';
 return '<details class="grp" data-k="plannedOpen"'+(UI.open.plannedOpen?' open':'')+'><summary>'+ic('later')+'<span>'+t('planned')+'</span><span class="n">'+L.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+L.map(function(r){var i=rowByKey(r.id);
  return '<div class="drow">'+tile(i?rowPid(i):null)+'<span class="rt"><b dir="auto">'+esc(r.title||r.id)+'</b><span class="sub">'+esc(t('comesBack',{w:whenStr(pd(r.come_back_at))}))+'</span></span><button class="undo" data-a="later-now" data-k="'+esc(r.id)+'">'+ic('undo')+'<span>'+t('now')+'</span></button></div>';}).join('')+'</div></details>';}
function vToday(){var tt=th('dayTitle',{d:dayStr()});
 if(!connected)return brief({title:tt,what:t('todayWhat'),need:t('loading'),gain:t('loading')})+'<p class="lead" role="status">'+t('loadingDay')+'</p><div class="skel"></div><div class="skel"></div><div class="skel"></div>';
 var N=myQueue(),f=N[0],D=doneToday(),tot=D.length+N.length,h='';
 if(J8.status().error==='offline'){var sa=UI.syncedAt?hm2(UI.syncedAt):'—';h+=stateBox('red','wifi',t('noConn'),t('noConnP',{t:sa}),t('tryAgain'),'retry')+'<p class="lead saved">'+esc(t('savedCopy',{t:sa}))+'</p>';}
 if(!f){var tm=tasksAll().filter(function(x){return x.owner!=='dave'&&(!x.status||x.status==='open');}).length;
  return h+brief({title:tt,what:t('todayWhat'),need:t('nothingNow'),gain:tm?t('teamKeeps',{n:tm}):t('goldGain'),prog:prog(tot,tot,t('nOfDone',{a:tot,b:tot}))})+stateBox('teal','check',t('allClear'),t('allClearP'),t('seeFlow'),'nav-flow')+plannedBlock()+doneBlock(D,true);}
 var m=sumMins(N);
 h+=brief({title:tt,what:t('todayWhat'),need:k1(stepsTxt(N.length))+(m?t('aboutMin',{n:m}):'')+'.',gain:f.ul.length?k1(thingsTxt(f.ul.length))+' '+t('moveAfterGold'):f.money?t('goldMoney'):t('goldGain'),prog:prog(D.length,tot,t('nOfDone',{a:D.length,b:tot}))});
 if(ls('j8-coach')!==0&&J8.status().error!=='offline')h+='<aside class="coach" aria-label="'+esc(t('help'))+'">'+ic('help')+'<p>'+t('coach')+'</p><button class="btn" data-a="coach-off">'+t('gotIt')+'</button></aside>';
 h+=goldCard(f);
 var th3=N.slice(1,4),rest=N.slice(4);
 if(th3.length)h+='<h2 class="sec">'+t('then')+' <span class="n">'+th3.length+'</span></h2><div class="list">'+th3.map(rowItem).join('')+'</div>';
 h+=plannedBlock();
 if(rest.length){h+='<h2 class="sec">'+t('everything')+' <span class="n">'+rest.length+'</span></h2>';var by={},ord=[];
  rest.forEach(function(i){var u=unitOf(pobj(rowPid(i))),k=u?u.id:'_';if(!by[k]){by[k]={u:u,L:[]};ord.push(k);}by[k].L.push(i);});
  unitsSorted().map(function(u){return u.id;}).concat(['_']).forEach(function(k){var g=by[k];if(!g)return;
   h+='<details class="grp" data-k="ee-'+esc(k)+'"'+(UI.open['ee-'+k]?' open':'')+'><summary><span>'+esc(deptName(g.u))+'</span><span class="n you"><bdi>'+t('forYou',{n:g.L.length})+'</bdi></span>'+ic('down','chev')+'</summary><div class="list">'+g.L.map(rowItem).join('')+'</div></details>';});}
 h+=doneBlock(D,UI.open.doneOpen);
 return h;}

/* ---------- Studio · Department · Project ---------- */
function studioUnits(){var P=projList().filter(function(p){return p.id!=='p-general';}),U=unitsSorted().map(function(u){return {u:u,id:u.id,P:P.filter(function(p){return p.unit_id===u.id;})};});
 var orphan=P.filter(function(p){return !U.some(function(g){return g.id===p.unit_id;});});if(orphan.length)U.push({u:null,id:'_',P:orphan});
 var N=myQueue();U.forEach(function(g){g.N=N.filter(function(i){var pid=rowPid(i);return pid&&g.P.some(function(p){return p.id===pid;});});g.far=Math.max.apply(0,[0].concat(g.P.map(stageOf)));g.first=N.length&&g.N.indexOf(N[0])>-1;});
 return U;}
function projNeed(pid){return myQueue().filter(function(i){return rowPid(i)===pid;});}
function vStudio(){var U=studioUnits(),act=U.filter(function(g){return g.P.length;}),empty=U.filter(function(g){return !g.P.length;}),np=0;act.forEach(function(g){np+=g.P.length;});
 act.sort(function(a,b){return b.N.length-a.N.length||(a.u?a.u.sort||0:99)-(b.u?b.u.sort||0:99);});
 var nd=act.filter(function(g){return g.N.length;}),top=nd[0],h='';
 h+=brief({title:th(act.length===1?'sDept1':'sDept',{n:act.length,m:np}),what:t('sWhat'),need:nd.length>1?t('sNeed',{n:k1(nd.length),d:esc(deptName(top.u))}):nd.length===1?th('sNeed1',{d:deptName(top.u)}):t('sNeed0'),gain:t('sGain')});
 if(top)h+='<section class="hero"><span class="ftag">'+g8()+t('startHere')+'</span><h3 dir="auto">'+esc(deptName(top.u))+'</h3><p>'+esc(top.N.length===1?t('steps1'):t('stepsMin',{n:top.N.length,m:sumMins(top.N)}))+(top.first?' '+t('inclFirst'):'')+'</p><button class="btn act wide big" data-a="dept" data-id="'+esc(top.id)+'">'+ic('do','flip')+'<span>'+th('open',{x:deptName(top.u)})+'</span></button></section>';
 h+='<h2 class="sec">'+t('departments')+' <span class="n">'+act.length+'</span></h2><div class="list">'+act.map(function(g){var lead=g.P.slice().sort(function(a,b){return projNeed(b.id).length-projNeed(a.id).length;})[0];
  return '<div class="row"><button class="rbtn" data-a="dept" data-id="'+esc(g.id)+'">'+tile(lead.id)+'<span class="rt"><b dir="auto">'+esc(deptName(g.u))+'</b><span class="sub" dir="auto">'+esc(cut(g.P.map(function(p){return p.name;}).join(', '),120))+'</span><span class="chips">'+(g.N.length?chip('you','you',t('forYou',{n:g.N.length})):chip('','team',t('teamHasIt')))+(g.far?chip('gain','up',t('furthest',{s:stg(g.far)})):'')+'</span></span>'+ic('fwd','chev go flip')+'</button></div>';}).join('')+'</div>';
 if(empty.length)h+='<p class="lead mt">'+esc(t('noProjects',{x:empty.map(function(g){return deptName(g.u);}).join(', ')}))+'</p>';
 return h;}
function track(p){var s=stageOf(p);return '<ol class="track" aria-label="'+esc(s?t('stageOf',{a:s})+', '+stg(s):t('noStage'))+'">'+FSTG.map(function(n,k){return '<li class="'+(k+1<s?'past':k+1===s?'cur':'')+'">'+n+'</li>';}).join('')+'</ol>';}
function whoChip(h){return h==='me'?'<span class="who you">'+ic('you')+t('nextYou')+'</span>':h==='ext'?'<span class="who out">'+ic('out')+t('nextOut')+'</span>':'<span class="who team">'+ic('team')+t('nextTeam')+'</span>';}
function lane(p){var M=mineBy(),w=projNeed(p.id).length,s=stageOf(p);
 return '<button class="lane" data-a="proj" data-id="'+esc(p.id)+'">'+tile(p.id)+'<span class="rt"><b dir="auto">'+esc(p.name)+'</b>'+track(p)+'<span class="sub"><span>'+(s?t('nowStage',{s:'<b class="tk">'+stg(s)+'</b>'}):t('noStage'))+'</span>'+whoChip(holderOf(p,M))+(w?'<span class="who you">'+t('forYou',{n:w})+'</span>':'')+'</span></span>'+ic('fwd','chev go flip')+'</button>';}
function unitById(id){return id==='_'?null:graph().un[id]||null;}
function vDept(){var g=studioUnits().filter(function(x){return x.id===UI.dept;})[0];if(!g)return vStudio();
 var P=g.P.slice().sort(function(a,b){return projNeed(b.id).length-projNeed(a.id).length||stageOf(b)-stageOf(a);});
 return brief({crumbs:crumbs([['studio',t('studio')]]),title:esc(deptName(g.u)),what:P.length===1?t('dWhat1'):t('dWhat',{n:P.length}),need:g.N.length?k1(stepsTxt(g.N.length))+(sumMins(g.N)?t('aboutMin',{n:sumMins(g.N)}):'')+'.':t('sNeed0'),gain:t('dGain')})
  +'<div class="list mt">'+P.map(lane).join('')+'</div>';}
function nextGoal(p){var n=String(p.next||'').trim(),m=n.match(/^(Concept|Build|Staged|Validate|Monetize|Paying)\s*:\s*(.+)$/i),map={concept:'Idea',build:'Build',staged:'Beta',validate:'Validate',monetize:'Launch',paying:'Paying'};
 if(m)return {s:map[m[1].toLowerCase()],x:m[2].replace(/\.$/,'')};var s=stageOf(p);return n?{s:stg(Math.min(6,s+1))||stg(1),x:n.replace(/\.$/,'')}:null;}
function teamRow(tk){var bl=openBlk(tk.id),u=DEPT[tk.owner]||tk.owner||t('team');
 return '<div class="row"><button class="rbtn" data-a="thread-task" data-id="'+esc(tk.id)+'"><span class="tile ppl">'+ic('team')+'</span><span class="rt"><b dir="auto">'+esc(tk.title)+'</b><span class="sub" dir="auto">'+esc(u)+(bl.length?', '+t('waitsOn',{x:itemNames(bl,2)}):tk.due?', '+t('ready',{d:dlabel(tk.due)}):'')+'</span></span>'+ic('comment','chev ppl')+'</button></div>';}
function pcount(p){var T=tasksAll().filter(function(x){return x.project_id===p.id;}),A=J8.approvals.list().filter(function(a){return a.product===p.id&&a.status!=='killed'&&a.kind!=='template';}),tot=T.length+A.length,dn=T.filter(function(x){return x.status==='done';}).length+A.filter(function(a){return a.status==='sent';}).length;
 return tot?'<p class="pcount"><bdi><b>'+dn+'</b> '+(LANG==='he'?'מתוך '+tot+' צעדים בוצעו':'of '+tot+' steps done')+'</bdi></p>':'';}
function vProj(){var p=pobj(UI.proj);if(!p)return vStudio();var u=unitOf(p),s=stageOf(p),mine=projNeed(p.id),y=mine[0],ng=nextGoal(p),h='';
 var cr=crumbs([['studio',t('studio')],['dept:'+(u?u.id:'_'),deptName(u)]]);
 h+=brief({crumbs:cr,title:esc(p.name),what:(s?t('pWhat',{s:'<b class="tk">'+stg(s)+'</b>',a:s}):t('noStage'))+(p.now?' <span class="pnow">'+esc(cut(sevStrip(p.now),160))+'</span>':''),
  need:y?esc(cap1(nextOf(y).what))+(isNum(y.mins)?', '+t('min',{n:y.mins}):'')+'.':t('pNeed0'),gain:ng?t('pGain',{s:'<b class="k">'+esc(ng.s)+'</b>',x:esc(cut(ng.x,120))})+(/[.!?]$/.test(ng.x)?'':'.'):t('pGainP'),prog:'<div class="trackwrap">'+track(p)+pcount(p)+'</div>'});
 if(y){h+='<section class="hero" aria-labelledby="yH"><span class="ftag">'+g8()+t('yourNext')+'</span><h3 id="yH" dir="auto">'+esc(cap1(nextOf(y).what))+'</h3>'+itemBody(y)+'</section>';
  if(mine.length>1)h+='<h2 class="sec">'+t('alsoYours')+' <span class="n">'+(mine.length-1)+'</span></h2><div class="list">'+mine.slice(1).map(rowItem).join('')+'</div>';}
 var team=tasksAll().filter(function(x){return x.project_id===p.id&&x.owner!=='dave'&&(!x.status||x.status==='open');});
 if(team.length)h+='<h2 class="sec">'+t('teamOn')+' <span class="n">'+team.length+'</span></h2><div class="list">'+team.map(teamRow).join('')+'</div>';
 var hold=J8.approvals.list().filter(function(a){return a.product===p.id&&a.kind!=='template'&&(a.status==='approved'||a.status==='edited'||a.status==='queued');});
 if(hold.length)h+='<details class="grp" data-k="hold-'+esc(p.id)+'"'+(UI.open['hold-'+p.id]?' open':'')+'><summary>'+ic('lock')+'<span>'+t('approvedWait')+'</span><span class="n">'+hold.length+'</span>'+ic('down','chev')+'</summary><ul class="names">'+hold.map(function(a){return '<li dir="auto">'+esc(apKind(a)+': '+apWho(a))+'</li>';}).join('')+'</ul></details>';
 var D=tasksAll().filter(function(x){return x.project_id===p.id&&x.status==='done';}).sort(function(a,b){return String(b.done_at||'').localeCompare(String(a.done_at||''));});
 if(D.length)h+='<details class="grp done" data-k="pd-'+esc(p.id)+'"'+(UI.open['pd-'+p.id]?' open':'')+'><summary>'+ic('check')+'<span>'+t('doneHere2')+'</span><span class="n">'+D.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+D.map(function(x){
  return '<div class="drow"><button class="dlink" data-a="thread-task" data-id="'+esc(x.id)+'"><b dir="auto" class="strike">'+esc(x.title)+'</b><span class="sub">'+t('doneW')+(x.done_at?', '+esc(fdate(x.done_at)):'')+(x.unlocked_on_done?'. '+(LANG==='he'?'שחרר ':'Freed ')+x.unlocked_on_done:'')+'</span></button>'+(x.owner==='dave'?'<button class="undo" data-a="untick" data-id="'+esc(x.id)+'">'+ic('undo')+'<span>'+t('undo')+'</span></button>':'')+'</div>';}).join('')+'</div></details>';
 var lk=(p.link?'<a class="btn go" href="'+esc(p.link)+'" target="_blank" rel="noopener">'+ic('link')+'<span dir="auto">'+esc(p.link_text||(LANG==='he'?'לפתוח את הפרויקט':'Open the project'))+'</span></a>':'');
 if(lk)h+='<div class="links">'+lk+'</div>';
 var pm1=J8.inbox.forProject(p.id).filter(function(x){return !x.task_id&&!x.approval_id;})[0],last=pm1?lastTeamLine(pm1):null;
 h+='<h2 class="sec" id="pcH">'+th('commentOn',{x:p.name})+'</h2><p class="lead">'+th('commentLead',{t:deptName(u)})+'</p>'
  +'<form class="cbox" data-ans="'+esc(p.id)+'"><label class="sr" for="pc-'+esc(p.id)+'">'+t('yourComment')+'</label><textarea id="pc-'+esc(p.id)+'" rows="1" dir="auto" placeholder="'+esc(t('writeC'))+'"></textarea><button class="btn" type="submit">'+ic('send','flip')+'<span>'+t('send')+'</span></button></form>'
  +(last?'<button class="lastline" data-a="thread-proj" data-id="'+esc(p.id)+'">'+sevChip(last.v)+'<span dir="auto">'+esc(last.x)+'</span></button>':'');
 return h;}

/* ---------- Draft: read, decide, move on ---------- */
function openDraft(bid){var L=bid.indexOf('ap:')===0?[bid.slice(3)]:apPending().filter(function(a){return (a.batch||'other')===bid;}).map(function(a){return a.id;});
 if(!L.length){toast(t('allClearT'));return;}UI.batch=bid;UI.dids=L;UI.editing=false;goV('draft');}
function isPend(id){var a=AP[id];return !!a&&(!a.status||a.status==='pending');}
function vDraft(){var L=UI.dids||[],cur=L.filter(isPend)[0],a=cur?Object.assign({id:cur},AP[cur]):null,first=AP[L[0]]||{},pid=first.product,p=pobj(pid),u=unitOf(p);
 var cr=[['studio',t('studio')]];if(u||p)cr.push(['dept:'+(u?u.id:'_'),deptName(u)]);if(p)cr.push(['proj:'+p.id,p.name]);cr=crumbs(cr);
 var dec=L.filter(function(id){return !isPend(id);}).length,ctl=J8.control.get()||{},off=!ctl.email_from_ok;
 if(!a){var ok=L.filter(function(id){var s=(AP[id]||{}).status;return s==='approved'||s==='edited'||s==='sent'||s==='queued';}).length,kl=L.filter(function(id){return (AP[id]||{}).status==='killed';}).length,nx=myQueue()[0];
  return brief({crumbs:cr,title:th('allDecided',{n:L.length}),what:esc(first.batch_label||(p?p.name:'')),need:t('adNeed'),gain:th('adGain',{a:ok,k:kl}),prog:prog(L.length,L.length,t('allDecided',{n:L.length}))})
   +(nx?'<section class="hero"><span class="ftag">'+g8()+t('nextForYou')+'</span><h3 dir="auto">'+esc(cap1(nextOf(nx).what))+'</h3>'+whyLine(nx)+'<button class="btn act wide big" data-a="nav" data-id="today">'+ic('do','flip')+'<span>'+t('goToday')+'</span></button></section>':'');}
 var k=L.indexOf(cur)+1,txt=J8.approvals.textOf(a),bl=openBlk(a.id),isMail=/mail/i.test(String(a.kind||'')+' '+String(a.channel||''));
 var h=brief({crumbs:cr,title:th('draftN',{k:apKind(a),i:k,n:L.length}),what:th('draftWhat',{x:apWho(a)}),need:t('draftNeed'),gain:isMail&&off?t('draftGainOff'):t('draftGain'),prog:prog(dec,L.length,(LANG==='he'?dec+' מתוך '+L.length+' הוחלטו':dec+' of '+L.length+' decided'))});
 if(isMail&&off)h+='<p class="held">'+ic('lock')+'<span>'+t('emailOff')+'</span></p>';
 if(bl.length)h+='<p class="held">'+ic('lock')+'<span dir="auto">'+th('waitsBlock',{x:itemNames(bl,2)})+'</span></p>';
 h+='<dl class="dmeta"><div><dt>'+t('to')+'</dt><dd dir="auto">'+esc(a.to||'—')+'</dd></div>'+(a.channel?'<div><dt>'+t('channel')+'</dt><dd dir="auto">'+esc(a.channel)+'</dd></div>':'')+(p?'<div><dt>'+t('project')+'</dt><dd dir="auto">'+esc(p.name)+'</dd></div>':'')+'</dl>';
 if(a.warn)h+='<p class="note"><b>'+t('teamNote')+':</b> <span dir="auto">'+esc(a.warn)+'</span></p>';
 if(UI.editing)return h+'<form class="edit" data-f="edit"><label class="sr" for="ed-'+esc(a.id)+'">'+t('edit')+'</label><textarea id="ed-'+esc(a.id)+'" dir="auto">'+esc(txt)+'</textarea><div class="abar two"><button class="do" type="submit">'+ic('check')+'<span>'+t('save')+'</span></button><button type="button" data-a="edit-cancel">'+ic('back','flip')+'<span>'+t('cancel')+'</span></button></div></form>';
 h+='<article class="letter" dir="auto">'+(a.subject?'<h3>'+esc(a.subject)+'</h3>':'')+esc(txt)+'</article>'+(a.link?'<p class="mt"><a class="btn go" href="'+esc(a.link)+'" target="_blank" rel="noopener">'+ic('link')+'<span dir="auto">'+esc(a.link_text||t('openLink'))+'</span></a></p>':'');
 var x=J8.inbox.forApproval(a.id)[0],lt=x?lastTeamLine(x):null;if(lt)h+='<button class="lastline" data-a="thread-ap" data-id="'+esc(a.id)+'">'+sevChip(lt.v)+'<span dir="auto">'+esc(lt.x)+'</span></button>';
 h+='<div class="sticky"><div class="abar" role="group" aria-label="'+esc(t('emailActions'))+'"><button class="do" data-a="dsend" data-id="'+esc(a.id)+'">'+ic('send','flip')+'<span>'+t('send')+'</span></button><button data-a="dedit">'+ic('edit')+'<span>'+t('edit')+'</span></button><button class="cm" data-a="thread-ap" data-id="'+esc(a.id)+'">'+ic('comment')+'<span>'+t('comment')+'</span></button><button class="kill" data-a="dkill" data-id="'+esc(a.id)+'">'+ic('kill')+'<span>'+t('kill')+'</span></button></div></div>';
 return h;}
function draftDecide(id,how,noted){var L=UI.dids||[],rest=L.filter(function(x){return x!==id&&isPend(x);}),nxt=rest[0],k=L.indexOf(nxt)+1,a=AP[id]||{},kind=apKind(a);
 var p=how==='send'?J8.approvals.approve(id):J8.approvals.kill(id);
 p.then(function(){var m=noted?(how==='send'?'Approved. Held until the team applies your note.':'Killed. Nothing goes out; the team reads your note.'):how==='send'?(nxt?t('approvedNext',{x:kind+' '+k}):t('approvedLast')):(nxt?t('killedNext',{x:kind+' '+k}):t('killedLast'));
   toast(m,function(){J8.approvals.undo(id).then(function(){toast(t('backWaiting'));},function(e){toast(t('couldNot',{e:e&&e.code||'error'}));});});},
  function(e){toast(e&&e.code==='conflict'?(LANG==='he'?'משהו השתנה בינתיים. לנסות שוב.':'It changed meanwhile. Try again.'):t('couldNot',{e:e&&e.code||'error'}));});
 render(true);}
/* outside the draft screen (thread sheet): the 6.1 decide() with its toasts */
function decide(id,how,noted){var p=how==='send'?J8.approvals.approve(id):J8.approvals.kill(id);
 p.then(function(){toast(how==='send'?(noted?'Approved. Held until the team applies your note.':'Approved. It goes out on the team’s next run.'):(noted?'Killed. Nothing goes out; the team reads your note.':'Killed. Nothing goes out.'),function(){J8.approvals.undo(id).then(function(){toast(t('backWaiting'));});});},
  function(e){toast(t('couldNot',{e:e&&e.code||'error'}));});}

/* ---------- Flow: one scroll ---------- */
var FSTG=['Idea','Build','Beta','Validate','Launch','Paying'],CD='collecting data',DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var FF={u:'all',o:'all',b:false},RANK=null,RANKT=0; /* 7.1: Flow has no filters; the 6.1 helpers read these as "everything" */
function teamStatus(name,r,s){var st=r?r.status:null,on=!s||(s.enabled!==false&&s.want_enabled!==false);
 if(!on)return ['off','later',t('off')];if(st==='failed')return ['now','stuck',t('problem')];if(st==='running'||st==='started')return ['talk','flow',t('working')];if(st==='ok')return ['done','check',t('on')];return ['','lock',t('waiting')];}
function teamRows(){var S=J8.schedule&&J8.schedule.list?J8.schedule.list():[],R=J8.runs.list(),last={},used={},out=[];
 R.forEach(function(r){var k=armKey(r.arm);if(!last[k])last[k]=r;});
 S.forEach(function(s){var k=armKey(s.name);used[k]=1;out.push({k:k,name:s.name,r:last[k],s:s,next:(s.enabled!==false&&s.want_enabled!==false)?ilDT(nextRun(s)):'',when:s.when_text||''});});
 Object.keys(last).forEach(function(k){if(!used[k]&&pd(last[k].ended||last[k].started)>Date.now()-14*864e5)out.push({k:k,name:last[k].arm,r:last[k],s:null,next:'',when:''});});
 return out;}
function teamRowHTML(x){var st=teamStatus(x.name,x.r,x.s),k='tm-'+x.k,o=UI.open[k],sum=x.r?cut(noUrl(sevStrip(String(x.r.summary||''))),90):'';
 return '<div class="row team'+(o?' open':'')+'"><button class="rbtn tm" data-a="row" data-k="'+esc(k)+'" aria-expanded="'+(o?'true':'false')+'"><span class="rt"><b dir="auto">'+esc(x.name)+'</b><span class="chips">'+chip(st[0],st[1],st[2])+(x.next?'<span class="chip plain">'+ic('later')+'<span>'+esc(t('nextRun',{t:x.next}))+'</span></span>':'')+'</span><span class="sub" dir="auto">'+(sum?esc(sum):'<em>'+t('noRun')+'</em>')+'</span></span>'+ic('down','chev')+'</button>'
  +(o?'<div class="rmore">'+(x.r?'<p class="lead">'+esc((LANG==='he'?'ריצה אחרונה: ':'Last run: ')+(x.r.status||'—')+', '+ago(x.r.ended||x.r.started))+'</p><p dir="auto">'+linkTxt(sevStrip(String(x.r.summary||'')))+'</p>':'')+(x.when?'<p class="lead">'+esc((LANG==='he'?'רץ: ':'Runs: ')+x.when)+(x.s&&x.s.locked?(LANG==='he'?' (תמיד פעיל)':' (always on)'):'')+'</p>':'')+'</div>':'')+'</div>';}
function vFlow(){if(!connected)return brief({title:t('fTitleNo'),what:t('fWhat'),need:t('loading'),gain:t('loading')})+'<div class="skel"></div><div class="skel"></div>';
 var N=myQueue(),s0=N[0],stuck=s0&&s0.ul.length?s0:null,m=J8.money.summary()||{},d1=J8.money.daysTo(m.m1_date),h='';
 h+=brief({title:d1!=null?th('fTitle',{n:Math.max(0,d1)}):t('fTitleNo'),what:t('fWhat'),need:stuck?t('fNeed',{n:k1(stuck.ul.length)}):t('fNeed0'),gain:t('fGain')});
 if(stuck)h+='<section class="hero"><span class="ftag">'+ic('stuck')+t('stuck')+'</span><h3 dir="auto">'+esc(cap1(nextOf(stuck).what))+'</h3><p>'+esc(t('stuckP',{n:stuck.ul.length}))+(isNum(stuck.mins)?' '+esc(t('takesMin',{n:stuck.mins})):'')+'</p><button class="btn act wide big" data-a="nav" data-id="today">'+ic('do','flip')+'<span>'+t('doItNow')+'</span></button></section>';
 var b=isNum(m.booked_usd)?m.booked_usd:null,goal=m.m1_usd||25000,mp=projList().filter(function(p){return p.id!=='p-general'&&p.status!=='parked'&&!isDoneP(p)&&moneyP(p)&&isNum(p.stage);}).sort(function(x,y){return y.stage-x.stage;})[0];
 h+='<section class="q"><span class="qi">'+ic('money')+'</span><div><h3>'+t('money')+'</h3><p class="ans">'+(b!=null?esc(t('booked',{a:usd(b),b:usd(goal)})):esc(t('bookedNo')))+'</p>'+(b!=null?'<div class="meter" aria-hidden="true"><i style="width:'+Math.max(2,Math.min(100,b/goal*100))+'%"></i></div>':'')
  +'<p>'+(m.m1_date?esc(t('m1due',{d:dlabel(m.m1_date)}))+' ':'')+(mp?esc(t('closest',{p:mp.name+' ('+stg(mp.stage)+')'})):'')+'</p>'+(mp?'<button class="btn go" data-a="proj" data-id="'+esc(mp.id)+'">'+ic('studio')+'<span>'+th('open',{x:mp.name})+'</span></button>':'')+'</div></section>';
 var now=Date.now(),W=7*864e5,a=weekCounts(now-W,now),lw=weekCounts(now-2*W,now-W),f0=firstNum(J8.runs.list().map(function(r){return pd(r.started||r.ended);}).filter(function(v){return !isNaN(v);})),lastOk=f0<=now-2*W;
 h+='<section class="q"><span class="qi">'+ic('up')+'</span><div><h3>'+t('thisWeek')+'</h3><p class="ans">'+esc(t('clearedYou',{n:a.dave}))+'</p><p>'+esc(t('weekP',{r:a.runs,s:a.sent,l:lastOk?lw.dave+' / '+lw.runs+' / '+lw.sent:CD}))+'</p></div></section>';
 var A=projList().filter(function(p){return p.id!=='p-general';}),P=A.filter(function(p){return !isDoneP(p);}).sort(function(x,y){return (x.status==='parked'?1:0)-(y.status==='parked'?1:0)||stageOf(y)-stageOf(x);}),D=A.filter(isDoneP);
 h+='<h2 class="sec">'+t('everyProject')+' <span class="n">'+P.length+'</span></h2><p class="lead">'+t('everyLead')+'</p><div class="list mt">'+P.map(lane).join('')+'</div>';
 if(D.length)h+='<details class="grp mapdone" data-k="mapdone"'+(UI.open.mapdone?' open':'')+'><summary>'+ic('check')+'<span>'+t('doneProjects')+'</span><span class="n">'+D.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+D.map(lane).join('')+'</div></details>';
 var td=ymd(new Date()),lim=ymd(new Date(now+14*864e5)),E=events(),up=E.filter(function(e){return e.day>=td&&e.day<=lim;}).sort(function(x,y){return (x.day+(x.time||'99')).localeCompare(y.day+(y.time||'99'));}),over=E.filter(function(e){return e.day<td;});
 var ag=function(e,past){return '<button class="ag" data-a="jump" data-id="'+esc(e.jump||'')+'"><time>'+esc(past?dlabel(e.day).replace(/^\w+ /,''):dlabel(e.day+(e.time?'T'+e.time:'')).replace(/ \d\d:\d\d$/,'')+(e.time?' '+e.time:''))+'</time><span class="rt"><b dir="auto">'+esc(cut(e.title,80))+'</b><span class="sub">'+whoChip(e.who==='me'?'me':e.who==='ext'?'ext':'team')+'<span dir="auto">'+esc(cut(e.sub||'',60))+'</span></span></span></button>';};
 h+='<h2 class="sec">'+t('comingUp')+(up.length?' <span class="n">'+up.length+'</span>':'')+'</h2>'+(up.length?'<div class="list">'+up.slice(0,10).map(function(e){return ag(e);}).join('')+'</div>':'<p class="lead">'+t('nothingDated')+'</p>');
 if(over.length)h+='<details class="grp" data-k="over"'+(UI.open.over?' open':'')+'><summary>'+ic('later')+'<span>'+t('slotPassed')+'</span><span class="n">'+over.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+over.sort(function(x,y){return x.day.localeCompare(y.day);}).slice(0,12).map(function(e){return ag(e,true);}).join('')+'</div></details>';
 var TR=teamRows();if(TR.length)h+='<h2 class="sec">'+t('teamNow')+' <span class="n">'+TR.length+'</span></h2><div class="list">'+TR.map(teamRowHTML).join('')+'</div>';
 h+='<details class="grp nums" data-k="nums"'+(UI.open.nums?' open':'')+'><summary>'+ic('up')+'<span>'+t('numbers')+'</span>'+ic('down','chev')+'</summary><div class="numbody">'+(UI.open.nums?numbersHTML():'')+'</div></details>';
 return h;}
function numbersHTML(){var m=J8.money.summary()||{},b=isNum(m.booked_usd)?m.booked_usd:0,d1=J8.money.daysTo(m.m1_date),Ap=J8.approvals.list(),cnt=function(f){return Ap.filter(f).length;},
  wt=cnt(function(a){return !a.status||a.status==='pending';}),ap=cnt(function(a){return a.status==='approved'||a.status==='edited';}),sn=cnt(function(a){return a.status==='sent';}),kl=cnt(function(a){return a.status==='killed';});
 var h=flowHTML()+'<div class="kpis"><div class="kpi"><span>Booked</span><b>'+usd(b)+'</b><small>of '+usd(m.m1_usd||25000)+' for Milestone 1</small></div>'
  +'<div class="kpi"><span>Days to Milestone 1</span><b>'+(d1!==null?Math.max(0,d1):'—')+'</b><small>'+esc(fdate(m.m1_date||'2026-11-21'))+'</small></div>'
  +'<div class="kpi"><span>Drafts waiting on you</span><b>'+wt+'</b><small>drafts</small></div>'
  +'<div class="kpi"><span>Sent</span><b>'+sn+'</b><small>'+ap+' approved, not out yet</small></div></div>';
 var t0=new Date(START+'T12:00:00').getTime(),t1=new Date(MS[5][1]+'T12:00:00').getTime(),x=function(d){return Math.max(0,Math.min(100,(new Date(d+'T12:00:00').getTime()-t0)/(t1-t0)*100));},tn=Math.max(0,Math.min(100,(Date.now()-t0)/(t1-t0)*100)),nx=MS.filter(function(s){return b<s[2];})[0];
 h+='<section class="st"><h3>Milestones</h3><ol class="msl">'+MS.map(function(s){return '<li class="'+(b>=s[2]?'r':'')+(nx&&nx[0]===s[0]?' nx':'')+'"><b>'+s[0].replace('M','Milestone ')+'</b><span>'+usd(s[2])+' by '+fdate(s[1])+'</span>'+(b>=s[2]?chip('done','check','Reached'):nx&&nx[0]===s[0]?chip('you','today','Next'):'')+'</li>';}).join('')+'</ol></section>';
 var P=projList().filter(function(p){return p.id!=='p-general';}),SC=['#BFE9E3','#8FDCD2','#3FD3BF','#10B5A3','#0C8F81','#00665C'],sg=J8.projects.STAGES.map(function(s,i){return {k:FSTG[i],v:P.filter(function(p){return p.stage===i+1;}).length,c:SC[i]};});
 var ns=P.filter(function(p){return !isNum(p.stage);}).length;if(ns)sg.push({k:'No stage',v:ns,c:'#D9E1EB'});
 h+='<div class="pair"><section class="st"><h3>Projects by stage</h3>'+donut(sg,'Projects by stage')+'</section>'
  +'<section class="st"><h3>Drafts</h3>'+donut([{k:'Waiting',v:wt,c:'#FFA41B',keep:1},{k:'Approved',v:ap,c:'#1257E6',keep:1},{k:'Sent',v:sn,c:'#10B5A3',keep:1},{k:'Killed',v:kl,c:'#D9E1EB',keep:1}],'Drafts by status')+'</section></div>';
 h+='<section class="st"><h3>Activity, last 7 days</h3>'+activity()+'</section>';
 var A=achievements(),on=A.filter(function(a){return a.on;}).length;
 h+='<section class="st"><h3>Achievements <span class="n">'+on+' of '+A.length+'</span></h3><div class="badges">'+A.sort(function(p,q){return (q.on?1:0)-(p.on?1:0);}).map(function(a){
   return '<div class="bdg '+(a.on?'on':'lk')+'">'+ic(a.on?'check':'lock')+'<b>'+esc(a.n)+'</b><span>'+esc(a.on?(a.v||'Unlocked'):a.lock)+'</span></div>';}).join('')+'</div></section>';
 return h+'<p class="lead">Money from your money summary'+(m.updated?' ('+esc(hhmm(m.updated))+')':'')+'. Milestone targets from the studio plan. Everything else counted live from the board.</p>';}

/* ---------- Talk: questions, answers to your comments, updates ---------- */
function askRows(){return myQueue().filter(function(i){return i.c;});}
function teamLines(x){return String(x.reply||'').split('\n').map(function(l){var m=l.match(/^\s*(\d{1,2}:\d\d)(?:\s*\(([^)]{1,20})\))?\s*[—-]\s*([\s\S]*)$/);return m?{t:m[1],x:m[3].trim()}:{t:'',x:l.trim()};}).filter(function(l){return l.x&&!ACK.test(l.x)&&!/^Got it\b/.test(l.x);});}
function lastTeamLine(x){var L=teamLines(x);if(!L.length)return null;var l=L[L.length-1];return {v:sevOf(l.x)||sevLegacy(l.x),x:sevStrip(l.x),t:l.t};}
function firstUrl(s){var m=String(s||'').match(/https?:\/\/[^\s)]+/);return m?m[0].replace(/[.,;:]+$/,''):null;}
function msgTarget(x){return x.task_id?{task:x.task_id}:x.approval_id?{ap:x.approval_id}:x.p&&x.p!=='p-general'?{p:x.p}:{msg:x.id};}
function targetTitle(tg){if(tg.task){var tk=J8.tasks.get(tg.task)||(J8.raw('tasks')||{})[tg.task];return {title:tk?tk.title:tg.task,pid:tk?tk.project_id:null};}
 if(tg.ap){var a=AP[tg.ap]||{};return {title:(a.kind==='template'?'Template':apKind(a))+': '+apWho(Object.assign({id:tg.ap},a)),pid:a.product};}
 if(tg.p)return {title:pname(tg.p),pid:tg.p};var x=CMT[tg.msg]||{};return {title:cut(x.text||'',80),pid:x.p};}
function vTalk(){if(!connected)return brief({title:t('talk'),what:t('tWhat'),need:t('loading'),gain:t('loading')});
 var Q=askRows(),q=Q.filter(function(i){return i.key===UI.ask;})[0]||Q[0],h='';
 h+=brief({title:Q.length>1?th('tTitle',{n:Q.length}):Q.length?t('tTitle1'):t('tTitle0'),what:t('tWhat'),need:Q.length?t('tNeed',{n:k1(Q.length)}):t('tNeed0'),gain:t('tGain')});
 if(q){var x=q.c,u=firstUrl(x.reply),tm=pDept(x.p);
  h+='<section class="hero talkq" aria-labelledby="qH"><span class="ftag ppl">'+ic('team')+th('asks',{t:x.p==='p-general'?t('team'):tm})+'</span><h3 id="qH" dir="auto">'+esc(q.title)+'</h3><p class="sub" dir="auto">'+esc(pname(x.p))+(x.at?', '+esc(tm1(x.at)):'')+'</p>'
   +(askLine(x)!==q.title?'<p dir="auto">'+esc(askLine(x).replace(/https?:\/\/\S+/g,'').trim())+'</p>':'')+(u?'<p class="mt"><a class="btn go" href="'+esc(u)+'" target="_blank" rel="noopener">'+ic('link')+'<span>'+t('openLink')+'</span></a></p>':'')
   +'<form class="cbox ans-hero" data-ans="'+esc(x.p)+'" data-ask="'+esc(q.key)+'"><label class="sr" for="aq">'+t('answerPh')+'</label><textarea id="aq" rows="2" dir="auto" placeholder="'+esc(t('answerPh'))+'"></textarea><button class="btn act" type="submit">'+ic('send','flip')+'<span>'+t('send')+'</span></button></form></section>';
  if(Q.length>1)h+='<h2 class="sec">'+t('moreQ')+' <span class="n">'+(Q.length-1)+'</span></h2><div class="list">'+Q.filter(function(i){return i!==q;}).map(function(i){return '<div class="row"><button class="rbtn" data-a="ask" data-k="'+esc(i.key)+'">'+tile(i.c.p)+'<span class="rt"><b dir="auto">'+esc(i.title)+'</b><span class="sub" dir="auto">'+esc(pname(i.c.p))+'</span></span>'+ic('fwd','chev flip')+'</button></div>';}).join('')+'</div>';}
 var A=J8.inbox.list().filter(function(x){return (x.task_id||x.approval_id||(x.p&&x.p!=='p-general'))&&lastTeamLine(x);}).slice(0,8);
 if(A.length)h+='<h2 class="sec">'+t('answers')+' <span class="n">'+A.length+'</span></h2><div class="list">'+A.map(function(x){var tg=msgTarget(x),tt=targetTitle(tg),l=lastTeamLine(x);
  return '<div class="row"><button class="rbtn" data-a="thread-msg" data-id="'+esc(x.id)+'">'+tile(tt.pid||x.p)+'<span class="rt"><b dir="auto">'+esc(tt.title)+'</b><span class="sub">'+esc(t('tAnswered',{t:pDept(tt.pid||x.p),h:l.t||tm1(x.updated_at)}))+'</span><span class="chips">'+(x.status==='done'?chip('done','check',t('answered')):chip('talk','team',t('withTeam')))+'</span></span>'+ic('fwd','chev flip')+'</button></div>';}).join('')+'</div>';
 h+='<h2 class="sec">'+t('updates')+'</h2><p class="lead">'+esc(sinceLine())+'</p><div class="msgs" id="j8cLog" aria-live="polite">'+talkLog()+'</div>';
 h+='<div class="ch-strip" id="j8cStrip"></div><form class="cbox" id="j8cForm" autocomplete="off"><label class="sr" for="j8cIn">'+t('msgTeam')+'</label><textarea id="j8cIn" rows="1" dir="auto" placeholder="'+esc(t('msgTeam'))+'"></textarea><button class="btn" type="submit" id="j8cGo">'+ic('send','flip')+'<span>'+t('send')+'</span></button></form><p class="lead mt" id="j8cNote"></p><p class="lead">'+t('talkHint')+'</p>';
 return h;}
function tm1(iso){var ms=pd(iso);return isNaN(ms)?'':isToday(ms)?hm2(ms):dayStr(new Date(ms))+' '+hm2(ms);}
var SW={new:'sent',routed:'withTeam',done:'doneW'};
function md(s){var h=esc(s);
 h=h.replace(/\[([^\]\n]{1,120})\]\((#[A-Za-z0-9_\-]+|https?:\/\/[^\s)]+)\)/g,function(_,tx,u){return u.charAt(0)==='#'?'<button type="button" class="lk" data-a="jump" data-id="'+u.slice(1)+'">'+tx+'</button>':'<a class="lk" href="'+u+'" target="_blank" rel="noopener">'+tx+'</a>';});
 h=h.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g,function(_,p,u){return p+'<a class="lk" href="'+u+'" target="_blank" rel="noopener">'+cut(u.replace(/^https?:\/\//,''),40)+'</a>';});
 return h.replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>');}
function bubbles(x,label){var st=SW[x.status]?x.status:'new',who=pDept(x.p),h='<details class="yournote"><summary>'+ic('you')+'<span>'+esc(t(label||'yourMsg',{h:tm1(x.at)}))+'</span><span class="cst">'+t(SW[st])+'</span>'+ic('down','chev')+'</summary><p dir="auto">'+esc(x.text)+'</p></details>';
 teamLines(x).forEach(function(l){var v=sevOf(l.x)||sevLegacy(l.x);h+='<div class="msg'+(v?' lv-'+v:'')+'"><div class="who">'+ic('team')+'<span>'+esc(x.p==='p-general'?t('team'):who)+'</span>'+sevChip(v)+'</div><div dir="auto">'+md(sevStrip(l.x))+'</div>'+(l.t?'<time>'+esc(l.t)+'</time>':'')+'</div>';});
 return h;}
function talkLog(){var L=J8.inbox.list(60).slice().reverse(),h='',day='';
 L.forEach(function(x){var k=ymd(new Date(pd(x.at)));if(k!==day){day=k;h+='<p class="daychip"><span>'+esc(k===ymd(new Date())?t('today'):dayStr(new Date(pd(x.at))))+'</span></p>';}h+='<div class="mgrp">'+(x.p&&x.p!=='p-general'?'<p class="about">'+tile(x.p,'xs')+'<span dir="auto">'+esc(pname(x.p))+'</span></p>':'')+bubbles(x)+'</div>';});
 return h||'<p class="lead">'+(LANG==='he'?'עוד אין הודעות.':'No messages yet.')+'</p>';}

/* ---------- sheets: thread, Later, confirm ---------- */
var lastFocus=null;
function gOpen(html,col){lastFocus=document.activeElement;var s=$('gsheet');s.style.setProperty('--sh',col||'var(--navy)');s.innerHTML='<div class="grab" aria-hidden="true"></div>'+html;s.hidden=false;$('scrim').hidden=false;var f=s.querySelector('h2');if(f){f.tabIndex=-1;f.focus();}}
function gClose(){var s=$('gsheet');if(!s||s.hidden)return;s.hidden=true;UI.gsheet=null;if($('sheet').hidden)$('scrim').hidden=true;if(lastFocus&&document.body.contains(lastFocus))try{lastFocus.focus({preventScroll:true});}catch(e){}}
function threadMsgs(tg){return J8.inbox.list().filter(function(x){return tg.task?x.task_id===tg.task:tg.ap?x.approval_id===tg.ap:tg.p?(x.p===tg.p&&!x.task_id&&!x.approval_id):x.id===tg.msg;}).reverse();}
function threadSheet(tg,sent){UI.gsheet={k:'thread',tg:tg,sent:sent};var tt=targetTitle(tg),pid=tt.pid,team=pid?pDept(pid):t('team'),M=threadMsgs(tg),h='';
 h+='<h2 id="gTitle">'+t('comments')+'</h2><div class="drow plainrow">'+tile(pid)+'<span class="rt"><b dir="auto">'+esc(tt.title)+'</b><span class="sub" dir="auto">'+esc(pid?pname(pid):'')+'</span></span></div><div class="msgs">';
 if(!M.length)h+='<p class="lead">'+th('threadLead',{t:team})+'</p>';
 M.forEach(function(x){h+=bubbles(x,'yourNote');});
 h+='</div>';var last=M[M.length-1],ll=last?lastTeamLine(last):null;
 if(last&&!ll)h+='<p class="status">'+ic('send','flip')+'<span>'+esc(t('sentTo',{t:team,h:tm1(last.at)}))+'</span></p>';else if(ll)h+='<p class="status">'+ic('check')+'<span>'+esc(t('answeredBy',{t:team,h:ll.t||tm1(last.updated_at)}))+'</span></p>';
 var ap=tg.ap?AP[tg.ap]:null,ansP=tg.task?((J8.tasks.get(tg.task)||{}).project_id||'p-general'):tg.ap?(ap&&ap.product||'p-general'):tg.p||((CMT[tg.msg]||{}).p)||'p-general';
 h+='<form class="cbox apn" data-ans="'+esc(ansP)+'"'+(tg.task?' data-task="'+esc(tg.task)+'"':'')+(tg.ap?' data-ap="'+esc(tg.ap)+'"':'')+'><label class="sr" for="gth">'+t('yourComment')+'</label><textarea id="gth" rows="2" dir="auto" placeholder="'+esc(t('writeC'))+'"></textarea><button class="btn" type="submit">'+ic('send','flip')+'<span>'+t('send')+'</span></button></form>';
 if(ap&&(!ap.status||ap.status==='pending')&&ap.kind!=='template')h+='<div class="apn-act"><button class="btn" data-apnd="send" data-id="'+esc(tg.ap)+'">'+ic('check')+'<span>'+t('apNote')+'</span></button><button class="btn killo" data-apnd="kill" data-id="'+esc(tg.ap)+'">'+ic('kill')+'<span>'+t('kNote')+'</span></button></div>';
 h+='<button class="btn wide mt" data-a="gclose">'+t('close')+'</button>';
 var keep=$('gth')&&!$('gsheet').hidden?$('gth').value:'';gOpen(h,'var(--orchid)');if(keep)$('gth').value=keep;}
function laterTimes(){var n=new Date(),a=new Date(n);a.setHours(20,30,0,0);var o=[];
 if(a-n>36e5)o.push(['tonight',a.getTime()]);else o.push(['in3h',n.getTime()+3*36e5]);
 var b=new Date(n);b.setDate(b.getDate()+1);b.setHours(8,30,0,0);o.push(['tomorrow',b.getTime()]);
 var c=new Date(n);c.setDate(c.getDate()+((7-c.getDay())%7||7));c.setHours(8,30,0,0);if(c-b<864e5)c.setDate(c.getDate()+7);o.push(['nextWeek',c.getTime()]);return o;}
function laterSheet(k){var i=rowByKey(k);if(!i)return;UI.gsheet={k:'later'};
 gOpen('<h2 id="gTitle">'+t('laterQ')+'</h2><p class="lead" dir="auto">'+esc(cap1(nextOf(i).what))+'</p>'+laterTimes().map(function(o){return '<button class="opt" data-a="later-pick" data-k="'+esc(k)+'" data-w="'+o[1]+'" data-l="'+o[0]+'">'+ic('later')+'<span>'+t(o[0])+'</span><small>'+esc(whenStr(o[1]))+'</small></button>';}).join('')
  +'<p class="lead mt">'+esc(t('laterNote'))+'</p><button class="btn wide mt" data-a="gclose">'+t('cancel')+'</button>','var(--slate)');}
function confirmBatch(k){var i=rowByKey(k);if(!i||!i.batch)return;var n=i.batch.items.length;UI.gsheet={k:'confirm'};
 gOpen('<h2 id="gTitle">'+esc(t('noBatchQ',{n:n}))+'</h2><p class="lead" dir="auto">'+esc(i.batch.label)+'</p><p class="mt">'+esc(t('noBatchP',{n:n}))+'</p><div class="apn-act"><button class="btn killo" data-a="no-batch" data-k="'+esc(k)+'">'+ic('kill')+'<span>'+esc(t('killAll',{n:n}))+'</span></button><button class="btn" data-a="gclose">'+t('cancel')+'</button></div>','var(--red)');}

/* ---------- actions ---------- */
function nextLine(){return myQueue().length?t('nextTop'):t('allClearT');}
function markDone(k){var i=rowByKey(k);delete UI.doing[k];
 if(i&&i.task){var id=i.task.id,n=(graph().out[id]||[]).filter(function(d){return openBlk(d).filter(function(b){return b!==id;}).length===0;}).length; /* 6.0.1: only items with no other open blocker */
  if(!J8.status().connected){toast(t('notConn'));return;}
  J8.tasks.done(id).then(function(){toast((n===1?t('doneFree1'):n?t('doneFree',{n:n}):t('doneNo'))+' '+nextLine(),function(){J8.tasks.undo(id).then(function(){toast(t('backOnList'));},function(){toast(t('couldNot',{e:'undo'}));});});},
   function(e){toast(e&&e.code==='conflict'?(LANG==='he'?'משהו השתנה בינתיים. לנסות שוב.':'It changed meanwhile. Try again.'):t('couldNot',{e:e&&e.code||'error'}));});render();return;}
 if(!i)return;
 var tell=(i.p||i.held||i.c)&&J8.status().connected,pid=i.p?i.p.id:i.c?i.c.p:i.held?((i.held.items[0]||{}).product||'p-general'):'p-general';
 deferItem(k,'done',Date.now()+24*36e5,i).catch(function(){snooze(k,24);});
 var undo=function(){deferItem(k,'open',null,i).then(function(){toast(t('backOnList'));},function(){toast(t('couldNot',{e:'undo'}));});};
 if(tell)J8.inbox.send(pid,'Done: '+(i.full||i.title)).then(function(){toast(t('doneTold')+' '+nextLine(),undo);},function(){toast(t('doneHere')+' '+nextLine(),undo);});
 else toast(t('doneNo')+' '+nextLine(),undo);render();}
function notNeeded(k){var i=rowByKey(k);if(!i)return;if(i.batch){confirmBatch(k);return;}if(!J8.status().connected){toast(t('notConn'));return;}
 if(i.task){var id=i.task.id;J8.tasks.drop(id).then(function(){deferItem(k,'not_needed',null,i).catch(function(){});toast(t('noT')+' '+nextLine(),function(){J8.tasks.undo(id).then(function(){deferItem(k,'open',null,i).catch(function(){});toast(t('backOnList'));});});},function(e){toast(t('couldNot',{e:e&&e.code||'error'}));});render();return;}
 var pid=i.p?i.p.id:i.c?i.c.p:i.held?((i.held.items[0]||{}).product||'p-general'):i.ap?(i.ap.product||'p-general'):'p-general';
 deferItem(k,'not_needed',null,i).then(function(){J8.inbox.send(pid,'Not needed: '+(i.full||i.title)).catch(function(){});
  toast(t('noT')+' '+nextLine(),function(){deferItem(k,'open',null,i).then(function(){J8.inbox.send(pid,'Still needed after all: '+(i.full||i.title)).catch(function(){});toast(t('backOnList'));});});},function(e){toast(t('couldNot',{e:e&&e.code||'error'}));});render();}
function noBatch(k){var i=rowByKey(k);gClose();if(!i||!i.batch)return;var ids=i.batch.items.map(function(a){return a.id;}),n=ids.length,q=Promise.resolve();
 ids.forEach(function(id){q=q.then(function(){return J8.approvals.kill(id).catch(function(){});});});
 deferItem(k,'not_needed',null,i).catch(function(){});
 q.then(function(){toast(t('killedAll',{n:n})+' '+nextLine(),function(){var r=Promise.resolve();ids.forEach(function(id){r=r.then(function(){return J8.approvals.undo(id).catch(function(){});});});r.then(function(){deferItem(k,'open',null,i).catch(function(){});toast(t('backOnList'));});});});render();}
function laterPick(k,w,l){gClose();var i=rowByKey(k);if(!i)return;
 var undo=function(){deferItem(k,'open',null,i).then(function(){toast(t('backOnList'));});};
 deferItem(k,'later',+w,i).then(function(){toast(t('laterT',{w:(LANG==='he'?'':String(t(l)).toLowerCase()+', ')+whenStr(+w)})+' '+nextLine(),undo);},function(){snooze(k,Math.max(1,(+w-Date.now())/36e5));toast(t('localOnly'));});render();}
function undoDone(k){var D=doneToday().filter(function(x){return x.k===k;})[0];if(!D)return;
 if(D.type==='task')J8.tasks.undo(D.id).then(function(){toast(t('backOnList'));},function(e){toast(t('couldNot',{e:e&&e.code||'error'}));});
 else if(D.type==='drafts'){var r=Promise.resolve();D.ids.forEach(function(id){if((AP[id]||{}).status!=='sent')r=r.then(function(){return J8.approvals.undo(id).catch(function(){});});});r.then(function(){toast(t('backOnList'));});}
 else if(D.type==='later'){var row=LATER[D.id]||{},tk=String(D.id).indexOf('tk-')===0?D.id.slice(3):null;
  (tk&&row.status==='not_needed'?J8.tasks.undo(tk):Promise.resolve()).then(function(){return deferItem(D.id,'open',null,rowByKey(D.id));}).then(function(){toast(t('backOnList'));},function(e){toast(t('couldNot',{e:e&&e.code||'error'}));});}}

/* ---------- shell: top bar, nav, routing ---------- */
var view='today';
function curPlace(){return PLACE[UI.v]||'today';}
function renderTop(){var pl=curPlace(),inner=UI.v!==pl;document.body.dataset.place=pl;
 $('tBack').hidden=!inner;$('tTile').innerHTML=ic(pl);$('hdT').textContent=t(pl);
 var m=document.querySelector('meta[name=theme-color]');if(m)m.content=isDark()?'#11283C':'#FFFFFF';}
function renderNav(){var n=connected?myQueue().length:0,q=connected?askRows().length:0,pl=curPlace();
 [].forEach.call(document.querySelectorAll('#nav [data-nav]'),function(b){var k=b.dataset.nav;if(k===pl)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');b.querySelector('.lbl').textContent=t(k);});
 var a=$('nN'),b=$('tN'),was=a.textContent;a.textContent=n||'';a.hidden=!n;b.textContent=q||'';b.hidden=!q;
 $('nNs').textContent=n?' '+(LANG==='he'?'צעדים':'steps'):'';$('tNs').textContent=q?' '+(LANG==='he'?'שאלות':'questions'):'';if(n&&was&&was!==String(n))bump(a);}
function isDark(){var t0=document.documentElement.dataset.theme;return t0==='dark'||(t0==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme:dark)').matches);}
var TYPING={};
function busyMain(){var a=document.activeElement,m=$('main');return a&&m&&m.contains(a)&&(a.tagName==='TEXTAREA'||a.tagName==='INPUT'||a.tagName==='SELECT')&&String(a.value||'').trim();}
function render(focus){var m=$('main');if(!m)return;view=UI.v;renderTop();renderNav();
 if(!focus&&busyMain())return;
 [].forEach.call(m.querySelectorAll('textarea[id]'),function(x){TYPING[x.id]=x.value;});
 var y=window.scrollY;
 m.innerHTML=UI.v==='today'?vToday():UI.v==='studio'?vStudio():UI.v==='dept'?vDept():UI.v==='proj'?vProj():UI.v==='draft'?vDraft():UI.v==='flow'?vFlow():vTalk();
 Object.keys(TYPING).forEach(function(id){var x=document.getElementById(id);if(x&&TYPING[id]&&!x.value)x.value=TYPING[id];});
 if(UI.v==='talk')talkWire();
 if(focus){window.scrollTo(0,0);var ph=$('pageH');(ph||m).focus({preventScroll:true});}else if(Math.abs(window.scrollY-y)>2)window.scrollTo(0,y);
 if(UI.gsheet&&UI.gsheet.k==='thread'&&!$('gsheet').hidden){var g=$('gth');if(!g||document.activeElement!==g)threadSheet(UI.gsheet.tg);}}
function goV(v,keepStack){if(!keepStack&&UI.v!==v)UI.stack.push({v:UI.v,dept:UI.dept,proj:UI.proj,batch:UI.batch,dids:UI.dids});UI.v=v;UI.editing=false;if(PLACE[v]===v)ls('j8-view',v);render(true);}
function navTo(v){UI.stack=[];UI.doing={};goV(v,true);}
function back(){var s=UI.stack.pop()||{v:'today'};UI.v=s.v;UI.dept=s.dept;UI.proj=s.proj;UI.batch=s.batch;UI.dids=s.dids;UI.editing=false;render(true);}
function openProj(pid){UI.proj=pid;var u=unitOf(pobj(pid));UI.dept=u?u.id:'_';goV('proj');}
function go(v){var m={chat:'talk',next:'today',list:'studio',stats:'flow'};navTo(m[v]||v);} /* old names still work */
function firstBatch(){var b=myQueue().filter(function(i){return i.batch;})[0];return b?b.batch.id:(apPending()[0]?(apPending()[0].batch||'other'):null);}
function jump(tg){if(!tg)return;tg=String(tg);
 if(tg==='control'){openCtl();return;}
 if(/^(chat|messages|talk)$/.test(tg)){navTo('talk');return;}
 if(/^(approvals|approve|list-approve)$/.test(tg)){var fb=firstBatch();if(fb)openDraft(fb);else navTo('today');return;}
 if(tg.indexOf('list-b-')===0){openDraft(tg.slice(7));return;}
 if(tg.indexOf('ap-')===0){var a=AP[tg.slice(3)];if(a&&isPend(tg.slice(3)))openDraft(a.batch?a.batch:'ap:'+tg.slice(3));else navTo('today');return;}
 if(tg.indexOf('list-')===0){var k=tg.slice(5).replace(/^tk-tk-/,'tk-');navTo('today');UI.open[k]=1;render();var e=$('r-'+k);if(e)e.scrollIntoView({block:'center'});return;}
 if(/^(next|today|tasks|week)$/.test(tg)){navTo('today');return;}
 if(/^(list|projects|proj|inbox|studio)$/.test(tg)){navTo('studio');return;}
 if(/^(stats|money|health|team|flow)$/.test(tg)){navTo('flow');return;}
 if(tg.indexOf('p-')===0&&PR[tg]){UI.stack=[{v:'studio'}];openProj(tg);return;}
 navTo('today');}
function fromHash(){var h=(location.hash||'').slice(1);if(h&&!/token|refresh_token/.test(h))jump(h);}
window.addEventListener('hashchange',fromHash);
var rq=null;function soon(){if(rq)return;rq=setTimeout(function(){rq=null;renderAll();},30);}
function renderAll(){render();renderSeat();}
window.renderAll=renderAll;
function setSize(s){s=s==='large'||s==='xl'?s:'std';ls('j8-size',s);document.documentElement.dataset.size=s;renderPrefs();}
function setLang(l){LANG=l==='he'?'he':'en';ls('j8-lang',LANG);document.documentElement.lang=LANG;document.documentElement.dir=LANG==='he'?'rtl':'ltr';renderPrefs();render();}
function renderPrefs(){var sz=document.documentElement.dataset.size||'std';[].forEach.call(document.querySelectorAll('[data-size-set]'),function(b){b.setAttribute('aria-pressed',b.dataset.sizeSet===sz?'true':'false');});
 [].forEach.call(document.querySelectorAll('[data-lang-set]'),function(b){b.setAttribute('aria-pressed',b.dataset.langSet===LANG?'true':'false');});
 var lb={sizeH:'textSize',langH:'language',helpH:'help',tipB:'showTip',themeH:'theme'};Object.keys(lb).forEach(function(id){var e=$(id);if(e)e.textContent=t(lb[id]);});
 var st={std:'std',large:'large',xl:'xl'};[].forEach.call(document.querySelectorAll('[data-size-set] .sl'),function(e){e.textContent=t(st[e.parentNode.dataset.sizeSet]);});
 $('gearL').textContent=t('settings');$('tBackL').textContent=t('back');}
function talkWire(){var s=$('j8cStrip'),QUICK=['What is the one move that brings money fastest?','What is waiting on me right now?','Which teams failed or went quiet?','One line on every project'];
 if(s){var empty=!J8.inbox.list().length;s.hidden=!empty;if(empty)s.innerHTML=QUICK.map(function(x){return '<button type="button" class="opt" data-cq="'+esc(x)+'">'+esc(x)+'</button>';}).join('');}
 var nt=$('j8cNote');if(nt)nt.textContent=J8.control.brainEnabled()?'J8NIX answers here in a moment.':(LANG==='he'?'הצוות עונה כאן, בדרך כלל תוך שעה. תקבל התראה כשיענו.':'The team answers here, usually within the hour. You get an alert when they reply.');}

/* ---------- events ---------- */
document.addEventListener('toggle',function(e){var d=e.target;if(!d||!d.dataset||!d.dataset.k)return;UI.open[d.dataset.k]=d.open;
 if(d.dataset.k==='nums'&&d.open){var b=d.querySelector('.numbody');if(b&&!b.innerHTML)b.innerHTML=numbersHTML();}},true);
document.addEventListener('click',function(e){
 var el=e.target.closest('[data-a]');
 if(el&&el.tagName==='A'){var k0=el.dataset.k;if(el.dataset.a==='do'&&k0){UI.doing[k0]=1;var i0=rowByKey(k0);toast(dwOf(i0&&i0.task)?t('openedSelf'):t('openedGo'));setTimeout(render,50);}return;}
 if(e.target.closest('a'))return;
 var t0=e.target.closest('#gear');if(t0){if($('sheet').hidden){renderSeat();renderPrefs();openSheet();}else closeSheet();return;}
 t0=e.target.closest('#scrim');if(t0){if(!$('gsheet').hidden)gClose();else closeSheet();return;}
 t0=e.target.closest('[data-cx]');if(t0){if(!t0.disabled)ctlAct(t0);return;}
 t0=e.target.closest('[data-nav]');if(t0){navTo(t0.dataset.nav);return;}
 t0=e.target.closest('[data-tnote]');if(t0){var tn=t0.dataset.tnote;ctlOpen['tn'+tn]=!ctlOpen['tn'+tn];renderCtl();setTimeout(function(){var f=document.querySelector('#ctlBody form.apn[data-ap="'+(window.CSS&&CSS.escape?CSS.escape(tn):tn)+'"] textarea');if(f)f.focus();},30);return;}
 t0=e.target.closest('[data-open]');if(t0){var ok=t0.dataset.open;openRow[ok]=!openRow[ok];renderCtl();return;} /* Control: the template reply line */
 t0=e.target.closest('[data-apnd]');if(t0){var aid=t0.dataset.id,how=t0.dataset.apnd,ta=$('gth'),nv=String(ta&&ta.value||'').trim(),a0=AP[aid]||{};
  if(!nv){toast(t('writeNote'));if(ta)ta.focus();return;}if(!J8.status().connected){toast(t('notConn'));return;}
  J8.inbox.send(a0.product||'p-general',(how==='send'?'Approved, with a note: ':'Killed, with a note: ')+nv,null,aid).then(function(){if(ta)ta.value='';gClose();if(UI.v==='draft')draftDecide(aid,how,true);else decide(aid,how,true);},function(er){toast((LANG==='he'?'ההערה לא נשלחה (':'Couldn’t send the note (')+(er&&er.code||'error')+(LANG==='he'?'). שום דבר לא השתנה.':'). Nothing changed.'));});return;}
 t0=e.target.closest('[data-cq]');if(t0){var ci=$('j8cIn');if(ci){ci.value=t0.dataset.cq;ci.focus();}return;}
 t0=e.target.closest('#seat,#seatC');if(t0){seatTap();return;}
 t0=e.target.closest('[data-theme-set]');if(t0){setTheme(t0.dataset.themeSet);return;}
 t0=e.target.closest('[data-size-set]');if(t0){setSize(t0.dataset.sizeSet);return;}
 t0=e.target.closest('[data-lang-set]');if(t0){setLang(t0.dataset.langSet);return;}
 t0=e.target.closest('#tipB');if(t0){ls('j8-coach',1);closeSheet();navTo('today');return;}
 t0=e.target.closest('#undo');if(t0){var f=undoFn;hideToast();if(f)f();return;}
 if(!el)return;var a=el.dataset.a,k=el.dataset.k,id=el.dataset.id;
 if(a==='nav'){navTo(id);}
 else if(a==='nav-flow'){navTo('flow');}
 else if(a==='back'){back();}
 else if(a==='row'){UI.open[k]=!UI.open[k];render();var b=document.querySelector('[data-a=row][data-k="'+(window.CSS&&CSS.escape?CSS.escape(k):k)+'"]');if(b)b.focus({preventScroll:true});}
 else if(a==='do'){var i=rowByKey(k);if(!i)return;var g=doTarget(i);
  if(g.draft){openDraft(g.draft);return;}if(g.talk){UI.ask=k;navTo('talk');setTimeout(function(){var q=$('aq');if(q)q.focus();},60);return;}
  if(g.jump){UI.doing[k]=1;render();jump(g.jump);return;}markDone(k);}
 else if(a==='done'){markDone(k);}
 else if(a==='notyet'){delete UI.doing[k];render();}
 else if(a==='comment'){var ci2=rowByKey(k);if(!ci2)return;threadSheet(ci2.task?{task:ci2.task.id}:ci2.c?{msg:ci2.c.id}:ci2.ap?{ap:ci2.ap.id}:ci2.batch&&ci2.batch.items.length===1?{ap:ci2.batch.items[0].id}:{p:rowPid(ci2)||'p-general'});}
 else if(a==='later'){laterSheet(k);}
 else if(a==='later-pick'){laterPick(k,el.dataset.w,el.dataset.l);}
 else if(a==='later-now'){deferItem(k,'open',null).then(function(){toast(t('backOnList')+' '+(LANG==='he'?'זה בהיום.':'It is on Today.'));},function(e2){toast(t('couldNot',{e:e2&&e2.code||'error'}));});render();}
 else if(a==='no'){notNeeded(k);}
 else if(a==='no-batch'){noBatch(k);}
 else if(a==='undo'){undoDone(k);}
 else if(a==='untick'){J8.tasks.undo(id).then(function(){toast(t('backOnList')+' '+(LANG==='he'?'זה בהיום.':'It is on Today.'));},function(e2){toast(t('couldNot',{e:e2&&e2.code||'error'}));});}
 else if(a==='gclose'){gClose();}
 else if(a==='coach-off'){ls('j8-coach',0);render();}
 else if(a==='retry'){J8.reload().then(function(){toast(LANG==='he'?'מחובר. הרשימה מעודכנת.':'Connected. Your list is up to date.');},function(){toast(t('notConn'));});}
 else if(a==='crumb'){var pp=String(id).split(':');if(pp[0]==='studio'){UI.stack=[];navTo('studio');}else if(pp[0]==='dept'){UI.dept=pp[1];UI.stack=[{v:'studio'}];UI.v='dept';render(true);}else if(pp[0]==='proj'){UI.stack=[{v:'studio'}];openProj(pp[1]);}}
 else if(a==='dept'){UI.dept=id;goV('dept');}
 else if(a==='proj'){openProj(id);}
 else if(a==='jump'){jump(id);}
 else if(a==='ask'){UI.ask=k;render(true);}
 else if(a==='dsend'||a==='dkill'){draftDecide(id,a==='dsend'?'send':'kill');}
 else if(a==='dedit'){UI.editing=true;render();var ta2=document.querySelector('form.edit textarea');if(ta2)ta2.focus();}
 else if(a==='edit-cancel'){UI.editing=false;render();}
 else if(a==='thread-task'){threadSheet({task:id});}
 else if(a==='thread-ap'){threadSheet({ap:id});}
 else if(a==='thread-proj'){threadSheet({p:id});}
 else if(a==='thread-msg'){var x=CMT[id];threadSheet(x?msgTarget(Object.assign({id:id},x)):{msg:id});}
});
document.addEventListener('submit',function(e){var f=e.target;if(!f)return;
 if(f.id==='ooF')return; /* Control's own handler */
 if(f.dataset.f==='edit'){e.preventDefault();var ta=f.querySelector('textarea'),v=String(ta.value||'').trim(),L=UI.dids||[],cur=L.filter(isPend)[0];if(!cur)return;if(!v){toast(t('emptyText'));return;}
  ta.blur();J8.approvals.edit(cur,v).then(function(){UI.editing=false;toast(t('savedApproved'),function(){J8.approvals.undo(cur);});render(true);},function(er){toast(t('couldNot',{e:er&&er.code||'error'}));});return;}
 if(f.id==='j8cForm'){e.preventDefault();var i=$('j8cIn'),mv=String(i.value||'').trim();if(!mv)return;if(!J8.status().connected){toast(t('notConn'));return;}
  i.value='';TYPING.j8cIn='';$('j8cGo').disabled=true;J8.inbox.send('p-general',mv).then(function(){$('j8cGo')&&($('j8cGo').disabled=false);i.blur();toast(LANG==='he'?'נשלח. הצוות עונה כאן.':'Sent. The team answers here, in Talk.');render();},function(er){if($('j8cGo'))$('j8cGo').disabled=false;i.value=mv;toast(t('couldNot',{e:er&&er.code||'error'}));});return;}
 if(!f.dataset||!f.dataset.ans)return;e.preventDefault();var ta3=f.querySelector('textarea'),val=String(ta3.value||'').trim();if(!val){ta3.focus();return;}
 if(!J8.status().connected){toast(t('notConn'));return;}
 var pid=f.dataset.ans,team=pid&&pid!=='p-general'?pDept(pid):t('team'),ask=f.dataset.ask,inSheet=!!f.closest('#gsheet');
 J8.inbox.send(pid,val,f.dataset.task||null,f.dataset.ap||null).then(function(){ta3.value='';if(ta3.id)TYPING[ta3.id]='';ta3.blur();
   if(ask){var ai=rowByKey(ask);deferItem(ask,'done',Date.now()+24*36e5,ai).catch(function(){snooze(ask,24);});UI.ask=null;}
   toast(t('sentToT',{t:team})+(ask?' '+nextLine():''));if(inSheet&&UI.gsheet)threadSheet(UI.gsheet.tg,true);render();},
  function(er){toast(t('couldNot',{e:er&&er.code||'error'}));});});
document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;if(!$('gsheet').hidden)gClose();else closeSheet();});
document.addEventListener('keydown',function(e){var x=e.target;if(x&&x.id==='j8cIn'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&!MQ.matches){e.preventDefault();var f=$('j8cForm');if(f)f.requestSubmit?f.requestSubmit():f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));}});
document.addEventListener('input',function(e){var x=e.target;if(x&&x.tagName==='TEXTAREA'&&x.closest('.cbox')){x.style.height='auto';x.style.height=Math.min(180,x.scrollHeight+2)+'px';}});
if(MQ.addEventListener)MQ.addEventListener('change',soon);

/* ---------- toast: what happened, where it went, Undo ---------- */
var tt=null,undoFn=null;
function hideToast(){$('toast').classList.remove('on');undoFn=null;clearTimeout(tt);}
function toast(msg,undo){$('toastMsg').textContent=msg;var u=$('undo');u.hidden=!undo;$('undoL').textContent=t('undo');undoFn=undo||null;$('toast').classList.add('on');clearTimeout(tt);tt=setTimeout(hideToast,undo?10000:5000);}
window.toast=toast;

/* ---------- boot: shell.js signs in and connects; the screens follow J8's status ---------- */
(function(){try{var e=document.querySelector('#eight path');if(e)document.documentElement.style.setProperty('--glyph','url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="79 21 24 48"><path fill="#8A4600" d="'+e.getAttribute('d')+'"/></svg>')+'")');}catch(x){}})();
(function(){document.documentElement.dataset.theme=theme();renderTheme();setSize(ls('j8-size')||'std');document.documentElement.lang=LANG;document.documentElement.dir=LANG==='he'?'rtl':'ltr';
 var v=ls('j8-view'),m={chat:'talk',next:'today',list:'studio',stats:'flow'};v=m[v]||v;UI.v=PLACE[v]===v?v:'today';renderPrefs();render();})();
(function(){
 J8.on('status',function(st){var s=$('status');
  if(st.connected){UI.syncedAt=Date.now();ls('j8-synced',UI.syncedAt);}
  if(st.connected&&!connected){connected=true;s.hidden=true;setTimeout(fromHash,300);}
  else if(st.cached&&!st.connected&&!connected&&J8.projects.list().length){connected=true;UI.syncedAt=ls('j8-synced');}
  else if(st.connected)s.hidden=true;
  else if(st.error==='offline'){if(J8.projects.list().length)connected=true;UI.syncedAt=UI.syncedAt||ls('j8-synced');s.hidden=false;s.textContent=LANG==='he'?'אין חיבור. מוצג העותק האחרון.':'Offline. Showing the last copy.';}
  else if(st.error==='signed_out'){connected=false;}
  soon();});
 J8.on('comments',function(d){CMT=d;soon();});
 J8.on('approvals',function(d){AP=d;soon();});
 J8.on('projects',function(d){PR=d;soon();});
 J8.on('runs',function(d){RUNS=d;soon();});
 J8.on('money',function(d){MONEY=d;soon();});
 J8.on('todo',function(d){S=Object.assign({},d);soon();});
 J8.on('tasks',function(d){TK=d;soon();});
 J8.on('units',function(d){UN=d;soon();});
 J8.on('later',function(d){LATER=d||{};SNV++;soon();});
 J8.on('schedule',function(){if(UI.v==='flow')soon();});
 J8.on('control',function(d){CTRL=d&&d.main?d.main:null;renderSeat();renderCtl();soon();});
 J8.on('schedule',function(){renderCtl();});J8.on('optout',function(){renderCtl();});J8.on('approvals',function(){renderCtl();});J8.on('status',function(){renderCtl();});
})();
