-- HR Helpdesk Module - RLS Policies, Triggers and Functions

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('ticket_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for tickets table
DROP TRIGGER IF EXISTS generate_ticket_number_trigger ON public.tickets;
CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_number();

DROP TRIGGER IF EXISTS calculate_sla_trigger ON public.tickets;
CREATE TRIGGER calculate_sla_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.calculate_sla_due_date();

DROP TRIGGER IF EXISTS increment_template_usage_trigger ON public.tickets;
CREATE TRIGGER increment_template_usage_trigger
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.increment_template_usage();

-- RLS Policies for ticket_categories
DROP POLICY IF EXISTS "Users can view categories" ON public.ticket_categories;
CREATE POLICY "Users can view categories" ON public.ticket_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "HR and Admin can manage categories" ON public.ticket_categories;
CREATE POLICY "HR and Admin can manage categories" ON public.ticket_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- RLS Policies for ticket_sla_policies
DROP POLICY IF EXISTS "Users can view SLA policies" ON public.ticket_sla_policies;
CREATE POLICY "Users can view SLA policies" ON public.ticket_sla_policies
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage SLA policies" ON public.ticket_sla_policies;
CREATE POLICY "Admin can manage SLA policies" ON public.ticket_sla_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- RLS Policies for ticket_templates  
DROP POLICY IF EXISTS "Users can view templates" ON public.ticket_templates;
CREATE POLICY "Users can view templates" ON public.ticket_templates
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "HR can manage templates" ON public.ticket_templates;
CREATE POLICY "HR can manage templates" ON public.ticket_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- RLS Policies for tickets (komplexe RBAC)
-- Employees: nur eigene Tickets
DROP POLICY IF EXISTS "Employees can view own tickets" ON public.tickets;
CREATE POLICY "Employees can view own tickets" ON public.tickets
  FOR SELECT USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- Employees: können eigene Tickets erstellen
DROP POLICY IF EXISTS "Employees can create tickets" ON public.tickets;
CREATE POLICY "Employees can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Employees: können eigene Tickets bearbeiten (nur bestimmte Felder)
DROP POLICY IF EXISTS "Employees can update own tickets" ON public.tickets;
CREATE POLICY "Employees can update own tickets" ON public.tickets
  FOR UPDATE USING (
    created_by = auth.uid() AND status NOT IN ('resolved', 'archived')
  );

-- HR/Admin: alle Tickets
DROP POLICY IF EXISTS "HR can manage all tickets" ON public.tickets;
CREATE POLICY "HR can manage all tickets" ON public.tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- Team Leaders: nur Tickets ihrer Abteilung (ohne sensible Daten)
DROP POLICY IF EXISTS "Team leaders can view department tickets" ON public.tickets;
CREATE POLICY "Team leaders can view department tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.employees e ON e.id = tickets.created_by
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'manager'
      AND tickets.department = e.department
      AND NOT tickets.contains_sensitive_data
    )
  );

-- RLS Policies for ticket_comments
DROP POLICY IF EXISTS "Users can view comments on their tickets" ON public.ticket_comments;
CREATE POLICY "Users can view comments on their tickets" ON public.ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_comments.ticket_id 
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Users can comment on accessible tickets" ON public.ticket_comments;
CREATE POLICY "Users can comment on accessible tickets" ON public.ticket_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_comments.ticket_id 
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.user_roles 
             WHERE user_id = auth.uid() 
             AND role IN ('admin', 'hr', 'superadmin')
           ))
    )
  );

-- RLS Policies for ticket_attachments
DROP POLICY IF EXISTS "Users can view attachments for accessible tickets" ON public.ticket_attachments;
CREATE POLICY "Users can view attachments for accessible tickets" ON public.ticket_attachments
  FOR SELECT USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_attachments.ticket_id 
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Users can upload attachments" ON public.ticket_attachments;
CREATE POLICY "Users can upload attachments" ON public.ticket_attachments
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- RLS Policies for FAQ
DROP POLICY IF EXISTS "Users can view published FAQ categories" ON public.faq_categories;
CREATE POLICY "Users can view published FAQ categories" ON public.faq_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "HR can manage FAQ categories" ON public.faq_categories;
CREATE POLICY "HR can manage FAQ categories" ON public.faq_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Users can view published FAQ articles" ON public.faq_articles;
CREATE POLICY "Users can view published FAQ articles" ON public.faq_articles
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "HR can manage FAQ articles" ON public.faq_articles;
CREATE POLICY "HR can manage FAQ articles" ON public.faq_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- RLS Policies for escalations (nur HR/Admin)
DROP POLICY IF EXISTS "HR can manage escalations" ON public.ticket_escalations;
CREATE POLICY "HR can manage escalations" ON public.ticket_escalations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- RLS Policies for metrics (nur HR/Admin sehen alle)
DROP POLICY IF EXISTS "Users can view metrics for own tickets" ON public.ticket_metrics;
CREATE POLICY "Users can view metrics for own tickets" ON public.ticket_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_metrics.ticket_id 
      AND t.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- RLS Policies für Knowledge Base Usage Logs
DROP POLICY IF EXISTS "Users can create KB usage logs" ON public.kb_usage_logs;
CREATE POLICY "Users can create KB usage logs" ON public.kb_usage_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "HR can view all KB usage logs" ON public.kb_usage_logs;
CREATE POLICY "HR can view all KB usage logs" ON public.kb_usage_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- RLS Policies für AI Training Data (nur Admin)
DROP POLICY IF EXISTS "Admins can manage AI training data" ON public.ai_training_data;
CREATE POLICY "Admins can manage AI training data" ON public.ai_training_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );