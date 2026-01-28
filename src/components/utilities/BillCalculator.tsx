import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calculator, CalendarIcon, Zap, Droplets, Save } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { UtilityMeter, Tenant, ElectricityTier, calculateElectricityBill, calculateWaterBill } from '@/hooks/useUtilities';
import { formatCurrency } from '@/components/CurrencyDisplay';

interface BillCalculatorProps {
  meters: UtilityMeter[];
  tenants: Tenant[];
  getLastReading: (meterId: string) => number | null;
  getElectricityTiers: () => ElectricityTier[];
  getWaterPrice: () => number;
  getVatPercent: () => number;
  onAddBill: (data: {
    meter_id: string;
    period_start: string;
    period_end: string;
    previous_reading: number;
    current_reading: number;
  }) => Promise<any>;
}

export function BillCalculator({
  meters,
  tenants,
  getLastReading,
  getElectricityTiers,
  getWaterPrice,
  getVatPercent,
  onAddBill,
}: BillCalculatorProps) {
  // Default to 1st of last month → last day of last month
  const getDefaultPeriod = () => {
    const now = new Date();
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: firstOfLastMonth, end: lastOfLastMonth };
  };

  const defaultPeriod = getDefaultPeriod();
  const [selectedMeter, setSelectedMeter] = useState('');
  const [periodStart, setPeriodStart] = useState<Date>(defaultPeriod.start);
  const [periodEnd, setPeriodEnd] = useState<Date>(defaultPeriod.end);
  const [previousReading, setPreviousReading] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [loading, setLoading] = useState(false);

  const meter = meters.find(m => m.id === selectedMeter);
  const tenant = meter?.tenant_id ? tenants.find(t => t.id === meter.tenant_id) : null;
  
  const usage = currentReading && previousReading 
    ? parseFloat(currentReading) - parseFloat(previousReading) 
    : 0;

  const electricityBillPreview = meter?.type === 'electricity'
    ? calculateElectricityBill(usage, getElectricityTiers(), getVatPercent())
    : null;
  const waterBillPreview = meter?.type === 'water'
    ? calculateWaterBill(usage, getWaterPrice())
    : null;
  const totalAmount = electricityBillPreview?.totalAmount || waterBillPreview?.totalAmount || 0;

  const handleMeterChange = (meterId: string) => {
    setSelectedMeter(meterId);
    const lastReading = getLastReading(meterId);
    if (lastReading !== null) {
      setPreviousReading(lastReading.toString());
    } else {
      setPreviousReading('');
    }
    setCurrentReading('');

    const selectedMeterData = meters.find(m => m.id === meterId);
    if (!selectedMeterData) return;

    // Determine the start date - from tenant's move_in_date or meter's start_date
    let startDateStr: string | null = null;
    
    if (selectedMeterData.tenant_id) {
      // Tenant's meter - use move_in_date from tenant
      const tenant = tenants.find(t => t.id === selectedMeterData.tenant_id);
      startDateStr = tenant?.move_in_date || null;
    } else if (selectedMeterData.is_main) {
      // Main meter (landlord) - use start_date from meter
      startDateStr = selectedMeterData.start_date || null;
    }

    if (startDateStr) {
      const startDate = new Date(startDateStr);
      const startDay = startDate.getDate(); // Day of month (e.g., 15)
      const now = new Date();
      
      // Calculate the most recent billing cycle based on start_day
      // If started on 15th, billing cycles are: 15/1→15/2, 15/2→15/3, etc.
      let periodStart: Date;
      let periodEnd: Date;
      
      const currentDay = now.getDate();
      
      if (currentDay >= startDay) {
        // Current month's cycle: from this month's start_day to next month's
        periodStart = new Date(now.getFullYear(), now.getMonth(), startDay);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, startDay);
      } else {
        // Previous month's cycle: from last month's start_day to this month's
        periodStart = new Date(now.getFullYear(), now.getMonth() - 1, startDay);
        periodEnd = new Date(now.getFullYear(), now.getMonth(), startDay);
      }
      
      // Ensure period doesn't start before the actual start date
      if (periodStart < startDate) {
        periodStart = startDate;
        periodEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDay);
      }
      
      setPeriodStart(periodStart);
      setPeriodEnd(periodEnd);
    } else {
      // No start date - use default period (first of last month to last of last month)
      const period = getDefaultPeriod();
      setPeriodStart(period.start);
      setPeriodEnd(period.end);
    }
  };
  const handleSave = async () => {
    if (!selectedMeter || usage <= 0) return;
    setLoading(true);

    await onAddBill({
      meter_id: selectedMeter,
      period_start: format(periodStart, 'yyyy-MM-dd'),
      period_end: format(periodEnd, 'yyyy-MM-dd'),
      previous_reading: parseFloat(previousReading),
      current_reading: parseFloat(currentReading),
    });

    // Reset form - keep previous as current for next entry
    setPreviousReading(currentReading);
    setCurrentReading('');
    setLoading(false);
  };

  // Group meters by tenant/main
  const mainMeters = meters.filter(m => m.is_main);
  const tenantMeters = meters.filter(m => !m.is_main && m.tenant_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Ghi chỉ số & Tính tiền
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meter Selection */}
        <div>
          <Label>Chọn đồng hồ</Label>
          <Select value={selectedMeter} onValueChange={handleMeterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn đồng hồ để ghi số" />
            </SelectTrigger>
            <SelectContent>
              {/* Main meters */}
              {mainMeters.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Đồng hồ chính
                  </div>
                  {mainMeters.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        {m.type === 'electricity' ? (
                          <Zap className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Droplets className="h-4 w-4 text-blue-500" />
                        )}
                        {m.name}
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
              
              {/* Tenant meters */}
              {tenantMeters.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                    Đồng hồ người thuê
                  </div>
                  {tenantMeters.map(m => {
                    const t = tenants.find(tenant => tenant.id === m.tenant_id);
                    return (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2">
                          {m.type === 'electricity' ? (
                            <Zap className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <Droplets className="h-4 w-4 text-blue-500" />
                          )}
                          {m.name}
                          {t && <span className="text-muted-foreground">({t.name})</span>}
                        </div>
                      </SelectItem>
                    );
                  })}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Selected meter info */}
        {meter && (
          <div className={`p-2 rounded-lg text-sm ${meter.type === 'electricity' ? 'bg-yellow-500/10' : 'bg-blue-500/10'}`}>
            <div className="flex items-center gap-2">
              {meter.type === 'electricity' ? (
                <Zap className="h-4 w-4 text-yellow-600" />
              ) : (
                <Droplets className="h-4 w-4 text-blue-600" />
              )}
              <span className="font-medium">{meter.name}</span>
              {tenant && <Badge variant="outline" className="text-xs">{tenant.name}</Badge>}
              {meter.is_main && <Badge variant="secondary" className="text-xs">Chính</Badge>}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Từ ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(periodStart, 'dd/MM/yyyy', { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={periodStart}
                  onSelect={(d) => d && setPeriodStart(d)}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Đến ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(periodEnd, 'dd/MM/yyyy', { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={periodEnd}
                  onSelect={(d) => d && setPeriodEnd(d)}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Readings */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Chỉ số đầu</Label>
            <Input
              type="number"
              value={previousReading}
              onChange={(e) => setPreviousReading(e.target.value)}
              placeholder="VD: 24273"
            />
          </div>
          <div>
            <Label>Chỉ số cuối</Label>
            <Input
              type="number"
              value={currentReading}
              onChange={(e) => setCurrentReading(e.target.value)}
              placeholder="VD: 24384"
            />
          </div>
        </div>

        {/* Usage Display */}
        {usage > 0 && meter && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tiêu thụ:</span>
              <Badge variant="outline" className="font-mono text-lg">
                {usage.toLocaleString()} {meter.type === 'electricity' ? 'kWh' : 'm³'}
              </Badge>
            </div>

            {/* Electricity breakdown */}
            {meter.type === 'electricity' && electricityBillPreview && (
              <div className="space-y-1 text-sm border-t pt-2">
                {electricityBillPreview.breakdown.map((b: any) => (
                  <div key={b.tier} className="flex justify-between">
                    <span className="text-muted-foreground">
                      Bậc {b.tier}: {b.kwh} kWh × {b.price.toLocaleString()}đ
                    </span>
                    <span className="font-mono">{b.amount.toLocaleString()}đ</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-1">
                  <span className="text-muted-foreground">VAT {getVatPercent()}%:</span>
                  <span className="font-mono">{electricityBillPreview.vatAmount.toLocaleString()}đ</span>
                </div>
              </div>
            )}

            {/* Water calculation */}
            {meter.type === 'water' && waterBillPreview && (
              <div className="space-y-1 text-sm border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {usage} m³ × {getWaterPrice().toLocaleString()}đ/m³
                  </span>
                  <span className="font-mono">{waterBillPreview.baseAmount.toLocaleString()}đ</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span>Tổng cộng:</span>
              <span className="text-primary font-mono">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={!selectedMeter || usage <= 0 || loading}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Đang lưu...' : 'Lưu hóa đơn'}
        </Button>
      </CardContent>
    </Card>
  );
}
