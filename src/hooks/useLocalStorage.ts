import { useState, useEffect } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getLocalStorageItem<T>(key, initialValue);
  });

  useEffect(() => {
    setLocalStorageItem(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
