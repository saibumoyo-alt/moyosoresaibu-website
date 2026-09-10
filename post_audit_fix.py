"""One-time correction for timeout scoping caught during audit review."""
from pathlib import Path

root=Path(__file__).parent
site=root/'assets/site.js'
s=site.read_text(encoding='utf-8')
old="""      if(status){status.textContent=type==='field-notes'?'Joining…':'Sending your message…';status.className='form-status';}
      try{
        const controller=new AbortController();
      requestTimer=setTimeout(()=>controller.abort(),12000);
      const response=await fetch(worker,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
      clearTimeout(requestTimer); requestTimer=null;"""
new="""      if(status){status.textContent=type==='field-notes'?'Joining…':'Sending your message…';status.className='form-status';}
      let requestTimer=null;
      try{
        const controller=new AbortController();
        requestTimer=setTimeout(()=>controller.abort(),12000);
        const response=await fetch(worker,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
        clearTimeout(requestTimer); requestTimer=null;"""
if old not in s:
    raise RuntimeError('setupForm timeout block not found')
s=s.replace(old,new,1)
s=s.replace("""  async function refreshLatestFromSite(){
    const cards=[...document.querySelectorAll('[data-live-site]')];
    if(!cards.length) return;
    let requestTimer=null;
    try{""","""  async function refreshLatestFromSite(){
    const cards=[...document.querySelectorAll('[data-live-site]')];
    if(!cards.length) return;
    try{""",1)
site.write_text(s,encoding='utf-8')

audit=root/'comprehensive_bug_audit.py'
a=audit.read_text(encoding='utf-8')
marker="""if 'fetch(worker' in setup_form and 'AbortController' not in setup_form:
    fail('functional', 'assets/site.js', 'contact/newsletter network request has no timeout; submit can remain busy indefinitely')
"""
addition="""if 'fetch(worker' in setup_form and 'AbortController' not in setup_form:
    fail('functional', 'assets/site.js', 'contact/newsletter network request has no timeout; submit can remain busy indefinitely')
if 'fetch(worker' in setup_form and 'let requestTimer=null;' not in setup_form:
    fail('functional', 'assets/site.js', 'contact/newsletter timeout is not scoped to the submit handler')
"""
if marker not in a:
    raise RuntimeError('audit timeout marker missing')
a=a.replace(marker,addition,1)
audit.write_text(a,encoding='utf-8')

for rel in ('post_audit_fix.py','.github/workflows/post-audit-fix.yml'):
    p=root/rel
    if p.exists(): p.unlink()

print('POST-AUDIT CORRECTION COMPLETE')
