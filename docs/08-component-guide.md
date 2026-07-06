# Component Guide

ThinkFlow follows a modular component design. Here is the documentation for the primary frontend React modules.

---

## 🧩 Component: `SingleWorkspace`
- **Location**: [src/features/practice/SingleWorkspace.tsx](file:///Users/aryan/Idea/src/features/practice/SingleWorkspace.tsx)
- **Purpose**: The central dashboard of the platform. Manages tab selection between Writing and Speech, holds quotes rotation timers, and hosts the **AI Report Screen** at the top level.

### Key States
| State | Type | Description |
| :--- | :--- | :--- |
| `activeTab` | `'writing' \| 'speech'` | The active workspace tab selection. |
| `isSessionActive` | `boolean` | Lifted state indicating if a workspace is in an active session (hides navigation controls). |
| `activeFeedback` | `any` | Holds the structured analysis feedback payload returned by the `/api/analyze` request. |
| `feedbackMode` | `string` | Tracks which mode generated the report (Random Topic, Introduce Yourself, or Speech Practice). |

### Navigation Flow callbacks
- `handleAgain()`: Triggered when "Practice Again" is clicked on the report. Instantly boots the respective workspace into the active session by resetting state keys.
- `handleExit()`: Clears the report and returns the user to the respective tab's idle lobby.

---

## 🧩 Component: `WritingWorkspace`
- **Location**: [src/features/practice/WritingWorkspace.tsx](file:///Users/aryan/Idea/src/features/practice/WritingWorkspace.tsx)
- **Purpose**: Captures text editor interactions, manages user profiles for introduction drafts, tracks keypress inactivity, and triggers written analysis.

### Props
```typescript
interface WritingWorkspaceProps {
  onSessionStateChange?: (isActive: boolean) => void;
  onAnalysisComplete: (feedback: any, mode: 'random-topic' | 'introduce-yourself') => void;
  initialPracticeMode?: 'random' | 'intro';
  initialSetupStep?: 'idle' | 'profile' | 'active';
}
```

---

## 🧩 Component: `SpeechWorkspace`
- **Location**: [src/features/practice/SpeechWorkspace.tsx](file:///Users/aryan/Idea/src/features/practice/SpeechWorkspace.tsx)
- **Purpose**: Interacts with the Web Speech API, displays live transcripts with filler-word parsing, renders simulated audio waveforms, and triggers spoken evaluation.

### Props
```typescript
interface SpeechWorkspaceProps {
  onSessionStateChange?: (isActive: boolean) => void;
  onAnalysisComplete: (feedback: any) => void;
  initialSetupStep?: 'idle' | 'active';
}
```
