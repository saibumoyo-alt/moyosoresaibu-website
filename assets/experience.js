(()=>{
  const d=document;

  // Interactive mode switcher only. Site freshness is rendered statically at build time
  // so the public page never depends on a third-party API to look complete.
  d.querySelectorAll('[data-v9-mode-group]').forEach(group=>{
    const tabs=[...group.querySelectorAll('[data-v9-mode-tab]')];
    const panels=[...group.querySelectorAll('[data-v9-mode-panel]')];
    const activate=(id,focus=false)=>{
      tabs.forEach(tab=>{
        const active=tab.dataset.v9ModeTab===id;
        tab.setAttribute('aria-selected',String(active));
        tab.tabIndex=active?0:-1;
        if(active&&focus)tab.focus();
      });
      panels.forEach(panel=>panel.hidden=panel.dataset.v9ModePanel!==id);
    };
    tabs.forEach((tab,i)=>{
      tab.addEventListener('click',()=>activate(tab.dataset.v9ModeTab));
      tab.addEventListener('keydown',e=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
        e.preventDefault();let n=i;
        if(e.key==='ArrowRight')n=(i+1)%tabs.length;
        if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;
        if(e.key==='Home')n=0;
        if(e.key==='End')n=tabs.length-1;
        activate(tabs[n].dataset.v9ModeTab,true);
      });
    });
    const initial=tabs.find(t=>t.getAttribute('aria-selected')==='true')?.dataset.v9ModeTab||tabs[0]?.dataset.v9ModeTab;
    if(initial)activate(initial);
  });

  const params=new URLSearchParams(location.search);
  const src=(params.get('utm_source')||params.get('source')||'').toLowerCase();
  const route=d.querySelector('[data-v9-route-context]');
  if(route){
    if(src.includes('instagram')||document.referrer.includes('instagram.com')) route.textContent='Instagram arrival · Start Here is available as an optional guided route';
    else if(src.includes('linkedin')||document.referrer.includes('linkedin.com')) route.textContent='LinkedIn arrival · proof and experience remain one click away';
    else route.textContent='Primary homepage · Start Here is optional';
  }
})();

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

(()=>{
  const d=document;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt=(zone)=>new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
  const updateTimes=()=>{
    const wat=fmt('Africa/Lagos');
    const local=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
    d.querySelectorAll('[data-v92-wat]').forEach(el=>el.textContent=`WAT ${wat}`);
    d.querySelectorAll('[data-v92-local]').forEach(el=>el.textContent=local);
    const [wh]=wat.split(':').map(Number), lh=new Date().getHours();
    const overlap=(wh>=8&&wh<19&&lh>=8&&lh<19)?'Good daytime overlap':'Time context only';
    d.querySelectorAll('[data-v92-overlap]').forEach(el=>el.textContent=overlap);
  };
  updateTimes(); setInterval(updateTimes,30000);

  const routes={
    coverage:{title:'Coverage / route quality',reason:'Coverage can look healthy while outlet priority, availability or call quality is doing the real damage.',move:'Separate “visited” from “productive”: check priority outlets, availability, conversion and repeat orders.',primary:['See route thinking','/insights/route-discipline.html'],secondary:['Start with the problem','/contact.html?intent=challenge&from=router']},
    followup:{title:'Follow-up / customer timing',reason:'“Not now” is not useful until the timing, reason and next trigger are captured.',move:'Define the next specific touch: who, when, why, and what would make the conversation different next time.',primary:['Read follow-up thinking','/insights/follow-up-wins.html'],secondary:['Start a conversation','/contact.html?intent=challenge&from=router']},
    activation:{title:'Activation / behaviour change',reason:'Visibility is an input. The better question is whether customer or shopper behaviour changed afterward.',move:'Inspect availability, recommendation, occasion fit and repeat behaviour before adding more assets.',primary:['See commercial work','/projects.html?from=router'],secondary:['Start with the problem','/contact.html?intent=challenge&from=router']},
    hiring:{title:'Fit / career evidence',reason:'A hiring decision should start with evidence, scope and how the work was actually done.',move:'Review roles, public outcomes and the evidence note before deciding whether a conversation is worth having.',primary:['Review experience','/experience.html?from=router'],secondary:['Open evidence','/evidence.html?from=router']},
    availability:{title:'Availability / execution gap',reason:'Demand cannot convert when the product or proposition is missing at the moment of choice.',move:'Find where availability breaks: outlet priority, replenishment, stock discipline or execution timing.',primary:['Read availability thinking','/insights/availability-beats-intention.html'],secondary:['Start with the problem','/contact.html?intent=challenge&from=router']},
    tools:{title:'Tools / workflow friction',reason:'A tool earns its place when it shortens repetitive work without outsourcing judgment.',move:'Name the repeated friction first, then choose the smallest system that removes it.',primary:['Explore projects','/projects.html?from=router'],secondary:['Start here','/start/?source=router']},
    generic:{title:'Decision clarity',reason:'The first job is to separate the signal from the assumption before prescribing a solution.',move:'Write down what changed, where it changed, who is affected and what decision must become clearer.',primary:['Take the 60-second route','/start/?source=router'],secondary:['Start with the problem','/contact.html?intent=challenge&from=router']}
  };
  const classify=(raw)=>{
    const q=raw.toLowerCase();
    const hit=(xs)=>xs.some(x=>q.includes(x));
    if(hit(['hire','hiring','recruit','role','candidate','cv','resume','fit']))return 'hiring';
    if(hit(['follow','not now','customer','reply','ignored','rejection','promise']))return 'followup';
    if(hit(['activation','visibility','display','promo','sampling','repeat purchase']))return 'activation';
    if(hit(['stock','availability','out of stock','oos','replenish']))return 'availability';
    if(hit(['route','coverage','visit','outlet','territory','call quality','volume','sales flat','sales are still']))return 'coverage';
    if(hit(['ai','automation','tool','workflow','content','excel','system']))return 'tools';
    return 'generic';
  };
  d.querySelectorAll('[data-v92-router]').forEach(form=>{
    const input=form.querySelector('input[name="problem"]'), out=form.querySelector('[data-v92-output]');
    const label=form.querySelector('[data-v92-route-label]'),reason=form.querySelector('[data-v92-route-reason]'),move=form.querySelector('[data-v92-route-move]');
    const a=form.querySelector('[data-v92-route-primary]'),b=form.querySelector('[data-v92-route-secondary]');
    const render=(raw)=>{
      const r=routes[classify(raw)]||routes.generic; label.textContent=r.title;reason.textContent=r.reason;move.textContent=r.move;
      a.textContent=r.primary[0]+' ↗';a.href=r.primary[1];b.textContent=r.secondary[0]+' ↗';b.href=r.secondary[1];out.hidden=false;
      const scenario=classify(raw); if(['coverage','activation','followup'].includes(scenario)) activateScenario(scenario,false);
    };
    form.addEventListener('submit',e=>{e.preventDefault();render((input.value||'').trim())});
    form.querySelectorAll('[data-v92-example]').forEach(btn=>btn.addEventListener('click',()=>{input.value=btn.dataset.v92Example||'';input.focus();render(input.value)}));
  });

  const scenarioGroups=[...d.querySelectorAll('[data-v92-scenario-group]')];
  function activateScenario(id,focus=false){
    scenarioGroups.forEach(group=>{
      const tabs=[...group.querySelectorAll('[data-v92-scenario-tab]')], panels=[...group.querySelectorAll('[data-v92-scenario-panel]')];
      if(!tabs.some(t=>t.dataset.v92ScenarioTab===id))return;
      tabs.forEach(t=>{const on=t.dataset.v92ScenarioTab===id;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;if(on&&focus)t.focus()});
      panels.forEach(p=>p.hidden=p.dataset.v92ScenarioPanel!==id);
    });
  }
  scenarioGroups.forEach(group=>{
    const tabs=[...group.querySelectorAll('[data-v92-scenario-tab]')];
    tabs.forEach((tab,i)=>{
      tab.addEventListener('click',()=>activateScenario(tab.dataset.v92ScenarioTab));
      tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let n=i;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;activateScenario(tabs[n].dataset.v92ScenarioTab,true)});
    });
  });
})();
