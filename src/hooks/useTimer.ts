import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerMode } from '../types';

interface UseTimerProps {
  initialSeconds: number;
  mode: TimerMode;
  onFinish?: () => void;
}

export function useTimer({ initialSeconds, mode, onFinish }: UseTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Keep a ref to onFinish so changing its reference doesn't restart the timer
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Track the start time and accumulated elapsed time
  const accumulatedElapsedRef = useRef(0);
  const startTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      // Stopped/Paused
      startTimestampRef.current = null;
      return;
    }

    // Started or Resumed
    // We calculate the virtual start timestamp based on already accumulated seconds
    const start = Date.now() - (accumulatedElapsedRef.current * 1000);
    startTimestampRef.current = start;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const totalElapsed = Math.floor((now - start) / 1000);

      if (mode === 'countdown' && initialSeconds > 0 && totalElapsed >= initialSeconds) {
        setElapsedSeconds(initialSeconds);
        accumulatedElapsedRef.current = initialSeconds;
        setIsRunning(false);
        clearInterval(intervalId);
        onFinishRef.current?.();
      } else {
        setElapsedSeconds(totalElapsed);
        accumulatedElapsedRef.current = totalElapsed;
      }
    }, 250); // Check every 250ms for snappy, zero-drift updates

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, mode, initialSeconds]);

  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    accumulatedElapsedRef.current = 0;
    startTimestampRef.current = null;
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
