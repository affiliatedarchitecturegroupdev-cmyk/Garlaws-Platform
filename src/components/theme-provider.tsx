'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, designTokens } from '@/design-system/tokens';

export type ThemeName = keyof typeof themes;

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  resolvedTheme: typeof themes.garlaws;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'garlaws',
  storageKey = 'garlaws-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as ThemeName;
      if (stored && themes[stored]) {
        setThemeState(stored);
      } else {
        // Check system preference
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = systemDark ? 'dark' : 'light';
        setThemeState(systemTheme as ThemeName);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
    setMounted(true);
  }, [storageKey]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const resolvedTheme = themes[theme];

    // Apply CSS custom properties
    Object.entries(resolvedTheme).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--${key}`, value);
      }
    });

    // Apply data attribute for theme detection
    root.setAttribute('data-theme', String(theme));

    // Apply dark class for Tailwind
    const isDark = theme === 'dark' || (theme !== 'light' && theme !== 'garlaws-professional');
    root.classList.toggle('dark', isDark);

    // Store theme preference
    try {
      localStorage.setItem(storageKey, String(theme));
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme, mounted, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if no explicit theme is set
      if (!localStorage.getItem(storageKey)) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [storageKey]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const currentIndex = Object.keys(themes).indexOf(String(theme));
    const nextIndex = (currentIndex + 1) % Object.keys(themes).length;
    const nextTheme = Object.keys(themes)[nextIndex] as ThemeName;
    setThemeState(nextTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme: themes[theme],
    isDark: theme === 'dark',
    toggleTheme,
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme toggle component
interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = true }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const themeOptions: { key: ThemeName; label: string; icon: string }[] = [
    { key: 'light', label: 'Light', icon: '☀️' },
    { key: 'dark', label: 'Dark', icon: '🌙' },
    { key: 'garlaws', label: 'Garlaws', icon: '🌿' },
    { key: 'garlaws-professional', label: 'Professional', icon: '💼' },
    { key: 'garlaws-enterprise', label: 'Enterprise', icon: '🏢' },
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium">Theme:</span>
      )}
      <select
        value={String(theme)}
        onChange={(e) => setTheme(e.target.value as ThemeName)}
        className="px-3 py-1 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {themeOptions.map((option) => (
          <option key={String(option.key)} value={String(option.key)}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// CSS-in-JS theme utility
export function cssTheme(theme: ThemeName = 'garlaws') {
  const resolvedTheme = themes[theme];

  return Object.entries(resolvedTheme).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[`--${key}`] = value;
    }
    return acc;
  }, {} as Record<string, string>);
}

// Hook for theme-aware styling
export function useThemeStyles() {
  const { resolvedTheme } = useTheme();

  return {
    // Color utilities
    primary: resolvedTheme.primary,
    secondary: resolvedTheme.secondary,
    accent: resolvedTheme.accent,
    background: resolvedTheme.background,
    foreground: resolvedTheme.foreground,
    surface: resolvedTheme.surface,
    surfaceHover: resolvedTheme.surfaceHover,

    // Semantic colors
    success: resolvedTheme.success,
    warning: resolvedTheme.warning,
    error: resolvedTheme.error,
    info: resolvedTheme.info,

    // Gradients
    gradientPrimary: resolvedTheme.gradientPrimary,
    gradientSecondary: resolvedTheme.gradientSecondary,
    gradientSurface: resolvedTheme.gradientSurface,

    // Shadows
    shadow: resolvedTheme.shadow,
    shadowHover: resolvedTheme.shadowHover,
  };
}