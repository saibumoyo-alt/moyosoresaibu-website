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
        data.type='field-notes';
        data.name='Field Notes Subscriber';
        data.intent='field-notes';
        data.message='Please add this email to the Moyosore Saibu Field Notes early list. The subscriber opted in on moyosoresaibu.com.';
      }else{
        data.type='contact';
        data.from='contact-page';
      }
      data.started_at=data.started_at||String(Date.now()-2000);

      submit.disabled=true;
      submit.setAttribute('aria-busy','true');
      if(status){status.textContent=type==='field-notes'?'Joining…':'Sending your message…';status.className='form-status';}
      try{
        const response=await fetch(worker,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
        const result=await response.json().catch(()=>({}));
        if(!response.ok||!result.ok) throw new Error(result.error||'send_failed');
        if(status){
          status.textContent=type==='field-notes'?'You’re on the Field Notes list. Thank you.':'Message sent. I aim to reply within two working days when a response is needed.';
          status.className='form-status success';
        }
        form.reset(); setStarted(form);
      }catch(error){
        if(status){
          status.textContent=type==='field-notes'?'I could not complete the signup. Please use the email link below.':'I could not send the form. Please use the email link below.';
          status.className='form-status error';
        }
      }finally{
        submit.disabled=false;
        submit.removeAttribute('aria-busy');
      }
    });
  }

  setupForm(document.querySelector('[data-contact-form]'),'contact');
  document.querySelectorAll('[data-newsletter-form]').forEach(form=>setupForm(form,'field-notes'));
})();
