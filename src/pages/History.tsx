import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useTransactions } from '@/hooks/useTransactions';
import { useReconciliation } from '@/hooks/useReconciliation';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, ChevronRight, Calendar, Scale, History, TrendingUp, TrendingDown } from 'lucide-react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, parseISO, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountBalanceList } from '@/components/AccountBalanceList';
import { ReconciliationCards } from '@/components/ReconciliationCards';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { transactions, summary, loading } = useTransactions(selectedDate);
  const { accounts, refetch: refetchAccounts } = useAccounts();
  const { reconciliations, loading: reconciliationLoading, refetch: refetchReconciliations } = useReconciliation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

  // Calculate daily totals for calendar
  const dailyTotals = transactions.reduce((acc, t) => {
    const dateKey = format(parseISO(t.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      acc[dateKey].income += Number(t.amount);
    } else if (t.type === 'expense') {
      acc[dateKey].expense += Number(t.amount);
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  // Get selected day transactions
  const selectedDayTransactions = selectedDay
    ? transactions.filter(t => isSameDay(parseISO(t.date), selectedDay))
    : [];

  // Calendar grid
  const daysInMonth = getDaysInMonth(selectedDate);
  const firstDayOfMonth = getDay(startOfMonth(selectedDate));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Adjust firstDayOfMonth for Monday start (0 = Sunday in JS, we want Monday = 0)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handleReconcileComplete = () => {
    refetchAccounts();
    refetchReconciliations();
  };

  if (loading || authLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-2xl font-bold">Lịch sử</h1>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Lịch
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Đối soát
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          {/* Month Navigation with Summary */}
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button variant="secondary" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-bold text-lg">
                  {format(selectedDate, 'MMMM yyyy', { locale: vi })}
                </h2>
                <Button variant="secondary" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Month Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-card/60">
                  <p className="text-xs text-muted-foreground">Tổng thu nhập</p>
                  <p className="text-lg font-bold text-income">
                    <CurrencyDisplay amount={summary.income} />
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-card/60">
                  <p className="text-xs text-muted-foreground">Tổng đã chi</p>
                  <p className="text-lg font-bold text-expense">
                    <CurrencyDisplay amount={summary.expense} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card>
            <CardContent className="p-4">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before first of month */}
                {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of month */}
                {days.map((day) => {
                  const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const totals = dailyTotals[dateKey];
                  const isSelected = selectedDay && isSameDay(date, selectedDay);
                  const isToday = isSameDay(date, new Date());

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : date)}
                      className={cn(
                        "aspect-square p-1 rounded-lg text-xs flex flex-col items-center justify-start gap-0.5 transition-colors",
                        isSelected && "bg-primary/10 ring-2 ring-primary",
                        isToday && !isSelected && "bg-muted",
                        "hover:bg-muted/50"
                      )}
                    >
                      <span className={cn(
                        "font-medium",
                        isToday && "text-primary"
                      )}>
                        {day}
                      </span>
                      {totals && (
                        <div className="flex flex-col items-center text-[8px] leading-tight">
                          {totals.income > 0 && (
                            <span className="text-income font-medium">
                              +{totals.income >= 1000000 
                                ? `${(totals.income / 1000000).toFixed(1)} Tr`
                                : `${(totals.income / 1000).toFixed(0)} Ng`
                              }
                            </span>
                          )}
                          {totals.expense > 0 && (
                            <span className="text-expense font-medium">
                              -{totals.expense >= 1000000 
                                ? `${(totals.expense / 1000000).toFixed(1)} Tr`
                                : `${(totals.expense / 1000).toFixed(0)} Ng`
                              }
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Details */}
          {selectedDay && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {format(selectedDay, 'EEEE, dd/MM/yyyy', { locale: vi })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDayTransactions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Không có giao dịch</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDayTransactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-full",
                            t.type === 'income' && "bg-income/10",
                            t.type === 'expense' && "bg-expense/10"
                          )}>
                            {t.type === 'income' ? (
                              <TrendingUp className="h-4 w-4 text-income" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-expense" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{t.category?.name || t.description || 'Không có mô tả'}</p>
                            <p className="text-xs text-muted-foreground">{t.account?.name}</p>
                          </div>
                        </div>
                        <p className={cn(
                          "font-semibold",
                          t.type === 'income' && "text-income",
                          t.type === 'expense' && "text-expense"
                        )}>
                          {t.type === 'income' ? '+' : '-'}
                          <CurrencyDisplay amount={Number(t.amount)} />
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reconciliation Tab */}
        <TabsContent value="reconciliation" className="space-y-4">
          {/* Quick Reconciliation Cards */}
          <ReconciliationCards onReconcile={handleReconcileComplete} />

          {/* Reconciliation History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Lịch Sử Đối Soát
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reconciliationLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : reconciliations.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Chưa có lịch sử đối soát
                </p>
              ) : (
                <div className="space-y-3">
                  {reconciliations.slice(0, 10).map((rec) => (
                    <div key={rec.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-sm">
                            {rec.account?.name || 'Tài khoản'}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {format(parseISO(rec.reconciliation_date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <span className={cn(
                          "text-sm font-semibold",
                          rec.difference > 0 && "text-income",
                          rec.difference < 0 && "text-expense"
                        )}>
                          {rec.difference > 0 ? '+' : ''}
                          <CurrencyDisplay amount={rec.difference} />
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        HT: <CurrencyDisplay amount={rec.system_balance} /> → 
                        TT: <CurrencyDisplay amount={rec.actual_balance} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
