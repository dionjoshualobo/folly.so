---
name: browser-feature-discovery
description: >
  Systematically explore ONE feature of a website in the browser instead of only
  staring at the initial page: identify the entry point, interact with all
  obvious controls, observe resulting states, test reasonable edge cases,
  inspect navigation/state changes and network activity, capture useful
  visual/structural information, and summarize what was actually observed. Use
  when asked to "explore", "discover", "test", "interact with", "map out" a
  feature, or before replicating a specific feature of a reference website.
  Companion skills: website-reverse-engineering, ui-replication,
  visual-regression, reference-to-code-loop.
---

# Browser Feature Discovery

Investigate a single feature of a running website — reference or local —
thoroughly enough that its UI and behavior can be rebuilt or verified. Do not
rely on the initial page alone.

## Steps

1. **Find the entry point.** How does the user reach this feature? Navigation,
   button, shortcut, URL, scroll, hash, query param. Navigate there and note the
   resulting URL (including query/hash changes).
2. **Take the baseline.** `browser_snapshot` (structure/roles/text) and
   `browser_take_screenshot` (visual) at the default state. Record viewport
   (`browser_get_config` / current size).
3. **Identify all obvious controls.** List every interactive element visible
   and in the accessibility snapshot: buttons, links, inputs, toggles, tabs,
   accordion headers, close buttons, menu items.
4. **Interact with each control.** One at a time:
   - click/link follow, open/close, toggle on/off,
   - type into inputs, submit forms, hit Enter,
   - hover, focus (Tab into it), press keys if it's keyboard-operable,
   - drag where applicable.
5. **Observe resulting states.** After each interaction capture, at minimum:
   - what changed in the snapshot (new/changed/removed elements, text, roles),
   - a screenshot of the new state,
   - any URL/hash/query change,
   - any network requests triggered (`browser_network_requests`),
   - any console messages/errors (`browser_console_messages`).
6. **Test reasonable edge cases.** For each control: empty input, invalid
   input, rapid double-click, disabled state, items with zero results, long
   text overload, missing image, pagination at first/last page, modal close via
   Escape/backdrop. Note what the feature does (or fails to do) in each case.
7. **Inspect state persistence.** Refresh the page mid-feature; reload full URL;
   check whether state survives (localStorage/sessionStorage/URL — use
   `browser_localstorage_list` / `browser_sessionstorage_list` when relevant).
8. **Capture the reference for later.** Save screenshots of every interesting
   state so they can be compared against the implementation later.

## Observation recording

Record each finding as:

- `BEHAVIOR` — an action → resulting state pair ("Click 'Filters' → dropdown
  opens, URL gains ?filter=sale").
- `STATE` — a distinct visual/structural state with a screenshot reference
  ("dropdown-open", "empty search", "validation-error").
- `NETWORK` — requests tied to the feature (endpoint, method, trigger).
- `EDGE` — edge case results, including broken/embarrassing ones.
- `UNVERIFIED` — plausible interpretations you could not confirm; name the test
  that would confirm them.

End with a concise summary: entry point, controls, states, edge cases, network
activity, and any console errors — all grounded in what was actually observed.

## Discipline

- Observation first, conclusion second. A control you did not click is an
  unknown.
- When a control has multiple states (accordion sections, tabs, pagination
  pages), sample at least first, middle, and last where feasible.
- Screenshots are cheap and reliable; take more rather than fewer.
- If a step would affect a shared account/billing on the reference site, stop
  and ask before proceeding.