# QA Report — Premium Clarity 3.0

Build date: 13 Aug 2026

## Automated checks
- 26 HTML files checked
- 0 duplicate ID errors
- 0 remaining visible `On this page` navigation blocks
- 0 banned placeholder strings (`Checking…`, `WAT --:--`, `Sound off`, old five-door copy)
- all HTML pages use `site.css?v=3.0.0` and `site.js?v=3.0.0`
- all HTML bodies use the shared premium design system
- local asset references checked: 0 missing
- interactive proof explorer present on Home and Start
- progressive live-site targets present on Home and Start
- Insights index contains a valid article row for live refresh
- JavaScript syntax: PASS (`node --check`)
- CSS parser: PASS (0 parse errors)
- CSS brace balance: PASS

## Local HTTP smoke test
- `/index.html` → 200
- `/start/` → 200
- `/experience.html` → 200
- `/projects.html` → 200
- `/insights/` → 200
- `/contact.html` → 200
- `/evidence.html` → 200
- `/case-studies/route-remapping-retention.html` → 200

## Asset size
- Shared CSS: ~50 KB uncompressed
- Shared JS: ~8.5 KB uncompressed
- No web font dependency
- No chart library
- No social SDK
- No external runtime API required for core content

## Important limitation
A real production Lighthouse/PageSpeed score is not claimed here. Run PageSpeed Insights after Cloudflare deploys the production build.
