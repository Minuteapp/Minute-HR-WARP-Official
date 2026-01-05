import { useQuery } from "@tanstack/react-query";
import { supabase } from "../client";

export interface BenefitAllowance {
  id: string;
  employee_id: string;
  type: string;
  name: string;
  amount: number;
  frequency: string;
  description: string | null;
  valid_from: string | null;
  valid_until: string | null;
  status: string;
  created_at: string;
}

export interface ChildcareBenefit {
  id: string;
  employee_id: string;
  monthly_allowance: number;
  facility_name: string | null;
  facility_type: string | null;
  child_name: string | null;
  child_birth_date: string | null;
  num_children: number;
  approved_since: string | null;
  approved_until: string | null;
  status: string;
}

export interface FitnessMembership {
  id: string;
  employee_id: string;
  provider: string;
  membership_type: string | null;
  membership_id: string | null;
  employer_contribution: number;
  employee_contribution: number;
  valid_from: string | null;
  valid_until: string | null;
  check_ins_count: number;
  last_check_in: string | null;
  status: string;
}

export interface DiscountUsage {
  id: string;
  employee_id: string;
  discount_level: number;
  year_total: number;
  year_savings: number;
  last_order_date: string | null;
  last_order_number: string | null;
  eligible_family_members: number;
}

export interface VLContract {
  id: string;
  employee_id: string;
  contract_type: string | null;
  provider: string | null;
  contract_number: string | null;
  monthly_employer: number;
  monthly_employee: number;
  contract_start: string | null;
  contract_end: string | null;
  contract_duration: number | null;
  total_accumulated: number;
  eligible_for_bonus: boolean;
  status: string;
  notes: string | null;
}

export interface EmployeeBenefit {
  id: string;
  employee_id: string;
  template_id: string | null;
  amount: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  custom_settings: Record<string, unknown>;
  approved_by: string | null;
  approved_at: string | null;
  template?: {
    id: string;
    name: string;
    type: string;
    category: string | null;
    description: string | null;
    tax_treatment: string | null;
  };
}

export interface EmployeeBenefitsData {
  allowances: BenefitAllowance[];
  childcare: ChildcareBenefit | null;
  fitness: FitnessMembership | null;
  discounts: DiscountUsage | null;
  vl: VLContract | null;
  benefits: EmployeeBenefit[];
}

export const useEmployeeBenefitsData = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ["employee-benefits", employeeId],
    queryFn: async (): Promise<EmployeeBenefitsData> => {
      if (!employeeId) throw new Error("Employee ID required");

      const [allowances, childcare, fitness, discounts, vl, benefits] = await Promise.all([
        supabase
          .from("employee_benefit_allowances")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("status", "active")
          .order("created_at", { ascending: false }),

        supabase
          .from("employee_childcare_benefits")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("status", "active")
          .maybeSingle(),

        supabase
          .from("employee_fitness_memberships")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("status", "active")
          .maybeSingle(),

        supabase
          .from("employee_discount_usage")
          .select("*")
          .eq("employee_id", employeeId)
          .maybeSingle(),

        supabase
          .from("employee_vl_contracts")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("status", "active")
          .maybeSingle(),

        supabase
          .from("employee_benefits")
          .select(`
            *,
            template:benefit_templates(id, name, type, category, description, tax_treatment)
          `)
          .eq("employee_id", employeeId)
          .eq("status", "active")
          .order("created_at", { ascending: false }),
      ]);

      if (allowances.error) throw allowances.error;
      if (childcare.error) throw childcare.error;
      if (fitness.error) throw fitness.error;
      if (discounts.error) throw discounts.error;
      if (vl.error) throw vl.error;
      if (benefits.error) throw benefits.error;

      return {
        allowances: (allowances.data || []) as BenefitAllowance[],
        childcare: childcare.data as ChildcareBenefit | null,
        fitness: fitness.data as FitnessMembership | null,
        discounts: discounts.data as DiscountUsage | null,
        vl: vl.data as VLContract | null,
        benefits: (benefits.data || []) as EmployeeBenefit[],
      };
    },
    enabled: !!employeeId,
  });
};

export const useBenefitTemplates = () => {
  return useQuery({
    queryKey: ["benefit-templates-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("benefit_templates")
        .select("*")
        .eq("is_active", true)
        .order("type")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};
