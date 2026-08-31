document.addEventListener('keydown',event=>{
  if(event.key!=='Escape') return;
  document.querySelectorAll('header .mobile-menu[open]').forEach(menu=>{
    menu.querySelectorAll('.submenu[open]').forEach(sub=>{ sub.open=false; });
    menu.open=false;
  });
});
