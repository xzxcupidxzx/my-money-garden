import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { useInstallments } from '@/hooks/useInstallments';
import { useBudgets } from '@/hooks/useBudgets';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Target,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ChevronRight,
  Plus,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

export default function ManagementPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    activeInstallments,
    loading: installmentsLoading,
    totalDebt,
    totalMonthlyPayment,
  } = useInstallments();

  const {
    budgets,
    loading: budgetsLoading,
    totalBudget,
    totalSpent,
    overBudgetCount,
  } = useBudgets(selectedDate);

  const {
    activeRecurring,
    loading: recurringLoading,
  } = useRecurringTransactions();

  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  const loading = installmentsLoading || budgetsLoading || recurringLoading || authLoading;

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));
  const overallBudgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-2xl font-bold">Quản lý Tài chính</h1>

      <Tabs defaultValue="installments" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="installments" className="text-xs sm:text-sm">
            <CreditCard className="h-4 w-4 mr-1" />
            Trả góp
          </TabsTrigger>
          <TabsTrigger value="budgets" className="text-xs sm:text-sm">
            <Target className="h-4 w-4 mr-1" />
            Ngân sách
          </TabsTrigger>
          <TabsTrigger value="recurring" className="text-xs sm:text-sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Định kỳ
          </TabsTrigger>
        </TabsList>

        {/* Installments Tab */}
        <TabsContent value="installments" className="mt-4 space-y-4">
          {/* Summary Cards */}
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

          {/* Installments List */}
          {activeInstallments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Chưa có khoản trả góp nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeInstallments.slice(0, 3).map((installment) => {
                const paidAmount = Number(installment.total_amount) - Number(installment.remaining_amount);
                const progress = (paidAmount / Number(installment.total_amount)) * 100;

                return (
                  <Card key={installment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{installment.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {installment.term_months} tháng
                        </span>
                      </div>
                      <Progress value={progress} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(progress)}%</span>
                        <span>
                          Còn: <CurrencyDisplay amount={Number(installment.remaining_amount)} />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <Link to="/installments">
            <Button variant="outline" className="w-full">
              Xem tất cả & Quản lý
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="mt-4 space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="font-medium capitalize">
              {format(selectedDate, 'MMMM yyyy', { locale: vi })}
            </span>
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
                  <span className="font-medium">Tổng quan</span>
                </div>
                {overBudgetCount > 0 && (
                  <div className="flex items-center gap-1 text-expense text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{overBudgetCount} vượt</span>
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
                  value={Math.min(overallBudgetPercentage, 100)}
                  className={cn(
                    "h-3",
                    overallBudgetPercentage >= 100 && "[&>div]:bg-expense",
                    overallBudgetPercentage >= 80 && overallBudgetPercentage < 100 && "[&>div]:bg-warning"
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget List */}
          {budgets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Chưa thiết lập ngân sách</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {budgets.slice(0, 3).map((budget) => (
                <Card
                  key={budget.id}
                  className={cn(
                    "transition-colors",
                    budget.status === 'danger' && "border-expense/50 bg-expense/5",
                    budget.status === 'warning' && "border-warning/50 bg-warning/5"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{budget.category?.name}</h3>
                      {budget.status === 'danger' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-expense/20 text-expense">
                          Vượt
                        </span>
                      )}
                      {budget.status === 'warning' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">
                          Sắp hết
                        </span>
                      )}
                    </div>
                    <Progress
                      value={Math.min(budget.percentage, 100)}
                      className={cn(
                        "h-2",
                        budget.status === 'danger' && "[&>div]:bg-expense",
                        budget.status === 'warning' && "[&>div]:bg-warning"
                      )}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{budget.percentage.toFixed(0)}%</span>
                      <span>
                        <CurrencyDisplay amount={budget.spent} /> / <CurrencyDisplay amount={Number(budget.amount)} />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Link to="/budgets">
            <Button variant="outline" className="w-full">
              Xem tất cả & Quản lý
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </TabsContent>

        {/* Recurring Tab */}
        <TabsContent value="recurring" className="mt-4 space-y-4">
          {/* Summary */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
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
          {activeRecurring.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Chưa có giao dịch định kỳ</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeRecurring.slice(0, 4).map((recurring) => (
                <Card key={recurring.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          recurring.type === 'income' && "bg-income/10",
                          recurring.type === 'expense' && "bg-expense/10",
                          recurring.type === 'transfer' && "bg-transfer/10"
                        )}>
                          {recurring.type === 'income' && <TrendingUp className="h-4 w-4 text-income" />}
                          {recurring.type === 'expense' && <TrendingDown className="h-4 w-4 text-expense" />}
                          {recurring.type === 'transfer' && <ArrowLeftRight className="h-4 w-4 text-transfer" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {recurring.category?.name || recurring.description || recurring.account?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Kế tiếp: {format(new Date(recurring.next_date), 'dd/MM')}
                          </p>
                        </div>
                      </div>
                      <p className={cn(
                        "font-semibold text-sm",
                        recurring.type === 'income' && "text-income",
                        recurring.type === 'expense' && "text-expense",
                        recurring.type === 'transfer' && "text-transfer"
                      )}>
                        {recurring.type === 'income' && '+'}
                        {recurring.type === 'expense' && '-'}
                        <CurrencyDisplay amount={Number(recurring.amount)} />
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Link to="/recurring">
            <Button variant="outline" className="w-full">
              Xem tất cả & Quản lý
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </TabsContent>
      </Tabs>
    </div>
  );
}
