import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useAccounts } from '@/hooks/useAccounts';
import { useReconciliation } from '@/hooks/useReconciliation';
import { useCategories } from '@/hooks/useCategories';
import { CheckCircle2, Wallet, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ReconciliationCardsProps {
  onReconcile?: () => void;
}

export function ReconciliationCards({ onReconcile }: ReconciliationCardsProps) {
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { reconcileAccount } = useReconciliation();
  const { toast } = useToast();
  
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [actualBalances, setActualBalances] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});
  const [reconciling, setReconciling] = useState<Record<string, boolean>>({});

  const activeAccounts = accounts.filter(a => a.is_active);

  const getDifference = (accountId: string, systemBalance: number) => {
    const actual = actualBalances[accountId];
    if (!actual || actual === '') return 0;
    return Number(actual) - systemBalance;
  };

  const getRelevantCategories = (accountId: string, systemBalance: number) => {
    const diff = getDifference(accountId, systemBalance);
    return categories.filter(c => 
      diff > 0 ? c.type === 'income' : c.type === 'expense'
    );
  };

  const handleReconcile = async (accountId: string, systemBalance: number) => {
    const actual = actualBalances[accountId];
    if (!actual || Number(actual) === systemBalance) return;

    setReconciling(prev => ({ ...prev, [accountId]: true }));
    
    try {
      const categoryId = selectedCategories[accountId];
      await reconcileAccount(accountId, systemBalance, Number(actual), categoryId || undefined);
      
      // Clear inputs after success
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
      setExpandedAccount(null);

      toast({
        title: '✅ Đối soát thành công!',
        description: 'Số dư đã được cập nhật.',
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

  const formatInputValue = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    return digits;
  };

  if (activeAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Chưa có tài khoản nào</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Chọn tài khoản để nhập số dư thực tế
      </p>

      {activeAccounts.map((account) => {
        const isExpanded = expandedAccount === account.id;
        const inputValue = actualBalances[account.id] || '';
        const diff = getDifference(account.id, account.balance);
        const relevantCategories = getRelevantCategories(account.id, account.balance);
        const canReconcile = inputValue && diff !== 0;

        return (
          <Collapsible
            key={account.id}
            open={isExpanded}
            onOpenChange={(open) => setExpandedAccount(open ? account.id : null)}
          >
            <Card className={cn(
              "transition-all duration-200",
              isExpanded && "ring-2 ring-primary shadow-lg"
            )}>
              <CollapsibleTrigger asChild>
                <CardContent className="p-4 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: account.color ? `${account.color}20` : 'hsl(var(--muted))' }}
                      >
                        <Wallet 
                          className="h-5 w-5" 
                          style={{ color: account.color || 'hsl(var(--muted-foreground))' }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Số dư: <CurrencyDisplay amount={account.balance} />
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {diff !== 0 && inputValue && (
                        <span className={cn(
                          "text-sm font-semibold px-2 py-1 rounded-full",
                          diff > 0 ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
                        )}>
                          {diff > 0 ? '+' : ''}{diff.toLocaleString()}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-4 border-t pt-4">
                  {/* Balance Comparison */}
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div className="text-center flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Hệ thống</p>
                      <p className="font-semibold">
                        <CurrencyDisplay amount={account.balance} />
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mx-2" />
                    <div className="text-center flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Thực tế</p>
                      <p className={cn(
                        "font-semibold",
                        inputValue && diff > 0 && "text-income",
                        inputValue && diff < 0 && "text-expense"
                      )}>
                        {inputValue ? (
                          <CurrencyDisplay amount={Number(inputValue)} />
                        ) : (
                          <span className="text-muted-foreground">---</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Input */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Nhập số dư thực tế
                    </label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputValue ? Number(inputValue).toLocaleString() : ''}
                      onChange={(e) => {
                        const formatted = formatInputValue(e.target.value);
                        setActualBalances(prev => ({
                          ...prev,
                          [account.id]: formatted
                        }));
                      }}
                      className="text-lg font-semibold h-12"
                    />
                  </div>

                  {/* Category Selection - only show if there's a difference */}
                  {canReconcile && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Phân loại khoản {diff > 0 ? 'thu' : 'chi'} này
                      </label>
                      <Select
                        value={selectedCategories[account.id] || ''}
                        onValueChange={(v) => setSelectedCategories(prev => ({
                          ...prev,
                          [account.id]: v
                        }))}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Chọn danh mục (không bắt buộc)" />
                        </SelectTrigger>
                        <SelectContent>
                          {relevantCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Difference Display */}
                  {canReconcile && (
                    <div className={cn(
                      "p-3 rounded-lg text-center",
                      diff > 0 ? "bg-income/10" : "bg-expense/10"
                    )}>
                      <p className="text-sm text-muted-foreground">
                        {diff > 0 ? 'Sẽ ghi nhận khoản thu' : 'Sẽ ghi nhận khoản chi'}
                      </p>
                      <p className={cn(
                        "text-xl font-bold",
                        diff > 0 ? "text-income" : "text-expense"
                      )}>
                        {diff > 0 ? '+' : ''}<CurrencyDisplay amount={diff} />
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    className="w-full h-12"
                    disabled={!canReconcile || reconciling[account.id]}
                    onClick={() => handleReconcile(account.id, account.balance)}
                  >
                    {reconciling[account.id] ? (
                      'Đang xử lý...'
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Xác nhận đối soát
                      </>
                    )}
                  </Button>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
