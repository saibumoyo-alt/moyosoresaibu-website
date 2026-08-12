# Moyosore Saibu Website — Recruiter, Proof, Field Notes & Case Study Upgrade

This release is built on the clean minimal master website. It adds the missing high-value pieces without bringing back the old clutter.

## What changed

### Home
- No Public Site Pulse, no live clock, no `Checking…`, no placeholder state.
- Added a **For recruiters and employers** snapshot with a direct CV download and Experience link.
- Kept commercial proof separate from creator reach: the main proof grid is commercial/career proof; the 4.8M+ Instagram result is shown with social media as creator proof.
- Added two real case-study routes.
- Added public recognition / LinkedIn verification instead of inventing testimonials.
- Added one optional **Field Notes** email form below the writing section.

### Start landing page
- Remains simple and social-first.
- Added a compact recruiter route with Experience + CV download.
- No quiz, no live clock, no live API, no hidden content that depends on JavaScript.

### Experience
- Keeps the existing clean CV/evidence actions.
- Adds public recognition and two direct case-study links.
- Simplifies role descriptions into plain English.

### Projects / case studies
- Projects now leads to two detailed case studies:
  - `/case-studies/route-remapping-retention`
  - `/case-studies/bold-loud-customer-development`
- Each case uses: Situation → What I did → Result → What I learned → Evidence limit.
- Legacy case-study URLs for trade activation / Abacha Festival redirect to `/projects` so an older design is not left live by accident.

### Insights / email capture
- Added the optional Field Notes signup back to `/insights/`.
- Uses the existing tested Cloudflare contact Worker path.
- Signup is never required to read anything.
- Email fallback is included if the form cannot send.

### Contact
- Explains which topics are welcome.
- Explains what information is useful to send.
- Sets a clear service expectation: Moyosore aims to reply within two working days when a response is needed.
- Adds optional Organisation / Company field.

### Testimonials / third-party proof
No manager, colleague or customer quote was published because no verified endorsement with permission was available in the working source. The public website uses employer recognition, LinkedIn and evidence notes instead of fabricating quotes.

`ENDORSEMENTS-INTAKE.md` is an internal guide for collecting future verified quotes. Do **not** publish that file.

## Upload / replace

Overlay the deploy package onto the current GitHub repository. Do not delete the existing individual insight article files or Cloudflare Worker configuration.

Replace / add:
- `/index.html`
- `/start/index.html`
- `/about.html`
- `/experience.html`
- `/projects.html`
- `/insights/index.html`
- `/contact.html`
- `/evidence.html`
- `/privacy.html`
- `/404.html`
- `/case-studies/route-remapping-retention.html`
- `/case-studies/bold-loud-customer-development.html`
- `/assets/site.css`
- `/assets/site.js`
- `/assets/downloads/moyosore-saibu-cv.pdf`
- `/assets/downloads/moyosore-saibu-evidence-methodology.pdf`
- `/_redirects`
- `/_headers`
- `/sitemap.xml`
- `/robots.txt`
- `/llms.txt`
- `/site.webmanifest`
- portrait / icon / OG assets included in the package

## Production acceptance test

After Cloudflare deploys the commit, test in an incognito browser and on a real phone:

1. Home opens without `Checking…`, `--:--`, sound controls or live placeholders.
2. Recruiter snapshot appears after Selected Results.
3. CV download opens the current executive CV.
4. Both new case-study pages load from their clean URLs.
5. Field Notes form succeeds on Home and Insights; fallback email remains visible.
6. Contact form succeeds and the Organisation field reaches the Worker email.
7. Navigation works at 320px, 375px, 390px and desktop widths.
8. Run Lighthouse / PageSpeed on the deployed Home, Start and Contact pages after Cloudflare caching is active.

## Important

The site remains useful with JavaScript disabled. JavaScript is only used to enhance form submission. Core identity, proof, CV link, case studies, writing and contact information are normal HTML.
