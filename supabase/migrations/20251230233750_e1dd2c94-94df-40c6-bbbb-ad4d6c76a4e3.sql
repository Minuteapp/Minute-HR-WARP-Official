-- =====================================================
-- TENANT ISOLATION FIX: Remove all OR auth.uid() exceptions
-- This ensures data is ONLY visible within the correct tenant
-- =====================================================

-- 1. FIX: documents table - remove created_by exception
DROP POLICY IF EXISTS "tenant_documents_select" ON public.documents;
DROP POLICY IF EXISTS "tenant_documents_insert" ON public.documents;
DROP POLICY IF EXISTS "tenant_documents_update" ON public.documents;
DROP POLICY IF EXISTS "tenant_documents_delete" ON public.documents;

CREATE POLICY "tenant_documents_select" ON public.documents
  FOR SELECT USING (public.can_access_tenant(company_id));

CREATE POLICY "tenant_documents_insert" ON public.documents
  FOR INSERT WITH CHECK (public.can_write_tenant(company_id));

CREATE POLICY "tenant_documents_update" ON public.documents
  FOR UPDATE USING (public.can_write_tenant(company_id))
  WITH CHECK (public.can_write_tenant(company_id));

CREATE POLICY "tenant_documents_delete" ON public.documents
  FOR DELETE USING (public.can_write_tenant(company_id));