import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, ArrowLeftRight, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Transaction, Category, Account, TransactionType } from '@/types/finance';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface TransactionEditDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  accounts: Account[];
  onSave: (id: string, updates: Partial<Transaction>) => Promise<any>;
}

export function TransactionEditDialog({
  transaction,
  open,
  onOpenChange,
  categories,
  accounts,
  onSave,
}: TransactionEditDialogProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategoryId(transaction.category_id);
      setAccountId(transaction.account_id);
      setToAccountId(transaction.to_account_id);
      setDescription(transaction.description || '');
      setDate(parseISO(transaction.date));
    }
  }, [transaction]);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSave = async () => {
    if (!transaction || !amount || !accountId) return;

    setSaving(true);
    try {
      await onSave(transaction.id, {
        type,
        amount: Number(amount),
        category_id: type === 'transfer' ? null : categoryId,
        account_id: accountId,
        to_account_id: type === 'transfer' ? toAccountId : null,
        description,
        date: date.toISOString(),
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin giao dịch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transaction Type */}
          <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="expense" className="gap-1">
                <TrendingDown className="h-4 w-4" />
                Chi
              </TabsTrigger>
              <TabsTrigger value="income" className="gap-1">
                <TrendingUp className="h-4 w-4" />
                Thu
              </TabsTrigger>
              <TabsTrigger value="transfer" className="gap-1">
                <ArrowLeftRight className="h-4 w-4" />
                Chuyển
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Số tiền</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="text-2xl font-bold h-14"
            />
          </div>

          {/* Category */}
          {type !== 'transfer' && (
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select value={categoryId || ''} onValueChange={setCategoryId}>
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

          {/* Account */}
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

          {/* To Account (Transfer) */}
          {type === 'transfer' && (
            <div className="space-y-2">
              <Label>Đến tài khoản</Label>
              <Select value={toAccountId || ''} onValueChange={setToAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tài khoản đích" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter(acc => acc.id !== accountId)
                    .map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label>Ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(date, 'dd/MM/yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả giao dịch..."
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleSave}
            disabled={saving || !amount || !accountId}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
