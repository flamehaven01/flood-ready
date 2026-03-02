import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';
import { useTheme } from './ThemeContext';
import type { EmergencyAction } from '../lib/ollama';

// Hardcoded fallback data
import fallbackData from '../data/emergency_fallback.json';

// ─────────────────────────────────────────────────────────────────
// GAIA-119 Persona Ontology
// CR-EP Why:
//   Core Goal:      Maximize user survival probability in the first 5 critical minutes
//   Target User:    Disaster victim under extreme cognitive load (wet, dark, panicked)
//   Success Metric: Each action ≤ 12 words. Decision made in < 5 seconds.
//   Failure Impact: Vague advice → wrong action → preventable death
//
// Hard Lines:
//   [CRITICAL] NEVER output vague safety platitudes ("be careful", "stay safe")
//   [CRITICAL] EVERY action starts with a CAPS imperative verb
//   [CRITICAL] Max 4 actions, ordered most-critical-first
//   [CRITICAL] level MUST be "red"|"yellow"|"green" only
//   [CRITICAL] Detect language from user input. Respond in same language.
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// GAIA-119 + AESE-CrisisShield + ResponseFusion Module Integration
//
// [ResponseFusion]             -> Dual-Pipeline: crisis vs. non-crisis disambiguation
// [EmergencySignalScanner]     -> Keyword + context threat assessment -> "level"
// [UrgencyClassifier]          -> red >= 0.7 | yellow 0.3-0.7 | green < 0.3
// [CalmToneInfuser]            -> Authoritative calm, not panicked. Radio operator tone.
// [CognitiveFocusRedirector]   -> One concrete action per step. Simple verb. No compound.
// [ContactProtocolRecommender] -> If level=red: final action MUST be emergency contact.
// ─────────────────────────────────────────────────────────────────
const GAIA_119_SYSTEM_PROMPT = `You are GAIA-119, a Thai National Disaster Response AI (AESE-CrisisShield) for Yala Province.
Mission: Deliver instant survival orders with context-aware detail. No greetings. No disclaimers.

ACTIVE MODULES:
- EmergencySignalScanner: Detect ALL threat signals. Calm queries can embed immediate dangers.
- UrgencyClassifier: red >= 0.7 | yellow 0.3-0.7 | green < 0.3. Escalate on conflicting signals.
- CalmToneInfuser: Authoritative and calm. Radio operator tone. Never panicked.
- CognitiveFocusRedirector: One concrete action per step. No compound sentences.
- ContactProtocolRecommender: level=red -> last action MUST include emergency contact.
- PersonaAdaptor: Use [HOUSEHOLD:] and [MEDICAL:] tags to personalize every action.

OUTPUT (JSON only, no markdown):
{"level":"red"|"yellow"|"green","summary":"max 10 words","actions":["VERB action max 8 words","..."],"details":["max 6 words why","..."],"priorities":["CRITICAL"|"IMPORTANT"|"PREPARE","..."],"treeId":"dt_..." (optional — see TREE_ROUTING),"searchQuery":"3-5 english keywords"}

RULES:
- actions: 2-3 items max. Each starts with CAPS verb. Max 8 words.
- details: same count. Extremely brief (max 6 words).
- priorities: same count. CRITICAL=right now, IMPORTANT=soon, PREPARE=next steps.
- Detect language from user input. summary/actions/details in SAME language as input.
- searchQuery: 3-5 English EMERGENCY keywords only (e.g. "flood home evacuation children"). NEVER include profile tags, location names, household type, or weather values.
- SITUATION OVERRIDE: User's explicit words ALWAYS take priority over sensor/weather context. If user says "water entering house" → treat as ACTIVE FLOOD (red), even if [WEATHER: Rain 0mm].

TREE_ROUTING — add "treeId" only when situation clearly matches one of these:
"dt_flood_evac_01"    -> flood water / water entering building / need to evacuate
"dt_gobag_01"         -> emergency bag / go-bag / what to pack
"dt_water_01"         -> store water / purify water / no clean water available
"dt_electric_01"      -> electrical hazard / downed power line / electrocution risk
"dt_first_aid_01"     -> bleeding / fracture / physical injury / CPR
"dt_community_hub_01" -> shelter / food / mosque / temple / community help
Omit treeId entirely if no clear match exists.

EXAMPLE:
Input: [HOUSEHOLD: family_with_kids] [WEATHER: Rain 8mm] water entering house fast
Output: {"level":"red","summary":"Floodwater is entering the home. With children present, you have 2-3 minutes before lower floors become dangerous.","actions":["MOVE children to top floor immediately","CUT main power at circuit breaker","GRAB go-bag with children IDs and meds","CALL 1669 — state address and family size"],"details":["Rising water exhausts children faster than adults.","Electricity and water cause fatal shock — cut it first.","Children need food and medication during extended isolation.","Rescue teams prioritize families with children when reported."],"priorities":["CRITICAL","CRITICAL","IMPORTANT","CRITICAL"],"treeId":"dt_flood_evac_01","searchQuery":"flood family children evacuation"}`;

const QWEN_MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

interface AIContextType {
    initEngine: () => Promise<void>;
    askQwen: (situation: string, onChunk?: (text: string) => void) => Promise<EmergencyAction>;
    isReady: boolean;
    progress: number;
    progressText: string;
    isLoading: boolean;
}

const AIContext = createContext<AIContextType | null>(null);

interface FallbackEntry {
    keywords?: string[];
    level: "red" | "yellow" | "green";
    actions: string[];
    searchQuery: string;
}

function getFallbackAction(situation: string): EmergencyAction {
    const sit = situation.toLowerCase();
    const data = fallbackData as unknown as Record<string, FallbackEntry>;
    for (const key of Object.keys(data)) {
        if (key === 'default') continue;
        const entry = data[key];
        if (entry.keywords && entry.keywords.some((kw: string) => sit.includes(kw))) {
            return {
                level: entry.level,
                actions: entry.actions,
                searchQuery: entry.searchQuery
            };
        }
    }
    return {
        level: data['default'].level,
        actions: data['default'].actions,
        searchQuery: data['default'].searchQuery
    };
}

export function AIProvider({ children }: { children: ReactNode }) {
    const [engine, setEngine] = useState<MLCEngine | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [progressText, setProgressText] = useState<string>("Initializing...");
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isReadyRef = useRef(false);
    const isLoadingRef = useRef(false);
    const { mode, region, household, medicalNeeds, weatherData, riskLevel } = useTheme();

    const initEngine = useCallback(async () => {
        if (engine || isLoadingRef.current || isReadyRef.current) return;
        setIsLoading(true);
        isLoadingRef.current = true;
        let stallTimer: ReturnType<typeof setTimeout>;
        try {
            // Provide a better UX if the initial fetch is slow (e.g. large chunks or slow network)
            stallTimer = setTimeout(() => {
                setProgressText((prev) =>
                    prev.includes("Start to fetch") ? "⏳ Connecting to AI Server... (May take a minute)" : prev
                );
            }, 5000);

            const mlcEngine = await CreateMLCEngine(QWEN_MODEL_ID, {
                initProgressCallback: (status) => {
                    console.log("[WebLLM Progress]:", status.text);
                    setProgress(Math.round((status.progress || 0) * 100));
                    setProgressText(status.text);
                },
            });
            clearTimeout(stallTimer);
            setEngine(mlcEngine);
            setIsReady(true);
            isReadyRef.current = true;
            localStorage.setItem('aiModelCached', '1');
        } catch (error) {
            clearTimeout(stallTimer!);
            console.error("WebGPU / Qwen Load Error:", error);
            setProgressText("❌ Failed to download AI Engine. Check network or F12 Console.");
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    }, [engine]);

    // Auto-restore from IndexedDB cache on every app load.
    // The model file is already on-device; CreateMLCEngine completes in seconds, not minutes.
    // Without this, isReady resets to false on every page refresh even though the model is cached.
    useEffect(() => {
        if (localStorage.getItem('aiModelCached') === '1' && !isReadyRef.current && !isLoadingRef.current) {
            initEngine();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentional: mount-only, initEngine is stable at this point (engine=null)

    const askQwen = useCallback(async (situation: string, onChunk?: (text: string) => void): Promise<EmergencyAction> => {
        if (mode === 'ultra-low-power' || !engine) {
            if (mode === 'ultra-low-power') {
                console.warn("Ultra-Low Power Mode active. Bypassing WebGPU to save battery.");
            } else {
                console.warn("Qwen is not loaded. Using fallback JSON dictionary.");
            }
            return getFallbackAction(situation);
        }

        try {
            const ctxParts: string[] = [`[Location: ${region || 'Unknown Location'}]`];
            if (household) ctxParts.push(`[HOUSEHOLD: ${household}]`);
            if (medicalNeeds) ctxParts.push(`[MEDICAL: special_needs]`);
            if (weatherData) ctxParts.push(`[WEATHER: Rain ${weatherData.rain}mm Temp ${weatherData.temp}C Wind ${weatherData.wind}kmh]`);
            ctxParts.push(`[RISK: ${riskLevel.toUpperCase()}]`);
            const situationWithContext = `${ctxParts.join(' ')} ${situation}`;

            // Stream mode: first token appears in ~2s vs. waiting for full 200-token batch
            const stream = await engine.chat.completions.create({
                messages: [
                    { role: "system", content: GAIA_119_SYSTEM_PROMPT },
                    { role: "user", content: situationWithContext }
                ],
                // response_format: json_object omitted — causes 10x+ slowdown in WebLLM via logit masking
                temperature: 0.1,
                max_tokens: 200,
                stream: true,
            });

            let accumulated = "";
            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content || "";
                if (delta) {
                    accumulated += delta;
                    onChunk?.(accumulated);
                }
            }

            // Strip markdown code fences from final accumulated text
            const reply = accumulated.replace(/```json/gi, '').replace(/```/g, '').trim();

            // Fast path: model output is clean JSON
            try {
                return JSON.parse(reply) as EmergencyAction;
            } catch {
                // Slow path: model added preamble/postamble text — extract the {…} block with regex
                const jsonMatch = reply.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        return JSON.parse(jsonMatch[0]) as EmergencyAction;
                    } catch {
                        // fall through
                    }
                }
                console.warn("[GAIA-119] Parser failed — using offline fallback.", reply.slice(0, 120));
                return getFallbackAction(situation);
            }
        } catch (error) {
            console.error("Inference Error:", error);
            return getFallbackAction(situation);
        }
    }, [engine, mode, region, household, medicalNeeds, weatherData, riskLevel]);

    return (
        <AIContext.Provider value={{ initEngine, askQwen, isReady, progress, progressText, isLoading }}>
            {children}
        </AIContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAI() {
    const context = useContext(AIContext);
    if (!context) throw new Error('useAI must be used within an AIProvider');
    return context;
}
