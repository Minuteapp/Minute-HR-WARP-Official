-- ============================================
-- PHASE 2 (Fortsetzung): Weitere Module Actions
-- ============================================

-- PERFORMANCE MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('performance.review_created', 'performance', 'performance_review', 'Performance review created', 'Leistungsbeurteilung erstellt', '{"employee_id": "uuid", "period": "string", "type": "string"}'),
('performance.review_started', 'performance', 'performance_review', 'Performance review started', 'Leistungsbeurteilung gestartet', '{}'),
('performance.review_submitted', 'performance', 'performance_review', 'Performance review submitted', 'Leistungsbeurteilung eingereicht', '{}'),
('performance.review_approved', 'performance', 'performance_review', 'Performance review approved', 'Leistungsbeurteilung genehmigt', '{"approved_by": "uuid"}'),
('performance.review_completed', 'performance', 'performance_review', 'Performance review completed', 'Leistungsbeurteilung abgeschlossen', '{"final_rating": "string"}'),
('performance.feedback_given', 'performance', 'performance_feedback', 'Feedback given', 'Feedback gegeben', '{"from_user_id": "uuid", "to_user_id": "uuid", "type": "string"}'),
('performance.feedback_requested', 'performance', 'performance_feedback', 'Feedback requested', 'Feedback angefordert', '{"from_user_id": "uuid", "to_user_id": "uuid"}'),
('performance.goal_created', 'performance', 'performance_goal', 'Performance goal created', 'Leistungsziel erstellt', '{"title": "string", "target_date": "date"}'),
('performance.goal_updated', 'performance', 'performance_goal', 'Performance goal updated', 'Leistungsziel aktualisiert', '{"changed_fields": "object"}'),
('performance.goal_achieved', 'performance', 'performance_goal', 'Performance goal achieved', 'Leistungsziel erreicht', '{}'),
('performance.pip_started', 'performance', 'pip', 'Performance improvement plan started', 'Leistungsverbesserungsplan gestartet', '{"employee_id": "uuid", "duration_days": "integer"}'),
('performance.pip_completed', 'performance', 'pip', 'Performance improvement plan completed', 'Leistungsverbesserungsplan abgeschlossen', '{"outcome": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- WISSENSDATENBANK MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('knowledge.article_created', 'knowledge', 'knowledge_article', 'Knowledge article created', 'Wissensartikel erstellt', '{"title": "string", "category": "string"}'),
('knowledge.article_updated', 'knowledge', 'knowledge_article', 'Knowledge article updated', 'Wissensartikel aktualisiert', '{"changed_fields": "object"}'),
('knowledge.article_deleted', 'knowledge', 'knowledge_article', 'Knowledge article deleted', 'Wissensartikel gelöscht', '{}'),
('knowledge.article_published', 'knowledge', 'knowledge_article', 'Knowledge article published', 'Wissensartikel veröffentlicht', '{}'),
('knowledge.article_archived', 'knowledge', 'knowledge_article', 'Knowledge article archived', 'Wissensartikel archiviert', '{}'),
('knowledge.article_viewed', 'knowledge', 'knowledge_article', 'Knowledge article viewed', 'Wissensartikel angesehen', '{}'),
('knowledge.article_rated', 'knowledge', 'knowledge_rating', 'Knowledge article rated', 'Wissensartikel bewertet', '{"rating": "integer"}'),
('knowledge.comment_added', 'knowledge', 'knowledge_comment', 'Comment added to article', 'Kommentar zum Artikel hinzugefügt', '{"content": "string"}'),
('knowledge.category_created', 'knowledge', 'knowledge_category', 'Knowledge category created', 'Wissenskategorie erstellt', '{"name": "string"}'),
('knowledge.search_performed', 'knowledge', 'knowledge_search', 'Knowledge search performed', 'Wissenssuche durchgeführt', '{"query": "string", "results_count": "integer"}')
ON CONFLICT (action_name) DO NOTHING;

-- DOKUMENTE MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('document.uploaded', 'documents', 'document', 'Document uploaded', 'Dokument hochgeladen', '{"file_name": "string", "file_type": "string", "size_bytes": "integer"}'),
('document.updated', 'documents', 'document', 'Document updated', 'Dokument aktualisiert', '{"changed_fields": "object"}'),
('document.deleted', 'documents', 'document', 'Document deleted', 'Dokument gelöscht', '{}'),
('document.downloaded', 'documents', 'document', 'Document downloaded', 'Dokument heruntergeladen', '{}'),
('document.shared', 'documents', 'document_share', 'Document shared', 'Dokument geteilt', '{"shared_with": "array"}'),
('document.unshared', 'documents', 'document_share', 'Document unshared', 'Dokumentfreigabe aufgehoben', '{"user_id": "uuid"}'),
('document.signed', 'documents', 'document_signature', 'Document signed', 'Dokument unterzeichnet', '{"signer_id": "uuid"}'),
('document.signature_requested', 'documents', 'document_signature', 'Signature requested', 'Unterschrift angefordert', '{"signers": "array"}'),
('document.approved', 'documents', 'document', 'Document approved', 'Dokument genehmigt', '{"approved_by": "uuid"}'),
('document.rejected', 'documents', 'document', 'Document rejected', 'Dokument abgelehnt', '{"rejected_by": "uuid", "reason": "string"}'),
('document.version_created', 'documents', 'document_version', 'Document version created', 'Dokumentversion erstellt', '{"version_number": "integer"}'),
('document.folder_created', 'documents', 'document_folder', 'Folder created', 'Ordner erstellt', '{"name": "string"}'),
('document.moved', 'documents', 'document', 'Document moved', 'Dokument verschoben', '{"from_folder": "uuid", "to_folder": "uuid"}')
ON CONFLICT (action_name) DO NOTHING;

-- BERICHTE MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('report.created', 'reports', 'report', 'Report created', 'Bericht erstellt', '{"name": "string", "type": "string"}'),
('report.updated', 'reports', 'report', 'Report updated', 'Bericht aktualisiert', '{"changed_fields": "object"}'),
('report.deleted', 'reports', 'report', 'Report deleted', 'Bericht gelöscht', '{}'),
('report.generated', 'reports', 'report_run', 'Report generated', 'Bericht generiert', '{"format": "string", "row_count": "integer"}'),
('report.scheduled', 'reports', 'report_schedule', 'Report scheduled', 'Bericht geplant', '{"schedule": "string", "recipients": "array"}'),
('report.schedule_updated', 'reports', 'report_schedule', 'Report schedule updated', 'Berichtsplan aktualisiert', '{"changed_fields": "object"}'),
('report.exported', 'reports', 'report_export', 'Report exported', 'Bericht exportiert', '{"format": "string", "destination": "string"}'),
('report.shared', 'reports', 'report_share', 'Report shared', 'Bericht geteilt', '{"shared_with": "array"}'),
('report.favorited', 'reports', 'report', 'Report favorited', 'Bericht als Favorit markiert', '{}'),
('report.unfavorited', 'reports', 'report', 'Report unfavorited', 'Bericht-Favorit entfernt', '{}')
ON CONFLICT (action_name) DO NOTHING;

-- AUSGABEN MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('expense.created', 'expenses', 'expense', 'Expense created', 'Ausgabe erstellt', '{"amount": "number", "currency": "string", "category": "string"}'),
('expense.updated', 'expenses', 'expense', 'Expense updated', 'Ausgabe aktualisiert', '{"changed_fields": "object"}'),
('expense.deleted', 'expenses', 'expense', 'Expense deleted', 'Ausgabe gelöscht', '{}'),
('expense.submitted', 'expenses', 'expense', 'Expense submitted for approval', 'Ausgabe zur Genehmigung eingereicht', '{}'),
('expense.approved', 'expenses', 'expense', 'Expense approved', 'Ausgabe genehmigt', '{"approved_by": "uuid"}'),
('expense.rejected', 'expenses', 'expense', 'Expense rejected', 'Ausgabe abgelehnt', '{"rejected_by": "uuid", "reason": "string"}'),
('expense.paid', 'expenses', 'expense', 'Expense paid/reimbursed', 'Ausgabe erstattet', '{"payment_date": "date", "payment_method": "string"}'),
('expense.receipt_uploaded', 'expenses', 'expense_receipt', 'Receipt uploaded', 'Beleg hochgeladen', '{"file_name": "string"}'),
('expense.report_created', 'expenses', 'expense_report', 'Expense report created', 'Spesenbericht erstellt', '{"total_amount": "number", "expense_count": "integer"}'),
('expense.report_submitted', 'expenses', 'expense_report', 'Expense report submitted', 'Spesenbericht eingereicht', '{}'),
('expense.policy_violation', 'expenses', 'expense', 'Expense policy violation detected', 'Ausgabenrichtlinienverstoß erkannt', '{"violation_type": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- GLOBAL MOBILITY MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('mobility.assignment_created', 'mobility', 'mobility_assignment', 'International assignment created', 'Internationale Entsendung erstellt', '{"employee_id": "uuid", "destination_country": "string", "duration_months": "integer"}'),
('mobility.assignment_updated', 'mobility', 'mobility_assignment', 'International assignment updated', 'Internationale Entsendung aktualisiert', '{"changed_fields": "object"}'),
('mobility.assignment_started', 'mobility', 'mobility_assignment', 'International assignment started', 'Internationale Entsendung gestartet', '{}'),
('mobility.assignment_ended', 'mobility', 'mobility_assignment', 'International assignment ended', 'Internationale Entsendung beendet', '{}'),
('mobility.visa_applied', 'mobility', 'visa_application', 'Visa application submitted', 'Visumsantrag eingereicht', '{"visa_type": "string", "country": "string"}'),
('mobility.visa_approved', 'mobility', 'visa_application', 'Visa approved', 'Visum genehmigt', '{"valid_until": "date"}'),
('mobility.visa_expiring', 'mobility', 'visa_application', 'Visa expiring soon', 'Visum läuft bald ab', '{"days_until_expiry": "integer"}'),
('mobility.work_permit_applied', 'mobility', 'work_permit', 'Work permit application submitted', 'Arbeitserlaubnisantrag eingereicht', '{}'),
('mobility.relocation_started', 'mobility', 'relocation', 'Relocation process started', 'Umzugsprozess gestartet', '{}'),
('mobility.tax_equalization_calculated', 'mobility', 'tax_equalization', 'Tax equalization calculated', 'Steuerausgleich berechnet', '{"amount": "number"}')
ON CONFLICT (action_name) DO NOTHING;

-- HR HELPDESK MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('helpdesk.ticket_created', 'helpdesk', 'helpdesk_ticket', 'Helpdesk ticket created', 'Helpdesk-Ticket erstellt', '{"subject": "string", "category": "string", "priority": "string"}'),
('helpdesk.ticket_updated', 'helpdesk', 'helpdesk_ticket', 'Helpdesk ticket updated', 'Helpdesk-Ticket aktualisiert', '{"changed_fields": "object"}'),
('helpdesk.ticket_assigned', 'helpdesk', 'helpdesk_ticket', 'Helpdesk ticket assigned', 'Helpdesk-Ticket zugewiesen', '{"assignee_id": "uuid"}'),
('helpdesk.ticket_escalated', 'helpdesk', 'helpdesk_ticket', 'Helpdesk ticket escalated', 'Helpdesk-Ticket eskaliert', '{"escalated_to": "uuid", "reason": "string"}'),
('helpdesk.ticket_resolved', 'helpdesk', 'helpdesk_ticket', 'Helpdesk ticket resolved', 'Helpdesk-Ticket gelöst', '{"resolution": "string"}'),
('helpdesk.ticket_closed', 'helpdesk', 'helpdesk_ticket', 'Helpdesk ticket closed', 'Helpdesk-Ticket geschlossen', '{}'),
('helpdesk.ticket_reopened', 'helpdesk', 'helpdesk_ticket', 'Helpdesk ticket reopened', 'Helpdesk-Ticket wiedereröffnet', '{"reason": "string"}'),
('helpdesk.comment_added', 'helpdesk', 'helpdesk_comment', 'Comment added to ticket', 'Kommentar zum Ticket hinzugefügt', '{"content": "string", "is_internal": "boolean"}'),
('helpdesk.rating_submitted', 'helpdesk', 'helpdesk_rating', 'Ticket rating submitted', 'Ticket-Bewertung eingereicht', '{"rating": "integer", "feedback": "string"}'),
('helpdesk.sla_breached', 'helpdesk', 'helpdesk_ticket', 'SLA breached', 'SLA verletzt', '{"sla_type": "string", "breach_time": "datetime"}')
ON CONFLICT (action_name) DO NOTHING;

-- COMPLIANCE HUB MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('compliance.audit_created', 'compliance', 'compliance_audit', 'Compliance audit created', 'Compliance-Audit erstellt', '{"audit_type": "string", "scope": "string"}'),
('compliance.audit_started', 'compliance', 'compliance_audit', 'Compliance audit started', 'Compliance-Audit gestartet', '{}'),
('compliance.audit_completed', 'compliance', 'compliance_audit', 'Compliance audit completed', 'Compliance-Audit abgeschlossen', '{"findings_count": "integer"}'),
('compliance.finding_created', 'compliance', 'compliance_finding', 'Compliance finding created', 'Compliance-Befund erstellt', '{"severity": "string", "description": "string"}'),
('compliance.finding_resolved', 'compliance', 'compliance_finding', 'Compliance finding resolved', 'Compliance-Befund behoben', '{"resolution": "string"}'),
('compliance.policy_created', 'compliance', 'compliance_policy', 'Compliance policy created', 'Compliance-Richtlinie erstellt', '{"name": "string"}'),
('compliance.policy_updated', 'compliance', 'compliance_policy', 'Compliance policy updated', 'Compliance-Richtlinie aktualisiert', '{"version": "string"}'),
('compliance.policy_acknowledged', 'compliance', 'policy_acknowledgment', 'Policy acknowledged by employee', 'Richtlinie von Mitarbeiter bestätigt', '{"employee_id": "uuid"}'),
('compliance.training_assigned', 'compliance', 'compliance_training', 'Compliance training assigned', 'Compliance-Schulung zugewiesen', '{"training_id": "uuid", "due_date": "date"}'),
('compliance.training_completed', 'compliance', 'compliance_training', 'Compliance training completed', 'Compliance-Schulung abgeschlossen', '{"score": "integer"}'),
('compliance.risk_identified', 'compliance', 'compliance_risk', 'Compliance risk identified', 'Compliance-Risiko identifiziert', '{"risk_level": "string", "area": "string"}'),
('compliance.deadline_approaching', 'compliance', 'compliance_deadline', 'Compliance deadline approaching', 'Compliance-Frist nähert sich', '{"days_remaining": "integer"}')
ON CONFLICT (action_name) DO NOTHING;

-- KI MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('ai.suggestion_generated', 'ai', 'ai_suggestion', 'AI suggestion generated', 'KI-Vorschlag generiert', '{"suggestion_type": "string", "confidence": "number"}'),
('ai.suggestion_accepted', 'ai', 'ai_suggestion', 'AI suggestion accepted', 'KI-Vorschlag akzeptiert', '{}'),
('ai.suggestion_rejected', 'ai', 'ai_suggestion', 'AI suggestion rejected', 'KI-Vorschlag abgelehnt', '{"reason": "string"}'),
('ai.automation_triggered', 'ai', 'ai_automation', 'AI automation triggered', 'KI-Automatisierung ausgelöst', '{"automation_type": "string"}'),
('ai.automation_completed', 'ai', 'ai_automation', 'AI automation completed', 'KI-Automatisierung abgeschlossen', '{"result": "object"}'),
('ai.analysis_requested', 'ai', 'ai_analysis', 'AI analysis requested', 'KI-Analyse angefordert', '{"analysis_type": "string", "data_scope": "object"}'),
('ai.analysis_completed', 'ai', 'ai_analysis', 'AI analysis completed', 'KI-Analyse abgeschlossen', '{"insights_count": "integer"}'),
('ai.model_trained', 'ai', 'ai_model', 'AI model trained', 'KI-Modell trainiert', '{"model_type": "string", "accuracy": "number"}'),
('ai.feedback_provided', 'ai', 'ai_feedback', 'Feedback provided on AI output', 'Feedback zu KI-Ausgabe gegeben', '{"rating": "integer", "feedback": "string"}'),
('ai.usage_limit_reached', 'ai', 'ai_usage', 'AI usage limit reached', 'KI-Nutzungslimit erreicht', '{"limit_type": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- ZIELE MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('goal.created', 'goals', 'goal', 'Goal created', 'Ziel erstellt', '{"title": "string", "type": "string", "target_date": "date"}'),
('goal.updated', 'goals', 'goal', 'Goal updated', 'Ziel aktualisiert', '{"changed_fields": "object"}'),
('goal.deleted', 'goals', 'goal', 'Goal deleted', 'Ziel gelöscht', '{}'),
('goal.progress_updated', 'goals', 'goal', 'Goal progress updated', 'Zielfortschritt aktualisiert', '{"old_progress": "integer", "new_progress": "integer"}'),
('goal.achieved', 'goals', 'goal', 'Goal achieved', 'Ziel erreicht', '{}'),
('goal.missed', 'goals', 'goal', 'Goal missed', 'Ziel verfehlt', '{"reason": "string"}'),
('goal.aligned', 'goals', 'goal_alignment', 'Goal aligned with parent goal', 'Ziel mit übergeordnetem Ziel verknüpft', '{"parent_goal_id": "uuid"}'),
('goal.check_in_created', 'goals', 'goal_checkin', 'Goal check-in created', 'Ziel-Check-in erstellt', '{"progress": "integer", "notes": "string"}'),
('goal.cascaded', 'goals', 'goal', 'Goal cascaded to team', 'Ziel an Team weitergegeben', '{"target_team_id": "uuid"}'),
('goal.okr_created', 'goals', 'okr', 'OKR created', 'OKR erstellt', '{"objective": "string", "key_results": "array"}')
ON CONFLICT (action_name) DO NOTHING;

-- UMWELT & NACHHALTIGKEIT MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('esg.initiative_created', 'esg', 'esg_initiative', 'ESG initiative created', 'ESG-Initiative erstellt', '{"name": "string", "category": "string"}'),
('esg.initiative_updated', 'esg', 'esg_initiative', 'ESG initiative updated', 'ESG-Initiative aktualisiert', '{"changed_fields": "object"}'),
('esg.initiative_completed', 'esg', 'esg_initiative', 'ESG initiative completed', 'ESG-Initiative abgeschlossen', '{"impact": "object"}'),
('esg.metric_recorded', 'esg', 'esg_metric', 'ESG metric recorded', 'ESG-Metrik erfasst', '{"metric_type": "string", "value": "number", "unit": "string"}'),
('esg.target_set', 'esg', 'esg_target', 'ESG target set', 'ESG-Ziel gesetzt', '{"metric_type": "string", "target_value": "number"}'),
('esg.target_achieved', 'esg', 'esg_target', 'ESG target achieved', 'ESG-Ziel erreicht', '{}'),
('esg.report_generated', 'esg', 'esg_report', 'ESG report generated', 'ESG-Bericht erstellt', '{"report_type": "string", "period": "string"}'),
('esg.carbon_footprint_calculated', 'esg', 'carbon_footprint', 'Carbon footprint calculated', 'CO2-Fußabdruck berechnet', '{"total_emissions": "number", "period": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- GESCHÄFTSREISEN MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('travel.request_created', 'travel', 'travel_request', 'Travel request created', 'Reiseantrag erstellt', '{"destination": "string", "departure_date": "date", "return_date": "date"}'),
('travel.request_updated', 'travel', 'travel_request', 'Travel request updated', 'Reiseantrag aktualisiert', '{"changed_fields": "object"}'),
('travel.request_submitted', 'travel', 'travel_request', 'Travel request submitted', 'Reiseantrag eingereicht', '{}'),
('travel.request_approved', 'travel', 'travel_request', 'Travel request approved', 'Reiseantrag genehmigt', '{"approved_by": "uuid"}'),
('travel.request_rejected', 'travel', 'travel_request', 'Travel request rejected', 'Reiseantrag abgelehnt', '{"rejected_by": "uuid", "reason": "string"}'),
('travel.booking_created', 'travel', 'travel_booking', 'Travel booking created', 'Reisebuchung erstellt', '{"booking_type": "string", "amount": "number"}'),
('travel.booking_cancelled', 'travel', 'travel_booking', 'Travel booking cancelled', 'Reisebuchung storniert', '{"cancellation_fee": "number"}'),
('travel.trip_started', 'travel', 'travel_trip', 'Business trip started', 'Geschäftsreise gestartet', '{}'),
('travel.trip_completed', 'travel', 'travel_trip', 'Business trip completed', 'Geschäftsreise abgeschlossen', '{}'),
('travel.expense_added', 'travel', 'travel_expense', 'Travel expense added', 'Reisekosten hinzugefügt', '{"amount": "number", "category": "string"}'),
('travel.policy_violation', 'travel', 'travel_request', 'Travel policy violation', 'Reiserichtlinienverstoß', '{"violation_type": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- SCHICHTPLANUNG MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('shift.created', 'shifts', 'shift', 'Shift created', 'Schicht erstellt', '{"start_time": "datetime", "end_time": "datetime", "location": "string"}'),
('shift.updated', 'shifts', 'shift', 'Shift updated', 'Schicht aktualisiert', '{"changed_fields": "object"}'),
('shift.deleted', 'shifts', 'shift', 'Shift deleted', 'Schicht gelöscht', '{}'),
('shift.assigned', 'shifts', 'shift_assignment', 'Shift assigned', 'Schicht zugewiesen', '{"employee_id": "uuid"}'),
('shift.unassigned', 'shifts', 'shift_assignment', 'Shift unassigned', 'Schichtzuweisung entfernt', '{"employee_id": "uuid"}'),
('shift.swap_requested', 'shifts', 'shift_swap', 'Shift swap requested', 'Schichttausch beantragt', '{"requesting_employee_id": "uuid", "target_employee_id": "uuid"}'),
('shift.swap_approved', 'shifts', 'shift_swap', 'Shift swap approved', 'Schichttausch genehmigt', '{}'),
('shift.swap_rejected', 'shifts', 'shift_swap', 'Shift swap rejected', 'Schichttausch abgelehnt', '{"reason": "string"}'),
('shift.conflict_detected', 'shifts', 'shift_conflict', 'Shift conflict detected', 'Schichtkonflikt erkannt', '{"conflict_type": "string", "affected_employees": "array"}'),
('shift.overtime_detected', 'shifts', 'shift', 'Overtime detected', 'Überstunden erkannt', '{"overtime_hours": "number"}'),
('shift.coverage_gap', 'shifts', 'shift_coverage', 'Coverage gap detected', 'Besetzungslücke erkannt', '{"gap_start": "datetime", "gap_end": "datetime"}'),
('shift.schedule_published', 'shifts', 'shift_schedule', 'Shift schedule published', 'Schichtplan veröffentlicht', '{"period_start": "date", "period_end": "date"}')
ON CONFLICT (action_name) DO NOTHING;

-- KRANKMELDUNGEN MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('sick_leave.submitted', 'sick_leave', 'sick_leave', 'Sick leave submitted', 'Krankmeldung eingereicht', '{"start_date": "date", "expected_end_date": "date"}'),
('sick_leave.updated', 'sick_leave', 'sick_leave', 'Sick leave updated', 'Krankmeldung aktualisiert', '{"changed_fields": "object"}'),
('sick_leave.extended', 'sick_leave', 'sick_leave', 'Sick leave extended', 'Krankmeldung verlängert', '{"new_end_date": "date"}'),
('sick_leave.ended', 'sick_leave', 'sick_leave', 'Sick leave ended', 'Krankmeldung beendet', '{"actual_end_date": "date"}'),
('sick_leave.doctor_note_uploaded', 'sick_leave', 'sick_leave_document', 'Doctor note uploaded', 'Ärztliche Bescheinigung hochgeladen', '{"document_type": "string"}'),
('sick_leave.doctor_note_required', 'sick_leave', 'sick_leave', 'Doctor note required', 'Ärztliche Bescheinigung erforderlich', '{"deadline": "date"}'),
('sick_leave.return_to_work', 'sick_leave', 'sick_leave', 'Return to work confirmed', 'Rückkehr zur Arbeit bestätigt', '{}'),
('sick_leave.long_term_triggered', 'sick_leave', 'sick_leave', 'Long-term sick leave triggered', 'Langzeitkrankheit ausgelöst', '{"consecutive_days": "integer"}')
ON CONFLICT (action_name) DO NOTHING;

-- WORKFLOWS & AUTOMATION MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('workflow.definition_created', 'workflows', 'workflow_definition', 'Workflow definition created', 'Workflow-Definition erstellt', '{"name": "string", "trigger_type": "string"}'),
('workflow.definition_updated', 'workflows', 'workflow_definition', 'Workflow definition updated', 'Workflow-Definition aktualisiert', '{"changed_fields": "object"}'),
('workflow.definition_deleted', 'workflows', 'workflow_definition', 'Workflow definition deleted', 'Workflow-Definition gelöscht', '{}'),
('workflow.definition_activated', 'workflows', 'workflow_definition', 'Workflow definition activated', 'Workflow-Definition aktiviert', '{}'),
('workflow.definition_deactivated', 'workflows', 'workflow_definition', 'Workflow definition deactivated', 'Workflow-Definition deaktiviert', '{}'),
('workflow.instance_started', 'workflows', 'workflow_instance', 'Workflow instance started', 'Workflow-Instanz gestartet', '{"trigger_entity_type": "string", "trigger_entity_id": "uuid"}'),
('workflow.step_completed', 'workflows', 'workflow_step', 'Workflow step completed', 'Workflow-Schritt abgeschlossen', '{"step_name": "string", "result": "string"}'),
('workflow.step_failed', 'workflows', 'workflow_step', 'Workflow step failed', 'Workflow-Schritt fehlgeschlagen', '{"step_name": "string", "error": "string"}'),
('workflow.instance_completed', 'workflows', 'workflow_instance', 'Workflow instance completed', 'Workflow-Instanz abgeschlossen', '{"duration_seconds": "integer"}'),
('workflow.instance_failed', 'workflows', 'workflow_instance', 'Workflow instance failed', 'Workflow-Instanz fehlgeschlagen', '{"error": "string"}'),
('workflow.instance_cancelled', 'workflows', 'workflow_instance', 'Workflow instance cancelled', 'Workflow-Instanz abgebrochen', '{"cancelled_by": "uuid", "reason": "string"}'),
('workflow.escalation_triggered', 'workflows', 'workflow_escalation', 'Workflow escalation triggered', 'Workflow-Eskalation ausgelöst', '{"escalation_level": "integer", "reason": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- BENEFITS MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('benefit.plan_created', 'benefits', 'benefit_plan', 'Benefit plan created', 'Benefitplan erstellt', '{"name": "string", "type": "string"}'),
('benefit.plan_updated', 'benefits', 'benefit_plan', 'Benefit plan updated', 'Benefitplan aktualisiert', '{"changed_fields": "object"}'),
('benefit.plan_deleted', 'benefits', 'benefit_plan', 'Benefit plan deleted', 'Benefitplan gelöscht', '{}'),
('benefit.enrolled', 'benefits', 'benefit_enrollment', 'Employee enrolled in benefit', 'Mitarbeiter in Benefit eingeschrieben', '{"plan_id": "uuid", "coverage_level": "string"}'),
('benefit.enrollment_changed', 'benefits', 'benefit_enrollment', 'Benefit enrollment changed', 'Benefit-Einschreibung geändert', '{"old_plan_id": "uuid", "new_plan_id": "uuid"}'),
('benefit.unenrolled', 'benefits', 'benefit_enrollment', 'Employee unenrolled from benefit', 'Mitarbeiter aus Benefit ausgeschrieben', '{"reason": "string"}'),
('benefit.claim_submitted', 'benefits', 'benefit_claim', 'Benefit claim submitted', 'Benefit-Anspruch eingereicht', '{"amount": "number", "claim_type": "string"}'),
('benefit.claim_approved', 'benefits', 'benefit_claim', 'Benefit claim approved', 'Benefit-Anspruch genehmigt', '{}'),
('benefit.claim_rejected', 'benefits', 'benefit_claim', 'Benefit claim rejected', 'Benefit-Anspruch abgelehnt', '{"reason": "string"}'),
('benefit.open_enrollment_started', 'benefits', 'benefit_enrollment_period', 'Open enrollment started', 'Offene Einschreibung gestartet', '{"start_date": "date", "end_date": "date"}'),
('benefit.open_enrollment_ended', 'benefits', 'benefit_enrollment_period', 'Open enrollment ended', 'Offene Einschreibung beendet', '{}'),
('benefit.expiring_soon', 'benefits', 'benefit_enrollment', 'Benefit expiring soon', 'Benefit läuft bald ab', '{"expiry_date": "date"}')
ON CONFLICT (action_name) DO NOTHING;

-- INNOVATION HUB MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('innovation.idea_submitted', 'innovation', 'innovation_idea', 'Innovation idea submitted', 'Innovationsidee eingereicht', '{"title": "string", "category": "string"}'),
('innovation.idea_updated', 'innovation', 'innovation_idea', 'Innovation idea updated', 'Innovationsidee aktualisiert', '{"changed_fields": "object"}'),
('innovation.idea_voted', 'innovation', 'innovation_vote', 'Innovation idea voted', 'Für Innovationsidee abgestimmt', '{"vote_type": "string"}'),
('innovation.idea_commented', 'innovation', 'innovation_comment', 'Innovation idea commented', 'Innovationsidee kommentiert', '{"content": "string"}'),
('innovation.idea_promoted', 'innovation', 'innovation_idea', 'Innovation idea promoted to next stage', 'Innovationsidee zur nächsten Stufe befördert', '{"new_stage": "string"}'),
('innovation.idea_rejected', 'innovation', 'innovation_idea', 'Innovation idea rejected', 'Innovationsidee abgelehnt', '{"reason": "string"}'),
('innovation.idea_implemented', 'innovation', 'innovation_idea', 'Innovation idea implemented', 'Innovationsidee umgesetzt', '{"implementation_date": "date"}'),
('innovation.challenge_created', 'innovation', 'innovation_challenge', 'Innovation challenge created', 'Innovations-Challenge erstellt', '{"title": "string", "deadline": "date"}'),
('innovation.challenge_ended', 'innovation', 'innovation_challenge', 'Innovation challenge ended', 'Innovations-Challenge beendet', '{"submissions_count": "integer"}'),
('innovation.reward_granted', 'innovation', 'innovation_reward', 'Innovation reward granted', 'Innovationsprämie vergeben', '{"recipient_id": "uuid", "reward_type": "string"}')
ON CONFLICT (action_name) DO NOTHING;

-- EINSTELLUNGEN MODULE
INSERT INTO action_registry (action_name, module, entity_type, description, description_de, event_schema) VALUES
('settings.company_updated', 'settings', 'company_settings', 'Company settings updated', 'Unternehmenseinstellungen aktualisiert', '{"changed_fields": "object"}'),
('settings.module_enabled', 'settings', 'module_settings', 'Module enabled', 'Modul aktiviert', '{"module_name": "string"}'),
('settings.module_disabled', 'settings', 'module_settings', 'Module disabled', 'Modul deaktiviert', '{"module_name": "string"}'),
('settings.integration_connected', 'settings', 'integration_settings', 'Integration connected', 'Integration verbunden', '{"integration_type": "string"}'),
('settings.integration_disconnected', 'settings', 'integration_settings', 'Integration disconnected', 'Integration getrennt', '{"integration_type": "string"}'),
('settings.notification_preferences_updated', 'settings', 'notification_settings', 'Notification preferences updated', 'Benachrichtigungseinstellungen aktualisiert', '{"changed_fields": "object"}'),
('settings.security_settings_updated', 'settings', 'security_settings', 'Security settings updated', 'Sicherheitseinstellungen aktualisiert', '{"changed_fields": "object"}'),
('settings.branding_updated', 'settings', 'branding_settings', 'Branding settings updated', 'Branding-Einstellungen aktualisiert', '{"changed_fields": "object"}'),
('settings.locale_changed', 'settings', 'locale_settings', 'Locale settings changed', 'Spracheinstellungen geändert', '{"old_locale": "string", "new_locale": "string"}'),
('settings.api_key_created', 'settings', 'api_key', 'API key created', 'API-Schlüssel erstellt', '{"key_name": "string", "permissions": "array"}'),
('settings.api_key_revoked', 'settings', 'api_key', 'API key revoked', 'API-Schlüssel widerrufen', '{"key_name": "string"}'),
('settings.webhook_configured', 'settings', 'webhook_settings', 'Webhook configured', 'Webhook konfiguriert', '{"url": "string", "events": "array"}'),
('settings.backup_created', 'settings', 'backup', 'System backup created', 'System-Backup erstellt', '{}'),
('settings.audit_log_exported', 'settings', 'audit_export', 'Audit log exported', 'Audit-Log exportiert', '{"period_start": "date", "period_end": "date"}')
ON CONFLICT (action_name) DO NOTHING;