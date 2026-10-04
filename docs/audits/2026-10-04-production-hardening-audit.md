# Production hardening audit — 4 October 2026

## Scope

Rechecked the current 8.20.0 source, shared interaction code, contact flow, privacy controls, security headers, deployment documentation and GitHub QA gates after the 3 October responsive and hierarchy passes.

## Findings

1. **The generic email action still looked like Gmail.** The visible copy had correctly been renamed to Email, but the contact card retained a Gmail-specific multicolour icon and class. That created a mismatch because the link uses `mailto:` and opens whatever mail app the visitor has configured.
2. **The first-visit privacy panel could interrupt task entry.** It was scheduled about 1.4 seconds after load and only deferred for an open `<dialog>`; on mobile it could appear while a visitor was opening the menu or already typing into the contact form.
3. **Global Privacy Control was not explicitly honoured.** Do Not Track already forced essential-only behavior, but browsers exposing `navigator.globalPrivacyControl` were not treated the same way.
4. **Production-source freshness needs external verification.** The repository is on 8.20.0 with a simplified six-item navigation and passing CI; some public crawler snapshots can lag source changes, so hosting propagation should be verified separately rather than inferred from search-cache output.

## Changes in 8.21.0

- Replaced Gmail-specific visual branding with a neutral envelope icon while preserving the existing email action and accessible label.
- Added Global Privacy Control handling: when GPC is active, optional analytics remain disabled and the opt-in action is disabled.
- Delayed the first-visit privacy choice panel from 1.4 seconds to 6 seconds.
- Prevented the privacy panel from auto-opening while a native dialog is open, the mobile navigation is expanded, the page is hidden, or a visitor is actively entering form/contenteditable text.
- Added QA guards for the neutral email affordance, GPC support, the longer privacy delay, and interaction-safe prompting.
- Bumped public asset cache-bust references to 8.21.0 and refreshed the Contact sitemap modification date.

## Product benchmark

Current expert/consulting sites such as April Dunford and Wes Kao reinforce a useful principle already present here: make the promise, credibility and next action easy to scan. Jeb Blount's much denser commercial ecosystem is useful as a counter-example for this personal site: breadth can be powerful, but adding navigation or product layers here would reduce beginner clarity rather than improve it.

## Remaining constraints

- The external `moyosore-contact-mailer` Worker is outside this repository, so its deployed source, secrets, spam controls and mail-delivery telemetry cannot be independently audited here.
- The CSP still permits inline styles because legacy page-level style blocks remain. Removing `'unsafe-inline'` should be a dedicated migration with full visual regression coverage.
- Repository QA is structural and behavioral, not a real-device pixel-diff suite. Post-deploy Chrome/Safari verification at 320, 375/390, 768, 1280 and 1440 CSS-pixel widths remains the final visual check.
