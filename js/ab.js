/* Privacy-first A/B + UTM counts for 3shamrocks.com. Loaded by hits.js.
   No cookies, no IDs, no IP/UA. The variant lives in this browser's localStorage only.
   Server keeps daily aggregate counts (experiment, variant, event, page). See ops/ab/README.md.
   Mark an element: data-ab="<experiment>" data-ab-b="<variant B label>" [data-ab-b-href="..."].
   Preview without logging: add ?ab=a or ?ab=b to the URL. */
(function(){
// on:1 = running (50/50, logged) · on:0 = stopped (everyone sees A, nothing logged) · win:'b' = everyone sees B, nothing logged
var EXP={
'home-hero-cta':{on:1},
'ht-case-cta':{on:1}
};
var U='https://otkvebgrdiayjnqrytrn.supabase.co/rest/v1/rpc/ab_event',K='sb_publishable_ZSMgkwuVwKwqrMgEIlG4Nw_-CmQ_Yct';
var L=location,P=L.pathname,N=navigator;
var off=N.doNotTrack=='1'||window.doNotTrack=='1'||N.msDoNotTrack=='1'||N.globalPrivacyControl===true;
var quiet=/^(localhost|127\.|\[::1\])/.test(L.hostname)||/^\/(review|ops)\//.test(P);
var q=null;try{q=new URLSearchParams(L.search)}catch(e){}
var force=q&&/^[ab]$/.test(q.get('ab')||'')?q.get('ab'):'';
function st(s,k,v){try{var o=window[s];if(v===undefined)return o.getItem(k);o.setItem(k,v)}catch(e){}return null}
function send(x,v,e){
if(off||quiet||force)return;
try{fetch(U,{method:'POST',keepalive:true,headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({p_experiment:x,p_variant:v,p_event:e,p_page:P.slice(0,120)})}).catch(function(){})}catch(err){}
}
function once(k,fn){if(st('sessionStorage','ab1:'+k))return;st('sessionStorage','ab1:'+k,'1');fn()}
function pick(x){
if(force)return force;
if(off)return 'a';
var v=st('localStorage','ab:'+x);
if(v!=='a'&&v!=='b'){v=Math.random()<.5?'a':'b';st('localStorage','ab:'+x,v)}
return v;
}
function seen(el,fn){
if(!('IntersectionObserver' in window))return fn();
var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){io.disconnect();fn()}})},{threshold:.5});
io.observe(el);
}
// 1. Experiments
var els=document.querySelectorAll('[data-ab]');
for(var i=0;i<els.length;i++)(function(el){
var x=el.getAttribute('data-ab'),c=EXP[x];if(!c)return;
var live=!!c.on&&!c.win,v=force||c.win||(c.on?pick(x):'a');
if(v==='b'){var t=el.getAttribute('data-ab-b'),h=el.getAttribute('data-ab-b-href');if(t)el.textContent=t;if(h)el.setAttribute('href',h)}
el.setAttribute('data-ab-v',v);
if(!live||force)return;
function ex(){st('localStorage','abx:'+x,'1');once('x:'+x,function(){send(x,v,'exposure')})}
seen(el,ex);
el.addEventListener('click',function(){ex();once('c:'+x,function(){send(x,v,'click')})});
})(els[i]);
var wwm=/\/work-with-me(\.html)?$/.test(P);
// 2. Reach: arriving at work-with-me after seeing an experiment
if(wwm)for(var x in EXP){var c=EXP[x];if(c.on&&!c.win&&st('localStorage','abx:'+x)){var v=st('localStorage','ab:'+x);if(v==='a'||v==='b')(function(x,v){once('r:'+x,function(){send(x,v,'reach')})})(x,v)}}
// 3. UTM attribution (outreach links): campaign + content counts only, kept for this tab session
if(off)return;
function clean(s){s=(s||'').toLowerCase();return /^[a-z0-9._-]{1,48}$/.test(s)?s:''}
if(q&&q.get('utm_campaign')){
var cp=clean(q.get('utm_campaign'));
if(cp){var ux='utm:'+cp,uv=(clean(q.get('utm_source'))||'na')+':'+(clean(q.get('utm_content'))||'na');
st('sessionStorage','abutm',ux+'|'+uv);once('l:'+ux+uv,function(){send(ux,uv,'land')})}
try{['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){q.delete(k)});var s=q.toString();history.replaceState(history.state,'',P+(s?'?'+s:'')+L.hash)}catch(e){}
}
var u=(st('sessionStorage','abutm')||'').split('|');
if(u.length==2&&u[0]&&u[1]){
if(wwm)once('ur:'+u[0],function(){send(u[0],u[1],'reach')});
document.addEventListener('click',function(e){
var a=e.target.closest&&e.target.closest('a[href^="mailto:"],.nav-cta,.btn,a[href*="work-with-me"]');
if(a)once('uc:'+u[0],function(){send(u[0],u[1],'click')});
},true);
}
})();
