import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Budget, Category, Transaction } from '@/types/finance';

export interface BudgetWithSpent extends Budget {
  spent: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
}

export function useBudgets(selectedDate?: Date) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = selectedDate || new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setBudgets([]);
      setCategories([]);
      setTransactions([]);
      setLoading(false);
    }
  }, [user, currentMonth, currentYear]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch budgets for current month
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (budgetError) throw budgetError;

      // Fetch expense categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense');

      if (catError) throw catError;

      // Fetch transactions for current month
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startOfMonth.toISOString())
        .lte('date', endOfMonth.toISOString());

      if (transError) throw transError;

      setBudgets(budgetData as Budget[]);
      setCategories(catData as Category[]);
      setTransactions(transData as Transaction[]);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate spent amounts per category
  const budgetsWithSpent: BudgetWithSpent[] = useMemo(() => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.category_id === budget.category_id)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const percentage = budget.amount > 0 ? (spent / Number(budget.amount)) * 100 : 0;
      
      let status: 'safe' | 'warning' | 'danger' = 'safe';
      if (percentage >= 100) {
        status = 'danger';
      } else if (percentage >= 80) {
        status = 'warning';
      }

      return {
        ...budget,
        spent,
        percentage,
        status,
      };
    });
  }, [budgets, transactions]);

  // Categories without budgets
  const categoriesWithoutBudget = useMemo(() => {
    const budgetedCategoryIds = budgets.map(b => b.category_id);
    return categories.filter(c => !budgetedCategoryIds.includes(c.id));
  }, [categories, budgets]);

  const addBudget = async (categoryId: string, amount: number) => {
    if (!user) return null;

    // Check if budget exists for this category/month
    const existing = budgets.find(b => b.category_id === categoryId);
    if (existing) {
      return updateBudget(existing.id, amount);
    }

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id: categoryId,
        amount,
        month: currentMonth,
        year: currentYear,
      })
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (error) {
      console.error('Error adding budget:', error);
      return null;
    }

    fetchData();
    return data;
  };

  const updateBudget = async (id: string, amount: number) => {
    const { error } = await supabase
      .from('budgets')
      .update({ amount })
      .eq('id', id);

    if (error) {
      console.error('Error updating budget:', error);
      return false;
    }

    fetchData();
    return true;
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting budget:', error);
      return false;
    }

    fetchData();
    return true;
  };

  // Summary
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0);
  const overBudgetCount = budgetsWithSpent.filter(b => b.status === 'danger').length;

  return {
    budgets: budgetsWithSpent,
    categories,
    categoriesWithoutBudget,
    loading,
    totalBudget,
    totalSpent,
    overBudgetCount,
    addBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchData,
  };
}
