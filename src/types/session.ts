import type { CheckpointRecord } from './checkpoint';
import type { TimerMode } from './exam';

export interface SectionScore {
  correct: number;
  incorrect: number;
  empty?: number;
  net: number;
}

export interface ExamSession {
  id: string;
  examTemplateId: string;
  examTitle: string;
  startedAt: number; // Unix timestamp
  completedAt: number | null; // Unix timestamp or null if ongoing
  mode: TimerMode;
  totalAllocatedSeconds: number;
  totalElapsedSeconds: number;
  checkpoints: CheckpointRecord[];
  sectionScores?: Record<string, SectionScore>;
  totalNet?: number;
  penaltyRatio?: number;
}

