# Flood Ready Yala (v0.4.0)

> **"A True Offline-First, On-Device AI Disaster Survival Application"**

**Flood Ready Yala** is a hyper-localized, offline-first emergency response progressive web application (PWA) designed for the Yala region (Thailand). It integrates **Cognitive Engineering** principles, **True On-Device AI (Qwen 2.5 via WebLLM/WebGPU)**, and the **GAIA-119 Intent-Based AI Persona** to maximize survival rates during extreme weather and infrastructure failures (cell tower collapse, power outages, network blackouts).

## The Core Philosophy: "Verification & Survival"

Built with offline-first disaster survival principles at every layer. This application rejects UI bloat — every button, color, and interaction is engineered to save lives when users are under extreme cognitive load. The guiding axiom: **on-board AI only**. No cloud dependency. No fallback to remote inference. Everything runs on the user's device.

---

## Key Features

### GAIA-119 On-Device Emergency AI (Streaming)
An intent-based AI persona engineered via CR-EP and AESE-CrisisShield + ResponseFusion frameworks. Delivers survival-critical instructions in English, Thai, and Malay — auto-detected from raw user input. Responses stream token-by-token via WebGPU (first token ~2s). Every response is structured JSON: `{ level, actions[], treeId?, searchQuery }`.

**SITUATION OVERRIDE**: User's explicit emergency signals always override passive sensor/weather context. "Water entering house" → RED, regardless of `[WEATHER: Rain 0mm]`.

**treeId Validation**: AI-suggested decision tree routes are validated client-side against `decisionTreeData.nodes` before the CTA button renders — prevents hallucinated dead-ends.

### True Offline-First AI Architecture
Downloads the **`Qwen2.5-1.5B-Instruct-q4f16_1-MLC`** engine (~1.2GB) into the browser's IndexedDB via WebGPU. Primary inference runs 100% offline via WebLLM with real-time streaming. Fallback chain: WebLLM → Ollama (dev-optional, `qwen3:1.7b`) → Offline keyword dictionary.

### Quick Assist — 24-Card Library + For You
3-layer emergency guidance system:
- **Layer 1 — For You**: Rule-based personalized cards computed from household profile + risk level + weather data. Zero AI required.
- **Layer 2 — Category Cards**: 24 categorized cards across 6 domains (Flood & Water, Medical Emergency, Supplies, Shelter, Communication, Family & Vulnerable). Routes to decision trees, AI queries, or direct navigation.
- **Layer 3 — AI Insight Mid-Flow**: `aiHint` cards appear inline at critical decision tree nodes — context-aware survival tips localized in EN/TH/MS.

### Community Hub Registration (P2P Simulation)
Users can register new safe hubs (Mosques, Temples, Schools, Community Centers, Government Buildings) directly from the map. GPS auto-detection, service selection, real-time broadcast simulation. Community-submitted hubs are visually distinguished ("Community Report" badge) from admin-verified data.

### Safe Hub Map
Interactive hub map for the Yala region with region-aware sorting, status indicators (Open/Full/Closed/Unknown), service icons, and universal Google Maps deep-link integration (works for all hubs, includes "Thailand" for search accuracy).

### PWA (Progressive Web App) Architecture
The entire application shell (HTML/JS/CSS) is cached via Service Worker. App boots instantly in a `0 bytes/sec` environment. WebGPU model cached in IndexedDB after first download.

---

## GAIA-119 — On-Device Emergency Intelligence

GAIA-119 is the AI persona powering the `Ask AI (Qwen)` feature. It is not a generic chatbot. It is engineered as a **Thai National Disaster Response AI (AESE-CrisisShield)** with a fixed mission: deliver survival-critical action orders in under 5 seconds.

**Design principles:**
- **CR-EP Why Framework**: Every output constraint is anchored to a measurable survival goal (≤12 words/action, decision < 5 seconds)
- **5-Module AESE Pipeline**: EmergencySignalScanner → UrgencyClassifier → CalmToneInfuser → CognitiveFocusRedirector → ContactProtocolRecommender
- **ResponseFusion Dual-Pipeline**: Calm-sounding inputs scanned for hidden crisis signals before urgency classification
- **SITUATION OVERRIDE**: Explicit user situation always overrides passive sensor context
- **Zero-drift multilingual output**: 3-language few-shot examples (EN/TH/MS) ensure consistent JSON structure

See [`docs/gaia-119.md`](./docs/gaia-119.md) for the full technical specification.

---

## Documentation Directory (`/docs`)

1. [**Core Technology**](./docs/core-technology.md): WebLLM, Vite PWA, Streaming Architecture, Offline Fallback Chain.
2. [**GAIA-119 AI Persona Spec**](./docs/gaia-119.md): Intent-based persona ontology, AESE module pipeline, prompt engineering rationale.
3. [**Usability & Cognitive Engineering**](./docs/usability.md): ISO Safety Colors, Haptic design, Dynamic UI, Rain Mode accessibility.
4. [**Usage Guide**](./docs/usage.md): Onboarding, WebLLM initialization, Quick Assist flows, Hub registration.
5. [**dev.to Article**](./docs/devto-article.md): Technical deep-dive — WebGPU streaming, GAIA-119 architecture, lessons learned.

---

## Prerequisites

- **Node.js**: >= 20 (required for Vite 7)
- **Browser**: Chrome 113+ or Edge 113+ (required for WebGPU on-device AI). Firefox not supported. Safari has experimental support.
- **(Optional Dev)**: Ollama on port 11434 with `qwen3:1.7b` pulled (`ollama pull qwen3:1.7b`)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

## Deployment

1. `npm run build` — generates `/dist`
2. Deploy `/dist` to any static edge host: **Vercel**, **Netlify**, **Cloudflare Pages**
3. **HTTPS required** — WebGPU and Service Workers only function over secure contexts

---

## Known Limitations

- **AI Response Time**: WebGPU inference takes 15–30 seconds for a full response. Streaming provides first visible tokens in ~2 seconds. Users are informed upfront: "Processing 100% offline via WebGPU."
- **WebGPU Requirement**: Chrome 113+ or Edge 113+ required. Fallback chain activates automatically on unsupported browsers.
- **Model Pre-download**: The ~1.2GB Qwen model must be downloaded during onboarding. Users who skip the download receive keyword-based fallback responses.
- **PWA Icons**: The PWA manifest uses a placeholder `vite.svg`. Replace with production icons (192×192, 512×512 PNG) before public release.
- **P2P Simulation**: Community hub broadcasts simulate P2P behavior via localStorage. Production would require a real mesh/relay protocol (e.g., libp2p, gun.js).
