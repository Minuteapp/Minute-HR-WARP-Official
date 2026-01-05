-- Extend payslips table with additional fields for employee view
ALTER TABLE payslips
  ADD COLUMN IF NOT EXISTS taxes numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS social_contributions numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS expected_release_date date;