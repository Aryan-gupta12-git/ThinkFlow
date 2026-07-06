# Data Flow & Sequences

Here are the data flow sequence mappings for the core features of the ThinkFlow platform.

---

## 🔄 Sequence 1: Topics Generation Flow

When the user opens the writing workspace or clicks "Skip Topic", a request is fired to the backend to get a unique topic:

```text
React Client             Vite Proxy            Express Server         GeminiService         Gemini API
    │                        │                       │                      │                    │
    ├─► POST /api/topics ───►│                       │                      │                    │
    │   (body: {exclude})    ├─► POST /api/topics ──►│                      │                    │
    │                        │                       ├─► generateTopic() ──►│                    │
    │                        │                       │                      ├─► generateContent ─►
    │                        │                       │                      │   (returns topic)  │
    │                        │                       │                      ◄─-──-──-──-──-──-──-┤
    │                        │                       │◄─-──-──-──-──-──-──-─┤                    │
    │                        │◄─-──-──-──-──-──-──-──┤                      │                    │
    │◄─-──-──-──-──-──-──-───┤                       │                      │                    │
    │ (sets topic state)     │                       │                      │                    │
```

---

## 🔄 Sequence 2: Practice Evaluation Report Flow

When the user finishes their session (manual click or countdown timer completion), the editor content is packaged and analyzed:

```text
React Client             Vite Proxy            Express Server         Validation MW         GeminiService
    │                        │                       │                      │                    │
    ├─► POST /api/analyze ──►│                       │                      │                    │
    │   (mode, topic, text)  ├─► POST /api/analyze ─►│                      │                    │
    │                        │                       ├─► validate() ────────►                    │
    │                        │                       │   (checks types)     │                    │
    │                        │                       │◄─────────────────────┤                    │
    │                        │                       ├──────────────────────────────────────────►│
    │                        │                       │                                           │  (Gemini API call)
    │                        │                       │                                           ├─► generateContent()
    │                        │                       │                                           │   (Schema enforced JSON)
    │                        │                       │                                           ◄───
    │                        │                       │◄──────────────────────────────────────────┤
    │                        │◄──────────────────────┤                                           │
    │◄───────────────────────┤                       │                                           │
    │ (lift feedback state   │                       │                                           │
    │  & render report)      │                       │                                           │
```

---

## 🔄 Sequence 3: Inactivity Timer Loop (Written Workspace)

Below is the state transitions loop mapping keypresses, warnings, and the 7-second auto-reset trigger:

```text
 User Action             Editor State            lastTypeTimestamp       Timer Loop
      │                       │                          │                   │
  [Type Char] ────────────────┼──────────────────────────►                   │
      │                       │   (updates Date.now())   │                   │
      │                       │                          │                   ├─► Check Inactivity
      │                       │                          │                   │   (Interval every 100ms)
      │                       │                          │                   │
      │                       │                          │                   │   If diff > 1.5s:
      │                       ◄──────────────────────────────────────────────┤   (Set isSlowing = true)
      │                       │ (Renders "Keep writing..." red text)         │
      │                       │                          │                   │
      │                       │                          │                   │   If diff > 7.0s:
      │                       ◄──────────────────────────────────────────────┤   (Trigger shake-card,
      │                       │ (Resets activeText = "")                     │    clear editor content,
      │                       │                          │                   │    fetch new topic)
```
