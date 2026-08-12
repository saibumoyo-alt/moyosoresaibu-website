
(()=>{
  const d=document;
  const fmt=(zone)=>new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
  const update=()=>{
    const wat=fmt('Africa/Lagos'), local=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
    d.querySelectorAll('[data-v92-wat]').forEach(el=>el.textContent=`WAT ${wat}`);d.querySelectorAll('[data-v92-local]').forEach(el=>el.textContent=local);
    const wh=+wat.split(':')[0],lh=new Date().getHours();const overlap=(wh>=8&&wh<19&&lh>=8&&lh<19)?'Good daytime overlap':'Time context only';d.querySelectorAll('[data-v92-overlap]').forEach(el=>el.textContent=overlap);
  };update();setInterval(update,30000);

  const routeMap={
    fit:{title:'Start with evidence.',copy:'Review the career record, public outcomes and evidence note before deciding whether a conversation is worth having.',href:'/experience.html?from=start-router',cta:'Review experience ↗'},
    problem:{title:'Bring the messy version.',copy:'If coverage, availability, activation, follow-up or performance is not moving, start with the real context — not a polished brief.',href:'/contact.html?intent=challenge&from=start-router',cta:'Start with the problem ↗'},
    learn:{title:'Start with the thinking.',copy:'Read short field notes on customers, route discipline, follow-up and what execution teaches before the dashboard catches up.',href:'/insights/?from=start-router',cta:'Read field notes ↗'},
    tools:{title:'Start with the systems.',copy:'Explore AI, automation, content and decision tools that reduce repetitive work without outsourcing judgment.',href:'/projects.html?from=start-router',cta:'Explore tools ↗'},
    explore:{title:'Take the five-door route.',copy:'Work, wins, lessons, tools and life are all here. Pick the door that matches the question in your head.',href:'#choose',cta:'See the five doors ↓'}
  };
  d.querySelectorAll('[data-v92-start-router]').forEach(box=>{
    const buttons=[...box.querySelectorAll('[data-v92-start-choice]')],title=box.querySelector('[data-v92-start-title]'),copy=box.querySelector('[data-v92-start-copy]'),link=box.querySelector('[data-v92-start-link]');
    const choose=(id)=>{const r=routeMap[id]||routeMap.explore;buttons.forEach(b=>b.classList.toggle('is-active',b.dataset.v92StartChoice===id));title.textContent=r.title;copy.textContent=r.copy;link.href=r.href;link.textContent=r.cta};
    buttons.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.v92StartChoice)));
    const params=new URLSearchParams(location.search),src=(params.get('utm_source')||params.get('source')||'').toLowerCase();
    if(src.includes('instagram')||document.referrer.includes('instagram.com'))choose('learn');
    else if(src.includes('linkedin')||document.referrer.includes('linkedin.com'))choose('fit');
  });

  const pocket={signal:['01 / 04','Signal','See the change first. Explanation comes after evidence.'],context:['02 / 04','Context','Ask where it changed, for whom, and what else was true at the same time.'],move:['03 / 04','Move','Turn the insight into one action that a person can actually execute.'],review:['04 / 04','Review','Measure what changed, keep the lesson and make the next decision clearer.']};
  const cards=[...d.querySelectorAll('[data-v92-pocket]')],idx=d.querySelector('[data-v92-pocket-index]'),ttl=d.querySelector('[data-v92-pocket-title]'),cpy=d.querySelector('[data-v92-pocket-copy]');
  cards.forEach(card=>card.addEventListener('click',()=>{cards.forEach(c=>c.classList.toggle('is-active',c===card));const v=pocket[card.dataset.v92Pocket];if(!v)return;idx.textContent=v[0];ttl.textContent=v[1];cpy.textContent=v[2]}));
})();
