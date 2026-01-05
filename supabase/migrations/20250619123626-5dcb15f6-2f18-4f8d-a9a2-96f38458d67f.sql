
-- Trigger für automatische updated_at Spalten-Updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für user_roles Tabelle (updated_at)
DROP TRIGGER IF EXISTS handle_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER handle_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger für projects Tabelle (updated_at)
DROP TRIGGER IF EXISTS handle_projects_updated_at ON public.projects;
CREATE TRIGGER handle_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger für tasks Tabelle (updated_at)
DROP TRIGGER IF EXISTS handle_tasks_updated_at ON public.tasks;
CREATE TRIGGER handle_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger für employees Tabelle (updated_at)
DROP TRIGGER IF EXISTS handle_employees_updated_at ON public.employees;
CREATE TRIGGER handle_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger für documents Tabelle (updated_at)
DROP TRIGGER IF EXISTS handle_documents_updated_at ON public.documents;
CREATE TRIGGER handle_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger für time_entries Tabelle (updated_at)
DROP TRIGGER IF EXISTS handle_time_entries_updated_at ON public.time_entries;
CREATE TRIGGER handle_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger für goals Tabelle (updated_at)
DROP TRIGGER IF EXISTS handle_goals_updated_at ON public.goals;
CREATE TRIGGER handle_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger für das Erstellen von Standard-Benutzerrollen bei neuen Benutzern
DROP TRIGGER IF EXISTS on_auth_user_created_set_role ON auth.users;
CREATE TRIGGER on_auth_user_created_set_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Trigger für die Synchronisation von Abwesenheitsdaten
DROP TRIGGER IF EXISTS trigger_sync_approved_absence ON public.absence_requests;
CREATE TRIGGER trigger_sync_approved_absence
  AFTER UPDATE ON public.absence_requests
  FOR EACH ROW EXECUTE FUNCTION public.sync_approved_absence_to_absences();

-- Trigger für Benachrichtigungen bei Abwesenheitsstatus-Änderungen
DROP TRIGGER IF EXISTS trigger_absence_status_notification ON public.absence_requests;
CREATE TRIGGER trigger_absence_status_notification
  AFTER UPDATE ON public.absence_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_absence_status_change();

-- Trigger für automatische Abwesenheitsbenachrichtigungen
DROP TRIGGER IF EXISTS trigger_automatic_absence_notifications ON public.absence_requests;
CREATE TRIGGER trigger_automatic_absence_notifications
  AFTER UPDATE ON public.absence_requests
  FOR EACH ROW EXECUTE FUNCTION public.send_automatic_absence_notifications();

-- Trigger für Cross-Module-Events Synchronisation
DROP TRIGGER IF EXISTS trigger_sync_absence_events ON public.absence_requests;
CREATE TRIGGER trigger_sync_absence_events
  AFTER INSERT OR UPDATE ON public.absence_requests
  FOR EACH ROW EXECUTE FUNCTION public.sync_cross_module_events();

DROP TRIGGER IF EXISTS trigger_sync_sick_leave_events ON public.sick_leaves;
CREATE TRIGGER trigger_sync_sick_leave_events
  AFTER INSERT OR UPDATE ON public.sick_leaves
  FOR EACH ROW EXECUTE FUNCTION public.sync_cross_module_events();

-- Trigger für die Aktualisierung von Mitarbeiterdaten in Abwesenheitsanträgen
DROP TRIGGER IF EXISTS trigger_update_absence_employee_data ON public.absence_requests;
CREATE TRIGGER trigger_update_absence_employee_data
  BEFORE INSERT OR UPDATE ON public.absence_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_absence_employee_data();

-- Trigger für die Aktualisierung von Mitarbeiterdaten in Krankmeldungen
DROP TRIGGER IF EXISTS trigger_update_sick_leave_employee_data ON public.sick_leaves;
CREATE TRIGGER trigger_update_sick_leave_employee_data
  BEFORE INSERT OR UPDATE ON public.sick_leaves
  FOR EACH ROW EXECUTE FUNCTION public.update_sick_leave_employee_data();

-- Trigger für die Aktualisierung der Mitarbeiteranzahl in Unternehmen
DROP TRIGGER IF EXISTS trigger_company_employee_count ON public.employees;
CREATE TRIGGER trigger_company_employee_count
  AFTER INSERT OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_company_employee_count();

-- Trigger für Dokumenten-Audit-Trail
DROP TRIGGER IF EXISTS trigger_document_audit ON public.documents;
CREATE TRIGGER trigger_document_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.log_document_changes();

-- Trigger für automatische Dokumentennummer-Generierung
DROP TRIGGER IF EXISTS trigger_generate_document_number ON public.documents;
CREATE TRIGGER trigger_generate_document_number
  BEFORE INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.generate_document_number();

-- Trigger für Dokumentenvalidierung
DROP TRIGGER IF EXISTS trigger_validate_document_type ON public.documents;
CREATE TRIGGER trigger_validate_document_type
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.validate_document_type();

-- Trigger für Duplikatsprüfung bei Dokumenten
DROP TRIGGER IF EXISTS trigger_check_document_duplicate ON public.documents;
CREATE TRIGGER trigger_check_document_duplicate
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.check_document_duplicate();

-- Trigger für Budget-Schwellwerte
DROP TRIGGER IF EXISTS trigger_budget_thresholds ON public.budget_actuals;
CREATE TRIGGER trigger_budget_thresholds
  AFTER INSERT OR UPDATE ON public.budget_actuals
  FOR EACH ROW EXECUTE FUNCTION public.check_budget_thresholds();

-- Trigger für Budget-Versionen
DROP TRIGGER IF EXISTS trigger_budget_version ON public.budget_plans;
CREATE TRIGGER trigger_budget_version
  AFTER UPDATE ON public.budget_plans
  FOR EACH ROW EXECUTE FUNCTION public.create_budget_version();
