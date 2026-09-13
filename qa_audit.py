"""Pre-deploy regression check for moyosoresaibu.com.

Kept in sync with the live nav copy, footer, redirects and claim wording —
if a real copy/IA change makes a check below fail, update the check here in
the same commit rather than ignoring a red run. A qa_audit.py that's out of
sync with the site is worse than no qa_audit.py: see docs/history/ for what
happened last time this drifted (nav rebrand, shortened claim badges,
_redirects rewrite) without this script being updated alongside it.
"""
from pathlib import Path
from bs4 import BeautifulSoup
import re, json, xml.etree.ElementTree as ET

ROOT = Path(__file__).parent

# Every indexable HTML page on the site. Add new pages here when they ship.
PUBLIC = [
    'index.html', 'start/index.html', 'about.html', 'projects.html',
    'contact.html', 'evidence.html', 'experience.html', 'insights/index.html',
    'privacy.html', 'growth-system.html', 'retention-system.html',
    'case-studies/route-remapping-retention.html',
    'case-studies/bold-loud-customer-development.html',
    'case-studies/trade-activation-enugu.html',
    'case-studies/abacha-festival-activation.html',
    'insights/availability-beats-intention.html',
    'insights/follow-up-wins.html',
    'insights/route-discipline.html',
    'insights/sales-reviews-end-with-route-decision.html',
    'insights/trade-activation-must-change-behaviour.html',
    'insights/why-customers-leave.html',
    'insights/customer-retention-vs-loyalty.html',
    'tools/retention-health-check.html',
]

# Pages that carry the primary 6-item nav (case studies/insight articles do
# too). /start/ deliberately carries a minimal brand-only header instead —
# it's a distinct, fast, single-CTA scan page, not a copy of the homepage.
NAV_PAGES = [p for p in PUBLIC if p != 'start/index.html']
EXPECTED_NAV = [
    ('/', 'Home'), ('/projects', 'Solutions'), ('/about', 'Approach'),
    ('/experience', 'Proof'), ('/insights/', 'Insights'), ('/contact', 'Contact'),
]
EXPECTED_DROPDOWN_LINKS = {
    'Solutions': [
        ('/projects', 'All solutions'), ('/projects#strategy', 'Strategy'),
        ('/projects#campaigns', 'Campaigns'), ('/projects#digital', 'Digital'),
        ('/projects#sales', 'Sales'), ('/projects#execution', 'Execution'),
        ('/projects#retention', 'Retention'), ('/projects#field-work', 'Field work'),
    ],
    'Insights': [
        ('/insights/', 'All insights'), ('/insights/#sales', 'Sales'),
        ('/insights/#customers', 'Customers'), ('/insights/#execution', 'Execution'),
        ('/insights/#routes', 'Routes'),
    ],
}

CANON = {
    'index.html': 'https://moyosoresaibu.com/',
    'start/index.html': 'https://moyosoresaibu.com/start/',
    'about.html': 'https://moyosoresaibu.com/about',
    'projects.html': 'https://moyosoresaibu.com/projects',
    'contact.html': 'https://moyosoresaibu.com/contact',
    'evidence.html': 'https://moyosoresaibu.com/evidence',
    'experience.html': 'https://moyosoresaibu.com/experience',
    'insights/index.html': 'https://moyosoresaibu.com/insights/',
    'privacy.html': 'https://moyosoresaibu.com/privacy',
    'growth-system.html': 'https://moyosoresaibu.com/growth-system',
    'retention-system.html': 'https://moyosoresaibu.com/retention-system',
    'case-studies/route-remapping-retention.html': 'https://moyosoresaibu.com/case-studies/route-remapping-retention',
    'case-studies/bold-loud-customer-development.html': 'https://moyosoresaibu.com/case-studies/bold-loud-customer-development',
    'case-studies/trade-activation-enugu.html': 'https://moyosoresaibu.com/case-studies/trade-activation-enugu',
    'case-studies/abacha-festival-activation.html': 'https://moyosoresaibu.com/case-studies/abacha-festival-activation',
    'insights/availability-beats-intention.html': 'https://moyosoresaibu.com/insights/availability-beats-intention',
    'insights/follow-up-wins.html': 'https://moyosoresaibu.com/insights/follow-up-wins',
    'insights/route-discipline.html': 'https://moyosoresaibu.com/insights/route-discipline',
    'insights/sales-reviews-end-with-route-decision.html': 'https://moyosoresaibu.com/insights/sales-reviews-end-with-route-decision',
    'insights/trade-activation-must-change-behaviour.html': 'https://moyosoresaibu.com/insights/trade-activation-must-change-behaviour',
    'insights/why-customers-leave.html': 'https://moyosoresaibu.com/insights/why-customers-leave',
    'insights/customer-retention-vs-loyalty.html': 'https://moyosoresaibu.com/insights/customer-retention-vs-loyalty',
    'tools/retention-health-check.html': 'https://moyosoresaibu.com/tools/retention-health-check',
}

errors = []
soups = {}

current_version = (ROOT / 'VERSION').read_text(encoding='utf-8').strip()
asset_version_re = re.compile(r'/assets/site\.(?:css|js)\?v=([0-9][0-9A-Za-z.\-]*)')
for rel in PUBLIC:
    text = (ROOT / rel).read_text(encoding='utf-8')
    found = set(asset_version_re.findall(text))
    if not found:
        errors.append(f'{rel}: no /assets/site.css or site.js ?v= reference found')
    elif found != {current_version}:
        stale = sorted(found - {current_version})
        if stale:
            errors.append(f'{rel}: asset cache-bust version {stale} does not match VERSION ({current_version})')

for rel in PUBLIC:
    text = (ROOT / rel).read_text(encoding='utf-8')
    soup = BeautifulSoup(text, 'html.parser')
    soups[rel] = soup

    for bad in ['Checking…', 'Checking...', '--:--', 'Public pulse', 'Sound off',
                'V9.1', 'V9.2', 'V9.3', 'v9-live-console',
                'latest public website commit is checked live', 'public GitHub freshness']:
        if bad in soup.get_text(' ', strip=True):
            errors.append(f'{rel}: visible forbidden text {bad!r}')
    if soup.find(class_='sound-control') or soup.find(id='ambient-score'):
        errors.append(f'{rel}: sound UI/audio element remains')

    if rel in NAV_PAGES:
        nav = soup.find('nav', attrs={'aria-label': 'Primary'})
        if not nav:
            errors.append(f'{rel}: no primary nav')
        else:
            got = []
            for child in nav.find_all(['a', 'details'], recursive=False):
                if child.name == 'a':
                    got.append((child.get('href'), child.get_text(' ', strip=True)))
                    continue
                summary = child.find('summary', recursive=False)
                label = summary.get_text(' ', strip=True) if summary else None
                panel_links = [(a.get('href'), a.get_text(' ', strip=True)) for a in child.find_all('a')]
                expected_links = EXPECTED_DROPDOWN_LINKS.get(label)
                if expected_links is None:
                    errors.append(f'{rel}: unexpected nav dropdown {label!r}')
                elif panel_links != expected_links:
                    errors.append(f'{rel}: {label} dropdown links mismatch {panel_links}')
                got.append((expected_links[0][0] if expected_links else None, label))
            if got != EXPECTED_NAV:
                errors.append(f'{rel}: nav mismatch {got}')

    footer = soup.find('footer')
    if not footer or '© 2026 Moyosore Saibu. All rights reserved.' not in footer.get_text(' ', strip=True):
        errors.append(f'{rel}: footer copyright mismatch')

    c = soup.find('link', rel='canonical')
    if not c or c.get('href') != CANON[rel]:
        errors.append(f'{rel}: canonical {c.get("href") if c else None} != {CANON[rel]}')

    for a in soup.find_all('a', href=True):
        h = a['href']
        if h.startswith('/') and re.search(r'\.html(?:$|[?#])', h):
            errors.append(f'{rel}: .html internal href {h}')
        if h.startswith('/') and re.search(r'[?&](from|source)=', h):
            errors.append(f'{rel}: tracking query href {h}')

    ids = [t.get('id') for t in soup.find_all(id=True)]
    dup = sorted({x for x in ids if ids.count(x) > 1})
    if dup:
        errors.append(f'{rel}: duplicate ids {dup}')

    for s in soup.find_all('script', attrs={'type': 'application/ld+json'}):
        try:
            json.loads(s.string or s.get_text())
        except Exception as e:
            errors.append(f'{rel}: bad JSON-LD {e}')

    levels = [int(h.name[1]) for h in soup.select('h1, h2, h3, h4, h5, h6')]
    prev = 0
    for lvl in levels:
        if lvl > prev + 1 and prev != 0:
            errors.append(f'{rel}: heading order skips to h{lvl} after h{prev}')
        prev = lvl

ss = soups['start/index.html']
robots = ss.find('meta', attrs={'name': 'robots'})
if not robots or 'noindex' in robots.get('content', ''):
    errors.append('start/index.html: expected to be indexable (index,follow), found noindex or missing robots meta')
llms_txt = (ROOT / 'llms.txt').read_text(encoding='utf-8')
if 'not indexed' in llms_txt.lower() or 'noindex' in llms_txt.lower():
    if 'start' in llms_txt.lower():
        errors.append('llms.txt: still claims /start/ is not indexed, contradicting its live robots meta')

# Trust policy: high-visibility pages deliberately avoid publishing self-reported
# performance figures as independently verified proof. Keep retired claims and
# overconfident proof language out so later copy changes cannot reintroduce them.
TRUST_CLEAN_PAGES = [
    'index.html', 'start/index.html', 'about.html', 'projects.html',
    'evidence.html', 'experience.html',
    'case-studies/route-remapping-retention.html',
    'case-studies/bold-loud-customer-development.html',
    'case-studies/trade-activation-enugu.html',
    'case-studies/abacha-festival-activation.html',
]
FORBIDDEN_TRUST_COPY = [
    '+22%', '1,095', '#1', '4.8M+', '6,000+',
    'retention — verified', 'performance — verified', 'Verified record',
    'Trust, verified', 'Every number on this site links',
    'Every number here traces to evidence', 'Area, Division and Regional status',
    'Top Performer of the Month', 'Real proof', 'Results stay linked to evidence',
    'You can check the proof',
]
for rel in TRUST_CLEAN_PAGES:
    visible = soups[rel].get_text(' ', strip=True)
    for bad in FORBIDDEN_TRUST_COPY:
        if bad in visible:
            errors.append(f'{rel}: trust-damaging retired claim remains: {bad!r}')

TRUST_REQUIRED = {
    'index.html': 'separates public records, professional experience and opinion',
    'about.html': 'Professional context, not performance proof',
    'experience.html': 'Performance claims that are not independently verifiable are not presented here as proof',
    'evidence.html': 'does not use self-published performance metrics as independent proof',
    'projects.html': 'without presenting confidential or self-reported performance figures as verified proof',
}
for rel, sentence in TRUST_REQUIRED.items():
    if sentence not in soups[rel].get_text(' ', strip=True):
        errors.append(f'{rel}: required trust-context sentence missing: {sentence!r}')

redirects = (ROOT / '_redirects').read_text(encoding='utf-8').splitlines()
redirect_set = set(line.strip() for line in redirects if line.strip())
required_redirects = {
    '/index.html / 301', '/about.html /about 301', '/experience.html /experience 301',
    '/projects.html /projects 301', '/contact.html /contact 301', '/evidence.html /evidence 301',
    '/privacy.html /privacy 301', '/start /start/ 301', '/insights/index.html /insights/ 301',
    '/growth-system.html /growth-system 301', '/retention-system.html /retention-system 301',
    '/case-studies/route-remapping-retention.html /case-studies/route-remapping-retention 301',
    '/case-studies/bold-loud-customer-development.html /case-studies/bold-loud-customer-development 301',
    '/case-studies/trade-activation-enugu.html /case-studies/trade-activation-enugu 301',
    '/case-studies/abacha-festival-activation.html /case-studies/abacha-festival-activation 301',
    '/insights/why-customers-leave.html /insights/why-customers-leave 301',
    '/insights/customer-retention-vs-loyalty.html /insights/customer-retention-vs-loyalty 301',
    '/tools/retention-health-check.html /tools/retention-health-check 301',
}
missing = required_redirects - redirect_set
if missing:
    errors.append(f'_redirects missing {sorted(missing)}')
for line in redirect_set:
    if 'trade-activation-enugu' in line and '/projects' in line:
        errors.append(f'_redirects: trade-activation-enugu should redirect to itself, not /projects: {line!r}')
    if 'abacha-festival-activation' in line and '/projects' in line:
        errors.append(f'_redirects: abacha-festival-activation should redirect to itself, not /projects: {line!r}')

try:
    tree = ET.parse(ROOT / 'sitemap.xml')
    locs = [el.text for el in tree.getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    if any('.html' in x for x in locs):
        errors.append('sitemap: .html canonical remains')
    if len(locs) != len(set(locs)):
        errors.append('sitemap: duplicate locs')
    for rel, canon in CANON.items():
        if canon not in locs:
            errors.append(f'sitemap: missing {canon} (from {rel})')
except Exception as e:
    errors.append(f'sitemap parse error {e}')

if errors:
    print('FAIL')
    for e in errors:
        print('-', e)
    raise SystemExit(1)
print('PASS')
print(f'Checked {len(PUBLIC)} audited pages + redirects + sitemap + trust-safe claims.')