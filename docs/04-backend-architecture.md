# Backend Architecture

ThinkFlow's backend is a TypeScript Node.js server powered by Express. It is designed to be completely modular, separating network entry, payload validation, business logic orchestration, and AI model communication.

---

## 🏗️ Layered Architecture

The backend follows a clean, single-responsibility layered design pattern:

```
    HTTP Request (Client)
             │
             ▼
        [server.ts] (Port Listener)
             │
             ▼
         [app.ts] (Global Middleware)
             │
             ▼
     [api.routes.ts] (Router Mapping)
             │
             ▼
[validation.middleware.ts] (Payload Validation)
             │
             ▼
    [controllers] (Request Handlers)
             │
             ▼
     [gemini.service] (AI Core Client)
             │
             ▼
      Google Gemini API
```

---

## ⚡ Core Modules

### 1. Global Server Bootstrapper (`server.ts`)
- Imports the configured application and binds it to `PORT=3001` (or local env port).
- Checks that the `GEMINI_API_KEY` is loaded and validates the environment configuration on startup, crashing early with clean messages if secrets are missing.

### 2. Routes Coordinator (`api.routes.ts`)
- Exposes modular routes for topics generation and analysis.
- Connects the validation middleware specifically to the `/analyze` endpoint:
  ```typescript
  router.post('/analyze', validateAnalyzeRequest, analyzeSpeech);
  ```

### 3. Validation Middleware (`validation.middleware.ts`)
- Asserts that all required keys (`mode`, `topic`, `content`) are present in the request body.
- Asserts that they are string primitives and that the content length (after trimming whitespace) is non-zero.
- If validation fails, it aborts the request chain immediately, returning a `400 Bad Request` with a details object rather than letting it hit the AI endpoints.

### 4. Custom Logger Middleware (`logger.middleware.ts`)
- Records the request execution times, routes, client IPs, response statuses, and the internal Gemini model execution latency.
- Keeps track of metrics so developers can analyze prompt efficiency and pricing overhead.
- Output log example:
  `[2026-07-04T17:40:02.071Z] POST /api/topics - Status: 200 - Total Latency: 4484ms - Gemini Latency: 4477ms - IP: ::1`

### 5. Services Orchestrator (`gemini.service.ts`)
- Serves as the unique interface for the Google GenAI library.
- Performs prompt compilation, handles rate-limit retries, and parses the returned content safely.
- Implements resilient mock fallbacks to keep the developer platform active during API quotas depletion.
