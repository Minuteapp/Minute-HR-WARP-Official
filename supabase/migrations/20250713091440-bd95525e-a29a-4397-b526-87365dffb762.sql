-- Aktualisiere user_roles für Hiprocall Mitarbeiter
-- Verbinde Daniel Häuslein (Employee) mit Hiprocall

-- Finde die User-ID vom Mitarbeiter Daniel Häuslein
UPDATE user_roles 
SET company_id = '51b32028-fb21-4e94-a9c2-794c3d0a07c8'
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'd.haeuslein@hiprocall.de'
);