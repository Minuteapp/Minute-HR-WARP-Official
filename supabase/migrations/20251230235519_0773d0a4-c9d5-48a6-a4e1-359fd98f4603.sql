-- Add missing bank account columns to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS bank_iban text,
ADD COLUMN IF NOT EXISTS bank_bic text,
ADD COLUMN IF NOT EXISTS bank_account_holder text;