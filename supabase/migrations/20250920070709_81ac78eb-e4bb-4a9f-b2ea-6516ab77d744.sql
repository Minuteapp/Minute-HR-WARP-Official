-- RLS Policies für hr_fleet_assignments hinzufügen (falls noch nicht vorhanden)
DO $$ 
BEGIN 
    -- RLS aktivieren
    ALTER TABLE public.hr_fleet_assignments ENABLE ROW LEVEL SECURITY;
    
    -- Policies nur erstellen wenn sie nicht bereits existieren
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'hr_fleet_assignments' 
        AND policyname = 'Users can view fleet assignments from their company'
    ) THEN
        CREATE POLICY "Users can view fleet assignments from their company" 
        ON public.hr_fleet_assignments 
        FOR SELECT 
        USING (
          EXISTS (
            SELECT 1 FROM public.employees e 
            WHERE e.id = hr_fleet_assignments.employee_id 
            AND (
              e.company_id = (auth.jwt() ->> 'company_id')::uuid 
              OR (auth.jwt() ->> 'role') = 'superadmin'
            )
          )
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'hr_fleet_assignments' 
        AND policyname = 'Admins can manage fleet assignments'
    ) THEN
        CREATE POLICY "Admins can manage fleet assignments" 
        ON public.hr_fleet_assignments 
        FOR ALL 
        USING (
          (auth.jwt() ->> 'role') IN ('admin', 'superadmin')
          AND EXISTS (
            SELECT 1 FROM public.employees e 
            WHERE e.id = hr_fleet_assignments.employee_id 
            AND (
              e.company_id = (auth.jwt() ->> 'company_id')::uuid 
              OR (auth.jwt() ->> 'role') = 'superadmin'
            )
          )
        );
    END IF;
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;