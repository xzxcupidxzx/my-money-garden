import { useAppPreferences, type FontSize, type NumberFormat, type WeekStart } from '@/hooks/useAppPreferences';
import { useAccounts } from '@/hooks/useAccounts';
import { cn } from '@/lib/utils';
import { Type, Hash, Calendar, Wallet, Bell, BellOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const FONT_SIZES: { value: FontSize; label: string; example: string }[] = [
  { value: 'small', label: 'Nhỏ', example: 'Aa' },
  { value: 'medium', label: 'Vừa', example: 'Aa' },
  { value: 'large', label: 'Lớn', example: 'Aa' },
];

const NUMBER_FORMATS: { value: NumberFormat; label: string; example: string }[] = [
  { value: 'dot', label: 'Việt Nam', example: '1.000.000' },
  { value: 'comma', label: 'Quốc tế', example: '1,000,000' },
];

const WEEK_STARTS: { value: WeekStart; label: string }[] = [
  { value: 'monday', label: 'Thứ Hai' },
  { value: 'sunday', label: 'Chủ Nhật' },
];

export function FontSizePicker() {
  const { preferences, updatePreference } = useAppPreferences();
  const [selected, setSelected] = useState<FontSize>(preferences.fontSize);
  const hasChanges = selected !== preferences.fontSize;

  const handleApply = () => {
    updatePreference('fontSize', selected);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Type className="h-5 w-5" />
        <div>
          <p className="font-medium">Cỡ chữ</p>
          <p className="text-sm text-muted-foreground">Điều chỉnh kích thước</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {FONT_SIZES.map((size) => (
          <button
            key={size.value}
            onClick={() => setSelected(size.value)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
              selected === size.value
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/50 hover:bg-muted"
            )}
          >
            <span className={cn(
              "font-semibold",
              size.value === 'small' && 'text-xs',
              size.value === 'medium' && 'text-base',
              size.value === 'large' && 'text-xl'
            )}>
              {size.example}
            </span>
            <span className="text-xs text-muted-foreground">{size.label}</span>
          </button>
        ))}
      </div>

      {hasChanges && (
        <Button onClick={handleApply} className="w-full" size="sm">
          <Check className="h-4 w-4 mr-2" />
          Áp dụng
        </Button>
      )}
    </div>
  );
}

export function NumberFormatPicker() {
  const { preferences, updatePreference } = useAppPreferences();
  const [selected, setSelected] = useState<NumberFormat>(preferences.numberFormat);
  const hasChanges = selected !== preferences.numberFormat;

  const handleApply = () => {
    updatePreference('numberFormat', selected);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Hash className="h-5 w-5" />
        <div>
          <p className="font-medium">Định dạng số</p>
          <p className="text-sm text-muted-foreground">Cách hiển thị số tiền</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {NUMBER_FORMATS.map((format) => (
          <button
            key={format.value}
            onClick={() => setSelected(format.value)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
              selected === format.value
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/50 hover:bg-muted"
            )}
          >
            <span className="font-mono font-semibold">{format.example}</span>
            <span className="text-xs text-muted-foreground">{format.label}</span>
          </button>
        ))}
      </div>

      {hasChanges && (
        <Button onClick={handleApply} className="w-full" size="sm">
          <Check className="h-4 w-4 mr-2" />
          Áp dụng
        </Button>
      )}
    </div>
  );
}

export function WeekStartPicker() {
  const { preferences, updatePreference } = useAppPreferences();
  const [selected, setSelected] = useState<WeekStart>(preferences.weekStart);
  const hasChanges = selected !== preferences.weekStart;

  const handleApply = () => {
    updatePreference('weekStart', selected);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5" />
        <div>
          <p className="font-medium">Ngày bắt đầu tuần</p>
          <p className="text-sm text-muted-foreground">Cho lịch và thống kê</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {WEEK_STARTS.map((day) => (
          <button
            key={day.value}
            onClick={() => setSelected(day.value)}
            className={cn(
              "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
              selected === day.value
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/50 hover:bg-muted"
            )}
          >
            <span className="font-medium">{day.label}</span>
          </button>
        ))}
      </div>

      {hasChanges && (
        <Button onClick={handleApply} className="w-full" size="sm">
          <Check className="h-4 w-4 mr-2" />
          Áp dụng
        </Button>
      )}
    </div>
  );
}

export function DefaultAccountPicker() {
  const { preferences, updatePreference } = useAppPreferences();
  const { accounts } = useAccounts();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Wallet className="h-5 w-5" />
        <div>
          <p className="font-medium">Tài khoản mặc định</p>
          <p className="text-sm text-muted-foreground">Dùng khi thêm giao dịch</p>
        </div>
      </div>
      
      <Select
        value={preferences.defaultAccountId || 'none'}
        onValueChange={(value) => updatePreference('defaultAccountId', value === 'none' ? null : value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn tài khoản" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Không chọn</SelectItem>
          {accounts?.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function NotificationToggle() {
  const { preferences, updatePreference } = useAppPreferences();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {preferences.notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        <div>
          <p className="font-medium">Thông báo nhắc nhở</p>
          <p className="text-sm text-muted-foreground">Giao dịch định kỳ</p>
        </div>
      </div>
      <Switch
        checked={preferences.notificationsEnabled}
        onCheckedChange={(checked) => updatePreference('notificationsEnabled', checked)}
      />
    </div>
  );
}
