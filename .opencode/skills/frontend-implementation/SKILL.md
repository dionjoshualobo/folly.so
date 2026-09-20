---
name: frontend-implementation
description: >
  Implement discovered website behavior while respecting the existing project's
  architecture: inspect the architecture before changing it, reuse existing
  components where appropriate, avoid unnecessary rewrites, avoid modifying
  unrelated functionality, preserve existing conventions, run relevant
  typechecks/lints/tests, and verify the actual browser behavior after
  implementation. Use when writing or editing code in the local replication
  project, at the implement step of the reference-to-code loop, or whenever
  asked to "implement", "build", "add", "fix" behavior found on a reference
  website. Companion skills: reference-to-code-loop, ui-replication,
  visual-regression, browser-feature-discovery.
---

# Frontend Implementation

Turn a discovered behavior (or a spec of one) into code in the LOCAL
replication project without fighting its structure.

## Inspect the architecture first

Before editing anything:

- Read the project's `package.json` (framework, build tool, scripts — note the
  dev server command, typecheck/lint/test commands), `tsconfig`, and the
  framework entry files.
- Read `index.html` / entry point and the top-level component/page structure.
- Identify existing components, styling approach (CSS modules, Tailwind, CSS
  variables, styled-components), state management, data-fetching pattern, and
  routing.
- Note existing design tokens (colors, spacing, fonts) if they exist.

Only then decide how a feature fits. Do not assume the project uses the same
stack as any other project you have seen.

## Rules

- **Reuse existing components** where appropriate. If a component exists that
  can be restyled to match the reference, restyle it. Prefer the project's
  primitives; import a new library only when the project has nothing
  equivalent and the need is real.
- **Avoid unnecessary rewrites.** Change what a feature requires; do not
  refactor surrounding code because it could be better. Cleaning unrelated
  code while replicating makes review impossible and risks breaking working
  behavior.
- **Avoid modifying unrelated functionality.** A change belongs in one feature.
  If a change is needed for several upcoming features (a shared primitive,
  a global token), make it minimal and note it.
- **Preserve existing conventions.** Match the project's file placement,
  naming, component API, styling approach, and lint/formatting. Consistency
  with the codebase wins over personal style.
- **Implement at the right layer.** Reference behavior that is data-driven
  (from an API) should be implemented in the data layer per the project's
  pattern; purely presentational behavior belongs in components. Match where
  the project would put it.
- **Copy assets locally.** If the reference uses images/icons/fonts, bring
  them into the project's assets rather than hot-linking the reference origin.
- **Map measured values into the design system.** Use extracted reference
  values (see ui-replication) through the project's tokens where a token
  fits; add/adjust tokens rather than scattering magic values everywhere.
- **No stubbing beyond the current feature.** When a feature needs an
  unbuilt sibling, build the smallest stub that lets the current feature
  render and be verified; the stub should be honest and marked.
- **Respect the loop.** Implement ONE feature at a time (see
  reference-to-code-loop). Do not batch-implement the whole site.

## Before/after checks

Before finishing a feature:

1. Run the project's relevant checks: typecheck, lint, and tests, using the
   scripts in `package.json` (e.g. `npm run typecheck`, `npm run lint`, `npm
   test`). Fix what they report.
2. Start the dev server (e.g. `npm run dev`) and open the local page in the
   browser.
3. Perform the same interactions the reference requires (see
   browser-feature-discovery) and confirm the behavior and state appear.
4. Screenshot the local states and compare with the reference states (see
   visual-regression). Close discrepancies until the feature matches.
5. Check the browser console for errors you introduced
   (`browser_console_messages`) and confirm expected network behavior.

## Discipline

- The reference behavior was observed, so implement what was observed — if you
  are unsure what the reference does for some input, go observe it again
  instead of guessing (see browser-feature-discovery).
- If the architecture must change to support a feature (e.g. adding a router
  where none exists), make that a separate, explicit step in the loop and tell
  the user, since it is a structural decision.
- Keep diffs small and scoped; do not reformat files you only touch for a
  feature.
- Never commit the site's secrets, tokens, or API keys. Do not void
  credentials shown in reference network traffic.