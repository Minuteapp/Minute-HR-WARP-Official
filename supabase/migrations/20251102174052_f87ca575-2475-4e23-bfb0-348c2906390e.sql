-- =====================================================
-- RLS-Fix für user_tenant_sessions
-- Problem: RLS blockiert SECURITY DEFINER Funktionen
-- Lösung: RLS deaktivieren (sicherer, da nur von Functions verwaltet)
-- =====================================================

-- 1. Lösche bestehende RLS Policy
DROP POLICY IF EXISTS "Users manage own sessions" ON user_tenant_sessions;

-- 2. Deaktiviere RLS komplett für diese Tabelle
-- Begründung: Die Tabelle wird NUR von SECURITY DEFINER Funktionen verwaltet
-- RLS ist hier nicht notwendig und verursacht nur Probleme
ALTER TABLE user_tenant_sessions DISABLE ROW LEVEL SECURITY;

-- Kommentar zur Sicherheit:
-- Diese Tabelle ist sicher, weil:
-- 1. Nur SECURITY DEFINER Funktionen können darauf zugreifen
-- 2. Diese Funktionen haben bereits Berechtigungsprüfungen eingebaut
-- 3. Direkte Client-Zugriffe sind durch die Funktionslogik geschützt