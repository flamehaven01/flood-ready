# Core Technology

Flood Ready Yala is designed to operate perfectly in environments with total communication blackouts — power failures, cell tower collapse, zero network signal. It achieves this by combining modern web architecture with lightweight on-device AI inference. This document covers the three technical pillars that make that possible.

---

## 1. True On-Device AI: `@mlc-ai/web-llm`

Traditional mobile AI apps require either a cloud server connection, or a background inference engine running locally (e.g., Ollama, MLX) that the app communicates with via a proxy. Both approaches fail when the network goes down.

**Flood Ready Yala's approach:**
- Uses the browser's **WebGPU** directly as the inference compute engine — no background process, no server.
- Downloads **`Qwen2.5-1.5B-Instruct-q4f16_1-MLC`** (~1.2GB) into the browser's IndexedDB on first run. This is a one-time operation.
- After the model is cached, all inference runs 100% offline through the `useAI()` hook. The device analyzes the user's situation and returns a structured JSON response with no external calls of any kind.

**Streaming inference (v0.4.0):** The engine runs with `stream: true`, delivering first visible tokens in ~2 seconds. The user sees the AI responding in real time rather than waiting through a frozen loading screen, even though the full response takes 15–30 seconds.

---

## 2. Progressive Web App (PWA) Offline-First Cache

Caching the AI model alone is not enough for offline operation. When the user refreshes the app, the browser still needs to load the HTML, JavaScript, and CSS assets.

**Flood Ready Yala's approach:**
- Uses `vite-plugin-pwa` to cache the entire App Shell (HTML, JS, CSS, icons) via a Service Worker.
- In a `0 Mbps` disaster environment, the application loads at the same speed as a native app — the Service Worker intercepts the request and responds from cache before any network attempt is made.

---

## 3. Resilience Fallback: The `emergency_fallback.json` Dictionary

What happens if a user encounters a disaster before downloading the 1.2GB AI model?

**Flood Ready Yala's approach:**
- A fail-safe system checks model availability on every query. If the engine is not loaded, the fallback activates immediately — no error state, no dead end.
- `emergency_fallback.json` is a curated offline keyword dictionary covering critical disaster scenarios in 12 languages.
- The user's input is parsed for high-signal keywords (flood, snake, electrocution, bleeding, etc.) and matched against hard-coded survival action cards. Zero dependencies. Instant response.

---

## The Fallback Chain

```
[1] WebLLM (Primary)
    Qwen2.5-1.5B — 100% offline, WebGPU, IndexedDB cached
    Requires: Chrome/Edge 113+, ~1.2GB pre-download
         |
         v (model not loaded / WebGPU unavailable)
[2] Ollama Dev Proxy (Optional)
    qwen3:1.7b via localhost:11434
    Development use only
         |
         v (unavailable / inference error)
[3] emergency_fallback.json (Always available)
    Keyword-matched hard-coded survival cards
    Zero dependencies. Zero network. Instant.
```

All three tiers produce responses using the same `EmergencyAction` interface (`level`, `actions`, `searchQuery`, `treeId?`), making the UI rendering path identical regardless of which tier responded.
