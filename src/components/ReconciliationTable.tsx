import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useAccounts } from '@/hooks/useAccounts';
import { useReconciliation } from '@/hooks/useReconciliation';
import { useCategories } from '@/hooks/useCategories';
import { Scale, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReconciliationTableProps {
  onReconcile?: () => void;
}

export function ReconciliationTable({ onReconcile }: ReconciliationTableProps) {
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { reconcileAccount } = useReconciliation();
  const { toast } = useToast();
  
  // State for each account's actual balance input and category
  const [actualBalances, setActualBalances] = useState<Record<string, number>>({});
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});
  const [reconciling, setReconciling] = useState<Record<string, boolean>>({});

  const activeAccounts = accounts.filter(a => a.is_active);

  const getDifference = (accountId: string, systemBalance: number) => {
    const actual = actualBalances[accountId];
    if (actual === undefined || actual === 0) return 0;
    return actual - systemBalance;
  };

  const getRelevantCategories = (accountId: string, systemBalance: number) => {
    const diff = getDifference(accountId, systemBalance);
    return categories.filter(c => 
      diff > 0 ? c.type === 'income' : c.type === 'expense'
    );
  };

  const handleReconcile = async (accountId: string, systemBalance: number) => {
    const actual = actualBalances[accountId];
    if (actual === undefined || actual === systemBalance) return;

    setReconciling(prev => ({ ...prev, [accountId]: true }));
    
    try {
      const categoryId = selectedCategories[accountId];
      await reconcileAccount(accountId, systemBalance, actual, categoryId || undefined);
      
      // Clear the input after successful reconciliation
      setActualBalances(prev => {
        const next = { ...prev };
        delete next[accountId];
        return next;
      });
      setSelectedCategories(prev => {
        const next = { ...prev };
        delete next[accountId];
        return next;
      });

      toast({
        title: 'Đối soát thành công!',
        description: 'Số dư đã được điều chỉnh.',
      });
      
      onReconcile?.();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể đối soát. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setReconciling(prev => ({ ...prev, [accountId]: false }));
    }
  };

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
        <CardTitle className="text-lg flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Đối Soát Tài Khoản
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px] sticky left-0 bg-card z-10">Mục / Tài khoản</TableHead>
                  {activeAccounts.map(account => (
                    <TableHead key={account.id} className="text-center min-w-[140px]">
                      {account.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* System Balance Row */}
                <TableRow>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">Số dư hệ thống</TableCell>
                  {activeAccounts.map(account => (
                    <TableCell key={account.id} className="text-center">
                      <CurrencyDisplay amount={account.balance} />
                    </TableCell>
                  ))}
                </TableRow>

                {/* Actual Balance Input Row */}
                <TableRow>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">Số dư thực tế</TableCell>
                  {activeAccounts.map(account => (
                    <TableCell key={account.id} className="text-center p-2">
                      <Input
                        type="number"
                        placeholder="Nhập số dư"
                        value={actualBalances[account.id] || ''}
                        onChange={(e) => setActualBalances(prev => ({
                          ...prev,
                          [account.id]: Number(e.target.value)
                        }))}
                        className="h-9 text-center text-sm"
                      />
                    </TableCell>
                  ))}
                </TableRow>

                {/* Difference Row */}
                <TableRow>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">Chênh lệch</TableCell>
                  {activeAccounts.map(account => {
                    const diff = getDifference(account.id, account.balance);
                    return (
                      <TableCell key={account.id} className="text-center">
                        {actualBalances[account.id] ? (
                          <span className={cn(
                            "font-semibold",
                            diff > 0 && "text-income",
                            diff < 0 && "text-expense"
                          )}>
                            {diff !== 0 && (diff > 0 ? '+' : '')}
                            <CurrencyDisplay amount={diff} />
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Category Selection Row */}
                <TableRow>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">Danh mục</TableCell>
                  {activeAccounts.map(account => {
                    const diff = getDifference(account.id, account.balance);
                    const cats = getRelevantCategories(account.id, account.balance);
                    return (
                      <TableCell key={account.id} className="text-center p-2">
                        {diff !== 0 && actualBalances[account.id] ? (
                          <Select
                            value={selectedCategories[account.id] || ''}
                            onValueChange={(v) => setSelectedCategories(prev => ({
                              ...prev,
                              [account.id]: v
                            }))}
                          >
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Chọn..." />
                            </SelectTrigger>
                            <SelectContent>
                              {cats.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Action Row */}
                <TableRow>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">Hành động</TableCell>
                  {activeAccounts.map(account => {
                    const diff = getDifference(account.id, account.balance);
                    const canReconcile = actualBalances[account.id] && diff !== 0;
                    return (
                      <TableCell key={account.id} className="text-center p-2">
                        <Button
                          size="sm"
                          disabled={!canReconcile || reconciling[account.id]}
                          onClick={() => handleReconcile(account.id, account.balance)}
                          className="w-full"
                        >
                          {reconciling[account.id] ? (
                            'Đang xử lý...'
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Đối soát
                            </>
                          )}
                        </Button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        <div className="flex items-center gap-2 p-4 text-xs text-muted-foreground border-t">
          <Info className="h-4 w-4" />
          <span>← Vuốt ngang để xem thêm cột →</span>
        </div>
      </CardContent>
    </Card>
  );
}
