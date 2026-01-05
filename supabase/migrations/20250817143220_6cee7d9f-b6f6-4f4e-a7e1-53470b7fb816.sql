-- Secure the employee_company_view by adding RLS policies
-- First, enable RLS on the view (this applies RLS to the view itself)
ALTER VIEW public.employee_company_view SET (security_barrier = true);

-- Create a more secure version of the view that respects RLS
-- Drop the existing view first
DROP VIEW IF EXISTS public.employee_company_view;

-- Recreate the view with security considerations
CREATE VIEW public.employee_company_view AS
SELECT 
    e.id,
    e.created_at,
    e.updated_at,
    e.name,
    e.team,
    e.position,
    e.role,
    e.status,
    e.email,
    e.phone,
    e.mobile_phone,
    e.start_date,
    e.birth_date,
    e.nationality,
    e.street,
    e.city,
    e.postal_code,
    e.country,
    e.emergency_contact_name,
    e.emergency_contact_relation,
    e.emergency_contact_phone,
    e.contract_type,
    e.working_hours,
    e.social_security_number,
    e.tax_id,
    e.gender,
    e.employment_type,
    e.marital_status,
    e.contract_end_date,
    e.weekly_hours,
    e.cost_center,
    e.employee_number,
    e.manager_id,
    e.salary_amount,
    e.salary_currency,
    e.vacation_days,
    e.joining_date,
    e.language_skills,
    e.personal_development_goals,
    e.last_training_date,
    e.last_promotion_date,
    e.access_data,
    e.benefits,
    e.health_info,
    e.driver_license_class,
    e.years_experience,
    e.security_clearance,
    e.medical_checkups,
    e.active_memberships,
    e.onboarding_checklist,
    e.notes,
    e.first_name,
    e.last_name,
    e.department,
    e.archived,
    e.archived_at,
    e.archived_by,
    e.deletion_requested,
    e.deletion_requested_at,
    e.deletion_approved_by,
    e.onboarding_required,
    e.last_active,
    e.company_id,
    e.metadata,
    c.name AS company_name
FROM employees e
LEFT JOIN companies c ON (e.company_id = c.id);

-- Enable RLS on the view
ALTER VIEW public.employee_company_view ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the view
CREATE POLICY "Users can view employees in their company via view"
ON public.employee_company_view
FOR SELECT
USING (
  -- Users can see employees from their own company
  company_id = get_user_company_id(auth.uid())
  OR 
  -- Admins and HR can see all employees
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'superadmin')
  )
  OR
  -- Users can see their own employee record
  id = auth.uid()
);