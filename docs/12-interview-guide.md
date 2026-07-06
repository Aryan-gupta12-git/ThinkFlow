# Placement & Interview Guide

This guide is designed to help you explain the technical architectures, engineering design choices, and challenges of this project during placement interviews or project defenses.

---

## 💬 Q&A: Architectural Decisions

### Q: Why did you build a custom Node/Express backend instead of calling Gemini directly from React?
- **Security & Secret Key Preservation**: Calling Gemini directly from React would require exposing the `GEMINI_API_KEY` in the browser client bundle. Any user could inspect the network traffic, steal the key, and abuse the quota. By routing calls through Express, the key remains securely stored on the server's `.env` environment variables.
- **Request Rate Limiting & Validation**: The backend filters malformed payloads, handles rate limit exceptions, and implements retry-delay routines. It ensures that the model only receives clean, validated requests.

### Q: Why did you choose React for the frontend?
- **Reactive UI Rendering**: Timers, waveforms, and live speech dictation require immediate, high-frequency updates. React's virtual DOM diffing keeps rendering latency low.
- **Component-Driven Layout**: Decoupling the dashboard layout from the individual editing workspaces keeps the codebase modular and readable.

### Q: Why did you choose Gemini 2.5 Flash over other models?
- **Latency**: FLASH is optimized for low-latency tasks. It returns structured evaluations in under 3 seconds, which is essential for user engagement.
- **Strict Schema Enforcement**: Native JSON Schema validation ensures that the model outputs structured JSON with all required keys, completely avoiding formatting errors.

---

## 🛠️ Q&A: Technical Challenges & Resolutions

### Q: How did you handle stale state captures in React interval loops?
- **The Challenge**: Inside the `setInterval` loop tracking keyboard inactivity, referencing the editor `text` variable captured stale values because of Javascript closures.
- **The Resolution**: We introduced React `useRef` hooks (`textRef`, `inactivityTimerRef`) that synchronize with active states in a `useEffect` side-effect. The timer loop references the mutable `.current` properties, guaranteeing it always accesses the latest values.

### Q: How did you handle Gemini API rate limits (RESOURCE_EXHAUSTED) in dev environments?
- **The Challenge**: The free tier of Gemini has a strict limit of 20 requests per day, causing API calls to crash when developing or testing.
- **The Resolution**: We built a 2-attempt retry loop on the backend. If Google continues to reject the call, the backend catches the error, logs the stack trace for developer review, and falls back to a high-quality mock report. This ensures that frontend validation and page transitions continue to function.
