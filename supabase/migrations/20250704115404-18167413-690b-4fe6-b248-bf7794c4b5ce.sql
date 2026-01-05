-- ========================================
-- RLS POLICIES FÜR INNOVATION HUB
-- ========================================

-- Innovation Ideas
ALTER TABLE public.innovation_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all innovation ideas" ON public.innovation_ideas
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can create their own ideas" ON public.innovation_ideas
  FOR INSERT WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Users can update their own ideas" ON public.innovation_ideas
  FOR UPDATE USING (auth.uid() = submitter_id OR is_admin(auth.uid()));

CREATE POLICY "Admins can delete ideas" ON public.innovation_ideas
  FOR DELETE USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Innovation Votes
ALTER TABLE public.innovation_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes" ON public.innovation_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can vote on ideas" ON public.innovation_votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can update their own votes" ON public.innovation_votes
  FOR UPDATE USING (auth.uid() = voter_id);

CREATE POLICY "Users can delete their own votes" ON public.innovation_votes
  FOR DELETE USING (auth.uid() = voter_id);

-- Innovation Comments
ALTER TABLE public.innovation_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments" ON public.innovation_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.innovation_comments
  FOR INSERT WITH CHECK (auth.uid() = commenter_id);

CREATE POLICY "Users can update their own comments" ON public.innovation_comments
  FOR UPDATE USING (auth.uid() = commenter_id);

CREATE POLICY "Users can delete their own comments" ON public.innovation_comments
  FOR DELETE USING (auth.uid() = commenter_id OR is_admin(auth.uid()));

-- Innovation Workflows
ALTER TABLE public.innovation_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflows for their ideas" ON public.innovation_workflows
  FOR SELECT USING (
    idea_id IN (
      SELECT id FROM public.innovation_ideas 
      WHERE submitter_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

CREATE POLICY "Admins can manage workflows" ON public.innovation_workflows
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Innovation Settings
ALTER TABLE public.innovation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view settings" ON public.innovation_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.innovation_settings
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));