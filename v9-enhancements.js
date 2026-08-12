(()=>{
  const d=document;
  const repo='saibumoyo-alt/moyosoresaibu-website';
  const setText=(selector,text)=>d.querySelectorAll(selector).forEach(el=>{el.textContent=text});
  const formatRelative=(iso)=>{
    const t=new Date(iso).getTime(); if(!Number.isFinite(t)) return 'Public build current';
    const mins=Math.max(0,Math.floor((Date.now()-t)/60000));
    if(mins<2) return 'Updated just now';
    if(mins<60) return `Updated ${mins} min ago`;
    const hrs=Math.floor(mins/60); if(hrs<24) return `Updated ${hrs}h ago`;
    const days=Math.floor(hrs/24); if(days<7) return `Updated ${days}d ago`;
    return `Updated ${new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(t))}`;
  };
  const loadPublicPulse=async()=>{
    const fallback='Public build · live on GitHub';
    setText('[data-public-update]',fallback);
    try{
      const r=await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
      if(!r.ok) return;
      const j=await r.json(); const iso=j?.[0]?.commit?.committer?.date||j?.[0]?.commit?.author?.date;
      if(!iso) return;
      const relative=formatRelative(iso);
      setText('[data-public-update]',relative);
      d.querySelectorAll('[data-public-update]').forEach(el=>{el.title=`Latest public website commit: ${new Date(iso).toLocaleString()}`});
    }catch(e){}
  };
  loadPublicPulse();

  d.querySelectorAll('[data-v9-mode-group]').forEach(group=>{
    const tabs=[...group.querySelectorAll('[data-v9-mode-tab]')];
    const panels=[...group.querySelectorAll('[data-v9-mode-panel]')];
    const activate=(id,focus=false)=>{
      tabs.forEach(tab=>{
        const active=tab.dataset.v9ModeTab===id;
        tab.setAttribute('aria-selected',String(active)); tab.tabIndex=active?0:-1;
        if(active&&focus)tab.focus();
      });
      panels.forEach(panel=>panel.hidden=panel.dataset.v9ModePanel!==id);
    };
    tabs.forEach((tab,i)=>{
      tab.addEventListener('click',()=>activate(tab.dataset.v9ModeTab));
      tab.addEventListener('keydown',e=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
        e.preventDefault(); let n=i;
        if(e.key==='ArrowRight')n=(i+1)%tabs.length; if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;
        if(e.key==='Home')n=0; if(e.key==='End')n=tabs.length-1;
        activate(tabs[n].dataset.v9ModeTab,true);
      });
    });
    const initial=tabs.find(t=>t.getAttribute('aria-selected')==='true')?.dataset.v9ModeTab||tabs[0]?.dataset.v9ModeTab;
    if(initial)activate(initial);
  });

  const params=new URLSearchParams(location.search);
  const src=(params.get('utm_source')||params.get('source')||'').toLowerCase();
  const route=d.querySelector('[data-v9-route-context]');
  if(route){
    if(src.includes('instagram')||document.referrer.includes('instagram.com'))route.textContent='Instagram route · start with the 60-second page';
    else if(src.includes('linkedin')||document.referrer.includes('linkedin.com'))route.textContent='LinkedIn route · start with proof and experience';
    else route.textContent='Direct route · choose the shortest useful path';
  }
})();
