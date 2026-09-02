export type TimerMode = 'countdown' | 'stopwatch';
export type TimeDisplayFormat = 'mm:ss' | 'hh:mm:ss' | 'm_only';

export interface SectionConfig {
  id: string;
  name: string;
  questionCount?: number;
}

export interface ExamTemplate {
  id: string;
  name: string;
  description?: string;
  defaultMode: TimerMode;
  totalDurationSeconds: number;
  sections: SectionConfig[];
}

export interface CustomPreset {
  id: string;
  name: string;
  sections: SectionConfig[];
  totalDurationSeconds?: number;
}
