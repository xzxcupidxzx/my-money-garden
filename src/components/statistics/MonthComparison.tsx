import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types/finance';

interface MonthComparisonProps {
  currentMonthTransactions: Transaction[];
  lastMonthTransactions: Transaction[];
  currentMonthLabel: string;
  lastMonthLabel: string;
}

export function MonthComparison({
  currentMonthTransactions,
  lastMonthTransactions,
  currentMonthLabel,
  lastMonthLabel,
}: MonthComparisonProps) {
  const stats = useMemo(() => {
    const calcStats = (transactions: Transaction[]) => {
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { income, expense, balance: income - expense };
    };

    const current = calcStats(currentMonthTransactions);
    const last = calcStats(lastMonthTransactions);

    const incomeChange = last.income > 0
      ? ((current.income - last.income) / last.income) * 100
      : 0;
    const expenseChange = last.expense > 0
      ? ((current.expense - last.expense) / last.expense) * 100
      : 0;

    return { current, last, incomeChange, expenseChange };
  }, [currentMonthTransactions, lastMonthTransactions]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          So sánh {lastMonthLabel}
          <ArrowRight className="h-4 w-4" />
          {currentMonthLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Last Month */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{lastMonthLabel}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Thu</span>
                <span className="text-sm font-medium text-income">
                  <CurrencyDisplay amount={stats.last.income} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Chi</span>
                <span className="text-sm font-medium text-expense">
                  <CurrencyDisplay amount={stats.last.expense} />
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">Còn</span>
                <span className={cn(
                  "text-sm font-bold",
                  stats.last.balance >= 0 ? "text-income" : "text-expense"
                )}>
                  <CurrencyDisplay amount={stats.last.balance} />
                </span>
              </div>
            </div>
          </div>

          {/* Current Month */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{currentMonthLabel}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Thu</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-income">
                    <CurrencyDisplay amount={stats.current.income} />
                  </span>
                  {stats.incomeChange !== 0 && (
                    <span className={cn(
                      "text-[10px]",
                      stats.incomeChange > 0 ? "text-income" : "text-expense"
                    )}>
                      {stats.incomeChange > 0 ? '+' : ''}{stats.incomeChange.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Chi</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-expense">
                    <CurrencyDisplay amount={stats.current.expense} />
                  </span>
                  {stats.expenseChange !== 0 && (
                    <span className={cn(
                      "text-[10px]",
                      stats.expenseChange < 0 ? "text-income" : "text-expense"
                    )}>
                      {stats.expenseChange > 0 ? '+' : ''}{stats.expenseChange.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">Còn</span>
                <span className={cn(
                  "text-sm font-bold",
                  stats.current.balance >= 0 ? "text-income" : "text-expense"
                )}>
                  <CurrencyDisplay amount={stats.current.balance} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            {stats.current.balance > stats.last.balance ? (
              <>
                <TrendingUp className="h-4 w-4 text-income" />
                <span className="text-income">
                  Tốt hơn{' '}
                  <CurrencyDisplay amount={stats.current.balance - stats.last.balance} />
                </span>
              </>
            ) : stats.current.balance < stats.last.balance ? (
              <>
                <TrendingDown className="h-4 w-4 text-expense" />
                <span className="text-expense">
                  Kém hơn{' '}
                  <CurrencyDisplay amount={stats.last.balance - stats.current.balance} />
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Không thay đổi</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
