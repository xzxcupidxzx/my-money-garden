import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calculator, CalendarIcon, Zap, Droplets } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { UtilityMeter, ElectricityTier, calculateElectricityBill, calculateWaterBill } from '@/hooks/useUtilities';
import { formatCurrency } from '@/components/CurrencyDisplay';

interface BillCalculatorProps {
  meters: UtilityMeter[];
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
  onCreateTransaction?: (bill: any, meter: UtilityMeter) => Promise<void>;
}

export function BillCalculator({
  meters,
  getLastReading,
  getElectricityTiers,
  getWaterPrice,
  getVatPercent,
  onAddBill,
  onCreateTransaction,
}: BillCalculatorProps) {
  const [selectedMeter, setSelectedMeter] = useState('');
  const [periodStart, setPeriodStart] = useState<Date>(new Date());
  const [periodEnd, setPeriodEnd] = useState<Date>(new Date());
  const [previousReading, setPreviousReading] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [loading, setLoading] = useState(false);

  const meter = meters.find(m => m.id === selectedMeter);
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
  };

  const handleSave = async (createTransaction: boolean) => {
    if (!selectedMeter || usage <= 0) return;
    setLoading(true);

    const bill = await onAddBill({
      meter_id: selectedMeter,
      period_start: format(periodStart, 'yyyy-MM-dd'),
      period_end: format(periodEnd, 'yyyy-MM-dd'),
      previous_reading: parseFloat(previousReading),
      current_reading: parseFloat(currentReading),
    });

    if (bill && createTransaction && meter && onCreateTransaction) {
      await onCreateTransaction(bill, meter);
    }

    // Reset form
    setPreviousReading(currentReading);
    setCurrentReading('');
    setLoading(false);
  };

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
              <SelectValue placeholder="Chọn đồng hồ" />
            </SelectTrigger>
            <SelectContent>
              {meters.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  <div className="flex items-center gap-2">
                    {m.type === 'electricity' ? (
                      <Zap className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Droplets className="h-4 w-4 text-blue-500" />
                    )}
                    {m.name} {m.is_main && '(Chính)'}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span>Tổng cộng:</span>
              <span className="text-primary font-mono">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleSave(false)}
            disabled={!selectedMeter || usage <= 0 || loading}
          >
            Chỉ lưu hóa đơn
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleSave(true)}
            disabled={!selectedMeter || usage <= 0 || loading}
          >
            Lưu & Tạo giao dịch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
