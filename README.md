# Flood Ready (v0.6.0)

> **"A True Offline-First, On-Device AI Disaster Survival Application"**

![Version](https://img.shields.io/badge/version-0.6.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Offline--First-5A0FC8?logo=pwa)
![WebGPU](https://img.shields.io/badge/WebGPU-On--Device_AI-FF4F00)
![Open-Meteo](https://img.shields.io/badge/Weather-Open--Meteo-0080FF)
![Chrome](https://img.shields.io/badge/Chrome-113%2B_required-4285F4?logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

**Flood Ready** is a hyper-localized, offline-first emergency response PWA built for the Yala region (Thailand). It combines **Cognitive Engineering**, **True On-Device AI** (Qwen 2.5 via WebLLM/WebGPU), the **GAIA-119 intent-based AI persona**, and **QR-P2P device-to-device communication** to maximize survival rates when cell towers, power, and internet all fail simultaneously.

---

## Core Philosophy: "Verification & Survival"

Every button, color, and interaction is engineered to save lives under extreme cognitive load. The guiding axiom: **on-board AI only** — no cloud dependency, no remote inference fallback. The entire intelligence stack runs on the user's device.

---

## Key Features

### GAIA-119 On-Device Emergency AI (Streaming)
An intent-based AI persona built on CR-EP and AESE-CrisisShield + ResponseFusion frameworks. Delivers survival-critical instructions in English, Thai, and Malay — auto-detected from raw user input. Streams token-by-token via WebGPU (first token ~2s). Every response is structured JSON: `{ level, actions[], treeId?, searchQuery }`.

**SITUATION OVERRIDE**: User's explicit emergency signals always override passive sensor/weather context. "Water entering house" → RED, regardless of `[WEATHER: Rain 0mm]`.

**treeId Validation**: AI-suggested decision tree routes are validated client-side against `decisionTreeData.nodes` before the CTA button renders — prevents hallucinated dead-ends.

### True Offline-First AI Architecture
Downloads **`Qwen2.5-1.5B-Instruct-q4f16_1-MLC`** (~1.2GB) into the browser's IndexedDB via WebGPU. Primary inference runs 100% offline via WebLLM with real-time streaming. Fallback chain: WebLLM → Ollama (dev-optional) → Offline keyword dictionary.

### Real-Time 72h Forecast Intelligence
A single Open-Meteo API request supplies both current conditions and a 72-entry hourly precipitation array. `ThemeContext` computes `forecastRisk` and `forecastMaxRain` for three windows (12h / 24h / 72h) using WMO + Thai Met Dept peak precipitation thresholds:

| Rain Rate | Risk Level |
|-----------|-----------|
| < 1 mm/h | GREEN |
| 1 – 5 mm/h | YELLOW |
| 5 – 15 mm/h | ORANGE |
| ≥ 15 mm/h | RED |

Home screen tabs (`Now`, `Next 12h`, `Next 24h`, `Next 72h`) display real forecast risk sourced live from ThemeContext — no hardcoded values. The Live Alert Ticker shows: `"FORECAST NEXT 24H: Yala — Peak rain: 0.1mm/h · No significant rain · GREEN RISK"`.

### QR-P2P Offline Communication
True device-to-device data transfer with zero infrastructure — no internet, no Bluetooth, no server. Three payload types:

- **SOS Beacon**: Encodes situation text + GPS coordinates + household/medical profile into a QR code. Show the screen to anyone with a camera.
- **Hub Status**: Encodes a registered safe hub (name, coordinates, status, services). Anyone who scans it adds the hub to their local map instantly.
- **Relay Chain**: After scanning a received QR, one tap re-wraps it as a relay payload (hop+1). Creates a "telephone chain" that propagates data across completely offline phones. Capped at 5 hops.

Uses the **Web `BarcodeDetector` API** (Chrome 113+ — already required for WebGPU). QR generation via `qrcode.react` (SVG). Zero new runtime dependencies for scanning.

### Quick Assist — 24-Card Library + Priority Right Now
Risk-stratified 3-layer guidance system:
- **Priority Right Now**: 6–8 cards computed from current risk level + household profile. Zero AI required.
- **Browse All**: 24 categorized cards across 6 domains (Flood & Water, Medical, Supplies, Shelter, Communication, Family & Vulnerable). Routes to decision trees, AI queries, or direct navigation.
- **AI Insight Mid-Flow**: `aiHint` cards appear inline at critical decision tree nodes — context-aware survival tips in EN/TH/MS.

### Safe Hub Map
Interactive hub map with region-aware sorting, status indicators (Open/Full/Closed/Unknown), service icons, and Google Maps deep-link integration. Community-submitted hubs (via QR-P2P or in-app registration) are visually distinguished from admin-verified data.

### PWA Architecture
Entire application shell (HTML/JS/CSS) cached via Service Worker. App boots instantly at `0 bytes/sec`. WebGPU model cached in IndexedDB after first download.

---

## GAIA-119 — On-Device Emergency Intelligence

GAIA-119 is the AI persona powering the `Ask AI (GAIA-119)` feature. Not a generic chatbot — engineered as a **Thai National Disaster Response AI (AESE-CrisisShield)** with a fixed mission: deliver survival-critical action orders in under 5 seconds.

**Design principles:**
- **CR-EP Why Framework**: Every output constraint is anchored to a measurable survival goal (≤12 words/action, decision < 5 seconds)
- **5-Module AESE Pipeline**: EmergencySignalScanner → UrgencyClassifier → CalmToneInfuser → CognitiveFocusRedirector → ContactProtocolRecommender
- **ResponseFusion Dual-Pipeline**: Calm-sounding inputs scanned for hidden crisis signals before urgency classification
- **SITUATION OVERRIDE**: Explicit user situation always overrides passive sensor context
- **Zero-drift multilingual output**: 3-language few-shot examples (EN/TH/MS) ensure consistent JSON structure

See [`docs/gaia-119.md`](./docs/gaia-119.md) for the full technical specification.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 7 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v7 |
| AI Engine | @mlc-ai/web-llm (WebGPU) |
| AI Model | Qwen2.5-1.5B-Instruct-q4f16_1-MLC (~1.2GB) |
| AI Persona | GAIA-119 (AESE-CrisisShield + ResponseFusion) |
| Weather API | Open-Meteo (free, no API key, 72h forecast) |
| QR Generate | qrcode.react (SVG) |
| QR Scan | Web BarcodeDetector API (native, no library) |
| Offline | PWA + Service Worker + Cache API + IndexedDB |
| Icons | Lucide React |

---

## Documentation (`/docs`)

1. [**Core Technology**](./docs/core-technology.md) — WebLLM, Vite PWA, Streaming Architecture, Offline Fallback Chain, Real-Time Weather Intelligence
2. [**GAIA-119 AI Persona Spec**](./docs/gaia-119.md) — Intent-based persona ontology, AESE pipeline, context injection, rain threshold calibration
3. [**Usability & Cognitive Engineering**](./docs/usability.md) — ISO Safety Colors, Haptic design, Dynamic UI, Rain Mode accessibility
4. [**Usage Guide**](./docs/usage.md) — Onboarding, WebLLM initialization, Quick Assist flows, Forecast Tabs, Hub registration
5. [**dev.to Article**](./docs/devto-article.md) — Technical deep-dive: WebGPU streaming, GAIA-119 architecture, QR-P2P protocol, lessons learned

---

## Prerequisites

- **Node.js** >= 20 (required for Vite 7)
- **Browser**: Chrome 113+ or Edge 113+ (required for WebGPU on-device AI). Firefox not supported. Safari has experimental WebGPU support.
- **(Optional Dev)**: Ollama on port 11434 with `qwen3:1.7b` pulled

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

1. `npm run build` — generates `/dist`
2. Deploy `/dist` to any static edge host: **Vercel**, **Netlify**, **Cloudflare Pages**
3. **HTTPS required** — WebGPU and Service Workers only function over secure contexts

---

## Known Limitations

- **AI Response Time**: WebGPU inference takes 15–30 seconds per response. Streaming delivers first tokens in ~2 seconds. Users are informed upfront.
- **WebGPU Requirement**: Chrome 113+ or Edge 113+ required. Fallback chain (Ollama → keyword dictionary) activates automatically on unsupported browsers.
- **Model Pre-download**: The ~1.2GB Qwen model must be downloaded before first use. Users who skip receive keyword-based fallback responses.
- **PWA Icons**: The PWA manifest uses a placeholder `vite.svg`. Replace with production icons (192×192, 512×512 PNG) before public release.
- **QR-P2P Relay**: Each relay hop requires physical camera scanning. Not a replacement for a full mesh protocol (e.g., libp2p, gun.js) — designed as an infrastructure-free fallback.
