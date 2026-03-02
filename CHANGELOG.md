# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.4.0] - 2026-03-01 (Resilient Intelligence & Community Layer)

### Added

#### Streaming WebGPU Inference
- Real-time token streaming via `stream: true` in WebLLM engine (`AIContext.tsx`). First visible tokens appear in ~2 seconds; full response in 15-30s.
- `for await` loop over `AsyncIterable<ChatCompletionChunk>` with accumulated text passed to `onChunk` callback for live UI updates.
- Onboarding AI init screen redesigned: brain animation + streaming status text ("Processing 100% offline via WebGPU").

#### Quick Assist — 24-Card Library (3-Layer Architecture)
- **Layer 1 — For You** (`QuickAssistEntry.tsx`): Rule-based personalized card recommendations computed from `riskLevel + household + medicalNeeds + weatherData` via `useMemo`. Zero AI required, instant.
- **Layer 2 — Category Cards**: Full rewrite from 4 hardcoded cards to 24 cards across 6 categories:
  - Flood & Water (6 cards), Medical Emergency (5), Supplies & Resources (4), Shelter & Safety (4), Communication (3), Family & Vulnerable (3)
  - Cards route to decision trees (`/quick-assist/:treeId`), AI queries (`/ai-assist?q=`), or direct navigation.
  - "Guide" badge for tree-routed cards, "AI" badge for AI-query cards.
- **Layer 3 — AI Insight Mid-Flow** (`QuickAssistFlow.tsx`): `aiHint` cards render inline between `doNow` actions and the decision question. Localized EN/TH/MS. Visual: brand-primary left border + `Brain` icon + "AI INSIGHT" label.
- `aiHint` field (EN/TH/MS) added to 5 key decision tree nodes: `dt_flood_evac_01`, `dt_first_aid_01`, `dt_gobag_01`, `dt_water_01`, `dt_electric_01`.

#### Community Hub Registration
- `+` button on MapView opens `HubRegisterModal` — full community hub submission form.
- Form fields: Hub name, Type (5 options reusing existing `typeIcons`), Status (Open/Full), Services (6 checkboxes reusing `serviceIcons`), GPS auto-detect + fallback to region center.
- 800ms P2P broadcast simulation on submit.
- Community-submitted hubs identified by `hub_community_${Date.now()}` ID prefix and displayed with an orange "Community Report" badge.
- `addHub()` added to `HubContext` — prepends to state and persists to `app_hub_overrides` in localStorage.

#### AI Result UX Improvements
- `submittedQuery` state in `AIQuickAssist.tsx` — displays "You: [question]" above the risk card so users can see what they submitted after streaming begins.
- treeId CTA button now validated client-side: `validTreeIds = new Set(Object.keys(decisionTreeData.nodes))` — button only renders if treeId exists in the actual node map.

### Fixed

#### GIGA-119 Accuracy
- **SITUATION OVERRIDE rule** added to system prompt: user's explicit words always take priority over passive sensor/weather context. Fixes incorrect GREEN classification for "water entering house" when `[WEATHER: Rain 0mm]`.
- **searchQuery pollution** fixed: explicit rule added — emergency keywords ONLY (3-5 English terms), never profile tags, location names, household type, or weather values. Eliminates outputs like `"solo Mueang Yala special_needs weather"`.

#### Map & Hub Fixes
- `getRegionCoords` region matching: changed from exact string match to `includes()` — fixes coordinate lookup for compound region strings like `"Yala - Betong"`.
- Hub region sort: changed `===` to `region.includes(hub.location.region)` — local hubs now correctly surface to top.
- Map button: removed `hub.location.region === region` gate — shows for ALL hubs. Added `+ ' Thailand'` to Google Maps search URL for geographic accuracy.

#### Navigation
- QuickAssistFlow "Flow not found" dead-end replaced with `navigate('/quick-assist', { replace: true })` auto-redirect — eliminates broken state from AI-hallucinated treeIds.

### Changed
- `docs/devto-article.md` created — full technical deep-dive article covering WebGPU streaming architecture, GIGA-119 prompt engineering, treeId validation pattern, and lessons learned.
- README updated to v0.4.0 with current feature set, streaming details, 24-card library description, and updated Known Limitations.
- `package.json` version bumped to `0.4.0`.

---

## [0.3.0] - 2026-02-28 (Global Sovereign Expansion)

### Added
*   **12-Language Support**: Expanded underlying architecture to natively support English, Thai, Malay, Korean, Japanese, Chinese, Arabic, Indonesian, Spanish, German, Italian, and French.
*   **Global Region Input**: Switched strictly local Yala dropdowns to free-text global region inputs across Onboarding and Settings.
*   **Contextual Prefixing**: Implemented `[Location: ${region}]` prefixing for local context injection without invalidating WebLLM's internal system prompt cache.
*   **Fallback Expansions**: Injected over 500 localized disaster keywords into `emergency_fallback.json` to cover all 12 languages offline.

### Changed
*   **Onboarding UI**: Replaced vertical language list with a compact 4x3 grid to eliminate scrolling fatigue.
*   **AI Pre-prompt Generalized**: Generalized the `ContactProtocolRecommender` few-shot examples from strict "1669" to "local emergency number" to prevent regional mismatches globally.

### Fixed
*   **AIContext Guardrails**: Fixed infinite loop memory leak risks in WebLLM instantiation by routing condition checks through stable React `useRef` states.
*   **Ultra-Low-Power Protection**: Hard-disabled WebLLM initialization during `ultra-low-power` mode to strictly preserve battery, automatically bypassing to the offline JSON dictionary.
*   **JSON Parsing Immunity**: Hardened inference returns using strict `try/catch` wrappers to prevent model hallucinations from crashing the UI thread.
*   **Type Safety**: Corrected `as any` type bypass in Onboarding to strictly use the exported `Language` union type.

---

## [0.2.0] - 2026-02-28 (GIGA-119 Intelligence Layer)

### Added

#### GIGA-119 Intent-Based AI Persona
*   **`GAIA_119_SYSTEM_PROMPT`** (`AIContext.tsx`): Full intent-based persona ontology replacing the previous generic system message. Engineered using the **CR-EP Why Framework** — all output constraints are derived from a measurable survival goal (decision < 5 seconds, ≤12 words per action).
*   **AESE-CrisisShield Integration (Addon#7)**: Mapped 3 modules into the active prompt pipeline:
    - `CalmToneInfuser` — rescue radio operator tone, never alarmed
    - `CognitiveFocusRedirector` — one action per item, no compound sentences
    - `ContactProtocolRecommender` — red-level responses must end with emergency contact
*   **AESE-ResponseFusion Integration (Addon#8)**: Added Dual-Pipeline crisis disambiguation modules:
    - `EmergencySignalScanner` — scans calm-sounding inputs for hidden crisis signals
    - `UrgencyClassifier` — explicit threshold: red ≥ 0.7 | yellow 0.3–0.7 | green < 0.3
*   **3-Language Few-Shot Examples**: Added English / Thai / Malay parallel examples to the system prompt. Ensures JSON format consistency across all input languages for the 1.5B model.
*   **`docs/gaia-119.md`**: Full technical specification — CR-EP Why rationale, AESE 5-module pipeline diagram, inference configuration table, 3-tier fallback chain, and multilingual design rationale.

#### Ollama Dev Path (AIContext / ollama.ts)
*   Added `OLLAMA_SYSTEM_PROMPT` to `ollama.ts` — same GIGA-119 persona for the dev Ollama path.
*   Corrected API endpoint: `/api/generate` → `/api/chat` (Ollama chat format).
*   Corrected model name: `qwen2.5:1.5b` → `qwen3:1.7b`.
*   Fixed response parsing: `data.response` → `data.message?.content ?? data.response ?? '{}'`.

#### Home Screen 4-Stage Dynamic Action Board
*   Replaced static 3-card Do Now board with `riskActionsMap` — 4 distinct action sets keyed by risk level (green / yellow / orange / red), 3 contextually appropriate cards per level.
*   Red level: EVACUATE IMMEDIATELY (decision tree), Call Direct Rescue (`tel:1669`), AVOID FLOODWATER (AI).
*   Orange level: Cut Main Power & Gas (AI), Move to Safe Hub (`/map`), Grab Medical Kit (AI).
*   Yellow level: Move Valuables Upstairs, Store Clean Water, Prepare Vehicle.
*   Green level: Check Go-Bag, Monitor Weather Updates, Keep Devices Charged.
*   Do Now count is now dynamic: `{doNowActions.length + 1}`.

### Fixed

#### Critical
*   **C1 — Decision Trees**: All 4 decision tree paths fully implemented (`dt_flood_evac_01/02`, `dt_community_hub_01/02`, `dt_electric_01/02`, `dt_first_aid_fracture_02/03`). Previously 3 of 4 were stub-only.
*   **C2 — Emergency Dialing**: `tel:1669` direct dial functional. `Call Direct Rescue` (Red board) uses `route: { type: 'tel', to: emergencyNumber }` with proper `window.location.href` handler.
*   **C3 — Multilingual Fallback Keywords**: `emergency_fallback.json` keywords expanded to include Thai and Malay terms alongside English.
*   **C4 — Public Sans Font**: Google Fonts Public Sans loaded via `<link>` in `index.html`. Font rendering consistent across all devices.

#### High
*   **H1 — lastUpdated Timestamp**: Dynamic `lastUpdated` field replaces hardcoded date string.
*   **H2 — Onboarding Modal**: Onboarding modal accessible from Settings for users who need to re-configure.
*   **H3 — Alert Ticker Semantics**: `LiveAlertTicker` now uses `tickerColors` map for dynamic background per risk level (green/yellow/orange/red). Yellow uses `text-gray-900` for WCAG legibility.
*   **H4 — Action Route Handlers**: Orange "Move to Safe Hub" routes to `/map`. Red "Call Direct Rescue" routes to `tel:emergencyNumber`. Previously both incorrectly routed to AI assist.

#### Minor
*   **M6 — PWA Manifest Icons**: Split single icon entry into two entries with `purpose: 'any'` and `purpose: 'maskable'` per PWA spec requirement.

### Changed
*   `AIQuickAssist.tsx`: Removed manual language prefix injection (`"Language context: ${language}. Situation: ..."`). GIGA-119 auto-detects language from raw user input via few-shot conditioning.
*   `ollama.ts`: Message format updated from single `prompt` string to `messages[]` array (`system` + `user` roles) to match Ollama `/api/chat` specification.
*   README: Updated prerequisites (`qwen3:1.7b`), Key Features section, added GIGA-119 section, updated docs directory with new `gaia-119.md` link, refreshed Known Limitations.

---

## [0.1.0] - 2026-02-28 (MVP Completion)

### Added
*   **Core Architecture**: Initialized React + TypeScript + Vite project structure.
*   **PWA Integration**: Added `vite-plugin-pwa` for complete offline caching of the App Shell.
*   **True On-Device AI**: Integrated `@mlc-ai/web-llm` (`Qwen2.5-1.5B-Instruct-q4f16_1-MLC`) for fully offline, WebGPU-accelerated emergency response generation.
*   **Offline Dictionary Failsafe**: Included `emergency_fallback.json` as a robust backup if the AI model is not downloaded.
*   **Onboarding Wizard**: 4-step initial setup to capture Language, Location, Household size, and Medical needs, storing to a global `ThemeContext`.
*   **AI Engine Download UI**: Added an interactive download button to the final Onboarding step with sub-MB level precision progress tracking.
*   **Cognitive UI/UX**: Implemented ISO safety color semantics (Green/Yellow/Red) and dynamic "Do Now" action boards.
*   **Community Hubs**: Offline simulated P2P hub map (Temples, Mosques, Schools) filtered by the selected user region.
*   **Windy.com Radar Integration**: Embedded a live weather radar with dynamic visual risk legend overlay (falls back to offline mode when disconnected).

### Changed
*   Refactored `Settings.tsx` to read natively from the contextualized global states.
*   Implemented a 3-tier offline architecture: `WebLLM` is now the primary on-device engine, with `Ollama` acting as a dev-optional fallback, and `emergency_fallback.json` as the final safety net.
*   Restructured `App.tsx` routing to enforce the Onboarding flow on first launch.

### Security & Integrity
*   Passed `eslint` and `tsc` rigorous Type checking.
*   Passed Sentinel Cognitive Audit for Minimal Text Input requirements (Panic-friendly UI).
