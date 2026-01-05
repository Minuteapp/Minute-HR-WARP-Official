
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExpenseFormData } from '@/types/business-travel';
import { toast } from 'sonner';
import { 
  fetchExpenses,
  createExpense 
} from '@/services/business-travel/expenseService';

export const useExpenseManagement = (tripId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['business-trip-expenses', tripId],
    queryFn: () => fetchExpenses(tripId),
    enabled: !!tripId
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => createExpense(tripId, data),
    onSuccess: () => {
      toast.success('Ausgabe wurde erfolgreich hinzugefügt');
      queryClient.invalidateQueries({ queryKey: ['business-trip-expenses', tripId] });
    },
    onError: (error: any) => {
      console.error('Fehler beim Erstellen der Ausgabe:', error);
      toast.error('Fehler beim Erstellen der Ausgabe');
    }
  });

  const addExpense = async (data: ExpenseFormData) => {
    try {
      setIsSubmitting(true);
      await createExpenseMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    expenses,
    isLoadingExpenses,
    isSubmitting,
    addExpense
  };
};
