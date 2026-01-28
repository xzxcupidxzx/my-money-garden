-- Utility meters table (electricity/water meters for self and tenants)
CREATE TABLE public.utility_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL, -- "Chính", "Phụ 1", "Phụ 2"
  type TEXT NOT NULL CHECK (type IN ('electricity', 'water')),
  is_main BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.utility_meters ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own meters" ON public.utility_meters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meters" ON public.utility_meters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meters" ON public.utility_meters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meters" ON public.utility_meters FOR DELETE USING (auth.uid() = user_id);

-- Utility bills table (stores readings and calculated amounts)
CREATE TABLE public.utility_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  meter_id UUID REFERENCES public.utility_meters(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  previous_reading NUMERIC NOT NULL,
  current_reading NUMERIC NOT NULL,
  usage NUMERIC NOT NULL,
  base_amount NUMERIC NOT NULL,
  vat_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.utility_bills ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own bills" ON public.utility_bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bills" ON public.utility_bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bills" ON public.utility_bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bills" ON public.utility_bills FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_utility_meters_updated_at BEFORE UPDATE ON public.utility_meters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_utility_bills_updated_at BEFORE UPDATE ON public.utility_bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();