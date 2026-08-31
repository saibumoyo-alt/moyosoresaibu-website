(()=>{
  const worker='https://moyosore-contact-mailer.saibumoyo.workers.dev/contact';

  // Shared motion gates — computed once, reused by every motion feature
  // below (and by the pre-existing reveal/spotlight checks further down).
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerFine=matchMedia('(pointer:fine)').matches;

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
        data.type='field-notes'; data.name='Field Notes Subscriber'; data.intent='field-notes';
        data.message='Please add this email to the Moyosore Saibu Field Notes early list. The subscriber opted in on moyosoresaibu.com.';
      }else{ data.type='contact'; data.from='contact-page'; }
      data.started_at=data.started_at||String(Date.now()-2000);
      submit.disabled=true; submit.setAttribute('aria-busy','true');
      if(status){status.textContent=type==='field-notes'?'Joining…':'Sending your message…';status.className='form-status';}
      try{
        const response=await fetch(worker,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
        const result=await response.json().catch(()=>({}));
        if(!response.ok||!result.ok) throw new Error(result.error||'send_failed');
        if(status){status.textContent=type==='field-notes'?'Request received. You’re on the Field Notes list.':'Message sent. I aim to reply within two working days when a response is needed.';status.className='form-status success';}
        form.reset(); setStarted(form);
      }catch(error){
        if(status){status.textContent=type==='field-notes'?'I could not complete the signup. Please use the email link below.':'I could not send the form. Please use the email link below.';status.className='form-status error';}
      }finally{submit.disabled=false;submit.removeAttribute('aria-busy');
      }
    });
  }

  setupForm(document.querySelector('[data-contact-form]'),'contact');
  document.querySelectorAll('[data-newsletter-form]').forEach(form=>setupForm(form,'field-notes'));

  document.querySelectorAll('[data-live-year]').forEach(el=>{el.textContent=String(new Date().getFullYear());});

  async function refreshLatestFromSite(){
    const cards=[...document.querySelectorAll('[data-live-site]')];
    if(!cards.length) return;
    try{
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),3500);
      const response=await fetch('/insights/',{cache:'no-store',headers:{'accept':'text/html'},signal:controller.signal});
      clearTimeout(timer);
      if(!response.ok) return;
      const html=await response.text();
      const doc=new DOMParser().parseFromString(html,'text/html');
      const first=doc.querySelector('.article-row');
      if(!first) return;
      const title=first.querySelector('h3')?.textContent?.trim();
      const date=first.querySelector('.article-meta')?.textContent?.trim();
      const href=first.getAttribute('href');
      if(!title||!href) return;
      cards.forEach(card=>{
        const titleEl=card.querySelector('[data-live-latest-title]');
        const dateEl=card.querySelector('[data-live-latest-date]');
        const linkEl=card.querySelector('[data-live-latest-link]');
        if(titleEl) titleEl.textContent=title;
        if(dateEl&&date) dateEl.textContent=date;
        if(linkEl) linkEl.setAttribute('href',href);
        card.classList.add('is-live');
      });
    }catch(error){ }
  }
  if('requestIdleCallback' in window) window.requestIdleCallback(refreshLatestFromSite,{timeout:1200}); else setTimeout(refreshLatestFromSite,450);

  async function refreshCurrentRole(){
    const targets=[...document.querySelectorAll('[data-live-role]')];
    if(!targets.length) return;
    try{
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),3500);
      const response=await fetch('/experience',{cache:'no-store',headers:{'accept':'text/html'},signal:controller.signal});
      clearTimeout(timer);
      if(!response.ok) return;
      const html=await response.text();
      const doc=new DOMParser().parseFromString(html,'text/html');
      const current=[...doc.querySelectorAll('.timeline-item')].find(item=>/present/i.test(item.querySelector('.timeline-date')?.textContent||''));
      const role=current?.querySelector('strong')?.textContent?.trim();
      if(!role) return;
      const clean=role.replace(/\s*·\s*Guinness Nigeria\s*$/i,'').replace(/\s*·\s*/g,', ');
      targets.forEach(el=>{el.textContent=clean;});
    }catch(error){ }
  }
  if('requestIdleCallback' in window) window.requestIdleCallback(refreshCurrentRole,{timeout:1500}); else setTimeout(refreshCurrentRole,650);

  const wireTabs=(container,tabSelector,panelSelector,tabKeyAttr,panelKeyAttr,onActivate)=>{
    const tabs=[...container.querySelectorAll(tabSelector)];
    const panels=[...container.querySelectorAll(panelSelector)];
    if(!tabs.length||!panels.length) return;
    container.classList.add('is-enhanced');
    const activate=key=>{
      tabs.forEach(tab=>{
        const active=tab.dataset[tabKeyAttr]===key;
        tab.setAttribute('aria-selected',String(active)); tab.tabIndex=active?0:-1;
      });
      panels.forEach(panel=>{
        const active=panel.dataset[panelKeyAttr]===key;
        const wasHidden=panel.hidden;
        panel.classList.toggle('is-active',active);
        panel.hidden=!active;
        if(active&&wasHidden&&!reducedMotion){
          panel.classList.add('is-settling');
          requestAnimationFrame(()=>requestAnimationFrame(()=>panel.classList.remove('is-settling')));
        }
      });
      if(onActivate) onActivate(tabs.findIndex(tab=>tab.dataset[tabKeyAttr]===key),key);
    };
    activate(tabs[0].dataset[tabKeyAttr]);
    tabs.forEach((tab,index)=>{
      tab.addEventListener('click',()=>activate(tab.dataset[tabKeyAttr]));
      tab.addEventListener('keydown',event=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault(); let next=index;
        if(event.key==='ArrowRight') next=(index+1)%tabs.length;
        if(event.key==='ArrowLeft') next=(index-1+tabs.length)%tabs.length;
        if(event.key==='Home') next=0;
        if(event.key==='End') next=tabs.length-1;
        tabs[next].focus(); activate(tabs[next].dataset[tabKeyAttr]);
      });
    });
  };

  document.querySelectorAll('[data-proof-explorer]').forEach(explorer=>{
    wireTabs(explorer,'[data-proof-tab]','[data-proof-panel]','proofTab','proofPanel');
    explorer.querySelectorAll('[data-career-tip]').forEach(segment=>{
      const tip=explorer.querySelector('[data-career-tooltip]');
      const show=()=>{if(tip) tip.textContent=segment.dataset.careerTip;};
      segment.addEventListener('mouseenter',show);segment.addEventListener('focus',show);segment.addEventListener('click',show);
    });
  });

  document.querySelectorAll('[data-growth-diagram]').forEach(wrap=>{
    const tablist=wrap.querySelector('[role="tablist"]');
    wireTabs(wrap,'[data-growth-tab]','[data-growth-panel]','growthTab','growthPanel',index=>{
      if(tablist && index>=0) tablist.style.setProperty('--stage-index',index);
    });
  });

  const SOLUTION_CATEGORY_IDS=['strategy','campaigns','digital','sales','execution','retention'];
  const solutionCategorySections=SOLUTION_CATEGORY_IDS.map(id=>document.getElementById(id));
  if(solutionCategorySections.every(Boolean)){
    const applySolutionHash=()=>{
      const key=location.hash.slice(1);
      const match=SOLUTION_CATEGORY_IDS.includes(key);
      solutionCategorySections.forEach(section=>{
        section.hidden=match&&section.id!==key;
      });
      if(match){
        const target=document.getElementById(key);
        if(target) requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
      }
    };
    applySolutionHash();
    addEventListener('hashchange',applySolutionHash);
  }

  if(!reducedMotion && 'IntersectionObserver' in window){
    document.documentElement.classList.add('motion-ready');
    const targets=[...document.querySelectorAll('.section-head,.premium-card,.proof-explorer,.process-flow,.process-rail,.growth-diagram,.quote-panel,.live-site-card,.recruiter-panel,.cta-panel,.timeline-item,.evidence-item,.contact-card,.continuity-card,.public-profile-card,.choice-card,.scan-card,.scan-proof-strip>div,.growth-flow>div,.method-card,.signal-card,.sales-method,.hero-content>.eyebrow,.hero-content>h1,.hero-content>.hero-copy,.hero-content>.scan-bullets,.hero-content>.actions,.page-hero .shell>.kicker,.page-hero .shell>h1,.page-hero .shell>p,.page-hero .shell>.actions')];
    targets.forEach(el=>el.setAttribute('data-motion-reveal',''));
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}
    }),{rootMargin:'0px 0px -7% 0px',threshold:.05});
    targets.forEach(el=>reveal.observe(el));
  }

  if(pointerFine && !reducedMotion){
    document.querySelectorAll('[data-glass-spotlight]').forEach(el=>{
      el.addEventListener('pointermove',event=>{
        const r=el.getBoundingClientRect();
        el.style.setProperty('--spot-x',`${event.clientX-r.left}px`);
        el.style.setProperty('--spot-y',`${event.clientY-r.top}px`);
      });
    });
  }

  if(!reducedMotion && innerWidth>=720){
    const parallaxWrap=document.querySelector('.hero-photo');
    const parallaxFrame=parallaxWrap&&parallaxWrap.querySelector('.photo-frame');
    const parallaxLabel=parallaxWrap&&parallaxWrap.querySelector('.photo-label');
    if(parallaxFrame){
      let ticking=false;
      const update=()=>{
        ticking=false;
        const r=parallaxWrap.getBoundingClientRect();
        if(r.bottom<0||r.top>innerHeight) return;
        const shift=Math.max(-1,Math.min(1,(r.top+r.height/2-innerHeight/2)/innerHeight));
        parallaxFrame.style.transform=`translate3d(0,${(shift*10).toFixed(1)}px,0)`;
        if(parallaxLabel) parallaxLabel.style.transform=`translate3d(0,${(shift*5).toFixed(1)}px,0)`;
      };
      addEventListener('scroll',()=>{ if(!ticking){ticking=true;requestAnimationFrame(update);} },{passive:true});
      update();
    }
  }

  if(pointerFine && !reducedMotion){
    document.querySelectorAll('.header-cta,.hero-premium .actions>.btn:not(.secondary),.cta-panel .actions>.btn:not(.secondary):not(.ghost-on-dark)').forEach(btn=>{
      let raf=null;
      btn.addEventListener('pointermove',event=>{
        if(raf) return;
        raf=requestAnimationFrame(()=>{
          raf=null;
          const r=btn.getBoundingClientRect();
          const x=((event.clientX-r.left)/r.width-.5)*10;
          const y=((event.clientY-r.top)/r.height-.5)*10;
          btn.style.transition='none';
          btn.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(1.015)`;
        });
      });
      btn.addEventListener('pointerleave',()=>{
        if(raf){cancelAnimationFrame(raf);raf=null;}
        btn.style.transition=`transform var(--motion-base) var(--ease-spring)`;
        btn.style.transform='translate(0,0) scale(1)';
      });
    });
  }

  if(pointerFine && !reducedMotion){
    document.querySelectorAll('.choice-card,.scan-card').forEach(card=>{
      let raf=null;
      card.addEventListener('pointermove',event=>{
        if(raf) return;
        raf=requestAnimationFrame(()=>{
          raf=null;
          const r=card.getBoundingClientRect();
          const px=(event.clientX-r.left)/r.width-.5;
          const py=(event.clientY-r.top)/r.height-.5;
          card.style.transform=`perspective(700px) translateY(-4px) rotateX(${(-py*2.4).toFixed(2)}deg) rotateY(${(px*2.4).toFixed(2)}deg)`;
        });
      });
      card.addEventListener('pointerleave',()=>{
        if(raf){cancelAnimationFrame(raf);raf=null;}
        card.style.transform='';
      });
    });
  }

  document.querySelectorAll('[data-insight-tools]').forEach(tools=>{
    const search=tools.querySelector('[data-insight-search]');
    const buttons=[...tools.querySelectorAll('[data-insight-filter]')];
    const list=tools.parentElement?.querySelector('[data-filter-list]')||tools.parentElement?.querySelector('.article-list');
    const items=list?[...list.querySelectorAll('[data-insight-item]')]:[];
    const count=tools.querySelector('[data-insight-count]');
    const empty=tools.parentElement?.querySelector('[data-insight-empty]');
    const noun=tools.dataset.insightNoun||'note';
    if(!search||!items.length) return;
    let filter='all';
    const apply=()=>{
      const q=search.value.trim().toLowerCase();
      let shown=0;
      items.forEach(item=>{
        const hay=(item.textContent+' '+(item.dataset.tags||'')).toLowerCase();
        const topic=filter==='all'||(item.dataset.tags||'').toLowerCase().includes(filter);
        const text=!q||hay.includes(q);
        const show=topic&&text;
        item.hidden=!show;
        if(show) shown++;
      });
      if(count) count.textContent=`${shown} ${shown===1?noun:noun+'s'}`;
      if(empty) empty.hidden=shown!==0;
    };
    search.addEventListener('input',apply);
    buttons.forEach(button=>button.addEventListener('click',()=>{
      filter=button.dataset.insightFilter||'all';
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      apply();
    }));

    const applyFromHash=()=>{
      const topic=location.hash.slice(1).toLowerCase();
      const match=buttons.find(b=>b.dataset.insightFilter===topic);
      filter=match?topic:'all';
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(match?b===match:b.dataset.insightFilter==='all')));
      apply();
      if(match) requestAnimationFrame(()=>tools.scrollIntoView({block:'start'}));
    };
    applyFromHash();
    addEventListener('hashchange',applyFromHash);
  });

  const navDetails=[...document.querySelectorAll('header .nav-dropdown, header details.submenu')];
  if(navDetails.length){
    navDetails.forEach(node=>{
      node.addEventListener('toggle',()=>{
        if(!node.open) return;
        navDetails.forEach(other=>{ if(other!==node) other.open=false; });
      });
      node.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{ node.open=false; }));
    });
    document.addEventListener('click',event=>{
      navDetails.forEach(node=>{
        if(node.open&&!node.contains(event.target)) node.open=false;
      });
    });
  }

  const siteChannels={
    whatsapp:'2348134256221',
    telegram:'moyosoresaibu'
  };

  function setupDirectChannels(){
    const wa=(siteChannels.whatsapp||'').replace(/\D/g,'');
    const tg=(siteChannels.telegram||'').replace(/^@/,'').trim();
    document.querySelectorAll('[data-direct-channels]').forEach(section=>{
      const waLink=section.querySelector('[data-whatsapp-link]');
      const tgLink=section.querySelector('[data-telegram-link]');
      let available=false;
      if(wa&&waLink){
        const message=encodeURIComponent('Hello Moyosore, I found you through moyosoresaibu.com. I would like to discuss a problem/opportunity.');
        waLink.href=`https://wa.me/${wa}?text=${message}`; available=true;
      }else if(waLink){waLink.hidden=true;}
      if(tg&&tgLink){const tgMessage=encodeURIComponent('Hello Moyosore, I found you through moyosoresaibu.com. I would like to discuss a problem/opportunity.');tgLink.href=`https://t.me/${encodeURIComponent(tg)}?text=${tgMessage}`;available=true;}
      else if(tgLink){tgLink.hidden=true;}
      section.hidden=!available;
    });
  }
  setupDirectChannels();

  const languageOptions=[
    ['en','English'],['yo','Yorùbá'],['fr','Français'],['pt','Português'],
    ['sw','Kiswahili'],['ha','Hausa'],['es','Español'],['de','Deutsch'],
    ['ar','العربية'],['zh-CN','中文']
  ];
  const rtlLanguages=new Set(['ar','fa','he','ur']);
  const sourceLanguage='en';
  const originalText=new WeakMap();
  let activeTranslator=null;
  const safeStorage={
    get(key){try{return localStorage.getItem(key);}catch(e){return null;}},
    set(key,value){try{localStorage.setItem(key,value);}catch(e){}},
    remove(key){try{localStorage.removeItem(key);}catch(e){}}
  };
  const VISITOR_NAME_KEY='moyo:firstName:v1';
  const getVisitorName=()=>safeStorage.get(VISITOR_NAME_KEY)||'';

  function collectTranslatableNodes(){
    const skip='script,style,noscript,code,pre,textarea,input,select,option,[data-no-translate],.language-dialog';
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const parent=node.parentElement;
      if(!parent||parent.closest(skip)||!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[]; let n;
    while((n=walker.nextNode())) nodes.push(n);
    return nodes;
  }

  function rememberOriginal(nodes){nodes.forEach(n=>{if(!originalText.has(n)) originalText.set(n,n.nodeValue);});}
  function restoreEnglish(){
    collectTranslatableNodes().forEach(n=>{const original=originalText.get(n);if(original!==undefined)n.nodeValue=original;});
    document.documentElement.lang='en-NG'; document.documentElement.dir='ltr';
    safeStorage.remove('moyo-language');
  }

  async function translateLocally(target, status){
    if(!('Translator' in self)) return false;
    let availability;
    try{availability=await Translator.availability({sourceLanguage,targetLanguage:target});}catch(e){return false;}
    if(availability==='unavailable') return false;
    try{
      status.textContent=availability==='downloadable'?'Preparing language…':'Translating…';
      activeTranslator=await Translator.create({
        sourceLanguage,targetLanguage:target,
        monitor(m){m.addEventListener('downloadprogress',e=>{if(Number.isFinite(e.loaded))status.textContent=`Preparing language… ${Math.round(e.loaded*100)}%`;});}
      });
      const nodes=collectTranslatableNodes(); rememberOriginal(nodes);
      for(const node of nodes){
        const text=originalText.get(node) ?? node.nodeValue; if(!text.trim()) continue;
        node.nodeValue=text;
        try{node.nodeValue=await activeTranslator.translate(text);}catch(e){}
      }
      document.documentElement.lang=target;
      document.documentElement.dir=rtlLanguages.has(target.split('-')[0])?'rtl':'ltr';
      safeStorage.set('moyo-language',target);
      status.textContent='Translated on this device';
      return true;
    }catch(e){return false;}
  }

  function fallbackTranslate(target){
    const url=new URL('https://translate.google.com/translate');
    url.searchParams.set('sl','auto'); url.searchParams.set('tl',target); url.searchParams.set('u',location.href);
    location.href=url.toString();
  }

  function createLanguageControl(){
    if(document.querySelector('[data-language-control]'))return;
    const wrap=document.createElement('div'); wrap.className='language-control'; wrap.dataset.languageControl=''; wrap.dataset.noTranslate='';
    wrap.innerHTML=`<button class="language-trigger" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Choose reading language"><span aria-hidden="true">文</span><span>Language</span></button>
      <div class="language-dialog" role="dialog" aria-modal="false" aria-label="Choose reading language" hidden>
        <div class="language-dialog-head"><div><strong>Read in your language</strong><span>Fast, progressive translation</span></div><button type="button" class="language-close" aria-label="Close language menu">×</button></div>
        <div class="language-list"></div>
        <p class="language-status" role="status" aria-live="polite">English original</p>
        <p class="language-note">On supported desktop Chrome, translation can run locally. Other browsers use a secure external translation fallback.</p>
      </div>`;
    document.body.appendChild(wrap);
    const trigger=wrap.querySelector('.language-trigger'); const dialog=wrap.querySelector('.language-dialog');
    const close=wrap.querySelector('.language-close'); const list=wrap.querySelector('.language-list'); const status=wrap.querySelector('.language-status');
    languageOptions.forEach(([code,label])=>{
      const b=document.createElement('button');b.type='button';b.className='language-option';b.dataset.lang=code;b.innerHTML=`<span>${label}</span><small>${code==='en'?'Original':'Translate'}</small>`;
      b.addEventListener('click',async()=>{
        if(code==='en'){restoreEnglish();status.textContent='English original';dialog.hidden=true;trigger.setAttribute('aria-expanded','false');return;}
        [...list.querySelectorAll('button')].forEach(x=>x.disabled=true);
        const ok=await translateLocally(code,status);
        [...list.querySelectorAll('button')].forEach(x=>x.disabled=false);
        if(!ok){status.textContent='Opening translation…';fallbackTranslate(code);return;}
        dialog.hidden=true;trigger.setAttribute('aria-expanded','false');
      }); list.appendChild(b);
    });
    const toggle=open=>{dialog.hidden=!open;trigger.setAttribute('aria-expanded',String(open));if(open)close.focus();else trigger.focus();};
    trigger.addEventListener('click',()=>toggle(dialog.hidden)); close.addEventListener('click',()=>toggle(false));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)toggle(false);});
    document.addEventListener('click',e=>{if(!dialog.hidden&&!wrap.contains(e.target)){dialog.hidden=true;trigger.setAttribute('aria-expanded','false');}});
    const remembered=safeStorage.get('moyo-language');
    if(remembered&&remembered!=='en') setTimeout(async()=>{const ok=await translateLocally(remembered,status);if(!ok)safeStorage.remove('moyo-language');},700);
  }
  createLanguageControl();

  (function personalization(){
    const NAME_KEY=VISITOR_NAME_KEY;
    const DISMISSED_KEY='moyo:namePromptDismissed:v1';
    const CATEGORY_KEY='moyo:lastCategory:v1';
    const CATEGORY_LABELS={strategy:'Strategy',campaigns:'Campaigns',digital:'Digital',sales:'Sales',execution:'Execution',retention:'Retention'};
    const getName=getVisitorName;
    function sanitizeName(raw){
      let name=(raw||'').normalize('NFC').replace(/[<>]/g,'').replace(/\s+/g,' ').trim();
      if(name.length>40) name=name.slice(0,40).trim();
      return name;
    }
    function render(){
      const name=getName();
      document.querySelectorAll('[data-personalize="hero"]').forEach(el=>{
        el.textContent=name?`${name}, sales or customer growth stuck?`:'Sales or customer growth stuck?';
      });
      document.querySelectorAll('[data-personalize="plan-label"]').forEach(el=>{
        el.textContent=name?`${name}’s Growth Plan`:'Your growth path';
      });
      document.querySelectorAll('[data-personalize="proof-label"]').forEach(el=>{
        el.textContent=name?`${name}, here’s the proof`:'Proof';
      });
      document.querySelectorAll('[data-personalize="contact-heading"]').forEach(el=>{
        el.textContent=name?`${name}, start with three things.`:'Start with three things.';
      });
      document.querySelectorAll('[data-personalize-trigger]').forEach(btn=>{
        btn.textContent=name?'Change name':'Personalize';
      });
      document.querySelectorAll('[data-personalize-forget]').forEach(btn=>{
        btn.hidden=!name;
      });
      updateRecommendBadge(name);
    }
    function updateRecommendBadge(name){
      const el=document.querySelector('[data-personalize-recommend]');
      if(!el) return;
      const category=safeStorage.get(CATEGORY_KEY);
      const label=category&&CATEGORY_LABELS[category];
      const target=label&&document.getElementById(category);
      if(!label||!target){ el.hidden=true; return; }
      el.textContent=name?`${name}, let’s look at ${label}.`:`Recommended next: ${label}.`;
      el.href=`#${category}`;
      el.hidden=false;
    }
    document.querySelectorAll('[data-category]').forEach(card=>{
      card.addEventListener('click',()=>{ safeStorage.set(CATEGORY_KEY,card.dataset.category); });
    });
    let dialog=null, lastFocused=null;
    function buildDialog(){
      if(dialog) return dialog;
      dialog=document.createElement('dialog');
      dialog.className='name-dialog';
      dialog.setAttribute('aria-labelledby','name-dialog-title');
      dialog.innerHTML=`<form method="dialog" class="name-dialog-form" data-name-form>
          <button type="button" class="name-dialog-close" data-name-close aria-label="Close">&times;</button>
          <p class="name-dialog-eyebrow">Welcome.</p>
          <h2 id="name-dialog-title">What’s your first name?</h2>
          <label class="sr-only" for="visitor-first-name">First name</label>
          <input id="visitor-first-name" name="firstName" type="text" maxlength="40" autocomplete="given-name" placeholder="Daniel" data-name-input>
          <div class="name-dialog-actions">
            <button type="submit" class="btn" data-name-save>Personalize my experience</button>
            <button type="button" class="text-link" data-name-skip>Continue without your name</button>
          </div>
          <p class="name-dialog-privacy">Stored only on this device. Never sent with your messages or analytics.</p>
        </form>
        <div class="name-dialog-welcome" data-name-welcome hidden role="status"></div>`;
      document.body.appendChild(dialog);
      const form=dialog.querySelector('[data-name-form]');
      const input=dialog.querySelector('[data-name-input]');
      const welcome=dialog.querySelector('[data-name-welcome]');
      const close=()=>{ if(dialog.open) dialog.close(); };
      dialog.querySelector('[data-name-close]').addEventListener('click',()=>{ safeStorage.set(DISMISSED_KEY,'1'); close(); });
      dialog.querySelector('[data-name-skip]').addEventListener('click',()=>{ safeStorage.set(DISMISSED_KEY,'1'); close(); });
      form.addEventListener('submit',event=>{
        event.preventDefault();
        const name=sanitizeName(input.value);
        safeStorage.set(DISMISSED_KEY,'1');
        if(!name){ close(); return; }
        safeStorage.set(NAME_KEY,name);
        render();
        form.hidden=true; welcome.hidden=false; welcome.textContent=`Welcome, ${name}.`;
        setTimeout(close,900);
      });
      dialog.addEventListener('close',()=>{
        form.hidden=false; welcome.hidden=true; input.value=getName();
        if(lastFocused&&document.contains(lastFocused)) lastFocused.focus();
      });
      dialog.addEventListener('cancel',()=>{ safeStorage.set(DISMISSED_KEY,'1'); });
      dialog.addEventListener('click',event=>{ if(event.target===dialog) close(); });
      return dialog;
    }
    function openDialog(){
      lastFocused=document.activeElement;
      const d=buildDialog();
      d.querySelector('[data-name-input]').value=getName();
      if(!('showModal' in d)) return;
      d.showModal();
      d.querySelector('[data-name-input]').focus();
    }
    document.addEventListener('click',event=>{
      if(event.target.closest('[data-personalize-trigger]')){ openDialog(); return; }
      if(event.target.closest('[data-personalize-forget]')){ safeStorage.remove(NAME_KEY); render(); }
    });
    document.querySelectorAll('.footer-links').forEach(list=>{
      const trigger=document.createElement('button');
      trigger.type='button'; trigger.className='footer-personalize-link'; trigger.dataset.personalizeTrigger='';
      const forget=document.createElement('button');
      forget.type='button'; forget.className='footer-personalize-link'; forget.dataset.personalizeForget=''; forget.hidden=true; forget.textContent='Forget my name';
      list.append(trigger,forget);
    });
    render();
    const path=location.pathname.replace(/\/+$/,'')||'/';
    const isHome=path==='/'||path==='/index.html';
    const is404=!!document.querySelector('[data-404]')||document.title.startsWith('Page not found');
    if(isHome && !is404 && !location.hash && !getName() && !safeStorage.get(DISMISSED_KEY)){
      const show=()=>openDialog();
      if('requestIdleCallback' in window) requestIdleCallback(show,{timeout:2500}); else setTimeout(show,1200);
    }
  })();

  async function loadLatestInsight(){
    const el=document.querySelector('[data-latest-insight]');
    if(!el) return;
    try{
      const res=await fetch('/insights/',{headers:{accept:'text/html'}});
      if(!res.ok) return;
      const doc=new DOMParser().parseFromString(await res.text(),'text/html');
      const first=doc.querySelector('.article-row');
      if(!first) return;
      const href=first.getAttribute('href');
      const title=first.querySelector('h3')?.textContent?.trim();
      if(!href||!title) return;
      const summary=first.querySelector('p')?.textContent?.trim();
      const date=first.querySelector('.article-meta')?.textContent?.trim();
      const link=el.querySelector('[data-latest-insight-link]');
      link.href=href;
      el.querySelector('[data-latest-insight-title]').textContent=title;
      if(summary) el.querySelector('[data-latest-insight-summary]').textContent=summary;
      if(date) el.querySelector('[data-latest-insight-date]').textContent=date;
      el.hidden=false;
    }catch(e){ }
  }
  if('requestIdleCallback' in window) requestIdleCallback(loadLatestInsight,{timeout:2000});
  else setTimeout(loadLatestInsight,300);

})();
