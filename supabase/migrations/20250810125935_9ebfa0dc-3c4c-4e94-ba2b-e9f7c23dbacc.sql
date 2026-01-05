-- Ensure company_id is auto-assigned on insert to prevent cross-tenant data bleed
-- Uses existing function public.auto_assign_company_id()

-- Employees trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_employees_auto_company_id'
  ) THEN
    CREATE TRIGGER trg_employees_auto_company_id
    BEFORE INSERT ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_company_id();
  END IF;
END $$;

-- Time entries trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_time_entries_auto_company_id'
  ) THEN
    CREATE TRIGGER trg_time_entries_auto_company_id
    BEFORE INSERT ON public.time_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_company_id();
  END IF;
END $$;
