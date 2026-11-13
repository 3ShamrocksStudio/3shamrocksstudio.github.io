/* J8NIX PWA screens 5.0.0: the approved v8 UI (Chat · Next · List · Stats), ported from the claude.ai artifact.
   Live data only, through window.J8 (j8-data.js, Supabase). No static copies of tasks or projects: empty data shows an empty state. */
var T=[],P=[];
/* ===== J8NIX UI v7 (12 Nov): Chat · Next · List · Stats. Reads and writes only through window.J8 (above) and control/main.
   The chat script below uses the globals marked [chat]. ===== */
var S={},CMT={},AP={},PR={},RUNS={},MONEY={},CTRL=null;
var connected=false,batchSel=null,showDec=false,selAp=null,hlAp=null,editing=null,view='chat',lcat='all',openRow={},seatAsk=0,wdb=null,nextIdx=0; /* [chat]: connected,batchSel,showDec,selAp,hlAp */
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
function cut(s,n){s=String(s==null?'':s).replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s;}
function ls(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v));}catch(_){return null;}}
function tag(txt,cls){return '<span class="tag '+cls+'">'+esc(txt)+'</span>';}
var tt=null,undoFn=null;
function toast(msg,undo){$('toastMsg').textContent=msg;var u=$('undo');u.hidden=!undo;undoFn=undo||null;$('toast').classList.add('on');clearTimeout(tt);tt=setTimeout(function(){$('toast').classList.remove('on');undoFn=null;},undo?8000:4000);}
function scrollToEl(id,block){setTimeout(function(){var e=$(id);if(e)e.scrollIntoView({behavior:'smooth',block:block||'start'});},40);}
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
function youRaw(p){var y=String(p.you||'').trim();return y&&!/^nothing/i.test(y)?y:'';}
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
var GR=[['money','Money','#A8703A'],['approve','Approve','#1563FF'],['projects','Projects','#586475'],['team','Team','#26303C'],['later','Later','#9FB0C4']];
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
function held(){var by={},L=[];J8.approvals.list().forEach(function(a){if(a.status!=='approved'&&a.status!=='edited')return;var r=String(a.result||'');if(!/^Waiting/i.test(r))return;
  var dave=/needs Dave/i.test(r),m=r.match(/\(([^)]*)\)/),why=(m&&dave?m[1]:r.replace(/^Waiting:\s*/i,'').replace(/\s*\(\d\d:\d\d\)\s*$/,'')).split(/;|, so | \(/)[0].trim();
  var k=(dave?'d:':'t:')+why;if(!by[k]){by[k]={key:'held-'+k.replace(/[^a-z0-9]+/gi,'-').slice(0,48),dave:dave,why:why,items:[]};L.push(by[k]);}by[k].items.push(a);});
 return L.sort(function(x,y){return (y.dave?1:0)-(x.dave?1:0)||y.items.length-x.items.length;});}
function isAsk(x){return x.status==='routed'&&/NEEDS YOUR EYES|WHAT YOU DO|\?|Forward it|reply '|paste its/i.test(String(x.reply||''));}
function askLine(x){var r=String(x.reply||''),m=r.match(/(NEEDS YOUR EYES|WHAT YOU DO)\s*:\s*([^\n]+)/);if(m)return m[2];return J8.inbox.lastReply(x).replace(/^\s*\d{1,2}:\d\d\s*[—-]\s*/,'');}
function whyMove(p){var n=String(p.next||'').trim(),m=n.match(/^(Concept|Build|Staged|Validate|Monetize|Paying)\s*:\s*(.+)$/i);
 if(m)return 'Moves '+p.name+' to '+m[1]+': '+m[2].replace(/\.$/,'');return n?cut(n,110):'Keeps '+p.name+' moving.';}
function oldTasks(){return openItems('today').concat(openItems('week'),openItems('later'));}
var ORD={wait:0,stuck:1,prog:2,park:3,done:4};

/* every row of the board, one shape: {key,g,st,title,sub,own,due,...} */
function rows(){var R=[];
 apPending().filter(function(a){return a.kind==='invoice';}).forEach(function(a){R.push({key:'ap-'+a.id,g:'money',st:'wait',title:'Send '+apWho(a),sub:pname(a.product)+' · payment request',own:'dave',due:dueOf(a),ap:a});});
 projList().filter(function(p){return p.id!=='p-general';}).forEach(function(p){var y=youReal(p),pk=p.status==='parked',g=pk?'later':isMoneyProj(p)&&y?'money':'projects';
  R.push({key:'mv-'+p.id,g:g,st:pk?'park':y?'wait':'prog',title:y?shortWhat(y):p.name,sub:y?p.name+(stageName(p.stage)?' · '+stageName(p.stage):''):cut(shortWhat(p.now||''),70)||stageName(p.stage),full:y,own:y?'dave':dept(p),why:whyMove(p),p:p,move:!!y});});
 batches().forEach(function(b){if(b.items.length===1&&b.items[0].kind==='invoice')return;var ds=b.items.map(dueOf).filter(Boolean).sort(function(x,y){return x-y;});
  R.push({key:'b-'+b.id,g:'approve',st:'wait',since:b.items.map(function(a){return a.created?new Date(a.created):null;}).filter(function(d){return d&&!isNaN(d);}).sort(function(x,y){return x-y;})[0]||null,title:b.items.length+' '+nounOf(b.items)+' to send',sub:b.label,own:'dave',due:ds[0]||null,batch:b});});
 held().forEach(function(h){R.push({key:h.key,g:'team',st:h.dave?'wait':'stuck',title:h.dave?cap1(cut(h.why,80)):h.items.length+' approved '+nounOf(h.items)+' held',sub:h.dave?h.items.length+' approved '+nounOf(h.items)+' wait for this':cap1(cut(h.why,70)),own:h.dave?'dave':'Team',held:h});});
 J8.inbox.list().forEach(function(x){var a=isAsk(x),st=a?'wait':x.status==='done'?'done':'prog';
  R.push({key:'c-'+x.p+'-'+String(x.at),g:'team',st:st,title:a?cut(askLine(x),90):pname(x.p)+(st==='done'?' · done':' · with the team'),sub:a?pname(x.p)+' team asks':cut(J8.inbox.lastReply(x).replace(/^\s*\d{1,2}:\d\d\s*[—-]\s*/,''),80),own:a?'dave':dept(PR[x.p]||{}),c:x,ask:a,at:x.at,since:x.at?new Date(x.at):null});});
 var ot=oldTasks();if(ot.length)R.push({key:'old',g:'later',st:'park',title:ot.length+' older to-do items',sub:'From 3–11 Nov. Tick what is done.',own:'dave',tasks:ot});
 return R.sort(function(a,b){return GR.map(function(g){return g[0];}).indexOf(a.g)-GR.map(function(g){return g[0];}).indexOf(b.g)||ORD[a.st]-ORD[b.st];});}

/* ===== Next: today's plan, one card at a time ===== */
function snoozed(k){var z=ls('j8-snooze')||{};return z[k]&&z[k]>Date.now();}
function snooze(k,h){var z=ls('j8-snooze')||{};z[k]=Date.now()+h*36e5;ls('j8-snooze',z);}
function queue(){var o={money:0,team:1,projects:2,approve:3};return rows().filter(function(i){return i.st==='wait'&&o[i.g]!=null&&!snoozed(i.key);}).sort(function(a,b){return o[a.g]-o[b.g];});}
function today(){return queue().slice(0,5);}
function nextOf(i){
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
function renderNext(){var el=$('v-next');if(!el)return;
 if(!connected){el.innerHTML='<div class="empty"><b>Loading your next move…</b><p>Signing in and loading your live data.</p></div>';return;}
 var P=plan(),L=P.L,cur=null,k0=-1;L.forEach(function(x,k){if(!cur&&x.open&&x.row){cur=x;k0=k;}});
 var done=L.filter(function(x){return !x.open&&!x.later;}).length,seg='';
 L.forEach(function(x,k){seg+='<i class="'+(k===k0?'c':x.later?'l':!x.open?'d':'')+'">'+(k===k0?eight():'')+'</i>';});
 var strip='<div class="strip"><b>Today '+(cur?(k0+1):L.length)+' of '+L.length+'</b><div class="seg">'+seg+'</div></div>';
 if(!cur){el.innerHTML='<div class="nx-wrap">'+(L.length?strip:'')+'<div class="empty">'+eight('big')+'<b>'+(L.length?'Today’s '+L.length+' are handled.':'Nothing waits on you today.')+'</b>'+(P.Q.length?'<p>'+P.Q.length+' more wait in your list.</p><button class="pri" data-plan="1">Plan the next '+Math.min(5,P.Q.length)+'</button>':'<p>Ask J8NIX what to push next.</p><button class="pri" data-go="chat">Open the chat</button>')+'</div></div>';return;}
 var i=cur.row,n=nextOf(i),g=GC[i.g],rest=P.Q.filter(function(q){return P.p.k.indexOf(q.key)<0;}).length;
 el.innerHTML='<div class="nx-wrap">'+strip
  +'<article class="ncard" style="--gc:'+g[2]+'"><div class="nc-top"><span class="gname">'+esc(g[1])+'</span>'+pill(i.st)+'</div>'
  +'<h2 dir="auto">'+esc(n.what)+'</h2><p class="why" dir="auto">'+esc(n.why)+'</p>'
  +(i.full&&shortWhat(i.full)!==i.full.trim()?'<details class="how"><summary>Show the steps</summary><p dir="auto">'+esc(i.full)+'</p></details>':'')
  +'<dl class="meta"><div><dt>Project</dt><dd><span>'+esc(i.p?i.p.name:i.c?pname(i.c.p):i.batch?i.batch.label:i.held?pname((i.held.items[0]||{}).product):'Studio')+'</span></dd></div>'+(i.due?'<div><dt>Due</dt><dd><span>'+dshort(i.due)+'</span></dd></div>':'')+'</dl>'
  +actBtn(n,'pri')
  +'<div class="sec">'+(i.batch?'':'<button data-ndone="'+esc(i.key)+'">'+ic('done')+'Done, next</button>')+'<button data-nlater="'+esc(i.key)+'">Later</button></div></article>'
  +'<p class="more">'+(rest?rest+' more after today':'Nothing else waits after these')+'</p></div>';}
function markDone(k){var i=rows().filter(function(x){return x.key===k;})[0];snooze(k,24);
 if(i&&(i.p||i.held||i.c)&&J8.status().connected){var pid=i.p?i.p.id:i.c?i.c.p:(i.held.items[0]||{}).product||'p-general';
  J8.inbox.send(pid,'Done: '+(i.full||i.title)).then(function(){toast('Marked done. The team is told.');},function(){toast('Marked done here. Couldn’t tell the team.');});}
 else toast('Marked done.');renderAll();}

/* ===== Chat: a messenger; decisions are interactive message cards ===== */
function pvText(t,n){var L=String(t||'').split('\n').map(function(x){return x.replace(/\s+/g,' ').trim();}).filter(Boolean),o=[],c=0;for(var k=0;k<L.length&&c<(n||160);k++){var x=L[k].slice(0,(n||160)-c);if(x.length<L[k].length)x+='…';o.push(x);c+=x.length;}return o.join('\n');}
function tm(iso){var t=iso?new Date(iso):new Date();return isNaN(t)?'':(ymd(t)===ymd(new Date())?t.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):t.getDate()+' '+MON[t.getMonth()]);}
function apCard(a,pre){var id=a.id,ed=editing===id,o=openRow[(pre||'cb')+id],txt=J8.approvals.textOf(a);
 return '<div class="msg in card" id="'+(pre||'cb')+'-'+esc(id)+'"><div class="c-top">'+pill('wait')+'<span dir="auto">'+esc(apKind(a))+' · '+esc(pname(a.product))+'</span></div>'
  +'<button class="c-main" data-open="'+(pre||'cb')+esc(id)+'"><b dir="auto">'+esc(apWho(a))+'</b>'
  +(ed?'':'<span class="pv'+(o?' full':'')+'" dir="auto">'+esc(o?txt:pvText(txt,150))+'</span>')+'</button>'
  +(ed?'<textarea class="aed" id="ed-'+esc(id)+'" dir="auto" aria-label="Edit the text">'+esc(txt)+'</textarea>':'')
  +(o&&a.warn?'<p class="warn" dir="auto">'+esc(cut(a.warn,220))+'</p>':'')+(o&&a.link?'<a class="lnk" href="'+esc(a.link)+'" target="_blank" rel="noopener">'+esc(a.link_text||'Open the link')+'</a>':'')
  +'<time>'+esc(tm(a.created))+'</time>'
  +'<div class="btns">'+(ed?'<button class="s" data-apsave="'+esc(id)+'">Save and send</button><button data-apcancel="'+esc(id)+'">Cancel</button>'
    :'<button class="s" data-apsend="'+esc(id)+'">'+ic('send')+'Send</button><button data-apedit="'+esc(id)+'">'+ic('edit')+'Edit</button><button data-apkill="'+esc(id)+'">'+ic('kill')+'Kill</button>')+'</div></div>';}
function renderBrief(){var el=$('brief');if(!el)return;if(document.activeElement&&el.contains(document.activeElement)&&document.activeElement.tagName==='TEXTAREA')return;
 if(!connected){el.innerHTML='<div class="msg in"><p>Loading your board…</p></div>';return;}
 var pend=apPending(),top=pend.slice(0,3),Q=queue(),mv=Q.filter(function(i){return !i.batch;})[0],now=tm(),h='';
 h+='<div class="msg in"><p dir="auto">'+(pend.length?(pend.length===1?'One draft waits for your Send.':pend.length+' drafts wait for your Send. The top '+top.length+':'):'Nothing waits for your Send.')+'</p><time>'+now+'</time></div>';
 h+=top.map(function(a){return apCard(a,'cb');}).join('');
 if(pend.length>top.length)h+='<div class="msg in card slim"><p>'+(pend.length-top.length)+' more drafts are in your list.</p><time>'+now+'</time><div class="btns"><button class="s" data-jump="list-approve">Open the list</button></div></div>';
 if(mv){var n=nextOf(mv);h+='<div class="msg in card"><div class="c-top">'+pill('wait')+'<span>Your move · '+esc(mv.p?mv.p.name:GC[mv.g][1])+'</span></div><div class="c-main"><b dir="auto">'+esc(n.what)+'</b><span class="pv" dir="auto">'+esc(cut(n.why,120))+'</span></div><time>'+now+'</time><div class="btns"><button class="s" data-go="next">Do it</button><button data-blater="'+esc(mv.key)+'">Later</button></div></div>';}
 el.innerHTML=h;}
function renderApprovals(){renderBrief();if(view==='list')renderList();} /* [chat] */

/* ===== List: a board, one coloured group per category ===== */
function rowHTML(i){var o=openRow[i.key],g=GC[i.g];
 var h='<div class="brow'+(o?' open':'')+'" id="'+esc(i.batch?'approvals-'+i.batch.id:'r-'+i.key)+'" style="--gc:'+g[2]+'">'
  +'<button class="bmain" data-open="'+esc(i.key)+'" aria-expanded="'+(o?'true':'false')+'">'+pill(i.st)+'<span class="bt"><b dir="auto">'+esc(i.title)+'</b><span dir="auto">'+esc(i.sub||'')+'</span></span>'+owner(i.own)+'<span class="bd'+(i.due?'':' sn')+'">'+(i.due?dshort(i.due):i.since?dshort(i.since):'')+'</span></button>';
 if(o){h+='<div class="bx">';
  if(i.p){var p=i.p,u=p.you_link||p.link;h+=(i.full?'<p dir="auto">'+esc(i.full)+'</p>':'<p dir="auto">'+esc(p.now||'')+'</p>')+'<p class="why">'+esc(i.why)+'</p><div class="acts">'
    +(u?(u.charAt(0)==='#'?'<button class="s" data-jump="'+esc(u.slice(1))+'">'+esc(p.you_link_text||'Open it')+'</button>':'<a class="s" href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(p.you_link?(p.you_link_text||'Open it'):(p.link_text||'Open it'))+'</a>'):'')
    +(i.move?'<button data-ndone="'+esc(i.key)+'">Done</button><button data-nlater="'+esc(i.key)+'">Later</button>':'')+'</div>';}
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
function renderList(){var el=$('v-list');if(!el)return;if(document.activeElement&&el.contains(document.activeElement)&&document.activeElement.tagName==='TEXTAREA')return;
 if(!connected){el.innerHTML='<div class="empty"><b>Loading your board…</b></div>';return;}
 var R=rows(),h='<div class="cats" role="tablist">'+[['all','All']].concat(GR).map(function(c){var k=c[0];return '<button role="tab" aria-selected="'+(lcat===k)+'" class="'+(lcat===k?'on':'')+'" data-cat="'+k+'"'+(c[2]?' style="--gc:'+c[2]+'"':'')+'>'+c[1]+'</button>';}).join('')+'</div>';
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
function activity(){var days=[],by={},S3=[['Drafts made','#9FB0C4'],['Your decisions','#A8703A'],['Team runs','#1563FF']];
 for(var k=6;k>=0;k--){var d=new Date(Date.now()-k*864e5);days.push(ymd(d));by[ymd(d)]=[0,0,0];}
 var add=function(iso,j){if(!iso)return;var t=new Date(iso);if(isNaN(t))return;var key=ymd(t);if(by[key])by[key][j]++;};
 J8.approvals.list().forEach(function(a){add(a.created,0);add(a.decided_at,1);});J8.runs.list().forEach(function(r){add(r.ended||r.started,2);});
 var mx=1;days.forEach(function(d){var s=by[d][0]+by[d][1]+by[d][2];if(s>mx)mx=s;});
 var bars=days.map(function(d){var v=by[d],s=v[0]+v[1]+v[2],t=new Date(d+'T12:00:00');
  return '<div class="col" title="'+esc(fdate(d)+': '+v[0]+' drafts, '+v[1]+' decisions, '+v[2]+' runs')+'"><b>'+(s||'')+'</b><div class="stk">'+v.map(function(n,j){return n?'<i style="height:'+(n/mx*100)+'%;background:'+S3[j][1]+'"></i>':'';}).reverse().join('')+'</div><span>'+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][t.getDay()]+'</span></div>';}).join('');
 return '<div class="act">'+bars+'</div><ul class="lg row">'+S3.map(function(s){return '<li><i style="background:'+s[1]+'"></i><span>'+s[0]+'</span></li>';}).join('')+'</ul>';}
function renderStats(){var el=$('v-stats');if(!el)return;if(!connected){el.innerHTML='<div class="empty"><b>Loading your numbers…</b></div>';return;}
 var m=J8.money.summary()||{},b=isNum(m.booked_usd)?m.booked_usd:0,d1=J8.money.daysTo(m.m1_date),Ap=J8.approvals.list(),cnt=function(f){return Ap.filter(f).length;},
  wt=cnt(function(a){return !a.status||a.status==='pending';}),ap=cnt(function(a){return a.status==='approved'||a.status==='edited';}),sn=cnt(function(a){return a.status==='sent';}),kl=cnt(function(a){return a.status==='killed';});
 var h='<div class="kpis"><div class="kpi gold"><span>Booked</span><b>'+usd(b)+'</b><small>of '+usd(m.m1_usd||25000)+' for M1</small></div>'
  +'<div class="kpi"><span>Days to M1</span><b>'+(d1!==null?Math.max(0,d1):'—')+'</b><small>'+esc(fdate(m.m1_date||'2026-11-21'))+'</small></div>'
  +'<div class="kpi"><span>Waiting on you</span><b>'+wt+'</b><small>drafts</small></div>'
  +'<div class="kpi"><span>Sent</span><b>'+sn+'</b><small>'+ap+' approved, not out yet</small></div></div>';
 var t0=new Date(START+'T12:00:00').getTime(),t1=new Date(MS[5][1]+'T12:00:00').getTime(),x=function(d){return Math.max(0,Math.min(100,(new Date(d+'T12:00:00').getTime()-t0)/(t1-t0)*100));},tn=Math.max(0,Math.min(100,(Date.now()-t0)/(t1-t0)*100)),nx=MS.filter(function(s){return b<s[2];})[0];
 h+='<section class="st"><h2>Milestones</h2><div class="tl"><div class="tr"><i style="width:'+tn+'%"></i></div><s class="today" style="left:'+tn+'%"><em>Today</em></s>'
  +MS.map(function(s){return '<div class="ms'+(b>=s[2]?' r':'')+(nx&&nx[0]===s[0]?' nx':'')+'" style="left:'+x(s[1])+'%">'+eight()+'<b>'+s[0]+'</b><span>'+usd(s[2])+'</span><span>'+fdate(s[1]).replace(' 2027','')+'</span></div>';}).join('')+'</div></section>';
 var P=projList().filter(function(p){return p.id!=='p-general';}),SC=['#CCD8E5','#9FB0C4','#7A8BA0','#586475','#2F3A47','#A8703A'],stg=J8.projects.STAGES.map(function(s,i){return {k:s,v:P.filter(function(p){return p.stage===i+1;}).length,c:SC[i]};});
 var ns=P.filter(function(p){return !isNum(p.stage);}).length;if(ns)stg.push({k:'No stage',v:ns,c:'#E8EEF5'});
 h+='<div class="pair"><section class="st"><h2>Projects by stage</h2>'+donut(stg,'Projects by stage')+'</section>'
  +'<section class="st"><h2>Drafts</h2>'+donut([{k:'Waiting',v:wt,c:'#A8703A',keep:1},{k:'Approved',v:ap,c:'#1563FF',keep:1},{k:'Sent',v:sn,c:'#26303C',keep:1},{k:'Killed',v:kl,c:'#CCD8E5',keep:1}],'Drafts by status')+'</section></div>';
 h+='<section class="st"><h2>Activity, last 7 days</h2>'+activity()+'</section>';
 var A=achievements(),on=A.filter(function(a){return a.on;}).length;
 h+='<section class="st"><h2>Achievements <span>'+on+' of '+A.length+'</span></h2><div class="badges">'+A.sort(function(p,q){return (q.on?1:0)-(p.on?1:0);}).map(function(a){
   return '<div class="bdg '+(a.on?'on':'lk')+'"><i>'+eight()+(a.on?'':'<svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="6" y="11" width="12" height="9"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>')+'</i><b>'+esc(a.n)+'</b><span>'+esc(a.on?(a.at?fdate(a.at):a.v||'Unlocked'):a.lock)+'</span></div>';}).join('')+'</div></section>';
 h+='<p class="src">Money from your money summary'+(m.updated?' ('+esc(hhmm(m.updated))+')':'')+'. Milestone targets from the studio plan. Everything else counted live from the board.</p>';
 el.innerHTML=h;}

/* ===== header band: one title per screen, real subtitle ===== */
function renderHead(){var t={chat:'J8NIX',next:'Next',list:'List',stats:'Stats'}[view],s='';
 if(view==='chat')s='your business manager';
 else if(!connected)s='loading…';
 else if(view==='next'){var pl=plan(false,true).L,dn=pl.filter(function(x){return !x.open;}).length;s=pl.length?dn+' of '+pl.length+' handled today':'nothing waits on you';}
 else if(view==='list'){var w=rows().filter(function(i){return i.st==='wait';}).length;s=w+' rows waiting on you';}
 else {var m=J8.money.summary()||{},d=J8.money.daysTo(m.m1_date);s=usd(m.booked_usd||0)+' of '+usd(m.m1_usd||25000)+(d!==null?' · '+Math.max(0,d)+' days to M1':'');}
 $('hdT').textContent=t;$('hdS').textContent=s;}

/* ===== settings sheet ===== */
function openSheet(){$('sheet').hidden=false;$('scrim').hidden=false;$('gear').setAttribute('aria-expanded','true');}
function closeSheet(){var s=$('sheet');if(s&&!s.hidden){s.hidden=true;$('scrim').hidden=true;$('gear').setAttribute('aria-expanded','false');}}
function renderSeat(){var b=$('seat');if(!b)return;var p=CTRL&&CTRL.paused,ask=seatAsk>Date.now();
 b.classList.toggle('off',!!p);b.textContent=p?(ask?'Tap again to resume':'Resume sending'):'Pause sending';
 $('seatTxt').textContent=!CTRL?'Not loaded yet.':p?'Paused. Nothing goes out.':'On. Approved drafts go out on the next run.';
 $('connTxt').textContent=connected?(J8.status().connected?'Connected. Updates live.':'Offline. Showing the last copy.'):'Connecting…';}
function seatTap(){if(!CTRL){toast('Not connected yet. Try again in a moment.');return;}var p=CTRL&&CTRL.paused;
 if(!p){J8.control.setPaused(true).then(function(){toast('Sending paused. The team sends nothing until you resume.');},function(e){toast('Couldn’t pause ('+(e&&e.code||'error')+'). Try again.');});return;}
 if(seatAsk>Date.now()){seatAsk=0;J8.control.setPaused(false).then(function(){toast('Sending resumed.');},function(e){toast('Couldn’t resume ('+(e&&e.code||'error')+').');});}
 else{seatAsk=Date.now()+5000;renderSeat();setTimeout(renderSeat,5100);}}

/* ===== decisions ===== */
function decide(id,how){var run=function(){var p=how==='send'?J8.approvals.approve(id):J8.approvals.kill(id);
  p.then(function(){editing=null;toast(how==='send'?'Approved. It goes out on the team’s next run.':'Killed. Nothing goes out.',function(){J8.approvals.undo(id).then(function(){toast('Back to waiting.');renderAll();});});renderAll();},
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
function renderAll(){var q=connected?plan(false,true).L.filter(function(x){return x.open;}).length:0;['nN','dN'].forEach(function(k){var e=$(k);if(e){e.textContent=q?q:'';e.hidden=!q;}});renderSeat();renderHead();renderBrief();renderView(view);
 if(connected&&!booted&&view==='chat'){booted=true;setTimeout(chatBottom,60);}}
var rq=null;function soon(){if(rq)return;rq=setTimeout(function(){rq=null;renderAll();},30);}

function jump(t){
 if(!t)return;if(t==='chat'&&window.J8C){J8C.show();return;}
 if(t.indexOf('ap-')===0&&window.J8C){J8C.openAp(t.slice(3));return;}
 if(t==='approvals'||t==='approve'||t==='list-approve'){lcat='approve';go('list');return;}
 if(t.indexOf('list-')===0){var k=t.slice(5),i=rows().filter(function(x){return x.key===k;})[0];lcat=i?i.g:'all';if(i)openRow[k]=1;go('list');scrollToEl(i&&i.batch?'approvals-'+i.batch.id:'r-'+k,'start');return;}
 if(t==='messages'||t==='chat'){go('chat');return;}
 if(t==='list'||t==='projects'||t==='proj'||t==='inbox'){lcat='all';go('list');return;}
 if(t==='tasks'||t==='today'||t==='week'){lcat='later';openRow.old=1;go('list');return;}
 if(t==='next'){go('next');return;}
 if(t==='stats'||t==='money'||t==='health'||t==='team'){go('stats');return;}
 if(t.indexOf('p-')===0){var k2='mv-'+t,i2=rows().filter(function(x){return x.key===k2;})[0];lcat=i2?i2.g:'projects';if(i2)openRow[k2]=1;go('list');if(i2)scrollToEl('r-'+k2,'start');}
}
function fromHash(){var h=(location.hash||'').slice(1);if(h)jump(h);}
window.addEventListener('hashchange',fromHash);

document.addEventListener('click',function(e){
 var t=e.target.closest('a');if(t)return;
 t=e.target.closest('#gear');if(t){if($('sheet').hidden){renderSeat();openSheet();}else closeSheet();return;}
 t=e.target.closest('#scrim');if(t){closeSheet();return;}
 t=e.target.closest('[data-go]');if(t){go(t.dataset.go);return;}
 t=e.target.closest('[data-jump]');if(t){jump(t.dataset.jump);return;}
 t=e.target.closest('[data-cat]');if(t){lcat=t.dataset.cat;renderList();$('v-list').scrollTop=0;return;}
 t=e.target.closest('[data-open]');if(t){var k=t.dataset.open;openRow[k]=!openRow[k];renderView(view);return;}
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
 t=e.target.closest('#seat');if(t){seatTap();return;}
 t=e.target.closest('#undo');if(t){if(undoFn)undoFn();$('toast').classList.remove('on');return;}
});
document.addEventListener('submit',function(e){var f=e.target;if(!f.dataset||!f.dataset.ans)return;e.preventDefault();var ta=f.querySelector('textarea'),v=String(ta.value||'').trim();if(!v)return;
 if(!J8.status().connected){toast('Not connected. Try again in a moment.');return;}
 J8.inbox.send(f.dataset.ans,v).then(function(){ta.value='';ta.blur();toast('Sent to the team.');},function(er){toast('Couldn’t send ('+(er&&er.code||'error')+'). Try again.');});});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet();});
if(MQ.addEventListener)MQ.addEventListener('change',soon);
/* messenger: newest at the bottom; follow the conversation as it grows */
new MutationObserver(function(){if(view==='chat')chatBottom();}).observe($('j8cLog'),{childList:true,subtree:true,characterData:true});

/* ===== boot (PWA): shell.js signs in and connects; the screens follow J8's status ===== */
(function(){var v=ls('j8-view');go(v&&VIEWS[v]?v:'chat');renderAll();})();
(function(){
 J8.on('status',function(st){var s=$('status');
  if(st.connected&&!connected){connected=true;s.hidden=true;setTimeout(fromHash,300);}
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
 J8.on('control',function(d){CTRL=d&&d.main?d.main:null;renderSeat();});
})();

/* ===== J8NIX chat (PWA, 13 Nov): Dave writes to the studio team through J8.inbox.
   Every message is a row in j8_messages; the database adds an instant first line ("Got it…"),
   the team adds reply lines, and status moves new → routed → done. All of it updates live.
   Live AI answers stay off until control.brain_enabled (Dave's paid OK): no fake typing. ===== */
var J8C=(function(){
 var QUICK=['What is the one move that brings money fastest?','What is waiting on me right now?','Which arms failed or went quiet?','One line on every project'];
 var MAX=60,lastOld='',lastNew='',sending=false;
 var SW={new:'Sent',routed:'With the team',done:'Done'};
 function g(id){return document.getElementById(id);}
 function dayKey(iso){var t=iso?new Date(iso):new Date();return isNaN(t)?'':ymd(t);}
 function dayLabel(k){var t=new Date(k+'T12:00:00'),y=new Date(Date.now()-864e5);if(k===ymd(new Date()))return 'Today';if(k===ymd(y))return 'Yesterday';return t.getDate()+' '+MON[t.getMonth()]+(t.getFullYear()!==new Date().getFullYear()?' '+t.getFullYear():'');}
 function hm(iso){var t=iso?new Date(iso):new Date();return isNaN(t)?'':t.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});}
 /* reply lines look like "17:53 — text"; each line is one bubble from the team */
 function lines(r){return String(r||'').split('\n').filter(function(l){return l.trim();}).map(function(l){var m=l.match(/^\s*(\d{1,2}:\d\d)\s*[—-]\s*([\s\S]*)$/);return m?{t:m[1],x:m[2]}:{t:'',x:l.trim()};});}
 function md(s){var h=esc(s);
  h=h.replace(/\[([^\]\n]{1,120})\]\((#[A-Za-z0-9_\-]+|https?:\/\/[^\s)]+)\)/g,function(_,t,u){return u.charAt(0)==='#'?'<button type="button" class="lk" data-jump="'+u.slice(1)+'">'+t+'</button>':'<a class="lk ext" href="'+u+'" target="_blank" rel="noopener">'+t+'</a>';});
  h=h.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g,function(_,p,u){return p+'<a class="lk ext" href="'+u+'" target="_blank" rel="noopener">'+cut(u.replace(/^https?:\/\//,''),48)+'</a>';});
  return h.replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>');}
 function msgHTML(x){var st=SW[x.status]?x.status:'new',about=x.p&&x.p!=='p-general'?'<span class="ab" dir="auto">'+esc(pname(x.p))+'</span>':'';
  var h='<div class="cm u" id="m-'+esc(x.id)+'">'+about+'<p dir="auto">'+esc(x.text)+'</p><time>'+esc(hm(x.at))+' · <b class="cst cst-'+st+'">'+SW[st]+'</b></time></div>';
  lines(x.reply).forEach(function(l){h+='<div class="cm a"><div class="tx" dir="auto">'+md(l.x)+'</div>'+(l.t?'<time>'+esc(l.t)+'</time>':'')+'</div>';});
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
