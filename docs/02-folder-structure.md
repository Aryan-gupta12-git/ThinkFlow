# Folder Structure

The project is structured as a monorepo consisting of a React Vite client in the root and a Node.js Express server in the `backend/` directory.

---

## 📂 Root Folder Structure (Frontend Client)

```text
├── index.html                  # Main HTML Entry Point
├── package.json                # Frontend package dependencies & scripts
├── tsconfig.json               # TypeScript base compiler options
├── vite.config.ts              # Vite server & build configurations
│
├── src/                        # React Application Source
│   ├── main.tsx                # Client bootstrapped entry point
│   ├── index.css               # Global stylesheets, fonts & CSS Variables
│   │
│   ├── components/             # Reusable UI Atoms and Layouts
│   │   └── Layout.tsx          # Shared navbar and body spacing wrapper
│   │
│   ├── data/                   # Shared client data constants
│   │   └── topics.ts           # Local fallback topics lists
│   │
│   └── features/               # Core feature modules
│       └── practice/
│           ├── SingleWorkspace.tsx  # Central Workspace Tab Manager & AI Report layout
│           ├── WritingWorkspace.tsx # Written practice mode (Random & Intro forms)
│           └── SpeechWorkspace.tsx  # Spoken practice mode (SpeechRecognition & wave visuals)
```

### Key Files (Frontend)
- **[index.html](file:///Users/aryan/Idea/index.html)**: Standard entry point. Pulls in Google Fonts (`Outfit` and `JetBrains Mono`).
- **[vite.config.ts](file:///Users/aryan/Idea/vite.config.ts)**: Configures the dev proxy so that any frontend request to `/api/*` is transparently proxied to the backend at `http://localhost:3001/api/*` to avoid CORS issues.
- **[src/index.css](file:///Users/aryan/Idea/src/index.css)**: Holds the system design system tokens. Defines global animations like `.shake-card` and `.blue-cursor`.

---

## 📂 Backend Folder Structure (`backend/`)

```text
├── backend/
│   ├── .env                    # Secrets & configurations (GEMINI_API_KEY)
│   ├── package.json            # Backend package scripts & dependencies
│   ├── tsconfig.json           # Compiler rules for TypeScript
│   │
│   └── src/                    # Backend Source Code
│       ├── server.ts           # Bootstraps Express App and binds to Port 3001
│       ├── app.ts              # Sets up middleware, headers, and routes
│       │
│       ├── config/             # Config loader
│       │   └── index.ts        # Parses and validates process.env parameters
│       │
│       ├── controllers/        # Request controllers
│       │   ├── topics.controller.ts   # Fetches random topic from Gemini
│       │   └── analyze.controller.ts  # Handlers transcript evaluation
│       │
│       ├── middleware/         # Express middleware
│       │   ├── logger.middleware.ts     # Audits latency, route path, status, and IP
│       │   └── validation.middleware.ts # Validates request payload schemas
│       │
│       ├── routes/             # Router mappings
│       │   └── api.routes.ts   # Maps routes (/topics, /analyze) to controllers
│       │
│       └── services/           # Service layer
│           └── gemini.service.ts # Core API client for Google GenAI
```

### Key Files (Backend)
- **[backend/.env](file:///Users/aryan/Idea/backend/.env)**: Stores backend environment secrets. Never checked into git.
- **[backend/src/app.ts](file:///Users/aryan/Idea/backend/src/app.ts)**: Configures global middleware:
  - `express.json()`: Parses incoming JSON bodies.
  - Custom Request Logger: Generates production audits.
  - Registers the `/api` sub-router.
- **[backend/src/services/gemini.service.ts](file:///Users/aryan/Idea/backend/src/services/gemini.service.ts)**: Interacts with Google's API to prompt the models and parses the returned JSON string.
