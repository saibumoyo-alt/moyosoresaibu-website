# Production UX & Reliability Audit — 3 October 2026

## Scope

Reviewed the current public surface (25 sitemap URLs), shared HTML/CSS/JavaScript, the contact and newsletter flows, retention tool, Cloudflare Pages headers/redirects, analytics endpoint, design-system documentation, and CI quality gates. The review focused on beginner-friendly comprehension, mobile resilience, progressive enhancement, failure recovery, performance, accessibility, security, and maintainability.

## Benchmark notes

The site was compared with current expert/consulting patterns rather than copied from them. April Dunford's site makes the service promise and direct contact path immediately obvious; Wes Kao's site uses a short credibility-led introduction and a simple recurring-content conversion path; Jeb Blount's site makes service categories and calls to action explicit. The useful lesson for this site is clarity and confidence, not adding their volume of marketing content.

Accessibility checks were aligned with WCAG 2.2 target-size guidance and progressive-enhancement navigation guidance from W3C and web.dev.

## Priority findings

1. **Homepage latest insight depended on JavaScript and a second HTML request.** Static content that was already known at deploy time could disappear with JavaScript disabled or a fetch failure.
2. **Mobile navigation could clip in short/landscape viewports.** The absolute menu had no height cap or internal scrolling.
3. **The contact page called a generic `mailto:` action “Gmail”.** That can open any configured mail client and was unnecessarily confusing.
4. **Timeout recovery was generic.** A slow mail Worker looked the same as every other failure even though the user's typed message remained available.
5. **The scan-first start page lost its header CTA below the desktop breakpoint.** The hero still had a CTA, but the compact header itself offered no direct mobile action.
6. **Backend observability is split.** Analytics code is in this repository, while the mail Worker is external, so its server-side implementation cannot be fully audited from this codebase alone.

## Changes in 8.18.0

- Render the latest homepage insight directly in HTML and remove its runtime HTML fetch; CI now verifies it still matches the first Insights item.
- Make the mobile menu vertically scrollable with a dynamic-viewport height limit and preserve 44px minimum navigation targets.
- Rename the generic mail channel to **Email** and set clearer expectations before form submission.
- Distinguish timeouts from other send failures while explicitly telling visitors their typed content remains in place.
- Keep a visible **Contact** action in the `/start/` header on mobile.
- Extend the quality gate to lock these regressions out.
- Refresh public sitemap modification dates for this release.

## Remaining issues / deliberate constraints

- The external contact-mailer Worker is not stored in this repository, so server-side spam controls, mail delivery telemetry, and Worker secrets cannot be independently inspected here.
- The CSP still permits inline styles because several existing pages use inline style attributes/blocks. Removing `'unsafe-inline'` should be a separate migration, not a risky one-pass rewrite.
- Visual viewport testing should still be run in a real browser/device matrix after deployment; repository CI covers structural, accessibility, routing, security-header, latest-content consistency, and static regression checks.
