export interface CheckpointRecord {
  id: string;
  sectionId: string;
  sectionName: string;
  timestamp: number; // Unix timestamp when checkpoint was recorded
  elapsedSecondsAtCheckpoint: number; // Total exam time elapsed when this checkpoint was recorded
  deltaSeconds: number; // Time spent since last checkpoint
  order: number;
  isGenericLap?: boolean; // True if this was just a lap, not a section finish
}
