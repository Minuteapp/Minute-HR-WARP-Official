-- Erstelle document_access_logs Tabelle für Audit-Zwecke
CREATE TABLE IF NOT EXISTS public.document_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_document_access_logs_document_id ON public.document_access_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_user_id ON public.document_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_performed_at ON public.document_access_logs(performed_at);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_action ON public.document_access_logs(action);

-- RLS Policies für document_access_logs
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

-- Admins können alle Logs sehen
CREATE POLICY "Admins can view all document access logs" ON public.document_access_logs
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Benutzer können ihre eigenen Logs sehen
CREATE POLICY "Users can view their own document access logs" ON public.document_access_logs
  FOR SELECT 
  USING (user_id = auth.uid());

-- System kann Logs erstellen
CREATE POLICY "System can create document access logs" ON public.document_access_logs
  FOR INSERT 
  WITH CHECK (true);

-- Erstelle oder aktualisiere documents Storage Bucket falls nicht vorhanden
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;