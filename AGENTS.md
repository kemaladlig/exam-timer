# Project: Exam Timer (Sınav / Deneme Kronometresi)

## 📌 Architecture & Overview
Modern, lightweight, PWA-ready exam & study timer built with React 19, TypeScript, Vite, and Tailwind CSS. Tailored specifically for standardized exam preparations (YKS, TYT, AYT, KPSS, ALES, LGS) and custom study workflows.

---

## 🛠 Tech Stack
- **Framework & Runtime:** React 19, TypeScript (Strict), Vite 8
- **Styling:** Tailwind CSS 4 with custom utilities and full light/dark theme support
- **Icons:** Lucide React (`lucide-react`)
- **PWA:** `vite-plugin-pwa` with automatic service worker updates and manifest configuration
- **Mobile Hardware Integration:** Screen Wake Lock API (`useWakeLock`) to keep display active during running sessions

---

## 🏗 Directory Structure
```
src/
├── components/
│   ├── checkpoints/      # CheckpointCard, CheckpointList (Lesson/Subject splits & time stamps)
│   ├── timer/            # TimerDisplay, TimerControls (Time editing, format toggle, audio/visual controls)
│   └── ui/               # Reusable atomic UI elements (Button, Card, Input, Modal, Select)
├── constants/
│   └── presets.ts        # Built-in exam configurations (TYT, AYT, KPSS, ALES, Pomodoro)
├── hooks/
│   ├── useExamSession.ts # Session checkpoints, splits, note markers, undo operations
│   ├── useTimer.ts       # Core timer engine (stopwatch / countdown), sound notifications
│   └── useWakeLock.ts    # Screen Wake Lock controller
├── types/
│   ├── exam.ts           # Timer modes, display formats, templates
│   └── session.ts        # Checkpoint records, session summaries
├── utils/
│   ├── cn.ts             # Tailwind classnames merger
│   └── time.ts           # Format converters (mm:ss, hh:mm:ss, m_only) and manual time inputs
├── App.tsx               # Primary dashboard & layout integration
└── main.tsx              # Entry point
```

---

## 📐 Core Engineering Standards
1. **Functional & Hook-Driven:** All logic is encapsulated in custom hooks (`useTimer`, `useExamSession`, `useWakeLock`).
2. **Strict TypeScript:** Explicit interfaces for props and states; no `any`.
3. **High Contrast & Eye-Friendly Aesthetics:** Accessible contrast ratios for study sessions in both daylight (light mode) and late-night (dark mode) environments without eye strain.
4. **Resilient UX:** Undo support (`undoLastCheckpoint`, individual removal) for accidental clicks, manual time adjustments, and seamless keyboard/touch controls.
5. **PWA First:** Installable on iOS/Android home screens without URL bars or browser chrome.
6. **Smooth & Native Transitions:** Heavy animation libraries (like Framer Motion) are avoided to maintain zero-cost performance. Instead, native CSS transitions, Tailwind `animate-in` utilities, and logical layout persistence are used (e.g., keeping completed session state on screen until the user explicitly starts a new exam).

---

## 🚀 Future Roadmap & Planned Features
- **Subtle Audio/Visual Alerts:** Non-intrusive notifications for critical time thresholds (e.g., "15 minutes remaining", "5 minutes remaining").
- **Time Per Question (Soru Başına Süre):** Advanced statistics in the summary modal to calculate and display the average time spent per question per section.
- **Social Sharing:** Ability to export the final session summary as a beautiful image or text block for easy sharing on social media or study groups.
