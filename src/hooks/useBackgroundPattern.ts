import { useState, useEffect } from 'react';

export type BackgroundPattern = 'none' | 'dots' | 'grid' | 'blueprint' | 'squares';

interface PatternOption {
  name: string;
  value: BackgroundPattern;
  description: string;
}

export const PATTERN_OPTIONS: PatternOption[] = [
  { name: 'Không', value: 'none', description: 'Nền trơn' },
  { name: 'Chấm', value: 'dots', description: 'Họa tiết chấm' },
  { name: 'Lưới', value: 'grid', description: 'Đường kẻ ô vuông' },
  { name: 'Blueprint', value: 'blueprint', description: 'Kiến trúc' },
  { name: 'Vuông', value: 'squares', description: 'Ô vuông đặc' },
];

const STORAGE_KEY = 'finance-bg-pattern';

export function useBackgroundPattern() {
  const [pattern, setPattern] = useState<BackgroundPattern>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY) as BackgroundPattern) || 'blueprint';
    }
    return 'blueprint';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, pattern);
  }, [pattern]);

  const getPatternClass = () => {
    switch (pattern) {
      case 'none':
        return 'bg-background';
      case 'dots':
        return 'bg-pattern-dots';
      case 'grid':
        return 'bg-pattern-grid';
      case 'blueprint':
        return 'bg-grid-blueprint';
      case 'squares':
        return 'bg-pattern-squares';
      default:
        return 'bg-grid-blueprint';
    }
  };

  return { pattern, setPattern, getPatternClass, patternOptions: PATTERN_OPTIONS };
}
