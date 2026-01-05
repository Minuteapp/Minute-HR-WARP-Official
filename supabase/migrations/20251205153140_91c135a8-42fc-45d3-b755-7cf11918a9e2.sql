-- =============================================
-- Phase 1: Trigger für Pulse Surveys Modul
-- =============================================

-- Trigger-Funktion: Kopiere Fragen aus Template bei Survey-Erstellung
CREATE OR REPLACE FUNCTION public.copy_template_questions_to_survey()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  template_question RECORD;
  question_count INT := 0;
BEGIN
  -- Nur wenn template_id gesetzt ist
  IF NEW.template_id IS NOT NULL THEN
    FOR template_question IN 
      SELECT * FROM pulse_survey_template_questions 
      WHERE template_id = NEW.template_id
      ORDER BY order_index
    LOOP
      INSERT INTO pulse_survey_questions (
        survey_id,
        question_text,
        question_type,
        category,
        order_index,
        is_required,
        options,
        tenant_id
      ) VALUES (
        NEW.id,
        template_question.question_text,
        template_question.question_type,
        template_question.category,
        template_question.order_index,
        COALESCE(template_question.is_required, true),
        template_question.options,
        NEW.tenant_id
      );
      question_count := question_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Copied % questions from template % to survey %', question_count, NEW.template_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger erstellen
DROP TRIGGER IF EXISTS trigger_copy_template_questions ON pulse_surveys;
CREATE TRIGGER trigger_copy_template_questions
  AFTER INSERT ON pulse_surveys
  FOR EACH ROW
  EXECUTE FUNCTION copy_template_questions_to_survey();

-- Trigger-Funktion: Analytics aktualisieren nach Response
CREATE OR REPLACE FUNCTION public.update_pulse_analytics_on_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_survey RECORD;
  v_total_responses INT;
  v_avg_score DECIMAL(5,2);
  v_participation_rate DECIMAL(5,2);
  v_total_employees INT;
BEGIN
  -- Hole Survey-Daten
  SELECT * INTO v_survey FROM pulse_surveys WHERE id = NEW.survey_id;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Zähle Responses für diese Survey
  SELECT COUNT(DISTINCT respondent_id) INTO v_total_responses
  FROM pulse_survey_responses
  WHERE survey_id = NEW.survey_id;
  
  -- Berechne Durchschnittsscore (für numerische Antworten)
  SELECT COALESCE(AVG(
    CASE 
      WHEN answer_value ~ '^[0-9]+(\.[0-9]+)?$' THEN answer_value::DECIMAL
      ELSE NULL
    END
  ), 0) INTO v_avg_score
  FROM pulse_survey_responses
  WHERE survey_id = NEW.survey_id;
  
  -- Hole Gesamtmitarbeiter für Tenant
  SELECT COUNT(*) INTO v_total_employees
  FROM employees
  WHERE company_id IN (
    SELECT company_id FROM user_roles WHERE tenant_id = v_survey.tenant_id LIMIT 1
  ) AND status = 'active';
  
  -- Berechne Participation Rate
  IF v_total_employees > 0 THEN
    v_participation_rate := (v_total_responses::DECIMAL / v_total_employees::DECIMAL) * 100;
  ELSE
    v_participation_rate := 0;
  END IF;
  
  -- Update oder Insert Analytics
  INSERT INTO pulse_survey_analytics (
    survey_id,
    tenant_id,
    engagement_score,
    participation_rate,
    response_count,
    calculated_at
  ) VALUES (
    NEW.survey_id,
    v_survey.tenant_id,
    v_avg_score,
    v_participation_rate,
    v_total_responses,
    NOW()
  )
  ON CONFLICT (survey_id) 
  DO UPDATE SET
    engagement_score = EXCLUDED.engagement_score,
    participation_rate = EXCLUDED.participation_rate,
    response_count = EXCLUDED.response_count,
    calculated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Trigger erstellen
DROP TRIGGER IF EXISTS trigger_update_analytics_on_response ON pulse_survey_responses;
CREATE TRIGGER trigger_update_analytics_on_response
  AFTER INSERT ON pulse_survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_pulse_analytics_on_response();

-- Trigger-Funktion: Benachrichtigung bei Survey-Start
CREATE OR REPLACE FUNCTION public.notify_employees_on_survey_start()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Nur wenn Status von draft auf active wechselt
  IF OLD.status = 'draft' AND NEW.status = 'active' THEN
    -- Erstelle Benachrichtigungen für alle Mitarbeiter des Tenants
    INSERT INTO unified_notifications (
      user_id,
      source_module,
      source_id,
      source_table,
      notification_type,
      title,
      message,
      priority,
      action_url,
      metadata
    )
    SELECT 
      ur.user_id,
      'pulse_survey',
      NEW.id::TEXT,
      'pulse_surveys',
      'survey_started',
      '📊 Neue Mitarbeiterumfrage',
      'Die Umfrage "' || NEW.title || '" ist jetzt verfügbar. Bitte nehmen Sie teil!',
      'high',
      '/hr/pulse-survey?surveyId=' || NEW.id::TEXT,
      jsonb_build_object(
        'survey_id', NEW.id,
        'survey_title', NEW.title,
        'end_date', NEW.end_date
      )
    FROM user_roles ur
    WHERE ur.tenant_id = NEW.tenant_id
    AND ur.role NOT IN ('superadmin');
    
    RAISE NOTICE 'Notifications created for survey %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger erstellen
DROP TRIGGER IF EXISTS trigger_notify_survey_start ON pulse_surveys;
CREATE TRIGGER trigger_notify_survey_start
  AFTER UPDATE ON pulse_surveys
  FOR EACH ROW
  EXECUTE FUNCTION notify_employees_on_survey_start();

-- Unique constraint für Analytics (falls noch nicht vorhanden)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pulse_survey_analytics_survey_id_key'
  ) THEN
    ALTER TABLE pulse_survey_analytics ADD CONSTRAINT pulse_survey_analytics_survey_id_key UNIQUE (survey_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Funktion zum Berechnen der Gesamt-Analytics für einen Tenant
CREATE OR REPLACE FUNCTION public.calculate_pulse_tenant_analytics(p_tenant_id UUID)
RETURNS TABLE (
  engagement_score DECIMAL,
  participation_rate DECIMAL,
  stress_index DECIMAL,
  satisfaction_score DECIMAL,
  total_responses INT,
  active_surveys INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(psa.engagement_score), 0)::DECIMAL AS engagement_score,
    COALESCE(AVG(psa.participation_rate), 0)::DECIMAL AS participation_rate,
    COALESCE(AVG(psa.psychological_burden_index), 0)::DECIMAL AS stress_index,
    COALESCE(AVG(psa.satisfaction_score), 0)::DECIMAL AS satisfaction_score,
    COALESCE(SUM(psa.response_count), 0)::INT AS total_responses,
    COUNT(DISTINCT ps.id) FILTER (WHERE ps.status = 'active')::INT AS active_surveys
  FROM pulse_surveys ps
  LEFT JOIN pulse_survey_analytics psa ON ps.id = psa.survey_id
  WHERE ps.tenant_id = p_tenant_id;
END;
$$;