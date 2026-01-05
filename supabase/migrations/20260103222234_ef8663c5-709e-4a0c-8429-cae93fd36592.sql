-- Prevent duplicate active time entries for the same user
CREATE OR REPLACE FUNCTION public.check_time_entry_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for existing active time entry (without end_time) for this user
  IF NEW.end_time IS NULL AND EXISTS (
    SELECT 1 FROM public.time_entries
    WHERE user_id = NEW.user_id
      AND company_id = NEW.company_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND end_time IS NULL
  ) THEN
    RAISE EXCEPTION 'Es läuft bereits eine Zeiterfassung. Bitte beenden Sie diese zuerst.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for time entries
DROP TRIGGER IF EXISTS prevent_duplicate_active_time_entries ON public.time_entries;
CREATE TRIGGER prevent_duplicate_active_time_entries
BEFORE INSERT OR UPDATE ON public.time_entries
FOR EACH ROW EXECUTE FUNCTION public.check_time_entry_overlap();

-- Prevent duplicate task titles within the same project
CREATE OR REPLACE FUNCTION public.check_task_duplicate()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tasks
    WHERE project_id = NEW.project_id
      AND company_id = NEW.company_id
      AND LOWER(TRIM(title)) = LOWER(TRIM(NEW.title))
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (deleted_at IS NULL OR deleted_at > now())
  ) THEN
    RAISE EXCEPTION 'Eine Aufgabe mit diesem Titel existiert bereits in diesem Projekt.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for tasks
DROP TRIGGER IF EXISTS prevent_duplicate_task_titles ON public.tasks;
CREATE TRIGGER prevent_duplicate_task_titles
BEFORE INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.check_task_duplicate();

-- Prevent duplicate employee emails within the same company
CREATE OR REPLACE FUNCTION public.check_employee_duplicate_email()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.employees
    WHERE company_id = NEW.company_id
      AND LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Ein Mitarbeiter mit dieser E-Mail-Adresse existiert bereits.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for employees
DROP TRIGGER IF EXISTS prevent_duplicate_employee_emails ON public.employees;
CREATE TRIGGER prevent_duplicate_employee_emails
BEFORE INSERT OR UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.check_employee_duplicate_email();