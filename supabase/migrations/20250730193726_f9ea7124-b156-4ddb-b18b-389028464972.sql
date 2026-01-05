-- GAMIFICATION & REAL-TIME COLLABORATION SCHEMA

-- 1. GAMIFICATION ENUMS
CREATE TYPE public.activity_type AS ENUM (
  'idea_submitted',
  'idea_commented', 
  'idea_voted',
  'idea_approved',
  'project_created',
  'collaboration_active',
  'ai_analysis_used',
  'milestone_achieved'
);

CREATE TYPE public.achievement_type AS ENUM (
  'first_idea',
  'idea_genius',
  'collaborator',
  'innovator',
  'ai_explorer',
  'team_player',
  'trendsetter',
  'game_changer'
);

CREATE TYPE public.presence_status AS ENUM (
  'online',
  'away',
  'busy',
  'offline'
);

-- 2. USER POINTS SYSTEM
CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  level_number INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  next_level_threshold INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. INNOVATION ACTIVITIES LOG
CREATE TABLE public.innovation_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  points_earned INTEGER DEFAULT 0,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  idea_id UUID,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. USER ACHIEVEMENTS
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type achievement_type NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  icon_name TEXT,
  color_hex TEXT DEFAULT '#10B981',
  points_value INTEGER DEFAULT 0,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_type)
);

-- 5. INNOVATION IDEAS TABLE (Enhanced)
CREATE TABLE public.innovation_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'submitted',
  votes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  roi_potential NUMERIC DEFAULT 0,
  ai_analysis_score NUMERIC DEFAULT 0,
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_by_name TEXT,
  department TEXT,
  team TEXT,
  position_3d JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE innovation_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE innovation_ideas ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can view their own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update points" ON user_points
  FOR ALL USING (true);

CREATE POLICY "Users can view their own activities" ON innovation_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activities" ON innovation_activities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage achievements" ON user_achievements
  FOR ALL USING (true);

CREATE POLICY "Everyone can view ideas" ON innovation_ideas
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create ideas" ON innovation_ideas
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Authors can update their ideas" ON innovation_ideas
  FOR UPDATE USING (auth.uid() = submitted_by);

-- Indexes for performance
CREATE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX idx_innovation_activities_user_id ON innovation_activities(user_id);
CREATE INDEX idx_innovation_ideas_submitted_by ON innovation_ideas(submitted_by);
CREATE INDEX idx_innovation_ideas_status ON innovation_ideas(status);