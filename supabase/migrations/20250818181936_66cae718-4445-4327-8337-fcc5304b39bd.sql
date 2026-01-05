-- Lösche bereits existierende Trigger, falls vorhanden
DROP TRIGGER IF EXISTS update_global_settings_updated_at ON public.global_settings;
DROP TRIGGER IF EXISTS update_language_settings_updated_at ON public.language_settings;
DROP TRIGGER IF EXISTS update_design_settings_updated_at ON public.design_settings;
DROP TRIGGER IF EXISTS update_accessibility_settings_updated_at ON public.accessibility_settings;
DROP TRIGGER IF EXISTS update_global_notification_settings_updated_at ON public.global_notification_settings;
DROP TRIGGER IF EXISTS update_security_policy_settings_updated_at ON public.security_policy_settings;

-- Verwende die bereits existierende Funktion
CREATE TRIGGER update_language_settings_updated_at
  BEFORE UPDATE ON public.language_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_design_settings_updated_at
  BEFORE UPDATE ON public.design_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_accessibility_settings_updated_at
  BEFORE UPDATE ON public.accessibility_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_global_notification_settings_updated_at
  BEFORE UPDATE ON public.global_notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_policy_settings_updated_at
  BEFORE UPDATE ON public.security_policy_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();