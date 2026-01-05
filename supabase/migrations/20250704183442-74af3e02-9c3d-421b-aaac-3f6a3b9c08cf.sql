-- Erweiterte Kalender-Tabellen für Enterprise-Features

-- Kalender-Einstellungen pro Unternehmen/Benutzer
CREATE TABLE IF NOT EXISTS public.calendar_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID,
    default_view TEXT DEFAULT 'month' CHECK (default_view IN ('day', 'week', 'month', 'year')),
    working_hours_start TIME DEFAULT '09:00:00',
    working_hours_end TIME DEFAULT '17:00:00',
    working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Monday=1, Sunday=7
    timezone TEXT DEFAULT 'Europe/Berlin',
    auto_decline_conflicts BOOLEAN DEFAULT false,
    meeting_buffer_minutes INTEGER DEFAULT 15,
    default_meeting_duration INTEGER DEFAULT 60,
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erweiterte Event-Typen
CREATE TYPE event_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE event_visibility AS ENUM ('public', 'private', 'confidential');
CREATE TYPE recurrence_type AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');

-- Erweiterte calendar_events Tabelle (falls nicht vollständig vorhanden)
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    location TEXT,
    type TEXT DEFAULT 'event',
    priority event_priority DEFAULT 'medium',
    visibility event_visibility DEFAULT 'public',
    color TEXT DEFAULT '#3B82F6',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organizer_email TEXT,
    attendees JSONB DEFAULT '[]',
    recurrence_type recurrence_type DEFAULT 'none',
    recurrence_rule JSONB,
    parent_event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE,
    external_id TEXT, -- für Sync mit externen Kalendern
    external_source TEXT, -- 'google', 'outlook', etc.
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
    meeting_url TEXT,
    reminder_minutes INTEGER[] DEFAULT ARRAY[15],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event-Teilnehmer
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    response_status TEXT DEFAULT 'pending' CHECK (response_status IN ('pending', 'accepted', 'declined', 'tentative')),
    is_organizer BOOLEAN DEFAULT false,
    is_optional BOOLEAN DEFAULT false,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Kalender-Konflikte
CREATE TABLE IF NOT EXISTS public.calendar_conflicts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE NOT NULL,
    conflicting_event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE NOT NULL,
    conflict_type TEXT NOT NULL CHECK (conflict_type IN ('time_overlap', 'resource_conflict', 'attendee_conflict')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    auto_resolved BOOLEAN DEFAULT false,
    resolution_note TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Ressourcen (Räume, Equipment)
CREATE TABLE IF NOT EXISTS public.calendar_resources (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('room', 'equipment', 'vehicle', 'other')),
    description TEXT,
    capacity INTEGER,
    location TEXT,
    features JSONB DEFAULT '{}', -- {"projector": true, "whiteboard": true}
    booking_rules JSONB DEFAULT '{}', -- {"max_duration": 480, "advance_booking_days": 30}
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ressourcen-Buchungen
CREATE TABLE IF NOT EXISTS public.event_resources (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.calendar_resources(id) ON DELETE CASCADE NOT NULL,
    booking_status TEXT DEFAULT 'booked' CHECK (booking_status IN ('booked', 'pending', 'cancelled')),
    setup_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Kalender-Feiertage
CREATE TABLE IF NOT EXISTS public.calendar_holidays (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    country_code TEXT DEFAULT 'DE',
    region_code TEXT, -- für Bundesländer wie 'BY', 'NW'
    is_public_holiday BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Insights und Suggestions
CREATE TABLE IF NOT EXISTS public.calendar_ai_insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('meeting_optimization', 'time_block_suggestion', 'conflict_prevention', 'focus_time')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommended_action JSONB,
    confidence_score NUMERIC DEFAULT 0.8,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'applied', 'dismissed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- Kalender-Integrationen
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    integration_type TEXT NOT NULL CHECK (integration_type IN ('google', 'outlook', 'apple', 'caldav')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('import_only', 'export_only', 'bidirectional')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_token TEXT,
    error_message TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Policies für calendar_settings
CREATE POLICY "Users can manage their own calendar settings" ON public.calendar_settings
FOR ALL USING (auth.uid() = user_id);

-- Policies für calendar_events
CREATE POLICY "Users can view events they created or are invited to" ON public.calendar_events
FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.event_attendees WHERE event_id = id AND user_id = auth.uid())
);

CREATE POLICY "Users can create events" ON public.calendar_events
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events" ON public.calendar_events
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events" ON public.calendar_events
FOR DELETE USING (auth.uid() = created_by);

-- Policies für event_attendees
CREATE POLICY "Users can view attendees of events they can see" ON public.event_attendees
FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.calendar_events WHERE id = event_id AND created_by = auth.uid())
);

CREATE POLICY "Event organizers can manage attendees" ON public.event_attendees
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.calendar_events WHERE id = event_id AND created_by = auth.uid())
);

-- Policies für andere Tabellen
CREATE POLICY "Everyone can view holidays" ON public.calendar_holidays FOR SELECT USING (true);

CREATE POLICY "Everyone can view active resources" ON public.calendar_resources 
FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own AI insights" ON public.calendar_ai_insights
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own integrations" ON public.calendar_integrations
FOR ALL USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can manage everything" ON public.calendar_settings
FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins can manage all events" ON public.calendar_events
FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins can manage resources" ON public.calendar_resources
FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins can manage holidays" ON public.calendar_holidays
FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calendar_settings_updated_at
    BEFORE UPDATE ON public.calendar_settings
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER update_calendar_resources_updated_at
    BEFORE UPDATE ON public.calendar_resources
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER update_calendar_integrations_updated_at
    BEFORE UPDATE ON public.calendar_integrations
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON public.calendar_events(created_by);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events(type);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_holidays_date ON public.calendar_holidays(date);
CREATE INDEX IF NOT EXISTS idx_calendar_holidays_country_region ON public.calendar_holidays(country_code, region_code);

-- Beispiel-Feiertage für Deutschland einfügen
INSERT INTO public.calendar_holidays (name, date, country_code, region_code, is_public_holiday) VALUES
('Neujahr', '2025-01-01', 'DE', NULL, true),
('Heilige Drei Könige', '2025-01-06', 'DE', 'BY', true),
('Karfreitag', '2025-04-18', 'DE', NULL, true),
('Ostermontag', '2025-04-21', 'DE', NULL, true),
('Tag der Arbeit', '2025-05-01', 'DE', NULL, true),
('Christi Himmelfahrt', '2025-05-29', 'DE', NULL, true),
('Pfingstmontag', '2025-06-09', 'DE', NULL, true),
('Fronleichnam', '2025-06-19', 'DE', 'BY', true),
('Mariä Himmelfahrt', '2025-08-15', 'DE', 'BY', true),
('Tag der Deutschen Einheit', '2025-10-03', 'DE', NULL, true),
('Allerheiligen', '2025-11-01', 'DE', 'BY', true),
('1. Weihnachtstag', '2025-12-25', 'DE', NULL, true),
('2. Weihnachtstag', '2025-12-26', 'DE', NULL, true)
ON CONFLICT DO NOTHING;