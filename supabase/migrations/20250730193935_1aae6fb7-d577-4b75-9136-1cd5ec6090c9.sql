-- GAMIFICATION & REAL-TIME COLLABORATION SCHEMA

-- Create enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
        CREATE TYPE public.activity_type AS ENUM (
          'idea_submitted',
          'idea_commented', 
          'idea_voted',
          'idea_approved',
          'project_created',
          'collaboration_active'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'achievement_type') THEN
        CREATE TYPE public.achievement_type AS ENUM (
          'first_idea',
          'idea_genius',
          'collaborator',
          'innovator',
          'team_player'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'presence_status') THEN
        CREATE TYPE public.presence_status AS ENUM (
          'online',
          'away',
          'busy',
          'offline'
        );
    END IF;
END $$;

-- User Points System
CREATE TABLE IF NOT EXISTS public.user_points (
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

-- Innovation Activities Log
CREATE TABLE IF NOT EXISTS public.innovation_activities (
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

-- User Achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
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

-- Innovation Leaderboards
CREATE TABLE IF NOT EXISTS public.innovation_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_avatar TEXT,
  total_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  ideas_count INTEGER DEFAULT 0,
  current_rank INTEGER DEFAULT 0,
  department TEXT,
  team TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Innovation Comments
CREATE TABLE IF NOT EXISTS public.innovation_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_avatar TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Innovation Votes
CREATE TABLE IF NOT EXISTS public.innovation_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT DEFAULT 'upvote',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(idea_id, user_id)
);

-- Real-time User Presence
CREATE TABLE IF NOT EXISTS public.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_avatar TEXT,
  status presence_status DEFAULT 'online',
  current_page TEXT,
  cursor_position JSONB,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE innovation_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE innovation_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE innovation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE innovation_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Basic Indexes
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_innovation_activities_user_id ON innovation_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_innovation_leaderboards_total_points ON innovation_leaderboards(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_innovation_comments_idea_id ON innovation_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_innovation_votes_idea_id ON innovation_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);