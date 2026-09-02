import { useEffect, useRef, useState } from 'react';

export function useWakeLock(isActive: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  useEffect(() => {
    if (!isSupported || !isActive) {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
        setIsLocked(false);
      }
      return;
    }

    let isSubscribed = true;

    const requestLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen');
          if (isSubscribed) {
            wakeLockRef.current = lock;
            setIsLocked(true);

            lock.addEventListener('release', () => {
              if (isSubscribed) setIsLocked(false);
            });
          }
        }
      } catch {
        // May fail if battery saver is on or backgrounded
      }
    };

    requestLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isSubscribed = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
        setIsLocked(false);
      }
    };
  }, [isActive, isSupported]);

  return { isSupported, isLocked };
}
