-- Create reconciliations table for account reconciliation history
CREATE TABLE public.reconciliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  reconciliation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  system_balance NUMERIC NOT NULL,
  actual_balance NUMERIC NOT NULL,
  difference NUMERIC NOT NULL,
  adjustment_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own reconciliations"
  ON public.reconciliations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reconciliations"
  ON public.reconciliations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reconciliations"
  ON public.reconciliations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reconciliations"
  ON public.reconciliations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_reconciliations_updated_at
  BEFORE UPDATE ON public.reconciliations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();