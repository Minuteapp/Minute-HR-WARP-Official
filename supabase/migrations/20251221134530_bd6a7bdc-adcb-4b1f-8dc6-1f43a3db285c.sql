-- Erweitere das user_role Enum um 'hr_manager'
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hr_manager';