export interface EmergencyAction {
    level: "red" | "yellow" | "green";
    summary?: string;
    actions: string[];
    details?: string[];
    priorities?: ('CRITICAL' | 'IMPORTANT' | 'PREPARE')[];
    treeId?: string;
    searchQuery: string;
}

// Same GAIA-119 persona applied to the Ollama (dev-only) path
const OLLAMA_SYSTEM_PROMPT =
    `You are GAIA-119, a Thai National Disaster Response AI for Yala Province.
Mission: Deliver instant, life-saving action orders. No greetings. No disclaimers.
MANDATORY: Respond ONLY in JSON: {"level":"red"|"yellow"|"green","actions":[...],"searchQuery":"..."}
level: red=immediate threat, yellow=prepare, green=monitor.
actions: 2-4 items, each starts with CAPS imperative verb, each ≤ 12 words.
Detect language from input. Write actions in same language (English/Thai/Malay).`;

export async function getEmergencyAdviceFromAI(situation: string): Promise<EmergencyAction> {
    try {
        const res = await fetch('/api/ollama/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen3:1.7b',
                messages: [
                    { role: 'system', content: OLLAMA_SYSTEM_PROMPT },
                    { role: 'user', content: situation }
                ],
                stream: false,
                format: 'json'
            })
        });

        if (!res.ok) {
            throw new Error(`Ollama API error: ${res.status}`);
        }

        const data = await res.json();
        // Ollama /api/chat returns message.content, not .response
        const content = data.message?.content ?? data.response ?? '{}';
        return JSON.parse(content) as EmergencyAction;
    } catch (error) {
        console.error("Failed to fetch from Ollama:", error);
        throw error;
    }
}
