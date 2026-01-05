
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchExpenses, 
  fetchExpenseById, 
  createExpense, 
  updateExpense,
  deleteExpense,
  submitExpense,
  approveExpense,
  rejectExpense,
  addAttachment,
  addComment,
  fetchBudgets,
  fetchCostCenters,
  validateExpenseAgainstPolicy,
  getExpenseSummary
} from '@/services/expenseService';
import { 
  ExpenseItem, 
  ExpenseFilter, 
  Budget, 
  CostCenter, 
  ExpenseSummary 
} from '@/types/expenses';

export const useExpenses = (initialFilter?: ExpenseFilter) => {
  const [filter, setFilter] = useState<ExpenseFilter>(initialFilter || {});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Abfrage aller Ausgaben mit Filter
  const { 
    data: expenses,
    isLoading: isLoadingExpenses,
    error: expensesError,
    refetch: refetchExpenses
  } = useQuery({
    queryKey: ['expenses', filter],
    queryFn: () => fetchExpenses(filter)
  });

  // Abfrage einer einzelnen Ausgabe
  const getExpense = useCallback((id: string) => {
    return queryClient.fetchQuery({
      queryKey: ['expense', id],
      queryFn: () => fetchExpenseById(id)
    });
  }, [queryClient]);

  // Abfrage der Budgets
  const { 
    data: budgets,
    isLoading: isLoadingBudgets
  } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => fetchBudgets()
  });

  // Abfrage der Kostenstellen
  const { 
    data: costCenters,
    isLoading: isLoadingCostCenters
  } = useQuery({
    queryKey: ['costCenters'],
    queryFn: () => fetchCostCenters()
  });

  // Abfrage der Ausgabenzusammenfassung
  const { 
    data: summary,
    isLoading: isLoadingSummary
  } = useQuery({
    queryKey: ['expenseSummary', filter.dateFrom, filter.dateTo],
    queryFn: () => getExpenseSummary(undefined, filter.dateFrom, filter.dateTo)
  });

  // Mutation für Erstellung einer neuen Ausgabe
  const createExpenseMutation = useMutation({
    mutationFn: (newExpense: Omit<ExpenseItem, 'id' | 'created_at' | 'updated_at'>) => 
      createExpense(newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      toast({
        title: "Ausgabe erstellt",
        description: "Die Ausgabe wurde erfolgreich erstellt."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler beim Erstellen",
        description: `Die Ausgabe konnte nicht erstellt werden: ${error.message}`
      });
    }
  });

  // Mutation für Aktualisierung einer Ausgabe
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExpenseItem> }) => 
      updateExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      toast({
        title: "Ausgabe aktualisiert",
        description: "Die Ausgabe wurde erfolgreich aktualisiert."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler beim Aktualisieren",
        description: `Die Ausgabe konnte nicht aktualisiert werden: ${error.message}`
      });
    }
  });

  // Mutation für Löschen einer Ausgabe
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      toast({
        title: "Ausgabe gelöscht",
        description: "Die Ausgabe wurde erfolgreich gelöscht."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler beim Löschen",
        description: `Die Ausgabe konnte nicht gelöscht werden: ${error.message}`
      });
    }
  });

  // Mutation für Einreichen einer Ausgabe
  const submitExpenseMutation = useMutation({
    mutationFn: (id: string) => submitExpense(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      toast({
        title: "Ausgabe eingereicht",
        description: "Die Ausgabe wurde erfolgreich zur Genehmigung eingereicht."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler beim Einreichen",
        description: `Die Ausgabe konnte nicht eingereicht werden: ${error.message}`
      });
    }
  });

  // Mutation für Genehmigung einer Ausgabe
  const approveExpenseMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => 
      approveExpense(id, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      toast({
        title: "Ausgabe genehmigt",
        description: "Die Ausgabe wurde erfolgreich genehmigt."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler bei der Genehmigung",
        description: `Die Ausgabe konnte nicht genehmigt werden: ${error.message}`
      });
    }
  });

  // Mutation für Ablehnung einer Ausgabe
  const rejectExpenseMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => 
      rejectExpense(id, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      toast({
        title: "Ausgabe abgelehnt",
        description: "Die Ausgabe wurde abgelehnt."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler bei der Ablehnung",
        description: `Die Ausgabe konnte nicht abgelehnt werden: ${error.message}`
      });
    }
  });

  // Mutation für Hinzufügen eines Anhangs
  const addAttachmentMutation = useMutation({
    mutationFn: ({ expenseId, file }: { expenseId: string; file: File }) => 
      addAttachment(expenseId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expense', variables.expenseId] });
      toast({
        title: "Beleg hinzugefügt",
        description: "Der Beleg wurde erfolgreich hochgeladen."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler beim Hochladen",
        description: `Der Beleg konnte nicht hochgeladen werden: ${error.message}`
      });
    }
  });

  // Mutation für Hinzufügen eines Kommentars
  const addCommentMutation = useMutation({
    mutationFn: ({ expenseId, comment, isInternal }: { expenseId: string; comment: string; isInternal?: boolean }) => 
      addComment(expenseId, comment, isInternal),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expense', variables.expenseId] });
      toast({
        title: "Kommentar hinzugefügt",
        description: "Der Kommentar wurde erfolgreich hinzugefügt."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler beim Hinzufügen des Kommentars",
        description: `Der Kommentar konnte nicht hinzugefügt werden: ${error.message}`
      });
    }
  });

  // Validierung einer Ausgabe gegen Unternehmensrichtlinien
  const validateExpense = useCallback(async (expense: Partial<ExpenseItem>) => {
    return validateExpenseAgainstPolicy(expense);
  }, []);

  return {
    // Daten
    expenses,
    budgets,
    costCenters,
    summary,
    
    // Lade-Status
    isLoading: isLoadingExpenses || isLoadingBudgets || isLoadingCostCenters || isLoadingSummary,
    error: expensesError,
    
    // Filter
    filter,
    setFilter,
    
    // Aktionen
    getExpense,
    createExpense: createExpenseMutation.mutate,
    updateExpense: updateExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
    submitExpense: submitExpenseMutation.mutate,
    approveExpense: approveExpenseMutation.mutate,
    rejectExpense: rejectExpenseMutation.mutate,
    addAttachment: addAttachmentMutation.mutate,
    addComment: addCommentMutation.mutate,
    validateExpense,
    refetchExpenses
  };
};
