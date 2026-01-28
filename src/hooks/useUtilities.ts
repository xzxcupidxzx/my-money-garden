import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Tenant {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  room_name: string | null;
  monthly_rent: number;
  move_in_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UtilityMeter {
  id: string;
  user_id: string;
  name: string;
  type: string;
  is_main: boolean;
  is_active: boolean;
  tenant_id: string | null;
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
}

export interface ElectricityTier {
  tier: number;
  name: string;
  range: string;
  limit: number | null;
  price: number;
}

export interface PriceSettings {
  id: string;
  user_id: string;
  electricity_tiers: ElectricityTier[];
  electricity_vat_percent: number;
  water_price: number;
  water_includes_vat: boolean;
}

export interface RentPayment {
  id: string;
  user_id: string;
  tenant_id: string;
  amount: number;
  payment_date: string;
  period_month: number;
  period_year: number;
  is_paid: boolean;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

// Default electricity price tiers for Ho Chi Minh City 2025
export const DEFAULT_ELECTRICITY_TIERS: ElectricityTier[] = [
  { tier: 1, name: 'Bậc 1', range: '0-50 kWh', limit: 50, price: 1984 },
  { tier: 2, name: 'Bậc 2', range: '51-100 kWh', limit: 50, price: 2050 },
  { tier: 3, name: 'Bậc 3', range: '101-200 kWh', limit: 100, price: 2380 },
  { tier: 4, name: 'Bậc 4', range: '201-300 kWh', limit: 100, price: 2998 },
  { tier: 5, name: 'Bậc 5', range: '301-400 kWh', limit: 100, price: 3350 },
  { tier: 6, name: 'Bậc 6', range: '401+ kWh', limit: null, price: 3460 },
];

export const DEFAULT_WATER_PRICE = 15000;

export function calculateElectricityBill(usage: number, tiers: ElectricityTier[], vatPercent: number = 10) {
  let remaining = usage;
  let total = 0;
  const breakdown: { tier: number; kwh: number; price: number; amount: number }[] = [];

  for (const tier of tiers) {
    if (remaining <= 0) break;
    
    const limit = tier.limit ?? Infinity;
    const kwhInTier = Math.min(remaining, limit);
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

  const vat = Math.round(total * (vatPercent / 100));
  
  return {
    breakdown,
    baseAmount: total,
    vatAmount: vat,
    totalAmount: total + vat,
  };
}

export function calculateWaterBill(usage: number, pricePerM3: number, includesVat: boolean = true) {
  const baseAmount = usage * pricePerM3;
  return {
    baseAmount,
    vatAmount: 0,
    totalAmount: baseAmount,
  };
}

export function useUtilities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [meters, setMeters] = useState<UtilityMeter[]>([]);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [priceSettings, setPriceSettings] = useState<PriceSettings | null>(null);
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    if (!error && data) setTenants(data as Tenant[]);
  }, [user]);

  const fetchMeters = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('utility_meters')
      .select('*')
      .eq('user_id', user.id)
      .order('type')
      .order('is_main', { ascending: false })
      .order('name');
    if (!error && data) setMeters(data as UtilityMeter[]);
  }, [user]);

  const fetchBills = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('utility_bills')
      .select('*')
      .eq('user_id', user.id)
      .order('period_end', { ascending: false })
      .limit(100);
    if (!error && data) setBills(data as UtilityBill[]);
  }, [user]);

  const fetchPriceSettings = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('utility_price_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!error && data) {
      setPriceSettings({
        ...data,
        electricity_tiers: data.electricity_tiers as unknown as ElectricityTier[],
      } as PriceSettings);
    }
  }, [user]);

  const fetchRentPayments = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('rent_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false })
      .limit(50);
    if (!error && data) setRentPayments(data as RentPayment[]);
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTenants(),
        fetchMeters(),
        fetchBills(),
        fetchPriceSettings(),
        fetchRentPayments(),
      ]);
      setLoading(false);
    };
    if (user) loadData();
  }, [user, fetchTenants, fetchMeters, fetchBills, fetchPriceSettings, fetchRentPayments]);

  // Tenant operations
  const addTenant = async (data: Partial<Tenant>) => {
    if (!user) return null;
    const insertData = {
      user_id: user.id,
      name: data.name || '',
      phone: data.phone || null,
      room_name: data.room_name || null,
      monthly_rent: data.monthly_rent || 0,
      move_in_date: data.move_in_date || null,
      is_active: data.is_active ?? true,
      notes: data.notes || null,
    };
    const { data: newTenant, error } = await supabase
      .from('tenants')
      .insert(insertData)
      .select()
      .single();
    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể thêm người thuê', variant: 'destructive' });
      return null;
    }
    await fetchTenants();
    return newTenant;
  };

  const updateTenant = async (id: string, updates: Partial<Tenant>) => {
    const { error } = await supabase.from('tenants').update(updates).eq('id', id);
    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật', variant: 'destructive' });
      return false;
    }
    await fetchTenants();
    return true;
  };

  const deleteTenant = async (id: string) => {
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể xóa người thuê', variant: 'destructive' });
      return false;
    }
    await fetchTenants();
    return true;
  };

  // Meter operations
  const addMeter = async (data: { name: string; type: 'electricity' | 'water'; is_main: boolean; tenant_id?: string | null }) => {
    if (!user) return null;
    const { data: newMeter, error } = await supabase
      .from('utility_meters')
      .insert({ user_id: user.id, ...data })
      .select()
      .single();
    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể thêm đồng hồ', variant: 'destructive' });
      return null;
    }
    await fetchMeters();
    return newMeter;
  };

  const updateMeter = async (id: string, updates: Partial<UtilityMeter>) => {
    const { error } = await supabase.from('utility_meters').update(updates).eq('id', id);
    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật đồng hồ', variant: 'destructive' });
      return false;
    }
    await fetchMeters();
    return true;
  };

  const deleteMeter = async (id: string) => {
    const { error } = await supabase.from('utility_meters').delete().eq('id', id);
    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể xóa đồng hồ', variant: 'destructive' });
      return false;
    }
    await fetchMeters();
    return true;
  };

  // Bill operations
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
    const tiers = priceSettings?.electricity_tiers || DEFAULT_ELECTRICITY_TIERS;
    const vatPercent = priceSettings?.electricity_vat_percent || 10;
    const waterPrice = priceSettings?.water_price || DEFAULT_WATER_PRICE;

    let billCalc;
    if (meter.type === 'electricity') {
      billCalc = calculateElectricityBill(usage, tiers, vatPercent);
    } else {
      billCalc = calculateWaterBill(usage, waterPrice);
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
      toast({ title: 'Lỗi', description: 'Không thể tạo hóa đơn', variant: 'destructive' });
      return null;
    }
    await fetchBills();
    return newBill;
  };

  const deleteBill = async (id: string) => {
    const { error } = await supabase.from('utility_bills').delete().eq('id', id);
    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể xóa hóa đơn', variant: 'destructive' });
      return false;
    }
    await fetchBills();
    return true;
  };

  const updateBill = async (id: string, updates: { previous_reading: number; current_reading: number }) => {
    if (!user) return false;
    
    const bill = bills.find(b => b.id === id);
    if (!bill) return false;

    const meter = meters.find(m => m.id === bill.meter_id);
    if (!meter) return false;

    const usage = updates.current_reading - updates.previous_reading;
    const tiers = priceSettings?.electricity_tiers || DEFAULT_ELECTRICITY_TIERS;
    const vatPercent = priceSettings?.electricity_vat_percent || 10;
    const waterPrice = priceSettings?.water_price || DEFAULT_WATER_PRICE;

    let billCalc;
    if (meter.type === 'electricity') {
      billCalc = calculateElectricityBill(usage, tiers, vatPercent);
    } else {
      billCalc = calculateWaterBill(usage, waterPrice);
    }

    const { error } = await supabase
      .from('utility_bills')
      .update({
        previous_reading: updates.previous_reading,
        current_reading: updates.current_reading,
        usage,
        base_amount: billCalc.baseAmount,
        vat_amount: billCalc.vatAmount,
        total_amount: billCalc.totalAmount,
      })
      .eq('id', id);

    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật hóa đơn', variant: 'destructive' });
      return false;
    }
    
    await fetchBills();
    toast({ title: 'Thành công', description: 'Đã cập nhật hóa đơn' });
    return true;
  };

  // Price settings operations
  const savePriceSettings = async (settings: Partial<PriceSettings>) => {
    if (!user) return false;
    
    const upsertData = {
      user_id: user.id,
      electricity_tiers: JSON.stringify(settings.electricity_tiers || DEFAULT_ELECTRICITY_TIERS),
      electricity_vat_percent: settings.electricity_vat_percent ?? 10,
      water_price: settings.water_price ?? DEFAULT_WATER_PRICE,
      water_includes_vat: settings.water_includes_vat ?? true,
    };

    const { error } = await supabase
      .from('utility_price_settings')
      .upsert(upsertData, { onConflict: 'user_id' });

    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể lưu cài đặt giá', variant: 'destructive' });
      return false;
    }
    await fetchPriceSettings();
    toast({ title: 'Thành công', description: 'Đã lưu cài đặt giá' });
    return true;
  };

  // Rent payment operations
  const addRentPayment = async (data: Partial<RentPayment>) => {
    if (!user) return null;
    const insertData = {
      user_id: user.id,
      tenant_id: data.tenant_id || '',
      amount: data.amount || 0,
      payment_date: data.payment_date || new Date().toISOString().split('T')[0],
      period_month: data.period_month || new Date().getMonth() + 1,
      period_year: data.period_year || new Date().getFullYear(),
      is_paid: data.is_paid ?? false,
      paid_at: data.paid_at || null,
      notes: data.notes || null,
    };
    const { data: newPayment, error } = await supabase
      .from('rent_payments')
      .insert(insertData)
      .select()
      .single();
    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể thêm thanh toán', variant: 'destructive' });
      return null;
    }
    await fetchRentPayments();
    return newPayment;
  };

  const updateRentPayment = async (id: string, updates: Partial<RentPayment>) => {
    const { error } = await supabase.from('rent_payments').update(updates).eq('id', id);
    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật', variant: 'destructive' });
      return false;
    }
    await fetchRentPayments();
    return true;
  };

  const deleteRentPayment = async (id: string) => {
    const { error } = await supabase.from('rent_payments').delete().eq('id', id);
    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể xóa', variant: 'destructive' });
      return false;
    }
    await fetchRentPayments();
    return true;
  };

  const getLastReading = (meterId: string): number | null => {
    const meterBills = bills.filter(b => b.meter_id === meterId);
    if (meterBills.length === 0) return null;
    return meterBills[0].current_reading;
  };

  const getElectricityTiers = () => priceSettings?.electricity_tiers || DEFAULT_ELECTRICITY_TIERS;
  const getWaterPrice = () => priceSettings?.water_price || DEFAULT_WATER_PRICE;
  const getVatPercent = () => priceSettings?.electricity_vat_percent || 10;

  return {
    tenants,
    meters,
    bills,
    priceSettings,
    rentPayments,
    loading,
    // Tenant ops
    addTenant,
    updateTenant,
    deleteTenant,
    // Meter ops
    addMeter,
    updateMeter,
    deleteMeter,
    // Bill ops
    addBill,
    updateBill,
    deleteBill,
    // Price ops
    savePriceSettings,
    getElectricityTiers,
    getWaterPrice,
    getVatPercent,
    // Rent ops
    addRentPayment,
    updateRentPayment,
    deleteRentPayment,
    // Utils
    getLastReading,
    refetch: async () => {
      await Promise.all([fetchTenants(), fetchMeters(), fetchBills(), fetchPriceSettings(), fetchRentPayments()]);
    },
  };
}
