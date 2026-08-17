# Decision: restore the two retired case studies

**Date:** 2026-08-17
**Pages:** `/case-studies/abacha-festival-activation`, `/case-studies/trade-activation-enugu`

## Prior state (contradictory, not chosen deliberately)

Both pages existed in full on disk with real content and `Article`/`BreadcrumbList`
schema, were excluded from `sitemap.xml`, and were simultaneously 301-redirected
away from their own canonical URL to `/projects` by `_redirects`. That is three
different "this page is retired / this page is live" signals disagreeing with
each other at once — not a real decision.

## Evaluation (against the four questions the owner asked)

1. **Do the claims remain valid?** Yes. "6,000+ attendees" (Abacha Festival) and
   "#1 Area/Division/Regional" (trade activation) are the same claims already
   published, honestly caveated, on the live `/evidence` page (`#festival` and
   `#ranking` anchors) and in the homepage proof strip. Nothing here is new or
   unverifiable that isn't already live elsewhere on the site.
2. **Is the evidence sufficient?** Yes, by the site's own standard — each page
   states the claim, its public basis, and its limit ("not an independently
   audited footfall study" / "internal scorecard details are not published"),
   matching the evidence-methodology pattern used everywhere else.
3. **Do they support the current solution-provider positioning?** Only after
   rebuilding. The old files were a fully different, superseded design
   generation: dark theme, old nav labels (About/Experience/Projects instead
   of Approach/Proof/Solutions), `.html` URLs in every internal link and in
   their own canonical tag, a `sound-control` button and an `<audio>` element
   for the ambient score (a feature the current site explicitly removed), and
   `assets/styles.css` (the second, unused stylesheet) instead of the live
   `assets/site.css`. Restored as-is, they would look and behave like a
   different, broken site.
4. **Do they still provide genuine visitor value?** Yes — short, honest,
   Situation → What I did → Result → What I learned case studies are exactly
   the "problem → role → action → result" structure the site's own README
   commits to, and they're real supporting proof for the "solution provider"
   positioning, not filler.

**Conclusion: restore, rebuilt on the current template — not deleted, not
brought back verbatim.**

## What changed

- Both pages rewritten against the current `assets/site.css`/`assets/site.js`,
  current shared header/nav/footer, current Person/WebSite JSON-LD pattern,
  extensionless self-referencing canonical URLs, and the current four-part
  case-study structure (matching `case-studies/route-remapping-retention.html`).
  No audio, no sound control, no dark theme — consistent with every other
  live page.
- `_redirects`: the two `/case-studies/... 301 → /projects` rules (which
  redirected the pages away from themselves) were replaced with the normal
  `.html → extensionless` legacy-URL redirects used by every other page. The
  two root-level legacy paths (`/abacha-festival-activation.html`,
  `/trade-activation-enugu.html`) now redirect to the restored pages instead
  of to `/projects`.
- `sitemap.xml`: both URLs added.
- `projects.html`: both case studies added to the case-proof grid (previously
  only 2 of what are now 4 real case studies were listed there).
- The two root-level meta-refresh stub files (`abacha-festival-activation.html`,
  `trade-activation-enugu.html`) were deleted — confirmed via repo-wide grep
  that nothing links to them, and `_redirects` already serves the same paths
  server-side, so the stub files were pure redundant duplication, not a
  fallback anything depended on.

Verified locally (wrangler pages dev + Lighthouse + Playwright): both pages
load at 200, both legacy `.html` paths 301 to the right place, both score
100/100 on Accessibility/Best-Practices/SEO, and `/projects` renders all four
case-study cards without layout issues at 390/768/1440px.
