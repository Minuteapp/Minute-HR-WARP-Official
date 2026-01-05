-- Phase 1: Datenbank-Erweiterungen für Kalender-Modul

-- 1.1 Erweitere calendar_events Tabelle
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS event_source TEXT,
ADD COLUMN IF NOT EXISTS source_id UUID,
ADD COLUMN IF NOT EXISTS sync_bidirectional BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS conflict_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS skill_requirements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS team_id UUID,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS location_id UUID;

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_source ON calendar_events(event_source, source_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_team ON calendar_events(team_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time_range ON calendar_events(start_time, end_time);

-- 1.2 Globale Kalender-Einstellungen
CREATE TABLE IF NOT EXISTS calendar_global_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    default_timezone TEXT DEFAULT 'Europe/Berlin',
    work_hours_start TIME DEFAULT '08:00',
    work_hours_end TIME DEFAULT '17:00',
    core_hours_start TIME DEFAULT '09:00',
    core_hours_end TIME DEFAULT '15:00',
    week_start_day INTEGER DEFAULT 1,
    holiday_calendar_country TEXT DEFAULT 'DE',
    conflict_priority_order JSONB DEFAULT '["absence", "shift", "project", "meeting"]'::jsonb,
    skill_check_mode TEXT DEFAULT 'soft',
    default_event_duration INTEGER DEFAULT 60,
    auto_sync_enabled BOOLEAN DEFAULT true,
    sync_frequency_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calendar_global_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view calendar settings for their company"
    ON calendar_global_settings FOR SELECT
    USING (company_id = get_effective_company_id() OR is_superadmin(auth.uid()));

CREATE POLICY "Admins can update calendar settings"
    ON calendar_global_settings FOR UPDATE
    USING (
        company_id = get_effective_company_id() 
        AND EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'hr', 'superadmin')
        )
    );

-- 1.3 Modul-lokale Einstellungen
CREATE TABLE IF NOT EXISTS calendar_module_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope_type TEXT NOT NULL,
    scope_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    default_view TEXT DEFAULT 'week',
    visible_event_types JSONB DEFAULT '["all"]'::jsonb,
    color_scheme JSONB DEFAULT '{}'::jsonb,
    time_slot_minutes INTEGER DEFAULT 15,
    show_weekends BOOLEAN DEFAULT true,
    show_multi_timezone BOOLEAN DEFAULT false,
    timezones_to_show JSONB DEFAULT '[]'::jsonb,
    default_reminders JSONB DEFAULT '[{"time": "15 minutes", "method": "notification"}]'::jsonb,
    saved_filters JSONB DEFAULT '[]'::jsonb,
    quick_create_templates JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scope_type, scope_id, company_id)
);

ALTER TABLE calendar_module_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their module settings"
    ON calendar_module_settings FOR SELECT
    USING (
        (scope_type = 'user' AND scope_id = auth.uid())
        OR company_id = get_effective_company_id()
    );

-- 1.4 Synchronisations-Tabellen
CREATE TABLE IF NOT EXISTS calendar_sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    sync_direction TEXT DEFAULT 'bidirectional',
    last_sync_at TIMESTAMPTZ,
    next_sync_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'active',
    sync_errors JSONB DEFAULT '[]'::jsonb,
    credentials_encrypted TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calendar_sync_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sync jobs"
    ON calendar_sync_jobs FOR ALL
    USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS calendar_sync_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_job_id UUID REFERENCES calendar_sync_jobs(id) ON DELETE CASCADE,
    internal_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    external_event_id TEXT NOT NULL,
    last_modified_at TIMESTAMPTZ,
    sync_metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(sync_job_id, external_event_id)
);

ALTER TABLE calendar_sync_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their sync mappings"
    ON calendar_sync_mappings FOR SELECT
    USING (
        sync_job_id IN (
            SELECT id FROM calendar_sync_jobs WHERE user_id = auth.uid()
        )
    );

-- 1.5 Audit & Historie
CREATE TABLE IF NOT EXISTS calendar_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    changes_json JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calendar_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
    ON calendar_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'hr', 'superadmin')
        )
    );

-- 1.6 Bidirektionale Trigger
CREATE OR REPLACE FUNCTION sync_absence_to_calendar()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' THEN
        INSERT INTO calendar_events (
            title, start_time, end_time, type, event_source, source_id,
            created_by, company_id, is_all_day, sync_bidirectional
        ) VALUES (
            'Abwesenheit: ' || COALESCE(NEW.type, 'Urlaub'),
            NEW.start_date::timestamptz,
            NEW.end_date::timestamptz,
            'absence',
            'absence',
            NEW.id,
            NEW.user_id,
            (SELECT company_id FROM user_roles WHERE user_id = NEW.user_id LIMIT 1),
            true,
            true
        ) ON CONFLICT DO NOTHING;
    ELSIF NEW.status IN ('rejected', 'cancelled') AND OLD.status = 'approved' THEN
        DELETE FROM calendar_events 
        WHERE event_source = 'absence' AND source_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_absence_to_calendar
    AFTER INSERT OR UPDATE ON absence_requests
    FOR EACH ROW
    EXECUTE FUNCTION sync_absence_to_calendar();

-- Trigger für Schichten
CREATE OR REPLACE FUNCTION sync_shift_to_calendar()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO calendar_events (
        title, start_time, end_time, type, event_source, source_id,
        created_by, company_id, sync_bidirectional
    ) VALUES (
        'Schicht: ' || COALESCE(NEW.shift_type, 'Standard'),
        (NEW.date::text || ' ' || NEW.start_time::text)::timestamptz,
        (NEW.date::text || ' ' || NEW.end_time::text)::timestamptz,
        'shift',
        'shift',
        NEW.id,
        NEW.employee_id,
        (SELECT company_id FROM employees WHERE id = NEW.employee_id LIMIT 1),
        true
    ) ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_shift_to_calendar
    AFTER INSERT OR UPDATE ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION sync_shift_to_calendar();

-- Audit-Trigger für calendar_events
CREATE OR REPLACE FUNCTION log_calendar_event_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO calendar_audit_log (
        event_id, action, performed_by, changes_json
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        auth.uid(),
        jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        )
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_calendar_changes
    AFTER INSERT OR UPDATE OR DELETE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION log_calendar_event_changes();