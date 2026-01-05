-- Erweitere roadmaps Tabelle um Team-Zuordnung und Sichtbarkeit
ALTER TABLE roadmaps 
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'team' CHECK (visibility IN ('private', 'team', 'department', 'company')),
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Bestehende Roadmaps: owner_id = created_by setzen
UPDATE roadmaps SET owner_id = created_by WHERE owner_id IS NULL AND created_by IS NOT NULL;

-- Index für Performance bei Team-Abfragen
CREATE INDEX IF NOT EXISTS idx_roadmaps_team_id ON roadmaps(team_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_owner_id ON roadmaps(owner_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_visibility ON roadmaps(visibility);