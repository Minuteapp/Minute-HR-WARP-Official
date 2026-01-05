-- Create salary_components table for PayTypesModule
CREATE TABLE IF NOT EXISTS public.salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_type TEXT NOT NULL CHECK (component_type IN ('base', 'bonus', 'overtime', 'deduction', 'benefit')),
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  description TEXT,
  is_taxable BOOLEAN DEFAULT true,
  is_social_security BOOLEAN DEFAULT true,
  datev_account TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Alle authentifizierten Nutzer können Lohnarten sehen
CREATE POLICY "Authenticated users can view salary components"
  ON public.salary_components
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Admins können Lohnarten erstellen
CREATE POLICY "Admins can create salary components"
  ON public.salary_components
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- RLS Policy: Admins können Lohnarten aktualisieren
CREATE POLICY "Admins can update salary components"
  ON public.salary_components
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- RLS Policy: Admins können Lohnarten löschen
CREATE POLICY "Admins can delete salary components"
  ON public.salary_components
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- Trigger für updated_at
CREATE TRIGGER update_salary_components_updated_at
  BEFORE UPDATE ON public.salary_components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();