# Deploy Premium Clarity 3.0 once

1. Back up the current GitHub repository.
2. Extract the deploy ZIP.
3. In GitHub, choose Add file → Upload files.
4. Upload the extracted contents directly into the repository root. Do not upload the outer folder.
5. Keep your existing `/functions/` directory and Cloudflare Worker configuration if they are not in this ZIP.
6. Commit directly to `main` with: `Launch Premium Clarity 3.0`.
7. Wait for Cloudflare Pages to show a successful Production deployment.
8. Hard refresh `/`, `/start/`, `/experience`, `/projects`, `/insights/`, `/contact` and `/evidence`.
9. Confirm there is no “On this page”, no `Checking…`, no `WAT --:--`, no Sound control and no old numbered chooser.
10. Test the proof tabs, latest-note live refresh, CV, evidence links and contact form.

The live Insights refresh is progressive. The page already contains a real static fallback, so a network failure never produces a broken placeholder.
