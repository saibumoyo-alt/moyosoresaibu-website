# Moyosore Saibu — Master Website + Landing Page Upgrade

This package is a **clean overlay for the existing `moyosoresaibu-website` repository**.

## What this upgrade does

- Rebuilds `/` as the main professional homepage.
- Keeps `/start/` as a separate social-entry landing page.
- Uses plain English and one clear reading path on every page.
- Uses one shared visual system across Home, About, Experience, Projects, Insights, Evidence, Contact and Privacy.
- Removes live clocks, GitHub pulse widgets, sound, autoplay, animated counters, quiz routers, duplicate process loops and other fragile UI.
- Keeps the tested Cloudflare contact Worker.
- Includes the latest CV and evidence PDF in `/assets/downloads/`.
- Connects Instagram, LinkedIn, Facebook, Pinterest and YouTube in the website and Person structured data.

## Important deployment rule

**Overlay these files onto the current repository. Do not delete unrelated existing folders.**

Keep the current repository's:

- `/functions/`
- `/case-studies/`
- individual `/insights/*.html` article files
- any existing Cloudflare configuration that is not replaced here

This package replaces the shared page design and top-level pages, not the already-published article/case-study library.

## Upload / replace

Upload everything in this package except development-only files if you are using the deploy ZIP.

Key files:

- `/index.html`
- `/about.html`
- `/experience.html`
- `/projects.html`
- `/contact.html`
- `/evidence.html`
- `/privacy.html`
- `/404.html`
- `/insights/index.html`
- `/start/index.html`
- `/assets/site.css`
- `/assets/site.js`
- portrait assets
- `/assets/downloads/moyosore-saibu-cv.pdf`
- `/assets/downloads/moyosore-saibu-evidence-methodology.pdf`
- `/assets/og-moyosore-saibu.jpg`
- `/assets/favicon.svg`
- `/assets/apple-touch-icon.png`
- `/_redirects`
- `/_headers`
- `/sitemap.xml`
- `/robots.txt`
- `/llms.txt`
- `/site.webmanifest`

## URL design

- `/` — main professional website and indexed canonical homepage
- `/start/` — social landing page; `noindex,follow` so it does not compete with the homepage in search
- `/about`
- `/experience`
- `/projects`
- `/insights/`
- `/evidence`
- `/contact`
- `/privacy`

Old `.html` URLs redirect to the clean versions through `_redirects`.

## After deployment

Check these in an incognito browser and on a phone:

1. `https://moyosoresaibu.com/`
2. `https://moyosoresaibu.com/start/`
3. `https://moyosoresaibu.com/experience`
4. `https://moyosoresaibu.com/projects`
5. `https://moyosoresaibu.com/insights/`
6. `https://moyosoresaibu.com/contact`
7. `https://moyosoresaibu.com/evidence`

Then test:

- all main navigation links
- Instagram/LinkedIn/Facebook/Pinterest/YouTube links
- CV download
- evidence PDF download
- the four case-study links
- the five insight article links
- contact form success state
- direct-email fallback
- 320px, 375px, 390px and desktop widths
- Lighthouse mobile after production caching is active

## Success standard

A first-time visitor should understand these three things immediately:

1. **Who:** Moyosore Saibu, Territory Manager at Guinness Nigeria.
2. **What:** sales, customers and market execution.
3. **Next step:** see experience or contact Moyosore.

No part of that first understanding depends on JavaScript, live APIs, animation or waiting for data.
