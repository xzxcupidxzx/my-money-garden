import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUtilities } from '@/hooks/useUtilities';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Users, Calculator, FileText, Zap, Home } from 'lucide-react';
import { TenantManagement } from '@/components/utilities/TenantManagement';
import { MainMeterManagement } from '@/components/utilities/MainMeterManagement';
import { PriceSettings } from '@/components/utilities/PriceSettings';
import { BillCalculator } from '@/components/utilities/BillCalculator';
import { ReceiptExport } from '@/components/utilities/ReceiptExport';
import { BillHistory } from '@/components/utilities/BillHistory';

export default function UtilitiesPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    tenants,
    meters,
    bills,
    priceSettings,
    rentPayments,
    loading,
    addTenant,
    updateTenant,
    deleteTenant,
    addMeter,
    updateMeter,
    deleteMeter,
    addBill,
    updateBill,
    deleteBill,
    savePriceSettings,
    getElectricityTiers,
    getWaterPrice,
    getVatPercent,
    getLastReading,
  } = useUtilities();
  const { addTransaction } = useTransactions(new Date(), new Date());
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { toast } = useToast();

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

  // Create income transaction for rent collection
  const handleCreateIncomeTransaction = async (amount: number, description: string) => {
    const incomeCategory = categories.find(c =>
      c.type === 'income' &&
      (c.name.toLowerCase().includes('thuê') || c.name.toLowerCase().includes('nhà') || c.name.toLowerCase().includes('thu nhập'))
    );
    const defaultAccount = accounts[0];

    if (defaultAccount) {
      await addTransaction({
        type: 'income',
        amount: amount,
        category_id: incomeCategory?.id || null,
        account_id: defaultAccount.id,
        to_account_id: null,
        description: description,
        date: new Date().toISOString(),
        is_recurring: false,
        recurring_id: null,
      });
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h1 className="text-2xl font-bold">Quản lý Điện Nước</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tenants">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="tenants" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Người thuê</span>
          </TabsTrigger>
          <TabsTrigger value="main-meters" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">ĐH Chính</span>
          </TabsTrigger>
          <TabsTrigger value="calculate" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Ghi số</span>
          </TabsTrigger>
          <TabsTrigger value="prices" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Giá</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex flex-col items-center gap-1 py-2 text-xs">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Phiếu thu</span>
          </TabsTrigger>
        </TabsList>

        {/* Tenants Tab */}
        <TabsContent value="tenants">
          <TenantManagement
            tenants={tenants}
            meters={meters}
            bills={bills}
            onAddTenant={addTenant}
            onUpdateTenant={updateTenant}
            onDeleteTenant={deleteTenant}
            onAddMeter={addMeter}
            getLastReading={getLastReading}
          />
        </TabsContent>

        {/* Main Meters Tab */}
        <TabsContent value="main-meters">
          <MainMeterManagement
            meters={meters}
            getLastReading={getLastReading}
            onAddMeter={addMeter}
            onUpdateMeter={updateMeter}
            onDeleteMeter={deleteMeter}
          />
        </TabsContent>

        {/* Calculate Tab */}
        <TabsContent value="calculate" className="space-y-4">
          <BillCalculator
            meters={meters}
            tenants={tenants}
            getLastReading={getLastReading}
            getElectricityTiers={getElectricityTiers}
            getWaterPrice={getWaterPrice}
            getVatPercent={getVatPercent}
            onAddBill={addBill}
          />
          <BillHistory
            bills={bills}
            meters={meters}
            tenants={tenants}
            onDeleteBill={deleteBill}
            onUpdateBill={updateBill}
          />
        </TabsContent>

        {/* Prices Tab */}
        <TabsContent value="prices">
          <PriceSettings
            priceSettings={priceSettings}
            onSave={savePriceSettings}
          />
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export">
          <ReceiptExport
            tenants={tenants}
            meters={meters}
            bills={bills}
            rentPayments={rentPayments}
            onCreateTransaction={handleCreateIncomeTransaction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
