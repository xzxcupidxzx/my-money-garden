import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CurrencyDisplay, formatCurrency } from '@/components/CurrencyDisplay';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, parseISO, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Transaction } from '@/types/finance';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { transactions, loading } = useTransactions(selectedDate);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

  // Calculate daily totals for calendar
  const dailyTotals = transactions.reduce((acc, t) => {
    const dateKey = format(parseISO(t.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      acc[dateKey].income += Number(t.amount);
    } else if (t.type === 'expense') {
      acc[dateKey].expense += Number(t.amount);
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  // Get selected day transactions
  const selectedDayTransactions = selectedDay
    ? transactions.filter(t => isSameDay(parseISO(t.date), selectedDay))
    : [];

  // Calendar grid
  const daysInMonth = getDaysInMonth(selectedDate);
  const firstDayOfMonth = getDay(startOfMonth(selectedDate));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  if (loading || authLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Lịch sử</h1>

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

      {/* Calendar */}
      <Card>
        <CardContent className="p-4">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before first of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days of month */}
            {days.map((day) => {
              const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
              const dateKey = format(date, 'yyyy-MM-dd');
              const totals = dailyTotals[dateKey];
              const isSelected = selectedDay && isSameDay(date, selectedDay);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : date)}
                  className={cn(
                    "aspect-square p-1 rounded-lg text-xs flex flex-col items-center justify-start gap-0.5 transition-colors",
                    isSelected && "bg-primary/10 ring-2 ring-primary",
                    isToday && !isSelected && "bg-muted",
                    "hover:bg-muted/50"
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    isToday && "text-primary"
                  )}>
                    {day}
                  </span>
                  {totals && (
                    <div className="flex flex-col items-center text-[8px] leading-tight">
                      {totals.income > 0 && (
                        <span className="text-income">+{(totals.income / 1000).toFixed(0)}k</span>
                      )}
                      {totals.expense > 0 && (
                        <span className="text-expense">-{(totals.expense / 1000).toFixed(0)}k</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      {selectedDay && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {format(selectedDay, 'EEEE, dd/MM/yyyy', { locale: vi })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayTransactions.length === 0 ? (
              <p className="text-muted-foreground text-sm">Không có giao dịch</p>
            ) : (
              <div className="space-y-3">
                {selectedDayTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{t.category?.name || t.description || 'Không có mô tả'}</p>
                      <p className="text-xs text-muted-foreground">{t.account?.name}</p>
                    </div>
                    <p className={cn(
                      "font-semibold",
                      t.type === 'income' && "text-income",
                      t.type === 'expense' && "text-expense"
                    )}>
                      {t.type === 'income' ? '+' : '-'}
                      <CurrencyDisplay amount={Number(t.amount)} />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
