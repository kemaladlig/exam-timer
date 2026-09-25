import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerMode } from '../types';
import { playCompletionSound } from '../utils/audio';

export const TIME_THRESHOLDS_SECONDS = [900, 300, 60] as const;

interface UseTimerProps {
  initialSeconds: number;
  mode: TimerMode;
  onFinish?: () => void;
  onThreshold?: (secondsRemaining: number) => void;
  thresholds?: readonly number[];
  /** Yükleme anında kalıcıdan geri yüklenen geçen süre (sn). */
  resumeElapsedSeconds?: number;
  /** Kalıcıdan sayaç çalışırken mı geri yükleniyor. */
  resumeRunning?: boolean;
}

export function useTimer({
  initialSeconds,
  mode,
  onFinish,
  onThreshold,
  thresholds = TIME_THRESHOLDS_SECONDS,
  resumeElapsedSeconds = 0,
  resumeRunning = false,
}: UseTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(resumeElapsedSeconds);
  const [isRunning, setIsRunning] = useState(resumeRunning);

  // Referans değişse de sayaç yeniden başlamasın
  const onFinishRef = useRef(onFinish);
  const onThresholdRef = useRef(onThreshold);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);
  useEffect(() => {
    onThresholdRef.current = onThreshold;
  }, [onThreshold]);

  // Zaman tabanı: başlangıç anı + biriken süre (drift'siz, wall-clock bazlı)
  const accumulatedElapsedRef = useRef(resumeElapsedSeconds);
  const startTimestampRef = useRef<number | null>(null);

  // Her eşik yalnızca bir kez tetiklensin
  const alertedRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    alertedRef.current = new Set();
  }, [initialSeconds, mode]);

  useEffect(() => {
    if (!isRunning) {
      startTimestampRef.current = null;
      return;
    }

    // Çalışırken sekme arka planda olabilir; elapsed'i her tick'te wall-clock'tan
    // yeniden hesaplarız, böylece görünür olduğunda gecikmeli de olsa doğru tetiklenir.
    const start = Date.now() - accumulatedElapsedRef.current * 1000;
    startTimestampRef.current = start;

    const intervalId = setInterval(() => {
      const totalElapsed = Math.floor((Date.now() - start) / 1000);

      if (mode === 'countdown' && initialSeconds > 0 && totalElapsed >= initialSeconds) {
        setElapsedSeconds(initialSeconds);
        accumulatedElapsedRef.current = initialSeconds;
        setIsRunning(false);
        clearInterval(intervalId);
        playCompletionSound();
        onFinishRef.current?.();
        return;
      }

      setElapsedSeconds(totalElapsed);
      accumulatedElapsedRef.current = totalElapsed;

      // Sessiz eşik uyarısı: yalnızca sınav süresinin altında kalan eşikler
      if (mode === 'countdown' && initialSeconds > 0) {
        const remaining = initialSeconds - totalElapsed;
        for (const t of thresholds) {
          if (t < initialSeconds && remaining <= t && !alertedRef.current.has(t)) {
            alertedRef.current.add(t);
            onThresholdRef.current?.(t);
          }
        }
      }
    }, 250);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, mode, initialSeconds, thresholds]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    accumulatedElapsedRef.current = 0;
    startTimestampRef.current = null;
    alertedRef.current = new Set();
    setElapsedSeconds(0);
  }, []);

  const remainingSeconds = Math.max(0, initialSeconds - elapsedSeconds);
  const displayedSeconds = mode === 'countdown' ? remainingSeconds : elapsedSeconds;

  return {
    elapsedSeconds,
    remainingSeconds,
    displayedSeconds,
    isRunning,
    toggleTimer,
    resetTimer,
  };
}
