'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'modern' | 'night' | 'vintage';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('modern');

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = (localStorage.getItem('yuubin-theme') as Theme) || 'modern';
    setThemeState(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    
    // Remove all theme classes
    html.classList.remove('dark', 'vintage', 'modern');
    
    // Apply the new theme
    if (newTheme === 'night') {
      html.classList.add('dark');
    } else if (newTheme === 'vintage') {
      html.classList.add('vintage');
    } else {
      html.classList.add('modern');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('yuubin-theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
