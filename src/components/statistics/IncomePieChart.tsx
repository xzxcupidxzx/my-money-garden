import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { AVAILABLE_ICONS } from '@/components/categories/IconPicker';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from 'recharts';
import type { Transaction } from '@/types/finance';

interface IncomePieChartProps {
  transactions: Transaction[];
}

export function IncomePieChart({ transactions }: IncomePieChartProps) {
  const categoryBreakdown = useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const breakdown: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

    incomeTransactions.forEach(t => {
      const catId = t.category_id || 'uncategorized';
      const catName = t.category?.name || 'Khác';
      const catColor = t.category?.color || '#22c55e';
      const catIcon = t.category?.icon || 'TrendingUp';

      if (!breakdown[catId]) {
        breakdown[catId] = { name: catName, amount: 0, color: catColor, icon: catIcon };
      }
      breakdown[catId].amount += Number(t.amount);
    });

    // Only show categories with at least 1%
    return Object.values(breakdown)
      .map((item) => ({
        ...item,
        percentage: totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0,
      }))
      .filter(item => item.percentage >= 1)
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalIncome = useMemo(() => 
    categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0), 
    [categoryBreakdown]
  );

  if (categoryBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-income" />
            Thu nhập theo danh mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Không có dữ liệu thu nhập</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-income" />
          Thu nhập theo danh mục
        </CardTitle>
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
                outerRadius={70}
                paddingAngle={2}
                dataKey="amount"
                nameKey="name"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => <CurrencyDisplay amount={value} />}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                labelStyle={{
                  color: 'hsl(var(--foreground))',
                }}
                itemStyle={{
                  color: 'hsl(var(--foreground))',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Legend List */}
        <div className="space-y-2 mt-4">
          {categoryBreakdown.map((cat, index) => {
            const IconComponent = AVAILABLE_ICONS[cat.icon] || AVAILABLE_ICONS['TrendingUp'];
            
            return (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <IconComponent className="h-4 w-4" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <span className="font-medium text-sm">{cat.name}</span>
                    <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <span className="font-semibold text-sm text-income">
                  +<CurrencyDisplay amount={cat.amount} />
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
