# Moyosore Saibu Website — V9 Experience Upgrade

This package is a **drop-in upgrade layer** for the existing `moyosoresaibu-website` Cloudflare Pages repository. It strengthens the current V8.2 site without replacing the proven contact Worker, shared V8.2 stylesheet, shared script, existing evidence pages, case studies, insights, audio assets, or portrait asset set.

## What changed

### Main homepage (`/index.html`)
- Added a visible **Start Here** route for first-time/social visitors.
- Added a **3-move decision journey**: Notice → Decide → Execute.
- Added a **Two modes · one operator** interaction: Field Mode ↔ System Mode.
- Added an **original four-step operating process**: Understand → Choose → Execute → Review.
- Added a **live public freshness signal** based on the latest public GitHub commit, with a graceful fallback rather than fabricated live counters.
- Preserved the existing proof, intent routing, evidence links, insights, contact flow, sound control and V8.2 scripts.

### Start page (`/start/`)
- Keeps the warm editorial / handmade visual identity so it does not feel like a duplicate of the professional homepage.
- Adds a compact **Meet → Choose → Move** orientation rail.
- Adds a **Current ↔ Evergreen** interactive mode:
  - Current: current role, dated field note, live WAT and public site freshness.
  - Evergreen: Customers, Work, Money and Life.
- Adds a **Notice → Ask → Decide → Do → Review** operating loop.
- Keeps proof, latest thinking, tools, navigation and follow/contact CTAs.
- Uses accessible keyboard-operable tabs and respects `prefers-reduced-motion`.

### Discovery / AI / SEO
- `sitemap.xml` now includes `/start/`.
- `llms.txt` now identifies `/start/`, evidence, latest field notes and the distinction between the professional site and social-entry page.
- `_redirects` normalizes `/start` to `/start/`.

## Design lessons applied (not copied)

The upgrade uses original layouts, copy and implementation while applying strategic patterns observed in the three reference sites:

1. **Leedlime** — pain/benefit clarity, short process storytelling, freshness/status signals, proof close to the promise and a simple next action.
2. **Digital Original XR** — dual-mode interaction, immersive scroll narrative and a page that teaches by letting the visitor choose a mode.
3. **Hue & Code** — memorable positioning, a straight-line process, visible build quality/performance thinking, and stronger connection between proof and action.

No reference-site code, graphics, logos, imagery or proprietary copy is included.

## Files to upload / replace

Replace:
- `/index.html`
- `/sitemap.xml`
- `/llms.txt`

Add:
- `/assets/v9-enhancements.css`
- `/assets/v9-enhancements.js`
- `/start/index.html`
- `/start/assets/moyosore-saibu-portrait-960.jpg`
- `/_redirects`

## Important: keep these existing repository files

Do **not** delete your current:
- `/assets/styles.css`
- `/assets/script.js`
- `/assets/audio/…`
- `/assets/moyosore-saibu-portrait-*`
- `/functions/…`
- `/case-studies/…`
- `/insights/…`
- `/contact.html`, `/privacy.html`, `/evidence.html`, etc.

V9 intentionally layers on top of V8.2 so the existing email Worker and the rest of the site remain intact.

## GitHub → Cloudflare Pages deployment

1. Open the `saibumoyo-alt/moyosoresaibu-website` repository.
2. Upload the files above using their exact folder paths.
3. Commit to `main` with a message such as: `Launch V9 experience + Start page`.
4. Cloudflare Pages should deploy automatically from `main` as it does today.
5. After the deployment is green, verify:
   - `https://moyosoresaibu.com/`
   - `https://moyosoresaibu.com/start/`
   - `https://moyosoresaibu.com/sitemap.xml`
   - `https://moyosoresaibu.com/llms.txt`
6. Test mobile first, then desktop.

## Post-deploy checks

- Homepage Start Here link opens `/start/`.
- Field/System tabs work with click and left/right arrow keys.
- Current/Evergreen tabs work with click and left/right arrow keys.
- Sound is **off by default** and only activates after a user gesture.
- Contact form still sends successfully through the existing Worker.
- Latest public update either displays a relative GitHub update or a clean fallback.
- No horizontal overflow at 320px/375px/390px widths.
- Run PageSpeed/Lighthouse after the production deploy and compare Core Web Vitals with V8.2 before changing the existing critical image strategy.

## Version intent

V8.2 established professional authority. V9 makes that authority easier to *enter, understand and navigate* — especially from Instagram — while preserving the site's evidence-first professional core.
