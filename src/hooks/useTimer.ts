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
        playCompletionSound();
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

/**
 * Süre dolduğunda çalan huzurlu ve net melodi (Web Audio API)
 * Dışarıdan MP3 dosyası gerektirmez, çevrimdışı da anında çalar.
 */
function playCompletionSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // 4 tonlu uyumlu melodi: C5, E5, G5, C6 (Hafif ve net tamamlama çanı)
    const notes = [
      { freq: 523.25, time: 0, dur: 0.5 },
      { freq: 659.25, time: 0.16, dur: 0.5 },
      { freq: 783.99, time: 0.32, dur: 0.6 },
      { freq: 1046.50, time: 0.48, dur: 1.6 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur);
    });

    // Mobil telefonlarda titreşim desteği
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([250, 100, 250, 100, 400]);
    }
  } catch (e) {
    console.warn('Completion sound could not be played:', e);
  }
}
