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

-- Function to calculate SLA due date
CREATE OR REPLACE FUNCTION public.calculate_sla_due_date()
RETURNS TRIGGER AS $$
DECLARE
  sla_hours INTEGER;
BEGIN
  -- Hole SLA-Zeit basierend auf Kategorie und Priorität
  SELECT resolution_time_hours INTO sla_hours
  FROM public.ticket_sla_policies tsp
  WHERE tsp.category_id = NEW.category_id 
    AND tsp.priority = NEW.priority
    AND tsp.is_active = true
  LIMIT 1;
  
  -- Fallback auf Standardwerte
  IF sla_hours IS NULL THEN
    sla_hours := CASE NEW.priority
      WHEN 'urgent' THEN 4
      WHEN 'high' THEN 8
      WHEN 'medium' THEN 24
      ELSE 48
    END;
  END IF;
  
  NEW.sla_due_at := NEW.created_at + (sla_hours || ' hours')::interval;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Function to increment template usage
CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE public.ticket_templates 
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Triggers for tickets table
CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_number();

CREATE TRIGGER calculate_sla_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.calculate_sla_due_date();

CREATE TRIGGER increment_template_usage_trigger
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.increment_template_usage();

-- RLS Policies for ticket_categories
CREATE POLICY "Users can view categories" ON public.ticket_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "HR and Admin can manage categories" ON public.ticket_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- RLS Policies for ticket_sla_policies
CREATE POLICY "Users can view SLA policies" ON public.ticket_sla_policies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage SLA policies" ON public.ticket_sla_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- RLS Policies for ticket_templates  
CREATE POLICY "Users can view templates" ON public.ticket_templates
  FOR SELECT USING (is_active = true);

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
CREATE POLICY "Employees can view own tickets" ON public.tickets
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- Employees: können eigene Tickets erstellen
CREATE POLICY "Employees can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Employees: können eigene Tickets bearbeiten (nur bestimmte Felder)
CREATE POLICY "Employees can update own tickets" ON public.tickets
  FOR UPDATE USING (
    created_by = auth.uid() AND status NOT IN ('resolved', 'archived')
  );

-- HR/Admin: alle Tickets
CREATE POLICY "HR can manage all tickets" ON public.tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- Team Leaders: nur Tickets ihrer Abteilung (ohne sensible Daten)
CREATE POLICY "Team leaders can view department tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.employees e ON e.id = auth.uid()
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'manager'
      AND tickets.department = e.department
      AND NOT tickets.contains_sensitive_data
    )
  );

-- RLS Policies for ticket_comments
-- Nutzer können Kommentare zu ihren Tickets sehen
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

-- Nutzer können Kommentare zu ihren Tickets erstellen
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

CREATE POLICY "Users can upload attachments" ON public.ticket_attachments
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- RLS Policies for FAQ
CREATE POLICY "Users can view published FAQ categories" ON public.faq_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "HR can manage FAQ categories" ON public.faq_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

CREATE POLICY "Users can view published FAQ articles" ON public.faq_articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "HR can manage FAQ articles" ON public.faq_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- RLS Policies for escalations (nur HR/Admin)
CREATE POLICY "HR can manage escalations" ON public.ticket_escalations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- RLS Policies for metrics (nur HR/Admin sehen alle)
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
CREATE POLICY "Users can create KB usage logs" ON public.kb_usage_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

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
CREATE POLICY "Admins can manage AI training data" ON public.ai_training_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );