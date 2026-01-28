import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format } from 'date-fns';

interface BackupData {
  version: string;
  timestamp: string;
  userId: string;
  data: {
    accounts: unknown[];
    categories: unknown[];
    transactions: unknown[];
    budgets: unknown[];
    installments: unknown[];
    recurringTransactions: unknown[];
    reconciliations: unknown[];
  };
}

interface SaveSlot {
  id: string;
  name: string;
  timestamp: string;
  size: number;
}

const STORAGE_KEY = 'finance_tracker_saves';
const MAX_SAVES = 20;

export function useDataBackup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Get all saves from localStorage
  const getSaveSlots = (): SaveSlot[] => {
    try {
      const saves = localStorage.getItem(STORAGE_KEY);
      if (!saves) return [];
      const parsed = JSON.parse(saves);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Save to localStorage
  const saveToLocal = async (name?: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      // Fetch all user data
      const [
        { data: accounts },
        { data: categories },
        { data: transactions },
        { data: budgets },
        { data: installments },
        { data: recurringTransactions },
        { data: reconciliations },
      ] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('budgets').select('*').eq('user_id', user.id),
        supabase.from('installments').select('*').eq('user_id', user.id),
        supabase.from('recurring_transactions').select('*').eq('user_id', user.id),
        supabase.from('reconciliations').select('*').eq('user_id', user.id),
      ]);

      const timestamp = new Date().toISOString();
      const saveName = name || format(new Date(), 'yyyy-MM-dd HH:mm:ss');

      const backupData: BackupData = {
        version: '1.0',
        timestamp,
        userId: user.id,
        data: {
          accounts: accounts || [],
          categories: categories || [],
          transactions: transactions || [],
          budgets: budgets || [],
          installments: installments || [],
          recurringTransactions: recurringTransactions || [],
          reconciliations: reconciliations || [],
        },
      };

      // Store the backup data
      const dataString = JSON.stringify(backupData);
      localStorage.setItem(`${STORAGE_KEY}_${timestamp}`, dataString);

      // Update save slots list
      const slots = getSaveSlots();
      const newSlot: SaveSlot = {
        id: timestamp,
        name: saveName,
        timestamp,
        size: dataString.length,
      };

      slots.unshift(newSlot);
      
      // Keep only MAX_SAVES
      while (slots.length > MAX_SAVES) {
        const removed = slots.pop();
        if (removed) {
          localStorage.removeItem(`${STORAGE_KEY}_${removed.id}`);
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
      return true;
    } catch (error) {
      console.error('Error saving to local:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load from localStorage
  const loadFromLocal = async (slotId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const dataString = localStorage.getItem(`${STORAGE_KEY}_${slotId}`);
      if (!dataString) return false;

      const backupData: BackupData = JSON.parse(dataString);

      // Verify user
      if (backupData.userId !== user.id) {
        console.error('User mismatch');
        return false;
      }

      // Clear existing data and restore
      await Promise.all([
        supabase.from('transactions').delete().eq('user_id', user.id),
        supabase.from('budgets').delete().eq('user_id', user.id),
        supabase.from('installments').delete().eq('user_id', user.id),
        supabase.from('recurring_transactions').delete().eq('user_id', user.id),
        supabase.from('reconciliations').delete().eq('user_id', user.id),
      ]);

      // Wait a moment for deletes to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear accounts and categories (in order due to FK)
      await supabase.from('accounts').delete().eq('user_id', user.id);
      await supabase.from('categories').delete().eq('user_id', user.id);

      // Restore data
      if (backupData.data.categories?.length) {
        await supabase.from('categories').insert(backupData.data.categories as never[]);
      }
      if (backupData.data.accounts?.length) {
        await supabase.from('accounts').insert(backupData.data.accounts as never[]);
      }
      if (backupData.data.transactions?.length) {
        await supabase.from('transactions').insert(backupData.data.transactions as never[]);
      }
      if (backupData.data.budgets?.length) {
        await supabase.from('budgets').insert(backupData.data.budgets as never[]);
      }
      if (backupData.data.installments?.length) {
        await supabase.from('installments').insert(backupData.data.installments as never[]);
      }
      if (backupData.data.recurringTransactions?.length) {
        await supabase.from('recurring_transactions').insert(backupData.data.recurringTransactions as never[]);
      }
      if (backupData.data.reconciliations?.length) {
        await supabase.from('reconciliations').insert(backupData.data.reconciliations as never[]);
      }

      return true;
    } catch (error) {
      console.error('Error loading from local:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a save slot
  const deleteSaveSlot = (slotId: string): boolean => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${slotId}`);
      const slots = getSaveSlots().filter(s => s.id !== slotId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
      return true;
    } catch {
      return false;
    }
  };

  // Download as JSON file
  const downloadBackup = async (): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const [
        { data: accounts },
        { data: categories },
        { data: transactions },
        { data: budgets },
        { data: installments },
        { data: recurringTransactions },
        { data: reconciliations },
      ] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('budgets').select('*').eq('user_id', user.id),
        supabase.from('installments').select('*').eq('user_id', user.id),
        supabase.from('recurring_transactions').select('*').eq('user_id', user.id),
        supabase.from('reconciliations').select('*').eq('user_id', user.id),
      ]);

      const backupData: BackupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        userId: user.id,
        data: {
          accounts: accounts || [],
          categories: categories || [],
          transactions: transactions || [],
          budgets: budgets || [],
          installments: installments || [],
          recurringTransactions: recurringTransactions || [],
          reconciliations: reconciliations || [],
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance_backup_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading backup:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload and restore from JSON file
  const uploadBackup = async (file: File): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);

      // Validate structure
      if (!backupData.version || !backupData.data) {
        throw new Error('Invalid backup file');
      }

      // Clear existing data and restore
      await Promise.all([
        supabase.from('transactions').delete().eq('user_id', user.id),
        supabase.from('budgets').delete().eq('user_id', user.id),
        supabase.from('installments').delete().eq('user_id', user.id),
        supabase.from('recurring_transactions').delete().eq('user_id', user.id),
        supabase.from('reconciliations').delete().eq('user_id', user.id),
      ]);

      await new Promise(resolve => setTimeout(resolve, 500));

      await supabase.from('accounts').delete().eq('user_id', user.id);
      await supabase.from('categories').delete().eq('user_id', user.id);

      // Update user_id in all records
      const updateUserId = (arr: unknown[]): unknown[] => {
        return arr.map((item: unknown) => ({
          ...(item as Record<string, unknown>),
          user_id: user.id,
        }));
      };

      // Restore data with updated user_id
      if (backupData.data.categories?.length) {
        await supabase.from('categories').insert(updateUserId(backupData.data.categories) as never[]);
      }
      if (backupData.data.accounts?.length) {
        await supabase.from('accounts').insert(updateUserId(backupData.data.accounts) as never[]);
      }
      if (backupData.data.transactions?.length) {
        await supabase.from('transactions').insert(updateUserId(backupData.data.transactions) as never[]);
      }
      if (backupData.data.budgets?.length) {
        await supabase.from('budgets').insert(updateUserId(backupData.data.budgets) as never[]);
      }
      if (backupData.data.installments?.length) {
        await supabase.from('installments').insert(updateUserId(backupData.data.installments) as never[]);
      }
      if (backupData.data.recurringTransactions?.length) {
        await supabase.from('recurring_transactions').insert(updateUserId(backupData.data.recurringTransactions) as never[]);
      }
      if (backupData.data.reconciliations?.length) {
        await supabase.from('reconciliations').insert(updateUserId(backupData.data.reconciliations) as never[]);
      }

      return true;
    } catch (error) {
      console.error('Error uploading backup:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getSaveSlots,
    saveToLocal,
    loadFromLocal,
    deleteSaveSlot,
    downloadBackup,
    uploadBackup,
  };
}
