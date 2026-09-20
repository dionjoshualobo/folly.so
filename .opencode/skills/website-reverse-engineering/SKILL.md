---
name: website-reverse-engineering
description: >
  Investigate a reference website in the browser BEFORE implementing it: map
  navigation, routes, page hierarchy, interactive elements, UI states
  (hover/focus/active/disabled), forms, loading states, error states,
  animations/transitions, responsive behavior, accessibility structure,
  network/API behavior, URL/query changes, console output, screenshots, and
  assets/media. Distinguish observed behavior from assumptions. Use when asked
  to "reverse engineer", "study", "investigate", "analyze" a website, or at the
  start of a website-replication task. Companion skills:
  browser-feature-discovery, ui-replication, visual-regression,
  responsive-replication, reference-to-code-loop.
---

# Website Reverse Engineering

Before implementing a website, investigate it with the browser. The goal is a
factual model of the site: what exists, how it behaves, and what it looks like —
with every entry marked as OBSERVED (seen in the browser) or ASSUMED (inferred,
never seen). Assumptions are allowed but must be labeled and later verified.

## Setup

- Open the reference in a browser via the Playwright MCP
  (`browser_navigate`).
- Use `browser_take_screenshot` for the visual record and `browser_snapshot`
  for the accessibility/DOM tree (structure, roles, text, element order).
- Use `browser_console_messages` and `browser_network_requests` to capture
  console output and network activity.
- Keep the browser DevTools context in mind: capture page before and after
  interactions.

## What to map (inspect when relevant)

### Structure
- **Navigation & routes**: every link/menu item, its destination, and the URL it
  produces. Map the page hierarchy. Note URL/query param changes on click.
- **Page hierarchy**: main regions (header, nav, main, sections, footer),
  semantic landmarks, heading order (h1 → h2 → …).
- **Interactive elements**: buttons, links, inputs, toggles, tabs, accordions,
  dropdowns, carousels, menus — anything clickable or focusable.

### Behavior & state
- **UI states**: hover, focus, active, disabled, selected, pressed, expanded,
  loading, error, empty. Trigger each and record the change.
- **Forms**: fields, validation rules, required markers, submit behavior,
  success/error feedback, disabled controls.
- **Loading & error states**: skeletons, spinners, inline errors, empty states,
  offline/network-failure appearance.
- **Animations/transitions**: on load, on hover, on scroll, between pages/routes,
  on modal open/close. Note approximate duration, easing character, and what
  moves (fade, slide, scale, stagger).

### Responsive
- Re-run key states at desktop, tablet, and mobile viewports
  (`browser_resize` / viewport control). Note breakpoint behavior: grid changes,
  nav collapse, hamburger menus, font/type size changes, overflow handling.

### Accessibility structure
- ARIA roles, labels, alt text, focus order, keyboard operability, contrast of
  text on backgrounds, `prefers-reduced-motion`, `prefers-color-scheme`
  behavior (via `browser_emulate_media`).

### Network & data
- API/network calls: endpoints, methods, payloads, responses, relationships
  between UI changes and requests (`browser_network_requests`).
- URL/query changes on navigation and filtering.

### Assets & media
- Images, fonts, icons, videos, background media: formats, sizes, loading
  behavior (lazy vs eager), any image CDN patterns.

## Output format

Produce a model with two explicit sections:

1. **OBSERVED** — facts seen in the browser (quote/structure from snapshots,
   screenshot references, network logs, console output).
2. **ASSUMED** — inferences made from the observed facts (e.g. "grid uses 12
   columns", "font is system stack"). Each assumption should name the evidence
   that motivated it and be flagged for verification.

## Discipline

- Interact before concluding. Seeing the initial page is not understanding the
  page.
- Screenshot anything you will need later; memory drifts, screenshots do not.
- Record exact details that matter for replication: spacing scales, type
  sizes/weights, colors, border radii, shadows, breakpoints, transition
  timings, icon styles.
- When two plausible behaviors both fit the evidence, list both options and mark
  them UNVERIFIED rather than picking silently.
- Never modify the reference website. Investigation is read-only except for
  actions needed to observe states (clicking, typing in a disposable form,
  resizing).
- Preserve the target site untouched; your code changes live in the local
  replication project.