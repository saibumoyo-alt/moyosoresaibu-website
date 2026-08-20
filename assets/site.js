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
      }finally{submit.disabled=false;submit.removeAttribute('aria-busy');}
    });
  }

  setupForm(document.querySelector('[data-contact-form]'),'contact');
  document.querySelectorAll('[data-newsletter-form]').forEach(form=>setupForm(form,'field-notes'));

  // Current year is safe local data and never creates a placeholder state.
  document.querySelectorAll('[data-live-year]').forEach(el=>{el.textContent=String(new Date().getFullYear());});

  // Progressive live site data. Static fallback is already real and readable.
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
    }catch(error){ /* fallback stays visible; no error UI needed */ }
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
    }catch(error){ /* static role fallback stays visible */ }
  }

  if('requestIdleCallback' in window) window.requestIdleCallback(refreshCurrentRole,{timeout:1500}); else setTimeout(refreshCurrentRole,650);

  // Shared ARIA-tabs helper: click activation, roving tabindex, Arrow/Home/End keys.
  // Without JS every panel remains visible — this only runs once JS executes.
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
      panels.forEach(panel=>{const active=panel.dataset[panelKeyAttr]===key;panel.classList.toggle('is-active',active);panel.hidden=!active;});
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

  // Interactive proof explorer. Without JS every proof panel remains visible.
  document.querySelectorAll('[data-proof-explorer]').forEach(explorer=>{
    wireTabs(explorer,'[data-proof-tab]','[data-proof-panel]','proofTab','proofPanel');
    explorer.querySelectorAll('[data-career-tip]').forEach(segment=>{
      const tip=explorer.querySelector('[data-career-tooltip]');
      const show=()=>{if(tip) tip.textContent=segment.dataset.careerTip;};
      segment.addEventListener('mouseenter',show);segment.addEventListener('focus',show);segment.addEventListener('click',show);
    });
  });

  // Interactive growth-system diagram. Without JS every stage panel remains visible.
  document.querySelectorAll('[data-growth-diagram]').forEach(wrap=>{
    const tablist=wrap.querySelector('[role="tablist"]');
    wireTabs(wrap,'[data-growth-tab]','[data-growth-panel]','growthTab','growthPanel',index=>{
      if(tablist && index>=0) tablist.style.setProperty('--stage-index',index);
    });
  });

  // Calm reveal motion. No content is hidden without JS or when motion is reduced.
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
    document.documentElement.classList.add('motion-ready');
    const targets=[...document.querySelectorAll('.section-head,.premium-card,.proof-explorer,.process-flow,.process-rail,.growth-diagram,.quote-panel,.live-site-card,.recruiter-panel,.cta-panel,.page-hero .shell,.timeline-item,.evidence-item,.contact-card,.continuity-card,.public-profile-card,.choice-card,.scan-card,.scan-proof-strip>div,.growth-flow>div,.method-card,.signal-card,.sales-method')];
    targets.forEach(el=>el.setAttribute('data-motion-reveal',''));
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}
    }),{rootMargin:'0px 0px -7% 0px',threshold:.05});
    targets.forEach(el=>reveal.observe(el));
  }

  // Desktop-only glass spotlight. It is visual polish, not a dependency.
  if(matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('[data-glass-spotlight]').forEach(el=>{
      el.addEventListener('pointermove',event=>{
        const r=el.getBoundingClientRect();
        el.style.setProperty('--spot-x',`${event.clientX-r.left}px`);
        el.style.setProperty('--spot-y',`${event.clientY-r.top}px`);
      });
    });
  }


  // Local Insights search and topic filters. All notes remain visible without JavaScript.
  document.querySelectorAll('[data-insight-tools]').forEach(tools=>{
    const search=tools.querySelector('[data-insight-search]');
    const buttons=[...tools.querySelectorAll('[data-insight-filter]')];
    const list=tools.parentElement?.querySelector('.article-list');
    const items=list?[...list.querySelectorAll('[data-insight-item]')]:[];
    const count=tools.querySelector('[data-insight-count]');
    const empty=tools.parentElement?.querySelector('[data-insight-empty]');
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
      if(count) count.textContent=`${shown} ${shown===1?'note':'notes'}`;
      if(empty) empty.hidden=shown!==0;
    };
    search.addEventListener('input',apply);
    buttons.forEach(button=>button.addEventListener('click',()=>{
      filter=button.dataset.insightFilter||'all';
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      apply();
    }));

    // Deep link from the header's Insights category dropdown, e.g. /insights/#sales.
    const topic=location.hash.replace('#','').toLowerCase();
    const match=buttons.find(b=>b.dataset.insightFilter===topic);
    if(match){
      filter=topic;
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===match)));
    }
    apply();
  });

  // Header category dropdowns (Solutions / Insights): only one open at a
  // time, and close on an outside click or after a link is chosen.
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

  // MOYO_TRANSLATOR_V1 — progressive multilingual reading.
  // Chrome Translator API is used locally when available. A URL-based fallback
  // keeps mobile and unsupported browsers functional without blocking first paint.
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
      // Translate sequentially to avoid bursty model calls and preserve DOM stability.
      for(const node of nodes){
        const text=originalText.get(node) ?? node.nodeValue; if(!text.trim()) continue;
        // Always translate from the saved English source so switching languages stays accurate.
        node.nodeValue=text;
        try{node.nodeValue=await activeTranslator.translate(text);}catch(e){/* keep original node */}
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

  // ---------------------------------------------------------------------
  // v8.6 — Privacy-safe visitor personalization. First name only, stored
  // on this device only (via the safeStorage helper above), never sent to
  // the contact form, the Worker, or any analytics. All personalized text
  // is written with textContent, never innerHTML, so a stored value can
  // only ever render as inert text, whatever characters it contains.
  // ---------------------------------------------------------------------
  (function personalization(){
    const NAME_KEY='moyo:firstName:v1';
    const DISMISSED_KEY='moyo:namePromptDismissed:v1';
    const CATEGORY_KEY='moyo:lastCategory:v1';
    const CATEGORY_LABELS={strategy:'Strategy',campaigns:'Campaigns',digital:'Digital',sales:'Sales',execution:'Execution',retention:'Retention'};

    const getName=()=>safeStorage.get(NAME_KEY)||'';

    // Trim, collapse whitespace, cap length, strip angle brackets as
    // defense-in-depth (textContent already makes HTML injection
    // impossible either way). International names, apostrophes and
    // hyphens all pass through untouched.
    function sanitizeName(raw){
      let name=(raw||'').normalize('NFC').replace(/[<>]/g,'').replace(/\s+/g,' ').trim();
      if(name.length>40) name=name.slice(0,40).trim();
      return name;
    }

    function render(){
      const name=getName();
      document.querySelectorAll('[data-personalize="hero"]').forEach(el=>{
        el.textContent=name?`${name}, growth stuck?`:'Growth stuck?';
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

    // Contextual recommendation: only shown when a real prior choice
    // exists (a homepage problem route was actually clicked) and the
    // matching section is actually present on this page — never invented.
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

    // Homepage problem routes: remember only the category key. No profile,
    // no remote tracking — one string, on this device, used to open the
    // right door on the very next page.
    document.querySelectorAll('[data-category]').forEach(card=>{
      card.addEventListener('click',()=>{ safeStorage.set(CATEGORY_KEY,card.dataset.category); });
    });

    // --- Dialog -----------------------------------------------------------
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
        // Brief in-dialog confirmation, then close and return focus — not a
        // toast, and it never repeats.
        form.hidden=true; welcome.hidden=false; welcome.textContent=`Welcome, ${name}.`;
        setTimeout(close,900);
      });
      dialog.addEventListener('close',()=>{
        form.hidden=false; welcome.hidden=true; input.value=getName();
        if(lastFocused&&document.contains(lastFocused)) lastFocused.focus();
      });
      dialog.addEventListener('cancel',()=>{ safeStorage.set(DISMISSED_KEY,'1'); }); // Escape key
      dialog.addEventListener('click',event=>{ if(event.target===dialog) close(); }); // backdrop click
      return dialog;
    }

    function openDialog(){
      lastFocused=document.activeElement;
      const d=buildDialog();
      d.querySelector('[data-name-input]').value=getName();
      if(!('showModal' in d)) return; // very old browser: control stays inert, never blocks the site
      d.showModal();
      d.querySelector('[data-name-input]').focus();
    }

    document.addEventListener('click',event=>{
      if(event.target.closest('[data-personalize-trigger]')){ openDialog(); return; }
      if(event.target.closest('[data-personalize-forget]')){ safeStorage.remove(NAME_KEY); render(); }
    });

    // Progressive footer control — "Personalize" / "Change name" plus
    // "Forget my name" (shown only once a name is stored). Absent
    // entirely with JS off; identical on every page.
    document.querySelectorAll('.footer-links').forEach(list=>{
      const trigger=document.createElement('button');
      trigger.type='button'; trigger.className='footer-personalize-link'; trigger.dataset.personalizeTrigger='';
      const forget=document.createElement('button');
      forget.type='button'; forget.className='footer-personalize-link'; forget.dataset.personalizeForget=''; forget.hidden=true; forget.textContent='Forget my name';
      list.append(trigger,forget);
    });

    render();

    // First-visit prompt: optional, skippable, shown at most once. A short
    // idle delay keeps it off the critical first paint — this is a compact
    // dialog the visitor can dismiss instantly, never a blocking gate.
    if(!getName() && !safeStorage.get(DISMISSED_KEY)){
      const show=()=>openDialog();
      if('requestIdleCallback' in window) requestIdleCallback(show,{timeout:2500}); else setTimeout(show,1200);
    }
  })();

  // Latest Insight: the site's own /insights/ index is the only source of
  // truth (no separate JSON to fall out of sync). One same-origin fetch,
  // no polling, no external API. Stays hidden — never a loading state —
  // until real content is ready; on any failure it just stays hidden.
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
    }catch(e){ /* graceful: stays hidden */ }
  }
  if('requestIdleCallback' in window) requestIdleCallback(loadLatestInsight,{timeout:2000});
  else setTimeout(loadLatestInsight,300);

})();
