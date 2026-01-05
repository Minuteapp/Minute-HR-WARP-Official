-- RLS Policies und weitere Konfiguration
ALTER TABLE public.language_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_policy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_setting_overrides ENABLE ROW LEVEL SECURITY;

-- Admin Policies
CREATE POLICY "Admins manage language_settings" ON public.language_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
      AND (ur.company_id = company_id OR company_id IS NULL)
    )
  );

CREATE POLICY "Admins manage design_settings" ON public.design_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
      AND (ur.company_id = company_id OR company_id IS NULL)
    )
  );

CREATE POLICY "Admins manage accessibility_settings" ON public.accessibility_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
      AND (ur.company_id = company_id OR company_id IS NULL)
    )
  );

CREATE POLICY "Admins manage global_notification_settings" ON public.global_notification_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
      AND (ur.company_id = company_id OR company_id IS NULL)
    )
  );

CREATE POLICY "Admins manage security_policy_settings" ON public.security_policy_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
      AND (ur.company_id = company_id OR company_id IS NULL)
    )
  );

-- Read Policies für alle Benutzer
CREATE POLICY "Users read language_settings" ON public.language_settings
  FOR SELECT USING (true);

CREATE POLICY "Users read design_settings" ON public.design_settings
  FOR SELECT USING (true);

CREATE POLICY "Users read accessibility_settings" ON public.accessibility_settings
  FOR SELECT USING (true);

CREATE POLICY "Users read global_notification_settings" ON public.global_notification_settings
  FOR SELECT USING (true);

-- Benutzer können ihre eigenen Überschreibungen verwalten
CREATE POLICY "Users manage own overrides" ON public.user_setting_overrides
  FOR ALL USING (user_id = auth.uid());

-- Indizes
CREATE INDEX idx_language_settings_company ON public.language_settings(company_id);
CREATE INDEX idx_design_settings_company ON public.design_settings(company_id);
CREATE INDEX idx_accessibility_settings_company ON public.accessibility_settings(company_id);
CREATE INDEX idx_global_notification_settings_company ON public.global_notification_settings(company_id);
CREATE INDEX idx_security_policy_settings_company ON public.security_policy_settings(company_id);
CREATE INDEX idx_user_setting_overrides_user ON public.user_setting_overrides(user_id);

-- Trigger für updated_at
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