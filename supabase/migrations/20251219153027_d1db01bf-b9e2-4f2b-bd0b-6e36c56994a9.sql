-- Support Tickets Tabelle
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('bug', 'feature', 'question', 'billing', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting', 'resolved', 'closed')),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  module TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Support Ticket Kommentare
CREATE TABLE IF NOT EXISTS public.support_ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Platform Einstellungen
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('platform', 'security', 'ai', 'data_retention', 'rate_limit', 'notifications')),
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies für Support Tickets (nur Admins)
CREATE POLICY "Admins can view all tickets" ON public.support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role::text IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "Admins can manage tickets" ON public.support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role::text IN ('superadmin', 'admin')
    )
  );

-- RLS für Ticket Kommentare
CREATE POLICY "Admins can view ticket comments" ON public.support_ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role::text IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "Admins can manage ticket comments" ON public.support_ticket_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role::text IN ('superadmin', 'admin')
    )
  );

-- RLS für Platform Settings
CREATE POLICY "Admins can view platform settings" ON public.platform_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role::text IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "Super admins can manage platform settings" ON public.platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role::text = 'superadmin'
    )
  );

-- Ticket-Nummer Generator Funktion
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.support_tickets;
  
  NEW.ticket_number := 'TKT-' || LPAD(next_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für Ticket-Nummer
DROP TRIGGER IF EXISTS set_ticket_number ON public.support_tickets;
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL OR NEW.ticket_number = '')
  EXECUTE FUNCTION public.generate_ticket_number();

-- Updated-At Trigger
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Standard-Einstellungen einfügen
INSERT INTO public.platform_settings (setting_key, setting_value, category, description) VALUES
  ('default_modules', '["workforce_planning", "feedback_360", "time_tracking"]', 'platform', 'Standard-Module für neue Mandanten'),
  ('password_min_length', '12', 'security', 'Minimale Passwortlänge'),
  ('two_factor_policy', '"admin"', 'security', 'Zwei-Faktor-Authentifizierung Policy (all, admin, optional)'),
  ('session_timeout_hours', '8', 'security', 'Session-Timeout in Stunden'),
  ('max_login_attempts', '5', 'security', 'Maximale Login-Versuche'),
  ('ai_token_limit_basic', '50000', 'ai', 'AI Token-Limit für Basic-Tarif'),
  ('ai_token_limit_pro', '200000', 'ai', 'AI Token-Limit für Pro-Tarif'),
  ('logs_retention_days', '90', 'data_retention', 'Aufbewahrung von Logs in Tagen'),
  ('audit_retention_days', '365', 'data_retention', 'Aufbewahrung von Audit-Logs in Tagen'),
  ('api_rate_limit', '1000', 'rate_limit', 'API Requests pro Stunde'),
  ('email_notifications', 'true', 'notifications', 'E-Mail-Benachrichtigungen aktiviert'),
  ('slack_notifications', 'false', 'notifications', 'Slack-Benachrichtigungen aktiviert')
ON CONFLICT (setting_key) DO NOTHING;