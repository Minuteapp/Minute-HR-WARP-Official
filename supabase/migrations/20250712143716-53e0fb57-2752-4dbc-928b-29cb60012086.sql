-- RLS Policies für Enterprise Benutzerverwaltung

-- RLS Policies für Permission Modules
CREATE POLICY "Everyone can view permission modules"
ON public.permission_modules
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage permission modules"
ON public.permission_modules
FOR ALL
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- RLS Policies für Role Permission Matrix
CREATE POLICY "Everyone can view role permissions"
ON public.role_permission_matrix
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage role permissions"
ON public.role_permission_matrix
FOR ALL
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- RLS Policies für Role Templates
CREATE POLICY "Everyone can view role templates"
ON public.role_templates
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage role templates"
ON public.role_templates
FOR ALL
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- RLS Policies für User Permission Overrides
CREATE POLICY "Users can view their own overrides"
ON public.user_permission_overrides
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all overrides"
ON public.user_permission_overrides
FOR SELECT
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins can insert overrides"
ON public.user_permission_overrides
FOR INSERT
WITH CHECK (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins can update overrides"
ON public.user_permission_overrides
FOR UPDATE
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins can delete overrides"
ON public.user_permission_overrides
FOR DELETE
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- RLS Policies für Feature Flags
CREATE POLICY "Everyone can view active feature flags"
ON public.feature_flags
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage feature flags"
ON public.feature_flags
FOR ALL
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));