-- =============================================
-- Self-Host Database Schema Export
-- Generated from Lovable Cloud Supabase
-- =============================================

-- ENUMS
CREATE TYPE public.ai_note_status AS ENUM ('pending', 'success', 'error');
CREATE TYPE public.recurrence_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer');

-- PROFILES TABLE
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    full_name text,
    avatar_url text,
    default_currency text NOT NULL DEFAULT 'VND',
    privacy_mode boolean NOT NULL DEFAULT false,
    theme text NOT NULL DEFAULT 'system',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ACCOUNTS TABLE
CREATE TABLE public.accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL DEFAULT 'cash',
    balance numeric NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'VND',
    color text,
    icon text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- CATEGORIES TABLE
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    type transaction_type NOT NULL,
    color text,
    icon text,
    parent_id uuid REFERENCES public.categories(id),
    is_system boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- TRANSACTIONS TABLE
CREATE TABLE public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    type transaction_type NOT NULL,
    amount numeric NOT NULL,
    description text,
    date timestamptz NOT NULL DEFAULT now(),
    category_id uuid REFERENCES public.categories(id),
    account_id uuid NOT NULL REFERENCES public.accounts(id),
    to_account_id uuid REFERENCES public.accounts(id),
    is_recurring boolean NOT NULL DEFAULT false,
    recurring_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- BUDGETS TABLE
CREATE TABLE public.budgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    category_id uuid NOT NULL REFERENCES public.categories(id),
    amount numeric NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- INSTALLMENTS TABLE
CREATE TABLE public.installments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    total_amount numeric NOT NULL,
    remaining_amount numeric NOT NULL,
    monthly_payment numeric NOT NULL,
    term_months integer NOT NULL,
    interest_rate numeric NOT NULL DEFAULT 0,
    start_date date NOT NULL,
    account_id uuid REFERENCES public.accounts(id),
    category_id uuid REFERENCES public.categories(id),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- RECURRING TRANSACTIONS TABLE
CREATE TABLE public.recurring_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    type transaction_type NOT NULL,
    amount numeric NOT NULL,
    description text,
    category_id uuid REFERENCES public.categories(id),
    account_id uuid NOT NULL REFERENCES public.accounts(id),
    to_account_id uuid REFERENCES public.accounts(id),
    recurrence recurrence_type NOT NULL,
    next_date date NOT NULL,
    last_generated date,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- AI NOTES TABLE
CREATE TABLE public.ai_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    raw_text text NOT NULL,
    parsed_data jsonb,
    status ai_note_status NOT NULL DEFAULT 'pending',
    error_message text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- CATEGORY MAPPINGS TABLE
CREATE TABLE public.category_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    keyword text NOT NULL,
    category_id uuid NOT NULL REFERENCES public.categories(id),
    usage_count integer NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- RECONCILIATIONS TABLE
CREATE TABLE public.reconciliations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    account_id uuid NOT NULL REFERENCES public.accounts(id),
    reconciliation_date date NOT NULL DEFAULT CURRENT_DATE,
    system_balance numeric NOT NULL,
    actual_balance numeric NOT NULL,
    difference numeric NOT NULL,
    adjustment_transaction_id uuid REFERENCES public.transactions(id),
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- TENANTS TABLE
CREATE TABLE public.tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    phone text,
    room_name text,
    monthly_rent numeric NOT NULL DEFAULT 0,
    move_in_date date,
    notes text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RENT PAYMENTS TABLE
CREATE TABLE public.rent_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id),
    amount numeric NOT NULL,
    period_month integer NOT NULL,
    period_year integer NOT NULL,
    payment_date date NOT NULL DEFAULT CURRENT_DATE,
    is_paid boolean NOT NULL DEFAULT false,
    paid_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- UTILITY METERS TABLE
CREATE TABLE public.utility_meters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    tenant_id uuid REFERENCES public.tenants(id),
    is_main boolean DEFAULT false,
    is_active boolean DEFAULT true,
    start_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- UTILITY BILLS TABLE
CREATE TABLE public.utility_bills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    meter_id uuid NOT NULL REFERENCES public.utility_meters(id),
    period_start date NOT NULL,
    period_end date NOT NULL,
    previous_reading numeric NOT NULL,
    current_reading numeric NOT NULL,
    usage numeric NOT NULL,
    base_amount numeric NOT NULL,
    vat_amount numeric DEFAULT 0,
    total_amount numeric NOT NULL,
    transaction_id uuid REFERENCES public.transactions(id),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- UTILITY PRICE SETTINGS TABLE
CREATE TABLE public.utility_price_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    water_price numeric NOT NULL DEFAULT 15000,
    water_includes_vat boolean NOT NULL DEFAULT true,
    electricity_vat_percent numeric NOT NULL DEFAULT 10,
    electricity_tiers jsonb NOT NULL DEFAULT '[{"name": "Bậc 1", "tier": 1, "limit": 50, "price": 1984, "range": "0-50 kWh"}, {"name": "Bậc 2", "tier": 2, "limit": 50, "price": 2050, "range": "51-100 kWh"}, {"name": "Bậc 3", "tier": 3, "limit": 100, "price": 2380, "range": "101-200 kWh"}, {"name": "Bậc 4", "tier": 4, "limit": 100, "price": 2998, "range": "201-300 kWh"}, {"name": "Bậc 5", "tier": 5, "limit": 100, "price": 3350, "range": "301-400 kWh"}, {"name": "Bậc 6", "tier": 6, "limit": null, "price": 3460, "range": "401+ kWh"}]',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_price_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES (Owner-based access)
-- =============================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Accounts
CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- Categories
CREATE POLICY "Users can view own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Budgets
CREATE POLICY "Users can view own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
-- (Remaining tables follow same pattern: SELECT/INSERT/UPDATE/DELETE with auth.uid() = user_id)

-- =============================================
-- FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
