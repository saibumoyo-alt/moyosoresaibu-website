
(()=>{
  const d=document,body=d.body,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(()=>body.classList.add('v91-loaded'));

  // The five doors explain themselves before the click.
  const signal=d.querySelector('.v91-path-signal'),label=d.querySelector('[data-v91-path-label]'),copy=d.querySelector('[data-v91-path-copy]');
  const cards=[...d.querySelectorAll('[data-v91-path]')];
  const preview=card=>{if(!card||!signal)return;cards.forEach(x=>x.classList.toggle('is-preview',x===card));signal.classList.add('is-live');label.textContent=card.dataset.v91Path||'Choose a door';copy.textContent=card.dataset.v91PathDesc||''};
  const reset=()=>{cards.forEach(x=>x.classList.remove('is-preview'));signal?.classList.remove('is-live');if(label)label.textContent='Choose a door';if(copy)copy.textContent='Hover, focus or tap a path to preview where it takes you.'};
  cards.forEach(card=>{card.addEventListener('pointerenter',()=>preview(card));card.addEventListener('focus',()=>preview(card));card.addEventListener('pointerleave',()=>{if(!card.matches(':focus'))reset()});card.addEventListener('blur',reset)});

  // People lens becomes a real interactive explanation.
  const lensTitle=d.querySelector('[data-v91-lens-title]'),lensCopy=d.querySelector('[data-v91-lens-copy]'),lens=[...d.querySelectorAll('[data-v91-lens]')];
  lens.forEach(btn=>btn.addEventListener('click',()=>{lens.forEach(x=>x.classList.toggle('is-active',x===btn));if(lensTitle)lensTitle.textContent=btn.dataset.v91Lens;if(lensCopy)lensCopy.textContent=btn.dataset.v91LensCopy||''}));

  // Chapter rail.
  const rail=[...d.querySelectorAll('[data-v91-story]')];
  const map=rail.map(a=>({a,el:d.querySelector(a.getAttribute('href'))})).filter(x=>x.el);
  if(map.length&&'IntersectionObserver'in window){
    const state=new Map();
    const update=()=>{const live=[...state].filter(([,v])=>v).map(([el])=>el);if(!live.length)return;const c=innerHeight/2;const best=live.sort((a,b)=>Math.abs(a.getBoundingClientRect().top+a.offsetHeight/2-c)-Math.abs(b.getBoundingClientRect().top+b.offsetHeight/2-c))[0];rail.forEach(a=>a.classList.toggle('is-active',d.querySelector(a.getAttribute('href'))===best))};
    const io=new IntersectionObserver(es=>{es.forEach(e=>state.set(e.target,e.isIntersecting));update()},{rootMargin:'-38% 0px -38% 0px'});map.forEach(x=>io.observe(x.el));
  }

  // Subtle hero depth only on fine pointers.
  if(!reduced&&matchMedia('(pointer:fine)').matches){
    const title=d.querySelector('[data-v91-start-parallax="title"]'),portrait=d.querySelector('[data-v91-start-parallax="portrait"]');let mx=0,my=0,raf=0;
    const render=()=>{raf=0;if(title)title.style.transform=`translate3d(${mx*-4}px,${my*-2}px,0)`;if(portrait)portrait.style.transform=`translate3d(${mx*6}px,${my*4}px,0)`};
    addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;if(!raf)raf=requestAnimationFrame(render)},{passive:true});
  }

  const cur=d.querySelector('.v91-start-cursor');
  if(cur&&!reduced&&matchMedia('(pointer:fine)').matches){
    addEventListener('pointermove',e=>{cur.classList.add('on');cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px'},{passive:true});
    d.querySelectorAll('a,button').forEach(el=>{el.addEventListener('pointerenter',()=>cur.classList.add('hot'));el.addEventListener('pointerleave',()=>cur.classList.remove('hot'))});
  }
})();
