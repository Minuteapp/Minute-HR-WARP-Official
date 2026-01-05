
-- =====================================================
-- PHASE 6b: Views mit SECURITY INVOKER (statt DEFINER)
-- Umstellung auf sicherere View-Variante
-- =====================================================

-- Setze Views auf SECURITY INVOKER (Standard-Verhalten)
-- Die Tenant-Filterung erfolgt weiterhin über current_tenant_id()

ALTER VIEW public.absence_requests_with_employee SET (security_invoker = true);
ALTER VIEW public.employees_with_company SET (security_invoker = true);
ALTER VIEW public.helpdesk_tickets_with_sla SET (security_invoker = true);
ALTER VIEW public.customer_support_access_log SET (security_invoker = true);
ALTER VIEW public.migration_status_summary SET (security_invoker = true);
