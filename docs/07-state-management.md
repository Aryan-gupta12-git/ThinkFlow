# State Management

ThinkFlow handles complex, real-time interactive loops, including speech recognition streams, countdown timers, keyboard typing checks, and transition animations.

---

## 🔒 State Isolation between Practice Modes

To prevent shared state bugs, each practice mode maintains its own independent content state. 

Inside [WritingWorkspace.tsx](file:///Users/aryan/Idea/src/features/practice/WritingWorkspace.tsx):
- **Random Topic Text**: `const [randomTopicText, setRandomTopicText] = useState('');`
- **Introduce Yourself Text**: `const [introduceYourselfText, setIntroduceYourselfText] = useState('');`

When rendering the workspace or calculating statistics, we determine the `activeText` based on the active mode:
```typescript
const activeText = practiceMode === 'intro' ? introduceYourselfText : randomTopicText;
```

---

## 🔄 React Refs Synchronization (The "Stale Closure" Safeguard)

Inside interval loops (like the 7-second inactivity check), React state variables are captured inside closures. Since intervals run repeatedly, they can referencing old, stale values of states like `text` or `timeLeft`.

To solve this, we create `useRef` configurations that mirror active states, and synchronize them inside `useEffect` calls:

```typescript
const textRef = useRef(activeText);
useEffect(() => { textRef.current = activeText; }, [activeText]);

const inactivityTimerRef = useRef(inactivityTimer);
useEffect(() => { inactivityTimerRef.current = inactivityTimer; }, [inactivityTimer]);
```

Inside the timers, we read `textRef.current` and `inactivityTimerRef.current`, guaranteeing that the loop always evaluates the latest typed characters.

---

## ⏱️ Inactivity and Countdown Timer Loop

- **3-Minute Session Timer**: Initiated once the user types the first character or starts speaking. Runs down to 0, which automatically stops the recording and sends content to the backend.
- **7.0-Second Inactivity Fuse**: Decrements by `0.1s` every `100ms`. Checked by comparing the current timestamp against the `lastTypeTimestampRef.current`. If the difference exceeds 7.0 seconds, the session resets.

---

## 🎙️ Web Speech Dictation State Flow

Inside [SpeechWorkspace.tsx](file:///Users/aryan/Idea/src/features/practice/SpeechWorkspace.tsx):
- **Continuous Mode**: Speech recognition runs continuously (`continuous = true`).
- **Interim Results**: Renders temporary transcript text in gray while the user is mid-sentence (`interimResults = true`).
- **Accumulated History Ref**: When browser recognitions disconnect or reset, we save the transcript history to a ref (`accumulatedTranscriptRef.current`) and append new results to it on restart.
- **Microphone Stream Release**: We track active audio tracks using `activeStreamRef.current` and explicitly invoke `.stop()` on each track during session resets to release the hardware microphone resource (removing the red browser recording dot).
