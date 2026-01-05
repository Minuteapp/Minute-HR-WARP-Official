import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SalaryHistoryEntry {
  id: string;
  employee_id: string;
  gross_salary: number;
  net_salary?: number;
  bonus_amount: number;
  effective_date: string;
  currency: string;
  salary_type: 'monthly' | 'hourly' | 'yearly';
  reason?: string;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BenefitAssignment {
  id: string;
  employee_id: string;
  benefit_name: string;
  benefit_value?: number;
  start_date: string;
  end_date?: string;
  category: 'insurance' | 'pension' | 'car' | 'meal_voucher' | 'transit' | 'gym' | 'phone' | 'laptop' | 'other';
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export const useSalaryHistory = (employeeId: string) => {
  const queryClient = useQueryClient();

  const { data: salaryHistory = [], isLoading } = useQuery({
    queryKey: ['salary-history', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_history')
        .select('*')
        .eq('employee_id', employeeId)
        .order('effective_date', { ascending: false });
      
      if (error) throw error;
      return data as SalaryHistoryEntry[];
    },
    enabled: !!employeeId,
  });

  const { data: benefits = [], isLoading: benefitsLoading } = useQuery({
    queryKey: ['benefits-assignments', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefits_assignments')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as BenefitAssignment[];
    },
    enabled: !!employeeId,
  });

  const addSalaryEntry = useMutation({
    mutationFn: async (entry: Omit<SalaryHistoryEntry, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('salary_history')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-history', employeeId] });
      toast.success('Gehaltsanpassung hinzugefügt');
    },
    onError: (error) => {
      console.error('Error adding salary entry:', error);
      toast.error('Fehler beim Hinzufügen der Gehaltsanpassung');
    },
  });

  const updateSalaryEntry = useMutation({
    mutationFn: async ({ 
      entryId, 
      updates 
    }: { 
      entryId: string; 
      updates: Partial<SalaryHistoryEntry> 
    }) => {
      const { data, error } = await supabase
        .from('salary_history')
        .update(updates)
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-history', employeeId] });
      toast.success('Gehaltsanpassung aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating salary entry:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  const deleteSalaryEntry = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('salary_history')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-history', employeeId] });
      toast.success('Gehaltsanpassung gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting salary entry:', error);
      toast.error('Fehler beim Löschen');
    },
  });

  const addBenefit = useMutation({
    mutationFn: async (benefit: Omit<BenefitAssignment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('benefits_assignments')
        .insert(benefit)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits-assignments', employeeId] });
      toast.success('Benefit hinzugefügt');
    },
    onError: (error) => {
      console.error('Error adding benefit:', error);
      toast.error('Fehler beim Hinzufügen des Benefits');
    },
  });

  const updateBenefit = useMutation({
    mutationFn: async ({ 
      benefitId, 
      updates 
    }: { 
      benefitId: string; 
      updates: Partial<BenefitAssignment> 
    }) => {
      const { data, error } = await supabase
        .from('benefits_assignments')
        .update(updates)
        .eq('id', benefitId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits-assignments', employeeId] });
      toast.success('Benefit aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating benefit:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  const deleteBenefit = useMutation({
    mutationFn: async (benefitId: string) => {
      const { error } = await supabase
        .from('benefits_assignments')
        .delete()
        .eq('id', benefitId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits-assignments', employeeId] });
      toast.success('Benefit gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting benefit:', error);
      toast.error('Fehler beim Löschen');
    },
  });

  const currentSalary = salaryHistory[0];

  return {
    salaryHistory,
    benefits,
    currentSalary,
    isLoading: isLoading || benefitsLoading,
    addSalaryEntry: addSalaryEntry.mutateAsync,
    updateSalaryEntry: updateSalaryEntry.mutateAsync,
    deleteSalaryEntry: deleteSalaryEntry.mutateAsync,
    addBenefit: addBenefit.mutateAsync,
    updateBenefit: updateBenefit.mutateAsync,
    deleteBenefit: deleteBenefit.mutateAsync,
  };
};
