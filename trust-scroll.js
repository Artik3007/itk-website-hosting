
(()=>{
 const viewport=document.querySelector('.trust-window');
 const track=viewport?.querySelector('.trust-track');
 const group=track?.querySelector('.trust-group');
 if(!group)return;
 viewport.tabIndex=0;viewport.setAttribute('role','region');
 viewport.setAttribute('aria-label','Компании, которые нам доверяют. Листайте горизонтально.');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let frame=0,last=0,position=0,dragging=false,startX=0,startScroll=0,visible=false;
 const sync=()=>{position=viewport.scrollLeft};
 let written=0;
 const tick=now=>{
  const delta=Math.min(40,last?now-last:16);last=now;
  if(!reduced.matches){
   if(Math.abs(viewport.scrollLeft-written)>.8)position=viewport.scrollLeft;
   position+=delta*.022;
   const width=group.getBoundingClientRect().width;
   if(width&&position>=width)position-=width;
   viewport.scrollLeft=position;written=viewport.scrollLeft;
  }else position=viewport.scrollLeft;
  if(visible)frame=requestAnimationFrame(tick);else{frame=0;last=0}
 };
 viewport.addEventListener('pointerdown',event=>{
  sync();
  
  dragging=true;startX=event.clientX;
  viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-dragging');
 });
 viewport.addEventListener('pointermove',event=>{
  if(!dragging)return;
  viewport.scrollLeft-=event.clientX-startX;startX=event.clientX;sync();
 });
 const release=()=>{dragging=false;viewport.classList.remove('is-dragging');sync()};
 viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);
 viewport.addEventListener('touchstart',sync,{passive:true});
 viewport.addEventListener('touchmove',sync,{passive:true});
 viewport.addEventListener('touchend',sync,{passive:true});
 viewport.addEventListener('wheel',sync,{passive:true});
 viewport.addEventListener('keydown',sync);
 viewport.addEventListener('dragstart',event=>event.preventDefault());
 new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting;
  if(visible&&!frame)frame=requestAnimationFrame(tick);
 },{rootMargin:'100px'}).observe(viewport);
})();
