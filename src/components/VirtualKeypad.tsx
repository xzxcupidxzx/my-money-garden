import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Delete, Check } from 'lucide-react';

interface VirtualKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  maxLength?: number;
  disabled?: boolean;
}

export function VirtualKeypad({ value, onChange, onSubmit, maxLength = 15, disabled }: VirtualKeypadProps) {
  const handlePress = (key: string) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1));
      return;
    }

    if (key === 'clear') {
      onChange('');
      return;
    }

    if (key === '.' && value.includes('.')) {
      return;
    }

    if (value.length >= maxLength) {
      return;
    }

    // Prevent leading zeros
    if (value === '0' && key !== '.') {
      onChange(key);
      return;
    }

    onChange(value + key);
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ];

  return (
    <div className="space-y-3">
      {/* Amount Display */}
      <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50">
        <p className="text-center text-2xl font-mono tabular-nums text-foreground min-h-[2rem]">
          {value || '0'}
        </p>
      </div>

      {/* Virtual keypad */}
      <div className="bg-card/60 backdrop-blur-sm rounded-xl p-3 border border-border/30">
        <div className="grid grid-cols-3 gap-2">
          {keys.map((row) => (
            row.map((key) => (
              <Button
                key={key}
                variant="ghost"
                type="button"
                className={cn(
                  "h-14 text-xl font-semibold rounded-xl transition-all active:scale-95",
                  "bg-transparent hover:bg-muted/50 active:bg-muted",
                  key === 'backspace' && "text-muted-foreground"
                )}
                onClick={() => handlePress(key)}
              >
                {key === 'backspace' ? <Delete className="h-5 w-5" /> : key}
              </Button>
            ))
          ))}
        </div>
        
        {onSubmit && (
          <Button
            className="w-full h-12 mt-3 bg-income hover:bg-income/90 text-income-foreground font-semibold rounded-xl transition-all active:scale-[0.98]"
            type="button"
            onClick={onSubmit}
            disabled={disabled || !value || value === '0'}
          >
            <Check className="h-5 w-5 mr-2" />
            Xác nhận
          </Button>
        )}
      </div>
    </div>
  );
}
