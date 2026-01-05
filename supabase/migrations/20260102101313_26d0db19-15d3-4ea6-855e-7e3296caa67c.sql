-- Subscription Plans Tabelle
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_users INTEGER,
  max_storage_gb INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Company Subscriptions Tabelle
CREATE TABLE public.company_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  billing_interval TEXT DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly')),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- RLS aktivieren
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscription Plans sind öffentlich lesbar (für Landing Page)
CREATE POLICY "Subscription plans are publicly readable"
  ON public.subscription_plans
  FOR SELECT
  USING (is_active = true);

-- Super Admins können alle Plans verwalten
CREATE POLICY "Super admins can manage subscription plans"
  ON public.subscription_plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.user_id = auth.uid()
      AND employees.role = 'super_admin'
    )
  );

-- Company Subscriptions nur für eigene Company
CREATE POLICY "Users can view own company subscription"
  ON public.company_subscriptions
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage company subscriptions"
  ON public.company_subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.user_id = auth.uid()
      AND employees.role IN ('admin', 'super_admin')
      AND employees.company_id = company_subscriptions.company_id
    )
  );

-- Standard-Pläne einfügen
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, max_users, features, is_popular, sort_order) VALUES
(
  'Basic',
  'basic',
  'Perfekt für kleine Teams',
  29.00,
  290.00,
  10,
  '["Zeiterfassung", "Abwesenheitsverwaltung", "Mitarbeiterverwaltung (bis 10)", "E-Mail Support"]'::jsonb,
  false,
  1
),
(
  'Pro',
  'pro',
  'Für wachsende Unternehmen',
  79.00,
  790.00,
  50,
  '["Alle Basic-Features", "Recruiting & Bewerbermanagement", "Performance Management", "Digitale Personalakte", "Lohnabrechnung-Export", "Prioritäts-Support"]'::jsonb,
  true,
  2
),
(
  'Enterprise',
  'enterprise',
  'Für große Organisationen',
  199.00,
  1990.00,
  null,
  '["Alle Pro-Features", "Unbegrenzte Mitarbeiter", "Compliance & Audit-Trail", "Workforce Planning", "API-Zugang", "Dedicated Account Manager", "Custom Integrationen", "SLA-Garantie"]'::jsonb,
  false,
  3
);

-- Trigger für updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_subscriptions_updated_at
  BEFORE UPDATE ON public.company_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();