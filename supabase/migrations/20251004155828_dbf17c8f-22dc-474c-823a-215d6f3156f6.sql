-- =====================================================
-- FUNKTIONEN MIT search_path ABSICHERN (Teil 2)
-- =====================================================

-- Funktion: generate_incident_number
CREATE OR REPLACE FUNCTION public.generate_incident_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.incident_number IS NULL THEN
    NEW.incident_number := 'INC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('compliance_incident_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Funktion: increment_template_usage
CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE public.ticket_templates 
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Funktion: update_calendar_updated_at
CREATE OR REPLACE FUNCTION public.update_calendar_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Funktion: update_innovation_updated_at
CREATE OR REPLACE FUNCTION public.update_innovation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Funktion: update_roadmap_planning_updated_at
CREATE OR REPLACE FUNCTION public.update_roadmap_planning_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Funktion: update_worktime_settings_updated_at
CREATE OR REPLACE FUNCTION public.update_worktime_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Funktion: update_travel_updated_at
CREATE OR REPLACE FUNCTION public.update_travel_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;