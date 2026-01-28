import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/hooks/useAuth';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { IconPicker } from '@/components/categories/IconPicker';
import { CategoryItem } from '@/components/categories/CategoryItem';
import { AccountItem } from '@/components/accounts/AccountItem';
import type { TransactionType } from '@/types/finance';

type AddType = 'income' | 'expense' | 'account';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const { accounts, loading: accountsLoading, addAccount, updateAccount, deleteAccount } = useAccounts();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AddType>('expense');
  const [newIcon, setNewIcon] = useState('MoreHorizontal');
  const [newColor, setNewColor] = useState('#64748b');
  const [newBalance, setNewBalance] = useState('0');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleAdd = async () => {
    if (!newName) return;

    if (newType === 'account') {
      await addAccount({
        name: newName,
        type: 'cash',
        balance: parseFloat(newBalance) || 0,
        currency: 'VND',
        icon: newIcon,
        color: newColor,
        is_active: true,
      });
    } else {
      await addCategory({
        name: newName,
        type: newType as TransactionType,
        icon: newIcon,
        color: newColor,
        parent_id: null,
        is_system: false,
      });
    }

    setNewName('');
    setNewIcon('MoreHorizontal');
    setNewColor('#64748b');
    setNewBalance('0');
    setShowAdd(false);
  };

  const getDefaultIcon = (type: AddType) => {
    switch (type) {
      case 'income': return 'TrendingUp';
      case 'expense': return 'MoreHorizontal';
      case 'account': return 'Wallet';
    }
  };

  const handleTypeChange = (type: AddType) => {
    setNewType(type);
    setNewIcon(getDefaultIcon(type));
  };

  if (loading || authLoading || accountsLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh mục & Tài khoản</h1>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Thêm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm mới</DialogTitle>
              <DialogDescription>
                Tạo danh mục hoặc tài khoản mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Loại</Label>
                <Select value={newType} onValueChange={(v) => handleTypeChange(v as AddType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Danh mục Thu nhập</SelectItem>
                    <SelectItem value="expense">Danh mục Chi tiêu</SelectItem>
                    <SelectItem value="account">Tài khoản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <IconPicker value={newIcon} onChange={setNewIcon} color={newColor} />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="name">Tên {newType === 'account' ? 'tài khoản' : 'danh mục'}</Label>
                  <Input
                    id="name"
                    placeholder={newType === 'account' ? 'Ví dụ: Tiền mặt, Ngân hàng...' : 'Ví dụ: Cà phê, Du lịch...'}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
              </div>
              {newType === 'account' && (
                <div className="space-y-2">
                  <Label htmlFor="balance">Số dư ban đầu</Label>
                  <Input
                    id="balance"
                    type="number"
                    placeholder="0"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Màu sắc</Label>
                <div className="flex flex-wrap gap-2">
                  {['#22c55e', '#ef4444', '#3b82f6', '#f97316', '#a855f7', '#eab308', '#ec4899', '#14b8a6', '#64748b'].map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "h-8 w-8 rounded-full transition-transform",
                        newColor === color && "ring-2 ring-offset-2 ring-primary scale-110"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAdd}>
                Thêm {newType === 'account' ? 'tài khoản' : 'danh mục'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <Wallet className="h-5 w-5" />
            Tài khoản ({accounts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {accounts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Chưa có tài khoản nào
            </p>
          ) : (
            accounts.map((acc) => (
              <AccountItem
                key={acc.id}
                account={acc}
                onDelete={deleteAccount}
                onUpdate={updateAccount}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Income Categories */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-income">
            <TrendingUp className="h-5 w-5" />
            Thu nhập ({incomeCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {incomeCategories.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              onDelete={deleteCategory}
              onUpdate={updateCategory}
            />
          ))}
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-expense">
            <TrendingDown className="h-5 w-5" />
            Chi tiêu ({expenseCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {expenseCategories.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              onDelete={deleteCategory}
              onUpdate={updateCategory}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
