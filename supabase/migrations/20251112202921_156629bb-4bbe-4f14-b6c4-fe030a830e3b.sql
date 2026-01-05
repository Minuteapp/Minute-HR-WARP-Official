-- Zusätzliche Spalten für helpdesk_tickets hinzufügen
ALTER TABLE public.helpdesk_tickets 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_department ON public.helpdesk_tickets(department);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_location ON public.helpdesk_tickets(location);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_status ON public.helpdesk_tickets(status);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_priority ON public.helpdesk_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_category ON public.helpdesk_tickets(category);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_sla_due_date ON public.helpdesk_tickets(sla_due_date);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_created_by ON public.helpdesk_tickets(created_by);

-- View für SLA-Berechnung mit Echtzeit-Status
CREATE OR REPLACE VIEW helpdesk_tickets_with_sla AS
SELECT 
  t.*,
  CASE 
    WHEN t.sla_due_date IS NOT NULL THEN
      EXTRACT(EPOCH FROM (t.sla_due_date - NOW())) / 3600
    ELSE NULL
  END AS sla_hours_remaining,
  CASE 
    WHEN t.sla_due_date IS NULL THEN 'no_sla'
    WHEN t.sla_due_date < NOW() THEN 'overdue'
    WHEN EXTRACT(EPOCH FROM (t.sla_due_date - NOW())) / 3600 < 6 THEN 'critical'
    WHEN EXTRACT(EPOCH FROM (t.sla_due_date - NOW())) / 3600 < 12 THEN 'warning'
    ELSE 'ok'
  END AS sla_status
FROM public.helpdesk_tickets t;