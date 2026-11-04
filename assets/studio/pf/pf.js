/* Portfolio stage: spring physics lift + tilt, shadows follow the distance, screens start fast */
(function(){
  var items=[].slice.call(document.querySelectorAll('.pf-item'));
  if(!items.length) return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  items.forEach(function(it){
    var st={l:0,vl:0,tl:0,x:0,vx:0,tx:0,y:0,vy:0,ty:0,raf:0};
    var maxLift=parseFloat(it.getAttribute('data-lift')||'22');
    var track=it.querySelector('.pf-track');
    var slides=track?track.children.length:0, idx=0, timer=0, first=0;
    var vids=[].slice.call(it.querySelectorAll('video'));

    function frame(){
      var k=0.11,d=0.74;
      st.vl=(st.vl+(st.tl-st.l)*k)*d; st.l+=st.vl;
      st.vx=(st.vx+(st.tx-st.x)*k)*d; st.x+=st.vx;
      st.vy=(st.vy+(st.ty-st.y)*k)*d; st.y+=st.vy;
      it.style.setProperty('--lift',Math.max(0,st.l).toFixed(2));
      it.style.setProperty('--rx',st.x.toFixed(2)+'deg');
      it.style.setProperty('--ry',st.y.toFixed(2)+'deg');
      var moving=Math.abs(st.vl)+Math.abs(st.vx)+Math.abs(st.vy)>0.01||Math.abs(st.tl-st.l)>0.05||Math.abs(st.tx-st.x)>0.02||Math.abs(st.ty-st.y)>0.02;
      st.raf=moving?requestAnimationFrame(frame):0;
    }
    function kick(){ if(!st.raf&&!reduce) st.raf=requestAnimationFrame(frame); if(reduce){it.style.setProperty('--lift',st.tl);} }

    function go(n){ if(!track) return; idx=n%slides; track.style.transform='translateX('+(-idx*100)+'%)'; }
    function on(){
      if(it.classList.contains('on')) return;
      it.classList.add('on');
      vids.forEach(function(v){ if(!v.src&&v.dataset.src){v.src=v.dataset.src;} try{v.currentTime=0;}catch(e){} var p=v.play(); if(p&&p.catch)p.catch(function(){}); });
      if(slides>1){ go(0); first=setTimeout(function(){ go(1); timer=setInterval(function(){go(idx+1)},1500); },650); }
    }
    function off(){
      it.classList.remove('on');
      clearTimeout(first); clearInterval(timer);
      vids.forEach(function(v){ try{v.pause();}catch(e){} });
      setTimeout(function(){ if(!it.classList.contains('on')) go(0); },300);
    }

    if(fine){
      it.addEventListener('pointerenter',function(){ st.tl=maxLift; kick(); on(); });
      it.addEventListener('pointermove',function(e){
        var r=it.getBoundingClientRect(), px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
        st.tx=-py*7; st.ty=px*9; kick();
      });
      it.addEventListener('pointerleave',function(){ st.tl=0; st.tx=0; st.ty=0; kick(); off(); });
    }
    it.addEventListener('focus',function(){ st.tl=maxLift*.7; kick(); on(); });
    it.addEventListener('blur',function(){ st.tl=0; kick(); off(); });

    if(!fine && 'IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){
        if(e.isIntersecting){ st.tl=maxLift*.55; kick(); on(); } else { st.tl=0; kick(); off(); }
      }); },{threshold:.62}).observe(it);
    }
  });
})();
