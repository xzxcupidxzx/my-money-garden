import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Installment } from '@/types/finance';

export function useInstallments() {
  const { user } = useAuth();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInstallments();
    } else {
      setInstallments([]);
      setLoading(false);
    }
  }, [user]);

  const fetchInstallments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('installments')
        .select(`
          *,
          account:accounts(*),
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstallments(data as Installment[]);
    } catch (error) {
      console.error('Error fetching installments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyPayment = (
    totalAmount: number,
    termMonths: number,
    interestRate: number
  ): number => {
    if (interestRate === 0) {
      return totalAmount / termMonths;
    }
    
    // Monthly interest rate
    const monthlyRate = interestRate / 100 / 12;
    
    // PMT formula: P * [r(1+r)^n] / [(1+r)^n – 1]
    const payment =
      totalAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    return Math.round(payment);
  };

  const addInstallment = async (data: {
    name: string;
    total_amount: number;
    term_months: number;
    interest_rate: number;
    start_date: string;
    account_id?: string;
    category_id?: string;
  }) => {
    if (!user) return null;

    const monthlyPayment = calculateMonthlyPayment(
      data.total_amount,
      data.term_months,
      data.interest_rate
    );

    const { data: installment, error } = await supabase
      .from('installments')
      .insert({
        ...data,
        user_id: user.id,
        monthly_payment: monthlyPayment,
        remaining_amount: data.total_amount,
        account_id: data.account_id || null,
        category_id: data.category_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding installment:', error);
      return null;
    }

    fetchInstallments();
    return installment;
  };

  const updateInstallment = async (id: string, data: Partial<Installment>) => {
    const { error } = await supabase
      .from('installments')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error updating installment:', error);
      return false;
    }

    fetchInstallments();
    return true;
  };

  const deleteInstallment = async (id: string) => {
    const { error } = await supabase
      .from('installments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting installment:', error);
      return false;
    }

    fetchInstallments();
    return true;
  };

  const recordPayment = async (installmentId: string, amount: number) => {
    const installment = installments.find(i => i.id === installmentId);
    if (!installment) return false;

    const newRemaining = Math.max(0, installment.remaining_amount - amount);
    const isActive = newRemaining > 0;

    return updateInstallment(installmentId, {
      remaining_amount: newRemaining,
      is_active: isActive,
    });
  };

  // Summary calculations
  const totalDebt = installments
    .filter(i => i.is_active)
    .reduce((sum, i) => sum + Number(i.remaining_amount), 0);

  const totalMonthlyPayment = installments
    .filter(i => i.is_active)
    .reduce((sum, i) => sum + Number(i.monthly_payment), 0);

  const activeInstallments = installments.filter(i => i.is_active);

  return {
    installments,
    activeInstallments,
    loading,
    totalDebt,
    totalMonthlyPayment,
    addInstallment,
    updateInstallment,
    deleteInstallment,
    recordPayment,
    calculateMonthlyPayment,
    refetch: fetchInstallments,
  };
}
