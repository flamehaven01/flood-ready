# 핵심 기술 (Core Technology)

Flood Ready Yala는 극한의 통신 두절 환경(정전, 기지국 붕괴)에서도 완벽하게 동작하기 위해 가장 진보적인 웹 아키텍처와 경량화된 온디바이스 AI 기술을 결합하여 설계되었습니다. 본 문서는 기술적 근간을 이루는 3가지 핵심 요소를 설명합니다.

---

## 1. True On-Device AI: `@mlc-ai/web-llm`

기존의 모바일 AI 앱들은 서버(Cloud) 통신을 요구하거나, 사용자 디바이스 백그라운드에 무거운 추론 엔진(예: Ollama, MLX)을 띄워놓고 앱에서 프록시로 통신하는 방식을 취했습니다.

**Flood Ready Yala의 극복 설계:**
*   사용자의 브라우저 **WebGPU**를 직접 추론 연산기로 사용합니다.
*   가장 최신화된 파라미터 경량 모델인 **`Qwen2.5-1.5B-Instruct-q4f16_1-MLC` (크기: 약 1.2GB)** 를 최초 1회 브라우저 내장(IndexedDB)으로 캐싱(다운로드)합니다.
*   캐싱 이후에는 어떠한 외부 서버나 인터넷 연결 없이 `useAI()` 커스텀 훅을 통해 디바이스 내부에서만 사용자의 "상황 입력"을 즉각 분석하여 대처 가이드라인(JSON)을 응답합니다.

## 2. Progressive Web App (PWA) Offline-First Cache

AI 엔진만 캐싱된다고 해서 앱이 오프라인에서 구동되진 않습니다. 사용자가 브라우저 주소창에서 앱을 새로고침했을 때 HTML/JS 에셋이 로딩되어야 합니다.

**Flood Ready Yala의 극복 설계:**
*   `vite-plugin-pwa`를 도입하여 **App Shell(앱 뼈대)과 모든 정적 리소스(JS, CSS, Icons)를 Service Worker를 통해 오프라인 캐싱**합니다.
*   통신이 `0 Mbps`인 재난 상황에서도 네이티브 앱을 여는 것과 동일한 속도로 애플리케이션에 진입할 수 있습니다.

## 3. Resilience Fallback: The `emergency_fallback.json` Dictionary

만일 사용자가 1.2GB의 AI 모델을 미처 다 다운로드하지 못한 상태로 재난을 맞이했다면 앱은 어떻게 반응해야 할까요?

**Flood Ready Yala의 극복 설계:**
*   AI 로딩 여부를 즉각 판단하는 Fail-safe 시스템이 도입되었습니다.
*   엔진이 미러딩 상태라면, 전문가용 오프라인 사전에 해당하는 `emergency_fallback.json`이 대신 작동합니다.
*   사용자의 입력 문맥에서 "홍수", "뱀", "감전", "출혈" 등 치명적 키워드를 즉각 파싱(Parsing)하여 빠르고 안전하게 Hard-coded 생존 카드를 출력합니다.

---
