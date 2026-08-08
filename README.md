# Moyosore Saibu Website — Premium V4 Sonic Edition

Official personal website of Moyosore Saibu.

## V3 highlights
- Native high-performance motion system (no heavy animation library)
- Cross-document View Transitions where supported
- Scroll reveal, count-up metrics, magnetic CTAs and portrait parallax
- `prefers-reduced-motion` and Save-Data fallbacks
- Responsive portrait sources and LCP preloading
- Enhanced Person, ProfilePage, WebSite and Article structured data
- Premium 1200×630 Open Graph cards
- PWA manifest and touch icons
- Updated sitemap, robots.txt and llms.txt
- Expanded career record and long-form field insights

## Deployment
Cloudflare Pages / GitHub. Static HTML, CSS and vanilla JS. No build step required.

## Domain
https://moyosoresaibu.com

## V3.2 master polish
- Tighter first-screen hero composition on tall desktop displays
- WebP responsive portrait delivery for faster LCP
- Exact career-role wording on homepage career signal
- Improved mobile menu keyboard/focus behavior
- Pause-on-hover/focus professional signal rail
- Cloudflare Pages security and caching headers
- Cache-busted CSS and JS (`v=3.1.0`)

## V3.2 master refinements
- Rebalanced desktop hero so the copy and portrait form one composition
- Hero positioning label is always visible on mobile
- Replaced vague "Commercial operator" wording with precise professional disciplines
- Current-focus wording now uses the actual role title
- Added edge fading to the moving expertise rail so words never appear harshly clipped
- Fine-tuned mobile hero type, spacing, and first-fold rhythm
- Cache-busted production assets to v3.2.0

## V4 Sonic Edition
- Original custom ambient music score generated specifically for the site
- Sound is strictly opt-in: no surprise autoplay
- Subtle Web Audio hover/click SFX after sound is enabled
- Live West Africa Time in the hero
- Progressive CSS view-driven animation where supported
- Fine-pointer card spotlights and refined portrait/proof-card motion
- Tactile film-grain surface texture
- Built-in lightweight LCP/CLS diagnostics via `?debug=1`
- No third-party animation or audio libraries

- Sound preference and playback position persist across same-session page navigation when browser policy allows it.
- Versioned music asset prevents stale audio caching.
- WebP avatar and About portrait reduce unnecessary image transfer.

## V4.1 Sonic audio fix
- Remastered ambient score to a stronger browser-friendly stereo MP3
- Raised restrained playback target from 16% to 42%
- Starts audio directly inside the tap/click gesture for stronger autoplay-policy compatibility
- Adds explicit loading/error states and user-visible audio failure diagnostics
- Cache-busted script and stylesheet to v4.1.0

## V4.2 Auto Sonic
- Removed the visible Sound control.
- Attempts audible ambient playback immediately on every page visit.
- If browser autoplay policy blocks it, the first tap/click/key interaction anywhere starts the soundtrack automatically.
- Interface SFX activate automatically after audio permission/user activation.
- Preserves playback position across same-session page navigation.
- Uses a lighter 128 kbps mastered MP3 for faster loading.
- Important: no website can force audible autoplay when the visitor's browser explicitly blocks it.
