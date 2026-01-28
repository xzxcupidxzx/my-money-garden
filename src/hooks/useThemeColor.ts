import { useState, useEffect } from 'react';

export type ThemeColorOption = 'blue' | 'purple' | 'green' | 'orange' | 'rose' | 'teal';

interface ThemeColor {
  name: string;
  value: ThemeColorOption;
  primary: string;
  primaryDark: string;
}

export const THEME_COLORS: ThemeColor[] = [
  { name: 'Xanh dương', value: 'blue', primary: '225 73% 57%', primaryDark: '225 70% 62%' },
  { name: 'Tím', value: 'purple', primary: '270 70% 55%', primaryDark: '270 65% 62%' },
  { name: 'Xanh lá', value: 'green', primary: '160 60% 42%', primaryDark: '160 55% 50%' },
  { name: 'Cam', value: 'orange', primary: '25 95% 53%', primaryDark: '25 90% 58%' },
  { name: 'Hồng', value: 'rose', primary: '350 80% 55%', primaryDark: '350 75% 60%' },
  { name: 'Xanh ngọc', value: 'teal', primary: '180 65% 45%', primaryDark: '180 60% 52%' },
];

const STORAGE_KEY = 'finance-theme-color';

export function useThemeColor() {
  const [themeColor, setThemeColor] = useState<ThemeColorOption>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY) as ThemeColorOption) || 'blue';
    }
    return 'blue';
  });

  useEffect(() => {
    const selectedTheme = THEME_COLORS.find(t => t.value === themeColor);
    if (!selectedTheme) return;

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    // Update CSS variables
    root.style.setProperty('--primary', isDark ? selectedTheme.primaryDark : selectedTheme.primary);
    root.style.setProperty('--ring', isDark ? selectedTheme.primaryDark : selectedTheme.primary);
    root.style.setProperty('--sidebar-primary', isDark ? selectedTheme.primaryDark : selectedTheme.primary);
    root.style.setProperty('--sidebar-ring', isDark ? selectedTheme.primaryDark : selectedTheme.primary);

    // Update accent foreground to match primary
    const accentForeground = isDark ? selectedTheme.primaryDark : selectedTheme.primary;
    root.style.setProperty('--accent-foreground', accentForeground);
    root.style.setProperty('--sidebar-accent-foreground', accentForeground);

    // Update chart-1 to match primary
    root.style.setProperty('--chart-1', isDark ? selectedTheme.primaryDark : selectedTheme.primary);

    localStorage.setItem(STORAGE_KEY, themeColor);
  }, [themeColor]);

  // Listen for theme changes (light/dark) to update colors accordingly
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // Re-apply theme color when light/dark mode changes
          const selectedTheme = THEME_COLORS.find(t => t.value === themeColor);
          if (!selectedTheme) return;

          const root = document.documentElement;
          const isDark = root.classList.contains('dark');

          root.style.setProperty('--primary', isDark ? selectedTheme.primaryDark : selectedTheme.primary);
          root.style.setProperty('--ring', isDark ? selectedTheme.primaryDark : selectedTheme.primary);
          root.style.setProperty('--sidebar-primary', isDark ? selectedTheme.primaryDark : selectedTheme.primary);
          root.style.setProperty('--sidebar-ring', isDark ? selectedTheme.primaryDark : selectedTheme.primary);

          const accentForeground = isDark ? selectedTheme.primaryDark : selectedTheme.primary;
          root.style.setProperty('--accent-foreground', accentForeground);
          root.style.setProperty('--sidebar-accent-foreground', accentForeground);
          root.style.setProperty('--chart-1', isDark ? selectedTheme.primaryDark : selectedTheme.primary);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [themeColor]);

  return { themeColor, setThemeColor, themeColors: THEME_COLORS };
}
