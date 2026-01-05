-- Add new fields to business_trip_expenses
ALTER TABLE public.business_trip_expenses 
ADD COLUMN IF NOT EXISTS vendor_name TEXT,
ADD COLUMN IF NOT EXISTS net_amount NUMERIC,
ADD COLUMN IF NOT EXISTS vat_amount NUMERIC,
ADD COLUMN IF NOT EXISTS vat_rate NUMERIC DEFAULT 19,
ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ocr_data JSONB,
ADD COLUMN IF NOT EXISTS expense_number TEXT,
ADD COLUMN IF NOT EXISTS file_size_kb INTEGER;

-- Create expense_history table for tracking changes
CREATE TABLE IF NOT EXISTS public.expense_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES public.business_trip_expenses(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_name TEXT,
  actor_type TEXT DEFAULT 'user',
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  company_id UUID
);

-- Enable RLS
ALTER TABLE public.expense_history ENABLE ROW LEVEL SECURITY;

-- Create policies for expense_history
CREATE POLICY "Users can view expense history"
ON public.expense_history
FOR SELECT
USING (true);

CREATE POLICY "Users can insert expense history"
ON public.expense_history
FOR INSERT
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_expense_history_expense_id ON public.expense_history(expense_id);
CREATE INDEX IF NOT EXISTS idx_business_trip_expenses_ai_status ON public.business_trip_expenses(ai_status);