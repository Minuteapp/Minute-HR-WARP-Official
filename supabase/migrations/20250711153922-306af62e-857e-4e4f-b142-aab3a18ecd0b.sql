-- Erstelle user_roles Eintrag für den Superadmin-Benutzer falls nicht vorhanden
INSERT INTO public.user_roles (user_id, role) 
VALUES ('e7219c39-dbe0-45f3-a6b8-cbbf20517bb2', 'superadmin')
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';

-- Prüfe ob der Eintrag jetzt existiert
SELECT * FROM public.user_roles WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2';