---
name: responsive-replication
description: >
  Inspect and reproduce a reference website's responsive behavior across
  viewports (desktop, tablet, mobile): measure breakpoints, observe layout
  reflow, nav collapse, type scaling, overflow, and interaction targets on the
  reference, then implement and verify the same behavior locally at each
  viewport. Use when replicating a site's responsive design, when asked to
  "match breakpoints", "make it responsive like", or at the responsive stage of
  the reference-to-code loop. Companion skills: website-reverse-engineering,
  ui-replication, visual-regression.
---

# Responsive Replication

Reproduce how the reference website behaves across screen sizes instead of
copying a single desktop layout.

## Measure the reference

1. **Pick viewports.** Choose a representative set: mobile (e.g. 390×844),
   tablet (e.g. 768×1024), small laptop (e.g. 1280×800), desktop (e.g.
   1440×900 or wider). Use `browser_resize` / viewport control to set them.
2. **Find the breakpoints.** Walk the width down in ~20px steps (or bisect)
   and note every width where the layout changes: grid columns, nav collapse,
   hamburger menu, font/type scale changes, element reorder, overlays. Record
   each breakpoint and what changed there. Cross-check for media queries in the
   CSS if you can read assets on the reference, but confirm by resizing.
3. **For each viewport, observe:**
   - global layout: columns, gutters, widths, sidebars vs stacking,
   - navigation: full nav → hamburger/menu drawer → overlay; how the drawer
     opens/closes and whether body scroll locks,
   - typography: size/line-height scaling of headings and body,
   - spacing: padding/gap scaling,
   - images/media: sizing, `srcset`/candidate usage, cropping,
   - interaction targets: touch-friendliness (approximate 40–48px), spacing
     between tappable items,
   - horizontal scroll / overflow: any element that causes horizontal scroll on
     small screens (record it; reproducing the bug is part of cloning if it is
     truly present),
   - sticky/fixed elements and their behavior.
4. **Screenshot** each viewport for the states you'll compare later. Save
   reference screenshots as artifacts.

## Implement

- Emulate the measured behavior using the project's existing conventions
  (Tailwind breakpoints, CSS media queries, component-level responsive rules).
  Prefer the project's design-system primitives over hand-rolled media queries
  where they fit.
- Match the breakpoints you found on the reference. If the reference's
  breakpoints are not expressible cleanly in the project's default scale, add
  the specific ones rather than approximating and hoping.
- Match type/spacing scaling behavior and nav behavior at each viewport.

## Verify locally

- Use the visual-regression loop at each viewport: reproduce the same state,
  same viewport, on local and reference; compare screenshots; fix differences.
- Walk the local width down through the same steps and confirm the layout
  changes happen at the same widths.
- Verify the interactive behaviors: hamburger opens the same menu, drawer
  scroll-locks the same way, touch targets are comparable.
- Check orientation fast-path: landscape phone vs portrait where the reference
  shows a meaningful difference.
- Confirm the implementation scales up beyond desktop (wide screens) in the
  same way the reference does (centering, max-width, no stretch).

## Discipline

- The reference is the authority; its quirks are features for replication
  purposes.
- Responsive is not just "shrinks" — verify actual reflow, not elastic
  scaling.
- Record viewports with every screenshot so comparisons stay honest.
- If the reference shows no responsive change (fixed width, desktop-only), say
  so explicitly rather than inventing breakpoints.
- Measure interaction targets on mobile; tiny targets are a concrete difference
  to fix, not a cosmetic one.