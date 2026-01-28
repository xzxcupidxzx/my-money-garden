import { useState } from 'react';
import { useInstallments } from '@/hooks/useInstallments';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import { Plus, CreditCard, Wallet, Calendar as CalendarIcon, Trash2, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function InstallmentsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    installments,
    activeInstallments,
    loading,
    totalDebt,
    totalMonthlyPayment,
    addInstallment,
    deleteInstallment,
    calculateMonthlyPayment,
  } = useInstallments();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    total_amount: '',
    term_months: '',
    interest_rate: '0',
    start_date: new Date(),
    account_id: '',
    category_id: '',
  });

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const previewMonthlyPayment = formData.total_amount && formData.term_months
    ? calculateMonthlyPayment(
        parseFloat(formData.total_amount),
        parseInt(formData.term_months),
        parseFloat(formData.interest_rate || '0')
      )
    : 0;

  const handleSubmit = async () => {
    if (!formData.name || !formData.total_amount || !formData.term_months) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ các trường bắt buộc.',
        variant: 'destructive',
      });
      return;
    }

    const result = await addInstallment({
      name: formData.name,
      total_amount: parseFloat(formData.total_amount),
      term_months: parseInt(formData.term_months),
      interest_rate: parseFloat(formData.interest_rate || '0'),
      start_date: formData.start_date.toISOString().split('T')[0],
      account_id: formData.account_id || undefined,
      category_id: formData.category_id || undefined,
    });

    if (result) {
      toast({
        title: 'Thành công!',
        description: 'Khoản trả góp đã được thêm.',
      });
      setShowForm(false);
      setFormData({
        name: '',
        total_amount: '',
        term_months: '',
        interest_rate: '0',
        start_date: new Date(),
        account_id: '',
        category_id: '',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteInstallment(id);
    if (success) {
      toast({
        title: 'Đã xóa',
        description: 'Khoản trả góp đã được xóa.',
      });
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
        <h1 className="text-xl font-bold">Quản lý Trả Góp</h1>
      </div>

      {/* Debt Summary Dashboard */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-expense/10 to-expense/5 border-expense/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-expense mb-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs font-medium">Tổng nợ</span>
            </div>
            <p className="text-xl font-bold text-expense">
              <CurrencyDisplay amount={totalDebt} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeInstallments.length} khoản đang trả
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-warning mb-2">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium">Trả hàng tháng</span>
            </div>
            <p className="text-xl font-bold text-warning">
              <CurrencyDisplay amount={totalMonthlyPayment} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng các kỳ thanh toán
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Installment List */}
      <div className="space-y-3">
        {installments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Chưa có khoản trả góp nào</p>
              <p className="text-sm text-muted-foreground mt-1">
                Thêm khoản trả góp để theo dõi nợ
              </p>
            </CardContent>
          </Card>
        ) : (
          installments.map((installment) => {
            const paidAmount = Number(installment.total_amount) - Number(installment.remaining_amount);
            const progress = (paidAmount / Number(installment.total_amount)) * 100;

            return (
              <Card key={installment.id} className={cn(!installment.is_active && 'opacity-60')}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{installment.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {installment.term_months} tháng • {installment.interest_rate}% lãi/năm
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa khoản trả góp?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Thao tác này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(installment.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Đã trả</span>
                      <span className="font-medium">
                        <CurrencyDisplay amount={paidAmount} /> / <CurrencyDisplay amount={Number(installment.total_amount)} />
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round(progress)}% hoàn thành</span>
                      <span>Còn lại: <CurrencyDisplay amount={Number(installment.remaining_amount)} /></span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingDown className="h-4 w-4 text-expense" />
                      <span className="text-muted-foreground">Kỳ thanh toán:</span>
                    </div>
                    <span className="font-semibold text-expense">
                      <CurrencyDisplay amount={Number(installment.monthly_payment)} />
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Installment Button */}
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
            <SheetTitle>Thêm khoản trả góp</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 overflow-y-auto max-h-[calc(85vh-100px)]">
            {/* Name */}
            <div className="space-y-2">
              <Label>Tên khoản trả góp *</Label>
              <Input
                placeholder="VD: Macbook Pro M3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Total Amount */}
            <div className="space-y-2">
              <Label>Tổng số tiền *</Label>
              <Input
                type="number"
                placeholder="30000000"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              />
            </div>

            {/* Term & Interest */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Số kỳ (tháng) *</Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={formData.term_months}
                  onChange={(e) => setFormData({ ...formData, term_months: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Lãi suất (%/năm)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                />
              </div>
            </div>

            {/* Preview Monthly Payment */}
            {previewMonthlyPayment > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="p-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dự kiến trả mỗi tháng:</span>
                  <span className="font-bold text-lg text-expense">
                    <CurrencyDisplay amount={previewMonthlyPayment} />
                  </span>
                </CardContent>
              </Card>
            )}

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Ngày bắt đầu</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.start_date, 'dd/MM/yyyy', { locale: vi })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(d) => d && setFormData({ ...formData, start_date: d })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Account & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tài khoản thanh toán</Label>
                <Select
                  value={formData.account_id}
                  onValueChange={(v) => setFormData({ ...formData, account_id: v })}
                >
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
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Thêm khoản trả góp
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
