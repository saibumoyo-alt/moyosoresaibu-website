# Moyosore Saibu — Personal Website

Current production build: **1.5.0**.

Static HTML/CSS/vanilla JavaScript deployed on Cloudflare Pages. The public interface uses one shared stylesheet (`/assets/site.css`) and one small enhancement script (`/assets/site.js`). Core content and navigation work without JavaScript.

## Main routes
- `/` — professional homepage
- `/start/` — social-first landing page
- `/about`
- `/experience`
- `/projects`
- `/insights/`
- `/evidence`
- `/contact`

## Current design rules
Plain English, minimal UI, no live clocks, no GitHub pulse, no ambient audio, no animated KPI counters, direct evidence links, mobile-first layouts, and one clear reading path.

## Deployment
Cloudflare Pages deploys automatically from `main`. Keep `/functions/` because it contains the contact workflow.
