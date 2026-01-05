-- =====================================================
-- NUR FUNKTIONEN ABSICHERN (ohne Policy-Änderungen)
-- =====================================================

-- Funktion: is_channel_member_safe
CREATE OR REPLACE FUNCTION public.is_channel_member_safe(channel_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM channel_members 
    WHERE channel_id = channel_uuid AND user_id = user_uuid
  );
$$;

-- Funktion: is_initiative_team_member_safe
CREATE OR REPLACE FUNCTION public.is_initiative_team_member_safe(initiative_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM green_initiative_team_members 
    WHERE initiative_id = initiative_uuid AND user_id = user_uuid
  );
$$;

-- Funktion: user_can_access_project
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id 
    AND (
      p.owner_id = user_id 
      OR p.team_members::jsonb ? user_id::text
    )
  );
END;
$$;

-- Funktion: is_valid_uuid
CREATE OR REPLACE FUNCTION public.is_valid_uuid(input_text text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  PERFORM input_text::UUID;
  RETURN TRUE;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN FALSE;
END;
$$;

-- Funktion: get_employee_company_data
CREATE OR REPLACE FUNCTION public.get_employee_company_data()
RETURNS TABLE(
  id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, 
  name text, team text, "position" text, role text, status text, email text, 
  phone text, mobile_phone text, start_date date, birth_date date, nationality text,
  street text, city text, postal_code text, country text, emergency_contact_name text,
  emergency_contact_relation text, emergency_contact_phone text, contract_type text,
  working_hours numeric, social_security_number text, tax_id text, gender text,
  employment_type text, marital_status text, contract_end_date date, weekly_hours numeric,
  cost_center text, employee_number text, manager_id uuid, salary_amount numeric,
  salary_currency text, vacation_days integer, joining_date date, language_skills jsonb,
  personal_development_goals text, last_training_date date, last_promotion_date date,
  access_data jsonb, benefits jsonb, health_info jsonb, driver_license_class text,
  years_experience integer, security_clearance text, medical_checkups jsonb,
  active_memberships jsonb, onboarding_checklist jsonb, notes text, first_name text,
  last_name text, department text, archived boolean, archived_at timestamp with time zone,
  archived_by uuid, deletion_requested boolean, deletion_requested_at timestamp with time zone,
  deletion_approved_by uuid, onboarding_required boolean, last_active timestamp with time zone,
  company_id uuid, metadata jsonb, company_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    e.id, e.created_at, e.updated_at, e.name, e.team, e."position", e.role, e.status,
    e.email, e.phone, e.mobile_phone, e.start_date, e.birth_date, e.nationality,
    e.street, e.city, e.postal_code, e.country, e.emergency_contact_name,
    e.emergency_contact_relation, e.emergency_contact_phone, e.contract_type,
    e.working_hours, e.social_security_number, e.tax_id, e.gender, e.employment_type,
    e.marital_status, e.contract_end_date, e.weekly_hours, e.cost_center,
    e.employee_number, e.manager_id, e.salary_amount, e.salary_currency,
    e.vacation_days, e.joining_date, e.language_skills, e.personal_development_goals,
    e.last_training_date, e.last_promotion_date, e.access_data, e.benefits,
    e.health_info, e.driver_license_class, e.years_experience, e.security_clearance,
    e.medical_checkups, e.active_memberships, e.onboarding_checklist, e.notes,
    e.first_name, e.last_name, e.department, e.archived, e.archived_at,
    e.archived_by, e.deletion_requested, e.deletion_requested_at,
    e.deletion_approved_by, e.onboarding_required, e.last_active,
    e.company_id, e.metadata, c.name AS company_name
  FROM employees e
  LEFT JOIN companies c ON (e.company_id = c.id);
$$;