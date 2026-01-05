-- Trigger für automatische Erstellung von Map Pins
CREATE OR REPLACE FUNCTION create_travel_map_pin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    INSERT INTO public.travel_map_pins (
      travel_request_id,
      destination,
      employee_name,
      travel_dates,
      status,
      risk_level
    ) VALUES (
      NEW.id,
      NEW.destination,
      COALESCE(NEW.employee_name, 'Unbekannt'),
      NEW.start_date::text || ' - ' || NEW.end_date::text,
      NEW.status,
      CASE 
        WHEN NEW.risk_score > 7 THEN 'high'
        WHEN NEW.risk_score > 4 THEN 'medium'
        ELSE 'low'
      END
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_map_pin_on_approval
  AFTER UPDATE ON public.business_travel_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_travel_map_pin();

-- Trigger für Updated_at
CREATE OR REPLACE FUNCTION update_travel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_travel_requests_updated_at
  BEFORE UPDATE ON public.business_travel_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_updated_at();

CREATE TRIGGER update_travel_approvals_updated_at
  BEFORE UPDATE ON public.travel_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_updated_at();

-- Sample Data für Policies
INSERT INTO public.travel_policies (name, description, cost_threshold, approval_steps) VALUES
('Standard Domestic Travel', 'Inlandsreisen bis 1000€', 1000, '[
  {"step": 1, "role": "manager", "required": true},
  {"step": 2, "role": "hr", "required": false}
]'),
('International Travel', 'Auslandsreisen über 1000€', 1000, '[
  {"step": 1, "role": "manager", "required": true},
  {"step": 2, "role": "finance", "required": true},
  {"step": 3, "role": "travel_admin", "required": true}
]'),
('High-Cost Travel', 'Reisen über 5000€', 5000, '[
  {"step": 1, "role": "manager", "required": true},
  {"step": 2, "role": "finance", "required": true},
  {"step": 3, "role": "cfo", "required": true}
]');

-- Enable Realtime
ALTER TABLE public.business_travel_requests REPLICA IDENTITY FULL;
ALTER TABLE public.travel_approvals REPLICA IDENTITY FULL;
ALTER TABLE public.travel_map_pins REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_travel_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_map_pins;