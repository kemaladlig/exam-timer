import type { CheckpointRecord } from './checkpoint';
import type { TimerMode } from './exam';

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
}
