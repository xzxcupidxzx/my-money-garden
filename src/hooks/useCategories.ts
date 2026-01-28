import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Category, TransactionType } from '@/types/finance';

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  // Income categories
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#22c55e', parent_id: null, is_system: true },
  { name: 'Bonus', type: 'income', icon: 'Gift', color: '#10b981', parent_id: null, is_system: true },
  { name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#14b8a6', parent_id: null, is_system: true },
  { name: 'Other Income', type: 'income', icon: 'Plus', color: '#06b6d4', parent_id: null, is_system: true },
  // Expense categories
  { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#ef4444', parent_id: null, is_system: true },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: '#f97316', parent_id: null, is_system: true },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#eab308', parent_id: null, is_system: true },
  { name: 'Entertainment', type: 'expense', icon: 'Gamepad2', color: '#a855f7', parent_id: null, is_system: true },
  { name: 'Bills & Utilities', type: 'expense', icon: 'Receipt', color: '#6366f1', parent_id: null, is_system: true },
  { name: 'Health', type: 'expense', icon: 'Heart', color: '#ec4899', parent_id: null, is_system: true },
  { name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#3b82f6', parent_id: null, is_system: true },
  { name: 'Other Expense', type: 'expense', icon: 'MoreHorizontal', color: '#64748b', parent_id: null, is_system: true },
];

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCategories();
    } else {
      setCategories([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      // If no categories exist, create default ones
      if (!data || data.length === 0) {
        await createDefaultCategories();
        return;
      }

      setCategories((data || []) as Category[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    if (!user) return;

    const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select();

    if (error) {
      console.error('Error creating default categories:', error);
      return;
    }

    setCategories((data || []) as Category[]);
    setLoading(false);
  };

  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...category,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      return null;
    }

    fetchCategories();
    return data;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
      return false;
    }

    fetchCategories();
    return true;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }

    fetchCategories();
    return true;
  };

  const getCategoriesByType = (type: TransactionType) => {
    return categories.filter(cat => cat.type === type);
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
    refetch: fetchCategories,
  };
}
