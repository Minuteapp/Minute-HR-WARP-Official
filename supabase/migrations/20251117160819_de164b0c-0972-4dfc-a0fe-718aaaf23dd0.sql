-- Entferne DEFAULT-Werte von Branding-Feldern in companies Tabelle
-- Damit neue Firmen komplett clean ohne Mock-Daten erstellt werden

ALTER TABLE companies 
  ALTER COLUMN primary_color DROP DEFAULT,
  ALTER COLUMN secondary_color DROP DEFAULT,
  ALTER COLUMN brand_font DROP DEFAULT;

-- Kommentar: Bestehende Firmen behalten ihre Werte
-- Nur neue Firmen werden mit NULL-Werten erstellt
-- Frontend muss Fallback-Werte bereitstellen