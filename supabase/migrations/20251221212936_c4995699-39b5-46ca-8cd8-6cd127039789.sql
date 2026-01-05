-- Neue Tabelle für Travel-Rollen-Definitionen
CREATE TABLE IF NOT EXISTS public.travel_role_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key TEXT UNIQUE NOT NULL,
  role_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  main_features JSONB DEFAULT '[]'::JSONB,
  stats_config JSONB DEFAULT '{}'::JSONB,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Neue Tabelle für Travel-Rollen-Berechtigungen (Feature-Level)
CREATE TABLE IF NOT EXISTS public.travel_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key TEXT NOT NULL REFERENCES public.travel_role_definitions(role_key) ON DELETE CASCADE,
  category TEXT NOT NULL,
  category_icon TEXT,
  feature_key TEXT NOT NULL,
  feature_label TEXT NOT NULL,
  granted BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_key, category, feature_key)
);

-- RLS aktivieren
ALTER TABLE public.travel_role_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies für travel_role_definitions (alle authentifizierten Benutzer können lesen)
CREATE POLICY "travel_role_definitions_select"
  ON public.travel_role_definitions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies für travel_role_permissions (alle authentifizierten Benutzer können lesen)
CREATE POLICY "travel_role_permissions_select"
  ON public.travel_role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Standardrollen einfügen
INSERT INTO public.travel_role_definitions (role_key, role_name, description, icon, color, main_features, stats_config, sort_order)
VALUES 
  ('admin', 'System Administrator', 'Vollständige Systemverwaltung und alle Berechtigungen', 'shield', 'violet', 
   '["Vollständiger Systemzugriff", "Alle Mitarbeiter verwalten", "Budget-Kontrolle", "Richtlinien konfigurieren", "Integrationen verwalten", "Audit-Logs einsehen"]'::JSONB,
   '{"employees": true, "departments": true, "budget": true, "permissions": true}'::JSONB, 1),
  ('hr_admin', 'HR Administrator', 'Personalverwaltung und Mitarbeiter-Budgets', 'users-cog', 'blue',
   '["Mitarbeiterverwaltung", "Urlaubs-/Abwesenheitsmanagement", "Team-Budgets verwalten", "Genehmigungsworkflows", "Reports erstellen", "Richtlinien anpassen"]'::JSONB,
   '{"employees": true, "departments": true, "budget": true, "permissions": false}'::JSONB, 2),
  ('team_lead', 'Teamleiter', 'Team-Verwaltung und Genehmigungen', 'user-cog', 'orange',
   '["Team-Mitglieder einsehen", "Team-Anträge genehmigen", "Team-Budget verwalten", "Team-Reports erstellen", "Spesen prüfen"]'::JSONB,
   '{"team_members": true, "team": true, "budget": true, "pending": true}'::JSONB, 3),
  ('employee', 'Mitarbeiter', 'Standard-Mitarbeiterrechte für Reisen und Spesen', 'user', 'green',
   '["Eigene Reiseanträge erstellen", "Eigene Spesen einreichen", "Eigenes Budget einsehen", "Belege hochladen", "Status verfolgen"]'::JSONB,
   '{"own_trips": true, "own_budget": true, "pending": true, "approved": true}'::JSONB, 4)
ON CONFLICT (role_key) DO NOTHING;

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_travel_role_permissions_role ON public.travel_role_permissions(role_key);
CREATE INDEX IF NOT EXISTS idx_travel_role_permissions_category ON public.travel_role_permissions(category);