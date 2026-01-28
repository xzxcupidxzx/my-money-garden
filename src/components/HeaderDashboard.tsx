import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { usePrivacy } from '@/hooks/usePrivacy';
import { CurrencyDisplay } from './CurrencyDisplay';
import { cn } from '@/lib/utils';
import type { MonthSummary } from '@/types/finance';

interface HeaderDashboardProps {
  summary: MonthSummary;
  month: Date;
}

export function HeaderDashboard({ summary, month }: HeaderDashboardProps) {
  const { privacyMode, togglePrivacy } = usePrivacy();

  const monthName = month.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground capitalize font-mono">{monthName}</p>
            <h1 className="text-xl font-bold">Tổng quan</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePrivacy}
            className="h-8 w-8"
          >
            {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-income/10 border border-income/20">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-income mr-1" />
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Thu</span>
            </div>
            <div className="font-semibold text-income text-sm font-mono tabular-nums">
              <CurrencyDisplay amount={summary.income} />
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-expense/10 border border-expense/20">
            <div className="flex items-center justify-center mb-1">
              <TrendingDown className="h-4 w-4 text-expense mr-1" />
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Chi</span>
            </div>
            <div className="font-semibold text-expense text-sm font-mono tabular-nums">
              <CurrencyDisplay amount={summary.expense} />
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-center mb-1">
              <Wallet className="h-4 w-4 text-primary mr-1" />
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Còn</span>
            </div>
            <div className={cn(
              "font-semibold text-sm font-mono tabular-nums",
              summary.balance >= 0 ? "text-income" : "text-expense"
            )}>
              <CurrencyDisplay amount={summary.balance} showSign />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
