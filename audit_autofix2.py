"""One-time audited fixes. Deletes itself and its temporary workflow after use."""
from pathlib import Path
import re

ROOT=Path(__file__).parent
changed=[]

def write_if_changed(path, old, new):
    if new!=old:
        path.write_text(new,encoding='utf-8')
        changed.append(path.relative_to(ROOT).as_posix())

def edit(rel, fn):
    path=ROOT/rel
    old=path.read_text(encoding='utf-8')
    new=fn(old)
    write_if_changed(path,old,new)

# 1. Remove stale city-level Person address from every HTML document.
fragment=',"address":{"@type":"PostalAddress","addressLocality":"Enugu","addressCountry":"NG"}'
for path in ROOT.rglob('*.html'):
    if 'docs' in path.parts: continue
    old=path.read_text(encoding='utf-8')
    write_if_changed(path,old,old.replace(fragment,''))

# 2. Contact consent: specific purpose + privacy link.
def contact_fix(s):
    old='<label class="consent-row"><input name="consent" required type="checkbox" value="yes"/> <span>I agree.</span></label>'
    new='<label class="consent-row"><input name="consent" required type="checkbox" value="yes"/> <span>I agree that this information can be used to respond to my enquiry. <a href="/privacy">Privacy policy</a>.</span></label>'
    if old not in s: raise RuntimeError('contact consent marker missing')
    return s.replace(old,new,1)
edit('contact.html',contact_fix)

# 3. Projects: no dead placeholder href; explicit non-submit tab buttons.
def projects_fix(s):
    s,n=re.subn(r'(data-personalize-recommend\s+hidden)\s+href="#"',r'\1',s,count=1)
    if n!=1: raise RuntimeError('projects placeholder href marker missing')
    s,n=re.subn(r'<button\s+(?=role="tab")', '<button type="button" ', s)
    if n!=6: raise RuntimeError(f'expected 6 growth tab buttons, changed {n}')
    return s
edit('projects.html',projects_fix)

# 4. Cache-safe tool controller URL.
def tool_fix(s):
    old='/assets/retention-health-check.js"></script>'
    new='/assets/retention-health-check.js?v=8.16.0"></script>'
    if old not in s: raise RuntimeError('health-check script marker missing')
    return s.replace(old,new,1)
edit('tools/retention-health-check.html',tool_fix)

# 5. Form reliability: timeout + accurate recovery copy.
def site_js_fix(s):
    fetch="const response=await fetch(worker,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});"
    if fetch not in s: raise RuntimeError('contact fetch marker missing')
    replacement="const controller=new AbortController();\n      requestTimer=setTimeout(()=>controller.abort(),12000);\n      const response=await fetch(worker,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data),signal:controller.signal});\n      clearTimeout(requestTimer); requestTimer=null;"
    s=s.replace(fetch,replacement,1)
    try_marker="    try{\n      const controller=new AbortController();"
    if try_marker not in s: raise RuntimeError('contact try marker missing after fetch replacement')
    s=s.replace(try_marker,"    let requestTimer=null;\n    try{\n      const controller=new AbortController();",1)
    old="if(status){status.textContent=type==='field-notes'?'I could not complete the signup. Please use the email link below.':'I could not send the form. Please use the email link below.';status.className='form-status error';}"
    new="if(status){status.textContent=type==='field-notes'?'I could not complete the signup. Please try again or contact me directly.':'I could not send the form. Please use WhatsApp, Telegram or Gmail above, or try again.';status.className='form-status error';}"
    if old not in s: raise RuntimeError('form error-copy marker missing')
    s=s.replace(old,new,1)
    s,n=re.subn(r'}finally\{submit\.disabled=false;submit\.removeAttribute\(\'aria-busy\'\);',"}finally{if(requestTimer) clearTimeout(requestTimer); submit.disabled=false;submit.removeAttribute('aria-busy');",s,count=1)
    if n!=1: raise RuntimeError('form finally marker missing')
    return s
edit('assets/site.js',site_js_fix)

# 6. Privacy choices: explicit close, Escape, focus restoration; dismissing never grants consent.
def ux_fix(s):
    if 'privacyReturnFocus' not in s:
        s=s.replace('  let pageViewSent=false;','  let pageViewSent=false;\n  let privacyReturnFocus=null;',1)
    if '.privacy-choice-close{' not in s:
        marker='      .privacy-choice-panel[hidden]{display:none}\n'
        addition=('      .privacy-choice-panel[hidden]{display:none}\n'
                  '      .privacy-choice-close{position:absolute;right:13px;top:13px;width:38px;height:38px;border:0;border-radius:50%;background:rgba(22,24,18,.07);color:#161812;font:inherit;font-size:1.25rem;line-height:1;cursor:pointer}\n'
                  '      .privacy-choice-close:hover,.privacy-choice-close:focus-visible{background:rgba(22,24,18,.14);outline:2px solid #16351f;outline-offset:2px}\n')
        if marker not in s: raise RuntimeError('privacy CSS marker missing')
        s=s.replace(marker,addition,1)
    if 'data-privacy-close aria-label="Close privacy choices"' not in s:
        marker='    panel.innerHTML=`\n      <h2 id="privacy-choice-title">Your privacy choices</h2>'
        replacement='    panel.innerHTML=`\n      <button type="button" class="privacy-choice-close" data-privacy-close aria-label="Close privacy choices">×</button>\n      <h2 id="privacy-choice-title">Your privacy choices</h2>'
        if marker not in s: raise RuntimeError('privacy panel HTML marker missing')
        s=s.replace(marker,replacement,1)
    marker="    panel.querySelector('[data-privacy-essential]')?.addEventListener('click',()=>setChoice('essential'));\n    return panel;"
    replacement="    panel.querySelector('[data-privacy-essential]')?.addEventListener('click',()=>setChoice('essential'));\n    panel.querySelector('[data-privacy-close]')?.addEventListener('click',()=>closeChoices(true));\n    return panel;"
    if "querySelector('[data-privacy-close]')" not in s:
        if marker not in s: raise RuntimeError('privacy listener marker missing')
        s=s.replace(marker,replacement,1)
    if 'function closeChoices(' not in s:
        marker='  function openChoices(userInitiated=false){'
        close_fn=("  function closeChoices(restoreFocus=false){\n"
                  "    const panel=buildPanel();\n"
                  "    panel.hidden=true;\n"
                  "    if(restoreFocus&&privacyReturnFocus&&document.contains(privacyReturnFocus)) privacyReturnFocus.focus();\n"
                  "    privacyReturnFocus=null;\n"
                  "  }\n\n")
        if marker not in s: raise RuntimeError('privacy open function marker missing')
        s=s.replace(marker,close_fn+marker,1)
    s=s.replace('  function openChoices(userInitiated=false){\n    const panel=buildPanel();\n    panel.hidden=false;',
                '  function openChoices(userInitiated=false){\n    const panel=buildPanel();\n    if(userInitiated) privacyReturnFocus=document.activeElement;\n    panel.hidden=false;',1)
    s=s.replace("const first=panel.querySelector('button:not([disabled])');","const first=panel.querySelector('[data-privacy-essential]');",1)
    s=s.replace("    const panel=buildPanel();\n    panel.hidden=true;\n    if(resolved==='analytics') sendPageView();",
                "    closeChoices(true);\n    if(resolved==='analytics') sendPageView();",1)
    if "const panel=document.querySelector('[data-privacy-panel]');" not in s:
        marker="  document.addEventListener('click',event=>{\n    const privacyButton=event.target.closest('[data-privacy-choices]');"
        keydown=("  document.addEventListener('keydown',event=>{\n"
                 "    if(event.key!=='Escape') return;\n"
                 "    const panel=document.querySelector('[data-privacy-panel]');\n"
                 "    if(panel&&!panel.hidden){ event.preventDefault(); closeChoices(true); }\n"
                 "  });\n\n")
        if marker not in s: raise RuntimeError('privacy click listener marker missing')
        s=s.replace(marker,keydown+marker,1)
    return s
edit('assets/ux-816.js',ux_fix)

# 7. Analytics endpoint: same-origin POST only, JSON only, max 4 KiB body.
def event_fix(s):
    old="""  const origin=request.headers.get('origin');
  if(origin&&!ALLOWED_ORIGINS.has(origin)) return new Response(null,{status:403,headers:{'cache-control':'no-store'}});

  let data={};
  try{ data=await request.json(); }catch(e){ return new Response(null,{status:204,headers:{'cache-control':'no-store'}}); }"""
    new="""  const origin=request.headers.get('origin');
  if(!origin||!ALLOWED_ORIGINS.has(origin)) return new Response(null,{status:403,headers:{'cache-control':'no-store'}});

  const contentType=(request.headers.get('content-type')||'').toLowerCase();
  if(!contentType.startsWith('application/json')) return new Response(null,{status:415,headers:{'cache-control':'no-store'}});
  const contentLength=Number(request.headers.get('content-length')||'0');
  if(Number.isFinite(contentLength)&&contentLength>4096) return new Response(null,{status:413,headers:{'cache-control':'no-store'}});

  let raw='';
  try{ raw=await request.text(); }catch(e){ return new Response(null,{status:204,headers:{'cache-control':'no-store'}}); }
  if(raw.length>4096) return new Response(null,{status:413,headers:{'cache-control':'no-store'}});
  let data={};
  try{ data=JSON.parse(raw); }catch(e){ return new Response(null,{status:204,headers:{'cache-control':'no-store'}}); }"""
    if old not in s: raise RuntimeError('analytics origin/json marker missing')
    return s.replace(old,new,1)
edit('functions/api/event.js',event_fix)

# 8. Additional safe response hardening.
def headers_fix(s):
    if 'Cross-Origin-Opener-Policy:' not in s:
        s=s.replace('  X-Frame-Options: DENY\n','  X-Frame-Options: DENY\n  Cross-Origin-Opener-Policy: same-origin\n',1)
    if 'X-Permitted-Cross-Domain-Policies:' not in s:
        s=s.replace('  Cross-Origin-Opener-Policy: same-origin\n','  Cross-Origin-Opener-Policy: same-origin\n  X-Permitted-Cross-Domain-Policies: none\n',1)
    return s
edit('_headers',headers_fix)

# 9. Keep a transparent native outline for forced-colors while retaining the existing ring.
def css_fix(s):
    s,n=re.subn(r'outline\s*:\s*none', 'outline:2px solid transparent;outline-offset:2px', s, count=1, flags=re.I)
    if n!=1: raise RuntimeError(f'expected one outline:none, changed {n}')
    return s
edit('assets/site.css',css_fix)

# 10. Extend permanent audit to lock in privacy-panel behavior and stale fallback copy.
def audit_fix(s):
    old="""if 'email link below' in site_js:
    contact_text = (ROOT / 'contact.html').read_text(encoding='utf-8') if (ROOT / 'contact.html').is_file() else ''
    if 'mailto:' not in contact_text:
        fail('functional', 'assets/site.js', 'form failure message says “email link below” but contact page has no mailto link')"""
    new="""if 'email link below' in site_js:
    fail('functional', 'assets/site.js', 'form failure message uses a stale positional “email link below” instruction')"""
    if old in s: s=s.replace(old,new,1)
    marker='# Analytics endpoint abuse resistance.\n'
    privacy="""# Privacy control must be dismissible without granting consent and restore focus.
ux_js = (ROOT / 'assets/ux-816.js').read_text(encoding='utf-8') if (ROOT / 'assets/ux-816.js').is_file() else ''
for token, message in (
    ('data-privacy-close', 'privacy choices panel has no explicit close control'),
    (\"event.key!=='Escape'\", 'privacy choices panel has no Escape-key handling'),
    ('privacyReturnFocus', 'privacy choices panel does not restore focus after a user-initiated close'),
):
    if token not in ux_js:
        fail('accessibility', 'assets/ux-816.js', message)

"""
    if 'Privacy control must be dismissible' not in s:
        if marker not in s: raise RuntimeError('audit analytics marker missing')
        s=s.replace(marker,privacy+marker,1)
    # City-level Person location should not silently reappear anywhere.
    s=s.replace("if locality.casefold() not in visible.casefold():\n                            fail('seo', rel, f'JSON-LD claims addressLocality={locality!r} but visible page does not state it')",
                "fail('seo', rel, f'Person JSON-LD contains city-level addressLocality={locality!r}; use country-level areaServed instead')")
    return s
edit('comprehensive_bug_audit.py',audit_fix)

# Delete temporary automation artifacts from the commit itself.
for rel in ('audit_autofix.py','audit_autofix2.py','.github/workflows/audit-autofix.yml'):
    p=ROOT/rel
    if p.exists(): p.unlink()

print('AUTOFIX COMPLETE')
for rel in sorted(set(changed)):
    print('-',rel)
