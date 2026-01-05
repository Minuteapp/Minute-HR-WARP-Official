-- 1. Storage RLS Policies reparieren
-- Entferne restriktive RLS Policies für Buckets, da diese systemweit verfügbar sein müssen
DROP POLICY IF EXISTS "Allow authenticated users to create buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Allow authenticated users to view buckets" ON storage.buckets;

-- Erstelle permissivere Policies für Storage Buckets  
CREATE POLICY "Allow all to view buckets" ON storage.buckets FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage buckets" ON storage.buckets FOR ALL USING (auth.role() = 'authenticated');

-- 2. Tenant Context reparieren - Erstelle die fehlende Firma
INSERT INTO public.companies (
    id,
    name,
    slug,
    subscription_status,
    is_active,
    employee_count,
    created_at
) VALUES (
    gen_random_uuid(),
    'HiProCall GmbH',
    'hiprocall-gmbh',
    'free',
    true,
    0,
    now()
) ON CONFLICT (slug) DO NOTHING;

-- 3. Superadmin sollte Zugriff auf alle Firmen haben - Update RLS für companies
DROP POLICY IF EXISTS "Companies are viewable based on tenant context" ON public.companies;

CREATE POLICY "Companies are viewable based on tenant context or superadmin" 
ON public.companies FOR SELECT 
USING (
  -- Superadmin kann alle Firmen sehen
  is_superadmin_safe(auth.uid()) OR
  -- Im Tenant-Kontext: nur die entsprechende Firma
  (is_in_tenant_context() AND id = get_tenant_company_id_safe()) OR
  -- Außerhalb Tenant-Kontext: alle aktiven Firmen
  (NOT is_in_tenant_context() AND is_active = true)
);