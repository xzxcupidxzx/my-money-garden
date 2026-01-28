import { useThemeColor, THEME_COLORS, ThemeColorOption } from '@/hooks/useThemeColor';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeColorPicker() {
  const { themeColor, setThemeColor } = useThemeColor();

  const getColorStyle = (color: ThemeColorOption): string => {
    const colorMap: Record<ThemeColorOption, string> = {
      blue: 'bg-[hsl(225,73%,57%)]',
      purple: 'bg-[hsl(270,70%,55%)]',
      green: 'bg-[hsl(160,60%,42%)]',
      orange: 'bg-[hsl(25,95%,53%)]',
      rose: 'bg-[hsl(350,80%,55%)]',
      teal: 'bg-[hsl(180,65%,45%)]',
    };
    return colorMap[color];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">Màu chủ đề</p>
          <p className="text-sm text-muted-foreground">Chọn màu sắc yêu thích</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {THEME_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => setThemeColor(color.value)}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-all',
              'ring-2 ring-offset-2 ring-offset-background',
              getColorStyle(color.value),
              themeColor === color.value 
                ? 'ring-foreground scale-110' 
                : 'ring-transparent hover:scale-105'
            )}
            title={color.name}
          >
            {themeColor === color.value && (
              <Check className="h-5 w-5 text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
