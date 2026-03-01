# I Built an AI That Works When the Internet Dies — For Flood Victims in Thailand

> **TL;DR:** I built a disaster response app where a real 1.5B-parameter AI model runs entirely inside your browser tab — no server, no API key, no internet required. It gives survival instructions in 3 languages when floods cut off all communications in Yala Province, Thailand.

---

## The Problem Nobody Talks About

Every major AI assistant — ChatGPT, Claude, Gemini — shares the same fatal flaw for disaster scenarios:

**They require internet.**

In Yala Province, southern Thailand, flash floods regularly knock out power lines, cell towers, and internet infrastructure simultaneously. The exact moment when people need survival guidance the most is the exact moment every cloud-based AI goes silent.

Existing disaster apps fall into two categories:
- **Static PDFs / pamphlets** — useful, but zero intelligence, no personalization
- **Cloud AI chatbots** — intelligent, but dead on arrival when networks fail

I wanted to build something in the gap between those two.

---

## The Core Insight

```
Disaster strikes
      ↓
Internet goes down         ← cloud AI fails here
      ↓
User needs survival help   ← this app still works here
```

What if the AI model itself lived inside the browser — downloaded once over Wi-Fi, then running entirely on the user's GPU with zero network dependency?

That's **WebGPU inference**, and it's what makes Flood Ready Yala different.

---

## How It Works (Technical Architecture)

### The AI Stack

**Model:** Qwen2.5-1.5B-Instruct (q4f16 quantized, ~1.2GB)
**Engine:** [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) — runs inference via WebGPU directly in the browser
**Persona:** GAIA-119 (AESE-CrisisShield) — a disaster-tuned system prompt

The model is downloaded once during onboarding and cached in the browser. After that, it works with airplane mode on.

### The Inference Pipeline

```
User types situation
        ↓
Context injection:
  [Location: Yala - Mueang Yala]
  [HOUSEHOLD: family_with_kids]
  [MEDICAL: special_needs]
  [WEATHER: Rain 8mm Temp 32C Wind 24kmh]
  [RISK: HIGH]
        ↓
Qwen2.5-1.5B (WebGPU, fully offline)
        ↓
Structured JSON output:
  level / summary / actions[] / details[] / priorities[] / treeId / searchQuery
        ↓
React UI renders priority-badged action cards
```

### The Fallback Chain

No AI is 100% reliable. The app has three layers:

```
1. Qwen WebGPU (AI loaded)     → intelligent, context-aware response
2. JSON keyword dictionary      → instant, offline, keyword-matched
3. Hardcoded default            → always available, zero dependencies
```

---

## GAIA-119: The Persona That Makes It Work

Raw LLMs give vague, dangerous advice in emergencies. "Be careful and stay safe" is useless to someone standing in floodwater.

I designed the **GAIA-119** system prompt around a strict set of hard lines:

```
[CRITICAL] NEVER output vague safety platitudes
[CRITICAL] EVERY action starts with a CAPS imperative verb
[CRITICAL] Max 4 actions, ordered most-critical-first
[CRITICAL] level MUST be "red" | "yellow" | "green"
[CRITICAL] Detect language from input. Respond in same language.
[CRITICAL] User's explicit words ALWAYS override sensor data.
           If user says "water entering house" → red, even if Rain=0mm
```

The output format is strict JSON:

```json
{
  "level": "red",
  "summary": "Floodwater entering home. 2-3 minutes before lower floor dangerous.",
  "actions": [
    "MOVE children to top floor immediately",
    "CUT main power at circuit breaker",
    "CALL 1669 — state address and family size"
  ],
  "details": [
    "Rising water exhausts children faster",
    "Water + electricity = fatal shock",
    "Rescue teams prioritize reported families"
  ],
  "priorities": ["CRITICAL", "CRITICAL", "CRITICAL"],
  "treeId": "dt_flood_evac_01",
  "searchQuery": "flood home children evacuation Thailand"
}
```

Three languages supported: English, Thai (ภาษาไทย), Malay (Bahasa Melayu) — auto-detected from user input.

---

## The Speed Problem (and What We Did About It)

Running a 1.5B model on a laptop GPU via WebGPU takes **15–30 seconds** for a response. On flagship smartphones, around 20 seconds. On a desktop with a decent GPU, closer to 5 seconds.

That's not fast. But it's also not nothing. Here's how we made the wait survivable:

**Streaming output** — first tokens appear in ~2 seconds. The user sees the AI "thinking" in real time rather than staring at a frozen screen.

```typescript
const stream = await engine.chat.completions.create({
  messages: [...],
  temperature: 0.1,
  max_tokens: 200,
  stream: true,  // tokens appear as they generate
});

let accumulated = "";
for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content || "";
  accumulated += delta;
  onChunk?.(accumulated);  // update UI with each token
}
```

**Honest UX copy** — instead of hiding the wait, we explain it:
> *"Processing 100% offline via WebGPU. May take 15–30 seconds."*

In a disaster context, 30 seconds of waiting for accurate AI survival instructions beats 0 seconds of getting nothing.

---

## Auto-Routing: AI Picks the Decision Tree

One feature I'm particularly proud of: the AI doesn't just answer — it routes users to an interactive decision tree when it detects a situation that matches one.

The system prompt includes a routing table:

```
TREE_ROUTING:
"dt_flood_evac_01"    → flood water / water entering building / evacuate
"dt_gobag_01"         → emergency bag / go-bag / what to pack
"dt_electric_01"      → electrical hazard / downed power line
"dt_first_aid_01"     → bleeding / fracture / CPR
"dt_community_hub_01" → shelter / mosque / temple / community help
```

When the model includes a `treeId` in its output, a "Start Step-by-Step Guided Flow" button appears that routes directly into a branching decision tree — validated client-side against the JSON so hallucinated IDs never cause dead ends.

---

## Personalization: Context That Matters

Every query is enriched with the user's onboarding profile before it hits the model:

```typescript
const ctxParts = [
  `[Location: ${region}]`,
  household ? `[HOUSEHOLD: ${household}]` : null,
  medicalNeeds ? `[MEDICAL: special_needs]` : null,
  weatherData ? `[WEATHER: Rain ${weatherData.rain}mm Temp ${weatherData.temp}C]` : null,
  `[RISK: ${riskLevel.toUpperCase()}]`,
].filter(Boolean);
```

A family with young children gets different flood evacuation advice than a solo adult. Someone with medical needs gets reminders about medication in their go-bag. Real-time weather from Open-Meteo API is injected when available.

---

## What I Learned

**1. response_format: json_object kills WebLLM speed**
Enabling JSON mode in WebLLM triggers logit-level token masking for every single token. This caused 10x slowdowns. Instead, I use a 2-stage regex parser:

```typescript
// Fast path
try { return JSON.parse(reply); }
catch {
  // Slow path — extract JSON block if model added preamble text
  const match = reply.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  // Final fallback
  return getFallbackAction(situation);
}
```

**2. Weather data can mislead the model**
`[WEATHER: Rain 0mm]` caused the model to assess "water entering house" as GREEN risk — because it trusted the sensor over the user's words. The SITUATION OVERRIDE rule fixed this.

**3. Small models hallucinate structured IDs**
The 1.5B model sometimes returns treeIds that don't exist in the JSON. Solution: validate every treeId client-side before rendering the CTA button. Never show a button that leads nowhere.

---

## The Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite 7 |
| Styling | Tailwind CSS |
| Routing | React Router v7 |
| AI Engine | @mlc-ai/web-llm (WebGPU) |
| Model | Qwen2.5-1.5B-Instruct-q4f16_1-MLC |
| Weather API | Open-Meteo (real-time, free) |
| Offline | PWA + Service Worker + Cache API |
| Icons | Lucide React |

---

## What "Innovative" Actually Means Here

I want to be honest: I didn't invent WebGPU inference. The `@mlc-ai/web-llm` team did the hard engineering work that makes this possible.

What I did was recognize a **problem-solution fit** that most people missed:

> The moment a disaster is severe enough to need AI guidance
> is precisely the moment cloud AI becomes unavailable.

Putting a quantized LLM inside a PWA, wrapping it in a disaster-tuned persona with real contextual awareness, and building a graceful fallback chain for when the model fails — that's the design work.

The technology existed. The application to this specific human problem is what's new.

---

## Try It / Source

The app is designed for Yala Province but the architecture works anywhere. If you're building for disaster-prone regions, communities without reliable connectivity, or any use case where cloud AI failure is unacceptable — this pattern is worth exploring.

**GitHub:** *(link to be added before publishing)*
**Live demo:** *(link to be added before publishing)*

---

*Built during a hackathon focused on disaster preparedness in Southern Thailand.*
*Stack: React + WebLLM + Qwen2.5 + Tailwind + Open-Meteo*

---

**Tags:** `webgpu` `llm` `disaster-response` `offline-first` `react` `typescript` `ai` `pwa` `thailand`
