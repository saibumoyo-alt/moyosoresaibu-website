# MOYO Design System

Single source of truth for tokens and component rules. If a new component
needs a value this file doesn't define, add the token here first — don't
hand-pick a one-off pixel/color/shadow in a page file.

All tokens live in `assets/site.css`, in the single `:root` block at the
top of the file. This document explains *why* each scale exists and how to
use it; it does not duplicate the raw values (read the CSS for those).

## Principles

- **Restraint over decoration.** Every effect must reveal hierarchy,
  confirm an interaction, or improve spatial understanding. If it doesn't
  do one of those, it doesn't ship.
- **Vanilla, static, fast.** No framework, no bundler, no animation
  library. Cloudflare Pages serves plain HTML/CSS/JS. Keep it that way —
  it's why this site is fast by default.
- **Progressive enhancement everywhere.** Every interactive feature (tabs,
  filters, personalization, the problem-selector) must leave the page
  fully readable and navigable with JS off. JS only ever adds behavior on
  top of content that already works.
- **One token, many call sites.** A shadow, radius, spacing value or
  duration used in more than one place is a token, not a repeated literal.

## Typography

Two scales stacked on `Inter`:

- **Display scale** (`--text-display-1/2/3`) — hero headlines and the
  biggest section headings. Always `clamp()`, always tight
  `letter-spacing`, always `font-weight` 780–800.
- **Body scale** (`--text-body-lg/base/sm/xs`) — everything else:
  supporting copy, card text, labels, meta.

Existing per-context heading rules (`.hero-premium h1`, `.page-hero h1`,
`.section-head h2`, `.article-title`, …) are **not** being collapsed into
these tokens in one pass — that's a real visual-regression risk across 20
pages I can't re-verify by eye in a single change. New headline work
should reach for the scale tokens; existing rules keep their current
hand-tuned `clamp()` values until they're touched for another reason.

## Spacing

An 8px-rooted scale, `--space-1` (4px) through `--space-12` (96px). Use it
for new gap/padding/margin values. Existing hardcoded spacing (14px, 18px,
22px, 26px, 30px…) mostly already lands close to this rhythm by hand — no
mass find-replace, but anything within 2px of a token should snap to it
next time that rule is touched.

## Radius

`--radius-xs` (12px) → `--radius-pill` (999px), five steps. `--radius-sm`
and `--radius` (the two tokens that already existed) are kept as aliases
for `--radius-sm` / `--radius-md` so nothing already using them breaks.

## Elevation

Four shadow levels, `--elevation-1` (resting, barely-there) through
`--elevation-4` (dialog/modal, the strongest shadow on the site).
`--shadow` and `--premium-shadow` (pre-existing) alias to `--elevation-2`
and `--elevation-3` for backward compatibility.

## Glass

Three restrained levels — this is the one place §29's rule ("glass must
feel physical and integrated, not everywhere") is enforced structurally
rather than by convention:

- **`--glass-1`** — nav bars, sticky surfaces. Barely-there blur, mostly
  opaque.
- **`--glass-2`** — floating controls: the language control, the
  personalization dialog.
- **`--glass-3`** — the hero photo frame only. The strongest blur on the
  site, reserved for the one place depth actually reads as premium rather
  than decorative.

Content cards (`.card`, `.premium-card`, `.choice-card`, etc.) stay flat
surfaces with a border + `--elevation-1/2`, as documented in the existing
`.premium-card` comment in `site.css` — that decision predates this
document and still holds.

## Motion

Documented in `site.css` next to the tokens (added in v8.6). Four
interaction tiers (`--motion-instant/fast/base/slow`) plus the pre-existing
four-tier scroll/reveal scale (`--duration-fast/standard/reveal/slow`) —
these are deliberately two different scales: interaction feedback and
scroll-reveal timing are not the same thing and shouldn't share a token.

## Buttons

- **Primary** (`.btn`) — one per screen, ever. Solid ink, lime on hover.
- **Secondary** (`.btn.secondary`) — outline, lower commitment.
- **Ghost-on-dark** (`.btn.ghost-on-dark`) — secondary action inside a
  dark CTA panel.
- **Text link** (`.text-link`, `.card-link`, `.proof-link`) — lowest
  commitment, in-flow navigation.

New CTA copy follows the site's existing rule: name the action
(`Solve your problem`, `See the proof`), never `Learn More`.

## Card hierarchy (documented, not yet consolidated)

The intended hierarchy — for new components to follow — is:

1. **Metric** (`.metric`) — one number, one line of context, evidence link.
2. **Choice/Scan** (`.choice-card`, `.scan-card`) — the primary clickable
   tile: problem routes, service categories.
3. **Feature** (`.case-feature`) — case-study preview cards, media-forward.
4. **Standard** (`.card`) — generic content card, lowest visual weight.

The ~15 existing near-duplicate card classes are a known consolidation
debt (see the Phase 1 audit) — not resolved here to avoid a
whole-site visual-regression risk in one pass. New card-shaped components
should reuse one of the four above rather than add a fifth variant.

## Breakpoints

`360 / 480 / 640 / 720 / 768 / 960 / 1100 / 1280` — informal (no CSS custom
properties in media queries; the platform doesn't support that), but this
is the fixed set. Don't introduce a new breakpoint value without a reason.

## Interactive states

- Focus: `:focus-visible` outline, 3px solid, 4px offset — sitewide,
  never removed.
- Touch targets: 44×44px minimum, enforced already for form controls and
  redirect links.
- Reduced motion: every animation/transition system in this codebase
  checks `prefers-reduced-motion` **before** attaching a listener, not
  just visually — see `site.js`'s `reducedMotion` constant, computed once
  and reused everywhere.
