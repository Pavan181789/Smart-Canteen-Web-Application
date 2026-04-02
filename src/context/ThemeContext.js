/**
 * Theme Context for Dark/Light Mode
 * Professional theme management with system preference detection
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [theme, setTheme] = useState('dark');

  // Theme configurations
  const themes = {
    dark: {
      name: 'dark',
      colors: {
        bg: '#0f172a',
        card: '#1e293b',
        surface: '#334155',
        border: '#475569',
        text: '#ffffff',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        glass: 'rgba(255, 255, 255, 0.05)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
      },
      gradients: {
        primary: 'from-blue-600 to-purple-600',
        success: 'from-green-500 to-emerald-600',
        error: 'from-red-500 to-pink-600',
        warning: 'from-yellow-500 to-orange-600',
        info: 'from-blue-500 to-cyan-600',
        text: 'from-blue-400 via-purple-500 to-pink-500',
      }
    },
    light: {
      name: 'light',
      colors: {
        bg: '#ffffff',
        card: '#f8fafc',
        surface: '#f1f5f9',
        border: '#e2e8f0',
        text: '#1e293b',
        textSecondary: '#475569',
        textMuted: '#64748b',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        glass: 'rgba(0, 0, 0, 0.05)',
        glassBorder: 'rgba(0, 0, 0, 0.1)',
      },
      gradients: {
        primary: 'from-blue-500 to-purple-500',
        success: 'from-green-400 to-emerald-500',
        error: 'from-red-400 to-pink-500',
        warning: 'from-yellow-400 to-orange-500',
        info: 'from-blue-400 to-cyan-500',
        text: 'from-blue-600 via-purple-600 to-pink-600',
      }
    }
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setTheme(systemPrefersDark ? 'dark' : 'light');
      setIsDarkMode(systemPrefersDark);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = themes[theme];
    
    // Update CSS custom properties
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Update Tailwind classes
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = currentTheme.colors.bg;
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setIsDarkMode(newTheme === 'dark');
  };

  const setThemeMode = (mode) => {
    if (themes[mode]) {
      setTheme(mode);
      setIsDarkMode(mode === 'dark');
    }
  };

  const currentTheme = themes[theme];

  const value = {
    theme,
    isDarkMode,
    currentTheme,
    toggleTheme,
    setThemeMode,
    colors: currentTheme.colors,
    gradients: currentTheme.gradients,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
