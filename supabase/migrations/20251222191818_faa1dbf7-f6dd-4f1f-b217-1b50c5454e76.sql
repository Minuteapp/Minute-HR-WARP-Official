-- =============================================================================
-- FIX 1: UNIQUE-Constraint auf user_id in absence_settings
-- =============================================================================
ALTER TABLE public.absence_settings 
ADD CONSTRAINT absence_settings_user_id_key UNIQUE (user_id);

-- =============================================================================
-- FIX 2: Gefährliche 'qual: true' SELECT-Policies entfernen
-- Diese Policies erlauben ALLEN authentifizierten Nutzern ALLE Daten zu sehen!
-- =============================================================================

-- absence_requests
DROP POLICY IF EXISTS "Users can view absence requests" ON public.absence_requests;

-- time_entries
DROP POLICY IF EXISTS "Users can view time entries" ON public.time_entries;

-- business_trips
DROP POLICY IF EXISTS "Users can view business trips" ON public.business_trips;

-- employee_benefits
DROP POLICY IF EXISTS "Users can view employee benefits" ON public.employee_benefits;

-- employee_documents
DROP POLICY IF EXISTS "Users can view employee documents" ON public.employee_documents;

-- employee_warnings
DROP POLICY IF EXISTS "Users can view employee warnings" ON public.employee_warnings;

-- =============================================================================
-- HINWEIS: Die korrekten Policies mit company_id-Prüfung bleiben bestehen:
-- z.B. "Company members can view absence requests" mit 
-- (company_id = get_effective_company_id())
-- =============================================================================