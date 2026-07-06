# Troubleshooting & Diagnostics

A guide to resolving common environment issues and platform runtime bugs.

---

## 🛑 1. Gemini API Quota Exceeded (RESOURCE_EXHAUSTED / 429)

### Symptom
The terminal console prints:
`ApiError: You exceeded your current quota...`
The backend logs warning:
`[GeminiService] All API attempts exhausted. Generating local mock analysis...`

### Why it Happens
Google's Gemini free tier restricts API calls to **20 requests per day**. Running tests, loading pages repeatedly, or having multiple tabs open will deplete this.

### Fix
- Wait for the 24-hour sliding window to refresh.
- Setup billing in Google AI Studio to move to the pay-as-you-go tier (which offers high rate limits).
- The system automatically serves high-quality mock assessments locally so you can continue testing the frontend flows and report dashboards.

---

## 🛑 2. Browser Microphone Permisson Blocked

### Symptom
Clicking **Start Practice** in Speech Mode shows no wave animation, and the mic status is stuck on "Ready". No transcript appears as you speak.

### Why it Happens
The Web Speech API requires explicit hardware access. If you block microphone permission once, Chrome/Safari will persistently block it without prompting again.

### Fix
1. Look at the browser search bar. Click the **Camera/Mic** icon in the right corner.
2. Select **Always allow http://localhost:5173 to access your microphone**.
3. Reload the page and try again.

---

## 🛑 3. Speech Recognition stops transcript middle-of-sentence

### Symptom
Speech recognition stops working or freezes if you pause speaking for more than a second.

### Why it Happens
Some browser implementations of `webkitSpeechRecognition` have aggressive internal silence detectors and close the stream.

### Fix
- Ensure you are using **Google Chrome** or **Safari** (Web Speech API is poorly supported in Firefox or Brave Shields).
- We set `continuous = true` and `interimResults = true` to force the stream to stay open as long as possible.
- If it disconnects, our `onend` listener automatically checks if the session is still active and triggers a reconnect immediately.
