# Solution-First 5.1 — Social Trust + Language

## Added
- Premium floating language control on every page that loads the shared site script.
- Chrome built-in Translator API path when supported; local translation preserves page structure.
- External translation fallback for unsupported/mobile browsers.
- English restore, remembered language and RTL handling.
- Languages surfaced: English, Yoruba, French, Portuguese, Swahili, Hausa, Spanish, German, Arabic and Simplified Chinese.
- LinkedIn recommendation trust section on Home with verified source link and a strict no-invented-testimonials standard.
- Direct WhatsApp/Telegram contact component on Contact. It remains hidden until verified account details are configured.
- No WhatsApp/Telegram tracking SDKs or embeds are added.

## Data still required before direct-channel launch
- WhatsApp number in international format, digits only (example: 2348012345678).
- Telegram username (without @).
- Exact LinkedIn recommendation text/screenshots + recommender names/roles if recommendation quotes should appear directly on the site.

## Why channels are hidden until verified
The site must never publish guessed personal contact details. Once the two handles are supplied, set `siteChannels.whatsapp` and `siteChannels.telegram` near the bottom of `/assets/site.js`.
