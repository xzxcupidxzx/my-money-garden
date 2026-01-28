import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Plus, Trash2, Edit2, Zap, Droplets } from 'lucide-react';
import { UtilityMeter } from '@/hooks/useUtilities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MainMeterManagementProps {
  meters: UtilityMeter[];
  getLastReading: (meterId: string) => number | null;
  onAddMeter: (data: { name: string; type: 'electricity' | 'water'; is_main: boolean; tenant_id?: string | null }) => Promise<any>;
  onUpdateMeter: (id: string, updates: Partial<UtilityMeter>) => Promise<boolean>;
  onDeleteMeter: (id: string) => Promise<boolean>;
}

export function MainMeterManagement({
  meters,
  getLastReading,
  onAddMeter,
  onUpdateMeter,
  onDeleteMeter,
}: MainMeterManagementProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingMeter, setEditingMeter] = useState<UtilityMeter | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Separate form states
  const [addForm, setAddForm] = useState({ name: '', type: 'electricity' as 'electricity' | 'water' });
  const [editForm, setEditForm] = useState({ name: '', type: 'electricity' as 'electricity' | 'water' });

  // Only show main meters (landlord's meters)
  const mainMeters = meters.filter(m => m.is_main && !m.tenant_id);

  const handleAdd = async () => {
    if (!addForm.name.trim()) return;
    setLoading(true);
    await onAddMeter({
      name: addForm.name.trim(),
      type: addForm.type,
      is_main: true,
      tenant_id: null,
    });
    setAddForm({ name: '', type: 'electricity' });
    setShowAdd(false);
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editingMeter || !editForm.name.trim()) return;
    setLoading(true);
    await onUpdateMeter(editingMeter.id, {
      name: editForm.name.trim(),
      type: editForm.type,
    });
    setEditingMeter(null);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await onDeleteMeter(id);
    setDeleteConfirm(null);
  };

  const startEdit = (meter: UtilityMeter) => {
    setEditForm({
      name: meter.name,
      type: meter.type as 'electricity' | 'water',
    });
    setEditingMeter(meter);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Đồng hồ chính (Chủ nhà)
            </CardTitle>
            <Dialog open={showAdd} onOpenChange={(open) => {
              setShowAdd(open);
              if (!open) setAddForm({ name: '', type: 'electricity' });
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Thêm
                </Button>
              </DialogTrigger>
              <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                  <DialogTitle>Thêm đồng hồ chính</DialogTitle>
                  <DialogDescription>
                    Tạo đồng hồ tổng của chủ nhà
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meter-name">Tên đồng hồ *</Label>
                    <Input
                      id="meter-name"
                      autoFocus
                      value={addForm.name}
                      onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="VD: Điện tổng, Nước chính..."
                    />
                  </div>
                  <div>
                    <Label>Loại</Label>
                    <Select 
                      value={addForm.type} 
                      onValueChange={(v: 'electricity' | 'water') => setAddForm(prev => ({ ...prev, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" /> Điện
                          </div>
                        </SelectItem>
                        <SelectItem value="water">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" /> Nước
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAdd} className="w-full" disabled={loading || !addForm.name.trim()}>
                    {loading ? 'Đang xử lý...' : 'Thêm đồng hồ'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {mainMeters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có đồng hồ chính. Nhấn "Thêm" để tạo đồng hồ tổng của chủ nhà.
            </p>
          ) : (
            <div className="grid gap-2">
              {mainMeters.map(meter => (
                <div 
                  key={meter.id} 
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    meter.type === 'electricity' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {meter.type === 'electricity' ? (
                      <Zap className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <Droplets className="h-5 w-5 text-blue-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{meter.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Chỉ số: {getLastReading(meter.id)?.toLocaleString() || '0'} {meter.type === 'electricity' ? 'kWh' : 'm³'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(meter)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm(meter.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingMeter} onOpenChange={(open) => !open && setEditingMeter(null)}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đồng hồ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin đồng hồ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-meter-name">Tên đồng hồ *</Label>
              <Input
                id="edit-meter-name"
                autoFocus
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Loại</Label>
              <Select 
                value={editForm.type} 
                onValueChange={(v: 'electricity' | 'water') => setEditForm(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricity">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" /> Điện
                    </div>
                  </SelectItem>
                  <SelectItem value="water">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" /> Nước
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdate} className="w-full" disabled={loading || !editForm.name.trim()}>
              {loading ? 'Đang xử lý...' : 'Cập nhật'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa đồng hồ sẽ xóa luôn các hóa đơn liên quan. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
