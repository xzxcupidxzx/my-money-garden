import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { useReconciliation } from '@/hooks/useReconciliation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Scale, History, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ReconciliationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { reconciliations, loading: reconciliationsLoading, reconcileAccount } = useReconciliation();
  
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [actualBalance, setActualBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const systemBalance = selectedAccount ? Number(selectedAccount.balance) : 0;
  const difference = actualBalance ? parseFloat(actualBalance) - systemBalance : 0;

  const handleReconcile = async () => {
    if (!selectedAccountId || !actualBalance) return;

    setSubmitting(true);
    const result = await reconcileAccount(
      selectedAccountId,
      systemBalance,
      parseFloat(actualBalance),
      notes || undefined
    );
    setSubmitting(false);

    if (result) {
      toast({
        title: 'Đối soát thành công',
        description: difference !== 0
          ? `Đã tạo giao dịch điều chỉnh ${difference > 0 ? '+' : ''}${difference.toLocaleString()} VND`
          : 'Số dư khớp, không cần điều chỉnh',
      });
      setShowDialog(false);
      setSelectedAccountId('');
      setActualBalance('');
      setNotes('');
    } else {
      toast({
        title: 'Lỗi',
        description: 'Không thể thực hiện đối soát',
        variant: 'destructive',
      });
    }
  };

  const loading = authLoading || accountsLoading || reconciliationsLoading;

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Scale className="h-6 w-6" />
          Đối soát tài khoản
        </h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Đối soát
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đối soát tài khoản</DialogTitle>
              <DialogDescription>
                So sánh số dư hệ thống với số dư thực tế
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Chọn tài khoản</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài khoản..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAccountId && (
                <>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Số dư hệ thống:</span>
                      <span className="font-medium">
                        <CurrencyDisplay amount={systemBalance} />
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actualBalance">Số dư thực tế</Label>
                    <Input
                      id="actualBalance"
                      type="number"
                      placeholder="Nhập số dư thực tế..."
                      value={actualBalance}
                      onChange={(e) => setActualBalance(e.target.value)}
                    />
                  </div>

                  {actualBalance && (
                    <div className={cn(
                      "p-4 rounded-lg",
                      difference === 0 ? "bg-income/10" : "bg-expense/10"
                    )}>
                      <div className="flex items-center gap-2">
                        {difference === 0 ? (
                          <CheckCircle className="h-5 w-5 text-income" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-expense" />
                        )}
                        <div>
                          <p className="font-medium">
                            {difference === 0 ? 'Số dư khớp!' : 'Chênh lệch:'}
                          </p>
                          {difference !== 0 && (
                            <p className={cn(
                              "text-lg font-bold",
                              difference > 0 ? "text-income" : "text-expense"
                            )}>
                              {difference > 0 ? '+' : ''}
                              <CurrencyDisplay amount={difference} />
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Lý do chênh lệch..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleReconcile}
                disabled={!selectedAccountId || !actualBalance || submitting}
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận đối soát'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="font-medium">{account.name}</span>
              <CurrencyDisplay amount={Number(account.balance)} className="font-semibold" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reconciliation History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử đối soát
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reconciliations.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Chưa có lịch sử đối soát
            </p>
          ) : (
            <div className="space-y-3">
              {reconciliations.map((rec) => (
                <div key={rec.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{rec.account?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(rec.reconciliation_date), 'dd/MM/yyyy', { locale: vi })}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Hệ thống:</span>
                      <p className="font-medium">
                        <CurrencyDisplay amount={Number(rec.system_balance)} />
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Thực tế:</span>
                      <p className="font-medium">
                        <CurrencyDisplay amount={Number(rec.actual_balance)} />
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Chênh lệch:</span>
                      <p className={cn(
                        "font-medium",
                        Number(rec.difference) !== 0 
                          ? (Number(rec.difference) > 0 ? "text-income" : "text-expense")
                          : ""
                      )}>
                        {Number(rec.difference) > 0 ? '+' : ''}
                        <CurrencyDisplay amount={Number(rec.difference)} />
                      </p>
                    </div>
                  </div>
                  {rec.notes && (
                    <p className="text-xs text-muted-foreground">{rec.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
