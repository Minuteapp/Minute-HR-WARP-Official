-- ============================================
-- PHASE 2: Task Notifications Automation
-- ============================================

-- 1. Zentrale Notifications-Tabelle für ALLE Module
CREATE TABLE IF NOT EXISTS public.unified_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Modul-Identifikation
  source_module TEXT NOT NULL, -- 'tasks', 'calendar', 'absence', 'hr', 'documents', etc.
  source_id UUID, -- ID des Quell-Objekts (z.B. task_id, absence_id)
  source_table TEXT, -- Name der Quell-Tabelle
  
  -- Notification Details
  notification_type TEXT NOT NULL, -- 'assigned', 'status_changed', 'completed', 'reminder', 'approval_needed', etc.
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Link zur Detail-Ansicht
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadaten
  metadata JSONB DEFAULT '{}'::jsonb,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional: Auto-Löschung nach X Tagen
  
  -- Indices
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Enable RLS
ALTER TABLE public.unified_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies für unified_notifications
CREATE POLICY "Benutzer sehen eigene Notifications"
  ON public.unified_notifications
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_superadmin_safe(auth.uid())
  );

CREATE POLICY "System kann Notifications erstellen"
  ON public.unified_notifications
  FOR INSERT
  WITH CHECK (true); -- Wird von Triggern aufgerufen

CREATE POLICY "Benutzer können Notifications als gelesen markieren"
  ON public.unified_notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Benutzer können eigene Notifications löschen"
  ON public.unified_notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indices für Performance
CREATE INDEX idx_unified_notifications_user_id ON public.unified_notifications(user_id);
CREATE INDEX idx_unified_notifications_is_read ON public.unified_notifications(is_read);
CREATE INDEX idx_unified_notifications_source ON public.unified_notifications(source_module, source_id);
CREATE INDEX idx_unified_notifications_created_at ON public.unified_notifications(created_at DESC);
CREATE INDEX idx_unified_notifications_priority ON public.unified_notifications(priority);
CREATE INDEX idx_unified_notifications_company_id ON public.unified_notifications(company_id);

-- ============================================
-- 2. TASK NOTIFICATIONS TRIGGER FUNCTIONS
-- ============================================

-- Helper Function: Notification erstellen
CREATE OR REPLACE FUNCTION public.create_unified_notification(
  p_user_id UUID,
  p_source_module TEXT,
  p_source_id UUID,
  p_source_table TEXT,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_company_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.unified_notifications (
    user_id, source_module, source_id, source_table, 
    notification_type, title, message, priority, 
    action_url, metadata, company_id
  ) VALUES (
    p_user_id, p_source_module, p_source_id, p_source_table,
    p_notification_type, p_title, p_message, p_priority,
    p_action_url, p_metadata, p_company_id
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger Function: Task zugewiesen
CREATE OR REPLACE FUNCTION public.trigger_task_assigned_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Company ID ermitteln
  SELECT company_id INTO v_company_id
  FROM public.employees
  WHERE id = NEW.assigned_to
  LIMIT 1;
  
  -- Notification erstellen wenn Task zugewiesen wurde
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    PERFORM create_unified_notification(
      p_user_id := NEW.assigned_to,
      p_source_module := 'tasks',
      p_source_id := NEW.id,
      p_source_table := 'tasks',
      p_notification_type := 'task_assigned',
      p_title := '📋 Neue Aufgabe zugewiesen',
      p_message := format('Sie wurden der Aufgabe "%s" zugewiesen', NEW.title),
      p_priority := CASE 
        WHEN NEW.priority = 'urgent' THEN 'critical'
        WHEN NEW.priority = 'high' THEN 'high'
        ELSE 'medium'
      END,
      p_action_url := '/tasks/' || NEW.id::text,
      p_metadata := jsonb_build_object(
        'task_id', NEW.id,
        'task_title', NEW.title,
        'task_priority', NEW.priority,
        'assigned_by', NEW.created_by
      ),
      p_company_id := v_company_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger Function: Task Status geändert
CREATE OR REPLACE FUNCTION public.trigger_task_status_changed_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_creator_id UUID;
BEGIN
  -- Company ID ermitteln
  SELECT company_id INTO v_company_id
  FROM public.employees
  WHERE id = NEW.assigned_to
  LIMIT 1;
  
  -- Status-Änderungs-Notification
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notification an Ersteller (wenn nicht selbst)
    v_creator_id := NEW.created_by;
    
    IF v_creator_id IS NOT NULL AND v_creator_id != auth.uid() THEN
      PERFORM create_unified_notification(
        p_user_id := v_creator_id,
        p_source_module := 'tasks',
        p_source_id := NEW.id,
        p_source_table := 'tasks',
        p_notification_type := 'task_status_changed',
        p_title := '🔄 Task-Status aktualisiert',
        p_message := format('Status der Aufgabe "%s" wurde geändert: %s → %s', 
          NEW.title, OLD.status, NEW.status),
        p_priority := 'medium',
        p_action_url := '/tasks/' || NEW.id::text,
        p_metadata := jsonb_build_object(
          'task_id', NEW.id,
          'task_title', NEW.title,
          'old_status', OLD.status,
          'new_status', NEW.status,
          'changed_by', auth.uid()
        ),
        p_company_id := v_company_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger Function: Task abgeschlossen
CREATE OR REPLACE FUNCTION public.trigger_task_completed_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_creator_id UUID;
BEGIN
  -- Company ID ermitteln
  SELECT company_id INTO v_company_id
  FROM public.employees
  WHERE id = NEW.assigned_to
  LIMIT 1;
  
  -- Completion Notification
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    v_creator_id := NEW.created_by;
    
    -- Notification an Ersteller
    IF v_creator_id IS NOT NULL AND v_creator_id != auth.uid() THEN
      PERFORM create_unified_notification(
        p_user_id := v_creator_id,
        p_source_module := 'tasks',
        p_source_id := NEW.id,
        p_source_table := 'tasks',
        p_notification_type := 'task_completed',
        p_title := '✅ Aufgabe abgeschlossen',
        p_message := format('Die Aufgabe "%s" wurde erfolgreich abgeschlossen', NEW.title),
        p_priority := 'low',
        p_action_url := '/tasks/' || NEW.id::text,
        p_metadata := jsonb_build_object(
          'task_id', NEW.id,
          'task_title', NEW.title,
          'completed_by', auth.uid(),
          'completed_at', NOW()
        ),
        p_company_id := v_company_id
      );
    END IF;
    
    -- Log in employee_task_activities
    INSERT INTO public.employee_task_activities (
      employee_id,
      task_id,
      activity_type,
      new_status,
      completion_date,
      metadata,
      created_at
    ) VALUES (
      NEW.assigned_to,
      NEW.id,
      'completed',
      'completed',
      NOW(),
      jsonb_build_object(
        'task_title', NEW.title,
        'completed_by', auth.uid()
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. TRIGGER INSTALLATION
-- ============================================

-- Prüfe ob tasks Tabelle existiert
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tasks'
  ) THEN
    -- Drop alte Trigger falls vorhanden
    DROP TRIGGER IF EXISTS task_assigned_notification ON public.tasks;
    DROP TRIGGER IF EXISTS task_status_changed_notification ON public.tasks;
    DROP TRIGGER IF EXISTS task_completed_notification ON public.tasks;
    
    -- Neue Trigger erstellen
    CREATE TRIGGER task_assigned_notification
      AFTER INSERT OR UPDATE OF assigned_to ON public.tasks
      FOR EACH ROW
      EXECUTE FUNCTION trigger_task_assigned_notification();
    
    CREATE TRIGGER task_status_changed_notification
      AFTER UPDATE OF status ON public.tasks
      FOR EACH ROW
      EXECUTE FUNCTION trigger_task_status_changed_notification();
    
    CREATE TRIGGER task_completed_notification
      AFTER UPDATE OF status ON public.tasks
      FOR EACH ROW
      EXECUTE FUNCTION trigger_task_completed_notification();
    
    RAISE NOTICE 'Task Notifications Trigger erfolgreich installiert';
  ELSE
    RAISE NOTICE 'Tabelle tasks nicht gefunden - Trigger werden übersprungen';
  END IF;
END
$$;

-- ============================================
-- 4. RLS POLICIES für task_notifications (alte Tabelle)
-- ============================================

-- Alte task_notifications Tabelle sichern (falls vorhanden)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'task_notifications'
  ) THEN
    -- RLS Policies für alte Tabelle
    DROP POLICY IF EXISTS "Benutzer sehen eigene Task-Notifications" ON public.task_notifications;
    DROP POLICY IF EXISTS "System kann Task-Notifications erstellen" ON public.task_notifications;
    DROP POLICY IF EXISTS "Benutzer können Task-Notifications löschen" ON public.task_notifications;
    
    CREATE POLICY "Benutzer sehen eigene Task-Notifications"
      ON public.task_notifications
      FOR SELECT
      USING (auth.uid() = user_id OR is_superadmin_safe(auth.uid()));
    
    CREATE POLICY "System kann Task-Notifications erstellen"
      ON public.task_notifications
      FOR INSERT
      WITH CHECK (true);
    
    CREATE POLICY "Benutzer können Task-Notifications löschen"
      ON public.task_notifications
      FOR DELETE
      USING (auth.uid() = user_id);
    
    RAISE NOTICE 'RLS Policies für task_notifications erstellt';
  END IF;
END
$$;

-- ============================================
-- 5. RLS POLICIES für employee_task_activities
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'employee_task_activities'
  ) THEN
    -- RLS Policies
    DROP POLICY IF EXISTS "Benutzer sehen eigene Activities" ON public.employee_task_activities;
    DROP POLICY IF EXISTS "System kann Activities erstellen" ON public.employee_task_activities;
    DROP POLICY IF EXISTS "Admins sehen alle Activities" ON public.employee_task_activities;
    
    CREATE POLICY "Benutzer sehen eigene Activities"
      ON public.employee_task_activities
      FOR SELECT
      USING (auth.uid() = employee_id OR is_superadmin_safe(auth.uid()));
    
    CREATE POLICY "System kann Activities erstellen"
      ON public.employee_task_activities
      FOR INSERT
      WITH CHECK (true);
    
    CREATE POLICY "Admins sehen alle Activities"
      ON public.employee_task_activities
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'hr', 'superadmin')
        )
      );
    
    RAISE NOTICE 'RLS Policies für employee_task_activities erstellt';
  END IF;
END
$$;