import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface LegacyTransaction {
  id: string;
  datetime: string;
  type: 'Chi' | 'Thu';
  category: string;
  amount: number;
  account: string;
  description: string;
  originalAmount: number;
  originalCurrency: string;
  isTransfer: boolean;
  transferPairId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LegacyCategory {
  value: string;
  text: string;
  icon?: string | null;
  createdAt: string;
  createdBy: string;
  system?: boolean;
}

interface LegacyAccount {
  value: string;
  text: string;
  icon?: string | null;
  createdAt: string;
  createdBy: string;
  system?: boolean;
}

interface LegacyData {
  financial_transactions_v2?: LegacyTransaction[];
  financial_expense_categories_v2?: LegacyCategory[];
  financial_income_categories_v2?: LegacyCategory[];
  financial_accounts_v2?: LegacyAccount[];
}

// Map old icon names to lucide-react icons
const mapIcon = (oldIcon: string | null | undefined): string => {
  if (!oldIcon) return 'Circle';
  // Remove data:image prefix if exists
  if (oldIcon.startsWith('data:')) return 'Circle';
  return oldIcon;
};

export function useLegacyImport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });

  const importLegacyData = async (file: File): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Vui lòng đăng nhập' };

    setLoading(true);
    setProgress({ current: 0, total: 0, status: 'Đang đọc file...' });

    try {
      const text = await file.text();
      const legacyData: LegacyData = JSON.parse(text);

      // Validate structure
      if (!legacyData.financial_transactions_v2) {
        throw new Error('File không đúng định dạng: thiếu financial_transactions_v2');
      }

      const transactions = legacyData.financial_transactions_v2 || [];
      const expenseCategories = legacyData.financial_expense_categories_v2 || [];
      const incomeCategories = legacyData.financial_income_categories_v2 || [];
      const accounts = legacyData.financial_accounts_v2 || [];

      setProgress({ current: 0, total: 4, status: 'Đang xóa dữ liệu cũ...' });

      // Clear existing data
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

      setProgress({ current: 1, total: 4, status: 'Đang import danh mục...' });

      // Create categories map
      const categoryMap = new Map<string, string>();
      
      // Import expense categories
      for (const cat of expenseCategories) {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: cat.value || cat.text,
            type: 'expense' as const,
            icon: mapIcon(cat.icon),
            color: getColorForCategory(cat.value || cat.text),
            is_system: cat.system || false,
          })
          .select()
          .single();
        
        if (data && !error) {
          categoryMap.set(cat.value || cat.text, data.id);
        }
      }

      // Import income categories
      for (const cat of incomeCategories) {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: cat.value || cat.text,
            type: 'income' as const,
            icon: mapIcon(cat.icon),
            color: getColorForCategory(cat.value || cat.text),
            is_system: cat.system || false,
          })
          .select()
          .single();
        
        if (data && !error) {
          categoryMap.set(cat.value || cat.text, data.id);
        }
      }

      setProgress({ current: 2, total: 4, status: 'Đang import tài khoản...' });

      // Create accounts map
      const accountMap = new Map<string, string>();
      
      for (const acc of accounts) {
        const { data, error } = await supabase
          .from('accounts')
          .insert({
            user_id: user.id,
            name: acc.value || acc.text,
            type: 'cash',
            balance: 0,
            currency: 'VND',
            icon: mapIcon(acc.icon),
            is_active: true,
          })
          .select()
          .single();
        
        if (data && !error) {
          accountMap.set(acc.value || acc.text, data.id);
        }
      }

      // Create accounts from transactions if not exists
      const uniqueAccounts = [...new Set(transactions.map(t => t.account))];
      for (const accName of uniqueAccounts) {
        if (!accountMap.has(accName)) {
          const { data, error } = await supabase
            .from('accounts')
            .insert({
              user_id: user.id,
              name: accName,
              type: 'cash',
              balance: 0,
              currency: 'VND',
              is_active: true,
            })
            .select()
            .single();
          
          if (data && !error) {
            accountMap.set(accName, data.id);
          }
        }
      }

      setProgress({ current: 3, total: 4, status: 'Đang import giao dịch...' });

      // Filter out transfer pairs and keep only unique transactions
      const processedPairs = new Set<string>();
      const transactionsToImport: Array<{
        user_id: string;
        type: 'income' | 'expense' | 'transfer';
        amount: number;
        category_id: string | null;
        account_id: string;
        to_account_id: string | null;
        description: string | null;
        date: string;
        is_recurring: boolean;
      }> = [];

      for (const tx of transactions) {
        // Skip if this is a transfer that we already processed
        if (tx.isTransfer && tx.transferPairId && processedPairs.has(tx.transferPairId)) {
          continue;
        }

        const accountId = accountMap.get(tx.account);
        if (!accountId) continue;

        if (tx.isTransfer && tx.transferPairId) {
          // Find the pair
          const pair = transactions.find(t => t.id === tx.transferPairId);
          if (pair) {
            processedPairs.add(tx.id);
            processedPairs.add(pair.id);
            
            // Determine from/to accounts
            const fromTx = tx.type === 'Chi' ? tx : pair;
            const toTx = tx.type === 'Thu' ? tx : pair;
            
            const fromAccountId = accountMap.get(fromTx.account);
            const toAccountId = accountMap.get(toTx.account);
            
            if (fromAccountId && toAccountId) {
              transactionsToImport.push({
                user_id: user.id,
                type: 'transfer',
                amount: fromTx.amount,
                category_id: null,
                account_id: fromAccountId,
                to_account_id: toAccountId,
                description: fromTx.description || null,
                date: parseDateTime(fromTx.datetime),
                is_recurring: false,
              });
            }
          }
        } else {
          // Regular transaction
          const type = tx.type === 'Chi' ? 'expense' : 'income';
          const categoryId = categoryMap.get(tx.category) || null;
          
          transactionsToImport.push({
            user_id: user.id,
            type,
            amount: tx.amount,
            category_id: categoryId,
            account_id: accountId,
            to_account_id: null,
            description: tx.description || null,
            date: parseDateTime(tx.datetime),
            is_recurring: false,
          });
        }
      }

      // Batch insert transactions
      const batchSize = 100;
      for (let i = 0; i < transactionsToImport.length; i += batchSize) {
        const batch = transactionsToImport.slice(i, i + batchSize);
        const { error } = await supabase.from('transactions').insert(batch);
        if (error) {
          console.error('Error inserting batch:', error);
        }
      }

      // Update account balances
      setProgress({ current: 4, total: 4, status: 'Đang cập nhật số dư...' });
      
      for (const [accountName, accountId] of accountMap) {
        // Calculate balance from transactions
        const { data: accountTxs } = await supabase
          .from('transactions')
          .select('type, amount, account_id, to_account_id')
          .eq('user_id', user.id)
          .or(`account_id.eq.${accountId},to_account_id.eq.${accountId}`);

        if (accountTxs) {
          let balance = 0;
          for (const tx of accountTxs) {
            if (tx.type === 'income' && tx.account_id === accountId) {
              balance += Number(tx.amount);
            } else if (tx.type === 'expense' && tx.account_id === accountId) {
              balance -= Number(tx.amount);
            } else if (tx.type === 'transfer') {
              if (tx.account_id === accountId) {
                balance -= Number(tx.amount);
              } else if (tx.to_account_id === accountId) {
                balance += Number(tx.amount);
              }
            }
          }
          
          await supabase
            .from('accounts')
            .update({ balance })
            .eq('id', accountId);
        }
      }

      setLoading(false);
      return { 
        success: true, 
        message: `Import thành công! ${transactionsToImport.length} giao dịch, ${categoryMap.size} danh mục, ${accountMap.size} tài khoản.` 
      };

    } catch (error) {
      console.error('Error importing legacy data:', error);
      setLoading(false);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Lỗi không xác định' 
      };
    }
  };

  // Import only categories from legacy file (no delete existing data)
  const importCategoriesOnly = async (file: File): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Vui lòng đăng nhập' };

    setLoading(true);
    setProgress({ current: 0, total: 2, status: 'Đang đọc file...' });

    try {
      const text = await file.text();
      const legacyData: LegacyData = JSON.parse(text);

      const expenseCategories = legacyData.financial_expense_categories_v2 || [];
      const incomeCategories = legacyData.financial_income_categories_v2 || [];

      if (expenseCategories.length === 0 && incomeCategories.length === 0) {
        throw new Error('Không tìm thấy danh mục trong file');
      }

      // Get existing categories
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('name, type')
        .eq('user_id', user.id);

      const existingSet = new Set(
        (existingCategories || []).map(c => `${c.name}-${c.type}`)
      );

      setProgress({ current: 1, total: 2, status: 'Đang import danh mục chi...' });

      let importedCount = 0;
      let skippedCount = 0;

      // Import expense categories
      for (const cat of expenseCategories) {
        const name = cat.value || cat.text;
        const key = `${name}-expense`;
        
        if (existingSet.has(key)) {
          skippedCount++;
          continue;
        }

        const { error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name,
            type: 'expense' as const,
            icon: mapIcon(cat.icon),
            color: getColorForCategory(name),
            is_system: cat.system || false,
          });
        
        if (!error) {
          importedCount++;
          existingSet.add(key);
        }
      }

      setProgress({ current: 2, total: 2, status: 'Đang import danh mục thu...' });

      // Import income categories
      for (const cat of incomeCategories) {
        const name = cat.value || cat.text;
        const key = `${name}-income`;
        
        if (existingSet.has(key)) {
          skippedCount++;
          continue;
        }

        const { error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name,
            type: 'income' as const,
            icon: mapIcon(cat.icon),
            color: getColorForCategory(name),
            is_system: cat.system || false,
          });
        
        if (!error) {
          importedCount++;
          existingSet.add(key);
        }
      }

      setLoading(false);
      return { 
        success: true, 
        message: `Import thành công! ${importedCount} danh mục mới${skippedCount > 0 ? `, bỏ qua ${skippedCount} danh mục đã tồn tại` : ''}.` 
      };

    } catch (error) {
      console.error('Error importing categories:', error);
      setLoading(false);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Lỗi không xác định' 
      };
    }
  };

  return {
    loading,
    progress,
    importLegacyData,
    importCategoriesOnly,
  };
}

function parseDateTime(datetime: string): string {
  // Handle formats like "2025-11-17T19:44" or "2025-11-11T12:00:00"
  try {
    const date = new Date(datetime);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function getColorForCategory(name: string): string {
  const colors: Record<string, string> = {
    'Ăn uống': '#ef4444',
    'Đi lại và xăng xe': '#f97316',
    'Giải trí - xã hội': '#a855f7',
    'Mua sắm': '#eab308',
    'Sức khỏe - thể hình': '#ec4899',
    'Lương': '#22c55e',
    'Thưởng': '#22c55e',
    'Đầu tư': '#14b8a6',
    'Thức Ăn Pet': '#f97316',
    'Học tập': '#3b82f6',
    'Hóa đơn': '#6366f1',
  };
  
  return colors[name] || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
}
