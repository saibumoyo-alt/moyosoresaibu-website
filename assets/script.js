(()=>{
  const d=document, root=d.documentElement, body=d.body;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData=!!(navigator.connection&&navigator.connection.saveData);
  body.classList.add('motion-ready');
  requestAnimationFrame(()=>body.classList.add('is-ready'));

  // Year and active navigation
  d.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  const footerCopy=d.querySelector('.footer .footer-inner > div:first-child');
  if(footerCopy) footerCopy.textContent='© 2026 Moyosore Saibu. All rights reserved.';

  const path=location.pathname.replace(/index\.html$/,'');
  d.querySelectorAll('.nav-links a').forEach(a=>{
    const p=new URL(a.href,location.href).pathname.replace(/index\.html$/,'');
    if((path==='/'&&p==='/') || (path!=='/'&&p!=='/'&&path.startsWith(p))) a.setAttribute('aria-current','page');
  });

  // Mobile menu
  const menu=d.querySelector('.menu'), links=d.querySelector('.nav-links');
  let menuWasOpened=false;
  const closeMenu=(restore=false)=>{if(!menu||!links)return;menu.setAttribute('aria-expanded','false');links.classList.remove('open');body.classList.remove('menu-open');if(restore&&menuWasOpened)menu.focus();menuWasOpened=false};
  if(menu&&links){
    menu.addEventListener('click',()=>{
      const open=menu.getAttribute('aria-expanded')==='true';
      menu.setAttribute('aria-expanded',String(!open));
      links.classList.toggle('open',!open);
      body.classList.toggle('menu-open',!open);
      menuWasOpened=!open;
      if(!open){const first=links.querySelector('a');if(first)setTimeout(()=>first.focus(),30)}
    });
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu(false)));
    addEventListener('keydown',e=>{
      if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){e.preventDefault();closeMenu(true)}
      if(e.key==='Tab'&&menu.getAttribute('aria-expanded')==='true'){
        const focusables=[...links.querySelectorAll('a')];
        if(!focusables.length)return;
        const first=focusables[0],last=focusables[focusables.length-1];
        if(e.shiftKey&&d.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&d.activeElement===last){e.preventDefault();first.focus()}
      }
    });
  }

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


  // Live West Africa Time (real-time, no external API or tracking)
  const wat=d.querySelectorAll('[data-wat-time]'),watDate=d.querySelectorAll('[data-wat-date]');
  if(wat.length){
    const watFmt=new Intl.DateTimeFormat('en-NG',{timeZone:'Africa/Lagos',hour:'2-digit',minute:'2-digit',hour12:false});
    const dateFmt=new Intl.DateTimeFormat('en-NG',{timeZone:'Africa/Lagos',weekday:'short',day:'2-digit',month:'short'});
    const hourFmt=new Intl.DateTimeFormat('en-NG',{timeZone:'Africa/Lagos',hour:'2-digit',hour12:false});
    const fieldModeEls=d.querySelectorAll('[data-field-mode]');
    const updateWat=()=>{
      const now=new Date(),time=`WAT ${watFmt.format(now)}`,date=` · ${dateFmt.format(now)}`;
      wat.forEach(el=>el.textContent=time);
      watDate.forEach(el=>el.textContent=date);
      if(fieldModeEls.length){
        const hour=Number(hourFmt.format(now));
        let mode='Planning mode · early prep';
        if(hour>=7&&hour<16) mode='Field mode · active';
        else if(hour>=16&&hour<21) mode='Review mode · follow-through';
        else if(hour>=21||hour<7) mode='Planning mode · reset & prep';
        fieldModeEls.forEach(el=>el.textContent=mode);
      }
    };
    updateWat();
    setInterval(updateWat,60000);
  }

  // Audio removed in V9.3: professional site is silent by default and by design.

  // V5 restrained 3D glass response. Fine-pointer only; touch and reduced-motion stay static.
  if(!reduce&&!saveData&&matchMedia('(pointer:fine)').matches){
    d.querySelectorAll('.card,.record,.case').forEach(el=>{
      let tiltRaf=0,lastEvent=null;
      const reset=()=>{
        el.style.setProperty('--rx','0deg');
        el.style.setProperty('--ry','0deg');
        el.style.setProperty('--sx','50%');
        el.style.setProperty('--sy','50%');
      };
      el.addEventListener('pointermove',e=>{
        lastEvent=e;
        if(tiltRaf)return;
        tiltRaf=requestAnimationFrame(()=>{
          const ev=lastEvent,r=el.getBoundingClientRect();
          const x=(ev.clientX-r.left)/r.width-.5,y=(ev.clientY-r.top)/r.height-.5;
          el.style.setProperty('--sx',`${ev.clientX-r.left}px`);
          el.style.setProperty('--sy',`${ev.clientY-r.top}px`);
          el.style.setProperty('--rx',`${(-y*3.2).toFixed(2)}deg`);
          el.style.setProperty('--ry',`${(x*4).toFixed(2)}deg`);
          tiltRaf=0;
        });
      },{passive:true});
      el.addEventListener('pointerleave',reset,{passive:true});
    });
    d.querySelectorAll('.contact-box,.career-line').forEach(el=>{
      el.addEventListener('pointermove',e=>{
        const r=el.getBoundingClientRect();
        el.style.setProperty('--sx',`${e.clientX-r.left}px`);
        el.style.setProperty('--sy',`${e.clientY-r.top}px`);
      },{passive:true});
    });
  }

  // Story graphs: draw on reveal and update narrative copy on hover/focus/tap.
  if('IntersectionObserver' in window){
    const drawObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('is-drawn');
        drawObserver.unobserve(e.target);
      }
    }),{threshold:.3});
    d.querySelectorAll('.premium-graph').forEach(el=>drawObserver.observe(el));
  }else{
    d.querySelectorAll('.premium-graph').forEach(el=>el.classList.add('is-drawn'));
  }

  d.querySelectorAll('[data-story-graph]').forEach(block=>{
    const output=block.querySelector('[data-story-output]');
    if(!output) return;
    const defaultText=output.textContent.trim();
    const activate=el=>{
      const msg=el.dataset.note;
      if(msg) output.textContent=msg;
    };
    block.querySelectorAll('[data-note]').forEach(el=>{
      ['mouseenter','focus','click'].forEach(type=>el.addEventListener(type,()=>activate(el)));
      const circle=el.querySelector('.chart-hotspot');
      if(circle){
        ['mouseenter','focus','click'].forEach(type=>circle.addEventListener(type,()=>activate(el)));
        circle.addEventListener('keydown',event=>{
          if(event.key==='Enter'||event.key===' '){
            event.preventDefault();
            activate(el);
          }
        });
      }
    });
    block.addEventListener('mouseleave',()=>output.textContent=defaultText);
  });

  // V7 conversion journey: lightweight, privacy-respecting event hooks.
  // No third-party analytics is loaded. Events are exposed in window.__MS_CRO
  // and also pushed to dataLayer only if a future analytics integration defines it.
  const croEvents=[];
  const recordConversion=(name,detail={})=>{
    const event={name,detail,path:location.pathname,time:new Date().toISOString()};
    croEvents.push(event);
    try{sessionStorage.setItem('ms_last_conversion_event',JSON.stringify(event))}catch(e){}
    window.dispatchEvent(new CustomEvent('ms:conversion',{detail:event}));
    if(navigator.doNotTrack!=='1'){
      try{navigator.sendBeacon('/api/event',new Blob([JSON.stringify({name,path:location.pathname,href:detail.href||'',from:new URLSearchParams(location.search).get('from')||'',intent:new URLSearchParams(location.search).get('intent')||''})],{type:'application/json'}))}catch(e){}
    }
    if(Array.isArray(window.dataLayer)) window.dataLayer.push({event:'ms_conversion',conversion_name:name,...detail});
    if(new URLSearchParams(location.search).get('debug')==='1') console.info('Conversion event',event);
  };
  window.__MS_CRO={events:croEvents,record:recordConversion};

  d.querySelectorAll('[data-conversion-cta]').forEach(el=>{
    el.addEventListener('click',()=>{
      recordConversion(el.dataset.conversionCta||'cta_click',{
        href:el.getAttribute('href')||'',
        label:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,120)
      });
    },{passive:true});
  });

  // Contact-page intent highlighting from URL parameters.
  const params=new URLSearchParams(location.search);
  const intent=params.get('intent');
  if(intent){
    const card=d.querySelector(`[data-contact-intent="${CSS.escape(intent)}"]`);
    if(card){
      card.classList.add('is-selected');
      card.setAttribute('aria-label',`${card.querySelector('h3')?.textContent||intent} — selected from previous page`);
    }
  }

  // Preserve source context when moving into Contact.
  const sourceName=location.pathname==='/'?'home':location.pathname.replace(/^\/|\.html$/g,'').replace(/\//g,'-')||'home';
  d.querySelectorAll('a[href^="/contact.html"]').forEach(a=>{
    try{
      const u=new URL(a.getAttribute('href'),location.origin);
      if(!u.searchParams.has('from'))u.searchParams.set('from',sourceName);
      a.setAttribute('href',u.pathname+u.search+u.hash);
    }catch(e){}
  });

  // V8.1 Worker-connected forms.
  // The contact and Field Notes forms use the dedicated, tested Cloudflare Worker.
  const CONTACT_WORKER='https://moyosore-contact-mailer.saibumoyo.workers.dev/contact';

  const setupForm=(form,type)=>{
    if(!form)return;
    const started=form.querySelector('[name="started_at"]');
    if(started)started.value=String(Date.now());
    const status=form.querySelector('.form-status');

    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const submit=form.querySelector('[type="submit"]');
      if(!form.reportValidity())return;

      const fd=new FormData(form);
      const payload=Object.fromEntries(fd.entries());
      payload.type=type;
      payload.started_at=payload.started_at||String(Date.now()-2000);

      // Preserve the journey that led to Contact.
      const journey=new URLSearchParams(location.search);
      if(type==='contact'){
        payload.from=journey.get('from')||payload.from||'contact-page';
      }

      // The already-deployed Worker intentionally has one validation path.
      // Supply meaningful fields for Field Notes so it can use that same secure path.
      if(type==='field-notes'){
        payload.name='Field Notes Subscriber';
        payload.intent='field-notes';
        payload.from='insights';
        payload.message='Please add this email to the Moyosore Saibu Field Notes early list. The subscriber opted in from the Insights page.';
      }

      if(submit){
        submit.disabled=true;
        submit.setAttribute('aria-busy','true');
      }
      if(status)status.textContent=type==='field-notes'?'Joining…':'Sending securely…';

      try{
        const r=await fetch(CONTACT_WORKER,{
          method:'POST',
          headers:{'content-type':'application/json'},
          body:JSON.stringify(payload)
        });
        const out=await r.json().catch(()=>({}));

        if(r.ok&&out.ok){
          if(status){
            status.textContent=type==='field-notes'
              ? 'You’re on the early Field Notes list. Thank you.'
              : (out.message||'Message sent. Thank you.');
          }
          form.reset();
          if(started)started.value=String(Date.now());
          recordConversion(type==='field-notes'?'newsletter-submit':'contact-form-success',{delivery:'worker'});
          return;
        }

        throw new Error(out.error||'send_failed');
      }catch(err){
        console.error('Form delivery failed',err);
        if(status){
          status.textContent=type==='contact'
            ? 'Secure delivery could not complete. Please use the direct email link below.'
            : 'Signup could not complete. Use the email fallback below.';
        }
        recordConversion(type==='field-notes'?'newsletter-delivery-failed':'contact-form-failed',{delivery:'worker'});
      }finally{
        if(submit){
          submit.disabled=false;
          submit.removeAttribute('aria-busy');
        }
      }
    });
  };

  setupForm(d.querySelector('[data-contact-form]'),'contact');
  setupForm(d.querySelector('[data-newsletter-form]'),'field-notes');

  const intentParam=new URLSearchParams(location.search).get('intent'),
        intentSelect=d.querySelector('[data-contact-form] select[name="intent"]');
  if(intentParam&&intentSelect&&[...intentSelect.options].some(o=>o.value===intentParam)){
    intentSelect.value=intentParam;
  }

  // Tracked insight sharing: copy a LinkedIn UTM link without loading a social SDK.
  d.querySelectorAll('[data-copy-url]').forEach(btn=>btn.addEventListener('click',async()=>{const url=btn.dataset.copyUrl||location.href,status=btn.parentElement?.querySelector('.copy-status');try{await navigator.clipboard.writeText(url);if(status)status.textContent='Copied';recordConversion('article-copy-tracked-link',{href:url})}catch(e){if(status)status.textContent='Copy unavailable'}}));

  // Insights filters.
  const filterBtns=[...d.querySelectorAll('[data-filter]')],insightCards=[...d.querySelectorAll('[data-insight-card]')];
  filterBtns.forEach(btn=>btn.addEventListener('click',()=>{const f=btn.dataset.filter;filterBtns.forEach(b=>{const active=b===btn;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active))});insightCards.forEach(card=>{const show=f==='All'||card.dataset.category===f;card.hidden=!show});recordConversion('insights-filter',{filter:f})}));

  // Lightweight live performance diagnostics. Add ?debug=1 to any page to expose it in console.
  const perf={}; window.__MS_PERF=perf;
  try{
    new PerformanceObserver(list=>{const a=list.getEntries();if(a.length)perf.LCP=Math.round(a[a.length-1].startTime)}).observe({type:'largest-contentful-paint',buffered:true});
    let cls=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)cls+=e.value;perf.CLS=Number(cls.toFixed(4))}).observe({type:'layout-shift',buffered:true});
  }catch(e){}
  if(new URLSearchParams(location.search).get('debug')==='1') setInterval(()=>console.table({...perf,connection:navigator.connection?.effectiveType||'n/a',wat:wat[0]?.textContent||''}),5000);

})();
