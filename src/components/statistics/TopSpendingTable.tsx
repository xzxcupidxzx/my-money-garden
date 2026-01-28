import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { AVAILABLE_ICONS } from '@/components/categories/IconPicker';
import { Trophy, TrendingDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Transaction } from '@/types/finance';

interface TopSpendingTableProps {
  transactions: Transaction[];
  limit?: number;
}

export function TopSpendingTable({ transactions, limit = 5 }: TopSpendingTableProps) {
  const topTransactions = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, limit);
  }, [transactions, limit]);

  if (topTransactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Top {limit} chi tiêu lớn nhất
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topTransactions.map((transaction, index) => {
          const IconComponent = AVAILABLE_ICONS[transaction.category?.icon || 'MoreHorizontal'] || AVAILABLE_ICONS['MoreHorizontal'];
          const color = transaction.category?.color || '#64748b';
          
          return (
            <div 
              key={transaction.id} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-bold">
                {index + 1}
              </div>
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <IconComponent className="h-5 w-5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {transaction.description || transaction.category?.name || 'Không có mô tả'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: vi })}
                  {transaction.category && ` • ${transaction.category.name}`}
                </p>
              </div>
              <span className="font-semibold text-expense shrink-0">
                -<CurrencyDisplay amount={transaction.amount} />
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
