-- Nur cost_entries und risks erstellen (documents existiert bereits)
CREATE TABLE IF NOT EXISTS public.global_mobility_cost_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.global_mobility_requests(id) ON DELETE CASCADE,
  employee_name text NOT NULL,
  category text NOT NULL,
  description text,
  budget_amount decimal(12,2),
  actual_amount decimal(12,2),
  cost_center text,
  status text DEFAULT 'planned',
  company_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.global_mobility_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.global_mobility_requests(id) ON DELETE CASCADE,
  employee_name text NOT NULL,
  category text NOT NULL,
  risk_description text NOT NULL,
  risk_level text NOT NULL,
  deadline date,
  responsible_person text,
  status text DEFAULT 'open',
  company_id uuid,
  created_at timestamptz DEFAULT now()
);

-- RLS für cost_entries
ALTER TABLE public.global_mobility_cost_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view cost entries" ON public.global_mobility_cost_entries;
DROP POLICY IF EXISTS "Users can insert cost entries" ON public.global_mobility_cost_entries;
DROP POLICY IF EXISTS "Users can update cost entries" ON public.global_mobility_cost_entries;
DROP POLICY IF EXISTS "Users can delete cost entries" ON public.global_mobility_cost_entries;
CREATE POLICY "Users can view cost entries" ON public.global_mobility_cost_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert cost entries" ON public.global_mobility_cost_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update cost entries" ON public.global_mobility_cost_entries FOR UPDATE USING (true);
CREATE POLICY "Users can delete cost entries" ON public.global_mobility_cost_entries FOR DELETE USING (true);

-- RLS für risks
ALTER TABLE public.global_mobility_risks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view risks" ON public.global_mobility_risks;
DROP POLICY IF EXISTS "Users can insert risks" ON public.global_mobility_risks;
DROP POLICY IF EXISTS "Users can update risks" ON public.global_mobility_risks;
DROP POLICY IF EXISTS "Users can delete risks" ON public.global_mobility_risks;
CREATE POLICY "Users can view risks" ON public.global_mobility_risks FOR SELECT USING (true);
CREATE POLICY "Users can insert risks" ON public.global_mobility_risks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update risks" ON public.global_mobility_risks FOR UPDATE USING (true);
CREATE POLICY "Users can delete risks" ON public.global_mobility_risks FOR DELETE USING (true);