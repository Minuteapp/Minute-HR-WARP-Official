-- Templates und Dashboard-Daten für Projektmanagement-Modul

-- Erstelle Projekt-Templates-Tabelle falls sie nicht existiert
CREATE TABLE IF NOT EXISTS public.project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    default_start_offset_days INTEGER DEFAULT 0,
    roles TEXT[] DEFAULT '{}',
    project_config JSONB DEFAULT '{}',
    milestones JSONB DEFAULT '[]',
    tasks JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erstelle Dashboard-Tabellen
CREATE TABLE IF NOT EXISTS public.project_dashboard_data_sources (
    id TEXT PRIMARY KEY,
    module TEXT NOT NULL,
    query_config JSONB NOT NULL,
    cache_ttl_seconds INTEGER DEFAULT 300,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_dashboard_layouts (
    id TEXT PRIMARY KEY,
    device TEXT NOT NULL,
    grid_config JSONB NOT NULL,
    widgets JSONB NOT NULL,
    visibility JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Aktiviere RLS
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_dashboard_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "project_templates_access" ON public.project_templates
    FOR SELECT USING (
        CASE 
            WHEN is_superadmin_safe(auth.uid()) THEN true
            WHEN company_id IS NULL THEN is_active = true  -- Global templates
            ELSE company_id = get_user_company_id(auth.uid()) AND is_active = true
        END
    );

CREATE POLICY "dashboard_data_sources_admin" ON public.project_dashboard_data_sources
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
    );

CREATE POLICY "dashboard_layouts_all_read" ON public.project_dashboard_layouts
    FOR SELECT USING (true);

-- Event-Bus Tabellen
CREATE TABLE IF NOT EXISTS public.project_event_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL,
    module TEXT NOT NULL,
    entity TEXT NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Füge Event-Topics ein
INSERT INTO public.project_event_topics (topic, module, entity, event_type, description) VALUES
('projects.project.created', 'Projekte', 'Project', 'created', 'Ein neues Projekt wurde erstellt'),
('projects.project.updated', 'Projekte', 'Project', 'updated', 'Ein Projekt wurde aktualisiert'),
('projects.project.deleted', 'Projekte', 'Project', 'deleted', 'Ein Projekt wurde gelöscht'),
('projects.task.created', 'Projekte', 'Task', 'created', 'Eine neue Aufgabe wurde erstellt'),
('projects.task.updated', 'Projekte', 'Task', 'updated', 'Eine Aufgabe wurde aktualisiert'),
('projects.task.assigned', 'Projekte', 'Task', 'assigned', 'Eine Aufgabe wurde zugewiesen'),
('projects.task.required_skills_changed', 'Projekte', 'Task', 'required_skills_changed', 'Skill-Anforderungen einer Aufgabe wurden geändert'),
('projects.milestone.created', 'Projekte', 'Milestone', 'created', 'Ein neuer Meilenstein wurde erstellt'),
('projects.milestone.updated', 'Projekte', 'Milestone', 'updated', 'Ein Meilenstein wurde aktualisiert'),
('projects.budget.updated', 'Projekte', 'Budget', 'updated', 'Projektbudget wurde aktualisiert'),
('projects.comment.added', 'Projekte', 'Comment', 'added', 'Ein Kommentar wurde hinzugefügt')
ON CONFLICT (topic) DO NOTHING;

-- Dashboard Data Sources
INSERT INTO public.project_dashboard_data_sources (id, module, query_config) VALUES
('ds_portfolio_health', 'Projekte', '{"metric": "portfolio_health_rag", "scope": "org"}'),
('ds_milestones_next7', 'Kalender', '{"metric": "milestones_due", "range": "next_7d", "scope": "pmo"}'),
('ds_risk_heat', 'Projekte', '{"metric": "risk_heat_score", "scope": "portfolio"}'),
('ds_blockers_open', 'Projekte', '{"entity": "Task", "filter": {"status": "blocked"}}'),
('ds_burnup_top', 'Projekte', '{"metric": "burnup", "projects": "top5"}'),
('ds_team_workload_week', 'Workforce', '{"metric": "workload", "range": "this_week", "scope": "team"}'),
('ds_team_tasks_due7', 'Projekte', '{"entity": "Task", "filter": {"due_in_days": "<=7", "assignee_scope": "team", "statusNot": ["done", "archived"]}}'),
('ds_conflicts_open', 'Projekte', '{"metric": "conflicts_open", "sources": ["calendar", "shift", "absence"]}'),
('ds_my_tasks_today', 'Projekte', '{"entity": "Task", "filter": {"assignee": "me", "dueDate": "today"}}'),
('ds_my_project_events', 'Kalender', '{"metric": "events", "filter": {"relatedModule": "projects", "assignee": "me", "range": "next_7d"}}'),
('ds_budget_variance', 'Budget', '{"metric": "variance_top5", "scope": "projects"}'),
('ds_eac_etc', 'Budget', '{"metric": "eac_etc", "scope": "portfolio"}'),
('ds_cost_burn_month', 'Budget', '{"metric": "cost_burn", "range": "this_month"}'),
('ds_audit_recent_projects', 'System', '{"entity": "AuditLog", "timeRange": "last_24h", "filter": {"module": "Projects"}}'),
('ds_proj_exports', 'Projekte', '{"entity": "Exports", "timeRange": "last_90d"}')
ON CONFLICT (id) DO NOTHING;

-- Dashboard Layouts für Mobile
INSERT INTO public.project_dashboard_layouts (id, device, grid_config, widgets, visibility) VALUES
('projects_mobile_pmo', 'mobile', 
 '{"cols": 2, "gutter": 12, "rowHeight": 140}',
 '[
   {"id":"w_portfolio_health","type":"segmented_kpi","title":"Portfolio-Health","icon":"activity","x":0,"y":0,"w":2,"h":1,"dataSourceId":"ds_portfolio_health"},
   {"id":"w_due_milestones","type":"list_compact","title":"Meilensteine (7 Tage)","icon":"flag","x":0,"y":1,"w":2,"h":1,"dataSourceId":"ds_milestones_next7","action":{"route":"/projekte/timeline","params":{"range":"next_7d"}}},
   {"id":"w_risk_heat","type":"kpi_card","title":"Risiko-Heat","icon":"alert-triangle","x":0,"y":2,"w":1,"h":1,"dataSourceId":"ds_risk_heat","props":{"format":"score","subtitle":"0–100"}},
   {"id":"w_blockers","type":"list_compact","title":"Blocker & Abhängigkeiten","icon":"link","x":1,"y":2,"w":1,"h":1,"dataSourceId":"ds_blockers_open"},
   {"id":"w_burnup","type":"line","title":"Burn-up (Top-Projekte)","icon":"trending-up","x":0,"y":3,"w":2,"h":1,"dataSourceId":"ds_burnup_top"},
   {"id":"w_quick_actions","type":"quick_actions","title":"Schnellaktionen","icon":"zap","x":0,"y":4,"w":2,"h":1,"actions":[{"label":"Neues Projekt","route":"/projekte/new"},{"label":"Task importieren","route":"/projekte/import"},{"label":"Risiko melden","route":"/projekte/risks/new"}]}
 ]',
 '{"roles":["PMO","Projektleiter","Admin"]}'),

('projects_mobile_manager', 'mobile',
 '{"cols":2,"gutter":12,"rowHeight":140}',
 '[
   {"id":"w_team_load","type":"bar","title":"Auslastung (Woche)","icon":"users","x":0,"y":0,"w":2,"h":1,"dataSourceId":"ds_team_workload_week"},
   {"id":"w_my_team_tasks","type":"list_compact","title":"Team-Tasks fällig","icon":"check-square","x":0,"y":1,"w":2,"h":1,"dataSourceId":"ds_team_tasks_due7","action":{"route":"/projekte/spreadsheet","params":{"filter":"team_due"}}},
   {"id":"w_conflicts","type":"list_compact","title":"Konflikte (Kal/Schicht/Abw.)","icon":"slash","x":0,"y":2,"w":2,"h":1,"dataSourceId":"ds_conflicts_open"}
 ]',
 '{"roles":["Manager","Teamleiter"]}'),

('projects_mobile_employee', 'mobile',
 '{"cols":2,"gutter":12,"rowHeight":140}',
 '[
   {"id":"w_my_tasks_today","type":"list_compact","title":"Meine Aufgaben heute","icon":"calendar-check","x":0,"y":0,"w":2,"h":1,"dataSourceId":"ds_my_tasks_today","action":{"route":"/projekte/board","params":{"filter":"my_today"}}},
   {"id":"w_checkin","type":"quick_actions","title":"Zeiterfassung","icon":"clock","x":0,"y":1,"w":1,"h":1,"actions":[{"label":"Check-in an Task","route":"/zeit/checkin?src=projects"}]},
   {"id":"w_next_meetings","type":"list_compact","title":"Nächste Meetings","icon":"calendar","x":1,"y":1,"w":1,"h":1,"dataSourceId":"ds_my_project_events"}
 ]',
 '{"roles":["Employee"]}'),

('projects_mobile_fin', 'mobile',
 '{"cols":2,"gutter":12,"rowHeight":140}',
 '[
   {"id":"w_budget_variance","type":"kpi_card","title":"Budget-Abweichung","icon":"euro","x":0,"y":0,"w":1,"h":1,"dataSourceId":"ds_budget_variance","props":{"format":"currency_delta","subtitle":"Top 5"}},
   {"id":"w_etc","type":"kpi_card","title":"EAC / ETC","icon":"calculator","x":1,"y":0,"w":1,"h":1,"dataSourceId":"ds_eac_etc","props":{"format":"number"}},
   {"id":"w_cost_burn","type":"line","title":"Kosten-Burn (Monat)","icon":"trending-down","x":0,"y":1,"w":2,"h":1,"dataSourceId":"ds_cost_burn_month"}
 ]',
 '{"roles":["Finance","Controlling","Admin"]}'),

('projects_mobile_admin_audit', 'mobile',
 '{"cols":2,"gutter":12,"rowHeight":140}',
 '[
   {"id":"w_audit_recent","type":"list_compact","title":"Audit-Trail (24h)","icon":"history","x":0,"y":0,"w":2,"h":1,"dataSourceId":"ds_audit_recent_projects"},
   {"id":"w_exports","type":"list_compact","title":"Exporte/Imports","icon":"download","x":0,"y":1,"w":2,"h":1,"dataSourceId":"ds_proj_exports"}
 ]',
 '{"roles":["Admin","Auditor"]}')
ON CONFLICT (id) DO NOTHING;

-- Projekt-Templates
INSERT INTO public.project_templates (template_id, name, description, project_config, milestones, tasks) VALUES
('tpl_it_rollout_hrsuite_v1', 'IT-Einführung – HR-Suite Rollout', 'Template für HR-System Rollouts mit Pilotphase',
 '{"tags": ["IT","Rollout","HR"], "health": {"scope":"green","budget":"amber","schedule":"green","people":"green"}, "budget": {"currency":"EUR","capex":50000,"opex":15000}}',
 '[
   {"id":"ms_kickoff","title":"Kick-off","offsetDays":0},
   {"id":"ms_pilot_go","title":"Pilot Go-Live","offsetDays":30},
   {"id":"ms_global_go","title":"Global Go-Live","offsetDays":75}
 ]',
 '[
   {"id":"t_req","title":"Anforderungen finalisieren","offsetStart":0,"durationDays":7,"assignees":["pm_hr","it_ba"],"status":"todo","links":[{"type":"document","refId":"req_doc_draft"}]},
   {"id":"t_int","title":"Schnittstellen (Kalender/Payroll/SSO)","offsetStart":7,"durationDays":21,"assignees":["it_integration"],"requiredSkills":["SSO","API"],"dependencies":["t_req"]},
   {"id":"t_migration","title":"Datenmigration (Test)","offsetStart":14,"durationDays":10,"assignees":["it_data"],"dependencies":["t_req"],"links":[{"type":"document","refId":"export_mapping_v1"}]},
   {"id":"t_training","title":"Train-the-Trainer","offsetStart":21,"durationDays":7,"assignees":["hr_training"],"links":[{"type":"calendar","refId":"evt_training_series"}]},
   {"id":"t_pilot","title":"Pilot-Betrieb 1 Standort","offsetStart":30,"durationDays":14,"assignees":["loc_muc_team"],"dependencies":["t_int","t_migration","t_training"],"links":[{"type":"helpdesk","refId":"svc_pilot_support"}]},
   {"id":"t_change","title":"Change-Kommunikation","offsetStart":10,"durationDays":60,"assignees":["comms_lead"],"links":[{"type":"document","refId":"change_plan"}]}
 ]'),

('tpl_office_move_v1', 'Büro-Umzug – Standortwechsel', 'Template für Büroumzüge mit ESG-Compliance',
 '{"tags":["Facilities","Move"], "budget":{"currency":"EUR","capex":120000,"opex":20000}}',
 '[
   {"id":"ms_contract","title":"Mietvertrag unterschrieben","offsetDays":0},
   {"id":"ms_move","title":"Umzugstag","offsetDays":45}
 ]',
 '[
   {"id":"t_inventory","title":"Inventarliste erstellen","offsetStart":0,"durationDays":7,"assignees":["fac_ops"],"links":[{"type":"document","refId":"inventory_template"}]},
   {"id":"t_suppliers","title":"Lieferanten & Angebote einholen","offsetStart":3,"durationDays":10,"assignees":["procurement"],"links":[{"type":"document","refId":"tender_doc"}]},
   {"id":"t_it_net","title":"IT/Netzwerk planen","offsetStart":7,"durationDays":10,"assignees":["it_net"],"requiredSkills":["Network","Telephony"],"dependencies":["t_inventory"]},
   {"id":"t_move_plan","title":"Umzugsplan & Schichten","offsetStart":14,"durationDays":14,"assignees":["fac_ops","teamleads"],"links":[{"type":"shift","refId":"move_shifts_week_6"}]},
   {"id":"t_cleanout","title":"Altmobiliar entsorgen (ESG Nachweis)","offsetStart":30,"durationDays":7,"assignees":["fac_ops"],"links":[{"type":"esg","refId":"E5_WasteTotal"}]}
 ]'),

('tpl_training_program_v1', 'Schulungsprogramm – Company-wide', 'Template für firmenweite Schulungsprogramme',
 '{"tags":["Learning","HR"], "budget":{"currency":"EUR","opex":30000}}',
 '[
   {"id":"ms_content","title":"Content freigegeben","offsetDays":10},
   {"id":"ms_first_run","title":"Erster Durchlauf abgeschlossen","offsetDays":40}
 ]',
 '[
   {"id":"t_needs","title":"Bedarfsanalyse je Abteilung","offsetStart":0,"durationDays":7,"assignees":["hr_ld"],"links":[{"type":"survey","refId":"skills_survey_2025"}]},
   {"id":"t_content","title":"Kurse erstellen/kuratieren","offsetStart":5,"durationDays":10,"assignees":["hr_ld","sm_esg","sm_security"],"dependencies":["t_needs"]},
   {"id":"t_schedule","title":"Termine & Trainer planen","offsetStart":10,"durationDays":5,"assignees":["hr_ops"],"links":[{"type":"calendar","refId":"training_series"}]},
   {"id":"t_rollout","title":"Rollout & Tracking","offsetStart":15,"durationDays":25,"assignees":["hr_ops"]}
 ]'),

('tpl_manufacturing_turbine_line_v1', 'Fertigung – Neue Turbinenlinie', 'Template für Fertigungslinien mit Sicherheit und ESG',
 '{"tags":["Operations","Manufacturing","Safety"], "budget":{"currency":"EUR","capex":750000}}',
 '[
   {"id":"ms_install","title":"Installation abgeschlossen","offsetDays":28},
   {"id":"ms_signoff","title":"Sicherheitsabnahme","offsetDays":35}
 ]',
 '[
   {"id":"t_layout","title":"Linien-Layout & Sicherheitszonen","offsetStart":0,"durationDays":7,"assignees":["ops_eng","hse"],"links":[{"type":"document","refId":"layout_v1"}]},
   {"id":"t_install","title":"Maschineninstallation","offsetStart":7,"durationDays":14,"assignees":["vendor_team","ops_tech"],"dependencies":["t_layout"],"requiredSkills":["Turbine-X","HighVoltage"]},
   {"id":"t_cert","title":"Mitarbeiter-Zertifizierungen","offsetStart":10,"durationDays":10,"assignees":["training_ops"],"links":[{"type":"learning","refId":"cert_turbineX_lvl1"}]},
   {"id":"t_shift_plan","title":"Schichtplan auf Linie ausrollen","offsetStart":20,"durationDays":7,"assignees":["shift_planner"],"dependencies":["t_cert"],"links":[{"type":"shift","refId":"lineX_shift_schema"}]},
   {"id":"t_esg","title":"Energie-Monitoring anbinden (ESG)","offsetStart":21,"durationDays":7,"assignees":["ops_eng","esg_team"],"links":[{"type":"esg","refId":"energy_per_shift"}]}
 ]'),

('tpl_product_launch_v1', 'Produkt-Launch', 'Template für Produkteinführungen mit Marketing und Support',
 '{"tags":["Marketing","Sales","Support"], "budget":{"currency":"EUR","opex":80000}}',
 '[
   {"id":"ms_beta","title":"Beta beendet","offsetDays":20},
   {"id":"ms_launch","title":"Launch-Datum","offsetDays":45}
 ]',
 '[
   {"id":"t_positioning","title":"Positionierung & Messaging","offsetStart":0,"durationDays":7,"assignees":["pm","mkt_pm"],"links":[{"type":"document","refId":"positioning_doc"}]},
   {"id":"t_assets","title":"Kreativ-Assets & Landingpage","offsetStart":5,"durationDays":15,"assignees":["design","mkt_web"],"dependencies":["t_positioning"]},
   {"id":"t_enablement","title":"Sales-Enablement & Trainings","offsetStart":12,"durationDays":10,"assignees":["sales_ops"],"links":[{"type":"learning","refId":"sales_deck_course"}]},
   {"id":"t_support","title":"Support-Playbooks & FAQ","offsetStart":12,"durationDays":10,"assignees":["cs_lead"],"links":[{"type":"helpdesk","refId":"kb_productx"}]},
   {"id":"t_launch_event","title":"Launch-Event planen","offsetStart":20,"durationDays":10,"assignees":["event_mgr"],"links":[{"type":"calendar","refId":"launch_event"}]}
 ]')
ON CONFLICT (template_id) DO NOTHING;