
const btn=document.querySelector('.menu');
const links=document.querySelector('.nav-links');
if(btn&&links){btn.addEventListener('click',()=>links.classList.toggle('open'))}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
