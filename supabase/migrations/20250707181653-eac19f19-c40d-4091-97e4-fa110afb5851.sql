-- Prüfe und erstelle fehlende Roadmap-Tabellen

-- Falls roadmaps Tabelle nicht existiert, erstelle sie
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'roadmaps') THEN
        CREATE TABLE public.roadmaps (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          vision TEXT,
          mission TEXT,
          status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'on_hold', 'cancelled')),
          priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
          start_date DATE,
          end_date DATE,
          progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          created_by UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view roadmaps" ON public.roadmaps FOR SELECT USING (true);
        CREATE POLICY "Users can create roadmaps" ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() = created_by);
        CREATE POLICY "Users can update their own roadmaps" ON public.roadmaps FOR UPDATE USING (auth.uid() = created_by);
    END IF;
END
$$;