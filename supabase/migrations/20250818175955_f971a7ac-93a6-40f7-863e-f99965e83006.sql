-- Korrigierte Seed-Daten für Workforce Planning

-- 1. Seed Daten für 8 Rollen in der Workforce Planning (korrigierte Daten)
INSERT INTO public.wf_demand (role_name, required_skills, required_certifications, hours_needed, start_date, end_date, priority, department, cost_center, status) VALUES
('Senior Software Engineer', ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript'], ARRAY['AWS Cloud Practitioner'], 160, '2025-02-01', '2025-02-28', 'high', 'Engineering', 'TECH-001', 'open'),
('DevOps Engineer', ARRAY['Docker', 'Kubernetes', 'AWS', 'Jenkins'], ARRAY['AWS Solutions Architect'], 120, '2025-02-01', '2025-03-15', 'urgent', 'Engineering', 'TECH-001', 'open'),
('Product Manager', ARRAY['Agile', 'Scrum', 'Product Strategy', 'Analytics'], ARRAY['Scrum Master'], 140, '2025-02-15', '2025-03-31', 'medium', 'Product', 'PROD-001', 'partial'),
('UX/UI Designer', ARRAY['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'], ARRAY['Google UX Design'], 100, '2025-02-01', '2025-02-28', 'medium', 'Design', 'DESIGN-001', 'open'),
('Data Scientist', ARRAY['Python', 'Machine Learning', 'SQL', 'Statistics'], ARRAY['AWS Machine Learning'], 180, '2025-03-01', '2025-04-30', 'high', 'Data', 'DATA-001', 'open'),
('HR Business Partner', ARRAY['HR Policies', 'Employee Relations', 'Recruiting'], ARRAY['SHRM-CP'], 120, '2025-02-01', '2025-03-15', 'medium', 'HR', 'HR-001', 'open'),
('Sales Manager', ARRAY['CRM', 'Lead Generation', 'Account Management'], ARRAY['Salesforce Admin'], 160, '2025-02-01', '2025-04-30', 'high', 'Sales', 'SALES-001', 'partial'),
('Quality Assurance Engineer', ARRAY['Test Automation', 'Selenium', 'API Testing'], ARRAY['ISTQB Foundation'], 140, '2025-02-15', '2025-03-31', 'medium', 'Engineering', 'TECH-001', 'open')
ON CONFLICT DO NOTHING;

-- 2. Seed Daten für Skills/Certifications
INSERT INTO public.wf_skills_matrix (user_id, skill_name, skill_level, certification_name, certification_level, acquired_date, expiry_date, status) VALUES
-- Technical Skills
(gen_random_uuid(), 'JavaScript', 5, 'JavaScript Expert Certification', 'Expert', '2024-01-15', '2026-01-15', 'active'),
(gen_random_uuid(), 'React', 4, 'React Professional', 'Professional', '2024-03-20', '2025-03-20', 'active'),
(gen_random_uuid(), 'Node.js', 4, null, null, '2024-02-10', null, 'active'),
(gen_random_uuid(), 'TypeScript', 3, null, null, '2024-05-15', null, 'active'),
(gen_random_uuid(), 'Python', 5, 'Python Institute PCAP', 'Associate', '2023-12-01', '2025-12-01', 'active'),
(gen_random_uuid(), 'Docker', 4, 'Docker Certified Associate', 'Associate', '2024-01-10', '2025-01-10', 'expired'),
(gen_random_uuid(), 'Kubernetes', 3, 'CKA - Certified Kubernetes Administrator', 'Administrator', '2024-07-01', '2027-07-01', 'active'),
(gen_random_uuid(), 'AWS', 5, 'AWS Solutions Architect Professional', 'Professional', '2024-03-15', '2027-03-15', 'active'),
(gen_random_uuid(), 'Figma', 5, null, null, '2024-01-01', null, 'active'),
(gen_random_uuid(), 'Scrum', 5, 'Certified Scrum Master', 'Master', '2024-01-01', '2025-01-01', 'active')
ON CONFLICT DO NOTHING;

-- 3. Supply-Daten für Mitarbeiter
DO $$
DECLARE
    i INTEGER;
    user_uuid UUID;
    skills_array TEXT[];
    departments TEXT[] := ARRAY['Engineering', 'Product', 'Design', 'Data', 'HR', 'Sales'];
    all_skills TEXT[] := ARRAY['JavaScript', 'React', 'Python', 'AWS', 'Figma', 'Scrum'];
BEGIN
    FOR i IN 1..50 LOOP
        user_uuid := gen_random_uuid();
        skills_array := ARRAY[all_skills[1 + (i % 6)]];
        
        INSERT INTO public.wf_supply (
            user_id, available_hours, skills, cost_rate, department, 
            availability_start, availability_end, status, preferences, constraints
        ) VALUES (
            user_uuid, 160 + (i % 80), skills_array, 50 + (i % 50), 
            departments[1 + (i % 6)], '2025-02-01', '2025-12-31', 'available',
            '{"remote_work": true}', '{"max_overtime": 20}'
        );
    END LOOP;
END $$;

-- 4. Gap-Analyse
INSERT INTO public.wf_gap (gap_hours, gap_fte, missing_skills, department, week_start, severity, cost_impact) VALUES
(120, 3.0, ARRAY['React Developer'], 'Engineering', '2025-02-03', 'high', 15000),
(80, 2.0, ARRAY['DevOps Engineer'], 'Engineering', '2025-02-10', 'medium', 12000),
(160, 4.0, ARRAY['Data Scientist'], 'Data', '2025-02-17', 'critical', 25000)
ON CONFLICT DO NOTHING;

-- 5. Szenarien
INSERT INTO public.wf_scenario (name, scenario_type, assumptions, cost_projection, headcount_projection, overtime_projection, is_active) VALUES
('Base Case 2025', 'base', '{"growth_rate": 0.15}', 1850000, 220, 450, true),
('Best Case 2025', 'best', '{"growth_rate": 0.35}', 2450000, 280, 320, false),
('Worst Case 2025', 'worst', '{"growth_rate": -0.05}', 1200000, 150, 180, false)
ON CONFLICT DO NOTHING;

-- 6. Assignments
INSERT INTO public.wf_assignment (user_id, assigned_hours, assignment_date, status, conflict_level, compliance_status) VALUES
(gen_random_uuid(), 8, '2025-02-03', 'confirmed', 'none', 'compliant'),
(gen_random_uuid(), 10, '2025-02-04', 'planned', 'low', 'warning'),
(gen_random_uuid(), 8, '2025-02-05', 'confirmed', 'none', 'compliant')
ON CONFLICT DO NOTHING;

-- 7. Requests
INSERT INTO public.wf_request (request_type, title, priority, status, department, cost_estimate, roi_estimate) VALUES
('hiring', 'Senior React Developer', 'urgent', 'open', 'Engineering', 85000, 15.5),
('training', 'AWS Training', 'high', 'in_review', 'Engineering', 12000, 25.0),
('certification', 'Scrum Master Cert', 'medium', 'approved', 'Product', 3500, 18.2)
ON CONFLICT DO NOTHING;

-- 8. Compliance-Regeln
INSERT INTO public.wf_constraint (name, constraint_type, rule_expression, severity, scope) VALUES
('Max Daily Hours', 'arbeitszeit', '{"max_hours_per_day": 10}', 'error', 'global'),
('Min Rest Time', 'ruhezeit', '{"min_rest_hours": 11}', 'error', 'global'),
('Night Work Limit', 'nachtarbeit', '{"max_nights_per_month": 5}', 'warning', 'global')
ON CONFLICT DO NOTHING;