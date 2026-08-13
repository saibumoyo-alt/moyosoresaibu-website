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


  // Premium human-touch motion: reveal and light tilt. The content still works fully without this block.
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const revealTargets=[...document.querySelectorAll('.section-head,.hero-grid>div,.page-hero .shell,.metric,.card,.service,.fit-card,.case-feature,.article-row,.social-card,.decision-state,.contact-card,.evidence-item,.case-card,.timeline-item,.cta-panel,.inline-signup')];
    revealTargets.forEach(el=>el.classList.add('reveal-up'));
    if('IntersectionObserver' in window){
      const revealObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },{rootMargin:'0px 0px -8% 0px',threshold:.08});
      revealTargets.forEach((el,i)=>{
        el.style.transitionDelay=(Math.min(i%6,4)*55)+'ms';
        revealObserver.observe(el);
      });
    } else {
      revealTargets.forEach(el=>el.classList.add('is-visible'));
    }
  }

  if(matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const tiltTargets=[...document.querySelectorAll('.metric,.card,.service,.fit-card,.case-feature,.social-card,.contact-card,.evidence-item,.case-card,.photo-frame,.cta-panel')];
    tiltTargets.forEach(card=>{
      card.classList.add('tilt-card');
      card.addEventListener('mousemove',e=>{
        const r=card.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width;
        const py=(e.clientY-r.top)/r.height;
        const rx=(.5-py)*4;
        const ry=(px-.5)*6;
        card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave',()=>{ card.style.transform=''; });
      card.addEventListener('blur',()=>{ card.style.transform=''; },true);
    });
  }

})();
