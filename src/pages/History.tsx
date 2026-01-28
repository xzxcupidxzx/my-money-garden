import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useTransactions } from '@/hooks/useTransactions';
import { useReconciliation } from '@/hooks/useReconciliation';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, ChevronRight, Calendar, Scale, History, TrendingUp, TrendingDown, Wallet, ChevronDown, ChevronUp, ArrowUpDown, Grid3X3, List } from 'lucide-react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, parseISO, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { ReconciliationCards } from '@/components/ReconciliationCards';
import { AVAILABLE_ICONS } from '@/components/categories/IconPicker';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AccountSortType = 'name' | 'balance-high' | 'balance-low';
type AccountLayoutType = 'list' | 'grid';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showAccounts, setShowAccounts] = useState(true);
  const [accountSort, setAccountSort] = useState<AccountSortType>('name');
  const [accountLayout, setAccountLayout] = useState<AccountLayoutType>('list');
  const { transactions, summary, loading } = useTransactions(selectedDate);
  const { accounts, refetch: refetchAccounts, totalBalance } = useAccounts();
  const { reconciliations, loading: reconciliationLoading, refetch: refetchReconciliations } = useReconciliation();
  
  const activeAccounts = accounts.filter(a => a.is_active);
  
  // Sorted accounts
  const sortedAccounts = useMemo(() => {
    const sorted = [...activeAccounts];
    switch (accountSort) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'balance-high':
        return sorted.sort((a, b) => Number(b.balance) - Number(a.balance));
      case 'balance-low':
        return sorted.sort((a, b) => Number(a.balance) - Number(b.balance));
      default:
        return sorted;
    }
  }, [activeAccounts, accountSort]);
  
  const sortLabels: Record<AccountSortType, string> = {
    'name': 'Tên A-Z',
    'balance-high': 'Số dư cao → thấp',
    'balance-low': 'Số dư thấp → cao',
  };

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

  // Render accounts section component
  const renderAccountsSection = () => (
    <Collapsible open={showAccounts} onOpenChange={setShowAccounts}>
      <Card>
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Tài khoản
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-bold",
                  totalBalance >= 0 ? "text-income" : "text-expense"
                )}>
                  <CurrencyDisplay amount={totalBalance} />
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {showAccounts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Layout and Sort controls */}
            <div className="flex justify-between items-center mb-3">
              {/* Layout toggle */}
              <div className="flex gap-1">
                <Button
                  variant={accountLayout === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAccountLayout('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={accountLayout === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAccountLayout('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span className="text-xs">{sortLabels[accountSort]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setAccountSort('name')}>
                    Tên A-Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAccountSort('balance-high')}>
                    Số dư cao → thấp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAccountSort('balance-low')}>
                    Số dư thấp → cao
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {sortedAccounts.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Chưa có tài khoản nào
              </p>
            ) : accountLayout === 'grid' ? (
              // Grid layout
              <div className="grid grid-cols-2 gap-3">
                {sortedAccounts.map((account) => {
                  const IconComponent = account.icon && AVAILABLE_ICONS[account.icon] 
                    ? AVAILABLE_ICONS[account.icon] 
                    : Wallet;
                  return (
                    <div
                      key={account.id}
                      className="p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors text-center"
                    >
                      <div 
                        className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: `${account.color || '#64748b'}20` }}
                      >
                        <IconComponent className="h-6 w-6" style={{ color: account.color || '#64748b' }} />
                      </div>
                      <p className="font-medium text-sm">{account.name}</p>
                      <p className={cn(
                        "text-lg font-bold mt-1",
                        Number(account.balance) >= 0 ? "text-income" : "text-expense"
                      )}>
                        <CurrencyDisplay amount={account.balance} />
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              // List layout
              <div className="space-y-2">
                {sortedAccounts.map((account) => {
                  const IconComponent = account.icon && AVAILABLE_ICONS[account.icon] 
                    ? AVAILABLE_ICONS[account.icon] 
                    : Wallet;
                  return (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${account.color || '#64748b'}20` }}
                        >
                          <IconComponent className="h-5 w-5" style={{ color: account.color || '#64748b' }} />
                        </div>
                        <span className="font-medium">{account.name}</span>
                      </div>
                      <span className={cn(
                        "font-bold",
                        Number(account.balance) >= 0 ? "text-income" : "text-expense"
                      )}>
                        <CurrencyDisplay amount={account.balance} />
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

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

          {/* Account Balance Section - moved below calendar */}
          {renderAccountsSection()}
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
