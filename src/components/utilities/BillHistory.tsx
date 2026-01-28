import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Zap, Droplets, Trash2, Edit2, History, User, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BillHistoryProps {
  bills: UtilityBill[];
  meters: UtilityMeter[];
  tenants: Tenant[];
  onDeleteBill: (id: string) => Promise<boolean>;
  onUpdateBill?: (id: string, data: Partial<UtilityBill>) => Promise<boolean>;
}

interface ConsolidatedBill {
  key: string;
  tenantId: string | null;
  tenantName: string;
  isMain: boolean;
  periodMonth: number;
  periodYear: number;
  periodLabel: string;
  electricity: UtilityBill | null;
  water: UtilityBill | null;
  totalAmount: number;
}

export function BillHistory({ bills, meters, tenants, onDeleteBill, onUpdateBill }: BillHistoryProps) {
  const [editingBill, setEditingBill] = useState<UtilityBill | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editForm, setEditForm] = useState({
    previous_reading: '',
    current_reading: '',
  });

  // Group bills by tenant/landlord + month
  const consolidatedBills = useMemo(() => {
    const grouped = new Map<string, ConsolidatedBill>();

    bills.forEach(bill => {
      const meter = meters.find(m => m.id === bill.meter_id);
      if (!meter) return;

      const periodDate = new Date(bill.period_end);
      const periodMonth = periodDate.getMonth();
      const periodYear = periodDate.getFullYear();

      // Determine tenant or landlord
      let tenantId: string | null = null;
      let tenantName = 'Không xác định';
      let isMain = false;

      if (meter.is_main) {
        // For main meters, extract name from meter name (e.g., "Điện - Tên chủ hộ")
        const namePart = meter.name.replace(/^(Điện|Nước)\s*-\s*/, '');
        tenantName = namePart || 'Chủ hộ';
        isMain = true;
        tenantId = `main_${namePart}`;
      } else if (meter.tenant_id) {
        const tenant = tenants.find(t => t.id === meter.tenant_id);
        tenantId = meter.tenant_id;
        tenantName = tenant?.name || 'Người thuê';
      }

      const key = `${tenantId || 'unknown'}_${periodYear}_${periodMonth}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          tenantId,
          tenantName,
          isMain,
          periodMonth,
          periodYear,
          periodLabel: format(periodDate, 'MM/yyyy', { locale: vi }),
          electricity: null,
          water: null,
          totalAmount: 0,
        });
      }

      const entry = grouped.get(key)!;
      if (meter.type === 'electricity') {
        entry.electricity = bill;
      } else {
        entry.water = bill;
      }
      entry.totalAmount += bill.total_amount;
    });

    // Sort by date descending, then by tenant name
    return Array.from(grouped.values()).sort((a, b) => {
      const dateCompare = (b.periodYear * 12 + b.periodMonth) - (a.periodYear * 12 + a.periodMonth);
      if (dateCompare !== 0) return dateCompare;
      return a.tenantName.localeCompare(b.tenantName);
    });
  }, [bills, meters, tenants]);

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
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

  const getMeterType = (bill: UtilityBill) => {
    const meter = meters.find(m => m.id === bill.meter_id);
    return meter?.type || 'unknown';
  };

  if (consolidatedBills.length === 0) {
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
        Lịch sử hóa đơn ({consolidatedBills.length} kỳ)
      </h3>
      
      {consolidatedBills.slice(0, 20).map(consolidated => {
        const isExpanded = expandedItems.has(consolidated.key);
        
        return (
          <Card key={consolidated.key}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(consolidated.key)}>
              <CollapsibleTrigger asChild>
                <CardContent className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${consolidated.isMain ? 'bg-primary/10' : 'bg-secondary'}`}>
                        {consolidated.isMain ? (
                          <Home className="h-4 w-4 text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{consolidated.tenantName}</p>
                          <Badge variant="outline" className="text-xs">
                            Tháng {consolidated.periodLabel}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {consolidated.electricity && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-yellow-500" />
                              {consolidated.electricity.usage.toLocaleString()} kWh
                            </span>
                          )}
                          {consolidated.water && (
                            <span className="flex items-center gap-1">
                              <Droplets className="h-3 w-3 text-blue-500" />
                              {consolidated.water.usage.toLocaleString()} m³
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-mono font-bold text-sm text-primary">
                          {formatCurrency(consolidated.totalAmount)}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-2 border-t pt-2">
                  {/* Electricity details */}
                  {consolidated.electricity && (
                    <div className="flex items-center justify-between p-2 bg-yellow-500/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <div className="text-sm">
                          <span className="font-medium">Điện: </span>
                          <span className="text-muted-foreground">
                            {consolidated.electricity.previous_reading.toLocaleString()} → {consolidated.electricity.current_reading.toLocaleString()}
                          </span>
                          <span className="ml-2 font-mono">
                            = {consolidated.electricity.usage.toLocaleString()} kWh
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {formatCurrency(consolidated.electricity.total_amount)}
                        </span>
                        <div className="flex gap-1">
                          {onUpdateBill && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(consolidated.electricity!);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(consolidated.electricity!.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Water details */}
                  {consolidated.water && (
                    <div className="flex items-center justify-between p-2 bg-blue-500/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <div className="text-sm">
                          <span className="font-medium">Nước: </span>
                          <span className="text-muted-foreground">
                            {consolidated.water.previous_reading.toLocaleString()} → {consolidated.water.current_reading.toLocaleString()}
                          </span>
                          <span className="ml-2 font-mono">
                            = {consolidated.water.usage.toLocaleString()} m³
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {formatCurrency(consolidated.water.total_amount)}
                        </span>
                        <div className="flex gap-1">
                          {onUpdateBill && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(consolidated.water!);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(consolidated.water!.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Period info */}
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    Kỳ: {format(new Date((consolidated.electricity || consolidated.water)!.period_start), 'dd/MM')} - {format(new Date((consolidated.electricity || consolidated.water)!.period_end), 'dd/MM/yyyy')}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      {/* Edit Dialog */}
      <Dialog open={!!editingBill} onOpenChange={(open) => !open && setEditingBill(null)}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              Chỉnh sửa {editingBill && getMeterType(editingBill) === 'electricity' ? 'điện' : 'nước'}
            </DialogTitle>
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
