import { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Target, AlertTriangle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function BudgetsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const {
    budgets,
    categoriesWithoutBudget,
    loading,
    totalBudget,
    totalSpent,
    overBudgetCount,
    addBudget,
    deleteBudget,
  } = useBudgets(selectedDate);
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
  });

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  const handleSubmit = async () => {
    if (!formData.category_id || !formData.amount) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng chọn danh mục và nhập ngân sách.',
        variant: 'destructive',
      });
      return;
    }

    const result = await addBudget(formData.category_id, parseFloat(formData.amount));
    if (result) {
      toast({
        title: 'Thành công!',
        description: 'Ngân sách đã được thiết lập.',
      });
      setShowForm(false);
      setFormData({ category_id: '', amount: '' });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteBudget(id);
    if (success) {
      toast({
        title: 'Đã xóa',
        description: 'Ngân sách đã được xóa.',
      });
    }
  };

  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

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
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold capitalize">
          Ngân sách {format(selectedDate, 'MMMM yyyy', { locale: vi })}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-medium">Tổng quan ngân sách</span>
            </div>
            {overBudgetCount > 0 && (
              <div className="flex items-center gap-1 text-expense text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{overBudgetCount} vượt ngân sách</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Đã chi</span>
              <span>
                <CurrencyDisplay amount={totalSpent} /> / <CurrencyDisplay amount={totalBudget} />
              </span>
            </div>
            <Progress
              value={Math.min(overallPercentage, 100)}
              className={cn(
                "h-3",
                overallPercentage >= 100 && "[&>div]:bg-expense",
                overallPercentage >= 80 && overallPercentage < 100 && "[&>div]:bg-warning"
              )}
            />
            <p className="text-xs text-muted-foreground text-right">
              {overallPercentage.toFixed(0)}% ngân sách đã sử dụng
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Budget List */}
      <div className="space-y-3">
        {budgets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Chưa thiết lập ngân sách</p>
              <p className="text-sm text-muted-foreground mt-1">
                Thêm ngân sách để kiểm soát chi tiêu
              </p>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => (
            <Card
              key={budget.id}
              className={cn(
                "transition-colors",
                budget.status === 'danger' && "border-expense/50 bg-expense/5",
                budget.status === 'warning' && "border-warning/50 bg-warning/5"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{budget.category?.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Ngân sách: <CurrencyDisplay amount={Number(budget.amount)} />
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {budget.status === 'danger' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-expense/20 text-expense font-medium">
                        Vượt ngân sách
                      </span>
                    )}
                    {budget.status === 'warning' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning font-medium">
                        Sắp hết
                      </span>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa ngân sách?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa ngân sách cho danh mục này?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(budget.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Đã chi</span>
                    <span className={cn(
                      "font-medium",
                      budget.status === 'danger' && "text-expense",
                      budget.status === 'warning' && "text-warning"
                    )}>
                      <CurrencyDisplay amount={budget.spent} />
                    </span>
                  </div>
                  <Progress
                    value={Math.min(budget.percentage, 100)}
                    className={cn(
                      "h-2",
                      budget.status === 'danger' && "[&>div]:bg-expense",
                      budget.status === 'warning' && "[&>div]:bg-warning"
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{budget.percentage.toFixed(0)}%</span>
                    <span>
                      Còn lại: <CurrencyDisplay amount={Math.max(0, Number(budget.amount) - budget.spent)} />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Budget Button */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-40"
            disabled={categoriesWithoutBudget.length === 0}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[50vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Thiết lập ngân sách</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label>Danh mục chi tiêu</Label>
              <Select
                value={formData.category_id}
                onValueChange={(v) => setFormData({ ...formData, category_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesWithoutBudget.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Ngân sách hàng tháng</Label>
              <Input
                type="number"
                placeholder="5000000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Thiết lập ngân sách
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
