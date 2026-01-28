import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay, formatCurrency } from '@/components/CurrencyDisplay';
import { Progress } from '@/components/ui/progress';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Transaction } from '@/types/finance';

interface CategoryPieChartProps {
  transactions: Transaction[];
  title: string;
}

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#eab308', '#ec4899', '#14b8a6', '#64748b'];

export function CategoryPieChart({ transactions, title }: CategoryPieChartProps) {
  const categoryBreakdown = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const breakdown: Record<string, { name: string; amount: number; color: string }> = {};

    expenseTransactions.forEach(t => {
      const catId = t.category_id || 'uncategorized';
      const catName = t.category?.name || 'Khác';
      const catColor = t.category?.color || '#64748b';

      if (!breakdown[catId]) {
        breakdown[catId] = { name: catName, amount: 0, color: catColor };
      }
      breakdown[catId].amount += Number(t.amount);
    });

    return Object.values(breakdown)
      .map((item, index) => ({
        ...item,
        percentage: totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0,
        color: item.color || COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  if (categoryBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Không có dữ liệu chi tiêu</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
                nameKey="name"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="space-y-3 mt-4">
          {categoryBreakdown.map((cat, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </div>
                <span className="font-medium">
                  <CurrencyDisplay amount={cat.amount} />
                </span>
              </div>
              <Progress value={cat.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
