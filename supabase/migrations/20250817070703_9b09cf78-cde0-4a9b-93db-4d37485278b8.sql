-- Fix ESG Migration - Create missing update function and seed data

-- Create generic update function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix triggers
DROP TRIGGER IF EXISTS emission_sources_updated_at_trigger ON public.emission_sources;
DROP TRIGGER IF EXISTS esg_kpis_updated_at_trigger ON public.esg_kpis;

CREATE TRIGGER emission_sources_updated_at_trigger
  BEFORE UPDATE ON public.emission_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER esg_kpis_updated_at_trigger
  BEFORE UPDATE ON public.esg_kpis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert ESG Data Sources
INSERT INTO public.esg_data_sources (id, name, module, query_config, cache_ttl, is_active) VALUES
  ('ds_co2e_ytd_target', 'CO2e YTD vs Target', 'ESG', '{"metric":"co2e_ytd_vs_target","scope":"org"}', 120, true),
  ('ds_scope_mix', 'Scope Mix', 'ESG', '{"metric":"scope_mix","period":"YTD"}', 120, true),
  ('ds_tax_alignment', 'Taxonomy Alignment', 'ESG', '{"metric":"taxonomy_alignment_turnover","period":"FY"}', 300, true),
  ('ds_data_quality', 'Data Quality Score', 'ESG', '{"metric":"data_quality_score","period":"current"}', 300, true),
  ('ds_tasks_open', 'Open ESG Tasks', 'ESG', '{"entity":"WorkflowTask","filter":{"status":"open"}}', 300, true),
  ('ds_validator_issues', 'Validator Issues', 'ESG', '{"metric":"validator_issues_open"}', 300, true),
  ('ds_esg_deadlines', 'ESG Deadlines', 'Kalender', '{"category":"ESG","timeRange":"next_30d"}', 86400, true),
  ('ds_training_hours', 'Training Hours ESG', 'Weiterbildung', '{"metric":"training_hours_esg","period":"YTD"}', 300, true),
  ('ds_trir', 'TRIR (Accident Rate)', 'HR', '{"metric":"trir","period":"YTD"}', 300, true),
  ('ds_diversity_mix', 'Diversity Mix', 'HR', '{"metric":"diversity_mix","scope":"department"}', 300, true),
  ('ds_expiring_docs', 'Expiring ESG Documents', 'Dokumente', '{"tag":"ESG","status":"expiring","timeRange":"next_60d"}', 300, true),
  ('ds_team_co2_month', 'Team CO2e Monthly', 'ESG', '{"metric":"co2e_team_month","scope":"team"}', 300, true),
  ('ds_travel_co2_month', 'Travel CO2e Monthly', 'Reisen', '{"metric":"co2e_travel_month","scope":"team"}', 300, true),
  ('ds_actions_open', 'Open ESG Actions', 'ESG', '{"entity":"Action","filter":{"status":"open","scope":"team"}}', 300, true),
  ('ds_shift_energy_week', 'Shift Energy Weekly', 'Schichtplanung', '{"metric":"energy_per_shift","timeRange":"this_week"}', 300, true),
  ('ds_tips', 'ESG Tips', 'ESG', '{"entity":"Tips","filter":{"audience":"employee"}}', 86400, true),
  ('ds_my_training_status', 'My ESG Training Status', 'Weiterbildung', '{"metric":"course_status","course":"ESG_Basics"}', 300, true),
  ('ds_audit_recent', 'Recent Audit Logs', 'System', '{"entity":"AuditLog","timeRange":"last_24h","filter":{"module":"ESG"}}', 300, true),
  ('ds_exports', 'ESG Exports', 'ESG', '{"entity":"Exports","timeRange":"last_90d"}', 300, true)
ON CONFLICT (id) DO NOTHING;

-- Insert ESG Dashboard Layouts
INSERT INTO public.esg_dashboard_layouts (id, name, device, grid_config, widgets, visibility, is_active) VALUES
  ('esg_mobile_so', 'ESG Dashboard - Sustainability Officer', 'mobile', 
   '{"cols": 2, "gutter": 12, "rowHeight": 140}',
   '[
     {"id":"w_co2_ytd","type":"kpi_card","title":"CO₂e YTD vs Ziel","icon":"leaf","x":0,"y":0,"w":1,"h":1,"dataSourceId":"ds_co2e_ytd_target","props":{"format":"delta_percent","subtitle":"Jahr bis heute"}},
     {"id":"w_scope_mix","type":"donut","title":"Scope-Mix (1/2/3)","icon":"pie","x":1,"y":0,"w":1,"h":1,"dataSourceId":"ds_scope_mix","props":{"legend":true}},
     {"id":"w_taxonomy","type":"kpi_card","title":"EU-Taxonomie Alignment","icon":"check-circle","x":0,"y":1,"w":1,"h":1,"dataSourceId":"ds_tax_alignment","props":{"format":"percent","subtitle":"Umsatz-Anteil"}},
     {"id":"w_data_quality","type":"kpi_card","title":"Datenqualität","icon":"shield","x":1,"y":1,"w":1,"h":1,"dataSourceId":"ds_data_quality","props":{"format":"score","subtitle":"Score 0–100"}},
     {"id":"w_tasks_open","type":"list_compact","title":"Offene Aufgaben (ESG)","icon":"list-checks","x":0,"y":2,"w":2,"h":1,"dataSourceId":"ds_tasks_open","action":{"route":"/esg/tasks","params":{"status":"open"}}},
     {"id":"w_issues","type":"list_compact","title":"Validierungsfehler","icon":"alert-triangle","x":0,"y":3,"w":2,"h":1,"dataSourceId":"ds_validator_issues","action":{"route":"/esg/validator"}},
     {"id":"w_deadlines","type":"calendar_strip","title":"Fristen & Einreichung","icon":"calendar","x":0,"y":4,"w":2,"h":1,"dataSourceId":"ds_esg_deadlines"}
   ]',
   '{"roles":["Sustainability Officer","Admin","HR-Manager"]}',
   true),
   
  ('esg_mobile_hr', 'ESG Dashboard - HR Manager', 'mobile',
   '{"cols": 2, "gutter": 12, "rowHeight": 140}',
   '[
     {"id":"w_training","type":"kpi_card","title":"Schulungsstunden (YTD)","icon":"book","x":0,"y":0,"w":1,"h":1,"dataSourceId":"ds_training_hours","props":{"format":"number","subtitle":"S-Themen"}},
     {"id":"w_accidents","type":"kpi_card","title":"Unfallrate (TRIR)","icon":"activity","x":1,"y":0,"w":1,"h":1,"dataSourceId":"ds_trir","props":{"format":"number","decimals":2}},
     {"id":"w_diversity","type":"bar","title":"Diversity (Team-Mix)","icon":"users","x":0,"y":1,"w":2,"h":1,"dataSourceId":"ds_diversity_mix"},
     {"id":"w_expiring_docs","type":"list_compact","title":"Nachweise laufen ab","icon":"file-warning","x":0,"y":2,"w":2,"h":1,"dataSourceId":"ds_expiring_docs","action":{"route":"/dokumente?tag=ESG&status=expiring"}}
   ]',
   '{"roles":["HR-Manager","Admin"]}',
   true),
   
  ('esg_mobile_manager', 'ESG Dashboard - Manager', 'mobile',
   '{"cols": 2, "gutter": 12, "rowHeight": 140}',
   '[
     {"id":"w_team_co2","type":"kpi_card","title":"Team-CO₂e Monat","icon":"leaf","x":0,"y":0,"w":1,"h":1,"dataSourceId":"ds_team_co2_month","props":{"format":"number","suffix":" tCO2e"}},
     {"id":"w_travel","type":"kpi_card","title":"Reise-Emissionen","icon":"plane","x":1,"y":0,"w":1,"h":1,"dataSourceId":"ds_travel_co2_month","props":{"format":"number","suffix":" tCO2e"}},
     {"id":"w_actions","type":"list_compact","title":"Maßnahmen offen","icon":"clipboard-list","x":0,"y":1,"w":2,"h":1,"dataSourceId":"ds_actions_open","action":{"route":"/esg/actions?scope=team"}},
     {"id":"w_shift_energy","type":"line","title":"Energie je Schicht (Woche)","icon":"bolt","x":0,"y":2,"w":2,"h":1,"dataSourceId":"ds_shift_energy_week"}
   ]',
   '{"roles":["Manager","Teamleiter"]}',
   true),
   
  ('esg_mobile_employee', 'ESG Dashboard - Employee', 'mobile',
   '{"cols": 2, "gutter": 12, "rowHeight": 140}',
   '[
     {"id":"w_commute_survey","type":"quick_actions","title":"Pendeln erfassen","icon":"bike","x":0,"y":0,"w":1,"h":1,"actions":[{"label":"Weg & Häufigkeit","route":"/esg/commute/survey"}]},
     {"id":"w_tips","type":"list_compact","title":"Tipps & Richtlinien","icon":"info","x":1,"y":0,"w":1,"h":1,"dataSourceId":"ds_tips"},
     {"id":"w_my_training","type":"kpi_card","title":"Pflichtschulung ESG","icon":"book","x":0,"y":1,"w":2,"h":1,"dataSourceId":"ds_my_training_status","props":{"format":"status"}}
   ]',
   '{"roles":["Employee"]}',
   true),
   
  ('esg_mobile_admin_audit', 'ESG Dashboard - Admin/Auditor', 'mobile',
   '{"cols": 2, "gutter": 12, "rowHeight": 140}',
   '[
     {"id":"w_validator","type":"list_compact","title":"Validator-Fehler","icon":"alert-triangle","x":0,"y":0,"w":2,"h":1,"dataSourceId":"ds_validator_issues"},
     {"id":"w_audit_trail","type":"list_compact","title":"Audit-Trail (letzte 24h)","icon":"history","x":0,"y":1,"w":2,"h":1,"dataSourceId":"ds_audit_recent"},
     {"id":"w_exports","type":"list_compact","title":"Exporte & Einreichungen","icon":"download","x":0,"y":2,"w":2,"h":1,"dataSourceId":"ds_exports"}
   ]',
   '{"roles":["Admin","Auditor"]}',
   true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample emission factors
INSERT INTO public.emission_factors (source_type, region, year, unit_in, unit_out, value, uncertainty, source_reference, is_active) VALUES
  ('electricity', 'DE', 2025, 'kWh', 'kgCO2e', 0.485, 0.05, 'UBA 2025', true),
  ('natural_gas', 'DE', 2025, 'kWh', 'kgCO2e', 0.202, 0.03, 'UBA 2025', true),
  ('diesel', 'DE', 2025, 'l', 'kgCO2e', 2.65, 0.02, 'BAFA 2025', true),
  ('petrol', 'DE', 2025, 'l', 'kgCO2e', 2.32, 0.02, 'BAFA 2025', true),
  ('flights_domestic', 'DE', 2025, 'km', 'kgCO2e', 0.214, 0.10, 'DEFRA 2025', true),
  ('flights_short_haul', 'EU', 2025, 'km', 'kgCO2e', 0.156, 0.10, 'DEFRA 2025', true),
  ('flights_long_haul', 'Global', 2025, 'km', 'kgCO2e', 0.142, 0.10, 'DEFRA 2025', true),
  ('rail', 'DE', 2025, 'km', 'kgCO2e', 0.032, 0.05, 'DB AG 2025', true),
  ('hotel_night', 'DE', 2025, 'night', 'kgCO2e', 12.5, 0.15, 'Hotel Sustainability Index', true)
ON CONFLICT DO NOTHING;