
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
