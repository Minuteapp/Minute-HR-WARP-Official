-- KRITISCHE SICHERHEITSPROBLEME BEHEBEN

-- 1. RLS für permission_audit_log aktivieren
ALTER TABLE IF EXISTS public.permission_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies für permission_audit_log
DROP POLICY IF EXISTS "Admins can manage audit logs" ON public.permission_audit_log;
CREATE POLICY "Admins can manage audit logs" 
ON public.permission_audit_log 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- 2. RLS für permission_templates aktivieren  
ALTER TABLE IF EXISTS public.permission_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies für permission_templates
DROP POLICY IF EXISTS "Admins can manage permission templates" ON public.permission_templates;
CREATE POLICY "Admins can manage permission templates" 
ON public.permission_templates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

DROP POLICY IF EXISTS "All users can view permission templates" ON public.permission_templates;
CREATE POLICY "All users can view permission templates" 
ON public.permission_templates 
FOR SELECT 
USING (is_active = true);

-- 3. Sicherheitsprobleme in Funktionen beheben durch festen search_path

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT role::TEXT FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$function$;

-- Fix calculate_payroll function  
CREATE OR REPLACE FUNCTION public.calculate_payroll(p_user_id uuid, p_period_start date, p_period_end date)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_contract RECORD;
  v_calculation_id UUID;
  v_time_entries RECORD;
  v_total_hours NUMERIC := 0;
  v_regular_hours NUMERIC := 0;
  v_overtime_hours NUMERIC := 0;
  v_night_hours NUMERIC := 0;
  v_weekend_hours NUMERIC := 0;
  v_holiday_hours NUMERIC := 0;
  v_gross_amount NUMERIC := 0;
  v_overtime_amount NUMERIC := 0;
  v_bonus_amount NUMERIC := 0;
BEGIN
  -- Aktiven Vertrag holen
  SELECT * INTO v_contract
  FROM public.employee_contracts
  WHERE user_id = p_user_id 
    AND is_active = TRUE
    AND valid_from <= p_period_end
    AND (valid_until IS NULL OR valid_until >= p_period_start)
  ORDER BY valid_from DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kein aktiver Vertrag gefunden für Benutzer %', p_user_id;
  END IF;

  -- Zeiteinträge für Periode sammeln
  FOR v_time_entries IN
    SELECT 
      te.*,
      EXTRACT(EPOCH FROM (
        COALESCE(te.end_time, NOW()) - te.start_time::timestamp
      )) / 3600 - COALESCE(te.break_minutes, 0) / 60.0 as work_hours,
      EXTRACT(DOW FROM te.start_time::date) as day_of_week,
      EXTRACT(HOUR FROM te.start_time::time) as start_hour
    FROM public.time_entries te
    WHERE te.user_id = p_user_id
      AND te.start_time::date BETWEEN p_period_start AND p_period_end
      AND te.status = 'completed'
  LOOP
    v_total_hours := v_total_hours + v_time_entries.work_hours;
    
    -- Nachtschicht prüfen (22:00 - 06:00)
    IF v_time_entries.start_hour >= 22 OR v_time_entries.start_hour <= 6 THEN
      v_night_hours := v_night_hours + v_time_entries.work_hours;
    END IF;
    
    -- Wochenende prüfen (Samstag = 6, Sonntag = 0)
    IF v_time_entries.day_of_week IN (0, 6) THEN
      v_weekend_hours := v_weekend_hours + v_time_entries.work_hours;
    END IF;
  END LOOP;

  -- Überstunden berechnen
  IF v_contract.working_hours_per_month IS NOT NULL THEN
    v_regular_hours := LEAST(v_total_hours, v_contract.working_hours_per_month);
    v_overtime_hours := GREATEST(0, v_total_hours - v_contract.working_hours_per_month);
  ELSE
    v_regular_hours := v_total_hours;
  END IF;

  -- Grundlohn berechnen
  CASE v_contract.contract_type
    WHEN 'fixed_salary' THEN
      v_gross_amount := v_contract.base_salary;
    WHEN 'hourly_wage', 'freelancer', 'minijob' THEN
      v_gross_amount := v_regular_hours * v_contract.hourly_rate;
  END CASE;

  -- Überstunden berechnen
  IF v_overtime_hours > 0 AND v_contract.overtime_rate IS NOT NULL THEN
    v_overtime_amount := v_overtime_hours * v_contract.overtime_rate;
  END IF;

  -- Zuschläge berechnen
  IF v_night_hours > 0 AND v_contract.night_shift_bonus IS NOT NULL THEN
    v_bonus_amount := v_bonus_amount + (v_night_hours * v_contract.night_shift_bonus / 100 * COALESCE(v_contract.hourly_rate, 0));
  END IF;
  
  IF v_weekend_hours > 0 AND v_contract.weekend_bonus IS NOT NULL THEN
    v_bonus_amount := v_bonus_amount + (v_weekend_hours * v_contract.weekend_bonus / 100 * COALESCE(v_contract.hourly_rate, 0));
  END IF;

  -- Berechnung speichern
  INSERT INTO public.payroll_calculations (
    user_id, calculation_period_start, calculation_period_end,
    total_work_hours, regular_hours, overtime_hours,
    night_shift_hours, weekend_hours, holiday_hours,
    gross_base_amount, overtime_amount, bonus_amount,
    gross_total
  ) VALUES (
    p_user_id, p_period_start, p_period_end,
    v_total_hours, v_regular_hours, v_overtime_hours,
    v_night_hours, v_weekend_hours, v_holiday_hours,
    v_gross_amount, v_overtime_amount, v_bonus_amount,
    v_gross_amount + v_overtime_amount + v_bonus_amount
  ) RETURNING id INTO v_calculation_id;

  RETURN v_calculation_id;
END;
$function$;

-- Fix get_user_effective_permissions function
CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(p_user_id uuid)
RETURNS TABLE(module_name text, module_id text, is_visible boolean, allowed_actions text[], visible_fields jsonb, editable_fields jsonb, allowed_notifications text[], workflow_triggers text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  -- Hole die Rolle des Benutzers
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Falls keine Rolle gefunden, verwende 'employee' als Standard
  IF user_role IS NULL THEN
    user_role := 'employee';
  END IF;
  
  -- Gib die effektiven Berechtigungen für die Rolle zurück
  RETURN QUERY
  SELECT 
    rpm.module_name,
    pm.module_key as module_id,
    rpm.is_visible,
    rpm.allowed_actions,
    rpm.visible_fields,
    rpm.editable_fields,
    rpm.allowed_notifications,
    rpm.workflow_triggers
  FROM public.role_permission_matrix rpm
  JOIN public.permission_modules pm ON pm.name = rpm.module_name
  WHERE rpm.role = user_role::user_role;
END;
$function$;