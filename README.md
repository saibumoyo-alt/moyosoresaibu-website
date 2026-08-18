# moyosoresaibu.com

Production static website for Moyosore Saibu, currently on the
Solution-First design/positioning system (see `VERSION`). Hand-written
HTML/CSS/JS, no build step, deployed to Cloudflare Pages.

## How it's built

- Every page is a standalone `.html` file. There is no templating engine —
  the header, footer and nav markup is duplicated per page on purpose (static
  hosting, no server-side includes). Keep them in sync by hand when editing.
- One stylesheet (`assets/site.css`) and one script (`assets/site.js`) serve
  every page, cache-busted with a `?v=X.Y.Z` query string that matches
  `VERSION`. There is no bundler — edit these files directly.
- `functions/api/event.js` is a Cloudflare Pages Function backing a small,
  DNT-respecting first-party analytics beacon (`POST /api/event`). It only
  writes if the `CRO_ANALYTICS` Analytics Engine binding is configured in
  the Pages project; otherwise it no-ops. See `CLOUDFLARE_SETUP.md`.
- The contact form and the "Field Notes" email signup both POST to an
  **external** Cloudflare Worker (`moyosore-contact-mailer`, not in this
  repo) which sends mail via a Cloudflare Email Service binding. Both forms
  degrade gracefully without JavaScript by posting directly to the same
  Worker URL as their `action`.
- `_redirects` and `_headers` are Cloudflare Pages config: legacy `.html`
  URLs 301 to their clean extensionless canonical route, and `_headers` sets
  baseline security headers plus long-lived caching on `/assets/*`.

## Rules worth preserving

- Clean, extensionless public URLs. `.html` legacy URLs redirect to the
  canonical route via `_redirects` — don't link to `.html` paths internally.
- No audio, autoplay, live clock, GitHub-pulse widget, or placeholder/fake
  "live" status UI anywhere on the site. This was removed deliberately and
  `qa_audit.py` checks for regressions.
- Every "proof" number (retention %, ranking, reach, etc.) that appears
  anywhere on the site must trace back to a sourced, limit-disclosed entry
  on `/evidence`. Never present a self-published metric as independently
  audited — say so when it isn't.
- Do not invent testimonials, quotes, or placeholder social proof. Only
  publish recommendations/quotes that are genuinely provided.
- `/start/` is a real, distinct scan-first landing page for social-bio-link
  traffic (see `docs/decisions/` for what changed and why) — it is not a
  shortened copy of the homepage, and it should stay indexable.
- Case studies follow problem → what I did → result → what I learned. CV and
  a one-page professional profile are downloadable from `/evidence`.
- Insights use client-side search/filter with no external dependency.

## Local development / testing

There's no dev server config checked in, but `npx wrangler pages dev .`
serves the site with full `_redirects`/`_headers`/Functions fidelity
(closer to production than a plain static file server, which won't resolve
clean URLs). Run `python3 qa_audit.py` before shipping — it checks nav
consistency, canonical URLs, forbidden leftover strings, and `_redirects`
coverage across the public page set.

## Project history

Older per-release changelog/QA docs (Premium 2.0–4.0, V9.x, Solution-First
5.0–8.0) are archived under `docs/history/` — they're historical record, not
current instructions. `CLOUDFLARE_SETUP.md` and `docs/decisions/` reflect
the current, load-bearing state.
