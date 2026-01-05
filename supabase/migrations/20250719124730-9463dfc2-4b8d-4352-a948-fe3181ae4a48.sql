-- Payroll System - Vollständiges Schema

-- Employee Contracts Tabelle für Vertragsdetails
CREATE TABLE public.employee_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'fixed_salary', -- fixed_salary, hourly_wage, freelancer, minijob
  base_salary DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  working_hours_per_month DECIMAL(5,1),
  overtime_rate DECIMAL(10,2),
  night_shift_bonus DECIMAL(5,2), -- percentage
  weekend_bonus DECIMAL(5,2), -- percentage
  holiday_bonus DECIMAL(5,2), -- percentage
  valid_from DATE NOT NULL,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  tax_class TEXT DEFAULT '1',
  health_insurance_rate DECIMAL(5,4) DEFAULT 0.073,
  pension_rate DECIMAL(5,4) DEFAULT 0.093,
  unemployment_rate DECIMAL(5,4) DEFAULT 0.012,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payslips Tabelle für Gehaltsabrechnungen
CREATE TABLE public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  gross_salary DECIMAL(10,2) NOT NULL,
  net_salary DECIMAL(10,2) NOT NULL,
  base_salary DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  bonus_pay DECIMAL(10,2) DEFAULT 0,
  allowances DECIMAL(10,2) DEFAULT 0,
  income_tax DECIMAL(10,2) DEFAULT 0,
  solidarity_tax DECIMAL(10,2) DEFAULT 0,
  church_tax DECIMAL(10,2) DEFAULT 0,
  health_insurance DECIMAL(10,2) DEFAULT 0,
  pension_insurance DECIMAL(10,2) DEFAULT 0,
  unemployment_insurance DECIMAL(10,2) DEFAULT 0,
  total_hours DECIMAL(5,1) DEFAULT 0,
  overtime_hours DECIMAL(5,1) DEFAULT 0,
  vacation_days_taken DECIMAL(3,1) DEFAULT 0,
  sick_days DECIMAL(3,1) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'archived', 'deleted')),
  document_path TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- Benefits Tabelle für Zusatzleistungen
CREATE TABLE public.employee_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  benefit_type TEXT NOT NULL, -- car, insurance, pension, meal_vouchers, etc.
  benefit_name TEXT NOT NULL,
  monetary_value DECIMAL(10,2) DEFAULT 0,
  taxable BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL,
  effective_until DATE,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  provider TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Salary Adjustments Tabelle für Gehaltsanpassungen
CREATE TABLE public.salary_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  adjustment_type TEXT NOT NULL, -- raise, bonus, deduction, allowance
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2),
  reason TEXT NOT NULL,
  effective_from DATE NOT NULL,
  effective_until DATE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies für employee_contracts
CREATE POLICY "Users can view their own contracts"
ON public.employee_contracts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "HR can view all contracts"
ON public.employee_contracts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "HR can manage contracts"
ON public.employee_contracts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

-- RLS Policies für payslips
CREATE POLICY "Users can view their own payslips"
ON public.payslips FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "HR can view all payslips"
ON public.payslips FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "HR can manage payslips"
ON public.payslips FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

-- RLS Policies für employee_benefits
CREATE POLICY "Users can view their own benefits"
ON public.employee_benefits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "HR can view all benefits"
ON public.employee_benefits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "HR can manage benefits"
ON public.employee_benefits FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

-- RLS Policies für salary_adjustments
CREATE POLICY "Users can view their own adjustments"
ON public.salary_adjustments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "HR can view all adjustments"
ON public.salary_adjustments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "HR can manage adjustments"
ON public.salary_adjustments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

-- Trigger für updated_at
CREATE TRIGGER update_employee_contracts_updated_at
BEFORE UPDATE ON public.employee_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();