-- Erstelle Tabelle für globale Einstellungen pro Mandant
CREATE TABLE IF NOT EXISTS public.tenant_global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  default_language VARCHAR(5) NOT NULL DEFAULT 'de',
  supported_languages JSONB NOT NULL DEFAULT '["de", "en", "fr", "es", "ar"]',
  dark_mode_enabled BOOLEAN NOT NULL DEFAULT true,
  dark_mode_mode VARCHAR(10) NOT NULL DEFAULT 'auto', -- 'light', 'dark', 'auto'
  dark_mode_auto_config JSONB NOT NULL DEFAULT '{"startHour": 19, "endHour": 7}',
  default_currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  supported_currencies JSONB NOT NULL DEFAULT '["EUR", "USD", "CHF", "GBP"]',
  auto_convert_currency BOOLEAN NOT NULL DEFAULT true,
  timezone VARCHAR(100) NOT NULL DEFAULT 'Europe/Berlin',
  date_format VARCHAR(20) NOT NULL DEFAULT 'DD.MM.YYYY',
  decimal_separator VARCHAR(1) NOT NULL DEFAULT ',',
  thousands_separator VARCHAR(1) NOT NULL DEFAULT '.',
  rtl_enabled BOOLEAN NOT NULL DEFAULT false,
  high_contrast_enabled BOOLEAN NOT NULL DEFAULT false,
  screen_reader_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_company_global_settings UNIQUE (company_id)
);

-- Erstelle Tabelle für Benutzer-spezifische Einstellungen (überschreibt Mandanten-Einstellungen)
CREATE TABLE IF NOT EXISTS public.user_global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  language VARCHAR(5),
  dark_mode_mode VARCHAR(10), -- 'light', 'dark', 'auto', null = inherit from tenant
  timezone VARCHAR(100),
  date_format VARCHAR(20),
  high_contrast_enabled BOOLEAN DEFAULT false,
  screen_reader_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_global_settings UNIQUE (user_id)
);

-- Erstelle Tabelle für Übersetzungen
CREATE TABLE IF NOT EXISTS public.translations (
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
ALTER TABLE public.tenant_global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies für tenant_global_settings
CREATE POLICY "Users can view their company's global settings" 
ON public.tenant_global_settings 
FOR SELECT 
USING (company_id IN (
  SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid()
));

CREATE POLICY "Admin users can manage their company's global settings" 
ON public.tenant_global_settings 
FOR ALL 
USING (company_id IN (
  SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
));

-- RLS Policies für user_global_settings
CREATE POLICY "Users can view their own global settings" 
ON public.user_global_settings 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own global settings" 
ON public.user_global_settings 
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
  WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
));

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenant_global_settings_updated_at
BEFORE UPDATE ON public.tenant_global_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_global_settings_updated_at
BEFORE UPDATE ON public.user_global_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Füge einige grundlegende Übersetzungen hinzu
INSERT INTO public.translations (key, language, value, category) VALUES
-- Deutsche Übersetzungen
('settings.global.title', 'de', 'Globale Einstellungen', 'settings'),
('settings.global.language', 'de', 'Sprache', 'settings'),
('settings.global.theme', 'de', 'Design', 'settings'),
('settings.global.currency', 'de', 'Währung', 'settings'),
('settings.global.timezone', 'de', 'Zeitzone', 'settings'),
('settings.global.dateFormat', 'de', 'Datumsformat', 'settings'),
('settings.global.accessibility', 'de', 'Barrierefreiheit', 'settings'),
('settings.global.rtl', 'de', 'Rechts-nach-Links', 'settings'),
('common.save', 'de', 'Speichern', 'common'),
('common.cancel', 'de', 'Abbrechen', 'common'),
-- Englische Übersetzungen
('settings.global.title', 'en', 'Global Settings', 'settings'),
('settings.global.language', 'en', 'Language', 'settings'),
('settings.global.theme', 'en', 'Theme', 'settings'),
('settings.global.currency', 'en', 'Currency', 'settings'),
('settings.global.timezone', 'en', 'Timezone', 'settings'),
('settings.global.dateFormat', 'en', 'Date Format', 'settings'),
('settings.global.accessibility', 'en', 'Accessibility', 'settings'),
('settings.global.rtl', 'en', 'Right-to-Left', 'settings'),
('common.save', 'en', 'Save', 'common'),
('common.cancel', 'en', 'Cancel', 'common')
ON CONFLICT (key, language) DO NOTHING;