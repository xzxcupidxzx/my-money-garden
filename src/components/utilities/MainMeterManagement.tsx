import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Home, Plus, Trash2, Edit2, Zap, Droplets, User, CalendarIcon, Clock } from 'lucide-react';
import { UtilityMeter } from '@/hooks/useUtilities';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
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
} from "@/components/ui/alert-dialog";

interface MainMeterManagementProps {
  meters: UtilityMeter[];
  getLastReading: (meterId: string) => number | null;
  onAddMeter: (data: { name: string; type: 'electricity' | 'water'; is_main: boolean; tenant_id?: string | null; start_date?: string | null }) => Promise<any>;
  onUpdateMeter: (id: string, updates: Partial<UtilityMeter>) => Promise<boolean>;
  onDeleteMeter: (id: string) => Promise<boolean>;
}

interface LandlordGroup {
  name: string;
  startDate?: string | null;
  electricityMeter?: UtilityMeter;
  waterMeter?: UtilityMeter;
}

// Helper function to calculate next billing period
function getNextBillingPeriod(startDate: string | null | undefined): { start: Date; end: Date } | null {
  if (!startDate) return null;
  
  const moveInDate = new Date(startDate);
  const moveInDay = moveInDate.getDate();
  const now = new Date();
  const currentDay = now.getDate();
  
  let periodStart: Date;
  let periodEnd: Date;
  
  if (currentDay >= moveInDay) {
    periodStart = new Date(now.getFullYear(), now.getMonth(), moveInDay);
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, moveInDay);
  } else {
    periodStart = new Date(now.getFullYear(), now.getMonth() - 1, moveInDay);
    periodEnd = new Date(now.getFullYear(), now.getMonth(), moveInDay);
  }
  
  if (periodStart < moveInDate) {
    periodStart = moveInDate;
    periodEnd = new Date(moveInDate.getFullYear(), moveInDate.getMonth() + 1, moveInDay);
  }
  
  return { start: periodStart, end: periodEnd };
}

export function MainMeterManagement({
  meters,
  getLastReading,
  onAddMeter,
  onUpdateMeter,
  onDeleteMeter,
}: MainMeterManagementProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingLandlord, setEditingLandlord] = useState<LandlordGroup | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<LandlordGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [landlordName, setLandlordName] = useState('');
  const [landlordStartDate, setLandlordStartDate] = useState<Date | undefined>(new Date());
  const [editName, setEditName] = useState('');
  const [editStartDate, setEditStartDate] = useState<Date | undefined>();

  // Only main meters (landlord's meters)
  const mainMeters = meters.filter(m => m.is_main && !m.tenant_id);

  // Group meters by landlord name pattern
  const landlordGroups = useMemo(() => {
    const groups: Record<string, LandlordGroup> = {};
    
    mainMeters.forEach(meter => {
      // Extract owner name from meter name pattern "Điện - Name" or "Nước - Name"
      let ownerName = meter.name;
      if (meter.name.startsWith('Điện - ')) {
        ownerName = meter.name.replace('Điện - ', '');
      } else if (meter.name.startsWith('Nước - ')) {
        ownerName = meter.name.replace('Nước - ', '');
      }
      
      if (!groups[ownerName]) {
        groups[ownerName] = { name: ownerName, startDate: meter.start_date };
      }
      
      // Use start_date from either meter (they should be the same)
      if (meter.start_date && !groups[ownerName].startDate) {
        groups[ownerName].startDate = meter.start_date;
      }
      
      if (meter.type === 'electricity') {
        groups[ownerName].electricityMeter = meter;
      } else {
        groups[ownerName].waterMeter = meter;
      }
    });
    
    return Object.values(groups);
  }, [mainMeters]);

  const handleAddLandlord = async () => {
    const name = landlordName.trim();
    if (!name) return;
    
    setLoading(true);
    const startDateStr = landlordStartDate ? format(landlordStartDate, 'yyyy-MM-dd') : null;
    
    // Create electricity meter
    await onAddMeter({
      name: `Điện - ${name}`,
      type: 'electricity',
      is_main: true,
      tenant_id: null,
      start_date: startDateStr,
    });
    
    // Create water meter
    await onAddMeter({
      name: `Nước - ${name}`,
      type: 'water',
      is_main: true,
      tenant_id: null,
      start_date: startDateStr,
    });
    
    setLandlordName('');
    setLandlordStartDate(new Date());
    setShowAdd(false);
    setLoading(false);
  };

  const handleUpdateLandlord = async () => {
    if (!editingLandlord || !editName.trim()) return;
    
    setLoading(true);
    const newName = editName.trim();
    const startDateStr = editStartDate ? format(editStartDate, 'yyyy-MM-dd') : null;
    
    if (editingLandlord.electricityMeter) {
      await onUpdateMeter(editingLandlord.electricityMeter.id, {
        name: `Điện - ${newName}`,
        start_date: startDateStr,
      } as any);
    }
    
    if (editingLandlord.waterMeter) {
      await onUpdateMeter(editingLandlord.waterMeter.id, {
        name: `Nước - ${newName}`,
        start_date: startDateStr,
      } as any);
    }
    
    setEditingLandlord(null);
    setLoading(false);
  };

  const handleDeleteLandlord = async () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.electricityMeter) {
      await onDeleteMeter(deleteConfirm.electricityMeter.id);
    }
    if (deleteConfirm.waterMeter) {
      await onDeleteMeter(deleteConfirm.waterMeter.id);
    }
    
    setDeleteConfirm(null);
  };

  const startEdit = (group: LandlordGroup) => {
    setEditName(group.name);
    setEditStartDate(group.startDate ? new Date(group.startDate) : undefined);
    setEditingLandlord(group);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Chủ hộ
            </CardTitle>
            <Dialog open={showAdd} onOpenChange={(open) => {
              setShowAdd(open);
              if (!open) {
                setLandlordName('');
                setLandlordStartDate(new Date());
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Thêm chủ hộ
                </Button>
              </DialogTrigger>
              <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                  <DialogTitle>Thêm chủ hộ</DialogTitle>
                  <DialogDescription>
                    Tạo chủ hộ mới - đồng hồ điện và nước sẽ được tạo tự động
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="landlord-name">Tên chủ hộ *</Label>
                    <Input
                      id="landlord-name"
                      autoFocus
                      value={landlordName}
                      onChange={(e) => setLandlordName(e.target.value)}
                      placeholder="VD: Nhà chính, Ông A..."
                    />
                  </div>
                  <div>
                    <Label>Ngày bắt đầu tính</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {landlordStartDate ? format(landlordStartDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={landlordStartDate}
                          onSelect={setLandlordStartDate}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Điện + <Droplets className="h-3 w-3" /> Nước sẽ được tạo tự động
                  </p>
                  <Button onClick={handleAddLandlord} className="w-full" disabled={loading || !landlordName.trim()}>
                    {loading ? 'Đang xử lý...' : 'Thêm chủ hộ'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {landlordGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có chủ hộ. Nhấn "Thêm chủ hộ" để tạo mới với đồng hồ điện nước tự động.
            </p>
          ) : (
            <div className="space-y-3">
              {landlordGroups.map((group) => {
                const nextPeriod = getNextBillingPeriod(group.startDate);
                return (
                  <div key={group.name} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium">{group.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(group)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm(group)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Next billing period */}
                    {nextPeriod && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                        <Clock className="h-3 w-3" />
                        <span>Kỳ tiếp: {format(nextPeriod.start, 'dd/MM')} → {format(nextPeriod.end, 'dd/MM/yyyy')}</span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      {group.electricityMeter && (
                        <div className="bg-yellow-500/10 rounded-md p-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          <div className="text-xs">
                            <p className="font-medium">Điện</p>
                            <p className="text-muted-foreground">
                              {getLastReading(group.electricityMeter.id)?.toLocaleString() || '0'} kWh
                            </p>
                          </div>
                        </div>
                      )}
                      {group.waterMeter && (
                        <div className="bg-blue-500/10 rounded-md p-2 flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-600" />
                          <div className="text-xs">
                            <p className="font-medium">Nước</p>
                            <p className="text-muted-foreground">
                              {getLastReading(group.waterMeter.id)?.toLocaleString() || '0'} m³
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingLandlord} onOpenChange={(open) => !open && setEditingLandlord(null)}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chủ hộ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chủ hộ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-landlord-name">Tên chủ hộ *</Label>
              <Input
                id="edit-landlord-name"
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label>Ngày bắt đầu tính</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editStartDate ? format(editStartDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editStartDate}
                    onSelect={setEditStartDate}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleUpdateLandlord} className="w-full" disabled={loading || !editName.trim()}>
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
              Xóa chủ hộ "{deleteConfirm?.name}" sẽ xóa luôn đồng hồ điện nước và các hóa đơn liên quan. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLandlord}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
