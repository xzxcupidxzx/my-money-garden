import { useState } from 'react';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Plus, 
  RefreshCw, 
  Calendar as CalendarIcon, 
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Pause,
  Play
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { TransactionType, RecurrenceType } from '@/types/finance';

const recurrenceLabels: Record<RecurrenceType, string> = {
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  monthly: 'Hàng tháng',
  yearly: 'Hàng năm',
};

export default function RecurringTransactionsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    recurringTransactions,
    activeRecurring,
    loading,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
  } = useRecurringTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    category_id: '',
    account_id: '',
    to_account_id: '',
    description: '',
    recurrence: 'monthly' as RecurrenceType,
    next_date: new Date(),
  });

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  const filteredCategories = categories.filter(c => c.type === formData.type);

  const handleSubmit = async () => {
    if (!formData.amount || !formData.account_id) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền số tiền và chọn tài khoản.',
        variant: 'destructive',
      });
      return;
    }

    const result = await addRecurringTransaction({
      type: formData.type,
      amount: parseFloat(formData.amount),
      category_id: formData.category_id || null,
      account_id: formData.account_id,
      to_account_id: formData.type === 'transfer' ? formData.to_account_id : null,
      description: formData.description || null,
      recurrence: formData.recurrence,
      next_date: formData.next_date.toISOString().split('T')[0],
    });

    if (result) {
      toast({
        title: 'Thành công!',
        description: 'Giao dịch định kỳ đã được tạo.',
      });
      setShowForm(false);
      setFormData({
        type: 'expense',
        amount: '',
        category_id: '',
        account_id: '',
        to_account_id: '',
        description: '',
        recurrence: 'monthly',
        next_date: new Date(),
      });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const success = await updateRecurringTransaction(id, { is_active: !currentActive });
    if (success) {
      toast({
        title: currentActive ? 'Đã tạm dừng' : 'Đã kích hoạt',
        description: currentActive ? 'Giao dịch định kỳ đã tạm dừng.' : 'Giao dịch định kỳ đã được kích hoạt.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteRecurringTransaction(id);
    if (success) {
      toast({
        title: 'Đã xóa',
        description: 'Giao dịch định kỳ đã được xóa.',
      });
    }
  };

  const TypeIcon = ({ type }: { type: TransactionType }) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-4 w-4 text-income" />;
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-expense" />;
      case 'transfer':
        return <ArrowLeftRight className="h-4 w-4 text-transfer" />;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Giao dịch Định kỳ</h1>
        <div className="text-sm text-muted-foreground">
          {activeRecurring.length} đang hoạt động
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <span className="font-medium">Tổng quan</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-income">
                {activeRecurring.filter(r => r.type === 'income').length}
              </p>
              <p className="text-xs text-muted-foreground">Thu nhập</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-expense">
                {activeRecurring.filter(r => r.type === 'expense').length}
              </p>
              <p className="text-xs text-muted-foreground">Chi tiêu</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-transfer">
                {activeRecurring.filter(r => r.type === 'transfer').length}
              </p>
              <p className="text-xs text-muted-foreground">Chuyển khoản</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurring List */}
      <div className="space-y-3">
        {recurringTransactions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Chưa có giao dịch định kỳ</p>
              <p className="text-sm text-muted-foreground mt-1">
                Thiết lập các khoản thu chi tự động
              </p>
            </CardContent>
          </Card>
        ) : (
          recurringTransactions.map((recurring) => (
            <Card key={recurring.id} className={cn(!recurring.is_active && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      recurring.type === 'income' && "bg-income/10",
                      recurring.type === 'expense' && "bg-expense/10",
                      recurring.type === 'transfer' && "bg-transfer/10"
                    )}>
                      <TypeIcon type={recurring.type} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {recurring.category?.name || recurring.description || 'Không có mô tả'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {recurring.account?.name}
                        {recurring.type === 'transfer' && ' → ...'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                          {recurrenceLabels[recurring.recurrence]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Kế tiếp: {format(new Date(recurring.next_date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className={cn(
                      "font-semibold",
                      recurring.type === 'income' && "text-income",
                      recurring.type === 'expense' && "text-expense",
                      recurring.type === 'transfer' && "text-transfer"
                    )}>
                      {recurring.type === 'income' && '+'}
                      {recurring.type === 'expense' && '-'}
                      <CurrencyDisplay amount={Number(recurring.amount)} />
                    </p>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleActive(recurring.id, recurring.is_active)}
                      >
                        {recurring.is_active ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa giao dịch định kỳ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Thao tác này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(recurring.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Button */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-40"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Thêm giao dịch định kỳ</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 overflow-y-auto max-h-[calc(85vh-100px)]">
            {/* Type Selection */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Button
                variant={formData.type === 'expense' ? 'default' : 'ghost'}
                className={cn("flex-1", formData.type === 'expense' && "bg-expense hover:bg-expense/90")}
                onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
              >
                <TrendingDown className="h-4 w-4 mr-1" />
                Chi
              </Button>
              <Button
                variant={formData.type === 'income' ? 'default' : 'ghost'}
                className={cn("flex-1", formData.type === 'income' && "bg-income hover:bg-income/90")}
                onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Thu
              </Button>
              <Button
                variant={formData.type === 'transfer' ? 'default' : 'ghost'}
                className={cn("flex-1", formData.type === 'transfer' && "bg-transfer hover:bg-transfer/90")}
                onClick={() => setFormData({ ...formData, type: 'transfer', category_id: '' })}
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                Chuyển
              </Button>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Số tiền *</Label>
              <Input
                type="number"
                placeholder="1000000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            {/* Recurrence */}
            <div className="space-y-2">
              <Label>Chu kỳ lặp lại</Label>
              <Select
                value={formData.recurrence}
                onValueChange={(v) => setFormData({ ...formData, recurrence: v as RecurrenceType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Hàng ngày</SelectItem>
                  <SelectItem value="weekly">Hàng tuần</SelectItem>
                  <SelectItem value="monthly">Hàng tháng</SelectItem>
                  <SelectItem value="yearly">Hàng năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Next Date */}
            <div className="space-y-2">
              <Label>Ngày bắt đầu</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.next_date, 'dd/MM/yyyy', { locale: vi })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.next_date}
                    onSelect={(d) => d && setFormData({ ...formData, next_date: d })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Category & Account */}
            <div className="grid grid-cols-2 gap-3">
              {formData.type !== 'transfer' && (
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn" />
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
                <Label>{formData.type === 'transfer' ? 'Từ tài khoản' : 'Tài khoản'} *</Label>
                <Select
                  value={formData.account_id}
                  onValueChange={(v) => setFormData({ ...formData, account_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn" />
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

              {formData.type === 'transfer' && (
                <div className="space-y-2">
                  <Label>Đến tài khoản *</Label>
                  <Select
                    value={formData.to_account_id}
                    onValueChange={(v) => setFormData({ ...formData, to_account_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(a => a.id !== formData.account_id).map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Input
                placeholder="Ghi chú..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Tạo giao dịch định kỳ
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
