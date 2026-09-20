---
name: reference-to-code-loop
description: >
  Drive the core feature-by-feature website-replication loop: explore ONE
  reference feature in the browser, understand its behavior/UI, implement that
  ONE feature locally, run the local version, perform the same interactions,
  compare against the reference, fix discrepancies, mark the feature complete,
  then move to the next feature. Use when replicating a website from a live
  reference, when told to "replicate", "clone", "build feature by feature",
  "reference-to-code", "feature loop", or when starting the website-replication
  workflow. Companion skills: website-reverse-engineering,
  browser-feature-discovery, ui-replication, visual-regression,
  responsive-replication, frontend-implementation.
---

# Reference-to-Code Loop

You are replicating a website by iterating ONE feature at a time against a live
reference. This loop is the operating rhythm. Do not jump ahead.

## Core rule

Work feature-by-feature. NEVER implement a large portion of the site based on
assumptions. A feature is not complete merely because the code compiles: it is
complete only when the local implementation behaves and looks like the
reference for the same interactions.

## The loop

For each feature:

1. **Pick ONE feature.** Break the site into discrete features first (navigation,
   hero, card grid, form, modal, toggle, pagination, footer, transitions, ...).
   Work on exactly one. When one feature interacts with a later one, stub only
   what is required to observe the current feature.
2. **Explore the reference feature in the browser**
   (see browser-feature-discovery). Load the reference website, find the entry
   point to the feature, interact with every control, watch every state it can
   enter, and capture screenshots. Record observed facts, not guesses.
3. **Understand, then spec the feature.** Write down the observed behavior and
   UI states before touching code. If the reference is ambiguous, say it is
   ambiguous and pick the interpretation you can defend; do not silently invent.
4. **Implement ONE feature locally**
   (see frontend-implementation and ui-replication). Reuse the existing project's
   architecture and components. This is the only step that writes code.
   ui-replication specifies exactly what to copy visually (spacing, type, color,
   states, motion).
5. **Run the local version.** Start the local dev server (see the project's
   package.json scripts; typically `npm run dev` / `vite`). Load the local page
   in the browser. Do not skip this because it compiled.
6. **Perform the same interactions locally** that you performed on the reference
   (see browser-feature-discovery for the interaction cards).
7. **Compare against the reference** (see visual-regression). Screenshot the
   same states at the same viewport on both sides. Identify concrete differences
   in layout, spacing, typography, colors, sizes, states, motion, behavior.
8. **Fix the discrepancies.** Return to implementation, fix, re-run, re-compare.
   Repeat until the feature matches within tolerance.
9. **Mark the feature complete.** Only then move to the next feature.

## Interaction inventory (run these on both reference and local)

For every feature, exercise: default view, every obvious control, open and
closed states, hover, focus, active, disabled, empty states, loading states,
error states, transitions, scroll behavior, keyboard interaction, and at least
one edge case per control.

## Discipline

- One feature at a time. Parallel exploration across whole site is fine, but
  implementation is serial and feature-gated.
- Keep a short per-feature log: observed behaviors, decisions, discrepancies
  found and fixed. This becomes the completion evidence.
- Screenshots beat memory. Store reference screenshots and local screenshots so
  comparisons are reproducible.
- Do not refactor unrelated code while implementing a feature.
- If a feature depends on another unbuilt feature, build the minimal stub needed
  to observe it, in the same loop pass.
- Network behavior, console output, and URL/query changes are part of a feature.
  If the reference makes API calls, note them (see website-reverse-engineering);
  replicate the observable behavior locally even if the backend differs.

## Completion criteria

A feature is complete when, at the target viewport(s):
- the same interactions produce the same states locally and on the reference,
- local screenshots match reference screenshots for layout and UI states within
  visual tolerance,
- no console errors were introduced,
- responsive behavior matches (see responsive-replication), and
- the implementation follows the existing project architecture and passes the
  project's typecheck/lint/tests.

Stop and report when blocked on an ambiguous behavior rather than inventing it.