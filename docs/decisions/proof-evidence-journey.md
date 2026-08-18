# Decision: how Proof and Evidence relate

**Date:** 2026-08-18
**Pages:** `/experience` (nav label "Proof"), `/evidence` (not in nav)

## The constraint

Keep the six-item nav. Don't add a 7th item for `/evidence`. `/experience`
must genuinely deliver proof when a visitor clicks "Proof" — not just point
elsewhere.

## What was actually there

On inspection, `/experience` was already closer to right than the Phase 1
audit gave it credit for: metrics sit right under the hero, each one links
straight to its `/evidence#anchor`, work history is positioned *second* (not
first, not led with an employer name), and the page ends with an explicit
"Need proof first? Read evidence." CTA. The real gap was narrower than
"two disconnected pages" — it was that a visitor who never clicks through
never sees the trust policy itself (the "I don't present self-published
metrics as audited fact" line lived only on `/evidence`), and the
relationship between the two pages was implicit rather than stated.

## What changed

1. `/experience`'s hero now states the evidence policy directly, in one
   sentence, instead of requiring a click to `/evidence` to find it: "Every
   number below links to its source — what's public, what's not, and why.
   Nothing here is presented as an independently audited fact."
2. `/evidence`'s hero now links back to `/experience` ("For the roles and
   results these numbers come from, see Proof"), closing the loop so the
   two pages read as one journey instead of one page and an orphan.

Everything else on both pages — the sourced metric cards, the work-history
timeline, the single verified testimonial, the per-claim context/basis/limit
breakdown — is unchanged. This was a coherence fix, not a rebuild: the
underlying content and trust discipline were already good and are preserved
exactly.

Work history stays positioned as supporting context (dates, titles,
locations only — no employer branding, no logos), consistent with "don't
make the site employer-centric."
