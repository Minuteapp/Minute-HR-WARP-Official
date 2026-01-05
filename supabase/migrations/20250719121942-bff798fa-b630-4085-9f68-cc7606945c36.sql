-- Korrektur der Skills RLS Policy
CREATE POLICY "HR and Admins can manage skills insert"
ON public.skills FOR INSERT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "HR and Admins can manage skills update"
ON public.skills FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "HR and Admins can manage skills delete"
ON public.skills FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);