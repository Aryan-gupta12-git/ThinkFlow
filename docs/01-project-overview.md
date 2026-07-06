# Project Overview

ThinkFlow is a web application designed to help individuals practice and master written and spoken communication skills. 

In competitive hiring environments, placement interviews, and public speaking engagements, presenting thoughts in a structured, coherent manner under time pressure is a critical filter. ThinkFlow acts as an automated, private, real-time feedback coach that evaluates user performances against professional communication standards.

---

## 🎯 The Problem

1. **Articulation Anxiety**: Many candidates fail to structure their ideas under pressure, leading to rambling, stuttering, or blanking out.
2. **Lack of Instant, Objective Feedback**: Practicing in front of a mirror or recording oneself doesn't provide structured feedback on grammar, structure, tone, or actionable improvements.
3. **Filler Word Habits**: Speakers are often unaware of their reliance on filler words (e.g., *um*, *umm*, *like*, *basically*) during spoken practice.
4. **Static Prompts**: Standard list-based interview questions fail to challenge users with unique, diverse topics in real-time.

---

## 💡 The Solution

ThinkFlow implements **three distinct practice modes** that simulate high-pressure scenarios, combined with structured, schema-enforced AI feedback reports:

### 1. Random Topic Mode (Written)
- The backend generates a unique public speaking or debate topic.
- The user is challenged to write continuously for **three minutes**.
- **Inactivity Warning**: If the user stops typing for 1.5 seconds, a warning flashes (`Write it yourself` or `Keep writing...`). If they pause for **7.0 seconds**, the workspace shakes, resets their draft, and fetches a new topic. This forces active brainstorming and prevents writer's block.

### 2. Introduce Yourself Mode (Written)
- The user can input their background details (Name, College, Degree, Skills, Career Goals).
- The workspace renders an inline **Introduction Guide** based on their inputs.
- The user writes their introduction draft under the same 3-minute, 7-second inactivity pressure loop.

### 3. Speech Practice Mode (Spoken)
- The user speaks aloud continuously on a topic.
- Using the browser's Web Speech API (`webkitSpeechRecognition`), speech is transcribed live onto the screen.
- **Inactivity/Silence Reset**: If the user stops speaking for **7.0 seconds**, the transcription clears, the timer resets, and a new topic is loaded. This trains verbal pacing and reduces pauses.
- **Filler Word Highlighting**: Common filler expressions (*um*, *like*, *basically*) are parsed in real-time and highlighted in amber.

---

## 🛠️ Technology Stack & Rationale

| Layer | Component | Selection | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend** | Framework | **React 18 + TypeScript** | Strongly typed components, virtual DOM efficiency, and clear state lifecycle management. |
| | Bundler | **Vite** | Instant Hot Module Replacement (HMR) and fast build times. |
| | Styling | **TailwindCSS + Custom CSS** | Utility-first design combined with CSS Variables for consistent typography and glassmorphism. |
| | Animations | **Framer Motion** | Physics-based micro-interactions, smooth tabs transitions, and card shakes. |
| **Backend** | Server | **Express.js + TypeScript** | Lightweight, modular routing, and native TS execution via `ts-node`. |
| **AI Integration** | Engine | **Gemini 2.5 Flash** | Sub-3-second latency, schema-enforced JSON structures, and high semantic reasoning. |
| | Client SDK | **@google/genai** | Official Google client library using the latest `v1beta` endpoint features. |

---

## 🏗️ High-Level Architecture

ThinkFlow uses a decoupled client-server architecture:

```
┌─────────────────────────────────┐
│        React Frontend           │
│  - Web Speech API (Dictation)   │
│  - Animation & Inactivity loops │
└────────────────┬────────────────┘
                 │
                 │ HTTP POST (/api/analyze)
                 ▼
┌─────────────────────────────────┐
│        Express Backend          │
│  - Payload Validation Middleware │
│  - Request/Latency Logging      │
└────────────────┬────────────────┘
                 │
                 │ Google GenAI SDK (Schema-enforced JSON)
                 ▼
┌─────────────────────────────────┐
│     Google Gemini API Engine    │
│  - Topic Generator Service      │
│  - Evaluation Review Service    │
└─────────────────────────────────┘
```
