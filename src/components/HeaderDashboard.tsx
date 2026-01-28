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
  const monthNum = String(month.getMonth() + 1).padStart(2, '0');

  return (
    <Card variant="technical" className="bg-gradient-to-br from-primary/8 via-background to-background border-primary/20">
      <CardContent className="p-4">
        {/* Header with tech label */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                SECTOR_{monthNum}
              </span>
              <span className="w-2 h-2 rounded-full bg-income animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-tight capitalize">{monthName}</h1>
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

        {/* Stats grid with industrial style */}
        <div className="grid grid-cols-3 gap-2">
          <div className="relative p-3 bg-income/5 border border-income/20 overflow-hidden card-hud">
            {/* Diagonal stripe accent */}
            <div className="absolute top-0 right-0 w-8 h-1 bg-income/40" 
                 style={{ transform: 'rotate(-45deg) translate(2px, -2px)' }} />
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-income" />
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">THU</span>
            </div>
            <div className="font-semibold text-income text-sm font-mono tabular-nums tracking-tight">
              <CurrencyDisplay amount={summary.income} />
            </div>
          </div>

          <div className="relative p-3 bg-expense/5 border border-expense/20 overflow-hidden card-hud">
            <div className="absolute top-0 right-0 w-8 h-1 bg-expense/40" 
                 style={{ transform: 'rotate(-45deg) translate(2px, -2px)' }} />
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown className="h-3 w-3 text-expense" />
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">CHI</span>
            </div>
            <div className="font-semibold text-expense text-sm font-mono tabular-nums tracking-tight">
              <CurrencyDisplay amount={summary.expense} />
            </div>
          </div>

          <div className="relative p-3 bg-primary/5 border border-primary/20 overflow-hidden card-hud">
            <div className="absolute top-0 right-0 w-8 h-1 bg-primary/40" 
                 style={{ transform: 'rotate(-45deg) translate(2px, -2px)' }} />
            <div className="flex items-center gap-1 mb-1">
              <Wallet className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">CÒN</span>
            </div>
            <div className={cn(
              "font-semibold text-sm font-mono tabular-nums tracking-tight",
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
