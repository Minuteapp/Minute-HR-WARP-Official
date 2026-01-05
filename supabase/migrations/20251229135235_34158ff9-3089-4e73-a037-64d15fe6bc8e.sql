
-- =====================================================
-- PHASE 6: VIEWS MIT TENANT-SCOPING
-- Alle Views bekommen company_id Filter
-- =====================================================

-- 1. absence_requests_with_employee - MIT Tenant-Filter
DROP VIEW IF EXISTS public.absence_requests_with_employee;
CREATE OR REPLACE VIEW public.absence_requests_with_employee AS
SELECT 
    ar.id,
    ar.user_id,
    ar.type,
    ar.absence_type,
    ar.start_date,
    ar.end_date,
    ar.status,
    ar.reason,
    ar.half_day,
    ar.is_partial_day,
    ar.start_time,
    ar.end_time,
    ar.partial_start_time,
    ar.partial_end_time,
    ar.substitute_id,
    ar.substitute_user_id,
    ar.created_at,
    ar.updated_at,
    ar.approved_by,
    ar.approved_at,
    ar.rejected_by,
    ar.rejected_at,
    ar.rejection_reason,
    ar.document_required,
    ar.comments,
    ar.department AS request_department,
    ar.employee_name AS request_employee_name,
    ar.company_id,
    ((e.first_name || ' '::text) || e.last_name) AS employee_name,
    e.department,
    e.city AS location,
    e.email,
    e.phone,
    e.employee_number,
    e."position",
    ((sub.first_name || ' '::text) || sub.last_name) AS substitute_name,
    sub.email AS substitute_email
FROM absence_requests ar
LEFT JOIN employees e ON e.id = ar.user_id AND e.company_id = ar.company_id
LEFT JOIN employees sub ON sub.id = ar.substitute_id AND sub.company_id = ar.company_id
WHERE ar.company_id = public.current_tenant_id();

-- 2. employees_with_company - MIT Tenant-Filter
DROP VIEW IF EXISTS public.employees_with_company;
CREATE OR REPLACE VIEW public.employees_with_company AS
SELECT 
    e.id,
    e.name,
    e.first_name,
    e.last_name,
    e.email,
    e.employee_number,
    e.department,
    e."position",
    e.team,
    e.employment_type,
    e.start_date,
    e.status,
    e.company_id,
    c.name AS company_name
FROM employees e
LEFT JOIN companies c ON c.id = e.company_id
WHERE e.company_id = public.current_tenant_id();

-- 3. helpdesk_tickets_with_sla - MIT Tenant-Filter
DROP VIEW IF EXISTS public.helpdesk_tickets_with_sla;
CREATE OR REPLACE VIEW public.helpdesk_tickets_with_sla AS
SELECT 
    t.id,
    t.ticket_number,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.category,
    t.subcategory,
    t.tags,
    t.created_by,
    t.assigned_to,
    t.assigned_to_team,
    t.requester_email,
    t.requester_name,
    t.sla_due_date,
    t.first_response_due,
    t.resolution_due,
    t.first_response_at,
    t.resolved_at,
    t.closed_at,
    t.business_impact,
    t.cost_impact,
    t.affected_employees,
    t.tenant_id,
    t.company_id,
    t.language,
    t.ai_suggested_responses,
    t.similar_tickets,
    t.auto_classification_confidence,
    t.escalation_level,
    t.related_module,
    t.related_record_id,
    t.integration_data,
    t.metadata,
    t.created_at,
    t.updated_at,
    t.department,
    t.location,
    CASE
        WHEN t.sla_due_date IS NOT NULL THEN (EXTRACT(epoch FROM (t.sla_due_date - now())) / 3600::numeric)
        ELSE NULL::numeric
    END AS sla_hours_remaining,
    CASE
        WHEN t.sla_due_date IS NULL THEN 'no_sla'::text
        WHEN t.sla_due_date < now() THEN 'overdue'::text
        WHEN (EXTRACT(epoch FROM (t.sla_due_date - now())) / 3600::numeric) < 6::numeric THEN 'critical'::text
        WHEN (EXTRACT(epoch FROM (t.sla_due_date - now())) / 3600::numeric) < 12::numeric THEN 'warning'::text
        ELSE 'ok'::text
    END AS sla_status
FROM helpdesk_tickets t
WHERE t.company_id = public.current_tenant_id();

-- 4. customer_support_access_log - MIT Tenant-Filter (für Target-Tenant)
DROP VIEW IF EXISTS public.customer_support_access_log;
CREATE OR REPLACE VIEW public.customer_support_access_log AS
SELECT 
    s.id,
    s.started_at,
    s.ended_at,
    s.mode,
    s.justification_type,
    s.is_pre_tenant,
    s.target_tenant_id,
    s.target_tenant_id AS company_id,
    CASE
        WHEN c.support_access_transparency THEN s.justification
        ELSE 'Support-Zugriff'::text
    END AS reason,
    (EXTRACT(epoch FROM (COALESCE(s.ended_at, now()) - s.started_at)) / 60::numeric) AS duration_minutes
FROM impersonation_sessions s
JOIN companies c ON c.id = s.target_tenant_id
WHERE s.status = ANY (ARRAY['ended'::text, 'expired'::text])
  AND s.target_tenant_id = public.current_tenant_id();

-- 5. Stelle sicher dass current_tenant_id() existiert und korrekt funktioniert
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- 1. Prüfe aktive Impersonation-Session
  SELECT impersonated_company_id INTO v_tenant_id
  FROM active_tenant_sessions
  WHERE session_user_id = auth.uid()
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
  
  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;
  
  -- 2. Aus user_roles
  SELECT company_id INTO v_tenant_id
  FROM user_roles
  WHERE user_id = auth.uid()
    AND company_id IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;
  
  -- 3. Aus employees
  SELECT company_id INTO v_tenant_id
  FROM employees
  WHERE user_id = auth.uid()
    AND company_id IS NOT NULL
  LIMIT 1;
  
  RETURN v_tenant_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO anon;
