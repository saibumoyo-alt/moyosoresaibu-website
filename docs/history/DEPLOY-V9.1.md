# Deploy V9.1

This package is an **additive upgrade** to the existing repository. Do not delete your current `assets/`, `insights/`, `case-studies/`, `functions/` or other existing files.

Upload/replace these files from the package root:

- `index.html`
- `assets/v91-experience.css`
- `assets/v91-experience.js`
- `start/index.html`
- `start/assets/v91-start.css`
- `start/assets/v91-start.js`

Keep the existing V8.2 and V9 assets because V9.1 intentionally layers on top of them.

After Cloudflare deploys, hard-refresh and verify:

1. Homepage hero shows **FIELD × SYSTEM**.
2. Below the hero appears the lime kinetic statement **READ THE SIGNAL. CHOOSE THE CONSTRAINT. MOVE THE MARKET.**
3. `/start/` shows **MEET → CHOOSE → MOVE** above the headline.
4. Hover/focus the five `/start/` doors and confirm the route preview changes.
5. Click Customers/Work/Money/Life in the People section and confirm the explanation changes.
6. Test keyboard navigation and `prefers-reduced-motion`.

No framework or external JavaScript dependency was added.
