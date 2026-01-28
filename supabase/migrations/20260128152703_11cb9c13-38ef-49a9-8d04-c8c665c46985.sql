-- Create tenants table for managing renters
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  room_name TEXT,
  monthly_rent NUMERIC NOT NULL DEFAULT 0,
  move_in_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenants
CREATE POLICY "Users can view own tenants" ON public.tenants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tenants" ON public.tenants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tenants" ON public.tenants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tenants" ON public.tenants FOR DELETE USING (auth.uid() = user_id);

-- Create utility price settings table
CREATE TABLE public.utility_price_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  electricity_tiers JSONB NOT NULL DEFAULT '[
    {"tier": 1, "name": "Bậc 1", "range": "0-50 kWh", "limit": 50, "price": 1984},
    {"tier": 2, "name": "Bậc 2", "range": "51-100 kWh", "limit": 50, "price": 2050},
    {"tier": 3, "name": "Bậc 3", "range": "101-200 kWh", "limit": 100, "price": 2380},
    {"tier": 4, "name": "Bậc 4", "range": "201-300 kWh", "limit": 100, "price": 2998},
    {"tier": 5, "name": "Bậc 5", "range": "301-400 kWh", "limit": 100, "price": 3350},
    {"tier": 6, "name": "Bậc 6", "range": "401+ kWh", "limit": null, "price": 3460}
  ]'::jsonb,
  electricity_vat_percent NUMERIC NOT NULL DEFAULT 10,
  water_price NUMERIC NOT NULL DEFAULT 15000,
  water_includes_vat BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.utility_price_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own settings" ON public.utility_price_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.utility_price_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.utility_price_settings FOR UPDATE USING (auth.uid() = user_id);

-- Create rent payments table
CREATE TABLE public.rent_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for rent_payments
CREATE POLICY "Users can view own rent payments" ON public.rent_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rent payments" ON public.rent_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rent payments" ON public.rent_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rent payments" ON public.rent_payments FOR DELETE USING (auth.uid() = user_id);

-- Add tenant_id to utility_meters to link meters with tenants (nullable for main meters)
ALTER TABLE public.utility_meters ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;

-- Add triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_utility_price_settings_updated_at BEFORE UPDATE ON public.utility_price_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rent_payments_updated_at BEFORE UPDATE ON public.rent_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();