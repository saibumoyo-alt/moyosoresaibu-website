# QA Report — Master Website + Landing Page

Date: 12 August 2026

## Automated checks passed

- 10 HTML pages parsed successfully.
- No duplicate HTML IDs detected.
- Canonical URLs exist on every page.
- JSON-LD parses successfully.
- Every image has alt text.
- Full-site desktop navigation is identical on all standard pages.
- `/start/` is deliberately `noindex,follow` and has a self-referencing canonical.
- `/start/` is not present in the XML sitemap.
- Contact form contains name, email, reason, message and consent fields.
- CV PDF exists.
- Evidence PDF exists.
- `site.js` passes Node syntax validation.
- `site.css` parses with zero CSS parser errors.
- `sitemap.xml` parses successfully.

## Broken-state sweep passed

The rebuilt pages contain none of the following:

- `Checking…`
- `--:--`
- live GitHub pulse UI
- live clock UI
- ambient audio
- Sound toggle
- exposed V9.x version labels
- MEET → CHOOSE → MOVE
- “Route me, don't make me browse”
- “Raw signal → useful next move”
- animated number counters required for proof

## Performance design

Core pages use:

- one shared CSS file
- one small JavaScript file used primarily for progressive contact-form enhancement
- responsive AVIF/WebP/JPEG portrait sources
- no external font download
- no React/Vue/GSAP/Three.js
- no social embeds or social SDKs
- no live-data API requests

A final Lighthouse score must be measured on the live Cloudflare deployment because CDN caching, production headers and network conditions affect the result.

## Accessibility design

- skip link
- semantic headings
- keyboard-accessible links and form controls
- visible focus styles
- 44px+ primary tap targets
- native mobile `<details>` navigation
- reduced-motion handling
- plain text social links instead of unlabeled icon-only controls
- contact-form labels and live status text
- no information hidden behind animation

## Contrast checks

Representative contrast ratios:

- Main text on warm background: **17.08:1**
- Muted text on warm background: **5.12:1**
- Dark text on lime accent: **13.42:1**
- White text on dark section: **18.69:1**
- Muted light text on dark section: **11.36:1**

These representative pairs exceed the WCAG AA 4.5:1 threshold for normal text.
