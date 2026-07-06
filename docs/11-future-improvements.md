# Future Improvements & Roadmap

The current architecture of ThinkFlow is modular and ready to scale. Below is the technical roadmap for product version increments.

---

## 🔒 1. User Authentication & Multi-Tenancy

- **Action**: Implement login/signup using **Firebase Auth** or **Auth0**.
- **Impact**: Secure sessions and restrict resource utilization per user.

---

## 💾 2. Database Integration (Persistent History)

- **Action**: Connect a database (e.g., **MongoDB** or **PostgreSQL**).
- **Schema Mapping**:
  ```sql
  CREATE TABLE practice_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    mode VARCHAR(50) NOT NULL,
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    feedback_summary TEXT,
    strengths TEXT[],
    improvements TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **Impact**: Store history and allow users to view previous analysis reports.

---

## 📊 3. User Dashboard & Progress Tracking

- **Action**: Render analytical charts using **Recharts** on the frontend.
- **Metrics**:
  - Over time score progression.
  - Filler words usage trends (reducing count per minute).
  - Practice consistency frequency heatmaps.

---

## 🎙️ 4. Native AI Speech-to-Text & Pronunciation Scoring

- **Action**: Replace the browser's Web Speech API with backend speech-to-text models like **Whisper API** or **Google Cloud Speech-to-Text**.
- **Metrics**: Extract word pacing, pauses, pronunciation clarity scores, and rhythm indicators.

---

## 🌓 5. App-Wide Dark Mode
- **Action**: Introduce CSS Variables toggle (`.dark-theme`) to transition the background colors from Apple Off-White (`#fafafa`) to Dark Charcoal (`#121212`).
