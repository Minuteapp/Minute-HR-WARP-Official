-- SICHERHEITSREPARATUR TEIL 4: Function Search Path beheben
-- Diese kritischen Sicherheitslücken haben hohe Priorität

-- Repariere die search_path-Probleme der wichtigsten Funktionen
-- SECURITY DEFINER SET search_path = public hinzufügen

-- 1. Beispiel-Reparatur für einige bekannte Funktionen
CREATE OR REPLACE FUNCTION public.generate_abwesenheitsantrag_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  IF NEW.antrag_nummer IS NULL THEN
    NEW.antrag_nummer := 'AB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('abwesenheitsantrag_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_channel_member(channel_uuid uuid, user_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.channel_members 
    WHERE channel_id = channel_uuid AND user_id = user_uuid
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_employees_with_company()
 RETURNS TABLE(id uuid, name text, first_name text, last_name text, email text, employee_number text, department text, "position" text, team text, employment_type employment_type, start_date date, status text, company_id uuid, company_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Verwende existierende sichere Funktion
  RETURN QUERY
  SELECT * FROM public.get_employee_company_data();
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_superadmin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Check user_roles table first (primary method)
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = $1 AND ur.role = 'superadmin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Fallback to metadata check (backup method)
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = $1 AND raw_user_meta_data->>'role' = 'superadmin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_ip_allowed(p_user_id uuid, p_ip_address text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_settings RECORD;
BEGIN
  -- Hole Sicherheitseinstellungen des Benutzers
  SELECT allowed_ip_addresses, blocked_ip_addresses
  INTO v_settings
  FROM public.user_security_settings
  WHERE user_id = p_user_id;
  
  -- Wenn keine Einstellungen vorhanden, erlaube Zugriff
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;
  
  -- Prüfe Blockliste
  IF v_settings.blocked_ip_addresses IS NOT NULL AND 
     p_ip_address = ANY(v_settings.blocked_ip_addresses) THEN
    RETURN FALSE;
  END IF;
  
  -- Prüfe Zulassungsliste (wenn definiert)
  IF v_settings.allowed_ip_addresses IS NOT NULL AND 
     array_length(v_settings.allowed_ip_addresses, 1) > 0 THEN
    RETURN p_ip_address = ANY(v_settings.allowed_ip_addresses);
  END IF;
  
  -- Standardmäßig erlauben
  RETURN TRUE;
END;
$function$;

-- 2. Zusätzliche RLS-Policies für bestätigte Tabellen

-- calendar_events: Kalendersicherheit (bestätigte Struktur)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'calendar_events' AND policyname = 'Users can view their calendar events'
  ) THEN
    CREATE POLICY "Users can view their calendar events"
    ON public.calendar_events
    FOR SELECT
    USING (
      auth.uid() = created_by OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(COALESCE(attendees, '[]'::jsonb))) OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin', 'superadmin']::user_role[])
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'calendar_events' AND policyname = 'Users can create calendar events'
  ) THEN
    CREATE POLICY "Users can create calendar events"
    ON public.calendar_events
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'calendar_events' AND policyname = 'Users can update their calendar events'
  ) THEN
    CREATE POLICY "Users can update their calendar events"
    ON public.calendar_events
    FOR UPDATE
    USING (
      auth.uid() = created_by OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin', 'superadmin']::user_role[])
      )
    );
  END IF;
END $$;