import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
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
import type { TransactionType } from '@/types/finance';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TransactionType>('expense');
  const [newIcon, setNewIcon] = useState('MoreHorizontal');
  const [newColor, setNewColor] = useState('#64748b');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleAddCategory = async () => {
    if (!newName) return;

    await addCategory({
      name: newName,
      type: newType,
      icon: newIcon,
      color: newColor,
      parent_id: null,
      is_system: false,
    });

    setNewName('');
    setNewIcon('MoreHorizontal');
    setNewColor('#64748b');
    setShowAdd(false);
  };

  if (loading || authLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh mục</h1>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Thêm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm danh mục mới</DialogTitle>
              <DialogDescription>
                Tạo danh mục tùy chỉnh cho giao dịch của bạn
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <IconPicker value={newIcon} onChange={setNewIcon} color={newColor} />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="name">Tên danh mục</Label>
                  <Input
                    id="name"
                    placeholder="Ví dụ: Cà phê, Du lịch..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Loại</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as TransactionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Thu nhập</SelectItem>
                    <SelectItem value="expense">Chi tiêu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <Button onClick={handleAddCategory}>Thêm danh mục</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
