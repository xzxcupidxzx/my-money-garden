import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Droplets, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { UtilityMeter, UtilityBill, Tenant } from '@/hooks/useUtilities';
import { formatCurrency } from '@/components/CurrencyDisplay';

interface BillHistoryProps {
  bills: UtilityBill[];
  meters: UtilityMeter[];
  tenants: Tenant[];
  onDeleteBill: (id: string) => Promise<boolean>;
}

export function BillHistory({ bills, meters, tenants, onDeleteBill }: BillHistoryProps) {
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

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Chưa có hóa đơn nào. Hãy ghi chỉ số ở trên.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-muted-foreground">Lịch sử hóa đơn</h3>
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
                    {bill.transaction_id && (
                      <Badge variant="secondary" className="text-xs">Đã tạo GD</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDeleteBill(bill.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
