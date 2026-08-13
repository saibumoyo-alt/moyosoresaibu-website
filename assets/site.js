(()=>{
  const worker='https://moyosore-contact-mailer.saibumoyo.workers.dev/contact';

  function setStarted(form){
    const field=form.querySelector('[name="started_at"]');
    if(field) field.value=String(Date.now());
  }

  function setupForm(form,type){
    if(!form) return;
    const status=form.querySelector('[data-form-status]');
    const submit=form.querySelector('[type="submit"]');
    setStarted(form);

    if(type==='contact'){
      const intent=new URLSearchParams(location.search).get('intent');
      const select=form.querySelector('select[name="intent"]');
      if(intent&&select&&[...select.options].some(o=>o.value===intent)) select.value=intent;
    }

    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(!form.reportValidity()) return;
      const data=Object.fromEntries(new FormData(form).entries());
      if(type==='field-notes'){
        data.type='field-notes';
        data.name='Field Notes Subscriber';
        data.intent='field-notes';
        data.message='Please add this email to the Moyosore Saibu Field Notes early list. The subscriber opted in on moyosoresaibu.com.';
      }else{
        data.type='contact';
        data.from='contact-page';
      }
      data.started_at=data.started_at||String(Date.now()-2000);

      submit.disabled=true;
      submit.setAttribute('aria-busy','true');
      if(status){status.textContent=type==='field-notes'?'Joining…':'Sending your message…';status.className='form-status';}
      try{
        const response=await fetch(worker,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
        const result=await response.json().catch(()=>({}));
        if(!response.ok||!result.ok) throw new Error(result.error||'send_failed');
        if(status){
          status.textContent=type==='field-notes'?'You’re on the Field Notes list. Thank you.':'Message sent. I aim to reply within two working days when a response is needed.';
          status.className='form-status success';
        }
        form.reset(); setStarted(form);
      }catch(error){
        if(status){
          status.textContent=type==='field-notes'?'I could not complete the signup. Please use the email link below.':'I could not send the form. Please use the email link below.';
          status.className='form-status error';
        }
      }finally{
        submit.disabled=false;
        submit.removeAttribute('aria-busy');
      }
    });
  }

  setupForm(document.querySelector('[data-contact-form]'),'contact');
  document.querySelectorAll('[data-newsletter-form]').forEach(form=>setupForm(form,'field-notes'));

  // Local section navigation. Normal anchor links work without JavaScript.
  const nav=document.querySelector('[data-section-nav]');
  if(nav && 'IntersectionObserver' in window){
    const links=[...nav.querySelectorAll('[data-section-link]')];
    const sections=links.map(link=>document.getElementById(link.dataset.sectionLink)).filter(Boolean);
    const setCurrent=id=>links.forEach(link=>{
      const active=link.dataset.sectionLink===id;
      link.classList.toggle('is-current',active);
      if(active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
    });
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(visible) setCurrent(visible.target.id);
    },{rootMargin:'-25% 0px -60% 0px',threshold:[0,.1,.25,.5]});
    sections.forEach(section=>observer.observe(section));
  }

  // Lightweight before/after story. If this script fails, both states remain visible.
  const demo=document.querySelector('[data-decision-demo]');
  if(demo && 'IntersectionObserver' in window && matchMedia('(min-width: 720px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    demo.classList.add('is-enhanced');
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting && entry.intersectionRatio>=.45) demo.classList.add('is-after');
        else if(!entry.isIntersecting && entry.boundingClientRect.top>0) demo.classList.remove('is-after');
      });
    },{threshold:[0,.2,.45,.75]});
    observer.observe(demo);
  }


  // Safe real-time context: local browser time in Nigeria (Africa/Lagos). The HTML fallback is already readable.
  const watTargets=[...document.querySelectorAll('[data-wat-time]')];
  if(watTargets.length){
    const watFormatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',hour:'2-digit',minute:'2-digit',hour12:false,timeZoneName:'short'});
    const updateWat=()=>{
      const text=watFormatter.format(new Date()).replace('GMT+1','WAT');
      watTargets.forEach(el=>{el.textContent=text+' · Nigeria'; el.setAttribute('datetime',new Date().toISOString());});
    };
    updateWat();
    setInterval(updateWat,30000);
  }

  // Interactive proof explorer. Without JavaScript all proof panels remain visible.
  document.querySelectorAll('[data-proof-explorer]').forEach(explorer=>{
    const tabs=[...explorer.querySelectorAll('[data-proof-tab]')];
    const panels=[...explorer.querySelectorAll('[data-proof-panel]')];
    if(!tabs.length||!panels.length) return;
    explorer.classList.add('is-enhanced');
    const activate=key=>{
      tabs.forEach(tab=>{
        const active=tab.dataset.proofTab===key;
        tab.setAttribute('aria-selected',String(active));
        tab.tabIndex=active?0:-1;
      });
      panels.forEach(panel=>{ const active=panel.dataset.proofPanel===key; panel.classList.toggle('is-active',active); panel.hidden=!active; });
    };
    activate(tabs[0].dataset.proofTab);
    tabs.forEach((tab,index)=>{
      tab.addEventListener('click',()=>activate(tab.dataset.proofTab));
      tab.addEventListener('keydown',event=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        let next=index;
        if(event.key==='ArrowRight') next=(index+1)%tabs.length;
        if(event.key==='ArrowLeft') next=(index-1+tabs.length)%tabs.length;
        if(event.key==='Home') next=0;
        if(event.key==='End') next=tabs.length-1;
        tabs[next].focus(); activate(tabs[next].dataset.proofTab);
      });
    });
    explorer.querySelectorAll('[data-career-tip]').forEach(segment=>{
      const tip=explorer.querySelector('[data-career-tooltip]');
      const show=()=>{if(tip) tip.textContent=segment.dataset.careerTip;};
      segment.addEventListener('mouseenter',show); segment.addEventListener('focus',show); segment.addEventListener('click',show);
    });
  });

  // Calm reveal motion. It never hides content when motion is reduced or JS is unavailable.
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
    document.documentElement.classList.add('motion-ready');
    const targets=[...document.querySelectorAll('.section-head,.metric,.card,.service,.fit-card,.case-feature,.article-row,.social-card,.proof-explorer,.method-strip,.cta-panel,.page-hero .shell')];
    targets.forEach(el=>el.setAttribute('data-motion-reveal',''));
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}
    }),{rootMargin:'0px 0px -8% 0px',threshold:.06});
    targets.forEach(el=>reveal.observe(el));
  }

})();
