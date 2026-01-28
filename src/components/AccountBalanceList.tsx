import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useAccounts } from '@/hooks/useAccounts';
import { Wallet, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AVAILABLE_ICONS } from '@/components/categories/IconPicker';

interface AccountBalanceListProps {
  onAccountClick?: (accountId: string) => void;
}

export function AccountBalanceList({ onAccountClick }: AccountBalanceListProps) {
  const { accounts } = useAccounts();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const activeAccounts = accounts.filter(a => a.is_active);
  const totalBalance = activeAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  if (activeAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Chưa có tài khoản nào</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Số Dư Tài Khoản
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {activeAccounts.map((account) => {
              const IconComponent = account.icon && AVAILABLE_ICONS[account.icon] 
                ? AVAILABLE_ICONS[account.icon] 
                : Wallet;
              return (
                <div
                  key={account.id}
                  className={cn(
                    "p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors cursor-pointer text-center"
                  )}
                  onClick={() => onAccountClick?.(account.id)}
                >
                  <div 
                    className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${account.color || '#64748b'}20` }}
                  >
                    <IconComponent className="h-6 w-6" style={{ color: account.color || '#64748b' }} />
                  </div>
                  <p className="font-medium text-sm">{account.name}</p>
                  <p className={cn(
                    "text-lg font-bold mt-1",
                    Number(account.balance) >= 0 ? "text-income" : "text-expense"
                  )}>
                    <CurrencyDisplay amount={account.balance} />
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {activeAccounts.map((account) => {
              const IconComponent = account.icon && AVAILABLE_ICONS[account.icon] 
                ? AVAILABLE_ICONS[account.icon] 
                : Wallet;
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onAccountClick?.(account.id)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${account.color || '#64748b'}20` }}
                    >
                      <IconComponent className="h-5 w-5" style={{ color: account.color || '#64748b' }} />
                    </div>
                    <span className="font-medium">{account.name}</span>
                  </div>
                  <span className={cn(
                    "font-bold",
                    Number(account.balance) >= 0 ? "text-income" : "text-expense"
                  )}>
                    <CurrencyDisplay amount={account.balance} />
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Total */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <span className="font-medium text-muted-foreground">Tổng cộng</span>
          <span className={cn(
            "text-xl font-bold",
            totalBalance >= 0 ? "text-income" : "text-expense"
          )}>
            <CurrencyDisplay amount={totalBalance} />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
