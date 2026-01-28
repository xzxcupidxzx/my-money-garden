import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/components/CurrencyDisplay';
import { CalendarDays } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { parseISO, getDay } from 'date-fns';
import type { Transaction } from '@/types/finance';

interface WeekdayAnalysisProps {
  transactions: Transaction[];
}

const WEEKDAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function WeekdayAnalysis({ transactions }: WeekdayAnalysisProps) {
  const weekdayData = useMemo(() => {
    const expenseByDay: number[] = [0, 0, 0, 0, 0, 0, 0];
    const countByDay: number[] = [0, 0, 0, 0, 0, 0, 0];

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const dayOfWeek = getDay(parseISO(t.date));
        expenseByDay[dayOfWeek] += Number(t.amount);
        countByDay[dayOfWeek]++;
      });

    const maxExpense = Math.max(...expenseByDay);

    return WEEKDAY_NAMES.map((name, index) => ({
      name,
      expense: expenseByDay[index] / 1000,
      count: countByDay[index],
      isMax: expenseByDay[index] === maxExpense && maxExpense > 0,
    }));
  }, [transactions]);

  const totalExpense = useMemo(() =>
    transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  if (totalExpense === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Chi tiêu theo thứ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekdayData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value: number) => formatCurrency(value * 1000)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="expense" radius={[4, 4, 0, 0]}>
                {weekdayData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isMax ? 'hsl(var(--expense))' : 'hsl(var(--muted-foreground) / 0.3)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Ngày chi tiêu nhiều nhất được đánh dấu màu đỏ
        </p>
      </CardContent>
    </Card>
  );
}
