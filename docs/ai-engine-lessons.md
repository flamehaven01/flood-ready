# AI Engine Field Notes — WebLLM Lessons Learned

> Real-world findings from deploying on-device LLMs in a browser PWA context.
> Documented to help other developers avoid the same pitfalls.

**Project**: [Flood Ready Yala](https://flood-ready.vercel.app) — offline-first disaster response PWA  
**Stack**: React 19 + Vite PWA + WebLLM (MLC) + WebGPU  
**AI Model History**: Qwen2.5-1.5B → Qwen3-1.7B (tested) → Qwen2.5-1.5B (restored)

---

## Why Qwen3-1.7B Was Tested and Rolled Back

In v0.6.2, the AI engine was upgraded from **Qwen2.5-1.5B** to **Qwen3-1.7B** to take advantage of the newer architecture and reasoning capabilities. After real-world testing on mobile (iPhone 13, Chrome), the model was rolled back. Here is the documented reasoning:

| Issue | Detail |
|---|---|
| **Slower inference** | Qwen3 uses a hybrid thinking architecture. Even without explicit `<think>` output, prefill cost is higher than Qwen2.5. Mobile users reported no perceivable speed improvement. |
| **`/no_think` does not work in WebLLM** | The `/no_think` prefix works in HuggingFace/Ollama via chat template. In WebLLM MLC-compiled models, the chat template is baked at compile time — a text prefix in the user message is treated as literal input, not a control directive. |
| **`treeId` guided flow silently broken** | `max_tokens` was reduced from 200 → 130 to compensate for speed. The `treeId` JSON field appears near the end of the output schema. At 130 tokens, it was consistently truncated — silently breaking the "Start Step-by-Step Guided Flow" feature without any error message. |
| **Quality regression** | Without thinking mode, Qwen3-1.7B produced lower-quality structured JSON than Qwen2.5-1.5B, which is specifically optimized for instruction-following. |

**Rollback decision (v0.6.3)**: Qwen2.5-1.5B with `max_tokens: 160` (down from 200) provides better quality, faster inference, and reliable `treeId` generation.

---

## WebLLM On-Device AI — Known Hard Limits

These are fundamental constraints of running LLMs inside a browser via WebGPU:

1. **No chat template control at runtime**  
   Model behavior is frozen at MLC compile time. Parameters like thinking mode, system prompt format, and special tokens cannot be changed without recompiling the model. This means Qwen3's `/no_think` directive — which works in Ollama/HuggingFace — has zero effect in WebLLM.

2. **JSON field placement determines truncation risk**  
   Fields at the end of the JSON schema are the first to be cut when `max_tokens` is insufficient. Always validate the minimum token budget against your *full* schema including all optional fields. In GAIA-119's case: `treeId` and `searchQuery` appear last — 130 tokens was enough for required fields but not optional ones.

3. **Small models use named modules as behavioral anchors**  
   For models ≤ 2B parameters, named labels in the system prompt (e.g., `EmergencySignalScanner:`, `UrgencyClassifier:`) act as behavioral anchors — not cosmetic comments. Removing them to save tokens causes silent quality regression (e.g., `dizzy/vomit` → GREEN instead of YELLOW/RED). Tested on GAIA-119 and reverted (see git tag `v-speed-s1`).

4. **iOS Safari / WKWebView: WebGPU is unavailable**  
   `navigator.gpu` is undefined on iOS Safari and all WKWebView-based browsers (including Chrome on iOS). The fallback keyword dictionary activates automatically. Battery Status API is also unavailable on iOS.

5. **First inference latency is unavoidable**  
   Even with a cached model (via IndexedDB), the first inference per session takes 15–30 seconds due to WebGPU shader compilation. Subsequent calls are 5–10 seconds. Users must be informed upfront via UI (do not hide the loading state).

6. **SITUATION OVERRIDE rule complexity vs. model size**  
   In GAIA-119, a two-sentence SITUATION OVERRIDE rule (`if user says X or Y or Z → treat as active emergency, otherwise use [RISK:] context`) confused the 1.7B model more than the original one-sentence version. For small models, shorter rules outperform longer, more precise rules.

---

## Paths to Overcome These Limits

| Approach | Description | Offline? | Complexity |
|---|---|---|---|
| **GAIA-119 Fine-tuning** | Fine-tune Qwen2.5 or Qwen3.5 on disaster Q&A data using [Unsloth](https://unsloth.ai) (free Colab for ≤4B models). Export to GGUF → MLC conversion for WebLLM. | ✅ Yes | High — MLC build pipeline is non-trivial |
| **Server-side API** | Deploy fine-tuned GGUF via Ollama or llama-server on a VPS (~$5–10/month). Browser calls `fetch()` instead of WebGPU. | ❌ No | Medium |
| **Smaller model (0.6B–1B)** | A quantized 0.6B model with a tighter GAIA-119 prompt may outperform 1.5B in latency while maintaining acceptable quality for emergency classification. | ✅ Yes | Low |
| **Training data collection** | Log high-quality GAIA-119 responses now as a JSON dataset. Reuse for future fine-tuning without starting from scratch. | — | Very Low — start today |

### Recommended Model Selection Criteria for WebLLM PWAs

- ≤ **1.5B** parameters: Reliable on mid-range mobile (6GB RAM devices)
- **Instruction-tuned** variants only (not base/chat models without SFT)
- **q4f16_1** quantization: Best quality/size tradeoff for mobile WebGPU
- Prefer models with MLC pre-compiled weights on [mlc.ai/models](https://mlc.ai/models)
- Validate `max_tokens` against your **full JSON schema including all optional fields**
- Test on actual mobile hardware — desktop WebGPU performance does not predict mobile behavior

---

## Quick Reference: GAIA-119 Token Budget

| Component | Approx. tokens |
|---|---|
| `level` + `summary` | 15–25 |
| `actions` (2–3 items) | 30–50 |
| `details` (2–3 items) | 20–35 |
| `priorities` (2–3 items) | 10–15 |
| `treeId` (optional) | 10–15 |
| `searchQuery` (optional) | 10–15 |
| **Total (with treeId)** | **~130–155** |
| **Recommended `max_tokens`** | **160** |

Setting `max_tokens: 130` reliably drops `treeId` and `searchQuery`. Setting `max_tokens: 200` is safe but wastes ~40 tokens per inference.

---

*Last updated: v0.6.3 — 2026-03-03*
