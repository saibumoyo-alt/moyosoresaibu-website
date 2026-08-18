# Deploy V9.2 — additive checkpoint

V9.2 layers on top of the existing repository. Do **not** delete the V8.2/V9/V9.1 assets, functions, case studies, insights, evidence, contact Worker, or current image/audio assets.

## Replace
- `/index.html`
- `/start/index.html`
- `/VERSION` if you keep it in the repo

## Add
- `/assets/v92-experience.css`
- `/assets/v92-experience.js`
- `/start/assets/v92-start.css`
- `/start/assets/v92-start.js`
- `/REFERENCE-STUDY-V9.2.md` (optional documentation)
- `/V9.2-CHANGELOG.md` (optional documentation)

## Keep everything else
The new HTML still references the existing V8.2, V9 and V9.1 assets. This is intentional: V9.2 compounds rather than replaces.

## Test after Cloudflare deploy
1. `/` loads and hero proof, sound, menus and existing contact links still work.
2. Decision Router works with keyboard and does not submit/reload the page.
3. GitHub freshness gracefully falls back if API rate-limited.
4. Scenario tabs work with click + arrow keys.
5. `/start/` Route Me reacts to choices and source query parameters.
6. `/start/?source=instagram` defaults to the learning route.
7. Reduced-motion mode removes nonessential movement.
8. Test 320 / 375 / 390 px widths for horizontal overflow.
9. Re-run Lighthouse/PageSpeed after production deployment.

## Suggested commit
`V9.2 realtime signal system — additive` 
