"""Production quality gate for moyosoresaibu.com.

Covers legal/discovery pages, SEO/social metadata, accessibility basics,
internal-link integrity, form labelling, analytics/privacy hooks, security
headers and performance-sensitive loading conventions.
"""
from pathlib import Path
from urllib.parse import urlparse, unquote
from bs4 import BeautifulSoup
import json
import re
import xml.etree.ElementTree as ET

ROOT=Path(__file__).parent
DOMAIN='https://moyosoresaibu.com'
errors=[]
warnings=[]

def fail(message): errors.append(message)
def warn(message): warnings.append(message)

def local_file_for_path(path):
    path=unquote(path or '/').split('?',1)[0].split('#',1)[0]
    if path=='/': return ROOT/'index.html'
    if path.endswith('/'): return ROOT/path.lstrip('/')/'index.html'
    direct=ROOT/path.lstrip('/')
    if direct.exists(): return direct
    html=ROOT/(path.lstrip('/')+'.html')
    if html.exists(): return html
    index=ROOT/path.lstrip('/')/'index.html'
    if index.exists(): return index
    return None

required_files=[
    'privacy.html','terms.html','faq.html','404.html','robots.txt','sitemap.xml',
    'site.webmanifest','assets/favicon.svg','assets/apple-touch-icon.png',
    'functions/api/event.js','assets/ux-816.js','_headers','_redirects'
]
for rel in required_files:
    if not (ROOT/rel).exists(): fail(f'missing required file: {rel}')

robots=(ROOT/'robots.txt').read_text(encoding='utf-8') if (ROOT/'robots.txt').exists() else ''
if not re.search(r'(?im)^User-agent:\s*\*\s*$',robots): fail('robots.txt: missing User-agent: *')
if not re.search(r'(?im)^Allow:\s*/\s*$',robots): fail('robots.txt: missing Allow: /')
if f'Sitemap: {DOMAIN}/sitemap.xml' not in robots: fail('robots.txt: canonical sitemap declaration missing')

locs=[]
if (ROOT/'sitemap.xml').exists():
    try:
        tree=ET.parse(ROOT/'sitemap.xml')
        locs=[(el.text or '').strip() for el in tree.getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    except Exception as exc:
        fail(f'sitemap.xml: parse error: {exc}')
if len(locs)!=len(set(locs)): fail('sitemap.xml: duplicate <loc> entries')
for required_url in (f'{DOMAIN}/privacy',f'{DOMAIN}/terms',f'{DOMAIN}/faq'):
    if required_url not in locs: fail(f'sitemap.xml: missing {required_url}')

public=[]
for loc in locs:
    parsed=urlparse(loc)
    if parsed.scheme!='https' or parsed.netloc!='moyosoresaibu.com':
        fail(f'sitemap.xml: non-canonical host or scheme: {loc}')
        continue
    file=local_file_for_path(parsed.path)
    if not file:
        fail(f'sitemap.xml: URL does not resolve to source file: {loc}')
    elif file.suffix.lower()=='.html':
        public.append((loc,file))

canonicals={}
for loc,file in public:
    rel=file.relative_to(ROOT).as_posix()
    soup=BeautifulSoup(file.read_text(encoding='utf-8'),'html.parser')
    html=soup.find('html')
    if not html or not html.get('lang'): fail(f'{rel}: html lang missing')
    viewport=soup.find('meta',attrs={'name':'viewport'})
    if not viewport or 'width=device-width' not in (viewport.get('content') or ''): fail(f'{rel}: responsive viewport missing')
    title=(soup.title.string or '').strip() if soup.title else ''
    if not title: fail(f'{rel}: title missing')
    elif len(title)>80: warn(f'{rel}: title is {len(title)} characters')
    desc=soup.find('meta',attrs={'name':'description'})
    desc_text=(desc.get('content') or '').strip() if desc else ''
    if not desc_text: fail(f'{rel}: meta description missing')
    elif not 35<=len(desc_text)<=200: warn(f'{rel}: meta description length {len(desc_text)}')
    robots_meta=soup.find('meta',attrs={'name':'robots'})
    if not robots_meta: fail(f'{rel}: robots meta missing')
    elif 'noindex' in (robots_meta.get('content') or '').lower(): fail(f'{rel}: sitemap page is noindex')
    canonical=soup.find('link',rel='canonical')
    canon=(canonical.get('href') or '').strip() if canonical else ''
    if canon!=loc: fail(f'{rel}: canonical {canon!r} != sitemap URL {loc!r}')
    if canon in canonicals: fail(f'{rel}: duplicate canonical also used by {canonicals[canon]}')
    canonicals[canon]=rel
    for prop in ('og:type','og:site_name','og:title','og:description','og:url','og:image','og:image:alt'):
        if not soup.find('meta',attrs={'property':prop}): fail(f'{rel}: missing {prop}')
    for name in ('twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt'):
        if not soup.find('meta',attrs={'name':name}): fail(f'{rel}: missing {name}')
    if not soup.find('link',rel=lambda v: v and 'icon' in v): fail(f'{rel}: favicon link missing')
    if not soup.find('link',rel='manifest'): fail(f'{rel}: web manifest link missing')
    h1=soup.find_all('h1')
    if len(h1)!=1: fail(f'{rel}: expected exactly one h1, found {len(h1)}')
    if not soup.select_one('a.skip-link[href="#main"]'): fail(f'{rel}: skip link to #main missing')
    if not soup.find(id='main'): fail(f'{rel}: main landmark id="main" missing')
    ids={tag.get('id') for tag in soup.find_all(id=True)}
    for a in soup.find_all('a',href=True):
        href=(a.get('href') or '').strip()
        if not href or href.startswith(('mailto:','tel:','javascript:')): continue
        if a.get('target')=='_blank':
            rels=set(a.get('rel') or [])
            if not {'noopener','noreferrer'}<=rels: fail(f'{rel}: target=_blank link lacks noopener noreferrer: {href}')
        if href.startswith('#'):
            if href!='#' and href[1:] not in ids: fail(f'{rel}: broken same-page anchor: {href}')
            continue
        parsed=urlparse(href)
        if parsed.scheme or parsed.netloc: continue
        if href.startswith('/'):
            target=local_file_for_path(parsed.path)
            if not target: fail(f'{rel}: broken internal link: {href}')
            if '.html' in parsed.path: fail(f'{rel}: internal link exposes .html: {href}')
    for img in soup.find_all('img'):
        if not img.has_attr('alt'): fail(f'{rel}: image missing alt: {img.get("src","")}')
        if not img.get('width') or not img.get('height'): warn(f'{rel}: image lacks explicit dimensions: {img.get("src","")}')
    for control in soup.select('input:not([type="hidden"]),select,textarea'):
        if control.get('type')=='hidden': continue
        cid=control.get('id')
        labelled=bool(control.get('aria-label') or control.get('aria-labelledby'))
        if cid and soup.find('label',attrs={'for':cid}): labelled=True
        if control.find_parent('label'): labelled=True
        if not labelled: fail(f'{rel}: form control lacks accessible label: {control.name}[name={control.get("name","")}]')
    for script in soup.find_all('script',src=True):
        if not (script.has_attr('defer') or script.has_attr('async') or script.get('type')=='module'):
            fail(f'{rel}: render-blocking script without defer/async/module: {script.get("src")}')

if (ROOT/'404.html').exists():
    soup=BeautifulSoup((ROOT/'404.html').read_text(encoding='utf-8'),'html.parser')
    rob=soup.find('meta',attrs={'name':'robots'})
    if not rob or 'noindex' not in (rob.get('content') or '').lower(): fail('404.html: must be noindex')
    if not soup.body or not soup.body.has_attr('data-404'): fail('404.html: data-404 marker missing')
    if not soup.select_one('a[href="/"]'): fail('404.html: recovery link to home missing')

if (ROOT/'site.webmanifest').exists():
    try: json.loads((ROOT/'site.webmanifest').read_text(encoding='utf-8'))
    except Exception as exc: fail(f'site.webmanifest: invalid JSON: {exc}')

redirects=(ROOT/'_redirects').read_text(encoding='utf-8') if (ROOT/'_redirects').exists() else ''
for rule in ('/terms.html /terms 301','/faq.html /faq 301'):
    if rule not in redirects: fail(f'_redirects: missing {rule}')

ux=(ROOT/'assets/ux-816.js').read_text(encoding='utf-8') if (ROOT/'assets/ux-816.js').exists() else ''
for token in ('/terms','/faq','Privacy choices','/api/event','page_view','cta_click','Do Not Track'):
    if token not in ux: fail(f'assets/ux-816.js: missing production hook {token!r}')
event=(ROOT/'functions/api/event.js').read_text(encoding='utf-8') if (ROOT/'functions/api/event.js').exists() else ''
for token in ('CRO_ANALYTICS','dnt','configured','writeDataPoint'):
    if token not in event: fail(f'functions/api/event.js: missing analytics safeguard {token!r}')

headers=(ROOT/'_headers').read_text(encoding='utf-8') if (ROOT/'_headers').exists() else ''
for token in ('Content-Security-Policy:','Strict-Transport-Security:','X-Content-Type-Options:','Referrer-Policy:','Permissions-Policy:','Cache-Control: public'):
    if token not in headers: fail(f'_headers: missing {token}')

if warnings:
    print('WARNINGS')
    for item in warnings: print('-',item)
if errors:
    print('FAIL')
    for item in errors: print('-',item)
    raise SystemExit(1)

print('PASS')
print(f'Checked {len(public)} sitemap pages plus legal, discovery, accessibility, analytics, security and performance gates.')
