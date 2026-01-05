-- Erweitere das user_role Enum um finance_controller
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'finance_controller';