-- calendar_conflicts RLS Policy über event_id/user relation
-- Da calendar_conflicts keine company_id hat, muss die Isolation über events erfolgen
-- Erst prüfen wir die calendar_events Struktur

-- RLS Policy für calendar_conflicts basierend auf Event-Ownership
CREATE POLICY "user_based_isolation" ON public.calendar_conflicts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM calendar_events ce 
    WHERE ce.id = calendar_conflicts.event_id 
    AND ce.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM calendar_events ce 
    WHERE ce.id = calendar_conflicts.conflicting_event_id 
    AND ce.created_by = auth.uid()
  )
);