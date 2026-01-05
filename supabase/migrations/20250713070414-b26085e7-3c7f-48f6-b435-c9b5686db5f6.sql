-- Dashboard-Konfiguration Tabellen
CREATE TABLE public.dashboard_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Mein Dashboard',
  is_default BOOLEAN DEFAULT true,
  layout_config JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.dashboard_containers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_config_id UUID NOT NULL REFERENCES public.dashboard_configs(id) ON DELETE CASCADE,
  container_type TEXT NOT NULL, -- 'widget', 'shortcut', 'chart'
  module_name TEXT NOT NULL, -- 'calendar', 'time_tracking', 'tasks', etc.
  widget_type TEXT NOT NULL, -- specific widget within module
  position_row INTEGER NOT NULL DEFAULT 1,
  position_column INTEGER NOT NULL DEFAULT 1,
  width INTEGER NOT NULL DEFAULT 1, -- 1-6
  height INTEGER NOT NULL DEFAULT 1, -- 1-3
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verfügbare Widget-Typen
CREATE TABLE public.dashboard_widget_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name TEXT NOT NULL,
  widget_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  default_width INTEGER DEFAULT 1,
  default_height INTEGER DEFAULT 1,
  config_schema JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widget_types ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own dashboard configs
CREATE POLICY "Users can manage their own dashboard configs"
ON public.dashboard_configs
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can only manage containers of their own dashboards
CREATE POLICY "Users can manage their own dashboard containers"
ON public.dashboard_containers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.dashboard_configs dc 
    WHERE dc.id = dashboard_containers.dashboard_config_id 
    AND dc.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dashboard_configs dc 
    WHERE dc.id = dashboard_containers.dashboard_config_id 
    AND dc.user_id = auth.uid()
  )
);

-- Everyone can view available widget types
CREATE POLICY "Everyone can view widget types"
ON public.dashboard_widget_types
FOR SELECT
USING (is_active = true);

-- Admins can manage widget types
CREATE POLICY "Admins can manage widget types"
ON public.dashboard_widget_types
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Insert default widget types
INSERT INTO public.dashboard_widget_types (module_name, widget_type, display_name, description, icon, default_width, default_height) VALUES
('calendar', 'today_events', 'Heutige Termine', 'Zeigt die Termine von heute an', 'Calendar', 2, 1),
('calendar', 'week_overview', 'Wochenübersicht', 'Kompakte Wochenansicht', 'Calendar', 3, 2),
('time_tracking', 'current_status', 'Zeiterfassung Status', 'Aktueller Einstempel-Status', 'Clock', 1, 1),
('time_tracking', 'weekly_hours', 'Wochenstunden', 'Übersicht der Wochenstunden', 'Clock', 2, 1),
('tasks', 'my_tasks', 'Meine Aufgaben', 'Offene Aufgaben des Benutzers', 'CheckSquare', 2, 2),
('tasks', 'task_overview', 'Aufgaben-Übersicht', 'Kompakte Aufgabenübersicht', 'List', 1, 1),
('team', 'team_status', 'Team Status', 'Anwesenheitsstatus des Teams', 'Users', 2, 1),
('projects', 'project_status', 'Projekt-Status', 'Aktuelle Projekte und Status', 'Folder', 3, 2),
('notifications', 'recent_notifications', 'Benachrichtigungen', 'Neueste Benachrichtigungen', 'Bell', 1, 2),
('quick_actions', 'main_actions', 'Schnelle Aktionen', 'Häufig verwendete Aktionen', 'Plus', 2, 1),
('weather', 'current_weather', 'Wetter', 'Aktuelles Wetter', 'Cloud', 1, 1),
('budget', 'budget_overview', 'Budget-Übersicht', 'Aktuelle Budget-Zahlen', 'DollarSign', 2, 1);

-- Update triggers
CREATE OR REPLACE FUNCTION public.update_dashboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboard_configs_updated_at
  BEFORE UPDATE ON public.dashboard_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_dashboard_updated_at();

CREATE TRIGGER update_dashboard_containers_updated_at
  BEFORE UPDATE ON public.dashboard_containers
  FOR EACH ROW EXECUTE FUNCTION public.update_dashboard_updated_at();