from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlsplit
import re, json, xml.etree.ElementTree as ET
ROOT=Path(__file__).parent
PUBLIC=['index.html','start/index.html','about.html','projects.html','contact.html','evidence.html','experience.html','insights/index.html','privacy.html']
EXPECTED_NAV=[('/', 'Home'),('/about','About'),('/experience','Experience'),('/projects','Projects'),('/insights/','Insights'),('/contact','Contact')]
CANON={
'index.html':'https://moyosoresaibu.com/',
'start/index.html':'https://moyosoresaibu.com/', # redirect fallback; noindex
'about.html':'https://moyosoresaibu.com/about',
'projects.html':'https://moyosoresaibu.com/projects',
'contact.html':'https://moyosoresaibu.com/contact',
'evidence.html':'https://moyosoresaibu.com/evidence',
'experience.html':'https://moyosoresaibu.com/experience',
'insights/index.html':'https://moyosoresaibu.com/insights/',
'privacy.html':'https://moyosoresaibu.com/privacy',
}
errors=[]
for rel in PUBLIC:
    text=(ROOT/rel).read_text(encoding='utf-8')
    soup=BeautifulSoup(text,'html.parser')
    # broken states / public QA leaks
    for bad in ['Checking…','Checking...','--:--','Public pulse','Sound off','V9.2','V9.3','V9.1']:
        if bad in soup.get_text(' ',strip=True): errors.append(f'{rel}: visible forbidden text {bad!r}')
    if soup.find(class_='sound-control') or soup.find(id='ambient-score'): errors.append(f'{rel}: sound UI/audio element remains')
    # nav
    nav=soup.find('nav',attrs={'aria-label':'Primary'})
    if not nav: errors.append(f'{rel}: no primary nav')
    else:
        got=[(a.get('href'),a.get_text(' ',strip=True)) for a in nav.find_all('a',recursive=False)]
        if got!=EXPECTED_NAV: errors.append(f'{rel}: nav mismatch {got}')
    # footer copyright
    footer=soup.find('footer')
    if not footer or '© 2026 Moyosore Saibu. All rights reserved.' not in footer.get_text(' ',strip=True): errors.append(f'{rel}: footer copyright mismatch')
    # canonical
    c=soup.find('link',rel='canonical')
    if not c or c.get('href')!=CANON[rel]: errors.append(f'{rel}: canonical {c.get("href") if c else None} != {CANON[rel]}')
    # link hygiene
    for a in soup.find_all('a',href=True):
        h=a['href']
        if h.startswith('/') and re.search(r'\.html(?:$|[?#])',h): errors.append(f'{rel}: .html internal href {h}')
        if h.startswith('/') and re.search(r'[?&](from|source)=',h): errors.append(f'{rel}: tracking query href {h}')
    # duplicate ids
    ids=[t.get('id') for t in soup.find_all(id=True)]
    dup=sorted({x for x in ids if ids.count(x)>1})
    if dup: errors.append(f'{rel}: duplicate ids {dup}')
    # JSON-LD syntax
    for s in soup.find_all('script',attrs={'type':'application/ld+json'}):
        try: json.loads(s.string or s.get_text())
        except Exception as e: errors.append(f'{rel}: bad JSON-LD {e}')

# start fallback must not be indexable
ss=BeautifulSoup((ROOT/'start/index.html').read_text(),'html.parser')
robots=ss.find('meta',attrs={'name':'robots'})
if not robots or 'noindex' not in robots.get('content',''): errors.append('start/index.html: noindex fallback missing')

# Root must not expose GitHub live pulse language or Start Here live link.
idx=(ROOT/'index.html').read_text()
for bad in ['v9-live-console','Public pulse','latest public website commit is checked live','public GitHub freshness']:
    if bad in idx: errors.append(f'index.html: stale live-pulse implementation {bad}')

# Canonical claims
claims={
'retention':'+22% customer retention improvement — publicly shared from the Enugu chapter and attributed to data-led route efficiency and remapping.',
'tenure':'1,095 days in Trade Activation across Enugu market execution (2022–2025).',
'ranking':'#1 Area, Division and Regional status — publicly shared from the Enugu chapter.',
}
for key,claim in claims.items():
    required=['index.html','experience.html','evidence.html']
    if key in ('retention','ranking'): required.append('projects.html')
    for rel in required:
        if claim not in (ROOT/rel).read_text(): errors.append(f'{rel}: canonical {key} claim missing')
# creator claim canonical wording only where used
creator='4.8M+ views on a customer-focused Instagram Reel.'
for rel in PUBLIC:
    txt=(ROOT/rel).read_text()
    if '4.8M+' in txt and creator not in txt: errors.append(f'{rel}: creator claim wording mismatch')

# redirects acceptance logic
redirects=(ROOT/'_redirects').read_text().splitlines()
required_redirects={'/start / 301','/start/ / 301','/start/index.html / 301','/index.html / 301','/about.html /about 301','/experience.html /experience 301','/projects.html /projects 301','/evidence.html /evidence 301','/contact.html /contact 301','/insights /insights/ 301','/insights/index.html /insights/ 301'}
missing=required_redirects-set(line.strip() for line in redirects if line.strip())
if missing: errors.append(f'_redirects missing {sorted(missing)}')

# sitemap parse + start absent + .html absent
try:
    tree=ET.parse(ROOT/'sitemap.xml')
    locs=[el.text for el in tree.getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    if 'https://moyosoresaibu.com/start/' in locs: errors.append('sitemap: /start/ should be absent')
    if any('.html' in x for x in locs): errors.append('sitemap: .html canonical remains')
    if len(locs)!=len(set(locs)): errors.append('sitemap: duplicate locs')
except Exception as e: errors.append(f'sitemap parse error {e}')

if errors:
    print('FAIL')
    for e in errors: print('-',e)
    raise SystemExit(1)
print('PASS')
print(f'Checked {len(PUBLIC)} audited pages + redirects + sitemap + canonical claims.')
