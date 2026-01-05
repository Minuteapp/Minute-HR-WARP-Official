-- Seed-Daten für Workforce Planning

-- 1. Seed Daten für 8 Rollen in der Workforce Planning
INSERT INTO public.wf_demand (role_name, required_skills, required_certifications, hours_needed, start_date, end_date, priority, department, cost_center, status) VALUES
('Senior Software Engineer', ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript'], ARRAY['AWS Cloud Practitioner'], 160, '2025-02-01', '2025-02-28', 'high', 'Engineering', 'TECH-001', 'open'),
('DevOps Engineer', ARRAY['Docker', 'Kubernetes', 'AWS', 'Jenkins'], ARRAY['AWS Solutions Architect'], 120, '2025-02-01', '2025-03-15', 'urgent', 'Engineering', 'TECH-001', 'open'),
('Product Manager', ARRAY['Agile', 'Scrum', 'Product Strategy', 'Analytics'], ARRAY['Scrum Master'], 140, '2025-02-15', '2025-03-31', 'medium', 'Product', 'PROD-001', 'partial'),
('UX/UI Designer', ARRAY['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'], ARRAY['Google UX Design'], 100, '2025-02-01', '2025-02-29', 'medium', 'Design', 'DESIGN-001', 'open'),
('Data Scientist', ARRAY['Python', 'Machine Learning', 'SQL', 'Statistics'], ARRAY['AWS Machine Learning'], 180, '2025-03-01', '2025-04-30', 'high', 'Data', 'DATA-001', 'open'),
('HR Business Partner', ARRAY['HR Policies', 'Employee Relations', 'Recruiting'], ARRAY['SHRM-CP'], 120, '2025-02-01', '2025-03-15', 'medium', 'HR', 'HR-001', 'open'),
('Sales Manager', ARRAY['CRM', 'Lead Generation', 'Account Management'], ARRAY['Salesforce Admin'], 160, '2025-02-01', '2025-04-30', 'high', 'Sales', 'SALES-001', 'partial'),
('Quality Assurance Engineer', ARRAY['Test Automation', 'Selenium', 'API Testing'], ARRAY['ISTQB Foundation'], 140, '2025-02-15', '2025-03-31', 'medium', 'Engineering', 'TECH-001', 'open')
ON CONFLICT DO NOTHING;

-- 2. Seed Daten für 50 Skills/Certifications mit Ablaufdatum
INSERT INTO public.wf_skills_matrix (user_id, skill_name, skill_level, certification_name, certification_level, acquired_date, expiry_date, status) VALUES
-- Technical Skills (erste 20)
(gen_random_uuid(), 'JavaScript', 5, 'JavaScript Expert Certification', 'Expert', '2024-01-15', '2026-01-15', 'active'),
(gen_random_uuid(), 'React', 4, 'React Professional', 'Professional', '2024-03-20', '2025-03-20', 'active'),
(gen_random_uuid(), 'Node.js', 4, null, null, '2024-02-10', null, 'active'),
(gen_random_uuid(), 'TypeScript', 3, null, null, '2024-05-15', null, 'active'),
(gen_random_uuid(), 'Python', 5, 'Python Institute PCAP', 'Associate', '2023-12-01', '2025-12-01', 'active'),
(gen_random_uuid(), 'Java', 4, 'Oracle Java SE', 'Professional', '2024-06-01', '2027-06-01', 'active'),
(gen_random_uuid(), 'C#', 3, 'Microsoft C# Certification', 'Associate', '2024-04-15', '2026-04-15', 'active'),
(gen_random_uuid(), 'SQL', 4, 'Microsoft SQL Server', 'Professional', '2024-02-28', '2026-02-28', 'active'),
(gen_random_uuid(), 'Docker', 4, 'Docker Certified Associate', 'Associate', '2024-01-10', '2025-01-10', 'expired'),
(gen_random_uuid(), 'Kubernetes', 3, 'CKA - Certified Kubernetes Administrator', 'Administrator', '2024-07-01', '2027-07-01', 'active'),
-- Cloud Skills (10)
(gen_random_uuid(), 'AWS', 5, 'AWS Solutions Architect Professional', 'Professional', '2024-03-15', '2027-03-15', 'active'),
(gen_random_uuid(), 'Azure', 4, 'Microsoft Azure Fundamentals', 'Fundamentals', '2024-05-01', '2026-05-01', 'active'),
(gen_random_uuid(), 'Google Cloud', 3, 'Google Cloud Associate Cloud Engineer', 'Associate', '2024-08-01', '2026-08-01', 'active'),
(gen_random_uuid(), 'Terraform', 4, null, null, '2024-04-20', null, 'active'),
(gen_random_uuid(), 'Jenkins', 3, null, null, '2024-06-15', null, 'active'),
-- Design Skills (5)
(gen_random_uuid(), 'Figma', 5, null, null, '2024-01-01', null, 'active'),
(gen_random_uuid(), 'Adobe Photoshop', 4, 'Adobe Certified Expert', 'Expert', '2023-11-15', '2024-11-15', 'expired'),
(gen_random_uuid(), 'Adobe Illustrator', 4, 'Adobe Certified Expert', 'Expert', '2024-02-01', '2025-02-01', 'active'),
(gen_random_uuid(), 'Sketch', 3, null, null, '2024-03-10', null, 'active'),
(gen_random_uuid(), 'User Research', 4, 'Google UX Design Certificate', 'Professional', '2024-04-01', '2026-04-01', 'active'),
-- Data & Analytics (5)
(gen_random_uuid(), 'Machine Learning', 4, 'AWS Machine Learning Specialty', 'Specialty', '2024-02-15', '2027-02-15', 'active'),
(gen_random_uuid(), 'Data Analysis', 5, 'Google Data Analytics Certificate', 'Professional', '2024-01-20', '2026-01-20', 'active'),
(gen_random_uuid(), 'Statistics', 4, null, null, '2024-03-01', null, 'active'),
(gen_random_uuid(), 'R Programming', 3, null, null, '2024-05-10', null, 'active'),
(gen_random_uuid(), 'Tableau', 4, 'Tableau Desktop Specialist', 'Specialist', '2024-06-01', '2025-06-01', 'active'),
-- Project Management (5)
(gen_random_uuid(), 'Scrum', 5, 'Certified Scrum Master', 'Master', '2024-01-01', '2025-01-01', 'active'),
(gen_random_uuid(), 'Agile', 4, 'PMI-ACP', 'Professional', '2024-03-15', '2027-03-15', 'active'),
(gen_random_uuid(), 'Project Management', 4, 'PMP', 'Professional', '2023-12-01', '2026-12-01', 'active'),
(gen_random_uuid(), 'Kanban', 3, null, null, '2024-04-01', null, 'active'),
(gen_random_uuid(), 'JIRA', 4, 'Atlassian JIRA Admin', 'Administrator', '2024-07-01', '2026-07-01', 'active'),
-- Security & QA (5)
(gen_random_uuid(), 'Cybersecurity', 5, 'CISSP', 'Professional', '2024-01-01', '2027-01-01', 'active'),
(gen_random_uuid(), 'Network Security', 4, 'Security+', 'Professional', '2024-02-15', '2027-02-15', 'active'),
(gen_random_uuid(), 'Test Automation', 4, 'ISTQB Advanced', 'Advanced', '2024-03-01', '2026-03-01', 'active'),
(gen_random_uuid(), 'Selenium', 3, null, null, '2024-05-01', null, 'active'),
(gen_random_uuid(), 'API Testing', 4, null, null, '2024-06-15', null, 'active')
ON CONFLICT DO NOTHING;

-- 3. Supply-Daten für 200 Mitarbeiter (vereinfacht)
DO $$
DECLARE
    i INTEGER;
    user_uuid UUID;
    skills_array TEXT[];
    departments TEXT[] := ARRAY['Engineering', 'Product', 'Design', 'Data', 'HR', 'Sales', 'Marketing', 'Operations'];
    all_skills TEXT[] := ARRAY['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'Docker', 'AWS', 'SQL', 'Figma', 'Scrum'];
BEGIN
    FOR i IN 1..200 LOOP
        user_uuid := gen_random_uuid();
        
        -- Zufällige 2-4 Skills auswählen
        skills_array := ARRAY(
            SELECT all_skills[floor(random() * array_length(all_skills, 1) + 1)]
            FROM generate_series(1, 2 + floor(random() * 3)::int)
        );
        
        INSERT INTO public.wf_supply (
            user_id, 
            available_hours, 
            skills, 
            cost_rate, 
            department, 
            availability_start, 
            availability_end, 
            status,
            preferences,
            constraints
        ) VALUES (
            user_uuid,
            160 + floor(random() * 80)::int, -- 160-240 Stunden
            skills_array,
            25 + floor(random() * 75)::int, -- 25-100€/h
            departments[floor(random() * array_length(departments, 1) + 1)],
            '2025-02-01'::date,
            '2025-12-31'::date,
            CASE floor(random() * 4)
                WHEN 0 THEN 'available'
                WHEN 1 THEN 'partial'
                WHEN 2 THEN 'available'
                ELSE 'available'
            END,
            jsonb_build_object(
                'preferred_shifts', ARRAY['day', 'flexible'],
                'remote_work', random() > 0.5,
                'travel_willingness', random() > 0.7
            ),
            jsonb_build_object(
                'max_overtime_hours', 20 + floor(random() * 20)::int,
                'no_weekends', random() > 0.8,
                'certification_required', random() > 0.6
            )
        );
    END LOOP;
END $$;

-- 4. Gap-Analyse Daten
INSERT INTO public.wf_gap (gap_hours, gap_fte, missing_skills, missing_certifications, department, week_start, severity, cost_impact) VALUES
(120, 3.0, ARRAY['Senior React Developer', 'TypeScript'], ARRAY['AWS Solutions Architect'], 'Engineering', '2025-02-03', 'high', 15000),
(80, 2.0, ARRAY['DevOps Engineer', 'Kubernetes'], ARRAY['CKA'], 'Engineering', '2025-02-03', 'medium', 12000),
(40, 1.0, ARRAY['UX Researcher'], ARRAY['Google UX Design'], 'Design', '2025-02-10', 'low', 5000),
(160, 4.0, ARRAY['Data Scientist', 'Machine Learning'], ARRAY['AWS ML Specialty'], 'Data', '2025-02-17', 'critical', 25000),
(60, 1.5, ARRAY['Sales Manager'], ARRAY['Salesforce Admin'], 'Sales', '2025-02-24', 'medium', 8000)
ON CONFLICT DO NOTHING;

-- 5. Szenarien
INSERT INTO public.wf_scenario (name, description, scenario_type, assumptions, forecast_data, cost_projection, headcount_projection, overtime_projection, is_active) VALUES
('Base Case 2025', 'Konservatives Wachstumsszenario basierend auf aktuellen Trends', 'base', 
 jsonb_build_object('growth_rate', 0.15, 'turnover_rate', 0.08, 'skill_development_rate', 0.12),
 jsonb_build_object('q1_demand', 2500, 'q2_demand', 2800, 'q3_demand', 3100, 'q4_demand', 3400),
 1850000, 220, 450, true),
('Best Case 2025', 'Optimistisches Szenario mit starkem Wachstum', 'best',
 jsonb_build_object('growth_rate', 0.35, 'turnover_rate', 0.05, 'skill_development_rate', 0.25),
 jsonb_build_object('q1_demand', 3200, 'q2_demand', 3800, 'q3_demand', 4400, 'q4_demand', 5000),
 2450000, 280, 320, false),
('Worst Case 2025', 'Pessimistisches Szenario mit Marktunsicherheiten', 'worst',
 jsonb_build_object('growth_rate', -0.05, 'turnover_rate', 0.15, 'skill_development_rate', 0.05),
 jsonb_build_object('q1_demand', 1800, 'q2_demand', 1600, 'q3_demand', 1400, 'q4_demand', 1200),
 1200000, 150, 180, false)
ON CONFLICT DO NOTHING;

-- 6. Assignments für die nächsten Wochen
INSERT INTO public.wf_assignment (user_id, assigned_hours, assignment_date, start_time, end_time, status, conflict_level, compliance_status) VALUES
(gen_random_uuid(), 8, '2025-02-03', '09:00', '17:00', 'confirmed', 'none', 'compliant'),
(gen_random_uuid(), 10, '2025-02-03', '08:00', '18:00', 'planned', 'low', 'warning'),
(gen_random_uuid(), 12, '2025-02-04', '07:00', '19:00', 'planned', 'high', 'violation'),
(gen_random_uuid(), 8, '2025-02-05', '09:00', '17:00', 'confirmed', 'none', 'compliant'),
(gen_random_uuid(), 9, '2025-02-06', '08:30', '17:30', 'in_progress', 'none', 'compliant')
ON CONFLICT DO NOTHING;

-- 7. Workforce Requests
INSERT INTO public.wf_request (request_type, title, description, priority, status, department, cost_estimate, roi_estimate, time_to_fill_days, request_data) VALUES
('hiring', 'Senior React Developer', 'Dringend benötigter Frontend-Entwickler für neues Projekt', 'urgent', 'open', 'Engineering', 85000, 15.5, 45, 
 jsonb_build_object('required_skills', ARRAY['React', 'TypeScript', 'Node.js'], 'experience_years', 5, 'remote_work', true)),
('training', 'AWS Schulung für DevOps Team', 'Cloud-Migration erfordert erweiterte AWS-Kenntnisse', 'high', 'in_review', 'Engineering', 12000, 25.0, 30,
 jsonb_build_object('training_type', 'AWS Solutions Architect', 'participants', 8, 'duration_days', 5)),
('certification', 'Scrum Master Zertifizierung', 'Agile Transformation benötigt mehr zertifizierte Scrum Master', 'medium', 'approved', 'Product', 3500, 18.2, 14,
 jsonb_build_object('certification_type', 'CSM', 'participants', 5, 'exam_date', '2025-03-15')),
('contract_change', 'Erhöhung Arbeitszeit Teilzeitkräfte', 'Temporäre Kapazitätserweiterung für Q2', 'medium', 'open', 'HR', 25000, 12.8, 21,
 jsonb_build_object('affected_employees', 15, 'duration_months', 6, 'additional_hours_per_week', 10)),
('equipment', 'Neue Laptops für Remote-Team', 'Hardware-Upgrade für verbessertes Remote-Arbeiten', 'low', 'completed', 'IT', 45000, 8.5, 14,
 jsonb_build_object('item_type', 'laptops', 'quantity', 25, 'specifications', 'MacBook Pro M3'))
ON CONFLICT DO NOTHING;

-- 8. Compliance-Regeln
INSERT INTO public.wf_constraint (name, constraint_type, rule_expression, severity, auto_fix_suggestion, scope) VALUES
('Maximale Tagesarbeitszeit', 'arbeitszeit', 
 jsonb_build_object('max_hours_per_day', 10, 'includes_breaks', false, 'emergency_exception', 12),
 'error', 'Schicht auf 10h reduzieren oder in zwei Teile aufteilen', 'global'),
('Mindest-Ruhezeit', 'ruhezeit',
 jsonb_build_object('min_rest_hours', 11, 'consecutive_required', true, 'weekend_exception', false),
 'error', 'Schicht um mindestens 11h verschieben', 'global'),
('Nachtarbeit-Limit', 'nachtarbeit',
 jsonb_build_object('max_nights_per_month', 5, 'night_start', '22:00', 'night_end', '06:00'),
 'warning', 'Nachtschichten auf andere Mitarbeiter verteilen', 'global'),
('Wochenarbeitszeit-Limit', 'arbeitszeit',
 jsonb_build_object('max_hours_per_week', 48, 'overtime_limit', 60, 'calculation_period', 'rolling_week'),
 'warning', 'Überstunden auf folgende Woche verschieben', 'global'),
('Urlaubsanspruch berücksichtigen', 'tarif',
 jsonb_build_object('min_vacation_days', 30, 'carryover_limit', 5, 'expiry_date', '2025-03-31'),
 'info', 'Urlaubsplanung anpassen', 'department')
ON CONFLICT DO NOTHING;