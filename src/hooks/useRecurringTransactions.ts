import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { RecurringTransaction, RecurrenceType } from '@/types/finance';
import { addDays, addWeeks, addMonths, addYears, isToday, isBefore, startOfDay } from 'date-fns';

export function useRecurringTransactions() {
  const { user } = useAuth();
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecurringTransactions();
    } else {
      setRecurringTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchRecurringTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select(`
          *,
          category:categories(*),
          account:accounts!recurring_transactions_account_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .order('next_date', { ascending: true });

      if (error) throw error;
      setRecurringTransactions(data as RecurringTransaction[]);
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextDate = (currentDate: Date, recurrence: RecurrenceType): Date => {
    switch (recurrence) {
      case 'daily':
        return addDays(currentDate, 1);
      case 'weekly':
        return addWeeks(currentDate, 1);
      case 'monthly':
        return addMonths(currentDate, 1);
      case 'yearly':
        return addYears(currentDate, 1);
      default:
        return addMonths(currentDate, 1);
    }
  };

  const addRecurringTransaction = async (data: {
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    category_id: string | null;
    account_id: string;
    to_account_id?: string | null;
    description: string | null;
    recurrence: RecurrenceType;
    next_date: string;
  }) => {
    if (!user) return null;

    const { data: recurring, error } = await supabase
      .from('recurring_transactions')
      .insert({
        ...data,
        user_id: user.id,
        to_account_id: data.to_account_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding recurring transaction:', error);
      return null;
    }

    fetchRecurringTransactions();
    return recurring;
  };

  const updateRecurringTransaction = async (id: string, data: Partial<RecurringTransaction>) => {
    const { error } = await supabase
      .from('recurring_transactions')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error updating recurring transaction:', error);
      return false;
    }

    fetchRecurringTransactions();
    return true;
  };

  const deleteRecurringTransaction = async (id: string) => {
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recurring transaction:', error);
      return false;
    }

    fetchRecurringTransactions();
    return true;
  };

  // Process due recurring transactions
  const processDueTransactions = async () => {
    if (!user) return [];

    const today = startOfDay(new Date());
    const dueTransactions = recurringTransactions.filter(rt => {
      const nextDate = startOfDay(new Date(rt.next_date));
      return rt.is_active && (isToday(nextDate) || isBefore(nextDate, today));
    });

    const createdTransactions: any[] = [];

    for (const rt of dueTransactions) {
      // Create the actual transaction
      const { data: transaction, error: transError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: rt.type,
          amount: rt.amount,
          category_id: rt.category_id,
          account_id: rt.account_id,
          to_account_id: rt.to_account_id,
          description: rt.description,
          date: rt.next_date,
          is_recurring: true,
          recurring_id: rt.id,
        })
        .select()
        .single();

      if (transError) {
        console.error('Error creating transaction from recurring:', transError);
        continue;
      }

      createdTransactions.push(transaction);

      // Update account balance
      if (rt.type === 'income') {
        await updateAccountBalance(rt.account_id, Number(rt.amount));
      } else if (rt.type === 'expense') {
        await updateAccountBalance(rt.account_id, -Number(rt.amount));
      } else if (rt.type === 'transfer' && rt.to_account_id) {
        await updateAccountBalance(rt.account_id, -Number(rt.amount));
        await updateAccountBalance(rt.to_account_id, Number(rt.amount));
      }

      // Calculate and update next_date
      const nextDate = calculateNextDate(new Date(rt.next_date), rt.recurrence);
      await supabase
        .from('recurring_transactions')
        .update({
          next_date: nextDate.toISOString().split('T')[0],
          last_generated: new Date().toISOString().split('T')[0],
        })
        .eq('id', rt.id);
    }

    if (createdTransactions.length > 0) {
      fetchRecurringTransactions();
    }

    return createdTransactions;
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

  const activeRecurring = recurringTransactions.filter(rt => rt.is_active);
  const upcomingThisWeek = recurringTransactions.filter(rt => {
    const nextDate = new Date(rt.next_date);
    const weekFromNow = addDays(new Date(), 7);
    return rt.is_active && isBefore(nextDate, weekFromNow);
  });

  return {
    recurringTransactions,
    activeRecurring,
    upcomingThisWeek,
    loading,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    processDueTransactions,
    calculateNextDate,
    refetch: fetchRecurringTransactions,
  };
}
