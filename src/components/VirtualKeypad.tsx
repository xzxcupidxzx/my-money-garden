import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Delete, Check } from 'lucide-react';

interface VirtualKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  maxLength?: number;
}

export function VirtualKeypad({ value, onChange, onSubmit, maxLength = 15 }: VirtualKeypadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only allow numbers and one decimal point
    const filtered = newValue.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = filtered.split('.');
    const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : filtered;
    
    // Remove leading zeros except for "0."
    const noLeadingZeros = sanitized.replace(/^0+(?=\d)/, '');
    
    if (noLeadingZeros.length <= maxLength) {
      onChange(noLeadingZeros);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit && value && value !== '0') {
      e.preventDefault();
      onSubmit();
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ];

  return (
    <div className="space-y-3">
      {/* Hidden input for keyboard support */}
      <Input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Nhập số tiền..."
        className="text-center text-lg font-medium"
      />
      
      {/* Virtual keypad for touch */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-muted/30 rounded-xl">
        {keys.map((row, rowIndex) => (
          row.map((key) => (
            <Button
              key={key}
              variant="ghost"
              type="button"
              className={cn(
                "h-14 text-xl font-medium rounded-xl",
                key === 'backspace' && "text-muted-foreground"
              )}
              onClick={() => handlePress(key)}
            >
              {key === 'backspace' ? <Delete className="h-5 w-5" /> : key}
            </Button>
          ))
        ))}
        
        {onSubmit && (
          <Button
            className="col-span-3 h-12 mt-2"
            type="button"
            onClick={onSubmit}
            disabled={!value || value === '0'}
          >
            <Check className="h-5 w-5 mr-2" />
            Xác nhận
          </Button>
        )}
      </div>
    </div>
  );
}
