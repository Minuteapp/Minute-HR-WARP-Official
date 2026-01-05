-- Erstelle fehlende Roadmap Planning Tabellen

-- 1. Roadmap Planning Boards (falls nicht existiert)
CREATE TABLE IF NOT EXISTS public.roadmap_planning_boards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    roadmap_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Roadmap Planning Containers (falls nicht existiert)
CREATE TABLE IF NOT EXISTS public.roadmap_planning_containers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    board_id UUID NOT NULL REFERENCES public.roadmap_planning_boards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    position INTEGER NOT NULL DEFAULT 0,
    progress INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    font_size INTEGER DEFAULT 14,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Roadmap Planning Cards (falls nicht existiert)
CREATE TABLE IF NOT EXISTS public.roadmap_planning_cards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    container_id UUID NOT NULL REFERENCES public.roadmap_planning_containers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planned',
    priority TEXT DEFAULT 'medium',
    position INTEGER NOT NULL DEFAULT 0,
    due_date DATE,
    estimated_hours INTEGER,
    tags TEXT[] DEFAULT '{}',
    assigned_to UUID[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Roadmap Planning Comments
CREATE TABLE IF NOT EXISTS public.roadmap_planning_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID NOT NULL REFERENCES public.roadmap_planning_cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Roadmap Planning Tasks
CREATE TABLE IF NOT EXISTS public.roadmap_planning_tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID NOT NULL REFERENCES public.roadmap_planning_cards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Roadmap Planning Team Members
CREATE TABLE IF NOT EXISTS public.roadmap_planning_team_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    container_id UUID NOT NULL REFERENCES public.roadmap_planning_containers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Roadmap Planning Sub Containers
CREATE TABLE IF NOT EXISTS public.roadmap_planning_sub_containers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_container_id UUID NOT NULL REFERENCES public.roadmap_planning_containers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.roadmap_planning_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_planning_sub_containers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Alle authentifizierten Benutzer können Roadmap Planning Daten lesen und verwalten
CREATE POLICY "Authenticated users can manage roadmap planning boards" 
ON public.roadmap_planning_boards 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage roadmap planning containers" 
ON public.roadmap_planning_containers 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage roadmap planning cards" 
ON public.roadmap_planning_cards 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage roadmap planning comments" 
ON public.roadmap_planning_comments 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage roadmap planning tasks" 
ON public.roadmap_planning_tasks 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage roadmap planning team members" 
ON public.roadmap_planning_team_members 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage roadmap planning sub containers" 
ON public.roadmap_planning_sub_containers 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_containers_board_id ON public.roadmap_planning_containers(board_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_cards_container_id ON public.roadmap_planning_cards(container_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_comments_card_id ON public.roadmap_planning_comments(card_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_tasks_card_id ON public.roadmap_planning_tasks(card_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_team_members_container_id ON public.roadmap_planning_team_members(container_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_sub_containers_parent_id ON public.roadmap_planning_sub_containers(parent_container_id);