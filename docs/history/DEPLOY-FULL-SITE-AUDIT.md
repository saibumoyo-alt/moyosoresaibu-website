# Deploy — Full-site audit completion

Date: 12 Aug 2026

## Canonical decision

The root homepage `/` is the single source of truth.

These routes permanently redirect to `/`:

- `/start`
- `/start/`
- `/start/index.html`
- `/index.html`

`/start/index.html` remains in the package only as a defensive fallback. It is `noindex,follow` and canonicals to `/`.

## Upload / replace

Upload the contents of the deploy delta to the repository root, preserving paths:

- `/index.html`
- `/start/index.html`
- `/about.html`
- `/experience.html`
- `/projects.html`
- `/contact.html`
- `/evidence.html`
- `/privacy.html`
- `/insights/index.html`
- `/_redirects`
- `/sitemap.xml`
- `/llms.txt`

No contact Worker, image asset, shared CSS, or shared JS needs to be deleted.

## What is intentionally removed

- Public GitHub pulse UI / `Checking…`
- Any visible `--:--` time placeholders
- Sound/audio nav UI
- Public build/version footer labels
- Tracking-only `from=` / `source=` parameters in audited internal links
- `.html` internal links in audited pages
- `/start/` as an indexable duplicate entry point

## Canonical claim wording

Use these exact strings wherever the claim appears:

1. `+22% customer retention improvement — publicly shared from the Enugu chapter and attributed to data-led route efficiency and remapping.`
2. `1,095 days in Trade Activation across Enugu market execution (2022–2025).`
3. `#1 Area, Division and Regional status — publicly shared from the Enugu chapter.`
4. Creator proof, when used: `4.8M+ views on a customer-focused Instagram Reel.`

## Local QA

Run:

```bash
python qa_audit.py
```

Expected:

```text
PASS
Checked 9 audited pages + redirects + sitemap + canonical claims.
```

## Production acceptance tests

After Cloudflare Pages reports a successful deployment:

```bash
curl -I https://moyosoresaibu.com/
curl -I https://moyosoresaibu.com/start/
curl -I https://moyosoresaibu.com/about.html
curl -I https://moyosoresaibu.com/about
curl -I https://moyosoresaibu.com/insights
curl -I https://moyosoresaibu.com/insights/
```

Expected routing:

- `/` → **200**
- `/start/` → **301** to `/`
- `/about.html` → **301** to `/about`
- `/about` → **200**
- `/insights` → **301** to `/insights/`
- `/insights/` → **200**

Then verify homepage source:

```bash
curl -s https://moyosoresaibu.com/ | grep -E 'Checking|--:--|Public pulse|Sound off|V9\.'
```

Expected: **no output**.

Verify canonical:

```bash
curl -s https://moyosoresaibu.com/ | grep -i canonical
```

Expected canonical URL: `https://moyosoresaibu.com/`.

Verify JavaScript-disabled fallback manually in DevTools:

- Disable JavaScript.
- Hard refresh `/`.
- Confirm no `--:--` text.
- The page should show `Nigeria · WAT (UTC+1)` as the fallback context.

## Mobile acceptance

Hard refresh on a phone and confirm:

- no stalled live-data widget
- no Sound control
- no literal dash time
- same Home/About/Experience/Projects/Insights/Contact nav
- footer: `© 2026 Moyosore Saibu. All rights reserved.`
- `/start/` resolves to `/`

## Search / indexing follow-up

After deployment, resubmit `https://moyosoresaibu.com/sitemap.xml` in Search Console and request re-indexing for `/` if needed. The sitemap no longer lists `/start/` or `.html` aliases as canonical URLs.
