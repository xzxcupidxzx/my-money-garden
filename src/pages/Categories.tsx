import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Pencil, 
  Trash2,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Gift,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Receipt,
  Heart,
  GraduationCap,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { useEffect } from 'react';
import type { TransactionType } from '@/types/finance';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Gift,
  TrendingUp,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Receipt,
  Heart,
  GraduationCap,
  MoreHorizontal,
  Plus,
};

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { categories, loading, addCategory, deleteCategory } = useCategories();
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

  const CategoryItem = ({ category }: { category: typeof categories[0] }) => {
    const IconComponent = iconMap[category.icon || 'MoreHorizontal'] || MoreHorizontal;
    
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <IconComponent className="h-5 w-5" style={{ color: category.color }} />
          </div>
          <span className="font-medium">{category.name}</span>
        </div>
        {!category.is_system && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => deleteCategory(category.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục</Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Cà phê, Du lịch..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
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
                <div className="flex gap-2">
                  {['#22c55e', '#ef4444', '#3b82f6', '#f97316', '#a855f7', '#eab308'].map((color) => (
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
            <DialogFooter>
              <Button onClick={handleAddCategory}>Thêm danh mục</Button>
            </DialogFooter>
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
            <CategoryItem key={cat.id} category={cat} />
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
            <CategoryItem key={cat.id} category={cat} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
