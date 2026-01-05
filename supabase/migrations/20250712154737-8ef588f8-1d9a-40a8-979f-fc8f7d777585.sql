-- Erstelle company_modules Tabelle falls nicht vorhanden
CREATE TABLE IF NOT EXISTS public.company_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT 'package',
  base_price DECIMAL(10,2) DEFAULT 0.00,
  billing_type TEXT DEFAULT 'monthly' CHECK (billing_type IN ('monthly', 'yearly', 'one_time', 'usage')),
  is_active BOOLEAN DEFAULT true,
  required_modules TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erstelle company_module_assignments Tabelle falls nicht vorhanden
CREATE TABLE IF NOT EXISTS public.company_module_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  custom_price DECIMAL(10,2),
  enabled_at TIMESTAMP WITH TIME ZONE,
  disabled_at TIMESTAMP WITH TIME ZONE,
  enabled_by UUID,
  disabled_by UUID,
  billing_cycle TEXT DEFAULT 'monthly',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, module_key)
);

-- Logo URL und Description Spalten zu companies hinzufügen falls nicht vorhanden
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS description TEXT;