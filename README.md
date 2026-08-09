# Moyosore Saibu — Premium V8 Authority & Accessibility

Official personal website of Moyosore Saibu.

## What V8 is for
V8 turns the site into an authority, evidence and conversion system rather than only a visual portfolio. It is built as static HTML/CSS/vanilla JavaScript on Cloudflare Pages, with Pages Functions for the secure contact workflow.

## V8 highlights
- Accessible sound control: audio is OFF by default and never autoplays.
- Person, ProfilePage, WebSite, WebPage, BreadcrumbList, Blog and BlogPosting JSON-LD where relevant.
- Absolute canonical URLs and sitemap/robots coverage.
- Real contact form with a secure Pages Function endpoint and direct-email fallback.
- Privacy page and low-data first-party conversion event hooks.
- Downloadable one-page ATS-friendly CV.
- Downloadable one-page evidence & methodology note.
- Evidence page that separates public professional claims from unavailable/confidential internal baselines.
- Four full case-study pages with Situation → Action → Result → Evidence framing.
- Five Insight field notes with visible dates/bylines, structured metadata, category filtering, related articles and tracked LinkedIn sharing links.
- Field Notes signup request form.
- Professional validation section without fabricated testimonials.
- AVIF → WebP → JPEG responsive portrait delivery.
- Lazy-loading for below-the-fold editorial images; hero remains high-priority for LCP.
- Keyboard-accessible navigation, visible focus states and focusable skip-link target.
- Reduced-motion support and limited non-essential animation loops.
- Existing premium glass/3D/story-graph design retained.
- Existing `?intent=` / `?from=` conversion journey preserved and extended.

## Deployment
Cloudflare Pages / GitHub. No build command is required for the static site. The `functions/` directory is deployed automatically as Pages Functions.

Domain: https://moyosoresaibu.com

## Production setup after deployment
Read `CLOUDFLARE_SETUP.md`. The only account-level work that cannot be embedded in source code is:
1. Enable Cloudflare Web Analytics.
2. Verify the contact destination email in Cloudflare Email Routing and configure the Email Sending API token / Pages secrets.
3. Optionally add the `CRO_ANALYTICS` Analytics Engine binding.
4. Test the live contact form.

If secure form email delivery has not been configured yet, the front end preserves a direct-email fallback so a visitor is not stranded.

## QA completed before packaging
- HTML/SEO/accessibility structural checks across every HTML page.
- JSON-LD parsing checks.
- Internal asset/link checks.
- JavaScript syntax checks for site JS and Pages Functions.
- Key dark-theme text/background contrast pairs checked against WCAG AA thresholds.
- CV and evidence PDFs rendered and visually inspected.
- Desktop/mobile/contact/insights/evidence local rendering checks.

Real-user Core Web Vitals should be measured after deployment because field metrics depend on the production URL, network, device and actual visitors.


## Premium V8.1 — Worker Connected

Production contact delivery is now wired to the independently tested Worker:

`https://moyosore-contact-mailer.saibumoyo.workers.dev/contact`

### Changes
- Contact form now posts to the tested Worker instead of `/api/contact`
- Removed obsolete Pages `/functions/api/contact.js` REST/token implementation
- Field Notes signup uses the same Worker without requiring a second backend
- Contact journey source (`?from=`) is preserved in delivered email
- Form failures no longer force-open a desktop mail client
- Explicit direct-email fallbacks remain
- Privacy copy updated to reflect dedicated Worker delivery
- V8.1 cache busting for CSS and JavaScript
- Existing `/api/event` first-party analytics hook retained


## Premium V8.2 — SEO Precision

This is a non-visual structured-data patch.

### Changes
- Removed optional ProfilePage `dateCreated` and `dateModified` date-only values that Google Search Console flagged as invalid DateTime values
- Normalized `Person.jobTitle` from `Territory Manager, Guinness Nigeria` to `Territory Manager`
- Preserved `worksFor → Guinness Nigeria` as the employer relationship
- No design, animation, audio, contact Worker, analytics, sitemap, or content changes
- Cache-busting updated to `v=8.2.0`


## Premium V8.3 — Performance & Accessibility Precision

Non-visual precision release.

- Hero responsive preload now matches the preferred AVIF source set
- Above-the-fold portrait explicitly remains eager/high priority
- Five custom SVG retention-chart buttons now have accessible names
- Enter/Space keyboard support added to those SVG controls
- Grain texture changed from ~23 KB PNG to ~3 KB WebP in V8.3 CSS
- Original grain PNG retained only for compatibility with old cached CSS
- Modest cache headers added for manifest, robots and sitemap
- Visual design, animation, sound, conversion, Worker email, analytics and SEO architecture preserved
