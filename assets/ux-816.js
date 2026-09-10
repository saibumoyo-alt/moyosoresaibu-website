document.addEventListener('keydown',event=>{
  if(event.key!=='Escape') return;
  document.querySelectorAll('header .mobile-menu[open]').forEach(menu=>{
    menu.querySelectorAll('.submenu[open]').forEach(sub=>{ sub.open=false; });
    menu.open=false;
  });
});

(()=>{
  const PRIVACY_KEY='moyo:privacy:v1';
  const dnt=String(navigator.doNotTrack||window.doNotTrack||navigator.msDoNotTrack||'')==='1';
  const safeStorage={
    get(key){try{return localStorage.getItem(key);}catch(e){return null;}},
    set(key,value){try{localStorage.setItem(key,value);}catch(e){}}
  };
  let pageViewSent=false;

  function preference(){
    if(dnt) return 'essential';
    const value=safeStorage.get(PRIVACY_KEY);
    return value==='analytics'?'analytics':value==='essential'?'essential':'unset';
  }

  function analyticsAllowed(){ return preference()==='analytics'; }

  function safeHref(href){
    try{
      const url=new URL(href,location.href);
      if(url.origin===location.origin) return url.pathname;
      const hosts={
        'wa.me':'whatsapp',
        't.me':'telegram',
        'www.linkedin.com':'linkedin',
        'linkedin.com':'linkedin',
        'www.instagram.com':'instagram',
        'instagram.com':'instagram',
        'www.facebook.com':'facebook',
        'facebook.com':'facebook'
      };
      return hosts[url.hostname]||`external:${url.hostname.slice(0,80)}`;
    }catch(e){ return ''; }
  }

  function sendEvent(name,href=''){
    if(!analyticsAllowed()) return;
    const allowed=new Set(['page_view','cta_click','form_submit']);
    if(!allowed.has(name)) return;
    const payload={
      name,
      path:location.pathname.slice(0,160),
      href:safeHref(href).slice(0,120),
      from:'website',
      intent:''
    };
    fetch('/api/event',{
      method:'POST',
      headers:{'content-type':'application/json'},
      credentials:'same-origin',
      keepalive:true,
      body:JSON.stringify(payload)
    }).catch(()=>{});
  }

  function sendPageView(){
    if(pageViewSent||!analyticsAllowed()) return;
    pageViewSent=true;
    sendEvent('page_view');
  }

  function addLegalFooterLinks(){
    document.querySelectorAll('.footer-links').forEach(footer=>{
      const ensure=(href,label)=>{
        if(footer.querySelector(`a[href="${href}"]`)) return;
        const link=document.createElement('a');
        link.href=href; link.textContent=label;
        footer.appendChild(link);
      };
      ensure('/terms','Terms');
      ensure('/faq','FAQ');
      if(!footer.querySelector('[data-privacy-choices]')){
        const button=document.createElement('button');
        button.type='button';
        button.className='footer-personalize-link privacy-choice-link';
        button.dataset.privacyChoices='';
        button.textContent='Privacy choices';
        footer.appendChild(button);
      }
    });
  }

  function addPrivacyStyles(){
    if(document.getElementById('privacy-choice-styles')) return;
    const style=document.createElement('style');
    style.id='privacy-choice-styles';
    style.textContent=`
      .privacy-choice-panel{position:fixed;z-index:10000;left:50%;bottom:max(18px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(720px,calc(100% - 28px));background:rgba(250,249,245,.98);color:#161812;border:1px solid rgba(22,24,18,.16);border-radius:20px;box-shadow:0 18px 60px rgba(0,0,0,.18);padding:18px 20px;font:inherit}
      .privacy-choice-panel[hidden]{display:none}
      .privacy-choice-panel h2{font-size:1.05rem;line-height:1.25;margin:0 0 7px}
      .privacy-choice-panel p{font-size:.92rem;line-height:1.55;margin:0;color:#4b4d46}
      .privacy-choice-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:15px}
      .privacy-choice-actions button,.privacy-choice-actions a{min-height:44px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:0 16px;font:inherit;font-weight:750;text-decoration:none;cursor:pointer}
      .privacy-choice-actions button{border:1px solid #16351f;background:#16351f;color:#fff}
      .privacy-choice-actions button.secondary{background:transparent;color:#16351f}
      .privacy-choice-actions a{color:#16351f;text-decoration:underline;text-underline-offset:3px}
      .privacy-choice-note{display:block;margin-top:8px;font-size:.78rem;color:#676a62}
      .privacy-choice-link{border:0;background:transparent;color:inherit;font:inherit;padding:0;cursor:pointer}
      @media(max-width:600px){.privacy-choice-panel{bottom:max(10px,env(safe-area-inset-bottom));padding:16px}.privacy-choice-actions>*{flex:1 1 145px}}
      @media(prefers-reduced-motion:reduce){.privacy-choice-panel{scroll-behavior:auto}}
    `;
    document.head.appendChild(style);
  }

  function buildPanel(){
    let panel=document.querySelector('[data-privacy-panel]');
    if(panel) return panel;
    panel=document.createElement('section');
    panel.className='privacy-choice-panel';
    panel.dataset.privacyPanel='';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','false');
    panel.setAttribute('aria-labelledby','privacy-choice-title');
    panel.setAttribute('aria-describedby','privacy-choice-description');
    panel.hidden=true;
    panel.innerHTML=`
      <h2 id="privacy-choice-title">Your privacy choices</h2>
      <p id="privacy-choice-description">This site uses essential local storage for features such as language and personalization. Optional first-party analytics measure page visits and CTA use without sending contact-message text or email addresses.</p>
      <span class="privacy-choice-note">${dnt?'Do Not Track is enabled, so optional analytics will stay off.':'You can change this choice at any time.'}</span>
      <div class="privacy-choice-actions">
        <button type="button" data-privacy-accept ${dnt?'disabled aria-disabled="true"':''}>Allow analytics</button>
        <button type="button" class="secondary" data-privacy-essential>Essential only</button>
        <a href="/privacy">Read privacy policy</a>
      </div>
    `;
    document.body.appendChild(panel);
    panel.querySelector('[data-privacy-accept]')?.addEventListener('click',()=>setChoice('analytics'));
    panel.querySelector('[data-privacy-essential]')?.addEventListener('click',()=>setChoice('essential'));
    return panel;
  }

  function openChoices(userInitiated=false){
    const panel=buildPanel();
    panel.hidden=false;
    if(userInitiated){
      const first=panel.querySelector('button:not([disabled])');
      if(first) first.focus();
    }
  }

  function setChoice(choice){
    const resolved=dnt?'essential':choice==='analytics'?'analytics':'essential';
    safeStorage.set(PRIVACY_KEY,resolved);
    const panel=buildPanel();
    panel.hidden=true;
    if(resolved==='analytics') sendPageView();
    document.dispatchEvent(new CustomEvent('moyo:privacy-change',{detail:{analytics:resolved==='analytics'}}));
  }

  addLegalFooterLinks();
  addPrivacyStyles();

  document.addEventListener('click',event=>{
    const privacyButton=event.target.closest('[data-privacy-choices]');
    if(privacyButton){ event.preventDefault(); openChoices(true); return; }

    const link=event.target.closest('a[href]');
    if(!link||!analyticsAllowed()) return;
    const href=link.getAttribute('href')||'';
    const isCTA=
      link.classList.contains('btn') ||
      link.classList.contains('header-cta') ||
      link.classList.contains('menu-contact') ||
      link.classList.contains('direct-footer-link') ||
      link.closest('.contact-micro-actions') ||
      /^(https:\/\/wa\.me\/|https:\/\/t\.me\/)/i.test(href) ||
      href.startsWith('/contact');
    if(isCTA) sendEvent('cta_click',href);
  },{capture:true});

  document.addEventListener('submit',event=>{
    const form=event.target;
    if(form instanceof HTMLFormElement && analyticsAllowed()){
      sendEvent('form_submit',form.getAttribute('action')||location.pathname);
    }
  },{capture:true});

  const current=preference();
  if(current==='unset'){
    const openWhenClear=()=>{
      if(document.querySelector('dialog[open]')){ setTimeout(openWhenClear,500); return; }
      openChoices(false);
    };
    setTimeout(openWhenClear,1400);
  }else if(current==='analytics'){
    if('requestIdleCallback' in window) requestIdleCallback(sendPageView,{timeout:1600});
    else setTimeout(sendPageView,500);
  }
})();
