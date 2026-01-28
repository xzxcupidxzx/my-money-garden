import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CurrencyDisplay } from './CurrencyDisplay';
import { TrendingUp, TrendingDown, ArrowLeftRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Transaction, DailyTransaction } from '@/types/finance';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TransactionListProps {
  groupedTransactions: DailyTransaction[];
  onDelete?: (id: string) => void;
}

function TransactionIcon({ type }: { type: Transaction['type'] }) {
  switch (type) {
    case 'income':
      return <TrendingUp className="h-4 w-4 text-income" />;
    case 'expense':
      return <TrendingDown className="h-4 w-4 text-expense" />;
    case 'transfer':
      return <ArrowLeftRight className="h-4 w-4 text-transfer" />;
  }
}

function TransactionItem({ transaction, onDelete }: { transaction: Transaction; onDelete?: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full",
          transaction.type === 'income' && "bg-income/10",
          transaction.type === 'expense' && "bg-expense/10",
          transaction.type === 'transfer' && "bg-transfer/10"
        )}>
          <TransactionIcon type={transaction.type} />
        </div>
        <div>
          <p className="font-medium text-sm">
            {transaction.category?.name || transaction.description || 'Không có mô tả'}
          </p>
          <p className="text-xs text-muted-foreground">
            {transaction.account?.name}
            {transaction.type === 'transfer' && transaction.to_account && (
              <> → {transaction.to_account.name}</>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className={cn(
          "font-semibold text-sm",
          transaction.type === 'income' && "text-income",
          transaction.type === 'expense' && "text-expense",
          transaction.type === 'transfer' && "text-transfer"
        )}>
          {transaction.type === 'income' && '+'}
          {transaction.type === 'expense' && '-'}
          <CurrencyDisplay amount={Number(transaction.amount)} />
        </p>

        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa giao dịch?</AlertDialogTitle>
                <AlertDialogDescription>
                  Thao tác này không thể hoàn tác. Số dư tài khoản sẽ được điều chỉnh tương ứng.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(transaction.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

export function TransactionList({ groupedTransactions, onDelete }: TransactionListProps) {
  if (groupedTransactions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Chưa có giao dịch nào</p>
          <p className="text-sm text-muted-foreground mt-1">
            Thêm giao dịch đầu tiên của bạn
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groupedTransactions.map((group) => (
        <Card key={group.date}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
              <p className="font-medium text-sm">
                {format(parseISO(group.date), 'EEEE, dd/MM', { locale: vi })}
              </p>
              <div className="flex gap-3 text-xs">
                {group.income > 0 && (
                  <span className="text-income">
                    +<CurrencyDisplay amount={group.income} />
                  </span>
                )}
                {group.expense > 0 && (
                  <span className="text-expense">
                    -<CurrencyDisplay amount={group.expense} />
                  </span>
                )}
              </div>
            </div>

            <div className="divide-y">
              {group.transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
