-- RLS-Policies für innovation_ideas Tabelle erstellen
-- Benutzer können ihre eigenen Ideen verwalten und alle Ideen lesen

-- Policy für SELECT - Alle können Ideen lesen
CREATE POLICY "Allow reading all innovation ideas" 
ON public.innovation_ideas 
FOR SELECT 
USING (true);

-- Policy für INSERT - Nur authentifizierte Benutzer können Ideen erstellen
CREATE POLICY "Allow authenticated users to create ideas" 
ON public.innovation_ideas 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy für UPDATE - Benutzer können nur ihre eigenen Ideen bearbeiten
CREATE POLICY "Allow users to update their own ideas" 
ON public.innovation_ideas 
FOR UPDATE 
USING (submitter_id = auth.uid());

-- Policy für DELETE - Benutzer können nur ihre eigenen Ideen löschen (soft delete)
CREATE POLICY "Allow users to delete their own ideas" 
ON public.innovation_ideas 
FOR UPDATE 
USING (submitter_id = auth.uid());