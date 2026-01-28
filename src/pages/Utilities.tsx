import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUtilities, ELECTRICITY_TIERS, WATER_PRICE, calculateElectricityBill } from '@/hooks/useUtilities';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Zap, Droplets, Plus, Trash2, Calculator, 
  CalendarIcon, Receipt, Users, Settings2 
} from 'lucide-react';
import { formatCurrency } from '@/components/CurrencyDisplay';

export default function UtilitiesPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { meters, bills, loading, addMeter, deleteMeter, addBill, deleteBill, getLastReading } = useUtilities();
  const { addTransaction } = useTransactions(new Date(), new Date());
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('meters');
  const [showAddMeter, setShowAddMeter] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [newMeter, setNewMeter] = useState<{ name: string; type: 'electricity' | 'water'; is_main: boolean }>({ name: '', type: 'electricity', is_main: false });
  const [newBill, setNewBill] = useState({
    meter_id: '',
    period_start: new Date(),
    period_end: new Date(),
    previous_reading: '',
    current_reading: '',
  });

  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  if (loading || authLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const electricityMeters = meters.filter(m => m.type === 'electricity');
  const waterMeters = meters.filter(m => m.type === 'water');

  const handleAddMeter = async () => {
    if (!newMeter.name) return;
    
    await addMeter(newMeter);
    setNewMeter({ name: '', type: 'electricity', is_main: false });
    setShowAddMeter(false);
    toast({ title: 'Thành công', description: 'Đã thêm đồng hồ mới' });
  };

  const handleAddBill = async (createTransaction: boolean = false) => {
    if (!newBill.meter_id || !newBill.previous_reading || !newBill.current_reading) {
      toast({ title: 'Lỗi', description: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    const bill = await addBill({
      meter_id: newBill.meter_id,
      period_start: format(newBill.period_start, 'yyyy-MM-dd'),
      period_end: format(newBill.period_end, 'yyyy-MM-dd'),
      previous_reading: parseFloat(newBill.previous_reading),
      current_reading: parseFloat(newBill.current_reading),
    });

    if (bill && createTransaction) {
      const meter = meters.find(m => m.id === newBill.meter_id);
      const utilityCategory = categories.find(c => 
        c.type === 'expense' && 
        (c.name.toLowerCase().includes('điện') || c.name.toLowerCase().includes('nước') || c.name.toLowerCase().includes('tiện ích'))
      );
      const defaultAccount = accounts[0];

      if (defaultAccount) {
        await addTransaction({
          type: 'expense',
          amount: bill.total_amount,
          category_id: utilityCategory?.id || null,
          account_id: defaultAccount.id,
          to_account_id: null,
          description: `${meter?.type === 'electricity' ? 'Tiền điện' : 'Tiền nước'} - ${meter?.name} (${format(newBill.period_start, 'dd/MM')} - ${format(newBill.period_end, 'dd/MM')})`,
          date: new Date().toISOString(),
          is_recurring: false,
          recurring_id: null,
        });
        toast({ title: 'Thành công', description: 'Đã tạo hóa đơn và giao dịch' });
      }
    } else if (bill) {
      toast({ title: 'Thành công', description: 'Đã tạo hóa đơn' });
    }

    setNewBill({
      meter_id: '',
      period_start: new Date(),
      period_end: new Date(),
      previous_reading: '',
      current_reading: '',
    });
    setShowAddBill(false);
  };

  const selectedMeter = meters.find(m => m.id === newBill.meter_id);
  const usage = newBill.current_reading && newBill.previous_reading 
    ? parseFloat(newBill.current_reading) - parseFloat(newBill.previous_reading) 
    : 0;
  const billPreview = selectedMeter?.type === 'electricity' 
    ? calculateElectricityBill(usage)
    : { baseAmount: usage * WATER_PRICE, vatAmount: 0, totalAmount: usage * WATER_PRICE, breakdown: [] };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h1 className="text-2xl font-bold">Điện Nước</h1>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meters" className="flex items-center gap-1">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Đồng hồ</span>
          </TabsTrigger>
          <TabsTrigger value="calculate" className="flex items-center gap-1">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Tính tiền</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Lịch sử</span>
          </TabsTrigger>
        </TabsList>

        {/* Meters Tab */}
        <TabsContent value="meters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Danh sách đồng hồ</h2>
            <Dialog open={showAddMeter} onOpenChange={setShowAddMeter}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm đồng hồ mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Tên (VD: Chính, Phụ 1, Phụ 2...)</Label>
                    <Input
                      value={newMeter.name}
                      onChange={(e) => setNewMeter({ ...newMeter, name: e.target.value })}
                      placeholder="Nhập tên đồng hồ"
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
                            <Zap className="h-4 w-4 text-yellow-500" />
                            Điện
                          </div>
                        </SelectItem>
                        <SelectItem value="water">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            Nước
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddMeter} className="w-full">
                    Thêm đồng hồ
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Electricity Meters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Điện ({electricityMeters.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {electricityMeters.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có đồng hồ điện. Nhấn "Thêm" để tạo mới.
                </p>
              ) : (
                electricityMeters.map(meter => {
                  const lastReading = getLastReading(meter.id);
                  return (
                    <div key={meter.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{meter.name}</p>
                        {lastReading !== null && (
                          <p className="text-xs text-muted-foreground">
                            Chỉ số gần nhất: {lastReading.toLocaleString()} kWh
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteMeter(meter.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Water Meters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                Nước ({waterMeters.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {waterMeters.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có đồng hồ nước. Nhấn "Thêm" để tạo mới.
                </p>
              ) : (
                waterMeters.map(meter => {
                  const lastReading = getLastReading(meter.id);
                  return (
                    <div key={meter.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{meter.name}</p>
                        {lastReading !== null && (
                          <p className="text-xs text-muted-foreground">
                            Chỉ số gần nhất: {lastReading.toLocaleString()} m³
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteMeter(meter.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Price Reference */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Biểu giá điện TP.HCM 2025</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {ELECTRICITY_TIERS.map(tier => (
                  <div key={tier.tier} className="flex justify-between">
                    <span className="text-muted-foreground">{tier.range}</span>
                    <span className="font-mono">{tier.price.toLocaleString()}đ/kWh</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nước (đã gồm VAT)</span>
                    <span className="font-mono">{WATER_PRICE.toLocaleString()}đ/m³</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculate Tab */}
        <TabsContent value="calculate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ghi chỉ số & Tính tiền</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Meter Selection */}
              <div>
                <Label>Chọn đồng hồ</Label>
                <Select value={newBill.meter_id} onValueChange={(v) => {
                  const meter = meters.find(m => m.id === v);
                  const lastReading = getLastReading(v);
                  setNewBill({ 
                    ...newBill, 
                    meter_id: v,
                    previous_reading: lastReading?.toString() || '',
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đồng hồ" />
                  </SelectTrigger>
                  <SelectContent>
                    {meters.map(meter => (
                      <SelectItem key={meter.id} value={meter.id}>
                        <div className="flex items-center gap-2">
                          {meter.type === 'electricity' ? (
                            <Zap className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <Droplets className="h-4 w-4 text-blue-500" />
                          )}
                          {meter.name} ({meter.type === 'electricity' ? 'Điện' : 'Nước'})
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
                        {format(newBill.period_start, 'dd/MM/yyyy', { locale: vi })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newBill.period_start}
                        onSelect={(d) => d && setNewBill({ ...newBill, period_start: d })}
                        className="pointer-events-auto"
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
                        {format(newBill.period_end, 'dd/MM/yyyy', { locale: vi })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newBill.period_end}
                        onSelect={(d) => d && setNewBill({ ...newBill, period_end: d })}
                        className="pointer-events-auto"
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
                    value={newBill.previous_reading}
                    onChange={(e) => setNewBill({ ...newBill, previous_reading: e.target.value })}
                    placeholder="VD: 24273"
                  />
                </div>
                <div>
                  <Label>Chỉ số cuối</Label>
                  <Input
                    type="number"
                    value={newBill.current_reading}
                    onChange={(e) => setNewBill({ ...newBill, current_reading: e.target.value })}
                    placeholder="VD: 24384"
                  />
                </div>
              </div>

              {/* Usage Display */}
              {usage > 0 && selectedMeter && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tiêu thụ:</span>
                    <Badge variant="outline" className="font-mono text-lg">
                      {usage.toLocaleString()} {selectedMeter.type === 'electricity' ? 'kWh' : 'm³'}
                    </Badge>
                  </div>

                  {/* Electricity breakdown */}
                  {selectedMeter.type === 'electricity' && billPreview.breakdown && (
                    <div className="space-y-1 text-sm border-t pt-2">
                      {billPreview.breakdown.map((b: any) => (
                        <div key={b.tier} className="flex justify-between">
                          <span className="text-muted-foreground">Bậc {b.tier}: {b.kwh} kWh × {b.price.toLocaleString()}đ</span>
                          <span className="font-mono">{b.amount.toLocaleString()}đ</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-muted-foreground">VAT 10%:</span>
                        <span className="font-mono">{billPreview.vatAmount.toLocaleString()}đ</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-primary font-mono">
                      {formatCurrency(billPreview.totalAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleAddBill(false)}
                  disabled={!newBill.meter_id || usage <= 0}
                >
                  Chỉ lưu hóa đơn
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleAddBill(true)}
                  disabled={!newBill.meter_id || usage <= 0}
                >
                  Lưu & Tạo giao dịch
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <h2 className="text-lg font-semibold">Lịch sử hóa đơn</h2>
          
          {bills.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Chưa có hóa đơn nào. Hãy ghi chỉ số và tính tiền ở tab "Tính tiền".
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {bills.map(bill => {
                const meter = meters.find(m => m.id === bill.meter_id);
                return (
                  <Card key={bill.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {meter?.type === 'electricity' ? (
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                              <Zap className="h-5 w-5 text-yellow-500" />
                            </div>
                          ) : (
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <Droplets className="h-5 w-5 text-blue-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{meter?.name || 'Đồng hồ đã xóa'}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(bill.period_start), 'dd/MM')} - {format(new Date(bill.period_end), 'dd/MM/yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {bill.previous_reading.toLocaleString()} → {bill.current_reading.toLocaleString()} = {bill.usage.toLocaleString()} {meter?.type === 'electricity' ? 'kWh' : 'm³'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-primary">
                            {formatCurrency(bill.total_amount)}
                          </p>
                          {bill.transaction_id && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Đã tạo GD
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 mt-1"
                            onClick={() => deleteBill(bill.id)}
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
