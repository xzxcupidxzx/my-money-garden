import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Zap, Droplets, Trash2, Edit2, History } from 'lucide-react';
import { format } from 'date-fns';
import { UtilityMeter, UtilityBill, Tenant } from '@/hooks/useUtilities';
import { formatCurrency } from '@/components/CurrencyDisplay';
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

interface BillHistoryProps {
  bills: UtilityBill[];
  meters: UtilityMeter[];
  tenants: Tenant[];
  onDeleteBill: (id: string) => Promise<boolean>;
  onUpdateBill?: (id: string, data: Partial<UtilityBill>) => Promise<boolean>;
}

export function BillHistory({ bills, meters, tenants, onDeleteBill, onUpdateBill }: BillHistoryProps) {
  const [editingBill, setEditingBill] = useState<UtilityBill | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    previous_reading: '',
    current_reading: '',
  });

  const getMeterInfo = (meterId: string) => {
    const meter = meters.find(m => m.id === meterId);
    if (!meter) return { name: 'Đồng hồ đã xóa', type: 'unknown', tenantName: null };
    
    const tenant = meter.tenant_id ? tenants.find(t => t.id === meter.tenant_id) : null;
    return {
      name: meter.name,
      type: meter.type,
      tenantName: tenant?.name || (meter.is_main ? 'Chủ nhà' : null),
    };
  };

  const startEdit = (bill: UtilityBill) => {
    setEditingBill(bill);
    setEditForm({
      previous_reading: bill.previous_reading.toString(),
      current_reading: bill.current_reading.toString(),
    });
  };

  const handleUpdate = async () => {
    if (!editingBill || !onUpdateBill) return;
    
    const prevReading = parseFloat(editForm.previous_reading);
    const currReading = parseFloat(editForm.current_reading);
    
    if (isNaN(prevReading) || isNaN(currReading) || currReading <= prevReading) return;

    await onUpdateBill(editingBill.id, {
      previous_reading: prevReading,
      current_reading: currReading,
    });
    setEditingBill(null);
  };

  const handleDelete = async (id: string) => {
    await onDeleteBill(id);
    setDeleteConfirm(null);
  };

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Chưa có hóa đơn nào.</p>
          <p className="text-xs mt-1">Ghi chỉ số ở phần trên để tạo hóa đơn.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
        <History className="h-4 w-4" />
        Lịch sử hóa đơn ({bills.length})
      </h3>
      
      {bills.slice(0, 20).map(bill => {
        const meterInfo = getMeterInfo(bill.meter_id);
        return (
          <Card key={bill.id}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {meterInfo.type === 'electricity' ? (
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Zap className="h-4 w-4 text-yellow-500" />
                    </div>
                  ) : (
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Droplets className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{meterInfo.name}</p>
                      {meterInfo.tenantName && (
                        <Badge variant="outline" className="text-xs">{meterInfo.tenantName}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(bill.period_start), 'dd/MM')} - {format(new Date(bill.period_end), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bill.previous_reading.toLocaleString()} → {bill.current_reading.toLocaleString()} = {bill.usage.toLocaleString()} {meterInfo.type === 'electricity' ? 'kWh' : 'm³'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="font-mono font-bold text-sm text-primary">
                      {formatCurrency(bill.total_amount)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {onUpdateBill && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => startEdit(bill)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setDeleteConfirm(bill.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Edit Dialog */}
      <Dialog open={!!editingBill} onOpenChange={(open) => !open && setEditingBill(null)}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hóa đơn</DialogTitle>
            <DialogDescription>
              Sửa chỉ số đọc để tính lại tiền
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bill-prev">Chỉ số đầu</Label>
              <Input
                id="bill-prev"
                autoFocus
                type="number"
                value={editForm.previous_reading}
                onChange={(e) => setEditForm(prev => ({ ...prev, previous_reading: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bill-curr">Chỉ số cuối</Label>
              <Input
                id="bill-curr"
                type="number"
                value={editForm.current_reading}
                onChange={(e) => setEditForm(prev => ({ ...prev, current_reading: e.target.value }))}
              />
            </div>
            {editForm.previous_reading && editForm.current_reading && (
              <div className="p-2 bg-muted rounded text-sm">
                <span className="text-muted-foreground">Tiêu thụ mới: </span>
                <span className="font-mono font-medium">
                  {(parseFloat(editForm.current_reading) - parseFloat(editForm.previous_reading)).toLocaleString()}
                </span>
              </div>
            )}
            <Button onClick={handleUpdate} className="w-full">
              Cập nhật
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
              Bạn có chắc muốn xóa hóa đơn này? Hành động này không thể hoàn tác.
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
