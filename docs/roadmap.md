# Bundle Optimization Roadmap

This roadmap documents the planned Vite bundle-size reduction work for Flood Ready.

The objective is to reduce initial JavaScript payload without changing the current product logic, onboarding funnel, or offline-first survival flow.

---

## Why This Work Exists

Current production build status:

- `npm run build` passes
- Main client bundle is still large
- The largest driver is the on-device AI stack, especially `@mlc-ai/web-llm`

This is not a product redesign task. It is a delivery optimization task.

The rule for this roadmap is simple:

- Keep the current UX
- Keep GAIA-119 behavior
- Keep the offline-first model
- Reduce what must be loaded on first paint

---

## Core Diagnosis

The current app loads too much logic too early.

The main structural reason is:

1. `AIProvider` is mounted globally in `src/App.tsx`
2. `AIContext.tsx` statically imports `@mlc-ai/web-llm`
3. Multiple pages are statically imported into the main route tree

That means the app shell, non-AI screens, and AI runtime are coupled in the first bundle.

In practical terms:

- Users visiting Home still pay for AI runtime setup code
- Users opening Map still inherit AI-related bundle weight
- On-device AI is the right feature, but it should not dominate cold-start delivery

---

## Non-Negotiables

The following must remain unchanged unless a separate product decision is made:

- Onboarding step 5 remains the AI install and verification step
- GAIA-119 remains on-device and offline-capable
- AI fallback chain remains intact
- Quick Assist, decision trees, and Safe Hub flows remain behaviorally unchanged
- No cloud inference fallback is introduced

---

## Priority Plan

## Phase 1: Dynamic Import for WebLLM

Goal:

- Move `@mlc-ai/web-llm` out of the initial app bundle

Implementation direction:

- Remove static import from `src/contexts/AIContext.tsx`
- Load WebLLM only inside `initEngine()` with `await import('@mlc-ai/web-llm')`

Expected effect:

- Largest immediate reduction in first-load JavaScript
- Home, Map, and non-AI flows stop paying full AI runtime cost on first paint

Risk:

- Low
- Must verify that cached model restore still works correctly

Acceptance check:

- `npm run build` passes
- `npm run lint` passes
- AI onboarding download still works
- Cached AI restore still works after refresh

---

## Phase 2: Narrow AIProvider Scope

Goal:

- Stop mounting AI runtime across the whole app

Implementation direction:

- Remove global `AIProvider` wrapping from `src/App.tsx`
- Mount AI provider only where it is needed:
  - onboarding AI setup step
  - AI quick assist page

Expected effect:

- Smaller app-shell dependency graph
- Better separation between deterministic survival UI and optional AI runtime

Risk:

- Medium
- Must ensure onboarding and AI assist still share the same cached engine expectations

Acceptance check:

- App shell routes work without AI initialized
- Onboarding AI step still downloads and tests model
- AI quick assist still works after onboarding

---

## Phase 3: Route-Level Lazy Loading

Goal:

- Split heavy pages into separate route chunks

Primary candidates:

- `AIQuickAssist`
- `Onboarding`
- `MapView`
- `QRComms`
- `QuickAssistFlow`

Implementation direction:

- Replace static page imports in `src/App.tsx`
- Use `React.lazy()` and `Suspense` per route boundary

Expected effect:

- Reduced main app bundle
- Less startup cost for first-time landing on Home
- Better cache behavior across repeated visits

Risk:

- Low to medium
- Must provide clean loading fallback for lazy routes

Acceptance check:

- Route navigation remains stable
- Splash and onboarding gates still work
- No broken route flashes or blank-screen regressions

---

## Phase 4: Manual Chunk Strategy

Goal:

- Improve cache reuse and prevent oversized vendor blobs

Implementation direction in `vite.config.ts`:

- Add `build.rollupOptions.output.manualChunks`
- Suggested chunk groups:
  - `react-vendor`
  - `router`
  - `web-llm`
  - `ui-icons`

Expected effect:

- Better long-term caching
- More predictable chunk composition
- Easier bundle inspection over time

Risk:

- Low
- Should follow Phases 1-3, not precede them

Acceptance check:

- Build output shows separated chunks
- No runtime chunk-loading failures

---

## Phase 5: Bundle Measurement Discipline

Goal:

- Turn bundle size from a one-time warning into a tracked engineering metric

Implementation direction:

- Record baseline bundle output before optimization
- Record bundle output after each phase
- Add a simple checklist to release notes:
  - total JS
  - main entry chunk
  - AI chunk
  - first-load route behavior

Recommended tooling:

- Vite build output
- Optional future addition: bundle visualizer

Risk:

- Very low

Acceptance check:

- Each optimization step includes before/after bundle numbers

---

## Recommended Execution Order

Do the work in this order:

1. Dynamic import for WebLLM
2. Route-level lazy loading
3. Narrow AIProvider scope
4. Manual chunk strategy
5. Bundle measurement discipline

Reason:

- Phase 1 gives the largest return immediately
- Phase 3 is structurally simple and safe
- Phase 2 is valuable, but touches provider boundaries and should follow after chunk wins are visible
- Phase 4 is tuning, not first-line correction

---

## Success Criteria

This roadmap is successful if the following become true:

- Initial non-AI routes no longer load AI runtime eagerly
- Cold-start JS decreases materially
- Home route feels lighter on first launch
- Onboarding AI setup still feels intentional and complete
- No regression in offline-first behavior
- No regression in GAIA-119 functionality

---

## Explicitly Out of Scope

The following are not part of this roadmap unless requested separately:

- Changing AI model size
- Replacing WebLLM with cloud inference
- Removing onboarding AI setup
- Rewriting the routing architecture
- Redesigning UI for performance reasons
- Feature cuts to Quick Assist, hubs, or QR-P2P

---

## Status

Current status: planned, not yet implemented.

This document exists so the optimization work can be executed later without re-deriving the architectural reasoning.
