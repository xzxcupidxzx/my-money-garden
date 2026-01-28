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
    <div className="flex flex-col h-full space-y-2">
      {/* Transaction Type Tabs - Ultra Compact */}
      <div className="flex gap-0.5 p-0.5 bg-muted/50 rounded-md">
        <Button
          variant={type === 'expense' ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            "flex-1 h-7 text-xs",
            type === 'expense' && "bg-expense hover:bg-expense/90 text-expense-foreground"
          )}
          onClick={() => { setType('expense'); setCategoryId(''); }}
        >
          <TrendingDown className="h-3 w-3 mr-1" />
          Chi
        </Button>
        <Button
          variant={type === 'income' ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            "flex-1 h-7 text-xs",
            type === 'income' && "bg-income hover:bg-income/90 text-income-foreground"
          )}
          onClick={() => { setType('income'); setCategoryId(''); }}
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          Thu
        </Button>
        <Button
          variant={type === 'transfer' ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            "flex-1 h-7 text-xs",
            type === 'transfer' && "bg-transfer hover:bg-transfer/90 text-transfer-foreground"
          )}
          onClick={() => { setType('transfer'); setCategoryId(''); }}
        >
          <ArrowLeftRight className="h-3 w-3 mr-1" />
          Chuyển
        </Button>
      </div>

      {/* Form Fields - Ultra Compact Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {type !== 'transfer' ? (
          <div>
            <Label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Danh mục</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-8 text-xs bg-card/60 border-border/50">
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => {
                  const IconComponent = getCategoryIcon(cat.icon);
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-1.5">
                        {IconComponent && <IconComponent className="h-3 w-3" style={{ color: cat.color || undefined }} />}
                        <span className="text-xs">{cat.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <Label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Từ TK</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="h-8 text-xs bg-card/60 border-border/50">
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    <span className="text-xs">{acc.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">
            {type === 'transfer' ? 'Đến TK' : 'Tài khoản'}
          </Label>
          <Select 
            value={type === 'transfer' ? toAccountId : accountId} 
            onValueChange={type === 'transfer' ? setToAccountId : setAccountId}
          >
            <SelectTrigger className="h-8 text-xs bg-card/60 border-border/50">
              <SelectValue placeholder="Chọn" />
            </SelectTrigger>
            <SelectContent>
              {(type === 'transfer' 
                ? accounts.filter(a => a.id !== accountId)
                : accounts
              ).map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  <span className="text-xs">{acc.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Ngày</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full h-8 justify-start bg-card/60 border-border/50 font-normal text-xs px-2"
              >
                <CalendarIcon className="mr-1.5 h-3 w-3 text-muted-foreground" />
                <span className="font-mono text-xs">{format(date, 'dd/MM', { locale: vi })}</span>
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

        <div>
          <Label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Mô tả</Label>
          <Input
            placeholder="Ghi chú..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-8 text-xs bg-card/60 border-border/50"
          />
        </div>
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

      {/* Smart Reset Toggle - Ultra Minimal */}
      <div className="flex items-center justify-between py-1.5 px-2 bg-muted/30 rounded-md">
        <span className="text-[10px] text-muted-foreground">Giữ danh mục</span>
        <Switch 
          checked={smartReset} 
          onCheckedChange={setSmartReset}
          className="scale-75"
        />
      </div>
    </div>
  );
}
