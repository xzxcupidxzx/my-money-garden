import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FileText, Printer, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Tenant, UtilityMeter, UtilityBill, RentPayment } from '@/hooks/useUtilities';
import { formatCurrency } from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';

interface ReceiptExportProps {
  tenants: Tenant[];
  meters: UtilityMeter[];
  bills: UtilityBill[];
  rentPayments: RentPayment[];
  onCreateTransaction?: (amount: number, description: string) => Promise<void>;
}

export function ReceiptExport({ 
  tenants, 
  meters, 
  bills, 
  rentPayments,
  onCreateTransaction,
}: ReceiptExportProps) {
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [landlordName, setLandlordName] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentTenant = tenants.find(t => t.id === selectedTenant);
  const tenantMeters = meters.filter(m => m.tenant_id === selectedTenant);
  
  // Get bills for the selected period
  const electricityMeter = tenantMeters.find(m => m.type === 'electricity');
  const waterMeter = tenantMeters.find(m => m.type === 'water');
  
  const electricityBill = bills.find(b => 
    b.meter_id === electricityMeter?.id &&
    new Date(b.period_end).getMonth() + 1 === selectedMonth &&
    new Date(b.period_end).getFullYear() === selectedYear
  );
  
  const waterBill = bills.find(b => 
    b.meter_id === waterMeter?.id &&
    new Date(b.period_end).getMonth() + 1 === selectedMonth &&
    new Date(b.period_end).getFullYear() === selectedYear
  );

  const rentAmount = currentTenant?.monthly_rent || 0;
  const electricityAmount = electricityBill?.total_amount || 0;
  const waterAmount = waterBill?.total_amount || 0;
  const totalAmount = rentAmount + electricityAmount + waterAmount;

  const handlePrintAndSave = async () => {
    const printContent = receiptRef.current;
    if (!printContent || !currentTenant) return;

    setLoading(true);

    // Create income transaction
    if (onCreateTransaction && totalAmount > 0) {
      const description = `Thu tiền nhà T${selectedMonth}/${selectedYear} - ${currentTenant.name}${currentTenant.room_name ? ` (${currentTenant.room_name})` : ''}`;
      await onCreateTransaction(totalAmount, description);
      toast({
        title: 'Đã tạo giao dịch',
        description: `Thu tiền: ${formatCurrency(totalAmount)}`,
        duration: 3000,
      });
    }

    // Print
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Phiếu thu tiền - ${currentTenant?.name || 'Người thuê'}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 20px; max-width: 600px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; }
              .title { font-size: 18px; font-weight: bold; text-transform: uppercase; }
              .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #ccc; }
              .total { font-weight: bold; font-size: 16px; border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
              .signature { margin-top: 40px; display: flex; justify-content: space-between; }
              .sig-box { text-align: center; width: 45%; }
              .sig-line { margin-top: 60px; border-top: 1px solid #000; }
              .blank-line { border-bottom: 1px dotted #000; min-width: 150px; display: inline-block; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    setLoading(false);
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-4">
      {/* Form Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Xuất phiếu thu tiền
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Người thuê</Label>
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người thuê" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map(tenant => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name} {tenant.room_name && `(${tenant.room_name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Tháng</Label>
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m} value={m.toString()}>Tháng {m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Năm</Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Tên chủ nhà (ký tên)</Label>
            <Input
              value={landlordName}
              onChange={(e) => setLandlordName(e.target.value)}
              placeholder="VD: Nguyễn Văn B"
            />
          </div>

          <div>
            <Label>Ghi chú (nếu có)</Label>
            <Textarea
              value={receiptNotes}
              onChange={(e) => setReceiptNotes(e.target.value)}
              placeholder="VD: Đã thu đủ, còn nợ tháng trước..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Receipt Preview */}
      {currentTenant && (
        <Card>
          <CardContent className="p-4">
            <div ref={receiptRef} className="space-y-4 text-sm">
              <div className="header text-center">
                <p className="title text-lg font-bold">PHIẾU THU TIỀN NHÀ</p>
                <p className="text-muted-foreground">Tháng {selectedMonth}/{selectedYear}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Người thuê:</span>
                  <span className="font-medium">{currentTenant.name}</span>
                </div>
                {currentTenant.room_name && (
                  <div className="flex justify-between">
                    <span>Phòng:</span>
                    <span>{currentTenant.room_name}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>1. Tiền thuê nhà:</span>
                  <span className="font-mono">{formatCurrency(rentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Tiền điện ({electricityBill?.usage || 0} kWh):</span>
                  <span className="font-mono">{formatCurrency(electricityAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>3. Tiền nước ({waterBill?.usage || 0} m³):</span>
                  <span className="font-mono">{formatCurrency(waterAmount)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-bold">
                <span>TỔNG CỘNG:</span>
                <span className="font-mono text-primary">{formatCurrency(totalAmount)}</span>
              </div>

              <Separator />

              <div className="space-y-2 pt-2">
                <p>Ngày thu: <span className="blank-line border-b border-dotted border-foreground inline-block min-w-[100px]">&nbsp;</span></p>
                <p>Số tiền đã thu: <span className="blank-line border-b border-dotted border-foreground inline-block min-w-[150px]">&nbsp;</span></p>
              </div>

              {receiptNotes && (
                <>
                  <Separator />
                  <div className="pt-2">
                    <p className="font-medium text-sm">Ghi chú:</p>
                    <p className="text-sm italic">{receiptNotes}</p>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-8 pt-8 text-center">
                <div>
                  <p className="font-medium">Người thuê</p>
                  <p className="text-xs text-muted-foreground">(Ký, ghi rõ họ tên)</p>
                  <div className="h-16"></div>
                  <p className="border-t pt-1">{currentTenant.name}</p>
                </div>
                <div>
                  <p className="font-medium">Chủ nhà</p>
                  <p className="text-xs text-muted-foreground">(Ký, ghi rõ họ tên)</p>
                  <div className="h-16"></div>
                  <p className="border-t pt-1">{landlordName || '_______________'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                onClick={handlePrintAndSave} 
                className="flex-1"
                disabled={loading || totalAmount === 0}
              >
                {loading ? (
                  'Đang xử lý...'
                ) : (
                  <>
                    <Printer className="h-4 w-4 mr-2" />
                    In & Lưu giao dịch
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Nhấn In sẽ tự động tạo giao dịch thu tiền
            </p>
          </CardContent>
        </Card>
      )}

      {!selectedTenant && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Chọn người thuê để xem và in phiếu thu tiền</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
