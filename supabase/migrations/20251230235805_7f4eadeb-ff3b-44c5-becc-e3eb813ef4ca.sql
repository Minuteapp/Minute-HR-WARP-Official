-- Add missing iban column to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS iban text;