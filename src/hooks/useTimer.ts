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

  // Subtle audio alerts for 15m and 5m remaining
  const playedAlertsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (mode === 'countdown' && isRunning && initialSeconds > 0) {
      const remaining = initialSeconds - elapsedSeconds;
      
      // 900s = 15m, 300s = 5m
      if ((remaining === 900 || remaining === 300) && !playedAlertsRef.current.has(remaining)) {
        playedAlertsRef.current.add(remaining);
        
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          // 15m = lower pitch (440Hz), 5m = slightly higher pitch (523Hz)
          osc.frequency.setValueAtTime(remaining === 300 ? 523.25 : 440, ctx.currentTime);
          
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 1.5);
        } catch (e) {
          console.error("Audio playback failed for timer alert", e);
        }
      }
    }
  }, [elapsedSeconds, isRunning, mode, initialSeconds]);

  return {
    elapsedSeconds,
    remainingSeconds,
    displayedSeconds,
    isRunning,
    toggleTimer,
    resetTimer,
  };
}
