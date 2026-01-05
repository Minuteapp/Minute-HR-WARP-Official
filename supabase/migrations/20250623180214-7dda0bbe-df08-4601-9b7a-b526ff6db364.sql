
-- Task-Benachrichtigungen Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.task_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('task_completed', 'task_assigned', 'task_status_changed')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee Task Activities Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.employee_task_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  task_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('completed', 'assigned', 'unassigned', 'status_changed')),
  previous_status TEXT,
  new_status TEXT,
  completion_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für task_notifications aktivieren
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;

-- Policy für task_notifications - Benutzer können nur ihre eigenen Benachrichtigungen sehen
CREATE POLICY "Users can view their own task notifications" ON public.task_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy für task_notifications - Benachrichtigungen können erstellt werden
CREATE POLICY "Allow task notification creation" ON public.task_notifications
  FOR INSERT WITH CHECK (true);

-- Policy für task_notifications - Benutzer können ihre Benachrichtigungen als gelesen markieren
CREATE POLICY "Users can update their own task notifications" ON public.task_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS für employee_task_activities aktivieren
ALTER TABLE public.employee_task_activities ENABLE ROW LEVEL SECURITY;

-- Policy für employee_task_activities - Benutzer können ihre eigenen Aktivitäten sehen
CREATE POLICY "Users can view their own task activities" ON public.employee_task_activities
  FOR SELECT USING (auth.uid() = employee_id);

-- Policy für employee_task_activities - Aktivitäten können erstellt werden
CREATE POLICY "Allow task activity creation" ON public.employee_task_activities
  FOR INSERT WITH CHECK (true);

-- Trigger-Funktion für automatische Benachrichtigungen bei Task-Status-Änderungen
CREATE OR REPLACE FUNCTION public.notify_task_status_change()
RETURNS TRIGGER AS $$
DECLARE
  task_assignee_id UUID;
  task_title TEXT;
  notification_message TEXT;
BEGIN
  -- Hole Task-Details
  SELECT assigned_to, title INTO task_assignee_id, task_title
  FROM public.tasks 
  WHERE id = NEW.id;
  
  -- Nur bei Statusänderungen
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Erstelle Benachrichtigung für den zugewiesenen Benutzer
    IF task_assignee_id IS NOT NULL THEN
      notification_message := 'Status der Aufgabe "' || COALESCE(task_title, 'Unbekannte Aufgabe') || '" wurde zu "' || NEW.status || '" geändert.';
      
      INSERT INTO public.task_notifications (
        task_id,
        user_id,
        notification_type,
        message,
        metadata
      ) VALUES (
        NEW.id,
        task_assignee_id,
        'task_status_changed',
        notification_message,
        jsonb_build_object(
          'old_status', OLD.status,
          'new_status', NEW.status,
          'task_title', task_title
        )
      );
      
      -- Erstelle Employee Task Activity
      INSERT INTO public.employee_task_activities (
        employee_id,
        task_id,
        activity_type,
        previous_status,
        new_status,
        metadata
      ) VALUES (
        task_assignee_id,
        NEW.id,
        'status_changed',
        OLD.status,
        NEW.status,
        jsonb_build_object(
          'task_title', task_title,
          'changed_by', auth.uid()
        )
      );
    END IF;
    
    -- Spezielle Behandlung für "done" Status
    IF NEW.status = 'done' THEN
      UPDATE public.tasks 
      SET completed = true, completed_at = NOW()
      WHERE id = NEW.id;
      
      -- Zusätzliche Benachrichtigung für Fertigstellung
      IF task_assignee_id IS NOT NULL THEN
        INSERT INTO public.task_notifications (
          task_id,
          user_id,
          notification_type,
          message,
          metadata
        ) VALUES (
          NEW.id,
          task_assignee_id,
          'task_completed',
          'Aufgabe "' || COALESCE(task_title, 'Unbekannte Aufgabe') || '" wurde als erledigt markiert.',
          jsonb_build_object(
            'completion_date', NOW(),
            'task_title', task_title
          )
        );
        
        -- Activity für Fertigstellung
        INSERT INTO public.employee_task_activities (
          employee_id,
          task_id,
          activity_type,
          completion_date,
          metadata
        ) VALUES (
          task_assignee_id,
          NEW.id,
          'completed',
          NOW(),
          jsonb_build_object(
            'task_title', task_title,
            'completed_by', auth.uid()
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für Task-Status-Änderungen erstellen
DROP TRIGGER IF EXISTS task_status_change_trigger ON public.tasks;
CREATE TRIGGER task_status_change_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_task_status_change();

-- Sicherstellen, dass die tasks Tabelle die notwendigen Felder hat
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assigned_to UUID;
