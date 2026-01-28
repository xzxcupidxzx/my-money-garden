import { useState } from 'react';
import { HeaderDashboard } from '@/components/HeaderDashboard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { TransactionEditDialog } from '@/components/TransactionEditDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Search, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfMonth, endOfMonth, startOfDay, endOfDay, startOfYear, endOfYear } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/types/finance';
import { DateRangeFilter, TimeframeType } from '@/components/statistics/DateRangeFilter';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const now = new Date();
  const [timeframe, setTimeframe] = useState<TimeframeType>('month');
  const [startDate, setStartDate] = useState(startOfMonth(now));
  const [endDate, setEndDate] = useState(endOfMonth(now));
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  const { 
    groupedTransactions, 
    summary, 
    loading: transLoading, 
    addTransaction, 
    updateTransaction,
    deleteTransaction 
  } = useTransactions(startDate, endDate);
  const { categories, loading: catLoading } = useCategories();
  const { accounts, loading: accLoading } = useAccounts();

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  const loading = authLoading || transLoading || catLoading || accLoading;

  // Filter transactions by search
  const filteredTransactions = searchQuery
    ? groupedTransactions.map(group => ({
        ...group,
        transactions: group.transactions.filter(t =>
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.amount.toString().includes(searchQuery)
        ),
      })).filter(g => g.transactions.length > 0)
    : groupedTransactions;

  const handleAddTransaction = async (data: Parameters<typeof addTransaction>[0]) => {
    const result = await addTransaction(data);
    if (result) {
      setShowForm(false);
      toast({
        title: 'Thành công!',
        description: 'Giao dịch đã được thêm.',
      });
    }
  };

  const handleEditTransaction = async (id: string, updates: Partial<Transaction>) => {
    const result = await updateTransaction(id, updates);
    if (result) {
      setEditingTransaction(null);
      toast({
        title: 'Thành công!',
        description: 'Giao dịch đã được cập nhật.',
      });
    }
    return result;
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    toast({
      title: 'Đã xóa!',
      description: 'Giao dịch đã được xóa.',
    });
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h1 className="text-2xl font-bold">Giao dịch</h1>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Header Dashboard */}
      <HeaderDashboard summary={summary} month={startDate} />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm giao dịch..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Transaction List */}
      <TransactionList
        groupedTransactions={filteredTransactions}
        onDelete={handleDeleteTransaction}
        onEdit={setEditingTransaction}
      />

      {/* Edit Transaction Dialog */}
      <TransactionEditDialog
        transaction={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        categories={categories}
        accounts={accounts}
        onSave={handleEditTransaction}
      />

      {/* Add Transaction Button */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-40"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-2xl p-0 bg-background/98 backdrop-blur-md">
          <div className="px-3 py-2 border-b border-border/50 bg-background/80">
            <SheetHeader>
              <SheetTitle className="text-sm">Thêm giao dịch</SheetTitle>
            </SheetHeader>
          </div>
          <div className="px-3 py-2">
            <TransactionForm
              categories={categories}
              accounts={accounts}
              onSubmit={handleAddTransaction}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
