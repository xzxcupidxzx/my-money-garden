import { useState } from 'react';
import { HeaderDashboard } from '@/components/HeaderDashboard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { format, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const { groupedTransactions, summary, loading: transLoading, addTransaction, deleteTransaction } = useTransactions(selectedDate);
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

  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

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
    <div className="p-4 space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold capitalize">
          {format(selectedDate, 'MMMM yyyy', { locale: vi })}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Header Dashboard */}
      <HeaderDashboard summary={summary} month={selectedDate} />

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
        onDelete={deleteTransaction}
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
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Thêm giao dịch mới</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto max-h-[calc(90vh-80px)]">
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
