(()=>{
  const d=document, root=d.documentElement, body=d.body;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData=!!(navigator.connection&&navigator.connection.saveData);
  body.classList.add('motion-ready');
  requestAnimationFrame(()=>body.classList.add('is-ready'));

  // Year and active navigation
  d.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
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
  const wat=d.querySelectorAll('[data-wat-time]');
  if(wat.length){
    const watFmt=new Intl.DateTimeFormat('en-NG',{timeZone:'Africa/Lagos',hour:'2-digit',minute:'2-digit',hour12:false});
    const updateWat=()=>wat.forEach(el=>el.textContent=`WAT ${watFmt.format(new Date())}`);
    updateWat(); setInterval(updateWat,30000);
  }

  // Opt-in original ambient score + subtle synthesized interface SFX.
  // Audio never autoplays; it starts only after a deliberate click/tap.
  const soundBtn=d.querySelector('.sound-toggle'), ambient=d.getElementById('ambient-score'), toast=d.querySelector('.sound-toast');
  let audioCtx=null,soundOn=false,toastTimer=0;
  const soundKey='ms_sound_v1',timeKey='ms_sound_time_v1';
  const saySound=msg=>{if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)};
  const ensureAudio=()=>{if(!audioCtx){const C=window.AudioContext||window.webkitAudioContext;if(C)audioCtx=new C()} if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume()};
  const restoreAudioTime=()=>{if(!ambient)return;const apply=()=>{try{const saved=Number(sessionStorage.getItem(timeKey)||0);if(Number.isFinite(saved)&&saved>0&&Number.isFinite(ambient.duration)&&saved<ambient.duration-1)ambient.currentTime=saved}catch(e){}};if(ambient.readyState>=1)apply();else ambient.addEventListener('loadedmetadata',apply,{once:true})};
  const blip=(kind='hover')=>{
    if(!soundOn)return; ensureAudio(); if(!audioCtx)return;
    const now=audioCtx.currentTime,osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();
    filter.type='lowpass';filter.frequency.value=kind==='click'?2400:3200;
    osc.type=kind==='click'?'sine':'triangle';
    osc.frequency.setValueAtTime(kind==='click'?520:760,now);osc.frequency.exponentialRampToValueAtTime(kind==='click'?390:920,now+.055);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(kind==='click'?.028:.012,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+(kind==='click'?.09:.065));
    osc.connect(filter);filter.connect(gain);gain.connect(audioCtx.destination);osc.start(now);osc.stop(now+.12);
  };
  const setSound=async on=>{
    soundOn=on; if(soundBtn){soundBtn.setAttribute('aria-pressed',String(on));soundBtn.setAttribute('aria-label',on?'Disable ambient sound':'Enable ambient sound')}
    body.classList.toggle('sound-on',on);
    try{localStorage.setItem(soundKey,on?'on':'off')}catch(e){}
    if(on){ensureAudio();try{if(ambient){ambient.volume=0;restoreAudioTime();await ambient.play();let v=0;const f=setInterval(()=>{v=Math.min(.16,v+.012);ambient.volume=v;if(v>=.16)clearInterval(f)},45)}saySound('Ambient sound on · original score + subtle interface SFX')}catch(e){soundOn=false;if(soundBtn)soundBtn.setAttribute('aria-pressed','false');saySound('Tap again to enable sound')}}
    else{if(ambient&&!ambient.paused){let v=ambient.volume;const f=setInterval(()=>{v=Math.max(0,v-.02);ambient.volume=v;if(v<=0){clearInterval(f);ambient.pause()}},35)}saySound('Sound off')}
  };
  if(soundBtn)soundBtn.addEventListener('click',()=>setSound(!soundOn));
  if(ambient){addEventListener('pagehide',()=>{if(soundOn)try{sessionStorage.setItem(timeKey,String(ambient.currentTime||0))}catch(e){}},{passive:true});
    let remembered=false;try{remembered=localStorage.getItem(soundKey)==='on'}catch(e){}
    if(remembered){setTimeout(async()=>{try{ambient.volume=.12;restoreAudioTime();await ambient.play();soundOn=true;body.classList.add('sound-on');if(soundBtn){soundBtn.setAttribute('aria-pressed','true');soundBtn.setAttribute('aria-label','Disable ambient sound')}}catch(e){soundOn=false;if(soundBtn)soundBtn.setAttribute('aria-pressed','false')}},120)}
  }
  if(matchMedia('(pointer:fine)').matches){
    d.querySelectorAll('.btn,.nav-links a,.article,.card,.sound-toggle').forEach(el=>{el.addEventListener('pointerenter',()=>blip('hover'),{passive:true});el.addEventListener('pointerdown',()=>blip('click'),{passive:true})});
  }else d.querySelectorAll('.btn,.nav-links a,.article,.sound-toggle').forEach(el=>el.addEventListener('click',()=>blip('click'),{passive:true}));

  // Pointer spotlights for premium cards. CSS fallback remains static.
  if(!reduce&&matchMedia('(pointer:fine)').matches){
    d.querySelectorAll('.card,.record,.case').forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--sx',`${e.clientX-r.left}px`);el.style.setProperty('--sy',`${e.clientY-r.top}px`)}));
  }

  // Lightweight live performance diagnostics. Add ?debug=1 to any page to expose it in console.
  const perf={}; window.__MS_PERF=perf;
  try{
    new PerformanceObserver(list=>{const a=list.getEntries();if(a.length)perf.LCP=Math.round(a[a.length-1].startTime)}).observe({type:'largest-contentful-paint',buffered:true});
    let cls=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)cls+=e.value;perf.CLS=Number(cls.toFixed(4))}).observe({type:'layout-shift',buffered:true});
  }catch(e){}
  if(new URLSearchParams(location.search).get('debug')==='1') setInterval(()=>console.table({...perf,connection:navigator.connection?.effectiveType||'n/a',wat:wat[0]?.textContent||''}),5000);

})();
