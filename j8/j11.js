/* J8NIX 11.0.0 · j11 layer (16 Nov 2026). The 6.1 layout Dave chose (Chat · Next · List · Flow, "Do this first" with what it
   unlocks, a comment box on every task and draft) on the 10.1 engine (app.js: data, unlock ranking, approvals, Plan my day,
   calendar, runs, control, prefs). Loaded after app.js instead of v11.js; re-uses v11's helpers (goals, rings, cards).
   Revert to 10.1.0: index-10.1.0.html + sw-10.1.0.js. */
(function(){
var L11={en:{now:'Home',inbox:'Approve',steps:'Steps',projects:'Projects',calendar:'Calendar',me:'Me',
  gm:'Good morning',ga:'Good afternoon',ge:'Good evening',goal1:'Goal 1',of:'of {b}',daysLeft:'{n} days left',dayLeft:'1 day left',
  pace:'Pace {v}',next:'Your next step',frees:'Frees {n} items',min:'{n} min',doIt:'Do it',later:'Later',done:'Done',open:'Open',
  ok:'Needs your OK',okSub:'{a} drafts · {b} sets',okSub1:'1 draft',okNone:'Nothing waits for you',review:'Review',
  projs:'Projects',mySteps:'Your steps',runs:'Team runs · 24h',runsS:'Runs · 24h',stepsS:'Steps',ask:'Ask J8 anything',
  week:'Week',all:'All',noEv:'Nothing dated this week',clear:'All clear. Nothing waits on you.',then:'Then',more:'+{n} more',
  qProject:'New project',qMemo:'Record voice memo',qRem:'New reminder',qAudit:'Audit projects',
  pProject:'New project: ',pRem:'Remind me ',pAudit:'Audit all projects: where each one stands vs the goal, what blocks money, and the one next step for each.',pMemo:'Voice memo: ',
  listening:'Listening… speak now',stepsH:'Your next step',ofN:'{a} of {b}',planDay:'Plan my day',teamOn:'Team on',teamOff:'Team paused',
  tour:'Show me around',obSkip:'Skip',obNext:'Next',obStart:'Start',obDone:'Let’s go',obBack:'Back',
  ob1h:'Meet J8',ob1p:'Your copilot for the business.',ob1a:'Your goal, always in view',ob1b:'One next step at a time',ob1c:'Nothing goes out without your OK',
  ob2h:'Your goal',ob2j:'This is the goal I steer us toward.',ob2a:'Big goal',ob2b:'First milestone',ob2c:'Booked so far',ob2n:'To change a goal, tell J8 in the chat.',by:'by {d}',asOf:'as of {d}',
  ob3h:'Your OK',ob3j:'Drafts wait here until you decide. Try it on this sample.',ob3s:'Sample draft',ob3t:'Thanks for the call today. Here are the 3 fixes we talked about…',ob3ok:'Approve sends it. Edit changes it first. Kill drops it.',approve:'Approve',edit:'Edit',kill:'Kill',tried:'Nice. That is all it takes.',
  ob4h:'Your day',ob4j:'How much time should I plan for you each day?',ob4q:'Quiet days: Friday and Saturday. Nothing goes out on Shabbat.',ob4l:'Language',
  ob5h:'Stay in the loop',ob5j:'Only what needs you: 🔴 now and 🟠 today.',ob5a:'Turn on alerts',ob5b:'Get the Android app',ob5c:'iPhone: Share → Add to Home Screen',
  hrs:'{n} h',goals:'Goals',pin:'Pin to top',pinned:'Pinned',stage:'Stage {a}/6',booked:'{a} booked',money:'Money',overdue:'Overdue',today:'Today',noGoals:'No dated milestones yet. Tell J8 a goal and a date.',
  moved:'What moved · 24 h',movedNone:'Nothing moved in the last 24 h.',pMoved:'Projects moved',sent:'Sent',runsL:'Team runs',last24:'Last 24 h',pMovedS:'Moved',sentS:'Sent',runsS2:'Runs',
  ob2gh:'Your goals',ob2gj:'These are the real milestones across your projects. Pick the ones to watch on Home; the pin goes first.',watch:'Watch',watching:'Watching'},
 he:{now:'בית',inbox:'אישורים',steps:'צעדים',projects:'פרויקטים',calendar:'יומן',me:'אני',
  gm:'בוקר טוב',ga:'צהריים טובים',ge:'ערב טוב',goal1:'יעד 1',of:'מתוך {b}',daysLeft:'עוד {n} ימים',dayLeft:'עוד יום',
  pace:'קצב {v}',next:'הצעד הבא שלך',frees:'משחרר {n} פריטים',min:'{n} דק׳',doIt:'לבצע',later:'אחר כך',done:'בוצע',open:'לפתוח',
  ok:'מחכה לאישור שלך',okSub:'{a} טיוטות · {b} סטים',okSub1:'טיוטה אחת',okNone:'אין מה לאשר',review:'לעבור',
  projs:'פרויקטים',mySteps:'הצעדים שלך',runs:'ריצות צוות · 24 ש׳',runsS:'ריצות · 24 ש׳',stepsS:'צעדים',ask:'לשאול את J8',
  week:'שבוע',all:'הכל',noEv:'אין תאריכים השבוע',clear:'הכל נקי. שום דבר לא מחכה לך.',then:'אחר כך',more:'עוד {n}',
  qProject:'פרויקט חדש',qMemo:'הקלטה קולית',qRem:'תזכורת חדשה',qAudit:'בדיקת פרויקטים',
  pProject:'פרויקט חדש: ',pRem:'תזכיר לי ',pAudit:'תבדוק את כל הפרויקטים: איפה כל אחד עומד מול היעד, מה חוסם כסף, והצעד הבא לכל אחד.',pMemo:'הקלטה: ',
  listening:'מקשיב… אפשר לדבר',stepsH:'הצעד הבא שלך',ofN:'{a} מתוך {b}',planDay:'לתכנן את היום',teamOn:'הצוות עובד',teamOff:'הצוות בהשהיה',
  tour:'סיור קצר',obSkip:'דלג',obNext:'הבא',obStart:'מתחילים',obDone:'יאללה',obBack:'חזרה',
  ob1h:'הכירו את J8',ob1p:'טייס המשנה של העסק.',ob1a:'היעד תמיד מול העיניים',ob1b:'צעד אחד בכל פעם',ob1c:'שום דבר לא יוצא בלי האישור שלך',
  ob2h:'היעד שלך',ob2j:'זה היעד שאני מכוון אליו.',ob2a:'היעד הגדול',ob2b:'אבן דרך ראשונה',ob2c:'נסגר עד עכשיו',ob2n:'לשינוי יעד, כתבו ל־J8 בצ׳אט.',by:'עד {d}',asOf:'נכון ל־{d}',
  ob3h:'האישור שלך',ob3j:'טיוטות מחכות כאן עד שתחליט. נסה על הדוגמה.',ob3s:'טיוטה לדוגמה',ob3t:'תודה על השיחה היום. הנה 3 התיקונים שדיברנו עליהם…',ob3ok:'אישור שולח. עריכה משנה קודם. ביטול מוריד.',approve:'לאשר',edit:'לערוך',kill:'לבטל',tried:'מעולה. זה כל מה שצריך.',
  ob4h:'היום שלך',ob4j:'כמה זמן לתכנן לך כל יום?',ob4q:'ימים שקטים: שישי ושבת. שום דבר לא יוצא בשבת.',ob4l:'שפה',
  ob5h:'להישאר מעודכן',ob5j:'רק מה שצריך אותך: 🔴 עכשיו ו־🟠 היום.',ob5a:'להפעיל התראות',ob5b:'אפליקציה לאנדרואיד',ob5c:'אייפון: שיתוף ← הוספה למסך הבית',
  hrs:'{n} ש׳',goals:'יעדים',pin:'להצמיד למעלה',pinned:'מוצמד',stage:'שלב {a}/6',booked:'{a} נסגרו',money:'כסף',overdue:'באיחור',today:'היום',noGoals:'עוד אין אבני דרך עם תאריך. ספרו ל־J8 יעד ותאריך.',
  moved:'מה זז · 24 ש׳',movedNone:'שום דבר לא זז ב־24 השעות האחרונות.',pMoved:'פרויקטים שזזו',sent:'נשלחו',runsL:'ריצות צוות',last24:'24 שעות אחרונות',pMovedS:'זזו',sentS:'נשלחו',runsS2:'ריצות',
  ob2gh:'היעדים שלך',ob2gj:'אלה אבני הדרך האמיתיות בכל הפרויקטים. בחרו מה לראות בבית; המוצמד ראשון.',watch:'לעקוב',watching:'במעקב'}};
function tt(k,o){var s=(L11[LANG]&&L11[LANG][k])||L11.en[k]||k;if(o)s=s.replace(/\{(\w+)\}/g,function(_,n){return o[n]==null?'':o[n];});return s;}
window.tt11=tt;

/* light only (Dave, 16 Nov) */
try{ls('j8-theme','light');}catch(e){}document.documentElement.dataset.theme='light';

function I(id,cls){return '<svg class="ico'+(cls?' '+cls:'')+'" aria-hidden="true"><use href="#i-'+id+'"/></svg>';}
function acts(){return myQueue().filter(function(i){return !(i.batch||i.ap||i.c||i.held);});}
function myTasks(){return tasksAll().filter(function(x){return x.owner==='dave'&&(!x.status||x.status==='open');});}
function runs24(){var n=0,now=Date.now();J8.runs.list().forEach(function(r){var t=pd(r.started||r.ended);if(!isNaN(t)&&now-t<864e5)n++;});return n;}
function paceOf(){var R=J8.runs.list(),o=null;R.some(function(r){if(!/morning plan/i.test(r.arm||''))return false;var m=String(r.summary||'').match(/vs\s+(\$[\d.,]+)\s*(k|K|M)?\s+pace/);if(!m)return false;
  var v=parseFloat(m[1].replace(/[$,]/g,''))*(m[2]&&/k/i.test(m[2])?1e3:m[2]==='M'?1e6:1);o={txt:m[1]+(m[2]||''),v:v,at:r.ended};return true;});return o;}
function greet(){var h=new Date().getHours();return tt(h<12?'gm':h<18?'ga':'ge');}
function firstName(){var o=J8.orgs.current()||{},u=(J8.status().user||{}),n=String(o.me||'').trim().split(/\s+/)[0];if(n)return n;var e=String(u.email||'').split('@')[0].split(/[._-]/)[0];return e?e.charAt(0).toUpperCase()+e.slice(1):'';}
function ring(sz,sw,pct,pace,col){var r=(sz-sw)/2,C=2*Math.PI*r,c=sz/2,a=Math.max(0,Math.min(1,pct||0));
  var h='<svg class="ring11" width="'+sz+'" height="'+sz+'" viewBox="0 0 '+sz+' '+sz+'" aria-hidden="true"><circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" stroke="#E1E7F2" stroke-width="'+sw+'"/>'
  +'<circle class="rf" cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" stroke="'+(col||'#2AB9FF')+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-dasharray="'+Math.max(.01,a*C).toFixed(2)+' '+C.toFixed(2)+'"/>';
  if(pace!=null&&isNum(pace)){var p=Math.max(0,Math.min(1,pace));h+='<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" stroke="#FF9700" stroke-width="'+sw+'" stroke-linecap="round" stroke-dasharray=".01 '+C.toFixed(2)+'" stroke-dashoffset="'+(-p*C).toFixed(2)+'"/>';}
  return h+'</svg>';}
function iconOf(i){var u=String((i.task&&(i.task.link||i.task.action))||'')+' '+String((i.p&&i.p.you)||'');if(i.batch||i.ap)return 'inbox';if(/linkedin/i.test(u))return 'linkedin';if(/instagram/i.test(u))return 'insta';if(/mail|gmail/i.test(u))return 'mail';return 'foot';}
function doBtn(i,cls){var g=doTarget(i),k=esc(i.key),lab=tt('doIt');if(UI.doing[i.key]||g.done)return '<button class="btn11 pri '+(cls||'')+'" data-a="done" data-k="'+k+'">'+I('check')+'<span>'+esc(t('markDone'))+'</span></button>';
  return g.href?'<a class="btn11 pri '+(cls||'')+'" href="'+esc(g.href)+'" target="_blank" rel="noopener" data-a="do" data-k="'+k+'"><span>'+lab+'</span>'+I('do','flip')+'</a>':'<button class="btn11 pri '+(cls||'')+'" data-a="do" data-k="'+k+'"><span>'+lab+'</span>'+I('do','flip')+'</button>';}
function minsChip(i){return isNum(i.mins)?'<span class="ch11">'+I('time')+'<bdi>'+esc(tt('min',{n:i.mins}))+'</bdi></span>':'';}
function chanIcons(){var c={};apPending().forEach(function(a){var s=String(a.channel||'')+' '+String(a.kind||'');c[/linkedin/i.test(s)?'linkedin':/instagram|reel/i.test(s)?'insta':/mail/i.test(s)?'mail':'users']=1;});return Object.keys(c).slice(0,3);}
function setsOf(){var by={};apPending().forEach(function(a){var s=String(a.channel||'')+' '+String(a.kind||''),k=a.kind==='template'?'shield':/instagram|reel/i.test(s)?'insta':a.kind==='post'||/linkedin/i.test(s)&&a.kind==='post'?'linkedin':'users';by[k]=(by[k]||0)+1;});return by;}
var SETN={users:['Founder notes','פניות למייסדים'],linkedin:['Posts','פוסטים'],insta:['Reels','רילס'],shield:['Templates','תבניות']};

function gprefs(){var o={};try{o=J8.prefs.get()||{};}catch(e){}return {pin:o.goalPin||ls('j8-goalpin')||null,watch:Array.isArray(o.goalWatch)?o.goalWatch:(ls('j8-goalwatch')||null)};}
function gsave(patch){if('goalPin' in patch)ls('j8-goalpin',patch.goalPin);if('goalWatch' in patch)ls('j8-goalwatch',patch.goalWatch);try{if(J8.prefs&&J8.status().connected)J8.prefs.set(patch).catch(function(){});}catch(e){}}
function goalsAll(){var G=[],m=J8.money.summary()||{},td=ymd(new Date());
  liveP().forEach(function(p){if(!p.milestone||!p.milestone_at||isDoneP(p)||p.status==='parked')return;var d=dday(p.milestone_at);if(!/^\d{4}-\d\d-\d\d$/.test(d))return;var st=stageOf(p);
    G.push({id:p.id,pid:p.id,t:p.milestone,sub:p.name,day:d,pct:st/6,pl:st?tt('stage',{a:st}):'',col:(pcolRaw(p.id)||['#2A44C6'])[0],src:p.milestone_src||''});});
  if(m.m1_date&&isNum(m.m1_usd))G.push({id:'money',t:tt('booked',{a:usd(m.m1_usd)}),sub:tt('money'),day:dday(m.m1_date),pct:(isNum(m.booked_usd)?m.booked_usd:0)/m.m1_usd,pl:usd(isNum(m.booked_usd)?m.booked_usd:0)+' / '+usd(m.m1_usd),col:'#32CC00'});
  G=G.concat(myGoals(G));var up=G.filter(function(g){return g.day>=td;}).sort(function(a,b){return a.day.localeCompare(b.day);}),od=G.filter(function(g){return g.day<td;}).sort(function(a,b){return b.day.localeCompare(a.day);});
  od.forEach(function(g){g.over=true;});return up.concat(od);}
function goalsShown(){var A=goalsAll(),P=gprefs(),L=P.watch&&P.watch.length?A.filter(function(g){return P.watch.indexOf(g.id)>-1;}):A;if(!L.length)L=A;
  if(P.pin){var i=L.map(function(g){return g.id;}).indexOf(P.pin);if(i>0)L=[L[i]].concat(L.slice(0,i),L.slice(i+1));}return {L:L.slice(0,3),pin:P.pin};}
function gDue(g){if(g.over)return tt('overdue')+' · '+dayShort(new Date(g.day+'T12:00:00'));return g.day===ymd(new Date())?tt('today'):dayShort(new Date(g.day+'T12:00:00'));}
function goalsCard(desk){var S=goalsShown(),L=S.L;
  return '<section class="card11 h11-goals"><h3>'+I('target')+'<span>'+esc(tt('goals'))+'</span><span class="n"><bdi>'+goalsAll().length+'</bdi></span></h3>'
   +(L.length?'<ul class="gl11">'+L.map(function(g){var pin=S.pin===g.id;return '<li class="'+(pin?'pin':'')+'"><button class="g" data-a="'+(g.pid?'proj':'nav')+'" data-id="'+esc(g.pid||'money')+'"><span class="gr">'+ring(desk?44:40,5,g.pct,null,g.col)+'</span><span class="gt"><b dir="auto">'+esc(cut(g.t,60))+'</b><small><bdi dir="auto">'+esc(g.sub)+'</bdi> · <bdi class="'+(g.over?'od':'')+'">'+esc(gDue(g))+'</bdi>'+(g.pl?' · <bdi>'+esc(g.pl)+'</bdi>':'')+'</small></span></button>'
     +'<button class="gpin" data-a="v11-pin" data-id="'+esc(g.id)+'" aria-pressed="'+pin+'" aria-label="'+esc(pin?tt('pinned'):tt('pin'))+'">'+I('pin')+'</button></li>';}).join('')+'</ul>':'<p class="sub11">'+esc(tt('noGoals'))+'</p>')+'</section>';}
function movedN(){var now=Date.now(),pm=0,se=0;liveP().forEach(function(p){var t=pd(p.updated);if(!isNaN(t)&&now-t<864e5)pm++;});J8.approvals.list().forEach(function(a){var t=pd(a.sent_at);if(a.status==='sent'&&!isNaN(t)&&now-t<864e5)se++;});return {pm:pm,se:se,ru:runs24()};}
function movedLines(){var now=Date.now();return J8.runs.list().filter(function(r){var t=pd(r.ended||r.started);return r.summary&&r.status!=='nothing'&&r.status!=='failed'&&!isNaN(t)&&now-t<864e5;}).slice(0,3);}
function goalCard(desk){var m=J8.money.summary(),b=m&&isNum(m.booked_usd)?m.booked_usd:null,g=m&&isNum(m.m1_usd)?m.m1_usd:null,d=m&&m.m1_date?J8.money.daysTo(m.m1_date):null,pc=paceOf();
  var pct=b!=null&&g?b/g:0,pp=pc&&g?pc.v/g:null,sz=desk?150:96;
  var chips='<span class="ch11">'+I('time')+'<bdi>'+(d==null?'—':esc(d===1?tt('dayLeft'):tt('daysLeft',{n:Math.max(0,d)})))+'</bdi></span>'+(pc?'<span class="ch11 pace" title="'+esc((LANG==='he'?'מתוכנית הבוקר של J8, ':'From J8’s morning plan, ')+tm1(pc.at))+'">'+I('pace')+'<bdi>'+esc(tt('pace',{v:pc.txt}))+'</bdi></span>':'');
  var mid=desk?'<span class="rv"><b><bdi>'+esc(b==null?'—':usd(b))+'</bdi></b><small><bdi>'+esc(tt('of',{b:g==null?'—':usd(g)}))+'</bdi></small></span>':'<span class="rv">'+I('target')+'<small>'+esc(tt('goal1'))+'</small></span>';
  return '<button class="card11 h11-goal" data-a="nav" data-id="money"><span class="ringw">'+ring(sz,desk?14:10,pct,pp)+mid+'</span>'
   +(desk?'':'<span class="gt"><span class="gv"><b><bdi>'+esc(b==null?'—':usd(b))+'</bdi></b><small><bdi>'+esc(tt('of',{b:g==null?'—':usd(g)}))+'</bdi></small></span>')
   +'<span class="chips11">'+chips+'</span>'+(desk?'':'</span>')+'</button>';}
function nextCard(N){var i=N[0];if(!i)return '<section class="card11 h11-next"><p class="h11-clear">'+I('done')+'<span>'+esc(tt('clear'))+'</span></p></section>';
  var n=nextOf(i),k=esc(i.key);
  return '<section class="card11 h11-next" aria-label="'+esc(tt('next'))+'"><div class="chips11"><span class="ch11 nx">'+I('foot')+esc(tt('next'))+'</span>'+minsChip(i)+'</div>'
   +'<div class="nrow"><span class="well11 r">'+I(iconOf(i))+'</span><div class="nt"><b dir="auto">'+esc(cap1(n.what))+'</b>'+(i.ul.length?'<span class="sub11">'+I('key')+'<bdi>'+esc(tt('frees',{n:i.ul.length}))+'</bdi></span>':'')+'</div></div>'
   +'<div class="nacts">'+doBtn(i,'grow')+'<button class="btn11 icon" data-a="later" data-k="'+k+'" aria-label="'+esc(tt('later'))+'">'+I('later')+'</button></div></section>';}
function okCard(desk){var A=apPending(),B=batches(),n=A.length,ci=chanIcons();
  var sub=n?(n===1?tt('okSub1'):tt('okSub',{a:n,b:B.length})):tt('okNone');
  if(desk){var S=setsOf();return '<section class="card11 h11-ok"><span class="well11 r big royal">'+I('inbox')+'</span><div class="okt"><b>'+esc(tt('ok'))+'</b><span class="okn"><b><bdi>'+n+'</b></bdi><small><bdi>'+esc(n?tt('okSub',{a:'',b:B.length}).replace(/^\s*/,'').replace(/^\S*\s*/,LANG==='he'?'טיוטות ':'drafts '):'')+'</bdi></small></span></div>'
   +'<div class="chips11 wrap">'+Object.keys(S).map(function(k){return '<span class="ch11 line">'+I(k)+'<span>'+esc(SETN[k][LANG==='he'?1:0])+' · <bdi>'+S[k]+'</bdi></span></span>';}).join('')+'</div>'
   +(n?'<button class="btn11 pri" data-a="nav" data-id="inbox"><span>'+esc(tt('review'))+'</span>'+I('do','flip')+'</button>':'')+'</section>';}
  return '<button class="card11 h11-ok" data-a="nav" data-id="inbox"><span class="well11 r big royal">'+I('inbox')+'</span><span class="okt"><b>'+esc(tt('ok'))+'</b><small><bdi>'+esc(sub)+'</bdi></small></span>'
   +'<span class="stack11">'+ci.map(function(c){return '<i class="well11 r sm">'+I(c)+'</i>';}).join('')+'</span>'+I('fwd','flip chev')+'</button>';}
function statTiles(desk){var M=movedN();
  if(desk)return '<section class="card11 h11-stat"><p class="st24">'+esc(tt('last24'))+'</p><button data-a="nav" data-id="projects"><b><bdi>'+M.pm+'</bdi></b><span>'+esc(tt('pMoved'))+'</span></button><button data-a="nav" data-id="calendar"><b><bdi>'+M.se+'</bdi></b><span>'+esc(tt('sent'))+'</span></button><button data-a="nav" data-id="me"><b><bdi>'+M.ru+'</bdi></b><span>'+esc(tt('runsL'))+'</span></button></section>';
  return '<div class="h11-stat"><button class="card11" data-a="nav" data-id="projects">'+I('proj')+'<span><b><bdi>'+M.pm+'</bdi></b><small>'+esc(tt('pMovedS'))+' · 24h</small></span></button><button class="card11" data-a="nav" data-id="calendar">'+I('send')+'<span><b><bdi>'+M.se+'</bdi></b><small>'+esc(tt('sentS'))+' · 24h</small></span></button><button class="card11" data-a="nav" data-id="me">'+I('runs','ok')+'<span><b><bdi>'+M.ru+'</bdi></b><small>'+esc(tt('runsS2'))+' · 24h</small></span></button></div>';}
function calCard(){var E=events(),now=new Date(),days=[],td=ymd(now),cnt={};E.forEach(function(e){cnt[e.day]=(cnt[e.day]||0)+1;});
  var m=J8.money.summary()||{},gd=m.m1_date?dday(m.m1_date):'';
  for(var k=0;k<7;k++){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+k),y=ymd(d);days.push('<span class="'+(k?'':'on')+'"><small>'+esc(LANG==='he'?DOWH[d.getDay()]:DOW[d.getDay()])+'</small><b><bdi>'+d.getDate()+'</bdi></b><i class="'+(y===gd?'goal':cnt[y]?'':'no')+'"></i></span>');}
  var U=E.filter(function(e){return e.day>=td;}).sort(function(a,b){return (a.day+(a.time||'99')).localeCompare(b.day+(b.time||'99'));}).slice(0,3);
  return '<section class="card11 h11-cal"><h3>'+I('cal')+'<span>'+esc(dayStr(now))+'</span><button class="more11" data-a="nav" data-id="calendar">'+esc(tt('week'))+I('fwd','flip')+'</button></h3><div class="week11">'+days.join('')+'</div>'
   +(U.length?'<ul class="ag11">'+U.map(function(e){var w=e.day===td?(e.time||''):dayShort(new Date(e.day+'T12:00:00'));return '<li><button data-a="jump" data-id="'+esc(e.jump||'calendar')+'"><time><bdi>'+esc(w)+'</bdi></time><i class="well11 r sm'+(e.jump==='stats'?' nx':'')+'">'+I(e.jump==='stats'?'flag':e.k==='you'?'send':'cal')+'</i><span dir="auto">'+esc(cut(e.title,48))+'</span></button></li>';}).join('')+'</ul>':'<p class="sub11">'+esc(tt('noEv'))+'</p>')+'</section>';}
function stepsCard(N){var L=N.slice(0,4);
  return '<section class="card11 h11-steps"><h3>'+I('foot')+'<span>'+esc(tt('mySteps'))+'</span><span class="n"><bdi>'+N.length+'</bdi></span><button class="more11" data-a="nav" data-id="steps">'+esc(tt('all'))+I('fwd','flip')+'</button></h3>'
   +(L.length?'<ol class="sl11">'+L.map(function(i,k){var n=nextOf(i);return '<li class="'+(k?'':'top')+'"><span class="num">'+(k+1)+'</span>'+I(iconOf(i))+'<button class="st" data-a="nav" data-id="steps" dir="auto">'+esc(cap1(n.what))+'</button>'
     +(k===0&&i.ul.length?'<span class="ch11 nx w">'+I('key')+'<bdi>'+esc(tt('frees',{n:i.ul.length}))+'</bdi></span>':'')+(isNum(i.mins)?'<span class="mn">'+I('time')+'<bdi>'+esc(tt('min',{n:i.mins}))+'</bdi></span>':'')+(k===0?doBtn(i,'sm'):'')+'</li>';}).join('')+'</ol>':'<p class="h11-clear">'+I('done')+'<span>'+esc(tt('clear'))+'</span></p>')+'</section>';}
function qaCol(){return '<section class="h11-qa">'+[['project','fplus','qProject'],['memo','mic','qMemo'],['reminder','alarm','qRem'],['audit','audit','qAudit']].map(function(q){return '<button class="card11" data-a="v11-q" data-id="'+q[0]+'"><span class="well11 r royal">'+I(q[1])+'</span><span>'+esc(tt(q[2]))+'</span></button>';}).join('')+'</section>';}

/* =================== 11.0.0: the 6.1 layout (Chat · Next · List · Flow) =================== */
Object.assign(L11.en,{next:'Next',chat:'Chat',list:'List',flow:'Flow',me:'Me',inbox:'Drafts',projects:'Projects',calendar:'Timeline',
  chatSub:'J8 and the team',dtf:'Do this first',unlocks:'Unlocks {n}',justUnl:'Just unlocked',frees2:'Frees {x}',doIt:'Do it',review:'Review',nn:'Not needed',
  waitN:'{n} wait on you',wait1:'1 waits on you',else:'Everything else',cmtL:'Comment on this',cmtP:'Comment on this',send:'Send',
  drafts:'Drafts',lsub:'{p} projects · {d} drafts',f_map:'Map',f_time:'Timeline',f_ins:'Insights',f_team:'Teams',f_num:'Numbers',
  fsub:'{n} projects · {s}',sendOn:'sending on',sendOff:'sending paused',noMs:'No dated milestone',msBy:'{x} · {d}',you:'You',team:'Team',outside:'Outside',
  allP:'All',mineP:'Needs me',blockedP:'Blocked',goalsP:'Goal progress',ctl:'Control',ctlP:'Pause sending, email, limits',open:'Open',
  msgP:'Message J8 and the team',hour:'J8 and the team answer within the hour. You get an alert.',live:'J8 answers here in a moment.',
  thinking:'J8 is thinking…',got:'J8 got it · the team answers within the hour',withTeam:'With the team',doneW:'Done',sentW:'Sent',
  noMsg:'No messages yet. Ask anything about your goals, projects or drafts.',refresh:'Pull to refresh',refreshing:'Refreshing…',upToDate:'Up to date',
  cel1:'Milestone hit',celStage:'{p} moved to {s}',celMoney:'First milestone booked',celClear:'All clear',celClearP:'Nothing waits on you. Nice work.',
  setGoals:'Set your goals',yourGoal:'Your goal',
  o0h:'What is your role?',o0p:'J8NIX becomes your business OS. Tell me who you are.',r_founder:'Founder',r_pm:'Product manager',r_mkt:'Marketing manager',r_solo:'Solo builder',
  o1h:'Your goals',o1j:'Name 1 to 3 goals, each with a date. I plan toward them.',gT:'Goal {n}',gPh:'e.g. First 10 paying users',gD:'By',addG:'Add a goal',onBoard:'Already on your board',
  o2h:'What serves each goal?',o2j:'Pick the project that moves each goal.',noProj:'Not tied to a project yet',repl:'Replaces: {x}',notAdmin:'Saved to your goals. An admin can put it on the project.',noGoalsYet:'No goals yet. Go back to add one, or skip.',
  o3h:'How J8 helps',h1:'Prioritises: what unlocks the most goes first',h2:'Plans your day to fit your time',h3:'Re-plans when things move',h4:'Checks in when something needs you',perDay:'Time for you each day',
  o4h:'Stay in the loop',o5h:'Your first step',o5j:'Here is the one thing to do first.',o5none:'Nothing waits on you yet. J8 adds steps as the team works.',goNow:'Go to it',saved:'Goals saved',saveFail:'Couldn’t save to the project: {e}'});
Object.assign(L11.he,{next:'הבא',chat:'צ׳אט',list:'רשימה',flow:'זרימה',me:'אני',inbox:'טיוטות',projects:'פרויקטים',calendar:'ציר זמן',
  chatSub:'J8 והצוות',dtf:'קודם כל זה',unlocks:'משחרר {n}',justUnl:'השתחרר עכשיו',frees2:'משחרר {x}',doIt:'לבצע',review:'לעבור',nn:'לא צריך',
  waitN:'{n} מחכים לך',wait1:'אחד מחכה לך',else:'כל השאר',cmtL:'הערה על זה',cmtP:'הערה על זה',send:'שליחה',
  drafts:'טיוטות',lsub:'{p} פרויקטים · {d} טיוטות',f_map:'מפה',f_time:'ציר זמן',f_ins:'תובנות',f_team:'צוותים',f_num:'מספרים',
  fsub:'{n} פרויקטים · {s}',sendOn:'שליחה פעילה',sendOff:'שליחה מושהית',noMs:'אין אבן דרך עם תאריך',msBy:'{x} · {d}',you:'את/ה',team:'צוות',outside:'בחוץ',
  allP:'הכל',mineP:'צריך אותי',blockedP:'חסום',goalsP:'התקדמות ביעדים',ctl:'שליטה',ctlP:'השהיית שליחה, מייל, מגבלות',open:'לפתוח',
  msgP:'הודעה ל־J8 ולצוות',hour:'J8 והצוות עונים תוך שעה. תקבל/י התראה.',live:'J8 עונה כאן עוד רגע.',
  thinking:'J8 חושב…',got:'J8 קיבל · הצוות עונה תוך שעה',withTeam:'אצל הצוות',doneW:'בוצע',sentW:'נשלח',
  noMsg:'עוד אין הודעות. אפשר לשאול על יעדים, פרויקטים או טיוטות.',refresh:'משיכה לרענון',refreshing:'מרענן…',upToDate:'מעודכן',
  cel1:'אבן דרך הושגה',celStage:'{p} עבר ל{s}',celMoney:'אבן הדרך הראשונה נסגרה',celClear:'הכל נקי',celClearP:'שום דבר לא מחכה לך. כל הכבוד.',
  setGoals:'להגדיר יעדים',yourGoal:'היעד שלך',
  o0h:'מה התפקיד שלך?',o0p:'J8NIX הופך למערכת ההפעלה של העסק שלך. ספרו לי מי אתם.',r_founder:'מייסד/ת',r_pm:'מנהל/ת מוצר',r_mkt:'מנהל/ת שיווק',r_solo:'בונה לבד',
  o1h:'היעדים שלך',o1j:'1 עד 3 יעדים, לכל אחד תאריך. אני מתכנן לקראתם.',gT:'יעד {n}',gPh:'למשל 10 לקוחות משלמים',gD:'עד',addG:'להוסיף יעד',onBoard:'כבר על הלוח',
  o2h:'מה משרת כל יעד?',o2j:'בחרו את הפרויקט שמקדם כל יעד.',noProj:'עוד לא קשור לפרויקט',repl:'מחליף: {x}',notAdmin:'נשמר ביעדים שלך. מנהל/ת יכול/ה לשים אותו על הפרויקט.',noGoalsYet:'עוד אין יעדים. אפשר לחזור ולהוסיף, או לדלג.',
  o3h:'איך J8 עוזר',h1:'מתעדף: מה שמשחרר הכי הרבה קודם',h2:'מתכנן את היום לפי הזמן שלך',h3:'מתכנן מחדש כשדברים זזים',h4:'בודק איתך כשמשהו צריך אותך',perDay:'זמן בשבילך כל יום',
  o4h:'להישאר מעודכן',o5h:'הצעד הראשון שלך',o5j:'זה הדבר האחד לעשות קודם.',o5none:'עוד אין צעדים. J8 מוסיף צעדים כשהצוות עובד.',goNow:'לצעד',saved:'היעדים נשמרו',saveFail:'לא נשמר בפרויקט: {e}'});
['en','he'].forEach(function(l){if(TX[l])['next','chat','list','flow','me','inbox','projects','calendar'].forEach(function(k){TX[l][k]=L11[l][k];});});
/* places: the four 6.1 places plus Me (avatar); old names land on their new home */
PLACE={next:'next',chat:'chat',list:'list',flow:'flow',inbox:'list',projects:'list',proj:'list',dept:'list',draft:'list',qitem:'list',calendar:'flow',money:'flow',me:'me'};
PLACES.length=0;['next','chat','list','flow','me','inbox','projects','calendar'].forEach(function(k){PLACES.push(k);});
Object.keys(VMAP).forEach(function(k){delete VMAP[k];});Object.assign(VMAP,{now:'next',home:'next',today:'next',steps:'next',talk:'chat',studio:'projects',list:'projects',stats:'flow'});
var TOPV={next:1,chat:1,flow:1,calendar:1,money:1,projects:1,inbox:1,me:1};
UI.lseg=UI.lseg||'proj';UI.fseg=UI.fseg||'map';UI.pmf=UI.pmf||'all';
function TD(){return LANG==='he'?'rtl':'auto';}
function RM(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}
var ANIM={t0:0};function animate(){ANIM.t0=Date.now();}
curPlace=function(){return PLACE[UI.v]||'next';};
renderTop=function(){var pl=curPlace(),inner=!TOPV[UI.v];document.body.dataset.place=pl;document.body.dataset.inner=inner?'1':'0';
 $('tBack').hidden=!inner;$('hdT').textContent=UI.v==='proj'&&pobj(UI.proj)?pobj(UI.proj).name:tt(pl);$('tBackL').textContent=t('xBack');};
var nav0=navTo;navTo=function(v){if(v==='list')v=UI.lseg==='drafts'?'inbox':'projects';if(v==='flow'){if(UI.fseg==='time')v='calendar';else if(UI.fseg==='num')v='money';}
 if(v==='steps'||v==='now'||v==='home'||v==='today')v='next';nav0(v);};
setJ8=function(){document.body.dataset.j8='closed';};document.body.dataset.j8='closed';

/* nav: labels, counts (Next = your queue, List = drafts, Chat = team asks), team pill, avatar */
var rn0=renderNav;
renderNav=function(){try{rn0();}catch(e){}var pl=curPlace();
  [].forEach.call(document.querySelectorAll('#nav [data-nav]'),function(b){var k=b.dataset.nav;if(k===pl)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');var l=b.querySelector('.lbl');if(l)l.textContent=tt(k);});
  var N=connected?myQueue().length:0,A=connected?apPending().length:0,C=connected?askRows().length:0;
  [['nN',N],['tN',A],['cN',C]].forEach(function(x){var e=$(x[0]);if(e){e.textContent=x[1]?badge(x[1]):'';e.hidden=!x[1];e.classList.remove('due');}});
  var c=J8.control.get(),off=c&&c.paused;['teamL','teamLD'].forEach(function(id){var e=$(id);if(e)e.textContent=tt(off?'teamOff':'teamOn');});
  ['teamPill','teamPillD'].forEach(function(id){var e=$(id);if(e)e.classList.toggle('off',!!off);});
  var u=(J8.status().user||{}),av=$('topAv');if(av){av.textContent=mono(u.email||'?');av.setAttribute('aria-current',UI.v==='me'?'page':'false');}
  var tl=$('tourL');if(tl)tl.textContent=tt('tour');};

/* ---------- shared bits ---------- */
function ph(title,sub,extra){return '<header class="ph12"><div><h2 id="pageH" tabindex="-1">'+esc(title)+'</h2>'+(sub?'<p class="sub12">'+sub+'</p>':'')+'</div>'+(extra||'')+'</header>';}
function g8i(){return '<svg class="g8" aria-hidden="true"><use href="#eight"/></svg>';}
function chip12(cls,icon,txt){return '<span class="chip12 '+(cls||'')+'">'+(icon?I(icon):'')+'<bdi>'+txt+'</bdi></span>';}
function sevCls(i){return i.sev==='r'?'r':i.sev==='o'||i.sev==null?'o':'n';}
function fid(k){return 'c12-'+String(k).replace(/[^\w-]/g,'_');}
function cbox12(i){var pid=rowPid(i)||'p-general',tk=i.task?i.task.id:'',ap=i.ap?i.ap.id:(i.batch&&i.batch.items.length===1?i.batch.items[0].id:''),id=fid(i.key);
  return '<form class="cb12" data-ans="'+esc(pid)+'"'+(tk?' data-task="'+esc(tk)+'"':'')+(ap?' data-ap="'+esc(ap)+'"':'')+(i.c?' data-ask="'+esc(i.key)+'"':'')+'><label class="sr" for="'+id+'">'+esc(tt('cmtL'))+'</label><textarea id="'+id+'" rows="1" dir="'+TD()+'" placeholder="'+esc(tt('cmtP'))+'"></textarea><button type="submit" class="b12 icon" aria-label="'+esc(tt('send'))+'">'+I('send','flip')+'</button></form>';}
function bar12(i){var g=doTarget(i),k=esc(i.key),dec=!!(i.batch||i.ap||i.held),lab=dec?tt('review'):tt('doIt'),doing=UI.doing[i.key]||g.done,prim;
  if(doing)prim='<button class="b12 pri" data-a="done" data-k="'+k+'">'+I('check')+'<span>'+esc(tt('done'))+'</span></button>';
  else if(g.href)prim='<a class="b12 pri" href="'+esc(g.href)+'" target="_blank" rel="noopener" data-a="do" data-k="'+k+'"><span>'+esc(lab)+'</span>'+I('ext')+'</a>';
  else prim='<button class="b12 pri" data-a="do" data-k="'+k+'"><span>'+esc(lab)+'</span>'+I('do','flip')+'</button>';
  var dn=!doing&&(i.task||(i.p&&i.move))?'<button class="b12" data-a="done" data-k="'+k+'">'+I('check')+'<span>'+esc(tt('done'))+'</span></button>':'';
  return '<div class="bar12'+(dn?'':' three')+'" role="group" aria-label="'+esc(t('actions'))+'">'+prim+dn+'<button class="b12" data-a="later" data-k="'+k+'">'+I('later')+'<span>'+esc(tt('later'))+'</span></button><button class="b12" data-a="no" data-k="'+k+'">'+I('no')+'<span>'+esc(tt('nn'))+'</span></button></div>';}
function skel(n,hero){var o=hero?'<div class="sk12 hero"></div>':'';for(var k=0;k<n;k++)o+='<div class="sk12"></div>';return '<div class="skw12" role="status" aria-label="'+esc(t('loading'))+'">'+o+'</div>';}

/* ---------- Next: Do this first · Then · Everything else ---------- */
function myGoals(G){var o={},L=[];try{o=J8.prefs.get()||{};}catch(e){}var P=Array.isArray(o.goals)?o.goals:(ls('j8-goals')||[]);
  (P||[]).forEach(function(g,k){if(!g||!g.t||!/^\d{4}-\d\d-\d\d$/.test(String(g.at||'')))return;var p=g.pid&&pobj(g.pid);if(p&&p.milestone===g.t)return;
    L.push({id:'g-'+k,pid:p?p.id:null,t:g.t,sub:p?p.name:tt('yourGoal'),day:g.at,pct:p?stageOf(p)/6:0,pl:p&&stageOf(p)?tt('stage',{a:stageOf(p)}):'',col:'#9500FF'});});return L;}
function goalsStrip(){var S=goalsShown(),L=S.L;
  if(!L.length)return '<button class="gs12 none" data-a="x12-ob" data-id="1">'+I('target')+'<span>'+esc(tt('setGoals'))+'</span>'+I('fwd','flip')+'</button>';
  return '<section class="gs12" aria-label="'+esc(tt('goals'))+'"><ul>'+L.map(function(g){var pin=S.pin===g.id;
    return '<li class="'+(pin?'pin':'')+'"><button class="g" data-a="'+(g.pid?'proj':'nav')+'" data-id="'+esc(g.pid||(g.id==='money'?'money':'next'))+'"><span class="gr">'+ring(40,5,g.pct,null,g.col)+'</span><span class="gt"><b dir="auto">'+esc(cut(g.t,42))+'</b><small class="'+(g.over?'od':'')+'"><bdi>'+esc(gDue(g))+'</bdi></small></span></button>'
     +'<button class="gpin" data-a="v11-pin" data-id="'+esc(g.id)+'" aria-pressed="'+pin+'" aria-label="'+esc(pin?tt('pinned'):tt('pin'))+'">'+I('pin')+'</button></li>';}).join('')+'</ul></section>';}
function heroCard(i){var n=nextOf(i),k=esc(i.key),pid=rowPid(i),p=pobj(pid),ul=i.ul.length,unl=UI.unl&&(i.ids||[]).some(function(x){return UI.unl.indexOf(x)>-1;});
  return '<section class="hero12'+(UI.arriveK===i.key?' arrive':'')+'" id="hero12" data-k="'+k+'" aria-labelledby="heroT">'
   +'<div class="eb12"><span class="dtf">'+g8i()+'<span>'+esc(tt('dtf'))+'</span></span>'+(unl?chip12('new','unlock',esc(tt('justUnl'))):'')+(ul?chip12('unl','key',esc(tt('unlocks',{n:ul}))):'')+(isNum(i.mins)?chip12('','time',esc(tt('min',{n:i.mins}))):'')+'</div>'
   +'<h3 id="heroT" class="ht12" dir="auto">'+esc(cap1(n.what))+'</h3>'
   +(ul?'<p class="fr12">'+I('unlock')+'<span dir="auto">'+esc(tt('frees2',{x:freesTxt(i)}))+'</span></p>':'')
   +(p&&pid!=='p-general'?'<p class="pj12">'+ptile(pid,'sm')+'<bdi dir="auto">'+esc(p.name)+'</bdi></p>':'')
   +bar12(i)+cbox12(i)+'</section>';}
function row12(i,num){var n=nextOf(i),k=esc(i.key),o=UI.open['r12'+i.key],pid=rowPid(i),p=pobj(pid);
  return '<li class="row12'+(o?' open':'')+(UI.arriveK&&UI.arriveK!==i.key&&num<5?' arrive':'')+'" id="r-'+k+'" style="--i:'+num+'"><button class="rh12" data-a="x12-row" data-k="'+k+'" aria-expanded="'+(o?'true':'false')+'"><span class="num12"><bdi>'+num+'</bdi></span><span class="dot12 '+sevCls(i)+'" aria-hidden="true"></span>'
   +'<span class="rt12"><b dir="auto">'+esc(cap1(n.what))+'</b>'+(p&&pid!=='p-general'?'<small dir="auto">'+esc(p.name)+'</small>':'')+'</span>'
   +(i.ul.length?'<span class="chip12 unl sm">'+I('key')+'<bdi>'+i.ul.length+'</bdi><span class="sr"> '+esc(tt('unlocks',{n:i.ul.length}))+'</span></span>':'')+I('down','chev')+'</button>'
   +(o?'<div class="rb12">'+whyLine(i)+bar12(i)+cbox12(i)+'</div>':'')+'</li>';}
function groups12(R,off){var by={},order=[];R.forEach(function(i){var u=unitOf(pobj(rowPid(i))),id=u?u.id:'_',nm=u?u.name:t('other');if(!by[id]){by[id]={nm:nm,L:[]};order.push(id);}by[id].L.push(i);});
  var n=off;return order.map(function(id){var g=by[id],key='g12-'+id,op=!!UI.open[key],start=n;n+=g.L.length;
    return '<details class="grp12" data-k="'+esc(key)+'" data-was="'+(op?1:0)+'"'+(op?' open':'')+'><summary><span class="gn" dir="auto">'+esc(g.nm)+'</span><span class="gw"><bdi>'+esc(g.L.length===1?tt('wait1'):tt('waitN',{n:g.L.length}))+'</bdi></span>'+I('down','chev')+'</summary>'
     +(op?'<ol class="rows12">'+g.L.map(function(i,j){return row12(i,start+j+1);}).join('')+'</ol>':'')+'</details>';}).join('');}
function vNext(){var N=connected?myQueue():[],desk=isDesk();
  var h=ph(tt('next'),connected?esc(N.length===1?tt('wait1'):N.length?tt('waitN',{n:N.length}):''):'',N.length>1?'<button class="lnk12" data-a="x-plan">'+I('plan')+'<span>'+esc(tt('planDay'))+'</span></button>':'');
  if(!connected)return h+skel(3,true);
  if(J8.status().error==='offline'){var sa=UI.syncedAt?hm2(UI.syncedAt):'—';h+='<p class="held">'+I('wifi')+'<span>'+esc(t('noConnP',{t:sa}))+'</span> <button class="lnk" data-a="retry">'+t('tryAgain')+'</button></p>';}
  var m='';if(!desk)m+=goalsStrip();
  m+=N.length?heroCard(N[0]):'<section class="hero12 clear"><p>'+I('done')+'<span>'+esc(tt('clear'))+'</span></p></section>';
  if(N.length>1)m+='<h3 class="sh12">'+esc(tt('then'))+'</h3><ol class="rows12">'+N.slice(1,4).map(function(i,k){return row12(i,k+2);}).join('')+'</ol>';
  var R=N.slice(4);if(R.length)m+='<h3 class="sh12">'+esc(tt('else'))+' <span class="n12"><bdi>'+R.length+'</bdi></span></h3>'+groups12(R,4);
  if(desk)return h+'<div class="next12 desk"><div class="c1">'+m+'</div><aside class="c2" aria-label="'+esc(tt('goals'))+'">'+goalsCard(true)+okCard(true)+statTiles(true)+'</aside></div>';
  return h+'<div class="next12">'+m+'</div>';}

/* ---------- Chat: J8 and the team ---------- */
function stLabel(s){return s==='done'?tt('doneW'):s==='routed'?tt('withTeam'):tt('sentW');}
function chatLog(){var L=J8.inbox.list(40).slice().reverse(),h='',day='',brain=J8.control.brainEnabled(),now=Date.now();
  L.forEach(function(x,ix){var ms=pd(x.at),k=isNaN(ms)?'':ymd(new Date(ms));if(k&&k!==day){day=k;h+='<p class="day12"><span>'+esc(k===ymd(new Date())?tt('today'):dayStr(new Date(ms)))+'</span></p>';}
    var tg=msgTarget(Object.assign({id:x.id},x)),ab=tg.msg?'':targetTitle(tg).title,st=x.status||'new';
    h+='<div class="me12"><div class="bub12 mine">'+(ab?'<p class="ab12">'+I('link')+'<bdi dir="auto">'+esc(cut(ab,44))+'</bdi></p>':'')+'<p dir="auto">'+esc(x.text)+'</p><span class="tm12"><bdi>'+esc(tm1(x.at))+'</bdi> · '+esc(stLabel(st))+'</span></div></div>';
    teamLines(x).forEach(function(l){var v=sevOf(l.x)||sevLegacy(l.x);h+='<div class="j812"><span class="av12" aria-hidden="true">'+g8i()+'</span><div class="bub12'+(v?' lv-'+v:'')+'">'+(v?sevChip(v):'')+'<div dir="auto">'+md(sevStrip(l.x))+'</div>'+(l.t?'<span class="tm12"><bdi>'+esc(l.t)+'</bdi></span>':'')+'</div></div>';});
    if(st!=='done'&&ix>=L.length-3&&!isNaN(ms)&&now-ms<12*36e5&&(st==='routed'||!teamLines(x).length))h+='<div class="j812 typing12" role="status"><span class="av12" aria-hidden="true">'+g8i()+'</span><div class="bub12"><span class="dots12" aria-hidden="true"><i></i><i></i><i></i></span><small>'+esc(st==='routed'?tt('withTeam'):brain?tt('thinking'):tt('got'))+'</small></div></div>';});
  return h||'<p class="empty12">'+g8i()+'<span>'+esc(tt('noMsg'))+'</span></p>';}
function vChat(){var M=connected?movedN():null,h=ph(tt('chat'),esc(tt('chatSub')));
  if(!connected)return h+skel(4);
  h+='<div class="pulse12" role="group" aria-label="'+esc(tt('last24'))+'"><span class="pl">'+esc(tt('last24'))+'</span>'+chip12('','runs',M.ru+' '+esc(tt('runsS2')))+chip12('','send',M.se+' '+esc(tt('sentS')))+chip12('','proj',M.pm+' '+esc(tt('pMovedS')))+'</div>';
  var R=movedLines();if(R.length)h+='<section class="brief12" aria-label="'+esc(tt('moved'))+'"><h3>'+g8i()+'<span>'+esc(tt('moved'))+'</span></h3><ul>'+R.map(function(r){var pid=(r.projects||[])[0];return '<li>'+(pid&&pid!=='p-general'?ptile(pid,'sm'):'<span class="well11 r sm">'+I('runs')+'</span>')+'<span dir="auto">'+esc(cut(noUrl(sevStrip(r.summary)),110))+'</span><time><bdi>'+esc(tm1(r.ended||r.started))+'</bdi></time></li>';}).join('')+'</ul></section>';
  h+='<div class="log12" id="log12">'+chatLog()+'</div>';
  h+='<form class="comp12" id="chatF" autocomplete="off"><label class="sr" for="chatIn">'+esc(tt('msgP'))+'</label><textarea id="chatIn" rows="1" dir="'+TD()+'" placeholder="'+esc(tt('msgP'))+'"></textarea><button type="submit" class="b12 pri icon" id="chatGo" aria-label="'+esc(tt('send'))+'">'+I('send','flip')+'</button></form>'
   +'<p class="note12">'+esc(J8.control.brainEnabled()?tt('live'):tt('hour'))+'</p>';
  return h;}

/* ---------- List: projects and drafts ---------- */
function stripHead(html){return html.replace(/^<header class="ph">[\s\S]*?<\/header>/,'').replace(/id="pageH"/g,'id="subH"');}
function listWrap(seg,html){UI.lseg=seg;var A=apPending().length,P=liveP().filter(function(p){return !isDoneP(p);}).length;
  var h=ph(tt('list'),esc(tt('lsub',{p:P,d:A})))+'<nav class="seg12 two" aria-label="'+esc(tt('list'))+'">'
   +[['proj','proj',tt('projects'),P],['drafts','inbox',tt('drafts'),A]].map(function(x){return '<button data-a="x12-lseg" data-id="'+x[0]+'" aria-pressed="'+(x[0]===seg)+'">'+I(x[1])+'<span>'+esc(x[2])+'</span>'+(x[3]?'<span class="n12"><bdi>'+x[3]+'</bdi></span>':'')+'</button>';}).join('')+'</nav>';
  return h+'<div class="lb12">'+stripHead(html)+'</div>';}
var vd0=vDraft10;vDraft10=function(){var h=vd0(),cur=(UI.dids||[]).filter(isPend)[0],a=cur&&AP[cur];if(!a)return h;
  var id='c12-ap-'+String(cur).replace(/[^\w-]/g,'_');return h+'<form class="cb12 dn12" data-ans="'+esc(a.product||'p-general')+'" data-ap="'+esc(cur)+'"><label class="sr" for="'+id+'">'+esc(tt('cmtL'))+'</label><textarea id="'+id+'" rows="1" dir="'+TD()+'" placeholder="'+esc(tt('cmtP'))+'"></textarea><button type="submit" class="b12 icon" aria-label="'+esc(tt('send'))+'">'+I('send','flip')+'</button></form>';};

/* ---------- Flow: Map · Timeline · Insights · Teams · Numbers ---------- */
function segs6(s){var o='<span class="sg12" aria-hidden="true">';for(var k=1;k<=6;k++)o+='<i class="'+(k<s?'on':k===s?(k===6?'pay':'cur'):'')+'" style="--k:'+k+'"></i>';return o+'</span>';}
function holdChip(h){return h==='me'?chip12('you','you',esc(tt('you'))):h==='ext'?chip12('out','out',esc(tt('outside'))):chip12('tm','team',esc(tt('team')));}
function flowMap(){var M=mineBy(),f=UI.pmf,P=liveP().filter(function(p){return !isDoneP(p);});
  var L=P.filter(function(p){return f==='all'||(f==='me'?holderOf(p,M)==='me':projBlocked(p));});
  var h='<div class="flt12" role="group" aria-label="'+esc(tt('f_map'))+'">'+[['all','allP'],['me','mineP'],['blk','blockedP']].map(function(x){return '<button data-a="x12-pmf" data-id="'+x[0]+'" aria-pressed="'+(f===x[0])+'">'+esc(tt(x[1]))+'</button>';}).join('')+'</div>';
  var by={},ord=[];L.forEach(function(p){var u=unitOf(p),id=u?u.id:'_';if(!by[id]){by[id]={nm:u?u.name:t('other'),L:[]};ord.push(id);}by[id].L.push(p);});
  h+=ord.map(function(id){var g=by[id];return '<section class="un12"><h3 dir="auto">'+esc(g.nm)+' <span class="n12"><bdi>'+g.L.length+'</bdi></span></h3>'+g.L.map(function(p){var s=stageOf(p),ms=msOf(p),ho=holderOf(p,M),c=(pcolRaw(p.id)||['#2A44C6'])[0];
    return '<button class="ln12" data-a="proj" data-id="'+esc(p.id)+'" style="--pc:'+esc(c)+'">'+ptile(p.id,'sm')+'<span class="lt"><b dir="auto">'+esc(p.name)+'</b><small dir="auto">'+(ms&&ms.at?esc(tt('msBy',{x:cut(ms.t,46),d:dlabel(ms.at)})):esc(tt('noMs')))+'</small></span><span class="ls">'+segs6(s)+'<small>'+esc(s?stgL(s):'—')+'</small></span>'+holdChip(ho)+'</button>';}).join('')+'</section>';}).join('');
  return L.length?h:h+'<p class="empty12">'+I('done')+'<span>'+esc(tt('clear'))+'</span></p>';}
function insights(){var A=goalsAll(),h='<section class="card12"><h3>'+I('target')+'<span>'+esc(tt('goalsP'))+'</span></h3>';
  h+=A.length?'<ul class="gb12">'+A.map(function(g){var pc=Math.round(Math.max(0,Math.min(1,g.pct||0))*100);return '<li><span class="gt"><b dir="auto">'+esc(cut(g.t,60))+'</b><small><bdi dir="auto">'+esc(g.sub)+'</bdi> · <bdi class="'+(g.over?'od':'')+'">'+esc(gDue(g))+'</bdi></small></span><span class="bar" role="img" aria-label="'+pc+'%"><i style="width:'+pc+'%;background:'+esc(g.col)+'"></i></span><b class="pct"><bdi>'+pc+'%</bdi></b></li>';}).join('')+'</ul>':'<p class="sub11">'+esc(tt('noGoals'))+'</p>';
  h+='</section>';var f='';try{f=flowHTML();}catch(e){f='';}return h+(f?'<section class="card12 ins12">'+f+'</section>':'');}
function teams(){var h='<button class="card12 ctl12" data-cx="open"><span class="well11 r royal">'+I('shield')+'</span><span><b>'+esc(tt('ctl'))+'</b><small>'+esc(tt('ctlP'))+'</small></span>'+I('fwd','flip chev')+'</button>',R=[];
  try{R=teamRows();}catch(e){R=[];}return h+(R.length?'<section class="card12 tm12l">'+R.map(teamRowHTML).join('')+'</section>':'');}
function flowWrap(seg){UI.fseg=seg;var c=J8.control.get(),P=liveP().filter(function(p){return !isDoneP(p);}).length;
  var T=[['map','map'],['time','cal'],['ins','bulb'],['team','team'],['num','chart']];
  var h=ph(tt('flow'),esc(tt('fsub',{n:P,s:tt(c&&c.paused?'sendOff':'sendOn')})))+'<nav class="seg12 five" aria-label="'+esc(tt('flow'))+'">'+T.map(function(x){return '<button data-a="x12-fseg" data-id="'+x[0]+'" aria-pressed="'+(x[0]===seg)+'">'+I(x[1])+'<span>'+esc(tt('f_'+x[0]))+'</span></button>';}).join('')+'</nav>';
  if(!connected)return h+skel(4);
  var b=seg==='map'?flowMap():seg==='time'?stripHead(vCal()):seg==='ins'?insights():seg==='team'?teams():stripHead(vMoney());
  return h+'<div class="fb12 f-'+seg+'">'+b+'</div>';}

/* ---------- render ---------- */
function parkJ8(){var jp=$('j8p'),m=$('main');if(jp&&m&&m.contains(jp))$('app').insertBefore(jp,$('scrim'));}
var STG=null;
function after12(v,focus){var m=$('main');
  var el=Date.now()-ANIM.t0;if(!RM()&&el<1400){m.classList.remove('still');m.style.setProperty('--ad',(-el)+'ms');}else{m.classList.add('still');}
  if(v==='chat'){var lg=$('main');if(focus||UI.chatStick)lg.scrollTop=lg.scrollHeight;}
  if(!connected)return;
  /* celebrate real milestones only: a project stage up, M1 booked, or the queue cleared by your own Done */
  var now={},P=liveP();P.forEach(function(p){now[p.id]=stageOf(p);});var old=STG||ls('j8-stg');
  if(old&&typeof old==='object'){var up=P.filter(function(p){return isNum(old[p.id])&&now[p.id]>old[p.id];})[0];if(up)celebrate(tt('cel1'),tt('celStage',{p:up.name,s:stgL(now[up.id])}));}
  STG=now;ls('j8-stg',now);
  var mo=J8.money.summary();if(mo&&isNum(mo.booked_usd)&&isNum(mo.m1_usd)&&mo.m1_usd>0){var hit=mo.booked_usd>=mo.m1_usd,was=ls('j8-m1hit');if(hit&&was===false)celebrate(tt('cel1'),tt('celMoney'));ls('j8-m1hit',hit);}
  if(UI.justDone&&v==='next'&&!myQueue().length){UI.justDone=0;celebrate(tt('celClear'),tt('celClearP'));}}
function celebrate(h,p){if($('cel12'))return;var d=document.createElement('div');d.id='cel12';d.setAttribute('role','status');
  d.innerHTML='<div class="cc"><span class="burst" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="tr">'+I('trophy')+'</span><b>'+esc(h)+'</b><p dir="auto">'+esc(p)+'</p></div>';
  document.body.appendChild(d);d.addEventListener('click',function(){d.remove();});setTimeout(function(){if(d.parentNode)d.remove();},RM()?2200:2800);}
window.j8cel=celebrate;window.j8goals=goalsAll;
render=function(focus){var m=$('main');if(!m)return;if(VMAP[UI.v])UI.v=VMAP[UI.v];view=UI.v;renderTop();renderNav();
 if(!focus&&busyMain())return;
 [].forEach.call(m.querySelectorAll('textarea[id]'),function(x){TYPING[x.id]=x.value;});parkMe();parkJ8();
 if(focus)animate();
 var y=m.scrollTop,v=UI.v,md=$('mdd'),my=md?md.scrollTop:0;UI.chatStick=v==='chat'&&m.scrollHeight-m.scrollTop-m.clientHeight<80;
 m.innerHTML=v==='next'?vNext():v==='chat'?vChat():v==='inbox'?listWrap('drafts',vInbox()):v==='qitem'?vQitem():v==='projects'||v==='dept'?listWrap('proj',vProjects()):v==='proj'?vProj():v==='draft'?draftCheck()+vDraft10()
  :v==='flow'?flowWrap(UI.fseg==='time'||UI.fseg==='num'?'map':UI.fseg):v==='calendar'?flowWrap('time'):v==='money'?flowWrap('num'):v==='me'?vMe():vNext();
 document.body.dataset.homej8='0';document.body.dataset.v=v;
 slotMe();if(v==='me'){meWords();renderPrefs();renderSeat();renderTheme();}lint(m);
 Object.keys(TYPING).forEach(function(id){var x=document.getElementById(id);if(x&&TYPING[id]&&!x.value)x.value=TYPING[id];});
 if(focus){m.scrollTop=0;m.classList.add('push');clearTimeout(render.pt);render.pt=setTimeout(function(){m.classList.remove('push');},260);var ph0=$('pageH');(ph0||m).focus({preventScroll:true});}else{if(Math.abs(m.scrollTop-y)>2)m.scrollTop=y;var md2=$('mdd');if(md2)md2.scrollTop=my;}
 try{var hs=hashOf();if(location.hash!==hs&&!/token/.test(location.hash))history.replaceState(null,'',location.pathname+location.search+hs);}catch(e){}
 if(UI.gsheet&&UI.gsheet.k==='thread'&&!$('gsheet').hidden){var g=$('gth');if(!g||document.activeElement!==g){threadSheet(UI.gsheet.tg);lint($('gsheet'));}}
 after12(v,focus);obMaybe();};
var rsT=null;window.addEventListener('resize',function(){clearTimeout(rsT);rsT=setTimeout(function(){if(UI.v==='next')render();},150);});

/* Done on "Do this first": the card checks off, then the next step slides up (and says when it was just unlocked) */
window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('#hero12 [data-a=done]');if(!el)return;var k=el.dataset.k,i=rowByKey(k);if(!i)return;
  e.preventDefault();e.stopPropagation();var N=myQueue(),nx=N.filter(function(x){return x.key!==k;})[0];UI.unl=(i.ul||[]).slice();UI.arriveK=nx?nx.key:null;UI.justDone=1;
  var go=function(){animate();markDone(k);setTimeout(function(){if(UI.arriveK)UI.arriveK=null;},1500);};
  if(RM()){go();return;}var h=$('hero12');if(h)h.classList.add('leave');setTimeout(go,440);},true);
/* Chat composer */
document.addEventListener('submit',function(e){var f=e.target;if(!f||f.id!=='chatF')return;e.preventDefault();var i=$('chatIn'),v=String(i&&i.value||'').trim();if(!v)return;
  if(!J8.status().connected){toast(t('notConn'));return;}i.value='';TYPING.chatIn='';var b=$('chatGo');if(b)b.disabled=true;
  J8.inbox.send('p-general',v).then(function(){if($('chatGo'))$('chatGo').disabled=false;i.blur();UI.chatStick=true;render();var m=$('main');m.scrollTop=m.scrollHeight;},function(er){if($('chatGo'))$('chatGo').disabled=false;toast(t('couldNot',{e:er&&er.code||'error'}));});},true);
document.addEventListener('keydown',function(e){var x=e.target;if(x&&x.id==='chatIn'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&isDesk()){e.preventDefault();var f=$('chatF');if(f.requestSubmit)f.requestSubmit();}});
document.addEventListener('input',function(e){var x=e.target;if(x&&x.tagName==='TEXTAREA'&&x.closest('.cb12,.comp12')){x.style.height='auto';x.style.height=Math.min(160,x.scrollHeight+2)+'px';}});

/* pull to refresh (phones): drag down at the top of a screen, let go past the line */
(function(){var y0=null,dy=0,el=null,busy=false;function bar(){if(!el){el=document.createElement('div');el.id='ptr12';el.setAttribute('aria-hidden','true');el.innerHTML='<span>'+I('refresh')+'</span>';document.body.appendChild(el);}return el;}
 document.addEventListener('touchstart',function(e){var m=$('main');if(busy||!m||isDesk()||!m.contains(e.target)||m.scrollTop>0||e.touches.length!==1||e.target.closest('textarea,input,select'))return;y0=e.touches[0].clientY;dy=0;},{passive:true});
 document.addEventListener('touchmove',function(e){if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy<=0){bar().style.setProperty('--p',0);return;}var b=bar();b.classList.add('on');b.style.setProperty('--p',Math.min(1,dy/90).toFixed(3));b.classList.toggle('ready',dy>90);},{passive:true});
 document.addEventListener('touchend',function(){if(y0==null)return;y0=null;var b=bar();if(dy>90&&!busy){busy=true;b.classList.add('spin');toast(tt('refreshing'));
   J8.reload().then(function(){toast(tt('upToDate'));},function(){toast(t('notConn'));}).then(function(){busy=false;b.classList.remove('on','spin','ready');});}else b.classList.remove('on','ready');dy=0;},{passive:true});})();

/* ---------- onboarding: role · goals · projects · how J8 helps · alerts · first step (6 screens) ---------- */
var OB={on:false,s:0,seen:false,role:null,goals:null};var OBN=6;
function obDone(){if(ls('j8-ob'))return true;try{return !!(J8.prefs.get()||{}).onboarded;}catch(e){return false;}}
function obMaybe(){if(OB.on||OB.seen||!connected||obDone())return;OB.seen=true;obOpen(0);}
function obLoad(){var o={};try{o=J8.prefs.get()||{};}catch(e){}OB.role=o.role||ls('j8-role')||null;var G=Array.isArray(o.goals)?o.goals:(ls('j8-goals')||[]);OB.goals=(G&&G.length?G:[{t:'',at:'',pid:''}]).map(function(g){return {t:g.t||'',at:g.at||'',pid:g.pid||''};}).slice(0,3);}
function obOpen(s){OB.on=true;OB.s=s||0;obLoad();var el=$('ob11');if(!el){el=document.createElement('div');el.id='ob11';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','obH');document.body.appendChild(el);}el.hidden=false;obRender();}
function obClose(){OB.on=false;var el=$('ob11');if(el)el.hidden=true;ls('j8-ob',1);try{if(J8.prefs&&J8.status().connected)J8.prefs.set({onboarded:new Date().toISOString()}).catch(function(){});}catch(e){}}
function dots(){var o='<div class="dots11" aria-hidden="true">';for(var k=0;k<OBN;k++)o+='<i class="'+(k===OB.s?'on':'')+'"></i>';return o+'</div>';}
function prom(ic,cls,txt){return '<li><span class="well11 r big '+cls+'">'+I(ic)+'</span><span>'+esc(txt)+'</span></li>';}
function j8say(txt){return '<div class="say11"><span class="j8av11"><img src="icons/mark-8.svg" alt="" width="12" height="27"></span><p>'+esc(txt)+'</p></div>';}
function obCollect(){if(OB.s!==1&&OB.s!==2)return;var el=$('ob11');if(!el)return;OB.goals.forEach(function(g,k){var a=el.querySelector('#og-t-'+k),b=el.querySelector('#og-d-'+k),c=el.querySelector('#og-p-'+k);if(a)g.t=a.value.trim().slice(0,140);if(b)g.at=b.value;if(c)g.pid=c.value;});}
function goalsReady(){return OB.goals.filter(function(g){return g.t&&/^\d{4}-\d\d-\d\d$/.test(g.at);});}
function obSave(){var G=goalsReady().map(function(g){return {t:g.t,at:g.at,pid:g.pid||null};}),pf={goals:G};if(OB.role)pf.role=OB.role;ls('j8-goals',G);if(OB.role)ls('j8-role',OB.role);
  try{if(J8.prefs&&J8.status().connected)J8.prefs.set(pf).catch(function(){});}catch(e){}
  if(!J8.orgs.can('admin'))return Promise.resolve();
  return seq(G.filter(function(g){var p=g.pid&&pobj(g.pid);return p&&!(p.milestone===g.t&&dday(p.milestone_at)===g.at);}).map(function(g){return g;}),function(g){return J8.projects.setMilestone(g.pid,g.t,g.at).catch(function(er){toast(tt('saveFail',{e:er&&er.code||'error'}));throw er;});});}
function obRender(){var el=$('ob11'),s=OB.s,b='',nav,today=ymd(new Date());
  if(s===0){b='<div class="obhero sm"><img src="icons/logo-lockup.png" alt="J8NIX" width="280" height="116"></div><div class="obb">'+dots()+'<h2 id="obH">'+esc(tt('o0h'))+'</h2><p class="sub11">'+esc(tt('o0p'))+'</p><div class="roles12">'
    +[['founder','rocket'],['pm','board'],['mkt','megaphone'],['solo','wrench']].map(function(r){return '<button class="card11 role12" data-a="x12-role" data-id="'+r[0]+'" aria-pressed="'+(OB.role===r[0])+'"><span class="well11 r royal">'+I(r[1])+'</span><span>'+esc(tt('r_'+r[0]))+'</span>'+(OB.role===r[0]?I('check','ck'):'')+'</button>';}).join('')+'</div>';}
  else if(s===1){var A=goalsAll().filter(function(g){return g.id.indexOf('g-')!==0;}),P=gprefs(),W=P.watch&&P.watch.length?P.watch:A.slice(0,3).map(function(g){return g.id;});
    b='<div class="obb">'+dots()+j8say(tt('o1j'))+'<h2 id="obH">'+esc(tt('o1h'))+'</h2><div class="gin12">'+OB.goals.map(function(g,k){return '<div class="gi12"><label for="og-t-'+k+'">'+esc(tt('gT',{n:k+1}))+'</label><input id="og-t-'+k+'" type="text" maxlength="140" dir="auto" value="'+esc(g.t)+'" placeholder="'+esc(tt('gPh'))+'"><label class="dl" for="og-d-'+k+'">'+I('cal')+'<span>'+esc(tt('gD'))+'</span></label><input id="og-d-'+k+'" type="date" min="'+today+'" value="'+esc(g.at)+'"></div>';}).join('')
    +(OB.goals.length<3?'<button class="lnk12" data-a="x12-ob" data-id="add">'+I('plus')+'<span>'+esc(tt('addG'))+'</span></button>':'')+'</div>'
    +(A.length?'<h3>'+esc(tt('onBoard'))+'</h3><ul class="gl11 ob">'+A.slice(0,4).map(function(g){var on=W.indexOf(g.id)>-1;return '<li><button class="g" data-a="v11-ob" data-id="w-'+esc(g.id)+'" aria-pressed="'+on+'"><span class="gr">'+ring(36,4,g.pct,null,g.col)+'</span><span class="gt"><b dir="auto">'+esc(cut(g.t,50))+'</b><small><bdi dir="auto">'+esc(g.sub)+'</bdi> · <bdi>'+esc(gDue(g))+'</bdi></small></span><span class="ck">'+I(on?'done':'plus')+'<span class="sr">'+esc(on?tt('watching'):tt('watch'))+'</span></span></button></li>';}).join('')+'</ul>':'');}
  else if(s===2){var G=goalsReady(),PL=liveP().filter(function(p){return !isDoneP(p)&&p.id!=='p-general';}),adm=J8.orgs.can('admin');
    b='<div class="obb">'+dots()+j8say(tt('o2j'))+'<h2 id="obH">'+esc(tt('o2h'))+'</h2>'+(G.length?'<div class="gin12">'+OB.goals.map(function(g,k){if(!(g.t&&g.at))return '';var cp=g.pid&&pobj(g.pid);
      return '<div class="gi12 pj"><label for="og-p-'+k+'"><b dir="auto">'+esc(g.t)+'</b><small><bdi>'+esc(dayShort(new Date(g.at+'T12:00:00')))+'</bdi></small></label><select id="og-p-'+k+'" data-a2="ob-pid"><option value="">'+esc(tt('noProj'))+'</option>'+PL.map(function(p){return '<option value="'+esc(p.id)+'"'+(g.pid===p.id?' selected':'')+'>'+esc(p.name)+'</option>';}).join('')+'</select>'
       +(cp&&cp.milestone&&cp.milestone!==g.t?'<small class="rp">'+esc(tt('repl',{x:cut(cp.milestone,60)}))+'</small>':'')+'</div>';}).join('')+'</div>'+(adm?'':'<p class="sub11">'+esc(tt('notAdmin'))+'</p>'):'<p class="sub11">'+esc(tt('noGoalsYet'))+'</p>');}
  else if(s===3){var cap=capMin();b='<div class="obb">'+dots()+j8say(J8.control.brainEnabled()?tt('live'):tt('hour'))+'<h2 id="obH">'+esc(tt('o3h'))+'</h2><ul class="prom11">'+prom('order','royal',tt('h1'))+prom('plan','nx',tt('h2'))+prom('repeat','vi',tt('h3'))+prom('now','ok',tt('h4'))+'</ul>'
    +'<h3>'+esc(tt('perDay'))+'</h3><div class="seg11">'+[60,120,180,240].map(function(c){return '<button class="opt11" data-a="v11-ob" data-id="cap-'+c+'" aria-pressed="'+(cap===c)+'">'+esc(tt('hrs',{n:c/60}))+'</button>';}).join('')+'</div>';}
  else if(s===4){b='<div class="obb">'+dots()+j8say(tt('ob5j'))+'<h2 id="obH">'+esc(tt('o4h'))+'</h2><div class="qa11"><button class="card11" data-a="v11-ob" data-id="push"><span class="well11 r royal">'+I('now')+'</span><span>'+esc(tt('ob5a'))+'</span></button>'
    +(/android/i.test(navigator.userAgent)?'<a class="card11" href="app/"><span class="well11 r royal">'+I('phone')+'</span><span>'+esc(tt('ob5b'))+'</span></a>':'<p class="sub11">'+I('phone')+esc(tt('ob5c'))+'</p>')+'</div>'
    +'<h3>'+esc(tt('ob4l'))+'</h3><div class="seg11"><button class="opt11" data-a="v11-ob" data-id="lang-en" aria-pressed="'+(LANG!=='he')+'" lang="en">English</button><button class="opt11" data-a="v11-ob" data-id="lang-he" aria-pressed="'+(LANG==='he')+'" lang="he">עברית</button></div>';}
  else{var N=connected?myQueue():[],i=N[0];b='<div class="obb">'+dots()+j8say(i?tt('o5j'):tt('o5none'))+'<h2 id="obH">'+esc(tt('o5h'))+'</h2>'
    +(i?'<section class="hero12 obh"><div class="eb12"><span class="dtf">'+g8i()+'<span>'+esc(tt('dtf'))+'</span></span>'+(i.ul.length?chip12('unl','key',esc(tt('unlocks',{n:i.ul.length}))):'')+(isNum(i.mins)?chip12('','time',esc(tt('min',{n:i.mins}))):'')+'</div><h3 class="ht12" dir="auto">'+esc(cap1(nextOf(i).what))+'</h3>'+(i.ul.length?'<p class="fr12">'+I('unlock')+'<span dir="auto">'+esc(tt('frees2',{x:freesTxt(i)}))+'</span></p>':'')+'</section>':'');}
  nav='<div class="obnav">'+(s?'<button class="btn11 icon" data-a="v11-ob" data-id="back" aria-label="'+esc(tt('obBack'))+'">'+I('back','flip')+'</button>':'')+'<button class="btn11 pri grow" data-a="v11-ob" data-id="'+(s<OBN-1?'next':'end')+'"><span>'+esc(s===0?tt('obStart'):s<OBN-1?tt('obNext'):tt('goNow'))+'</span>'+I('do','flip')+'</button></div>'
   +(s<OBN-1?'<button class="obskip" data-a="v11-ob" data-id="end">'+esc(tt('obSkip'))+'</button>':'');
  el.className='ob11 s'+s;el.innerHTML=b+nav+'</div>';var f=el.querySelector('#obH');if(f){f.setAttribute('tabindex','-1');f.focus({preventScroll:true});}}
function obAct(id){obCollect();
  if(id==='next'){if(OB.s===0&&OB.role){ls('j8-role',OB.role);try{if(J8.status().connected)J8.prefs.set({role:OB.role}).catch(function(){});}catch(e){}}
    if(OB.s===2){obSave().then(function(){if(goalsReady().length)toast(tt('saved'));},function(){});}
    OB.s=Math.min(OBN-1,OB.s+1);obRender();}
  else if(id==='back'){OB.s=Math.max(0,OB.s-1);obRender();}
  else if(id==='end'){if(OB.s===1||OB.s===2)obSave().catch(function(){});obClose();UI.stack=[];navTo('next');}
  else if(id==='add'){if(OB.goals.length<3)OB.goals.push({t:'',at:'',pid:''});obRender();var x=$('og-t-'+(OB.goals.length-1));if(x)x.focus();}
  else if(id.indexOf('w-')===0){var gid=id.slice(2),G=goalsAll(),P=gprefs(),W=(P.watch&&P.watch.length?P.watch:G.slice(0,3).map(function(g){return g.id;})).slice(),k=W.indexOf(gid);if(k>-1)W.splice(k,1);else W.push(gid);gsave({goalWatch:W});obRender();}
  else if(id.indexOf('cap-')===0){var c=+id.slice(4);ls('j8-cap',c);try{if(J8.prefs&&J8.status().connected)J8.prefs.set({cap:c}).catch(function(){});}catch(e){}obRender();}
  else if(id==='lang-en'||id==='lang-he'){setLang(id.slice(5));renderAll();obRender();}
  else if(id==='push'){var pb=$('pushBtn');if(pb)pb.click();}}
window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a^="v11-"],[data-a^="x12-"]');if(!el)return;e.preventDefault();e.stopPropagation();var a=el.dataset.a,id=el.dataset.id||'',k=el.dataset.k;
  if(a==='v11-pin'){var P=gprefs();gsave({goalPin:P.pin===id?null:id});if(OB.on)obRender();render();return;}
  if(a==='v11-ob')obAct(id);else if(a==='v11-tour'){closeSheet();obOpen(0);}
  else if(a==='x12-ob'){closeSheet();obOpen(+id||0);}
  else if(a==='x12-role'){OB.role=id;obRender();}
  else if(a==='x12-row'){UI.open['r12'+k]=!UI.open['r12'+k];render();var b=document.querySelector('[data-a=x12-row][data-k="'+(window.CSS&&CSS.escape?CSS.escape(k):k)+'"]');if(b)b.focus({preventScroll:true});}
  else if(a==='x12-lseg'){UI.lseg=id;UI.stack=[];navTo(id==='drafts'?'inbox':'projects');}
  else if(a==='x12-fseg'){UI.fseg=id;UI.stack=[];navTo(id==='time'?'calendar':id==='num'?'money':'flow');}
  else if(a==='x12-pmf'){UI.pmf=id;render();}},true);
document.addEventListener('keydown',function(e){if(OB.on&&e.key==='Escape'){obClose();render(true);}});
window.j8ob={open:obOpen,close:obClose,done:obDone};
})();
