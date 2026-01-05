import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTenant } from '@/contexts/TenantContext';

export interface ExpenseClaim {
  id: string;
  employee_id: string;
  company_id?: string;
  expense_date: string;
  amount: number;
  currency: string;
  category: 'travel' | 'meal' | 'accommodation' | 'equipment' | 'training' | 'office_supplies' | 'entertainment' | 'other';
  description: string;
  receipt_url?: string;
  project_id?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submitted_date?: string;
  approved_by?: string;
  approval_date?: string;
  rejection_reason?: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

export const useExpenseClaims = (employeeId: string) => {
  const queryClient = useQueryClient();
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expense-claims', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_claims')
        .select('*')
        .eq('employee_id', employeeId)
        .order('expense_date', { ascending: false });
      
      if (error) throw error;
      return data as ExpenseClaim[];
    },
    enabled: !!employeeId,
  });

  const createExpense = useMutation({
    mutationFn: async ({ 
      expense, 
      receiptFile 
    }: { 
      expense: Omit<ExpenseClaim, 'id' | 'created_at' | 'updated_at'>; 
      receiptFile?: File;
    }) => {
      if (!companyId) throw new Error("Company ID fehlt - bitte neu laden");
      
      let receipt_url = expense.receipt_url;

      // Upload receipt if provided
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${employeeId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('expense-receipts')
          .upload(filePath, receiptFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('expense-receipts')
          .getPublicUrl(filePath);

        receipt_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('expense_claims')
        .insert({
          ...expense,
          company_id: companyId,
          receipt_url,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims', employeeId] });
      toast.success('Ausgabe erstellt');
    },
    onError: (error: any) => {
      console.error('Error creating expense:', error);
      toast.error(`Fehler beim Erstellen der Ausgabe: ${error.message}`);
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({ 
      expenseId, 
      updates,
      receiptFile 
    }: { 
      expenseId: string; 
      updates: Partial<ExpenseClaim>;
      receiptFile?: File;
    }) => {
      let receipt_url = updates.receipt_url;

      // Upload new receipt if provided
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${employeeId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('expense-receipts')
          .upload(filePath, receiptFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('expense-receipts')
          .getPublicUrl(filePath);

        receipt_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('expense_claims')
        .update({
          ...updates,
          receipt_url,
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims', employeeId] });
      toast.success('Ausgabe aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating expense:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  const submitExpense = useMutation({
    mutationFn: async (expenseId: string) => {
      const { data, error } = await supabase
        .from('expense_claims')
        .update({
          status: 'submitted',
          submitted_date: new Date().toISOString(),
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims', employeeId] });
      toast.success('Ausgabe eingereicht');
    },
    onError: (error) => {
      console.error('Error submitting expense:', error);
      toast.error('Fehler beim Einreichen');
    },
  });

  const approveExpense = useMutation({
    mutationFn: async (expenseId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('expense_claims')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approval_date: new Date().toISOString(),
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims', employeeId] });
      toast.success('Ausgabe genehmigt');
    },
    onError: (error) => {
      console.error('Error approving expense:', error);
      toast.error('Fehler beim Genehmigen');
    },
  });

  const rejectExpense = useMutation({
    mutationFn: async ({ expenseId, reason }: { expenseId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('expense_claims')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims', employeeId] });
      toast.success('Ausgabe abgelehnt');
    },
    onError: (error) => {
      console.error('Error rejecting expense:', error);
      toast.error('Fehler beim Ablehnen');
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (expenseId: string) => {
      // Get expense to find receipt path
      const { data: expense } = await supabase
        .from('expense_claims')
        .select('receipt_url')
        .eq('id', expenseId)
        .single();

      // Delete receipt from storage if exists
      if (expense?.receipt_url) {
        const filePath = expense.receipt_url.split('/').slice(-2).join('/');
        await supabase.storage
          .from('expense-receipts')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('expense_claims')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims', employeeId] });
      toast.success('Ausgabe gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting expense:', error);
      toast.error('Fehler beim Löschen');
    },
  });

  // Statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'submitted').length;
  const approvedExpenses = expenses.filter(e => e.status === 'approved' || e.status === 'paid').length;

  return {
    expenses,
    isLoading,
    statistics: {
      total: totalExpenses,
      pending: pendingExpenses,
      approved: approvedExpenses,
    },
    createExpense: createExpense.mutateAsync,
    updateExpense: updateExpense.mutateAsync,
    submitExpense: submitExpense.mutateAsync,
    approveExpense: approveExpense.mutateAsync,
    rejectExpense: rejectExpense.mutateAsync,
    deleteExpense: deleteExpense.mutateAsync,
    isCreating: createExpense.isPending,
    isUpdating: updateExpense.isPending,
  };
};
