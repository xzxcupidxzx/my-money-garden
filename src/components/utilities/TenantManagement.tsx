import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, Edit2, Home, Phone, Zap, Droplets } from 'lucide-react';
import { formatCurrency } from '@/components/CurrencyDisplay';
import { Tenant, UtilityMeter, UtilityBill } from '@/hooks/useUtilities';

interface TenantManagementProps {
  tenants: Tenant[];
  meters: UtilityMeter[];
  bills: UtilityBill[];
  onAddTenant: (data: Partial<Tenant>) => Promise<Tenant | null>;
  onUpdateTenant: (id: string, data: Partial<Tenant>) => Promise<boolean>;
  onDeleteTenant: (id: string) => Promise<boolean>;
  getLastReading: (meterId: string) => number | null;
}

export function TenantManagement({
  tenants,
  meters,
  bills,
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant,
  getLastReading,
}: TenantManagementProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    room_name: '',
    monthly_rent: '',
  });

  const resetForm = () => {
    setFormData({ name: '', phone: '', room_name: '', monthly_rent: '' });
  };

  const handleAdd = async () => {
    if (!formData.name) return;
    await onAddTenant({
      name: formData.name,
      phone: formData.phone || null,
      room_name: formData.room_name || null,
      monthly_rent: parseFloat(formData.monthly_rent) || 0,
    });
    resetForm();
    setShowAdd(false);
  };

  const handleUpdate = async () => {
    if (!editingTenant) return;
    await onUpdateTenant(editingTenant.id, {
      name: formData.name,
      phone: formData.phone || null,
      room_name: formData.room_name || null,
      monthly_rent: parseFloat(formData.monthly_rent) || 0,
    });
    setEditingTenant(null);
    resetForm();
  };

  const startEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      phone: tenant.phone || '',
      room_name: tenant.room_name || '',
      monthly_rent: tenant.monthly_rent.toString(),
    });
  };

  // Get meters and latest bills for a tenant
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
    };
  };

  // Get main meters (no tenant)
  const mainMeters = meters.filter(m => !m.tenant_id && m.is_main);

  return (
    <div className="space-y-4">
      {/* Main Meters Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Đồng hồ chính (Chủ nhà)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {mainMeters.filter(m => m.type === 'electricity').map(meter => (
              <div key={meter.id} className="p-3 bg-yellow-500/10 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-600">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium text-sm">{meter.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Chỉ số: {getLastReading(meter.id)?.toLocaleString() || '---'} kWh
                </p>
              </div>
            ))}
            {mainMeters.filter(m => m.type === 'water').map(meter => (
              <div key={meter.id} className="p-3 bg-blue-500/10 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600">
                  <Droplets className="h-4 w-4" />
                  <span className="font-medium text-sm">{meter.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Chỉ số: {getLastReading(meter.id)?.toLocaleString() || '---'} m³
                </p>
              </div>
            ))}
          </div>
          {mainMeters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Chưa có đồng hồ chính. Thêm ở tab "Đồng hồ".
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tenants Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Người thuê ({tenants.length})
        </h2>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-1" /> Thêm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm người thuê mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tên người thuê *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="VD: 0901234567"
                />
              </div>
              <div>
                <Label>Phòng / Tên gọi</Label>
                <Input
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  placeholder="VD: Phòng 1, Tầng trệt..."
                />
              </div>
              <div>
                <Label>Tiền thuê hàng tháng (VND)</Label>
                <Input
                  type="number"
                  value={formData.monthly_rent}
                  onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                  placeholder="VD: 3000000"
                />
              </div>
              <Button onClick={handleAdd} className="w-full">Thêm người thuê</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTenant} onOpenChange={(open) => !open && setEditingTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người thuê</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên người thuê *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Phòng / Tên gọi</Label>
              <Input
                value={formData.room_name}
                onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Tiền thuê hàng tháng (VND)</Label>
              <Input
                type="number"
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
              />
            </div>
            <Button onClick={handleUpdate} className="w-full">Cập nhật</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tenant Cards */}
      {tenants.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có người thuê. Nhấn "Thêm" để bắt đầu.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tenants.map(tenant => {
            const utils = getTenantUtilities(tenant.id);
            return (
              <Card key={tenant.id}>
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
                                {utils.electricityBill 
                                  ? `${utils.electricityBill.usage} kWh`
                                  : 'Chưa ghi số'}
                              </p>
                              {utils.electricityBill && (
                                <p className="font-mono font-medium text-foreground">
                                  {formatCurrency(utils.electricityBill.total_amount)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground mt-1">Chưa gán ĐH</p>
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
                                {utils.waterBill 
                                  ? `${utils.waterBill.usage} m³`
                                  : 'Chưa ghi số'}
                              </p>
                              {utils.waterBill && (
                                <p className="font-mono font-medium text-foreground">
                                  {formatCurrency(utils.waterBill.total_amount)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground mt-1">Chưa gán ĐH</p>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDeleteTenant(tenant.id)}>
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
