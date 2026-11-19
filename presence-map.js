
(()=>{
 const map=document.querySelector('.interactive-map');
 if(!map)return;
 const scene=map.querySelector('.map-scene');
 const title=map.querySelector('.map-location-detail strong');
 const detail=map.querySelector('.map-location-detail span');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const camera=document.createElementNS('http://www.w3.org/2000/svg','g');
 while(scene.firstChild)camera.append(scene.firstChild);
 scene.append(camera);

 const svg=map.querySelector('svg');
 const ns='http://www.w3.org/2000/svg';
 const defs=svg.querySelector('defs');

 const traces=[];
 camera.querySelectorAll('[data-country]').forEach(country=>{
  const trace=document.createElementNS(ns,'path');
  trace.setAttribute('d',country.getAttribute('d'));
  trace.setAttribute('class','country-selection-wash');
  trace.setAttribute('pathLength','1000');
  trace.dataset.traceCountry=country.dataset.country;
  trace.setAttribute('pointer-events','none');
  camera.insertBefore(trace,camera.querySelector('.map-city'));
  traces.push(trace);
 });
 const highlight=name=>traces.forEach(trace=>trace.classList.toggle('is-tracing',trace.dataset.traceCountry===name));
 map.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch')highlight('')});
 const labels=Array.from(camera.querySelectorAll('.map-city text')).map(label=>({
  label,x:Number(label.getAttribute('x')),y:Number(label.getAttribute('y'))
 }));
 let frame=0,last=0,resetTimer=0,citySelected=false;
 const velocity={x:0,y:0,scale:0};
 const position={x:0,y:0,scale:1},target={x:0,y:0,scale:1};
 const render=now=>{
  const dt=Math.min(40,last?now-last:16);last=now;
  // Critically damped motion preserves velocity when the target changes.
  const seconds=dt/1000,frequency=4.4,decay=Math.exp(-frequency*seconds);
  let distance=0;
  for(const key of ['x','y','scale']){
   if(reduced.matches){position[key]=target[key];velocity[key]=0;continue}
   const offset=position[key]-target[key];
   const impulse=velocity[key]+frequency*offset;
   position[key]=target[key]+(offset+impulse*seconds)*decay;
   velocity[key]=(velocity[key]-frequency*impulse*seconds)*decay;
   distance+=Math.abs(target[key]-position[key])+Math.abs(velocity[key]);
  }
  camera.setAttribute('transform','translate('+position.x+' '+position.y+') scale('+position.scale+')');

  labels.forEach(({label,x,y})=>{
   const inverse=1/position.scale;
   const width=label.textContent.length*13;
   const end=label.getAttribute('text-anchor')==='end';
   const screenX=x*position.scale+position.x;
   const screenY=y*position.scale+position.y;
   const safeX=Math.max(-65+(end?width:0),Math.min(1040-(end?0:width),screenX));
   const safeY=Math.max(25,Math.min(580,screenY));
   const localX=(safeX-position.x)*inverse,localY=(safeY-position.y)*inverse;
   label.setAttribute('x',localX);label.setAttribute('y',localY);
   label.setAttribute('transform','translate('+localX+' '+localY+') scale('+inverse+') translate('+(-localX)+' '+(-localY)+')');
   const city=label.closest('.map-city');
   const dot=city.querySelector('.city-dot');
   const endpoint=localX+(end?8:-8)*inverse;
   city.querySelector('.city-leader').setAttribute('d','M'+dot.getAttribute('cx')+','+dot.getAttribute('cy')+' L'+endpoint+','+(localY-6*inverse));
  });
  if(distance>.002)frame=requestAnimationFrame(render);
  else{frame=0;last=0}
 };
 const move=()=>{if(!frame)frame=requestAnimationFrame(render)};
 const reset=()=>{
  citySelected=false;
  Object.assign(target,{x:0,y:0,scale:1});move();
  map.querySelectorAll('.map-city').forEach(city=>city.classList.remove('is-selected'));
 };
 map.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch')resetTimer=setTimeout(reset,180)});
 map.addEventListener('pointerenter',()=>clearTimeout(resetTimer));
 map.addEventListener('focusout',event=>{if(!map.contains(event.relatedTarget))reset()});
 const select=node=>{
  clearTimeout(resetTimer);citySelected=true;
  map.querySelectorAll('.map-city').forEach(city=>city.classList.toggle('is-selected',city===node));
  title.textContent=node.dataset.city;detail.textContent=node.dataset.detail;
  highlight(node.dataset.city==='Самарканд'?'Узбекистан':node.dataset.city==='Китай'?'Китай':'Россия');
  const dot=node.querySelector('.city-dot');
  const x=Number(dot.getAttribute('cx')),y=Number(dot.getAttribute('cy'));
  const scale=innerWidth<=900?(node.dataset.city==='Самарканд'?3:2.4):(['Москва','Калуга','Иваново'].includes(node.dataset.city)?2.8:2.15);
  Object.assign(target,{scale,x:460-scale*x,y:270-scale*y});
  move();
 };
 map.querySelectorAll('.map-city').forEach(node=>{
  node.addEventListener('pointermove',event=>{if(event.movementX||event.movementY)select(node)});
  node.addEventListener('focus',()=>select(node));
  node.addEventListener('click',()=>select(node));
  node.addEventListener('keydown',event=>{
   if(event.key==='Enter'||event.key===' '){event.preventDefault();select(node)}
  });
 });

 const countries=Array.from(map.querySelectorAll('[data-country]'));
 map.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch')countries.forEach(country=>country.classList.remove('country-selected'))});
 map.addEventListener('focusout',event=>{
  if(!map.contains(event.relatedTarget))countries.forEach(country=>country.classList.remove('country-selected'));
 });
 const selectCountry=node=>{
  highlight(node.dataset.country);
  const locations={'Россия':[156,235,1.2],'Узбекистан':[326,377,2.15],'Китай':[541,414,1.45]};
  if(citySelected)return;
  const [x,y,scale]=locations[node.dataset.country];
  Object.assign(target,{scale,x:(1-scale)*x+(460-x)*.18,y:(1-scale)*y+(270-y)*.18});
  move();
  countries.forEach(country=>country.classList.toggle('country-selected',country===node));
 };
 countries.forEach(node=>{
  node.addEventListener('pointermove',event=>{if(event.movementX||event.movementY)selectCountry(node)});
  
  node.addEventListener('focus',()=>selectCountry(node));
  
  const activateCountry=()=>{
   clearTimeout(resetTimer);
   const cityName={'Китай':'Китай','Узбекистан':'Самарканд'}[node.dataset.country];
   const city=cityName&&Array.from(map.querySelectorAll('.map-city')).find(item=>item.dataset.city===cityName);
   if(city){select(city);return}
   citySelected=false;
   map.querySelectorAll('.map-city').forEach(item=>item.classList.remove('is-selected'));
   selectCountry(node);
  };
  node.style.pointerEvents='all';
  node.style.cursor='pointer';
  node.addEventListener('click',activateCountry);
  node.addEventListener('keydown',event=>{
   if(event.key==='Enter'||event.key===' '){event.preventDefault();activateCountry()}
  });
 });
 map.querySelectorAll('.map-city').forEach(city=>{
  if(['Китай','Самарканд'].includes(city.dataset.city)){
   const hit=city.querySelector('.city-hit');
   if(hit){hit.setAttribute('r','30');hit.style.pointerEvents='all'}
  }
 });
 new IntersectionObserver((entries,observer)=>{
  if(entries.some(entry=>entry.isIntersecting)){map.classList.add('map-visible');observer.disconnect()}
 },{threshold:.2}).observe(map);
})();
