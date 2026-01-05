-- =====================================================
-- SECURITY FIX: Add search_path to all functions
-- =====================================================

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- update_timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- update_employee_status
CREATE OR REPLACE FUNCTION public.update_employee_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.termination_date IS NOT NULL AND NEW.termination_date <= CURRENT_DATE THEN
        NEW.status = 'inactive';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- calculate_absence_days
CREATE OR REPLACE FUNCTION public.calculate_absence_days(p_start_date DATE, p_end_date DATE)
RETURNS INTEGER AS $$
DECLARE
    total_days INTEGER := 0;
    curr_date DATE := p_start_date;
BEGIN
    WHILE curr_date <= p_end_date LOOP
        IF EXTRACT(DOW FROM curr_date) NOT IN (0, 6) THEN
            total_days := total_days + 1;
        END IF;
        curr_date := curr_date + 1;
    END LOOP;
    RETURN total_days;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- get_user_company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- validate_budget_amount
CREATE OR REPLACE FUNCTION public.validate_budget_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount < 0 THEN
        RAISE EXCEPTION 'Budget-Betrag darf nicht negativ sein';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- validate_absence_dates
CREATE OR REPLACE FUNCTION public.validate_absence_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_date < NEW.start_date THEN
        RAISE EXCEPTION 'Enddatum darf nicht vor dem Startdatum liegen';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;