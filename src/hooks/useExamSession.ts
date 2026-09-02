import { useState, useCallback } from 'react';
import type { ExamTemplate, ExamSession, CheckpointRecord } from '../types';

export function useExamSession() {
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);

  const startSession = useCallback((template: ExamTemplate) => {
    const newSession: ExamSession = {
      id: crypto.randomUUID(),
      examTemplateId: template.id,
      examTitle: template.name,
      startedAt: Date.now(),
      completedAt: null,
      mode: template.defaultMode,
      totalAllocatedSeconds: template.totalDurationSeconds,
      totalElapsedSeconds: 0,
      checkpoints: [],
    };
    setActiveSession(newSession);
  }, []);

  const addCheckpoint = useCallback((sectionId: string, sectionName: string, elapsedSeconds: number) => {
    setActiveSession((prev) => {
      if (!prev) return prev;

      const lastCheckpointElapsed = prev.checkpoints.length > 0 
        ? prev.checkpoints[prev.checkpoints.length - 1].elapsedSecondsAtCheckpoint 
        : 0;

      const deltaSeconds = elapsedSeconds - lastCheckpointElapsed;

      const newCheckpoint: CheckpointRecord = {
        id: crypto.randomUUID(),
        sectionId,
        sectionName,
        timestamp: Date.now(),
        elapsedSecondsAtCheckpoint: elapsedSeconds,
        deltaSeconds,
        order: prev.checkpoints.length,
      };

      return {
        ...prev,
        checkpoints: [...prev.checkpoints, newCheckpoint],
      };
    });
  }, []);

  const addGenericCheckpoint = useCallback((elapsedSeconds: number, customName?: string) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      const lastCheckpointElapsed = prev.checkpoints.length > 0 
        ? prev.checkpoints[prev.checkpoints.length - 1].elapsedSecondsAtCheckpoint 
        : 0;
      const deltaSeconds = elapsedSeconds - lastCheckpointElapsed;
      
      // Sadece zaman notlarını sayıyoruz, böylece dersler araya girse bile Not 1'den başlar!
      const noteCount = prev.checkpoints.filter(c => c.isGenericLap).length;
      const name = customName?.trim() || `Not ${noteCount + 1}`;
      
      const newCheckpoint: CheckpointRecord = {
        id: crypto.randomUUID(),
        sectionId: 'not-' + Date.now(),
        sectionName: name,
        timestamp: Date.now(),
        elapsedSecondsAtCheckpoint: elapsedSeconds,
        deltaSeconds,
        order: prev.checkpoints.length,
        isGenericLap: true,
      };
      return {
        ...prev,
        checkpoints: [...prev.checkpoints, newCheckpoint],
      };
    });
  }, []);

  const undoLastCheckpoint = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev || prev.checkpoints.length === 0) return prev;
      return {
        ...prev,
        checkpoints: prev.checkpoints.slice(0, -1),
      };
    });
  }, []);

  const removeCheckpoint = useCallback((checkpointId: string) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        checkpoints: prev.checkpoints.filter(c => c.id !== checkpointId),
      };
    });
  }, []);

  const finishSession = useCallback((finalElapsedSeconds: number) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        totalElapsedSeconds: finalElapsedSeconds,
        completedAt: Date.now(),
      };
    });
  }, []);

  const clearSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  return {
    activeSession,
    startSession,
    addCheckpoint,
    addGenericCheckpoint,
    undoLastCheckpoint,
    removeCheckpoint,
    finishSession,
    clearSession,
  };
}
