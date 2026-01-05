-- SECURITY FIX PHASE 2: Remove SECURITY DEFINER from functions that don't need elevated privileges

-- 1. Trigger functions that don't need SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.generate_document_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.document_number IS NULL THEN
    NEW.document_number := 'DOC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('document_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_abwesenheitsantrag_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.antrag_nummer IS NULL THEN
    NEW.antrag_nummer := 'AB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('abwesenheitsantrag_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_expense_fiscal_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Setze Fiscal Year, Quarter, etc.
  NEW.fiscal_year := EXTRACT(YEAR FROM NEW.date);
  NEW.quarter := EXTRACT(QUARTER FROM NEW.date);
  NEW.month := EXTRACT(MONTH FROM NEW.date);
  
  -- Berechne Netto-Betrag wenn VAT-Rate gegeben
  IF NEW.vat_rate IS NOT NULL AND NEW.vat_rate > 0 THEN
    NEW.net_amount := NEW.amount / (1 + NEW.vat_rate);
    NEW.vat_amount := NEW.amount - NEW.net_amount;
  ELSE
    NEW.net_amount := NEW.amount;
    NEW.vat_amount := 0;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_document_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.document_type NOT IN ('contract', 'certificate', 'identification', 'other') THEN
    NEW.document_type := 'other';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE public.ticket_templates 
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Utility functions that don't need SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_valid_uuid(input_text text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = 'public'
AS $function$
BEGIN
  PERFORM input_text::UUID;
  RETURN TRUE;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  RETURN (
    SELECT role::TEXT
    FROM public.user_roles
    WHERE user_id = $1
    LIMIT 1
  );
END;
$function$;

-- 3. Functions that need SECURITY DEFINER but with better security
CREATE OR REPLACE FUNCTION public.is_document_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Sicherheitsprüfung: Nur für sich selbst oder andere Admins
  IF user_id != auth.uid() AND NOT (
    EXISTS (SELECT 1 FROM public.user_roles ur 
           WHERE ur.user_id = auth.uid() 
           AND ur.role IN ('admin', 'superadmin'))
  ) THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1
    AND user_roles.role IN ('admin', 'superadmin')
  );
END;
$function$;

-- 4. Fix functions that legitimately need SECURITY DEFINER by adding proper validation
CREATE OR REPLACE FUNCTION public.search_all(search_query text)
RETURNS TABLE(id uuid, title text, type text, modified_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Sicherheitsprüfung: Nur authentifizierte Benutzer
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Input-Validierung
  IF search_query IS NULL OR length(trim(search_query)) < 2 THEN
    RAISE EXCEPTION 'Search query must be at least 2 characters';
  END IF;

  RETURN QUERY
  SELECT 
    documents.id,
    documents.title,
    'document'::text as type,
    documents.updated_at as modified_at
  FROM public.documents
  WHERE 
    documents.title ILIKE '%' || search_query || '%'
    OR documents.description ILIKE '%' || search_query || '%'
  
  UNION ALL
  
  SELECT 
    tasks.id,
    tasks.title,
    'task'::text as type,
    tasks.updated_at as modified_at
  FROM public.tasks
  WHERE 
    tasks.title ILIKE '%' || search_query || '%'
    OR tasks.description ILIKE '%' || search_query || '%'
  
  UNION ALL
  
  SELECT 
    goals.id,
    goals.title,
    'goal'::text as type,
    goals.updated_at as modified_at
  FROM public.goals
  WHERE 
    goals.title ILIKE '%' || search_query || '%'
    OR goals.description ILIKE '%' || search_query || '%'
  
  ORDER BY modified_at DESC
  LIMIT 50;
END;
$function$;

-- 5. Log this security improvement
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid, 
  'security_definer_phase2_fix', 
  'database_functions', 
  'security_definer_cleanup_phase2',
  jsonb_build_object(
    'description', 'Phase 2: Removed SECURITY DEFINER from more functions and added proper validation',
    'trigger_functions_fixed', 5,
    'utility_functions_fixed', 2,
    'admin_functions_secured', 1,
    'search_function_secured', 1,
    'total_functions_improved', 9,
    'timestamp', now()
  )
);