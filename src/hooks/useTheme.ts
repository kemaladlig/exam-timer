import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { STORAGE_KEYS } from '../utils/storage';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    const themeColor = isDarkMode ? '#09090b' : '#f8fafc';
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem(STORAGE_KEYS.theme, isDarkMode ? 'dark' : 'light');

    // Durum çubuğu rengini iOS + Android için anında güncelle
    document.querySelectorAll('meta[name="theme-color"]').forEach((tag) => {
      tag.setAttribute('content', themeColor);
    });

    // Chromium/Android yeniden çizimi tetiklemek için taze etiket
    const dynamicId = 'theme-color-dynamic-override';
    document.getElementById(dynamicId)?.remove();
    const freshMeta = document.createElement('meta');
    freshMeta.id = dynamicId;
    freshMeta.name = 'theme-color';
    freshMeta.content = themeColor;
    document.head.appendChild(freshMeta);
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    const next = !isDarkMode;
    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => setIsDarkMode(next));
      });
    } else {
      setIsDarkMode(next);
    }
  }, [isDarkMode]);

  return { isDarkMode, toggleTheme };
}
