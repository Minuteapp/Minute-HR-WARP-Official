-- Erstelle Tabelle für Mapbox-Einstellungen falls sie nicht existiert
CREATE TABLE IF NOT EXISTS mapbox_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  public_token TEXT NOT NULL DEFAULT 'pk.your_mapbox_public_token_here',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Füge einen Standard-Eintrag hinzu falls noch keiner existiert
INSERT INTO mapbox_settings (public_token) 
SELECT 'pk.your_mapbox_public_token_here'
WHERE NOT EXISTS (SELECT 1 FROM mapbox_settings);