# ThinkFlow: Engineering & Architecture Documentation

ThinkFlow is a professional, developer-grade AI-powered communication training platform. It assists students, placement candidates, and professionals in sharpening their verbal and written communication skills through real-time feedback loops.

---

## 📖 Table of Contents

This repository is fully documented across modular sections to support onboarding, developer extension, and architecture verification.

1. **[Project Overview](file:///Users/aryan/Idea/docs/01-project-overview.md)**
   High-level objectives, features, business domain problems, target audience, and complete technology stack.
2. **[Folder Structure](file:///Users/aryan/Idea/docs/02-folder-structure.md)**
   Comprehensive walk-through of the frontend React-Vite and backend Node-Express directories and key files.
3. **[Frontend Architecture](file:///Users/aryan/Idea/docs/03-frontend-architecture.md)**
   React configuration, design guidelines, animations system, styling architecture, and CSS variables structure.
4. **[Backend Architecture](file:///Users/aryan/Idea/docs/04-backend-architecture.md)**
   Express server design, routing mechanics, middleware chain, input validation, and logging policies.
5. **[API Documentation](file:///Users/aryan/Idea/docs/05-api-documentation.md)**
   Detailed HTTP request/response payloads, endpoints schema, error codes, and curl examples.
6. **[Gemini AI Integration](file:///Users/aryan/Idea/docs/06-gemini-integration.md)**
   Google GenAI SDK initialization, schema-enforced prompt engineering, retry loops, and local fallbacks.
7. **[State Management & Flows](file:///Users/aryan/Idea/docs/07-state-management.md)**
   Isolated react state models, refs synchronization, timer mechanics, and Web Speech transcript pipelines.
8. **[Component Guide](file:///Users/aryan/Idea/docs/08-component-guide.md)**
   Prop definitions, inner states, lifecycle, and component communication patterns for major modules.
9. **[Data Flow & Sequences](file:///Users/aryan/Idea/docs/09-data-flow.md)**
   Ascii sequence diagrams mapping user actions to backend service triggers and UI state updates.
10. **[Deployment & Environment](file:///Users/aryan/Idea/docs/10-deployment.md)**
    Local setup, package scripts, environment variables configurations, and production deployment recommendations.
11. **[Future Improvements](file:///Users/aryan/Idea/docs/11-future-improvements.md)**
    Product backlog, dashboard analytics plans, dark mode styling, and persistent database schema designs.
12. **[Placement & Placement Guide](file:///Users/aryan/Idea/docs/12-interview-guide.md)**
    Technical interview Q&A guide tailored for placements, project defense, and design choices.
13. **[Troubleshooting & Diagnostics](file:///Users/aryan/Idea/docs/13-troubleshooting.md)**
    Common issues, environment failure states, Web Speech API limitations, and their quick resolutions.

---

## 🛠️ Technology Stack Summary

### Frontend
- **Framework**: React 18 (TypeScript)
- **Bundler**: Vite
- **Styling**: TailwindCSS (v3/v4 utility model) + Custom Vanilla CSS Variables
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Web Server**: Express.js (TypeScript)
- **Development Tooling**: Nodemon & ts-node
- **Middleware**: CORS, Body Parser, Custom Request Logger

### AI Integration
- **SDK**: Official `@google/genai` (Google GenAI SDK)
- **Model**: `gemini-2.5-flash`
- **Output Mode**: Application JSON (Schema-Enforced Structured Outputs)
