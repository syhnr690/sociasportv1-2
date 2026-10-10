import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundFx } from '../utils/audio';

export type AppTheme = 'night' | 'day';

interface ThemeContextType {
  theme: AppTheme;
  isDay: boolean;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'night',
  isDay: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('sociasport_theme');
      if (saved === 'day' || saved === 'night') return saved;
    } catch {
      // ignore
    }
    return 'night';
  });

  useEffect(() => {
    try {
      localStorage.setItem('sociasport_theme', theme);
    } catch {
      // ignore
    }

    if (theme === 'day') {
      document.documentElement.classList.add('theme-day');
      document.body.classList.add('theme-day');
    } else {
      document.documentElement.classList.remove('theme-day');
      document.body.classList.remove('theme-day');
    }
  }, [theme]);

  const toggleTheme = () => {
    soundFx.playClick();
    setThemeState((prev) => (prev === 'night' ? 'day' : 'night'));
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const isDay = theme === 'day';

  return (
    <ThemeContext.Provider value={{ theme, isDay, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
