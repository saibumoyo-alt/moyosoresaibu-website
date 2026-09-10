"""Comprehensive static production audit for moyosoresaibu.com.

This is deliberately stricter than the legacy QA scripts. It checks functional
routing, accessibility wiring, structured data, cache safety, layout variants,
client-side failure handling, and security headers/endpoints.
"""
from pathlib import Path
from urllib.parse import urlparse, unquote
from bs4 import BeautifulSoup
import json
import re

ROOT = Path(__file__).parent
DOMAIN = 'https://moyosoresaibu.com'
errors = []
warnings = []


def fail(category, path, message):
    errors.append((category, str(path), message))


def warn(category, path, message):
    warnings.append((category, str(path), message))


def route_for_file(path: Path):
    rel = path.relative_to(ROOT).as_posix()
    if rel == 'index.html':
        return '/'
    if rel.endswith('/index.html'):
        return '/' + rel[:-10]
    if rel.endswith('.html'):
        return '/' + rel[:-5]
    return None


def local_file_for_url_path(path):
    path = unquote(path or '/').split('?', 1)[0].split('#', 1)[0]
    if path == '/':
        return ROOT / 'index.html'
    direct = ROOT / path.lstrip('/')
    if direct.is_file():
        return direct
    if direct.is_dir() and (direct / 'index.html').is_file():
        return direct / 'index.html'
    html = ROOT / (path.lstrip('/') + '.html')
    if html.is_file():
        return html
    index = ROOT / path.lstrip('/') / 'index.html'
    if index.is_file():
        return index
    return None


html_files = sorted(p for p in ROOT.rglob('*.html') if 'docs' not in p.parts)
route_map = {route_for_file(p): p for p in html_files if route_for_file(p)}
indexable_canonicals = set()
titles = {}
person_localities = []

for path in html_files:
    rel = path.relative_to(ROOT).as_posix()
    text = path.read_text(encoding='utf-8')
    soup = BeautifulSoup(text, 'html.parser')

    # Core document correctness.
    if not soup.html or not soup.html.get('lang'):
        fail('accessibility', rel, 'missing html[lang]')
    viewport = soup.find('meta', attrs={'name': 'viewport'})
    if not viewport or 'width=device-width' not in (viewport.get('content') or ''):
        fail('responsive', rel, 'missing responsive viewport')
    title = (soup.title.string or '').strip() if soup.title else ''
    if not title:
        fail('seo', rel, 'missing title')
    else:
        if title in titles:
            fail('seo', rel, f'duplicate title also used by {titles[title]}')
        titles[title] = rel
    h1s = soup.find_all('h1')
    if len(h1s) != 1:
        fail('accessibility', rel, f'expected exactly one h1, found {len(h1s)}')

    ids = [tag.get('id') for tag in soup.find_all(id=True)]
    duplicate_ids = sorted({x for x in ids if ids.count(x) > 1})
    for item in duplicate_ids:
        fail('functional', rel, f'duplicate id #{item}')
    id_set = set(ids)

    for tag in soup.find_all(True):
        for attr in ('aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns'):
            value = tag.get(attr)
            if not value:
                continue
            for ref in str(value).split():
                if ref not in id_set:
                    fail('accessibility', rel, f'{attr} references missing id #{ref}')

    for details in soup.find_all('details'):
        if not details.find('summary', recursive=False):
            fail('accessibility', rel, '<details> missing direct <summary>')

    # SEO / canonical / indexability.
    robots = soup.find('meta', attrs={'name': 'robots'})
    noindex = robots and 'noindex' in (robots.get('content') or '').lower()
    canonical = soup.find('link', rel='canonical')
    canon = (canonical.get('href') or '').strip() if canonical else ''
    if rel != '404.html' and not canon:
        fail('seo', rel, 'missing canonical URL')
    if canon:
        parsed_canon = urlparse(canon)
        if parsed_canon.scheme != 'https' or parsed_canon.netloc != 'moyosoresaibu.com':
            fail('seo', rel, f'non-canonical host/scheme: {canon}')
        if parsed_canon.query or parsed_canon.fragment:
            fail('seo', rel, f'canonical contains query/fragment: {canon}')
        if not noindex:
            indexable_canonicals.add(canon.rstrip('/') or DOMAIN)

    # Links, routing and safe external navigation.
    for a in soup.find_all('a', href=True):
        href = (a.get('href') or '').strip()
        if href in ('', '#'):
            fail('functional', rel, f'dead link href={href!r}')
            continue
        if href.startswith('javascript:'):
            fail('security', rel, 'javascript: URL is not allowed')
            continue
        if a.get('target') == '_blank':
            rels = set(a.get('rel') or [])
            if not {'noopener', 'noreferrer'} <= rels:
                fail('security', rel, f'target=_blank missing noopener noreferrer: {href}')
        parsed = urlparse(href)
        if parsed.scheme in ('http', 'https'):
            if parsed.scheme != 'https':
                fail('security', rel, f'non-HTTPS external link: {href}')
            continue
        if parsed.scheme in ('mailto', 'tel'):
            continue
        if href.startswith('#'):
            if href[1:] not in id_set:
                fail('functional', rel, f'broken same-page anchor: {href}')
            continue
        if href.startswith('/'):
            if not local_file_for_url_path(parsed.path):
                # Asset/download routes may be files with non-HTML suffixes.
                asset = ROOT / parsed.path.lstrip('/')
                if not asset.is_file():
                    fail('functional', rel, f'broken internal link: {href}')

    # Images: layout stability and accessible alternatives.
    for img in soup.find_all('img'):
        src = img.get('src', '')
        if not img.has_attr('alt'):
            fail('accessibility', rel, f'image missing alt: {src}')
        if not img.get('width') or not img.get('height'):
            fail('performance', rel, f'image missing explicit width/height: {src}')
        if src.startswith('/'):
            parsed = urlparse(src)
            if not (ROOT / parsed.path.lstrip('/')).is_file():
                fail('functional', rel, f'missing image asset: {src}')
        if not img.get('loading') and img.get('fetchpriority') != 'high':
            warn('performance', rel, f'image is neither lazy nor marked high priority: {src}')

    for iframe in soup.find_all('iframe'):
        if not iframe.get('title'):
            fail('accessibility', rel, 'iframe missing title')

    # Buttons should never accidentally become form submitters.
    for button in soup.find_all('button'):
        if not button.get('type'):
            fail('functional', rel, f'button missing explicit type: {button.get_text(" ", strip=True)[:60]}')

    # Forms and controls.
    for form in soup.find_all('form'):
        action = (form.get('action') or '').strip()
        if action and urlparse(action).scheme == 'http':
            fail('security', rel, f'form posts over HTTP: {action}')
        for control in form.select('input:not([type="hidden"]), select, textarea'):
            ctype = (control.get('type') or '').lower()
            if ctype in ('submit', 'button', 'reset', 'image'):
                continue
            if not control.get('name'):
                fail('functional', rel, f'form control missing name: {control.name}[type={ctype}]')
            cid = control.get('id')
            labelled = bool(control.get('aria-label') or control.get('aria-labelledby'))
            if cid and soup.find('label', attrs={'for': cid}):
                labelled = True
            if control.find_parent('label'):
                labelled = True
            if not labelled:
                fail('accessibility', rel, f'unlabelled form control: {control.name}[name={control.get("name", "")}]')
        consent = form.find('input', attrs={'name': 'consent'})
        if consent:
            label = consent.find_parent('label')
            label_text = label.get_text(' ', strip=True) if label else ''
            if len(label_text) < 20:
                fail('privacy', rel, 'consent label is too vague to explain what the visitor agrees to')
            if not form.find('a', href=re.compile(r'^/privacy(?:$|[?#])')):
                fail('privacy', rel, 'consent form does not link to the privacy policy')

    # Local CSS/JS must exist and cacheable assets must be versioned.
    resource_paths = []
    for link in soup.find_all('link', href=True):
        if 'stylesheet' not in (link.get('rel') or []):
            continue
        href = link['href']
        resource_paths.append(('css', href))
    for script in soup.find_all('script', src=True):
        src = script['src']
        resource_paths.append(('js', src))
        if not (script.has_attr('defer') or script.has_attr('async') or script.get('type') == 'module'):
            fail('performance', rel, f'render-blocking script: {src}')
    seen_resources = set()
    for kind, ref in resource_paths:
        parsed = urlparse(ref)
        if parsed.scheme or parsed.netloc or not parsed.path.startswith('/'):
            continue
        local = ROOT / parsed.path.lstrip('/')
        if not local.is_file():
            fail('functional', rel, f'missing {kind} asset: {ref}')
        key = (kind, parsed.path)
        if key in seen_resources:
            fail('performance', rel, f'duplicate {kind} resource: {parsed.path}')
        seen_resources.add(key)
        if parsed.path.startswith('/assets/') and parsed.path.endswith(('.css', '.js')):
            qs = parsed.query
            if not re.search(r'(?:^|&)v=[^&]+', qs):
                fail('performance', rel, f'cacheable {kind} asset lacks version query: {ref}')

    # Known responsive process rail contract.
    for rail in soup.select('.process-rail'):
        direct = [node for node in rail.find_all(recursive=False) if getattr(node, 'name', None)]
        if len(direct) == 4 and 'four-up' not in (rail.get('class') or []):
            fail('visual', rel, '4-item process rail is missing four-up layout class')

    # Structured data must be valid and must not silently claim a city that
    # the visible page does not state.
    visible = soup.get_text(' ', strip=True)
    for node in soup.find_all('script', attrs={'type': 'application/ld+json'}):
        try:
            data = json.loads(node.string or '{}')
        except Exception as exc:
            fail('seo', rel, f'invalid JSON-LD: {exc}')
            continue
        stack = [data]
        while stack:
            item = stack.pop()
            if isinstance(item, dict):
                if item.get('@type') == 'Person' and item.get('@id') == f'{DOMAIN}/#person':
                    address = item.get('address')
                    if isinstance(address, dict) and address.get('addressLocality'):
                        locality = str(address['addressLocality'])
                        person_localities.append((rel, locality))
                        if locality.casefold() not in visible.casefold():
                            fail('seo', rel, f'JSON-LD claims addressLocality={locality!r} but visible page does not state it')
                stack.extend(item.values())
            elif isinstance(item, list):
                stack.extend(item)

# Sitemap must cover every indexable canonical HTML page, except the optional
# start chooser which is still intentionally indexable and therefore included.
sitemap_path = ROOT / 'sitemap.xml'
if sitemap_path.is_file():
    sitemap_text = sitemap_path.read_text(encoding='utf-8')
    sitemap_urls = set(re.findall(r'<loc>(.*?)</loc>', sitemap_text))
    normalized_sitemap = {u.rstrip('/') or DOMAIN for u in sitemap_urls}
    for canon in sorted(indexable_canonicals - normalized_sitemap):
        fail('seo', 'sitemap.xml', f'indexable canonical missing from sitemap: {canon}')
    for url in sorted(normalized_sitemap - indexable_canonicals):
        fail('seo', 'sitemap.xml', f'sitemap URL has no matching indexable canonical page: {url}')
else:
    fail('seo', 'sitemap.xml', 'missing sitemap.xml')

# Client-side contact reliability.
site_js = (ROOT / 'assets/site.js').read_text(encoding='utf-8') if (ROOT / 'assets/site.js').is_file() else ''
setup_form_match = re.search(r'function setupForm\(form,type\)\{(.*?)\n\s*\}\n\n\s*setupForm\(', site_js, re.S)
setup_form = setup_form_match.group(1) if setup_form_match else ''
if 'fetch(worker' in setup_form and 'AbortController' not in setup_form:
    fail('functional', 'assets/site.js', 'contact/newsletter network request has no timeout; submit can remain busy indefinitely')
if 'email link below' in site_js:
    contact_text = (ROOT / 'contact.html').read_text(encoding='utf-8') if (ROOT / 'contact.html').is_file() else ''
    if 'mailto:' not in contact_text:
        fail('functional', 'assets/site.js', 'form failure message says “email link below” but contact page has no mailto link')

# Analytics endpoint abuse resistance.
event_js = (ROOT / 'functions/api/event.js').read_text(encoding='utf-8') if (ROOT / 'functions/api/event.js').is_file() else ''
for token, message in (
    ('content-type', 'analytics endpoint does not validate request content type'),
    ('content-length', 'analytics endpoint does not cap request body size'),
):
    if token not in event_js.lower():
        fail('security', 'functions/api/event.js', message)
if re.search(r"if\(origin&&", event_js):
    fail('security', 'functions/api/event.js', 'analytics endpoint accepts POST requests with no Origin header')
if 'unsafe-eval' in (ROOT / '_headers').read_text(encoding='utf-8'):
    fail('security', '_headers', 'CSP allows unsafe-eval')

# Security headers baseline.
headers = (ROOT / '_headers').read_text(encoding='utf-8') if (ROOT / '_headers').is_file() else ''
required_headers = {
    'X-Content-Type-Options: nosniff': 'MIME sniffing protection missing',
    'X-Frame-Options: DENY': 'legacy clickjacking protection missing',
    'Strict-Transport-Security:': 'HSTS missing',
    'Referrer-Policy:': 'referrer policy missing',
    'Permissions-Policy:': 'permissions policy missing',
    "frame-ancestors 'none'": 'CSP frame-ancestors missing',
    "object-src 'none'": 'CSP object-src restriction missing',
    "base-uri 'self'": 'CSP base-uri restriction missing',
}
for token, message in required_headers.items():
    if token not in headers:
        fail('security', '_headers', message)
if 'assets/premium-icons.css' in ' '.join(p.as_posix() for p in ROOT.rglob('*')) and "img-src 'self' data:" not in headers:
    fail('security', '_headers', 'CSP would block embedded SVG data images used by premium icon CSS')
for optional in ('X-Permitted-Cross-Domain-Policies:', 'Cross-Origin-Opener-Policy:'):
    if optional not in headers:
        warn('security', '_headers', f'optional hardening header not present: {optional[:-1]}')

# CSS sanity: do not allow focus suppression without an obvious replacement.
site_css = (ROOT / 'assets/site.css').read_text(encoding='utf-8') if (ROOT / 'assets/site.css').is_file() else ''
if re.search(r'outline\s*:\s*(?:0|none)\b', site_css, re.I):
    warn('accessibility', 'assets/site.css', 'contains outline:none/0; verify every affected control has a focus-visible replacement')
if '@media(prefers-reduced-motion:reduce)' not in site_css.replace(' ', ''):
    fail('accessibility', 'assets/site.css', 'no reduced-motion CSS fallback found')

# Payload budgets are warnings, not release blockers; they make regressions visible.
css_total = sum(p.stat().st_size for p in (ROOT / 'assets').glob('*.css'))
js_total = sum(p.stat().st_size for p in (ROOT / 'assets').glob('*.js'))
if css_total > 160_000:
    warn('performance', 'assets/', f'total CSS payload is {css_total/1024:.1f} KiB before compression')
if js_total > 100_000:
    warn('performance', 'assets/', f'total JS payload is {js_total/1024:.1f} KiB before compression')

print('COMPREHENSIVE BUG AUDIT')
if warnings:
    print(f'WARNINGS: {len(warnings)}')
    for category, path, message in warnings:
        print(f'- [{category}] {path}: {message}')
if errors:
    print(f'FAILURES: {len(errors)}')
    for category, path, message in errors:
        print(f'- [{category}] {path}: {message}')
    raise SystemExit(1)
print(f'PASS: {len(html_files)} HTML files audited; CSS {css_total/1024:.1f} KiB, JS {js_total/1024:.1f} KiB before compression.')
