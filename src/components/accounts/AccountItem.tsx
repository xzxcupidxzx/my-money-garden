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

  const colorOptions = ['#22c55e', '#ef4444', '#3b82f6', '#f97316', '#a855f7', '#eab308', '#ec4899', '#14b8a6', '#64748b'];

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
