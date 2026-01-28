import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/components/CurrencyDisplay';
import { LineChart } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Transaction } from '@/types/finance';

interface SpendingTrendChartProps {
  transactions: Transaction[];
  startDate: Date;
  endDate: Date;
}

export function SpendingTrendChart({ transactions, startDate, endDate }: SpendingTrendChartProps) {
  const trendData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    let cumulative = 0;
    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      
      const dayExpense = transactions
        .filter(t => t.type === 'expense' && format(parseISO(t.date), 'yyyy-MM-dd') === dateKey)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      cumulative += dayExpense;
      
      return {
        date: format(day, 'd', { locale: vi }),
        fullDate: format(day, 'dd/MM', { locale: vi }),
        daily: dayExpense / 1000,
        cumulative: cumulative / 1000,
      };
    });
  }, [transactions, startDate, endDate]);

  const totalExpense = useMemo(() => 
    transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  const avgDaily = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate }).length;
    return totalExpense / days;
  }, [totalExpense, startDate, endDate]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Xu hướng chi tiêu
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Trung bình: {formatCurrency(avgDaily)}/ngày
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <Tooltip
                formatter={(value: number) => formatCurrency(value * 1000)}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(var(--expense))"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                name="Tích lũy"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
