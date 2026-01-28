import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Pencil, Upload, X, Check } from 'lucide-react';
import { IconPicker, AVAILABLE_ICONS } from './IconPicker';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Category } from '@/types/finance';

const MoreHorizontalIcon = AVAILABLE_ICONS['MoreHorizontal'];

interface CategoryItemProps {
  category: Category;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Category>) => Promise<boolean>;
}

export function CategoryItem({ category, onDelete, onUpdate }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editColor, setEditColor] = useState(category.color || '#64748b');
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const IconComponent = AVAILABLE_ICONS[category.icon || 'MoreHorizontal'] || MoreHorizontalIcon;

  const handleIconChange = async (newIcon: string) => {
    await onUpdate(category.id, { icon: newIcon });
    setCustomIcon(null);
  };

  const handleSaveEdit = async () => {
    await onUpdate(category.id, { 
      name: editName, 
      color: editColor 
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(category.name);
    setEditColor(category.color || '#64748b');
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomIcon(base64);
        // Note: In a real app, you'd upload this to storage and save the URL
        // For now, we'll just display it locally
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    onDelete(category.id);
    setShowDeleteConfirm(false);
  };

  const colorOptions = ['#22c55e', '#ef4444', '#3b82f6', '#f97316', '#a855f7', '#eab308', '#ec4899', '#14b8a6', '#64748b'];

  return (
    <>
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <IconPicker
                value={category.icon || 'MoreHorizontal'}
                onChange={handleIconChange}
                color={editColor}
              />
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {customIcon ? (
                    <img src={customIcon} alt="Custom icon" className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
                {customIcon && (
                  <button
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomIcon(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          ) : (
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all shrink-0"
              style={{ backgroundColor: `${category.color}20` }}
              onClick={() => setIsEditing(true)}
            >
              <IconComponent className="h-5 w-5" style={{ color: category.color }} />
            </div>
          )}

          {isEditing ? (
            <div className="flex-1 space-y-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8"
              />
              <div className="flex flex-wrap gap-1">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "h-5 w-5 rounded-full transition-all",
                      editColor === color && "ring-2 ring-offset-1 ring-primary scale-110"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditColor(color)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <span className="font-medium">{category.name}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-income hover:text-income"
                onClick={handleSaveEdit}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{category.name}"? 
              Các giao dịch thuộc danh mục này sẽ không bị xóa nhưng sẽ không còn danh mục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
