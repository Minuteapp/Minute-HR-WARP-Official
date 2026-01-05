-- Enable RLS on all calendar-related tables and add proper policies
-- 1. Calendar Categories
ALTER TABLE public.calendar_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view calendar categories" ON public.calendar_categories
FOR SELECT USING (true);

CREATE POLICY "Admins can manage calendar categories" ON public.calendar_categories
FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- 2. Calendar Event Analytics
ALTER TABLE public.calendar_event_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event analytics" ON public.calendar_event_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events 
    WHERE id = calendar_event_analytics.event_id 
    AND (created_by = auth.uid() OR public.get_current_user_role() IN ('admin', 'superadmin'))
  )
);

CREATE POLICY "System can insert event analytics" ON public.calendar_event_analytics
FOR INSERT WITH CHECK (true);

-- 3. Calendar Event Comments
ALTER TABLE public.calendar_event_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event comments" ON public.calendar_event_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events 
    WHERE id = calendar_event_comments.event_id 
    AND (created_by = auth.uid() OR public.get_current_user_role() IN ('admin', 'superadmin'))
  )
);

CREATE POLICY "Users can create event comments" ON public.calendar_event_comments
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON public.calendar_event_comments
FOR UPDATE USING (user_id = auth.uid());

-- 4. Calendar Event Conflicts
ALTER TABLE public.calendar_event_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their event conflicts" ON public.calendar_event_conflicts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events 
    WHERE id = calendar_event_conflicts.event_id 
    AND (created_by = auth.uid() OR public.get_current_user_role() IN ('admin', 'superadmin'))
  )
);

CREATE POLICY "System can manage event conflicts" ON public.calendar_event_conflicts
FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- 5. Calendar Event Documents
ALTER TABLE public.calendar_event_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event documents" ON public.calendar_event_documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events 
    WHERE id = calendar_event_documents.event_id 
    AND (created_by = auth.uid() OR public.get_current_user_role() IN ('admin', 'superadmin'))
  )
);

CREATE POLICY "Users can manage event documents" ON public.calendar_event_documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events 
    WHERE id = calendar_event_documents.event_id 
    AND created_by = auth.uid()
  ) OR public.get_current_user_role() IN ('admin', 'superadmin')
);

-- 6. Calendar Event Instances
ALTER TABLE public.calendar_event_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event instances" ON public.calendar_event_instances
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events 
    WHERE id = calendar_event_instances.event_id 
    AND (created_by = auth.uid() OR public.get_current_user_role() IN ('admin', 'superadmin'))
  )
);

CREATE POLICY "Users can manage their event instances" ON public.calendar_event_instances
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events 
    WHERE id = calendar_event_instances.event_id 
    AND created_by = auth.uid()
  ) OR public.get_current_user_role() IN ('admin', 'superadmin')
);

-- 7. Calendar Event Series
ALTER TABLE public.calendar_event_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event series" ON public.calendar_event_series
FOR SELECT USING (created_by = auth.uid() OR public.get_current_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "Users can manage their event series" ON public.calendar_event_series
FOR ALL USING (created_by = auth.uid() OR public.get_current_user_role() IN ('admin', 'superadmin'));