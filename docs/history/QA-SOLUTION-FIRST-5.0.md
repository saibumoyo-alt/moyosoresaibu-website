# QA — Solution-First 5.0

Date: 16 August 2026

## Static checks

- 26 HTML files parsed.
- 0 duplicate IDs.
- 0 missing local static assets in HTML references.
- JSON-LD parses.
- CSS brace balance passes.
- `assets/site.js` passes `node --check`.
- Four solution anchors exist on `/projects`.
- Core Home/About/Start metadata no longer describes Moyosore by a Guinness job title.
- Existing contact endpoint is preserved.
- Contact intent values remain compatible with the previous form vocabulary (`challenge`, `hiring`, `collaboration`, `general`).

## Positioning checks

- Home promise starts with the commercial problem and desired movement.
- Employer context is retained in evidence/experience/case-study contexts.
- About makes the repeatable problem-solving pattern primary.
- Solutions page starts with problems and symptoms before case studies.
- Contact asks for goal, friction, attempts and context before prescribing a service.
- Start page routes by visitor problem.

## Production-only checks

Production Lighthouse/Core Web Vitals, Cloudflare caching, Worker delivery and Search Console behavior must be verified after deployment.
