-- Überprüfe und repariere die innovation_ideas_inbox Tabelle
-- Lösche zuerst alte Policies falls vorhanden
DROP POLICY IF EXISTS "Users can view all inbox ideas" ON public.innovation_ideas_inbox;
DROP POLICY IF EXISTS "Users can create inbox ideas" ON public.innovation_ideas_inbox;
DROP POLICY IF EXISTS "Users can update their own inbox ideas" ON public.innovation_ideas_inbox;
DROP POLICY IF EXISTS "Admins can update all inbox ideas" ON public.innovation_ideas_inbox;

-- Erstelle korrekte Policies
CREATE POLICY "All authenticated users can view inbox ideas" 
ON public.innovation_ideas_inbox 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create inbox ideas" 
ON public.innovation_ideas_inbox 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = submitter_id);

CREATE POLICY "Users can update their own inbox ideas" 
ON public.innovation_ideas_inbox 
FOR UPDATE 
USING (auth.uid() = submitter_id);

CREATE POLICY "Admins can update all inbox ideas" 
ON public.innovation_ideas_inbox 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'superadmin')
));

-- Stelle sicher, dass Realtime aktiviert ist
ALTER TABLE public.innovation_ideas_inbox REPLICA IDENTITY FULL;