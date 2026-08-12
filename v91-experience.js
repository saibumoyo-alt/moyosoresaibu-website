
(()=>{
  const d=document, body=d.body;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(()=>body.classList.add('v91-loaded'));

  const kinetic=d.querySelector('[data-v91-kinetic]');
  if(kinetic){
    if(reduced || !('IntersectionObserver' in window)) kinetic.classList.add('v91-in');
    else new IntersectionObserver(([e],io)=>{if(e?.isIntersecting){kinetic.classList.add('v91-in');io.disconnect()}},{threshold:.28}).observe(kinetic);
  }

  // Lightweight cinematic parallax. No library, disabled for touch/reduced motion.
  if(!reduced && matchMedia('(pointer:fine)').matches){
    const title=d.querySelector('[data-v91-parallax="title"]');
    const portrait=d.querySelector('[data-v91-parallax="portrait"]');
    let mx=0,my=0,raf=0;
    const render=()=>{raf=0;if(title)title.style.transform=`translate3d(${mx*-5}px,${my*-3}px,0)`;if(portrait)portrait.style.transform=`translate3d(${mx*7}px,${my*5}px,0)`};
    addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5);my=(e.clientY/innerHeight-.5);if(!raf)raf=requestAnimationFrame(render)},{passive:true});
  }

  // Right chapter rail follows the section closest to the viewport centre.
  const railLinks=[...d.querySelectorAll('[data-v91-rail]')];
  const targets=railLinks.map(a=>({a,el:d.querySelector(a.getAttribute('href'))})).filter(x=>x.el);
  if(targets.length && 'IntersectionObserver' in window){
    const seen=new Map();
    const update=()=>{const candidates=[...seen.entries()].filter(([,v])=>v).map(([el])=>el);if(!candidates.length)return;const center=innerHeight/2;const best=candidates.sort((a,b)=>Math.abs(a.getBoundingClientRect().top+a.offsetHeight/2-center)-Math.abs(b.getBoundingClientRect().top+b.offsetHeight/2-center))[0];railLinks.forEach(a=>a.classList.toggle('is-active',d.querySelector(a.getAttribute('href'))===best))};
    const io=new IntersectionObserver(es=>{es.forEach(e=>seen.set(e.target,e.isIntersecting));update()},{rootMargin:'-38% 0px -38% 0px',threshold:0});targets.forEach(x=>io.observe(x.el));
  }

  // Sequential emphasis through the 3-step method.
  const steps=[...d.querySelectorAll('.v9-step')];
  if(steps.length && 'IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){steps.forEach(x=>x.classList.remove('v91-active'));e.target.classList.add('v91-active')}}),{rootMargin:'-28% 0px -46% 0px',threshold:.2});steps.forEach(s=>io.observe(s));
  }

  // Fine-pointer cursor: a restrained response, not a novelty cursor replacement.
  const cur=d.querySelector('.v91-cursor');
  if(cur && !reduced && matchMedia('(pointer:fine)').matches){
    addEventListener('pointermove',e=>{cur.classList.add('is-on');cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px'},{passive:true});
    d.querySelectorAll('a,button,[data-magnetic]').forEach(el=>{el.addEventListener('pointerenter',()=>cur.classList.add('is-hot'));el.addEventListener('pointerleave',()=>cur.classList.remove('is-hot'))});
  }
})();
