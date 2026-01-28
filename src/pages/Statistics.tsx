import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay, formatCurrency } from '@/components/CurrencyDisplay';
import { useAuth } from '@/hooks/useAuth';
import { useBudgets } from '@/hooks/useBudgets';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { format, subDays, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { MonthComparison } from '@/components/statistics/MonthComparison';
import { BudgetOverview } from '@/components/statistics/BudgetOverview';
import { CategoryPieChart } from '@/components/statistics/CategoryPieChart';
import { DateRangeFilter, TimeframeType } from '@/components/statistics/DateRangeFilter';
import type { Transaction } from '@/types/finance';

export default function StatisticsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Date range state
  const [timeframe, setTimeframe] = useState<TimeframeType>('month');
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  
  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastMonthTransactions, setLastMonthTransactions] = useState<Transaction[]>([]);
  
  const { budgets, loading: budgetsLoading } = useBudgets(startDate);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch transactions for the selected date range
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            category:categories(*),
            account:accounts!transactions_account_id_fkey(*)
          `)
          .eq('user_id', user.id)
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString())
          .order('date', { ascending: false });

        if (error) throw error;
        setTransactions((data || []) as Transaction[]);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTransactions();
  }, [user, startDate, endDate]);

  // Fetch last month's transactions for comparison
  useEffect(() => {
    const fetchLastMonth = async () => {
      if (!user) return;
      
      const lastMonth = subMonths(startDate, 1);
      const monthStart = startOfMonth(lastMonth);
      const monthEnd = endOfMonth(lastMonth);

      const { data } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*),
          account:accounts!transactions_account_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString())
        .lte('date', monthEnd.toISOString());

      setLastMonthTransactions((data || []) as Transaction[]);
    };

    if (user && timeframe === 'month') fetchLastMonth();
  }, [user, startDate, timeframe]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Calculate summary
  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expense, balance: income - expense };
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
        income: income / 1000,
        expense: expense / 1000,
      });
    }

    return data;
  }, [transactions]);

  const currentMonthLabel = format(startDate, 'MMMM', { locale: vi });
  const lastMonthLabel = format(subMonths(startDate, 1), 'MMMM', { locale: vi });

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

      {/* Date Range Filter */}
      <DateRangeFilter
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
      />

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

      {/* Category Pie Chart */}
      <CategoryPieChart 
        transactions={transactions} 
        title="Chi tiêu theo danh mục" 
      />

      {/* Budget Overview - only show for month view */}
      {timeframe === 'month' && (
        <BudgetOverview budgets={budgets} loading={budgetsLoading} />
      )}

      {/* Month Comparison - only show for month view */}
      {timeframe === 'month' && (
        <MonthComparison
          currentMonthTransactions={transactions}
          lastMonthTransactions={lastMonthTransactions}
          currentMonthLabel={currentMonthLabel}
          lastMonthLabel={lastMonthLabel}
        />
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
