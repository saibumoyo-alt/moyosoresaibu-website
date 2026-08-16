# QA — Solution-First 5.2 Direct Trust

Date: 16 August 2026

## Static checks
- 26 HTML files parsed.
- 0 duplicate ID errors.
- 0 missing local asset references in audited HTML.
- JSON-LD parses across all pages.
- `assets/site.js` passes `node --check`.
- WhatsApp config: `2348134256221`.
- Telegram config: `moyosoresaibu`.
- Contact direct-channel section has non-JavaScript-safe direct hrefs.
- WhatsApp/Telegram links added to global footers.
- Homepage recommendation card uses only source-visible facts.
- Evidence page includes `#linkedin-recommendation` source/method note.
- User-provided LinkedIn screenshot is not included in public deploy assets.
- Translation control from 5.1 remains active with cache-busted `site.css?v=5.2.0` and `site.js?v=5.2.0`.

## Trust rule
The supplied LinkedIn capture confirms a recommendation received from Isaiah Ajewole on 14 August 2026 and the relationship context. No substantive testimonial quote is visible, so none is invented or republished.

## Production checks after deploy
1. Open `/`, `/contact`, `/start/`, and `/evidence#linkedin-recommendation`.
2. Test WhatsApp on phone and desktop; confirm the chat target is +234 813 425 6221.
3. Test Telegram; confirm the target is @moyosoresaibu.
4. Test the Language control on desktop Chrome and on one unsupported/mobile browser.
5. Submit the contact form to confirm the existing Cloudflare Worker still works.
6. Run Lighthouse/PageSpeed after Cloudflare caching is active.
