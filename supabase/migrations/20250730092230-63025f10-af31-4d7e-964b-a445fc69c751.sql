-- Erweitere innovation_ideas_inbox um KI-Analyse Felder
ALTER TABLE public.innovation_ideas_inbox 
ADD COLUMN IF NOT EXISTS ai_analysis_result jsonb,
ADD COLUMN IF NOT EXISTS ai_innovation_score integer,
ADD COLUMN IF NOT EXISTS ai_feasibility_score integer,
ADD COLUMN IF NOT EXISTS ai_impact_score integer,
ADD COLUMN IF NOT EXISTS ai_risk_score integer,
ADD COLUMN IF NOT EXISTS ai_confidence_level numeric,
ADD COLUMN IF NOT EXISTS ai_recommendation text,
ADD COLUMN IF NOT EXISTS ai_pros text[],
ADD COLUMN IF NOT EXISTS ai_cons text[],
ADD COLUMN IF NOT EXISTS ai_opportunities text[],
ADD COLUMN IF NOT EXISTS ai_benefits text[];

-- Erweitere auch die Haupt-Ideen Tabelle
ALTER TABLE public.innovation_ideas 
ADD COLUMN IF NOT EXISTS ai_analysis_result jsonb,
ADD COLUMN IF NOT EXISTS ai_innovation_score integer,
ADD COLUMN IF NOT EXISTS ai_feasibility_score integer,
ADD COLUMN IF NOT EXISTS ai_impact_score integer,
ADD COLUMN IF NOT EXISTS ai_risk_score integer,
ADD COLUMN IF NOT EXISTS ai_confidence_level numeric,
ADD COLUMN IF NOT EXISTS ai_recommendation text,
ADD COLUMN IF NOT EXISTS ai_pros text[],
ADD COLUMN IF NOT EXISTS ai_cons text[],
ADD COLUMN IF NOT EXISTS ai_opportunities text[],
ADD COLUMN IF NOT EXISTS ai_benefits text[];

-- Migriere bestehende Daten aus innovation_ai_analysis in die Ideen-Tabellen
UPDATE public.innovation_ideas_inbox 
SET 
  ai_analysis_result = analysis.analysis_result,
  ai_innovation_score = analysis.innovation_score,
  ai_feasibility_score = analysis.feasibility_score,
  ai_impact_score = analysis.impact_score,
  ai_risk_score = analysis.risk_score,
  ai_confidence_level = analysis.confidence_level,
  ai_recommendation = analysis.recommendation,
  ai_pros = analysis.pros,
  ai_cons = analysis.cons,
  ai_opportunities = analysis.opportunities,
  ai_benefits = analysis.benefits
FROM public.innovation_ai_analysis analysis
WHERE analysis.idea_id = innovation_ideas_inbox.id;

-- Aktualisiere auch die Haupt-Ideen Tabelle für Ideen die schon verschoben wurden
UPDATE public.innovation_ideas 
SET 
  ai_analysis_result = analysis.analysis_result,
  ai_innovation_score = analysis.innovation_score,
  ai_feasibility_score = analysis.feasibility_score,
  ai_impact_score = analysis.impact_score,
  ai_risk_score = analysis.risk_score,
  ai_confidence_level = analysis.confidence_level,
  ai_recommendation = analysis.recommendation,
  ai_pros = analysis.pros,
  ai_cons = analysis.cons,
  ai_opportunities = analysis.opportunities,
  ai_benefits = analysis.benefits
FROM public.innovation_ai_analysis analysis
WHERE analysis.idea_id = innovation_ideas.id;