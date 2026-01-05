-- Erstelle das Belohnungen & Goodies Modul

-- Enum für Goodie-Typen
CREATE TYPE public.goodie_type AS ENUM (
  'amazon_voucher',
  'zalando_voucher', 
  'extra_vacation_day',
  'half_day_off',
  'meal_voucher',
  'cash_bonus',
  'donation_option',
  'physical_goodie',
  'custom'
);

-- Enum für Trigger-Typen
CREATE TYPE public.reward_trigger_type AS ENUM (
  'project_completion',
  'goal_achievement', 
  'performance_score',
  'anniversary',
  'birthday',
  'innovation_idea',
  'peer_nomination',
  'custom_event'
);

-- Enum für Kampagnen-Status
CREATE TYPE public.campaign_status AS ENUM (
  'draft',
  'active',
  'paused',
  'completed',
  'cancelled'
);

-- Haupttabelle für Belohnungskampagnen
CREATE TABLE IF NOT EXISTS public.reward_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'standard',
  trigger_type public.reward_trigger_type NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  goodie_type public.goodie_type NOT NULL,
  goodie_value NUMERIC NOT NULL DEFAULT 0,
  goodie_description TEXT,
  max_budget NUMERIC DEFAULT NULL,
  used_budget NUMERIC DEFAULT 0,
  max_participants INTEGER DEFAULT NULL,
  current_participants INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status public.campaign_status DEFAULT 'draft',
  auto_approval BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Tabelle für Belohnungs-Instanzen (tatsächlich vergebene Belohnungen)
CREATE TABLE IF NOT EXISTS public.reward_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.reward_campaigns(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  employee_name TEXT,
  goodie_type public.goodie_type NOT NULL,
  goodie_value NUMERIC NOT NULL,
  goodie_description TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, redeemed, expired
  trigger_data JSONB DEFAULT '{}',
  approval_required BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  voucher_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Tabelle für Reward Templates
CREATE TABLE IF NOT EXISTS public.reward_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  trigger_type public.reward_trigger_type NOT NULL,
  default_conditions JSONB NOT NULL DEFAULT '{}',
  default_goodie_type public.goodie_type NOT NULL,
  default_goodie_value NUMERIC DEFAULT 0,
  suggested_budget NUMERIC DEFAULT NULL,
  is_system_template BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Peer-to-Peer Belohnungen
CREATE TABLE IF NOT EXISTS public.peer_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nominator_id UUID NOT NULL,
  nominee_id UUID NOT NULL,
  reason TEXT NOT NULL,
  points_awarded INTEGER DEFAULT 1,
  campaign_id UUID REFERENCES public.reward_campaigns(id),
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Budget-Tracking
CREATE TABLE IF NOT EXISTS public.reward_budget_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.reward_campaigns(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  allocated_budget NUMERIC NOT NULL DEFAULT 0,
  used_budget NUMERIC DEFAULT 0,
  forecasted_usage NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erstelle Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_reward_campaigns_status ON public.reward_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_reward_campaigns_trigger_type ON public.reward_campaigns(trigger_type);
CREATE INDEX IF NOT EXISTS idx_reward_instances_employee_id ON public.reward_instances(employee_id);
CREATE INDEX IF NOT EXISTS idx_reward_instances_status ON public.reward_instances(status);
CREATE INDEX IF NOT EXISTS idx_reward_instances_campaign_id ON public.reward_instances(campaign_id);
CREATE INDEX IF NOT EXISTS idx_peer_rewards_nominee_id ON public.peer_rewards(nominee_id);

-- RLS Policies
ALTER TABLE public.reward_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_budget_tracking ENABLE ROW LEVEL SECURITY;

-- Admins können alles verwalten
CREATE POLICY "Admins can manage all rewards" ON public.reward_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can manage all reward instances" ON public.reward_instances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Mitarbeiter können ihre eigenen Belohnungen sehen
CREATE POLICY "Users can view their own rewards" ON public.reward_instances
  FOR SELECT USING (employee_id = auth.uid());

-- Mitarbeiter können aktive Kampagnen sehen
CREATE POLICY "Users can view active campaigns" ON public.reward_campaigns
  FOR SELECT USING (status = 'active');

-- Templates können von allen eingesehen werden
CREATE POLICY "Everyone can view templates" ON public.reward_templates
  FOR SELECT USING (true);

-- Admins können Templates verwalten
CREATE POLICY "Admins can manage templates" ON public.reward_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Peer Rewards Policies
CREATE POLICY "Users can create peer rewards" ON public.peer_rewards
  FOR INSERT WITH CHECK (nominator_id = auth.uid());

CREATE POLICY "Users can view peer rewards they're involved in" ON public.peer_rewards
  FOR SELECT USING (nominator_id = auth.uid() OR nominee_id = auth.uid());

-- Budget Tracking nur für Admins
CREATE POLICY "Admins can manage budget tracking" ON public.reward_budget_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reward_campaigns_updated_at
    BEFORE UPDATE ON public.reward_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reward_instances_updated_at
    BEFORE UPDATE ON public.reward_instances
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Füge die Standard-Templates ein
INSERT INTO public.reward_templates (name, description, category, trigger_type, default_conditions, default_goodie_type, default_goodie_value, suggested_budget, is_system_template) VALUES
('Projekt-Meilenstein Bonus', 'Belohnung bei Projektabschluss über definiertem Wert', 'projects', 'project_completion', '{"min_project_value": 100000, "currency": "EUR"}', 'amazon_voucher', 50, 10000, true),
('Teamziel Sprint Challenge', 'Belohnung bei 90% Zielerreichung aller Team-OKRs', 'goals', 'goal_achievement', '{"achievement_percentage": 90, "team_based": true}', 'extra_vacation_day', 1, 5000, true),
('Performance Champion', 'Top 5% Performer erhalten Bonus', 'performance', 'performance_score', '{"top_percentage": 5, "evaluation_period": "yearly"}', 'cash_bonus', 200, 20000, true),
('Innovations-Boost', 'Belohnung für umgesetzte Innovationsideen', 'innovation', 'innovation_idea', '{"idea_status": "implemented"}', 'extra_vacation_day', 0.5, 3000, true),
('Green Bonus', 'Belohnung für nachhaltiges Verhalten', 'sustainability', 'custom_event', '{"co2_reduction": 5, "period": "quarterly"}', 'donation_option', 100, 5000, true),
('Geburtstags-Goodie', 'Automatische Belohnung zum Geburtstag', 'personal', 'birthday', '{"auto_trigger": true}', 'meal_voucher', 25, 2000, true),
('Firmenjubiläum', 'Belohnung bei Firmenjubiläen', 'personal', 'anniversary', '{"years": [1, 5, 10, 15, 20, 25]}', 'amazon_voucher', 50, 15000, true);