import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Zap, Droplets, Plus, Trash2, Settings2 } from 'lucide-react';
import { Tenant, UtilityMeter } from '@/hooks/useUtilities';

interface MeterManagementProps {
  meters: UtilityMeter[];
  tenants: Tenant[];
  getLastReading: (meterId: string) => number | null;
  onAddMeter: (data: { name: string; type: 'electricity' | 'water'; is_main: boolean; tenant_id?: string | null }) => Promise<UtilityMeter | null>;
  onUpdateMeter: (id: string, data: Partial<UtilityMeter>) => Promise<boolean>;
  onDeleteMeter: (id: string) => Promise<boolean>;
}

export function MeterManagement({
  meters,
  tenants,
  getLastReading,
  onAddMeter,
  onUpdateMeter,
  onDeleteMeter,
}: MeterManagementProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newMeter, setNewMeter] = useState({
    name: '',
    type: 'electricity' as 'electricity' | 'water',
    is_main: true,
    tenant_id: '__none__',
  });

  const handleAdd = async () => {
    if (!newMeter.name) return;
    await onAddMeter({
      name: newMeter.name,
      type: newMeter.type,
      is_main: newMeter.is_main,
      tenant_id: newMeter.tenant_id === '__none__' ? null : newMeter.tenant_id,
    });
    setNewMeter({ name: '', type: 'electricity', is_main: true, tenant_id: '__none__' });
    setShowAdd(false);
  };

  const mainElectricityMeters = meters.filter(m => m.type === 'electricity' && m.is_main);
  const mainWaterMeters = meters.filter(m => m.type === 'water' && m.is_main);
  const tenantElectricityMeters = meters.filter(m => m.type === 'electricity' && !m.is_main);
  const tenantWaterMeters = meters.filter(m => m.type === 'water' && !m.is_main);

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return 'Chưa gán';
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.name || 'Không xác định';
  };

  const MeterItem = ({ meter, unit }: { meter: UtilityMeter; unit: string }) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium">{meter.name}</p>
          {meter.is_main && <Badge variant="default" className="text-xs">Chính</Badge>}
          {!meter.is_main && meter.tenant_id && (
            <Badge variant="outline" className="text-xs">{getTenantName(meter.tenant_id)}</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Chỉ số gần nhất: {getLastReading(meter.id)?.toLocaleString() || '---'} {unit}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onDeleteMeter(meter.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Quản lý đồng hồ
        </h2>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Thêm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm đồng hồ mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tên đồng hồ</Label>
                <Input
                  value={newMeter.name}
                  onChange={(e) => setNewMeter({ ...newMeter, name: e.target.value })}
                  placeholder="VD: Điện chính, Nước phụ 1..."
                />
              </div>
              <div>
                <Label>Loại</Label>
                <Select
                  value={newMeter.type}
                  onValueChange={(v) => setNewMeter({ ...newMeter, type: v as 'electricity' | 'water' })}
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
              <div className="flex items-center justify-between">
                <Label>Đồng hồ chính (Chủ nhà)</Label>
                <Switch
                  checked={newMeter.is_main}
                  onCheckedChange={(v) => setNewMeter({ ...newMeter, is_main: v, tenant_id: v ? '__none__' : newMeter.tenant_id })}
                />
              </div>
              {!newMeter.is_main && (
                <div>
                  <Label>Gán cho người thuê</Label>
                  <Select
                    value={newMeter.tenant_id}
                    onValueChange={(v) => setNewMeter({ ...newMeter, tenant_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn người thuê" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Không gán</SelectItem>
                      {tenants.map(tenant => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name} {tenant.room_name && `(${tenant.room_name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleAdd} className="w-full">Thêm đồng hồ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Electricity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Điện chính ({mainElectricityMeters.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mainElectricityMeters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">Chưa có đồng hồ điện chính</p>
          ) : (
            mainElectricityMeters.map(meter => <MeterItem key={meter.id} meter={meter} unit="kWh" />)
          )}
        </CardContent>
      </Card>

      {/* Tenant Electricity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Điện người thuê ({tenantElectricityMeters.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tenantElectricityMeters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">Chưa có đồng hồ điện cho người thuê</p>
          ) : (
            tenantElectricityMeters.map(meter => <MeterItem key={meter.id} meter={meter} unit="kWh" />)
          )}
        </CardContent>
      </Card>

      {/* Main Water */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Nước chính ({mainWaterMeters.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mainWaterMeters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">Chưa có đồng hồ nước chính</p>
          ) : (
            mainWaterMeters.map(meter => <MeterItem key={meter.id} meter={meter} unit="m³" />)
          )}
        </CardContent>
      </Card>

      {/* Tenant Water */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Nước người thuê ({tenantWaterMeters.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tenantWaterMeters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">Chưa có đồng hồ nước cho người thuê</p>
          ) : (
            tenantWaterMeters.map(meter => <MeterItem key={meter.id} meter={meter} unit="m³" />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
