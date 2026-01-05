-- ============================================
-- PHASE 2: EFFECT TYPES & ACTION REGISTRY POPULATION
-- ============================================

-- EFFECT TYPES (alle verfügbaren Effekt-Typen)
INSERT INTO effect_types (effect_type, category, description, description_de, handler_function, supports_rollback) VALUES
-- UI Effects
('ui.badge_update', 'ui', 'Update badge counts in navigation', 'Badge-Zähler in Navigation aktualisieren', 'handle-ui-effects', false),
('ui.list_refresh', 'ui', 'Trigger list/table refresh', 'Listen-/Tabellenaktualisierung auslösen', 'handle-ui-effects', false),
('ui.live_update', 'ui', 'Push real-time update to UI', 'Echtzeit-Update an UI senden', 'handle-ui-effects', false),
('ui.toast_show', 'ui', 'Show toast notification', 'Toast-Benachrichtigung anzeigen', 'handle-ui-effects', false),

-- Notification Effects
('notification.in_app', 'notification', 'Create in-app notification', 'In-App Benachrichtigung erstellen', 'handle-notifications', false),
('notification.email', 'notification', 'Send email notification', 'E-Mail Benachrichtigung senden', 'handle-notifications', false),
('notification.push', 'notification', 'Send push notification', 'Push-Benachrichtigung senden', 'handle-notifications', false),
('notification.sms', 'notification', 'Send SMS notification', 'SMS-Benachrichtigung senden', 'handle-notifications', false),

-- Task Effects
('task.create', 'task', 'Create automatic task/todo', 'Automatische Aufgabe/ToDo erstellen', 'handle-task-effects', true),
('task.assign', 'task', 'Assign task to user/team', 'Aufgabe an Benutzer/Team zuweisen', 'handle-task-effects', true),
('task.update', 'task', 'Update existing task', 'Bestehende Aufgabe aktualisieren', 'handle-task-effects', true),
('task.complete', 'task', 'Mark task as complete', 'Aufgabe als erledigt markieren', 'handle-task-effects', true),

-- Workflow Effects
('workflow.trigger', 'workflow', 'Start approval workflow', 'Genehmigungsworkflow starten', 'handle-workflow-effects', true),
('workflow.advance', 'workflow', 'Advance to next step', 'Zum nächsten Schritt vorrücken', 'handle-workflow-effects', true),
('workflow.escalate', 'workflow', 'Escalate to higher authority', 'An höhere Instanz eskalieren', 'handle-workflow-effects', false),
('workflow.complete', 'workflow', 'Complete workflow', 'Workflow abschließen', 'handle-workflow-effects', false),

-- Analytics Effects
('analytics.kpi_refresh', 'analytics', 'Refresh KPI calculations', 'KPI-Berechnungen aktualisieren', 'handle-analytics-effects', false),
('analytics.report_update', 'analytics', 'Update report data', 'Berichtsdaten aktualisieren', 'handle-analytics-effects', false),
('analytics.metric_increment', 'analytics', 'Increment metric counter', 'Metrik-Zähler erhöhen', 'handle-analytics-effects', false),

-- Compliance Effects
('compliance.audit_log', 'compliance', 'Create detailed audit entry', 'Detaillierten Audit-Eintrag erstellen', 'handle-compliance-effects', false),
('compliance.retention_tag', 'compliance', 'Apply retention policy tag', 'Aufbewahrungsrichtlinien-Tag anwenden', 'handle-compliance-effects', false),
('compliance.alert', 'compliance', 'Trigger compliance alert', 'Compliance-Warnung auslösen', 'handle-compliance-effects', false),

-- Integration Effects
('integration.calendar_sync', 'integration', 'Sync with calendar systems', 'Mit Kalendersystemen synchronisieren', 'handle-integration-effects', true),
('integration.payroll_update', 'integration', 'Update payroll system', 'Lohnabrechnungssystem aktualisieren', 'handle-integration-effects', true),
('integration.accounting_export', 'integration', 'Export to accounting system', 'An Buchhaltungssystem exportieren', 'handle-integration-effects', false),
('integration.webhook', 'integration', 'Call external webhook', 'Externen Webhook aufrufen', 'handle-integration-effects', false),

-- Access Effects
('access.permission_update', 'access', 'Update user permissions', 'Benutzerberechtigungen aktualisieren', 'handle-access-effects', true),
('access.role_change', 'access', 'Change user role', 'Benutzerrolle ändern', 'handle-access-effects', true),
('access.revoke', 'access', 'Revoke access', 'Zugriff entziehen', 'handle-access-effects', true),

-- AI Effects
('ai.suggestion', 'ai', 'Generate AI suggestion', 'KI-Vorschlag generieren', 'handle-ai-effects', false),
('ai.analysis', 'ai', 'Run AI analysis', 'KI-Analyse durchführen', 'handle-ai-effects', false),
('ai.prediction', 'ai', 'Generate prediction', 'Vorhersage generieren', 'handle-ai-effects', false),

-- Cache Effects
('cache.invalidate', 'cache', 'Invalidate cache entries', 'Cache-Einträge invalidieren', 'handle-cache-effects', false),
('cache.refresh', 'cache', 'Refresh cache data', 'Cache-Daten aktualisieren', 'handle-cache-effects', false)

ON CONFLICT (effect_type) DO NOTHING;

-- ============================================
-- ACTION REGISTRY: Alle Module mit ihren Aktionen
-- ============================================

-- DASHBOARD MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('dashboard.widget_added', 'dashboard', 'dashboard_widget', 'Widget added to dashboard', 'Widget zum Dashboard hinzugefügt', '{"widget_type": "string", "position": "object"}'),
('dashboard.widget_removed', 'dashboard', 'dashboard_widget', 'Widget removed from dashboard', 'Widget vom Dashboard entfernt', '{"widget_id": "uuid"}'),
('dashboard.widget_configured', 'dashboard', 'dashboard_widget', 'Widget configuration changed', 'Widget-Konfiguration geändert', '{"widget_id": "uuid", "config": "object"}'),
('dashboard.layout_changed', 'dashboard', 'dashboard', 'Dashboard layout changed', 'Dashboard-Layout geändert', '{"layout": "object"}')
ON CONFLICT (action_name) DO NOTHING;

-- HEUTE (TODAY) MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('today.priority_set', 'today', 'today_item', 'Priority set for today', 'Priorität für heute gesetzt', '{"item_type": "string", "item_id": "uuid", "priority": "integer"}'),
('today.note_added', 'today', 'today_note', 'Note added to today view', 'Notiz zur Heute-Ansicht hinzugefügt', '{"content": "string"}'),
('today.item_completed', 'today', 'today_item', 'Today item marked complete', 'Heute-Element als erledigt markiert', '{"item_id": "uuid"}')
ON CONFLICT (action_name) DO NOTHING;

-- BENACHRICHTIGUNGEN MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('notification.read', 'notifications', 'notification', 'Notification marked as read', 'Benachrichtigung als gelesen markiert', '{"notification_id": "uuid"}'),
('notification.read_all', 'notifications', 'notification', 'All notifications marked as read', 'Alle Benachrichtigungen als gelesen markiert', '{}'),
('notification.archived', 'notifications', 'notification', 'Notification archived', 'Benachrichtigung archiviert', '{"notification_id": "uuid"}'),
('notification.deleted', 'notifications', 'notification', 'Notification deleted', 'Benachrichtigung gelöscht', '{"notification_id": "uuid"}'),
('notification.settings_changed', 'notifications', 'notification_settings', 'Notification settings changed', 'Benachrichtigungseinstellungen geändert', '{"settings": "object"}')
ON CONFLICT (action_name) DO NOTHING;

-- MITARBEITER MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('employee.created', 'employees', 'employee', 'Employee created', 'Mitarbeiter erstellt', '{"first_name": "string", "last_name": "string", "email": "string", "department": "string"}'),
('employee.updated', 'employees', 'employee', 'Employee updated', 'Mitarbeiter aktualisiert', '{"changed_fields": "object"}'),
('employee.deleted', 'employees', 'employee', 'Employee deleted', 'Mitarbeiter gelöscht', '{}'),
('employee.archived', 'employees', 'employee', 'Employee archived', 'Mitarbeiter archiviert', '{"reason": "string"}'),
('employee.restored', 'employees', 'employee', 'Employee restored', 'Mitarbeiter wiederhergestellt', '{}'),
('employee.role_changed', 'employees', 'employee', 'Employee role changed', 'Mitarbeiterrolle geändert', '{"old_role": "string", "new_role": "string"}'),
('employee.department_changed', 'employees', 'employee', 'Employee department changed', 'Mitarbeiterabteilung geändert', '{"old_department": "string", "new_department": "string"}'),
('employee.manager_changed', 'employees', 'employee', 'Employee manager changed', 'Vorgesetzter geändert', '{"old_manager_id": "uuid", "new_manager_id": "uuid"}'),
('employee.contract_updated', 'employees', 'employee', 'Employee contract updated', 'Arbeitsvertrag aktualisiert', '{"contract_type": "string", "start_date": "date"}'),
('employee.document_uploaded', 'employees', 'employee_document', 'Employee document uploaded', 'Mitarbeiterdokument hochgeladen', '{"document_type": "string", "file_name": "string"}'),
('employee.invited', 'employees', 'employee', 'Employee invited to system', 'Mitarbeiter zum System eingeladen', '{"email": "string"}'),
('employee.activated', 'employees', 'employee', 'Employee account activated', 'Mitarbeiterkonto aktiviert', '{}'),
('employee.deactivated', 'employees', 'employee', 'Employee account deactivated', 'Mitarbeiterkonto deaktiviert', '{"reason": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- ABWESENHEIT MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('absence.requested', 'absence', 'absence_request', 'Absence requested', 'Abwesenheit beantragt', '{"type": "string", "start_date": "date", "end_date": "date", "reason": "string"}'),
('absence.approved', 'absence', 'absence_request', 'Absence approved', 'Abwesenheit genehmigt', '{"approved_by": "uuid"}'),
('absence.rejected', 'absence', 'absence_request', 'Absence rejected', 'Abwesenheit abgelehnt', '{"rejected_by": "uuid", "reason": "string"}'),
('absence.cancelled', 'absence', 'absence_request', 'Absence cancelled', 'Abwesenheit storniert', '{"cancelled_by": "uuid", "reason": "string"}'),
('absence.modified', 'absence', 'absence_request', 'Absence modified', 'Abwesenheit geändert', '{"changed_fields": "object"}'),
('absence.substitute_assigned', 'absence', 'absence_request', 'Substitute assigned', 'Vertretung zugewiesen', '{"substitute_id": "uuid"}'),
('absence.substitute_confirmed', 'absence', 'absence_request', 'Substitute confirmed', 'Vertretung bestätigt', '{}'),
('absence.document_uploaded', 'absence', 'absence_document', 'Absence document uploaded', 'Abwesenheitsdokument hochgeladen', '{"document_type": "string"}'),
('absence.quota_adjusted', 'absence', 'absence_quota', 'Absence quota adjusted', 'Abwesenheitskontingent angepasst', '{"quota_type": "string", "adjustment": "number"}')
ON CONFLICT (action_name) DO NOTHING;

-- KALENDER MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('calendar.event_created', 'calendar', 'calendar_event', 'Calendar event created', 'Kalenderereignis erstellt', '{"title": "string", "start": "datetime", "end": "datetime"}'),
('calendar.event_updated', 'calendar', 'calendar_event', 'Calendar event updated', 'Kalenderereignis aktualisiert', '{"changed_fields": "object"}'),
('calendar.event_deleted', 'calendar', 'calendar_event', 'Calendar event deleted', 'Kalenderereignis gelöscht', '{}'),
('calendar.invitation_sent', 'calendar', 'calendar_invitation', 'Calendar invitation sent', 'Kalendereinladung gesendet', '{"invitee_ids": "array"}'),
('calendar.invitation_accepted', 'calendar', 'calendar_invitation', 'Calendar invitation accepted', 'Kalendereinladung angenommen', '{}'),
('calendar.invitation_declined', 'calendar', 'calendar_invitation', 'Calendar invitation declined', 'Kalendereinladung abgelehnt', '{"reason": "string"}'),
('calendar.reminder_triggered', 'calendar', 'calendar_event', 'Calendar reminder triggered', 'Kalendererinnerung ausgelöst', '{}')
ON CONFLICT (action_name) DO NOTHING;

-- ZEITERFASSUNG MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('time.entry_started', 'time_tracking', 'time_entry', 'Time tracking started', 'Zeiterfassung gestartet', '{"project_id": "uuid", "task_id": "uuid"}'),
('time.entry_stopped', 'time_tracking', 'time_entry', 'Time tracking stopped', 'Zeiterfassung gestoppt', '{"duration_minutes": "integer"}'),
('time.entry_created', 'time_tracking', 'time_entry', 'Time entry created manually', 'Zeiteintrag manuell erstellt', '{"start": "datetime", "end": "datetime", "duration_minutes": "integer"}'),
('time.entry_updated', 'time_tracking', 'time_entry', 'Time entry updated', 'Zeiteintrag aktualisiert', '{"changed_fields": "object"}'),
('time.entry_deleted', 'time_tracking', 'time_entry', 'Time entry deleted', 'Zeiteintrag gelöscht', '{}'),
('time.entry_approved', 'time_tracking', 'time_entry', 'Time entry approved', 'Zeiteintrag genehmigt', '{"approved_by": "uuid"}'),
('time.entry_rejected', 'time_tracking', 'time_entry', 'Time entry rejected', 'Zeiteintrag abgelehnt', '{"rejected_by": "uuid", "reason": "string"}'),
('time.correction_requested', 'time_tracking', 'time_correction', 'Time correction requested', 'Zeitkorrektur beantragt', '{"original_entry_id": "uuid", "correction": "object"}'),
('time.report_generated', 'time_tracking', 'time_report', 'Time report generated', 'Zeitbericht erstellt', '{"period_start": "date", "period_end": "date"}'),
('time.export_requested', 'time_tracking', 'time_export', 'Time data export requested', 'Zeitdaten-Export angefordert', '{"format": "string", "period": "object"}')
ON CONFLICT (action_name) DO NOTHING;

-- CHAT MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('chat.message_sent', 'chat', 'chat_message', 'Chat message sent', 'Chat-Nachricht gesendet', '{"channel_id": "uuid", "content": "string"}'),
('chat.message_edited', 'chat', 'chat_message', 'Chat message edited', 'Chat-Nachricht bearbeitet', '{"original_content": "string"}'),
('chat.message_deleted', 'chat', 'chat_message', 'Chat message deleted', 'Chat-Nachricht gelöscht', '{}'),
('chat.channel_created', 'chat', 'chat_channel', 'Chat channel created', 'Chat-Kanal erstellt', '{"name": "string", "type": "string"}'),
('chat.channel_updated', 'chat', 'chat_channel', 'Chat channel updated', 'Chat-Kanal aktualisiert', '{"changed_fields": "object"}'),
('chat.channel_archived', 'chat', 'chat_channel', 'Chat channel archived', 'Chat-Kanal archiviert', '{}'),
('chat.member_added', 'chat', 'chat_member', 'Member added to channel', 'Mitglied zum Kanal hinzugefügt', '{"user_id": "uuid"}'),
('chat.member_removed', 'chat', 'chat_member', 'Member removed from channel', 'Mitglied aus Kanal entfernt', '{"user_id": "uuid"}'),
('chat.reaction_added', 'chat', 'chat_reaction', 'Reaction added to message', 'Reaktion zur Nachricht hinzugefügt', '{"emoji": "string"}'),
('chat.file_shared', 'chat', 'chat_file', 'File shared in chat', 'Datei im Chat geteilt', '{"file_name": "string", "file_type": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- AUFGABEN MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('task.created', 'tasks', 'task', 'Task created', 'Aufgabe erstellt', '{"title": "string", "description": "string", "due_date": "date", "priority": "string"}'),
('task.updated', 'tasks', 'task', 'Task updated', 'Aufgabe aktualisiert', '{"changed_fields": "object"}'),
('task.deleted', 'tasks', 'task', 'Task deleted', 'Aufgabe gelöscht', '{}'),
('task.assigned', 'tasks', 'task', 'Task assigned', 'Aufgabe zugewiesen', '{"assignee_id": "uuid", "previous_assignee_id": "uuid"}'),
('task.unassigned', 'tasks', 'task', 'Task unassigned', 'Aufgabenzuweisung entfernt', '{"previous_assignee_id": "uuid"}'),
('task.status_changed', 'tasks', 'task', 'Task status changed', 'Aufgabenstatus geändert', '{"old_status": "string", "new_status": "string"}'),
('task.completed', 'tasks', 'task', 'Task completed', 'Aufgabe abgeschlossen', '{}'),
('task.reopened', 'tasks', 'task', 'Task reopened', 'Aufgabe wiedereröffnet', '{}'),
('task.priority_changed', 'tasks', 'task', 'Task priority changed', 'Aufgabenpriorität geändert', '{"old_priority": "string", "new_priority": "string"}'),
('task.due_date_changed', 'tasks', 'task', 'Task due date changed', 'Fälligkeitsdatum geändert', '{"old_due_date": "date", "new_due_date": "date"}'),
('task.comment_added', 'tasks', 'task_comment', 'Comment added to task', 'Kommentar zur Aufgabe hinzugefügt', '{"content": "string"}'),
('task.attachment_added', 'tasks', 'task_attachment', 'Attachment added to task', 'Anhang zur Aufgabe hinzugefügt', '{"file_name": "string"}'),
('task.subtask_created', 'tasks', 'subtask', 'Subtask created', 'Unteraufgabe erstellt', '{"title": "string"}'),
('task.subtask_completed', 'tasks', 'subtask', 'Subtask completed', 'Unteraufgabe abgeschlossen', '{}'),
('task.moved_to_project', 'tasks', 'task', 'Task moved to project', 'Aufgabe in Projekt verschoben', '{"project_id": "uuid"}')
ON CONFLICT (action_name) DO NOTHING;

-- PROJEKTE MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('project.created', 'projects', 'project', 'Project created', 'Projekt erstellt', '{"name": "string", "description": "string"}'),
('project.updated', 'projects', 'project', 'Project updated', 'Projekt aktualisiert', '{"changed_fields": "object"}'),
('project.deleted', 'projects', 'project', 'Project deleted', 'Projekt gelöscht', '{}'),
('project.archived', 'projects', 'project', 'Project archived', 'Projekt archiviert', '{}'),
('project.restored', 'projects', 'project', 'Project restored', 'Projekt wiederhergestellt', '{}'),
('project.status_changed', 'projects', 'project', 'Project status changed', 'Projektstatus geändert', '{"old_status": "string", "new_status": "string"}'),
('project.member_added', 'projects', 'project_member', 'Member added to project', 'Mitglied zum Projekt hinzugefügt', '{"user_id": "uuid", "role": "string"}'),
('project.member_removed', 'projects', 'project_member', 'Member removed from project', 'Mitglied aus Projekt entfernt', '{"user_id": "uuid"}'),
('project.member_role_changed', 'projects', 'project_member', 'Project member role changed', 'Projektmitglied-Rolle geändert', '{"user_id": "uuid", "old_role": "string", "new_role": "string"}'),
('project.milestone_created', 'projects', 'project_milestone', 'Milestone created', 'Meilenstein erstellt', '{"name": "string", "due_date": "date"}'),
('project.milestone_completed', 'projects', 'project_milestone', 'Milestone completed', 'Meilenstein abgeschlossen', '{}'),
('project.budget_updated', 'projects', 'project', 'Project budget updated', 'Projektbudget aktualisiert', '{"old_budget": "number", "new_budget": "number"}')
ON CONFLICT (action_name) DO NOTHING;

-- ROADMAPS MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('roadmap.created', 'roadmaps', 'roadmap', 'Roadmap created', 'Roadmap erstellt', '{"name": "string"}'),
('roadmap.updated', 'roadmaps', 'roadmap', 'Roadmap updated', 'Roadmap aktualisiert', '{"changed_fields": "object"}'),
('roadmap.deleted', 'roadmaps', 'roadmap', 'Roadmap deleted', 'Roadmap gelöscht', '{}'),
('roadmap.milestone_created', 'roadmaps', 'roadmap_milestone', 'Roadmap milestone created', 'Roadmap-Meilenstein erstellt', '{"name": "string", "date": "date"}'),
('roadmap.milestone_updated', 'roadmaps', 'roadmap_milestone', 'Roadmap milestone updated', 'Roadmap-Meilenstein aktualisiert', '{"changed_fields": "object"}'),
('roadmap.milestone_completed', 'roadmaps', 'roadmap_milestone', 'Roadmap milestone completed', 'Roadmap-Meilenstein abgeschlossen', '{}'),
('roadmap.progress_updated', 'roadmaps', 'roadmap', 'Roadmap progress updated', 'Roadmap-Fortschritt aktualisiert', '{"progress_percent": "integer"}'),
('roadmap.published', 'roadmaps', 'roadmap', 'Roadmap published', 'Roadmap veröffentlicht', '{}')
ON CONFLICT (action_name) DO NOTHING;

-- BUDGET & FORECAST MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('budget.created', 'budget', 'budget', 'Budget created', 'Budget erstellt', '{"name": "string", "amount": "number", "period": "string"}'),
('budget.updated', 'budget', 'budget', 'Budget updated', 'Budget aktualisiert', '{"changed_fields": "object"}'),
('budget.deleted', 'budget', 'budget', 'Budget deleted', 'Budget gelöscht', '{}'),
('budget.approved', 'budget', 'budget', 'Budget approved', 'Budget genehmigt', '{"approved_by": "uuid"}'),
('budget.rejected', 'budget', 'budget', 'Budget rejected', 'Budget abgelehnt', '{"rejected_by": "uuid", "reason": "string"}'),
('budget.threshold_exceeded', 'budget', 'budget', 'Budget threshold exceeded', 'Budgetschwelle überschritten', '{"threshold_percent": "integer", "current_percent": "integer"}'),
('budget.alert_triggered', 'budget', 'budget_alert', 'Budget alert triggered', 'Budget-Warnung ausgelöst', '{"alert_type": "string", "message": "string"}'),
('budget.forecast_created', 'budget', 'budget_forecast', 'Forecast created', 'Prognose erstellt', '{"period": "string", "amount": "number"}'),
('budget.forecast_updated', 'budget', 'budget_forecast', 'Forecast updated', 'Prognose aktualisiert', '{"changed_fields": "object"}'),
('budget.expense_added', 'budget', 'budget_expense', 'Expense added to budget', 'Ausgabe zum Budget hinzugefügt', '{"amount": "number", "category": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- WORKFORCE PLANNING MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('workforce.scenario_created', 'workforce', 'workforce_scenario', 'Workforce scenario created', 'Personalplanungsszenario erstellt', '{"name": "string"}'),
('workforce.scenario_updated', 'workforce', 'workforce_scenario', 'Workforce scenario updated', 'Personalplanungsszenario aktualisiert', '{"changed_fields": "object"}'),
('workforce.scenario_deleted', 'workforce', 'workforce_scenario', 'Workforce scenario deleted', 'Personalplanungsszenario gelöscht', '{}'),
('workforce.headcount_changed', 'workforce', 'workforce_plan', 'Headcount changed', 'Personalbestand geändert', '{"department": "string", "old_count": "integer", "new_count": "integer"}'),
('workforce.position_created', 'workforce', 'workforce_position', 'Position created', 'Stelle erstellt', '{"title": "string", "department": "string"}'),
('workforce.position_filled', 'workforce', 'workforce_position', 'Position filled', 'Stelle besetzt', '{"employee_id": "uuid"}'),
('workforce.gap_identified', 'workforce', 'workforce_gap', 'Workforce gap identified', 'Personallücke identifiziert', '{"skill": "string", "gap_count": "integer"}')
ON CONFLICT (action_name) DO NOTHING;

-- ORGANISATIONSDESIGN MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('org.chart_updated', 'organization', 'org_chart', 'Organization chart updated', 'Organigramm aktualisiert', '{}'),
('org.department_created', 'organization', 'department', 'Department created', 'Abteilung erstellt', '{"name": "string", "parent_id": "uuid"}'),
('org.department_updated', 'organization', 'department', 'Department updated', 'Abteilung aktualisiert', '{"changed_fields": "object"}'),
('org.department_deleted', 'organization', 'department', 'Department deleted', 'Abteilung gelöscht', '{}'),
('org.team_created', 'organization', 'team', 'Team created', 'Team erstellt', '{"name": "string", "department_id": "uuid"}'),
('org.team_updated', 'organization', 'team', 'Team updated', 'Team aktualisiert', '{"changed_fields": "object"}'),
('org.team_deleted', 'organization', 'team', 'Team deleted', 'Team gelöscht', '{}'),
('org.position_created', 'organization', 'position', 'Position created', 'Position erstellt', '{"title": "string"}'),
('org.position_updated', 'organization', 'position', 'Position updated', 'Position aktualisiert', '{"changed_fields": "object"}'),
('org.reporting_line_changed', 'organization', 'reporting_line', 'Reporting line changed', 'Berichtslinie geändert', '{"employee_id": "uuid", "new_manager_id": "uuid"}')
ON CONFLICT (action_name) DO NOTHING;

-- MITARBEITERUMFRAGEN MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('survey.created', 'surveys', 'survey', 'Survey created', 'Umfrage erstellt', '{"title": "string", "type": "string"}'),
('survey.updated', 'surveys', 'survey', 'Survey updated', 'Umfrage aktualisiert', '{"changed_fields": "object"}'),
('survey.deleted', 'surveys', 'survey', 'Survey deleted', 'Umfrage gelöscht', '{}'),
('survey.published', 'surveys', 'survey', 'Survey published', 'Umfrage veröffentlicht', '{"target_audience": "object"}'),
('survey.closed', 'surveys', 'survey', 'Survey closed', 'Umfrage geschlossen', '{}'),
('survey.response_submitted', 'surveys', 'survey_response', 'Survey response submitted', 'Umfrageantwort eingereicht', '{}'),
('survey.reminder_sent', 'surveys', 'survey', 'Survey reminder sent', 'Umfrageerinnerung gesendet', '{"recipient_count": "integer"}'),
('survey.results_published', 'surveys', 'survey', 'Survey results published', 'Umfrageergebnisse veröffentlicht', '{}')
ON CONFLICT (action_name) DO NOTHING;

-- LOHN & GEHALT MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('payroll.run_started', 'payroll', 'payroll_run', 'Payroll run started', 'Lohnlauf gestartet', '{"period": "string"}'),
('payroll.run_completed', 'payroll', 'payroll_run', 'Payroll run completed', 'Lohnlauf abgeschlossen', '{"total_amount": "number", "employee_count": "integer"}'),
('payroll.run_failed', 'payroll', 'payroll_run', 'Payroll run failed', 'Lohnlauf fehlgeschlagen', '{"error": "string"}'),
('payroll.adjustment_made', 'payroll', 'payroll_adjustment', 'Payroll adjustment made', 'Lohnanpassung vorgenommen', '{"employee_id": "uuid", "amount": "number", "reason": "string"}'),
('payroll.bonus_added', 'payroll', 'payroll_bonus', 'Bonus added', 'Bonus hinzugefügt', '{"employee_id": "uuid", "amount": "number", "type": "string"}'),
('payroll.deduction_added', 'payroll', 'payroll_deduction', 'Deduction added', 'Abzug hinzugefügt', '{"employee_id": "uuid", "amount": "number", "type": "string"}'),
('payroll.payslip_generated', 'payroll', 'payslip', 'Payslip generated', 'Gehaltsabrechnung erstellt', '{"employee_id": "uuid", "period": "string"}'),
('payroll.payslip_sent', 'payroll', 'payslip', 'Payslip sent to employee', 'Gehaltsabrechnung an Mitarbeiter gesendet', '{"employee_id": "uuid"}'),
('payroll.tax_document_generated', 'payroll', 'tax_document', 'Tax document generated', 'Steuerdokument erstellt', '{"document_type": "string", "year": "integer"}'),
('payroll.export_completed', 'payroll', 'payroll_export', 'Payroll export completed', 'Lohnexport abgeschlossen', '{"format": "string", "destination": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- RECRUITING MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('recruiting.job_created', 'recruiting', 'job_posting', 'Job posting created', 'Stellenausschreibung erstellt', '{"title": "string", "department": "string"}'),
('recruiting.job_published', 'recruiting', 'job_posting', 'Job posting published', 'Stellenausschreibung veröffentlicht', '{"channels": "array"}'),
('recruiting.job_closed', 'recruiting', 'job_posting', 'Job posting closed', 'Stellenausschreibung geschlossen', '{"reason": "string"}'),
('recruiting.candidate_applied', 'recruiting', 'candidate', 'Candidate applied', 'Kandidat hat sich beworben', '{"job_id": "uuid", "source": "string"}'),
('recruiting.candidate_updated', 'recruiting', 'candidate', 'Candidate updated', 'Kandidat aktualisiert', '{"changed_fields": "object"}'),
('recruiting.candidate_stage_changed', 'recruiting', 'candidate', 'Candidate stage changed', 'Kandidatenstatus geändert', '{"old_stage": "string", "new_stage": "string"}'),
('recruiting.interview_scheduled', 'recruiting', 'interview', 'Interview scheduled', 'Vorstellungsgespräch geplant', '{"candidate_id": "uuid", "datetime": "datetime", "interviewers": "array"}'),
('recruiting.interview_completed', 'recruiting', 'interview', 'Interview completed', 'Vorstellungsgespräch abgeschlossen', '{"candidate_id": "uuid", "rating": "integer"}'),
('recruiting.offer_created', 'recruiting', 'job_offer', 'Job offer created', 'Jobangebot erstellt', '{"candidate_id": "uuid", "salary": "number"}'),
('recruiting.offer_sent', 'recruiting', 'job_offer', 'Job offer sent', 'Jobangebot gesendet', '{"candidate_id": "uuid"}'),
('recruiting.offer_accepted', 'recruiting', 'job_offer', 'Job offer accepted', 'Jobangebot angenommen', '{"candidate_id": "uuid"}'),
('recruiting.offer_declined', 'recruiting', 'job_offer', 'Job offer declined', 'Jobangebot abgelehnt', '{"candidate_id": "uuid", "reason": "string"}'),
('recruiting.candidate_hired', 'recruiting', 'candidate', 'Candidate hired', 'Kandidat eingestellt', '{"start_date": "date"}'),
('recruiting.candidate_rejected', 'recruiting', 'candidate', 'Candidate rejected', 'Kandidat abgelehnt', '{"reason": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- ONBOARDING MODULE  
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('onboarding.started', 'onboarding', 'onboarding_process', 'Onboarding started', 'Onboarding gestartet', '{"employee_id": "uuid", "template_id": "uuid"}'),
('onboarding.task_created', 'onboarding', 'onboarding_task', 'Onboarding task created', 'Onboarding-Aufgabe erstellt', '{"title": "string", "assignee_id": "uuid"}'),
('onboarding.task_completed', 'onboarding', 'onboarding_task', 'Onboarding task completed', 'Onboarding-Aufgabe abgeschlossen', '{}'),
('onboarding.task_overdue', 'onboarding', 'onboarding_task', 'Onboarding task overdue', 'Onboarding-Aufgabe überfällig', '{"days_overdue": "integer"}'),
('onboarding.checklist_completed', 'onboarding', 'onboarding_checklist', 'Onboarding checklist completed', 'Onboarding-Checkliste abgeschlossen', '{}'),
('onboarding.document_signed', 'onboarding', 'onboarding_document', 'Onboarding document signed', 'Onboarding-Dokument unterzeichnet', '{"document_type": "string"}'),
('onboarding.buddy_assigned', 'onboarding', 'onboarding_process', 'Onboarding buddy assigned', 'Onboarding-Buddy zugewiesen', '{"buddy_id": "uuid"}'),
('onboarding.feedback_submitted', 'onboarding', 'onboarding_feedback', 'Onboarding feedback submitted', 'Onboarding-Feedback eingereicht', '{"rating": "integer"}'),
('onboarding.completed', 'onboarding', 'onboarding_process', 'Onboarding completed', 'Onboarding abgeschlossen', '{"duration_days": "integer"}')
ON CONFLICT (action_name) DO NOTHING;

-- OFFBOARDING MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('offboarding.started', 'offboarding', 'offboarding_process', 'Offboarding started', 'Offboarding gestartet', '{"employee_id": "uuid", "last_day": "date", "reason": "string"}'),
('offboarding.task_created', 'offboarding', 'offboarding_task', 'Offboarding task created', 'Offboarding-Aufgabe erstellt', '{"title": "string", "assignee_id": "uuid"}'),
('offboarding.task_completed', 'offboarding', 'offboarding_task', 'Offboarding task completed', 'Offboarding-Aufgabe abgeschlossen', '{}'),
('offboarding.access_revoked', 'offboarding', 'offboarding_process', 'Access revoked', 'Zugriff entzogen', '{"systems": "array"}'),
('offboarding.equipment_returned', 'offboarding', 'offboarding_equipment', 'Equipment returned', 'Ausrüstung zurückgegeben', '{"items": "array"}'),
('offboarding.exit_interview_scheduled', 'offboarding', 'exit_interview', 'Exit interview scheduled', 'Austrittsgespräch geplant', '{"datetime": "datetime"}'),
('offboarding.exit_interview_completed', 'offboarding', 'exit_interview', 'Exit interview completed', 'Austrittsgespräch abgeschlossen', '{}'),
('offboarding.final_payroll_processed', 'offboarding', 'offboarding_process', 'Final payroll processed', 'Letzte Gehaltsabrechnung verarbeitet', '{}'),
('offboarding.completed', 'offboarding', 'offboarding_process', 'Offboarding completed', 'Offboarding abgeschlossen', '{}')
ON CONFLICT (action_name) DO NOTHING;