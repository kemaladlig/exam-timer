export type TimerMode = 'countdown' | 'stopwatch';
export type TimeDisplayFormat = 'mm:ss' | 'hh:mm:ss' | 'm_only';

export interface SectionConfig {
  id: string;
  name: string;
}

export interface ExamTemplate {
  id: string;
  name: string;
  description?: string;
  defaultMode: TimerMode;
  totalDurationSeconds: number;
  sections: SectionConfig[];
}
