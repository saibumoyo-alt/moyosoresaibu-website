# Deploy — Moyosore Apple-Mechanics Upgrade

This package is an overlay for the existing `moyosoresaibu-website` Cloudflare Pages repository.

## Upload / replace
Upload the contents of the deploy ZIP to the repository root, preserving folders. Commit to `main` so Cloudflare Pages deploys the update.

Important paths:
- `/index.html`
- `/start/index.html`
- `/experience.html`
- `/evidence.html`
- `/assets/site.css`
- `/assets/site.js`
- the other shared top-level pages and assets included in the ZIP

Keep the repository's existing individual Insight article files, Cloudflare Worker configuration and any files not replaced by this package.

## Production checks
After Cloudflare reports a successful deployment, test these in an incognito browser and on a real phone:

1. `/` — hero, local jump bar, cited result links, audience-fit routes, before/after example, case studies, writing and Contact.
2. `/start/` — local jump bar, four simple routes, cited proof and mobile horizontal navigation.
3. `/experience` — local jump bar, CV download, cited result links and case-study routes.
4. `/evidence#retention`, `/evidence#ranking`, `/evidence#tenure`, `/evidence#creator` — each anchor lands on the correct evidence item.
5. Disable JavaScript and reload Home: identity, navigation, result sources, both before/after states and all links must remain usable.
6. Enable reduced motion: the before/after example must not animate.
7. Test 320px, 375px, 390px, tablet and desktop widths. The local navigation should scroll horizontally on narrow screens without forcing horizontal page overflow.
8. Test the Field Notes form and Contact form.
9. Run Lighthouse / PageSpeed mobile after Cloudflare caching is active.

## Acceptance standard
A new visitor should understand within seconds:
- who Moyosore is,
- what he does,
- proof of the work,
- which part of the site is relevant to them,
- what to do next.

No part of that first understanding depends on a live API or a successful JavaScript request.
