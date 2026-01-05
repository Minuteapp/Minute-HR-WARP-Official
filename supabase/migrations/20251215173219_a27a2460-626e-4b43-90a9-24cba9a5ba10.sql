-- Add created_by column to absence_requests table
ALTER TABLE public.absence_requests 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);