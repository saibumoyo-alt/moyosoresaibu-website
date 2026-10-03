# Visual hierarchy and responsive-layout audit — 3 October 2026

## Why this pass was needed

A current homepage screenshot showed three sections using generic grids with the
wrong number of tracks. The result was visible left-heavy composition, compressed
cards and unnecessary empty space even though the underlying content was sound.

## Findings and priority

1. **Selected work: 3 items in a 2-column grid.** The final card became an orphan
   row on wide screens.
2. **Work in context: 4 items inheriting a 5-column desktop proof grid.** This
   created an unused track and forced non-numeric labels into oversized,
   multi-line display typography.
3. **How I work: 4 items inheriting a 6-column process grid.** Two empty tracks
   compressed the four actual steps into only part of the available width.
4. **Very narrow mobile process grids remained two-up.** The layout technically
   reflowed but could feel cramped around 320–480 CSS pixels.
5. **Tablet recommendation layout stacked image over copy too early.** A row is
   clearer once enough width is available.
6. **Contact metadata still said Gmail after the visible channel had correctly
   been renamed Email.**

## Design comparison

Useful patterns were taken as principles, not copied. Wes Kao's site keeps the
core positioning and credibility compact, allowing proof to support rather than
overpower the page. Jeb Blount's site makes service categories and action paths
very explicit, but is substantially denser; this site benefits from keeping its
more restrained visual system.

## Changes in 8.19.0

- Added count-aware three-, four- and four-step homepage grid rules.
- Reduced proof-card typography to an appropriate label scale.
- Aligned proof-card evidence links to the bottom for a calmer card rhythm.
- Made fixed-count grid children explicitly shrinkable with `min-width:0`.
- Made 6-step growth flows single-column below 480px.
- Kept recommendation photo + copy side-by-side on tablets where room permits.
- Corrected contact metadata from Gmail to email.
- Added CI regression guards for these homepage layout modifiers.
- Documented count-aware grid rules in the design system.

## Verification target matrix

- 320px: one-column fixed-count content; no compressed process cards.
- 375/390px: comfortable one-column proof and selected-work cards.
- 768px: two-column selected-work/proof/process rhythm.
- 960px: three selected-work cards, four proof cards and four process cards use
  the full shell width.
- 1280/1440px: no unused fifth/sixth tracks in fixed-count homepage sections.
- 400% zoom: layouts preserve the same reflow intent as narrow CSS viewports.

## Remaining boundary

Repository QA can validate markup, selectors, links, metadata and regression
rules, but it is not a pixel-diff browser suite. Final visual confirmation on
real Safari/Chrome mobile devices remains useful after the hosting platform has
propagated the new main branch.
