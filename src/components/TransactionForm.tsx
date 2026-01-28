import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { TrendingUp, TrendingDown, ArrowLeftRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { TransactionType, Category, Account } from '@/types/finance';
import { formatCurrency } from './CurrencyDisplay';

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
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [smartReset, setSmartReset] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);

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

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-4 space-y-4">
        {/* Transaction Type Tabs */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={type === 'expense' ? 'default' : 'ghost'}
            className={cn(
              "flex-1",
              type === 'expense' && "bg-expense hover:bg-expense/90"
            )}
            onClick={() => setType('expense')}
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Chi tiêu
          </Button>
          <Button
            variant={type === 'income' ? 'default' : 'ghost'}
            className={cn(
              "flex-1",
              type === 'income' && "bg-income hover:bg-income/90"
            )}
            onClick={() => setType('income')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Thu nhập
          </Button>
          <Button
            variant={type === 'transfer' ? 'default' : 'ghost'}
            className={cn(
              "flex-1",
              type === 'transfer' && "bg-transfer hover:bg-transfer/90"
            )}
            onClick={() => setType('transfer')}
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Chuyển
          </Button>
        </div>

        {/* Amount Display */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-1">Số tiền</p>
          <p className={cn(
            "text-3xl font-bold",
            type === 'income' && "text-income",
            type === 'expense' && "text-expense",
            type === 'transfer' && "text-transfer"
          )}>
            {amount ? formatCurrency(parseFloat(amount)) : '0 ₫'}
          </p>
        </div>

        {/* Virtual Keypad */}
        <VirtualKeypad
          value={amount}
          onChange={setAmount}
          onSubmit={handleSubmit}
        />

        {/* Category & Account Selection */}
        <div className="grid grid-cols-2 gap-3">
          {type !== 'transfer' && (
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>{type === 'transfer' ? 'Từ tài khoản' : 'Tài khoản'}</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
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

          {type === 'transfer' && (
            <div className="space-y-2">
              <Label>Đến tài khoản</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tài khoản" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.filter(a => a.id !== accountId).map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Date & Description */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'dd/MM/yyyy', { locale: vi })}
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

          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Input
              placeholder="Ghi chú..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Smart Reset Toggle */}
        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium">Giữ danh mục</p>
            <p className="text-xs text-muted-foreground">Nhập nhanh nhiều giao dịch</p>
          </div>
          <Switch checked={smartReset} onCheckedChange={setSmartReset} />
        </div>
      </CardContent>
    </Card>
  );
}
