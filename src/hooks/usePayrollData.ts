import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Payslip {
  id: string;
  user_id: string;
  year: number;
  month: number;
  gross_salary: number;
  net_salary: number;
  base_salary: number;
  status: 'draft' | 'pending' | 'approved' | 'archived' | 'deleted';
  document_path?: string;
  created_at: string;
  contract_type?: string;
  working_hours_per_month?: number;
  calculation_details?: Record<string, any>;
}

export interface SalaryBenefit {
  id: string;
  user_id: string;
  benefit_type: string;
  name: string;
  description?: string;
  monetary_value: number;
  currency: string;
  start_date: string;
  end_date?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface EmployeeContract {
  id: string;
  user_id: string;
  contract_type: string;
  base_salary?: number;
  hourly_rate?: number;
  working_hours_per_week?: number;
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
  created_at: string;
}

export interface PayrollStats {
  totalGrossSalary: number;
  totalNetSalary: number;
  totalBenefits: number;
  avgMonthlySalary: number;
}

export const usePayrollData = () => {
  // Payslips Query
  const { data: payslips, isLoading: payslipsLoading } = useQuery({
    queryKey: ['payslips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payslips')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data as Payslip[];
    },
  });

  // Benefits Query
  const { data: benefits, isLoading: benefitsLoading } = useQuery({
    queryKey: ['salary_benefits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_benefits')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SalaryBenefit[];
    },
  });

  // Employee Contracts Query
  const { data: contracts, isLoading: contractsLoading } = useQuery({
    queryKey: ['employee_contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_contracts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmployeeContract[];
    },
  });

  // Calculate Statistics
  const stats: PayrollStats = {
    totalGrossSalary: payslips?.reduce((sum, p) => sum + p.gross_salary, 0) || 0,
    totalNetSalary: payslips?.reduce((sum, p) => sum + p.net_salary, 0) || 0,
    totalBenefits: benefits?.reduce((sum, b) => sum + b.monetary_value, 0) || 0,
    avgMonthlySalary: payslips?.length ? 
      (payslips.reduce((sum, p) => sum + p.gross_salary, 0) / payslips.length) : 0,
  };

  // Current month salary
  const currentDate = new Date();
  const currentPayslip = payslips?.find(p => 
    p.year === currentDate.getFullYear() && 
    p.month === currentDate.getMonth() + 1
  );

  return {
    payslips,
    benefits,
    contracts,
    currentPayslip,
    stats,
    isLoading: payslipsLoading || benefitsLoading || contractsLoading,
  };
};

export const useCreatePayslip = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payslipData: Partial<Payslip>) => {
      const { data, error } = await supabase
        .from('payslips')
        .insert(payslipData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
      toast({
        title: "Erfolg",
        description: "Gehaltsabrechnung wurde erstellt.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: `Fehler beim Erstellen der Gehaltsabrechnung: ${error.message}`,
      });
    },
  });
};

export const useUpdatePayslip = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Payslip> }) => {
      const { data, error } = await supabase
        .from('payslips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
      toast({
        title: "Erfolg",
        description: "Gehaltsabrechnung wurde aktualisiert.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: `Fehler beim Aktualisieren der Gehaltsabrechnung: ${error.message}`,
      });
    },
  });
};