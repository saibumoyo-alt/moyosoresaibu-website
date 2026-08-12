# Full-site audit compliance — 12 Aug 2026

## Canonical decision
The root `/` is the single source of truth. `/start`, `/start/`, and `/start/index.html` 301 to `/`. `/start/` is removed from the sitemap and its fallback HTML is `noindex,follow` with a root canonical.

## Live/public signals
The GitHub/Public pulse UI is removed. No client-side GitHub fetch is used. Current WAT is progressive enhancement only; first paint shows `Nigeria · WAT (UTC+1)` instead of a dash placeholder.

## Site-wide UI
Sound/audio controls are absent from all audited HTML pages. Primary nav is Home · About · Experience · Projects · Insights · Contact on all audited pages. Footers use `© 2026 Moyosore Saibu. All rights reserved.` and contain no public build/version label.

## Canonical commercial claims
- `+22% customer retention improvement — publicly shared from the Enugu chapter and attributed to data-led route efficiency and remapping.`
- `1,095 days in Trade Activation across Enugu market execution (2022–2025).`
- `#1 Area, Division and Regional status — publicly shared from the Enugu chapter.`
- Creator proof remains separately labeled: `4.8M+ views on a customer-focused Instagram Reel.`

## URL hygiene
Tracking-only `from`/`source` query parameters were removed from audited internal links. Semantically useful contact `intent` parameters remain. Top-level `.html` aliases and listed insight/case-study `.html` aliases redirect to clean paths.
