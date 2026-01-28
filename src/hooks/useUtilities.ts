import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UtilityMeter {
  id: string;
  user_id: string;
  name: string;
  type: string; // 'electricity' | 'water'
  is_main: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UtilityBill {
  id: string;
  user_id: string;
  meter_id: string;
  period_start: string;
  period_end: string;
  previous_reading: number;
  current_reading: number;
  usage: number;
  base_amount: number;
  vat_amount: number;
  total_amount: number;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  meter?: UtilityMeter;
}

// Electricity price tiers for Ho Chi Minh City 2025
export const ELECTRICITY_TIERS = [
  { tier: 1, name: 'Bậc 1', range: '0-50 kWh', limit: 50, price: 1984 },
  { tier: 2, name: 'Bậc 2', range: '51-100 kWh', limit: 50, price: 2050 },
  { tier: 3, name: 'Bậc 3', range: '101-200 kWh', limit: 100, price: 2380 },
  { tier: 4, name: 'Bậc 4', range: '201-300 kWh', limit: 100, price: 2998 },
  { tier: 5, name: 'Bậc 5', range: '301-400 kWh', limit: 100, price: 3350 },
  { tier: 6, name: 'Bậc 6', range: '401+ kWh', limit: Infinity, price: 3460 },
];

// Water price (including VAT and drainage fee)
export const WATER_PRICE = 15000; // VND per m³

export function calculateElectricityBill(usage: number) {
  let remaining = usage;
  let total = 0;
  const breakdown: { tier: number; kwh: number; price: number; amount: number }[] = [];

  for (const tier of ELECTRICITY_TIERS) {
    if (remaining <= 0) break;
    
    const kwhInTier = Math.min(remaining, tier.limit);
    const amount = kwhInTier * tier.price;
    
    breakdown.push({
      tier: tier.tier,
      kwh: kwhInTier,
      price: tier.price,
      amount,
    });
    
    total += amount;
    remaining -= kwhInTier;
  }

  const vat = Math.round(total * 0.1); // 10% VAT
  
  return {
    breakdown,
    baseAmount: total,
    vatAmount: vat,
    totalAmount: total + vat,
  };
}

export function calculateWaterBill(usage: number) {
  const baseAmount = usage * WATER_PRICE;
  // Water price already includes VAT and drainage fee
  return {
    baseAmount,
    vatAmount: 0,
    totalAmount: baseAmount,
  };
}

export function useUtilities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meters, setMeters] = useState<UtilityMeter[]>([]);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeters = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('utility_meters')
      .select('*')
      .eq('user_id', user.id)
      .order('type')
      .order('is_main', { ascending: false })
      .order('name');

    if (error) {
      console.error('Error fetching meters:', error);
      return;
    }

    setMeters(data as UtilityMeter[]);
  };

  const fetchBills = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('utility_bills')
      .select('*')
      .eq('user_id', user.id)
      .order('period_end', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching bills:', error);
      return;
    }

    setBills(data as UtilityBill[]);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMeters(), fetchBills()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const addMeter = async (data: { name: string; type: 'electricity' | 'water'; is_main: boolean }) => {
    if (!user) return null;

    const { data: newMeter, error } = await supabase
      .from('utility_meters')
      .insert({
        user_id: user.id,
        ...data,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm đồng hồ',
        variant: 'destructive',
      });
      return null;
    }

    await fetchMeters();
    return newMeter;
  };

  const updateMeter = async (id: string, updates: Partial<UtilityMeter>) => {
    const { error } = await supabase
      .from('utility_meters')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật đồng hồ',
        variant: 'destructive',
      });
      return false;
    }

    await fetchMeters();
    return true;
  };

  const deleteMeter = async (id: string) => {
    const { error } = await supabase
      .from('utility_meters')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa đồng hồ',
        variant: 'destructive',
      });
      return false;
    }

    await fetchMeters();
    return true;
  };

  const addBill = async (data: {
    meter_id: string;
    period_start: string;
    period_end: string;
    previous_reading: number;
    current_reading: number;
    notes?: string;
  }) => {
    if (!user) return null;

    const meter = meters.find(m => m.id === data.meter_id);
    if (!meter) return null;

    const usage = data.current_reading - data.previous_reading;
    
    let billCalc;
    if (meter.type === 'electricity') {
      billCalc = calculateElectricityBill(usage);
    } else {
      billCalc = calculateWaterBill(usage);
    }

    const { data: newBill, error } = await supabase
      .from('utility_bills')
      .insert({
        user_id: user.id,
        meter_id: data.meter_id,
        period_start: data.period_start,
        period_end: data.period_end,
        previous_reading: data.previous_reading,
        current_reading: data.current_reading,
        usage,
        base_amount: billCalc.baseAmount,
        vat_amount: billCalc.vatAmount,
        total_amount: billCalc.totalAmount,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo hóa đơn',
        variant: 'destructive',
      });
      return null;
    }

    await fetchBills();
    return newBill;
  };

  const deleteBill = async (id: string) => {
    const { error } = await supabase
      .from('utility_bills')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa hóa đơn',
        variant: 'destructive',
      });
      return false;
    }

    await fetchBills();
    return true;
  };

  const getLastReading = (meterId: string): number | null => {
    const meterBills = bills.filter(b => b.meter_id === meterId);
    if (meterBills.length === 0) return null;
    return meterBills[0].current_reading;
  };

  return {
    meters,
    bills,
    loading,
    addMeter,
    updateMeter,
    deleteMeter,
    addBill,
    deleteBill,
    getLastReading,
    refetch: async () => {
      await Promise.all([fetchMeters(), fetchBills()]);
    },
  };
}
