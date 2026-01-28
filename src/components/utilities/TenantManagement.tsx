import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, Edit2, Phone, Zap, Droplets, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/components/CurrencyDisplay';
import { Tenant, UtilityMeter, UtilityBill } from '@/hooks/useUtilities';
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

interface TenantManagementProps {
  tenants: Tenant[];
  meters: UtilityMeter[];
  bills: UtilityBill[];
  onAddTenant: (data: Partial<Tenant>) => Promise<Tenant | null>;
  onUpdateTenant: (id: string, data: Partial<Tenant>) => Promise<boolean>;
  onDeleteTenant: (id: string) => Promise<boolean>;
  onAddMeter: (data: { name: string; type: 'electricity' | 'water'; is_main: boolean; tenant_id?: string | null }) => Promise<any>;
  getLastReading: (meterId: string) => number | null;
}

export function TenantManagement({
  tenants,
  meters,
  bills,
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant,
  onAddMeter,
  getLastReading,
}: TenantManagementProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form states - separate for add and edit to prevent conflicts
  const [addFormData, setAddFormData] = useState({
    name: '',
    phone: '',
    room_name: '',
    monthly_rent: '',
  });
  
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    room_name: '',
    monthly_rent: '',
  });

  const resetAddForm = () => {
    setAddFormData({ name: '', phone: '', room_name: '', monthly_rent: '' });
  };

  const handleAdd = async () => {
    if (!addFormData.name.trim()) return;
    setLoading(true);
    
    const newTenant = await onAddTenant({
      name: addFormData.name.trim(),
      phone: addFormData.phone.trim() || null,
      room_name: addFormData.room_name.trim() || null,
      monthly_rent: parseFloat(addFormData.monthly_rent) || 0,
    });

    if (newTenant) {
      const meterPrefix = addFormData.room_name.trim() || addFormData.name.trim();
      
      await Promise.all([
        onAddMeter({
          name: `Điện - ${meterPrefix}`,
          type: 'electricity',
          is_main: false,
          tenant_id: newTenant.id,
        }),
        onAddMeter({
          name: `Nước - ${meterPrefix}`,
          type: 'water',
          is_main: false,
          tenant_id: newTenant.id,
        }),
      ]);
    }

    resetAddForm();
    setShowAdd(false);
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editingTenant || !editFormData.name.trim()) return;
    setLoading(true);
    await onUpdateTenant(editingTenant.id, {
      name: editFormData.name.trim(),
      phone: editFormData.phone.trim() || null,
      room_name: editFormData.room_name.trim() || null,
      monthly_rent: parseFloat(editFormData.monthly_rent) || 0,
    });
    setEditingTenant(null);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await onDeleteTenant(id);
    setDeleteConfirm(null);
  };

  const startEdit = (tenant: Tenant) => {
    setEditFormData({
      name: tenant.name,
      phone: tenant.phone || '',
      room_name: tenant.room_name || '',
      monthly_rent: tenant.monthly_rent.toString(),
    });
    setEditingTenant(tenant);
  };

  const getTenantUtilities = (tenantId: string) => {
    const tenantMeters = meters.filter(m => m.tenant_id === tenantId);
    const electricityMeter = tenantMeters.find(m => m.type === 'electricity');
    const waterMeter = tenantMeters.find(m => m.type === 'water');
    
    const getLatestBill = (meterId: string | undefined) => {
      if (!meterId) return null;
      return bills.find(b => b.meter_id === meterId) || null;
    };

    return {
      electricityMeter,
      waterMeter,
      electricityBill: getLatestBill(electricityMeter?.id),
      waterBill: getLatestBill(waterMeter?.id),
      electricityReading: electricityMeter ? getLastReading(electricityMeter.id) : null,
      waterReading: waterMeter ? getLastReading(waterMeter.id) : null,
    };
  };

  return (
    <div className="space-y-4">
      {/* Tenants Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Người thuê ({tenants.length})
        </h2>
        <Dialog open={showAdd} onOpenChange={(open) => {
          setShowAdd(open);
          if (!open) resetAddForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Thêm
            </Button>
          </DialogTrigger>
          <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Thêm người thuê mới</DialogTitle>
              <DialogDescription>
                Hệ thống sẽ tự động tạo đồng hồ điện và nước cho người thuê
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="add-name">Tên người thuê *</Label>
                <Input
                  id="add-name"
                  autoFocus
                  value={addFormData.name}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div>
                <Label htmlFor="add-room">Phòng / Tên gọi</Label>
                <Input
                  id="add-room"
                  value={addFormData.room_name}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, room_name: e.target.value }))}
                  placeholder="VD: Phòng 1, Tầng trệt..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Đồng hồ điện/nước sẽ tự động được tạo theo tên này
                </p>
              </div>
              <div>
                <Label htmlFor="add-phone">Số điện thoại</Label>
                <Input
                  id="add-phone"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="VD: 0901234567"
                />
              </div>
              <div>
                <Label htmlFor="add-rent">Tiền thuê hàng tháng (VND)</Label>
                <Input
                  id="add-rent"
                  type="number"
                  value={addFormData.monthly_rent}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, monthly_rent: e.target.value }))}
                  placeholder="VD: 3000000"
                />
              </div>
              <Button 
                onClick={handleAdd} 
                className="w-full" 
                disabled={loading || !addFormData.name.trim()}
              >
                {loading ? 'Đang xử lý...' : 'Thêm người thuê'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTenant} onOpenChange={(open) => !open && setEditingTenant(null)}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người thuê</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người thuê
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tên người thuê *</Label>
              <Input
                id="edit-name"
                autoFocus
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-room">Phòng / Tên gọi</Label>
              <Input
                id="edit-room"
                value={editFormData.room_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, room_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Số điện thoại</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-rent">Tiền thuê hàng tháng (VND)</Label>
              <Input
                id="edit-rent"
                type="number"
                value={editFormData.monthly_rent}
                onChange={(e) => setEditFormData(prev => ({ ...prev, monthly_rent: e.target.value }))}
              />
            </div>
            <Button 
              onClick={handleUpdate} 
              className="w-full" 
              disabled={loading || !editFormData.name.trim()}
            >
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
              Xóa người thuê sẽ xóa luôn các đồng hồ và hóa đơn liên quan. Hành động này không thể hoàn tác.
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

      {/* Tenant Cards */}
      {tenants.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có người thuê. Nhấn "Thêm" để bắt đầu.</p>
            <p className="text-xs mt-1">Đồng hồ điện/nước sẽ được tạo tự động.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tenants.map(tenant => {
            const utils = getTenantUtilities(tenant.id);
            return (
              <Card key={tenant.id} className={!tenant.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{tenant.name}</h3>
                        {tenant.room_name && (
                          <Badge variant="outline" className="text-xs">
                            {tenant.room_name}
                          </Badge>
                        )}
                        {!tenant.is_active && (
                          <Badge variant="secondary" className="text-xs">Đã dọn</Badge>
                        )}
                      </div>
                      
                      {tenant.phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                          <Phone className="h-3 w-3" /> {tenant.phone}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* Electricity */}
                        <div className="p-2 bg-yellow-500/10 rounded text-xs">
                          <div className="flex items-center gap-1 text-yellow-600 font-medium">
                            <Zap className="h-3 w-3" /> Điện
                          </div>
                          {utils.electricityMeter ? (
                            <div className="mt-1">
                              <p className="text-muted-foreground">
                                Chỉ số: {utils.electricityReading?.toLocaleString() || '0'} kWh
                              </p>
                              {utils.electricityBill && (
                                <p className="font-mono font-medium text-foreground">
                                  {formatCurrency(utils.electricityBill.total_amount)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-destructive mt-1">Chưa có ĐH</p>
                          )}
                        </div>

                        {/* Water */}
                        <div className="p-2 bg-blue-500/10 rounded text-xs">
                          <div className="flex items-center gap-1 text-blue-600 font-medium">
                            <Droplets className="h-3 w-3" /> Nước
                          </div>
                          {utils.waterMeter ? (
                            <div className="mt-1">
                              <p className="text-muted-foreground">
                                Chỉ số: {utils.waterReading?.toLocaleString() || '0'} m³
                              </p>
                              {utils.waterBill && (
                                <p className="font-mono font-medium text-foreground">
                                  {formatCurrency(utils.waterBill.total_amount)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-destructive mt-1">Chưa có ĐH</p>
                          )}
                        </div>
                      </div>

                      {/* Rent */}
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <span className="text-muted-foreground">Tiền thuê: </span>
                        <span className="font-mono font-medium">
                          {formatCurrency(tenant.monthly_rent)}
                        </span>
                        /tháng
                      </div>
                    </div>

                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(tenant)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm(tenant.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
