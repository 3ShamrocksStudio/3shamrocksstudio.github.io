/* J8NIX PWA screens 9.0.0 (15 Nov 2026): the v10 layout, see the 9.0.0 block before boot. Revert copy: app-8.1.1.js.
   8.1.1 (15 Nov 2026): version only (the hero change is CSS). Revert copy: app-8.1.0.js.
   8.1.0 (15 Nov 2026): brand identity v5 colours only (stage spectrum, donuts, J8NIX tile). Revert copy: app-8.0.1.js.
   8.0.1: Home first (seven sections, live data, per-member layout) and the v8 colours and shapes,
   on 7.1.1's logic, which is unchanged (rows, unlocks, needs, mentor, Today, Studio, Flow, Talk, drafts, Later, Not needed, Control).
   Revert copy of 7.1.1: app-7.1.1.js + index-7.1.1.html.
   7.1.1 (14 Nov 2026, fix round 1 after the verifier): the v7.1 design (Today / Studio / Flow / Talk) on live data.
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
/* 11.3.3 security: a link from data may only be http(s), mailto, tel or a relative path - never javascript:/data: */
function hesc(u){var s=String(u==null?'':u).replace(/[\u0000-\u0020\u007f]/g,'');var m=/^([a-z][a-z0-9+.\-]*):/i.exec(s);if(m&&!/^(https?|mailto|tel)$/i.test(m[1]))return '#';return esc(u);}
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
/* 11.3.0 (Dave 17 Nov): project colours come only from the J8NIX palette (no pink, no yellow) */
var PCOL={'p-shomer':['#FF9700','#202663'],'p-ios':['#FF9700','#202663'],'p-tnufa':['#FF9700','#202663'],'p-command':['#FF9700','#202663'],'p-nature':['#32CC00','#32CC00'],
 'p-lickpick':['#FF9700','#202663'],'p-site':['#202663','#838EB7'],'p-services':['#202663','#838EB7'],'p-payments':['#202663','#838EB7'],'p-csr':['#202663','#838EB7'],
 'p-linkedin':['#202663','#838EB7'],'p-healthtech':['#202663','#838EB7'],'p-a11y':['#202663','#838EB7'],
 'p-th':['#FF9700','#202663'],'p-chore':['#2A44C6','#FF9700'],'p-fairent':['#202663','#FF9700'],'p-j8nix':['#2A44C6','#2AB9FF'],'p-general':['#838EB7','#838EB7']};
var PAL13=['#2A44C6','#2AB9FF','#32CC00','#FF9700','#9500FF','#202663','#838EB7','#586475'];
function snap13(h){var m=String(h||'').replace('#','');if(m.length===3)m=m.replace(/./g,'$&$&');if(!/^[0-9a-f]{6}$/i.test(m.slice(0,6)))return null;m=m.slice(0,6).toUpperCase();if(PAL13.indexOf('#'+m)>-1)return '#'+m;
 var r=parseInt(m.substr(0,2),16)/255,g=parseInt(m.substr(2,2),16)/255,b=parseInt(m.substr(4,2),16)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,l=(mx+mn)/2,s=d?d/(1-Math.abs(2*l-1)):0,H=0;
 if(s<.22||d<.08)return l<.3?'#202663':l<.6?'#586475':'#838EB7';if(l<.2)return '#202663';
 H=mx===r?60*(((g-b)/d)%6):mx===g?60*((b-r)/d+2):60*((r-g)/d+4);if(H<0)H+=360;
 if(H>=250&&H<345)return '#202663';var A=[[35,'#FF9700'],[105,'#32CC00'],[200,'#2AB9FF'],[230,'#2A44C6'],[395,'#FF9700']],best=null,bd=1e9;A.forEach(function(x){var dd=Math.abs(H-x[0]);if(dd<bd){bd=dd;best=x[1];}});return best;}
var PBADGE={'p-shomer':'shomer','p-ios':'shomer','p-tnufa':'shomer','p-command':'shomer','p-nature':'nature','p-lickpick':'lickpick','p-th':'th','p-chore':'chore','p-milo':'milo','p-ig':'media','p-j8nix':'j8nix-2026-11-17',
 'p-site':'studio','p-services':'studio','p-payments':'studio','p-csr':'studio','p-linkedin':'studio','p-healthtech':'studio','p-a11y':'studio'};
function lum(h){var m=String(h).replace('#','');if(m.length!==6)return .5;return [0,2,4].map(function(i){var c=parseInt(m.substr(i,2),16)/255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);}).reduce(function(s,c,i){return s+c*[.2126,.7152,.0722][i];},0);}
/* 6.1: a stripe must show on its background: when the brand's first colour is too faint for this theme, its second colour leads */
function pcol(id){var c=pcolRaw(id);if(!c)return null;var dk=document.documentElement.dataset.theme==='dark'||(document.documentElement.dataset.theme==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme:dark)').matches);
 if(!dk&&lum(c[0])>.6&&c[1]&&lum(c[1])<=.6)return [c[1],c[0]];if(dk&&lum(c[0])<.04&&c[1]&&lum(c[1])>=.04)return [c[1],c[0]];return c;}
function pcolRaw(id){if(!id)return null;if(PCOL[id])return PCOL[id];var c=snap13((PR[id]||{}).color);return c?[c,c]:null;}
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
 return '<a class="'+(cls||'go')+'" href="'+hesc(u)+'" target="_blank" rel="noopener">'+esc(t||'Open')+(cls&&cls!=='go'?'':ic('link'))+'</a>';}


/* ===== derived data: one source for Chat, Next, List and Stats ===== */
var GR=[['money','Money','#9A5B00'],['approve','Approve','#1F5BFF'],['projects','Projects','#3A4766'],['team','Team','#5B3FD0'],['later','Later','#5F6B88']]; /* 5.2: all AA as text on white */
var GC={};GR.forEach(function(g){GC[g[0]]=g;});
var ST={wait:'Waiting on you',prog:'In progress',done:'Done',stuck:'Stuck',park:'Parked',kill:'Killed'};
var NOUN={application:'applications',email:'emails',linkedin:'LinkedIn notes',post:'posts',invoice:'invoices',template:'templates',other:'drafts'};
function shortWhat(y,full){var t=headline(y),m=t.match(/^(.+?[^.\s])(\.\s|;\s| — )/);if(m)t=m[1];t=t.replace(/\s*\([^)]*\)\s*\.?$/,'').replace(/\.$/,'');return full?t:cut(t,90);} /* 11.3: a Dave headline is never cut */
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
/* 7.1.1: a draft without a batch is its own row (key b-one-<id>), so one decision never covers another draft */
function bkey(a){return a.batch||('one-'+a.id);}
function batches(){var by={},L=[];apPending().forEach(function(a){var b=bkey(a);if(!by[b]){by[b]={id:b,label:a.batch_label||(a.batch?'Other drafts':apKind(a)+' to '+apWho(a)),items:[]};L.push(by[b]);}by[b].items.push(a);});return L;}
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
/* 7.1.1: what it frees, in plain words ("This frees 3: 1 email and 2 team steps"), not a list of item names */
function plainNames(ids){var g=graph(),dr={},ord=[],yt=0,tt=0,pj=0;ids.forEach(function(id){var x=g.it[id];if(!x)return;if(x.k==='approval'){var n=NOUN[x.o.kind]||'drafts';if(!dr[n]){dr[n]=0;ord.push(n);}dr[n]++;}else if(x.k==='task'){if(x.o.owner==='dave')yt++;else tt++;}else pj++;});
 var P=ord.map(function(n){return dr[n]+' '+(dr[n]===1?n.replace(/s$/,''):n);});if(tt)P.push(tt+(tt===1?' team step':' team steps'));if(yt)P.push(yt+(yt===1?' step of yours':' steps of yours'));if(pj)P.push(pj+(pj===1?' project':' projects'));
 return P.length>1?P.slice(0,-1).join(', ')+' and '+P[P.length-1]:(P[0]||'');}
function mentor(i){var n=i.ul.length;
 if(i.wo.length)return 'First: '+itemNames(i.wo,2)+(n?' (then it frees '+n+')':'')+'.';
 if(n)return 'This frees '+n+': '+plainNames(i.ul)+'.';
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
  R.push({key:'mv-'+p.id,g:g,st:pk?'park':y?'wait':'prog',sev:y?sevOf(p.you)||'o':null,title:y?shortWhat(y,1):p.name,sub:y?p.name+(stageName(p.stage)?' · '+stageName(p.stage):''):cut(shortWhat(p.now||''),70)||stageName(p.stage),full:y,own:y?'dave':dept(p),why:whyMove(p),p:p,move:!!y,ids:[p.id],since:dt(p.updated)});});
 batches().forEach(function(b){if(b.items.length===1&&b.items[0].kind==='invoice')return;var ds=b.items.map(dueOf).filter(Boolean).sort(function(x,y){return x-y;});
  R.push({key:'b-'+b.id,g:'approve',st:'wait',sev:ds[0]&&ds[0]<=eod()?'r':'o',since:b.items.map(function(a){return dt(a.created);}).filter(Boolean).sort(function(x,y){return x-y;})[0]||null,title:b.items.length+' '+nounOf(b.items)+' to send',sub:b.label,own:'dave',due:ds[0]||null,batch:b,ids:ida(b.items)});});
 held().forEach(function(h){var n=h.items.length+' '+nounOf(h.items);R.push({key:h.key,g:'team',st:h.dave?'wait':'stuck',sev:h.dave?'o':null,title:h.dave?cut(h.why,70)+' ('+n+')':n.replace(/^(\d+) /,'$1 approved ')+' held',sub:h.dave?'Approved; '+(h.items.length===1?'it goes':'they go')+' out once you do this':cut(h.why,70),own:h.dave?'dave':'Team',held:h,ids:ida(h.items)});});
 J8.inbox.list().forEach(function(x){var a=false /* 11.3: a reply fragment is never a step for Dave */,st=a?'wait':x.status==='done'?'done':'prog';
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
 if(i.batch)return {what:'Approve or kill '+i.title.replace(/ to send$/,''),why:'They go out only after your Send. '+i.batch.label+'.',jump:'list-'+i.key,t:'Open the '+i.batch.items.length};
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
function activity(){var days=[],by={},S3=[['Drafts made','#9AA5B5'],['Your decisions','#FF9700'],['Team runs','#586475']];
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
function holderOf(p,M){if(p.milestone_by==='external')return 'ext';if((M[p.id]||[]).length||p.milestone_by==='dave'||(p.status==='parked'&&youReal(p)&&!coveredYou(p)))return 'me';return 'team';}
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
function linkTxt(s){var out='',i=0,re=/(?:https?:\/\/)\S+/gi,m;s=String(s==null?'':s);while((m=re.exec(s))){var u=m[0].replace(/[.,;:)]+$/,'');out+=esc(s.slice(i,m.index))+'<a href="'+hesc(u)+'" target="_blank" rel="noopener">open link</a>';i=m.index+u.length;}return out+esc(s.slice(i));}
function armKey(s){return String(s||'').toLowerCase().replace(/^3s\s+/,'').replace(/\s*\([^)]*\)\s*/g,' ').replace(/\s+/g,' ').trim();}
function theme(){var t=ls('j8-theme');return t==='dark'||t==='auto'?t:'light';}
function setTheme(t){ls('j8-theme',t);document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='dark'?'#060833':'#FFFFFF';renderTheme();if(typeof renderAll==='function')renderAll();}
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
   Today (amber = you) · Studio (blue = places) · Flow (teal = progress) · Talk (slate = people). Red = alarm only.
   Every screen answers 4 questions in one brief: where you are, what you see, what is needed (amber), what you get (teal).
   The data logic above is unchanged from 6.1.2 (rows, unlocks, needs, mentor, notes with routing, Control).
   Plan + screen → code → data map: ops/brain/J8NIX-V6-PLAN.md §7.1. Revert: index-6.1.2.html (one line in the plan).
   ===================================================================================================================== */
var J8V='8.1.1';
/* ---------- words (EN / HE). Content stays in its own language with dir=auto; numbers in <bdi>. ---------- */
var LANG=(function(){var l=ls('j8-lang');return l==='he'?'he':'en';})();
var TX={en:{
 today:'Today',studio:'Studio',flow:'Flow',talk:'Talk',settings:'Settings',back:'Back',youAreIn:'You are in',
 needs:'Needs you',gets:'You get',first:'Do this first',then:'Then',planned:'Planned for later',everything:'Everything else',doneToday:'Done today',
 do:'Do',comment:'Comment',later:'Later',notNeeded:'Not needed',send:'Send',edit:'Edit',kill:'Kill',undo:'Undo',where:'Where',how:'How',after:'After',
 markDone:'Mark done',notYet:'Not yet',save:'Save and send',cancel:'Cancel',close:'Close',now:'Now',gotIt:'Got it',actions:'Actions',
 dayTitle:'Your day, {d}',todayWhat:'Your steps, in the order that frees the most work.',nSteps:'{n} steps',oneStep:'1 step',aboutMin:', about {n} min',
 nThings:'{n} things',oneThing:'1 thing',moveAfterGold:'move after the orange card alone.',goldMoney:'the orange card is the step closest to money.',goldGain:'one clear step at a time, in the best order.',
 nOfDone:'{a} of {b} done today',minEst:'about {n} min',estNote:' (draft times estimated)',stepsN:'{n} steps for you',parked:'Parked',parkedGrp:'Parked, waiting on you',parkedNeed:'parked. When you pick it up: {x}',
 nnQ:'Not needed?',nnTaskP:'It closes and moves under Done. You can undo it.',nnYes:'Yes, not needed',nnDeps:'{n} things wait on this: {x}.',nnHeld:'Until you choose, they stay held.',letGo:'Not needed, let them go',killToo:'Kill them too',
 letGoT:'Not needed. The {n} that waited on it can go ahead.',killTooT:'Not needed, and {n} that waited on it are killed or closed.',nnHeldP:'{n} approved sends wait on this step.',backWait:'Back to waiting for your OK',killThese:'Kill these {n}',backWaitT:'{n} sends are back to waiting for your OK.',
 nnApP:'This payment request will not be sent.',nnTellP:'The {t} team is told it is not needed.',andMore:'and {n} more',blockedOnly:'Blocked only',noBlocked:'No project is blocked right now.',noMove:'No movement in 7 days',waitOutside:'Waiting outside',loading:'Loading…',loadingDay:'Loading your day…',nothingNow:'nothing right now.',teamKeeps:'the team keeps {n} things moving.',
 allClear:'All clear',allClearP:'Everything that needed you is done. New steps appear here, and your phone tells you.',seeFlow:'See how the studio is moving',
 noConn:'No connection',noConnP:'You see the list from {t}. What you tap now is sent when you are back online.',tryAgain:'Try again',savedCopy:'Saved copy from {t}:',
 coach:'New here? Orange means you. Do the orange card first.',
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
 updates:'Updates',msgTeam:'Message the team',talkHint:'To ask about one item, open it and tap Comment.',newMsgs:'New messages',showAll:'Show all ({n})',newMsgs:'New messages',showAll:'Show all ({n})',yourMsg:'Your message, {h}',yourNote:'Your note, {h}',
 sent:'Sent',withTeam:'With the team',doneW:'Done',comments:'Comments',sentTo:'Sent to {t}, {h}. The answer comes here and in Talk.',answeredBy:'Answered by {t}, {h}',
 threadLead:'Ask a question or give a change. The {t} team answers here and in Talk, usually within the hour.',sentToT:'Sent to {t}. The answer comes here and in Talk.',
 apNote:'Approve + note',kNote:'Kill + note',writeNote:'Write the note first.',
 textSize:'Text size',std:'Standard',large:'Large',xl:'Largest',language:'Language',help:'Help',showTip:'Show the tip again',theme:'Theme'
},he:{
 today:'היום',studio:'הסטודיו',flow:'זרימה',talk:'שיחה',settings:'הגדרות',back:'חזרה',youAreIn:'את/ה נמצא/ת ב',
 needs:'מחכה לך',gets:'מה מקבלים',first:'קודם כל את זה',then:'הבא בתור',planned:'נדחה למועד אחר',everything:'כל השאר',doneToday:'בוצע היום',
 do:'לבצע',comment:'הערה',later:'אחר כך',notNeeded:'לא צריך',send:'לשלוח',edit:'לערוך',kill:'לא לשלוח',undo:'בטל פעולה',where:'איפה',how:'איך',after:'אחרי',
 markDone:'סמן כבוצע',notYet:'עוד לא',save:'לשמור ולשלוח',cancel:'סגור',close:'סגור',now:'עכשיו',gotIt:'הבנתי',actions:'פעולות',
 dayTitle:'היום שלך, {d}',todayWhat:'הצעדים שלך, לפי הסדר שמשחרר הכי הרבה עבודה.',nSteps:'{n} צעדים',oneStep:'צעד אחד',aboutMin:', בערך {n} דק׳',
 nThings:'{n} דברים',oneThing:'דבר אחד',moveAfterGold:'זזים אחרי הכרטיס הכתום לבדו.',goldMoney:'הכרטיס הכתום הוא הצעד הקרוב ביותר לכסף.',goldGain:'צעד ברור אחד בכל פעם, בסדר הנכון.',
 nOfDone:'{a} מתוך {b} בוצעו היום',minEst:'בערך {n} דק׳',estNote:' (זמני הטיוטות מוערכים)',stepsN:'{n} צעדים בשבילך',parked:'מושהה',parkedGrp:'מושהה, מחכה לך',parkedNeed:'מושהה. כשחוזרים אליו: {x}',
 nnQ:'לא צריך?',nnTaskP:'זה נסגר ועובר לבוצע. אפשר לבטל.',nnYes:'כן, לא צריך',nnDeps:'{n} דברים מחכים לזה: {x}.',nnHeld:'עד שתבחר, הם נשארים מוחזקים.',letGo:'לא צריך, לשחרר אותם',killToo:'לא לשלוח גם אותם',
 letGoT:'לא צריך. ה-{n} שחיכו לזה יכולים להמשיך.',killTooT:'לא צריך, ו-{n} שחיכו לזה לא יישלחו או נסגרו.',nnHeldP:'{n} שליחות מאושרות מחכות לצעד הזה.',backWait:'להחזיר להמתנה לאישור שלך',killThese:'לא לשלוח את ה-{n}',backWaitT:'{n} שליחות חזרו להמתנה לאישור שלך.',
 nnApP:'בקשת התשלום הזו לא תישלח.',nnTellP:'צוות {t} יעודכן שזה לא צריך.',andMore:'ועוד {n}',blockedOnly:'רק חסומים',noBlocked:'אין עכשיו פרויקט חסום.',noMove:'לא זזו 7 ימים',waitOutside:'מחכה למישהו מבחוץ',loading:'טוען…',loadingDay:'טוען את היום שלך…',nothingNow:'כלום כרגע.',teamKeeps:'הצוות ממשיך להזיז {n} דברים.',
 allClear:'הכול נקי',allClearP:'כל מה שחיכה לך בוצע. צעדים חדשים יופיעו כאן, והטלפון יודיע לך.',seeFlow:'לראות איך הסטודיו זז',
 noConn:'אין חיבור',noConnP:'זו הרשימה מ-{t}. מה שתלחץ עכשיו יישלח כשיחזור החיבור.',tryAgain:'לנסות שוב',savedCopy:'עותק שמור מ-{t}:',
 coach:'חדש כאן? כתום = את/ה. קודם הכרטיס הכתום.',
 wTask:'ממתין',wNow:'עכשיו',wToday:'היום',wWeek:'השבוע',min:'{n} דק׳',hereJ8:'כאן, ב-J8NIX',whereCtl:'הגדרות J8NIX, ואז Control',whereTalk:'שיחה, ב-J8NIX',
 howBatch:'לקרוא כל אחד, ואז לשלוח, לערוך או לבטל.',afterSwitch:'זה נסגר לבד כש-{s} מופעל ב-Control.',afterOut:'לחזור ולסמן כבוצע.',
 readN:'לקרוא את {n}',readOne:'לקרוא',answerTeam:'לענות לצוות',openIt:'לפתוח',forYou:'{n} בשבילך',teamHasIt:'אצל הצוות',furthest:'הכי רחוק: {s}',
 openedGo:'נפתח. כשזה בוצע, לחזור ולסמן כבוצע.',openedSelf:'נפתח. זה נסגר לבד כשהמתג מופעל.',
 doneFree:'בוצע. {n} דברים יכולים לזוז.',doneFree1:'בוצע. דבר אחד יכול לזוז.',doneNo:'בוצע.',nextTop:'הבא עכשיו למעלה.',allClearT:'הכול נקי כרגע.',
 doneTold:'סומן כבוצע. הצוות עודכן.',doneHere:'סומן כאן. עוד לא הצלחנו לעדכן את הצוות.',backOnList:'חזר לרשימה שלך.',
 laterQ:'מתי להחזיר את זה?',laterNote:'זה מחכה תחת "נדחה למועד אחר" בהיום, ואז חוזר לבד.',
 tonight:'הערב',in3h:'בעוד 3 שעות',tomorrow:'מחר בבוקר',nextWeek:'בשבוע הבא',laterT:'נדחה ל{w}. זה מחכה תחת נדחה למועד אחר.',
 comesBack:'חוזר: {w}',noT:'סומן כלא צריך. זה תחת בוצע, למטה.',noBatchQ:'לא לשלוח את כל ה-{n}?',noBatchP:'אף אחד מה-{n} לא יישלח. אפשר לבטל פעולה מההודעה ומתחת לבוצע היום.',
 killAll:'לא לשלוח את כל ה-{n}',killedAll:'{n} לא יישלחו. הם תחת בוצע היום.',
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
 allDecided:'כל ה-{n} הוחלטו',adNeed:'אין עוד כלום כאן.',adGain:'{a} אושרו, {k} לא יישלחו. המאושרים יוצאים בריצה הבאה של הצוות.',nextForYou:'הבא בשבילך',goToday:'ללכת לזה בהיום',
 approvedNext:'אושר. הבא: {x}.',approvedLast:'אושר. זה תחת בוצע בהיום.',killedNext:'לא יישלח. הבא: {x}.',killedLast:'לא יישלח. זה תחת בוצע בהיום.',
 savedApproved:'נשמר ואושר. יוצא בריצה הבאה של הצוות.',emptyText:'הטקסט ריק. לכתוב או לבטל.',backWaiting:'חזר להמתנה.',
 fTitle:'אבן דרך 1 בעוד {n} ימים',fTitleNo:'איך הסטודיו זז',fWhat:'איך הסטודיו מתקדם אליה.',fNeed:'צעד אחד מעכב {n} דברים.',fNeed0:'שום דבר לא תקוע אצלך.',fGain:'כסף, חסימות והתקדמות במבט אחד.',
 stuck:'מה תקוע',stuckP:'{n} דברים מחכים לזה.',takesMin:'זה לוקח {n} דקות.',doItNow:'לעשות עכשיו',money:'כסף',booked:'{a} מתוך {b} נסגרו',bookedNo:'נסגר: אוספים נתונים',
 m1due:'אבן דרך 1 ב-{d}.',closest:'הקרוב ביותר לכסף: {p}.',thisWeek:'השבוע',clearedYou:'{n} נסגרו על ידך',weekP:'הצוות סיים {r} ריצות ושלח {s}. בשבוע שעבר: {l}.',
 everyProject:'כל הפרויקטים',everyLead:'המתקדמים ביותר קודם. לחיצה פותחת.',doneProjects:'בוצעו',comingUp:'בקרוב',slotPassed:'המועד עבר, עדיין פתוח',nothingDated:'אין מועדים בשבועיים הקרובים.',
 teamNow:'הצוות עכשיו',working:'עובד',on:'פעיל',off:'כבוי',problem:'בעיה',waiting:'מחכה',noRun:'עוד אין ריצה',nextRun:'הבא {t}',numbers:'מספרים ואבני דרך',
 you:'את/ה',team:'צוות',outside:'מבחוץ',
 tTitle:'{n} שאלות בשבילך',tTitle1:'שאלה אחת בשבילך',tTitle0:'הכול נענה',tWhat:'את/ה והצוות: שאלות, תשובות ועדכונים.',tNeed:'{n} מהצוות. לענות בשורה.',tNeed0:'כלום. כל השאלות נענו.',tGain:'הצוות ממשיך לעבוד בזמן שאת/ה עונה בשורה.',
 asks:'{t} שואל',answerPh:'לענות לצוות',openLink:'לפתוח את הקישור',moreQ:'עוד שאלות',answers:'תשובות להערות שלך',answered:'נענה',tAnswered:'{t} ענה, {h}',
 updates:'עדכונים',msgTeam:'הודעה לצוות',talkHint:'כדי לשאול על פריט אחד, לפתוח אותו וללחוץ הערה.',newMsgs:'הודעות חדשות',showAll:'להציג הכול ({n})',newMsgs:'הודעות חדשות',showAll:'להציג הכול ({n})',yourMsg:'ההודעה שלך, {h}',yourNote:'ההערה שלך, {h}',
 sent:'נשלח',withTeam:'אצל הצוות',doneW:'בוצע',comments:'הערות',sentTo:'נשלח ל{t}, {h}. התשובה תגיע לכאן ולשיחה.',answeredBy:'{t} ענה, {h}',
 threadLead:'לשאול שאלה או לבקש שינוי. צוות {t} עונה כאן ובשיחה, בדרך כלל תוך שעה.',sentToT:'נשלח ל{t}. התשובה תגיע לכאן ולשיחה.',
 apNote:'לאשר + הערה',kNote:'לא לשלוח + הערה',writeNote:'קודם לכתוב את ההערה.',
 textSize:'גודל טקסט',std:'רגיל',large:'גדול',xl:'הכי גדול',language:'שפה',help:'עזרה',showTip:'להציג שוב את הטיפ',theme:'ערכת צבע'
}};
/* 8.0.0: words for Home, Edit Home and Ask (EN / HE) */
Object.assign(TX.en,{
 coach:'New here? Orange means you. Do the orange card first.',
 home:'Home',ask:'Ask J8 or jump to anything',editHome:'Edit Home',nowW:'now',
 s_hero:'Your move now',s_money:'Money vs goal',s_waiting:'Waiting on you',s_week:'This week',s_stages:'Projects by stage',s_j8:'J8 suggests next',s_team:'The team at work',
 w_money:'Where the studio stands today',w_waiting:'Steps and drafts only you can move',w_week:'Calls, deadlines and milestones, day by day',w_stages:'Every live project, from idea to paying',w_j8:'Your copilot’s advice',w_team:'What J8’s departments did, and what is next',
 inMin:'in {n} min',atTime:'At {t}',heroRule:'A step with a fixed time in the next 2 hours comes first. Otherwise J8 puts first the step that frees the most work.',thenOrder:'Then, in this order',moreInToday:'{n} more in Today',youGet:'You get:',nextStageIs:'next stage: {s}',freesN:'{n} things can move: {x}.',
 bookedSoFar:'booked so far',m1line:'Milestone 1: {a} by {d}',daysLeft:'{n} days left',dayLeft:'1 day left',goalLine:'Goal: {a} by {d}',spent:'Spent: {a}',noPipe:'No pipeline figure yet. It appears when the first quote is out.',pipe:'Pipeline: {a}',
 sentJ8:'Sent from J8NIX: {a}',apprNotSent:'{n} approved, not sent yet',moneyFrom:'Money figures: {x}',funnelFrom:'Counts from {p}',noMoney:'No money figures yet.',fw_sent:'sent',fw_acc:'accepted',fw_rep:'replies',fw_calls:'calls',fw_booked:'booked',
 yourSteps:'Your steps',draftsToOk:'Drafts to OK',inBatches:'{n} in {b} groups',nMore:'+ {n} more steps',nMoreG:'+ {n} more groups',nothingWaiting:'Nothing waits on you right now.',
 todayTag:'Today',noWeek:'Nothing dated in the next 7 days.',m1goal:'Milestone 1: {a} booked',
 stagesNoneYet:'None yet',noPaying:'No project is paying yet.',needsYouMark:'needs you',legendYou:'needs you: {n} projects',notStaged:'No stage yet',parkedN:'Parked ({n})',doneN:'Done ({n})',
 j8says:'J8 says',startFirst:'Start the first one',noAdvice:'No advice yet. It appears after the team’s next board run.',nextStep:'next step',
 teamOpen:'{n} open team steps',nextUp:'Next for the team: {x}',frees:'frees {x}',seeTeam:'See the team in Flow',noRuns:'No team runs recorded yet.',
 pin:'Pin to the top',hide:'Hide',move:'Move (Alt + arrow keys)',hiddenSecs:'Hidden sections',showX:'Show {x}',
 ehTitle:'Edit Home',ehLead:'Your move now always comes first. You can change the rest: order, pin, hide and width. It is saved for you on every device.',alwaysFirst:'Always first',
 up:'Up',down:'Down',pinW:'Pin',hideW:'Hide',pinnedW:'Pinned to the top',shownW:'Shown',hiddenW:'Hidden',width:'Width',wAuto:'J8’s',wFull:'Full',reset:'Reset to J8’s order',doneB:'Done',
 savedHome:'Home saved.',savedLocal:'Saved on this device. It syncs when you are back online.',resetT:'Back to J8’s order.',movedT:'{x} moved.',hiddenT:'{x} is hidden. Show it again at the bottom of Home.',shownT:'{x} is back on Home.',pinnedT:'{x} is pinned under Your move now.',unpinnedT:'{x} is no longer pinned.',
 askTitle:'Ask J8 or jump',askPh:'A project, a step or a question',askSend:'Ask the team: “{x}”',askSent:'Sent to the team. The answer comes in Talk.',places:'Places',projectsH:'Projects',steps:'Your steps',noMatch:'Nothing matches. You can ask the team instead.'
});
Object.assign(TX.he,{
 coach:'חדש כאן? כתום = את/ה. קודם הכרטיס הכתום.',
 home:'בית',ask:'לשאול את J8 או לקפוץ לכל מקום',editHome:'לערוך את הבית',nowW:'עכשיו',
 s_hero:'הצעד שלך עכשיו',s_money:'כסף מול היעד',s_waiting:'מחכה לך',s_week:'השבוע',s_stages:'פרויקטים לפי שלב',s_j8:'J8 מציע הלאה',s_team:'הצוות בעבודה',
 w_money:'איפה הסטודיו עומד היום',w_waiting:'צעדים וטיוטות שרק את/ה יכול/ה להזיז',w_week:'שיחות, מועדים ואבני דרך, יום אחר יום',w_stages:'כל פרויקט פעיל, מרעיון ועד תשלום',w_j8:'העצה של J8',w_team:'מה המחלקות של J8 עשו, ומה הלאה',
 inMin:'בעוד {n} דק׳',atTime:'בשעה {t}',heroRule:'צעד עם שעה קבועה בשעתיים הקרובות בא ראשון. אחרת J8 שם ראשון את הצעד שמשחרר הכי הרבה עבודה.',thenOrder:'אחר כך, לפי הסדר',moreInToday:'עוד {n} בהיום',youGet:'מה מרוויחים:',nextStageIs:'השלב הבא: {s}',freesN:'{n} דברים יכולים לזוז: {x}.',
 bookedSoFar:'נכנס עד עכשיו',m1line:'אבן דרך 1: {a} עד {d}',daysLeft:'נשארו {n} ימים',dayLeft:'נשאר יום אחד',goalLine:'יעד: {a} עד {d}',spent:'הוצאות: {a}',noPipe:'אין עדיין סכום בצנרת. הוא יופיע כשתצא הצעת המחיר הראשונה.',pipe:'בצנרת: {a}',
 sentJ8:'נשלחו מ-J8NIX: {a}',apprNotSent:'{n} אושרו, עוד לא נשלחו',moneyFrom:'מקור המספרים: {x}',funnelFrom:'המספרים מתוך {p}',noMoney:'עוד אין מספרי כסף.',fw_sent:'נשלחו',fw_acc:'אישרו',fw_rep:'ענו',fw_calls:'שיחות',fw_booked:'נכנס',
 yourSteps:'הצעדים שלך',draftsToOk:'טיוטות לאישור',inBatches:'{n} ב-{b} קבוצות',nMore:'+ עוד {n} צעדים',nMoreG:'+ עוד {n} קבוצות',nothingWaiting:'שום דבר לא מחכה לך עכשיו.',
 todayTag:'היום',noWeek:'אין מועדים ב-7 הימים הקרובים.',m1goal:'אבן דרך 1: {a} נכנסו',
 stagesNoneYet:'עוד אין',noPaying:'אף פרויקט עוד לא משלם.',needsYouMark:'מחכה לך',legendYou:'מחכים לך: {n} פרויקטים',notStaged:'עוד בלי שלב',parkedN:'מושהים ({n})',doneN:'הסתיימו ({n})',
 j8says:'J8 אומר',startFirst:'להתחיל בראשון',noAdvice:'עוד אין עצה. היא תופיע אחרי הריצה הבאה של הצוות.',nextStep:'הצעד הבא',
 teamOpen:'{n} צעדים פתוחים לצוות',nextUp:'הבא בתור לצוות: {x}',frees:'משחרר {x}',seeTeam:'לראות את הצוות בזרימה',noRuns:'עוד אין ריצות של הצוות.',
 pin:'להצמיד למעלה',hide:'להסתיר',move:'להזיז (Alt וחצים)',hiddenSecs:'חלקים מוסתרים',showX:'להציג את {x}',
 ehTitle:'לערוך את הבית',ehLead:'"הצעד שלך עכשיו" תמיד ראשון. את השאר אפשר לשנות: סדר, הצמדה, הסתרה ורוחב. זה נשמר לך בכל מכשיר.',alwaysFirst:'תמיד ראשון',
 up:'למעלה',down:'למטה',pinW:'להצמיד',hideW:'להסתיר',pinnedW:'מוצמד למעלה',shownW:'מוצג',hiddenW:'מוסתר',width:'רוחב',wAuto:'של J8',wFull:'מלא',reset:'לחזור לסדר של J8',doneB:'סיום',
 savedHome:'הבית נשמר.',savedLocal:'נשמר במכשיר הזה. יסתנכרן כשיחזור החיבור.',resetT:'חזר לסדר של J8.',movedT:'{x} הוזז.',hiddenT:'{x} מוסתר. אפשר להציג אותו שוב בתחתית הבית.',shownT:'{x} חזר לבית.',pinnedT:'{x} מוצמד מתחת ל"הצעד שלך עכשיו".',unpinnedT:'{x} כבר לא מוצמד.',
 askTitle:'לשאול את J8 או לקפוץ',askPh:'פרויקט, צעד או שאלה',askSend:'לשאול את הצוות: "{x}"',askSent:'נשלח לצוות. התשובה תגיע בשיחה.',places:'מקומות',projectsH:'פרויקטים',steps:'הצעדים שלך',noMatch:'אין התאמה. אפשר לשאול את הצוות.'
});
function t(k,o){var s=(TX[LANG]&&TX[LANG][k])||TX.en[k]||k;if(o)s=s.replace(/\{(\w+)\}/g,function(_,n){return o[n]!=null?o[n]:'';});return s;}
function th(k,o){var e={};if(o)Object.keys(o).forEach(function(x){e[x]=esc(o[x]);});return t(k,e);} /* t() with every value escaped */
var DOWH=['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];
function dayStr(d){d=d||new Date();return LANG==='he'?'יום '+DOWH[d.getDay()]+' '+d.getDate()+'.'+(d.getMonth()+1):DOW[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()];}
function hm2(ms){var d=new Date(ms);return isNaN(d)?'':String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function whenStr(ms){var d=new Date(ms);if(isNaN(d))return '';var td=ymd(new Date()),tm1=ymd(new Date(Date.now()+864e5)),k=ymd(d);
 if(k===td)return (LANG==='he'?'היום ':'today ')+hm2(ms);if(k===tm1)return (LANG==='he'?'מחר ':'tomorrow ')+hm2(ms);return dayStr(d)+' '+hm2(ms);}

/* ---------- icons, tiles, small parts ---------- */
var TBG={shomer:'#0C1B3A',nature:'#EEF6EE',lickpick:'#15111F',th:'#0A0A2E',chore:'#F6F1FF',milo:'#CFE3EA',media:'#F4F7FB',j8nix:'#2A44C6','j8nix-2026-11-17':'#FFFFFF',studio:'#F3EAFE'};
function tile(pid,cls){var b=pid&&PBADGE[pid];cls='tile'+(cls?' '+cls:'');
 if(b)return '<span class="'+cls+'" style="background:'+TBG[b]+'"><img src="brand/'+b+'.png" alt="" width="64" height="64" loading="lazy" decoding="async"></span>';
 var c=pcolRaw(pid);if(!c||pid==='p-general')return '<span class="'+cls+' plain">'+ic('studio')+'</span>';
 return '<span class="'+cls+'" style="background:'+c[0]+';color:'+(lum(c[0])<.3?'#fff':'#060833')+'">'+ic('studio')+'</span>';}
function g8(){return '<svg class="g8" aria-hidden="true"><use href="#eight"/></svg>';}
function chip(cls,icon,txt){return '<span class="chip'+(cls?' '+cls:'')+'">'+ic(icon)+'<span>'+txt+'</span></span>';}
function prog(a,b,label){var pc=b?Math.round(100*a/b):0;return '<div class="prog" role="img" aria-label="'+esc(label)+'"><span class="bar"><i style="width:'+Math.max(pc,3)+'%"></i></span><bdi>'+esc(label).replace(/^(\d+)/,'<b>$1</b>')+'</bdi></div>';}
function crumbs(L){return '<nav class="crumbs" aria-label="'+esc(t('youAreIn'))+'">'+L.map(function(x){return '<button data-a="crumb" data-id="'+esc(x[0])+'">'+esc(x[1])+'</button>'+ic('fwd','flip sep');}).join('')+'</nav>';}
function brief(o){return '<section class="brief" aria-labelledby="pageH">'+(o.crumbs||'')+'<h2 id="pageH" tabindex="-1" dir="'+(o.dir||'auto')+'">'+o.title+'</h2>'+(o.what?'<p class="what" dir="auto">'+o.what+'</p>':'')
 +'<div class="bl need">'+ic('you')+'<p><b>'+t('needs')+':</b> <bdi>'+o.need+'</bdi></p></div><div class="bl gain">'+ic('key')+'<p><b>'+t('gets')+':</b> <bdi>'+o.gain+'</bdi></p></div>'+(o.prog||'')+'</section>';}
function stateBox(k,icon,h,p,btn,act){return '<section class="state"><div class="big st-'+k+'">'+ic(icon)+'</div><h2>'+esc(h)+'</h2><p>'+esc(p)+'</p>'+(btn?'<button class="btn go" data-a="'+act+'">'+esc(btn)+'</button>':'')+'</section>';}
function k1(n){return '<b class="k">'+n+'</b>';}
function stepsTxt(n){return n===1?t('oneStep'):t('nSteps',{n:n});}
function thingsTxt(n){return n===1?t('oneThing'):t('nThings',{n:n});}
function sumMins(L){return L.reduce(function(s,i){return s+(isNum(i.mins)?i.mins:0);},0);}
function deptName(u){return u?u.name:t('other');}
function pDept(pid){var u=unitOf(pobj(pid));return u?u.name:t('team');}
function stg(s){return (LANG==='he'?FSTGH:FSTG)[s-1]||'';} /* 8.0: stage names in Hebrew too */

/* ---------- state ---------- */
var UI={v:'today',dept:null,proj:null,batch:null,dids:[],stack:[],doing:{},open:{},ask:null,editing:false,doneOpen:false,gsheet:null,syncedAt:null};
var LATER={};
var PLACE={home:'home',today:'today',studio:'studio',dept:'studio',proj:'studio',draft:'studio',flow:'flow',talk:'talk'};
function rowByKey(k){return rows().filter(function(x){return x.key===k;})[0]||null;}
function fpOf(i){if(!i)return null;if(i.p&&i.move)return cut(youRaw(i.p),300);if(i.held)return i.title;return null;}
function kindOf(i){return !i?'item':i.task?'task':i.batch?'batch':i.ap?'draft':i.held?'held':i.c?'ask':i.p?'move':'item';}
/* 7.1.1 (verifier FAIL 1): a decision hides an item only while it still describes the same thing: a new draft in the batch,
   a reopened task or a new "you" line brings the item back */
function deferOf(i){var r=LATER[i.key];if(!r||r.status==='open')return null;if(r.fp&&fpOf(i)!==r.fp)return null;
 var had=r.item_ids||[];if((i.ids||[]).some(function(id){return had.indexOf(id)<0;}))return null;
 if(r.status==='not_needed'&&i.task&&(!i.task.status||i.task.status==='open'))return null;
 if(r.status==='not_needed')return r;var u=pd(r.come_back_at);return isNaN(u)||u>Date.now()?r:null;}
function deferItem(k,st,until,i,choice){i=i||rowByKey(k);var patch={status:st,come_back_at:until?new Date(until).toISOString():null,item_ids:(i&&i.ids||[]).slice(0,1000),kind:kindOf(i),title:i?cut(cap1((nextOf(i)||{}).what||i.title),200):null,fp:fpOf(i),choice:choice||null};
 if(!J8.later)return Promise.reject({code:'unavailable'});return J8.later.set(k,patch);}
function teamOf(i){var pid=rowPid(i);return pid?pDept(pid):t('team');}

/* ---------- Today: the queue (needs) minus what Dave put off ---------- */
/* 7.1.1 (FAIL 4): drafts carry no minutes, so each one is estimated: reading at about 1,200 characters a minute, plus
   1 minute when Dave sends it by hand (LinkedIn, posts, reels) or half a minute for a Send in the app. Shown as "about". */
function estDraft(a){var tx=J8.approvals.textOf(a)||'',hand=/linkedin|by hand|instagram|\bpost|reel/i.test(String(a.kind||'')+' '+String(a.channel||'')+' '+String(a.label||''));return Math.max(1,Math.round(tx.length/1200+(hand?1:.5)));}
function withEst(i){if(!isNum(i.mins)&&(i.batch||i.ap)){var L=i.batch?i.batch.items:[i.ap];i.mins=L.reduce(function(s,a){return s+estDraft(a);},0);i.est=true;}return i;}
function myQueue(){return needs().filter(function(i){return !deferOf(i);}).map(withEst);}
function minsTxt(L){var m=sumMins(L);return m?t('aboutMin',{n:m})+(L.some(function(i){return i.est;})?t('estNote'):''):'';}
/* 7.1.1 (FAIL 3): a parked project's real ask stays reachable */
function parkedAsks(){var now=Date.now(),ed=eod().getTime();return rows().filter(function(i){return i.p&&i.move&&i.st==='park'&&!snoozed(i.key);}).map(function(i){return lead1(i,now,ed);}).filter(function(i){return !deferOf(i);});}
function plannedRows(){var now=Date.now();return Object.keys(LATER).map(function(k){var r=Object.assign({id:k},LATER[k]);return r;}).filter(function(r){var u=pd(r.come_back_at);if(r.status!=='later'||!(u>now))return false;var i=rowByKey(r.id);return !i||!r.fp||fpOf(i)===r.fp;}).sort(function(a,b){return pd(a.come_back_at)-pd(b.come_back_at);});}
function isToday(ms){return !isNaN(ms)&&ymd(new Date(ms))===ymd(new Date());}
/* Done today: tasks done today, drafts decided today (grouped by batch), and Later rows marked done / not needed today */
function doneToday(){var me=(J8.status().user||{}).id,D=[];
 tasksAll().forEach(function(x){
  if(x.status==='done'&&x.owner==='dave'&&isToday(pd(x.done_at)))D.push({k:'tk-'+x.id,type:'task',id:x.id,title:x.title,pid:x.project_id,word:t('doneW'),at:pd(x.done_at),freed:x.unlocked_on_done});});
 var by={};J8.approvals.list().forEach(function(a){if(a.kind==='template'||!a.status||a.status==='pending'||a.status==='queued')return;var at=pd(a.decided_at);if(!isToday(at)||(me&&a.decided_by&&a.decided_by!==me))return;
  var b=bkey(a),g=by[b]=by[b]||{k:'dr-'+b,type:'drafts',ids:[],ok:0,kill:0,sent:0,title:a.batch_label||(LANG==='he'?'טיוטות':'Drafts'),pid:a.product,at:0};g.ids.push(a.id);if(a.status==='killed')g.kill++;else g.ok++;if(a.status==='sent')g.sent++;if(at>g.at)g.at=at;if(g.pid!==a.product)g.pid=null;});
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
 var prim=g.href?'<a class="do" href="'+hesc(g.href)+'" target="_blank" rel="noopener" data-a="do" data-k="'+k+'">'+inner+'</a>':'<button class="do" data-a="'+(g.done?'done':'do')+'" data-k="'+k+'">'+inner+'</button>';
 return '<div class="abar" role="group" aria-label="'+esc(t('actions'))+'">'+prim+'<button class="cm" data-a="comment" data-k="'+k+'">'+ic('comment')+'<span>'+t('comment')+'</span></button><button data-a="later" data-k="'+k+'">'+ic('later')+'<span>'+t('later')+'</span></button><button data-a="no" data-k="'+k+'">'+ic('no')+'<span>'+t('notNeeded')+'</span></button></div>';}
function urgChip(i){if(i.wo&&i.wo.length)return chip('',"lock",t('wTask'));if(i.sev==='r')return chip('now','now',t('wNow'));if(i.sev==='o'||i.sev==null)return chip('you','today',t('wToday'));return chip('','cal',t('wWeek'));}
function minsChip(i){return isNum(i.mins)?chip('plain','time',t(i.est?'minEst':'min',{n:i.mins})):'';}
function whyLine(i){var w=mentor(i);return w?'<p class="why">'+ic('key')+'<span dir="auto">'+esc(w)+'</span></p>':'';}
function whereOf(i){var g=doTarget(i);if(g.draft||g.done&&(i.held||i.batch))return t('hereJ8');if(g.talk)return t('whereTalk');if(g.jump==='control')return t('whereCtl');if(g.jump)return t('hereJ8');
 if(g.href){var h='';try{h=new URL(g.href).hostname.replace(/^www\./,'');}catch(e){}return g.label+(h?' ('+h+')':'');}return '';}
function howOf(i){if(i.task)return String(i.task.action||'');if(i.batch)return t('howBatch');if(i.held)return i.held.why+': '+i.held.items.map(apWho).join(', ');if(i.c)return askLine(i.c);if(i.p)return sevStrip(String(i.full||'').trim());if(i.ap)return i.ap.warn||'';return '';}
function facts(i){var w=whereOf(i),h=howOf(i),dw=dwOf(i.task),a=dw?th('afterSwitch',{s:dwName(dw)}):(doTarget(i).href?t('afterOut'):'');
 if(!w&&!h)return '';return '<dl class="facts">'+(w?'<div class="fact"><dt>'+t('where')+'</dt><dd dir="auto">'+esc(w)+'</dd></div>':'')+(h&&h!==cap1(nextOf(i).what)?'<div class="fact"><dt>'+t('how')+'</dt><dd dir="auto">'+esc(h)+'</dd></div>':'')+(a?'<div class="fact"><dt>'+t('after')+'</dt><dd>'+a+'</dd></div>':'')+'</dl>';}
function itemBody(i){return whyLine(i)+'<div class="chips">'+urgChip(i)+minsChip(i)+(i.ul.length?chip('gain','key',(LANG==='he'?'משחרר ':'Frees ')+i.ul.length):'')+'</div>'+abar(i)+facts(i);}
function goldCard(i){var n=nextOf(i),pid=rowPid(i),p=pobj(pid);
 return '<section class="first" aria-labelledby="fH"><div class="in"><span class="ftag">'+g8()+t('first')+'</span><h3 id="fH" dir="auto">'+esc(cap1(n.what))+'</h3>'+whyLine(i)
  +'<div class="chips">'+urgChip(i)+minsChip(i)+(pid?'<span class="chip plain">'+tile(pid,'sm')+'<bdi>'+esc(p?p.name:pname(pid))+'</bdi></span>':'')+'</div>'+abar(i)+facts(i)+'</div></section>';}
function rowItem(i){var o=UI.open[i.key],n=nextOf(i),pid=rowPid(i),p=pobj(pid);
 return '<div class="row'+(o?' open':'')+'" id="r-'+esc(i.key)+'"><button class="rbtn" aria-expanded="'+(o?'true':'false')+'" data-a="row" data-k="'+esc(i.key)+'">'+tile(pid)+'<span class="rt"><b dir="auto">'+esc(cap1(n.what))+'</b><span class="sub" dir="auto">'+esc(p?p.name:(i.sub||pname(pid)))+(isNum(i.mins)?', '+t(i.est?'minEst':'min',{n:i.mins}):'')+'</span><span class="chips">'+urgChip(i)+(i.ul.length?chip('gain','key',(LANG==='he'?'משחרר ':'Frees ')+i.ul.length):'')+'</span></span>'+ic('down','chev')+'</button>'
  +(o?'<div class="rmore">'+itemBody(i)+'</div>':'')+'</div>';}
function doneBlock(D,isOpen,label,undoable){if(!D.length)return '';
 return '<details class="grp done" data-k="doneOpen"'+(isOpen?' open':'')+'><summary>'+ic('check')+'<span>'+(label||t('doneToday'))+'</span><span class="n">'+D.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+D.map(function(x){
  return '<div class="drow">'+tile(x.pid)+'<span class="rt"><b dir="auto" class="strike">'+esc(x.title)+'</b><span class="sub">'+esc(x.word)+(x.at?', '+hm2(x.at):'')+(x.freed?'. '+(LANG==='he'?'שחרר ':'Freed ')+x.freed:'')+'</span></span>'
   +(undoable===false||(x.type==='drafts'&&x.sent===x.ids.length)?'':'<button class="undo" data-a="undo" data-k="'+esc(x.k)+'">'+ic('undo')+'<span>'+t('undo')+'</span></button>')+'</div>';}).join('')+'</div></details>';}
function plannedBlock(){var L=plannedRows();if(!L.length)return '';
 return '<details class="grp" data-k="plannedOpen"'+(UI.open.plannedOpen?' open':'')+'><summary>'+ic('later')+'<span>'+t('planned')+'</span><span class="n">'+L.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+L.map(function(r){var i=rowByKey(r.id);
  return '<div class="drow">'+tile(i?rowPid(i):null)+'<span class="rt"><b dir="auto">'+esc(r.title||r.id)+'</b><span class="sub">'+esc(t('comesBack',{w:whenStr(pd(r.come_back_at))}))+'</span></span><button class="undo" data-a="later-now" data-k="'+esc(r.id)+'">'+ic('undo')+'<span>'+t('now')+'</span></button></div>';}).join('')+'</div></details>';}
function parkedBlock(){var L=parkedAsks();if(!L.length)return '';
 return '<details class="grp park" data-k="parkOpen"'+(UI.open.parkOpen?' open':'')+'><summary>'+ic('lock')+'<span>'+t('parkedGrp')+'</span><span class="n">'+L.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+L.map(rowItem).join('')+'</div></details>';}
function vToday(){var tt=th('dayTitle',{d:dayStr()});
 if(!connected)return brief({title:tt,what:t('todayWhat'),need:t('loading'),gain:t('loading')})+'<p class="lead" role="status">'+t('loadingDay')+'</p><div class="skel"></div><div class="skel"></div><div class="skel"></div>';
 var N=myQueue(),f=N[0],D=doneToday(),tot=D.length+N.length,h='';
 if(J8.status().error==='offline'){var sa=UI.syncedAt?hm2(UI.syncedAt):'—';h+=stateBox('red','wifi',t('noConn'),t('noConnP',{t:sa}),t('tryAgain'),'retry')+'<p class="lead saved">'+esc(t('savedCopy',{t:sa}))+'</p>';}
 if(!f){var tm=tasksAll().filter(function(x){return x.owner!=='dave'&&(!x.status||x.status==='open');}).length;
  return h+brief({title:tt,what:t('todayWhat'),need:t('nothingNow'),gain:tm?t('teamKeeps',{n:tm}):t('goldGain'),prog:prog(tot,tot,t('nOfDone',{a:tot,b:tot}))})+stateBox('teal','check',t('allClear'),t('allClearP'),t('seeFlow'),'nav-flow')+plannedBlock()+doneBlock(D,true);}
 var m=sumMins(N);
 h+=brief({title:tt,what:t('todayWhat'),need:k1(stepsTxt(N.length))+minsTxt(N)+'.',gain:f.ul.length?k1(thingsTxt(f.ul.length))+' '+t('moveAfterGold'):f.money?t('goldMoney'):t('goldGain'),prog:prog(D.length,tot,t('nOfDone',{a:D.length,b:tot}))});
 if(ls('j8-coach')!==0&&J8.status().error!=='offline')h+='<aside class="coach" aria-label="'+esc(t('help'))+'">'+ic('help')+'<p>'+t('coach')+'</p><button class="btn" data-a="coach-off">'+t('gotIt')+'</button></aside>';
 h+=goldCard(f);
 var th3=N.slice(1,4),rest=N.slice(4);
 if(th3.length)h+='<h2 class="sec">'+t('then')+' <span class="n">'+th3.length+'</span></h2><div class="list">'+th3.map(rowItem).join('')+'</div>';
 h+=plannedBlock()+parkedBlock();
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
 if(top)h+='<section class="hero"><span class="ftag">'+g8()+t('startHere')+'</span><h3 dir="auto">'+esc(deptName(top.u))+'</h3><p>'+esc(top.N.length===1?t('steps1'):t('stepsN',{n:top.N.length})+minsTxt(top.N)+'.')+(top.first?' '+t('inclFirst'):'')+'</p><button class="btn act wide big" data-a="dept" data-id="'+esc(top.id)+'">'+ic('do','flip')+'<span>'+th('open',{x:deptName(top.u)})+'</span></button></section>';
 h+='<h2 class="sec">'+t('departments')+' <span class="n">'+act.length+'</span></h2><div class="list">'+act.map(function(g){var lead=g.P.slice().sort(function(a,b){return projNeed(b.id).length-projNeed(a.id).length;})[0];
  return '<div class="row"><button class="rbtn" data-a="dept" data-id="'+esc(g.id)+'">'+tile(lead.id)+'<span class="rt"><b dir="auto">'+esc(deptName(g.u))+'</b><span class="sub" dir="auto">'+esc(cut(g.P.map(function(p){return p.name;}).join(', '),120))+'</span><span class="chips">'+(g.N.length?chip('you','you',t('forYou',{n:g.N.length})):chip('','team',t('teamHasIt')))+(g.far?chip('gain','up',t('furthest',{s:stg(g.far)})):'')+'</span></span>'+ic('fwd','chev go flip')+'</button></div>';}).join('')+'</div>';
 if(empty.length)h+='<p class="lead mt">'+esc(t('noProjects',{x:empty.map(function(g){return deptName(g.u);}).join(', ')}))+'</p>';
 return h;}
function track(p){var s=stageOf(p);return '<ol class="track" aria-label="'+esc(s?t('stageOf',{a:s})+', '+stg(s):t('noStage'))+'">'+FSTG.map(function(n,k){return '<li class="st'+(k+1)+(k+1<s?' past':k+1===s?' cur':'')+'">'+stg(k+1)+'</li>';}).join('')+'</ol>';}
function whoChip(h){return h==='me'?'<span class="who you">'+ic('you')+t('nextYou')+'</span>':h==='ext'?'<span class="who out">'+ic('out')+t('nextOut')+'</span>':'<span class="who team">'+ic('team')+t('nextTeam')+'</span>';}
function lane(p){var M=mineBy(),w=projNeed(p.id).length,s=stageOf(p);
 return '<button class="lane" data-a="proj" data-id="'+esc(p.id)+'">'+tile(p.id)+'<span class="rt"><b dir="auto">'+esc(p.name)+'</b>'+track(p)+'<span class="sub"><span>'+(s?t('nowStage',{s:'<b class="tk st'+s+'">'+stg(s)+'</b>'}):t('noStage'))+'</span>'+whoChip(holderOf(p,M))+(w?'<span class="who you">'+t('forYou',{n:w})+'</span>':'')+(p.status==='parked'?chip('','lock',t('parked')):'')+'</span></span>'+ic('fwd','chev go flip')+'</button>';}
function unitById(id){return id==='_'?null:graph().un[id]||null;}
function vDept(){var g=studioUnits().filter(function(x){return x.id===UI.dept;})[0];if(!g)return vStudio();
 var P=g.P.slice().sort(function(a,b){return projNeed(b.id).length-projNeed(a.id).length||stageOf(b)-stageOf(a);});
 return brief({crumbs:crumbs([['studio',t('studio')]]),title:esc(deptName(g.u)),what:P.length===1?t('dWhat1'):t('dWhat',{n:P.length}),need:g.N.length?k1(stepsTxt(g.N.length))+minsTxt(g.N)+'.':t('sNeed0'),gain:t('dGain')})
  +'<div class="list mt">'+P.map(lane).join('')+'</div>';}
function nextGoal(p){var n=String(p.next||'').trim(),m=n.match(/^(Concept|Build|Staged|Validate|Monetize|Paying)\s*:\s*(.+)$/i),map={concept:'Idea',build:'Build',staged:'Beta',validate:'Validate',monetize:'Launch',paying:'Paying'};
 if(m)return {s:map[m[1].toLowerCase()],x:m[2].replace(/\.$/,'')};var s=stageOf(p);return n?{s:stg(Math.min(6,s+1))||stg(1),x:n.replace(/\.$/,'')}:null;}
function teamRow(tk){var bl=openBlk(tk.id),u=DEPT[tk.owner]||tk.owner||t('team');
 return '<div class="row"><button class="rbtn" data-a="thread-task" data-id="'+esc(tk.id)+'"><span class="tile ppl">'+ic('team')+'</span><span class="rt"><b dir="auto">'+esc(tk.title)+'</b><span class="sub" dir="auto">'+esc(u)+(bl.length?', '+t('waitsOn',{x:itemNames(bl,2)}):tk.due?', '+t('ready',{d:dlabel(tk.due)}):'')+'</span></span>'+ic('comment','chev ppl')+'</button></div>';}
function pcount(p){var T=tasksAll().filter(function(x){return x.project_id===p.id;}),A=J8.approvals.list().filter(function(a){return a.product===p.id&&a.status!=='killed'&&a.kind!=='template';}),tot=T.length+A.length,dn=T.filter(function(x){return x.status==='done';}).length+A.filter(function(a){return a.status==='sent';}).length;
 return tot?'<p class="pcount"><bdi><b>'+dn+'</b> '+(LANG==='he'?'מתוך '+tot+' צעדים בוצעו':'of '+tot+' steps done')+'</bdi></p>':'';}
function vProj(){var p=pobj(UI.proj);if(!p)return vStudio();var u=unitOf(p),s=stageOf(p),mine=projNeed(p.id),pk=mine.length?null:parkedAsks().filter(function(i){return i.p.id===p.id;})[0],y=mine[0]||pk,ng=nextGoal(p),h='';
 var cr=crumbs([['studio',t('studio')],['dept:'+(u?u.id:'_'),deptName(u)]]);
 h+=brief({crumbs:cr,title:esc(p.name),what:(s?t('pWhat',{s:'<b class="tk st'+s+'">'+stg(s)+'</b>',a:s}):t('noStage'))+(p.now?' <span class="pnow">'+esc(cut(sevStrip(p.now),160))+'</span>':''),
  need:pk?th('parkedNeed',{x:cap1(nextOf(pk).what)}):y?esc(cap1(nextOf(y).what))+(isNum(y.mins)?', '+t(y.est?'minEst':'min',{n:y.mins}):'')+'.':t('pNeed0'),gain:ng?t('pGain',{s:'<b class="k">'+esc(ng.s)+'</b>',x:esc(cut(ng.x,120))})+(/[.!?]$/.test(ng.x)?'':'.'):t('pGainP'),prog:'<div class="trackwrap">'+track(p)+pcount(p)+'</div>'});
 if(y){h+='<section class="hero" aria-labelledby="yH"><span class="ftag">'+(pk?ic('lock')+t('parkedGrp'):g8()+t('yourNext'))+'</span><h3 id="yH" dir="auto">'+esc(cap1(nextOf(y).what))+'</h3>'+itemBody(y)+'</section>';
  if(mine.length>1)h+='<h2 class="sec">'+t('alsoYours')+' <span class="n">'+(mine.length-1)+'</span></h2>'+capL(mine.slice(1),3,rowItem,'mineAll-'+p.id);}
 var team=tasksAll().filter(function(x){return x.project_id===p.id&&x.owner!=='dave'&&(!x.status||x.status==='open');});
 if(team.length)h+='<h2 class="sec">'+t('teamOn')+' <span class="n">'+team.length+'</span></h2>'+capL(team,4,teamRow,'teamAll-'+p.id);
 var hold=J8.approvals.list().filter(function(a){return a.product===p.id&&a.kind!=='template'&&(a.status==='approved'||a.status==='edited'||a.status==='queued');});
 if(hold.length)h+='<details class="grp" data-k="hold-'+esc(p.id)+'"'+(UI.open['hold-'+p.id]?' open':'')+'><summary>'+ic('lock')+'<span>'+t('approvedWait')+'</span><span class="n">'+hold.length+'</span>'+ic('down','chev')+'</summary><ul class="names">'+hold.map(function(a){return '<li dir="auto">'+esc(apKind(a)+': '+apWho(a))+'</li>';}).join('')+'</ul></details>';
 var D=tasksAll().filter(function(x){return x.project_id===p.id&&x.status==='done';}).sort(function(a,b){return String(b.done_at||'').localeCompare(String(a.done_at||''));});
 if(D.length)h+='<details class="grp done" data-k="pd-'+esc(p.id)+'"'+(UI.open['pd-'+p.id]?' open':'')+'><summary>'+ic('check')+'<span>'+t('doneHere2')+'</span><span class="n">'+D.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+D.map(function(x){
  return '<div class="drow"><button class="dlink" data-a="thread-task" data-id="'+esc(x.id)+'"><b dir="auto" class="strike">'+esc(x.title)+'</b><span class="sub">'+t('doneW')+(x.done_at?', '+esc(fdate(x.done_at)):'')+(x.unlocked_on_done?'. '+(LANG==='he'?'שחרר ':'Freed ')+x.unlocked_on_done:'')+'</span></button>'+(x.owner==='dave'?'<button class="undo" data-a="untick" data-id="'+esc(x.id)+'">'+ic('undo')+'<span>'+t('undo')+'</span></button>':'')+'</div>';}).join('')+'</div></details>';
 var lk=(p.link?'<a class="btn go" href="'+hesc(p.link)+'" target="_blank" rel="noopener">'+ic('link')+'<span dir="auto">'+esc(p.link_text||(LANG==='he'?'לפתוח את הפרויקט':'Open the project'))+'</span></a>':'');
 if(lk)h+='<div class="links">'+lk+'</div>';
 var pm1=J8.inbox.forProject(p.id).filter(function(x){return !x.task_id&&!x.approval_id;})[0],last=pm1?lastTeamLine(pm1):null;
 h+='<h2 class="sec" id="pcH">'+th('commentOn',{x:p.name})+'</h2><p class="lead">'+th('commentLead',{t:deptName(u)})+'</p>'
  +'<div class="pinc"><form class="cbox" data-ans="'+esc(p.id)+'"><label class="sr" for="pc-'+esc(p.id)+'">'+t('yourComment')+'</label><textarea id="pc-'+esc(p.id)+'" rows="1" dir="auto" placeholder="'+esc(t('writeC'))+'"></textarea><button class="btn" type="submit">'+ic('send','flip')+'<span>'+t('send')+'</span></button></form></div>'
  +(last?'<button class="lastline" data-a="thread-proj" data-id="'+esc(p.id)+'">'+sevChip(last.v)+'<span dir="auto">'+esc(last.x)+'</span></button>':'');
 return h;}

/* ---------- Draft: read, decide, move on ---------- */
function openDraft(bid){UI.draftFrom=UI.v==='draft'?UI.draftFrom:(UI.v==='today'||UI.v==='talk'||UI.v==='flow')?UI.v:'studio';var L=bid.indexOf('ap:')===0?[bid.slice(3)]:apPending().filter(function(a){return bkey(a)===bid;}).map(function(a){return a.id;});
 if(!L.length){toast(t('allClearT'));return;}UI.batch=bid;UI.dids=L;UI.editing=false;goV('draft');}
function isPend(id){var a=AP[id];return !!a&&(!a.status||a.status==='pending');}
function vDraft(){var L=UI.dids||[],cur=L.filter(isPend)[0],a=cur?Object.assign({id:cur},AP[cur]):null,first=AP[L[0]]||{},pid=first.product,p=pobj(pid),u=unitOf(p);
 var cr=[];if(UI.draftFrom&&UI.draftFrom!=='studio')cr.push([UI.draftFrom,t(UI.draftFrom)]);else{cr.push(['studio',t('studio')]);if(u||p)cr.push(['dept:'+(u?u.id:'_'),deptName(u)]);if(p)cr.push(['proj:'+p.id,p.name]);}cr=crumbs(cr);
 var dec=L.filter(function(id){return !isPend(id);}).length,ctl=J8.control.get()||{},off=!ctl.email_from_ok;
 if(!a){var ok=L.filter(function(id){var s=(AP[id]||{}).status;return s==='approved'||s==='edited'||s==='sent'||s==='queued';}).length,kl=L.filter(function(id){return (AP[id]||{}).status==='killed';}).length,nx=myQueue()[0];
  return brief({crumbs:cr,title:th('allDecided',{n:L.length}),what:esc(first.batch_label||(p?p.name:'')),need:t('adNeed'),gain:th('adGain',{a:ok,k:kl}),prog:prog(L.length,L.length,t('allDecided',{n:L.length}))})
   +(nx?'<section class="hero"><span class="ftag">'+g8()+t('nextForYou')+'</span><h3 dir="auto">'+esc(cap1(nextOf(nx).what))+'</h3>'+whyLine(nx)+'<button class="btn act wide big" data-a="nav" data-id="today">'+ic('do','flip')+'<span>'+t('goToday')+'</span></button></section>':'');}
 var k=L.indexOf(cur)+1,txt=J8.approvals.textOf(a),bl=openBlk(a.id),isMail=/mail/i.test(String(a.kind||'')+' '+String(a.channel||''));
 var h=brief({crumbs:cr,dir:LANG==='he'?'rtl':'auto',title:t('draftN',{k:'<bdi>'+esc(apKind(a))+'</bdi>',i:'<bdi>'+k+'</bdi>',n:'<bdi>'+L.length+'</bdi>'}),what:th('draftWhat',{x:apWho(a)}),need:t('draftNeed'),gain:isMail&&off?t('draftGainOff'):t('draftGain'),prog:prog(dec,L.length,(LANG==='he'?dec+' מתוך '+L.length+' הוחלטו':dec+' of '+L.length+' decided'))});
 if(isMail&&off)h+='<p class="held">'+ic('lock')+'<span>'+t('emailOff')+'</span></p>';
 if(bl.length)h+='<p class="held">'+ic('lock')+'<span dir="auto">'+th('waitsBlock',{x:itemNames(bl,2)})+'</span></p>';
 h+='<dl class="dmeta"><div><dt>'+t('to')+'</dt><dd dir="auto">'+esc(a.to||'—')+'</dd></div>'+(a.channel?'<div><dt>'+t('channel')+'</dt><dd dir="auto">'+esc(a.channel)+'</dd></div>':'')+(p?'<div><dt>'+t('project')+'</dt><dd dir="auto">'+esc(p.name)+'</dd></div>':'')+'</dl>';
 if(a.warn)h+='<p class="note"><b>'+t('teamNote')+':</b> <span dir="auto">'+esc(a.warn)+'</span></p>';
 if(UI.editing)return h+'<form class="edit" data-f="edit"><label class="sr" for="ed-'+esc(a.id)+'">'+t('edit')+'</label><textarea id="ed-'+esc(a.id)+'" dir="auto">'+esc(txt)+'</textarea><div class="abar two"><button class="do" type="submit">'+ic('check')+'<span>'+t('save')+'</span></button><button type="button" data-a="edit-cancel">'+ic('back','flip')+'<span>'+t('cancel')+'</span></button></div></form>';
 h+='<article class="letter" dir="auto">'+(a.subject?'<h3>'+esc(a.subject)+'</h3>':'')+esc(txt)+'</article>'+(a.link?'<p class="mt"><a class="btn go" href="'+hesc(a.link)+'" target="_blank" rel="noopener">'+ic('link')+'<span dir="auto">'+esc(a.link_text||t('openLink'))+'</span></a></p>':'');
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
 var PB=UI.blockedOnly?P.filter(projBlocked):P;
 h+='<h2 class="sec">'+t('everyProject')+' <span class="n">'+PB.length+'</span></h2><p class="lead">'+t('everyLead')+'</p><button class="btn tgl mt" data-a="blocked-only" aria-pressed="'+(UI.blockedOnly?'true':'false')+'">'+ic('lock')+'<span>'+t('blockedOnly')+'</span></button>'+(PB.length?capL(PB,5,lane,'pbAll',' mt'):'<div class="list mt"><p class="lead pad">'+t('noBlocked')+'</p></div>');
 var wk=Date.now()-7*864e5,still=P.filter(function(p){if(p.status==='parked')return false;var lm=lastMove(p);return lm!==-Infinity&&lm<wk;});
 if(still.length)h+='<details class="grp" data-k="still"'+(UI.open.still?' open':'')+'><summary>'+ic('later')+'<span>'+t('noMove')+'</span><span class="n">'+still.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+still.map(lane).join('')+'</div></details>';
 var ext=P.filter(function(p){return p.milestone_by==='external';});
 if(ext.length)h+='<details class="grp" data-k="ext"'+(UI.open.ext?' open':'')+'><summary>'+ic('out')+'<span>'+t('waitOutside')+'</span><span class="n">'+ext.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+ext.map(function(p){return '<button class="ag" data-a="proj" data-id="'+esc(p.id)+'"><time>'+esc(p.milestone_at?dlabel(p.milestone_at).replace(/ \d\d:\d\d$/,''):'—')+'</time><span class="rt"><b dir="auto">'+esc(p.name)+'</b><span class="sub" dir="auto">'+esc(cut(p.milestone||'',90))+'</span></span></button>';}).join('')+'</div></details>';
 if(D.length)h+='<details class="grp mapdone" data-k="mapdone"'+(UI.open.mapdone?' open':'')+'><summary>'+ic('check')+'<span>'+t('doneProjects')+'</span><span class="n">'+D.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+D.map(lane).join('')+'</div></details>';
 var td=ymd(new Date()),lim=ymd(new Date(now+14*864e5)),E=events(),up=E.filter(function(e){return e.day>=td&&e.day<=lim;}).sort(function(x,y){return (x.day+(x.time||'99')).localeCompare(y.day+(y.time||'99'));}),over=E.filter(function(e){return e.day<td;});
 var ag=function(e,past){return '<button class="ag" data-a="jump" data-id="'+esc(e.jump||'')+'"><time>'+esc(past?dlabel(e.day).replace(/^\w+ /,''):dlabel(e.day+(e.time?'T'+e.time:'')).replace(/ \d\d:\d\d$/,'')+(e.time?' '+e.time:''))+'</time><span class="rt"><b dir="auto">'+esc(cut(e.title,80))+'</b><span class="sub">'+whoChip(e.who==='me'?'me':e.who==='ext'?'ext':'team')+'<span dir="auto">'+esc(cut(e.sub||'',60))+'</span></span></span></button>';};
 h+='<h2 class="sec">'+t('comingUp')+(up.length?' <span class="n">'+up.length+'</span>':'')+'</h2>'+(up.length?'<div class="list">'+up.slice(0,10).map(function(e){return ag(e);}).join('')+'</div>':'<p class="lead">'+t('nothingDated')+'</p>');
 if(over.length)h+='<details class="grp" data-k="over"'+(UI.open.over?' open':'')+'><summary>'+ic('later')+'<span>'+t('slotPassed')+'</span><span class="n">'+over.length+'</span>'+ic('down','chev')+'</summary><div class="list">'+over.sort(function(x,y){return x.day.localeCompare(y.day);}).slice(0,12).map(function(e){return ag(e,true);}).join('')+'</div></details>';
 var TR=teamRows();if(TR.length)h+='<h2 class="sec">'+t('teamNow')+' <span class="n">'+TR.length+'</span></h2>'+capL(TR,4,teamRowHTML,'trAll');
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
 var P=projList().filter(function(p){return p.id!=='p-general';}),SC=['#838EB7','#2A44C6','#202663','#FF9700','#2AB9FF','#32CC00'] /* 11.3: stage spectrum from the J8NIX palette */,sg=J8.projects.STAGES.map(function(s,i){return {k:FSTG[i],v:P.filter(function(p){return p.stage===i+1;}).length,c:SC[i]};});
 var ns=P.filter(function(p){return !isNum(p.stage);}).length;if(ns)sg.push({k:'No stage',v:ns,c:'#D8D8D8'});
 h+='<div class="pair"><section class="st"><h3>Projects by stage</h3>'+donut(sg,'Projects by stage')+'</section>'
  +'<section class="st"><h3>Drafts</h3>'+donut([{k:'Waiting',v:wt,c:'#FF9700',keep:1},{k:'Approved',v:ap,c:'#586475',keep:1},{k:'Sent',v:sn,c:'#32CC00',keep:1},{k:'Killed',v:kl,c:'#C9D0E4',keep:1}],'Drafts by status')+'</section></div>';
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
 var Q=askRows(),q=Q.filter(function(i){return i.key===UI.ask;})[0]||Q[0],h='<div class="tk-top" id="tkTop">';
 h+=brief({title:Q.length>1?th('tTitle',{n:Q.length}):Q.length?t('tTitle1'):t('tTitle0'),what:t('tWhat'),need:Q.length?t('tNeed',{n:k1(Q.length)}):t('tNeed0'),gain:t('tGain')});
 if(q){var x=q.c,u=firstUrl(x.reply),tm=pDept(x.p);
  h+='<section class="hero talkq" aria-labelledby="qH"><span class="ftag ppl">'+ic('team')+th('asks',{t:x.p==='p-general'?t('team'):tm})+'</span><h3 id="qH" dir="auto">'+esc(q.title)+'</h3><p class="sub" dir="auto">'+esc(pname(x.p))+(x.at?', '+esc(tm1(x.at)):'')+'</p>'
   +(askLine(x)!==q.title?'<p dir="auto">'+esc(askLine(x).replace(/https?:\/\/\S+/g,'').trim())+'</p>':'')+(u?'<p class="mt"><a class="btn go" href="'+hesc(u)+'" target="_blank" rel="noopener">'+ic('link')+'<span>'+t('openLink')+'</span></a></p>':'')
   +'<form class="cbox ans-hero" data-ans="'+esc(x.p)+'" data-ask="'+esc(q.key)+'"><label class="sr" for="aq">'+t('answerPh')+'</label><textarea id="aq" rows="2" dir="auto" placeholder="'+esc(t('answerPh'))+'"></textarea><button class="btn act" type="submit">'+ic('send','flip')+'<span>'+t('send')+'</span></button></form></section>';
  if(Q.length>1)h+='<h2 class="sec">'+t('moreQ')+' <span class="n">'+(Q.length-1)+'</span></h2><div class="list">'+Q.filter(function(i){return i!==q;}).map(function(i){return '<div class="row"><button class="rbtn" data-a="ask" data-k="'+esc(i.key)+'">'+tile(i.c.p)+'<span class="rt"><b dir="auto">'+esc(i.title)+'</b><span class="sub" dir="auto">'+esc(pname(i.c.p))+'</span></span>'+ic('fwd','chev flip')+'</button></div>';}).join('')+'</div>';}
 var A=J8.inbox.list().filter(function(x){return (x.task_id||x.approval_id||(x.p&&x.p!=='p-general'))&&lastTeamLine(x);}).slice(0,8);
 var AR=function(x){var tg=msgTarget(x),tt=targetTitle(tg),l=lastTeamLine(x);
  return '<div class="row"><button class="rbtn" data-a="thread-msg" data-id="'+esc(x.id)+'">'+tile(tt.pid||x.p)+'<span class="rt"><b dir="auto">'+esc(tt.title)+'</b><span class="sub">'+esc(t('tAnswered',{t:pDept(tt.pid||x.p),h:l.t||tm1(x.updated_at)}))+'</span><span class="chips">'+(x.status==='done'?chip('done','check',t('answered')):chip('talk','team',t('withTeam')))+'</span></span>'+ic('fwd','chev flip')+'</button></div>';};
 if(A.length)h+='<h2 class="sec">'+t('answers')+' <span class="n">'+A.length+'</span></h2><div class="list">'+A.slice(0,3).map(AR).join('')+'</div>'+(A.length>3?'<details class="grp" data-k="ansAll"'+(UI.open.ansAll?' open':'')+'><summary><span>'+t('showAll',{n:A.length})+'</span></summary><div class="list">'+A.slice(3).map(AR).join('')+'</div></details>':'');
 h+='</div><div class="tk-log" id="tkLog" data-n="'+J8.inbox.list(60).length+'"><h2 class="sec">'+t('updates')+'</h2><p class="lead">'+esc(sinceLine())+'</p><div class="msgs" id="j8cLog" aria-live="polite">'+talkLog()+'</div></div>';
 h+='<div class="tk-c"><div class="ch-strip" id="j8cStrip"></div><form class="cbox" id="j8cForm" autocomplete="off"><label class="sr" for="j8cIn">'+t('msgTeam')+'</label><textarea id="j8cIn" rows="1" dir="auto" placeholder="'+esc(t('msgTeam'))+'"></textarea><button class="btn" type="submit" id="j8cGo">'+ic('send','flip')+'<span>'+t('send')+'</span></button></form><p class="lead mt" id="j8cNote"></p><p class="lead tkh">'+t('talkHint')+'</p><button type="button" class="newpill" id="tkNew" data-a="tk-new" hidden>'+ic('down')+'<span>'+t('newMsgs')+' ↓</span></button></div>';
 return h;}
function capL(L,n,fn,key,cls){var o='<div class="list'+(cls||'')+'">'+L.slice(0,n).map(fn).join('')+'</div>';if(L.length>n)o+='<details class="grp" data-k="'+key+'"'+(UI.open[key]?' open':'')+'><summary><span>'+t('showAll',{n:L.length})+'</span>'+ic('down','chev')+'</summary><div class="list">'+L.slice(n).map(fn).join('')+'</div></details>';return o;}
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
function gOpen(html,col){lastFocus=document.activeElement;var s=$('gsheet');s.classList.remove('thr');s.style.setProperty('--sh',col||'var(--navy)');s.innerHTML='<div class="grab" aria-hidden="true"></div>'+html;s.hidden=false;$('scrim').hidden=false;var f=s.querySelector('h2');if(f){f.tabIndex=-1;f.focus();}}
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
 var keep=$('gth')&&!$('gsheet').hidden?$('gth').value:'',wasT=$('gsheet').classList.contains('thr'),mm=wasT&&$('gsheet').querySelector('.msgs'),atB=!mm||mm.scrollHeight-mm.scrollTop-mm.clientHeight<48,y0=mm?mm.scrollTop:0;gOpen(h,'var(--orchid)');if(keep)$('gth').value=keep;
 var g=$('gsheet'),m2=g.querySelector('.msgs');g.classList.add('thr');if(m2)m2.scrollTop=atB?m2.scrollHeight:y0;}
function laterTimes(){var n=new Date(),a=new Date(n);a.setHours(20,30,0,0);var o=[];
 if(a-n>36e5)o.push(['tonight',a.getTime()]);else o.push(['in3h',n.getTime()+3*36e5]);
 var b=new Date(n);b.setDate(b.getDate()+1);b.setHours(8,30,0,0);o.push(['tomorrow',b.getTime()]);
 var c=new Date(n);c.setDate(c.getDate()+((7-c.getDay())%7||7));c.setHours(8,30,0,0);if(c-b<864e5)c.setDate(c.getDate()+7);o.push(['nextWeek',c.getTime()]);return o;}
function laterSheet(k){var i=rowByKey(k);if(!i)return;UI.gsheet={k:'later'};
 gOpen('<h2 id="gTitle">'+t('laterQ')+'</h2><p class="lead" dir="auto">'+esc(cap1(nextOf(i).what))+'</p>'+laterTimes().map(function(o){return '<button class="opt" data-a="later-pick" data-k="'+esc(k)+'" data-w="'+o[1]+'" data-l="'+o[0]+'">'+ic('later')+'<span>'+t(o[0])+'</span><small>'+esc(whenStr(o[1]))+'</small></button>';}).join('')
  +'<p class="lead mt">'+esc(t('laterNote'))+'</p><button class="btn wide mt" data-a="gclose">'+t('cancel')+'</button>','var(--slate)');}
/* (7.1.1: the batch confirm is part of nnSheet below) */

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
/* ---------- Not needed (7.1.1, verifier FAIL 1/2/7): always asked first, and it says what happens to what waits ----------
   task: nothing waits → close it · things wait → "Let them go" (they may go out) / "Kill them too" / Cancel; until Dave picks,
   nothing changes, so what it blocks stays held. batch → Kill all N. held send → "Back to waiting for your OK" (pending) /
   "Kill these N". payment request → Kill it. project line / team question → tell the team. Every path has Undo. */
function depsOf(id){return reach(id).slice();} /* everything that waits on it, through chains (the same count as "This frees N") */
function teamPid(i){return i.p?i.p.id:i.c?i.c.p:i.held?((i.held.items[0]||{}).product||'p-general'):i.ap?(i.ap.product||'p-general'):(rowPid(i)||'p-general');}
function notNeeded(k){var i=rowByKey(k);if(!i)return;UI.gsheet={k:'nn'};var what=cap1(nextOf(i).what),h='<h2 id="gTitle">'+t('nnQ')+'</h2><p class="lead" dir="auto">'+esc(what)+'</p>';
 var b=function(a,cls,icn,lab){return '<button class="btn wide mt'+(cls?' '+cls:'')+'" data-a="'+a+'" data-k="'+esc(k)+'">'+ic(icn)+'<span>'+lab+'</span></button>';},names=function(ids){return '<ul class="names">'+ids.slice(0,8).map(function(id){var x=graph().it[id];return '<li dir="auto">'+esc(x?(x.k==='approval'?apKind(x.o)+': '+apWho(x.o):x.k==='project'?x.o.name:x.o.title):id)+'</li>';}).join('')+(ids.length>8?'<li>'+esc(t('andMore',{n:ids.length-8}))+'</li>':'')+'</ul>';};
 if(i.batch){var n=i.batch.items.length;h+='<p class="mt">'+esc(t('noBatchP',{n:n}))+'</p>'+b('nn-batch','killo','kill',esc(t('killAll',{n:n})));}
 else if(i.task){var dep=depsOf(i.task.id);
  if(dep.length)h+='<p class="mt">'+th('nnDeps',{n:dep.length,x:plainNames(dep)})+'</p>'+names(dep)+'<p class="lead mt">'+t('nnHeld')+'</p>'+b('nn-let','','do',t('letGo'))+b('nn-killdeps','killo','kill',t('killToo'));
  else h+='<p class="mt">'+t('nnTaskP')+'</p>'+b('nn-yes','','no',t('nnYes'));}
 else if(i.held){var hn=i.held.items.length;h+='<p class="mt">'+th('nnHeldP',{n:hn})+'</p>'+names(i.held.items.map(function(a){return a.id;}))+b('nn-back','','undo',t('backWait'))+b('nn-killheld','killo','kill',esc(t('killThese',{n:hn})));}
 else if(i.ap)h+='<p class="mt">'+t('nnApP')+'</p>'+b('nn-killap','killo','kill',t('kill'));
 else h+='<p class="mt">'+th('nnTellP',{t:pDept(teamPid(i))})+'</p>'+b('nn-yes','','no',t('nnYes'));
 gOpen(h+'<button class="btn wide mt" data-a="gclose">'+t('cancel')+'</button>','var(--slate)');}
function seq(ids,fn){var q=Promise.resolve();ids.forEach(function(id){q=q.then(function(){return fn(id).catch(function(){});});});return q;}
function nnDo(act,k){var i=rowByKey(k);gClose();if(!i)return;if(!J8.status().connected){toast(t('notConn'));return;}
 var fail=function(e){toast(t('couldNot',{e:e&&e.code||'error'}));};
 if(act==='nn-batch'){var ids=i.batch.items.map(function(a){return a.id;});deferItem(k,'not_needed',null,i,'kill').catch(function(){});
  seq(ids,J8.approvals.kill).then(function(){toast(t('killedAll',{n:ids.length})+' '+nextLine(),function(){seq(ids,J8.approvals.undo).then(function(){deferItem(k,'open',null,i).catch(function(){});toast(t('backOnList'));});});});render();return;}
 if(i.task){var id=i.task.id,dep=depsOf(id),ch=act==='nn-let'?'let_go':act==='nn-killdeps'?'kill':null,killA=[],killT=[];
  if(ch==='kill')dep.forEach(function(d){var x=graph().it[d];if(!x)return;if(x.k==='approval'&&x.o.status!=='sent')killA.push(d);if(x.k==='task')killT.push(d);});
  /* the choice is written first, so the sender never sees a dropped blocker without Dave's word on what waited on it */
  deferItem(k,'not_needed',null,i,ch).then(function(){return J8.tasks.drop(id);}).then(function(){return seq(killA,J8.approvals.kill).then(function(){return seq(killT,J8.tasks.drop);});}).then(function(){
   toast((ch==='let_go'?t('letGoT',{n:dep.length}):ch==='kill'?t('killTooT',{n:killA.length+killT.length}):t('noT'))+' '+nextLine(),function(){J8.tasks.undo(id).then(function(){return seq(killA,J8.approvals.undo).then(function(){return seq(killT,J8.tasks.undo);});}).then(function(){deferItem(k,'open',null,i).catch(function(){});toast(t('backOnList'));});});},fail);render();return;}
 if(act==='nn-back'||act==='nn-killheld'){var hid=i.held.items.map(function(a){return a.id;}),fn=act==='nn-back'?J8.approvals.undo:J8.approvals.kill;deferItem(k,'not_needed',null,i,act==='nn-back'?'back':'kill').catch(function(){});
  seq(hid,fn).then(function(){toast((act==='nn-back'?t('backWaitT',{n:hid.length}):t('killedAll',{n:hid.length}))+' '+nextLine(),function(){seq(hid,act==='nn-back'?J8.approvals.approve:J8.approvals.undo).then(function(){if(act==='nn-killheld')return seq(hid,J8.approvals.approve);}).then(function(){deferItem(k,'open',null,i).catch(function(){});toast(t('backOnList'));});});});render();return;}
 if(act==='nn-killap'){var aid=i.ap.id;J8.approvals.kill(aid).then(function(){deferItem(k,'not_needed',null,i,'kill').catch(function(){});toast(t('killedLast'),function(){J8.approvals.undo(aid).then(function(){deferItem(k,'open',null,i).catch(function(){});toast(t('backWaiting'));});});},fail);render();return;}
 var pid=teamPid(i);
 deferItem(k,'not_needed',null,i).then(function(){J8.inbox.send(pid,'Not needed: '+(i.full||i.title)).catch(function(){});
  toast(t('noT')+' '+nextLine(),function(){deferItem(k,'open',null,i).then(function(){J8.inbox.send(pid,'Still needed after all: '+(i.full||i.title)).catch(function(){});toast(t('backOnList'));});});},fail);render();}
function laterPick(k,w,l){gClose();var i=rowByKey(k);if(!i)return;
 var undo=function(){deferItem(k,'open',null,i).then(function(){toast(t('backOnList'));});};
 deferItem(k,'later',+w,i).then(function(){toast(t('laterT',{w:(LANG==='he'?'':String(t(l)).toLowerCase()+', ')+whenStr(+w)})+' '+nextLine(),undo);},function(){snooze(k,Math.max(1,(+w-Date.now())/36e5));toast(t('localOnly'));});render();}
function undoDone(k){var D=doneToday().filter(function(x){return x.k===k;})[0];if(!D)return;
 if(D.type==='task')J8.tasks.undo(D.id).then(function(){toast(t('backOnList'));},function(e){toast(t('couldNot',{e:e&&e.code||'error'}));});
 else if(D.type==='drafts'){var r=Promise.resolve();D.ids.forEach(function(id){if((AP[id]||{}).status!=='sent')r=r.then(function(){return J8.approvals.undo(id).catch(function(){});});});r.then(function(){toast(t('backOnList'));});}
 else if(D.type==='later'){var row=LATER[D.id]||{},tk=String(D.id).indexOf('tk-')===0?D.id.slice(3):null;
  (tk&&row.status==='not_needed'?J8.tasks.undo(tk):Promise.resolve()).then(function(){return deferItem(D.id,'open',null,rowByKey(D.id));}).then(function(){toast(t('backOnList'));},function(e){toast(t('couldNot',{e:e&&e.code||'error'}));});}}

/* =====================================================================================================================
   J8NIX 8.0.0 (15 Nov 2026): Home, the first screen (DESIGN-v8.md §1–3). Seven numbered sections on live data only:
   01 Your move now (always first) · 02 Money vs goal · 03 Waiting on you · 04 This week · 05 Projects by stage ·
   06 J8 suggests next · 07 The team at work. "Your move now" is the top of the same ranked queue as Today (needs():
   the client copy of public.j8_rank / j8_unlocks over the j8_items graph, parity checked by the QA harness). A fixed-time
   step that needs you within 2 hours comes first, but only when such a dated step exists in the data.
   Pin / Hide / Move / Edit Home are saved per member in j8_members.prefs.home (J8.prefs), with localStorage as the fallback.
   ===================================================================================================================== */
var HSEC=['money','waiting','week','stages','j8','team'],HSPAN={money:5,waiting:7,week:12,stages:12,j8:6,team:6},HWID={full:12,'2/3':8,'1/2':6};
var FSTGH=['רעיון','בנייה','בטא','אימות','השקה','משלמים'];
function stgL(s){return (LANG==='he'?FSTGH:FSTG)[s-1]||'';}
function isDesk(){return window.matchMedia?matchMedia('(min-width:960px)').matches:true;}
/* ---------- the member's Home layout ---------- */
function hpNorm(x){x=x&&typeof x==='object'?x:{};var o=(Array.isArray(x.order)?x.order:[]).filter(function(k,i,a){return HSEC.indexOf(k)>-1&&a.indexOf(k)===i;});
 HSEC.forEach(function(k){if(o.indexOf(k)<0)o.push(k);});
 var w={};if(x.width&&typeof x.width==='object')Object.keys(x.width).forEach(function(k){if(HSEC.indexOf(k)>-1&&HWID[x.width[k]])w[k]=x.width[k];});
 return {order:o,hidden:(Array.isArray(x.hidden)?x.hidden:[]).filter(function(k){return HSEC.indexOf(k)>-1;}),pinned:(Array.isArray(x.pinned)?x.pinned:[]).filter(function(k){return HSEC.indexOf(k)>-1;}),width:w,at:isNum(x.at)?x.at:0};}
function homePrefs(){var loc=ls('j8-home'),srv=null;try{srv=(J8.prefs&&J8.prefs.get().home)||null;}catch(e){srv=null;}
 var a=hpNorm(loc),b=hpNorm(srv);return (srv&&b.at>=a.at)?b:a;}
var HSAVE=0;
function homeSave(p,msg){p=hpNorm(p);p.at=Date.now();ls('j8-home',p);render();
 var n=++HSAVE,ok=function(){if(msg&&n===HSAVE)toast(msg);},bad=function(){if(n===HSAVE)toast((msg?msg+' ':'')+t('savedLocal'));};
 if(J8.prefs&&J8.status().connected)J8.prefs.set({home:p}).then(ok,bad);else bad();}
function secOrder(p){var v=p.order.filter(function(k){return p.hidden.indexOf(k)<0;});return v.filter(function(k){return p.pinned.indexOf(k)>-1;}).concat(v.filter(function(k){return p.pinned.indexOf(k)<0;}));}
function secName(k){return t('s_'+k);}
function hMove(k,d){var p=homePrefs(),vis=secOrder(p),i=vis.indexOf(k),j=i+d;if(i<0||j<0||j>=vis.length)return false;
 var o=vis[j],a=p.order.indexOf(k),b=p.order.indexOf(o);p.order[a]=o;p.order[b]=k;
 var pa=p.pinned.indexOf(k)>-1,pb=p.pinned.indexOf(o)>-1;if(pa!==pb){if(pa)p.pinned=p.pinned.filter(function(x){return x!==k;});else p.pinned.push(k);}
 homeSave(p,t('movedT',{x:secName(k)}));return true;}
function hMoveTo(k,before){var p=homePrefs();if(k===before)return;p.order=p.order.filter(function(x){return x!==k;});var i=before?p.order.indexOf(before):-1;if(i<0)p.order.push(k);else p.order.splice(i,0,k);
 var pb=before&&p.pinned.indexOf(before)>-1;p.pinned=p.pinned.filter(function(x){return x!==k;});if(pb)p.pinned.push(k);homeSave(p,t('movedT',{x:secName(k)}));}
function hToggle(list,k){var p=homePrefs(),L=p[list],on=L.indexOf(k)<0;p[list]=on?L.concat([k]):L.filter(function(x){return x!==k;});
 homeSave(p,list==='hidden'?(on?t('hiddenT',{x:secName(k)}):t('shownT',{x:secName(k)})):(on?t('pinnedT',{x:secName(k)}):t('unpinnedT',{x:secName(k)})));}
/* ---------- 01 Your move now ---------- */
/* a dated step that needs you with a clock time, from 15 minutes ago to 2 hours ahead; null when none exists */
function fixedSoon(){var now=Date.now(),lo=now-15*6e4,hi=now+2*36e5,C=[],M=mineBy();
 var add=function(at,o){var ms=pd(at);if(!/T\d\d:\d\d/.test(String(at||''))||isNaN(ms)||ms<lo||ms>hi)return;o.ms=ms;C.push(o);};
 projList().forEach(function(p){if(p.status==='done'||p.status==='parked'||!p.milestone)return;if(holderOf(p,M)!=='me')return;add(p.milestone_at,{k:'p',id:p.id,title:p.milestone,pid:p.id});});
 tasksAll().forEach(function(x){if(x.owner==='dave'&&(!x.status||x.status==='open'))add(x.due,{k:'t',id:x.id,title:x.title,pid:x.project_id});});
 apPending().forEach(function(a){add(apDue(a),{k:'a',id:a.id,title:apKind(a)+': '+apWho(a),pid:a.product});});
 C.sort(function(a,b){return a.ms-b.ms;});return C[0]||null;}
function heroPick(N){var f=fixedSoon(),i=null;
 if(f){i=N.filter(function(x){return f.k==='t'?x.task&&x.task.id===f.id:f.k==='a'?(x.batch&&x.batch.items.some(function(a){return a.id===f.id;}))||(x.ap&&x.ap.id===f.id):x.p&&x.move&&x.p.id===f.id;})[0]||null;
  return {i:i,fx:f,rest:N.filter(function(x){return x!==i;})};}
 return {i:N[0]||null,fx:null,rest:N.slice(1)};}
function inMin(ms){var m=Math.round((ms-Date.now())/6e4);return m<=0?t('nowW'):t('inMin',{n:m});}
function youGet(i,p){var ng=p?nextGoal(p):null;if(ng&&ng.x)return esc(ng.x.replace(/\.$/,''))+'. <span class="h8gs">('+esc(t('nextStageIs',{s:stgL(STGIX[ng.s]||0)||ng.s}))+')</span>';
 if(i&&i.ul&&i.ul.length)return esc(t('freesN',{n:i.ul.length,x:plainNames(i.ul)}));if(i&&i.money&&p)return esc(t('closest',{p:p.name}));return '';}
var STGIX={Idea:1,Build:2,Beta:3,Validate:4,Launch:5,Paying:6};
function stageTag(s,solid){return s?'<span class="tag st'+s+(solid?' solid':'')+'"><bdi>'+s+'</bdi> · '+esc(stgL(s))+'</span>':'';}
function heroHTML(N){var h='<section class="h8hero notch" aria-labelledby="pageH"><div class="l">',pk=heroPick(N),i=pk.i,fx=pk.fx;
 var eb='<div class="eb"><span class="ix">01</span><span>'+t('s_hero')+'</span>'+(fx?'<span>· <bdi>'+esc(hm2(fx.ms))+'</bdi> · '+esc(inMin(fx.ms))+'</span>':'')+'</div>';
 if(!i&&!fx){var tm=tasksAll().filter(function(x){return x.owner!=='dave'&&(!x.status||x.status==='open');}).length;
  return h+eb+'<div class="clear"><h3 id="pageH" tabindex="-1">'+t('allClear')+'</h3><p class="why">'+esc(tm?t('teamKeeps',{n:tm}):t('allClearP'))+'</p><div class="abar two"><button class="do" data-a="nav-flow">'+ic('do','flip')+'<span>'+t('seeFlow')+'</span></button></div></div></div>'+thenHTML([])+'</section>';}
 var pid=i?rowPid(i):fx.pid,p=pobj(pid),u=unitOf(p),s=p?stageOf(p):0;
 h+=eb+'<h3 id="pageH" tabindex="-1" dir="auto">'+esc(cap1(i?nextOf(i).what:fx.title))+'</h3>';
 if(fx)h+='<p class="why" dir="auto">'+esc(t('atTime',{t:hm2(fx.ms)}))+': '+esc(fx.title)+'</p>';else if(i){var w=mentor(i);if(w)h+='<p class="why" dir="auto">'+esc(w)+'</p>';}
 h+='<div class="meta">'+(pid?'<span>'+tile(pid,'sm')+'<bdi>'+esc(p?p.name:pname(pid))+'</bdi></span>':'')+(s?stageTag(s,true):'')+(u?'<span>'+ic('studio')+'<bdi>'+esc(u.name)+'</bdi></span>':'')+(i&&isNum(i.mins)?'<span>'+ic('time')+esc(t(i.est?'minEst':'min',{n:i.mins}))+'</span>':'')+'</div>';
 var g=youGet(i,p);if(g)h+='<p class="get"><b>'+t('youGet')+'</b> <bdi>'+g+'</bdi></p>';
 if(i)h+=abar(i);else h+='<div class="abar"><button class="do" data-a="proj" data-id="'+esc(pid)+'">'+ic('do','flip')+'<span>'+th('open',{x:p?p.name:pname(pid)})+'</span></button><button class="cm" data-a="thread-proj" data-id="'+esc(pid)+'">'+ic('comment')+'<span>'+t('comment')+'</span></button></div>';
 h+='<p class="rule">'+t('heroRule')+'</p></div>'+thenHTML(pk.rest)+'</section>';return h;}
function thenHTML(R){var L=R.slice(0,4);
 var li=L.map(function(x,k){var pid=rowPid(x),p=pobj(pid),d=x.due?dlabel(ymd(x.due)):'';
  return '<li class="'+(k>1?'dk':'')+'"><button data-a="jump" data-id="list-'+esc(x.key)+'"><span class="n"><bdi>'+(k+2)+'</bdi></span><span><bdi dir="auto">'+esc(cap1(nextOf(x).what))+'</bdi><small dir="auto">'+esc(p?p.name:(x.sub||''))+(d?' · '+esc(d):'')+'</small></span><span class="m">'+(isNum(x.mins)?esc(t(x.est?'minEst':'min',{n:x.mins})):'')+'</span></button></li>';}).join('');
 var more=R.length-2;
 return '<div class="r"><h4>'+t('thenOrder')+'</h4>'+(L.length?'<ol class="h8then">'+li+(more>0?'<li class="mo"><button class="more" data-a="nav" data-id="today">+ '+esc(t('moreInToday',{n:more}))+'</button></li>':'')+(R.length>4?'<li class="dk"><button class="more" data-a="nav" data-id="today">+ '+esc(t('moreInToday',{n:R.length-4}))+'</button></li>':'')+'</ol>':'<p>'+t('nothingNow')+'</p>')+'</div>';}
/* ---------- section frame ---------- */
function secHead(k,ix,p){var pin=p.pinned.indexOf(k)>-1,nm=secName(k);
 return '<div class="h8sh"><span class="ix"><bdi>'+(ix<10?'0':'')+ix+'</bdi></span><h2 id="h8-'+k+'">'+esc(nm)+'</h2><span class="what">'+esc(t('w_'+k))+'</span><span class="ctl">'
  +'<button class="pin" data-a="h-pin" data-id="'+k+'" aria-pressed="'+(pin?'true':'false')+'" aria-label="'+esc(t('pin')+': '+nm)+'" title="'+esc(t('pin'))+'">'+ic('pin')+'</button>'
  +'<button class="hide" data-a="h-hide" data-id="'+k+'" aria-label="'+esc(t('hide')+': '+nm)+'" title="'+esc(t('hide'))+'">'+ic('eyeoff')+'</button>'
  +'<button class="grip" data-a="h-grip" data-id="'+k+'" draggable="true" aria-label="'+esc(t('move')+': '+nm)+'" title="'+esc(t('move'))+'">'+ic('grip')+'</button></span></div>';}
/* ---------- 02 Money vs goal ---------- */
var FUNRE=/(\d[\d,]*)\s+sent,\s*(\d[\d,]*)\s+accepted,\s*(\d[\d,]*)\s+repl(?:y|ies),\s*(\d[\d,]*)\s+calls?/i;
function funnelLive(){var P=projList(),o=null;P.forEach(function(p){if(o)return;var m=String(p.now||'').match(FUNRE);if(m)o={p:p,v:[m[1],m[2],m[3],m[4]].map(function(x){return +String(x).replace(/,/g,'');})};});return o;}
function secMoney(){var m=J8.money.summary();if(!m)return '<p class="h8empty">'+t('noMoney')+'</p>';
 var b=isNum(m.booked_usd)?m.booked_usd:0,g1=isNum(m.m1_usd)?m.m1_usd:null,d1=J8.money.daysTo(m.m1_date),h='';
 h+='<div class="h8big"><b class="num"><bdi>'+esc(usd(b))+'</bdi></b><span>'+t('bookedSoFar')+'</span></div>';
 if(g1){var pc=Math.max(0,Math.min(100,b/g1*100));h+='<div class="h8track" role="img" aria-label="'+esc(Math.round(pc)+'%')+'"><i style="width:'+pc+'%"></i></div>'
  +'<div class="h8ml num"><span>'+esc(t('m1line',{a:usd(g1),d:m.m1_date?dlabelL(m.m1_date):''}))+'</span>'+(d1!=null?'<span class="tag '+(d1<=7?'al':'yo')+'"><bdi>'+esc(d1===1?t('dayLeft'):t('daysLeft',{n:Math.max(0,d1)}))+'</bdi></span>':'')+'</div>';}
 var f=funnelLive();
 if(f){var W=['fw_sent','fw_acc','fw_rep','fw_calls','fw_booked'],V=f.v.concat([b]);
  h+='<div class="h8fun num">'+V.map(function(v,k){return '<div class="'+(v===0?'z':'')+'"><b><bdi>'+(k===4?esc(usd(v)):v)+'</bdi></b><span>'+t(W[k])+'</span></div>';}).join('')+'</div>'
   +'<p class="h8src" dir="auto">'+esc(t('funnelFrom',{p:f.p.name}))+'</p>';}
 h+='<p class="h8src">'+(isNum(m.goal_usd)?esc(t('goalLine',{a:usd(m.goal_usd),d:m.goal_date?dlabelL(m.goal_date):''}))+' · ':'')+esc(t('spent',{a:usd(isNum(m.spend_usd)?m.spend_usd:0)}))+'</p>';
 h+=isNum(m.pipeline)&&m.pipeline>0?'<p class="h8src">'+esc(t('pipe',{a:usd(m.pipeline)}))+'</p>':'<p class="h8empty" style="margin-top:10px">'+t('noPipe')+'</p>';
 var A=J8.approvals.list().filter(function(a){return a.kind!=='template';}),sn=A.filter(function(a){return a.status==='sent';}).length,an=A.filter(function(a){return a.status==='approved'||a.status==='edited'||a.status==='queued';}).length;
 h+='<p class="h8src">'+esc(t('sentJ8',{a:sn}))+' · '+esc(t('apprNotSent',{n:an}))+'</p>';
 if(m.by)h+='<p class="h8src" dir="auto">'+esc(t('moneyFrom',{x:cut(m.by,90)+(m.updated?', '+tm1(m.updated):'')}))+'</p>';
 return h;}
function dlabelL(s){var d=new Date(String(s).slice(0,10)+'T12:00:00');if(isNaN(d))return '';return dayStr(d)+(d.getFullYear()!==new Date().getFullYear()?' '+d.getFullYear():'');}
/* ---------- 03 Waiting on you ---------- */
function bDue(b){var d=b.items.map(function(a){return apDue(a);}).filter(Boolean).sort()[0];return d||null;}
function dueTag(v){if(!v)return '';var ms=pd(v);if(isNaN(ms))return '';var x=new Date(ms),hasT=/T\d\d:\d\d/.test(String(v)),td=ymd(x)===ymd(new Date());
 return '<span class="tag '+(td||ms<Date.now()?'al':'yo')+'"><bdi>'+esc((td?t('todayTag'):dayStr(x))+(hasT?' '+hm2(ms):''))+'</bdi></span>';}
function secWaiting(N){var S=N.filter(function(i){return !i.batch;}),B=N.filter(function(i){return i.batch;}).map(function(i){i.bd=bDue(i.batch);return i;}).sort(function(a,b){var x=a.bd?pd(a.bd):Infinity,y=b.bd?pd(b.bd):Infinity;return (x-y)||b.batch.items.length-a.batch.items.length;});
 if(!S.length&&!B.length)return '<p class="h8empty">'+t('nothingWaiting')+'</p>';
 var nd=0;B.forEach(function(i){nd+=i.batch.items.length;});var h='<ul class="h8rows">';
 if(S.length){h+='<li class="grp">'+esc(t('yourSteps'))+' · <bdi>'+S.length+'</bdi>'+esc(minsTxt(S))+'</li>';
  S.slice(0,6).forEach(function(i,k){var pid=rowPid(i),p=pobj(pid);
   h+='<li class="'+(k>3?'dk':'')+'"><button class="h8row" data-a="jump" data-id="list-'+esc(i.key)+'"><span class="k'+(i.wo&&i.wo.length?'':' you')+'">'+ic(i.wo&&i.wo.length?'lock':'you')+'</span><span><span class="t" dir="auto">'+esc(cap1(nextOf(i).what))+'</span><span class="s" dir="auto">'+esc(p?p.name:(i.sub||''))+(i.wo&&i.wo.length?' · '+esc(t('waitsOn',{x:itemNames(i.wo,2)})):'')+'</span></span><span class="m num">'+(i.sev==='r'?'<span class="tag al">'+t('wNow')+'</span>':'')+(isNum(i.mins)?'<bdi>'+esc(t(i.est?'minEst':'min',{n:i.mins}))+'</bdi>':'')+'</span></button></li>';});
  if(S.length>4)h+='<li class="mo"><button class="h8more" data-a="nav" data-id="today">'+esc(t('nMore',{n:S.length-4}))+' ›</button></li>';
  if(S.length>6)h+='<li class="dk"><button class="h8more" data-a="nav" data-id="today">'+esc(t('nMore',{n:S.length-6}))+' ›</button></li>';}
 if(B.length){h+='<li class="grp">'+esc(t('draftsToOk'))+' · <bdi>'+esc(t('inBatches',{n:nd,b:B.length}))+'</bdi></li>';
  B.slice(0,7).forEach(function(i,k){var b=i.batch,pid=rowPid(i),p=pobj(pid);
   h+='<li class="'+(k>3?'dk':'')+'"><button class="h8row" data-a="opendraft" data-id="'+esc(b.id)+'"><span class="k">'+ic('mail')+'</span><span><span class="t" dir="auto">'+esc(b.label)+'</span><span class="s" dir="auto">'+esc(p?p.name:t('team'))+'</span></span><span class="m num">'+dueTag(i.bd)+'<bdi>'+b.items.length+' '+esc(nounL(b.items))+'</bdi></span></button></li>';});
  if(B.length>4)h+='<li class="mo"><button class="h8more" data-a="nav" data-id="today">'+esc(t('nMoreG',{n:B.length-4}))+' ›</button></li>';
  if(B.length>7)h+='<li class="dk"><button class="h8more" data-a="nav" data-id="today">'+esc(t('nMoreG',{n:B.length-7}))+' ›</button></li>';}
 return h+'</ul>';}
function nounL(items){if(LANG!=='he')return nounOf(items);var c={};items.forEach(function(a){c[a.kind]=1;});var k=Object.keys(c);var H={email:'מיילים',post:'פוסטים',linkedin:'הודעות לינקדאין',application:'מועמדויות',invoice:'בקשות תשלום',template:'תבניות'};return k.length===1&&H[k[0]]?H[k[0]]:'טיוטות';}
/* ---------- 04 This week ---------- */
function secWeek(){var E=events(),days=[],now=new Date(),has=0;for(var k=0;k<7;k++){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+k,12);days.push({d:d,key:ymd(d),ev:[]});}
 E.forEach(function(e){var x=days.filter(function(dd){return dd.key===e.day;})[0];if(x){x.ev.push(e);has++;}});
 if(!has)return '<p class="h8empty">'+t('noWeek')+'</p>';
 return '<div class="h8week">'+days.map(function(dd,k){dd.ev.sort(function(a,b){return (a.time||'99').localeCompare(b.time||'99');});
  return '<div class="h8day'+(k===0?' today':'')+(dd.ev.length?'':' none')+'"><h3><span>'+esc(dayShort(dd.d))+'</span>'+(k===0?'<span>'+t('todayTag')+'</span>':'')+'</h3><div class="evs">'+dd.ev.map(function(e){var p=pobj(e.pid),s=p?stageOf(p):0,goal=e.jump==='stats';
   return '<button class="h8ev'+(goal?' goal':' st'+s)+'" data-a="jump" data-id="'+esc(goal?'flow':(e.jump||''))+'">'+(e.time?'<time>'+esc(e.time)+'</time>':'')+'<bdi dir="auto">'+esc(goal?t('m1goal',{a:usd((J8.money.summary()||{}).m1_usd||25000)}):cut(e.title,70))+'</bdi></button>';}).join('')+'</div></div>';}).join('')+'</div>';}
function dayShort(d){return LANG==='he'?DOWH[d.getDay()]+' '+d.getDate()+'.'+(d.getMonth()+1):DOW[d.getDay()]+' '+d.getDate();}
/* ---------- 05 Projects by stage ---------- */
function secStages(){var M=mineBy(),P=projList().filter(function(p){return p.id!=='p-general';}),live=P.filter(function(p){return p.status!=='parked'&&!isDoneP(p);}),by=[1,2,3,4,5,6].map(function(s){return live.filter(function(p){return stageOf(p)===s;});});
 var me=function(p){return holderOf(p,M)==='me';},ns=live.filter(function(p){return !stageOf(p);}),pk=P.filter(function(p){return p.status==='parked';}),dn=P.filter(isDoneP);
 var yu='<span class="yu" role="img" aria-label="'+esc(t('needsYouMark'))+'">'+ic('you')+'</span>';
 var h='<div class="h8spill" aria-hidden="true">'+by.map(function(a,k){return a.length?'<i class="st'+(k+1)+'" style="flex:'+a.length+'"></i>':'';}).join('')+'</div><div class="h8lanes">';
 h+=by.map(function(a,k){var s=k+1,o=UI.open['ln'+s];
  return '<div class="h8lane st'+s+(o?' open':'')+'"><button class="h8lh" data-a="lane" data-id="'+s+'" aria-expanded="'+(o?'true':'false')+'"><span class="no">0'+s+'</span><b><span>'+esc(stgL(s))+'</span><em class="num"><bdi>'+a.length+'</bdi></em></b></button>'
   +'<p class="h8names">'+(a.length?a.map(function(p){return '<bdi>'+esc(p.name)+'</bdi>'+(me(p)?' '+yu:'');}).join(' · '):esc(s===6?t('noPaying'):t('stagesNoneYet')))+'</p>'
   +'<ul>'+(a.length?a.map(function(p){return '<li><button data-a="proj" data-id="'+esc(p.id)+'">'+tile(p.id,'xs')+'<bdi dir="auto">'+esc(p.name)+'</bdi>'+(me(p)?yu:'')+'</button></li>';}).join(''):'<li class="none">'+esc(s===6?t('noPaying'):t('stagesNoneYet'))+'</li>')+'</ul></div>';}).join('')+'</div>';
 h+='<div class="h8leg"><span>'+yu+' '+esc(t('legendYou',{n:live.filter(me).length}))+'</span>'+(ns.length?'<span>'+esc(t('notStaged'))+': <bdi>'+esc(ns.map(function(p){return p.name;}).join(', '))+'</bdi></span>':'')
  +(pk.length?'<span>'+esc(t('parkedN',{n:pk.length}))+': <bdi>'+esc(pk.map(function(p){return p.name;}).join(', '))+'</bdi></span>':'')+(dn.length?'<span>'+esc(t('doneN',{n:dn.length}))+': <bdi>'+esc(dn.map(function(p){return p.name;}).join(', '))+'</bdi></span>':'')+'</div>';
 return h;}
/* ---------- 06 J8 suggests next ---------- */
function boardRun(){var R=J8.runs.list().filter(function(r){return r.summary&&r.status!=='failed';});return R.filter(function(r){return /board/i.test(r.arm||'');})[0]||R.filter(function(r){return /morning plan/i.test(r.arm||'');})[0]||null;}
function secJ8(){var r=boardRun(),P=projList().filter(function(p){return p.id!=='p-general'&&p.status!=='parked'&&!isDoneP(p)&&String(p.next||'').trim();});
 P.sort(function(a,b){return (moneyP(b)?1:0)-(moneyP(a)?1:0)||stageOf(b)-stageOf(a);});P=P.slice(0,3);
 var h='<div class="j8band notch"><div class="who8">'+g8()+'<span>'+t('j8says')+(r?' · <bdi>'+esc(cap1(String(r.arm).replace(/^3s\s+/i,'')))+', '+esc(tm1(r.ended||r.started))+'</bdi>':'')+'</span></div>';
 h+=r?'<q dir="auto">'+esc(cut(noUrl(sevStrip(String(r.summary).split('\n')[0])),220))+'</q>':'<p class="mt">'+t('noAdvice')+'</p>';
 if(P.length)h+='<ol>'+P.map(function(p){var x=String(p.next).replace(/^(Concept|Build|Staged|Validate|Monetize|Paying)\s*:\s*/i,'');return '<li><button data-a="proj" data-id="'+esc(p.id)+'"><span><bdi dir="auto">'+esc(cut(x,110))+'</bdi><small dir="auto">'+esc(p.name)+(stageOf(p)?' · '+esc(stgL(stageOf(p))):'')+' · '+esc(t('nextStep'))+'</small></span></button></li>';}).join('')+'</ol>'
  +'<button class="btn pe" data-a="proj" data-id="'+esc(P[0].id)+'">'+ic('do','flip')+'<span>'+t('startFirst')+'</span></button>';
 return h+'</div>';}
/* ---------- 07 The team at work ---------- */
function runWhen(iso){var ms=pd(iso);if(isNaN(ms))return '';var d=new Date(ms);return isToday(ms)?esc(hm2(ms)):esc(dayShort(d))+'<br>'+esc(hm2(ms));}
function secTeam(){var R=J8.runs.list().slice(0,4),h='';
 if(!R.length)h+='<p class="h8empty">'+t('noRuns')+'</p>';
 else h+='<ul class="h8rows">'+R.map(function(r,k){return '<li class="'+(k>1?'dk':'')+'"><button class="h8row run" data-a="nav" data-id="flow"><span class="k num"><bdi>'+runWhen(r.ended||r.started)+'</bdi></span><span><span class="t" dir="auto">'+esc(cap1(String(r.arm||t('team')).replace(/^3s\s+/i,'')))+(r.status==='failed'?' <span class="tag al">'+t('problem')+'</span>':'')+'</span><span class="s" dir="auto">'+esc(cut(noUrl(sevStrip(String(r.summary||''))),130))+'</span></span><span class="m"></span></button></li>';}).join('')+'</ul>';
 var T=tasksAll().filter(function(x){return x.owner!=='dave'&&(!x.status||x.status==='open');}).map(function(x){return {x:x,ul:unlocksOf([x.id]),bl:openBlk(x.id).length};}).sort(function(a,b){return (a.bl?1:0)-(b.bl?1:0)||b.ul.length-a.ul.length;});
 if(T.length){var n=T[0];h+='<p class="h8src"><b><bdi>'+esc(t('teamOpen',{n:T.length}))+'</bdi></b> · <bdi dir="auto">'+esc(t('nextUp',{x:n.x.title}))+'</bdi>'+(isNum(n.x.minutes)?' ('+esc(t('min',{n:n.x.minutes}))+')':'')+(n.ul.length?' · '+esc(t('frees',{x:plainNames(n.ul)})):'')+'</p>';}
 h+='<button class="btn go mt" data-a="nav" data-id="flow">'+ic('flow')+'<span>'+t('seeTeam')+'</span></button>';
 return h;}
/* ---------- Home ---------- */
function vHome(){if(!connected)return '<section class="h8hero notch"><div class="l"><div class="eb"><span class="ix">01</span><span>'+t('s_hero')+'</span></div><h3 id="pageH" tabindex="-1">'+t('loadingDay')+'</h3></div></section><div class="skel"></div><div class="skel"></div>';
 var N=myQueue(),p=homePrefs(),vis=secOrder(p),h='';
 if(J8.status().error==='offline'){var sa=UI.syncedAt?hm2(UI.syncedAt):'—';h+='<p class="held mt">'+ic('wifi')+'<span>'+esc(t('noConnP',{t:sa}))+'</span></p>';}
 h+='<div class="h8grid">'+heroHTML(N);
 var F={money:secMoney,waiting:function(){return secWaiting(N);},week:secWeek,stages:secStages,j8:secJ8,team:secTeam};
 vis.forEach(function(k,j){var w=p.width[k]?HWID[p.width[k]]:HSPAN[k];h+='<section class="h8sec w'+w+'" data-sec="'+k+'" aria-labelledby="h8-'+k+'">'+secHead(k,j+2,p)+F[k]()+'</section>';});
 if(p.hidden.length)h+='<div class="h8hid"><b>'+t('hiddenSecs')+'</b>'+p.hidden.map(function(k){return '<button class="btn" data-a="h-show" data-id="'+k+'">'+ic('eye')+'<span>'+esc(t('showX',{x:secName(k)}))+'</span></button>';}).join('')+'</div>';
 return h+'</div>';}
/* ---------- Edit Home (sheet) ---------- */
function ehSheet(fk){UI.gsheet={k:'edit'};var p=homePrefs(),L=p.order,desk=isDesk();
 var h='<h2 id="gTitle">'+t('ehTitle')+'</h2><p class="lead">'+t('ehLead')+'</p><div class="ehrow"><b>01 · '+esc(t('s_hero'))+'</b><span class="lead">'+t('alwaysFirst')+'</span></div>';
 L.forEach(function(k,j){var hid=p.hidden.indexOf(k)>-1,pin=p.pinned.indexOf(k)>-1,nm=secName(k),w=p.width[k]||'auto';
  h+='<div class="ehrow"><b dir="auto">'+esc(nm)+'</b><span class="lead">'+esc(hid?t('hiddenW'):pin?t('pinnedW'):t('shownW'))+'</span><div class="acts" role="group" aria-label="'+esc(nm)+'">'
   +'<button class="up" data-a="eh-up" data-id="'+k+'" data-fk="eh-up-'+k+'"'+(j===0?' disabled':'')+' aria-label="'+esc(t('up')+': '+nm)+'">'+ic('down')+'<span>'+t('up')+'</span></button>'
   +'<button data-a="eh-down" data-id="'+k+'" data-fk="eh-down-'+k+'"'+(j===L.length-1?' disabled':'')+' aria-label="'+esc(t('down')+': '+nm)+'">'+ic('down')+'<span>'+t('down')+'</span></button>'
   +'<button data-a="eh-pin" data-id="'+k+'" data-fk="eh-pin-'+k+'" aria-pressed="'+(pin?'true':'false')+'">'+ic('pin')+'<span>'+t('pinW')+'</span></button>'
   +'<button data-a="eh-hide" data-id="'+k+'" data-fk="eh-hide-'+k+'" aria-pressed="'+(hid?'true':'false')+'">'+ic('eyeoff')+'<span>'+t('hideW')+'</span></button>'
   +(desk?'<label class="ehw"><span class="sr">'+esc(t('width')+': '+nm)+'</span><select data-eh-w="'+k+'" data-fk="eh-w-'+k+'" aria-label="'+esc(t('width')+': '+nm)+'">'+[['auto',t('wAuto')],['full',t('wFull')],['2/3','⅔'],['1/2','½']].map(function(o){return '<option value="'+o[0]+'"'+(o[0]===w?' selected':'')+'>'+esc(t('width')+': '+o[1])+'</option>';}).join('')+'</select></label>':'')
   +'</div></div>';});
 h+='<button class="btn wide mt" data-a="eh-reset" data-fk="eh-reset">'+ic('undo')+'<span>'+t('reset')+'</span></button><button class="btn act wide mt" data-a="gclose">'+ic('check')+'<span>'+t('doneB')+'</span></button>';
 gOpen(h,'var(--rail)');if(fk){var f=$('gsheet').querySelector('[data-fk="'+fk+'"]');if(f&&!f.disabled)f.focus();}}
/* ---------- Ask J8 or jump to anything ---------- */
function askItems(q){q=String(q||'').trim().toLowerCase();var R=[],m=function(s){return !q||String(s||'').toLowerCase().indexOf(q)>-1;};
 [['home','home'],['today','today'],['studio','studio'],['flow','flow'],['talk','talk']].forEach(function(x){if(m(t(x[0]))||m(x[0]))R.push({g:'places',id:'nav:'+x[0],ic:x[1]==='home'?'home':x[1],l:t(x[0])});});
 if(m(t('settings'))||m('settings'))R.push({g:'places',id:'set',ic:'cog',l:t('settings')});if(m('control'))R.push({g:'places',id:'ctl',ic:'set',l:'Control'});
 if(q){myQueue().forEach(function(i){var w=cap1(nextOf(i).what);if(m(w)||m(i.sub))R.push({g:'steps',id:'item:'+i.key,ic:'you',l:w});});
  projList().forEach(function(p){if(p.id!=='p-general'&&m(p.name))R.push({g:'projectsH',id:'proj:'+p.id,ic:'studio',l:p.name});});}
 else myQueue().slice(0,3).forEach(function(i){R.push({g:'steps',id:'item:'+i.key,ic:'you',l:cap1(nextOf(i).what)});});
 return R.slice(0,12);}
function askRes(q){var R=askItems(q),g='',h='';R.forEach(function(r){if(r.g!==g){g=r.g;h+='<h3>'+t(g)+'</h3>';}h+='<button class="opt" data-a="cmd" data-id="'+esc(r.id)+'">'+ic(r.ic)+'<span dir="auto">'+esc(cut(r.l,80))+'</span></button>';});
 q=String(q||'').trim();if(!R.length)h+='<p class="lead mt">'+t('noMatch')+'</p>';
 if(q)h+='<h3>'+t('talk')+'</h3><button class="opt" data-a="cmd" data-id="ask">'+ic('send','flip')+'<span dir="auto">'+esc(t('askSend',{x:cut(q,60)}))+'</span></button>';
 return h;}
function askSheet(){UI.gsheet={k:'ask'};gOpen('<h2 id="gTitle">'+t('askTitle')+'</h2><form class="askf" id="askF" autocomplete="off"><label class="sr" for="askIn">'+t('askPh')+'</label><input id="askIn" type="search" dir="auto" placeholder="'+esc(t('askPh'))+'" enterkeyhint="go"></form><div class="askres" id="askRes" aria-live="polite">'+askRes('')+'</div><button class="btn wide mt" data-a="gclose">'+t('close')+'</button>','var(--rail)');
 var i=$('askIn');if(i)i.focus();}
function askCmd(id){var q=$('askIn')?$('askIn').value.trim():'';gClose();
 if(id==='ask'){if(!q)return;if(!J8.status().connected){toast(t('notConn'));return;}J8.inbox.send('p-general',q).then(function(){toast(t('askSent'));},function(e){toast(t('couldNot',{e:e&&e.code||'error'}));});return;}
 if(id==='set'){renderSeat();renderPrefs();openSheet();return;}if(id==='ctl'){openCtl();return;}
 var k=id.split(':'),v=k.slice(1).join(':');if(k[0]==='nav')navTo(v);else if(k[0]==='proj'){UI.stack=[{v:UI.v}];openProj(v);}else if(k[0]==='item')jump('list-'+v);}
document.addEventListener('input',function(e){if(e.target&&e.target.id==='askIn'){var r=$('askRes');if(r)r.innerHTML=askRes(e.target.value);}});
document.addEventListener('submit',function(e){if(!e.target||e.target.id!=='askF')return;e.preventDefault();var f=$('askRes')&&$('askRes').querySelector('[data-a=cmd]');if(f)askCmd(f.dataset.id);},true);
document.addEventListener('change',function(e){var s=e.target;if(!s||!s.dataset||!s.dataset.ehW)return;var p=homePrefs(),k=s.dataset.ehW;if(s.value==='auto')delete p.width[k];else p.width[k]=s.value;homeSave(p,t('savedHome'));ehSheet('eh-w-'+k);});
/* keyboard: "/" opens Ask; Alt+↑/↓ on a section's grip moves it */
document.addEventListener('keydown',function(e){var x=e.target,typing=x&&(/^(INPUT|TEXTAREA|SELECT)$/.test(x.tagName)||x.isContentEditable);
 if(e.key==='/'&&!typing&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&$('gsheet').hidden&&$('sheet').hidden&&!$('app').hidden){e.preventDefault();askSheet();return;}
 if(x&&x.classList&&x.classList.contains('grip')&&(e.key==='ArrowUp'||e.key==='ArrowDown')&&(e.altKey||UI.v==='home')){e.preventDefault();var k=x.dataset.id;if(hMove(k,e.key==='ArrowUp'?-1:1)){var g=document.querySelector('.h8sec[data-sec="'+k+'"] .grip');if(g)g.focus({preventScroll:false});}}});
/* drag a section by its grip (desktop) */
var DRAG=null;
document.addEventListener('dragstart',function(e){var g=e.target&&e.target.closest&&e.target.closest('.grip');if(!g)return;DRAG=g.dataset.id;try{e.dataTransfer.setData('text/plain',DRAG);e.dataTransfer.effectAllowed='move';var s=g.closest('.h8sec');if(s&&e.dataTransfer.setDragImage)e.dataTransfer.setDragImage(s,20,20);}catch(x){}var s2=g.closest('.h8sec');if(s2)s2.classList.add('dragging');});
document.addEventListener('dragover',function(e){if(!DRAG)return;var s=e.target.closest&&e.target.closest('.h8sec');if(!s)return;e.preventDefault();[].forEach.call(document.querySelectorAll('.h8sec.dropin'),function(x){if(x!==s)x.classList.remove('dropin');});s.classList.add('dropin');});
document.addEventListener('drop',function(e){if(!DRAG)return;var s=e.target.closest&&e.target.closest('.h8sec');if(!s)return;e.preventDefault();var k=DRAG,to=s.dataset.sec;DRAG=null;if(to===k){render();return;}
 var r=s.getBoundingClientRect(),after=e.clientY>r.top+r.height/2,vis=secOrder(homePrefs()),i=vis.indexOf(to);hMoveTo(k,after?vis[i+1]||null:to);});
document.addEventListener('dragend',function(){DRAG=null;[].forEach.call(document.querySelectorAll('.h8sec.dragging,.h8sec.dropin'),function(x){x.classList.remove('dragging','dropin');});});

/* ---------- shell: top bar, nav, routing ---------- */
var view='today';
function curPlace(){if(UI.v==='draft'&&UI.draftFrom)return PLACE[UI.draftFrom]||'studio';return PLACE[UI.v]||'today';}
function renderTop(){var pl=curPlace(),inner=UI.v!==pl;document.body.dataset.place=pl;
 $('tBack').hidden=!inner;$('tTile').innerHTML=g8();$('hdT').textContent=t(pl);
 var o=J8.orgs&&J8.orgs.current();$('hdW').textContent=(o&&o.name?o.name+' · ':'')+dayStr();
 $('editBtn').hidden=UI.v!=='home';$('askL').textContent=t('ask');$('editL').textContent=t('editHome');$('askBtn').setAttribute('aria-label',t('ask'));
 var m=document.querySelector('meta[name=theme-color]');if(m)m.content=isDark()?'#060833':'#FFFFFF';}
function renderNav(){var n=connected?myQueue().length:0,q=connected?askRows().length:0,pl=curPlace();
 [].forEach.call(document.querySelectorAll('#nav [data-nav]'),function(b){var k=b.dataset.nav;if(k===pl)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');b.querySelector('.lbl').textContent=t(k);});
 var a=$('nN'),b=$('tN'),was=a.textContent;a.textContent=n||'';a.hidden=!n;b.textContent=q||'';b.hidden=!q;
 $('nNs').textContent=n?' '+(LANG==='he'?'צעדים':'steps'):'';$('tNs').textContent=q?' '+(LANG==='he'?'שאלות':'questions'):'';if(n&&was&&was!==String(n))bump(a);}
function isDark(){var t0=document.documentElement.dataset.theme;return t0==='dark'||(t0==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme:dark)').matches);}
var TYPING={};
function busyMain(){var a=document.activeElement,m=$('main');return a&&m&&m.contains(a)&&(a.tagName==='TEXTAREA'||a.tagName==='INPUT'||a.tagName==='SELECT')&&String(a.value||'').trim();}
function tkSave(){var l=$('tkLog');return l?{t:l.scrollTop,b:l.scrollHeight-l.scrollTop-l.clientHeight<48,n:+l.dataset.n||0,p:$('tkNew')&&!$('tkNew').hidden}:null;}
function tkRestore(sv,focus){var l=$('tkLog');if(!l)return;var n=+l.dataset.n||0,pill=$('tkNew');
 if(focus||!sv||sv.b){l.scrollTop=l.scrollHeight;if(pill)pill.hidden=true;}else{l.scrollTop=sv.t;if(pill)pill.hidden=!(sv.p||n>sv.n);}}
function render(focus){var m=$('main');if(!m)return;view=UI.v;renderTop();renderNav();
 if(!focus&&busyMain()){if(UI.v==='talk'&&$('j8cLog')){var sv0=tkSave(),lg=$('j8cLog');lg.innerHTML=talkLog();$('tkLog').dataset.n=J8.inbox.list(60).length;tkRestore(sv0,false);}return;}
 var sv=UI.v==='talk'?tkSave():null,tp=$('tkTop')?$('tkTop').scrollTop:0;m.classList.toggle('tk',UI.v==='talk');
 [].forEach.call(m.querySelectorAll('textarea[id]'),function(x){TYPING[x.id]=x.value;});
 var y=m.scrollTop;
 m.innerHTML=UI.v==='home'?vHome():UI.v==='today'?vToday():UI.v==='studio'?vStudio():UI.v==='dept'?vDept():UI.v==='proj'?vProj():UI.v==='draft'?vDraft():UI.v==='flow'?vFlow():vTalk();
 Object.keys(TYPING).forEach(function(id){var x=document.getElementById(id);if(x&&TYPING[id]&&!x.value)x.value=TYPING[id];});
 if(UI.v==='talk'){talkWire();tkRestore(sv,focus);if($('tkTop')&&!focus)$('tkTop').scrollTop=tp;}
 if(focus){m.scrollTop=0;var ph=$('pageH');(ph||m).focus({preventScroll:true});}else if(Math.abs(m.scrollTop-y)>2)m.scrollTop=y;
 if(UI.gsheet&&UI.gsheet.k==='thread'&&!$('gsheet').hidden){var g=$('gth');if(!g||document.activeElement!==g)threadSheet(UI.gsheet.tg);}}
function goV(v,keepStack){if(!keepStack&&UI.v!==v)UI.stack.push({v:UI.v,dept:UI.dept,proj:UI.proj,batch:UI.batch,dids:UI.dids});UI.v=v;UI.editing=false;if(PLACE[v]===v)ls('j8-view',v);render(true);}
function navTo(v){UI.stack=[];UI.doing={};goV(v,true);}
function back(){var s=UI.stack.pop()||{v:'home'};UI.v=s.v;UI.dept=s.dept;UI.proj=s.proj;UI.batch=s.batch;UI.dids=s.dids;UI.editing=false;render(true);}
function openProj(pid){UI.proj=pid;var u=unitOf(pobj(pid));UI.dept=u?u.id:'_';goV('proj');}
function go(v){var m={chat:'talk',next:'today',list:'studio',stats:'flow'};navTo(m[v]||v);} /* old names still work */
function firstBatch(pid){var B=myQueue().filter(function(i){return i.batch&&(!pid||i.batch.items.some(function(a){return a.product===pid;}));}),b=B[0];return b?b.batch.id:(!pid&&apPending()[0]?bkey(apPending()[0]):null);}
function jump(tg){if(!tg)return;tg=String(tg);
 if(tg==='control'){openCtl();return;}
 if(/^(chat|messages|talk)$/.test(tg)){navTo('talk');return;}
 if(/^(approvals|approve|list-approve)$/.test(tg)){var fb=firstBatch();if(fb)openDraft(fb);else navTo('today');return;}
 if(tg.indexOf('list-b-')===0){openDraft(tg.slice(7));return;}
 if(tg.indexOf('ap-')===0){var a=AP[tg.slice(3)];if(a&&isPend(tg.slice(3)))openDraft(a.batch?a.batch:'ap:'+tg.slice(3));else navTo('today');return;}
 if(tg.indexOf('list-')===0){var k=tg.slice(5).replace(/^tk-tk-/,'tk-');navTo('today');UI.open[k]=1;render();var e=$('r-'+k);if(e)e.scrollIntoView({block:'center'});return;}
 if(/^(home|start)$/.test(tg)){navTo('home');return;}
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
  var pl=e.target.closest&&e.target.closest('#tkNew');if(pl){var l0=$('tkLog');if(l0)l0.scrollTop=l0.scrollHeight;pl.hidden=true;return;}
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
  if(g.jump&&/^(approvals|approve|list-approve)$/.test(g.jump)&&i.p){var fb=firstBatch(i.p.id);if(fb){openDraft(fb);return;}}
  if(g.jump){UI.doing[k]=1;render();jump(g.jump);return;}markDone(k);}
 else if(a==='done'){markDone(k);}
 else if(a==='notyet'){delete UI.doing[k];render();}
 else if(a==='comment'){var ci2=rowByKey(k);if(!ci2)return;threadSheet(ci2.task?{task:ci2.task.id}:ci2.c?{msg:ci2.c.id}:ci2.ap?{ap:ci2.ap.id}:ci2.batch&&ci2.batch.items.length===1?{ap:ci2.batch.items[0].id}:{p:rowPid(ci2)||'p-general'});}
 else if(a==='later'){laterSheet(k);}
 else if(a==='later-pick'){laterPick(k,el.dataset.w,el.dataset.l);}
 else if(a==='later-now'){deferItem(k,'open',null).then(function(){toast(t('backOnList')+' '+(LANG==='he'?'זה בעכשיו.':'It is on Now.'));},function(e2){toast(t('couldNot',{e:e2&&e2.code||'error'}));});render();}
 else if(a==='no'){notNeeded(k);}
 else if(/^nn-/.test(a)){nnDo(a,k);}
 else if(a==='undo'){undoDone(k);}
 else if(a==='untick'){J8.tasks.undo(id).then(function(){toast(t('backOnList')+' '+(LANG==='he'?'זה בעכשיו.':'It is on Now.'));},function(e2){toast(t('couldNot',{e:e2&&e2.code||'error'}));});}
 else if(a==='gclose'){gClose();}
 else if(a==='coach-off'){ls('j8-coach',0);render();}
 else if(a==='retry'){J8.reload().then(function(){toast(LANG==='he'?'מחובר. הרשימה מעודכנת.':'Connected. Your list is up to date.');},function(){toast(t('notConn'));});}
 else if(a==='crumb'){var pp=String(id).split(':');if(/^(today|talk|flow)$/.test(pp[0])){navTo(pp[0]);}else if(pp[0]==='studio'){UI.stack=[];navTo('studio');}else if(pp[0]==='dept'){UI.dept=pp[1];UI.stack=[{v:'studio'}];UI.v='dept';render(true);}else if(pp[0]==='proj'){UI.stack=[{v:'studio'}];openProj(pp[1]);}}
 else if(a==='dept'){UI.dept=id;goV('dept');}
 else if(a==='proj'){openProj(id);}
 else if(a==='jump'){jump(id);}
 else if(a==='blocked-only'){UI.blockedOnly=!UI.blockedOnly;render();}
 else if(a==='ask'){UI.ask=k;render(true);}
 else if(a==='opendraft'){openDraft(id);}
 else if(a==='lane'){UI.open['ln'+id]=!UI.open['ln'+id];render();var lb=document.querySelector('[data-a=lane][data-id="'+id+'"]');if(lb)lb.focus({preventScroll:true});}
 else if(a==='ask-open'){askSheet();}
 else if(a==='cmd'){askCmd(id);}
 else if(a==='edit-home'||a==='h-grip'){ehSheet(id?'eh-up-'+id:null);}
 else if(a==='h-pin'){hToggle('pinned',id);}
 else if(a==='h-hide'||a==='h-show'){hToggle('hidden',id);if(a==='h-hide'){var sh=document.querySelector('[data-a=h-show][data-id="'+id+'"]');if(sh)sh.focus({preventScroll:true});}}
 else if(/^eh-(up|down|pin|hide)$/.test(a)){var hp=homePrefs();if(a==='eh-pin'||a==='eh-hide'){hToggle(a==='eh-pin'?'pinned':'hidden',id);}else{var oi=hp.order.indexOf(id),oj=oi+(a==='eh-up'?-1:1);if(oj>=0&&oj<hp.order.length){hp.order[oi]=hp.order[oj];hp.order[oj]=id;homeSave(hp,t('movedT',{x:secName(id)}));}}ehSheet(el.dataset.fk);}
 else if(a==='eh-reset'){homeSave({},t('resetT'));ehSheet('eh-reset');}
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
  i.value='';TYPING.j8cIn='';$('j8cGo').disabled=true;J8.inbox.send('p-general',mv).then(function(){$('j8cGo')&&($('j8cGo').disabled=false);i.blur();toast(LANG==='he'?'נשלח. התשובה מגיעה כאן, בחלונית של J8.':'Sent. The answer comes here, in the J8 panel.');render();},function(er){if($('j8cGo'))$('j8cGo').disabled=false;i.value=mv;toast(t('couldNot',{e:er&&er.code||'error'}));});return;}
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

/* =====================================================================================================================
   J8NIX 9.0.0 (15 Nov 2026): the v10 layout (j8nix-audit/V10-SPEC.md) on 8.1.1's engine, which is unchanged
   (rows, j8_rank + "frees the most" order, Do / Comment / Later / Not needed, drafts Send / Edit / Kill, held sends, comments, Talk).
   Five places: Now · Inbox · Projects · Calendar · Me, plus the J8 panel (contextual cards + Ask with the pinned composer).
   Every string comes from TX (EN / HE). Numbers sit in <bdi>. A copy lint runs on every render (no ops tags, role codes, j8_ names).
   Revert: index-8.1.1.html + app-8.1.1.js + app-8.1.1.css + sw-8.1.1.js (one line in j8nix-v8/SHIPPED-8.md, v10 section).
   ===================================================================================================================== */
J8V='9.0.0';
var VMAP={home:'now',today:'now',next:'now',studio:'projects',list:'projects',flow:'money',stats:'money',talk:'inbox',chat:'inbox'};
PLACE={now:'now',inbox:'inbox',projects:'projects',calendar:'calendar',me:'me',proj:'projects',dept:'projects',draft:'inbox',qitem:'inbox',money:'now'};
var PLACES=['now','inbox','projects','calendar','me'];
UI.v='now';UI.pf={u:'all',o:'all',n:false,view:null,sort:'stage'};UI.ifil='all';UI.isel=null;UI.pseg='act';
Object.assign(TX.en,{
 now:'Now',inbox:'Inbox',projects:'Projects',calendar:'Calendar',me:'Me',xSearch:'Search or ask',
 xNextFixed:'Next fixed: {x}',xNoFixed:'Nothing fixed today',xPlan:'Plan my day',xBudget:'Today’s budget',
 xBudgetPlan:'{a} of {b} planned · {n} items',xBudgetFit:'{a} fits your {b} · {n} items',xOver:'{a} more than your day holds',
 xFrees:'Frees: {x}',xWhy:'Why?',xMore:'More actions',xToday:'Today, fits your day',xWait:'Waiting on others',xLater:'Later',
 xKMoney:'Money this week',xKMoneyV:'{a} of {b}',xKDays:'{n} days left',xKInbox:'Inbox',xKDec:'{n} decisions',xKDec1:'1 decision',xKDec0:'Nothing waits',
 xKRisk:'Projects at risk',xKRiskV:'{a} overdue · {b} stalled',xKNoMoney:'No figures yet',xNothing:'Nothing needs you right now.',xAsOf:'As of {t}',
 xMoneyH:'Money',xMoneyB:'What blocks money',xMoneyNone:'Nothing on your list blocks money right now.',xSrc:'Source: {x}',xLive:'your live J8NIX data',
 xFAll:'All',xFDrafts:'Drafts',xFQ:'Questions',xFRep:'Replies',xInboxNone:'Nothing waits on your decision.',xPick:'Pick an item from the list.',
 xSet:'Approve set',xSampleH:'Check 3 of {n}',xSampleP:'J8 picked 3 drafts from this set: the first, one from the middle and the last. If they read right, approve all {n}.',
 xApproveAll:'Approve all {n}',xOneByOne:'Review one by one',xApprovedAll:'Approved {n}. They go out on the team’s next run.',xSkip:'Skip',xSkipped:'Skipped. It waits at the end of this set.',
 xTeamAsks:'{t} asks',xReplied:'{t} replied',xOpenThread:'Open the thread',xNDrafts:'{n} drafts',xNDraft1:'1 draft',
 xCheck:'J8 check',xChkTo:'Goes to: {x}',xChkNoTo:'No recipient yet. Edit before you send.',xChkWin:'Goes out: {x}',xWinNext:'on the team’s next run',xWinSun:'Sunday (nothing is sent on Friday or Saturday)',xChkLen:'{n} words',
 xDept:'Department',xOwner:'Who moves it',xAnyone:'Anyone',xYou:'You',xTeam:'Team',xOutside:'Outside',xNeedsMe:'Needs me',xBoard:'Board',xList:'List',
 xNoStage:'No stage',xParked:'Parked',xDone:'Done',xNext:'Next: {x}',xOverdue:'Overdue',xStalled:'Stalled {n} d',xShowMore:'Show {n} more',xName:'Name',xStage:'Stage',xHealth:'Health',
 xStageOf:'Stage {a} of 6 · {s}',xOk:'On track',xYourStep:'Your next step',xNoStep:'Nothing waits on you here.',xNowH:'Where it stands',xStepsH:'Steps',xMsH:'Milestone',xMsNone:'No milestone yet',xEta:'Date unknown',
 xSegAct:'Activity',xSegDr:'Drafts',xSegRev:'J8 review',xRevStalled:'No move for {n} days.',xRevNoMs:'No milestone or date set.',xRevNoNext:'No next step written.',xRevOk:'Nothing looks off: there is a next step, a milestone and a recent move.',
 xRevOverdue:'The milestone date has passed.',xNoDrafts:'No drafts wait for this project.',xNoAct:'No comments or finished steps yet.',
 xCalNoDate:'No date',xCalPlan:'Plan with J8',xCalNone:'Nothing fixed in the next 14 days.',xCalConn:'Google Calendar is not connected, so only J8NIX dates show here.',xTMs:'Milestone',xTGoal:'Goal',xNoDateP:'Your open steps with no day',
 xProfile:'Profile',xOrg:'Organisation and team',xConn:'Connections',xPrefs:'Preferences',xSending:'Sending',xHelp:'Help',xAccount:'Account',
 xCapH:'Your day',xCapP:'Now plans up to this much of your time.',xQuietH:'Quiet days',xQuietP:'Friday and Saturday: nothing is sent for you.',
 xCData:'J8NIX data',xCOn:'Connected',xCOff:'Offline',xCMail:'Studio email',xCMailOn:'Sending is on',xCMailOff:'Sending is off',xManage:'Manage',
 xCCal:'Google Calendar',xCWa:'WhatsApp',xCPay:'Payments (Grow, Morning)',xCLi:'LinkedIn',xNotConn:'Not connected',xSoon:'Coming soon',xSoonT:'{x} is not built yet. Nothing was connected.',
 xCMoney:'Money figures',xCMoneyOn:'From the weekly board, {t}',xCMoneyOff:'No figures yet',xUnits:'AI team: {x}',xInvite:'Invite people',xInviteT:'Invites are not built yet. Today the workspace owner adds members.',
 xJ8:'J8',xOpenJ8:'Open J8',xCloseJ8:'Close J8',xNotNow:'Not now',xAskJ8:'Ask J8 or the team',xAskH:'Ask J8',xSnoozed:'Hidden for 24 hours.',
 xCPlanW:'{n} steps wait, about {a}. Your day holds {b}.',xCPlanY:'Plan the day so the top steps fit.',xCMonW:'Closest to money: {x}.',xCMonY:'It is the step nearest to money on your list.',
 xDoIt:'Do it',xOpen:'Open',xCDrW:'{x}: check before you send.',xCCalW:'{n} open steps of yours have no day.',xCCalY:'They show on the calendar once they get a day.',
 xCWeakY:'The weakest project right now.',xCNone:'Nothing to add here right now.',xWhySrc:'From your live J8NIX data, {t}.',
 xPlanH:'Plan my day',xPlanP:'J8 ticked the steps that fit {b}, in the order that frees the most. Tick in or out, then commit.',xPlanTot:'{a} of {b}',xCommit:'Commit',xPlanned:'Planned: {n} steps, {a}.',
 xMinShort:'{n} min',xH:'{h} h',xHM:'{h} h {m}',xItems1:'1 item',xNofDone:'{a} of {b} done',xBack:'Back',xMe:'Me'
});
Object.assign(TX.he,{
 now:'עכשיו',inbox:'תיבה',projects:'פרויקטים',calendar:'יומן',me:'אני',xSearch:'חיפוש או שאלה',
 xNextFixed:'הקבוע הבא: {x}',xNoFixed:'אין משהו קבוע היום',xPlan:'לתכנן את היום',xBudget:'התקציב של היום',
 xBudgetPlan:'{a} מתוך {b} מתוכננים · {n} פריטים',xBudgetFit:'{a} נכנסים ב־{b} שלך · {n} פריטים',xOver:'{a} יותר ממה שהיום מכיל',
 xFrees:'משחרר: {x}',xWhy:'למה?',xMore:'עוד פעולות',xToday:'היום, נכנס ביום שלך',xWait:'מחכה לאחרים',xLater:'אחר כך',
 xKMoney:'כסף השבוע',xKMoneyV:'{a} מתוך {b}',xKDays:'עוד {n} ימים',xKInbox:'תיבה',xKDec:'{n} החלטות',xKDec1:'החלטה אחת',xKDec0:'שום דבר לא מחכה',
 xKRisk:'פרויקטים בסיכון',xKRiskV:'{a} באיחור · {b} תקועים',xKNoMoney:'עדיין אין מספרים',xNothing:'שום דבר לא מחכה לך כרגע.',xAsOf:'נכון ל־{t}',
 xMoneyH:'כסף',xMoneyB:'מה חוסם כסף',xMoneyNone:'שום דבר ברשימה שלך לא חוסם כסף כרגע.',xSrc:'מקור: {x}',xLive:'הנתונים החיים שלך ב־J8NIX',
 xFAll:'הכול',xFDrafts:'טיוטות',xFQ:'שאלות',xFRep:'תשובות',xInboxNone:'שום דבר לא מחכה להחלטה שלך.',xPick:'לבחור פריט מהרשימה.',
 xSet:'לאשר סט',xSampleH:'לבדוק 3 מתוך {n}',xSampleP:'J8 בחר 3 טיוטות מהסט: הראשונה, אחת מהאמצע והאחרונה. אם הן נכונות, לאשר את כל ה־{n}.',
 xApproveAll:'לאשר את כל ה־{n}',xOneByOne:'לעבור אחת אחת',xApprovedAll:'אושרו {n}. הן יוצאות בריצה הבאה של הצוות.',xSkip:'לדלג',xSkipped:'דילגת. היא מחכה בסוף הסט.',
 xTeamAsks:'{t} שואל',xReplied:'{t} ענה',xOpenThread:'לפתוח את השיחה',xNDrafts:'{n} טיוטות',xNDraft1:'טיוטה אחת',
 xCheck:'הבדיקה של J8',xChkTo:'נשלח אל: {x}',xChkNoTo:'עדיין אין נמען. לערוך לפני שליחה.',xChkWin:'יוצא: {x}',xWinNext:'בריצה הבאה של הצוות',xWinSun:'ביום ראשון (בשישי ובשבת לא נשלח כלום)',xChkLen:'{n} מילים',
 xDept:'מחלקה',xOwner:'מי מזיז',xAnyone:'כולם',xYou:'את/ה',xTeam:'הצוות',xOutside:'מבחוץ',xNeedsMe:'מחכה לי',xBoard:'לוח',xList:'רשימה',
 xNoStage:'בלי שלב',xParked:'בהמתנה',xDone:'הסתיים',xNext:'הבא: {x}',xOverdue:'באיחור',xStalled:'תקוע {n} ימים',xShowMore:'להציג עוד {n}',xName:'שם',xStage:'שלב',xHealth:'מצב',
 xStageOf:'שלב {a} מתוך 6 · {s}',xOk:'בתלם',xYourStep:'הצעד הבא שלך',xNoStep:'שום דבר לא מחכה לך כאן.',xNowH:'איפה זה עומד',xStepsH:'צעדים',xMsH:'אבן דרך',xMsNone:'עדיין אין אבן דרך',xEta:'תאריך לא ידוע',
 xSegAct:'פעילות',xSegDr:'טיוטות',xSegRev:'סקירה של J8',xRevStalled:'אין תזוזה כבר {n} ימים.',xRevNoMs:'אין אבן דרך או תאריך.',xRevNoNext:'לא כתוב צעד הבא.',xRevOk:'שום דבר לא נראה חריג: יש צעד הבא, אבן דרך ותזוזה לאחרונה.',
 xRevOverdue:'התאריך של אבן הדרך עבר.',xNoDrafts:'אין טיוטות שמחכות בפרויקט הזה.',xNoAct:'עדיין אין הערות או צעדים שהסתיימו.',
 xCalNoDate:'בלי תאריך',xCalPlan:'לתכנן עם J8',xCalNone:'אין משהו קבוע ב־14 הימים הקרובים.',xCalConn:'יומן Google לא מחובר, אז מוצגים כאן רק תאריכים מ־J8NIX.',xTMs:'אבן דרך',xTGoal:'יעד',xNoDateP:'צעדים פתוחים שלך בלי יום',
 xProfile:'פרופיל',xOrg:'ארגון וצוות',xConn:'חיבורים',xPrefs:'העדפות',xSending:'שליחה',xHelp:'עזרה',xAccount:'חשבון',
 xCapH:'היום שלך',xCapP:'עכשיו מתכנן עד כמה זמן כזה שלך.',xQuietH:'ימים שקטים',xQuietP:'שישי ושבת: שום דבר לא נשלח בשמך.',
 xCData:'נתוני J8NIX',xCOn:'מחובר',xCOff:'לא מחובר',xCMail:'המייל של הסטודיו',xCMailOn:'השליחה פעילה',xCMailOff:'השליחה כבויה',xManage:'לנהל',
 xCCal:'יומן Google',xCWa:'WhatsApp',xCPay:'תשלומים (Grow, מורנינג)',xCLi:'LinkedIn',xNotConn:'לא מחובר',xSoon:'בקרוב',xSoonT:'{x} עדיין לא נבנה. שום דבר לא חובר.',
 xCMoney:'נתוני כסף',xCMoneyOn:'מהלוח השבועי, {t}',xCMoneyOff:'עדיין אין מספרים',xUnits:'צוות ה־AI: {x}',xInvite:'להזמין אנשים',xInviteT:'הזמנות עדיין לא נבנו. היום בעל/ת המרחב מוסיפים חברים.',
 xJ8:'J8',xOpenJ8:'לפתוח את J8',xCloseJ8:'לסגור את J8',xNotNow:'לא עכשיו',xAskJ8:'לשאול את J8 או את הצוות',xAskH:'לשאול את J8',xSnoozed:'מוסתר ל־24 שעות.',
 xCPlanW:'{n} צעדים מחכים, בערך {a}. היום שלך מכיל {b}.',xCPlanY:'לתכנן את היום כך שהצעדים העליונים ייכנסו.',xCMonW:'הכי קרוב לכסף: {x}.',xCMonY:'זה הצעד הכי קרוב לכסף ברשימה שלך.',
 xDoIt:'לעשות',xOpen:'לפתוח',xCDrW:'{x}: לבדוק לפני שליחה.',xCCalW:'ל־{n} צעדים פתוחים שלך אין יום.',xCCalY:'הם יופיעו ביומן ברגע שיקבלו יום.',
 xCWeakY:'הפרויקט החלש ביותר כרגע.',xCNone:'אין מה להוסיף כאן כרגע.',xWhySrc:'מהנתונים החיים שלך ב־J8NIX, {t}.',
 xPlanH:'לתכנן את היום',xPlanP:'J8 סימן את הצעדים שנכנסים ב־{b}, לפי מה שמשחרר הכי הרבה. לסמן או להוריד, ואז לאשר.',xPlanTot:'{a} מתוך {b}',xCommit:'לאשר תוכנית',xPlanned:'מתוכנן: {n} צעדים, {a}.',
 xMinShort:'{n} דק׳',xH:'{h} ש׳',xHM:'{h} ש׳ {m} דק׳',xItems1:'פריט אחד',xNofDone:'{a} מתוך {b} בוצעו',xBack:'חזרה',xMe:'אני'
});
Object.assign(TX.en,{whereTalk:'the J8 panel, in J8NIX',laterNote:'It waits under "Later" on Now, then comes back by itself.',commentLead:'Ideas or changes. The {t} team answers here and in the J8 panel.',goToday:'Go to Now',approvedLast:'Approved. It is under Done today on Now.',killedLast:'Killed. It will not be sent. It is under Done today on Now.',sentTo:'Sent to {t}, {h}. The answer comes here and in the J8 panel.',threadLead:'Ask a question or give a change. The {t} team answers here and in the J8 panel, usually within the hour.',sentToT:'Sent to {t}. The answer comes here and in the J8 panel.',askSent:'Sent. The answer comes in the J8 panel.',inclFirst:'It includes your first step on Now.',moreInToday:'{n} more on Now',seeTeam:'See the projects'});
Object.assign(TX.he,{whereTalk:'החלונית של J8, ב־J8NIX',laterNote:'זה מחכה תחת "אחר כך" בעכשיו, ואז חוזר לבד.',commentLead:'רעיונות או שינויים. צוות {t} עונה כאן ובחלונית של J8.',goToday:'ללכת לעכשיו',approvedLast:'אושר. זה תחת "בוצע היום" בעכשיו.',killedLast:'בוטל. זה לא יישלח. זה תחת "בוצע היום" בעכשיו.',sentTo:'נשלח אל {t}, {h}. התשובה מגיעה כאן ובחלונית של J8.',threadLead:'לשאול שאלה או לבקש שינוי. צוות {t} עונה כאן ובחלונית של J8, בדרך כלל תוך שעה.',sentToT:'נשלח אל {t}. התשובה מגיעה כאן ובחלונית של J8.',askSent:'נשלח. התשובה מגיעה בחלונית של J8.',inclFirst:'כולל את הצעד הראשון שלך בעכשיו.',moreInToday:'עוד {n} בעכשיו',seeTeam:'לראות את הפרויקטים'});
/* ---------- small helpers ---------- */
function bdi(x){return '<bdi>'+esc(x)+'</bdi>';}
function dur(m){m=Math.max(0,Math.round(m||0));var h=Math.floor(m/60),r=m%60;return h?(r?t('xHM',{h:h,m:r}):t('xH',{h:h})):t('xMinShort',{n:r});}
function capMin(){var c=ls('j8-cap');if(!isNum(c)){try{c=(J8.prefs.get()||{}).cap;}catch(e){c=null;}}return isNum(c)&&c>=30&&c<=720?c:180;}
function planToday(){var p=ls('j8-plan');if(!(p&&p.d===ymd(new Date()))){try{p=(J8.prefs.get()||{}).plan;}catch(e){p=null;}}return p&&p.d===ymd(new Date())&&Array.isArray(p.keys)?p:null;}
function minsI(i){return isNum(i.mins)?i.mins:10;}
function fitDay(N,cap){var a=0,L=[];N.forEach(function(i){if(a+minsI(i)<=cap||!L.length){L.push(i);a+=minsI(i);}});return L;}
function todayList(N){var pl=planToday();if(pl){var L=N.filter(function(i){return pl.keys.indexOf(i.key)>-1;});return {L:L,plan:true};}return {L:fitDay(N,capMin()),plan:false};}
function mono(name){var w=String(name||'?').replace(/[^\p{L}\p{N} ]/gu,' ').trim().split(/\s+/);return ((w[0]||'?').charAt(0)+(w[1]?w[1].charAt(0):(w[0]||'').charAt(1)||'')).toUpperCase();}
function ptile(pid,sz){if(pid&&PBADGE[pid])return tile(pid,sz);var p=pobj(pid);if(!p||pid==='p-general')return tile(pid,sz);return '<span class="tile mono '+(sz||'')+'" aria-hidden="true">'+esc(mono(p.name))+'</span>';}
function isDue(i){return i.sev==='r'||(i.due&&ymd(i.due)<=ymd(new Date()));}
function nextFixed(){var now=new Date(),td=ymd(now),hm=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),E=events().filter(function(e){return e.day>td||(e.day===td&&(!e.time||e.time>=hm));}).sort(function(a,b){return (a.day+(a.time||'99')).localeCompare(b.day+(b.time||'99'));});return E[0]||null;}
function evWhen(e){var d=new Date(e.day+'T12:00:00');return (e.day===ymd(new Date())?'':dayShort(d)+' ')+(e.time||'');}
function stalledDays(p){var lm=lastMove(p);if(!isNum(lm)||lm===-Infinity)return null;var d=Math.floor((Date.now()-lm)/864e5);return d;}
function healthOf(p){if(isDoneP(p)||p.status==='parked')return null;var ms=msOf(p);if(ms&&ms.at&&dday(ms.at)<ymd(new Date()))return {k:'over',w:t('xOverdue')};var d=stalledDays(p);if(d!=null&&d>=9)return {k:'stall',w:t('xStalled',{n:d}),d:d};return null;}
function liveP(){return projList().filter(function(p){return p.id!=='p-general';});}
function decisions(){return myQueue().filter(function(i){return i.batch||i.ap||i.c||i.held;});}
function asOfTxt(){return t('xAsOf',{t:UI.syncedAt?hm2(UI.syncedAt):'—'});}
/* mentor line in Hebrew too (the English branch is 8.1.1's) */
var mentorEN=mentor;
mentor=function(i){if(LANG!=='he')return mentorEN(i);var n=i.ul.length;
 if(i.wo.length)return 'קודם: '+itemNames(i.wo,2)+(n?' (ואז זה משחרר '+n+')':'')+'.';
 if(n)return 'זה משחרר '+n+' פריטים שמחכים.';
 if(i.money&&i.pp)return 'הכי קרוב לכסף: '+i.pp.name+'.';
 if(i.due)return 'עד '+dshort(i.due)+'.';
 if(i.age!==Infinity){var d=Math.floor((Date.now()-i.age)/864e5);if(d>=1)return 'מחכה '+d+' ימים.';}
 return '';};
function freesTxt(i){var n=i.ul.length;if(!n)return '';return LANG==='he'?n+' פריטים שמחכים':plainNames(i.ul);}
var nextOfEN=nextOf;
nextOf=function(i){var n=nextOfEN(i);if(LANG==='he'&&i.batch){var c=i.batch.items.length;n=Object.assign({},n,{what:'להחליט על '+(c===1?'טיוטה אחת':c+' טיוטות')+': '+(i.batch.label||'')});}return n;};
/* ---------- copy lint: no ops tags, role codes, function or table names, empty slots ---------- */
var ROLEW={CRO:['Revenue','הכנסות'],CFO:['Finance','כספים'],CDO:['Design','עיצוב'],CPO:['Product','מוצר'],CMO:['Marketing','שיווק'],CTO:['Tech','טכנולוגיה'],COO:['Ops','תפעול']};
function lintTxt(s){return s.replace(/\b(NEEDS YOUR EYES|WHAT YOU DO)\b\s*[:·—-]?\s*/g,'').replace(/\s*\(?\bj8_[a-z_]+\b\)?/g,'').replace(/\b(CRO|CFO|CDO|CPO|CMO|CTO|COO)\b/g,function(m){return ROLEW[m][LANG==='he'?1:0];}).replace(/\b(qa|tbd|todo) next\.\s*/gi,'');}
function lint(root){if(!root)return;var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),n,L=[];while((n=tw.nextNode())){var e=n.parentElement;if(!e||e.closest('textarea,.letter,script,style'))continue;L.push(n);}
 L.forEach(function(n){var v=n.nodeValue,w=lintTxt(v);if(w!==v)n.nodeValue=w;});}
/* ---------- Now ---------- */
function qRow(i,ix){var n=nextOf(i),pid=rowPid(i),p=pobj(pid),o=UI.open[i.key],top=ix<3,g=doTarget(i),k=esc(i.key);
 var prim=g.href?'<a class="qdo" href="'+hesc(g.href)+'" target="_blank" rel="noopener" data-a="do" data-k="'+k+'">'+t('do')+'</a>':'<button class="qdo" data-a="'+(g.done?'done':'do')+'" data-k="'+k+'">'+(g.done?t('markDone'):t('do'))+'</button>';
 if(UI.doing[i.key])prim='<button class="qdo" data-a="done" data-k="'+k+'">'+t('markDone')+'</button>';
 var fr=top&&i.ul.length?'<p class="frees" dir="auto">'+esc(t('xFrees',{x:freesTxt(i)}))+'</p>':'';
 return '<li class="qr'+(top?' t3':'')+(o?' open':'')+'" id="r-'+k+'"><div class="qm">'+(top?'<span class="ix"><bdi>'+(ix+1)+'</bdi></span>':'')+'<div class="qt"><b dir="auto">'+esc(cap1(n.what))+'</b>'+fr+'</div>'
  +'<span class="qp">'+ptile(pid,'sm')+'<span class="qpn" dir="auto">'+esc(p?p.name:(i.sub||pname(pid)))+'</span></span><span class="qmin">'+(isNum(i.mins)?bdi(dur(i.mins)):'')+'</span>'+prim
  +'<button class="qmore" data-a="row" data-k="'+k+'" aria-expanded="'+(o?'true':'false')+'">'+ic('dots')+'<span class="sr">'+t('xMore')+'</span></button></div>'+(o?'<div class="rmore">'+itemBody(i)+'</div>':'')+'</li>';}
function capQ(L,n,key,off){off=off||0;var o='<ol class="ql">'+L.slice(0,n).map(function(i,k){return qRow(i,k+off);}).join('')+'</ol>';
 if(L.length>n)o+='<details class="grp" data-k="'+key+'" data-was="'+(UI.open[key]?1:0)+'"'+(UI.open[key]?' open':'')+'><summary><span>'+t('xShowMore',{n:'<bdi>'+(L.length-n)+'</bdi>'})+'</span>'+ic('down','chev')+'</summary>'+(UI.open[key]?'<ol class="ql">'+L.slice(n).map(function(i,k){return qRow(i,k+n+off+3);}).join('')+'</ol>':'')+'</details>';return o;}
function sect(key,label,n,body,openDef){var op=key in UI.open?UI.open[key]:!!openDef;return '<details class="sec10" data-k="'+key+'" data-was="'+(op?1:0)+'"'+(op?' open':'')+'><summary><span>'+label+'</span><span class="n"><bdi>'+n+'</bdi></span>'+ic('down','chev')+'</summary>'+(op?body:'')+'</details>';}
function teamOpen(){return tasksAll().filter(function(x){return x.owner!=='dave'&&(!x.status||x.status==='open');});}
function kpis(){var m=J8.money.summary(),D=decisions(),P=liveP(),ov=0,st=0;P.forEach(function(p){var h=healthOf(p);if(h&&h.k==='over')ov++;else if(h)st++;});
 var mv=m?'<b class="kv"><bdi>'+esc(usd(isNum(m.booked_usd)?m.booked_usd:0))+'</bdi></b><span class="kl">'+esc(t('xKMoney'))+'</span><span class="ks">'+(isNum(m.m1_usd)?bdi(t('xKMoneyV',{a:usd(m.booked_usd||0),b:usd(m.m1_usd)})):'')+(m.m1_date&&J8.money.daysTo(m.m1_date)!=null?' · '+bdi(t('xKDays',{n:Math.max(0,J8.money.daysTo(m.m1_date))})):'')+'</span>'+(isNum(m.m1_usd)&&m.m1_usd>0?'<span class="km"><i style="width:'+Math.max(0,Math.min(100,(m.booked_usd||0)/m.m1_usd*100))+'%"></i></span>':'')
  :'<b class="kv">—</b><span class="kl">'+esc(t('xKMoney'))+'</span><span class="ks">'+esc(t('xKNoMoney'))+'</span>';
 return '<div class="kcs"><button class="kc" data-a="nav" data-id="money">'+mv+'</button>'
  +'<button class="kc" data-a="nav" data-id="inbox"><b class="kv"><bdi>'+D.length+'</bdi></b><span class="kl">'+esc(t('xKInbox'))+'</span><span class="ks">'+esc(D.length===1?t('xKDec1'):D.length?t('xKDec',{n:D.length}):t('xKDec0'))+'</span></button>'
  +'<button class="kc" data-a="x-risk"><b class="kv"><bdi>'+(ov+st)+'</bdi></b><span class="kl">'+esc(t('xKRisk'))+'</span><span class="ks"><bdi>'+esc(t('xKRiskV',{a:ov,b:st}))+'</bdi></span></button></div>';}
function vNow(){var h='<header class="ph"><div><h2 id="pageH" tabindex="-1">'+esc(dayStr())+'</h2>';
 if(!connected)return h+'</div></header><p class="lead" role="status">'+t('loadingDay')+'</p><div class="skel"></div><div class="skel"></div>';
 var nf=nextFixed();h+='<p class="sub">'+(nf?'<button class="lnk" data-a="jump" data-id="'+esc(nf.jump==='stats'?'money':nf.jump||'calendar')+'"><span>'+esc(t('xNextFixed',{x:''}))+'<bdi dir="auto">'+esc(evWhen(nf)+' '+cut(nf.title,60))+'</bdi></span></button>':esc(t('xNoFixed')))+'</p></div>';
 var N=myQueue(),cap=capMin(),TL=todayList(N),L=TL.L,tot=sumMins(L.map(function(i){return {mins:minsI(i)};}));
 h+='</header>'; /* 11.3: "Plan my day" removed (Dave 17 Nov); the Today panel on Next replaces it */
 if(J8.status().error==='offline'){var sa=UI.syncedAt?hm2(UI.syncedAt):'—';h+='<p class="held">'+ic('wifi')+'<span>'+esc(t('noConnP',{t:sa}))+'</span> <button class="lnk" data-a="retry">'+t('tryAgain')+'</button></p>';}
 if(!N.length){var D0=doneToday();return h+'<section class="empty10"><p>'+esc(t('xNothing'))+(nf?' '+esc(t('xNextFixed',{x:''}))+'<bdi dir="auto">'+esc(evWhen(nf)+' '+nf.title)+'</bdi>':'')+'</p><button class="btn" data-a="nav" data-id="projects">'+t('xOpen')+': '+t('projects')+'</button></section>'+kpis()+doneBlock(D0,false);}
 var pc=Math.min(100,tot/cap*100),over=tot>cap;
 h+='<div class="budget" role="img" aria-label="'+esc(t('xBudget'))+'"><span class="blab">'+ic('time')+t('xBudget')+'</span><span class="bm"><i style="width:'+pc+'%"></i></span><span class="bt"><bdi>'+esc(TL.plan?t('xBudgetPlan',{a:dur(tot),b:dur(cap),n:L.length}):t('xBudgetFit',{a:dur(tot),b:dur(cap),n:L.length}))+'</bdi></span></div>';
 var top=L.slice(0,3),restT=L.slice(3),later=N.filter(function(i){return L.indexOf(i)<0;}),tm=teamOpen(),D=doneToday();
 h+='<ol class="ql tops" aria-label="'+esc(t('first'))+'">'+top.map(qRow).join('')+'</ol>';
 h+=sect('nT',t('xToday'),restT.length,restT.length?capQ(restT,isDesk()?2:4,'nTall',3):'<p class="lead">—</p>',isDesk());
 h+=sect('nW',t('xWait'),tm.length,capL(tm,8,teamRow,'nWall'),false);
 h+=sect('nL',t('xLater'),later.length+plannedRows().length,(later.length?capQ(later,10,'nLall',3):'')+plannedBlock(),false);
 h+=kpis()+doneBlock(D,UI.open.doneOpen);
 return h;}
/* Money lens (from the Now KPI): the figures with their source and time, then what blocks money */
function vMoney(){var m=J8.money.summary(),M=myQueue().filter(function(i){return i.money;});
 var h='<header class="ph"><div>'+crumbs([['now',t('now')]])+'<h2 id="pageH" tabindex="-1">'+esc(t('xMoneyH'))+'</h2><p class="sub">'+esc(m&&m.updated?t('xSrc',{x:cut(m.by||'',60)})+' · '+t('xAsOf',{t:tm1(m.updated)}):asOfTxt())+'</p></div></header>';
 h+='<section class="card10">'+secMoney()+'</section><h3 class="h3">'+esc(t('xMoneyB'))+' <span class="n"><bdi>'+M.length+'</bdi></span></h3>';
 h+=M.length?capQ(M,6,'mAll'):'<p class="lead">'+esc(t('xMoneyNone'))+'</p>';return h;}
/* ---------- Inbox (master-detail on desktop, list → push on a phone) ---------- */
function inboxItems(){var Q=decisions(),R=J8.inbox.list().filter(function(x){return (x.task_id||x.approval_id||(x.p&&x.p!=='p-general'))&&lastTeamLine(x);}).slice(0,40);
 var L=Q.map(function(i){return {k:i.key,type:i.c?'q':'d',i:i};}).concat(R.map(function(x){return {k:'rp-'+x.id,type:'r',x:x};}));
 return L.filter(function(o){return UI.ifil==='all'||(UI.ifil==='d'&&o.type==='d')||(UI.ifil==='q'&&o.type==='q')||(UI.ifil==='r'&&o.type==='r');});}
function iRow(o){var sel=UI.isel===o.k,h,pid,ttl,sub,act='';
 if(o.type==='r'){var x=o.x,tg=msgTarget(Object.assign({id:x.id},x)),tt=targetTitle(tg),l=lastTeamLine(x);pid=tt.pid||x.p;ttl=tt.title;sub=t('xReplied',{t:pDept(pid)})+(l.t?' · '+l.t:'');}
 else{var i=o.i,n=nextOf(i);pid=rowPid(i);ttl=i.c?i.title:i.batch?(i.batch.label||n.what):cap1(n.what);
  sub=i.c?t('xTeamAsks',{t:pDept(i.c.p)}):i.batch?(i.batch.items.length===1?t('xNDraft1'):t('xNDrafts',{n:i.batch.items.length}))+(isNum(i.mins)?' · '+dur(i.mins):''):(i.held?i.sub:'');
  if(i.batch&&i.batch.items.length>=4)act='<button class="iset" data-a="x-set" data-id="'+esc(i.batch.id)+'">'+t('xSet')+'</button>';}
 h='<li class="ir'+(sel?' sel':'')+'"><button class="irb" data-a="x-isel" data-id="'+esc(o.k)+'" aria-current="'+(sel?'true':'false')+'">'+ptile(pid,'sm')+'<span class="rt"><b dir="auto">'+esc(ttl)+'</b><span class="sub" dir="auto">'+esc(pname(pid))+' · '+esc(sub)+'</span></span>'+(o.i&&isDue(o.i)?'<i class="dd" aria-hidden="true"></i>':'')+'</button>'+act+'</li>';return h;}
function iDetail(o){if(!o)return '<p class="lead pick">'+esc(t('xPick'))+'</p>';
 if(o.type==='r'){var x=o.x,tg=msgTarget(Object.assign({id:x.id},x)),tt=targetTitle(tg),L=teamLines(x);
  return '<h3 class="h3" dir="auto">'+esc(tt.title)+'</h3><div class="msgs">'+L.slice(-4).map(function(l){return '<p class="msg" dir="auto">'+(l.t?'<time>'+esc(l.t)+'</time> ':'')+esc(sevStrip(l.x))+'</p>';}).join('')+'</div><button class="btn" data-a="thread-msg" data-id="'+esc(x.id)+'">'+ic('comment')+'<span>'+t('xOpenThread')+'</span></button>';}
 var i=o.i;if(i.batch||i.ap){var bid=i.batch?i.batch.id:'ap:'+i.ap.id,ids=i.batch?i.batch.items.map(function(a){return a.id;}):[i.ap.id];
  if(UI.batch!==bid||!(UI.dids||[]).length){UI.batch=bid;UI.dids=ids;UI.editing=false;}UI.draftFrom='inbox';return draftCheck()+vDraft10().replace(/id="pageH"/g,'id="dH"');}
 if(i.c){var c=i.c,u=firstUrl(c.reply);return '<h3 class="h3" dir="auto">'+esc(i.title)+'</h3><p class="sub" dir="auto">'+esc(t('xTeamAsks',{t:pDept(c.p)}))+' · '+esc(pname(c.p))+(c.at?' · '+esc(tm1(c.at)):'')+'</p>'+(askLine(c)!==i.title?'<p dir="auto">'+esc(askLine(c).replace(/https?:\/\/\S+/g,'').trim())+'</p>':'')
  +(u?'<p class="mt"><a class="btn go" href="'+hesc(u)+'" target="_blank" rel="noopener">'+ic('link')+'<span>'+t('openLink')+'</span></a></p>':'')
  +'<form class="cbox" data-ans="'+esc(c.p)+'" data-ask="'+esc(i.key)+'"><label class="sr" for="aq">'+t('answerPh')+'</label><textarea id="aq" rows="2" dir="auto" placeholder="'+esc(t('answerPh'))+'"></textarea><button class="btn pri" type="submit">'+ic('send','flip')+'<span>'+t('send')+'</span></button></form>';}
 return '<h3 class="h3" dir="auto">'+esc(cap1(nextOf(i).what))+'</h3>'+itemBody(i);}
function draftCheck(){var L=UI.dids||[],cur=L.filter(isPend)[0],a=cur?AP[cur]:null;if(!a)return '';var txt=J8.approvals.textOf(Object.assign({id:cur},a))||'',w=txt.trim()?txt.trim().split(/\s+/).length:0,dw=new Date().getDay(),q=dw===5||dw===6;
 return '<aside class="j8card" aria-label="'+esc(t('xCheck'))+'"><b>'+g8()+esc(t('xCheck'))+'</b><ul><li dir="auto">'+esc(a.to?t('xChkTo',{x:cut(a.to,90)}):t('xChkNoTo'))+'</li><li>'+esc(t('xChkWin',{x:q?t('xWinSun'):t('xWinNext')}))+'</li><li><bdi>'+esc(t('xChkLen',{n:w}))+'</bdi></li></ul></aside>';}
function vInbox(){var h='<header class="ph"><div><h2 id="pageH" tabindex="-1">'+esc(t('inbox'))+'</h2><p class="sub">'+esc(asOfTxt())+'</p></div></header>';
 if(!connected)return h+'<div class="skel"></div>';
 var F=[['all','xFAll'],['d','xFDrafts'],['q','xFQ'],['r','xFRep']];h+='<div class="segc" role="group" aria-label="'+esc(t('inbox'))+'">'+F.map(function(f){return '<button class="opt" data-a="x-ifil" data-id="'+f[0]+'" aria-pressed="'+(UI.ifil===f[0]?'true':'false')+'">'+t(f[1])+'</button>';}).join('')+'</div>';
 var L=inboxItems();if(!L.length)return h+'<section class="empty10"><p>'+esc(t('xInboxNone'))+'</p><button class="btn" data-a="nav" data-id="now">'+t('xOpen')+': '+t('now')+'</button></section>';
 var desk=isDesk(),sel=L.filter(function(o){return o.k===UI.isel;})[0];if(desk&&!sel){sel=L[0];UI.isel=sel.k;}
 var n=30,list='<ul class="il">'+L.slice(0,n).map(iRow).join('')+'</ul>'+(L.length>n?'<details class="grp" data-k="iAll" data-was="'+(UI.open.iAll?1:0)+'"'+(UI.open.iAll?' open':'')+'><summary><span>'+t('xShowMore',{n:'<bdi>'+(L.length-n)+'</bdi>'})+'</span>'+ic('down','chev')+'</summary>'+(UI.open.iAll?'<ul class="il">'+L.slice(n).map(iRow).join('')+'</ul>':'')+'</details>':'');
 return h+(desk?'<div class="mdg"><div class="mdl">'+list+'</div><div class="mdd" id="mdd">'+iDetail(sel)+'</div></div>':list);}
function allInbox(){var s=UI.ifil;UI.ifil='all';var r=inboxItems();UI.ifil=s;return r;}
function vDraft10(){return vDraft().replace('<button class="kill" data-a="dkill"','<button data-a="x-skip">'+ic('fwd','flip')+'<span>'+t('xSkip')+'</span></button><button class="kill" data-a="dkill"');}
function vQitem(){var o=allInbox().filter(function(x){return x.k===UI.isel;})[0];
 return '<header class="ph"><div>'+crumbs([['inbox',t('inbox')]])+'</div></header><span id="pageH" tabindex="-1" class="sr">'+esc(t('inbox'))+'</span>'+(o?iDetail(o):'<p class="lead">'+esc(t('xInboxNone'))+'</p>');}
function sampler(bid){var L=apPending().filter(function(a){return bkey(a)===bid;}),n=L.length;if(!n)return;var S=[L[0],L[n>>1],L[n-1]].filter(function(a,k,A){return A.indexOf(a)===k;});UI.gsheet={k:'set'};
 gOpen('<h2 id="gTitle">'+esc(t('xSampleH',{n:n}))+'</h2><p class="lead">'+esc(t('xSampleP',{n:n}))+'</p>'+S.map(function(a){return '<article class="letter sm" dir="auto"><b>'+esc(apWho(a))+'</b>\n'+esc(J8.approvals.textOf(a)||'')+'</article>';}).join('')
  +'<div class="abar two"><button class="do" data-a="x-setall" data-id="'+esc(bid)+'">'+ic('check')+'<span>'+esc(t('xApproveAll',{n:n}))+'</span></button><button data-a="x-set1" data-id="'+esc(bid)+'">'+ic('do','flip')+'<span>'+t('xOneByOne')+'</span></button></div><button class="btn wide mt" data-a="gclose">'+t('close')+'</button>','var(--rail)');}
function setAll(bid){var ids=apPending().filter(function(a){return bkey(a)===bid;}).map(function(a){return a.id;});gClose();if(!J8.status().connected){toast(t('notConn'));return;}
 seq(ids,function(id){return J8.approvals.approve(id);}).then(function(){toast(t('xApprovedAll',{n:ids.length}),function(){seq(ids,function(id){return J8.approvals.undo(id);}).then(function(){toast(t('backWaiting'));});});render();});}
/* ---------- Projects: board by stage (list for many), filters instead of levels ---------- */
function pPass(p,M){var f=UI.pf;if(f.u!=='all'&&p.unit_id!==f.u)return false;if(f.o!=='all'&&holderOf(p,M)!==f.o)return false;if(f.n&&!projNeed(p.id).length)return false;if(f.risk&&!healthOf(p))return false;return true;}
function pCard(p,M){var ng=nextGoal(p),y=youReal(p),h=healthOf(p),ho=holderOf(p,M),w=projNeed(p.id).length;
 return '<li><button class="pc" data-a="proj" data-id="'+esc(p.id)+'">'+ptile(p.id,'md')+'<span class="rt"><b dir="auto">'+esc(p.name)+'</b><span class="nx" dir="auto">'+esc(t('xNext',{x:cut(sevStrip(y||(ng?ng.x:'—')),80)}))+'</span><span class="pmeta"><span class="own10 '+(ho==='me'?'you':'')+'">'+esc(ho==='me'?t('xYou'):ho==='ext'?t('xOutside'):t('xTeam'))+(w?' · <bdi>'+w+'</bdi>':'')+'</span>'+(h?'<span class="hw '+h.k+'">'+esc(h.w)+'</span>':'')+'</span></span></button></li>';}
function stBar(s){var o='<span class="stbar" aria-hidden="true">';for(var k=1;k<=6;k++)o+='<i class="'+(k<=s?(k===6?'pay':'on'):'')+'"></i>';return o+'</span>';}
function vProjects(){var M=mineBy(),A=liveP(),P=A.filter(function(p){return pPass(p,M);}),f=UI.pf;if(UI.v==='dept'&&UI.dept){f.u=UI.dept==='_'?'all':UI.dept;UI.v='projects';}
 var view=f.view||(A.length>24?'list':'board'),U=unitsSorted();
 var h='<header class="ph"><div><h2 id="pageH" tabindex="-1">'+esc(t('projects'))+' <span class="n"><bdi>'+P.length+'</bdi></span></h2><p class="sub">'+esc(asOfTxt())+'</p></div></header>';
 h+='<div class="filt"><label><span>'+t('xDept')+'</span><select data-x="pf-u"><option value="all">'+t('xAnyone')+'</option>'+U.map(function(u){return '<option value="'+esc(u.id)+'"'+(f.u===u.id?' selected':'')+'>'+esc(lintTxt(u.name))+'</option>';}).join('')+'</select></label>'
  +'<label><span>'+t('xOwner')+'</span><select data-x="pf-o"><option value="all">'+t('xAnyone')+'</option><option value="me"'+(f.o==='me'?' selected':'')+'>'+t('xYou')+'</option><option value="team"'+(f.o==='team'?' selected':'')+'>'+t('xTeam')+'</option><option value="ext"'+(f.o==='ext'?' selected':'')+'>'+t('xOutside')+'</option></select></label>'
  +'<button class="opt" data-a="x-pfn" aria-pressed="'+(f.n?'true':'false')+'">'+t('xNeedsMe')+'</button>'+(f.risk?'<button class="opt" data-a="x-pfr" aria-pressed="true">'+t('xKRisk')+'</button>':'')
  +'<span class="segc sm" role="group" aria-label="View"><button class="opt" data-a="x-pv" data-id="board" aria-pressed="'+(view==='board'?'true':'false')+'">'+t('xBoard')+'</button><button class="opt" data-a="x-pv" data-id="list" aria-pressed="'+(view==='list'?'true':'false')+'">'+t('xList')+'</button></span></div>';
 var act=P.filter(function(p){return p.status!=='parked'&&!isDoneP(p);}),park=P.filter(function(p){return p.status==='parked';}),done=P.filter(isDoneP);
 if(view==='list'){var S=act.slice().sort(f.sort==='name'?function(a,b){return String(a.name).localeCompare(String(b.name));}:f.sort==='health'?function(a,b){return (healthOf(b)?1:0)-(healthOf(a)?1:0);}:function(a,b){return stageOf(b)-stageOf(a);});
  h+='<table class="pt"><thead><tr><th><button class="lnk" data-a="x-psort" data-id="name">'+t('xName')+'</button></th><th><button class="lnk" data-a="x-psort" data-id="stage">'+t('xStage')+'</button></th><th class="hide-s">'+t('xOwner')+'</th><th><button class="lnk" data-a="x-psort" data-id="health">'+t('xHealth')+'</button></th></tr></thead><tbody>'
   +S.map(function(p){var s=stageOf(p),hh=healthOf(p),ho=holderOf(p,M);return '<tr><td><button class="pl" data-a="proj" data-id="'+esc(p.id)+'">'+ptile(p.id,'sm')+'<span dir="auto">'+esc(p.name)+'</span></button></td><td>'+(s?stBar(s)+' '+esc(stg(s)):esc(t('xNoStage')))+'</td><td class="hide-s">'+esc(ho==='me'?t('xYou'):ho==='ext'?t('xOutside'):t('xTeam'))+'</td><td>'+(hh?'<span class="hw '+hh.k+'">'+esc(hh.w)+'</span>':esc(t('xOk')))+'</td></tr>';}).join('')+'</tbody></table>';}
 else{var lanes=[0,1,2,3,4,5,6].map(function(s){return {s:s,P:act.filter(function(p){return stageOf(p)===s;})};}).filter(function(l){return l.s>0||l.P.length;});
  h+='<div class="board">'+lanes.map(function(l){var k='ln'+l.s,op=UI.open[k],L=op?l.P:l.P.slice(0,6);
   return '<section class="lane10"><h3>'+(l.s?stBar(l.s)+'<span>'+esc(stg(l.s))+'</span>':'<span>'+esc(t('xNoStage'))+'</span>')+'<span class="n"><bdi>'+l.P.length+'</bdi></span></h3><ul>'+L.map(function(p){return pCard(p,M);}).join('')+'</ul>'+(l.P.length>6?'<button class="lnk more" data-a="lane" data-id="'+l.s+'">'+(op?t('close'):t('xShowMore',{n:'<bdi>'+(l.P.length-6)+'</bdi>'}))+'</button>':'')+'</section>';}).join('')+'</div>';}
 if(park.length)h+=sect('pPark',t('xParked'),park.length,'<ul class="cards">'+park.map(function(p){return pCard(p,M);}).join('')+'</ul>',false);
 if(done.length)h+=sect('pDone',t('xDone'),done.length,'<ul class="cards">'+done.map(function(p){return pCard(p,M);}).join('')+'</ul>',false);
 return h;}
function vProj(){var p=pobj(UI.proj);if(!p){UI.v='projects';return vProjects();}var s=stageOf(p),mine=projNeed(p.id),pk=mine.length?null:parkedAsks().filter(function(i){return i.p.id===p.id;})[0],y=mine[0]||pk,hh=healthOf(p),ms=msOf(p);
 var h='<header class="ph proj"><div>'+crumbs([['projects',t('projects')]])+'<div class="phl">'+ptile(p.id,'lg')+'<div><h2 id="pageH" tabindex="-1" dir="auto">'+esc(p.name)+'</h2><p class="sub">'+(s?stBar(s)+' <bdi>'+esc(t('xStageOf',{a:s,s:stg(s)}))+'</bdi>':esc(t('xNoStage')))+' · <span class="hw '+(hh?hh.k:'ok')+'">'+esc(hh?hh.w:p.status==='parked'?t('xParked'):isDoneP(p)?t('xDone'):t('xOk'))+'</span></p></div></div></div></header>';
 h+='<section class="ystep"><h3 class="h3">'+esc(t('xYourStep'))+'</h3>'+(y?'<p class="yt" dir="auto"><b>'+esc(cap1(nextOf(y).what))+'</b>'+(isNum(y.mins)?' · '+bdi(dur(y.mins)):'')+'</p>'+itemBody(y):'<p class="lead">'+esc(t('xNoStep'))+'</p>')+'</section>';
 var team=tasksAll().filter(function(x){return x.project_id===p.id&&x.owner!=='dave'&&(!x.status||x.status==='open');}),nw=sevStrip(String(p.now||'')).trim();
 h+='<div class="cols3"><section><h3 class="h3">'+esc(t('xNowH'))+'</h3>'+(nw?(nw.length>420?'<details class="fold"><summary dir="auto">'+esc(nw.slice(0,300))+'…</summary><p dir="auto">'+esc(nw)+'</p></details>':'<p dir="auto">'+esc(nw)+'</p>'):'<p class="lead">—</p>')+pcount(p)+'</section>'
  +'<section><h3 class="h3">'+esc(t('xStepsH'))+' <span class="n"><bdi>'+(Math.max(0,mine.length-1)+team.length)+'</bdi></span></h3>'+(mine.length>1?capL(mine.slice(1),3,rowItem,'mineAll-'+p.id):'')+(team.length?capL(team,4,teamRow,'teamAll-'+p.id):'')+(mine.length<2&&!team.length?'<p class="lead">—</p>':'')+'</section>'
  +'<section><h3 class="h3">'+esc(t('xMsH'))+'</h3>'+(ms?'<p dir="auto"><b>'+esc(ms.t)+'</b></p><p class="sub">'+(ms.at?bdi(dlabelL(ms.at)+(dtime(ms.at)?' '+dtime(ms.at):'')):esc(t('xEta')))+'</p>':'<p class="lead">'+esc(t('xMsNone'))+'</p>')+'</section></div>';
 var DR=apPending().filter(function(a){return a.product===p.id;}),seg=UI.pseg;
 h+='<div class="segc" role="group" aria-label="'+esc(p.name)+'"><button class="opt" data-a="x-pseg" data-id="act" aria-pressed="'+(seg==='act'?'true':'false')+'">'+t('xSegAct')+'</button><button class="opt" data-a="x-pseg" data-id="dr" aria-pressed="'+(seg==='dr'?'true':'false')+'">'+t('xSegDr')+' <bdi>'+DR.length+'</bdi></button><button class="opt" data-a="x-pseg" data-id="rev" aria-pressed="'+(seg==='rev'?'true':'false')+'">'+t('xSegRev')+'</button></div>';
 if(seg==='dr'){h+=DR.length?'<ul class="il">'+DR.slice(0,20).map(function(a){return '<li class="ir"><button class="irb" data-a="opendraft" data-id="'+esc(bkey(a))+'"><span class="rt"><b dir="auto">'+esc(apKind(a)+': '+apWho(a))+'</b><span class="sub" dir="auto">'+esc(a.batch_label||'')+'</span></span></button></li>';}).join('')+'</ul>':'<p class="lead">'+esc(t('xNoDrafts'))+'</p>';}
 else if(seg==='rev'){var R=[];if(hh&&hh.k==='over')R.push(t('xRevOverdue'));var sd=stalledDays(p);if(sd!=null&&sd>=9)R.push(t('xRevStalled',{n:sd}));if(!ms)R.push(t('xRevNoMs'));if(!String(p.next||'').trim()&&!y)R.push(t('xRevNoNext'));
  h+='<aside class="j8card"><b>'+g8()+esc(t('xSegRev'))+'</b><ul>'+(R.length?R:[t('xRevOk')]).map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul><p class="src">'+esc(t('xWhySrc',{t:UI.syncedAt?hm2(UI.syncedAt):'—'}))+'</p></aside>';}
 else{var hold=J8.approvals.list().filter(function(a){return a.product===p.id&&a.kind!=='template'&&(a.status==='approved'||a.status==='edited'||a.status==='queued');});
  if(hold.length)h+='<details class="grp" data-k="hold-'+esc(p.id)+'"'+(UI.open['hold-'+p.id]?' open':'')+'><summary>'+ic('lock')+'<span>'+t('approvedWait')+'</span><span class="n"><bdi>'+hold.length+'</bdi></span>'+ic('down','chev')+'</summary><ul class="names">'+hold.map(function(a){return '<li dir="auto">'+esc(apKind(a)+': '+apWho(a))+'</li>';}).join('')+'</ul></details>';
  var D=tasksAll().filter(function(x){return x.project_id===p.id&&x.status==='done';}).sort(function(a,b){return String(b.done_at||'').localeCompare(String(a.done_at||''));});
  if(D.length)h+='<details class="grp done" data-k="pd-'+esc(p.id)+'"'+(UI.open['pd-'+p.id]?' open':'')+'><summary>'+ic('check')+'<span>'+t('doneHere2')+'</span><span class="n"><bdi>'+D.length+'</bdi></span>'+ic('down','chev')+'</summary><div class="list">'+D.slice(0,UI.open['pdAll-'+p.id]?500:20).map(function(x){
   return '<div class="drow"><button class="dlink" data-a="thread-task" data-id="'+esc(x.id)+'"><b dir="auto" class="strike">'+esc(x.title)+'</b><span class="sub">'+t('doneW')+(x.done_at?', '+esc(fdate(x.done_at)):'')+'</span></button>'+(x.owner==='dave'?'<button class="undo" data-a="untick" data-id="'+esc(x.id)+'">'+ic('undo')+'<span>'+t('undo')+'</span></button>':'')+'</div>';}).join('')+'</div></details>';
  var pm1=J8.inbox.forProject(p.id).filter(function(x){return !x.task_id&&!x.approval_id;})[0],last=pm1?lastTeamLine(pm1):null;if(!hold.length&&!D.length&&!last)h+='<p class="lead">'+esc(t('xNoAct'))+'</p>';
  if(last)h+='<button class="lastline" data-a="thread-proj" data-id="'+esc(p.id)+'">'+sevChip(last.v)+'<span dir="auto">'+esc(last.x)+'</span></button>';
  if(p.link)h+='<div class="links"><a class="btn go" href="'+hesc(p.link)+'" target="_blank" rel="noopener">'+ic('link')+'<span dir="auto">'+esc(p.link_text||(LANG==='he'?'לפתוח את הפרויקט':'Open the project'))+'</span></a></div>';
  h+='<div class="pinc"><form class="cbox" data-ans="'+esc(p.id)+'"><label class="sr" for="pc-'+esc(p.id)+'">'+t('yourComment')+'</label><textarea id="pc-'+esc(p.id)+'" rows="1" dir="auto" placeholder="'+esc(t('writeC'))+'"></textarea><button class="btn pri" type="submit">'+ic('send','flip')+'<span>'+t('send')+'</span></button></form></div>';}
 return h;}
/* ---------- Calendar: a mini week, a "No date" bucket, a 14-day agenda ---------- */
function vCal(){var h='<header class="ph"><div><h2 id="pageH" tabindex="-1">'+esc(t('calendar'))+'</h2><p class="sub">'+esc(asOfTxt())+'</p></div></header>';if(!connected)return h+'<div class="skel"></div>';
 var E=events(),now=new Date(),D=[];for(var k=0;k<14;k++){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+k,12);D.push({d:d,key:ymd(d),ev:[]});}
 E.forEach(function(e){var x=D.filter(function(dd){return dd.key===e.day;})[0];if(x)x.ev.push(e);});
 h+='<ol class="mweek">'+D.slice(0,7).map(function(dd,k){var n=dd.ev.length;return '<li class="'+(k===0?'td':'')+'"><span>'+esc(dayShort(dd.d))+'</span><span class="dots" role="img" aria-label="'+n+'">'+'<i></i>'.repeat(Math.min(4,n))+'</span></li>';}).join('')+'</ol>';
 var nd=tasksAll().filter(function(x){return x.owner==='dave'&&(!x.status||x.status==='open')&&!x.due;});
 if(nd.length)h+='<div class="nodate"><span>'+esc(t('xCalNoDate'))+' · <bdi>'+nd.length+'</bdi></span></div>';
 h+='<p class="lead">'+esc(t('xCalConn'))+' <button class="lnk" data-a="nav" data-id="me">'+t('xConn')+'</button></p>';
 var has=D.filter(function(dd){return dd.ev.length;});if(!has.length)return h+'<section class="empty10"><p>'+esc(t('xCalNone'))+'</p></section>';
 h+='<div class="agenda">'+has.map(function(dd){dd.ev.sort(function(a,b){return (a.time||'99').localeCompare(b.time||'99');});var k='cd'+dd.key,L=UI.open[k]?dd.ev:dd.ev.slice(0,8);
  return '<section><h3>'+esc(dayStr(dd.d))+'</h3><ul>'+L.map(function(e){var goal=e.jump==='stats',ty=goal?t('xTGoal'):e.k==='ms'?t('xTMs'):e.k==='you'?t('xYou'):t('xTeam');
   return '<li><button class="agr" data-a="jump" data-id="'+esc(goal?'money':(e.jump||''))+'"><time>'+esc(e.time||'')+'</time>'+ptile(e.pid,'sm')+'<span class="rt"><b dir="auto">'+esc(goal?t('m1goal',{a:usd((J8.money.summary()||{}).m1_usd||0)}):e.title)+'</b><span class="sub" dir="auto">'+esc(e.sub||'')+'</span></span><span class="tg '+(e.k==='you'?'you':'')+'">'+esc(ty)+'</span></button></li>';}).join('')+'</ul>'+(dd.ev.length>8&&!UI.open[k]?'<button class="lnk more" data-a="x-open" data-id="'+k+'">'+t('xShowMore',{n:'<bdi>'+(dd.ev.length-8)+'</bdi>'})+'</button>':'')+'</section>';}).join('')+'</div>';
 return h;}
/* ---------- Me: profile, organisation, connections with true status, preferences, sending, help ---------- */
function connRow(name,st,on,btn){return '<li class="cr"><span class="cl">'+esc(name.charAt(0))+'</span><span class="rt"><b>'+esc(name)+'</b><span class="sub '+(on?'on':'')+'">'+(on?ic('check'):'')+esc(st)+'</span></span>'+btn+'</li>';}
function vMe(){var st=J8.status(),u=st.user||{},o=J8.orgs.current()||{},ctl=J8.control.get()||{},m=J8.money.summary(),soon=function(n){return '<button class="btn" data-a="x-soon" data-id="'+esc(n)+'">'+t('xSoon')+'</button>';};
 var h='<header class="ph"><div><h2 id="pageH" tabindex="-1">'+esc(t('me'))+'</h2></div></header>';
 h+='<section class="mesec"><h3 class="h3">'+esc(t('xProfile'))+'</h3><div class="prof"><span class="av big" aria-hidden="true">'+esc(mono(u.email||'?'))+'</span><div><b dir="auto">'+esc(u.email||'—')+'</b><p class="sub">'+esc((st.role||'')+(o.name?' · '+o.name:''))+'</p></div></div></section>';
 var U=unitsSorted().map(function(x){return lintTxt(x.name);});
 h+='<section class="mesec"><h3 class="h3">'+esc(t('xOrg'))+'</h3>'+(U.length?'<p dir="auto">'+esc(t('xUnits',{x:U.join(', ')}))+'</p>':'')+'<div data-slot="msAcct"></div><button class="btn" data-a="x-soon" data-id="'+esc(t('xInvite'))+'" data-t="invite">'+t('xInvite')+'</button></section>';
 h+='<section class="mesec"><h3 class="h3">'+esc(t('xConn'))+'</h3><ul class="conns">'
  +connRow(t('xCData'),st.connected?t('xCOn')+' · '+asOfTxt():t('xCOff'),st.connected,st.connected?'':'<button class="btn" data-a="retry">'+t('tryAgain')+'</button>')
  +connRow(t('xCMail'),ctl.email_from_ok?t('xCMailOn'):t('xCMailOff'),!!ctl.email_from_ok,'<button class="btn" data-cx="open">'+t('xManage')+'</button>')
  +connRow(t('xCMoney'),m&&m.updated?t('xCMoneyOn',{t:tm1(m.updated)}):t('xCMoneyOff'),!!(m&&m.updated),m?'<button class="btn" data-a="nav" data-id="money">'+t('xOpen')+'</button>':'')
  +connRow(t('xCCal'),t('xNotConn'),false,soon(t('xCCal')))+connRow(t('xCWa'),t('xNotConn'),false,soon(t('xCWa')))+connRow(t('xCPay'),t('xNotConn'),false,soon(t('xCPay')))+connRow(t('xCLi'),t('xNotConn'),false,soon(t('xCLi')))
  +'</ul><div data-slot="msPush"></div></section>';
 var cap=capMin();h+='<section class="mesec"><h3 class="h3">'+esc(t('xPrefs'))+'</h3><div data-slot="msPrefs"></div><div class="sh-grp"><h3 id="capH">'+esc(t('xCapH'))+'</h3><p class="sub">'+esc(t('xCapP'))+'</p><div class="seg3" role="group" aria-labelledby="capH">'+[60,120,180,240,360].map(function(c){return '<button class="opt" data-a="x-cap" data-id="'+c+'" aria-pressed="'+(cap===c?'true':'false')+'"><bdi>'+esc(dur(c))+'</bdi></button>';}).join('')+'</div></div>'
  +'<div class="sh-row"><div><b>'+esc(t('xQuietH'))+'</b><span>'+esc(t('xQuietP'))+'</span></div></div></section>';
 h+='<section class="mesec"><h3 class="h3">'+esc(t('xSending'))+'</h3><div data-slot="msSend"></div></section><section class="mesec"><div data-slot="msHelp"></div></section>';
 return h;}
function parkMe(){var pk=$('mePark');if(!pk)return;['msSend','msPush','msPrefs','msHelp','msAcct'].forEach(function(id){var e=$(id);if(e&&e.parentNode!==pk)pk.appendChild(e);});}
function slotMe(){[].forEach.call(document.querySelectorAll('#main [data-slot]'),function(s){var e=$(s.dataset.slot);if(e)s.appendChild(e);});}
function meWords(){var W={mSendH:LANG==='he'?'שליחה על ידי צוות ה־AI':'Sending by the AI team',mCtlH:LANG==='he'?'בקרה':'Control',mCtlP:LANG==='he'?'מגבלות יומיות, לוח הזמנים של הצוות, תבניות, לא ליצור קשר.':'Daily limits, team schedule, templates, do-not-contact.',
 mPushH:LANG==='he'?'התראות במכשיר הזה':'Alerts on this device',mPushP:LANG==='he'?'תשובות מהצוות, עבודה שהסתיימה, טיוטות לאישור.':'Team replies, finished work, drafts to OK.',mOrgH:LANG==='he'?'עסק':'Business',mWhoH:LANG==='he'?'מחובר/ת':'Signed in',mLiveH:LANG==='he'?'נתונים חיים':'Live data',ctlBackL:t('me'),signOut:LANG==='he'?'להתנתק':'Sign out',ctlBtn:LANG==='he'?'לפתוח':'Open'};
 Object.keys(W).forEach(function(id){var e=$(id);if(e)e.textContent=W[id];});var ct=$('connTxt');if(ct)ct.textContent=J8.status().connected?t('xCOn')+' · '+asOfTxt():t('xCOff');var tb=$('tipB');if(tb&&tb.lastChild)tb.lastChild.textContent=t('showTip');}
/* ---------- J8 panel: at most 2 cards about what is on screen, then Ask (the team thread, composer pinned) ---------- */
function j8Card(key,what,why,act,actId,actData){if(snoozed('j8c-'+key))return null;return {k:key,h:'<article class="j8card" data-key="'+esc(key)+'"><p class="w" dir="auto">'+what+'</p><p class="y" dir="auto">'+esc(why)+'</p><div class="acts">'+(act?'<button class="lk" data-a="'+act+'"'+(actId?' data-id="'+esc(actId)+'"':'')+(actData?' data-k="'+esc(actData)+'"':'')+'>'+esc(t('xDoIt'))+'</button>':'')+'<button class="lk" data-a="x-snz" data-id="'+esc(key)+'">'+t('xNotNow')+'</button><button class="lk" data-a="x-why" data-id="'+esc(key)+'" aria-expanded="'+(UI.open['why-'+key]?'true':'false')+'">'+t('xWhy')+'</button></div>'+(UI.open['why-'+key]?'<p class="src">'+esc(t('xWhySrc',{t:UI.syncedAt?hm2(UI.syncedAt):'—'}))+'</p>':'')+'</article>'};}
function j8Cards(){if(!connected)return [];var C=[],pl=curPlace(),v=UI.v,N=myQueue();
 if(v==='now'&&N.length){var cap=capMin(),tot=sumMins(N.map(function(i){return {mins:minsI(i)};}));
  var mi=N.filter(function(i){return i.money;})[0];if(mi)C.push(j8Card('money-'+mi.key,esc(t('xCMonW',{x:cap1(nextOf(mi).what)})),t('xCMonY'),'x-goitem',null,mi.key));}
 else if(v==='money'){var mi2=N.filter(function(i){return i.money;})[0];if(mi2)C.push(j8Card('money-'+mi2.key,esc(t('xCMonW',{x:cap1(nextOf(mi2).what)})),t('xCMonY'),'x-goitem',null,mi2.key));}
 else if(v==='proj'){var p=pobj(UI.proj),hh=p&&healthOf(p);if(hh)C.push(j8Card('risk-'+p.id,esc(p.name+': '+hh.w),t('xCWeakY'),'x-pseg','rev'));}
 else if(pl==='inbox'&&(UI.dids||[]).length){var cur=(UI.dids||[]).filter(isPend)[0];if(cur)C.push(j8Card('dr-'+cur,esc(t('xCDrW',{x:apWho(Object.assign({id:cur},AP[cur]))})),(AP[cur]&&AP[cur].to)?t('xChkTo',{x:cut(AP[cur].to,60)}):t('xChkNoTo'),null));}
 else if(v==='calendar'){var nd=tasksAll().filter(function(x){return x.owner==='dave'&&(!x.status||x.status==='open')&&!x.due;}).length;}
 else if(v==='projects'){var M=mineBy(),W=liveP().map(function(p){return {p:p,h:healthOf(p)};}).filter(function(x){return x.h;}).sort(function(a,b){return (b.h.k==='over'?999:b.h.d||0)-(a.h.k==='over'?999:a.h.d||0);})[0];if(W)C.push(j8Card('weak-'+W.p.id,esc(W.p.name+': '+W.h.w),t('xCWeakY'),'proj',W.p.id));}
 return C.filter(Boolean).slice(0,2);}
function j8Open(){return document.body.dataset.j8==='open';}
function setJ8(on,focus){document.body.dataset.j8=on?'open':'closed';if(isWide())ls('j8-panel',on?1:0);['j8Btn','j8Strip'].forEach(function(id){var e=$(id);if(e)e.setAttribute('aria-expanded',on?'true':'false');});
 var sc=$('scrim');if(sc&&!isWide())sc.hidden=!on&&$('gsheet').hidden&&$('sheet').hidden;renderJ8();if(on&&focus){var i=$('j8cIn');if(i)i.focus();}}
function isWide(){return window.matchMedia?matchMedia('(min-width:1100px)').matches:true;}
function renderJ8(){var C=j8Cards(),c=$('j8Cards'),lg=$('j8cLog');
 var dot=$('j8Dot'),nn=$('j8N');if(dot)dot.hidden=!C.length;if(nn){nn.hidden=!C.length;nn.textContent=C.length||'';}
 var L={j8H:'xJ8',j8TalkH:'xAskH',j8StripL:'xOpenJ8',j8CloseL:'xCloseJ8',j8BtnL:'xOpenJ8',j8cInL:'xAskJ8',j8cGoL:'send',kbarL:'xSearch'};Object.keys(L).forEach(function(id){var e=$(id);if(e)e.textContent=t(L[id]);});var ci=$('j8cIn');if(ci)ci.placeholder=t('xAskJ8');
 if(!j8Open())return;
 if(c){c.innerHTML=C.length?C.map(function(x){return x.h;}).join(''):'<p class="lead">'+esc(t('xCNone'))+'</p>';lint(c);}
 if(lg){var nb=lg.scrollHeight-lg.scrollTop-lg.clientHeight<48;lg.innerHTML=talkLog();lint(lg);if(nb)lg.scrollTop=lg.scrollHeight;}
 talkWire();}
/* ---------- Plan my day: J8 proposes up to the day's capacity, the user commits ---------- */
function planSheet(){var N=myQueue(),cap=capMin(),pl=planToday(),pick=pl?pl.keys:fitDay(N,cap).map(function(i){return i.key;});UI.gsheet={k:'plan'};
 gOpen('<h2 id="gTitle">'+esc(t('xPlanH'))+'</h2><p class="lead">'+esc(t('xPlanP',{b:dur(cap)}))+'</p><p class="ptot" id="planTot" aria-live="polite"></p><ul class="plan">'+N.slice(0,60).map(function(i){return '<li><label><input type="checkbox" data-pk="'+esc(i.key)+'" data-m="'+minsI(i)+'"'+(pick.indexOf(i.key)>-1?' checked':'')+'><span dir="auto">'+esc(cap1(nextOf(i).what))+'</span><bdi>'+esc(dur(minsI(i)))+'</bdi></label></li>';}).join('')+'</ul>'
  +'<div class="abar two"><button class="do" data-a="x-commit">'+ic('check')+'<span>'+t('xCommit')+'</span></button><button data-a="gclose">'+ic('back','flip')+'<span>'+t('cancel')+'</span></button></div>','var(--rail)');planTot();}
function planTot(){var a=0;[].forEach.call(document.querySelectorAll('#gsheet [data-pk]:checked'),function(x){a+=+x.dataset.m||0;});var e=$('planTot');if(e)e.innerHTML='<bdi>'+esc(t('xPlanTot',{a:dur(a),b:dur(capMin())}))+'</bdi>';e&&e.classList.toggle('over',a>capMin());}
function planCommit(){var K=[],a=0;[].forEach.call(document.querySelectorAll('#gsheet [data-pk]:checked'),function(x){K.push(x.dataset.pk);a+=+x.dataset.m||0;});var p={d:ymd(new Date()),keys:K,at:Date.now()};ls('j8-plan',p);
 try{if(J8.prefs&&J8.status().connected)J8.prefs.set({plan:p}).catch(function(){});}catch(e){}gClose();toast(t('xPlanned',{n:K.length,a:dur(a)}));navTo('now');}
/* ---------- shell: rail, top bar, routing, URL per screen ---------- */
function curPlace(){return PLACE[UI.v]||'now';}
function renderTop(){var pl=curPlace(),inner=UI.v!==pl;document.body.dataset.place=pl;document.body.dataset.inner=inner?'1':'0';
 $('tBack').hidden=!inner;$('hdT').textContent=UI.v==='proj'&&pobj(UI.proj)?pobj(UI.proj).name:UI.v==='money'?t('xMoneyH'):t(pl);$('tBackL').textContent=t('xBack');
 var m=document.querySelector('meta[name=theme-color]');if(m)m.content=isDark()?'#060833':'#FFFFFF';}
function badge(n){return n>9?'9+':String(n);}
function renderNav(){var N=connected?myQueue():[],L=connected?todayList(N).L:[],D=connected?decisions():[],pl=curPlace();
 [].forEach.call(document.querySelectorAll('#nav [data-nav]'),function(b){var k=b.dataset.nav;if(k===pl)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');var l=b.querySelector('.lbl');if(l)l.textContent=t(k);});
 var a=$('nN'),b=$('tN'),nd=L.some(isDue),dd=D.some(isDue);a.textContent=L.length?badge(L.length):'';a.hidden=!L.length;a.classList.toggle('due',nd);b.textContent=D.length?badge(D.length):'';b.hidden=!D.length;b.classList.toggle('due',dd);
 $('nNs').textContent=L.length?' '+(LANG==='he'?'צעדים להיום':'steps for today'):'';$('tNs').textContent=D.length?' '+(LANG==='he'?'החלטות':'decisions'):'';
 var st=J8.status(),u=st.user||{},o=J8.orgs.current()||{};$('userAv').textContent=mono(u.email||'?');$('userN').textContent=u.email?String(u.email).split('@')[0]:t('me');$('userO').textContent=o.name||'';
 var P=liveP().filter(function(p){return p.status!=='parked'&&!isDoneP(p);}),pins=ls('j8-pins'),pp=Array.isArray(pins)?pins.map(pobj).filter(Boolean):P.slice().sort(function(x,y){return projNeed(y.id).length-projNeed(x.id).length||stageOf(y)-stageOf(x);}).slice(0,5);
 $('pins').innerHTML=pp.length?'<p class="ph6">'+(LANG==='he'?'נעוצים':'Pinned')+'</p>'+pp.slice(0,5).map(function(p){return '<button data-a="proj" data-id="'+esc(p.id)+'"'+(UI.v==='proj'&&UI.proj===p.id?' aria-current="page"':'')+'>'+ptile(p.id,'sm')+'<span class="lbl" dir="auto">'+esc(p.name)+'</span></button>';}).join(''):'';}
function hashOf(){var v=UI.v;return v==='proj'&&UI.proj?'#/p/'+UI.proj:v==='draft'&&UI.batch?'#/d/'+UI.batch:v==='qitem'&&UI.isel?'#/i/'+UI.isel:'#/'+v;}
function render(focus){var m=$('main');if(!m)return;if(VMAP[UI.v])UI.v=VMAP[UI.v];view=UI.v;renderTop();renderNav();
 if(!focus&&busyMain()){renderJ8();return;}
 [].forEach.call(m.querySelectorAll('textarea[id]'),function(x){TYPING[x.id]=x.value;});parkMe();
 var y=m.scrollTop,v=UI.v,md=$('mdd'),my=md?md.scrollTop:0;
 m.innerHTML=v==='now'?vNow():v==='inbox'?vInbox():v==='qitem'?vQitem():v==='projects'||v==='dept'?vProjects():v==='proj'?vProj():v==='draft'?draftCheck()+vDraft10():v==='calendar'?vCal():v==='me'?vMe():v==='money'?vMoney():vNow();
 slotMe();if(v==='me'){meWords();renderPrefs();renderSeat();renderTheme();}lint(m);
 Object.keys(TYPING).forEach(function(id){var x=document.getElementById(id);if(x&&TYPING[id]&&!x.value)x.value=TYPING[id];});
 if(focus){m.scrollTop=0;m.classList.add('push');clearTimeout(render.pt);render.pt=setTimeout(function(){m.classList.remove('push');},220);var ph=$('pageH');(ph||m).focus({preventScroll:true});}else{if(Math.abs(m.scrollTop-y)>2)m.scrollTop=y;var md2=$('mdd');if(md2)md2.scrollTop=my;}
 try{var hs=hashOf();if(location.hash!==hs&&!/token/.test(location.hash))history.replaceState(null,'',location.pathname+location.search+hs);}catch(e){}
 renderJ8();if(UI.gsheet&&UI.gsheet.k==='thread'&&!$('gsheet').hidden){var g=$('gth');if(!g||document.activeElement!==g){threadSheet(UI.gsheet.tg);lint($('gsheet'));}}}
function goV(v,keepStack){v=VMAP[v]||v;if(!keepStack&&UI.v!==v)UI.stack.push({v:UI.v,dept:UI.dept,proj:UI.proj,batch:UI.batch,dids:UI.dids,isel:UI.isel});UI.v=v;UI.editing=false;if(PLACE[v]===v)ls('j8-view',v);render(true);}
function navTo(v){v=VMAP[v]||v;if(v==='dept')v='projects';if(v!=='projects')UI.pf.risk=false;UI.stack=[];UI.doing={};goV(v,true);}
function back(){var s=UI.stack.pop()||{v:curPlace()};UI.v=VMAP[s.v]||s.v;UI.dept=s.dept;UI.proj=s.proj;UI.batch=s.batch;UI.dids=s.dids;UI.isel=s.isel||UI.isel;UI.editing=false;render(true);}
function openProj(pid){UI.proj=pid;UI.pseg='act';goV('proj');}
function openDraft(bid){var L=bid.indexOf('ap:')===0?[bid.slice(3)]:apPending().filter(function(a){return bkey(a)===bid;}).map(function(a){return a.id;});
 if(!L.length){toast(t('allClearT'));return;}UI.batch=bid;UI.dids=L;UI.editing=false;UI.draftFrom='inbox';
 if(isDesk()&&curPlace()==='inbox'&&UI.v==='inbox'){render();return;}
 var k=decisions().filter(function(i){return i.batch&&i.batch.id===bid||i.ap&&('ap:'+i.ap.id)===bid;})[0];if(k)UI.isel=k.key;
 if(isDesk()){UI.stack=[];UI.v='inbox';render(true);return;}goV('draft');}
function jump(tg){if(!tg)return;tg=String(tg);
 if(tg==='control'){openCtl();return;}
 var m=tg.match(/^\/?(p|d|i|t)\/(.+)$/);if(m){if(m[1]==='p'&&PR[m[2]]){UI.stack=[{v:'projects'}];openProj(m[2]);}else if(m[1]==='d')openDraft(m[2]);else if(m[1]==='i'){UI.isel=m[2];navTo('inbox');if(!isDesk())goV('qitem');}else if(m[1]==='t')threadSheet({task:m[2]});return;}
 tg=tg.replace(/^\//,'');
 if(PLACES.indexOf(tg)>-1||tg==='money'){navTo(tg);return;}
 if(VMAP[tg]){navTo(VMAP[tg]);return;}
 if(/^(approvals|approve|list-approve)$/.test(tg)){var fb=firstBatch();if(fb)openDraft(fb);else navTo('inbox');return;}
 if(tg.indexOf('list-b-')===0){openDraft(tg.slice(7));return;}
 if(tg.indexOf('ap-')===0){var a=AP[tg.slice(3)];if(a&&isPend(tg.slice(3)))openDraft(a.batch?a.batch:'ap:'+tg.slice(3));else navTo('inbox');return;}
 if(tg.indexOf('list-')===0){var k=tg.slice(5).replace(/^tk-tk-/,'tk-');UI.open[k]=1;UI.open.nT=true;UI.open.nL=true;UI.open.nTall=true;UI.open.nLall=true;navTo('now');var e=$('r-'+k);if(e)e.scrollIntoView({block:'center'});return;}
 if(/^(tasks|week|money|health|team)$/.test(tg)){navTo(tg==='money'?'money':'now');return;}
 if(/^(proj|inbox)$/.test(tg)){navTo(tg==='proj'?'projects':'inbox');return;}
 if(tg.indexOf('p-')===0&&PR[tg]){UI.stack=[{v:'projects'}];openProj(tg);return;}
 navTo('now');}
function fromHash(){var h=(location.hash||'').slice(1);if(h&&!/token|refresh_token/.test(h))jump(h);}
function closeSheet(){var s=$('sheet');if(s&&!s.hidden){s.hidden=true;if($('gsheet').hidden&&!(j8Open()&&!isWide()))$('scrim').hidden=true;if(ctlOn)ctlShow(false);}}
function openSheet(){$('sheet').hidden=false;$('scrim').hidden=false;}
function renderPrefs(){var sz=document.documentElement.dataset.size||'std';[].forEach.call(document.querySelectorAll('[data-size-set]'),function(b){b.setAttribute('aria-pressed',b.dataset.sizeSet===sz?'true':'false');});
 [].forEach.call(document.querySelectorAll('[data-lang-set]'),function(b){b.setAttribute('aria-pressed',b.dataset.langSet===LANG?'true':'false');});
 var lb={sizeH:'textSize',langH:'language',helpH:'help',themeH:'theme'};Object.keys(lb).forEach(function(id){var e=$(id);if(e)e.textContent=t(lb[id]);});
 [].forEach.call(document.querySelectorAll('[data-size-set] .sl'),function(e){e.textContent=t(e.parentNode.dataset.sizeSet);});
 [].forEach.call(document.querySelectorAll('[data-theme-set]'),function(e){e.textContent=(LANG==='he'?{light:'בהיר',dark:'כהה',auto:'אוטומטי'}:{light:'Light',dark:'Dark',auto:'Auto'})[e.dataset.themeSet];});}
function askItems(q){q=String(q||'').trim().toLowerCase();var R=[],m=function(s){return !q||String(s||'').toLowerCase().indexOf(q)>-1;};
 PLACES.forEach(function(x){if(m(t(x))||m(x))R.push({g:'places',id:'nav:'+x,ic:{now:'today',inbox:'inbox',projects:'proj',calendar:'cal',me:'you'}[x],l:t(x)});});
 if(m('control'))R.push({g:'places',id:'ctl',ic:'set',l:LANG==='he'?'בקרה':'Control'});
 if(q){myQueue().forEach(function(i){var w=cap1(nextOf(i).what);if(m(w)||m(i.sub))R.push({g:'steps',id:'item:'+i.key,ic:'you',l:w});});
  projList().forEach(function(p){if(p.id!=='p-general'&&m(p.name))R.push({g:'projectsH',id:'proj:'+p.id,ic:'proj',l:p.name});});
  apPending().forEach(function(a){if(m(a.to)||m(a.batch_label))R.push({g:'xFDrafts',id:'draft:'+bkey(a),ic:'mail',l:apKind(a)+': '+apWho(a)});});}
 else myQueue().slice(0,3).forEach(function(i){R.push({g:'steps',id:'item:'+i.key,ic:'you',l:cap1(nextOf(i).what)});});
 return R.slice(0,12);}
function askCmd(id){var q=$('askIn')?$('askIn').value.trim():'';gClose();
 if(id==='ask'){if(!q)return;if(!J8.status().connected){toast(t('notConn'));return;}J8.inbox.send('p-general',q).then(function(){toast(t('askSent'));setJ8(true);},function(e){toast(t('couldNot',{e:e&&e.code||'error'}));});return;}
 if(id==='set'){navTo('me');return;}if(id==='ctl'){openCtl();return;}
 var k=id.split(':'),v=k.slice(1).join(':');if(k[0]==='nav')navTo(v);else if(k[0]==='proj'){UI.stack=[{v:UI.v}];openProj(v);}else if(k[0]==='draft')openDraft(v);else if(k[0]==='item')jump('list-'+v);}
/* ---------- v10 actions (window capture: runs before 8.1.1's handler; anything it does not own falls through) ---------- */
window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a],[data-cx=back]');if(!el)return;
 if(el.dataset.cx==='back'){e.stopPropagation();closeSheet();navTo('me');return;}
 var a=el.dataset.a,id=el.dataset.id,k=el.dataset.k,own=true;
 if(a==='x-j8')setJ8(!j8Open(),!j8Open());
 else if(a==='x-plan')planSheet();
 else if(a==='x-commit')planCommit();
 else if(a==='x-risk'){UI.pf.risk=true;UI.stack=[];goV('projects',true);}
 else if(a==='x-pfr'){UI.pf.risk=false;render();}
 else if(a==='x-pfn'){UI.pf.n=!UI.pf.n;render();}
 else if(a==='x-pv'){UI.pf.view=id;render();}
 else if(a==='x-psort'){UI.pf.sort=id;render();}
 else if(a==='x-pseg'){UI.pseg=id;if(UI.v!=='proj'&&UI.proj)goV('proj');else render();}
 else if(a==='x-ifil'){UI.ifil=id;UI.isel=null;render();}
 else if(a==='x-isel'){UI.isel=id;var o=inboxItems().filter(function(x){return x.k===id;})[0];UI.batch=null;UI.dids=[];if(o&&o.i&&(o.i.batch||o.i.ap)){var bid=o.i.batch?o.i.batch.id:'ap:'+o.i.ap.id;UI.batch=bid;UI.dids=o.i.batch?o.i.batch.items.map(function(x){return x.id;}):[o.i.ap.id];}
  if(isDesk())render();else goV(UI.dids.length?'draft':'qitem');}
 else if(a==='x-set')sampler(id);
 else if(a==='x-setall')setAll(id);
 else if(a==='x-set1'){gClose();openDraft(id);}
 else if(a==='x-skip'){var L=UI.dids||[],cur=L.filter(isPend)[0];if(cur){UI.dids=L.filter(function(x){return x!==cur;}).concat([cur]);toast(t('xSkipped'));render();}}
 else if(a==='x-cap'){ls('j8-cap',+id);try{if(J8.prefs&&J8.status().connected)J8.prefs.set({cap:+id}).catch(function(){});}catch(x){}render();toast(t('xCapH')+': '+dur(+id));}
 else if(a==='x-soon')toast(el.dataset.t==='invite'?t('xInviteT'):t('xSoonT',{x:id}));
 else if(a==='x-snz'){snooze('j8c-'+id,24);toast(t('xSnoozed'));renderJ8();}
 else if(a==='x-why'){UI.open['why-'+id]=!UI.open['why-'+id];renderJ8();}
 else if(a==='x-goitem'){if(!isWide())setJ8(false);jump('list-'+k);}
 else if(a==='x-open'){UI.open[id]=true;render();}
 else if(a==='lane'){UI.open['ln'+id]=!UI.open['ln'+id];render();}
 else if(a==='crumb'&&/^(now|inbox|projects|calendar|me|money)$/.test(String(id).split(':')[0])){navTo(String(id).split(':')[0]);}
 else if(a==='proj'&&el.closest('#nav,#j8p')){if(!isWide()&&el.closest('#j8p'))setJ8(false);UI.stack=[{v:curPlace()}];openProj(id);}
 else own=false;
 if(own){e.stopPropagation();e.preventDefault();}},true);
document.addEventListener('change',function(e){var s=e.target;if(!s)return;if(s.dataset&&s.dataset.x==='pf-u'){UI.pf.u=s.value;render();}else if(s.dataset&&s.dataset.x==='pf-o'){UI.pf.o=s.value;render();}else if(s.dataset&&s.dataset.pk)planTot();});
/* ⌘K / Ctrl+K opens Search or ask; Inbox keys j/k move, a approve, e edit, s skip, x kill, u undo */
document.addEventListener('keydown',function(e){var x=e.target,typing=x&&(/^(INPUT|TEXTAREA|SELECT)$/.test(x.tagName)||x.isContentEditable);
 if((e.metaKey||e.ctrlKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();askSheet();return;}
 if(typing||e.metaKey||e.ctrlKey||e.altKey||!$('gsheet').hidden||curPlace()!=='inbox'||$('app').hidden)return;
 var L=inboxItems(),i=L.map(function(o){return o.k;}).indexOf(UI.isel),cur=(UI.dids||[]).filter(isPend)[0];
 if(e.key==='j'||e.key==='k'){var n=L[Math.max(0,Math.min(L.length-1,i+(e.key==='j'?1:-1)))];if(n){e.preventDefault();var b=document.querySelector('[data-a=x-isel][data-id="'+(window.CSS&&CSS.escape?CSS.escape(n.k):n.k)+'"]');if(b)b.click();}}
 else if(e.key==='a'&&cur){e.preventDefault();draftDecide(cur,'send');}
 else if(e.key==='x'&&cur){e.preventDefault();draftDecide(cur,'kill');}
 else if(e.key==='e'&&cur){e.preventDefault();UI.editing=true;render();var ta=document.querySelector('form.edit textarea');if(ta)ta.focus();}
 else if(e.key==='s'&&cur){e.preventDefault();var sk=document.createElement('button');sk.dataset.a='x-skip';document.body.appendChild(sk);sk.click();sk.remove();}
 else if(e.key==='u'){var u=$('undo');if(u&&!u.hidden){e.preventDefault();u.click();}}});
window.matchMedia&&matchMedia('(min-width:1100px)').addEventListener&&matchMedia('(min-width:1100px)').addEventListener('change',function(q){setJ8(q.matches&&ls('j8-panel')===1);soon();});
document.body.dataset.j8=isWide()&&ls('j8-panel')===1?'open':'closed';

/* lint what the 8.1.1 sheets print too; Hebrew quick asks; lazy sections render when opened; scrim and Escape close J8 on a phone */
var gOpenEN=gOpen;gOpen=function(h,c){gOpenEN(h,c);lint($('gsheet'));};
var threadSheetEN=threadSheet;threadSheet=function(tg,sent){threadSheetEN(tg,sent);lint($('gsheet'));};
function talkWire(){var s=$('j8cStrip'),Q=LANG==='he'?['מה הצעד שמביא כסף הכי מהר?','מה מחכה לי עכשיו?','אילו צוותים נכשלו או השתתקו?','שורה אחת על כל פרויקט']:['What is the one move that brings money fastest?','What is waiting on me right now?','Which teams failed or went quiet?','One line on every project'];
 if(s){var empty=!J8.inbox.list().length;s.hidden=!empty;if(empty)s.innerHTML=Q.map(function(x){return '<button type="button" class="opt" data-cq="'+esc(x)+'">'+esc(x)+'</button>';}).join('');}
 var nt=$('j8cNote');if(nt)nt.textContent=J8.control.brainEnabled()?(LANG==='he'?'J8 עונה כאן בעוד רגע.':'J8 answers here in a moment.'):(LANG==='he'?'הצוות עונה כאן, בדרך כלל תוך שעה. תקבל/י התראה כשיענו.':'The team answers here, usually within the hour. You get an alert when they reply.');}
document.addEventListener('toggle',function(e){var d=e.target;if(!d||!d.dataset||!d.dataset.k)return;if(d.dataset.was!=null&&(d.open?'1':'0')!==d.dataset.was){d.dataset.was=d.open?'1':'0';var k=d.dataset.k;setTimeout(function(){render();var s=document.querySelector('details[data-k="'+k+'"] > summary');if(s)s.focus({preventScroll:true});},0);}},true);
window.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#scrim')&&j8Open()&&!isWide()&&$('gsheet').hidden&&$('sheet').hidden){e.stopPropagation();setJ8(false);}},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&j8Open()&&!isWide()&&$('gsheet').hidden&&$('sheet').hidden)setJ8(false);});

/* ---------- boot: shell.js signs in and connects; the screens follow J8's status ---------- */
(function(){try{var e=document.querySelector('#eight path');if(e)document.documentElement.style.setProperty('--glyph','url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="79 21 24 48"><path fill="#060833" d="'+e.getAttribute('d')+'"/></svg>')+'")');}catch(x){}})();
(function(){document.documentElement.dataset.theme=theme();renderTheme();setSize(ls('j8-size')||'std');document.documentElement.lang=LANG;document.documentElement.dir=LANG==='he'?'rtl':'ltr';
 var v=ls('j8-view'),m={chat:'talk',next:'today',list:'studio',stats:'flow'};UI.v='now';renderPrefs();render();})(); /* 9.0: Now is the first screen */
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

/* 8.0.1: keep the composer above the keyboard (visual viewport) and the pill honest while the list is scrolled */
(function(){var vv=window.visualViewport,r=document.documentElement;function f(){var h=vv?vv.height:innerHeight,kb=vv?Math.max(0,innerHeight-vv.height-vv.offsetTop):0;r.style.setProperty('--vvh',Math.round(h)+'px');r.style.setProperty('--kb',Math.round(kb)+'px');if(vv&&vv.offsetTop>0)window.scrollTo(0,0);}
 f();if(vv){vv.addEventListener('resize',f);vv.addEventListener('scroll',f);}addEventListener('resize',f);
 document.addEventListener('scroll',function(e){var l=e.target;if(l&&l.id==='tkLog'&&l.scrollHeight-l.scrollTop-l.clientHeight<48){var p=$('tkNew');if(p)p.hidden=true;}},true);
 document.addEventListener('focusin',function(e){var x=e.target;if(x&&x.tagName==='TEXTAREA'&&x.closest('.tk-c,.pinc,.thr')){setTimeout(function(){try{x.scrollIntoView({block:'nearest'});}catch(_){}},250);}});})();
