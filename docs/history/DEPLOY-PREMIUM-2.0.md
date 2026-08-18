# Premium 2.0 deployment

This is a one-time full-site upload package.

## Main changes
- transparent glass UI used selectively on navigation, proof, cards and key panels
- no hand-drawn arrows or hand-drawn underline motifs
- interactive proof explorer on Home and Start
- safe real-time Nigeria time with a readable no-JS fallback
- current public role and latest-note context checked against the live site on 13 Aug 2026
- simple beginner-first structure and plain English
- reduced motion and reduced transparency support

## Deploy
1. Extract the ZIP.
2. GitHub → Add file → Upload files.
3. Upload the extracted contents into the repository root.
4. Commit to `main` with: `Launch premium clarity 2.0`.
5. Wait for Cloudflare production deployment to succeed.
6. Hard refresh `/` and `/start/`.

## Verify
- no `Checking…`
- no `--:--`
- no Sound control
- no hand-drawn accents
- Home and Start show a glass current-context strip
- Nigeria time updates after page load but has a valid fallback before JavaScript
- proof tabs work with mouse, touch and keyboard
- CV, case studies, Insights, contact and social links still work
