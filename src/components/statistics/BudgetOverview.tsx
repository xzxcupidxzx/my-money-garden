import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BudgetWithSpent } from '@/hooks/useBudgets';

interface BudgetOverviewProps {
  budgets: BudgetWithSpent[];
  loading: boolean;
}

export function BudgetOverview({ budgets, loading }: BudgetOverviewProps) {
  if (loading) {
    return null;
  }

  if (budgets.length === 0) {
    return null;
  }

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const overBudgetCount = budgets.filter(b => (b.spent || 0) > Number(b.amount)).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          Theo dõi ngân sách
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tổng chi tiêu</span>
            <span className={cn(
              "font-medium",
              overallPercentage >= 100 ? "text-expense" : 
              overallPercentage >= 80 ? "text-yellow-500" : "text-income"
            )}>
              <CurrencyDisplay amount={totalSpent} /> / <CurrencyDisplay amount={totalBudget} />
            </span>
          </div>
          <Progress 
            value={Math.min(overallPercentage, 100)} 
            className={cn(
              "h-3",
              overallPercentage >= 100 && "[&>div]:bg-expense",
              overallPercentage >= 80 && overallPercentage < 100 && "[&>div]:bg-yellow-500"
            )}
          />
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-4 text-sm">
          {overBudgetCount > 0 ? (
            <div className="flex items-center gap-1.5 text-expense">
              <AlertTriangle className="h-4 w-4" />
              <span>{overBudgetCount} danh mục vượt ngân sách</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-income">
              <CheckCircle className="h-4 w-4" />
              <span>Đang trong ngân sách</span>
            </div>
          )}
        </div>

        {/* Top 3 Categories */}
        <div className="space-y-2">
          {budgets
            .sort((a, b) => ((b.spent || 0) / Number(b.amount)) - ((a.spent || 0) / Number(a.amount)))
            .slice(0, 3)
            .map((budget) => {
              const percentage = Number(budget.amount) > 0
                ? ((budget.spent || 0) / Number(budget.amount)) * 100
                : 0;
              
              return (
                <div key={budget.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate">{budget.category?.name}</span>
                    <span className={cn(
                      "font-medium",
                      percentage >= 100 ? "text-expense" :
                      percentage >= 80 ? "text-yellow-500" : "text-muted-foreground"
                    )}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={cn(
                      "h-1.5",
                      percentage >= 100 && "[&>div]:bg-expense",
                      percentage >= 80 && percentage < 100 && "[&>div]:bg-yellow-500"
                    )}
                  />
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
