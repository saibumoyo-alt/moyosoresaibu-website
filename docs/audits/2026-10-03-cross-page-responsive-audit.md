# Cross-page responsive layout audit — 3 October 2026

## Scope

Reviewed the new full-page captures for Home, Solutions, Experience, Insights,
Approach and Contact against the current shared CSS, page markup, design-system
rules and QA gates. Also rechecked the Growth and Retention system layouts,
Evidence patterns, contact flow, analytics endpoint and security headers.

## Critical findings

1. A shared `mini-proof-grid` class was being forced to four columns even on
   Experience, where it has only three items. This was a regression introduced
   by the previous homepage-specific fix being scoped too broadly.
2. The Solutions selected-work section has three cards but still used the
   generic two-column case-study grid, leaving an orphan third card.
3. The Approach page's Better decisions section has three cards but used the
   generic two-column standard-card grid, again leaving an orphan card.
4. The 1160px composition shell was conservative on modern wide desktops.
   Reading widths were already separately constrained, so the card canvas could
   be widened without damaging paragraph readability.
5. The supplied captures appear to be taken at a substantially reduced browser
   zoom or scaled capture. The site should not use CSS transforms or forced
   zooming to compensate for browser zoom; doing so would work against
   accessibility. Real layout defects were fixed independently of that capture
   scale.

## Changes in 8.20.0

- Increased the shared composition shell from 1160px to 1280px.
- Replaced ambiguous proof-grid behaviour with explicit `three-up` and
  `four-up` modifiers.
- Home proof/context cards explicitly use four tracks on wide screens.
- Experience work-area cards explicitly use three tracks and use a calmer
  context-heading type scale.
- Solutions selected work explicitly uses a three-card composition.
- Approach Better decisions explicitly uses a three-card composition.
- Kept one-column mobile and two-column tablet reflow for fixed-count groups.
- Preserved reading-width caps, semantic source order, touch targets,
  reduced-motion handling, and the existing progressive-enhancement model.
- Added regression checks for each cross-page count-aware layout and the
  desktop-shell token.

## Competitor / best-practice comparison

Wes Kao's current site is compact and credibility-led; April Dunford's current
site makes the service promise and direct action obvious. The useful pattern is
not their visual treatment but their discipline: a clear proposition, bounded
reading measure, and supporting content that uses available desktop space
without diluting the primary message.

NN/g's wide-screen guidance notes that fixed narrow layouts can waste useful
space on modern displays, while web.dev recommends fluid responsive layouts
with constrained text measure. This release follows that split: wider
composition, unchanged reading-width constraints.

## Remaining boundaries

- The external contact-mailer Worker is not in this repository, so its internal
  mail-delivery controls, secrets and provider telemetry remain outside this
  audit.
- CSP still permits inline styles because legacy inline declarations remain.
  Tightening that policy should be a separate migration.
- Repository CI validates structure, accessibility basics, metadata, internal
  links, security regressions and layout selectors, but it is not a pixel-diff
  browser/device suite.
