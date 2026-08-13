# QA - Premium Trust 3.1

Automated/static checks completed before packaging:

- 26 HTML files parsed.
- 0 duplicate IDs found.
- 0 internal `.html` navigation links found.
- 0 canonical URLs ending in `.html` found.
- Legacy `.html` routes remain represented in `_redirects`.
- 0 `<audio>` elements found.
- 0 `autoplay` attributes found.
- 0 Sound toggle UI found.
- 0 `Checking…`, `WAT --:--`, or Public Site Pulse UI found.
- 0 visible `On this page` navigation elements found.
- JavaScript syntax check: PASS.
- Sitemap XML parse: PASS.
- Local link-target scan: PASS.
- One-page profile PDF: 1 page, rendered and visually checked with no clipping or overlap.

Important production checks still required after Cloudflare deploy:
- Contact Worker submission.
- Field Notes submission.
- Real browser responsive QA.
- Production Lighthouse/PageSpeed measurements.

A Chromium screenshot attempt in this environment timed out, so no browser-render or Lighthouse score is claimed here.
