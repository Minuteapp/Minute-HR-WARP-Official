-- Performance Template System - Complete Role-Based Templates

-- Drop existing performance_templates table if exists
DROP TABLE IF EXISTS public.performance_templates CASCADE;

-- Create enhanced performance_templates table
CREATE TABLE public.performance_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  role_category text NOT NULL, -- Engineering, Sales, Marketing, etc.
  template_type performance_template_type NOT NULL DEFAULT 'individual',
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  rating_scale performance_rating_scale NOT NULL DEFAULT 'stars_5',
  cycle_type performance_cycle_type NOT NULL DEFAULT 'annual',
  promotion_signals text[],
  red_flags text[],
  evidence_types text[],
  requires_calibration boolean DEFAULT true,
  requires_peer_review boolean DEFAULT true,
  requires_self_review boolean DEFAULT true,
  ai_assistance_enabled boolean DEFAULT true,
  is_system_template boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_templates
CREATE POLICY "Allow read access to performance templates" ON public.performance_templates
  FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage performance templates" ON public.performance_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'hr')
    )
  );

-- Create performance_review_assignments table
CREATE TABLE public.performance_review_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.performance_templates(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  reviewer_id uuid,
  cycle_id uuid REFERENCES public.performance_cycles(id),
  status text DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
  due_date date,
  assigned_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_review_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments
CREATE POLICY "Users can view their own assignments" ON public.performance_review_assignments
  FOR SELECT USING (
    employee_id = auth.uid() OR 
    reviewer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'hr')
    )
  );

CREATE POLICY "Allow admins to manage assignments" ON public.performance_review_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'hr')
    )
  );

-- Insert 15 comprehensive role-based templates
INSERT INTO public.performance_templates (name, description, role_category, sections, promotion_signals, red_flags, evidence_types, is_system_template) VALUES

-- 1. Engineering IC
('Engineering - Individual Contributor v1', 'Comprehensive template for software engineers and developers', 'Engineering', 
'[
  {
    "id": "outcomes",
    "title": "Ergebnisse & Wirkung",
    "weight": 35,
    "criteria": [
      {"id": "okr_delivery", "label": "OKR-/Projektlieferung (Qualität/Termine/Scope)", "description": "Zuverlässige Lieferung vereinbarter Ziele und Projekte"},
      {"id": "impact", "label": "Business Impact & Priorisierung", "description": "Messbare Auswirkung auf Geschäftsziele"}
    ],
    "evidenceHints": ["OKR-Report", "PRs/Tickets", "Release-Notes", "Performance-Dashboards"]
  },
  {
    "id": "craft",
    "title": "Fachlichkeit & Code-Qualität",
    "weight": 25,
    "criteria": [
      {"id": "code_quality", "label": "Code-Qualität, Tests, Tech Debt", "description": "Sauberer, testbarer Code mit minimaler technischer Schuld"},
      {"id": "architecture", "label": "Architektur & Systemdenken", "description": "Verständnis komplexer Systeme und Architekturbeiträge"}
    ],
    "evidenceHints": ["Static-Analysis", "Test-Coverage", "Design-Docs", "Code-Review-Feedback"]
  },
  {
    "id": "collab",
    "title": "Zusammenarbeit & Ownership",
    "weight": 20,
    "criteria": [
      {"id": "ownership", "label": "Ownership & Verlässlichkeit", "description": "Verantwortung übernehmen und verlässlich liefern"},
      {"id": "reviewing", "label": "Code Reviews & Wissensaustausch", "description": "Konstruktive Reviews und Wissensverteilung"}
    ],
    "evidenceHints": ["Review-Stats", "Peer-Feedback", "Dokumentation", "Incident-Response"]
  },
  {
    "id": "growth",
    "title": "Lernen & Skalierung",
    "weight": 20,
    "criteria": [
      {"id": "learning", "label": "Lernfortschritt & Mentoring", "description": "Kontinuierliches Lernen und Unterstützung anderer"},
      {"id": "automation", "label": "Automatisierung/Tooling-Beiträge", "description": "Effizienzsteigerung durch Tools und Automatisierung"}
    ],
    "evidenceHints": ["Kursnachweise", "Interne Talks", "Automation PRs", "Tool-Entwicklung"]
  }
]'::jsonb,
ARRAY['Liefert konstant 4-5 bei Outcomes & Craft', 'Wirkt über Teamgrenzen (Design/Guidelines)', 'Mentoring anderer Entwickler'],
ARRAY['Termine verfehlt ohne Risiko-Callout', 'Qualitätsmängel wiederholt', 'Keine Dokumentation'],
ARRAY['PR-Metriken', 'DORA-KPIs', 'Test-Coverage', 'Incident-Postmortems'], true),

-- 2. Engineering Manager
('Engineering - Manager/Lead v1', 'Template für Engineering-Führungskräfte und Teamleiter', 'Engineering',
'[
  {
    "id": "delivery",
    "title": "Delivery & Planung",
    "weight": 30,
    "criteria": [
      {"id": "roadmap", "label": "Roadmap-Hit-Rate & Vorhersagbarkeit", "description": "Zuverlässige Lieferung der Roadmap-Commitments"},
      {"id": "risk_mgmt", "label": "Risiko-Management & Eskalation", "description": "Frühzeitige Identifikation und Management von Risiken"}
    ],
    "evidenceHints": ["Roadmap-Reports", "Sprint-Reviews", "Stakeholder-Updates"]
  },
  {
    "id": "leadership",
    "title": "Teamführung",
    "weight": 25,
    "criteria": [
      {"id": "engagement", "label": "Team-Engagement & Retention", "description": "Mitarbeiterzufriedenheit und Bindung"},
      {"id": "hiring", "label": "Hiring-Durchsatz & Quality", "description": "Effektive Rekrutierung qualifizierter Kandidaten"}
    ],
    "evidenceHints": ["eNPS-Scores", "Retention-Rate", "Hiring-Funnel", "1:1-Feedback"]
  },
  {
    "id": "technical",
    "title": "Technische Steuerung",
    "weight": 20,
    "criteria": [
      {"id": "architecture", "label": "Architektur-Decisions & Standards", "description": "Technische Richtungsentscheidungen und Standards"},
      {"id": "tech_debt", "label": "Tech Debt-Plan & Execution", "description": "Management technischer Schulden"}
    ],
    "evidenceHints": ["Arch-RFCs", "Tech-Debt-Tracking", "Code-Quality-Trends"]
  },
  {
    "id": "stakeholder",
    "title": "Stakeholder-Management",
    "weight": 15,
    "criteria": [
      {"id": "communication", "label": "Erwartungs-Management & Transparenz", "description": "Klare Kommunikation mit allen Stakeholdern"}
    ],
    "evidenceHints": ["Stakeholder-Feedback", "Communication-Artifacts"]
  },
  {
    "id": "development",
    "title": "People Development",
    "weight": 10,
    "criteria": [
      {"id": "mentoring", "label": "1:1-Qualität & Wachstumspfade", "description": "Individuelle Entwicklung der Teammitglieder"}
    ],
    "evidenceHints": ["1:1-Notizen", "IDPs", "Promotion-Erfolge"]
  }
]'::jsonb,
ARRAY['Skaliert Teams erfolgreich', 'Baut Nachfolge auf', 'Konstant hohe Team-Performance'],
ARRAY['Micromanagement', 'Hohe Fluktuation', 'Fehlende Priorisierung', 'Schlechte Stakeholder-Kommunikation'],
ARRAY['Roadmap-Reports', 'eNPS/Engagement', 'Hiring-Funnel', 'Arch-RFCs'], true),

-- 3. Product Manager
('Product Manager v1', 'Template für Product Manager und Product Owner', 'Product',
'[
  {
    "id": "outcome",
    "title": "Outcome/Impact",
    "weight": 35,
    "criteria": [
      {"id": "product_kpis", "label": "Produkt-KPIs (Adoption, Retention, Revenue, NPS)", "description": "Messbare Produkterfolge"},
      {"id": "market_impact", "label": "Marktposition & Competitive Intelligence", "description": "Marktverständnis und Wettbewerbsanalyse"}
    ],
    "evidenceHints": ["KPI-Dashboards", "Revenue-Reports", "NPS-Surveys", "Market-Research"]
  },
  {
    "id": "discovery",
    "title": "Discovery & Insights",
    "weight": 20,
    "criteria": [
      {"id": "research", "label": "Nutzer-Interviews & Datenanalyse", "description": "Fundierte Nutzerforschung und Datenauswertung"},
      {"id": "experiments", "label": "Experimente & Hypothesen", "description": "Systematisches Testen von Produkthypothesen"}
    ],
    "evidenceHints": ["Interview-Summaries", "Experiment-Docs", "Analytics-Reports"]
  },
  {
    "id": "execution",
    "title": "Delivery/Execution",
    "weight": 20,
    "criteria": [
      {"id": "roadmap", "label": "Roadmap-Treue & Scope-Management", "description": "Zuverlässige Roadmap-Execution"},
      {"id": "coordination", "label": "Schnittstellen-Koordination", "description": "Effektive Zusammenarbeit mit Engineering und Design"}
    ],
    "evidenceHints": ["Roadmap-Updates", "Release-Notes", "Cross-Team-Feedback"]
  },
  {
    "id": "stakeholder",
    "title": "Stakeholder & Kommunikation",
    "weight": 15,
    "criteria": [
      {"id": "communication", "label": "Stakeholder-Alignment & Updates", "description": "Regelmäßige und klare Stakeholder-Kommunikation"}
    ],
    "evidenceHints": ["Stakeholder-Updates", "Präsentationen", "Meeting-Feedback"]
  },
  {
    "id": "leadership",
    "title": "Leadership ohne Weisungsbefugnis",
    "weight": 10,
    "criteria": [
      {"id": "influence", "label": "Vision & Team-Motivation", "description": "Inspiration und Führung durch Vision"}
    ],
    "evidenceHints": ["Team-Feedback", "Vision-Docs", "Change-Management"]
  }
]'::jsonb,
ARRAY['Wiederholt messbarer Impact über Produktlinien', 'Starke Datenorientierung', 'Excellent stakeholder management'],
ARRAY['Output > Outcome Focus', 'Fehlende Hypothesen/validiertes Lernen', 'Schwache Nutzerforschung'],
ARRAY['KPI-Dashboards', 'Experiment-Docs', 'User-Research', 'Revenue-Attribution'], true);

-- Continue with more templates...
INSERT INTO public.performance_templates (name, description, role_category, sections, promotion_signals, red_flags, evidence_types, is_system_template) VALUES

-- 4. Sales AE
('Sales - Account Executive v1', 'Template für Account Executives und Senior Sales', 'Sales',
'[
  {
    "id": "quota",
    "title": "Quota-Erfüllung",
    "weight": 40,
    "criteria": [
      {"id": "arr_bookings", "label": "ARR/Bookings vs. Target", "description": "Zielerreichung bei Umsatz und Buchungen"},
      {"id": "forecast", "label": "Forecast-Genauigkeit", "description": "Vorhersagequalität für Pipeline und Abschlüsse"}
    ],
    "evidenceHints": ["CRM-Reports", "Quarterly-Results", "Forecast-vs-Actual"]
  },
  {
    "id": "pipeline",
    "title": "Pipeline-Qualität",
    "weight": 20,
    "criteria": [
      {"id": "win_rates", "label": "Win-Rates & Stage-Konversion", "description": "Erfolgsquoten in verschiedenen Verkaufsphasen"},
      {"id": "deal_size", "label": "Average Deal Size & Cycle Time", "description": "Durchschnittliche Dealgrößen und Verkaufszyklen"}
    ],
    "evidenceHints": ["Pipeline-Reports", "Win-Loss-Analysis", "Stage-Conversion"]
  },
  {
    "id": "relationships",
    "title": "Kundenbeziehung",
    "weight": 20,
    "criteria": [
      {"id": "account_mgmt", "label": "Account Management & Multi-Threading", "description": "Beziehungsaufbau zu mehreren Stakeholdern"},
      {"id": "renewal_expansion", "label": "Renewal-Risk & Expansion", "description": "Kundenbindung und Upselling-Erfolg"}
    ],
    "evidenceHints": ["Account-Plans", "Stakeholder-Maps", "CS-Feedback", "Renewal-Rates"]
  },
  {
    "id": "collaboration",
    "title": "Zusammenarbeit & Hygiene",
    "weight": 10,
    "criteria": [
      {"id": "crm_hygiene", "label": "CRM-Sauberkeit & Prozesstreue", "description": "Datenqualität und Prozessbefolgung"},
      {"id": "handoffs", "label": "Übergaben an CS/Support", "description": "Qualität der Kundenübergaben"}
    ],
    "evidenceHints": ["CRM-Audit", "Handoff-Quality", "Process-Compliance"]
  },
  {
    "id": "development",
    "title": "Enablement & Learning",
    "weight": 10,
    "criteria": [
      {"id": "skills", "label": "Produktwissen & Sales Skills", "description": "Kontinuierliche Weiterentwicklung der Verkaufsfähigkeiten"}
    ],
    "evidenceHints": ["Training-Completion", "Certification", "Skill-Assessments"]
  }
]'::jsonb,
ARRAY['Konsistent >110% Quota', 'Coacht andere AEs', 'Expansion in Key Accounts'],
ARRAY['Sandbagging', 'Schwache Datenqualität', 'Hohe Churn-Quote in Deals', 'Schlechte Pipeline-Hygiene'],
ARRAY['CRM-Reports', 'Forecast-vs-Ist', 'CS-Feedback', 'Win-Loss-Analysis'], true),

-- 5. Sales SDR/BDR
('Sales - SDR/BDR v1', 'Template für Sales Development Representatives', 'Sales',
'[
  {
    "id": "pipeline_gen",
    "title": "Pipeline-Generierung",
    "weight": 45,
    "criteria": [
      {"id": "sqls", "label": "SQLs & Meeting-Qualität", "description": "Anzahl und Qualität qualifizierter Leads"},
      {"id": "conversion", "label": "Lead-to-Meeting Conversion", "description": "Effizienz bei der Meeting-Generierung"}
    ],
    "evidenceHints": ["Pipeline-Reports", "SQL-Quality-Scores", "AE-Feedback"]
  },
  {
    "id": "activity_quality",
    "title": "Aktivitätsqualität",
    "weight": 25,
    "criteria": [
      {"id": "personalization", "label": "Personalisierung & Message Quality", "description": "Qualität der Outreach-Kommunikation"},
      {"id": "response_rates", "label": "Reply-Rate & Engagement", "description": "Erfolgsquoten bei der Kontaktaufnahme"}
    ],
    "evidenceHints": ["Email-Analytics", "Response-Rates", "Message-Reviews"]
  },
  {
    "id": "playbook",
    "title": "Playbook-Disziplin",
    "weight": 20,
    "criteria": [
      {"id": "process", "label": "Prozessbefolgung & Tools", "description": "Einhaltung der SDR-Prozesse und Tool-Nutzung"}
    ],
    "evidenceHints": ["Process-Audits", "Tool-Usage", "Activity-Metrics"]
  },
  {
    "id": "teamwork",
    "title": "Teamspiel & Übergaben",
    "weight": 10,
    "criteria": [
      {"id": "handoffs", "label": "AE-Handoffs & Communication", "description": "Qualität der Lead-Übergaben an AEs"}
    ],
    "evidenceHints": ["Handoff-Quality", "AE-Feedback", "Meeting-Show-Rates"]
  }
]'::jsonb,
ARRAY['Konstant über Target bei SQLs', 'Hohe Conversion-Raten', 'Excellent AE Partnership'],
ARRAY['Quantity over Quality', 'Schlechte Handoff-Quality', 'Niedrige Response-Rates'],
ARRAY['Outreach-KPIs', 'Conversion-Raten', 'AE-Feedback', 'Pipeline-Attribution'], true);

-- Add more templates for remaining roles
INSERT INTO public.performance_templates (name, description, role_category, sections, promotion_signals, red_flags, evidence_types, is_system_template) VALUES

-- 6. Customer Support
('Customer Support v1', 'Template für Customer Support Representatives', 'Support',
'[
  {
    "id": "resolution",
    "title": "Lösungsquote & Zeit",
    "weight": 35,
    "criteria": [
      {"id": "fcr", "label": "First Call Resolution Rate", "description": "Probleme beim ersten Kontakt lösen"},
      {"id": "response_time", "label": "Time-to-Resolve & SLA", "description": "Schnelligkeit der Problemlösung"}
    ],
    "evidenceHints": ["Ticket-Metrics", "SLA-Reports", "Resolution-Analytics"]
  },
  {
    "id": "quality",
    "title": "Qualität",
    "weight": 25,
    "criteria": [
      {"id": "csat", "label": "CSAT & Customer Feedback", "description": "Kundenzufriedenheit und Feedback-Scores"},
      {"id": "knowledge", "label": "QA-Scores & KB-Beiträge", "description": "Qualitätssicherung und Wissensbeiträge"}
    ],
    "evidenceHints": ["CSAT-Surveys", "QA-Audits", "KB-Articles", "Customer-Feedback"]
  },
  {
    "id": "process",
    "title": "Prozessdisziplin",
    "weight": 20,
    "criteria": [
      {"id": "sla", "label": "SLA-Einhaltung & Dokumentation", "description": "Einhaltung von Service-Level-Agreements"},
      {"id": "escalation", "label": "Escalation Management", "description": "Angemessenes Weiterleiten komplexer Fälle"}
    ],
    "evidenceHints": ["SLA-Compliance", "Ticket-Documentation", "Escalation-Rates"]
  },
  {
    "id": "collaboration",
    "title": "Zusammenarbeit & Empathie",
    "weight": 20,
    "criteria": [
      {"id": "teamwork", "label": "Team-Support & Knowledge Sharing", "description": "Unterstützung von Kollegen und Wissensteilung"},
      {"id": "empathy", "label": "Customer Empathy & Communication", "description": "Einfühlsame Kundenkommunikation"}
    ],
    "evidenceHints": ["Peer-Feedback", "Communication-Reviews", "Team-Contributions"]
  }
]'::jsonb,
ARRAY['Konstant hohe CSAT-Scores', 'Proaktive KB-Beiträge', 'Mentoring neuer Teammitglieder'],
ARRAY['Niedrige FCR', 'SLA-Verletzungen', 'Schlechte Dokumentation', 'Eskalations-Vermeidung'],
ARRAY['Ticket-System', 'QA-Audits', 'CSAT-Surveys', 'KB-Analytics'], true),

-- 7. Marketing
('Marketing - Growth/Performance v1', 'Template für Marketing Manager (Growth, Content, Performance)', 'Marketing',
'[
  {
    "id": "kpis",
    "title": "Ziel-KPIs",
    "weight": 35,
    "criteria": [
      {"id": "pipeline", "label": "Pipeline-Anteil & Attribution", "description": "Beitrag zur Sales-Pipeline"},
      {"id": "conversion", "label": "MQL→SQL & Lead Quality", "description": "Lead-Qualität und Konversionsraten"},
      {"id": "efficiency", "label": "CAC/ROAS & Budget-Effizienz", "description": "Kosten-Effizienz der Marketing-Aktivitäten"}
    ],
    "evidenceHints": ["Attribution-Reports", "Pipeline-Analytics", "ROI-Analysis"]
  },
  {
    "id": "campaigns",
    "title": "Kampagnen-Exzellenz",
    "weight": 25,
    "criteria": [
      {"id": "creative", "label": "Kreativ-Qualität & Testing", "description": "Qualität und Testung von Marketing-Materialien"},
      {"id": "optimization", "label": "Landing-Pages & Conversion-Optimization", "description": "Optimierung der Customer Journey"}
    ],
    "evidenceHints": ["A/B-Test-Results", "Creative-Performance", "Landing-Page-Analytics"]
  },
  {
    "id": "operations",
    "title": "Kanal-Ops & Daten",
    "weight": 20,
    "criteria": [
      {"id": "attribution", "label": "Attribution & Tracking-Qualität", "description": "Saubere Datenerfassung und Attribution"},
      {"id": "reporting", "label": "Reporting & Data Hygiene", "description": "Qualität der Datenanalyse und Berichterstattung"}
    ],
    "evidenceHints": ["Attribution-Setup", "Data-Quality-Reports", "Tracking-Audits"]
  },
  {
    "id": "collaboration",
    "title": "Sales/Product Collaboration",
    "weight": 20,
    "criteria": [
      {"id": "alignment", "label": "SLA-Erfüllung & Enablement", "description": "Unterstützung von Sales und Product Teams"}
    ],
    "evidenceHints": ["SLA-Reports", "Sales-Feedback", "Enablement-Materials"]
  }
]'::jsonb,
ARRAY['Konstant starke Pipeline-Attribution', 'Innovative Campaign-Erfolge', 'Excellent Cross-Team Collaboration'],
ARRAY['Schlechte Attribution-Hygiene', 'Niedrige Conversion-Raten', 'Mangelhafte Sales-Alignment'],
ARRAY['Attribution-Analytics', 'A/B-Tests', 'Pipeline-Reports', 'ROI-Analysis'], true);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_performance_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_performance_templates_updated_at
  BEFORE UPDATE ON public.performance_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_performance_templates_updated_at();