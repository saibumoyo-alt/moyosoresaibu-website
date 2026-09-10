"""One-time autofix for the 2026-09-10 comprehensive production audit."""
from pathlib import Path
import re

ROOT = Path(__file__).parent
changed = []


def rewrite(rel, transform):
    path = ROOT / rel
    old = path.read_text(encoding='utf-8')
    new = transform(old)
    if new != old:
        path.write_text(new, encoding='utf-8')
        changed.append(rel)


# Remove stale city-level Person schema from every public page. The site serves
# a national audience; hidden schema must not claim a location the page does
# not intentionally publish.
address_fragment = ',"address":{"@type":"PostalAddress","addressLocality":"Enugu","addressCountry":"NG"}'
for path in ROOT.rglob('*.html'):
    if 'docs' in path.parts:
        continue
    old = path.read_text(encoding='utf-8')
    new = old.replace(address_fragment, '')
    if new != old:
        path.write_text(new, encoding='utf-8')
        changed.append(path.relative_to(ROOT).as_posix())


# Contact consent must say what the visitor is agreeing to and link to the
# privacy policy.
def fix_contact(text):
    text = text.replace(
        '<label class="consent-row"><input name="consent" required type="checkbox" value="yes"/> <span>I agree.</span></label>',
        '<label class="consent-row"><input name="consent" required type="checkbox" value="yes"/> <span>I agree that this information can be used to respond to my enquiry. <a href="/privacy">Privacy policy</a>.</span></label>'
    )
    return text
rewrite('contact.html', fix_contact)


# Projects: hidden personalization recommendation must not ship as a dead #
# anchor, and tab buttons must not default to submit semantics.
def fix_projects(text):
    text = text.replace(' data-personalize-recommend hidden href="#">Recommended</a>', ' data-personalize-recommend hidden>Recommended</a>')
    text = text.replace('<button role="tab"', '<button type="button" role="tab"')
    return text
rewrite('projects.html', fix_projects)


# Cache-bust the standalone health-check controller just like the shared JS.
def fix_health_tool(text):
    return text.replace('/assets/retention-health-check.js"></script>', '/assets/retention-health-check.js?v=8.16.0"></script>')
rewrite('tools/retention-health-check.html', fix_health_tool)


# Form reliability: abort a hung Worker request and make failure copy point to
# real recovery channels rather than a positional "email link below".
def fix_site_js(text):
    old_fetch = """    try{\n      const response=await fetch(worker,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});\n      const result=await response.json().catch(()=>({}));"""
    new_fetch = """    let requestTimer=null;\n    try{\n      const controller=new AbortController();\n      requestTimer=setTimeout(()=>controller.abort(),12000);\n      const response=await fetch(worker,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data),signal:controller.signal});\n      clearTimeout(requestTimer); requestTimer=null;\n      const result=await response.json().catch(()=>({}));"""
    if old_fetch not in text:
        raise RuntimeError('site.js form fetch block not found')
    text = text.replace(old_fetch, new_fetch, 1)
    text = text.replace(
        "if(status){status.textContent=type==='field-notes'?'I could not complete the signup. Please use the email link below.':'I could not send the form. Please use the email link below.';status.className='form-status error';}",
        "if(status){status.textContent=type==='field-notes'?'I could not complete the signup. Please try again or contact me directly.':'I could not send the form. Please use WhatsApp, Telegram or Gmail above, or try again.';status.className='form-status error';}"
    )
    text = text.replace(
        "    }finally{submit.disabled=false;submit.removeAttribute('aria-busy');\n      }",
        "    }finally{if(requestTimer) clearTimeout(requestTimer); submit.disabled=false;submit.removeAttribute('aria-busy');\n      }",
        1
    )
    return text
rewrite('assets/site.js', fix_site_js)


# Privacy choices: provide an explicit dismiss action, Escape behavior and
# focus restoration. Closing does not grant analytics consent.
def fix_ux_js(text):
    text = text.replace('  let pageViewSent=false;\n', '  let pageViewSent=false;\n  let privacyReturnFocus=null;\n', 1)
    text = text.replace(
        '      .privacy-choice-panel[hidden]{display:none}\n',
        '      .privacy-choice-panel[hidden]{display:none}\n      .privacy-choice-close{position:absolute;right:13px;top:13px;width:38px;height:38px;border:0;border-radius:50%;background:rgba(22,24,18,.07);color:#161812;font:inherit;font-size:1.25rem;line-height:1;cursor:pointer}\n      .privacy-choice-close:hover,.privacy-choice-close:focus-visible{background:rgba(22,24,18,.14);outline:2px solid #16351f;outline-offset:2px}\n'
    )
    text = text.replace(
        '    panel.innerHTML=`\n      <h2 id="privacy-choice-title">Your privacy choices</h2>',
        '    panel.innerHTML=`\n      <button type="button" class="privacy-choice-close" data-privacy-close aria-label="Close privacy choices">×</button>\n      <h2 id="privacy-choice-title">Your privacy choices</h2>',
        1
    )
    text = text.replace(
        "    panel.querySelector('[data-privacy-essential]')?.addEventListener('click',()=>setChoice('essential'));\n    return panel;",
        "    panel.querySelector('[data-privacy-essential]')?.addEventListener('click',()=>setChoice('essential'));\n    panel.querySelector('[data-privacy-close]')?.addEventListener('click',()=>closeChoices(true));\n    return panel;",
        1
    )
    old_open = """  function openChoices(userInitiated=false){\n    const panel=buildPanel();\n    panel.hidden=false;\n    if(userInitiated){\n      const first=panel.querySelector('button:not([disabled])');\n      if(first) first.focus();\n    }\n  }\n\n  function setChoice(choice){"""
    new_open = """  function closeChoices(restoreFocus=false){\n    const panel=buildPanel();\n    panel.hidden=true;\n    if(restoreFocus&&privacyReturnFocus&&document.contains(privacyReturnFocus)) privacyReturnFocus.focus();\n    privacyReturnFocus=null;\n  }\n\n  function openChoices(userInitiated=false){\n    const panel=buildPanel();\n    if(userInitiated) privacyReturnFocus=document.activeElement;\n    panel.hidden=false;\n    if(userInitiated){\n      const first=panel.querySelector('[data-privacy-essential]');\n      if(first) first.focus();\n    }\n  }\n\n  function setChoice(choice){"""
    if old_open not in text:
        raise RuntimeError('ux privacy open block not found')
    text = text.replace(old_open, new_open, 1)
    text = text.replace('    const panel=buildPanel();\n    panel.hidden=true;\n    if(resolved===\'analytics\') sendPageView();', "    closeChoices(true);\n    if(resolved==='analytics') sendPageView();", 1)
    anchor = """  document.addEventListener('click',event=>{\n    const privacyButton=event.target.closest('[data-privacy-choices]');"""
    replacement = """  document.addEventListener('keydown',event=>{\n    if(event.key!=='Escape') return;\n    const panel=document.querySelector('[data-privacy-panel]');\n    if(panel&&!panel.hidden){ event.preventDefault(); closeChoices(true); }\n  });\n\n  document.addEventListener('click',event=>{\n    const privacyButton=event.target.closest('[data-privacy-choices]');"""
    if anchor not in text:
        raise RuntimeError('ux privacy click anchor not found')
    return text.replace(anchor, replacement, 1)
rewrite('assets/ux-816.js', fix_ux_js)


# Analytics endpoint: same-origin only, JSON only, bounded payload. The endpoint
# intentionally responds with no useful error detail to untrusted callers.
def fix_event_js(text):
    old = """  const origin=request.headers.get('origin');\n  if(origin&&!ALLOWED_ORIGINS.has(origin)) return new Response(null,{status:403,headers:{'cache-control':'no-store'}});\n\n  let data={};\n  try{ data=await request.json(); }catch(e){ return new Response(null,{status:204,headers:{'cache-control':'no-store'}}); }"""
    new = """  const origin=request.headers.get('origin');\n  if(!origin||!ALLOWED_ORIGINS.has(origin)) return new Response(null,{status:403,headers:{'cache-control':'no-store'}});\n\n  const contentType=(request.headers.get('content-type')||'').toLowerCase();\n  if(!contentType.startsWith('application/json')) return new Response(null,{status:415,headers:{'cache-control':'no-store'}});\n  const contentLength=Number(request.headers.get('content-length')||'0');\n  if(Number.isFinite(contentLength)&&contentLength>4096) return new Response(null,{status:413,headers:{'cache-control':'no-store'}});\n\n  let raw='';\n  try{ raw=await request.text(); }catch(e){ return new Response(null,{status:204,headers:{'cache-control':'no-store'}}); }\n  if(raw.length>4096) return new Response(null,{status:413,headers:{'cache-control':'no-store'}});\n  let data={};\n  try{ data=JSON.parse(raw); }catch(e){ return new Response(null,{status:204,headers:{'cache-control':'no-store'}}); }"""
    if old not in text:
        raise RuntimeError('event.js origin/json block not found')
    return text.replace(old, new, 1)
rewrite('functions/api/event.js', fix_event_js)


# Safe response-level hardening. These do not relax the existing CSP.
def fix_headers(text):
    text = text.replace(
        '  X-Frame-Options: DENY\n',
        '  X-Frame-Options: DENY\n  Cross-Origin-Opener-Policy: same-origin\n  X-Permitted-Cross-Domain-Policies: none\n',
        1
    )
    return text
rewrite('_headers', fix_headers)


# Preserve an outline for forced-colors/high-contrast users while retaining the
# existing custom focus ring.
def fix_css(text):
    return text.replace('padding:13px 14px;outline:none}', 'padding:13px 14px;outline:2px solid transparent;outline-offset:2px}', 1)
rewrite('assets/site.css', fix_css)


# Make the stricter audit permanent and cover the fixes added above.
def fix_audit(text):
    text = text.replace(
        "if 'email link below' in site_js:\n    contact_text = (ROOT / 'contact.html').read_text(encoding='utf-8') if (ROOT / 'contact.html').is_file() else ''\n    if 'mailto:' not in contact_text:\n        fail('functional', 'assets/site.js', 'form failure message says “email link below” but contact page has no mailto link')",
        "if 'email link below' in site_js:\n    fail('functional', 'assets/site.js', 'form failure message uses a stale positional “email link below” instruction')"
    )
    text = text.replace(
        "                        if locality.casefold() not in visible.casefold():\n                            fail('seo', rel, f'JSON-LD claims addressLocality={locality!r} but visible page does not state it')",
        "                        fail('seo', rel, f'Person JSON-LD contains city-level addressLocality={locality!r}; this site intentionally uses country-level areaServed instead')"
    )
    insertion = """\n# Privacy control must be dismissible without granting consent and restore focus.\nux_js = (ROOT / 'assets/ux-816.js').read_text(encoding='utf-8') if (ROOT / 'assets/ux-816.js').is_file() else ''\nfor token, message in (\n    ('data-privacy-close', 'privacy choices panel has no explicit close control'),\n    (\"event.key!=='Escape'\", 'privacy choices panel has no Escape-key handling'),\n    ('privacyReturnFocus', 'privacy choices panel does not restore focus after a user-initiated close'),\n):\n    if token not in ux_js:\n        fail('accessibility', 'assets/ux-816.js', message)\n\n"""
    marker = '# Analytics endpoint abuse resistance.\n'
    if insertion.strip() not in text:
        text = text.replace(marker, insertion + marker, 1)
    return text
rewrite('comprehensive_bug_audit.py', fix_audit)


# Remove the temporary one-shot automation from the final branch state.
for rel in ('audit_autofix.py', '.github/workflows/audit-autofix.yml'):
    path = ROOT / rel
    if path.exists():
        path.unlink()

print('AUTOFIX COMPLETE')
for rel in sorted(set(changed)):
    print('-', rel)
