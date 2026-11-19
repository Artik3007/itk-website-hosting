const worlds=[
{id:'work',name:'Спецодежда и СИЗ',title:'Спецодежда<br>и СИЗ',text:'Функциональная одежда и средства защиты для профессионалов. Разработка под условия эксплуатации и корпоративный дизайн-код заказчика.',points:['Специальная и форменная одежда','Подбор материалов под условия работы','Образцы, серийный пошив и поставка']},
{id:'flags',name:'Флаги',title:'Флаги',text:'Флаги и флаговая продукция для компаний, государственных организаций и мероприятий.',points:['Корпоративная и государственная символика','Печать и пошив','Комплектация и доставка']},
{id:'homeware',name:'Домашний текстиль / HoReCa',title:'Домашний<br>текстиль',text:'Текстиль для дома, отелей и ресторанов. Материалы и изделия под задачи заказчика.',points:['Домашний текстиль','Решения для гостиниц и ресторанов','Подбор тканей и изготовление']},
{id:'merch',name:'Мерч',title:'Мерч',text:'Брендированные изделия для компаний. Разработка, подбор материалов, пошив и нанесение символики.',points:['Сувенирный текстиль и аксессуары','Корпоративный дизайн-код','Печать и машинная вышивка']},
{id:'fashion',name:'Fashion',title:'Fashion',text:'Разработка и пошив коллекций для брендов. Работа с эскизами, конструкцией, посадкой и деталями.',points:['Конструирование и опытные образцы','Примерки и доработка','Финальные лекала и серийный пошив']},
{id:'sport',name:'Спорт',title:'Спорт',text:'Спортивная экипировка и командная одежда под задачи заказчика.',points:['Командная одежда','Подбор материалов и конструкции','Нанесение символики']}
];

const list=document.querySelector('#world-list');
const directionDescriptions={
 work:'Одежда и защита для профессионалов',
 flags:'Символика компаний, городов и событий',
 homeware:'Для дома, отелей и ресторанов',
 merch:'Одежда и аксессуары с вашим характером',
 fashion:'Коллекции для модных брендов',
 sport:'Экипировка для команд и движения'
};
worlds.forEach((w,i)=>{
 const button=document.createElement('button');
 button.className='direction-row direction-card direction-card-'+w.id;
 const image=document.createElement('img');
 image.src='assets/'+(w.id==='fashion'?'fashion-portrait':w.id==='sport'?'sport-portrait':w.id)+'.jpg';
 if(['merch','sport'].includes(w.id))image.src='assets/'+w.id+'-card-itk.png?v=2';
 if(w.id==='fashion')image.src='assets/fashion.jpg?v=2';
 image.alt='';image.loading='lazy';
 const copy=document.createElement('span');copy.className='direction-card-copy';
 const name=document.createElement('span');name.className='direction-name';name.textContent=w.name;
 const description=document.createElement('span');description.className='direction-card-description';description.textContent=directionDescriptions[w.id];
 copy.append(name,description);button.append(image,copy);
 button.setAttribute('aria-controls','direction-details-'+w.id);
 button.setAttribute('aria-expanded','false');
 const allowMotion=matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)');
 let pointerFrame=0;
 button.addEventListener('pointermove',event=>{
  if(!allowMotion.matches)return;
  const rect=button.getBoundingClientRect();
  const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
  const y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
  cancelAnimationFrame(pointerFrame);
  pointerFrame=requestAnimationFrame(()=>{
   button.style.setProperty('--pointer-x',x*100+'%');
   button.style.setProperty('--pointer-y',y*100+'%');
   button.style.setProperty('--image-x',(x-.5)*8+'px');
   button.style.setProperty('--image-y',(y-.5)*6+'px');
  });
 });
 button.addEventListener('pointerleave',()=>{
  cancelAnimationFrame(pointerFrame);
  button.style.setProperty('--image-x','0px');
  button.style.setProperty('--image-y','0px');
 });
 button.addEventListener('click',()=>{
  if(!switchingDirection)openWorld(i);
 });
 const card=document.createElement('article');
 card.className='direction-item';
 const details=document.createElement('div');
 details.id='direction-details-'+w.id;
 details.className='direction-expanded-copy';
 details.hidden=true;
 const back=document.createElement('button');
 back.type='button';back.className='direction-back';back.textContent='Все направления';
 back.addEventListener('click',()=>changeDirection(card,false));
 const heading=document.createElement('h3');heading.textContent=w.name;
 const text=document.createElement('p');text.textContent=w.text;
 const points=document.createElement('div');points.className='direction-expanded-points';
 w.points.forEach(value=>{const p=document.createElement('p');p.textContent=value;points.append(p)});
 const contact=document.createElement('a');contact.href='#contact';contact.className='solid-link';contact.textContent='Обсудить заказ';
 contact.addEventListener('click',()=>closeWorld());
 details.append(back,heading,text,points,contact);
 card.append(button,details);list.append(card);
});

let switchingDirection=false;
let selectedCard=null;
// Measure the photo itself, including the portion outside the thumbnail crop.
function photoFrame(img){
 const rect=img.getBoundingClientRect(),style=getComputedStyle(img);
 const fit=style.objectFit==='contain'?Math.min:Math.max;
 const scale=fit(rect.width/img.naturalWidth,rect.height/img.naturalHeight);
 const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
 const [px,py]=style.objectPosition.split(' ').map(v=>parseFloat(v)/100);
 return {x:rect.x+(rect.width-w)*px,y:rect.y+(rect.height-h)*py,w,h,rect};
}
async function changeDirection(card,opening){
 if(switchingDirection)return;
 if(matchMedia('(max-width:900px)').matches){
  switchingDirection=true;
  const details=card.querySelector('.direction-expanded-copy');
  const button=card.querySelector('.direction-card');
  const open=opening&&!card.classList.contains('mobile-detail-open');
  details.querySelector('.direction-back').textContent='Свернуть';
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  try{
   const start=details.hidden?0:details.getBoundingClientRect().height;
   details.style.height=start+'px';
   details.hidden=false;
   card.classList.toggle('mobile-detail-open',open);
   button.setAttribute('aria-expanded',String(open));
   const end=open?details.scrollHeight:0;
   details.style.overflow='hidden';
   const animation=details.animate([
    {height:start+'px'},
    {height:end+'px'}
   ],{duration:reduced?0:850,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'});
   if(open){
    selectedCard=card;
    // Keep the touched card stationary while its contents unfold.
    // Scrolling against a changing document height caused visible corrections.
   }
   await animation.finished;
   details.style.height=open?'auto':'0px';
   details.hidden=!open;
   animation.cancel();
   details.style.overflow='';
   if(!open&&selectedCard===card)selectedCard=null;
  }finally{switchingDirection=false}
  return;
 }
 switchingDirection=true;
 const details=card.querySelector('.direction-expanded-copy'),button=card.querySelector('button'),img=button.querySelector('img');
 const others=Array.from(list.children).filter(item=>item!==card);
 const animations=[];
 let caption;
 const expanded=value=>{
  card.classList.toggle('detail-open',value);
  details.hidden=!value;
 };
 try{
  await img.decode().catch(()=>{});
  if(opening){
   selectedCard=card;
   list.style.minHeight=list.offsetHeight+'px';
  }
  button.setAttribute('aria-expanded',String(opening));
  others.forEach(item=>{item.inert=true});
  if(img.naturalWidth&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
   // Measure both layouts in one task. Paint both directions using the same
   // uncropped, full-size image, ending at its actual resting transform.
   expanded(false);
   const thumb=photoFrame(img),crop=button.getBoundingClientRect();
   const grid=list.getBoundingClientRect();
   // Carry the thumbnail caption and its shading along for the first part of
   // the move. The photograph underneath remains the same DOM element.
   caption=button.cloneNode(true);
   caption.querySelector('img').remove();
   caption.inert=true;
   caption.setAttribute('aria-hidden','true');
   caption.classList.add('travelling-caption');
   Object.assign(caption.style,{left:crop.left-grid.left+'px',top:crop.top-grid.top+'px',width:crop.width+'px',height:crop.height+'px'});
   list.append(caption);
   expanded(true);
   const full=photoFrame(img),box=full.rect,scale=thumb.w/full.w;
   const left=thumb.x-(full.x-box.x)*scale,top=thumb.y-(full.y-box.y)*scale;
   const inset=[crop.top-top,left+box.width*scale-crop.right,top+box.height*scale-crop.bottom,crop.left-left];
   const collapsed={
    transform:'translate('+ (left-box.x)+'px,'+(top-box.y)+'px) scale('+scale+')',
    clipPath:'inset('+inset.map(v=>Math.max(0,v/scale)+'px').join(' ')+' round '+22/scale+'px)'
   };
   const resting={transform:'none',clipPath:'inset(0px round 0px)'};
   card.classList.add('photo-travelling');
   const play=(element,frames,duration,delay=0)=>{
    animations.push(element.animate(frames,{duration,delay,easing:'cubic-bezier(.42,0,.25,1)',fill:'both',direction:opening?'normal':'reverse'}));
   };
   play(img,[collapsed,resting],740);
   if(opening){
    const rect=card.getBoundingClientRect();
    const top=scrollY+rect.top-Math.max(16,(innerHeight-rect.height)/2);
    window.scrollTo({top:Math.max(0,top),behavior:'smooth'});
   }

   const dx=full.x+(crop.left-thumb.x)/scale-crop.left;
   const dy=full.y+(crop.top-thumb.y)/scale-crop.top;
   play(caption,[{transform:'none'},{transform:'translate('+dx+'px,'+dy+'px) scale('+1/scale+')'}],740);
   play(caption,[{opacity:1},{opacity:0,offset:.55},{opacity:0}],740);
   play(details,[{opacity:0,offset:0},{opacity:0,offset:.3},{opacity:1}],740);
   others.forEach(item=>{
    item.style.visibility='visible';
    play(item,[{opacity:1},{opacity:0,offset:.65},{opacity:0}],740);
   });
   await Promise.all(animations.map(animation=>animation.finished));
  }
 }finally{
  caption?.remove();
  expanded(opening);
  if(opening&&matchMedia('(prefers-reduced-motion:reduce)').matches)card.scrollIntoView({block:'center',behavior:'instant'});
  card.classList.remove('photo-travelling');
  animations.forEach(animation=>animation.cancel());
  others.forEach(item=>{item.inert=opening;item.style.visibility=opening?'hidden':''});
  if(!opening){list.style.minHeight='';selectedCard=null}
  switchingDirection=false;
 }
}
function openWorld(i){if(matchMedia('(max-width:900px)').matches||!selectedCard)changeDirection(list.children[i],true)}
function closeWorld(){if(selectedCard)changeDirection(selectedCard,false)}
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeWorld()});

// Reuse the underline itself as the fixed page-position indicator.
let resolveYearSettled,resolveRailRevealed;
const yearSettled=new Promise(resolve=>{resolveYearSettled=resolve});
const railRevealed=new Promise(resolve=>{resolveRailRevealed=resolve});
Promise.all([yearSettled,railRevealed]).then(()=>{
 const year=document.querySelector('.year-odometer');
 year?.classList.remove('is-glowing');year?.classList.add('is-settled');
 document.dispatchEvent(new Event('intro:accent-settle'));
});
const pageProgress=(function(){
 const line=document.querySelector('#opening .intro-rule');
 if(!line){resolveRailRevealed();return {dock:()=>{},initialReady:Promise.resolve(),travelDuration:3000};}
 const fill=line.querySelector('i');
 if(matchMedia('(max-width:900px)').matches){
  resolveRailRevealed();
  line.style.width='min(80vw,340px)';
  const initial=fill.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],
   {duration:1400,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  fill.style.transformOrigin='left';
  const initialReady=initial.finished.then(()=>{
   line.animate([{opacity:1},{opacity:0}],{
    duration:1500,delay:150,easing:'ease-in-out',fill:'forwards'
   });
  }).catch(()=>{});
  return {initialReady,travelDuration:1400,dock:()=>line.remove()};
 }

 const pixelsPerSecond=450;
 const millisecondsFor=distance=>distance/pixelsPerSecond*1000;
 let ready=false,moving=false,queued=false,trail=null,frame=0,routeState=null;
 let resolveInitial;const initialDone=new Promise(resolve=>{resolveInitial=resolve});
 let sectionNav=null;
 const stops=[['top','Главная'],['production','Производство'],['directions','Продукция'],['geography','География'],['about','О компании'],['contact','Контакты']].map(([id,label])=>({id,label,section:document.getElementById(id)})).filter(stop=>stop.section);
 const ensureSectionNav=()=>{
  if(sectionNav)return;
  sectionNav=document.createElement('nav');sectionNav.className='rail-section-list';sectionNav.setAttribute('aria-label','Разделы страницы');
  stops.forEach(stop=>{
   const link=document.createElement('a');link.className='rail-section';link.href='#'+stop.id;link.setAttribute('aria-label',stop.label);const label=document.createElement('span');label.className='rail-section-label';label.textContent=stop.label;link.append(label);stop.link=link;
   sectionNav.append(link);
  });document.body.append(sectionNav);
 };
 const updateSectionNav=()=>{
  if(!sectionNav)return;
  const g=geometry(),max=Math.max(1,document.scrollingElement.scrollHeight-innerHeight),scroll=window.scrollY;
  Object.assign(sectionNav.style,{left:g.left+'px',top:g.top+'px',height:g.height+'px'});
  let active=stops[0];
  stops.forEach(stop=>{
   const top=stop.section.getBoundingClientRect().top+scroll;
   stop.position=stop.id==='top'?0:Math.max(0,Math.min(1,top/max));stop.link.style.top=(stop.position*100)+'%';
   if(top<=scroll+innerHeight*.25)active=stop;
  });
  if(fraction()>.995)active=stops[stops.length-1];
  stops.forEach(stop=>{const selected=stop===active;stop.link.classList.toggle('is-active',selected);if(selected)stop.link.setAttribute('aria-current','location');else stop.link.removeAttribute('aria-current')});
 };
 const geometry=()=>({left:innerWidth<=640?6:16,top:innerHeight*.2,height:innerHeight*.6});
 const fraction=()=>{const page=document.scrollingElement,length=page.scrollHeight-innerHeight;return length>0?Math.max(0,Math.min(1,page.scrollTop/length)):0};
 const update=()=>{queued=false;if(!ready)return;const value=fraction();fill.style.transform=`scaleY(${value})`;line.style.setProperty('--page-position',value);line.setAttribute('aria-valuenow',String(Math.round(value*100)));updateSectionNav()};
 const requestUpdate=()=>{if(!queued){queued=true;requestAnimationFrame(update)}};
 const ease=t=>t*t*(3-2*t);
 const dock=arrivalTime=>{
  const arriving=moving&&!!trail;
  if(frame){cancelAnimationFrame(frame);frame=0}
  resolveInitial();
  if(trail){const old=trail;trail=null;old.animate([{opacity:1},{opacity:0}],{duration:900,easing:'linear',fill:'forwards'}).finished.then(()=>old.remove()).catch(()=>old.remove())}
  const g=geometry();
  if(ready){Object.assign(line.style,{left:(g.left-1)+'px',top:g.top+'px',height:g.height+'px'});requestUpdate();return}
  ready=true;moving=false;document.body.append(line);
  line.getAnimations().forEach(a=>a.cancel());fill.getAnimations().forEach(a=>a.cancel());
  line.className='page-progress';line.removeAttribute('aria-hidden');
  Object.assign(line.style,{position:'fixed',left:(g.left-1)+'px',top:g.top+'px',width:'2px',height:g.height+'px',margin:'0',animation:'none',transform:'none',opacity:'1',visibility:'visible'});
  Object.assign(fill.style,{animation:'none',transformOrigin:'top',width:'100%',height:'100%'});ensureSectionNav();update();
  if(!line.querySelector('.progress-origin')){
   const origin=document.createElement('span');origin.className='progress-origin';origin.setAttribute('aria-hidden','true');line.append(origin);
  }
  if(arriving&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   line.dataset.whiteReveal='true';
   stops.forEach(stop=>stop.link.classList.remove('is-lit'));
   document.dispatchEvent(new Event('intro:rail-glow'));
   const glow='0 0 5px 1px #ffffffcc,0 0 14px 3px #dceaff88';
   const railReveal=line.animate([
    {opacity:1,clipPath:'inset(-16px -16px 100% -16px)',backgroundColor:'#ffffff',boxShadow:glow},
    {opacity:1,clipPath:'inset(-16px -16px 0px -16px)',backgroundColor:'#ffffff',boxShadow:glow}
   ],{duration:millisecondsFor(g.height),easing:'linear',fill:'both'});
   // Use the rail's actual eased progress, not separate label-delay estimates.
   if(Number.isFinite(arrivalTime))railReveal.startTime=arrivalTime;
   const lightLabels=()=>{
    const progress=railReveal.effect.getComputedTiming().progress??0;
    stops.forEach(stop=>{if(stop.position<=progress+.001)stop.link.classList.add('is-lit')});
    if(railReveal.playState==='running'||railReveal.playState==='pending')requestAnimationFrame(lightLabels);
   };
   requestAnimationFrame(lightLabels);
   railReveal.finished.then(()=>{stops.forEach(stop=>stop.link.classList.add('is-lit'));resolveRailRevealed()}).catch(resolveRailRevealed);
  }else resolveRailRevealed();
 };
 document.addEventListener('intro:accent-settle',()=>{
  if(line.dataset.whiteReveal==='true')line.animate([
   {backgroundColor:'#ffffff',boxShadow:'0 0 5px 1px #ffffffcc,0 0 14px 3px #dceaff88'},
   {backgroundColor:'rgba(255,255,255,0.14)',boxShadow:'0 0 0 0 transparent'}
  ],{duration:900,easing:'linear',fill:'forwards'});
  line.classList.add('is-settled');
  sectionNav?.classList.remove('is-lit');sectionNav?.classList.add('is-settled');
  stops.forEach(stop=>stop.link.classList.remove('is-lit'));
 },{once:true});
 line.setAttribute('role','progressbar');line.setAttribute('aria-label','Положение на странице');line.setAttribute('aria-valuemin','0');line.setAttribute('aria-valuemax','100');
 const initialise=()=>{
  if(ready)return;
  const rect=line.getBoundingClientRect(),g=geometry();
  const y=rect.top+rect.height/2,x=rect.left,end=rect.right;
  const radius=Math.max(1,Math.min(70,(x-g.left)*.65,(y-g.top)*.3));
  const canvas=document.createElement('canvas');
  const left=g.left-10,top=g.top-10;
  const width=Math.ceil(end-left+10),height=Math.ceil(y-top+10);
  const scale=Math.min(devicePixelRatio||1,3);
  canvas.width=Math.ceil(width*scale);canvas.height=Math.ceil(height*scale);
  canvas.className='progress-trail';canvas.setAttribute('aria-hidden','true');
  Object.assign(canvas.style,{inset:'auto',left:left+'px',top:top+'px',width:width+'px',height:height+'px'});
  const ctx=canvas.getContext('2d');
  if(!ctx){dock();return}
  ctx.setTransform(scale,0,0,scale,-left*scale,-top*scale);
  ctx.lineCap='round';
  trail=canvas;document.body.append(canvas);
  const horizontal=end-(g.left+radius),arcLength=Math.PI*radius/2;
  const length=horizontal+arcLength+(y-radius-g.top),underline=end-x;
  const pointAt=distance=>{
   const d=Math.max(0,Math.min(length,distance));
   if(d<=horizontal)return {x:end-d,y,tx:-1,ty:0};
   if(d<=horizontal+arcLength){const angle=(d-horizontal)/radius;return {x:g.left+radius-radius*Math.sin(angle),y:y-radius+radius*Math.cos(angle),tx:-Math.cos(angle),ty:-Math.sin(angle)}};
   return {x:g.left,y:y-radius-(d-horizontal-arcLength),tx:0,ty:-1};
  };
  const subpath=(from,to)=>{
   let cursor=Math.max(0,from);const finish=Math.min(length,Math.max(cursor,to)),start=pointAt(cursor);
   let d=`M ${start.x} ${start.y}`;
   if(cursor<horizontal&&finish>cursor){const next=pointAt(Math.min(finish,horizontal));d+=` L ${next.x} ${next.y}`;cursor=Math.min(finish,horizontal)}
   if(cursor<horizontal+arcLength&&finish>cursor){const next=pointAt(Math.min(finish,horizontal+arcLength));d+=` A ${radius} ${radius} 0 0 1 ${next.x} ${next.y}`;cursor=Math.min(finish,horizontal+arcLength)}
   if(finish>cursor){const next=pointAt(finish);d+=` L ${next.x} ${next.y}`}
   return d;
  };
  let previousBounds;
  const draw=(from,to,position,direction=1)=>{
   if(previousBounds)ctx.clearRect(...previousBounds);
   const head=pointAt(position),start=pointAt(from),finish=pointAt(to);
   const xs=[head.x,start.x,finish.x],ys=[head.y,start.y,finish.y];
   const minX=Math.min(...xs)-8,minY=Math.min(...ys)-8;
   previousBounds=[minX,minY,Math.max(...xs)-minX+8,Math.max(...ys)-minY+8];
   const path=new Path2D(subpath(from,to));
   ctx.save();
   ctx.translate(head.x,head.y);
   ctx.rotate(Math.atan2(head.ty*direction,head.tx*direction));
   const extent=width+height;
   ctx.beginPath();ctx.rect(-extent,-extent,extent-1,2*extent);ctx.clip();
   ctx.setTransform(scale,0,0,scale,-left*scale,-top*scale);
   for(const [weight,color] of [[10,'#eb30490c'],[6,'#eb304922'],[3,'#eb304942'],[1.5,'#eb3049']]){
    ctx.lineWidth=weight;ctx.strokeStyle=color;ctx.stroke(path);
   }
   ctx.restore();
   ctx.beginPath();ctx.arc(head.x,head.y,2,0,2*Math.PI);ctx.fillStyle='#ffbbc6';ctx.fill();
  };
  routeState={length,underline,draw};draw(underline,underline,underline,-1);
  const appearanceDuration=millisecondsFor(underline);
  const begun=performance.now()+Math.max(100,1900-appearanceDuration);
  const turnAt=begun+appearanceDuration;
  const arriveAt=turnAt+millisecondsFor(length);
  const tick=now=>{
   if(ready)return;
   if(now<turnAt){
    const position=Math.min(underline,(turnAt-now)*pixelsPerSecond/1000);
    draw(position,underline,position,-1);
   }else{
    if(!moving){moving=true;resolveInitial()}
    const position=Math.min(length,(now-turnAt)*pixelsPerSecond/1000);
    const inkEnd=Math.max(0,position-1.5);
    draw(Math.max(0,inkEnd-180),inkEnd,position);
    if(now>=arriveAt){dock(arriveAt);return}
   }
   frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
 };
 (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{if(!ready)requestAnimationFrame(initialise)});
 window.addEventListener('scroll',requestUpdate,{passive:true});window.addEventListener('resize',dock,{passive:true});
 if('ResizeObserver' in window)new ResizeObserver(requestUpdate).observe(document.body);
 return {dock,initialReady:initialDone,get travelDuration(){return routeState?millisecondsFor(routeState.length):3000}};
})();

// Carry the opening title into the real heading instead of changing slides.
(function startTitleTransition(){
 const opening=document.querySelector('#opening');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced || (location.hash && location.hash!=='#' && location.hash!=='#top')){pageProgress.dock();opening.remove();return}
 document.body.classList.add('intro-motion');
 const backdrop=document.createElement('div');backdrop.className='intro-backdrop';opening.prepend(backdrop);
 let completed=false;let timer;
 const reset=()=>{if(completed)return;completed=true;clearTimeout(timer);pageProgress.dock();document.body.classList.remove('intro-motion');opening.remove();document.querySelectorAll('.hero-title-line').forEach(el=>{el.getAnimations().forEach(a=>a.cancel());el.style.transform='none';el.style.opacity='1';el.style.willChange='auto'});document.querySelector('.hero h1').style.opacity='1';document.querySelectorAll('.travelling-title').forEach(e=>e.remove())};
 const enter=async()=>{
  if(completed)return;
  const sources=[...opening.querySelectorAll('.intro-text-line span')];
  const targets=[...document.querySelectorAll('.hero-title-line')];
  if(sources.length!==3 || targets.length!==3){reset();return}
  try{
   const duration=innerWidth<=900?3000:2100,ease='cubic-bezier(.4,0,.2,1)';
   // Move the actual hero letters, so there is no replacement or font-size jump at arrival.
   const measurements=sources.map((source,i)=>({source,target:targets[i],start:source.getBoundingClientRect(),end:targets[i].getBoundingClientRect(),color:getComputedStyle(targets[i]).color}));
   const heading=document.querySelector('.hero h1');
   const moves=measurements.map(({source,target,start,end,color},i)=>{
    const dx=start.left-end.left,dy=start.top-end.top;
    const sx=start.width/end.width,sy=innerWidth<=900?sx:start.height/end.height;
    const origin=`translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})`;
    target.style.transformOrigin='0 0';
    target.style.transform=origin;
    target.style.opacity='0';
    target.style.willChange='transform,opacity';
    source.animate([{opacity:1},{opacity:0}],{duration:650,easing:'ease-in-out',fill:'forwards'});
    target.animate([{opacity:0},{opacity:1}],{duration:650,easing:'ease-in-out',fill:'forwards'});
    return target.animate([
     {transform:origin,color},
     {transform:'translate3d(0,0,0) scale(1,1)',color}
    ],{duration,delay:100+i*35,easing:ease,fill:'forwards'}).finished;
   });
   if(innerWidth<=900){
    const side=opening.querySelector('.intro-side-mark');
    const identity=document.querySelector('header .identity strong');
    if(side&&identity){
     const start=side.getBoundingClientRect(),end=identity.getBoundingClientRect();
     // Animate the final glyphs themselves: no differently spaced mark at arrival.
     const origin=`translate3d(${start.left-end.left}px,${start.top-end.top}px,0) scale(${start.width/end.width},${start.height/end.height})`;
     identity.style.transformOrigin='0 0';
     identity.style.willChange='transform,opacity';
     identity.style.display='inline-block';
     const duration=3000;
     side.animate([{opacity:1},{opacity:0}],{duration:650,easing:'ease-in-out',fill:'forwards'});
     identity.animate([{opacity:0},{opacity:1}],{duration:650,easing:'ease-in-out',fill:'forwards'});
     const flight=identity.animate([{transform:origin},{transform:'translate3d(0,0,0) scale(1,1)'}],
      {duration,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
     moves.push(flight.finished.then(()=>{
      identity.style.transform='none';identity.style.opacity='1';identity.style.willChange='auto';
      identity.getAnimations().forEach(animation=>animation.cancel());
     }));
    }
   }
   heading.style.opacity='1';
   document.body.dataset.heroEntering='true';document.dispatchEvent(new Event('hero:enter'));
   backdrop.animate([{opacity:1},{opacity:0}],{duration:1900,easing:'ease-in-out',fill:'forwards'});
   opening.querySelectorAll(innerWidth<=900?'.intro-light':'.intro-side-mark,.intro-light').forEach(el=>el.animate([{opacity:getComputedStyle(el).opacity},{opacity:0}],{duration:1000,fill:'forwards'}));
   const elements=[['header',180,0,innerWidth<=900?0:-18],['.hero-since',520,0,15],['.hero-monogram',600,18,0],['.hero-photo-main',730,35,14],['.hero-photo-small',900,15,25],['.fabric-label',1050,20,15],['.hero-type>p',1000,0,15],['.hero-actions',1160,0,15]];
   const entranceAnimations=[];
   elements.forEach(([selector,delay,x,y])=>{
    const el=document.querySelector(selector);if(!el)return;
    if(selector==='header'&&innerWidth<=900){el.style.opacity='1';return}
    entranceAnimations.push(el.animate([{opacity:0,translate:`${x}px ${y}px`},{opacity:1,translate:'0px 0px'}],{duration:850,delay,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'}).finished);
   });
   Promise.all(entranceAnimations).then(()=>{document.body.dataset.heroRevealed='true';document.dispatchEvent(new Event('hero:revealed'))}).catch(()=>{});
   await Promise.all(moves);
   completed=true;
   document.body.classList.remove('intro-motion');
   opening.remove();
   targets.forEach(target=>{
    target.style.transform='none';target.style.opacity='1';target.style.willChange='auto';
    target.getAnimations().forEach(animation=>animation.cancel());
   });
  }catch(error){reset()}
 };
 // Finish the initial letter reveal before beginning the continuous movement.
 const ready=Promise.all([document.fonts?document.fonts.ready:Promise.resolve(),...Array.from(document.querySelectorAll('#top img')).map(img=>img.decode().catch(()=>{}))]);
 Promise.all([ready,pageProgress.initialReady]).then(()=>{timer=setTimeout(enter,0)});
 const introWidth=innerWidth;
 window.addEventListener('resize',()=>{if(Math.abs(innerWidth-introWidth)>12)reset()});
 setTimeout(reset,8000);
})();

// Reveal numerical facts when they enter the viewport. Contact data stays static.
(function animateNumbersOnScroll(){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const roots=[document.querySelector('main')].filter(Boolean);
 const exclude='script,style,a,button,dialog,footer,.opening,.hero-since,.production-addresses strong,.number-motion';
 const pattern=/\d(?:[\d\u00a0\u202f ]*\d)?(?:[,.]\d+)?/g;
 const entries=[];
 roots.forEach(root=>{
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
   if(!node.parentElement || node.parentElement.closest(exclude))return NodeFilter.FILTER_REJECT;
   return /\d/.test(node.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
   const text=node.nodeValue;const matches=[...text.matchAll(pattern)];if(!matches.length)return;
   const fragment=document.createDocumentFragment();let offset=0;
   matches.forEach(match=>{
    const original=match[0],normalized=original.replace(/[ \u00a0\u202f]/g,'').replace(',','.');
    const target=Number(normalized);if(!Number.isFinite(target))return;
    fragment.append(document.createTextNode(text.slice(offset,match.index)));
    const wrapper=document.createElement('span');wrapper.className='number-motion';
    const value=document.createElement('span');value.className='count-value';value.setAttribute('aria-hidden','true');value.textContent=original;
    const accessible=document.createElement('span');accessible.className='sr-only';accessible.textContent=original;
    wrapper.append(value,accessible);fragment.append(wrapper);
    entries.push({wrapper,value,original,target,year:/^(19|20)\d{2}$/.test(normalized),decimal:normalized.includes('.')?normalized.split('.')[1].length:0,grouped:/[ \u00a0\u202f]/.test(original),comma:original.includes(',')});
    offset=match.index+original.length;
   });
   fragment.append(document.createTextNode(text.slice(offset)));node.replaceWith(fragment);
  });
 });
 const byElement=new Map(entries.map(entry=>[entry.wrapper,entry]));
 const observer=new IntersectionObserver(observations=>{
  observations.forEach(observation=>{
   if(!observation.isIntersecting)return;
   const entry=byElement.get(observation.target);observer.unobserve(observation.target);
   const {wrapper,value,original,target,year,decimal,grouped,comma}=entry;
   // Reserve final width so nearby text and the plus sign never jump.
   value.style.minWidth=value.getBoundingClientRect().width+'px';
   wrapper.classList.add('is-counting');
   const start=performance.now(),duration=year?2400:3200,from=year?target-18:0;
   const tick=now=>{
    const progress=Math.min(1,(now-start)/duration);const ease=1-Math.pow(1-progress,4);
    const number=from+(target-from)*ease;
    let formatted=decimal?number.toFixed(decimal):String(Math.round(number));
    let parts=formatted.split('.');
    if(grouped)parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ');
    formatted=parts.join(comma?',':'.');value.textContent=progress===1?original:formatted;
    if(progress<1)requestAnimationFrame(tick);else{wrapper.classList.remove('is-counting');wrapper.classList.add('is-counted')}
   };
   requestAnimationFrame(tick);
  });
 },{threshold:.55});
 const begin=()=>entries.forEach(entry=>observer.observe(entry.wrapper));
 if(document.body.classList.contains('intro-motion')){
  const introObserver=new MutationObserver(()=>{if(!document.body.classList.contains('intro-motion')){introObserver.disconnect();begin()}});
  introObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
 }else begin();
})();

// Slow, one-time text reveals as each block enters the viewport.
(function revealTextOnScroll(){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const selector='main .section-label, .about-intro h2, .about-intro p, .stats>div, .history summary, .timeline article, .direction-heading>span, .direction-heading h2, .direction-row, .partner-intro>span, .partner-intro h2, .partner-intro p, .map-heading>div>span, .map-heading h2, .map-heading>p, .production-new-heading>span, .production-new-heading h2, .production-new-heading>p, .production-story h3, .production-story p, .production-addresses h3, .production-addresses>div, .case-layout .kicker, .case-layout h2, .case-layout p, .case-stats>div, .career>div>.kicker, .career h2, .career p, .career .text-link, .footer-info>div, .footer-order, .signature-scene>p, .signature-bottom';
 const elements=[...document.querySelectorAll(selector)];
 // Apply the effect to whole text blocks, preserving inline counter animations.
 elements.forEach(element=>element.classList.add('scroll-text-reveal'));
 const observer=new IntersectionObserver(entries=>{
  let order=0;
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   entry.target.style.transitionDelay=Math.min(order++*90,270)+'ms';
   entry.target.classList.add('is-revealed');observer.unobserve(entry.target);
  });
 },{threshold:.12,rootMargin:'0px 0px -3% 0px'});
 elements.forEach(element=>observer.observe(element));
 // Collapsed history remains observable after opening; IntersectionObserver handles it.
})();

// Four independent digit reels roll downward from 0000 to the founding year.
(function foundingYearReels(){
 const strong=document.querySelector('.hero-since strong');if(!strong){resolveYearSettled();return;}
 const final='2009';
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){resolveYearSettled();return;}
 const year=document.createElement('span');year.className='year-odometer';year.setAttribute('aria-label',final);
 const reels=[];
 [...final].forEach((digit,index)=>{
  const window=document.createElement('span');window.className='year-digit';window.setAttribute('aria-hidden','true');
  const strip=document.createElement('span');strip.className='year-reel';
  const frames=['0'];
  const turns=2+index;
  for(let turn=0;turn<turns;turn++)for(let n=1;n<=10;n++)frames.push(String(n%10));
  for(let n=1;n<=Number(digit);n++)frames.push(String(n));
  [...frames].reverse().forEach(value=>{const cell=document.createElement('span');cell.textContent=value;strip.append(cell)});
  const offset=frames.length-1;strip.style.transform=`translate3d(0,-${offset}em,0)`;
  window.append(strip);year.append(window);reels.push({strip,offset,index});
 });
 strong.replaceChildren(document.createTextNode('с '),year,document.createTextNode(' года'));
 document.addEventListener('intro:rail-glow',()=>year.classList.add('is-glowing'),{once:true});
 let started=false;
 const start=()=>{if(started)return;started=true;const reelTotal=Math.max(1400,pageProgress.travelDuration-40);const animations=reels.map(({strip,offset,index})=>strip.animate([
  {transform:`translate3d(0,-${offset}em,0)`},
  {transform:'translate3d(0,0,0)'}
 ],{duration:reelTotal-(3-index)*100-index*40,delay:index*40,easing:'cubic-bezier(.22,.55,.45,1)',fill:'forwards'}).finished);
 const lastDigit=year.lastElementChild;
 const colorChange=lastDigit.animate([{color:getComputedStyle(lastDigit).color},{color:'#ffffff'}],{delay:reelTotal-900,duration:900,easing:'ease-in-out',fill:'forwards'});
 Promise.all([...animations,colorChange.finished]).then(()=>{year.classList.add('is-year-ready');colorChange.cancel();resolveYearSettled()}).catch(resolveYearSettled)};
 // Begin with the title migration, about two seconds before the old full-reveal trigger.
 document.addEventListener('hero:enter',start,{once:true});
 if(document.body.dataset.heroEntering==='true')start();
 else if(!document.body.classList.contains('intro-motion')){
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();start()}},{threshold:1});observer.observe(strong);
 }else{
  const observer=new MutationObserver(()=>{if(!document.body.classList.contains('intro-motion')){observer.disconnect();start()}});
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 }
})();

// Use one cancellable animation for all section links.
(()=>{
 let frame=0;
 const cancel=()=>{cancelAnimationFrame(frame);frame=0};
 addEventListener('wheel',cancel,{passive:true});
 addEventListener('touchstart',cancel,{passive:true});
 addEventListener('keydown',event=>{
  if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))cancel();
 });
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(!link)return;
  const id=link.getAttribute('href').slice(1)||'top';
  const section=document.getElementById(id);
  if(!section)return;
  event.preventDefault();cancel();
  const origin=window.scrollY;
  const destination=()=>id==='top'?0:Math.max(0,Math.min(
   document.documentElement.scrollHeight-innerHeight,
   section.getBoundingClientRect().top+window.scrollY
  ));
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){
   window.scrollTo({top:destination(),behavior:'instant'});return;
  }
  const distance=Math.abs(destination()-origin);
  const duration=id==='contact'?Math.min(4200,Math.max(1800,distance*.65)):Math.min(2400,Math.max(1100,distance*.4));
  const finalPosition=destination();
  let start;
  const tick=now=>{
   if(start===undefined)start=now;
   const progress=Math.min(1,(now-start)/duration);
   const eased=progress*progress*progress*(progress*(progress*6-15)+10);
   window.scrollTo({top:origin+(finalPosition-origin)*eased,behavior:'instant'});
   if(progress<1)frame=requestAnimationFrame(tick);
   else frame=0;
  };
  frame=requestAnimationFrame(tick);
 });
})();
