import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Calendar, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import type { Transaction } from '@/types/finance';

interface DailyAverageCardProps {
  transactions: Transaction[];
  startDate: Date;
  endDate: Date;
}

export function DailyAverageCard({ transactions, startDate, endDate }: DailyAverageCardProps) {
  const stats = useMemo(() => {
    const days = Math.max(1, differenceInDays(endDate, startDate) + 1);
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const transactionCount = transactions.filter(t => t.type !== 'transfer').length;
    
    return {
      avgDailyIncome: income / days,
      avgDailyExpense: expense / days,
      avgDailyNet: (income - expense) / days,
      transactionCount,
      daysCount: days,
    };
  }, [transactions, startDate, endDate]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-income" />
              <span className="text-xs">TB Thu/ngày</span>
            </div>
            <p className="text-lg font-bold text-income">
              +<CurrencyDisplay amount={stats.avgDailyIncome} />
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-expense" />
              <span className="text-xs">TB Chi/ngày</span>
            </div>
            <p className="text-lg font-bold text-expense">
              -<CurrencyDisplay amount={stats.avgDailyExpense} />
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span className="text-xs">TB Ròng/ngày</span>
            </div>
            <p className={`text-lg font-bold ${stats.avgDailyNet >= 0 ? 'text-income' : 'text-expense'}`}>
              {stats.avgDailyNet >= 0 ? '+' : ''}<CurrencyDisplay amount={stats.avgDailyNet} />
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Giao dịch</span>
            </div>
            <p className="text-lg font-bold">
              {stats.transactionCount} <span className="text-sm font-normal text-muted-foreground">/{stats.daysCount} ngày</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
