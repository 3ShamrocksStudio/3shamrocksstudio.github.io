/* J8NIX 10.0.0 · v11 layer (16 Nov 2026). Loaded after app.js: re-uses its engine (data, ranking, actions) and only
   changes the presentation: Home (goal ring · one next step · needs your OK · live status · calendar · steps · J8 window ·
   quick actions), a Steps place, the nav labels, a light-only theme and the 5-step onboarding (done flag in member prefs). */
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
  hrs:'{n} h'},
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
  hrs:'{n} ש׳'}};
function tt(k,o){var s=(L11[LANG]&&L11[LANG][k])||L11.en[k]||k;if(o)s=s.replace(/\{(\w+)\}/g,function(_,n){return o[n]==null?'':o[n];});return s;}
['en','he'].forEach(function(l){if(TX[l])['now','inbox','steps','projects','calendar','me'].forEach(function(k){TX[l][k]=L11[l][k];});});
PLACE.steps='steps';if(PLACES.indexOf('steps')<0)PLACES.push('steps');
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
function ring(sz,sw,pct,pace){var r=(sz-sw)/2,C=2*Math.PI*r,c=sz/2,a=Math.max(0,Math.min(1,pct||0));
  var h='<svg class="ring11" width="'+sz+'" height="'+sz+'" viewBox="0 0 '+sz+' '+sz+'" aria-hidden="true"><circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" stroke="#E1E7F2" stroke-width="'+sw+'"/>'
  +'<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" stroke="#2AB9FF" stroke-width="'+sw+'" stroke-linecap="round" stroke-dasharray="'+Math.max(.01,a*C).toFixed(2)+' '+C.toFixed(2)+'"/>';
  if(pace!=null&&isNum(pace)){var p=Math.max(0,Math.min(1,pace));h+='<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" stroke="#FF9700" stroke-width="'+sw+'" stroke-linecap="round" stroke-dasharray=".01 '+C.toFixed(2)+'" stroke-dashoffset="'+(-p*C).toFixed(2)+'"/>';}
  return h+'</svg>';}
function iconOf(i){var u=String((i.task&&(i.task.link||i.task.action))||'')+' '+String((i.p&&i.p.you)||'');if(i.batch||i.ap)return 'inbox';if(/linkedin/i.test(u))return 'linkedin';if(/instagram/i.test(u))return 'insta';if(/mail|gmail/i.test(u))return 'mail';return 'foot';}
function doBtn(i,cls){var g=doTarget(i),k=esc(i.key),lab=tt('doIt');if(UI.doing[i.key]||g.done)return '<button class="btn11 pri '+(cls||'')+'" data-a="done" data-k="'+k+'">'+I('check')+'<span>'+esc(t('markDone'))+'</span></button>';
  return g.href?'<a class="btn11 pri '+(cls||'')+'" href="'+esc(g.href)+'" target="_blank" rel="noopener" data-a="do" data-k="'+k+'"><span>'+lab+'</span>'+I('do','flip')+'</a>':'<button class="btn11 pri '+(cls||'')+'" data-a="do" data-k="'+k+'"><span>'+lab+'</span>'+I('do','flip')+'</button>';}
function minsChip(i){return isNum(i.mins)?'<span class="ch11">'+I('time')+'<bdi>'+esc(tt('min',{n:i.mins}))+'</bdi></span>':'';}
function chanIcons(){var c={};apPending().forEach(function(a){var s=String(a.channel||'')+' '+String(a.kind||'');c[/linkedin/i.test(s)?'linkedin':/instagram|reel/i.test(s)?'insta':/mail/i.test(s)?'mail':'users']=1;});return Object.keys(c).slice(0,3);}
function setsOf(){var by={};apPending().forEach(function(a){var s=String(a.channel||'')+' '+String(a.kind||''),k=a.kind==='template'?'shield':/instagram|reel/i.test(s)?'insta':a.kind==='post'||/linkedin/i.test(s)&&a.kind==='post'?'linkedin':'users';by[k]=(by[k]||0)+1;});return by;}
var SETN={users:['Founder notes','פניות למייסדים'],linkedin:['Posts','פוסטים'],insta:['Reels','רילס'],shield:['Templates','תבניות']};

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
function statTiles(desk){var P=liveP().length,S=acts().length,R=runs24();
  if(desk)return '<section class="card11 h11-stat"><button data-a="nav" data-id="projects"><b><bdi>'+P+'</bdi></b><span>'+esc(tt('projs'))+'</span></button><button data-a="nav" data-id="steps"><b><bdi>'+S+'</bdi></b><span>'+esc(tt('mySteps'))+'</span></button><button data-a="nav" data-id="me"><b><bdi>'+R+'</bdi></b><span>'+esc(tt('runs'))+'</span></button></section>';
  return '<div class="h11-stat"><button class="card11" data-a="nav" data-id="projects">'+I('proj')+'<span><b><bdi>'+P+'</bdi></b><small>'+esc(tt('projs'))+'</small></span></button><button class="card11" data-a="nav" data-id="steps">'+I('steps')+'<span><b><bdi>'+S+'</bdi></b><small>'+esc(tt('stepsS'))+'</small></span></button><button class="card11" data-a="nav" data-id="me">'+I('runs','ok')+'<span><b><bdi>'+R+'</bdi></b><small>'+esc(tt('runsS'))+'</small></span></button></div>';}
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

vNow=function(){var d=dayStr();
  if(!connected)return '<header class="h11-hi"><h2 id="pageH" tabindex="-1">'+esc(d)+'</h2></header><p class="lead" role="status">'+t('loadingDay')+'</p><div class="skel"></div><div class="skel"></div>';
  var N=acts(),fn=firstName(),h='<header class="h11-hi"><p class="h11-d">'+esc(d)+'</p><h2 id="pageH" tabindex="-1">'+esc(greet()+(fn?', '+fn:''))+'</h2></header>';
  if(J8.status().error==='offline'){var sa=UI.syncedAt?hm2(UI.syncedAt):'—';h+='<p class="held">'+I('wifi')+'<span>'+esc(t('noConnP',{t:sa}))+'</span> <button class="lnk" data-a="retry">'+t('tryAgain')+'</button></p>';}
  if(isDesk())return h+'<div class="h11 desk">'+calCard()+stepsCard(N)+goalCard(true)+okCard(true)+statTiles(true)+'<section class="h11-j8slot" id="j8slot"></section>'+qaCol()+'</div>';
  return h+'<div class="h11">'+goalCard(false)+nextCard(N)+okCard(false)+statTiles(false)+'<button class="h11-ask" data-a="x-j8"><span class="pl">'+I('plus')+'</span><span>'+esc(tt('ask'))+'</span><span class="mic">'+I('wave')+'</span></button></div>';};

function vSteps(){var N=acts(),i=N[0],h='<header class="ph"><div><h2 id="pageH" tabindex="-1">'+esc(tt('stepsH'))+'</h2></div><span class="sub11"><bdi>'+(N.length?esc(tt('ofN',{a:1,b:N.length})):'')+'</bdi></span></header>';
  if(!connected)return h+'<div class="skel"></div>';
  if(!i)return h+'<section class="card11 h11-next"><p class="h11-clear">'+I('done')+'<span>'+esc(tt('clear'))+'</span></p></section>';
  var n=nextOf(i),g=doTarget(i),k=esc(i.key),how=String(howOf(i)||'').split(/\s*(?:→|›|;\s|\.\s+(?=[A-Z֐-׿]))\s*/).map(function(x){return x.replace(/\.$/,'').trim();}).filter(Boolean).slice(0,4);
  h+='<section class="card11 h11-hero"><div class="chips11">'+(i.ul.length?'<span class="ch11 nx">'+I('key')+'<bdi>'+esc(tt('frees',{n:i.ul.length}))+'</bdi></span>':'')+minsChip(i)+'</div>'
   +'<div class="nrow"><span class="well11 r big royal">'+I(iconOf(i))+'</span><b class="ht" dir="auto">'+esc(cap1(n.what))+'</b></div>'
   +(how.length>1?'<ol class="how11">'+how.map(function(x,j){return '<li><b>'+(j+1)+'</b><span dir="auto">'+esc(x)+'</span></li>';}).join('')+'</ol>':how.length?'<p class="sub11" dir="auto">'+esc(how[0])+'</p>':'')
   +whyLine(i)
   +'<div class="nacts">'+(g.href?'<a class="btn11 pri grow" href="'+esc(g.href)+'" target="_blank" rel="noopener" data-a="do" data-k="'+k+'">'+I('ext')+'<span>'+esc(tt('open'))+'</span></a>':doBtn(i,'grow'))
   +'<button class="btn11 ghost" data-a="done" data-k="'+k+'">'+I('check','ok')+'<span>'+esc(tt('done'))+'</span></button><button class="btn11 icon" data-a="later" data-k="'+k+'" aria-label="'+esc(tt('later'))+'">'+I('later')+'</button></div></section>';
  var R=N.slice(1);
  if(R.length)h+='<div class="then11"><span>'+esc(tt('then'))+'</span><button class="lnk" data-a="x-plan">'+I('plan')+'<span>'+esc(tt('planDay'))+'</span></button><button class="lnk" data-a="nav" data-id="calendar">'+I('cal')+'<span>'+esc(tt('week'))+'</span></button></div>'+capQ(R,isDesk()?8:5,'stAll',1);
  return h;}
window.vSteps=vSteps;

/* nav: labels, counts, team pill, avatar */
var rn0=renderNav;
renderNav=function(){rn0();var pl=curPlace();
  [].forEach.call(document.querySelectorAll('#nav [data-nav]'),function(b){var k=b.dataset.nav;if(k===pl)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');var l=b.querySelector('.lbl');if(l)l.textContent=tt(k);});
  var A=connected?apPending().length:0,S=connected?acts().length:0,a=$('tN'),s=$('sN'),n=$('nN');if(n)n.hidden=true;
  if(a){a.textContent=A?badge(A):'';a.hidden=!A;a.classList.remove('due');}if(s){s.textContent=S?badge(S):'';s.hidden=!S;}
  var p=$('pN');if(p){var P=connected?liveP().length:0;p.textContent=P?String(P):'';p.hidden=!P||!isDesk();}
  var c=J8.control.get(),off=c&&c.paused;['teamL','teamLD'].forEach(function(id){var e=$(id);if(e)e.textContent=tt(off?'teamOff':'teamOn');});
  ['teamPill','teamPillD'].forEach(function(id){var e=$(id);if(e)e.classList.toggle('off',!!off);});
  var u=(J8.status().user||{}),av=$('topAv');if(av)av.textContent=mono(u.email||'?');
  var j=document.querySelector('#nav .j8nav .lbl');if(j)j.textContent='J8';var tl=$('tourL');if(tl)tl.textContent=tt('tour');};

/* render: same as 9.0.0 plus Steps and the J8 window parked inside Home on desktop */
function parkJ8(){var jp=$('j8p'),m=$('main');if(jp&&m&&m.contains(jp))$('app').insertBefore(jp,$('scrim'));}
render=function(focus){var m=$('main');if(!m)return;if(VMAP[UI.v])UI.v=VMAP[UI.v];view=UI.v;renderTop();renderNav();
 if(!focus&&busyMain()){renderJ8();return;}
 [].forEach.call(m.querySelectorAll('textarea[id]'),function(x){if(!$('j8p').contains(x))TYPING[x.id]=x.value;});parkMe();parkJ8();
 var y=m.scrollTop,v=UI.v,md=$('mdd'),my=md?md.scrollTop:0;
 m.innerHTML=v==='now'?vNow():v==='steps'?vSteps():v==='inbox'?vInbox():v==='qitem'?vQitem():v==='projects'||v==='dept'?vProjects():v==='proj'?vProj():v==='draft'?draftCheck()+vDraft10():v==='calendar'?vCal():v==='me'?vMe():v==='money'?vMoney():vNow();
 var slot=$('j8slot'),home=!!slot;document.body.dataset.homej8=home?'1':'0';if(home)slot.appendChild($('j8p'));
 slotMe();if(v==='me'){meWords();renderPrefs();renderSeat();renderTheme();}lint(m);
 Object.keys(TYPING).forEach(function(id){var x=document.getElementById(id);if(x&&TYPING[id]&&!x.value)x.value=TYPING[id];});
 if(focus){m.scrollTop=0;m.classList.add('push');clearTimeout(render.pt);render.pt=setTimeout(function(){m.classList.remove('push');},220);var ph=$('pageH');(ph||m).focus({preventScroll:true});}else{if(Math.abs(m.scrollTop-y)>2)m.scrollTop=y;var md2=$('mdd');if(md2)md2.scrollTop=my;}
 try{var hs=hashOf();if(location.hash!==hs&&!/token/.test(location.hash))history.replaceState(null,'',location.pathname+location.search+hs);}catch(e){}
 renderJ8();if(UI.gsheet&&UI.gsheet.k==='thread'&&!$('gsheet').hidden){var g=$('gth');if(!g||document.activeElement!==g){threadSheet(UI.gsheet.tg);lint($('gsheet'));}}
 obMaybe();};
var rsT=null;window.addEventListener('resize',function(){clearTimeout(rsT);rsT=setTimeout(function(){if(UI.v==='now'&&!!$('j8slot')!==isDesk())render();},150);});

/* quick actions: put a starter line in J8's composer */
function prefill(txt){if(!$('j8slot')&&!j8Open())setJ8(true,false);var x=$('j8cIn');if(!x)return;x.value=txt;x.dispatchEvent(new Event('input',{bubbles:true}));x.focus();try{x.setSelectionRange(txt.length,txt.length);}catch(e){}}
function memo(){var SR=window.SpeechRecognition||window.webkitSpeechRecognition;prefill(tt('pMemo'));if(!SR)return;
  try{var r=new SR();r.lang=LANG==='he'?'he-IL':'en-US';r.interimResults=false;r.onresult=function(e){var s='';for(var k=0;k<e.results.length;k++)s+=e.results[k][0].transcript;var x=$('j8cIn');if(x){x.value=tt('pMemo')+s;x.dispatchEvent(new Event('input',{bubbles:true}));}};r.start();toast(tt('listening'));}catch(e){}}

/* ---------- onboarding: 5 steps, once per member, re-open from Me ---------- */
var OB={on:false,s:0,tried:false,seen:false};
function obDone(){if(ls('j8-ob'))return true;try{return !!(J8.prefs.get()||{}).onboarded;}catch(e){return false;}}
function obMaybe(){if(OB.on||OB.seen||!connected||obDone())return;OB.seen=true;obOpen(0);}
function obOpen(s){OB.on=true;OB.s=s||0;var el=$('ob11');if(!el){el=document.createElement('div');el.id='ob11';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','obH');document.body.appendChild(el);}el.hidden=false;obRender();}
function obClose(){OB.on=false;var el=$('ob11');if(el)el.hidden=true;ls('j8-ob',1);try{if(J8.prefs&&J8.status().connected)J8.prefs.set({onboarded:new Date().toISOString()}).catch(function(){});}catch(e){}}
function dots(){var o='<div class="dots11" aria-hidden="true">';for(var k=0;k<5;k++)o+='<i class="'+(k===OB.s?'on':'')+'"></i>';return o+'</div>';}
function prom(ic,cls,txt){return '<li><span class="well11 r big '+cls+'">'+I(ic)+'</span><span>'+esc(txt)+'</span></li>';}
function fld(ic,cls,lab,val,sub){return '<div class="fld11"><span class="well11 r '+cls+'">'+I(ic)+'</span><div><small>'+esc(lab)+'</small><b><bdi>'+esc(val)+'</bdi></b><small><bdi>'+esc(sub)+'</bdi></small></div></div>';}
function j8say(txt){return '<div class="say11"><span class="j8av11"><img src="icons/mark-8.svg" alt="" width="12" height="27"></span><p>'+esc(txt)+'</p></div>';}
function obRender(){var el=$('ob11'),s=OB.s,b='',m=J8.money.summary()||{},nav='';
  if(s===0){b='<div class="obhero"><img src="icons/logo-lockup.png" alt="J8NIX" width="280" height="116"><p>Smart operations OS, only smarter</p></div><div class="obb">'+dots()+'<h2 id="obH">'+esc(tt('ob1h'))+'</h2><p class="sub11">'+esc(tt('ob1p'))+'</p><ul class="prom11">'+prom('target','royal',tt('ob1a'))+prom('foot','nx',tt('ob1b'))+prom('shield','ok',tt('ob1c'))+'</ul>';}
  else if(s===1){b='<div class="obb">'+dots()+j8say(tt('ob2j'))+'<h2 id="obH">'+esc(tt('ob2h'))+'</h2>'
    +fld('flag','royal',tt('ob2a'),isNum(m.goal_usd)?'$'+Math.round(m.goal_usd).toLocaleString('en-US'):'—',m.goal_date?tt('by',{d:fdate(m.goal_date)}):'')
    +fld('target','nx',tt('ob2b'),isNum(m.m1_usd)?'$'+Math.round(m.m1_usd).toLocaleString('en-US'):'—',m.m1_date?tt('by',{d:fdate(m.m1_date)}):'')
    +fld('money','ok',tt('ob2c'),isNum(m.booked_usd)?'$'+Math.round(m.booked_usd).toLocaleString('en-US'):'—',m.updated?tt('asOf',{d:fdate(m.updated)}):'')+'<p class="sub11">'+I('chat')+esc(tt('ob2n'))+'</p>';}
  else if(s===2){b='<div class="obb">'+dots()+j8say(tt('ob3j'))+'<h2 id="obH">'+esc(tt('ob3h'))+'</h2><div class="card11 sample11"><span class="ch11 line">'+esc(tt('ob3s'))+'</span><p dir="auto">'+esc(tt('ob3t'))+'</p><div class="nacts"><button class="btn11 icon kill" data-a="v11-ob" data-id="try" aria-label="'+esc(tt('kill'))+'">'+I('x')+'</button><button class="btn11 icon" data-a="v11-ob" data-id="try" aria-label="'+esc(tt('edit'))+'">'+I('edit')+'</button><button class="btn11 pri grow" data-a="v11-ob" data-id="try">'+I('check')+'<span>'+esc(tt('approve'))+'</span></button></div></div><p class="sub11" role="status">'+esc(OB.tried?tt('tried'):tt('ob3ok'))+'</p>';}
  else if(s===3){var cap=capMin();b='<div class="obb">'+dots()+j8say(tt('ob4j'))+'<h2 id="obH">'+esc(tt('ob4h'))+'</h2><div class="seg11">'+[60,120,180,240].map(function(c){return '<button class="opt11" data-a="v11-ob" data-id="cap-'+c+'" aria-pressed="'+(cap===c)+'">'+esc(tt('hrs',{n:c/60}))+'</button>';}).join('')+'</div>'
    +'<p class="sub11">'+I('cal')+esc(tt('ob4q'))+'</p><h3>'+esc(tt('ob4l'))+'</h3><div class="seg11"><button class="opt11" data-a="v11-ob" data-id="lang-en" aria-pressed="'+(LANG!=='he')+'" lang="en">English</button><button class="opt11" data-a="v11-ob" data-id="lang-he" aria-pressed="'+(LANG==='he')+'" lang="he">עברית</button></div>';}
  else{b='<div class="obb">'+dots()+j8say(tt('ob5j'))+'<h2 id="obH">'+esc(tt('ob5h'))+'</h2><div class="qa11"><button class="card11" data-a="v11-ob" data-id="push"><span class="well11 r royal">'+I('now')+'</span><span>'+esc(tt('ob5a'))+'</span></button>'
    +(/android/i.test(navigator.userAgent)?'<a class="card11" href="app/"><span class="well11 r royal">'+I('phone')+'</span><span>'+esc(tt('ob5b'))+'</span></a>':'<p class="sub11">'+I('phone')+esc(tt('ob5c'))+'</p>')+'</div>';}
  nav='<div class="obnav">'+(s?'<button class="btn11 icon" data-a="v11-ob" data-id="back" aria-label="'+esc(tt('obBack'))+'">'+I('back','flip')+'</button>':'')+'<button class="btn11 pri grow" data-a="v11-ob" data-id="'+(s<4?'next':'end')+'"><span>'+esc(tt(s===0?'obStart':s<4?'obNext':'obDone'))+'</span>'+I('do','flip')+'</button></div>'
   +(s<4?'<button class="obskip" data-a="v11-ob" data-id="end">'+esc(tt('obSkip'))+'</button>':'');
  el.className='ob11 s'+s;el.innerHTML=b+nav+'</div>';var f=el.querySelector('#obH');if(f){f.setAttribute('tabindex','-1');f.focus({preventScroll:true});}}
function obAct(id){if(id==='next'){OB.s=Math.min(4,OB.s+1);obRender();}else if(id==='back'){OB.s=Math.max(0,OB.s-1);obRender();}else if(id==='end'){obClose();render(true);}
  else if(id==='try'){OB.tried=true;obRender();}
  else if(id.indexOf('cap-')===0){var c=+id.slice(4);ls('j8-cap',c);try{if(J8.prefs&&J8.status().connected)J8.prefs.set({cap:c}).catch(function(){});}catch(e){}obRender();}
  else if(id==='lang-en'||id==='lang-he'){setLang(id.slice(5));renderAll();obRender();}
  else if(id==='push'){var pb=$('pushBtn');if(pb)pb.click();}}
window.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-a^="v11-"]');if(!el)return;e.preventDefault();e.stopPropagation();var a=el.dataset.a,id=el.dataset.id||'';
  if(a==='v11-ob')obAct(id);else if(a==='v11-tour'){closeSheet();OB.tried=false;obOpen(0);}
  else if(a==='v11-q'){if(id==='memo')memo();else prefill(tt(id==='project'?'pProject':id==='reminder'?'pRem':'pAudit'));}},true);
document.addEventListener('keydown',function(e){if(OB.on&&e.key==='Escape'){obClose();render(true);}});
window.j8ob={open:obOpen,close:obClose,done:obDone};
})();
