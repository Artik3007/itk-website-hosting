// A single piece of fabric follows the visitor through the production cycle.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches)return;
 const size=240;
 const canvas=document.createElement('canvas');
 const ratio=Math.min(4,Math.ceil(innerWidth/size));
 canvas.width=size*ratio;canvas.height=280*ratio;
 const ctx=canvas.getContext('2d');
 if(!ctx)return;
 ctx.scale(ratio,ratio);
 canvas.className='textile-background';
 canvas.setAttribute('aria-hidden','true');
 document.body.prepend(canvas);
 for(const section of document.querySelectorAll('main > section, main > footer')){
  section.style.setProperty('--textile-section-color',getComputedStyle(section).backgroundColor);
 }
 document.body.classList.add('has-textile-background');
 const texture=document.createElement('canvas');texture.width=64;texture.height=64;
 const ink=texture.getContext('2d');
 ink.fillStyle='#44464a';ink.fillRect(0,0,64,64);
 ink.lineWidth=1.15;
 for(let x=0;x<64;x+=16){
  const slope=(x%32===0)?1:-1;
  for(let y=-16;y<80;y+=4){
   ink.strokeStyle=y%8===0?'#4e5053':'#383b3e';
   ink.beginPath();ink.moveTo(x,y);ink.lineTo(x+16,y+slope*12);ink.stroke();
  }
 }
 const renderRoll=createFabricRoll();
 const weave=ctx.createPattern(texture,'repeat');
 weave.setTransform(new DOMMatrix().scale(.18));
 const clamp=value=>Math.max(0,Math.min(1,value));
 const ease=value=>{const t=clamp(value);return t*t*(3-2*t)};
 const mix=(a,b,t)=>a+(b-a)*t;
 // Both adjoining pieces follow the same curved armhole when assembled.
 const bodyShape=new Path2D('M120 113 Q111 113 106 100 L94 98 Q96 123 84 136 L84 206 H120 Z');
 const sleeveShape=new Path2D('M94 98 Q96 123 84 136 L61 151 L46 126 Z');
 const parts=[
  {shape:bodyShape,blank:[74,88,39,108],bounds:[84,98,36,108],dx:-17,dy:8},
  {shape:bodyShape,blank:[127,88,39,108],bounds:[84,98,36,108],dx:17,dy:8,mirror:true},
  {shape:sleeveShape,blank:[36,88,31,62],bounds:[46,98,50,53],dx:-25,dy:-12},
  {shape:sleeveShape,blank:[173,88,31,62],bounds:[46,98,50,53],dx:25,dy:-12,mirror:true}
 ];
 // Sample the actual curved outlines once, keeping the cutting head at constant distance.
 const contourPaths=[
  'M120 113 Q111 113 106 100 L94 98 Q96 123 84 136 L84 206 H120 Z',
  'M94 98 Q96 123 84 136 L61 151 L46 126 Z'
 ];
 const contours=contourPaths.map(d=>{
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d',d);
  const length=path.getTotalLength();
  return Array.from({length:241},(_,i)=>{
   const point=path.getPointAtLength(length*i/240);
   return [point.x,point.y];
  });
 });
 let target=0,current=0,frame=0,last=0,visible=true;
 const polygon=points=>{
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
 };
 function trace(points,fraction){
  if(fraction<=0)return;
  const lengths=points.slice(1).map(([x,y],i)=>Math.hypot(x-points[i][0],y-points[i][1]));
  let remaining=lengths.reduce((a,b)=>a+b,0)*fraction;
  ctx.beginPath();ctx.moveTo(...points[0]);
  for(let i=0;i<lengths.length && remaining>0;i++){
   const t=Math.min(1,remaining/lengths[i]);
   ctx.lineTo(mix(points[i][0],points[i+1][0],t),mix(points[i][1],points[i+1][1],t));
   remaining-=lengths[i];
  }
  ctx.stroke();
 }
 const signature=document.querySelector('.signature-word');
 const footer=signature.closest('footer');
 const word=signature.cloneNode(true);
 word.classList.add('travelling-signature');
 word.setAttribute('aria-hidden','true');
 word.hidden=true;
 const wordViewport=document.createElement('div');
 Object.assign(wordViewport.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'2'});
 wordViewport.setAttribute('aria-hidden','true');
 wordViewport.append(word);document.body.append(wordViewport);
 let footerProgress=0,footerTarget=0,footerBlend=.1,footerY=null;
 function footerTransition(){
  const destination=signature.getBoundingClientRect();
  const start=scrollY+footer.getBoundingClientRect().top-innerHeight*.85;
  const end=Math.min(document.documentElement.scrollHeight-innerHeight,
   scrollY+destination.top+destination.height/2-innerHeight*.52);
  footerTarget=clamp((scrollY-start)/Math.max(1,end-start));
  footerProgress+=(footerTarget-footerProgress)*footerBlend;
  if(Math.abs(footerTarget-footerProgress)<.00001)footerProgress=footerTarget;
  const progress=footerProgress;
  const destinationY=destination.top+destination.height/2;
  if(footerY===null)footerY=destinationY;
  footerY+=(destinationY-footerY)*footerBlend;
  const growth=ease((progress-.35)/.65)*ease((current-.96)/.04);
  const handoff=ease((progress-.20)/.14)*ease((current-.96)/.025);
  const lead=innerHeight*.15;
  const glow=ease((scrollY-start+lead)/(lead+(end-start)*.11))*(1-ease((progress-.26)/.36));
  const settled=progress===1&&growth>.99999;
  word.hidden=handoff===0||settled;
  signature.style.opacity=settled?'1':'0';
  wordViewport.style.clipPath='none';

  if(!word.hidden){
   const rect=canvas.getBoundingClientRect(),units=canvas.clientWidth/size;
   const angle=-Math.PI/30;
   const px=20.15*units*1.15,py=4.5*units*1.15;
   const x=rect.left+rect.width/2+px*Math.cos(angle)-py*Math.sin(angle);
   const y=rect.top+rect.height/2+px*Math.sin(angle)+py*Math.cos(angle);
   const destinationStyle=getComputedStyle(signature);
   Object.assign(word.style,{
    fontFamily:destinationStyle.fontFamily,
    fontSize:destinationStyle.fontSize,
    fontWeight:destinationStyle.fontWeight,
    letterSpacing:destinationStyle.letterSpacing,
    lineHeight:destinationStyle.lineHeight,
    width:destination.width+'px',height:destination.height+'px',
    left:mix(x,destination.left+destination.width/2,growth)+'px',
    top:mix(y,footerY,growth)+'px',
    transform:'translate(-50%,-50%) rotate('+mix(-6,0,growth)+'deg) scale('+mix(17*units*1.15/destination.width,1,growth)+')',
    opacity:String(handoff),
    background:'none',
    color:'rgb('+Math.round(mix(254,227,growth))+','+Math.round(mix(94,38,growth))+','+Math.round(mix(108,54,growth))+')',
    webkitTextFillColor:'rgb('+Math.round(mix(254,227,growth))+','+Math.round(mix(94,38,growth))+','+Math.round(mix(108,54,growth))+')',
    textShadow:'0 0 .045em rgba(255,78,98,'+(.65*glow)+'), 0 0 .12em rgba(255,45,70,'+(.36*glow)+')'
   });
  }
  return {growth,handoff,glow};
 }
 const render=()=>{
  ctx.clearRect(0,0,size,280);
  // Open up the backdrop as the pocket arrives so the red thread retains its colour.
  const finishLight=ease((current-.76)/.13);
  document.body.style.setProperty('--textile-cover',mix(72,52,finishLight)+'%');
  canvas.style.setProperty('--textile-top',(innerWidth<=900?52:mix(52,13,finishLight))+'%');
  const transition=footerTransition();
  canvas.style.opacity=String(mix(.7,.64,finishLight)*(1-ease(transition.growth/.8)));
  const unfold=ease(current/.14),pattern=ease((current-.11)/.15);
  const cut=ease((current-.235)/.15),trim=ease((current-.36)/.15),assemble=ease((current-.485)/.15),sew=ease((current-.61)/.15);
  ctx.save();
  ctx.translate(120,142);
  const clothMotion=Math.sin(current*Math.PI*2)*Math.sin(current*Math.PI);
  ctx.translate(0,clothMotion*1.2);ctx.rotate(mix(.06,0,assemble)+clothMotion*.006);
  const garmentScale=1+assemble*.15;ctx.scale(garmentScale,garmentScale);ctx.translate(-120,-142);
  // Cut holes in the source sheet before moving the corresponding blanks.
  // The sheet and the blanks occupy disjoint regions from the first cut frame.
  const flatten=ease((current-.205)/.03);
  if(cut===0 && flatten<1){
   ctx.globalAlpha=.95*(1-flatten);
   if(renderRoll)renderRoll(ctx,unfold);
   else {ctx.fillStyle=weave;ctx.fillRect(28,72,184,mix(96,214,unfold)-72)}
  }
  if(flatten>0 && cut<1){
   const remaining=new Path2D();
   remaining.rect(28,72,184,142);
   if(cut>0)parts.forEach(({blank})=>remaining.rect(...blank));
   ctx.fillStyle=weave;
   ctx.globalAlpha=.95*flatten*(1-ease(cut));
   ctx.fill(remaining,'evenodd');
  }
  parts.forEach(({shape,blank,bounds,dx,dy,mirror},index)=>{
   const [x,y,w,h]=blank,[bx,by,bw,bh]=bounds;
   const left=mix(x+dx*cut,mirror?240-bx-bw:bx,assemble);
   const width=mix(w,bw,assemble);
   ctx.save();
   ctx.translate(left+(mirror?width:0),mix(y+dy*cut,by,assemble));
   ctx.scale((mirror?-1:1)*width/bw,mix(h,bh,assemble)/bh);
   ctx.translate(-bx,-by);
   const contour=contours[index<2?0:1];
   const cutting=clamp(trim/.72);
   const release=ease((trim-.72)/.28);
   ctx.fillStyle=weave;ctx.globalAlpha=cut>0?.95:0;
   ctx.fill(shape);
   // The offcut remains a full piece of material until the contour is severed.
   const scrap=new Path2D();
   scrap.rect(bx,by,bw,bh);
   scrap.addPath(shape);
   if(release<1){
    ctx.save();
    ctx.translate(-release*14,-release*5);
    ctx.translate(bx,by);ctx.rotate(-release*.12);ctx.translate(-bx,-by);
    ctx.globalAlpha=(cut>0?.95:0)*(1-release);
    ctx.fill(scrap,'evenodd');
    ctx.restore();
   }
   ctx.globalAlpha=pattern*(1-sew)*.38;
   ctx.strokeStyle='#e2d8cb';ctx.lineWidth=.45;
   ctx.setLineDash([1.5,2]);trace(contour,pattern);ctx.setLineDash([]);
   if(cutting>0 && release<1){
    ctx.globalAlpha=cut*(1-release)*.9;
    ctx.strokeStyle='#c8c7bd';ctx.lineWidth=.65;
    ctx.lineJoin='round';ctx.lineCap='round';
    trace(contour,cutting);
    const position=cutting*240,segment=Math.min(239,Math.floor(position));
    const fraction=position-segment;
    const headX=mix(contour[segment][0],contour[segment+1][0],fraction);
    const headY=mix(contour[segment][1],contour[segment+1][1],fraction);
    ctx.beginPath();ctx.arc(headX,headY,.85,0,Math.PI*2);
    ctx.fillStyle='#e5dfd0';ctx.fill();
   }
   ctx.restore();
  });
  if(sew>0){
   ctx.globalAlpha=sew*.48;ctx.strokeStyle='#aebec5';ctx.lineWidth=.8;ctx.setLineDash([2,3]);
   ctx.beginPath();ctx.moveTo(88,139);ctx.lineTo(88,201);ctx.lineTo(152,201);ctx.lineTo(152,139);ctx.stroke();
   ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(104,101);ctx.quadraticCurveTo(110,116,120,116);ctx.quadraticCurveTo(130,116,136,101);ctx.stroke();
  }
  const placement=ease((current-.735)/.08);
  if(placement>0){
   ctx.save();ctx.globalAlpha=placement;
   ctx.translate(130+(1-placement)*27,135-(1-placement)*18);
   ctx.rotate((1-placement)*.19);
   polygon([[0,0],[20,0],[20,19],[10,23],[0,19]]);
   ctx.fillStyle=weave;ctx.fill();ctx.fillStyle='#101113a8';ctx.fill();
   ctx.strokeStyle='#bacbd080';ctx.lineWidth=.55;ctx.stroke();
   const seam=ease((current-.80)/.085);
   ctx.strokeStyle='#c7d7db';ctx.lineWidth=.6;ctx.setLineDash([1,.7]);
   trace([[1.3,1.8],[1.3,18],[10,21.6],[18.7,18],[18.7,1.8]],seam);
   ctx.setLineDash([]);
   const logo=ease((current-.84)/.14);
   ctx.globalAlpha*=1-transition.handoff;
   ctx.shadowColor='#ff5165';ctx.shadowBlur=transition.glow*6*ratio;
   ctx.strokeStyle='rgb(255,'+Math.round(64+transition.glow*84)+','+Math.round(83+transition.glow*70)+')';ctx.lineWidth=1.45;ctx.lineCap='round';ctx.lineJoin='round';
   const letters=[[[2.5,7],[2.5,12],[6,7],[6,12]],[[8,7],[12,7]],[[10,7],[10,12]],[[14,12],[14,7]],[[17.8,7],[14,9.5],[17.8,12]]];
   letters.forEach((stroke,index)=>trace(stroke,clamp(logo*letters.length-index)));
   ctx.restore();
  }
  ctx.restore();ctx.globalAlpha=1;
 };
 const tick=now=>{
  const delta=Math.min(48,last?now-last:16);last=now;
  footerBlend=1-Math.exp(-delta/200);
  current+=(target-current)*(1-Math.exp(-delta/180));
  if(Math.abs(target-current)<.00001)current=target;
  render();
  if(Math.abs(target-current)>.00001||Math.abs(footerTarget-footerProgress)>.00001)frame=requestAnimationFrame(tick);
  else {frame=0;last=0}
 };
 const completionSection=document.getElementById("contact");
 const request=()=>{
  const height=document.documentElement.scrollHeight-innerHeight;
  const finish=completionSection?Math.min(height,scrollY+completionSection.getBoundingClientRect().top-innerHeight*.95):height;
  // The category grid offers little visible background, so it advances
  // the sequence at a gentler, continuously visible pace.
  const categories=document.getElementById('directions');
  let excludedStart=0,excludedEnd=0;
  if(categories){
   excludedStart=Math.min(finish,scrollY+categories.getBoundingClientRect().top);
   excludedEnd=Math.min(finish,excludedStart+categories.offsetHeight);
  }
  const hiddenLength=Math.max(0,excludedEnd-excludedStart);
  const skipped=Math.max(0,Math.min(hiddenLength,scrollY-excludedStart));
  const effectiveFinish=finish-hiddenLength*.45;
  target=effectiveFinish>0?clamp((scrollY-skipped*.45)/effectiveFinish):0;
  if(visible&&!frame)frame=requestAnimationFrame(tick);
 };
 addEventListener('scroll',request,{passive:true});
 addEventListener('resize',request,{passive:true});
 document.addEventListener('visibilitychange',()=>{
  visible=!document.hidden;
  if(!visible){cancelAnimationFrame(frame);frame=0;last=0}else request();
 });
 document.addEventListener('hero:revealed',request,{once:true});
 if('ResizeObserver' in window)new ResizeObserver(request).observe(document.body);
 request();
})();
