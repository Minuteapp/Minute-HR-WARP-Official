
-- =====================================================
-- PHASE 7f: STORAGE MAPPING TABELLE UND BACKFILL (FINAL)
-- =====================================================

-- 1. Erstelle Storage Mapping Tabelle
CREATE TABLE IF NOT EXISTS public.storage_object_tenant_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id TEXT NOT NULL,
  object_path TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  owner_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bucket_id, object_path)
);

ALTER TABLE public.storage_object_tenant_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_object_tenant_mapping FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant users can view own mappings" ON public.storage_object_tenant_mapping;
CREATE POLICY "Tenant users can view own mappings"
ON public.storage_object_tenant_mapping FOR SELECT
USING (company_id = public.current_tenant_id());

DROP POLICY IF EXISTS "Tenant users can insert own mappings" ON public.storage_object_tenant_mapping;
CREATE POLICY "Tenant users can insert own mappings"
ON public.storage_object_tenant_mapping FOR INSERT
WITH CHECK (company_id = public.current_tenant_id());

CREATE INDEX IF NOT EXISTS idx_storage_mapping_company ON public.storage_object_tenant_mapping(company_id);

-- 2. Erstelle Audit-Trigger neu (falls gelöscht)
DROP TRIGGER IF EXISTS log_absence_audit ON public.absence_requests;
CREATE TRIGGER log_absence_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.absence_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_absence_changes();

-- 3. Storage Mappings erstellen (nur für gültige Companies)
INSERT INTO public.storage_object_tenant_mapping (bucket_id, object_path, company_id, owner_user_id)
SELECT 
  so.bucket_id,
  so.name as object_path,
  ur.company_id,
  so.owner as owner_user_id
FROM storage.objects so
JOIN public.user_roles ur ON ur.user_id = so.owner
JOIN public.companies c ON c.id = ur.company_id
WHERE NOT EXISTS (SELECT 1 FROM public.storage_object_tenant_mapping m WHERE m.bucket_id = so.bucket_id AND m.object_path = so.name)
ON CONFLICT (bucket_id, object_path) DO NOTHING;

-- 4. Quarantine unmapped Storage Objects (in separater Tabelle)
INSERT INTO quarantine.storage_objects (bucket_id, object_path, original_owner_id, reason)
SELECT so.bucket_id, so.name, so.owner, 'no_tenant_mapping'
FROM storage.objects so
WHERE so.owner IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.storage_object_tenant_mapping m WHERE m.bucket_id = so.bucket_id AND m.object_path = so.name)
  AND NOT EXISTS (SELECT 1 FROM quarantine.storage_objects q WHERE q.bucket_id = so.bucket_id AND q.object_path = so.name);
