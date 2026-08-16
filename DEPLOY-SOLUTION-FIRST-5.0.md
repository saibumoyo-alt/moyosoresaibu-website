# Deploy — Solution-First 5.0

Date: 16 August 2026

## Positioning decision

Moyosore is positioned as a commercial growth and execution problem solver. Employer names and job titles are retained as evidence in Experience, Evidence and case studies, not as the primary identity or homepage promise.

## Deploy once

Overlay the contents of the deploy package onto the existing `moyosoresaibu-website` repository root, preserving paths.

Do **not** delete the existing `/functions/` directory or Cloudflare Worker configuration. This release intentionally does not replace the contact backend.

Suggested commit message:

`Reposition website around solutions and problem solving`

## What changed

- Home leads with the visitor's commercial problem, not a job title.
- Main navigation uses **Solutions** for `/projects`.
- About explains the repeatable problem-solving pattern before employment history.
- Solutions maps four problem areas: sales execution, customer growth, route-to-market, and decision systems.
- Experience is explicitly framed as evidence behind the capability.
- Contact starts with “Bring me the problem” and asks for context before a service choice.
- Start page routes visitors by problem, not by biography or workplace.
- Person structured data no longer declares a current employer/job title as the defining identity.
- Existing proof, case studies, CV, evidence system, responsive imagery, contact endpoint and lightweight static architecture are preserved.

## Production checks

After Cloudflare reports a successful deployment:

1. Open `/`, `/projects`, `/about`, `/experience`, `/contact`, `/start/`, `/insights/` on desktop and mobile.
2. Confirm the homepage headline is: `I help turn commercial problems into clear growth moves.`
3. Confirm the primary navigation reads: Home → Solutions → About → Experience → Insights → Contact.
4. Submit a controlled contact-form test and verify delivery.
5. Open all four Solution anchors on `/projects`.
6. Verify CV and evidence downloads.
7. Run Lighthouse/PageSpeed on production after CDN caching is active.
8. Confirm `/functions/` and the existing Cloudflare Worker remain unchanged.
