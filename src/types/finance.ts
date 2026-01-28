// Database types for the finance tracker
export type TransactionType = 'income' | 'expense' | 'transfer';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type AiNoteStatus = 'pending' | 'success' | 'error';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  default_currency: string;
  privacy_mode: boolean;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id: string | null;
  account_id: string;
  to_account_id: string | null;
  description: string | null;
  date: string;
  is_recurring: boolean;
  recurring_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: Category;
  account?: Account;
  to_account?: Account;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: Category;
  spent?: number;
}

export interface Installment {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  interest_rate: number;
  term_months: number;
  start_date: string;
  monthly_payment: number;
  remaining_amount: number;
  account_id: string | null;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  account?: Account;
  category?: Category;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id: string | null;
  account_id: string;
  to_account_id: string | null;
  description: string | null;
  recurrence: RecurrenceType;
  next_date: string;
  last_generated: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: Category;
  account?: Account;
}

export interface AiNote {
  id: string;
  user_id: string;
  raw_text: string;
  parsed_data: ParsedTransaction[] | null;
  status: AiNoteStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryMapping {
  id: string;
  user_id: string;
  keyword: string;
  category_id: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface ParsedTransaction {
  type: TransactionType;
  amount: number;
  description: string;
  category_id?: string;
  suggested_category?: string;
}

// UI State types
export interface MonthSummary {
  income: number;
  expense: number;
  balance: number;
}

export interface DailyTransaction {
  date: string;
  income: number;
  expense: number;
  transactions: Transaction[];
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
}
