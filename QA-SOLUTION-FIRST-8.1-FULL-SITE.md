# QA — Solution-First 8.1 Full-Site Audit

Date: 16 August 2026

## Broken-link audit
- HTML pages checked: **28**
- Total anchor instances inspected: **529**
- Unique internal links/routes: **31**
- Unique external links: **23**
- Broken internal links: **0**
- Broken internal anchors: **0**
- Missing canonical links: **0**
- Missing image alt text: **0**
- Sitemap parses and lists **17** canonical/indexable URLs.

## Real responsive browser audit
Rendered the actual page HTML and production CSS in Chromium via Playwright at:
- 320 × 800
- 390 × 844
- 768 × 1024
- 1440 × 1000

Total responsive checks: **112** (28 pages × 4 viewports).

Final result after fixes:
- Horizontal overflow failures: **0**
- Broken rendered images: **0**
- Missing visible H1: **0**
- Empty visible links: **0**
- Interactive targets below 24 px: **0**
- Console errors: **0**
- Page JavaScript errors: **0**

## Fixes made during the audit
- Enlarged legacy redirect-page links.
- Enlarged contact/newsletter consent checkboxes.
- Improved small inline link tap targets.
- Fixed a 320 px overflow caused by a long section heading.
- Hardened language preference storage for browsers where localStorage is unavailable.
- Added narrow-screen wrapping protection to the recommendation block.

## Decision UX update
Added a research-aligned buyer-decision layer:
1. Feelings shape attention — emotion, context and reasoning interact.
2. Too much or difficult choice can slow action — simplify the main path.
3. Losses can feel larger than equivalent gains — show real cost of delay, never fake urgency.

The site does **not** use the oversimplified “emotional brain decides first, rational brain later” claim.

## External-link verification
Current research/source pages from DataReportal, HubSpot, Google Search Central, Stripe, Deloitte, McKinsey, Salesforce, Zurich, Nature and PubMed Central were reachable through web verification on the audit date. The LinkedIn public profile also resolved. Social/app deep links (WhatsApp, Telegram, Instagram and Facebook) are syntactically valid but cannot all be fully fetched by the public web verifier because of platform/indexing restrictions; test those once more after production deployment on a phone.

## Production gate after deployment
After Cloudflare finishes deploying, re-run the live-domain smoke check for redirects, forms, WhatsApp/Telegram deep links and Lighthouse/Core Web Vitals.
