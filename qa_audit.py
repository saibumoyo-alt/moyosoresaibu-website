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
]

# Pages that carry the primary 6-item nav (case studies/insight articles do
# too). /start/ deliberately carries a minimal brand-only header instead —
# it's a distinct, fast, single-CTA scan page, not a copy of the homepage.
NAV_PAGES = [p for p in PUBLIC if p != 'start/index.html']
EXPECTED_NAV = [
    ('/', 'Home'), ('/projects', 'Solutions'), ('/about', 'Approach'),
    ('/experience', 'Proof'), ('/insights/', 'Insights'), ('/contact', 'Contact'),
]
# Solutions and Insights are category dropdowns (<details class="nav-dropdown">)
# rather than plain links; each panel's first link is the "All X" catch-all
# that stands in for the top-level href checked above, and the remaining
# links are the categories a click should jump straight to.
EXPECTED_DROPDOWN_LINKS = {
    'Solutions': [
        ('/projects', 'All solutions'), ('/projects#strategy', 'Strategy'),
        ('/projects#campaigns', 'Campaigns'), ('/projects#digital', 'Digital'),
        ('/projects#sales', 'Sales'), ('/projects#execution', 'Execution'),
        ('/projects#retention', 'Retention'),
    ],
    'Insights': [
        ('/insights/', 'All insights'), ('/insights/#sales', 'Sales'),
        ('/insights/#customers', 'Customers'), ('/insights/#execution', 'Execution'),
        ('/insights/#routes', 'Routes'),
    ],
    'Contact': [
        ('/contact', 'All contact options'), ('/contact?intent=challenge', 'Solve this'),
        ('/contact?intent=general', 'Ask a question'),
        ('https://wa.me/2348134256221?text=Hello%20Moyosore.%20I%20have%20a%20growth%20problem%20to%20solve.', 'WhatsApp'),
        ('mailto:saibumoyo@gmail.com', 'Email'),
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
}

errors = []
soups = {}

# Cache-busting: /assets/* is served with a 7-day Cache-Control (_headers),
# so every page's site.css/site.js query string MUST match VERSION exactly.
# A page still requesting the old ?v= after a real asset change means
# returning visitors can get stale CSS/JS for up to 7 days — this bit a
# real release once (see the PR review that added this check), so it's
# checked on every page in PUBLIC, not just spot-checked.
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

    # broken states / leftover feature leaks that must never resurface
    for bad in ['Checking…', 'Checking...', '--:--', 'Public pulse', 'Sound off',
                'V9.1', 'V9.2', 'V9.3', 'v9-live-console',
                'latest public website commit is checked live', 'public GitHub freshness']:
        if bad in soup.get_text(' ', strip=True):
            errors.append(f'{rel}: visible forbidden text {bad!r}')
    if soup.find(class_='sound-control') or soup.find(id='ambient-score'):
        errors.append(f'{rel}: sound UI/audio element remains')

    # nav — only enforced on pages that carry the primary nav
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
                panel_links = [(a.get('href'), a.get_text(' ', strip=True))
                                for a in child.find_all('a')]
                expected_links = EXPECTED_DROPDOWN_LINKS.get(label)
                if expected_links is None:
                    errors.append(f'{rel}: unexpected nav dropdown {label!r}')
                elif panel_links != expected_links:
                    errors.append(f'{rel}: {label} dropdown links mismatch {panel_links}')
                # the dropdown's catch-all link stands in for the plain href
                # EXPECTED_NAV would otherwise check for this label.
                got.append((expected_links[0][0] if expected_links else None, label))
            if got != EXPECTED_NAV:
                errors.append(f'{rel}: nav mismatch {got}')

    # footer copyright
    footer = soup.find('footer')
    if not footer or '© 2026 Moyosore Saibu. All rights reserved.' not in footer.get_text(' ', strip=True):
        errors.append(f'{rel}: footer copyright mismatch')

    # canonical
    c = soup.find('link', rel='canonical')
    if not c or c.get('href') != CANON[rel]:
        errors.append(f'{rel}: canonical {c.get("href") if c else None} != {CANON[rel]}')

    # link hygiene: no internal .html hrefs, no from=/source= tracking params
    for a in soup.find_all('a', href=True):
        h = a['href']
        if h.startswith('/') and re.search(r'\.html(?:$|[?#])', h):
            errors.append(f'{rel}: .html internal href {h}')
        if h.startswith('/') and re.search(r'[?&](from|source)=', h):
            errors.append(f'{rel}: tracking query href {h}')

    # duplicate ids
    ids = [t.get('id') for t in soup.find_all(id=True)]
    dup = sorted({x for x in ids if ids.count(x) > 1})
    if dup:
        errors.append(f'{rel}: duplicate ids {dup}')

    # JSON-LD must parse
    for s in soup.find_all('script', attrs={'type': 'application/ld+json'}):
        try:
            json.loads(s.string or s.get_text())
        except Exception as e:
            errors.append(f'{rel}: bad JSON-LD {e}')

    # heading order: no level skipped going down (h1 -> h3 without an h2, etc.)
    levels = [int(h.name[1]) for h in soup.select('h1, h2, h3, h4, h5, h6')]
    prev = 0
    for lvl in levels:
        if lvl > prev + 1 and prev != 0:
            errors.append(f'{rel}: heading order skips to h{lvl} after h{prev}')
        prev = lvl

# /start/ is a real, distinct, indexable page (not a noindex fallback) —
# confirm it says so and stays consistent with llms.txt.
ss = soups['start/index.html']
robots = ss.find('meta', attrs={'name': 'robots'})
if not robots or 'noindex' in robots.get('content', ''):
    errors.append('start/index.html: expected to be indexable (index,follow), found noindex or missing robots meta')
llms_txt = (ROOT / 'llms.txt').read_text(encoding='utf-8')
if 'not indexed' in llms_txt.lower() or 'noindex' in llms_txt.lower():
    if 'start' in llms_txt.lower():
        errors.append('llms.txt: still claims /start/ is not indexed, contradicting its live robots meta')

# Canonical claim numbers must appear on every page that cites them, and the
# full sourced sentence (with context/limit) must live on evidence.html —
# that's the one page where the exact wording matters, not a badge fragment.
NUMBER_PAGES = {
    '+22%': ['index.html', 'experience.html', 'evidence.html'],
    '1,095': ['index.html', 'experience.html', 'evidence.html'],
    '#1': ['index.html', 'experience.html', 'evidence.html'],
    '4.8M+': ['index.html', 'experience.html', 'evidence.html'],
}
for number, pages in NUMBER_PAGES.items():
    for rel in pages:
        if number not in (ROOT / rel).read_text(encoding='utf-8'):
            errors.append(f'{rel}: expected proof figure {number!r} not found')

EVIDENCE_SENTENCES = [
    '+22% customer retention improvement — publicly shared from the Enugu chapter and attributed to data-led route efficiency and remapping.',
    '1,095 days in Trade Activation across Enugu market execution (2022–2025).',
    '#1 Area, Division and Regional status — publicly shared from the Enugu chapter.',
    '4.8M+ views on a customer-focused Instagram Reel.',
]
evidence_text = (ROOT / 'evidence.html').read_text(encoding='utf-8')
for sentence in EVIDENCE_SENTENCES:
    if sentence not in evidence_text:
        errors.append(f'evidence.html: exact sourced sentence missing: {sentence!r}')

# _redirects: assert the rules this site actually depends on are present
# (legacy .html -> clean URL, and the two restored case studies redirecting
# to themselves rather than away from themselves).
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
}
missing = required_redirects - redirect_set
if missing:
    errors.append(f'_redirects missing {sorted(missing)}')
# these must NOT point at /projects any more — that was the contradictory
# retired-case-study state this repo fixed; catch a regression back to it.
for line in redirect_set:
    if 'trade-activation-enugu' in line and '/projects' in line:
        errors.append(f'_redirects: trade-activation-enugu should redirect to itself, not /projects: {line!r}')
    if 'abacha-festival-activation' in line and '/projects' in line:
        errors.append(f'_redirects: abacha-festival-activation should redirect to itself, not /projects: {line!r}')

# sitemap: must parse, no .html locs, no duplicate locs
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
print(f'Checked {len(PUBLIC)} audited pages + redirects + sitemap + canonical claims.')
