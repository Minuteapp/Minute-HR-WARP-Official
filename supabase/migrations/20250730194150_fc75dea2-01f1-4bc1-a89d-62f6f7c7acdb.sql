-- RLS POLICIES AND GAMIFICATION FUNCTIONS

-- Drop existing policies if they exist to avoid conflicts
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_points' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_points';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'innovation_activities' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.innovation_activities';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_achievements' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_achievements';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'innovation_leaderboards' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.innovation_leaderboards';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'innovation_comments' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.innovation_comments';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'innovation_votes' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.innovation_votes';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_presence' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_presence';
    END LOOP;
END $$;

-- RLS Policies
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

CREATE POLICY "Everyone can view leaderboards" ON innovation_leaderboards
  FOR SELECT USING (true);

CREATE POLICY "System can update leaderboards" ON innovation_leaderboards
  FOR ALL USING (true);

CREATE POLICY "Everyone can view comments" ON innovation_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON innovation_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view votes" ON innovation_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON innovation_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view presence" ON user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their presence" ON user_presence
  FOR ALL USING (auth.uid() = user_id);

-- Gamification Functions
CREATE OR REPLACE FUNCTION award_points(
  p_user_id UUID,
  p_activity_type activity_type,
  p_points INTEGER,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  activity_id UUID;
  new_total_points INTEGER;
  new_level INTEGER;
BEGIN
  -- Insert activity
  INSERT INTO innovation_activities (
    user_id, activity_type, points_earned, description, metadata
  ) VALUES (
    p_user_id, p_activity_type, p_points, p_description, p_metadata
  ) RETURNING id INTO activity_id;
  
  -- Update user points
  INSERT INTO user_points (user_id, total_points, monthly_points, weekly_points)
  VALUES (p_user_id, p_points, p_points, p_points)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + p_points,
    monthly_points = user_points.monthly_points + p_points,
    weekly_points = user_points.weekly_points + p_points,
    updated_at = now()
  RETURNING total_points INTO new_total_points;
  
  -- Calculate new level
  new_level := FLOOR(new_total_points / 100) + 1;
  
  -- Update level if changed
  UPDATE user_points 
  SET 
    level_number = new_level,
    experience_points = new_total_points % 100,
    next_level_threshold = new_level * 100
  WHERE user_id = p_user_id;
  
  -- Update leaderboard
  INSERT INTO innovation_leaderboards (user_id, total_points, monthly_points, weekly_points, updated_at)
  VALUES (p_user_id, new_total_points, new_total_points, new_total_points, now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    monthly_points = innovation_leaderboards.monthly_points + p_points,
    weekly_points = innovation_leaderboards.weekly_points + p_points,
    updated_at = now();
  
  RETURN activity_id;
END;
$$;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  idea_count INTEGER;
  comment_count INTEGER;
  achievements_awarded INTEGER := 0;
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO idea_count
  FROM innovation_ideas WHERE submitted_by = p_user_id;
  
  SELECT COUNT(*) INTO comment_count
  FROM innovation_comments WHERE user_id = p_user_id;
  
  -- First Idea Achievement
  IF idea_count >= 1 THEN
    INSERT INTO user_achievements (
      user_id, achievement_type, achievement_name, achievement_description, 
      icon_name, points_value
    ) VALUES (
      p_user_id, 'first_idea', 'Erste Idee', 'Ihre erste brillante Idee eingereicht!',
      'lightbulb', 50
    ) ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      achievements_awarded := achievements_awarded + 1;
    END IF;
  END IF;
  
  -- Collaborator Achievement (5 comments)
  IF comment_count >= 5 THEN
    INSERT INTO user_achievements (
      user_id, achievement_type, achievement_name, achievement_description,
      icon_name, points_value
    ) VALUES (
      p_user_id, 'collaborator', 'Kollaborateur', '5 hilfreiche Kommentare verfasst!',
      'users', 100
    ) ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    IF FOUND THEN
      achievements_awarded := achievements_awarded + 1;
    END IF;
  END IF;
  
  RETURN achievements_awarded;
END;
$$;

-- Enable realtime for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE innovation_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE innovation_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE innovation_leaderboards;
ALTER PUBLICATION supabase_realtime ADD TABLE user_achievements;

-- Set replica identity for realtime
ALTER TABLE user_presence REPLICA IDENTITY FULL;
ALTER TABLE innovation_comments REPLICA IDENTITY FULL;
ALTER TABLE innovation_votes REPLICA IDENTITY FULL;
ALTER TABLE innovation_leaderboards REPLICA IDENTITY FULL;
ALTER TABLE user_achievements REPLICA IDENTITY FULL;