-- =====================================================
-- OPTION 1: User zu SuperAdmin machen (Schnelle Lösung)
-- =====================================================

-- User d.haeuslein@hiprocall.de zu SuperAdmin machen
UPDATE user_roles 
SET role = 'superadmin'
WHERE user_id = '046aa705-5009-4387-b148-6646d569b9a2';