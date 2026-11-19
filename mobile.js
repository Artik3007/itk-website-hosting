
(()=>{
 const toggle=document.querySelector('.mobile-menu-toggle');
 const header=document.querySelector('.site-header');
 if(!toggle||!header)return;
 const mobile=matchMedia('(max-width:900px)');
 const close=()=>{
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label','Открыть меню');
  header.classList.remove('menu-open');
 };
 toggle.addEventListener('click',()=>{
  const open=toggle.getAttribute('aria-expanded')!=='true';
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
  header.classList.toggle('menu-open',open);
 });
 header.querySelector('nav').addEventListener('click',event=>{
  if(event.target.closest('a'))close();
 });
 document.addEventListener('click',event=>{if(!header.contains(event.target))close()});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){close();toggle.focus()}
 });

 mobile.addEventListener('change',close);
 const map=document.querySelector('.interactive-map');
 if(map){
  const controls=document.createElement('div');controls.className='mobile-map-cities';
  controls.setAttribute('role','group');controls.setAttribute('aria-label','Выбрать город');
  map.querySelectorAll('.map-city').forEach(city=>{
   const button=document.createElement('button');button.type='button';
   button.dataset.city=city.dataset.city;
   button.textContent=city.dataset.city;button.setAttribute('aria-pressed','false');
   button.addEventListener('click',()=>{
    controls.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    city.dispatchEvent(new MouseEvent('click',{bubbles:true}));
   });
   controls.append(button);
  });
  map.append(controls);
  const syncSelection=()=>{
   const selected=map.querySelector('.map-city.is-selected');
   controls.querySelectorAll('button').forEach(button=>{
    button.setAttribute('aria-pressed',String(Boolean(selected&&button.dataset.city===selected.dataset.city)));
   });
  };
  const selectionObserver=new MutationObserver(syncSelection);
  map.querySelectorAll('.map-city').forEach(city=>selectionObserver.observe(city,{attributes:true,attributeFilter:['class']}));
  syncSelection();
 }

})();
