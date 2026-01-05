-- RLS Policies für business_travel_requests
CREATE POLICY "Users can view their own travel requests"
ON public.business_travel_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own travel requests"
ON public.business_travel_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests"
ON public.business_travel_requests
FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending', 'draft'));

CREATE POLICY "Admins can view all travel requests"
ON public.business_travel_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can update all travel requests"
ON public.business_travel_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für travel_approvals
CREATE POLICY "Users can view approvals for their requests"
ON public.travel_approvals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_travel_requests 
    WHERE id = travel_request_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Approvers can manage their approvals"
ON public.travel_approvals
FOR ALL
USING (approver_id = auth.uid());

CREATE POLICY "Admins can manage all approvals"
ON public.travel_approvals
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für travel_policies
CREATE POLICY "Admins can manage travel policies"
ON public.travel_policies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can view active travel policies"
ON public.travel_policies
FOR SELECT
USING (is_active = true);

-- RLS Policies für travel_analytics
CREATE POLICY "Admins can view travel analytics"
ON public.travel_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für travel_map_pins
CREATE POLICY "Admins can view all map pins"
ON public.travel_map_pins
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can view pins for their own travels"
ON public.travel_map_pins
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_travel_requests 
    WHERE id = travel_request_id AND user_id = auth.uid()
  )
);