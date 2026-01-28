import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Pencil, X, Check } from 'lucide-react';
import { IconPicker, AVAILABLE_ICONS } from '@/components/categories/IconPicker';
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
import type { Account } from '@/types/finance';

const WalletIcon = AVAILABLE_ICONS['Wallet'];

interface AccountItemProps {
  account: Account;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<Account>) => Promise<boolean>;
}

export function AccountItem({ account, onDelete, onUpdate }: AccountItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(account.name);
  const [editColor, setEditColor] = useState(account.color || '#64748b');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const IconComponent = AVAILABLE_ICONS[account.icon || 'Wallet'] || WalletIcon;

  const handleIconChange = async (newIcon: string) => {
    await onUpdate(account.id, { icon: newIcon });
  };

  const handleSaveEdit = async () => {
    await onUpdate(account.id, { 
      name: editName, 
      color: editColor 
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(account.name);
    setEditColor(account.color || '#64748b');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(account.id);
    setShowDeleteConfirm(false);
  };

  const colorOptions = [
    // Reds & Pinks
    '#ef4444', '#dc2626', '#b91c1c', '#f43f5e', '#e11d48', '#be123c',
    '#ec4899', '#db2777', '#be185d',
    // Oranges & Yellows
    '#f97316', '#ea580c', '#c2410c', '#f59e0b', '#d97706', '#b45309',
    '#eab308', '#ca8a04', '#a16207',
    // Greens
    '#22c55e', '#16a34a', '#15803d', '#10b981', '#059669', '#047857',
    '#14b8a6', '#0d9488', '#0f766e',
    // Blues & Cyans
    '#06b6d4', '#0891b2', '#0e7490', '#0ea5e9', '#0284c7', '#0369a1',
    '#3b82f6', '#2563eb', '#1d4ed8', '#6366f1', '#4f46e5', '#4338ca',
    // Purples
    '#8b5cf6', '#7c3aed', '#6d28d9', '#a855f7', '#9333ea', '#7e22ce',
    '#d946ef', '#c026d3', '#a21caf',
    // Neutrals
    '#64748b', '#475569', '#334155', '#78716c', '#57534e', '#44403c',
  ];

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('vi-VN').format(balance);
  };

  return (
    <>
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3 flex-1">
          {isEditing ? (
            <IconPicker
              value={account.icon || 'Wallet'}
              onChange={handleIconChange}
              color={editColor}
            />
          ) : (
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all shrink-0"
              style={{ backgroundColor: `${account.color || '#64748b'}20` }}
              onClick={() => setIsEditing(true)}
            >
              <IconComponent className="h-5 w-5" style={{ color: account.color || '#64748b' }} />
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
            <div className="flex-1">
              <span className="font-medium">{account.name}</span>
              <p className="text-sm text-muted-foreground">
                {formatBalance(account.balance)} {account.currency}
              </p>
            </div>
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
            <AlertDialogTitle>Xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản "{account.name}"? 
              Các giao dịch thuộc tài khoản này sẽ không bị xóa.
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
