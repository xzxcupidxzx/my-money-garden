import { useState, useEffect } from 'react';

export type FontSize = 'small' | 'medium' | 'large';
export type NumberFormat = 'dot' | 'comma'; // dot: 1.000.000 | comma: 1,000,000
export type WeekStart = 'monday' | 'sunday';

interface AppPreferences {
  fontSize: FontSize;
  numberFormat: NumberFormat;
  weekStart: WeekStart;
  defaultAccountId: string | null;
  notificationsEnabled: boolean;
}

const STORAGE_KEY = 'finance-app-preferences';

const defaultPreferences: AppPreferences = {
  fontSize: 'medium',
  numberFormat: 'dot',
  weekStart: 'monday',
  defaultAccountId: null,
  notificationsEnabled: true,
};

export function useAppPreferences() {
  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return { ...defaultPreferences, ...JSON.parse(stored) };
        } catch {
          return defaultPreferences;
        }
      }
    }
    return defaultPreferences;
  });

  // Apply font size to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    root.classList.add(`text-size-${preferences.fontSize}`);
  }, [preferences.fontSize]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = <K extends keyof AppPreferences>(
    key: K,
    value: AppPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  // Format number based on preference
  const formatNumber = (num: number): string => {
    if (preferences.numberFormat === 'dot') {
      return num.toLocaleString('vi-VN');
    } else {
      return num.toLocaleString('en-US');
    }
  };

  return {
    preferences,
    updatePreference,
    formatNumber,
  };
}
