(()=>{
  const d=document, root=d.documentElement, body=d.body;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData=!!(navigator.connection&&navigator.connection.saveData);
  body.classList.add('motion-ready');
  requestAnimationFrame(()=>body.classList.add('is-ready'));

  // Year and active navigation
  d.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  const path=location.pathname.replace(/index\.html$/,'');
  d.querySelectorAll('.nav-links a').forEach(a=>{
    const p=new URL(a.href,location.href).pathname.replace(/index\.html$/,'');
    if((path==='/'&&p==='/') || (path!=='/'&&p!=='/'&&path.startsWith(p))) a.setAttribute('aria-current','page');
  });

  // Mobile menu
  const menu=d.querySelector('.menu'), links=d.querySelector('.nav-links');
  const closeMenu=()=>{if(!menu||!links)return;menu.setAttribute('aria-expanded','false');links.classList.remove('open');body.classList.remove('menu-open')};
  if(menu&&links){menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));links.classList.toggle('open',!open);body.classList.toggle('menu-open',!open)});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()})}

  // Scroll progress and nav state (single rAF)
  const progress=d.querySelector('.scroll-progress'), nav=d.querySelector('.site-nav');
  let ticking=false;
  const onScroll=()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const y=scrollY; if(nav)nav.classList.toggle('scrolled',y>18); if(progress){const max=d.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,y/max):0})`} ticking=false})};
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // Reveal motion with accessible fallback
  if(!reduce && 'IntersectionObserver' in window){
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -5%'});
    d.querySelectorAll('[data-reveal]').forEach(el=>obs.observe(el));
  } else d.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('is-visible'));

  // Count-up numbers (content remains meaningful without JS)
  if(!reduce && 'IntersectionObserver' in window){
    const co=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,target=Number(el.dataset.count||0),suffix=el.dataset.suffix||'',prefix=el.dataset.prefix||'';const start=performance.now(),dur=900;const step=t=>{const p=Math.min(1,(t-start)/dur),ease=1-Math.pow(1-p,3),n=Math.round(target*ease);el.textContent=prefix+n.toLocaleString()+suffix;if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step);co.unobserve(el)}),{threshold:.5});d.querySelectorAll('[data-count]').forEach(el=>co.observe(el));
  }

  // Portrait / ambient pointer response. Disabled for reduced motion and Save-Data.
  if(!reduce&&!saveData&&matchMedia('(pointer:fine)').matches){
    const hero=d.querySelector('.hero'), stage=d.querySelector('.portrait-stage'); let raf=0,lastX=0,lastY=0;
    if(hero) hero.addEventListener('pointermove',e=>{lastX=e.clientX;lastY=e.clientY;if(raf)return;raf=requestAnimationFrame(()=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--mx',`${((lastX-r.left)/r.width*100).toFixed(1)}%`);hero.style.setProperty('--my',`${((lastY-r.top)/r.height*100).toFixed(1)}%`);raf=0})});
    if(stage) stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();stage.style.setProperty('--px',((e.clientX-r.left)/r.width-.5).toFixed(3));stage.style.setProperty('--py',((e.clientY-r.top)/r.height-.5).toFixed(3))});
    if(stage) stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--px',0);stage.style.setProperty('--py',0)});

    // Magnetic CTA micro-interaction
    d.querySelectorAll('[data-magnetic]').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--tx',`${(e.clientX-r.left-r.width/2)*.08}px`);el.style.setProperty('--ty',`${(e.clientY-r.top-r.height/2)*.12}px`)});el.addEventListener('pointerleave',()=>{el.style.setProperty('--tx','0px');el.style.setProperty('--ty','0px')})});
  }
})();
