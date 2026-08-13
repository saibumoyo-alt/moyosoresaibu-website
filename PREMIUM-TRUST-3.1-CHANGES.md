# Premium Trust 3.1 - Changes

This build folds the external audit into the existing Premium Clarity site without reintroducing clutter.

## URL and SEO consistency
- Public internal links use extensionless canonical routes such as `/about`, `/experience`, `/projects`, `/contact`.
- Legacy `.html` URLs remain covered by 301 redirects in `_redirects`.
- Canonical tags use the clean URL scheme.

## Audio
- No audio element, autoplay attribute, sound control, ambient score, or audio runtime dependency exists in this deploy package.

## Recruiter and client clarity
- Home now states the kinds of professional conversations that are a good fit.
- Added quick links for Experience, CV, one-page profile, Evidence, and LinkedIn.
- About adds a plain-English "Where I can be useful" section.
- Contact makes good enquiry types explicit.

## Portfolio proof
- Projects now use a clearer structure: Situation -> My role -> Action -> Result.
- Existing detailed case studies remain linked.
- Added a downloadable one-page professional profile alongside the CV.

## Insights discovery
- Added local search.
- Added topic filters: All, Sales, Customers, Execution, Routes.
- Added visible topic labels to each note.
- All notes remain visible if JavaScript is disabled.

## Field Notes and contact UX
- Existing Cloudflare Worker integration remains unchanged.
- Success feedback remains in-page and accessible with aria-live.
- Fallback wording is now neutral ("Prefer email?") rather than implying the form is unreliable.

## Testimonials
- No fake testimonial, "coming soon" placeholder, or unverified third-party quote was added.
- Trust is supported with evidence notes, CV, one-page profile, and LinkedIn instead.
