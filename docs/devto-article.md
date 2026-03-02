# I Survived a 300-Year Flood and Built an AI That Works Without Internet

*This is a submission for the [DEV Weekend Challenge: Community](https://dev.to/challenges/weekend-2026-02-28)*

---

## The Community

I'm a Korean developer living in Yala Province, southern Thailand — with my Thai wife and two young children.

This past rainy season brought what meteorologists called a **300-year flood event** to our region. Thailand, Malaysia, and Indonesia have always dealt with seasonal flooding, but climate change has made the annual flooding dramatically worse. In 2026, the [Global Climate Risk Index](https://www.germanwatch.org/) ranks this region among the **highest-risk zones on the planet**.

I was in it. Not reading about it. In it.

And what I experienced wasn't just the water. It was the **collapse of information itself**.

**Three things failed simultaneously that no disaster prep guide prepares you for:**

**1. No control tower.** The government couldn't make fast decisions. Official evacuation orders arrived hours late or not at all. Families were left choosing between "stay and hope" versus "leave now and lose everything" — with zero reliable guidance.

**2. Communications died.** Heavy rain disrupted cell signals. Towers flooded. The internet went out at the exact moment when people were searching for answers. I watched neighbors with smartphones and no signal, refreshing empty screens.

**3. The information that did spread was wrong.** Instagram, Facebook, Line groups — all flooded with unverified posts. "The dam broke." "Road X is clear." "Go to Y shelter." Half of it was false. Some of it made people move *toward* danger. The noise of social media was actively harmful.

What we needed wasn't another weather app. We needed something that could answer **"what do I do right now"** when every network was down — something that understood we had children, that my wife reads Thai, that we might have 10 minutes before the ground floor was impassable.

I built **Flood Ready** over two days, pulling from prior work I had on AI personas and offline architectures. It's not perfect. But it's built from the inside of that experience, not from a conference room.

---

## What I Built

**Flood Ready** is an offline-first emergency PWA. A real 1.5B-parameter AI model runs inside the browser tab. No server, no API key, no internet required after the first load.

<!-- GIF_PLACEHOLDER: full app walkthrough -->

**Seven systems working together:**

| # | System | What it does |
|---|---|---|
| 1 | **True On-Device AI** | Qwen2.5-1.5B via WebGPU — 100% offline inference |
| 2 | **GAIA-119 Persona** | Disaster-tuned AI with hard behavioral constraints |
| 3 | **72h Forecast Intelligence** | Real-time risk classification: Green / Yellow / Orange / Red |
| 4 | **Cognitive Engineering UX** | Designed for hands that are wet and shaking |
| 5 | **3-Tier Resilience Fallback** | The app never goes completely silent |
| 6 | **QR-P2P Offline Mesh** | Device-to-device SOS relay — no internet, no Bluetooth |
| 7 | **Full PWA** | 12 languages, community hub map, works at 0 Mbps |

**Live:** https://flood-ready.vercel.app

---

## Demo

<!-- GIF_PLACEHOLDER: demo gif here -->

**Live demo:** https://flood-ready.vercel.app
**Source:** https://github.com/flamehaven01/flood-ready

---

## Code

{% github flamehaven01/flood-ready %}

---

## How I Built It

Each technical decision traces back to something that failed during the flood. Here's the full breakdown.

---

### 1. True On-Device AI (WebGPU + Qwen2.5-1.5B)

The fundamental insight: **cloud AI fails at exactly the wrong moment.**

```
Disaster strikes
      ↓
Internet goes down         ← ChatGPT, Claude, Gemini all go silent
      ↓
User needs survival help   ← Flood Ready still works here
```

**Stack:**
- Model: `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` (~1.2GB)
- Engine: `@mlc-ai/web-llm` — WebGPU inference directly in the browser
- Storage: Browser `IndexedDB` — downloaded once, cached permanently

**Streaming output** keeps the UX alive during the 15–30 second inference time:

```typescript
const stream = await engine.chat.completions.create({
  messages: [...],
  temperature: 0.1,
  max_tokens: 200,
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content || "";
  accumulated += delta;
  onChunk?.(accumulated); // tokens appear as they generate, ~2s to first token
}
```

Instead of hiding the wait, we're honest about it:
> *"Processing 100% offline via WebGPU. May take 15–30 seconds."*

In a disaster, 30 seconds of accurate guidance is worth more than instant silence.

**Lesson learned:** `response_format: json_object` caused 10x slowdowns in WebLLM — it applies logit-level token masking on every single token. Switched to a 2-stage regex parser:

```typescript
try { return JSON.parse(reply); }
catch {
  const match = reply.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  return getFallbackAction(situation); // always has an answer
}
```

---

### 2. GAIA-119 — Disaster AI Persona

Raw LLMs give vague, dangerous advice in emergencies. During the flood, the last thing anyone needed was "Stay safe and be careful of your surroundings."

I designed the **GAIA-119** system prompt around a strict behavioral contract. The model isn't just answering — it's executing a 5-stage pipeline on every query:

```
EmergencySignalScanner    → detect hidden distress even in calm phrasing
UrgencyClassifier         → RED if confidence ≥ 0.7
CalmToneInfuser           → rescue-radio register (no panic, no filler)
CognitiveFocusRedirector  → max 12 words per action item
ContactProtocolRecommender → RED always ends with local emergency number
```

**Hard rules enforced in the prompt:**

```
[CRITICAL] NEVER output vague safety platitudes
[CRITICAL] EVERY action begins with a CAPS imperative verb
[CRITICAL] Max 4 actions, ordered most-critical-first
[CRITICAL] level MUST be exactly "red" | "yellow" | "green"
[CRITICAL] Auto-detect language from input. Respond in same language.
[CRITICAL] SITUATION OVERRIDE: user's words always beat sensor data.
           If user writes "water entering house" → level = red,
           regardless of Rain=0mm in weather context.
```

The SITUATION OVERRIDE rule came directly from a bug: `[WEATHER: Rain 0mm]` caused the model to respond with GREEN risk when a user typed "water coming under the door." Weather sensors lie. People don't.

Output is always structured JSON:

```json
{
  "level": "red",
  "summary": "Floodwater entering home. 2–3 minutes before lower floor dangerous.",
  "actions": [
    "MOVE children to top floor immediately",
    "CUT main power at circuit breaker",
    "CALL 1669 — state address and family size"
  ],
  "treeId": "dt_flood_evac_01"
}
```

When a `treeId` is returned, a "Start Step-by-Step Flow" button routes users into an interactive decision tree — validated client-side so hallucinated IDs never create dead links.

---

### 3. Real-Time 72h Forecast Intelligence

The four risk levels — **Green / Yellow / Orange / Red** — drive everything in the UI: color theme, action cards, AI context, and the forecast display.

```
Green   < 1mm/h   → normal preparedness mode
Yellow  1–5mm/h   → early action recommended
Orange  5–15mm/h  → urgent preparation required
Red     ≥ 15mm/h  → evacuation / survival mode
```

Classification uses **Open-Meteo** single-request hourly data, with a peak-in-window function for 12h/24h/72h forecasting:

```typescript
function peakInWindow(precip: number[], startIdx: number, hours: number): number {
  const slice = precip.slice(startIdx, startIdx + hours).map(v => isNaN(v) ? 0 : v);
  return slice.length > 0 ? Math.max(0, ...slice) : 0;
}
```

One subtle bug that took real effort to fix: browser timezone (UTC+9 Korea) vs. app region (UTC+7 Thailand) caused forecast windows to be off by 2 hours. Solved by forcing `timezone=UTC` in the API request and using `getUTCHours()` throughout — something most existing weather apps silently get wrong.

Real-time ticker when online:
> *"FORECAST NEXT 24H: Yala — Peak rain: 8.2mm/h · ORANGE RISK"*

Falls back gracefully to last known data when offline.

---

### 4. Cognitive Engineering UX

This is the design decision I'm most proud of and the one that took the most deliberate thinking.

During the flood, I noticed something: **people couldn't make decisions.** Not because they were unintelligent — because cognitive overload under stress causes decision paralysis. The more options available, the worse the outcome.

Every UX choice targets this directly:

- **Max 4 action cards per risk level** — research on crisis decision-making consistently shows >4 options causes paralysis
- **CAPS imperative verbs** — scannable under stress ("MOVE", "CUT", "CALL" vs. "You should consider moving")
- **ISO safety color system** — Green/Yellow/Orange/Red are internationally standardized safety signals, not design choices
- **Rain Mode** — font size 1.5x, larger tap targets for wet fingers
- **No-Typing Quick Assist** — 24 pre-built scenario cards + a rules engine that recommends relevant cards based on current risk level (50ms, no AI needed)
- **Bottom 40% navigation** — all primary actions reachable by one thumb without repositioning grip

The goal: someone standing in rising water with shaking hands and a wet phone screen can navigate this app.

---

### 5. 3-Tier Resilience Fallback

The app was designed to **never go completely silent**, even if every advanced layer fails:

```
Tier 1: WebLLM (WebGPU + Qwen2.5)     → intelligent, context-aware responses
Tier 2: Keyword dictionary (JSON)      → instant, offline, pattern-matched guidance
Tier 3: Hardcoded defaults             → always available, zero dependencies
```

Additionally, every `treeId` returned by the AI is validated against a known list client-side before any UI element renders. A 1.5B model will occasionally hallucinate a structured ID. The user never sees a button that leads nowhere.

---

### 6. QR-P2P Offline Mesh (v0.6.0)

After building the AI layer, I hit the second problem from the flood: **how do you communicate with someone nearby when there's no internet?**

The answer was hiding in existing browser APIs: `BarcodeDetector` (Chrome 83+, zero additional dependencies, already required for the app to run).

**Three payload types, all under 300 bytes:**

```
hub    → safe shelter location + capacity + available services
sos    → GPS + situation text + household profile + medical flags
relay  → wraps any payload + hop count (max 5)
```

The relay chain is the key innovation. Each person who scans a QR can re-wrap it as a relay, incrementing the hop count:

```typescript
export function makeRelayPayload(
  orig: HubQRData | SOSQRData,
  prevHops = 0
): RelayQRData {
  return {
    v: 1,
    t: 'relay',
    ts: Date.now(),
    hops: Math.min(prevHops + 1, 5),
    orig,
  };
}
```

Practical result: **Person A (no signal) scans → Person B → Person C → rescue coordinator** receives the SOS. Five hops, five completely offline phones, zero network infrastructure. No Bluetooth pairing. No WiFi Direct setup. Just cameras.

Payload TTLs are enforced on scan: SOS expires after 2 hours, Hub status after 6 hours. Stale data is rejected before display — in a disaster, old information can be more dangerous than no information.

---

### 7. Full PWA + Community Hub Architecture

- **Service Worker** caches the entire app shell → native app performance at 0 Mbps
- **12 language support** (Thai, Malay, English + 9 others) with auto-detection
- **Community Hub Map** — residents can register local shelters (mosques, temples, schools) and share their coordinates via QR to others without internet
- **Citizen-contributed offline map** — as hubs are registered and QR-shared, the map grows through the community itself

---

### Honest Limitations

This was built in two days. I had prior work to draw from — AI persona research, offline architecture patterns, compression algorithms — but the integration was fast and some rough edges show:

- WebGPU requires Chrome 113+. Safari users can't use the AI layer (fallback tiers still work).
- The relay chain works in testing but hasn't been stress-tested across actual hardware at scale.
- The community hub map is local-first — there's no sync mechanism yet. Two phones in the same village will have separate hub lists unless they explicitly QR-share.

The architecture is sound. The implementation needs more time than a weekend.

---

### The Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite 7 |
| Styling | Tailwind CSS |
| Routing | React Router v7 |
| AI Engine | @mlc-ai/web-llm (WebGPU) |
| AI Model | Qwen2.5-1.5B-Instruct-q4f16_1-MLC |
| Weather | Open-Meteo API |
| Offline | PWA + Service Worker + Cache API |
| QR/Scan | Web BarcodeDetector API |
| Hosting | Vercel |

---

*Built in Yala Province, Thailand — where the flood was not a case study.*
*Stack: React 19 + WebLLM + Qwen2.5 + Tailwind + Open-Meteo + QR-P2P*

---

**Tags:** `webgpu` `llm` `disaster-response` `offline-first` `react` `pwa` `community` `qr-code` `thailand` `ai`
