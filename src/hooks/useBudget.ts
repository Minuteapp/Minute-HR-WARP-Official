
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '@/services/budgetService';
import { useToast } from '@/hooks/use-toast';
import type { BudgetPlan, CreateBudgetPlanRequest } from '@/types/budget';

export const useBudgetPlans = () => {
  return useQuery({
    queryKey: ['budget-plans'],
    queryFn: () => budgetService.getBudgetPlans(),
  });
};

export const useCreateBudgetPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: CreateBudgetPlanRequest) =>
      budgetService.createBudgetPlan(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-plans'] });
      toast({
        title: "Budget erstellt",
        description: "Das Budget wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Budget konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBudgetPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BudgetPlan> }) =>
      budgetService.updateBudgetPlan(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-plans'] });
      toast({
        title: "Budget aktualisiert",
        description: "Das Budget wurde erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Budget konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBudgetPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => budgetService.deleteBudgetPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-plans'] });
      toast({
        title: "Budget gelöscht",
        description: "Das Budget wurde erfolgreich gelöscht.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Budget konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });
};
