# Usability & Cognitive Engineering

When a disaster strikes, physical and cognitive capacity drops sharply. Hands tremble or are submerged in water. Vision is limited. The mental bandwidth required to read and process complex text simply disappears.

Flood Ready's UI/UX design is not built for beauty. It is built for **survival under maximum cognitive load** — a discipline called Cognitive Engineering.

---

## 1. The "No-Typing" Architecture

**Problem:** In heavy rain or while injured, accurately pressing small keys on a mobile keyboard is near-impossible.

**Solution:**
- The **Quick Assist** feature requires zero typing. 24 categorized emergency cards cover Flood & Water, Medical, Supplies, Shelter, Communication, and Family & Vulnerable scenarios.
- Tapping a card launches an interactive decision tree with large, rounded buttons. The "Do Now" action guide appears immediately without any text input.
- Onboarding is four clear card-selection steps that complete in under 30 seconds.
- AI queries remain available for situations that fall outside the card library — but they are a secondary path, not the primary one.

---

## 2. Dynamic Risk Color System (ISO Safety Colors)

**Problem:** Disaster apps that use decorative gradients or small text fail to communicate urgency at a glance.

**Solution:** The global `riskLevel` context state drives the entire app's color theme dynamically:

- **Green (Safe):** `#16a34a` — calm, informational
- **Yellow / Orange (Alert):** `#F48C25` — preparation and caution
- **Red (Critical):** `#FF3B30` — immediate evacuation, life-threatening hazard

The color change is semantic, not stylistic. A user's eyes need to process risk level without reading any text. The background, badges, and action boards all shift to match the current risk state.

**Rain Mode:** When `mode === 'rain'`, text scales up (`text-3xl` instead of `text-2xl`) for legibility in low-light, wet-screen conditions.

---

## 3. Haptic Action Board Layout

**Problem:** Action buttons placed outside the thumb reachability zone cause users to drop their devices.

**Solution:**
- Core navigation (`Quick Assist`, `Map`, `Home`, `Settings`) is anchored to the bottom 40% of the screen — within thumb reach at all times.
- The most critical feature, **Ask AI**, is prominently placed in the top-center action board on the Home screen. The user's eye lands on it immediately without scanning.
- All interactive buttons meet minimum touch target size (44×44px) per Apple HIG / Google Material accessibility guidelines.

---

## 4. For You — Rule-Based Instant Recommendations

**Problem:** AI inference takes 15–30 seconds. In the first moments of a disaster, users need guidance instantly.

**Solution:** The "For You" section in Quick Assist computes personalized card recommendations from `riskLevel + household profile + medical needs + weather data` using a client-side rule engine. No AI, no network, no waiting. Results appear in under 50ms.

---

*Designed for survival under stress conditions.*
