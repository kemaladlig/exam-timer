/**
 * Merkezi localStorage anahtarları. Şema değiştiğinde sürüm son ekini artır
 * (ör. exam_session_v2) — eski/uyumsuz kayıtlar otomatik yok sayılır.
 */
export const STORAGE_KEYS = {
  theme: 'exam_theme',
  showProgressBar: 'exam_show_progress_bar',
  zenMode: 'exam_zen_mode',
  thresholdAlerts: 'exam_threshold_alerts',
  session: 'exam_session_v1',
  timerMode: 'exam_timer_mode',
  durationSeconds: 'exam_duration_seconds',
  selectedPresetId: 'exam_selected_preset_id',
  sections: 'exam_sections_v1',
  timerSnapshot: 'exam_timer_snapshot_v1',
} as const;

export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setLocalStorageItem = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
};
