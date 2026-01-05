-- ============================================
-- Remote Work System: 10 Tables Migration
-- ============================================

-- 1. employee_homeoffice_agreements
CREATE TABLE IF NOT EXISTS public.employee_homeoffice_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('3_days_week', '2_days_week', '4_days_week', 'full_remote', 'hybrid')),
  days_per_week INTEGER NOT NULL,
  remote_percentage INTEGER NOT NULL,
  office_percentage INTEGER NOT NULL,
  preferred_home_days TEXT[] NOT NULL DEFAULT '{}',
  office_days TEXT[] NOT NULL DEFAULT '{}',
  core_hours_start TIME,
  core_hours_end TIME,
  valid_since DATE NOT NULL,
  badge_color TEXT DEFAULT 'hybrid',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. employee_remote_equipment
CREATE TABLE IF NOT EXISTS public.employee_remote_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  budget_amount DECIMAL(10,2) NOT NULL,
  budget_currency TEXT NOT NULL DEFAULT 'EUR',
  budget_type TEXT NOT NULL CHECK (budget_type IN ('one_time', 'annual')),
  budget_used DECIMAL(10,2) NOT NULL DEFAULT 0,
  budget_remaining DECIMAL(10,2) NOT NULL,
  budget_status TEXT NOT NULL CHECK (budget_status IN ('available', 'partially_used', 'fully_used')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. employee_remote_equipment_items
CREATE TABLE IF NOT EXISTS public.employee_remote_equipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  equipment_id UUID NOT NULL REFERENCES public.employee_remote_equipment(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_category TEXT NOT NULL,
  assigned_date DATE NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'requested', 'returned')),
  serial_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. employee_desk_bookings
CREATE TABLE IF NOT EXISTS public.employee_desk_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  workspace_model TEXT NOT NULL CHECK (workspace_model IN ('desk_sharing', 'fixed_desk', 'hot_desking')),
  preferred_floor TEXT,
  workspace_type TEXT,
  locker_number TEXT,
  locker_assigned BOOLEAN DEFAULT false,
  badge_label TEXT,
  badge_color TEXT DEFAULT 'purple',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. employee_desk_booking_entries
CREATE TABLE IF NOT EXISTS public.employee_desk_booking_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  desk_booking_id UUID NOT NULL REFERENCES public.employee_desk_bookings(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  desk_number TEXT,
  floor TEXT,
  status TEXT NOT NULL CHECK (status IN ('gebucht', 'storniert', 'abgelaufen')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. employee_work_time_models
CREATE TABLE IF NOT EXISTS public.employee_work_time_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  model_name TEXT NOT NULL,
  hours_per_week INTEGER NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('gleitzeit', '4_day_week', 'flexible', 'fixed')),
  badge_label TEXT,
  badge_color TEXT DEFAULT 'green',
  description TEXT,
  core_hours_start TIME,
  core_hours_end TIME,
  flex_time_start TIME,
  flex_time_end TIME,
  overtime_balance_current DECIMAL(10,2) DEFAULT 0,
  overtime_balance_max DECIMAL(10,2) DEFAULT 40,
  is_active BOOLEAN DEFAULT true,
  available_models JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. employee_workations
CREATE TABLE IF NOT EXISTS public.employee_workations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('genehmigt', 'ausstehend', 'abgelehnt', 'abgeschlossen')),
  badge_color TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. employee_workation_summary
CREATE TABLE IF NOT EXISTS public.employee_workation_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  year INTEGER NOT NULL,
  available_days_per_year INTEGER NOT NULL DEFAULT 30,
  days_used INTEGER NOT NULL DEFAULT 0,
  days_remaining INTEGER NOT NULL,
  allowed_countries TEXT[] DEFAULT '{"EU + ausgewählte Länder"}',
  next_workation_country TEXT,
  next_workation_month TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, year)
);

-- 9. employee_remote_work_stats
CREATE TABLE IF NOT EXISTS public.employee_remote_work_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  year INTEGER NOT NULL,
  total_work_days INTEGER NOT NULL,
  homeoffice_days INTEGER NOT NULL,
  office_days INTEGER NOT NULL,
  remote_quote_percentage INTEGER NOT NULL,
  co2_savings_kg DECIMAL(10,2),
  meeting_remote_percentage INTEGER,
  productivity_change_percentage INTEGER,
  homeoffice_distribution JSONB,
  stats_period_start DATE NOT NULL,
  stats_period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, year)
);

-- 10. employee_connectivity_support
CREATE TABLE IF NOT EXISTS public.employee_connectivity_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  internet_allowance_amount DECIMAL(10,2),
  internet_allowance_currency TEXT DEFAULT 'EUR',
  internet_allowance_frequency TEXT DEFAULT 'monthly',
  mobile_data_plan TEXT,
  mobile_data_type TEXT,
  vpn_access BOOLEAN DEFAULT false,
  vpn_status TEXT,
  collaboration_tools JSONB,
  it_support_hotline TEXT,
  it_support_hours TEXT,
  remote_support_available BOOLEAN DEFAULT true,
  ticket_system_available BOOLEAN DEFAULT true,
  avg_response_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- Enable RLS
ALTER TABLE public.employee_homeoffice_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_remote_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_remote_equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_desk_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_desk_booking_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_work_time_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_workations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_workation_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_remote_work_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_connectivity_support ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Employees can view their own data, HR/Admin can view all)
CREATE POLICY "Users can view own homeoffice agreements" ON public.employee_homeoffice_agreements FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all homeoffice agreements" ON public.employee_homeoffice_agreements FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr')));

CREATE POLICY "Users can view own remote equipment" ON public.employee_remote_equipment FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all remote equipment" ON public.employee_remote_equipment FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr')));

CREATE POLICY "Users can view own equipment items" ON public.employee_remote_equipment_items FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all equipment items" ON public.employee_remote_equipment_items FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr')));

CREATE POLICY "Users can view own desk bookings" ON public.employee_desk_bookings FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all desk bookings" ON public.employee_desk_bookings FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr')));

CREATE POLICY "Users can view own booking entries" ON public.employee_desk_booking_entries FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all booking entries" ON public.employee_desk_booking_entries FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr')));

CREATE POLICY "Users can view own work time models" ON public.employee_work_time_models FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all work time models" ON public.employee_work_time_models FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr')));

CREATE POLICY "Users can view own workations" ON public.employee_workations FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all workations" ON public.employee_workations FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr')));

CREATE POLICY "Users can view own workation summary" ON public.employee_workation_summary FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all workation summaries" ON public.employee_workation_summary FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr')));

CREATE POLICY "Users can view own remote work stats" ON public.employee_remote_work_stats FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all remote work stats" ON public.employee_remote_work_stats FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr')));

CREATE POLICY "Users can view own connectivity support" ON public.employee_connectivity_support FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all connectivity support" ON public.employee_connectivity_support FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'hr')));

-- Insert test data for Daniel Häuslein (employee_id: 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3')
-- 1. Homeoffice Agreement
INSERT INTO public.employee_homeoffice_agreements (employee_id, model_type, days_per_week, remote_percentage, office_percentage, preferred_home_days, office_days, core_hours_start, core_hours_end, valid_since, badge_color)
VALUES ('aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', '3_days_week', 3, 60, 40, ARRAY['Mo', 'Mi', 'Fr'], ARRAY['Di', 'Do'], '10:00', '16:00', '2024-01-01', 'hybrid');

-- 2. Remote Equipment
INSERT INTO public.employee_remote_equipment (employee_id, budget_amount, budget_currency, budget_type, budget_used, budget_remaining, budget_status)
VALUES ('aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', 1500.00, 'EUR', 'one_time', 1500.00, 0.00, 'fully_used');

-- 3. Remote Equipment Items
INSERT INTO public.employee_remote_equipment_items (employee_id, equipment_id, item_name, item_category, assigned_date, cost, status)
SELECT 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', id, 'Dell UltraSharp 27" Monitor', 'monitor', '2024-02-01', 450.00, 'assigned' FROM public.employee_remote_equipment WHERE employee_id = 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3';

INSERT INTO public.employee_remote_equipment_items (employee_id, equipment_id, item_name, item_category, assigned_date, cost, status)
SELECT 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', id, 'Ergonomischer Bürostuhl (Herman Miller)', 'chair', '2024-02-01', 850.00, 'assigned' FROM public.employee_remote_equipment WHERE employee_id = 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3';

INSERT INTO public.employee_remote_equipment_items (employee_id, equipment_id, item_name, item_category, assigned_date, cost, status)
SELECT 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', id, 'Laptop Stand & Wireless Keyboard', 'accessories', '2024-02-01', 120.00, 'assigned' FROM public.employee_remote_equipment WHERE employee_id = 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3';

INSERT INTO public.employee_remote_equipment_items (employee_id, equipment_id, item_name, item_category, assigned_date, cost, status)
SELECT 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', id, 'Noise-Cancelling Headset (Bose)', 'accessories', '2024-02-01', 80.00, 'assigned' FROM public.employee_remote_equipment WHERE employee_id = 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3';

-- 4. Desk Bookings
INSERT INTO public.employee_desk_bookings (employee_id, workspace_model, preferred_floor, workspace_type, locker_number, locker_assigned, badge_label, badge_color)
VALUES ('aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', 'desk_sharing', '3. OG (Product Team)', 'ruhezone', 'Locker #327', true, 'Desk Sharing', 'purple');

-- 5. Desk Booking Entries
INSERT INTO public.employee_desk_booking_entries (employee_id, desk_booking_id, booking_date, floor, status)
SELECT 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', id, '2025-10-29', '3. OG', 'gebucht' FROM public.employee_desk_bookings WHERE employee_id = 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3';

INSERT INTO public.employee_desk_booking_entries (employee_id, desk_booking_id, booking_date, floor, status)
SELECT 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', id, '2025-10-31', '3. OG', 'gebucht' FROM public.employee_desk_bookings WHERE employee_id = 'aceba026-e76b-4e44-ad8d-f56f7ae1a8c3';

-- 6. Work Time Model
INSERT INTO public.employee_work_time_models (employee_id, model_name, hours_per_week, model_type, badge_label, badge_color, description, core_hours_start, core_hours_end, flex_time_start, flex_time_end, overtime_balance_current, overtime_balance_max, is_active, available_models)
VALUES ('aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', 'Vollzeit (40h/Woche)', 40, 'gleitzeit', 'Gleitzeit', 'green', 'Flexible Einteilung innerhalb Kernarbeitszeit', '10:00', '16:00', '07:00', '20:00', 12.5, 40, true, 
'[{"name": "Gleitzeit", "active": true}, {"name": "4-Tage-Woche (80% Teilzeit)", "active": false}, {"name": "Vollzeit flexibel (Vertrauensarbeitszeit)", "active": false}]'::jsonb);

-- 7. Workation Summary
INSERT INTO public.employee_workation_summary (employee_id, year, available_days_per_year, days_used, days_remaining, allowed_countries, next_workation_country, next_workation_month)
VALUES ('aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', 2025, 30, 14, 16, ARRAY['EU + ausgewählte Länder'], 'Italien', 'Nov 2025');

-- 8. Workations
INSERT INTO public.employee_workations (employee_id, country, city, start_date, end_date, days_count, status, badge_color)
VALUES 
('aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', 'Spanien', 'Barcelona', '2025-07-01', '2025-07-10', 10, 'genehmigt', 'green'),
('aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', 'Portugal', 'Lissabon', '2025-09-18', '2025-09-21', 4, 'genehmigt', 'green'),
('aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', 'Italien', 'Florenz', '2025-11-18', '2025-11-24', 7, 'ausstehend', 'blue');

-- 9. Remote Work Stats
INSERT INTO public.employee_remote_work_stats (employee_id, year, total_work_days, homeoffice_days, office_days, remote_quote_percentage, co2_savings_kg, meeting_remote_percentage, productivity_change_percentage, homeoffice_distribution, stats_period_start, stats_period_end)
VALUES ('aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', 2025, 240, 142, 98, 59, 680.00, 65, 8, 
'{"Mo": 85, "Di": 45, "Mi": 78, "Do": 38, "Fr": 92}'::jsonb, '2025-01-01', '2025-10-31');

-- 10. Connectivity Support
INSERT INTO public.employee_connectivity_support (employee_id, internet_allowance_amount, internet_allowance_currency, internet_allowance_frequency, mobile_data_plan, mobile_data_type, vpn_access, vpn_status, collaboration_tools, it_support_hotline, it_support_hours, remote_support_available, ticket_system_available, avg_response_time)
VALUES ('aceba026-e76b-4e44-ad8d-f56f7ae1a8c3', 40.00, 'EUR', 'monthly', 'Unlimited', '5G Firmenvertrag', true, '24/7 Aktiv',
'[{"name": "Microsoft Teams", "available": true}, {"name": "Slack Premium", "available": true}, {"name": "Zoom Enterprise", "available": true}, {"name": "Miro Whiteboard", "available": true}]'::jsonb,
'0800-IT-HELP', 'Mo-Fr 8-18h', true, true, '< 2h');