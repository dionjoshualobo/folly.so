---
name: visual-regression
description: >
  Compare the REFERENCE website against the LOCAL IMPLEMENTATION using browser
  screenshots and inspection: capture the relevant state on the reference,
  reproduce the same state locally, compare them, identify concrete differences,
  fix them, and repeat until they match. Use when verifying that a replicated
  feature looks/behaves like the reference, when asked to "compare", "diff",
  "visual check", "regression", "does it match", or at the compare step of the
  reference-to-code loop. Companion skills: browser-feature-discovery,
  ui-replication, responsive-replication, reference-to-code-loop.
---

# Visual Regression (Reference vs Local)

A structured screen-by-screen comparison between the reference website and the
local implementation. The point is to find concrete, fixable differences.

## The loop

1. **Capture the reference state**
2. **Reproduce the same state locally**
3. **Compare**
4. **Identify concrete differences**
5. **Fix**
6. **Repeat**

## 1. Capture the reference state

- Choose one concrete state: a URL + viewport + interaction set (see
  browser-feature-discovery for building these).
- Load it in the browser, screenshot it (`browser_take_screenshot`), and also
  grab the accessibility snapshot (`browser_snapshot`) for structure/text.
- Record the viewport size and any interactions used to reach the state so the
  state is reproducible.
- Optionally save the screenshot to the project artifacts directory (e.g.
  `.opencode/artifacts/reference/…`) so it can be referenced during fixes.

## 2. Reproduce the same state locally

- Load the local dev server in the browser at the SAME viewport and run the
  SAME interactions to reach the equivalent state.
- Screenshot it and snapshot it. If the local state is unreachable, that is
  itself a finding (a behavior gap, not just a pixel gap).

## 3. Compare

- Compare reference and local screenshots. Where useful, measure rather than
  eyeball:
  - `browser_evaluate` both pages to compare layout geometry
    (offset widths/heights, bounding rects), computed styles, and CSS custom
    properties for the same element.
  - Compare the accessibility snapshots: same roles, order, and text?
- Diff at the element/state level, not just the whole-page level. A mismatch
  anywhere in the viewport is a difference.

## 4. Identify concrete differences

Classify every difference:

| Kind | Example | Note |
|------|---------|------|
| Layout | widths, gaps, grid columns, order | measure offsets |
| Spacing | padding/margin deltas | measure computed styles |
| Typography | size/weight/line-height/letter-spacing | measure |
| Color | text/background/border/accent | extract hex/oklch both sides |
| Sizing | icon/button/image dimensions | measure |
| States | hover/focus/disabled/loading missing | check both sides |
| Behavior | click does nothing locally, wrong URL, missing network call | check network + console |
| Motion | missing/too-fast/too-slow transitions | check with interaction |
| Responsive | breaks only at one viewport | defer to responsive-replication |
| Content | copy, images, icons differ | often intentional — note it |

For each difference record: where (element/region), what the reference shows,
what local shows, and the likely cause. Ignore unavoidable differences (e.g. a
dynamic date, a live feed) only after noting why.

## 5. Fix

- Return to implementation (see ui-replication and frontend-implementation),
  fix the concrete difference using measured values, re-run the local server if
  needed, and return to step 2 for that state.
- Fix behavior gaps (missing state, missing interaction) before pixel polish.

## 6. Repeat

- Re-run the same-state comparison after fixes. Move to the next state once the
  current one matches within tolerance (sub-pixel/antialias differences, tiny
  value differences from font rendering, and intentional content differences
  are OK).
- Cover at least: default page, every feature in the current loop scope, their
  open/hover/focus/disabled states, an empty state, a loading state if any, and
  one interaction per control.

## Discipline

- Same viewport, same browser engine for both sides (both via Playwright
  Chromium unless the reference genuinely differs).
- Screenshots must be reproducible: record URL, viewport, and interaction
  sequence with each capture.
- Keep reference screenshots as artifacts; do not rely on memory of the
  reference.
- Treat "it compiles" as unrelated to "it matches". Compilation is not
  completion (see reference-to-code-loop).
- When differences are many, batch them by region and fix one kind at a time so
  each change is attributable.