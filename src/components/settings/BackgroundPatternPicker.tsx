import { useState } from 'react';
import { useBackgroundPattern, PATTERN_OPTIONS, type BackgroundPattern } from '@/hooks/useBackgroundPattern';
import { cn } from '@/lib/utils';
import { Grid3X3, Circle, Square, LayoutGrid, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PatternIcon = ({ pattern }: { pattern: BackgroundPattern }) => {
  switch (pattern) {
    case 'none':
      return <Minus className="h-4 w-4" />;
    case 'dots':
      return <Circle className="h-4 w-4" />;
    case 'grid':
      return <Grid3X3 className="h-4 w-4" />;
    case 'blueprint':
      return <LayoutGrid className="h-4 w-4" />;
    case 'squares':
      return <Square className="h-4 w-4" />;
    default:
      return <Grid3X3 className="h-4 w-4" />;
  }
};

const PatternPreview = ({ pattern }: { pattern: BackgroundPattern }) => {
  const getPreviewClass = () => {
    switch (pattern) {
      case 'none':
        return 'bg-muted';
      case 'dots':
        return 'bg-pattern-dots';
      case 'grid':
        return 'bg-pattern-grid';
      case 'blueprint':
        return 'bg-grid-blueprint';
      case 'squares':
        return 'bg-pattern-squares';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className={cn(
      "w-full h-12 rounded-md border border-border overflow-hidden",
      getPreviewClass()
    )} />
  );
};

export function BackgroundPatternPicker() {
  const { pattern, setPattern } = useBackgroundPattern();
  const [selectedPattern, setSelectedPattern] = useState<BackgroundPattern>(pattern);
  
  const hasChanges = selectedPattern !== pattern;

  const handleApply = () => {
    setPattern(selectedPattern);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Grid3X3 className="h-5 w-5" />
        <div>
          <p className="font-medium">Họa tiết nền</p>
          <p className="text-sm text-muted-foreground">Chọn kiểu họa tiết</p>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {PATTERN_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedPattern(option.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all",
              selectedPattern === option.value
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/50 hover:bg-muted"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-md flex items-center justify-center",
              selectedPattern === option.value ? "bg-primary text-primary-foreground" : "bg-background"
            )}>
              <PatternIcon pattern={option.value} />
            </div>
            <span className="text-xs font-medium truncate w-full text-center">
              {option.name}
            </span>
          </button>
        ))}
      </div>
      
      {/* Preview */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Xem trước:</p>
        <PatternPreview pattern={selectedPattern} />
      </div>

      {/* Apply Button */}
      {hasChanges && (
        <Button onClick={handleApply} className="w-full" size="sm">
          <Check className="h-4 w-4 mr-2" />
          Áp dụng
        </Button>
      )}
    </div>
  );
}
