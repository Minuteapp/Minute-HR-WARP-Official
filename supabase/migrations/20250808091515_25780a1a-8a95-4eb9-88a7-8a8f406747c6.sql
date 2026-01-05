-- Create location_zones and zone_events tables with RLS and triggers
-- and basic policies aligned with existing tenant/admin helpers

-- 1) location_zones
CREATE TABLE IF NOT EXISTS public.location_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('office','home','client','mobile')),
  latitude double precision NULL,
  longitude double precision NULL,
  radius_meters integer NULL,
  wifi_networks text[] NULL,
  address text NULL,
  is_active boolean NOT NULL DEFAULT true,
  auto_start_tracking boolean NOT NULL DEFAULT false,
  auto_stop_tracking boolean NOT NULL DEFAULT false,
  default_project text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_location_zones_company ON public.location_zones(company_id);
CREATE INDEX IF NOT EXISTS idx_location_zones_active ON public.location_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_location_zones_name ON public.location_zones(name);

-- Triggers
DROP TRIGGER IF EXISTS trg_location_zones_updated_at ON public.location_zones;
CREATE TRIGGER trg_location_zones_updated_at
BEFORE UPDATE ON public.location_zones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_location_zones_auto_company ON public.location_zones;
CREATE TRIGGER trg_location_zones_auto_company
BEFORE INSERT ON public.location_zones
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_company_id();

-- RLS
ALTER TABLE public.location_zones ENABLE ROW LEVEL SECURITY;

-- Policies: visibility by company, admins manage
DROP POLICY IF EXISTS "location_zones_company_select" ON public.location_zones;
CREATE POLICY "location_zones_company_select"
ON public.location_zones
FOR SELECT
USING (
  CASE
    WHEN public.is_in_tenant_context() THEN company_id = public.get_tenant_company_id_safe()
    WHEN (public.is_superadmin_safe(auth.uid()) AND NOT public.is_in_tenant_context()) THEN true
    ELSE company_id = public.get_user_company_id(auth.uid())
  END
);

DROP POLICY IF EXISTS "location_zones_admin_manage_insert" ON public.location_zones;
CREATE POLICY "location_zones_admin_manage_insert"
ON public.location_zones
FOR INSERT
WITH CHECK (
  public.is_superadmin_safe(auth.uid()) OR public.is_admin_safe(auth.uid())
);

DROP POLICY IF EXISTS "location_zones_admin_manage_update" ON public.location_zones;
CREATE POLICY "location_zones_admin_manage_update"
ON public.location_zones
FOR UPDATE
USING (
  public.is_superadmin_safe(auth.uid()) OR public.is_admin_safe(auth.uid())
)
WITH CHECK (
  public.is_superadmin_safe(auth.uid()) OR public.is_admin_safe(auth.uid())
);

DROP POLICY IF EXISTS "location_zones_admin_manage_delete" ON public.location_zones;
CREATE POLICY "location_zones_admin_manage_delete"
ON public.location_zones
FOR DELETE
USING (
  public.is_superadmin_safe(auth.uid()) OR public.is_admin_safe(auth.uid())
);


-- 2) zone_events
CREATE TABLE IF NOT EXISTS public.zone_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NULL,
  zone_id uuid NULL REFERENCES public.location_zones(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('enter','exit')),
  timestamp timestamptz NOT NULL DEFAULT now(),
  detection_method text NOT NULL CHECK (detection_method IN ('gps','wifi','manual')),
  auto_action_taken text NULL CHECK (auto_action_taken IN ('start_tracking','stop_tracking','none')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zone_events_company ON public.zone_events(company_id);
CREATE INDEX IF NOT EXISTS idx_zone_events_user ON public.zone_events(user_id);
CREATE INDEX IF NOT EXISTS idx_zone_events_zone ON public.zone_events(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_events_timestamp ON public.zone_events(timestamp DESC);

-- Triggers
DROP TRIGGER IF EXISTS trg_zone_events_auto_company ON public.zone_events;
CREATE TRIGGER trg_zone_events_auto_company
BEFORE INSERT ON public.zone_events
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_company_id();

-- RLS
ALTER TABLE public.zone_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
DROP POLICY IF EXISTS "zone_events_insert_own" ON public.zone_events;
CREATE POLICY "zone_events_insert_own"
ON public.zone_events
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Users can view their own, admins/superadmins can view company/all
DROP POLICY IF EXISTS "zone_events_select_visibility" ON public.zone_events;
CREATE POLICY "zone_events_select_visibility"
ON public.zone_events
FOR SELECT
USING (
  (user_id = auth.uid())
  OR public.is_superadmin_safe(auth.uid())
  OR (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin','hr')
        AND ur.company_id IS NOT DISTINCT FROM company_id
    )
  )
);

-- Do not allow updates/deletes by default (no policies)