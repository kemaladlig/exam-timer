import { STORAGE_KEYS, getLocalStorageItem, setLocalStorageItem } from './storage';

interface TimerSnapshot {
  running: boolean;
  elapsedSeconds: number;
  savedAt: number;
}

export function loadResumeState(): { elapsedSeconds: number; running: boolean } {
  const snap = getLocalStorageItem<TimerSnapshot | null>(STORAGE_KEYS.timerSnapshot, null);
  if (!snap) return { elapsedSeconds: 0, running: false };
  if (snap.running) {
    const elapsedWhileClosed = Math.max(0, Math.floor((Date.now() - snap.savedAt) / 1000));
    return { elapsedSeconds: snap.elapsedSeconds + elapsedWhileClosed, running: true };
  }
  return { elapsedSeconds: snap.elapsedSeconds, running: false };
}

export function saveTimerSnapshot(running: boolean, elapsedSeconds: number): void {
  setLocalStorageItem<TimerSnapshot>(STORAGE_KEYS.timerSnapshot, {
    running,
    elapsedSeconds,
    savedAt: Date.now(),
  });
}
