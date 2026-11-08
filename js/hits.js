/* Privacy-first visit counter: no cookies, IP, UA or IDs. Sends path, referrer host, device class, lang, event. */
(function(){
var L=location,P=L.pathname;
if(navigator.doNotTrack=='1'||/^(localhost|127\.|\[::1\])/.test(L.hostname)||/^\/(review|ops)\//.test(P)||/-preview\//.test(P))return;
var U='https://otkvebgrdiayjnqrytrn.supabase.co/rest/v1/rpc/site_hit',K='sb_publishable_ZSMgkwuVwKwqrMgEIlG4Nw_-CmQ_Yct';
function ref(){try{var h=new URL(document.referrer).hostname.replace(/^www\./,'');return h&&h!=L.hostname.replace(/^www\./,'')?h:'direct'}catch(e){return 'direct'}}
function hit(e){try{fetch(U,{method:'POST',keepalive:true,headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({p_path:P.slice(0,120),p_ref:ref(),p_dev:innerWidth<768?'mobile':'desktop',p_lang:/^he/i.test(document.documentElement.lang)?'he':'en',p_evt:e})}).catch(function(){})}catch(x){}}
hit('view');
document.addEventListener('click',function(e){
var a=e.target.closest&&e.target.closest('a[href^="mailto:"],.nav-cta,.btn,a[href*="work-with-me.html"]');
if(!a)return;
hit(/work-with-me\.html/.test(a.getAttribute('href')||'')?'quiz_open':'cta_click')
},true)
})();
