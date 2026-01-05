-- Drop the failed tables if they exist
DROP TABLE IF EXISTS public.tenant_global_settings CASCADE;
DROP TABLE IF EXISTS public.user_global_settings CASCADE;
DROP TABLE IF EXISTS public.translations CASCADE;

-- Erstelle vereinfachte Tabelle für globale Einstellungen (pro Benutzer)
CREATE TABLE public.global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL DEFAULT 'de',
  dark_mode_enabled BOOLEAN NOT NULL DEFAULT true,
  dark_mode_mode VARCHAR(10) NOT NULL DEFAULT 'auto', -- 'light', 'dark', 'auto'
  dark_mode_auto_start_hour INT NOT NULL DEFAULT 19,
  dark_mode_auto_end_hour INT NOT NULL DEFAULT 7,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  timezone VARCHAR(100) NOT NULL DEFAULT 'Europe/Berlin',
  date_format VARCHAR(20) NOT NULL DEFAULT 'DD.MM.YYYY',
  decimal_separator VARCHAR(1) NOT NULL DEFAULT ',',
  thousands_separator VARCHAR(1) NOT NULL DEFAULT '.',
  rtl_enabled BOOLEAN NOT NULL DEFAULT false,
  high_contrast_enabled BOOLEAN NOT NULL DEFAULT false,
  screen_reader_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_global_settings UNIQUE (user_id)
);

-- Erstelle Tabelle für Übersetzungen
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(200) NOT NULL,
  language VARCHAR(5) NOT NULL,
  value TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_translation_key_language UNIQUE (key, language)
);

-- Enable RLS
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies für global_settings
CREATE POLICY "Users can view their own global settings" 
ON public.global_settings 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own global settings" 
ON public.global_settings 
FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies für translations
CREATE POLICY "Everyone can view translations" 
ON public.translations 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage translations" 
ON public.translations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() AND p.is_manager = true
));

-- Trigger für updated_at
CREATE TRIGGER update_global_settings_updated_at
BEFORE UPDATE ON public.global_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Füge grundlegende Übersetzungen hinzu
INSERT INTO public.translations (key, language, value, category) VALUES
-- Deutsche Übersetzungen
('settings.global.title', 'de', 'Globale Einstellungen', 'settings'),
('settings.global.language', 'de', 'Sprache', 'settings'),
('settings.global.theme', 'de', 'Design', 'settings'),
('settings.global.theme.light', 'de', 'Hell', 'settings'),
('settings.global.theme.dark', 'de', 'Dunkel', 'settings'),
('settings.global.theme.auto', 'de', 'Automatisch', 'settings'),
('settings.global.currency', 'de', 'Währung', 'settings'),
('settings.global.timezone', 'de', 'Zeitzone', 'settings'),
('settings.global.dateFormat', 'de', 'Datumsformat', 'settings'),
('settings.global.accessibility', 'de', 'Barrierefreiheit', 'settings'),
('settings.global.rtl', 'de', 'Rechts-nach-Links', 'settings'),
('settings.global.highContrast', 'de', 'Hoher Kontrast', 'settings'),
('settings.global.screenReader', 'de', 'Screenreader-Modus', 'settings'),
('common.save', 'de', 'Speichern', 'common'),
('common.cancel', 'de', 'Abbrechen', 'common'),
('common.enabled', 'de', 'Aktiviert', 'common'),
('common.disabled', 'de', 'Deaktiviert', 'common'),
-- Englische Übersetzungen
('settings.global.title', 'en', 'Global Settings', 'settings'),
('settings.global.language', 'en', 'Language', 'settings'),
('settings.global.theme', 'en', 'Theme', 'settings'),
('settings.global.theme.light', 'en', 'Light', 'settings'),
('settings.global.theme.dark', 'en', 'Dark', 'settings'),
('settings.global.theme.auto', 'en', 'Auto', 'settings'),
('settings.global.currency', 'en', 'Currency', 'settings'),
('settings.global.timezone', 'en', 'Timezone', 'settings'),
('settings.global.dateFormat', 'en', 'Date Format', 'settings'),
('settings.global.accessibility', 'en', 'Accessibility', 'settings'),
('settings.global.rtl', 'en', 'Right-to-Left', 'settings'),
('settings.global.highContrast', 'en', 'High Contrast', 'settings'),
('settings.global.screenReader', 'en', 'Screen Reader Mode', 'settings'),
('common.save', 'en', 'Save', 'common'),
('common.cancel', 'en', 'Cancel', 'common'),
('common.enabled', 'en', 'Enabled', 'common'),
('common.disabled', 'en', 'Disabled', 'common'),
-- Französische Übersetzungen
('settings.global.title', 'fr', 'Paramètres Globaux', 'settings'),
('settings.global.language', 'fr', 'Langue', 'settings'),
('settings.global.theme', 'fr', 'Thème', 'settings'),
('settings.global.theme.light', 'fr', 'Clair', 'settings'),
('settings.global.theme.dark', 'fr', 'Sombre', 'settings'),
('settings.global.theme.auto', 'fr', 'Automatique', 'settings'),
('common.save', 'fr', 'Enregistrer', 'common'),
('common.cancel', 'fr', 'Annuler', 'common'),
-- Spanische Übersetzungen
('settings.global.title', 'es', 'Configuración Global', 'settings'),
('settings.global.language', 'es', 'Idioma', 'settings'),
('settings.global.theme', 'es', 'Tema', 'settings'),
('settings.global.theme.light', 'es', 'Claro', 'settings'),
('settings.global.theme.dark', 'es', 'Oscuro', 'settings'),
('settings.global.theme.auto', 'es', 'Automático', 'settings'),
('common.save', 'es', 'Guardar', 'common'),
('common.cancel', 'es', 'Cancelar', 'common');

-- Erstelle Default-Einstellungen für existierende Benutzer
INSERT INTO public.global_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;