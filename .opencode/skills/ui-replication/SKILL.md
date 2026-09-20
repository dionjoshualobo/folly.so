---
name: ui-replication
description: >
  Reproduce the visual behavior of a reference website in the local
  implementation: layout, spacing, typography, sizing, colors, borders, radius,
  shadows, icons, alignment, visual hierarchy, hover/focus/active/disabled
  states, transitions, animations, overlays/modals, and scrolling behavior. Use
  browser screenshots and DOM/computed-style inspection instead of guessing. Use
  when replicating the look/feel ("make it look like", "match the design") of a
  reference. Companion skills: website-reverse-engineering,
  browser-feature-discovery, visual-regression, responsive-replication.
---

# UI Replication

Reproduce the reference website's visuals from evidence, not guesses. Every
visual decision should trace back to something observed in the browser.

## Evidence over guessing

- Screenshots are ground truth for layout: capture the reference state and the
  local state at the same viewport and compare.
- For precise values, inspect the reference: `browser_evaluate` can read
  `getComputedStyle`, element geometry (`getBoundingClientRect`), and CSS custom
  properties from the live reference page. Use it to extract exact colors,
  font family/size/weight/line-height/letter-spacing, padding/margin/gap,
  border widths/colors, border-radius, box-shadows, and transforms.
- The accessibility tree (`browser_snapshot`) gives order, roles, and text
  anchored to real structure.

## What to match

- **Layout**: container widths/max-widths, gutters, grid columns and gaps,
  flex ordering, alignment (start/center/end), responsive reflow at breakpoints.
- **Spacing**: margins, paddings, gaps — including negative space and how
  elements align to one another. Note spacing rhythm (consistent scales vs
  ad-hoc values).
- **Typography**: family, size, weight, line-height, letter-spacing,
  text-transform, color for every text role (headline, body, label, caption,
  link, button, placeholder). Preserve hierarchy: H1/H2/H3, emphasis, muted.
- **Sizing**: widths/heights of components, icons, images, buttons, avatars.
- **Colors**: exact values (convert to the project's format: hex/oklch/tailwind
  tokens). Cover text, backgrounds, borders, accents, gradient stops.
- **Borders & radius**: widths, styles, colors; corner radii (buttons, cards,
  inputs, modals).
- **Shadows**: color, blur, spread, offset, layered shadows (focus rings, card
  elevation, sticky elements).
- **Icons**: style family (stroke width, corners, filled vs outline), size,
  color, source if the site bundles them.
- **Alignment & hierarchy**: what dominates the viewport, what recedes; muted vs
  emphasized text; visual weight through size, color, and spacing — not just
  raw values.
- **States**: hover, focus (focus ring), active, disabled, selected/checked,
  pressed — for every interactive component.
- **Transitions & animations**: what animates, on which trigger, approximate
  duration, easing feel (fast snappy vs slow float), and whether it respects
  reduced motion.
- **Overlays/modals**: dim layer, panel radius/shadow, entrance/exit motion,
  scroll locking, backdrop dismissal.
- **Scrolling**: native scroll vs custom (smooth, sticky headers, scroll
  snap), scrollbar appearance, overflow behavior.

## Workflow

1. Select ONE feature/state to replicate (see reference-to-code-loop).
2. Capture the reference state: screenshot + computed values.
3. Implement it in the local project, mapping extracted values into the
   project's conventions (design tokens, Tailwind theme, CSS variables,
   existing components). Do not introduce a parallel styling system.
4. Run the local app, reproduce the same state, screenshot it, and compare
   with the reference screenshot (see visual-regression). Zoom/scale both
   identically when comparing crops.
5. Fix concrete deltas and re-compare. Iterate until visually equivalent.

## Discipline

- Measure, don't eyeball, when a pixel difference is possible: extract
  computed styles from the reference rather than approximating.
- Match the source of the project: if the reference resembles a known layout
  component (shadcn/ui card, Tailwind navbar), prefer using the project's
  equivalent and restyle, rather than hand-rolling every primitive.
- Preserve the project's architecture and existing components; adjust them
  toward the reference rather than rewriting the project's conventions.
- Where the reference is inconsistent (two paddings for the same element),
  reproduce the inconsistency — you are cloning, not improving.
- Do not rely on the reference's bundled assets fetching live URLs from the
  reference origin in production; copy assets locally when needed.
- After implementation, run the project's typecheck/lint/tests and verify the
  final behavior in the browser.