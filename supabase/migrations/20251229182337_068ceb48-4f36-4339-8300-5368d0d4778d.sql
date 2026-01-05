-- Step 1: Beide company_id Spalten nullable machen
ALTER TABLE public.user_roles ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE public.security_audit_logs ALTER COLUMN company_id DROP NOT NULL;

-- Step 2: SuperAdmin-Rolle für minuteapp@outlook.de hinzufügen
INSERT INTO public.user_roles (user_id, role, company_id)
VALUES ('e7219c39-dbe0-45f3-a6b8-cbbf20517bb2', 'superadmin', NULL)
ON CONFLICT (user_id, role) DO NOTHING;