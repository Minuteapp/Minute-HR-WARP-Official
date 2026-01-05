-- Phase 1.1: Add is_active field to organizational_units (zusätzlich zum status Feld)
ALTER TABLE public.organizational_units 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_organizational_units_is_active 
ON public.organizational_units(is_active);

-- Phase 1.2: Insert seed data for departments using actual table structure
INSERT INTO public.organizational_units (
  company_id,
  name,
  type,
  description,
  status,
  is_active,
  metadata
)
SELECT 
  c.id as company_id,
  dept.name,
  'department'::text as type,
  dept.description,
  'active'::text as status,
  true as is_active,
  jsonb_build_object('code', dept.code) as metadata
FROM companies c
CROSS JOIN (
  VALUES 
    ('Engineering', 'ENG', 'Software-Entwicklung und technische Infrastruktur'),
    ('Human Resources', 'HR', 'Personalmanagement und Mitarbeiterentwicklung'),
    ('Finance', 'FIN', 'Finanzen, Controlling und Buchhaltung'),
    ('Sales', 'SALES', 'Vertrieb und Kundenbetreuung'),
    ('Marketing', 'MKT', 'Marketing und Kommunikation')
) as dept(name, code, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.organizational_units ou 
  WHERE ou.company_id = c.id AND ou.name = dept.name
);