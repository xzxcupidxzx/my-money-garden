import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import { IconPicker, AVAILABLE_ICONS } from './IconPicker';
import type { Category } from '@/types/finance';

const MoreHorizontalIcon = AVAILABLE_ICONS['MoreHorizontal'];

interface CategoryItemProps {
  category: Category;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Category>) => Promise<boolean>;
}

export function CategoryItem({ category, onDelete, onUpdate }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const IconComponent = AVAILABLE_ICONS[category.icon || 'MoreHorizontal'] || MoreHorizontalIcon;

  const handleIconChange = async (newIcon: string) => {
    await onUpdate(category.id, { icon: newIcon });
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {isEditing ? (
          <IconPicker
            value={category.icon || 'MoreHorizontal'}
            onChange={handleIconChange}
            color={category.color || '#64748b'}
          />
        ) : (
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
            style={{ backgroundColor: `${category.color}20` }}
            onClick={() => setIsEditing(true)}
          >
            <IconComponent className="h-5 w-5" style={{ color: category.color }} />
          </div>
        )}
        <div>
          <span className="font-medium">{category.name}</span>
          {isEditing && (
            <p className="text-xs text-muted-foreground">Chọn icon mới</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        {!category.is_system && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(category.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
