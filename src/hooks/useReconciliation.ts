import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Reconciliation {
  id: string;
  user_id: string;
  account_id: string;
  reconciliation_date: string;
  system_balance: number;
  actual_balance: number;
  difference: number;
  adjustment_transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  account?: {
    name: string;
  };
}

export function useReconciliation() {
  const { user } = useAuth();
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReconciliations();
    } else {
      setReconciliations([]);
      setLoading(false);
    }
  }, [user]);

  const fetchReconciliations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reconciliations')
        .select(`
          *,
          account:accounts(name)
        `)
        .eq('user_id', user.id)
        .order('reconciliation_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReconciliations((data || []) as Reconciliation[]);
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
    } finally {
      setLoading(false);
    }
  };

  const reconcileAccount = async (
    accountId: string,
    systemBalance: number,
    actualBalance: number,
    categoryId?: string,
    notes?: string
  ) => {
    if (!user) return null;

    const difference = actualBalance - systemBalance;

    try {
      // Create adjustment transaction if there's a difference
      let adjustmentTransactionId: string | null = null;

      if (difference !== 0) {
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: difference > 0 ? 'income' : 'expense',
            amount: Math.abs(difference),
            account_id: accountId,
            category_id: categoryId || null,
            description: `Điều chỉnh đối soát: ${difference > 0 ? '+' : ''}${difference.toLocaleString()} VND`,
            date: new Date().toISOString(),
            is_recurring: false,
          })
          .select()
          .single();

        if (transactionError) throw transactionError;
        adjustmentTransactionId = transactionData.id;

        // Update account balance
        await supabase
          .from('accounts')
          .update({ balance: actualBalance })
          .eq('id', accountId);
      }

      // Create reconciliation record
      const { data, error } = await supabase
        .from('reconciliations')
        .insert({
          user_id: user.id,
          account_id: accountId,
          system_balance: systemBalance,
          actual_balance: actualBalance,
          difference,
          adjustment_transaction_id: adjustmentTransactionId,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      fetchReconciliations();
      return data;
    } catch (error) {
      console.error('Error reconciling account:', error);
      return null;
    }
  };

  return {
    reconciliations,
    loading,
    reconcileAccount,
    refetch: fetchReconciliations,
  };
}
