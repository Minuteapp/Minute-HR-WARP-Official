-- Sprint 1: Translation System Foundation Schema
-- Glossar-Tabelle (tenant-spezifisch)
CREATE TABLE IF NOT EXISTS public.glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  preferred TEXT NOT NULL,
  forbidden TEXT[],
  context TEXT,
  examples JSONB,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, term)
);

-- Post-Edit Memory (User-Korrekturen)
CREATE TABLE IF NOT EXISTS public.translation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  source_lang TEXT NOT NULL,
  target_text TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  corrected_by UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 1,
  quality_score REAL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Translation Quality Metrics
CREATE TABLE IF NOT EXISTS public.translation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  source_lang TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  text_hash TEXT NOT NULL,
  latency_ms INTEGER,
  glossary_hit BOOLEAN DEFAULT false,
  memory_hit BOOLEAN DEFAULT false,
  user_corrected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices für Performance
CREATE INDEX IF NOT EXISTS idx_glossary_tenant ON public.glossary_terms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_glossary_term ON public.glossary_terms(term);
CREATE INDEX IF NOT EXISTS idx_translation_memory_tenant_lang ON public.translation_memory(tenant_id, source_lang, target_lang);
CREATE INDEX IF NOT EXISTS idx_translation_memory_text ON public.translation_memory(source_text, target_text);
CREATE INDEX IF NOT EXISTS idx_translation_metrics_tenant ON public.translation_metrics(tenant_id);

-- RLS Policies aktivieren
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_metrics ENABLE ROW LEVEL SECURITY;

-- Policies für Glossar (Tenant-Isolation)
CREATE POLICY "Users can view their tenant glossary" ON public.glossary_terms
  FOR SELECT USING (
    tenant_id IN (
      SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage glossary" ON public.glossary_terms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = glossary_terms.tenant_id
      AND role IN ('superadmin', 'admin')
    )
  );

-- Policies für Translation Memory
CREATE POLICY "Users can view their tenant translation memory" ON public.translation_memory
  FOR SELECT USING (
    tenant_id IN (
      SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert corrections" ON public.translation_memory
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own corrections" ON public.translation_memory
  FOR UPDATE USING (
    corrected_by = auth.uid()
  );

-- Policies für Translation Metrics
CREATE POLICY "System can insert metrics" ON public.translation_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view metrics" ON public.translation_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = translation_metrics.tenant_id
      AND role IN ('superadmin', 'admin')
    )
  );

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_glossary_terms_updated_at BEFORE UPDATE ON public.glossary_terms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translation_memory_updated_at BEFORE UPDATE ON public.translation_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();