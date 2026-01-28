import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CurrencyDisplay, formatCurrency } from '@/components/CurrencyDisplay';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { format, addMonths, subMonths, subDays, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { CategoryBreakdown } from '@/types/finance';

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#eab308', '#ec4899', '#14b8a6', '#64748b'];

export default function StatisticsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { transactions, summary, loading } = useTransactions(selectedDate);
  const { categories } = useCategories();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

  // Category breakdown for expenses
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

  // 7-day trend data
  const trendData = useMemo(() => {
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');

      const dayTransactions = transactions.filter(t => 
        format(parseISO(t.date), 'yyyy-MM-dd') === dateKey
      );

      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      data.push({
        name: format(date, 'EEE', { locale: vi }),
        income: income / 1000, // Convert to thousands
        expense: expense / 1000,
      });
    }

    return data;
  }, [transactions]);

  if (loading || authLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-2xl font-bold">Thống kê</h1>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold capitalize">
          {format(selectedDate, 'MMMM yyyy', { locale: vi })}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-income/10 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-income" />
              <span className="text-sm text-muted-foreground">Thu nhập</span>
            </div>
            <p className="text-xl font-bold text-income">
              <CurrencyDisplay amount={summary.income} />
            </p>
          </CardContent>
        </Card>

        <Card className="bg-expense/10 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-expense" />
              <span className="text-sm text-muted-foreground">Chi tiêu</span>
            </div>
            <p className="text-xl font-bold text-expense">
              <CurrencyDisplay amount={summary.expense} />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Pie Chart */}
      {categoryBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Chi tiêu theo danh mục</CardTitle>
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
      )}

      {/* 7-Day Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            7 ngày gần đây (nghìn ₫)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value * 1000)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded bg-income" />
              <span className="text-muted-foreground">Thu</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded bg-expense" />
              <span className="text-muted-foreground">Chi</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
