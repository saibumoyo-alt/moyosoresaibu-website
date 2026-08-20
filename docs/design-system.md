# Design system

The source of truth is `assets/site.css` — every value below is a real
token already in the single `:root` block at the top of that file (or a
documented convention layered on top of it). This file is a reading guide,
not a duplicate spec: if the two ever disagree, `site.css` is correct and
this file needs updating in the same commit.

## Why a design system at all

One stylesheet serves every page (no build step, no component framework —
see `README.md`). The only thing that keeps 20+ hand-written HTML files
looking like one product is discipline: reuse the tokens and the named
patterns below instead of hand-rolling a new value or a new card shape per
page.

## Color

Near-monochrome ground, one accent, used sparingly:

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f4f5f0` | Page background |
| `--surface` / `--surface-soft` | `#ffffff` / `#eef0e9` | Cards, alternating section backgrounds |
| `--ink` / `--muted` | `#11130f` / `#5d6259` | Primary text / secondary text |
| `--line` | `rgba(18,19,15,.10)` | Hairline borders |
| `--accent` / `--accent-ink` | `#c8f74a` / `#182000` | The one accent — primary-button hover, CTA-panel button, focus states. Never a body-text color. |
| `--dark` / `--dark-muted` | `#11130f` / `#c8cbc1` | Dark CTA panels (`.cta-panel`, `.premium-cta`) |

## Typography

System-first stack (`Inter, ui-sans-serif, system-ui…` — no webfont
network request). Scale is fluid (`clamp()`), not fixed pixel steps:

- `h1` — `clamp(3.35rem, 14vw, 7.2rem)`, weight 800, tight tracking
  (`-.065em` on the premium hero variant). One glance, one idea.
- `h2` — `clamp(2rem, 7vw, 4.25rem)`, weight 790.
- `h3` — `1.35rem`, used for card/panel titles.
- Body — `1rem`/`1.05rem`, `line-height:1.65`, `color:var(--muted)` for
  anything secondary.
- Eyebrows/kickers — `.72–.78rem`, `font-weight:800`, uppercase,
  `letter-spacing:.08–.1em`. Always precede a heading, never stand alone.

Headlines carry the meaning; body copy explains only what the headline
couldn't. See `CONTENT RULE` in project history for the scanning-first
writing rule this scale exists to serve.

## Spacing & grid

- `.shell` — the one page-width container, `min(100% - Xpx, 1160px)`,
  responsive gutter (28px mobile → 72px desktop).
- `.section` — vertical rhythm unit, `clamp(84px,9vw,118px)` top/bottom.
- Grids are CSS Grid with `repeat(auto-fit, minmax(…))` or explicit
  breakpoint column counts — never a 12-column framework.

## Radius scale

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 16px | Small chips, compact cards |
| `--radius` | 24px | Standard cards |
| Ad hoc 26–34px | | Premium cards, CTA panels, the name-gate card — anything meant to read as a single deliberate "object" gets a slightly larger radius than a plain content card. |

## Elevation, glass & blur

Glass is a *reserved* surface, not a global effect — see the comment at
the top of `site.css`. It is used for:

- the sticky header and section-nav (real scroll state to communicate)
- the hero photo frame/label (real depth)
- floating controls: language switcher, live-status chip, mobile sticky CTA
- interactive panels that need separation from the page: proof explorer,
  cat-switch panels, nav dropdown/mega-menu panels, the name gate

Everything else — plain content cards, metric grids, article rows — is a
**flat surface**: white/near-white background, a 1px `--line` border and
one soft shadow (`--shadow` or `--premium-shadow`). Content must stay easy
to read; glass supports the interface, it doesn't decorate it.

| Token | Value |
|---|---|
| `--shadow` | `0 18px 55px rgba(17,19,15,.07)` |
| `--premium-shadow` | `0 24px 80px rgba(25,30,20,.08), inset 0 1px 0 rgba(255,255,255,.88)` |
| `--glass-blur` | 18px (header/nav), 16–28px on floating controls |

## Motion

Four tiers, one curve pair — extend the scale, never hardcode a new
duration/ease inline:

| Token | Value | Use |
|---|---|---|
| `--ease-standard` | `cubic-bezier(.2,.7,.3,1)` | Default |
| `--ease-emphasis` | `cubic-bezier(.22,1,.36,1)` | Reveals, the name gate, the mobile sticky CTA slide-in |
| `--duration-fast` | .2s | Tier 1 — nav/button/chip hover-focus |
| `--duration-standard` | .25s | Tier 2 — card/tab/chip state change |
| `--duration-reveal` | .55s | Tier 3 — scroll reveal |
| `--duration-slow` | .9s | Tier 4 — one-time premium emphasis only |

Every animated rule is wrapped by `@media (prefers-reduced-motion: reduce)`
— scroll-snap, reveal animation, magnetic buttons and the mobile sticky
CTA's slide-in transition all fall back to instant/static. Nothing content
depends on motion to appear.

## Buttons

- `.btn` — primary, filled `--ink`, hover → filled `--accent`. One per
  screen should be visually dominant; secondary actions use `.btn.secondary`
  (outline) or `.btn.ghost-on-dark` (on dark CTA panels).
- `.is-magnetic` — desktop-pointer-only micro-pull toward the cursor,
  applied only to the highest-intent buttons (header CTA, hero actions,
  CTA-panel buttons) — reinforcing the one primary action, not decorating
  every button on the page.

## Cards

- `.card` / `.premium-card` — the default flat content card.
- `.metric` — proof/stat card; the flagship number can carry a
  `.metric-mark` + `.ink-circle` hand-drawn accent (see Human touch below) —
  reserved for the single strongest, evidence-linked number per grid, never
  applied to every card in a set.
- `.choice-card` / `.scan-card` / `.cat-panel` — interactive selection
  cards (category switcher, growth diagram panels).

## Navigation

- Desktop: `.desktop-nav` with plain links plus `<details class="nav-dropdown">`
  mega-menu-lite panels for anything with sub-structure (Solutions,
  Insights, Contact). Every dropdown panel carries a real destination for
  each link — no dead-end labels — and at least one clear call to action.
- Mobile: a single `<details class="mobile-menu">` full-panel menu with
  nested `<details class="submenu">` for the same groupings. Built on
  native `<details>`/`<summary>` on purpose — it works with zero JS;
  `site.js` only adds outside-click-to-close and mutual-exclusivity polish.
- `qa_audit.py` enforces the exact nav link set/order on every indexable
  page — update `EXPECTED_NAV`/`EXPECTED_DROPDOWN_LINKS` in the same commit
  as any real nav change.

## Human touch

Two accents only, both scoped to the homepage, both progressive (inline
`<svg>`, no font/network dependency, `aria-hidden`):

- `.ink-underline` — a hand-jittered wavy underline under one word in the
  hero headline.
- `.ink-circle` (inside `.metric-mark`) — an imperfect hand-drawn circle
  around the single flagship proof number.

Deliberately rare. The brief for these is "controlled and premium," not
"decorative" — resist the urge to add a third.

## Personalization

First-name capture (`site.js`, `setupNameGate`) is local-only
(`localStorage`, nothing sent anywhere) and drives every
`[data-visitor-name]` / `[data-visitor-greeting]` pair on the page. Used in
exactly three places on the homepage — the hero greeting, one line in the
proof section, one line in the final CTA panel — on purpose: personalize
the headline, a results moment and the CTA, not every heading on the page.

## Breakpoints

`480px`, `640/650px`, `719/720px`, `760px`, `900px`, `959/960px`,
`1100px`. `720px` and `960px` are the two load-bearing breakpoints (tablet
and desktop-nav cutover); the rest are local fixes for specific
components — check the surrounding comment before adding a new one.

## Accessibility baseline

- `:focus-visible` gets a real 3px outline everywhere, no exceptions.
- Every interactive target is ≥44×44px (see the "8.1 audit" section of
  `site.css` for the checkbox/consent-row fix that enforces this).
- `prefers-reduced-motion` and `prefers-reduced-transparency` both have a
  full fallback pass — motion off means static, not missing; glass off
  means solid, not missing.
- Progressive enhancement throughout: name gate, category switcher, proof
  explorer, mobile sticky CTA — every one of these still leaves the
  underlying content fully visible and usable with JavaScript disabled.
