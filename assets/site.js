(()=>{
  const form=document.querySelector('[data-contact-form]');
  if(!form) return;

  const worker='https://moyosore-contact-mailer.saibumoyo.workers.dev/contact';
  const status=form.querySelector('[data-form-status]');
  const started=form.querySelector('[name="started_at"]');
  if(started) started.value=String(Date.now());

  const intent=new URLSearchParams(location.search).get('intent');
  const select=form.querySelector('select[name="intent"]');
  if(intent&&select&&[...select.options].some(o=>o.value===intent)) select.value=intent;

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity()) return;
    const submit=form.querySelector('[type="submit"]');
    const data=Object.fromEntries(new FormData(form).entries());
    data.type='contact';
    data.from='contact-page';
    data.started_at=data.started_at||String(Date.now()-2000);

    submit.disabled=true;
    submit.setAttribute('aria-busy','true');
    if(status){status.textContent='Sending your message…';status.className='form-status';}

    try{
      const response=await fetch(worker,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||!result.ok) throw new Error(result.error||'send_failed');
      if(status){status.textContent=result.message||'Message sent. Thank you.';status.className='form-status success';}
      form.reset();
      if(started) started.value=String(Date.now());
    }catch(error){
      if(status){status.textContent='I could not send the form. Please use the email link below.';status.className='form-status error';}
    }finally{
      submit.disabled=false;
      submit.removeAttribute('aria-busy');
    }
  });
})();
