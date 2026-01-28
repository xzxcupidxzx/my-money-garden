import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { VirtualKeypad } from './VirtualKeypad';
import { TrendingUp, TrendingDown, ArrowLeftRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { TransactionType, Category, Account } from '@/types/finance';
import { formatCurrency } from './CurrencyDisplay';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { AVAILABLE_ICONS } from '@/components/categories/IconPicker';

interface TransactionFormProps {
  categories: Category[];
  accounts: Account[];
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    category_id: string | null;
    account_id: string;
    to_account_id: string | null;
    description: string | null;
    date: string;
  }) => Promise<void>;
  loading?: boolean;
}

export function TransactionForm({ categories, accounts, onSubmit, loading }: TransactionFormProps) {
  const { preferences } = useAppPreferences();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [smartReset, setSmartReset] = useState(false);

  // Set default account from preferences or first account
  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      const defaultAcc = preferences.defaultAccountId 
        ? accounts.find(a => a.id === preferences.defaultAccountId)
        : accounts[0];
      if (defaultAcc) {
        setAccountId(defaultAcc.id);
      }
    }
  }, [accounts, preferences.defaultAccountId, accountId]);

  const filteredCategories = categories.filter(c => c.type === type);
  const selectedCategory = categories.find(c => c.id === categoryId);
  const selectedAccount = accounts.find(a => a.id === accountId);

  const handleSubmit = async () => {
    if (!amount || !accountId) return;

    await onSubmit({
      type,
      amount: parseFloat(amount),
      category_id: categoryId || null,
      account_id: accountId,
      to_account_id: type === 'transfer' ? toAccountId : null,
      description: description || null,
      date: date.toISOString(),
    });

    // Reset form
    setAmount('');
    setDescription('');
    if (!smartReset) {
      setCategoryId('');
    }
    setDate(new Date());
  };

  const getTypeColor = () => {
    switch (type) {
      case 'income': return 'text-income';
      case 'expense': return 'text-expense';
      case 'transfer': return 'text-transfer';
    }
  };

  const getCategoryIcon = (iconName: string | null) => {
    if (!iconName) return null;
    return AVAILABLE_ICONS[iconName] || null;
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Transaction Type Tabs - Compact */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
        <Button
          variant={type === 'expense' ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            "flex-1 h-9",
            type === 'expense' && "bg-expense hover:bg-expense/90 text-expense-foreground"
          )}
          onClick={() => { setType('expense'); setCategoryId(''); }}
        >
          <TrendingDown className="h-4 w-4 mr-1.5" />
          Chi
        </Button>
        <Button
          variant={type === 'income' ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            "flex-1 h-9",
            type === 'income' && "bg-income hover:bg-income/90 text-income-foreground"
          )}
          onClick={() => { setType('income'); setCategoryId(''); }}
        >
          <TrendingUp className="h-4 w-4 mr-1.5" />
          Thu
        </Button>
        <Button
          variant={type === 'transfer' ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            "flex-1 h-9",
            type === 'transfer' && "bg-transfer hover:bg-transfer/90 text-transfer-foreground"
          )}
          onClick={() => { setType('transfer'); setCategoryId(''); }}
        >
          <ArrowLeftRight className="h-4 w-4 mr-1.5" />
          Chuyển
        </Button>
      </div>

      {/* Amount & Keypad Section */}
      <div className="flex-1">
        <VirtualKeypad
          value={amount}
          onChange={setAmount}
          onSubmit={handleSubmit}
          disabled={loading}
        />
      </div>

      {/* Form Fields - Compact Grid */}
      <div className="space-y-3 pb-2">
        {/* Row 1: Category & Account */}
        <div className="grid grid-cols-2 gap-2">
          {type !== 'transfer' ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Danh mục</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-11 bg-card/60 border-border/50">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => {
                    const IconComponent = getCategoryIcon(cat.icon);
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-4 w-4" style={{ color: cat.color || undefined }} />}
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Từ TK</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="h-11 bg-card/60 border-border/50">
                  <SelectValue placeholder="Chọn tài khoản" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {type === 'transfer' ? 'Đến TK' : 'Tài khoản'}
            </Label>
            <Select 
              value={type === 'transfer' ? toAccountId : accountId} 
              onValueChange={type === 'transfer' ? setToAccountId : setAccountId}
            >
              <SelectTrigger className="h-11 bg-card/60 border-border/50">
                <SelectValue placeholder="Chọn tài khoản" />
              </SelectTrigger>
              <SelectContent>
                {(type === 'transfer' 
                  ? accounts.filter(a => a.id !== accountId)
                  : accounts
                ).map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Date & Description */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-11 justify-start bg-card/60 border-border/50 font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{format(date, 'dd/MM/yyyy', { locale: vi })}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Mô tả</Label>
            <Input
              placeholder="Ghi chú..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 bg-card/60 border-border/50"
            />
          </div>
        </div>

        {/* Smart Reset Toggle - Minimal */}
        <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
          <span className="text-xs text-muted-foreground">Giữ danh mục khi thêm liên tiếp</span>
          <Switch 
            checked={smartReset} 
            onCheckedChange={setSmartReset}
            className="scale-90"
          />
        </div>
      </div>
    </div>
  );
}
