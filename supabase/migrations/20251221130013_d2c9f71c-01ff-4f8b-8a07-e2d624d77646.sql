-- ============================================
-- 80/20 MASTER ENFORCEMENT - Schema Extension
-- Phase 1: Nur fehlende Spalten hinzufügen
-- ============================================

-- 1. settings_definitions: Neue 80/20 Spalten
ALTER TABLE public.settings_definitions 
ADD COLUMN IF NOT EXISTS visibility_level TEXT DEFAULT 'standard';

ALTER TABLE public.settings_definitions 
ADD COLUMN IF NOT EXISTS enforcement TEXT[] DEFAULT ARRAY['ui', 'api', 'chatbot', 'automation', 'ai'];

ALTER TABLE public.settings_definitions 
ADD COLUMN IF NOT EXISTS audit_required BOOLEAN DEFAULT false;

-- 2. settings_audit_log: Fehlende Spalte für Enforcement-Channel
ALTER TABLE public.settings_audit_log 
ADD COLUMN IF NOT EXISTS enforcement_channel TEXT;

-- 3. Bestehende Einstellungen mit 80/20 Defaults befüllen
UPDATE public.settings_definitions
SET 
  recommended_value = COALESCE(recommended_value, default_value),
  visibility_level = COALESCE(visibility_level, 'standard'),
  risk_level = COALESCE(risk_level, 'low'),
  audit_required = COALESCE(audit_required, false);