import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

/**
 * Kalıcı arayüz tercihleri: üst ambient çubuk, Zen modu ve sessiz eşik uyarısı.
 */
export function useUiPrefs() {
  const [showProgressBar, setShowProgressBar] = useLocalStorage<boolean>(STORAGE_KEYS.showProgressBar, true);
  const [zenMode, setZenMode] = useLocalStorage<boolean>(STORAGE_KEYS.zenMode, false);
  const [thresholdAlerts, setThresholdAlerts] = useLocalStorage<boolean>(STORAGE_KEYS.thresholdAlerts, false);

  const toggleProgressBar = useCallback(
    (show: boolean) => setShowProgressBar(show),
    [setShowProgressBar],
  );
  const toggleZenMode = useCallback(
    (enabled: boolean) => setZenMode(enabled),
    [setZenMode],
  );
  const toggleThresholdAlerts = useCallback(
    (enabled: boolean) => setThresholdAlerts(enabled),
    [setThresholdAlerts],
  );

  return {
    showProgressBar,
    toggleProgressBar,
    zenMode,
    toggleZenMode,
    thresholdAlerts,
    toggleThresholdAlerts,
  };
}
