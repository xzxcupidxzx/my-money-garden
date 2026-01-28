import { useState } from 'react';
import {
  Briefcase,
  Gift,
  TrendingUp,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Receipt,
  Heart,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Home,
  Plane,
  Coffee,
  Music,
  Camera,
  Book,
  Dumbbell,
  Wallet,
  CreditCard,
  PiggyBank,
  Landmark,
  Smartphone,
  Laptop,
  Tv,
  Wifi,
  Zap,
  Droplets,
  Fuel,
  Bus,
  Train,
  Baby,
  Dog,
  Cat,
  Shirt,
  Scissors,
  Stethoscope,
  Pill,
  Apple,
  Pizza,
  Beer,
  Wine,
  Cake,
  IceCream,
  Flower2,
  Trees,
  Mountain,
  Tent,
  Bike,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export const AVAILABLE_ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Gift,
  TrendingUp,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Receipt,
  Heart,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Home,
  Plane,
  Coffee,
  Music,
  Camera,
  Book,
  Dumbbell,
  Wallet,
  CreditCard,
  PiggyBank,
  Landmark,
  Smartphone,
  Laptop,
  Tv,
  Wifi,
  Zap,
  Droplets,
  Fuel,
  Bus,
  Train,
  Baby,
  Dog,
  Cat,
  Shirt,
  Scissors,
  Stethoscope,
  Pill,
  Apple,
  Pizza,
  Beer,
  Wine,
  Cake,
  IceCream,
  Flower2,
  Trees,
  Mountain,
  Tent,
  Bike,
};

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = '#64748b' }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const SelectedIcon = AVAILABLE_ICONS[value] || MoreHorizontal;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <SelectedIcon className="h-6 w-6" style={{ color }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => (
            <button
              key={name}
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
              className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center transition-colors hover:bg-muted",
                value === name && "bg-primary/10 ring-2 ring-primary"
              )}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
