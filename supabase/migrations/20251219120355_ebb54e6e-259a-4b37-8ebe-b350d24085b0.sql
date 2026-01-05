-- Tabelle für Benutzerkonto-Status
CREATE TABLE IF NOT EXISTS public.user_account_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  is_suspended BOOLEAN DEFAULT false,
  suspended_at TIMESTAMP WITH TIME ZONE,
  suspended_by UUID,
  suspended_reason TEXT,
  last_password_reset TIMESTAMP WITH TIME ZONE,
  last_credentials_sent TIMESTAMP WITH TIME ZONE,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_reset_at TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Login-Historie
CREATE TABLE IF NOT EXISTS public.user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  device_type TEXT,
  browser TEXT,
  success BOOLEAN DEFAULT true,
  failure_reason TEXT
);

-- Enable RLS
ALTER TABLE public.user_account_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies für user_account_status
CREATE POLICY "Admins können Kontostatus lesen" ON public.user_account_status
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins können Kontostatus ändern" ON public.user_account_status
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'superadmin')
    )
  );

-- RLS Policies für user_login_history
CREATE POLICY "Admins können Login-Historie lesen" ON public.user_login_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Benutzer können eigene Login-Historie sehen" ON public.user_login_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System kann Login-Historie einfügen" ON public.user_login_history
  FOR INSERT
  WITH CHECK (true);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_user_account_status_user_id ON public.user_account_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_history_user_id ON public.user_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_history_login_at ON public.user_login_history(login_at DESC);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_user_account_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_account_status_updated_at ON public.user_account_status;
CREATE TRIGGER trigger_user_account_status_updated_at
  BEFORE UPDATE ON public.user_account_status
  FOR EACH ROW
  EXECUTE FUNCTION update_user_account_status_updated_at();