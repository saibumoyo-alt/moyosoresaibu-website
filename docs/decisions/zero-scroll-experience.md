# Decision: the zero-scroll panel system (v9.0.0)

**Date:** 2026-08-19
**Pages:** `/`, `/about`, `/projects`, `/experience`, `/growth-system`,
`/retention-system`, `/contact` — not `/evidence`, `/insights/`, `/start/`,
case studies or individual insight articles (see "What was deliberately
left out" below).

## The ask

Make the site feel like zero scrolling — the next thing to read or do
should already be on the screen the visitor is on, not several drags away.
Use real-time data. Keep the premium, minimal aesthetic already established.

## The approach

Every top-level `main>section` on the listed pages is now a full-viewport
panel. CSS scroll-snap (`scroll-snap-type:y proximity`) does the actual
mechanics and works with **zero JavaScript** — a visitor with JS off still
gets one section per screen and normal scrolling between them. `site.js`
layers on top of that pure-CSS baseline: a dot-rail (real `<a href="#id">`
anchors, so it's a working jump list even if the script fails after
building it), a "Next" affordance, arrow-key/Page-Up/Down navigation
(disabled while typing in a field), and active-panel tracking via
`IntersectionObserver`.

`proximity` was chosen over `mandatory` deliberately: mandatory scroll-snap
has a real accessibility cost (WCAG reflow concerns, and it fights a user
mid-scroll or while filling a form). Proximity snaps cleanly when a scroll
comes to rest near a panel boundary but never traps input.

A panel is sized with `min-height` (not `height`), so an unusually dense
panel simply keeps native scroll inside itself instead of clipping content.
That is a deliberate, honest trade-off: the common case is a true single
screen; the rare content-heavy exception (7 retention-lever cards, a
contact form) degrades to a small amount of native scroll rather than
losing content or looking broken.

The site's big editorial type (`h1` clamp up to 7.2rem) was built for pages
with no height budget. Zero-scroll gives the hero a real budget
(`100dvh - header height`), so the hero's type/photo/proof-strip scale was
rebuilt to blend `vh` into its `clamp()` growth term — it now shrinks with
viewport *height*, not just width, and the portrait is dropped below 640px
where there's no room left worth taking from the headline and the two CTAs.

## Real-time data

A small `live-status-chip` (bottom-left, mirroring the existing bottom-right
language switcher) shows Moyosore's actual local time in Lagos, computed
client-side from `Intl.DateTimeFormat` with `timeZone:'Africa/Lagos'`. No
fetch, no backend, never a stale "last updated" claim — it's exactly as live
as the visitor's own clock. It renders on every page, not just the
zero-scroll ones.

## What was deliberately left out

- **`/evidence`** — one section is a dense per-claim evidence trail (8
  items, each with context/basis/limit). Forcing that into panels would
  fragment a reference page that exists to be scanned and cross-checked,
  not stepped through.
- **`/insights/`** — the article index is a browsable/filterable list
  (search + topic pills already exist for that job). Paginating a list a
  visitor wants to scan works against the list, not with it.
- **`/start/`** — already has its own bespoke single-screen system
  (`.start-ui .start-hero` flex-spacer layout, shipped earlier). Adding the
  generic system on top would fight it.
- **Case studies and individual insight articles** — long-form reading
  content. A full-viewport panel per section would break paragraphs across
  arbitrary screen boundaries instead of letting people read.

These are the same "decision funnel vs. reference/reading" split the site
already draws elsewhere (e.g. `/experience` vs. `/evidence`, per
`proof-evidence-journey.md`) — zero-scroll applies to the pages whose job is
to move a visitor toward a decision, not to the pages whose job is to be
read carefully or searched.
