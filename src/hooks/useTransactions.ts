import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Transaction, MonthSummary, DailyTransaction } from '@/types/finance';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';

export function useTransactions(selectedDate?: Date) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MonthSummary>({ income: 0, expense: 0, balance: 0 });

  const currentDate = selectedDate || new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setSummary({ income: 0, expense: 0, balance: 0 });
      setLoading(false);
    }
  }, [user, currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*),
          account:accounts!transactions_account_id_fkey(*),
          to_account:accounts!transactions_to_account_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString())
        .lte('date', monthEnd.toISOString())
        .order('date', { ascending: false });

      if (error) throw error;

      const typedData = (data || []) as Transaction[];
      setTransactions(typedData);

      // Calculate summary
      const income = typedData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = typedData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setSummary({
        income,
        expense,
        balance: income - expense,
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      return null;
    }

    // Update account balance
    if (transaction.type === 'income') {
      await updateAccountBalance(transaction.account_id, transaction.amount);
    } else if (transaction.type === 'expense') {
      await updateAccountBalance(transaction.account_id, -transaction.amount);
    } else if (transaction.type === 'transfer' && transaction.to_account_id) {
      await updateAccountBalance(transaction.account_id, -transaction.amount);
      await updateAccountBalance(transaction.to_account_id, transaction.amount);
    }

    fetchTransactions();
    return data;
  };

  const updateAccountBalance = async (accountId: string, amount: number) => {
    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single();

    if (account) {
      await supabase
        .from('accounts')
        .update({ balance: Number(account.balance) + amount })
        .eq('id', accountId);
    }
  };

  const deleteTransaction = async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return;
    }

    // Reverse the balance changes
    if (transaction.type === 'income') {
      await updateAccountBalance(transaction.account_id, -transaction.amount);
    } else if (transaction.type === 'expense') {
      await updateAccountBalance(transaction.account_id, transaction.amount);
    } else if (transaction.type === 'transfer' && transaction.to_account_id) {
      await updateAccountBalance(transaction.account_id, transaction.amount);
      await updateAccountBalance(transaction.to_account_id, -transaction.amount);
    }

    fetchTransactions();
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    const oldTransaction = transactions.find(t => t.id === id);
    if (!oldTransaction) return null;

    // Reverse old balance changes first
    if (oldTransaction.type === 'income') {
      await updateAccountBalance(oldTransaction.account_id, -oldTransaction.amount);
    } else if (oldTransaction.type === 'expense') {
      await updateAccountBalance(oldTransaction.account_id, oldTransaction.amount);
    } else if (oldTransaction.type === 'transfer' && oldTransaction.to_account_id) {
      await updateAccountBalance(oldTransaction.account_id, oldTransaction.amount);
      await updateAccountBalance(oldTransaction.to_account_id, -oldTransaction.amount);
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      // Restore old balance on error
      if (oldTransaction.type === 'income') {
        await updateAccountBalance(oldTransaction.account_id, oldTransaction.amount);
      } else if (oldTransaction.type === 'expense') {
        await updateAccountBalance(oldTransaction.account_id, -oldTransaction.amount);
      }
      return null;
    }

    // Apply new balance changes
    const newType = updates.type || oldTransaction.type;
    const newAmount = updates.amount !== undefined ? updates.amount : oldTransaction.amount;
    const newAccountId = updates.account_id || oldTransaction.account_id;
    const newToAccountId = updates.to_account_id || oldTransaction.to_account_id;

    if (newType === 'income') {
      await updateAccountBalance(newAccountId, newAmount);
    } else if (newType === 'expense') {
      await updateAccountBalance(newAccountId, -newAmount);
    } else if (newType === 'transfer' && newToAccountId) {
      await updateAccountBalance(newAccountId, -newAmount);
      await updateAccountBalance(newToAccountId, newAmount);
    }

    fetchTransactions();
    return data;
  };

  // Group transactions by date
  const groupedTransactions: DailyTransaction[] = transactions.reduce((groups, transaction) => {
    const date = format(parseISO(transaction.date), 'yyyy-MM-dd');
    const existingGroup = groups.find(g => g.date === date);

    if (existingGroup) {
      existingGroup.transactions.push(transaction);
      if (transaction.type === 'income') {
        existingGroup.income += Number(transaction.amount);
      } else if (transaction.type === 'expense') {
        existingGroup.expense += Number(transaction.amount);
      }
    } else {
      groups.push({
        date,
        income: transaction.type === 'income' ? Number(transaction.amount) : 0,
        expense: transaction.type === 'expense' ? Number(transaction.amount) : 0,
        transactions: [transaction],
      });
    }

    return groups;
  }, [] as DailyTransaction[]);

  return {
    transactions,
    groupedTransactions,
    summary,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}
