# Usage Guide

A practical guide to all features in Flood Ready, from first launch to emergency use.

---

## 1. First Launch: Onboarding Wizard

The onboarding wizard runs once on first launch and sets up your personal emergency profile.

1. **Language:** Select English, Thai (ภาษาไทย), or Malay (Bahasa Melayu). GAIA-119 will auto-detect language from your input regardless, but this sets the default UI language.
2. **Region:** Enter your location (free text, e.g., "Yala - Betong", "Bangkok", "Kuala Lumpur"). This is used to sort nearby safe hubs to the top of the map.
3. **Household:** Select your group type — solo, family with children, elderly dependents, or special medical needs. This personalizes AI responses and Quick Assist recommendations.
4. **Download the AI Engine (critical — do before a disaster):**
   - At the final onboarding step, tap **[Download AI (Wi-Fi Recommended)]**.
   - The Qwen3-1.7B model (~1.1GB) downloads into your browser's IndexedDB.
   - Progress is shown in real time. When complete, the status changes to **[AI Engine Ready]**.
   - **This must be done before a disaster.** Once downloaded, the AI works with no network.

---

## 2. Home Screen

The main screen. All critical actions are reachable from here.

- **Risk Level Banner:** Current risk level (Green / Yellow / Orange / Red) displayed prominently at top. Color and text update dynamically.
- **Do Now Board:** Context-sensitive action cards keyed to the current risk level. Cards change as risk escalates from Green (prepare) to Red (evacuate immediately).
- **Ask AI (Qwen):** Launches the AI query interface. On-device WebGPU inference. Streams response tokens in real time.
- **Safe Hub Locator:** Displays your nearest recommended safe hub. Bookmarked hubs are prioritized — if a bookmarked hub is open, it appears first. A bookmark badge is shown on the card when active.
- **Live Alert Ticker:** Scrolling alert bar at top. Color matches current risk level.
- **Weather Radar:** Embedded Windy.com radar accessible from the Map tab.

---

## 3. Quick Assist — 24-Card Library

Zero-typing emergency guidance across 6 categories:

| Category | Examples |
|---|---|
| Flood & Water | Evacuation route, Water safety, Go-bag, Power hazards |
| Medical Emergency | First aid, Bleeding, Fracture, CPR |
| Supplies & Resources | Water storage, Emergency food, Go-bag contents |
| Shelter & Safety | Find safe hub, Structural safety, Temporary shelter |
| Communication | Offline contact, Emergency broadcast, Signal mirror |
| Family & Vulnerable | Children evacuation, Elderly care, Pets |

- **For You section:** Personalized cards computed from your profile + risk level + weather. Appears at top. Updates instantly.
- Tapping a card either opens a **decision tree flow** (step-by-step branching questions with "Do Now" actions) or launches a **pre-filled AI query**.

### AI Insight Cards (mid-flow)
At key decision nodes, an **AI Insight** card appears inline — a pre-written, localized survival tip relevant to the current decision. These render between the "Do Now" actions and the question prompt, in your selected language.

---

## 4. Ask AI (GAIA-119)

For situations that need personalized intelligence beyond the card library.

1. Tap **Ask AI** on the Home screen, or the AI button in the bottom nav.
2. Describe your current situation in plain text. Examples:
   - *"Water is entering the house fast"*
   - *"My child fell and her arm looks broken"*
   - *"Power line is down in the street"*
3. The on-device AI processes your query. First tokens appear in ~2 seconds. Full response in 15–30 seconds.
4. The result shows:
   - **Risk level badge** (Red / Yellow / Green)
   - **Numbered action cards** (most critical first)
   - **"Start Step-by-Step Flow" button** — if the AI detected a matching decision tree, this routes directly into the guided flow
   - **"Search Web" button** — opens an emergency keyword search when connectivity is available

> Your submitted question is displayed above the result so you always know what the AI is responding to.

---

## 5. Map & Community Hubs

Find safe evacuation points near you.

- Tap the **Map** icon in the bottom nav.
- Hubs are sorted by region — hubs matching your configured region appear at the top.
- Tap any hub card to expand details: status (Open / Full / Closed / Unknown), available services, contact, last updated time.
- Tap **[Map]** on a hub card to open it in Google Maps (works with or without the app, uses "Thailand" in the search for geographic accuracy).
- **Filter bar:** All, Mosque, Temple, School, Community, Government.

### Hub Actions

**Mobile (swipe):** Swipe left on a hub card to reveal three action buttons:
- **Bookmark** — pin a hub for quick access; bookmarked hubs appear first in the Home screen Safe Hub Locator.
- **Edit** — update status or available services for community-reported hubs.
- **Delete** — remove a hub (community-registered hubs only; official hubs are protected).

**Desktop (hover):** Hover over any hub card to show the same three action buttons at the bottom-right corner of the card.

Swipe the card back to the right (or tap elsewhere) to close the action panel.

### Registering a New Hub (+)

If you know of a safe location that is not listed, tap the **+** button.

1. Enter the hub name and select its type.
2. Set current status (Open / Full).
3. Check available services (Water, Food, Medical, Shelter, Power, Communication).
4. Tap **Use GPS** to auto-detect your coordinates, or the location will default to your region center.
5. Tap **Broadcast to Network** — the hub appears immediately on the map with an orange **Community Report** badge, distinguishing it from admin-verified data.

> Community hubs are persisted to local storage and survive app refreshes.

---

## 6. Settings

Accessible from the bottom nav. Allows re-running onboarding, changing language, and reviewing AI engine status.

### Language & Protection

- **Language:** Switch between English, Thai, and Malay at any time.
- **Region:** Update your region string; affects hub sorting and AI context.
- **Household:** Change your group type.

### Display Mode

- **Normal** — Standard UI.
- **Rain Mode** — Larger tap targets, higher contrast. Recommended in low-visibility conditions.
- **Ultra Low Power** — Dark theme, static UI. Conserves battery during extended use.
  - **Auto-detect (30% battery):** Toggle switch below the Ultra Low Power option. When ON, the app monitors battery level and automatically activates Ultra Low Power mode when charge drops below 30%. Requires Chrome on Android; not available on iOS Safari (toggle shows "Not supported" on unsupported devices).

### AI Engine

Shows current model (`Qwen3-1.7B-q4f16_1-MLC`), download status, and VRAM usage. Re-download available if the cache is cleared.
