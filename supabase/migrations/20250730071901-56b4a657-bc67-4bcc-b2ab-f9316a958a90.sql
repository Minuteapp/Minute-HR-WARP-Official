-- Temporär alle RLS-Policies für Innovation-Ideen entfernen und einfachere erstellen
DROP POLICY IF EXISTS "Allow reading all innovation ideas" ON public.innovation_ideas;
DROP POLICY IF EXISTS "Allow authenticated users to create ideas" ON public.innovation_ideas;
DROP POLICY IF EXISTS "Allow users to update their own ideas" ON public.innovation_ideas;
DROP POLICY IF EXISTS "Allow users to delete their own ideas" ON public.innovation_ideas;

-- Neue, einfachere Policy: Alle authentifizierten Benutzer können alles
CREATE POLICY "Innovation ideas full access for authenticated users" 
ON public.innovation_ideas 
FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);