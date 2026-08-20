(()=>{
  const worker='https://moyosore-contact-mailer.saibumoyo.workers.dev/contact';

  // Name gate — first-visit only. Nothing leaves the device: the name is
  // read/written to localStorage and used purely to personalize this visit.
  // Progressive enhancement: without JS no gate ever appears and every page
  // remains fully visible and crawlable, same philosophy as the rest of this file.
  (function setupNameGate(){
    const KEY='moyo_visitor_name';
    const read=()=>{try{return localStorage.getItem(KEY);}catch(e){return null;}};
    const write=v=>{try{localStorage.setItem(KEY,v);}catch(e){}};

    function personalize(name){
      document.querySelectorAll('[data-visitor-name]').forEach(el=>{el.textContent=name;});
      document.querySelectorAll('[data-visitor-greeting]').forEach(el=>{el.hidden=false;});
      document.documentElement.classList.add('has-visitor-name');
    }

    function openGate(){
      document.documentElement.classList.add('gate-open');
      const overlay=document.createElement('div');
      overlay.className='name-gate';
      overlay.setAttribute('role','dialog');
      overlay.setAttribute('aria-modal','true');
      overlay.setAttribute('aria-labelledby','name-gate-title');
      overlay.dataset.noTranslate='';
      overlay.innerHTML=
        '<div class="name-gate-card">'+
          '<p class="name-gate-eyebrow">Welcome</p>'+
          '<h1 id="name-gate-title">What should I call you?</h1>'+
          '<p class="name-gate-copy">This site turns a stuck sales, customer or growth problem into a clear next move. Tell me your first name so your visit can be personal — it stays on this device only.</p>'+
          '<form class="name-gate-form" novalidate>'+
            '<label class="sr-only" for="name-gate-input">Your first name</label>'+
            '<input id="name-gate-input" name="visitor-name" type="text" autocomplete="given-name" placeholder="e.g. Ada" minlength="2" maxlength="40" autocapitalize="words" required/>'+
            '<button type="submit" class="btn">Continue →</button>'+
          '</form>'+
          '<p class="name-gate-note">No email. No signup. Just your name.</p>'+
        '</div>';
      document.body.appendChild(overlay);
      const input=overlay.querySelector('input');
      const form=overlay.querySelector('form');
      setTimeout(()=>input.focus(),60);
      overlay.addEventListener('keydown',event=>{
        if(event.key!=='Tab') return;
        const focusable=[...overlay.querySelectorAll('input,button')];
        const first=focusable[0],last=focusable[focusable.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      });
      form.addEventListener('submit',event=>{
        event.preventDefault();
        const raw=input.value.trim().replace(/\s+/g,' ');
        if(raw.length<2){ input.setAttribute('aria-invalid','true'); input.focus(); return; }
        const clean=raw.replace(/[^\p{L}\p{M}'\- ]/gu,'').slice(0,40)||raw.slice(0,40);
        const first=(clean.split(' ')[0]||clean);
        const displayName=first.charAt(0).toUpperCase()+first.slice(1);
        write(displayName);
        document.documentElement.classList.remove('gate-open');
        overlay.classList.add('is-closing');
        personalize(displayName);
        setTimeout(()=>overlay.remove(),300);
      });
    }

    const existing=read();
    if(existing){ personalize(existing); return; }
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',openGate);
    else openGate();
  })();

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

  // Category switcher: click a category, see only that category's content.
  // Without JS every panel remains visible (progressive enhancement, same
  // rule as the rest of this file) — this only narrows to one at a time.
  const catSwitchers=[...document.querySelectorAll('[data-cat-switch]')];
  catSwitchers.forEach(wrap=>wireTabs(wrap,'[data-cat-tab]','[data-cat-panel]','catTab','catPanel'));
  const activateCatFromHash=()=>{
    const topic=location.hash.replace('#','').toLowerCase();
    if(!topic) return;
    catSwitchers.forEach(wrap=>{
      const match=[...wrap.querySelectorAll('[data-cat-tab]')].find(tab=>tab.dataset.catTab===topic);
      if(match) match.click();
    });
  };
  activateCatFromHash();
  window.addEventListener('hashchange',activateCatFromHash);

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
      document.dispatchEvent(new Event('zero-scroll:refresh'));
    }catch(e){ /* graceful: stays hidden */ }
  }
  if('requestIdleCallback' in window) requestIdleCallback(loadLatestInsight,{timeout:2000});
  else setTimeout(loadLatestInsight,300);

  // Zero-scroll panel system. CSS scroll-snap (site.css, body.zero-scroll)
  // already does the real work with no JS at all; this only layers on the
  // dot-rail, the Next affordance, active-panel tracking and arrow-key nav.
  // Rebuilding is safe to call more than once (e.g. after async content like
  // the latest-insight card unhides) — it just replaces the existing rail.
  function setupZeroScroll(){
    if(!document.body.classList.contains('zero-scroll')) return;
    const header=document.querySelector('.site-header');
    const setHeaderHeight=()=>{ if(header) document.documentElement.style.setProperty('--header-h',`${Math.round(header.getBoundingClientRect().height)}px`); };
    setHeaderHeight();
    window.addEventListener('resize',setHeaderHeight);

    const panels=[...document.querySelectorAll('main>section')].filter(s=>!s.hidden);
    document.querySelectorAll('.panel-rail,.panel-next').forEach(el=>el.remove());
    if(panels.length<2) return;
    panels.forEach((section,i)=>{ if(!section.id) section.id=`panel-${i+1}`; });

    const rail=document.createElement('nav');
    rail.className='panel-rail'; rail.setAttribute('aria-label','Page sections');
    const links=panels.map(section=>{
      const label=section.dataset.panelLabel||section.querySelector('h1,h2')?.textContent?.trim()||section.id;
      const a=document.createElement('a');
      a.href=`#${section.id}`;
      a.innerHTML=`<span class="sr-only">${label}</span><span class="panel-rail-label" aria-hidden="true">${label}</span>`;
      rail.appendChild(a);
      return a;
    });
    document.body.appendChild(rail);

    const next=document.createElement('button');
    next.type='button'; next.className='panel-next'; next.setAttribute('aria-label','Go to next section');
    next.innerHTML='Next<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    document.body.appendChild(next);

    let current=0;
    const goTo=index=>{
      index=Math.max(0,Math.min(panels.length-1,index));
      panels[index].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    };
    next.addEventListener('click',()=>goTo(current+1));
    const setActive=index=>{
      current=index;
      links.forEach((a,i)=>a.setAttribute('aria-current',String(i===index)));
      next.classList.toggle('is-hidden',index>=panels.length-1);
    };
    setActive(0);

    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting&&entry.intersectionRatio>=0.55){
            const idx=panels.indexOf(entry.target);
            if(idx>-1) setActive(idx);
          }
        });
      },{threshold:[0,.25,.5,.55,.75,1]});
      panels.forEach(p=>observer.observe(p));
    }

    document.addEventListener('keydown',event=>{
      const tag=(event.target.tagName||'').toLowerCase();
      if(['input','textarea','select'].includes(tag)||event.target.isContentEditable) return;
      if(event.key==='ArrowDown'||event.key==='PageDown'){event.preventDefault();goTo(current+1);}
      else if(event.key==='ArrowUp'||event.key==='PageUp'){event.preventDefault();goTo(current-1);}
    });
  }
  setupZeroScroll();
  document.addEventListener('zero-scroll:refresh',setupZeroScroll);

  // Live status chip — Moyosore's real local time (Africa/Lagos), read from
  // the visitor's own device clock. No fetch, no backend: an honest,
  // always-correct real-time signal rather than a manufactured "live" badge.
  function setupLiveStatusChip(){
    if(document.querySelector('[data-live-status]')) return;
    let formatter;
    try{ formatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',hour:'2-digit',minute:'2-digit',hour12:false}); }
    catch(e){ return; }
    const chip=document.createElement('div');
    chip.className='live-status-chip'; chip.dataset.liveStatus='';
    chip.dataset.noTranslate='';
    chip.innerHTML=`<i aria-hidden="true"></i><span class="live-status-full">Lagos<span class="live-status-sep">·</span></span><time></time>`;
    document.body.appendChild(chip);
    const time=chip.querySelector('time');
    const update=()=>{
      const now=formatter.format(new Date());
      time.textContent=now;
      time.setAttribute('datetime',now);
    };
    chip.setAttribute('title','Moyosore’s current local time in Lagos, Nigeria (WAT)');
    update();
    setInterval(update,15000);
  }
  setupLiveStatusChip();

  // Mobile sticky CTA — long-scroll pages only (the zero-scroll hubs already
  // keep a CTA on every screen; /privacy and /start/ opt out on purpose).
  // Pure progressive enhancement: without JS nothing changes, the header CTA
  // and every in-page button stay exactly where they already are.
  function setupMobileStickyCta(){
    if(document.body.classList.contains('zero-scroll')) return;
    if(document.body.classList.contains('start-ui')) return;
    if(location.pathname==='/privacy') return;
    const bar=document.createElement('div');
    bar.className='mobile-sticky-cta';
    bar.innerHTML='<span data-mobile-cta-label>Ready when you are.</span><a href="/contact?intent=challenge">Solve this</a>';
    document.body.appendChild(bar);
    document.body.classList.add('has-mobile-cta');
    let name=null; try{name=localStorage.getItem('moyo_visitor_name');}catch(e){}
    const label=bar.querySelector('[data-mobile-cta-label]');
    if(name&&label) label.textContent=`${name}, ready when you are.`;
    let shown=false;
    const reveal=()=>{
      if(shown||window.scrollY<=360) return;
      shown=true; bar.classList.add('is-visible');
      window.removeEventListener('scroll',reveal);
    };
    window.addEventListener('scroll',reveal,{passive:true});
    reveal();
    const footer=document.querySelector('.site-footer');
    if(footer&&'IntersectionObserver' in window){
      const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
        bar.classList.toggle('is-visible',shown&&!entry.isIntersecting);
      }),{rootMargin:'0px 0px -10% 0px'});
      io.observe(footer);
    }
  }
  setupMobileStickyCta();

  // Magnetic primary buttons — desktop pointer only, a few px of pull toward
  // the cursor on the site's highest-intent buttons. Scoped deliberately
  // (header CTA, hero actions, CTA panels) rather than every .btn, so it
  // reinforces the one primary action per screen instead of decorating all of them.
  if(matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const strength=9;
    document.querySelectorAll('.header-cta,.hero .actions .btn,.cta-panel .btn').forEach(btn=>{
      btn.classList.add('is-magnetic');
      btn.addEventListener('pointermove',event=>{
        const r=btn.getBoundingClientRect();
        btn.style.setProperty('--magnet-x',`${((event.clientX-r.left)/r.width-.5)*strength}px`);
        btn.style.setProperty('--magnet-y',`${((event.clientY-r.top)/r.height-.5)*strength}px`);
      });
      btn.addEventListener('pointerleave',()=>{
        btn.style.setProperty('--magnet-x','0px');
        btn.style.setProperty('--magnet-y','0px');
      });
    });
  }

})();
