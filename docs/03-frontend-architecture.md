# Frontend Architecture

ThinkFlow's frontend is built with React 18, utilizing Vite as the build tool and bundler. The design philosophy is centered around a premium, clean, minimalist aesthetic (Apple-inspired) with smooth micro-interactions.

---

## 🎨 Design System & CSS Variables

Rather than cluttering components with inline utility styles, ThinkFlow uses a unified token set declared inside [src/index.css](file:///Users/aryan/Idea/src/index.css). This makes changing colors or typography global.

### Typography
- **Display Sans**: `Outfit` (used for large headers, categories, and landing hero texts).
- **Body Sans**: `Inter` or system-fallback (optimized for readability inside the text editor pads).
- **Monospace**: `JetBrains Mono` (used for timers and raw statistics).

### Color Palette (CSS Variable Tokens)
```css
:root {
  --color-bg: #fafafa;
  --color-card-bg: #ffffff;
  --color-border: #e4e4e7;
  --color-border-subtle: #f4f4f5;
  --color-accent: #0071e3;         /* Apple Blue */
  --color-accent-hover: #0077ed;
  --color-text-primary: #1d1d1f;   /* Apple Charcoal */
  --color-text-secondary: #86868b; /* Apple Gray */
}
```

---

## 🎭 Animations (Framer Motion)

Animations are physics-based rather than duration-based, making the application feel highly responsive and natural.

1. **Tab Switch Transitions**: Uses Framer Motion's `layoutId` to slide the white background bubble under active tabs:
   ```tsx
   <motion.div
     layoutId="activeTabBackground"
     className="absolute inset-0 bg-white rounded-lg shadow-sm border border-black/5 -z-10"
     transition={{ type: 'spring', stiffness: 380, damping: 30 }}
   />
   ```
2. **Tab Changing Wait Transitions**: Uses `<AnimatePresence mode="wait">` to cleanly fade and slide workspaces on entry and exit.
3. **Card Shake Micro-interaction**: Applied when an inactivity trigger resets the editor. The card shakes horizontally using keyframes:
   ```css
   @keyframes shake {
     0%, 100% { transform: translateX(0); }
     20%, 60% { transform: translateX(-6px); }
     40%, 80% { transform: translateX(6px); }
   }
   .shake-card {
     animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
   }
   ```

---

## 📡 API Communication Strategy

The client leverages standard `fetch` APIs.

- **Vite Proxy Bypass**: To prevent hardcoding URLs like `http://localhost:3001` or handling CORS configuration across dev environments, [vite.config.ts](file:///Users/aryan/Idea/vite.config.ts) is configured to proxy `/api` calls:
  ```typescript
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
  ```
- **Error Safeguards**: The fetch requests verify that response payloads have `.success === true`. If the API fails, the frontend retains the typed text and displays a user-friendly alert, avoiding page crashes or state resets.
