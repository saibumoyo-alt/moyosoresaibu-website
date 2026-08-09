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
    updateWat();setInterval(updateWat,30000);
  }

  // V4.2 Auto Sonic — immediate audible autoplay attempt with first-gesture fallback.
  // Modern browsers may block audible autoplay. When they do, playback starts on
  // the visitor's first pointer/touch/key interaction anywhere on the document.
  const ambient=d.getElementById('ambient-score');
  let audioCtx=null,soundOn=false,fadeRaf=0,gestureArmed=false;
  const timeKey='ms_sound_time_auto_v1';
  const TARGET_VOLUME=.14;

  const ensureAudio=()=>{
    try{
      if(!audioCtx){
        const C=window.AudioContext||window.webkitAudioContext;
        if(C)audioCtx=new C();
      }
      if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
    }catch(e){}
  };

  const restoreAudioTime=()=>{
    if(!ambient)return;
    try{
      const saved=Number(sessionStorage.getItem(timeKey)||0);
      if(Number.isFinite(saved)&&saved>0&&Number.isFinite(ambient.duration)&&saved<ambient.duration-1){
        ambient.currentTime=saved;
      }
    }catch(e){}
  };

  const fadeTo=(target,duration=750)=>{
    if(!ambient)return;
    cancelAnimationFrame(fadeRaf);
    const from=ambient.volume,start=performance.now();
    const tick=t=>{
      const p=Math.min(1,(t-start)/duration),ease=1-Math.pow(1-p,3);
      ambient.volume=Math.max(0,Math.min(1,from+(target-from)*ease));
      if(p<1)fadeRaf=requestAnimationFrame(tick);
    };
    fadeRaf=requestAnimationFrame(tick);
  };

  const blip=(kind='hover')=>{
    if(!soundOn)return;
    ensureAudio();
    if(!audioCtx||audioCtx.state!=='running')return;
    const now=audioCtx.currentTime,osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();
    filter.type='lowpass';
    filter.frequency.value=kind==='click'?1750:2250;
    osc.type=kind==='click'?'sine':'triangle';
    osc.frequency.setValueAtTime(kind==='click'?420:610,now);
    osc.frequency.exponentialRampToValueAtTime(kind==='click'?340:710,now+.052);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(kind==='click'?.008:.003,now+.008);
    gain.gain.exponentialRampToValueAtTime(.0001,now+(kind==='click'?.085:.06));
    osc.connect(filter);filter.connect(gain);gain.connect(audioCtx.destination);
    osc.start(now);osc.stop(now+.11);
  };

  const markPlaying=()=>{
    soundOn=true;
    body.classList.add('sound-on');
    ambient.muted=false;
    if(ambient.volume<.015)ambient.volume=.015;
    fadeTo(TARGET_VOLUME,1250);
  };

  const startAudio=()=>{
    if(!ambient)return Promise.reject(new Error('Ambient audio element missing'));
    ambient.preload='auto';
    ambient.muted=false;
    if(ambient.readyState>=1)restoreAudioTime();
    else ambient.addEventListener('loadedmetadata',restoreAudioTime,{once:true});
    ambient.volume=.015;
    const p=ambient.play();
    if(p&&typeof p.then==='function'){
      return p.then(()=>{markPlaying();ensureAudio();return true});
    }
    markPlaying();ensureAudio();return Promise.resolve(true);
  };

  const removeGestureFallback=()=>{
    if(!gestureArmed)return;
    gestureArmed=false;
    ['pointerdown','touchstart','keydown','click'].forEach(type=>{
      d.removeEventListener(type,gestureStart,true);
    });
  };

  const gestureStart=()=>{
    // This function runs synchronously inside a trusted user activation event.
    ensureAudio();
    startAudio().then(()=>{
      removeGestureFallback();
      setTimeout(()=>blip('click'),30);
    }).catch(()=>{});
  };

  const armGestureFallback=()=>{
    if(gestureArmed)return;
    gestureArmed=true;
    ['pointerdown','touchstart','keydown','click'].forEach(type=>{
      d.addEventListener(type,gestureStart,{capture:true,passive:true});
    });
  };

  if(ambient){
    // Attempt audible playback as soon as the document is ready.
    // Browsers that allow autoplay will start here.
    startAudio().then(removeGestureFallback).catch(err=>{
      // Expected on browsers with autoplay blocking. No error UI is shown:
      // the very first visitor gesture starts the soundtrack automatically.
      armGestureFallback();
      if(new URLSearchParams(location.search).get('debug')==='1'){
        console.info('Audible autoplay blocked; armed first-gesture fallback.',err?.name||err);
      }
    });

    ambient.addEventListener('error',()=>{
      console.error('Ambient audio media error:',ambient.error);
    });

    addEventListener('pagehide',()=>{
      if(!ambient.paused){
        try{sessionStorage.setItem(timeKey,String(ambient.currentTime||0))}catch(e){}
      }
    },{passive:true});

    // When returning to the tab, try to resume if the browser suspended media.
    d.addEventListener('visibilitychange',()=>{
      if(d.visibilityState==='visible'&&soundOn&&ambient.paused){
        ambient.play().catch(()=>armGestureFallback());
      }
    });
  }

  // Interface SFX become active automatically once audio is permitted.
  if(matchMedia('(pointer:fine)').matches){
    d.querySelectorAll('.btn,.nav-links a,.article,.card,.record,.case,.system-node,.chart-hotspot,.paper-note').forEach(el=>{
      el.addEventListener('pointerenter',()=>blip('hover'),{passive:true});
      el.addEventListener('pointerdown',()=>blip('click'),{passive:true});
    });
  }else{
    d.querySelectorAll('.btn,.nav-links a,.article,.card,.record,.case,.system-node,.chart-hotspot,.paper-note').forEach(el=>{
      el.addEventListener('pointerdown',()=>blip('click'),{passive:true});
    });
  }

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
      }
    });
    block.addEventListener('mouseleave',()=>output.textContent=defaultText);
  });

  // Lightweight live performance diagnostics. Add ?debug=1 to any page to expose it in console.
  const perf={}; window.__MS_PERF=perf;
  try{
    new PerformanceObserver(list=>{const a=list.getEntries();if(a.length)perf.LCP=Math.round(a[a.length-1].startTime)}).observe({type:'largest-contentful-paint',buffered:true});
    let cls=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)cls+=e.value;perf.CLS=Number(cls.toFixed(4))}).observe({type:'layout-shift',buffered:true});
  }catch(e){}
  if(new URLSearchParams(location.search).get('debug')==='1') setInterval(()=>console.table({...perf,connection:navigator.connection?.effectiveType||'n/a',wat:wat[0]?.textContent||''}),5000);

})();
