import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Account } from '@/types/finance';

export function useAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAccounts((data || []) as Account[]);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        ...account,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding account:', error);
      return null;
    }

    fetchAccounts();
    return data;
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const { error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating account:', error);
      return false;
    }

    fetchAccounts();
    return true;
  };

  const deleteAccount = async (id: string) => {
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting account:', error);
      return false;
    }

    fetchAccounts();
    return true;
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  return {
    accounts,
    loading,
    totalBalance,
    addAccount,
    updateAccount,
    deleteAccount,
    refetch: fetchAccounts,
  };
}
