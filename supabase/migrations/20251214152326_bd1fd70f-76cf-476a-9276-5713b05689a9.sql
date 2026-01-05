-- Füge document_type Spalte zur documents Tabelle hinzu
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS document_type TEXT;

-- Füge approval_requested_by Spalte hinzu (für Freigabe-Workflow)
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS approval_requested_by TEXT;

-- Füge approval_requested_at Spalte hinzu
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS approval_requested_at TIMESTAMP WITH TIME ZONE;

-- Füge approver_id Spalte hinzu (an wen die Freigabe gesendet wurde)
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS approver_id UUID REFERENCES auth.users(id);

-- Erstelle Index für schnellere Suche nach pending approvals
CREATE INDEX IF NOT EXISTS idx_documents_approver_id ON public.documents(approver_id);
CREATE INDEX IF NOT EXISTS idx_documents_approval_status ON public.documents(status) WHERE status = 'pending';