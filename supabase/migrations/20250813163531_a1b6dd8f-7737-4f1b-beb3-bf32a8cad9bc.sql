-- ================================================
-- SPRINT 1: Policies und Stammdaten-Setup
-- ================================================

-- Helper Function für User Company ID
CREATE OR REPLACE FUNCTION get_user_company_id(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT ur.company_id 
    FROM public.user_roles ur 
    WHERE ur.user_id = $1
    LIMIT 1
  );
END;
$$;

-- Company Isolation Policies
CREATE POLICY "Company Isolation - departments" ON public.departments
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "Company Isolation - positions" ON public.positions
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "Company Isolation - hr_cases" ON public.hr_cases
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "Company Isolation - arbeitszeit_regelungen" ON public.arbeitszeit_regelungen
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "Company Isolation - de_abwesenheitsarten" ON public.de_abwesenheitsarten
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Employee access policies for German tables
CREATE POLICY "Employee Access - de_abwesenheitsantraege" ON public.de_abwesenheitsantraege
FOR ALL USING (
  mitarbeiter_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr', 'superadmin'))
);

-- Auto-assign company_id triggers
CREATE TRIGGER auto_assign_company_departments
  BEFORE INSERT ON public.departments
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_positions
  BEFORE INSERT ON public.positions
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_hr_cases
  BEFORE INSERT ON public.hr_cases
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_arbeitszeit_regelungen
  BEFORE INSERT ON public.arbeitszeit_regelungen
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_de_abwesenheitsarten
  BEFORE INSERT ON public.de_abwesenheitsarten
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_de_abwesenheitsantraege
  BEFORE INSERT ON public.de_abwesenheitsantraege
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

-- Sequences für Nummernkreise
CREATE SEQUENCE IF NOT EXISTS hr_case_number_seq START 1000;

-- HR Case Number Generation
CREATE OR REPLACE FUNCTION generate_hr_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL THEN
    NEW.case_number := 'HR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('hr_case_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_hr_case_number_trigger
  BEFORE INSERT ON public.hr_cases
  FOR EACH ROW EXECUTE FUNCTION generate_hr_case_number();

-- Updated_at Triggers
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_hr_cases_updated_at
  BEFORE UPDATE ON public.hr_cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Standard deutsche Abwesenheitsarten einfügen
INSERT INTO public.de_abwesenheitsarten (name, code, kategorie, ist_urlaubstag, nachweis_erforderlich, nachweis_ab_tag, vorlaufzeit_tage, max_tage_pro_jahr, farbe, icon) VALUES
('Erholungsurlaub', 'URL', 'urlaub', true, false, null, 14, 30, '#22C55E', 'Palmtree'),
('Krankheit', 'KRA', 'krankheit', false, true, 3, 0, null, '#EF4444', 'Heart'),
('Bildungsurlaub', 'BIL', 'fortbildung', true, true, 1, 30, 5, '#3B82F6', 'GraduationCap'),
('Sonderurlaub bezahlt', 'SOB', 'sonderurlaub', true, true, 1, 7, 5, '#8B5CF6', 'Star'),
('Sonderurlaub unbezahlt', 'SOU', 'sonderurlaub', false, true, 1, 14, 10, '#6B7280', 'Clock'),
('Mutterschutz', 'MUT', 'schutzzeit', false, true, 1, 30, null, '#EC4899', 'Baby'),
('Elternzeit', 'ELT', 'schutzzeit', false, true, 1, 60, null, '#F59E0B', 'Users'),
('Gleitzeit Abbau', 'GLA', 'gleitzeit', true, false, null, 1, null, '#10B981', 'Clock')
ON CONFLICT (code) DO NOTHING;

-- Standard Arbeitszeitregelung für Deutschland
INSERT INTO public.arbeitszeit_regelungen (name, typ, wochenstunden, taeglich_max_stunden, kernzeit_start, kernzeit_ende, compliance_regeln) VALUES
('Standard Vollzeit (DE)', 'vollzeit', 40, 8, '09:00', '15:00', '{"arbeitszeitgesetz": true, "pausenregelung": "6h_30min", "ruhezeit": "11h"}'),
('Teilzeit 30h (DE)', 'teilzeit', 30, 6, '09:00', '14:00', '{"arbeitszeitgesetz": true, "pausenregelung": "6h_30min", "ruhezeit": "11h"}'),
('Geringfügig 450€ (DE)', 'geringfuegig', 10, 8, null, null, '{"minijob": true, "keine_sozialversicherung": true}')
ON CONFLICT DO NOTHING;