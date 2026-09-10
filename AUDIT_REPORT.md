# Production Bug Audit — 10 September 2026

## Scope

A repository-wide production audit was run across the public HTML surface, shared CSS and JavaScript, Cloudflare Pages headers and redirects, the contact workflow, privacy controls, structured data, sitemap/canonical wiring, the retention health-check tool, and the first-party analytics endpoint.

The audit now runs permanently in CI through `comprehensive_bug_audit.py` alongside the existing `qa_audit.py`, `quality_gate.py`, and `process_rail_guard.py` checks.

## Issues found and fixes applied

| Area | Issue found | Fix applied |
| --- | --- | --- |
| Functional | Contact/newsletter requests could wait indefinitely if the mail Worker or network hung. | Added an `AbortController` with a 12-second timeout, scoped per submission, with cleanup in `finally`. |
| Functional | Contact failure copy told visitors to use an “email link below”, but the redesigned contact page has no such link below the form. | Replaced the stale instruction with the real recovery channels: WhatsApp, Telegram or Gmail, plus retry guidance. |
| Functional | The hidden personalised recommendation link on `projects.html` shipped with `href="#"`, creating a dead fallback link if JavaScript did not replace it. | Removed the placeholder `#`; JavaScript supplies the real destination before the recommendation is revealed. |
| Functional / Accessibility | Six Growth System tab buttons had no explicit `type`, so HTML treated them as submit buttons if their context ever changed into a form. | Added `type="button"` to all six tab controls. |
| Privacy | Contact consent text was only “I agree.” and did not explain the processing purpose. | Replaced it with explicit consent to use the submitted information to respond to the enquiry. |
| Privacy | The contact consent area did not link to the Privacy Policy. | Added an inline `/privacy` link next to the consent statement. |
| Accessibility / UX | The privacy choices panel had no explicit close control. | Added an accessible close button with a clear label. |
| Accessibility / UX | The privacy choices panel did not close with Escape and did not restore focus to the control that opened it. | Added Escape handling and focus restoration; dismissing the panel never grants analytics consent. |
| Accessibility | Form controls used `outline:none`, which weakens focus visibility in forced-colors/high-contrast environments even though a custom shadow existed. | Preserved a transparent native outline and retained the existing visible focus styling. |
| Performance / Cache | `retention-health-check.js` was loaded without a version query while `/assets/*` is cached for seven days. A new release could therefore run stale tool logic. | Added the same versioned asset strategy used by the rest of the site. |
| SEO / Data accuracy | Several pages still embedded the old city `Enugu` in Person JSON-LD even when the page did not intentionally publish that location. | Removed stale city-level Person address data from the public HTML set; the site continues to use broader country-level service context where appropriate. |
| Security | `/api/event` accepted analytics POSTs when the `Origin` header was absent. | Restricted event POSTs to the two allowed site origins; absent or foreign origins are rejected. |
| Security | `/api/event` accepted arbitrary request content types. | Added `application/json` validation and rejects unsupported media types. |
| Security / Abuse resistance | `/api/event` had no request-body size limit. | Added a 4 KiB cap using both `Content-Length` and the actual received body length. |
| Security hardening | Cross-origin opener isolation was not explicitly declared. | Added `Cross-Origin-Opener-Policy: same-origin`. |
| Security hardening | Legacy cross-domain policy files were not explicitly disabled. | Added `X-Permitted-Cross-Domain-Policies: none`. |

## Regression coverage added

The permanent comprehensive audit now checks, among other things:

- internal links, same-page anchors and required local assets;
- unique document titles, canonicals, sitemap coverage and valid JSON-LD;
- duplicate IDs and broken ARIA references;
- form labels, control names, explicit button types and consent disclosure;
- external-link HTTPS and `noopener noreferrer` protections;
- image alternative text and explicit dimensions;
- deferred script loading and versioned cacheable CSS/JS;
- four-item process rails using the required responsive layout variant;
- contact-form timeout/recovery handling;
- privacy-panel close, Escape and focus-return behavior;
- analytics origin, content-type and payload-size protections;
- CSP, HSTS, clickjacking, referrer and permissions-policy baselines;
- reduced-motion support and payload-budget warnings.

## Validation policy

No artificial customer enquiry was submitted during this audit because that would intentionally deliver a real message to the production inbox. The form transport, timeout and failure paths are validated in source/CI without generating a fake lead.

Repository branch protection is an account/repository administration control rather than a website runtime bug. The audit can verify code and deployment safety, but enabling branch protection is outside the write scope of the managed connector used for this release.
