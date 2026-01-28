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

    if (key === '.' && value.includes('.')) {
      return;
    }

    // Handle 000 key
    if (key === '000') {
      if (value === '' || value === '0') return;
      if (value.length + 3 > maxLength) return;
      onChange(value + '000');
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

  return (
    <div className="space-y-3">
      {/* Amount Display */}
      <div className="bg-card/80 backdrop-blur-sm rounded-xl p-3 border border-border/50">
        <p className="text-center text-2xl font-mono tabular-nums text-foreground min-h-[2rem]">
          {value || '0'}
        </p>
      </div>

      {/* Virtual keypad */}
      <div className="bg-card/60 backdrop-blur-sm rounded-xl p-2 border border-border/30">
        <div className="grid grid-cols-4 gap-1.5">
          {/* Row 1: 1, 2, 3, Submit */}
          <Button variant="ghost" type="button" className="h-12 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('1')}>1</Button>
          <Button variant="ghost" type="button" className="h-12 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('2')}>2</Button>
          <Button variant="ghost" type="button" className="h-12 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('3')}>3</Button>
          {onSubmit && (
            <Button
              className="h-full bg-income hover:bg-income/90 text-income-foreground font-semibold rounded-xl active:scale-[0.98] row-span-5"
              type="button"
              onClick={onSubmit}
              disabled={disabled || !value || value === '0'}
            >
              <Check className="h-6 w-6" />
            </Button>
          )}
          
          {/* Row 2: 4, 5, 6 */}
          <Button variant="ghost" type="button" className="h-12 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('4')}>4</Button>
          <Button variant="ghost" type="button" className="h-12 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('5')}>5</Button>
          <Button variant="ghost" type="button" className="h-12 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('6')}>6</Button>
          
          {/* Row 3: 7, 8, 9 */}
          <Button variant="ghost" type="button" className="h-12 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('7')}>7</Button>
          <Button variant="ghost" type="button" className="h-12 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('8')}>8</Button>
          <Button variant="ghost" type="button" className="h-12 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('9')}>9</Button>
          
          {/* Row 4: 000, 0, . */}
          <Button variant="ghost" type="button" className="h-12 text-base font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('000')}>000</Button>
          <Button variant="ghost" type="button" className="h-12 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('0')}>0</Button>
          <Button variant="ghost" type="button" className="h-12 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50" onClick={() => handlePress('.')}>.</Button>
          
          {/* Row 5: Backspace spans 3 columns */}
          <Button variant="ghost" type="button" className="h-12 col-span-3 text-lg font-semibold rounded-xl active:scale-95 bg-transparent hover:bg-muted/50 text-muted-foreground" onClick={() => handlePress('backspace')}>
            <Delete className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
