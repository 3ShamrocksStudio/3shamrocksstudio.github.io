/* J8NIX 11.5.0 (18 Nov 2026): see the 11.5.0 block near the end. Revert: j11-11.4.0.js.
   J8NIX 11.0.0 · j11 layer (16 Nov 2026). The 6.1 layout Dave chose (Chat · Next · List · Flow, "Do this first" with what it
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
  listening:'Listening… speak now',stepsH:'Your next step',ofN:'{a} of {b}',teamOn:'Team on',teamOff:'Team paused',
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
  listening:'מקשיב… אפשר לדבר',stepsH:'הצעד הבא שלך',ofN:'{a} מתוך {b}',teamOn:'הצוות עובד',teamOff:'הצוות בהשהיה',
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
  return g.href?'<a class="btn11 pri '+(cls||'')+'" href="'+hesc(g.href)+'" target="_blank" rel="noopener" data-a="do" data-k="'+k+'"><span>'+lab+'</span>'+I('do','flip')+'</a>':'<button class="btn11 pri '+(cls||'')+'" data-a="do" data-k="'+k+'"><span>'+lab+'</span>'+I('do','flip')+'</button>';}
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
   +(L.length?'<ul class="gl11">'+L.map(function(g){var pin=pinned13(S,g.id);return '<li class="'+(pin?'pin':'')+'"><button class="g" data-a="'+(g.pid?'proj':'nav')+'" data-id="'+esc(g.pid||'money')+'"><span class="gr">'+ring(desk?44:40,5,g.pct,null,g.col)+'</span><span class="gt"><b dir="auto">'+esc(cut(g.t,60))+'</b><small><bdi dir="auto">'+esc(g.sub)+'</bdi> · <bdi class="'+(g.over?'od':'')+'">'+esc(gDue(g))+'</bdi>'+(g.pl?' · <bdi>'+esc(g.pl)+'</bdi>':'')+'</small></span></button>'
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
Object.assign(L11.en,{sending:'Sending…',delivered:'Delivered',replyHere:'J8 and the team will reply here, usually within the hour.',withTeamL:'With the team now. The reply comes here.',stuck:'Still connecting. Check your connection.',next:'Next',chat:'Chat',list:'List',flow:'Flow',me:'Me',inbox:'Drafts',projects:'Projects',calendar:'Timeline',
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
Object.assign(L11.he,{sending:'שולח…',delivered:'נמסר',replyHere:'J8 והצוות יענו כאן, בדרך כלל תוך שעה.',withTeamL:'אצל הצוות עכשיו. התשובה תגיע כאן.',stuck:'עדיין מתחבר. כדאי לבדוק את החיבור.',next:'הבא',chat:'צ׳אט',list:'רשימה',flow:'זרימה',me:'אני',inbox:'טיוטות',projects:'פרויקטים',calendar:'ציר זמן',
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
PLACES.length=0;['next','chat','list','flow','me','inbox','projects','calendar','ltasks'].forEach(function(k){PLACES.push(k);});
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
  var N=connected?myQueue().length:0,A=connected?apPending().length:0,RL=connected?replyLines():0;if(connected&&(UI.v==='chat'||document.body.dataset.j8==='open'))ls('j8-seenR',RL);var sr=ls('j8-seenR'),C=connected?askRows().length+(isNum(sr)?Math.max(0,RL-sr):0):0;
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
  else if(g.href)prim='<a class="b12 pri" href="'+hesc(g.href)+'" target="_blank" rel="noopener" data-a="do" data-k="'+k+'"><span>'+esc(lab)+'</span>'+I('ext')+'</a>';
  else prim='<button class="b12 pri" data-a="do" data-k="'+k+'"><span>'+esc(lab)+'</span>'+I('do','flip')+'</button>';
  var dn=!doing&&(i.task||(i.p&&i.move))?'<button class="b12" data-a="done" data-k="'+k+'">'+I('check')+'<span>'+esc(tt('done'))+'</span></button>':'';
  return '<div class="bar12'+(dn?'':' three')+'" role="group" aria-label="'+esc(t('actions'))+'">'+prim+dn+'<button class="b12" data-a="later" data-k="'+k+'">'+I('later')+'<span>'+esc(tt('later'))+'</span></button><button class="b12" data-a="no" data-k="'+k+'">'+I('no')+'<span>'+esc(tt('nn'))+'</span></button></div>';}
function skel(n,hero){if(Date.now()-BOOT12>12000)return '<section class="empty12 stuck12" role="status">'+I('wifi')+'<span>'+esc(tt('stuck'))+'</span><button class="b12" data-a="retry">'+I('refresh')+'<span>'+esc(t('tryAgain'))+'</span></button></section>';var o=hero?'<div class="sk12 hero"></div>':'';for(var k=0;k<n;k++)o+='<div class="sk12"></div>';return '<div class="skw12" role="status" aria-label="'+esc(t('loading'))+'">'+o+'</div>';}

/* ---------- Next: Do this first · Then · Everything else ---------- */
function myGoals(G){var o={},L=[];try{o=J8.prefs.get()||{};}catch(e){}var P=Array.isArray(o.goals)?o.goals:(ls('j8-goals')||[]);
  (P||[]).forEach(function(g,k){if(!g||!g.t||!/^\d{4}-\d\d-\d\d$/.test(String(g.at||'')))return;var p=g.pid&&pobj(g.pid);if(p&&p.milestone===g.t)return;
    L.push({id:'g-'+k,pid:p?p.id:null,t:g.t,sub:p?p.name:tt('yourGoal'),day:g.at,pct:p?stageOf(p)/6:0,pl:p&&stageOf(p)?tt('stage',{a:stageOf(p)}):'',col:'#9500FF'});});return L;}
function goalsStrip(){var S=goalsShown(),L=S.L;
  if(!L.length)return '<button class="gs12 none" data-a="x12-ob" data-id="1">'+I('target')+'<span>'+esc(tt('setGoals'))+'</span>'+I('fwd','flip')+'</button>';
  return '<section class="gs12" aria-label="'+esc(tt('goals'))+'"><ul>'+L.map(function(g){var pin=pinned13(S,g.id);
    return '<li class="'+(pin?'pin':'')+'"><button class="g" data-a="'+(g.pid?'proj':'nav')+'" data-id="'+esc(g.pid||(g.id==='money'?'money':'next'))+'"><span class="gr">'+ring(40,5,g.pct,null,g.col)+'</span><span class="gt"><b dir="auto">'+esc(cut(g.t,42))+'</b><small class="'+(g.over?'od':'')+'"><bdi>'+esc(gDue(g))+'</bdi></small></span></button>'
     +'<button class="gpin" data-a="v11-pin" data-id="'+esc(g.id)+'" aria-pressed="'+pin+'" aria-label="'+esc(pin?tt('pinned'):tt('pin'))+'">'+I('pin')+'</button></li>';}).join('')+'</ul></section>';}
function planTag(i){return i&&i.task&&(i.task.source==='j8nix-plan'||i.task.source==='j8nix-app')?'<p class="plan12"><span class="chip12 new sm">'+I('check')+'<bdi>'+esc(tt('yourPlan'))+'</bdi></span><button type="button" class="lnk" data-a="x12-tedit" data-id="'+esc(i.task.id)+'">'+I('edit')+'<span>'+esc(tt('editIt'))+'</span></button></p>':'';}
function px(o,k){return o?(o[k]!=null?o[k]:(o.extra||{})[k]):undefined;}
function projPlanTag(p){return p&&px(p,'plan')?'<p class="plan12"><span class="chip12 new sm">'+I('check')+'<bdi>'+esc(tt('yourPlan'))+'</bdi></span>'+(J8.orgs.can('admin')?'<button type="button" class="lnk" data-a="x12-pedit" data-id="'+esc(p.id)+'">'+I('edit')+'<span>'+esc(tt('editIt'))+'</span></button>':'')+'</p>':'';}
function heroCard(i,ix){var n=nextOf(i),k=esc(i.key),pid=rowPid(i),p=pobj(pid),ul=i.ul.length,unl=UI.unl&&(i.ids||[]).some(function(x){return UI.unl.indexOf(x)>-1;});
  return '<section class="hero12'+(UI.arriveK===i.key?' arrive':'')+'" id="hero12" data-k="'+k+'" aria-labelledby="heroT">'
   +'<div class="eb12"><span class="dtf">'+g8i()+'<span>'+esc(ix>0||!promo13(i)?tt('selN',{n:(ix||0)+1}):tt('dtf'))+'</span></span>'+(unl?chip12('new','unlock',esc(tt('justUnl'))):'')+(ul?chip12('unl','key',esc(tt('unlocks',{n:ul}))):'')+(isNum(i.mins)?chip12('','time',esc(tt('min',{n:i.mins}))):'')+'</div>'
   +'<h3 id="heroT" class="ht12" dir="auto">'+esc(cap1(n.what))+'</h3>'+planTag(i)
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
  var h=ph(tt('next'),connected?esc(N.length===1?tt('wait1'):N.length?tt('waitN',{n:N.length}):''):'','');
  if(!connected)return h+skel(3,true);
  if(J8.status().error==='offline'){var sa=UI.syncedAt?hm2(UI.syncedAt):'—';h+='<p class="held">'+I('wifi')+'<span>'+esc(t('noConnP',{t:sa}))+'</span> <button class="lnk" data-a="retry">'+t('tryAgain')+'</button></p>';}
  var m='';if(!desk)m+=goalsStrip();
  var H0=N.length&&promo13(N[0])?1:0; /* 11.3: Do this first only for a real step with how-to and a link (or drafts to OK) */
  m+=H0?heroCard(N[0]):N.length?'':'<section class="hero12 clear"><p>'+I('done')+'<span>'+esc(tt('clear'))+'</span></p></section>';
  if(N.length>H0)m+='<h3 class="sh12">'+esc(H0?tt('then'):tt('needsH'))+'</h3><ol class="rows12">'+N.slice(H0,H0+3).map(function(i,k){return row12(i,k+1+H0);}).join('')+'</ol>';
  var R=N.slice(H0+3);if(R.length)m+='<h3 class="sh12">'+esc(tt('else'))+' <span class="n12"><bdi>'+R.length+'</bdi></span></h3>'+groups12(R,H0+3);
  if(desk)return h+'<div class="next12 desk"><div class="c1">'+m+'</div><aside class="c2" aria-label="'+esc(tt('goals'))+'">'+goalsCard(true)+okCard(true)+statTiles(true)+'</aside></div>';
  return h+'<div class="next12">'+m+'</div>';}

/* ---------- Chat: J8 and the team ---------- */
function stLabel(s,x){return x&&!x.at?tt('sending'):s==='done'?tt('doneW'):s==='routed'?tt('withTeam'):tt('delivered');}
/* 11.0.1: a typing state only while a live answer is really on its way (brain on, at most 60 s); otherwise one quiet line */
function replyLines(){var n=0;J8.inbox.list(60).forEach(function(x){n+=teamLines(x).length;});return n;}
function chatLog(){var L=J8.inbox.list(40).slice().reverse(),h='',day='',brain=J8.control.brainEnabled(),now=Date.now();
  L.forEach(function(x,ix){var ms=pd(x.at),k=isNaN(ms)?'':ymd(new Date(ms));if(k&&k!==day){day=k;h+='<p class="day12"><span>'+esc(k===ymd(new Date())?tt('today'):dayStr(new Date(ms)))+'</span></p>';}
    var tg=msgTarget(Object.assign({id:x.id},x)),ab=tg.msg?'':targetTitle(tg).title,st=x.status||'new';
    h+='<div class="me12"><div class="bub12 mine">'+(ab?'<p class="ab12">'+I('link')+'<bdi dir="auto">'+esc(cut(ab,44))+'</bdi></p>':'')+'<p dir="auto">'+esc(x.text)+'</p><span class="tm12"><bdi>'+esc(tm1(x.at))+'</bdi> · '+esc(stLabel(st,x))+'</span></div></div>';
    teamLines(x).forEach(function(l,j){var v=sevOf(l.x)||sevLegacy(l.x),key=x.id+'#'+j,nw=UI.seenL&&!UI.seenL[key];if(UI.seenL)UI.seenL[key]=1;h+='<div class="j812'+(nw?' new12':'')+'"><span class="av12" aria-hidden="true">'+g8i()+'</span><div class="bub12'+(v?' lv-'+v:'')+'">'+(v?sevChip(v):'')+'<div dir="auto">'+md(sevStrip(l.x))+'</div>'+(l.t?'<span class="tm12"><bdi>'+esc(l.t)+'</bdi></span>':'')+'</div></div>';});
    if(ix===L.length-1&&st!=='done'){var bp=brain&&UI.brainPend&&UI.brainPend.id===x.id&&now-UI.brainPend.t<6e4&&teamLines(x).length<2;
      h+=bp?'<div class="j812 typing12" role="status"><span class="av12 wk13" aria-hidden="true">'+w8()+'</span><div class="bub12"><small>'+esc(tt('thinking'))+'</small></div></div>'
        :'<p class="wait12" role="status">'+I('time')+'<span>'+esc(st==='routed'?tt('withTeamL'):tt('replyHere'))+'</span></p>';}});
  if(!UI.seenL){UI.seenL={};L.forEach(function(x){teamLines(x).forEach(function(l,j){UI.seenL[x.id+'#'+j]=1;});});}
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
 if(!focus&&inputBusy()){UI.pendR=1;return;}
 [].forEach.call(m.querySelectorAll('textarea[id]'),function(x){TYPING[x.id]=x.value;});parkMe();parkJ8();
 if(focus)animate();
 var y=m.scrollTop,v=UI.v,md=$('mdd'),my=md?md.scrollTop:0;UI.chatStick=v==='chat'&&m.scrollHeight-m.scrollTop-m.clientHeight<80;
 m.innerHTML=v==='next'?vNext():v==='chat'?vChat():v==='inbox'?listWrap('drafts',vInbox()):v==='qitem'?vQitem():v==='projects'||v==='dept'?listWrap('proj',vProjects()):v==='proj'?projPlanTag(pobj(UI.proj))+vProj():v==='draft'?draftCheck()+vDraft10()
  :v==='flow'?flowWrap(UI.fseg==='time'||UI.fseg==='num'?'map':UI.fseg):v==='calendar'?flowWrap('time'):v==='money'?flowWrap('num'):v==='ltasks'?listD('tasks'):v==='me'?vMe():vNext();
 document.body.dataset.homej8='0';document.body.dataset.v=v;
 slotMe();if(v==='me'){meWords();renderPrefs();renderSeat();renderTheme();}lint(m);
 Object.keys(TYPING).forEach(function(id){var x=document.getElementById(id);if(x&&TYPING[id]&&!x.value)x.value=TYPING[id];});
 if(focus){m.scrollTop=0;m.classList.add('push');clearTimeout(render.pt);render.pt=setTimeout(function(){m.classList.remove('push');},260);var ph0=$('pageH');(ph0||m).focus({preventScroll:true});}else{if(Math.abs(m.scrollTop-y)>2)m.scrollTop=y;var md2=$('mdd');if(md2)md2.scrollTop=my;}
 try{var hs=hashOf();if(location.hash!==hs&&!/token/.test(location.hash))history.replaceState(null,'',location.pathname+location.search+hs);}catch(e){}
 if(UI.gsheet&&UI.gsheet.k==='thread'&&!$('gsheet').hidden){var g=$('gth');if(!g||document.activeElement!==g){threadSheet(UI.gsheet.tg);lint($('gsheet'));}}
 after12(v,focus);obMaybe();};
var rsT=null,rsW=innerWidth;window.addEventListener('resize',function(){if(innerWidth===rsW)return;rsW=innerWidth;clearTimeout(rsT);rsT=setTimeout(function(){render();},150);}); /* 11.0.1: a keyboard only changes the height: never re-render for it */
/* 11.0.1: never rebuild a screen while you are typing in it (empty or not); catch up right after you leave the field */
function inputBusy(){var a=document.activeElement,m=$('main');if(!a||!m||!/^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName)||/^(checkbox|radio|button|submit)$/.test(a.type||''))return false;return m.contains(a);}
busyMain=inputBusy;
document.addEventListener('focusout',function(){if(!UI.pendR)return;setTimeout(function(){if(UI.pendR&&!inputBusy()){UI.pendR=0;render();}},350);});
var BOOT12=Date.now();setTimeout(function(){if(!connected)render();},12100);

/* Done on "Do this first": the card checks off, then the next step slides up (and says when it was just unlocked) */
window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('#hero12 [data-a=done]');if(!el)return;var k=el.dataset.k,i=rowByKey(k);if(!i)return;
  e.preventDefault();e.stopPropagation();var N=myQueue(),nx=N.filter(function(x){return x.key!==k;})[0];UI.unl=(i.ul||[]).slice();UI.arriveK=nx?nx.key:null;UI.justDone=1;
  var go=function(){animate();markDone(k);setTimeout(function(){if(UI.arriveK)UI.arriveK=null;},1500);};
  if(RM()){go();return;}var h=$('hero12');if(h)h.classList.add('leave');setTimeout(go,440);},true);
/* Chat composer */
document.addEventListener('submit',function(e){var f=e.target;if(!f||f.id!=='chatF')return;e.preventDefault();var i=$('chatIn'),v=String(i&&i.value||'').trim();if(!v)return;
  if(!J8.status().connected){toast(t('notConn'));return;}i.value='';TYPING.chatIn='';var b=$('chatGo');if(b)b.disabled=true;
  var bpT=Date.now();J8.inbox.send('p-general',v).then(function(id){if(J8.control.brainEnabled()){UI.brainPend={id:id,t:bpT};setTimeout(render,61e3);}if($('chatGo'))$('chatGo').disabled=false;i.blur();UI.chatStick=true;render();var m=$('main');m.scrollTop=m.scrollHeight;},function(er){if($('chatGo'))$('chatGo').disabled=false;toast(t('couldNot',{e:er&&er.code||'error'}));});},true);
document.addEventListener('keydown',function(e){var x=e.target;if(x&&x.id==='chatIn'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&isDesk()){e.preventDefault();var f=$('chatF');if(f.requestSubmit)f.requestSubmit();}});
document.addEventListener('input',function(e){var x=e.target;if(x&&x.tagName==='TEXTAREA'&&x.closest('.cb12,.comp12')){x.style.height='auto';x.style.height=Math.min(160,x.scrollHeight+2)+'px';}});

/* pull to refresh (phones): drag down at the top of a screen, let go past the line */
(function(){var y0=null,dy=0,el=null,busy=false;function bar(){if(!el){el=document.createElement('div');el.id='ptr12';el.setAttribute('aria-hidden','true');el.innerHTML='<span>'+I('refresh')+'</span>';document.body.appendChild(el);}return el;}
 document.addEventListener('touchstart',function(e){var m=$('main');if(busy||!m||isDesk()||!m.contains(e.target)||m.scrollTop>0||e.touches.length!==1||e.target.closest('textarea,input,select'))return;y0=e.touches[0].clientY;dy=0;},{passive:true});
 document.addEventListener('touchmove',function(e){if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy<=0){bar().style.setProperty('--p',0);return;}var b=bar();b.classList.add('on');b.style.setProperty('--p',Math.min(1,dy/90).toFixed(3));b.classList.toggle('ready',dy>90);},{passive:true});
 document.addEventListener('touchend',function(){if(y0==null)return;y0=null;var b=bar();if(dy>90&&!busy){busy=true;b.classList.add('spin');b.innerHTML='<span>'+w8()+'</span>';toast(tt('refreshing'));
   Promise.race([J8.reload(),new Promise(function(_,rj){setTimeout(function(){rj('timeout');},1e4);})]).then(function(){toast(tt('upToDate'));},function(){toast(t('notConn'));}).then(function(){busy=false;b.classList.remove('on','spin','ready');b.innerHTML='<span>'+I('refresh')+'</span>';});}else b.classList.remove('on','ready');dy=0;},{passive:true});})();

/* ---------- 11.1.0 onboarding: a J8 interview (scripted, branching; not live AI) that sets up your plan ---------- */
Object.assign(L11.en,{tour:'Re-plan with J8',
  iq_purpose:'Hi, I’m J8. What do you want J8NIX to run for you? Pick all that fit.',iq_who:'Got it. What is your role, and where is the business today?',
  iq_sales:'Sales: what do you sell, what is your monthly target, and where do you sell?',iq_raise:'Raising money: which round, how much, and by when?',iq_launch:'Launch: what are you launching, and when?',
  iq_mkt:'Marketing: which channels, and how often do you want to post?',iq_team:'Team: how big is it, and what are the main projects?',iq_personal:'Work goals: what area do you want to move?',iq_other:'Tell me in one line what you want J8NIX to run.',
  iq_goals:'Now your goals: 1 to 3, each with a number and a deadline. I plan toward these.',iq_time:'How much time a day do you give J8NIX, and when should I check in?',iq_rules:'Last one: what may I do without asking you, and what always needs your OK?',
  p_sales:'Get clients and sales',p_launch:'Launch a product',p_raise:'Raise money',p_mkt:'Grow marketing and content',p_team:'Run a team and projects',p_personal:'Hit personal work goals',p_other:'Other',
  r_other:'Other',st_idea:'Idea',st_build:'Building',st_live:'Launched',st_rev:'Making money',st_scale:'Scaling',roleH:'Role',stageH:'Stage',
  f_what:'What you sell',f_target:'Monthly target (your words, e.g. 10 clients)',f_chan:'Channels',f_round:'Round',f_amount:'Target amount',f_date:'Target date',f_product:'Product',f_ldate:'Launch date',f_cad:'Cadence',f_size:'Team size',f_projects:'Main projects',f_area:'Area',f_otherW:'What should it run?',
  ch_email:'Email',ch_li:'LinkedIn',ch_ig:'Instagram',ch_calls:'Calls',ch_ads:'Ads',ch_ref:'Referrals',cad_d:'Daily',cad_3:'3 a week',cad_w:'Weekly',rd_pre:'Pre-seed',rd_seed:'Seed',rd_a:'Series A',rd_other:'Other',
  sz_1:'1–3',sz_2:'4–10',sz_3:'11+',own:'Or type your own',gGoal:'Goal',gNum:'Number',gDate:'Deadline',gFor:'For',
  capH:'Time a day',amH:'Morning brief',pmH:'Evening review',off:'Off',autoH:'J8 may, without asking',askH:'Always needs my OK',
  a_research:'Research and lists',a_drafts:'Write drafts (they still wait for you)',a_remind:'Remind me',a_follow:'Follow-ups from templates you approved',
  k_send:'Anything sent to a person',k_price:'Prices and quotes',k_posts:'Public posts',k_spend:'Spending money',
  asForm:'Show as a form',asChat:'Show as a chat',build:'Set up my plan',building:'Setting up your plan…',pickOne:'Pick at least one.',
  sumH:'Here’s what I set up for you',sumJ:'This is your plan, from your answers. Tap anything to change it.',yourPlan:'Your plan',sumProj:'Projects',sumSteps:'{n} steps',sumFirst:'Do this first',sumCheck:'Check-ins',sumRules:'Approval rules',
  noDated:'No dated goal yet',needAdmin:'Only an admin can add projects, so your steps are saved without one.',goNext:'Go to Next',editIt:'Edit',save:'Save',stepT:'Step',minsL:'Minutes',nameL:'Name',msL:'Goal',dateL:'Date',saved2:'Saved',
  whyPlan:'Step {n} of {m} toward: {g}',pn_sales:'Sales',pn_raise:'Raise',pn_launch:'Launch',pn_mkt:'Marketing',pn_team:'Team and projects',pn_personal:'My work goals',pn_other:'My plan',
  langH:'Language',back:'Back',none:'None',formH:'Set up your plan'});
Object.assign(L11.he,{tour:'לתכנן מחדש עם J8',
  iq_purpose:'היי, אני J8. מה תרצו ש־J8NIX ינהל בשבילכם? אפשר לבחור כמה.',iq_who:'הבנתי. מה התפקיד שלך, ואיפה העסק עומד היום?',
  iq_sales:'מכירות: מה אתם מוכרים, מה היעד החודשי, ואיפה מוכרים?',iq_raise:'גיוס: איזה סבב, כמה, ועד מתי?',iq_launch:'השקה: מה משיקים, ומתי?',
  iq_mkt:'שיווק: באילו ערוצים, וכמה פעמים לפרסם?',iq_team:'צוות: כמה אנשים, ומה הפרויקטים העיקריים?',iq_personal:'יעדי עבודה: איזה תחום רוצים לקדם?',iq_other:'ספרו לי בשורה אחת מה J8NIX צריך לנהל.',
  iq_goals:'עכשיו היעדים: 1 עד 3, לכל אחד מספר ותאריך. אני מתכנן לקראתם.',iq_time:'כמה זמן ביום תתנו ל־J8NIX, ומתי לבדוק איתכם?',iq_rules:'אחרון: מה מותר לי בלי לשאול, ומה תמיד צריך את האישור שלך?',
  p_sales:'להביא לקוחות ומכירות',p_launch:'להשיק מוצר',p_raise:'לגייס כסף',p_mkt:'לגדל שיווק ותוכן',p_team:'לנהל צוות ופרויקטים',p_personal:'יעדי עבודה אישיים',p_other:'אחר',
  r_other:'אחר',st_idea:'רעיון',st_build:'בבנייה',st_live:'הושק',st_rev:'מכניס כסף',st_scale:'בצמיחה',roleH:'תפקיד',stageH:'שלב',
  f_what:'מה מוכרים',f_target:'יעד חודשי (במילים שלך, למשל 10 לקוחות)',f_chan:'ערוצים',f_round:'סבב',f_amount:'סכום יעד',f_date:'תאריך יעד',f_product:'מוצר',f_ldate:'תאריך השקה',f_cad:'תדירות',f_size:'גודל צוות',f_projects:'פרויקטים עיקריים',f_area:'תחום',f_otherW:'מה לנהל?',
  ch_email:'מייל',ch_li:'לינקדאין',ch_ig:'אינסטגרם',ch_calls:'שיחות',ch_ads:'מודעות',ch_ref:'המלצות',cad_d:'כל יום',cad_3:'3 בשבוע',cad_w:'פעם בשבוע',rd_pre:'פרי־סיד',rd_seed:'סיד',rd_a:'סבב A',rd_other:'אחר',
  sz_1:'1–3',sz_2:'4–10',sz_3:'11+',own:'או לכתוב בעצמך',gGoal:'יעד',gNum:'מספר',gDate:'תאריך יעד',gFor:'עבור',
  capH:'זמן ביום',amH:'סיכום בוקר',pmH:'סיכום ערב',off:'כבוי',autoH:'J8 רשאי, בלי לשאול',askH:'תמיד צריך את האישור שלי',
  a_research:'מחקר ורשימות',a_drafts:'לכתוב טיוטות (הן עדיין מחכות לך)',a_remind:'להזכיר לי',a_follow:'פולואפים מתבניות שאישרת',
  k_send:'כל דבר שנשלח לאדם',k_price:'מחירים והצעות',k_posts:'פוסטים פומביים',k_spend:'הוצאת כסף',
  asForm:'להציג כטופס',asChat:'להציג כצ׳אט',build:'להכין את התוכנית',building:'מכין את התוכנית…',pickOne:'צריך לבחור לפחות אחד.',
  sumH:'זה מה שהכנתי בשבילך',sumJ:'זו התוכנית שלך, מהתשובות שלך. אפשר לשנות כל דבר.',yourPlan:'התוכנית שלך',sumProj:'פרויקטים',sumSteps:'{n} צעדים',sumFirst:'קודם כל זה',sumCheck:'בדיקות',sumRules:'כללי אישור',
  noDated:'עוד אין יעד עם תאריך',needAdmin:'רק מנהל יכול להוסיף פרויקטים, אז הצעדים נשמרו בלי פרויקט.',goNext:'למסך הבא',editIt:'לערוך',save:'לשמור',stepT:'צעד',minsL:'דקות',nameL:'שם',msL:'יעד',dateL:'תאריך',saved2:'נשמר',
  whyPlan:'צעד {n} מתוך {m} לקראת: {g}',pn_sales:'מכירות',pn_raise:'גיוס',pn_launch:'השקה',pn_mkt:'שיווק',pn_team:'צוות ופרויקטים',pn_personal:'יעדי העבודה שלי',pn_other:'התוכנית שלי',
  langH:'שפה',back:'חזרה',none:'אין',formH:'להכין את התוכנית שלך'});
/* starter steps per purpose: [title EN, title HE, minutes]; each step waits on the one before it (unlock order) */
var TPL={sales:[['Write your one-line offer','לכתוב את ההצעה בשורה אחת',20],['List 20 ideal buyers','לרשום 20 קונים מתאימים',45],['Write the first outreach message','לכתוב את הודעת הפנייה הראשונה',20],['Send to the first 10 (after your OK)','לשלוח ל־10 הראשונים (אחרי האישור שלך)',30],['Book 3 calls','לקבוע 3 שיחות',30],['Send the first proposal','לשלוח את ההצעה הראשונה',45]],
 raise:[['Draft the pitch deck','לכתוב את מצגת המשקיעים',120],['Build the investor list (30 names)','לבנות רשימת משקיעים (30 שמות)',60],['Ask for 5 warm intros','לבקש 5 היכרויות חמות',30],['Hold the first 5 meetings','לקיים את 5 הפגישות הראשונות',60],['Follow up and collect feedback','לעשות פולואפ ולאסוף משוב',30],['Get to a term sheet','להגיע ל־term sheet',60]],
 launch:[['Lock the launch scope','לנעול את היקף ההשקה',30],['Fix the top 3 blockers','לתקן את 3 החוסמים העיקריים',90],['Recruit 10 testers','לגייס 10 בודקים',45],['Write the launch page','לכתוב את דף ההשקה',60],['Pick the launch day and channels','לבחור יום השקה וערוצים',20],['Launch and collect first feedback','להשיק ולאסוף משוב ראשון',60]],
 mkt:[['Pick 2 channels and a cadence','לבחור 2 ערוצים ותדירות',20],['Write 5 post ideas','לכתוב 5 רעיונות לפוסטים',30],['Make the first 3 posts','להכין את 3 הפוסטים הראשונים',90],['Schedule the next 2 weeks','לתזמן את השבועיים הקרובים',30],['Review what worked','לבדוק מה עבד',20]],
 team:[['List every project and its owner','לרשום כל פרויקט ומי אחראי',30],['Set one next step per project','לקבוע צעד הבא לכל פרויקט',30],['Set a weekly check-in','לקבוע בדיקה שבועית',15],['Clear the blocked items','לשחרר את מה שתקוע',30]],
 personal:[['Write the goal in one line','לכתוב את היעד בשורה אחת',10],['Break it into 3 milestones','לפרק ל־3 אבני דרך',20],['Block time in your week','לשריין זמן בשבוע',15],['Do the first step','לעשות את הצעד הראשון',30]],
 other:[['Describe the outcome you want','לתאר את התוצאה שרוצים',10],['List the first 3 steps','לרשום את 3 הצעדים הראשונים',20],['Do the first step','לעשות את הצעד הראשון',30]]};
var PURP=['sales','launch','raise','mkt','team','personal','other'];
var OB={on:false,i:0,form:false,seen:false,stage:'ask',A:null,made:null,typing:0};
function obDone(){if(ls('j8-ob'))return true;try{return !!(J8.prefs.get()||{}).onboarded;}catch(e){return false;}}
function obMaybe(){if(OB.on||OB.seen||!connected||obDone())return;OB.seen=true;obOpen(0);}
function A0(){var o={};try{o=J8.prefs.get()||{};}catch(e){}var a=o.interview&&typeof o.interview==='object'?o.interview:o.plan&&typeof o.plan==='object'&&Array.isArray(o.plan.purposes)?o.plan:{}; /* 11.2: interview answers live in prefs.interview (prefs.plan is Plan my day) */
  return {purposes:Array.isArray(a.purposes)?a.purposes.slice():[],purposeOther:a.purposeOther||'',role:o.role||a.role||'',roleOther:a.roleOther||'',stage:a.stage||'',f:JSON.parse(JSON.stringify(a.f||{})),
    goals:[{t:'',n:'',at:'',p:''}],cap:capMin()||60,checkin:Object.assign({am:'08:30',pm:''},a.checkin||o.checkin||{}),rules:Object.assign({auto:['research','drafts','remind'],ask:['send','price','posts','spend']},a.rules||o.rules||{})};}
function qs(){var A=OB.A,L=['purpose','who'];A.purposes.slice(0,3).forEach(function(p){L.push('f-'+p);});return L.concat(['goals','time','rules']);}
function F(p){return OB.A.f[p]=OB.A.f[p]||{};}
function getP(path){var o=OB.A;path.split('.').forEach(function(k){o=o==null?undefined:o[k];});return o;}
function setP(path,v){var ks=path.split('.'),o=OB.A;ks.slice(0,-1).forEach(function(k){if(o[k]==null||typeof o[k]!=='object')o[k]={};o=o[k];});o[ks[ks.length-1]]=v;}
function chips(path,opts,multi,lab){var cur=getP(path);return '<div class="chq12" role="group"'+(lab?' aria-label="'+esc(lab)+'"':'')+'>'+opts.map(function(o){var on=multi?(cur||[]).indexOf(o[0])>-1:cur===o[0];
  return '<button type="button" class="chp12" data-a="v11-ob" data-id="c|'+path+'|'+o[0]+'|'+(multi?1:0)+'" aria-pressed="'+on+'">'+(o[2]?I(o[2]):'')+'<span>'+esc(o[1])+'</span></button>';}).join('')+'</div>';}
function fin(path,lab,type,ph){var id='ob-'+path.replace(/\W/g,'-'),v=getP(path)||'';return '<label class="fl12" for="'+id+'"><span>'+esc(lab)+'</span><input id="'+id+'" data-ob="'+path+'" type="'+(type||'text')+'" dir="'+(type==='date'?'ltr':'auto')+'"'+(type==='date'?' min="'+ymd(new Date())+'"':' maxlength="140"')+' value="'+esc(v)+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></label>';}
function opts(pfx,keys){return keys.map(function(k){return [k,tt(pfx+k)];});}
function goalSeed(){var A=OB.A,G=A.goals.filter(function(g){return g.t||g.n||g.at;});if(G.length)return;var S=[];
  A.purposes.forEach(function(p){var f=A.f[p]||{};if(p==='raise'&&(f.amount||f.date))S.push({t:tt('pn_raise')+(f.round&&f.round!=='other'?' · '+tt('rd_'+f.round):''),n:f.amount||'',at:f.date||'',p:p});
    else if(p==='launch'&&(f.product||f.date))S.push({t:tt('pn_launch')+(f.product?': '+f.product:''),n:'',at:f.date||'',p:p});
    else if(p==='sales'&&f.target)S.push({t:tt('pn_sales')+(f.what?': '+f.what:''),n:f.target,at:'',p:p});});
  if(S.length)A.goals=S.slice(0,3);}
function field(q){var A=OB.A;
  if(q==='purpose')return chips('purposes',PURP.map(function(p){return [p,tt('p_'+p),{sales:'money',launch:'rocket',raise:'up',mkt:'megaphone',team:'team',personal:'target',other:'plus'}[p]];}),true)+(A.purposes.indexOf('other')>-1?fin('purposeOther',tt('own'),'text'):'');
  if(q==='who')return '<p class="ql12">'+esc(tt('roleH'))+'</p>'+chips('role',[['founder',tt('r_founder'),'rocket'],['pm',tt('r_pm'),'board'],['mkt',tt('r_mkt'),'megaphone'],['solo',tt('r_solo'),'wrench'],['other',tt('r_other'),'plus']],false,tt('roleH'))+(A.role==='other'?fin('roleOther',tt('own'),'text'):'')
    +'<p class="ql12">'+esc(tt('stageH'))+'</p>'+chips('stage',opts('st_',['idea','build','live','rev','scale']),false,tt('stageH'));
  var m=q.match(/^f-(\w+)$/);if(m){var p=m[1],b='f.'+p+'.';F(p);
    if(p==='sales')return fin(b+'what',tt('f_what'))+fin(b+'target',tt('f_target'))+'<p class="ql12">'+esc(tt('f_chan'))+'</p>'+chips(b+'channels',opts('ch_',['email','li','ig','calls','ads','ref']),true,tt('f_chan'))+fin(b+'chanOther',tt('own'));
    if(p==='raise')return '<p class="ql12">'+esc(tt('f_round'))+'</p>'+chips(b+'round',opts('rd_',['pre','seed','a','other']),false,tt('f_round'))+fin(b+'amount',tt('f_amount'))+fin(b+'date',tt('f_date'),'date');
    if(p==='launch')return fin(b+'product',tt('f_product'))+fin(b+'date',tt('f_ldate'),'date');
    if(p==='mkt')return '<p class="ql12">'+esc(tt('f_chan'))+'</p>'+chips(b+'channels',opts('ch_',['li','ig','email','ads','ref']),true,tt('f_chan'))+fin(b+'chanOther',tt('own'))+'<p class="ql12">'+esc(tt('f_cad'))+'</p>'+chips(b+'cadence',opts('cad_',['d','3','w']),false,tt('f_cad'));
    if(p==='team')return '<p class="ql12">'+esc(tt('f_size'))+'</p>'+chips(b+'size',opts('sz_',['1','2','3']),false,tt('f_size'))+fin(b+'projects',tt('f_projects'));
    if(p==='personal')return fin(b+'area',tt('f_area'));
    return fin(b+'what',tt('f_otherW'));}
  if(q==='goals'){goalSeed();return '<div class="gin12">'+A.goals.map(function(g,k){return '<div class="gi12 g3"><span class="gk">'+esc(tt('gT',{n:k+1}))+'</span>'+fin('goals.'+k+'.t',tt('gGoal'),'text',tt('gPh'))+fin('goals.'+k+'.n',tt('gNum'))+fin('goals.'+k+'.at',tt('gDate'),'date')
      +(A.purposes.length>1?'<label class="fl12" for="ob-gp-'+k+'"><span>'+esc(tt('gFor'))+'</span><select id="ob-gp-'+k+'" data-ob="goals.'+k+'.p">'+A.purposes.map(function(p){return '<option value="'+p+'"'+(g.p===p?' selected':'')+'>'+esc(tt('p_'+p))+'</option>';}).join('')+'</select></label>':'')+'</div>';}).join('')
    +(A.goals.length<3?'<button type="button" class="lnk12" data-a="v11-ob" data-id="addg">'+I('plus')+'<span>'+esc(tt('addG'))+'</span></button>':'')+'</div>';}
  if(q==='time')return '<p class="ql12">'+esc(tt('capH'))+'</p>'+chips('cap',[[30,'30 '+tt('minsL').toLowerCase().slice(0,3)],[60,tt('hrs',{n:1})],[120,tt('hrs',{n:2})],[180,tt('hrs',{n:3})]].map(function(x){return [String(x[0]),x[1]];}),false,tt('capH'))
    +'<p class="ql12">'+esc(tt('amH'))+'</p>'+chips('checkin.am',[['',tt('off')],['07:30','07:30'],['08:30','08:30'],['09:30','09:30']],false,tt('amH'))
    +'<p class="ql12">'+esc(tt('pmH'))+'</p>'+chips('checkin.pm',[['',tt('off')],['17:30','17:30'],['18:30','18:30'],['21:00','21:00']],false,tt('pmH'));
  if(q==='rules')return '<p class="ql12">'+esc(tt('autoH'))+'</p>'+chips('rules.auto',opts('a_',['research','drafts','remind','follow']),true,tt('autoH'))+'<p class="ql12">'+esc(tt('askH'))+'</p>'+chips('rules.ask',opts('k_',['send','price','posts','spend']),true,tt('askH'));
  return '';}
function ansText(q){var A=OB.A,j=function(L){return L.filter(Boolean).join(' · ');};
  if(q==='purpose')return j(A.purposes.map(function(p){return p==='other'&&A.purposeOther?A.purposeOther:tt('p_'+p);}));
  if(q==='who')return j([A.role==='other'?A.roleOther:A.role?tt('r_'+A.role):'',A.stage?tt('st_'+A.stage):'']);
  var m=q.match(/^f-(\w+)$/);if(m){var f=A.f[m[1]]||{};return j([f.what,f.target,f.product,f.area,f.projects,f.round?tt('rd_'+f.round):'',f.amount,f.date,f.size?tt('sz_'+f.size):'',f.cadence?tt('cad_'+f.cadence):'',(f.channels||[]).map(function(c){return tt('ch_'+c);}).join(', '),f.chanOther])||tt('none');}
  if(q==='goals')return j(A.goals.filter(function(g){return g.t;}).map(function(g){return g.t+(g.n?' ('+g.n+')':'')+(g.at?' · '+dayShort(new Date(g.at+'T12:00:00')):'');}))||tt('none');
  if(q==='time')return j([tt('hrs',{n:+A.cap/60}),A.checkin.am?tt('amH')+' '+A.checkin.am:'',A.checkin.pm?tt('pmH')+' '+A.checkin.pm:'']);
  if(q==='rules')return j([A.rules.auto.length+' ✓',A.rules.ask.length+' ✋']);return '';}
function obCollect(){var el=$('ob11');if(!el||!OB.A)return;[].forEach.call(el.querySelectorAll('[data-ob]'),function(x){setP(x.dataset.ob,x.value.trim());});if(typeof OB.A.cap==='string')OB.A.cap=+OB.A.cap||60;}
function obOpen(s){OB.on=true;OB.A=A0();OB.made=null;OB.stage='ask';OB.form=false;var L=qs();OB.i=Math.max(0,Math.min(L.length-1,+s||0));var el=$('ob11');if(!el){el=document.createElement('div');el.id='ob11';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','obH');document.body.appendChild(el);}el.hidden=false;OB.typing=Date.now();obRender();}
function obClose(){OB.on=false;var el=$('ob11');if(el)el.hidden=true;ls('j8-ob',1);try{if(J8.prefs&&J8.status().connected)J8.prefs.set({onboarded:new Date().toISOString()}).catch(function(){});}catch(e){}}
function j8say(txt,id){return '<div class="say11"'+(id?' id="'+id+'"':'')+'><span class="j8av11"><img src="brand/j8nix-mark-8-2026-11-17.svg" alt="" width="12" height="26"></span><p dir="auto">'+esc(txt)+'</p></div>';}
function mesay(txt){return '<div class="me12"><div class="bub12 mine"><p dir="auto">'+esc(txt)+'</p></div></div>';}
function obHead(){return '<div class="obtop12"><span class="j8av11 sm"><img src="brand/j8nix-mark-8-2026-11-17.svg" alt="" width="10" height="22"></span><b>J8</b><span class="sp"></span>'
  +(OB.stage==='ask'?'<button type="button" class="obsw" data-a="v11-ob" data-id="mode" aria-pressed="'+OB.form+'">'+I(OB.form?'chat':'steps')+'<span>'+esc(OB.form?tt('asChat'):tt('asForm'))+'</span></button>':'')
  +'<button type="button" class="obsw" data-a="v11-ob" data-id="'+(LANG==='he'?'lang-en':'lang-he')+'" lang="'+(LANG==='he'?'en':'he')+'">'+(LANG==='he'?'English':'עברית')+'</button><button type="button" class="obx" data-a="v11-ob" data-id="end" aria-label="'+esc(tt('k_esc'))+'">'+I('x')+'</button></div>';}
function obRender(){var el=$('ob11');if(!el)return;var L=qs(),h='';
  if(OB.stage==='sum'){h=obHead()+'<div class="obb wide">'+obSummary()+'</div>';}
  else if(OB.stage==='busy'){h=obHead()+'<div class="obb wide"><div class="j812 typing12" role="status"><span class="av12 wk13" aria-hidden="true">'+w8()+'</span><div class="bub12"><small>'+esc(tt('building'))+'</small></div></div></div>';}
  else if(OB.form){h=obHead()+'<form class="obb wide obform12" id="obF" novalidate><h2 id="obH">'+esc(tt('formH'))+'</h2>'+L.map(function(q,k){return '<fieldset class="fs12"><legend dir="auto"><span class="qn">'+(k+1)+'</span>'+esc(tt('iq_'+q.replace(/^f-/,'')))+'</legend>'+field(q)+'</fieldset>';}).join('')
    +'<p class="err12" role="alert">'+(OB.err?esc(OB.err):'')+'</p><div class="obnav"><button type="button" class="btn11 pri grow" data-a="v11-ob" data-id="build">'+I('check')+'<span>'+esc(tt('build'))+'</span></button></div></form>';}
  else{var q=L[OB.i],hist='';for(var k=0;k<OB.i;k++)hist+=j8say(tt('iq_'+L[k].replace(/^f-/,'')))+mesay(ansText(L[k]));
    var fresh=!RM()&&Date.now()-OB.typing<700;
    h=obHead()+'<div class="obb wide obchat12"><div class="dots11" aria-hidden="true">'+L.map(function(x,k){return '<i class="'+(k===OB.i?'on':k<OB.i?'done':'')+'"></i>';}).join('')+'</div>'+hist
     +(fresh?'<div class="j812 typing12 tmp"><span class="av12 wk13" aria-hidden="true">'+w8()+'</span><div class="bub12"><small>'+esc(tt('thinking'))+'</small></div></div>':'')
     +'<div class="qnow12'+(fresh?' wait':'')+'"><h2 id="obH" class="sr">'+esc(tt('iq_'+q.replace(/^f-/,'')))+'</h2>'+j8say(tt('iq_'+q.replace(/^f-/,'')))+'<div class="ans12">'+field(q)+'</div><p class="err12" role="alert">'+(OB.err?esc(OB.err):'')+'</p>'
     +'<div class="obnav">'+(OB.i?'<button type="button" class="btn11 icon" data-a="v11-ob" data-id="back" aria-label="'+esc(tt('back'))+'">'+I('back','flip')+'</button>':'')+'<button type="button" class="btn11 pri grow" data-a="v11-ob" data-id="'+(OB.i<L.length-1?'next':'build')+'"><span>'+esc(OB.i<L.length-1?tt('obNext'):tt('build'))+'</span>'+I('do','flip')+'</button></div></div></div>';
    if(fresh){clearTimeout(obRender.t);obRender.t=setTimeout(function(){OB.typing=0;var t=el.querySelector('.typing12.tmp'),w=el.querySelector('.qnow12.wait');if(t)t.remove();if(w)w.classList.remove('wait');},650);}}
  el.className='ob11 ob12 '+(OB.stage==='sum'?'sum':'q'+OB.i);el.innerHTML=h;
  var c=el.querySelector('.obchat12');if(c)el.scrollTop=el.scrollHeight;var f=el.querySelector('#obH');if(f){f.setAttribute('tabindex','-1');f.focus({preventScroll:true});}}
function obValid(q){OB.err='';if(q==='purpose'&&!OB.A.purposes.length){OB.err=tt('pickOne');return false;}return true;}
function goalTxt(g){return g.t+(g.n?' · '+g.n:'');}
function pName(pu){var A=OB.A,f=A.f[pu]||{};return pu==='sales'?tt('pn_sales')+(f.what?': '+f.what:''):pu==='raise'?tt('pn_raise')+(f.round&&f.round!=='other'?' · '+tt('rd_'+f.round):''):pu==='launch'?tt('pn_launch')+(f.product?': '+f.product:''):pu==='other'?(A.purposeOther||tt('pn_other')):tt('pn_'+pu);}
function nowTxt(pu){var t=ansText('f-'+pu);return tt('yourPlan')+(t&&t!==tt('none')?': '+t:'');}
function rawTasks(){var R=J8.raw('tasks')||{};return Object.keys(R).map(function(id){return Object.assign({id:id},R[id]);});}
function planBuild(){var A=OB.A,adm=J8.orgs.can('admin'),st=Date.now().toString(36),td=ymd(new Date()),P=[],E=[],T=[],fail=0;
  var gen=PR['p-general']?'p-general':null;
  A.purposes.forEach(function(pu){var ex=liveP().filter(function(p){return px(p,'plan')&&px(p,'purpose')===pu;})[0],goal=A.goals.filter(function(g){return g.t&&/^\d{4}-\d\d-\d\d$/.test(g.at||'')&&(g.p||A.purposes[0])===pu;})[0];
    var pid=ex?ex.id:adm?'p-plan-'+pu+'-'+st:gen;
    if(!ex&&adm)P.push({id:pid,doc:{name:pName(pu),unit_id:null,stage:1,status:'active',now:nowTxt(pu),order:60,milestone:goal?goalTxt(goal):null,milestone_at:goal?goal.at:null,milestone_by:goal?'dave':null,milestone_src:goal?'Your plan · J8NIX '+td:null,extra:{plan:true,purpose:pu,answers:A.f[pu]||{}}}});
    else if(ex&&goal&&!ex.milestone&&adm)E.push({id:ex.id,patch:{milestone:goalTxt(goal),milestone_at:goal.at}});
    var have={},prev=null;rawTasks().forEach(function(t){if(px(t,'plan')&&px(t,'purpose')===pu&&px(t,'tpl'))have[px(t,'tpl')]=t.id;});
    var S=TPL[pu]||TPL.other;S.forEach(function(s,k){var key=pu+'-'+k;if(have[key]){prev=have[key];return;}var id='t-plan-'+pu+'-'+(k+1)+'-'+st;
      T.push({id:id,doc:{project_id:pid,title:s[LANG==='he'?1:0],action:'',why:tt('whyPlan',{n:k+1,m:S.length,g:goal?goalTxt(goal):pName(pu)}),minutes:s[2],owner:'dave',status:'open',source:'j8nix-plan',by:'J8NIX plan (yours)',blocked_by:prev?[prev]:[],extra:{plan:true,purpose:pu,tpl:key}}});prev=id;});});
  var G=A.goals.filter(function(g){return g.t&&/^\d{4}-\d\d-\d\d$/.test(g.at||'');}).map(function(g){var pu=g.p||A.purposes[0],p=liveP().filter(function(x){return px(x,'plan')&&px(x,'purpose')===pu;})[0],np=P.filter(function(x){return x.doc.extra.purpose===pu;})[0];return {t:goalTxt(g),at:g.at,pid:(p&&p.id)||(np&&np.id)||null};});
  var oldG=myGoalList();G=G.concat(oldG.filter(function(o){return o&&o.t&&!G.some(function(g){return g.t===o.t;});})).slice(0,10); /* 11.2: re-plan keeps the goals you already have */
  var pf={role:A.role==='other'?(A.roleOther||'other'):A.role,goals:G,cap:+A.cap||60,checkin:A.checkin,rules:A.rules,planAt:new Date().toISOString(),onboarded:new Date().toISOString(),
    interview:{purposes:A.purposes,purposeOther:A.purposeOther,role:A.role,roleOther:A.roleOther,stage:A.stage,f:A.f,checkin:A.checkin,rules:A.rules}};
  ls('j8-cap',pf.cap);ls('j8-goals',G);ls('j8-ob',1);
  var w=function(fn){return function(x){return fn(x).catch(function(e){fail++;throw e;});};};
  return Promise.resolve(J8.prefs.set(pf)).catch(function(){fail++;})
   .then(function(){return seq(P,w(function(x){return J8.projects.add(x.id,x.doc);}));})
   .then(function(){return seq(E,w(function(x){return J8.projects.edit(x.id,x.patch);}));})
   .then(function(){return seq(T,w(function(x){return J8.tasks.add(x.id,x.doc);}));})
   .then(function(){return {P:P,T:T,adm:adm,fail:fail};});}
function obSummary(){var M=OB.made||{P:[],T:[]},A=OB.A,N=myQueue(),first=N[0],by={};
  M.T.forEach(function(x){var p=x.doc.extra.purpose;(by[p]=by[p]||[]).push(x);});
  var rows=A.purposes.map(function(pu,k){var p=liveP().filter(function(x){return px(x,'plan')&&px(x,'purpose')===pu;})[0],L=by[pu]||[];
    return '<li class="sm12" style="--i:'+k+'"><span class="well11 r royal">'+I({sales:'money',launch:'rocket',raise:'up',mkt:'megaphone',team:'team',personal:'target',other:'plus'}[pu])+'</span><span class="rt12"><b dir="auto">'+esc(p?p.name:pName(pu))+'</b><small dir="auto">'+esc(p&&p.milestone?p.milestone+' · '+dlabel(p.milestone_at):tt('noDated'))+'</small><small>'+esc(tt('sumSteps',{n:L.length}))+(L.length?': '+esc(L.slice(0,2).map(function(x){return x.doc.title;}).join(' → '))+(L.length>2?' →…':''):'')+'</small></span>'
     +(p&&J8.orgs.can('admin')?'<button type="button" class="ib12" data-a="x12-pedit" data-id="'+esc(p.id)+'" aria-label="'+esc(tt('editIt')+' '+p.name)+'">'+I('edit')+'</button>':'')+'</li>';}).join('');
  var R=A.rules,ck=[A.checkin.am?tt('amH')+' '+A.checkin.am:'',A.checkin.pm?tt('pmH')+' '+A.checkin.pm:''].filter(Boolean).join(' · ')||tt('off');
  return '<h2 id="obH" class="sumh12">'+esc(tt('sumH'))+'</h2>'+j8say(tt('sumJ'))+'<span class="chip12 new">'+I('check')+'<bdi>'+esc(tt('yourPlan'))+'</bdi></span>'
   +(M.adm===false?'<p class="sub11">'+esc(tt('needAdmin'))+'</p>':'')+(M.fail?'<p class="err12" role="alert">'+esc(tt('saveFail',{e:M.fail}))+'</p>':'')
   +'<h3 class="sh12">'+esc(tt('sumProj'))+'</h3><ul class="sum12">'+rows+'</ul>'
   +(first?'<h3 class="sh12">'+esc(tt('sumFirst'))+'</h3><div class="sm12 one" style="--i:'+(A.purposes.length+1)+'"><span class="well11 r nx">'+I('compass')+'</span><span class="rt12"><b dir="auto">'+esc(cap1(nextOf(first).what))+'</b><small>'+(first.ul.length?esc(tt('unlocks',{n:first.ul.length}))+' · ':'')+(isNum(first.mins)?esc(tt('min',{n:first.mins})):'')+'</small></span>'+(first.task&&first.task.source==='j8nix-plan'?'<button type="button" class="ib12" data-a="x12-tedit" data-id="'+esc(first.task.id)+'" aria-label="'+esc(tt('editIt'))+'">'+I('edit')+'</button>':'')+'</div>':'')
   +'<ul class="sum12 kv"><li class="sm12" style="--i:'+(A.purposes.length+2)+'"><span class="well11 r">'+I('alarm')+'</span><span class="rt12"><b>'+esc(tt('sumCheck'))+'</b><small>'+esc(ck)+' · '+esc(tt('hrs',{n:+A.cap/60}))+'</small></span></li>'
   +'<li class="sm12" style="--i:'+(A.purposes.length+3)+'"><span class="well11 r vi">'+I('shield')+'</span><span class="rt12"><b>'+esc(tt('sumRules'))+'</b><small>'+esc(tt('autoH'))+': '+esc(R.auto.map(function(x){return tt('a_'+x);}).join(', ')||tt('none'))+'</small><small>'+esc(tt('askH'))+': '+esc(R.ask.map(function(x){return tt('k_'+x);}).join(', ')||tt('none'))+'</small></span></li></ul>'
   +'<div class="obnav"><button type="button" class="btn11" data-a="v11-ob" data-id="push">'+I('now')+'<span>'+esc(tt('ob5a'))+'</span></button><button type="button" class="btn11 pri grow" data-a="v11-ob" data-id="go">'+I('compass')+'<span>'+esc(tt('goNext'))+'</span></button></div>';}
function obAct(id){obCollect();var L=qs();
  if(id==='next'){if(!obValid(L[OB.i])){obRender();return;}OB.i=Math.min(qs().length-1,OB.i+1);OB.typing=Date.now();obRender();}
  else if(id==='back'){OB.err='';OB.i=Math.max(0,OB.i-1);obRender();}
  else if(id==='mode'){OB.form=!OB.form;OB.err='';obRender();}
  else if(id==='addg'){if(OB.A.goals.length<3)OB.A.goals.push({t:'',n:'',at:'',p:OB.A.purposes[0]||''});obRender();var x=$('ob-goals-'+(OB.A.goals.length-1)+'-t');if(x)x.focus();}
  else if(id==='build'){if(!OB.A.purposes.length){OB.err=tt('pickOne');if(!OB.form)OB.i=0;obRender();return;}if(!J8.status().connected){toast(t('notConn'));return;}
    OB.A.goals.forEach(function(g){if(!g.p)g.p=OB.A.purposes[0];});OB.stage='busy';obRender();
    planBuild().then(function(m){OB.made=m;OB.stage='sum';animate();render();obRender();},function(){OB.stage='ask';toast(t('couldNot',{e:'error'}));obRender();});}
  else if(id==='go'||id==='end'){obClose();UI.stack=[];UI.focusK=null;navTo('next');}
  else if(id==='push'){var pb=$('pushBtn');if(pb)pb.click();}
  else if(id==='lang-en'||id==='lang-he'){setLang(id.slice(5));renderAll();obRender();}
  else if(id.indexOf('c|')===0){var z=id.split('|'),path=z[1],v=z[2],multi=z[3]==='1',cur=getP(path);
    if(multi){cur=Array.isArray(cur)?cur.slice():[];var k=cur.indexOf(v);if(k>-1)cur.splice(k,1);else cur.push(v);setP(path,cur);}else setP(path,path==='cap'?+v:(cur===v&&path!=='checkin.am'&&path!=='checkin.pm'?'':v));
    if(path==='purposes')OB.err='';var y=$('ob11').scrollTop;obRender();$('ob11').scrollTop=y;var b=document.querySelector('#ob11 [data-id="'+id.replace(/"/g,'')+'"]');if(b)b.focus({preventScroll:true});}}
/* edit your plan: a step (title, minutes) or a plan project (name, goal, date) */
function editSheet(kind,id){var o=kind==='t'?J8.tasks.get(id):pobj(id);if(!o)return;UI.gsheet={k:'edit12'};
  var f=kind==='t'?'<label class="fl12" for="e12a"><span>'+esc(tt('stepT'))+'</span><input id="e12a" dir="auto" maxlength="140" value="'+esc(o.title||'')+'"></label><label class="fl12" for="e12b"><span>'+esc(tt('minsL'))+'</span><input id="e12b" type="number" min="1" max="600" value="'+esc(o.minutes||'')+'"></label>'
   :'<label class="fl12" for="e12a"><span>'+esc(tt('nameL'))+'</span><input id="e12a" dir="auto" maxlength="80" value="'+esc(o.name||'')+'"></label><label class="fl12" for="e12b"><span>'+esc(tt('msL'))+'</span><input id="e12b" dir="auto" maxlength="140" value="'+esc(o.milestone||'')+'"></label><label class="fl12" for="e12c"><span>'+esc(tt('dateL'))+'</span><input id="e12c" type="date" dir="ltr" value="'+esc(dday(o.milestone_at||''))+'"></label>';
  gOpen('<h2 id="gTitle">'+esc(tt('editIt'))+' · <span class="chip12 new">'+esc(tt('yourPlan'))+'</span></h2><form id="ed12" data-kind="'+kind+'" data-id="'+esc(id)+'" class="ed12">'+f+'<div class="obnav"><button type="button" class="btn11" data-a="gclose">'+esc(t('close'))+'</button><button type="submit" class="btn11 pri grow">'+I('check')+'<span>'+esc(tt('save'))+'</span></button></div></form>');}
document.addEventListener('submit',function(e){var f=e.target;if(!f||f.id!=='ed12')return;e.preventDefault();var k=f.dataset.kind,id=f.dataset.id,a=$('e12a').value.trim(),b=$('e12b').value.trim(),c=$('e12c')?$('e12c').value:'';
  var p=k==='t'?J8.tasks.edit(id,{title:a,minutes:+b||null}):J8.projects.edit(id,{name:a,milestone:b||null,milestone_at:c||null});
  p.then(function(){gClose();toast(tt('saved2'));if(OB.on)obRender();render();},function(er){toast(t('couldNot',{e:er&&er.code||'error'}));});},true);
window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a=x12-tedit],[data-a=x12-pedit]');if(!el)return;e.preventDefault();e.stopPropagation();editSheet(el.dataset.a==='x12-tedit'?'t':'p',el.dataset.id);},true);

window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a^="v11-"],[data-a^="x12-"]');if(!el)return;e.preventDefault();e.stopPropagation();var a=el.dataset.a,id=el.dataset.id||'',k=el.dataset.k;
  if(a==='v11-pin'){goalPinToggle(id);if(OB.on)obRender();render();return;}
  if(a==='v11-ob')obAct(id);else if(a==='v11-tour'){closeSheet();obOpen(0);}
  else if(a==='x12-ob'){closeSheet();obOpen(+id||0);}
  else if(a==='x12-row'){openItem(k);} /* 11.2: a Next item opens right here (sheet), never in a filtered list */
  else if(a==='x12-lseg'){UI.lseg=id;UI.stack=[];navTo(id==='drafts'?'inbox':id==='tasks'?'ltasks':'projects');}
  else if(a==='x12-fseg'){UI.fseg=id;UI.stack=[];navTo(id==='time'?'calendar':id==='num'?'money':'flow');}
  else if(a==='x12-pmf'){UI.pmf=id;render();}},true);
document.addEventListener('keydown',function(e){if(OB.on&&e.key==='Escape'){obClose();render(true);}});
window.j8ob={open:obOpen,close:obClose,done:obDone};

/* =================== 11.0.0 desktop workspace (≥ 1024 px; Dave 16 Nov 17:53): left sidebar, multi-pane, J8 panel, keyboard first =================== */
var MQD=window.matchMedia?matchMedia('(min-width:1024px)'):null;
function D12(){return !!(MQD&&MQD.matches);}
Object.assign(L11.en,{tasks:'Tasks',queue:'Queue',selN:'Selected · #{n}',back1:'Back to the first step',approve:'Approve',edit:'Edit',kill:'Kill',comment:'Comment',
  nSel:'{n} selected',approveSel:'Approve {n}',clearSel:'Clear',selectD:'Select {x}',selSet:'Select the whole set',approvedN:'{n} approved. They go out on the team’s next run.',
  keys:'Keyboard shortcuts',openJ8:'J8 panel',collapse:'Collapse the sidebar',expand:'Expand the sidebar',pick:'Pick an item on the left.',noDrafts:'Nothing waits for your OK.',
  projCol:'Project',stageCol:'Stage',tlCol:'Next 6 weeks',whoCol:'Holds it',notes:'Notes on this',single:'Single drafts',acts:'Actions',search:'Search or ask',
  k_pal:'Search, jump or act',k_jk:'Move down / up the list',k_ent:'Open the selected item',k_a:'Approve the open draft',k_e:'Edit the open draft',k_x:'Kill the open draft',k_d:'Mark the step done',
  k_c:'Comment on it',k_j8:'Open or close J8',k_14:'Next · Chat · List · Flow',k_q:'Show this list',k_esc:'Close',looking:'Looking at: {x}'});
Object.assign(L11.he,{tasks:'משימות',queue:'בתור',selN:'נבחר · #{n}',back1:'חזרה לצעד הראשון',approve:'לאשר',edit:'לערוך',kill:'לבטל',comment:'הערה',
  nSel:'{n} נבחרו',approveSel:'לאשר {n}',clearSel:'ניקוי',selectD:'לבחור את {x}',selSet:'לבחור את כל הסט',approvedN:'{n} אושרו. הם יוצאים בריצה הבאה של הצוות.',
  keys:'קיצורי מקלדת',openJ8:'החלונית של J8',collapse:'לכווץ את הסרגל',expand:'להרחיב את הסרגל',pick:'בחרו פריט מימין.',noDrafts:'אין מה לאשר.',
  projCol:'פרויקט',stageCol:'שלב',tlCol:'6 השבועות הבאים',whoCol:'אצל מי',notes:'הערות על זה',single:'טיוטות בודדות',acts:'פעולות',search:'חיפוש או שאלה',
  k_pal:'חיפוש, מעבר או פעולה',k_jk:'למטה / למעלה ברשימה',k_ent:'לפתוח את הפריט',k_a:'לאשר את הטיוטה',k_e:'לערוך את הטיוטה',k_x:'לבטל את הטיוטה',k_d:'לסמן שהצעד בוצע',
  k_c:'להוסיף הערה',k_j8:'לפתוח או לסגור את J8',k_14:'הבא · צ׳אט · רשימה · זרימה',k_q:'להציג את הרשימה הזו',k_esc:'לסגור',looking:'מסתכל על: {x}'});
['en','he'].forEach(function(l){if(TX[l])TX[l].acts=L11[l].acts;});
PLACE.ltasks='list';TOPV.ltasks=1;UI.msel=UI.msel||{};
document.body.dataset.side=ls('j8-side')==='mini'?'mini':'full';

/* the side panel: places, goals with Pin, pinned projects, J8 toggle */
function sideRender(){var g=$('sideG');if(!g)return;var jt=$('j8T');if(jt)jt.setAttribute('aria-pressed',j8Open()?'true':'false');
  var sc=$('sideC');if(sc){var mini=document.body.dataset.side==='mini';sc.setAttribute('aria-expanded',mini?'false':'true');sc.setAttribute('aria-label',tt(mini?'expand':'collapse'));}
  var kl=$('kbarL');if(kl)kl.textContent=tt('search');var jl=$('j8TL');if(jl)jl.textContent=tt('openJ8');
  if(!connected){g.innerHTML='';return;}var S=goalsShown(),L=S.L;
  g.innerHTML='<p class="ph6">'+esc(tt('goals'))+'</p>'+(L.length?'<ul>'+L.map(function(x){var pin=pinned13(S,x.id);return '<li class="'+(pin?'pin':'')+'"><button class="sg" data-a="'+(x.pid?'proj':'nav')+'" data-id="'+esc(x.pid||(x.id==='money'?'money':'next'))+'" title="'+esc(x.t)+'"><span class="gr">'+ring(28,4,x.pct,null,x.col)+'</span><span class="lbl"><b dir="auto">'+esc(cut(x.t,36))+'</b><small class="'+(x.over?'od':'')+'"><bdi>'+esc(gDue(x))+'</bdi></small></span></button><button class="gpin" data-a="v11-pin" data-id="'+esc(x.id)+'" aria-pressed="'+pin+'" aria-label="'+esc(pin?tt('pinned'):tt('pin'))+'">'+I('pin')+'</button></li>';}).join('')+'</ul>'
   :'<button class="sg" data-a="x12-ob" data-id="1">'+I('target')+'<span class="lbl">'+esc(tt('setGoals'))+'</span></button>');}
var rn1=renderNav;renderNav=function(){rn1();sideRender();};

/* J8 panel: open or closed on any screen (not on Chat, which is J8 already) */
setJ8=function(on,focus){on=!!on&&D12();document.body.dataset.j8=on?'open':'closed';ls('j8-panel12',on?1:0);renderJ8();if(on&&focus){var i=$('j8cIn');if(i)i.focus();}};
(function(){var s=ls('j8-panel12');document.body.dataset.j8=D12()&&(s===1||(s==null&&innerWidth>=1600))?'open':'closed';})();
function ctxName(){var v=UI.v;if(v==='projects'&&UI.proj&&pobj(UI.proj))return pobj(UI.proj).name;if(v==='inbox'&&UI.dsel&&AP[UI.dsel])return apWho(Object.assign({id:UI.dsel},AP[UI.dsel]));return tt(curPlace());}
renderJ8=function(){var jt=$('j8T');if(jt)jt.setAttribute('aria-pressed',j8Open()?'true':'false');if(!j8Open()||!connected)return;
  var c=$('j8Cards'),lg=$('j8cLog'),R=movedLines();
  var L={j8H:'J8',j8TalkH:tt('chatSub')};Object.keys(L).forEach(function(id){var e=$(id);if(e)e.textContent=L[id];});var ci=$('j8cIn');if(ci){ci.placeholder=tt('msgP');ci.setAttribute('dir',TD());}var cl=$('j8CloseL');if(cl)cl.textContent=tt('k_esc')+' J8';var gl=$('j8cGoL');if(gl)gl.textContent=tt('send');var il=$('j8cInL');if(il)il.textContent=tt('msgP');
  if(c)c.innerHTML='<p class="ctx12">'+I('eye')+'<span dir="auto">'+esc(tt('looking',{x:cut(ctxName(),48)}))+'</span></p>'+(R.length?'<section class="brief12"><h3>'+g8i()+'<span>'+esc(tt('moved'))+'</span></h3><ul>'+R.slice(0,2).map(function(r){return '<li><span dir="auto">'+esc(cut(noUrl(sevStrip(r.summary)),90))+'</span><time><bdi>'+esc(tm1(r.ended||r.started))+'</bdi></time></li>';}).join('')+'</ul></section>':'');
  if(lg){var nb=lg.scrollHeight-lg.scrollTop-lg.clientHeight<60||!lg.dataset.n;lg.innerHTML='<div class="log12">'+chatLog()+'</div><p class="note12">'+esc(J8.control.brainEnabled()?tt('live'):tt('hour'))+'</p>';lg.dataset.n='1';lint(lg);if(nb)lg.scrollTop=lg.scrollHeight;}};

/* Next on desktop: the focus card with the whole queue beside it */
function qrow12(i,num,cur){var n=nextOf(i),k=esc(i.key),pid=rowPid(i),p=pobj(pid),g=doTarget(i),dn=(i.task||(i.p&&i.move))&&!g.href;
  return '<li class="lr12 qr12'+(cur?' sel':'')+'" data-kn="'+k+'"><button class="lm" data-a="x12-focus" data-k="'+k+'" data-kp aria-current="'+(cur?'true':'false')+'"><span class="num12"><bdi>'+num+'</bdi></span><span class="dot12 '+sevCls(i)+'" aria-hidden="true"></span><span class="rt12"><b dir="auto">'+esc(cap1(n.what))+'</b>'+(p&&pid!=='p-general'?'<small dir="auto">'+esc(p.name)+'</small>':'')+'</span>'
   +(i.ul.length?'<span class="chip12 unl sm">'+I('key')+'<bdi>'+i.ul.length+'</bdi><span class="sr"> '+esc(tt('unlocks',{n:i.ul.length}))+'</span></span>':'')+(isNum(i.mins)?'<span class="mn12"><bdi>'+esc(tt('min',{n:i.mins}))+'</bdi></span>':'')+'</button>'
   +'<span class="qa12" role="group" aria-label="'+esc(t('actions'))+'">'+(dn?'<button class="ib12 ok" data-a="done" data-k="'+k+'" aria-label="'+esc(tt('done'))+'" title="'+esc(tt('done'))+' (D)">'+I('check')+'</button>':'')+'<button class="ib12" data-a="later" data-k="'+k+'" aria-label="'+esc(tt('later'))+'" title="'+esc(tt('later'))+'">'+I('later')+'</button><button class="ib12" data-a="comment" data-k="'+k+'" aria-label="'+esc(tt('comment'))+'" title="'+esc(tt('comment'))+' (C)">'+I('comment')+'</button></span></li>';}
function vNextD(){var N=connected?myQueue():[],h=ph(tt('next'),connected?esc(N.length===1?tt('wait1'):N.length?tt('waitN',{n:N.length}):''):'','<div class="phx12"><button class="lnk12 icon" data-a="x12-keys" aria-label="'+esc(tt('keys'))+'"><kbd>?</kbd></button></div>');
  if(!connected)return h+'<div class="nd12">'+skel(1,true)+skel(6)+'</div>';
  var fi=N.filter(function(x){return x.key===UI.focusK;})[0]||N[0],ix=N.indexOf(fi);if(fi)UI.focusK=fi.key;
  var L='<div class="nf12">'+(fi?heroCard(fi,ix):'<section class="hero12 clear"><p>'+I('done')+'<span>'+esc(tt('clear'))+'</span></p></section>')+(ix>0?'<button class="lnk12" data-a="x12-focus" data-k="'+esc(N[0].key)+'">'+I('back','flip')+'<span>'+esc(tt('back1'))+'</span></button>':'')
   +'<div class="nfx12">'+okCard(true)+statTiles(true)+'</div></div>';
  var R=N.length?'<section class="pane12 q12" aria-labelledby="qH"><h3 class="ph3" id="qH">'+I('order')+'<span>'+esc(tt('queue'))+'</span><span class="n12"><bdi>'+N.length+'</bdi></span></h3><ol class="ll12">'+N.map(function(i,k){return qrow12(i,k+1,i===fi);}).join('')+'</ol></section>':'';
  return h+'<div class="nd12">'+L+R+'</div>';}

/* List on desktop: master list + detail pane (a project, a task or a draft opens beside the list) */
function prow12(p,sel){var ms=msOf(p),s=stageOf(p),w=projNeed(p.id).length;
  return '<li class="lr12'+(sel?' sel':'')+'" data-kn="'+esc(p.id)+'"><button class="lm" data-a="x12-psel" data-id="'+esc(p.id)+'" data-kp aria-current="'+(sel?'true':'false')+'">'+ptile(p.id,'sm')+'<span class="rt12"><b dir="auto">'+esc(p.name)+'</b><small dir="auto">'+(ms&&ms.at?esc(cut(ms.t,40))+' · '+esc(dlabel(ms.at)):esc(s?stgL(s):tt('noMs')))+'</small></span>'+segs6(s)+(w?'<span class="chip12 you sm"><bdi>'+w+'</bdi><span class="sr"> '+esc(tt('waitN',{n:w}))+'</span></span>':'')+'</button></li>';}
function trow12(i,num,sel){var n=nextOf(i),k=esc(i.key),pid=rowPid(i),p=pobj(pid);
  return '<li class="lr12'+(sel?' sel':'')+'" data-kn="'+k+'"><button class="lm" data-a="x12-tsel" data-k="'+k+'" data-kp aria-current="'+(sel?'true':'false')+'"><span class="num12"><bdi>'+num+'</bdi></span><span class="dot12 '+sevCls(i)+'" aria-hidden="true"></span><span class="rt12"><b dir="auto">'+esc(cap1(n.what))+'</b>'+(p&&pid!=='p-general'?'<small dir="auto">'+esc(p.name)+'</small>':'')+'</span>'+(i.ul.length?'<span class="chip12 unl sm">'+I('key')+'<bdi>'+i.ul.length+'</bdi></span>':'')+'</button>'
   +'<span class="qa12" role="group" aria-label="'+esc(t('actions'))+'">'+((i.task||(i.p&&i.move))?'<button class="ib12 ok" data-a="done" data-k="'+k+'" aria-label="'+esc(tt('done'))+'">'+I('check')+'</button>':'')+'<button class="ib12" data-a="later" data-k="'+k+'" aria-label="'+esc(tt('later'))+'">'+I('later')+'</button></span></li>';}
function dIcon(a){var s=String(a.channel||'')+' '+String(a.kind||'');return a.kind==='template'?'shield':/instagram|reel/i.test(s)?'insta':/linkedin/i.test(s)?'linkedin':/mail|email/i.test(s)?'mail':'send';}
function drow12(a,sel,on){var id=esc(a.id),tx=String(J8.approvals.textOf(a)||'').replace(/\s+/g,' ');
  return '<li class="lr12 dr12'+(sel?' sel':'')+(on?' on':'')+'" data-kn="'+id+'"><label class="ck12"><input type="checkbox" data-x12="ms" data-id="'+id+'"'+(on?' checked':'')+'><span class="sr">'+esc(tt('selectD',{x:apWho(a)}))+'</span></label><button class="lm" data-a="x12-dsel" data-id="'+id+'" data-kp aria-current="'+(sel?'true':'false')+'">'+I(dIcon(a))+'<span class="rt12"><b dir="auto">'+esc(apWho(a))+'</b><small dir="auto">'+esc(cut(tx,90))+'</small></span></button>'
   +'<span class="qa12" role="group" aria-label="'+esc(t('actions'))+'"><button class="ib12 ok" data-a="x12-dap" data-id="'+id+'" aria-label="'+esc(tt('approve'))+'" title="'+esc(tt('approve'))+' (A)">'+I('check')+'</button><button class="ib12" data-a="x12-ded" data-id="'+id+'" aria-label="'+esc(tt('edit'))+'" title="'+esc(tt('edit'))+' (E)">'+I('edit')+'</button><button class="ib12 kill" data-a="x12-dkl" data-id="'+id+'" aria-label="'+esc(tt('kill'))+'" title="'+esc(tt('kill'))+' (X)">'+I('kill')+'</button><button class="ib12" data-a="x12-dcm" data-id="'+id+'" aria-label="'+esc(tt('comment'))+'" title="'+esc(tt('comment'))+' (C)">'+I('comment')+'</button></span></li>';}
function msgHTML(x){var h='<div class="me12"><div class="bub12 mine"><p dir="auto">'+esc(x.text)+'</p><span class="tm12"><bdi>'+esc(tm1(x.at))+'</bdi> · '+esc(stLabel(x.status||'new'))+'</span></div></div>';
  teamLines(x).forEach(function(l){var v=sevOf(l.x)||sevLegacy(l.x);h+='<div class="j812"><span class="av12" aria-hidden="true">'+g8i()+'</span><div class="bub12'+(v?' lv-'+v:'')+'">'+(v?sevChip(v):'')+'<div dir="auto">'+md(sevStrip(l.x))+'</div>'+(l.t?'<span class="tm12"><bdi>'+esc(l.t)+'</bdi></span>':'')+'</div></div>';});return h;}
function taskDetail(i){var n=nextOf(i),pid=rowPid(i),p=pobj(pid),T=i.task?J8.inbox.forTask(i.task.id).slice(0,3).reverse():i.c?[i.c]:[];
  return '<article class="dd12"><div class="eb12">'+urgChip(i)+(i.ul.length?chip12('unl','key',esc(tt('unlocks',{n:i.ul.length}))):'')+(isNum(i.mins)?chip12('','time',esc(tt('min',{n:i.mins}))):'')+'</div><h3 class="ht12" id="dpH" tabindex="-1" dir="auto">'+esc(cap1(n.what))+'</h3>'+planTag(i)
   +(p&&pid!=='p-general'?'<p class="pj12">'+ptile(pid,'sm')+'<bdi dir="auto">'+esc(p.name)+'</bdi></p>':'')+(i.ul.length?'<p class="fr12">'+I('unlock')+'<span dir="auto">'+esc(tt('frees2',{x:freesTxt(i)}))+'</span></p>':'')+whyLine(i)+facts(i)+bar12(i)+cbox12(i)
   +(T.length?'<section class="th12"><h4>'+esc(tt('notes'))+'</h4><div class="log12">'+T.map(msgHTML).join('')+'</div></section>':'')+'</article>';}
function md12(list,detail,label){return '<div class="md12"><section class="ml12 pane12" aria-label="'+esc(label)+'">'+list+'</section><section class="dp12 pane12" id="dp12" aria-label="'+esc(label)+' · '+esc(tt('open'))+'"><div class="dpi">'+(detail||'<p class="empty12">'+I('fwd','flip')+'<span>'+esc(tt('pick'))+'</span></p>')+'</div></section></div>';}
function projMD(){var P=liveP().filter(function(p){return !isDoneP(p);}).sort(function(a,b){return (a.status==='parked')-(b.status==='parked');});if(!P.length)return md12('<p class="empty12">'+esc(t('other'))+'</p>','',tt('projects'));
  if(!UI.proj||!P.some(function(p){return p.id===UI.proj;}))UI.proj=P[0].id;UI.pseg=UI.pseg||'act';
  var d='';try{d=projPlanTag(pobj(UI.proj))+vProj().replace(/id="pageH"/g,'id="dpH"');}catch(e){d='';}
  return md12('<ul class="ll12">'+P.map(function(p){return prow12(p,p.id===UI.proj);}).join('')+'</ul>',d,tt('projects'));}
function tasksMD(){var N=myQueue();if(!N.length)return md12('<p class="empty12">'+I('done')+'<span>'+esc(tt('clear'))+'</span></p>','',tt('tasks'));
  var s=N.filter(function(x){return x.key===UI.tsel;})[0]||N[0];UI.tsel=s.key;
  return md12('<ol class="ll12">'+N.map(function(i,k){return trow12(i,k+1,i===s);}).join('')+'</ol>',taskDetail(s),tt('tasks'));}
function draftsMD(){var A=apPending();if(!A.length){UI.dsel=null;return md12('<p class="empty12">'+I('done')+'<span>'+esc(tt('noDrafts'))+'</span></p>','',tt('drafts'));}
  var ids=A.map(function(a){return a.id;});if(!UI.dsel||ids.indexOf(UI.dsel)<0){var j=UI.dord?UI.dord.indexOf(UI.dsel):-1,nx=null;if(j>-1)for(var q=j+1;q<UI.dord.length&&!nx;q++)if(ids.indexOf(UI.dord[q])>-1)nx=UI.dord[q];UI.dsel=nx||((UI.dids||[]).filter(isPend)[0])||ids[0];}
  UI.dord=ids;var sel=UI.dsel,sa=AP[sel]||{},bk=bkey(Object.assign({id:sel},sa));UI.dids=[sel].concat(ids.filter(function(x){return x!==sel&&bkey(Object.assign({id:x},AP[x]))===bk;}));UI.batch=bk;
  var by={},ord=[];A.forEach(function(a){var b=bkey(a);if(!by[b]){by[b]={label:a.batch_label||(a.batch?a.batch:tt('single')),L:[]};ord.push(b);}by[b].L.push(a);});
  var S=UI.msel,ns=Object.keys(S).filter(function(x){return S[x]&&isPend(x);}).length;
  var list=(ns?'<div class="msb12" role="group" aria-label="'+esc(tt('nSel',{n:ns}))+'"><b><bdi>'+esc(tt('nSel',{n:ns}))+'</bdi></b><button class="b12 pri sm" data-a="x12-msok">'+I('check')+'<span>'+esc(tt('approveSel',{n:ns}))+'</span></button><button class="b12 sm" data-a="x12-msclr">'+esc(tt('clearSel'))+'</button></div>':'')
   +ord.map(function(b){var g=by[b],all=g.L.every(function(a){return S[a.id];});return '<section class="dg12"><header><label class="ck12 g"><input type="checkbox" data-x12="msg" data-id="'+esc(b)+'"'+(all?' checked':'')+'><span class="sr">'+esc(tt('selSet'))+'</span></label><b dir="auto">'+esc(g.label)+'</b><span class="n12"><bdi>'+g.L.length+'</bdi></span>'+(g.L.length>=4?'<button class="lnk" data-a="x-set" data-id="'+esc(b)+'">'+t('xSet')+'</button>':'')+'</header><ul class="ll12">'+g.L.map(function(a){return drow12(a,a.id===sel,!!S[a.id]);}).join('')+'</ul></section>';}).join('');
  var d='';try{d=(draftCheck()+vDraft10()).replace(/id="pageH"/g,'id="dpH"');}catch(e){d='';}
  return md12(list,d,tt('drafts'));}
function listD(seg){UI.lseg=seg;var A=apPending().length,P=liveP().filter(function(p){return !isDoneP(p);}).length,N=myQueue().length;
  var h=ph(tt('list'),esc(tt('lsub',{p:P,d:A})),'<div class="phx12"><button class="lnk12 icon" data-a="x12-keys" aria-label="'+esc(tt('keys'))+'"><kbd>?</kbd></button></div>')+'<nav class="seg12 three" aria-label="'+esc(tt('list'))+'">'
   +[['proj','proj',tt('projects'),P],['tasks','steps',tt('tasks'),N],['drafts','inbox',tt('drafts'),A]].map(function(x){return '<button data-a="x12-lseg" data-id="'+x[0]+'" aria-pressed="'+(x[0]===seg)+'">'+I(x[1])+'<span>'+esc(x[2])+'</span>'+(x[3]?'<span class="n12"><bdi>'+x[3]+'</bdi></span>':'')+'</button>';}).join('')+'</nav>';
  if(!connected)return h+'<div class="md12">'+skel(6)+skel(2)+'</div>';
  return h+(seg==='proj'?projMD():seg==='tasks'?tasksMD():draftsMD());}

/* Flow · Map on desktop: every project as a lane on a 6-week line */
function flowMapD(){var M=mineBy(),f=UI.pmf,P=liveP().filter(function(p){return !isDoneP(p);}),now=new Date(),t0=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(),SPAN=42*864e5;
  var L=P.filter(function(p){return f==='all'||(f==='me'?holderOf(p,M)==='me':projBlocked(p));});
  var ax='';for(var k=0;k<=6;k++){var d=new Date(t0+k*7*864e5);ax+='<span style="--x:'+(k/6*100).toFixed(2)+'%"><bdi>'+esc(k?dayShort(d):tt('today'))+'</bdi></span>';}
  var h='<div class="flt12" role="group" aria-label="'+esc(tt('f_map'))+'">'+[['all','allP'],['me','mineP'],['blk','blockedP']].map(function(x){return '<button data-a="x12-pmf" data-id="'+x[0]+'" aria-pressed="'+(f===x[0])+'">'+esc(tt(x[1]))+'</button>';}).join('')+'</div>';
  h+='<div class="gt12" role="table" aria-label="'+esc(tt('f_map'))+'"><div class="gh12" role="row"><span role="columnheader">'+esc(tt('projCol'))+'</span><span role="columnheader">'+esc(tt('stageCol'))+'</span><span role="columnheader" class="ax">'+ax+'</span><span role="columnheader">'+esc(tt('whoCol'))+'</span></div>';
  var by={},ord=[];L.forEach(function(p){var u=unitOf(p),id=u?u.id:'_';if(!by[id]){by[id]={nm:u?u.name:t('other'),L:[]};ord.push(id);}by[id].L.push(p);});
  h+=ord.map(function(id){var g=by[id];return '<div class="gu12" role="row"><span role="cell" dir="auto">'+esc(g.nm)+' <span class="n12"><bdi>'+g.L.length+'</bdi></span></span></div>'+g.L.map(function(p){var s=stageOf(p),ms=msOf(p),ho=holderOf(p,M),c=(pcolRaw(p.id)||['#2A44C6'])[0],at=ms&&ms.at?pd(String(ms.at).length===10?ms.at+'T12:00:00':ms.at):NaN,x=isNaN(at)?null:Math.max(0,Math.min(1,(at-t0)/SPAN)),od=!isNaN(at)&&at<t0;
    return '<button class="gr12" role="row" data-a="proj" data-id="'+esc(p.id)+'" style="--pc:'+esc(c)+'"><span role="cell" class="c1">'+ptile(p.id,'sm')+'<span class="lt"><b dir="auto">'+esc(p.name)+'</b><small dir="auto">'+(ms&&ms.at?esc(cut(ms.t,44)):esc(tt('noMs')))+'</small></span></span><span role="cell" class="c2">'+segs6(s)+'<small>'+esc(s?stgL(s):'—')+'</small></span>'
     +'<span role="cell" class="tl"><i class="nowl" aria-hidden="true"></i>'+(x!=null?'<i class="ms'+(od?' od':'')+'" style="--x:'+(x*100).toFixed(2)+'%" aria-hidden="true"></i><small class="msl'+(x>.7?' r':'')+'" style="--x:'+(x*100).toFixed(2)+'%"><bdi>'+esc(od?tt('overdue'):dlabel(ms.at))+'</bdi></small>':'')+'</span><span role="cell" class="c4">'+holdChip(ho)+'</span></button>';}).join('');}).join('')+'</div>';
  return L.length?h:h+'<p class="empty12">'+I('done')+'<span>'+esc(tt('clear'))+'</span></p>';}

/* shortcuts overlay */
function keysOpen(){var o=$('keys12');if(o){o.remove();return;}o=document.createElement('div');o.id='keys12';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','keysH');
  var K=[[(/Mac/.test(navigator.platform)?'⌘':'Ctrl')+' K','k_pal'],['J / K','k_jk'],['Enter','k_ent'],['A','k_a'],['E','k_e'],['X','k_x'],['D','k_d'],['C','k_c'],['\\','k_j8'],['1 2 3 4','k_14'],['?','k_q'],['Esc','k_esc']];
  o.innerHTML='<div class="kc12"><h2 id="keysH" tabindex="-1">'+esc(tt('keys'))+'</h2><dl>'+K.map(function(x){return '<div><dt><kbd>'+esc(x[0])+'</kbd></dt><dd>'+esc(tt(x[1]))+'</dd></div>';}).join('')+'</dl><button class="b12" data-a="x12-keys">'+I('x')+'<span>'+esc(tt('k_esc'))+'</span></button></div>';
  document.body.appendChild(o);o.addEventListener('click',function(e){if(e.target===o)o.remove();});o.querySelector('#keysH').focus();}
window.j8keys=keysOpen;

/* command palette: the 9.0 Search or ask, with the new places and actions */
var ai0=askItems;askItems=function(q){var Q=String(q||'').trim().toLowerCase(),IC={next:'compass',chat:'chat',list:'steps',flow:'flow',me:'you'};
  var R=ai0(q).filter(function(r){return !(r.g==='places'&&/^nav:(inbox|projects|calendar)$/.test(r.id));}).map(function(r){if(r.g==='places'){var k=r.id.slice(4);r.ic=IC[k]||r.ic||'fwd';r.l=tt(k);}return r;});
  [['act:j8','talk','openJ8'],['act:keys','help','keys'],['act:goals','target','setGoals'],['act:drafts','inbox','drafts']].forEach(function(a){var l=tt(a[2]);if(!Q||l.toLowerCase().indexOf(Q)>-1)R.push({g:'acts',id:a[0],ic:a[1],l:l});});return R.slice(0,14);};
var ac0=askCmd;askCmd=function(id){if(String(id).indexOf('act:')!==0)return ac0(id);gClose();var a=id.slice(4);
  if(a==='plan')planSheet();else if(a==='j8'){if(D12())setJ8(true,true);else navTo('chat');}else if(a==='keys')keysOpen();else if(a==='goals')obOpen(1);else if(a==='drafts'){UI.lseg='drafts';navTo('list');}};

/* desktop routing: projects and drafts open inside List */
var op0=openProj;openProj=function(pid){if(D12()){UI.proj=pid;UI.pseg='act';UI.lseg='proj';if(UI.v==='projects'){render();return;}UI.stack=[];nav0('projects');return;}op0(pid);};
var gv0=goV;goV=function(v,k){if(D12()&&v==='proj'){UI.lseg='proj';if(UI.v==='projects'){render();return;}v='projects';k=true;}if(D12()&&(v==='draft'||v==='qitem')){UI.lseg='drafts';if(UI.dids&&UI.dids[0])UI.dsel=UI.dids[0];v='inbox';}gv0(v,k);};
var nv1=navTo;navTo=function(v){if(v==='list'&&D12()&&UI.lseg==='tasks'){nav0('ltasks');return;}if(v==='ltasks'&&!D12())v='next';nv1(v);};

/* wrap render: desktop screens, J8 panel, keyboard focus kept */
var r12=render;render=function(focus){var d=D12();document.body.dataset.d12=d?'1':'0';
  if(d&&(UI.v==='proj'))UI.v='projects';if(d&&(UI.v==='draft'||UI.v==='qitem'))UI.v='inbox';if(!d&&UI.v==='ltasks')UI.v='next';
  r12(focus);if(d)renderJ8();};
var vN0=vNext;vNext=function(){return D12()?vNextD():vN0();};
var lw0=listWrap;listWrap=function(seg,html){if(!D12())return lw0(seg,html);return listD(seg==='drafts'?'drafts':'proj');};
var fm0=flowMap;flowMap=function(){return D12()?flowMapD():fm0();};
var vc0=vChat;vChat=function(){var h=vc0();if(!D12()||!connected)return h;var i=h.indexOf('<div class="pulse12"'),j=h.indexOf('<div class="log12"');if(i<0||j<0)return h;
  return h.slice(0,i)+'<div class="cd12"><div class="cm12">'+h.slice(j)+'</div><aside class="ca12" aria-label="'+esc(tt('last24'))+'">'+h.slice(i,j)+'</aside></div>';};

/* heroCard on desktop knows when it is not the first step */
function focusTo(k,keep){UI.focusK=k;render();var e=document.querySelector('[data-kn="'+(window.CSS&&CSS.escape?CSS.escape(k):k)+'"] [data-kp]');if(e&&keep!==false){e.focus({preventScroll:true});try{e.scrollIntoView({block:'nearest'});}catch(x){}}}

/* actions */
function blurRender(el){var k=el&&el.closest('[data-kn]'),kn=k&&k.dataset.kn,cb=el&&el.matches('input')?el.dataset.id:null;if(document.activeElement)document.activeElement.blur();render();
  var f=cb?document.querySelector('input[data-id="'+(window.CSS&&CSS.escape?CSS.escape(cb):cb)+'"]'):kn?document.querySelector('[data-kn="'+(window.CSS&&CSS.escape?CSS.escape(kn):kn)+'"] [data-kp]'):null;if(f)f.focus({preventScroll:true});}
document.addEventListener('change',function(e){var x=e.target;if(!x||!x.dataset||!x.dataset.x12)return;
  if(x.dataset.x12==='ms')UI.msel[x.dataset.id]=x.checked;
  else if(x.dataset.x12==='msg'){var b=x.dataset.id;apPending().forEach(function(a){if(bkey(a)===b)UI.msel[a.id]=x.checked;});}
  blurRender(x);});
function draftAct(id,how){if(!id||!isPend(id))return;UI.dsel=id;var a=AP[id]||{},bk=bkey(Object.assign({id:id},a));UI.dids=[id].concat(apPending().filter(function(x){return x.id!==id&&bkey(x)===bk;}).map(function(x){return x.id;}));draftDecide(id,how);}
window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a^="x12-"],#sideC');if(!el)return;var a=el.id==='sideC'?'x12-side':el.dataset.a,id=el.dataset.id||'',k=el.dataset.k;
  if(!/^x12-(focus|psel|tsel|dsel|dap|ded|dkl|dcm|msok|msclr|keys|side)$/.test(a))return;e.preventDefault();e.stopPropagation();
  if(a==='x12-focus')focusTo(k);
  else if(a==='x12-psel'){UI.proj=id;UI.pseg='act';blurRender(el);}
  else if(a==='x12-tsel'){UI.tsel=k;blurRender(el);}
  else if(a==='x12-dsel'){UI.dsel=id;UI.editing=false;blurRender(el);}
  else if(a==='x12-dap')draftAct(id,'send');
  else if(a==='x12-dkl')draftAct(id,'kill');
  else if(a==='x12-ded'){UI.dsel=id;UI.editing=true;render();var ta=document.querySelector('#dp12 form.edit textarea');if(ta)ta.focus();}
  else if(a==='x12-dcm'){UI.dsel=id;UI.editing=false;render();var c=document.querySelector('#dp12 .dn12 textarea');if(c)c.focus();}
  else if(a==='x12-msok'){var ids=Object.keys(UI.msel).filter(function(x){return UI.msel[x]&&isPend(x);});UI.msel={};if(!ids.length)return;
    seq(ids,function(x){return J8.approvals.approve(x);}).then(function(){toast(tt('approvedN',{n:ids.length}),function(){seq(ids,function(x){return J8.approvals.undo(x);}).then(function(){toast(t('backWaiting'));});});});render();}
  else if(a==='x12-msclr'){UI.msel={};render();}
  else if(a==='x12-keys')keysOpen();
  else if(a==='x12-side'){var m=document.body.dataset.side==='mini'?'full':'mini';document.body.dataset.side=m;ls('j8-side',m);sideRender();}},true);

/* keyboard: J/K move, Enter open, A approve, E edit, X kill, D done, C comment, \ J8, 1–4 places, ? this list */
document.addEventListener('keydown',function(e){var x=e.target,typing=x&&(/^(INPUT|TEXTAREA|SELECT)$/.test(x.tagName)||x.isContentEditable);
  if(e.key==='Escape'){var ko=$('keys12');if(ko){ko.remove();return;}}
  if(typing||e.metaKey||e.ctrlKey||e.altKey||OB.on||!$('gsheet').hidden||!$('sheet').hidden||$('app').hidden||!D12())return;
  var key=e.key,v=UI.v,m=$('main');
  if(key==='?'){e.preventDefault();keysOpen();return;}
  if($('keys12'))return;
  if(key==='/'){e.preventDefault();askSheet();return;}
  if(key==='\\'){e.preventDefault();setJ8(!j8Open(),!j8Open());return;}
  if(/^[1-4]$/.test(key)){e.preventDefault();UI.stack=[];navTo(['next','chat','list','flow'][+key-1]);return;}
  var R=[].slice.call(m.querySelectorAll('[data-kn]'));
  if((key==='j'||key==='k')&&R.length){e.preventDefault();var i=R.findIndex(function(r){return r.classList.contains('sel');}),n=R[Math.max(0,Math.min(R.length-1,(i<0?-1:i)+(key==='j'?1:-1)))];var b=n&&n.querySelector('[data-kp]');if(b){b.click();var f=document.querySelector('[data-kn="'+(window.CSS&&CSS.escape?CSS.escape(n.dataset.kn):n.dataset.kn)+'"] [data-kp]');if(f){f.focus({preventScroll:true});try{f.scrollIntoView({block:'nearest'});}catch(_){}}}return;}
  if(key==='Enter'){if(x&&/^(BUTTON|A)$/.test(x.tagName)&&!x.hasAttribute('data-kp'))return;e.preventDefault();var p=v==='next'?document.querySelector('#hero12 .bar12 .pri'):document.querySelector('#dp12 .bar12 .pri,#dp12 [data-a=dsend],#dp12 button,#dp12 a[href]');if(p){if(v==='next')p.click();else p.focus();}return;}
  if(key==='a'&&v==='inbox'&&UI.dsel){e.preventDefault();draftAct(UI.dsel,'send');return;}
  if(key==='x'&&v==='inbox'&&UI.dsel){e.preventDefault();draftAct(UI.dsel,'kill');return;}
  if(key==='e'&&v==='inbox'&&UI.dsel){e.preventDefault();UI.editing=true;render();var ta=document.querySelector('#dp12 form.edit textarea');if(ta)ta.focus();return;}
  if(key==='d'){var d=v==='next'?document.querySelector('#hero12 .bar12 [data-a=done]'):v==='ltasks'?document.querySelector('#dp12 .bar12 [data-a=done]'):null;if(d){e.preventDefault();d.click();}return;}
  if(key==='c'){var c=document.querySelector(v==='next'?'#hero12 .cb12 textarea':'#dp12 .cb12 textarea,#dp12 .pinc textarea');if(c){e.preventDefault();c.focus();}return;}});
if(MQD&&MQD.addEventListener)MQD.addEventListener('change',function(){if(!D12())document.body.dataset.j8='closed';render();});


/* =================== 11.2.0 (17 Nov 2026, Dave 14:11–14:15) ===================
   1 Next items open right here (sheet on phone, focus pane on desktop); a "Do it" that would land on an empty list opens the item instead.
     Root cause: Next counts project asks and held drafts whose link is the Drafts list (#approve), but those drafts are already approved,
     and List → Drafts only shows pending ones, so the jump fell through to an empty list. List → Drafts now also shows "Approved · you post
     these by hand", so the item is never hidden.
   2 Line up next steps (J8, violet): re-ranks and pulls the next steps from your goals, your plan's step library, things you put off and
     blocked items with what unlocks them. Real data only. Next is never empty while goals are open; "All done" only when nothing is left.
   3 Colour roles on rows and chips. 4 Pin is a real toggle (goals, projects; sidebar ⋯ and drag to reorder; member prefs).
   5 + New (goal, project, step, note, draft idea, plan with J8). 6 Honest Connections. 7 Gentle "Set up your goals with J8" card. */
Object.assign(L11.en,{lineUp:'Line up next steps',lining:'J8 is lining up your next steps…',linedN:'{n} new steps lined up',lined1:'1 new step lined up',linedNone:'Nothing new to add. Your list already has every next step.',
  fromGoals:'Added from your goals and plan',putOff:'You put these off',bringBack:'Bring back',blockedH:'Blocked, and what unlocks them',waitsOn:'Waits on: {x}',
  allDone:'All done',allDoneP:'Every open step is finished.',nextGoalL:'Next goal: {g} · {d}',setGoal:'Set a goal',viewGoal:'Open the goal',
  emptyNext:'No steps right now',emptyNextP:'You have {n} open goals. J8 can line up the next steps from them.',emptyNextP1:'You have 1 open goal. J8 can line up the next steps from it.',firstStep:'Decide the first step toward: {g}',
  detail:'Details',handH:'Approved · you post these by hand',handP:'Already approved. Copy each one and post it yourself.',copy:'Copy text',copied:'Copied',openIn:'Open {x}',heldH:'Waiting on you',
  unpin:'Unpin',moveUp:'Move up',moveDown:'Move down',moreA:'More',pinnedH:'Pinned',needsMost:'Needs you most',pinHint:'Pin a project from its page to keep it here.',pinnedT:'{x} pinned',unpinnedT:'{x} unpinned',pinProj:'Pin',unpinProj:'Pinned · tap to unpin',pinGoal:'Pin to top',unpinGoal:'Pinned · tap to unpin',
  newB:'New',newH:'Create',nGoal:'Goal',nGoalP:'A target with a number and a deadline. J8 offers to plan it.',nProj:'Project',nProjP:'The thing that serves a goal, with milestones.',
  nReqProj:'Request a project',nReqProjP:'Only an admin adds projects. This asks J8 to add it.',nStep:'Step',nStepP:'One to-do with an estimate. It can belong to a project and wait on another step.',
  nNote:'Note to J8',nNoteP:'A request or instruction. The team acts on it.',nDraft:'Draft idea',nDraftP:'An outreach idea. J8 writes it properly; you OK the final draft.',
  nPlan:'Plan with J8',nPlanP:'J8 asks a few questions and adds what is missing to your plan.',
  fGoalT:'Goal',fGoalPh:'e.g. 10 paying clients',fNum:'Number (optional)',fDue:'Deadline',fProj:'Project',fNone:'No project',fMins:'Minutes',fAfter:'Waits on (optional)',fNoBlock:'Nothing',
  fName:'Name',fGoalL:'Goal it serves (optional)',fMs:'First milestone (optional)',fMsAt:'Milestone date',fText:'Your note',fTo:'To whom',fToPh:'e.g. Head of Product at Acme',fChan:'Channel',fIdea:'What should it say?',
  fStepT:'Step',fStepPh:'e.g. Call the printer about the quote',create:'Create',chEmail:'Email',chLi:'LinkedIn',chOther:'Other',
  madeGoal:'Goal saved',madeProj:'Project added',madeStep:'Step added to Next',madeNote:'Sent to J8 and the team',madeDraft:'Idea saved. J8 writes the draft.',madeReq:'Request sent to J8',view:'View',planIt:'Plan it with J8',another:'Create another',
  ideasH:'Your draft ideas · J8 is writing these',ideaWait:'J8 writes the real draft from this. You OK that one.',del:'Delete',deleted:'Deleted',editGoals:'Edit goals',yourGoals:'Your goals',noMyGoals:'No goals of your own yet.',ideaNo:'J8 is still writing this idea. You approve the final draft.',
  youAdded:'You added this',delStep:'Delete this step',remProj:'Remove this project',
  obCard:'Set up your goals with J8 (3 min)',obCardP:'J8 asks a few questions and lines up your plan.',obStart:'Start',dismiss:'Dismiss',
  emptyDraftsA:'New draft message',emptyProj:'No projects yet.',emptyProjA:'New project',needLineUp:'Line up next steps',
  c_cal:'Synced daily by the J8 team (read-only)',c_calLast:'Last sync {t}',c_calNever:'Not synced yet',c_money:'Updated daily · as of {t}',c_moneyNone:'No money figures yet',
  c_payWait:'Morning: waiting for you to sign in (1 min)',c_payDone:'Morning: you signed in {t}. Grow: not connected.',c_li:'You send by hand (LinkedIn bans automation). J8 prepares every note.',c_wa:'Not planned yet',calH:'Calendar · next 7 days',calNone:'Nothing on your calendar in the next 7 days.'});
Object.assign(L11.he,{lineUp:'לסדר את הצעדים הבאים',lining:'J8 מסדר לך את הצעדים הבאים…',linedN:'נוספו {n} צעדים חדשים',lined1:'נוסף צעד חדש',linedNone:'אין מה להוסיף. כל הצעדים הבאים כבר ברשימה.',
  fromGoals:'נוספו מהיעדים ומהתוכנית שלך',putOff:'דחית את אלה',bringBack:'להחזיר',blockedH:'חסומים, ומה ישחרר אותם',waitsOn:'מחכה ל: {x}',
  allDone:'הכל בוצע',allDoneP:'כל הצעדים הפתוחים הסתיימו.',nextGoalL:'היעד הבא: {g} · {d}',setGoal:'להגדיר יעד',viewGoal:'לפתוח את היעד',
  emptyNext:'אין צעדים כרגע',emptyNextP:'יש לך {n} יעדים פתוחים. J8 יכול לסדר מהם את הצעדים הבאים.',emptyNextP1:'יש לך יעד פתוח אחד. J8 יכול לסדר ממנו את הצעדים הבאים.',firstStep:'להחליט על הצעד הראשון לקראת: {g}',
  detail:'פרטים',handH:'אושרו · מפרסמים ידנית',handP:'כבר אושרו. מעתיקים כל אחד ומפרסמים בעצמך.',copy:'להעתיק',copied:'הועתק',openIn:'לפתוח את {x}',heldH:'מחכים לך',
  unpin:'לבטל הצמדה',moveUp:'למעלה',moveDown:'למטה',moreA:'עוד',pinnedH:'מוצמדים',needsMost:'הכי צריכים אותך',pinHint:'אפשר להצמיד פרויקט מהעמוד שלו.',pinnedT:'{x} הוצמד',unpinnedT:'ההצמדה של {x} בוטלה',pinProj:'להצמיד',unpinProj:'מוצמד · לחיצה מבטלת',pinGoal:'להצמיד למעלה',unpinGoal:'מוצמד · לחיצה מבטלת',
  newB:'חדש',newH:'ליצור',nGoal:'יעד',nGoalP:'מטרה עם מספר ותאריך. J8 מציע לתכנן אותה.',nProj:'פרויקט',nProjP:'מה שמשרת יעד, עם אבני דרך.',
  nReqProj:'לבקש פרויקט',nReqProjP:'רק מנהל מוסיף פרויקטים. זה מבקש מ־J8 להוסיף.',nStep:'צעד',nStepP:'משימה אחת עם הערכת זמן. אפשר לשייך לפרויקט ולצעד שהיא מחכה לו.',
  nNote:'הודעה ל־J8',nNoteP:'בקשה או הנחיה. הצוות פועל לפיה.',nDraft:'רעיון לטיוטה',nDraftP:'רעיון לפנייה. J8 כותב אותו כמו שצריך; את הטיוטה הסופית את/ה מאשר/ת.',
  nPlan:'לתכנן עם J8',nPlanP:'J8 שואל כמה שאלות ומוסיף לתוכנית מה שחסר.',
  fGoalT:'יעד',fGoalPh:'למשל 10 לקוחות משלמים',fNum:'מספר (לא חובה)',fDue:'תאריך יעד',fProj:'פרויקט',fNone:'בלי פרויקט',fMins:'דקות',fAfter:'מחכה ל (לא חובה)',fNoBlock:'כלום',
  fName:'שם',fGoalL:'היעד שהוא משרת (לא חובה)',fMs:'אבן דרך ראשונה (לא חובה)',fMsAt:'תאריך אבן הדרך',fText:'ההודעה שלך',fTo:'למי',fToPh:'למשל מנהלת מוצר באקמה',fChan:'ערוץ',fIdea:'מה לכתוב?',
  fStepT:'צעד',fStepPh:'למשל להתקשר לדפוס לגבי ההצעה',create:'ליצור',chEmail:'מייל',chLi:'לינקדאין',chOther:'אחר',
  madeGoal:'היעד נשמר',madeProj:'הפרויקט נוסף',madeStep:'הצעד נוסף ל"הבא"',madeNote:'נשלח ל־J8 ולצוות',madeDraft:'הרעיון נשמר. J8 כותב את הטיוטה.',madeReq:'הבקשה נשלחה ל־J8',view:'לצפות',planIt:'לתכנן עם J8',another:'ליצור עוד',
  ideasH:'רעיונות לטיוטות · J8 כותב אותם',ideaWait:'J8 כותב מזה טיוטה אמיתית. אותה את/ה מאשר/ת.',del:'למחוק',deleted:'נמחק',editGoals:'לערוך יעדים',yourGoals:'היעדים שלך',noMyGoals:'עוד אין לך יעדים משלך.',ideaNo:'J8 עדיין כותב את הרעיון הזה. מאשרים את הטיוטה הסופית.',
  youAdded:'הוספת את זה',delStep:'למחוק את הצעד',remProj:'להסיר את הפרויקט',
  obCard:'להגדיר יעדים עם J8 (3 דק׳)',obCardP:'J8 שואל כמה שאלות ומסדר לך תוכנית.',obStart:'להתחיל',dismiss:'לסגור',
  emptyDraftsA:'טיוטת הודעה חדשה',emptyProj:'עוד אין פרויקטים.',emptyProjA:'פרויקט חדש',needLineUp:'לסדר את הצעדים הבאים',
  c_cal:'מסונכרן כל יום על ידי צוות J8 (קריאה בלבד)',c_calLast:'סנכרון אחרון {t}',c_calNever:'עוד לא סונכרן',c_money:'מתעדכן כל יום · נכון ל־{t}',c_moneyNone:'עוד אין נתוני כסף',
  c_payWait:'Morning: מחכה שתתחבר/י (דקה)',c_payDone:'Morning: התחברת {t}. Grow: לא מחובר.',c_li:'שולחים ידנית (לינקדאין אוסר אוטומציה). J8 מכין כל הודעה.',c_wa:'לא מתוכנן עדיין',calH:'יומן · 7 הימים הקרובים',calNone:'אין כלום ביומן ב־7 הימים הקרובים.'});
var HE=function(){return LANG==='he';};
function prefs0(){try{return J8.prefs.get()||{};}catch(e){return {};}}
function prefSet(patch,lsk){if(lsk)Object.keys(lsk).forEach(function(k){ls(k,lsk[k]);});try{var o=J8.orgs.current();if(o)o.prefs=Object.assign({},o.prefs||{},patch);}catch(e){} /* optimistic: the screen shows the change at once */
  try{if(J8.status().connected)return J8.prefs.set(patch).catch(function(){toast(t('localOnly'));});}catch(e){}toast(t('localOnly'));return Promise.resolve();}
function myGoalList(){var o=prefs0();var G=Array.isArray(o.goals)?o.goals:(ls('j8-goals')||[]);return (G||[]).filter(function(g){return g&&g.t;}).slice();}
function stamp(){return Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
function addDays(n){var d=new Date();d.setDate(d.getDate()+n);return ymd(d);}

/* ---------- 4. pin: a real toggle, saved in member prefs (goalPins, pins) ---------- */
function goalPins(){var o=prefs0(),a=Array.isArray(o.goalPins)?o.goalPins:ls('j8-goalpins');if(!Array.isArray(a)){var one=o.goalPin||ls('j8-goalpin');a=one?[one]:[];}return a.slice();}
function projPins(){var o=prefs0(),a=Array.isArray(o.pins)?o.pins:ls('j8-pins');return (Array.isArray(a)?a:[]).filter(function(id){return !!pobj(id);});}
function pinned13(S,id){return (S.pins||[]).indexOf(id)>-1;}
function goalPinToggle(id){var a=goalPins(),i=a.indexOf(id);if(i>-1)a.splice(i,1);else a.unshift(id);prefSet({goalPins:a,goalPin:a[0]||null},{'j8-goalpins':a,'j8-goalpin':a[0]||null});var g=goalsAll().filter(function(x){return x.id===id;})[0];toast(tt(i>-1?'unpinnedT':'pinnedT',{x:cut(g?g.t:'',40)}));}
function projPinSet(a,id,on){prefSet({pins:a},{'j8-pins':a});var p=pobj(id);if(p&&on!=null)toast(tt(on?'pinnedT':'unpinnedT',{x:cut(p.name,40)}));sideRender();render();}
function projPinToggle(id){var a=projPins(),i=a.indexOf(id);if(i>-1)a.splice(i,1);else a.push(id);projPinSet(a,id,i<0);}
goalsShown=function(){var A=goalsAll(),P=gprefs(),pins=goalPins(),L=P.watch&&P.watch.length?A.filter(function(g){return P.watch.indexOf(g.id)>-1||pins.indexOf(g.id)>-1;}):A;if(!L.length)L=A;
  var pi=L.filter(function(g){return pins.indexOf(g.id)>-1;}).sort(function(a,b){return pins.indexOf(a.id)-pins.indexOf(b.id);}),rest=L.filter(function(g){return pins.indexOf(g.id)<0;});
  return {L:pi.concat(rest).slice(0,3),pin:pins[0]||null,pins:pins};};
function pinBar(p){if(!p)return '';var on=projPins().indexOf(p.id)>-1;return '<p class="pin13"><button type="button" class="chip12 pinb'+(on?' on':'')+'" data-a="x13-ppin" data-id="'+esc(p.id)+'" aria-pressed="'+on+'">'+I('pin')+'<bdi>'+esc(tt(on?'unpinProj':'pinProj'))+'</bdi></button></p>';}
var ppt0=projPlanTag;projPlanTag=function(p){var h=ppt0(p);if(p&&!px(p,'plan')&&px(p,'app')&&J8.orgs.can('admin'))h='<p class="plan12"><span class="chip12 ai sm">'+I('check')+'<bdi>'+esc(tt('youAdded'))+'</bdi></span><button type="button" class="lnk" data-a="x12-pedit" data-id="'+esc(p.id)+'">'+I('edit')+'<span>'+esc(tt('editIt'))+'</span></button></p>';return pinBar(p)+h;};
var pt0=planTag;planTag=function(i){var h=pt0(i);if(i&&i.task&&i.task.source==='j8nix-app')h=h.replace(esc(tt('yourPlan')),esc(tt('youAdded')));return h.replace('chip12 new sm','chip12 ai sm');};
/* sidebar: Pinned (real pins, ⋯ menu, drag to reorder) or, with none, "Needs you most" */
function pinsRender(){var el=$('pins');if(!el||!connected)return;var a=projPins(),mn=UI.pmenu;
  if(a.length){el.innerHTML='<p class="ph6">'+esc(tt('pinnedH'))+'</p><ul class="pl13" aria-label="'+esc(tt('pinnedH'))+'">'+a.map(function(id,j){var p=pobj(id);return '<li draggable="true" data-pid="'+esc(id)+'" title="'+esc(tt('dragHint')||'')+'"><button data-a="proj" data-id="'+esc(id)+'"'+(UI.proj===id&&/^(proj|projects)$/.test(UI.v)?' aria-current="page"':'')+'>'+ptile(id,'sm')+'<span class="lbl" dir="auto">'+esc(p.name)+'</span></button><button class="pm13" data-a="x13-pmenu" data-id="'+esc(id)+'" aria-expanded="'+(mn===id)+'" aria-label="'+esc(tt('moreA')+': '+p.name)+'">'+I('dots')+'</button>'
    +(mn===id?'<span class="pmm13" role="group" aria-label="'+esc(p.name)+'"><button data-a="x13-punpin" data-id="'+esc(id)+'">'+I('pin')+'<span>'+esc(tt('unpin'))+'</span></button>'+(j>0?'<button data-a="x13-pup" data-id="'+esc(id)+'">'+I('up')+'<span>'+esc(tt('moveUp'))+'</span></button>':'')+(j<a.length-1?'<button data-a="x13-pdown" data-id="'+esc(id)+'">'+I('down')+'<span>'+esc(tt('moveDown'))+'</span></button>':'')+'</span>':'')+'</li>';}).join('')+'</ul>';return;}
  var P=liveP().filter(function(p){return p.status!=='parked'&&!isDoneP(p)&&projNeed(p.id).length>0;}).sort( /* 11.3: only projects that really wait on you */function(x,y){return projNeed(y.id).length-projNeed(x.id).length||stageOf(y)-stageOf(x);}).slice(0,5);
  el.innerHTML=P.length?'<p class="ph6">'+esc(tt('needsMost'))+'</p>'+P.map(function(p){return '<button data-a="proj" data-id="'+esc(p.id)+'">'+ptile(p.id,'sm')+'<span class="lbl" dir="auto">'+esc(p.name)+'</span></button>';}).join('')+'<p class="phint13">'+esc(tt('pinHint'))+'</p>':'';}
Object.assign(L11.en,{dragHint:'Drag to reorder',seePosts:'See the {n} posts to copy'});Object.assign(L11.he,{dragHint:'גוררים כדי לשנות סדר',seePosts:'לראות את {n} הפוסטים להעתקה'});
var sr13=sideRender;sideRender=function(){sr13();pinsRender();var sg=$('sideG');if(sg&&connected&&!sg.querySelector('[data-a=x13-mem]'))sg.insertAdjacentHTML('beforeend','<button class="sg mem13" data-a="x13-mem"'+(UI.v==='mem'?' aria-current="page"':'')+'>'+I('bulb')+'<span class="lbl">'+esc(tt('memH'))+'</span></button>');var nb=$('newD');if(nb){var l=nb.querySelector('.lbl');if(l)l.textContent=tt('newB');}var nt=$('newB');if(nt)nt.setAttribute('aria-label',tt('newH'));};
(function(){var drag=null;document.addEventListener('dragstart',function(e){var li=e.target.closest&&e.target.closest('#pins li[data-pid]');if(!li)return;drag=li.dataset.pid;try{e.dataTransfer.setData('text/plain',drag);e.dataTransfer.effectAllowed='move';}catch(x){}});
  document.addEventListener('dragover',function(e){if(drag&&e.target.closest&&e.target.closest('#pins li[data-pid]'))e.preventDefault();});
  document.addEventListener('drop',function(e){var li=e.target.closest&&e.target.closest('#pins li[data-pid]');if(!drag||!li)return;e.preventDefault();var a=projPins(),f=a.indexOf(drag),to=a.indexOf(li.dataset.pid);drag=null;if(f<0||to<0||f===to)return;a.splice(to,0,a.splice(f,1)[0]);projPinSet(a,null,null);});
  document.addEventListener('dragend',function(){drag=null;});})();

/* ---------- 3. colour: each row carries its project colour (--pc) ---------- */
function withPc(h,pid){var st=pcStyle(pid);if(!st||h.indexOf('<li')!==0)return h;st=st.replace(/^;/,'');var e=h.indexOf('>'),tag=h.slice(0,e);tag=/ style="/.test(tag)?tag.replace(/ style="/,' style="'+st+';'):tag+' style="'+st+'"';return tag+h.slice(e);}
var row13=row12;row12=function(i,num){return withPc(row13(i,num),rowPid(i));};
var qrow13=qrow12;qrow12=function(i,num,cur){return withPc(qrow13(i,num,cur),rowPid(i));};
var trow13=trow12;trow12=function(i,num,sel){return withPc(trow13(i,num,sel),rowPid(i));};
var prow13=prow12;prow12=function(p,sel){return withPc(prow13(p,sel),p.id);};

/* ---------- 1. a Next item opens right here ---------- */
function handDrafts(pid){var lim=Date.now()-7*864e5;return J8.approvals.list().filter(function(a){if(a.status!=='approved'&&a.status!=='edited')return false;if(a.kind==='application'||a.kind==='template'||/^Waiting/i.test(String(a.result||'')))return false;
  if(!/linkedin|by hand/i.test(String(a.channel||'')+' '+String(a.label||'')))return false;var d=pd(a.decided_at);if(isNaN(d)||d<lim)return false;return !pid||a.product===pid;}).sort(function(a,b){return String(b.decided_at).localeCompare(String(a.decided_at));});}
function apLine(a,copy){var tx=String(J8.approvals.textOf(a)||''),id=esc(a.id);
  return '<li class="hd13" style="'+pcStyle(a.product).replace(/^;/,'')+'"><div class="hh">'+I(dIcon(a))+'<b dir="auto">'+esc(apWho(a))+'</b><small dir="auto">'+esc(cut(String(a.channel||''),60))+'</small></div>'
   +(copy?'<p class="tx" dir="auto">'+esc(cut(tx,360))+'</p><div class="ha"><button type="button" class="b12 sm" data-a="x13-copy" data-id="'+id+'">'+I('clip')+'<span>'+esc(tt('copy'))+'</span></button>'+(/linkedin/i.test(String(a.channel||''))?'<a class="b12 sm" href="https://www.linkedin.com/feed/" target="_blank" rel="noopener">'+I('ext')+'<span>'+esc(tt('openIn',{x:'LinkedIn'}))+'</span></a>':'')+'</div>':'')+'</li>';}
function handHTML(L,head){if(!L.length)return '';return '<section class="hand13"><h4>'+I('send')+'<span>'+esc(head||tt('handH'))+'</span><span class="n12"><bdi>'+L.length+'</bdi></span></h4><p class="sub12">'+esc(tt('handP'))+'</p><ul>'+L.slice(0,12).map(function(a){return apLine(a,true);}).join('')+'</ul></section>';}
function approveLike(g){return !!(g&&g.jump&&/^(approvals|approve|list-approve|inbox|list|drafts)$/.test(String(g.jump).replace(/^\//,'')));}
function seeLabel(h,i){var g=doTarget(i);if(!(i.p&&approveLike(g)&&landsEmpty(i,g)))return h;var n=handDrafts(i.p.id).length;return n?h.replace('<span>'+esc(tt('doIt'))+'</span>','<span>'+esc(tt('seePosts',{n:n}))+'</span>'):h;}
function itemExtra(i){var g=doTarget(i);if(i.held)return '<section class="hand13"><h4>'+I('lock')+'<span>'+esc(tt('heldH'))+'</span><span class="n12"><bdi>'+i.held.items.length+'</bdi></span></h4><ul>'+i.held.items.slice(0,12).map(function(a){return apLine(a,false);}).join('')+'</ul></section>';
  if(i.p&&approveLike(g))return handHTML(handDrafts(i.p.id));return '';}
/* would "Do it" land on a list that does not show this item? then it opens here instead */
function landsEmpty(i,g){if(g.talk)return true;
  if(g.draft){var b=g.draft;return !(b.indexOf('ap:')===0?isPend(b.slice(3)):apPending().some(function(a){return bkey(a)===b;}));}
  if(!g.jump)return false;var tg=String(g.jump).replace(/^\//,'');
  if(approveLike(g))return !(i.p?firstBatch(i.p.id):firstBatch());
  if(tg.indexOf('ap-')===0)return !isPend(tg.slice(3));
  if(tg.indexOf('list-b-')===0)return !apPending().some(function(a){return bkey(a)===tg.slice(7);});
  return false;}
function itemSheetHTML(i){return '<h2 id="gTitle" class="sr">'+esc(tt('detail'))+'</h2><div class="it13" data-k="'+esc(i.key)+'" style="'+pcStyle(rowPid(i)).replace(/^;/,'')+'">'+seeLabel(taskDetail(i).replace('id="dpH"','id="itH"'),i)+itemExtra(i)+'</div>';}
function openItem(k){var i=rowByKey(k);if(!i){toast(tt('clear'));return;}
  if(D12()&&myQueue().some(function(x){return x.key===k;})){ /* 11.3: an item that is not on Next opens in a sheet on desktop too */UI.focusK=k;if(UI.v!=='next'){UI.stack=[];nav0('next');}else render();var h=$('hero12');if(h)try{h.scrollIntoView({block:'nearest'});}catch(e){}var ht=$('heroT');if(ht){ht.tabIndex=-1;ht.focus({preventScroll:true});}return;}
  UI.gsheet={k:'item13',key:k};gOpen(itemSheetHTML(lead1(i)),pcol(rowPid(i))?pcol(rowPid(i))[0]:'var(--royal)');lint($('gsheet'));}
window.j8open=openItem;
var hc13=heroCard;heroCard=function(i,ix){var h=seeLabel(hc13(i,ix),i),x=itemExtra(i);return x?h.replace(/<\/section>$/,x+'</section>'):h;};
/* "Do it" whose list would hide the item: open it here (Dave 17 Nov 14:11) */
window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('button[data-a=do]');if(!el||el.closest('#ob11'))return;var k=el.dataset.k,i=rowByKey(k);if(!i)return;var g=doTarget(i);if(!landsEmpty(i,g))return;
  e.preventDefault();e.stopPropagation();var inS=el.closest('#gsheet'),inH=el.closest('#hero12');
  if(inS||(inH&&D12())){var s=(inS||inH).querySelector('.hand13,.cb12 textarea');if(s){if(s.tagName==='TEXTAREA')s.focus();else{try{s.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(x){}var b=s.querySelector('button');if(b)b.focus({preventScroll:true});}}return;}
  openItem(k);},true);
/* actions inside the item sheet close it first (the row may leave the list) */
window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('#gsheet .it13 [data-a=done]');if(!el)return;gClose();},true);
document.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a=x13-copy]');if(!el)return;e.preventDefault();var a=AP[el.dataset.id];if(!a)return;var tx=J8.approvals.textOf(Object.assign({id:el.dataset.id},a));
  var ok=function(){var s=el.querySelector('span');if(s)s.textContent=tt('copied');toast(tt('copied'));};try{navigator.clipboard.writeText(tx).then(ok,function(){fallbackCopy(tx);ok();});}catch(x){fallbackCopy(tx);ok();}},true);
function fallbackCopy(tx){var ta=document.createElement('textarea');ta.value=tx;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}ta.remove();}

/* ---------- 2. Line up next steps (J8) ---------- */
function openGoals(){return goalsAll().filter(function(g){return !(isNum(g.pct)&&g.pct>=1);});}
function lineUpPlan(){var T=rawTasks(),openT=T.filter(function(t){return !t.status||t.status==='open';}),st=stamp(),add=[],ask=[],pf=prefs0(),iv=pf.interview||(pf.plan&&Array.isArray(pf.plan.purposes)?pf.plan:null),Q=myQueue();
  ((iv&&iv.purposes)||[]).forEach(function(pu){var S=TPL[pu]||TPL.other,have={},busy=false,pid=null,last=null;
    T.forEach(function(t){if(!(px(t,'plan')&&px(t,'purpose')===pu))return;var n=+String(px(t,'tpl')||'').split('-').pop();if(isNum(n))have[n]=t;pid=pid||t.project_id||null;if(!t.status||t.status==='open')busy=true;});
    if(busy)return;for(var k=0;k<S.length;k++){if(have[k])last=have[k];else{add.push({id:'t-plan-'+pu+'-'+(k+1)+'-'+st,doc:{project_id:pid,title:S[k][HE()?1:0],why:tt('whyPlan',{n:k+1,m:S.length,g:tt('pn_'+pu)}),minutes:S[k][2],owner:'dave',status:'open',source:'j8nix-plan',by:'J8NIX · '+tt('lineUp'),blocked_by:[],extra:{plan:true,purpose:pu,tpl:pu+'-'+k,pulled:true}}});break;}}});
  myGoalList().forEach(function(g,n){var pid=g.pid&&pobj(g.pid)?g.pid:null,has=Q.some(function(i){return pid?rowPid(i)===pid:(i.task&&px(i.task,'goal')===g.t);})||openT.some(function(t){return t.owner==='dave'&&(pid?t.project_id===pid:px(t,'goal')===g.t);})||add.some(function(a){return pid&&a.doc.project_id===pid;});
    if(has||asked13(g.t))return;ask.push({pid:pid||'p-general',g:g.t});});
  var back=Object.keys(LATER).map(function(k){return Object.assign({id:k},LATER[k]);}).filter(function(r){return (r.status==='later'||r.status==='not_needed')&&rowByKey(r.id)&&elig13(rowByKey(r.id))&&!Q.some(function(i){return i.key===r.id;});}).slice(0,5);
  var blk=rows().filter(function(i){return i.st==='stuck'&&i.task;}).map(function(i){return lead1(i);}).sort(function(a,b){return b.ul.length-a.ul.length;}).slice(0,4);
  return {add:add,ask:ask,back:back,blk:blk};}
UI.lu=null;
function lineUp(auto){if(UI.lu&&UI.lu.st==='run')return;UI.lu={st:'run',t0:Date.now(),auto:!!auto};render();
  var minT=RM()?250:1300,P=lineUpPlan(),fail=0;
  Promise.resolve(J8.status().connected?Promise.race([J8.reload(),new Promise(function(r){setTimeout(r,6000);})]).catch(function(){}):null).then(function(){P=lineUpPlan();
    return seq(P.add,function(x){return J8.tasks.add(x.id,x.doc).catch(function(e){fail++;});}).then(function(){return seq(P.ask,function(x){return J8.inbox.send(x.pid,tt('askFirst',{g:x.g})).then(function(){x.ok=1;},function(){fail++;});});});})
  .then(function(){var w=Math.max(0,minT-(Date.now()-UI.lu.t0));setTimeout(function(){var made=P.add.filter(function(x){return !!J8.tasks.get(x.id);});UI.lu={st:'done',made:made.map(function(x){return x.doc.title;}),asked:P.ask.filter(function(x){return x.ok;}).map(function(x){return x.g;}),back:P.back,blk:P.blk,fail:fail,auto:!!auto};render();
    if(made.length)toast(made.length===1?tt('lined1'):tt('linedN',{n:made.length}));else if(UI.lu.asked.length)toast(tt('askedT',{n:UI.lu.asked.length}));},w);});}
function luCard(){var L=UI.lu;if(!L)return '';
  if(L.st==='run')return '<section class="lu13 run" role="status" aria-live="polite"><span class="orb wk13" aria-hidden="true">'+w8()+'</span><div><b>'+esc(tt('lining'))+'</b></div></section>';
  var h='<section class="lu13" role="status"><header><span class="orb sm" aria-hidden="true">'+g8i()+'</span><b>'+esc(L.made.length?(L.made.length===1?tt('lined1'):tt('linedN',{n:L.made.length})):(L.asked&&L.asked.length?tt('askedT',{n:L.asked.length}):tt('linedNone')))+'</b><button class="ib12" data-a="x13-luclose" aria-label="'+esc(t('close'))+'">'+I('x')+'</button></header>';
  if(L.made.length)h+='<h4>'+esc(tt('fromGoals'))+'</h4><ul>'+L.made.map(function(x){return '<li>'+I('plus')+'<span dir="auto">'+esc(x)+'</span></li>';}).join('')+'</ul>';
  if(L.asked&&L.asked.length)h+='<h4>'+esc(tt('askedH'))+'</h4><ul>'+L.asked.map(function(g){return '<li>'+I('send')+'<span dir="auto">'+esc(tt('askedL',{g:g}))+'</span></li>';}).join('')+'</ul>';
  if(L.back.length)h+='<h4>'+esc(tt('putOff'))+'</h4><ul>'+L.back.map(function(r){var i=rowByKey(r.id);return '<li>'+I('later')+'<span dir="auto">'+esc(cap1(i?nextOf(i).what:r.title||''))+'</span><button class="b12 sm" data-a="later-now" data-k="'+esc(r.id)+'">'+esc(tt('bringBack'))+'</button></li>';}).join('')+'</ul>';
  if(L.blk.length)h+='<h4>'+esc(tt('blockedH'))+'</h4><ul>'+L.blk.map(function(i){var b=openBlk(i.task.id).map(function(x){var o=J8.tasks.get(x)||AP[x]||PR[x];return o?(o.title||o.name||apWho(Object.assign({id:x},o))):x;});return '<li>'+I('lock')+'<span dir="auto">'+esc(i.title)+'<small>'+esc(tt('waitsOn',{x:b.join(', ')}))+(i.ul.length?' · '+esc(tt('unlocks',{n:i.ul.length})):'')+'</small></span></li>';}).join('')+'</ul>';
  return h+'</section>';}
function nextGoal(){var td=ymd(new Date());return openGoals().filter(function(g){return g.day>=td;})[0]||openGoals()[0]||null;}
function emptyNext(){var G=openGoals(),L=UI.lu;
  if(G.length&&!(L&&L.st==='done'&&!L.made.length&&!L.back.length))return '<section class="hero12 empty13"><div class="eb12"><span class="dtf ai">'+g8i()+'<span>'+esc(tt('emptyNext'))+'</span></span></div><p class="ht12">'+esc(G.length===1?tt('emptyNextP1'):tt('emptyNextP',{n:G.length}))+'</p><button class="b12 pri ai lu" data-a="x13-lineup">'+I('plan')+'<span>'+esc(tt('lineUp'))+'</span></button></section>';
  var ng=nextGoal();return '<section class="hero12 alldone13"><span class="tr">'+I('trophy')+'</span><h3 class="ht12">'+esc(tt('allDone'))+'</h3><p class="sub12">'+esc(tt('allDoneP'))+'</p>'+(ng?'<p class="ng13">'+I('target')+'<bdi dir="auto">'+esc(tt('nextGoalL',{g:cut(ng.t,60),d:gDue(ng)}))+'</bdi></p><div class="bar12 two"><button class="b12 pri" data-a="'+(ng.pid?'proj':'x13-goals')+'" data-id="'+esc(ng.pid||'')+'">'+I('target')+'<span>'+esc(tt('viewGoal'))+'</span></button><button class="b12" data-a="x13-new" data-id="goal">'+I('plus')+'<span>'+esc(tt('setGoal'))+'</span></button></div>':'<div class="bar12 one"><button class="b12 pri" data-a="x13-new" data-id="goal">'+I('plus')+'<span>'+esc(tt('setGoal'))+'</span></button></div>')+'</section>';}
function obCard(){var o=prefs0();if(!connected||OB.on||o.interview||(o.plan&&Array.isArray(o.plan.purposes))||o.planAt||o.obCardOff||ls('j8-obcardoff'))return '';
  return '<section class="obc13"><span class="orb sm" aria-hidden="true">'+g8i()+'</span><div><b>'+esc(tt('obCard'))+'</b><small>'+esc(tt('obCardP'))+'</small></div><button class="b12 pri ai sm" data-a="x12-ob" data-id="0">'+esc(tt('obStart'))+'</button><button class="ib12" data-a="x13-obno" aria-label="'+esc(tt('dismiss'))+'">'+I('x')+'</button></section>';}
var vNx13=vNext;vNext=function(){var h=vNx13();if(!connected)return h;var N=myQueue(),lu='<button class="lnk12 ai" data-a="x13-lineup">'+I('plan')+'<span>'+esc(tt('lineUp'))+'</span></button>';
  h=h.indexOf('<div class="phx12">')>-1?h.replace('<div class="phx12">','<div class="phx12">'+lu):h.replace(/<\/header>/,'<div class="phx12">'+lu+'</div></header>');
  h=h.replace(/<\/header>/,'</header>'+obCard()+luCard());
  if(!N.length)h=h.replace(/<section class="hero12 clear">[\s\S]*?<\/section>/,emptyNext());
  if(!N.length&&openGoals().length&&!UI.lu&&!UI.luAuto){UI.luAuto=1;setTimeout(function(){lineUp(true);},50);}
  var c=calCard13();if(c){if(D12())h=h.replace('<div class="nfx12">','<div class="nfx12">'+c);else h=h.replace(/<\/div>$/,c+'</div>');}
  return h;};
/* Google Calendar (read-only) on Next and in Timeline */
function calRows(){var td=ymd(new Date()),end=addDays(7);return J8.calendar?J8.calendar.list().filter(function(e){if(e.extra&&e.extra.marker||e.id==='_sync')return false;var d=dday(e.starts_at);return d>=td&&d<=end;}):[];}
function calCard13(){var R=calRows();if(!J8.calendar||!J8.calendar.lastSync())return '';
  return '<section class="card12 cal13"><h3>'+I('cal')+'<span>'+esc(tt('calH'))+'</span></h3>'+(R.length?'<ul>'+R.slice(0,6).map(function(e){var d=dday(e.starts_at);return '<li><time><bdi>'+esc(d===ymd(new Date())?(e.all_day?tt('today'):dtime(e.starts_at)):dayShort(new Date(d+'T12:00:00'))+(e.all_day?'':' '+dtime(e.starts_at)))+'</bdi></time><span dir="auto">'+esc(cut(e.title,60))+'</span></li>';}).join('')+'</ul>':'<p class="sub12">'+esc(tt('calNone'))+'</p>')
   +'<p class="src13">'+esc(tt('c_cal'))+' · '+esc(tt('c_calLast',{t:tm1(J8.calendar.lastSync())}))+'</p></section>';}
var ev13=events;events=function(){var E=ev13();if(FF.o==='team'||FF.o==='ext'||FF.b||FF.u!=='all')return E;calRows().forEach(function(e){E.push({day:dday(e.starts_at),time:e.all_day?'':dtime(e.starts_at),k:'cal',who:'me',title:e.title,sub:'Google Calendar',pid:null,id:'cal-'+e.id,jump:'calendar'});});return E;};

/* ---------- 5. + New ---------- */
function curProj(){return (UI.v==='proj'||UI.v==='projects')&&UI.proj&&pobj(UI.proj)?UI.proj:null;}
function projOpts(sel){return '<option value="">'+esc(tt('fNone'))+'</option>'+liveP().filter(function(p){return !isDoneP(p);}).map(function(p){return '<option value="'+esc(p.id)+'"'+(p.id===sel?' selected':'')+'>'+esc(cut(p.name,50))+'</option>';}).join('');}
function newSheet(){UI.gsheet={k:'new13'};var adm=J8.orgs.can('admin');
  var O=[['goal','target','nGoal','nGoalP'],adm?['project','proj','nProj','nProjP']:['reqproj','proj','nReqProj','nReqProjP'],['step','steps','nStep','nStepP'],['note','chat','nNote','nNoteP'],['memnote','clip','nNoteM','nNoteMP'],['draft','mail','nDraft','nDraftP'],['plan','plan','nPlan','nPlanP']];
  gOpen('<h2 id="gTitle">'+esc(tt('newH'))+'</h2><div class="nw13">'+O.map(function(o){return '<button class="nwo13 k-'+o[0]+'" data-a="x13-new" data-id="'+o[0]+'"><span class="well11 r">'+I(o[1])+'</span><span><b>'+esc(tt(o[2]))+'</b><small>'+esc(tt(o[3]))+'</small></span>'+I('fwd','flip chev')+'</button>';}).join('')+'</div>','var(--royal)');}
function fl(id,lab,inner){return '<label class="fl12" for="'+id+'"><span>'+esc(lab)+'</span>'+inner+'</label>';}
function inp(id,o){o=o||{};return '<input id="'+id+'" name="'+id+'"'+(o.type?' type="'+o.type+'"':'')+(o.req?' required':'')+(o.max?' maxlength="'+o.max+'"':'')+(o.min!=null?' min="'+o.min+'"':'')+' dir="'+(o.type==='date'||o.type==='number'?'ltr':'auto')+'" value="'+esc(o.v==null?'':o.v)+'"'+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+'>';}
function newForm(kind,ed){var cp=curProj(),h='',title={goal:'nGoal',project:'nProj',reqproj:'nReqProj',step:'nStep',note:'nNote',memnote:'nNoteM',draft:'nDraft'}[kind];ed=ed||{};
  if(kind==='goal')h=fl('n13t',tt('fGoalT'),inp('n13t',{req:1,max:140,ph:tt('fGoalPh'),v:ed.t}))+fl('n13n',tt('fNum'),inp('n13n',{max:40,v:ed.n}))+fl('n13d',tt('fDue'),inp('n13d',{type:'date',req:1,v:ed.at||addDays(7)}))+fl('n13p',tt('fProj'),'<select id="n13p">'+projOpts(ed.pid!==undefined?ed.pid:cp)+'</select>');
  else if(kind==='project'){var G=myGoalList();h=fl('n13t',tt('fName'),inp('n13t',{req:1,max:80}))+fl('n13g',tt('fGoalL'),'<select id="n13g"><option value="">'+esc(tt('fNone'))+'</option>'+G.map(function(g,j){return '<option value="'+j+'">'+esc(cut(g.t,60))+'</option>';}).join('')+'</select>')+fl('n13m',tt('fMs'),inp('n13m',{max:140}))+fl('n13d',tt('fMsAt'),inp('n13d',{type:'date',v:addDays(7)}));}
  else if(kind==='reqproj')h=fl('n13t',tt('fName'),inp('n13t',{req:1,max:80}))+fl('n13x',tt('fText'),'<textarea id="n13x" rows="3" dir="auto"></textarea>');
  else if(kind==='step'){var S=rawTasks().filter(function(x){return (!x.status||x.status==='open')&&x.owner==='dave';});h=fl('n13t',tt('fStepT'),inp('n13t',{req:1,max:140,ph:tt('fStepPh')}))+fl('n13m',tt('fMins'),inp('n13m',{type:'number',min:1,v:15}))+fl('n13d',tt('fDue'),inp('n13d',{type:'date',v:addDays(7)}))+fl('n13p',tt('fProj'),'<select id="n13p">'+projOpts(cp)+'</select>')
    +fl('n13b',tt('fAfter'),'<select id="n13b"><option value="">'+esc(tt('fNoBlock'))+'</option>'+S.map(function(x){return '<option value="'+esc(x.id)+'">'+esc(cut(x.title,60))+'</option>';}).join('')+'</select>');}
  else if(kind==='note')h=fl('n13x',tt('fText'),'<textarea id="n13x" rows="4" required dir="auto"></textarea>')+fl('n13p',tt('fProj'),'<select id="n13p">'+projOpts(cp)+'</select>');
  else if(kind==='memnote')h=fl('n13x',tt('fText'),'<textarea id="n13x" rows="4" required dir="auto"></textarea>')+fl('n13k',tt('fKind'),'<select id="n13k"><option value="fact">'+esc(tt('kd_fact'))+'</option><option value="idea">'+esc(tt('kd_idea'))+'</option></select>')+fl('n13g',tt('fTags'),inp('n13g',{max:200}))+fl('n13p',tt('fProj'),'<select id="n13p">'+projOpts(cp)+'</select>');
  else if(kind==='draft')h=fl('n13to',tt('fTo'),inp('n13to',{req:1,max:120,ph:tt('fToPh'),v:ed.to}))+fl('n13c',tt('fChan'),'<select id="n13c">'+[['email','chEmail'],['linkedin','chLi'],['other','chOther']].map(function(c){return '<option value="'+c[0]+'"'+(ed.ch===c[0]?' selected':'')+'>'+esc(tt(c[1]))+'</option>';}).join('')+'</select>')+fl('n13x',tt('fIdea'),'<textarea id="n13x" rows="4" required dir="auto">'+esc(ed.body||'')+'</textarea>')+fl('n13p',tt('fProj'),'<select id="n13p">'+projOpts(ed.pid!==undefined?ed.pid:cp)+'</select>');
  UI.gsheet={k:'new13f'};gOpen('<h2 id="gTitle">'+esc(tt(title))+'</h2><form id="nf13" class="ed12" data-kind="'+kind+'"'+(ed.edit!=null?' data-edit="'+esc(ed.edit)+'"':'')+' novalidate>'+h+'<p class="err13" id="n13e" role="alert"></p><div class="obnav"><button type="button" class="btn11" data-a="x13-new" data-id="">'+esc(tt('back'))+'</button><button type="submit" class="btn11 pri grow">'+I('check')+'<span>'+esc(ed.edit!=null?tt('save'):tt('create'))+'</span></button></div></form>','var(--royal)');
  var f=$('n13t')||$('n13to')||$('n13x');if(f)setTimeout(function(){f.focus();},60);}
function v13(id){var e=$(id);return e?String(e.value||'').trim():'';}
function made(kind,msg,view,extra){UI.gsheet={k:'made13'};toast(msg);render();
  gOpen('<h2 id="gTitle">'+I('check')+'<span>'+esc(msg)+'</span></h2><div class="mk13">'+(view?'<button class="btn11 pri" data-a="x13-view" data-id="'+esc(view)+'">'+I('eye')+'<span>'+esc(tt('view'))+'</span></button>':'')+(extra||'')+'<button class="btn11" data-a="x13-new" data-id="">'+I('plus')+'<span>'+esc(tt('another'))+'</span></button></div>','var(--done)');}
document.addEventListener('submit',function(e){var f=e.target;if(!f||f.id!=='nf13')return;e.preventDefault();var kind=f.dataset.kind,er=$('n13e'),st=stamp(),pid=v13('n13p')||null,go=f.querySelector('[type=submit]');
  var bad=function(m){if(er)er.textContent=m;};var need=[].filter.call(f.querySelectorAll('[required]'),function(x){return !String(x.value||'').trim();});if(need.length){bad(HE()?'חסר שדה חובה.':'Fill in the required field.');need[0].focus();return;}
  if((!J8.status().connected||navigator.onLine===false)&&kind!=='goal'){bad(t('notConn'));return;}if(go)go.disabled=true;
  var fail=function(x){if(go)go.disabled=false;var m=(x&&(x.message||x.code))||'error';bad(navigator.onLine===false||/fetch|network/i.test(m)?t('notConn'):t('couldNot',{e:m}));};
  if(kind==='goal'){var G=myGoalList(),g={t:v13('n13t')+(v13('n13n')?' · '+v13('n13n'):''),at:v13('n13d'),pid:pid,src:'app'};if(f.dataset.edit!=null){G[+f.dataset.edit]=g;}else G.push(g);G=G.slice(-10);
    prefSet({goals:G},{'j8-goals':G}).then(function(){made('goal',tt('madeGoal'),'goals','<button class="btn11 ai" data-a="x12-ob" data-id="0">'+I('plan')+'<span>'+esc(tt('planIt'))+'</span></button>');});return;}
  if(kind==='project'){var gi=v13('n13g'),G2=myGoalList(),gg=gi!==''?G2[+gi]:null,ms=v13('n13m')||(gg?gg.t:''),at=v13('n13d')||(gg?gg.at:''),id='p-app-'+st;
    J8.projects.add(id,{name:v13('n13t'),stage:1,status:'active',order:70,now:'',milestone:ms||null,milestone_at:ms&&at?at:null,milestone_by:ms?'dave':null,milestone_src:ms?'J8NIX app · '+ymd(new Date()):null,extra:{app:true,goal:gg?gg.t:null}})
     .then(function(){if(gg){gg.pid=id;G2[+gi]=gg;prefSet({goals:G2},{'j8-goals':G2});}made('project',tt('madeProj'),'p:'+id);},fail);return;}
  if(kind==='reqproj'){J8.inbox.send('p-general',(HE()?'בקשה לפרויקט חדש: ':'Request a project: ')+v13('n13t')+(v13('n13x')?'. '+v13('n13x'):'')).then(function(){made('note',tt('madeReq'),'chat');},fail);return;}
  if(kind==='step'){var id2='t-app-'+st,b=v13('n13b');J8.tasks.add(id2,{project_id:pid,title:v13('n13t'),minutes:Math.max(1,Math.min(600,+v13('n13m')||15)),due:v13('n13d')||null,owner:'dave',status:'open',source:'j8nix-app',by:'J8NIX app',blocked_by:b?[b]:[],extra:{app:true}})
     .then(function(){made('step',tt('madeStep'),'tk-'+id2);},fail);return;}
  if(kind==='note'){J8.inbox.send(pid||'p-general',v13('n13x')).then(function(){made('note',tt('madeNote'),'chat');},fail);return;}
  if(kind==='memnote'){J8.memory.add({kind:v13('n13k')==='idea'?'idea':'fact',text:v13('n13x'),tags:tagsOf(v13('n13g')),project_id:pid,source_message_id:null}).then(function(){made('memnote',tt('madeMem'),'mem');},fail);return;}
  if(kind==='draft'){var ch=v13('n13c'),old=f.dataset.edit,id3='ap-app-'+st;J8.approvals.addIdea(id3,{to:v13('n13to'),channel:ch==='linkedin'?'LinkedIn (you send by hand)':ch==='email'?'Email':'Other',body:v13('n13x'),product:pid||'p-general',label:'Idea from you',warn:'Your idea: J8 rewrites it before it can go out.'})
     .then(function(){if(old&&isPend(old))J8.approvals.kill(old).catch(function(){});made('draft',tt('madeDraft'),'drafts');},fail);return;}},true);
function goalsSheet(){UI.gsheet={k:'goals13'};var G=myGoalList();
  gOpen('<h2 id="gTitle">'+esc(tt('yourGoals'))+'</h2>'+(G.length?'<ul class="gm13">'+G.map(function(g,j){var p=g.pid&&pobj(g.pid);return '<li><span dir="auto"><b>'+esc(g.t)+'</b><small><bdi>'+esc(g.at||'')+'</bdi>'+(p?' · '+esc(p.name):'')+'</small></span><button class="ib12" data-a="x13-gedit" data-id="'+j+'" aria-label="'+esc(tt('editIt')+': '+g.t)+'">'+I('edit')+'</button><button class="ib12 kill" data-a="x13-gdel" data-id="'+j+'" aria-label="'+esc(tt('del')+': '+g.t)+'">'+I('kill')+'</button></li>';}).join('')+'</ul>':'<p class="sub12">'+esc(tt('noMyGoals'))+'</p>')
   +'<div class="obnav"><button class="btn11" data-a="gclose">'+esc(t('close'))+'</button><button class="btn11 pri grow" data-a="x13-new" data-id="goal">'+I('plus')+'<span>'+esc(tt('nGoal'))+'</span></button></div>','var(--ai)');}
/* edit sheets: delete a step you added, remove a project you added */
var es13=editSheet;editSheet=function(kind,id){es13(kind,id);var o=kind==='t'?J8.tasks.get(id):pobj(id),nav=document.querySelector('#ed12 .obnav');if(!o||!nav)return;
  if(kind==='t'&&(o.source==='j8nix-app'||o.source==='j8nix-plan'))nav.insertAdjacentHTML('beforebegin','<button type="button" class="lnk del13" data-a="x13-tdel" data-id="'+esc(id)+'">'+I('kill')+'<span>'+esc(tt('delStep'))+'</span></button>');
  if(kind==='p'&&px(o,'app')&&J8.orgs.can('admin'))nav.insertAdjacentHTML('beforebegin','<button type="button" class="lnk del13" data-a="x13-pdel" data-id="'+esc(id)+'">'+I('kill')+'<span>'+esc(tt('remProj'))+'</span></button>');};

/* ---------- List: never a dead end ---------- */
function ideasHTML(){var L=J8.approvals.ideas?J8.approvals.ideas():[];if(!L.length)return '';
  return '<section class="hand13 idea13"><h4>'+I('mail')+'<span>'+esc(tt('ideasH'))+'</span><span class="n12"><bdi>'+L.length+'</bdi></span></h4><p class="sub12">'+esc(tt('ideaWait'))+'</p><ul>'+L.map(function(a){return '<li class="hd13"><div class="hh">'+I(dIcon(a))+'<b dir="auto">'+esc(apWho(a))+'</b><small dir="auto">'+esc(a.channel||'')+'</small></div><p class="tx" dir="auto">'+esc(cut(J8.approvals.textOf(a),240))+'</p><div class="ha"><button class="b12 sm" data-a="x13-iedit" data-id="'+esc(a.id)+'">'+I('edit')+'<span>'+esc(tt('editIt'))+'</span></button><button class="b12 sm kill" data-a="x13-idel" data-id="'+esc(a.id)+'">'+I('kill')+'<span>'+esc(tt('del'))+'</span></button></div></li>';}).join('')+'</ul></section>';}
function newCTA(kind,lab){return '<button class="b12 pri sm cta13" data-a="x13-new" data-id="'+kind+'">'+I('plus')+'<span>'+esc(lab)+'</span></button>';}
function listExtra(seg){if(!connected)return '';var adm=J8.orgs.can('admin');
  if(seg==='drafts'){var none=!apPending().length;return '<div class="lx13">'+(none?'<section class="empty12 e13">'+I('done')+'<span>'+esc(tt('noDrafts'))+'</span>'+newCTA('draft',tt('emptyDraftsA'))+'</section>':'')+ideasHTML()+handHTML(handDrafts(null))+'</div>';}
  if(seg==='proj'&&!liveP().filter(function(p){return !isDoneP(p);}).length)return '<div class="lx13"><section class="empty12 e13">'+I('proj')+'<span>'+esc(tt('emptyProj'))+'</span>'+newCTA(adm?'project':'reqproj',adm?tt('emptyProjA'):tt('nReqProj'))+'</section></div>';
  if(seg==='tasks'&&!myQueue().length)return '<div class="lx13"><section class="empty12 e13">'+I('steps')+'<span>'+esc(tt('emptyNext'))+'</span><button class="b12 pri ai sm cta13" data-a="x13-lineup">'+I('plan')+'<span>'+esc(tt('lineUp'))+'</span></button>'+newCTA('step',tt('nStep'))+'</section></div>';
  return '';}
var lw13=listWrap;listWrap=function(seg,html){var h=lw13(seg,html);return D12()?h:h+listExtra(seg==='drafts'?'drafts':'proj');}; /* desktop: listD puts it inside the list pane */
var ld13=listD;listD=function(seg){var h=ld13(seg),x=listExtra(seg);if(!x)return h;var j=h.indexOf('</section><section class="dp12');if(j<0)return h+x; /* desktop: inside the list pane, under the list */
  var i=h.lastIndexOf('<section class="ml12',j),body=h.slice(i,j);if(/<p class="empty12">/.test(body)&&/class="e13/.test(x))body=body.replace(/<p class="empty12">[\s\S]*?<\/p>/,'');return h.slice(0,i)+body+x+h.slice(j);};

/* ---------- 6. Connections: every line honest and useful ---------- */
var vMe13=vMe;vMe=function(){var h=vMe13();if(!connected)return h;var m=J8.money.summary(),ctl=J8.control.get()||{},st=J8.status(),ms=J8.tasks.get('t-morning-signin'),ls0=J8.calendar?J8.calendar.lastSync():null;
  var row=function(name,txt,on,btn,cls){return '<li class="cr'+(cls?' '+cls:'')+'"><span class="cl">'+esc(name.charAt(0))+'</span><span class="rt"><b>'+esc(name)+'</b><span class="sub '+(on?'on':'')+'">'+(on?I('check'):'')+'<bdi dir="auto">'+esc(txt)+'</bdi></span></span>'+(btn||'')+'</li>';};
  var pay=ms&&(!ms.status||ms.status==='open')?row(t('xCPay'),tt('c_payWait'),false,'<button class="btn" data-a="x13-view" data-id="tk-t-morning-signin">'+esc(tt('open2')||t('xOpen'))+'</button>','att'):row(t('xCPay'),ms&&ms.done_at?tt('c_payDone',{t:tm1(ms.done_at)}):(HE()?'Morning, Grow: לא מחוברים':'Morning, Grow: not connected'),!!(ms&&ms.done_at));
  var L=row(t('xCData'),st.connected?t('xCOn')+' · '+asOfTxt():t('xCOff'),st.connected,st.connected?'':'<button class="btn" data-a="retry">'+t('tryAgain')+'</button>')
   +row(t('xCMail'),ctl.email_from_ok?t('xCMailOn'):t('xCMailOff'),!!ctl.email_from_ok,'<button class="btn" data-cx="open">'+t('xManage')+'</button>')
   +row(t('xCMoney'),m&&m.updated?tt('c_money',{t:tm1(m.updated)}):tt('c_moneyNone'),!!(m&&m.updated),m?'<button class="btn" data-a="nav" data-id="money">'+t('xOpen')+'</button>':'')
   +row(t('xCCal'),tt('c_cal')+' · '+(ls0?tt('c_calLast',{t:tm1(ls0)}):tt('c_calNever')),!!ls0,'<button class="btn" data-a="nav" data-id="calendar">'+t('xOpen')+'</button>')
   +pay+row(t('xCLi'),tt('c_li'),true,'')+row(t('xCWa'),tt('c_wa'),false,'');
  h=h.replace(/<ul class="conns">[\s\S]*?<\/ul>/,'<ul class="conns">'+L+'</ul>');
  return h.replace('<section class="mesec"><h3 class="h3">'+esc(t('xPrefs'))+'</h3>','<section class="mesec"><h3 class="h3">'+esc(tt('yourGoals'))+'</h3><button class="opt" data-a="x13-goals">'+I('target')+'<span>'+esc(tt('editGoals'))+'</span></button><button class="opt" data-a="x13-mem">'+I('bulb')+'<span>'+esc(tt('memH'))+'</span></button><button class="opt" data-a="x12-ob" data-id="0">'+I('plan')+'<span>'+esc(prefs0().interview||prefs0().planAt?tt('tour'):tt('obCard'))+'</span></button></section><section class="mesec"><h3 class="h3">'+esc(t('xPrefs'))+'</h3>');};
Object.assign(L11.en,{open2:'Open'});Object.assign(L11.he,{open2:'לפתוח'});

/* ---------- actions ---------- */
window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a^="x13-"]');if(!el)return;e.preventDefault();e.stopPropagation();var a=el.dataset.a,id=el.dataset.id||'';
  if(a==='x13-new'){if(!id){newSheet();return;}if(id==='plan'){gClose();obOpen(0);return;}newForm(id);return;}
  if(a==='x13-lineup'){gClose();if(UI.v!=='next'&&UI.v!=='ltasks')nav0('next');lineUp(false);return;}
  if(a==='x13-luclose'){UI.lu=null;render();return;}
  if(a==='x13-obno'){prefSet({obCardOff:new Date().toISOString()},{'j8-obcardoff':1});render();return;}
  if(a==='x13-goals'){goalsSheet();return;}
  if(a==='x13-gedit'){var G=myGoalList(),g=G[+id];if(!g)return;var mm=String(g.t).split(' · ');newForm('goal',{edit:+id,t:mm[0],n:mm.slice(1).join(' · '),at:g.at,pid:g.pid||''});return;}
  if(a==='x13-gdel'){var G2=myGoalList(),gone=G2.splice(+id,1)[0];prefSet({goals:G2},{'j8-goals':G2}).then(function(){goalsSheet();render();toast(tt('deleted'),function(){var G3=myGoalList();G3.splice(+id,0,gone);prefSet({goals:G3},{'j8-goals':G3}).then(function(){render();});});});return;}
  if(a==='x13-tdel'){J8.tasks.drop(id).then(function(){gClose();toast(tt('deleted'),function(){J8.tasks.undo(id);});render();},function(x){toast(t('couldNot',{e:x&&x.code||'error'}));});return;}
  if(a==='x13-pdel'){J8.projects.edit(id,{hidden:true}).then(function(){gClose();UI.proj=null;toast(tt('deleted'),function(){J8.projects.edit(id,{hidden:false});});nav0('projects');},function(x){toast(t('couldNot',{e:x&&x.code||'error'}));});return;}
  if(a==='x13-iedit'){var ap=AP[id];if(!ap)return;newForm('draft',{edit:id,to:ap.to,ch:/linkedin/i.test(ap.channel||'')?'linkedin':/mail/i.test(ap.channel||'')?'email':'other',body:J8.approvals.textOf(ap),pid:ap.product==='p-general'?'':ap.product});return;}
  if(a==='x13-idel'){J8.approvals.kill(id).then(function(){toast(tt('deleted'));render();},function(x){toast(t('couldNot',{e:x&&x.code||'error'}));});return;}
  if(a==='x13-ppin'){projPinToggle(id);return;}
  if(a==='x13-pmenu'){UI.pmenu=UI.pmenu===id?null:id;pinsRender();var b=document.querySelector('#pins [data-a=x13-punpin]');if(b)b.focus();return;}
  if(a==='x13-punpin'){UI.pmenu=null;var A1=projPins();projPinSet(A1.filter(function(x){return x!==id;}),id,false);return;}
  if(a==='x13-pup'||a==='x13-pdown'){var A2=projPins(),i=A2.indexOf(id),j=i+(a==='x13-pup'?-1:1);if(i<0||j<0||j>=A2.length)return;A2.splice(j,0,A2.splice(i,1)[0]);UI.pmenu=id;projPinSet(A2,null,null);return;}
  if(a==='x13-view'){gClose();if(id==='goals'){if(D12())render();else nav0('next');goalsSheet();return;}if(id==='chat'){nav0('chat');return;}if(id==='mem'){UI.memSrc=null;UI.stack=[{v:UI.v}];UI.v='mem';render(true);return;}if(id==='drafts'){UI.lseg='drafts';UI.stack=[];navTo('list');return;}
    if(id.indexOf('p:')===0){UI.stack=[];openProj(id.slice(2));return;}if(id.indexOf('tk-')===0){if(UI.v!=='next')nav0('next');setTimeout(function(){openItem(id);},30);return;}return;}},true);
/* N = New (desktop keyboard, like the other single-key shortcuts) */
document.addEventListener('keydown',function(e){var x=e.target;if(e.key!=='n'&&e.key!=='N')return;if(x&&(/^(INPUT|TEXTAREA|SELECT)$/.test(x.tagName)||x.isContentEditable)||e.metaKey||e.ctrlKey||e.altKey||OB.on||!$('gsheet').hidden||!$('sheet').hidden||$('app').hidden||!D12())return;e.preventDefault();newSheet();});
/* ⌘K: New … items */
var ai13=askItems;askItems=function(q){var R=ai13(q),Q=String(q||'').trim().toLowerCase(),nw=HE()?'חדש':'New';
  [['goal','target','nGoal'],[J8.orgs.can('admin')?'project':'reqproj','proj',J8.orgs.can('admin')?'nProj':'nReqProj'],['step','steps','nStep'],['note','chat','nNote'],['draft','mail','nDraft'],['plan','plan','nPlan'],['lineup','plan','lineUp']].forEach(function(a){var l=a[0]==='lineup'||a[0]==='plan'||a[0]==='reqproj'?tt(a[2]):nw+' '+tt(a[2]).toLowerCase();if(HE()&&a[0]!=='lineup'&&a[0]!=='plan'&&a[0]!=='reqproj')l=tt(a[2])+' '+nw;if(!Q||l.toLowerCase().indexOf(Q)>-1)R.unshift({g:'acts',id:'act:new-'+a[0],ic:a[1],l:l});});return R.slice(0,16);};
var ac13=askCmd;askCmd=function(id){var m=String(id).match(/^act:new-(\w+)$/);if(!m)return ac13(id);gClose();if(m[1]==='lineup'){if(UI.v!=='next')nav0('next');lineUp(false);}else if(m[1]==='plan')obOpen(0);else setTimeout(function(){newForm(m[1]);},20);};
/* keep the item sheet true to the data; close it when its item has left */
var r13=render;render=function(focus){r13(focus);var s=$('gsheet');if(UI.gsheet&&UI.gsheet.k==='item13'&&s&&!s.hidden&&!s.contains(document.activeElement&&document.activeElement.tagName==='TEXTAREA'?document.activeElement:null)){var i=rowByKey(UI.gsheet.key);if(!i)gClose();else{var y=s.scrollTop;s.innerHTML='<div class="grab" aria-hidden="true"></div>'+itemSheetHTML(lead1(i));s.scrollTop=y;lint(s);}}
  pinsRender();var nb=$('newB');if(nb)nb.hidden=!connected;};

/* ---------- 8. What J8 remembers (j8_memory) + a rules-based hint in the chat composer (not live AI) ---------- */
Object.assign(L11.en,{memH:'What J8 remembers',memSub:'{n} items · from your messages and notes',memNone:'Nothing yet. When you tell J8 a decision, a fact about the business, a preference, a person or an idea, the team run saves it here, with keyword tags and a link to your message. You can also add a Note from + New.',
  memQ:'Search memory',memArch:'Show archived',memArchd:'Archived',archive:'Archive',unarchive:'Restore',forget:'Forget',forgetQ:'Forget this for good?',forgetP:'J8 deletes it and will not use it again.',forgotT:'Forgotten',archT:'Archived',
  fromMsg:'From your message · {t}',k_fact:'Facts',k_decision:'Decisions',k_preference:'Preferences',k_goal:'Goals',k_idea:'Ideas',k_person:'People',k_keyword:'Keywords',k_todo:'To-dos',
  noted:'J8 noted: {x}',notedN:'J8 noted {n} things: {x}',nNoteM:'Note',nNoteMP:'Something J8 should remember: a fact or an idea.',fKind:'Kind',kd_fact:'Fact',kd_idea:'Idea',fTags:'Keywords (comma separated, optional)',madeMem:'Saved to what J8 remembers',
  nNote:'Message to J8',hintTask:'Looks like a task · Create it?',hintGoal:'Goal? · Set it',hintIdea:'An idea · Save it',hintDec:'A decision · Save it',hintNote:'Save as a note',savedNote:'Saved as a note',hintWhy:'A quick guess from keywords, not AI',memNoMatch:'Nothing matches.'});
Object.assign(L11.he,{memH:'מה J8 זוכר',memSub:'{n} פריטים · מההודעות וההערות שלך',memNone:'עוד אין כלום. כשמספרים ל־J8 החלטה, עובדה על העסק, העדפה, אדם או רעיון, ריצת הצוות שומרת את זה כאן, עם תגיות ומילות מפתח וקישור להודעה. אפשר גם להוסיף הערה מ־+ חדש.',
  memQ:'חיפוש בזיכרון',memArch:'להציג ארכיון',memArchd:'בארכיון',archive:'לארכיון',unarchive:'לשחזר',forget:'לשכוח',forgetQ:'לשכוח את זה לגמרי?',forgetP:'J8 מוחק את זה ולא ישתמש בזה שוב.',forgotT:'נשכח',archT:'הועבר לארכיון',
  fromMsg:'מההודעה שלך · {t}',k_fact:'עובדות',k_decision:'החלטות',k_preference:'העדפות',k_goal:'יעדים',k_idea:'רעיונות',k_person:'אנשים',k_keyword:'מילות מפתח',k_todo:'משימות',
  noted:'J8 רשם: {x}',notedN:'J8 רשם {n} דברים: {x}',nNoteM:'הערה',nNoteMP:'משהו ש־J8 צריך לזכור: עובדה או רעיון.',fKind:'סוג',kd_fact:'עובדה',kd_idea:'רעיון',fTags:'מילות מפתח (מופרדות בפסיק, לא חובה)',madeMem:'נשמר במה ש־J8 זוכר',
  nNote:'הודעה ל־J8',hintTask:'נראה כמו משימה · ליצור?',hintGoal:'יעד? · להגדיר',hintIdea:'רעיון · לשמור',hintDec:'החלטה · לשמור',hintNote:'לשמור כהערה',savedNote:'נשמר כהערה',hintWhy:'ניחוש מהיר לפי מילים, לא AI',memNoMatch:'אין התאמות.'});
var MK=['decision','goal','fact','preference','idea','person','todo','keyword'];
var TAGC=['sky','money','ai','done','royal','urgent'];
function tagCls(s){var h=0;String(s).split('').forEach(function(c){h=(h*31+c.charCodeAt(0))>>>0;});return 'tg-'+TAGC[h%TAGC.length];}
function memAll(){return J8.memory?J8.memory.list(true):[];}
function memRow(m){var src=m.source_message_id?J8.inbox.list().filter(function(x){return x.id===m.source_message_id;})[0]:null,p=m.project_id&&pobj(m.project_id),id=esc(m.id);
  return '<li class="mr13'+(m.archived?' arch':'')+'" data-mid="'+id+'" data-q="'+esc((m.text+' '+(m.tags||[]).join(' ')+' '+(p?p.name:'')).toLowerCase())+'"><p dir="auto">'+esc(m.text)+'</p>'
   +((m.tags||[]).length||p?'<p class="tags13">'+(p?'<span class="chip12 sm pj" style="'+pcStyle(p.id).replace(/^;/,'')+'">'+pm(p.id)+'<bdi dir="auto">'+esc(cut(p.name,30))+'</bdi></span>':'')+(m.tags||[]).map(function(g){return '<span class="chip12 sm '+tagCls(g)+'"><bdi dir="auto">'+esc(g)+'</bdi></span>';}).join('')+'</p>':'')
   +'<div class="ma13">'+(src?'<button class="lnk" data-a="x13-msrc" data-id="'+esc(src.id)+'">'+I('chat')+'<span>'+esc(tt('fromMsg',{t:tm1(src.at)}))+'</span></button>':'<span class="sub12">'+esc(tm1(m.updated_at||m.created_at))+'</span>')
   +'<span class="sp"></span><button class="ib12" data-a="x13-medit" data-id="'+id+'" aria-label="'+esc(tt('editIt'))+'" title="'+esc(tt('editIt'))+'">'+I('edit')+'</button><button class="ib12" data-a="x13-march" data-id="'+id+'" aria-label="'+esc(m.archived?tt('unarchive'):tt('archive'))+'" title="'+esc(m.archived?tt('unarchive'):tt('archive'))+'">'+I(m.archived?'undo':'eyeoff')+'</button><button class="ib12 kill" data-a="x13-mforget" data-id="'+id+'" aria-label="'+esc(tt('forget'))+'" title="'+esc(tt('forget'))+'">'+I('kill')+'</button></div></li>';}
function vMem(){var A=memAll(),show=A.filter(function(m){return UI.memArch||!m.archived;}),src=UI.memSrc;if(src)show=show.filter(function(m){return m.source_message_id===src;});
  var h=ph(tt('memH'),esc(tt('memSub',{n:A.filter(function(m){return !m.archived;}).length})),'<div class="phx12"><button class="lnk12" data-a="x13-new" data-id="memnote">'+I('plus')+'<span>'+esc(tt('nNoteM'))+'</span></button></div>');
  if(!connected)return h+skel(4);
  h+='<div class="mq13"><label class="sr" for="memQ">'+esc(tt('memQ'))+'</label>'+I('search')+'<input id="memQ" type="search" dir="auto" placeholder="'+esc(tt('memQ'))+'" value="'+esc(UI.memQ||'')+'"><label class="ck13"><input type="checkbox" data-a13="march" '+(UI.memArch?'checked':'')+'><span>'+esc(tt('memArch'))+'</span></label></div>';
  if(src)h+='<p class="sub12">'+I('chat')+' <button class="lnk" data-a="x13-memall">'+esc(t('xBack'))+'</button></p>';
  if(!A.length)return h+'<section class="empty12 e13 mem0">'+g8i()+'<span>'+esc(tt('memNone'))+'</span>'+newCTA('memnote',tt('nNoteM'))+'</section>';
  var by={};show.forEach(function(m){var k=MK.indexOf(m.kind)>-1?m.kind:'fact';(by[k]=by[k]||[]).push(m);});
  h+='<div class="mem13">'+MK.filter(function(k){return by[k];}).map(function(k){return '<section class="mk13 k-'+k+'"><h3 class="sh12">'+esc(tt('k_'+k))+' <span class="n12"><bdi>'+by[k].length+'</bdi></span></h3><ul>'+by[k].map(memRow).join('')+'</ul></section>';}).join('')+'</div><p class="empty12 e13" id="memNo" hidden>'+esc(tt('memNoMatch'))+'</p>';
  return h;}
function memFilter(){var q=String(UI.memQ||'').trim().toLowerCase(),n=0;[].forEach.call(document.querySelectorAll('#main .mr13'),function(li){var on=!q||li.dataset.q.indexOf(q)>-1;li.hidden=!on;if(on)n++;});[].forEach.call(document.querySelectorAll('#main .mk13'),function(s){s.hidden=!s.querySelector('.mr13:not([hidden])');});var no=$('memNo');if(no)no.hidden=n>0||!document.querySelector('#main .mr13');}
PLACE.mem='me';
var vN13b=vNext;vNext=function(){return UI.v==='mem'?vMem():vN13b();};
document.addEventListener('input',function(e){if(e.target&&e.target.id==='memQ'){UI.memQ=e.target.value;memFilter();}});
document.addEventListener('change',function(e){var x=e.target;if(x&&x.dataset&&x.dataset.a13==='march'){UI.memArch=x.checked;render();}});
function memSheet(m){UI.gsheet={k:'mem13'};gOpen('<h2 id="gTitle">'+esc(tt('editIt'))+'</h2><form id="mf13" class="ed12" data-id="'+esc(m.id)+'">'+fl('m13x',tt('fText'),'<textarea id="m13x" rows="4" required dir="auto">'+esc(m.text)+'</textarea>')
  +fl('m13k',tt('fKind'),'<select id="m13k">'+MK.map(function(k){return '<option value="'+k+'"'+(m.kind===k?' selected':'')+'>'+esc(tt('k_'+k))+'</option>';}).join('')+'</select>')+fl('m13g',tt('fTags'),inp('m13g',{max:200,v:(m.tags||[]).join(', ')}))
  +'<p class="err13" id="m13e" role="alert"></p><div class="obnav"><button type="button" class="btn11" data-a="gclose">'+esc(t('close'))+'</button><button type="submit" class="btn11 pri grow">'+I('check')+'<span>'+esc(tt('save'))+'</span></button></div></form>','var(--ai)');}
function tagsOf(s){return String(s||'').split(/[,،]/).map(function(x){return x.trim().toLowerCase();}).filter(Boolean).slice(0,8);}
document.addEventListener('submit',function(e){var f=e.target;if(!f||f.id!=='mf13')return;e.preventDefault();var id=f.dataset.id,tx=v13('m13x');if(!tx){$('m13e').textContent=HE()?'חסר טקסט.':'Write something first.';return;}
  J8.memory.edit(id,{text:tx,kind:v13('m13k'),tags:tagsOf(v13('m13g'))}).then(function(){gClose();toast(tt('saved2'));render();},function(x){$('m13e').textContent=t('couldNot',{e:x&&(x.message||x.code)||'error'});});},true);
/* the chat: "J8 noted: …" under a reply, and your keywords and project names highlighted */
function kwTerms(){var T={};liveP().forEach(function(p){if(p.name&&p.name.length>2)T[p.name.toLowerCase()]=1;});memAll().forEach(function(m){if(!m.archived)(m.tags||[]).forEach(function(g){if(String(g).length>2)T[String(g).toLowerCase()]=1;});});return Object.keys(T).sort(function(a,b){return b.length-a.length;}).slice(0,80);}
function hiTerms(html,T){if(!T.length)return html;var re=new RegExp('('+T.map(function(x){return esc(x).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|')+')','gi');return html.split(/(<[^>]+>)/).map(function(seg){return seg.charAt(0)==='<'?seg:seg.replace(re,'<mark class="kw13">$1</mark>');}).join('');}
var cl13=chatLog;chatLog=function(){var h=cl13();if(!J8.memory)return h;var L=J8.inbox.list(40).slice().reverse(),parts=h.split('<div class="me12">'),T=kwTerms();if(parts.length-1!==L.length)return h;
  return parts.map(function(c,k){if(!k)return c;var x=L[k-1];c=c.replace(/^(<div class="bub12 mine">(?:<p class="ab12">[\s\S]*?<\/p>)?<p dir="auto">)([\s\S]*?)(<\/p>)/,function(_,a,b,d){return a+hiTerms(b,T)+d;});
    var M=J8.memory.forMessage(x.id);if(M.length){var line='<p class="noted13"><button class="lnk" data-a="x13-mnoted" data-id="'+esc(x.id)+'">'+g8i()+'<span dir="auto">'+esc(M.length===1?tt('noted',{x:cut(M[0].text,70)}):tt('notedN',{n:M.length,x:cut(M[0].text,50)}))+'</span></button></p>';
      var j=c.search(/<p class="(day12|wait12)"|<div class="j812 typing12"/);c=j>-1?c.slice(0,j)+line+c.slice(j):c+line;}
    return '<div class="me12">'+c;}).join('');};
/* composer hint: one chip from simple rules (keywords, dates, numbers, verbs) */
var RX={task:/\b(remind( me)?|need to|have to|must|todo|to-do|call|book|fix|follow up|send|email|schedule|don'?t forget)\b|להזכיר|תזכיר|צריך ל|חייב|לתקן|לשלוח|להתקשר|לקבוע|לא לשכוח/i,
  goal:/\b(goal|target|aim|reach|hit)\b|\b\d+\s*(clients|customers|users|sales|deals|testers|k\b)|\$\s?\d|₪\s?\d|יעד|מטרה|להגיע ל/i,
  idea:/\b(idea|what if|maybe we|could we|how about)\b|רעיון|מה אם|אולי כדאי/i,dec:/\b(decided|we will|i will go with|go with|final(ly)?|let'?s go with)\b|החלטתי|החלטנו|סגרנו|הולכים על/i,
  date:/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|sunday|next week|by \w+|\d{1,2}[\/.]\d{1,2})\b|היום|מחר|ביום|עד /i};
function hintOf(s){s=String(s||'').trim();if(s.length<6)return null;if(RX.goal.test(s)&&(RX.date.test(s)||/\d/.test(s)))return 'goal';if(RX.task.test(s))return 'task';if(RX.dec.test(s))return 'dec';if(RX.idea.test(s))return 'idea';if(RX.goal.test(s))return 'goal';return s.length>=24?'note':null;}
window.j8hint=hintOf;
function hintChip(kind,saved){var L={task:['hintTask','steps','ai'],goal:['hintGoal','target','money'],idea:['hintIdea','bulb','sky'],dec:['hintDec','check','done'],note:['hintNote','clip','royal']}[kind];if(!L)return '';
  return saved?'<span class="hint13 '+L[2]+'" role="status">'+I('check')+'<span>'+esc(tt('savedNote'))+'</span></span>':'<button type="button" class="hint13 '+L[2]+'" data-a="x13-hint" data-id="'+kind+'" title="'+esc(tt('hintWhy'))+'">'+I(L[1])+'<span>'+esc(tt(L[0]))+'</span><span class="sr"> · '+esc(tt('hintWhy'))+'</span></button>';}
function hintPaint(box,kind,saved){var el=box&&box.querySelector('.hintw13');if(!box)return;if(!el){el=document.createElement('div');el.className='hintw13';el.setAttribute('aria-live','polite');box.appendChild(el);}el.innerHTML=kind?hintChip(kind,saved):'';}
UI.hint=null;
document.addEventListener('input',function(e){var x=e.target;if(!x||(x.id!=='chatIn'&&x.id!=='j8cIn'))return;var k=hintOf(x.value);UI.hint={text:x.value,kind:k,src:null,box:x.id};hintPaint(x.closest('form')&&x.closest('form').parentNode,k);});
/* after a send, keep the hint for the message just sent (it links to it) */
var send13=J8.inbox.send;J8.inbox.send=function(p,text,tk,ap){var r=send13.apply(J8.inbox,arguments);if(!tk&&!ap&&UI.hint&&UI.hint.text&&String(text).trim()===String(UI.hint.text).trim()){var H=UI.hint;r.then(function(id){H.src=id;H.after=1;UI.hint=H;setTimeout(function(){var f=$(H.box==='j8cIn'?'j8cForm':'chatF');hintPaint(f&&f.parentNode,H.kind);},120);});}return r;};
var vc13=vChat;vChat=function(){var h=vc13();var H=UI.hint;if(H&&H.after&&H.kind&&H.box==='chatIn')h=h.replace(/(<form class="comp12" id="chatF"[\s\S]*?<\/form>)/,'$1<div class="hintw13" aria-live="polite">'+hintChip(H.kind,H.saved)+'</div>');return h;};
function memNoteFromHint(kind){var H=UI.hint||{};var tx=String(H.text||'').trim();if(!tx)return;var mk=kind==='idea'?'idea':kind==='dec'?'decision':'fact';
  J8.memory.add({kind:mk,text:tx,tags:[],source_message_id:H.src||null,project_id:null}).then(function(){H.saved=1;UI.hint=H;var f=$(H.box==='j8cIn'?'j8cForm':'chatF');hintPaint(f&&f.parentNode,kind,true);toast(tt('madeMem'));},function(x){toast(t('couldNot',{e:x&&(x.message||x.code)||'error'}));});}
window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a^="x13-m"],[data-a=x13-hint]');if(!el)return;e.preventDefault();e.stopPropagation();var a=el.dataset.a,id=el.dataset.id||'';
  if(a==='x13-hint'){var H=UI.hint||{},tx=String(H.text||'').trim();if(id==='task'){newForm('step');var i1=$('n13t');if(i1)i1.value=cut(tx,140);}else if(id==='goal'){newForm('goal',{t:cut(tx,140)});}else memNoteFromHint(id);return;}
  if(a==='x13-medit'){var m=memAll().filter(function(x){return x.id===id;})[0];if(m)memSheet(m);return;}
  if(a==='x13-march'){var m2=memAll().filter(function(x){return x.id===id;})[0];if(!m2)return;J8.memory.archive(id,!m2.archived).then(function(){toast(m2.archived?tt('saved2'):tt('archT'),m2.archived?null:function(){J8.memory.archive(id,false).then(function(){render();});});render();},function(x){toast(t('couldNot',{e:x&&x.code||'error'}));});return;}
  if(a==='x13-mforget'){UI.gsheet={k:'forget13'};gOpen('<h2 id="gTitle">'+esc(tt('forgetQ'))+'</h2><p class="lead">'+esc(tt('forgetP'))+'</p><div class="obnav"><button class="btn11" data-a="gclose">'+esc(t('cancel'))+'</button><button class="btn11 pri grow kill" data-a="x13-mforgetok" data-id="'+esc(id)+'">'+I('kill')+'<span>'+esc(tt('forget'))+'</span></button></div>','var(--urgent)');return;}
  if(a==='x13-mforgetok'){J8.memory.forget(id).then(function(){gClose();toast(tt('forgotT'));render();},function(x){toast(t('couldNot',{e:x&&(x.message||x.code)||'error'}));});return;}
  if(a==='x13-msrc'){threadSheet({msg:id});return;}
  if(a==='x13-mnoted'){UI.memSrc=id;UI.stack=[{v:UI.v}];UI.v='mem';render(true);return;}
  if(a==='x13-mem'||a==='x13-memall'){UI.memSrc=null;if(a==='x13-mem'){UI.stack=[{v:UI.v==='mem'?'me':UI.v}];UI.v='mem';}render(true);return;}},true);

/* ===== 11.3.0 (Dave 17 Nov 16:24): clear leadership, his logo, no pink, light that means something =====
   A. Next and "Needs you" list only real steps for the member: (a) the member's open, unblocked task with a how-to
   (or a step the member wrote or chose in their own plan); (b) drafts waiting for OK / Kill; (c) a project "you" line
   tagged 🔴/🟠 that has a link. Never a team reply fragment, a held send or a project line without a link.
   Do this first needs a how-to AND a link (or drafts to OK). Every card shows the full title, How as numbered steps,
   a button named after where it goes, minutes and one muted why line. */
Object.assign(L11.en,{how13:'How',needsH:'Needs you',openD:'Open {d}',why13:'Why',
  askFirst:'Line up the first step toward my goal: {g}. If you can do it yourself, do it. If only I can, give me one step with numbered how-to and a direct link.',
  askedH:'J8 is planning these',askedL:'Asked J8 to plan the first step toward: {g}',askedT:'Asked J8 to plan {n} first steps'});
Object.assign(L11.he,{how13:'איך',needsH:'מחכה לך',openD:'לפתוח את {d}',why13:'למה',
  askFirst:'לסדר את הצעד הראשון לקראת היעד שלי: {g}. אם אתם יכולים לעשות אותו בעצמכם, תעשו. אם רק אני יכול/ה, תנו לי צעד אחד עם הוראות ממוספרות וקישור ישיר.',
  askedH:'J8 מתכנן את אלה',askedL:'ביקשנו מ־J8 לתכנן את הצעד הראשון לקראת: {g}',askedT:'ביקשנו מ־J8 לתכנן {n} צעדים ראשונים'});
function hasAct13(t){return !!String(t&&t.action||'').trim();}
function own13(t){return !!t&&(t.source==='j8nix-app'||t.source==='j8nix-plan')&&!(px(t,'goal')&&!hasAct13(t));}
function okTask13(t){return !!t&&t.owner==='dave'&&(!t.status||t.status==='open')&&!openBlk(t.id).length&&(hasAct13(t)||own13(t));}
function okMove13(i){var p=i&&i.p;return !!(p&&i.move&&/^[ro]$/.test(sevOf(p.you)||'')&&String(p.you_link||'').trim());}
function elig13(i){if(!i)return false;if(i.task)return okTask13(i.task);if(i.batch||i.ap)return true;if(i.p)return okMove13(i);return false;}
function promo13(i){if(!i)return false;if(i.batch||i.ap)return true;if(i.task)return okTask13(i.task)&&hasAct13(i.task)&&!!String(i.task.link||'').trim();return okMove13(i);}
var needs12=needs;needs=function(){var R=needs12().filter(elig13);return R.filter(promo13).concat(R.filter(function(i){return !promo13(i);}));};
function steps13(s){s=String(s||'').replace(/\r/g,'').trim();if(!s)return [];var L=s.split(/\n+/).map(function(x){return x.trim();}).filter(Boolean);
  if(L.length===1){var P=L[0].split(/\s+(?=\d{1,2}[.)]\s)/);if(P.length>1)L=P;}return L;}
var NUM13=/^\d{1,2}[.)]\s+/;
function how13(i){var src=i.task?i.task.action:(i.p&&i.move?sevStrip(String(i.p.you||'')).trim():'');var L=steps13(src);if(!L.length)return '';
  var ti=String(cap1(nextOf(i).what)).replace(/[.\s]+$/,'');if(L.length===1&&L[0].replace(/^\d{1,2}[.)]\s+/,'').replace(/[.\s]+$/,'')===ti)return '';
  var h='',ol=[],flush=function(){if(ol.length){h+='<ol>'+ol.map(function(x){return '<li dir="auto">'+esc(x)+'</li>';}).join('')+'</ol>';ol=[];}};
  if(!L.some(function(x){return NUM13.test(x);})&&L.length>1)L=L.map(function(x,k){return (k+1)+'. '+x;});
  L.forEach(function(x){if(NUM13.test(x))ol.push(x.replace(NUM13,''));else{flush();h+='<p dir="auto">'+esc(x)+'</p>';}});flush();
  return '<div class="how13"><h4>'+esc(tt('how13'))+'</h4>'+h+'</div>';}
function why13(i){var w=String(nextOf(i).why||'').trim();return w?'<p class="why13" dir="auto"><b>'+esc(tt('why13'))+':</b> '+esc(w)+'</p>':'';}
function dom13(u){try{return new URL(u).hostname.replace(/^www\./,'');}catch(e){return '';}}
function lab13(i,g){var lt=String((i.task?i.task.link_text:i.p?i.p.you_link_text:'')||'').trim();if(lt)return lt;var d=g.href?dom13(g.href):'';return d?tt('openD',{d:d}):tt('open');}
bar12=function(i){var g=doTarget(i),k=esc(i.key),dec=!!(i.batch||i.ap||i.held),doing=!!UI.doing[i.key],dn=!!(i.task||(i.p&&i.move)),prim='';
  if(dec)prim='<button class="b12 pri" data-a="do" data-k="'+k+'"><span>'+esc(tt('review'))+'</span>'+I('do','flip')+'</button>';
  else if(g.href)prim='<a class="b12'+(doing?'':' pri')+'" href="'+hesc(g.href)+'" target="_blank" rel="noopener" data-a="do" data-k="'+k+'"><span dir="auto">'+esc(lab13(i,g))+'</span>'+I('ext')+'</a>';
  else if(g.jump)prim='<button class="b12'+(doing?'':' pri')+'" data-a="do" data-k="'+k+'"><span dir="auto">'+esc(lab13(i,g))+'</span>'+I('do','flip')+'</button>';
  var d=dn?'<button class="b12'+(doing||!prim?' pri':'')+'" data-a="done" data-k="'+k+'">'+I('check')+'<span>'+esc(tt('done'))+'</span></button>':'',n=(prim?1:0)+(d?1:0)+2;
  return '<div class="bar12'+(n===3?' three':n===2?' two':'')+'" role="group" aria-label="'+esc(t('actions'))+'">'+(doing?d+prim:prim+d)+'<button class="b12" data-a="later" data-k="'+k+'">'+I('later')+'<span>'+esc(tt('later'))+'</span></button><button class="b12" data-a="no" data-k="'+k+'">'+I('no')+'<span>'+esc(tt('nn'))+'</span></button></div>';};
function body13(i){return how13(i)+why13(i);}
var hc113=heroCard;heroCard=function(i,ix){var h=hc113(i,ix),b=body13(i),j=h.indexOf('<div class="bar12');return b&&j>-1?h.slice(0,j)+b+h.slice(j):h;};
var r113=row12;row12=function(i,num){var h=r113(i,num),b=body13(i)+(isNum(i.mins)?'<p class="mn13">'+I('time')+'<span>'+esc(tt('min',{n:i.mins}))+'</span></p>':''),j=h.indexOf('<div class="bar12');return j>-1?h.slice(0,j)+b+h.slice(j):h;};
var td113=taskDetail;taskDetail=function(i){var h=td113(i),b=body13(i),j=h.indexOf('<div class="bar12');return j>-1?h.slice(0,j)+b+h.slice(j):h;};
facts=function(i){var w=whereOf(i),dw=dwOf(i.task),a=dw?th('afterSwitch',{s:dwName(dw)}):(doTarget(i).href?t('afterOut'):''); /* How now shows as steps above */
  if(!w&&!a)return '';return '<dl class="facts">'+(w?'<div class="fact"><dt>'+t('where')+'</dt><dd dir="auto">'+esc(w)+'</dd></div>':'')+(a?'<div class="fact"><dt>'+t('after')+'</dt><dd>'+a+'</dd></div>':'')+'</dl>';};
function asked13(g){var lim=Date.now()-7*864e5,k=String(g||'').toLowerCase();return J8.inbox.list().some(function(x){return x.status!=='done'&&pd(x.at)>lim&&String(x.text||'').toLowerCase().indexOf(k)>-1;});}

/* D. the logo light moves only when it means something: J8 working = a light travels the 8; boot = one sweep; a step done = one glow */
var W8P='M142.2 251.7C149.4 251.7 150.6 255.4 150.6 258.8C150.6 266.6 133.9 277.4 133.9 286.2C133.9 290.4 136.7 293.4 142.2 293.4C147.7 293.4 150.6 290.4 150.6 286.2C150.6 277.4 133.9 266.6 133.9 258.8C133.9 255.4 135 251.7 142.2 251.7Z';
function w8(){return '<svg class="g8 w8" viewBox="131.498 249.537 21.424 46.017" aria-hidden="true"><use href="#eight" x="131.498" y="249.537" width="21.424" height="46.017"/>'+(RM()?'':'<g class="lt8" clip-path="url(#j8clip)"><circle r="4.6" fill="url(#j8light)"><animateMotion dur="3.2s" repeatCount="indefinite" path="'+W8P+'"/></circle></g>')+'</svg>';}
window.j8w8=w8;
function sweep13(){if(RM())return;var b=document.body;b.classList.remove('boot13');void b.offsetWidth;b.classList.add('boot13');setTimeout(function(){b.classList.remove('boot13');},1100);}
function glow13(){if(RM())return;var b=document.body;b.classList.remove('glow13');void b.offsetWidth;b.classList.add('glow13');setTimeout(function(){b.classList.remove('glow13');},800);}
window.j8glow=glow13;window.j8sweep=sweep13;
(function(){var n=0,tm=setInterval(function(){var a=$('app');if(a&&!a.hidden&&connected){clearInterval(tm);sweep13();}else if(++n>200)clearInterval(tm);},100);})();
var md113=markDone;markDone=function(k){var i=rowByKey(k),r=md113.apply(this,arguments);if(i&&(i.task||i.p))glow13();return r;};
window.j8113={elig:elig13,promo:promo13,steps:steps13};
/* the legacy inbox list (rendered under List → Drafts) must not cancel an edit in progress: with no reply-fragment rows left, its
   first row is a draft batch and its detail used to reset UI.editing (found by the 11.2 keyboard test, E edits the open draft) */
var vi113=vInbox;vInbox=function(){var e=UI.editing,h=vi113.apply(this,arguments);if(D12())UI.editing=e;return h;};

/* ---------- 11.3 TODAY panel (Dave 17 Nov 16:44): replaces "Plan my day". Real data only. ---------- */
Object.assign(L11.en,{tdToday:'Today',tdRest:'Rest of today',tdEve:'This evening',tdEveP:'Tomorrow’s plan is ready at 08:30',tdUpd:'Updated {t}',tdRefresh:'Refresh',tdUp:'Up to date',
  tdReplan:'Ask J8 to re-plan the rest of today',tdReplanT:'J8 will re-plan within the hour',tdYou:'You',tdTeam:'Team',tdOf:'{a} of {b} done',tdDoneN:'{n} done',
  tdYouNext:'You next',tdTeamDid:'Team did today',tdComing:'Coming up today',tdNoYou:'Nothing waits on you right now.',tdNoTeam:'No finished team runs yet today.',tdNoComing:'No more team runs today.',
  tdEvery:'every hour at :{m}',tdPlanFrom:'From today’s 08:30 plan',tdNoPlan:'No plan for today yet: counts are live, without a total.',tdRunAt:'Ran at {t}',tdNextAt:'At {t} (Israel time)'});
Object.assign(L11.he,{tdToday:'היום',tdRest:'מה שנשאר מהיום',tdEve:'הערב',tdEveP:'התוכנית של מחר מוכנה ב־08:30',tdUpd:'עודכן {t}',tdRefresh:'רענון',tdUp:'מעודכן',
  tdReplan:'לבקש מ־J8 לתכנן מחדש את המשך היום',tdReplanT:'J8 יתכנן מחדש בתוך שעה',tdYou:'את/ה',tdTeam:'הצוות',tdOf:'{a} מתוך {b} בוצעו',tdDoneN:'{n} בוצעו',
  tdYouNext:'הבא שלך',tdTeamDid:'מה הצוות עשה היום',tdComing:'בהמשך היום',tdNoYou:'שום דבר לא מחכה לך כרגע.',tdNoTeam:'עוד אין ריצות צוות שהסתיימו היום.',tdNoComing:'אין עוד ריצות צוות היום.',
  tdEvery:'כל שעה ב־:{m}',tdPlanFrom:'מהתוכנית של 08:30',tdNoPlan:'עוד אין תוכנית להיום: הספירה חיה, בלי סך הכול.',tdRunAt:'רץ ב־{t}',tdNextAt:'ב־{t} (שעון ישראל)'});
var ILT=window.Intl?new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jerusalem',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}):null;
function ilNow13(){var o={wd:new Date().getDay(),h:new Date().getHours(),m:new Date().getMinutes()};if(!ILT)return o;var W=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];ILT.formatToParts(new Date()).forEach(function(p){if(p.type==='weekday')o.wd=W.indexOf(p.value);if(p.type==='hour')o.h=+p.value;if(p.type==='minute')o.m=+p.value;});return o;}
function hhmm13(m){return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function comingToday(){var L=(J8.day&&J8.day.RUNS_DAILY)||[],n=ilNow13(),cur=n.h*60+n.m,R=[];
  L.forEach(function(r){if(r.days&&r.days.indexOf(n.wd)<0)return;if(r.every!=null){for(var h=Math.max(r.from||0,n.h);h<=(r.to==null?23:r.to);h++){var t=h*60+r.every;if(t>cur){R.push({r:r,t:t,every:1});break;}}return;}
    (r.at||[]).forEach(function(a){var p=a.split(':'),t=+p[0]*60+(+p[1]);if(t>cur)R.push({r:r,t:t});});});
  return R.sort(function(a,b){return a.t-b.t;});}
function noTag13(s){return String(s||'').replace(/^\s*(?:\d{1,2}:\d\d(?:\s*\([^)]*\))?\s*[—-]\s*)?(🔴|🟠|🟢)\s*/u,'').replace(/\s+Do:\s[\s\S]*$/,'').trim();}
function runsToday13(){return J8.runs.list().filter(function(r){return r.status==='ok'&&isToday(pd(r.ended||r.started));}).sort(function(a,b){return pd(b.ended||b.started)-pd(a.ended||a.started);});}
function dayCounts13(){var you=tasksAll().filter(function(x){return x.owner==='dave'&&x.status==='done'&&isToday(pd(x.done_at));}).length,
  sent=J8.approvals.list().filter(function(a){return a.status==='sent'&&isToday(pd(a.sent_at));}).length,runs=runsToday13().length,
  dp=J8.day?J8.day.today():null,mv=dp&&dp.plan&&Array.isArray(dp.plan.moves)?dp.plan.moves:null,open=0,counted=0;
  if(mv)mv.forEach(function(m){var id=m&&m.ref_id;if(!id)return;var tk=J8.tasks&&J8.tasks.get(id),ap=AP[id];if(tk){counted++;if(!tk.status||tk.status==='open')open++;}else if(ap){counted++;if(['sent','killed'].indexOf(ap.status)<0)open++;}});
  var done=you+sent+runs;return {you:you,team:sent+runs,sent:sent,runs:runs,done:done,plan:!!mv,moves:mv||[],open:open,total:mv?done+open:null};}
function youNext13(){var N=myQueue(),c=dayCounts13(),L=[],seen={};
  c.moves.forEach(function(m){if(!m||m.owner!=='dave'||!m.ref_id)return;var i=N.filter(function(x){return (x.ids||[]).indexOf(m.ref_id)>-1;})[0];if(i&&!seen[i.key]){seen[i.key]=1;L.push(i);}});
  N.forEach(function(i){if(!seen[i.key]&&L.length<3){seen[i.key]=1;L.push(i);}});return L.slice(0,3);}
function todayPanel(){if(!connected)return '';var hr=ilNow13().h,lab=hr<12?tt('tdToday'):hr<18?tt('tdRest'):tt('tdEve'),c=dayCounts13(),Y=youNext13(),T=runsToday13().slice(0,3),C=comingToday().slice(0,3),he=HE()?1:0;
  var h='<section class="td13" id="today13" aria-labelledby="tdH"><header><div><h3 id="tdH" dir="auto"><bdi>'+esc(lab)+'</bdi> · <bdi>'+esc(dayStr(new Date()))+'</bdi></h3><p class="upd">'+esc(tt('tdUpd',{t:UI.syncedAt?hm2(UI.syncedAt):'—'}))+'</p>'+(hr>=18?'<p class="eve">'+esc(tt('tdEveP'))+'</p>':'')+'</div>'
   +'<button type="button" class="b12 sm" data-a="x14-refresh">'+I('refresh')+'<span>'+esc(tt('tdRefresh'))+'</span></button></header>';
  var pc=function(n){return c.total?Math.max(0,Math.min(100,100*n/c.total)):0;};
  h+='<div class="prg13" role="img" aria-label="'+esc((c.total!=null?tt('tdOf',{a:c.done,b:c.total}):tt('tdDoneN',{n:c.done}))+' · '+tt('tdYou')+' '+c.you+' · '+tt('tdTeam')+' '+c.team)+'">'
   +(c.total!=null?'<span class="bar"><i class="y" style="width:'+pc(c.you).toFixed(1)+'%"></i><i class="t" style="width:'+pc(c.team).toFixed(1)+'%"></i></span>':'')
   +'<span class="lg"><span class="k y"><i></i>'+esc(tt('tdYou'))+' <b>'+c.you+'</b></span><span class="k t"><i></i>'+esc(tt('tdTeam'))+' <b>'+c.team+'</b></span><span class="tot">'+esc(c.total!=null?tt('tdOf',{a:c.done,b:c.total}):tt('tdDoneN',{n:c.done}))+'</span></span>'
   +(c.plan?'':'<small class="np">'+esc(tt('tdNoPlan'))+'</small>')+'</div><div class="cols13">';
  h+='<div class="tl13"><h4>'+esc(tt('tdYouNext'))+'</h4>'+(Y.length?'<ul>'+Y.map(function(i){var n=nextOf(i);return '<li><button type="button" data-a="x14-open" data-k="'+esc(i.key)+'"><span class="dot12 '+sevCls(i)+'" aria-hidden="true"></span><span class="tx" dir="auto">'+esc(cap1(n.what))+'</span>'+(isNum(i.mins)?'<small>'+esc(tt('min',{n:i.mins}))+'</small>':'')+'</button></li>';}).join('')+'</ul>':'<p class="no">'+esc(tt('tdNoYou'))+'</p>')+'</div>';
  h+='<div class="tl13"><h4>'+esc(tt('tdTeamDid'))+'</h4>'+(T.length?'<ul>'+T.map(function(r){return '<li><button type="button" data-a="x14-run" data-id="'+esc(r.id)+'"><time>'+esc(hm2(pd(r.ended||r.started)))+'</time><span class="tx" dir="auto"><b>'+esc(r.arm||tt('tdTeam'))+'</b> '+esc(noTag13(r.summary))+'</span></button></li>';}).join('')+'</ul>':'<p class="no">'+esc(tt('tdNoTeam'))+'</p>')+'</div>';
  h+='<div class="tl13"><h4>'+esc(tt('tdComing'))+'</h4>'+(C.length?'<ul>'+C.map(function(x,j){return '<li><button type="button" data-a="x14-coming" data-id="'+j+'"><time>'+esc(hhmm13(x.t))+'</time><span class="tx" dir="auto"><b>'+esc(x.r.arm)+'</b> '+esc(x.r.what[he]||x.r.what[0])+(x.every?' · '+esc(tt('tdEvery',{m:String(x.r.every).padStart(2,'0')})):'')+'</span></button></li>';}).join('')+'</ul>':'<p class="no">'+esc(tt('tdNoComing'))+'</p>')+'</div>';
  return h+'</div><p class="rp13"><button type="button" class="lnk" data-a="x14-replan">'+I('send')+'<span>'+esc(tt('tdReplan'))+'</span></button></p></section>';}
var vNx14=vNext;vNext=function(){var h=vNx14();if(!connected||UI.v!=='next')return h;return h.replace(/<\/header>/,'</header>'+todayPanel());};
document.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a^=x14-]');if(!el)return;e.preventDefault();e.stopPropagation();var a=el.dataset.a;
  if(a==='x14-open'){openItem(el.dataset.k);return;}
  if(a==='x14-refresh'){el.disabled=true;Promise.race([J8.reload(),new Promise(function(_,rj){setTimeout(function(){rj('timeout');},12000);})]).then(function(){UI.syncedAt=Date.now();NQ=null;render();toast(tt('tdUp'));},function(){toast(t('notConn'));}).then(function(){var b=document.querySelector('[data-a=x14-refresh]');if(b)b.disabled=false;});return;}
  if(a==='x14-replan'){if(!J8.status().connected){toast(t('notConn'));return;}J8.inbox.send('p-general','Re-plan the rest of today').then(function(){toast(tt('tdReplanT'));},function(x){toast(t('couldNot',{e:x&&x.code||'error'}));});return;}
  if(a==='x14-run'){var r=J8.runs.list().filter(function(x){return x.id===el.dataset.id;})[0];if(!r)return;UI.gsheet={k:'run14'};gOpen('<h2 id="gTitle" dir="auto">'+esc(r.arm||tt('tdTeam'))+'</h2><p class="sub12">'+esc(tt('tdRunAt',{t:hm2(pd(r.ended||r.started))}))+'</p><p class="lead" dir="auto">'+esc(noTag13(String(r.summary||'').replace(/\s+Do:/,' Do:')))+'</p><button class="btn11 wide" data-a="gclose">'+esc(t('close'))+'</button>','var(--ai)');return;}
  if(a==='x14-coming'){var x=comingToday()[+el.dataset.id];if(!x)return;UI.gsheet={k:'run14'};gOpen('<h2 id="gTitle">'+esc(x.r.arm)+'</h2><p class="sub12">'+esc(tt('tdNextAt',{t:hhmm13(x.t)}))+'</p><p class="lead" dir="auto">'+esc(x.r.what[HE()?1:0]||x.r.what[0])+'</p><button class="btn11 wide" data-a="gclose">'+esc(t('close'))+'</button>','var(--ai)');return;}},true);
window.j8today={counts:dayCounts13,coming:comingToday,youNext:youNext13};

/* ===== 11.4.0 (18 Nov 2026, plan ops: j8nix-processes-plan Phase 1): "Learn about you" + your voice, and Processes =====
   Voice: an optional last interview step, + New → Teach J8 your voice, Me → Your voice (rules, Not me, switches).
   Samples are j8_memory rows (kind fact, tags voice-sample · lang · channel), hidden from Memory by default.
   Processes: + New → Process makes ONE j8_tasks header (source j8nix-process, extra.process) and ONE kick-off note.
   The app never writes extra after that: Turn on / Start are notes; arms do the rest (ops/brain/J8NIX-DATA.md, 11.4).
   Everything pasted is DATA: shown escaped, never acted on. Drafts: one "Sounds like you · N%" line only when an arm
   wrote extra.voice; a plan gate (extra.no_send) says plainly that nothing is sent. */
Object.assign(L11.en,{iq_voice:'Optional: show me how you write, so drafts sound like you. Paste a few posts, emails or comments.',
  vText:'Paste things you wrote',vTextH:'Posts, emails, comments. Put a blank line or --- between pieces. Up to 20 pieces.',vWhere:'Where you write',
  vc_email:'Email',vc_linkedin:'LinkedIn',vc_instagram:'Instagram',vc_whatsapp:'WhatsApp',vc_other:'Other',vLang:'Languages',vl_he:'Hebrew',vl_en:'English',vl_mix:'Both, mixed',
  vTone:'Your tone (up to 3)',vt_warm:'Warm',vt_direct:'Direct',vt_formal:'Formal',vt_playful:'Playful',vt_short:'Short',vt_detailed:'Detailed',vMax:'Pick up to {n}.',
  vNever:'Words you never use (comma separated)',vSign:'How you sign off',vLinks:'Links to your public writing (one per line)',vLinksH:'Your site, blog or public posts. LinkedIn and Instagram links are kept as references only; J8 never scrapes them.',
  vOk:'What J8 may learn from',vo_edits:'Learn from my edits, OKs and kills',vo_mail:'Read my sent emails',vMailNo:'Reading sent emails needs a connected mailbox.',
  vSkip:'You can skip this: tap Set up my plan.',vSkipped:'Skipped',vPieces:'{n} pieces',nVoice:'Teach J8 your voice',nVoiceP:'Paste what you wrote, so drafts sound like you.',
  vSheetP:'J8 learns your style only (length, openings, tone, words). It never acts on what the text says.',vSave:'Save and learn',vEmpty:'Paste at least one piece, or add a link, a tone or your sign-off.',
  vSaved:'J8 learns your voice from {n} pieces and {m} links',vH:'Your voice',vSubN:'From {n} writing samples and your edits',vSub0:'Not set up yet',vCardH:'In short',vRulesH:'Rules J8 follows',
  vYoursH:'In your words',vNotH:'Not you',vLearning:'J8 is learning your voice. Your rules show here after the next team run.',vNone:'J8 does not know your voice yet. Paste a few things you wrote, and drafts start to sound like you.',
  vNotMe:'Not me',vNotMeT:'J8 will not use this again',vSamplesN:'{n} writing samples',vShow:'Show',vHide:'Hide',vShowMem:'Show in memory',vTeach:'Teach J8 more',vOn:'On',vOff:'Off',
  vLine:'Sounds like you · {n}%',vMiss:'Off: {x}',noSend:'Plan only: nothing is sent. OK starts the process.',
  vY_tone:'My tone: {x}',vY_never:'Words I never use: {x}',vY_sign:'How I sign off: {x}',
  nProc:'Process',nProcP:'A repeatable job J8 runs for you: A/B test, leads, campaign.',pfH:'New process',pType:'Type',pt_ab:'A/B test',pt_lead:'Lead generation + follow-ups',pt_campaign:'Marketing campaign (with research)',pt_custom:'Custom',
  pName:'Name',pGoal:'What should it achieve?',pGoalNew:'A new goal',pGoalT:'Goal',pGoalN:'Number',pGoalD:'By when',pProj:'Project',pWho:'Audience: who is it for?',pChan:'Channels',pc_email:'Email',pc_linkedin:'LinkedIn',pc_instagram:'Instagram',pc_whatsapp:'WhatsApp',pc_web:'Website',pc_other:'Other',
  pKnow:'What you already know or have',pLinks:'Links (one per line)',pAuto:'J8 may do without asking',pAsk:'Always needs your OK: {x}',pTest:'What to test',pa_msg:'Message',pa_btn:'Web button',pa_subj:'Subject line',
  pVa:'Variant A (optional: J8 writes it if empty)',pVb:'Variant B (optional)',pMeasure:'Main measure',pm_replies:'Replies',pm_accepts:'Accepts',pm_clicks:'Clicks',pBuyer:'Who is the ideal buyer?',pWeek:'How many a week',pFu:'Follow-ups',pDays:'Days between',
  pOffer:'Offer',pFrom:'Start',pTo:'End',pBudget:'Budget',pBudgetX:'0. J8 never spends without your OK.',pCreate:'Start the process',pMade:'Process started. J8 does the research first.',pOpen:'Open it',pNeedGoal:'Write the goal and its date.',
  procsH:'Processes',procsSub:'{n} processes',procsNone:'No processes yet. A process is a repeatable job J8 runs for you: an A/B test, lead generation with follow-ups, a campaign, or your own.',
  ps_intake:'Intake',ps_research:'Research',ps_plan:'Plan',ps_approve:'Approve',ps_run:'Run',ps_results:'Results',
  pn_intake:'J8 got it. Research starts in the next team run.',pn_research:'J8 is researching.',pn_plan:'J8 is writing the plan.',pn_approve:'The plan waits for your OK in Drafts.',pn_run:'Running.',pn_results:'Results are in.',pn_suggested:'Suggested by J8',
  pSugH:'Suggested for you',pRunH:'Running',pDoneH:'Done',pStart:'Start',pNotNow:'Not now',pStarted:'Asked J8 to start it',pResearch:'Research',pSources:'Sources',pSteps:'Plan steps',pAutoH:'Automations',pTurnOn:'Turn on',
  pAskedOn:'Asked J8 to turn it on. It changes only after the team checks it.',pa_on:'On',pa_ok:'Needs your OK',pa_connect:'Needs a connection',pResults:'Results',pGate:'Plan · OK to start',pWaitOk:'Waits for your OK',pOpenDrafts:'Open in Drafts',
  pNoYet:'Nothing yet. J8 fills this in as the process runs.',pGateOk:'You said OK',pGateNo:'You killed this plan',pNew:'New process'});
Object.assign(L11.he,{iq_voice:'לא חובה: תראו לי איך אתם כותבים, כדי שהטיוטות יישמעו כמוכם. הדביקו כמה פוסטים, מיילים או תגובות.',
  vText:'הדביקו דברים שכתבתם',vTextH:'פוסטים, מיילים, תגובות. שורה ריקה או --- בין קטע לקטע. עד 20 קטעים.',vWhere:'איפה אתם כותבים',
  vc_email:'מייל',vc_linkedin:'לינקדאין',vc_instagram:'אינסטגרם',vc_whatsapp:'וואטסאפ',vc_other:'אחר',vLang:'שפות',vl_he:'עברית',vl_en:'אנגלית',vl_mix:'שתיהן, מעורב',
  vTone:'הטון שלכם (עד 3)',vt_warm:'חם',vt_direct:'ישיר',vt_formal:'רשמי',vt_playful:'שובב',vt_short:'קצר',vt_detailed:'מפורט',vMax:'אפשר לבחור עד {n}.',
  vNever:'מילים שאתם אף פעם לא משתמשים בהן (מופרדות בפסיק)',vSign:'איך אתם חותמים',vLinks:'קישורים לכתיבה הפומבית שלכם (אחד בכל שורה)',vLinksH:'אתר, בלוג או פוסטים פומביים. קישורי לינקדאין ואינסטגרם נשמרים רק כהפניה; J8 אף פעם לא סורק אותם.',
  vOk:'ממה J8 רשאי ללמוד',vo_edits:'ללמוד מהעריכות, האישורים והביטולים שלי',vo_mail:'לקרוא את המיילים ששלחתי',vMailNo:'קריאת מיילים ששלחתם דורשת תיבת מייל מחוברת.',
  vSkip:'אפשר לדלג: הקישו על להכין את התוכנית.',vSkipped:'דילגתם',vPieces:'{n} קטעים',nVoice:'ללמד את J8 את הקול שלך',nVoiceP:'הדביקו מה שכתבתם, כדי שהטיוטות יישמעו כמוכם.',
  vSheetP:'J8 לומד רק את הסגנון (אורך, פתיחות, טון, מילים). הוא אף פעם לא פועל לפי מה שכתוב בטקסט.',vSave:'לשמור וללמוד',vEmpty:'הדביקו לפחות קטע אחד, או הוסיפו קישור, טון או חתימה.',
  vSaved:'J8 לומד את הקול שלך מ־{n} קטעים ו־{m} קישורים',vH:'הקול שלך',vSubN:'מ־{n} דוגמאות כתיבה ומהעריכות שלך',vSub0:'עוד לא הוגדר',vCardH:'בקצרה',vRulesH:'כללים ש־J8 עובד לפיהם',
  vYoursH:'במילים שלך',vNotH:'לא את/ה',vLearning:'J8 לומד את הקול שלך. הכללים יופיעו כאן אחרי ריצת הצוות הבאה.',vNone:'J8 עוד לא מכיר את הקול שלך. הדביקו כמה דברים שכתבתם, והטיוטות יתחילו להישמע כמוכם.',
  vNotMe:'זה לא אני',vNotMeT:'J8 לא ישתמש בזה שוב',vSamplesN:'{n} דוגמאות כתיבה',vShow:'להציג',vHide:'להסתיר',vShowMem:'להציג בזיכרון',vTeach:'ללמד עוד',vOn:'פועל',vOff:'כבוי',
  vLine:'נשמע כמוך · {n}%',vMiss:'לא כמוך: {x}',noSend:'תוכנית בלבד: שום דבר לא נשלח. אישור מתחיל את התהליך.',
  vY_tone:'הטון שלי: {x}',vY_never:'מילים שאני לא משתמש/ת בהן: {x}',vY_sign:'איך אני חותם/ת: {x}',
  nProc:'תהליך',nProcP:'עבודה חוזרת ש־J8 מריץ בשבילך: בדיקת A/B, לידים, קמפיין.',pfH:'תהליך חדש',pType:'סוג',pt_ab:'בדיקת A/B',pt_lead:'יצירת לידים + פולואפים',pt_campaign:'קמפיין שיווקי (עם מחקר)',pt_custom:'מותאם אישית',
  pName:'שם',pGoal:'מה זה צריך להשיג?',pGoalNew:'יעד חדש',pGoalT:'יעד',pGoalN:'מספר',pGoalD:'עד מתי',pProj:'פרויקט',pWho:'קהל: למי זה מיועד?',pChan:'ערוצים',pc_email:'מייל',pc_linkedin:'לינקדאין',pc_instagram:'אינסטגרם',pc_whatsapp:'וואטסאפ',pc_web:'אתר',pc_other:'אחר',
  pKnow:'מה כבר ידוע או קיים',pLinks:'קישורים (אחד בכל שורה)',pAuto:'J8 רשאי בלי לשאול',pAsk:'תמיד צריך את האישור שלך: {x}',pTest:'מה בודקים',pa_msg:'הודעה',pa_btn:'כפתור באתר',pa_subj:'שורת נושא',
  pVa:'גרסה A (לא חובה: J8 יכתוב אם ריק)',pVb:'גרסה B (לא חובה)',pMeasure:'מדד עיקרי',pm_replies:'תשובות',pm_accepts:'אישורי חיבור',pm_clicks:'הקלקות',pBuyer:'מי הקונה המתאים?',pWeek:'כמה בשבוע',pFu:'פולואפים',pDays:'ימים ביניהם',
  pOffer:'ההצעה',pFrom:'התחלה',pTo:'סיום',pBudget:'תקציב',pBudgetX:'0. J8 אף פעם לא מוציא כסף בלי האישור שלך.',pCreate:'להתחיל את התהליך',pMade:'התהליך התחיל. J8 מתחיל במחקר.',pOpen:'לפתוח',pNeedGoal:'כתבו את היעד ואת התאריך.',
  procsH:'תהליכים',procsSub:'{n} תהליכים',procsNone:'עוד אין תהליכים. תהליך הוא עבודה חוזרת ש־J8 מריץ בשבילך: בדיקת A/B, לידים עם פולואפים, קמפיין, או משהו משלך.',
  ps_intake:'קליטה',ps_research:'מחקר',ps_plan:'תוכנית',ps_approve:'אישור',ps_run:'ריצה',ps_results:'תוצאות',
  pn_intake:'J8 קיבל. המחקר מתחיל בריצת הצוות הבאה.',pn_research:'J8 חוקר.',pn_plan:'J8 כותב את התוכנית.',pn_approve:'התוכנית מחכה לאישור שלך בטיוטות.',pn_run:'רץ.',pn_results:'התוצאות הגיעו.',pn_suggested:'הצעה של J8',
  pSugH:'הצעות בשבילך',pRunH:'רצים',pDoneH:'הסתיימו',pStart:'להתחיל',pNotNow:'לא עכשיו',pStarted:'ביקשתי מ־J8 להתחיל',pResearch:'מחקר',pSources:'מקורות',pSteps:'שלבי התוכנית',pAutoH:'אוטומציות',pTurnOn:'להפעיל',
  pAskedOn:'ביקשתי מ־J8 להפעיל. זה משתנה רק אחרי שהצוות בודק.',pa_on:'פועל',pa_ok:'צריך את האישור שלך',pa_connect:'צריך חיבור',pResults:'תוצאות',pGate:'תוכנית · אישור להתחיל',pWaitOk:'מחכה לאישור שלך',pOpenDrafts:'לפתוח בטיוטות',
  pNoYet:'עוד אין. J8 ימלא את זה תוך כדי.',pGateOk:'אישרת',pGateNo:'ביטלת את התוכנית',pNew:'תהליך חדש'});

/* --- voice: shared pieces --- */
var VCH15=['email','linkedin','instagram','whatsapp','other'],VLG15=['he','en','mix'],VTN15=['warm','direct','formal','playful','short','detailed'];
function meId15(){try{return (J8.status().user||{}).id||null;}catch(e){return null;}}
function hasTag15(m,g){return (m&&m.tags||[]).indexOf(g)>-1;}
function isSample15(m){return hasTag15(m,'voice-sample');}
function mailOk15(){try{return !!(J8.control.get()||{}).email_from_ok;}catch(e){return false;}}
function myMem15(){var me=meId15();return J8.memory?J8.memory.list(true).filter(function(m){return me&&m.member===me;}):[];}
function voiceRows15(){return myMem15().filter(function(m){return hasTag15(m,'voice');});}
function mySamples15(){return myMem15().filter(function(m){return isSample15(m)&&!m.archived;});}
function vDef15(){var pv=prefs0().voice||{};return {text:'',chans:Array.isArray(pv.chans)?pv.chans.filter(function(c){return VCH15.indexOf(c)>-1;}):[],lang:VLG15.indexOf(pv.lang)>-1?pv.lang:'',tone:[],never:'',sign:'',links:'',ok:['edits','mail'].filter(function(k){return k==='edits'?pv.edits!==false:!!pv.mail&&mailOk15();})};}
/* paste → pieces: a blank line or a --- line separates them; max 20, each cut at 2000 characters */
function pieces15(s){s=String(s||'').replace(/\r\n?/g,'\n').replace(/^[ \t]*-{3,}[ \t]*$/gm,'\n');return s.split(/\n[ \t]*\n+/).map(function(x){return x.trim();}).filter(Boolean).slice(0,20).map(function(x){return x.slice(0,2000);});}
function lang15(s,dflt){var he=(String(s).match(/[֐-׿]/g)||[]).length,la=(String(s).match(/[A-Za-z]/g)||[]).length,n=he+la;if(!n)return dflt==='he'||dflt==='en'?dflt:'mix';var r=he/n;return r>0.85?'he':r<0.15?'en':'mix';}
function links15(s){var o=[];String(s||'').split(/[\s,]+/).forEach(function(u){u=u.trim();if(/^https?:\/\/[^\s<>"'`]+$/i.test(u)&&u.length<=500&&o.indexOf(u)<0)o.push(u);});return o.slice(0,10);}
function words15(s){return String(s||'').split(/[,،\n]/).map(function(x){return x.trim();}).filter(Boolean).slice(0,30).join(', ').slice(0,600);}
function vEmpty15(V){return !pieces15(V.text).length&&!links15(V.links).length&&!(V.tone||[]).length&&!words15(V.never)&&!String(V.sign||'').trim();}
function chips15(g,keys,pfx,cur,multi,o){o=o||{};return '<div class="chq12 vg15" role="group" data-g="'+g+'" data-multi="'+(multi?1:0)+'"'+(o.max?' data-max="'+o.max+'"':'')+(o.lab?' aria-label="'+esc(o.lab)+'"':'')+'>'+keys.map(function(k){var d=o.dis&&o.dis[k],on=(cur||[]).indexOf(k)>-1&&!d;
  return '<button type="button" class="chp12" data-a="x15-vc" data-id="'+esc(k)+'" aria-pressed="'+on+'"'+(d?' disabled':'')+'><span>'+esc(tt(pfx+k))+'</span></button>';}).join('')+'</div>';}
function readChips15(box){var o={};[].forEach.call(box.querySelectorAll('.vg15'),function(g){var on=[].filter.call(g.querySelectorAll('[aria-pressed=true]'),function(b){return !b.disabled;}).map(function(b){return b.dataset.id;});o[g.dataset.g]=g.dataset.multi==='1'?on:(on[0]||'');});return o;}
function voiceFields15(V,mode){var p=mode==='ob'?'ob-v-':'vs-',mo=mailOk15();
  return '<div class="vf15">'+fl(p+'x',tt('vText'),'<textarea id="'+p+'x" data-ob="voice.text" rows="6" dir="auto" maxlength="44000" aria-describedby="'+p+'xh">'+esc(V.text||'')+'</textarea>')+'<p class="hint15" id="'+p+'xh">'+esc(tt('vTextH'))+'</p>'
   +'<p class="ql12">'+esc(tt('vWhere'))+'</p>'+chips15('chans',VCH15,'vc_',V.chans,1,{lab:tt('vWhere')})
   +'<p class="ql12">'+esc(tt('vLang'))+'</p>'+chips15('lang',VLG15,'vl_',[V.lang],0,{lab:tt('vLang')})
   +'<p class="ql12">'+esc(tt('vTone'))+'</p>'+chips15('tone',VTN15,'vt_',V.tone,1,{max:3,lab:tt('vTone')})
   +fl(p+'n',tt('vNever'),'<input id="'+p+'n" data-ob="voice.never" dir="auto" maxlength="600" value="'+esc(V.never||'')+'">')
   +fl(p+'s',tt('vSign'),'<input id="'+p+'s" data-ob="voice.sign" dir="auto" maxlength="140" value="'+esc(V.sign||'')+'">')
   +fl(p+'l',tt('vLinks'),'<textarea id="'+p+'l" data-ob="voice.links" rows="2" dir="ltr" maxlength="5000" aria-describedby="'+p+'lh">'+esc(V.links||'')+'</textarea>')+'<p class="hint15" id="'+p+'lh">'+esc(tt('vLinksH'))+'</p>'
   +'<p class="ql12">'+esc(tt('vOk'))+'</p>'+chips15('ok',['edits','mail'],'vo_',V.ok,1,{dis:{mail:!mo},lab:tt('vOk')})+(mo?'':'<p class="hint15">'+esc(tt('vMailNo'))+'</p>')
   +'<p class="err12 vErr15" role="alert"></p></div>';}
function readVoice15(box){var q=function(k){var e=box.querySelector('[data-ob="voice.'+k+'"]');return e?String(e.value||''):'';},c=readChips15(box);
  return {text:q('text'),never:q('never'),sign:q('sign'),links:q('links'),chans:c.chans||[],lang:c.lang||'',tone:(c.tone||[]).slice(0,3),ok:c.ok||[]};}
/* save: samples, links and your own words as j8_memory rows (member = you), the switches in prefs.voice, then ONE note to J8 */
function voiceSave15(V){var me=meId15(),P=pieces15(V.text),L=links15(V.links),ch=(V.chans||[]).length===1?V.chans[0]:'any',fail=0,ns=0,nl=0,mine=myMem15();
  var haveS={},haveL={};mine.forEach(function(m){if(isSample15(m))haveS[m.text]=1;if(hasTag15(m,'voice-source'))haveL[m.text]=1;});
  var add=[];P.forEach(function(x){if(!haveS[x]){haveS[x]=1;add.push({k:'s',doc:{kind:'fact',text:x,tags:['voice-sample',lang15(x,V.lang),ch],project_id:null,source_message_id:null}});}});
  L.forEach(function(u){if(!haveL[u])add.push({k:'l',doc:{kind:'fact',text:u,tags:['voice-source','link'],project_id:null,source_message_id:null}});});
  var own=[],tn=(V.tone||[]).map(function(k){return tt('vt_'+k);}).join(', '),nv=words15(V.never),sg=String(V.sign||'').trim().slice(0,140);
  if(tn)own.push(['tone',tt('vY_tone',{x:tn})]);if(nv)own.push(['vocabulary-avoid',tt('vY_never',{x:nv})]);if(sg)own.push(['sign-off',tt('vY_sign',{x:sg})]);
  var w=function(fn){return function(x){return fn(x).catch(function(e){fail++;throw e;});};};
  return seq(add,w(function(x){return J8.memory.add(x.doc).then(function(){if(x.k==='s')ns++;else nl++;});}))
   .then(function(){return seq(own,w(function(o){var ex=mine.filter(function(m){return !m.archived&&hasTag15(m,'voice')&&hasTag15(m,'yours')&&hasTag15(m,o[0]);})[0];
     return ex?J8.memory.edit(ex.id,{text:o[1]}):J8.memory.add({kind:'preference',text:o[1],tags:['voice','yours',o[0]],project_id:null,source_message_id:null});}));})
   .then(function(){var pv=prefs0().voice||{},ok=V.ok||[];return prefSet({voice:{on:true,edits:ok.indexOf('edits')>-1,mail:ok.indexOf('mail')>-1&&mailOk15(),lang:V.lang||pv.lang||'',langs:V.lang==='mix'?['he','en']:V.lang?[V.lang]:(pv.langs||[]),chans:(V.chans||[]).length?V.chans.slice():(pv.chans||[]),at:new Date().toISOString(),n_samples:mySamples15().length}});})
   .then(function(){if(!ns&&!nl&&!own.length)return;return J8.inbox.send('p-general','Learn my voice: '+ns+' samples, '+nl+' links.').catch(function(){fail++;});})
   .then(function(){return {n:ns,m:nl,own:own.length,fail:fail,me:me};});}

/* the interview: one optional last step (after the approval rules); skipping writes nothing */
var A015=A0;A0=function(){var a=A015();a.voice=vDef15();return a;};
var qs15=qs;qs=function(){return qs15().concat(['voice']);};
var fd15=field;field=function(q){return q==='voice'?'<p class="sub11">'+esc(tt('vSkip'))+'</p>'+voiceFields15(OB.A.voice||vDef15(),'ob'):fd15(q);};
var at15=ansText;ansText=function(q){if(q!=='voice')return at15(q);var V=OB.A.voice||{},n=pieces15(V.text).length;return vEmpty15(V)?tt('vSkipped'):[n?tt('vPieces',{n:n}):'',(V.tone||[]).map(function(k){return tt('vt_'+k);}).join(', ')].filter(Boolean).join(' · ')||tt('vSkipped');};
var oc15=obCollect;obCollect=function(){oc15();var el=$('ob11'),b=el&&el.querySelector('.vf15');if(b&&OB.A){var c=readChips15(b);OB.A.voice=Object.assign(OB.A.voice||vDef15(),{chans:c.chans||[],lang:c.lang||'',tone:(c.tone||[]).slice(0,3),ok:c.ok||[]});}};
var pb15=planBuild;planBuild=function(){var V=OB.A&&OB.A.voice;return pb15().then(function(m){if(!V||vEmpty15(V))return m;return voiceSave15(V).then(function(r){m.voice=r;m.fail+=r.fail;return m;},function(){m.fail++;return m;});});};

/* + New → Teach J8 your voice (the same fields as the interview step) */
function voiceSheet15(){UI.gsheet={k:'voice15'};gOpen('<h2 id="gTitle">'+esc(tt('nVoice'))+'</h2><p class="sub12">'+esc(tt('vSheetP'))+'</p><form id="vf15" class="ed12" novalidate>'+voiceFields15(vDef15(),'s')
  +'<div class="obnav"><button type="button" class="btn11" data-a="gclose">'+esc(t('close'))+'</button><button type="submit" class="btn11 pri grow">'+I('check')+'<span>'+esc(tt('vSave'))+'</span></button></div></form>','var(--royal)');
  var x=$('vs-x');if(x)setTimeout(function(){x.focus();},60);}
document.addEventListener('submit',function(e){var f=e.target;if(!f||f.id!=='vf15')return;e.preventDefault();var V=readVoice15(f),er=f.querySelector('.vErr15'),go=f.querySelector('[type=submit]');
  if(vEmpty15(V)){er.textContent=tt('vEmpty');var x=$('vs-x');if(x)x.focus();return;}
  if(!J8.status().connected||navigator.onLine===false){er.textContent=t('notConn');return;}if(go)go.disabled=true;
  voiceSave15(V).then(function(r){if(r.fail&&!r.n&&!r.m&&!r.own){if(go)go.disabled=false;er.textContent=t('couldNot',{e:'error'});return;}
    made('voice',tt('vSaved',{n:r.n,m:r.m}),null,'<button class="btn11 pri" data-a="x15-voice">'+I('mic')+'<span>'+esc(tt('vH'))+'</span></button>');},function(x){if(go)go.disabled=false;er.textContent=t('couldNot',{e:x&&(x.message||x.code)||'error'});});},true);

/* Memory hides writing samples by default: one line "N writing samples · Show" */
var ma15=memAll;memAll=function(){var A=ma15();return UI.memSamples?A:A.filter(function(m){return !isSample15(m);});};
var vm15=vMem;vMem=function(){var h=vm15();if(!connected)return h;var n=ma15().filter(function(m){return isSample15(m)&&!m.archived;}).length;if(!n)return h;
  var line='<p class="vsm15">'+I('mic')+'<span>'+esc(tt('vSamplesN',{n:n}))+'</span><button class="lnk" data-a="x15-vsamp" aria-pressed="'+(UI.memSamples?'true':'false')+'">'+esc(UI.memSamples?tt('vHide'):tt('vShow'))+'</button></p>';
  return h.replace('</header>','</header>'+line);};

/* Me → Your voice */
function vRule15(m,notme){var id=esc(m.id),sc=(m.tags||[]).filter(function(g){return ['voice','rule','learned','yours','card','not-me'].indexOf(g)<0;});
  return '<li class="mr13 vr15" data-mid="'+id+'"><p dir="auto">'+esc(m.text)+'</p>'+(sc.length?'<p class="tags13">'+sc.map(function(g){return '<span class="chip12 sm '+tagCls(g)+'"><bdi dir="auto">'+esc(g)+'</bdi></span>';}).join('')+'</p>':'')
   +'<div class="ma13"><span class="sub12">'+esc(tm1(m.updated_at||m.created_at))+'</span><span class="sp"></span>'+(notme?'':'<button class="b12 sm nm15" data-a="x15-notme" data-id="'+id+'">'+I('no')+'<span>'+esc(tt('vNotMe'))+'</span></button>')
   +'<button class="ib12" data-a="x13-medit" data-id="'+id+'" aria-label="'+esc(tt('editIt'))+'" title="'+esc(tt('editIt'))+'">'+I('edit')+'</button><button class="ib12 kill" data-a="x13-mforget" data-id="'+id+'" aria-label="'+esc(tt('forget'))+'" title="'+esc(tt('forget'))+'">'+I('kill')+'</button></div></li>';}
function vVoice15(){var R=voiceRows15().filter(function(m){return !m.archived;}),S=mySamples15(),card=R.filter(function(m){return hasTag15(m,'card');})[0],rules=R.filter(function(m){return hasTag15(m,'rule');}),
  yours=R.filter(function(m){return hasTag15(m,'yours');}),nm=R.filter(function(m){return hasTag15(m,'not-me');}),pv=prefs0().voice||{},mo=mailOk15();
  var h=ph(tt('vH'),esc(S.length?tt('vSubN',{n:S.length}):tt('vSub0')),'<div class="phx12"><button class="lnk12" data-a="x15-vteach">'+I('plus')+'<span>'+esc(tt('vTeach'))+'</span></button></div>');
  if(!connected)return h+skel(3);
  if(card)h+='<section class="card12 vcard15"><h3>'+g8i()+'<span>'+esc(tt('vCardH'))+'</span></h3>'+String(card.text).split(/\n+/).filter(Boolean).slice(0,5).map(function(l){return '<p dir="auto">'+esc(l)+'</p>';}).join('')+'</section>';
  if(rules.length)h+='<section class="vs15"><h3 class="sh12">'+esc(tt('vRulesH'))+' <span class="n12"><bdi>'+rules.length+'</bdi></span></h3><ul class="vl15">'+rules.map(function(m){return vRule15(m);}).join('')+'</ul></section>';
  else h+='<section class="empty12 e13 vemp15">'+g8i()+'<span>'+esc(S.length||yours.length||pv.on?tt('vLearning'):tt('vNone'))+'</span>'+(S.length||pv.on?'':'<button class="b12 pri sm cta13" data-a="x15-vteach">'+I('plus')+'<span>'+esc(tt('nVoice'))+'</span></button>')+'</section>';
  if(yours.length)h+='<section class="vs15"><h3 class="sh12">'+esc(tt('vYoursH'))+'</h3><ul class="vl15">'+yours.map(function(m){return vRule15(m,true);}).join('')+'</ul></section>';
  if(nm.length)h+='<section class="vs15"><h3 class="sh12">'+esc(tt('vNotH'))+'</h3><ul class="vl15">'+nm.map(function(m){return vRule15(m,true);}).join('')+'</ul></section>';
  var sw=function(k,on,dis){return '<button class="sw15" data-a="x15-vsw" data-id="'+k+'" aria-pressed="'+(on&&!dis)+'"'+(dis?' disabled':'')+'><span>'+esc(tt('vo_'+k))+'</span><b>'+esc(on&&!dis?tt('vOn'):tt('vOff'))+'</b></button>';};
  h+='<section class="vs15"><h3 class="sh12">'+esc(tt('vOk'))+'</h3><div class="sws15">'+sw('edits',pv.edits!==false)+sw('mail',!!pv.mail,!mo)+'</div>'+(mo?'':'<p class="hint15">'+esc(tt('vMailNo'))+'</p>')+'</section>';
  if(S.length)h+='<p class="vsm15">'+I('mic')+'<span>'+esc(tt('vSamplesN',{n:S.length}))+'</span><button class="lnk" data-a="x15-vsmem">'+esc(tt('vShowMem'))+'</button></p>';
  return h;}

/* --- Processes --- */
var PT15=['ab','lead','campaign','custom'],PST15=['intake','research','plan','approve','run','results'],POWN15={ab:'CMO',campaign:'CMO',lead:'CRO',custom:'COO'},PCH15=['email','linkedin','instagram','whatsapp','web','other'];
function procOf15(t){var p=px(t,'process');return p&&typeof p==='object'&&!Array.isArray(p)?p:null;}
function procs15(pid){return rawTasks().filter(function(t){return procOf15(t)&&!t.parent_id&&t.status!=='dropped'&&(!pid||t.project_id===pid);}).sort(function(a,b){return String(b.created_at||b.updated_at||'').localeCompare(String(a.created_at||a.updated_at||''));});}
function pName15(t){var p=procOf15(t)||{};return String(t.title||'').replace(/^Process:\s*/,'')||String((p.intake||{}).name||'');}
function pStage15(t){var p=procOf15(t)||{},s=String(p.stage||'intake'),i=PST15.indexOf(s)+1,sug=s==='suggested',fail=s==='failed'||!!p.failed,won=t.status==='done'||(s==='results'&&p.results&&/^(A|B|none)$/.test(String(p.results.verdict||'')));
  return {s:sug?'suggested':i?s:'intake',i:sug?0:i||1,cls:sug?'sug':fail?'fail':won?'won':s==='approve'?'wait':'act',now:sug?String(p.why||'')||tt('pn_suggested'):typeof p.now==='string'&&p.now?p.now:tt('pn_'+(i?s:'intake')),type:PT15.indexOf(p.type)>-1?p.type:'custom'};}
function pCard15(t){var S=pStage15(t),id=esc(t.id);
  return '<li class="pc15 st-'+S.cls+'" data-pid="'+id+'"><button class="pcb15" data-a="x15-popen" data-id="'+id+'"><span class="rt12"><b dir="auto">'+esc(pName15(t))+'</b><small dir="auto">'+esc(tt('pt_'+S.type))+' · '+esc(S.now)+'</small></span><span class="ls">'+(S.i?segs6(S.i):'')+'<small>'+esc(S.i?tt('ps_'+S.s):tt('pn_suggested'))+'</small></span></button>'
   +(S.cls==='sug'?'<div class="ps15"><button class="b12 sm pri" data-a="x15-pstart" data-id="'+id+'">'+I('play')+'<span>'+esc(tt('pStart'))+'</span></button><button class="b12 sm" data-a="x15-pnot" data-id="'+id+'">'+esc(tt('pNotNow'))+'</button></div>':'')+'</li>';}
function vProcs15(){var P=procs15(),sug=P.filter(function(t){return pStage15(t).cls==='sug';}),dn=P.filter(function(t){return pStage15(t).cls==='won';}),run=P.filter(function(t){return sug.indexOf(t)<0&&dn.indexOf(t)<0;});
  var h=ph(tt('procsH'),connected&&P.length?esc(tt('procsSub',{n:P.length-sug.length})):'','<div class="phx12"><button class="lnk12" data-a="x15-pnew">'+I('plus')+'<span>'+esc(tt('pNew'))+'</span></button></div>');
  if(!connected)return h+skel(3);
  if(!P.length)return h+'<section class="empty12 e13 pemp15">'+I('repeat')+'<span>'+esc(tt('procsNone'))+'</span><button class="b12 pri sm cta13" data-a="x15-pnew">'+I('plus')+'<span>'+esc(tt('pNew'))+'</span></button></section>';
  var sec=function(k,L){return L.length?'<section class="vs15"><h3 class="sh12">'+esc(tt(k))+' <span class="n12"><bdi>'+L.length+'</bdi></span></h3><ul class="pl15">'+L.map(pCard15).join('')+'</ul></section>':'';};
  return h+sec('pSugH',sug)+sec('pRunH',run)+sec('pDoneH',dn);}
function procSheet15(id){var tk=J8.tasks.get(id);if(!tk){var r=(J8.raw('tasks')||{})[id];tk=r?Object.assign({id:id},r):null;}if(!tk||!procOf15(tk))return;var p=procOf15(tk),S=pStage15(tk),pr=p.research&&typeof p.research==='object'?p.research:null;
  var kids=rawTasks().filter(function(x){return x.parent_id===id&&x.status!=='dropped';}),gate=J8.approvals.list().filter(function(a){return px(a,'process_id')===id&&px(a,'no_send');}),au=Array.isArray(p.auto)?p.auto:[],rs=p.results&&typeof p.results==='object'?p.results:null,any=0;
  var h='<h2 id="gTitle" dir="auto">'+esc(pName15(tk))+'</h2><p class="sub12">'+esc(tt('pt_'+S.type))+(tk.project_id&&pobj(tk.project_id)?' · '+esc(pobj(tk.project_id).name):'')+'</p>'
   +'<div class="pst15 st-'+S.cls+'">'+(S.i?segs6(S.i):'')+'<ol class="psl15">'+PST15.map(function(s,k){return '<li'+(k+1===S.i?' aria-current="step"':'')+'>'+esc(tt('ps_'+s))+'</li>';}).join('')+'</ol></div><p class="lead" dir="auto">'+esc(S.now)+'</p>';
  if(pr&&(pr.summary||(pr.sources||[]).length)){any=1;h+='<section class="ps15b"><h3 class="sh12">'+esc(tt('pResearch'))+'</h3>'+(pr.summary?'<p dir="auto">'+esc(String(pr.summary).slice(0,1500))+'</p>':'')
    +((pr.sources||[]).length?'<h4>'+esc(tt('pSources'))+'</h4><ul class="src15">'+pr.sources.slice(0,12).map(function(s){s=s||{};return '<li><a href="'+hesc(s.u||'')+'" target="_blank" rel="noopener noreferrer" dir="auto">'+esc(cut(s.t||s.u||'',90))+'</a></li>';}).join('')+'</ul>':'')+'</section>';}
  if(gate.length){any=1;h+='<section class="ps15b"><h3 class="sh12">'+esc(tt('pGate'))+'</h3>'+gate.map(function(a){var pend=!a.status||a.status==='pending';return '<p class="gate15 '+(pend?'wait':'ok')+'"><span dir="auto">'+esc(pend?tt('pWaitOk'):a.status==='killed'?tt('pGateNo'):tt('pGateOk'))+'</span>'+(pend?'<button class="b12 sm" data-a="x15-pdrafts">'+I('inbox')+'<span>'+esc(tt('pOpenDrafts'))+'</span></button>':'')+'</p>';}).join('')+'<p class="hint15">'+esc(tt('noSend'))+'</p></section>';}
  if(kids.length){any=1;h+='<section class="ps15b"><h3 class="sh12">'+esc(tt('pSteps'))+'</h3><ol class="stp15">'+kids.map(function(k){var d=k.status==='done';return '<li class="'+(d?'dn':'')+'"><span dir="auto">'+esc(k.title||'')+'</span><small>'+esc(k.owner==='dave'?(HE()?'את/ה':'You'):String(k.owner||''))+(d?' · '+esc(tt('done')):'')+'</small></li>';}).join('')+'</ol></section>';}
  if(au.length){any=1;h+='<section class="ps15b"><h3 class="sh12">'+esc(tt('pAutoH'))+'</h3><ul class="au15">'+au.slice(0,10).map(function(x,k){x=x||{};var on=!!x.on,asked=UI.ton15&&UI.ton15[id+'|'+k];return '<li><span class="rt12"><b dir="auto">'+esc(x.what||'')+'</b>'+(x.why?'<small dir="auto">'+esc(x.why)+'</small>':'')+'</span>'
     +(on?'<span class="chip12 sm on15">'+esc(tt('pa_on'))+'</span>':'<span class="chip12 sm">'+esc(x.needs==='connect'?tt('pa_connect'):tt('pa_ok'))+'</span><button class="b12 sm" data-a="x15-pon" data-id="'+esc(id)+'" data-k="'+k+'"'+(asked?' disabled':'')+'>'+esc(asked?tt('pStarted'):tt('pTurnOn'))+'</button>')+'</li>';}).join('')+'</ul></section>';}
  if(rs&&(rs.line||rs.A||rs.B)){any=1;h+='<section class="ps15b"><h3 class="sh12">'+esc(tt('pResults'))+'</h3><p dir="auto">'+esc(rs.line||('A '+((rs.A||{}).k||0)+'/'+((rs.A||{}).n||0)+' · B '+((rs.B||{}).k||0)+'/'+((rs.B||{}).n||0)))+'</p></section>';}
  if(!any&&S.cls!=='sug')h+='<p class="sub12">'+esc(tt('pNoYet'))+'</p>';
  if(S.cls==='sug')h+='<div class="ps15"><button class="b12 pri" data-a="x15-pstart" data-id="'+esc(id)+'">'+I('play')+'<span>'+esc(tt('pStart'))+'</span></button><button class="b12" data-a="x15-pnot" data-id="'+esc(id)+'">'+esc(tt('pNotNow'))+'</button></div>';
  h+=cbox12({key:'proc-'+id,task:{id:id,project_id:tk.project_id||null}})+'<button class="btn11 wide" data-a="gclose">'+esc(t('close'))+'</button>';
  UI.gsheet={k:'proc15',id:id};gOpen(h,'var(--royal)');}
/* + New → Process: one sheet; the type chips swap the extra fields and keep what you typed */
function pfRead15(f){var g=function(i){var e=f.querySelector('#'+i);return e?String(e.value||'').trim():'';},c=readChips15(f);
  return {type:(f.querySelector('[data-a=x15-ptype][aria-pressed=true]')||{dataset:{id:'ab'}}).dataset.id,name:g('p15n'),goal:g('p15g'),gt:g('p15gt'),gn:g('p15gn'),gd:g('p15gd'),pid:g('p15p'),who:g('p15w'),know:g('p15k'),links:g('p15l'),chans:c.chans||[],auto:c.auto||[],
    test:c.test||'',va:g('p15va'),vb:g('p15vb'),measure:c.measure||'',buyer:g('p15b'),week:g('p15wk'),fu:c.fu||'',days:g('p15dy'),offer:g('p15o'),from:g('p15f'),to:g('p15t')};}
function procForm15(K){K=K||{};var ty=PT15.indexOf(K.type)>-1?K.type:'ab',G=myGoalList(),R=(prefs0().interview||{}).rules||prefs0().rules||{},auto=K.auto||(Array.isArray(R.auto)?R.auto:['research','drafts','remind']),ask=Array.isArray(R.ask)?R.ask:['send','price','posts','spend'];
  var ta=function(id,lab,v,rows,dir){return fl(id,lab,'<textarea id="'+id+'" rows="'+(rows||3)+'" dir="'+(dir||'auto')+'" maxlength="2000">'+esc(v||'')+'</textarea>');};
  var h='<p class="ql12">'+esc(tt('pType'))+'</p><div class="chq12" role="group" aria-label="'+esc(tt('pType'))+'">'+PT15.map(function(k){return '<button type="button" class="chp12" data-a="x15-ptype" data-id="'+k+'" aria-pressed="'+(k===ty)+'"><span>'+esc(tt('pt_'+k))+'</span></button>';}).join('')+'</div>'
   +fl('p15n',tt('pName'),inp('p15n',{req:1,max:80,v:K.name}))
   +fl('p15g',tt('pGoal'),'<select id="p15g"><option value="">'+esc(tt('pGoalNone'))+'</option>'+G.map(function(g,j){return '<option value="'+j+'"'+(String(K.goal)===String(j)?' selected':'')+'>'+esc(cut(g.t,60))+'</option>';}).join('')+'<option value="new"'+(K.goal==='new'?' selected':'')+'>'+esc(tt('pGoalNew'))+'</option></select>')
   +'<div class="gnew15"'+(K.goal==='new'?'':' hidden')+'>'+fl('p15gt',tt('pGoalT'),inp('p15gt',{max:140,v:K.gt}))+fl('p15gn',tt('pGoalN'),inp('p15gn',{max:40,v:K.gn}))+fl('p15gd',tt('pGoalD'),inp('p15gd',{type:'date',v:K.gd||addDays(30)}))+'</div>'
   +fl('p15p',tt('pProj'),'<select id="p15p">'+projOpts(K.pid!==undefined?K.pid:curProj())+'</select>')+fl('p15w',tt('pWho'),inp('p15w',{max:200,v:K.who}))
   +'<p class="ql12">'+esc(tt('pChan'))+'</p>'+chips15('chans',PCH15,'pc_',K.chans,1,{lab:tt('pChan')});
  if(ty==='ab')h+='<p class="ql12">'+esc(tt('pTest'))+'</p>'+chips15('test',['msg','btn','subj'],'pa_',[K.test||'msg'],0,{lab:tt('pTest')})+ta('p15va',tt('pVa'),K.va,2)+ta('p15vb',tt('pVb'),K.vb,2)+'<p class="ql12">'+esc(tt('pMeasure'))+'</p>'+chips15('measure',['replies','accepts','clicks'],'pm_',[K.measure||'replies'],0,{lab:tt('pMeasure')});
  else if(ty==='lead')h+=fl('p15b',tt('pBuyer'),inp('p15b',{max:200,v:K.buyer}))+fl('p15wk',tt('pWeek'),inp('p15wk',{type:'number',min:1,v:K.week||20}))+'<p class="ql12">'+esc(tt('pFu'))+'</p>'+chips15('fu',['0','1','2'],'n15_',[K.fu||'1'],0,{lab:tt('pFu')})+fl('p15dy',tt('pDays'),inp('p15dy',{type:'number',min:1,v:K.days||3}));
  else if(ty==='campaign')h+=fl('p15o',tt('pOffer'),inp('p15o',{max:200,v:K.offer}))+fl('p15f',tt('pFrom'),inp('p15f',{type:'date',v:K.from||addDays(1)}))+fl('p15t',tt('pTo'),inp('p15t',{type:'date',v:K.to||addDays(15)}))+'<p class="bud15"><b>'+esc(tt('pBudget'))+'</b> <span>'+esc(tt('pBudgetX'))+'</span></p>';
  h+=ta('p15k',tt('pKnow'),K.know,3)+ta('p15l',tt('pLinks'),K.links,2,'ltr')
   +'<p class="ql12">'+esc(tt('pAuto'))+'</p>'+chips15('auto',['research','drafts','remind','follow'],'a_',auto,1,{lab:tt('pAuto')})+'<p class="hint15">'+esc(tt('pAsk',{x:ask.map(function(x){return tt('k_'+x);}).join(', ')||tt('none')}))+'</p>';
  UI.gsheet={k:'proc15f'};gOpen('<h2 id="gTitle">'+esc(tt('pfH'))+'</h2><form id="pf15" class="ed12" novalidate>'+h+'<p class="err13" id="p15e" role="alert"></p><div class="obnav"><button type="button" class="btn11" data-a="x13-new" data-id="">'+esc(tt('back'))+'</button><button type="submit" class="btn11 pri grow">'+I('check')+'<span>'+esc(tt('pCreate'))+'</span></button></div></form>','var(--royal)');}
Object.assign(L11.en,{n15_0:'None',n15_1:'1',n15_2:'2',pGoalNone:'No goal yet'});Object.assign(L11.he,{n15_0:'בלי',n15_1:'1',n15_2:'2',pGoalNone:'בלי יעד כרגע'});
document.addEventListener('change',function(e){var x=e.target;if(x&&x.id==='p15g'){var b=document.querySelector('#pf15 .gnew15');if(b)b.hidden=x.value!=='new';}});
document.addEventListener('submit',function(e){var f=e.target;if(!f||f.id!=='pf15')return;e.preventDefault();var K=pfRead15(f),er=$('p15e'),go=f.querySelector('[type=submit]'),bad=function(m,el){er.textContent=m;if(el)el.focus();};
  if(!K.name)return bad(HE()?'חסר שם.':'Write a name.',$('p15n'));
  if(K.goal==='new'&&(!K.gt||!/^\d{4}-\d\d-\d\d$/.test(K.gd)))return bad(tt('pNeedGoal'),$('p15gt'));
  if(!J8.status().connected||navigator.onLine===false)return bad(t('notConn'));if(go)go.disabled=true;
  var G=myGoalList(),goal=K.goal==='new'?{t:K.gt+(K.gn?' · '+K.gn:''),at:K.gd,pid:K.pid||null,src:'app'}:K.goal!==''&&G[+K.goal]?G[+K.goal]:null,st=stamp(),id='t-proc-'+K.type+'-'+st,pid=K.pid||null,me=meId15();
  var L=links15(K.links),cl=function(n,lo,hi,d){n=parseInt(n,10);return isNaN(n)?d:Math.max(lo,Math.min(hi,n));};
  var intake={name:K.name.slice(0,80),goal:goal?{t:goal.t,at:goal.at}:null,who:K.who.slice(0,200),chans:K.chans,know:K.know.slice(0,2000),links:L,auto:K.auto};
  if(K.type==='ab')intake.ab={what:K.test||'msg',a:K.va.slice(0,2000),b:K.vb.slice(0,2000)};
  if(K.type==='lead')intake.lead={buyer:K.buyer.slice(0,200),week:cl(K.week,1,500,20),fu:cl(K.fu,0,2,1),days:cl(K.days,1,30,3)};
  if(K.type==='campaign')intake.campaign={offer:K.offer.slice(0,200),from:K.from||null,to:K.to||null,budget:0};
  var measure=K.type==='ab'?(K.measure||'replies'):K.type==='lead'?'replies':K.type==='campaign'?'clicks':null;
  var en=function(k){return L11.en[k]||k;},sum=['Type: '+en('pt_'+K.type),goal?'Goal: '+goal.t+(goal.at?' (by '+goal.at+')':''):'',intake.who?'Audience: '+intake.who:'',K.chans.length?'Channels: '+K.chans.map(function(c){return en('pc_'+c);}).join(', '):'',
    intake.ab?'Test: '+en('pa_'+intake.ab.what)+' · measure: '+en('pm_'+measure):'',intake.lead?'Ideal buyer: '+(intake.lead.buyer||'(J8 proposes)')+' · '+intake.lead.week+' a week · '+intake.lead.fu+' follow-ups, '+intake.lead.days+' days apart':'',
    intake.campaign?'Offer: '+(intake.campaign.offer||'(J8 proposes)')+' · '+(intake.campaign.from||'?')+' to '+(intake.campaign.to||'?')+' · budget 0 (never spends without OK)':'',intake.know?'Known: '+cut(intake.know,400):'',
    'J8 may: '+(K.auto.map(function(a){return en('a_'+a);}).join(', ')||'nothing without asking'),'Nothing goes out without your OK.'].filter(Boolean).join('\n');
  var doc={project_id:pid,title:'Process: '+intake.name,action:sum.slice(0,2000),owner:POWN15[K.type],status:'open',source:'j8nix-process',by:'J8NIX app',blocked_by:[],extra:{process:{type:K.type,v:1,stage:'intake',intake:intake,measure:measure,goal:goal?goal.t:null,created_by:me}}};
  var fail=function(x){if(go)go.disabled=false;var m=(x&&(x.message||x.code))||'error';bad(navigator.onLine===false||/fetch|network/i.test(m)?t('notConn'):t('couldNot',{e:m}));};
  var gp=K.goal==='new'?prefSet({goals:G.concat([goal]).slice(-10)},{'j8-goals':G.concat([goal]).slice(-10)}):Promise.resolve();
  Promise.resolve(gp).then(function(){return J8.tasks.add(id,doc);}).then(function(){return J8.inbox.send(pid||'p-general','Start process: '+intake.name,id).catch(function(){});})
   .then(function(){made('process',tt('pMade'),null,'<button class="btn11 pri" data-a="x15-popen" data-id="'+esc(id)+'">'+I('eye')+'<span>'+esc(tt('pOpen'))+'</span></button>');},fail);},true);

/* entry points: + New, ⌘K, sidebar, Me, project page */
var nf15=newForm;newForm=function(kind,ed){if(kind==='process')return procForm15(ed);if(kind==='voice')return voiceSheet15();return nf15(kind,ed);};
var ns15=newSheet;newSheet=function(){ns15();var g=document.querySelector('#gsheet .nw13');if(g)g.insertAdjacentHTML('beforeend',[['process','repeat','nProc','nProcP'],['voice','mic','nVoice','nVoiceP']].map(function(o){return '<button class="nwo13 k-'+o[0]+'" data-a="x13-new" data-id="'+o[0]+'"><span class="well11 r">'+I(o[1])+'</span><span><b>'+esc(tt(o[2]))+'</b><small>'+esc(tt(o[3]))+'</small></span>'+I('fwd','flip chev')+'</button>';}).join(''));};
var ai15=askItems;askItems=function(q){var R=ai15(q),Q=String(q||'').trim().toLowerCase();[['process','repeat',tt('pNew')],['voice','mic',tt('nVoice')]].forEach(function(a){if(!Q||a[2].toLowerCase().indexOf(Q)>-1)R.unshift({g:'acts',id:'act:new-'+a[0],ic:a[1],l:a[2]});});return R.slice(0,16);};
var sr15=sideRender;sideRender=function(){sr15();var sg=$('sideG');if(!sg||!connected)return;var b=sg.querySelector('[data-a=x15-procs]');if(!b){var m=sg.querySelector('[data-a=x13-mem]'),hx='<button class="sg proc15" data-a="x15-procs">'+I('repeat')+'<span class="lbl">'+esc(tt('procsH'))+'</span></button>';if(m)m.insertAdjacentHTML('afterend',hx);else sg.insertAdjacentHTML('beforeend',hx);b=sg.querySelector('[data-a=x15-procs]');}
  if(UI.v==='procs')b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');};
var vMe15=vMe;vMe=function(){var h=vMe15();if(!connected)return h;var x='<button class="opt" data-a="x13-mem">';var add='<button class="opt" data-a="x15-voice">'+I('mic')+'<span>'+esc(tt('vH'))+'</span></button><button class="opt" data-a="x15-procs">'+I('repeat')+'<span>'+esc(tt('procsH'))+'</span></button>';
  var j=h.indexOf(x);if(j<0)return h;var k=h.indexOf('</button>',j);return h.slice(0,k+9)+add+h.slice(k+9);};
var ppt15=projPlanTag;projPlanTag=function(p){var h=ppt15(p);if(!p||!connected)return h;var L=procs15(p.id);if(!L.length)return h;
  return h+'<section class="pp15"><h3 class="sh12">'+I('repeat')+'<span>'+esc(tt('procsH'))+'</span>'+' <span class="n12"><bdi>'+L.length+'</bdi></span><button class="lnk12" data-a="x15-pnew" data-id="'+esc(p.id)+'">'+I('plus')+'<span>'+esc(tt('pNew'))+'</span></button></h3><ul class="pl15">'+L.map(pCard15).join('')+'</ul></section>';};
PLACE.procs='me';PLACE.voice='me';
var vN15=vNext;vNext=function(){return UI.v==='procs'?vProcs15():UI.v==='voice'?vVoice15():vN15();};
function goView15(v){gClose();UI.stack=[{v:UI.v===v?'me':UI.v}];UI.v=v;render(true);}

/* drafts: "Sounds like you · N%" only when an arm scored it (extra.voice); a plan gate says nothing is sent */
var dc15=draftCheck;draftCheck=function(){var h=dc15();if(!h)return h;var cur=(UI.dids||[]).filter(isPend)[0],a=cur?AP[cur]:null;if(!a)return h;var add='';
  if(px(a,'no_send')){var ns='<li class="ns15">'+esc(tt('noSend'))+'</li>',h2=h.replace(/<li>[^<]*<\/li>(<li><bdi>)/,ns+'$1');if(h2!==h)h=h2;else add+=ns;}
  var v=px(a,'voice');if(v&&typeof v==='object'&&isNum(v.score)){var n=Math.max(0,Math.min(100,Math.round(v.score))),c=n>=85?'g':n>=70?'o':'r',ms=Array.isArray(v.miss)?v.miss.filter(function(x){return typeof x==='string'&&x;}).slice(0,3):[];
    add+='<li class="vl15x"><span class="vsc15 '+c+'"><bdi>'+esc(tt('vLine',{n:n}))+'</bdi></span>'+(ms.length?'<small dir="auto">'+esc(tt('vMiss',{x:ms.join(' · ')}))+'</small>':'')+'</li>';}
  return add?h.replace(/<\/ul><\/aside>$/,add+'</ul></aside>'):h;};

window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a^="x15-"]');if(!el)return;e.preventDefault();e.stopPropagation();var a=el.dataset.a,id=el.dataset.id||'';
  if(a==='x15-vc'){if(el.disabled)return;var g=el.closest('.vg15'),on=el.getAttribute('aria-pressed')==='true',mx=+(g.dataset.max||0),err=el.closest('form,.vf15,.obb');err=err&&err.querySelector('.vErr15,.err13,.err12');
    if(g.dataset.multi!=='1'){[].forEach.call(g.querySelectorAll('[data-a=x15-vc]'),function(b){b.setAttribute('aria-pressed','false');});if(!on)el.setAttribute('aria-pressed','true');return;}
    if(!on&&mx&&g.querySelectorAll('[aria-pressed=true]').length>=mx){if(err)err.textContent=tt('vMax',{n:mx});return;}if(err)err.textContent='';el.setAttribute('aria-pressed',on?'false':'true');return;}
  if(a==='x15-ptype'){var f=$('pf15');if(!f)return;var K=pfRead15(f);K.type=id;procForm15(K);return;}
  if(a==='x15-voice'){goView15('voice');return;}
  if(a==='x15-procs'){goView15('procs');return;}
  if(a==='x15-vteach'){voiceSheet15();return;}
  if(a==='x15-vsamp'){UI.memSamples=!UI.memSamples;render();return;}
  if(a==='x15-vsmem'){UI.memSamples=1;UI.memSrc=null;UI.stack=[{v:'voice'}];UI.v='mem';render(true);return;}
  if(a==='x15-vsw'){if(el.disabled)return;var pv=Object.assign({},prefs0().voice||{});if(id==='edits')pv.edits=pv.edits===false;else if(id==='mail'){if(!mailOk15())return;pv.mail=!pv.mail;}else return;prefSet({voice:pv}).then(function(){render();});render();return;}
  if(a==='x15-notme'){var m=myMem15().filter(function(x){return x.id===id;})[0];if(!m)return;el.disabled=true;
    J8.memory.archive(id,true).then(function(){return J8.memory.add({kind:'preference',text:('Not my style: '+m.text).slice(0,2000),tags:['voice','not-me'],project_id:null,source_message_id:null});})
     .then(function(){toast(tt('vNotMeT'));render();},function(x){el.disabled=false;toast(t('couldNot',{e:x&&(x.message||x.code)||'error'}));});return;}
  if(a==='x15-pnew'){gClose();procForm15(id?{pid:id}:{});return;}
  if(a==='x15-popen'){gClose();procSheet15(id);return;}
  if(a==='x15-pdrafts'){gClose();UI.lseg='drafts';UI.stack=[];navTo('list');return;}
  if(a==='x15-pstart'||a==='x15-pnot'||a==='x15-pon'){if(!J8.status().connected){toast(t('notConn'));return;}var tk=J8.tasks.get(id);if(!tk)return;var pid=tk.project_id||'p-general';el.disabled=true;
    if(a==='x15-pnot'){J8.tasks.drop(id).then(function(){gClose();toast(tt('deleted'),function(){J8.tasks.undo(id);});render();},function(x){el.disabled=false;toast(t('couldNot',{e:x&&x.code||'error'}));});return;}
    if(a==='x15-pstart'){J8.inbox.send(pid,'Start process: '+pName15(tk),id).then(function(){toast(tt('pStarted'));},function(x){el.disabled=false;toast(t('couldNot',{e:x&&x.code||'error'}));});return;}
    var au=(procOf15(tk)||{}).auto||[],it=au[+el.dataset.k];if(!it){el.disabled=false;return;}
    J8.inbox.send(pid,'Turn on: '+String(it.what||'').slice(0,200),id).then(function(){UI.ton15=UI.ton15||{};UI.ton15[id+'|'+el.dataset.k]=1;el.textContent=tt('pStarted');toast(tt('pAskedOn'));},function(x){el.disabled=false;toast(t('couldNot',{e:x&&x.code||'error'}));});return;}},true);
/* plan gates (extra.no_send): the main button says "OK to start" (never Send) and the toast says nothing is sent */
Object.assign(L11.en,{nsOk:'OK to start',nsOkT:'OK. J8 starts the process. Nothing is sent.'});Object.assign(L11.he,{nsOk:'אישור להתחיל',nsOkT:'אושר. J8 מתחיל את התהליך. שום דבר לא נשלח.'});
var vd15=vDraft;vDraft=function(){var h=vd15(),cur=(UI.dids||[]).filter(isPend)[0],a=cur?AP[cur]:null;if(!a||!px(a,'no_send'))return h;
  return h.replace(/(<button class="do" data-a="dsend"[^>]*>(?:<svg[\s\S]*?<\/svg>)?<span>)[^<]*(<\/span>)/,'$1'+esc(tt('nsOk'))+'$2');};
var ddc15=draftDecide;draftDecide=function(id,how){UI.ns15t=how==='send'&&px(AP[id],'no_send')?Date.now():0;return ddc15.apply(this,arguments);};
var dcd15=decide;decide=function(id,how){UI.ns15t=how==='send'&&px(AP[id],'no_send')?Date.now():0;return dcd15.apply(this,arguments);};

/* the toast (Dave, 18 Nov 12:58): one compact line, white with a palette accent (Green done · Slate cancelled · Red error), gone after 2.5 s,
   tap to dismiss, Undo kept. Phone: just above the bottom nav; desktop: top-right. It moves until it covers no visible button. */
function tTone15(m){var e=t('couldNot',{e:''}).split('(')[0].trim();
  if((e&&m.indexOf(e)===0)||m===t('notConn')||/^(It changed meanwhile|משהו השתנה)/.test(m))return 'r';
  return /^(Killed|Deleted|Forgot|Back to waiting|Not my|Cancel|Archived|לא יישלח|נמחק|נשכח|חזר להמתנה|בוטל|הועבר לארכיון)/i.test(m)?'s':'g';}
/* the visible buttons once per toast: rect + whether it sits in a fixed/sticky bar, a sheet or the nav (never covered) or in content that scrolls */
function tEls15(T){var vw=innerWidth,vh=innerHeight,o=[];[].forEach.call(document.querySelectorAll('button,a[href],input,textarea,select,[role=button],[data-a]'),function(el){if(T.contains(el))return;
  var q=el.getBoundingClientRect();if(!q.width||!q.height||q.right<=0||q.bottom<=0||q.left>=vw||q.top>=vh)return;
  var x=(Math.max(q.left,0)+Math.min(q.right,vw))/2,y=(Math.max(q.top,0)+Math.min(q.bottom,vh))/2,hit=document.elementFromPoint(x,y);if(!hit||!(el===hit||el.contains(hit)||hit.contains(el)))return;
  var fx=0;for(var n=el;n&&n!==document.body;n=n.parentElement){var ps=getComputedStyle(n).position;if(ps==='fixed'||ps==='sticky'||n.id==='gsheet'||/\b(nav|top|abar|sheet|obnav)\b/.test(n.className&&n.className.baseVal==null?n.className:'')){fx=1;break;}}
  o.push({l:q.left,r:q.right,t:q.top,b:q.bottom,fx:fx});});return o;}
function tFree15(E,r,fixedOnly){return !E.some(function(q){return (!fixedOnly||q.fx)&&q.r>r.left&&q.l<r.right&&q.b>r.top&&q.t<r.bottom;});}
function tPlace15(){var T=$('toast');if(!T)return;var vw=innerWidth,vh=innerHeight,w=T.offsetWidth,h=T.offsetHeight,nav=$('nav'),nr=nav&&nav.offsetParent?nav.getBoundingClientRect():null,ph=!!(nr&&nr.height&&nr.top<vh&&nr.top>vh/2&&nr.width>vw*.8),
    x=ph?Math.round((vw-w)/2):Math.max(16,vw-w-24),y0=ph?Math.round(nr.top-h-8):24,step=ph?-4:4,E=tEls15(T),best=null;
  [false,true].some(function(fo){for(var y=y0;ph?y>=8:y<=vh-h-8;y+=step)if(tFree15(E,{left:x,right:x+w,top:y,bottom:y+h},fo)){best=y;return true;}return false;});
  T.style.left=x+'px';T.style.top=(best==null?y0:best)+'px';}
var to15=toast;toast=function(msg,undo){var T=$('toast');msg=String(msg==null?'':msg);
  if(UI.ns15t&&Date.now()-UI.ns15t<15000&&tTone15(msg)==='g'&&!/^(Back to waiting|חזר להמתנה)/.test(msg)){msg=tt('nsOkT');UI.ns15t=0;}
  if(T){T.classList.add('t15');T.classList.remove('on','g','s','r');var k=tTone15(msg);T.classList.add(k);var u=T.querySelector(':scope>svg use');if(u)u.setAttribute('href',k==='g'?'#i-check':k==='s'?'#i-x':'#i-stuck');$('toastMsg').setAttribute('title',msg);}
  to15(msg,undo);if(!T)return;T.classList.remove('on');tPlace15();T.classList.add('on');clearTimeout(window.tt);window.tt=setTimeout(hideToast,2500);};
document.addEventListener('click',function(e){var T=$('toast');if(!T||!T.classList.contains('on')||!T.contains(e.target)||e.target.closest('#undo'))return;hideToast();});
window.addEventListener('resize',function(){var T=$('toast');if(T&&T.classList.contains('on'))tPlace15();});

window.j8v15={pieces:pieces15,lang:lang15,links:links15,voiceSave:voiceSave15,voiceSheet:voiceSheet15,procs:procs15,procForm:procForm15,openProc:procSheet15,stage:pStage15};

/* ===== 11.5.0 (18 Nov 2026, UX-SPEC 18 Nov + Dave 10:59): one colour = one meaning, finish lines, "Needs you" alerts, instant answers =====
   A. Status = glyph + word + colour, everywhere: Red ◆! = needs you now · Orange person = needs you · Sky people = team on it ·
      Haze lock = waiting · Green check = done · Gold coin = money (a tag) · Violet 8 = J8. Rows are coloured by who must act
      (data-s), never by project; a project shows only as its logo tile. Finish lines (segmented track + flag) are built only from
      fields that exist; "x of y steps to the milestone" shows only when a task carries extra.milestone (never faked).
   B. Alerts: a "Needs you" bar + badges for overdue / due within 24 h / a send, payment or deadline that waits on you. Phone alerts
      follow alerts.js (titles only, max 3 a day, quiet 22:00–08:00 and Shabbat, never a repeat).
   C. Instant answers: questions about the app's own state are answered from the data already loaded (no AI call, no extra network). */
Object.assign(L11.en,{sNow:'Needs you now',sYou:'Needs you',sTeam:'Team on it',sWait:'Waiting',sDone:'Done',sMoney:'Money',sKill:'Killed',sTodo:'Not started',
  sJ8:'J8',cNow:'{n} now',cYou:'{n} yours',cTeam:'{n} team',cWait:'{n} waiting',cDone:'{n} done',
  planH:'Today’s plan',planOf:'{a} of {b} moves done',planClear:'All clear for today',
  msNext:'Next milestone',msYou:'You hold it',msTeam:'Team holds it',msExt:'Waits on someone outside',msLeft:'{n} days left',msLeft1:'1 day left',msToday:'Due today',msOver:'{n} days late',
  msSteps:'{a} of {b} steps done',onTrack:'On track',parked:'Parked',noMove:'No move in {n} days',msNone:'No milestone yet. Tell J8 a goal and a date.',msAsk:'Tell J8',
  stepsH:'Steps',stepsOpen:'Open steps',doneWeek:'Done this week: {n}',noSteps:'No open steps.',stageOf:'Stage {a} of 6: {s}',moreN:'+{n} more',
  nyH:'Needs you',nyP:'Only you can move these',clearH:'Clear the list',clearOf:'{a} of {b} done',gNow:'Now',gNowP:'blocks the team or is due',gToday:'Today',gLeft:'{n} left',gDone:'Done today',gDoneP:'{n}, tap to reopen',
  reopen:'Reopen',reopened:'Back on your list.',nyEmpty:'Nothing needs you.',teamNext:'Team next run {t}: {r}.',teamNone:'No team run is scheduled.',lineUp2:'Line up next steps',
  dk:'Draft {k} of {n}',dDec:'{n} decided',dOk:'{n} approved',dKill:'{n} killed',dLeft:'{n} left',bCleared:'Batch cleared',sendRun:'After you approve, it goes out on the {t} send run.',sendRunN:'After you approve, the team sends it. Nothing goes out before.',
  approve:'Approve',more16:'More',sendsAt:'Sends at {t}.',doneT:'Done: {x}.',freesN:'Frees {n}.',noDraftsT:'No drafts waiting. Next team run: {r} at {t}.',
  alH:'Needs you',alH2:'Alerts',alOver:'Late: {x}',alDue:'Due {t}: {x}',alSend:'Blocks a send: {x}',alPay:'Blocks a payment: {x}',alDl:'Blocks a deadline: {x}',alGot:'Got it',alSeeAll:'See all',alMore:'+{n} more',
  alPushOn:'Turn on alerts on this phone',alPushP:'Titles only. At most 3 a day. Quiet 22:00–08:00 and on Shabbat.',alPushOk:'Alerts are on for this phone.',alPushNo:'Couldn’t turn on alerts ({e}).',alQuiet:'Phone alerts are quiet until {t}.',
  iaH:'Instant answer',iaSrc:'From the app’s data, {t}',iaTeam:'Ask the team too',iaAsked:'Sent to the team too.',iaMiss:'No instant answer for that. Sent to the team.',iaLocal:'Answered here. Not sent.',
  iaWait0:'Nothing waits on you right now.',iaWait:'{n} things wait on you ({r} now).',iaWait1:'1 thing waits on you.',iaOpenNy:'Open Needs you',
  iaSent0:'Nothing went out today yet.',iaSent:'{n} went out today: {x}.',iaDrafts:'Open drafts',
  iaRun0:'No team run is scheduled.',iaRun:'Next team run: {r} at {t}.',iaRunL:'Then: {x}.',
  iaApp:'Applications this week (since {d}): {s} sent, {q} approved and waiting to go, {p} wait for your OK.',
  iaProj:'{p}: stage {a} of 6 ({s}).',iaMs:'Next milestone: {m}, {d}.',iaMs0:'No milestone yet.',iaYou:'Your steps: {n}. Next: {x}.',iaYou0:'Nothing waits on you here.',iaTeamN:'Team steps open: {n}.',iaDr:'Drafts waiting: {n}.',iaUpd:'Last move: {t}.',iaOpenP:'Open {p}',
  iaMoney:'Booked {b} of {g} for M1 (by {d}). Updated {t}.',iaMoney0:'No money numbers yet.',
  iaDr0:'No drafts wait for your OK.',iaDrN:'{n} drafts wait for your OK, in {s} sets.',iaDr1:'1 draft waits for your OK.',
  iaDone:'Today: you did {y}, the team sent {s} and finished {r} runs.',iaHelp:'I can answer: where a project is at, what went out today, what waits on you, what runs next, applications this week, drafts, money.'});
Object.assign(L11.he,{sNow:'צריך אותך עכשיו',sYou:'צריך אותך',sTeam:'הצוות על זה',sWait:'מחכה',sDone:'בוצע',sMoney:'כסף',sKill:'בוטל',sTodo:'לא התחיל',
  sJ8:'J8',cNow:'{n} עכשיו',cYou:'{n} שלך',cTeam:'{n} צוות',cWait:'{n} מחכים',cDone:'{n} בוצעו',
  planH:'התוכנית של היום',planOf:'{a} מתוך {b} מהלכים בוצעו',planClear:'הכל נקי להיום',
  msNext:'אבן הדרך הבאה',msYou:'אצלך',msTeam:'אצל הצוות',msExt:'מחכה למישהו בחוץ',msLeft:'עוד {n} ימים',msLeft1:'עוד יום אחד',msToday:'להיום',msOver:'באיחור של {n} ימים',
  msSteps:'{a} מתוך {b} צעדים בוצעו',onTrack:'בתלם',parked:'בהמתנה',noMove:'אין תזוזה כבר {n} ימים',msNone:'עוד אין אבן דרך. ספרו ל־J8 יעד ותאריך.',msAsk:'לספר ל־J8',
  stepsH:'צעדים',stepsOpen:'צעדים פתוחים',doneWeek:'בוצעו השבוע: {n}',noSteps:'אין צעדים פתוחים.',stageOf:'שלב {a} מתוך 6: {s}',moreN:'עוד {n}',
  nyH:'מחכה לך',nyP:'רק את/ה יכול/ה להזיז את אלה',clearH:'לנקות את הרשימה',clearOf:'{a} מתוך {b} בוצעו',gNow:'עכשיו',gNowP:'חוסם את הצוות או בתאריך',gToday:'היום',gLeft:'נשארו {n}',gDone:'בוצע היום',gDoneP:'{n}, אפשר לפתוח מחדש',
  reopen:'לפתוח מחדש',reopened:'חזר לרשימה שלך.',nyEmpty:'שום דבר לא מחכה לך.',teamNext:'הריצה הבאה של הצוות {t}: {r}.',teamNone:'אין ריצה מתוכננת של הצוות.',lineUp2:'לסדר את הצעדים הבאים',
  dk:'טיוטה {k} מתוך {n}',dDec:'{n} הוחלטו',dOk:'{n} אושרו',dKill:'{n} בוטלו',dLeft:'נשארו {n}',bCleared:'הסט נוקה',sendRun:'אחרי האישור זה יוצא בריצת השליחה של {t}.',sendRunN:'אחרי האישור הצוות שולח. שום דבר לא יוצא לפני.',
  approve:'לאשר',more16:'עוד',sendsAt:'יוצא ב־{t}.',doneT:'בוצע: {x}.',freesN:'משחרר {n}.',noDraftsT:'אין טיוטות שמחכות. הריצה הבאה: {r} ב־{t}.',
  alH:'מחכה לך',alH2:'התראות',alOver:'באיחור: {x}',alDue:'עד {t}: {x}',alSend:'חוסם שליחה: {x}',alPay:'חוסם תשלום: {x}',alDl:'חוסם דדליין: {x}',alGot:'ראיתי',alSeeAll:'לכל הרשימה',alMore:'עוד {n}',
  alPushOn:'להפעיל התראות בטלפון הזה',alPushP:'רק כותרות. עד 3 ביום. שקט ב־22:00–08:00 ובשבת.',alPushOk:'ההתראות פועלות בטלפון הזה.',alPushNo:'לא הצלחנו להפעיל התראות ({e}).',alQuiet:'ההתראות בטלפון שקטות עד {t}.',
  iaH:'תשובה מיידית',iaSrc:'מהנתונים באפליקציה, {t}',iaTeam:'לשאול גם את הצוות',iaAsked:'נשלח גם לצוות.',iaMiss:'אין לזה תשובה מיידית. נשלח לצוות.',iaLocal:'נענה כאן. לא נשלח.',
  iaWait0:'כרגע שום דבר לא מחכה לך.',iaWait:'{n} דברים מחכים לך ({r} עכשיו).',iaWait1:'דבר אחד מחכה לך.',iaOpenNy:'לפתוח את "מחכה לך"',
  iaSent0:'היום עוד לא יצא כלום.',iaSent:'היום יצאו {n}: {x}.',iaDrafts:'לפתוח טיוטות',
  iaRun0:'אין ריצה מתוכננת של הצוות.',iaRun:'הריצה הבאה של הצוות: {r} ב־{t}.',iaRunL:'אחריה: {x}.',
  iaApp:'מועמדויות השבוע (מאז {d}): {s} נשלחו, {q} אושרו ומחכות לצאת, {p} מחכות לאישור שלך.',
  iaProj:'{p}: שלב {a} מתוך 6 ({s}).',iaMs:'אבן הדרך הבאה: {m}, {d}.',iaMs0:'עוד אין אבן דרך.',iaYou:'הצעדים שלך: {n}. הבא: {x}.',iaYou0:'כאן שום דבר לא מחכה לך.',iaTeamN:'צעדים פתוחים של הצוות: {n}.',iaDr:'טיוטות שמחכות: {n}.',iaUpd:'תזוזה אחרונה: {t}.',iaOpenP:'לפתוח את {p}',
  iaMoney:'נסגרו {b} מתוך {g} ל־M1 (עד {d}). עודכן {t}.',iaMoney0:'עוד אין מספרים של כסף.',
  iaDr0:'אין טיוטות שמחכות לאישור שלך.',iaDrN:'{n} טיוטות מחכות לאישור שלך, ב־{s} סטים.',iaDr1:'טיוטה אחת מחכה לאישור שלך.',
  iaDone:'היום: עשית {y}, הצוות שלח {s} וסיים {r} ריצות.',iaHelp:'אפשר לשאול: איפה פרויקט עומד, מה יצא היום, מה מחכה לי, מה רץ הבא, מועמדויות השבוע, טיוטות, כסף.'});

/* ---------- A. state: one vocabulary (now · you · team · wait · done), plus money and J8 tags ---------- */
var ST16={now:['bang','sNow'],you:['you','sYou'],team:['team','sTeam'],wait:['lock','sWait'],done:['check','sDone'],kill:['x','sKill'],todo:['','sTodo'],money:['coin','sMoney'],j8:['eight','sJ8']};
function stG(s,lab){var d=ST16[s]||ST16.wait;return '<span class="st12" data-s="'+s+'" role="img" aria-label="'+esc(lab||tt(d[1]))+'">'+(s==='j8'?g8i():d[0]?I(d[0]):'')+'</span>';}
function stChip(s,txt,sm){var d=ST16[s]||ST16.wait;return '<span class="chip12 s16'+(sm?' sm':'')+'" data-s="'+s+'">'+(s==='j8'?g8i():d[0]?I(d[0]):'')+'<bdi>'+txt+'</bdi></span>';}
function gItem16(id){var g=graph();return g&&g.it?g.it[id]:null;}
function blocksTeam16(i){if(i.held&&i.held.dave)return true;return (i.ul||[]).some(function(id){var x=gItem16(id);if(!x||!x.o)return false;if(x.k==='task')return x.o.owner&&x.o.owner!=='dave';if(x.k==='approval')return ['approved','queued','edited'].indexOf(x.o.status)>-1;return false;});}
function apsOf16(i){return i.batch?i.batch.items:i.ap?[i.ap]:i.held?i.held.items:[];}
/* a date without a time is due by the end of that day (pd() can't read a bare date) */
function pdue16(s){s=String(s||'').trim();return /^\d{4}-\d\d-\d\d$/.test(s)?new Date(s+'T23:59:00').getTime():pd(s);}
function dueMs16(i){var d=i.due?i.due.getTime():NaN;apsOf16(i).forEach(function(a){var x=pdue16(a.due_at);if(!isNaN(x)&&(isNaN(d)||x<d))d=x;});if(i.task){['due','due_at'].forEach(function(k){var x=pdue16(i.task[k]);if(!isNaN(x)&&(isNaN(d)||x<d))d=x;});}return d;}
/* "Needs you now": 🔴, late or due within 2 h, the team asked for you on a draft, or it blocks the team */
function nowOf16(i){if(!i)return false;if(i.sev==='r')return true;var d=dueMs16(i);if(!isNaN(d)&&d-Date.now()<=2*36e5)return true;
  if(apsOf16(i).some(function(a){return /needs\s+dave/i.test(String(a.result||''));}))return true;return blocksTeam16(i);}
function itemSt16(i){return nowOf16(i)?'now':'you';}
function taskSt16(t){if(!t)return 'wait';if(t.status==='done')return 'done';if(t.status==='dropped')return 'kill';if(openBlk(t.id).length)return 'wait';
  if(t.owner==='dave'){var r=rowByKey('tk-'+t.id);return r&&nowOf16(lead1(r))?'now':'you';}return 'team';}
function apSt16(a){if(!a)return 'wait';var s=a.status||'pending';if(s==='sent')return 'done';if(s==='killed')return 'kill';if(['approved','queued','edited'].indexOf(s)>-1)return 'team';
  if((a.blocked_by||[]).length&&openBlk(a.id).length)return 'wait';return /needs\s+dave/i.test(String(a.result||''))?'now':'you';}
function projSt16(p){if(!p)return 'wait';if(isDoneP(p))return 'done';if(p.status==='parked'||p.milestone_by==='external')return 'wait';var sd=stalledDays(p);if(sd!=null&&sd>=14)return 'wait';
  var M=projNeed(p.id);if(M.length)return M.some(nowOf16)?'now':'you';return 'team';}
/* the row carries its state (data-s → rail colour), its glyph replaces the dot, its project shows as a logo tile */
function stAttr16(h,s){var e=h.indexOf('>');if(e<0)return h;var tag=h.slice(0,e).replace(/ style="--pc:[^";]*;?/,' style="').replace(/ style=""/,'');return tag+' data-s="'+s+'"'+h.slice(e);}
function rowFix16(h,i){var s=itemSt16(i),pid=rowPid(i);h=stAttr16(h,s).replace(/<span class="dot12 [a-z]+" aria-hidden="true"><\/span>/,stG(s));
  if(pid&&pid!=='p-general'&&pobj(pid))h=h.replace(/<small dir="auto">/,'<small dir="auto">'+ptile(pid,'sm'));return h;}
row12=function(i,num){return rowFix16(row13(i,num),i);};
qrow12=function(i,num,cur){return rowFix16(qrow13(i,num,cur),i);};
trow12=function(i,num,sel){return rowFix16(trow13(i,num,sel),i);};
prow12=function(p,sel){return stAttr16(prow13(p,sel),projSt16(p));};
var fm16=flowMap;flowMap=function(){return lanes16(fm16());};
var fmd16=flowMapD;flowMapD=function(){return lanes16(fmd16());};
function lanes16(h){return String(h).replace(/<button class="(ln12|gr12)"([^>]*?) data-id="([^"]*)"([^>]*?) style="--pc:[^"]*"/g,function(m,c,a,id,b){var p=pobj(id.replace(/&quot;/g,'"').replace(/&amp;/g,'&'));return '<button class="'+c+'"'+a+' data-id="'+id+'"'+b+' data-s="'+(p?projSt16(p):'wait')+'"';});}

/* ---------- finish-line track: one segment per item (grouped when there are more than 16), ending in a flag ---------- */
var TORD16=['done','kill','now','you','team','wait','todo'];
function track16(S,flag,pulse){S=S.slice().sort(function(a,b){return TORD16.indexOf(a)-TORD16.indexOf(b);});var segs='';
  if(S.length<=16)segs=S.map(function(s){return '<i class="s" data-s="'+s+'"></i>';}).join('');
  else{var c={};S.forEach(function(s){c[s]=(c[s]||0)+1;});segs=TORD16.filter(function(s){return c[s];}).map(function(s){return '<i class="s" data-s="'+s+'" style="flex-grow:'+c[s]+'"></i>';}).join('');}
  return '<div class="tr16'+(pulse?' all':'')+'" aria-hidden="true">'+segs+'<span class="flag16"><i></i>'+(flag?'<bdi>'+esc(flag)+'</bdi>':'')+'</span></div>';}
function legend16(S){var c={};S.forEach(function(s){c[s]=(c[s]||0)+1;});var K={done:'cDone',now:'cNow',you:'cYou',team:'cTeam',wait:'cWait'};
  return '<p class="lg16">'+['done','now','you','team','wait'].filter(function(s){return c[s];}).map(function(s){return stChip(s,esc(tt(K[s],{n:c[s]})));}).join('')+(c.kill?stChip('kill',esc(tt('dKill',{n:c.kill}))):'')+'</p>';}
function fl16(head,count,S,flag,extra,cls){var all=S.length&&S.every(function(s){return s==='done'||s==='kill';});
  return '<section class="fl16'+(cls?' '+cls:'')+'"><header><b>'+esc(head)+'</b><span><bdi>'+esc(all&&cls==='plan16'?tt('planClear'):count)+'</bdi></span></header>'+track16(S,flag,all)+(extra||'')+'</section>';}

/* ---------- Today: "Today's plan: x of y moves done" (moves with a ref_id only, as in 11.3) ---------- */
function planSt16(){var dp=J8.day?J8.day.today():null,mv=dp&&dp.plan&&Array.isArray(dp.plan.moves)?dp.plan.moves:null;if(!mv)return null;var S=[];
  mv.forEach(function(m){var id=m&&m.ref_id;if(!id)return;var tk=J8.tasks&&J8.tasks.get(id),ap=AP[id];if(tk)S.push(taskSt16(Object.assign({id:id},tk)));else if(ap)S.push(apSt16(Object.assign({id:id},ap)));});return S;}
var tdp16=todayPanel;todayPanel=function(){var h=tdp16();if(!h)return h;var S=planSt16(),Y=youNext13(),j=0;
  h=h.replace(/<span class="dot12 [a-z]+" aria-hidden="true"><\/span>/g,function(){var i=Y[j++];return i?stG(itemSt16(i)):stG('you');})
   .replace('<span class="k y"><i></i>','<span class="k y">'+stG('you')).replace('<span class="k t"><i></i>','<span class="k t">'+stG('team'));
  if(S&&S.length){var d=S.filter(function(s){return s==='done'||s==='kill';}).length;
    h=h.replace(/<span class="bar">[\s\S]*?<\/span>(?=<span class="lg">)/,'').replace(/(<\/header>)/,'$1'+fl16(tt('planH'),tt('planOf',{a:d,b:S.length}),S,'',legend16(S),'plan16'));}
  return h;};

/* ---------- Next: the hero carries its state; empty Next points forward ---------- */
var hc16=heroCard;heroCard=function(i,ix){var s=itemSt16(i),h=hc16(i,ix);
  h=h.replace('<section class="hero12','<section data-s="'+s+'" class="hero12').replace(/(<span class="dtf">)<svg class="g8"[^>]*><use href="#eight"\/><\/svg>/,'$1'+stG(s));
  var pid=rowPid(i);return h;};
function teamNext16(){var L=schedList().map(function(s){return {s:s,t:nextRun(s)};}).filter(function(x){return !isNaN(x.t)&&x.t>Date.now();}).sort(function(a,b){return a.t-b.t;});return L;}
function sendRun16(){var L=teamNext16().filter(function(x){return /send/i.test(x.s.name||'');});return L[0]||null;}
function teamStrip16(){var L=teamNext16(),x=L[0];return '<p class="strip16" data-s="team">'+stG('team')+'<span>'+(x?esc(tt('teamNext',{t:hm2(x.t),r:x.s.name||''})):esc(tt('teamNone')))+'</span></p>';}
var vnx16=vNext;vNext=function(){if(UI.v==='needs16')return listWrap('tasks','<header class="ph"></header>'+vNeeds16());var h=vnx16();if(!connected||UI.v!=='next')return h;
  var ab=alertBar16(),tp=h.indexOf('<section class="td13"');if(ab){if(tp>-1){var te=h.indexOf('</section>',h.indexOf('<p class="rp13">',tp));h=te>-1?h.slice(0,te+10)+ab+h.slice(te+10):h.replace(/(<\/header>)/,'$1'+ab);}else h=h.replace(/(<\/header>)/,'$1'+ab);}
  if(!myQueue().length)h=h.replace(/(<section class="hero12 (?:clear|empty13|alldone13)[\s\S]*?<\/section>)/,'$1'+teamStrip16()+(/x13-lineup/.test(h)?'':'<p class="j8l16"><button class="lnk12 ai" data-a="x13-lineup">'+g8i()+'<span>'+esc(tt('lineUp2'))+'</span></button></p>'));
  return h;};

/* ---------- Needs you (List → Tasks on phone; the alert bar links here): Now · Today · Done today ---------- */
function doneToday16(){var T=tasksAll().filter(function(x){return x.owner==='dave'&&x.status==='done'&&isToday(pd(x.done_at));}).map(function(x){return {k:'t',o:x,at:pd(x.done_at)};});
  var A=J8.approvals.list().filter(function(a){return a.kind!=='template'&&a.status&&a.status!=='pending'&&isToday(pd(a.decided_at));}).map(function(a){return {k:'a',o:a,at:pd(a.decided_at)};});
  return T.concat(A).sort(function(a,b){return b.at-a.at;});}
function clearSt16(){var S=[];tasksAll().forEach(function(x){if(x.owner==='dave'&&(!x.status||x.status==='open'))S.push(taskSt16(x));});
  apPending().forEach(function(a){if(a.kind!=='template')S.push(apSt16(a));});doneToday16().forEach(function(){S.push('done');});return S;}
function nyRow16(i,s){var n=nextOf(i),pid=rowPid(i),p=pobj(pid),d=dueMs16(i),m=isNum(i.mins)?tt('min',{n:i.mins}):'';if(!isNaN(d)&&!isToday(d))m=dayStr(new Date(d));
  return '<li data-s="'+s+'"><button type="button" class="ny16" data-a="x14-open" data-k="'+esc(i.key)+'">'+stG(s)+'<span class="tx"><b dir="auto">'+esc(cap1(n.what))+'</b>'+(p&&pid!=='p-general'?'<small dir="auto">'+ptile(pid,'sm')+esc(p.name)+(i.money?' '+stChip('money',esc(tt('sMoney')),1):'')+'</small>':'')+'</span>'+(m?'<span class="m">'+esc(m)+'</span>':'')+I('fwd','flip chev')+'</button></li>';}
function vNeeds16(){if(!connected)return skel(4);var N=myQueue(),now=N.filter(nowOf16),rest=N.filter(function(i){return !nowOf16(i);}),D=doneToday16(),S=clearSt16(),dn=S.filter(function(s){return s==='done';}).length;
  var h=alertBar16(true)+fl16(tt('clearH'),tt('clearOf',{a:dn,b:S.length}),S,'','','clear16');
  if(!N.length)h+='<section class="empty12 ny0">'+stG('done')+'<span>'+esc(tt('nyEmpty'))+'</span></section>'+teamStrip16()+'<p class="j8l16"><button class="lnk12 ai" data-a="x13-lineup">'+g8i()+'<span>'+esc(tt('lineUp2'))+'</span></button></p>';
  if(now.length)h+='<h3 class="sh16">'+stG('now')+'<b>'+esc(tt('gNow'))+'</b><span>'+esc(tt('gNowP'))+'</span></h3><ul class="ny16l">'+now.map(function(i){return nyRow16(i,'now');}).join('')+'</ul>';
  if(rest.length)h+='<h3 class="sh16">'+stG('you')+'<b>'+esc(tt('gToday'))+'</b><span>'+esc(tt('gLeft',{n:rest.length}))+'</span></h3><ul class="ny16l">'+rest.map(function(i){return nyRow16(i,'you');}).join('')+'</ul>';
  if(D.length)h+='<h3 class="sh16">'+stG('done')+'<b>'+esc(tt('gDone'))+'</b><span>'+esc(tt('gDoneP',{n:D.length}))+'</span></h3><ul class="ny16l dn">'+D.slice(0,12).map(function(x){var o=x.o,pid=x.k==='t'?o.project_id:o.product,p=pobj(pid),ttl=x.k==='t'?o.title:apKind(o)+': '+apWho(o);
    return '<li data-s="done"><div class="ny16">'+stG(o.status==='killed'?'kill':'done')+'<span class="tx"><b dir="auto">'+esc(cap1(ttl))+'</b>'+(p&&pid!=='p-general'?'<small dir="auto">'+ptile(pid,'sm')+esc(p.name)+'</small>':'')+'</span>'+(x.k==='t'?'<button type="button" class="lnk" data-a="x16-reopen" data-id="'+esc(o.id)+'">'+I('undo')+'<span>'+esc(tt('reopen'))+'</span></button>':'')+'</div></li>';}).join('')+'</ul>';
  return '<div class="ny16w">'+h+'</div>';}
/* phone List: Projects · Tasks · Drafts, like desktop */
function seg3_16(seg){var A=apPending().length,P=liveP().filter(function(p){return !isDoneP(p);}).length,N=connected?myQueue().length:0;
  return '<nav class="seg12 three" aria-label="'+esc(tt('list'))+'">'+[['proj','proj',tt('projects'),P],['tasks','steps',tt('tasks'),N],['drafts','inbox',tt('drafts'),A]].map(function(x){return '<button data-a="x12-lseg" data-id="'+x[0]+'" aria-pressed="'+(x[0]===seg)+'">'+I(x[1])+'<span>'+esc(x[2])+'</span>'+(x[3]?'<span class="n12"><bdi>'+x[3]+'</bdi></span>':'')+'</button>';}).join('')+'</nav>';}
var lw16=listWrap;listWrap=function(seg,html){if(D12())return lw16(seg,html);
  if(seg!=='tasks')return lw16(seg,html).replace(/<nav class="seg12 two"[\s\S]*?<\/nav>/,seg3_16(seg));
  UI.lseg='tasks';return ph(tt('nyH'),esc(tt('nyP')))+seg3_16('tasks')+'<div class="lb12">'+stripHead(html)+'</div>';};
PLACE.needs16='list';TOPV.needs16=1;if(PLACES.indexOf('needs16')<0)PLACES.push('needs16');
var nv16=navTo;navTo=function(v){if(v==='list'&&!D12()&&UI.lseg==='tasks')v='needs16';if((v==='ltasks'||v==='needs16')&&!D12()){nav0('needs16');return;}if(v==='needs16')v='ltasks';nv16(v);};
var tmd16=tasksMD;tasksMD=function(){var h=tmd16();if(!connected)return h;var S=clearSt16(),dn=S.filter(function(s){return s==='done';}).length;return h.replace(/(<section class="ml12 pane12"[^>]*>)/,'$1'+fl16(tt('clearH'),tt('clearOf',{a:dn,b:S.length}),S,'','','clear16'));};

/* ---------- Project: stage path + next milestone card above "Your next step" (real fields only) ---------- */
function daysTo16(at){var d=String(at||'').slice(0,10);if(!/^\d{4}-\d\d-\d\d$/.test(d))return null;var a=new Date(d+'T12:00:00'),b=new Date(ymd(new Date())+'T12:00:00');return Math.round((a-b)/864e5);}
function linked16(p){if(!p||!p.milestone)return [];return tasksAll().filter(function(t){return t.project_id===p.id&&t.status!=='dropped'&&px(t,'milestone')===p.milestone;});}
function projHead16(p){var s=stageOf(p),st=projSt16(p),S=J8.projects.STAGES||[],sd=stalledDays(p),h='';
  h+='<header class="ph12 pj16h"><div class="pjt16">'+ptile(p.id,'lg')+'<div><h2 id="pageH" tabindex="-1" dir="auto">'+esc(p.name)+'</h2><p class="sub12">'+(s?esc(tt('stageOf',{a:s,s:stg(s)})):esc(t('xNoStage')))+'</p></div></div></header>';
  if(s){h+='<ol class="stg16" aria-label="'+esc(tt('stageOf',{a:s,s:stg(s)}))+'">';for(var k=1;k<=6;k++){var c=k<s?'done':k===s?(isDoneP(p)?'done':st):'todo';h+='<li class="'+(k<s?'dn':k===s?'cur':'')+'"'+(k===s?' aria-current="step"':'')+'>'+stG(c,stg(k)+': '+tt(ST16[c][1]))+'<span>'+esc(stg(k))+'</span></li>';}h+='</ol>';}
  if(!p.milestone){return h+'<section class="fl16 ms16 none">'+stG('j8')+'<span>'+esc(tt('msNone'))+'</span><button class="b12 sm ai" data-a="x13-new" data-id="goal">'+g8i()+'<span>'+esc(tt('msAsk'))+'</span></button></section>';}
  var by=p.milestone_by,hold=by==='dave'?['you','msYou']:by==='external'?['wait','msExt']:by==='team'?['team','msTeam']:(function(){var o=holderOf(p,mineBy());return o==='me'?['you','msYou']:o==='ext'?['wait','msExt']:['team','msTeam'];})();
  var L=linked16(p),LS=L.map(taskSt16),dn=LS.filter(function(x){return x==='done';}).length,dd=daysTo16(p.milestone_at),flag=p.milestone_at?dayShort(new Date(String(p.milestone_at).slice(0,10)+'T12:00:00')):'',C='';
  if(L.length)C+=stChip('done',esc(tt('msSteps',{a:dn,b:L.length})));
  if(dd!=null)C+=dd<0?stChip('now',esc(tt('msOver',{n:-dd}))):'<span class="chip12 plain">'+I('time')+'<bdi>'+esc(dd===0?tt('msToday'):dd===1?tt('msLeft1'):tt('msLeft',{n:dd}))+'</bdi></span>';
  if(p.status==='parked')C+=stChip('wait',esc(tt('parked')));else if(sd!=null&&sd>=14)C+=stChip('wait',esc(tt('noMove',{n:sd})));
  else if(dd!=null&&dd>=0&&!isDoneP(p))C+='<span class="chip12 plain ok16">'+I('target')+'<bdi>'+esc(tt('onTrack'))+'</bdi></span>';
  h+='<section class="fl16 ms16" data-s="'+hold[0]+'"><header><b>'+esc(tt('msNext'))+'</b>'+stChip(hold[0],esc(tt(hold[1])),1)+'</header><h3 dir="auto">'+esc(p.milestone)+'</h3>'
   +(L.length?track16(LS,flag):flag?'<div class="tr16 only" aria-hidden="true"><span class="flag16"><i></i><bdi>'+esc(flag)+'</bdi></span></div>':'')+(C?'<p class="lg16">'+C+'</p>':'')+'</section>';
  var T=tasksAll().filter(function(t){return t.project_id===p.id&&(!t.status||t.status==='open');}),wk=tasksAll().filter(function(t){return t.project_id===p.id&&t.status==='done'&&Date.now()-pd(t.done_at)<7*864e5;}).length;
  T.sort(function(a,b){return TORD16.indexOf(taskSt16(a))-TORD16.indexOf(taskSt16(b));});
  if(T.length)h+='<section class="stp16"><h3 class="sh16"><b>'+esc(tt('stepsOpen'))+'</b><span>'+esc(tt('doneWeek',{n:wk}))+'</span></h3>'+(T.length?'<ul class="ny16l">'+T.slice(0,6).map(function(t){var s2=taskSt16(t),who=t.owner==='dave'?tt('you'):(DEPT[t.owner]||t.owner||tt('team'));
    return '<li data-s="'+s2+'"><button type="button" class="ny16" data-a="x14-open" data-k="tk-'+esc(t.id)+'">'+stG(s2)+'<span class="tx"><b dir="auto">'+esc(cap1(t.title))+'</b><small dir="auto">'+esc(who)+(s2==='wait'?' · '+esc(tt('sWait')):'')+'</small></span>'+(isNum(t.minutes)?'<span class="m">'+esc(tt('min',{n:t.minutes}))+'</span>':'')+I('fwd','flip chev')+'</button></li>';}).join('')+'</ul>'+(T.length>6?'<p class="more16">'+esc(tt('moreN',{n:T.length-6}))+'</p>':''):'<p class="empty12">'+esc(tt('noSteps'))+'</p>')+'</section>';
  return h;}
pcount=function(){return '';};
['en','he'].forEach(function(l){var X=TX[l];if(!X)return;Object.assign(X,l==='he'?{draftNeed:'לקרוא, ואז לאשר, לערוך או לבטל.',draftGain:'זה יוצא בריצה הבאה של הצוות אחרי האישור שלך.',draftGainOff:'אישור שומר את זה מוכן; זה יוצא כשמפעילים שליחת מייל.',emailOff:'שליחת מייל כבויה, אז אישור שומר את זה מוכן עד שמפעילים אותה ב-Control.'}
  :{draftNeed:'read it, then Approve, Edit or Kill.',draftGain:'it goes out on the team’s next run after you approve.',draftGainOff:'Approve keeps it ready; it goes out once email sending is on.',emailOff:'Email sending is off, so Approve keeps it ready until you turn sending on in Control.'});});
var vpj16=vProj;vProj=function(){var p=pobj(UI.proj),h=vpj16();if(!p||!/<header class="ph proj">/.test(h))return h;
  return '<div class="pj16">'+h.replace(/<header class="ph proj">[\s\S]*?<\/header>/,projHead16(p))+'</div>';};
/* the step-list "x14-open" also opens a team task: open it as an item when it is one, else as a task sheet */
var oi16=openItem;openItem=function(k){if(rowByKey(k))return oi16(k);var m=/^tk-(.+)$/.exec(k||'');if(m&&J8.tasks.get(m[1])){threadSheet({task:m[1]});return;}return oi16(k);};

/* ---------- Drafts: batch track, one primary (Approve), Edit + Kill, Comment and Skip under "More" ---------- */
function batchOf16(){var L=UI.dids||[],first=AP[L[0]]||{},bk=UI.batch||bkey(Object.assign({id:L[0]},first));
  var all=J8.approvals.list().filter(function(a){return a.kind!=='template'&&bkey(a)===bk;});if(!all.length)all=L.map(function(id){return Object.assign({id:id},AP[id]||{});});return all;}
function draftTrack16(cur){var B=batchOf16(),S=B.map(function(a){return a.id===cur?(apSt16(a)==='now'?'now':'you'):(!a.status||a.status==='pending')?'todo':apSt16(a);}),
  ok=B.filter(function(a){return ['approved','queued','edited','sent'].indexOf(a.status)>-1;}).length,kl=B.filter(function(a){return a.status==='killed';}).length,lf=B.length-ok-kl,k=B.map(function(a){return a.id;}).indexOf(cur)+1;
  var C=(ok?stChip('done',esc(tt('dOk',{n:ok}))):'')+(kl?stChip('kill',esc(tt('dKill',{n:kl}))):'')+(lf?stChip('you',esc(tt('dLeft',{n:lf}))):'');
  return fl16(cur?tt('dk',{k:k,n:B.length}):tt('bCleared'),tt('dDec',{n:ok+kl}),S,'','<p class="lg16">'+C+'</p>','dr16');}
var vdx16=vDraft10;vDraft10=function(){var h=vdx16(),cur=(UI.dids||[]).filter(isPend)[0];if(!connected)return h;
  var place=function(x,tr){x=x.replace(/<div class="prog"[^>]*>[\s\S]*?<\/div>/,'');var j=x.indexOf('</section>');return j<0?tr+x:x.slice(0,j+10)+tr+x.slice(j+10);};
  if(!cur)return place(h,draftTrack16(null));
  var sr=sendRun16(),strip='<p class="strip16" data-s="team">'+stG('team')+'<span>'+esc(sr?tt('sendRun',{t:hm2(sr.t)}):tt('sendRunN'))+'</span></p>';
  h=h.replace(/<div class="sticky"><div class="abar"([^>]*)>([\s\S]*?)<\/div><\/div>/,function(m,attrs,inner){
    var pick=function(re){var x=inner.match(re);return x?x[0]:'';},send=pick(/<button class="do" data-a="dsend"[\s\S]*?<\/button>/),ed=pick(/<button data-a="dedit"[\s\S]*?<\/button>/),
      cm=pick(/<button class="cm" data-a="thread-ap"[\s\S]*?<\/button>/),sk=pick(/<button data-a="x-skip"[\s\S]*?<\/button>/),kl=pick(/<button class="kill" data-a="dkill"[\s\S]*?<\/button>/);
    if(!send||!kl)return m;
    send=send.replace('<button class="do"','<button class="do pri"').replace(/<use href="#i-send"\/>/,'<use href="#i-check"/>').replace(/(<span>)[^<]*(<\/span>)/,function(x,a,b){return /OK to start|אישור להתחיל/.test(x)?x:a+esc(tt('approve'))+b;});
    return '<div class="sticky"><div class="abar ab16"'+attrs+'>'+send+'<div class="ab2">'+ed+kl+'<details class="more16"><summary aria-label="'+esc(tt('more16'))+'">'+I('dots')+'</summary><div class="mm16">'+cm+sk+'</div></details></div></div></div>';});
  return place(h,draftTrack16(cur)+strip);};
var dmd16=draftsMD;draftsMD=function(){var h=dmd16();if(!connected||apPending().length)return h;var x=teamNext16()[0];return x?h.replace(esc(tt('noDrafts')),esc(tt('noDraftsT',{r:x.s.name||'',t:hm2(x.t)}))):h;};
var ir16=iRow;iRow=function(o){var h=ir16(o);var i=o&&o.i;if(!i||!i.batch||i.batch.items.length<2)return h;
  var B=J8.approvals.list().filter(function(a){return a.kind!=='template'&&bkey(a)===i.batch.id;}),S=B.map(function(a){return (!a.status||a.status==='pending')?'todo':apSt16(a);}),d=S.filter(function(s){return s!=='todo';}).length;
  return h.replace(/(<span class="rt">[\s\S]*?)(<\/span><\/button>)/,'$1<span class="btr16">'+track16(S,'')+'<small><bdi>'+esc(tt('dDec',{n:d}))+' / '+B.length+'</bdi></small></span>$2');};
var vib16=vInbox;vInbox=function(){var h=vib16();if(!connected||apPending().length)return h;var x=teamNext16()[0];
  return x?h.replace(/(<section class="empty10"><p>)[^<]*(<\/p>)/,'$1'+esc(tt('noDraftsT',{r:x.s.name||'',t:hm2(x.t)}))+'$2'):h;};

/* ---------- the calm done moment: glyph turns green, toast "Done: … Frees N." with Undo; no confetti ---------- */
function pop16(el){var g=el&&el.querySelector('.st12');if(!g)return;g.setAttribute('data-s','done');g.setAttribute('aria-label',tt('sDone'));g.innerHTML=I('check');if(!RM()){g.classList.remove('pop16');void g.offsetWidth;g.classList.add('pop16');}}
var md16=markDone;markDone=function(k){var i=rowByKey(k);if(i){var n=0;if(i.task){var id=i.task.id;n=(graph().out[id]||[]).filter(function(d){return openBlk(d).filter(function(x){return x!==id;}).length===0;}).length;}UI.dm16={x:cut(cap1(nextOf(i).what),48),n:n,at:Date.now()};
  var esk=window.CSS&&CSS.escape?CSS.escape(k):k;[].forEach.call(document.querySelectorAll('#hero12[data-k="'+esk+'"],#r-'+esk+',[data-kn="'+esk+'"]'),pop16);}
  return md16.apply(this,arguments);};
window.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-a=dsend]');if(!b)return;var sr=sendRun16(),ga=AP[b.dataset.id];UI.sa16=sr&&!(ga&&px(ga,'no_send'))?{t:hm2(sr.t),at:Date.now()}:null;},true);
var to16=toast;toast=function(msg,undo){msg=String(msg==null?'':msg);var D=UI.dm16;
  if(D&&undo&&Date.now()-D.at<15000){msg=tt('doneT',{x:D.x})+(D.n?' '+tt('freesN',{n:D.n}):'');UI.dm16=null;}
  else if(UI.sa16&&Date.now()-UI.sa16.at<15000&&/^(Approved|אושר)/.test(msg)){msg=msg.replace(/^(Approved\.|אושר\.)[\s\S]*$/,'$1')+' '+tt('sendsAt',{t:UI.sa16.t});UI.sa16=null;}
  to16(msg,undo);}; /* the 11.4 toast rule stays (gone in 2.5 s, Dave 18 Nov 12:58); Undo also lives on under Needs you → Done today → Reopen */
celebrate=function(h,p){toast(String(h||'')+(p?'. '+p:''));};window.j8cel=celebrate;

/* ---------- Me → Connections: connected = done check, off = waiting lock ---------- */
var vme16=vMe;vMe=function(){var h=vme16();return h.replace(/<span class="sub on">(?:<svg class="ico"[^>]*><use href="#i-check"\/><\/svg>)?/g,'<span class="sub on">'+stG('done')).replace(/<span class="sub ">/g,'<span class="sub off16">'+stG('wait'));};

/* ---------- B. alerts: the "Needs you" bar, badges, phone alerts switch ---------- */
function alSeen16(){var o=ls('j8-al16');return o&&typeof o==='object'?o:{};}
function alerts16(){if(!connected)return [];var now=Date.now(),seen=alSeen16(),L=[];
  myQueue().forEach(function(i){var d=dueMs16(i),why=null,lead=i;
    if(!isNaN(d)&&d<now)why='over';else if(!isNaN(d)&&d-now<=864e5)why='due';
    else if(i.batch||i.ap&&i.ap.kind!=='invoice'||(i.held&&i.held.dave)||(lead.ul||[]).some(function(id){var x=gItem16(id);return x&&x.k==='approval';}))why='send';
    else if(i.money||(i.ap&&i.ap.kind==='invoice')||(lead.ul||[]).some(function(id){var x=gItem16(id);return x&&x.k==='approval'&&x.o&&x.o.kind==='invoice';}))why='pay';
    else if((lead.ul||[]).some(function(id){var x=gItem16(id);if(!x||!x.o)return false;var dd=pdue16(x.o.due||x.o.due_at||x.o.milestone_at);return !isNaN(dd)&&dd-now<7*864e5;}))why='dl';
    if(!why)return;var k=i.key+'|'+why;L.push({k:k,i:i,why:why,d:d,lv:why==='over'||(why==='due'&&d-now<=2*36e5)||nowOf16(i)?'now':'you',seen:!!seen[k]});});
  return L.sort(function(a,b){return (a.lv==='now'?0:1)-(b.lv==='now'?0:1)||(isNaN(a.d)?Infinity:a.d)-(isNaN(b.d)?Infinity:b.d);});}
function alTxt16(a){var x=cut(cap1(nextOf(a.i).what),60);return a.why==='over'?tt('alOver',{x:x}):a.why==='due'?tt('alDue',{t:isToday(a.d)?hm2(a.d):dayStr(new Date(a.d))+' '+hm2(a.d),x:x}):a.why==='send'?tt('alSend',{x:x}):a.why==='pay'?tt('alPay',{x:x}):tt('alDl',{x:x});}
UI.push16=UI.push16||null;
function pushCheck16(){if(!window.J8||!J8.push||!J8.push.supported()){UI.push16='no';return;}if(window.Notification&&Notification.permission==='denied'){UI.push16='denied';return;}
  J8.push.enabled().then(function(on){var was=UI.push16;UI.push16=on?'on':'off';if(was!==UI.push16&&connected&&(UI.v==='next'||UI.v==='needs16'))render();},function(){UI.push16='no';});}
function alertBar16(full){var A=alerts16().filter(function(a){return !a.seen;}),push=UI.push16==='off';if(!A.length&&!push)return '';var lv=A.some(function(a){return a.lv==='now';})?'now':'you',show=A.slice(0,3),q=window.J8A?J8A.quiet(Date.now()):'';
  var h='<section class="al16" data-s="'+(A.length?lv:'team')+'" aria-labelledby="alH16"><header>'+stG(A.length?lv:'team')+'<h3 id="alH16">'+esc(full?tt('alH2'):tt('alH'))+(A.length?' <span class="n12"><bdi>'+A.length+'</bdi></span>':'')+'</h3>'
   +(A.length?'<button type="button" class="lnk" data-a="x16-algot">'+I('check')+'<span>'+esc(tt('alGot'))+'</span></button>':'')+'</header>';
  if(show.length)h+='<ul>'+show.map(function(a){return '<li data-s="'+a.lv+'"><button type="button" data-a="x14-open" data-k="'+esc(a.i.key)+'">'+stG(a.lv)+'<span dir="auto">'+esc(alTxt16(a))+'</span>'+I('fwd','flip chev')+'</button></li>';}).join('')+'</ul>';
  if(A.length>3||(!full&&A.length))h+='<p class="alx16">'+(A.length>3?'<span>'+esc(tt('alMore',{n:A.length-3}))+'</span>':'')+(full?'':'<button type="button" class="lnk" data-a="x16-ny">'+esc(tt('alSeeAll'))+I('fwd','flip')+'</button>')+'</p>';
  if(push)h+='<div class="alp16"><button type="button" class="b12 sm" data-a="x16-push">'+I('now')+'<span>'+esc(tt('alPushOn'))+'</span></button><small>'+esc(tt('alPushP'))+'</small></div>';
  else if(q&&A.length&&UI.push16==='on'&&window.J8A)h+='<p class="alq16">'+esc(tt('alQuiet',{t:hm2(J8A.quietEnd(Date.now()))}))+'</p>';
  return h+'</section>';}
var rn16=renderNav;renderNav=function(){rn16();if(!connected)return;var A=alerts16().filter(function(a){return !a.seen;}),nw=A.some(function(a){return a.lv==='now';}),e=$('nN');
  if(e){e.classList.toggle('now16',nw);var s=$('nNs');if(s)s.textContent=A.length?' · '+tt('alH')+' '+A.length:'';}
  try{if(navigator.setAppBadge){var n=myQueue().length;if(n)navigator.setAppBadge(n).catch(function(){});else navigator.clearAppBadge().catch(function(){});}}catch(x){}};
function swOpened16(){try{if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.controller.postMessage({type:'j8-opened'});}catch(e){}}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')swOpened16();});
setTimeout(function(){swOpened16();pushCheck16();},1500);

/* ---------- C. instant answers in Chat and the J8 panel (layer 1: the app's own data, no AI, no network) ---------- */
UI.ia16=UI.ia16||[];
function nz16(s){return String(s||'').toLowerCase().replace(/✡/g,'o').replace(/[׳'’`]/g,'').replace(/[^a-z0-9֐-׿]+/g,' ').trim();}
var HEAL16={'שומר':'shomer','ליקפיק':'lickpick','ליק פיק':'lickpick','מילו':'milo','צור':'chore','צ׳ור':'chore','טרז׳ר':'trashure','טרשר':'trashure','נייצ׳ר':'nature','נייצר':'nature','גינ':'j8nix'};
var STOP16={app:1,the:1,and:1,qa:1,copy:1,studio:1,project:1,my:1,new:1};
function projMatch16(q){var n=' '+nz16(q)+' ';Object.keys(HEAL16).forEach(function(k){if(n.indexOf(k)>-1)n+=' '+HEAL16[k]+' ';});var best=null,bs=0;
  liveP().forEach(function(p){var nm=nz16(String(p.name||'').replace(/\([^)]*\)/g,'')),W=nm.split(' ').filter(function(w){return w.length>=3&&!STOP16[w];}),sc=0;
    if(nm&&n.indexOf(' '+nm+' ')>-1)sc=10+nm.length;else W.forEach(function(w){if(n.indexOf(' '+w+' ')>-1||n.indexOf(' '+w)>-1&&w.length>=5)sc+=w.length;});
    if(sc>bs){bs=sc;best=p;}});return bs>=3?best:null;}
var RX16={wait:/(waiting (on|for) me|waits? (on|for) me|needs? me|on my plate|my (list|steps|to ?dos?)|what do i (have|need) to do|מחכה לי|מחכים לי|מחכות לי|צריך אותי|צריכים אותי|מה עליי|מה אני צריך|מה יש לי)/,
  sent:/((went|go|gone|got) out|been sent|did we send|was sent|sent today|what.*sent|יצא היום|יצאו היום|מה יצא|מה נשלח|נשלחו היום|נשלח היום)/,
  run:/(runs? next|next run|what('?s| is) running|when does the team|team run|מה רץ|הריצה הבאה|מתי הצוות|ריצה הבאה)/,
  app:/(applications?|applied|מועמדו|הגשות|הגשנו)/,
  money:/(booked|revenue|how much money|money|m1\b|כסף|הכנסות|נסגר|כמה הרווחנו)/,
  drafts:/(drafts?|to approve|approvals?|טיוטות|טיוטה|לאשר)/,
  done:/(what did i do|done today|did i finish|i finished|מה עשיתי|מה סיימתי|בוצע היום)/,
  proj:/(where('?s| is| are)? .{0,40}\b(at|stand|standing|now)\b|\bstatus\b|how('?s| is) .{0,40}(going|doing)|what('?s| is) (up|new|happening) with|\bprogress\b|update on|איפה .{0,30}(עומד|עומדת|עומדים)|מה המצב|סטטוס|מה קורה עם|איך הולך|מה חדש עם|מה עם)/};
function sinceSun16(){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-d.getDay());return d;}
function iaAnswer16(q){if(!connected)return null;var s=String(q||'').trim(),n=nz16(s);if(!n||n.length>220)return null;var he=/[֐-׿]/.test(s),L=[],H='',links=[],T=function(k,o){return ttL16(he,k,o);};
  var p=projMatch16(s),isQ=RX16.proj.test(n);
  if(RX16.wait.test(n)){var N=myQueue(),nw=N.filter(nowOf16).length;H=N.length?(N.length===1?T('iaWait1'):T('iaWait',{n:N.length,r:nw})):T('iaWait0');
    N.slice(0,3).forEach(function(i){L.push({k:i.key,s:itemSt16(i),x:cap1(nextOf(i).what)});});if(N.length)links.push(['x16-ny','',T('iaOpenNy')]);return {k:'wait',he:he,H:H,L:L,links:links};}
  if(RX16.app.test(n)&&/(week|שבוע|how many|כמה)/.test(n)){var w0=sinceSun16().getTime(),A=J8.approvals.list().filter(function(a){return a.kind==='application';}),
      sn=A.filter(function(a){return a.status==='sent'&&pd(a.sent_at)>=w0;}).length,qd=A.filter(function(a){return ['approved','queued','edited'].indexOf(a.status)>-1&&pd(a.decided_at)>=w0;}).length,pe=A.filter(function(a){return !a.status||a.status==='pending';}).length;
    return {k:'app',he:he,H:T('iaApp',{d:dayStr(sinceSun16()),s:sn,q:qd,p:pe}),L:[],links:pe?[['x16-drafts','',T('iaDrafts')]]:[]};}
  if(RX16.sent.test(n)){var S=J8.approvals.list().filter(function(a){return a.status==='sent'&&isToday(pd(a.sent_at));}),by={};S.forEach(function(a){var k=apKind(a);by[k]=(by[k]||0)+1;});
    H=S.length?T('iaSent',{n:S.length,x:Object.keys(by).map(function(k){return by[k]+' '+k;}).join(', ')}):T('iaSent0');S.slice(0,3).forEach(function(a){L.push({s:'done',x:apKind(a)+': '+apWho(a)});});return {k:'sent',he:he,H:H,L:L,links:[]};}
  if(RX16.run.test(n)){var R=teamNext16();if(!R.length)return {k:'run',he:he,H:T('iaRun0'),L:[],links:[]};
    return {k:'run',he:he,H:T('iaRun',{r:R[0].s.name||'',t:(isToday(R[0].t)?'':dayStr(new Date(R[0].t))+' ')+hm2(R[0].t)}),L:R.slice(1,4).map(function(x){return {s:'team',x:(x.s.name||'')+' · '+(isToday(x.t)?'':dayStr(new Date(x.t))+' ')+hm2(x.t)};}),links:[]};}
  if(p&&(isQ||n.split(' ').length<=2)){var st=stageOf(p),ms=p.milestone,dd=daysTo16(p.milestone_at),M=projNeed(p.id),TT=tasksAll().filter(function(t){return t.project_id===p.id&&t.owner!=='dave'&&(!t.status||t.status==='open');}).length,DR=apPending().filter(function(a){return a.product===p.id;}).length;
    H=st?T('iaProj',{p:p.name,a:st,s:stg(st)}):p.name+'.';
    L.push({s:ms?projSt16(p):'wait',x:ms?T('iaMs',{m:ms,d:p.milestone_at?dayStr(new Date(String(p.milestone_at).slice(0,10)+'T12:00:00'))+(dd!=null?' ('+(dd<0?T('msOver',{n:-dd}):dd===0?T('msToday'):dd===1?T('msLeft1'):T('msLeft',{n:dd}))+')':''):'—'}):T('iaMs0')});
    L.push({s:M.length?(M.some(nowOf16)?'now':'you'):'done',x:M.length?T('iaYou',{n:M.length,x:cut(cap1(nextOf(M[0]).what),60)}):T('iaYou0'),k:M.length?M[0].key:null});
    L.push({s:'team',x:T('iaTeamN',{n:TT})});if(DR)L.push({s:'you',x:T('iaDr',{n:DR})});
    var lm=pd(p.updated);if(!isNaN(lm))L.push({s:'wait',x:T('iaUpd',{t:tm1(p.updated)}),plain:1});
    return {k:'proj',he:he,H:H,L:L,links:[['proj',p.id,T('iaOpenP',{p:cut(p.name,30)})]]};}
  if(RX16.done.test(n)){var c=dayCounts13();return {k:'done',he:he,H:T('iaDone',{y:c.you,s:c.sent,r:c.runs}),L:[],links:[]};}
  if(RX16.money.test(n)){var m=J8.money.summary();if(!m||!isNum(m.booked_usd))return {k:'money',he:he,H:T('iaMoney0'),L:[],links:[]};
    return {k:'money',he:he,H:T('iaMoney',{b:usd(m.booked_usd),g:isNum(m.m1_usd)?usd(m.m1_usd):'—',d:m.m1_date?dayStr(new Date(String(m.m1_date).slice(0,10)+'T12:00:00')):'—',t:m.updated?tm1(m.updated):'—'}),L:[],links:[['nav','money',tt('f_num')]]};}
  if(RX16.drafts.test(n)&&/(how many|waiting|wait|any|כמה|מחכ|יש)/.test(n)){var B=batches().length,An=apPending().filter(function(a){return a.kind!=='template';}).length;
    return {k:'drafts',he:he,H:An?(An===1?T('iaDr1'):T('iaDrN',{n:An,s:B})):T('iaDr0'),L:[],links:An?[['x16-drafts','',T('iaDrafts')]]:[]};}
  return null;}
function ttL16(he,k,o){var s=((he?L11.he:L11.en)[k])||L11.en[k]||k;if(o)s=s.replace(/\{(\w+)\}/g,function(_,n){return o[n]==null?'':o[n];});return s;}
function iaCard16(a,ix){var dr=a.he?'rtl':'ltr';
  return '<div class="me12"><div class="bub12 mine"><p dir="auto">'+esc(a.q)+'</p><span class="tm12"><bdi>'+esc(hm2(a.at))+'</bdi> · '+esc(ttL16(a.he,a.sent?'iaAsked':'iaLocal'))+'</span></div></div>'
   +'<div class="j812 ia16" role="group" aria-label="'+esc(ttL16(a.he,'iaH'))+'"><span class="av12" aria-hidden="true">'+g8i()+'</span><div class="bub12" dir="'+dr+'"><p class="iah16">'+stChip('j8',esc(ttL16(a.he,'iaH')),1)+'<small>'+esc(ttL16(a.he,'iaSrc',{t:hm2(a.at)}))+'</small></p>'
   +'<p class="ia1" dir="auto">'+esc(a.H)+'</p>'+(a.L.length?'<ul>'+a.L.map(function(l){var inner=(l.plain?'':stG(l.s))+'<span dir="auto">'+esc(l.x)+'</span>';return '<li>'+(l.k?'<button type="button" data-a="x14-open" data-k="'+esc(l.k)+'">'+inner+'</button>':'<span class="li16">'+inner+'</span>')+'</li>';}).join('')+'</ul>':'')
   +'<p class="ial16">'+a.links.map(function(x){return '<button type="button" class="lnk" data-a="'+esc(x[0])+'" data-id="'+esc(x[1])+'">'+esc(x[2])+I('fwd','flip')+'</button>';}).join('')+(a.sent?'':'<button type="button" class="lnk" data-a="x16-ask" data-id="'+ix+'">'+I('send','flip')+'<span>'+esc(ttL16(a.he,'iaTeam'))+'</span></button>')+'</p></div></div>';}
function iaHTML16(box){return UI.ia16.filter(function(a){return a.box===box||box==='any';}).map(function(a){return iaCard16(a,UI.ia16.indexOf(a));}).join('');}
var vch16=vChat;vChat=function(){var h=vch16();if(!UI.ia16.length)return h;return h.replace(/(<form class="comp12" id="chatF")/,'<div class="log12 ia16w">'+iaHTML16('any')+'</div>$1');};
function iaPaintJ8(){var g=$('j8cLog');if(!g||!UI.ia16.length)return;var w=g.querySelector('.ia16w');if(!w){w=document.createElement('div');w.className='ia16w';g.appendChild(w);}w.innerHTML=iaHTML16('any');}
var rj816=renderJ8;renderJ8=function(){var r=rj816.apply(this,arguments);try{iaPaintJ8();}catch(e){}return r;};
window.addEventListener('submit',function(e){var f=e.target;if(!f||(f.id!=='chatF'&&f.id!=='j8cForm'))return;var inp=$(f.id==='chatF'?'chatIn':'j8cIn'),v=String(inp&&inp.value||'').trim();if(!v||!connected)return;
  var a=null;try{a=iaAnswer16(v);}catch(x){a=null;}
  if(!a){UI.iaMissT=Date.now();setTimeout(function(){toast(tt('iaMiss'));},0);return;}
  e.preventDefault();e.stopImmediatePropagation();inp.value='';TYPING[inp.id]='';a.q=v;a.at=Date.now();a.box=f.id;UI.ia16.push(a);if(UI.ia16.length>12)UI.ia16=UI.ia16.slice(-12);
  render();iaPaintJ8();var m=$('main');if(m&&UI.v==='chat')m.scrollTop=m.scrollHeight;var g=$('j8cLog');if(g)g.scrollTop=g.scrollHeight;},true);

/* ---------- 11.5 actions ---------- */
document.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a^="x16-"]');if(!el)return;e.preventDefault();e.stopPropagation();var a=el.dataset.a,id=el.dataset.id||'';
  if(a==='x16-ny'){UI.stack=[];if(D12()){UI.lseg='tasks';nav0('ltasks');}else{UI.lseg='tasks';nav0('needs16');}return;}
  if(a==='x16-drafts'){UI.lseg='drafts';UI.stack=[];navTo('inbox');return;}
  if(a==='x16-algot'){var s=alSeen16(),now=Date.now();alerts16().forEach(function(x){s[x.k]=now;});Object.keys(s).forEach(function(k){if(now-s[k]>14*864e5)delete s[k];});ls('j8-al16',s);render();return;}
  if(a==='x16-push'){el.disabled=true;J8.push.enable().then(function(){UI.push16='on';toast(tt('alPushOk'));render();},function(x){el.disabled=false;toast(tt('alPushNo',{e:x&&x.code||'error'}));pushCheck16();});return;}
  if(a==='x16-reopen'){if(!J8.status().connected){toast(t('notConn'));return;}el.disabled=true;J8.tasks.undo(id).then(function(){toast(tt('reopened'));render();},function(x){el.disabled=false;toast(t('couldNot',{e:x&&x.code||'error'}));});return;}
  if(a==='x16-ask'){var q=UI.ia16[+id];if(!q||q.sent)return;if(!J8.status().connected){toast(t('notConn'));return;}el.disabled=true;J8.inbox.send('p-general',q.q).then(function(){q.sent=1;toast(tt('iaAsked'));render();iaPaintJ8();},function(x){el.disabled=false;toast(t('couldNot',{e:x&&x.code||'error'}));});return;}},true);
window.addEventListener('resize',function(){if(D12()&&UI.v==='needs16'){UI.v='ltasks';render();}});
/* a toast placed before a re-render is placed again after it, so it never sits on a new button */
var r16=render;render=function(f){var x=r16.apply(this,arguments);var T=$('toast');if(T&&T.classList.contains('on')){T.style.transition='none';T.classList.remove('on');tPlace15();T.classList.add('on');void T.offsetWidth;T.style.transition='';}return x;};
window.j8v16={pushCheck:pushCheck16,alertBar:alertBar16,alerts:alerts16,answer:iaAnswer16,state:{item:itemSt16,task:taskSt16,ap:apSt16,proj:projSt16},plan:planSt16,clear:clearSt16,linked:linked16,track:track16};

/* 11.2: named hooks for the QA harness and the console (read-only helpers and the same actions a tap runs) */
(function(){var F={openItem:function(){return openItem.apply(null,arguments);},goalsShown:function(){return goalsShown();},goalPins:goalPins,projPins:projPins,myGoalList:myGoalList,editSheet:function(k,i){return editSheet(k,i);},newForm:function(k,e){return newForm(k,e);},memFilter:memFilter,lineUp:lineUp,goalsAll:function(){return goalsAll();},newSheet:newSheet,goalsSheet:goalsSheet};Object.keys(F).forEach(function(n){window[n]=F[n];});})();
})();
