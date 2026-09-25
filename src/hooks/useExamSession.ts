import { useCallback } from 'react';
import type { ExamTemplate, ExamSession, CheckpointRecord } from '../types';
import { EXAM_PRESETS } from '../constants/presets';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

function createSession(template: ExamTemplate): ExamSession {
  return {
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
}

function buildCheckpoint(
  prev: ExamSession,
  base: Omit<CheckpointRecord, 'id' | 'timestamp' | 'elapsedSecondsAtCheckpoint' | 'deltaSeconds' | 'order'>,
  elapsedSeconds: number,
): CheckpointRecord {
  const lastCheckpointElapsed = prev.checkpoints.length > 0
    ? prev.checkpoints[prev.checkpoints.length - 1].elapsedSecondsAtCheckpoint
    : 0;

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    elapsedSecondsAtCheckpoint: elapsedSeconds,
    deltaSeconds: elapsedSeconds - lastCheckpointElapsed,
    order: prev.checkpoints.length,
    ...base,
  };
}

function withCheckpoints(prev: ExamSession, checkpoint: CheckpointRecord): ExamSession {
  return { ...prev, checkpoints: [...prev.checkpoints, checkpoint] };
}

const DEFAULT_SESSION = createSession(EXAM_PRESETS[0]);

export function useExamSession() {
  const [activeSession, setActiveSession] = useLocalStorage<ExamSession>(
    STORAGE_KEYS.session,
    DEFAULT_SESSION,
  );

  const startSession = useCallback((template: ExamTemplate) => {
    setActiveSession(createSession(template));
  }, [setActiveSession]);

  const addCheckpoint = useCallback(
    (sectionId: string, sectionName: string, elapsedSeconds: number, questionCount?: number) => {
      setActiveSession((prev) => {
        if (!prev) return prev;
        return withCheckpoints(
          prev,
          buildCheckpoint(prev, { sectionId, sectionName, questionCount }, elapsedSeconds),
        );
      });
    },
    [setActiveSession],
  );

  const addGenericCheckpoint = useCallback(
    (elapsedSeconds: number, customName?: string) => {
      setActiveSession((prev) => {
        if (!prev) return prev;
        // Sadece zaman notlarını sayıyoruz, böylece dersler araya girse bile Not 1'den başlar!
        const noteCount = prev.checkpoints.filter((c) => c.isGenericLap).length;
        const name = customName?.trim() || `Not ${noteCount + 1}`;
        return withCheckpoints(
          prev,
          buildCheckpoint(
            prev,
            { sectionId: 'not-' + Date.now(), sectionName: name, isGenericLap: true },
            elapsedSeconds,
          ),
        );
      });
    },
    [setActiveSession],
  );

  const undoLastCheckpoint = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev || prev.checkpoints.length === 0) return prev;
      return { ...prev, checkpoints: prev.checkpoints.slice(0, -1) };
    });
  }, [setActiveSession]);

  const removeCheckpoint = useCallback(
    (checkpointId: string) => {
      setActiveSession((prev) => {
        if (!prev) return prev;
        return { ...prev, checkpoints: prev.checkpoints.filter((c) => c.id !== checkpointId) };
      });
    },
    [setActiveSession],
  );

  const finishSession = useCallback(
    (finalElapsedSeconds: number) => {
      setActiveSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalElapsedSeconds: finalElapsedSeconds,
          completedAt: Date.now(),
        };
      });
    },
    [setActiveSession],
  );

  const resetSessionCheckpoints = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        id: crypto.randomUUID(),
        startedAt: Date.now(),
        completedAt: null,
        totalElapsedSeconds: 0,
        checkpoints: [],
      };
    });
  }, [setActiveSession]);

  const updateSessionConfig = useCallback(
    (title: string, durationSeconds: number, templateId?: string) => {
      setActiveSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          examTitle: title,
          totalAllocatedSeconds: durationSeconds,
          examTemplateId: templateId || prev.examTemplateId,
        };
      });
    },
    [setActiveSession],
  );

  const clearSession = useCallback(() => {
    setActiveSession(createSession(EXAM_PRESETS[0]));
  }, [setActiveSession]);

  return {
    activeSession,
    startSession,
    updateSessionConfig,
    addCheckpoint,
    addGenericCheckpoint,
    undoLastCheckpoint,
    removeCheckpoint,
    finishSession,
    resetSessionCheckpoints,
    clearSession,
  };
}
