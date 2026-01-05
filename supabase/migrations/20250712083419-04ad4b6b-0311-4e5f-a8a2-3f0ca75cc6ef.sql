-- Erweitere die Roadmap-Planungsstrukturen um Sub-Container und weitere Features

-- Füge sub_containers Tabelle hinzu
CREATE TABLE IF NOT EXISTS public.roadmap_planning_sub_containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES public.roadmap_planning_containers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to TEXT[],
  tags TEXT[],
  due_date DATE,
  estimated_hours INTEGER,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  is_visible BOOLEAN DEFAULT true,
  style_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Füge tasks Tabelle für Aufgaben hinzu (für beide Container und Sub-Container)
CREATE TABLE IF NOT EXISTS public.roadmap_planning_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID REFERENCES public.roadmap_planning_containers(id) ON DELETE CASCADE,
  sub_container_id UUID REFERENCES public.roadmap_planning_sub_containers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID,
  due_date DATE,
  estimated_hours INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  CONSTRAINT check_container_or_sub_container CHECK (
    (container_id IS NOT NULL AND sub_container_id IS NULL) OR 
    (container_id IS NULL AND sub_container_id IS NOT NULL)
  )
);

-- Füge team_members Tabelle für Team-Einladungen hinzu
CREATE TABLE IF NOT EXISTS public.roadmap_planning_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID REFERENCES public.roadmap_planning_containers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
  permissions JSONB DEFAULT '{"read": true, "write": false, "delete": false}'
);

-- Füge comments Tabelle hinzu
CREATE TABLE IF NOT EXISTS public.roadmap_planning_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID REFERENCES public.roadmap_planning_containers(id) ON DELETE CASCADE,
  sub_container_id UUID REFERENCES public.roadmap_planning_sub_containers(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.roadmap_planning_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT check_container_or_sub_container_comment CHECK (
    (container_id IS NOT NULL AND sub_container_id IS NULL) OR 
    (container_id IS NULL AND sub_container_id IS NOT NULL)
  )
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_sub_containers_container_id ON public.roadmap_planning_sub_containers(container_id);
CREATE INDEX IF NOT EXISTS idx_tasks_container_id ON public.roadmap_planning_tasks(container_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sub_container_id ON public.roadmap_planning_tasks(sub_container_id);
CREATE INDEX IF NOT EXISTS idx_team_members_container_id ON public.roadmap_planning_team_members(container_id);
CREATE INDEX IF NOT EXISTS idx_comments_container_id ON public.roadmap_planning_comments(container_id);
CREATE INDEX IF NOT EXISTS idx_comments_sub_container_id ON public.roadmap_planning_comments(sub_container_id);

-- RLS Policies aktivieren
ALTER TABLE public.roadmap_planning_sub_containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies für sub_containers
CREATE POLICY "Users can view sub containers" ON public.roadmap_planning_sub_containers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_sub_containers.container_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can create sub containers" ON public.roadmap_planning_sub_containers FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_sub_containers.container_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update sub containers" ON public.roadmap_planning_sub_containers FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_sub_containers.container_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete sub containers" ON public.roadmap_planning_sub_containers FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_sub_containers.container_id
    AND r.created_by = auth.uid()
  )
);

-- RLS Policies für tasks
CREATE POLICY "Users can view tasks" ON public.roadmap_planning_tasks FOR SELECT USING (
  (container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_tasks.container_id
    AND r.created_by = auth.uid()
  )) OR 
  (sub_container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_sub_containers rpsc
    JOIN public.roadmap_planning_containers rpc ON rpsc.container_id = rpc.id
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpsc.id = roadmap_planning_tasks.sub_container_id
    AND r.created_by = auth.uid()
  ))
);

CREATE POLICY "Users can create tasks" ON public.roadmap_planning_tasks FOR INSERT WITH CHECK (
  (container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_tasks.container_id
    AND r.created_by = auth.uid()
  )) OR 
  (sub_container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_sub_containers rpsc
    JOIN public.roadmap_planning_containers rpc ON rpsc.container_id = rpc.id
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpsc.id = roadmap_planning_tasks.sub_container_id
    AND r.created_by = auth.uid()
  ))
);

CREATE POLICY "Users can update tasks" ON public.roadmap_planning_tasks FOR UPDATE USING (
  (container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_tasks.container_id
    AND r.created_by = auth.uid()
  )) OR 
  (sub_container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_sub_containers rpsc
    JOIN public.roadmap_planning_containers rpc ON rpsc.container_id = rpc.id
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpsc.id = roadmap_planning_tasks.sub_container_id
    AND r.created_by = auth.uid()
  ))
);

CREATE POLICY "Users can delete tasks" ON public.roadmap_planning_tasks FOR DELETE USING (
  (container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_tasks.container_id
    AND r.created_by = auth.uid()
  )) OR 
  (sub_container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_sub_containers rpsc
    JOIN public.roadmap_planning_containers rpc ON rpsc.container_id = rpc.id
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpsc.id = roadmap_planning_tasks.sub_container_id
    AND r.created_by = auth.uid()
  ))
);

-- RLS Policies für team_members
CREATE POLICY "Users can view team members" ON public.roadmap_planning_team_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_team_members.container_id
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can manage team members" ON public.roadmap_planning_team_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_team_members.container_id
    AND r.created_by = auth.uid()
  )
);

-- RLS Policies für comments
CREATE POLICY "Users can view comments" ON public.roadmap_planning_comments FOR SELECT USING (
  (container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_comments.container_id
    AND r.created_by = auth.uid()
  )) OR 
  (sub_container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_sub_containers rpsc
    JOIN public.roadmap_planning_containers rpc ON rpsc.container_id = rpc.id
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpsc.id = roadmap_planning_comments.sub_container_id
    AND r.created_by = auth.uid()
  ))
);

CREATE POLICY "Users can create comments" ON public.roadmap_planning_comments FOR INSERT WITH CHECK (
  auth.uid() = author_id AND
  ((container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_containers rpc
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpc.id = roadmap_planning_comments.container_id
    AND r.created_by = auth.uid()
  )) OR 
  (sub_container_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.roadmap_planning_sub_containers rpsc
    JOIN public.roadmap_planning_containers rpc ON rpsc.container_id = rpc.id
    JOIN public.roadmap_planning_boards rpb ON rpc.board_id = rpb.id
    JOIN public.roadmaps r ON rpb.roadmap_id = r.id
    WHERE rpsc.id = roadmap_planning_comments.sub_container_id
    AND r.created_by = auth.uid()
  )))
);

CREATE POLICY "Users can update their own comments" ON public.roadmap_planning_comments FOR UPDATE USING (
  auth.uid() = author_id
);

CREATE POLICY "Users can delete their own comments" ON public.roadmap_planning_comments FOR DELETE USING (
  auth.uid() = author_id
);

-- Trigger für updated_at Zeitstempel
CREATE TRIGGER update_sub_containers_updated_at BEFORE UPDATE ON public.roadmap_planning_sub_containers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.roadmap_planning_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.roadmap_planning_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();