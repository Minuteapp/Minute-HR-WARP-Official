-- Korrigiere den Trigger check_task_duplicate(), der auf eine nicht existierende Spalte 'deleted_at' verweist
-- Die Tabelle 'tasks' verwendet 'status' = 'deleted' anstatt einer 'deleted_at' Spalte

CREATE OR REPLACE FUNCTION check_task_duplicate()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tasks
    WHERE project_id = NEW.project_id
      AND company_id = NEW.company_id
      AND LOWER(TRIM(title)) = LOWER(TRIM(NEW.title))
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status != 'deleted'
  ) THEN
    RAISE EXCEPTION 'Eine Aufgabe mit diesem Titel existiert bereits in diesem Projekt.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;