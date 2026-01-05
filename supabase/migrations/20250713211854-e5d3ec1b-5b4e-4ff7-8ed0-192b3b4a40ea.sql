-- RLS Policies for Onboarding Tables

-- Basic policies that allow authenticated users to interact with onboarding data
-- Will be enhanced later with proper company isolation

-- Onboarding Processes Policies
CREATE POLICY "onboarding_processes_select" ON public.onboarding_processes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "onboarding_processes_insert" ON public.onboarding_processes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "onboarding_processes_update" ON public.onboarding_processes FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Onboarding Checklist Items Policies  
CREATE POLICY "checklist_items_select" ON public.onboarding_checklist_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "checklist_items_insert" ON public.onboarding_checklist_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "checklist_items_update" ON public.onboarding_checklist_items FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Onboarding Feedback Policies
CREATE POLICY "feedback_select" ON public.onboarding_feedback FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "feedback_insert" ON public.onboarding_feedback FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Onboarding Badges Policies (read-only for most users)
CREATE POLICY "badges_select" ON public.onboarding_badges FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "badges_admin_manage" ON public.onboarding_badges FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Employee Badges Policies
CREATE POLICY "employee_badges_select" ON public.employee_badges FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "employee_badges_insert" ON public.employee_badges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Wiki Articles Policies
CREATE POLICY "wiki_articles_select" ON public.onboarding_wiki_articles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "wiki_articles_manage" ON public.onboarding_wiki_articles FOR ALL USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Wiki Attachments Policies
CREATE POLICY "wiki_attachments_select" ON public.onboarding_wiki_attachments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "wiki_attachments_manage" ON public.onboarding_wiki_attachments FOR ALL USING (
  auth.uid() = uploaded_by OR 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- IT Setup Items Policies
CREATE POLICY "it_setup_select" ON public.onboarding_it_setup_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "it_setup_manage" ON public.onboarding_it_setup_items FOR ALL USING (auth.uid() IS NOT NULL);

-- Onboarding Levels Policies (read-only for most users)
CREATE POLICY "levels_select" ON public.onboarding_levels FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "levels_admin_manage" ON public.onboarding_levels FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Onboarding Goals Policies
CREATE POLICY "goals_select" ON public.onboarding_goals FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "goals_insert" ON public.onboarding_goals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "goals_update" ON public.onboarding_goals FOR UPDATE USING (auth.uid() IS NOT NULL);