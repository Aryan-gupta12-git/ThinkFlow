# Gemini AI Integration

ThinkFlow integrates Google's **Gemini 2.5 Flash** model for all cognitive generation and evaluation tasks. 

---

## 🚀 SDK Initialization

The server uses the official `@google/genai` library. The client is initialized once as a static class property in [backend/src/services/gemini.service.ts](file:///Users/aryan/Idea/backend/src/services/gemini.service.ts):

```typescript
import { GoogleGenAI } from '@google/genai';
import { config } from '../config';

export class GeminiService {
  private static ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  // ...
}
```

The initialization retrieves the key from `config.GEMINI_API_KEY`, which is loaded from `backend/.env`.

---

## 🧠 Prompt Engineering & Schema Enforcement

To prevent the model from returning conversational filler (e.g., "Sure, here is your analysis..."), markdown fences, or malformed formats, we configure the API call with **Structured JSON Outputs** by passing `responseMimeType: 'application/json'` and a strict `responseSchema`.

### The Schema
```typescript
const schema = {
  type: 'object',
  properties: {
    isTooShort: { type: 'boolean' },
    shortMessage: { type: 'string' },
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    improvements: { type: 'array', items: { type: 'string' } },
    grammarCorrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          original: { type: 'string' },
          corrected: { type: 'string' },
          explanation: { type: 'string' }
        },
        required: ['original', 'corrected']
      }
    },
    improvedVersion: { type: 'string' },
    suggestions: { type: 'array', items: { type: 'string' } }
  },
  required: [
    'isTooShort',
    'shortMessage',
    'summary',
    'strengths',
    'improvements',
    'grammarCorrections',
    'improvedVersion',
    'suggestions'
  ]
};
```

By specifying all properties inside the `required` array, we force the Gemini model to output valid, complete objects containing all keys. This avoids JSON parsing errors on the backend and layout rendering bugs on the React client.

---

## 🔄 Resilience & Error Recovery

Google's API free tier is rate-limited to **15 Requests Per Minute (RPM)** and **20 Requests Per Day (RPD)**. Under high usage, it returns `429 RESOURCE_EXHAUSTED` or `503 Service Unavailable`.

To make ThinkFlow bullet-proof, we implement:

1. **Short Cooldown Retries**: The service implements a `while` loop (max 2 attempts) for both topic generation and analysis. If a transient error occurs, it waits for 1.5 seconds and retries.
2. **Local Mock Fallbacks**: If all retry attempts are exhausted (e.g., the API key is completely rate-limited), the code catches the error, logs the stack trace to the console, and returns a high-quality local evaluation object. This allows developers to test the application flows end-to-end without being blocked by API locks.
